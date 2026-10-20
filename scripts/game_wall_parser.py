"""game_wall_parser.py

Parsing utilities for GitHub issue registrations and board files
used by the Git Tic-Tac-Toe Game Wall.
"""

from __future__ import annotations

import re
import json
from typing import Any, Dict, Optional, Tuple
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import urlopen
from pathlib import Path

from validate_board import validate_board, BoardValidationResult


def extract_repo_info(url_or_text: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """Extracts (owner, repo, clean_url) from a text containing a GitHub repository URL.

    Handles:
    - https://github.com/owner/repo
    - https://github.com/owner/repo.git
    - https://github.com/owner/repo/
    - Markdown links [text](https://github.com/owner/repo)
    - URLs with trailing whitespace or query/hash
    """
    pattern = r"https?://github\.com/([a-zA-Z0-9_\-\.]+)/([a-zA-Z0-9_\-\.]+)"
    match = re.search(pattern, url_or_text)
    if not match:
        return None, None, None

    owner = match.group(1).strip()
    repo = match.group(2).strip()

    # Clean repo name (remove .git suffix or trailing slash)
    if repo.endswith(".git"):
        repo = repo[:-4]
    repo = repo.rstrip("/")

    clean_url = f"https://github.com/{owner}/{repo}"
    return owner, repo, clean_url


WORKSHOP_CATALOG_PATH = Path(__file__).resolve().parent.parent / "docs" / "workshops.json"


def load_workshop_catalog(path: Path = WORKSHOP_CATALOG_PATH) -> Dict[str, Any]:
    """Load and validate the static workshop catalog used by issue ingestion."""
    with path.open(encoding="utf-8") as source:
        catalog = json.load(source)
    workshops = catalog.get("workshops")
    if not isinstance(workshops, list):
        raise ValueError("Workshop catalog must contain a workshops list.")
    ids = [item.get("id") for item in workshops if isinstance(item, dict)]
    if len(ids) != len(workshops) or any(not isinstance(value, str) or not value for value in ids):
        raise ValueError("Every configured workshop must have a non-empty string id.")
    if len(ids) != len(set(ids)):
        raise ValueError("Workshop IDs must be unique.")
    if catalog.get("defaultWorkshopId") not in ids:
        raise ValueError("defaultWorkshopId must identify a configured workshop.")
    return catalog


def _field(body: str, label_pattern: str) -> Optional[str]:
    match = re.search(rf"###\s*(?:{label_pattern})\s*\n+([^\n#]+)", body, re.IGNORECASE)
    if not match:
        return None
    value = match.group(1).strip()
    return None if not value or value == "_No response_" else value


def parse_registration_issue(
    body: str,
    title: str = "",
    workshop_catalog: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Parse a repository-level registration and validate its workshop and players.

    Legacy issues are identified separately so the synchronizer can preserve migrated
    records without treating their old branch-level fields as new registrations.
    """
    catalog = workshop_catalog or load_workshop_catalog()
    workshops = {item["id"]: item for item in catalog["workshops"]}
    result: Dict[str, Any] = {
        "repo_url": None,
        "owner": None,
        "repo": None,
        "player_x": None,
        "player_o": None,
        "workshop_id": None,
        "workshop_name": None,
        "legacy_workshop_name": None,
        "legacy_branch": None,
        "is_legacy": False,
        "is_valid": False,
        "error": None,
    }

    if not body and not title:
        result["error"] = "Empty issue body and title"
        return result

    # 1. Search for Repository URL
    # Look for form field header first: ### Repository URL\s+(value)
    repo_url_match = re.search(
        r"###\s*Repository\s*URL\s*\n+([^\n#]+)",
        body,
        re.IGNORECASE,
    )
    candidate_repo_text = repo_url_match.group(1).strip() if repo_url_match else body

    owner, repo, clean_url = extract_repo_info(candidate_repo_text)
    # If not found in candidate section, search whole body then title
    if not owner or not repo:
        owner, repo, clean_url = extract_repo_info(body)
    if not owner or not repo:
        owner, repo, clean_url = extract_repo_info(title)

    if not owner or not repo or not clean_url:
        result["error"] = "No valid GitHub repository URL found"
        return result

    result["owner"] = owner
    result["repo"] = repo
    result["repo_url"] = clean_url

    result["legacy_branch"] = _field(body, r"Match\s*Branch")
    result["player_x"] = _field(body, r"Player\s*X(?:\s*Handle)?")
    result["player_o"] = _field(body, r"Player\s*O(?:\s*Handle)?")
    result["player_x"] = re.sub(r"^[@]+", "", result["player_x"]).strip() if result["player_x"] else None
    result["player_o"] = re.sub(r"^[@]+", "", result["player_o"]).strip() if result["player_o"] else None
    result["workshop_id"] = _field(body, r"Workshop\s*ID")
    result["legacy_workshop_name"] = _field(
        body, r"Workshop\s*Name|Event\s*ID(?:\s*/\s*Session\s*Name)?|Session\s*Name"
    )
    # Old issue forms were branch registrations. They are retained as migration
    # provenance but never interpreted as individual dashboard matches.
    result["is_legacy"] = bool(result["legacy_branch"] or result["legacy_workshop_name"])
    if result["workshop_id"] in workshops:
        result["workshop_name"] = workshops[result["workshop_id"]].get("name")

    errors = []
    if not result["workshop_id"]:
        errors.append("Missing Workshop ID. Use a workshop-specific registration link.")
    elif result["workshop_id"] not in workshops:
        errors.append(f"Unknown Workshop ID '{result['workshop_id']}'. Choose a configured workshop.")
    if not result["player_x"]:
        errors.append("Missing Player X handle.")
    if not result["player_o"]:
        errors.append("Missing Player O handle.")
    result["is_valid"] = not errors
    result["error"] = "; ".join(errors) or None
    return result


def evaluate_game_board(board_content: str) -> Dict[str, Any]:
    """Validates and evaluates board content using the workshop canonical validator.

    Returns structured dictionary with state, grid, players, counts, and errors.
    """
    validation: BoardValidationResult = validate_board(board_content)
    return {
        "is_valid": validation.is_valid,
        "state": validation.state,
        "declared_state": validation.declared_state,
        "player_x": validation.player_x,
        "player_o": validation.player_o,
        "grid": validation.grid,
        "move_counts": validation.move_counts,
        "errors": validation.errors,
        "warnings": validation.warnings,
    }


def fetch_registered_board(owner: str, repo: str, branch: str, timeout: int = 15) -> str:
    """Fetch exactly ``BOARD.txt`` from the registered branch of a public repo.

    No default-branch, legacy filename, or alternate-ref fallback is attempted.
    """
    if not branch.startswith("match"):
        raise ValueError("Match branch must start with the literal lowercase prefix 'match'.")
    url = (
        "https://raw.githubusercontent.com/"
        f"{quote(owner, safe='')}/{quote(repo, safe='')}/"
        f"{quote(branch, safe='')}/BOARD.txt"
    )
    try:
        with urlopen(url, timeout=timeout) as response:
            return response.read().decode("utf-8")
    except HTTPError as error:
        if error.code == 404:
            detail = "the branch or BOARD.txt is missing, or the repository is private"
        else:
            detail = f"GitHub returned HTTP {error.code}"
        raise RuntimeError(f"Could not read BOARD.txt from branch '{branch}': {detail}.") from error
    except (URLError, TimeoutError, UnicodeDecodeError) as error:
        raise RuntimeError(f"Could not read BOARD.txt from branch '{branch}': {error}.") from error


def evaluate_registered_board(owner: str, repo: str, branch: str) -> Dict[str, Any]:
    """Fetch and validate a registered branch board, returning explicit errors."""
    try:
        content = fetch_registered_board(owner, repo, branch)
    except RuntimeError as error:
        return {
            "is_valid": False,
            "status": "error",
            "state": "Error",
            "failureKind": "transport",
            "errors": [str(error)],
        }
    except ValueError as error:
        return {
            "is_valid": False,
            "status": "error",
            "state": "Error",
            "failureKind": "invalid_branch",
            "errors": [str(error)],
        }

    evaluation = evaluate_game_board(content)
    if not evaluation["is_valid"]:
        return {
            **evaluation,
            "status": "error",
            "failureKind": "invalid_board",
            "errors": [f"Invalid BOARD.txt: {error}" for error in evaluation["errors"]],
        }
    state = evaluation["state"]
    completed = state in {"X won", "O won", "Draw"}
    return {**evaluation, "status": "completed" if completed else "in_progress", "failureKind": None, "errors": []}

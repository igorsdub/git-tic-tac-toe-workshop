"""game_wall_parser.py

Parsing utilities for GitHub issue registrations and board files
used by the Git Tic-Tac-Toe Game Wall.
"""

from __future__ import annotations

import re
from typing import Any, Dict, Optional, Tuple

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


def parse_registration_issue(body: str, title: str = "") -> Dict[str, Any]:
    """Parses a game-registration issue body and title.

    Supports both GitHub Issue Form markdown output:
    ### Repository URL
    https://github.com/owner/repo

    ### Player X Handle
    @alice

    ### Player O Handle
    @bob

    ### Event ID / Session Name
    Session-1

    And freeform/markdown issue descriptions.
    """
    result: Dict[str, Any] = {
        "repo_url": None,
        "owner": None,
        "repo": None,
        "player_x": None,
        "player_o": None,
        "event_id": "Default Event",
        "workshop_name": "Default Event",
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

    # 2. Extract Player X
    x_match = re.search(
        r"###\s*Player\s*X(?:\s*Handle)?\s*\n+([^\n#]+)",
        body,
        re.IGNORECASE,
    )
    if x_match:
        x_val = x_match.group(1).strip()
        x_val = re.sub(r"^[@]+", "", x_val).strip()
        if x_val and x_val != "_No response_":
            result["player_x"] = x_val

    # 3. Extract Player O
    o_match = re.search(
        r"###\s*Player\s*O(?:\s*Handle)?\s*\n+([^\n#]+)",
        body,
        re.IGNORECASE,
    )
    if o_match:
        o_val = o_match.group(1).strip()
        o_val = re.sub(r"^[@]+", "", o_val).strip()
        if o_val and o_val != "_No response_":
            result["player_o"] = o_val

    # 4. Extract Event ID / Workshop Name
    event_match = re.search(
        r"###\s*(?:Workshop\s*Name|Event\s*ID|Session\s*Name|Event\s*ID\s*/\s*Session\s*Name)\s*\n+([^\n#]+)",
        body,
        re.IGNORECASE,
    )
    if event_match:
        event_val = event_match.group(1).strip()
        if event_val and event_val != "_No response_":
            result["event_id"] = event_val
            result["workshop_name"] = event_val

    result["is_valid"] = True
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

#!/usr/bin/env python3
"""Fetch registration issues and build the branch-aware public match registry."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Callable

SCRIPTS_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS_DIR))

from game_wall_parser import evaluate_registered_board, parse_registration_issue


def build_registry_records(
    issues: list[dict[str, Any]],
    board_evaluator: Callable[[str, str, str], dict[str, Any]] = evaluate_registered_board,
) -> list[dict[str, Any]]:
    """Turn registration issues into one record per (repository, branch).

    Old repository-only registrations stay visible as explicit migration errors;
    they are never treated as valid matches or mapped to a default branch.
    """
    records = []
    seen: set[tuple[str, str, str]] = set()

    for issue in issues:
        parsed = parse_registration_issue(issue.get("body", ""), issue.get("title", ""))
        owner = parsed.get("owner")
        repo = parsed.get("repo")
        branch = parsed.get("branch")

        if owner and repo and branch:
            key = (owner.casefold(), repo.casefold(), branch)
            if key in seen:
                continue
            seen.add(key)
            if parsed.get("is_valid"):
                board = board_evaluator(owner, repo, branch)
            else:
                board = {
                    "is_valid": False,
                    "status": "error",
                    "state": "Error",
                    "errors": [parsed.get("error") or "Registration is invalid."],
                }
        else:
            board = {
                "is_valid": False,
                "status": "error",
                "state": "Error",
                "errors": [parsed.get("error") or "Registration is missing a repository, branch, or player handle."],
            }

        state = board.get("state")
        records.append(
            {
                "issueNumber": issue.get("number"),
                "issueUrl": issue.get("url"),
                "owner": owner,
                "repo": repo,
                "repoUrl": parsed.get("repo_url"),
                "branch": branch,
                "matchKey": f"{owner}/{repo}#{branch}" if owner and repo and branch else None,
                "playerX": parsed.get("player_x"),
                "playerO": parsed.get("player_o"),
                "workshopName": parsed.get("workshop_name", "Default Event"),
                "eventId": parsed.get("event_id", "Default Event"),
                "status": board.get("status", "error"),
                "state": state,
                "outcome": state if state in {"X won", "O won", "Draw"} else None,
                "boardValid": bool(board.get("is_valid")),
                "board": board.get("grid"),
                "errors": board.get("errors", []),
            }
        )
    return records


def main() -> None:
    workshop_repo = "igorsdub/git-tic-tac-toe-workshop"
    cmd = [
        "gh",
        "issue",
        "list",
        "--repo",
        workshop_repo,
        "--state",
        "all",
        "--json",
        "number,title,body,url,labels,state",
        "--limit",
        "200",
    ]

    try:
        output = subprocess.check_output(cmd, text=True)
        issues = json.loads(output)
    except Exception as error:
        print(f"Error fetching issues via gh CLI: {error}", file=sys.stderr)
        sys.exit(1)

    registration_issues = [
        issue
        for issue in issues
        if "game-registration" in {label.get("name", "") for label in issue.get("labels", [])}
    ]
    records = build_registry_records(registration_issues)

    board_json_path = SCRIPTS_DIR.parent / "docs" / "board.json"
    board_json_path.parent.mkdir(parents=True, exist_ok=True)
    with open(board_json_path, "w", encoding="utf-8") as output_file:
        json.dump(records, output_file, indent=2)
        output_file.write("\n")

    errors = sum(record["status"] == "error" for record in records)
    print(
        f"Synced {len(records)} matches ({errors} registration or board errors) to {board_json_path}"
    )


if __name__ == "__main__":
    main()

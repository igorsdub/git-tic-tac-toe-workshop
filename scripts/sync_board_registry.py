#!/usr/bin/env python3
"""sync_board_registry.py

Fetches all registration issues from GitHub repository using `gh issue list`,
parses them using game_wall_parser.py, and updates docs/board.json.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

# Add scripts directory to sys.path
SCRIPTS_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS_DIR))

from game_wall_parser import parse_registration_issue


def main() -> None:
    repo = "igorsdub/git-tic-tac-toe-workshop"
    cmd = [
        "gh",
        "issue",
        "list",
        "--repo",
        repo,
        "--state",
        "all",
        "--json",
        "number,title,body,labels,state",
        "--limit",
        "200",
    ]

    try:
        output = subprocess.check_output(cmd, text=True)
        issues = json.loads(output)
    except Exception as e:
        print(f"Error fetching issues via gh CLI: {e}", file=sys.stderr)
        sys.exit(1)

    registrations = []
    seen = set()

    for issue in issues:
        labels = [l.get("name", "") for l in issue.get("labels", [])]
        title = issue.get("title", "")
        body = issue.get("body", "")

        is_registration = "game-registration" in labels or "[game registration]" in title.lower()
        if not is_registration:
            continue

        parsed = parse_registration_issue(body, title)
        if parsed.get("is_valid") and parsed.get("owner") and parsed.get("repo"):
            owner = parsed["owner"]
            repo_name = parsed["repo"]
            key = (owner.lower(), repo_name.lower())
            if key not in seen:
                seen.add(key)
                registrations.append(
                    {
                        "owner": owner,
                        "repo": repo_name,
                        "repoUrl": parsed["repo_url"],
                        "playerX": parsed.get("player_x"),
                        "playerO": parsed.get("player_o"),
                        "workshopName": parsed.get("workshop_name", "SCDA Training Week"),
                        "eventId": parsed.get("event_id", parsed.get("workshop_name", "SCDA Training Week")),
                    }
                )

    board_json_path = SCRIPTS_DIR.parent / "docs" / "board.json"
    board_json_path.parent.mkdir(parents=True, exist_ok=True)

    with open(board_json_path, "w", encoding="utf-8") as f:
        json.dump(registrations, f, indent=2)
        f.write("\n")

    print(f"Successfully synced {len(registrations)} registrations to {board_json_path}")


if __name__ == "__main__":
    main()

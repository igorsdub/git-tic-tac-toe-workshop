#!/usr/bin/env python3
"""Sync repository registrations and their discovered match branches."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Callable

SCRIPTS_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPTS_DIR.parent
sys.path.insert(0, str(SCRIPTS_DIR))

from game_wall_parser import (  # noqa: E402
    evaluate_registered_board,
    load_workshop_catalog,
    parse_registration_issue,
)

REPOSITORY = "igorsdub/git-tic-tac-toe-workshop"
FEEDBACK_MARKER = "<!-- game-wall-registration-feedback -->"


def _repo_key(owner: str, repo: str) -> tuple[str, str]:
    return owner.casefold(), repo.casefold()


def _issue_order(issue: dict[str, Any]) -> tuple[str, int]:
    created = str(issue.get("createdAt") or issue.get("created_at") or "")
    try:
        number = int(issue.get("number") or 0)
    except (TypeError, ValueError):
        number = 0
    return created, number


def _display_name(catalog: dict[str, Any], workshop_id: str) -> str:
    return next((w.get("name", workshop_id) for w in catalog["workshops"] if w["id"] == workshop_id), workshop_id)


def build_registration_state(
    issues: list[dict[str, Any]],
    existing: list[dict[str, Any]],
    catalog: dict[str, Any],
) -> tuple[list[dict[str, Any]], dict[int, str]]:
    """Apply validated issue registrations to one registration per repository.

    Earliest valid issue claims an unowned repository. For equal issue timestamps,
    lower issue number wins that initial claim. After ownership is established,
    the latest-created valid same-workshop issue supplies player handles.
    """
    registrations = [dict(record) for record in existing]
    by_repo = {_repo_key(r["owner"], r["repo"]): r for r in registrations}
    feedback: dict[int, str] = {}
    known_workshops = {w["id"] for w in catalog["workshops"]}

    for issue in sorted(issues, key=_issue_order):
        number = issue.get("number")
        try:
            issue_number = int(number)
        except (TypeError, ValueError):
            issue_number = None
        parsed = parse_registration_issue(issue.get("body", ""), issue.get("title", ""), catalog)
        owner, repo = parsed.get("owner"), parsed.get("repo")
        key = _repo_key(owner, repo) if owner and repo else None
        current = by_repo.get(key) if key else None

        # Old SCDA issue-form submissions are migration provenance. The five
        # pre-seeded repository rows remain authoritative; old branch-level issues
        # are acknowledged but do not override the migrated player handles.
        if (
            parsed.get("is_legacy")
            and not parsed.get("workshop_id")
            and current
            and current.get("workshopId") == "2026-10-01-scda"
            and current.get("migrationSource") == "SCDA Training Week legacy entry"
            and parsed.get("legacy_workshop_name") in {None, _display_name(catalog, "2026-10-01-scda")}
        ):
            message = "Accepted as a legacy SCDA registration; this repository was migrated to workshop 2026-10-01-scda."
            if issue_number is not None:
                feedback[issue_number] = message
            continue

        if not parsed.get("is_valid"):
            message = parsed.get("error") or "Registration rejected: required information is missing."
        elif key is None:
            message = "Registration rejected: no valid GitHub repository URL was found."
        elif parsed["workshop_id"] not in known_workshops:
            message = parsed.get("error") or "Registration rejected: unknown workshop ID."
        else:
            workshop_id = parsed["workshop_id"]
            if current and current.get("workshopId") != workshop_id:
                message = (
                    f"Registration rejected: this repository is already assigned to workshop "
                    f"{current.get('workshopId')} and can belong to only one workshop."
                )
            else:
                status = next(w["status"] for w in catalog["workshops"] if w["id"] == workshop_id)
                if not current and status == "archived":
                    message = "Registration rejected: archived workshops do not accept new repositories."
                else:
                    if current is None:
                        current = {
                            "workshopId": workshop_id,
                            "owner": owner,
                            "repo": repo,
                            "repoUrl": parsed["repo_url"],
                            "playerX": parsed["player_x"],
                            "playerO": parsed["player_o"],
                            "issueNumber": issue_number,
                            "issueUrl": issue.get("url"),
                            "createdAt": _issue_order(issue)[0],
                        }
                        registrations.append(current)
                        by_repo[key] = current
                    else:
                        current.update(
                            {
                                "repoUrl": parsed["repo_url"],
                                "playerX": parsed["player_x"],
                                "playerO": parsed["player_o"],
                                "issueNumber": issue_number,
                                "issueUrl": issue.get("url"),
                                "createdAt": _issue_order(issue)[0],
                            }
                        )
                    message = f"Registration accepted for workshop {workshop_id}. Matching `match*` branches appear after a successful refresh."

        if issue_number is not None:
            feedback[issue_number] = message

    registrations.sort(key=lambda r: (r.get("workshopId", ""), r.get("owner", "").casefold(), r.get("repo", "").casefold()))
    return registrations, feedback


def _record_from_board(
    registration: dict[str, Any],
    branch: str,
    board: dict[str, Any],
    workshop_name: str,
) -> dict[str, Any]:
    owner, repo = registration["owner"], registration["repo"]
    state = board.get("state")
    return {
        "workshopId": registration["workshopId"],
        "workshopName": workshop_name,
        "eventId": registration["workshopId"],
        "owner": owner,
        "repo": repo,
        "repoUrl": registration["repoUrl"],
        "playerX": registration["playerX"],
        "playerO": registration["playerO"],
        "branch": branch,
        "matchKey": f"{owner}/{repo}#{branch}",
        "status": board.get("status", "error"),
        "state": state,
        "outcome": state if state in {"X won", "O won", "Draw"} else None,
        "boardValid": bool(board.get("is_valid")),
        "board": board.get("grid"),
        "errors": board.get("errors", []),
        "failureKind": board.get("failureKind"),
        "refreshStatus": "fresh" if board.get("failureKind") != "transport" else "error",
    }


def build_match_snapshot(
    registrations: list[dict[str, Any]],
    previous: list[dict[str, Any]],
    catalog: dict[str, Any],
    branch_lister: Callable[[str, str], list[str]],
    board_evaluator: Callable[[str, str, str], dict[str, Any]] = evaluate_registered_board,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Discover match-prefixed branches and preserve cards on transient failures."""
    prior_by_key = {item.get("matchKey"): item for item in previous if item.get("matchKey")}
    snapshot: list[dict[str, Any]] = []
    repository_status: list[dict[str, Any]] = []
    for registration in registrations:
        owner, repo = registration["owner"], registration["repo"]
        try:
            branches = branch_lister(owner, repo)
        except Exception as error:  # transient failure must not be interpreted as deletion
            retained = [
                dict(item, refreshStatus="stale", repositoryRefreshError=str(error))
                for item in previous
                if item.get("owner", "").casefold() == owner.casefold()
                and item.get("repo", "").casefold() == repo.casefold()
                and item.get("workshopId") == registration["workshopId"]
            ]
            snapshot.extend(retained)
            repository_status.append({"repoUrl": registration["repoUrl"], "status": "error", "error": str(error)})
            continue

        matching = sorted({name for name in branches if name.startswith("match")})
        repository_status.append({"repoUrl": registration["repoUrl"], "status": "success", "matchBranches": matching})
        workshop_name = _display_name(catalog, registration["workshopId"])
        for branch in matching:
            key = f"{owner}/{repo}#{branch}"
            try:
                board = board_evaluator(owner, repo, branch)
            except Exception as error:
                board = {"is_valid": False, "status": "error", "state": "Error",
                         "failureKind": "transport", "errors": [str(error)]}
            record = _record_from_board(registration, branch, board, workshop_name)
            if board.get("failureKind") == "transport" and key in prior_by_key:
                old = dict(prior_by_key[key])
                old.update({"workshopId": registration["workshopId"], "workshopName": workshop_name,
                            "repoUrl": registration["repoUrl"], "playerX": registration["playerX"],
                            "playerO": registration["playerO"], "branch": branch,
                            "refreshStatus": "stale", "boardRefreshError": "; ".join(board.get("errors", []))})
                record = old
            snapshot.append(record)

    snapshot.sort(key=lambda item: (item.get("workshopId", ""), item.get("owner", "").casefold(),
                                    item.get("repo", "").casefold(), item.get("branch", "")))
    return snapshot, repository_status


def list_repository_branches(owner: str, repo: str) -> list[str]:
    """Use GitHub CLI pagination; a nonzero exit means the listing was incomplete."""
    output = subprocess.check_output(
        ["gh", "api", "--paginate", "--jq", ".[] | .name | @json", f"repos/{owner}/{repo}/branches?per_page=100"],
        text=True,
    )
    # JSON-lines preserve unusual but valid branch characters, including quotes.
    try:
        names = [json.loads(line) for line in output.splitlines() if line.strip()]
    except json.JSONDecodeError as error:
        raise RuntimeError("GitHub returned an invalid branch listing.") from error
    if any(not isinstance(name, str) or not name for name in names):
        raise RuntimeError("GitHub returned an invalid branch listing.")
    return names


def fetch_registration_issues() -> list[dict[str, Any]]:
    cmd = ["gh", "issue", "list", "--repo", REPOSITORY, "--state", "all", "--json",
           "number,title,body,url,labels,state,createdAt", "--limit", "1000"]
    return json.loads(subprocess.check_output(cmd, text=True))


def update_issue_feedback(issue_number: int, message: str) -> None:
    """Create or update one marked bot comment for an issue, idempotently."""
    body = f"{FEEDBACK_MARKER}\n{message}"
    command = ["gh", "api", "--paginate", "--jq", ".[] | select(.user.login == \"github-actions[bot]\" and (.body | contains(\"game-wall-registration-feedback\"))) | [.id, .body] | @json",
               f"repos/{REPOSITORY}/issues/{issue_number}/comments?per_page=100"]
    output = subprocess.check_output(command, text=True)
    comments = [json.loads(line) for line in output.splitlines() if line.strip()]
    if comments:
        comment_id = comments[0][0]
        subprocess.check_call(["gh", "api", "--method", "PATCH", f"repos/{REPOSITORY}/issues/comments/{comment_id}", "-f", f"body={body}"])
    else:
        subprocess.check_call(["gh", "api", "--method", "POST", f"repos/{REPOSITORY}/issues/{issue_number}/comments", "-f", f"body={body}"])


def _read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    with path.open(encoding="utf-8") as source:
        return json.load(source)


def _write_json(path: Path, content: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(content, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    catalog = load_workshop_catalog()
    issues = fetch_registration_issues()
    registration_path = ROOT_DIR / "docs" / "registrations.json"
    existing_doc = _read_json(registration_path, {"registrations": []})
    existing = existing_doc.get("registrations", [])
    registration_issues = [
        issue for issue in issues
        if "game-registration" in {label.get("name", "") for label in issue.get("labels", [])}
    ]
    registrations, feedback = build_registration_state(registration_issues, existing, catalog)

    previous = _read_json(ROOT_DIR / "docs" / "board.json", [])
    snapshot, repository_status = build_match_snapshot(registrations, previous, catalog, list_repository_branches)
    for issue_number, message in feedback.items():
        update_issue_feedback(issue_number, message)

    _write_json(registration_path, {"registrations": registrations})
    _write_json(ROOT_DIR / "docs" / "board.json", snapshot)
    _write_json(ROOT_DIR / "docs" / "registry-status.json", {
        "repositories": repository_status,
    })
    errors = sum(item["status"] == "error" for item in repository_status)
    print(f"Synced {len(registrations)} repositories and {len(snapshot)} matches ({errors} repository refresh errors).")


if __name__ == "__main__":
    main()

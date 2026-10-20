from __future__ import annotations

import sys
import unittest
from pathlib import Path
from unittest.mock import patch

SCRIPTS_DIR = Path(__file__).resolve().parent.parent / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))

from game_wall_parser import load_workshop_catalog  # noqa: E402
from sync_board_registry import (  # noqa: E402
    FEEDBACK_MARKER,
    build_match_snapshot,
    build_registration_state,
    list_repository_branches,
    update_issue_feedback,
)


CATALOG = {
    "defaultWorkshopId": "2026-10-01-scda",
    "workshops": [
        {"id": "2026-10-01-scda", "name": "SCDA Training Week", "status": "active"},
        {"id": "2026-11-01-demo", "name": "Demo Week", "status": "active"},
        {"id": "2026-09-01-old", "name": "Old Week", "status": "archived"},
    ],
}


def registration(number: int, *, workshop: str = "2026-10-01-scda", repo_url: str = "https://github.com/Pair/Pair-Repo",
                 created: str = "2026-10-20T00:00:00Z", player_x: str = "alice", player_o: str = "bob") -> dict:
    return {
        "number": number,
        "url": f"https://github.com/igorsdub/git-tic-tac-toe-workshop/issues/{number}",
        "createdAt": created,
        "title": "[Game Registration]: pair repo",
        "body": f"""### Workshop ID

{workshop}

### Repository URL

{repo_url}

### Player X Handle

{player_x}

### Player O Handle

{player_o}
""",
    }


class TestRegistrationState(unittest.TestCase):
    def test_repeat_registration_uses_latest_created_issue_for_handles(self):
        issues = [
            registration(12, created="2026-10-19T00:00:00Z", player_x="older"),
            registration(8, created="2026-10-20T00:00:00Z", player_x="newer"),
        ]
        registrations, feedback = build_registration_state(issues, [], CATALOG)
        self.assertEqual(len(registrations), 1)
        self.assertEqual(registrations[0]["playerX"], "newer")
        self.assertEqual(registrations[0]["issueNumber"], 8)
        self.assertEqual(len(feedback), 2)
        self.assertIn("accepted", feedback[8].lower())

    def test_earliest_valid_cross_workshop_claim_owns_repository_and_tie_uses_issue_number(self):
        issues = [
            registration(20, workshop="2026-11-01-demo", created="2026-10-20T00:00:00Z"),
            registration(10, workshop="2026-10-01-scda", created="2026-10-20T00:00:00Z"),
        ]
        registrations, feedback = build_registration_state(issues, [], CATALOG)
        self.assertEqual(len(registrations), 1)
        self.assertEqual(registrations[0]["workshopId"], "2026-10-01-scda")
        self.assertIn("accepted", feedback[10].lower())
        self.assertIn("already assigned", feedback[20])

    def test_archived_workshop_allows_existing_update_and_rejects_new_repository(self):
        existing = [{
            "workshopId": "2026-09-01-old", "owner": "Pair", "repo": "Pair-Repo",
            "repoUrl": "https://github.com/Pair/Pair-Repo", "playerX": "old", "playerO": "bob",
        }]
        issues = [
            registration(1, workshop="2026-09-01-old", player_x="updated"),
            registration(2, workshop="2026-09-01-old", repo_url="https://github.com/Pair/New-Repo"),
        ]
        registrations, feedback = build_registration_state(issues, existing, CATALOG)
        self.assertEqual(len(registrations), 1)
        self.assertEqual(registrations[0]["playerX"], "updated")
        self.assertIn("accepted", feedback[1].lower())
        self.assertIn("archived", feedback[2])

    def test_missing_and_unknown_workshop_issues_are_rejected_without_claiming_repo(self):
        missing = registration(1)
        missing["body"] = missing["body"].replace("### Workshop ID\n\n2026-10-01-scda\n\n", "")
        unknown = registration(2, workshop="no-such-workshop")
        registrations, feedback = build_registration_state([missing, unknown], [], CATALOG)
        self.assertEqual(registrations, [])
        self.assertIn("Missing Workshop ID", feedback[1])
        self.assertIn("Unknown Workshop ID", feedback[2])

    def test_legacy_scda_branch_issue_is_acknowledged_without_overwriting_seed(self):
        legacy = registration(1)
        legacy["body"] = legacy["body"].replace("### Workshop ID\n\n2026-10-01-scda\n\n", "") + "\n### Match branch\n\nmatch-01\n\n### Workshop Name\n\nSCDA Training Week\n"
        existing = [{
            "workshopId": "2026-10-01-scda", "owner": "Pair", "repo": "Pair-Repo",
            "repoUrl": "https://github.com/Pair/Pair-Repo", "playerX": "seed", "playerO": "bob",
            "migrationSource": "SCDA Training Week legacy entry",
        }]
        registrations, feedback = build_registration_state([legacy], existing, CATALOG)
        self.assertEqual(registrations[0]["playerX"], "seed")
        self.assertIn("legacy SCDA", feedback[1])

    def test_missing_id_legacy_issue_is_not_exempt_without_migration_seed_marker(self):
        legacy = registration(1)
        legacy["body"] = legacy["body"].replace("### Workshop ID\n\n2026-10-01-scda\n\n", "") + "\n### Match branch\n\nmatch-01\n"
        existing = [{
            "workshopId": "2026-10-01-scda", "owner": "Pair", "repo": "Pair-Repo",
            "repoUrl": "https://github.com/Pair/Pair-Repo", "playerX": "old", "playerO": "bob",
        }]
        registrations, feedback = build_registration_state([legacy], existing, CATALOG)
        self.assertEqual(registrations[0]["playerX"], "old")
        self.assertIn("Missing Workshop ID", feedback[1])


class TestMatchSnapshot(unittest.TestCase):
    def setUp(self):
        self.registration = {
            "workshopId": "2026-10-01-scda", "owner": "Pair", "repo": "Pair-Repo",
            "repoUrl": "https://github.com/Pair/Pair-Repo", "playerX": "alice", "playerO": "bob",
        }
        self.old = {
            "workshopId": "2026-10-01-scda", "owner": "Pair", "repo": "Pair-Repo",
            "repoUrl": "https://github.com/Pair/Pair-Repo", "playerX": "alice", "playerO": "bob",
            "branch": "match-01", "matchKey": "Pair/Pair-Repo#match-01", "status": "in_progress",
            "state": "Ready for X", "boardValid": True, "board": [[" "]], "errors": [],
        }

    def test_discovers_all_lowercase_match_prefix_names_and_reads_each_branch(self):
        calls = []

        def evaluate(owner, repo, branch):
            calls.append(branch)
            return {"is_valid": True, "status": "in_progress", "state": "Ready for X", "grid": [[branch]], "errors": []}

        branches = ["match01", "match-01", "match02", "match-test", "match", "main", "Match03", "feature/match04"]
        snapshot, status = build_match_snapshot([self.registration], [], CATALOG, lambda *_: branches, evaluate)
        self.assertEqual([row["branch"] for row in snapshot], ["match", "match-01", "match-test", "match01", "match02"])
        self.assertEqual(calls, [row["branch"] for row in snapshot])
        self.assertTrue(all(row["workshopId"] == "2026-10-01-scda" for row in snapshot))
        self.assertEqual(status[0]["status"], "success")

    def test_successful_listing_removes_a_deleted_match_branch(self):
        snapshot, _ = build_match_snapshot(
            [self.registration], [self.old], CATALOG, lambda *_: ["main"], lambda *_: self.fail("no matches remain")
        )
        self.assertEqual(snapshot, [])

    def test_repository_listing_failure_retains_last_known_entries(self):
        snapshot, status = build_match_snapshot(
            [self.registration], [self.old], CATALOG,
            lambda *_: (_ for _ in ()).throw(RuntimeError("temporary API failure")),
        )
        self.assertEqual(len(snapshot), 1)
        self.assertEqual(snapshot[0]["matchKey"], self.old["matchKey"])
        self.assertIn("temporary API failure", snapshot[0]["repositoryRefreshError"])
        self.assertEqual(status[0]["status"], "error")
        self.assertEqual(snapshot[0]["refreshStatus"], "stale")

    def test_board_fetch_failure_keeps_existing_card_and_reports_warning(self):
        snapshot, _ = build_match_snapshot(
            [self.registration], [self.old], CATALOG, lambda *_: ["match-01"],
            lambda *_: {"is_valid": False, "status": "error", "state": "Error", "failureKind": "transport", "errors": ["read failed"]},
        )
        self.assertEqual(snapshot[0]["board"], self.old["board"])
        self.assertEqual(snapshot[0]["state"], self.old["state"])
        self.assertIn("read failed", snapshot[0]["boardRefreshError"])
        self.assertEqual(snapshot[0]["refreshStatus"], "stale")

    def test_successful_fetch_of_invalid_board_replaces_old_good_card(self):
        snapshot, _ = build_match_snapshot(
            [self.registration], [self.old], CATALOG, lambda *_: ["match-01"],
            lambda *_: {"is_valid": False, "status": "error", "state": "Invalid board",
                        "failureKind": "invalid_board", "grid": None,
                        "errors": ["Invalid BOARD.txt: bad grid"]},
        )
        self.assertEqual(snapshot[0]["status"], "error")
        self.assertFalse(snapshot[0]["boardValid"])
        self.assertIsNone(snapshot[0]["board"])
        self.assertEqual(snapshot[0]["refreshStatus"], "fresh")
        self.assertIn("Invalid BOARD.txt", snapshot[0]["errors"][0])


class TestGitHubRefreshHelpers(unittest.TestCase):
    def test_branch_listing_uses_paginated_github_api(self):
        with patch("sync_board_registry.subprocess.check_output", return_value='"match01"\n"match\\\"odd"\n"main"\n') as command:
            self.assertEqual(list_repository_branches("Pair", "Repo"), ["match01", 'match"odd', "main"])
            args = command.call_args.args[0]
            self.assertIn("--paginate", args)
            self.assertIn(".[] | .name | @json", args)
            self.assertIn("repos/Pair/Repo/branches?per_page=100", args)

    def test_feedback_updates_existing_marked_bot_comment(self):
        from sync_board_registry import update_issue_feedback

        existing = '[456, "' + FEEDBACK_MARKER + '\\nprevious"]\n'
        with patch("sync_board_registry.subprocess.check_output", return_value=existing), patch(
            "sync_board_registry.subprocess.check_call"
        ) as call:
            update_issue_feedback(17, "Registration accepted.")
        args = call.call_args.args[0]
        self.assertIn("PATCH", args)
        self.assertIn("456", args)
        self.assertTrue(any(arg.startswith("body=") and FEEDBACK_MARKER in arg for arg in args))

    def test_feedback_ignores_human_comment_that_copies_marker(self):
        from json import dumps

        source_comments = [
            {"id": 123, "body": FEEDBACK_MARKER, "user": {"login": "learner"}},
            {"id": 789, "body": FEEDBACK_MARKER + "\\nold", "user": {"login": "github-actions[bot]"}},
        ]

        def fake_gh_query(command, text):
            self.assertIn('github-actions[bot]', command)
            matching = [
                [comment["id"], comment["body"]]
                for comment in source_comments
                if comment["user"]["login"] == "github-actions[bot]"
                and FEEDBACK_MARKER in comment["body"]
            ]
            return "".join(dumps(comment) + "\n" for comment in matching)

        with patch("sync_board_registry.subprocess.check_output", side_effect=fake_gh_query) as lookup, patch(
            "sync_board_registry.subprocess.check_call"
        ) as call:
            update_issue_feedback(17, "Registration rejected.")
        jq = lookup.call_args.args[0]
        self.assertIn('github-actions[bot]', jq)
        self.assertIn("789", call.call_args.args[0])


if __name__ == "__main__":
    unittest.main()

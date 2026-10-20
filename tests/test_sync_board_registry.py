from __future__ import annotations

import sys
import unittest
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent.parent / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))

from sync_board_registry import build_registry_records  # noqa: E402


def registration(branch: str, number: int) -> dict:
    return {
        "number": number,
        "url": f"https://github.com/igorsdub/git-tic-tac-toe-workshop/issues/{number}",
        "title": "[Game Registration]: pair repo",
        "body": f"""### Repository URL

https://github.com/Pair/Pair-Repo

### Match branch

{branch}

### Player X Handle

alice

### Player O Handle

bob
""",
    }


class TestBuildRegistryRecords(unittest.TestCase):
    def test_same_repository_branches_are_distinct_matches(self):
        calls = []

        def evaluator(owner, repo, branch):
            calls.append((owner, repo, branch))
            state = "X won" if branch == "match-01" else "Ready for X"
            return {
                "is_valid": True,
                "status": "completed" if state == "X won" else "in_progress",
                "state": state,
                "grid": [["X"]],
                "errors": [],
            }

        records = build_registry_records(
            [registration("match-01", 1), registration("match-02", 2)], evaluator
        )
        self.assertEqual(calls, [("Pair", "Pair-Repo", "match-01"), ("Pair", "Pair-Repo", "match-02")])
        self.assertEqual([record["matchKey"] for record in records], [
            "Pair/Pair-Repo#match-01", "Pair/Pair-Repo#match-02"
        ])
        self.assertEqual([record["status"] for record in records], ["completed", "in_progress"])
        self.assertEqual(records[0]["outcome"], "X won")
        self.assertIsNone(records[1]["outcome"])

    def test_legacy_registration_is_retained_as_migration_error(self):
        issue = registration("match-01", 3)
        issue["body"] = issue["body"].replace("### Match branch\n\nmatch-01\n\n", "")

        def fail_if_called(*args):
            self.fail("legacy registration must not fetch a default branch")

        records = build_registry_records([issue], fail_if_called)
        self.assertEqual(len(records), 1)
        self.assertIsNone(records[0]["branch"])
        self.assertEqual(records[0]["status"], "error")
        self.assertIn("predates match-branch support", records[0]["errors"][0])
        self.assertIsNone(records[0]["matchKey"])

    def test_duplicate_registration_for_same_key_is_deduplicated(self):
        calls = []

        def evaluator(owner, repo, branch):
            calls.append(branch)
            return {"is_valid": True, "status": "in_progress", "state": "Ready for X", "grid": [], "errors": []}

        records = build_registry_records(
            [registration("match-01", 4), registration("match-01", 5)], evaluator
        )
        self.assertEqual(len(records), 1)
        self.assertEqual(calls, ["match-01"])

    def test_inaccessible_branch_stays_visible_as_error(self):
        records = build_registry_records(
            [registration("match-04", 6)],
            lambda owner, repo, branch: {
                "is_valid": False,
                "status": "error",
                "state": "Error",
                "errors": [f"Could not read BOARD.txt from branch '{branch}'."],
            },
        )
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]["matchKey"], "Pair/Pair-Repo#match-04")
        self.assertEqual(records[0]["status"], "error")
        self.assertIn("match-04", records[0]["errors"][0])


if __name__ == "__main__":
    unittest.main()

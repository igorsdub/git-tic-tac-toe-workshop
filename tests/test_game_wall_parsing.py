"""test_game_wall_parsing.py

Automated tests for GitHub issue registration parsing and board state evaluation logic
used by the Git Tic-Tac-Toe Game Wall.
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

# Add scripts directory to sys.path
SCRIPTS_DIR = Path(__file__).resolve().parent.parent / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))

from game_wall_parser import (  # type: ignore
    extract_repo_info,
    parse_registration_issue,
    load_workshop_catalog,
    evaluate_game_board,
    evaluate_registered_board,
)


class TestIssueRegistrationParsing(unittest.TestCase):
    """Repository-only issue form validation with explicit workshop identity."""

    def test_repository_registration_requires_known_workshop_and_both_players(self):
        body = """### Workshop ID

2026-10-01-scda

### Repository URL

https://github.com/learner-pair-1/tic-tac-toe-game

### Player X Handle

@learner_alice

### Player O Handle

learner_bob
"""
        result = parse_registration_issue(body)
        self.assertTrue(result["is_valid"])
        self.assertEqual(result["workshop_id"], "2026-10-01-scda")
        self.assertEqual(result["workshop_name"], "SCDA Training Week")
        self.assertEqual(result["owner"], "learner-pair-1")
        self.assertEqual(result["repo"], "tic-tac-toe-game")
        self.assertEqual(result["player_x"], "learner_alice")
        self.assertEqual(result["player_o"], "learner_bob")
        self.assertNotIn("branch", result)

    def test_missing_or_unknown_workshop_id_is_rejected_without_fallback(self):
        base = """### Repository URL

https://github.com/pair/repo

### Player X Handle

alice

### Player O Handle

bob
"""
        missing = parse_registration_issue(base)
        self.assertFalse(missing["is_valid"])
        self.assertIn("Missing Workshop ID", missing["error"])
        unknown = parse_registration_issue(base.replace("### Repository URL", "### Workshop ID\n\nunknown\n\n### Repository URL"))
        self.assertFalse(unknown["is_valid"])
        self.assertIn("Unknown Workshop ID", unknown["error"])

    def test_repository_and_handle_validation(self):
        body = """### Workshop ID

2026-10-01-scda

### Repository URL

https://github.com/pair/repo

### Player X Handle

_No response_

### Player O Handle

bob
"""
        result = parse_registration_issue(body)
        self.assertFalse(result["is_valid"])
        self.assertIn("Missing Player X handle", result["error"])
        self.assertIsNone(result["player_x"])

    def test_legacy_branch_submission_is_detected_for_migration(self):
        body = """### Repository URL

https://github.com/pair/repo

### Match branch

match-01

### Player X Handle

alice

### Player O Handle

bob

### Workshop Name

SCDA Training Week
"""
        result = parse_registration_issue(body)
        self.assertFalse(result["is_valid"])
        self.assertTrue(result["is_legacy"])
        self.assertEqual(result["legacy_branch"], "match-01")

    def test_repo_in_title_fallback_and_markdown_variations(self):
        result = parse_registration_issue("", title="[Game]: https://github.com/partner1/partner2-ttt")
        self.assertEqual(result["owner"], "partner1")
        self.assertEqual(result["repo"], "partner2-ttt")
        urls = [
            ("https://github.com/foo/bar", "foo", "bar"),
            ("http://github.com/foo/bar.git", "foo", "bar"),
            ("https://github.com/foo/bar/", "foo", "bar"),
            ("check out https://github.com/foo_123/bar-test!", "foo_123", "bar-test"),
        ]
        for url, expected_owner, expected_repo in urls:
            owner, repo, clean_url = extract_repo_info(url)
            self.assertEqual((owner, repo, clean_url), (expected_owner, expected_repo, f"https://github.com/{expected_owner}/{expected_repo}"))


class TestBoardStateEvaluationLogic(unittest.TestCase):
    """Test suite verifying board parsing and state evaluation rules."""

    def test_new_game_ready_for_x(self):
        board = """# Git Tic-Tac-Toe
Player X: @alice
Player O: @bob
State: Ready for X

```text
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```
"""
        res = evaluate_game_board(board)
        self.assertTrue(res["is_valid"])
        self.assertEqual(res["state"], "Ready for X")
        self.assertEqual(res["move_counts"], {"X": 0, "O": 0})
        self.assertEqual(res["player_x"], "@alice")
        self.assertEqual(res["player_o"], "@bob")
        self.assertEqual(len(res["grid"]), 3)
        self.assertEqual(res["grid"][0], [" ", " ", " "])

    def test_waiting_for_o(self):
        board = """# Git Tic-Tac-Toe
Player X: @alice
Player O: @bob
State: Waiting for O

```text
 [X] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```
"""
        res = evaluate_game_board(board)
        self.assertTrue(res["is_valid"])
        self.assertEqual(res["state"], "Waiting for O")
        self.assertEqual(res["move_counts"], {"X": 1, "O": 0})
        self.assertEqual(res["grid"][0][0], "X")

    def test_waiting_for_x(self):
        board = """# Git Tic-Tac-Toe
Player X: @alice
Player O: @bob
State: Waiting for X

```text
 [X] | [ ] | [ ]
-----+-----+-----
 [ ] | [O] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```
"""
        res = evaluate_game_board(board)
        self.assertTrue(res["is_valid"])
        self.assertEqual(res["state"], "Waiting for X")
        self.assertEqual(res["move_counts"], {"X": 1, "O": 1})

    def test_x_won_horizontal(self):
        board = """# Git Tic-Tac-Toe
Player X: @alice
Player O: @bob
State: X won

```text
 [X] | [X] | [X]
-----+-----+-----
 [O] | [O] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```
"""
        res = evaluate_game_board(board)
        self.assertTrue(res["is_valid"])
        self.assertEqual(res["state"], "X won")
        self.assertEqual(res["move_counts"], {"X": 3, "O": 2})

    def test_o_won_diagonal(self):
        board = """# Git Tic-Tac-Toe
Player X: @alice
Player O: @bob
State: O won

```text
 [O] | [X] | [X]
-----+-----+-----
 [X] | [O] | [ ]
-----+-----+-----
 [ ] | [ ] | [O]
```
"""
        res = evaluate_game_board(board)
        self.assertTrue(res["is_valid"])
        self.assertEqual(res["state"], "O won")
        self.assertEqual(res["move_counts"], {"X": 3, "O": 3})

    def test_draw_full_board(self):
        board = """# Git Tic-Tac-Toe
Player X: @alice
Player O: @bob
State: Draw

```text
 [X] | [O] | [X]
-----+-----+-----
 [X] | [O] | [O]
-----+-----+-----
 [O] | [X] | [X]
```
"""
        res = evaluate_game_board(board)
        self.assertTrue(res["is_valid"])
        self.assertEqual(res["state"], "Draw")
        self.assertEqual(res["move_counts"], {"X": 5, "O": 4})

    def test_invalid_board_o_exceeds_x(self):
        board = """# Git Tic-Tac-Toe
Player X: @alice
Player O: @bob
State: Waiting for X

```text
 [O] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```
"""
        res = evaluate_game_board(board)
        self.assertFalse(res["is_valid"])
        self.assertEqual(res["state"], "Invalid board")
        self.assertTrue(any("O cannot exceed X" in err for err in res["errors"]))

    def test_invalid_board_x_too_many_turns_ahead(self):
        board = """# Git Tic-Tac-Toe
Player X: @alice
Player O: @bob
State: Waiting for O

```text
 [X] | [X] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```
"""
        res = evaluate_game_board(board)
        self.assertFalse(res["is_valid"])
        self.assertEqual(res["state"], "Invalid board")
        self.assertTrue(any("cannot exceed 1" in err for err in res["errors"]))

    def test_invalid_board_double_win(self):
        board = """# Git Tic-Tac-Toe
Player X: @alice
Player O: @bob
State: X won

```text
 [X] | [X] | [X]
-----+-----+-----
 [O] | [O] | [O]
-----+-----+-----
 [ ] | [ ] | [ ]
```
"""
        res = evaluate_game_board(board)
        self.assertFalse(res["is_valid"])
        self.assertEqual(res["state"], "Invalid board")
        self.assertTrue(any("Both Player X and Player O have winning lines" in err for err in res["errors"]))

    def test_invalid_board_malformed_dimensions(self):
        board = """# Git Tic-Tac-Toe
Player X: @alice
Player O: @bob
State: Ready for X

```text
 [ ] | [ ]
-----+-----
 [ ] | [ ]
```
"""
        res = evaluate_game_board(board)
        self.assertFalse(res["is_valid"])
        self.assertEqual(res["state"], "Invalid board")

    def test_registered_board_is_unfinished(self):
        from unittest.mock import patch

        raw = """ [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]"""
        with patch("game_wall_parser.fetch_registered_board", return_value=raw) as fetch:
            result = evaluate_registered_board("pair", "repo", "match-01")
        fetch.assert_called_once_with("pair", "repo", "match-01")
        self.assertTrue(result["is_valid"])
        self.assertEqual(result["status"], "in_progress")
        self.assertEqual(result["state"], "Ready for X")

    def test_registered_completed_board_remains_completed(self):
        from unittest.mock import patch

        won = """ [X] | [X] | [X]
-----+-----+-----
 [O] | [O] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]"""
        with patch("game_wall_parser.fetch_registered_board", return_value=won):
            result = evaluate_registered_board("pair", "repo", "match-01")
        self.assertEqual(result["status"], "completed")
        self.assertEqual(result["state"], "X won")

    def test_registered_invalid_board_is_explicit_error(self):
        from unittest.mock import patch

        with patch("game_wall_parser.fetch_registered_board", return_value="not a board"):
            result = evaluate_registered_board("pair", "repo", "match-01")
        self.assertEqual(result["status"], "error")
        self.assertFalse(result["is_valid"])
        self.assertTrue(any(error.startswith("Invalid BOARD.txt:") for error in result["errors"]))

    def test_registered_missing_branch_is_explicit_error(self):
        from unittest.mock import patch

        with patch("game_wall_parser.fetch_registered_board", side_effect=RuntimeError("Could not read BOARD.txt")):
            result = evaluate_registered_board("pair", "repo", "match-01")
        self.assertEqual(result["status"], "error")
        self.assertIn("Could not read BOARD.txt", result["errors"][0])

    def test_registered_board_fetch_uses_exact_uppercase_path_and_branch(self):
        from io import BytesIO
        from unittest.mock import patch
        from game_wall_parser import fetch_registered_board

        with patch("game_wall_parser.urlopen", return_value=BytesIO(b"board")) as open_url:
            self.assertEqual(fetch_registered_board("pair", "repo", "match-01"), "board")
        self.assertEqual(
            open_url.call_args.args[0],
            "https://raw.githubusercontent.com/pair/repo/match-01/BOARD.txt",
        )

    def test_registered_board_fetch_rejects_default_branch_without_network(self):
        from unittest.mock import patch
        from game_wall_parser import fetch_registered_board

        with patch("game_wall_parser.urlopen") as open_url:
            with self.assertRaisesRegex(ValueError, "numbered format match-NN"):
                fetch_registered_board("pair", "repo", "main")
        open_url.assert_not_called()


if __name__ == "__main__":
    unittest.main()

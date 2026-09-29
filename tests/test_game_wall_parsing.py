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
    evaluate_game_board,
)


class TestIssueRegistrationParsing(unittest.TestCase):
    """Test suite for parsing GitHub issue bodies submitted via register-game.yml."""

    def test_full_issue_form_body(self):
        body = """### Repository URL

https://github.com/learner-pair-1/tic-tac-toe-game

### Player X Handle

@learner_alice

### Player O Handle

learner_bob

### Event ID / Session Name

Workshop-2026-Fall
"""
        res = parse_registration_issue(body)
        self.assertTrue(res["is_valid"])
        self.assertEqual(res["owner"], "learner-pair-1")
        self.assertEqual(res["repo"], "tic-tac-toe-game")
        self.assertEqual(res["repo_url"], "https://github.com/learner-pair-1/tic-tac-toe-game")
        self.assertEqual(res["player_x"], "learner_alice")
        self.assertEqual(res["player_o"], "learner_bob")
        self.assertEqual(res["event_id"], "Workshop-2026-Fall")
        self.assertIsNone(res["error"])

    def test_git_suffix_and_trailing_slash(self):
        body = "### Repository URL\n\nhttps://github.com/org-name/repo-name.git/\n"
        res = parse_registration_issue(body)
        self.assertTrue(res["is_valid"])
        self.assertEqual(res["owner"], "org-name")
        self.assertEqual(res["repo"], "repo-name")
        self.assertEqual(res["repo_url"], "https://github.com/org-name/repo-name")
        self.assertEqual(res["event_id"], "Default Event")

    def test_markdown_link_in_body(self):
        body = "Our repo is [Pair Repo](https://github.com/coder-x/git-ttt) for the game."
        res = parse_registration_issue(body)
        self.assertTrue(res["is_valid"])
        self.assertEqual(res["owner"], "coder-x")
        self.assertEqual(res["repo"], "git-ttt")
        self.assertEqual(res["repo_url"], "https://github.com/coder-x/git-ttt")

    def test_no_response_placeholders(self):
        body = """### Repository URL

https://github.com/solo/game

### Player X Handle

_No response_

### Player O Handle

_No response_

### Event ID / Session Name

_No response_
"""
        res = parse_registration_issue(body)
        self.assertTrue(res["is_valid"])
        self.assertEqual(res["owner"], "solo")
        self.assertEqual(res["repo"], "game")
        self.assertIsNone(res["player_x"])
        self.assertIsNone(res["player_o"])
        self.assertEqual(res["event_id"], "Default Event")

    def test_repo_in_title_fallback(self):
        title = "[Game]: https://github.com/partner1/partner2-ttt"
        res = parse_registration_issue("", title=title)
        self.assertTrue(res["is_valid"])
        self.assertEqual(res["owner"], "partner1")
        self.assertEqual(res["repo"], "partner2-ttt")

    def test_invalid_issue_body(self):
        body = "Just saying hello! No repository url here."
        res = parse_registration_issue(body)
        self.assertFalse(res["is_valid"])
        self.assertIn("No valid GitHub repository URL found", res["error"])

    def test_extract_repo_info_variations(self):
        urls = [
            ("https://github.com/foo/bar", "foo", "bar"),
            ("http://github.com/foo/bar.git", "foo", "bar"),
            ("https://github.com/foo/bar/", "foo", "bar"),
            ("check out https://github.com/foo_123/bar-test!", "foo_123", "bar-test"),
        ]
        for url, expected_owner, expected_repo in urls:
            owner, repo, clean_url = extract_repo_info(url)
            self.assertEqual(owner, expected_owner)
            self.assertEqual(repo, expected_repo)
            self.assertEqual(clean_url, f"https://github.com/{expected_owner}/{expected_repo}")


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


if __name__ == "__main__":
    unittest.main()

"""test_validate_board.py

Unit test suite for scripts/validate_board.py.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
import unittest

# Add scripts directory to sys.path
SCRIPTS_DIR = Path(__file__).resolve().parent.parent / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))

from validate_board import validate_board, validate_file  # type: ignore  # noqa: E402 - needs sys.path set above


class TestBoardValidator(unittest.TestCase):
    def setUp(self):
        self.samples_dir = Path(__file__).resolve().parent / "fixtures" / "legacy-board"

    def test_sample_files(self):
        """Verifies historical board fixtures retain their parser outcomes."""
        expected = {
            "01_new_game.md": ("Ready for X", True),
            "02_waiting_for_o.md": ("Waiting for O", True),
            "03_waiting_for_x.md": ("Waiting for X", True),
            "04_x_won.md": ("X won", True),
            "05_o_won.md": ("O won", True),
            "06_draw.md": ("Draw", True),
            "07_malformed_unbalanced_turns.md": ("Invalid board", False),
            "08_malformed_double_win.md": ("Invalid board", False),
            "09_malformed_bad_char.md": ("Invalid board", False),
            "10_malformed_dimensions.md": ("Invalid board", False),
            "11_malformed_missing_headers.md": ("Ready for X", True),
        }

        for filename, (expected_state, expected_valid) in expected.items():
            sample_path = self.samples_dir / filename
            self.assertTrue(sample_path.exists(), f"Sample file {sample_path} must exist")
            res = validate_file(sample_path)
            self.assertEqual(
                res.state,
                expected_state,
                f"File {filename}: expected state '{expected_state}', got '{res.state}'. Errors: {res.errors}",
            )
            self.assertEqual(
                res.is_valid,
                expected_valid,
                f"File {filename}: expected is_valid={expected_valid}, got {res.is_valid}",
            )

    def test_template_starter_and_compact_examples(self):
        repo_root = Path(__file__).resolve().parent.parent
        board_path = repo_root / "template" / "BOARD.txt"
        self.assertEqual(board_path.read_text(encoding="utf-8"), ". . .\n. . .\n. . .\n")

        result = validate_file(repo_root / "template" / "samples" / "empty.md")
        self.assertTrue(result.is_valid, result.errors)
        self.assertEqual(result.state, "Ready for X")

    def test_shared_board_grammar_fixtures(self):
        """Every shared fixture must get the same verdict here as in the browser evaluator."""
        fixture_dir = Path(__file__).resolve().parent / "fixtures" / "board-grammar"
        fixture_files = sorted(fixture_dir.glob("*.json"))
        self.assertTrue(fixture_files, f"no fixtures found in {fixture_dir}")

        for fixture_file in fixture_files:
            with self.subTest(fixture=fixture_file.name):
                fixture = json.loads(fixture_file.read_text(encoding="utf-8"))
                expected = fixture["expected"]
                res = validate_board(fixture["content"])

                self.assertEqual(res.is_valid, expected["valid"], f"validity; errors={res.errors}")
                self.assertEqual(res.state, expected["state"])

                if expected["reason"] is None:
                    self.assertEqual(res.errors, [])
                else:
                    self.assertTrue(
                        any(expected["reason"] in err for err in res.errors),
                        f"no error contains {expected['reason']!r}; errors={res.errors}",
                    )

                placeholder_handles = sorted(
                    player
                    for player in ("X", "O")
                    if any(w.startswith(f"Missing or placeholder 'Player {player}:' header") for w in res.warnings)
                )
                self.assertEqual(placeholder_handles, sorted(expected["placeholderHandles"]))

                if not expected["valid"]:
                    self.assertNotIn("grid", expected, "grid is only allowed on valid boards")
                if "grid" in expected:
                    self.assertEqual(res.grid, expected["grid"])

    def test_handles_extraction(self):
        content = """# Git Tic-Tac-Toe
**Player X**: @octocat
**Player O**: codemonkey
State: Ready for X

```
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```
"""
        res = validate_board(content)
        self.assertTrue(res.is_valid)
        self.assertEqual(res.player_x, "@octocat")
        self.assertEqual(res.player_o, "codemonkey")
        self.assertEqual(res.state, "Ready for X")

    def test_diagonal_win_x(self):
        content = """# Git Tic-Tac-Toe
Player X: @alice
Player O: @bob
State: X won

```
 [X] | [O] | [ ]
-----+-----+-----
 [ ] | [X] | [O]
-----+-----+-----
 [ ] | [ ] | [X]
```
"""
        res = validate_board(content)
        self.assertTrue(res.is_valid)
        self.assertEqual(res.state, "X won")
        self.assertEqual(res.move_counts, {"X": 3, "O": 2})

    def test_anti_diagonal_win_o(self):
        content = """# Git Tic-Tac-Toe
Player X: @alice
Player O: @bob
State: O won

```
 [X] | [X] | [O]
-----+-----+-----
 [X] | [O] | [ ]
-----+-----+-----
 [O] | [ ] | [ ]
```
"""
        res = validate_board(content)
        self.assertTrue(res.is_valid)
        self.assertEqual(res.state, "O won")
        self.assertEqual(res.move_counts, {"X": 3, "O": 3})

    def test_o_cannot_exceed_x(self):
        content = """# Git Tic-Tac-Toe
Player X: @alice
Player O: @bob
State: Waiting for X

```
 [O] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```
"""
        res = validate_board(content)
        self.assertFalse(res.is_valid)
        self.assertEqual(res.state, "Invalid board")
        self.assertTrue(any("Player O has 1 moves, Player X has 0" in err for err in res.errors))

    def test_x_cannot_move_twice_consecutively(self):
        content = """# Git Tic-Tac-Toe
Player X: @alice
Player O: @bob
State: Waiting for O

```
 [X] | [X] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```
"""
        res = validate_board(content)
        self.assertFalse(res.is_valid)
        self.assertEqual(res.state, "Invalid board")
        self.assertTrue(any("Difference between X and O moves cannot exceed 1" in err for err in res.errors))

    def test_both_cannot_win(self):
        content = """# Git Tic-Tac-Toe
Player X: @alice
Player O: @bob
State: Invalid board

```
 [X] | [X] | [X]
-----+-----+-----
 [O] | [O] | [O]
-----+-----+-----
 [ ] | [ ] | [ ]
```
"""
        res = validate_board(content)
        self.assertFalse(res.is_valid)
        self.assertEqual(res.state, "Invalid board")
        self.assertTrue(any("Both Player X and Player O have winning lines" in err for err in res.errors))

    def test_declared_state_mismatch_warning(self):
        content = """# Git Tic-Tac-Toe
Player X: @alice
Player O: @bob
State: Ready for X

```
 [X] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```
"""
        res = validate_board(content)
        # Board is still physically valid, but state warning is emitted
        self.assertTrue(res.is_valid)
        self.assertEqual(res.state, "Waiting for O")
        self.assertTrue(any("does not match evaluated state 'Waiting for O'" in w for w in res.warnings))

    def test_missing_player_headers(self):
        """Verifies that missing player headers produce non-fatal warnings and allow is_valid == True."""
        sample_path = self.samples_dir / "11_malformed_missing_headers.md"
        res = validate_file(sample_path)
        self.assertTrue(res.is_valid)
        self.assertEqual(res.state, "Ready for X")
        self.assertEqual(res.player_o, "@bob")
        self.assertIsNone(res.player_x)
        self.assertTrue(
            any("Missing or placeholder 'Player X:' header" in w for w in res.warnings)
        )
        self.assertEqual(len(res.errors), 0)

    def test_board_without_player_headers_is_valid(self):
        """Demonstrates that a board with only '# Git Tic-Tac-Toe', 'State: Ready for X',

        and an empty 3x3 grid validates successfully with is_valid == True.
        """
        content = """# Git Tic-Tac-Toe
State: Ready for X

```text
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```
"""
        res = validate_board(content)
        self.assertTrue(res.is_valid)
        self.assertEqual(res.state, "Ready for X")
        self.assertIsNone(res.player_x)
        self.assertIsNone(res.player_o)
        self.assertEqual(len(res.errors), 0)
        self.assertTrue(
            any("Missing or placeholder 'Player X:' header" in w for w in res.warnings)
        )
        self.assertTrue(
            any("Missing or placeholder 'Player O:' header" in w for w in res.warnings)
        )

    def test_placeholder_player_headers_produce_warnings(self):
        """Verifies that placeholder handles like [GitHub Username] produce warnings but are valid."""
        content = """# Git Tic-Tac-Toe
Player X: [GitHub Username]
Player O: [GitHub Username]
State: Ready for X

```text
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```
"""
        res = validate_board(content)
        self.assertTrue(res.is_valid)
        self.assertEqual(res.state, "Ready for X")
        self.assertEqual(res.player_x, "[GitHub Username]")
        self.assertEqual(res.player_o, "[GitHub Username]")
        self.assertEqual(len(res.errors), 0)
        self.assertTrue(
            any("Missing or placeholder 'Player X:' header" in w for w in res.warnings)
        )
        self.assertTrue(
            any("Missing or placeholder 'Player O:' header" in w for w in res.warnings)
        )

    def test_missing_state_header_is_valid_with_dynamic_evaluation(self):
        """Verifies that a board without State line is valid with dynamically evaluated state."""
        content = """# Git Tic-Tac-Toe

```text
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
```
"""
        res = validate_board(content)
        self.assertTrue(res.is_valid)
        self.assertEqual(res.state, "Ready for X")
        self.assertTrue(any("Missing 'State:' or 'Status:' indicator line" in w for w in res.warnings))

    def test_pure_raw_board_without_markdown_fences(self):
        """Verifies that a pure 5-line text grid without headers or fences validates correctly."""
        content = """ [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]"""
        res = validate_board(content)
        self.assertTrue(res.is_valid)
        self.assertEqual(res.state, "Ready for X")

    def test_pure_raw_board_with_moves(self):
        """Verifies that moves on a pure raw grid evaluate correctly."""
        content = """ [X] | [ ] | [ ]
-----+-----+-----
 [ ] | [O] | [ ]
-----+-----+-----
 [ ] | [ ] | [ ]"""
        res = validate_board(content)
        self.assertTrue(res.is_valid)
        self.assertEqual(res.state, "Waiting for X")
        self.assertEqual(res.move_counts, {"X": 1, "O": 1})

    def test_compact_board_and_one_move_keep_normalized_grid(self):
        res = validate_board(". . .\n. X .\n. . O\n")
        self.assertTrue(res.is_valid, res.errors)
        self.assertEqual(res.grid, [[" ", " ", " "], [" ", "X", " "], [" ", " ", "O"]])
        self.assertEqual(res.state, "Waiting for X")

    def test_malformed_compact_board_is_rejected(self):
        for content in (
            ".  . .\n. . .\n. . .\n",
            ". .\n. . .\n. . .\n",
            ". . ?\n. . .\n. . .\n",
            ". . .\n. . .\n. . .\n. . .\n",
            ". . .\n. . .\n. . .\nX X\n",
            ". . .\n. . .\n. . .\nX X X X X\n",
            ". . .\n. . .\nXX\n",
            " . . .\n. . .\n. . .\n",
            ". . . \n. . .\n. . .\n",
        ):
            with self.subTest(content=content):
                result = validate_board(content)
                self.assertFalse(result.is_valid)
                self.assertEqual(result.state, "Invalid board")

    def test_legacy_pipe_rows_without_padding_spaces_remain_valid(self):
        result = validate_board("X | O|X\nO|X|O\nX|O |X\n")
        self.assertTrue(result.is_valid, result.errors)
        self.assertEqual(result.state, "X won")
        self.assertEqual(result.grid[0], ["X", "O", "X"])

    def test_default_cli_board_txt(self):
        """Verifies CLI defaults to board.txt in the current directory."""
        from validate_board import main
        import tempfile
        import os
        from unittest.mock import patch

        orig_cwd = os.getcwd()
        with tempfile.TemporaryDirectory() as tmpdir:
            try:
                os.chdir(tmpdir)
                board_path = Path(tmpdir) / "board.txt"
                board_path.write_text(" [ ] | [ ] | [ ]\n-----+-----+-----\n [ ] | [ ] | [ ]\n-----+-----+-----\n [ ] | [ ] | [ ]\n")
                with patch("sys.argv", ["validate_board.py", "--quiet"]):
                    code = main()
                    self.assertEqual(code, 0)
            finally:
                os.chdir(orig_cwd)


if __name__ == "__main__":
    unittest.main()

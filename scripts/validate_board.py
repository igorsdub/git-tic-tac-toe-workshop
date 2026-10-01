#!/usr/bin/env python3
"""validate_board.py

Parses and validates tic-tac-toe board files (`board.txt`).
Identifies player handles, verifies 3x3 grid dimensions and cell formatting,
checks turn parity and winning conditions, and evaluates the canonical game state:
- 'Ready for X'
- 'Waiting for O'
- 'Waiting for X'
- 'X won'
- 'O won'
- 'Draw'
- 'Invalid board'
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import List, Optional, Tuple


VALID_STATES = {
    "Ready for X",
    "Waiting for O",
    "Waiting for X",
    "X won",
    "O won",
    "Draw",
    "Invalid board",
}


@dataclass
class BoardValidationResult:
    is_valid: bool
    state: str
    declared_state: Optional[str]
    player_x: Optional[str]
    player_o: Optional[str]
    grid: Optional[List[List[str]]]
    move_counts: dict[str, int]
    errors: List[str]
    warnings: List[str]

    def to_dict(self) -> dict:
        return asdict(self)


def _extract_header(text: str, pattern: str) -> Optional[str]:
    match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
    if match:
        val = match.group(1).strip()
        # Remove surrounding markdown bold or code formatting if present
        val = re.sub(r"^[*_`]+|[*_`]+$", "", val).strip()
        return val
    return None


def _is_divider_line(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return True
    # Lines made of dashes, pluses, pipes, spaces, equals (e.g. `-----+-----+-----` or `+---+---+---+`)
    return bool(re.match(r"^[ \t\+\-\|\=]+$", stripped) and "-" in stripped)


def _extract_grid_lines(text: str) -> List[str]:
    """Finds the 3 board grid rows inside text (inside code fences if present)."""
    # Look for code block first
    code_blocks = re.findall(r"```(?:text)?\s*\n([\s\S]*?)\n```", text, re.MULTILINE)
    search_areas = code_blocks if code_blocks else [text]

    grid_lines: List[str] = []
    for area in search_areas:
        lines = area.splitlines()
        candidate_lines = []
        for line in lines:
            if "|" in line and not _is_divider_line(line):
                candidate_lines.append(line)
        if len(candidate_lines) == 3:
            grid_lines = candidate_lines
            break
        elif len(candidate_lines) > 0 and not grid_lines:
            # Keep as fallback candidate for error reporting
            grid_lines = candidate_lines

    return grid_lines


def _parse_cell(raw_cell: str) -> Tuple[Optional[str], Optional[str]]:
    """Returns (mark, error_message).

    Mark is 'X', 'O', or ' ' (empty).
    """
    c = raw_cell.strip()
    # Normalize brackets: e.g. [ ], [X], [O]
    if c in ("[ ]", "[]", "", " ", ".", "_"):
        return " ", None
    if re.fullmatch(r"\[\s*\]", c):
        return " ", None
    # Position placeholder digits 1-9: e.g. [1], 1
    if re.fullmatch(r"\[?[1-9]\]?", c):
        return " ", None

    if c in ("[X]", "[x]", "X", "x") or re.fullmatch(r"\[\s*[Xx]\s*\]", c):
        return "X", None
    if c in ("[O]", "[o]", "O", "o") or re.fullmatch(r"\[\s*[Oo]\s*\]", c):
        return "O", None

    return None, f"Invalid cell mark: '{raw_cell}'"


def _check_winner(grid: List[List[str]], mark: str) -> bool:
    # Check 3 rows
    for r in range(3):
        if grid[r][0] == mark and grid[r][1] == mark and grid[r][2] == mark:
            return True
    # Check 3 columns
    for c in range(3):
        if grid[0][c] == mark and grid[1][c] == mark and grid[2][c] == mark:
            return True
    # Check 2 diagonals
    if grid[0][0] == mark and grid[1][1] == mark and grid[2][2] == mark:
        return True
    if grid[0][2] == mark and grid[1][1] == mark and grid[2][0] == mark:
        return True
    return False


def _is_missing_or_placeholder(handle: Optional[str]) -> bool:
    """Returns True if handle is None, empty, or a template placeholder."""
    if not handle:
        return True
    cleaned = handle.strip()
    if not cleaned:
        return True
    lower = cleaned.lower()
    if (
        (cleaned.startswith("[") and cleaned.endswith("]"))
        or (cleaned.startswith("<") and cleaned.endswith(">"))
        or "github username" in lower
        or "placeholder" in lower
        or lower in ("none", "tbd", "todo", "<missing>")
    ):
        return True
    return False


def validate_board(board_content: str) -> BoardValidationResult:
    """Parses and validates a tic-tac-toe board string."""
    errors: List[str] = []
    warnings: List[str] = []

    # 1. Player handles (optional metadata)
    player_x = _extract_header(board_content, r"^[ \t]*\*?\*?Player\s+X\*?\*?:\s*(.+)$")
    player_o = _extract_header(board_content, r"^[ \t]*\*?\*?Player\s+O\*?\*?:\s*(.+)$")

    if _is_missing_or_placeholder(player_x):
        warnings.append("Missing or placeholder 'Player X:' header; handle will be sourced from registration.")
    if _is_missing_or_placeholder(player_o):
        warnings.append("Missing or placeholder 'Player O:' header; handle will be sourced from registration.")

    # 2. Declared state (optional)
    declared_state = _extract_header(board_content, r"^[ \t]*\*?\*?Stat(?:e|us)\*?\*?:\s*(.+)$")
    if not declared_state:
        warnings.append("Missing 'State:' or 'Status:' indicator line; state evaluated dynamically.")

    # 3. Grid parsing
    grid_lines = _extract_grid_lines(board_content)
    if len(grid_lines) != 3:
        errors.append(f"Grid must contain exactly 3 rows; found {len(grid_lines)}.")
        return BoardValidationResult(
            is_valid=False,
            state="Invalid board",
            declared_state=declared_state,
            player_x=player_x,
            player_o=player_o,
            grid=None,
            move_counts={"X": 0, "O": 0},
            errors=errors,
            warnings=warnings,
        )

    grid: List[List[str]] = []
    for row_idx, line in enumerate(grid_lines):
        clean_line = line.strip()
        # Handle optional outer boundary pipes: e.g. | [ ] | [ ] | [ ] |
        if clean_line.startswith("|") and clean_line.endswith("|"):
            raw_cells = [c for c in clean_line[1:-1].split("|")]
        else:
            raw_cells = [c for c in clean_line.split("|")]

        if len(raw_cells) != 3:
            errors.append(
                f"Row {row_idx + 1} must contain exactly 3 columns separated by '|'; found {len(raw_cells)}: '{clean_line}'."
            )
            continue

        row: List[str] = []
        for col_idx, raw_c in enumerate(raw_cells):
            mark, err = _parse_cell(raw_c)
            if err:
                errors.append(f"Row {row_idx + 1}, Column {col_idx + 1}: {err}.")
                row.append("?")
            else:
                row.append(mark if mark is not None else " ")
        grid.append(row)

    if errors:
        return BoardValidationResult(
            is_valid=False,
            state="Invalid board",
            declared_state=declared_state,
            player_x=player_x,
            player_o=player_o,
            grid=grid if len(grid) == 3 else None,
            move_counts={"X": 0, "O": 0},
            errors=errors,
            warnings=warnings,
        )

    # 4. Count moves
    count_x = sum(row.count("X") for row in grid)
    count_o = sum(row.count("O") for row in grid)
    move_counts = {"X": count_x, "O": count_o}

    # 5. Move parity validation
    if count_o > count_x:
        errors.append(
            f"Invalid turn parity: Player O has {count_o} moves, Player X has {count_x}. "
            "Player X moves first, so O cannot exceed X."
        )
    if count_x > count_o + 1:
        errors.append(
            f"Invalid turn parity: Player X has {count_x} moves, Player O has {count_o}. "
            "Difference between X and O moves cannot exceed 1."
        )

    # 6. Win condition validation
    x_won = _check_winner(grid, "X")
    o_won = _check_winner(grid, "O")

    if x_won and o_won:
        errors.append("Invalid board: Both Player X and Player O have winning lines.")

    if x_won and count_x != count_o + 1:
        errors.append(
            f"Invalid board: Player X won, but move counts are X={count_x}, O={count_o}. "
            "For an X win, X must have exactly 1 more move than O."
        )

    if o_won and count_x != count_o:
        errors.append(
            f"Invalid board: Player O won, but move counts are X={count_x}, O={count_o}. "
            "For an O win, move counts must be equal."
        )

    if errors:
        return BoardValidationResult(
            is_valid=False,
            state="Invalid board",
            declared_state=declared_state,
            player_x=player_x,
            player_o=player_o,
            grid=grid,
            move_counts=move_counts,
            errors=errors,
            warnings=warnings,
        )

    # 7. Evaluate canonical state
    if x_won:
        evaluated_state = "X won"
    elif o_won:
        evaluated_state = "O won"
    elif count_x + count_o == 9:
        evaluated_state = "Draw"
    elif count_x == 0 and count_o == 0:
        evaluated_state = "Ready for X"
    elif count_x == count_o:
        evaluated_state = "Waiting for X"
    elif count_x == count_o + 1:
        evaluated_state = "Waiting for O"
    else:
        evaluated_state = "Invalid board"

    # 8. Check consistency with declared state
    if declared_state:
        normalized_decl = declared_state.strip().lower()
        normalized_eval = evaluated_state.lower()
        if normalized_decl != normalized_eval:
            warnings.append(
                f"Declared state '{declared_state}' does not match evaluated state '{evaluated_state}'."
            )

    return BoardValidationResult(
        is_valid=True,
        state=evaluated_state,
        declared_state=declared_state,
        player_x=player_x,
        player_o=player_o,
        grid=grid,
        move_counts=move_counts,
        errors=[],
        warnings=warnings,
    )


def validate_file(file_path: Path) -> BoardValidationResult:
    try:
        content = file_path.read_text(encoding="utf-8")
        return validate_board(content)
    except Exception as e:
        return BoardValidationResult(
            is_valid=False,
            state="Invalid board",
            declared_state=None,
            player_x=None,
            player_o=None,
            grid=None,
            move_counts={"X": 0, "O": 0},
            errors=[f"Failed to read file: {e}"],
            warnings=[],
        )


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate Git Tic-Tac-Toe board.txt files.")
    parser.add_argument("paths", nargs="*", type=Path, help="Path(s) to board.txt files or directories")
    parser.add_argument("--json", action="store_true", help="Output results in JSON format")
    parser.add_argument("--quiet", action="store_true", help="Suppress non-error output")
    args = parser.parse_args()

    target_files: List[Path] = []
    if not args.paths:
        # Default to board.txt in current directory if exists
        default_file = Path("board.txt")
        if default_file.exists():
            target_files.append(default_file)
        else:
            parser.print_help()
            return 1
    else:
        for p in args.paths:
            if p.is_dir():
                target_files.extend(sorted(f for f in p.glob("**/*") if f.is_file() and f.suffix in (".txt", ".md")))
            elif p.is_file():
                target_files.append(p)
            else:
                print(f"Error: Path not found: {p}", file=sys.stderr)
                return 1

    results = {}
    any_invalid = False

    for file_path in target_files:
        res = validate_file(file_path)
        results[str(file_path)] = res.to_dict()
        if not res.is_valid:
            any_invalid = True

        if not args.json and not args.quiet:
            status_icon = "✓" if res.is_valid else "✗"
            print(f"[{status_icon}] {file_path}")
            print(f"    State: {res.state}")
            print(f"    Player X: {res.player_x or '<missing>'}")
            print(f"    Player O: {res.player_o or '<missing>'}")
            print(f"    Moves: X={res.move_counts['X']}, O={res.move_counts['O']}")
            if res.grid:
                print("    Board:")
                for r in res.grid:
                    print(f"      [{r[0]}] | [{r[1]}] | [{r[2]}]")
            if res.errors:
                print("    Errors:")
                for err in res.errors:
                    print(f"      - {err}")
            if res.warnings:
                print("    Warnings:")
                for warn in res.warnings:
                    print(f"      - {warn}")
            print()

    if args.json:
        print(json.dumps(results, indent=2))

    return 1 if any_invalid else 0


if __name__ == "__main__":
    sys.exit(main())

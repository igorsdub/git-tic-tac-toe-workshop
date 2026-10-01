"""test_slides.py

Automated tests validating docs/slides/collaboration.html:
- Exactly 24 slides with correct sequential IDs (#slide-1 to #slide-24).
- Header tags and footer counters (e.g. '1 / 24' through '24 / 24').
- Presence of board SVG elements, turn cycle cards, and high-contrast commit rows.
- No references to the removed 'Imagined Land' scenario.
"""

from __future__ import annotations

import re
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
SLIDES_HTML_PATH = REPO_ROOT / "docs" / "slides" / "collaboration.html"


class TestCollaborationSlides(unittest.TestCase):
    """Test suite ensuring integrity and completeness of the collaboration presentation."""

    def setUp(self):
        self.assertTrue(SLIDES_HTML_PATH.is_file(), f"{SLIDES_HTML_PATH} must exist.")
        self.html = SLIDES_HTML_PATH.read_text(encoding="utf-8")

    def test_slide_count_and_sequential_ids(self):
        """Must have exactly 24 slides with IDs slide-1 to slide-24."""
        slide_ids = re.findall(r'<div class="slide[^"]*" id="(slide-\d+)"', self.html)
        self.assertEqual(len(slide_ids), 24, f"Expected 24 slides, found {len(slide_ids)}: {slide_ids}")
        for i in range(1, 25):
            expected_id = f"slide-{i}"
            self.assertIn(expected_id, slide_ids, f"Missing {expected_id}")

    def test_footer_slide_numbering(self):
        """Footers must have sequential 'X / 24' indicators."""
        for i in range(1, 25):
            expected_fraction = f"{i} / 24"
            self.assertIn(expected_fraction, self.html, f"Footer missing counter '{expected_fraction}'")

    def test_no_imagined_land_scenario(self):
        """Removed cheesy 'Imagined Land' scenario must not be present."""
        self.assertNotIn("Imagined Land", self.html)
        self.assertNotIn("Distant Collaborators", self.html)

    def test_board_svg_and_commits_progression(self):
        """Must contain board.txt SVG references and sequential commits."""
        self.assertIn("board.txt", self.html)
        # Commit hashes for game moves
        self.assertIn("e4a10", self.html)
        self.assertIn("9b2d8", self.html)
        self.assertIn("31c0a", self.html)
        self.assertIn("f7e14", self.html)
        self.assertIn("a2d56", self.html)
        self.assertIn("5c8b1", self.html)

    def test_turn_cycle_steps(self):
        """Must include the 5-step Turn Cycle (PULL, EDIT, STAGE, COMMIT, PUSH)."""
        self.assertIn("git pull", self.html)
        self.assertIn("git add", self.html)
        self.assertIn("git commit", self.html)
        self.assertIn("git push", self.html)
        self.assertIn("Partner pulls your move &amp; takes their turn", self.html)


if __name__ == "__main__":
    unittest.main()

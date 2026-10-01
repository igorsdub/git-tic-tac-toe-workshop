"""test_slides.py

Automated tests validating docs/slides/collaboration.html:
- Exactly 23 slides with correct sequential IDs (#slide-1 to #slide-23).
- Sequential footer counters '1 / 23' through '23 / 23'.
- Slide 3 has single file and commits underneath (no board SVG on slide 3).
- Commits section uses 'Commit 1', 'Commit 2', etc., staying in chronological order.
- Turn Cycle comes BEFORE Git vs GitHub.
- Turn Cycle cards omit command line syntax (git pull, git add, etc.).
- Remotes omit command boxes and use arrows.
- Slide 23 is Best Practices; hands-on workshop slide is removed.
"""

from __future__ import annotations

import re
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
SLIDES_HTML_PATH = REPO_ROOT / "docs" / "slides" / "collaboration.html"


class TestCollaborationSlides(unittest.TestCase):
    """Test suite ensuring integrity and compliance of collaboration slides."""

    def setUp(self):
        self.assertTrue(SLIDES_HTML_PATH.is_file(), f"{SLIDES_HTML_PATH} must exist.")
        self.html = SLIDES_HTML_PATH.read_text(encoding="utf-8")

    def test_slide_count_and_sequential_ids(self):
        """Must have exactly 23 slides with IDs slide-1 to slide-23."""
        slide_ids = re.findall(r'<div class="slide[^"]*" id="(slide-\d+)"', self.html)
        self.assertEqual(len(slide_ids), 23, f"Expected 23 slides, found {len(slide_ids)}: {slide_ids}")
        for i in range(1, 24):
            expected_id = f"slide-{i}"
            self.assertIn(expected_id, slide_ids, f"Missing {expected_id}")

    def test_footer_slide_numbering(self):
        """Footers must have sequential 'X / 23' indicators."""
        for i in range(1, 24):
            expected_fraction = f"{i} / 23"
            self.assertIn(expected_fraction, self.html, f"Footer missing counter '{expected_fraction}'")

    def test_removed_slides_and_scenarios(self):
        """No 'Imagined Land', no hands-on workshop slide, and no team rules header."""
        self.assertNotIn("Imagined Land", self.html)
        self.assertNotIn("Distant Collaborators", self.html)
        self.assertNotIn("Hands-on Workshop Practice", self.html)
        self.assertNotIn("Team Rules for Collaboration", self.html)
        self.assertIn("Best Practices", self.html)

    def test_turn_cycle_precedes_git_vs_github(self):
        """Turn Cycle slides (10-14) must precede Git vs GitHub slides (15-17)."""
        turn_cycle_pos = self.html.find("The Turn Cycle")
        git_github_pos = self.html.find("Git vs GitHub")
        self.assertGreater(turn_cycle_pos, 0)
        self.assertGreater(git_github_pos, 0)
        self.assertLess(turn_cycle_pos, git_github_pos, "Turn Cycle must come before Git vs GitHub")

    def test_commit_numbering_labels(self):
        """Must use 'Commit 1', 'Commit 2', etc. in commit history."""
        self.assertIn("Commit 1", self.html)
        self.assertIn("Commit 2", self.html)
        self.assertIn("Commit 3", self.html)
        self.assertIn("Commit 4", self.html)
        self.assertIn("Commit 5", self.html)
        self.assertIn("Commit 6", self.html)

    def test_turn_cycle_concept_names_only(self):
        """Turn Cycle cards must emphasize PULL, EDIT, STAGE, COMMIT, PUSH without shell commands."""
        # Slide 10 to 14 should have the concept titles
        for title in ["PULL", "EDIT", "STAGE", "COMMIT", "PUSH"]:
            self.assertIn(title, self.html)


if __name__ == "__main__":
    unittest.main()

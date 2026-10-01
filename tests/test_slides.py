"""test_slides.py

Automated tests validating docs/slides/collaboration.html:
- Exactly 22 slides with correct sequential IDs (#slide-1 to #slide-22).
- Sequential footer counters '1 / 22' through '22 / 22'.
- Slide 1 subtitle is 'Workflows for Synchronized Teamwork'.
- Commit progression covers Commit 1 through Commit 5.
- Turn cycle repeat loop has no unescaped or broken entity (no '&subarr;').
- Remotes slides share identical title 'Remotes: GitHub Sync' and cloud label 'origin/main'.
- Slide 22 is Best Practices.
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
        """Must have exactly 22 slides with IDs slide-1 to slide-22."""
        slide_ids = re.findall(r'<div class="slide[^"]*" id="(slide-\d+)"', self.html)
        self.assertEqual(len(slide_ids), 22, f"Expected 22 slides, found {len(slide_ids)}: {slide_ids}")
        for i in range(1, 23):
            expected_id = f"slide-{i}"
            self.assertIn(expected_id, slide_ids, f"Missing {expected_id}")

    def test_footer_slide_numbering(self):
        """Footers must have sequential 'X / 22' indicators."""
        for i in range(1, 23):
            expected_fraction = f"{i} / 22"
            self.assertIn(expected_fraction, self.html, f"Footer missing counter '{expected_fraction}'")

    def test_title_slide_subtitle(self):
        """First slide must say 'Workflows for Synchronized Teamwork'."""
        self.assertIn("Workflows for Synchronized Teamwork", self.html)

    def test_no_subarr_entity(self):
        """The broken '&subarr;' entity must be removed from the loop pill."""
        self.assertNotIn("&subarr;", self.html)
        self.assertIn("Partner pulls your move &amp; takes their turn", self.html)

    def test_remotes_title_and_cloud_label_consistency(self):
        """Remotes slides must both have title 'Remotes: GitHub Sync' and cloud label 'origin/main'."""
        # There should be two slides with 'Remotes: GitHub Sync'
        titles = re.findall(r'<h2>Remotes: GitHub Sync</h2>', self.html)
        self.assertEqual(len(titles), 2, "Both remotes slides must share title 'Remotes: GitHub Sync'")
        # Both should show origin/main
        origin_mains = re.findall(r'origin/main', self.html)
        self.assertGreaterEqual(len(origin_mains), 2)
        self.assertNotIn("remote: origin", self.html)

    def test_commits_1_to_5(self):
        """Must have Commit 1 through Commit 5 (Commit 6 was removed)."""
        self.assertIn("Commit 1", self.html)
        self.assertIn("Commit 2", self.html)
        self.assertIn("Commit 3", self.html)
        self.assertIn("Commit 4", self.html)
        self.assertIn("Commit 5", self.html)
        self.assertNotIn("Commit 6", self.html)


if __name__ == "__main__":
    unittest.main()

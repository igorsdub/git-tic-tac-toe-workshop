"""test_web_guides.py

Automated tests validating the static HTML web guides:
- docs/setup.html (Pre-Session Setup Guide)
- docs/guide.html (In-Session Learner Guide)
- docs/guide-utils.js (Theme sync and copy utility)
- Shared navbar links in docs/index.html
"""

from __future__ import annotations

import unittest
from pathlib import Path


DOCS_DIR = Path(__file__).resolve().parent.parent / "docs"


class TestWebGuides(unittest.TestCase):
    """Test suite ensuring completeness and structural validity of docs/ web guides."""

    def setUp(self):
        self.index_html = (DOCS_DIR / "index.html").read_text(encoding="utf-8")
        self.setup_html = (DOCS_DIR / "setup.html").read_text(encoding="utf-8")
        self.guide_html = (DOCS_DIR / "guide.html").read_text(encoding="utf-8")
        self.guide_utils_js = (DOCS_DIR / "guide-utils.js").read_text(encoding="utf-8")

    def test_files_exist(self):
        self.assertTrue((DOCS_DIR / "setup.html").is_file())
        self.assertTrue((DOCS_DIR / "guide.html").is_file())
        self.assertTrue((DOCS_DIR / "guide-utils.js").is_file())

    def test_shared_navigation_links(self):
        """All three pages must contain the shared navigation bar."""
        pages = [
            ("index.html", self.index_html),
            ("setup.html", self.setup_html),
            ("guide.html", self.guide_html),
        ]
        for name, html in pages:
            with self.subTest(page=name):
                self.assertIn('class="nav-links"', html)
                self.assertIn('href="index.html"', html)
                self.assertIn('href="setup.html"', html)
                self.assertIn('href="guide.html"', html)
                self.assertIn('id="theme-toggle"', html)

    def test_setup_guide_content(self):
        """Setup guide must contain GitHub account, OS Git install, gh auth login, and email privacy."""
        self.assertIn("Pre-Session Setup Guide", self.setup_html)
        self.assertIn("Keep my email addresses private", self.setup_html)
        self.assertIn("noreply.github.com", self.setup_html)
        self.assertIn("gh auth login", self.setup_html)
        self.assertIn("xcode-select --install", self.setup_html)
        self.assertIn("git-scm.com/download/win", self.setup_html)
        self.assertIn("guide-utils.js", self.setup_html)

    def test_learner_guide_content(self):
        """Learner guide must contain Player X/O roles, 5-step turn cycle, commands, and branch rematch."""
        self.assertIn("How to Play Git Tic-Tac-Toe", self.guide_html)
        self.assertIn("Player X", self.guide_html)
        self.assertIn("Player O", self.guide_html)
        self.assertIn("git pull origin main", self.guide_html)
        self.assertIn("git add board.md", self.guide_html)
        self.assertIn("git push origin main", self.guide_html)
        self.assertIn("git log --oneline", self.guide_html)
        self.assertIn("rematch", self.guide_html)
        self.assertIn("guide-utils.js", self.guide_html)

    def test_copy_buttons_present(self):
        """Both guides must feature copy buttons for code snippets."""
        self.assertGreater(self.setup_html.count('class="copy-btn"'), 3)
        self.assertGreater(self.guide_html.count('class="copy-btn"'), 4)

    def test_guide_utils_logic(self):
        """guide-utils.js must implement theme sync and clipboard copy."""
        self.assertIn("ttt_gamewall_theme", self.guide_utils_js)
        self.assertIn("navigator.clipboard.writeText", self.guide_utils_js)


if __name__ == "__main__":
    unittest.main()

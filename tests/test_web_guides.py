"""test_web_guides.py

Automated tests validating the static HTML web guides:
- docs/setup.html (Setup Guide)
- docs/guide.html (In-Session Learner Guide)
- docs/guide-utils.js (Theme sync and copy utility)
- docs/styles.css (Jump navigation and guide styles)
- Shared navbar links in docs/index.html, docs/setup.html, docs/guide.html
- Markdown banners in LEARNER_GUIDE.md and PRE_SESSION_CHECK.md
"""

from __future__ import annotations

import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = REPO_ROOT / "docs"


class TestWebGuides(unittest.TestCase):
    """Test suite ensuring completeness and structural validity of docs/ web guides."""

    def setUp(self):
        self.index_html = (DOCS_DIR / "index.html").read_text(encoding="utf-8")
        self.setup_html = (DOCS_DIR / "setup.html").read_text(encoding="utf-8")
        self.guide_html = (DOCS_DIR / "guide.html").read_text(encoding="utf-8")
        self.guide_utils_js = (DOCS_DIR / "guide-utils.js").read_text(encoding="utf-8")
        self.styles_css = (DOCS_DIR / "styles.css").read_text(encoding="utf-8")
        self.learner_guide_md = (REPO_ROOT / "LEARNER_GUIDE.md").read_text(encoding="utf-8")
        self.pre_session_check_md = (REPO_ROOT / "PRE_SESSION_CHECK.md").read_text(encoding="utf-8")

    def test_files_exist(self):
        self.assertTrue((DOCS_DIR / "setup.html").is_file())
        self.assertTrue((DOCS_DIR / "guide.html").is_file())
        self.assertTrue((DOCS_DIR / "guide-utils.js").is_file())
        self.assertTrue((DOCS_DIR / "styles.css").is_file())
        self.assertTrue((REPO_ROOT / "LEARNER_GUIDE.md").is_file())
        self.assertTrue((REPO_ROOT / "PRE_SESSION_CHECK.md").is_file())

    def test_shared_navigation_links(self):
        """All three pages must contain shared navigation links (setup.html, guide.html) inside .nav-links without index.html inside nav-links."""
        pages = [
            ("index.html", self.index_html),
            ("setup.html", self.setup_html),
            ("guide.html", self.guide_html),
        ]
        for name, html in pages:
            with self.subTest(page=name):
                self.assertIn('class="nav-links"', html)
                nav_start = html.find('class="nav-links"')
                nav_end = html.find('</nav>', nav_start)
                nav_content = html[nav_start:nav_end]
                self.assertIn('href="setup.html"', nav_content)
                self.assertIn('href="guide.html"', nav_content)
                self.assertNotIn('href="index.html"', nav_content)
                self.assertIn('id="theme-toggle"', html)

    def test_quick_jump_navigation(self):
        """Guides must feature quick-jump navigation bars linking to page sections."""
        # Guide HTML quick jump
        self.assertIn('class="jump-nav"', self.guide_html)
        self.assertIn('class="jump-pill"', self.guide_html)
        for anchor in ['#roles-setup', '#turn-cycle', '#cheat-sheet', '#troubleshooting', '#rematch-extension']:
            self.assertIn(f'href="{anchor}"', self.guide_html)

        # Setup HTML quick jump
        self.assertIn('class="jump-nav"', self.setup_html)
        self.assertIn('class="jump-pill"', self.setup_html)
        for anchor in ['#step-github', '#step-install', '#step-auth', '#step-verify']:
            self.assertIn(f'href="{anchor}"', self.setup_html)

        # Stylesheet rules for jump navigation
        self.assertIn('.jump-nav', self.styles_css)
        self.assertIn('.jump-pill', self.styles_css)

    def test_setup_guide_content(self):
        """Setup guide must contain Setup Guide title, section titles, GitHub account, OS Git install, gh auth login, and email privacy."""
        self.assertIn("Setup Guide", self.setup_html)
        self.assertIn("GitHub Account & Privacy", self.setup_html)
        self.assertIn("Install Git", self.setup_html)
        self.assertIn("Authenticate & Configure", self.setup_html)
        self.assertIn("Verification", self.setup_html)
        self.assertIn("Keep my email addresses private", self.setup_html)
        self.assertIn("noreply.github.com", self.setup_html)
        self.assertIn("gh auth login", self.setup_html)
        self.assertIn("xcode-select --install", self.setup_html)
        self.assertIn("git-scm.com/download/win", self.setup_html)
        self.assertIn("guide-utils.js", self.setup_html)

    def test_learner_guide_content(self):
        """Learner guide must contain section titles, Player X/O roles, 5-step turn cycle, commands, and branch rematch."""
        self.assertIn("How to Play Git Tic-Tac-Toe", self.guide_html)
        self.assertIn("Initial Setup", self.guide_html)
        self.assertIn("The Turn Cycle", self.guide_html)
        self.assertIn("Git Quick Reference", self.guide_html)
        self.assertIn("Troubleshooting", self.guide_html)
        self.assertIn("Branch Rematch (Optional)", self.guide_html)
        self.assertIn("Player X", self.guide_html)
        self.assertIn("Player O", self.guide_html)
        self.assertIn("git pull origin main", self.guide_html)
        self.assertIn("git add board.md", self.guide_html)
        self.assertIn("git push origin main", self.guide_html)
        self.assertIn("git log --oneline", self.guide_html)
        self.assertIn("rematch", self.guide_html)
        self.assertIn("guide-utils.js", self.guide_html)

    def test_copy_buttons_and_accessibility(self):
        """Both guides must feature copy buttons with accessibility aria-labels, accounting for 3 separate git config blocks."""
        self.assertEqual(self.setup_html.count('class="copy-btn"'), 8)
        self.assertEqual(self.guide_html.count('class="copy-btn"'), 9)
        self.assertIn('aria-label="Copy command to clipboard"', self.setup_html)
        self.assertIn('aria-label="Copy command to clipboard"', self.guide_html)

    def test_guide_utils_logic(self):
        """guide-utils.js must implement theme sync, clipboard copy, and fallback."""
        self.assertIn("ttt_gamewall_theme", self.guide_utils_js)
        self.assertIn("navigator.clipboard.writeText", self.guide_utils_js)
        self.assertIn("execCommand", self.guide_utils_js)
        self.assertIn("Copy command to clipboard", self.guide_utils_js)

    def test_markdown_interactive_banners(self):
        """Markdown guides must include top banners linking to interactive web guides."""
        self.assertIn("docs/guide.html", self.learner_guide_md)
        self.assertIn("docs/setup.html", self.learner_guide_md)
        self.assertIn("1-click", self.learner_guide_md)

        self.assertIn("docs/setup.html", self.pre_session_check_md)
        self.assertIn("docs/guide.html", self.pre_session_check_md)
        self.assertIn("1-click", self.pre_session_check_md)


if __name__ == "__main__":
    unittest.main()

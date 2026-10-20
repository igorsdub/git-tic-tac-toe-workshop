"""Static checks for the public Codespaces, Source Control, and instructor guides."""

from __future__ import annotations

import re
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = REPO_ROOT / "docs"


class TestWebGuides(unittest.TestCase):
    def setUp(self):
        self.index = (DOCS_DIR / "index.html").read_text(encoding="utf-8")
        self.setup = (DOCS_DIR / "setup.html").read_text(encoding="utf-8")
        self.guide = (DOCS_DIR / "guide.html").read_text(encoding="utf-8")
        self.utils = (DOCS_DIR / "guide-utils.js").read_text(encoding="utf-8")
        self.styles = (DOCS_DIR / "styles.css").read_text(encoding="utf-8")

    def test_guide_assets_exist(self):
        for path in (DOCS_DIR / "setup.html", DOCS_DIR / "guide.html", DOCS_DIR / "guide-utils.js", DOCS_DIR / "styles.css"):
            self.assertTrue(path.is_file(), str(path))

    def test_shared_navigation_and_repository_link(self):
        repo_url = "https://github.com/igorsdub/git-tic-tac-toe-workshop"
        for name, html in (("wall", self.index), ("setup", self.setup), ("learner", self.guide)):
            with self.subTest(page=name):
                nav_start = html.index('class="nav-links"')
                nav_end = html.index("</nav>", nav_start)
                nav = html[nav_start:nav_end]
                self.assertIn('href="setup.html"', nav)
                self.assertIn('href="guide.html"', nav)
                self.assertIn('id="theme-toggle"', html)
        self.assertIn(f'href="{repo_url}"', self.index)
        self.assertIn('aria-label="View repository on GitHub"', self.index)

    def test_quick_jump_links_target_real_guide_sections(self):
        for name, html, expected in (
            ("learner", self.guide, ("setup", "turn", "rematch", "recovery")),
            ("setup", self.setup, ("rehearsal", "access", "survey")),
        ):
            with self.subTest(page=name):
                nav = html[html.index('class="jump-nav"'):]
                section_ids = set(re.findall(r'<section[^>]+id="([^"]+)"', html))
                for anchor in expected:
                    self.assertIn(f'href="#{anchor}"', nav)
                    self.assertIn(anchor, section_ids)
        self.assertIn(".jump-nav", self.styles)
        self.assertIn(".jump-pill", self.styles)

    def test_setup_preflight_and_separate_copilot_access(self):
        for requirement in (
            "Use this template → Create a new repository",
            "Make the repository public",
            "Keep the public repository and Codespace",
            "separate Codespaces",
            "select <strong>Ask</strong>",
            "What does this repository do?",
            "No board edit is required",
            "Codespaces and Copilot access are separate",
            "manual rematch path",
        ):
            self.assertIn(requirement, self.setup)

    def test_survey_is_not_presented_as_ready_for_learners(self):
        survey = self.setup[self.setup.index('id="survey"'):]
        self.assertIn("unpublished draft", survey)
        self.assertIn("not accepting responses", survey)
        self.assertIn("no survey action is required", survey)

    def test_learner_match_uses_the_approved_source_control_contract(self):
        for requirement in ("Source Control", "BOARD.txt", "match-01", "clean <code>main</code>", "Stage <code>BOARD.txt</code>", "rematch manually"):
            self.assertIn(requirement, self.guide)
        self.assertIn("Place X in the center of the board", self.guide)
        self.assertIn("GitHub commit history", self.guide)
        self.assertIn("instructor demonstration, not a participant exercise", self.guide)

    def test_guide_utility_keeps_theme_and_copy_fallback(self):
        self.assertIn("ttt_gamewall_theme", self.utils)
        self.assertIn("navigator.clipboard.writeText", self.utils)
        self.assertIn("execCommand", self.utils)
        self.assertIn("Copy command to clipboard", self.utils)


if __name__ == "__main__":
    unittest.main()

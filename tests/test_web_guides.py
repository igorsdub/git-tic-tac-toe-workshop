"""Static checks for the public Codespaces, Source Control, and instructor guides."""

from __future__ import annotations

import json
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
        self.context = (DOCS_DIR / "workshop-context.js").read_text(encoding="utf-8")
        self.styles = (DOCS_DIR / "styles.css").read_text(encoding="utf-8")

    def test_guide_assets_exist(self):
        for path in (DOCS_DIR / "setup.html", DOCS_DIR / "guide.html", DOCS_DIR / "guide-utils.js", DOCS_DIR / "workshop-context.js", DOCS_DIR / "styles.css"):
            self.assertTrue(path.is_file(), str(path))

    def test_shared_workshop_context_is_configured_on_all_routes(self):
        catalog = json.loads((DOCS_DIR / "workshops.json").read_text(encoding="utf-8"))
        expected = {
            "2026-10-01-scda": ("SCDA Training Week", "2026-10-01"),
            "2026-11-06-sokedai": ("Sokedai", "2026-11-06"),
            "2026-11-10-riken": ("Riken", "2026-11-10"),
        }
        self.assertEqual(catalog["defaultWorkshopId"], "2026-10-01-scda")
        self.assertEqual({item["id"]: (item["name"], item["date"]) for item in catalog["workshops"]}, expected)
        for name, html in (("wall", self.index), ("learner", self.guide), ("setup", self.setup)):
            with self.subTest(page=name):
                header = html[:html.index("</header>")]
                self.assertIn('class="header-workshop-picker"', header)
                self.assertIn('<label for="workshop-select"', header)
                self.assertIn('id="workshop-select"', header)
                self.assertNotIn('id="current-workshop-name"', html)
                self.assertNotIn('id="current-workshop-date"', html)
                self.assertNotIn('id="current-workshop-note"', html)
                self.assertIn('data-workshop-registration', html)
                self.assertIn('data-workshop-dashboard', html)
                self.assertIn('src="workshop-context.js"', html)
                actions_start = html.index('<section class="workshop-actions"')
                actions_end = html.index('</section>', actions_start)
                actions = html[actions_start:actions_end]
                self.assertIn('data-workshop-registration', actions)
                self.assertIn('data-workshop-dashboard', actions)
                self.assertIn('View all games', actions)
        self.assertIn("function formatWorkshopOption(workshop)", self.context)
        self.assertIn("month: 'short'", self.context)
        self.assertIn("String(workshop.name).toUpperCase()", self.context)
        self.assertIn('data-workshop-route href="guide.html"', self.setup)
        workshop_instructions = self.guide[
            self.guide.index('<section class="guide-section"><h2>Workshop setup</h2>'):]
        workshop_instructions = workshop_instructions.split('</section>', 1)[0]
        self.assertNotIn("workshop_id=2026-10-01-scda", workshop_instructions)

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
            ("setup", self.setup, ("survey", "getting-started", "checklist", "access")),
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

    def test_setup_order_and_preparation_links_are_current(self):
        survey_url = "https://docs.google.com/forms/d/e/1FAIpQLSfLyChJpWXVWAoScFT5XNU68FZxRMuR4Nv0AN9HUSvOE8v1EA/viewform?usp=header"
        self.assertLess(self.setup.index('id="survey"'), self.setup.index('id="getting-started"'))
        self.assertLess(self.setup.index('id="getting-started"'), self.setup.index('id="checklist"'))
        survey = self.setup[self.setup.index('id="survey"'):self.setup.index('id="getting-started"')]
        self.assertIn(survey_url, survey)
        self.assertNotIn("<iframe", survey.casefold())
        getting_started = self.setup[self.setup.index('id="getting-started"'):self.setup.index('id="checklist"')]
        self.assertIn("https://github.com/signup", getting_started)
        self.assertIn("https://education.github.com/pack", getting_started)
        self.assertIn("Optional: eligible students can apply", getting_started)
        self.assertIn("GitHub verifies student status", getting_started)
        self.assertIn("not required for this workshop or Codespaces", getting_started)
        self.assertIn('id="checklist"', self.setup)

    def test_learner_match_and_registration_use_the_workshop_contract(self):
        for requirement in ("Source Control", "BOARD.txt", "match-01", "clean <code>main</code>", "Stage <code>BOARD.txt</code>", "rematch manually"):
            self.assertIn(requirement, self.guide)
        self.assertIn("Place X in the center of the board", self.guide)
        for requirement in (
            "register your pair's shared repository once",
            "both player GitHub handles",
            "successful registration comment confirms",
            "successful refresh finds the branch",
            "literal lowercase prefix <code>match</code>",
            "one card per discovered public match branch",
            "Archived workshops remain visible",
            "reject new repository registrations",
        ):
            self.assertIn(requirement.casefold(), self.guide.casefold())
        self.assertNotIn("Register each match with its numbered branch", self.guide)
        self.assertNotIn("Existing branchless records cannot be replayed", self.guide)
        self.assertIn("instructor demonstration, not a participant exercise", self.guide)

    def test_repository_registration_contract_is_consistent_in_markdown_guides(self):
        readme = (REPO_ROOT / "README.md").read_text(encoding="utf-8")
        learner = (REPO_ROOT / "LEARNER_GUIDE.md").read_text(encoding="utf-8")
        facilitator = (REPO_ROOT / "FACILITATOR_GUIDE.md").read_text(encoding="utf-8")
        context = (REPO_ROOT / "CONTEXT.md").read_text(encoding="utf-8")
        for content in (learner, facilitator):
            self.assertIn("workshop_id=2026-10-01-scda", content)
            self.assertIn("registers its shared repository once", content)
            self.assertIn("successful registration comment", content)
            self.assertIn("successful refresh", content)
            self.assertIn("Archived workshops", content)
        self.assertIn("five legacy SCDA repositories", readme)
        self.assertIn("Default Event", readme)
        self.assertIn("2026-10-01-scda", facilitator)
        self.assertIn("Register repository", context)
        self.assertIn("literal lowercase prefix `match`", context)

    def test_guide_utility_keeps_theme_and_copy_fallback(self):
        self.assertIn("ttt_gamewall_theme", self.utils)
        self.assertIn("navigator.clipboard.writeText", self.utils)
        self.assertIn("execCommand", self.utils)
        self.assertIn("Copy command to clipboard", self.utils)


if __name__ == "__main__":
    unittest.main()

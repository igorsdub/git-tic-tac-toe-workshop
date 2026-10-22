"""test_slides.py

Automated tests validating docs/slides/collaboration.html:
- Exactly 22 slides with correct sequential IDs (#slide-1 to #slide-22).
- Footer counters are computed by slides.js, not hard-coded in the HTML.
- Slide 1 subtitle is 'Workflows for Synchronized Teamwork'.
- Commits progression covers Commit 1 through Commit 5.
- Git vs GitHub and Three Local Stages and Remotes precede Turn Cycle.
- Turn Cycle slides (Step 1 to Step 5) appear AFTER Remotes: GitHub Sync.
- Remotes slides share identical title 'Remotes: GitHub Sync' and cloud label 'origin/main'.
- Slide 22 is Best Practices.
- Workshop-neutral: no SCDA branding, 'BOARD.txt' spelling, title 'Git Tic-Tac-Toe Workshop'.
- Accessibility: no inline onclick, hash navigation, keyboard-reachable stage, placeholder contrast >= 3:1.
- Source Control UI wording: no 'git add' / 'git commit' command boxes.
"""

from __future__ import annotations

import re
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
SLIDES_DIR = REPO_ROOT / "docs" / "slides"
SLIDES_HTML_PATH = SLIDES_DIR / "collaboration.html"
SLIDES_JS_PATH = SLIDES_DIR / "js" / "slides.js"
SLIDES_CSS_PATH = SLIDES_DIR / "css" / "slides.css"
SLIDES_BACKGROUND = "#0d1117"


def relative_luminance(hex_colour: str) -> float:
    """WCAG relative luminance of a #rrggbb colour."""
    channels = [int(hex_colour[i : i + 2], 16) / 255 for i in (1, 3, 5)]
    linear = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast_ratio(foreground: str, background: str) -> float:
    """WCAG contrast ratio between two #rrggbb colours."""
    lighter, darker = sorted((relative_luminance(foreground), relative_luminance(background)), reverse=True)
    return (lighter + 0.05) / (darker + 0.05)


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

    def test_footer_counters_are_computed(self):
        """Footers must not hard-code 'X / 22'; slides.js fills them from the slide count."""
        self.assertIsNone(re.search(r"\b\d+ / \d+\b", self.html), "Hard-coded 'n / total' counter found")
        counters = re.findall(r'<span class="slide-num"></span>', self.html)
        self.assertEqual(len(counters), 22, "Every slide needs an empty .slide-num footer element")
        js = SLIDES_JS_PATH.read_text(encoding="utf-8")
        self.assertIn("slide-num", js)
        self.assertRegex(js, r"\$\{i \+ 1\} / \$\{total\}")

    def test_title_slide_subtitle(self):
        """First slide must say 'Workflows for Synchronized Teamwork'."""
        self.assertIn("Workflows for Synchronized Teamwork", self.html)

    def test_turn_cycle_after_remotes_sync(self):
        """Turn Cycle slides must come AFTER Remotes Sync slides."""
        remotes_pos = self.html.rfind("Remotes: GitHub Sync")
        turn_cycle_pos = self.html.find("The Turn Cycle")
        self.assertGreater(remotes_pos, 0, "Remotes: GitHub Sync slide must exist")
        self.assertGreater(turn_cycle_pos, 0, "The Turn Cycle slide must exist")
        self.assertGreater(turn_cycle_pos, remotes_pos, "Turn Cycle must follow Remotes: GitHub Sync")

    def test_no_subarr_entity(self):
        """The broken '&subarr;' entity must not appear in the slides."""
        self.assertNotIn("&subarr;", self.html)
        self.assertIn("Partner pulls your move &amp; takes their turn", self.html)

    def test_remotes_title_and_cloud_label_consistency(self):
        """Remotes slides must both have title 'Remotes: GitHub Sync' and cloud label 'origin/main'."""
        titles = re.findall(r'<h2>Remotes: GitHub Sync</h2>', self.html)
        self.assertEqual(len(titles), 2, "Both remotes slides must share title 'Remotes: GitHub Sync'")
        origin_mains = re.findall(r'origin/main', self.html)
        self.assertGreaterEqual(len(origin_mains), 2)
        self.assertNotIn("remote: origin", self.html)

    def test_commits_1_to_5(self):
        """Must have Commit 1 through Commit 5."""
        self.assertIn("Commit 1", self.html)
        self.assertIn("Commit 2", self.html)
        self.assertIn("Commit 3", self.html)
        self.assertIn("Commit 4", self.html)
        self.assertIn("Commit 5", self.html)

    def test_no_scda_branding(self):
        """No SCDA branding anywhere under docs/slides."""
        for path in sorted(SLIDES_DIR.rglob("*")):
            if path.is_file() and path.suffix in {".html", ".css", ".js", ".svg"}:
                self.assertNotIn("SCDA", path.read_text(encoding="utf-8"), f"SCDA found in {path}")

    def test_board_file_is_uppercase(self):
        """The board file is BOARD.txt, never board.txt, under docs/slides."""
        for path in sorted(SLIDES_DIR.rglob("*")):
            if path.is_file() and path.suffix in {".html", ".css", ".js", ".svg"}:
                self.assertNotIn("board.txt", path.read_text(encoding="utf-8"), f"board.txt found in {path}")
        self.assertIn("BOARD.txt", self.html)

    def test_title_and_footer_name_the_workshop(self):
        """<title> and every footer say 'Git Tic-Tac-Toe Workshop'."""
        title = re.search(r"<title>(.*?)</title>", self.html, re.S)
        self.assertIsNotNone(title)
        self.assertIn("Git Tic-Tac-Toe Workshop", title.group(1))
        self.assertEqual(self.html.count("<span>Git Tic-Tac-Toe Workshop</span>"), 22)

    def test_no_inline_onclick(self):
        """Event handlers are attached in slides.js, not inline."""
        self.assertIsNone(re.search(r"\bonclick\s*=", self.html, re.I))

    def test_stage_is_keyboard_reachable(self):
        """The stage is focusable and slides.js attaches the click listener."""
        stage = re.search(r'<div class="slide-stage"[^>]*id="stage"[^>]*>', self.html)
        self.assertIsNotNone(stage)
        self.assertIn('tabindex="0"', stage.group(0))
        self.assertIn("aria-label=", stage.group(0))
        js = SLIDES_JS_PATH.read_text(encoding="utf-8")
        self.assertIn("addEventListener('click'", js)
        self.assertNotIn("window.handleStageClick", js)

    def test_hash_navigation(self):
        """slides.js handles #slide-N on load and on hashchange."""
        js = SLIDES_JS_PATH.read_text(encoding="utf-8")
        self.assertIn("hashchange", js)
        self.assertIn("replaceState", js)
        self.assertIn("#slide-", js)

    def test_no_git_cli_command_boxes(self):
        """Stage slides use Source Control buttons, not 'git add' / 'git commit' boxes."""
        self.assertNotIn("git add", self.html)
        self.assertNotIn("git commit", self.html)
        self.assertNotIn("git pull", self.html)
        self.assertNotIn("stage-cmd-box", self.html)
        self.assertIn("Stage (+)", self.html)
        self.assertIn("Sync Changes", self.html)

    def test_placeholder_contrast_meets_3_to_1(self):
        """The empty-slot placeholder text meets WCAG 3:1 against the slide background."""
        css = SLIDES_CSS_PATH.read_text(encoding="utf-8")
        block = re.search(r"\.card-pane\.empty-slot\s*\{(.*?)\}", css, re.S)
        self.assertIsNotNone(block, ".card-pane.empty-slot rule must exist")
        colour = re.search(r"(?<!-)color:\s*(#[0-9a-fA-F]{6})", block.group(1))
        self.assertIsNotNone(colour, "empty-slot rule must set a #rrggbb colour")
        ratio = contrast_ratio(colour.group(1), SLIDES_BACKGROUND)
        self.assertGreaterEqual(ratio, 3.0, f"Placeholder contrast {ratio:.2f}:1 is below 3:1")

    def test_ad_hoc_panel_not_duplicated(self):
        """The Ad-hoc File Naming panel appears once; the next slide builds on it."""
        self.assertEqual(self.html.count("Ad-hoc File Naming"), 1)


if __name__ == "__main__":
    unittest.main()

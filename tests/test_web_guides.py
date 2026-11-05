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
        self.index = (DOCS_DIR / "wall.html").read_text(encoding="utf-8")
        self.home = (DOCS_DIR / "index.html").read_text(encoding="utf-8")
        self.setup = (DOCS_DIR / "setup.html").read_text(encoding="utf-8")
        self.guide = (DOCS_DIR / "guide.html").read_text(encoding="utf-8")
        self.utils = (DOCS_DIR / "guide-utils.js").read_text(encoding="utf-8")
        self.theme_init = (DOCS_DIR / "theme-init.js").read_text(encoding="utf-8")
        self.context = (DOCS_DIR / "workshop-context.js").read_text(encoding="utf-8")
        self.styles = (DOCS_DIR / "styles.css").read_text(encoding="utf-8")

    def test_stage_strip_on_all_learner_pages(self):
        pages = {"wall.html": "wall", "guide.html": "guide", "setup.html": "setup"}
        for name, stage in pages.items():
            with self.subTest(page=name):
                html = (DOCS_DIR / name).read_text(encoding="utf-8")
                marker = f'data-stage-strip="{stage}"'
                self.assertIn(marker, html)
                self.assertLess(html.index(marker), html.index("</header>"))
                self.assertIn('src="stage-strip.js"', html)
                self.assertLess(html.index('src="stage-strip.js"'), html.index('src="workshop-context.js"'))
        setup = (DOCS_DIR / "setup.html").read_text(encoding="utf-8")
        guide = (DOCS_DIR / "guide.html").read_text(encoding="utf-8")
        wall = (DOCS_DIR / "wall.html").read_text(encoding="utf-8")
        self.assertIn('<a data-workshop-route href="guide.html">Next: How to play</a>', setup)
        self.assertIn('<a data-workshop-route href="wall.html">Next: Game Wall</a>', guide)
        self.assertIn('<a data-workshop-route href="setup.html">Back to start: Setup</a>', wall)

    def test_guide_assets_exist(self):
        for path in (DOCS_DIR / "setup.html", DOCS_DIR / "guide.html", DOCS_DIR / "guide-utils.js", DOCS_DIR / "workshop-context.js", DOCS_DIR / "styles.css"):
            self.assertTrue(path.is_file(), str(path))

    def test_workshop_catalog_setup_fields(self):
        catalog = json.loads((DOCS_DIR / "workshops.json").read_text(encoding="utf-8"))
        by_id = {item["id"]: item for item in catalog["workshops"]}
        self.assertEqual(by_id["2026-10-01-scda"]["status"], "archived")
        self.assertNotIn("setupTrack", by_id["2026-10-01-scda"])
        self.assertEqual(by_id["2026-11-06-sokedai"]["setupTrack"], "codespaces")
        self.assertEqual(by_id["2026-11-06-sokedai"]["surveyUrl"], "https://forms.gle/eo9pgChEGpdvdcQ67")
        self.assertEqual(by_id["2026-11-10-riken"]["setupTrack"], "codespaces")
        for item in catalog["workshops"]:
            if "setupTrack" in item:
                self.assertIn(item["setupTrack"], {"codespaces", "local"})
            if "surveyUrl" in item:
                self.assertTrue(item["surveyUrl"].startswith("https://"))

    def test_shared_workshop_context_is_configured_on_all_routes(self):
        catalog = json.loads((DOCS_DIR / "workshops.json").read_text(encoding="utf-8"))
        expected = {
            "2026-10-01-scda": ("SCDA Training Week", "2026-10-01"),
            "2026-11-06-sokedai": ("SOKENDAI", "2026-11-06"),
            "2026-11-10-riken": ("RIKEN", "2026-11-10"),
        }
        self.assertEqual(catalog["defaultWorkshopId"], "2026-11-06-sokedai")
        self.assertEqual({item["id"]: (item["name"], item["date"]) for item in catalog["workshops"]}, expected)
        self.assertNotIn('data-workshop-registration', self.setup)
        for name, html in (("wall", self.index), ("learner", self.guide), ("setup", self.setup)):
            with self.subTest(page=name):
                header = html[:html.index("</header>")]
                self.assertIn('class="header-workshop-picker"', header)
                self.assertIn('<label for="workshop-select"', header)
                self.assertIn('id="workshop-select"', header)
                self.assertNotIn('id="current-workshop-name"', html)
                self.assertNotIn('id="current-workshop-date"', html)
                self.assertNotIn('id="current-workshop-note"', html)
                self.assertIn('src="workshop-context.js"', html)
                self.assertNotIn('class="workshop-actions"', html)
        self.assertIn("function formatWorkshopOption(workshop)", self.context)
        self.assertIn("month: 'short'", self.context)
        self.assertIn("String(workshop.name).toUpperCase()", self.context)
        self.assertIn('data-workshop-route href="guide.html"', self.setup)
        first_section = self.guide[self.guide.index('<section class="guide-section" id="turn">'):]
        first_section = first_section.split('</section>', 1)[0]
        self.assertNotIn("workshop_id=2026-10-01-scda", first_section)

    def test_shared_navigation_and_repository_link(self):
        repo_url = "https://github.com/igorsdub/git-tic-tac-toe-workshop"
        for name, html in (("wall", self.index), ("setup", self.setup), ("learner", self.guide)):
            with self.subTest(page=name):
                header = html[:html.index('</header>')]
                self.assertIn('data-stage-strip=', header)
                self.assertIn('id="theme-toggle"', header)
                self.assertNotIn('class="nav-links"', header)
                self.assertNotIn('🌙', header)
                self.assertNotIn('🎮', html[:html.index('</header>')])
                self.assertIn('id="brand-logo"', html)
                self.assertIn('id="theme-favicon"', html)
                self.assertIn('images/xo-logo-light.svg', html)
                self.assertIn('images/xo-logo-dark.svg', html)
        self.assertIn(f'href="{repo_url}"', self.index)
        self.assertIn('aria-label="View repository on GitHub"', self.index)

    def test_xo_logo_and_favicon_follow_saved_theme(self):
        for asset, expected_fill, expected_stroke in (
            ("xo-logo-light.svg", '#ffffff', '#111827'),
            ("xo-logo-dark.svg", '#09090b', '#ffffff'),
        ):
            svg = (DOCS_DIR / "images" / asset).read_text(encoding="utf-8")
            self.assertIn(f'fill="{expected_fill}"', svg)
            self.assertIn(f'stroke="{expected_stroke}"', svg)
        # theme-init.js owns the storage key and the logo/favicon swap; the page scripts only call it.
        self.assertIn("ttt_gamewall_theme", self.theme_init)
        self.assertIn("images/xo-logo-dark.svg", self.theme_init)
        self.assertIn("images/xo-logo-light.svg", self.theme_init)
        self.assertIn("logo.setAttribute('src',", self.theme_init)
        self.assertIn("favicon.setAttribute('href', logoAsset)", self.theme_init)
        for script in (self.utils, (DOCS_DIR / "app.js").read_text(encoding="utf-8")):
            self.assertNotIn("ttt_gamewall_theme", script)
            self.assertNotIn("xo-logo", script)
        self.assertIn(".brand-link:hover .brand-text h1", self.styles)
        self.assertIn('[data-theme="dark"] .brand-link:hover .brand-text h1', self.styles)
        self.assertIn(".nav-links {\n    width: auto;\n    order: 0;", self.styles)

    def test_quick_jump_links_target_real_guide_sections(self):
        for name, html, expected in (
            ("learner", self.guide, ("turn", "rematch")),
            ("setup", self.setup, ("step-survey", "step-account", "step-repo", "step-codespace", "step-look-around", "step-delete")),
        ):
            with self.subTest(page=name):
                nav = html[html.index('class="jump-nav"'):]
                section_ids = set(re.findall(r'<(?:section|article)[^>]+id="([^"]+)"', html))
                for anchor in expected:
                    self.assertIn(f'href="#{anchor}"', nav)
                    self.assertIn(anchor, section_ids)
        self.assertIn(".jump-nav", self.styles)
        self.assertIn(".jump-pill", self.styles)

    def test_setup_page_content(self):
        for requirement in (
            "https://github.com/igorsdub/git-tic-tac-toe-template",
            "Use this template",
            "Create codespace on main",
            "<strong>Delete</strong>",
            "What is this project?",
            "Codespaces and Copilot access are separate",
            "manual rematch path",
            "https://github.com/signup",
            'id="setup-archived"',
            'id="setup-pending"',
            'id="setup-codespaces"',
            'data-setup-track="codespaces"',
            "This workshop has finished.",
            "Setup for this workshop is not published yet",
            'id="setup-error"',
            "Workshop details could not be loaded",
            'src="setup.js"',
        ):
            self.assertIn(requirement, self.setup)
        self.assertLess(self.setup.index('src="workshop-context.js"'), self.setup.index('src="setup.js"'))
        for step in ("step-survey", "step-account", "step-repo", "step-codespace", "step-look-around", "step-delete"):
            self.assertIn(f'<input type="checkbox" class="step-check" data-step="{step}" id="check-{step}">', self.setup)
        for old in ("docs.google.com/forms", "Keep the public repository and Codespace"):
            self.assertNotIn(old, self.setup)

    def test_setup_manual_picture_sections_follow_user_sequence(self):
        headings = (
            ("2", "Create a repository from the template"),
            ("3", "Test Codespaces and GitHub Copilot"),
            ("4", "Clean up"),
        )
        for number, heading in headings:
            self.assertIn(f'<span class="step-num">{number}</span> {heading}', self.setup)
        self.assertEqual(self.setup.count('class="setup-guide-section"'), 3)

        manual = self.setup[self.setup.index('id="guide-template"'):self.setup.index('id="setup-next"')]
        files = re.findall(r'src="(images/setup/manual-images/[^"]+\.png)"', manual)
        self.assertEqual(len(files), 28)
        self.assertEqual(sum("/01-template/" in name for name in files), 9)
        self.assertEqual(sum("/02-codepaces/" in name for name in files), 12)
        self.assertEqual(sum("/03-cleaning-up/" in name for name in files), 7)
        self.assertEqual(files, sorted(files))
        self.assertIn("Autopilot", manual)
        self.assertIn("What is this project?", manual)
        self.assertIn("Copilot", manual)
        self.assertNotIn("Codex", manual)
        for figure in re.findall(r'<figure class="step-shot">(.*?)</figure>', manual):
            self.assertLess(figure.index("shot-instruction"), figure.index("<img"))
            self.assertIn('target="_blank"', figure)

    def test_setup_cleanup_actions_match_manual_screenshots(self):
        start = self.setup.index('id="step-delete"')
        cleanup = self.setup[start:self.setup.index('</section>', self.setup.index('id="guide-cleanup"'))]
        for asset in ("00-home.png", "01-menu.png", "02-select-codespace.png", "03-codespace-actions.png", "04-select-delete.png", "05-delete.png", "06-done.png"):
            self.assertIn(asset, cleanup)
        for action in ("GitHub home", "left navigation", "Codespaces", "Delete", "deleted"):
            self.assertIn(action, cleanup)
        self.assertIn("Open the top-left navigation.", cleanup)
        self.assertIn("Open the ··· menu for the Codespace you created.", cleanup)
        self.assertIn('<h2 id="setup-completion-heading">Done!</h2>', cleanup)

    def test_setup_media_never_shows_broken_icons(self):
        for tag in re.findall(r"<(?:img|video)\b[^>]*>", self.setup[self.setup.index("<main"):]):
            if tag.startswith("<img"):
                self.assertIn("onerror=", tag, tag)
            else:
                self.assertNotIn("onerror=", tag, tag)

    def test_automated_capture_contract_is_separate_from_manual_setup_images(self):
        manifest = json.loads((REPO_ROOT / "scripts" / "capture" / "captures.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["imageRoot"], "images/setup")
        self.assertEqual([step["slug"] for step in manifest["steps"]], ["create-repo", "open-codespace", "look-around", "delete-codespace"])

        manual_root = DOCS_DIR / "images" / "setup" / "manual-images"
        expected = {f"images/setup/manual-images/{folder.name}/{image.name}"
                    for folder in sorted(manual_root.iterdir()) for image in sorted(folder.glob("*.png"))}
        referenced = set(re.findall(r'src="(images/setup/manual-images/[^"]+\.png)"', self.setup))
        self.assertEqual(referenced, expected)
        self.assertEqual(len(referenced), 28)
        for asset in referenced:
            with self.subTest(asset=asset):
                path = DOCS_DIR / asset
                self.assertTrue(path.is_file(), f"missing manual setup image: {asset}")
                self.assertTrue(path.read_bytes().startswith(b"\x89PNG\r\n\x1a\n"), f"invalid PNG: {asset}")

    def test_learner_match_and_registration_use_the_workshop_contract(self):
        for requirement in ("Source Control", "BOARD.txt", "match-01", "clean <code>main</code>", "stage <code>BOARD.txt</code> with <strong>+</strong>", "make the move manually"):
            self.assertIn(requirement, self.guide)
        self.assertIn("Place X in the center of the board", self.guide)
        ordered_sections = [self.guide.index(f'id="{section}"') for section in ("turn", "rematch")]
        self.assertEqual(ordered_sections, sorted(ordered_sections))
        for heading in ("One move and repeat", "Rematch"):
            self.assertIn(f"<h2>{heading}</h2>", self.guide)
        self.assertEqual(self.guide.count('<section class="guide-section"'), 5)
        self.assertNotIn("then commit and push.", self.guide)
        for cmd in ("git pull --no-rebase", "git add BOARD.txt", "git fetch", "git switch match-01", "git switch -c match-02", "git push -u origin match-02"):
            self.assertIn(cmd, self.guide)
            self.assertIn(cmd, (REPO_ROOT / "LEARNER_GUIDE.md").read_text(encoding="utf-8"))
        self.assertLess(self.guide.index('id="terminal"'), self.guide.index('class="stage-next"'))
        self.assertIn("<h2>Taking turns and fixing a conflict</h2>", self.guide)
        self.assertIn('href="time-machine.html"', self.guide)
        self.assertNotIn("Workshop setup", self.guide)
        self.assertNotIn("History as a time machine", self.guide)
        self.assertIn("create a branch named <code>match-02</code>", self.guide)
        self.assertIn("partner fetches <code>match-02</code>, switches to it, and pulls", self.guide)
        self.assertIn("select <strong>Agent</strong> mode", self.guide)
        self.assertIn("follow the instructor’s Copilot demonstration", self.guide)
        for requirement in (
            "register it once",
            "both player GitHub handles",
            "successful registration comment confirms",
            "lowercase <code>match</code>",
            "separate cards",
        ):
            self.assertIn(requirement.casefold(), self.guide.casefold())
        for old in ("Rewind", "rewind", "Checkout (Detached)", "force-push"):
            self.assertNotIn(old, self.guide)
        self.assertNotIn("Register each match with its numbered branch", self.guide)
        self.assertNotIn("Existing branchless records cannot be replayed", self.guide)

    def test_repository_registration_contract_is_consistent_in_markdown_guides(self):
        readme = (REPO_ROOT / "README.md").read_text(encoding="utf-8")
        learner = (REPO_ROOT / "LEARNER_GUIDE.md").read_text(encoding="utf-8")
        facilitator = (REPO_ROOT / "FACILITATOR_GUIDE.md").read_text(encoding="utf-8")
        glossary = (REPO_ROOT / "GLOSSARY.md").read_text(encoding="utf-8")
        for content in (learner, facilitator):
            self.assertIn("registers its shared repository once", content)
            self.assertIn("successful registration comment", content)
            self.assertIn("successful refresh", content)
            self.assertIn("Archived workshops", content)
        self.assertIn("registers its shared repository once", readme)
        self.assertIn("Existing registrations map to workshop `2026-10-01-scda`", readme)
        self.assertIn("Default Event", readme)
        self.assertIn("2026-10-01-scda", facilitator)
        self.assertIn("Register repository", glossary)
        self.assertIn("once per workshop, with both GitHub handles", glossary)
        self.assertIn("literal lowercase prefix `match`", glossary)
        self.assertIn("discovered automatically", glossary)
        self.assertFalse((REPO_ROOT / "CONTEXT.md").exists())

    def test_turn_cycle_is_five_source_control_steps(self):
        turn = self.guide[self.guide.index('id="turn"'):self.guide.index('id="rematch"')]
        detailed_turn = turn[turn.index("</aside>"):]
        steps = re.findall(r"<li>(.*?)</li>", re.search(r"<ol>(.*?)</ol>", detailed_turn, re.S).group(1), re.S)
        self.assertEqual(len(steps), 5)
        for step, button in zip(steps, ("Pull", None, "+", "Commit", "Sync Changes")):
            if button:
                self.assertIn(f"<strong>{button}</strong>", step)
        self.assertNotIn("Push", turn)
        self.assertNotIn("push", turn)

    def test_no_archived_workshop_in_page_html_and_fallbacks_use_default(self):
        default = json.loads((DOCS_DIR / "workshops.json").read_text(encoding="utf-8"))["defaultWorkshopId"]
        for path in DOCS_DIR.glob("*.html"):
            self.assertNotIn("SCDA", path.read_text(encoding="utf-8"), path.name)
        for name, html in (("wall", self.index), ("learner", self.guide)):
            with self.subTest(page=name):
                for link in re.findall(r"<a [^>]*data-workshop-registration[^>]*>", html):
                    self.assertIn(f"workshop_id={default}", link)
        form = (REPO_ROOT / ".github" / "ISSUE_TEMPLATE" / "register-game.yml").read_text(encoding="utf-8")
        self.assertIn(f"placeholder: {default}", form)

    def test_each_page_has_one_h1_and_no_skipped_heading_levels(self):
        for name, html in (("wall", self.index), ("learner", self.guide), ("setup", self.setup)):
            with self.subTest(page=name):
                levels = [int(level) for level in re.findall(r"<h([1-6])[ >]", html)]
                self.assertEqual(levels.count(1), 1)
                self.assertEqual(levels[0], 1)
                for previous, current in zip(levels, levels[1:]):
                    self.assertLessEqual(current, previous + 1)

    def test_pages_load_theme_init_first_and_avoid_dashboard_wording(self):
        for name, html in (("wall", self.index), ("learner", self.guide), ("setup", self.setup)):
            with self.subTest(page=name):
                head = html[:html.index("</head>")]
                self.assertIn('src="site-config.js"', re.findall(r"<script[^>]*>", head)[0])
                self.assertIn('src="theme-init.js"', re.findall(r"<script[^>]*>", head)[1])
                self.assertNotIn("dashboard", re.sub(r"<[^>]+>", "", html).lower())

    def test_time_machine_page_and_links(self):
        page = (DOCS_DIR / "time-machine.html").read_text(encoding="utf-8")
        md = (REPO_ROOT / "TIME_MACHINE.md").read_text(encoding="utf-8")
        levels = [int(level) for level in re.findall(r"<h([1-6])[ >]", page)]
        self.assertEqual(levels.count(1), 1)
        for term in ("Graph", "Detached HEAD", "experiment branch", "Create Branch", "Publish Branch",
                     "git log --oneline", "git switch", "git diff", "git switch -c", "git push -u"):
            self.assertIn(term.casefold(), page.casefold(), term)
        for term in ("Graph", "Detached HEAD", "what-if-01", "git push -u"):
            self.assertIn(term, md)
        for name in ("README.md", "LEARNER_GUIDE.md", "FACILITATOR_GUIDE.md"):
            self.assertIn("TIME_MACHINE.md", (REPO_ROOT / name).read_text(encoding="utf-8"), name)
        for href in re.findall(r'href="([^"#:]+\.html)"', page):
            self.assertTrue((DOCS_DIR / href).is_file(), href)
        for content in (page, md):
            for branch in re.findall(r"(?:switch -c|Create Branch[^`]*`|named? )`?([\w.-]+)", content):
                self.assertFalse(branch.startswith("match"), branch)
        self.assertIn("what-if-01", page)
        self.assertNotIn("git switch -c match", page)

    def test_copilot_prompts_and_guardrails(self):
        prompts = ("Explain the current board in BOARD.txt and whose turn it is.",
                   "Place O in the top-right cell of BOARD.txt. Change only that cell.",
                   "Commit this move with message 'O plays top-right' and push it.",
                   "Pull, plan my next legal move as O, and place it. Then stop so I can review the diff.")
        learner = (REPO_ROOT / "LEARNER_GUIDE.md").read_text(encoding="utf-8")
        for prompt in prompts:
            self.assertIn(prompt, self.guide)
            self.assertIn(prompt, learner)
        for mode in ("Ask", "Agent", "Plan"):
            self.assertIn(f"<h3>{mode} mode</h3>", self.guide)
        self.assertNotIn("code-window-label", self.guide)
        copilot = self.guide[self.guide.index('id="copilot"'):self.guide.index('id="terminal"')]
        self.assertLess(copilot.index('callout-box warning'), copilot.index("<h3>Ask mode</h3>"))
        self.assertIn("Some learners may lack Agent or Plan mode", copilot)
        self.assertLess(self.guide.index('id="copilot"'), self.guide.index('id="terminal"'))
        agents = (REPO_ROOT / "template" / "AGENTS.md").read_text(encoding="utf-8")
        for rule in ("commit or push only on the learner's explicit request", "force-push", "switch branches unasked", "Edit only `BOARD.txt`", "one cell per move"):
            self.assertIn(rule, agents)
        self.assertFalse((REPO_ROOT / "template" / ".github" / "prompts").exists())

    def test_copy_blocks_have_buttons_and_copy_visible_text(self):
        self.assertTrue((DOCS_DIR / "copy-code.js").is_file())
        script = (DOCS_DIR / "copy-code.js").read_text(encoding="utf-8")
        for needle in ("navigator.clipboard.writeText", "execCommand('copy')", "source.textContent", "'Copied'"):
            self.assertIn(needle, script)
        for name in ("guide.html", "time-machine.html"):
            html = (DOCS_DIR / name).read_text(encoding="utf-8")
            self.assertIn('src="copy-code.js"', html)
            windows = re.findall(r'<div class="code-window">(.*?)</pre></div>', html, re.S)
            self.assertGreater(len(windows), 0, name)
            self.assertEqual(html.count('<pre>'), len(windows), name)
            self.assertNotRegex(html, r"<pre><code>", name)
            for window in windows:
                button = re.search(r'<button type="button" class="copy-button" data-copy-target="([^"]+)"', window)
                self.assertIsNotNone(button, window[:80])
                self.assertIn('role="status" aria-live="polite"', window)
                code = re.search(rf'<code id="{button.group(1)}">(.*?)</code>', window, re.S)
                self.assertIsNotNone(code)
                self.assertNotIn("<", code.group(1))
        guide = (DOCS_DIR / "guide.html").read_text(encoding="utf-8")
        for prompt in ("Explain the current board in BOARD.txt and whose turn it is.",
                       "Place O in the top-right cell of BOARD.txt. Change only that cell.",
                       "Pull, plan my next legal move as O, and place it. Then stop so I can review the diff."):
            self.assertRegex(guide, rf'<code id="copy-src-\d+">{re.escape(prompt)}</code>')
        self.assertIn("git pull --no-rebase", guide)
        self.assertNotRegex(guide, r"git pull\s+#")
        self.assertIn('Unmerged paths', guide)
        for cmd in ("git pull --no-rebase", "git switch -c match-02", "git push -u origin match-02"):
            self.assertRegex(guide, rf'<code id="copy-src-\d+">[^<]*{re.escape(cmd)}')

    def test_copy_button_shares_row_with_code(self):
        css = self.styles[self.styles.index(".code-window {"):]
        self.assertIn("display: flex;", css.split("}", 1)[0])
        self.assertIn("align-items: center;", css.split("}", 1)[0])
        pre = css[css.index(".code-window pre {"):].split("}", 1)[0]
        self.assertIn("padding: 0.35rem 0.75rem;", pre)
        bar = css[css.index(".code-window-bar {"):].split("}", 1)[0]
        self.assertIn("order: 2;", bar)
        self.assertNotIn("border-bottom", bar)
        self.assertNotIn("background", bar)

    def test_wall_filters_and_spinner_are_accessible(self):
        self.assertNotIn('role="tablist"', self.index)
        self.assertIn('aria-live="polite"', re.search(r'<div id="loading-indicator"[^>]*>', self.index).group(0))

    def test_setup_has_skip_link_and_described_videos(self):
        self.assertIn('<a class="skip-link" href="#main">Skip to content</a>', self.setup)
        self.assertRegex(self.setup, r'<main[^>]*id="main"')
        self.assertNotIn("<video", self.setup)

    def test_guide_utility_wires_theme_toggle(self):
        self.assertNotIn("ttt_gamewall_theme", self.utils)
        self.assertIn("getElementById('theme-toggle')", self.utils)
        self.assertIn("window.Theme.toggle()", self.utils)


if __name__ == "__main__":
    unittest.main()

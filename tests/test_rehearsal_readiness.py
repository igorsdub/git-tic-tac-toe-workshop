"""Readiness checks for the approved workshop path and its delivery record."""

from __future__ import annotations

import os
import re
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent


class TestDocumentationReadiness(unittest.TestCase):
    LINK_REGEX = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
    EXPECTED_DOCS = [
        "README.md",
        "WORKSHOP_DESIGN_HANDOFF.md",
        "FACILITATOR_GUIDE.md",
        "LEARNER_GUIDE.md",
        "PRE_SESSION_CHECK.md",
        "REHEARSAL_GUIDE.md",
        "SURVEY.md",
        "docs/index.html",
        "docs/setup.html",
        "docs/guide.html",
        "docs/delivery-status-2026-10-20.md",
        "docs/rehearsal-evidence-2026-10-20.md",
        "docs/rehearsal-evidence-compact-board-2026-10-20.md",
        "template/README.md",
        "template/BOARD.txt",
        "template/AGENTS.md",
        "template/samples/empty.md",
    ]

    def test_primary_documents_exist(self):
        for relative_path in self.EXPECTED_DOCS:
            with self.subTest(path=relative_path):
                document = REPO_ROOT / relative_path
                self.assertTrue(document.is_file(), f"Missing {relative_path}")
                self.assertGreater(document.stat().st_size, 0, f"Empty {relative_path}")

    def test_markdown_relative_links_resolve(self):
        broken = []
        markdown_files = 0
        for root, directories, files in os.walk(REPO_ROOT):
            directories[:] = [
                name for name in directories
                if not name.startswith(".") and name not in ("venv", "node_modules", "__pycache__")
            ]
            for filename in files:
                if not filename.endswith(".md"):
                    continue
                markdown_files += 1
                source = Path(root) / filename
                content = source.read_text(encoding="utf-8")
                for _, target in self.LINK_REGEX.findall(content):
                    if target.startswith(("http://", "https://", "mailto:", "#")):
                        continue
                    path = target.split("#", 1)[0].strip()
                    if path and not (source.parent / path).resolve().exists():
                        broken.append(f"{source.relative_to(REPO_ROOT)}: {target}")
        self.assertGreater(markdown_files, 0)
        self.assertEqual(broken, [], "Broken relative links:\n" + "\n".join(broken))

    def test_readme_links_current_primary_materials(self):
        readme = (REPO_ROOT / "README.md").read_text(encoding="utf-8")
        links = [target for _, target in self.LINK_REGEX.findall(readme)]
        required = (
            "WORKSHOP_DESIGN_HANDOFF.md",
            "FACILITATOR_GUIDE.md",
            "LEARNER_GUIDE.md",
            "PRE_SESSION_CHECK.md",
            "REHEARSAL_GUIDE.md",
            "SURVEY.md",
            "docs/index.html",
            "docs/setup.html",
            "docs/guide.html",
            "docs/delivery-status-2026-10-20.md",
        )
        for target in required:
            with self.subTest(target=target):
                self.assertIn(target, links)
        self.assertIn("Unpublished instructor survey preview", readme)
        self.assertIn("not accepting responses; not distributed", readme)


class TestApprovedWorkshopPath(unittest.TestCase):
    def test_agenda_protects_manual_and_agent_rematch(self):
        facilitator = (REPO_ROOT / "FACILITATOR_GUIDE.md").read_text(encoding="utf-8")
        for block in ("40–70", "70–80", "80–105"):
            self.assertIn(block, facilitator)
        self.assertIn("At minute 80", facilitator)

    def test_public_repository_preflight_and_separate_copilot_access(self):
        preflight = (REPO_ROOT / "PRE_SESSION_CHECK.md").read_text(encoding="utf-8")
        for requirement in (
            "Use this template → Create a new repository",
            "Make your repository public",
            "Keep your public repository and Codespace",
            "separate Codespaces",
            "select **Ask**",
            "What does this repository do?",
            "No board edit is required",
            "Codespaces and Copilot access are separate",
        ):
            self.assertIn(requirement, preflight)

    def test_compact_board_contract_and_agent_prompt_are_current(self):
        board = (REPO_ROOT / "template/README.md").read_text(encoding="utf-8")
        learner = (REPO_ROOT / "LEARNER_GUIDE.md").read_text(encoding="utf-8")
        self.assertIn("exactly three rows of three cells", board)
        self.assertIn("replaces one `.`", board)
        self.assertIn("Place X in the center of the board", learner)
        self.assertIn("Sync the change", learner)

    def test_learner_match_uses_board_and_source_control_contract(self):
        learner = (REPO_ROOT / "LEARNER_GUIDE.md").read_text(encoding="utf-8")
        for requirement in ("Source Control", "BOARD.txt", "match-01", "from `main`", "rematch"):
            self.assertIn(requirement, learner)
        self.assertIn("complete the rematch manually", learner)
        self.assertIn("instructor's Copilot demonstration", learner)

    def test_history_fallback_and_research_transfer_are_documented(self):
        facilitator = (REPO_ROOT / "FACILITATOR_GUIDE.md").read_text(encoding="utf-8")
        self.assertIn("GitHub commit history", facilitator)
        self.assertIn("research files", facilitator)

    def test_registration_label_is_created_and_used_by_sync(self):
        template = (REPO_ROOT / ".github/ISSUE_TEMPLATE/register-game.yml").read_text(encoding="utf-8")
        sync_script = (REPO_ROOT / "scripts/sync_board_registry.py").read_text(encoding="utf-8")
        self.assertIn('labels: ["game-registration"]', template)
        self.assertIn('"game-registration" in', sync_script)

    def test_rehearsal_record_marks_unrun_acceptance_and_draft_survey(self):
        evidence = (REPO_ROOT / "docs/rehearsal-evidence-2026-10-20.md").read_text(encoding="utf-8")
        self.assertIn("Failed game sequence", evidence)
        self.assertIn("Source Control manual match", evidence)
        self.assertIn("not verified", evidence)
        self.assertIn("Not accepting responses", evidence)
        self.assertIn("not distributed", evidence)


if __name__ == "__main__":
    unittest.main()

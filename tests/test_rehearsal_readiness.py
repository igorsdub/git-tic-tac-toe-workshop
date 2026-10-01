"""test_rehearsal_readiness.py

Automated verification suite testing rehearsal readiness, markdown documentation links,
required workshop guides in README.md, and overall repository test execution.
"""

from __future__ import annotations

import os
import re
import subprocess
import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
TESTS_DIR = REPO_ROOT / "tests"


class TestMarkdownDocumentationReadiness(unittest.TestCase):
    """Verifies that all documentation and guides exist and contain valid relative links."""

    LINK_REGEX = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")

    EXPECTED_DOCS = [
        "README.md",
        "FACILITATOR_GUIDE.md",
        "LEARNER_GUIDE.md",
        "PRE_SESSION_CHECK.md",
        "REHEARSAL_GUIDE.md",
        "CONTEXT.md",
        "docs/load_test_simulation.md",
        "template-spec/README.md",
        "template-spec/board.txt",
    ]

    def test_expected_documentation_files_exist(self):
        """Ensure all required workshop markdown documents exist on disk."""
        for rel_path in self.EXPECTED_DOCS:
            doc_path = REPO_ROOT / rel_path
            self.assertTrue(
                doc_path.exists(),
                f"Required documentation file is missing: {rel_path}",
            )
            self.assertGreater(
                doc_path.stat().st_size,
                0,
                f"Documentation file is empty: {rel_path}",
            )

    def test_all_markdown_relative_links_are_valid(self):
        """Scan all markdown files in the repository and ensure relative links point to existing targets."""
        broken_links = []
        md_files_found = 0

        for root, dirs, files in os.walk(REPO_ROOT):
            # Exclude hidden directories, virtual environments, cache
            dirs[:] = [d for d in dirs if not d.startswith(".") and d not in ("venv", "node_modules", "__pycache__")]
            for filename in files:
                if not filename.endswith(".md"):
                    continue

                md_files_found += 1
                source_file = Path(root) / filename
                content = source_file.read_text(encoding="utf-8")

                for match in self.LINK_REGEX.finditer(content):
                    link_text, link_target = match.groups()
                    link_target = link_target.strip()

                    # Ignore external links, mailto, and pure anchor jumps
                    if (
                        link_target.startswith("http://")
                        or link_target.startswith("https://")
                        or link_target.startswith("mailto:")
                        or link_target.startswith("#")
                    ):
                        continue

                    # Strip off any in-file anchor
                    clean_target = link_target.split("#")[0].strip()
                    if not clean_target:
                        continue

                    # Resolve target relative to source markdown file
                    resolved_target = (source_file.parent / clean_target).resolve()
                    if not resolved_target.exists():
                        broken_links.append(
                            f"{source_file.relative_to(REPO_ROOT)}: '{link_target}' "
                            f"(resolves to missing path: {resolved_target})"
                        )

        self.assertGreater(md_files_found, 0, "No markdown files found to validate.")
        self.assertEqual(
            broken_links,
            [],
            f"Found {len(broken_links)} broken relative link(s):\n" + "\n".join(broken_links),
        )


class TestReadmeMandatoryLinks(unittest.TestCase):
    """Verifies that README.md links to all primary workshop materials."""

    MANDATORY_TARGETS = [
        ("FACILITATOR_GUIDE.md", "Facilitator Guide"),
        ("LEARNER_GUIDE.md", "Learner Guide"),
        ("PRE_SESSION_CHECK.md", "Pre-Session Readiness Checklist"),
        ("REHEARSAL_GUIDE.md", "Rehearsal Guide"),
        ("template-spec/", "Template Specification"),
        ("docs/index.html", "Game Wall"),
        ("docs/load_test_simulation.md", "Game Wall Scalability / Load Simulation"),
    ]

    def setUp(self):
        readme_path = REPO_ROOT / "README.md"
        self.assertTrue(readme_path.exists(), "README.md is missing")
        self.readme_content = readme_path.read_text(encoding="utf-8")

        # Extract all markdown link targets
        link_regex = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
        self.links = [target.strip() for _, target in link_regex.findall(self.readme_content)]

    def test_mandatory_links_present_in_readme(self):
        """Verify each mandatory file or directory target is explicitly linked in README.md."""
        for target, description in self.MANDATORY_TARGETS:
            # Check if any link equals or starts with the target (e.g. template-spec/ or template-spec/README.md)
            found = any(
                link == target or link.startswith(target)
                for link in self.links
            )
            self.assertTrue(
                found,
                f"README.md is missing link to {description} (target: {target}). Found links: {self.links}",
            )


class TestRehearsalGuideContents(unittest.TestCase):
    """Verifies essential instructional protocols and timing constraints in REHEARSAL_GUIDE.md."""

    def setUp(self):
        rehearsal_path = REPO_ROOT / "REHEARSAL_GUIDE.md"
        self.assertTrue(rehearsal_path.exists(), "REHEARSAL_GUIDE.md is missing")
        self.content = rehearsal_path.read_text(encoding="utf-8")

    def test_pair_play_timing_guarantee(self):
        """Verify that at least 60 minutes are explicitly reserved and guaranteed for paired play."""
        self.assertTrue(
            "60 min" in self.content or "60 minutes" in self.content or "60+" in self.content,
            "REHEARSAL_GUIDE.md must specify 60+ minutes reserved for paired play.",
        )
        self.assertIn("00:40 – 01:40", self.content, "Rehearsal guide must contain 00:40–01:40 pair play block.")

    def test_operating_system_matrix_present(self):
        """Verify operating system readiness matrix covers macOS, Windows, and Linux."""
        for os_name in ("macOS", "Windows", "Linux"):
            self.assertIn(os_name, self.content, f"Rehearsal guide must cover {os_name} readiness.")
        self.assertIn("git config --global user.name", self.content)
        self.assertIn("git config --global user.email", self.content)

    def test_live_demo_rehearsal_protocol(self):
        """Verify live demonstration script covers template instantiation and two published moves."""
        self.assertIn("igorsdub/git-tic-tac-toe-template", self.content)
        self.assertIn("Move 1", self.content)
        self.assertIn("Move 2", self.content)
        self.assertIn("git push", self.content)
        self.assertIn("git pull", self.content)

    def test_odd_learner_protocol(self):
        """Verify protocol for handling odd learner counts."""
        self.assertIn("Odd Learner", self.content)
        self.assertIn("Player O", self.content)

    def test_setup_fallback_protocol(self):
        """Verify zero-fatigue setup fallback protocol."""
        self.assertIn("Setup Fallback", self.content)
        self.assertIn("Navigator", self.content)

    def test_game_wall_scale_protocol(self):
        """Verify load test rehearsal protocol references 10 and 20 repository scales."""
        self.assertIn("10", self.content)
        self.assertIn("20", self.content)
        self.assertIn("docs/load_test_simulation.md", self.content)

    def test_research_transfer_discussion(self):
        """Verify closing discussion check connecting game moves to scientific research."""
        self.assertIn("Research Transfer", self.content)

    def test_registration_label_verification(self):
        """Verify rehearsal guide includes checking repository game-registration label."""
        self.assertIn("game-registration", self.content)


class TestRepositoryTestSuiteExecution(unittest.TestCase):
    """Executes the full test discovery across the repository to verify 100% passing tests."""

    def test_discover_and_run_all_tests(self):
        """Run unittest discovery across the repository to verify all test suites pass cleanly."""
        # Prevent recursion if executed within an automated runner
        if os.environ.get("_SUBPROCESS_TEST_RUN") == "1":
            return

        env = os.environ.copy()
        env["_SUBPROCESS_TEST_RUN"] = "1"

        cmd = [sys.executable, "-m", "unittest", "discover", "-s", str(TESTS_DIR), "-p", "test_*.py"]
        result = subprocess.run(
            cmd,
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
            env=env,
        )

        self.assertEqual(
            result.returncode,
            0,
            f"Repository test discovery failed (exit code {result.returncode}):\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}",
        )


if __name__ == "__main__":
    unittest.main()

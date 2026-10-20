import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

SCRIPTS_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))

from publish_registry_snapshots import PublishError, publish_snapshots  # noqa: E402
from sync_board_registry import main as sync_main  # noqa: E402


def git(cwd: Path, *args: str) -> str:
    return subprocess.run(
        ["git", *args], cwd=cwd, text=True, capture_output=True, check=True
    ).stdout.strip()


class TestPublishRegistrySnapshots(unittest.TestCase):
    def make_repositories(self, root: Path) -> tuple[Path, Path]:
        remote = root / "remote.git"
        checkout = root / "checkout"
        writer = root / "writer"
        subprocess.run(["git", "init", "--bare", "--initial-branch=main", str(remote)], check=True, capture_output=True)
        subprocess.run(["git", "clone", str(remote), str(checkout)], check=True, capture_output=True)
        git(checkout, "config", "user.name", "Test")
        git(checkout, "config", "user.email", "test@example.com")
        (checkout / "docs").mkdir()
        (checkout / "docs" / "source.json").write_text('{"source":"initial"}\n', encoding="utf-8")
        (checkout / "docs" / "board.json").write_text("[]\n", encoding="utf-8")
        (checkout / "docs" / "registrations.json").write_text('{"registrations":[]}\n', encoding="utf-8")
        (checkout / "docs" / "registry-status.json").write_text('{"repositories":[]}\n', encoding="utf-8")
        git(checkout, "add", "docs")
        git(checkout, "commit", "-m", "initial source")
        git(checkout, "push", "-u", "origin", "main")
        subprocess.run(["git", "clone", str(remote), str(writer)], check=True, capture_output=True)
        git(writer, "config", "user.name", "Concurrent writer")
        git(writer, "config", "user.email", "writer@example.com")
        return checkout, writer

    def install_git_wrapper(self, root: Path, wrapper_body: str) -> Path:
        wrapper_dir = root / "bin"
        wrapper_dir.mkdir()
        real_git = shutil.which("git")
        wrapper = wrapper_dir / "git"
        wrapper.write_text(
            "#!/bin/sh\n"
            f"REAL_GIT='{real_git}'\n"
            + wrapper_body
            + "\nexec \"$REAL_GIT\" \"$@\"\n",
            encoding="utf-8",
        )
        wrapper.chmod(0o755)
        return wrapper_dir

    def test_queued_old_checkout_recomputes_after_main_advances_during_sync(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            checkout, writer = self.make_repositories(root)
            old_sha = git(checkout, "rev-parse", "HEAD")
            # Recreate an issue-event checkout pinned to the old event SHA.
            git(checkout, "checkout", "--detach", old_sha)

            fake_sync = root / "fake_sync.py"
            fake_sync.write_text(
                "import json, os, subprocess, sys\n"
                "from pathlib import Path\n"
                "root = Path.cwd()\n"
                "counter = Path(os.environ['SYNC_COUNTER'])\n"
                "count = int(counter.read_text() if counter.exists() else '0')\n"
                "counter.write_text(str(count + 1))\n"
                "if count == 0:\n"
                "    Path(os.environ['FEEDBACK_LOG']).write_text('updated once\\n')\n"
                "    writer = Path(os.environ['WRITER_DIR'])\n"
                "    (writer / 'docs/source.json').write_text('{\\\"source\\\":\\\"new-main\\\"}\\n')\n"
                "    subprocess.run(['git', '-C', str(writer), 'add', 'docs/source.json'], check=True)\n"
                "    subprocess.run(['git', '-C', str(writer), 'commit', '-m', 'concurrent main update'], check=True, capture_output=True)\n"
                "    subprocess.run(['git', '-C', str(writer), 'push', 'origin', 'main'], check=True, capture_output=True)\n"
                "else:\n"
                "    assert '--skip-feedback' in sys.argv\n"
                "source = json.loads((root / 'docs/source.json').read_text())\n"
                "(root / 'docs/board.json').write_text(json.dumps(source) + '\\n')\n",
                encoding="utf-8",
            )
            counter = root / "sync-count"
            feedback = root / "feedback.log"
            with patch.dict(os.environ, {"SYNC_COUNTER": str(counter), "FEEDBACK_LOG": str(feedback), "WRITER_DIR": str(writer)}):
                publish_snapshots(sync_command=(sys.executable, str(fake_sync)), cwd=checkout)

            self.assertEqual(counter.read_text(), "2")
            self.assertEqual(feedback.read_text(), "updated once\n")
            self.assertEqual(json.loads((checkout / "docs/source.json").read_text()), {"source": "new-main"})
            self.assertEqual(json.loads((checkout / "docs/board.json").read_text()), {"source": "new-main"})
            writer_sha = git(writer, "rev-parse", "HEAD")
            checkout_sha = git(checkout, "rev-parse", "HEAD")
            self.assertEqual(
                subprocess.run(
                    ["git", "merge-base", "--is-ancestor", writer_sha, checkout_sha],
                    cwd=checkout,
                    check=False,
                ).returncode,
                0,
            )

    def test_sync_can_recompute_without_editing_registration_feedback(self):
        with patch("sync_board_registry.load_workshop_catalog", return_value={"workshops": []}), patch(
            "sync_board_registry.fetch_registration_issues", return_value=[]
        ), patch("sync_board_registry._read_json", side_effect=[{"registrations": []}, []]), patch(
            "sync_board_registry.build_registration_state", return_value=([], {24: "Registration accepted."})
        ), patch("sync_board_registry.build_match_snapshot", return_value=([], [])), patch(
            "sync_board_registry._write_json"
        ), patch("sync_board_registry.update_issue_feedback") as feedback:
            sync_main(update_feedback=False)
        feedback.assert_not_called()

    def test_repeated_main_advancement_stops_at_bounded_attempt_limit(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            checkout, writer = self.make_repositories(root)
            fake_sync = root / "fake_sync.py"
            fake_sync.write_text(
                "import json, os, subprocess, sys\n"
                "from pathlib import Path\n"
                "root = Path.cwd()\n"
                "counter = Path(os.environ['SYNC_COUNTER'])\n"
                "count = int(counter.read_text() if counter.exists() else '0')\n"
                "counter.write_text(str(count + 1))\n"
                "if count:\n"
                "    assert '--skip-feedback' in sys.argv\n"
                "source_path = Path(os.environ['WRITER_DIR']) / 'docs/source.json'\n"
                "source_path.write_text(json.dumps({'source': str(count + 1)}) + '\\n')\n"
                "subprocess.run(['git', '-C', os.environ['WRITER_DIR'], 'add', 'docs/source.json'], check=True)\n"
                "subprocess.run(['git', '-C', os.environ['WRITER_DIR'], 'commit', '-m', f'race {count}'], check=True, capture_output=True)\n"
                "subprocess.run(['git', '-C', os.environ['WRITER_DIR'], 'push', 'origin', 'main'], check=True, capture_output=True)\n"
                "(root / 'docs/board.json').write_text(json.dumps({'source': str(count)}) + '\\n')\n",
                encoding="utf-8",
            )
            counter = root / "sync-count"
            with patch.dict(os.environ, {"SYNC_COUNTER": str(counter), "WRITER_DIR": str(writer)}):
                with self.assertRaisesRegex(PublishError, "stopped after 2 attempts"):
                    publish_snapshots(sync_command=(sys.executable, str(fake_sync)), max_attempts=2, cwd=checkout)
            self.assertEqual(counter.read_text(), "2")

    def test_push_rejection_refetches_and_recomputes_before_retrying(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            checkout, writer = self.make_repositories(root)
            fake_sync = root / "fake_sync.py"
            fake_sync.write_text(
                "import json, os, sys\n"
                "from pathlib import Path\n"
                "root = Path.cwd()\n"
                "counter = Path(os.environ['SYNC_COUNTER'])\n"
                "count = int(counter.read_text() if counter.exists() else '0')\n"
                "counter.write_text(str(count + 1))\n"
                "if count:\n"
                "    assert '--skip-feedback' in sys.argv\n"
                "source = json.loads((root / 'docs/source.json').read_text())\n"
                "(root / 'docs/board.json').write_text(json.dumps(source) + '\\n')\n",
                encoding="utf-8",
            )
            marker = root / "push-raced"
            wrapper_dir = self.install_git_wrapper(
                root,
                "if [ \"$1 $2 $3\" = \"push origin HEAD:refs/heads/main\" ] && [ ! -e \"$RACE_MARKER\" ]; then\n"
                "  touch \"$RACE_MARKER\"\n"
                "  printf '{\\\"source\\\":\\\"during-push\\\"}\\n' > \"$WRITER_DIR/docs/source.json\"\n"
                "  \"$REAL_GIT\" -C \"$WRITER_DIR\" add docs/source.json\n"
                "  \"$REAL_GIT\" -C \"$WRITER_DIR\" -c user.name=Writer -c user.email=writer@example.com commit -m concurrent-race\n"
                "  \"$REAL_GIT\" -C \"$WRITER_DIR\" push origin main\n"
                "fi",
            )
            counter = root / "sync-count"
            env = {
                "PATH": f"{wrapper_dir}{os.pathsep}{os.environ['PATH']}",
                "RACE_MARKER": str(marker),
                "SYNC_COUNTER": str(counter),
                "WRITER_DIR": str(writer),
            }
            with patch.dict(os.environ, env):
                publish_snapshots(sync_command=(sys.executable, str(fake_sync)), cwd=checkout)

            self.assertEqual(counter.read_text(), "2")
            self.assertEqual(json.loads((checkout / "docs/board.json").read_text()), {"source": "during-push"})
            writer_sha = git(writer, "rev-parse", "HEAD")
            checkout_sha = git(checkout, "rev-parse", "HEAD")
            self.assertEqual(
                subprocess.run(
                    ["git", "merge-base", "--is-ancestor", writer_sha, checkout_sha],
                    cwd=checkout,
                    check=False,
                ).returncode,
                0,
            )

    def test_non_race_push_failure_reports_permissions_without_retrying(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            checkout, _writer = self.make_repositories(root)
            fake_sync = root / "fake_sync.py"
            fake_sync.write_text(
                "from pathlib import Path\n"
                "Path.cwd().joinpath('docs/board.json').write_text('{\\\"generated\\\":true}\\n')\n",
                encoding="utf-8",
            )
            wrapper_dir = self.install_git_wrapper(
                root,
                "if [ \"$1 $2 $3\" = \"push origin HEAD:refs/heads/main\" ]; then\n"
                "  echo 'permission denied by test' >&2\n"
                "  exit 1\n"
                "fi",
            )
            with patch.dict(os.environ, {"PATH": f"{wrapper_dir}{os.pathsep}{os.environ['PATH']}"}):
                with self.assertRaisesRegex(PublishError, "origin/main remained .*permission denied by test"):
                    publish_snapshots(sync_command=(sys.executable, str(fake_sync)), cwd=checkout)


if __name__ == "__main__":
    unittest.main()

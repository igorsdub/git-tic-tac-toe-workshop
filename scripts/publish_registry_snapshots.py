#!/usr/bin/env python3
"""Recompute and publish snapshots from the latest main, with bounded race recovery."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path
from typing import Sequence

ROOT_DIR = Path(__file__).resolve().parent.parent
SNAPSHOTS = (
    "docs/board.json",
    "docs/registrations.json",
    "docs/registry-status.json",
)
MAX_ATTEMPTS = 3


class PublishError(RuntimeError):
    """Raised when snapshots cannot be published safely."""


def _run(args: Sequence[str], *, cwd: Path = ROOT_DIR, check: bool = True) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(args, cwd=cwd, text=True, capture_output=True, check=False)
    if check and result.returncode:
        detail = result.stderr.strip() or result.stdout.strip() or f"exit code {result.returncode}"
        raise PublishError(f"Command failed ({' '.join(args)}): {detail}")
    return result


def _git(*args: str, cwd: Path = ROOT_DIR, check: bool = True) -> subprocess.CompletedProcess[str]:
    return _run(("git", *args), cwd=cwd, check=check)


def _main_sha(*, cwd: Path = ROOT_DIR) -> str:
    return _git("rev-parse", "refs/remotes/origin/main", cwd=cwd).stdout.strip()


def _remote_main_sha(*, cwd: Path = ROOT_DIR) -> str:
    output = _git("ls-remote", "origin", "refs/heads/main", cwd=cwd).stdout.splitlines()
    if not output:
        raise PublishError("origin/main could not be read; verify the remote and repository permissions.")
    return output[0].split()[0]


def _fetch_main(*, cwd: Path = ROOT_DIR) -> str:
    _git("fetch", "origin", "+refs/heads/main:refs/remotes/origin/main", cwd=cwd)
    return _main_sha(cwd=cwd)


def _reset_to_latest_main(*, expected_ancestor: str | None = None, cwd: Path = ROOT_DIR) -> str:
    latest = _fetch_main(cwd=cwd)
    if expected_ancestor is not None:
        result = _git("merge-base", "--is-ancestor", expected_ancestor, latest, cwd=cwd, check=False)
        if result.returncode:
            raise PublishError(
                f"origin/main moved to {latest}, which is not a fast-forward from {expected_ancestor}; "
                "refusing to overwrite divergent history. Inspect main and rerun the workflow."
            )
    _git("reset", "--hard", latest, cwd=cwd)
    return latest


def publish_snapshots(
    *,
    sync_command: Sequence[str] | None = None,
    max_attempts: int = MAX_ATTEMPTS,
    cwd: Path = ROOT_DIR,
) -> None:
    """Regenerate from current source data and publish, retrying only fast-forward races."""
    if max_attempts < 1:
        raise ValueError("max_attempts must be positive")
    command = list(sync_command or (sys.executable, str(ROOT_DIR / "scripts" / "sync_board_registry.py")))
    _git("config", "user.name", "github-actions[bot]", cwd=cwd)
    _git("config", "user.email", "github-actions[bot]@users.noreply.github.com", cwd=cwd)
    _reset_to_latest_main(cwd=cwd)

    previous_base: str | None = None
    for attempt in range(1, max_attempts + 1):
        base_sha = _git("rev-parse", "HEAD", cwd=cwd).stdout.strip()
        sync_args = command if attempt == 1 else [*command, "--skip-feedback"]
        _run(sync_args, cwd=cwd)
        _git("add", *SNAPSHOTS, cwd=cwd)

        # Detect advancement during API reads before creating a commit. A retry
        # discards only this disposable workflow checkout and recomputes all data.
        remote_sha = _remote_main_sha(cwd=cwd)
        if remote_sha != base_sha:
            latest = _reset_to_latest_main(expected_ancestor=base_sha, cwd=cwd)
            previous_base = base_sha
            print(f"main advanced during snapshot generation; recomputing from {latest} (attempt {attempt + 1})")
            continue

        diff = _git("diff", "--cached", "--quiet", cwd=cwd, check=False)
        if diff.returncode == 0:
            print("No generated snapshot changes")
            return
        if diff.returncode != 1:
            raise PublishError(f"Could not inspect staged snapshot changes: {diff.stderr.strip()}")

        _git(
            "commit",
            "-m",
            "chore(registry): sync workshop registrations and matches [skip ci]",
            cwd=cwd,
        )
        push = _git("push", "origin", "HEAD:refs/heads/main", cwd=cwd, check=False)
        if push.returncode == 0:
            print("Published generated registration and match snapshots")
            return

        latest = _fetch_main(cwd=cwd)
        if latest == base_sha:
            detail = push.stderr.strip() or push.stdout.strip() or f"exit code {push.returncode}"
            raise PublishError(
                f"Snapshot push failed while origin/main remained {base_sha}: {detail}. "
                "Check repository write permissions and branch protection."
            )
        _reset_to_latest_main(expected_ancestor=base_sha, cwd=cwd)
        previous_base = base_sha
        print(f"main advanced during snapshot push; recomputing from {latest} (attempt {attempt + 1})")

    prior = f" after base {previous_base}" if previous_base else ""
    raise PublishError(
        f"origin/main kept advancing{prior}; snapshot sync stopped after {max_attempts} attempts. "
        "A later scheduled refresh can retry, or rerun this workflow after main is quiet."
    )


def main() -> int:
    try:
        publish_snapshots()
    except (PublishError, OSError) as error:
        print(f"::error::{error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

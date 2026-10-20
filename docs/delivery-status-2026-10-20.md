# Delivery status — 2026-10-20

## Decision

The implementation is ready for review on the local feature branch, but it is not participant-ready on GitHub. No commit was pushed or merged. Task 5 is blocked and no complete manual/Copilot facilitator rehearsal has been performed.

## Local changes and checks

The workshop branch is `codex/agent-assisted-workshop-plan`. At reconciliation, it contains the locally committed survey-evidence, branch-registration, Game Wall, board-refresh/replay, and review-fix changes. Relevant workshop commits include `14b9ca7` (rehearsal evidence), `8013c6e` (branch-aware registration), `b92495b` (outcome groups/history replay), `480882a` (refresh and replay-state repair), and `79e2908` (transient board recovery and history refresh after rerender). The implementation comparison uses the freshly fetched `origin/main` commit `c907b0e`. The workshop branch is 46 commits ahead and 5 behind `origin/main`; the local template branch is 2 commits ahead and 0 behind its `origin/main`. Neither branch is synchronized or ready to merge based on this divergence alone. Tracked `docs/.DS_Store` and `scripts/tests/__pycache__` artifacts in the workshop comparison were already present in ancestor commit `f4d875c` (2026-10-12), before this work began; they are inherited branch content, not artifacts created during this reconciliation.

The separate template checkout has local commits `de2c535` (initialized uppercase `BOARD.txt` and numbered branch contract) and `c0bf24d` (fetch the published branch in a partner’s already-open Codespace). They are not pushed. The working source in both checkouts is therefore ahead of what learners can reach.

Final independent checks passed: all 69 Python tests and 11 Node tests passed; one Chromium DOM integration test was skipped because the host’s Chrome headless smoke launch aborts (`SIGABRT`) while the Mac is locked. Four syntax checks and `git diff --check` for both repositories also passed. The complete two-account rehearsal is not represented by these tests.

## Live service checks

- The live starter repository’s `main` is `6e6a794057986ea5fa5f0aee6616b023e323e4a0`. Its raw lowercase `board.txt` is present; raw uppercase `BOARD.txt` returns HTTP 404. The template feature-branch commits above are not available remotely.
- The [published workshop site](https://igorsdub.github.io/git-tic-tac-toe-workshop/) returns HTTP 200. The latest successful `pages-build-deployment` run observed was [run 36817375985](https://github.com/igorsdub/git-tic-tac-toe-workshop/actions/runs/36817375985), for `origin/main` commit `c907b0e5d8ed8f4e4e69afcf5e7dc50231b2246a`, completed on 2026-10-01. It predates this local implementation. My unauthenticated request to `GET https://api.github.com/repos/igorsdub/git-tic-tac-toe-workshop/pages` returned HTTP 404. A separate scout observation reported the Pages status as built; these are distinct observations, and neither is evidence that Pages is disabled. The successful workflow and served URL remain direct evidence of a published build.
- The Google Form was created and previewed, but remains unpublished and is not accepting responses. It was not distributed. The [preview link](https://docs.google.com/forms/d/1N2-9HYEtIvWLp11hEa2d9NeS1vXBWiUy7xRycXJNW6c/preview) is identified as an instructor draft, not a learner action.

## Rehearsal blockers

The recorded browser reconnaissance found one signed-in GitHub account and one existing Codespace. No second account or pair repository was available. The existing Codespace was left unopened. Therefore:

- the two-account/two-Codespace Source Control flow was not run;
- neither the manual match nor Copilot-assisted rematch was run;
- account settings did not establish that Copilot Agent can edit a board in Codespaces;
- the direct starter preflight prompt and subsequent Codespace deletion were not run;
- the no-Copilot fallback was documented but not exercised with a participant.

The advance setup instructions still call for opening the starter directly in a Codespace, asking “What does this repository do?”, then deleting the Codespace without committing or pushing. Do not mark that check complete until it is actually performed. See [the detailed rehearsal evidence](rehearsal-evidence-2026-10-20.md).

## Next steps before delivery

1. Publish the template feature branch into the actual starter repository’s default branch and verify the initialized `BOARD.txt` remotely.
2. Publish the workshop implementation and verify that the Pages deployment contains it; confirm a live match registration and board/history request before demonstrating the Game Wall.
3. Complete and record the two-account/two-Codespace manual and Copilot-assisted flows, and separately perform the direct starter preflight without committing or pushing.
4. Publish and distribute the survey only after the instructor approves it.

These steps are outside this local reconciliation. No external change or publication was made.

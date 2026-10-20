# Delivery status — 2026-10-20

## Decision

The implementation is ready for review on the local feature branch, but it is not participant-ready on GitHub. No commit was pushed or merged. Task 5 is blocked and no complete manual/Copilot facilitator rehearsal has been performed.

## Local changes and checks

The workshop branch is `codex/agent-assisted-workshop-plan`. At reconciliation, it contains the locally committed survey-evidence, branch-registration, Game Wall, board-refresh/replay, and review-fix changes. Relevant workshop commits include `14b9ca7` (rehearsal evidence), `8013c6e` (branch-aware registration), `b92495b` (outcome groups/history replay), `480882a` (refresh and replay-state repair), and `79e2908` (transient board recovery and history refresh after rerender). The implementation comparison uses the freshly fetched `origin/main` commit `c907b0e`.

The separate template checkout has local commits `de2c535` (initialized uppercase `BOARD.txt` and numbered branch contract) and `c0bf24d` (fetch the published branch in a partner’s already-open Codespace). They are not pushed. The working source in both checkouts is therefore ahead of what learners can reach.

The registration/parser and dashboard helper tests pass, including exact-branch refresh, transient board recovery, outcome recomputation, history pagination, and refresh-button state (11 Node tests). The focused readiness and web-guide suites pass (16 Python tests), including relative-link resolution. The Chromium DOM integration test is present but skipped: the host’s Chrome headless smoke launch aborts (`SIGABRT`) while the Mac is locked. The complete two-account rehearsal is also not represented by these tests. See the commit history for the documentation reconciliation.

## Live service checks

- The live starter repository’s `main` is `6e6a794057986ea5fa5f0aee6616b023e323e4a0`. Its raw lowercase `board.txt` is present; raw uppercase `BOARD.txt` returns HTTP 404. The template feature-branch commits above are not available remotely.
- The [published workshop site](https://igorsdub.github.io/git-tic-tac-toe-workshop/) returns HTTP 200. The latest successful `pages-build-deployment` run observed was [run 36817375985](https://github.com/igorsdub/git-tic-tac-toe-workshop/actions/runs/36817375985), for `origin/main` commit `c907b0e5d8ed8f4e4e69afcf5e7dc50231b2246a`, completed on 2026-10-01. It predates this local implementation. The GitHub Pages REST endpoint returned 404 during this check; that response does not establish whether Pages is disabled, so the workflow and served URL are the available evidence.
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

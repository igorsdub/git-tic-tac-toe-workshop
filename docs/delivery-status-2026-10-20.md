# Delivery status — 2026-10-20

## Publication update — 2026-10-20

Workshop PR [#21](https://github.com/igorsdub/git-tic-tac-toe-workshop/pull/21) merged to `main` at `ec91e034cd9cef0eb323d9fe14f4b172e7ebda95`. Pages run [39379110007](https://github.com/igorsdub/git-tic-tac-toe-workshop/actions/runs/39379110007) completed successfully. The live home page, setup guide, `app.js`, `match-data.js`, and `board.json` return HTTP 200 and serve the branch-aware Game Wall. The separate starter repository's `main` remains published at `e6e5d26` with uppercase `BOARD.txt`.

The live registry currently has six records, and none includes a numbered match branch. The Game Wall therefore places all six under “Needs attention”; no registered match can refresh its board or replay history until its owners re-register it with a `match-NN` branch. Existing records were preserved, and no branch names were inferred. The two-account/two-Codespace rehearsal remains incomplete, and the instructor survey is unpublished and not accepting responses. This update supersedes the prepublication status below; the dated rehearsal outcomes remain historical evidence.

## Decision

Before PR #21 was published, the workshop and template implementation was ready for review on a local feature branch but was not participant-ready. No workshop or template implementation commits had yet been pushed or merged; disposable rehearsal changes are recorded separately. Task 5 has partial one-account evidence in [the rehearsal record](rehearsal-evidence-2026-10-20.md): the Source Control workflow was exercised in a disposable private repository, but the manual game history failed because the final commit combined two turns; two-user collaboration remains unverified, Copilot made three wrong-row edits that were discarded, and the direct-starter prompt returned no response.

## Local changes and checks

The workshop branch is `codex/agent-assisted-workshop-plan`. At reconciliation, it contains the locally committed survey-evidence, branch-registration, Game Wall, board-refresh/replay, and review-fix changes. Relevant workshop commits include `14b9ca7` (rehearsal evidence), `8013c6e` (branch-aware registration), `b92495b` (outcome groups/history replay), `480882a` (refresh and replay-state repair), and `79e2908` (transient board recovery and history refresh after rerender). The implementation comparison uses the freshly fetched `origin/main` commit `c907b0e`. The workshop branch is 46 commits ahead and 5 behind `origin/main`; the local template branch is 2 commits ahead and 0 behind its `origin/main`. Neither branch is synchronized or ready to merge based on this divergence alone. Tracked `docs/.DS_Store` and `scripts/tests/__pycache__` artifacts in the workshop comparison were already present in ancestor commit `f4d875c` (2026-10-12), before this work began; they are inherited branch content, not artifacts created during this reconciliation.

The separate template checkout has local commits `de2c535` (initialized uppercase `BOARD.txt` and numbered branch contract) and `c0bf24d` (fetch the published branch in a partner’s already-open Codespace). They are not pushed. The working source in both checkouts is therefore ahead of what learners can reach.

Final independent checks passed: all 69 Python tests and 11 Node tests passed; one Chromium DOM integration test was skipped because the host’s Chrome headless smoke launch aborts (`SIGABRT`) while the Mac is locked. Four syntax checks and `git diff --check` for both repositories also passed. The one-account Source Control workflow is not represented by these tests; the valid per-turn game sequence and two-account rehearsal remain unverified.

## Prepublication live service checks

- At the time of the prepublication check, the live starter repository’s `main` was `6e6a794057986ea5fa5f0aee6616b023e323e4a0`. Its raw lowercase `board.txt` was present; raw uppercase `BOARD.txt` returned HTTP 404. The separate template repository has since been published at `e6e5d26`.
- At the time of the prepublication check, the latest successful `pages-build-deployment` run was [36817375985](https://github.com/igorsdub/git-tic-tac-toe-workshop/actions/runs/36817375985), for `origin/main` commit `c907b0e5d8ed8f4e4e69afcf5e7dc50231b2246a`, completed on 2026-10-01. My unauthenticated request to `GET https://api.github.com/repos/igorsdub/git-tic-tac-toe-workshop/pages` returned HTTP 404. The current successful deployment is [run 39379110007](https://github.com/igorsdub/git-tic-tac-toe-workshop/actions/runs/39379110007) for merge commit `ec91e034cd9cef0eb323d9fe14f4b172e7ebda95`.
- The Google Form was created and previewed, but remains unpublished and is not accepting responses. It was not distributed. The [preview link](https://docs.google.com/forms/d/1N2-9HYEtIvWLp11hEa2d9NeS1vXBWiUy7xRycXJNW6c/preview) is identified as an instructor draft, not a learner action.

## Rehearsal status

A one-account adaptation was performed in a private disposable repository using the local updated board contract. VS Code Source Control was exercised on `match-01`, but the final commit added O and X moves together, so the per-turn game sequence failed. Copilot Agent mode was available on `match-02`, but three wrong-row edits were rejected and the workspace restored to clean state. A direct live-starter preflight Codespace showed the old lowercase `board.txt`; the prompt received no answer because Copilot required sign-in. The rehearsal Codespace was stopped, and the no-commit preflight Codespace was stopped and deleted. The pre-existing `automatic-goggles-jr9x47pwr4ghvq5` Codespace was untouched. See [detailed rehearsal evidence](rehearsal-evidence-2026-10-20.md).

The adapted run does not establish a second account's collaborator access or pull/fetch behavior. At the time of that run, the starter prompt-and-response check was still outstanding and the live starter remained unchanged. A two-account follow-up is still needed. The fallback for learners without usable Copilot remains manual rematch plus instructor demonstration.

## Remaining steps before participant delivery

1. Re-register each existing record with its pair repository, numbered match branch, and both player handles. Verify a valid public branch can load its board and history before demonstrating the Game Wall.
2. Have each participant create a public personal repository from the published template, open their own Codespace, and verify the exact Copilot Ask prompt `What does this repository do?` returns a usable response. Retain both personal repositories and Codespaces; then have the pair choose one prepared repository and verify collaborator access and the match flow.
3. Publish and distribute the survey only after the instructor approves it.

The private disposable rehearsal repository and its match branch are described in the rehearsal record. Publication does not change those historical outcomes or establish the two-account participant flow.

# Compact-board rehearsal addendum — 2026-10-20

This addendum records a separate one-account, private-Codespace check of the compact board contract. The earlier [facilitator rehearsal evidence](rehearsal-evidence-2026-10-20.md) is unchanged.

## Scope and result

The local Codespace branch `compact-board-rehearsal` used the canonical three-line dot board and the requested `AGENTS.md` conventions. This check did not create or test a participant's public repository from the template. Neither Copilot request returned an answer or a proposed edit before cancellation, so both outcomes are unverified timeouts. The Agent attempt did not produce an incorrect-square result or any file edit.

## Checks

| Check | Result | Evidence |
|---|---|---|
| Ask readiness question | **Unverified timeout** | In Ask mode, submitted exactly “What does this repository do?” The interface remained at “Evaluating”; the request was canceled after 35 seconds with no answer or error text. |
| Agent board request | **Unverified timeout** | Submitted exactly “Place X in the center of the board.” The interface remained at “Evaluating”; the request was canceled after 56 seconds with no response or proposed diff. The board stayed empty. |
| Codespace cleanup | **Stopped** | GitHub Codespaces showed `vigilant space carnival` as stopped. |
| Local repository state | **Uncommitted changes remain** | The unpublished local branch `compact-board-rehearsal` retains modified `BOARD.txt` and untracked `AGENTS.md`. `BOARD.txt` contains the compact empty board; `AGENTS.md` contains the requested board conventions. |

The workbench displayed “Activating Extensions…” and Source Control discard attempts had no effect. Cleanup stopped there; the repository is not reported as clean. No AI edits occurred, and nothing was pushed or published. The protected pre-existing Codespace `automatic-goggles-jr9x47pwr4ghvq5` was not touched.

This was a private disposable rehearsal only. It does not establish readiness success, Agent success, or the public participant repository flow.

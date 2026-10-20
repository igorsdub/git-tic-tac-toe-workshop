# Facilitator rehearsal evidence — 2026-10-20

## Scope and result

The user authorized adapting task 5 to one GitHub account. The hands-on run below uses one account and a private disposable rehearsal repository. It verifies VS Code web Source Control mechanics and captures an attempted match, but the committed move sequence was invalid and does not establish the two-person collaboration experience or two-account permissions. The live learner template was not changed or published; it still has lowercase `board.txt`, while the local updated template has not been pushed.

## Access and resources

- GitHub account used: `igorsdub`.
- Private disposable repository: [workshop-rehearsal-one-account-20261020](https://github.com/igorsdub/workshop-rehearsal-one-account-20261020). Created from the updated uppercase `BOARD.txt` baseline with an empty board. No workshop/template source or main branch was published.
- Rehearsal Codespace: `vigilant-space-carnival-p79xgw5qpxwfrwqx`, on the repository's `match-01` branch. Stopped after the rehearsal; the private repository and branch history remain for review.
- Starter preflight Codespace: `super-duper-space-winner-r7wjr65v7g7257v9`, created directly from live `igorsdub/git-tic-tac-toe-template` main, then stopped and deleted without a commit or push. The IDE showed the legacy lowercase `board.txt` and “Sign in to use Copilot”; no response was returned before cleanup. This was a preflight attempt, not a successful prompt/response check.
- Pre-existing Codespace `automatic-goggles-jr9x47pwr4ghvq5` was left untouched.

## Manual match 01

Completed in VS Code web using the Source Control flow, not terminal Git commands. The branch was created from `main` and published. I manually edited `BOARD.txt`, inspected the working-tree diff, staged changes, committed moves through the Source Control UI, and used its Sync Changes action. The board file reached this displayed state, but the game-history acceptance failed:

```text
[O] | [ ] | [O]
-----+-----+-----
[X] | [X] | [X]
-----+-----+-----
[ ] | [ ] | [ ]
```

GitHub shows four move-related commits: X center, O top-left, X row 2 column 1, and `d4d649a` (“Complete X row for manual match”). The final commit diff adds both O at row 1 column 3 and X at row 2 column 3 in the same commit; it does not represent alternating single-turn commits. Thus Source Control diff review, staging, commits, and remote sync were exercised, but the facilitator did not complete a valid per-turn match. `match-01` was created from the updated rehearsal repository main, not the live starter. No second Codespace or second account pulled the branch, so partner-side pull/fetch is not verified.

## Copilot rematch

On fresh `match-02` from `main`, Copilot Agent mode was visibly available and produced actual file edits in the Codespace. Three prompts asked for X in row 2 column 2 with all other squares empty. Every proposed diff instead placed X in row 1 column 2. I reviewed each diff in the IDE and used Undo All Edits each time. The branch remained clean. Per the three-attempt limit, I stopped; the Copilot-assisted move task failed. Do not describe the agent as successful at the board task. For a participant without usable Copilot, the workshop fallback remains a manual rematch with the instructor demonstration.

## Live starter preflight

The preflight Codespace was created from live starter `main`, which visibly contained `board.txt` and README. The prompt “What does this repository do?” was submitted, but the Copilot Agent showed “Evaluating” and did not return a response; the model selector said “Sign in to use Copilot.” I stopped and deleted the disposable Codespace without any commit or push. The requested response check therefore remains failed/unverified. No Copilot sign-in or extra authorization was attempted in this preflight.

## Acceptance checklist

| Item | Result | Evidence |
|---|---|---|
| One-account Source Control manual match | **Failed game sequence; Source Control steps exercised** | `match-01` created from `main`; diff review, stage, commits, and sync used. Final commit d4d649a adds O top-right and X row2-column3 together; per-turn alternation was violated. No independent second-user fetch. |
| Two-account/two-Codespace partner collaboration | **Not verified** | Only one GitHub identity used. The user waived this constraint for the adapted run. |
| Copilot Agent actual availability in Codespaces | **Available** | Agent mode returned actual edits in the rehearsal Codespace. |
| Copilot-assisted rematch board correctness | **Failed** | Three diffs all targeted row 1 column 2 instead of row 2 column 2; all rejected, workspace clean. No more retries. |
| Live starter preflight prompt response | **Failed/unverified** | Prompt submitted; Agent stayed at “Evaluating” and model selector required Copilot sign-in. No commit or push. New preflight Codespace stopped and deleted. |
| Copilot-unavailable fallback | **Documented; no participant test** | Manual rematch plus instructor demonstration remains the fallback in the guides. |
| Survey form | **Complete, unpublished** | [Editor](https://docs.google.com/forms/d/1N2-9HYEtIvWLp11hEa2d9NeS1vXBWiUy7xRycXJNW6c/edit) and [preview](https://docs.google.com/forms/d/1N2-9HYEtIvWLp11hEa2d9NeS1vXBWiUy7xRycXJNW6c/preview) show the five bilingual questions. Not accepting responses and not distributed. |

## Remaining verification

A second GitHub account and its Codespace are needed to verify collaborator access, fetch/pull, and the true pair flow. The live starter must receive the local updated template before the direct-starter prompt check can validate the workshop's current contract. Re-run that preflight with Copilot signed in and capture its response. The Copilot rematch needs a human fallback or a separate future design decision; this rehearsal intentionally stopped after three incorrect edits.

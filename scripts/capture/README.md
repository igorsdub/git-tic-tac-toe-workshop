# Setup capture pipeline

Generates the screenshots used by `docs/setup.html`. See `docs/adr/0005-scripted-screenshot-capture-for-setup-guide.md`.

The GitHub UI changes often, so refresh selectors when a capture fails. Selectors live in the step scripts.

## Prerequisites

- Node 18+
- A GitHub account with Codespaces and Copilot enabled
- Optional: `gh` CLI, used to delete the demo repo before each run

## Commands, in order

```
npm install
npx playwright install chromium
npm run capture:login      # headed Chromium; log in to GitHub, the script detects it, saves the login and closes the browser
npm run capture:check      # prints the signed-in GitHub login, or "signed out" (exit 1)
CAPTURE_REPO=tic-tac-toe-demo CAPTURE_RECREATE=1 npm run capture -- create-repo
CAPTURE_REPO=tic-tac-toe-demo npm run capture -- open-codespace
HEADLESS=0 CAPTURE_REPO=tic-tac-toe-demo CAPTURE_CODESPACE_NAME='copy-the-exact-name-from-Codespaces' npm run capture -- look-around
CAPTURE_REPO=tic-tac-toe-demo CAPTURE_CODESPACE_NAME='copy-the-exact-name-from-Codespaces' npm run capture -- delete-codespace
CAPTURE_REPO=tic-tac-toe-demo CAPTURE_OWNER=igorsdub CAPTURE_CODESPACE_NAME='exact-codespace-name' npm run capture -- how-to-play
```

## Notes

- `captures.json` is the contract with `docs/setup.html`: its `steps` list every setup slug and screenshot name. A script throws if it takes a screenshot not listed there. `storyboards` is a separate contract for How to play (`how-to-play`); it does not replace the setup steps.
- Setup outlines stay `#e5484d`. How to play passes `outlineColor: #0969da`. The default in `perform()` remains red.
- How to play captures use a 1100×700 CSS viewport, `deviceScaleFactor: 2`, and 200% browser page zoom in the VS Code Dark Modern theme (`Default Dark Modern`). The script resets `BOARD.txt` on `match-01` to an empty board and deletes only the remote `match-02` branch. It does not create or delete the repository, and it refuses `git-tic-tac-toe-workshop` and `git-tic-tac-toe-template`. Screenshots go to `docs/images/guide/turn/` and `docs/images/guide/rematch/`. The `storyboards/` directory is for setup video timelines, not this still-image storyboard.
- `create-repo` requires an explicit `CAPTURE_REPO` and either `CAPTURE_RECREATE=1` (allow deletion of that exact repository if it exists) or `CAPTURE_SKIP_DELETE=1` (use only when the name is confirmed new). There is no default repository name.
- Screenshots go to `docs/images/setup/<slug>/`; raw recordings and click logs go to `scripts/capture/out/` (ignored).
- The login is saved as a Playwright storage-state file, `.playwright-auth.json`, at the repo root. It holds live GitHub session cookies: never commit it (it is in `.gitignore`, as is the legacy `.playwright-profile/`).
- The saved login expires when GitHub logs you out or the session lapses. When `npm run capture:check` reports "signed out" or steps fail on login, rerun `npm run capture:login`.
- Captures mask the GitHub header avatar and user menu (solid #222222) via Playwright's `mask` option in `shot` and `click`. Existing images still show them; avatars are masked on the next capture run. The username can still appear elsewhere on the page.
- The new Codespace opens in a new tab, which the script closes and reopens in the recorded page. Use `HEADLESS=0` for a manual Copilot sign-in; the script does not approve OAuth or enter credentials.
- After `open-codespace`, copy the exact Codespace name shown on GitHub's Codespaces page. Pass that same `CAPTURE_CODESPACE_NAME` to both `look-around` and `delete-codespace`. Run those steps separately after recording the name; the scripts refuse to choose a Codespace by repository alone.
- `gh` without the `delete_repo` scope cannot delete the selected repository; `create-repo` then deletes it through the web UI (a 404 from `gh` means the repo is already gone). Deleting the repo also removes its Codespaces, so `open-codespace` starts clean.
- Look around submits only after it has selected Ask mode and verified the selected-mode button. If Ask is missing, it saves a diagnostic screenshot and stops without submitting in Agent mode; an incomplete capture cannot be rendered as the finished video. A visible “Waiting for Copilot” label stays on screen while the capture waits up to 120 s for the completed answer. Its first 4.7 s remain at normal speed to preserve the post-action hold, zoom-out, and wide interval; the remaining recorded wait plays at 4× speed. Capture and user actions stay at normal speed.
- `delete-codespace` requires both `CAPTURE_REPO` and the exact `CAPTURE_CODESPACE_NAME`. It checks that the name and repository identify one list entry, requires the confirmation dialog to name that exact Codespace, deletes it through GitHub, and verifies that it disappears. It will not choose the first Codespace for a repository.

# Setup capture pipeline

Generates the screenshots and per-step videos used by `docs/setup.html`. See `docs/adr/0005-scripted-screenshot-capture-for-setup-guide.md`.

**Selectors were verified against the live GitHub UI on 2026-10-21** (all four steps pass headless) but GitHub's UI changes often, so expect to refresh them. Selectors live in the `SELECTORS` object at the top of each step script.

## Prerequisites

- Node 18+
- ffmpeg on PATH (video step only)
- A GitHub account with Codespaces and Copilot enabled
- Optional: `gh` CLI, used to delete the demo repo before each run

## Commands, in order

```
npm install
npx playwright install chromium
npm run capture:login      # headed Chromium; log in to GitHub, the script detects it, saves the login and closes the browser
npm run capture:check      # prints the signed-in GitHub login, or "signed out" (exit 1)
npm run capture            # all steps, headless, using the saved login
npm run capture -- look-around   # one step only
npm run capture:video      # zoomed mp4 per step from the recordings
```

## Notes

- `captures.json` is the contract with `docs/setup.html`: it lists every step slug and screenshot name. A script throws if it takes a screenshot not listed there.
- The demo repo (`CAPTURE_REPO`, default `tic-tac-toe-demo`) is deleted and recreated on every run.
- Screenshots go to `docs/images/setup/<slug>/`; raw recordings and click logs go to `scripts/capture/out/` (ignored).
- The login is saved as a Playwright storage-state file, `.playwright-auth.json`, at the repo root. It holds live GitHub session cookies: never commit it (it is in `.gitignore`, as is the legacy `.playwright-profile/`).
- The saved login expires when GitHub logs you out or the session lapses. When `npm run capture:check` reports "signed out" or steps fail on login, rerun `npm run capture:login`.
- Captures mask the GitHub header avatar and user menu (solid #222222) via Playwright's `mask` option in `shot` and `click`. Existing images still show them; avatars are masked on the next capture run. The username can still appear elsewhere on the page.
- Headless Chromium works for the Codespace editor; no `HEADLESS=0` needed. The new codespace opens in a new tab, which the script closes and reopens in the recorded page.
- Video zoom timing (constants at the top of `zoom.js`): other steps use a 2x zoom that eases in over 1.2 s, holds 3.0 s after the click, then eases out over 1.2 s. Look around uses a 3 s whole-screen intro, eases to 2x over 1.2 s, shows its red outline for 0.5 s before each action, then holds the focused view for 2.5 s. It eases back to 1x over 1.2 s and leaves a 1 s whole-screen interval before the next zoom. The smoothstep (3x^2-2x^3) easing applies to zoom and pan; Look around capture checks that actions are far enough apart for the full sequence. Its recording begins at the intro and retains the whole answer after the last action.
- `gh` without the `delete_repo` scope cannot delete the demo repo; `create-repo` then deletes it through the web UI (a 404 from `gh` means the repo is already gone). Deleting the repo also removes its codespaces, so `open-codespace` always starts clean.
- Look around submits only after it has selected Ask mode and verified the selected-mode button. If Ask is missing, it saves a diagnostic screenshot and stops without submitting in Agent mode. A visible “Waiting for Copilot” label stays on screen while the capture waits up to 120 s for the completed answer. Its first 4.7 s remain at normal speed to preserve the post-action hold, zoom-out, and wide interval; the remaining recorded wait plays at 4× speed. Capture and user actions stay at normal speed.
- `gh codespace` needs the `codespace` scope; the scripts do not use it and stop the codespace through the web UI.

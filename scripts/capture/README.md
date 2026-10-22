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
- Video zoom timing (constants at the top of `zoom.js`): 2x zoom eases in over 1.2 s (reaching full zoom at the click), holds 3.0 s after the click, then eases out over 1.2 s, all with smoothstep (3x^2-2x^3) for both zoom level and pan. Every click gets its own zoom that returns fully to the centred 1x view (pan and zoom ease back together) before the next one starts; there is no gliding between clicks. If the next click is too close, the hold is shortened (minimum 1.0 s) so the zoom-out finishes before the next ease-in, and if even that does not fit the ease-out and ease-in run back to back. Each video starts 2 s before the first click and runs to the end of the recording, so the outcome of the last click (editor loaded, Copilot answer) stays visible.
- `gh` without the `delete_repo` scope cannot delete the demo repo; `create-repo` then deletes it through the web UI (a 404 from `gh` means the repo is already gone). Deleting the repo also removes its codespaces, so `open-codespace` always starts clean.
- The web editor currently offers only Agent mode in Copilot Chat (no Ask). `look-around` uses Ask when present and otherwise asks the question in Agent mode.
- `gh codespace` needs the `codespace` scope; the scripts do not use it and stop the codespace through the web UI.

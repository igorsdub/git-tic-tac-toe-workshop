# Setup capture pipeline

Generates the screenshots and per-step videos used by `docs/setup.html`. See `docs/adr/0005-scripted-screenshot-capture-for-setup-guide.md`.

**The first real run is expected to need selector fixes.** GitHub's UI changes often and these scripts have not been run against it yet. Selectors live in the `SELECTORS` object at the top of each step script.

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
- Captures show your avatar and username.

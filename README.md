# Git Tic-Tac-Toe Workshop

This two-hour workshop teaches collaborative Git through a paired tic-tac-toe game. Learners make and review commits together, then repeat the board-edit workflow with Copilot making the edit they previously made by hand.

## Workshop documents

- [Design history](WORKSHOP_DESIGN_HANDOFF.md) (historical record; the guides below are current)
- [Local delivery status and blockers](planning/delivery-status-2026-10-20.md)
- [Learner guide](LEARNER_GUIDE.md) and [How to play](docs/guide.html)
- [Facilitator guide](FACILITATOR_GUIDE.md), which holds the only copy of the agenda
- [Pre-session checklist](PRE_SESSION_CHECK.md) and [Setup page](docs/setup.html)
- [Rehearsal guide](REHEARSAL_GUIDE.md)
- [Survey text](SURVEY.md). The [SOKENDAI survey](https://forms.gle/eo9pgChEGpdvdcQ67) is live; its link is the `surveyUrl` in the catalog.
- [Game Wall](docs/index.html)
- [Capture pipeline](scripts/capture/README.md)
- [Glossary](GLOSSARY.md)

## Workshop links

The main Game Wall opens the organiser-designated default workshop, SOKENDAI (2026-11-06). SCDA Training Week is archived. Use a workshop-specific link to open its Game Wall or prefilled registration form directly.

The shared event context on the Game Wall, Setup page, and How to play reads event names, ISO dates, status, registration links, and optional `note` text from [`docs/workshops.json`](docs/workshops.json). Each workshop may also set `setupTrack` (`"codespaces"` or `"local"`) and `surveyUrl`. Change the catalog's `defaultWorkshopId` to designate a different plain-URL default; stable workshop links continue using their own `?workshop=<id>` value.

| Workshop | Game Wall | Register a pair repository |
|---|---|---|
| SCDA Training Week (2026-10-01) | [Game Wall](https://igorsdub.github.io/git-tic-tac-toe-workshop/?workshop=2026-10-01-scda) | [Registration form](https://github.com/igorsdub/git-tic-tac-toe-workshop/issues/new?template=register-game.yml&workshop_id=2026-10-01-scda) |
| SOKENDAI (2026-11-06) | [Game Wall](https://igorsdub.github.io/git-tic-tac-toe-workshop/?workshop=2026-11-06-sokedai) | [Registration form](https://github.com/igorsdub/git-tic-tac-toe-workshop/issues/new?template=register-game.yml&workshop_id=2026-11-06-sokedai) |
| RIKEN (2026-11-10) | [Game Wall](https://igorsdub.github.io/git-tic-tac-toe-workshop/?workshop=2026-11-10-riken) | [Registration form](https://github.com/igorsdub/git-tic-tac-toe-workshop/issues/new?template=register-game.yml&workshop_id=2026-11-10-riken) |

## Staged learner path

Learners move through three pages, linked by a shared stage strip and Next links: Setup page (`docs/setup.html`), How to play (`docs/guide.html`), then the Game Wall (`docs/index.html`). The Game Wall is the plain-URL landing page.

The Setup page adapts to the selected workshop (`?workshop=<id>`):

- **Archived** (for example SCDA Training Week): the setup steps are replaced by a notice that the workshop is archived, and no Next link is shown.
- **`setupTrack: "codespaces"`** (SOKENDAI and RIKEN): the step-by-step Codespaces track with screenshots and videos, per-step checkboxes remembered in the browser, and the workshop's `surveyUrl` when set.
- A workshop with no `setupTrack` shows "Setup for this workshop is not published yet".

The Setup page has no Register button; registration is the **Register repository** button on the Game Wall.

## How to run tests

```
npm test
```

Without npm:

```
node --test tests/*.cjs tests/*.js
python3 -m unittest discover -s tests -p 'test_*.py'
```

The DOM tests (`tests/test_dashboard_dom.cjs`, `tests/test_setup_dom.cjs`) need Chrome or Chromium and are skipped if none is found. Set `CHROMIUM_BIN` to point at a specific binary.

## Repository map

- [`template/`](template/README.md) is the local reference for the learner starter repository: its current `BOARD.txt`, editing conventions, and canonical empty-board example. Publish changes to the separate template repository explicitly.
- [`scripts/`](scripts/) contains board validation, registration parsing, and registry synchronization.
- [`scripts/capture/`](scripts/capture/README.md) is the Playwright pipeline that regenerates the Setup page's screenshots and videos; `captures.json` there lists every step slug and screenshot name.
- [`tests/`](tests/) covers the workshop guides, parser, Game Wall, and slides. `tests/fixtures/legacy-board/` preserves older board formats as compatibility fixtures.
- [`docs/`](docs/) contains the Pages site and instructor Game Wall. The separate [`docs/slides/`](docs/slides/) directory contains the workshop presentation.

## Agenda

The agenda is in the [Facilitator guide](FACILITATOR_GUIDE.md#agenda-120-minutes). It is not repeated elsewhere.

## Environment and Git workflow

Each learner uses their own Codespace in the browser-based VS Code editor. Each pair works in one shared public GitHub repository. Learners use VS Code's Source Control view for every turn: Pull, edit one cell and save, stage with +, Commit with a clear message, Sync Changes. The terminal is not the teaching path.

`BOARD.txt` is three rows of three single-space-separated cells (`.`, `X`, `O`); a move replaces one `.`. The manual match teaches the whole workflow. In the agent-assisted rematch, learners ask Copilot in agent mode "Place X in the center of the board" for X's first move, inspect the diff, then stage, commit, and sync the change themselves. O players and later turns name their chosen square.

Before the workshop, each learner creates a public repository from the template under their own account, opens it in a Codespace, runs the readiness check, stops the Codespace, and keeps both. The readiness check: open Copilot Chat, type exactly "What does this repository do?", and expect an answer that mentions tic-tac-toe and `BOARD.txt`. See the [Pre-session checklist](PRE_SESSION_CHECK.md) and the [Setup page](docs/setup.html). At the session each pair chooses one prepared repository and opens it in separate Codespaces.

## Registration and delivery status

Each pair registers its shared repository once for the workshop and supplies both player GitHub handles. The registry discovers every lowercase `match…` branch on each successful refresh; each matching branch becomes its own Game Wall card, and the board is read from that branch. A successful registration comment confirms the repository/workshop link. A card appears after a successful refresh finds a matching branch. A repository can belong to only one workshop; use a fresh template copy for another workshop. Archived workshops remain visible and accept updates to existing repositories, including corrected handles, while rejecting new repository registrations.

Existing registrations map to workshop `2026-10-01-scda`. The legacy `Default Event` record remains preserved outside workshop Game Walls pending review. The two-account rehearsal remains incomplete. See the [delivery status](planning/delivery-status-2026-10-20.md) before the workshop.

## GitHub Pages deployment

The Game Wall refresh workflow publishes the `docs/` directory as a GitHub Pages artifact. GitHub Pages must use the **GitHub Actions** publishing source for that workflow to deploy. The current repository setting uses the legacy `main` branch `/docs` source; commits made by the workflow with `GITHUB_TOKEN` do not trigger builds from that source. A repository administrator must make this one-time change under **Settings → Pages → Build and deployment → Source → GitHub Actions**. The workflow cannot switch an existing legacy publishing source automatically.

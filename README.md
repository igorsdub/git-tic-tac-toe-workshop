# Git Tic-Tac-Toe Workshop

This two-hour workshop teaches collaborative Git through a paired tic-tac-toe game. Learners make and review commits together, then repeat the board-edit workflow with Copilot making the edit they previously made by hand.

## Workshop documents

- [Design history](WORKSHOP_DESIGN_HANDOFF.md) (historical record; the guides below are current)
- [Local delivery status and blockers](planning/delivery-status-2026-10-20.md)
- [Learner guide](LEARNER_GUIDE.md), [Git Collaboration](docs/guide.html), and [Agentic Coding](docs/play-2.html)
- [Time machine](TIME_MACHINE.md) take-home page ([web version](docs/time-machine.html))
- [Facilitator guide](FACILITATOR_GUIDE.md), which holds the only copy of the agenda
- [Pre-session checklist](PRE_SESSION_CHECK.md) and [Setup page](docs/setup.html)
- [Rehearsal guide](REHEARSAL_GUIDE.md)
- [Survey text](SURVEY.md). The [SOKENDAI survey](https://forms.gle/eo9pgChEGpdvdcQ67) is live; its link is the `surveyUrl` in the catalog.
- [Game Wall](docs/wall.html)
- [Site mode setting](docs/site-config.js)
- [Capture pipeline](scripts/capture/README.md)
- [Glossary](GLOSSARY.md)

## Workshop links

The plain site URL follows the single `setupOnly` setting in [`docs/site-config.js`](docs/site-config.js): when true, it opens Setup; when false, it opens the Game Wall. Open [`docs/wall.html`](docs/wall.html) directly for the Game Wall. The default workshop is RIKEN (2026-11-10). SOKENDAI and SCDA Training Week are archived and omitted from the workshop selector. Their Game Wall history stays viewable at `?workshop=<id>`. Use a workshop-specific `?workshop=<id>` link to select an event.

The shared event context on the Game Wall, Setup page, and How to play reads event names, ISO dates, status, registration links, and optional `note` text from [`docs/workshops.json`](docs/workshops.json). Each workshop may also set `setupTrack` (`"codespaces"` or `"local"`) and `surveyUrl`. Change the catalog's `defaultWorkshopId` to designate a different plain-URL default; stable workshop links continue using their own `?workshop=<id>` value.

| Workshop | Game Wall | Register a pair repository |
|---|---|---|
| SCDA Training Week (2026-10-01) | [Game Wall](https://igorsdub.github.io/git-tic-tac-toe-workshop/wall.html?workshop=2026-10-01-scda) | [Registration form](https://github.com/igorsdub/git-tic-tac-toe-workshop/issues/new?template=register-game.yml&workshop_id=2026-10-01-scda) |
| SOKENDAI (2026-11-06) | [Game Wall](https://igorsdub.github.io/git-tic-tac-toe-workshop/wall.html?workshop=2026-11-06-sokedai) | [Registration form](https://github.com/igorsdub/git-tic-tac-toe-workshop/issues/new?template=register-game.yml&workshop_id=2026-11-06-sokedai) |
| RIKEN (2026-11-10) | [Game Wall](https://igorsdub.github.io/git-tic-tac-toe-workshop/wall.html?workshop=2026-11-10-riken) | [Registration form](https://github.com/igorsdub/git-tic-tac-toe-workshop/issues/new?template=register-game.yml&workshop_id=2026-11-10-riken) |

## Staged learner path

In full mode, learners move through Setup (`docs/setup.html`), Git Collaboration (`docs/guide.html`), Agentic Coding (`docs/play-2.html`), and the Game Wall (`docs/wall.html`) using the stage strip, which ends with **Register repository**. In setup-only mode, the strip, registration controls, and onward links are hidden; the plain site URL opens Setup. Set `setupOnly` to `false` in `docs/site-config.js` to restore full mode. The RIKEN catalog entry's `pages` field points at those four pages.

The Setup page adapts to the selected workshop (`?workshop=<id>`):

- **Archived** (SOKENDAI and SCDA Training Week): archived workshops are omitted from the workshop selector. Open `?workshop=<id>` to view that Game Wall. Setup for an archived workshop says the workshop has finished.
- **`setupTrack: "codespaces"`** (RIKEN): the Codespaces track with screenshots and a checklist remembered in the browser. The setup page has no survey and no Codespace-deletion section.
- A workshop with no `setupTrack` shows "Setup for this workshop is not published yet".

In full mode, use **Register repository** in the stage strip to open the selected workshop's registration form.

## How to run tests

```
npm test
```

Without npm:

```
node --test tests/*.cjs tests/*.js
python3 -m unittest discover -s tests -p 'test_*.py'
```

The DOM tests (`tests/test_dashboard_dom.cjs`, `tests/test_setup_dom.cjs`, `tests/test_site_mode_dom.cjs`) need Chrome or Chromium and are skipped if none is found. Set `CHROMIUM_BIN` to point at a specific binary.

## Local preview

Run `npm run preview` and open [http://127.0.0.1:8765/docs/setup.html](http://127.0.0.1:8765/docs/setup.html). Set `PORT` to choose another port. This server supports byte ranges so the setup-page MP4 controls can seek during local preview.

## Repository map

- [`template/`](template/README.md) is the local reference for the learner starter repository: its current `BOARD.txt`, editing conventions, and canonical empty-board example. Publish changes to the separate template repository explicitly.
- [`scripts/`](scripts/) contains board validation, registration parsing, and registry synchronization.
- [`scripts/capture/`](scripts/capture/README.md) is the Playwright pipeline that regenerates the Setup page's screenshots; `captures.json` there lists every step slug and screenshot name.
- [`tests/`](tests/) covers the workshop guides, parser, Game Wall, and slides. `tests/fixtures/legacy-board/` preserves older board formats as compatibility fixtures.
- [`docs/`](docs/) contains the Pages site. `index.html` routes according to `setupOnly`; `wall.html` is the instructor Game Wall. The separate [`docs/slides/`](docs/slides/) directory contains the workshop presentation.

## Agenda

The agenda is in the [Facilitator guide](FACILITATOR_GUIDE.md#agenda-120-minutes). It is not repeated elsewhere.

## Environment and Git workflow

Each learner uses their own Codespace in the browser-based VS Code editor. Each pair works in one shared public GitHub repository. **Main branch is sacred: don't modify it.** The owner creates branch `match` on github.com before the pair opens Codespaces. Copilot later creates `rematch` from `main` for a second game. Agentic Coding writes tests on `feature/testing`. A turn on `match` is Pull, edit one cell, Commit and Sync.

`BOARD.txt` is three rows of three single-space-separated cells (`.`, `X`, `O`); a move replaces one `.`. Copilot in Agent mode edits the named square. The learner checks the diff and discards it when it is wrong. Ask mode explains. Plan mode is not used.

Before the workshop, each learner creates a public repository from the template under their own account, fills in **Description**, and may tick **Include all branches**. The template has only `main`, so the copy is just `main`. They open it in a Codespace and run the readiness check: Copilot answers "What does this repository do?" with tic-tac-toe and `BOARD.txt`. See the [Pre-session checklist](PRE_SESSION_CHECK.md) and the [Setup page](docs/setup.html).

## Registration and delivery status

Each pair registers its shared repository once for the workshop and supplies both player GitHub handles. The registry discovers every branch whose name contains `match` in any case (`match`, `Match`, `rematch`, `match-1`) on each successful refresh; `main` never appears. Each matching branch becomes its own Game Wall card, and the board is read from that branch. A successful registration comment confirms the repository/workshop link. A card appears after a successful refresh finds a matching branch. A repository can belong to only one workshop; use a fresh template copy for another workshop. Archived workshops remain visible and accept updates to existing repositories, including corrected handles, while rejecting new repository registrations.

Existing registrations map to workshop `2026-10-01-scda`. The legacy `Default Event` record remains preserved outside workshop Game Walls pending review. The two-account rehearsal remains incomplete. See the [delivery status](planning/delivery-status-2026-10-20.md) before the workshop.

## GitHub Pages deployment

The Game Wall refresh workflow publishes the `docs/` directory as a GitHub Pages artifact. GitHub Pages must use the **GitHub Actions** publishing source for that workflow to deploy. The current repository setting uses the legacy `main` branch `/docs` source; commits made by the workflow with `GITHUB_TOKEN` do not trigger builds from that source. A repository administrator must make this one-time change under **Settings → Pages → Build and deployment → Source → GitHub Actions**. The workflow cannot switch an existing legacy publishing source automatically.

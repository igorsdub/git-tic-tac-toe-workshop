# Workshop Rehearsal Guide & Operational Readiness

This document provides facilitators and instructional teams with a comprehensive operational rehearsal protocol, operating system validation matrix, timing guarantees, and contingency workflows for the **Git Tic-Tac-Toe Workshop**.

A successful workshop relies on smooth technical setup, tight time management, and a seamless live demonstration. Completing this rehearsal protocol ensures the facilitator team is fully prepared before learners arrive.

---

## 1. Operational Readiness Timeline & Checklist

Conduct rehearsals in three progressive milestones prior to the event:

```
[ T - 7 Days ] ──► Full Facilitator Rehearsal (Dry Run with Demo Partner)
[ T - 2 Days ] ──► Venue Network, Firewall & Projection Check
[ T - 1 Hour ] ──► Pre-Flight Room Staging & Live System Reset
```

### Readiness Checklist

#### A. Facilitator Team Roles
- [ ] **Lead Facilitator (Player X)** identified and rehearsed on live demo script.
- [ ] **Prepared Second Player / TA (Player O)** briefed on live demo script and turn timings.
- [ ] **Floating TAs (1 per 8–10 learners)** assigned for roving table assistance during pair play.
- [ ] All facilitators reviewed the [Facilitator Guide](FACILITATOR_GUIDE.md) and [Pre-Session Readiness Checklist](PRE_SESSION_CHECK.md).

#### B. Room, Network & Projection
- [ ] Venue Wi-Fi tested on both macOS and Windows test laptops.
- [ ] Outbound SSH port 22 verified (`ssh -T git@github.com`).
- [ ] HTTPS clone/push verified without captive-portal or proxy interference.
- [ ] Room projector tested with presentation laptop at native 1080p (1920x1080) resolution.
- [ ] Game Wall ([docs/index.html](docs/index.html)) loaded in browser and verified in Projection Mode (`📽️`).

#### C. Starter Template & Registrations
- [ ] Template repository [igorsdub/tic-tac-toe-template](https://github.com/igorsdub/tic-tac-toe-template) verified public and accessible.
- [ ] Registration issue form ([.github/ISSUE_TEMPLATE/register-game.yml](.github/ISSUE_TEMPLATE/register-game.yml)) accessible and accepting test issues.
- [ ] Clean demo repository created for the live demonstration (or previous demo repo purged).

---

## 2. Operating System Readiness Matrix & Validation Procedures

Learners bring laptops running macOS, Windows, or Linux. The instructional team must validate each platform's environment during setup.

### 2.1 OS Readiness Matrix

| Feature | macOS | Windows (Git Bash / PowerShell) | Linux (Ubuntu / Debian / Fedora) |
|---|---|---|---|
| **Recommended Shell** | Terminal (zsh / bash) | **Git Bash** (recommended) or PowerShell | Native Terminal (bash / zsh) |
| **Git Tooling** | Xcode CLI Tools or Homebrew (`brew install git`) | [Git for Windows](https://git-scm.com/download/win) | Package manager (`sudo apt install git`) |
| **Default Line Endings** | LF (`core.autocrlf = input`) | CRLF &rarr; LF (`core.autocrlf = true`) | LF (`core.autocrlf = input`) |
| **Credential Storage** | Apple Keychain (`osxkeychain`) or GCM | Git Credential Manager (GCM) for Windows | `libsecret` or `credential-cache` |
| **Push Auth Options** | SSH (`~/.ssh/id_ed25519`) or HTTPS via GCM / `gh` | HTTPS via GCM browser pop-up or SSH | SSH key or `gh auth login` |
| **Text Editor Fallback** | VS Code, TextEdit (Plain Text), Nano | VS Code, Notepad, Nano | VS Code, Gedit, Nano |
| **GUI Fallback** | [GitHub Desktop for Mac](https://desktop.github.com/) | [GitHub Desktop for Windows](https://desktop.github.com/) | Web editor (`github.dev` / `.`) |

### 2.2 Validation Procedures

During the initial 10-minute setup window, facilitators run or instruct learners to execute these verification commands:

#### Step 1: Git Installation Check
```bash
git --version
```
- **Expected:** `git version 2.x.x` (version $\ge$ 2.20).
- **If Missing:** 
  - *macOS:* Prompt `xcode-select --install`.
  - *Windows:* Launch installer from [git-scm.com](https://git-scm.com/download/win).
  - *Linux:* `sudo apt-get install git`.

#### Step 2: Author Identity Configuration Check
```bash
git config --global user.name
git config --global user.email
```
- **Expected:** Returns learner's actual name and registered GitHub email.
- **Remediation if Blank:**
  ```bash
  git config --global user.name "Firstname Lastname"
  git config --global user.email "name@example.com"
  ```
- *Why:* Ensures clean author names on the Game Wall and in `git log`.

#### Step 3: Remote Push Authentication Check
Verify authentication before pairing begins:
- **SSH Users:**
  ```bash
  ssh -T git@github.com
  ```
  Expected: `"Hi <username>! You've successfully authenticated..."`
- **HTTPS Users:**
  Learners authenticate on their first push via the Git Credential Manager browser pop-up.
- **GitHub CLI Users:**
  ```bash
  gh auth status
  ```

---

## 3. Instructor + Prepared Co-Facilitator Live Rehearsal Protocol

The live demonstration (Minutes 00:20 – 00:40) must be rehearsed end-to-end at least once prior to the session. The demonstration simulates the exact learner journey from the starter template to two published moves.

```
[ Instructor (Player X) ]                     [ Prepared Co-Player (Player O) ]
           │                                                 │
           ├─► 1. Spawn Repo from Template                   │
           ├─► 2. Invite Player O Collaborator ─────────────►│
           │                                                 ├─► 3. Accept Invite & Clone
           ├─► 4. Edit Square 5, Commit & Push Move 1        │
           │                                                 ├─► 5. Pull Move 1
           │                                                 ├─► 6. Edit Square 1, Commit & Push Move 2
           ├─► 7. Pull Move 2 & Show `git log`               │
           └─► 8. Register on Game Wall ─────────────────────┴─► Both appear on projector
```

### Rehearsal Execution Steps

#### Phase 1: Repository Instantiation (Player X)
1. Lead Instructor navigates to [igorsdub/tic-tac-toe-template](https://github.com/igorsdub/tic-tac-toe-template).
2. Clicks **Use this template** &rarr; **Create a new repository**.
3. Names the repository: `git-ttt-demo-rehearsal`.
4. Sets visibility to **Public** (required for the Game Wall).
5. Navigates to **Settings > Collaborators > Add people** and invites the co-facilitator's GitHub handle.

#### Phase 2: Onboarding & Clone (Player O)
1. Prepared co-facilitator accepts the collaboration invitation via GitHub email or notification.
2. In terminal, clones the newly created repository:
   ```bash
   git clone https://github.com/<instructor-handle>/git-ttt-demo-rehearsal.git
   cd git-ttt-demo-rehearsal
   ```
3. Runs `git status` to verify clean working branch.

#### Phase 3: Move 1 (Player X)
1. Lead Instructor clones repo locally:
   ```bash
   git clone https://github.com/<instructor-handle>/git-ttt-demo-rehearsal.git
   cd git-ttt-demo-rehearsal
   ```
2. Inspects `board.md`.
3. Updates player handles in header:
   ```markdown
   Player X: @<instructor-handle>
   Player O: @<coplayer-handle>
   State: Waiting for O
   ```
4. Places `X` in square 5 (center):
   ```text
    [ ] | [ ] | [ ]
   -----+-----+-----
    [ ] | [X] | [ ]
   -----+-----+-----
    [ ] | [ ] | [ ]
   ```
5. Executes Git sequence aloud:
   ```bash
   git status
   git diff
   git add board.md
   git commit -m "Move 1: X takes center square 5"
   git push origin main
   ```
6. Confirms commit appears on GitHub remote.

#### Phase 4: Move 2 (Player O)
1. Co-player displays local un-updated `board.md`.
2. Runs:
   ```bash
   git pull origin main
   ```
3. Shows that square 5 now has `X`.
4. Changes state header to `State: Waiting for X`.
5. Places `O` in square 1 (top-left):
   ```text
    [O] | [ ] | [ ]
   -----+-----+-----
    [ ] | [X] | [ ]
   -----+-----+-----
    [ ] | [ ] | [ ]
   ```
6. Executes Git sequence:
   ```bash
   git add board.md
   git commit -m "Move 2: O claims top-left square 1"
   git push origin main
   ```

#### Phase 5: Verification & Game Wall Registration
1. Lead Instructor runs `git pull origin main`.
2. Lead Instructor executes:
   ```bash
   git log --oneline --graph
   ```
   Points out the two distinct commits with separate author attributions.
3. Submits an issue in the workshop repository using the [Game Registration Form](.github/ISSUE_TEMPLATE/register-game.yml).
4. Verifies that the Game Wall refreshes within 30 seconds and shows the live game card with active status.

*Rehearsal target:* Complete entire sequence in **12–15 minutes** with no hesitations.

---

## 4. Special Contingency Protocols

### 4.1 Odd Learner Count Protocol

When an odd number of learners attend ($2N + 1$):

```
       ┌───────────────────────────────┐
       │   Total Attendees: 2N + 1     │
       └──────────────┬────────────────┘
                      ▼
         [ Is an unassigned TA free? ]
               ├── YES ──► TA pairs with extra learner as Player O
               └── NO  ──► Form ONE 3-person team (Trio Model)
```

#### Protocol A: Facilitator / TA Pairs as Player O (Recommended)
- **Role:** Floating TA or Lead Facilitator joins the solo learner as Player O.
- **Pacing Preservation Rule:** The instructor/TA must strictly match the learner's natural pace:
  - Do **not** pre-empt moves or rush commands.
  - Ask guiding questions: *"What does `git status` say we should do next?"* or *"Where should I put my O?"*
  - Ensure the learner performs all their own typing, commits, and pushes.

#### Protocol B: The Trio Model (Driver-Navigator-Advisor)
If no instructional staff is available to pair:
- Form one 3-person team on a single game repository.
- Learner A is Player X.
- Learners B & C share the Player O role:
  - Learner B is the **Driver** (types commands for Turn 2).
  - Learner C is the **Navigator / Strategist** (reviews diffs, drafts commit messages for Turn 2).
  - For Turn 4, Learners B & C swap roles.
- This preserves the standard 2-player board format and turn parity without modifying the canonical game rules.

---

### 4.2 Setup Fallback Protocol (Zero-Fatigue Setup)

If a learner experiences persistent local environment problems (e.g. broken terminal PATH, corrupted SSH configuration, system permission locks) that cannot be resolved within the 10-minute setup window:

> [!CAUTION]
> **The 10-Minute Hard Stop:** Never stall the room or let a pair sit idle for 20 minutes while debugging one machine's terminal. Protect the workshop pacing.

Apply this immediate 3-step fallback:

1. **Assign Strategic Navigator Role:**
   - The learner with the working machine becomes **Player X (Driver)**.
   - The learner with unresolved setup becomes **Player O (Strategist & Navigator)**.
   - Both learners sit together at the working laptop. The Navigator dictates moves, checks board coordinates, and drafts commit messages while the Driver types.
2. **Alternative Instant GUI / Web Access:**
   - If the learner wants hands-on typing from their own laptop, have them open the repository in a web browser and press `.` (dot) on GitHub to launch the browser-based web editor, or install **GitHub Desktop**.
3. **Post-Session Catch-Up & Verification:**
   - At the conclusion of the workshop, an instructor spends 5–10 minutes 1-on-1 with the learner to repair their local Git configuration.
   - The learner clones the pair's completed game repository, adds a post-game reflection or rematch note, commits, and pushes to verify local end-to-end operation.

---

## 5. Game Wall Load Test Rehearsal Protocol

Before projecting the Game Wall in front of 20–40 learners, the facilitator must verify performance and layout stability at scale. Full technical specifications are documented in [docs/load_test_simulation.md](docs/load_test_simulation.md).

### Verification Steps

1. **Load Scale Verification (10 & 20 Repositories):**
   - Open [docs/index.html](docs/index.html) in the presentation browser.
   - Open Developer Tools Console and execute the simulation script from [docs/load_test_simulation.md](docs/load_test_simulation.md) to generate 10 and 20 simulated cards.
   - Verify that all cards render crisply, grid CSS flexbox/grid layouts reflow cleanly, and no horizontal scrollbars occur.
2. **Projection Mode Test:**
   - Toggle **Projection Mode** (`📽️`) in the Game Wall header.
   - Confirm high-contrast board markings, enlarged typography, and clear badge indicators.
3. **API Rate-Limit Handling Verification:**
   - Simulate GitHub API 403 response or network timeout.
   - Confirm that the Game Wall displays the yellow notice banner (`"GitHub API rate limit reached. Displaying simulated workshop games."`) and gracefully renders mock game data without blank screens.
4. **Auto-Refresh Countdown Check:**
   - Confirm the countdown timer decrements from 30 seconds and refreshes seamlessly without causing screen flicker or clearing user search filters.

---

## 6. Timed Rehearsal Validation Check (60+ Min Pair Play Guarantee)

The heart of the workshop is active, hands-on pair play. Cognitive retention drops sharply if lecture or demonstration encroaches on learner typing time.

### Workshop Timeline Audit

| Phase | Duration | Cumulative Time | Inviolable Rule |
|---|---|---|---|
| **1. Pair Up & Setup** | 10 min | 00:00 – 00:10 | Hard cut-off at 10 min; trigger Setup Fallback if needed. |
| **2. Shared Board Mental Model** | 10 min | 00:10 – 00:20 | Conceptual overview only; no learner typing yet. |
| **3. Live Demonstration** | 20 min | 00:20 – 00:40 | Strict 20-min cap; show Moves 1 & 2 only. |
| **4. Paired Game Play** | **60 min** | **00:40 – 01:40** | **GUARANTEE: At least 60 full minutes reserved for pair play.** |
| **5. Game Wall & History Discussion** | 15 min | 01:40 – 01:55 | Group debrief around projector and `git log`. |
| **6. Research & Work Transfer** | 5 min | 01:55 – 02:00 | Closing connections to scientific code and pipelines. |

### Time Buffer Management
- If the live demonstration finishes early (e.g. in 15 minutes), **add the saved 5 minutes directly to Paired Game Play** (giving 65 minutes).
- If setup runs 5 minutes over due to room logistics, **compress Phase 2 (Mental Model) to 5 minutes**. **NEVER reduce Phase 4 below 60 minutes.**

---

## 7. Research Transfer Closing Discussion Check

During the final 5 minutes (01:55 – 02:00), facilitators guide learners to bridge the game mechanics to real-world software and scientific research workflows.

Use this facilitator checklist and discussion prompts:

- [ ] **Turn-Taking &rarr; Concurrent Collaboration:**
  - *Prompt:* *"In tic-tac-toe, we took turns sequentially. What happens in research when two data scientists edit different functions or files simultaneously?"*
  - *Takeaway:* Git tracks changes line-by-line across multiple files. The 'pull before editing' habit prevents overwriting a colleague's analysis or manuscript draft.
- [ ] **Commit Messages &rarr; Lab Notebook Provenance:**
  - *Prompt:* *"Look at your `git log`. How is a commit message like an entry in an electronic lab notebook?"*
  - *Takeaway:* High-quality commit messages (`"Fix baseline covariate filter in Table 1"`) explain *why* a change occurred, enabling auditability and reproducibility years later.
- [ ] **Author Identity & `git config` &rarr; Scientific Attribution:**
  - *Prompt:* *"Notice how every square in history records exactly who made the move. Why is this critical in open science?"*
  - *Takeaway:* Proper author identity ensures academic credit, accountability, and clear contribution tracking for scientific software.
- [ ] **Branch Rematches &rarr; Exploratory Research:**
  - *Prompt:* *"For pairs who played a rematch on a branch: how does that relate to testing a new hypothesis?"*
  - *Takeaway:* Branches allow researchers to test experimental methods or alternative statistical models without destabilizing the validated mainline analysis.

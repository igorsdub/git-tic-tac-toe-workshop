# Facilitator Guide: Paired Git Tic-Tac-Toe Workshop

This guide provides comprehensive instructions for running the two-hour **Git Tic-Tac-Toe Workshop**. In this workshop, pairs of learners play a game of tic-tac-toe by committing and pushing moves to a shared GitHub repository.

The goal is to provide a tactile, zero-fatigue introduction to collaborative version control: making commits, pushing to a remote, pulling changes from a collaborator, and reading project history—without needing programming languages, package managers, or complex build tools.

---

## Workshop Overview & Learning Objectives

- **Target Audience:** Absolute beginners and novice Git users (researchers, data scientists, students, software teams).
- **Format:** Paired hands-on activity (2 learners per team).
- **Duration:** 120 minutes (2 hours).
- **Key Learning Outcomes:**
  1. Understand the relationship between local working copies and remote repositories on GitHub.
  2. Master the core collaborative cycle: `git pull` &rarr; edit &rarr; `git add` / `git commit` &rarr; `git push`.
  3. Understand commit authorship, commit messages, and repository history (`git log`).
  4. Build confidence reading Git status and diagnostic messages.
  5. Connect paired game mechanics to collaborative code and scientific research projects.

---

## Ground Rules & Technical Environment

1. **Terminal Git as the Common Baseline**
   - Teach using the terminal / command line (`git ...`). Terminal Git operates identically across Linux, macOS, and Windows (via Git Bash or PowerShell), ensuring consistent mental models and commands.
2. **GitHub Desktop as an Optional Alternative**
   - If a learner on macOS or Windows encounters insurmountable terminal authentication hurdles or severe CLI anxiety, provide GitHub Desktop as a practical fallback so they can participate immediately without stalling their partner.
3. **Mandatory Author Configuration Check**
   - Before any moves are made, ensure both learners have configured their commit author identity:
     ```bash
     git config --global user.name "Jane Doe"
     git config --global user.email "jane@example.com"
     ```
   - *Why this matters:* Attribution is central to collaboration. When learners review `git log` and the Game Wall later, their names must clearly appear next to their moves.
4. **Zero Programming Dependencies**
   - Learners do not need Python, Node.js, `uv`, Docker, or compilers. All edits take place in a plain text file (`board.txt`) using any text editor of their choice (VS Code, Nano, Notepad, TextEdit).

---

## Two-Hour Session Timeline

| Time | Phase | Focus |
|---|---|---|
| **00:00 – 00:10** | **Pair Up & Setup** | Form pairs, assign roles (Player X and Player O), verify collaborator access. |
| **00:10 – 00:20** | **Shared Board Mental Model** | Conceptual intro: local vs. remote, the shared board, the turn lifecycle. |
| **00:20 – 00:40** | **Live Demonstration** | Facilitator + prepared partner demonstrate Moves 1 and 2 live on screen. |
| **00:40 – 01:40** | **Paired Game Play** | Pairs play their 9-turn game; fast pairs begin branch rematch extension. |
| **01:40 – 01:55** | **Game Wall & History Discussion** | Inspecting the Game Wall, analyzing `git log`, reviewing real-world logs. |
| **01:55 – 02:00** | **Research & Work Transfer** | Connecting the game workflow to scientific collaboration and codebases. |

---

## Phase-by-Phase Facilitation Details

### 1. Pair Up & Setup (0–10 min)
- **Pairing Strategy:** Pair learners side-by-side or in breakout rooms. If there is an odd number, form one group of three where two players share a role or rotate turns, or have a teaching assistant (TA) pair with the extra learner.
- **Assign Roles:**
  - **Player X (Host / First Mover):** Initializes or forks/creates the pair's repository from the template on GitHub, adds Player O as an invited collaborator with write access, and makes the opening move.
  - **Player O (Collaborator / Second Mover):** Accepts the collaborator invitation via email or GitHub notifications, clones the repository locally, and makes the second move.
- **Verification:** Both partners confirm they can see the repository on GitHub before touching any local files.

### 2. Introduction to the Shared Board (10–20 min)
- **The Physical Analogy:** Compare Git to a physical desk with a piece of paper:
  - Your local folder is your personal clipboard.
  - GitHub is the central table in the middle of the room.
  - You cannot draw on your partner's clipboard directly. You must fetch the latest sheet from the central table (`git pull`), write your mark (`edit`), seal it in an envelope (`git commit`), and send it to the central table (`git push`).
- **The File:** Introduce `board.txt`. Explain that it is simply a plain text table representing the 3x3 grid.
- **The Sacred Rule of Paired Git:** *Always pull before you play.*

---

### 3. Live Demonstration with Prepared Second Player (20–40 min)

The live demo must feature the **Lead Facilitator (Player X)** and a **Prepared Second Player / TA (Player O)**.

#### Technical Setup
- Project two terminals side-by-side on screen (or switch visibly between two screens labeled "Player X (Lead)" and "Player O (TA)").
- Show a browser tab with GitHub open between the terminals so learners see remote changes happen in real time.

#### Demo Script
1. **Repository Creation & Invitation:**
   - Player X shows the repository on GitHub and adds Player O under *Settings > Collaborators*.
   - Player O shows accepting the invite and running:
     ```bash
     git clone <repo-url>
     cd <repo-folder>
     ```
2. **Move 1 (Player X):**
   - Player X runs `git status` (shows clean working tree).
   - Player X edits `board.txt`, placing `X` in square 5 (center).
   - Player X runs:
     ```bash
     git status
     git diff
     git add board.txt
     git commit -m "Move 1: X in center square 5"
     git push origin main
     ```
   - Refresh GitHub in the browser to show the commit.
3. **Move 2 (Player O):**
   - Player O shows their local `board.txt` (still empty!).
   - Player O runs:
     ```bash
     git pull origin main
     ```
   - Show that square 5 now has `X` locally.
   - Player O edits `board.txt`, placing `O` in square 1 (top-left).
   - Player O commits and pushes:
     ```bash
     git add board.txt
     git commit -m "Move 2: O takes top-left square 1"
     git push origin main
     ```
4. **Closing the Loop (Player X):**
   - Player X runs `git pull origin main`.
   - Player X runs `git log --oneline --graph`:
     ```text
     * a1b2c3d (HEAD -> main, origin/main) Move 2: O takes top-left square 1
     * e4f5g6h Move 1: X in center square 5
     ```
   - Emphasize the distinct author names attached to each commit.

---

### 4. Paired Game Play (40–100 min)

Learners work through their games in pairs. Facilitators and TAs circulate.

- **Cadence:**
  - *40–55 min:* All pairs make Moves 1–3. Facilitators verify that everyone has successfully pushed at least one commit.
  - *55–80 min:* Mid-game play (Moves 4–7). Pairs develop muscle memory with `pull -> edit -> commit -> push`.
  - *80–90 min:* End-game resolution (Win, Loss, or Draw).
  - *90–100 min:* **Extension Activity (Branch Rematch):**
    Pairs who finish early should start a rematch on a dedicated branch:
    ```bash
    git checkout -b rematch
    git push -u origin rematch
    ```
    This introduces branch isolation: playing a second game without overwriting the completed first game on `main`.

---

### 5. Game Wall & Commit History Discussion (100–115 min)

Gather the entire room back together.

1. **The Game Wall:**
   - Project the workshop's **Game Wall** showing all registered pair games and their final boards.
   - Celebrate completed games, clever commit messages, and creative ties.
2. **History Exploration in the Terminal:**
   - Ask learners to run:
     ```bash
     git log --oneline --graph --author-date-order
     ```
   - Ask questions:
     - *"Can you tell who went first without looking at the board?"*
     - *"What do good commit messages look like in your history?"*
     - *"How does Git know which commit came after which?"*
3. **Reviewing Natural Mishaps:**
   - Highlight any authentic issues pairs ran into (e.g., someone pushed out of turn or forgot to pull). Discuss how Git kept the history safe.

---

### 6. Research & Scientific Transfer (115–120 min)

Conclude the workshop by connecting the game to real-world code and scientific research collaboration:

- **From Squares to Files & Functions:**
  In research, multiple co-authors work on manuscripts (Markdown/LaTeX), data pipelines, or analysis scripts (R/Python). The turn-taking discipline (`pull` before editing) prevents overwriting colleagues' work.
- **Commit Messages as Lab Notebook Entries:**
  A message like `Move 3: X in top-right` is clear and reproducible. In science, `Fix baseline covariate calculation in Table 1` provides provenance and auditability.
- **Attribution and Accountability:**
  Every commit records the author's name and timestamp. This provides verifiable attribution for scientific software contributions.
- **From Sequential Turns to Concurrent Branches:**
  Tic-tac-toe is sequential (turn-based). In larger projects, collaborators work simultaneously on different features or analyses using **branches** and **pull requests**—just like the branch rematch extension.

---

## Strategy for Handling Unexpected Errors Gracefully

> [!IMPORTANT]
> **Do not stage synthetic errors.** Never deliberately inject artificial merge conflicts or broken states into beginner workshops. Authentic errors will happen naturally—and when they do, they are the most valuable teaching moments.

When an unexpected error occurs during the workshop, apply this 4-step facilitation protocol:

### Step 1: Normalize and De-escalate
- Say: *"This is completely normal! Git is not broken; it is actually doing its job and protecting your work."*
- Remind the room that error messages in Git are descriptive status reports, not crash dumps.

### Step 2: Read the Terminal Output Together
- Ask the learner to read the last 3 lines of output aloud.
- Point out that Git almost always prints the exact command needed to recover (e.g., `hint: Updates were rejected because the remote contains work...`).

### Step 3: Triage the Most Common Natural Errors

#### Error A: Push Rejected (Non-fast-forward / Remote contains work)
- **Symptom:**
  ```text
  ! [rejected]        main -> main (fetch first)
  error: failed to push some refs to '...'
  hint: Updates were rejected because the remote contains work that you do
  hint: not have locally. This is usually caused by another repository pushing...
  ```
- **Cause:** Player pushed out of turn, or forgot to run `git pull` after their partner moved.
- **Remedy:**
  1. Run `git pull origin main`.
  2. If the edits were in different squares, Git will automatically merge.
  3. Run `git push origin main`.

#### Error B: Merge Conflict in `board.txt`
- **Symptom:**
  ```text
  CONFLICT (content): Merge conflict in board.txt
  Automatic merge failed; fix conflicts and then commit the result.
  ```
- **Cause:** Both players edited the same square at the same time or made conflicting edits before pulling.
- **Remedy:**
  1. Open `board.txt` in the editor.
  2. Show the conflict markers (`<<<<<<< HEAD`, `=======`, `>>>>>>>`).
  3. Explain: *"Git is asking humans to decide what the board should look like."*
  4. Edit the file to the agreed board state, delete the marker lines, save.
  5. Run:
     ```bash
     git add board.txt
     git commit -m "Resolve move conflict between X and O"
     git push origin main
     ```

#### Error C: Working Tree Dirty on Pull
- **Symptom:** `error: Your local changes to the following files would be overwritten by merge...`
- **Cause:** The learner edited `board.txt` before pulling their partner's move.
- **Remedy:**
  1. Check `git status` and `git diff`.
  2. If the local change is their intended move, commit it locally (`git add board.txt`, `git commit -m "..."`).
  3. Pull with rebase or merge: `git pull --no-rebase origin main`.
  4. Push: `git push origin main`.

#### Error D: Authentication / Permission Denied
- **Symptom:** `Permission to user/repo denied to user` or `fatal: Authentication failed`.
- **Cause:** Player O has not accepted the repository invitation, or SSH/token credentials expired.
- **Remedy:**
  1. Check GitHub repository settings &rarr; Collaborators &rarr; confirm invite accepted.
  2. If terminal auth is blocked, immediately switch that learner to **GitHub Desktop** or `gh auth login` so they do not lose playing time.

---

## Facilitator Pre-Flight Checklist

- [ ] Confirm venue network does not block SSH (port 22) or GitHub HTTPS.
- [ ] Ensure teaching assistants know the 4-step error triage protocol.
- [ ] Prepare the co-facilitator demo repository 15 minutes before session start.
- [ ] Verify the **Game Wall** dashboard URL is ready and accessible for projection.
- [ ] Print or link the [Learner Guide](LEARNER_GUIDE.md) and [Pre-Session Readiness Checklist](PRE_SESSION_CHECK.md).

# Git Tic-Tac-Toe: Learner Handout

Welcome to the **Git Tic-Tac-Toe Workshop**! In this session, you and your partner will play a game of tic-tac-toe by committing and pushing moves to a single shared GitHub repository.

---

## 1. Roles & Initial Setup

Pick who is **Player X** and who is **Player O**:

| Role | Responsibilities | Setup Steps |
|---|---|---|
| **Player X** <br>*(Host / First Mover)* | • Owns the repository<br>• Makes opening move (`X`) | 1. Create the repository from template [igorsdub/tic-tac-toe-template](https://github.com/igorsdub/tic-tac-toe-template) (click **Use this template**).<br>2. Go to **Settings > Collaborators > Add people**.<br>3. Invite Player O by their GitHub username. |
| **Player O** <br>*(Collaborator / Second Mover)* | • Collaborates on repository<br>• Makes second move (`O`) | 1. Accept the invitation (check email or GitHub notifications).<br>2. Open your terminal and clone the repository:<br>&nbsp;&nbsp;&nbsp;`git clone <repo-url>`<br>&nbsp;&nbsp;&nbsp;`cd <repo-folder>` |

---

## 2. The Sacred Turn Cycle

Every turn follows five simple steps. **Never edit the board before pulling!**

```
┌───────────┐      ┌─────────────┐      ┌─────────────┐      ┌────────────┐      ┌────────────┐
│ 1. PULL   │ ───> │ 2. EDIT     │ ───> │ 3. STAGE    │ ───> │ 4. COMMIT  │ ───> │ 5. PUSH    │
│ git pull  │      │  board.md   │      │ git add ... │      │ git commit │      │  git push  │
└───────────┘      └─────────────┘      └─────────────┘      └────────────┘      └────────────┘
```

### Step 1: Pull the latest move
Always pull before making your move so you have your partner's latest board:
```bash
git pull origin main
```

### Step 2: Make your move in `board.md`
Open `board.md` in your text editor. Replace **one** empty square (`[ ]`) with your symbol (`[X]` or `[O]`) and update the `State:` line. Save the file.

### Step 3: Check and stage your change
Verify what you modified and prepare it for saving:
```bash
git status
git diff
git add board.md
```

### Step 4: Commit with a descriptive message
Save your move into the project history:
```bash
git commit -m "Move 3: X in center square 5"
```

### Step 5: Push your move to GitHub
Send your move to the shared repository:
```bash
git push origin main
```
**Tell your partner:** *"Your turn!"*

---

## 3. Quick Reference Commands

| Command | What It Does | When to Use |
|---|---|---|
| `git status` | Shows modified, staged, or untracked files | Anytime you are unsure what state your folder is in |
| `git diff` | Shows line-by-line changes since last commit | Before staging to confirm you only changed one square |
| `git log --oneline` | Displays commit history in a clean, short list | After pulling to see who made what moves |
| `git log --graph --oneline` | Visualizes the branch and commit history | At the end of the game to review the full match |

---

## 4. What If a Push Is Rejected?

If you see:
```text
! [rejected] main -> main (fetch first)
error: failed to push some refs...
```
**Do not panic!** Git is simply telling you that your partner pushed a move that you don't have yet.
1. Run `git pull origin main`.
2. Inspect `board.md` to see the updated board.
3. Run `git push origin main`.

---

## 5. Extension: Branch Rematch (Finished Early?)

If you and your partner finish your game before time is called, play a **rematch on a branch**! This keeps your first game safe on `main` while you play game 2 in isolation:

1. **Player X** creates and pushes a new branch:
   ```bash
   git checkout -b rematch
   git push -u origin rematch
   ```
2. **Player O** switches to the rematch branch:
   ```bash
   git fetch origin
   git checkout rematch
   ```
3. Reset `board.md` back to empty squares (`[ ]`), update `State: Ready for X` (swap roles if Player O wants to go first), commit as `"Start Rematch Game 2"`, push, and play!

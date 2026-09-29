# Pre-Session Readiness Checklist: Git Tic-Tac-Toe Workshop

Complete this 10-minute checklist **before** arriving at the workshop. Ensuring your laptop has Git installed and configured ensures you and your partner can jump straight into the game without technical delays.

> [!NOTE]
> **No programming languages or external toolchains are required.**
> You do **not** need Python, Node.js, R, Docker, or tools like `uv`. All workshop activities use plain text files, your operating system's terminal, and a basic text editor.

---

## 1. Readiness Checklist (All Operating Systems)

Work through these four checks in order:

### Check 1: GitHub Account Verification
1. Log into [GitHub.com](https://github.com). If you don't have an account, sign up for free.
2. Confirm that your email address is verified:
   - Go to **Settings > Emails** and verify that your primary email shows as **Verified**.
3. Note down your **GitHub username**; you will share this with your partner to be added to the repository.

### Check 2: Git Installation
Open your terminal application:
- **macOS:** Open **Terminal** (`Cmd + Space`, type `Terminal`).
- **Windows:** Open **Git Bash** (recommended) or **PowerShell**.
- **Linux:** Open your preferred terminal emulator.

Type the following command and press **Enter**:
```bash
git --version
```

- **Expected Output:** `git version 2.x.x` (any version above 2.20 is fine).
- **If command not found:**
  - *Windows:* Download and install [Git for Windows](https://git-scm.com/download/win) (accept default options).
  - *macOS:* Run `xcode-select --install` in Terminal, or install via Homebrew (`brew install git`).
  - *Linux (Ubuntu/Debian):* Run `sudo apt update && sudo apt install git`.

### Check 3: Author Identity Configuration
Git records author details on every move you commit. Set your global name and email:

```bash
git config --global user.name "Firstname Lastname"
git config --global user.email "your_email@example.com"
```
*(Use the same email address registered with your GitHub account.)*

Verify your configuration:
```bash
git config --global user.name
git config --global user.email
```
Both commands should return the values you just entered.

### Check 4: Push Authentication to GitHub
To push your moves to GitHub, your terminal needs permission to authenticate.

Test your connection using one of these common methods:

- **Method A: SSH Key (Recommended if you already use SSH)**
  Run:
  ```bash
  ssh -T git@github.com
  ```
  Expected output contains: `Hi <username>! You've successfully authenticated...`

- **Method B: Git Credential Manager (Default on Windows & macOS)**
  On your first `git push` or clone over HTTPS (`https://github.com/...`), Git will open a browser window asking you to authorize GitHub. Simply sign in when prompted.

- **Method C: GitHub CLI (`gh`)**
  If you have the `gh` tool installed, run:
  ```bash
  gh auth login
  ```
  Follow the interactive prompts to authenticate via browser.

---

## 2. Text Editor

You will edit a markdown file called `board.md` during the game. Any plain text editor will work:
- Visual Studio Code (recommended)
- Notepad (Windows)
- TextEdit (macOS, in Plain Text mode)
- Nano / Vim (terminal)

---

## 3. Alternative Fallback: GitHub Desktop

If you encounter stubborn terminal authentication errors or permission problems on macOS or Windows:
1. Download and install [GitHub Desktop](https://desktop.github.com/).
2. Sign in with your GitHub credentials (**GitHub Desktop > Preferences/Settings > Accounts**).
3. GitHub Desktop automatically handles authentication and credentials, allowing you to clone, commit, pull, and push with your partner without terminal roadblocks.

---

## 4. Ready Checklist Summary

Before session start, verify:
- [ ] You can log into [github.com](https://github.com) and know your username.
- [ ] `git --version` prints a valid version number in your terminal.
- [ ] `git config --global user.name` and `user.email` are set.
- [ ] You have a text editor installed and ready to open text files.

# Time machine (take-home)

A post-workshop activity, not part of the session. Look back through your match history and try a different move without changing the original match. The web version is [docs/time-machine.html](docs/time-machine.html).

## Look at the past

Every commit is a saved snapshot of `BOARD.txt`. The *commit graph* draws these snapshots as a line, newest at the top.

1. In your Codespace, switch to your match branch (for example `match-01`). In **Source Control**, select **Pull** on the **Graph** toolbar.
2. Expand the **Graph** section. Each dot is one commit.
3. Select an older commit. VS Code lists the files it changed.
4. Select `BOARD.txt` to open the diff. The removed line is the board before that commit, and the added line is the board after it.

Looking at a diff changes nothing.

## Detached HEAD

*HEAD* is Git's name for the commit your files currently show. Normally HEAD follows a branch. If you check out an old commit directly, HEAD is *detached*: your files show the old board and the status bar shows a commit code instead of a branch name. It is safe for reading, but a commit made here belongs to no branch and is easy to lose.

To leave: select the branch name in the status bar, choose your match branch, and your files return to the latest board. If you committed nothing, nothing is lost.

## Try a what-if

An *experiment branch* starts from a past commit so you can play a different move there. Its name must **not** start with `match` (for example `what-if-01`); the Game Wall ignores it.

1. In the commit graph, right-click the old commit and choose **Create Branch...**.
2. Name it `what-if-01` and press Enter. VS Code switches to it.
3. Open `BOARD.txt`, replace one dot with a different legal move, and save.
4. Check the diff, stage with **+**, enter a clear message, and select **Commit**.
5. Select **Publish Branch** to save the experiment on GitHub.

Never merge an experiment branch into `main` or a match branch.

## Return to your match

Select the branch name in the status bar and choose your match branch. The original game is back; your experiment stays on its own branch.

<details>
<summary>Terminal equivalent (optional)</summary>

```
git log --oneline                  # list commits, newest first
git diff abc1234 HEAD              # compare an old commit with now
git switch --detach abc1234        # look at the old board (detached HEAD)
git switch match-01                # leave detached HEAD, return to the match
git switch -c what-if-01 abc1234   # new branch from a past commit
git push -u origin what-if-01      # publish it
```

Replace `abc1234` with a commit code from `git log --oneline`.

</details>

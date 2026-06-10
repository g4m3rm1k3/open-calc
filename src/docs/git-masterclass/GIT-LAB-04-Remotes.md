# Git Masterclass — LAB 04 — Remotes and GitHub

**Read [LAB-03](./GIT-LAB-03-Branches.md) first.** That lab covered
branches, merging, and resolving conflicts. This lab connects your
local repository to the internet.

**What this lab adds over LAB-03:**
- What a remote is and where it lives
- Setting up GitHub and connecting your repository (`git remote`)
- Sending your commits to GitHub (`git push`)
- Getting commits from GitHub (`git fetch` vs `git pull`)
- The `origin` naming convention and why it exists
- Understanding `origin/main` as a separate tracking branch

---

## What You Will Build

By the end of this lab your `git-practice` repository will exist in
two places:

1. **Your machine** — the local repository you built in LAB-01 through LAB-03
2. **GitHub** — a copy hosted on GitHub's servers

You will be able to run:

```bash
git push origin main
```

And see your commits appear on GitHub's website. You will also pull
changes down with `git pull` and understand the difference between
`fetch` and `pull`.

---

## Concept: What a Remote Is

**What it is:** A remote is a URL pointing to another copy of the same
repository, hosted somewhere other than your machine. The most common
remote host is GitHub. Others include GitLab and Bitbucket.

**The problem without a remote:**
Your repository exists only on your computer. If the computer dies,
your history is gone. If you want to work from a different machine,
you cannot. If you want to share your code with a collaborator,
you have no channel.

**The solution:**
A remote gives your repository a second home. You push your commits there
as backup and for sharing. Others can clone the remote to get a full copy.

**The local vs remote relationship:**

```
Your Machine                   GitHub Servers
─────────────                  ──────────────
git-practice/                  git-practice.git/
  .git/                          (your commits)
    commits...      ←push→
    commits...      ←pull─
```

Both sides have the same commits (when in sync). The remote is not
"the master" — it is a peer. Either side can be ahead of the other.

**Why it matters here:** Every `git push` and `git pull` is
a synchronization between local and remote. Understanding this as
two-way sync (not "upload to server") prevents a lot of confusion.

**Watch for:** "Remote" and "GitHub" are not the same thing.
Remote is the concept (any URL). GitHub is one specific service.
You can have a remote that is another folder on your own machine.

---

## Concept: `origin` — The Conventional Remote Name

**What it is:** When you clone a repository or add your first remote,
Git gives it the name `origin` by convention. You can name remotes
anything, but `origin` is universal — every Git tutorial, team, and
tool expects the primary remote to be called `origin`.

**Why "origin":** The remote is where the project "originated from"
or where the "canonical version" lives. The name is convention,
not a technical requirement.

**Example:**
```bash
git remote add origin https://github.com/yourname/git-practice.git
```

After this, `origin` is a short alias for that full URL. Instead of
typing the URL every time, you type `origin`.

**Why it matters here:** All push and pull commands will use `origin`.
Knowing it is just a name (not magic) lets you understand what happens
when you see it in error messages.

**Watch for:** A repository can have multiple remotes with different names.
In a forked project you might have `origin` (your fork) and `upstream`
(the original project). You saw this in your cadcam repo.

---

## Concept: `git remote`

**What it is:** The command for managing remotes — listing, adding, and removing them.

```bash
git remote -v               # list all remotes with their URLs
git remote add name url     # add a new remote
git remote remove name      # remove a remote (does not delete anything on GitHub)
git remote rename old new   # rename a remote
```

**Example output of `git remote -v`:**
```
origin  https://github.com/yourname/git-practice.git (fetch)
origin  https://github.com/yourname/git-practice.git (push)
```

Each remote shows two URLs: one for fetching (downloading) and one for
pushing (uploading). They are almost always the same URL.

**Why it matters here:** Before you can push or pull, a remote must exist.
This is the setup command you run once per repository.

**Watch for:** Running `git remote add` with a name that already exists
causes an error. Run `git remote -v` first to see what remotes are defined.

---

## Step 1 — Create a GitHub Repository

You need a GitHub account. If you do not have one, go to https://github.com
and sign up (free).

Once logged in:

1. Click the **+** button in the top-right corner
2. Click **New repository**
3. Name it `git-practice`
4. Leave it **Public** (or Private — either works)
5. **Do NOT check** "Add a README file" or any other initialization options.
   Your repository already has commits. A pre-initialized remote would conflict.
6. Click **Create repository**

GitHub will show you a page with setup instructions. Find the section
called **"…or push an existing repository from the command line"**.
Copy those three commands — they will look like:

```bash
git remote add origin https://github.com/yourname/git-practice.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Connect Your Local Repository to GitHub

Navigate to your `git-practice` folder and run the commands from GitHub:

```bash
cd git-practice
git remote add origin https://github.com/yourname/git-practice.git
git branch -M main
```

The `-M` flag on `git branch -M main` renames the current branch to `main`
if it has a different name. Modern Git names it `main` by default, so this
is usually a no-op — but it is safe to run.

Verify the remote was added:

```bash
git remote -v
```

### SAVE AND TRY

Expected:
```
origin  https://github.com/yourname/git-practice.git (fetch)
origin  https://github.com/yourname/git-practice.git (push)
```

You now have a remote named `origin` pointing to your GitHub repository.
No data has been sent yet — you have only registered the address.

**In your terminal, type:**
```bash
git remote -v
```
Expected: same output. Safe to run any number of times.

---

## Concept: `git push`

**What it is:** Sends commits from your local repository to the remote
repository. Only commits that the remote does not already have are sent.

**Syntax:**
```bash
git push origin main           # push local 'main' to remote 'origin'
git push -u origin main        # push AND set up tracking (first push only)
git push                       # short form after tracking is set up
```

**What `-u` does:**
The `-u` flag (short for `--set-upstream`) links your local `main`
branch to `origin/main` permanently. After this one-time setup, you can
type just `git push` and Git knows where to send the commits.

**What actually happens during push:**
```
Local repository              Remote (GitHub)
────────────────              ───────────────
commit A  ─────────────────→  commit A (new on remote)
commit B  ─────────────────→  commit B (new on remote)
commit C  ─────────────────→  commit C (new on remote)
(remote already had these)    (these stay as they were)
```

Only the commits the remote is missing are sent.

**Why it matters here:** Push is how your work goes from your machine
to GitHub. It is the "save to the cloud" step.

**Watch for:** Push will be rejected if the remote has commits that you
do not have locally. Git refuses to overwrite unknown history. The fix
is to pull first (get the remote's commits), then push. This is the
"divergent branches" situation from the git log you saw earlier.

---

## Step 3 — Push Your Commits to GitHub

```bash
git push -u origin main
```

Git may ask for your GitHub username and password. On modern GitHub,
passwords are not accepted — you need a **Personal Access Token (PAT)**.

**Setting up authentication (first time only):**

Option A — GitHub CLI (easiest):
```bash
brew install gh          # install GitHub CLI
gh auth login            # follow the prompts, authenticate in browser
```

After this, `git push` authenticates automatically.

Option B — Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token, check "repo" scope
3. Copy the token (you only see it once)
4. When Git asks for a password, paste the token

### SAVE AND TRY

After a successful push you should see:

```
Enumerating objects: 12, done.
Counting objects: 100% (12/12), done.
Delta compression using up to 8 threads
Compressing objects: 100% (8/8), done.
Writing objects: 100% (12/12), 1.23 KiB | 1.23 MiB/s, done.
Total 12 (delta 1), reused 0 (delta 0)
To https://github.com/yourname/git-practice.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

Now open your browser and go to:
```
https://github.com/yourname/git-practice
```

You should see your repository with `notes.txt` and `about.txt`,
and all your commit history visible under the "Commits" link.

**In your terminal, type:**
```bash
git log --oneline
git status
```
Expected: same as before. Push does not change local history.
Status still says "nothing to commit, working tree clean."

---

## Concept: Tracking Branches and `origin/main`

**What it is:** When you push with `-u`, Git creates a special local
reference called `origin/main`. This is not a branch you can commit to —
it is a snapshot of what the remote's `main` looked like the last time
you communicated with it.

**Visualized:**
```
local main       ──── A ──── B ──── C  (your local commits)
origin/main      ──── A ──── B ──── C  (remote's state, last known)
```

When someone else pushes to GitHub, `origin/main` on your machine does
not update automatically — it stays at the old position until you
explicitly fetch.

**Why this matters:**
`git status` uses `origin/main` to tell you whether you are ahead or
behind the remote. "Your branch is 1 commit ahead of 'origin/main'"
means you have one local commit the remote does not have yet.

**Why it matters here:** You will see `origin/main` in status messages
and in `git log --all --oneline`. Knowing it is a local snapshot of the
remote's state — not the remote itself — prevents confusion.

**Watch for:** `origin/main` only updates when you run `git fetch` or
`git pull`. It does not update automatically in the background.

---

## Concept: `git fetch` vs `git pull`

**What it is:** Two different ways to get commits from the remote.

**`git fetch`:**
Downloads commits from the remote and updates `origin/main` (the tracking
branch). Does NOT change your local `main` or your working directory.
Your files on disk are unchanged. You are shown what is out there,
but you decide what to do with it.

```
Before fetch:
  local main:    A ─── B ─── C
  origin/main:   A ─── B ─── C     ← same, they are in sync

Someone pushes D and E to GitHub.

After git fetch:
  local main:    A ─── B ─── C     ← unchanged, your work is safe
  origin/main:   A ─── B ─── C ─── D ─── E  ← updated to reflect remote
```

**`git pull`:**
Runs `git fetch` AND then immediately merges `origin/main` into your
local `main`. It is a shortcut for fetch + merge in one step.

```
After git pull (= fetch + merge):
  local main:    A ─── B ─── C ─── D ─── E  ← updated to match remote
  origin/main:   A ─── B ─── C ─── D ─── E
```

**Which to use:**

| Situation | Use |
|-----------|-----|
| You want to see what is on the remote before merging | `git fetch` then inspect |
| You trust the remote and just want to sync | `git pull` |
| You have local commits that may conflict | `git fetch` first, then decide |
| Daily workflow on a solo project | `git pull` is fine |
| Team project with active colleagues | `git fetch` + review + merge |

**Why it matters here:** You experienced the "divergent branches" error
from your cadcam repo. That happened because `git pull` tried to merge
but Git did not know the strategy. With this understanding, you can
handle it: `git fetch` first, then `git merge origin/main` explicitly.

**Watch for:** `git pull` can create merge commits if your local branch
has commits the remote does not. This is not an error — but it can
surprise you. Use `git pull --ff-only` if you only want pull to work
when a fast-forward is possible (no risk of a merge commit).

---

## Step 4 — Simulate Fetching New Changes

To practice `git fetch`, we will simulate a change on the remote by
editing a file directly on GitHub's website.

1. Go to `https://github.com/yourname/git-practice`
2. Click on `notes.txt`
3. Click the pencil icon (Edit)
4. Add a new line at the bottom: `Remote edit: added from GitHub website.`
5. Click **Commit changes** (use the default message or write your own)

Now fetch those changes locally:

```bash
git fetch origin
```

### SAVE AND TRY

Expected output:
```
remote: Enumerating objects: 5, done.
remote: Counting objects: 100% (5/5), done.
...
From https://github.com/yourname/git-practice
   c7d8e9f..a1b2c3d  main       -> origin/main
```

The last line shows `main -> origin/main` — Git updated the `origin/main`
tracking branch, but NOT your local `main`.

Run:
```bash
git log --oneline
```
Expected: your local `main` does NOT yet have the remote commit.

Run:
```bash
git log --oneline origin/main
```
Expected: shows the new commit that came from GitHub.

Run:
```bash
git diff main origin/main
```
Expected: shows the line added on GitHub as a `+` line.

**The changes are visible but not yet in your local main.**

---

## Step 5 — Merge the Fetched Changes

Now merge the fetched commits into your local `main`:

```bash
git merge origin/main
```

### SAVE AND TRY

Expected:
```
Updating c7d8e9f..a1b2c3d
Fast-forward
 notes.txt | 1 +
 1 file changed, 1 insertion(+)
```

Run:
```bash
cat notes.txt
```
Expected: the line you added on GitHub now appears locally.

Run:
```bash
git log --oneline
```
Expected: the GitHub commit now appears in your local history.

**This is what `git pull` would have done in one step.** The two-step
version (`fetch` then `merge`) gives you control — you can inspect the
diff before merging.

---

## Concept: `git clone`

**What it is:** Creates a complete local copy of a remote repository —
including all commits, all branches, all history. This is how you
start working on a project that already exists on GitHub.

**Syntax:**
```bash
git clone https://github.com/username/repository.git
git clone https://github.com/username/repository.git local-folder-name
```

`git clone` automatically:
1. Creates a new folder
2. Initializes a Git repository inside it
3. Downloads all commits and branches
4. Sets `origin` to point to the URL you cloned from
5. Checks out the default branch (`main`)

**When to use:**
- Starting fresh on a project that exists on GitHub
- Getting a colleague's repository
- Getting an open source project to use or contribute to

**Why it matters here:** You will use `git clone` in LAB-06 to simulate
a second contributor working on the same repository.

**Watch for:** Do NOT run `git init` in a cloned repository. It is already
initialized. Running `git init` after cloning is harmless but confusing —
it does nothing because `.git` already exists.

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| Remote added | `git remote -v`. See `origin` with your GitHub URL. |
| Commits pushed | Open GitHub in browser. See your commits listed. |
| Tracking branch set | `git status`. Should say "Your branch is up to date with 'origin/main'." |
| Fetch works | Run `git fetch origin`. See output listing received objects. |
| Fetch does not change local | After `git fetch`, run `git log --oneline`. New commit not visible yet. |
| `origin/main` updated | `git log --oneline origin/main`. See the fetched commit. |
| Merge after fetch | `git merge origin/main`. New commit appears in local history. |

---

## Remote Commands — Quick Reference

```
GOAL                                    COMMAND
──────────────────────────────────────  ──────────────────────────────────
List remotes and URLs                   git remote -v
Add a remote                            git remote add origin <url>
First push and set tracking             git push -u origin main
Push after tracking is set              git push
Download updates (safe, no merge)       git fetch origin
Download and merge                      git pull
Clone a repository from GitHub          git clone <url>
See all branches (local + remote)       git branch -a
Compare local vs remote                 git diff main origin/main
```

---

## What You Learned

| Concept | What it means |
|---------|---------------|
| Remote | A URL pointing to another copy of the same repository |
| `origin` | The conventional name for the primary remote |
| `git remote add` | Registers a remote URL under a short name |
| `git push -u` | Sends local commits to remote AND sets up tracking |
| `git push` | Sends local commits to the tracked remote branch |
| `origin/main` | Local snapshot of what the remote's main looked like last fetch |
| `git fetch` | Downloads from remote, updates `origin/main`, does NOT touch local files |
| `git pull` | Fetch + merge in one step |
| `git clone` | Creates a full local copy of a remote repository |
| Tracking branch | The link between a local branch and its remote counterpart |

---

## Up Next

**[LAB-05 — Fixing Mistakes](./GIT-LAB-05-Fixing-Mistakes.md)**

Every developer makes mistakes. LAB-05 covers exactly how to undo them
without destroying anything — from "I changed a file and don't want to"
to "I committed to the wrong branch" to "I need to go back three commits."
These are the commands that make Git feel safe to experiment in.

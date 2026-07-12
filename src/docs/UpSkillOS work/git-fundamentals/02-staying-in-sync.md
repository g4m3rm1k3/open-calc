# Staying in Sync — fetch, pull, and knowing where you stand

**Case study:** today's session opened with `main` reported as "behind
`origin/main` by 3 commits," and later, after merging PR #7, `origin/main`
had moved and needed fetching before the next command would even make
sense. Every one of today's git operations that touched a remote depended
on correctly answering one question first: *is my local copy currently the
same as what's on GitHub, ahead of it, behind it, or diverged from it?*
This lesson is how to answer that, precisely, every time.

## What you will build

You'll set up two connected repositories on your own machine — a
disposable "remote" and a disposable "local clone" of it — and watch
exactly what `fetch`, `pull`, and `push` each do to the relationship
between them. Then you'll practice reading the four possible sync states
(up to date, ahead, behind, diverged) from real command output, so you
never have to guess again.

## What you need to know first

[Lesson 01](01-branch-before-you-change-anything.md) — commits, branches,
and fast-forward merges. This lesson builds directly on that.

---

## The Lesson

### Define at use — what "remote" actually means

Before the concept lab: a **remote** is not a special kind of repository.
It is an ordinary git repository that your local repository knows an
address for, under a short name — almost always `origin`. `git remote -v`
(you ran this on `open-calc` today) prints that address. GitHub, GitLab,
a USB drive, or a folder on your own machine are all equally valid
remotes — git's protocol for talking to another repository doesn't care
where that repository lives. We'll use "a folder on your own machine" for
the lab, because it behaves identically to GitHub for everything this
lesson teaches, with no network involved.

### Concept Lab: fetch vs. pull, made visible

```bash
mkdir -p ~/git-lab/remote-repo && cd ~/git-lab/remote-repo
git init --bare
```

**Walkthrough:** `--bare` creates a repository with no working folder of
files you can edit — only the `.git` internals. This is exactly what
GitHub, GitLab, and every other Git host actually store on their servers;
you never edit files directly on the server, you only push commits to it.
This bare repo is standing in for "GitHub" for the rest of this lab.

```bash
cd ~/git-lab
git clone remote-repo local-a
cd local-a
echo "hello" > file.txt
git add file.txt
git commit -m "first commit"
git push origin main
```

**Define at use — `clone`:** `git clone <source> <folder-name>` copies an
entire repository's history into a new folder, and automatically sets up
a remote named `origin` pointing back at wherever you cloned from. This
is the one-time setup step; after this, `local-a` and `remote-repo` are
two separate repositories that happen to share history and know how to
talk to each other.

**CS lens:** `git push origin main` sends every commit `remote-repo`
doesn't already have, then moves `remote-repo`'s own `main` pointer to
match yours — the exact same fast-forward-pointer-move from Lesson 01,
just happening on a different machine's copy of the repository instead of
a different branch on your own.

Now open a **second** clone, simulating a teammate (or, on `open-calc`,
GitHub itself after PR #7 merged):

```bash
cd ~/git-lab
git clone remote-repo local-b
cd local-b
echo "a change from b" >> file.txt
git add file.txt
git commit -m "second commit, from local-b"
git push origin main
```

`remote-repo` now has two commits. `local-a` — sitting untouched this
whole time — doesn't know that yet. Go back to it:

```bash
cd ~/git-lab/local-a
git status
```
```
Your branch is up to date with 'origin/main'.
```

**This is the trap.** `git status` says "up to date" — but it isn't,
`local-b` just pushed a second commit. `git status` only compares against
what your repository *last heard* from the remote, not what the remote
actually has right now. It hasn't asked again since the `clone`.

```bash
git fetch origin
git status
```
```
Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.
```

**Walkthrough:** `git fetch origin` downloads every new commit from
`remote-repo` and updates `local-a`'s *knowledge* of where
`origin/main` points — but it does **not** touch your own `main` branch or
any of your files. Only after fetching does `git status` have current
information to report.

**SE lens — why fetch and pull are kept as separate operations, not
merged into one automatic thing:** fetching is always safe. It cannot
create a conflict, cannot change a file you're editing, cannot lose work
— it's purely "go find out what changed." That safety is exactly why
professional workflows fetch *first*, read what changed, and only then
decide how to bring it in. `git pull` skips the "read what changed" step:

```bash
git log origin/main --oneline -1     # look before merging — good habit
git pull                              # fetch + merge, in one step
cat file.txt
```
```
hello
a change from b
```

**Define at use — `pull` is not a separate mechanism**, it's shorthand
for `git fetch` immediately followed by `git merge origin/main` (or
`rebase`, if you've configured that default — see the note at the end of
this lesson). Every trap `pull` can spring — an unexpected merge commit,
a conflict you weren't ready for — is a trap in the *merge* half, not the
fetch half. `fetch` then `merge --ff-only` explicitly, as separate steps,
is the more deliberate version of the exact same operation, and is what
we used on `open-calc` today.

### Execution trace — the four states, side by side

| State | `git status` says | What it means | Fix |
|---|---|---|---|
| Up to date | `Your branch is up to date with 'origin/main'.` | Your `main` and `origin/main` point at the same commit | Nothing to do |
| Behind | `...behind 'origin/main' by N commits, and can be fast-forwarded.` | `origin/main` has commits you don't | `git pull` or `fetch` + `merge --ff-only` |
| Ahead | `...ahead of 'origin/main' by N commits.` | You have local commits not yet pushed | `git push` |
| Diverged | `...diverged, and have 1 and 2 different commits each, respectively.` | Both sides have commits the other lacks | `git merge` (creates a merge commit) or `git rebase` — pick one deliberately, don't guess |

The "diverged" row is the one `--ff-only` refuses to handle silently —
exactly the guardrail from Lesson 01. If you ever see it, stop and decide
on purpose rather than accepting whatever git offers by default.

---

## Connect the pieces

At the very start of today's session, `git status` on `open-calc`
reported `main` was 3 commits behind `origin/main` — the "behind" row
above, discovered the same way, via `git status` after a fetch had
already happened (or via `git branch -vv`, which shows the same
ahead/behind counts for every local branch at once — useful when you have
several branches and want the whole picture in one command). Later,
before merging PR #7 into `main`, we ran exactly the fetch-then-check
sequence from this lesson:

```bash
git fetch origin main
git merge-base --is-ancestor main topic-explorer && echo "clean ff"
```

That confirmed we were in the safe "fast-forward possible" state before
touching anything — the entire reason the PR #7 merge had zero conflicts.

## What breaks without this

If we'd skipped the fetch and gone straight to `git push origin main`
after merging PR #7, and `origin/main` had moved in the meantime (someone
else pushed, or GitHub's own PR-merge button had been clicked concurrently),
the push would have been rejected outright — git refuses a push that isn't
a fast-forward of what the remote currently has, specifically to prevent
silently overwriting someone else's commits. That rejection is a safety
net, not a bug, but hitting it mid-task costs you a context switch to
figure out what changed and reconcile it. Fetching first and checking the
sync state avoids ever being surprised by it.

## Definition of done

- [ ] You ran the two-clone lab and watched `local-a` go from "up to
      date" (stale, wrongly) to "behind" (accurate, after fetching) to
      caught up (after pulling)
- [ ] You can explain what `git pull` does in terms of the two more
      primitive commands it's shorthand for
- [ ] You can read all four rows of the status table above from real
      `git status` output without looking them up
- [ ] `rm -rf ~/git-lab` — the lab is done, delete it
- [ ] Commit this lesson:

```bash
git add "src/docs/UpSkillOS work/git-fundamentals/02-staying-in-sync.md"
git commit -m "docs: staying-in-sync lesson — fetch vs pull, reading ahead/behind/diverged"
```

---

*A note on `pull.rebase`: some setups configure `git pull` to `rebase`
instead of `merge` by default (`git config pull.rebase true`). Rebasing
rewrites your local commits on top of the fetched ones instead of creating
a merge commit — cleaner history, but it changes commit hashes, which
matters if you've already pushed or shared them. Out of scope for this
lesson; ask before turning it on if you're curious.*

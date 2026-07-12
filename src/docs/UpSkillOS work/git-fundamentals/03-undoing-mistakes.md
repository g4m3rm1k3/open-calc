# Undoing Mistakes — status, diff, restore, reset, revert, stash

**Case study:** today's session used three different "undo" tools in real
situations: `git stash` to set aside half-finished work so a PR emergency
could be handled on a clean `main`, `git checkout main -- package-lock.json`
to pull one specific file's content from another branch without touching
anything else, and `git rm --cached` to stop tracking a file without
deleting it from disk. Each of those is a different *kind* of undo,
because git actually has several, and picking the wrong one either doesn't
do what you wanted or does more than you wanted.

## What you will build

A precise mental model of git's three states — working folder, staging
area, commit history — and exactly which command moves a change between
which two of them. By the end, "how do I undo this" stops being a search
and becomes a lookup.

## What you need to know first

[Lesson 01](01-branch-before-you-change-anything.md) for what a commit and
the staging area are.

---

## The Lesson

### Concept Lab: the three states, and the tool that moves between each pair

```bash
mkdir ~/git-lab && cd ~/git-lab
git init
echo "version 1" > file.txt
git add file.txt
git commit -m "initial"
```

One committed file. Now make an uncommitted change:

```bash
echo "version 2, oops" > file.txt
git status
```
```
Changes not staged for commit:
  modified:   file.txt
```

**Define at use — the three states:** a tracked file is always in one of
three places relative to git: the **working folder** (whatever's on disk
right now), the **staging area** — also called "the index" — (what will
go into the *next* commit), and **history** (what's already permanently
committed). Right now, `file.txt` on disk says `"version 2, oops"`, but
the staging area and history both still say `"version 1"` — that
difference is exactly what "modified, not staged" means.

**CS lens:** the staging area exists as a separate state — not just
"working folder" and "history" — specifically so a commit can be *exactly*
what you intend, even if your working folder has other, unrelated,
half-finished changes sitting in it at the same time. It's a deliberate
buffer between "what changed" and "what this commit records."

**Tool 1 — `git diff`, for looking before touching anything:**

```bash
git diff
```
```
-version 1
+version 2, oops
```

This shows working-folder-vs-staging-area. Always run it before an undo
command you're not fully sure about — it costs nothing and confirms
exactly what you're about to discard.

**Tool 2 — `git restore`, for discarding an unstaged change (working
folder → matches staging area again):**

```bash
git restore file.txt
cat file.txt
```
```
version 1
```

**Walkthrough:** the accidental edit is gone, back to whatever was
already committed. This is the correct tool for "I typed something wrong
and haven't staged it yet" — the most common undo of all.

**Now stage a change, then decide you don't want it staged:**

```bash
echo "version 2, staged this time" > file.txt
git add file.txt
git status
```
```
Changes to be committed:
  modified:   file.txt
```

```bash
git restore --staged file.txt
git status
```
```
Changes not staged for commit:
  modified:   file.txt
```

**`--staged` moves the change from the staging area back to "just a
working-folder edit"** — it does not touch the file's contents at all.
This is the tool we used today, in effect, whenever staging the wrong
combination of files: unstage, then re-stage exactly what belongs
together.

### The file-from-another-branch move

This is exactly what we ran today to force `package-lock.json` back to
`main`'s version during the PR merge:

```bash
git checkout main -- file.txt
```

**Walkthrough:** normally `git checkout <branch>` switches your whole
working folder to another branch (Lesson 01). Adding `-- <path>` after it
narrows that to *just one file*: pull this file's content from that
branch's most recent commit, right now, into my current working folder
and staging area, without switching branches or touching any other file.
It's the surgical version of "grab this one thing from over there."

### Reset: rewinding history itself (use with care)

Everything above operated on the working folder or staging area — history
was untouched. `git reset` is different: it moves what a branch pointer
considers "the last commit," which changes history itself.

```bash
git add file.txt
git commit -m "a commit we'll undo"
git log --oneline
```
```
b2c3d4e a commit we'll undo
a1b2c3d initial
```

```bash
git reset --soft HEAD~1
git log --oneline
git status
```
```
a1b2c3d initial
```
```
Changes to be committed:
  modified:   file.txt
```

**Define at use — `HEAD`:** `HEAD` always means "the commit my current
branch is pointing at right now." `HEAD~1` means "one commit before
that." `git reset --soft HEAD~1` moved the branch pointer back one commit
— but left the staging area and working folder exactly as they were. The
commit still technically exists in git's object database for a while
(recoverable via `git reflog` if you moved too fast — worth knowing that
safety net exists, out of scope to go deeper here), but your branch no
longer points at it, and its changes are now sitting staged, ready to be
recommitted differently or abandoned.

**CS lens — the three flavors of reset, and exactly what each one
touches:**

| Command | Branch pointer | Staging area | Working folder |
|---|---|---|---|
| `git reset --soft HEAD~1` | moves back | **unchanged** (stays staged) | unchanged |
| `git reset --mixed HEAD~1` (the default) | moves back | reset to match new HEAD | unchanged |
| `git reset --hard HEAD~1` | moves back | reset | **reset — uncommitted work is gone** |

**`--hard` is the only one of the three that can lose uncommitted work.**
Every reset in this lesson used `--soft` or plain `reset` on purpose,
because both are recoverable if you change your mind about the commit
message or the split — `--hard` should only be reached for when you are
certain you want the working folder wiped back to match a specific
commit, no exceptions.

### Revert: the safe undo for anything already pushed

`reset` rewrites history — moving a branch pointer to point at an earlier
commit. That's fine for commits nobody else has fetched yet. Once a
commit is pushed and someone else might have it, rewriting history under
them causes exactly the "diverged" conflict from Lesson 02, and worse, can
silently drop commits from anyone who already pulled the old version.

```bash
git revert --no-edit HEAD
git log --oneline
```
```
f4g5h6i Revert "a commit we'll undo"
b2c3d4e a commit we'll undo
a1b2c3d initial
```

**Walkthrough:** `revert` doesn't remove the old commit or move any
pointer backward — it adds a **new** commit that does the exact opposite
of the one you're undoing. History grows forward, nothing is rewritten,
and it's completely safe to do on a commit anyone else already has.

**SE lens — the rule that decides which one to use:** if it's only ever
existed on your machine, `reset` is fine — clean up freely, nobody else
is depending on those commits existing. The moment it's been pushed and
someone else could plausibly have fetched it, use `revert` instead.

### Stash: setting work aside without committing it

This is exactly what happened today — half-finished topic-explorer work
needed to get out of the way so a PR emergency could be handled on a
clean `main`, without losing that work or committing it half-done.

```bash
echo "half-finished idea" >> file.txt
git stash push -u -m "half-finished idea, come back to this"
git status
```
```
nothing to commit, working tree clean
```

**Walkthrough:** `stash` took every uncommitted change (`-u` includes
untracked new files too, not just modifications) and tucked it away on a
separate stack, leaving your working folder clean — as if you'd never
touched anything. `git stash list` shows everything you've stashed;
`git stash pop` brings the most recent one back and removes it from the
stack.

```bash
git stash pop
cat file.txt
```

**CS lens:** a stash is, structurally, just a commit — git stores it the
same content-addressed way as any other commit, on its own hidden
reference, not attached to any branch. That's *why* it survives switching
branches, and why `stash pop` can hit a real merge conflict if the branch
you pop it onto has changed the same lines: it's genuinely applying a
diff, the same as any merge.

---

## Connect the pieces

Today's PR crisis, mapped onto this lesson:

```bash
git stash push -u -m "topic-explorer WIP (topicGroups/HomePage/TopicTable + gitignore codebaseGraph)"
# ... handled the PR #7 merge on a now-clean main ...
git stash pop
git rm src/data/codebaseGraph.js    # resolved the one conflict the pop produced
```

And during the merge itself:

```bash
git checkout main -- package-lock.json   # exact file-from-another-branch move from this lesson
```

And separately, stopping `codebaseGraph.js` from being tracked at all
(different from anything above — this doesn't touch history or the
working file, only whether git watches it going forward):

```bash
git rm --cached src/data/codebaseGraph.js
```

## What breaks without this

Without `stash`, the only way to hand a clean `main` to the PR emergency
would have been committing the half-finished explorer work as-is (leaving
`main` in a broken intermediate state) or discarding it outright (losing
real work). Without knowing the difference between `reset` and `revert`,
the instinct under time pressure is to reach for whichever one you
remember — and using `reset` on a commit that's already been pushed and
fetched by someone else silently un-shares history that person now has a
divergent copy of, which surfaces later as a confusing, hard-to-diagnose
merge conflict instead of a clear mistake at the moment it happened.

## Definition of done

- [ ] You ran the lab and can say, for each of `restore`, `restore
      --staged`, `reset --soft`, `reset --hard`, and `revert`, exactly
      which of (working folder / staging area / history) it touches
- [ ] You can explain why `reset` is fine locally but `revert` is the
      correct choice once something's been pushed
- [ ] You used `git stash push` / `git stash pop` yourself and watched
      `git status` go clean then dirty again
- [ ] `rm -rf ~/git-lab`
- [ ] Commit this lesson:

```bash
git add "src/docs/UpSkillOS work/git-fundamentals/03-undoing-mistakes.md"
git commit -m "docs: undoing-mistakes lesson — restore/reset/revert/stash, and when each applies"
```

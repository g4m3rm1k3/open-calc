# Reading History and Resolving Real Conflicts

**Case study:** deciding whether PR #7 was safe to merge today required
reading history precisely — `git merge-base` to find where a branch
actually diverged, `git log --oneline` to see how many commits behind
that was, `git diff --stat` to see what actually changed rather than
trusting a scary-looking raw diff. And the merge itself produced a real
conflict on `package-lock.json` that needed a deliberate resolution, not
an automatic one. This lesson is both halves: reading what happened, and
handling it when two histories can't be combined automatically.

## What you will build

Fluency in the `git log` family for answering "what actually happened
here" under real time pressure, and a real, intentionally-created merge
conflict that you resolve by hand — so the first time you see conflict
markers in a real file isn't the first time you've ever seen them.

## What you need to know first

[Lesson 01](01-branch-before-you-change-anything.md) (branches, merging)
and [Lesson 02](02-staying-in-sync.md) (fetch, ahead/behind/diverged).

---

## The Lesson

### Reading history: the log family

```bash
mkdir ~/git-lab && cd ~/git-lab
git init
for msg in "first" "second" "third"; do
  echo "$msg" >> file.txt
  git add file.txt
  git commit -m "$msg"
done
```

Three commits. Now the tools, each answering a different question:

```bash
git log --oneline
```
```
c3d4e5f third
b2c3d4e second
a1b2c3d first
```
**"What commits exist, in order?"** — the everyday default. One line per
commit: short hash, message.

```bash
git log --oneline --graph --all
```
```
* c3d4e5f third
* b2c3d4e second
* a1b2c3d first
```
**"How do the branches relate to each other?"** — adds a text drawing of
the actual commit graph. On a single line of history like this it's
boring; once you have branches, `--graph` is what makes divergence and
merges visually obvious instead of requiring you to mentally trace parent
pointers. `--all` shows every branch, not just the one you're on — we
used exactly this combination today to see `main`, `mobile-ui-fix`, and
the stray leftover branches all at once.

```bash
git show a1b2c3d
```
**"What exactly changed in one specific commit?"** — the full diff for
that commit alone, plus its message and metadata. We used this today
(`git show 6e441b99 --stat`) to figure out when and by whom a file had
last been touched, without guessing from memory.

```bash
git diff a1b2c3d b2c3d4e
```
**"What's different between any two points?"** — not necessarily adjacent
commits, not necessarily even on the same branch. `git diff branch-a
branch-b -- path/to/file` (add `--stat` for a summary instead of the full
text) is exactly what we ran today to sanity-check `package-lock.json`
before deciding how to handle it — comparing two branches' versions of
one file directly, without merging anything yet.

```bash
git blame file.txt
```
**"Who wrote this specific line, and in which commit?"** — one line of
attribution per line of the file, each pointing at the commit that most
recently changed it. The tool for "why does this line exist" when a
comment won't answer it — go read the commit message it points at.

**SE lens, tying all four together:** none of these change anything —
they're pure investigation. The instinct to reach for one of these
*before* running a command that changes state (merge, reset, push) is
what separates "I think this is safe" from "I checked, this is safe" —
exactly the difference between the earlier, wrong plan for PR #7 (act
first) and what we actually did (`merge-base`, `diff --stat`, then act).

### A real merge conflict, on purpose

Every example so far avoided conflicts by construction. Now make one.

```bash
git checkout -b feature-branch
echo "feature branch's version" > shared.txt
git add shared.txt
git commit -m "add shared.txt on the branch"

git checkout main
echo "main's version" > shared.txt
git add shared.txt
git commit -m "add shared.txt on main"
```

Both branches now have a commit that creates `shared.txt` — with
different content. Neither is an ancestor of the other, so this cannot be
a fast-forward (Lesson 01) — git has no choice but to actually merge:

```bash
git merge feature-branch
```
```
Auto-merging shared.txt
CONFLICT (content): Merge conflict in shared.txt
Automatic merge failed; fix conflicts and then commit the result
```

```bash
cat shared.txt
```
```
<<<<<<< HEAD
main's version
=======
feature branch's version
>>>>>>> feature-branch
```

**Define at use — conflict markers:** `<<<<<<< HEAD` through `=======` is
*your current branch's* version of the conflicting lines. `=======`
through `>>>>>>> feature-branch` is *the other branch's* version. Git
could not decide which one you wanted (or how to combine them), so it
wrote both into the file, wrapped in markers, and is waiting for you to
edit the file down to what it *should* say.

**Walkthrough — resolving it:** open the file in an editor. Delete
everything you don't want, including all three marker lines themselves —
`<<<<<<<`, `=======`, and `>>>>>>>` are not valid file content, they're
git's way of asking a question inside the file. Decide the real answer —
maybe you want `main`'s version, maybe the branch's, maybe something that
combines both:

```bash
echo "the actual resolution — could be either side or something new" > shared.txt
git add shared.txt
git status
```
```
All conflicts fixed but you are still merging.
```

```bash
git commit --no-edit
git log --oneline --graph
```
```
*   f4g5h6i Merge branch 'feature-branch'
|\
| * d3e4f5g add shared.txt on the branch
* | c3d4e5f add shared.txt on main
|/
* b2c3d4e second
* a1b2c3d first
```

**CS lens:** `git add shared.txt` here means something slightly different
than usual — it's not staging a new change, it's telling git "the
conflict in this file is resolved, I'm satisfied with its current
content." `git commit` with no message argument opens an editor with a
pre-filled merge commit message; `--no-edit` accepts that default without
opening an editor, useful in scripts or when the default message is
already fine. Notice the graph: this **is** a real merge commit, with
*two* parent commits (`d3e4f5g` and `c3d4e5f`) — the first divergent
history you've seen in these lessons, everything before this was a single
line.

**If you want to back out of a conflicted merge entirely** — decide you
picked the wrong branch, or just want to start over —
`git merge --abort` restores everything to exactly how it was before you
ran `merge`, as if it never happened. Know this exists before you need it
under pressure.

---

## Connect the pieces

Today's actual conflict, package-lock.json during the PR #7 merge, worked
through the same mechanics but with one twist worth naming: git's
automatic 3-way merge *didn't* report a hard conflict for that file — it
produced output that looked successful (`Auto-merging package-lock.json`,
no `CONFLICT` line) but the *result* was a hybrid neither side actually
wanted, since a machine-generated lockfile's line-by-line diff doesn't
carry real meaning the way prose or code usually does. We caught this by
doing exactly what this lesson's "reading history" tools are for —
`git diff origin/main -- package-lock.json` after the merge, to actually
look at what landed, rather than trusting a clean exit code — and then
used the file-from-another-branch move from
[Lesson 03](03-undoing-mistakes.md) to force it back to the correct
version. **Not every bad merge announces itself as a conflict.** Checking
the result is still worth doing even when git says it succeeded.

## What breaks without this

Without `merge --abort`, backing out of a bad conflict resolution means
manually reconstructing whatever state existed before, file by file, from
memory — slow and error-prone exactly when you're already frustrated.
Without checking a "successful" auto-merge's actual output, a
machine-generated file like a lockfile can silently end up in a
half-and-half state that satisfies neither side and breaks the next
`npm ci` for reasons that take real time to trace back to "the merge did
this."

## Definition of done

- [ ] You ran the log family (`--oneline`, `--graph --all`, `show`,
      `diff <a> <b>`, `blame`) against the lab repo and can say what
      question each one answers
- [ ] You created a real conflict, saw the marker syntax, deleted the
      markers, and committed the resolution yourself
- [ ] You know `git merge --abort` exists and when you'd reach for it
- [ ] `rm -rf ~/git-lab`
- [ ] Commit this lesson:

```bash
git add "src/docs/UpSkillOS work/git-fundamentals/04-reading-history-and-conflicts.md"
git commit -m "docs: reading-history-and-conflicts lesson — log family, real conflict markers"
```

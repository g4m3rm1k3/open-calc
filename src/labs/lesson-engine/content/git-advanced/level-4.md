---
series: git-advanced
level: 4
title: Interactive Rebase — Rewriting History
lang: bash
---

# Interactive Rebase — Rewriting History

Commits are not permanent decisions. Before pushing, you can rewrite your local history into exactly the shape it should have been if you'd thought it through from the start. Interactive rebase is the tool for this: it opens your commits in an editor, lets you reorder, squash, rename, delete, split, or edit each one, then applies them in the new order.

The result is commit history that looks like careful, thoughtful engineering — even if reality involved "WIP", "fix typo", "actually this", and three `git reset`s. History should communicate intent, not record your process.

By the end of this lesson you will understand every interactive rebase command (pick, squash, fixup, reword, edit, drop, exec), be able to clean up any sequence of commits before a PR, and know how to split a commit and edit a commit mid-rebase.

## Starting an interactive rebase

```bash
# Rebase the last N commits interactively:
git rebase -i HEAD~4   # last 4 commits

# Rebase all commits since branching from main:
git rebase -i main

# Rebase all commits since a specific commit (that commit is NOT included):
git rebase -i a1b2c3d

# Git opens your $EDITOR with a list like:
# pick a1b2c3d feat: add user model
# pick b2c3d4e WIP: half-done auth
# pick c3d4e5f fix typo
# pick d4e5f6a feat: add auth endpoints

# Commits are listed oldest → newest (top to bottom)
# Save and close to apply. Git replays them in order.
```

## Every interactive rebase command

```text
pick (p)    — keep the commit as-is, no changes
reword (r)  — keep the commit's DIFF but open editor to change the message
edit (e)    — pause after applying this commit so you can amend it
squash (s)  — combine this commit with the one ABOVE it; merge both messages
fixup (f)   — combine this commit with the one ABOVE it; discard THIS message
drop (d)    — completely remove this commit (the diff is discarded)
exec (x)    — run a shell command at this point in the replay sequence
break (b)   — pause here (like edit, but without applying a commit)

Example transformation:
  BEFORE:                          AFTER:
  pick a1b2 feat: add user model   pick a1b2 feat: add user model
  pick b2c3 WIP: half-done auth    squash b2c3 WIP: half-done auth
  pick c3d4 fix typo               fixup c3d4 fix typo
  pick d4e5 feat: add endpoints    reword d4e5 feat: add endpoints

Result: 2 commits — "feat: add user model" (unchanged) +
        "feat: add auth endpoints" (with better message, squash absorbed b2c3 + c3d4)
```

```bash
# squash vs fixup in detail:
# squash — opens an editor combining BOTH commit messages so you can write a new one
# fixup  — silently discards the fixup commit's message (the upper commit's message wins)

# Use fixup when: the commit is just a correction to the one above it
# Use squash when: both commits' messages have content worth merging

# drop vs leaving a commit out:
# drop   — explicitly marks a commit for deletion (shows intent)
# Deleting the line — same result but less readable
```

## Editing and splitting commits mid-rebase

```bash
# Mark a commit as "edit":
# edit a1b2c3d feat: two things in one commit

# Git applies that commit and PAUSES. You are now detached at that commit.
# To split it into two:

# Undo the commit but keep the changes staged:
git reset HEAD~1   # (--mixed, unstages everything)

# Stage and commit the first logical piece:
git add src/models/user.js
git commit -m "feat: add user model"

# Stage and commit the second piece:
git add src/routes/auth.js
git commit -m "feat: add auth routes"

# Resume the rebase:
git rebase --continue
```

```bash
# Amending a specific commit mid-rebase:
# edit b2c3d4e fix: authentication

# Git pauses here. Make your changes:
# Edit files...
git add .
git commit --amend --no-edit   # update the paused commit
git rebase --continue

# OR: add entirely new commits between existing ones:
# Git is paused at b2c3d4e — you can make new commits here.
# git add, git commit — these become commits BETWEEN b2c3d and the next commit.
# git rebase --continue resumes.
```

## exec — running commands during rebase

```bash
# Run tests after every commit to catch which commit broke them:
git rebase -i main --exec "npm test"

# This inserts "exec npm test" after every pick automatically:
# pick a1b2 feat: add user model
# exec npm test
# pick b2c3 feat: add auth
# exec npm test
# ...

# If any exec command exits non-zero, rebase pauses.
# Fix the issue, then git rebase --continue.

# Custom exec sequence:
# pick a1b2 feat: add user model
# exec npm test -- --testPathPattern=user
# exec eslint src/models/user.js
# pick b2c3 feat: add auth
# exec npm test -- --testPathPattern=auth
```

```text
Rebase --autosquash — skipping the editor for fixups:

If your commit message starts with "fixup!" or "squash!" followed by
the message of another commit, rebase -i --autosquash sorts them automatically.

git add forgotten-file.js
git commit --fixup a1b2c3d
# → Creates: "fixup! feat: add user model"

git rebase -i --autosquash main
# Git automatically places the fixup! commit directly under its target.
# No manual reordering required.

# Set as default: git config --global rebase.autoSquash true
```

**CS lens:** Interactive rebase is a **controlled replay** of a sequence of patch operations — the same concept as a database transaction log replay or event sourcing replay. The interactive editor is a declarative description of a transformation: "given this list of patches, apply them in this order, combining/modifying/dropping as specified." This is structurally identical to a compiler's intermediate representation (IR) optimization passes: the source (original commits) is transformed through a series of operations to produce a more efficient output (clean commits) while preserving semantic equivalence.

**SE lens:** The ability to rewrite history before pushing is one of Git's most professionally significant features. In practice, experienced developers commit frequently with rough messages ("wip auth", "fix test", "actually no") and then clean up with interactive rebase before opening a PR. The PR history then reads as intentional engineering decisions rather than a debugging session. This is how Linux kernel contributors work: hundreds of local iterations, one clean patch set submitted for review. Reviewers can understand each commit in isolation, `git bisect` works cleanly, and `git blame` gives meaningful attribution.

**Common mistakes:**
- Rebasing after push to a shared branch — teammates who pulled those commits now have divergent history. Force-push is required, which is destructive. Rule: only rebase commits that exist only on your machine.
- Using squash when fixup is appropriate — `squash` opens an editor to write a combined message, which is only valuable when both messages have content. For "fix typo" and "fix: accidentally removed return", use `fixup`.
- Forgetting `git rebase --continue` after resolving a conflict — the rebase stays paused indefinitely. Check `git status` which shows you're in the middle of a rebase.

**Debug tip:** If an interactive rebase goes badly wrong: `git rebase --abort` returns everything to the pre-rebase state (Git also saves the pre-rebase ref as `ORIG_HEAD`). If you've already `--continue`d past the point of no return, `git reflog show <branch>` shows every state the branch was in during the rebase; pick the pre-rebase entry and `git reset --hard` to it.

## Challenge: interactive_rebase

Answer questions about interactive rebase.

```challenge javascript
const irebase = {
  // You have 5 commits. You want to combine commit 3 and 4 into commit 3,
  // keeping commit 3's message and discarding commit 4's message. Which command?
  combineDiscardMessage: '',

  // How do you split one commit into two commits during interactive rebase?
  splitCommit: '',

  // What does the "exec" command do in an interactive rebase?
  execCommand: '',

  // Commit message prefix that makes rebase --autosquash automatically merge it:
  autosquashPrefix: '',

  // You're mid-rebase and something went horribly wrong. How do you cancel everything?
  cancelRebase: '',
};
```

```test
assert irebase.combineDiscardMessage.toLowerCase().includes('fixup') || irebase.combineDiscardMessage.toLowerCase() === 'f'
assert irebase.splitCommit.toLowerCase().includes('edit') && (irebase.splitCommit.toLowerCase().includes('reset') || irebase.splitCommit.toLowerCase().includes('head~1'))
assert irebase.execCommand.toLowerCase().includes('shell') || irebase.execCommand.toLowerCase().includes('command') || irebase.execCommand.toLowerCase().includes('run')
assert irebase.autosquashPrefix.toLowerCase().includes('fixup!') || irebase.autosquashPrefix.toLowerCase().includes('squash!')
assert irebase.cancelRebase.includes('rebase') && irebase.cancelRebase.includes('--abort')
```

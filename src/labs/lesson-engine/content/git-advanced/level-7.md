---
series: git-advanced
level: 7
title: Advanced Git — Submodules, Worktrees, rerere, and .gitattributes
lang: bash
---

# Advanced Git — Submodules, Worktrees, rerere, and .gitattributes

This level covers four advanced Git features that solve specific professional problems: submodules for managing shared dependencies as separate repositories, worktrees for working on multiple branches simultaneously without cloning, rerere for automating resolution of recurring merge conflicts, and .gitattributes for controlling how Git handles line endings, diffs, and merges per file type.

These are not everyday commands, but they are the right tool for specific situations — and using the wrong tool (multiple clones instead of worktrees, manual re-resolution instead of rerere) costs significant time over a project's lifetime.

By the end of this lesson you will understand when and how to use submodules, be able to work on multiple branches simultaneously with worktrees, automate recurring conflict resolution with rerere, and configure file-level behavior with .gitattributes.

## Submodules — embedding one repo inside another

```bash
# Submodules let one Git repo contain a reference to a specific commit of another repo.
# Use case: shared design system, shared protobuf definitions, vendored dependency.

# Add a submodule:
git submodule add https://github.com/org/design-system.git src/design-system
# Creates: .gitmodules file (tracked) + initializes the submodule
# The submodule appears as a "gitlink" entry in the parent repo's tree — a directory
# that contains a commit hash, not a full directory listing.

# After cloning a repo that has submodules — submodule directories are empty:
git clone https://github.com/org/app.git
cd app
git submodule init     # register submodule paths from .gitmodules
git submodule update   # check out the pinned commits into the directories

# Or in one command:
git clone --recurse-submodules https://github.com/org/app.git
```

```bash
# Updating a submodule to its latest commit:
cd src/design-system    # enter the submodule (it's a full Git repo)
git pull origin main    # update to latest
cd ../..
git add src/design-system        # stage the new commit hash
git commit -m "chore: update design-system to v2.3"

# The parent repo tracks a specific COMMIT in the submodule, not a branch.
# Pinning to a commit is intentional — you control when you update.

# Update all submodules to their latest remote commits:
git submodule update --remote --merge

# Run a command in all submodules:
git submodule foreach 'git pull origin main'

# Remove a submodule:
git submodule deinit src/design-system    # unregister
git rm src/design-system                  # remove from tree
rm -rf .git/modules/src/design-system    # clean up
```

```text
Submodule gotchas:

• Cloning without --recurse-submodules leaves empty directories.
  Fix: git submodule update --init --recursive

• Committing in the submodule but not staging in the parent → parent still
  references the old commit. Always cd back to parent and git add after changes.

• Submodules in submodules (nested) get exponentially complex.
  Consider alternatives: git subtree, package managers, or monorepo.

• Team members must know to run `git submodule update` after pulling
  parent changes that update the pinned submodule commit.
```

## Worktrees — multiple branches at once

```bash
# Problem: you're on feature/big-refactor and need to check out main to test something.
# Solution without worktrees: stash, switch, test, switch back, pop stash.
# Solution with worktrees: check out main in a separate directory simultaneously.

# Create a linked worktree (a second checkout of the same repo):
git worktree add ../app-main main
# → Creates a directory at ../app-main with the main branch checked out.
# → Your current directory stays on feature/big-refactor.

# Now you have two fully functional working directories:
# /projects/app           ← feature/big-refactor
# /projects/app-main      ← main

# Each has its own HEAD and index — fully independent.
# They share the same .git/ object store (no extra storage for history).

# Create a worktree on a new branch:
git worktree add -b hotfix/critical-bug ../app-hotfix main

# List all worktrees:
git worktree list
# → /projects/app          58b86366 [feature/big-refactor]
# → /projects/app-main     a1b2c3d4 [main]
# → /projects/app-hotfix   a1b2c3d4 [hotfix/critical-bug]

# Remove a worktree when done:
git worktree remove ../app-main
# or: git worktree prune  (removes worktree records for directories that no longer exist)
```

```text
Worktree rules:
  • Each branch can only be checked out in ONE worktree at a time.
  • You cannot check out the same branch in two worktrees simultaneously.
  • Worktrees share objects, refs, stashes, and reflog — one repo, many views.

When to use worktrees:
  • Interrupt-driven work: code review on main while refactor is in-progress
  • Long builds: kick off a build in one worktree, keep working in another
  • Side-by-side comparison: see old and new implementation at once
  • Hot patches: maintain a worktree permanently checked out to main for fast hotfixes
```

## rerere — reuse recorded resolutions

```bash
# rerere = "reuse recorded resolution"
# When you resolve the same merge conflict repeatedly (e.g., long-lived feature branch
# being rebased onto main daily), rerere records your resolution and replays it.

# Enable rerere globally:
git config --global rerere.enabled true
# or per repo: git config rerere.enabled true

# When you encounter and resolve a conflict:
# 1. Git records the conflict fingerprint (before + after state) in .git/rr-cache/
# 2. Next time Git sees the SAME conflict, it applies your resolution automatically.
# 3. You still see "Recorded resolution for X" and can review before finishing.

# Inspect what rerere has recorded:
git rerere status       # conflicts rerere knows how to resolve
git rerere diff         # show the recorded resolution
git rerere forget path  # forget the recorded resolution for a specific path
```

```text
Example: long-lived feature branch rebased onto main 20 times.
Main adds a new import to auth.js every week.
Your feature branch also adds imports to auth.js.
Every rebase has the same conflict.

Without rerere: resolve manually each time (20 × 2 minutes = 40 minutes wasted)
With rerere:    resolve once, recorded, auto-applied 19 more times.

rerere is most valuable when:
  • Your team uses long-lived branches rebased frequently onto main.
  • You have mechanical conflicts (import ordering, formatting) that always
    resolve the same way.
  • You rebase multiple times before a PR is merged.

rerere is less valuable when:
  • Conflicts are always different (semantic conflicts, API changes).
  • You use merge (not rebase) and conflicts are rare.
```

## .gitattributes — per-file Git behavior

```bash
# .gitattributes lives at the repo root (tracked, shared with team).
# It controls how Git handles specific file patterns.

cat > .gitattributes << 'EOF'
# Line endings: normalize to LF in the repo, convert on checkout
*           text=auto eol=lf
*.bat       text eol=crlf       # Windows batch files must have CRLF
*.sh        text eol=lf         # Shell scripts must have LF

# Binary files: never try to diff or merge these
*.png       binary
*.jpg       binary
*.gif       binary
*.pdf       binary
*.woff2     binary
*.zip       binary
*.exe       binary

# Custom diff drivers: use a language-aware differ
*.json      diff=json
*.md        diff=markdown

# Merge strategy: always prefer our version (never conflict)
package-lock.json merge=ours    # regenerated from package.json on install

# Mark generated files as not human-written (affects git diff and blame)
dist/*      linguist-generated=true   # GitHub hides generated diffs
*.min.js    linguist-generated=true
EOF
```

```bash
# text=auto eol=lf in detail:
# text=auto  → Git decides if a file is text or binary (by scanning for null bytes)
# eol=lf     → On checkout on any OS, convert line endings to LF
# Without this: Windows contributors commit CRLF, Linux/Mac contributors commit LF,
# every file shows as "changed" on the other OS.

# Custom diff for minified files (shows original, not minified diff):
git config diff.json.textconv "python3 -m json.tool"
# Now git diff *.json shows formatted JSON, not a wall of text.

# linguist-generated — GitHub-specific:
# Files marked linguist-generated are collapsed in pull requests.
# The diff is still there — just hidden by default for readability.
# GitHub uses Linguist to detect generated files automatically,
# but .gitattributes overrides it.

# Checking what attributes apply to a file:
git check-attr -a src/auth/validator.js
```

**CS lens:** `.gitattributes` is a **policy file** — it moves decisions from "what each developer does" to "what the repository enforces." This is the same shift from manual process to automated enforcement seen in linting configs (`.eslintrc`), formatting configs (`.prettier`), and type checker configs (`tsconfig.json`). `rerere` is a **memoization** of conflict resolutions — it caches the mapping from conflict-fingerprint to resolution, exactly as function memoization caches return values for repeated inputs. Submodules implement a **pinned dependency reference** — the same concept as a lock file (`package-lock.json`, `Cargo.lock`) but at the Git level, where the "package" is an entire repository at a specific commit.

**SE lens:** These four features solve specific professional-scale problems that don't appear in solo projects. Submodules appear in organizations with shared component libraries or microservice dependencies. Worktrees appear on teams doing rapid context-switching (feature work + code review + hotfixes). `rerere` appears in teams running GitFlow or long-lived feature branches. `.gitattributes` is essential in cross-platform teams where Windows and Unix developers share a codebase — without `text=auto eol=lf`, every file on a Windows machine is "changed" from a Unix perspective, making every diff noisy.

**Common mistakes:**
- Not running `git submodule update --init --recursive` after pulling — submodule directories stay at the old commit. Add it to your post-merge hook.
- Forgetting that a worktree directory is a live checkout — deleting the worktree directory without `git worktree remove` leaves a stale entry. Run `git worktree prune` to clean up.
- Enabling `rerere` after conflicts have already been recurring — rerere only records from the point it is enabled. Enable it at the start of a project.
- Adding `.gitattributes` to an existing repo with mixed line endings — all text files will show as changed when normalized. Commit the normalization in a dedicated commit first using `git add --renormalize .`.

**Debug tip:** To verify `.gitattributes` is being applied correctly: `git check-attr -a <file>` shows every attribute Git applies to that file. If line ending conversions are surprising you, `git ls-files --eol` shows the line ending status of every tracked file (i vs w = index vs working directory, both should be `lf` in a correctly configured repo).

## Challenge: git_advanced

Answer questions about submodules, worktrees, rerere, and .gitattributes.

```challenge javascript
const advanced = {
  // What command clones a repo AND initializes all its submodules in one step?
  cloneWithSubmodules: '',

  // What does a worktree allow you to do that a regular git checkout cannot?
  worktreeAdvantage: '',

  // What must be true for rerere to automatically replay a conflict resolution?
  rererCondition: '',

  // What .gitattributes setting prevents Windows/Linux line ending conflicts?
  lineEndings: '',

  // After a teammate pushes a commit that moves the pinned submodule forward,
  // what command updates your local submodule to match?
  updateSubmodule: '',
};
```

```test
assert advanced.cloneWithSubmodules.includes('clone') && advanced.cloneWithSubmodules.includes('recurse-submodules')
assert advanced.worktreeAdvantage.toLowerCase().includes('multiple') || advanced.worktreeAdvantage.toLowerCase().includes('simultaneously') || advanced.worktreeAdvantage.toLowerCase().includes('same time') || advanced.worktreeAdvantage.toLowerCase().includes('two branch')
assert advanced.rererCondition.toLowerCase().includes('same') || advanced.rererCondition.toLowerCase().includes('enabled') || advanced.rererCondition.toLowerCase().includes('identical') || advanced.rererCondition.toLowerCase().includes('recorded')
assert advanced.lineEndings.toLowerCase().includes('text=auto') || advanced.lineEndings.toLowerCase().includes('eol=lf') || advanced.lineEndings.toLowerCase().includes('text') && advanced.lineEndings.toLowerCase().includes('lf')
assert advanced.updateSubmodule.includes('submodule') && advanced.updateSubmodule.includes('update')
```

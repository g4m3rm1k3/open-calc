---
series: git-advanced
level: 5
title: Git Forensics — blame, log, and Archaeology
lang: bash
---

# Git Forensics — blame, log, and Archaeology

Code archaeology is a professional skill: you are handed a codebase, something is broken or poorly understood, and you need to reconstruct the decisions that led to the current state. Git is a complete forensics toolkit if you know how to use it.

`git blame` tells you who wrote each line and when. `git log -S` finds the commit that first introduced a specific string. `git log --follow` tracks a file through renames. `git log -G` finds commits where a pattern appeared or disappeared. These are not obscure commands — they are the tools experienced engineers reach for immediately when diagnosing a bug or understanding a design decision.

By the end of this lesson you will be able to trace the complete history of any line of code, find which commit introduced or removed any string or pattern, track files through renames and moves, and reconstruct the reasoning behind any design decision in a codebase.

## git blame — who wrote this line

```bash
# Show blame for a file (every line annotated with commit + author):
git blame src/auth/validator.js

# Output format:
# a1b2c3d4 (Jane Smith    2024-01-15 10:23:45 +0000 42) export function validateToken(token) {
# b2c3d4e5 (Bob Jones     2024-01-10 14:55:12 +0000 43)   if (!token) return false;
# c3d4e5f6 (Jane Smith    2024-01-15 10:23:45 +0000 44)   return jwt.verify(token, SECRET);
# ^a7b8c9d (Alice Chen    2023-11-02 09:10:33 +0000 45) }
# ^ means: this commit is the first in the history (before the current range)

# Blame a specific range of lines:
git blame -L 42,55 src/auth/validator.js

# Blame a specific commit's version of a file:
git blame a1b2c3d -- src/auth/validator.js

# Ignore whitespace changes (useful for reformatted code):
git blame -w src/auth/validator.js

# Show the commit hash in full (default is abbreviated):
git blame --abbrev=40 src/auth/validator.js
```

```bash
# Detect moved or copied lines (find where lines were moved FROM):
git blame -M src/auth/validator.js   # detect lines moved within the same file
git blame -C src/auth/validator.js   # detect lines copied from other files in same commit
git blame -CC src/auth/validator.js  # also detect from other commits
git blame -CCC src/auth/validator.js # most thorough: detect from any commit in history

# The -C flags are key for refactored codebases.
# Without them, blame shows the commit that moved the line, not the commit that wrote it.
```

## git log -S and -G — the pickaxe

```bash
# Find commits that ADDED or REMOVED the exact string "validateToken":
git log -S "validateToken" --oneline
# → Shows commits where the count of "validateToken" in the codebase changed.
# → Useful for: finding when a function was added, renamed, or removed.

# Find commits where the string appears in the diff (added OR in context):
git log -G "validateToken" --oneline
# → More permissive: shows commits where the string appears anywhere in the diff.
# → Useful for: finding all commits that touched a string.

# -S vs -G:
# -S (pickaxe): the string's count in the file changed (introduction or removal)
# -G (grep):    the string appears in any line of the diff output

# Scope to a specific file or directory:
git log -S "validateToken" -- src/auth/

# Show the actual diff alongside the commits:
git log -S "validateToken" -p --oneline

# Case insensitive search:
git log -S "validatetoken" -i --oneline

# Regex search with -G:
git log -G "validate(Token|Session|Cookie)" --oneline
```

## git log --follow — tracking files through renames

```bash
# Standard git log doesn't follow renames:
git log src/auth/validator.js
# → Only shows history since the file was at this path.

# --follow reconstructs history across renames:
git log --follow src/auth/validator.js
# → Shows history including when this file was auth.js, utils/auth.js, etc.

# Combined with -p to see all changes including before renames:
git log --follow -p src/auth/validator.js

# Find all renames of a file across history:
git log --follow --diff-filter=R --summary -- src/auth/validator.js
# --diff-filter=R: only show commits where files were Renamed
# --summary: shows rename summary (auth.js → auth/validator.js)
```

## Full forensics workflows

```bash
# WORKFLOW 1: "who wrote this weird line and why?"
git blame -w src/orders/calculator.js -L 142,142
# → b2c3d4e5 (Jane Smith 2024-02-10 ...) return price * (1 - discount) * TAX_RATE;
# Now read that commit:
git show b2c3d4e5
# → "fix: EU tax compliance — multiply after discount per regulation 2024/123"
# Mystery solved.

# WORKFLOW 2: "when was this function introduced?"
git log -S "calculateDiscount" --oneline -- src/orders/
# → a1b2c3d feat: add discount system (2024-01-05)
git show a1b2c3d  ← read the original implementation + PR context

# WORKFLOW 3: "why does this code exist? it looks wrong."
git log --follow -p src/orders/calculator.js | grep -B5 -A5 "TAX_RATE"
# → Find every diff where TAX_RATE appears, see the context of each change.

# WORKFLOW 4: "we removed something, what commit removed it?"
git log -S "calculateShipping" --oneline
# → Shows the commit where calculateShipping count went from N to N-1 (removal)

# WORKFLOW 5: "what changed in this area during the last sprint?"
git log --since="2 weeks ago" --oneline -- src/orders/
git log main..feature/new-checkout --oneline -- src/orders/
```

```bash
# Additional forensics commands:

# Show all commits that touched a function (by regex):
git log -G "function calculateDiscount" -p

# Find the author who has touched a file the most:
git shortlog -sn -- src/auth/validator.js

# Show the commit graph for a specific file's history:
git log --graph --oneline --follow src/auth/validator.js

# Compare a file across two branches:
git diff main..feature/x -- src/auth/validator.js

# Show what a file looked like at a specific commit:
git show a1b2c3d:src/auth/validator.js

# Find all commits by a specific author in a date range:
git log --author="Jane Smith" --since="2024-01-01" --until="2024-03-01" --oneline
```

**CS lens:** `git log -S` is a **pattern-matched set difference query** on the object graph. For each commit, it computes the count of the search string in the before-state and after-state of each file. A change in count means the string was added or removed. This is equivalent to a database query: `SELECT commit WHERE count_before != count_after`. The `-G` variant is a **substring search** over the diff text, closer to `grep` than to a structured query. Understanding this distinction explains why `-S` is precise (finds introductions and removals) while `-G` is broad (finds any diff that touches the string).

**SE lens:** Code archaeology is a critical skill that separates maintainers from contributors. Contributors add features; maintainers understand the existing system deeply enough to extend or modify it safely. The ability to trace why a piece of code exists — not just what it does — prevents a specific class of bugs: removing code that exists to handle an edge case whose context is no longer obvious. Every time `git blame` + `git show` reveals a comment like "fix: handle NULL from Oracle driver in certain transaction modes", a potentially catastrophic bug removal has been prevented.

**Common mistakes:**
- Reading `git blame` output without reading `git show` on the blamed commit — the commit message and full diff have the context that blame alone doesn't.
- Not using `-M` and `-C` with blame on refactored code — blame without move detection falsely attributes lines to the developer who ran a refactor, not the one who wrote the original logic.
- Using `git log` without `--follow` and concluding a file has no history before a rename.

**Debug tip:** In VS Code and JetBrains IDEs, "Git Blame" is available as an inline annotation on every line. But the IDE only shows the last-touched commit, not the copy-detection that `-C` provides. For deep code archaeology, the command line with `-CCC` gives you the true original author even across multiple refactors.

## Challenge: git_forensics

Answer questions and commands for Git forensics.

```challenge javascript
const forensics = {
  // Command to find which commit first introduced the string "deleteAllUsers":
  findIntroduced: '',

  // Command to see git blame for lines 100-120 of src/db/queries.js:
  blameRange: '',

  // What flag makes git log follow a file's history through renames?
  followFlag: '',

  // Difference between git log -S and git log -G:
  sVsG: '',

  // After running git blame, what command shows the full context of the blamed commit?
  seeCommit: '',
};
```

```test
assert forensics.findIntroduced.includes('log') && forensics.findIntroduced.includes('-S') && forensics.findIntroduced.includes('deleteAllUsers')
assert forensics.blameRange.includes('blame') && forensics.blameRange.includes('-L') && forensics.blameRange.includes('100') && forensics.blameRange.includes('120') && forensics.blameRange.includes('src/db/queries.js')
assert forensics.followFlag.includes('--follow')
assert (forensics.sVsG.toLowerCase().includes('count') || forensics.sVsG.toLowerCase().includes('introduc') || forensics.sVsG.toLowerCase().includes('pickaxe')) && (forensics.sVsG.toLowerCase().includes('grep') || forensics.sVsG.toLowerCase().includes('appear') || forensics.sVsG.toLowerCase().includes('diff'))
assert forensics.seeCommit.includes('show') || forensics.seeCommit.includes('git show')
```

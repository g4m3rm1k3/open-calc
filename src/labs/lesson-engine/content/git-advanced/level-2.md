---
series: git-advanced
level: 2
title: git bisect — Binary Search Debugging
lang: bash
---

# git bisect — Binary Search Debugging

A bug appears in production. You don't know when it was introduced. The codebase has 800 commits since the last known-good release. You can test each commit manually, but that's 800 tests in the worst case.

`git bisect` solves this in at most 10 tests. It implements binary search over the commit graph: you tell it a good commit and a bad commit, it checks out the midpoint, you test, you tell it good or bad. Each answer cuts the search space in half. 800 commits: at most 10 bisect steps (log₂(800) ≈ 10). It is one of the most powerful debugging tools in software engineering and almost no one outside of Linux kernel development uses it.

By the end of this lesson you will understand the binary search algorithm applied to a commit graph, be able to run a full bisect session manually and automatically, and know how to write a bisect test script.

## How bisect works

```text
Commit history (simplified, oldest left):
A - B - C - D - E - F - G - H - I - J (current, bad)
                            ↑
                        bug introduced somewhere here

You know: A is good, J is bad.
Git bisect checks out the midpoint: E

You test E: GOOD
→ Bug introduced in F-J range. New midpoint: H.

You test H: BAD
→ Bug introduced in F-H range. New midpoint: G.

You test G: BAD
→ Bug introduced in F-G range. New midpoint: F.

You test F: GOOD
→ Bug introduced in G. That's the culprit commit.

Result: 4 tests to find the bug in 10 commits. (Not 10.)
Log₂(10) ≈ 3.3, so 4 steps. For 1,000 commits: 10 steps.
```

## Manual bisect session

```bash
# Start bisect
git bisect start

# Tell Git the current state is bad:
git bisect bad                    # current HEAD is bad
# or: git bisect bad HEAD         # same thing
# or: git bisect bad a1b2c3d     # specific bad commit

# Tell Git a known good commit (a tag, hash, or relative ref):
git bisect good v2.0.0           # tag from last working release
# or: git bisect good a7b8c9d    # specific good commit hash

# Git checks out the midpoint. Test your code, then:
git bisect good   # if this checkout works fine
# or
git bisect bad    # if the bug is present in this checkout

# Repeat until Git reports:
# → a1b2c3d is the first bad commit
#   commit a1b2c3d
#   Author: Jane Smith <jane@example.com>
#   Date:   Mon Jan 15 10:23:45 2024 +0000
#   feat: refactor database connection pool

# When done (restores HEAD to original position):
git bisect reset
```

```bash
# During bisect, skip a commit you can't test (compile error, unrelated breakage):
git bisect skip

# See a log of the bisect session:
git bisect log

# If you made a mistake marking good/bad, start over:
git bisect reset
git bisect start
```

## Automated bisect with a test script

```bash
# Write a script that exits 0 (success) if good, non-zero if bad:
cat > /tmp/test-script.sh << 'EOF'
#!/bin/bash
# Test if the login endpoint responds correctly
npm run build --silent
curl -s http://localhost:3000/login | grep -q '"status":"ok"'
EOF
chmod +x /tmp/test-script.sh

# Run automated bisect:
git bisect start
git bisect bad HEAD
git bisect good v2.0.0
git bisect run /tmp/test-script.sh

# Git runs your script at each midpoint.
# Exit 0 → marks good.
# Exit 1-127 → marks bad.
# Exit 125 → marks skip (use for commits that can't be tested).
# Git finishes automatically and reports the first bad commit.
```

```text
Writing a good bisect test script:

Requirements:
  • Must be deterministic — same commit, same result, every run
  • Must exit 0 for working code, non-zero for broken code
  • Must handle build failures gracefully (exit 125 to skip)
  • Should be fast — bisect runs it log₂(n) times

Shell script template:
  #!/bin/bash
  set -e           # exit on any error
  npm run build 2>/dev/null || exit 125   # skip if can't build
  npm test -- --testPathPattern="auth"    # run specific test
  # (exits 0 if test passes, non-zero if fails)

Python unit test:
  #!/bin/bash
  python -m pytest tests/test_auth.py -q || exit 1

Binary search is only as good as your test.
A flaky test produces wrong bisect results.
```

## Bisect with log and visualization

```bash
# See what commits are in scope before starting:
git log --oneline v2.0.0..HEAD | wc -l
# → 847 commits — log₂(847) ≈ 10 bisect steps

# Visualize the bisect session as it runs:
git bisect visualize
# or: git bisect view
# Opens gitk (or git log --graph) showing remaining candidate commits

# After bisect finds the culprit commit, inspect it:
git show a1b2c3d
# Read the diff to understand exactly what changed

# Find all files changed in the culprit:
git diff a1b2c3d^..a1b2c3d --name-only

# See all commits from that author in the range:
git log --author="Jane Smith" v2.0.0..HEAD --oneline
```

**CS lens:** `git bisect` implements **binary search** (O(log n)) on the commit DAG. Binary search is only correct when the search space has a monotonic property: commits before the bug are all "good", commits after are all "bad". In practice this is usually true (bugs don't fix themselves). When it's not — a bug was introduced and then partially reverted — use `git bisect skip` on ambiguous commits and inspect the range manually afterward. The automated `bisect run` is essentially a **property-based test** over the commit history: "find the commit where this property first became false."

**SE lens:** In the Linux kernel project, which has tens of thousands of commits and contributors worldwide, `git bisect` is standard procedure for regression reports. Linus Torvalds designed bisect into Git specifically because manual regression hunting in large histories is intractable. The discipline that makes bisect effective is the same discipline that makes code review effective: small, atomic commits with clear messages. A 47-file "refactor everything" commit is the worst possible bisect target — you've found the commit, but it doesn't tell you what changed.

**Common mistakes:**
- Not running `git bisect reset` after a session — leaves Git in bisect mode, causing confusing behavior on subsequent commands.
- Using a flaky test as the bisect script — non-deterministic tests cause bisect to mark commits incorrectly, finding the wrong culprit.
- Bisecting when there's an obvious path — bisect is for when you don't know where to look. If the last 3 commits are suspicious, just read them. Bisect shines for 50+ commits.

**Debug tip:** If `git bisect run` finds a wrong commit (because a test was flaky), replay the session: `git bisect log > /tmp/session.txt` to save it, then `git bisect replay /tmp/session.txt` to replay it step by step with manual checks. This lets you override individual good/bad decisions.

## Challenge: git_bisect

Answer questions about binary search debugging with git bisect.

```challenge javascript
const bisect = {
  // How many bisect steps (maximum) to find a bug in 1024 commits?
  stepsFor1024: '',

  // What exit code should a bisect test script return to mark a commit as "skip"?
  skipExitCode: '',

  // Command to start an automated bisect session with a test script:
  automaticBisect: '',

  // What command restores HEAD to its original position after bisect?
  endBisect: '',

  // Why does bisect only work correctly if bugs don't "fix themselves"?
  monotonic: '',
};
```

```test
assert bisect.stepsFor1024.includes('10') || bisect.stepsFor1024.toLowerCase().includes('ten')
assert bisect.skipExitCode.includes('125')
assert bisect.automaticBisect.includes('bisect') && bisect.automaticBisect.includes('run')
assert bisect.endBisect.includes('bisect') && bisect.endBisect.includes('reset')
assert bisect.monotonic.toLowerCase().includes('binary') || bisect.monotonic.toLowerCase().includes('monoton') || bisect.monotonic.toLowerCase().includes('good before bad') || bisect.monotonic.toLowerCase().includes('search') || bisect.monotonic.toLowerCase().includes('midpoint')
```

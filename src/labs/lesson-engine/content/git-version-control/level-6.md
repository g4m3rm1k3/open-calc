---
series: git-version-control
level: 6
title: Git Workflows
lang: bash
---

# Git Workflows

Knowing Git commands is necessary but not sufficient. Teams need an agreement about how those commands are used: which branch is always deployable, how features are isolated, how releases are tagged, when to merge versus rebase. Without this agreement, different developers' mental models of the repo diverge and conflicts multiply.

A **Git workflow** is exactly this agreement — a convention for branching, naming, and merging that the whole team follows. Simpler is better. The most productive teams use workflows that minimize the overhead between writing code and shipping it.

By the end of this lesson you will understand trunk-based development and GitHub Flow, know how to use tags for releases, understand when CI/CD pipelines trigger on Git events, and be able to make the argument for simpler workflows over complex branching strategies.

## Trunk-based development — the professional standard

```bash
# Trunk-based development: one shared branch (main), short-lived feature branches.
# main is ALWAYS deployable.

# Daily workflow:
git switch main && git pull              # start from latest main
git switch -c fix/course-slug-encoding  # short-lived branch
# ... make changes, commit ...
git push -u origin fix/course-slug-encoding
# Open PR → get review → merge → delete branch
# Average branch lifetime: hours to 2 days

# Key rules:
# 1. main is always deployable (CI tests pass, no known bugs)
# 2. Branches are short-lived (merge often, diverge less)
# 3. Feature flags for large features (merge incomplete code behind a flag)
```

```text
Used by: Google, Facebook, Netflix, GitHub.
Why it works:
- Short branches = small diffs = easy review = fewer conflicts
- main always works = safe to deploy at any time
- No "integration branch" — integration happens continuously

The alternative (Gitflow) has: main, develop, feature/*, release/*, hotfix/*
This sounds organized but creates long-lived branches and complex merges.
Most teams that try Gitflow switch to trunk-based development.
```

## GitHub Flow — simpler Gitflow

```bash
# GitHub Flow: main + feature branches + pull requests
# Simpler than Gitflow, more structured than pure trunk-based

# 1. main is always deployable
# 2. Feature branches for every change (even tiny ones)
# 3. Open PR as soon as you push
# 4. CI runs on every push (tests must pass)
# 5. Get code review on PR
# 6. Merge when approved and green

# The CI pipeline (.github/workflows/ci.yml):
# on: push
# jobs:
#   test:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#       - run: npm install
#       - run: npm test
#       - run: npm run lint
```

```text
GitHub Actions — CI/CD in the repository:
.github/workflows/ci.yml runs automatically on every push.
A failing test blocks the PR from being merged (if branch protection is enabled).

Branch protection rules (GitHub Settings → Branches):
- Require PR before merging to main
- Require CI to pass before merge
- Require at least 1 review approval
These rules make it physically impossible to merge broken code to main.
```

**CS lens:** CI (Continuous Integration) is the practice of merging frequently and running automated tests on every merge. The goal is to detect integration failures early — before they accumulate into a multi-day debugging session. Martin Fowler (who coined CI) defines it as: "integrating and testing at least daily." The key word is continuous — not "run tests before releasing," but "run tests on every change."

## Tags and releases

```bash
# Tag a specific commit as a release:
git tag v1.0.0
git push origin v1.0.0

# Annotated tag (preferred for releases — includes message):
git tag -a v1.0.0 -m "First production release"
git push origin --tags

# List all tags:
git tag

# Create a GitHub release from a tag:
# GitHub → Releases → Create a release → Choose tag v1.0.0
# → Attach binaries, write release notes
```

```text
Semantic Versioning (SemVer): MAJOR.MINOR.PATCH
v1.0.0 → v1.0.1: bug fix (PATCH — no API change)
v1.0.0 → v1.1.0: new feature (MINOR — backwards compatible)
v1.0.0 → v2.0.0: breaking change (MAJOR — API changed)

npm packages, GitHub releases, and most libraries use SemVer.
package.json "^1.2.3" means: accept any 1.x.x version >= 1.2.3
(but not 2.0.0, which may break the API).
```

## .github configuration

```bash
# .github/ directory — repository configuration for GitHub:
.github/
  workflows/
    ci.yml           # CI/CD pipelines (GitHub Actions)
    deploy.yml       # deployment pipeline
  PULL_REQUEST_TEMPLATE.md  # template pre-filled when opening a PR
  ISSUE_TEMPLATE/
    bug_report.md    # template for bug reports
    feature_request.md
  CODEOWNERS          # file → reviewer assignments
```

```text
PULL_REQUEST_TEMPLATE.md content:
## What changed
<!-- Describe the change -->

## Why
<!-- Explain the motivation -->

## How to test
<!-- Steps to verify the change works -->

## Checklist
- [ ] Tests added
- [ ] Documentation updated
- [ ] No breaking changes (or migration guide included)

CODEOWNERS:
src/auth/      @alice   # Alice reviews all auth changes
src/database/  @bob     # Bob reviews all database changes
*.sql          @bob     # Bob reviews all SQL files
```

**SE lens:** A well-configured `.github/` directory is invisible infrastructure that silently enforces quality. CODEOWNERS ensures domain experts review relevant changes. PR templates ensure every PR has a clear description. Branch protection ensures CI passes before merge. These configurations take an hour to set up and save hundreds of hours of communication overhead and post-merge bugs over the life of a project.

**Common mistakes:**
- Not using branch protection — "I'll remember to run the tests before merging." You won't, always, especially under deadline pressure. Make it automatic.
- Long-lived feature branches — the longer a branch lives, the harder it is to merge. Short branches, frequent integration.

**Debug tip:** `git log --all --oneline --graph` shows the complete branch/merge history as an ASCII graph. Essential for understanding where your branches stand relative to each other and to main.

**Congratulations — Git & Version Control complete!** You've covered the three states, core workflow, branching, remotes, PRs, rebase/stash/undo, and team workflows. These skills apply to every software project regardless of language or stack.

## Challenge: workflow_decisions

Choose the right workflow action for each scenario.

```javascript
const decisions = {
  // You need to interrupt your work to fix an urgent bug on another branch:
  interruptWork: '',
  // You've pushed 3 "WIP" commits and want to combine them into 1 clean commit:
  cleanupHistory: '',
  // A bug was introduced 2 weeks ago — you need to find which commit caused it:
  findBugCommit: '',
};
```

```test
assert decisions.interruptWork !== '' && decisions.cleanupHistory !== '' && decisions.findBugCommit !== ''
assert decisions.interruptWork.includes('stash')
assert !decisions.interruptWork.includes('commit')
assert decisions.cleanupHistory.includes('rebase') && decisions.cleanupHistory.includes('-i')
assert decisions.findBugCommit.includes('bisect')
```

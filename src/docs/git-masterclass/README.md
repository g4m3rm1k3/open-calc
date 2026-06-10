# Git Masterclass — From Zero to Team-Ready

**Who this is for:** Someone who can write code but has never used Git seriously,
or has used it by accident and doesn't know why things worked.

**What you will be able to do when finished:**
- Save your work safely and recover anything you've ever saved
- Work on new ideas without breaking working code
- Sync your work across machines
- Collaborate on a team without losing anyone's work
- Understand what went wrong when Git behaves unexpectedly

**How this series is written:** Every command is explained before you use it.
Every step is runnable as-is. Nothing is skipped and assumed.

---

## Series Map

| Lab | Title | What You Learn |
|-----|-------|----------------|
| [LAB-01](./GIT-LAB-01-What-Git-Is.md) | What Git Is | `init`, `add`, `commit`, `status`, `log` |
| [LAB-02](./GIT-LAB-02-Three-Zones.md) | The Three Zones | Staging area, working directory, `diff`, history |
| [LAB-03](./GIT-LAB-03-Branches.md) | Branches | `branch`, `switch`, `merge`, merge conflicts |
| [LAB-04](./GIT-LAB-04-Remotes.md) | Remotes and GitHub | `remote`, `push`, `pull`, `fetch`, origin |
| [LAB-05](./GIT-LAB-05-Fixing-Mistakes.md) | Fixing Mistakes | `restore`, `reset`, `revert`, `stash` |
| [LAB-06](./GIT-LAB-06-Team-Workflows.md) | Team Workflows | Fork, pull requests, rebase, code review |

---

## Before You Start

You need Git installed. Check:

```bash
git --version
```

Expected output: something like `git version 2.49.0`. If you get "command not found",
install Git from https://git-scm.com.

You also need a terminal. On Mac: **Terminal** or **iTerm2**. On Windows: **Git Bash**
(installed with Git) or **Windows Terminal**.

---

## How to Read These Labs

Every lab is a standalone document. Each one tells you exactly what to type,
what you should see, and why it works. If something doesn't match, the lab
tells you what to check.

Read every concept block before the code that uses it. They are there because
the code makes no sense without them.

Start at LAB-01. Do not skip ahead.

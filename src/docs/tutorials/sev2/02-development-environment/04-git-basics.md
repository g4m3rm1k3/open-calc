# Tutorial 4: Git Basics

## Introduction

Git is a **version control system** that tracks changes to your code. It enables:
- History of all changes
- Undo mistakes
- Collaboration
- Branches for experiments

> **You cannot be a professional engineer without knowing Git.**

---

## Part 1: Install Git

### 1.1 Check Installation

```bash
git --version
```

If installed, you'll see: `git version 2.x.x`

### 1.2 Install If Needed

**Windows:** Download from [git-scm.com](https://git-scm.com/)

**macOS:**
```bash
xcode-select --install
# or
brew install git
```

**Linux:**
```bash
sudo apt install git  # Ubuntu/Debian
sudo dnf install git  # Fedora
```

---

## Part 2: Configure Git

### 2.1 Set Your Identity

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2.2 Verify Configuration

```bash
git config --list
```

### 2.3 Recommended Settings

```bash
# Use VS Code as editor
git config --global core.editor "code --wait"

# Better diff output
git config --global diff.colorMoved zebra

# Prevent line-ending issues
git config --global core.autocrlf true  # Windows
git config --global core.autocrlf input # macOS/Linux
```

---

## Part 3: Initialize Repository

### 3.1 Navigate to Project

```bash
cd c:\Users\g4m3r\Documents\se-path-v2
```

### 3.2 Initialize

```bash
git init
```

Output:
```
Initialized empty Git repository in /path/to/se-path-v2/.git/
```

### 3.3 What Happened?

Git created a `.git` folder containing:
- Complete history
- Branch information
- Configuration

Never manually edit `.git`—use git commands.

---

## Part 4: The Git Workflow

### 4.1 The Three Areas

```
┌─────────────┐      git add       ┌─────────────┐     git commit    ┌─────────────┐
│   Working   │ ─────────────────▶ │   Staging   │ ────────────────▶ │  Repository │
│  Directory  │                    │    Area     │                   │  (History)  │
└─────────────┘                    └─────────────┘                   └─────────────┘
```

| Area | Purpose |
|------|---------|
| **Working Directory** | Files you're editing |
| **Staging Area** | Changes ready to commit |
| **Repository** | Permanent history |

### 4.2 Basic Workflow

1. **Edit** files in working directory
2. **Stage** changes with `git add`
3. **Commit** staged changes with `git commit`

---

## Part 5: Essential Commands

### 5.1 Check Status

```bash
git status
```

Shows:
- What's modified
- What's staged
- What's untracked

### 5.2 Stage Changes

```bash
# Stage specific file
git add filename.py

# Stage all changes
git add .

# Stage interactively
git add -p
```

### 5.3 Commit Changes

```bash
git commit -m "Description of changes"
```

**Commit message guidelines:**
- Start with verb (Add, Fix, Update, Remove)
- Be specific
- Keep under 72 characters

| Bad | Good |
|-----|------|
| "changes" | "Add Part entity with validation" |
| "fixes" | "Fix duplicate detection in repository" |
| "stuff" | "Implement check-in/check-out locking" |

### 5.4 View History

```bash
# Simple log
git log --oneline

# Detailed log
git log

# Last N commits
git log -n 5
```

### 5.5 View Changes

```bash
# Unstaged changes
git diff

# Staged changes
git diff --staged

# Changes in specific file
git diff filename.py
```

---

## Part 6: The .gitignore File

### 6.1 Purpose

Tell Git to ignore certain files:
- Generated files (cache, compiled)
- Dependencies (venv)
- Secrets (passwords, keys)
- IDE files

### 6.2 Create .gitignore

Create `.gitignore` in project root:

```gitignore
# Virtual environment
venv/
.venv/

# Python cache
__pycache__/
*.pyc
*.pyo
*.pyd
.Python

# IDE
.vscode/
.idea/
*.swp

# Testing
.pytest_cache/
.coverage
htmlcov/

# Environment
.env
*.env.local

# Database
*.db
*.sqlite3

# OS files
.DS_Store
Thumbs.db
```

### 6.3 Add to Git

```bash
git add .gitignore
git commit -m "Add gitignore"
```

---

## Part 7: Undoing Changes

### 7.1 Undo Unstaged Changes

```bash
# Discard changes to specific file
git checkout -- filename.py

# Discard all unstaged changes
git checkout -- .
```

**Warning:** This permanently discards changes!

### 7.2 Unstage Files

```bash
# Unstage specific file
git reset HEAD filename.py

# Unstage all
git reset HEAD
```

### 7.3 Undo Last Commit (Keep Changes)

```bash
git reset --soft HEAD~1
```

Changes move back to staging.

### 7.4 Undo Last Commit (Discard Changes)

```bash
git reset --hard HEAD~1
```

**Warning:** This permanently discards the commit!

---

## Part 8: Your First Commits

### 8.1 Initial Commit

Let's commit what we've created so far:

```bash
# Check status
git status

# Add everything
git add .

# Commit
git commit -m "Initial commit: tutorial structure"
```

### 8.2 Verify

```bash
git log --oneline
```

Output:
```
a1b2c3d Initial commit: tutorial structure
```

---

## Part 9: Exercises

### Exercise 1: Basic Workflow

1. Create a file `hello.py` with `print("Hello")`
2. Check status
3. Stage it
4. Commit with message "Add hello script"
5. View history

<details>
<summary>Solution</summary>

```bash
# Create file
echo 'print("Hello")' > hello.py

# Check status
git status
# Shows: Untracked files: hello.py

# Stage
git add hello.py

# Check status again
git status
# Shows: Changes to be committed: new file: hello.py

# Commit
git commit -m "Add hello script"

# View history
git log --oneline
# Shows your commit
```

</details>

---

### Exercise 2: Modify and Commit

1. Edit `hello.py` to say "Hello, PartFlow"
2. View the diff
3. Stage and commit

<details>
<summary>Solution</summary>

```bash
# Edit file (use your editor)
# Change to: print("Hello, PartFlow")

# View diff
git diff hello.py
# Shows the change

# Stage
git add hello.py

# Commit
git commit -m "Update greeting message"

# Verify
git log --oneline
```

</details>

---

### Exercise 3: Undo Practice

1. Make a change to `hello.py`
2. Check status (should show modified)
3. Discard the change with `git checkout -- hello.py`
4. Verify the change is gone

<details>
<summary>Solution</summary>

```bash
# Make a change
echo 'print("TESTING")' > hello.py

# Check status
git status
# Shows: modified: hello.py

# Discard
git checkout -- hello.py

# Verify
cat hello.py
# Should show: print("Hello, PartFlow")
```

</details>

---

## Summary

### Key Commands

| Command | Purpose |
|---------|---------|
| `git init` | Initialize repository |
| `git status` | Show current state |
| `git add <file>` | Stage changes |
| `git commit -m "msg"` | Commit staged changes |
| `git log --oneline` | View history |
| `git diff` | Show unstaged changes |
| `git checkout -- <file>` | Discard changes |

### Git Workflow

```
Edit → git add → git commit
       (stage)   (save permanently)
```

### Verification Checklist

- [ ] `git --version` shows git installed
- [ ] Identity configured (name, email)
- [ ] Repository initialized
- [ ] .gitignore created
- [ ] Can make commits

---

## Next Tutorial

[Tutorial 5: Terminal Fluency →](./05-terminal-fluency.md)

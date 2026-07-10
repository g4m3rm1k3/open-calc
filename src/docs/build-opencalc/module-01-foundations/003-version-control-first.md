# 003 — Version Control First

*git before a single line of application code — and why the order is not arbitrary*

---

## What You Will Build

You will initialise a git repository, write a `README.md`, create a `.gitignore`, and make two commits — each with a message explaining why the change was made, not what files changed. By the end, `git log --oneline` will show a two-commit history that tells a clear story before any application code exists.

You will also commit `requirements.js` from lesson 001. The history will record permanently that requirements were written before any application code — a fact visible for as long as this repository exists.

---

## What You Need to Know First

Lesson 001 — What Is Software Engineering? You will commit `requirements.js` from that lesson. Write it first if you have not.

Lesson 002 — Your Environment. Verify `git --version` prints a version before continuing.

---

## The Lesson

### What version control is and what it is not

**Version control** is a system that records changes to files over time so that any previous state can be recalled. git is the most widely used version control system in the world — GitHub, GitLab, and Bitbucket are all built on it.

Version control is not a backup. Your operating system saves files. git records a history of decisions.

The difference is not subtle. When you save a file, the previous version is gone — overwritten. When you commit to git, the previous version is permanently preserved. You can recover it. You can read it. You can compare it to the current version and see exactly what changed, when, and why.

This is what a meaningful project history looks like after a month of work:

```
a3f9b21 Add offline caching via service worker
2e8c450 Implement lab registry with lazy loading
7d1a093 Add React Router with three initial routes
5b2f817 Scaffold React project with Vite
0c4e321 Add .gitignore for node_modules and build output
a1d9c7e Add README and requirements before first application code
```

Read bottom to top: requirements before code, infrastructure before features. Each commit is one decision. The history is a record of how the project was built and why. This is how you recover from a wrong decision, how a new developer understands the project, and how you understand your own work six months later.

---

**CS lens — git as an append-only linked list of snapshots:**

A git commit is a data structure with three components:

1. A **tree object** — the state of every tracked file at this moment, stored compressed
2. A **pointer to the parent commit** — the commit immediately before this one
3. **Metadata** — author name, email, timestamp, and message

Commits form a linked list. Each points to the one before it. The first commit has no parent. You traverse the list by following parent pointers backward from the newest commit to the first.

Linked lists are append-only — you add to the end, never modify the middle. The same is true of git history. You cannot change a commit once it exists. You can add a new commit that reverses a change, but the original remains in the history.

The **commit hash** (like `a1d9c7e`) is a SHA-1 checksum generated from the commit's entire content: the parent hash, the tree, the metadata, and the message. If any part of the content changes, the hash changes. This means you can verify a commit has not been tampered with by checking its hash. No two commits anywhere in the world should produce the same hash.

---

**SE lens — version control as a decision record:**

Most tutorials describe version control as "saving your work." This understates its function. The diff (what changed) is recorded automatically — git computes it. The commit message is the only place to record *why* the change was made.

Your collaborator is your future self. Six months from now you will read this history and ask: why did I build it this way? A commit message that restates the diff ("add requirements.js") answers nothing. A commit message that states the decision ("Add requirements before first code — establishes what done means before any code is written") answers everything.

Code communicates what. Commit messages communicate why. Both are necessary.

---

### Initialise the repository

Navigate to your project folder in the terminal:

```bash
cd my-platform
```

If you created this folder in lesson 001, navigate into it. If not, create it first:

```bash
mkdir my-platform
cd my-platform
```

`mkdir` stands for "make directory." It creates a new empty folder with the name you provide, inside the current working directory.

Initialise git:

```bash
git init
```

Expected output:

```
Initialized empty Git repository in /Users/yourname/my-platform/.git/
```

`git init` creates a hidden directory called `.git` inside the current folder. The leading dot makes it hidden — `ls` will not show it. `ls -a` will: the `-a` flag means "show all, including hidden files and directories."

The `.git` directory is the repository. It contains the entire history, configuration, and internal state of git for this project. You never edit anything inside `.git` directly — git manages it. If you delete `.git`, you delete the entire history of the project.

Check the initial state:

```bash
git status
```

Expected output:

```
On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)
```

Three pieces of information:

**"On branch main"** — you are on the default branch named `main`. A **branch** is a label that points to a specific commit. When you add new commits, the label moves forward automatically to point at the newest one. `main` is the primary line of development. Older repositories use `master` for the same concept — different name, same idea.

**"No commits yet"** — the repository is empty. There is no history.

**"nothing to commit"** — no files exist yet, so there is nothing to stage or commit.

---

**CS lens — the working tree and the repository:**

git distinguishes two things that occupy the same folder:

The **working tree** — the files you can see and edit. Your actual project files: `requirements.js`, `README.md`, everything you create.

The **repository** — the `.git` directory, which stores the history. It is separate from the working tree even though it sits inside the project folder.

Changes in the working tree are not automatically recorded. You must explicitly tell git which changes to record (with `git add`) and when to permanently record them (with `git commit`). This intentional staging step allows you to make many changes and commit only those that belong together.

---

### The three states of a file

Every file in a git project is in exactly one of three states. Understanding these states removes most git confusion.

**State 1 — Untracked:** The file exists in the working tree but git has never been told to track it. git sees it but records nothing about it.

```bash
echo "test" > example.txt
git status
```

`echo "test"` prints the string `test`. `> example.txt` redirects that output into a file. If the file does not exist, it is created. If it does, it is overwritten. `echo` followed by `>` is a quick way to create a file from the terminal without opening an editor.

```
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        example.txt
```

git sees `example.txt` but will not include it in any commit until you explicitly tell it to.

---

**State 2 — Staged (the index):** The file's current state has been queued for the next commit via `git add`. Staging is an intermediate step between modifying a file and permanently recording the modification.

```bash
git add example.txt
git status
```

```
Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   example.txt
```

`example.txt` is staged. It will be included in the next commit. Staging is not committing — the change is not yet permanent. You can un-stage with `git restore --staged example.txt`, which removes the file from the staging area without deleting it from the working tree.

---

**State 3 — Committed:** The staged state has been permanently recorded in the repository. Committed changes cannot be lost — they exist in the history.

```bash
git commit -m "Add example file"
git status
```

```
On branch main
nothing to commit, working tree clean
```

"Working tree clean" means every tracked file in the working tree matches its committed state. No staged changes. No untracked modifications.

---

**Why three states exist:**

Not every change since the last commit belongs in the next commit. You might be partway through implementing a feature and have also fixed a quick, unrelated bug. You want to commit the bug fix alone — without the incomplete feature — so the history clearly records each change separately.

Staging lets you choose exactly which changes go into each commit, even when you have made many changes across many files.

---

**CS lens — the staging area as a buffer:**

The staging area (also called the **index**) is a buffer between the working tree and the repository. It holds a snapshot of what the next commit will look like. You build this snapshot with `git add`, then write it permanently with `git commit`.

This two-step process is an application of the principle from lesson 001: make decisions consciously. `git add` is the decision about what belongs in this commit. `git commit` is the permanent record of that decision.

---

**SE lens — small, focused commits reduce the cost of change:**

A commit that mixes many unrelated changes cannot be partially reverted. If one change caused a bug, reverting the commit reverts all the others too.

Small, focused commits — one logical change per commit — make reversals cheap and history readable. This is the commit-level application of separation of concerns: each commit has one responsibility.

Delete the test file before moving on:

```bash
rm example.txt
```

`rm` stands for "remove." It permanently deletes the file — not to a trash folder, directly gone. `rm -r directory-name` removes a directory and all its contents. Use both forms deliberately.

---

### Write a README and make the first commit

A **README** is the first file every repository should have. It answers the question any reader asks when they open a project: what is this?

Create `README.md` in VS Code or write it directly:

```markdown
# my-platform

An interactive learning platform for mathematics and engineering.

## What this is

A single-page React application. Each lab is an independent, lazily-loaded
learning environment. The shell manages navigation. Labs manage their own state.
Content is separate from both.

## Requirements

Run `node requirements.js` to see the full specification:
functional requirements, non-functional requirements, and architectural constraints.

## Architecture

Three layers, each with exactly one responsibility:

- **Shell** — navigation, routing, lab registration. Does not import from labs.
- **Labs** — independent learning environments. Each loads on demand.
- **Content** — lesson text, code, quizzes. No dependency on labs or shell.

## Status

No application code exists yet. Requirements are written.
Version control is initialised. The project is ready to receive code.
```

Save it as `README.md` in your project folder. The `.md` extension identifies it as a **Markdown** file. Markdown is a lightweight syntax for formatting text: `# Heading` becomes a large heading, `**text**` renders bold, `- item` becomes a bullet point. GitHub, GitLab, and VS Code's preview all render Markdown automatically. Plain text editors show the raw syntax, which is still readable.

Check the state:

```bash
git status
```

```
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        README.md
        requirements.js
```

Stage both files:

```bash
git add README.md requirements.js
```

`git add` accepts multiple filenames separated by spaces. You could write `git add .` to stage everything untracked in the current directory and all subdirectories. Do not make `git add .` a habit — it is easy to accidentally stage files you did not intend to include. Name files explicitly until you have a `.gitignore` that excludes everything you do not want tracked.

Verify the staging area:

```bash
git status
```

```
Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   README.md
        new file:   requirements.js
```

Make the first commit:

```bash
git commit -m "Add README and requirements before first application code

The README describes the project purpose and the three-layer architecture.
requirements.js specifies what done means: functional requirements,
non-functional requirements, and architectural constraints.

Committing these first ensures the project intent is recorded before any
code is written. The architectural constraints here govern every decision
in the series."
```

`git commit` records the staged snapshot permanently.  
`-m` means "message follows." The text in quotes is the commit message.

For multi-line messages: the first line (before the blank line) is the **summary** — kept under 72 characters so it displays cleanly in all tools. The blank line separates it from the **body**. The body explains the why.

Expected output:

```
[main (root-commit) a1d9c7e] Add README and requirements before first application code
 2 files changed, 47 insertions(+)
 create mode 100644 README.md
 create mode 100644 requirements.js
```

`root-commit` — this is the first commit, it has no parent.  
`a1d9c7e` — the abbreviated commit hash. Yours will differ.  
`2 files changed, 47 insertions(+)` — the diff summary.

Run:

```bash
git log
```

```
commit a1d9c7e3f4... (HEAD -> main)
Author: Your Name <your@email.com>
Date:   Thu Jul 10 10:23:14 2026

    Add README and requirements before first application code

    The README describes the project purpose and the three-layer architecture.
    ...
```

`HEAD` is a pointer to the commit you are currently on. `HEAD -> main` means HEAD points to the `main` branch, which points to this commit.

---

### Commit messages that communicate

The commit above has a multi-line body. Most tutorials show one-line messages: "add README", "fix bug", "update". Those are documentation failures.

git records what changed automatically — the diff. The message is the only place to record why.

```
BAD:  "Add README.md"
      git already shows README.md was added. The message adds no information.

GOOD: "Add README describing project purpose and three-layer architecture"
      States what the README contains, not that it was added.

BAD:  "Fix bug"
      What bug? In which component? What was wrong?

GOOD: "Restore navigation state after browser back button"
      Body: "The router reset lab state on popstate events because the
      component unmounted and remounted. Moved state to a ref that
      persists across remounts."
```

The test: could you understand the decision without reading the diff? If yes, the message carries the information. If no, the message is a label.

**The commit message format:**

```
Summary line — imperative mood, under 72 characters
               "Add", "Fix", "Implement", "Remove", "Refactor"

(blank line)

Body — explains why this change was made.
       What problem does it solve?
       What would happen without it?
       What alternatives were considered?
       Wrap at 72 characters per line.
```

**Imperative mood:** "Add" not "Added", "Fix" not "Fixed". git uses imperative mood in its own auto-generated messages ("Merge branch 'feature'"). The first line reads as an instruction: this commit adds this thing.

View history in two formats:

```bash
git log
# Full format: hash, author, date, full message

git log --oneline
# One line per commit: abbreviated hash and summary only
```

`--oneline` is useful for scanning history in projects with many commits. It shows only the summary line, which is why that line must be self-explanatory.

---

### .gitignore — what git must never track

Some files should never be in a repository. `.gitignore` is a file that tells git to ignore specific files and directories — permanently, unless explicitly overridden.

Create it now, **before** any of the files it will ignore are created:

```
# .gitignore

# npm dependencies — reproduced from package.json by running npm install
# node_modules can contain over 200,000 files
node_modules/

# Build output — generated from source by npm run build
dist/
build/

# macOS folder metadata — machine-specific, irrelevant to the project
.DS_Store

# Environment variables — may contain API keys, database passwords, secrets
# A committed secret is permanently exposed even if deleted in a later commit
.env
.env.local
.env.production
```

Save this as `.gitignore` in your project folder. The leading dot is part of the filename — this is not a file with no name and a `.gitignore` extension. The dot convention marks it as a hidden configuration file.

**Each pattern explained:**

`node_modules/` — the trailing slash indicates a directory. git ignores the entire directory and everything inside it. Without the slash, `node_modules` would match both a file and a directory.

`dist/` and `build/` — build output folders. Everything inside is generated from your source — committing it adds churn to the history (it changes on every build) without adding information.

`.DS_Store` — macOS creates this file automatically in every folder it displays in Finder, storing view preferences (icon size, column widths). It is machine-specific. Committing it creates meaningless differences between developers and generates false conflicts.

`.env` — **Environment variables** are key-value pairs that configure the application for a specific deployment context: API keys, database connection strings, secret tokens. These must never be committed.

---

**Why secrets in git are permanent — even after deletion:**

A file deleted in a commit still exists in every earlier commit. Anyone who clones the repository and checks out an earlier commit has the file. The only way to truly remove a secret from git history is to rewrite the entire history — a destructive operation that breaks every existing clone of the repository.

Revoked API keys, rotated passwords, and contacted service providers are the minimum response to a committed secret. The incident response cost for one committed `.env` file can be measured in days.

The `.gitignore` line prevents this. Ten seconds now versus a potential incident response later.

---

**CS lens — .gitignore as a boundary declaration:**

`.gitignore` defines the boundary between what is part of the project (source code, configuration) and what is not (generated output, machine state, secrets). This is the same separation-of-concerns principle from lesson 001, applied at the file-system level: every file has a category, and category determines whether it belongs in the repository.

---

**SE lens — the public/private distinction at the repository level:**

Committing something makes it public — visible to everyone with repository access, and permanently recorded in history. `.gitignore` enforces the boundary between public (source code, committed and reviewable) and private (secrets, machine state, generated files).

This mirrors the public/private distinction in object-oriented design: what is exported from a module is its public interface. What is committed is the project's public record.

---

Stage and commit `.gitignore`:

```bash
git add .gitignore
git commit -m "Add .gitignore before first npm install

node_modules excluded because it is reproduced by npm install.
dist excluded because it is generated from source.
.env excluded because it may contain secrets — committed secrets
are permanently exposed even after deletion from a later commit."
```

Run:

```bash
git log --oneline
```

```
0c4e321 Add .gitignore before first npm install
a1d9c7e Add README and requirements before first application code
```

Read bottom to top: requirements before .gitignore, .gitignore before any `npm install`. The history already tells a coherent story.

---

### Configure git identity and read the log

Before examining the log in full, set your identity. git records the author of every commit:

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

`git config` reads and writes git configuration. `--global` applies the setting to all repositories on this machine. `user.name` and `user.email` are configuration keys. The quoted values are what gets stored. These are attribution metadata — they appear in every commit's `Author:` line. They are not credentials and do not need to be secret.

Read the full log:

```bash
git log
```

```
commit 0c4e321f4a... (HEAD -> main)
Author: Your Name <your@email.com>
Date:   Thu Jul 10 10:45:22 2026

    Add .gitignore before first npm install

    node_modules excluded because it is reproduced by npm install.
    ...

commit a1d9c7e3f4...
Author: Your Name <your@email.com>
Date:   Thu Jul 10 10:23:14 2026

    Add README and requirements before first application code
    ...
```

Every field:

`commit 0c4e321f4a...` — the full 40-character SHA-1 hash. Unique across all commits everywhere.

`(HEAD -> main)` — HEAD points to the `main` branch label, which points to this commit. After the next commit, both HEAD and the `main` label move forward.

`Author:` — the identity set with `git config`. Every commit records this permanently.

`Date:` — the timestamp of when the commit was created, in your local timezone.

The body — your explanation of why the change was made.

---

View the changes inside a commit:

```bash
git show HEAD
```

`git show` displays a commit's metadata followed by its **diff** — the set of changes. `HEAD` refers to the most recent commit.

```
diff --git a/.gitignore b/.gitignore
new file mode 100644
--- /dev/null
+++ b/.gitignore
@@ -0,0 +1,12 @@
+# npm dependencies — reproduced from package.json by running npm install
+node_modules/
...
```

Lines starting with `+` were added. Lines starting with `-` were removed.

`--- /dev/null` — before this commit, this file did not exist. `/dev/null` is the null device — a special file that represents "nothing."

`+++ b/.gitignore` — after this commit, the file exists as `.gitignore`.

`@@ -0,0 +1,12 @@` — the **hunk header**. `-0,0` means the old file had 0 lines starting at position 0 (it did not exist). `+1,12` means the new file has 12 lines starting at line 1.

`git show HEAD~1` — the `~1` notation means "one commit before HEAD." `HEAD~2` is two back, and so on. This is how you examine specific earlier commits.

---

## Connect the Pieces

Your repository has two commits and a history that tells a clear story before any application code exists.

The order — version control before code — is not tradition. It is engineering.

If you had started with code and added git later, your first commit would be a massive dump of everything written over hours or days, with a message like "initial commit." The history would not show which architectural decision came first, which requirement drove which file, or when the three-layer structure was decided.

Your current history shows that exactly: requirements before `.gitignore`, and both before any `npm install`. Every future commit extends this record.

**Connection to lesson 001:**

Requirement 7: "The codebase is navigable by a developer who has never seen it within 30 minutes." A well-maintained git log is part of navigability — a new developer can read the history and understand the project's evolution without reading every file. The history you are building here is evidence that this requirement is being satisfied.

**Connection to lesson 006:**

Before lesson 006 runs `npm install` for the first time, `node_modules/` will already be in `.gitignore`. The protection is in place before the risk arrives.

**Connection to lesson 022:**

When you examine why the registry pattern was chosen, you will read the commit that introduced it and see the reasoning in the message — not inferred from the code, but stated explicitly in the permanent record you began building here.

---

## What Breaks Without This

**If version control is initialised after code exists:**

The first commit is "initial commit" with 30 files changed and 3,000 insertions. There is no record of why the project is structured the way it is. The architectural decisions made while writing those files are not recorded anywhere.

Six weeks later, you change the lab registration mechanism. The history does not show why the original mechanism was chosen. You do not know if the change violates a constraint you set up but did not record. You make the change. It introduces a bug. You cannot find the original rationale to understand what you broke.

**If `.gitignore` is missing:**

```bash
npm install react react-dom
git add .
git commit -m "Install React"
```

`git add .` stages everything in the directory — including `node_modules`. The commit contains 120,000+ files. The repository balloons to hundreds of megabytes. Every clone takes minutes. Every `git status` takes seconds because git must check 120,000 files.

Removing `node_modules` from git history requires rewriting it — a destructive operation that invalidates every existing clone of the repository. Easier to avoid than to fix.

**If a secret is committed:**

```bash
echo "OPENAI_KEY=sk-live-a8f9b2c3d4e5..." > .env
git add .
git commit -m "Add environment config"
```

The key is now in the history permanently. Adding `.env` to `.gitignore` and deleting the file's contents in the next commit does not remove the key from the original commit. Anyone who checks out that commit has the key. The key must be revoked and replaced. Every deployment using it must be updated.

The `.gitignore` created in this lesson — before the first `npm install` — prevents all three failures.

---

## Definition of Done

- [ ] `git log --oneline` shows exactly two commits, in this order: `.gitignore` on top, README and requirements below
- [ ] The first commit message explains *why* the README and requirements were committed together, not just that they were added
- [ ] The second commit message explains *why* each category in `.gitignore` is excluded
- [ ] `git status` shows "nothing to commit, working tree clean"
- [ ] You can run `git show HEAD` and read every part of the output without looking anything up
- [ ] You can explain in one sentence: what HEAD is, what a branch is, what a commit hash is
- [ ] You can explain what happens to a secret committed to git and then deleted in a later commit
- [ ] `git config --global user.name` and `user.email` are set
- [ ] Return to lessons 001 and 002 — both include a git commit in their definition of done. Make those commits now in this repository if you have not already.

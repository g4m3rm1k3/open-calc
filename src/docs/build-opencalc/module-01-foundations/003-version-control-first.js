export const lesson = {
  id:       'build-opencalc-003',
  title:    'Version Control First',
  subtitle: 'git before a single line of application code, and why the order is not arbitrary',

  // ── Section 1: What you will build ──────────────────────────────────────

  build: `
You will initialise a git repository, write a README, add a .gitignore, and
make two commits — each with a message that explains why the change was made,
not what files changed. By the end of this lesson, running \`git log\` will
show a history of two decisions about the project, recorded permanently.

You will also commit the \`requirements.js\` file from lesson 001 and the
\`README.md\` you write here. The history will record that requirements were
written before any application code — a fact that will be visible for as long
as this repository exists.
`,

  // ── Section 2: What you need to know first ──────────────────────────────

  prerequisites: `
Lesson 001 — What Is Software Engineering? You will be committing
requirements.js from that lesson. If you have not written it yet, write it
before proceeding.

Lesson 002 — Your Environment. git must be installed. Verify with
\`git --version\` before continuing. The terminal commands in this lesson
assume you can run git from the terminal.
`,

  // ── Section 3: The lesson ───────────────────────────────────────────────

  sections: [
    {
      heading: 'What version control is and what it is not',
      body: `
Version control is a system that records changes to a set of files over time
so that any specific version can be recalled later. git is the most widely
used version control system in the world — it is the foundation that GitHub,
GitLab, and Bitbucket are built on.

Version control is not a save mechanism. Your operating system saves files.
git records a history of decisions.

The difference is not subtle. When you save a file, the previous version is
gone. When you commit a file to git, the previous version is still there.
You can recover it. You can read it. You can compare it to the current version
and see exactly what changed and when.

This is what the history looks like after a week of work:

\`\`\`
a3f9b21 Add offline caching via service worker
         — needed to satisfy the offline requirement from lesson 001
2e8c450 Implement lab registry with lazy loading
         — satisfies "a lab can be added without modifying navigation code"
7d1a093 Add React Router with three initial routes
         — first working navigation between shell and labs
5b2f817 Scaffold React project with Vite
         — first runnable build; localhost:5173 shows blank page
0c4e321 Add .gitignore for node_modules and build output
         — node_modules is reproducible from package.json; dist is generated
f8a1b05 Add README with project purpose and architecture overview
a1d9c7e Add project requirements before first application code
         — specifies what "done" means before any code is written
\`\`\`

Read this history from bottom to top and you have a complete account of the
project: what was decided first, what followed, what each change was for.
This history is not decoration — it is how you recover from a wrong decision,
how a new developer understands the project, and how you understand your own
decisions six months later.

CS lens — git as an append-only linked list of snapshots:

A git commit is a data structure with three components:
- A tree object: the state of every tracked file at this moment
- A pointer to the parent commit: the commit immediately before this one
- Metadata: author, email, timestamp, message

Commits form a linked list. Each commit points to the one before it.
The first commit has no parent. You traverse the list by following pointers
backward from the newest commit to the first.

Linked lists are append-only: you add to the end, never modify the middle.
The same is true of git history. You cannot change a commit once it exists.
You can add a new commit that reverses a change, but the original commit
remains in the history. This immutability is what makes git history reliable.

The hash that identifies each commit (like \`a3f9b21\`) is generated from the
commit's content: the parent hash, the tree, the metadata, and the message.
If any of those change, the hash changes. This means you can verify that a
commit has not been tampered with by checking its hash. No two commits
anywhere in the world should have the same hash.

SE lens — version control as professional practice:

Most solo developers treat version control as optional. Professional teams
do not. In a professional environment, code that is not in version control
is code that does not exist — because it cannot be reviewed, deployed,
rolled back, or attributed.

For a self-taught developer working alone, the professional discipline matters
for a different reason: your collaborator is your future self. The commit
history is the conversation between the person who wrote the code and the
person who will read it six months from now, trying to understand why a
decision was made. Without that history, the second person (who is you)
has to reverse-engineer the intent from the code alone.

Code communicates what. Commit messages communicate why. Both are necessary.
`,
    },
    {
      heading: 'Initialise the repository',
      body: `
Navigate to your project folder in the terminal. If you created a folder in
lesson 001 for \`requirements.js\`, navigate there. If not, create one now:

\`\`\`bash
mkdir my-platform
cd my-platform
\`\`\`

\`mkdir\` stands for "make directory." It creates a new folder with the name
you provide, inside your current working directory. After this command, a
folder named \`my-platform\` exists on disk but is empty.

\`cd my-platform\` changes your working directory into the new folder. Every
terminal command you run after this operates on files inside \`my-platform\`.

Now initialise git:

\`\`\`bash
git init
\`\`\`

Expected output:

\`\`\`
Initialized empty Git repository in /Users/yourname/my-platform/.git/
\`\`\`

\`git init\` creates a hidden directory called \`.git\` inside the current folder.
The dot at the start of \`.git\` makes it hidden — \`ls\` will not show it.
\`ls -a\` will (the \`-a\` flag means "show all, including hidden files").

The \`.git\` directory is the repository. It contains the entire history,
configuration, and internal state of git for this project. You do not edit
anything inside \`.git\` directly — git manages it. If you delete \`.git\`,
you delete the entire history.

Verify the state:

\`\`\`bash
git status
\`\`\`

Expected output:

\`\`\`
On branch main

No commits yet

nothing to commit (create/copy files and use "git add" to track)
\`\`\`

Three pieces of information:

"On branch main" — you are on the default branch named \`main\`. A branch
is a label that points to a specific commit. The label moves forward
automatically as you add commits. \`main\` is the primary line of development.
Older repositories use \`master\` for the same concept — they are the same
idea, just different names. Branches allow parallel lines of development
(feature branches, bug-fix branches), but that is covered in a later lesson.

"No commits yet" — the repository is empty. There is no history.

"nothing to commit" — there are no files in the project folder yet, so there
is nothing to add to a commit.

CS lens — the working tree and the repository:

git distinguishes between two things that share the same folder:

The working tree: the files you can see and edit. These are your actual
project files — \`requirements.js\`, \`README.md\`, anything you create.

The repository: the \`.git\` directory, which stores the history. This is
separate from the working tree even though it sits inside the project folder.

Changes in the working tree are not automatically recorded in the repository.
You must explicitly tell git which changes to record (with \`git add\`) and
when to record them (with \`git commit\`). This intentional staging step is
what allows you to make many changes and then commit only the ones that
belong together in a single logical unit.
`,
    },
    {
      heading: 'The three states of a file',
      body: `
Before making your first commit, you need to understand the three states a
file can be in within a git repository. Most confusion about git comes from
not knowing which state a file is in.

State 1: Untracked

A file that exists in the working tree but that git has never been told to
track. git sees it exists but does not record changes to it.

\`\`\`bash
echo "test" > example.txt
git status
\`\`\`

\`echo "test"\` prints the string \`test\` to standard output. \`> example.txt\`
redirects that output into a file named \`example.txt\` instead of the terminal.
If the file does not exist, it is created. If it does, it is overwritten.

\`\`\`
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        example.txt

nothing added to commit but untracked files present
\`\`\`

\`example.txt\` is untracked. git sees it but will not include it in any commit
until you explicitly tell it to.

State 2: Staged (also called "added to the index")

A file whose current state has been queued for the next commit, via \`git add\`.
Staging is an intermediate step between modifying a file and permanently
recording that modification.

\`\`\`bash
git add example.txt
git status
\`\`\`

\`\`\`
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   example.txt
\`\`\`

\`example.txt\` is now staged. It will be included in the next commit.
Staging is not committing — the change is not yet permanent. You could
still un-stage it with \`git restore --staged example.txt\`, which removes
it from the staging area without deleting the file.

State 3: Committed

A file whose staged state has been permanently recorded in the repository.
Committed changes cannot be lost. They exist in the history.

\`\`\`bash
git commit -m "Add example file"
git status
\`\`\`

\`\`\`
On branch main
nothing to commit, working tree clean
\`\`\`

"Working tree clean" means every tracked file in the working tree matches
its committed state. There are no staged changes and no untracked changes.

The three states exist for a reason:

Not every change made since the last commit belongs in the next commit.
You might be partway through feature A and have also fixed a quick bug in
feature B. You want to commit the bug fix without committing the incomplete
feature A. Staging lets you choose exactly which changes go into each commit.

This is the discipline of making commits that represent a single logical unit
of work. A commit that mixes two unrelated changes makes the history harder
to read and makes it harder to revert one change without reverting the other.

CS lens — the staging area as a buffer:

The staging area (also called the index) is a buffer between the working
tree and the repository. It holds a snapshot of what the next commit will
look like. You build this snapshot incrementally with \`git add\`, then
write it permanently with \`git commit\`.

This two-step process mirrors the principle from lesson 001: make decisions
consciously. \`git add\` is the decision about what belongs in this commit.
\`git commit\` is the permanent record of that decision.

SE lens — small commits make change cheap:

The architectural constraint from lesson 001 states that decisions must be
cheap to change. Small, focused commits support this: if you need to revert
a change, you can revert exactly one commit without affecting anything else.

A commit that contains 400 changed files across 12 features cannot be
partially reverted. If one of those 12 features caused a bug, undoing it
means undoing all 12. This is the commit-level equivalent of entanglement:
unrelated changes mixed together increase the cost of any individual change.

Delete the test file before moving on:

\`\`\`bash
rm example.txt
\`\`\`

\`rm\` stands for "remove." It permanently deletes the file. Unlike moving
to the trash, \`rm\` does not create a recoverable copy. Use it deliberately.
\`rm -r directory-name\` removes a directory and all its contents — use with
extreme care.
`,
    },
    {
      heading: 'Write a README and make the first commit',
      body: `
A README is the first file every repository should have. It answers the
question any reader will ask when they open the project: what is this?

Create \`README.md\` in VS Code or in the terminal. A file ending in \`.md\`
is a Markdown file. Markdown is a lightweight syntax for formatting text:
\`# Title\` becomes a large heading, \`**bold**\` renders bold, \`- item\` becomes
a bullet. GitHub, GitLab, and VS Code's preview all render it automatically.

\`\`\`markdown
# my-platform

An interactive learning platform for mathematics and engineering.

## What this is

A single-page React application. Each lab is an independent, lazily-loaded
React application. The shell manages navigation. Labs manage their own state.
Content is separate from both.

## Requirements

Run \`node requirements.js\` to see the full specification.

## Architecture

Three layers, each with exactly one responsibility:

- **Shell**: navigation, routing, and lab registration. Does not import from labs.
- **Labs**: independent learning environments. Each loads on demand.
- **Content**: lesson text, code examples, quizzes. No dependency on labs.

## Status

No application code exists yet. The requirements have been written.
Version control has been initialised. The project is ready to receive code.
\`\`\`

Save the file as \`README.md\` in your project folder.

Now check what git sees:

\`\`\`bash
git status
\`\`\`

\`\`\`
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        README.md
        requirements.js

nothing added to commit but untracked files present
\`\`\`

Both files are untracked. Add them to the staging area:

\`\`\`bash
git add README.md requirements.js
\`\`\`

\`git add\` accepts multiple file names separated by spaces. You could also
write \`git add .\` to add every untracked and modified file in the current
directory and all subdirectories. Do not use \`git add .\` as a habit —
it is easy to accidentally stage files you did not intend to. Name the files
explicitly until you have a .gitignore that excludes everything you do not
want tracked.

\`\`\`bash
git status
\`\`\`

\`\`\`
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   README.md
        new file:   requirements.js
\`\`\`

Both files are staged. Make the commit:

\`\`\`bash
git commit -m "Add README and requirements before first application code

The README establishes the project purpose and three-layer architecture.
The requirements.js file specifies what done means: functional requirements,
non-functional requirements, and architectural constraints.

Committing these first ensures the project intent is recorded before any
code is written. The architectural constraints here will govern every decision
in the series."
\`\`\`

\`git commit\` records the staged changes as a permanent commit.
\`-m\` means "message follows on this line." The text in quotes is the message.

For multi-line messages: the first line (before the blank line) is the
summary — kept under 72 characters so it displays cleanly in tools that
show one-line histories. The blank line separates the summary from the body.
The body explains the why: what problem this change addresses, what decision
it represents, what it makes possible.

The output:

\`\`\`
[main (root-commit) a1d9c7e] Add README and requirements before first application code
 2 files changed, 47 insertions(+)
 create mode 100644 README.md
 create mode 100644 requirements.js
\`\`\`

\`root-commit\` means this is the first commit — there is no parent.
\`a1d9c7e\` is the abbreviated commit hash — a unique identifier for this
specific snapshot. Every commit has one. Yours will be different.
\`2 files changed, 47 insertions(+)\` — the diff summary: two files added,
47 lines created.

\`\`\`bash
git log
\`\`\`

\`\`\`
commit a1d9c7e3f4... (HEAD -> main)
Author: Your Name <your@email.com>
Date:   Thu Jul 10 10:23:14 2026

    Add README and requirements before first application code

    The README establishes the project purpose and three-layer architecture.
    ...
\`\`\`

\`HEAD\` is a pointer to the commit you are currently on. It moves forward
each time you commit. \`HEAD -> main\` means HEAD points to the \`main\` branch,
which points to this commit.
`,
    },
    {
      heading: 'Write commit messages that communicate',
      body: `
The commit you just wrote has a multi-line message with a body. Most tutorials
show one-line commit messages — "add README", "fix bug", "update files".
Those messages are documentation failures.

git records what changed automatically: the diff. The message is the only
place to record why. A message that restates the diff adds nothing.

\`\`\`
BAD:  "Add README.md"
      git already shows that README.md was added. The message adds nothing.

GOOD: "Add README with project purpose and architecture overview"
      One line that says what the README contains, not that it was added.

BAD:  "Fix bug"
      What bug? In what component? What was wrong? What did you change?

GOOD: "Restore navigation state after browser back button"
      Body: "The router was resetting lab state on popstate events because
      the component unmounted and remounted. Moved state to a ref that
      persists across remounts."
      Six months from now you know exactly what happened and how it was fixed.
\`\`\`

The test for a good commit message: could you understand the decision without
reading the diff? If yes, the message carries the information. If no, the
message is a label, not a record.

The format:

\`\`\`
First line: imperative mood summary, under 72 characters
            "Add", "Fix", "Implement", "Remove", "Update"

Blank line

Body: explains why this change was made. What problem was it solving?
      What would have happened without it? What alternatives were considered?
      What must a reader know to understand this change in six months?
      Wrap at 72 characters per line.
\`\`\`

Imperative mood: "Add" not "Added", "Fix" not "Fixed". This matches the
convention that git uses in its own auto-generated messages ("Merge branch
'feature'", "Revert 'broke something'"). The first line reads as an
instruction: this commit does this thing.

Practice: view the log in two formats:

\`\`\`bash
git log
\`\`\`

\`git log\` shows the full history: hash, author, date, and full message.
Each commit is separated by a blank line.

\`\`\`bash
git log --oneline
\`\`\`

\`--oneline\` changes the output format. Each commit becomes one line: the
short hash and the summary line. The body is not shown. This is why the
summary line must be clear on its own — it is what you read when scanning
history.
`,
    },
    {
      heading: '.gitignore — what git must never track',
      body: `
Some files should never be in a repository. \`.gitignore\` is a file that
tells git to ignore specific files and directories.

Create it now, before the files it will ignore are created:

\`\`\`
# .gitignore

# Dependencies installed by npm.
# node_modules can contain 200,000 plus files and is fully reproducible
# from package.json by running npm install.
node_modules/

# Build output produced by npm run build.
# This is generated from source; committing it adds noise to the history.
dist/
build/

# macOS metadata files created automatically in every directory.
# These are machine-specific and irrelevant to the project.
.DS_Store

# Environment variables — may contain secrets like API keys.
# A secret committed to a repository is a permanent exposure, even if deleted later.
.env
.env.local
.env.production
\`\`\`

Create this file in your project folder as \`.gitignore\` (the dot is part
of the name, not a file extension separator).

Each line in \`.gitignore\` is a pattern that git will ignore:

\`node_modules/\` — the trailing slash means "this is a directory." git ignores
the entire directory and everything inside it. Without the slash, \`node_modules\`
would match both a file named \`node_modules\` and a directory.

\`.DS_Store\` — a file macOS creates automatically in every folder to store
the folder's view settings (icon size, column widths). It is machine-specific —
your .DS_Store is different from another developer's. Committing it adds noise
to diffs and creates false conflicts with other developers.

\`.env\` — environment variables are key-value pairs that configure the
application for a specific environment: API keys, database connection strings,
secret tokens. They must never be committed.

Why .env must never be committed — the permanence of git history:

A secret committed to a repository is exposed for the lifetime of the
repository, even if the file is deleted in a later commit. The deletion
creates a new commit that does not contain the file — but the original
commit still exists and still contains the secret. Anyone who clones the
repository and checks out the original commit has the secret.

The only way to truly remove a secret from a git repository is to rewrite
the entire history — a destructive operation that breaks everyone who has
cloned the repository. It is expensive, disruptive, and sometimes impossible
if the repository is on a public hosting service.

\`\`\`bash
git status
\`\`\`

\`\`\`
On branch main
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .gitignore

nothing added to commit but untracked files present
\`\`\`

The \`.gitignore\` file itself is tracked — you commit it. Only the files
listed inside it are ignored. This means every developer who clones the project
gets the same .gitignore and the same exclusions.

Add and commit it:

\`\`\`bash
git add .gitignore
git commit -m "Add .gitignore to exclude generated and sensitive files

node_modules is excluded because it is fully reproducible from package.json
by running npm install. dist is excluded because it is generated from source.
.env files are excluded because they may contain secrets — committed secrets
are permanently exposed even after deletion."
\`\`\`

Run \`git log --oneline\` and verify you have two commits:

\`\`\`
0c4e321 Add .gitignore to exclude generated and sensitive files
a1d9c7e Add README and requirements before first application code
\`\`\`

Read bottom-to-top: first came the requirements and README, then the
.gitignore. This is your project's history — already telling a clear story
before any application code exists.

CS lens — .gitignore as a boundary definition:

The .gitignore file defines the boundary between what is part of the project
and what is not. This is the same principle from lesson 001 at the file system
level: what belongs in the repository (source code, configuration, documentation)
and what does not (generated output, secrets, machine-specific files).

SE lens — the public/private distinction at the file system level:

Committing to a repository makes something public — visible to everyone with
access to the repository, and permanently recorded. The .gitignore enforces
the boundary between what is public (source code, committed for others to
read and review) and what is private (secrets, machine state, generated files).

This is the file-system application of the public/private distinction from
object-oriented design: what is exported from a module is its public interface.
What is committed to the repository is the project's public record.
What is ignored is internal to each machine.
`,
    },
    {
      heading: 'Verify and read git log',
      body: `
The final step: read your repository's history and understand every piece
of the output.

\`\`\`bash
git log
\`\`\`

\`\`\`
commit 0c4e321f4a... (HEAD -> main)
Author: Your Name <your@email.com>
Date:   Thu Jul 10 10:45:22 2026

    Add .gitignore to exclude generated and sensitive files

    node_modules is excluded because it is fully reproducible from package.json
    by running npm install. dist is excluded because it is generated from source.
    .env files are excluded because they may contain secrets.

commit a1d9c7e3f4...
Author: Your Name <your@email.com>
Date:   Thu Jul 10 10:23:14 2026

    Add README and requirements before first application code

    The README establishes the project purpose and three-layer architecture.
    ...
\`\`\`

Every field:

\`commit 0c4e321f4a...\` — the full commit hash. SHA-1, 40 characters, unique.
The abbreviated version (first 7 characters) is what \`git log --oneline\` shows.

\`(HEAD -> main)\` — HEAD points to the main branch, which points to this
commit. HEAD is always "where you are" in the repository. After the next
commit, HEAD will move to point at it.

\`Author: Your Name <email>\` — the name and email git uses to identify you.
Set globally when you first configure git:

\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
\`\`\`

\`git config\` reads and writes git configuration. \`--global\` means apply
this setting to all repositories on your machine, not just the current one.
\`user.name\` and \`user.email\` are the configuration keys. These are not
credentials — they are attribution metadata that appears in every commit.

\`Date:\` — the timestamp of when the commit was made, in your local timezone.

See the actual changes in a commit:

\`\`\`bash
git show HEAD
\`\`\`

\`git show\` displays a commit's metadata followed by its diff. \`HEAD\` refers
to the most recent commit. The diff shows every file that was added, modified,
or deleted:

\`\`\`
diff --git a/.gitignore b/.gitignore
new file mode 100644
--- /dev/null
+++ b/.gitignore
@@ -0,0 +1,15 @@
+# Dependencies installed by npm.
+node_modules/
...
\`\`\`

Lines starting with \`+\` were added. Lines starting with \`-\` were removed.
\`--- /dev/null\` means: before this commit, this file did not exist.
\`+++ b/.gitignore\` means: after this commit, it exists as \`.gitignore\`.

\`@@ -0,0 +1,15 @@\` is the hunk header. \`-0,0\` means the old file had
0 lines starting at line 0 (it did not exist). \`+1,15\` means the new file
has 15 lines starting at line 1.

Run \`git show HEAD~1\` to see the previous commit. \`HEAD~1\` means "one
commit before HEAD." \`HEAD~2\` is two commits before, and so on.
`,
    },
  ],

  // ── Section 4: Connect the pieces ───────────────────────────────────────

  connect: `
Your repository has two commits and a history that tells a clear story
before any application code exists.

This order — version control before code — is not tradition. It is engineering.

If you had started with code and added git later, your first commit would be
an enormous dump of everything: every file written over hours or days, in one
commit, with a message like "initial commit." The history would not tell you
which architectural decision came first, which requirement drove which file,
or when the three-layer structure was decided.

Your current history tells you exactly: requirements first, .gitignore before
any packages are installed. Every future commit extends this record.

Connection to the requirements from lesson 001:

"The codebase is navigable by a developer who has never seen it within 30
minutes." A good git log is part of navigability — a new developer can read
the history and understand the project's evolution without reading every
file. The history you are building here is evidence that this non-functional
requirement is being satisfied.

In lesson 006, you will add \`package.json\` and install your first package.
Before that commit is made, \`node_modules\` will already be in \`.gitignore\`.
The .gitignore from today protects that future commit from accidentally
including 200,000 package files.

In lesson 022, when you look at why the registry pattern was chosen, you
will be able to read the commit that introduced it and see the reasoning
in the message — not inferred from the code, but stated explicitly in the
history you began building today.
`,

  // ── Section 5: What breaks without this ─────────────────────────────────

  breaks: `
If version control is initialised after code already exists:

The first commit is "initial commit" with 50 files changed, 4,200
insertions. There is no history of why the project is structured the way
it is. The architectural decisions made during the writing of those 50 files
are not recorded anywhere.

Six weeks later, you change the lab registration mechanism. The current
history does not explain why the original mechanism was chosen. You cannot
know if the change violates a constraint you set up but did not record. You
make the change, it introduces a bug, and you cannot find the original
rationale to understand what the change broke.

If .gitignore is missing:

\`\`\`bash
npm install vitest
git add .
git commit -m "Add vitest"
\`\`\`

\`git add .\` stages everything in the directory, including \`node_modules\`.
The commit contains 120,000 files. The repository is now hundreds of
megabytes. Cloning it takes minutes. Every subsequent commit is bloated
because git has to compare against those 120,000 files.

Removing \`node_modules\` from the history requires rewriting it — a
destructive operation that breaks everyone who has cloned the repository.
Easier to avoid than to fix.

If a secret is committed:

\`\`\`bash
echo "API_KEY=sk-live-a8f9b2..." > .env
git add .env
git commit -m "Add environment configuration"
\`\`\`

The API key is now in the history permanently. Even if you add \`.env\` to
\`.gitignore\` and delete the file's content in the next commit, the original
commit still contains the key. Anyone who clones the repository and checks
out that commit has the key. The key must be revoked. The service that issued
it must issue a new one. Every deployment using it must be updated.

The .gitignore written before the first \`npm install\` prevents all of this.
The ten seconds to write \`node_modules/\` in a file before installing anything
saves hours of remediation.
`,

  // ── Section 6: Definition of done ───────────────────────────────────────

  done: [
    '[ ] git log --oneline shows exactly two commits: .gitignore on top, README and requirements below',
    '[ ] The first commit message explains why the README and requirements were committed together before code',
    '[ ] The second commit message explains why each category of files is in .gitignore',
    '[ ] git status shows "nothing to commit, working tree clean"',
    '[ ] You can run git show HEAD and read the diff output without looking anything up',
    '[ ] You can explain HEAD, a branch, and a commit hash in one sentence each',
    '[ ] You can state what happens to a secret that is committed and then deleted in a later commit',
    '[ ] You have set git user.name and user.email with git config --global',
    '[ ] Return to the definitions of done in lessons 001 and 002 — both include a git commit. Those commits belong in this repository. If you have not made them, make them now as separate commits with the messages specified there.',
  ],
}

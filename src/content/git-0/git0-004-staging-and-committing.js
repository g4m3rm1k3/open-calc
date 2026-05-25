const lesson = {
  id: "git-0-004",
  slug: "staging-and-committing",
  chapter: "git-0",
  order: 4,
  title: "Staging & Committing",
  subtitle: "The two-step that creates history",
  tags: ["git", "add", "commit", "staging", "index"],
  aliases: ["git add", "git commit", "stage changes", "make a commit"],

  hook: `Git has a step most version control systems skip: the staging area. You don't commit all your changes at once — you choose exactly what goes into each commit. This two-step is the most important habit in all of Git.`,

  mentalModel: [
    "`git add` moves changes from your working directory into the staging area — a precise preview of the next commit.",
    "`git commit` permanently saves everything in the staging area as a new snapshot with a message explaining why.",
    "The staging area exists so you can make 5 changes but commit them as 3 logical units, each with its own clear message.",
  ],

  intuition: {
    prose: [
      "**`git add`: choosing what to include.** Running `git add filename` moves that file's current state into the staging area. You can add individual files (`git add README.md`), a directory (`git add src/`), or everything changed (`git add .` — but be careful with this). Nothing is committed yet — you're building a draft of the next snapshot.",
      "**`git commit`: making it permanent.** Once you've staged the right things, `git commit -m \"Your message here\"` creates a permanent snapshot. The message should explain *why* this change exists, not *what* changed (the diff already shows the what). Good: `\"Fix login bug when email has uppercase letters\"`. Bad: `\"fixed stuff\"`.",
      "**Why the two-step?** Suppose you fixed a bug AND added a new feature in the same editing session. If you commit everything together, history is muddy. With staging, you add just the bug-fix files, commit them as `\"Fix login redirect\"`, then add the feature files and commit them as `\"Add dashboard export\"`. Clean, logical, searchable history.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Shortcuts",
        body: "`git commit -am \"message\"` stages all *tracked* modified files and commits in one step (skips `git add` for tracked files — does NOT add untracked files).\n`git add -p` lets you stage partial file changes — individual hunks within a file — for surgical commits.",
      },
    ],
    visualizations: [
      {
        id: "GitLab",
        props: {
          initialFiles: {
            "app.js": "// Main application\nconst PORT = 3000;\nconsole.log('Server starting on port ' + PORT);",
            "README.md": "# My App\nA simple Node.js application.",
          },
          mission: "Practice the two-step: edit a file, then click 'Take Snapshot'. Try editing both files but only snapshotting one at a time to see how selective staging works.",
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**What a commit object contains.** A commit is an immutable object in Git's object store containing: a pointer to a **tree** (the snapshot of all files), a pointer to the **parent** commit (or two parents for merges), the **author** (name, email, timestamp), the **committer** (may differ if someone else applied the patch), and the **commit message**. The SHA-1 hash of all this content is the commit ID.",
      "**The commit graph.** Each commit points to its parent, forming a linked list backwards through time. The branch label (`main`, `feature`) is just a pointer to the most recent commit. When you commit, Git creates the new commit object pointing to the previous HEAD, then updates the branch pointer.",
      "**`git add` variants.** `git add .` stages all changes in the current directory and below. `git add -A` stages all changes in the entire repo (including deletions). `git add -u` stages modifications and deletions but NOT new untracked files. `git add -p` (patch mode) lets you review and selectively stage individual change hunks within files.",
      "**Amending the last commit.** `git commit --amend` replaces the most recent commit with a new one (new snapshot + optionally new message). Use it to fix a typo in the message or to add a file you forgot to stage. WARNING: never amend commits that have been pushed to a shared remote — it rewrites history.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Empty commits are rejected",
        body: "If nothing is staged, `git commit` will say 'nothing to commit, working tree clean' and abort. You must have at least one staged change. Use `git commit --allow-empty` only for special cases like marking deployment points.",
      },
    ],
  },

  examples: [
    {
      title: "A clean workflow",
      body: "`git status` — check what's changed\n`git add src/auth.js` — stage just the auth fix\n`git commit -m \"Fix: require email verification before login\"`\n`git add src/dashboard.js src/dashboard.css` — stage the feature files\n`git commit -m \"Feature: add CSV export to dashboard\"`\nTwo commits. Two clear units of work. Readable history.",
    },
    {
      title: "Viewing what's staged before committing",
      body: "`git diff --staged` — shows the exact diff of what's in the staging area (what will be in the next commit). Always worth running before `git commit` on important changes.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-004-q1",
        type: "choice",
        text: "You've edited three files. You only want two of them in the next commit. What do you do?",
        options: [
          "Use `git commit --partial` to select files",
          "`git add` only the two files, then `git commit`",
          "Delete the third file before committing",
          "`git commit -m` and specify the filenames in the message",
        ],
        answer: "`git add` only the two files, then `git commit`",
      },
      {
        id: "git0-004-q2",
        type: "choice",
        text: "What does a Git commit object directly contain?",
        options: [
          "The full text of every changed file",
          "A list of line-by-line diffs from the previous commit",
          "A pointer to a tree, parent commit hash, author, and message",
          "A zip archive of the project at that point",
        ],
        answer: "A pointer to a tree, parent commit hash, author, and message",
      },
      {
        id: "git0-004-q3",
        type: "choice",
        text: "`git commit -am \"msg\"` is a shortcut that:",
        options: [
          "Stages and commits all files including new untracked files",
          "Stages and commits only already-tracked modified files",
          "Commits without requiring a message",
          "Amends the previous commit",
        ],
        answer: "Stages and commits only already-tracked modified files",
      },
    ],
  },
};

export default lesson;

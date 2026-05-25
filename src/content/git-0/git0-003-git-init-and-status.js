const lesson = {
  id: "git-0-003",
  slug: "git-init-and-status",
  chapter: "git-0",
  order: 3,
  title: "git init & git status",
  subtitle: "Starting a repository and reading its state",
  tags: ["git", "init", "status", "repository"],
  aliases: ["git init", "git status", "new repo"],

  hook: `Before you can commit anything, you need a repository. Before you commit, you want to know what Git can see. Two commands — `git init` and `git status` — are the foundation of every Git workflow.`,

  mentalModel: [
    "`git init` turns any folder into a Git repository by creating a `.git` subdirectory — your folder's files are untouched.",
    "`git status` is the single most useful Git command — it tells you exactly what state every file is in.",
    "Files in a Git repo can be untracked, modified, staged, or committed — `git status` shows which state each file is in.",
  ],

  intuition: {
    prose: [
      "**`git init` creates a repository.** Run it inside any project folder: `git init`. Git creates a hidden `.git/` directory and prints 'Initialized empty Git repository'. That's it — your project folder becomes a Git repo. None of your existing files are changed or tracked yet.",
      "**`git status` reads the current state.** Before doing anything, check the status: `git status`. It shows: which branch you're on, which files Git doesn't know about (untracked), which tracked files have changed (modified/deleted), and which changes are staged for the next commit. Read this before every commit.",
      "**File states.** Every file in your repo is in one of these states: **Untracked** — Git sees the file but has never been told to track it. **Modified** — Git is tracking this file and it has changed since the last commit. **Staged** — the change has been added to the index, ready to be committed. **Committed** — the current version is safely stored in the repository. `git status` shows all four.",
    ],
    callouts: [
      {
        type: "tip",
        title: "git status -s",
        body: "`git status -s` gives a compact summary. Two-character codes: `??` = untracked, `M ` = modified and staged, ` M` = modified but not staged, `A ` = new file staged, `D ` = deleted. The left character is the staging area; the right is the working directory.",
      },
    ],
    visualizations: [
      {
        id: "GitLab",
        props: {
          initialFiles: {
            "README.md": "# My Project\n\nA brand new Git repository.",
            "index.js": "console.log('Hello, Git!');",
          },
          mission: "Explore the workspace. Edit a file, then take a snapshot. Notice how the Timeline tab shows your commit history. This is what git init + git status + git add + git commit looks like in action.",
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**What's inside `.git/`.** `HEAD` — a text file pointing to the current branch (e.g. `ref: refs/heads/main`). `config` — repo-local configuration. `objects/` — the content-addressable object store (all blobs, trees, commits). `refs/heads/` — branch pointers (each file contains a commit hash). `index` — the staging area (binary format). `logs/` — reflog (history of where HEAD has been).",
      "**Reinitializing an existing repo.** Running `git init` in a folder that already has `.git/` just prints 'Reinitialized existing Git repository' — it doesn't reset your history or delete anything.",
      "**`git status` verbose output.** The full output groups files into three sections: 'Changes to be committed' (staged), 'Changes not staged for commit' (modified tracked files), and 'Untracked files'. If all three sections are empty, the output is 'nothing to commit, working tree clean' — the ideal state before switching branches or pulling.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Tracked vs Untracked",
        body: "**Tracked files** are files Git knows about — they appeared in at least one previous commit or have been staged. **Untracked files** exist on disk but Git has never been told to include them. Until you `git add` a file, Git will never commit it, never track its changes, and never show it as 'modified'.",
      },
    ],
  },

  examples: [
    {
      title: "Starting a new project from scratch",
      body: "`mkdir my-project && cd my-project`\n`git init`\n`echo '# My Project' > README.md`\n`git status` — shows README.md as untracked\n`git add README.md`\n`git status` — shows README.md staged\n`git commit -m \"Initial commit\"`\n`git status` — 'nothing to commit, working tree clean'",
    },
    {
      title: "Reading status output correctly",
      body: "`On branch main` — your current branch\n`Changes to be committed:` — staged, will go into next commit\n`Changes not staged for commit:` — modified, but not yet staged\n`Untracked files:` — Git sees them but ignores them until you `git add`",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-003-q1",
        type: "choice",
        text: "What does `git init` create inside your project folder?",
        options: [
          "A new GitHub repository",
          "A hidden `.git/` directory",
          "A `git.config` file in your home directory",
          "A `commits/` folder with your file history",
        ],
        answer: "A hidden `.git/` directory",
      },
      {
        id: "git0-003-q2",
        type: "choice",
        text: "A file shows under 'Untracked files' in `git status`. What does this mean?",
        options: [
          "The file is corrupted",
          "Git is tracking the file but it hasn't changed",
          "Git has never been told to include this file in commits",
          "The file has been staged and is ready to commit",
        ],
        answer: "Git has never been told to include this file in commits",
      },
      {
        id: "git0-003-q3",
        type: "choice",
        text: "You run `git status` and see 'nothing to commit, working tree clean'. This means:",
        options: [
          "Your repo is empty with no commits",
          "All tracked files match the last commit exactly",
          "You have no untracked files at all",
          "Git is paused and waiting for a command",
        ],
        answer: "All tracked files match the last commit exactly",
      },
    ],
  },
};

export default lesson;

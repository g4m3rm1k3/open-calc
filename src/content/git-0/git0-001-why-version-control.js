const lesson = {
  id: "git-0-001",
  slug: "why-version-control",
  chapter: "git-0",
  order: 1,
  title: "Why Version Control?",
  subtitle: "The problem before the solution",
  tags: ["git", "version-control", "fundamentals"],
  aliases: ["what is git", "why git"],

  hook: `You're 3 hours into coding. Everything worked an hour ago. Now nothing works and you have no idea what you changed. If only you could go back. This is the problem Git was built to solve — permanently.`,

  mentalModel: [
    "Files without version control are constantly being overwritten — there is no history, no undo, no safety net.",
    "Git takes snapshots of your entire project at moments you choose, so every saved state is recoverable forever.",
    "The problem Git solves is not 'sharing code' — it's 'never losing a working state of your project again'.",
  ],

  intuition: {
    prose: [
      "**The folder problem.** When you work in a normal folder, saving a file overwrites the previous version. There's no undo beyond your editor's buffer. One bad save, one accidental delete, one 'let me try this' that breaks everything — and your working code is gone. Developers used to copy folders: `project_v1`, `project_v2_final`, `project_v2_final_ACTUALLY_FINAL`. This is version control without software.",
      "**Git replaces folder-copying with snapshots.** Instead of you manually duplicating folders, Git takes a precise snapshot of every file in your project at moments you choose. Each snapshot is permanent and uniquely identified. You can jump back to any snapshot at any time. Nothing is ever truly deleted.",
      "**The three zones.** Before you understand any command, understand the three places your code lives: the **Working Directory** (the files you're editing right now — unprotected), the **Staging Area** (a preview of what goes into the next snapshot), and the **Repository** (the permanent history of all snapshots). Every Git command moves content between these three zones.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Key Terms",
        body: "**Repository (repo):** The hidden `.git` folder that stores your entire project history.\n**Commit:** A permanent snapshot of your project at a specific moment.\n**Working directory:** The actual files on disk that you edit.\n**Staging area (index):** A holding area where you prepare changes before committing.",
      },
    ],
    visualizations: [
      {
        id: "GitLab",
        props: {
          scenario: "corruptable",
          initialFiles: {
            "app.js": "function greet(name) {\n  return 'Hello, ' + name;\n}\n\nconsole.log(greet('world'));",
          },
          mission: "Edit the file above. When you're happy with your changes, click 'Take Snapshot' to save a safe state. Then hit 'Simulate Accident' — notice what happens when you have no snapshot vs when you do.",
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Git is a distributed version control system (DVCS).** Unlike older centralized systems (SVN, CVS) where history lives on a single server, every Git clone is a complete copy of the entire history. There's no single point of failure. You can work offline. Any clone can restore any other.",
      "**Git was created by Linus Torvalds in 2005** to manage the Linux kernel after the previous VCS (BitKeeper) revoked its free license. Design goals: speed, simplicity of the model, strong support for non-linear development (branches), full distribution, and the ability to handle the Linux kernel scale (thousands of contributors).",
      "**Content-addressable storage.** Git doesn't store file diffs — it stores complete snapshots. Every object (file content, directory, commit) is stored by the SHA-1 hash of its content. If two files have identical content, Git stores them once. This is fundamentally different from storing 'what changed' — it stores 'what exists', making it extremely reliable.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Common Misconception",
        body: "Git is not just a backup tool and not just a collaboration tool. At its core it's a **time machine for your project state**. Backup and collaboration are secondary benefits of that core property.",
      },
    ],
  },

  examples: [
    {
      title: "The manual version before Git",
      body: "`project_jan_10/`, `project_jan_10_working/`, `project_jan_11_BROKEN/`, `project_jan_11_FIXED/` — every developer has a folder graveyard like this. Git replaces all of it with a clean history accessible via `git log`.",
    },
    {
      title: "What git init actually creates",
      body: "Run `git init` in any folder. Git creates a `.git/` subdirectory containing: `objects/` (the snapshot database), `refs/` (branch pointers), `HEAD` (what you have checked out), and `config` (repo settings). The rest of your folder is untouched.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-001-q1",
        type: "choice",
        text: "What does Git store when you make a commit?",
        options: [
          "Only the lines that changed since the last commit",
          "A complete snapshot of every tracked file",
          "A compressed backup of your hard drive",
          "A list of commands needed to recreate the files",
        ],
        answer: "A complete snapshot of every tracked file",
      },
      {
        id: "git0-001-q2",
        type: "choice",
        text: "What are the three zones of Git?",
        options: [
          "Server, local, and cloud",
          "Working directory, staging area, and repository",
          "HEAD, branch, and tag",
          "Blob, tree, and commit",
        ],
        answer: "Working directory, staging area, and repository",
      },
      {
        id: "git0-001-q3",
        type: "choice",
        text: "Git is called 'distributed' because:",
        options: [
          "It runs on multiple operating systems",
          "Every clone contains the full project history",
          "It can push to multiple servers at once",
          "Changes are distributed to all team members automatically",
        ],
        answer: "Every clone contains the full project history",
      },
    ],
  },
};

export default lesson;

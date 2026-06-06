const lesson = {
  id: "git-0-001",
  slug: "the-save-problem",
  chapter: "git-0",
  order: 1,
  title: "What Is Git?",
  subtitle: "The tool every developer uses to track their work",
  tags: ["git", "version-control", "fundamentals"],
  aliases: ["why git", "version control", "what is git"],

  hook: `You spent three hours getting a feature working. You tried one more change, broke everything, and hit Ctrl+Z for ten minutes. Then you closed the editor. The undo history is gone. The only version of your code that exists now is the broken one. Git exists to make sure this never happens to you again.`,

  mentalModel: [
    "Commit when something works — not when it's 'done'. Every commit is a restore point. The question is how much work you're willing to lose.",
    "The panel in this lesson simulates VS Code's Source Control sidebar (Cmd+Shift+G on Mac, Ctrl+Shift+G on Windows). Every button runs a git terminal command behind the scenes.",
    "Git never destroys committed work. If it was in a commit, it still exists — no matter what you do to the files afterward.",
  ],

  intuition: {
    prose: [
      "Here's a scenario every developer lives through. You spend a morning building something that works. Then you try one more change — just a small one — and now nothing compiles. You hit Ctrl+Z over and over. You close the file, reopen it. The undo history only goes back to when you opened the editor. The working version simply doesn't exist anymore.",
      "Before Git, developers solved this by copying folders. You'd end up with `project/`, `project-backup/`, `project-old/`, `project-v2/`, `project-WORKING/`, `project-FINAL/`, `project-FINAL-real/`. Each folder was a manual snapshot of 'a moment when things worked.' It barely holds together for one person. For a team of two, it collapses instantly — two people save different versions of the same file and there's no way to combine them.",
      "Git replaces the folder graveyard with a proper timeline. Every time you reach a state worth preserving, you take a **commit** — a labeled snapshot of every tracked file, timestamped and linked to the previous one. That chain of commits is your project's history. You can jump to any point in it instantly, compare any two points, or restore any file to exactly how it was at any commit. Nothing in the chain can be overwritten or lost.",
      "You work with Git in three places: the **terminal** (raw commands like `git commit`, `git add`, `git log`), a **dedicated GUI** like GitKraken or Fork (visual branch lanes, drag-and-drop staging), or your **editor's built-in integration** — in VS Code that's the Source Control sidebar, which most developers use daily. The panel below simulates that VS Code sidebar. Try it: edit `game-design.txt`, click **Save**, type a message like `Add boss room idea`, and click **✓ Commit**. A dot appears in the git graph — your first permanent checkpoint.",
    ],
    visualizations: [
      {
        id: "GitWorkspace",
        mathBridge:
          "**This panel simulates VS Code's Source Control sidebar** — press Cmd+Shift+G (Mac) or Ctrl+Shift+G (Windows) to open the real one in any project. Every action here runs a git command:\n\n- Click **Save** in the editor → writes the file to disk (git doesn't know yet)\n- Type a message and click **✓ Commit** → `git commit -m 'your message'`\n- The dot that appears in the graph → what you'd see in `git log --oneline`\n\nGitKraken, Fork, and GitHub Desktop show the same history with different UIs — but every button runs one of these same terminal commands.",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          showStaging: false,
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nPlayer starts in a room with three doors.\nEach door leads to a different challenge.\n\nIdeas so far:\n- Puzzle room: move blocks to reveal exit\n- Combat room: turn-based with simple stats\n- Treasure room: risk/reward with traps\n\nTODO: decide on win condition",
          },
        },
      },
      {
        id: "GitTerminal",
        mathBridge:
          "**The terminal below runs real Git commands.** The VS Code panel above is just a GUI wrapper around these same commands:\n\n```\ngit status              # see what files git knows about\ngit add game-design.txt # tell git to track this file\ngit commit -m 'Initial game concept'\ngit log --oneline       # one line per commit\n```\n\nYou don't need to pick one tool — professionals switch between the terminal and the panel constantly depending on what's faster. They're running identical operations.",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nPlayer starts in a room with three doors.\nEach door leads to a different challenge.\n\nIdeas so far:\n- Puzzle room: move blocks to reveal exit\n- Combat room: turn-based with simple stats\n- Treasure room: risk/reward with traps\n\nTODO: decide on win condition",
          },
        },
      },
      {
        id: "GitKrakenView",
        mathBridge:
          "**This is how Git history looks in a visual client like GitKraken, Fork, or Sourcetree.** Once you make commits (in the panel or terminal above), each one appears here as a dot on a timeline.\n\n- Click any commit dot to see exactly which files changed\n- The left sidebar shows all your branches\n- `HEAD` (the blue badge) marks where you currently are\n\nThis graph is the visual form of `git log --oneline --graph`. Make a commit above and watch it appear here instantly — all three views share the same repository.",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nPlayer starts in a room with three doors.\nEach door leads to a different challenge.\n\nIdeas so far:\n- Puzzle room: move blocks to reveal exit\n- Combat room: turn-based with simple stats\n- Treasure room: risk/reward with traps\n\nTODO: decide on win condition",
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**What a save actually does at the OS level.** When you save a file, the kernel overwrites the bytes at the file's inode on disk. No copy of the previous bytes is kept by the filesystem. Your editor's undo buffer lives in process memory — close the application and it disappears. There is no OS-level mechanism to recover a file after a write. The previous content is simply gone.",
      "**The three problems Git solves.** (1) **Loss**: you need to undo work that spans multiple saves and file closes. (2) **History**: you need to know exactly when a bug was introduced and what the code looked like beforehand. (3) **Collaboration**: two people are working on the same files simultaneously. Git handles all three with one mechanism: an append-only graph of immutable snapshots.",
      "**Why immutability matters.** A commit's identity is a SHA-1 hash of its entire content — the files, the message, the timestamp, the parent hash. If you changed anything about a commit, you'd get a different hash, which means a different commit. You can't secretly alter history. This guarantee is what makes commands like `git checkout` and `git bisect` trustworthy: the state you restore is the exact state that was committed.",
    ],
    callouts: [
      {
        type: "tip",
        title: "First commit, then experiment",
        body: "Before trying anything risky — a refactor, a new approach, a library upgrade — commit the working state first. Then experiment freely. If it goes wrong, you have a restore point. This habit alone prevents most of the painful moments developers associate with Git.",
      },
    ],
  },

  examples: [
    {
      title: "The folder graveyard",
      body: "Most developers have lived through this:\n`project/` → `project-backup/` → `project-old/` → `project-v2/` → `project-WORKING/` → `project-FINAL/` → `project-FINAL-real/`\n\nThis is what Git replaces. Instead of manual copies, Git maintains a clean timeline. Every saved state is labeled, searchable, and restorable with a single command.",
    },
    {
      title: "What you get when a project uses Git",
      body: "A developer broke something that was working fine two weeks ago. With Git:\n- View the full history of every file\n- Find the exact commit where the bug appeared\n- Restore any file to its state at any commit\n- Understand *why* a change was made (from the commit message)\n\nNone of this is possible with plain files — the history simply doesn't exist.",
    },
  ],

  quiz: [
    {
      id: "git0-001-q1",
      type: "choice",
      text: "You edit a file, save it, and close your editor. Which is now impossible without Git?",
      options: [
        "Reading the current content",
        "Editing the file again",
        "Recovering the exact text from before you saved",
        "Moving the file to another folder",
      ],
      answer: "Recovering the exact text from before you saved",
      hints: ["Think about what your editor's undo history stores — and where it lives."],
    },
    {
      id: "git0-001-q2",
      type: "choice",
      text: "What is the main problem with the folder-copy approach to versioning (project-v1/, project-v2/, etc.)?",
      options: [
        "It uses too much disk space",
        "It only works for text files",
        "It breaks down when multiple people make different changes to different copies",
        "Computers cannot read folders with numbers in their names",
      ],
      answer: "It breaks down when multiple people make different changes to different copies",
      hints: ["What happens when two people each edit their own copy of project-v3/?"],
    },
    {
      id: "git0-001-q3",
      type: "choice",
      text: "Git's core design guarantee is:",
      options: [
        "Every operation can overwrite previous history",
        "Only source code files can be tracked",
        "Once committed, a snapshot is permanent and always recoverable",
        "Files are automatically synced to a server on every save",
      ],
      answer: "Once committed, a snapshot is permanent and always recoverable",
      hints: ["A commit's identity is a SHA-1 hash of its entire content — what does that mean for changeability?"],
    },
  ],

  definitions: [
    { term: "commit", definition: "A labeled snapshot of every tracked file at a specific moment, timestamped and linked to the previous commit." },
    { term: "repository", definition: "A Git-managed directory that stores your project files together with the full chain of commits (history)." },
    { term: "version control", definition: "A system for recording changes to files over time so any previous state can be inspected or restored." },
    { term: "staging area", definition: "The preparation zone where you collect file changes before packaging them into a commit." },
    { term: "HEAD", definition: "A pointer to the most recent commit on the branch you are currently working on." },
    { term: "SHA-1 hash", definition: "A 40-character fingerprint computed from a commit's full content. Any change to the content produces a completely different hash." },
  ],
};

export default lesson;

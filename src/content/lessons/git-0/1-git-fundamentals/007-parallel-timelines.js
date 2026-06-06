const lesson = {
  id: "git-0-007",
  slug: "parallel-timelines",
  chapter: "git-0",
  order: 7,
  title: "Branches",
  subtitle: "Build something new without breaking what works",
  tags: ["git", "branches", "fundamentals", "git branch", "git checkout"],
  aliases: [
    "git branch",
    "create branch",
    "switch branch",
    "parallel development",
  ],

  hook: `You're halfway through a new combat system when a critical bug report comes in — the game crashes on startup for anyone running Windows. You need to fix it right now. But your half-written combat system is broken. You can't ship that. Without branches, you're stuck. With branches, you create a new one in seconds, fix the bug on \`main\`, ship it, then come back to your feature exactly where you left it.`,

  mentalModel: [
    "Branch before you experiment. `git checkout -b branch-name` takes less than a second and lets you throw the entire branch away if it goes wrong, with zero impact on `main`.",
    "In VS Code, your current branch shows in the bottom-left status bar — click it to switch branches or create a new one. That button runs `git checkout` behind the scenes.",
    "`main` is the branch everyone can rely on. Feature branches are where individual work happens. Merge when it's done and tested.",
  ],

  intuition: {
    prose: [
      "A branch is just a label — a sticky note on the commit chain. When you commit on a branch, the label moves forward to the new commit. Other branches stay where they are. Creating a branch is instant because Git isn't copying any files; it's writing a 40-character string to a tiny file in `.git/refs/heads/`.",
      "In VS Code, the bottom-left corner of the window shows your current branch name (something like `main` or `feature/combat`). Click it to open the branch picker — a dropdown that lists all branches and offers to create or switch. This is running `git checkout -b` or `git checkout` depending on whether you're creating or switching. In GitKraken, branches appear as labeled nodes in the visual graph, and parallel branches become parallel lanes — exactly like the multi-lane graph in this lesson's panel.",
      "The workflow that keeps `main` clean: you start every piece of work on its own branch. Stable code lives on `main`. Experimental code lives on feature branches. When the feature is done and tested, you merge it back. `main` never sees half-finished work.",
      "Try it here. Your dungeon-explorer project has a working foundation. Create a branch called `feature` using the **+** button next to the branch name. Make a change — add an experimental room to `game-design.txt` — and commit it. Now switch back to `main` in the branch dropdown. Your experimental commit is gone from the files — it's only on `feature`. Switch back: it's there. Two separate histories from the same starting point.",
    ],
    visualizations: [
      {
        id: "GitWorkspace",
        mathBridge:
          "**The branch selector in the top-left mirrors VS Code's branch indicator in the bottom-left status bar.** Click it to switch branches or click **+** to create one.\n\nTerminal equivalents:\n- Create a branch and switch → `git checkout -b branch-name` (or `git switch -c branch-name`)\n- Switch to an existing branch → `git checkout main` (or `git switch main`)\n- List all branches → `git branch`\n- Delete a merged branch → `git branch -d branch-name`\n\nIn GitKraken: double-click a commit and select 'Create Branch Here'. Branches appear as parallel lanes in the central graph.",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          showStaging: false,
          showBranching: true,
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nWin condition: reach the exit room.\nLose condition: health drops to zero.\n\nRooms: 10 per level\nLevels: 3",
            "controls.txt":
              "CONTROLS\n\nMove: arrow keys\nInteract: space\nPause: escape",
          },
        },
      },
      {
        id: "GitTerminal",
        mathBridge:
          "**Branch commands are the three you'll use daily.** Create a branch in the VS Code panel tab, then try the same operations here:\n\n- `git branch` — list all branches (asterisk marks current)\n- `git checkout -b feature-name` — create and switch in one step\n- `git switch main` — switch to an existing branch\n- `git branch -d branch-name` — delete a fully merged branch",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nWin condition: reach the exit room.\nLose condition: health drops to zero.\n\nRooms: 10 per level\nLevels: 3",
            "controls.txt":
              "CONTROLS\n\nMove: arrow keys\nInteract: space\nPause: escape",
          },
        },
      },
      {
        id: "GitKrakenView",
        mathBridge:
          "**Branches become parallel lanes in the graph.** Create branches and commits in the VS Code panel or terminal tabs, then switch here: each branch appears as a separate labeled line, and commits on different branches sit side by side.\n\nHEAD (the blue badge) shows which branch you're currently on. This is why developers use visual tools for branch-heavy work — the spatial layout makes the project structure immediately obvious.",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nWin condition: reach the exit room.\nLose condition: health drops to zero.\n\nRooms: 10 per level\nLevels: 3",
            "controls.txt":
              "CONTROLS\n\nMove: arrow keys\nInteract: space\nPause: escape",
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Under the hood: a branch is 41 bytes.** A branch is stored as a plain text file in `.git/refs/heads/` containing the 40-character SHA-1 hash of the commit it points to, plus a newline. Creating a branch is a single file write — no copying, no special data structure. This is why Git branches are essentially free compared to branches in older version control systems like SVN.",
      "**`git checkout -b` is a shortcut.** `git branch feature` creates the branch at the current commit without switching to it. `git checkout feature` switches to an existing branch. `git checkout -b feature` does both in one step. In Git 2.23+ the semantics are clearer: `git switch -c feature` creates and switches, `git switch feature` switches only.",
      "**HEAD tracks your current position.** The `HEAD` pointer always points to what you're currently on — either a branch name (the normal case) or a specific commit hash (detached HEAD). When you switch branches, HEAD updates to the new branch name. When you commit, the branch HEAD points to moves forward. `cat .git/HEAD` in the terminal shows you its current value — usually `ref: refs/heads/main`.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Branch early, branch often",
        body: "Professional teams create a new branch for every feature, bug fix, and experiment — no matter how small. This keeps `main` clean (always deployable) and makes it safe for multiple people to work simultaneously. A branch that lives for two hours before being merged is completely normal.",
      },
    ],
  },

  examples: [
    {
      title: "Full branch workflow",
      body: "# Start a new feature without touching main\ngit checkout -b add-inventory-system\n\n# Make commits freely\ngit add inventory.js\ngit commit -m 'Add basic inventory data structure'\ngit commit -m 'Add pickup and drop item logic'\n\n# Check what branches exist\ngit branch\n#   main\n# * add-inventory-system   ← asterisk shows current branch\n\n# Switch back to main — your feature files are invisible here\ngit checkout main",
    },
    {
      title: "List and delete branches",
      body: "git branch          # list local branches\ngit branch -v       # list with latest commit message\ngit branch -d done  # delete a fully merged branch\ngit branch -D risky # force-delete even if not merged",
    },
  ],

  quiz: [
    {
      id: "git0-007-q1",
      type: "choice",
      text: "You create a branch `experiment` from `main` and make 3 commits on it. What happens to `main`?",
      options: [
        "main also advances to include the 3 commits",
        "main is deleted to avoid conflicts",
        "main stays exactly where it was when `experiment` was created",
        "main is paused until you merge",
      ],
      answer: "main stays exactly where it was when `experiment` was created",
      hints: ["A branch is just a label on a commit. Committing on `experiment` moves experiment's label — not main's."],
    },
    {
      id: "git0-007-q2",
      type: "choice",
      text: "What does `git checkout -b new-feature` do?",
      options: [
        "Deletes the branch called new-feature",
        "Creates a branch called new-feature and switches to it",
        "Merges new-feature into main",
        "Renames main to new-feature",
      ],
      answer: "Creates a branch called new-feature and switches to it",
      hints: ["The `-b` flag means 'create branch'. The `checkout` switches to it."],
    },
    {
      id: "git0-007-q3",
      type: "choice",
      text: "How much disk space does creating a new branch cost in Git?",
      options: [
        "A full copy of every file in the project",
        "One file per commit on the branch",
        "About 41 bytes — a file containing the commit hash",
        "It depends on the size of your project",
      ],
      answer: "About 41 bytes — a file containing the commit hash",
      hints: ["A branch is stored in `.git/refs/heads/` as a text file containing a single commit hash."],
    },
  ],

  definitions: [
    { term: "branch", definition: "A lightweight movable label (pointer) that points to a specific commit. Creating a branch costs almost nothing — it's a 41-byte file." },
    { term: "feature branch", definition: "A branch created to develop one feature or fix in isolation, keeping `main` clean and deployable." },
    { term: "git checkout -b", definition: "Creates a new branch at the current commit and switches to it in one step. Modern equivalent: `git switch -c`." },
    { term: "branch pointer", definition: "The file in `.git/refs/heads/` that records which commit a branch currently points to. It advances automatically on each commit." },
  ],
};

export default lesson;

const lesson = {
  id: "git-0-005",
  slug: "time-travel",
  chapter: "git-0",
  order: 5,
  title: "Time Travel",
  subtitle: "Navigating the history you've built",
  tags: ["git", "checkout", "history", "fundamentals"],
  aliases: [
    "git checkout",
    "navigate history",
    "git log",
    "restore previous version",
  ],

  hook: `Something broke sometime last week. It worked on Monday, it's broken now, and you have no idea which change introduced it. If you've been committing regularly, you don't need to read every change — you can walk backward through the chain, test each checkpoint, and pinpoint the exact commit that broke things. That's git history in action.`,

  mentalModel: [
    "Every commit has a short hash (like `a4f3b12`) — that's its permanent address in history. You can jump to it, inspect it, or restore files from it at any time.",
    "`git log --oneline` is your map. It prints one line per commit: hash + message. The top entry is the most recent. Read it like a timeline scrolling backward.",
    "Checking out a past commit doesn't delete anything that came after it. You're just visiting. `git checkout main` brings you back to the present.",
  ],

  intuition: {
    prose: [
      "Git history is a chain you can walk. Every commit knows its parent, which knows its parent, all the way back to the first commit ever made. In VS Code, the Timeline view in the Source Control sidebar shows this chain — click any entry to see what the file looked like at that moment. In GitKraken, the entire chain is the visual diagram in the center of the app. In the terminal, `git log --oneline` prints it as a scrollable list.",
      "The hash at the start of each log entry (something like `a4f3b12`) is that commit's permanent address. It never changes. You can use it in `git show a4f3b12` to see exactly what changed in that commit, or `git checkout a4f3b12` to make your entire project look exactly as it did at that moment. When you're done looking around, `git checkout main` brings everything back to the present.",
      "The workflow for hunting a bug: run `git log --oneline` in your terminal (or open the git graph in VS Code or GitKraken). Find the last commit where you're sure the code worked. `git checkout <that hash>`. Test — does the bug exist? If not, the bug was introduced after this point. If yes, go further back. Narrow it down until you find the first commit where the bug appears. Then `git show <that hash>` to see exactly what changed. `git checkout main` to return.",
      "Build a timeline here and walk it. Make four commits — each a distinct change: add a room type, update the controls, change the difficulty numbers, fix a typo. Once you have four nodes in the graph, click an older one. The files snap to that moment — later changes disappear from the editor. They're not gone; they're just not part of the current checkpoint. Click the most recent node or use the **↩ Return to latest** button to come back.",
    ],
    visualizations: [
      {
        id: "GitWorkspace",
        title: "VS Code Panel",
        mathBridge:
          "**The git graph below each commit in this panel is the same history VS Code's Timeline view shows,** and what GitKraken displays as its central branching diagram. Each dot is a commit. Click a dot to check it out.\n\nTerminal equivalents:\n- View history → `git log --oneline`\n- See what changed in a commit → `git show <hash>`\n- Jump to a past commit → `git checkout <hash>`\n- Return to present → `git checkout main`\n- Restore one file from any commit → `git restore --source=<hash> filename`",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nWin condition: reach the exit room.\nLose condition: health drops to zero.\n\nRooms: 10 per level\nLevels: 3",
            "controls.txt":
              "CONTROLS\n\nMove: arrow keys\nInteract: space\nPause: escape\nInventory: I",
          },
        },
      },
      {
        id: "GitTerminal",
        title: "Terminal",
        mathBridge:
          "**The terminal has the richest history tools.** Make commits in the VS Code panel tab, then explore the history here:\n\n- `git log --oneline` — compact list, newest first\n- `git log --oneline --graph` — add ASCII branch visualization\n- `git show <hash>` — see exactly what changed in any commit\n- `git checkout <hash>` — travel to a past commit (then `git checkout main` to return)",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nWin condition: reach the exit room.\nLose condition: health drops to zero.\n\nRooms: 10 per level\nLevels: 3",
            "controls.txt":
              "CONTROLS\n\nMove: arrow keys\nInteract: space\nPause: escape\nInventory: I",
          },
        },
      },
      {
        id: "GitKrakenView",
        title: "GitKraken",
        mathBridge:
          "**Click any commit dot to see its full diff.** The right panel shows which files changed and which lines were added (+) or removed (−) — this is what `git show <hash>` prints in the terminal, just displayed visually.\n\nMake commits in the VS Code panel or terminal tabs, then come back here and click through the dots to read your project's history.",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nWin condition: reach the exit room.\nLose condition: health drops to zero.\n\nRooms: 10 per level\nLevels: 3",
            "controls.txt":
              "CONTROLS\n\nMove: arrow keys\nInteract: space\nPause: escape\nInventory: I",
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`git log` has dozens of useful flags.** `git log --oneline` gives compact output. `git log --oneline --graph` adds ASCII branch visualization. `git log --oneline --graph --all` shows all branches. `git log --follow filename` shows only commits that touched a specific file. `git log --since='1 week ago'` filters by date. `git log --author='Name'` filters by author. You'll use these constantly in a real project.",
      "**Detached HEAD.** When you check out a commit by hash, Git puts you in 'detached HEAD' state — HEAD points directly to the commit instead of a branch. You can look around, and even make new commits. But those commits aren't attached to any branch, and Git will warn you they may be 'lost' if you navigate away. To save work from detached HEAD, create a branch: `git checkout -b rescue-work`. To discard it, just `git checkout main`.",
      "**`git checkout` vs `git switch` vs `git restore`.** In Git 2.23+ (released 2019), the overloaded `git checkout` was split into two dedicated commands: `git switch` for changing branches and `git restore` for restoring files. `git checkout` still works for both but the newer commands are more explicit. Most tutorials still use `git checkout` — both work.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Detached HEAD sounds scary, it isn't",
        body: "Git shows a long warning when you enter detached HEAD mode. It's not an error — it's an informational message. Your history is completely intact. Detached HEAD just means HEAD is pointing to a commit hash directly instead of a branch name. `git checkout main` ends detached HEAD immediately and nothing is lost.",
      },
    ],
  },

  examples: [
    {
      title: "Walk the history",
      body: "`git log --oneline`\na4f3b12 Add difficulty levels\n9c2a871 Add win and lose conditions\n3d8e014 Add initial game concept\n\n`git checkout 9c2a871` — project snaps to that state\n`git checkout main` — back to present",
    },
    {
      title: "Time travel to find a bug",
      body: "Your game crashed after commit five. You don't know which commit broke it.\n\n`git checkout <commit3>` — test. Works.\n`git checkout <commit4>` — test. Works.\n`git checkout <commit5>` — test. Broken.\n\nCommit 5 introduced the bug. Now you know exactly what changed:\n`git show <commit5>`",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-005-q1",
        type: "choice",
        text: "You have commits 1, 2, 3, 4, 5. You check out commit 3. What happens to commits 4 and 5?",
        options: [
          "They are deleted permanently",
          "They are hidden until you run git restore",
          "They still exist — you are just visiting commit 3",
          "They are moved to a temporary branch",
        ],
        answer: "They still exist — you are just visiting commit 3",
      },
      {
        id: "git0-005-q2",
        type: "choice",
        text: "What does `git log --oneline` show?",
        options: [
          "The full diff of every commit",
          "A one-line-per-commit list with short hash and message",
          "Only the most recent commit",
          "All files currently in the working directory",
        ],
        answer: "A one-line-per-commit list with short hash and message",
      },
      {
        id: "git0-005-q3",
        type: "choice",
        text: "What is HEAD in Git?",
        options: [
          "The first commit ever made in the repository",
          "A pointer to wherever you currently are in history",
          "The name of the default branch",
          "The author of the most recent commit",
        ],
        answer: "A pointer to wherever you currently are in history",
      },
    ],
  },
};

export default lesson;

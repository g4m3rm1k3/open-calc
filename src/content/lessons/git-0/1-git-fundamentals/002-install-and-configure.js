const lesson = {
  id: "git-0-002",
  slug: "commits-are-checkpoints",
  chapter: "git-0",
  order: 2,
  title: "Commits Are Checkpoints",
  subtitle: "How Git turns history into something you can navigate",
  tags: ["git", "commits", "snapshots", "fundamentals"],
  aliases: ["what is a commit", "git snapshot", "git checkpoint"],

  hook: `Your laptop dies. Hard drive failure. Everything gone. If the last thing you did was push a commit to GitHub, a teammate can clone the repo right now and nothing is lost. If the last thing you did was save a file without committing, that work is gone forever. The difference is the commit.`,

  mentalModel: [
    "A commit isn't just a save — it's a restore point with a label, a timestamp, and a parent. Every commit knows what came before it.",
    "Once a commit exists, it's permanent. You can restore any file to any previous commit with a single command: `git restore --source=<hash> filename`.",
    "The git graph in the panel below is the same history VS Code shows in the Timeline view and GitKraken shows as its central diagram — one dot per commit, connected in a chain.",
  ],

  intuition: {
    prose: [
      "When you save a file in your editor, you're writing bytes to disk. That's it. The previous version is overwritten and gone. Git's commit does something completely different: it creates a permanent record of the current state of all your tracked files, attaches your message and name, timestamps it, and links it to the previous record. From that point on, nothing can change it.",
      "The commit chain is what makes recovery possible. Every commit knows its parent. Git can walk that chain backward from the latest commit all the way to the first one. When you need to undo a week's worth of failed experiments, you're not hoping your editor still has the undo buffer open — you find the commit where things worked and restore it directly. That commit is always there, unchanged, waiting.",
      "In VS Code, you commit from the Source Control sidebar. Write your message in the field at the top, then click the checkmark. VS Code is running `git commit -m 'your message'` for you. In the terminal you'd type that command directly. In GitKraken, there's a commit button in the staging panel on the right side of the screen. All three paths create the same commit object in `.git/` — they're just different interfaces to the same operation.",
      "Try it here: `game-design.txt` is already open. Add a line or change something, click **Save**, write a message, and click **✓ Commit**. Do it twice so you have two commits in the graph. Then right-click `game-design.txt` and choose **Delete** — the file shows a red **D** in the file tree. Click **↩ Restore** next to it. Git pulls the exact content from your last commit in an instant. That's `git restore game-design.txt` in the terminal — the same command, same result.",
    ],
    visualizations: [
      {
        id: "GitWorkspace",
        mathBridge:
          "**This panel simulates VS Code's Source Control sidebar.** The commit message field at the top and the ✓ Commit button work exactly as they do in VS Code. Terminal equivalents:\n\n- Click **Save** in editor → writes file to disk, no git involvement\n- Click **✓ Commit** with a message → `git commit -m 'message'`\n- Click **↩ Restore** on a file → `git restore filename`\n- Each dot in the graph → one commit in `git log --oneline`\n\nGitKraken shows the same graph as a visual branching diagram. GitHub Desktop has a summary/description field instead of a one-line message. Same underlying commit.",
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
          "**Run `git log --oneline` to see the commit chain as a numbered list.** Each entry is a short hash + your commit message — the same dots as in the VS Code panel above, but as text.\n\nTry:\n- Make a few commits in the VS Code panel tab\n- Come back here and run `git log --oneline`\n- Run `git show <hash>` to inspect any commit's diff",
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
          "**This is the same history drawn as a visual graph.** Every commit you make in the VS Code panel or terminal appears here as a dot. The connecting lines show parent→child order — newest at top, oldest at bottom.\n\nThis is the central diagram in GitKraken, Fork, and Sourcetree. All three tools are just different ways to display the same commit chain.",
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
      "**What Git actually stores in a commit.** Every commit object contains four things: a **tree** (a pointer to a snapshot of all tracked files at this moment), a **parent** hash (the previous commit's ID — the chain link), an **author** block (name, email, timestamp), and a **message**. The commit itself is stored under a SHA-1 hash of all this content. That hash is the commit's permanent, unique address.",
      "**Immutability by design.** The commit's ID is derived from its content. Change anything about the commit — the message, a file, the parent — and you get a different hash, which is a different commit. The original still sits in the object store untouched. When you `git commit --amend`, Git creates a new commit with a new hash. The amended commit replaces the branch pointer, but the original remains in `.git/objects/` until garbage collection.",
      "**The chain is the history.** Start at the latest commit. Follow its parent pointer to the previous. Follow that one's parent. Keep going and you reach the first commit — the one with no parent. This chain is what `git log` walks. `git checkout <hash>` moves HEAD to a specific point in the chain. `git restore --source=<hash> filename` grabs one file from a specific point. Every navigation operation is just traversing this linked list.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Commit early, commit often",
        body: "A restore point you never created can't save you. You don't need the code to be perfect before committing — you need it to be a state worth having in history. Frequent small commits give you more points to return to and make the history easier to read.",
      },
    ],
  },

  examples: [
    {
      title: "The chain in action",
      body: "Commit C knows its parent is commit B.\nCommit B knows its parent is commit A.\nCommit A has no parent — it is the first.\n\nThis is your entire project history. Every checkout and every restore travels this chain.",
    },
    {
      title: "The checkpoint that saved a week of work",
      body: "A developer refactors a large module. Four days in, the new approach has a fundamental flaw. Without Git: four days of work gone, start over.\n\nWith Git: `git checkout` to the commit before the refactor started. All four days of failed work are still in history — accessible if any part of it turns out to be useful after all.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-002-q1",
        type: "choice",
        text: "What makes a commit fundamentally different from a regular file save?",
        options: [
          "Commits are stored in the cloud automatically",
          "Commits replace the previous version, just like a save",
          "Commits are permanent and add to a history chain instead of overwriting",
          "Commits only store files that changed since the last save",
        ],
        answer:
          "Commits are permanent and add to a history chain instead of overwriting",
      },
      {
        id: "git0-002-q2",
        type: "choice",
        text: "You have three commits: A, B, and C. Which statement is true?",
        options: [
          "Commit B no longer exists once you make commit C",
          "Commits A, B, and C all exist and any can be restored",
          "Only the most recent commit is accessible",
          "Commits B and C overwrite commit A's content",
        ],
        answer: "Commits A, B, and C all exist and any can be restored",
      },
      {
        id: "git0-002-q3",
        type: "choice",
        text: "What does every commit store besides the file snapshot?",
        options: [
          "A list of every keystroke made since the last commit",
          "A compressed diff of what changed",
          "A message, author, timestamp, and a pointer to the parent commit",
          "The next commit's content, predicted automatically",
        ],
        answer:
          "A message, author, timestamp, and a pointer to the parent commit",
      },
    ],
  },
};

export default lesson;

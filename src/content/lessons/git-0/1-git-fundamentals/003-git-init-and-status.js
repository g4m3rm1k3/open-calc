const lesson = {
  id: "git-0-003",
  slug: "the-three-zones",
  chapter: "git-0",
  order: 3,
  title: "The Three Zones",
  subtitle: "Where your work lives before it becomes history",
  tags: ["git", "staging", "working-directory", "repository"],
  aliases: ["working directory", "staging area", "git add", "three areas"],

  hook: `It's end of day. You fixed a crash in the combat system, added a new treasure room, and updated the README. Three separate things. Committing them all together with a message like "stuff" makes your history useless. Committing them separately, with clear messages, makes your history a story you can actually navigate. Staging is how you do it.`,

  mentalModel: [
    "In VS Code's Source Control sidebar, 'Changes' is the working directory and 'Staged Changes' is the staging area. Clicking **+** runs `git add`. Clicking **–** unstages.",
    "Stage commits should be logically atomic — one idea per commit. Use staging to separate 'fixed a bug' from 'added a feature' even if you wrote both at the same time.",
    "The staging area gives you control over the story your history tells. Use it deliberately, not as a checkbox to get past.",
  ],

  intuition: {
    prose: [
      "Every change you make starts in the **working directory** — the actual files on your disk. Git watches those files but doesn't record anything yet. Changes in the working directory are unsaved as far as git history is concerned, even after you've clicked Save in your editor. They're just edits that exist on disk.",
      "The **staging area** (also called the index) is your preparation zone. You choose which changes to include in the next commit by staging them. In VS Code's Source Control sidebar, staged files appear under a separate **Staged Changes** section. In GitKraken, you drag files from the 'Unstaged Files' panel to 'Staged Files'. In the terminal, you run `git add filename`. All three UIs do the same thing: they tell Git 'include this in the next commit.'",
      "Once you click **✓ Commit** (or run `git commit -m 'message'` in the terminal), Git takes everything in the staging area and creates a permanent commit from it. The working directory files you didn't stage stay right where they are — just not in this commit. You can stage and commit them separately, in a different commit with a different message.",
      "Try it here. Both files are already populated. Edit `game-design.txt` — add a room idea or change the win condition. In the panel, it appears under **Changes** with a yellow M (modified). Click the **+** button next to it only — not `controls.txt`. It moves to **Staged Changes**. Now write a message about just that one thing and click **✓ Commit**. Then edit `controls.txt`, stage it, and commit it separately. You've just written two clean, focused commits instead of one messy mixed one.",
    ],
    visualizations: [
      {
        id: "GitWorkspace",
        mathBridge:
          "**The panel above is VS Code's Source Control staging UI.** The two sections map directly:\n\n- **Changes** (yellow M) = working directory — modified but not staged\n- **Staged Changes** (green S) = staging area — ready to commit\n\nTerminal equivalents for each action:\n- Click **+** next to a file → `git add filename`\n- Click **–** next to a staged file → `git restore --staged filename`\n- Click **✓ Commit** with a message → `git commit -m 'message'`\n- `git status` in the terminal shows both sections at once\n\nIn GitKraken: drag files between 'Unstaged Files' and 'Staged Files'. In Fork: click the checkboxes. Same operation, different UI.",
        props: {
          showStaging: true,
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nPlayer starts in a room with three doors.\nEach door leads to a different challenge.\n\nWin condition: reach the key room and exit.\nLose condition: health drops to zero.",
            "controls.txt":
              "CONTROLS (draft)\n\nArrow keys: move\nSpace: interact\nEsc: pause\n\n// TODO: add inventory key",
          },
        },
      },
      {
        id: "GitTerminal",
        mathBridge:
          "**The terminal above runs real Git commands against the same repository.** Try these now:\n\n```\ngit status          # see both zones at once\ngit add game-design.txt   # stage one file\ngit status          # note: it moved to Staged Changes above\ngit commit -m 'Initial game concept'\ngit log --oneline   # see the commit in history\n```\n\nEvery button click in the VS Code panel has a terminal equivalent. The terminal is not an alternative — it's the same operation, just typed. Professionals switch between both depending on what's faster.",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nPlayer starts in a room with three doors.\nEach door leads to a different challenge.\n\nWin condition: reach the key room and exit.\nLose condition: health drops to zero.",
            "controls.txt":
              "CONTROLS (draft)\n\nArrow keys: move\nSpace: interact\nEsc: pause\n\n// TODO: add inventory key",
          },
        },
      },
      {
        id: "GitKrakenView",
        mathBridge:
          "**The graph above is a GitKraken-style visual history.** Once you make commits (in the terminal or VS Code panel), each one appears here as a circle on a timeline.\n\n- Click any commit circle to see its files in the right panel\n- Click a branch name on the left to switch branches\n- The blue `HEAD` badge shows where you are right now\n\nGUI clients like GitKraken, Fork, and Sourcetree all show this same graph. They're visualizing the exact same data as `git log --oneline --graph`. Make a commit in the terminal above and watch it appear here.",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nPlayer starts in a room with three doors.\nEach door leads to a different challenge.\n\nWin condition: reach the key room and exit.\nLose condition: health drops to zero.",
            "controls.txt":
              "CONTROLS (draft)\n\nArrow keys: move\nSpace: interact\nEsc: pause\n\n// TODO: add inventory key",
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**The working directory is not the repo.** Files you edit live on disk until you `git add` them. Git watches them but doesn't record them. The `.git/` folder is completely separate — a hidden directory that stores the history objects. Your working files are just a checked-out view of those objects.",
      "**`git add` copies content, not files.** When you run `git add game-design.txt`, Git hashes the current bytes of that file and stores the hash in the staging area (called the index). If you keep editing the file after `git add`, the staged version stays as it was at the moment you ran `git add`. Running `git add .` again updates the staged version to match your latest edits. The working copy and the staged copy can differ.",
      "**`git commit` snapshots the index, not the working directory.** When you commit, Git creates a tree object from everything currently in the staging area and wraps it in a commit. Files you edited but didn't `git add` are not in the commit — they're only in the working directory. This is by design: the staging area is your explicit, deliberate selection of what this commit contains.",
    ],
    callouts: [
      {
        type: "tip",
        title: "git add . stages everything — use with intention",
        body: "`git add .` adds all modified and untracked files in the current directory at once. Fast when you want everything, but easy to accidentally include a debug file, a temporary config, or a secret. Reviewing what you're staging with `git diff --staged` before committing is a habit worth building.",
      },
    ],
  },

  examples: [
    {
      title: "Two changes, two commits",
      body: 'You fixed a typo in game-design.txt and added a new control to controls.txt.\n\n`git add game-design.txt`\n`git commit -m "Fix typo in game concept"`\n\n`git add controls.txt`\n`git commit -m "Add inventory control"`\n\nNow history is clean: one commit per logical change.',
    },
    {
      title: "What 'M' means in the file tree",
      body: "In the workspace, files with a yellow M are modified in your working directory but not yet staged.\nFiles with a green S are staged — they're ready to be committed.\nOnce committed, they show no indicator — the working copy matches the last commit.",
    },
  ],

  quiz: [
    {
      id: "git0-003-q1",
      type: "choice",
      text: "You edit controls.txt but do NOT run git add. Which zone is the change in?",
      options: [
        "The repository",
        "The staging area",
        "The working directory only",
        "It has been committed automatically",
      ],
      answer: "The working directory only",
      hints: ["git add is the action that moves changes from the working directory. Has that happened?"],
    },
    {
      id: "git0-003-q2",
      type: "choice",
      text: "Why does the staging area exist?",
      options: [
        "Git requires it for security reasons",
        "So you can choose exactly which changes to include in a commit",
        "It compresses files before storing them",
        "It backs up your files to the cloud",
      ],
      answer:
        "So you can choose exactly which changes to include in a commit",
      hints: ["You made 5 changes but want 3 separate commits. How do you pick which changes go in each?"],
    },
    {
      id: "git0-003-q3",
      type: "choice",
      text: "You run git add game-design.txt and then keep editing the file. What does the commit include?",
      options: [
        "The version of the file at the time you ran git add",
        "The latest version you saved after git add",
        "Both versions as separate entries",
        "Neither — you must git add again after every edit",
      ],
      answer: "The version of the file at the time you ran git add",
      hints: ["git add hashes the file contents at the moment it runs. Later edits are in the working directory, not the index."],
    },
  ],

  definitions: [
    { term: "working directory", definition: "The actual files on your disk that you edit. Git watches them but records nothing until you stage them." },
    { term: "staging area", definition: "The preparation zone (also called the index) where you queue file changes before packaging them into a commit." },
    { term: "index", definition: "Git's internal name for the staging area — stored as `.git/index`. The contents of git add go here." },
    { term: "tracked file", definition: "A file Git is monitoring because it has been staged or committed at least once." },
    { term: "untracked file", definition: "A file in the working directory that Git has never seen — it will appear in `git status` as untracked." },
  ],
};

export default lesson;

const lesson = {
  id: "git-0-004",
  slug: "commit-messages-matter",
  chapter: "git-0",
  order: 4,
  title: "Commit Messages Matter",
  subtitle: "Your history is only useful if you can read it",
  tags: ["git", "commits", "messages", "best-practices"],
  aliases: [
    "git commit message",
    "how to write commit messages",
    "git history",
  ],

  hook: `Six months from now you're looking at a bug in production. You run \`git log\` and see: "fix", "wip", "updates", "stuff", "changes2". No idea which commit introduced it. Now imagine those same commits read: "Fix auth timeout on slow connections", "Add inventory system", "Refactor combat to remove global state". The second history tells a story. The first is just noise.`,

  mentalModel: [
    "Write commit messages for the person who has to debug at 2am — they have no context. That person is often future you.",
    "The subject line is the headline: 50 characters, imperative mood ('Add', 'Fix', 'Remove'), no period at the end. Put detail in the body.",
    "A commit message answers WHY — the diff already shows WHAT changed. The message is the one place to explain the reasoning.",
  ],

  intuition: {
    prose: [
      "There are two kinds of commit history. The first is a graveyard of 'fix', 'wip', 'update stuff' — technically it's history, but it's useless. You can't search it, you can't read it, and when something breaks you're reading the full diff of every commit looking for the culprit. The second kind is a readable narrative: 'Add difficulty scaling to combat rooms', 'Fix divide-by-zero crash when player has no health potions', 'Remove deprecated map generation algorithm'. Each entry tells you what changed and why, without reading a single line of code.",
      "In VS Code, the Source Control sidebar has a message input field at the top of the panel — it's where you write the commit subject line before clicking ✓. If you're in the terminal, it's `git commit -m 'your message here'`. For multi-line messages with a subject and body, use `git commit` without the `-m` flag to open your editor, or `git commit -m 'Subject' -m 'Body paragraph here.'`",
      "The format professionals use: start with a verb in imperative mood. Not 'Fixed the thing' (past tense), not 'Fixing the thing' (present participle), but 'Fix the thing' (imperative, as if issuing an instruction). This matches how Git itself writes generated messages ('Merge branch feature', 'Revert commit abc1234') and makes every message read consistently.",
      "Try it here intentionally. Make three commits — one with a completely vague message ('stuff'), one with a decent but vague one ('update game'), and one with a properly formatted message like `Add difficulty levels to combat rooms`. Then open the git graph and compare how the three entries read. The difference is immediately obvious. You're building your own empirical case for why this matters.",
    ],
    visualizations: [
      {
        id: "GitWorkspace",
        title: "VS Code Panel",
        mathBridge:
          "**The message input field above the ✓ Commit button** is VS Code's commit message box. In the terminal: `git commit -m 'message'`. For multiline messages: `git commit` opens your default editor (usually nano or vim — set with `git config --global core.editor 'code --wait'` to use VS Code).\n\nAfter committing, run `git log --oneline` in the terminal to see your messages as a list. You'll immediately see which ones are readable and which ones are noise.",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nWin condition: reach the key room and exit.\nLose condition: health drops to zero.\n\nDifficulty levels:\n- Easy: 3 traps, 2 health potions\n- Normal: 5 traps, 1 health potion\n- Hard: 8 traps, no potions",
            "controls.txt":
              "CONTROLS\n\nArrow keys: move\nSpace: interact\nEsc: pause\nI: inventory",
          },
        },
      },
      {
        id: "GitTerminal",
        title: "Terminal",
        mathBridge:
          "**In the terminal, commit message quality is obvious at a glance.** `git log --oneline` prints one line per commit — your message is the entire entry. A message like `stuff` tells you nothing. A message like `Add difficulty levels to combat rooms` tells you exactly what changed.\n\nTry: make commits in the VS Code panel tab with both vague and precise messages, then run `git log --oneline` here to see the difference immediately.",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nWin condition: reach the key room and exit.\nLose condition: health drops to zero.\n\nDifficulty levels:\n- Easy: 3 traps, 2 health potions\n- Normal: 5 traps, 1 health potion\n- Hard: 8 traps, no potions",
            "controls.txt":
              "CONTROLS\n\nArrow keys: move\nSpace: interact\nEsc: pause\nI: inventory",
          },
        },
      },
      {
        id: "GitKrakenView",
        title: "GitKraken",
        mathBridge:
          "**The commit message is the only label on each dot in the graph.** In GitKraken, the central lane shows your message next to each commit. A vague message like `fix` leaves you scanning diffs to figure out what happened. A precise message lets you navigate history by reading the graph alone.\n\nMake commits in the VS Code panel or terminal tabs and watch the messages appear here.",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nWin condition: reach the key room and exit.\nLose condition: health drops to zero.\n\nDifficulty levels:\n- Easy: 3 traps, 2 health potions\n- Normal: 5 traps, 1 health potion\n- Hard: 8 traps, no potions",
            "controls.txt":
              "CONTROLS\n\nArrow keys: move\nSpace: interact\nEsc: pause\nI: inventory",
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**The 50/72 convention.** The subject line should be 50 characters or fewer — GitHub truncates at 72, and most git tools show only the subject in one-line views. If you need more detail, leave a blank line after the subject and write a body. The body can be as long as needed and should be wrapped at 72 characters per line. `git log --oneline` shows only the subject, so the subject must work standalone.",
      "**Imperative mood.** Write commit messages as commands: `Add`, `Fix`, `Remove`, `Refactor`, `Update`, `Implement`, `Revert`. Not `Added`, `Fixes`, `Removing`. The convention comes from the fact that a commit message describes what the commit *does* when applied to the codebase — not what you *did* while writing it. It also matches Git's own generated messages exactly.",
      "**The body answers why, not what.** The diff tells you what changed. The body of a commit message is for context that the diff can't show: why you chose this approach over another, what a non-obvious bug was, a link to the ticket or discussion, a note about what you explicitly didn't change and why. A body paragraph that says 'changed the loop variable from i to index' is redundant — any reader can see that in the diff. A body that says 'switched from O(n²) lookup to a hash map after profiling showed this running 400ms on large maps' is genuinely useful.",
    ],
    callouts: [
      {
        type: "tip",
        title: "The completion test",
        body: 'Apply this to every commit message: "If applied, this commit will ___"\n\n`"Fix race condition in auth timeout"` → If applied, this commit will fix race condition in auth timeout. ✓\n`"stuff"` → If applied, this commit will stuff. ✗\n\nIf the blank reads as a coherent sentence, the message is good.',
      },
    ],
  },

  examples: [
    {
      title: "Before and after",
      body: 'Bad:  git commit -m "fix"\nGood: git commit -m "Fix login crash when password contains special characters"\n\nBad:  git commit -m "changes to the game"\nGood: git commit -m "Add health potion pickup to treasure rooms"\n\nBad:  git commit -m "wip"\nGood: git commit -m "Implement basic combat: attack and dodge actions"',
    },
    {
      title: "Multi-line commit for complex changes",
      body: 'git commit -m "Refactor dungeon generation algorithm\n\nPrevious algorithm was O(n²) and caused freezes on large maps.\nNew algorithm uses a union-find structure, reducing complexity to O(n log n).\nAll existing dungeon seeds produce identical output."',
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-004-q1",
        type: "choice",
        text: "What question should a commit message primarily answer?",
        options: [
          "What files were changed",
          "How many lines of code were added",
          "Why this change exists",
          "Who wrote the code",
        ],
        answer: "Why this change exists",
      },
      {
        id: "git0-004-q2",
        type: "choice",
        text: "Which commit message follows best practices?",
        options: [
          "fixed the thing",
          "Add win condition check to dungeon exit logic",
          "Added the win condition stuff and also fixed some other things while I was in there",
          "WIP",
        ],
        answer: "Add win condition check to dungeon exit logic",
      },
      {
        id: "git0-004-q3",
        type: "choice",
        text: "The 50-character limit applies to:",
        options: [
          "The total commit including all file changes",
          "The commit body paragraph",
          "The subject line of the commit message",
          "The author field",
        ],
        answer: "The subject line of the commit message",
      },
    ],
  },
};

export default lesson;

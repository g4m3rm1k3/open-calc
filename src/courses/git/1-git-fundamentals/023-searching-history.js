const lesson = {
  id: "git-0-018",
  slug: "searching-history",
  chapter: "git-0",
  order: 18,
  title: "Searching History",
  subtitle: "Tracking down when and where things changed",
  tags: ["git", "log", "blame", "bisect", "grep", "search", "debug"],
  aliases: [
    "git blame",
    "git bisect",
    "git log grep",
    "find bug",
    "search commits",
  ],

  hook: `The bug showed up sometime in the last 200 commits. Customer data is wrong but no one knows when the calculation changed. Git has three forensic tools for exactly this situation — grep, blame, and bisect.`,

  mentalModel: [
    "`git log --grep` searches commit messages. `git log -S` (pickaxe) searches for commits that added or removed a specific string in file contents.",
    "`git blame` annotates every line of a file with the commit that last changed it — showing who, when, and with what commit hash.",
    "`git bisect` runs a binary search through commit history to find the exact commit that introduced a bug.",
  ],

  intuition: {
    prose: [
      '**Searching commit messages.** `git log --grep="auth"` shows all commits whose message contains \'auth\'. Case-insensitive: `git log -i --grep="auth"`. Combine with author filter: `git log --grep="fix" --author="Alice"`. Useful when commits are well-named — less useful when they\'re all \'WIP\'.',
      '**Pickaxe search.** `git log -S "calculateTax"` finds all commits where the string `calculateTax` was added or removed. This is what you want to find when a function was introduced or deleted. `git log -G "regex"` is similar but uses a regex pattern and includes commits where the count of matches changed (even if the string still exists).',
      "**`git blame`.** `git blame src/math/tax.js` shows each line of the file annotated with: commit hash, author, date, and line content. Every line — you can see exactly who last changed line 47 and when. Click the hash to see the full commit. `git blame -L 40,60 src/math/tax.js` limits to lines 40-60.",
    ],
    callouts: [
      {
        type: "definition",
        title: "git bisect — Binary Search for Bugs",
        body: "Imagine 200 commits, each potentially introducing the bug. Checking them one by one = 200 checks. Binary search = at most 8 checks (log₂ 200 ≈ 7.6). `git bisect start` → mark HEAD as `bad` → mark a known-good old commit as `good` → Git checks out the midpoint. You test: is this version good or bad? Tell Git: `git bisect good` or `git bisect bad`. Git halves the range and checks out the next midpoint. Repeat until Git identifies the exact first-bad commit. Run `git bisect reset` to return to HEAD.",
      },
    ],
    visualizations: [
      {
        id: "GitWorkspace",
        title: "VS Code Panel",
        mathBridge:
          "**Build a varied commit history to search through.** Make 5–6 commits with different messages — some mentioning 'controls', some mentioning 'rooms', some mentioning 'bugfix'. Edit different files each time. This gives you a realistic history to explore. Then switch to GitTerminal and use `git log --grep`, `git log -S`, and `git blame` to find specific commits and changes. The richer the history you create here, the more meaningful the search results.",
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
          "**Practice searching git history in the terminal.**\n\nFirst make several commits with varied messages, then try:\n\n- `git log --oneline` — compact history\n- `git log --grep='controls'` — find commits mentioning 'controls'\n- `git log --all --oneline --graph` — full graph with all branches\n- `git log -S 'health potions' --oneline` — find when 'health potions' was added/removed\n- `git log --since='1 week ago'` — recent commits\n- `git blame controls.txt` — see who last changed each line\n- `git show HEAD~2` — inspect a specific past commit\n\nAfter a few commits, try `git bisect start` to practice the binary search workflow.",
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
          "**The graph is the visual form of `git log --graph`.** After building a history of varied commits in the panel, compare what you see here against `git log --oneline --graph` in the terminal — they render the same data. Click any commit node to see its full message and diff. When you find a commit with `git log --grep` in the terminal, locate it visually here by matching the message. Both views answer the same question: 'what changed, and when?'",
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
      "**`git bisect run`.** You can automate bisect with a test script: `git bisect run npm test`. Git will run `npm test` at each midpoint — if the test exits 0 (pass), Git marks it good; if it exits non-zero (fail), Git marks it bad. Fully automated binary search through history. This is extremely powerful for regression testing.",
      '**`git log` with path filter.** `git log -- src/utils/format.js` shows only commits that touched that specific file. Combine with pickaxe: `git log -S "parseDate" -- src/utils/` to search for a string added/removed in a specific directory.',
      "**Reading `git blame` output.** The format is: `hash (Author Date Line#) content`. A `^` prefix on the hash means the line was in the initial commit of the file. Lines with the same hash form a contiguous block changed by the same commit. The `-w` flag ignores whitespace changes so whitespace reformats don't pollute blame results.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Combine tools for fast debugging",
        body: 'Typical forensic workflow: (1) `git log -S "buggyFunction"` to find when the function changed. (2) `git show <hash>` to read the diff. (3) `git blame file.js` to find who last touched the specific lines. (4) `git bisect` if you have a reproducible test but can\'t identify the commit from diffs alone.',
      },
    ],
  },

  examples: [
    {
      title: "Find when a function was deleted",
      body: '`git log -S "function calculateDiscount"` — shows all commits where this exact string was added or removed\n`git show <hash>` — read the full diff to see what changed\n`git checkout <hash>~1 -- src/pricing.js` — restore the file from before that commit if needed',
    },
    {
      title: "Run a bisect to find a regression",
      body: "`git bisect start`\n`git bisect bad` — current HEAD is broken\n`git bisect good v2.0.0` — v2.0.0 was working\n`# Git checks out midpoint commit`\n`# Test manually, then:`\n`git bisect good` — or `git bisect bad`\n`# Repeat until Git says: 'abc1234 is the first bad commit'`\n`git bisect reset` — return to HEAD",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-018-q1",
        type: "choice",
        text: '`git log -S "calculateTax"` does what?',
        options: [
          "Searches commit messages for the word 'calculateTax'",
          "Shows commits where the string 'calculateTax' was added or removed from file contents",
          "Runs `calculateTax` as a shell command",
          "Shows all commits by the author 'calculateTax'",
        ],
        answer:
          "Shows commits where the string 'calculateTax' was added or removed from file contents",
      },
      {
        id: "git0-018-q2",
        type: "choice",
        text: "`git blame` helps you:",
        options: [
          "Revert changes made by a specific author",
          "See which commit last changed each line of a file",
          "Find all commits by an author",
          "Assign code review responsibility",
        ],
        answer: "See which commit last changed each line of a file",
      },
      {
        id: "git0-018-q3",
        type: "choice",
        text: "How many commits does git bisect need to check to find a bug in 1000 commits?",
        options: [
          "Up to 1000 checks",
          "About 500 checks",
          "About 10 checks (log₂ 1000 ≈ 10)",
          "Exactly 50 checks",
        ],
        answer: "About 10 checks (log₂ 1000 ≈ 10)",
      },
    ],
  },
};

export default lesson;

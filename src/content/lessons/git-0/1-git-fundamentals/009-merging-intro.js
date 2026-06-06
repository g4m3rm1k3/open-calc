const lesson = {
  id: "git-0-009",
  slug: "bringing-it-together",
  chapter: "git-0",
  order: 9,
  title: "Merging",
  subtitle: "Combining independent lines of work into one",
  tags: ["git", "merge", "fast-forward", "merge commit", "fundamentals"],
  aliases: ["git merge", "merge branches", "combine branches", "merge commit"],

  hook: `Your feature branch has four commits. A teammate's bug fix landed on main while you were working. Now you need to bring everything together. Merging is a two-minute operation — but knowing whether Git will fast-forward or create a merge commit tells you exactly what the history will look like before you run the command.`,

  mentalModel: [
    "Fast-forward: if main hasn't moved since you branched, Git slides main forward to your tip. No new commit, no branching in the graph.",
    "Merge commit: if both branches diverged, Git creates a new commit with two parents — one from each branch. The graph shows a V converging to a point.",
    "You always merge INTO the current branch. `git checkout main` then `git merge feature` brings feature into main — not the other way around.",
  ],

  intuition: {
    prose: [
      "When you merge two branches, Git finds their common ancestor — the last commit they both share. Then it asks: what changed from that ancestor to the tip of each branch? If the two sets of changes don't overlap, Git applies both automatically and succeeds. If they do overlap, you get a conflict (that's the next lesson).",
      "A fast-forward merge happens when one branch is directly ahead of the other — main has no commits your branch doesn't. Git doesn't need to 'combine' anything; it just moves main's pointer forward along the chain your branch already built. No merge commit appears. The history looks like you just kept committing on main the whole time.",
      "A merge commit happens when both branches have unique commits. Git creates a new commit that has two parents — one pointing backward to your branch's last commit, one pointing backward to main's last commit. In the graph, two lanes converge into a single point. VS Code's Source Control panel shows both incoming lines meeting at the merge commit. GitKraken's visual graph makes this especially clear as two colored lanes flowing together.",
      "Try both in order. First: branch from main, make two commits on `feature`, merge — you'll get a fast-forward. Then: branch again, make a commit on `feature`, switch to `main` and make a different commit, merge — you'll get a merge commit. Look at the graph after each merge and see the structural difference.",
    ],
    visualizations: [
      {
        id: "GitWorkspace",
        mathBridge:
          "**VS Code's Source Control sidebar shows merges the same way.** After a fast-forward, the graph continues in a straight line. After a merge commit, you see two lines converging.\n\nTerminal workflow:\n```\ngit checkout main       # switch to branch being merged INTO\ngit merge feature       # bring feature's commits into main\n```\n- Fast-forward output: `Fast-forward`\n- Merge commit output: opens editor for merge message (or auto-generates `Merge branch 'feature'`)\n- After merging: `git branch -d feature` to delete the branch\n\nIn GitKraken: right-click a branch in the left panel → 'Merge into current branch'. In VS Code: use the Source Control panel's branch menu → Merge Branch.",
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
          "**Merging is two commands: switch then merge.** Create and populate branches in the VS Code panel tab, then execute the merge here:\n\n```\ngit checkout main        # switch to the branch being merged INTO\ngit merge feature-name   # bring that branch's commits into main\n```\n\nAfterwards, `git log --oneline --graph` shows whether it was a fast-forward (straight line) or a merge commit (two lines converging).",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
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
        id: "GitKrakenView",
        mathBridge:
          "**The graph makes merge types instantly visual.** A fast-forward merge continues the line without a new dot. A true merge commit shows two lanes converging at a single point with two parent lines leading into it.\n\nDo both merge types in the VS Code panel or terminal tabs, then come here: you'll see exactly why teams use `--no-ff` to force a merge commit even when a fast-forward is possible — it preserves a clear record of when each branch landed.",
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
      "**`git merge` always merges INTO the current branch.** You switch to the branch you want to update, then name the source. `git checkout main` then `git merge feature` brings feature's commits into main. The feature branch pointer stays where it is — main's pointer is what moves. People sometimes run the command backward and wonder why their branch didn't update.",
      "**Controlling whether you get a fast-forward.** `git merge --no-ff feature` forces a merge commit even when a fast-forward is possible. Many teams require this for every feature merge so the history shows a clear record of when each feature landed. `git merge --ff-only` does the opposite — fails if a fast-forward isn't possible, used to enforce linear history.",
      "**After a successful merge, the feature branch still exists.** Git doesn't automatically delete it. `git branch -d feature` deletes a fully merged branch. `git branch -D feature` force-deletes even if not merged. The safety check in `-d` is useful — you won't accidentally lose unmerged work. GitHub offers a 'Delete branch' button on the PR page after merging.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Merge direction matters",
        body: "`git merge feature` while on `main` brings feature into main. `git merge main` while on `feature` brings main into feature — a common pattern when your branch falls behind: update your branch with main's latest before opening a PR.",
      },
    ],
  },

  examples: [
    {
      title: "Fast-forward merge",
      body: "# main is at commit A; feature has A → B → C\ngit checkout main   # switch to the branch being merged INTO\ngit merge feature   # fast-forward: main pointer moves to C\n# Output: Fast-forward\n#  game-design.txt | 3 +++\n# 1 file changed",
    },
    {
      title: "Merge commit (diverged branches)",
      body: "# main is at D, feature is at C (both branched from A)\ngit checkout main\ngit merge feature\n# Git opens editor for merge commit message\n# or auto-commits with: 'Merge branch feature'\n# Result: new commit E with parents D and C",
    },
    {
      title: "Update feature branch with latest main",
      body: "# While on feature, bring in changes from main\ngit checkout feature\ngit merge main   # merge main INTO feature\n# Now feature has all of main's recent changes\n# Continue working on feature — no risk of falling behind",
    },
  ],

  quiz: [
    {
      id: "git0-009-q1",
      type: "choice",
      text: "What is a fast-forward merge?",
      options: [
        "A merge that completes in under one second",
        "A merge where main's pointer slides to the tip of the branch because main hasn't diverged",
        "A merge that skips the staging area",
        "A merge that creates a squashed single commit",
      ],
      answer:
        "A merge where main's pointer slides to the tip of the branch because main hasn't diverged",
      hints: ["If main has no commits that the feature branch doesn't have, what does Git need to do to 'merge'?"],
    },
    {
      id: "git0-009-q2",
      type: "choice",
      text: "You are on `main` and run `git merge feature`. What happens to the `feature` branch pointer?",
      options: [
        "It is deleted automatically",
        "It moves to wherever main was before the merge",
        "Nothing — it stays pointing to the same commit it was on",
        "It moves to the same commit as main",
      ],
      answer: "Nothing — it stays pointing to the same commit it was on",
      hints: ["You merge INTO main. Only the branch you're on (main's pointer) changes."],
    },
    {
      id: "git0-009-q3",
      type: "choice",
      text: "How many parents does a merge commit have?",
      options: ["Zero", "One", "Two", "It varies"],
      answer: "Two",
      hints: ["A merge commit records the joining of two separate lines of history. What defines those two lines?"],
    },
  ],

  definitions: [
    { term: "fast-forward merge", definition: "A merge where Git simply moves the target branch pointer forward because there is no divergence — no new merge commit is created." },
    { term: "merge commit", definition: "A commit with two parents, created when two diverged branches are combined. The graph shows two lines converging to this point." },
    { term: "common ancestor", definition: "The most recent commit both branches share before they diverged — the starting point for a three-way merge." },
    { term: "--no-ff", definition: "Flag that forces a merge commit even when a fast-forward is possible, preserving a record that a feature branch was used." },
  ],
};

export default lesson;

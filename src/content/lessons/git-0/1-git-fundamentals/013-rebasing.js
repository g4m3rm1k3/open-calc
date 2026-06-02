const lesson = {
  id: "git-0-013",
  slug: "rebasing",
  chapter: "git-0",
  order: 13,
  title: "Rebasing",
  subtitle: "Rewriting history for a cleaner line",
  tags: ["git", "rebase", "linear-history", "base"],
  aliases: ["git rebase", "rebase branch", "linear history"],

  hook: `Rebasing takes your commits and replays them on top of a different base. The result is the same code as a merge — but with a perfectly linear, clean history. It's controversial because it rewrites commit hashes.`,

  mentalModel: [
    "`git rebase main` moves your branch's commits to start from the current tip of main — as if you'd branched off today instead of a week ago.",
    "Rebase rewrites commit history: every rebased commit gets a new SHA. This is why you must never rebase public/shared branches.",
    "After rebasing a feature branch onto main, a merge becomes a fast-forward — no merge commit, perfectly clean linear history.",
  ],

  intuition: {
    prose: [
      "**What rebase does.** You branched off `main` a week ago. Since then, main has had 5 new commits. Your feature branch has 3 commits. `git rebase main` detaches your 3 commits, advances your branch's starting point to the current tip of main, then replays your 3 commits on top — one by one. Each replayed commit gets a new hash (it's now based on different parent commits).",
      "**Rebase vs merge: the end result is the same code.** Both integrate your feature into main. The difference is purely in the history graph. Merge creates a fork-and-rejoin. Rebase creates a clean straight line. Neither approach is universally 'better' — it's a team convention.",
      "**The golden rule of rebasing.** Never rebase commits that have been pushed to a public/shared branch. If you rebase and force-push, anyone who pulled those original commits now has a diverged history and must do complicated reconciliation. Rebase only commits that are local-only or on a feature branch only you use.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Rebase rewrites hashes",
        body: "Every commit that gets rebased gets a new SHA-1 hash, even if the content is identical. The commit message, timestamp, author, and code changes are preserved — but the hash changes because the parent changed. This is why pushing a rebased branch requires `git push --force-with-lease`, which can cause problems for collaborators.",
      },
    ],
    visualizations: [
      {
        id: "GitWorkspace",
        mathBridge:
          "**Use this panel to set up the rebase scenario.** Create a feature branch (click the branch name → New Branch → `feature/rooms`), make 2 commits, then switch back to `main` and make 1 more commit. Now both branches have diverged. Switch to GitTerminal and run `git rebase main` from your feature branch. Come back here after — the Source Control panel shows your working tree is clean and the feature branch now sits ahead of main with no merge commit.",
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
        mathBridge:
          "**Practice rebasing in the terminal.**\n\n1. Create a feature branch: `git switch -c feature/rooms`\n2. Make 2 commits on it (edit a file, commit twice)\n3. Switch back to main: `git switch main`\n4. Make 1 commit on main\n5. Switch back: `git switch feature/rooms`\n6. Rebase: `git rebase main` — your feature commits move on top of main\n7. Inspect: `git log --oneline` — see the clean linear history\n\nIf a conflict occurs: edit the file, `git add <file>`, `git rebase --continue`.",
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
        mathBridge:
          "**Compare rebase vs merge in the graph.** After a merge, the graph shows a fork-and-rejoin — two parallel lanes meeting at a merge commit. After a rebase + fast-forward, the graph is a single straight line with no merge commit. Make commits on two branches, merge one way, compare visually. The code result is identical; only the history shape differs.",
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
      "**Rebase conflicts.** Like merge, rebase can encounter conflicts. But instead of one conflict resolution for the whole merge, rebase may pause at each individual commit that conflicts. Resolve the conflict, `git add` the files, then `git rebase --continue`. If you get stuck: `git rebase --abort` puts everything back.",
      "**`git rebase --onto`.** The advanced form: `git rebase --onto newbase oldbase branch` — replays commits from `oldbase..branch` onto `newbase`. Useful for surgically moving a subset of commits. Example: you accidentally started a feature off an old branch instead of main — `--onto` can fix the base without touching commits on the old branch.",
      "**Rebase and force-with-lease.** After rebasing a branch you've previously pushed, push with `git push --force-with-lease`. This force-pushes but refuses if someone else has pushed since your last fetch (unlike `--force` which blindly overwrites). Only safe if you're the sole author of the branch.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Rebase vs Merge Visually",
        body: "**Before (both):** `main: A - B - C` and `feature: A - B - D - E`\n\n**After merge:** `main: A - B - C - M` (M has parents C and E, D and E still exist)\n\n**After rebase + fast-forward merge:** `main: A - B - C - D' - E'` (D' and E' are new hashes replaying D and E's changes on top of C, perfectly linear)",
      },
    ],
  },

  examples: [
    {
      title: "Rebase feature branch before PR",
      body: "`git switch feature/auth`\n`git fetch origin`\n`git rebase origin/main` — replay commits on top of latest main\n`# resolve any conflicts at each step`\n`git push --force-with-lease` — update the remote branch\nNow when the PR is merged, it's a clean fast-forward.",
    },
    {
      title: "Rebase conflict recovery",
      body: "`git rebase main` → conflict on commit 2 of 4\n`# edit conflicted file`\n`git add conflicted-file.js`\n`git rebase --continue` → moves to next commit\n`# repeat until done or run git rebase --abort to cancel`",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-013-q1",
        type: "choice",
        text: "After `git rebase main`, what happens to the rebased commits?",
        options: [
          "They get merged into main immediately",
          "They are deleted and replaced by main's commits",
          "They get new SHA hashes, replayed on top of main's current tip",
          "They stay unchanged but main's pointer moves",
        ],
        answer:
          "They get new SHA hashes, replayed on top of main's current tip",
      },
      {
        id: "git0-013-q2",
        type: "choice",
        text: "The golden rule of rebasing is:",
        options: [
          "Always rebase instead of merge",
          "Never rebase commits that have been pushed to shared/public branches",
          "Only rebase if there are more than 5 commits",
          "Rebase before every `git push`",
        ],
        answer:
          "Never rebase commits that have been pushed to shared/public branches",
      },
      {
        id: "git0-013-q3",
        type: "choice",
        text: "You hit a conflict during rebase. After resolving the conflict files, what's next?",
        options: [
          "`git merge --continue`",
          "`git rebase --resolved`",
          "`git add <files>` then `git rebase --continue`",
          "`git commit` then `git rebase --continue`",
        ],
        answer: "`git add <files>` then `git rebase --continue`",
      },
    ],
  },
};

export default lesson;

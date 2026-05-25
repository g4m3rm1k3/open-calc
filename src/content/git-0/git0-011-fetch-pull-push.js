const lesson = {
  id: "git-0-011",
  slug: "fetch-pull-push",
  chapter: "git-0",
  order: 11,
  title: "Fetch, Pull & Push",
  subtitle: "Syncing with the remote",
  tags: ["git", "fetch", "pull", "push", "sync"],
  aliases: ["git push", "git pull", "git fetch", "sync remote"],

  hook: `Fetch, pull, and push are the three ways your local repo talks to the remote. They're similar but not the same — and confusing them can lead to accidental overwrites.`,

  mentalModel: [
    "`git fetch` downloads updates from the remote but doesn't touch your working files or branches — it's always safe.",
    "`git pull` fetches AND merges (or rebases) into your current branch — it changes your files.",
    "`git push` sends your local commits to the remote — it fails if the remote has commits you don't have locally.",
  ],

  intuition: {
    prose: [
      "**`git fetch`: download without changing anything.** `git fetch origin` downloads all new commits, branches, and tags from the remote and updates your remote-tracking branches (`origin/main`, etc.). Your local branches and working files are completely untouched. It's read-only — never harmful. Run it anytime to see what's new on the remote.",
      "**`git pull`: fetch + merge.** `git pull` is shorthand for `git fetch` followed by `git merge origin/main` (or the tracked branch). It downloads updates AND integrates them into your current branch. If there are conflicts, they appear exactly as in a normal merge. `git pull --rebase` uses rebase instead of merge for a cleaner linear history.",
      "**`git push`: send your commits.** `git push` sends commits from your local branch to the remote. It only succeeds if the remote doesn't have any commits your local branch doesn't have. If the remote is ahead (someone else pushed), Git rejects it: 'rejected — non-fast-forward'. The fix: pull first, then push.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Prefer fetch + merge over pull",
        body: "For clarity, many experienced developers run `git fetch` first, inspect with `git log origin/main`, then `git merge origin/main` deliberately. This separates 'seeing what changed' from 'applying it'. `git pull` is fine but hides the intermediate inspection step.",
      },
    ],
  },

  rigor: {
    prose: [
      "**Push rejection and force push.** If `git push` is rejected because the remote has new commits, you must fetch and integrate those commits first. `git push --force` (or `-f`) overwrites the remote history without merging. This is dangerous on shared branches — it erases teammates' commits. `git push --force-with-lease` is safer: it only force-pushes if no one else has pushed since your last fetch.",
      "**Tracking configuration.** `git push -u origin feature/nav` pushes and sets the upstream tracking. After that, `git push` on that branch knows where to go without specifying. `git branch -vv` shows each branch's tracking relationship and whether it's ahead, behind, or diverged from the remote.",
      "**`git pull --rebase`.** Instead of creating a merge commit, `git pull --rebase` rebases your local commits on top of the remote commits. This keeps history linear. Set it as default: `git config --global pull.rebase true`. If you've pushed the commits being rebased, don't rebase — you'd need to force push.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Never force push to shared branches",
        body: "`git push --force` on `main` or any shared branch rewrites the remote history. Anyone who has fetched those commits will have a diverged repo and will need to manually reconcile. Reserve `--force` for your own feature branches that only you work on.",
      },
    ],
  },

  examples: [
    {
      title: "Safe sync workflow",
      body: "`git fetch origin` — download updates\n`git log origin/main --oneline` — see what's new on remote\n`git merge origin/main` — integrate if everything looks good\n`git push` — send your commits",
    },
    {
      title: "Handling a rejected push",
      body: "`git push` → rejected (remote has new commits)\n`git pull --rebase` — fetch and rebase your commits on top\n`git push` — now succeeds (clean linear history)",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-011-q1",
        type: "choice",
        text: "What does `git fetch` do to your working files?",
        options: [
          "Updates them to match the remote",
          "Nothing — it only updates remote-tracking branches",
          "Stages all remote changes for commit",
          "Creates new local branches for each remote branch",
        ],
        answer: "Nothing — it only updates remote-tracking branches",
      },
      {
        id: "git0-011-q2",
        type: "choice",
        text: "Your `git push` is rejected with 'non-fast-forward'. This means:",
        options: [
          "Your local commits have a syntax error",
          "You don't have permission to push",
          "The remote has commits you don't have locally",
          "Your branch is behind by more than 100 commits",
        ],
        answer: "The remote has commits you don't have locally",
      },
      {
        id: "git0-011-q3",
        type: "choice",
        text: "`git pull --rebase` differs from `git pull` because it:",
        options: [
          "Downloads changes faster",
          "Rebases your commits on top of remote commits instead of creating a merge commit",
          "Pulls all branches, not just the current one",
          "Automatically resolves conflicts",
        ],
        answer: "Rebases your commits on top of remote commits instead of creating a merge commit",
      },
    ],
  },
};

export default lesson;

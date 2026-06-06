const lesson = {
  id: "git-0-010",
  slug: "merging",
  chapter: "git-0",
  order: 10,
  title: "Merging",
  subtitle: "Bringing branches back together",
  tags: ["git", "merge", "fast-forward", "three-way-merge"],
  aliases: ["git merge", "merge branches", "combine branches"],

  hook: `You built a feature on a branch. Now you need it in main. Merging combines two lines of development — and Git is very good at it, most of the time.`,

  mentalModel: [
    "Fast-forward merge: no new commit needed — Git just moves the branch pointer forward when there's no divergence.",
    "Three-way merge: Git creates a new merge commit with two parents when both branches have diverged.",
    "The merge direction matters: you merge INTO the branch you're currently on.",
  ],

  intuition: {
    prose: [
      "**The merge direction.** You merge *into* the branch you're currently on. To bring a feature into main: `git switch main`, then `git merge feature/login`. Git incorporates all the commits from `feature/login` into `main`. The `feature/login` branch is not changed.",
      "**Fast-forward merges.** If main hasn't changed since you branched, Git just moves the `main` pointer to the tip of the feature branch. No new commit is created — the history is perfectly linear. This is a fast-forward merge. You'll see: 'Fast-forward' in the output.",
      "**Three-way merges.** If both branches have new commits since they diverged, Git uses the common ancestor commit plus the tips of both branches to compute a merge. It creates a new 'merge commit' with two parents. The commit message usually defaults to 'Merge branch feature/login into main'. History shows a fork that rejoins.",
    ],
    callouts: [
      {
        type: "tip",
        title: "No-FF merge",
        body: "`git merge --no-ff feature/login` forces a merge commit even when a fast-forward is possible. This preserves a clear record that a feature branch existed. Many teams enforce this for feature branches so history shows when each feature was integrated.",
      },
    ],
  },

  rigor: {
    prose: [
      "**How Git finds the merge base.** Git walks backward from both branch tips to find the most recent common ancestor (the merge base). It then performs a three-way merge: computes what changed between the base and branch A, and what changed between the base and branch B. Where both have changed the same region, you have a conflict.",
      "**Merge strategies.** Git supports multiple merge strategies: `recursive` (default for two-branch merges), `ours` (ignore all changes from the other branch), `octopus` (merge more than two branches at once). The `recursive` strategy uses a modified three-way merge that handles renames and can merge with multiple common ancestors.",
      "**`--squash` merge.** `git merge --squash feature/login` takes all the commits from the feature branch and squashes them into staged changes without creating a merge commit. You then write your own single commit. The feature branch is not recorded as merged. Useful for cleaning up messy feature branch history before integrating.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Merge Commit",
        body: "A merge commit is a commit with **two parents** — one from each branch. When you look at `git log --graph`, merge commits appear as the point where two lines of history converge. The commit records the fact that two lines of development were combined at this point.",
      },
    ],
  },

  examples: [
    {
      title: "Standard feature branch merge",
      body: "`git switch main`\n`git merge feature/user-auth`\n`git branch -d feature/user-auth` — clean up the branch\n`git push` — push updated main",
    },
    {
      title: "Force a merge commit for cleaner history",
      body: "`git merge --no-ff feature/search` — even if fast-forward is possible, creates a merge commit. Your log will show that feature/search was merged as a unit, not just appended.",
    },
  ],

  quiz: [
    {
      id: "git0-010-q1",
      type: "choice",
      text: "You're on main. You want to bring feature/nav into main. What do you run?",
      options: [
        "`git merge main feature/nav`",
        "`git merge feature/nav`",
        "`git switch feature/nav && git merge main`",
        "`git pull feature/nav`",
      ],
      answer: "`git merge feature/nav`",
      hints: ["You merge INTO the branch you're on. You're on main — so you name the source."],
    },
    {
      id: "git0-010-q2",
      type: "choice",
      text: "A fast-forward merge happens when:",
      options: [
        "The branches have conflicting changes",
        "The target branch has no new commits since the feature branch was created",
        "You use the `--fast` flag",
        "Only one file was changed",
      ],
      answer: "The target branch has no new commits since the feature branch was created",
      hints: ["If main hasn't moved, there's nothing to 'combine' — Git just moves the pointer forward."],
    },
    {
      id: "git0-010-q3",
      type: "choice",
      text: "A merge commit is special because:",
      options: [
        "It contains all the changes from both branches combined",
        "It has two parent commits instead of one",
        "It automatically resolves all conflicts",
        "It can only be created with the --merge flag",
      ],
      answer: "It has two parent commits instead of one",
      hints: ["Two branches converge at one point. How does a commit record which two lines it came from?"],
    },
  ],

  definitions: [
    { term: "merge base", definition: "The most recent common ancestor commit of two branches — the reference point Git uses for a three-way merge." },
    { term: "squash merge", definition: "`git merge --squash` collapses all commits from the source branch into staged changes without creating a merge commit. You then write one clean commit." },
    { term: "merge strategy", definition: "The algorithm Git uses to combine branches. The default `recursive` strategy handles renames and multiple common ancestors." },
  ],
};

export default lesson;

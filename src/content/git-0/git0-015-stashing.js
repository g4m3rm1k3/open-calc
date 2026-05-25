const lesson = {
  id: "git-0-015",
  slug: "stashing",
  chapter: "git-0",
  order: 15,
  title: "Stashing Work",
  subtitle: "Set it aside and come back later",
  tags: ["git", "stash", "wip", "context-switch"],
  aliases: ["git stash", "save work", "stash changes", "set aside"],

  hook: `You're in the middle of a feature when a critical bug comes in. Your changes aren't ready to commit. You can't switch branches with uncommitted work that conflicts. Enter the stash — a temporary shelf for work in progress.`,

  mentalModel: [
    "`git stash` saves your current dirty working directory and staging area onto a stack, then gives you a clean working tree.",
    "`git stash pop` restores the most recently stashed changes and removes the stash entry.",
    "Stash is a temporary holding area — not a substitute for commits. Don't leave important work stashed for long.",
  ],

  intuition: {
    prose: [
      "**What stash does.** `git stash` (or `git stash push`) takes all modified tracked files and staged changes, stores them in a hidden location, and restores your working directory to match HEAD. You're left with a clean working tree — free to switch branches, pull updates, or work on the urgent bug.",
      "**Getting your work back.** `git stash pop` restores the most recent stash to your working directory and removes it from the stash stack. `git stash apply` restores it but keeps the stash entry (useful if you want to apply it to multiple branches). If there are conflicts when applying, Git pauses just like a merge conflict.",
      "**Multiple stashes.** You can have multiple stashes. `git stash list` shows them all, numbered: `stash@{0}` (most recent), `stash@{1}`, etc. `git stash pop stash@{2}` applies a specific one. `git stash drop stash@{1}` deletes a specific stash without applying it. `git stash clear` deletes all stashes.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Name your stashes",
        body: "`git stash push -m \"WIP: search feature UI\"` saves the stash with a descriptive name, making `git stash list` readable when you have multiple stashes. Without a name they just show the branch name and last commit message, which is often not enough context.",
      },
    ],
  },

  rigor: {
    prose: [
      "**What stash doesn't include by default.** By default, `git stash` saves modified tracked files and staged changes, but NOT untracked files and NOT ignored files. Add `-u` (or `--include-untracked`) to also stash untracked files. Add `-a` (or `--all`) to include ignored files too.",
      "**Stash is a stack of commits.** Internally, `git stash push` creates two commit objects (one for staged changes, one for unstaged) and stores them in `refs/stash`. `git stash list` shows these. Since they're commits, `git show stash@{0}` shows a diff of the stashed changes.",
      "**Stash apply on a different branch.** You can stash on one branch and `git stash apply` on a different branch. Git tries to apply the changes — conflicts may arise if the branches have diverged significantly. This is a lightweight way to move work-in-progress to a new branch.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Stash Commands",
        body: "`git stash` or `git stash push` — save current dirty state\n`git stash push -m \"name\"` — save with description\n`git stash push -u` — also include untracked files\n`git stash list` — see all stash entries\n`git stash pop` — apply most recent and remove from stack\n`git stash apply stash@{N}` — apply specific stash, keep in stack\n`git stash drop stash@{N}` — delete without applying\n`git stash clear` — delete all stashes",
      },
    ],
  },

  examples: [
    {
      title: "Classic interrupt workflow",
      body: "`# Mid-feature, urgent bug reported`\n`git stash push -m \"WIP: user settings page\"`\n`git switch main && git switch -c hotfix/payment-null`\n`# Fix bug, commit, merge, push`\n`git switch feature/user-settings`\n`git stash pop` — pick up exactly where you left off",
    },
    {
      title: "Save untracked files too",
      body: "`git stash push -u -m \"WIP: new onboarding files\"`\nWithout `-u`, brand new files you haven't committed yet would be left in the working directory when stashing.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-015-q1",
        type: "choice",
        text: "You run `git stash`. What happens to your working directory?",
        options: [
          "Changes are committed to a temp branch",
          "Changes are backed up to the cloud",
          "Modified tracked files and staged changes are saved, and the working tree is cleaned to HEAD",
          "All files including untracked ones are deleted",
        ],
        answer: "Modified tracked files and staged changes are saved, and the working tree is cleaned to HEAD",
      },
      {
        id: "git0-015-q2",
        type: "choice",
        text: "`git stash pop` vs `git stash apply` — the difference is:",
        options: [
          "Pop works on the most recent; apply requires a specific stash number",
          "Pop applies and removes the stash entry; apply applies but keeps the entry",
          "Apply applies to the current branch; pop applies to main",
          "They are identical",
        ],
        answer: "Pop applies and removes the stash entry; apply applies but keeps the entry",
      },
      {
        id: "git0-015-q3",
        type: "choice",
        text: "You have new files (untracked) that you want to include in the stash. What flag do you use?",
        options: [
          "`git stash --tracked`",
          "`git stash -n`",
          "`git stash -u`",
          "`git stash --new`",
        ],
        answer: "`git stash -u`",
      },
    ],
  },
};

export default lesson;

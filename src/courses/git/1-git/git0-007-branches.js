const lesson = {
  id: "git-0-007",
  slug: "branches",
  chapter: "git-0",
  order: 7,
  title: "Branches",
  subtitle: "Parallel lines of development",
  tags: ["git", "branch", "switch", "checkout"],
  aliases: ["git branch", "create branch", "switch branch", "git checkout"],

  hook: `A branch is just a pointer. That's literally all it is — a 40-character file containing a commit hash. Understanding this removes the mystery from every branch command.`,

  mentalModel: [
    "A branch is just a lightweight pointer to a commit — creating a branch costs almost nothing and takes less than a millisecond.",
    "`git switch -c <name>` creates a new branch AND moves to it. `git switch <name>` moves to an existing branch.",
    "When you commit on a branch, the branch pointer automatically advances to the new commit. Other branches don't move.",
  ],

  intuition: {
    prose: [
      "**Branches are just labels.** In most version control systems, branches copy files. In Git, a branch is a 41-byte text file containing a single commit hash. Creating a branch: `git branch feature/login`. Switching to it: `git switch feature/login`. Or both at once: `git switch -c feature/login`. The cost of creating a Git branch is negligible.",
      "**Each branch has its own timeline.** After branching, commits on `feature/login` don't affect `main` and vice versa. You can work on a risky experiment without touching your stable code. If the experiment fails, delete the branch: `git branch -d feature/login`. Nothing else is affected.",
      "**`HEAD` points to your branch, your branch points to a commit.** `HEAD` is a special pointer that says 'this is where you are'. Normally HEAD → branch → commit. When you commit, the branch pointer moves forward automatically. `git log` shows commits reachable from wherever HEAD currently points.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Useful branch commands",
        body: "`git branch` — list all local branches (current branch marked with *)\n`git branch -a` — list local and remote branches\n`git branch -d name` — delete branch (safe, refuses if unmerged)\n`git branch -D name` — force delete (even if unmerged)\n`git branch -m old new` — rename a branch\n`git switch -` — switch back to the previous branch",
      },
    ],
  },

  rigor: {
    prose: [
      "**What's in `.git/refs/heads/`.** Every local branch has a file in `.git/refs/heads/`. For example, `.git/refs/heads/main` contains one line: a 40-char SHA-1 hash. That's the entire branch — a pointer to a commit. HEAD itself is `.git/HEAD`, which normally contains `ref: refs/heads/main` — a symbolic reference to a branch.",
      "**Detached HEAD.** If you run `git checkout <commit-hash>` (or `git switch --detach <hash>`), HEAD points directly to a commit, not a branch. New commits you make exist but no branch tracks them. If you switch branches, those commits become unreachable (orphaned). Always create a branch before committing in this state: `git switch -c rescue-work`.",
      "**Branch naming conventions.** Common patterns: `feature/user-auth`, `bugfix/login-redirect`, `hotfix/payment-crash`, `release/v2.3`. Slashes create visual grouping in many tools. Names cannot contain spaces, `..`, or special shell characters. Remote-tracking branch names (`origin/main`) are managed automatically by Git.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Detached HEAD",
        body: "If `git status` says 'HEAD detached at abc1234', you're not on any branch. Any commits you make can be lost when you switch. Run `git switch -c new-branch-name` immediately to create a branch and save your work.",
      },
    ],
  },

  examples: [
    {
      title: "Feature branch workflow",
      body: "`git switch main` — start from main\n`git switch -c feature/search` — create and switch\n`# make changes, commits...`\n`git switch main` — return to main\n`# feature/search stays unchanged until you merge`",
    },
    {
      title: "Rename the default branch",
      body: "`git branch -m master main` — rename local branch\n`git push origin -u main` — push renamed branch\n`git push origin --delete master` — delete old remote branch",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-007-q1",
        type: "choice",
        text: "What does `git switch -c feature/nav` do?",
        options: [
          "Switches to an existing branch called feature/nav",
          "Creates a branch called feature/nav and switches to it",
          "Copies the current branch into feature/nav",
          "Connects to a remote called feature/nav",
        ],
        answer: "Creates a branch called feature/nav and switches to it",
      },
      {
        id: "git0-007-q2",
        type: "choice",
        text: "A Git branch is fundamentally:",
        options: [
          "A copy of all files at a point in time",
          "A folder containing the branch's commits",
          "A pointer (file with a commit hash) to a commit",
          "A compressed archive of the working directory",
        ],
        answer: "A pointer (file with a commit hash) to a commit",
      },
      {
        id: "git0-007-q3",
        type: "choice",
        text: "You're in 'detached HEAD' state. What should you do before making commits?",
        options: [
          "Nothing — commits in detached HEAD are saved automatically",
          "Run `git attach HEAD`",
          "Run `git switch -c new-branch-name` to create a branch",
          "Run `git commit --attach` to re-attach",
        ],
        answer: "Run `git switch -c new-branch-name` to create a branch",
      },
    ],
  },
};

export default lesson;

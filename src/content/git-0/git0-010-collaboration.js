const lesson = {
  id: "git-0-010",
  slug: "working-as-a-team",
  chapter: "git-0",
  order: 10,
  title: "The Collaboration Workflow",
  subtitle: "How real teams use Git together",
  tags: [
    "git",
    "collaboration",
    "pull request",
    "feature branch",
    "workflow",
    "open source",
  ],
  aliases: [
    "pull request",
    "PR",
    "feature branch workflow",
    "code review",
    "fork",
    "contribute",
  ],

  hook: `Your teammate opened a pull request. Three files changed, two commits, a description of what they built and why. You read the diff, leave a comment about one edge case, they push a fix, you approve, and the code merges to main. Nothing broke. Nobody stepped on each other's work. That's the feature branch workflow — the collaboration pattern used by virtually every software team on the planet.`,

  mentalModel: [
    "`main` is always deployable. Nobody pushes directly to it. All work happens on branches; finished, reviewed work merges in via pull request.",
    "A pull request is not a Git command — it's a GitHub/GitLab feature. It's a proposal to merge a branch, shown as a web page with the diff, comments, and CI results visible to the whole team.",
    "Keep branches short-lived and PRs small. A PR touching 5 files ships today. A PR touching 50 files ships when everyone finally gets around to reading it.",
  ],

  intuition: {
    prose: [
      "The feature branch workflow has one rule everything else depends on: `main` is always in a working state. If broken code lands on `main`, every teammate's next `git pull` brings the problem home. The pull request gate — review, CI tests, approval before merge — is what makes this rule actually hold up under real team conditions.",
      "The lifecycle of a feature in practice: branch from main (`git checkout -b add-save-system`), work and commit freely, push the branch to share it (`git push -u origin add-save-system`), open a pull request on GitHub pointing that branch at main. Teammates read the diff, leave code review comments. You push new commits to address feedback — the PR updates automatically. Once approved, merge on GitHub. Delete the feature branch. Pull main locally to get the merged result. Start the next branch.",
      "While your feature branch is open, main keeps moving — other PRs merge, other fixes land. After a few days your branch can be a dozen commits behind. The fix before opening your PR: `git checkout main && git pull && git checkout add-save-system && git merge main`. You bring main's latest into your branch, resolve any conflicts there, and push. Now your PR merges cleanly.",
      "Simulate the workflow here. Create a `feature` branch, make two or three commits representing distinct steps of a feature. Then switch back to `main` and make a commit there (simulating a teammate's work landing while you were building). Merge `feature` into `main`. Read the resulting graph — two parallel histories converging at the merge commit. That V shape in the graph is what a PR merge looks like in the commit history.",
    ],
    visualizations: [
      {
        id: "GitWorkspace",
        mathBridge:
          "**This multi-branch graph is what GitHub's commit history and GitKraken's central panel both show** — branches as parallel lanes, merges as convergence points.\n\nThe full terminal workflow for a feature branch:\n```\ngit checkout main && git pull          # start from latest main\ngit checkout -b my-feature             # create branch\n# ... commit your work ...\ngit push -u origin my-feature          # push and set upstream\n# (open PR on GitHub, get reviewed and approved)\ngit checkout main && git pull          # get the merged result\ngit branch -d my-feature               # delete local branch\n```\n\nIn VS Code: use the Source Control panel's branch picker in the bottom status bar. The GitHub Pull Requests extension (by GitHub) adds a PR panel directly in VS Code — you can create, review, and merge PRs without leaving the editor.",
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
            "README.md":
              "# Dungeon Explorer\n\nA text-based dungeon game.\n\n## Setup\n\nClone the repo and run `npm start`.",
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Forking for open source.** When contributing to a project you don't own, you can't push branches to their repository. Instead, fork it — GitHub creates a full copy in your account. Clone your fork, make a branch, push to your fork, open a PR from your fork's branch into the original project's `main`. When the original project gets updates you want, add it as a second remote: `git remote add upstream https://github.com/ORIGINAL/project.git`. Then `git fetch upstream && git merge upstream/main` to update your fork.",
      "**`git rebase` as an alternative to merge for branch updates.** Some teams use `git rebase main` instead of `git merge main` when updating a feature branch. Rebase replays your commits on top of the latest main, one by one, producing a linear history with no merge commits. The result reads like you wrote your feature after all of main's recent changes, even though you did it in parallel. Trade-off: rebase rewrites commit hashes, so it's only safe on branches nobody else is pushing to.",
      "**Branch protection rules enforce the workflow.** On GitHub, teams configure protection for `main`: require at least one review approval before merging, require all CI checks to pass, prevent direct pushes even from admins. These rules are platform features, not Git features — but they're what makes the 'main is always deployable' rule actually hold under team conditions. Setting them up takes five minutes in the repository Settings → Branches page.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Small PRs ship faster and get better reviews",
        body: "A PR touching 5 files gets a real, thoughtful review. A PR touching 50 files gets 'LGTM' after a 30-second skim. If your feature is large, break it into multiple PRs that each do one coherent thing — build the data model, then the API, then the UI. Each merges independently and ships sooner.",
      },
    ],
  },

  examples: [
    {
      title: "Complete feature branch workflow",
      body: "# Start from fresh main\ngit checkout main\ngit pull\n\n# Create your feature branch\ngit checkout -b add-inventory-system\n\n# Work and commit\ngit add inventory.js\ngit commit -m 'Add inventory data structure'\ngit commit -m 'Add item pickup logic'\n\n# Push branch to remote for backup and PR\ngit push -u origin add-inventory-system\n\n# (Open PR on GitHub, get reviewed, approved)\n\n# After PR is merged on GitHub:\ngit checkout main\ngit pull               # picks up the merged commits\ngit branch -d add-inventory-system   # clean up local branch",
    },
    {
      title: "Keep your branch up to date with main",
      body: "# While working on your branch, main moved forward\ngit checkout main\ngit pull                    # get latest main\ngit checkout add-inventory-system\ngit merge main              # bring main's changes into your branch\n# Resolve any conflicts, then push\ngit push",
    },
    {
      title: "Contributing to open source (fork workflow)",
      body: "# 1. Fork the repo on GitHub (click Fork button)\n\n# 2. Clone your fork\ngit clone https://github.com/YOU/project.git\ncd project\n\n# 3. Add original as 'upstream' remote\ngit remote add upstream https://github.com/ORIGINAL/project.git\n\n# 4. Create a feature branch from upstream main\ngit fetch upstream\ngit checkout -b fix-typo upstream/main\n\n# 5. Make changes, commit, push to YOUR fork\ngit push -u origin fix-typo\n\n# 6. Open PR from your fork's branch → original/main on GitHub",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-010-q1",
        type: "choice",
        text: "In the feature branch workflow, why does nobody commit directly to `main`?",
        options: [
          "Git technically prevents it with a lock",
          "main is reserved for the team lead only",
          "main should always be deployable, and direct commits skip review and testing",
          "Committing to main is slower than committing to a branch",
        ],
        answer:
          "main should always be deployable, and direct commits skip review and testing",
      },
      {
        id: "git0-010-q2",
        type: "choice",
        text: "What is the difference between `git fetch` and `git pull`?",
        options: [
          "fetch downloads commits but doesn't merge them; pull downloads and merges",
          "fetch is for remotes; pull is for local branches",
          "fetch merges immediately; pull asks for confirmation first",
          "There is no difference — they are aliases for each other",
        ],
        answer:
          "fetch downloads commits but doesn't merge them; pull downloads and merges",
      },
      {
        id: "git0-010-q3",
        type: "choice",
        text: "What is a fork?",
        options: [
          "A branch that has been deleted on the remote",
          "A copy of the entire repository in your own GitHub account",
          "A merge commit with three or more parents",
          "A Git command for splitting history",
        ],
        answer: "A copy of the entire repository in your own GitHub account",
      },
    ],
  },
};

export default lesson;

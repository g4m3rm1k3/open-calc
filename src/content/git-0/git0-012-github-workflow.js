const lesson = {
  id: "git-0-012",
  slug: "github-workflow",
  chapter: "git-0",
  order: 12,
  title: "The GitHub Workflow",
  subtitle: "Fork, pull request, and code review",
  tags: ["git", "github", "pull-request", "fork", "code-review"],
  aliases: ["pull request", "PR", "fork", "github workflow", "open source"],

  hook: `Every major open-source project and most professional teams use the same pattern: you never push directly to the main branch. You propose changes through a pull request — and that process is the backbone of collaborative software development.`,

  mentalModel: [
    "A pull request (PR) is not a Git concept — it's a GitHub/GitLab feature. It's a proposal to merge one branch into another, plus a conversation thread for review.",
    "The protected-main workflow: no one commits directly to main. All work happens on branches and enters main through reviewed PRs.",
    "Fork = your copy of someone else's repo. PR from fork = the standard way to contribute to a project you don't own.",
  ],

  intuition: {
    prose: [
      "**The feature-branch PR workflow.** Create a branch (`git switch -c feature/auth`), do your work, push the branch (`git push -u origin feature/auth`), open a PR on GitHub from `feature/auth` → `main`. Teammates review, leave comments, you push more commits to address feedback, someone approves, the branch is merged. Delete the branch. Repeat.",
      "**Why PRs exist.** PRs provide: a diff to review before merging, a comment thread for discussion, automated CI checks (tests, linting) that run before merge, a permanent record of why changes were made (the PR description), and a gatekeeping mechanism so only reviewed code enters `main`.",
      "**Forking vs branching.** If you have write access to a repo, work on branches. If you don't (open-source projects you don't own), fork the repo to your GitHub account, clone your fork, create a branch, push to your fork, open a PR from your fork's branch to the original repo's main. This is how all external contributions work.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Draft PRs",
        body: "Open a PR as a draft to share work-in-progress. Draft PRs can't be merged until marked ready for review. Useful for getting early feedback on an approach without full review overhead. Mark ready when you want reviewers to approve.",
      },
    ],
  },

  rigor: {
    prose: [
      "**PR best practices.** Keep PRs small — under 200 lines changed is ideal. Large PRs are hard to review and take longer. A PR should do ONE thing. Write a clear description: what changed, why, how to test it. Link to the issue it resolves. If the PR is large, add a comment explaining the architecture first.",
      "**Keeping your branch up to date.** While you're working on a feature, main may advance. Before opening a PR: `git fetch origin`, then either `git merge origin/main` (merge approach) or `git rebase origin/main` (cleaner linear history). Resolve any conflicts. Most teams prefer rebase for feature branches before PR.",
      "**Squash and merge.** GitHub offers 'Squash and merge' which collapses all commits in a PR into one commit on main. This keeps main history clean — one commit per feature, rather than all the messy 'WIP', 'fix typo', 'actually fix it' commits from development.",
    ],
    callouts: [
      {
        type: "definition",
        title: "PR / MR Terminology",
        body: "GitHub calls them **Pull Requests** (PRs). GitLab calls them **Merge Requests** (MRs). Bitbucket calls them **Pull Requests**. They're all the same concept: a request to merge one branch into another, with a review interface. The name 'pull request' comes from asking the maintainer to *pull* your changes.",
      },
    ],
  },

  examples: [
    {
      title: "Complete feature PR flow",
      body: "`git switch main && git pull` — start from latest main\n`git switch -c feature/search` — create branch\n`# make changes and commits`\n`git push -u origin feature/search` — push branch\n`# open PR on GitHub from feature/search → main`\n`# address review comments with more commits`\n`git push` — push updates to PR\n`# PR approved and merged on GitHub`\n`git switch main && git pull` — update local main\n`git branch -d feature/search` — clean up local branch",
    },
    {
      title: "Fork and contribute",
      body: "`# Fork on GitHub UI → click Fork`\n`git clone git@github.com:you/forked-repo.git`\n`git remote add upstream git@github.com:original/repo.git`\n`git switch -c fix/typo-in-readme`\n`# make changes`\n`git push -u origin fix/typo-in-readme`\n`# open PR on GitHub from your fork to original repo`",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-012-q1",
        type: "choice",
        text: "A pull request is primarily:",
        options: [
          "A Git command that pulls from remote",
          "A GitHub/GitLab feature for proposing and reviewing branch merges",
          "A way to download someone else's code",
          "A request for someone to push to your branch",
        ],
        answer: "A GitHub/GitLab feature for proposing and reviewing branch merges",
      },
      {
        id: "git0-012-q2",
        type: "choice",
        text: "When contributing to a repo you don't own, you should:",
        options: [
          "Ask the owner to add you as a collaborator first",
          "Push directly to main",
          "Fork the repo, clone your fork, branch, push, and open a PR",
          "Use `git request-pull`",
        ],
        answer: "Fork the repo, clone your fork, branch, push, and open a PR",
      },
      {
        id: "git0-012-q3",
        type: "choice",
        text: "'Squash and merge' on a PR means:",
        options: [
          "Force pushing over the target branch",
          "All commits in the PR are combined into one commit on main",
          "The PR is closed without merging",
          "All merge conflicts are auto-resolved",
        ],
        answer: "All commits in the PR are combined into one commit on main",
      },
    ],
  },
};

export default lesson;

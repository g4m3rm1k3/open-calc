const lesson = {
  id: "git-0-020",
  slug: "git-workflows",
  chapter: "git-0",
  order: 20,
  title: "Git Workflows",
  subtitle: "How teams organize collaboration",
  tags: [
    "git",
    "workflow",
    "gitflow",
    "trunk-based",
    "github-flow",
    "branching strategy",
  ],
  aliases: [
    "git workflow",
    "branching strategy",
    "gitflow",
    "trunk based development",
    "github flow",
  ],

  hook: `Everyone on your team knows the same git commands. The difference between a smooth team and a chaotic one is how they've agreed to use those commands. A workflow is that agreement.`,

  mentalModel: [
    "GitHub Flow: branch off main → open PR → merge. Simple, works for continuous deployment. Best for most teams.",
    "Gitflow: main + develop + feature + release + hotfix branches. Structured, powerful, but complex. Best for versioned software releases.",
    "Trunk-based development: everyone commits directly to main (or short-lived branches), using feature flags for incomplete work. Best for large teams with strong CI/CD.",
  ],

  intuition: {
    prose: [
      "**GitHub Flow.** The simplest team workflow: (1) branch off main for each feature or fix, (2) commit and push the branch, (3) open a Pull Request, (4) get review and CI approval, (5) merge to main, (6) deploy. Main is always deployable. No long-lived branches except main. This is what most small to medium teams should use.",
      "**Gitflow.** Designed by Vincent Driessen in 2010 for software with versioned releases. Two permanent branches: `main` (production-ready) and `develop` (integration). Feature branches merge into `develop`. When develop is stable, a `release` branch is cut, tested, then merged into both `main` and `develop`. Hotfixes branch off `main` and merge back into both. Complex but gives precise control over what goes into each release.",
      "**Trunk-based development.** All developers commit to `main` (the 'trunk') directly or via very short-lived feature branches (< 1 day). Features that aren't ready are hidden behind feature flags, not isolated in branches. Requires strong automated testing and CI/CD. This is how Google and Meta operate at scale.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Which workflow should you use?",
        body: "**1-5 developers, continuous deployment:** GitHub Flow — simple, fast, works great.\n**Team releasing versioned software (apps, packages):** Gitflow — gives you structured release management.\n**50+ developers with strong CI/CD:** Trunk-based development — prevents merge hell at scale.\n\nMost teams are better off with GitHub Flow than Gitflow. Gitflow's complexity is often overkill and creates long-lived branches that drift apart.",
      },
    ],
    visualizations: [
      {
        id: "GitWorkspace",
        mathBridge:
          "**Practice the GitHub Flow entirely from the panel.** This is the workflow your team actually uses day-to-day: (1) click the branch name at the bottom → New Branch → `feature/inventory` (2) edit `game-design.txt` to add the feature (3) stage and commit (4) click the branch name → switch to `main` (5) from `main`, merge the feature branch in. The Source Control panel is how most developers run this workflow without touching the terminal. Use GitTerminal to inspect the final `git log --graph` after to see the shape it produced.",
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
          "**Simulate the GitHub Flow in the terminal** — the workflow used by most modern teams.\n\n1. `git switch main && git pull` — start from the latest main\n2. `git switch -c feature/inventory-system` — branch for your feature\n3. Make 2-3 focused commits (edit files, `git add`, `git commit -m '...'`)\n4. `git switch main` — go back to main\n5. `git merge feature/inventory-system` — merge your feature (fast-forward)\n6. `git branch -d feature/inventory-system` — delete the feature branch\n7. `git log --oneline --graph` — see the clean linear history\n\nThat's it. No special commands, no ceremony — just short-lived branches that merge back to main frequently.",
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
          "**The graph shows workflow shape.** GitHub Flow creates short branches that merge back quickly — the graph stays close to a single lane. Gitflow creates parallel long-lived branches (`develop`, `release/1.x`, `hotfix/`) that diverge and converge with structure. Trunk-based development barely has branches — almost everything commits directly to main. Create commits and branches here to see how the graph shape reflects the workflow philosophy.",
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
      "**Forking workflow.** Standard for open source. Maintainers own the canonical repo. Contributors fork it (get their own full copy on GitHub), clone their fork, create a branch, push to their fork, open a PR to the original repo. Maintainers never give strangers write access to the canonical repo. You can also contribute to forks you don't own by adding them as remotes.",
      "**Branch naming conventions.** Good conventions prevent confusion: `feature/user-auth`, `fix/null-pointer-login`, `hotfix/v2.0.1-security-patch`, `release/v3.0.0`, `chore/update-dependencies`. Prefix tells you the type at a glance. Most teams automate enforcement with branch protection rules.",
      "**Merge strategies and workflows.** Merge commit (`--no-ff`) preserves branch history — you can see feature branches in the DAG. Squash merge collapses all feature commits into one on main — cleaner linear history. Rebase merge (GitHub's 'rebase and merge') puts feature commits directly on main linearly. GitHub Flow typically uses squash or rebase. Gitflow uses merge commits to preserve release structure.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Workflow Comparison",
        body: "**GitHub Flow** — main only, feature branches, PRs, continuous deploy. Simple.\n**Gitflow** — main + develop + feature/release/hotfix. Complex, for versioned releases.\n**Trunk-based** — commit to main, feature flags, strong CI. For large teams.\n**Forking** — contributors fork, PR to upstream. For open source.\n\nStart with GitHub Flow. Upgrade to Gitflow only if you genuinely need structured release management.",
      },
    ],
  },

  examples: [
    {
      title: "GitHub Flow day-to-day",
      body: "`git switch main && git pull` — start fresh\n`git switch -c feature/add-dark-mode` — branch for work\n`# Make commits`\n`git push -u origin feature/add-dark-mode` — push branch\n`# Open PR on GitHub → get review → CI passes`\n`# Squash and merge on GitHub`\n`git switch main && git pull` — sync after merge\n`git branch -d feature/add-dark-mode` — clean up locally",
    },
    {
      title: "Gitflow hotfix",
      body: '`git switch main && git pull` — critical bug found in production\n`git switch -c hotfix/fix-payment-crash` — branch from main\n`# Fix and commit`\n`git switch main && git merge --no-ff hotfix/fix-payment-crash`\n`git tag -a v2.0.1 -m "Hotfix: payment crash"` — tag the fix\n`git switch develop && git merge --no-ff hotfix/fix-payment-crash` — back-port the fix\n`git branch -d hotfix/fix-payment-crash`',
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-020-q1",
        type: "choice",
        text: "GitHub Flow is best described as:",
        options: [
          "Branch off main, PR, merge — always keep main deployable",
          "Multiple long-lived branches: main, develop, release, hotfix",
          "Everyone commits directly to main with no branches",
          "Each developer forks the repo and PRs to upstream",
        ],
        answer: "Branch off main, PR, merge — always keep main deployable",
      },
      {
        id: "git0-020-q2",
        type: "choice",
        text: "Gitflow's `develop` branch serves as:",
        options: [
          "The production branch",
          "An integration branch where features accumulate before a release",
          "The branch used to create hotfixes",
          "A mirror of main for backup purposes",
        ],
        answer:
          "An integration branch where features accumulate before a release",
      },
      {
        id: "git0-020-q3",
        type: "choice",
        text: "Trunk-based development handles incomplete features using:",
        options: [
          "Long-lived feature branches kept out of main",
          "Feature flags that hide unfinished work at runtime",
          "Draft commits that won't execute",
          "A separate staging branch before main",
        ],
        answer: "Feature flags that hide unfinished work at runtime",
      },
    ],
  },
};

export default lesson;

const lesson = {
  id: "git-0-009",
  slug: "beyond-your-machine",
  chapter: "git-0",
  order: 9,
  title: "Remotes",
  subtitle: "Your repository, everywhere",
  tags: ["git", "remote", "github", "push", "pull", "clone", "origin"],
  aliases: [
    "git push",
    "git pull",
    "git clone",
    "origin",
    "remote repository",
    "github",
  ],

  hook: `Your teammate is 2,000 miles away. You need to share your code. Emailing zip files is not a workflow. Remotes are. A remote is a copy of your repository living on a server somewhere — GitHub, GitLab, your company's infrastructure. Push your commits there; your teammate pulls them down. Hard drive dies: clone from the remote and you lose nothing.`,

  mentalModel: [
    "Push your commits at least once a day. A commit only on your local machine is one power failure away from gone.",
    "In VS Code, the circular arrows icon in the bottom status bar shows unsynced commits. Click it to pull and push. That button runs `git pull` then `git push`.",
    "`git pull` before you start work. `git push` after you finish. Your teammates can't see your commits until you push.",
  ],

  intuition: {
    prose: [
      "GitHub is not Git. Git is the version control program running on your computer. GitHub is a website that hosts Git repositories and adds a browser UI, pull requests, issues, and CI/CD integrations on top. When you push to GitHub, you're sending your commit objects to GitHub's servers. They store them and make them accessible to your teammates. GitLab and Bitbucket do the same thing — different hosting services, same underlying Git protocol.",
      "`origin` is just a name. When you clone a repository, Git automatically creates a remote called `origin` pointing to the URL you cloned from. The name `origin` is convention — you could call it `github` or `upstream` — but virtually every team uses `origin` and you should too. When someone says 'push to origin', they mean 'push to that URL'.",
      "In VS Code, the bottom status bar shows your current branch name with small icons: an arrow pointing down (commits available to pull) and an arrow pointing up (commits waiting to push). The number next to each arrow is how many commits. Click the whole sync button (circular arrows) to pull then push in one action. That's running `git pull` followed by `git push`. If the pull encounters conflicts, VS Code will let you know before pushing.",
      "Start building the daily habit: pull in the morning, commit throughout the day, push when you stop. You don't need to push every commit — just push before you close your laptop. The local workspace panel here can't reach a real server, but the commit → push pattern is the same: build history locally, then sync it outward.",
    ],
    visualizations: [
      {
        id: "GitWorkspace",
        mathBridge:
          "**This panel shows your local commit history.** In a real project, the sync step sends those commits to GitHub/GitLab. VS Code shows the sync status in the bottom-left status bar (↓ to pull, ↑ to push).\n\nCore terminal commands:\n```\ngit remote -v                    # show configured remotes and URLs\ngit push                         # send commits to remote\ngit push -u origin main          # first push; -u sets default upstream\ngit pull                         # fetch + merge remote commits\ngit fetch origin                 # download remote commits (no merge yet)\ngit clone https://...            # copy a full remote repo to your machine\n```\n\nIn GitKraken: the Push and Pull buttons are in the top toolbar. Remote branches appear as labeled nodes in the graph next to your local branches.",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          showStaging: false,
          showBranching: false,
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nWin condition: reach the exit room.\nLose condition: health drops to zero.\n\nRooms: 10 per level\nLevels: 3",
            "controls.txt":
              "CONTROLS\n\nMove: arrow keys\nInteract: space\nPause: escape",
            "README.md":
              "# Dungeon Explorer\n\nA text-based dungeon game.\n\n## Setup\n\n1. Clone the repo\n2. Run `npm install`\n3. Run `npm start`",
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Remote-tracking branches.** When you clone, Git creates local references like `origin/main` — a snapshot of where the remote's branches were the last time you communicated with the server. Running `git log origin/main` shows the remote's history as of your last sync, without contacting the server. `git fetch origin` updates these references by downloading new commits from the remote without merging them. `git pull` is `git fetch` followed by `git merge origin/main` in one step.",
      "**`git pull` is two operations.** `git pull` = `git fetch` + `git merge`. Some teams prefer the explicit approach: `git fetch origin` to see what's new, review with `git log origin/main`, then `git merge origin/main` deliberately. This lets you inspect what you're about to merge before committing to it — useful if a teammate pushed something that might conflict with your current work.",
      "**Pushing a new branch.** If you create a local branch and run `git push`, Git will reject it with an error: 'The current branch has no upstream branch.' The fix: `git push -u origin feature-name`. The `-u` flag sets the 'upstream' — after this first push, plain `git push` and `git pull` on that branch know which remote branch to sync with. Subsequent pushes on the same branch need only `git push`.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Pull before you push",
        body: "If a teammate pushed commits while you were working, `git push` will be rejected because your local history doesn't include their commits. The fix is always: `git pull` (or `git fetch` + `git merge`) first, then push. Never use `git push --force` on a shared branch — it overwrites teammates' commits.",
      },
    ],
  },

  examples: [
    {
      title: "Starting from scratch on GitHub",
      body: "# 1. Create a new repo on github.com (click New Repository)\n# 2. Copy the SSH or HTTPS URL, then:\ngit init\ngit add .\ngit commit -m 'Initial commit'\ngit branch -M main               # ensure branch is named main\ngit remote add origin https://github.com/you/dungeon-explorer.git\ngit push -u origin main          # first push; -u sets upstream",
    },
    {
      title: "Collaborating on an existing repo",
      body: "# Get a copy of someone else's repo\ngit clone https://github.com/team/dungeon-explorer.git\ncd dungeon-explorer\n\n# Download teammates' latest commits (don't merge yet)\ngit fetch origin\n\n# See what they added\ngit log origin/main --oneline\n\n# Merge their changes into your local main\ngit merge origin/main\n\n# Or do both in one step\ngit pull",
    },
    {
      title: "Push your work",
      body: "# After committing locally:\ngit push                  # push current branch to its upstream\n\n# If this is a new branch with no upstream yet:\ngit push -u origin feature-branch",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-009-q1",
        type: "choice",
        text: "What does `git clone https://github.com/user/repo.git` do?",
        options: [
          "Downloads only the latest commit of the repository",
          "Copies the entire repository — all history and branches — to your machine",
          "Creates a new empty repository linked to that URL",
          "Deletes your local repository and replaces it",
        ],
        answer:
          "Copies the entire repository — all history and branches — to your machine",
      },
      {
        id: "git0-009-q2",
        type: "choice",
        text: "What are the two operations that `git pull` performs internally?",
        options: [
          "git add + git commit",
          "git checkout + git merge",
          "git fetch + git merge",
          "git clone + git push",
        ],
        answer: "git fetch + git merge",
      },
      {
        id: "git0-009-q3",
        type: "choice",
        text: "You create a local branch `new-ui` and run `git push`. Git rejects it saying no upstream is configured. What command fixes this?",
        options: [
          "git remote add new-ui",
          "git push --force",
          "git push -u origin new-ui",
          "git branch -u origin",
        ],
        answer: "git push -u origin new-ui",
      },
    ],
  },
};

export default lesson;

const lesson = {
  id: "git-0-010",
  slug: "remote-repositories",
  chapter: "git-0",
  order: 10,
  title: "Remote Repositories",
  subtitle: "git remote, git clone, and origin",
  tags: ["git", "remote", "clone", "origin", "github"],
  aliases: ["git remote", "git clone", "add remote", "remote repo"],

  hook: `Your local repo and the GitHub repo are separate repositories that happen to be linked. Understanding that link — called a remote — clarifies every push, pull, and fetch command.`,

  mentalModel: [
    "A remote is a named URL pointing to another copy of the repository — usually on GitHub, GitLab, or Bitbucket.",
    "`origin` is the conventional name for the main remote — the one you originally cloned from.",
    "Remote-tracking branches (`origin/main`) are local read-only snapshots of where the remote was last time you synced.",
  ],

  intuition: {
    prose: [
      "**A remote is just a URL with a name.** Run `git remote -v` to see your remotes. The most common output: `origin  git@github.com:you/repo.git (fetch)` and the same URL for `push`. The name `origin` is a convention — you could name it anything. Most repos have just one remote (`origin`), but you can have many (e.g. `upstream` for the original repo you forked from).",
      "**`git clone`: getting a copy.** `git clone https://github.com/user/repo.git` creates a local copy with: all files checked out, the full history downloaded, and `origin` already set to the URL you cloned from. `git clone` automatically sets up `main` to track `origin/main`, so push and pull know where to go.",
      "**Remote-tracking branches.** When you fetch/clone/pull, Git creates local references like `origin/main`, `origin/feature/nav`. These are read-only snapshots of the remote's branches at the time of last sync. Run `git branch -r` to see them all. Your local `main` and `origin/main` are independent until you explicitly sync them.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Managing remotes",
        body: "`git remote -v` — list remotes with URLs\n`git remote add upstream https://github.com/original/repo.git` — add a second remote\n`git remote remove upstream` — delete a remote\n`git remote rename origin old-origin` — rename a remote\n`git remote set-url origin git@github.com:new/url.git` — change a remote's URL",
      },
    ],
  },

  rigor: {
    prose: [
      "**HTTPS vs SSH URLs.** HTTPS: `https://github.com/user/repo.git` — requires a personal access token (PAT) for authentication on push. SSH: `git@github.com:user/repo.git` — uses your SSH key. SSH is more convenient for regular use since credentials are managed by your SSH agent, not re-entered. You can switch a cloned repo with `git remote set-url origin git@github.com:user/repo.git`.",
      "**Tracking branches.** `git branch -u origin/main` sets the upstream for the current branch. Once set, `git push` and `git pull` (without arguments) know where to go. `git clone` sets this automatically for the default branch. For branches you create locally, you typically set the upstream on first push: `git push -u origin feature/nav`.",
      "**Multiple remotes.** In open-source workflow, `origin` is your fork, `upstream` is the original project. You fetch from `upstream` to get the latest, then merge into your local branch, then push to `origin`. This is the standard fork-and-PR workflow: `git fetch upstream`, `git merge upstream/main`, `git push origin main`.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Remote-Tracking Branch",
        body: "`origin/main` is a **remote-tracking branch** — a local reference showing where `main` was on the remote as of your last `git fetch` or `git pull`. It's read-only. Running `git fetch` updates all remote-tracking branches. Running `git merge origin/main` integrates those updates into your local branch.",
      },
    ],
  },

  examples: [
    {
      title: "Clone a repo and check its remote",
      body: "`git clone git@github.com:user/project.git`\n`cd project`\n`git remote -v` — shows `origin` pointing to the cloned URL\n`git branch -r` — shows `origin/main`, `origin/HEAD -> origin/main`",
    },
    {
      title: "Add a remote manually (existing local repo)",
      body: "`git remote add origin git@github.com:you/project.git`\n`git push -u origin main` — push local main to remote and set tracking\nNow `git push` and `git pull` work without arguments.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-010-q1",
        type: "choice",
        text: "What is `origin` in Git?",
        options: [
          "The original first commit in a repository",
          "The default local branch name",
          "A conventional name for the main remote repository URL",
          "The Git server software",
        ],
        answer: "A conventional name for the main remote repository URL",
      },
      {
        id: "git0-010-q2",
        type: "choice",
        text: "What does `origin/main` represent?",
        options: [
          "Your local main branch",
          "A read-only local snapshot of where main was on the remote last sync",
          "The remote repository's configuration file",
          "The merge base of main and origin",
        ],
        answer: "A read-only local snapshot of where main was on the remote last sync",
      },
      {
        id: "git0-010-q3",
        type: "choice",
        text: "What does `git clone` do automatically for you?",
        options: [
          "Sets up SSH keys for the remote",
          "Creates a new empty repo on GitHub",
          "Sets `origin` to the cloned URL and sets up tracking for the default branch",
          "Clones all branches as separate folders",
        ],
        answer: "Sets `origin` to the cloned URL and sets up tracking for the default branch",
      },
    ],
  },
};

export default lesson;

const lesson = {
  id: "git-0-002",
  slug: "install-and-configure",
  chapter: "git-0",
  order: 2,
  title: "Installing & Configuring Git",
  subtitle: "One-time setup before everything else",
  tags: ["git", "config", "setup", "identity"],
  aliases: ["git config", "git setup", "install git"],

  hook: `Every commit you ever make will carry your name and email permanently. Before you write a single commit, you need to tell Git who you are — and that's the only configuration that is truly mandatory.`,

  mentalModel: [
    "Git has three config levels: system (all users), global (your user account), and local (one repo) — each overrides the previous.",
    "Your name and email are embedded in every commit forever — set them correctly with `git config --global`.",
    "Checking your config with `git config --list` shows you exactly what Git will use for each setting.",
  ],

  intuition: {
    prose: [
      "**Two mandatory settings.** Before using Git for real work, run two commands: `git config --global user.name \"Your Name\"` and `git config --global user.email \"you@example.com\"`. These are embedded permanently into every commit you create. If you skip this, Git will either complain or use a wrong default.",
      "**Three levels of configuration.** `--system` applies to every user on the machine (stored in `/etc/gitconfig`). `--global` applies to your user account (stored in `~/.gitconfig`). `--local` (the default, or omitted) applies only to the current repository (stored in `.git/config`). Local overrides global overrides system.",
      "**Checking what's configured.** Run `git config --list` to see all active settings. Run `git config user.name` to check a single value. Run `git config --list --show-origin` to see which file each setting comes from.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Essential First-Time Setup",
        body: "`git config --global user.name \"Your Name\"`\n`git config --global user.email \"you@example.com\"`\n`git config --global core.editor \"code --wait\"` (sets VS Code as your editor)\n`git config --global init.defaultBranch main` (names new repos 'main' instead of 'master')",
      },
    ],
  },

  rigor: {
    prose: [
      "**The config file format.** Git config files use INI format: sections in `[brackets]`, key-value pairs beneath. Example `~/.gitconfig`: `[user]\\n  name = Alice\\n  email = alice@example.com\\n[core]\\n  editor = vim`. You can edit these files directly with any text editor.",
      "**SSH vs HTTPS for remotes.** When you push to GitHub/GitLab, Git needs to authenticate. HTTPS prompts for a username+password (or personal access token). SSH uses a cryptographic key pair — no password prompts after setup. For regular use, SSH is more convenient: generate a key with `ssh-keygen -t ed25519 -C \"you@example.com\"`, add the public key to GitHub settings, and you're done.",
      "**Useful global configs.** `core.autocrlf`: set to `true` on Windows, `input` on Mac/Linux — handles line-ending differences across operating systems. `pull.rebase false`: makes `git pull` create merge commits (safer for beginners). `alias.st status`: creates `git st` as a shorthand. `credential.helper store`: caches HTTPS credentials so you aren't re-prompted.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Config Precedence",
        body: "**Local** (`.git/config`) overrides **Global** (`~/.gitconfig`) overrides **System** (`/etc/gitconfig`). A local config can override your global name/email for a specific work repo — useful if you have separate personal and work identities.",
      },
    ],
  },

  examples: [
    {
      title: "Verify your setup",
      body: "`git config --global user.name` — should print your name.\n`git config --global user.email` — should print your email.\n`git config --list --global` — shows all your global settings.",
    },
    {
      title: "Per-repo identity for work projects",
      body: "Inside a work repo: `git config user.email \"alice@company.com\"` (no `--global`). This local config overrides your personal global email for commits in that repo only.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-002-q1",
        type: "choice",
        text: "Which config level takes highest priority (overrides all others)?",
        options: ["system", "global", "local", "default"],
        answer: "local",
      },
      {
        id: "git0-002-q2",
        type: "choice",
        text: "Where is the --global config file stored?",
        options: [
          "/etc/gitconfig",
          "~/.gitconfig",
          ".git/config inside the repo",
          "/usr/local/git/config",
        ],
        answer: "~/.gitconfig",
      },
      {
        id: "git0-002-q3",
        type: "choice",
        text: "What command shows ALL active git settings along with which file they come from?",
        options: [
          "git config --all",
          "git config --list --show-origin",
          "git settings dump",
          "git config --global --list",
        ],
        answer: "git config --list --show-origin",
      },
    ],
  },
};

export default lesson;

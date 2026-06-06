const lesson = {
  id: "git-0-022",
  slug: "gitignore-and-config",
  chapter: "git-0",
  order: 22,
  title: ".gitignore & Config",
  subtitle: "Keeping secrets, noise, and build artifacts out",
  tags: ["git", "gitignore", "config", "ignore", "security"],
  aliases: ["gitignore", ".gitignore", "ignore files", "git config"],

  hook: `Node modules, build folders, API keys, editor files. None of these belong in your repo — they're either too large, generated automatically, or dangerously private. \`.gitignore\` is your gatekeeper.`,

  mentalModel: [
    "`.gitignore` tells Git to completely ignore matching files — they won't appear as untracked and will never be committed.",
    "Files already tracked by Git are NOT affected by `.gitignore` — you must untrack them first with `git rm --cached`.",
    "Sensitive data (API keys, passwords) should never be committed — not even once. Git history is forever and public.",
  ],

  intuition: {
    prose: [
      "**`.gitignore` pattern syntax.** Each line is a pattern. `node_modules/` — ignores the entire directory. `*.log` — ignores all `.log` files anywhere. `build/` — ignores the build directory. `!important.log` — un-ignores something a previous rule would ignore (negation). `**/.env` — ignores `.env` in any subdirectory. `#` starts a comment line.",
      "**What to ignore.** Almost every project needs these in `.gitignore`: `node_modules/` (JS), `.env` (environment variables/secrets), `build/` or `dist/` (generated output), `*.log` (log files), `.DS_Store` (macOS metadata), `.idea/` or `.vscode/` (editor config, optional). GitHub provides ready-made templates at github.com/github/gitignore.",
      "**Already tracked files.** `.gitignore` only affects files that Git has never seen. If you already committed `node_modules/` and now add it to `.gitignore`, Git still tracks it. To fix: `git rm -r --cached node_modules/` removes it from tracking without deleting the files, then commit the deletion. Now `.gitignore` kicks in.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Secrets in Git are permanent",
        body: "If you commit an API key, password, or private key — even for one second — assume it's compromised. It exists in the repository history forever. Anyone who clones the repo, now or in the future, can recover it from the history. Revoke and rotate any key that was ever committed. Use tools like `git-secrets` or GitHub's secret scanning to prevent this.",
      },
    ],
    visualizations: [
      {
        id: "GitWorkspace",
        mathBridge:
          "**See .gitignore in action.** Create a `.gitignore` file in the panel and add patterns like `*.log`, `build/`, `.env`. Then create those files (`app.log`, `build/output.js`, `.env`) — notice that gitignored files appear grayed out or absent from the Source Control panel. Only the `.gitignore` itself shows as a change to stage and commit.",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nWin condition: reach the key room and exit.\nLose condition: health drops to zero.\n\nDifficulty levels:\n- Easy: 3 traps, 2 health potions\n- Normal: 5 traps, 1 health potion\n- Hard: 8 traps, no potions",
            "controls.txt":
              "CONTROLS\n\nArrow keys: move\nSpace: interact\nEsc: pause\nI: inventory",
            ".gitignore":
              "# Build outputs\nbuild/\ndist/\n\n# Environment secrets\n.env\n.env.local\n\n# Logs\n*.log\n\n# OS files\n.DS_Store\nThumbs.db",
            "debug.log":
              "[2026-01-15 09:00] Game started\n[2026-01-15 09:01] Player moved to room 2",
            ".env": "API_KEY=abc123\nDB_PASSWORD=secret",
          },
        },
      },
      {
        id: "GitTerminal",
        mathBridge:
          "**Practice git config in the terminal.**\n\n- `git config --list` — see all current config\n- `git config user.name` — see your name\n- `git config --global user.email 'you@example.com'` — set globally\n- `git config --global alias.st status` — create `git st` shortcut\n- `git config --global alias.lg 'log --oneline --graph --decorate'` — pretty log\n- `git config --global core.editor 'code --wait'` — use VS Code as editor\n\nAfter setting the aliases, try `git st` and `git lg`.",
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
          "**Gitignored files never appear in the commit graph** because they're never committed. After adding `.gitignore` patterns for `*.log` and `.env`, try creating those files and staging — they won't show up. The graph stays clean: only intentional tracked changes produce commit nodes. The graph is a record of what Git was explicitly told to save — `.gitignore` is how you keep noise, secrets, and build artifacts out of that permanent record.",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nWin condition: reach the key room and exit.\nLose condition: health drops to zero.\n\nDifficulty levels:\n- Easy: 3 traps, 2 health potions\n- Normal: 5 traps, 1 health potion\n- Hard: 8 traps, no potions",
            "controls.txt":
              "CONTROLS\n\nArrow keys: move\nSpace: interact\nEsc: pause\nI: inventory",
            ".gitignore":
              "# Build outputs\nbuild/\ndist/\n\n# Environment secrets\n.env\n.env.local\n\n# Logs\n*.log\n\n# OS files\n.DS_Store\nThumbs.db",
            "debug.log":
              "[2026-01-15 09:00] Game started\n[2026-01-15 09:01] Player moved to room 2",
            ".env": "API_KEY=abc123\nDB_PASSWORD=secret",
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Three levels of gitignore.** `.gitignore` in the repo root affects that repo. `.gitignore` in subdirectories affects only that directory tree. `~/.gitignore_global` (set with `git config --global core.excludesfile ~/.gitignore_global`) applies to all repos on your machine — good for `.DS_Store`, `.idea/`, `*.swp`.",
      "**`.gitkeep` convention.** Git doesn't track empty directories (only files). If you need to commit an empty directory (e.g., `logs/` that gets created at runtime), add an empty `.gitkeep` file inside it. This is a convention, not a Git feature — the file is just a placeholder.",
      "**Environment-specific config.** Never commit `.env` files with real values. Instead, commit `.env.example` with placeholder values showing what variables are needed but not their actual values. Developers copy `.env.example` to `.env` and fill in their own values. Add `.env` to `.gitignore`.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Check if a file is ignored",
        body: "`git check-ignore -v path/to/file` tells you exactly which `.gitignore` rule is causing the file to be ignored (or shows nothing if it's not ignored). Invaluable for debugging unexpected ignore behavior.",
      },
    ],
  },

  examples: [
    {
      title: "Typical Node.js .gitignore",
      body: "`node_modules/`\n`dist/`\n`build/`\n`.env`\n`.env.local`\n`*.log`\n`.DS_Store`\n`coverage/`\n`.nyc_output/`",
    },
    {
      title: "Remove a tracked file from Git without deleting it",
      body: "`git rm --cached .env` — removes `.env` from git tracking, keeps the file on disk\n`echo '.env' >> .gitignore` — ensure it stays ignored\n`git add .gitignore`\n`git commit -m \"Remove .env from tracking, add to gitignore\"`",
    },
  ],

  quiz: [
    {
      id: "git0-022-q1",
      type: "choice",
      text: "You add `*.log` to `.gitignore` but Git still shows `debug.log` as modified. Why?",
      options: [
        ".gitignore doesn't work for log files",
        "The `*.log` pattern is wrong — it needs to be `**/*.log`",
        "`debug.log` is already tracked by Git — .gitignore only affects untracked files",
        "You need to restart Git for .gitignore changes to take effect",
      ],
      answer:
        "`debug.log` is already tracked by Git — .gitignore only affects untracked files",
      hints: [".gitignore only prevents Git from seeing files it has never tracked. If a file is already in the history, you must untrack it first."],
    },
    {
      id: "git0-022-q2",
      type: "choice",
      text: "You accidentally committed an API key. What should you do first?",
      options: [
        "Add the file to .gitignore",
        "Delete the commit with `git reset --hard`",
        "Revoke and rotate the API key immediately — assume it's compromised",
        "Push a new commit that removes the key from the file",
      ],
      answer:
        "Revoke and rotate the API key immediately — assume it's compromised",
      hints: ["Git history is forever — anyone who cloned or forked the repo can recover that key. The commit being gone doesn't help."],
    },
    {
      id: "git0-022-q3",
      type: "choice",
      text: "A `~/.gitignore_global` file is useful because:",
      options: [
        "It overrides all per-repo .gitignore files",
        "It applies OS/editor-specific ignores (like .DS_Store) to all repos on your machine",
        "It syncs your ignore patterns to GitHub",
        "It prevents `git push` of ignored files",
      ],
      answer:
        "It applies OS/editor-specific ignores (like .DS_Store) to all repos on your machine",
      hints: ["OS and editor files (.DS_Store, .idea/) don't belong in any repo. Where do you put patterns that apply everywhere?"],
    },
  ],

  definitions: [
    { term: ".gitignore", definition: "A file listing patterns for files Git should completely ignore — they won't appear as untracked and will never be committed." },
    { term: "git rm --cached", definition: "Removes a file from Git tracking without deleting it from disk. Used when a file is already committed but should now be ignored." },
    { term: ".env", definition: "A file storing environment-specific configuration and secrets (API keys, database passwords). Always add to `.gitignore`; never commit." },
    { term: "global gitignore", definition: "`~/.gitignore_global` — a user-level ignore file applying patterns to every repository on your machine. Set via `git config --global core.excludesfile`." },
  ],
};

export default lesson;

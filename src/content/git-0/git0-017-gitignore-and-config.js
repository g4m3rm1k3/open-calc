const lesson = {
  id: "git-0-017",
  slug: "gitignore-and-config",
  chapter: "git-0",
  order: 17,
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

  assessment: {
    questions: [
      {
        id: "git0-017-q1",
        type: "choice",
        text: "You add `*.log` to `.gitignore` but Git still shows `debug.log` as modified. Why?",
        options: [
          ".gitignore doesn't work for log files",
          "The `*.log` pattern is wrong — it needs to be `**/*.log`",
          "`debug.log` is already tracked by Git — .gitignore only affects untracked files",
          "You need to restart Git for .gitignore changes to take effect",
        ],
        answer: "`debug.log` is already tracked by Git — .gitignore only affects untracked files",
      },
      {
        id: "git0-017-q2",
        type: "choice",
        text: "You accidentally committed an API key. What should you do first?",
        options: [
          "Add the file to .gitignore",
          "Delete the commit with `git reset --hard`",
          "Revoke and rotate the API key immediately — assume it's compromised",
          "Push a new commit that removes the key from the file",
        ],
        answer: "Revoke and rotate the API key immediately — assume it's compromised",
      },
      {
        id: "git0-017-q3",
        type: "choice",
        text: "A `~/.gitignore_global` file is useful because:",
        options: [
          "It overrides all per-repo .gitignore files",
          "It applies OS/editor-specific ignores (like .DS_Store) to all repos on your machine",
          "It syncs your ignore patterns to GitHub",
          "It prevents `git push` of ignored files",
        ],
        answer: "It applies OS/editor-specific ignores (like .DS_Store) to all repos on your machine",
      },
    ],
  },
};

export default lesson;

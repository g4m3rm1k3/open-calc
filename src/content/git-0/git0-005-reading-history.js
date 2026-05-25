const lesson = {
  id: "git-0-005",
  slug: "reading-history",
  chapter: "git-0",
  order: 5,
  title: "Reading History",
  subtitle: "git log, git show, and git diff",
  tags: ["git", "log", "diff", "show", "history"],
  aliases: ["git log", "git show", "git diff", "view history"],

  hook: `Commits are only useful if you can read them. Git's history tools let you see what changed, when, by whom, and why — across any span of time. Reading history is half the job.`,

  mentalModel: [
    "`git log` shows the list of commits — who, when, and the message. Flags customize the output from one-line summaries to full diffs.",
    "`git diff` compares two states: your working directory vs staging, staging vs last commit, or any two commits.",
    "`git show` shows a single commit's full content — metadata plus the diff of what changed.",
  ],

  intuition: {
    prose: [
      "**`git log`: the commit list.** Run `git log` to see every commit on the current branch in reverse chronological order. Each entry shows the SHA-1 hash, author, date, and message. The default output is verbose — use `git log --oneline` for a compact one-line-per-commit view. Use `git log --oneline --graph` to add a visual branch graph.",
      "**`git show`: one commit in detail.** `git show <hash>` displays the commit metadata followed by the full diff — every line added (+) and removed (-) in that commit. You can use the first 7 characters of the hash instead of the full 40. `git show HEAD` shows the most recent commit. `git show HEAD~2` shows the commit two steps back.",
      "**`git diff`: comparing states.** `git diff` (no arguments) shows changes in your working directory that are NOT yet staged. `git diff --staged` shows what IS staged (what goes into the next commit). `git diff <hash1> <hash2>` compares two commits. `git diff main feature/new` compares two branches.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Most useful log flags",
        body: "`git log --oneline` — compact, one commit per line\n`git log --oneline --graph --all` — visual branch tree for all branches\n`git log --author=\"Alice\"` — filter by author\n`git log --since=\"2 weeks ago\"` — filter by date\n`git log --grep=\"login\"` — filter by commit message content\n`git log -p` — show the diff for each commit inline",
      },
    ],
  },

  rigor: {
    prose: [
      "**Relative references.** `HEAD` is the current commit. `HEAD~1` (or `HEAD~`) is one commit before HEAD. `HEAD~3` is three commits back. `HEAD^1` and `HEAD^2` refer to the first and second parents of a merge commit. Branch names and tags are also valid references — they all resolve to a commit hash.",
      "**`git log -S` and `git log -G`.** `-S \"searchterm\"` (the pickaxe) finds commits that introduced or removed that exact string — useful for finding when a function was added. `-G \"regex\"` finds commits where the diff matches the regex. These are powerful debugging tools.",
      "**The diff format.** Git diffs use unified diff format: lines starting with `-` were removed, `+` were added, context lines (no prefix) show surrounding unchanged code. `@@` markers show the line numbers. Diffs are computed on demand from the stored snapshots — Git never stores diffs, only computes them when asked.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Commit References",
        body: "**HEAD** — the currently checked-out commit (usually the tip of a branch).\n**HEAD~N** — N commits before HEAD in a straight line.\n**HEAD^2** — the second parent of a merge commit.\n**@{upstream}** — the tracking remote branch. Any commit hash (full or shortened to ≥7 chars) works anywhere Git expects a ref.",
      },
    ],
  },

  examples: [
    {
      title: "See the last 5 commits as a graph",
      body: "`git log --oneline --graph --all -n 5`\nShows the last 5 commits across all branches as a compact ASCII graph. Essential for understanding where branches diverge.",
    },
    {
      title: "Find when a function was deleted",
      body: "`git log -S \"function authenticate\"` — lists every commit that added or removed that exact string. Then `git show <hash>` to see what happened.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-005-q1",
        type: "choice",
        text: "What does `git diff --staged` show?",
        options: [
          "Changes in your working directory not yet saved to disk",
          "Changes that are staged and will go into the next commit",
          "The diff between the last two commits",
          "Changes on the remote that you haven't pulled yet",
        ],
        answer: "Changes that are staged and will go into the next commit",
      },
      {
        id: "git0-005-q2",
        type: "choice",
        text: "What does `HEAD~3` refer to?",
        options: [
          "The third branch in the repo",
          "Three commits in the future",
          "The commit three steps before the current HEAD",
          "The HEAD of the third remote",
        ],
        answer: "The commit three steps before the current HEAD",
      },
      {
        id: "git0-005-q3",
        type: "choice",
        text: "In a unified diff, lines prefixed with `+` mean:",
        options: [
          "Lines that exist in the old version",
          "Lines that were added in the newer version",
          "Lines that are unchanged context",
          "Line numbers in the diff header",
        ],
        answer: "Lines that were added in the newer version",
      },
    ],
  },
};

export default lesson;

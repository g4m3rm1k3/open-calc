const lesson = {
  id: "git-0-006",
  slug: "undoing-changes",
  chapter: "git-0",
  order: 6,
  title: "Undoing Changes",
  subtitle: "git restore, git reset, and git revert",
  tags: ["git", "restore", "reset", "revert", "undo"],
  aliases: ["undo git", "git undo", "git reset", "git revert", "discard changes"],

  hook: `Knowing how to undo is as important as knowing how to commit. Git gives you three different undo tools — each for a different situation. Using the wrong one can rewrite shared history and break your team's repo.`,

  mentalModel: [
    "`git restore` undoes changes in the working directory or staging area — safe, never touches commit history.",
    "`git reset` moves the branch pointer backward in history — safe on local-only branches, dangerous on pushed branches.",
    "`git revert` creates a new commit that reverses a past commit — always safe, preserves history, correct for pushed work.",
  ],

  intuition: {
    prose: [
      "**`git restore`: discard working changes.** `git restore filename` throws away your unsaved edits to that file and restores it to the last committed state. `git restore --staged filename` removes a file from the staging area without discarding your edits (unstage it). This command only affects your working directory and staging area — no commits are touched.",
      "**`git reset`: move the branch pointer.** `git reset --soft HEAD~1` moves the branch back one commit but keeps all the changes staged — useful to redo a commit. `git reset --mixed HEAD~1` (the default) unstages the changes too, putting them in your working directory. `git reset --hard HEAD~1` discards the commit AND all the changes permanently — those changes are gone.",
      "**`git revert`: undo safely.** `git revert <hash>` creates a *new* commit that is the exact inverse of the specified commit. The original commit stays in history — nothing is rewritten. This is the correct way to undo work that has already been pushed to a shared branch. You're adding history, not removing it.",
    ],
    callouts: [
      {
        type: "warning",
        title: "NEVER `git reset --hard` on pushed commits",
        body: "If you `git reset --hard` and then `git push --force`, you rewrite the remote history. Anyone who already pulled those commits will have a diverged repository. Use `git revert` instead — it achieves the same result without rewriting history.",
      },
    ],
  },

  rigor: {
    prose: [
      "**The three trees.** To understand reset deeply, think of Git managing three 'trees': HEAD (the last commit), the Index/Staging area, and the Working Directory. `--soft` moves HEAD only. `--mixed` moves HEAD and resets the Index to match. `--hard` moves HEAD, resets the Index, AND resets the Working Directory — hence it overwrites your files.",
      "**`git restore` vs old `git checkout --`.** Before Git 2.23, `git checkout -- filename` was used to discard working directory changes. `git restore` was introduced to make this clearer and to separate checkout's two duties (switching branches vs discarding changes). Modern Git recommends `git restore` for file-level operations.",
      "**`git clean`: removing untracked files.** `git restore` only handles tracked files. To delete untracked files from the working directory, use `git clean -fd` (`-f` = force, `-d` = include directories). Run `git clean -nd` first for a dry run showing what would be deleted.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Quick Reference",
        body: "**`git restore file`** — discard working dir changes to file\n**`git restore --staged file`** — unstage a file (keep edits)\n**`git reset --soft HEAD~1`** — undo last commit, keep staged\n**`git reset --mixed HEAD~1`** — undo last commit, unstage changes\n**`git reset --hard HEAD~1`** — undo last commit, DISCARD changes\n**`git revert <hash>`** — new commit undoing a past commit (safe for shared repos)",
      },
    ],
  },

  examples: [
    {
      title: "Oops, staged the wrong file",
      body: "`git restore --staged accidental.js` — removes it from staging, your edits are preserved in the working directory. Now `git status` shows it as modified but unstaged.",
    },
    {
      title: "Undo a pushed commit safely",
      body: "`git revert abc1234` — creates a new commit reversing what `abc1234` did. Push normally. Your teammates pull cleanly. History shows both the original commit and the revert.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-006-q1",
        type: "choice",
        text: "You staged a file by mistake. Which command removes it from staging without losing your edits?",
        options: [
          "`git reset --hard HEAD`",
          "`git restore --staged filename`",
          "`git revert filename`",
          "`git rm --cached filename`",
        ],
        answer: "`git restore --staged filename`",
      },
      {
        id: "git0-006-q2",
        type: "choice",
        text: "A commit was pushed to main and broke production. Which undo approach is safest?",
        options: [
          "`git reset --hard` and force push",
          "`git revert` to create a new undo commit",
          "`git restore` the files and commit",
          "`git clean -fd` to reset everything",
        ],
        answer: "`git revert` to create a new undo commit",
      },
      {
        id: "git0-006-q3",
        type: "choice",
        text: "`git reset --hard HEAD~1` will:",
        options: [
          "Move the branch back one commit and keep changes staged",
          "Move the branch back one commit and keep changes in the working directory",
          "Move the branch back one commit and permanently discard all changes",
          "Create a new commit that reverses the last one",
        ],
        answer: "Move the branch back one commit and permanently discard all changes",
      },
    ],
  },
};

export default lesson;

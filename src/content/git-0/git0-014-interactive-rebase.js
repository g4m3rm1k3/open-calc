const lesson = {
  id: "git-0-014",
  slug: "interactive-rebase",
  chapter: "git-0",
  order: 14,
  title: "Interactive Rebase",
  subtitle: "Rewriting commit history precisely",
  tags: ["git", "rebase", "interactive", "squash", "fixup", "amend"],
  aliases: ["git rebase -i", "squash commits", "edit history", "interactive rebase"],

  hook: `Your feature branch has 12 commits: "WIP", "fix bug", "actually fix it", "fix typo", "trying something". Before merging into main, clean it up into 3 meaningful commits. Interactive rebase is the editing tool for history.`,

  mentalModel: [
    "`git rebase -i HEAD~N` opens an editor listing the last N commits — you reorder, squash, edit, or drop them.",
    "Squash (s) combines a commit with the one above it. Fixup (f) does the same but discards the commit message.",
    "Interactive rebase rewrites hashes — same golden rule applies: only use it on local/unpushed commits.",
  ],

  intuition: {
    prose: [
      "**Opening interactive rebase.** `git rebase -i HEAD~5` opens your editor with the last 5 commits listed, each prefixed with `pick`. The list is oldest-first (top = oldest). Edit the prefixes, save and close — Git executes your instructions.",
      "**The commands.** `pick` — keep the commit as-is. `reword` (or `r`) — keep the commit but let you edit its message. `edit` (or `e`) — pause at this commit to make further changes. `squash` (or `s`) — combine this commit with the one above, merging messages. `fixup` (or `f`) — like squash but discard this commit's message. `drop` (or `d`) — delete this commit entirely.",
      "**Squashing messy commits.** Suppose you have: `pick abc123 Add auth feature`, `pick def456 WIP`, `pick ghi789 fix typo`, `pick jkl012 fix the actual bug`. Change to: `pick abc123 Add auth feature`, `fixup def456 WIP`, `fixup ghi789 fix typo`, `fixup jkl012 fix the actual bug`. Result: one clean commit 'Add auth feature' containing all four sets of changes.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Reorder commits by reordering lines",
        body: "In the interactive rebase editor, the order of lines determines the order of commits. Move lines up or down to reorder commits. Git will replay them in the new order. This can create conflicts if commits depend on each other — be thoughtful about what you reorder.",
      },
    ],
  },

  rigor: {
    prose: [
      "**`edit` command workflow.** When Git reaches a commit marked `edit`, it pauses and you get your shell back. The HEAD is at that commit. You can `git commit --amend` to modify the commit, add more commits, or split the commit (`git reset HEAD~1` unstages it, then commit in multiple pieces). When done: `git rebase --continue`.",
      "**Splitting a commit.** Mark it `edit`. When paused: `git reset HEAD~1` (mixed reset — unstages all changes from that commit). Now selectively `git add` and `git commit` multiple times. Each becomes its own commit. Then `git rebase --continue`. You've split one commit into several.",
      "**`--autosquash`.** If you commit with `git commit --fixup=<hash>` or `git commit --squash=<hash>`, Git names the commit `fixup! original message` or `squash! original message`. Running `git rebase -i --autosquash HEAD~N` automatically arranges these fixup/squash commits to be next to their targets. Combine with `git commit --fixup` for a clean workflow.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Never rebase pushed commits",
        body: "Same rule as standard rebase: `git rebase -i` rewrites hashes. If you've pushed the branch, you'll need `git push --force-with-lease` after. Only do this on your own feature branches, never on shared branches.",
      },
    ],
  },

  examples: [
    {
      title: "Squash last 4 commits into 1",
      body: "`git rebase -i HEAD~4`\n`# In editor:`\n`pick abc Add search feature`\n`fixup def WIP`\n`fixup ghi fix search edge case`\n`fixup jkl oops fix the other thing`\n`# Save and close → one clean commit 'Add search feature'`",
    },
    {
      title: "Rewrite a commit message",
      body: "`git rebase -i HEAD~3`\n`# Change 'pick' to 'reword' on the commit you want to rename`\n`reword abc Bad commit message`\n`pick def Another commit`\n`pick ghi Third commit`\n`# Git opens editor again with just that commit's message — edit it`",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-014-q1",
        type: "choice",
        text: "In interactive rebase, `fixup` differs from `squash` because:",
        options: [
          "Fixup combines with the commit below, squash with the one above",
          "Fixup discards the commit message; squash prompts you to combine messages",
          "Fixup only works on the last commit; squash works on any",
          "They are identical commands",
        ],
        answer: "Fixup discards the commit message; squash prompts you to combine messages",
      },
      {
        id: "git0-014-q2",
        type: "choice",
        text: "In a `git rebase -i` editor, the commit list is ordered:",
        options: [
          "Newest first (bottom = oldest)",
          "Oldest first (top = oldest)",
          "Alphabetically by commit message",
          "By file size of changes",
        ],
        answer: "Oldest first (top = oldest)",
      },
      {
        id: "git0-014-q3",
        type: "choice",
        text: "You want to split one large commit into two smaller ones. What's the interactive rebase command for that commit?",
        options: [
          "`squash`",
          "`split`",
          "`edit`",
          "`reword`",
        ],
        answer: "`edit`",
      },
    ],
  },
};

export default lesson;

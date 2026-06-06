const lesson = {
  id: "git-0-019",
  slug: "interactive-rebase",
  chapter: "git-0",
  order: 19,
  title: "Interactive Rebase",
  subtitle: "Rewriting commit history precisely",
  tags: ["git", "rebase", "interactive", "squash", "fixup", "amend"],
  aliases: [
    "git rebase -i",
    "squash commits",
    "edit history",
    "interactive rebase",
  ],

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
    visualizations: [
      {
        id: "GitWorkspace",
        mathBridge:
          "**Use this panel to generate messy commits to clean up.** Edit `game-design.txt` three times, committing after each with rough messages: `'wip'`, `'fix typo'`, `'more changes'`. These are the kind of in-progress commits you'd squash before opening a PR. Then switch to GitTerminal and run `git rebase -i HEAD~3` to collapse them into one polished commit. The panel's commit history is the before; after the rebase it shows only the single clean commit.",
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
          "**Practice interactive rebase in the terminal.**\n\n1. Make 3 small commits on a feature branch (edit a file 3 times, commit after each)\n2. Run `git rebase -i HEAD~3` — an editor opens listing 3 commits\n3. In the editor, change `pick` to `squash` (or `s`) on commits 2 and 3\n4. Save and close — Git opens another editor for the combined commit message\n5. Write a clean message and save\n6. Run `git log --oneline` — 3 commits are now 1\n\n**Common actions:** `pick` (keep), `squash` (combine with previous), `fixup` (squash, discard message), `reword` (edit message), `drop` (delete).",
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
          "**The graph shows the before and after of squashing.** Before `git rebase -i HEAD~3`, you'll see 3 separate commit nodes on the branch. After squashing them to 1, those 3 nodes are replaced by a single commit with a new SHA. The branch becomes shorter and cleaner — exactly the kind of history you want before merging a feature branch. The old commit hashes are gone; only the new squashed commit's hash remains in the graph.",
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

  quiz: [
    {
      id: "git0-019-q1",
      type: "choice",
      text: "In interactive rebase, `fixup` differs from `squash` because:",
      options: [
        "Fixup combines with the commit below, squash with the one above",
        "Fixup discards the commit message; squash prompts you to combine messages",
        "Fixup only works on the last commit; squash works on any",
        "They are identical commands",
      ],
      answer:
        "Fixup discards the commit message; squash prompts you to combine messages",
      hints: ["Both combine commits. The difference is what happens to the message of the commit being folded in."],
    },
    {
      id: "git0-019-q2",
      type: "choice",
      text: "In a `git rebase -i` editor, the commit list is ordered:",
      options: [
        "Newest first (bottom = oldest)",
        "Oldest first (top = oldest)",
        "Alphabetically by commit message",
        "By file size of changes",
      ],
      answer: "Oldest first (top = oldest)",
      hints: ["The first commit in the list is the one Git will replay first. Which end of the chain is that?"],
    },
    {
      id: "git0-019-q3",
      type: "choice",
      text: "You want to split one large commit into two smaller ones. What's the interactive rebase command for that commit?",
      options: ["`squash`", "`split`", "`edit`", "`reword`"],
      answer: "`edit`",
      hints: ["`edit` pauses at that commit so you can reset and re-commit in multiple pieces."],
    },
  ],

  definitions: [
    { term: "interactive rebase", definition: "`git rebase -i HEAD~N` — opens an editor listing the last N commits so you can reorder, squash, edit, or drop them." },
    { term: "squash (rebase)", definition: "Combines a commit with the one above it, merging both messages into one. Used to clean up messy WIP commits before merging." },
    { term: "fixup", definition: "Like squash but silently discards the folded commit's message, keeping only the message of the commit above." },
    { term: "reword", definition: "An interactive rebase command that keeps a commit's changes unchanged but opens an editor to revise its message." },
    { term: "drop", definition: "An interactive rebase command that deletes a commit entirely, as if it never happened." },
  ],
};

export default lesson;

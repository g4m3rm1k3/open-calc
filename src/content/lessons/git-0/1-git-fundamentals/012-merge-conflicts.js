const lesson = {
  id: "git-0-012",
  slug: "merge-conflicts",
  chapter: "git-0",
  order: 12,
  title: "Merge Conflicts",
  subtitle: "When Git can't decide — and you have to",
  tags: ["git", "conflicts", "merge", "resolve"],
  aliases: ["resolve conflict", "merge conflict", "git conflict"],

  hook: `A merge conflict is not an error — it's Git telling you it found two different changes to the same region and needs a human to decide. Once you understand the conflict markers, resolution is straightforward.`,

  mentalModel: [
    "Conflicts only occur when both branches changed the same lines — Git can automatically merge non-overlapping changes.",
    "Git marks conflict zones in the file with `<<<<<<`, `=======`, and `>>>>>>>` — you edit the file to the correct final state and remove the markers.",
    "After resolving all conflicts, `git add` the resolved files and `git commit` to complete the merge.",
  ],

  intuition: {
    prose: [
      "**When does a conflict happen?** Git auto-merges most changes. If you edited `app.js` line 5 on main and line 20 on feature, Git merges both cleanly. A conflict only happens when both branches edited the *same* lines. In that case, Git cannot decide which version is 'right' — that's a human judgment.",
      "**Reading conflict markers.** When Git finds a conflict, it edits the file to show both versions. Between `<<<<<<< HEAD` and `=======` is your version (current branch). Between `=======` and `>>>>>>> feature/login` is the incoming version. Everything outside these markers merged cleanly. Your job: delete the markers and write the correct final content.",
      "**Resolving a conflict.** Open the conflicting file. Find every marker block. Edit the code to what it *should* be (sometimes that's one version, sometimes both, sometimes a combination). Remove all three marker lines. When all conflicts are resolved, `git add filename` to mark it resolved. When all conflicted files are resolved, `git commit` to finalize the merge.",
    ],
    callouts: [
      {
        type: "tip",
        title: "VS Code conflict UI",
        body: "VS Code highlights conflict markers and shows buttons: 'Accept Current', 'Accept Incoming', 'Accept Both', 'Compare'. These edit the file for you. After clicking, you still need `git add` and `git commit` to complete the merge.",
      },
    ],
  },

  rigor: {
    prose: [
      "**`git status` during a merge.** When a merge pauses due to conflicts, `git status` shows 'both modified: filename' for each conflicted file under 'Unmerged paths'. The merge is in progress and stored in `.git/MERGE_HEAD`. Running `git commit` at this stage completes the merge.",
      "**Aborting a merge.** If you started a merge and it's gone wrong, `git merge --abort` restores everything to the state before you ran `git merge`. Nothing is permanently changed.",
      "**Conflict styles.** By default Git uses 'merge' style conflict markers. Git also supports 'diff3' style (`git config merge.conflictstyle diff3`) which adds a third section showing the common ancestor's version between the two — this extra context often makes the right resolution obvious.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Conflict Markers",
        body: "`<<<<<<< HEAD` — start of your branch's version\n`=======` — separator between the two versions\n`>>>>>>> feature/branch` — end of the incoming branch's version\n\nAll three lines must be removed from the file during resolution. Leaving any marker in the file means the conflict is NOT resolved.",
      },
    ],
  },

  examples: [
    {
      title: "Full conflict resolution workflow",
      body: "`git merge feature/nav` — conflict reported\n`git status` — see which files are conflicted\n`# edit conflicted file(s), remove markers, write final content`\n`git add src/nav.js` — mark as resolved\n`git commit` — complete the merge (editor opens for message)",
    },
    {
      title: "Bail out and start over",
      body: "`git merge feature/nav` — conflicts\n`git merge --abort` — undoes the merge, returns to clean main\nNow you can approach the merge differently (rebase first, split into smaller PRs, etc.)",
    },
  ],

  quiz: [
    {
      id: "git0-012-q1",
      type: "choice",
      text: "A conflict occurs when:",
      options: [
        "Two branches modified different files",
        "Two branches modified the same lines in the same file",
        "The feature branch is ahead of main",
        "You forgot to `git add` before merging",
      ],
      answer: "Two branches modified the same lines in the same file",
      hints: ["Git can auto-merge non-overlapping changes. It only stops when it can't decide which version is 'right'."],
    },
    {
      id: "git0-012-q2",
      type: "choice",
      text: "After manually editing a conflict and removing all markers, what is the next step?",
      options: [
        "`git merge --continue`",
        "`git resolve filename`",
        "`git add filename`, then `git commit`",
        "`git push` to sync",
      ],
      answer: "`git add filename`, then `git commit`",
      hints: ["Staging a file tells Git 'I've resolved this'. Then committing finalizes the merge."],
    },
    {
      id: "git0-012-q3",
      type: "choice",
      text: "How do you cancel a merge that's in progress and return to the pre-merge state?",
      options: [
        "`git merge --undo`",
        "`git reset HEAD`",
        "`git merge --abort`",
        "`git checkout main`",
      ],
      answer: "`git merge --abort`",
      hints: ["This is the escape hatch — it puts everything back to before `git merge` was run."],
    },
  ],

  definitions: [
    { term: "conflict resolution", definition: "The process of editing conflict-marked files to their correct final state, removing all markers, then staging and committing to complete the merge." },
    { term: "diff3 style", definition: "An optional conflict marker style (`git config merge.conflictstyle diff3`) that adds a third section showing the common ancestor's version for extra context." },
    { term: "unmerged path", definition: "A file shown in `git status` as conflicted and awaiting resolution during an in-progress merge." },
  ],
};

export default lesson;

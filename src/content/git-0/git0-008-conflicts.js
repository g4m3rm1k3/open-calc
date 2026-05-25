const lesson = {
  id: "git-0-008",
  slug: "the-conflict-zone",
  chapter: "git-0",
  order: 8,
  title: "Merge Conflicts",
  subtitle: "When two branches change the same thing",
  tags: ["git", "merge conflict", "conflict resolution", "fundamentals"],
  aliases: ["conflict markers", "resolve conflict", "merge conflict", "<<<<<<"],

  hook: `Git stops mid-merge. Red text in your terminal. The word CONFLICT in capital letters. Two branches edited the same line and Git has no idea which version you want — it needs a human to decide. Conflicts are not errors. They're a normal part of parallel development, and resolving them takes less than two minutes once you know how to read the markers.`,

  mentalModel: [
    "A conflict means two branches both changed the same lines relative to their common ancestor. Git stops and leaves both versions in the file for you to choose between.",
    "VS Code opens a dedicated merge editor — Accept Current Change / Accept Incoming Change / Accept Both / Compare Changes. It's the same job as editing the markers by hand, just with a GUI.",
    "Resolution is always: edit the file to the correct final state, remove all conflict markers, stage the file, commit.",
  ],

  intuition: {
    prose: [
      "When you trigger a merge that conflicts, Git pauses before finishing. It writes both versions of every conflicting section into the file, separated by three markers. Everything between `<<<<<<< HEAD` and `=======` is your current branch's version. Everything between `=======` and `>>>>>>> feature` is the incoming branch's version. Your job is to edit the file until it contains exactly what you want — whether that's one version, the other, or a combination — and then delete all three marker lines.",
      "In VS Code, conflicting files show up in the Source Control sidebar with a red **C**. Click the file and VS Code opens its merge editor: a three-panel view showing Your Changes (left), Incoming Changes (right), and the Result (bottom). Buttons above each section let you accept one side, accept both, or ignore. You can also directly edit the Result panel. When you're done, save the result. This is the most visual way to resolve conflicts — VS Code also inline-highlights the markers in the normal editor with colored Accept buttons at the top of each section.",
      "In the terminal: `git status` shows `both modified: game-design.txt`. Open the file in your editor, find the markers, resolve them, save. Then `git add game-design.txt` to stage the resolution. Then `git commit` — Git pre-fills the message as `Merge branch 'feature'`. Done.",
      "Create a conflict deliberately here. Branch from main, edit the win condition line in `game-design.txt`, commit on `feature`. Switch to `main`, edit that same line differently, commit. Switch back to `main` and merge `feature`. The merge will stop with a conflict. Open the file, read both versions, decide what you want, delete the markers, stage, and commit the resolution. You've just resolved your first conflict.",
    ],
    visualizations: [
      {
        id: "GitWorkspace",
        mathBridge:
          "**When a conflict occurs, VS Code's Source Control sidebar marks the file with a red C.** Click it to open the merge editor:\n- **Accept Current Change** → keeps HEAD's version (your branch)\n- **Accept Incoming Change** → keeps the other branch's version\n- **Accept Both Changes** → puts both versions one after the other\n- **Compare Changes** → shows a diff side by side\n\nYou can also edit the result panel directly for custom resolutions.\n\nTerminal workflow during a conflict:\n```\ngit status                          # shows 'both modified: filename'\n# Edit the file, remove markers\ngit add filename                    # stage the resolution\ngit commit                          # completes the merge\n# or to cancel the entire merge:\ngit merge --abort\n```",
        props: {
          label: "dungeon-explorer",
          instanceId: "git-0-project",
          showStaging: true,
          showBranching: true,
          initialFiles: {
            "game-design.txt":
              "GAME CONCEPT: Dungeon Explorer\n\nWin condition: reach the exit room.\nLose condition: health drops to zero.\n\nRooms: 10 per level\nLevels: 3",
            "controls.txt":
              "CONTROLS\n\nMove: arrow keys\nInteract: space\nPause: escape",
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**The three-way merge algorithm.** Git doesn't compare your two branch tips directly. It finds the most recent common ancestor first, then computes what changed from the ancestor to each tip. If neither branch touched a section of code, it keeps it as-is. If only one branch changed a section, it applies that change. A conflict only triggers when both branches changed the same lines relative to the base. This is why most merges succeed automatically — only genuinely overlapping changes produce conflicts.",
      "**A conflict doesn't stop other files.** Only the conflicting file(s) are blocked. Files that merged cleanly are already staged and ready. `git status` during a conflict shows both: `Changes to be committed: controls.txt` (clean merge, already staged) and `Unmerged paths: game-design.txt` (needs resolution). You only need to resolve the unmerged paths.",
      "**`git merge --abort` is your reset button.** If you start a merge, see the conflicts, and decide you're not ready to resolve them, `git merge --abort` returns everything exactly to the state it was in before you ran `git merge`. No history is changed. No working directory damage. You can try again whenever you're ready.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Never commit conflict markers",
        body: "Committing a file that still contains `<<<<<<<` markers will break your code or your tests. Before committing a resolution, search the file for `<<<<<<<` to confirm all markers are gone. VS Code highlights unresolved markers in red. Most CI pipelines will catch this too — but catching it yourself is faster.",
      },
      {
        type: "tip",
        title: "Conflicts get easier fast",
        body: "Your first conflict feels alarming. By the tenth, it's routine. Professional developers resolve conflicts every week. Git handled everything it could automatically — it only stopped for the cases where a human genuinely needs to decide. That's not a failure; it's the system working correctly.",
      },
    ],
  },

  examples: [
    {
      title: "A conflict in full",
      body: "# Two branches both edited line 3 of game-design.txt\n\n# The file after git merge feature:\n<<<<<<< HEAD\nWin condition: collect all three keys\n=======\nWin condition: defeat the final boss\n>>>>>>> feature\n\n# You decide: edit the file to:\nWin condition: collect all three keys and defeat the final boss\n\n# Then:\ngit add game-design.txt\ngit commit -m 'Merge feature: combine win conditions'",
    },
    {
      title: "Checking conflict status",
      body: "git status\n# On branch main\n# You have unmerged paths.\n#   (fix conflicts and run 'git commit')\n#   (use 'git merge --abort' to abort the merge)\n#\n# Unmerged paths:\n#   both modified:   game-design.txt\n#\n# Changes to be committed:\n#   modified:   controls.txt  ← this merged cleanly, already staged",
    },
  ],

  assessment: {
    questions: [
      {
        id: "git0-008-q1",
        type: "choice",
        text: "After a merge conflict, what must you do before you can complete the merge?",
        options: [
          "Run `git merge --force` to override the conflict",
          "Delete both branches and start over",
          "Edit the conflicting file(s) to remove markers, stage them, and commit",
          "Run `git pull` to fetch the correct version",
        ],
        answer:
          "Edit the conflicting file(s) to remove markers, stage them, and commit",
      },
      {
        id: "git0-008-q2",
        type: "choice",
        text: "In a conflict marker block, what does the section between `=======` and `>>>>>>>` contain?",
        options: [
          "The version from your current branch (HEAD)",
          "The version from the branch you are merging in",
          "The version from the common ancestor commit",
          "The combined version Git recommends",
        ],
        answer: "The version from the branch you are merging in",
      },
      {
        id: "git0-008-q3",
        type: "choice",
        text: "What does `git merge --abort` do?",
        options: [
          "Commits the conflict markers as-is",
          "Deletes all uncommitted changes",
          "Returns everything to the state before `git merge` was run",
          "Forces a merge ignoring all conflicts",
        ],
        answer: "Returns everything to the state before `git merge` was run",
      },
    ],
  },
};

export default lesson;

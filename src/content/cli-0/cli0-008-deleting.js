const lesson = {
  id: "cli-0-008",
  slug: "deleting",
  chapter: "cli-0",
  order: 8,
  title: "Deleting Files",
  subtitle: "rm, rm -r, and why rm -rf demands respect",
  tags: ["cli", "rm", "delete", "remove", "rm -rf"],
  aliases: ["delete file terminal", "rm command", "remove file", "rm -rf explained"],

  hook: `The terminal has no trash can. When you delete with rm, it's gone. Not in Trash. Not recoverable with Ctrl+Z. Gone. This lesson is about using that power correctly.`,

  mentalModel: [
    "`rm filename` deletes a file permanently and immediately. There is no undo, no Trash, no confirmation by default.",
    "`rm -r directory/` deletes a directory and everything inside it recursively. The `-r` flag makes the destructive intent explicit.",
    "`rm -rf path` combines recursive (`-r`) and force (`-f`, suppress errors on missing files). This is the 'scorched earth' command. It is used legitimately in scripts (e.g., `rm -rf node_modules/`) but also causes legendary data-loss incidents when typed carelessly.",
  ],

  intuition: {
    prose: [
      "In a GUI, deleting a file moves it to Trash. You can undo it. The file sits there until you 'Empty Trash'. The terminal does not work this way. `rm file.txt` removes the file from the filesystem immediately. The data isn't really gone from the disk until that space is reused — but from the perspective of your user account and any file manager, it is unrecoverable.",
      "This sounds alarming, but in practice it means: **think before you run rm**. Before `rm` on anything important, use `ls` to confirm you're looking at what you think you're looking at. Use `rm -i` (interactive) in automated scripts to be prompted. Keep version control (git) for code. Keep backups for critical data.",
      "`rm -r directory/` is for directories. Without `-r`, `rm` refuses to delete directories: 'is a directory'. You must explicitly opt in with `-r`. The force flag `-f` suppresses errors — `rm -f nonexistent.txt` exits silently instead of printing an error. Combined: `rm -rf path` deletes everything under path with no error messages and no confirmation.",
      "`rm -rf` has a legitimate use: clearing build artifacts. `rm -rf dist/` before a rebuild, `rm -rf node_modules/` before a fresh `npm install`, `rm -rf .git/` to de-initialize a repository. These are safe because you're removing generated or reinstallable content. The danger is: `rm -rf ~/` (home directory), `rm -rf /` (entire system), or a typo that hits the wrong path.",
    ],
    visualizations: [
      {
        id: "ShellTerminal",
        mathBridge:
          "**Practice safe deletion:**\n\n```bash\n# Inspect before deleting\nls\n\n# Delete a single file\nrm temp.txt\nls   # confirm it's gone\n\n# Delete a directory (requires -r)\nrm -r old-build/\n\n# Try to delete a non-empty directory without -r\nrm src/\n# Error: src is a directory\n\n# Delete with confirmation prompt (-i flag)\nrm -i important.txt\n# respond 'y' to confirm\n```\n\n⚠️ There is no undo. Verify paths before deleting.",
        props: {
          welcomeMessage: "Practice rm carefully. Use ls before and after to verify.",
          initialCwd: "/home/user/project",
          initialFiles: {
            "/home/user/project/": null,
            "/home/user/project/temp.txt": "This is a temporary file. Safe to delete.",
            "/home/user/project/important.txt": "This file has important data. Be careful!",
            "/home/user/project/notes.txt": "Meeting notes\n- Ship by Friday\n- Review PRs",
            "/home/user/project/old-build/": null,
            "/home/user/project/old-build/app.min.js": "// minified build output\n(function(){var a=1;})();",
            "/home/user/project/old-build/style.min.css": "body{margin:0}",
            "/home/user/project/src/": null,
            "/home/user/project/src/game.js": "// game logic — do not delete!",
            "/home/user/project/src/player.js": "// player state — do not delete!",
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Why rm is fast.** When you delete a file, the OS removes the directory entry and marks the disk blocks as free. The data isn't erased — it's just no longer addressable through the filesystem. This is why: (1) `rm` is nearly instantaneous even for large files; (2) data recovery tools can sometimes recover recently deleted files by scanning disk blocks directly; (3) truly secure deletion requires overwriting the blocks, which `shred` or `srm` do.",
      "**rm -rf / — the legendary disaster.** Running `rm -rf /` attempts to delete the entire filesystem — the OS, your files, everything. Modern systems protect against this with a `--no-preserve-root` flag that must be explicitly added. But typos like `rm -rf ~/projects /` (note the space before `/`) have caused real data loss. The extra space separates two arguments: `~/projects` and `/`. The second `/` deletes the root filesystem.",
      "**Safe alternatives for scripts.** In automated scripts, consider: (1) `rm -i` prompts before each deletion; (2) move to a temp directory first, verify, then delete; (3) use a 'trash' CLI tool that moves to trash instead of deleting. For build scripts, `rm -rf dist/` is standard and safe — it's reproducible output that `npm run build` will recreate.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Always ls before rm -r",
        body: "Before `rm -r path/`, run `ls path/` to see what's inside. Before `rm *.txt`, run `ls *.txt` to see which files match. One extra second of verification prevents a lot of grief.",
      },
      {
        type: "tip",
        title: "Use git as your safety net for code",
        body: "If all your code is in git commits, `rm -rf src/` is recoverable: `git checkout src/` restores it. This is why version control matters — it makes even destructive operations reversible for code.",
      },
    ],
  },

  examples: [
    {
      title: "Clean up build artifacts safely",
      body: "# These are all safe — generated output, not source code\nrm -rf dist/\nrm -rf build/\nrm -rf node_modules/\nrm -rf .cache/\nrm -rf coverage/\n\n# After cleanup, regenerate:\nnpm install   # restores node_modules\nnpm run build # restores dist/",
    },
    {
      title: "Verify before deleting",
      body: "# Step 1: see what matches\nls *.log\n# access.log  error.log  debug.log\n\n# Step 2: delete only if correct\nrm *.log\n\n# For directories:\nls -la temp/\n# (review the contents)\nrm -r temp/",
    },
  ],

  assessment: {
    questions: [
      {
        id: "cli0-008-q1",
        type: "choice",
        text: "What happens to a file deleted with `rm` on a Unix system?",
        options: [
          "It goes to the Trash/Recycle Bin",
          "It's hidden until you empty the trash",
          "It's removed from the filesystem immediately with no built-in recovery",
          "It stays on disk until the system is rebooted",
        ],
        answer: 2,
        explanation: "`rm` removes the filesystem entry immediately. There is no Trash, no undo, no built-in recovery. The disk blocks may be recoverable with forensic tools until overwritten, but from a normal user perspective the file is gone.",
      },
      {
        id: "cli0-008-q2",
        type: "choice",
        text: "What does the `-f` flag add to `rm -r`?",
        options: [
          "Forces deletion of read-only files",
          "Suppresses error messages for missing files",
          "Makes the deletion permanent (without -f it's reversible)",
          "Deletes files immediately without moving to any buffer",
        ],
        answer: 1,
        explanation: "`-f` (force) suppresses error messages when files don't exist. Without `-f`, `rm nonexistent.txt` prints an error. With `-f`, it exits silently. Combined with `-r`, `rm -rf` deletes recursively and silently ignores missing files — commonly used in build scripts where some targets may not exist.",
      },
    ],
  },
};

export default lesson;

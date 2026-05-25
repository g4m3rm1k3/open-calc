const lesson = {
  id: "cli-0-007",
  slug: "copy-and-move",
  chapter: "cli-0",
  order: 7,
  title: "Moving and Copying",
  subtitle: "cp, cp -r, and mv — two operations that cover everything",
  tags: ["cli", "cp", "mv", "copy", "move", "rename"],
  aliases: [
    "copy file terminal",
    "move file terminal",
    "rename file",
    "cp command",
    "mv command",
  ],

  hook: `Every file management task — copy, move, rename, reorganize — comes down to two commands: cp and mv. Rename is just mv with a new name in the same directory.`,

  mentalModel: [
    "`cp source destination` copies a file. The original remains. For directories, use `cp -r` (recursive) to copy the entire tree.",
    "`mv source destination` moves a file — the original is removed. **Renaming is the same operation**: `mv oldname.txt newname.txt` renames the file in place.",
    "If the destination is an existing **directory**, both `cp` and `mv` place the file inside it: `cp file.txt docs/` copies `file.txt` into the `docs/` directory as `docs/file.txt`.",
  ],

  intuition: {
    prose: [
      "`cp` copies a file. `cp README.md README-backup.md` creates a duplicate named `README-backup.md`. The original `README.md` is unchanged. If the destination path ends in an existing directory name, the file is copied into that directory: `cp README.md docs/` creates `docs/README.md`.",
      "For directories, you need the `-r` (recursive) flag: `cp -r src/ src-backup/` copies the entire `src/` directory tree. Without `-r`, `cp` refuses to copy a directory and prints an error.",
      "`mv` moves a file — or more precisely, it changes its path. `mv notes.txt archive/notes.txt` removes `notes.txt` and places it at `archive/notes.txt`. The file's contents are identical; only its location changed. If source and destination are in the same directory, this is a rename: `mv notes.txt my-notes.txt` renames the file.",
      "A useful pattern: organize files by extension. `mv *.js src/` moves all JavaScript files to `src/`. `mv *.css styles/` moves all CSS files. This restructuring takes one command per type instead of many individual moves. (Glob patterns like `*.js` are expanded by the shell before mv sees them.)",
    ],
    visualizations: [
      {
        id: "ShellTerminal",
        mathBridge:
          "**Practice copy and move operations:**\n\n```bash\n# List what's here\nls\n\n# Copy a file\ncp game-design.txt game-design-backup.txt\nls\n\n# Rename a file (mv in same directory)\nmv game-design-backup.txt design-v1.txt\nls\n\n# Move a file into a directory\nmkdir archive\nmv design-v1.txt archive/\nls archive/\n\n# Copy a whole directory\ncp -r src/ src-backup/\nls\n```",
        props: {
          welcomeMessage: "Practice cp and mv. Both commands are available.",
          initialCwd: "/home/user/project",
          initialFiles: {
            "/home/user/project/": null,
            "/home/user/project/game-design.txt":
              "# Dungeon Game Design\n\n## Concept\nTop-down dungeon crawler with procedural generation.\n\n## Win condition\nReach level 10 and defeat the boss.\n\n## Mechanics\n- Turn-based movement\n- Item collection\n- Random enemy spawns",
            "/home/user/project/controls.txt":
              "# Controls\n\nWASD — move\nE    — interact\nI    — inventory\nEsc  — pause\nQ    — quit to menu",
            "/home/user/project/src/": null,
            "/home/user/project/src/game.js":
              "// Main game loop\nfunction tick() {\n  processInput();\n  updateWorld();\n  render();\n}\n\nsetInterval(tick, 100);",
            "/home/user/project/src/player.js":
              "// Player state\nconst player = {\n  x: 0, y: 0,\n  hp: 100,\n  inventory: [],\n};",
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**mv is atomic on the same filesystem.** When you move a file within the same disk/partition, `mv` just updates the directory entry — no data is actually copied. This makes it nearly instantaneous even for huge files. Moving across filesystems (e.g., from internal SSD to USB drive) requires copying the data, so it takes time proportional to file size.",
      "**Overwrite behavior.** By default, `cp` and `mv` silently overwrite the destination if it already exists. `cp file.txt important.txt` destroys `important.txt` with no warning. Use `cp -i` (interactive) to be prompted before overwriting. This is a common source of data loss — be careful with destination paths.",
      "**Glob expansion.** When you type `mv *.txt docs/`, the shell expands `*.txt` before `mv` runs. If there are 20 `.txt` files, `mv` receives 21 arguments: 20 source files and `docs/` as the destination. This is why `mv *.txt docs/` only works when `docs/` is an existing directory — `mv` with more than 2 arguments requires the last argument to be a directory.",
    ],
    callouts: [
      {
        type: "warning",
        title: "cp and mv overwrite without warning",
        body: "Both commands silently overwrite existing files at the destination. Use `cp -i` or `mv -i` (interactive) to be prompted: `cp -i source.txt existing.txt` will ask 'overwrite existing.txt?' before proceeding.",
      },
      {
        type: "tip",
        title: "Quick rename pattern",
        body: "`mv filename.txt filename.md` renames a file by changing its extension. `mv old-name.txt new-name.txt` renames it entirely. This is identical to moving — Unix doesn't distinguish between the two.",
      },
    ],
  },

  examples: [
    {
      title: "Reorganize a project",
      body: "# Before: everything in root\nls\n# index.html  style.css  app.js  utils.js  logo.png  hero.jpg\n\n# Create structure\nmkdir src public/images\n\n# Move files to appropriate folders\nmv app.js utils.js src/\nmv logo.png hero.jpg public/images/\n# index.html and style.css stay in root\n\nls\n# index.html  style.css  src/  public/",
    },
    {
      title: "Make a backup before editing",
      body: "# Always back up critical configs before editing\ncp nginx.conf nginx.conf.bak\n\n# Now edit with confidence\n# nano nginx.conf\n\n# If something breaks, restore:\nmv nginx.conf nginx.conf.broken\nmv nginx.conf.bak nginx.conf",
    },
  ],

  assessment: {
    questions: [
      {
        id: "cli0-007-q1",
        type: "choice",
        text: "What is the result of `mv config.txt settings.txt` when both files are in the same directory?",
        options: [
          "config.txt is moved into a folder called settings.txt",
          "config.txt is renamed to settings.txt (and if settings.txt existed, it's overwritten)",
          "Both files are combined into a new file",
          "An error — mv cannot rename files",
        ],
        answer: 1,
        explanation:
          "When the destination doesn't exist as a directory, `mv` renames the source to that name. If `settings.txt` already existed, it's silently overwritten. Use `mv -i` to be prompted before overwriting.",
      },
      {
        id: "cli0-007-q2",
        type: "choice",
        text: "Why does `cp src/ backup/` fail when `src/` is a directory?",
        options: [
          "cp cannot operate on directories at all",
          "cp requires the `-r` flag to copy directories recursively",
          "You must use mv to copy directories",
          "The destination name must match the source name",
        ],
        answer: 1,
        explanation:
          "`cp -r src/ backup/` copies the directory and all its contents. The `-r` (recursive) flag is required because directories can contain other directories — cp needs explicit permission to descend into the tree.",
      },
    ],
  },
};

export default lesson;

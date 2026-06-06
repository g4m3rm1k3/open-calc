const lesson = {
  id: "cli-0-003",
  slug: "navigating-files",
  chapter: "cli-0",
  order: 3,
  title: "Navigating the Filesystem",
  subtitle: "ls, cd, and the difference between absolute and relative paths",
  tags: ["cli", "ls", "cd", "paths", "navigation"],
  aliases: [
    "cd command",
    "ls command",
    "file paths",
    "relative absolute",
    "navigate terminal",
  ],

  hook: `The filesystem is a tree. You are always standing at one node of that tree — your current working directory. Every command you run either reads from or writes to a path, and understanding paths means understanding everything else.`,

  mentalModel: [
    "**Absolute paths** start with `/`. They describe a location from the root of the entire filesystem: `/home/user/projects`. They work from anywhere.",
    "**Relative paths** describe a location relative to where you are right now. `projects/website` means 'projects/website inside my current directory'. `..` means 'one level up'. `../other` means 'up one level, then into other'.",
    "`~` is an alias for your home directory. `~/projects` is identical to `/home/user/projects`. It works in any command that takes a path.",
  ],

  intuition: {
    prose: [
      "The filesystem is a tree of directories. The root is `/`. Everything on the computer — files, programs, settings — lives somewhere in that tree. When you open a terminal, you start at your home directory: `/home/user` on Linux, `/Users/username` on macOS. This is called your **current working directory** (cwd).",
      "`pwd` (print working directory) tells you where you are right now. It's the first command to run when you're disoriented. `ls` shows what's in the current directory. `cd` moves you to a different directory. These three commands are enough to explore any filesystem.",
      "Absolute paths begin with `/` and describe the full route from root to destination. `/home/user/projects/website` means: start at `/`, go into `home`, into `user`, into `projects`, into `website`. This path works from anywhere — you don't need to know where you currently are.",
      "Relative paths are shortcuts based on your current location. If you're in `/home/user`, then `projects` means `/home/user/projects`, and `projects/website` means `/home/user/projects/website`. Two special relative paths: `.` means 'current directory' and `..` means 'parent directory'. So `../../etc` from `/home/user` means `/etc`.",
    ],
    visualizations: [
      {
        id: "ShellTerminal",
        mathBridge:
          "**Navigate the directory structure below:**\n\n```\n/home/user/\n├── projects/\n│   ├── website/\n│   │   ├── index.html\n│   │   └── style.css\n│   └── api/\n│       └── server.js\n└── documents/\n    └── notes.txt\n```\n\n- `ls` — see what's here\n- `cd projects` — go into projects (relative)\n- `ls -la` — see all files including hidden\n- `cd ..` — go back up\n- `cd ~/documents` — go to documents using ~\n- `cd /` — go to root (absolute)\n- `pwd` — confirm where you are",
        props: {
          welcomeMessage:
            "Explore the filesystem. Start with: pwd, ls, then try cd.",
          initialCwd: "/home/user",
          initialFiles: {
            "/home/user/projects/": null,
            "/home/user/projects/website/": null,
            "/home/user/projects/website/index.html":
              "<!DOCTYPE html>\n<html>\n<head><title>My Site</title></head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>",
            "/home/user/projects/website/style.css":
              "body {\n  margin: 0;\n  font-family: sans-serif;\n  background: #0d1117;\n  color: white;\n}",
            "/home/user/projects/api/": null,
            "/home/user/projects/api/server.js":
              "const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.send('API running');\n});\n\napp.listen(3000);",
            "/home/user/documents/": null,
            "/home/user/documents/notes.txt":
              "Meeting notes\n- Ship by Friday\n- Fix the login bug\n- Write integration tests\n- Review PR from Sarah",
            "/home/user/.bashrc":
              "# Shell configuration file\nexport PATH=$PATH:/usr/local/bin\nalias ll='ls -la'\nalias gs='git status'",
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**The filesystem tree.** On Unix systems, there is one single tree rooted at `/`. Disks, USB drives, and network shares are **mounted** at points in that tree — `/mnt/usb`, `/Volumes/ExternalDrive` on macOS. This is different from Windows, which uses drive letters (`C:\\`, `D:\\`) that each have their own separate tree. On Unix, there is always exactly one root.",
      "**Path separators.** Unix uses forward slash `/` as the path separator. Windows uses backslash `\\`. This is why Windows paths look like `C:\\Users\\user\\Desktop` and Unix paths look like `/home/user/Desktop`. In most modern Windows tooling (WSL, Git Bash, PowerShell), you can use forward slashes too, but native Windows APIs expect backslashes.",
      "**Hidden files.** Files and directories whose names start with `.` are hidden from normal `ls` output. These are typically configuration files: `.bashrc`, `.gitignore`, `.env`, `.vscode/`. To see them, use `ls -a` (all) or `ls -la` (all + long format). They're not hidden for security — they're hidden to reduce visual clutter, since config files aren't files you open directly.",
    ],
    callouts: [
      {
        type: "tip",
        title: "cd with no arguments goes home",
        body: "`cd` alone (no argument) takes you back to your home directory. Same as `cd ~` or `cd $HOME`. If you get lost deep in the filesystem, just type `cd` and press Enter.",
      },
      {
        type: "tip",
        title: "cd - goes to previous directory",
        body: "`cd -` takes you back to the last directory you were in — like the Back button in a file browser. If you cd'd from `/home/user` to `/etc/nginx/conf.d`, `cd -` brings you back to `/home/user`. Run it again and you're back in `/etc/nginx/conf.d`.",
      },
    ],
  },

  examples: [
    {
      title: "Absolute vs relative: same destination",
      body: "# You are in /home/user\n\n# Absolute path — works from anywhere\ncd /home/user/projects/website\n\n# Relative path — works only from /home/user\ncd projects/website\n\n# Using tilde — works from anywhere\ncd ~/projects/website\n\n# All three end up at the same place.\n# Verify with: pwd",
    },
    {
      title: "Navigating with ..",
      body: "# You are in /home/user/projects/website\npwd\n# /home/user/projects/website\n\ncd ..\npwd\n# /home/user/projects\n\ncd ../..\npwd\n# /home/user\n\ncd ../documents\npwd\n# /home/user/documents",
    },
  ],

  quiz: [
    {
      id: "cli0-003-q1",
      type: "choice",
      text: "You are in `/home/user/projects`. Which command takes you to `/home/user/documents`?",
      options: [
        "`cd documents`",
        "`cd /documents`",
        "`cd ../documents`",
        "`cd ~/projects/../documents`",
      ],
      answer: "`cd ../documents`",
      hints: [
        "`..` goes up one level to `/home/user`, then `documents` goes into that directory. `cd documents` would look for `/home/user/projects/documents` (doesn't exist). `cd /documents` would look for a top-level `/documents` (wrong).",
      ],
    },
    {
      id: "cli0-003-q2",
      type: "choice",
      text: "What does `ls -a` show that `ls` does not?",
      options: [
        "Files in all subdirectories",
        "Hidden files (names starting with .)",
        "File sizes in human-readable format",
        "Files sorted alphabetically",
      ],
      answer: "Hidden files (names starting with .)",
      hints: [
        "`-a` (all) shows files whose names start with `.` — these are hidden by default to reduce clutter. Common hidden files include `.bashrc`, `.gitignore`, `.env`, and config directories like `.vscode/`.",
      ],
    },
  ],

  definitions: [
    { term: "absolute path", definition: "A file path starting from the filesystem root `/`. Works from any directory: `/home/user/projects`. Unambiguous regardless of where you are." },
    { term: "relative path", definition: "A path described relative to the current working directory. `projects/website` means 'inside my current directory'. `..` means parent directory." },
    { term: "home directory", definition: "The personal directory for your user account. On Linux: `/home/username`. On macOS: `/Users/username`. Abbreviated as `~` in the shell." },
    { term: "cd -", definition: "Goes to the previous working directory — like a Back button. Alternates between the current and last directory each time you run it." },
  ],
};

export default lesson;

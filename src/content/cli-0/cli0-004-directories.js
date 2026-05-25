const lesson = {
  id: "cli-0-004",
  slug: "directories",
  chapter: "cli-0",
  order: 4,
  title: "Working with Directories",
  subtitle: "mkdir, mkdir -p, and rmdir",
  tags: ["cli", "mkdir", "rmdir", "directories", "folders"],
  aliases: ["create directory", "mkdir", "make folder", "delete directory"],

  hook: `Setting up a project's folder structure from the terminal takes ten seconds. Understanding the tree you're building — and how to safely remove parts of it — is a core developer skill.`,

  mentalModel: [
    "`mkdir name` creates a single directory. The parent must already exist — it won't create `/home/user/projects/new-project` if `projects` doesn't exist yet.",
    "`mkdir -p path/to/nested/dir` creates the entire path at once, including any missing parent directories. This is the version you use most in practice.",
    "`rmdir name` removes an **empty** directory. If the directory contains files, it fails. This is a safety feature — to remove a directory with contents, you need the explicit `rm -r` command covered in lesson 8.",
  ],

  intuition: {
    prose: [
      "When you start a new project, you usually create a set of directories to organize your work. A typical web project might need `src/`, `src/components/`, `src/styles/`, `public/`, and `tests/`. In a file browser, that's six separate folder-creation operations. In the terminal: `mkdir -p src/components src/styles public tests` — done in one line.",
      "`mkdir -p` is the workhorse version. The `-p` flag means 'parents' — create every directory in the path, even if intermediate directories don't exist yet. `mkdir -p a/b/c/d` creates `a/`, `a/b/`, `a/b/c/`, and `a/b/c/d/` all at once. Without `-p`, `mkdir a/b/c/d` would fail if `a/` doesn't exist.",
      "`rmdir` is intentionally limited. It only removes empty directories. This is a safety net — you can't accidentally delete a directory full of work with a typo. If you try `rmdir projects` and `projects` contains files, you'll get 'Directory not empty'. To remove a directory and everything inside it, you use `rm -r` (covered in the Deleting lesson) which you must type deliberately.",
      "Good directory naming practice: lowercase, no spaces (use hyphens or underscores instead), descriptive names. Spaces in directory names require quoting or escaping everywhere: `cd 'My Projects'` or `cd My\ Projects`. Most developers avoid spaces in paths entirely.",
    ],
    visualizations: [
      {
        id: "ShellTerminal",
        mathBridge:
          "**Build a project structure from scratch:**\n\nYour starting point is an empty `/home/user/`. Try:\n```\nmkdir projects\ncd projects\nmkdir -p dungeon-game/src dungeon-game/assets dungeon-game/tests\nls dungeon-game\ncd dungeon-game\nls\n```\n\nThen try removing a directory:\n```\nrmdir tests           # works (empty)\nrmdir src             # works (empty)\ncd ..\nrmdir dungeon-game    # fails — still has assets/\n```",
        props: {
          welcomeMessage: "Build a project structure. Start with: mkdir projects",
          initialFiles: {},
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**mkdir with multiple arguments.** `mkdir` accepts multiple directory names: `mkdir src tests public docs`. This creates all four directories in the current location. You can combine this with `-p`: `mkdir -p src/components src/utils tests/unit tests/integration`. Each argument is handled independently.",
      "**Directory permissions.** When you create a directory, it gets default permissions based on your `umask` setting. You can specify permissions explicitly: `mkdir -m 755 dirname` creates a directory with `rwxr-xr-x` permissions. In practice, you'll almost never need this for a personal project, but it's essential when setting up web servers where file permissions control what the server process can access.",
      "**The . and .. entries.** Every directory contains two special entries: `.` (the directory itself) and `..` (its parent). You can see them with `ls -la`. They're always present and cannot be removed. They're how relative paths work — `cd ../sibling` literally means 'follow the `..` link to my parent, then go into `sibling`'.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Create a consistent project scaffold",
        body: "Many developers create a shell alias or script for their standard project structure. Once you know your preferred layout (e.g., `src/`, `tests/`, `docs/`, `public/`), you can create it every time with one command.",
      },
      {
        type: "info",
        title: "mkdir -p doesn't fail if directory exists",
        body: "Unlike plain `mkdir`, `mkdir -p` won't error out if the directory already exists. This makes it safe to use in scripts — you can run it multiple times without checking first.",
      },
    ],
  },

  examples: [
    {
      title: "Scaffold a web project",
      body: "# One command creates the entire structure\nmkdir -p my-site/src/components\nmkdir -p my-site/src/styles\nmkdir -p my-site/public/images\nmkdir -p my-site/tests\n\n# Verify\nfind my-site -type d\n# my-site\n# my-site/src\n# my-site/src/components\n# my-site/src/styles\n# my-site/public\n# my-site/public/images\n# my-site/tests",
    },
    {
      title: "Safe directory removal",
      body: "# Remove an empty directory\nrmdir old-tests\n\n# This fails — directory has content:\nrmdir src\n# Error: src: Directory not empty\n\n# To remove with contents, you need:\n# rm -r src\n# (covered in the Deleting lesson — requires deliberate choice)",
    },
  ],

  assessment: {
    questions: [
      {
        id: "cli0-004-q1",
        type: "choice",
        text: "You want to create the path `src/components/ui` in one command. Which works?",
        options: [
          "`mkdir src/components/ui`",
          "`mkdir -p src/components/ui`",
          "`mkdir src && mkdir components && mkdir ui`",
          "`mkdir ui/components/src`",
        ],
        answer: 1,
        explanation: "`mkdir -p src/components/ui` creates all three directories in order, even if `src/` and `src/components/` don't exist yet. Plain `mkdir src/components/ui` would fail if any parent is missing.",
      },
      {
        id: "cli0-004-q2",
        type: "choice",
        text: "Why does `rmdir projects` fail if `projects` contains files?",
        options: [
          "rmdir only works on empty directories — this is a safety feature",
          "rmdir is deprecated; use rm instead",
          "You need sudo to remove non-empty directories",
          "rmdir only works with the -r flag for non-empty directories",
        ],
        answer: 0,
        explanation: "`rmdir` is intentionally designed to only remove empty directories. This prevents you from accidentally deleting an entire directory tree with a typo. To remove a directory and its contents, you must deliberately use `rm -r`, which makes the destructive intent explicit.",
      },
    ],
  },
};

export default lesson;

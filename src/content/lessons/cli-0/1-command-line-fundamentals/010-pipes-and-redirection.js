const lesson = {
  id: "cli-0-010",
  slug: "pipes-and-redirection",
  chapter: "cli-0",
  order: 10,
  title: "Pipes, Redirection, and the Shell Environment",
  subtitle: "Composing commands with |, >, >>, env vars, and aliases",
  tags: [
    "cli",
    "pipe",
    "redirect",
    "env",
    "export",
    "alias",
    "$PATH",
    "environment variables",
  ],
  aliases: [
    "pipe command",
    "redirect output",
    "environment variables",
    "export variable",
    "alias terminal",
  ],

  hook: `The pipe operator \`|\` is Unix's most powerful idea: small tools that do one thing well, chained together to do anything. This lesson teaches you how to compose commands and understand the shell environment they run in.`,

  mentalModel: [
    "`cmd1 | cmd2` connects the stdout of cmd1 to the stdin of cmd2. The output of the first command becomes the input of the second. Chains can be arbitrarily long: `cmd1 | cmd2 | cmd3 | cmd4`.",
    "Environment variables are named values your shell and programs read at runtime. `$PATH` tells the shell where to find executables. `export VARNAME=value` sets a variable that child processes inherit.",
    "`alias shortname='long command'` creates a shortcut. `alias ll='ls -la'` makes `ll` expand to `ls -la`. Aliases are temporary by default; add them to `~/.bashrc` or `~/.zshrc` to make them permanent.",
  ],

  intuition: {
    prose: [
      "Every Unix command reads from stdin and writes to stdout. `cat file.txt` writes the file to stdout. `grep 'ERROR'` reads lines from stdin and writes matching lines to stdout. Piping connects them: `cat app.log | grep 'ERROR'` feeds the log through grep, and only error lines appear. The pipe `|` is a connector between any two programs — it doesn't matter what they're written in, as long as they use stdin/stdout.",
      "Chains emerge naturally. `cat app.log | grep 'ERROR' | wc -l` counts the number of error lines in a log. `ls -la | grep '.js'` lists only JavaScript files in the directory. `cat data.csv | head -n 5` shows the first 5 lines. Each command adds one transformation. The last command's stdout goes to the terminal (unless you add `> file` at the end to redirect it to a file).",
      "Environment variables are global key-value pairs available to any process. `$HOME` is your home directory. `$USER` is your username. `$PATH` is a colon-separated list of directories the shell searches for executables: `/usr/local/bin:/usr/bin:/bin`. When you type `node`, the shell looks for `node` in each directory listed in `$PATH` in order. `echo $PATH` shows the current value. `export PATH=$PATH:/new/dir` adds a new directory to the end.",
      "`export VARNAME=value` sets an environment variable and marks it for export to child processes. Without `export`, the variable exists only in the current shell and isn't visible to programs you launch. `export API_KEY=abc123` sets an API key that Node.js can read via `process.env.API_KEY`. This is the standard pattern for injecting config into applications without hardcoding it.",
    ],
    visualizations: [
      {
        id: "ShellTerminal",
        mathBridge:
          "**Compose commands with pipes:**\n\n```bash\n# Basic pipe: filter log file\ncat app.log | grep 'ERROR'\n\n# Count errors\ncat app.log | grep 'ERROR' | wc -l\n\n# List only .js files\nls -la | grep '.js'\n\n# Environment variables\necho $HOME\necho $USER\necho $PATH\n\n# Set and use a variable\nexport PROJECT_NAME=my-app\necho $PROJECT_NAME\n\n# Create and use an alias\nalias ll='ls -la'\nll\n```",
        props: {
          welcomeMessage: "Try piping: cat app.log | grep 'ERROR' | wc -l",
          initialCwd: "/home/user/project",
          initialFiles: {
            "/home/user/project/": null,
            "/home/user/project/app.log":
              "[ERROR] 2026-05-20 09:00:01 DB connection timeout\n[INFO]  2026-05-20 09:00:02 Server started on port 3000\n[INFO]  2026-05-20 09:01:15 GET /api/users 200 12ms\n[WARN]  2026-05-20 09:15:30 Auth token expiring in 5min\n[ERROR] 2026-05-20 09:15:55 JWT validation failed: expired token\n[INFO]  2026-05-20 09:16:00 Token refreshed for user:42\n[ERROR] 2026-05-20 10:00:00 Unhandled promise rejection: Cannot read property 'id' of undefined\n[INFO]  2026-05-20 10:00:01 Process crashed, restarting...\n[INFO]  2026-05-20 10:00:03 Server started on port 3000\n",
            "/home/user/project/data.csv":
              "name,age,city\nAlice,30,New York\nBob,25,London\nCarol,35,Tokyo\nDave,28,Berlin\nEve,32,Sydney\n",
            "/home/user/project/src/": null,
            "/home/user/project/src/app.js":
              "const express = require('express');\nconst app = express();\n\napp.get('/api/users', (req, res) => {\n  res.json([{ id: 1, name: 'Alice' }]);\n});\n\napp.listen(process.env.PORT || 3000);\n",
            "/home/user/project/src/config.js":
              "module.exports = {\n  port: process.env.PORT || 3000,\n  dbUrl: process.env.DATABASE_URL,\n  apiKey: process.env.API_KEY,\n};\n",
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Pipelines and exit codes.** Each command in a pipeline has its own exit code (0 = success, non-zero = failure). By default, a pipeline's exit code is the exit code of the last command. In bash/zsh, set `set -o pipefail` to make the pipeline fail if any command in it fails. This matters in scripts: `cat missing-file.txt | grep 'error'` would exit 0 (grep succeeded) even though cat failed.",
      "**stdin vs file arguments.** Many commands accept either a filename or stdin via pipe. `grep 'ERROR' app.log` reads from a file. `cat app.log | grep 'ERROR'` reads from stdin. For most commands, both work. Some only accept stdin (designed for use in pipelines). When a command accepts both, using a filename directly is slightly more efficient (no extra process for `cat`) but the pipe form is clearer in complex chains.",
      "**~/.bashrc vs ~/.zshrc vs ~/.profile.** Permanent aliases and environment variable exports go in shell config files. `.bashrc` is read by bash interactive shells. `.zshrc` by zsh (default on modern macOS). `.profile` is read by login shells regardless of shell type. A common pattern: put environment variables in `.profile` (shared across shells) and aliases in `.bashrc`/`.zshrc` (shell-specific).",
    ],
    callouts: [
      {
        type: "tip",
        title: "Pipes compose any two text-processing tools",
        body: "The power of pipes isn't that any specific combination is useful — it's that any command that reads/writes text can be combined with any other. `ps aux | grep node | awk '{print $2}'` prints PIDs of all node processes. Each component is simple; the chain is powerful.",
      },
      {
        type: "tip",
        title: "Persist exports in your shell config",
        body: "`export VAR=value` in a terminal session lasts until you close the window. To make it permanent, add the same line to `~/.zshrc` (or `~/.bashrc`). Then run `source ~/.zshrc` to apply immediately without restarting the terminal.",
      },
    ],
  },

  examples: [
    {
      title: "Log analysis with pipes",
      body: "# Count error lines\ncat app.log | grep 'ERROR' | wc -l\n# 3\n\n# Show only the error messages (column 4 onwards)\ncat app.log | grep 'ERROR'\n# [ERROR] DB connection timeout\n# [ERROR] JWT validation failed: expired token\n# [ERROR] Unhandled promise rejection...\n\n# Redirect filtered output to a file\ncat app.log | grep 'ERROR' > errors.txt\ncat errors.txt",
    },
    {
      title: "Configure the environment",
      body: "# See current environment\nenv\n\n# Set a variable for this session\nexport DATABASE_URL=postgres://localhost/myapp\nexport PORT=4000\n\n# Verify\necho $DATABASE_URL\necho $PORT\n\n# Permanent: add to ~/.zshrc\n# export DATABASE_URL=postgres://localhost/myapp\n# Then: source ~/.zshrc",
    },
  ],

  quiz: [
    {
      id: "cli0-010-q1",
      type: "choice",
      text: "What does `cat app.log | grep 'ERROR' | wc -l` output?",
      options: [
        "The contents of app.log",
        "All lines matching 'ERROR'",
        "The number of lines matching 'ERROR' in app.log",
        "The total number of lines in app.log",
      ],
      answer: "The number of lines matching 'ERROR' in app.log",
      hints: [
        "The pipeline works left to right: `cat app.log` outputs the file; `grep 'ERROR'` filters to matching lines; `wc -l` counts those lines. The final output is a single number — the count of error lines.",
      ],
    },
    {
      id: "cli0-010-q2",
      type: "choice",
      text: "You run `export API_KEY=secret123` in your terminal. Your Node.js app reads `process.env.API_KEY`. What does it get?",
      options: [
        "undefined — environment variables aren't visible to Node.js",
        "'secret123' — exported variables are passed to child processes",
        "An error — API_KEY is a reserved variable name",
        "'secret123' only if you restart the terminal first",
      ],
      answer: "'secret123' — exported variables are passed to child processes",
      hints: [
        "`export` marks a variable for inheritance by child processes. When you run `node app.js` from that terminal, Node receives a copy of the shell's environment including `API_KEY`. `process.env.API_KEY` returns 'secret123'. This is the standard way to inject secrets and config into applications without hardcoding them.",
      ],
    },
  ],

  definitions: [
    { term: "pipe (|)", definition: "Connects the stdout of one command to the stdin of the next. `cmd1 | cmd2` feeds cmd1's output into cmd2. Chains can be arbitrarily long." },
    { term: "environment variable", definition: "A named value available to all processes in a shell session. Set with `export NAME=value`. Read in Node.js via `process.env.NAME`, in Python via `os.environ['NAME']`." },
    { term: "$PATH", definition: "A colon-separated list of directories the shell searches for executables. `echo $PATH` shows the current value. Extend it with `export PATH=$PATH:/new/dir`." },
    { term: "alias", definition: "A shell shortcut: `alias ll='ls -la'` makes `ll` expand to `ls -la`. Temporary per session unless added to ~/.bashrc or ~/.zshrc." },
  ],
};

export default lesson;

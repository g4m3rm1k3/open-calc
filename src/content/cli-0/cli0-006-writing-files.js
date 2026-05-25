const lesson = {
  id: "cli-0-006",
  slug: "writing-files",
  chapter: "cli-0",
  order: 6,
  title: "Writing to Files",
  subtitle: "echo >, echo >>, and output redirection",
  tags: ["cli", "redirection", "echo", "append", "overwrite", "stdout"],
  aliases: [
    "write file terminal",
    "echo redirect",
    "append file",
    "overwrite file",
    "output redirection",
  ],

  hook: `Every program that prints output is actually writing to a stream called stdout. The \`>\` operator redirects that stream into a file instead of the screen. Understanding this unlocks one of the most powerful ideas in Unix.`,

  mentalModel: [
    "`command > file` redirects the command's output into a file, **overwriting** it completely. If the file doesn't exist, it's created.",
    "`command >> file` redirects the command's output and **appends** it to the file. Existing content is preserved. If the file doesn't exist, it's created.",
    "These operators work with **any** command that produces output — not just `echo`. `ls -la > filelist.txt`, `cat README.md > copy.txt`, `grep ERROR app.log > errors.txt` all work the same way.",
  ],

  intuition: {
    prose: [
      "When you type `echo hello` and press Enter, the text `hello` goes to your terminal screen. Technically, it goes to a stream called **stdout** (standard output), and your terminal is what's consuming that stream. The `>` operator intercepts stdout and sends it into a file instead.",
      "`echo 'My shopping list' > list.txt` creates `list.txt` containing `My shopping list`. Run it again with different text and the file is overwritten — the old content is gone. This is important: `>` always starts fresh. If you want to add to a file without losing what's there, use `>>`.",
      "`echo 'Apples' >> list.txt` appends `Apples` as a new line. Run `echo 'Bananas' >> list.txt` and now the file has two lines. `>>` is how you build up a file incrementally — log entries, configurations, notes. Every `>>` adds a line; every `>` starts over.",
      "This works with any command, not just `echo`. `ls -la >> audit.txt` appends a directory listing. `cat file1.txt >> file2.txt` appends the contents of one file to another. `grep 'ERROR' app.log > errors.txt` writes all error lines to a new file. The pattern is always the same: the command runs, produces output, and the `>` or `>>` captures it.",
    ],
    visualizations: [
      {
        id: "ShellTerminal",
        mathBridge:
          "**Practice redirection:**\n\n```bash\n# Create a file by redirecting echo\necho '# Shopping List' > list.txt\ncat list.txt\n\n# Append more items\necho 'Apples' >> list.txt\necho 'Bananas' >> list.txt\necho 'Oat milk' >> list.txt\ncat list.txt\n\n# Overwrite — replaces everything\necho 'Replaced!' > list.txt\ncat list.txt\n\n# Capture ls output\nls -la > filelist.txt\ncat filelist.txt\n```",
        props: {
          welcomeMessage:
            "Practice > and >>. Try: echo 'hello' > greet.txt, then cat greet.txt",
          initialFiles: {
            "/home/user/notes.txt":
              "# Project Notes\n\nRemember to:\n- Write tests\n- Update README",
            "/home/user/app.log":
              "[ERROR] Database timeout\n[INFO] Server started\n[ERROR] Auth failed\n[INFO] Request complete",
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**stdin, stdout, stderr — the three standard streams.** Every Unix process has three file descriptors open by default: 0 (stdin — reads input), 1 (stdout — writes normal output), 2 (stderr — writes error output). The `>` operator is shorthand for `1>` — redirect file descriptor 1 (stdout). To redirect errors: `command 2> errors.txt`. To redirect both: `command > output.txt 2>&1`. This is why error messages still appear on screen even when you use `>` — they're on stderr, which isn't being redirected.",
      "**Null device.** `/dev/null` is a special file that discards everything written to it. `command > /dev/null` runs the command silently. `command 2>/dev/null` suppresses error messages. `command > /dev/null 2>&1` runs completely silently. This is a common pattern in scripts where you want to check the exit code of a command but don't care about its output.",
      "**Process substitution and here-docs.** Beyond `>` and `>>`, shells support `<<EOF ... EOF` (here-document) to write multi-line content: `cat > file.txt << 'EOF'\nline 1\nline 2\nEOF`. Single-quoted `'EOF'` prevents variable expansion inside. This is a common pattern for writing configuration files in deploy scripts.",
    ],
    callouts: [
      {
        type: "warning",
        title: "> overwrites silently — no confirmation",
        body: "`echo '' > important-file.txt` immediately destroys the file's contents with no undo, no trash, no warning. Before using `>`, be certain you're operating on the right file. In scripts, this is a common source of bugs.",
      },
      {
        type: "tip",
        title: "Create an empty file with > or touch",
        body: "`: > filename` or `> filename` creates an empty file (or truncates an existing one) without printing anything. `touch filename` creates a file without truncating it if it exists. Both have their uses.",
      },
    ],
  },

  examples: [
    {
      title: "Build a config file line by line",
      body: "# Start fresh (>) then append (>>)\necho '[server]' > config.ini\necho 'host = localhost' >> config.ini\necho 'port = 3000' >> config.ini\necho '' >> config.ini\necho '[database]' >> config.ini\necho 'url = postgres://localhost/mydb' >> config.ini\n\ncat config.ini\n# [server]\n# host = localhost\n# port = 3000\n#\n# [database]\n# url = postgres://localhost/mydb",
    },
    {
      title: "Capture command output",
      body: "# Save a directory listing\nls -la > contents.txt\n\n# Save only error lines from a log\ngrep 'ERROR' app.log > errors.txt\n\n# Combine two files\ncat header.md body.md > complete.md\n\n# All examples follow the same pattern:\n# command [flags] [args] > output-file",
    },
  ],

  assessment: {
    questions: [
      {
        id: "cli0-006-q1",
        type: "choice",
        text: "You run `echo 'line 2' > notes.txt` on a file that already contains 'line 1'. What does `cat notes.txt` show?",
        options: [
          "line 1\nline 2",
          "line 2",
          "line 1",
          "An error — cannot overwrite existing file",
        ],
        answer: 1,
        explanation:
          "`>` overwrites the entire file. The old content ('line 1') is gone and the file now contains only 'line 2'. To preserve the old content and add a new line, use `>>` instead.",
      },
      {
        id: "cli0-006-q2",
        type: "choice",
        text: "Which command extracts all ERROR lines from app.log into a separate file?",
        options: [
          "`cat ERROR app.log > errors.txt`",
          "`grep 'ERROR' app.log > errors.txt`",
          "`grep 'ERROR' app.log >> errors.txt`",
          "`echo ERROR app.log > errors.txt`",
        ],
        answer: 1,
        explanation:
          "`grep 'ERROR' app.log` prints all matching lines to stdout. `> errors.txt` redirects that output into the file. Using `>>` (option C) would also work but would append rather than start fresh — for a one-time extraction, either works.",
      },
    ],
  },
};

export default lesson;

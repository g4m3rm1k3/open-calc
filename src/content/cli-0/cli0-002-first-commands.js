const lesson = {
  id: "cli-0-002",
  slug: "first-commands",
  chapter: "cli-0",
  order: 2,
  title: "Your First Commands",
  subtitle: "pwd, echo, whoami — the anatomy of a command",
  tags: ["cli", "pwd", "echo", "whoami", "commands"],
  aliases: ["command syntax", "first commands", "terminal basics"],

  hook: `Every command follows the same pattern: a name, optional flags that change its behavior, and optional arguments that tell it what to operate on. Once you see that pattern, every new command you encounter is predictable.`,

  mentalModel: [
    "**Command anatomy:** `command -flags argument1 argument2`. The name comes first, flags start with `-` or `--`, and arguments are what the command acts on.",
    "Flags come in two forms: short (`-l`, `-a`) and long (`--all`, `--verbose`). Short flags can often be combined: `-la` is the same as `-l -a`.",
    "`man command` opens the manual page for any command. It tells you every flag, every argument, and every edge case. When in doubt, `man` it.",
  ],

  intuition: {
    prose: [
      "Commands look cryptic at first, but they all follow the same grammar: `name [flags] [arguments]`. `ls -la /etc` means: run `ls` (list files), with flags `-l` (long format) and `-a` (show hidden), on the argument `/etc` (that directory). Every command you will ever use fits this pattern.",
      "Flags modify behavior. `ls` alone lists filenames. `ls -l` adds permissions, size, and dates. `ls -a` shows hidden files (those starting with `.`). `ls -la` does both. Most programs follow the convention that `-h` or `--help` prints a usage summary, and `man programname` opens the full manual.",
      "Arguments are what the command operates on. `echo hello world` prints `hello world`. `cat README.md` prints the contents of `README.md`. `mkdir projects/website` creates that directory. The argument is the subject — the command is the verb.",
      "Exit codes matter. Every command exits with a number: `0` means success, anything else means failure. This is how scripts detect errors — `if git push` works because shell scripts can test the exit code of any command. You don't need to worry about exit codes now, but knowing they exist explains a lot about shell scripting later.",
    ],
    visualizations: [
      {
        id: "ShellTerminal",
        mathBridge:
          "**Practice the command anatomy pattern:**\n\n- `echo hello` — print text (argument: `hello`)\n- `echo -n hello` — print without newline (flag: `-n`)\n- `ls` — list current directory (no flags, no arguments)\n- `ls -l` — long format (flag: `-l`)\n- `ls -la` — long format + hidden files (flags: `-l` `-a`)\n- `man ls` — read the full manual for `ls`\n\nPay attention to how adding a flag changes the output.",
        props: {
          welcomeMessage:
            "Practice command anatomy. Try: echo, ls, pwd, man ls",
          initialFiles: {
            "/home/user/README.md":
              "# My Terminal Notes\n\nCommands I've learned:\n- pwd\n- echo\n- ls",
            "/home/user/.hidden-config":
              "# This file is hidden (starts with .)\n# Use ls -a to see it",
            "/home/user/notes.txt":
              "Meeting notes\nShip by Friday\nFix login bug\nWrite tests",
            "/home/user/projects/": null,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Short vs long flags.** Most Unix programs accept both `-v` (short) and `--verbose` (long) for the same flag. Short flags can be combined: `-la` is the same as `-l -a` is the same as `-a -l`. Long flags cannot be combined. Some flags take a value: `head -n 5 file` or `head --lines=5 file`. The convention is POSIX-standardized but not universally followed — `--help` works on most tools, but not everything.",
      "**Quoting.** When an argument contains spaces, you must quote it: `echo hello world` passes two arguments (`hello` and `world`). `echo 'hello world'` passes one argument (`hello world`). Single quotes preserve everything literally. Double quotes allow variable expansion: `echo \"Hello $USER\"` prints your username. This matters constantly — file names with spaces must be quoted: `cat 'my file.txt'`.",
      "**Exit codes and $?.** After any command, `echo $?` prints the exit code of the last command. `0` = success. Non-zero = some kind of failure (the specific number depends on the program). `ls nonexistent; echo $?` prints `2` (ls's error code for 'no such file'). Shell scripts use this to chain commands safely: `mkdir dir && cd dir` only runs `cd` if `mkdir` succeeds.",
    ],
    callouts: [
      {
        type: "tip",
        title: "man pages: navigate with arrow keys, q to quit",
        body: "`man ls` opens the manual in a pager (usually `less`). Arrow keys scroll. `/pattern` searches. `q` quits. Most man pages follow the same structure: NAME, SYNOPSIS, DESCRIPTION, OPTIONS, EXAMPLES. Jump straight to OPTIONS to scan flags.",
      },
      {
        type: "warning",
        title: "Case sensitive everywhere",
        body: "Unix filenames and commands are case-sensitive. `README.md` and `readme.md` are different files. `ls` works, `LS` does not. Most flags are lowercase. This trips up users coming from Windows, which is case-insensitive.",
      },
    ],
  },

  examples: [
    {
      title: "Command anatomy breakdown",
      body: "ls -la /home/user\n│   │   └── argument: operate on this path\n│   └────── flags: -l (long) + -a (all/hidden)\n└────────── command name\n\ngrep -in 'hello' README.md\n│    │││  │       └── argument: search this file\n│    │││  └────────── argument: this is the pattern\n│    ││└───────────── n = show line numbers\n│    │└────────────── i = case-insensitive\n│    └─────────────── flags start with -\n└──────────────────── command name",
    },
    {
      title: "Getting help three ways",
      body: "# 1. Built-in help flag (most modern tools)\ngit --help\nnpm --help\n\n# 2. Man page (classic Unix tools)\nman ls\nman grep\nman find\n\n# 3. Compressed usage summary\nls --help      # GNU tools\nls -h          # some BSD/macOS tools",
    },
  ],

  assessment: {
    questions: [
      {
        id: "cli0-002-q1",
        type: "choice",
        text: "What does the `-l` flag do in `ls -l`?",
        options: [
          "Lists only hidden files",
          "Lists files in long format (showing permissions, size, and date)",
          "Lists files in reverse order",
          "Limits output to 10 files",
        ],
        answer: 1,
        explanation:
          "`-l` activates long listing format, showing permissions, number of links, owner, group, size, timestamp, and filename for each entry.",
      },
      {
        id: "cli0-002-q2",
        type: "choice",
        text: "What is the difference between `echo hello world` and `echo 'hello world'`?",
        options: [
          "No difference — both print the same thing",
          "`echo hello world` passes two arguments; `echo 'hello world'` passes one",
          "Single quotes prevent the text from being printed",
          "Double quotes are required for text with spaces",
        ],
        answer: 1,
        explanation:
          "Without quotes, the shell splits on spaces, so `echo` receives two separate arguments. With single quotes, the entire string (including the space) is one argument. Both happen to print the same output here, but the distinction matters for commands that behave differently with multiple arguments.",
      },
    ],
  },
};

export default lesson;

const lesson = {
  id: "cli-0-001",
  slug: "what-is-the-terminal",
  chapter: "cli-0",
  order: 1,
  title: "What Is the Terminal?",
  subtitle: "The tool developers use to talk directly to their computer",
  tags: ["cli", "terminal", "shell", "fundamentals"],
  aliases: ["command line", "terminal intro", "what is shell", "bash", "zsh"],

  hook: `Every time you click a button in VS Code, Finder, or GitHub Desktop, a text command runs behind it. The terminal is where you type those commands directly — no clicking required, and no features hidden behind menus. Once you can use the terminal, you can do anything the computer can do.`,

  mentalModel: [
    "The **terminal** is the window. The **shell** (bash, zsh, fish) is the program running inside it that reads your commands and talks to the OS. When developers say 'use the terminal', they mean both.",
    "A command is a program. `ls` is a tiny program that lists files. `cd` changes your location. `echo` prints text. When you type a command and press Enter, the shell finds that program and runs it.",
    "The terminal is not fragile. You cannot break your computer by typing commands — unless you run `rm -rf` on critical system paths. Everything in this course is completely safe.",
  ],

  intuition: {
    prose: [
      "Every graphical interface — Finder on Mac, File Explorer on Windows, GitHub Desktop — is a visual layer on top of text commands. When you click **New Folder**, the OS runs `mkdir`. When you drag a file to trash, it runs `rm`. The terminal removes the middle layer and lets you type those commands yourself.",
      "Why would you want to? Speed, precision, and power. It is faster to type `mkdir src/components/ui` than to create three nested folders by clicking. It is faster to type `grep -r 'todo' .` to search every file in a project than to open each one. And many developer tools — git, npm, pip, docker, ssh — only exist in the terminal. There is no GUI for them at all.",
      "The terminal also automates. Once a command works, you can save it in a script and run it a thousand times. The same `git push` that deploys your website is running in a CI server somewhere, exactly as you'd type it. The terminal is the universal language of software development.",
      "The shell prompt — the text before your cursor — tells you where you are. `user@upskill:~$` means: user named `user`, on machine `upskill`, in the directory `~` (which is your home directory). Everything after the `$` is where you type. Try it now: type `pwd` and press Enter to see your current location.",
    ],
    visualizations: [
      {
        id: "ShellTerminal",
        mathBridge:
          "**Try these commands to get oriented:**\n\n- `pwd` — print your current location (working directory)\n- `whoami` — print your username\n- `echo hello` — print any text to the screen\n- `help` — see all available commands\n- `man ls` — read the manual page for any command\n\nThe prompt `user@upskill:~$` shows: username, hostname, and current directory. `~` is shorthand for `/home/user` — your home directory.",
        props: {
          welcomeMessage: "Terminal ready. Type 'help' to see all commands, or 'man <cmd>' for details on any command.",
          initialFiles: {
            "/home/user/README.md": "# Welcome to the Terminal\n\nYou are in your home directory (~).\n\nTry these commands:\n  pwd       — where am I?\n  whoami    — who am I?\n  ls        — what's here?\n  echo hi   — print text\n  help      — all commands",
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Shell vs terminal vs console.** These are often used interchangeably but are technically different. The **terminal** (or terminal emulator) is the window — it draws characters on screen and handles keyboard input. The **shell** is the program running inside the terminal that interprets commands: bash (Bourne Again Shell) is the default on most Linux systems, zsh is the default on macOS since Catalina. The **console** was the physical text-display hardware before GUIs existed. Today 'terminal', 'shell', and 'console' all mean the same thing in casual developer conversation.",
      "**The Unix philosophy.** Unix (the ancestor of Linux and macOS) was built around a design principle: programs should do one thing and do it well. `ls` only lists files. `grep` only searches text. `wc` only counts words. These small programs compose: `ls | grep .js | wc -l` counts JavaScript files. This composability is why the terminal has remained the most powerful interface for 50 years. You will learn the pipe `|` operator in a later lesson.",
      "**stdout, stderr, and stdin.** Every terminal program has three channels: **stdin** (input, usually keyboard), **stdout** (normal output, usually printed to terminal), and **stderr** (error output, also usually printed to terminal but separately). These three streams are why redirection (`>`, `>>`) and piping (`|`) work — they connect one program's stdout to another's stdin.",
    ],
    callouts: [
      {
        type: "tip",
        title: "Tab completion is your best friend",
        body: "Press Tab to autocomplete file names, directory names, and commands. If there are multiple matches, press Tab twice to see them all. Professional developers use Tab constantly — it prevents typos and speeds up navigation significantly.",
      },
      {
        type: "info",
        title: "Ctrl+C cancels a running command",
        body: "If a command is stuck or running longer than expected, press Ctrl+C to interrupt it. This sends a termination signal to the running program. It doesn't close the terminal — it just stops the current command and returns you to the prompt.",
      },
    ],
  },

  examples: [
    {
      title: "Reading the prompt",
      body: "user@upskill:~$\n│    │       │ └── you type here\n│    │       └──── current directory (~ = home)\n│    └────────────── hostname (machine name)\n└─────────────────── your username\n\nAfter cd /etc:\nuser@upskill:/etc$",
    },
    {
      title: "Three ways to do the same thing",
      body: "# Create a folder named 'notes'\n# GUI: File > New Folder > type name > press Enter\n# Finder: Cmd+Shift+N > type name\n# Terminal:\nmkdir notes\n\n# The terminal version works the same on Mac, Linux,\n# and in a remote server over SSH.",
    },
  ],

  assessment: {
    questions: [
      {
        id: "cli0-001-q1",
        type: "choice",
        text: "What is the difference between a terminal and a shell?",
        options: [
          "They are the same program",
          "The terminal is the window; the shell is the program inside it that runs commands",
          "The shell is the window; the terminal interprets commands",
          "Terminal is for Mac; shell is for Linux",
        ],
        answer: 1,
        explanation: "The terminal emulator is the window that displays text and handles input. The shell (bash, zsh, etc.) is the program running inside it that reads your commands and tells the OS what to do.",
      },
      {
        id: "cli0-001-q2",
        type: "choice",
        text: "What does the `~` in the prompt `user@machine:~$` represent?",
        options: [
          "The root directory /",
          "Your home directory (/home/user)",
          "The current project folder",
          "A temporary directory",
        ],
        answer: 1,
        explanation: "`~` is a shorthand for your home directory — `/home/user` on Linux, `/Users/user` on macOS. It's the directory the terminal starts in and where your personal files live.",
      },
    ],
  },
};

export default lesson;

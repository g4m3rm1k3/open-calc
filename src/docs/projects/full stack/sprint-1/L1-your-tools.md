# Sprint 1 · Lesson 1 — Your terminal, your file system, your tools

## What you will build

By the end of this lesson, three programs are running on your machine — Node.js, Python, and VS Code — and you have made your first git commit. You will have run your first command in each runtime, seen the output, and understood exactly what happened: what program ran, where it lives on your hard drive, and why the computer was able to find it. You will also have created the project directory that every lesson in this curriculum builds into. Nothing at the end of this lesson is mystery scaffolding.

---

## What you need to know first

This is the first lesson. No prior knowledge is assumed. Every concept introduced here is taught here.

---

## The lesson

---

### 1. Open the terminal

**The problem:** Your computer has a graphical interface — icons, windows, a mouse. That interface is a convenience layer over the operating system, not the operating system itself. Every program you write in this curriculum will be run as a command, not by double-clicking an icon. To run commands, you need the terminal.

On **macOS**: Press `Cmd + Space`, type `Terminal`, press Enter.  
On **Windows**: Press `Win + R`, type `cmd`, press Enter. (Or search for "PowerShell" in the Start menu — PowerShell is more powerful and is preferred for this curriculum.)  
On **Linux**: Open your application launcher and search for "Terminal."

A window opens with a line of text ending in `$` (macOS/Linux) or `>` (Windows). This line is the **prompt**. It means the shell is waiting for you to type a command.

**Walkthrough of what just happened:** You did not open the terminal directly — you opened a *terminal emulator*, a graphical window that hosts a program called the **shell**. The shell is what actually runs your commands. On macOS and Linux the default shell is `zsh` or `bash`. On Windows it is `cmd` or PowerShell. The terminal emulator's job is to receive your keystrokes, send them to the shell, and display the shell's output on screen. The shell's job is to read what you typed, find the program you named, and run it.

**CS lens — the shell is a programming language.** The shell is not just a way to launch programs. It is a full programming language with variables, loops, conditionals, and functions. When you type `ls` and press Enter, you are calling a function. The PATH lookup, the process creation, the output piping — these are all operations the shell language performs. Professional engineers write shell scripts (files of shell commands) to automate repetitive tasks. For now you will use the shell interactively, but the language is always there.

**SE lens — the command line as the universal interface.** Every tool you will use in this curriculum — Node.js, Python, git, Docker, Nginx — is controlled through the command line. Graphical tools are wrappers over command-line tools. Understanding the command line means understanding the tool itself, not just the wrapper. When a graphical tool breaks or is unavailable (which happens constantly in production engineering), the command line still works.

**What breaks without this:** Every subsequent step in this curriculum requires a working terminal. If the terminal does not open, check that the application is installed and try searching for it by a different name ("iTerm," "Konsole," "Terminal.app").

---

### 2. Find out where you are

**The problem:** The terminal is always "inside" a folder on your computer — the **working directory**. Commands that create files will put them in this folder. Commands that read files will look here first. Before doing anything else, you need to know where you are.

Run:

```
pwd
```

Expected output on macOS/Linux:
```
/Users/yourname
```

Expected output on Windows:
```
C:\Users\yourname
```

**Walkthrough:** When you type `pwd` and press Enter, the shell reads the word `pwd` and starts the PATH lookup (explained in the next section). It finds a small program named `pwd` installed on your machine, creates a new process to run it, and waits for it to finish. The `pwd` program asks the operating system for the current working directory and prints it to the screen. The shell displays that output beneath your command. The output is a **path** — a chain of directory names separated by `/` (macOS/Linux) or `\` (Windows), starting from the root of the file system (`/` on macOS/Linux, `C:\` on Windows). You are currently in your **home directory** — the folder the operating system assigned to your user account.

**CS lens — the file system is a tree.** The file system is a tree data structure. The root (`/` or `C:\`) is the root node. Every directory is an internal node. Every file is a leaf. A path is a sequence of edge labels from the root to a node. An **absolute path** starts from the root and fully describes a location. A **relative path** starts from the current working directory. `/Users/yourname/Documents` is absolute. `Documents` is relative — it means "the `Documents` subdirectory of wherever I am now." Both refer to the same directory when you are already in `/Users/yourname`.

**SE lens — working directory as implicit context.** Many commands behave differently depending on the working directory. `git init` creates a repository in the current directory. `npm install` writes packages into `node_modules` in the current directory. This is intentional design: the working directory is a shared implicit argument that you set once per terminal session rather than passing as an explicit argument to every command. When a command "doesn't work," the first thing a professional checks is whether they are in the right directory.

**Real-world connection:** Every Linux process, including production servers, has a working directory. When a web server crashes and the error log says `no such file: config.json`, the first question is: what was the process's working directory when it tried to open that file?

**What breaks without this:** If you are in the wrong directory when you run a command that creates files, the files appear somewhere unexpected and you spend time tracking them down. Always run `pwd` before running commands in a new terminal session.

---

### 3. Navigate the file system

**The problem:** You need to move between directories to work in different parts of your project.

Move into a directory:
```
cd Documents
```

Move up to the parent directory:
```
cd ..
```

List everything in the current directory:

macOS/Linux:
```
ls
```

Windows:
```
dir
```

**Walkthrough:** `cd Documents` does not launch a program — `cd` is a **shell built-in**, a command that the shell handles directly without creating a new process. It tells the shell to change its working directory to `Documents`. The shell looks for a directory named `Documents` inside the current working directory, verifies it exists, and updates its internal record of where it is. After this command, every subsequent path lookup happens relative to `Documents`.

`cd ..` uses a special path component. `..` always means "the directory that contains the current directory" — the parent. `cd ..` is the inverse of `cd Documents`. Running both in sequence returns you to where you started.

`ls` is a program, not a built-in. The shell finds it on PATH, runs it in a new process, and `ls` asks the operating system for the contents of the current directory, then prints each name on a line.

**CS lens — directory traversal.** `cd ..` is a traversal of the file system tree: moving from a child node to its parent. This same parent-pointer concept appears everywhere in computer science — linked lists, binary search trees, the DOM (the browser's representation of an HTML file). In every case, `..` or `.parent` means "the node that contains this one."

**SE lens — muscle memory for navigation.** Professional engineers navigate the terminal by feel — `cd`, `ls`, `cd ..` become automatic. This matters because the terminal is the interface for every tool in this curriculum. Slow navigation means slow learning. Spend five minutes now just moving around your file system until the commands feel natural.

**What breaks without this:** Running a command in the wrong directory is one of the most common errors in development. `npm install` in the wrong directory creates a `node_modules` folder somewhere irrelevant. `git init` in the wrong directory creates a repository inside another repository, which causes confusing git behaviour.

---

### 4. Install Node.js

**The problem:** You need a way to run JavaScript outside the browser. JavaScript in the browser runs in a sandboxed environment — it cannot read files, open network connections to arbitrary servers, or access the operating system. The FastAPI server you will build in Lesson 3 is Python, but the React application you build in Lesson 2 is JavaScript, and you need a program that can compile and serve it from your machine.

Go to [https://nodejs.org](https://nodejs.org). Download the **LTS** version. LTS stands for *Long Term Support* — it is the version that receives bug fixes and security patches for the longest period (typically three years). The "Current" version has newer features but fewer stability guarantees. For applications you intend to ship, LTS is the correct choice.

Run the installer. Accept the defaults. When it finishes, open a **new** terminal window and run:

```
node --version
```

Expected output:
```
v20.11.0
```

The exact number will differ. What matters is that output appears without an error.

Then run:

```
npm --version
```

Expected output:
```
10.2.4
```

**Walkthrough of `node --version`:** The shell reads the word `node` and starts the PATH lookup: it walks through each directory in your PATH, in order, looking for a file named `node`. When the Node.js installer ran, it added the directory containing the `node` executable to your PATH (the installer modifies a configuration file that the shell reads when it starts). The shell finds `node` in that directory, creates a process to run it, and passes the argument `--version`. The `--version` flag is a nearly universal convention: run the program, print its version number, and exit immediately. Node.js prints its version and exits. The shell displays the output.

**CS lens — command-line arguments.** Every program receives its arguments as an array of strings. When you type `node --version`, the shell splits that into two strings: `"node"` (the program name) and `"--version"` (the first argument). Inside Node.js, `process.argv[0]` is the path to the Node executable, `process.argv[1]` would be a script file if you provided one, and `process.argv[2]` would be the first user-provided argument. `--version` is checked before anything else: if it appears, print the version and exit. Every program you write that accepts command-line arguments follows this same array model.

**SE lens — flags as a command-line interface contract.** The `--` prefix for flags is a convention, not a language rule. It is a shared contract across almost all Unix-style tools: single-letter short flags use `-` (e.g. `-v`), multi-word flags use `--` (e.g. `--version`). This convention means you can guess the flags for a new tool before reading the documentation. Violating it would make your tool feel alien to every professional who uses it. When you eventually build command-line tools in this curriculum, you will follow this convention for the same reason.

**Real-world connection:** Node.js is used in production at Netflix, LinkedIn, Uber, and PayPal for high-throughput network services. The version you are installing is the same runtime that serves millions of requests per day at those companies. The sandbox that runs your React development server and the production server handling PayPal transactions are the same program.

**What breaks without this:** If `node --version` prints `command not found`, the installer did not add Node to PATH. Close the terminal and open a new one — PATH is loaded when the terminal starts, so the old terminal window does not see the installer's changes. If the error persists in a new terminal, re-run the installer.

---

### 5. Understand PATH: how the computer finds programs

**The problem:** You installed Node.js and typed `node`, and the computer found it. You have installed dozens of programs over the years. How does the shell know where any of them are?

Run this:

```
echo $PATH
```

On Windows (PowerShell):
```
echo $env:PATH
```

Expected output (macOS example):
```
/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/Library/Apple/usr/bin:/Users/yourname/.nvm/versions/node/v20.11.0/bin
```

Your output will be different. What matters is the structure: a list of directory paths separated by `:` (macOS/Linux) or `;` (Windows).

**Walkthrough:** `echo` is a program that prints its arguments to the screen. `$PATH` is an **environment variable** — the `$` prefix tells the shell to substitute the variable's value before passing it to `echo`. So the shell evaluates `$PATH` to its current value (a long colon-separated string), then calls `echo` with that string as its argument. `echo` prints the string and exits. The result is that you see the current value of PATH on screen.

When you type `node`, the shell performs a **PATH walk**: it splits PATH on `:`, takes each directory in order, and checks whether a file named `node` exists in that directory. The moment it finds one, it stops and runs that file. If it walks every directory and finds nothing, it prints `command not found`.

To see exactly where a program lives:

```
which node
```

Expected output:
```
/usr/local/bin/node
```

`which` performs the PATH walk and prints the path of the first match instead of running it. This is how you confirm which version of a program will run when you type its name.

**CS lens — environment variables as inherited state.** An environment variable is a named string value that the operating system maintains per process. When the shell starts a child process (to run a command), it passes a copy of its environment to the child. The child sees the same PATH as the shell. This is why Node.js, which your shell started, can read the same environment variables your shell has. Environment variables are the mechanism by which configuration flows from the operating system down to every program that runs on it.

This is the same mechanism as inheritance of state in object-oriented programming, or lexical scope in JavaScript closures: a child inherits the parent's context. Environment variables are the OS-level version of that concept.

**SE lens — configuration without code changes.** PATH is not the only environment variable. Your database URL, API keys, and server port numbers will all be environment variables later in this curriculum. The design principle is: the program's code is identical in every environment (development, staging, production); only its configuration differs. Environment variables are the interface between identical code and different environments. This is the **twelve-factor app** methodology — a set of principles followed by essentially every production web application — and "Store config in the environment" is factor III.

**Real-world connection:** When you deploy to Heroku, AWS, or any cloud platform, the platform gives you a panel to set environment variables. Your database URL is stored there, not in your code. If you ever saw a leaked API key in a GitHub repository (this is common; GitHub has an alert system for it), it means a developer stored a secret in code instead of in the environment. The consequences range from fraudulent API charges to complete data breaches.

**What breaks without this:** If a PATH entry is missing, `command not found` appears even though the program is installed on disk. The program is there — the shell just doesn't know where to look. Fix: add the directory to PATH. On macOS/Linux: add `export PATH="/path/to/dir:$PATH"` to your `~/.zshrc` or `~/.bashrc` file and open a new terminal. On Windows: search "environment variables" in the Start menu.

---

### 6. Install Python

**The problem:** The backend server you will build runs Python. You need a Python interpreter on your machine.

Go to [https://www.python.org/downloads/](https://www.python.org/downloads/) and download the latest stable Python 3 release.

**Critical on Windows:** The installer shows a checkbox at the bottom — "Add Python to PATH." Check it before clicking Install. Without it, Python installs successfully but the `python` command is not on PATH, and you will see `command not found` every time you try to run it.

After installation, open a new terminal and run:

```
python3 --version
```

On Windows, the command may be `python` rather than `python3`:
```
python --version
```

Expected output:
```
Python 3.12.2
```

Also verify pip:

```
pip3 --version
```

Expected output:
```
pip 24.0 from /usr/lib/python3/dist-packages/pip (python 3.12)
```

**Walkthrough:** The same PATH walk as `node --version`. The installer added Python's bin directory to PATH. The shell finds `python3` there, runs it with `--version`, Python prints its version and exits.

`pip3` is a separate program installed alongside Python. Its name stands for "Pip Installs Packages" (recursive acronym — a tradition in the Python community). It is Python's package manager. You will use it to install FastAPI, SQLAlchemy, and every other Python library in this curriculum.

**CS lens — interpreters vs compilers.** Python is an **interpreted** language. When you run `python3 script.py`, the Python interpreter reads your `.py` file, parses it into an internal representation, and executes it line by line without producing a separate executable file. JavaScript (in Node.js) is also interpreted, though modern engines compile it to machine code at runtime (just-in-time compilation) for speed. This contrasts with C or Rust, which are **compiled** languages: the compiler translates your source code into a machine-code executable before you can run it. Interpreted languages are generally slower at raw computation but faster to develop with because there is no separate compile step.

**SE lens — two runtimes, two ecosystems.** You now have two languages on your machine — JavaScript (Node.js) and Python. Each has its own runtime, its own package manager, and its own package registry. They are entirely separate ecosystems that happen to be running on the same computer. In this curriculum they also serve entirely different roles: JavaScript/React runs in the browser (or is served by Node.js for development), Python/FastAPI runs on the server. They communicate over HTTP — a network protocol. The browser does not "see" the Python code; the server does not "see" the React code. This separation is the architecture of the modern web.

**Real-world connection:** Python is the dominant language for backend web services at Instagram, Spotify, Dropbox, and Pinterest. FastAPI, which you will use starting in Lesson 3, is used in production at Microsoft, Uber, and the explosion of AI API services (many LLM APIs are FastAPI services). The interpreter you just installed is the same runtime running those services.

**What breaks without this:** If Python installs but `python3 --version` gives `command not found`, the PATH was not set. On Windows, re-run the installer and check the PATH checkbox. On macOS, if `python3` is not found, try `python` — older Macs may need `python3` installed separately via Homebrew.

---

### 7. Create a virtual environment

**The problem:** You have Python installed globally on your machine. If you now run `pip install fastapi`, FastAPI installs globally — for every Python project on your computer. Now imagine project A needs FastAPI 0.95 and project B needs FastAPI 0.110. You cannot have both versions globally. They overwrite each other. Every project needs to be able to declare its own dependencies without interfering with any other project.

Node.js solves this by installing packages into a `node_modules` folder inside each project directory — each project has its own copy. Python's global installer (`pip`) does not do this by default. The solution is a **virtual environment**: an isolated copy of the Python package directory, created per project.

First, create your project directory:

```
mkdir fullstack-project
cd fullstack-project
```

`mkdir` stands for *make directory*. It creates a new empty folder named `fullstack-project` in the current directory. `cd fullstack-project` moves into it.

Now create the virtual environment:

```
python3 -m venv venv
```

**Walkthrough:** This command has four parts.

`python3` — the program being run: the Python interpreter.

`-m` — a flag that means "run a module as a program." Python modules are files (or packages) that define functions and classes for other programs to import. The `-m` flag lets you run a module directly as if it were a script, rather than importing it. `python3 -m venv` means "run the `venv` module as a program."

`venv` (the module name, after `-m`) — `venv` is a module that ships with Python. Its job is to create virtual environments.

`venv` (the second argument, the name of the environment to create) — this is the directory name for the new virtual environment. The convention is to name it `venv`. You could name it anything, but `venv` is what the Python community expects and what most `.gitignore` files are pre-configured to exclude.

After this command completes, run `ls` — you will see a new `venv` directory. Inside it is a complete, self-contained Python installation: its own Python interpreter, its own pip, and its own package directory.

Now activate the virtual environment:

macOS/Linux:
```
source venv/bin/activate
```

Windows (Command Prompt):
```
venv\Scripts\activate
```

Windows (PowerShell):
```
venv\Scripts\Activate.ps1
```

**Walkthrough of `source venv/bin/activate`:** `source` is a shell built-in command. It runs the commands in the file `venv/bin/activate` *inside the current shell process* rather than in a new process. This distinction is crucial. If the shell ran the script in a child process, the child process could modify its own PATH — but when the child exits, those changes disappear. The parent shell's PATH is unchanged. By using `source`, the activation script's PATH changes happen in your current shell and persist for the rest of the session.

The activation script does one thing: it prepends `venv/bin` to PATH. Now when you type `python3` or `pip`, the shell finds the virtual environment's versions first — before the global versions. Your prompt changes to show `(venv)` as confirmation.

After activation, run:
```
python3 --version
pip3 --version
```

The output will look the same as before, but these are now the virtual environment's versions, not the global ones.

To deactivate when you are done working on this project:
```
deactivate
```

**Important:** Every time you open a new terminal window to work on this project, you must activate the virtual environment again. It is not automatic. The `(venv)` prefix in your prompt is always the indication that you are inside it.

**CS lens — process isolation through PATH manipulation.** A virtual environment is not a container, a VM, or a sandbox in the operating system sense. It is a much simpler trick: it prepends a directory to PATH. The Python interpreter and pip it points to happen to have their own site-packages directory (where installed packages live). That is the entire mechanism. The "isolation" is that the virtual environment's site-packages directory is separate from the global one, so packages installed inside it do not affect the global Python installation, and vice versa.

This is the same principle as variable shadowing in programming: a local variable with the same name as a global one "shadows" the global one within its scope. The virtual environment's Python shadows the global Python within the activated shell.

**SE lens — reproducible environments.** The reason this matters in production is **dependency conflicts**. A real-world application server might run 50 different Python projects. If they all share a global package directory, upgrading a library for one project risks breaking 49 others. Isolated environments — one per project, each with its own declared dependencies — are the solution. In production, this isolation is taken further with Docker containers, which you will use in Sprint 3. A virtual environment is the development-environment version of that same principle.

**Real-world connection:** Python's `venv` is the standard mechanism for dependency isolation in every Python project. Every Python tutorial, every open-source project, every company's Python onboarding guide starts with `python3 -m venv venv`. When you clone a Python project from GitHub and read "Create a virtual environment and activate it," this is the command they mean.

**What breaks without this:** If you install packages without activating the virtual environment, they install globally. When you later activate the environment and try to import them, Python will not find them — because it is looking in the virtual environment's package directory, not the global one. The error is `ModuleNotFoundError: No module named 'fastapi'` even though you ran `pip install fastapi`. Fix: activate the environment first, then reinstall the packages.

---

### 8. Install VS Code

**The problem:** You need a program to write code. A plain text editor works, but a modern code editor adds two things that matter enormously for learning: it shows you type errors as you write (before you run the code), and it shows completions for every function and variable you type. These are not luxuries — they are the feedback loop that turns debugging from guessing into reading.

Go to [https://code.visualstudio.com](https://code.visualstudio.com) and download VS Code for your operating system. Run the installer.

**What VS Code is:** VS Code is a text editor extended by a plugin system. At its core it reads and writes text files — nothing more. Every language-specific feature (Python type checking, TypeScript error highlighting, React component navigation) comes from an **extension** — a separate program that VS Code loads and communicates with over a standard protocol called the Language Server Protocol (LSP). Because extensions are separate programs, a buggy extension cannot crash VS Code — it can only crash itself. And because LSP is an open standard, the same language server that powers VS Code also powers Neovim, Emacs, and every other editor that implements LSP.

After installation, open VS Code. Press `Cmd+Shift+X` (macOS) or `Ctrl+Shift+X` (Windows/Linux) to open the Extensions panel. Install these four:

1. **Python** (by Microsoft) — language support for Python: syntax highlighting, the ability to select which virtual environment to use, and integration with the Pylance language server.

2. **Pylance** (by Microsoft) — the language server for Python. A language server is a program that analyses your code statically (without running it) and reports type errors, undefined names, and incorrect function calls in real time. When VS Code underlines a Python variable in red, Pylance found the error. Pylance uses the type annotations you write (which you will learn in Sprint 2) to catch bugs before you run the code.

3. **ESLint** (by Microsoft) — a **linter** for JavaScript and TypeScript. A linter is a static analysis tool that checks your code for common mistakes (unused variables, unreachable code, calling `await` on a non-Promise) and style violations. ESLint runs on every file you save and shows warnings inline. You will configure its rules once; after that it catches entire categories of bugs automatically.

4. **Prettier** (by Prettier) — a **code formatter**. A formatter enforces consistent code style (indentation, quote style, line length) by automatically rewriting your code on every save. You will never manually align code or debate tabs-versus-spaces again. The format Prettier enforces is not always what any individual person prefers — the point is that it is consistent and automatic, removing an entire category of irrelevant decisions from your day.

**CS lens — static analysis.** Pylance and ESLint are both **static analysis** tools — they analyse code without running it. Static analysis works by parsing your code into an abstract syntax tree (the same tree structure a compiler builds), then walking that tree and applying rules. "Is this variable used after it is declared?" is a tree-walking question. "Does this argument's type match the function's parameter type?" is a type-system question answerable from the tree and the type annotations. You will learn to write type annotations in Sprint 2, and once you do, Pylance's type checking becomes a second compiler that runs continuously as you write.

**SE lens — the feedback loop.** The time between writing a bug and discovering it is the most important variable in development speed. If you discover a bug when you run the code, you spend minutes finding it. If the editor shows the bug as you type, you spend seconds. The four extensions above close that feedback loop: Pylance catches Python type errors before you run Python; ESLint catches JavaScript errors before you run JavaScript; Prettier removes the mental overhead of formatting so you spend more attention on logic. This feedback loop is not optional at any professional engineering team — it is table stakes.

**Real-world connection:** Every professional engineering team uses a linter and a formatter. The specific tools vary (ESLint, Biome, Rome for JavaScript; Pylance, mypy, Ruff for Python), but the principle is universal: automated checking of code quality, applied on every save, is cheaper than code review and faster than runtime debugging. This is why code review in industry focuses on design and logic, not formatting — formatting is automated away.

**What breaks without this:** Without Pylance, you will spend time on bugs that a type checker would have found instantly — calling a function with the wrong number of arguments, accessing a property that does not exist. Without ESLint, you will commit bugs that a linter would have caught — using a variable before it is declared, forgetting to `await` a Promise. These are not style issues; they are real bugs that cause real failures. Install the extensions.

---

### 9. Your first command in each runtime

**The problem:** You have installed two runtimes. You have not yet confirmed they work. Run them.

**Node.js — the REPL:**

```
node
```

The `>` prompt means Node.js is running and waiting for JavaScript. Type:

```javascript
console.log("Node.js is running")
```

Press Enter.

Expected output:
```
Node.js is running
undefined
```

The first line is the output of `console.log`. The second line, `undefined`, is the REPL showing the return value of the expression — `console.log` returns `undefined` because it is called for its side effect (printing), not for a value it computes.

Press `Ctrl+C` twice to exit.

**Walkthrough of `console.log("Node.js is running")`:** The REPL parses the expression you typed. `console` is a global object built into Node.js. The `.` is property access — you are accessing the `log` property of `console`. `log` is a function. The `()` calls it with one argument: the string `"Node.js is running"`. `console.log` writes its argument to standard output (the terminal). The string is printed. `console.log` returns `undefined`. The REPL prints the return value — `undefined` — because the REPL's job is to show you the result of every expression.

**Python — the REPL:**

```
python3
```

The `>>>` prompt means the Python REPL is running. Type:

```python
print("Python is running")
```

Press Enter.

Expected output:
```
Python is running
```

Python's REPL does not print the return value of `print` — it prints `None` only if the expression returns a non-None value. `print()` returns `None`, which the Python REPL suppresses (unlike Node's REPL, which always shows the return value). This is a design difference between the two REPLs, not a difference in how the functions work.

Press `Ctrl+D` to exit (macOS/Linux) or `Ctrl+Z` then Enter (Windows).

**CS lens — REPL.** REPL stands for Read–Eval–Print Loop. The program reads one expression you type (Read), evaluates it — runs it and produces a result (Eval), prints the result (Print), and waits for the next input (Loop). The REPL is the most direct interface to a language runtime that exists. Every language that runs in a REPL can be explored interactively: you can test a function call, inspect a data structure, or trace through logic one expression at a time without writing a file. You will use the Python REPL throughout this curriculum to test ideas before writing them into a file.

**SE lens — the REPL as a debugging tool.** When production code behaves unexpectedly, one of the first tools engineers reach for is the REPL: copy the relevant data, open a REPL session, and replay the logic manually to find where the result diverges from expectation. Understanding that this option exists — and that the REPL gives you a live connection to the runtime with all your libraries available — is a skill that separates engineers who can debug efficiently from engineers who guess and rerun.

**What breaks without this:** If `node` gives `command not found`, Node.js is not on PATH — revisit section 4. If `python3` gives `command not found`, Python is not on PATH — revisit section 6.

---

### 10. Version control with git

**The problem:** You are about to start building a real project. Every change you make from this point forward should be recoverable. Every decision you make should be explainable to a future reader — including your future self. Without version control, there is no history, no undo beyond the last save, no way to understand what changed or why.

**Installing git:**

Go to [https://git-scm.com](https://git-scm.com). Download and run the installer. Accept the defaults.

Verify:
```
git --version
```

Expected output:
```
git version 2.44.0
```

**What git is:** Git is a **version control system** — a program that records the history of every change made to a set of files. Every version of every file you have ever committed is permanently stored and retrievable. You can return to any previous state. You can see exactly what changed between any two points. You can work on two different changes simultaneously without them interfering (branches). For a developer working alone without colleagues, git is not optional — it is the difference between a project you can maintain and a project that accumulates invisible technical debt.

**Configure your identity.** Git attaches a name and email address to every change you record. This is how teams know who made each change — and how you will know who made each change in six months when there is only one contributor and that contributor is you:

```
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

**Walkthrough:** `git` is the main program. `config` is a subcommand — a second word that tells `git` which operation to perform. `--global` is a flag telling git to write this setting to the user-level configuration file, `~/.gitconfig`, which applies to all git repositories on your machine. (The `~` character is shell shorthand for your home directory — the shell substitutes the actual path before passing it to any program.) Without `--global`, git would write the setting to the current repository only.

`user.name` and `user.email` are the configuration keys. The quoted strings are the values. After running these two commands, `~/.gitconfig` contains an `[user]` section with your name and email. Every `git commit` you ever make on this machine will use these values.

**Initialise a repository:**

If you ran `mkdir fullstack-project` and `cd fullstack-project` in section 7, you are already in the right place. If not, create it now:

```
mkdir fullstack-project
cd fullstack-project
```

Now initialise the repository:

```
git init
```

Expected output:
```
Initialized empty Git repository in /Users/yourname/fullstack-project/.git/
```

**Walkthrough:** `git init` creates a hidden directory named `.git` inside `fullstack-project`. This directory is git's database — it stores every commit, every branch, every tag, every version of every file you have ever committed. The `.` prefix makes it hidden (invisible to `ls` by default on macOS/Linux; use `ls -a` to see hidden files). The repository is not on GitHub or any remote server — it is entirely local, on your machine. "Local" versus "remote" is a distinction you will use throughout this curriculum: local means on your computer; remote means on a server somewhere else.

**The three states of a file in git:**

Git tracks every file in your project in one of three states:

1. **Modified** — you have changed the file on disk, but git does not know about it yet. The change exists only in your working directory.
2. **Staged** — you have explicitly told git "include this change in the next commit." The change is in the **staging area** (also called the index). Git knows about it but has not permanently recorded it yet.
3. **Committed** — the change is permanently recorded in the repository's history. It has a hash, a timestamp, and your name attached to it.

The staging area is what makes git flexible: you can modify ten files but only stage three of them for a commit. This lets you group related changes into one commit and separate unrelated changes into different commits, keeping your history readable.

**Make your first commit:**

```
echo "# Full Stack Project" > README.md
git add README.md
git status
git commit -m "Initialise repository: full-stack curriculum project"
```

**Walkthrough:**

`echo "# Full Stack Project" > README.md` — `echo` prints its argument to standard output. The `>` operator is the shell's **output redirection**: instead of printing to the terminal, the output is written to the file `README.md`. If the file does not exist, it is created. If it does, it is overwritten. `README.md` is a markdown file — a plain text format where `#` means a top-level heading. GitHub and most code hosts render it as formatted HTML on the repository's main page. Every repository should have one.

`git add README.md` — moves `README.md` from the modified state to the staged state. Only staged files are included in the next commit. `git add` takes a file name or a glob pattern. You can stage individual files, all files in a directory, or all modified files at once. The explicit file name is preferred: staging everything at once risks accidentally committing files that should not be committed (like `.env` files containing secrets).

`git status` — prints the current state of the repository: which files are modified, which are staged, which are untracked (exist on disk but have never been committed). Always run `git status` before committing — it shows you exactly what is about to be committed.

Expected output of `git status`:
```
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   README.md
```

`README.md` appears under "Changes to be committed" — it is staged and ready.

`git commit -m "Initialise repository: full-stack curriculum project"` — creates the commit. Every staged file is recorded in a snapshot. The snapshot is assigned a hash — a 40-character hexadecimal string computed from the content of the files, the commit message, the author, the timestamp, and the parent commit's hash. This hash is how git identifies every commit uniquely. The `-m` flag provides the commit message inline. Without `-m`, git opens a text editor (usually vim or nano) for you to type the message.

**What a commit message is:** A commit message is not a list of what files changed — git records that automatically. It is an explanation of *why* this change was made. "Add README" tells you nothing a future reader could not see by looking at the diff. "Initialise repository: full-stack curriculum project" tells them why this snapshot exists and what it marks. The format used here is `type: description` — the type names the category of change (initialise, add, fix, refactor, test), and the description explains the why. You will use this format for every commit in this curriculum.

**CS lens — content-addressed storage.** Git stores data in a **content-addressed** way: the name (hash) of every object is computed from its content. If two commits contain identical content, they produce the same hash. If you change one byte of a file and commit it, the new commit has a completely different hash. This property is what makes git's history tamper-evident: to change a past commit, you would need to change its hash, which changes the next commit's parent hash, which changes that commit's hash, and so on — the entire chain from the modified commit to the present would need to be recomputed. Git would detect the discrepancy immediately.

This same data structure — a linked list of hashes where each node includes the hash of the previous node — is the foundation of blockchains. Git invented it first.

**SE lens — version control as professional practice.** Every professional software project uses version control. The reasons are practical:

- You can undo any change at any time (`git revert`, `git checkout`)
- You can see who changed what and why (`git log`, `git blame`)
- You can work on multiple features simultaneously without them interfering (`git branch`)
- Your history is a record of decisions — commit messages explain why the code is the way it is

For a self-taught developer working alone, git serves a different but equally important function: it is a safety net. The confidence to experiment, refactor, and delete code comes from knowing you can always go back. Without that safety net, developers become conservative, afraid to touch code that works — even when it needs to change.

**Real-world connection:** Every codebase at every company uses git. GitHub, GitLab, and Bitbucket — the platforms where code is hosted — are all built on git. When a company says "open a pull request," they mean: create a branch in git, commit your changes, push the branch to GitHub, and request that someone review and merge it. You will do exactly this in Sprint 5.

**What breaks without this:** If `git commit` fails with `Please tell me who you are`, git does not have your `user.name` and `user.email` configured. Run the two `git config` commands from earlier in this section. If `git init` fails with `command not found`, git is not installed or not on PATH — reinstall from git-scm.com and open a new terminal.

---

## Connect the pieces

You have four programs running: Node.js, Python, git, and VS Code. Each one has a specific role in this curriculum:

- **Node.js** runs the React development server. It compiles your TypeScript and serves the result to the browser.
- **Python** runs the FastAPI server. It handles HTTP requests, queries the database, and returns JSON.
- **git** records every change you make. Every lesson in this curriculum ends with a git commit.
- **VS Code** is where you write code. Pylance and ESLint give you immediate feedback without running anything.

These four programs communicate over your machine's network loopback — they never leave your computer. In Lesson 2, the browser makes HTTP requests to the Vite dev server (Node.js). In Lesson 3, the browser makes HTTP requests to the FastAPI server (Python). In Sprint 3, FastAPI makes TCP connections to a Postgres database. Everything runs locally on your machine, and everything communicates over the same network protocols that the public internet uses — which is why the concepts you learn here transfer directly to production.

PATH is the connective tissue that makes all of this possible: it is the mechanism by which your shell finds each of these programs. Every time a command "doesn't work," PATH is the first thing to check.

---

## What breaks without this

**Node.js on PATH but wrong version:** `node --version` shows v12 or v14 instead of v20. Older versions of Node may not support the syntax or APIs that modern React and Vite require. Fix: install the current LTS version. If multiple Node versions are installed, use `which node` to see which one PATH finds first.

**Python virtual environment not activated:** You install `fastapi` and then try to import it in a Python file, but Python says `ModuleNotFoundError: No module named 'fastapi'`. The package was installed into the global Python, but the virtual environment's Python is running. Fix: check for `(venv)` in your prompt. If it is missing, `cd` to your project directory and run `source venv/bin/activate`.

**Git identity not configured:** Every `git commit` prints:
```
Author identity unknown

*** Please tell me who you are.

Run

  git config --global user.email "you@example.com"
  git config --global user.name "Your Name"
```
Fix: run those two commands exactly as shown.

**VS Code not finding the virtual environment:** VS Code's Python extension uses the system Python, not the virtual environment. In VS Code, press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux), type "Python: Select Interpreter," and choose the interpreter inside your `venv` directory. The path will look like `./venv/bin/python`. After selecting it, VS Code uses the virtual environment's Python for type checking and package resolution.

---

## Definition of done

Verify every item yourself before moving to Lesson 2.

- [ ] `node --version` prints `v20.x.x` or later — no errors
- [ ] `npm --version` prints a version number — no errors
- [ ] `python3 --version` (or `python --version`) prints `Python 3.x.x`
- [ ] `pip3 --version` (or `pip --version`) prints a version number
- [ ] `git --version` prints a version number
- [ ] VS Code opens; the Python, Pylance, ESLint, and Prettier extensions are installed
- [ ] The `fullstack-project` directory exists on your machine
- [ ] `cd fullstack-project && ls -a` shows a `.git` directory
- [ ] `git log` inside `fullstack-project` shows one commit with the message "Initialise repository: full-stack curriculum project"
- [ ] `python3 -m venv venv` has been run inside `fullstack-project`
- [ ] Activating the virtual environment shows `(venv)` in your prompt
- [ ] `which python3` inside the activated environment shows a path containing `venv`

**Commit you should have made:**

```
git commit -m "Initialise repository: full-stack curriculum project"
```

This commit marks the moment you had a working environment. In six months, when you are debugging a dependency issue, you will be able to run `git log` and see exactly when this project started.

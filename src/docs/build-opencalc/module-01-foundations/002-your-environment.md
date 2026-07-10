# 002 — Your Environment

*The terminal, Node.js, npm, git, and VS Code — what each one is and what it is responsible for*

---

## What You Will Build

You will verify that five tools are installed and working: the shell, Node.js, npm, git, and VS Code. By the end of this lesson you will have run five verification commands and understood exactly what each tool is, what environment it runs in, and what failing verification would mean.

You will also build a complete mental model of the four environments your code lives in throughout this series: your machine, the build output, the browser, and localhost. Confusing these environments is one of the most common sources of errors that are hard to diagnose. After this lesson, you will know which tool belongs to which environment and why.

---

## What You Need to Know First

Lesson 001 — What Is Software Engineering? This lesson references the requirements you wrote there. The concept of separation of concerns applies here at the tool level: each tool has exactly one job.

---

## The Lesson

### The terminal — the universal control interface

The **terminal** (also called the command line, shell, or console) is a program that accepts text commands and runs other programs in response. It is the primary control interface for all software development.

On a Mac: press Cmd+Space, type "Terminal", press Enter.  
On Windows: search for "Windows Terminal" or "PowerShell" in the Start menu.  
On Linux: usually available with Ctrl+Alt+T, or find it in your applications.

When it opens, you see a **prompt** — a line ending in `$`, `%`, or `>` waiting for input. The prompt shows two things: the current working directory, and that the shell is ready for a command.

Run the first command:

```bash
pwd
```

`pwd` is a program that stands for "print working directory." It reads the shell's internal state and prints the full path of the directory the terminal is currently operating in. A **path** is the address of a location in the file system, written as directory names separated by forward slashes: `/Users/yourname/Documents`. The leftmost slash is the root of the file system — the top of the hierarchy. Everything is inside it.

```bash
ls
```

`ls` is a program that stands for "list." It prints the names of all files and directories in the current working directory. Run it in your home directory and you will see Documents, Downloads, Desktop, and so on.

```bash
cd Documents
```

`cd` stands for "change directory." It moves your working directory to the folder you name. `cd Documents` moves you into `Documents`. `cd ..` moves you up one level — two dots always means "the parent of the current directory." `cd` with no argument moves you back to your home directory.

`pwd`, `ls`, and `cd` look like built-in shell features but only one of them is. `pwd` and `ls` are separate programs the shell finds and runs. `cd` is built into the shell itself because changing the working directory changes the shell's own state — a separate process cannot do this; it would change its own directory and exit, leaving the shell unchanged.

The shell finds programs by searching a list of directories stored in a variable called `PATH`. When you type `node`, the shell looks through every directory in `PATH` until it finds a program named `node`, then runs it. If no match is found, it prints `command not found`.

---

**Reading terminal error messages:**

Terminal errors follow a consistent structure. Learning to read them is a prerequisite for all lessons that follow.

`command not found` — the shell searched every directory in PATH and found no program with this name. Either the program is not installed, or it is installed somewhere PATH does not include.

`Permission denied` — your user account does not have permission to read, write, or execute what you tried to access.

`No such file or directory` — the path you provided does not exist. Check spelling. On Mac and Linux, file systems are case-sensitive: `Documents` and `documents` are different directories.

---

**CS lens — the shell as an interpreter:**

The shell is a program that reads text, interprets it as a command, finds the named program, passes the arguments, and prints the result. This is exactly what a language interpreter does: read source, evaluate, produce output. The shell is a programming language whose syntax is optimised for running programs and composing their output.

`bash` and `zsh` are two shells — two programs with slightly different syntax. Macs default to `zsh`. Linux defaults to `bash`. For everything in this series, they behave identically.

---

**SE lens — why the terminal exists when GUIs exist:**

Every GUI is a layer on top of programs. When you click "Install" in a package manager, it runs a command. When you click "Build" in an IDE, it runs a command. When you click "Commit" in a git GUI, it runs `git commit`.

The GUI gives you access to a curated subset of the tool's features — the ones the GUI designers chose to expose. The terminal gives you access to all of them.

More practically: a terminal command is exact and reproducible. A screenshot of a GUI is ambiguous. If you ask for help with a problem, a command and its output can be read and reproduced by anyone anywhere. A screenshot requires someone to interpret what they are seeing.

---

### Node.js — JavaScript outside the browser

**Node.js** is a program that runs JavaScript without a browser. It is built on V8, the same JavaScript engine Chrome uses, but with a different set of built-in capabilities.

Verify it is installed:

```bash
node --version
```

Expected output: `v20.x.x` or higher. If you see `command not found`, Node.js is not installed.

**To install Node.js:** go to nodejs.org and download the LTS version. **LTS** stands for Long-Term Support — this version receives security updates for years. The "Current" version is newer but may contain breaking changes. Install LTS.

After the installer runs, close your terminal, open a new one, and run `node --version` again. The installer adds Node to your PATH; re-opening the terminal loads the updated PATH.

What Node.js adds beyond the browser JavaScript engine:

The browser runs JavaScript but deliberately restricts what it can do. A webpage cannot read files from your hard drive, open arbitrary network connections, or execute system commands. These restrictions are the browser's security model — they protect you from malicious code on sites you visit.

Node.js removes those restrictions. Node.js JavaScript can:
- Read and write files (the `fs` module)
- Make network connections to any server (the `http` and `net` modules)
- Execute system commands (the `child_process` module)
- Access environment variables (`process.env`)

This is why build tools are written in Node.js. Vite reads your source files, compiles them, and writes output files. None of that is possible in the browser. Node.js is the environment where all build-time code runs.

Run JavaScript directly from the terminal without a file:

```bash
node -e "console.log(2 + 2)"
```

`node` invokes the Node.js runtime. `-e` is a **flag** — a modifier that changes what the command does. A flag starting with a single dash is a single-letter flag. A flag starting with two dashes is a full-word flag. The `-e` flag means "evaluate the string that follows as JavaScript instead of reading a file." The output is `4`.

Run the script from lesson 001:

```bash
node requirements.js
```

Node reads `requirements.js`, executes it top to bottom, and when the last line (`printRequirements()`) executes, the output appears.

---

**CS lens — Node.js as a runtime environment:**

A **runtime environment** is a program that provides the infrastructure another program needs to execute. The browser is a runtime environment for JavaScript — it provides V8, the DOM, network APIs, and the security sandbox. Node.js is a different runtime environment for the same language — it provides V8, file system access, network APIs, and the process API, without the browser sandbox or DOM.

The key insight: JavaScript is a language specification. V8 is an implementation of that specification. Node.js and Chrome both use V8, so the language is identical. What differs is the APIs each runtime provides. `document.querySelector` exists in the browser but not in Node.js. `fs.readFileSync` exists in Node.js but not in the browser.

---

**SE lens — right tool for each environment:**

The platform you are building runs in two environments during development: the browser (where users interact with it) and Node.js (where the build tools compile it). Code written for one environment does not run in the other. A function using `fs.readFile` will throw in the browser. A function using `document.getElementById` will throw in Node.js.

This is separation of concerns at the environment level: build-time code runs in Node.js; runtime code runs in the browser. Keeping them separated prevents a class of errors that only appear at deployment.

---

### npm — the package manager

**npm** (Node Package Manager) is installed automatically alongside Node.js. It connects to a public registry at npmjs.com that hosts over two million JavaScript packages — code other developers have written, tested, and published.

Verify it is installed:

```bash
npm --version
```

Expected output: `9.x.x` or higher. If Node.js installed correctly, npm should be present. If not, reinstall Node.js from nodejs.org.

How npm installs packages:

```bash
npm install vitest
```

`install` is the **subcommand** — the specific action within npm you want to perform. `vitest` is the package name. npm downloads the package from its registry and places it in a folder called `node_modules` in the current directory. It also records the dependency in `package.json` (covered in lesson 006).

```bash
npm install --save-dev vitest
```

The `--save-dev` flag (which can be shortened to `-D`) marks the package as a **development dependency** — needed to build and test, but not when the app runs in production. Test runners, compilers, and linters are development dependencies. Libraries your app uses at runtime are regular dependencies.

Verify npm can reach its registry:

```bash
npm help
```

This prints a list of npm subcommands without making a network request. If you see a list, npm is working.

---

**The cost of dependencies:**

Every package you install is a dependency. Your code depends on theirs. Dependencies have costs beyond download time:

**Security:** A library with a known vulnerability makes your application vulnerable. Run `npm audit` to check every installed package against a database of known vulnerabilities.

**Maintenance:** If a library stops being maintained, its bugs become your bugs. A library maintained when you chose it may be abandoned when a critical bug is found two years later.

**Bundle size:** Every library adds bytes to what users download. A library saving 30 minutes of writing but adding 200 kilobytes adds seconds of load time on every visit.

**Comprehension cost:** Every dependency is something a new developer must understand to work on the project. From the requirements: "A developer can add a new lab by reading fewer than 50 lines." Each dependency in the chain makes that harder.

Professional engineers are conservative with dependencies.

---

**CS lens — the dependency graph:**

When package A requires package B, and B requires C, you have a directed dependency graph: A → B → C. npm resolves this graph when you install — it downloads not just what you asked for but everything it depends on, transitively.

The full resolved graph is recorded in `package-lock.json` (covered in lesson 006) so that `npm install` on any machine produces the exact same package versions.

**Supply chain attacks:** A malicious actor who compromises package C affects every package that depends on it, directly or transitively. More packages means a larger attack surface. This is not theoretical — it has happened to packages downloaded millions of times per week.

---

**SE lens — code you did not write is code you trust:**

When you write code, you understand its behaviour and security implications. When you install a package, you trust that its author did the same. For a widely-used package with a long security history, that trust is well-founded. For an obscure package with one contributor and no release history, it may not be.

Reading a package's source, checking its maintenance activity, and reviewing its download count are habits that distinguish careful engineers from those who install packages by keyword search.

---

### git — version control

**git** is a version control system. It records a history of changes to your project, identifies who made each change and when, and lets you return to any previous state.

Verify it is installed:

```bash
git --version
```

Expected output: `git version 2.x.x`.

On a Mac, if git is missing, this command may prompt you to install the Xcode Command Line Tools — a set of development tools Apple provides. Follow the prompt and install.  
On Windows: download from git-scm.com.  
On Linux: `apt install git` (Ubuntu/Debian) or `yum install git` (Red Hat/CentOS).

Why version control matters — without it, you have three options when code breaks:

1. Undo (Ctrl+Z) until you have reversed enough history — but editors clear their undo state when closed, and undo does not span multiple files.
2. Remember what the code looked like before and retype it — expensive, error-prone, impossible after a long session.
3. Lose the working state — the most expensive option, often the only one available.

With version control, you have a fourth option:

```bash
git checkout .
```

This restores every tracked file to its last committed state. Every file. In under a second. The dot means "the current directory and everything inside it."

---

**What git records:**

A **commit** is a permanent, labelled snapshot of every tracked file at a moment in time, linked to the commit before it. Commits form a chain: each points to its parent. You can follow the chain backward from the newest commit to the very first.

A commit cannot be changed after it is made. You can add new commits that reverse previous changes, but the originals remain in the history. This immutability is what makes git history trustworthy.

git is covered in full in lesson 003. This lesson verifies it is installed.

---

**CS lens — git as an append-only linked list:**

Each commit is a data structure containing:
- A **tree object**: the state of every tracked file, stored compressed
- A **pointer to the parent commit**: the one before it
- **Metadata**: author, timestamp, message

The chain of commits is a linked list that grows only forward. You can traverse it backward by following parent pointers. SHA-1 hashes identify each commit uniquely — if any part of the commit content changes, the hash changes. The hash is what makes commits verifiable and tamper-evident.

---

**SE lens — version control as a decision record:**

Most tutorials describe version control as "saving your work." This is technically accurate but misses the more important function: git records decisions.

The diff (the record of what changed) is automatic — git computes it. The commit message is the only place to record *why* the change was made. A message that restates the diff adds nothing. A message that explains the decision adds everything.

This will be practised in lesson 003.

---

### VS Code — the editor

**Visual Studio Code** (VS Code) is a code editor — a program for writing and navigating code. It is not required; any program that saves plain text files works. VS Code is recommended here because:

1. It integrates with TypeScript directly — errors appear as you type, before you run the code.
2. It has a built-in terminal — run commands without switching applications.
3. Its JavaScript and React extensions are the most actively maintained.

Download from code.visualstudio.com. Install and open it.

Verify it is accessible from the terminal:

```bash
code --version
```

If this returns `command not found`, VS Code is installed but the `code` command is not in your PATH. Fix it: in VS Code, press Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux) to open the **command palette**. The command palette is a search box for VS Code commands — you type what you want to do and it finds the action. Type "Shell Command" and select "Shell Command: Install 'code' command in PATH". Restart your terminal and run `code --version` again.

After the command is available, `code .` opens VS Code in the current directory. The dot means "the current directory" — the same convention as `cd .` and `git checkout .`.

The VS Code areas used throughout this series:

**File Explorer** (`Ctrl+Shift+E` / `Cmd+Shift+E`) — the left panel showing your project files and directories. Everything you create in the terminal appears here instantly.

**Editor area** — where you write code. Multiple files open as tabs. Click a file in the Explorer to open it.

**Integrated Terminal** (Ctrl+\` / Cmd+\`) — a full shell terminal inside VS Code, opened in your project directory automatically. You do not need to `cd` to your project each time.

**Problems panel** (`Ctrl+Shift+M` / `Cmd+Shift+M`) — where TypeScript and ESLint errors are listed. Each entry shows the file, line number, column, and error description. Clicking any entry jumps to that location. You will use this constantly.

**Source Control** (`Ctrl+Shift+G` / `Cmd+Shift+G`) — shows which files have changed since the last git commit, lets you write commit messages, and runs git commands. This panel runs the same commands as the terminal — it is a GUI layer on top of git.

---

**Extensions to install now:**

Open the Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`). Search for and install these two:

**ESLint** — a static analysis tool that reads your JavaScript without running it and reports problems: unused variables, likely bugs, style violations. It runs as you type. Errors appear as red underlines in the editor and in the Problems panel. You will configure it in lesson 007.

**Prettier** — a code formatter that rewrites your code's whitespace and formatting to a consistent style on every save. After installing, open settings (`Ctrl+,` / `Cmd+,`), search "default formatter," select Prettier. Enable "Format on Save."

Why consistent formatting matters: when two versions of a file differ only in whitespace, the diff shows reformatting as noise — hundreds of lines that changed but contain no logical change. Automated formatting eliminates that noise. Code review focuses on logic, not indentation.

Do not install other extensions yet. Each extension runs in the editor background. Install only what you need.

---

**CS lens — VS Code as an IDE:**

An **IDE** (Integrated Development Environment) combines editor, terminal, error reporter, and version control into one application with shared context. The editor knows which file you are in; the error panel knows which line the error is on; clicking the error jumps to the line.

The integration shortens the feedback loop. The time between writing a line and knowing it is wrong goes from minutes (compile, read output, find file, find line) to seconds (see red underline, read tooltip). Shorter feedback loops produce better code faster.

---

**SE lens — automate what can be automated:**

Prettier's most important feature is not that code looks nice. It is that formatting is no longer a decision. When formatting is automatic and enforced, developers never spend time on tabs-versus-spaces debates, diffs never contain formatting-only changes, and two developers working on the same file never produce formatting conflicts.

This is a specific instance of a general principle: decisions that can be automated should be automated. Developer attention is finite. Spending it on formatting is waste.

---

### The four environments — a complete map

Your code will live in four distinct environments throughout this series. Confusing them is a source of errors that are difficult to diagnose without this map.

---

**Environment 1: Your machine (development)**

Your machine is where you write code. The tools installed in this lesson — Node.js, npm, git, VS Code, Vite, the TypeScript compiler — exist only here. None of them are present when users run your application. They are for building, not for running.

When you run `node requirements.js`, it runs here.  
When you run `npm run dev`, Vite starts here.  
When you run `npm test`, Vitest runs here.

---

**Environment 2: The build output**

The build output is a folder of compiled, optimised files — HTML, JavaScript, CSS — produced by running `npm run build`. Your source code (TypeScript, JSX, ES modules) is transformed into this. The build output is what gets deployed to a web server. Users receive it.

Users never see your source code. This means you can use TypeScript (which browsers cannot run natively) and JSX (which browsers cannot parse) — the build step compiles them to JavaScript and HTML the browser understands.

---

**Environment 3: The browser (runtime)**

The browser is where users interact with your application. It executes the compiled JavaScript from the build output. There is no Node.js in the browser, no TypeScript compiler, no Vite. Only compiled JavaScript, the browser's DOM, and the browser's JavaScript engine.

`document.getElementById`, `window.location`, and `navigator.serviceWorker` are browser APIs — they exist only here.  
`fs.readFileSync` and `process.env` are Node.js APIs — they do not exist in the browser. Calling them throws an error.

---

**Environment 4: Localhost (the dev server)**

When Vite runs during development, it starts a web server that listens at `localhost:5173`. Your browser requests files from this server. Vite compiles them on demand and responds. This feels like the browser environment because you access it with a browser — but the server behind it is Vite running in Node.js on your machine.

`localhost` means "this machine." It is shorthand for the **loopback address** `127.0.0.1` — a special network address that routes traffic back to the same machine instead of out to the internet. When your browser navigates to `localhost:5173`, it sends an HTTP request to your own computer. No traffic leaves your machine. No internet connection is required.

`5173` is a **port number** — a number between 1 and 65535 that routes a network connection to a specific program on a machine. Port 5173 is where Vite listens. Port 443 is where HTTPS traffic goes by convention. Port 80 is HTTP. Only one program can hold a port at a time — if you start two Vite servers, the second one cannot claim 5173 (already in use) and picks a different number.

---

**Verify all four tools in sequence:**

```bash
node --version && npm --version && git --version && code --version
```

`&&` chains commands: run the next one only if the previous one succeeded. If any tool is missing, the chain stops at the missing one and you see which failed.

Expected output (versions will differ):

```
v20.11.0
10.2.4
git version 2.42.0
1.85.1
```

Four lines, four version numbers, no errors. This is the visible output of this lesson: your environment is verified.

---

**CS lens — compile time versus runtime:**

The four environments map onto two phases: compile time (your machine, build output) and runtime (browser, localhost-as-browser).

**Compile time** is when source code is transformed into executable output. TypeScript errors are compile-time errors — the compiler reads source and reports problems before anything executes.

**Runtime** is when the compiled output executes and users interact with it. Runtime errors are uncaught exceptions, undefined-is-not-a-function, and network failures — things that only happen when the program is actually running.

The goal of static analysis (TypeScript, ESLint) is to move errors from runtime to compile time. A compile-time error costs a developer a second to fix. A runtime error costs a user a bad experience and a developer hours of debugging in a production environment.

---

**SE lens — environment confusion is a class of error:**

The most common environment confusion error: using a Node.js API in browser code.

```javascript
// ERROR: This file runs in the browser — fs does not exist there
import fs from 'fs'
const content = fs.readFileSync('data.json', 'utf-8')
```

This fails at runtime with `Cannot find module 'fs'`. Without the four-environment model, the error is confusing — you know the code works in Node.js, but cannot understand why it fails.

With the model: "this file is in browser runtime environment; `fs` is a Node.js API; the browser has no file system access by design; use `fetch` instead." The environment model converts a confusing error into a clear diagnosis.

The environments are not arbitrary — they reflect different security models. Node.js can read your disk because you ran it deliberately. The browser cannot because it may be running untrusted code from the internet.

---

## Connect the Pieces

You now have five tools installed and a mental model of four environments.

The connection to the requirements from lesson 001:

"A developer can add a new lab by reading fewer than 50 lines" — this requirement implies the tools must be minimal. Every tool in the chain (Node.js, npm, Vite, TypeScript) has a learning cost. The fewer unfamiliar tools, the lower that cost. Each dependency installed in lesson 006 is a tool someone must understand.

"Any lab loads within 2 seconds on a 4G connection" — this is measured in the browser environment with a production build, not on localhost. The dev server at localhost is not representative of production speed — it does not minify, does not compress, and does not use production caching. When you measure load time, measure the production build.

In lesson 003, you will use git for the first time — initialising a repository and making the first commit. The tools verified today are prerequisites for that lesson.

In lesson 007, you will use npm and Node.js together — creating `package.json` and starting Vite's dev server. What you verified today makes that lesson possible.

---

## What Breaks Without This

If you skip environment verification and discover a missing tool mid-lesson:

**Node.js missing in lesson 007:**

```
npm run dev
→ npm: command not found
```

You have a lesson in progress, partially-written files, and a blocked task. Installing Node.js now means closing VS Code, running the installer, restarting the terminal, and returning to where you were — with no guarantee the installed version is compatible with the packages the lesson requires.

**git missing in lesson 003:**

```
git init
→ bash: git: command not found
```

Lesson 003 cannot be completed. Its definition of done includes a commit. A lesson with an uncompleted definition of done is a lesson incompletely learned — the commit is not optional housekeeping, it is the practise that makes the skill.

**VS Code `code` command missing:**

```
code .
→ bash: code: command not found
```

Not lesson-blocking, but the verification command from this lesson did not pass. Your environment is not in the known-good state this lesson's definition of done requires. Fix it before continuing.

All three failures share the same root: discovering a missing prerequisite when you need it instead of before. This lesson exists to prevent that.

---

## Definition of Done

- [ ] `node --version` prints `v18.x.x` or higher
- [ ] `npm --version` prints a version number
- [ ] `git --version` prints a version number
- [ ] `code --version` prints a version number (VS Code installed, `code` command in PATH)
- [ ] You can explain what `localhost` means without looking it up
- [ ] You can name all four environments and what runs in each one
- [ ] You can explain why `fs.readFileSync` cannot be called in browser-runtime code
- [ ] The ESLint and Prettier extensions are installed in VS Code
- [ ] Prettier is set as the default formatter with Format on Save enabled
- [ ] You have run `node requirements.js` from lesson 001 and seen the output
- [ ] **Git commit** — complete after lesson 003:
  ```
  git commit -m "Verify development environment: Node, npm, git, VS Code installed

  All four tools verified at working versions. Four-environment mental model
  established. ESLint and Prettier configured in VS Code."
  ```

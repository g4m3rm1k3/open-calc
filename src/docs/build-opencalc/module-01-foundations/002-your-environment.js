export const lesson = {
  id:       'build-opencalc-002',
  title:    'Your Environment',
  subtitle: 'The terminal, Node.js, npm, git, and VS Code — what each one is and what it is responsible for',

  // ── Section 1: What you will build ──────────────────────────────────────

  build: `
You will verify that five tools are installed and working on your machine:
the shell, Node.js, npm, git, and VS Code. By the end of this lesson, you
will run five version commands — one for each tool — and understand exactly
what each tool is, what it runs on, and what it would mean if any of the
five failed.

You will also understand the four environments your code will live in
throughout this series: your machine, the build output, the browser, and
localhost. Confusing them is a common source of errors. After this lesson,
you will know which environment each tool belongs to and why.
`,

  // ── Section 2: What you need to know first ──────────────────────────────

  prerequisites: `
Lesson 001 — What Is Software Engineering? This lesson references the
requirements you wrote there. The concept of separation of concerns from
lesson 001 applies here at the tool level: each tool has exactly one job,
and understanding that job prevents confusion about which tool to use when.
`,

  // ── Section 3: The lesson ───────────────────────────────────────────────

  sections: [
    {
      heading: 'The terminal — the universal control interface',
      body: `
The terminal (also called the command line, shell, or console) is a program
that accepts text commands and runs other programs in response. It is the
universal control interface for software development.

On a Mac, open it: press Cmd+Space, type "Terminal", press Enter. On Windows,
search for "Windows Terminal" or "PowerShell". On Linux, it is usually
available with Ctrl+Alt+T.

When it opens, you see a prompt — a line of text ending in \`$\`, \`%\`, or \`>\`
waiting for input. The prompt is telling you two things: the directory you
are currently in (your working directory), and that it is ready for a command.

Run your first command:

\`\`\`bash
pwd
\`\`\`

\`pwd\` stands for "print working directory." It prints the full path of the
directory your terminal is currently operating in. A path is the address of a
location in the file system, written as a sequence of directory names separated
by slashes: \`/Users/yourname/Documents\`. The leftmost slash is the root of
the file system — the top of the hierarchy. Everything else is inside it.

\`\`\`bash
ls
\`\`\`

\`ls\` stands for "list." It prints the names of all files and directories
inside your current working directory.

\`\`\`bash
cd Documents
\`\`\`

\`cd\` stands for "change directory." It moves your working directory to the
one you name. \`cd Documents\` moves you into the \`Documents\` folder inside
your current directory. \`cd ..\` moves you up one level — \`.\` means "the
current directory" and \`.\.\` means "the parent of the current directory."
\`cd\` with no argument moves you to your home directory.

These three commands — \`pwd\`, \`ls\`, \`cd\` — are not special terminal features.
They are programs. \`pwd\` is a program that reads the shell's internal state and
prints the working directory. \`ls\` is a program that reads a directory and
prints its contents. The terminal finds these programs by searching a list of
directories called the PATH — a variable the shell maintains that tells it
where to look for programs by name.

\`cd\` is the one exception: it is built into the shell itself, because changing
the working directory changes the shell's own state. A separate program cannot
do this — it would change its own working directory and exit, leaving the shell
unchanged.

Reading error messages in the terminal:

Terminal errors follow a consistent pattern. Learning to read them is a
prerequisite for everything that follows.

\`command not found\` — the shell searched every directory in PATH and found
no program with this name. Either the program is not installed, or it is
installed in a location not in PATH.

\`Permission denied\` — your user account does not have permission to read,
write, or execute what you tried to access.

\`No such file or directory\` — the path you provided does not exist. Check
spelling and capitalisation. File systems on Mac and Linux are case-sensitive:
\`Documents\` and \`documents\` are different directories.

CS lens — the shell as an interpreter:

The shell is a program that reads text, interprets it as a command, finds
the program being invoked, passes the arguments, and prints the result.
This is exactly what a language interpreter does: read source, evaluate,
produce output. The shell is a programming language with a syntax optimised
for running programs rather than computing values.

\`bash\` and \`zsh\` are two shells — two different programs with slightly
different syntax and features. Macs default to \`zsh\`. Linux defaults to
\`bash\`. For everything in this series, they behave identically.

SE lens — why the terminal exists when GUIs do:

Every GUI application is a layer on top of a program. When you click
"Install" in a package manager, it runs a command. When you click "Build"
in an IDE, it runs a command. When you click "Commit" in a git GUI, it runs
\`git commit\`.

The GUI gives you access to a curated subset of the tool's features. The
terminal gives you access to all of them. For software development, "all of
them" matters regularly. A step that can be done in the terminal can also be
automated, scripted, and run without human input. A GUI step cannot.

More concretely: if you ask for help on a problem and provide a terminal
command and its output, anyone anywhere can read it exactly. A screenshot
of a GUI is ambiguous and cannot be copied.
`,
    },
    {
      heading: 'Node.js — JavaScript without a browser',
      body: `
Node.js is a program that runs JavaScript outside of a browser. It is built
on V8, the same JavaScript engine that Chrome uses, but with a different set
of built-in capabilities.

Verify it is installed:

\`\`\`bash
node --version
\`\`\`

Expected output: \`v20.x.x\` or higher. If you see \`command not found\`, Node
is not installed. Go to nodejs.org and download the LTS version. LTS stands
for "Long-Term Support" — it receives security updates for years. The
"Current" version is newer but may have breaking changes. Install LTS.

When the download completes, re-run \`node --version\`. It should print a
version number.

What Node adds beyond the browser JavaScript engine:

The browser runs JavaScript but deliberately restricts what it can do. A
webpage is not allowed to read files from your hard drive, open network
connections to arbitrary servers, or execute system commands. These
restrictions are the browser's security model — they protect you from
malicious code on websites you visit.

Node removes those restrictions. Node.js JavaScript can:
- Read and write files (the \`fs\` module)
- Make network connections to any server (\`http\`, \`net\` modules)
- Execute system commands (\`child_process\` module)
- Access environment variables (\`process.env\`)

This is why build tools are written in Node.js. Vite reads your source
files, compiles them, and writes output files. None of that is possible in
the browser. Node is the environment where all build-time code runs.

Run a piece of JavaScript directly from the terminal without a file:

\`\`\`bash
node -e "console.log(2 + 2)"
\`\`\`

\`node\` invokes the Node.js runtime. \`-e\` is a flag — a modifier that
changes what the command does. The \`-e\` flag means "evaluate the string
that follows as JavaScript instead of reading a file." The string
\`"console.log(2 + 2)"\` is the JavaScript to evaluate. The output is \`4\`.

Flags always start with a dash (\`-\`) for a single letter or two dashes
(\`--\`) for a full word. \`node --version\` uses the full-word form.
\`node -e\` uses the single-letter form. Most tools support both.

Run the script from lesson 001:

\`\`\`bash
node requirements.js
\`\`\`

This is the same command explained in lesson 001. \`node\` finds the file
\`requirements.js\` in the current directory, reads it, and executes it
top to bottom. Every \`const\` declaration runs. The function declarations
run (defining the functions but not calling them). The last line
\`printRequirements()\` calls the function and produces the output.

CS lens — Node as a runtime environment:

A runtime environment is a program that provides the infrastructure another
program needs to execute. The browser is a runtime environment for JavaScript
— it provides the V8 engine, the DOM, network APIs, and the security sandbox.
Node.js is a different runtime environment for the same language — it provides
V8, the file system, network APIs, and the process API, without the browser's
security restrictions or DOM.

The key insight: JavaScript is a language specification. V8 is an
implementation of that specification. Node.js and Chrome both use V8, so
the language is the same. What differs is the APIs each runtime provides.
\`document.querySelector\` exists in the browser but not in Node.
\`fs.readFileSync\` exists in Node but not in the browser.

SE lens — the right tool for each environment:

The platform you are building runs in two environments during development:
the browser (where users interact with it) and Node.js (where the build
tools compile it). Code written for one environment does not run in the
other. A function that uses \`fs.readFile\` will throw an error in the
browser. A function that uses \`document.getElementById\` will throw in Node.

This is a separation of concerns at the environment level: build-time code
(Vite, TypeScript compiler, Vitest) runs in Node. Runtime code (components,
state, routing) runs in the browser. Keeping them separate prevents a class
of errors that would otherwise only appear when deploying.
`,
    },
    {
      heading: 'npm — the package manager',
      body: `
npm is the Node Package Manager. It is installed automatically when you
install Node.js. Verify it:

\`\`\`bash
npm --version
\`\`\`

Expected output: \`9.x.x\` or higher. If Node installed correctly, npm
should be present. If it is missing, reinstall Node from nodejs.org.

What npm does:

npm connects to a public registry at registry.npmjs.org that hosts over two
million JavaScript packages — code other developers have written, tested, and
published for anyone to use. npm downloads packages from this registry and
installs them in your project.

There are two ways to use npm:

\`npm install --save-dev vitest\` installs a package into the current project.
It creates a \`node_modules\` folder in the current directory and places
the package code there. It also records the dependency in \`package.json\`
(covered in lesson 006). The \`--save-dev\` flag marks it as a development
dependency — needed to build and test but not needed when the app runs
in production.

\`npm install --global typescript\` installs a package globally — available
on your machine in any directory, not just in the current project.
Global installs are for tools you run from the terminal by name, not for
libraries your code imports.

Verify npm can reach the registry:

\`\`\`bash
npm help
\`\`\`

This prints a list of npm subcommands without making a network request.
If you see a list of commands, npm is working. If you see an error, the
Node installation may be incomplete.

The cost of dependencies:

Every package you install is a dependency. Your code depends on its code.
Dependencies have costs beyond download time:

Security: a library with a known vulnerability makes your application
vulnerable. npm knows about vulnerabilities — \`npm audit\` checks every
installed package against a database of known security issues and reports
what it finds.

Maintenance: if a library stops being maintained, its bugs become your bugs.
A library that was actively maintained when you chose it may be abandoned
when a critical bug is discovered two years later.

Bundle size: every library you install adds bytes to what users download.
A library that saves 30 minutes of writing but adds 200 kilobytes to the
bundle may cost users 2 seconds of load time on every visit — for the
lifetime of the application.

Professional engineers are conservative with dependencies. The architectural
constraint from lesson 001 — "a developer can add a new lab by reading fewer
than 50 lines" — implies a conservative dependency policy. Every new
dependency is something a new developer must understand to work on the project.

CS lens — the dependency graph:

When package A requires package B, and B requires C, you have a dependency
graph: A → B → C. npm resolves this graph for you — when you install A, it
also installs B and C automatically. The full resolved graph is recorded in
\`package-lock.json\` (covered in lesson 006) so that \`npm install\` on any
machine produces exactly the same set of packages.

The risk of the dependency graph: if a malicious actor compromises package
C, every package that depends on it — directly or transitively — is affected.
This is called a supply chain attack. The more packages you install, the
larger your attack surface.

SE lens — code you did not write is code you trust:

When you write code, you understand its behaviour, its edge cases, and its
security implications. When you install a package, you are trusting that
its author understood those things. For a heavily-used package with many
contributors and a long security history, that trust is well-founded.
For an obscure package with one contributor and no history, it may not be.

Reading the package's source code, checking its maintenance activity, and
reviewing its download count are habits that distinguish a careful engineer
from one who installs packages by keyword search.
`,
    },
    {
      heading: 'git — version control before everything else',
      body: `
git is a version control system. It records a history of every change made
to your project, identifies who made each change and when, and lets you
return to any previous state.

Verify it is installed:

\`\`\`bash
git --version
\`\`\`

Expected output: \`git version 2.x.x\`. On a Mac, if git is not installed,
this command will prompt you to install the Xcode Command Line Tools —
a set of development tools including git. Follow the prompt and install.
On Windows, download git from git-scm.com. On Linux, install it with your
package manager: \`apt install git\` on Ubuntu/Debian, \`yum install git\`
on Red Hat/CentOS.

Why version control is not optional:

Without version control, you have three options when your code breaks:

1. Undo (Ctrl+Z) until the editor has reversed enough history — but editors
   clear their undo history when closed, and undo does not scale to multiple
   files.

2. Remember what you had before and retype it — expensive, error-prone,
   and impossible after a long session.

3. Lose the working state and start the broken work again — the most expensive
   option, often the only one available.

With version control, you have a fourth option that costs one command:

\`\`\`bash
git checkout .
\`\`\`

This restores every file to its last committed state. Every file. In under
a second. No matter how many files were changed.

Version control is also how two developers can work on the same codebase
simultaneously without overwriting each other's work, and how you can try
an experimental change without risking the working version.

git will be used for the first time in lesson 003. This lesson introduces it
here because you need to know it is installed before lesson 003 uses it.

CS lens — git as an append-only linked list:

A git commit is a data structure containing:
- A tree object: the state of every tracked file, stored compressed
- A pointer to the parent commit (the one before this one)
- Metadata: author name, email, timestamp, and message

Commits form a linked list that grows only forward. Each commit points to
the one before it. You can follow the pointers back to the very first commit.
You cannot modify a commit that already exists — you can only add new ones.

This is what makes git history trustworthy: the content of a commit cannot
be changed. If you need to "undo" a committed change, you add a new commit
that reverses it. The original is still in the history.

SE lens — version control as a decision record:

Most tutorials describe version control as a save mechanism — "git saves
your work." This is technically accurate but misses the more important
function: git records decisions.

A commit message is communication to a future reader. That reader is usually
you, six months later, trying to understand why something is the way it is.
The diff (the record of what changed) is automatic — git records it. The
message is the only place to record why.

"Fix bug" is not a message. "Restore navigation state after browser back
button — the router was resetting state on pop events" is a message. The
second one tells a future reader what was wrong, what was expected, and
what was changed. The first tells them nothing they could not see from the
diff.

This will be practised in lesson 003.
`,
    },
    {
      heading: 'VS Code — the editor',
      body: `
VS Code is a code editor — a program for writing and navigating code. It is
not required; any program that can save plain text files will work.
VS Code is the recommended editor for this series for three reasons:

1. It integrates with TypeScript directly — errors appear in the editor as
   you type, before you run the code. The time between writing a bug and
   finding a bug is reduced to seconds.

2. It has a built-in terminal — you can run commands without switching
   applications.

3. Its extensions for JavaScript, TypeScript, and React are the most
   actively maintained.

Download it from code.visualstudio.com. Open it after installing.

Verify it is available from the terminal:

\`\`\`bash
code --version
\`\`\`

If this returns \`command not found\`, VS Code is installed but the \`code\`
command is not in your PATH. Fix it: in VS Code, press Cmd+Shift+P (Mac)
or Ctrl+Shift+P (Windows/Linux) to open the command palette. Type "Shell
Command" and select "Shell Command: Install 'code' command in PATH". After
that, restart your terminal and run \`code --version\` again.

After the command is installed, \`code .\` opens VS Code in the current
directory — the dot means "the current directory."

The VS Code panels you will use throughout this series:

File Explorer (Ctrl+Shift+E or Cmd+Shift+E on Mac): the left panel showing
your project's files and directories. Everything you create in the terminal
appears here.

Editor area: where you write code. Multiple files open as tabs.

Integrated Terminal (Ctrl+\` or Cmd+\` on Mac): a full shell terminal inside
VS Code. It opens in your project's directory automatically, so you do not
need to \`cd\` to the project each time.

Problems panel (Ctrl+Shift+M or Cmd+Shift+M on Mac): where TypeScript and
ESLint errors are listed. Every error includes the file, line number, and
a description. You will spend significant time in this panel.

Source Control (Ctrl+Shift+G or Cmd+Shift+G on Mac): shows which files have
changed since the last commit and lets you write commit messages. This panel
runs the same git commands as the terminal — it is a GUI layer on top of git,
not a replacement for it.

Extensions to install now:

In VS Code, press Ctrl+Shift+X (Cmd+Shift+X on Mac) to open the extensions
panel. Search for and install:

ESLint: a static analysis tool that reads your JavaScript without running it
and reports problems — unused variables, likely bugs, style violations.
It runs automatically as you type. Errors appear as red underlines in the
editor and in the Problems panel. You will configure it in lesson 007.

Prettier: a code formatter that rewrites your code's whitespace and style to
a consistent format every time you save. Install it, then set it as the
default formatter: open VS Code settings (Ctrl+, or Cmd+,), search for
"default formatter", and select Prettier. Enable "Format on Save".
Consistent formatting eliminates noise from diffs — when you compare two
versions of a file, you see what changed, not what was reformatted.

Do not install other extensions yet. Each extension runs in the editor
background and can slow it. Install only what you need, when you need it.

CS lens — the editor as a development environment:

VS Code is an example of an IDE — Integrated Development Environment. The
"integrated" part means: the editor, the terminal, the error reporter, and
the version control interface are combined into one application with shared
context. The editor knows which file you are looking at; the error panel
knows which line in that file the error is on; clicking the error jumps to
the line.

The integration is not just convenience — it shortens the feedback loop.
The time between writing a line and knowing it is wrong goes from minutes
(run, read output, find file, find line) to seconds (see red underline,
read tooltip). Shorter feedback loops produce better code faster.

SE lens — why consistent formatting matters:

Prettier's most important feature is not that code looks nice — it is that
formatting is no longer a decision. When formatting is automatic and
enforced, code review focuses on logic and correctness, not tabs versus
spaces. Diffs show only logical changes, not reformatting. Two developers
working on the same file do not produce formatting conflicts.

This is a small application of a large principle: decisions that can be
automated should be automated. Developer attention is finite. Spending it
on formatting is waste. Automating formatting is free.
`,
    },
    {
      heading: 'The four environments — where your code lives',
      body: `
Throughout this series, your code will exist in four distinct environments.
Confusing them is a common source of errors that is hard to diagnose.
This section maps each environment completely.

Environment 1: Your machine (development)

Your machine is where you write code. The tools installed here — Node.js,
npm, git, VS Code, Vite, the TypeScript compiler, Vitest — exist only here.
None of them are present in production. They are tools for building, not
tools for running.

When you run \`node requirements.js\`, it runs in this environment.
When you run \`npm run dev\`, Vite starts in this environment.
When you run \`npm test\`, Vitest runs in this environment.

Environment 2: The build output

The build output is a folder of compiled, optimised files — HTML, JavaScript,
and CSS — produced by running \`npm run build\`. Your source code (TypeScript,
JSX, modules) is transformed into this. The build output is what gets deployed.

Users never see your source code. They receive the build output. This means
you can use TypeScript (which browsers cannot run) and JSX (which browsers
cannot parse) in your source — the build process compiles them to JavaScript
the browser understands.

Environment 3: The browser (runtime)

The browser is where users interact with your application. It runs the compiled
JavaScript from the build output. There is no Node.js in the browser, no
TypeScript compiler, no Vite. Only the compiled JavaScript, the browser's DOM,
and the browser's JavaScript engine.

\`document.getElementById\`, \`window.location\`, and \`navigator.serviceWorker\`
are browser APIs. They exist only in this environment.
\`fs.readFileSync\` and \`process.env\` are Node.js APIs. They do not exist here.

Environment 4: Localhost (the dev server)

Localhost is the address of your own machine on the network. When Vite runs,
it starts a web server that listens at \`localhost:5173\`. Your browser requests
files from this server. Vite compiles them on demand and responds.

This is the environment you use during development — not the production build,
not raw Node.js. Localhost feels like the browser because you are accessing it
with a browser, but the server behind it is Vite running in Node.js.

\`\`\`bash
# This starts Vite's dev server — covered in lesson 007
npm run dev
# → Vite starts listening at http://localhost:5173
# → Open that URL in your browser
# → Vite compiles your TypeScript on demand and serves it
\`\`\`

What "localhost" and the port number mean:

\`localhost\` is shorthand for \`127.0.0.1\`, the loopback address. The loopback
address is a network address that routes traffic back to the same machine.
When your browser navigates to \`localhost:5173\`, it sends an HTTP request to
your own machine. No traffic leaves your computer. No internet connection
is required.

\`5173\` is a port number. A port is a number (between 1 and 65535) that routes
a network connection to a specific program on a machine. Vite listens on port
5173. If you run two Vite servers simultaneously, the second one cannot claim
5173 (already in use) and picks a different port — 5174, then 5175, and so on.
Only one program can hold a port at a time.

Verify all five tools in one command sequence:

\`\`\`bash
node --version && npm --version && git --version && code --version
\`\`\`

\`&&\` means "run the next command only if the previous one succeeded." If any
command fails (prints an error instead of a version), the sequence stops.
This is a useful pattern for checking prerequisites: if any tool is missing,
the sequence stops at the missing one and you see which one.

Expected output (versions will differ):

\`\`\`
v20.11.0
10.2.4
git version 2.42.0
1.85.1
\`\`\`

Four lines, four version numbers, no errors. This is the visible output
of this lesson: your environment is ready.

CS lens — the separation between compile time and runtime:

The four environments map onto two phases: compile time (your machine, build
output) and runtime (browser, localhost-as-browser). This distinction is
fundamental in software engineering.

Compile time is when your source code is transformed into executable output.
TypeScript errors are compile-time errors — they exist because the compiler
reads the source and reports problems before running anything.

Runtime is when the compiled output executes and users interact with it.
Runtime errors are exceptions, undefined-is-not-a-function, and network
failures — things that only happen when the program is actually running.

The goal of static analysis (TypeScript, ESLint) is to move errors from
runtime to compile time. A compile-time error costs a developer a second to
fix. A runtime error costs a user a bad experience and a developer hours of
debugging in a production environment.

SE lens — keeping environments separate prevents a class of errors:

The most common environment confusion error: importing a Node.js module
in code that runs in the browser.

\`\`\`javascript
// ERROR: This runs in the browser, where 'fs' does not exist
import fs from 'fs'
const content = fs.readFileSync('data.json', 'utf-8')
\`\`\`

This fails at runtime with \`Cannot find module 'fs'\`. The browser does
not have a file system. The error is confusing without the mental model
of the four environments — you know the code works (it runs fine in Node)
but you cannot understand why it fails.

With the mental model: "this code is in the browser runtime environment;
\`fs\` is a Node.js API that does not exist in the browser runtime; use a
browser API (fetch, IndexedDB) instead."

The environments are not arbitrary — they reflect the different security
models and capabilities of each context. Node.js can read your disk because
you are running it deliberately on your machine. The browser cannot read
your disk because it is running untrusted code from the internet.
`,
    },
  ],

  // ── Section 4: Connect the pieces ───────────────────────────────────────

  connect: `
You now have five tools installed and understand what each one is for.

The connection to the requirements from lesson 001:

"A developer can add a new lab by reading fewer than 50 lines of existing
code" — this requirement implies the tools must be understandable. Every tool
in the chain (Node, npm, Vite, TypeScript) has a learning cost. The fewer
unfamiliar tools, the lower that cost. Every dependency added to the project
is a tool someone must understand.

"Any lab loads within 2 seconds on a 4G connection" — this requirement is
measured in environment 4 (localhost-as-production) or with production build
in the browser. The dev server at localhost is not representative of
production speed — it does not minify, does not compress, and does not cache.
When you measure load time, measure the production build.

In lesson 003, you will use git for the first time — creating a repository
and making the first commit. The tools you just verified (git) are what make
that lesson possible.

In lesson 007, you will use npm and Node together for the first time —
creating a \`package.json\` and running Vite's dev server. The tools you
verified today (Node, npm) are prerequisites for that.

Every tool installed today has a lesson where it is first used. The version
checks you ran are the guarantee that when that lesson arrives, the tool
will be there.
`,

  // ── Section 5: What breaks without this ─────────────────────────────────

  breaks: `
If you skip environment setup and discover a missing tool mid-lesson:

The most common failure: you reach lesson 007 and run \`npm run dev\`. The
terminal prints:

\`\`\`
npm: command not found
\`\`\`

or

\`\`\`
node: command not found
\`\`\`

At this point you have a lesson in progress, partially-written files, and a
blocked task. Installing Node now means closing VS Code, running the installer,
restarting the terminal, and returning to where you were — with no guarantee
that the installed version is compatible with the package versions in the
lesson.

The second failure: git is missing when lesson 003 requires it.

\`\`\`bash
git init
# bash: git: command not found
\`\`\`

Without git, lesson 003 cannot be completed. Its definition of done includes
a commit. A lesson with an uncompleted definition of done is a lesson
incompletely learned — the commit is not optional housekeeping, it is the
proof that the skill was practised.

The third failure: VS Code's \`code\` command is missing.

\`\`\`bash
code .
# bash: code: command not found
\`\`\`

This is not tool-blocking but is friction-generating: you must open files
through the GUI instead of the terminal. More important, the \`code --version\`
check did not pass, which means the environment is not in the known-good
state this lesson's definition of done requires.

All three failures share the same root: discovering a prerequisite is missing
at the moment it is needed, rather than before. Lesson 002 exists to prevent
this. Four version commands, all passing, is the guarantee that lessons 003
through 028 will not be blocked by missing tools.
`,

  // ── Section 6: Definition of done ───────────────────────────────────────

  done: [
    '[ ] node --version prints v18.x.x or higher',
    '[ ] npm --version prints 9.x.x or higher',
    '[ ] git --version prints a version number',
    '[ ] code --version prints a version number (VS Code must be installed and the code command in PATH)',
    '[ ] You can explain what "localhost" means without looking it up',
    '[ ] You can name all four environments and what runs in each one',
    '[ ] You can explain why fs.readFileSync cannot be used in browser-runtime code',
    '[ ] You have installed the ESLint and Prettier VS Code extensions',
    '[ ] You have set Prettier as the default formatter and enabled Format on Save',
    '[ ] Git commit (complete after lesson 003): git commit -m "Verify development environment: Node, npm, git, VS Code all installed\n\nAll four tools verified at specific versions. Four-environment mental model\nestablished. ESLint and Prettier configured in VS Code."',
  ],
}

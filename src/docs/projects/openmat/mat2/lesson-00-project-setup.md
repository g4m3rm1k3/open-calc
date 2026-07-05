# Lesson 00 — Setting Up a TypeScript Project
## What every project needs before a single line of real code

---

## What You Will Understand

- Why projects need structure before code
- What Node.js, npm, and pnpm are and when to choose each
- What TypeScript adds to JavaScript and how it compiles
- What version control is and why it is not optional
- How to set up a TypeScript project from scratch

---

## What You Need To Know First

- You have used a terminal before (cd, mkdir, ls or dir)
- You have written some JavaScript or Python
- Nothing else is assumed

---

# Part 1: Why Structure Before Code

Every project you will ever build needs the same things before
a single line of real code:

```
A place to put the code
A way to manage other people's code you depend on
A way to compile or run your code
A record of every change you make
```

Skipping any of these does not save time. It costs it — usually
at the worst possible moment, when something breaks and you cannot
get back to when it worked.

This lesson sets all four up. They take about 30 minutes.
Every project you build after this one will take 10 minutes
because you will know exactly what you are doing and why.

---

# Part 2: Node.js

## What it is

JavaScript was invented to run inside web browsers. Node.js
is a runtime that lets JavaScript run anywhere else — on your
machine, on a server, in a terminal.

When you install Node.js you get two things:

```
node   — runs JavaScript files
npm    — downloads and manages packages
```

## Install and verify

Download from nodejs.org — install the LTS version.

```powershell
node --version
npm --version
```

Both should print version numbers. If either fails, the install
did not complete — try again.

## Your first file outside a browser

Create `hello.js` anywhere:

```javascript
console.log("Node.js is working.");
console.log(1 + 1);
console.log("Two and two is " + (2 + 2));
```

Run it:

```powershell
node hello.js
```

Output:
```
Node.js is working.
2
Two and two is 4
```

`console.log()` prints to the terminal. It is how you see what
your code is doing while you build it. You will use it constantly.

---

# Part 3: npm and packages

## What a package is

A package is code someone else wrote, packaged so you can use it.
Instead of writing a test runner from scratch, you install one.
Instead of writing a TypeScript compiler, you install one.

npm (Node Package Manager) downloads packages from a public registry
and records what you have installed.

## What package.json is

Every project has a `package.json` file. It records:

```
What this project is called
What packages it depends on
What commands it supports
```

Create one:

```powershell
mkdir demo-project
cd demo-project
npm init -y
```

`-y` accepts all defaults. Open `package.json`:

```json
{
  "name": "demo-project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

Every field is explained:

`"name"` — the name of your project. If you publish to npm,
this is what people type to install it.

`"version"` — follows semantic versioning: MAJOR.MINOR.PATCH.
`1.0.0` means: first stable release, no new features since last
release, no bugs fixed since last release.

`"scripts"` — commands you can run with `npm run <name>`.
The test script currently just prints an error message.
You will replace it with a real test runner.

`"main"` — which file Node.js loads when someone does
`require('demo-project')`. Only matters if your project
is itself a package others import.

## Installing a package

```powershell
npm install typescript
```

This downloads TypeScript into a folder called `node_modules`
and adds it to `package.json` under `"dependencies"`.

Look at `package.json` now:

```json
"dependencies": {
  "typescript": "^5.4.5"
}
```

The `^` means "compatible with version 5.4.5" — any 5.x.x version
is acceptable, but not 6.x.x (which might have breaking changes).

## devDependencies vs dependencies

Tools you use to build and test your project are `devDependencies`.
They are not needed when someone else installs your package.

```powershell
npm install --save-dev typescript
```

`--save-dev` (or `-D`) puts it in `"devDependencies"` instead.
TypeScript is a dev dependency — it compiles your code but is
not shipped to users.

## What node_modules is

`node_modules` contains every package you have installed.
It can contain thousands of files. You never edit it directly.
You never commit it to git.

Anyone who gets your code can recreate it by running `npm install`,
which reads `package.json` and downloads everything listed.

---

# Part 4: pnpm — A Better npm

## Why pnpm exists

npm copies packages into every project that uses them.
If you have 10 projects using TypeScript, npm stores 10 copies
of TypeScript on your hard drive.

pnpm stores one copy of each package and links to it from each
project. Faster to install. Less disk space. Identical results.

For projects with multiple sub-packages that share dependencies
(called a monorepo), pnpm is significantly better.

## Install pnpm

```powershell
npm install -g pnpm
```

`-g` installs it globally — available from any folder, not just
one project.

```powershell
pnpm --version
```

## pnpm vs npm commands

The commands are almost identical:

```
npm install          →  pnpm install
npm install pkg      →  pnpm add pkg
npm install -D pkg   →  pnpm add -D pkg
npm run build        →  pnpm build
npm run test         →  pnpm test
```

Use pnpm from here on. npm still works for everything, but pnpm
is faster and handles the MikeLab project structure better.

---

# Part 5: TypeScript

## What TypeScript adds

JavaScript has no types. A variable can hold a number, then a
string, then an object — JavaScript does not care.

```javascript
function add(a, b) {
    return a + b;
}

add(1, 2);       // 3   — correct
add("1", "2");   // "12" — string concatenation, probably wrong
add(1, "2");     // "12" — definitely wrong, no error
```

JavaScript runs the wrong code and silently produces the wrong
result. The bug appears only when you check the output.

TypeScript adds type annotations. It checks them at compile time —
before the code runs.

```typescript
function add(a: number, b: number): number {
    return a + b;
}

add(1, 2);       // 3   — correct
add("1", "2");   // COMPILE ERROR — caught before running
add(1, "2");     // COMPILE ERROR — caught before running
```

The `: number` after each parameter name tells TypeScript what type
is expected. The `: number` after `)` tells TypeScript what type
the function returns.

TypeScript does not run. It compiles to JavaScript. The types exist
only during development — they disappear in the output.

## Install TypeScript

```powershell
npm install -g typescript
tsc --version
```

`tsc` is the TypeScript compiler.

## Your first TypeScript file

Create `first.ts`:

```typescript
// A type annotation: this variable must hold a number
const radius: number = 5;

// TypeScript can also infer the type from the value
// (you do not always need to write the annotation)
const pi = 3.14159;    // TypeScript infers: number

// A function with typed parameters and a return type
function circleArea(r: number): number {
    return pi * r * r;
}

// An interface — describes the shape of an object
interface Point {
    x: number;
    y: number;
}

// TypeScript checks that this object matches the Point interface
const origin: Point = { x: 0, y: 0 };

console.log("Area:", circleArea(radius));
console.log("Origin:", origin);
```

Compile it:

```powershell
tsc first.ts
```

This creates `first.js`. Open it — the types are gone. It is
plain JavaScript. Run it:

```powershell
node first.js
```

Now introduce a type error. Change `circleArea(radius)` to
`circleArea("five")` and run `tsc first.ts` again.

```
error TS2345: Argument of type 'string' is not assignable to
parameter of type 'number'.
```

TypeScript caught it before the code ran. Change it back.

## tsconfig.json — TypeScript project configuration

Running `tsc` on individual files works for learning.
For a real project, you configure TypeScript once with a
`tsconfig.json` file and run `tsc` with no arguments.

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "outDir": "dist"
  },
  "include": ["src/**/*"]
}
```

Every field:

`"target": "ES2020"` — what version of JavaScript to output.
ES2020 works in all modern environments. Older targets need more
compatibility code written automatically by the compiler.

`"module": "ESNext"` — use modern ES module syntax in the output
(`import`/`export` not `require()`).

`"strict": true` — enables a group of checks that together catch
the most common bugs. The most important two it enables:

- `noImplicitAny`: every variable must have a known type.
  Without this, TypeScript silently uses `any` (the escape hatch
  that turns off all type checking).

- `strictNullChecks`: null and undefined are not valid values
  for a variable unless you explicitly say so. This prevents
  the single most common runtime error in JavaScript:
  "Cannot read properties of null."

Always use `strict: true`. The bugs it catches are real bugs.

`"outDir": "dist"` — compiled JavaScript goes into `dist/`.
Keeps source and output separate.

`"include": ["src/**/*"]` — only compile files inside `src/`.
`**/*` means any file in any subfolder.

---

# Part 6: Git — Version Control

## What it does

Git records the history of every change you make to your project.
Every time you finish something working, you take a snapshot called
a commit. You can return to any commit. You can see exactly what
changed between commits.

Without git: when you break something, you cannot get back to when
it worked.

With git: broken? Run `git log`, find the last working commit,
restore it in seconds.

## Install git

Download from git-scm.com/downloads.

```powershell
git --version
```

## The three commands you use constantly

```powershell
git init              # start tracking a folder
git add .             # stage all changes (prepare to snapshot)
git commit -m "..."   # take the snapshot with a message
```

## What a .gitignore file is

Some files should never be committed:

- `node_modules/` — thousands of files, reproducible with `npm install`
- `dist/` — compiled output, reproducible by running the compiler
- `.env` — environment variables that may contain passwords

Create a `.gitignore` file and list what to ignore:

```
node_modules
dist
*.js
```

Git will never track files matching these patterns.

## What a commit message is

A commit message is not a description of what files changed.
Git records that automatically.

A commit message explains WHY this change was made.

```
BAD:  "update files"
BAD:  "fix bug"
GOOD: "fix off-by-one error in matrix row index calculation"
GOOD: "add transpose() method to Matrix class"
```

Six months from now, "update files" tells you nothing.
The good messages tell you exactly what happened and why.

---

# Part 7: A Complete Project Setup

Putting it all together. This is the sequence for any new project.

```powershell
# 1. Create the folder
mkdir my-project
cd my-project

# 2. Initialise git
git init

# 3. Create .gitignore
```

Create `.gitignore`:

```
node_modules
dist
*.tsbuildinfo
```

```powershell
# 4. Initialise the project
pnpm init
```

Edit `package.json` — fill in name and description, remove
fields you do not need yet.

```powershell
# 5. Install TypeScript
pnpm add -D typescript

# 6. Create tsconfig.json
```

Create `tsconfig.json` as shown above.

```powershell
# 7. Create src folder
mkdir src

# 8. Write your first file
```

Create `src/index.ts`:

```typescript
export function greet(name: string): string {
    return `Hello, ${name}.`;
}

console.log(greet("world"));
```

```powershell
# 9. Compile and run
tsc
node dist/index.js

# 10. Commit
git add .
git commit -m "initialise project with TypeScript and tsconfig"
```

That is a complete, working TypeScript project.
Every future project starts with exactly this sequence.

---

# Options You Will Encounter

Not every project uses the same tools. Here are the common
choices and when each makes sense:

**npm vs pnpm vs yarn:**
All are package managers. npm comes with Node.js. pnpm is faster
and better for monorepos. yarn is a third option with similar
goals to pnpm. Use pnpm for new projects.

**tsc vs esbuild vs swc:**
tsc is the official TypeScript compiler — does type checking AND
compiles. esbuild and swc compile TypeScript much faster but skip
type checking. Use tsc for learning and small projects. Use esbuild
or swc (through a wrapper like tsup or Vite) for large projects
where compile speed matters.

**Single package vs monorepo:**
A single package is simpler. A monorepo (multiple packages in one
repository) makes sense when you have parts that should be
independently installable. The lesson index covers setting up
a monorepo in Lesson 01.

**Vitest vs Jest:**
Both are test runners with similar APIs. Vitest is faster and
works better with modern ES modules. Use Vitest for new projects.

---

# Micro-Project

You now understand enough to set up MikeLab.

MikeLab will be a monorepo. Before learning about monorepos
(Lesson 01), set up the root:

- Create the `mikelab` folder
- Initialise git
- Create a `.gitignore` that excludes node_modules, dist, and
  any compiled output
- Run `pnpm init` and edit `package.json` so the name is
  `mikelab`, version is `0.0.1`, and `"private": true`
  (private means: never publish this root package to npm —
  only the sub-packages inside it get published)
- Take a commit with a message that explains what this commit
  establishes

When you are done, `git log` should show one commit.
`ls` (or `dir`) should show `.gitignore` and `package.json`.
`node_modules` should not exist yet — you have not installed
anything.

---

# Challenges

**Challenge 1:**

Create a file `src/math.ts` with three functions:
- `add(a: number, b: number): number`
- `subtract(a: number, b: number): number`
- `multiply(a: number, b: number): number`

Create `src/index.ts` that imports all three and logs the
results of calling each one.

Compile with `tsc` and run with `node dist/index.js`.
If TypeScript reports errors, read the message — it tells you
exactly which line has a problem.

**Challenge 2:**

Add a fourth function `divide(a: number, b: number): number`.
It should throw an error if `b` is zero:

```typescript
throw new Error("Cannot divide by zero");
```

Call it with `divide(10, 0)` and run it. What do you see?
Now wrap the call in a try/catch and print the error message
instead of crashing.

**Challenge 3:**

TypeScript's `strict` mode enables `strictNullChecks`. Add this
function to `src/math.ts`:

```typescript
function findFirst(numbers: number[], target: number): number {
    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] === target) {
            return i;
        }
    }
    // target was not found — what should we return?
}
```

TypeScript will give you an error. Read it. Fix the function
signature so the return type reflects that it might not find
anything. There are two valid approaches — find both.

---

# Definition of Done

```
□ node --version prints a version number
□ pnpm --version prints a version number
□ tsc --version prints a version number
□ git --version prints a version number
□ You ran hello.js with node and saw output
□ You compiled and ran first.ts successfully
□ You introduced a type error and saw TypeScript catch it
□ All three challenges work and compile without errors
□ The mikelab folder has .gitignore, package.json, and one commit
□ You can explain why node_modules is in .gitignore
□ You can explain the difference between dependencies and devDependencies
□ You can explain what strict: true does and why it matters
```

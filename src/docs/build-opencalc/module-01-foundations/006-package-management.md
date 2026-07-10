# 006 — Package Management

*Dependencies, semantic versioning, lock files, and the package.json contract*

---

## What You Will Build

You will initialise a `package.json` file, install your first real dependency (`date-fns`, a date formatting library), use it in a script, and commit both `package.json` and `package-lock.json` to git. By the end, running `npm install` in a fresh clone of your project will produce exactly the package versions you used.

This is the foundation of reproducible builds: the guarantee that any machine, any developer, any CI server can recreate the exact environment you are working in.

---

## What You Need to Know First

Lesson 002 — Your Environment. npm must be installed and verified.

Lesson 003 — Version Control First. You need git initialised and `.gitignore` must already exclude `node_modules/`.

Lesson 005 — JavaScript Modules. The package you install will be imported as a module.

---

## The Lesson

### What package management solves

Before package managers, sharing code between projects meant copying files. You would download a library's JavaScript file, put it in your project folder, and check it into version control. When the library released a security fix, you had to manually find every project that used it, download the new file, and update it.

This scaled to perhaps five libraries. Modern web projects use hundreds.

npm solves this by introducing a **registry** (npmjs.com) that holds every published package, and a **manifest** (`package.json`) that records which packages a project uses and at what versions. Running `npm install` reads the manifest, downloads the correct versions from the registry, and places them in `node_modules/`. Any developer on any machine can reproduce the exact dependencies from the manifest.

The manifest is what you commit to git. The downloaded packages (`node_modules/`) are what you exclude with `.gitignore`.

---

**CS lens — package management as a declarative system:**

`package.json` is a **declarative** specification: it describes what you want (these packages at these version ranges), not how to get it. npm figures out the how.

This is the same declarative-versus-imperative distinction that motivates React (lesson 009): declare the desired state, let the system figure out the steps to achieve it. In both cases, the benefit is that the "how" can be optimised, cached, and parallelised without you managing any of it.

---

**SE lens — dependencies are risks you accept explicitly:**

Installing a package is a decision with long-term consequences. You are accepting:
- The package author's judgment about security
- The maintenance burden if the package is abandoned
- The API surface the package exposes (which may change)
- The transitive dependencies the package brings in

The architectural requirement from lesson 001 — "a developer can add a new lab by reading fewer than 50 lines" — is partly a dependency-budget constraint. More dependencies means more that a new developer must understand. Each installation should be a deliberate choice, not a convenience reflex.

---

### Initialise package.json

Navigate to your project folder:

```bash
cd my-platform
```

Create `package.json`:

```bash
npm init -y
```

`npm init` initialises a new `package.json` file by asking you questions about the project name, version, and description. The `-y` flag (short for `--yes`) skips all questions and uses defaults.

Expected output:

```
Wrote to /Users/yourname/my-platform/package.json:

{
  "name": "my-platform",
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

Open `package.json` and read every field:

```json
{
  "name": "my-platform",
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

**`name`** — the package name. If you were publishing this package to npmjs.com, this is the name others would use to install it. For a private project that is never published, this is still required — it identifies the project in error messages and some tooling.

**`version`** — the current version of this package. `1.0.0` follows **semantic versioning** (semver), explained below.

**`description`** — a human-readable summary. Leave it as an empty string for now; update it when you know what to write.

**`main`** — the file that is used when someone imports this package. For a private project, this field is rarely used. Leave it as `index.js`.

**`scripts`** — a collection of named commands you can run with `npm run <name>`. The default includes a `test` command that prints an error (because no tests exist yet). You will add `dev` and `build` scripts in lesson 007.

**`keywords`**, **`author`**, **`license`** — metadata used if you publish to npmjs.com. For a private project, they are not required to be filled in.

---

**CS lens — JSON as a configuration format:**

`package.json` is a **JSON** file — JavaScript Object Notation. JSON is a text format for representing structured data: objects (`{}`), arrays (`[]`), strings (`""`), numbers, booleans, and null.

JSON has strict rules that distinguish it from JavaScript object literals:
- All keys must be double-quoted strings: `"name": "my-platform"`, not `name: 'my-platform'`
- No trailing commas: the last item in an object or array cannot have a comma after it
- No comments: JSON has no comment syntax

Tools that read `package.json` — npm, Vite, TypeScript — parse it as JSON and fail with a parse error if any of these rules are violated. Syntax errors in `package.json` are common and the error messages are not always clear. The VS Code JSON editor highlights syntax errors in real time.

---

### Semantic versioning

Every package on npm uses **semantic versioning** (semver): a version number with three parts separated by dots: `MAJOR.MINOR.PATCH`.

```
1.2.3
│ │ └── PATCH: backwards-compatible bug fixes
│ └──── MINOR: new backwards-compatible features
└────── MAJOR: breaking changes
```

The contract: a package that follows semver will not break your code when you upgrade to a higher MINOR or PATCH version. Upgrading to a higher MAJOR version may break your code — the API has changed.

In `package.json`, version ranges are specified with prefixes:

```json
"dependencies": {
  "date-fns": "^3.0.0"
}
```

`^3.0.0` — the caret prefix means "compatible with 3.0.0": accept any version `>=3.0.0` and `<4.0.0`. Minor and patch updates are accepted automatically; major updates are not.

`~3.0.0` — the tilde prefix means "approximately 3.0.0": accept `>=3.0.0` and `<3.1.0`. Only patch updates are accepted.

`3.0.0` — an exact version. npm will install exactly this version, no matter what.

---

**SE lens — version ranges as a risk trade-off:**

The caret (`^`) is the npm default and the most common choice. It allows automatic security patches and minor feature additions without manual updates. The risk: a minor version bump that claims to be backwards-compatible may not be — library authors make mistakes. The `package-lock.json` (covered next) mitigates this by recording the exact version used.

A team that has had packages silently break them under a `^` range may switch to exact versions or `~` to control updates more tightly. The right choice depends on how much you trust the packages you use and how much update maintenance you are willing to do.

---

### Install a package

Install `date-fns`, a library for formatting dates:

```bash
npm install date-fns
```

`npm install` is the subcommand for downloading and installing packages. `date-fns` is the package name. npm fetches it from the registry at the latest version compatible with your Node.js version, saves it to `node_modules/`, and records it in `package.json`.

Expected output:

```
added 1 package, and audited 1 package in 1s

1 package has 1 funding source
  run `npm fund` for details

found 0 vulnerabilities
```

"added 1 package" — npm installed `date-fns`.  
"audited 1 package in 1s" — npm checked it against its vulnerability database.  
"found 0 vulnerabilities" — no known security issues.

Open `package.json`:

```json
{
  "name": "my-platform",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "date-fns": "^3.6.0"
  }
}
```

npm added a `dependencies` key with `date-fns` at a version range. **`dependencies`** contains packages needed at runtime — in production, when the application is actually running in a browser.

---

**`dependencies` versus `devDependencies`:**

```bash
npm install --save-dev vitest
```

Packages installed with `--save-dev` (or `-D`) appear in `devDependencies`:

```json
"devDependencies": {
  "vitest": "^1.0.0"
}
```

**`devDependencies`** contains packages needed only during development — test runners, compilers, linters, build tools. They are not needed when the application is deployed and running in a browser. When you or a server runs `npm install --production`, `devDependencies` are skipped.

The distinction matters for deployment: production builds should be as lean as possible, containing only what the application needs to run. Including test runners in production is waste and increases the surface area for vulnerabilities.

---

### package-lock.json — the exact-version record

After installing, a file called `package-lock.json` appeared in your project. Open it:

```json
{
  "name": "my-platform",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "my-platform",
      "version": "1.0.0",
      "dependencies": {
        "date-fns": "^3.6.0"
      }
    },
    "node_modules/date-fns": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/date-fns/-/date-fns-3.6.0.tgz",
      "integrity": "sha512-...",
      "license": "MIT"
    }
  }
}
```

`package.json` says "date-fns at ^3.6.0" — compatible with any 3.x version. Today, that resolves to `3.6.0`. In three months, a new release might make it resolve to `3.7.0`.

`package-lock.json` records the exact version (`3.6.0`), the exact download URL, and an **integrity hash** — a checksum of the downloaded file. When npm installs with a lock file present, it uses the locked versions and verifies the integrity hash. This guarantees that every machine, every CI server, and every future install produces exactly the same packages.

**`package-lock.json` must be committed to git.** It is the reproducibility guarantee. If it is missing, `npm install` resolves version ranges fresh, which may produce different versions on different machines or at different times.

**`package-lock.json` is never hand-edited.** npm manages it. If you modify it manually, the integrity hashes become wrong and `npm install` fails.

---

**CS lens — the lock file as a deterministic function:**

Without a lock file, `npm install` is a non-deterministic function: the same `package.json` can produce different `node_modules` at different times. With a lock file, `npm install` is deterministic: the same lock file always produces the same `node_modules`.

Determinism is a desirable property in software engineering. Non-deterministic inputs produce non-deterministic behaviour, and non-deterministic behaviour is hard to debug ("it works on my machine"). Lock files eliminate a category of non-determinism.

---

**SE lens — reproducible builds as a professional baseline:**

In a professional team, "it works on my machine" is not a valid response to a build failure. The entire point of `package.json` and `package-lock.json` is that the build works identically on every machine. If a CI server fails to build your code, it is not a CI problem — it is a dependency problem. The lock file is how you prove the environments are identical.

---

### Use the installed package

Create a script that uses `date-fns`:

```javascript
// show-date.js
// Run with: node show-date.js
//
// Demonstrates importing an installed npm package.
// date-fns is imported from node_modules/date-fns.

import { format } from 'date-fns'

const today         = new Date()
const formattedDate = format(today, 'MMMM do, yyyy')

console.log(`Requirements written on: ${formattedDate}`)
```

**Walkthrough:**

`import { format } from 'date-fns'` — this is a module import, same syntax as lesson 005. The difference is the module specifier: instead of a relative path (`'./requirements-data.js'`), this is a bare specifier (`'date-fns'`). Bare specifiers refer to packages installed in `node_modules/`. Node.js and build tools know to look in `node_modules/` when they see a bare specifier.

`format` — this is a named export from `date-fns`. It is a function that takes a date and a format string and returns a formatted date string.

`new Date()` — creates a **Date object** representing the current date and time at the moment the line executes. `new` is a JavaScript keyword that creates an instance of a class or constructor function. `Date` is the built-in date class.

`format(today, 'MMMM do, yyyy')` — calls the `format` function with two arguments. The first is the Date object. The second is a **format pattern** — a string where specific letter codes are replaced with date parts:
- `MMMM` — full month name ("July")
- `do` — day of month with ordinal suffix ("10th")
- `yyyy` — four-digit year ("2026")

`format` returns a string with those codes replaced: `"July 10th, 2026"`.

Run it:

```bash
node --input-type=module show-date.js
```

Wait — this will fail because `show-date.js` uses `import` (ESM syntax) but Node.js needs to know this file is a module. Two ways to tell it:

**Option 1** — add `"type": "module"` to `package.json`:

```json
{
  "name": "my-platform",
  "version": "1.0.0",
  "type": "module",
  ...
}
```

This tells Node.js to treat all `.js` files in this project as ES modules. Then:

```bash
node show-date.js
```

Expected output: `Requirements written on: July 10th, 2026` (with today's date).

**Option 2** — rename the file to `show-date.mjs`. The `.mjs` extension explicitly marks a file as an ES module regardless of `package.json`.

Add `"type": "module"` to `package.json` — this is the preferred approach for a project that uses ES modules throughout. Every lesson from here on will use ES module syntax.

---

**CS lens — `node_modules` resolution algorithm:**

When Node.js sees `import { format } from 'date-fns'`, it uses this algorithm:

1. Look for `node_modules/date-fns` in the current directory.
2. If not found, look in the parent directory's `node_modules`.
3. Continue up the directory tree until reaching the root.
4. If not found anywhere, throw: `Cannot find package 'date-fns'`.

This traversal explains why `node_modules` at the project root serves the entire project — any file anywhere in the project directory can import from it.

---

**SE lens — `node_modules` is the resolution of a graph:**

The packages in `node_modules` are not just the packages you installed directly — they include all their transitive dependencies. A single `npm install date-fns` may install 3 packages (date-fns and its 2 dependencies). A `npm install react react-dom` may install 7 packages.

The `package-lock.json` contains the full resolution of this graph — every package, every version, every download URL. This is why lock files can be thousands of lines long for a project with many dependencies: every node in the transitive dependency graph is recorded.

---

### Add an npm script

Add a `start` script to `package.json`:

```json
{
  "name": "my-platform",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node show-date.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "date-fns": "^3.6.0"
  }
}
```

Now run:

```bash
npm run start
```

`npm run <name>` looks up the `name` key in the `scripts` section of `package.json` and runs the command. The command `node show-date.js` is executed by your shell as if you typed it directly.

`npm run` is more than a shortcut. When npm runs a script, it temporarily adds `node_modules/.bin` to your PATH. This directory contains executable files installed by packages — the TypeScript compiler (`tsc`), Vite's CLI (`vite`), the test runner (`vitest`). You can call these executables in your scripts without knowing the full path.

In lesson 007, the `scripts` section will contain `"dev": "vite"` and `"build": "vite build"`. Running `npm run dev` will execute Vite's dev server even though you cannot type `vite` directly in the terminal (it is only in `node_modules/.bin`, not in your global PATH).

---

## Connect the Pieces

`package.json` and `package-lock.json` together are the dependency layer of your project. They establish the reproducibility guarantee that makes it possible for someone else to work on your project without installing anything beyond what you specified.

**Connection to lesson 001:** The requirement "a developer can add a new lab by reading fewer than 50 lines" is implicitly a budget for dependencies. Each dependency adds something to read. The lock file ensures every developer reads the same codebase because they are running the same packages.

**Connection to lesson 007:** When Vite is installed, it goes into `devDependencies`. The `scripts` section gets `"dev": "vite"` and `"build": "vite build"`. `npm run dev` launches the full development environment. Everything from this lesson — `package.json`, `scripts`, `devDependencies`, the lock file — is the infrastructure that makes `npm run dev` work in one command.

**Connection to lesson 026:** When Vitest is installed for testing, it also goes into `devDependencies`, and `"test": "vitest"` goes into scripts. The same mechanism — `npm run test` looking up the command in scripts and executing the binary from `node_modules/.bin` — runs the test suite.

---

## What Breaks Without This

**Without package.json:**

There is no record of which packages the project uses. A new developer clones the repository and has no way to know what to install. They discover dependencies by running the code and reading error messages: "Cannot find package 'date-fns'." They install it, discover there are five more missing, and eventually have a working environment after an hour of detective work.

**Without package-lock.json:**

Two developers run `npm install` a month apart. One gets date-fns `3.6.0`. The other gets `3.7.0` (released last week). date-fns `3.7.0` has a subtle change in the `format` function's handling of timezone-aware dates. The second developer's code behaves differently. "It works on my machine" is now a real phenomenon with a real cause that neither developer can reproduce.

A CI server that runs `npm install` without a lock file installs whatever the latest compatible version is at the time — which may be different from what developers have locally. A test passes locally, fails on CI, and the failure is diagnosed as "something changed in the package" rather than "the code is wrong."

**Without `node_modules/` in .gitignore:**

```bash
npm install date-fns
git add .
git commit -m "Install date-fns"
```

`git add .` stages `node_modules/` — possibly 100,000+ files. The commit is massive. The repository is bloated. Everyone who clones it gets 100,000 unnecessary files because they will be overwritten by `npm install` anyway.

The `.gitignore` from lesson 003 prevents this. The entry `node_modules/` was written before any `npm install` — exactly for this reason.

---

## Definition of Done

- [ ] `package.json` exists with `"type": "module"` and `"dependencies"` containing `date-fns`
- [ ] `package-lock.json` exists (generated by npm, not hand-written)
- [ ] `node_modules/` exists and contains `date-fns` (but is NOT committed to git)
- [ ] `node show-date.js` prints today's date with `date-fns` formatting
- [ ] `npm run start` produces the same output
- [ ] You can explain the difference between `dependencies` and `devDependencies`
- [ ] You can explain what `^3.0.0` means in a version range
- [ ] You can explain why `package-lock.json` must be committed but `node_modules/` must not
- [ ] Git commit:
  ```
  git add package.json package-lock.json show-date.js
  git commit -m "Initialise package.json and install date-fns

  package.json declares the project's dependencies and scripts.
  package-lock.json locks the exact versions installed.
  date-fns used in show-date.js to demonstrate npm package imports.
  node_modules is excluded by .gitignore from lesson 003."
  ```

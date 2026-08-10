# Lesson 1: A Reversible Workspace

**What you will build:** a blank HTML page that loads a JavaScript file and
runs in a browser with nothing visible yet — and a git repository around it,
so that from this point forward every change you make to this project is
recorded, diffable, and undoable. The transferable problem this lesson is
actually about isn't HTML or git specifically — it's **starting a project so
that experimenting is safe**. Everything in this curriculum from here on
depends on being able to try something, see it break, and get back to a
known-good state without fear.

**What you need to know first:** Nothing. This is Lesson 1.

---

## Concept Unit: The HTML Document Skeleton

### The Problem

A browser needs a file to open. If you hand it a `.html` file with nothing in
it but stray text, it will still try to display *something* — but it has to
guess how to interpret that text, and different browsers guess differently.
We need one file that tells the browser, unambiguously, "this is a document,
here is where its metadata goes, here is where its visible content goes." No
project can be built on top of an ambiguous starting point.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  addition. This project isn't being ported from an existing implementation;
  this lesson *is* the beginning of the implementation.
- **Files affected:** `index.html` (created)
- **Change type:** add (new file)
- **Location:** n/a — this is a brand-new file
- **Dependencies:** none

### The New Code

Type this into a new file, `index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>CAD/CAM Engine</title>
  </head>
  <body>
  </body>
</html>
```

*(Step "The Updated Project" is skipped here — this code isn't landing inside
some larger existing structure. It **is** the whole file, per the schema's
own exception for a brand-new file with nothing to show it enclosed in.)*

### Isolating the Concept

That code above *is* already about as small as this concept gets — but
before trusting it, it's worth seeing what a parser actually does with each
piece, rather than taking "the browser will figure it out" on faith. Here's
that exact skeleton, fed through a real HTML parser (Python's `html.parser`,
standing in here for what your browser's own parser does — this sandbox
can't open a real browser window, so this is the closest thing to a
verifiable "run it" for this concept):

```python
from html.parser import HTMLParser

class Tracker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
    def handle_starttag(self, tag, attrs):
        self.stack.append(tag)
        print(f'START <{tag}>')
    def handle_endtag(self, tag):
        print(f'END   </{tag}>')
        if self.stack:
            self.stack.pop()

skeleton_only = '''<!DOCTYPE html>
<html>
  <head>
    <title>CAD/CAM Engine</title>
  </head>
  <body>
  </body>
</html>
'''
Tracker().feed(skeleton_only)
```

Real output:

```
START <html>
START <head>
START <title>
END   </title>
END   </head>
START <body>
END   </body>
END   </html>
```

What this proves: the parser builds a **tree**, not a flat list of tags —
`<head>` and its child `<title>` open and close *before* `<body>` even
starts. That nesting is the entire reason `<head>` and `<body>` are separate
things: they're two sibling branches under `<html>`, and nothing you put in
one is reachable by looking in the other. This tree structure — the browser
building a nested object model out of your tags — is what's called the
**Document Object Model**, or **DOM**, and it's the thing every later canvas
and Three.js lesson will be reaching into.

This confirms what the real `index.html` code above does (the DOCTYPE line
tells the browser "parse this in standards mode, not legacy quirks mode" —
it doesn't appear in the tree itself, which is why the trace above starts at
`<html>`).

### Mechanical Walkthrough

Enumerating every element in the code, in order:

- **`<!DOCTYPE html>`** — (a) first appearance. Not a tag, and it produces no
  node in the tree (see the trace above — it never printed). It's an
  instruction to the browser's parser itself, telling it to use the modern,
  standardized layout/parsing rules instead of quirks mode, which existed to
  stay backward-compatible with 1990s-era pages and behaves inconsistently
  across browsers.
- **`<html>` … `</html>`** — (a) first appearance. The single root of the
  tree — every other tag is a descendant of this one. A document can have
  exactly one.
- **`<head>` … `</head>`** — (a) first appearance. Holds metadata *about*
  the page — not things a viewer sees directly.
- **`<title>` … `</title>`** — (a) first appearance. The one piece of head
  metadata you're using right now: the text a browser tab displays.
- **`<body>` … `</body>`** — (a) first appearance. Holds everything the
  viewer actually sees or interacts with. Empty for now — nothing to show
  yet.

### CS Lens

This is the **separation of metadata from content** — the same tree-shaped
idea shows up any time a format needs to distinguish "information about the
document" from "the document itself": an email's headers vs. its body, a
PDF's document properties vs. its pages, a JSON API response's `meta` field
vs. its `data` field.

### SE Lens

The alternative not chosen: skip the boilerplate, hand the browser a file
with just raw text or a stray `<body>`-less block. Browsers *will* still
render it — they're extremely forgiving — but they fall back to quirks mode,
where sizing, spacing, and box-model behavior differ subtly per browser. The
tradeoff is six lines of upfront boilerplate against invisible, hard-to-debug
inconsistency later, in code you haven't even written yet. There's no real
debt here yet — this is the cheapest insurance in the entire curriculum.

### Run It

Real output already shown above in "Isolating the Concept." The genuine,
un-fakeable check — actually opening `index.html` in a browser — is one you
run yourself: you should see a blank page with the tab titled "CAD/CAM
Engine." A blank page is the *correct* result; the body is still empty.

### Connecting

This skeleton is the one page every lesson in this entire curriculum will
keep reusing and building on — it doesn't get rebuilt again.

---

## Concept Unit: Loading an External Script File

### The Problem

An HTML page with no JavaScript can only ever be static text. Sooner or
later this project needs code that runs — drawing to a canvas, doing vector
math, animating a toolpath. That code has to live somewhere, and the browser
has to be told to fetch and run it.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  same as the previous unit.
- **Files affected:** `script.js` (created), `index.html` (modified)
- **Change type:** add (`script.js`), add (a new line inside `index.html`)
- **Location:** inside `<body>`, the empty space left in the previous unit
- **Dependencies:** the `index.html` skeleton from the previous unit

### The New Code

First, a new file, `script.js`:

```js
console.log("script loaded");
```

Then, one new line inside `index.html`'s `<body>`:

```html
<script src="script.js"></script>
```

### The Updated Project

`index.html`, in full, with the new line marked:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>CAD/CAM Engine</title>
  </head>
  <body>
    <script src="script.js"></script>  <!-- ← new -->
  </body>
</html>
```

The body, which was empty a moment ago, now does exactly one thing: it tells
the browser to fetch `script.js` from the same folder and run it. The page
itself still shows nothing visible — `console.log` writes to the developer
console, not the page — but code is now executing.

### Isolating the Concept

`console.log("script loaded")` is exactly what's in `script.js` above —
nothing to isolate further; it's already the smallest possible piece. What's
worth actually verifying is that the *file* runs cleanly with no syntax
mistakes before trusting the browser to load it. This sandbox can't open a
real browser tab, so as a stand-in, here's that exact file run with Node
(Node and a browser are different JavaScript environments, but for one line
with no browser-only APIs in it, they behave identically):

```
$ node script.js
script loaded
```

That's called **executing a script file** — Node opened the file, parsed it
top to bottom, and ran each statement in order. This proves `script.js`
contains valid, error-free JavaScript. In your actual browser, opening
`index.html` and checking its developer console (not the page itself) will
show this same line, written there because `<script src="script.js">`
told the browser to fetch and run this exact file.

### Mechanical Walkthrough

`<script src="script.js"></script>`:

- **`<script>` … `</script>`** — (a) first appearance. A tag whose job is
  to bring executable code into the page, rather than displaying content
  the way every tag in the previous unit did.
- **`src` attribute** — (a) first appearance. Points the tag at a file
  instead of putting code directly between the tags — it's a *reference*,
  not the code itself. The browser resolves `"script.js"` relative to
  `index.html`'s own location.

`console.log("script loaded")`:

- **`console`** — (a) first appearance. A built-in object every JS
  environment (browser or Node) provides, representing the developer
  console/terminal as a destination for output.
- **`.log(...)` method call** — (a) first appearance. Writes its argument
  to that console, followed by a newline. It doesn't affect what's drawn on
  the page — this is strictly for a developer to observe.
- **`"script loaded"` string literal** — (a) first appearance. Text data,
  passed as the argument to `.log`.

### CS Lens

Splitting the page (`index.html`, structure) from the behavior (`script.js`,
logic) is the **separation of concerns** — one of the most-recurring ideas
in all of software engineering.

```
Also recognized in: CSS kept separate from HTML (style vs. structure),
the Model/View split in MVC, a database's schema vs. its queries,
a build's configuration file vs. its source code
```

### SE Lens

The alternative not taken: write the `console.log` line directly inside
`index.html` between inline `<script>` tags, with no separate file. That
would work today, for one line. The real tradeoff shows up as this project
grows: this curriculum is going to build an entire vector-math and
toolpath engine in JavaScript/TypeScript. An engine that size, inlined
into HTML, can't be linted, can't be type-checked by a TypeScript compiler,
can't be reused if a second HTML page is ever added, and the browser can't
cache it separately from the page. The cost of choosing external-from-day-one
is one extra file and one line of markup; the cost of choosing inline is
a rewrite later, under time pressure, once the file has become unmanageable.

### Commands Needed

```
$ node script.js
```

`node` is the command that runs the Node.js JavaScript runtime; passing it a
filename tells it to execute that file's contents top to bottom, exactly the
same as a browser would run a script it loaded, for code with no browser-only
APIs involved. Success output is the file's own `console.log` lines with no
error trace beneath them.

### Run It

```
$ node script.js
script loaded
```
This is real output from this exact file, captured this session.

### Connecting

The blank page from the previous unit can now actually run code — the next
two units make sure that code, and everything built on top of it, is never
at risk of being lost.

---

## Concept Unit: Initializing a Git Repository

### The Problem

Right now, `index.html` and `script.js` exist only as whatever's currently on
disk. If tomorrow's lesson breaks something and you can't remember what
changed, there's no way back except memory. Every lesson from here forward
is going to modify these files, sometimes experimentally. There needs to be
a record of every state the project has ever been in, so any of them can be
returned to on purpose.

### Project Change

- **Reference Source:** No reference counterpart — this is tooling setup,
  not project code.
- **Files affected:** none directly — this creates a hidden `.git/`
  directory alongside `index.html` and `script.js`, not a file you edit.
- **Change type:** configure
- **Location:** the root of the project folder
- **Dependencies:** `git` installed on your machine

### The New Code

A single command, run from inside the project folder:

```
$ git init
```

*(No "Updated Project" step — this doesn't modify or land inside any
existing file; it creates a new hidden directory alongside the project,
which the next part inspects directly.)*

### Isolating the Concept

Run in a throwaway scratch folder, unrelated to the real project, to see
exactly what this command does before trusting it:

```
$ mkdir /tmp/git-demo && cd /tmp/git-demo
$ git init
```

Real output:

```
Initialized empty Git repository in /tmp/git-demo/.git/
```

And looking at what actually got created:

```
$ ls -la .git
total 40
drwxr-xr-x 7 root root 4096 .
drwxr-xr-x 3 root root 4096 ..
-rw-r--r-- 1 root root   23 HEAD
drwxr-xr-x 2 root root 4096 branches
-rw-r--r-- 1 root root   92 config
-rw-r--r-- 1 root root   73 description
drwxr-xr-x 2 root root 4096 hooks
drwxr-xr-x 2 root root 4096 info
drwxr-xr-x 4 root root 4096 objects
drwxr-xr-x 4 root root 4096 refs
```

What this proves: `git init` doesn't touch `index.html` or `script.js` at
all — it only creates this `.git` folder. That folder is called the
**repository** — a real, ordinary folder full of ordinary files (you're
looking at some of its actual contents above), not some special hidden
magic. `objects` is where every version of every file's content will
eventually be stored; `refs` is where the current position in history gets
tracked. This is called **initializing a git repository**.

This scratch folder and everything in it is now discarded — it never
touches the real project:

```
$ rm -rf /tmp/git-demo
```

### Mechanical Walkthrough

`git init`:

- **`git`** — (a) first appearance. The command-line program itself —
  version-control software, separate from any specific project.
- **`init`** — (a) first appearance. One of `git`'s subcommands, short for
  "initialize" — tells `git` to create a brand-new, empty repository in the
  current folder.

### CS Lens

A git repository is a system for keeping an addressable, navigable history
of every state your files have been in.

```
Also recognized in: filesystem snapshots (ZFS, Time Machine), a database's
write-ahead log and point-in-time recovery, an editor's undo history,
any system with an audit trail you can rewind
```

### SE Lens

The alternative not chosen: no version control at all — relying on memory,
or manually copying the folder to `project-backup-v2` before risky changes.
That works, technically, for exactly as long as you remember to do it every
single time and never rename something inconsistently. The real cost shows
up specifically in this curriculum: later arcs involve deriving matrix math
and rewriting working code to test alternate approaches. Without git, a
change that turns out wrong means retyping from memory or a stale mental
snapshot. With git, it means one command. The cost of adopting it now is a
handful of new commands to learn; the debt of *not* adopting it compounds
with every lesson from here on, silently, until the day it's needed and
isn't there.

### Commands Needed

```
$ git init
```

Creates a new, empty repository (a `.git` folder) in the current directory.
No flags used here. Success output is a single confirmation line naming the
path where the repository was created.

### Run It

Run for real, in the actual project folder:

```
$ cd /home/claude/cadcam-project
$ git init
Initialized empty Git repository in /home/claude/cadcam-project/.git/
```

*(Git also printed a hint suggesting a default branch name; the repository
here was renamed to `main`, a common convention, with `git branch -m main`.)*

### Connecting

The repository now exists, but it isn't tracking `index.html` or
`script.js` yet — an empty repository knows about nothing until you
explicitly tell it what to remember, which is exactly what the next unit
does.

---

## Concept Unit: Staging and Committing

### The Problem

`git init` created an empty history — right now it doesn't know
`index.html` or `script.js` exist. Just having files on disk next to a
`.git` folder isn't the same as git having recorded them. There needs to be
a deliberate action that says "here is a snapshot of the project, worth
remembering, and here's why."

### Project Change

- **Reference Source:** No reference counterpart — tooling, not project
  code.
- **Files affected:** none edited — this records the current state of
  `index.html` and `script.js` into git's history.
- **Change type:** configure
- **Location:** the project root, run after the previous unit's `git init`
- **Dependencies:** the repository from the previous unit; `index.html` and
  `script.js` from the first two units

### The New Code

Two commands, run in sequence:

```
$ git add index.html script.js
$ git commit -m "Set up blank HTML page with a linked script"
```

*(No "Updated Project" step, for the same reason as the previous unit —
these commands operate on git's own internal history, not on a file you'd
show enclosing this code.)*

### Isolating the Concept

Run in a fresh, throwaway scratch repository, to see the two-step process in
isolation before trusting it on the real project:

```
$ mkdir /tmp/stage-demo && cd /tmp/stage-demo && git init -q
$ echo "hello" > note.txt
$ git status --short
```

Real output — the file exists on disk, but git doesn't have it yet:

```
?? note.txt
```

`??` means "untracked": git sees a file it's never been told about.

```
$ git add note.txt
$ git status --short
```

```
A  note.txt
```

`A` means "added" — the file is now staged, sitting in a holding area,
waiting to be included in the *next* commit. This holding area is called
the **staging area** (or "the index"). It exists as a separate step from
committing specifically so you can build up exactly the set of changes you
want in one snapshot, even if you've edited more files than that in your
working folder.

```
$ git commit -m "add note.txt"
```

```
[master (root-commit) 250a964] add note.txt
 1 file changed, 1 insertion(+)
 create mode 100644 note.txt
```

```
$ git log --oneline
```

```
250a964 add note.txt
```

What this proves: `git commit` takes whatever is currently staged and seals
it into a permanent, named point in history — visible in `git log` from now
on, and returnable-to later. This scratch repository is discarded — it
never touches the real project:

```
$ rm -rf /tmp/stage-demo
```

### Mechanical Walkthrough

`git add index.html script.js`:

- **`add`** — (a) first appearance. Moves the named files from "untracked
  or modified" into the staging area — see the demo above, where `??`
  became `A `.
- **`index.html script.js`** — (c) genuinely basic — these are just the two
  filenames from earlier units, passed as arguments; nothing new about
  passing multiple arguments to a command.

`git commit -m "Set up blank HTML page with a linked script"`:

- **`commit`** — (a) first appearance. Takes everything currently staged
  and seals it into a new, permanent point in the repository's history.
- **`-m`** — (a) first appearance. A flag supplying the commit's message
  inline, rather than opening a text editor to type one.
- **`"Set up blank HTML page with a linked script"`** — (c) genuinely
  basic — a string argument, same idea as `console.log("script loaded")`
  from the second unit.

### CS Lens

Staging before committing is a **two-phase commit** shape — separating "mark
what's ready" from "make it permanent."

```
Also recognized in: a database transaction's BEGIN/COMMIT pair, a shopping
cart before checkout, a text editor's draft vs. saved state, CI/CD
staging environments gating a production release
```

### SE Lens

The alternative not chosen: `git commit -a`, which skips staging and commits
every currently-modified tracked file automatically. It's faster to type,
and for a solo one-file change it works fine. The real tradeoff appears
once several unrelated things are in progress at once — a habit of `-a`
means every commit becomes a grab-bag of whatever happened to be dirty at
that moment, which makes `git log` useless for understanding *why* any one
change happened, and makes it much harder to undo one specific change
without also reverting three unrelated ones. Deliberately staging costs one
extra command; sloppy staging costs a readable history, permanently.

### Commands Needed

```
$ git add <files>
$ git commit -m "<message>"
```

`git add` stages the named files (or `.` for everything modified) for the
next commit; success output is silent (no output at all means it worked —
`git status` is how you'd confirm it). `git commit -m "..."` seals the
staged files into a new point in history; success output names the branch,
a short commit hash, and a summary of files changed.

### Run It

Run for real, on the actual project:

```
$ git add index.html script.js
$ git status --short
A  index.html
A  script.js
$ git commit -m "Set up blank HTML page with a linked script

Establishes the starting skeleton for the CAD/CAM engine: a minimal
HTML page that loads script.js. Nothing renders yet - this commit
exists so every future change is a diff against a known-good, working
starting point."
[main (root-commit) 376bf74] Set up blank HTML page with a linked script
 2 files changed, 10 insertions(+)
 create mode 100644 index.html
 create mode 100644 script.js
$ git log --oneline
376bf74 Set up blank HTML page with a linked script
```

### Connecting

The project now has exactly one committed state — everything from here on
is a diff against this known-good point, which is the entire reason this
lesson exists before any real math or drawing does.

---

## Closing

### Connect the Pieces

One value traced through everything built this lesson: the string
`"script loaded"`. It's typed into `script.js` (Unit 2), which is reached
by the `<script src="script.js">` line inside the `<body>` of the skeleton
built in Unit 1 — the two together are what a browser actually loads when
`index.html` is opened. Both files, in that exact state, are what got staged
in Unit 4 (`git add index.html script.js`) and sealed into the one commit
that Unit 3's empty repository made possible in the first place. Remove any
one of the four units and either the page doesn't run, or it runs but isn't
recoverable.

### What Breaks Without This

Deleting `script.js` and reopening `index.html`:

```
$ rm script.js
```

Opening `index.html` in a browser now produces a **404** in the developer
console for `script.js` — the page still loads (HTML tolerates a missing
script; it just silently fails to run it), but nothing logs. Restoring it,
since it's committed, is one command:

```
$ git checkout -- script.js
$ node script.js
script loaded
```

That last line is real output from this session, confirming the restore
actually worked — this is the payoff for Units 3 and 4 existing at all.

### Exercises

- Change the `<title>` text, reload the page, confirm the browser tab
  updates. Then check `git status` — it should show `index.html` as
  modified but *not* yet staged.
- Add a second `console.log(...)` line to `script.js` with a different
  message, run `node script.js` yourself, and stage and commit just that
  one file with its own message.
- Run `git log` (without `--oneline`) on the real project and read the full
  commit you just made, including its multi-line message.

### Definition of Done

- [ ] `index.html` exists, opens in a browser, shows a blank page titled
      "CAD/CAM Engine"
- [ ] `script.js` exists and is loaded by `index.html`
- [ ] Opening `index.html`'s developer console shows `script loaded`
- [ ] `git status` reports a clean working tree (nothing to commit)
- [ ] `git log --oneline` shows one commit
- [ ] Final commit, if anything above was changed while working through the
      exercises:

  ```
  git add -A
  git commit -m "Confirm blank page loads and script runs before Arc 0

  Verified the skeleton renders, the script executes and logs to the
  console, and the repository's history is intact - this is the known-good
  point every later lesson in this curriculum builds forward from."
  ```

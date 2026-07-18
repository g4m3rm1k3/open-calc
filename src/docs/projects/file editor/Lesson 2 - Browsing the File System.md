# Lesson 2: Trusting Input at a Boundary

## What you will build

A `/files` route that lists a real folder, protected against being
tricked into reading somewhere it shouldn't — and a sidebar that renders
the listing and lets you navigate it. The feature is a file browser; the
actual subject is what happens the moment external input is allowed to
influence a filesystem path, and a pattern — state plus a function that
draws the whole screen from it — that reappears everywhere from here on.

## What you need to know first

`Lesson 1 - The Skeleton.md` — decorators, CORS, Promises,
`document.getElementById`/`.textContent`. Not retaught here.

---

## Concept Unit: a path is an object, not just a string

### The Problem

The backend needs to build a real filesystem path — this project's
folder, plus whatever subfolder was requested. Gluing strings together
with `/` characters by hand breaks the moment the same code runs on an
operating system using a different separator (`\` on Windows, `/`
elsewhere).

### Project Change

- **Files affected** — `backend/main.py`, existing file (from Lesson 1).
- **Change type** — add.
- **Location** — two new top-level lines: `from pathlib import Path`
  above the existing imports, and `CONTENT_DIR = ...` after
  `app = FastAPI()`, before `app.add_middleware(...)`.
- **Dependencies** — none beyond the Python standard library; `pathlib`
  ships with Python itself, no `pip install` needed.

### The New Code — type this

```python
from pathlib import Path

CONTENT_DIR = (Path(__file__).parent / "content").resolve()
```

### The Updated Project — where this lives

Now see it in place:

```python
from pathlib import Path                                    # ← new

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

CONTENT_DIR = (Path(__file__).parent / "content").resolve()  # ← new

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}
```

That's the entire file so far — two new lines added to Lesson 1's
skeleton, sitting between the app being created and CORS being
configured. `/health` itself is untouched, shown here in full anyway
since the whole file is still small enough to show whole.

### Mechanical Walkthrough

`Path` (from `pathlib`) represents a filesystem location as an object
with its own methods, instead of a plain string. `__file__` is a
variable Python fills in automatically — the path to `main.py` itself.
`.parent` is a property returning the folder that contains it.

### CS Lens — this `/` is not division

`/ "content"` joins `"content"` onto the path. This is **operator
overloading**: `pathlib` defines what `/` means specifically between two
`Path`-related things — "join these," nothing to do with arithmetic — the
same symbol doing a completely different job depending on the types on
either side of it. `.resolve()` then collapses the result to its
absolute, canonical form, resolving away any `..` segments — this matters
a great deal in the next unit.

### Connects To

This connects directly to Lesson 1's decorator unit: both are cases where
a language lets you attach non-obvious behavior to familiar-looking
syntax — a decorator to a function definition, a custom meaning to an
operator — and both require knowing that fact before the code reads as
anything but confusing.

---

## Concept Unit: the `for` loop

### The Problem

Listing a folder means doing the same thing once per item inside it —
and the item count isn't known until the folder is actually read.

### Concept Lab

```python
colors = ["red", "green", "blue"]

for color in colors:
    print(color.upper())
```

Run it. It prints `RED`, `GREEN`, `BLUE`, one per line.

### What This Proves

`colors = ["red", "green", "blue"]` is a **list** — Python's ordered,
growable collection, written with square brackets and comma-separated
values. `for color in colors:` means "for each item in `colors`, one at
a time, run the block below with `color` set to that item" — there's no
manual counter or index the way a C-style `for` loop needs one; Python
iterates directly over the values themselves. A `for` loop lets code act
on every item of a collection without knowing in advance how many there
are.

### Discard

This code is deleted now — `colors` never appears in the project. The
real loop does the same thing to whatever a folder actually contains,
which could be zero files or thousands.

---

## Concept Unit: reading a path without leaving the sandbox

### The Problem

`CONTENT_DIR` is meant to be a hard boundary — this app should never read
or write outside `backend/content/`. The uncomfortable fact that boundary
is up against: `Path.resolve()`, and every filesystem API underneath it,
will happily walk `..` all the way up to the drive root. The operating
system has no concept of "this particular process's sandbox." That
concept exists only in code written to check for it, every single time,
or it doesn't exist at all.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add.
- **Location** — `HTTPException` added to the existing
  `from fastapi import FastAPI` line, becoming
  `from fastapi import FastAPI, HTTPException`; a new
  `@app.get("/files")` route function added after `health_check`.
- **Dependencies** — `CONTENT_DIR` from the previous unit.

### The New Code — type this

```python
target_dir = (CONTENT_DIR / path).resolve()

if not target_dir.is_relative_to(CONTENT_DIR):
    raise HTTPException(status_code=400, detail="Invalid path")
```

### The Updated Project — where this lives

Now see it in place:

```python
from pathlib import Path

from fastapi import FastAPI, HTTPException   # ← changed: added HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

CONTENT_DIR = (Path(__file__).parent / "content").resolve()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/files")                                                # ← new
def list_files(path: str = ""):                                   # ← new
    target_dir = (CONTENT_DIR / path).resolve()                   # ← new

    if not target_dir.is_relative_to(CONTENT_DIR):                 # ← new
        raise HTTPException(status_code=400, detail="Invalid path")  # ← new
```

`list_files` is a brand-new function, added after `health_check` —
there's nothing else inside it yet. Everything above it — the imports,
`CONTENT_DIR`, the CORS setup, `health_check` itself — is exactly what
the previous unit already left in place; only `HTTPException` joining
the import line and the new function at the bottom are new here. `path: str = ""` is a function parameter
with a default value — FastAPI infers from this that `path` should come
from the URL's query string (`/files?path=src` sends `"src"`), and that
it's optional, defaulting to an empty string when absent. So far,
`list_files` does exactly one thing: refuse to proceed at all unless the
requested path is verifiably inside the sandbox. It doesn't yet return
anything on success — that's the next unit.

### Mechanical Walkthrough

`CONTENT_DIR / path` builds a candidate location using the same join
operator from the first unit; `.resolve()` collapses it exactly as
before — critically, *after* whatever `..` sequences `path` might
contain. `is_relative_to(...)` asks whether `target_dir`, now fully
resolved, is still located inside `CONTENT_DIR`. `raise
HTTPException(status_code=400, detail="Invalid path")` is new: `raise`
interrupts the function immediately — nothing below it runs — and
`HTTPException` is FastAPI's way of turning that interruption into a
real HTTP response instead of a raw crash. `status_code=400` is one of
the standard HTTP status codes; the `4xx` range means "the client's
request itself was bad," as opposed to `5xx`, "the server broke on an
otherwise-valid request."

### CS Lens — naming the vulnerability

A request for `/files?path=../../../../Windows` builds exactly that
path, resolves to a real folder outside this project, and — without this
check — gets listed without complaint. This class of bug has a name,
**path traversal**, and it's one of the most common real vulnerabilities
in software that touches a filesystem based on any external input.

### SE Lens — why this check and not the obvious one

The instinct a lot of people reach for first is filtering the *string* —
reject any `path` containing `".."`. That's broken in ways that aren't
obvious until they've bitten someone: URL-encoded traversal (`%2e%2e`),
an absolute path that needs no `".."` at all (`path=C:\Windows`), other
representations of the same location. Checking the *resolved, canonical*
path sidesteps the entire category — it doesn't matter how the input was
spelled, only where it actually points.

This exact check is about to be copy-pasted into every route that
touches a file. The day a new route is added and this gets forgotten,
that route has a traversal hole with nothing flagging it. A shared helper
every route calls through would remove that risk — this project hasn't
done that yet, and it's worth knowing that as a real, current cost rather
than pretending three separate copies is fine because it currently works.

### Run It

```
GET /files?path=../../../../Windows → 400 {"detail":"Invalid path"}
```

Confirmed directly against this code, alongside a normal request
succeeding — the check rejects the attack without rejecting legitimate
paths.

---

## Concept Unit: enumerating what's there

### The Problem

Once a path is confirmed safe, its contents need turning into something
the frontend can display.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add.
- **Location** — continues directly inside `list_files`, immediately
  after the `is_relative_to` check from the previous unit, plus a final
  `return` line.
- **Dependencies** — the `for` loop from its concept lab, `CONTENT_DIR`.

### The New Code — type this

```python
if not target_dir.is_dir():
    raise HTTPException(status_code=404, detail="Folder not found")

entries = []
for entry in sorted(target_dir.iterdir()):
    entries.append({
        "name": entry.name,
        "is_directory": entry.is_dir(),
    })
return {"path": path, "entries": entries}
```

### The Updated Project — where this lives

Now see it in place:

```python
@app.get("/files")
def list_files(path: str = ""):
    target_dir = (CONTENT_DIR / path).resolve()

    if not target_dir.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_dir.is_dir():                                     # ← new
        raise HTTPException(status_code=404, detail="Folder not found")  # ← new

    entries = []                                                     # ← new
    for entry in sorted(target_dir.iterdir()):                       # ← new
        entries.append({                                             # ← new
            "name": entry.name,                                      # ← new
            "is_directory": entry.is_dir(),                          # ← new
        })                                                            # ← new
    return {"path": path, "entries": entries}                       # ← new
```

`list_files` is now complete: refuse anything outside the sandbox, refuse
anything that isn't a real folder, then return exactly `name` and
`is_directory` for everything inside it, alphabetically. Every line
above the `# ← new` markers is the boundary check from the previous
unit, untouched — this unit only added what happens once that check has
already passed.

### Mechanical Walkthrough

`is_dir()` catches a second failure case beyond the traversal check — a
syntactically valid path that just doesn't point at a real folder, caught
with the same `HTTPException` shape, a different status code (`404`,
"not found," rather than `400`, "bad request"). `entries = []` creates an
empty list, the same construct from the concept lab. `target_dir.iterdir()`
is a `Path` method that reads the folder and produces one `Path` per item
inside it — `iterdir()` makes no promise about *order*, which can vary by
filesystem; `sorted(...)` wraps it to guarantee alphabetical order
instead, so the sidebar doesn't reshuffle for no reason on every reload.
Inside the loop, `entry.name` (a property) gives just the filename;
`entry.is_dir()` (a method — note the parentheses, since it actually
checks the filesystem each call, unlike the property) returns
`True`/`False`. `.append(...)` adds each resulting dictionary onto
`entries`.

### SE Lens — the response shape is a promise, not laziness

`entry` is a full `Path` object with far more available — absolute
location, size, modified time. None of that crosses into the response.
Two real reasons: an absolute path like
`C:\Users\yourname\...\content\src\main.py` leaks folder structure and a
username, harmless on localhost today but not a habit worth keeping; and
every field returned becomes something the frontend can start depending
on — removing it later is a breaking change. Returning only `name` and
`is_directory` is choosing not to make promises nothing needs yet.

### Run It

```
GET /files?path=      → {"path":"","entries":[{"name":"README.md","is_directory":false},{"name":"src","is_directory":true}]}
GET /files?path=src   → {"path":"src","entries":[{"name":"main.py","is_directory":false},{"name":"utils.py","is_directory":false}]}
```

---

## Concept Unit: styling two panes that share the screen

### The Problem

The sidebar and the main content need to sit side by side, and the
sidebar's width should be adjustable by hand.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — replace. The `<style>` section is new (Lesson 1 had
  none); the `<body>` content replaces Lesson 1's single `<p id="status">`
  with a sidebar/main-content layout.
- **Dependencies** — none.

### The New Code — type this

```css
.layout {
    display: flex;
    height: 100vh;
}
.sidebar {
    width: 250px;
    min-width: 150px;
    max-width: 500px;
    resize: horizontal;
    overflow: auto;
    border-right: 1px solid #ccc;
    padding: 8px;
    box-sizing: border-box;
}
.sidebar ul {
    list-style: none;
    margin: 0;
    padding: 0;
}
.sidebar li {
    padding: 4px 6px;
    border-radius: 4px;
}
.sidebar li.clickable {
    cursor: pointer;
}
.sidebar li.clickable:hover {
    background-color: #eee;
}
.main-content {
    flex: 1;
    padding: 16px;
}
```

### The Updated Project — where this lives

Now see it in place — this is the complete `<style>` block and `<body>`,
not a simplified stand-in for them:

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Editor</title>
    <style>
        body {
            margin: 0;
        }
        .layout {                             /* ← new */
            display: flex;                    /* ← new */
            height: 100vh;                     /* ← new */
        }                                       /* ← new */
        .sidebar {                              /* ← new */
            width: 250px;                       /* ← new */
            min-width: 150px;                   /* ← new */
            max-width: 500px;                   /* ← new */
            resize: horizontal;                 /* ← new */
            overflow: auto;                     /* ← new */
            border-right: 1px solid #ccc;       /* ← new */
            padding: 8px;                       /* ← new */
            box-sizing: border-box;             /* ← new */
        }                                        /* ← new */
        .sidebar ul {                            /* ← new */
            list-style: none;                   /* ← new */
            margin: 0;                           /* ← new */
            padding: 0;                          /* ← new */
        }                                         /* ← new */
        .sidebar li {                             /* ← new */
            padding: 4px 6px;                    /* ← new */
            border-radius: 4px;                   /* ← new */
        }                                          /* ← new */
        .sidebar li.clickable {                    /* ← new */
            cursor: pointer;                        /* ← new */
        }                                            /* ← new */
        .sidebar li.clickable:hover {                /* ← new */
            background-color: #eee;                   /* ← new */
        }                                              /* ← new */
        .main-content {                                 /* ← new */
            flex: 1;                                     /* ← new */
            padding: 16px;                                /* ← new */
        }                                                  /* ← new */
    </style>
</head>
<body>
    <div class="layout">
        <div class="sidebar" id="sidebar">
            <ul id="file-list">
                <li>Loading...</li>
            </ul>
        </div>
        <div class="main-content">
            <h1>Code Editor</h1>
            <p>Click a file in the sidebar to open it.</p>
        </div>
    </div>
```

The `<style>` block is new — Lesson 1 had none. The `<body>` now has a
`.layout` wrapper holding two side-by-side panes instead of the single
`<p id="status">` from Lesson 1, which is gone entirely.

### Mechanical Walkthrough

`display: flex` on `.layout` places its children — `.sidebar` and
`.main-content` — side by side instead of stacked. `flex: 1` on
`.main-content` tells it to consume whatever space is left over;
`.sidebar` has no `flex` value, so it keeps its own fixed `width`
instead of stretching, bounded between `min-width` and `max-width` so
the resize handle (below) can't shrink or grow it without limit.
`border-right`, `padding`, and `box-sizing: border-box` are ordinary
visual spacing — `box-sizing: border-box` specifically means the
element's declared `width` includes its padding and border, rather than
padding being added on top of it, which is what keeps the sidebar's
actual rendered width matching the number set above instead of quietly
growing past it. `resize: horizontal` adds a native browser-provided
drag handle for resizing the sidebar's width — no JavaScript involved.
`.sidebar ul { list-style: none; margin: 0; padding: 0; }` strips three
defaults every `<ul>` has out of the box — the bullet points, and the
built-in indentation/spacing browsers apply automatically — none of
which fit a file-browser sidebar. `.sidebar li { padding: 4px 6px;
border-radius: 4px; }` gives each list item some breathing room and
slightly rounded corners. `.sidebar li.clickable { cursor: pointer; }`
and `.sidebar li.clickable:hover { background-color: #eee; }` are a
matched pair: neither rule applies to a plain `<li>` — only to one that
also carries the `clickable` class — and together they're what makes a
folder entry visually announce itself as interactive: the pointer cursor
on hover, and a light background highlight while the mouse is over it.
Nothing in the JavaScript has assigned that class to anything yet; that
happens several units from now, and this is the CSS that will be
waiting, already in place, the moment it does.

### SE Lens — a real, verifiable dependency between two properties

`resize` only takes effect on an element whose `overflow` isn't left at
its default (`visible`). Delete `overflow: auto` and the resize handle
disappears with no error anywhere — nothing is technically wrong,
`resize` is simply specified to require it. This is worth causing on
purpose rather than taking as a rule to memorize.

---

## Concept Unit: one variable holding the truth

### The Problem

The sidebar needs to remember which folder it's currently showing, and
that has to change every time you navigate.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — replace. The `<script>` block's contents replace
  Lesson 1's `fetch(".../health")` call entirely.
- **Dependencies** — the `/files` route from earlier in this lesson.

### The New Code — type this

```javascript
let currentPath = "";
```

### The Updated Project — where this lives

Now see it in place:

```html
<script>
    let currentPath = "";   <!-- ← new: replaces Lesson 1's fetch(".../health") entirely -->
</script>
```

The whole `<script>` block is emptied out and restarted here — Lesson
1's health-check `fetch` is gone; everything from this point through the
end of the lesson builds up a new script from scratch.

### Mechanical Walkthrough

This is the first variable declaration anywhere in this curriculum.
`let` declares a binding that *can* be reassigned later
(`currentPath = "src"` further down is valid) — different from a binding
meant to never change, which JavaScript spells `const` instead.
`currentPath` starts as an empty string, meaning "the root of
`CONTENT_DIR`."

### CS Lens — this is the UI's entire state

`currentPath` is the one source of truth everything on screen gets
derived from. `renderFileList`, built across the next several units,
never reaches into the existing list and edits one item — every
navigation clears the whole list and rebuilds it completely from
`currentPath` and whatever entries were just fetched. This is the
foundational idea a framework like React formalizes and enforces: UI as
a function of state, redrawn wholesale on change rather than
hand-patched piecemeal. Recognizing that this project is already doing
that idea by hand is worth more than the syntax itself.

---

## Concept Unit: JavaScript's version of the same loop

### The Problem

The frontend needs to do the same thing — build one `<li>` — once per
entry the backend sent back.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new `renderFileList` function, inside the
  existing `<script>` block.
- **Dependencies** — `currentPath` from the previous unit.

### The New Code — type this

This unit's whole point is a `for`-loop equivalent, but that loop has to
live inside *some* function, and that function is entirely new — there
is no existing structure to add it into, so unlike most units from here
on, "The New Code" is the complete new function, not a small fragment
dropped into a pre-existing one:

```javascript
function renderFileList(entries) {
    const list = document.getElementById("file-list");
    list.textContent = "";

    entries.forEach((entry) => {
        // one entry at a time, next few units fill this in
    });
}
```

### The Updated Project — where this lives

Now see it in place:

```javascript
let currentPath = "";

function renderFileList(entries) {                    // ← new
    const list = document.getElementById("file-list"); // ← new
    list.textContent = "";                              // ← new

    entries.forEach((entry) => {                        // ← new
        // one entry at a time, next few units fill this in  // ← new
    });                                                   // ← new
}
```

This is the whole file's second top-level piece of code, sitting right
after `currentPath`. So far, `renderFileList` clears whatever the `<ul>`
currently shows and prepares to visit every entry the backend sent — but
doesn't yet decide what to actually draw for each one. That's the next
three units.

### Mechanical Walkthrough

`function renderFileList(entries) { ... }` is a **named function
declaration** — the first time this curriculum has written a function
this way, rather than as an arrow function like every `.then(...)` and
`addEventListener(...)` callback in Lesson 1. `function` names the
function (`renderFileList`) and declares its parameter (`entries`) up
front, and — unlike the arrow functions seen so far, which were always
created and handed somewhere else in the same expression (into `.then`,
into `addEventListener`) — this one is declared on its own, to be called
by name from other code later in this lesson. `const list =
document.getElementById("file-list")` reuses `getElementById` from
Lesson 1 exactly as before, just against a different `id`, and reuses
`const` from the previous unit's `let`/`const` distinction — this binding
is never reassigned once set. `list.textContent = ""` is the same
`.textContent` assignment from Lesson 1, applied here to erase whatever
the `<ul>` currently shows — an empty string is valid `textContent`,
removing all of an element's content rather than replacing it with new
text. `.forEach()` is an array method: it calls the function passed to
it once for each item in the array, handing that item in as `entry`.

### CS Lens — same idea, different spelling

This is the exact concept from the Python `for` loop earlier in this
lesson — "do this for every item, one at a time" — expressed with
different syntax in a different language. Python spells it
`for entry in entries:`; JavaScript spells it
`entries.forEach((entry) => { ... })`. Recognizing that these are the
same underlying idea matters more than memorizing either syntax alone —
the next language will spell it a third way.

---

## Concept Unit: choosing a value based on a condition, inline

### The Problem

A folder needs its name displayed with a trailing `/`; a file needs its
name displayed as-is — a small decision made once per entry.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, inside the `entries.forEach(...)` body from the
  previous unit.
- **Dependencies** — none new.

### The New Code — type this

```javascript
const item = document.createElement("li");
item.textContent = entry.is_directory ? entry.name + "/" : entry.name;
```

### The Updated Project — where this lives

Now see it in place:

```javascript
entries.forEach((entry) => {
    const item = document.createElement("li");                              // ← new
    item.textContent = entry.is_directory ? entry.name + "/" : entry.name;  // ← new
});
```

Each entry now becomes an actual `<li>` element, in memory, correctly
labeled — folders get a trailing `/`, files don't. Nothing is visible on
the page yet, because nothing has attached `item` to the document — the
next unit does that.

### Mechanical Walkthrough

This is the **ternary operator**: `condition ? valueIfTrue : valueIfFalse`.
It's shorthand for a full `if`/`else` that exists specifically to
*produce a value* rather than run a block of statements — equivalent to:

```javascript
if (entry.is_directory) {
    item.textContent = entry.name + "/";
} else {
    item.textContent = entry.name;
}
```

except the ternary version fits directly into one assignment. `entry.name
+ "/"` uses `+` to concatenate two strings. `document.createElement("li")`
is the same DOM-construction method from Lesson 1's `getElementById`
sibling API — it creates a new element in memory, not yet on the page.

---

## Concept Unit: making a constructed element actually visible

### The Problem

`document.createElement` only builds an element in memory — something
has to insert it into the page for it to be seen at all.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, continuing inside `entries.forEach(...)`.
- **Dependencies** — `item` from the previous unit, `list` from two
  units prior.

### The New Code — type this

```javascript
list.appendChild(item);
```

### The Updated Project — where this lives

Now see it in place:

```javascript
entries.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry.is_directory ? entry.name + "/" : entry.name;
    list.appendChild(item);   // ← new
});
```

`renderFileList` now genuinely draws the folder's contents on screen —
run the backend and open the page at this exact point in the lesson and
you'd already see a real, correctly labeled list; nothing in it is
clickable yet.

### Mechanical Walkthrough

`list.appendChild(item)` inserts `item` into the page, as the last child
of `list`. Between `createElement` and `appendChild`, `item` was a
fully-formed element that simply wasn't part of the visible page yet —
the same way a value sitting in a variable exists whether or not
anything prints it.

---

## Concept Unit: reacting to a click

### The Problem

Clicking a folder needs to trigger navigation, at some unpredictable
future moment — not immediately when the page loads.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, wrapping `item` from the previous units in a
  clickability check, plus a matching `upItem` built the same way for
  navigating out of a folder.
- **Dependencies** — `currentPath`, `loadFolder` (the function that calls
  `renderFileList` in the first place; fetches `/files` the same way
  Lesson 1's `fetch` did).

### The New Code — type this

```javascript
upItem.addEventListener("click", () => {
    const parentPath = currentPath.split("/").slice(0, -1).join("/");
    loadFolder(parentPath);
});
```

### The Updated Project — where this lives

Now see it in place:

```javascript
function renderFileList(entries) {
    const list = document.getElementById("file-list");
    list.textContent = "";

    if (currentPath !== "") {                                              // ← new
        const upItem = document.createElement("li");                       // ← new
        upItem.textContent = ".. (up)";                                    // ← new
        upItem.className = "clickable";                                    // ← new
        upItem.addEventListener("click", () => {                           // ← new
            const parentPath = currentPath.split("/").slice(0, -1).join("/");  // ← new
            loadFolder(parentPath);                                         // ← new
        });                                                                  // ← new
        list.appendChild(upItem);                                          // ← new
    }                                                                        // ← new

    entries.forEach((entry) => {
        const item = document.createElement("li");
        item.textContent = entry.is_directory ? entry.name + "/" : entry.name;

        const entryPath = currentPath === "" ? entry.name : currentPath + "/" + entry.name;  // ← new
        item.className = "clickable";                                                        // ← new

        if (entry.is_directory) {                          // ← new
            item.addEventListener("click", () => {          // ← new
                loadFolder(entryPath);                        // ← new
            });                                                // ← new
        }                                                       // ← new

        list.appendChild(item);
    });
}
```

`renderFileList` is now a complete, navigable file browser: it draws an
"up" entry whenever you're not at the root, wired to compute and load the
parent folder, and every folder entry is wired the same way to load
*into* itself. `entryPath` is computed once per entry, before the `if`,
because both a folder and a file (added in Lesson 3) will need it
identically — only what happens with it differs.

### Mechanical Walkthrough

`currentPath !== ""` and, further down inside the `forEach`,
`currentPath === ""` are this curriculum's first use of JavaScript's
`===`/`!==` comparison operators — first appearance, worth a clause of
its own: JavaScript also has `==`/`!=`, which silently convert the two
sides to a common type before comparing (`0 == ""` is `true`); `===`/`!==`
compare both value *and* type with no conversion, which is why they're
the pair used by default throughout this project — the behavior is
predictable without having to reason about JavaScript's conversion rules
case by case. `upItem.className = "clickable"` and
`item.className = "clickable"` set an element's CSS class from
JavaScript — assigning to `.className` attaches that class the same way
writing `class="clickable"` directly in HTML would, except done
dynamically, per element, only for the ones this code decides should
have it. This is what actually activates the `.sidebar li.clickable` and
`.sidebar li.clickable:hover` rules from the CSS unit earlier in this
lesson — those rules already existed, doing nothing, until this exact
line started applying the class they key off of. `addEventListener("click",
fn)` registers `fn` to run later, whenever this specific element is
clicked.

### CS Lens — the same shape as `.then()`

This is the same underlying idea as Lesson 1's Promise `.then()`: a
function handed over to run *later*, in response to something happening,
rather than immediately in the order it's written. `.then()` reacts to a
promise settling; `addEventListener` reacts to a user action. Both are
"don't run this now — run it when X happens" instead of top-to-bottom
execution.

A second concept rides along here: the arrow function references
`currentPath` from the surrounding scope. This works because of a
**closure**: the function captures a reference to the *variable*
`currentPath`, not a frozen snapshot of its value at the moment the
handler was created. By the time a click actually happens, `currentPath`
may have changed several times since — the handler sees whatever it is
*now*. Convenient here; also a classic source of bugs the moment a
handler is created inside a loop and each one is assumed to remember its
own separate value.

---

## Concept Unit: computing the parent path

### The Problem

Clicking "up" needs to remove the last segment of `currentPath` — the
one piece of the previous unit's code not yet explained.

### The New Code — type this

```javascript
currentPath.split("/").slice(0, -1).join("/")
```

### Execution Trace

For `currentPath = "src/lib"`:

```
"src/lib".split("/")            → ["src", "lib"]
["src", "lib"].slice(0, -1)     → ["src"]        (everything except the last item)
["src"].join("/")               → "src"
```

### Mechanical Walkthrough

`.split("/")` breaks a string into an array wherever `"/"` appears.
`.slice(0, -1)` returns a copy of an array from index `0` up to, but
excluding, the last element — `-1` is a negative index meaning "one from
the end." `.join("/")` reverses `split`, gluing an array of strings back
together with `"/"` between each piece. Chained, this is "drop the last
path segment" — entirely as string/array manipulation; only the backend
ever touches a real filesystem.

---

## Concept Unit: making a path safe to put in a URL

### The Problem

A folder name could contain characters — spaces, `&`, `?` — that mean
something structural inside a URL rather than being part of the name.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add. `loadFolder` itself has been referenced by name
  as a dependency in several units above (every click handler calls it)
  but its own body has not been shown yet — it's shown here, complete,
  for the first time, with `encodeURIComponent` wrapped around its one
  piece of unsafe input.
- **Dependencies** — `currentPath` and `renderFileList` from earlier in
  this lesson; the `.then`/`.catch` promise chain from Lesson 1.

### The New Code — type this

```javascript
encodeURIComponent(path)
```

This is the one genuinely new piece — everything else `loadFolder`
does below reuses shapes already taught. It's still shown in its full
enclosing function next, in one piece, since that function has never
been shown whole before now.

### The Updated Project — where this lives

Now see it in place:

```javascript
function loadFolder(path) {
    fetch("http://127.0.0.1:8000/files?path=" + encodeURIComponent(path))
        .then((response) => response.json())
        .then((data) => {
            currentPath = data.path;
            renderFileList(data.entries);
        })
        .catch((error) => {
            document.getElementById("file-list").textContent = "Could not reach backend.";
        });
}

loadFolder("");
```

`loadFolder` is the function every unit in this lesson has been building
toward — called once with `""` when the page first loads, and again by
every click handler built in earlier units. It now safely requests any
folder path, including ones a naive string concatenation would have
corrupted. This is the last new code in this lesson; `loadFolder("")` at
the very bottom of the script is what actually starts everything running
the moment the page loads — nothing else in the file calls itself.

### Mechanical Walkthrough

`function loadFolder(path) { ... }` is a **named function declaration** —
the same shape as `renderFileList` earlier in this lesson, reused here,
not a new concept. `fetch(...)`, `.then((response) => response.json())`,
the second `.then((data) => { ... })`, and `.catch((error) => { ... })`
are the exact Promise-chain shape from Lesson 1's health check — reused
wholesale, down to the same three-link structure. `"http://127.0.0.1:8000/files?path=" +
encodeURIComponent(path)` concatenates a fixed URL prefix with a safely
escaped `path`, using the same `+` string concatenation already taught;
`encodeURIComponent` itself is new — it escapes characters unsafe in a
URL, a space becoming `%20`, `&` becoming `%26`. A folder literally named
`notes & drafts`, sent unescaped, would have its `&` misread as
separating two query parameters instead of being part of one folder
name; `encodeURIComponent` keeps it intact as a single value regardless
of what characters it contains. Inside the second `.then`,
`currentPath = data.path;` is this project's first *reassignment* of a
`let` binding — the exact reason `currentPath` was declared with `let`
and not `const` back when it was introduced: this is where it actually
needs to change. `renderFileList(data.entries);` calls the function built
earlier in this lesson, handing it the freshly fetched entries — the
same function-call syntax used throughout, nothing new. The `.catch`
body sets `.textContent` on the file list to an error message, the same
property assignment from Lesson 1. Finally, `loadFolder("");`, sitting
outside any function at the bottom of the script, runs immediately when
the browser parses this file — the same way Lesson 1's `fetch(...)` call
ran immediately, just now wrapped in a named function invoked explicitly
instead of an anonymous chain sitting directly in the script.

---

## Connect the pieces

Page load: `loadFolder("")` runs directly. It builds
`http://127.0.0.1:8000/files?path=`, `encodeURIComponent` leaving the
empty string untouched, and sends it. On the backend, `list_files`
resolves that empty `path` against `CONTENT_DIR`, confirms with
`is_relative_to` that it hasn't left the sandbox (trivially true — it
*is* the sandbox root), confirms it's a real directory, and returns
`{"path": "", "entries": [...]}` built by the `for` loop. Back in the
browser, `currentPath` is set to that returned path and `renderFileList`
clears the `<ul>` and rebuilds it entirely: no "up" entry, since
`currentPath` is empty, then one `<li>` per entry, each labeled by the
ternary and made clickable if it's a folder.

Click `src/`: the entry's click handler — a closure over `currentPath`
and `entryPath`, wired up when the list was drawn — calls
`loadFolder("src")`. The exact same backend path runs again, this time
resolving `CONTENT_DIR / "src"`, and the exact same frontend path runs
again, this time drawing an "up" entry too, since `currentPath` is no
longer empty.

Click `.. (up)`: the up entry's own closure computes
`currentPath.split("/").slice(0, -1).join("/")` — `"src"` becomes `""` —
and calls `loadFolder("")` again, back to the root.

## What breaks without this

Verified directly, not hypothetically: `path=../../../../Windows` returns
`400` against this code. Temporarily deleting the `is_relative_to` check
and repeating that exact request lists a real folder outside this
project — worth causing on purpose, then restoring the check.

## Exercises

1. Cause the traversal bug on purpose as described above, confirm it
   actually works, then restore the check and confirm it's blocked again.
2. Delete `overflow: auto` from `.sidebar`, reload, and confirm the
   resize handle disappears.
3. In the `for` loop lab, change `colors` to an empty list, `[]`, and
   predict what prints before running it.
4. Trace `"a/b/c".split("/").slice(0, -1).join("/")` on paper before
   running it, using the execution-trace format shown above.

## Definition of done

- [ ] You've caused and fixed the traversal bug yourself
- [ ] You can explain why checking the *resolved* path beats filtering
      the *string* for `".."`
- [ ] You can name the two separate reasons the response only includes
      `name` and `is_directory`
- [ ] You can explain what a closure is doing in the click handler
- [ ] You can trace the split/slice/join chain with a path of your own
- [ ] `git commit` this lesson's code with a message explaining why

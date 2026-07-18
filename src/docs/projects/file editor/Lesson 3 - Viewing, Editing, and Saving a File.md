# Lesson 3: Trusting Data, Not Just Paths

## What you will build

`GET` and `PUT` routes for a single file — read its text content, write
new content back — and a main pane that's a real editable `<textarea>`
with a Save button. Lesson 2 was about validating *where* a request is
allowed to look. This lesson is about validating *what* a request is
allowed to contain, and about a decoding assumption that fails silently
if you don't pin it down.

## What you need to know first

`Lesson 2 - Browsing the File System.md` — `path`, `is_relative_to`,
`HTTPException`, the sidebar's `currentPath` state and click dispatch.
Not retaught here.

---

## Concept Unit: recovering from an error instead of crashing

### The Problem

Reading a file's bytes as text can fail — the bytes might not actually be
valid text. Before handling that for real, here's the language construct
that makes recovery possible, on its own.

### Concept Lab

```python
def divide(a, b):
    return a / b

print(divide(10, 2))
print(divide(10, 0))
```

Run it: `5.0` prints, then the program crashes —
`ZeroDivisionError: division by zero` — and nothing after that line runs.

```python
def divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None

print(divide(10, 2))
print(divide(10, 0))
```

Now both lines print: `5.0`, then `None`.

### What This Proves

`try:` marks code to attempt. `except ZeroDivisionError:` runs only if
*that specific* error happens inside it, and the program continues
normally afterward instead of stopping. Naming the exact exception type
matters — only the failure actually anticipated gets handled this way;
any other, unexpected error still crashes, which is what you want,
because silently swallowing errors you didn't anticipate hides real bugs.

### Discard

This code is deleted now — `divide` never appears in the project. The
real code uses this same shape: a `try`, one specific exception type, and
a fallback action, just with a different exception and a different
fallback.

---

## Concept Unit: a class that validates itself

### The Problem

The save route needs to trust that an incoming request body actually has
the shape expected — a `content` field that's really a string — before
writing anything to disk.

### Concept Lab

```python
from pydantic import BaseModel

class Dog(BaseModel):
    name: str
    age: int

good_dog = Dog(name="Rex", age=3)
print(good_dog)

bad_dog = Dog(name="Rex", age="not a number")
print(bad_dog)
```

The first `print` succeeds: `name='Rex' age=3`. The second never runs —
construction itself fails first:

```
pydantic_core._pydantic_core.ValidationError: 1 validation error for Dog
age
  Input should be a valid integer, unable to parse string as an integer [type=int_parsing, input_value='not a number', input_type=str]
```

### What This Proves

`class Dog(BaseModel):` defines a new type — `class` is Python's keyword
for that, and `(BaseModel)` means `Dog` **inherits** everything
`BaseModel` already does. `name: str` and `age: int` aren't just
documentation the way a function's type hints have been so far — on a
`BaseModel` subclass, they're the *enforced* shape of the data, checked
the instant an instance is constructed. Handing it a string where an
integer was declared doesn't silently accept it or quietly convert it —
it refuses immediately, naming exactly which field failed and why.

### Discard

This code is deleted now; the real model has one field, not two.

---

## Concept Unit: reading a file's bytes as text

### The Problem

`/files` from Lesson 2 can tell you a file exists. It can't show you
what's *in* it. Turning a file's bytes into displayable text sounds
trivial — call a method and done — but it depends on which text encoding
those bytes were actually written in, and guessing wrong doesn't always
announce itself as a failure.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add.
- **Location** — a new `@app.get("/file")` route function, added after
  `list_files`.
- **Dependencies** — `CONTENT_DIR`, `HTTPException` from Lesson 2.

### The New Code — type this

```python
@app.get("/file")
def read_file(path: str = ""):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    try:
        content = target_file.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File is not readable as text")

    return {"path": path, "content": content}
```

### The Updated Project — where this lives

This is a complete, freestanding new function, added after `list_files` —
nothing existing is being modified, so there's no enclosing structure to
place it inside of; the block above is everything there is to see. No
import changes either: `HTTPException` and `CONTENT_DIR` are both already
in scope from Lesson 2.

### Mechanical Walkthrough

The first two checks are the traversal guard and `is_file()` — the
`is_dir()` counterpart from Lesson 2, catching the opposite case: a real
folder isn't a file. `read_text(encoding="utf-8")` is a `Path` method
that opens the file, reads its full contents, and decodes those bytes
into a Python string according to the named encoding. The `try`/`except`
around it is the exact shape from this lesson's first concept lab —
`except UnicodeDecodeError` in place of `except ZeroDivisionError`,
`raise HTTPException(...)` in place of `return None`.

### CS Lens

`read_text()` with no `encoding` argument at all does not default to
UTF-8 — it defaults to whatever encoding the operating system itself
prefers. That default can decode almost *any* byte sequence into *some*
string rather than failing outright, meaning a non-text file read without
`encoding="utf-8"` can come back as silently garbled text with a normal
success response — no error, no warning. Pinning `encoding="utf-8"`
explicitly is what turns that into a loud, specific, catchable failure
instead.

### SE Lens

This is a concrete case of a general risk: relying on an implicit,
environment-dependent default for something correctness actually depends
on. The exact same code, unpinned, could behave differently on a
different operating system — "works on my machine" would stop meaning
anything portable. The `try`/`except` is what turns the now-loud failure
into a clean `400` instead of a raw, unhelpful `500`.

### Run It

```
GET /file?path=intro.txt → {"path":"intro.txt","content":"This is intro.txt, served straight from the backend's content folder.\n"}
GET /file?path=lessons  (a folder, not a file) → 404 {"detail":"File not found"}
```

Confirmed directly, alongside the traversal check from Lesson 2 still
rejecting `path=../main.py` with `400` on this same route.

---

## Concept Unit: validating a request body, not just a query string

### The Problem

Saving a file means accepting new content from the frontend as an HTTP
request body — and trusting that whatever arrives is actually a string
before writing it to disk.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add.
- **Location** — `from pydantic import BaseModel` added as a new import;
  a `FileEdit` class added directly below `app = FastAPI()`; a new
  `@app.put("/file")` route added after `read_file`.
- **Dependencies** — `pydantic`, already installed as a `fastapi`
  dependency since Lesson 1's `pip install`.

### The New Code — type this

```python
from pydantic import BaseModel

class FileEdit(BaseModel):
    content: str


@app.put("/file")
def write_file(path: str, edit: FileEdit):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    target_file.write_text(edit.content, encoding="utf-8")
    return {"path": path, "saved": True}
```

### The Updated Project — where this lives

The import needs to land among the existing ones; see it in place:

```python
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel          # ← new

app = FastAPI()


class FileEdit(BaseModel):              # ← new
    content: str                        # ← new


CONTENT_DIR = (Path(__file__).parent / "content").resolve()
```

Everything below `CONTENT_DIR` — `app.add_middleware(...)`, `health_check`,
`list_files`, `read_file` — is unchanged and omitted here since none of
it is touched by this unit; `write_file` itself is a complete, freestanding
new function, added after `read_file`, with nothing existing to show it
enclosed inside of:

```python
@app.put("/file")
def write_file(path: str, edit: FileEdit):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    target_file.write_text(edit.content, encoding="utf-8")
    return {"path": path, "saved": True}
```

### Mechanical Walkthrough

`@app.put(...)` is the first route in this project using a decorator
other than `@app.get` — FastAPI provides one per HTTP method. `path: str`
is inferred as a query parameter exactly as in every earlier route;
`edit: FileEdit`, typed as a `BaseModel` subclass instead of a plain
type, is inferred completely differently: FastAPI parses the request's
JSON body and constructs a `FileEdit` from it automatically — the same
construction step just demonstrated with `Dog`, except an invalid body
here doesn't crash the program; FastAPI catches that `ValidationError`
itself and returns a `422` before `write_file`'s own code ever runs.
`edit.content` reads the validated string back out. `write_text()` is
`read_text()`'s direct counterpart, same `encoding="utf-8")` reasoning,
writing instead of reading.

### SE Lens

`GET` routes in this project only ever read — nothing about calling one
twice changes anything. `PUT` is different by convention: it means
"replace whatever's at this location with exactly this content" — calling
it twice with the same body leaves the file in the same end state either
way, a property called **idempotence**. That's a deliberate, meaningful
signal to anyone reading this API's routes, not an arbitrary word choice.

### Run It

```
GET /file?path=lessons/lesson2.txt        → content: ""
PUT /file?path=lessons/lesson2.txt  body={"content":"Edited via PUT.\nSecond line.\n"} → {"saved":true}
GET /file?path=lessons/lesson2.txt        → content: "Edited via PUT.\nSecond line.\n"
PUT /file?path=../evil.txt          body={"content":"pwned"} → 400 {"detail":"Invalid path"}
```

Confirmed directly: the edit genuinely persisted to disk, and the
traversal check from Lesson 2 protects the write path too, not just
reads.

---

## Concept Unit: a text box you can actually type in

### The Problem

Nothing in the sidebar or main pane so far can be edited — everything
displayed has been read-only.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — replace/add. `<h1>Code Editor</h1><p>Click a
  file...</p>` is replaced with an `id`-tagged heading, a `<textarea>`,
  and a Save button/status row; a new `#file-content` rule is added to
  the existing `<style>` block from Lesson 2.
- **Dependencies** — the `/file` routes above.

### The New Code — type this

```html
<h1 id="file-title">Code Editor</h1>
<textarea id="file-content">Click a file in the sidebar to open it.</textarea>
<div>
    <button id="save-button" style="display: none;">Save</button>
    <span id="save-status"></span>
</div>
```

That markup alone would render with the browser's unstyled default
`<textarea>` sizing — small, proportional-font, nothing like a code
editor. The rule below is what actually makes it look and behave like
one:

```css
#file-content {
    width: 100%;
    height: 400px;
    box-sizing: border-box;
    font-family: monospace;
    font-size: 14px;
    padding: 8px;
}
```

### The Updated Project — where this lives

The CSS rule joins the existing `<style>` block from Lesson 2; see the
whole block, not a simplified stand-in for it:

```html
<style>
    body {
        margin: 0;
    }
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
    #file-content {                     /* ← new */
        width: 100%;                    /* ← new */
        height: 400px;                  /* ← new */
        box-sizing: border-box;         /* ← new */
        font-family: monospace;         /* ← new */
        font-size: 14px;                /* ← new */
        padding: 8px;                   /* ← new */
    }                                    /* ← new */
</style>
```

And the `<h1>`/`<textarea>`/button row replaces Lesson 2's placeholder
text inside `.main-content`:

```html
<div class="main-content">
    <h1 id="file-title">Code Editor</h1>                                          <!-- ← changed -->
    <textarea id="file-content">Click a file in the sidebar to open it.</textarea>  <!-- ← new -->
    <div>                                                                          <!-- ← new -->
        <button id="save-button" style="display: none;">Save</button>             <!-- ← new -->
        <span id="save-status"></span>                                            <!-- ← new -->
    </div>                                                                         <!-- ← new -->
</div>
```

`.main-content` itself — the `flex: 1` pane from Lesson 2 — is unchanged;
only what's inside it is replaced. Lesson 2's `<p>Click a file in the
sidebar to open it.</p>` is gone entirely; that same instruction now
lives as the `<textarea>`'s starting text instead.

### Mechanical Walkthrough

`<textarea>` is an editable multi-line text input — unlike every element
used so far (`<p>`, `<h1>`, `<li>`), its content isn't set through
`.textContent`; it's read and written through a separate `.value`
property, since a `<textarea>` has a live, user-editable value distinct
from its initial markup content. `style="display: none;"` on the button
hides it by default — inline CSS set directly in the HTML, hiding the
Save button until a real file is loaded, since there's nothing to save
against yet. The `#file-content` rule sizes the `<textarea>` to fill the
available width and a fixed `400px` height; `box-sizing: border-box` is
the same property from Lesson 2's sidebar, doing the same job — keeping
`padding` inside the declared width instead of adding to it.
`font-family: monospace` is worth a real reason, not just a look: every
character in a monospace font occupies the same width, which is what
makes indentation and column alignment in code actually line up —
proportional fonts (the default for `<p>`, `<h1>`, everywhere else on
this page) don't guarantee that.

---

## Concept Unit: loading a file into the editor

### The Problem

Clicking a file needs to fetch its content and put it somewhere editable.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new `loadFile` function inside the existing
  `<script>` block, placed near `loadFolder`.
- **Dependencies** — the `/file` GET route, the `<textarea>` above.

### The New Code — type this

```javascript
function loadFile(path) {
    fetch("http://127.0.0.1:8000/file?path=" + encodeURIComponent(path))
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("file-title").textContent = data.path;
            document.getElementById("file-content").value = data.content;
            document.getElementById("save-button").style.display = "inline-block";
            document.getElementById("save-status").textContent = "";
        })
        .catch((error) => {
            document.getElementById("file-content").value = "Could not load file.";
        });
}
```

### The Updated Project — where this lives

This is a complete, freestanding new function, placed in the `<script>`
block near `loadFolder` from Lesson 2 — nothing existing is modified, so
there's no enclosing structure to show it inside of; the block above is
everything there is to see. It isn't called by anything yet — the next
unit wires a click to it.

### Mechanical Walkthrough

This has the exact same shape as `loadFolder` from Lesson 2 — `fetch` →
parse JSON → update the DOM → `.catch()` a fallback — the same repeatable
pattern, assembled again rather than reinvented. `.value = data.content`
is new specifically because `<textarea>` needs `.value`, not
`.textContent`, as covered in the previous unit. `.style.display =
"inline-block"` is the first time this project sets a style property
directly from JavaScript, rather than toggling a CSS class the way
`item.className = "clickable"` did in Lesson 2 — a reasonable choice here
since this is a plain on/off switch on one specific element, not a
reusable rule worth a class.

---

## Concept Unit: deciding which function a click should call

### The Problem

A click on a file entry needs to open it in the editor; a click on a
folder entry needs to navigate — the same click handler code from Lesson
2 needs to now choose between two different outcomes.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — refactor. `renderFileList`'s `if (entry.is_directory)`
  block, which previously only handled folders, gains an `else` branch
  calling `loadFile`.
- **Dependencies** — `loadFile` from the previous unit.

### The New Code — type this

```javascript
} else {
    item.addEventListener("click", () => {
        loadFile(entryPath);
    });
}
```

### The Updated Project — where this lives

This lands inside `renderFileList`'s `forEach`, from Lesson 2 — the
`if (entry.is_directory) { ... }` block that previously only handled
folders gains the `else` branch above it:

```javascript
entries.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry.is_directory ? entry.name + "/" : entry.name;

    const entryPath = currentPath === "" ? entry.name : currentPath + "/" + entry.name;
    item.className = "clickable";

    if (entry.is_directory) {
        item.addEventListener("click", () => {
            loadFolder(entryPath);
        });
    } else {                                              // ← new
        item.addEventListener("click", () => {             // ← new
            loadFile(entryPath);                            // ← new
        });                                                  // ← new
    }                                                         // ← new

    list.appendChild(item);
});
```

Every entry in the sidebar is now fully wired: a folder's click handler
still calls `loadFolder`, exactly as in Lesson 2, and a file's click
handler — new as of this unit — calls `loadFile` instead. Nothing else
in `renderFileList` changes.

### Mechanical Walkthrough

`if (entry.is_directory) { ... }` and the single boolean condition it
tests are both reused from Lesson 2's ternary unit, where an `if`/`else`
was already shown as the illustrative equivalent of a ternary — this is
that same construct's first real appearance in the running project,
worth a clause even though the syntax itself isn't new: `else` runs
exactly when the `if`'s condition is `false`, never both, never neither.
The two `addEventListener("click", () => { ... })` calls inside each
branch are the same event-registration shape from Lesson 2, reused
unchanged — only which function the arrow function calls differs between
the two branches.

### CS Lens

`entry.is_directory` — one boolean already present in the data the
backend sent — decides which of two functions actually runs. Both
branches reuse `entryPath`, already computed once above this `if`,
because both outcomes need it identically; only which function receives
it differs.

---

## Concept Unit: sending a body, not just a URL

### The Problem

Saving needs to send the edited text back to the backend as a `PUT`
request with a JSON body — every earlier `fetch` call in this project has
only ever sent a URL.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new `saveFile` function, plus one
  `addEventListener` call wiring the Save button to it, placed near the
  end of the `<script>` block.
- **Dependencies** — the `/file` PUT route, `loadFile`.

### The New Code — type this

```javascript
function saveFile() {
    const path = document.getElementById("file-title").textContent;
    const content = document.getElementById("file-content").value;

    fetch("http://127.0.0.1:8000/file?path=" + encodeURIComponent(path), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content }),
    })
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("save-status").textContent = "Saved.";
        })
        .catch((error) => {
            document.getElementById("save-status").textContent = "Could not save.";
        });
}

document.getElementById("save-button").addEventListener("click", saveFile);
```

### The Updated Project — where this lives

`saveFile` is a complete, freestanding new function, placed near
`loadFile` — nothing existing is modified, so there's no enclosing
structure to show it inside of; the block above is everything there is
to see. The `addEventListener` line beneath it runs immediately, at
script load, the same way `loadFolder("")` does at the very bottom of
the file — it's what actually connects the Save button to `saveFile`.

### Mechanical Walkthrough

Every earlier `fetch` call took a single argument, a URL, and defaulted
to `GET` with no body. This one passes a second argument: an **options
object** — the first JavaScript object literal (`{ ... }` with
`key: value` pairs) this project has written, as opposed to a JSON
string received *from* one. `method: "PUT"` overrides the default.
`headers: { "Content-Type": "application/json" }` tells the server what
kind of data the body contains — the same header name the backend has
been sending back all along, now being set manually from the sending
side. `const path = ...textContent` and `const content = ...value` are
both *reading* `.textContent`/`.value` rather than assigning to them, as
every earlier use of both properties has — the same properties, used in
the other direction, still just a property read. `document.getElementById(
"save-button").addEventListener("click", saveFile)` reuses the same
event-registration shape from Lesson 2, but hands `addEventListener` an
existing named function by reference (`saveFile`) instead of defining a
new arrow function inline, as every earlier `addEventListener` call has
— possible because a function, once declared, is itself just a value
that can be passed around like any other.

### CS Lens — the missing mirror operation

`response.json()` has appeared in every fetch call so far: it takes a
raw JSON *string* and turns it into a real JavaScript object. `body:`
requires the *opposite* direction — `fetch` needs an actual string to
send, not a live object. `JSON.stringify({ content: content })` performs
that conversion: object in, JSON text out. **Serialization** (object →
text) and **deserialization** (text → object) are two names for opposite
ends of the same problem — every route in this project has been doing
deserialization on the way in and serialization on the way out this
whole time; this is the first time the frontend has had to do the
serialization half itself.

---

## Connect the pieces

```
Click a file → dispatch on is_directory → loadFile(entryPath)
              ↓
GET /file?path=... → traversal check → is_file check → read_text(encoding="utf-8")
              ↓
Success: textarea filled via .value, Save button shown
   — or —
Non-text file: UnicodeDecodeError caught → 400 returned instead

Click Save → saveFile()
              ↓
JSON.stringify({ content: textarea.value }) → PUT /file, body attached
              ↓
FastAPI parses body → constructs FileEdit (422 here if malformed, like bad_dog)
              ↓
write_file(): same checks → write_text(edit.content, encoding="utf-8")
              ↓
{"saved": true} returned → save-status shows "Saved."
```

## What breaks without this

Already demonstrated concretely above, not hypothetically: without
`encoding="utf-8"`, a non-text file can produce silently garbled content
with a `200 OK` status instead of a clean error. With the encoding pinned
but no `try`/`except`, the same file instead produces a generic,
unhelpful `500`. Only both pieces together produce the clean `400` shown
above.

## Exercises

1. Edit a file through the running app, refresh the whole page, and open
   that file again — confirm the change survived.
2. In the Pydantic lab, add `is_good_boy: bool` to `Dog`, construct one
   with `is_good_boy="yes"` (a string), and read what `ValidationError`
   says about it.
3. Temporarily remove `encoding="utf-8"` from `read_file` and try opening
   a non-text file — expect silently wrong output instead of a clean
   error; put it back afterward.

## Definition of done

- [ ] You've opened, edited, and saved a real file, and confirmed the
      change survived a page refresh
- [ ] You can explain what `except UnicodeDecodeError` catches and why
      pinning the encoding matters
- [ ] You can explain what `class FileEdit(BaseModel):` buys you over a
      plain dictionary
- [ ] You can explain the relationship between `JSON.stringify` and
      `response.json()`
- [ ] You can explain idempotence and why it applies to `PUT` here
- [ ] `git commit` this lesson's code with a message explaining why

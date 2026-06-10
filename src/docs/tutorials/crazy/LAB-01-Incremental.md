# G-Code Analyzer — LAB 01 — Your First Full-Stack App
### The Incremental Version — Build It Piece by Piece

**The rule for this lab:** Every step ends with you running something and seeing it work.
If something breaks, you added at most 5–10 lines since the last working state.
That's where the bug is. Nowhere else.

---

> **Quick Check — try to answer before reading further:**
>
> 1. When you visit a website, your browser and a server are talking. Who speaks first — the browser or the server?
> 2. A Python script normally ends when it finishes running. If a server is a Python script, why doesn't it end immediately?
> 3. What do you think "parsing" means? (Just guess — no looking it up.)
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab you will have this working in your browser:

```
┌─────────────────────────────────────────────────────┐
│  ▸ G-CODE ANALYZER                                  │
│                                                     │
│  [ Choose G-code File ]   test.nc                   │
│                                                     │
│  [ Analyze ]                                        │
│                                                     │
│  Analysis Results                                   │
│  ─────────────────────────────────────────────────  │
│  File                     test.nc                   │
│  Total lines              27                        │
│  G-code commands          12                        │
│  M-code commands          4                         │
│  Comments                 5                         │
│  Empty lines              4                         │
│                                                     │
│  Unique G-codes found                               │
│  [ G00 ] [ G01 ] [ G17 ] [ G20 ] [ G90 ]           │
└─────────────────────────────────────────────────────┘
```

You click Analyze. Your browser sends the file to Python.
Python reads and counts it. The numbers appear on your screen.
That loop — browser → server → browser — is the core of every web app ever built.

---

## The Big Picture Before Any Code

You are building two separate programs that talk to each other:

```
YOUR COMPUTER
┌─────────────────────────────────────────────────────┐
│                                                     │
│   PROGRAM 1: The Browser                            │
│   ┌───────────────────┐                             │
│   │  index.html       │  ← you will write this     │
│   │  (what you see)   │                             │
│   └────────┬──────────┘                             │
│            │  sends file over HTTP                  │
│            ▼                                        │
│   PROGRAM 2: Python Server                          │
│   ┌───────────────────┐                             │
│   │  main.py          │  ← you will write this      │
│   │  (does the work)  │                             │
│   └───────────────────┘                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

They can't share variables or memory — they're separate programs.
The only way they exchange data is by sending messages (HTTP requests and responses).
JSON is the format of those messages.

You will build Program 2 (the Python server) first, confirm it works on its own,
then build Program 1 (the browser page) and connect them.

---

## PART 1 — The Terminal

The terminal is a text interface to your computer. Instead of clicking icons,
you type commands. Servers are started, packages are installed, and files are
created here.

Open your terminal. On Windows this is "Command Prompt" or "PowerShell."
On Mac it is "Terminal."

You will see a prompt — a line ending in `>` or `$` waiting for you to type.

### The commands you will use (and what they actually do)

```
pwd          — "print working directory" — shows where you are right now
ls           — "list" — shows files and folders in the current location  
cd name      — "change directory" — move into a folder called "name"
cd ..        — go UP one folder (two dots = parent folder)
mkdir name   — "make directory" — create a new folder called "name"
```

### SAVE AND TRY

Type this and press Enter:
```
pwd
```

**You should see:** A path like `/Users/yourname` or `C:\Users\yourname`
That is where you are right now in the file system.

Type this:
```
ls
```

**You should see:** The files and folders in your current location —
same as what you'd see if you opened your file browser.

**Change something:** Type `ls -la` instead. You see much more detail —
file sizes, dates, permissions. The `-la` part is called a "flag" — extra
instructions that change how a command behaves. Type just `ls` again.

---

## PART 2 — Create the Project

### Step 1 — Make the folder structure

Type these commands one at a time, pressing Enter after each:

```bash
mkdir gcode-analyzer
cd gcode-analyzer
mkdir backend
mkdir frontend
```

**What you just did:**
- `mkdir gcode-analyzer` — created a folder called gcode-analyzer
- `cd gcode-analyzer` — moved into it (you are now "inside" this folder)
- `mkdir backend` — created a subfolder for the Python server
- `mkdir frontend` — created a subfolder for the browser page

### SAVE AND TRY

```bash
ls
```

**You should see:**
```
backend    frontend
```

Two folders. Nothing inside them yet. Your project skeleton exists.

---

### Step 2 — Move into the backend folder

```bash
cd backend
```

**Check where you are:**
```bash
pwd
```

**You should see** a path ending in `/gcode-analyzer/backend` (or `\gcode-analyzer\backend` on Windows).

---

## PART 3 — Python Setup

### Concept: Virtual Environments

**What it is:** An isolated copy of Python just for this project.

**Why it matters:** When you install Python packages (extra libraries written by others),
they normally install globally — for ALL Python programs on your computer.
If two projects need different versions of the same library, they conflict.

A virtual environment solves this by creating a private, separate Python
installation that belongs only to this project. Packages installed here
don't affect anything else on your computer.

**The analogy:** Think of different workbenches in a workshop. Each workbench has
its own set of tools. Adding a tool to Workbench A doesn't affect Workbench B.

### Step 3 — Create and activate the virtual environment

**Create it:**
```bash
python -m venv venv
```

Breaking this down:
- `python` — run Python
- `-m venv` — using the built-in module called "venv"
- `venv` (the second one) — the name of the folder to create. Convention is to name it "venv."

**You should see:** Nothing — it just creates the folder silently.
Run `ls` and you'll see a new `venv` folder appeared inside `backend`.

**Activate it (Mac/Linux):**
```bash
source venv/bin/activate
```

**Activate it (Windows):**
```bash
venv\Scripts\activate
```

### SAVE AND TRY

Look at your terminal prompt.

**You should see:** `(venv)` at the beginning of your prompt, like:
```
(venv) yourname@computer backend %
```

That `(venv)` means: "I am inside the virtual environment. Any packages I install
go here, not globally."

**⚠️ Important:** Every time you open a NEW terminal to work on this project,
you must activate the environment again. If you see errors like "package not found,"
the first thing to check is: does my prompt show `(venv)`?

---

### Step 4 — Install the packages you need

```bash
pip install fastapi uvicorn python-multipart
```

**What each one does:**

- `fastapi` — the web framework. It handles HTTP for you — receiving requests,
  routing them to the right function, sending responses. Without it, you'd have to
  write all that HTTP machinery yourself from scratch.

- `uvicorn` — the server runner. FastAPI is just a Python library — it can't
  listen on a network port by itself. Uvicorn is the program that actually starts
  listening and feeds incoming requests into FastAPI.

- `python-multipart` — lets FastAPI receive file uploads. Without it, the file
  your browser sends would be silently ignored.

### SAVE AND TRY

```bash
pip list
```

**You should see** a list that includes fastapi, uvicorn, and python-multipart
(plus many dependencies they brought along automatically).

---

## PART 4 — Build the Server, Piece by Piece

### Concept: What a Server Actually Is

A server is a program that:
1. Starts up and binds to a **port** (a numbered "door" on your computer — you'll use 8000)
2. Sits in an infinite loop, waiting
3. When a request arrives, runs the right function and sends back a response
4. Goes back to waiting

It never stops on its own — it waits until you press Ctrl+C.

### Concept: HTTP Routes

A route is a rule: "when a request arrives at THIS path using THIS method, run THIS function."

Example:
```
POST request to /analyze  →  run the analyze_file function
GET  request to /         →  run the root function
```

In FastAPI, you attach a function to a route using a **decorator** — a line starting with `@`
that goes directly above the function.

### Step 5 — The Simplest Possible Server (4 lines)

Create a new file. In your terminal, while still in the `backend` folder:

**On Mac/Linux:**
```bash
touch main.py
```

**On Windows:**
```bash
type nul > main.py
```

Now open `main.py` in any text editor (VS Code, Notepad, anything).

Type this — exactly this, nothing more:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"status": "server is alive"}
```

Save the file.

**What each line does:**
- `from fastapi import FastAPI` — bring the FastAPI class into this file
- `app = FastAPI()` — create the application object. All routes attach to `app`.
- `@app.get("/")` — decorator: "when a GET request arrives at `/`, run the function below"
- `async def root():` — the function that runs (async means it can handle many requests at once)
- `return {"status": "server is alive"}` — FastAPI converts this dict to JSON automatically

### SAVE AND TRY

In your terminal:
```bash
uvicorn main:app --reload
```

Breaking this down:
- `uvicorn` — start the uvicorn server runner
- `main:app` — find the file `main.py`, look for a variable called `app` inside it
- `--reload` — watch for file changes and restart automatically (useful while developing)

**You should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

Open your browser and go to: `http://localhost:8000`

**You should see in the browser:**
```json
{"status":"server is alive"}
```

That JSON came from your Python function. Four lines of Python and you have a
working server on your computer.

**Now go to:** `http://localhost:8000/docs`

**You should see:** A documentation page FastAPI generates automatically.
It shows your `/` route. Later you'll test the `/analyze` route here.

**Change something:** Change `"server is alive"` to `"hello from Python"`.
Save the file. Because `--reload` is on, the server restarts automatically.
Refresh the browser — you see the new message immediately.
Change it back to `"server is alive"`.

---

### Concept: CORS — Why Browsers Block Requests

When your browser page (on port 3000 or opened as a file) tries to talk to your
server (on port 8000), the browser blocks it by default with an error like:

```
Access to fetch at 'http://localhost:8000/analyze' has been blocked by CORS policy
```

**Why:** Browsers have a security rule called CORS (Cross-Origin Resource Sharing).
It prevents JavaScript on one website from secretly making requests to a different
website. Without it, a malicious site could make requests to your bank using your cookies.

**The fix:** Tell your server to explicitly say "I accept requests from other origins."
The browser sees this permission and allows the request.

### Step 6 — Add CORS permission to the server

Press Ctrl+C to stop the server. Open `main.py`.

Add the two highlighted sections (the lines marked with `← ADD`):

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware    # ← ADD this import

app = FastAPI()

app.add_middleware(                  # ← ADD these 5 lines
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "server is alive"}
```

**What `allow_origins=["*"]` means:** Accept requests from ANY origin.
The `*` is a wildcard meaning "everything." This is fine for local development —
in a real deployed app you'd list specific allowed origins for security.

### SAVE AND TRY

```bash
uvicorn main:app --reload
```

Go to `http://localhost:8000` — still works exactly the same.
The CORS change is invisible from the browser directly — it only affects requests
made by JavaScript code on OTHER pages. You'll see it matter when the HTML page
tries to call the server in Part 5.

---

### Concept: Parsing

**What it is:** Taking raw text that has a structure, reading it, and extracting
meaningful data from it.

**The problem:** A G-code file is just text. `G01 X10.5 Y20.3 F150` is just
characters. The computer doesn't inherently know this means "move in a straight
line to those coordinates at that feed rate." Parsing is imposing meaning on characters.

**How it works for G-code:** Read the file one line at a time.
For each line, ask: does it start with G? With M? With `(`? Is it empty?
Each answer tells you what kind of line it is.

**The classification rules:**

| Line starts with | Type | Example |
|-----------------|------|---------|
| Empty / blank | Empty line | *(nothing)* |
| `(` or `;` | Comment | `(PROGRAM: PART-001)` |
| `G` (any case) | G-code command | `G01 X10 Y20` |
| `M` (any case) | M-code command | `M03 S1000` |
| Anything else | Other | `T01 M06` |

### Step 7 — Add the parser function

Stop the server (Ctrl+C). Open `main.py`. Add the `parse_gcode` function.
**Add it between the middleware and the `@app.get("/")` line.**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ↓ ADD EVERYTHING FROM HERE ↓

def parse_gcode(content: str) -> dict:
    lines = content.splitlines()
    # splitlines() splits on \n, \r\n, or \r — handles all operating systems

    total_lines = len(lines)
    gcode_count = 0
    mcode_count = 0
    comment_count = 0
    empty_count = 0
    other_count = 0
    gcode_types = set()
    # set() stores items with no duplicates — G01 only stored once even if it appears 50 times

    for line in lines:
        stripped = line.strip()
        # .strip() removes spaces/tabs from both ends — "  G01  " becomes "G01"

        if stripped == "":
            empty_count += 1

        elif stripped.startswith("(") or stripped.startswith(";"):
            comment_count += 1

        elif stripped.upper().startswith("G"):
            # .upper() makes it case-insensitive — g01 and G01 both match
            gcode_count += 1
            first_word = stripped.split()[0].upper()
            # .split() breaks on spaces: "G01 X10 Y20" → ["G01", "X10", "Y20"]
            # [0] gets the first word: "G01"
            gcode_types.add(first_word)

        elif stripped.upper().startswith("M"):
            mcode_count += 1

        else:
            other_count += 1

    return {
        "total_lines": total_lines,
        "gcode_commands": gcode_count,
        "mcode_commands": mcode_count,
        "comments": comment_count,
        "empty_lines": empty_count,
        "other_lines": other_count,
        "unique_gcodes": sorted(list(gcode_types)),
        # sorted() → alphabetical order
        # list() → converts set to list so JSON can handle it (JSON can't serialize a set)
    }

# ↑ ADD EVERYTHING TO HERE ↑


@app.get("/")
async def root():
    return {"status": "server is alive"}
```

### SAVE AND TRY — Test the parser directly in Python

Before adding the HTTP route, test the parser on its own.
Open a **second terminal** (keep the first one free for the server later).
Navigate to your backend folder and activate the virtual environment.

Then start Python interactively:
```bash
python
```

You should see `>>>` — the Python interactive prompt. Type these lines:

```python
from main import parse_gcode
result = parse_gcode("G01 X10\nG00 Y5\n(comment)\n\nM03")
print(result)
```

**You should see:**
```python
{'total_lines': 5, 'gcode_commands': 2, 'mcode_commands': 1, 'comments': 1,
 'empty_lines': 1, 'other_lines': 0, 'unique_gcodes': ['G00', 'G01']}
```

The parser works — and you confirmed it WITHOUT running a server, WITHOUT a browser,
WITHOUT a file. You tested the logic in isolation. When something breaks later,
you'll know the parser itself is not the problem.

Type `exit()` to leave the Python prompt.

---

### Concept: `async def` and `await`

**What it is:** A way to write code that can pause while waiting for something
slow (like reading a file), letting other code run in the meantime.

**Why servers use it:** A server might receive many requests at the same time.
If handling one request takes 2 seconds (waiting for a database), a non-async
server makes every other request wait those 2 seconds. An async server can
work on other requests while waiting.

**The keywords:**
- `async def` — marks a function as asynchronous
- `await` — pauses THIS function until the slow operation finishes, but lets other code run

**The analogy:** A waiter who takes your order to the kitchen, then takes another
table's order while YOUR food is being cooked — instead of standing at the kitchen
window staring at your food cook.

### Step 8 — Add the `/analyze` route

This is the route that receives the uploaded file, runs the parser, and returns results.

Open `main.py`. Add the new route at the bottom:

```python
from fastapi import FastAPI, File, UploadFile    # ← CHANGE: add File and UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def parse_gcode(content: str) -> dict:
    lines = content.splitlines()
    total_lines = len(lines)
    gcode_count = 0
    mcode_count = 0
    comment_count = 0
    empty_count = 0
    other_count = 0
    gcode_types = set()

    for line in lines:
        stripped = line.strip()
        if stripped == "":
            empty_count += 1
        elif stripped.startswith("(") or stripped.startswith(";"):
            comment_count += 1
        elif stripped.upper().startswith("G"):
            gcode_count += 1
            first_word = stripped.split()[0].upper()
            gcode_types.add(first_word)
        elif stripped.upper().startswith("M"):
            mcode_count += 1
        else:
            other_count += 1

    return {
        "total_lines": total_lines,
        "gcode_commands": gcode_count,
        "mcode_commands": mcode_count,
        "comments": comment_count,
        "empty_lines": empty_count,
        "other_lines": other_count,
        "unique_gcodes": sorted(list(gcode_types)),
    }


@app.get("/")
async def root():
    return {"status": "server is alive"}


# ↓ ADD FROM HERE ↓

@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    # UploadFile — the type FastAPI uses for uploaded files
    # File(...) — tells FastAPI this parameter is required (the ... means required)

    raw_bytes = await file.read()
    # await — pause here until the file bytes are fully read
    # file.read() returns the raw bytes of the file

    content = raw_bytes.decode("utf-8", errors="ignore")
    # .decode() converts bytes → string
    # "utf-8" — the encoding (G-code files are plain text, utf-8 covers it)
    # errors="ignore" — skip any bytes that aren't valid utf-8 (rare, but safe)

    result = parse_gcode(content)
    result["filename"] = file.filename
    # add the filename so the browser can display it

    return result
    # FastAPI automatically converts this dict to JSON

# ↑ ADD TO HERE ↑
```

### SAVE AND TRY — Test with the interactive docs

Start the server:
```bash
uvicorn main:app --reload
```

Go to `http://localhost:8000/docs` in your browser.

You should see TWO routes now:
- `GET /` — the health check
- `POST /analyze` — the new route

**Test the `/analyze` route without a browser page:**

1. Create a small test file. Open Notepad/TextEdit and save a file called `test.nc` with these contents:

```
(TEST PROGRAM)
G00 X0 Y0
G01 X10 F100
M03 S1000

G01 Y10
M30
```

2. In the docs page, click on `POST /analyze`
3. Click "Try it out"
4. Click "Choose File" and select your `test.nc`
5. Click "Execute"

**You should see** a response like:
```json
{
  "total_lines": 7,
  "gcode_commands": 3,
  "mcode_commands": 2,
  "comments": 1,
  "empty_lines": 1,
  "other_lines": 0,
  "unique_gcodes": ["G00", "G01"],
  "filename": "test.nc"
}
```

The server is receiving a file, parsing it, and returning JSON.
This is the complete backend — working and tested — before you've written
a single line of frontend code.

**Change something:** Add a line to `test.nc` that starts with `T01` (a tool call).
Re-upload in the docs. The `other_lines` count goes from 0 to 1. Change it back.

---

## PART 5 — Build the Frontend, Piece by Piece

Open a new terminal. Navigate to your `frontend` folder:
```bash
cd gcode-analyzer/frontend
```

Keep the Python server running in the other terminal — you need both.

### Step 9 — The Bare HTML Skeleton

Create `index.html` in the `frontend` folder. Open it in your text editor.

Type this — exactly this:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>G-Code Analyzer</title>
</head>
<body>

    <h1>G-CODE ANALYZER</h1>

    <input type="file" id="fileInput">
    <button id="analyzeBtn">Analyze</button>

    <div id="results"></div>

</body>
</html>
```

**What each piece is:**
- `<!DOCTYPE html>` — tells the browser: use modern HTML5 rules
- `<head>` — invisible metadata the browser needs
- `<body>` — everything the user actually sees
- `<input type="file">` — the file picker
- `<button>` — the button
- `<div id="results">` — empty box where results will appear later

### CSS AND SEE

Double-click `index.html` to open it in your browser.
(You don't need the server for this — it's just HTML.)

**You should see:**
- Plain white page
- "G-CODE ANALYZER" as a large heading
- A "Choose File" button (the browser's default style)
- An "Analyze" button
- Nothing else

Ugly — but it's structure. Everything is there. Now you add style.

---

### Step 10 — Add CSS

Inside the `<head>` block, after the `<title>` line, add a `<style>` block:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>G-Code Analyzer</title>

    <style>                               <!-- ← ADD from here -->
        body {
            font-family: 'Courier New', monospace;
            background-color: #0d1117;
            color: #c9d1d9;
            padding: 40px;
        }

        h1 {
            color: #58a6ff;
            margin-bottom: 24px;
        }

        button {
            padding: 10px 24px;
            background-color: #1f6feb;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 12px;
        }

        #results {
            margin-top: 24px;
            background-color: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 20px;
        }
    </style>                              <!-- ← ADD to here -->

</head>
<body>
    <h1>G-CODE ANALYZER</h1>
    <input type="file" id="fileInput">
    <button id="analyzeBtn">Analyze</button>
    <div id="results"></div>
</body>
</html>
```

### CSS AND SEE

Save. Refresh the browser (F5).

**You should see:**
- Dark background
- Blue heading
- File input (still browser-default style — you'll improve this later)
- Blue Analyze button
- The `#results` div is invisible — it exists but has no content yet

**Compare:** Same structure as before. The CSS changed the appearance, nothing else.

**Change something:** Change `background-color: #0d1117` to `background-color: #1a0000`.
Save. Refresh. Dark red background. Change it back.

---

### Concept: JavaScript Event Listeners

**What it is:** A way to say "when THIS thing happens, run THIS function."

```javascript
button.addEventListener("click", function() {
    // this runs when the button is clicked
})
```

The function you pass in is called a **callback** — a function you hand to something
else, and that something else calls it when the time is right.

### Step 11 — Add JavaScript: Wire Up the Button

At the bottom of `<body>`, before `</body>`, add a `<script>` block:

```html
    <div id="results"></div>

    <script>                                          <!-- ← ADD from here -->
        const fileInput = document.getElementById("fileInput")
        const analyzeBtn = document.getElementById("analyzeBtn")
        const resultsDiv = document.getElementById("results")
        // getElementById finds an HTML element by its id attribute
        // We grab them once here and reuse throughout the script

        analyzeBtn.addEventListener("click", function() {
            const file = fileInput.files[0]
            // fileInput.files is a list of selected files
            // [0] gets the first (and only) one

            if (!file) {
                resultsDiv.textContent = "Please select a file first."
                return
                // return exits the function immediately — nothing below runs
            }

            resultsDiv.textContent = "File selected: " + file.name
            // .textContent sets the visible text content of the div
        })
    </script>                                         <!-- ← ADD to here -->

</body>
```

### SAVE AND TRY

Save. Refresh the browser.

1. Click "Analyze" WITHOUT selecting a file.
   **You should see:** "Please select a file first." appears in the results area.

2. Click "Choose File", select your `test.nc`, then click "Analyze".
   **You should see:** "File selected: test.nc"

The button works. The file picker works. The JavaScript can read the file name.
The server is not involved yet — you're just confirming the pieces work.

**Change something:** Change `"File selected: "` to `"Ready to analyze: "`.
Save. Refresh. Test again. Change it back.

---

### Concept: `fetch` — How JavaScript Sends HTTP Requests

**What it is:** A browser built-in that sends HTTP requests to a server.

```javascript
const response = await fetch("http://localhost:8000/analyze", {
    method: "POST",
    body: formData
})
const data = await response.json()
```

**`await`:** Pauses the code until the response arrives, then continues.
Without `await`, the code would continue immediately — before the response
arrived — and `response` would be a Promise, not the actual data.

**`FormData`:** A browser built-in for sending form data, including files.
When you send it as the body of a fetch request, the browser handles
setting the correct format headers automatically.

**`try/catch`:** Wraps code that might fail. If anything inside `try`
throws an error, execution jumps immediately to `catch`. This prevents
the entire page from breaking if the server is down.

```javascript
try {
    // code that might fail
} catch (error) {
    // this runs if anything in try threw an error
    console.log(error.message)
}
```

### Step 12 — Connect to the Server

Update the `<script>` block — replace the click handler function:

```html
    <script>
        const fileInput = document.getElementById("fileInput")
        const analyzeBtn = document.getElementById("analyzeBtn")
        const resultsDiv = document.getElementById("results")

        analyzeBtn.addEventListener("click", async function() {
        //                                   ^^^^^ — added async because we use await below

            const file = fileInput.files[0]

            if (!file) {
                resultsDiv.textContent = "Please select a file first."
                return
            }

            resultsDiv.textContent = "Sending to server..."   // ← CHANGED

            try {                                              // ← ADD from here

                const formData = new FormData()
                formData.append("file", file)
                // "file" must match the parameter name in your FastAPI route:
                // async def analyze_file(file: UploadFile = File(...))
                //                        ^^^^  this name

                const response = await fetch("http://localhost:8000/analyze", {
                    method: "POST",
                    body: formData
                })

                const data = await response.json()
                // response.json() reads the response body and parses JSON
                // It also returns a Promise, so we need await

                resultsDiv.textContent = JSON.stringify(data, null, 2)
                // JSON.stringify converts the data object back to a readable string
                // null, 2 means: use 2-space indentation for readability

            } catch (error) {
                resultsDiv.textContent = "Error: " + error.message
            }                                                  // ← ADD to here

        })
    </script>
```

### SAVE AND TRY

Save. Refresh the browser. Make sure your Python server is still running
in the other terminal (you should see `(venv)` and the uvicorn output).

1. Select your `test.nc` file
2. Click Analyze

**You should see** in the results div:
```json
{
  "total_lines": 7,
  "gcode_commands": 3,
  "mcode_commands": 2,
  "comments": 1,
  "empty_lines": 1,
  "other_lines": 0,
  "unique_gcodes": [
    "G00",
    "G01"
  ],
  "filename": "test.nc"
}
```

**This is the full round trip.** Browser → Python → Browser. Working.

**Test the error state:** Stop the Python server (Ctrl+C in that terminal).
Click Analyze again. **You should see:** "Error: Failed to fetch" — the catch
block handled the broken connection. Restart the server.

---

### Step 13 — Display Results Properly

Right now results show as raw JSON. Let's display them as readable rows.

Update only the `displayResults` part of the script — replace just the line
that says `resultsDiv.textContent = JSON.stringify(...)`:

```javascript
                const data = await response.json()

                // ↓ REPLACE the JSON.stringify line with this ↓
                const rows = [
                    ["File", data.filename],
                    ["Total lines", data.total_lines],
                    ["G-code commands", data.gcode_commands],
                    ["M-code commands", data.mcode_commands],
                    ["Comments", data.comments],
                    ["Empty lines", data.empty_lines],
                ]

                const rowsHTML = rows.map(function(row) {
                    return "<div><strong>" + row[0] + ":</strong> " + row[1] + "</div>"
                }).join("")
                // .map() transforms each [label, value] pair into an HTML string
                // .join("") stitches the array of strings into one string

                resultsDiv.innerHTML = rowsHTML
                // .innerHTML sets HTML content (not plain text)
                // ↑ REPLACE to here ↑
```

### SAVE AND TRY

Save. Refresh. Select your file. Click Analyze.

**You should see:**
```
File: test.nc
Total lines: 7
G-code commands: 3
M-code commands: 2
Comments: 1
Empty lines: 1
```

Clean, readable, formatted rows — not raw JSON.

**Change something:** Add a new row to the `rows` array:
```javascript
["Other lines", data.other_lines],
```
Save. Refresh. Analyze. The new row appears. Adding a new stat is one line.

---

## 🎯 Challenge: Show the Unique G-codes

**You know:** `data.unique_gcodes` is an array of strings like `["G00", "G01", "G17"]`.
The `.map()` method transforms each item in an array. `.join()` combines them.

**Task:** Below the stat rows, display the unique G-codes as a comma-separated list
with a label. Example:

```
Unique G-codes: G00, G01, G17
```

**Where to add it:** After `resultsDiv.innerHTML = rowsHTML` — append more HTML to the div.

**Hint:** `resultsDiv.innerHTML += "<div>more content</div>"` adds to what's already there.

Try for at least 5 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```javascript
resultsDiv.innerHTML = rowsHTML

// Add after the rowsHTML line:
if (data.unique_gcodes && data.unique_gcodes.length > 0) {
    const gcodeList = data.unique_gcodes.join(", ")
    resultsDiv.innerHTML += "<div><strong>Unique G-codes:</strong> " + gcodeList + "</div>"
}
```

**Key insight:** `data.unique_gcodes` is already an array — you don't need to loop
it manually. `.join(", ")` handles the comma separation. The `&&` check prevents
an error if the array is empty or missing.

</details>

---

## Final Check

Verify every feature works before moving to Lab 2:

| Feature | How to verify |
|---------|--------------|
| Server starts | Run `uvicorn main:app --reload`, see "Application startup complete" |
| Health check works | Visit `http://localhost:8000` — see `{"status":"server is alive"}` |
| Docs page shows routes | Visit `http://localhost:8000/docs` — see GET / and POST /analyze |
| Parser works in isolation | Open Python interactively, `from main import parse_gcode`, test it |
| File picker opens | Click Choose File — OS file picker opens |
| Analyze sends to server | Select file, click Analyze — results appear |
| Results display as rows | Stats appear as labelled rows, not raw JSON |
| Error state handled | Stop server, click Analyze — "Error: Failed to fetch" appears |

---

## Quick Check Answers

**1. Who speaks first — the browser or the server?**
Always the browser (the client). The server sits and waits — it never initiates
contact. When you clicked "Analyze," your browser sent a POST request to the server.
The server was already waiting. It only responded after the browser spoke first.
This is the fundamental rule of client-server: clients request, servers respond.

**2. Why doesn't the server stop immediately?**
Because uvicorn runs an infinite loop — it binds to port 8000 and keeps listening
forever, handling requests as they arrive. It only exits when you press Ctrl+C.
The Python script never reaches its "end" because it's designed to loop indefinitely.

**3. What does "parsing" mean?**
Taking raw text that has a structure or format, reading it according to the rules
of that format, and extracting meaningful data from it. Your `parse_gcode` function
reads raw text like `"G01 X10 Y20"`, applies the rule "starts with G = a G-code
command," and produces structured data (gcode_count goes up, "G01" stored in the set).
Raw characters became structured information.

---

## What's Next — Lab 02

Lab 1 gave you the core cycle: browser → server → browser. Working. Tested. Understood.

In Lab 2 you will:
- Replace the plain HTML page with **React** — and understand exactly WHY React
  is better than what you just built (you'll feel the pain of `innerHTML` first)
- Add **TypeScript** — a version of JavaScript that catches mistakes before you run
- See how React manages state (the file, the results, the loading status) differently
  from manually updating divs

The Python backend stays exactly as-is. The frontend gets rebuilt — and you'll
understand every decision because you built the manual version first.

---

*Lab 01 complete. You built a working full-stack app, piece by piece,
confirmed at every step. Nothing was typed all at once.*

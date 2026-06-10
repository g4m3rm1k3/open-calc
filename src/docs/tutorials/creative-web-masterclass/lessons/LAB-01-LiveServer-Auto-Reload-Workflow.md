# Creative Web Masterclass — LAB 01 — Live Server: Auto-Reload Workflow

**Prerequisites:** LAB-00. You have an `index.html` file that opens in Chrome. You know what
the DOM is, how DevTools shows the element tree, and why the browser has default styles.

**What this lab adds:**
- VS Code Live Server extension installed and running
- A file structure you will use for every remaining lab
- Auto-reload: save your file and the browser updates with no F5 required
- Your first experience with the save → see → adjust loop at full speed

**Time:** 20–30 minutes

---

## What You Will Build

A project folder that auto-refreshes the browser every time you save. When done,
the workflow looks like this:

```
  VS Code editor                     Chrome browser
  ──────────────────────────────     ──────────────────────────────
  <h1>Hello, World</h1>              Hello, World
        │
        │ Ctrl+S (save)
        │
  <h1>My Portfolio</h1>    ─────▶   My Portfolio    ← instant, no F5
```

No manual reloading. Every save is a live preview. This is how professional
front-end developers work.

---

> **Quick Check — answer before reading further:**
>
> 1. In LAB-00 you had to press F5 to see changes. What do you think is happening
>    between "save" and "refresh" that you were doing manually?
> 2. When Live Server is running, the browser URL changes from `file:///...` to
>    `http://localhost:5500/...`. What do you think the difference is?
> 3. If you delete a file while Live Server is pointing at it, what do you predict
>    the browser shows?
>
> *(Answers at the end of this lab)*

---

## Concept: Live Reload

**What it is:** Live reload is a development tool that watches your project files for
changes and triggers a browser refresh automatically the moment a file is saved.

**The problem before:**

```
Edit HTML → Save → Switch to browser window → Press F5 → Look at result → Switch back → Repeat
```

That six-step loop interrupts your thinking every time you change anything. For simple changes
the manual version works, but as soon as you are adjusting CSS visually — changing a pixel value,
tweaking a color — the constant switching and pressing F5 breaks the creative flow entirely.

**The solution:** Live Server watches the file system. When any watched file changes, it
sends a signal to the browser page telling it to reload. You never leave your editor.

**What it hides:** Live Server hides the file-watching logic (using Node.js `fs.watch`
under the hood), the local HTTP server (so the browser uses `http://localhost` instead of
`file://`), and the WebSocket connection it injects into the page to receive reload signals.
The invariant it protects: your browser always reflects the saved state of your file. There
is no way to accidentally be looking at a stale version while the live server is running.

**Canonical example (General Explanation):**
- **Real-world analogy:** A whiteboard with a live camera feed projected on a screen.
  Every mark on the board immediately appears on the screen — no one has to walk over and
  take a photo each time.
- **Minimal form:** Install Live Server. Click "Go Live." Save any file. Browser refreshes.
- **Why this example makes the mechanic obvious:** The camera watches the board; Live Server
  watches the file system. Both are passive observers that react to changes automatically.

**Project Application (The "Why" here):**
Every lab after this one uses Live Server. You will be adjusting CSS values by single pixels,
tweaking colors, and tuning animations. Without live reload, each tweak would cost you 4–6
seconds of manual switching. Over a 90-minute lab, that adds up to real time lost — more
importantly, it interrupts the visual feedback loop that makes CSS learnable.

**Smallest possible example:**

```
1. Open VS Code
2. Install Live Server extension
3. Open a folder with index.html
4. Click "Go Live" in the status bar
5. Edit the file and save — browser refreshes
```

**Why it matters here:** Starting from this lab, every SAVE AND TRY instruction means
"save in VS Code, then look at the browser" — not "save, switch windows, press F5."

**Watch for:** Live Server serves files from the folder it was opened in. If you open VS Code
with just a single file (not a folder), Live Server may not find your other files (CSS, JS).
Always open VS Code by choosing "Open Folder," not "Open File."

---

## Concept: File Structure

**What it is:** File structure is the folder layout that determines where your HTML, CSS,
and JavaScript files live relative to each other, and how they reference each other.

**The problem before:** If you drop all files in one folder and use arbitrary names, a
`<link href="styles.css">` in one file might mean something completely different when
copied to another project. You have no system — you have to remember where everything is.

**The solution:** A consistent, predictable folder layout means every project looks the
same. You always know where to find styles, where to find scripts, and what to name things.

**Canonical example (General Explanation):**
- **Real-world analogy:** A kitchen where knives are always in one drawer and spices always
  on one shelf. You do not search — you reach.
- **Minimal form:**
  ```
  lab-02/
    index.html    ← always the entry point
    styles.css    ← always the stylesheet
    main.js       ← always the main script
  ```
- **Why this example makes the mechanic obvious:** `index.html` is the HTML convention for
  "the main page." Servers and browsers both look for this name first. Calling your main
  file anything else creates unnecessary friction.

**Project Application (The "Why" here):**
This course uses one folder per lab (`lab-00/`, `lab-01/`, ...) inside `projects/`. Each
folder has at minimum an `index.html`. CSS goes in `styles.css` when there is enough of
it to warrant a separate file. JS goes in `main.js` when there is enough of it. This
pattern also matches how the final portfolio is structured.

**Smallest possible example:**

```
projects/
  lab-01/
    index.html
```

**Why it matters here:** Lab-01's project has only an HTML file — there is no CSS or JS to
add yet. Future labs will add `styles.css` and `main.js` as those concepts are introduced.

**Watch for:** Putting HTML in a subfolder and CSS at the root level breaks `<link href="styles.css">` — it looks for the CSS relative to the HTML file, not the project root.

---

## Step 1 — Install Live Server

Open VS Code. Click the **Extensions** icon in the left sidebar (or press `Ctrl+Shift+X`).
Search for **Live Server**. Install the one by Ritwick Dey (the most popular result,
over 40 million downloads).

After installation, you will see a `Go Live` button in the VS Code status bar at the bottom
right of the screen.

---

> **SAVE AND TRY**
>
> Close and reopen VS Code. The `Go Live` button should still appear in the status bar.
>
> If it is missing, the extension did not install correctly. Go to Extensions (Ctrl+Shift+X),
> find Live Server in your installed extensions list, and click Reload Required if shown.

---

## Step 2 — Set Up the Lab-01 Project Folder

Create a new folder inside `creative-web-masterclass/projects/` named `lab-01`.
Inside it, create `index.html`.

Type this into `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>LAB 01 — Live Server</title>
  </head>
  <body>
    <h1>Live Server Is Working</h1>
    <p>Edit this file and save. The browser updates automatically.</p>
  </body>
</html>
```

---

## Step 3 — Open the Folder in VS Code and Start Live Server

In VS Code, choose **File → Open Folder** and select the `lab-01` folder specifically
(not the `creative-web-masterclass` root — any folder works, but open `lab-01` for now
so Live Server serves from that folder).

Once the folder is open, click **Go Live** in the status bar.

Chrome opens automatically and shows `http://localhost:5500/index.html` (or similar port).

---

> **SAVE AND TRY**
>
> **You should see:** "Live Server Is Working" as a large heading, with the paragraph below it.
>
> The URL in the browser starts with `http://localhost:...` — not `file:///...`.
> That difference matters: `localhost` means a real HTTP server is running, which allows
> JavaScript features (like `fetch`) that do not work on `file://` URLs.
>
> **Change something:** Go back to VS Code. Change the heading text from
> "Live Server Is Working" to "Live Server Works — No F5 Needed!"
>
> Save with `Ctrl+S`. Watch the browser tab.
>
> **Expected:** The heading changes in the browser within 1 second, with no manual refresh.
>
> **Change it back** to "Live Server Is Working."

---

## Step 4 — Test the Complete Save Loop

Now make three rapid changes, saving after each:

1. Change `<h1>Live Server Is Working</h1>` to `<h1>Step 1 ✓</h1>`. Save. See it change.
2. Change it to `<h1>Step 2 ✓</h1>`. Save. See it change.
3. Change it back to `<h1>Live Server Is Working</h1>`. Save.

Each save triggers a reload in under one second.

---

> **SAVE AND TRY**
>
> **You should see:** Each heading change appears in the browser as fast as you can save.
>
> **In DevTools Console:** Open DevTools. In the Console tab, type:
> ```js
> document.title
> ```
> **Expected:** `"LAB 01 — Live Server"` — the title you set in `<title>`.
>
> **Change something:** Change the `<title>` text to `"My Portfolio"` and save.
> Look at the browser tab — the tab label updates. Check `document.title` in the console
> again. It now returns `"My Portfolio"`. Change the title back.

---

## Step 5 — Understand the Port Number

Look at the browser URL: `http://localhost:5500`. The `5500` is the **port number** — it
identifies which program on your machine is serving the response.

Your computer runs many programs that listen for network requests (browser, games, apps).
Port numbers prevent them from conflicting. Live Server defaults to port 5500. If that port
is already taken, it will try 5501, 5502, and so on.

`localhost` is the computer's name for itself. `http://localhost:5500` means: "make an HTTP
request to a server running on this machine, on port 5500."

This matters because some browser features — like `fetch()` for loading data, or certain
JavaScript APIs — only work when served over HTTP, not when opened as a `file://` URL.
By using Live Server, every lab runs in the same environment as a deployed web server.

---

## 🎯 Challenge: Two Files, One Server

**You know:** Live Server serves all files in the open folder.

**Task:** Add a second HTML file to `lab-01/` called `about.html` with a heading that says
"About Page" and a link back to `index.html`. Add a link from `index.html` to `about.html`.
Navigate between the two pages using the links — both should work through Live Server.

**Starting code (add to index.html body):**

```html
<a href="about.html">Go to About</a>  <!-- ← add this line -->
```

**Hint:** Relative paths in `href` are relative to the current HTML file's location.
`about.html` and `index.html` are in the same folder, so `href="about.html"` is correct.

---

<details>
<summary>▶ Show Solution</summary>

`about.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>About</title>
  </head>
  <body>
    <h1>About Page</h1>
    <a href="index.html">Back to Home</a>
  </body>
</html>
```

`index.html` (add before `</body>`):
```html
<a href="about.html">Go to About</a>
```

**Key insight:** Both files are served by the same Live Server instance. The browser
navigates between them as HTTP requests, just like navigating between pages on a real
website — no page reload required for the server, just a new request.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Live Server installed | "Go Live" button visible in VS Code status bar |
| Auto-reload works | Edit text in VS Code, save, browser updates without F5 |
| URL uses localhost | Browser URL starts with `http://localhost:5500` not `file://` |
| Tab title updates | Changing `<title>` content and saving updates the browser tab label |
| Two-file navigation | `index.html` and `about.html` link to each other and both load |

---

## What's Next

LAB 02 introduces the CSS box model — the system that controls how much space every element
takes up. You will see why two elements that look the same size can behave completely
differently, and how DevTools' box model diagram reveals the exact pixel breakdown.

---

## Transfer Exercise

Live Server's auto-reload pattern appears in many development environments under different names.
Find one example outside of web development where the same "watch for changes, automatically
update the output" pattern exists. Describe: what is being watched, what triggers the update,
and what the output is.

(Example answer categories to point you in a direction, but do not read until you have tried:
game engines, document editors, compiled languages, spreadsheets.)

---

## Quick Check Answers

**1. What is happening between "save" and "refresh" that you were doing manually?**
The browser was waiting for you to tell it to re-read the file. When you press F5, the
browser sends a new request for `index.html`, receives the file again, parses it, and
rebuilds the DOM from scratch. Live Server automates that request by injecting a small
script into the page that listens for a reload signal over a WebSocket connection.

**2. What is the difference between `file:///` and `http://localhost:5500`?**
`file://` is the browser opening a file directly from disk — no network involved, no server.
`http://localhost` is the browser making an HTTP request to a local server. The difference
matters for security: browsers restrict some features (like `fetch()` for loading JSON files,
and certain JavaScript APIs) when the page was loaded from `file://`, because those
restrictions prevent malicious local files from accessing arbitrary files on your computer.

**3. If you delete a file while Live Server is pointing at it, what happens?**
Live Server reloads the browser. The browser requests the file and the server responds with
a 404 (Not Found) error. The browser shows an error page or a blank page depending on which
file was deleted. Stopping Live Server (clicking "Port: 5500" in the status bar) shuts the
server down cleanly.

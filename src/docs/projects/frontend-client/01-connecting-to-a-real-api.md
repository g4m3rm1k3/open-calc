# Frontend Client — Lesson 01 — Connecting to a Real API

## What You Will Build

A TypeScript project, created from scratch, that opens in a browser, sends a real
network request to a live server on the internet, and prints the real response to
the browser's console. No visible UI beyond a page title and a short instruction —
that arrives in lesson 02. The entire point of this lesson is the moment the response
comes back: proof that code you wrote, running in your browser, just talked to a
computer you have never touched, owned by someone else, somewhere else in the world.

When you finish, opening the page and pressing F12 will show something like this in
the console:

```
{
  articles: [
    { slug: "how-to-learn-javascript-efficiently", title: "How to Learn JavaScript Efficiently", ... },
    { slug: "...", title: "...", ... }
  ],
  articlesCount: 4
}
```

That data is real. It lives on a server called `api.realworld.show`, which nobody in
this curriculum controls. Every lesson from here on makes that data more visible and
more interactive, one small piece at a time.

---

## What You Need to Know First

Nothing. This is lesson one of the project. If you have never written a line of code,
you can still do this lesson — every term is defined the moment it appears.

---

## Before You Begin: Version Control

Before writing a single file, set up version control. Its value begins the moment the
first file exists, not after something has gone wrong.

### What version control is and why it exists

Version control records every change made to a project as a named snapshot in time,
with a message explaining why the snapshot was taken. This gives you four things
nothing else provides: you can return to any previous state exactly; you can see what
changed and why by reading history instead of relying on memory; you can develop two
things at once on separate *branches* without them interfering; and, for someone
learning alone with no team, you can understand your own past decisions instead of
losing them.

**Git** is the version control system almost all professional software uses today.
Created by Linus Torvalds in 2005 to manage the Linux kernel, it runs entirely on
your machine — no internet connection or account required until you choose to push
your history to a host like GitHub.

### The three states of a file

A file tracked by Git is always in one of three states. **Modified** — you changed
it, but Git does not know yet; the change exists only on your disk. **Staged** — you
told Git "include this change in the next snapshot"; Git has set it aside but not
recorded it permanently. **Committed** — the change is permanently recorded in the
project's history, with a unique 40-character identifier, and can always be retrieved
exactly as it was.

### The commands

**`git init`** creates a Git repository in the current folder — a hidden `.git`
directory that will store the entire history of the project. You run this once per
project.

**`git add <file>`** stages a file: Git reads its current contents and marks them for
the next commit. If you edit the file again after staging it, you must `git add` it
again — staging captures the file's contents at the moment you run the command, not
at the moment you eventually commit.

**`git commit -m "message"`** permanently records every currently-staged file as one
snapshot. `-m` supplies the message inline.

### What a commit message should communicate

A commit message does not need to describe *which* files changed — Git already knows
that and can show you on request. It needs to explain *why this state is worth
keeping*. "Add fetch code" describes a file. "Connect the client to the live articles
API for the first time" explains what the project can now do that it could not
before. Write every message as an explanation to yourself, six months from now, who
has forgotten this week entirely.

### Initialise the repository

Choose a folder for this project (not inside `open-calc` — this is a separate project
you are building from scratch) and run:

```
git init
```

You will see:

```
Initialized empty Git repository in /path/to/your/project/.git/
```

The `.git/` folder now exists. Never edit or delete it by hand — it is the entire
history of the project.

---

## Concept: What an API Actually Is

**API** stands for Application Programming Interface. It is a defined way for one
piece of software to ask another piece of software to do something or return
something, without either side needing to know how the other is built internally.

A **web API** is an API exposed over the internet using HTTP (HyperText Transfer
Protocol — the protocol, or agreed-upon set of rules, that web browsers and servers
use to exchange requests and responses). When you type a URL into a browser, the
browser sends an HTTP request; the server sends back an HTTP response containing a
web page. A web API works the same way, except the response contains structured data
instead of a page meant to be displayed directly.

**REST** (Representational State Transfer) is a widely-used style for designing web
APIs. A RESTful API organises itself around *resources* — nouns, like "articles" or
"users" — and uses HTTP methods as verbs that act on them: `GET` retrieves a
resource, `POST` creates one, `PUT` replaces one, `DELETE` removes one. The API you
are about to call is a RESTful API: `GET /api/articles` retrieves a list of articles.
You are not inventing this pattern — you will see the same shape in nearly every
backend API you encounter for the rest of your career.

**JSON** (JavaScript Object Notation) is a text format for representing structured
data — objects, arrays, strings, numbers, booleans, and `null` — that both humans and
machines can read. It looks like this:

```json
{ "title": "Hello", "favoritesCount": 2, "tagList": ["beginners", "javascript"] }
```

Despite the name, JSON is not specific to JavaScript — it is the most common data
format on the web, used by APIs written in every language. When a web API says it
"returns JSON," it means the HTTP response body is text formatted exactly like this,
which your code can convert into a real JavaScript value.

### The specific API this project uses

This project calls **Conduit**, a live, publicly-hosted backend at
`https://api.realworld.show/api`. Conduit implements the **RealWorld** specification
— an open-source project that exists specifically so people learning frontend
development have a real, stable, spec-compliant backend to build against, instead of
each tutorial inventing its own toy data. Conduit models a small blogging platform:
articles, authors, comments, tags, and favorites (likes). It is a real server. Other
people's data lives there. You did not build it and cannot change how it behaves —
which is exactly the situation every frontend developer works in against a real
backend team.

You can view its full interactive API documentation at
[api.realworld.show/redoc](https://api.realworld.show/redoc) at any time.

---

## Step 1 — Create the Project with Vite

**The problem:** TypeScript does not run directly in a browser. A browser only
understands JavaScript, HTML, and CSS. Something needs to convert (`compile`) your
TypeScript into JavaScript, and something needs to run a local web server so your
browser has a URL to open. Setting this up by hand — configuring a compiler, a dev
server, file watching — is dozens of small decisions that have nothing to do with
what you are trying to build. **Vite** (French for "fast") is a build tool that makes
all of these decisions for you with one command, using well-tested defaults.

### What `npm` and `npx`/`npm create` are

**Node.js** is a program that runs JavaScript outside a browser — on your own
machine, as a command-line program. Installing Node.js also installs **npm** (Node
Package Manager), a command-line tool for downloading and managing reusable code
packages published by other developers.

**`npm create <tool>@latest`** is a shorthand for downloading and immediately running
a project-scaffolding tool without permanently installing it. `@latest` specifies
which published version to fetch — always the newest one.

Open a terminal in the parent folder where your project should live and run:

```
npm create vite@latest frontend-client -- --template vanilla-ts
```

**Reading this command piece by piece:** `npm create vite@latest` fetches and runs
Vite's project-creation tool. `frontend-client` is the name of the folder it will
create for your project. The `--` (a bare double-dash) is a convention meaning
"everything after this point is an argument for the tool being run, not for `npm`
itself" — without it, `npm` would try to interpret `--template` as its own flag and
fail. `--template vanilla-ts` tells Vite which starting template to scaffold:
`vanilla-ts` means "plain TypeScript, no framework" — exactly what this project needs,
since the entire point is to write the code a framework would normally write for you.

You will see output listing the files Vite created, ending with instructions to `cd`
into the folder and run two more commands. Do that now:

```
cd frontend-client
npm install
```

**`cd frontend-client`** changes your terminal's current directory into the new
project folder — every command after this runs "inside" that folder. **`npm
install`** reads the `package.json` file Vite generated (explained below) and
downloads every package it lists into a new `node_modules/` folder.

### `package.json`, `node_modules`, and `.gitignore`

**`package.json`** is the manifest file for a Node-based project: its name, version,
and — critically — its **dependencies**, the list of external packages the project
needs. Vite's scaffold lists packages like `typescript` and `vite` itself under
`devDependencies`: packages needed to *build and develop* the project, but not
shipped to a user's browser (as opposed to `dependencies`, for packages whose code
actually runs in production — this project has none yet).

**Semantic versioning** is the `major.minor.patch` number format you will see next to
each package, e.g. `^5.2.0`. The `^` prefix means "this version or any newer version
that does not change the first number" — newer minor and patch releases are
considered safe to accept automatically, a major version bump is not. When `npm
install` runs, the *exact* versions actually installed are written to
`package-lock.json` — committed to version control so that anyone who clones this
project and runs `npm install` gets identical versions, byte for byte. You never edit
`package-lock.json` by hand.

**`node_modules/`** is where npm places every downloaded package — potentially tens
of thousands of files once a project has more dependencies. Open Vite's generated
**`.gitignore`** file (a plain text file listing paths Git should never track) and
you will see `node_modules` already listed. This is why: those files are entirely
reproducible by running `npm install` again from `package.json`, so committing them
would bloat the repository with files that add no information — anyone can regenerate
them in seconds.

### Clean the scaffold

Vite's `vanilla-ts` template includes a demo counter button so you have something to
look at immediately. This project does not need it — an unexplained file is a file a
learner will wonder about forever. Delete `src/counter.ts` and the two SVG files
(`public/vite.svg`, `src/typescript.svg`). You will replace `index.html` and
`src/main.ts` entirely in the next two steps.

### Run the dev server

```
npm run dev
```

**What this does mechanically:** `npm run dev` looks up the `dev` script inside
`package.json`'s `"scripts"` section (Vite wrote `"dev": "vite"` there) and runs it.
Vite starts a **dev server** — a lightweight web server, running on your own machine,
whose only job during development is to serve your project's files to a browser and
compile TypeScript to JavaScript on the fly, the moment the browser asks for a file.

The terminal will print something like:

```
  VITE v5.x.x  ready in 312 ms

  ➜  Local:   http://localhost:5173/
```

**What `localhost` and a port are:** `localhost` is a special hostname that always
means "this machine" — a request to `localhost` never leaves your computer. `5173` is
a **port**: a number that routes a network connection to one specific program running
on a machine. Your computer can run many programs that each listen on their own port;
a browser reaches the right one by including the port in the URL. Only one program at
a time can listen on a given port — if you ran a second Vite project, it would
automatically pick a different port, like `5174`.

Open `http://localhost:5173/` in a browser. You should see Vite's default scaffold
page — still showing leftover content that references the files you just deleted, so
it will look broken. That is expected; the next two steps replace it.

---

## Step 2 — Replace `index.html`

**The problem:** The scaffold's HTML references the demo content that no longer
exists. Replace it with the minimal real structure this lesson needs.

Open `index.html` in the project root and replace its contents with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Frontend Client</title>
</head>
<body>
  <h1>Frontend Client</h1>
  <p>Open your browser console (F12 → Console) to see real data.</p>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

Save the file. Vite's dev server automatically reloads the page — this is called
**hot reloading**: the dev server watches your files and pushes changes to the open
browser tab without you manually refreshing.

**Walkthrough:**

`<!DOCTYPE html>` declares that this document follows the HTML5 standard. Without it,
browsers fall back to *quirks mode* — a legacy compatibility mode from before HTML was
standardised, where CSS behaves inconsistently. Every HTML file should start with it.

`<html lang="en">` is the root element every other tag lives inside. `lang="en"`
declares the page's language — screen readers use it to select a pronunciation voice,
and search engines use it to serve the page to the right audience.

`<meta charset="UTF-8" />` declares the file's character encoding. UTF-8 can
represent virtually every character in every human language using one to four bytes
each. Without declaring it, a browser has to guess the encoding, and guesses wrong
whenever the page contains anything outside basic English letters.

`<meta name="viewport" ...>` controls how the page scales on a mobile device. Without
it, mobile browsers assume the page was built for a desktop screen and zoom out to
fit it, making everything tiny. `width=device-width` matches the layout width to the
actual screen width; `initial-scale=1.0` starts at 100% zoom.

`<script type="module" src="/src/main.ts">` loads your TypeScript entry file.
`type="module"` tells the browser (and Vite) to treat this file as an **ES module** —
a JavaScript file that can use `import` and `export` to share code with other files.
This project only has one file so far, but every project that grows past one file
needs this from the start. The path is written as `/src/main.ts` (a `.ts` file,
directly) because Vite's dev server intercepts this request and compiles the
TypeScript to JavaScript on the fly before sending it to the browser — you never
write or reference a `.js` file yourself during development.

---

## Step 3 — Write the First Fetch

**The problem:** Nothing in the project has talked to the network yet. Build the
smallest possible piece of code that does: ask the API for articles, and prove data
came back.

Open `src/main.ts`, delete everything Vite generated, and write this:

```typescript
const ARTICLES_URL = "https://api.realworld.show/api/articles?limit=5";

fetch(ARTICLES_URL);
```

Save the file. Nothing visibly happens yet — that is expected and correct for this
first fragment. Open the browser's **Network tab** (F12 → Network, then reload the
page). You will see a request to `articles?limit=5` with status `200`. That is the
proof: your code sent a real HTTP request, and the server answered.

**Walkthrough:** `const ARTICLES_URL = "..."` declares a constant — a named value
that cannot be reassigned after this line. `const` is used here rather than `let`
(which allows reassignment) because this URL never needs to change while the program
runs; naming it also means the string itself is written exactly once, so a future
change to the endpoint only requires editing one line.

The URL itself has two parts. `https://api.realworld.show/api/articles` is the
**endpoint** — the specific address on the server that returns a list of articles.
`?limit=5` is a **query parameter**: everything after `?` is a set of `key=value`
pairs the server reads to adjust its response. `limit=5` tells this particular API
"send at most 5 articles" — without it, the API would return however many articles
it defaults to. Query parameters are how a `GET` request passes options without a
request body.

`fetch(ARTICLES_URL)` calls the **Fetch API** — a function built into every modern
browser for making HTTP requests. It takes a URL (and, later in this project, an
options object) and starts a network request.

### Why `fetch` alone does not give you the data

`fetch` returns a **`Promise`**. A Promise is a JavaScript object representing a
value that does not exist *yet*, but will (or will fail to) at some point in the
future. `fetch`'s promise resolves once the server's response *headers* have arrived
— not the full body. This matters because network requests are not instant: your
computer sends the request, it travels over the internet, the server thinks, and the
response travels back. That could take 20 milliseconds or 3 seconds. JavaScript does
not stop and wait during that time.

**CS lens — the event loop and non-blocking I/O:** JavaScript runs on a single
thread — it can only execute one instruction at a time. If `fetch` *blocked* (paused
all other code) until the network finished, your entire page would freeze — no
scrolling, no button clicks, nothing — for as long as the request took. Instead,
`fetch` is **non-blocking**: it hands the request off to the browser's networking
layer and returns immediately, letting your code keep running. When the response
eventually arrives, the browser schedules your follow-up code to run via a mechanism
called the **event loop** — a loop, built into the JavaScript runtime, that
continuously checks "is there finished work waiting to run?" and executes it when the
main thread is free. This is the same mechanism behind every button click handler and
every `setTimeout` you will ever write in JavaScript — nothing in this pattern is
unique to `fetch`.

---

## Step 4 — Read the Response Body

**The problem:** You have proven a request happens, but the response body — the
actual JSON — has not been read into your code yet.

```typescript
const ARTICLES_URL = "https://api.realworld.show/api/articles?limit=5";

fetch(ARTICLES_URL).then((response) => {
  console.log(response);
});
```

Save and reload. The console prints a `Response` object — not the article data
itself, but an object *describing* the HTTP response: its `status` (should read
`200`), its headers, and a body that has not been read yet.

**Walkthrough:** `.then(callback)` is a method every `Promise` has. It registers a
function to run once the Promise resolves, and passes the resolved value into it as
an argument. Here, the resolved value is the `Response` object — `fetch`'s promise
resolves with this as soon as headers arrive, deliberately *before* the whole body
has downloaded, so that reading a large response body is a separate, explicit step
you opt into.

`(response) => { console.log(response); }` is an **arrow function** — a shorthand
way of writing a function. The part before `=>` is the parameter list (here, one
parameter named `response`); the part after is the function body. This is equivalent
to writing `function (response) { console.log(response); }`. Arrow functions are the
conventional style for short callback functions like this one throughout modern
JavaScript and TypeScript.

`console.log(...)` prints its argument to the browser's console (F12 → Console) —
the primary tool for inspecting values while a program runs, since a webpage has no
built-in way to "print" a value the way a terminal program can.

### Parsing the body as JSON

```typescript
const ARTICLES_URL = "https://api.realworld.show/api/articles?limit=5";

fetch(ARTICLES_URL)
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  });
```

Save and reload. The console now prints the real data: an object with an `articles`
array and an `articlesCount` number.

**Walkthrough:** `response.json()` reads the full response body and parses it as
JSON, converting the raw text into a real JavaScript value (here, an object). It
*also* returns a `Promise` — reading and parsing a large body takes time too, so this
step is asynchronous for the same reason `fetch` itself is. Chaining a second `.then`
after the first is how you sequence two asynchronous steps: "once the response
arrives, start reading its body; once the body is fully parsed, log it."

**SE lens — even one file gets a clear job:** This file has exactly one
responsibility right now: get data from the network and prove it arrived. It does
not yet render anything to the page — that is lesson 02's job. Keeping "get the
data" and "show the data" as separate concerns, even while they live in the same
file, means that when lesson 02 adds a second job to this file, it is obvious where
the boundary is. This is the beginning of **separation of concerns** — organising
code so that each part has one reason to change. If the API's URL changes, only the
fetching code changes. If the page's design changes, only the rendering code (added
next lesson) changes.

---

## Step 5 — Rewrite with `async`/`await`

**The problem:** Chained `.then()` calls work, but they get harder to read as more
steps are added. Modern JavaScript has a cleaner syntax for the exact same behaviour.

```typescript
const ARTICLES_URL = "https://api.realworld.show/api/articles?limit=5";

async function loadArticles(): Promise<void> {
  const response = await fetch(ARTICLES_URL);
  const data = await response.json();
  console.log(data);
}

loadArticles();
```

Save and reload. The console output is identical to Step 4 — this is a different way
of writing the same behaviour, not new behaviour.

**Walkthrough:** `async function loadArticles()` declares an **`async` function** — a
function that always returns a `Promise`, and that is allowed to use the `await`
keyword inside it. `await fetch(ARTICLES_URL)` pauses execution *of this function
only* (not the whole program — other code, like a button click elsewhere on the page,
can still run) until the Promise resolves, then "unwraps" it: instead of a Promise,
`response` holds the actual `Response` object directly. The next line does the same
thing for `response.json()`.

`: Promise<void>` is a TypeScript **type annotation** on the function's return value.
`void` means "this function does not produce a meaningful value to use" — it only
performs an action (logging). It is wrapped in `Promise<...>` because every `async`
function returns a Promise, even one that resolves to nothing useful; TypeScript
requires you to say so explicitly rather than leaving the return type to guesswork.

`loadArticles();` calls the function. Note there is no `await` here, because this
call is not inside another `async` function — it is at the top level of the file. The
function starts running, immediately hits its own internal `await`, and control
returns to the browser until the network responds.

**CS lens — `async`/`await` is syntax, not a new mechanism:** Under the hood,
`async`/`await` compiles down to the exact same Promise-and-callback mechanism from
Step 4 — it is what programming language designers call **syntactic sugar**: a
different, easier-to-read way of writing the same underlying operation. Reading
`async`/`await` code top-to-bottom mirrors the order things actually happen, which is
why virtually all modern JavaScript and TypeScript code uses this style over chained
`.then()` calls.

**SE lens — naming the function communicates intent:** `loadArticles` says exactly
what happens when it is called. A future reader — including you, in lesson 03 —
does not need to read the function body to know what calling it does. This is the
same naming discipline every professional codebase depends on: a function's name is
a promise about its behaviour.

---

## Step 6 — Handle Failure

**The problem:** Right now, if the network is down, the URL is mistyped, or the
server returns an error, nothing tells you. The code silently does nothing useful.
A request to a real server over the real internet *will* fail sometimes — you must
handle that on purpose, not by accident.

```typescript
const ARTICLES_URL = "https://api.realworld.show/api/articles?limit=5";

async function loadArticles(): Promise<void> {
  try {
    const response = await fetch(ARTICLES_URL);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Could not load articles:", error);
  }
}

loadArticles();
```

To see this branch run, temporarily change `ARTICLES_URL` to something broken, like
`.../api/articles-typo`, save, and reload. The console now prints a clear error
instead of nothing. Change the URL back afterward.

**Walkthrough:** `try { ... } catch (error) { ... }` is a **try/catch block**. Code
inside `try` runs normally; if any line inside it throws an error, execution jumps
immediately to `catch`, skipping the rest of the `try` block, and the thrown value is
available as `error`.

`response.ok` is a boolean property on every `Response` object: `true` if the HTTP
status code is in the 200–299 range (success), `false` otherwise. **This is the
detail that surprises almost everyone the first time they use `fetch`: a 404 Not
Found or a 500 Server Error does *not* make `fetch`'s promise reject.** From
`fetch`'s point of view, the request *succeeded* — a response arrived. Whether that
response represents success or failure at the HTTP level is something your code must
check explicitly with `response.ok` or `response.status`.

`throw new Error(...)` manually raises an error, which — because we are inside a
`try` block — is caught by the matching `catch`. A **template literal** —
`` `Request failed with status ${response.status}` `` — is a string written between
backticks instead of quotes, allowing `${...}` to embed the value of an expression
directly inside the string. This is equivalent to `"Request failed with status " +
response.status`, but reads more clearly once more than one value is embedded.

`console.error(...)` works like `console.log` but marks the message as an error in
the browser console — shown in red, and reported alongside the file and line number
that logged it.

**SE lens — failing loudly is a design decision:** A program that fails silently is
worse than one that crashes — silent failure hides bugs until a user reports
something vague like "it doesn't work." Catching the error and logging it clearly is
the minimum acceptable handling; later lessons will show the error to the *user*, not
just the developer console. For now, the goal is that a mistake is never invisible to
you while building.

---

## Concept: CORS — Why This Even Works

**The problem this section explains:** Your page is served from `localhost:5173`.
The API lives at `api.realworld.show` — a completely different domain. Browsers do
not allow this by default. Understanding why your fetch call worked anyway is
essential the first time it *doesn't* work against a different API.

**Same-origin policy** is a browser security rule: by default, JavaScript running on
one **origin** (the combination of protocol, domain, and port — `http://localhost:5173`
is a different origin from `https://api.realworld.show` even though both are just web
addresses) cannot read responses from a different origin. Without this rule, a
malicious page you accidentally opened could silently make requests to your bank's
website using your logged-in session and read the response.

**CORS** (Cross-Origin Resource Sharing) is the mechanism that relaxes this rule
*when the server explicitly allows it*. When your browser makes a cross-origin
request, the server's response includes a header:

```
access-control-allow-origin: http://localhost:5173
```

(You can see this yourself: open the Network tab, click the `articles` request, and
look at Response Headers.) This header is the server saying "I permit code running on
`http://localhost:5173` to read my response." Without it, the browser still lets the
request reach the server — but blocks your JavaScript from reading the response, and
logs a CORS error to the console instead. This is a browser-enforced rule, not a
server-enforced one: the request already happened by the time the browser blocks it.

Conduit's API sends this header for any origin that asks, which is why this lesson
works without any extra configuration. Many real-world APIs do not — if you ever see
an error containing the words "has been blocked by CORS policy" against a different
API in the future, this is what it means: the *server* has not opted in to allow your
page's origin to read its response, and no amount of frontend code can work around
that — the fix has to happen on the server.

---

## Connect the Pieces

```
index.html      Loads src/main.ts as a module — the page's only entry point
src/main.ts     Fetches real articles from Conduit and logs them to the console
```

Everything in this lesson lives in one file on purpose. `ARTICLES_URL` and
`loadArticles` are the two things lesson 02 will build directly on top of: the same
constant, the same function, now feeding a render step instead of `console.log`. The
try/catch you wrote here does not go away — it is the shape every future network call
in this project will follow.

---

## What Breaks Without This

**Without checking `response.ok`:** Change `ARTICLES_URL` to include a typo (an
endpoint that returns a 404). Remove the `if (!response.ok)` check. Reload. The
console shows the parsed JSON of the server's 404 error page (or throws a confusing
`SyntaxError` if the 404 page isn't valid JSON) instead of a clear message saying the
request failed. The bug is now one layer removed from its real cause — you would be
looking at a JSON parsing error instead of "the URL is wrong."

**Without `try`/`catch`:** Turn off your internet connection and reload the page.
`fetch` itself rejects (this is the one case it truly does reject: the request never
reached any server at all). Without a `catch`, this shows up in the console as an
*uncaught* `TypeError: Failed to fetch` — functionally similar to what you already
see, but by accident rather than by design. As this project grows, uncaught
rejections in more complex code can silently stop execution partway through a
function with no explanation at all.

---

## Definition of Done

- [ ] `npm run dev` starts the project with no errors in the terminal
- [ ] The page shows the title "Frontend Client" and the console instruction text
- [ ] The browser console shows a real `articles` array and `articlesCount` fetched from `https://api.realworld.show/api/articles`
- [ ] Temporarily breaking the URL produces a clear, readable error in the console instead of silence
- [ ] You can explain what a `Promise` is and why `fetch` returns one instead of the data directly
- [ ] You can explain the difference between `await` pausing a function and blocking the whole page
- [ ] You can explain why `response.ok` must be checked manually and what would go unnoticed without it
- [ ] You can explain what CORS is, what the `access-control-allow-origin` header means, and why this specific request is allowed
- [ ] You can explain the three states of a Git file: modified, staged, committed
- [ ] Run:
      ```
      git add index.html src/main.ts .gitignore package.json package-lock.json
      git commit -m "Connect the client to the live Conduit articles API for the first time"
      ```

---

*Next: Lesson 02 — Rendering Real Data. The console log is replaced with real HTML
on the real page — the first time this project shows something a user, not just a
developer, would actually see. TypeScript's `interface` is introduced at the exact
moment an untyped API response becomes a liability, and `textContent` is chosen over
`innerHTML` for a reason that has nothing to do with style.*

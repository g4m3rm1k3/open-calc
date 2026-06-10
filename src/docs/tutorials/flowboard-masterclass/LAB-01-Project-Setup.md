# FlowBoard Masterclass — LAB 01 — Project Setup

**Prerequisites:** None. This is the first lab in the series.  
You are assumed to know: what an HTML tag looks like, that CSS rules exist, what a string and a number are, and what an `if` statement does. Nothing else is assumed.

**What this lab adds:**
- A running development server showing a webpage you wrote
- A React component displaying the text "FlowBoard" on screen
- A page background color and centered layout — styled one rule at a time

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. A React component is a function. What do you think makes it different from any other function you have written?
> 2. If you rename a file from `App.tsx` to `App.js`, what do you predict will happen?
> 3. `npm run dev` starts a development server. What do you think that means — why can't you just open the HTML file directly?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, opening your browser shows:

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│               FlowBoard                    │
│        Your work, your way.                 │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

A dark background. The title "FlowBoard" centered on the page in large white text. A subtitle below it. No database. No interactivity. Just the foundation everything else is built on.

---

## Concept: Node.js

**What it is:** Node.js is a program that lets JavaScript run on your computer — outside the browser — so you can use it as a tool to build, bundle, and serve your project.

**The problem before:** JavaScript was invented to run inside browsers. Without Node.js, you cannot run JavaScript tools on your machine — no project creators, no package installers, no development servers. You are limited to opening plain HTML files.

**The solution:** Node.js takes the same JavaScript engine that lives inside Chrome and packages it as a standalone program. Tools like Vite, the thing that creates and runs this project, are themselves written in JavaScript and run via Node.js.

**Canonical example (General):**
Think of Node.js as the electricity that powers your power tools. The tools (Vite, npm) need it to run. You don't interact with Node.js directly most of the time — you just need it installed so the tools can work.

```
# check if Node.js is installed — run this in your terminal:
node --version
# expected output: v20.x.x or higher
```

**Why it matters here:** Every command in this series — `npm create vite`, `npm run dev`, `npm install` — requires Node.js to be running on your machine first.

**Watch for:** Node.js version matters. This series requires v18 or higher. If `node --version` shows v14 or v16, download the latest LTS (Long Term Support) version from nodejs.org before continuing.

---

## Concept: npm — Node Package Manager

**What it is:** npm (Node Package Manager) is a tool that ships with Node.js. It installs, updates, and manages the external code libraries your project depends on.

**The problem before:** Without npm, adding a library to a project means manually downloading a file, placing it in the right folder, and keeping it updated yourself — and doing that for every library every library uses. Projects quickly have hundreds of inter-dependent files to track by hand.

**The solution:** npm reads a file called `package.json` that lists what your project needs. One command — `npm install` — downloads every dependency, at the right version, automatically.

**What it hides:** npm hides the entire dependency resolution graph — the process of figuring out which version of library A is compatible with which version of library B. The invariant it protects: every developer who runs `npm install` on the same `package.json` gets an identical set of packages.

**Canonical example (General):**
Think of npm as an app store for code libraries. `npm install react` is like "download and install React for this project." `npm create vite` is like "run the Vite project creator tool."

**Why it matters here:** You will use `npm create vite` once to create the project, and `npm install` once to download its dependencies. After that, `npm run dev` starts the development server every time you work.

**Watch for:** Run all npm commands from inside your project folder. Running `npm install` in the wrong directory installs packages to the wrong project.

---

## Concept: Vite — The Development Server and Build Tool

**What it is:** Vite (French for "fast") is the tool that takes your TypeScript and React files, converts them into something browsers understand, and serves them at a local URL so you can see your work instantly.

**The problem before:** Browsers cannot read TypeScript. They cannot handle the `import`/`export` module syntax that modern JavaScript uses across files. Without a tool like Vite, you would need to manually convert TypeScript to JavaScript, manually bundle all your files into one, and manually refresh the browser after every change.

**The solution:** Vite runs a local web server at `http://localhost:5173`. When you save a file, it converts and updates the page in milliseconds — without a full refresh. This is called **Hot Module Replacement (HMR)** — the page updates the changed part only, keeping the rest intact.

**What it hides:** Vite hides the entire compilation and module-bundling pipeline. The invariant it protects: you write TypeScript, the browser always sees valid JavaScript — you never have to think about the conversion.

**Canonical example (General):**
Think of Vite as a translator sitting between you and the browser. You speak TypeScript. The browser speaks old-school JavaScript. Vite translates in real time so the browser always understands what you wrote.

**Why it matters here:** Every time you save a file in this series, Vite is watching. The browser updates automatically. You will see changes in under a second.

**Watch for:** Vite's server runs at `http://localhost:5173` by default — not at a file path like `file:///C:/...`. If you open the HTML file directly instead of using the Vite URL, none of the React code will work.

---

## Step 1 — Create the Project

Open your terminal. Navigate to wherever you keep your projects. Then run:

```bash
npm create vite@latest flowboard -- --template react-ts
```

**What each part of this command does:**

```
npm create vite@latest   ← runs the Vite project creator at its newest version
flowboard                ← the name of the folder it will create
--                       ← everything after this is passed to Vite, not to npm
--template react-ts      ← use the React + TypeScript starter template
```

When it finishes, run these three commands in sequence:

```bash
cd flowboard        # ← move into the new project folder
npm install         # ← download all the dependencies listed in package.json
npm run dev         # ← start the development server
```

### SAVE AND TRY

`npm run dev` will print something like:

```
  VITE v6.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser.

**You should see:** The default Vite + React page — the Vite and React logos spinning, a counter button, some text. It looks like a demo page. That is correct. You have not written anything yet.

**In the browser URL bar:** Confirm it says `localhost:5173` — not a file path. If it says `file:///`, you opened the HTML file directly. Close that tab and open the terminal URL instead.

**Change something:** In the terminal, press `Ctrl+C` to stop the server. Run `npm run dev` again. The server restarts. Change nothing else.

---

## Concept: The Project File Structure

Before touching any files, understand what Vite created:

```
flowboard/
├── src/                  ← your source code lives here — this is what you edit
│   ├── App.tsx           ← the root React component — the top of the UI tree
│   ├── App.css           ← styles for App.tsx
│   ├── main.tsx          ← the entry point — connects React to the HTML page
│   └── index.css         ← global CSS rules applied to the whole page
├── public/               ← static files served as-is (images, icons)
├── index.html            ← the one HTML file — React injects itself into it
├── package.json          ← the project's dependency list and script definitions
├── tsconfig.json         ← TypeScript configuration
└── vite.config.ts        ← Vite configuration
```

**The only folder you touch in this series:** `src/`. Everything else is configuration that Vite manages.

**Why one HTML file?** React applications are **Single Page Applications (SPA)** — a term defined below. The browser loads one HTML file once, and React swaps content in and out without ever reloading the page. That is why the URL stays `localhost:5173` even as you navigate between screens later.

---

## Concept: Single Page Application (SPA)

**What it is:** A Single Page Application is a web app that loads one HTML page once and then updates the visible content by manipulating the page with JavaScript — instead of requesting a new HTML page from a server for every navigation.

**The problem before:** Traditional websites load a new HTML page for every link you click. Each navigation = a round trip to the server = a full page flash and reload. For an interactive app like a task board, this makes the experience feel sluggish and stateless.

**The solution:** React renders the entire UI from JavaScript. Clicking "open a board" doesn't reload the page — React removes the old content and inserts new content, instantly.

**Canonical example (General):**
Google Maps is an SPA. When you drag the map or click a location, the page never reloads. The content updates in place. Compare that to a traditional website like Wikipedia where every link loads a completely new page.

**Why it matters here:** You will build FlowBoard as an SPA. All navigation between boards, cards, and views happens without a page reload. The one `index.html` file is the only HTML page that ever loads.

**Watch for:** Because there is only one HTML page, the browser's back button and bookmarking work differently in SPAs. React Router (introduced in a later lab) handles this.

---

## Concept: TypeScript

**What it is:** TypeScript is JavaScript with a type system added on top — it lets you declare what shape data must have, and it tells you at edit time (before you run the code) when you are using data incorrectly.

**The problem before:**

```js
// Plain JavaScript — no types:
function getCardTitle(card) {
  return card.title;
}

getCardTitle(42);          // runs — then crashes at runtime: 42.title is undefined
getCardTitle({ name: "Fix bug" }); // runs — wrong field name, returns undefined silently
```

JavaScript lets you pass anything anywhere. Bugs from wrong data types appear only when the code runs — sometimes only when a user triggers a specific feature.

**The solution:**

```ts
// TypeScript — with types:
function getCardTitle(card: { title: string }): string {
  return card.title;
}

getCardTitle(42);                    // ← ERROR before you run: number is not { title: string }
getCardTitle({ name: "Fix bug" });   // ← ERROR before you run: missing 'title' property
```

TypeScript reads your code and flags type mismatches in your editor — the red underline appears as you type, not when a user finds the bug.

**What it hides:** TypeScript hides the class of runtime errors caused by wrong data shapes. The invariant it protects: if TypeScript says your code compiles without errors, no type mismatch can crash it at runtime.

**Canonical example (General):**
Think of TypeScript as a proofreader who reads your code before you submit it. It doesn't change what you write — it just tells you "this word doesn't fit here" before the document goes out.

**Why it matters here:** The `.tsx` file extension (instead of `.jsx`) tells Vite that this file contains TypeScript. Every data shape in FlowBoard — a Card, a List, a Board — is defined as a TypeScript type. The type definition becomes the single source of truth shared between the database design, the API, and the UI.

**Watch for:** TypeScript errors appear in your editor and in the terminal where `npm run dev` is running. Both places. When you see a red underline, read the message — it tells you exactly what is wrong.

---

## Concept: JSX — HTML-Like Syntax Inside TypeScript

**What it is:** JSX (JavaScript XML) is a syntax extension that lets you write what looks like HTML tags inside a TypeScript or JavaScript file. Vite converts it to regular function calls before the browser sees it.

**The problem before:**

```ts
// Without JSX — creating UI in plain JavaScript:
const heading = document.createElement('h1');
heading.className = 'page-title';
heading.textContent = 'FlowBoard';
document.body.appendChild(heading);
```

Every HTML element requires multiple lines of imperative code. Building a complex UI this way is tedious and hard to read.

**The solution — with JSX:**

```tsx
// With JSX — reads like HTML, works like TypeScript:
const heading = <h1 className="page-title">FlowBoard</h1>;
```

JSX is not HTML — it is a description of what you want. Vite converts this to `React.createElement('h1', { className: 'page-title' }, 'FlowBoard')` automatically.

**Two JSX rules that differ from HTML:**

1. `class` becomes `className` — because `class` is a reserved word in JavaScript
2. Every JSX expression must have one root element — you cannot return two sibling elements without wrapping them

**Canonical example (General):**
JSX is like a blueprint language that React reads and converts into actual browser elements. You describe the structure. React builds it.

**Why it matters here:** Every component you write returns JSX. The `.tsx` extension tells Vite this file uses both TypeScript and JSX.

**Watch for:** JSX looks like HTML but isn't. `class` → `className`, `for` → `htmlFor`, and all attributes use camelCase (`onClick`, `onChange`, `onSubmit`). HTML habits will cause silent bugs here.

---

## Concept: React Component

**What it is:** A React component is a function that accepts data as input and returns JSX describing what should appear on screen. It is the fundamental unit of a React UI — everything visible is a component or made of components.

**The problem before:**

```html
<!-- Traditional HTML — structure lives in HTML, behavior lives in JS, they are separate files -->
<!-- HTML file: -->
<div class="card">
  <h2 class="card-title">Fix the login bug</h2>
</div>

<!-- JS file: -->
document.querySelector('.card-title').textContent = newTitle; // ← must find the element and mutate it
```

When structure (HTML), behavior (JS), and appearance (CSS) are in separate files, updating one means coordinating across all three manually. Finding the right element in the DOM (Document Object Model — the browser's tree of page elements) is fragile.

**The solution:**

```tsx
// A React component — structure and behavior together, data flows in as props:
function Card() {
  return (
    <div className="card">
      <h2 className="card-title">Fix the login bug</h2>
    </div>
  );
}
```

A component is self-contained. Its structure, the data it needs, and the behavior it handles all live together. To show a card, you write `<Card />` — the same way you write an HTML tag.

**What it hides:** A component hides the DOM manipulation — the code that creates, finds, updates, and removes browser elements. The invariant it protects: you describe what the UI *should look like* given the current data; React decides *how* to update the actual DOM to match. You never touch the DOM directly.

**Pattern category:** Non-GoF (React-specific pattern)  
**Official name:** Component Pattern  
**Tradeoff:** Components require learning JSX syntax and React's rendering model before they feel natural. The payoff is that UI becomes composable — complex interfaces built from small, reusable pieces.  
**You will see this again in:** LAB-02 (the Card component), LAB-05 (the List component), LAB-06 (the Board component) — every visible thing in this series is a component.

**Canonical example (General):**
Think of a component like a stamp. You design the stamp once (the function). You can press it anywhere (use `<Card />` anywhere). Changing the stamp design changes every impression of it everywhere at once.

**Smallest possible example:**

```tsx
function Greeting() {            // ← a plain function
  return <p>Hello, world!</p>;   // ← returns JSX — this is what makes it a component
}

// To use it:
<Greeting />                     // ← used like an HTML tag
```

**Why it matters here:** `App` is the root component — the one that React mounts into the HTML page. Everything else is a component that lives inside `App`. You will write your first component right now.

**Watch for:** Component names must start with a capital letter — `App`, `Card`, `Board`. Lowercase names (`app`, `card`) are treated as regular HTML tags, not components. This is how React knows the difference.

---

## Step 2 — Delete the Boilerplate, Write Your First Component

The default Vite project has demo code you don't need. Replace it with the minimum needed to see your own content.

Open `src/App.tsx` in your editor. It currently has the Vite demo code. Delete everything in it and type this from scratch:

```tsx
function App() {                          // ← a function named App — capital A required
  return (                               // ← the function returns JSX
    <div>                                {/* ← JSX opens like HTML */}
      <h1>FlowBoard</h1>                 {/* ← JSX comment syntax: {/* */} not <!-- --> */}
      <p>Your work, your way.</p>        {/* ← plain text inside a paragraph tag */}
    </div>                               {/* ← one root element wraps everything */}
  );
}

export default App;                      // ← makes App available to other files that import it
```

**Why `export default`?** The file `src/main.tsx` imports `App` and mounts it into the HTML page. `export default` is the way one TypeScript file shares its main thing with another file. Without it, `main.tsx` cannot find `App`.

Now open `src/App.css` and **delete everything** in it — leave the file empty. You will add CSS back yourself, one rule at a time.

Also open `src/index.css` and **delete everything** in it. Leave it empty too.

### SAVE AND TRY

Save both files. The browser at `localhost:5173` should update automatically.

**You should see:** A plain white page. In the top-left corner: "FlowBoard" as a large bold heading, and "Your work, your way." as plain text below it. No styling — browser defaults only. It looks raw. That is correct. You now own this page — the boilerplate is gone.

**In the browser:** Right-click the "FlowBoard" text and choose "Inspect". In the DevTools panel that opens, you will see:

```html
<div id="root">
  <div>
    <h1>FlowBoard</h1>
    <p>Your work, your way.</p>
  </div>
</div>
```

The `<div id="root">` is the one element in `index.html`. React inserted your component's JSX inside it. This is how React connects to the HTML page — it finds the root element and takes control of everything inside it.

**Change something:** Change `<h1>FlowBoard</h1>` to `<h1>TaskFlow</h1>`. Save. The browser updates instantly — no refresh. Change it back to `FlowBoard`.

---

## Step 3 — Add the Page Background Color

Now that structure is visible, add the first CSS rule. Open `src/index.css` (currently empty):

```css
/* src/index.css */

body {                          /* targets the <body> element — the root of the visible page */
  background-color: #1a1a2e;   /* dark navy blue — the FlowBoard base color */
  margin: 0;                   /* browsers add 8px margin to body by default — remove it */
}
```

**Why `margin: 0`?** Every browser adds a small margin around the `<body>` element by default. Without removing it, your page has an invisible gap around all four edges. This is one of the first things real stylesheets always do.

**Why this color?** `#1a1a2e` is a dark navy — it reduces eye strain for long work sessions and gives FlowBoard a professional, focused feel. The hex code is explained: `#` prefix signals a hex color, `1a` = red channel, `1a` = green channel, `2e` = blue channel. Higher = more of that color (0 to ff).

### CSS AND SEE

Save. The browser updates.

**You should see:** The white page is now dark navy. The text "FlowBoard" and "Your work, your way." are still top-left — but now they are nearly invisible because they are dark text on a dark background. That is correct. Structure first, appearance second. Next step fixes the text.

**Compare:** Before — white background, black text, readable but raw. After — dark background, text almost invisible. The structure is identical. Only the background changed.

**Change something:** Change `#1a1a2e` to `#2d6a4f` (a forest green). Save. See the green background. Change it back to `#1a1a2e`.

---

## Step 4 — Add Text Color and Centering

Open `src/index.css` again. Add below what is already there:

```css
/* src/index.css */

body {
  background-color: #1a1a2e;
  margin: 0;
  color: #e0e0e0;              /* ← add this: light grey — readable on dark backgrounds */
  font-family: system-ui, sans-serif; /* ← add this: use the OS's default clean font */
}
```

Save and check the text is now readable. Then open `src/App.css` (currently empty) and add:

```css
/* src/App.css */

.app-container {                /* targets elements with className="app-container" */
  display: flex;                /* activates Flexbox — taught fully in LAB-06 */
  flex-direction: column;       /* stack children vertically (top to bottom) */
  align-items: center;          /* center children horizontally */
  justify-content: center;      /* center children vertically */
  min-height: 100vh;            /* make the container at least as tall as the viewport */
}
```

**A note on `display: flex`:** Flexbox is the CSS layout system that controls how children are arranged inside a parent. You are using it here with its simplest job — centering. The full Flexbox mental model is taught in LAB-06 when you build the board columns. For now, understand that these five lines together say: "make this container fill the whole screen, and put its children in the exact center of it."

Now apply that class in `src/App.tsx`:

```tsx
function App() {
  return (
    <div className="app-container">     {/* ← was: <div> — add className="app-container" */}
      <h1>FlowBoard</h1>
      <p>Your work, your way.</p>
    </div>
  );
}

export default App;
```

Now open `src/App.css` again and add the heading styles below the container rule:

```css
/* src/App.css — add below the existing rule */

.app-title {                    /* targets the h1 with className="app-title" */
  font-size: 3rem;              /* 3rem = 3 × the root font size (usually 48px) */
  font-weight: 700;             /* bold — numerical scale: 400 = normal, 700 = bold */
  letter-spacing: -0.02em;     /* tighten letter spacing slightly — makes large text crisper */
  color: #ffffff;               /* pure white — stronger contrast than the body #e0e0e0 */
  margin: 0 0 0.5rem 0;        /* shorthand: top right bottom left — only bottom gap */
}

.app-subtitle {                 /* targets the p with className="app-subtitle" */
  font-size: 1.1rem;            /* slightly larger than default (1rem) */
  color: #a0a0b0;               /* muted blue-grey — subordinate to the white title */
  margin: 0;
}
```

Apply the new class names in `src/App.tsx`:

```tsx
function App() {
  return (
    <div className="app-container">
      <h1 className="app-title">FlowBoard</h1>           {/* ← add className */}
      <p className="app-subtitle">Your work, your way.</p> {/* ← add className */}
    </div>
  );
}

export default App;
```

Don't forget to import the CSS file at the top of `src/App.tsx`:

```tsx
import './App.css';    // ← add this as the very first line — tells Vite to load these styles

function App() {
```

### CSS AND SEE

Save everything.

**You should see:**
- Dark navy background fills the entire browser window, edge to edge
- "FlowBoard" in large white bold text, centered on the page
- "Your work, your way." in smaller muted grey text, centered below it
- No gap between the browser edge and the background (the `margin: 0` is doing this)

**Compare:** Two steps ago — dark background, invisible text. One step ago — dark background, light grey text top-left. Now — dark background, white title and grey subtitle centered on screen. Three CSS steps, three visible changes, each one building on the last.

**Change something:** Change `font-size: 3rem` to `font-size: 6rem`. Save. The title doubles in size. Change it back to `3rem`.

---

## 🎯 Challenge: Add a Version Badge

**You know:** JSX lets you add HTML-like elements, and CSS lets you style them with class names.

**Task:** Add a small badge below the subtitle that reads "v0.1.0 — Alpha". Style it so it looks distinct from the subtitle — use a border, a different background color, and smaller text. It should sit centered below the subtitle.

**Starting code (current App.tsx):**
```tsx
import './App.css';

function App() {
  return (
    <div className="app-container">
      <h1 className="app-title">FlowBoard</h1>
      <p className="app-subtitle">Your work, your way.</p>
      {/* Add your badge here */}
    </div>
  );
}

export default App;
```

**Hints:**
1. Use a `<span>` element — it is an inline container that does not create a new line by default.
2. Borders in CSS: `border: 1px solid #color` — three values: thickness, style (`solid`, `dashed`), color.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

In `src/App.tsx`:
```tsx
import './App.css';

function App() {
  return (
    <div className="app-container">
      <h1 className="app-title">FlowBoard</h1>
      <p className="app-subtitle">Your work, your way.</p>
      <span className="version-badge">v0.1.0 — Alpha</span>   {/* ← add this */}
    </div>
  );
}

export default App;
```

In `src/App.css`:
```css
.version-badge {
  margin-top: 1.5rem;           /* space above the badge */
  font-size: 0.75rem;           /* smaller than the subtitle */
  color: #a0a0b0;               /* same muted color as subtitle */
  border: 1px solid #3a3a5c;   /* subtle border in a slightly lighter navy */
  border-radius: 999px;         /* a very large radius rounds the corners into a pill shape */
  padding: 0.2rem 0.75rem;     /* top/bottom 0.2rem, left/right 0.75rem — gives it breathing room */
}
```

**Key insight:** `border-radius: 999px` on a short element produces a "pill" shape — a common badge pattern. The number just needs to be larger than half the element's height. `999px` is a shortcut that always works regardless of height.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Dev server runs | `localhost:5173` opens in the browser without errors |
| Dark background fills the full window | No white gap at any edge |
| "FlowBoard" appears centered | Title is horizontally and vertically centered |
| "Your work, your way." appears below the title | Subtitle visible in muted grey below the white title |
| Saving a file updates the browser instantly | Change one character in App.tsx, save, see it update without refreshing |
| No Vite default demo content | No spinning logos, no counter button |
| TypeScript compiles without errors | Terminal running `npm run dev` shows no red error messages |

---

## Quick Check Answers

**1. A React component is a function. What makes it different from any other function?**  
A React component returns JSX — the HTML-like description of what should appear on screen. A regular function returns data (a number, a string, an object). When React calls a component function, it takes the returned JSX and converts it into actual browser elements. The naming convention (capital first letter) is how React knows to treat the function as a component rather than a regular call.

**2. If you rename `App.tsx` to `App.js`, what would happen?**  
Vite would still run — it can handle `.js` files. But TypeScript type checking would stop working in that file. The `.tsx` extension tells both Vite and the TypeScript compiler "this file has TypeScript types AND JSX." Without `.tsx`, TypeScript's type annotations would cause syntax errors in a plain `.js` file, because `.js` files aren't run through the TypeScript compiler.

**3. Why can't you just open the HTML file directly instead of using `npm run dev`?**  
The `index.html` file loads `src/main.tsx` — a TypeScript file. Browsers cannot read TypeScript. Vite's development server converts the TypeScript and JSX to plain JavaScript on the fly and serves it at `localhost:5173`. Opening the HTML file directly bypasses Vite entirely — the browser tries to load the TypeScript file raw, fails, and shows a blank page or an error.

---

## End State Summary — LAB-01

**Files that exist:**
- `flowboard/src/App.tsx` — the root React component, renders the FlowBoard title and subtitle
- `flowboard/src/App.css` — styles for the app container, title, and subtitle
- `flowboard/src/index.css` — global page styles (background color, margin reset, font)
- `flowboard/src/main.tsx` — unchanged Vite boilerplate that mounts App into the HTML page
- `flowboard/index.html` — unchanged Vite boilerplate — the single HTML file
- `flowboard/package.json` — dependency list, unchanged after `npm install`

**What the app does right now:**  
A dark navy page with "FlowBoard" in centered white text and a muted grey subtitle. No database, no interactivity, no navigation. The development server is running and updates the browser instantly on every file save.

**Concepts now in the registry from this lab:**
- Node.js
- npm (Node Package Manager)
- Vite
- Single Page Application (SPA)
- TypeScript
- JSX
- React Component
- `export default`
- `className` (vs HTML `class`)

**Next lab will add:**  
The `Card` component — a styled box with a title and a label, built one CSS rule at a time, demonstrating the full box model from scratch.

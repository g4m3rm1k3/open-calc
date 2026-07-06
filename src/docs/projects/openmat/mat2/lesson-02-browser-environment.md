# Lesson 02 — The Browser Environment
## How browsers work, what the DOM is, and building your first UI

---

## What You Will Understand

- How a browser loads and renders a page
- What the DOM is and how JavaScript changes it
- What HTML, CSS, and JavaScript each do (and only do)
- How Vite runs a development server and why it is faster than alternatives

---

## What You Need To Know First

- Lesson 00: Node.js, TypeScript basics
- Lesson 01: pnpm, package.json, scripts

---

# Part 1: How a Browser Loads a Page

## The sequence

Every time you open a URL, the browser does this in order:

```
1. Request the URL from a server
2. Receive an HTML file
3. Read the HTML and build the DOM
4. Find <link> tags — download and apply CSS files
5. Find <script> tags — download and run JavaScript files
6. Display the result
```

This sequence explains several things that confuse beginners:

**Why JavaScript cannot find elements that exist in the HTML:**
If your `<script>` tag is in `<head>`, the JavaScript runs before
the browser has read the `<body>`. `document.getElementById('btn')`
returns null because the button has not been parsed yet. Script
tags at the bottom of `<body>` run after the whole HTML is parsed.

**Why CSS changes take effect immediately:**
CSS is applied before JavaScript runs. If JavaScript changes
a CSS class, the browser re-renders. The change is visible
on the next frame — roughly 16ms later.

**Why you need a server:**
Browsers restrict what JavaScript can do with `file://` URLs
(opening an HTML file directly from your filesystem). ES modules
do not work. Fetch requests fail. Running a local server
(even a simple one) avoids all of these restrictions.

---

# Part 2: HTML — Structure

## What HTML is

HTML defines what elements exist and how they are related.
It does not define appearance or behaviour — only structure.

Create `structure.html` and open it in your browser:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Structure Demo</title>
</head>
<body>
    <h1>This is a heading</h1>
    <p>This is a paragraph.</p>
    <button id="my-button">Click me</button>
    <div id="output"></div>
</body>
</html>
```

Every part:

`<!DOCTYPE html>` — tells the browser this is HTML5. Without it,
browsers enter "quirks mode" and emulate broken old behaviour.
Always include it as the first line.

`<html lang="en">` — the root element. `lang="en"` declares the
page language. Used by screen readers and translation tools.

`<head>` — metadata not shown to the user. Title, CSS links,
character encoding.

`<meta charset="UTF-8">` — declares the character encoding.
UTF-8 can represent every character in every language. Always
include this as the first tag inside `<head>`.

`<body>` — everything the user sees.

`<h1>` through `<h6>` — headings. h1 is most important, h6 least.

`<p>` — a paragraph of text.

`<button>` — a clickable button.

`<div>` — a generic container. No semantic meaning. Used for
grouping elements for CSS or JavaScript purposes.

`id="my-button"` — a unique identifier. No two elements on the
same page can share an id. JavaScript uses ids to find elements.

## Semantic elements

Some elements describe their purpose through their name:

```html
<header>  — top section of a page
<main>    — primary content
<nav>     — navigation links
<section> — a thematic group of content
<footer>  — bottom section
<aside>   — secondary content alongside the main content
```

Use semantic elements when the name matches the content's purpose.
Use `<div>` when no semantic element fits.

---

# Part 3: CSS — Appearance

## What CSS is

CSS defines how elements look. Colour, size, position, font.
Nothing else.

Add a `<style>` tag to `structure.html` inside `<head>`:

```html
<style>
    body {
        background-color: #1a1a2e;
        color: #e0e0e0;
        font-family: sans-serif;
        padding: 20px;
    }

    h1 {
        color: #4fc3f7;
    }

    button {
        background-color: #0f3460;
        color: white;
        border: none;
        padding: 8px 16px;
        cursor: pointer;
    }

    button:hover {
        background-color: #1a5276;
    }
</style>
```

Reload the page. The structure did not change — the HTML is the
same. Only the appearance changed.

## CSS rules

A CSS rule has two parts:

```css
selector {
    property: value;
    property: value;
}
```

`selector` — which elements this rule applies to:
- `h1` — all `<h1>` elements
- `#my-button` — the element with `id="my-button"`
- `.panel` — all elements with `class="panel"`

`property: value` — what to change.

## CSS custom properties

Instead of repeating the same colour value everywhere:

```css
:root {
    --bg-color: #1a1a2e;
    --text-color: #e0e0e0;
    --accent: #4fc3f7;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
}

h1 {
    color: var(--accent);
}
```

`--bg-color` is a custom property (CSS variable). Defined on
`:root` (the root element), it is available everywhere.
`var(--bg-color)` reads its value.

Change the colour in one place, every element using it updates.

## Flexbox layout

Flexbox arranges elements in a row or column.

Add this to `structure.html`:

```html
<div class="container">
    <div class="left">Left panel</div>
    <div class="right">Right panel</div>
</div>
```

```css
.container {
    display: flex;
    flex-direction: row;
    height: 200px;
    gap: 10px;
}

.left {
    flex: 1;
    background-color: #0d1b2a;
    padding: 10px;
}

.right {
    flex: 2;
    background-color: #1b2838;
    padding: 10px;
}
```

`display: flex` — turn on flexbox for this container.
`flex-direction: row` — arrange children left to right.
`gap: 10px` — space between children.
`flex: 1` — take 1 share of available space.
`flex: 2` — take 2 shares.

Result: left panel gets one third of the width, right panel
gets two thirds. Change the numbers to change the ratio.

---

# Part 4: JavaScript in the Browser

## What is different from Node.js

In Node.js you have `process`, `fs`, `path`.
In the browser you have `document`, `window`, `fetch`.

The language is identical. The available APIs are different.

## The DOM as a JavaScript object

`document` is the JavaScript object representing your HTML page.
Every element in the HTML is accessible through `document`.

Add a `<script>` tag at the bottom of `structure.html`:

```html
<script>
    // Find the button by its id
    const button = document.getElementById('my-button');

    // Find the output div
    const output = document.getElementById('output');

    // Add a click handler
    button.addEventListener('click', function() {
        output.textContent = 'Button was clicked!';
    });
</script>
```

Reload the page. Click the button. The output div updates.

What happened:

`document.getElementById('my-button')` — searches the DOM for
an element with `id="my-button"`. Returns the element object,
or `null` if not found.

`button.addEventListener('click', function() { ... })` — registers
a function to run whenever the button is clicked. The browser
calls this function every time the click event fires.

`output.textContent = 'Button was clicked!'` — sets the text
content of the output div. The browser immediately re-renders
to show the new text.

## Creating elements

You can create new elements and add them to the DOM:

```html
<script>
    const button = document.getElementById('my-button');
    const output = document.getElementById('output');
    let count = 0;

    button.addEventListener('click', function() {
        count++;

        // Create a new paragraph element
        const p = document.createElement('p');

        // Set its text content
        p.textContent = 'Click number: ' + count;

        // Add it to the output div
        output.appendChild(p);
    });
</script>
```

Click the button several times. Each click adds a new paragraph.

`document.createElement('p')` — creates a new `<p>` element.
It is not yet in the DOM — it exists in memory only.

`p.textContent = '...'` — sets the text content.

`output.appendChild(p)` — adds the element to the DOM as the
last child of `output`. Now it is visible.

## textContent vs innerHTML

Two ways to set content:

```javascript
element.textContent = userInput;    // SAFE
element.innerHTML = userInput;      // DANGEROUS
```

`innerHTML` parses its argument as HTML. If a user types:

```
<img src=x onerror=alert('hacked')>
```

...`innerHTML` creates a real image element, fails to load it,
and runs the `onerror` handler. This is called XSS
(Cross-Site Scripting) — the user injected code into your page.

`textContent` treats its argument as plain text. `<img>` becomes
the literal characters `<img>` — not an HTML element.
No code executes. No injection possible.

**Rule:** if the content comes from user input, use `textContent`.
Never use `innerHTML` with user-provided data.

---

# Part 5: Vite

## What Vite is

TypeScript cannot run directly in a browser. It needs to be
compiled to JavaScript first. During development, recompiling
manually after every change is tedious.

Vite is a development server that handles this automatically:

- You write TypeScript
- Vite watches for changes
- When you reload the browser, Vite compiles your TypeScript
  and serves the JavaScript
- When you save a file, Vite updates the browser automatically
  (Hot Module Replacement)

## Install and set up

In a project folder:

```powershell
pnpm add -D vite
```

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Vite Demo</title>
</head>
<body>
    <h1>Hello from Vite</h1>
    <div id="output"></div>

    <script type="module" src="./src/main.ts"></script>
</body>
</html>
```

`type="module"` — tells the browser to treat this script as an
ES module. Required for TypeScript/modern JavaScript.

Create `src/main.ts`:

```typescript
const output = document.getElementById('output');

if (output !== null) {
    output.textContent = 'TypeScript is running in the browser.';
}
```

Add a script to `package.json`:

```json
{
  "scripts": {
    "dev": "vite"
  }
}
```

Start Vite:

```powershell
pnpm dev
```

Vite prints:

```
  VITE v5.x.x  ready

  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser. You should see
"TypeScript is running in the browser."

Now change the text in `src/main.ts` and save. The browser
updates automatically without a reload.

## What localhost:5173 means

`localhost` always refers to your own machine.
It is an alias for the IP address `127.0.0.1`.

`5173` is a port number. A port is a numbered channel.
Your computer can run many servers simultaneously, each on
a different port. Vite defaults to 5173.

When Vite is not running, `http://localhost:5173` shows nothing.
The server only exists while `pnpm dev` is running.

## Browser developer tools

Open with `F12` (Windows) or `Cmd+Option+I` (Mac).

**Elements tab** — shows the DOM tree as it currently exists.
Not the HTML source — the live DOM. JavaScript changes appear
here in real time. Click any element to see its CSS.

**Console tab** — shows JavaScript errors, warnings, and
`console.log()` output. When something does not work,
open this tab first. Errors show file name, line number,
and a description. Read them.

**Sources tab** — shows the files the browser has loaded.
Set breakpoints by clicking line numbers. The browser pauses
execution at breakpoints so you can inspect variable values.

Practice: add `console.log('Vite is working')` to `main.ts`.
Save. Open the Console tab. Confirm you see the message.

---

# Micro-Project

You understand the browser environment. Apply it to MikeLab's UI.

MikeLab's UI package needs:

- A Vite configuration
- An `index.html` with a toolbar, an editor panel, and an
  output panel laid out side by side using flexbox
- A `src/main.ts` that finds each element by id and verifies
  they all exist (log an error and stop if any are missing)
- A CSS file with a dark theme using custom properties for colours

When you run `pnpm dev` from `packages/ui` and open the browser,
you should see the layout. Nothing needs to work yet — clicking
buttons does nothing. The goal is a visible shell.

The layout should match MATLAB's workspace roughly:
- A narrow toolbar across the top
- An editor panel on the left (where code will be typed)
- An output panel on the right (where results will appear)
- A status bar across the bottom

Consider how `flex` values control panel widths. Consider what
`height: 100vh` does. Consider why `overflow: hidden` on the
body prevents unwanted scrollbars.

---

# Challenges

**Challenge 1:**

Add a click counter to the `structure.html` demo. Each click
adds a paragraph showing the click number AND the current time.
Use `new Date().toLocaleTimeString()` to get the current time.

After 5 clicks, add a paragraph that says "That is enough."
in a different colour. Use a CSS class for the colour — add
the class with `element.classList.add('warning')`.

**Challenge 2:**

The `textContent` vs `innerHTML` difference is important.
Prove it to yourself:

Build a small page with an input field and a display area.
When the user types in the input and presses a button,
show the content in the display area.

Try both `innerHTML` and `textContent`. With `innerHTML`, type:

```
<strong>bold</strong>
```

What happens with each? What happens if you type:

```
<img src=x onerror="document.body.style.background='red'">
```

Document what you observe in a comment at the top of your file.

**Challenge 3:**

Vite's Hot Module Replacement updates the browser when you
save a file. But it does not always work perfectly.

In `src/main.ts`, set up a counter that increments every second:

```typescript
let count = 0;
setInterval(() => {
    count++;
    if (output) output.textContent = String(count);
}, 1000);
```

Start the counter. While it is running, change the initial value
of `count` from 0 to 100 and save. What happens?
Does HMR preserve the running counter or reset it?
Document what you observe. This behaviour is important to
understand when building interactive UIs.

---

# Definition of Done

```
□ You can explain the browser's loading sequence in order
□ You understand why scripts at the bottom of body work better
□ You can create an HTML element with createElement,
  set its content with textContent, and add it to the DOM
□ You can explain why innerHTML is dangerous with user input
□ pnpm dev starts the Vite server for @mikelab/ui
□ The browser shows the MikeLab layout at localhost:5173
□ The layout uses flexbox — editor and output panels side by side
□ Opening F12 → Console shows no JavaScript errors
□ All three challenges completed
□ Changes committed with a meaningful message
```

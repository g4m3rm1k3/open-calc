# Creative Web Masterclass — LAB 00 — Browser DevTools: Your First HTML File

**Prerequisites:** None. This lab assumes you have never written HTML or used DevTools.

**What this lab adds:**
- An HTML file that the browser renders as a visible page
- The mental model of HTML as instructions the browser interprets
- How to open DevTools and inspect any element on the page
- How to read computed styles — what the browser actually applied, not just what you wrote

**Time:** 30–45 minutes

---

## What You Will Build

At the end of this lab you will have this in Chrome:

```
  ┌──────────────────────────────────────────────┐
  │  Creative Web Portfolio                       │  ← tab title
  ├──────────────────────────────────────────────┤
  │                                              │
  │  Hello, World                                │  ← large heading
  │                                              │
  │  This is my first HTML file.                 │  ← paragraph
  │                                              │
  └──────────────────────────────────────────────┘
```

And DevTools open beside it, showing the inspector panel with the `<h1>` element highlighted.

No CSS yet. No styling. Just the raw default browser rendering of structure. You will see
exactly what the browser does with HTML before any designer touches it — and that baseline
is important because CSS only ever changes things from this default, never from nothing.

---

> **Quick Check — answer before reading further:**
>
> 1. If you save a file called `index.html` on your desktop, how does the browser know it is a web page?
> 2. What do you think the browser shows if you forget to close a tag — for example `<h1>Hello` with no `</h1>`?
> 3. If you write `<p>one</p><p>two</p>`, will both paragraphs appear on the same line or different lines?
>
> *(Answers at the end of this lab)*

---

## Concept: The HTML Document

**What it is:** An HTML document is a plain text file with a `.html` extension that the
browser reads as instructions for building a web page.

**The problem without it:** A `.txt` file is just characters. The browser has no way to
know which characters are headings, which are paragraphs, or which are links. Everything
looks identical — flat text, no structure, no hierarchy.

**How it works:** The browser reads the file from top to bottom. When it encounters a tag
like `<h1>`, it knows: "this is the top-level heading." When it hits `<p>`, it knows: "this
is a paragraph of text." The tag names are a shared language between you (the author) and
the browser (the reader). You write tags, the browser creates visual elements from them.

The browser builds an internal tree from the tags. That tree is called the DOM (explained
below). Everything else — CSS, JavaScript, DevTools — works by reading or modifying that tree.

**The code:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Creative Web Portfolio</title>
  </head>
  <body>
    <h1>Hello, World</h1>
    <p>This is my first HTML file.</p>
  </body>
</html>
```

Every line has a job:

- `<!DOCTYPE html>` — tells the browser "this is modern HTML5, not an old format." Without
  it, browsers enter a compatibility mode that renders things slightly differently. Always include it.
- `<html lang="en">` — the root element. Everything inside is part of the page. `lang="en"`
  tells screen readers and search engines that the content is in English.
- `<head>` — contains information about the page that does not appear visibly. The title,
  character set, and later: CSS links.
- `<meta charset="UTF-8">` — tells the browser how to decode the file's bytes into characters.
  Without this, non-ASCII characters (accented letters, emoji) may display as garbage.
- `<title>` — the text that appears in the browser tab.
- `<body>` — everything inside here is what the browser renders visibly on screen.
- `<h1>` — heading level 1. The most important heading on the page. The browser makes it large
  and bold by default.
- `<p>` — a paragraph. The browser adds space above and below it by default.

**Try it differently:** Remove `<!DOCTYPE html>` from the top and reload. The page will look
the same on most content — but open DevTools console and you may see mode-related warnings,
and some CSS behaviors will differ subtly later. Put it back.

**Transfer:** HTML documents are one example of a markup language. Markdown (used in GitHub
README files and these lessons) is another. Both use special syntax to tell a renderer which
text is a heading and which is body text. The concept — "plain text plus structure markers"
— is the same.

---

## Concept: Browser Rendering

**What it is:** Browser rendering is the process of turning an HTML file (text) into a visual
page (pixels on screen).

**The problem without it:** If the browser just displayed the raw text of the HTML file, you
would see `<h1>Hello, World</h1>` literally — angle brackets and all. You need a program that
interprets the markup and paints a visual result.

**How it works:** When you open an HTML file in Chrome, Chrome reads it in several passes:

1. **Parse HTML** — read the tags, build the DOM tree (every element becomes a node)
2. **Apply CSS** — read any CSS (including browser defaults), calculate what each element looks like
3. **Layout** — figure out where each element sits on the screen (position, size)
4. **Paint** — draw the pixels

The critical insight: the browser has default CSS for every HTML element. A `<h1>` is large
and bold not because of anything you wrote, but because Chrome ships with a built-in stylesheet
that says `h1 { font-size: 2em; font-weight: bold }`. Your CSS overrides those defaults, it
does not create from nothing.

**The code:** No code here — this is a mental model. You will see it in action in Step 1.

**Try it differently:** Open any website in Chrome, go to DevTools > Elements panel, right-click
the `<h1>` tag and choose "Edit as HTML." Type something. The page updates in real time. The
browser is re-rendering from the modified DOM. Close DevTools without saving and reload — your
change disappears because you only edited the live DOM, not the file.

**Transfer:** Server-side rendering (Next.js, Django templates, Rails ERB) does the same parse-
and-render process on the server instead of the browser — the result is HTML sent to the client,
which the browser then renders. The rendering model is the same; only where it happens differs.

---

## Concept: The DOM

**What it is:** The DOM (Document Object Model) is the browser's live, in-memory tree structure
built from your HTML. It is the object JavaScript reads and modifies — not the HTML file itself.

**The problem without it:** If JavaScript read and wrote the `.html` file directly, every change
would require saving a file and reloading the page. The DOM exists as a live object in memory
that JavaScript can change instantly, and the browser re-renders the affected parts automatically.

**How it works:** After parsing the HTML, the browser creates a tree of node objects. The
`<html>` element is the root. `<head>` and `<body>` are its children. `<h1>` and `<p>` are
children of `<body>`. Each node is a JavaScript object with properties (like `.textContent`
and `.style`) and methods (like `.appendChild()`).

When you write `document.querySelector('h1').textContent = 'New Heading'` in JavaScript, you
are changing the DOM node's property. The browser sees the change and repaints the affected
area — the file on disk is untouched.

**What it hides:** The DOM hides the browser's internal repaint logic. You say "change this
text" and the browser figures out which pixels to redraw. You never write pixels directly.

**The raw version:** Without the DOM, changing page content would require regenerating and
re-serving the entire HTML document for every small change. This is what web apps did before
JavaScript — full page reloads for every interaction.

**The protected invariant:** The DOM is the single source of truth for what is currently on
screen. CSS, JavaScript, and DevTools all read and modify the same tree. There is no other
hidden state.

**The code:** You do not write DOM code in this lab. You will read it in DevTools.

**Try it differently:** You will try this at the end of the lab.

**Transfer:** The DOM concept — a live in-memory tree that is the runtime object for a static
document — appears in game engines as a scene graph (a tree of game objects), in React as the
virtual DOM, and in XML processors as a document tree. "Parse the file into a tree, manipulate
the tree, serialize back if needed" is a universal pattern.

---

## Concept: DevTools Inspector

**What it is:** Chrome DevTools Inspector is a panel built into the browser that lets you see,
examine, and temporarily modify the DOM tree and computed styles of any page.

**The problem without it:** When a page does not look right, you have no direct way to know
whether the problem is in the HTML (wrong tag), the CSS (wrong property), or a browser default
you did not know existed. Without DevTools, you make a change, save the file, reload, and look —
over and over, blind.

**How it works:** DevTools reads the live DOM and CSS, not your source files. When you click
an element in the inspector, it shows:
- The element's tag and attributes
- The CSS rules applied to it, in specificity order, from your file and the browser's defaults
- The computed styles — what the browser actually used after resolving all rules
- The box model diagram — exact content, padding, border, and margin sizes in pixels

Changes made in DevTools are live but temporary. Reload the page and they disappear.
This makes DevTools safe for experimentation: you can try anything without breaking your file.

**The code:** No code — DevTools is a tool, not syntax. You will use it in Step 3.

**Try it differently:** Open DevTools on any external website — say, the Google homepage.
Inspect the search bar. You will see the same panel with real CSS rules. DevTools works on
every website, not just ones you own.

**Transfer:** Every major browser (Chrome, Firefox, Safari, Edge) has equivalent DevTools.
Mobile simulators (in Chrome's device mode) use the same DOM inspection. In Node.js, the
equivalent is the `--inspect` flag, which opens a similar panel for server-side JavaScript.

---

## Step 1 — Create the File

Open VS Code (or any text editor). Create a new folder called `lab-00` inside the
`creative-web-masterclass/projects/` folder. Inside `lab-00`, create a file named `index.html`.

Type this exactly — do not copy-paste yet, type it:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Creative Web Portfolio</title>
  </head>
  <body>
    <h1>Hello, World</h1>
    <p>This is my first HTML file.</p>
  </body>
</html>
```

Save the file (`Ctrl+S` on Windows, `Cmd+S` on Mac).

---

> **SAVE AND TRY**
>
> Open File Explorer (or Finder), navigate to the `lab-00` folder, and double-click
> `index.html`. Chrome should open and display:
>
> - A large bold "Hello, World" heading
> - A paragraph "This is my first HTML file."
> - The tab title reads "Creative Web Portfolio"
>
> If you see the raw HTML text (`<h1>Hello, World</h1>` literally), the file opened in a
> text editor, not a browser. Right-click the file → Open With → Google Chrome.

---

## Step 2 — See the Browser's Default Styles

Look at the heading. Notice two things the browser added with no CSS from you:

1. The text is large (roughly 32px on most browsers)
2. The text is bold
3. There is space below the heading before the paragraph

None of that came from your file. It came from the browser's built-in stylesheet. You are
about to see exactly where those styles come from.

---

## Step 3 — Open DevTools

Press `F12` (or right-click anywhere on the page → Inspect). DevTools opens.

Click the **Elements** tab if it is not already selected. You will see the DOM tree:

```
▼ <html lang="en">
  ▶ <head>
  ▼ <body>
      <h1>Hello, World</h1>
      <p>This is my first HTML file.</p>
  </body>
</html>
```

Click on `<h1>Hello, World</h1>` in the Elements panel. The heading on the page gets a blue
highlight. On the right side of DevTools, the **Styles** panel shows the CSS rules for that element.

You will see a section called `user agent stylesheet` — that is the browser's built-in CSS.
It shows something like:

```css
h1 {
  display: block;
  font-size: 2em;
  font-weight: bold;
  margin-block-start: 0.67em;
  margin-block-end: 0.67em;
}
```

This is why your heading is large and bold. The browser applied those rules before you wrote
a single line of CSS. Every HTML element has similar built-in defaults.

---

> **SAVE AND TRY**
>
> In the Styles panel, find the `font-size: 2em` rule under `user agent stylesheet`.
> Click on the `2em` value and change it to `4em`. Press Enter.
>
> The heading on the page immediately becomes twice as large.
>
> Now reload the page (`F5` or `Ctrl+R`). The heading returns to its original size.
>
> **Why:** You edited the live DOM, not your file. DevTools changes are temporary.
> This is safe to do — you can break anything in DevTools and reload to undo.

---

## Step 4 — Read the Computed Styles

In DevTools, click the **Computed** tab (next to Styles). This shows the final resolved
values for every CSS property on the `<h1>` element.

Find `font-size` in the list. The value is probably `32px`. That is what `2em` resolved to
on your screen (it depends on the browser's default root font size, which is 16px: `2 × 16 = 32`).

This distinction — written value (`2em`) versus computed value (`32px`) — comes up constantly.
CSS has relative units that mean different things in different contexts. The Computed tab always
shows what the browser actually used.

---

> **SAVE AND TRY**
>
> In the Elements panel, click the `<p>` element. Look at its Computed tab. Find `margin-top`
> and `margin-bottom`. You will see values even though you wrote no margins.
>
> These are the browser defaults for `<p>`. CSS resets (which you will write in a later lab)
> exist specifically to zero these out and start from a known baseline.

---

## Step 5 — Add a Second Element

Go back to your `index.html` file. Add one more line inside `<body>`, after the paragraph:

```html
<a href="https://threejs.org">Learn Three.js</a>
```

The full body is now:

```html
<body>
  <h1>Hello, World</h1>
  <p>This is my first HTML file.</p>
  <a href="https://threejs.org">Learn Three.js</a>
</body>
```

Save the file and reload the browser.

---

> **SAVE AND TRY**
>
> A link appears below the paragraph. Click it — Three.js documentation opens in the same tab.
> Press the back button to return.
>
> In DevTools, inspect the `<a>` element. In the Styles panel, look for the user agent
> stylesheet rules for `a`. You will see `color: -webkit-link` and `text-decoration: underline`.
>
> That blue underlined style is the browser default for links — again, no CSS from you.

---

## What Just Happened

You wrote 12 lines of HTML. The browser turned them into:
- A styled heading
- A paragraph with margin above and below
- A blue underlined link

Not because of anything you did — because the browser ships with a built-in stylesheet that
defines default appearances for every HTML element. This matters because:

1. **CSS is not additive from nothing** — it is additive from those defaults. When you write
   `h1 { font-size: 1rem; }` later, you are overriding `2em`, not writing font-size from scratch.

2. **DevTools is your primary debugging tool** — every CSS problem you encounter in this course
   should be investigated first by inspecting the element and reading the Computed tab.

3. **The DOM is live** — DevTools changes are instant and temporary. This makes it the safest
   place to experiment. You will use this constantly.

---

## Self-Check

Answer these from memory before checking:

1. What are the three things that happen before the browser shows anything on screen?
2. What is the difference between the `<head>` and the `<body>`?
3. In DevTools, what does the Computed tab show that the Styles tab does not?
4. You change a color in DevTools and it looks great. You close DevTools and reload. What happens?
5. Where does the default bold styling on `<h1>` come from — your file, or the browser?

---

## What's Next

LAB 01 introduces VS Code Live Server, which watches your file and refreshes the browser
automatically on every save — so you stop pressing F5 and start just seeing changes.

---

## Transfer Exercise

HTML's concept of "markup tags giving meaning to plain text" appears outside the web.
Open a Markdown file (like this lesson file, or a GitHub README).

Find three examples where a Markdown syntax element (`#`, `**`, `-`, `>`) does the same job
as an HTML tag — it gives meaning to text that would otherwise be indistinguishable from
surrounding content.

Write one sentence for each example explaining what role the element plays and what would
change if it were removed.

---

## Quick Check Answers

1. **How does the browser know it is a web page?** By the `.html` file extension and the
   `<!DOCTYPE html>` declaration inside. The extension tells the operating system to open it
   in a browser; the DOCTYPE tells the browser which parsing rules to apply.

2. **What happens if you forget to close a tag?** Most browsers are forgiving — they will
   auto-close unclosed tags to produce a valid DOM. For `<h1>Hello` without `</h1>`, Chrome
   will treat the rest of the body content as part of the heading. The result is visible but
   wrong. DevTools will show the auto-corrected DOM, which may differ from what you wrote.

3. **Will two `<p>` tags appear on the same line?** No — `<p>` is a block element. The browser
   puts block elements on their own lines with margins above and below. If you want two text
   pieces on the same line, you use inline elements like `<span>`, or later, CSS flexbox.

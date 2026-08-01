# LAB-004 — How Browsers Work: Parsing, Rendering, and the JS Engine

**Series:** FOUNDATIONS — Part I: How Computers Work
**Prerequisite Labs:** LAB-000 (Binary, Bytes), LAB-001 (Stack/Heap), LAB-002 (Event Loop), LAB-003 (TCP/HTTP)
**Time estimate:** 75–90 minutes

---

## What You Will Be Able to Do After This Lab

- Explain exactly what happens between "HTML arrives over the network" and "pixels appear on screen"
- Explain why a `<script>` tag at the top of a page makes the page load slower
- Explain what the DOM is and why it is not the same as HTML
- Predict what triggers a reflow and why it is expensive
- Explain what "JavaScript engine" means and why long JS tasks freeze the UI

---

## Prerequisites

You are assumed to know:
- **Event Loop** (LAB-002): JS runs on a single thread, the event loop processes one task at a time
- **HTTP** (LAB-003): HTML arrives as bytes over the network
- **Call Stack** (LAB-001): Functions push and pop frames

---

## The Hook — The Page Is Not The HTML

Open a browser. Navigate to `https://example.com`. Open DevTools (F12). Go to the **Console** tab.

Type this and press Enter:

```javascript
document.querySelectorAll("*").length
```

**SAVE AND TRY:** You should see a number — probably something like `8` or `10`. That is how many elements are on the page.

Now try:

```javascript
document.querySelectorAll("*")
```

Expand the `HTMLCollection` in the console. You can see every element on the page — `html`, `head`, `body`, `h1`, `p`, `a` — as live JavaScript objects. You can click on any of them and inspect their properties.

**The question:** The browser received bytes over the network (LAB-003). These bytes were a text file with angle brackets and tag names. Now you are holding a tree of live objects in JavaScript. How did one become the other?

That transformation is what this lab is about.

---

## Concept Block 1 — HTML Parsing and the DOM Tree

**What it is:**
The DOM (Document Object Model) is a tree data structure the browser builds by reading HTML. Each HTML element becomes a node in the tree. The DOM is not a string — it is an in-memory object graph that JavaScript can read and modify.

**The problem before:**
Without the DOM, JavaScript would have to parse HTML strings to find elements. Finding "the third paragraph inside the second div" would require custom string parsing for every operation. Browsers would need to re-read the raw text file every time anything changed.

**The solution:**
The browser parses HTML once and builds a tree of objects. JavaScript then works with the tree — not the original text. This means "find the element with id='title'" is a fast lookup on a structured object, not a text search.

**What it hides:**
The DOM hides byte-stream parsing — converting raw UTF-8 bytes from the network into a typed tree of objects with methods, properties, and parent/child relationships. It also hides the tokenizer and tree construction algorithms that handle malformed HTML (yes, browsers silently fix your bad HTML).

**The invariant it protects:**
Once you have a DOM node, it is always in sync with the page. Modifying `element.textContent` immediately changes what the user sees — you never have to manually write back to a string.

**Canonical example:**

This HTML:
```html
<html>
  <body>
    <h1>Hello</h1>
    <p>World</p>
  </body>
</html>
```

Becomes this tree:
```
Document
└── html
    └── body
        ├── h1 → "Hello"
        └── p  → "World"
```

Each box is a JavaScript object. `body` has a `.children` array. `h1` has a `.parentElement` pointing back to `body`.

**Smallest possible example — run in DevTools console on any page:**

```javascript
// Create a new element
const el = document.createElement("p");
el.textContent = "I was created in JavaScript";

// Attach it to the tree
document.body.appendChild(el);

// Read it back — it is now part of the tree
console.log(document.body.lastChild.textContent);
// → "I was created in JavaScript"

// Remove it
document.body.removeChild(el);
console.log(document.body.lastChild.textContent);
// → whatever was last before we added our paragraph
```

**SAVE AND TRY:** Run each line one at a time. After `appendChild`, look at the page — the new paragraph appears. After `removeChild`, it disappears. You are directly manipulating the live object graph.

**Change something:** Try `document.body.firstChild.textContent = "CHANGED"`. What happens to the page? Can you change it back?

**Why it matters:**
Every UI framework — React, Vue, Angular — exists to manage the DOM. When you later see React's "virtual DOM," you will understand exactly what it is diffing and why.

**You will see this again in:**
LAB-102 (React) — React's reconciler computes the minimum DOM changes needed. LAB-103 (React hooks) — `useRef` holds a reference to a DOM node.

**Watch for:**
`document.getElementById`, `querySelector`, `querySelectorAll`, `createElement`, `appendChild`, `removeChild`, `innerHTML`, `textContent`. Every one of these is a DOM operation.

---

## Concept Block 2 — CSS Parsing and the CSSOM

**What it is:**
While the browser parses HTML into the DOM, it also parses CSS into the CSSOM (CSS Object Model) — a separate tree of style rules. Like the DOM, the CSSOM is a structured object, not a string.

**The problem before:**
Without a parsed CSS tree, applying styles would mean scanning all stylesheet text on every paint. Specificity rules (which CSS selector "wins" when two rules conflict) would require re-parsing text on every query.

**The solution:**
The browser parses all CSS into an in-memory rule tree. When it needs to know what color an element should be, it queries the CSSOM — no string scanning required.

**What it hides:**
Cascade resolution — the algorithm that computes which CSS rule wins when ten different rules all apply to the same element. The browser handles selector specificity, inheritance, and `!important` so you only see the final computed style.

**Smallest possible example — run in DevTools console:**

```javascript
// Get the computed styles for the body element
const styles = window.getComputedStyle(document.body);

// Read a CSS property — this comes from the CSSOM
console.log(styles.getPropertyValue("font-family"));
console.log(styles.getPropertyValue("color"));
console.log(styles.getPropertyValue("margin"));
```

**SAVE AND TRY:** Run this on `example.com` or any page. You should see the actual computed values — not just what YOU wrote in CSS, but the final resolved value after all rules are applied and inherited.

**Watch for:**
Any time you see `element.style.color = "red"` or `window.getComputedStyle(el)` — that is the CSSOM being read or written.

---

## Concept Block 3 — The Rendering Pipeline (Critical Rendering Path)

**What it is:**
The sequence of steps a browser takes to turn HTML and CSS into pixels. The steps always happen in this order:

```
Parse HTML → DOM
Parse CSS  → CSSOM
               ↓
        Render Tree (DOM + CSSOM merged — only visible elements)
               ↓
        Layout (compute position and size of every box)
               ↓
        Paint (fill pixels: colors, text, images)
               ↓
        Composite (layer the painted results onto screen)
```

**The problem before:**
If you do not understand this pipeline, you make invisible performance mistakes. You will write code that reads a layout property, then writes a style, then reads again — causing the browser to redo the entire pipeline multiple times per frame. Developers did this for years without knowing why animations stuttered.

**The most important thing to know:**
JavaScript runs on the **same thread** as this pipeline (LAB-002). The pipeline cannot run while JavaScript is running. JavaScript cannot run while the pipeline is running. This is why long JavaScript tasks freeze animations.

**SAVE AND TRY — Watch the pipeline in DevTools Performance tab:**

1. Go to `https://example.com`
2. Open DevTools → **Performance** tab
3. Click the record button
4. Reload the page
5. Stop recording
6. Look at the flame chart — find the "Parse HTML," "Recalculate Style," "Layout," and "Paint" blocks

You are seeing the actual browser rendering pipeline for a real page load. Every bar is one step. You can hover over any bar to see how long it took.

---

## Concept Block 4 — Reflow and Layout Thrashing

**What it is:**
A **reflow** (also called a **layout**) is when the browser recomputes the position and size of every element on the page. This is expensive — the browser must walk the entire render tree and do geometry calculations.

A reflow is triggered whenever:
- You add or remove elements from the DOM
- You change a CSS property that affects layout (width, height, margin, padding, font-size, etc.)
- You **read** certain layout properties in JavaScript after writing to the DOM

**The problem — layout thrashing:**

This pattern is a performance trap:

```javascript
// DO NOT DO THIS — this causes layout thrashing
for (let i = 0; i < 1000; i++) {
  element.style.width = element.offsetWidth + 1 + "px";
}
```

Here is exactly what happens on every iteration:
1. `element.style.width = ...` → browser marks layout as "dirty" (needs recalculation)
2. `element.offsetWidth` → JavaScript is asking for a layout value, so the browser is **forced to immediately run a full layout** before returning the value — even though we are inside a loop
3. Repeat 1000 times → 1000 forced layouts

This is "layout thrashing." It makes animations slow and pages freeze.

**SAVE AND TRY — see the freeze:**

Create a new file `reflow-demo.html`:

```html
<!DOCTYPE html>
<html>
<body>
  <div id="box" style="width: 100px; height: 100px; background: steelblue;"></div>
  <button id="bad">Bad (thrashing)</button>
  <button id="good">Good (batched)</button>
  <p id="time"></p>

  <script>
    const box = document.getElementById("box");
    const timeEl = document.getElementById("time");

    document.getElementById("bad").onclick = function() {
      const start = performance.now();
      
      // FORCES REFLOW ON EVERY ITERATION
      for (let i = 0; i < 5000; i++) {
        box.style.width = box.offsetWidth + 0.001 + "px";
      }
      
      const end = performance.now();
      timeEl.textContent = "Bad: " + Math.round(end - start) + "ms";
    };

    document.getElementById("good").onclick = function() {
      const start = performance.now();
      
      // READ ONCE — then write without reading in the loop
      let currentWidth = box.offsetWidth;
      for (let i = 0; i < 5000; i++) {
        currentWidth += 0.001;
      }
      box.style.width = currentWidth + "px";
      
      const end = performance.now();
      timeEl.textContent = "Good: " + Math.round(end - start) + "ms";
    };
  </script>
</body>
</html>
```

Open this file directly in your browser (no server needed — just double-click the file).

**SAVE AND TRY:** Click "Bad" first. Then click "Good." The difference in milliseconds shows the cost of layout thrashing. On slow machines the "Bad" button may visibly freeze the page for a moment.

**Change something:** Increase the loop count from 5000 to 20000. Does "Bad" get 4× slower? Does "Good" barely change?

**The fix — batch reads before writes:**

```javascript
// CORRECT PATTERN: All reads first, then all writes
const width = box.offsetWidth;      // READ
const height = box.offsetHeight;    // READ (no reflow — layout still clean)

box.style.width = width + 10 + "px";    // WRITE
box.style.height = height + 10 + "px";  // WRITE (one reflow at the end)
```

**Why it matters:**
Every time you see a performance problem with animations or interactions in a browser app — layout thrashing is a top suspect. Reading `offsetWidth`, `offsetHeight`, `getBoundingClientRect()`, `scrollTop`, `clientWidth` after writing styles causes forced reflow.

**You will see this again in:**
LAB-102 (React) — React's virtual DOM exists largely to batch DOM writes and avoid this problem. The reconciler writes all changes in one pass.

**Watch for:**
Properties that force layout when read: `offsetWidth`, `offsetHeight`, `offsetTop`, `offsetLeft`, `scrollTop`, `scrollHeight`, `clientWidth`, `clientHeight`, `getBoundingClientRect()`. If you see any of these inside a loop or after a style write — check for thrashing.

---

## Concept Block 5 — Script Tags and Render Blocking

**What it is:**
When the HTML parser encounters a `<script>` tag, it **stops parsing HTML**, downloads the script, executes it, and only then continues parsing. This means a `<script>` at the top of a page can delay the first visible content by the full script download + execution time.

**The problem — you have seen this site:**

```html
<!-- THIS PATTERN MAKES PAGES LOAD SLOW -->
<html>
<head>
  <script src="huge-library.js"></script> <!-- Download + execute BEFORE any HTML is parsed -->
</head>
<body>
  <h1>This text does not appear until the script finishes</h1>
</body>
</html>
```

While `huge-library.js` is downloading (could be seconds on a slow connection), the page is completely blank. The user stares at white.

**The solution — `defer` and `async`:**

```html
<!-- DEFER: download in parallel, execute after HTML is fully parsed -->
<script src="app.js" defer></script>

<!-- ASYNC: download in parallel, execute immediately when download finishes -->
<!-- (does NOT wait for HTML parsing — risky if the script needs the DOM) -->
<script src="analytics.js" async></script>

<!-- BEST PRACTICE: scripts at the bottom of body (legacy approach, still common) -->
<body>
  <h1>Content loads immediately</h1>
  <script src="app.js"></script> <!-- Parses last, DOM is already built -->
</body>
```

**SAVE AND TRY — see render blocking:**

Create `script-blocking.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Script Blocking Demo</title>
  <!-- This inline script runs BEFORE the body is parsed -->
  <script>
    // Try to find an element that does not exist yet
    const h1 = document.querySelector("h1");
    console.log("h1 found in head:", h1);
    // → null — the h1 has not been parsed yet!
  </script>
</head>
<body>
  <h1>Hello from the body</h1>

  <!-- This inline script runs AFTER the body is parsed -->
  <script>
    const h1Again = document.querySelector("h1");
    console.log("h1 found at bottom of body:", h1Again);
    // → <h1>Hello from the body</h1> — now it exists
  </script>
</body>
</html>
```

Open in browser with DevTools Console open.

**SAVE AND TRY:** You should see `null` first, then the `h1` element. This is why scripts placed in `<head>` without `defer` cannot access DOM elements — those elements do not exist yet when the script runs.

**Change something:** Move the second `<script>` block to inside `<head>` (before the first `<script>`). Now both should log `null`. Move it back.

**Why it matters:**
"Why is my page blank for 3 seconds?" — render-blocking scripts. This is a real production bug in every legacy web application.

**You will see this again in:**
LAB-102 (React) — React apps ship a bundle. How that bundle tag is placed determines Time to First Contentful Paint. You will configure `defer` in your webpack/vite config.

---

## Concept Block 6 — The JavaScript Engine (V8 and JIT Compilation)

**What it is:**
JavaScript is not interpreted line by line at runtime. Modern browsers use a **JIT compiler** (Just-In-Time compiler) — an engine that watches which functions run frequently, compiles them to native machine code on the fly, and replaces the interpreted version with the compiled version.

V8 is Chrome's JavaScript engine. SpiderMonkey is Firefox's. Safari uses JavaScriptCore. They all implement the same idea: start fast (interpret), get faster (compile hot paths).

**The problem before JIT:**
Early JavaScript engines (early 2000s) interpreted every line at runtime. Google Maps in 2005 was slow enough that most browsers barely handled it. As JavaScript took on more complex applications, pure interpretation was too slow.

**The solution — JIT compilation:**

```
Your JS code
    ↓
Parse → AST (Abstract Syntax Tree)
    ↓
Bytecode interpreter (runs immediately — no warm-up)
    ↓          ↑ if function becomes "cold" again
JIT compiler (if function is called often, compile to native machine code)
    ↓
Native machine code (runs at near-native speed)
```

**What it hides:**
JIT compilation hides the fact that your JavaScript is not directly executed as written. V8 generates x86 or ARM instructions from your source code. The browser handles the entire compilation pipeline invisibly.

**Why this matters for single-threaded rendering:**

The JIT compiler runs on the **same thread** as the event loop (LAB-002) and the rendering pipeline. This is why:
- A long-running JavaScript function (compiling a large script, a heavy computation loop) freezes the page
- The browser cannot paint a new animation frame while JavaScript is running
- Browsers show "page is unresponsive" if JS runs for more than ~5 seconds

**SAVE AND TRY — freeze the frame:**

Run this in DevTools Console:

```javascript
// This freezes the page for ~1-2 seconds — same pattern as LAB-002
const start = performance.now();
let x = 0;
while (performance.now() - start < 2000) {
  x++;
}
console.log("Counted to:", x, "in 2 seconds");

// Notice: if you had an animation running, it froze for those 2 seconds
```

**SAVE AND TRY:** While this runs (it takes 2 seconds), try clicking on the page. Nothing responds. The event loop is blocked — the rendering pipeline cannot run, DOM events cannot fire.

This is the same concept from LAB-002, but now you see the rendering consequence: the frame does not update. A 60fps animation needs a new frame every 16.6ms. If JS takes 2000ms, you miss 120 frames.

**Change something:** Reduce the `2000` to `100`. You will barely notice. Increase to `5000` — you may get a "page unresponsive" dialog from the browser.

**You will see this again in:**
LAB-002 (Event Loop) — the theory behind why this blocks. LAB-109 (Web Workers) — moving heavy computation off the main thread. LAB-110 (Performance) — profiling JS execution time.

**Watch for:**
Long loops, recursive computations, heavy string/array processing in the main thread. Any of these can cause dropped frames.

---

## Concept Block 7 — `DOMContentLoaded` vs `load`

**What it is:**
Two events signal page readiness, and they fire at different times:

- `DOMContentLoaded` — fires when HTML is fully parsed and the DOM is built. CSS, images, and other resources may still be loading.
- `load` — fires when everything is finished: HTML, CSS, images, fonts, iframes, everything.

**Why this matters:**
Code that accesses DOM elements must wait for `DOMContentLoaded` at minimum. Code that depends on images being fully loaded (reading `img.naturalWidth`, for example) must wait for `load`. Using the wrong one causes bugs that only appear sometimes (on slow connections, images are not loaded yet when your code runs).

**Smallest possible example:**

Create `events-demo.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <script>
    // Runs immediately — DOM not ready
    console.log("Script in head:", document.body);  // null

    document.addEventListener("DOMContentLoaded", function() {
      console.log("DOMContentLoaded fired — DOM is ready");
      console.log("h1 text:", document.querySelector("h1").textContent);
    });

    window.addEventListener("load", function() {
      console.log("load fired — everything is ready");
    });
  </script>
</head>
<body>
  <h1>Hello</h1>
  <img src="https://example.com/nonexistent.jpg" onerror="console.log('image error')">
</body>
</html>
```

**SAVE AND TRY:** Open in browser with Console open. Watch the order of log messages. `DOMContentLoaded` fires before the image finishes (or errors). `load` fires after.

---

## The Full Picture — Putting It Together

Here is the complete sequence from URL to pixels, combining LAB-003 and LAB-004:

```
1. DNS lookup → IP address (LAB-003)
2. TCP handshake (LAB-003)
3. HTTP GET request sent (LAB-003)
4. Server sends HTTP response with HTML bytes (LAB-003)

5. Browser receives bytes → tokenizer → parser
6. Parser builds DOM nodes as tags are read
7. Parser hits <link rel="stylesheet"> → fetch CSS file
8. Parser hits <script> → STOP, download, execute, then continue (render blocking!)
9. CSS arrives → CSSOM built
10. DOM + CSSOM combined → Render Tree (only visible elements)
11. Layout: browser computes x, y, width, height of every render tree node
12. Paint: browser fills pixels — colors, borders, text, background images
13. Composite: browser combines painted layers onto screen
14. DOMContentLoaded fires
15. Images and other resources finish loading
16. load fires
```

JavaScript can interrupt this pipeline at any point after step 6. That is why step 8 is so important.

---

## Challenge

**Your task:** Write a function called `measureReflow` that demonstrates layout thrashing measurably. The function should:

1. Create 100 `<div>` elements and append them to the body
2. Time how long it takes to run 100 iterations of this loop using the **thrashing pattern** (read `offsetWidth` then write `style.width` in the same loop)
3. Clean up (remove all divs)
4. Create 100 fresh divs
5. Time how long it takes to run 100 iterations using the **correct pattern** (read all widths first, then write all widths)
6. Clean up again
7. Return an object: `{ thrashingMs: number, batchedMs: number }`

Log the result and verify that `thrashingMs` is measurably greater than `batchedMs`.

Requirements:
- Use `performance.now()` for timing (not `Date.now()`)
- Works when pasted into DevTools console — no build step
- Cleans up after itself (no leftover divs on the page)

**Try it yourself before reading the solution.**

<details>
<summary>Solution</summary>

```javascript
function measureReflow() {
  function createDivs(count) {
    const divs = [];
    for (let i = 0; i < count; i++) {
      const div = document.createElement("div");
      div.style.width = "100px";
      div.style.height = "10px";
      div.style.background = "steelblue";
      div.style.marginBottom = "1px";
      document.body.appendChild(div);
      divs.push(div);
    }
    return divs;
  }

  function cleanup(divs) {
    divs.forEach(div => document.body.removeChild(div));
  }

  // THRASHING PATTERN: read then write in the same loop
  const divs1 = createDivs(100);
  const start1 = performance.now();
  for (let i = 0; i < 100; i++) {
    const w = divs1[i].offsetWidth;     // READ → forces layout
    divs1[i].style.width = (w + 1) + "px";  // WRITE → marks layout dirty
  }
  const thrashingMs = performance.now() - start1;
  cleanup(divs1);

  // BATCHED PATTERN: all reads first, then all writes
  const divs2 = createDivs(100);
  const start2 = performance.now();
  const widths = divs2.map(div => div.offsetWidth);  // ALL READS
  for (let i = 0; i < 100; i++) {
    divs2[i].style.width = (widths[i] + 1) + "px";  // ALL WRITES
  }
  const batchedMs = performance.now() - start2;
  cleanup(divs2);

  return { thrashingMs, batchedMs };
}

const result = measureReflow();
console.log(result);
console.log(`Thrashing was ${(result.thrashingMs / result.batchedMs).toFixed(1)}x slower`);
```

**Key insight:** The `offsetWidth` read inside the loop forces the browser to complete a full layout pass before returning the value — even though layout was just marked dirty by the previous write. This forces 100 layout passes. The batched version reads all widths while layout is still clean (one pass), then writes all at once (one pass at the end). The ratio is often 10×–50× on a modern machine — and gets worse on lower-end hardware.

**Why `.map` for reads?** `divs2.map(div => div.offsetWidth)` reads all 100 widths in one pass, before any writes happen. This works because reading `offsetWidth` when layout is *clean* does not trigger a new layout — only reading after a write does.

</details>

---

## Summary

| Concept | What It Is | Key Fact |
|---|---|---|
| DOM | In-memory tree of objects built from HTML | Not the same as your HTML file |
| CSSOM | In-memory tree of style rules built from CSS | Cascade computed here |
| Render Tree | DOM + CSSOM merged | Only visible elements included |
| Layout (Reflow) | Computing position/size of every element | Expensive — avoid in loops |
| Paint | Filling pixels with colors, text, images | Triggered by layout or style changes |
| Critical Rendering Path | The full pipeline from HTML to pixels | JS blocks this pipeline |
| Render Blocking | `<script>` stops HTML parsing until executed | Use `defer` to fix |
| JIT Compilation | Browser compiles hot JS to native code on the fly | Same thread as rendering |
| DOMContentLoaded | Fires when DOM is built | Before images load |
| load | Fires when everything is loaded | After images, fonts, etc. |

**The single most important thing from this lab:**
JavaScript runs on the same thread as the rendering pipeline. Long JS tasks freeze the page. Reading layout properties after writing styles forces an immediate reflow. Both of these are why UI performance is hard.

---

*Next: LAB-005 — Operating Systems: Files, Processes, and System Calls*

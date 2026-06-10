# Creative Web Masterclass — LAB 33 — Terminal Section: Typewriter Animation

**Prerequisites:** LAB-32 (portfolio with hero, work, canvas sections complete).

**What this lab adds:**
- A Terminal section that looks like a code editor / console
- A typewriter animation that types out text one character at a time
- A blinking cursor that pauses between lines
- The animation triggers only when the section scrolls into view

**Time:** 35–45 minutes

---

## What You Will Build

```
 ┌──────────────────────────────────────────────────────┐
 │  Skills                                              │
 │  ●  ●  ●    terminal.js                              │
 │  ──────────────────────────────────────────          │
 │  $ const skills = {                                  │
 │  >   frontend: ['HTML', 'CSS', 'JavaScript'],        │
 │  >   creative: ['Three.js', 'Canvas 2D', 'GLSL'],   │
 │  >   tools:    ['Git', 'Figma', 'Node.js']           │
 │  > }                                                 │
 │  > skills.creative.forEach(s => console.log(s))     │
 │  Three.js                                            │
 │  Canvas 2D                                           │
 │  GLSL█   ← blinking cursor                           │
 └──────────────────────────────────────────────────────┘
```

---

> **Quick Check — answer before reading further:**
>
> 1. `setTimeout` runs once after a delay. `setInterval` runs repeatedly. For typing
>    one character at a time with a delay between each, which is more appropriate and why?
> 2. The animation should only start when the section scrolls into view. What API detects
>    when an element enters the viewport?
> 3. A blinking cursor is just a character that toggles visible/invisible. What CSS
>    property and `@keyframes` would you use?
>
> *(Answers at the end)*

---

## Concept: Typewriter with setTimeout

**What it is:** A typewriter function takes a string and a target element. It uses
`setTimeout` to schedule writing one character at a time:

```js
function typeString(text, element, delay, onDone) {
  let i = 0;

  function typeNext() {
    if (i < text.length) {
      element.textContent += text[i];
      i++;
      setTimeout(typeNext, delay);
    } else {
      if (onDone) onDone();   // call next line's function when done
    }
  }

  typeNext();
}
```

`typeNext` calls itself recursively via `setTimeout`. Each call adds one character.
When `i` reaches the end of the string, it calls `onDone` — which can start typing
the next line.

Why `setTimeout` and not `setInterval`? With `setInterval`, the interval keeps firing
even if the function runs slowly. `setTimeout` reschedules after each character, so
the timing is always relative to when the previous character finished. It is also easier
to cancel a chain of `setTimeout` calls by simply not rescheduling.

---

## Concept: Blinking Cursor

**What it is:** A `<span>` styled with a background color and an `animation` that
toggles `opacity` on and off:

```css
.cursor {
  display: inline-block;
  width: 8px;
  height: 1.1em;
  background: var(--color-primary);
  vertical-align: text-bottom;
  animation: blink 0.9s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
```

`step-end` is a timing function like `ease` but it jumps instantly rather than
interpolating. This makes the cursor snap between visible and invisible (a real blink)
rather than fading.

---

## Step 1 — Update index.html (Terminal Section)

Replace the terminal section placeholder:

```html
<section id="terminal" class="port-section section-terminal">
  <div class="section-inner">

    <div class="section-header">
      <p class="section-eyebrow">Under the hood</p>
      <h2 class="section-title">Skills</h2>
    </div>

    <div class="terminal-window">
      <div class="terminal-titlebar">
        <span class="terminal-dot terminal-dot--red"></span>
        <span class="terminal-dot terminal-dot--yellow"></span>
        <span class="terminal-dot terminal-dot--green"></span>
        <span class="terminal-filename">terminal.js</span>
      </div>
      <div class="terminal-body">
        <div class="terminal-output" id="terminal-output"></div>
        <span class="cursor" id="terminal-cursor"></span>
      </div>
    </div>

  </div>
</section>
```

The `#terminal-output` div is where lines will be appended by JavaScript. The
`#terminal-cursor` span follows the last character.

---

## Step 2 — Styles

Add these to `styles.css`:

```css
/* ---- Terminal window ---- */
.terminal-window {
  background: hsl(240, 22%, 10%);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  font-family: 'Courier New', Courier, monospace;
  max-width: 620px;
}

/* macOS-style traffic-light buttons */
.terminal-titlebar {
  background: var(--color-surface);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--color-border);
}

.terminal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.terminal-dot--red    { background: hsl(8, 85%, 58%); }
.terminal-dot--yellow { background: hsl(40, 90%, 55%); }
.terminal-dot--green  { background: hsl(142, 70%, 50%); }

.terminal-filename {
  margin-left: 12px;
  font-size: 0.78rem;
  color: var(--color-muted);
  font-family: system-ui, sans-serif;
}

.terminal-body {
  padding: 24px;
  min-height: 260px;
  line-height: 1.7;
  font-size: 0.9rem;
  color: hsl(240, 5%, 82%);
}

/* Each line in the terminal output */
.terminal-line { display: block; }
.terminal-line--prompt { color: hsl(152, 60%, 55%); }     /* green $ prompt */
.terminal-line--output { color: hsl(175, 60%, 70%); }      /* teal output */
.terminal-line--comment { color: var(--color-muted); }      /* dimmed comment */

/* Blinking cursor: step-end makes it snap on/off instead of fading */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.cursor {
  display: inline-block;
  width: 8px;
  height: 1.1em;
  background: var(--color-primary);
  vertical-align: text-bottom;
  animation: blink 0.9s step-end infinite;
}
```

---

> **CSS AND SEE**
>
> **You should see:** A dark terminal window with a titlebar showing three coloured dots
> and a filename. The body is empty. The blinking cursor appears immediately. The
> typewriter effect needs JavaScript.

---

## Step 3 — JavaScript: Typewriter

Append this block to `main.js`:

```js
// ---- Terminal typewriter ----
const terminalOutput = document.getElementById('terminal-output');
const terminalCursor = document.getElementById('terminal-cursor');

// Lines to type — each has text and a CSS class for colour
const LINES = [
  { text: '$ const skills = {',                           cls: 'terminal-line--prompt' },
  { text: '>   frontend: ["HTML", "CSS", "JavaScript"],', cls: '' },
  { text: '>   creative: ["Three.js", "Canvas 2D"],',     cls: '' },
  { text: '>   tools:    ["Git", "Figma", "Node.js"]',    cls: '' },
  { text: '> }',                                          cls: '' },
  { text: '> skills.creative.forEach(s => console.log(s))', cls: 'terminal-line--prompt' },
  { text: 'Three.js',  cls: 'terminal-line--output' },
  { text: 'Canvas 2D', cls: 'terminal-line--output' },
];

let typingStarted = false;

// Type one character at a time, then call onDone when finished
function typeLine(text, lineEl, charDelay, onDone) {
  let i = 0;
  function next() {
    if (i < text.length) {
      lineEl.textContent += text[i];
      i++;
      setTimeout(next, charDelay);
    } else {
      if (onDone) onDone();
    }
  }
  next();
}

// Chain all lines: when each line finishes, start the next one
function typeAllLines(lineIndex) {
  if (lineIndex >= LINES.length) return;  // all done

  const lineData = LINES[lineIndex];

  // Create the <span> for this line
  const lineEl = document.createElement('span');
  lineEl.classList.add('terminal-line');
  if (lineData.cls) lineEl.classList.add(lineData.cls);
  terminalOutput.appendChild(lineEl);
  // Move cursor to follow the end of the latest line
  terminalOutput.appendChild(terminalCursor);

  // Type this line, then wait 280ms before starting the next
  typeLine(lineData.text, lineEl, 28, function () {
    lineEl.appendChild(document.createTextNode('\n'));  // newline after each line
    setTimeout(function () {
      typeAllLines(lineIndex + 1);
    }, 280);
  });
}

// Only start typing once the terminal section is 20% visible
const terminalObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting && !typingStarted) {
      typingStarted = true;
      typeAllLines(0);
      terminalObserver.disconnect();  // no need to watch after starting
    }
  });
}, { threshold: 0.2 });

const terminalSection = document.getElementById('terminal');
terminalObserver.observe(terminalSection);
```

Walk through the structure:

- `LINES` is an array of objects — each has the text to type and a CSS class for color.
- `typeLine` handles one line. It keeps a local `i` counter and schedules one character
  at a time using `setTimeout`. When `i` reaches the end, it calls `onDone`.
- `typeAllLines` is the sequencer. It creates a `<span>` for the current line, calls
  `typeLine`, and in the `onDone` callback schedules `typeAllLines(lineIndex + 1)` with
  a 280ms pause between lines.
- `terminalObserver.disconnect()` stops watching after the animation starts — there's no
  reason to fire again if the user scrolls away and back.

---

> **SAVE AND TRY**
>
> **You should see:** Scroll down to the Terminal section. As it enters view, the terminal
> starts typing line by line. There's a pause between lines. The blinking cursor moves with
> the text. When done, the cursor keeps blinking at the end of the last line.

---

## 🎯 Challenge: Variable Typing Speed

**You know:** `setTimeout` delay, `Math.random()`.

**Task:** Make the typing feel more organic by varying the character delay slightly.
Instead of a fixed `28ms`, use a random value between 15ms and 50ms:

```js
const delay = 15 + Math.random() * 35;
setTimeout(next, delay);
```

Replace the `setTimeout(next, charDelay)` in `typeLine` with this two-liner.
The result feels like someone actually typing rather than a machine.

---

## Final Check

| Feature | How to verify |
|---|---|
| Terminal window renders | Green/teal section shows terminal chrome |
| Typewriter activates on scroll | Scroll to Terminal — typing begins |
| Lines appear in sequence | Each line types before the next starts |
| Cursor blinks | Cursor snaps on/off at end of current line |
| Animation runs once | Scroll away and back — animation does not restart |

---

## Quick Check Answers

**1. `setTimeout` vs `setInterval` for typewriter:**
`setTimeout` is better here. It reschedules after each character completes, so the timing
is relative to when the last character finished. `setInterval` fires on a fixed clock
regardless of what the callback did — if the callback is slow, calls can pile up. `setTimeout`
chains also naturally stop when you stop rescheduling, whereas `setInterval` must be
explicitly cancelled with `clearInterval`.

**2. API to detect when element enters the viewport:**
`IntersectionObserver`. Pass it a callback and a `threshold` (fraction of the element
that must be visible to trigger). Much more efficient than a scroll event listener —
the browser calls you, you don't poll the browser.

**3. CSS for blinking cursor:**
`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }` with
`animation: blink 0.9s step-end infinite` on the cursor element. `step-end` is key —
without it, the opacity would fade in and out (a pulse) rather than snapping (a blink).

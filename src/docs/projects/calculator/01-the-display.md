# Lesson 01 — The Display

## What You Will Build

An HTML page with a calculator display showing a number. No logic yet. No buttons
that do anything. Just the face of a calculator, styled with CSS custom properties
from the first line of CSS you write.

By the end of this lesson you will have a page you can open in a browser and see.
That is the bar. If you cannot open it and see something, the lesson is not done.

## What You Need to Know First

HTML elements and how CSS styles them. That is all. No JavaScript yet.

---

## The Lesson

### The problem

A calculator is a visual tool. Before any logic exists, the student needs to see
what they are building. The first thing to build is the shell — the face of the
calculator. This is the visible target every subsequent lesson will add to.

We start with HTML, not CSS. You cannot style something that does not exist.

---

### Step 1 — The HTML structure

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Calculator</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="calculator">
      <div class="display">
        <span class="display-value">0</span>
      </div>
    </div>
  </body>
</html>
```

**CS lens — DOM structure:**
The browser parses this HTML and builds a tree of objects in memory called the
Document Object Model. Every element is a node. `calculator` contains `display`,
which contains `display-value`. This tree is the data structure the browser uses
to render the page and the same tree JavaScript will manipulate later.

**SE lens — HTML before CSS:**
We wrote HTML with no styles at all. It looks ugly. That is correct. HTML defines
structure. CSS defines appearance. Mixing them — writing `<div style="color:red">`
— couples structure to presentation and makes both harder to change. The rule is:
write the structure first, then layer the appearance on top.

---

### Step 2 — CSS custom properties

Create `style.css`. Before writing a single selector, define the design tokens:

```css
:root {
  --color-background: #1a1a2e;
  --color-surface: #16213e;
  --color-display-bg: #0f3460;
  --color-display-text: #e2e8f0;
  --color-border: #334155;

  --font-size-display: 2.5rem;
  --font-family-display: 'Courier New', monospace;

  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;

  --radius-calculator: 0.75rem;
  --radius-display: 0.5rem;

  --width-calculator: 320px;
}
```

**CS lens — variables as indirection:**
A CSS custom property (`--color-background`) is a named reference to a value.
Every place that uses `var(--color-background)` resolves to the same value.
When you want to change the background colour, you change one line. Without
custom properties, you would search for every hardcoded `#1a1a2e` across every
file. The custom property is the same concept as a named constant in any
programming language — one name, one place to change.

**SE lens — design tokens:**
These are not "CSS variables." They are design tokens — the atomic decisions of
a design system. A token answers: what is the background colour? What is the
display font size? What is the standard border radius? Every visual decision is
named and stored in one place. Any future lesson that touches the design reads
from these tokens. No lesson hardcodes a colour. No lesson hardcodes a size.
This is not a rule about aesthetics. It is a rule about coupling: hardcoded
values couple visual decisions to every file that uses them.

---

### Step 3 — Style the calculator shell

Now add the selectors, using only the tokens you just defined:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-family: var(--font-family-display);
}

.calculator {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-calculator);
  padding: var(--spacing-lg);
  width: var(--width-calculator);
}

.display {
  background-color: var(--color-display-bg);
  border-radius: var(--radius-display);
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: right;
  min-height: 4rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.display-value {
  color: var(--color-display-text);
  font-size: var(--font-size-display);
  font-family: var(--font-family-display);
  letter-spacing: 0.05em;
}
```

**CS lens — the box model:**
Every HTML element is a rectangular box. `box-sizing: border-box` makes the
declared width include padding and border — without it, adding padding would
make the element wider than declared, which is almost never what you want.
This is one of the first things every CSS developer learns to reset globally.

**SE lens — no hardcoded values:**
Look at every property value in the selectors above. Every colour, every size,
every spacing value comes from a `var(--token)`. Not a single raw hex code.
Not a single raw pixel value. If this rule had been applied to the whole app
from lesson one, the "fix all the blues" problem from earlier in this project
would not exist. The lesson is: design decisions belong in one place, and that
place is the token definitions.

---

### Step 4 — Open it

Open `index.html` in a browser. You should see:

- A dark page
- A dark card centred on the page
- A darker display area inside the card
- The number `0` displayed in a monospace font

Nothing else. No buttons. No logic. One visible thing that works.

---

## Connect the Pieces

This file is the shell every future lesson builds into. The `.calculator` div
will receive a button grid in lesson 02. The `.display-value` text content will
be updated by TypeScript in lesson 03. The CSS tokens defined here will be read
by every lesson that adds visual components.

The structure mirrors the architecture of the full calculator:
- `calculator` — the application container
- `display` — the output area
- `display-value` — the value being shown

Each future piece will have its own role and its own place in this tree.

---

## What Breaks Without This

Without CSS custom properties, every lesson that adds styling would hardcode
its own colour values. By lesson 10, the same dark blue would appear as `#1a1a2e`
in fifteen different places. Changing the theme would require finding and replacing
every instance. One typo produces a mismatched colour with no error message.

The custom property system makes the wrong thing hard to do and the right thing
the default. That is what good architecture feels like.

---

## Definition of Done

- [ ] `index.html` opens in a browser without errors in the console
- [ ] The page title reads "Calculator"
- [ ] A calculator display is visible showing `0`
- [ ] The display background, text colour, and font size are CSS custom properties
- [ ] No hardcoded colour or size values exist in `style.css`
- [ ] All layout spacing uses CSS custom properties

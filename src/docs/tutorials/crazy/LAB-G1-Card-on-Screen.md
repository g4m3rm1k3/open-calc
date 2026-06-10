# Card Engine — LAB G1 — A Card on Screen

**Prerequisites:** Lab 01 complete. You know what HTML, CSS, and a `<script>` block are.
You know how to open a file in a browser.

**What this lab adds:**
- A single playing card rendered entirely with code — no images
- A full hand of cards that fan out like you're holding them
- Light/dark mode toggle that switches the whole table instantly
- Hover animations that lift cards when you mouse over them

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. In the card preview you saw, the suits (♠ ♥ ♦ ♣) were drawn without any image files.
>    How do you think that works?
> 2. When you switch light/dark mode and every color on the page changes instantly —
>    how do you think one toggle can change that many things at once?
> 3. What do you think a CSS variable is? Just guess.
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab:

```
┌─────────────────────────────────────────────────────────┐
│  CRAZY EIGHTS                              [ DARK/LIGHT ]│
│                                                         │
│  ░░░ ░░░ ░░░ ░░░ ░░░   ← opponent cards (face down)    │
│                                                         │
│        [draw pile]    [Q♥ face up]                      │
│                                                         │
│   A♠   7♥   K♦   8♣   J♠   ← your cards (face up)     │
│                        ↑                                │
│                   hover lifts it                        │
└─────────────────────────────────────────────────────────┘
```

No server. No networking. Just the table and the cards, looking exactly
like the preview — with the toggle working between dark and light mode.

The game logic comes in Lab G2. First you build the thing you'll stare at
for every game you ever play on this engine.

---

## The Project Folder

You already have `gcode-analyzer/` from Lab 01.
This is a separate project — make a new folder next to it.

Open VS Code. Press **Ctrl + `** to open the terminal. Then:

```
cd ..
```

Wait — what does `cd ..` do?

`cd` = change directory. `..` = the parent folder (one level up).
If you were inside `gcode-analyzer`, you're now in the folder that
CONTAINS `gcode-analyzer`. Think of it like pressing the Back button
in File Explorer.

Check where you are:
```
pwd
```

You should see a path that does NOT end in `gcode-analyzer`.
Now make the new project:

```
mkdir card-engine
cd card-engine
mkdir frontend
cd frontend
```

### SAVE AND TRY

```
pwd
```

**You should see** a path ending in `card-engine\frontend`.

This is where every file in this lab lives.

---

## PART 1 — One Card on Screen

### Concept: Unicode Suit Symbols

**What it is:** Every character you can type — letters, numbers, punctuation —
has a number assigned to it in a system called Unicode. Unicode includes
tens of thousands of characters, including playing card suits:

| Symbol | Name | How to type in HTML |
|--------|------|-------------------|
| ♠ | Spade | `♠` or just paste ♠ directly |
| ♥ | Heart | `♥` or ♥ |
| ♦ | Diamond | `♦` or ♦ |
| ♣ | Club | `♣` or ♣ |

These are text characters, not images. That means you can:
- Change their color with CSS `color:`
- Change their size with `font-size:`
- Add glow effects with CSS `filter: drop-shadow()`
- Animate them with CSS transitions

No image files. No SVGs. Just text that happens to look like suit symbols.

**Watch for:** The symbols must be inside a tag that has a font that supports
them. Most modern fonts do. If you see a box or question mark instead of a
suit symbol, your font doesn't support it — switch to a system font like
Arial or add `charset="UTF-8"` to your HTML head (which you'll do anyway).

---

### Step 1 — The Absolute Minimum HTML File

Create a new file. In VS Code, go to File → New File.
Save it immediately as `index.html` inside `card-engine/frontend/`.

Type this — exactly this, nothing more:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Card Engine</title>
</head>
<body>

    <div class="card">
        <span class="rank">A</span>
        <span class="suit">♠</span>
    </div>

</body>
</html>
```

Save it (Ctrl+S).

### CSS AND SEE

Open File Explorer, navigate to `card-engine/frontend/`, double-click `index.html`.
It opens in your browser.

**You should see:**
- White page
- The letter "A" and a spade symbol "♠" sitting next to each other
- No styling at all — raw, unstyled HTML

Ugly. But it's there. The suit symbol works. Now add the shape of a card.

---

### Concept: CSS Variables — One Change, Everything Updates

**What it is:** A named value stored in CSS that you can reuse anywhere.
Change the value once, and every place that uses it updates automatically.

**The problem without them:**

```css
/* You use this exact blue in 12 different places */
.card { background: #141c24; }
.table { border-color: #141c24; }
.pile { background: #141c24; }
/* ... 9 more places ... */

/* Now the designer says "change the dark blue to a darker shade"
   You have to find and change all 12 places. Miss one? Bug. */
```

**The solution:**

```css
/* Define the variable ONCE at the top */
:root {
    --card-bg: #141c24;
}

/* Use it everywhere */
.card { background: var(--card-bg); }
.table { border-color: var(--card-bg); }
.pile { background: var(--card-bg); }

/* Now change it in ONE place — everything updates */
:root {
    --card-bg: #0a0f14;   /* ← change here only */
}
```

**The syntax:**
- Define: `--my-variable-name: value;` (two dashes, then the name)
- Use: `var(--my-variable-name)`
- `:root` is the CSS selector for the very top of the document —
  variables defined there are available everywhere on the page

**Why this matters for light/dark mode:**
Light mode and dark mode are just two different sets of variable values.
When you toggle, you swap the variable values. Every element that uses
`var(--card-bg)` updates automatically — you never touch the individual
element styles.

```css
:root {
    --card-bg: #141c24;      /* dark mode default */
    --card-text: #ffffff;
}

:root.light {                /* when <html> has class="light" */
    --card-bg: #ffffff;      /* same variable, different value */
    --card-text: #111111;
}
```

**Watch for:** Variable names are case-sensitive. `--cardBg` and `--cardbg`
are different variables. Convention is lowercase with hyphens: `--card-bg`.

---

### Step 2 — Make It Look Like a Card

Add a `<style>` block inside `<head>`. Add it AFTER the `<title>` line:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Card Engine</title>

    <style>
        /* ---- CSS Variables — the entire color system lives here ---- */
        :root {
            --bg-table:   #0a0f14;
            --bg-card:    #141c24;
            --border-card: rgba(255,255,255, 0.10);
            --color-red:  #ff4466;
            --color-black: #00c8ff;
            --color-text: #ffffff;
        }

        body {
            background-color: var(--bg-table);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }

        .card {
            width: 80px;
            height: 115px;
            background: var(--bg-card);
            border: 1.5px solid var(--border-card);
            border-radius: 8px;
            position: relative;
        }

        .rank {
            position: absolute;
            top: 6px;
            left: 8px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            color: var(--color-black);
        }

        .suit {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 32px;
            color: var(--color-black);
        }
    </style>

</head>
<body>

    <div class="card">
        <span class="rank">A</span>
        <span class="suit">♠</span>
    </div>

</body>
</html>
```

### CSS AND SEE

Save. Refresh the browser (F5).

**You should see:**
- Dark background filling the whole screen
- A dark card centered on it
- "A" in the top left corner in cyan/blue
- A large ♠ centered on the card, also cyan/blue

**Compare:** Same two elements as before — just the rank and the suit.
The CSS gave them position, color, and size.
The card div became a card shape because of `width`, `height`,
`background`, `border`, and `border-radius`.

**Change something:** Change `--color-black: #00c8ff` to `--color-black: #ff00ff`.
Save. Refresh. The rank and suit turn magenta — one variable change,
both elements updated. Change it back to `#00c8ff`.

---

### Step 3 — Add the Bottom Corner

Real cards show the rank and suit in both the top-left AND bottom-right corner
(rotated 180°). Add a second set of labels:

```html
    <div class="card">
        <span class="rank top-left">A</span>
        <span class="suit center">♠</span>
        <span class="rank bottom-right">A</span>   <!-- ← ADD this line -->
    </div>
```

And add this CSS rule inside your `<style>` block:

```css
        .bottom-right {
            top: auto;         /* cancel the top: 6px from .rank */
            bottom: 6px;
            left: auto;        /* cancel the left: 8px from .rank */
            right: 8px;
            transform: rotate(180deg);
        }
```

Also update the existing `.rank` class and add class names to your spans:

```html
    <div class="card">
        <span class="rank">A</span>           <!-- top-left, stays as-is -->
        <span class="suit">♠</span>           <!-- center -->
        <span class="rank bottom-right">A</span>
    </div>
```

### CSS AND SEE

Save. Refresh.

**You should see:**
- "A" in the top-left (as before)
- ♠ centered (as before)
- "A" in the bottom-right, rotated 180°

That's a real card corner layout. One card, complete.

---

## PART 2 — A Full Hand of Cards

Right now the card is hardcoded in the HTML — rank and suit are literal text.
For a real game you need cards to be created from data.

### Concept: JavaScript Template Literals

**What it is:** A way to build strings that contain variable values,
using backticks instead of quotes.

**The problem with regular strings:**

```javascript
const rank = "A"
const suit = "♠"

// Old way — clunky, easy to mess up quotes:
const html = "<div class=\"card\"><span>" + rank + "</span><span>" + suit + "</span></div>"
```

**The solution — template literals:**

```javascript
const rank = "A"
const suit = "♠"

// New way — backticks, ${} for values:
const html = `<div class="card"><span>${rank}</span><span>${suit}</span></div>`
```

The `${}` drops any JavaScript expression directly into the string.
No quote escaping. No string concatenation. Much easier to read.

**You can put any expression inside `{}`:**

```javascript
const count = 5
console.log(`You have ${count} cards`)          // "You have 5 cards"
console.log(`Double: ${count * 2}`)             // "Double: 10"
console.log(`${rank} of ${suit}`)               // "A of ♠"
```

**Watch for:** Template literals use backticks `` ` `` — not single quotes `'`
or double quotes `"`. The backtick is on the top-left of your keyboard,
same key as `~`. Easy to mix up when switching between them.

---

### Concept: `.map()` — Transform Every Item in an Array

**What it is:** An array method that takes every item, runs a function on it,
and returns a NEW array of the results.

**The problem without it:**

```javascript
const cards = ["A♠", "7♥", "K♦"]
const htmlParts = []

for (let i = 0; i < cards.length; i++) {
    htmlParts.push("<div>" + cards[i] + "</div>")
}
const html = htmlParts.join("")
```

**The solution with `.map()`:**

```javascript
const cards = ["A♠", "7♥", "K♦"]

const html = cards.map(card => `<div>${card}</div>`).join("")
// Result: "<div>A♠</div><div>7♥</div><div>K♦</div>"
```

`.map(card => ...)` means: for each item (calling it `card`), return this.
`.join("")` stitches the resulting array of strings into one string.

**The arrow function syntax `card => ...`:**
This is a shorthand for `function(card) { return ... }`.
When the function body is a single expression, you can drop the `{}` and `return`.

```javascript
// These three are identical:
cards.map(function(card) { return `<div>${card}</div>` })
cards.map(card => { return `<div>${card}</div>` })
cards.map(card => `<div>${card}</div>`)           // ← shortest form
```

**Watch for:** `.map()` always returns a NEW array — it never changes the
original. `.join("")` turns that array into a string. You almost always
use them together when building HTML.

---

### Step 4 — Generate Cards from Data

Replace the hardcoded card in your HTML body with a hand container,
and generate the cards with JavaScript.

First update the HTML body — replace the `<div class="card">` with:

```html
<body>

    <div class="hand" id="player-hand">
        <!-- Cards will be inserted here by JavaScript -->
    </div>

</body>
```

Then add a `<script>` block at the bottom, just before `</body>`:

```html
    <script>

        // The data — each card is an object with rank, suit, and color
        const myHand = [
            { rank: 'A', suit: '♠', color: 'black' },
            { rank: '7', suit: '♥', color: 'red'   },
            { rank: 'K', suit: '♦', color: 'red'   },
            { rank: '8', suit: '♣', color: 'black' },
            { rank: 'J', suit: '♠', color: 'black' },
        ]

        // Build one card's HTML from a card object
        function renderCard(card) {
            const colorClass = card.color === 'red' ? 'red-suit' : 'black-suit'
            // ternary operator: condition ? valueIfTrue : valueIfFalse
            // same as: if (card.color === 'red') { colorClass = 'red-suit' } else ...

            return `
                <div class="card">
                    <span class="rank ${colorClass}">${card.rank}</span>
                    <span class="suit ${colorClass}">${card.suit}</span>
                    <span class="rank bottom-right ${colorClass}">${card.rank}</span>
                </div>
            `
        }

        // Generate HTML for every card in the hand
        const handEl = document.getElementById('player-hand')
        handEl.innerHTML = myHand.map(card => renderCard(card)).join('')

    </script>

</body>
```

Add these CSS rules to your `<style>` block for the new color classes and hand layout:

```css
        .hand {
            display: flex;
        }

        .red-suit {
            color: var(--color-red);
        }

        .black-suit {
            color: var(--color-black);
        }
```

### SAVE AND TRY

Save. Refresh.

**You should see:**
- Five cards in a row
- ♠ and ♣ cards in cyan/blue
- ♥ and ♦ cards in pink/red
- Each card showing rank top-left and bottom-right, suit centered

**In the browser DevTools Console** (press F12, click Console tab):

```javascript
myHand.length
```

**Expected:** `5`

```javascript
myHand[0]
```

**Expected:** `{rank: 'A', suit: '♠', color: 'black'}`

**Change something:** Add a sixth card to the `myHand` array:
```javascript
{ rank: '3', suit: '♦', color: 'red' },
```
Save. Refresh. Six cards appear. Adding a card is one line of data —
the rendering code didn't change at all.
Remove the extra card when done.

---

### Step 5 — Fan the Cards Out (Overlap Them)

Cards in a hand overlap each other. Add this CSS:

```css
        .card {
            /* existing rules stay — add these: */
            margin-left: -22px;    /* overlap each card with the previous */
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            cursor: pointer;
        }

        .card:first-child {
            margin-left: 0;        /* first card has no overlap */
        }

        .card:hover {
            transform: translateY(-18px);
            /* lift the card upward on hover */
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
            z-index: 10;
            /* bring it in front of other cards */
        }
```

### CSS AND SEE

Save. Refresh.

**You should see:**
- Cards overlapping each other like a hand of cards
- Hovering over any card lifts it smoothly above the others

**Change something:** Change `margin-left: -22px` to `margin-left: -40px`.
Cards overlap more — like you're squeezing a large hand.
Change it to `-5px` — cards barely overlap.
Change it back to `-22px`.

---

## PART 3 — The Full Table

A card game table has more than just your hand. It has:
- The opponent's hand (cards face down — you can't see their cards)
- A draw pile (stack of face-down cards)
- A discard pile (top card face up)

### Step 6 — Add the Table Layout

Update the HTML body — replace everything inside `<body>` with this:

```html
<body>

    <div class="table">

        <div class="table-header">
            <span class="game-title">CRAZY EIGHTS</span>
            <button class="mode-btn" id="modeBtn">☀ LIGHT</button>
        </div>

        <!-- Opponent's hand — face down -->
        <div class="section-label">OPPONENT</div>
        <div class="hand" id="opponent-hand"></div>

        <!-- Middle area — draw pile and discard pile -->
        <div class="piles">
            <div class="pile-group">
                <div class="pile-label">DRAW</div>
                <div id="draw-pile"></div>
            </div>
            <div class="pile-group">
                <div class="pile-label">DISCARD</div>
                <div id="discard-pile"></div>
            </div>
        </div>

        <!-- Your hand — face up -->
        <div class="section-label">YOUR HAND</div>
        <div class="hand" id="player-hand"></div>

    </div>

</body>
```

Add these CSS rules to your style block:

```css
        .table {
            width: 600px;
            padding: 24px;
            display: flex;
            flex-direction: column;   /* stack children vertically */
            gap: 20px;                /* space between each section */
        }

        .table-header {
            display: flex;
            justify-content: space-between;   /* title left, button right */
            align-items: center;
        }

        .game-title {
            font-family: 'Courier New', monospace;
            font-size: 13px;
            font-weight: bold;
            letter-spacing: 0.3em;
            color: var(--color-accent);
        }

        .mode-btn {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            background: transparent;
            border: 1px solid var(--color-accent);
            color: var(--color-accent);
            padding: 5px 12px;
            border-radius: 4px;
            cursor: pointer;
            letter-spacing: 0.1em;
        }

        .section-label {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            letter-spacing: 0.2em;
            color: var(--color-muted);
        }

        .piles {
            display: flex;
            gap: 32px;
            justify-content: center;
            padding: 8px 0;
        }

        .pile-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
        }

        .pile-label {
            font-family: 'Courier New', monospace;
            font-size: 9px;
            letter-spacing: 0.15em;
            color: var(--color-muted);
        }
```

You added two new CSS variables — `--color-accent` and `--color-muted`.
Add them to your `:root` block:

```css
        :root {
            --bg-table:    #0a0f14;
            --bg-card:     #141c24;
            --border-card: rgba(255,255,255, 0.10);
            --color-red:   #ff4466;
            --color-black: #00c8ff;
            --color-text:  #ffffff;
            --color-accent: #00ffb4;    /* ← ADD */
            --color-muted:  #00ffb450;  /* ← ADD — 50 is the hex opacity (about 30%) */
        }
```

### CSS AND SEE

Save. Refresh.

**You should see:**
- "CRAZY EIGHTS" title on the left
- "☀ LIGHT" button on the right
- "OPPONENT" label
- Empty space where opponent hand will go
- "DRAW" and "DISCARD" labels side by side
- "YOUR HAND" label
- The five cards (still there from before)

The labels and layout are there. The draw pile and opponent hand aren't
rendered yet — that comes in the next two steps.

---

### Step 7 — Render the Face-Down Cards

A face-down card looks different — you see the card back pattern, not the
rank and suit. Add a `renderCardBack()` function to your script block:

```javascript
        function renderCardBack() {
            return `
                <div class="card card-back">
                    <div class="back-pattern"></div>
                </div>
            `
        }
```

Add the CSS for the card back:

```css
        .card-back {
            background: var(--bg-card-back);
            border-color: var(--border-card-back);
        }

        .back-pattern {
            position: absolute;
            inset: 8px;           /* 8px from every edge */
            border-radius: 4px;
            border: 1px solid var(--border-card-back);
            background: repeating-linear-gradient(
                45deg,
                var(--pattern-color) 0px,
                var(--pattern-color) 2px,
                transparent 2px,
                transparent 8px
            );
        }
```

Add the new variables to `:root`:

```css
            --bg-card-back:     #0d1520;
            --border-card-back: rgba(0,255,180, 0.20);
            --pattern-color:    rgba(0,255,180, 0.08);
```

Now use the function in your script — update the JavaScript section
to also render the opponent's hand and the draw pile:

```javascript
        // Opponent hand — 5 face-down cards
        const opponentEl = document.getElementById('opponent-hand')
        opponentEl.innerHTML = Array(5).fill(null).map(() => renderCardBack()).join('')
        // Array(5).fill(null) creates [null, null, null, null, null]
        // .map() runs renderCardBack() for each one — we don't need the value

        // Draw pile — show 3 stacked face-down cards
        const drawEl = document.getElementById('draw-pile')
        drawEl.innerHTML = `<div class="draw-stack">${Array(3).fill(null).map(() => renderCardBack()).join('')}</div>`
```

Add CSS for the draw stack (cards visually stacked on top of each other):

```css
        .draw-stack {
            position: relative;
            width: 80px;
            height: 115px;
        }

        .draw-stack .card {
            position: absolute;
            margin: 0;
        }

        .draw-stack .card:nth-child(1) { transform: translate(-3px, -3px) rotate(-3deg); }
        .draw-stack .card:nth-child(2) { transform: translate(1px, 1px) rotate(1deg); }
        .draw-stack .card:nth-child(3) { transform: none; }
        /* nth-child positions each card slightly differently — gives a stacked look */
```

### SAVE AND TRY

Save. Refresh.

**You should see:**
- Five face-down cards for the opponent (dark with diagonal pattern)
- Three stacked face-down cards for the draw pile — slightly rotated
- Your five face-up cards at the bottom

**Change something:** Change `Array(5).fill(null)` in the opponent hand
to `Array(7).fill(null)`. Opponent now has 7 cards — they drew a lot.
Change it back to 5.

---

### Step 8 — Add the Discard Pile (Top Card Face Up)

The discard pile shows the last card played — face up.
Update your script to render it:

```javascript
        // Discard pile — one face-up card (the current top of discard)
        const topCard = { rank: 'Q', suit: '♥', color: 'red' }
        const discardEl = document.getElementById('discard-pile')
        discardEl.innerHTML = renderCard(topCard)
```

### SAVE AND TRY

Save. Refresh.

**You should see:**
- A face-up Q♥ next to the draw pile
- Red suit and rank because it's a heart

The full table is now visible. Every element is in place.

---

## PART 4 — Light/Dark Mode Toggle

### Concept: Toggling a CSS Class with JavaScript

**What it is:** Adding or removing a class on an HTML element from JavaScript,
which causes CSS rules to apply or stop applying instantly.

```javascript
document.documentElement.classList.toggle('light')
// classList = the list of CSS classes on that element
// .toggle('light') = add it if it's missing, remove it if it's there
// document.documentElement = the <html> element (the root of the page)
```

**Why the `<html>` element:** CSS variables defined on `:root` apply to the
whole page. `:root` in CSS refers to the `<html>` element. So if you add
a class to `<html>`, you can define different variable values for that class
that override the defaults.

**The full pattern:**

```css
:root {
    --bg: #0a0f14;     /* default (dark) */
}

:root.light {
    --bg: #f0f4ff;     /* override when .light class is present */
}
```

```javascript
btn.addEventListener('click', () => {
    document.documentElement.classList.toggle('light')
    // clicking adds .light to <html> → light CSS variables activate
    // clicking again removes .light → dark variables return
})
```

Every element that uses `var(--bg)` switches instantly.
You never touch those elements individually.

**Watch for:** `document.documentElement` is the `<html>` element.
`document.body` is the `<body>` element — different thing.
CSS `:root` corresponds to `document.documentElement`.

---

### Step 9 — Add Light Mode Variables and the Toggle

Add the light mode overrides to your CSS, after the `:root` block:

```css
        :root.light {
            --bg-table:    #e8eef8;
            --bg-card:     #ffffff;
            --border-card: rgba(0,0,0, 0.12);
            --color-red:   #cc0022;
            --color-black: #111111;
            --color-text:  #111111;
            --color-accent: #0055cc;
            --color-muted:  rgba(0,85,204, 0.35);
            --bg-card-back:     #1a3a6e;
            --border-card-back: rgba(68,136,255, 0.30);
            --pattern-color:    rgba(255,255,255, 0.15);
        }
```

Now wire up the button in your script:

```javascript
        // Mode toggle
        const modeBtn = document.getElementById('modeBtn')

        modeBtn.addEventListener('click', () => {
            const isLight = document.documentElement.classList.toggle('light')
            // .toggle() returns true if the class was ADDED, false if REMOVED
            modeBtn.textContent = isLight ? '🌙 DARK' : '☀ LIGHT'
            // update button label to show what clicking it will DO next
        })
```

### SAVE AND TRY

Save. Refresh.

**You should see:**
- Dark table, cards, and colors as before
- Click "☀ LIGHT" — everything switches to light mode instantly
- Button label changes to "🌙 DARK"
- Click again — back to dark mode

**In DevTools Console:**
```javascript
document.documentElement.classList.contains('light')
```

**Expected when in dark mode:** `false`
Click the toggle. Run it again.
**Expected when in light mode:** `true`

**Change something:** In the `:root.light` block, change
`--bg-table: #e8eef8` to `--bg-table: #fffbe6`.
Light mode table turns warm cream-yellow.
Change it back to `#e8eef8`.

---

## 🎯 Challenge: Add a Card Click Handler

**You know:** `addEventListener('click', ...)` runs a function when something is clicked.
Template literals let you build HTML strings. The `renderCard` function takes a card object.

**Task:** When the player clicks a card in their hand, log that card's rank and suit
to the console. For example, clicking the 7♥ should print:
```
You clicked: 7 of ♥
```

**The problem:** Right now cards are generated from `.innerHTML = ...` which means
the cards don't exist when the script first runs — they're injected as HTML strings.
You need to attach click handlers AFTER the cards are in the DOM.

**Hint 1:** After setting `handEl.innerHTML`, the cards exist in the DOM.
You can then select them with `handEl.querySelectorAll('.card')`.

**Hint 2:** `querySelectorAll` returns a list. You can loop over it with `.forEach()`.
But how do you know WHICH card was clicked and what its data is?
Look at how `myHand` and the card elements are both arrays of the same length...

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```javascript
// After this line:
handEl.innerHTML = myHand.map(card => renderCard(card)).join('')

// Add this:
const cardEls = handEl.querySelectorAll('.card')
// querySelectorAll returns all elements matching '.card' inside handEl

cardEls.forEach((cardEl, index) => {
    // index is the position: 0, 1, 2, 3, 4
    // myHand[index] is the card data at that same position
    cardEl.addEventListener('click', () => {
        const card = myHand[index]
        console.log(`You clicked: ${card.rank} of ${card.suit}`)
    })
})
```

**Key insight:** When you `.map()` an array to HTML and inject it, the DOM elements
and the original data array are in the same order. The first `.card` element
corresponds to `myHand[0]`, the second to `myHand[1]`, etc. The `index` parameter
in `.forEach()` gives you that position — use it to look up the original data.
This pattern — parallel arrays sharing an index — appears constantly in game code.

</details>

---

## 🎯 Challenge: Show a Card Count Badge

**You know:** Template literals, CSS variables, JavaScript DOM manipulation.

**Task:** Above each hand, show a small badge with the card count.
Example: "5 CARDS" appears above the player hand, "5 CARDS" above the opponent hand.
When the hand size changes (try changing `myHand` to have 3 cards), the badge updates.

**Where to add it:** The section labels already exist (`YOUR HAND`, `OPPONENT`).
You could update their text, or add a `<span>` next to them.

**Starting point:** The section labels are `<div class="section-label">` elements.
You can select them and update their content.

---

<details>
<summary>▶ Show Solution</summary>

One approach — select the labels by their text content and update them:

```javascript
// After rendering the hands, update the labels to include counts
document.querySelectorAll('.section-label').forEach(label => {
    if (label.textContent === 'YOUR HAND') {
        label.textContent = `YOUR HAND — ${myHand.length} CARDS`
    }
    if (label.textContent === 'OPPONENT') {
        label.textContent = `OPPONENT — 5 CARDS`
        // opponent count is hardcoded for now — comes from server in Lab G2
    }
})
```

A cleaner approach — give the labels IDs in the HTML so you can target them directly:

```html
<div class="section-label" id="your-label">YOUR HAND</div>
<div class="section-label" id="opp-label">OPPONENT</div>
```

```javascript
document.getElementById('your-label').textContent = `YOUR HAND — ${myHand.length} CARDS`
document.getElementById('opp-label').textContent = `OPPONENT — 5 CARDS`
```

**Key insight:** IDs let you target specific elements directly without searching.
Use them for elements you know you'll need to update from JavaScript.
The cleaner approach is better — the first approach is brittle because it
depends on the exact text content, which might change.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Cards render from data | Change `myHand` array, refresh — card count changes |
| Red suits are red | ♥ and ♦ appear in red/pink, ♠ and ♣ in cyan |
| Cards overlap correctly | Hand looks like held cards, not a grid |
| Hover lifts cards | Mouse over any card — it rises above the others smoothly |
| Face-down cards show pattern | Opponent hand and draw pile show back pattern, no rank/suit |
| Draw pile looks stacked | Three cards slightly rotated, gives depth |
| Discard shows Q♥ face up | Q♥ visible next to draw pile |
| Dark mode is default | Page opens dark |
| Toggle switches to light | One click — everything changes color |
| Toggle switches back to dark | Second click — returns to dark |
| CSS variables drive colors | Change one variable in `:root`, multiple elements update |

---

## What You Built and Why It Matters

You built the renderer — the visual layer of the card engine.
Here's what's significant about HOW you built it:

**Data is separate from display.** The `myHand` array holds the data.
The `renderCard` function turns data into HTML. When Lab G2 connects to
a real server, you'll replace `myHand` with data from the server —
the `renderCard` function doesn't change at all.

**CSS variables drive the entire visual system.** Light/dark mode is
just two sets of variable values. Every color on the table uses a variable.
Adding a third theme (sepia? high contrast?) is adding one more `:root.theme {}` block.

**The render functions are pure.** `renderCard(card)` always produces the
same HTML for the same input. It doesn't read global state. It doesn't
modify anything. That makes it easy to test, easy to reuse, and easy to
reason about. Pure functions are one of the most important ideas in programming.

---

## Quick Check Answers

**1. How are the suit symbols drawn without image files?**
They're Unicode characters — text characters that happen to look like suit symbols.
♠ ♥ ♦ ♣ are characters in the Unicode standard, just like A-Z and 0-9.
Because they're text, CSS can color them, resize them, and apply effects like
`filter: drop-shadow()` to make them glow. No image file needed — just a character
in a `<span>` with CSS applied to it.

**2. How does one toggle change every color on the page?**
CSS variables. Every color value on the page is written as `var(--some-variable)`
instead of a hardcoded hex. Two sets of variable values are defined: one on `:root`
(dark mode defaults) and one on `:root.light` (light mode overrides). When JavaScript
adds the `light` class to the `<html>` element, the override values activate everywhere
at once. You never touch individual elements — the variable system propagates the
change automatically.

**3. What is a CSS variable?**
A named value stored in CSS that you can reuse anywhere on the page.
You define it once (`--card-bg: #141c24`) and reference it with `var(--card-bg)`.
Change the definition, and every element using that variable updates.
The `:root` selector puts variables at the top of the document so they're
available to every CSS rule on the page.

---

## What's Next — Lab G2

The table looks right. Now you make it do something.

Lab G2:
- A Python WebSocket server (not HTTP — a persistent two-way connection)
- Two browser tabs connect to it — simulating two players
- Deal cards from a real shuffled deck
- Each player sees their own hand, opponent's cards stay face down
- The server is the authority — it knows all cards, both hands, the draw pile

The renderer you built today plugs straight in.
You'll replace the hardcoded `myHand` array with real data from the server,
and `renderCard()` won't change a single line.

---

*Lab G1 complete. Cards on screen. Table ready. Visual engine built.*

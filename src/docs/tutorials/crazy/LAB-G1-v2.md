# Card Engine — LAB G1 — A Card on Screen

**Prerequisites:** You know what an HTML file is, how to open it in a browser,
and how to open VS Code. No JavaScript experience required beyond Lab 01.

**What this lab adds:**
- A single playing card rendered entirely with code — no images, no external files
- A full hand of five cards that overlap like you're holding them
- Hover animation that lifts a card when you mouse over it
- Light/dark mode toggle that switches every color on the table instantly

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. The suit symbols ♠ ♥ ♦ ♣ appear on the cards. There are no image files in
>    this project. How do you think that works?
> 2. When you click the light/dark toggle, every color on the page changes at once.
>    How do you think one button can change that many things simultaneously?
> 3. What do you think will happen if you try to hover over a card that is
>    underneath another card in the overlapping hand?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab you will see this in your browser:

```
┌──────────────────────────────────────────────[ ☀ LIGHT ]─┐
│                                                           │
│  CRAZY EIGHTS                                             │
│                                                           │
│   ┌────┐                                                  │
│   │A   │                                                  │
│   │    │  ← hover lifts the card above the others         │
│   │  ♠ │                                                  │
│   │   A│                                                  │
│   └────┘                                                  │
│    (overlapping with 4 more cards behind it)              │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

Dark background, cyan suit symbols, cards overlapping like a real hand.
Click the toggle — everything switches to white cards on a light blue table.
Click again — back to dark.

---

## The Project Folder

Open VS Code. Press **Ctrl + `** to open the built-in terminal.

You will create a new project folder separate from `gcode-analyzer`.
Type these commands one at a time, pressing Enter after each:

```
cd ..
```

**Why `cd ..`:** `cd` means "change directory." Two dots `..` means
"go up one level — into the folder that contains my current folder."
If you were inside `gcode-analyzer`, you are now in the folder above it.

```
pwd
```

**Why `pwd`:** "Print working directory." Confirms where you are.
You should see a path that does NOT end in `gcode-analyzer`.

```
mkdir card-engine
```

**Why `mkdir`:** "Make directory." Creates a new folder called `card-engine`.

```
cd card-engine
```

Moves you inside the new folder.

```
mkdir frontend
```

Creates the `frontend` subfolder where your HTML file will live.

```
cd frontend
```

Moves you inside `frontend`. This is where you will work for all of Lab G1.

### SAVE AND TRY

```
pwd
```

**You should see** a path ending in `card-engine\frontend`.
That confirms you are in the right place before creating any files.

---

## PART 1 — One Card on Screen

### Concept: Unicode Characters as Suit Symbols

**What it is:** Unicode is a numbering system that assigns a unique number to
every character in every language — including symbols that look like playing card suits.

**The problem before:**
To show a spade symbol on a web page, you would need an image file (a PNG or SVG),
load it with an `<img>` tag, position it, and resize it separately from the text
around it. For four suits across many cards, that is dozens of files to manage.

**The solution:**
The characters ♠ ♥ ♦ ♣ already exist in Unicode. They have the numbers
U+2660, U+2665, U+2666, and U+2663. Any browser can display them as text.
Because they ARE text, CSS rules that apply to text — `color`, `font-size`,
`filter` — work on them directly. No image loading, no separate sizing.

**Canonical example (General Explanation):**
The letter "A" is Unicode character U+0041. The digit "3" is U+0033.
The suit symbols follow the same idea — they are just characters with higher numbers.
When you type `♠` in an HTML file (or paste the character directly),
the browser renders the spade glyph using whatever font is loaded.
The analogy: Unicode is like a massive dictionary where every character
in every writing system has a page number. The browser looks up the page
number and draws the character at that page.

**Project Application (The "Why" here):**
In this project, each card object stores its suit as a Unicode character:
`'♠'`, `'♥'`, `'♦'`, `'♣'`. When JavaScript builds the card's HTML,
it drops that character directly into a `<span>`. CSS then colors it red or
cyan depending on the suit. No image files, no lookup tables — the symbol
IS the data, and the browser renders it for free.

**Smallest possible example:**
```html
<span style="font-size: 32px; color: red;">♥</span>
```
Paste that into any HTML file. Open it in a browser. You see a red heart.

**Watch for:** The symbols only render correctly if your HTML file declares
`<meta charset="UTF-8">` in the `<head>`. Without it, some browsers display
a box or question mark instead of the symbol. You will add this in Step 1.

---

### Step 1 — Create the HTML File

In VS Code, go to **File → New File**.
Save it immediately: **File → Save As**, navigate to `card-engine/frontend/`,
name it `index.html`.

Now type this — start from a completely empty file:

```html
<!DOCTYPE html>
```

**Why this line:** This declaration tells the browser to use modern HTML5 rules.
Without it, browsers fall back to a "quirks mode" designed for 1990s web pages,
which changes how CSS behaves in subtle, hard-to-debug ways.

### CSS AND SEE

Save (Ctrl+S). Double-click `index.html` in File Explorer to open it in your browser.

**You should see:** A completely blank white page. Nothing visible yet.
That is correct — this line produces no visible output. It is a browser instruction,
not content.

---

### Step 2 — Add the HTML Shell

Below the DOCTYPE line, add these lines:

```html
<!DOCTYPE html>
<html lang="en">    <!-- ← add this line -->
<head>              <!-- ← add this line -->
    <meta charset="UTF-8">   <!-- ← add this line -->
    <title>Card Engine</title>  <!-- ← add this line -->
</head>             <!-- ← add this line -->
<body>              <!-- ← add this line -->

</body>             <!-- ← add this line -->
</html>             <!-- ← add this line -->
```

**Why `lang="en"`:** Tells screen readers and translation tools that the page
is in English. Accessibility tools use this to choose the correct pronunciation
rules when reading the page aloud.

**Why `charset="UTF-8"`:** Without this, the browser guesses the text encoding.
If it guesses wrong, suit symbols like ♠ render as garbled characters.
UTF-8 covers every Unicode character, so suit symbols always display correctly.

**Why `<title>`:** Sets the text shown in the browser tab.
It has no visible effect on the page itself.

**Why the `<head>` / `<body>` split:** `<head>` contains instructions for the
browser — metadata, styles, the page title. None of it is displayed.
`<body>` contains everything the user actually sees.

### CSS AND SEE

Save. Refresh the browser (F5).

**You should see:** Still a blank page. Correct — `<body>` is empty.
The structure exists. Content comes next.

---

### Step 3 — Put One Card's Content in the Body

Inside `<body>`, between the opening and closing tags, add:

```html
<body>

    <div class="card">          <!-- ← add this line -->
        <span class="rank">A</span>   <!-- ← add this line -->
        <span class="suit">♠</span>   <!-- ← add this line -->
    </div>                      <!-- ← add this line -->

</body>
```

**Why a `<div>` for the card:** `<div>` is a generic container with no default
styling. It becomes whatever shape and color you give it with CSS.
Using a `<div>` instead of a more specific element (like `<button>`) means
the browser applies no default appearance that you'd have to override later.

**Why `class="card"`:** The class attribute is how CSS finds this element.
When you later write `.card { width: 80px; }`, the browser applies that rule
to every element with `class="card"`. Right now the class does nothing —
there is no CSS yet to read it.

**Why separate `<span>` elements for rank and suit:**
You need to position the rank and suit independently — rank goes in the
corner, suit goes in the center. Putting them in separate elements lets
CSS move them to different positions on the card. If they were in the same
element, they would always stay together.

### CSS AND SEE

Save. Refresh.

**You should see:**
- White page (still no styling)
- The letter "A" followed immediately by the spade symbol "♠"
- Both sitting in the top-left corner in the browser's default black text

**Compare:** This is the raw structure — no shape, no color, no card outline.
Just the content. The CSS you add next gives it its appearance.

**Change something:** Change `♠` to `♥`. Save. Refresh. You see a heart.
Change it back to `♠`.

---

### Concept: CSS Variables — One Value, Used Everywhere

**What it is:** A named storage slot in CSS that holds a value you can
reference by name anywhere in the stylesheet. Change the stored value
once, and every place that references it updates automatically.

**The problem before:**
```css
/* Without variables — the blue color is written in 6 different places */
.card         { background: #141c24; }
.table        { border-color: #141c24; }
.pile         { background: #141c24; }
.back-pattern { border: 1px solid #141c24; }
.rank         { color: #141c24; }
.status       { background: #141c24; }

/* Designer says "make it slightly darker" — you find and change 6 lines.
   Miss one? That element stays the old color. A visual inconsistency
   that is very easy to miss and very annoying to track down. */
```

**The solution:**
```css
:root {
    --bg-card: #141c24;   /* defined once */
}

.card         { background: var(--bg-card); }  /* referenced everywhere */
.table        { border-color: var(--bg-card); }
/* change the definition → all 6 update at once */
```

**Canonical example (General Explanation):**
Think of a CSS variable like a named paint can on a shelf.
Instead of mixing the same shade of blue every time you need it,
you label a can "DARK-BLUE" and pour from it wherever you need that color.
When you want a slightly different shade, you change what's in the can —
not every wall you painted.

In CSS:
- Defining a variable: `--can-label: value;`  (two dashes before the name)
- Using a variable: `var(--can-label)`
- `:root` is the "shelf" — variables defined there are available everywhere on the page

**Project Application (The "Why" here):**
This project has light mode AND dark mode. Every card, every background,
every text color must change when you toggle modes. CSS variables make this
possible with a single JavaScript class toggle — instead of updating 30+
individual color values, you swap one set of variable definitions for another.
The `:root.light { }` block you'll write later overrides every variable at once.

**Smallest possible example:**
```css
:root {
    --my-color: red;
}
p {
    color: var(--my-color);   /* displays red */
}
```
Change `red` to `blue` in one place — every `<p>` turns blue.

**Watch for:** Variable names are case-sensitive. `--MyColor` and `--mycolor`
are two different variables. Convention is lowercase with hyphens: `--bg-card`.
Forgetting the two dashes `--` is the most common typo when first learning variables.

---

### Step 4 — Add the Style Block

In `<head>`, after the `<title>` line, add the opening and closing style tags:

```html
<head>
    <meta charset="UTF-8">
    <title>Card Engine</title>

    <style>              <!-- ← add this line -->

    </style>             <!-- ← add this line -->
</head>
```

**Why a `<style>` block inside `<head>`:** This is one of three ways to write CSS
(the others are a separate `.css` file, or inline `style=""` attributes on elements).
For a single-file project like this lab, a `<style>` block keeps everything in
one place. The browser reads it before rendering the body, so styles are ready
before any element appears on screen.

### CSS AND SEE

Save. Refresh.

**You should see:** No visible change yet — the style block is empty.
This step confirms the tag is valid and in the right place.
If the page layout broke or text disappeared, the tag was misplaced.

---

### Step 5 — Define the CSS Variables

Inside the `<style>` block, add the variable definitions:

```html
    <style>

        :root {                              <!-- ← add this line -->
            --bg-table:    #0a0f14;          <!-- ← add this line -->
            --bg-card:     #141c24;          <!-- ← add this line -->
            --border-card: rgba(255,255,255,0.10);  <!-- ← add this line -->
            --color-red:   #ff4466;          <!-- ← add this line -->
            --color-black: #00c8ff;          <!-- ← add this line -->
            --color-accent: #00ffb4;         <!-- ← add this line -->
            --color-muted:  rgba(0,255,180,0.30);   <!-- ← add this line -->
            --color-text:  #ffffff;          <!-- ← add this line -->
        }                                    <!-- ← add this line -->

    </style>
```

**Why `--bg-table` is very dark (`#0a0f14`):** This is almost-black with a faint
blue tint — the color of a table under dim lighting, which gives the arcade-table
feel from the design preview. Pure black (`#000000`) looks flat and harsh;
this shade has depth.

**Why `--color-black` is cyan (`#00c8ff`) not black:** In dark mode, black text
on a dark card would be invisible. Cyan glows visibly against the dark card
background and still reads as "the dark suit color" — spades and clubs get cyan,
hearts and diamonds get pink-red. This is a deliberate visual design choice,
not a naming mistake.

**Why `rgba(255,255,255,0.10)` for the card border:** A fully opaque white border
would look harsh and stark against the dark card. `rgba` lets you set opacity
as a fourth value (0.10 = 10% opaque = 90% transparent) — the result is a
barely-visible shimmer that gives the card an edge without looking outlined.

### CSS AND SEE

Save. Refresh.

**You should see:** No visible change yet — variables only do something when
used by a CSS rule that applies to a visible element. The variables are now
defined and ready to use. This step confirms the syntax is valid:
if you see a browser error or the page breaks, there is a typo in the variable block.

---

### Step 6 — Style the Body

Still inside `<style>`, after the closing `}` of `:root`, add:

```css
        :root {
            /* ... variables from Step 5 ... */
        }

        body {                                    /* ← add from here */
            background-color: var(--bg-table);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }                                         /* ← add to here */
```

**Why `background-color: var(--bg-table)`:** Uses the variable defined in Step 5
instead of a hardcoded color. When light mode activates later and redefines
`--bg-table` to a light blue, this rule updates automatically — no changes needed here.

**Why `display: flex` on `<body>`:** Flexbox is a CSS layout system that arranges
children in a row or column and lets you align them easily. Without it, the card
would sit in the top-left corner. With it, the next two lines can center it.

**Why `justify-content: center` and `align-items: center`:** These two lines
together center the body's children both horizontally and vertically.
`justify-content` controls the main axis (horizontal by default),
`align-items` controls the cross axis (vertical by default).
You need both because "center" on one axis alone puts the card in the
middle of a row but still at the top of the page.

**Why `min-height: 100vh`:** `100vh` means "100% of the viewport height" —
the full visible window. Without this, `<body>` is only as tall as its content
(the card), which makes vertical centering meaningless because there is
no space to center within.

**Why `margin: 0`:** Browsers add a small default margin to `<body>`. This resets
it so the background color fills the entire window with no gaps at the edges.

### CSS AND SEE

Save. Refresh.

**You should see:**
- The page background turns very dark (almost black with a blue tint)
- The "A♠" text is centered horizontally and vertically on the page
- The text is still the browser's default black — hard to see on dark background

**Compare:** Before this step, white background, text in the top-left.
After: dark background, text centered. One CSS rule block caused both changes.

**Change something:** Change `--bg-table: #0a0f14` to `--bg-table: #1a0000`.
Save. Refresh. The background turns dark red. Change it back to `#0a0f14`.

---

### Step 7 — Give the Card Its Shape

After the closing `}` of the `body` rule, add:

```css
        body {
            /* ... from Step 6 ... */
        }

        .card {                                        /* ← add from here */
            width: 80px;
            height: 115px;
            background: var(--bg-card);
            border: 1.5px solid var(--border-card);
            border-radius: 8px;
            position: relative;
        }                                              /* ← add to here */
```

**Why `width: 80px` and `height: 115px`:** Standard playing cards have an aspect
ratio of roughly 5:7 (width to height). 80×115 is approximately that ratio
at a size large enough to read text on, but small enough to show a full hand
on a normal screen.

**Why `position: relative`:** This is required so that child elements of `.card`
can use `position: absolute` to place themselves at exact coordinates WITHIN
the card. Without `position: relative` on the parent, `position: absolute`
children position themselves relative to the entire page instead of the card.
You will see this used in the next step when positioning the rank and suit.

**Why `border-radius: 8px`:** Real playing cards have slightly rounded corners.
`border-radius` controls how much the corners are rounded — 0 = sharp square,
larger values = more rounded. 8px gives a subtle rounding that looks like
a real card without becoming a circle.

### CSS AND SEE

Save. Refresh.

**You should see:**
- A dark rectangle (the card shape) centered on the page
- A barely visible lighter border around it
- The "A♠" text sitting in the top-left corner of the card

**Compare:** Before: text floating on a dark background.
After: text inside a dark rectangle with a border and rounded corners.

**Change something:** Change `border-radius: 8px` to `border-radius: 40px`.
Save. Refresh. The card becomes an oval. Change it back to `8px`.

---

### Step 8 — Position the Rank in the Corner

The rank label "A" should sit in the top-left corner of the card.
After the `.card` rule, add:

```css
        .card {
            /* ... from Step 7 ... */
        }

        .rank {                                        /* ← add from here */
            position: absolute;
            top: 6px;
            left: 8px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            color: var(--color-black);
        }                                              /* ← add to here */
```

**Why `position: absolute`:** Takes the element OUT of the normal document flow
and lets you place it at exact pixel coordinates. Without this, the rank sits
wherever the browser's default text flow puts it (top-left by chance in this
case, but not controllable). With `absolute`, `top` and `left` place it precisely.

**Why `top: 6px; left: 8px`:** Small offsets from the card's edges give the
rank a small margin — it does not touch the card's border. If you set both to
`0px`, the rank text would be flush against the corner, which looks cramped.

**Why `font-family: 'Courier New', monospace`:** Monospace fonts give each
character equal width, which makes card ranks align consistently regardless
of the character (the "1" in "10" takes the same space as the "K" in "K").
The second value `monospace` is a fallback — if 'Courier New' is not installed,
the browser uses any available monospace font instead of defaulting to a
proportional font that would look inconsistent.

**Why `color: var(--color-black)`:** Spades and clubs are the "black" suits.
In dark mode, `--color-black` is set to cyan (`#00c8ff`) so the text is visible
on the dark card. In light mode, it will switch to actual near-black (`#111111`).
The variable name describes the suit family, not the literal color — a deliberate
naming choice to keep the data model clear even though the visual color changes.

### CSS AND SEE

Save. Refresh.

**You should see:**
- "A" appears in cyan in the top-left corner of the card
- The "♠" is still sitting next to it (the suit has no positioning rule yet)

**Change something:** Change `top: 6px` to `top: 40px`. Save. Refresh.
The "A" moves halfway down the card. Change it back to `6px`.

---

### Step 9 — Center the Suit Symbol

After the `.rank` rule, add:

```css
        .rank {
            /* ... from Step 8 ... */
        }

        .suit {                                         /* ← add from here */
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 32px;
            color: var(--color-black);
        }                                               /* ← add to here */
```

**Why `top: 50%; left: 50%`:** Sets the TOP-LEFT CORNER of the suit element
to the center of the card. This is not enough to visually center it —
the element's own size offsets it to the right and down.

**Why `transform: translate(-50%, -50%)`:** Shifts the element left by 50%
of ITS OWN width and up by 50% of ITS OWN height. Combined with `top: 50%; left: 50%`,
this produces true visual centering — the element's center point lands at
the card's center point. This two-step pattern (`top/left 50%` plus `translate -50%`)
is the standard CSS technique for centering an absolutely positioned element
when you do not know its exact dimensions in advance.

**Why `font-size: 32px` for the suit:** The suit symbol is the visual centrepiece
of the card — it should be large enough to read at a glance. 32px is large enough
to be clearly visible but small enough to fit inside an 80px wide card with the
rank labels in the corners.

### CSS AND SEE

Save. Refresh.

**You should see:**
- The ♠ symbol centered on the card (both horizontally and vertically)
- "A" in the top-left corner
- Both in cyan

**Compare:** Before this step, the ♠ was next to the "A" in the corner.
After: the ♠ is in the center of the card where it belongs.

**Change something:** Remove `transform: translate(-50%, -50%)`. Save. Refresh.
The suit moves to the right and down — its top-left corner is now at the card
center, not its own center. Add the transform back.

---

### Step 10 — Add the Bottom-Right Corner Label

Real playing cards show the rank in both corners (top-left and bottom-right,
rotated 180°). First add the new element to the HTML:

```html
    <div class="card">
        <span class="rank">A</span>
        <span class="suit">♠</span>
        <span class="rank bottom-right">A</span>    <!-- ← add this line -->
    </div>
```

**Why a third `<span>` instead of using CSS to duplicate the existing one:**
CSS can style elements that already exist in the HTML, but it cannot create
new content in a position-independent way. The bottom-right rank is a separate
piece of content that needs its own independent position. It needs to be in
the HTML so CSS can place it.

**Why the same class `rank` plus a second class `bottom-right`:**
The `rank` class provides the shared styles (font, size, color).
The `bottom-right` class provides only the position overrides.
Using both classes means you write the shared styles once and only describe
what is different in the second class. This is the CSS principle of
composition — combining classes instead of duplicating rules.

### CSS AND SEE

Save. Refresh.

**You should see:** A second "A" appears — but it is positioned in the
top-left corner next to the first one. The `bottom-right` class does not
exist as a CSS rule yet, so the new element uses only the `.rank` styles.

Now add the positioning rule. After the `.suit` rule, add:

```css
        .suit {
            /* ... from Step 9 ... */
        }

        .bottom-right {                                /* ← add from here */
            top: auto;
            bottom: 6px;
            left: auto;
            right: 8px;
            transform: rotate(180deg);
        }                                              /* ← add to here */
```

**Why `top: auto` and `left: auto`:** The `.rank` rule sets `top: 6px` and
`left: 8px`. CSS specificity means those values carry over to any element
that also has the `.rank` class. Setting them to `auto` cancels the inherited
values so `bottom` and `right` can take effect instead. Without this,
the element would try to satisfy both `top: 6px` and `bottom: 6px` simultaneously,
which produces unpredictable results.

**Why `transform: rotate(180deg)`:** Physical cards have the bottom-right
corner label upside-down so a player holding the card can read it from either
end of the hand. 180 degrees of rotation reproduces this. The center of
rotation is the element's own center, so it rotates in place without moving.

### CSS AND SEE

Save. Refresh.

**You should see:**
- "A" in the top-left (upright)
- ♠ centered
- "A" in the bottom-right (rotated 180°, so upside-down from this viewing angle)

One complete card — rank in both corners, suit centered, correct layout.

---

## PART 2 — Color by Suit

### Concept: Conditional CSS Classes in JavaScript

**What it is:** Adding different CSS class names to an element based on a
JavaScript condition, so CSS rules can style them differently.

**The problem before:**
If you hardcode `color: #ff4466` on the `.suit` rule, EVERY suit symbol is red —
spades and clubs cannot be a different color. You need a way to say
"apply red styling if this card is a heart or diamond."

**The solution:**
Add a class to the element based on the card's data:
```javascript
// If the card is red, add class "red-suit" — otherwise add "black-suit"
const colorClass = card.color === 'red' ? 'red-suit' : 'black-suit'
```
Then define `.red-suit` and `.black-suit` in CSS with different colors.
The JavaScript decides WHICH class to apply. The CSS decides WHAT that class looks like.

**Canonical example (General Explanation):**
Think of CSS classes like clothing labels. A shirt does not change its fabric
based on the weather — but you choose which shirt to put on based on the weather.
JavaScript is the "choosing" logic. CSS is the "shirt." The class name is the label.

```html
<!-- JavaScript adds either "warm-day" or "cold-day" to this div -->
<div class="weather-box warm-day">Today's weather</div>
```
```css
.warm-day  { background: orange; }
.cold-day  { background: blue; }
```

**Project Application (The "Why" here):**
Each card in our data has a `color` property: `'red'` or `'black'`.
When `renderCard()` builds the HTML string, it reads this property and
chooses between `'red-suit'` and `'black-suit'` as the class name.
The CSS then maps those class names to the actual colors (`--color-red` and
`--color-black`). This separation means changing the red color later only
requires changing `--color-red` — nothing in the JavaScript changes.

**Watch for:** The ternary operator `condition ? valueIfTrue : valueIfFalse`
is a one-line if/else. `card.color === 'red' ? 'red-suit' : 'black-suit'`
means: if `card.color` equals the string `'red'`, use `'red-suit'`,
otherwise use `'black-suit'`. The triple equals `===` checks both value
AND type — `'red' === 'red'` is true, `'red' === 'Red'` is false (different case).

---

### Step 11 — Add the Color CSS Rules

After `.bottom-right` in your style block, add the two color classes:

```css
        .bottom-right {
            /* ... from Step 10 ... */
        }

        .red-suit {                                    /* ← add from here */
            color: var(--color-red);
        }

        .black-suit {
            color: var(--color-black);
        }                                              /* ← add to here */
```

**Why only a `color` rule in each class:** These classes do ONE thing —
set the text color. All other styles (font size, position) come from `.rank`
and `.suit`. This is the "single responsibility" principle applied to CSS:
each class does exactly one job. Mixing position and color into the same
class would make it harder to reuse either rule independently.

### CSS AND SEE

Save. Refresh.

**You should see:** No visible change yet — no element has the `red-suit`
or `black-suit` class applied. The classes exist in the CSS but nothing
uses them. This step just confirms the syntax is valid.

---

### Step 12 — Add the Script Block

At the bottom of `<body>`, just before `</body>`, add:

```html
    <div class="card">
        <span class="rank">A</span>
        <span class="suit">♠</span>
        <span class="rank bottom-right">A</span>
    </div>

    <script>                                           <!-- ← add this line -->

    </script>                                          <!-- ← add this line -->

</body>
```

**Why a `<script>` block at the BOTTOM of `<body>` instead of in `<head>`:**
When the browser reads JavaScript, it pauses and runs it immediately.
If the script tries to find an element (`document.getElementById('card')`)
but the browser has not parsed that element yet (because it is lower in the
HTML), it returns `null` and the script fails. Placing `<script>` at the
bottom of `<body>` guarantees that all HTML elements exist before the
JavaScript tries to find them.

### SAVE AND TRY

Save. Refresh. Open DevTools Console (F12, click Console tab).

**You should see:** No errors in the console. The script block is empty
but valid. If you see a red error, the script tag itself was misplaced
or has a typo.

---

### Concept: Template Literals — Building HTML Strings with Variables

**What it is:** A way to build strings in JavaScript that can contain variable
values, using backtick characters instead of quotes.

**The problem before:**
```javascript
const rank = 'A'
const suit = '♠'
const colorClass = 'black-suit'

// Old way — concatenation with + and escaped quotes:
const html = '<div class="card"><span class="rank ' + colorClass + '">' + rank + '</span></div>'
// Hard to read. Easy to break a quote. Impossible to format across lines.
```

**The solution:**
```javascript
const rank = 'A'
const suit = '♠'
const colorClass = 'black-suit'

// Template literal — backticks, ${} for variables:
const html = `<div class="card"><span class="rank ${colorClass}">${rank}</span></div>`
// Variables drop in with ${}. No quote escaping. Readable.
```

**Canonical example (General Explanation):**
Think of a form letter: "Dear [NAME], your order [ORDER-ID] has shipped."
The brackets are placeholders — you fill them in per letter.
Template literals work the same way: the backtick string is the letter template,
`${}` is the bracket, and the variable inside is the filled-in value.

```javascript
const name = 'Alice'
const item = 'wrench'
const message = `Hello ${name}, your ${item} has shipped.`
// Result: "Hello Alice, your wrench has shipped."
```

**Project Application (The "Why" here):**
`renderCard()` receives a card object and must produce an HTML string with
the card's specific rank, suit, and color class dropped into the right places.
Template literals make that readable — you can see the HTML structure clearly
with the `${}` placeholders where the data goes, rather than a tangled chain
of string concatenations.

**Watch for:** Template literals use backticks `` ` `` — the key in the
top-left of the keyboard, same key as `~`. Using a regular quote (`'` or `"`)
instead of a backtick makes it a regular string — `${}` will appear literally
in the output instead of being replaced with the variable value.

---

### Step 13 — Write renderCard()

Inside the `<script>` block, add the card data and the render function:

```html
    <script>

        const myHand = [                               /* ← add from here */
            { rank: 'A', suit: '♠', color: 'black' },
            { rank: '7', suit: '♥', color: 'red'   },
            { rank: 'K', suit: '♦', color: 'red'   },
            { rank: '8', suit: '♣', color: 'black' },
            { rank: 'J', suit: '♠', color: 'black' },
        ]
        /* myHand is an array of objects.
           Each object represents one card.
           The server will replace this with real dealt cards in Lab G2.
           Using an array now means the render code will not change when
           that switch happens — only the data source changes. */

    </script>                                          /* ← add to here */
```

### SAVE AND TRY

Save. Open DevTools Console. Type:

```javascript
myHand
```

**Expected:** The array of 5 card objects appears. Click the arrow to expand it.
You should see each object with `rank`, `suit`, and `color` properties.

```javascript
myHand[0].rank
```

**Expected:** `'A'`

```javascript
myHand[1].color
```

**Expected:** `'red'`

**Change something:** Add a sixth card to `myHand`:
```javascript
{ rank: '3', suit: '♦', color: 'red' },
```
Save. Check `myHand.length` in the console.
**Expected:** `6`. Remove the extra card.

---

Now add the `renderCard` function. Inside `<script>`, after the `myHand` array:

```html
    <script>

        const myHand = [
            /* ... cards from above ... */
        ]

        function renderCard(card) {                    /* ← add from here */
            const colorClass = card.color === 'red' ? 'red-suit' : 'black-suit'
            /* ternary operator: if card.color equals 'red', colorClass = 'red-suit'
               otherwise colorClass = 'black-suit'
               This determines which CSS color rule applies to the rank and suit */

            return `
                <div class="card">
                    <span class="rank ${colorClass}">${card.rank}</span>
                    <span class="suit ${colorClass}">${card.suit}</span>
                    <span class="rank bottom-right ${colorClass}">${card.rank}</span>
                </div>
            `
            /* Template literal: the card's rank, suit, and colorClass are
               injected into the HTML string via ${}
               The function returns this string — it does not put it on screen yet.
               The caller decides where to place the HTML. */
        }

    </script>                                          /* ← add to here */
```

### SAVE AND TRY

Save. Open DevTools Console. Type:

```javascript
renderCard(myHand[0])
```

**Expected:** A multi-line HTML string beginning with `<div class="card">`.
You should see `rank black-suit` in the class names and `A` where the rank goes.

```javascript
renderCard(myHand[1])
```

**Expected:** The same structure but with `red-suit` class and `7` and `♥`.

The function produces correct HTML. It is not on screen yet — that comes next.

---

### Concept: `.map()` — Transform Every Item in an Array

**What it is:** An array method that runs a function on every item and
returns a NEW array containing the results. The original array is unchanged.

**The problem before:**
```javascript
const cardHTMLParts = []
for (let index = 0; index < myHand.length; index++) {
    cardHTMLParts.push(renderCard(myHand[index]))
}
const allCardsHTML = cardHTMLParts.join('')
// 4 lines to do what .map() does in 1
```

**The solution:**
```javascript
const allCardsHTML = myHand.map(card => renderCard(card)).join('')
// .map() runs renderCard() on every card, returns an array of HTML strings
// .join('') stitches the array into one long string with no separator
```

**Canonical example (General Explanation):**
You have a list of prices in dollars: `[10, 25, 8]`.
You want a list of the same prices converted to cents: `[1000, 2500, 800]`.
`.map(price => price * 100)` does exactly that — it transforms each item
by running the function, and gives you back a new array of results.
The original price list is untouched.

**Project Application (The "Why" here):**
`myHand` is an array of card objects. You need an array of HTML strings —
one string per card. `.map(card => renderCard(card))` transforms the data
array into an HTML array. `.join('')` then collapses that array into one
string that can be assigned to `innerHTML` all at once.

**Watch for:** `.map()` always returns an array, even if you give it one
item. `.join('')` is almost always used immediately after to convert the
array into a string for use as HTML. Forgetting `.join('')` means assigning
an array to `innerHTML`, which gives you "[object Object],[object Object]..."
instead of your HTML.

---

### Step 14 — Remove the Hardcoded Card, Render from Data

The hardcoded `<div class="card">` in your HTML body needs to be replaced
with an empty container. JavaScript will fill it.

In the HTML body, replace the existing card div with an empty container:

```html
<body>

    <div id="player-hand"></div>    <!-- ← replace the entire .card div with this -->

    <script>
```

**Why `id="player-hand"` instead of `class`:** IDs are unique — there is
exactly one element with this identifier on the page. `document.getElementById`
finds it by that unique name. Classes are for groups of elements that share
styling; IDs are for individual elements that JavaScript needs to target by name.

### SAVE AND TRY

Save. Refresh.

**You should see:** The card disappears — the container is empty and has
no dimensions. The page is dark. This is correct — the next step puts
the cards back using JavaScript.

Now add the rendering call. Inside `<script>`, after `renderCard()`:

```html
    <script>

        const myHand = [ /* ... */ ]

        function renderCard(card) { /* ... */ }

        const handEl = document.getElementById('player-hand')
        /* getElementById finds the element whose id attribute equals 'player-hand'
           Returns the DOM element object — a live reference to that HTML element
           Storing it in a variable avoids searching the DOM again every time you need it */

        handEl.innerHTML = myHand.map(card => renderCard(card)).join('')
        /* .map() runs renderCard on every card → array of HTML strings
           .join('') → one long HTML string
           Assigning to .innerHTML tells the browser to parse that string
           as HTML and insert the resulting elements into handEl */

    </script>
```

### SAVE AND TRY

Save. Refresh.

**You should see:**
- Five cards stacked directly on top of each other (all in the same position)
- The top card shows A♠ in cyan
- Cycling through by inspecting with DevTools reveals all five are there

**In DevTools Console:**
```javascript
document.querySelectorAll('.card').length
```
**Expected:** `5` — all five cards are in the DOM.

```javascript
document.querySelectorAll('.red-suit').length
```
**Expected:** `6` — the two red cards (7♥ and K♦) each have 3 elements
with `red-suit` (rank top, suit center, rank bottom).

**Change something:** Change `myHand.map(card => renderCard(card))` to
`myHand.slice(0, 2).map(card => renderCard(card))`.
Save. Refresh. Only 2 cards now. Change it back to the full `.map()`.

---

## PART 3 — The Hand Layout

### Concept: CSS `margin-left` with Negative Values

**What it is:** A negative margin pulls an element toward the element before it,
creating deliberate overlap instead of spacing.

**The problem:**
Cards laid out normally sit side by side with space between them.
A real hand of cards overlaps — each card slides partially behind the next.

**The solution:**
```css
.card {
    margin-left: -22px;   /* pull each card 22px to the left, into the previous card */
}
.card:first-child {
    margin-left: 0;       /* first card has nothing to pull toward — no overlap */
}
```

**Canonical example (General Explanation):**
Stack five books side by side on a table. Slide each one 2 cm to the LEFT,
so it covers the right edge of the previous book. The first book cannot slide
left (there is nothing before it), so it stays put. The result looks like a
spread hand of cards. Negative `margin-left` is the CSS equivalent of that slide.

**Project Application (The "Why" here):**
`-22px` of overlap was chosen to show roughly 58px of each card (80px wide, 22px hidden).
This reveals the rank label in the top-left corner of each card while keeping
the hand compact enough to fit on screen. You can tune this value later to
change how spread or compact the hand looks.

**Watch for:** Negative margins can cause elements to overlap in unintended ways
if `z-index` is not managed. The card that is hovered needs `z-index: 10`
so it appears on top of its neighbors when lifted. Without it, the hover
animation lifts the card but it still appears behind the cards to its right.

---

### Step 15 — Make the Cards Overlap

Add these rules to the style block, after `.black-suit`:

```css
        .black-suit {
            /* ... from Step 11 ... */
        }

        #player-hand {                                 /* ← add from here */
            display: flex;
        }
        /* display: flex makes the hand container arrange its children
           (the cards) in a horizontal row instead of stacking vertically.
           Without this, each .card is a block element and stacks top-to-bottom. */

    </style>
```

### CSS AND SEE

Save. Refresh.

**You should see:** The five cards now appear side by side in a row instead
of stacked. They do not overlap yet — that comes in the next rule.

Now add the overlap rule. Inside `#player-hand`'s rule, add:

```css
        #player-hand {
            display: flex;
        }

        .card {                                        /* ← add from here */
            margin-left: -22px;
        }

        .card:first-child {
            margin-left: 0;
        }                                              /* ← add to here */
```

### CSS AND SEE

Save. Refresh.

**You should see:**
- Cards overlapping — each card slides 22px under the previous one
- The A♠ card is fully visible on the left, each successive card partially hidden

**Change something:** Change `-22px` to `-60px`. Save. Refresh.
The cards overlap much more — almost hidden behind each other.
Change it back to `-22px`.

---

### Step 16 — Add the Hover Lift

Add these rules after `.card:first-child`:

```css
        .card:first-child {
            margin-left: 0;
        }

        .card {                                        /* ← add from here */
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            cursor: pointer;
            z-index: 1;
        }
        /* transition: tells the browser to animate changes to 'transform' and 'box-shadow'
           over 0.15 seconds using the 'ease' timing (starts fast, slows down).
           Without transition, changes are instant — no animation.
           cursor: pointer shows the hand cursor on hover, signaling the card is clickable.
           z-index: 1 sets the base stacking order so hover can raise it above this value. */

        .card:hover {
            transform: translateY(-18px);
            box-shadow: 0 12px 28px rgba(0,0,0,0.5);
            z-index: 10;
        }
        /* :hover is a CSS pseudo-class — applies only when the mouse is over the element.
           translateY(-18px) moves the card 18px upward (negative Y = up on screen).
           box-shadow adds a shadow below the lifted card, reinforcing the illusion of height.
           z-index: 10 brings the card in front of all others (which have z-index: 1). */
                                                       /* ← add to here */
```

**Note:** You are adding a second `.card {}` rule block. CSS allows this —
the browser merges all rules for the same selector. This is intentional:
keeping the overlap rules (margin) separate from the interaction rules
(transition, cursor) makes each block's purpose clearer.

### CSS AND SEE

Save. Refresh.

**You should see:**
- Hover over any card — it smoothly lifts 18px upward
- A shadow appears below it
- It appears in front of the cards next to it
- Moving the mouse away lowers it smoothly back

**Change something:** Change `0.15s` to `1s` in the `transition` rule.
Save. The hover animation becomes very slow. Change it back to `0.15s`.

---

## PART 4 — Light/Dark Mode Toggle

### Concept: Toggling a CSS Class on the Root Element

**What it is:** Adding or removing a CSS class on the `<html>` element from
JavaScript, which causes a completely different set of CSS variable values
to activate across the entire page.

**The problem:**
You have dark-mode colors defined in `:root`. To switch to light mode,
you need to change a dozen color values. You cannot call JavaScript to
change each CSS variable one by one — that is slow and fragile.

**The solution:**
Define a second set of variable values in `:root.light {}`.
When JavaScript adds the class `light` to `<html>`, that rule activates
and its values override all the matching `:root {}` values.
One class toggle — every variable switches.

**Canonical example (General Explanation):**
Imagine a theater with two lighting presets: "Day Scene" and "Night Scene."
The lighting board has a single switch labeled "NIGHT." When you flip it,
the board applies dozens of dimmer settings simultaneously.
You do not adjust each light individually. `:root {}` is the Day preset.
`:root.light {}` is the Night preset. `classList.toggle('light')` is the switch.

**Project Application (The "Why" here):**
The `<html>` element is the topmost element in the document — adding a class
to it affects every CSS rule that uses a descendant selector. `:root.light`
means "when the `<html>` element has class `light`." All variables defined
there override the dark-mode defaults. The toggle button simply adds or
removes that class. Every `var(--bg-card)`, `var(--color-red)`, etc., 
across every element, updates in the same browser paint cycle.

**Watch for:** `document.documentElement` is the JavaScript reference to the
`<html>` element. It is NOT `document.body` (that is `<body>`).
CSS `:root` corresponds to `document.documentElement`. Using `document.body`
for the toggle would not activate the `:root.light` override rule.

---

### Step 17 — Add the Light Mode Variables

Inside `<style>`, after the closing `}` of `:root`, add:

```css
        :root {
            /* ... dark mode variables from Step 5 ... */
        }

        :root.light {                                  /* ← add from here */
            --bg-table:    #dde8f5;
            --bg-card:     #ffffff;
            --border-card: rgba(0,0,0,0.12);
            --color-red:   #cc0022;
            --color-black: #111111;
            --color-accent: #0055cc;
            --color-muted:  rgba(0,85,204,0.35);
            --color-text:  #111111;
        }                                              /* ← add to here */
```

**Why every variable is redefined here:** The `:root.light {}` block only
needs to redefine variables that change between modes. But redefining all
of them makes the light mode self-documenting — you can read this block and
know exactly what the light mode looks like without cross-referencing the
dark mode block. Maintenance is easier when each mode is complete on its own.

**Why `--bg-table: #dde8f5`:** A light blue-grey — evokes a card table surface
under bright light. Pure white would be too stark and glaring.

**Why `--color-black: #111111` in light mode:** On a white card, the actual
suit color for spades/clubs can be near-black, as it would be on a physical card.
The variable name `--color-black` refers to the suit family (the "dark" suits),
not the visual color — in dark mode it is cyan for visibility, in light mode
it is near-black for realism.

### CSS AND SEE

Save. Refresh.

**You should see:** No visible change — `:root.light` only activates when
the `<html>` element has the class `light`. That class is not added yet.
This step confirms the CSS block syntax is valid.

---

### Step 18 — Add the Toggle Button to HTML

In the `<body>`, before the `#player-hand` div, add:

```html
<body>

    <button id="modeBtn">☀ LIGHT</button>    <!-- ← add this line -->

    <div id="player-hand"></div>

    <script>
```

**Why before `#player-hand`:** The toggle button should sit above the card
hand visually. Elements in HTML render top-to-bottom by default — putting
the button before the hand means it appears above the hand in the browser.

### CSS AND SEE

Save. Refresh.

**You should see:**
- A browser-default button labeled "☀ LIGHT" appears above the cards
- It has no custom styling yet — plain grey browser button

---

### Step 19 — Style the Toggle Button

After the `#player-hand` rule, add:

```css
        #player-hand {
            display: flex;
        }

        #modeBtn {                                     /* ← add from here */
            font-family: 'Courier New', monospace;
            font-size: 10px;
            background: transparent;
            border: 1px solid var(--color-accent);
            color: var(--color-accent);
            padding: 5px 12px;
            border-radius: 4px;
            cursor: pointer;
            letter-spacing: 0.1em;
            margin-bottom: 16px;
            display: block;
        }                                              /* ← add to here */
```

**Why `background: transparent`:** The browser's default button background
is grey. Removing it lets the button blend into the table background,
making the border and text the visual elements rather than the button shape.

**Why `var(--color-accent)` for both border and text color:** Using the same
accent color for both makes the button look like a cohesive unit.
When light mode activates and `--color-accent` changes from green to blue,
both the border and the text color update together automatically.

### CSS AND SEE

Save. Refresh.

**You should see:**
- A styled button with a green border and green text on a transparent background
- The monospace font matches the card text
- Below it, the five overlapping cards

**Change something:** Change `border: 1px solid` to `border: 2px solid`.
Save. The border becomes thicker. Change it back to `1px`.

---

### Step 20 — Wire the Toggle in JavaScript

Inside `<script>`, after the `handEl.innerHTML` line, add:

```html
    <script>

        const myHand = [ /* ... */ ]

        function renderCard(card) { /* ... */ }

        const handEl = document.getElementById('player-hand')
        handEl.innerHTML = myHand.map(card => renderCard(card)).join('')

        const modeBtn = document.getElementById('modeBtn')
        /* getElementById finds the button element we added in Step 18 */

        modeBtn.addEventListener('click', () => {      /* ← add from here */
            const isLight = document.documentElement.classList.toggle('light')
            /* classList.toggle('light'):
               - If 'light' class is absent → adds it → returns true
               - If 'light' class is present → removes it → returns false
               document.documentElement is the <html> element.
               Adding 'light' to <html> activates the :root.light CSS block,
               switching every CSS variable to its light-mode value. */

            modeBtn.textContent = isLight ? '🌙 DARK' : '☀ LIGHT'
            /* Update the button label to show what clicking it will DO next.
               When light mode is active, clicking should go back to dark → show '🌙 DARK'.
               When dark mode is active, clicking should go to light → show '☀ LIGHT'. */
        })                                             /* ← add to here */

    </script>
```

### SAVE AND TRY

Save. Refresh.

**You should see:**
- Dark table, dark cards, cyan suits — the default dark mode
- Click "☀ LIGHT" — everything switches instantly to light mode
- Button label changes to "🌙 DARK"
- Click "🌙 DARK" — back to dark mode, button shows "☀ LIGHT"

**In DevTools Console:**
```javascript
document.documentElement.classList.contains('light')
```
**Expected in dark mode:** `false`

Click the toggle. Run it again.
**Expected in light mode:** `true`

**Change something:** In `:root.light {}`, change `--bg-table: #dde8f5`
to `--bg-table: #fffbe6`. Save. Click the toggle to light mode.
Table turns warm cream-yellow. Change it back to `#dde8f5`.

---

## 🎯 Challenge: Add a Card Click Handler

**You know:** `addEventListener('click', ...)` runs a function when something
is clicked. `querySelectorAll('.card')` returns all card elements.
`forEach((element, index) => ...)` loops over them with both the element and
its position.

**Task:** When the player clicks a card in their hand, log that card's rank
and suit to the console. Clicking the 7♥ should print:
```
You clicked: 7 of ♥
```

**Starting code — add this after `handEl.innerHTML = ...`:**

```javascript
const cardEls = handEl.querySelectorAll('.card')
// cardEls is a list of all .card elements inside handEl
// Add a click handler to each one here
```

**Hint:** `cardEls` and `myHand` are in the same order —
`cardEls[0]` corresponds to `myHand[0]`, `cardEls[1]` to `myHand[1]`, etc.
The `index` parameter in `forEach` gives you the position number.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```javascript
const cardEls = handEl.querySelectorAll('.card')

cardEls.forEach((cardEl, index) => {
    /* forEach gives both the element (cardEl) and its position (index).
       index 0 = first card, index 1 = second card, etc.
       myHand[index] is the card data at that same position. */
    cardEl.addEventListener('click', () => {
        const card = myHand[index]
        console.log(`You clicked: ${card.rank} of ${card.suit}`)
    })
})
```

**Key insight:** When you generate HTML from an array with `.map()`, the DOM
elements and the original data array stay in the same order. The nth element
in the DOM corresponds to the nth item in the array. Using the `index` parameter
as a bridge between the two is the standard pattern for attaching data to
dynamically generated elements. You will use this exact pattern in Lab G3
when clicking a card sends it to the server.

</details>

---

## 🎯 Challenge: Show Card Count Labels

**You know:** `textContent` sets the visible text of a DOM element.
Template literals insert variable values into strings.
`myHand.length` gives the number of cards in the array.

**Task:** Above the hand, display a label that reads:
```
YOUR HAND — 5 CARDS
```
When you change `myHand` to have 3 cards, the label should automatically
show "3 CARDS" without you manually updating the label text.

**Hint:** Create a `<div>` in the HTML with an `id`, then set its
`textContent` in JavaScript using `myHand.length`.

---

<details>
<summary>▶ Show Solution</summary>

**In the HTML body, add a label div above the hand:**
```html
<div id="hand-label"></div>    <!-- ← add above #player-hand -->
<div id="player-hand"></div>
```

**In JavaScript, after `handEl.innerHTML = ...`:**
```javascript
const handLabel = document.getElementById('hand-label')
handLabel.textContent = `YOUR HAND — ${myHand.length} CARDS`
/* Template literal: myHand.length evaluates to 5 (or however many cards)
   and is inserted into the string. If myHand changes size, updating this
   one line keeps the label accurate. */
```

**Key insight:** Setting the label from `myHand.length` instead of hardcoding
"5 CARDS" means the label stays correct even when the hand size changes —
which it will constantly during a real game. Data drives display; display
never hardcodes data. This principle appears in every lab from here onward.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Dark background fills window | Refresh the page — no white edges visible |
| Five cards appear in a row | Count the cards — should be exactly 5 |
| Cards overlap correctly | Each card partially hidden behind the next |
| Red suits are red/pink | ♥ and ♦ appear in pink-red color |
| Black suits are cyan | ♠ and ♣ appear in cyan color |
| Bottom-right rank is rotated | Inspect bottom corner — rank is upside-down |
| Hover lifts a card | Mouse over any card — it rises smoothly |
| Hover card appears on top | Lifted card is in front of neighbors, not behind |
| Animation is smooth | No sudden jump — card glides up and down |
| Toggle switches to light mode | Click button — white cards on light blue table |
| Toggle switches back to dark | Click again — dark cards return |
| Button label updates | Shows "🌙 DARK" in light mode, "☀ LIGHT" in dark mode |
| CSS variable drives the color | Change one variable in `:root` — multiple elements update |

---

## Quick Check Answers

**1. The suit symbols ♠ ♥ ♦ ♣ appear without image files. How?**
They are Unicode characters — text characters with higher code point numbers
than the standard alphabet. The browser renders them using whatever font is
loaded, the same way it renders the letter "A." Because they are text, CSS
properties like `color` and `font-size` apply to them directly. In this project,
each card object stores its suit as the character itself (`'♠'`), which drops
into the HTML template literal via `${card.suit}`. No image files involved.

**2. How does one button change every color on the page at once?**
CSS variables. Every color in the stylesheet is written as `var(--variable-name)`
instead of a hardcoded hex value. Dark mode variable values are defined in `:root {}`.
Light mode overrides are defined in `:root.light {}`. When JavaScript adds
the class `light` to `<html>` via `document.documentElement.classList.toggle('light')`,
the override values activate. Every element that uses those variables updates
in the same browser paint cycle — simultaneously, with no JavaScript loop
over individual elements.

**3. What happens when you hover a card that is under another card?**
Nothing — the card underneath cannot receive hover events because the card
on top intercepts the mouse. CSS `:hover` only activates on the topmost element
at the cursor position. If you hover near the visible edge of an underlying card
(the part not covered by the card above), that portion CAN receive hover events.
This is the natural behavior of `z-index` stacking. In Lab G3, you will
add click detection that accounts for this by making each card's click handler
active only when the card is at least partially visible.

---

## What's Next — Lab G2

Lab G1 gave you the visual layer — cards on screen, suits colored correctly,
hover animations, light/dark mode.

Lab G2 connects this to a Python WebSocket server:
- Why WebSockets instead of HTTP (the persistent connection explained)
- Two browser tabs connect to one server simultaneously
- The server deals real cards from a shuffled deck
- Each tab sees its own hand face-up, opponent's cards face-down
- The `renderCard()` function you wrote today plugs straight in —
  you replace `myHand` with server data, and nothing else changes

---

*Lab G1 complete. One card became a hand. Data drives display. The toggle works.*

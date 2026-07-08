# React Calculator — Lesson 04 — Rendering the Keypad From Data

## What You Will Build

The exact same ten buttons from lesson 03 — visually nothing changes —
generated from one array and one function call instead of ten hand-written
`<Button />` lines. This is the last lesson before anything on screen
actually does something when clicked.

---

## What You Need to Know First

Lesson 03 — `Button`, and ten `<Button label="..." />` calls inside
`Keypad`.

---

## Step 1 — Name the Problem With Ten Hand-Written Lines

**The problem:** `Keypad.tsx` currently repeats the same shape ten times:

```tsx
<Button label="7" />
<Button label="8" />
```

The only thing different between any two lines is the string inside the
quotes. Whenever the *set* of buttons needs to change — and it will, the
moment scientific mode adds a second row in lesson 15 — every line has to
be hand-edited or hand-added individually. Lesson 03 already turned "ten
components" into "one component, called ten times." This lesson turns "ten
calls, written by hand" into "one call, generated from data."

---

## Step 2 — Describe the Keypad as an Array

Replace `Keypad.tsx`'s contents:

```tsx
const digitLabels = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0"];

function Keypad() {
  return (
    <div className="keypad">
      {digitLabels.map((label) => (
        <Button key={label} label={label} />
      ))}
    </div>
  );
}
```

Click **▶ Preview**. The same ten buttons appear, in the same order —
identical output to lesson 03, from four lines of new code instead of ten
repeated ones.

**Walkthrough — `digitLabels`, a plain array, and precisely what that
means.** `["7", "8", "9", ...]` is an **array literal**: an **array** —
an **ordered**, **indexed** collection of values, meaning each value has a
fixed position (`digitLabels[0]` is `"7"`, `digitLabels[1]` is `"8"`, and
so on), retrievable by that position, and the collection's length can
change over time (an array is not fixed-size, unlike some lower-level
languages' arrays). Nothing about any of this is React-specific — this is
the same kind of value the TypeScript Spreadsheet project stored cell
ranges in, and the same data structure every language with arrays at all
provides. Placing it *outside* the `Keypad` function (at the top level of
the file, running once when the file loads) rather than *inside* it
matters: if it were declared inside `Keypad`, a brand-new array would be
created every single time `Keypad` re-renders, for no reason — the list of
digits never changes, so it only needs to be built once.

**A precise, important fact about arrays worth stating now, used constantly
from here on: they are reference types.** Assigning an array to a second
variable, `const copy = digitLabels;`, does **not** create a second,
independent array — `copy` and `digitLabels` both point to the exact same
underlying array in memory; changing one through either name changes what
both see. This is called being a **reference type**, in contrast to a
**value type** like a `number` or `string`, where `const b = a;` genuinely
copies the value, and changing `b` afterward has no effect on `a` at all.
This exact distinction is why lesson 06's array and object updates always
build a *new* array or object (`[...array, item]`) rather than modifying
one in place — modifying a reference type in place changes it for every
name pointing at it, which is almost never what's actually wanted when
that array is React state.

**Walkthrough — `.map()`, your first array method in this project.**
`digitLabels.map((label) => (...))` is a built-in JavaScript array method.
It calls the function you give it once for every item in the array, and
returns a **new** array made of whatever that function returned each time
— it does not modify `digitLabels` itself. Here, the function receives one
string (`label`, e.g. `"7"`) and returns one JSX element,
`<Button key="7" label="7" />`. The result of the whole `.map()` call is
an array of ten JSX elements — and React knows how to render an array of
elements exactly the way it renders one, placing each in order.

**SE lens — this is the actual beginning of "data-driven UI," a phrase
worth being able to back up with a real example now.** Before this
lesson, `Keypad`'s ten buttons existed because ten lines of JSX said so —
the *code itself* was the only description of what buttons existed. After
this lesson, the buttons exist because `digitLabels` says so — the code
(`.map()`) is now a fixed, generic instruction ("render one `Button` per
entry"), and the actual content lives entirely in a plain array. This is
the concrete, checkable meaning behind "data-driven": changing what's on
screen becomes a matter of changing *data*, not rewriting *markup* — which
is precisely why lesson 15's second row of scientific buttons and lesson
28's `Tabs` component (driven by a `routes` array, not hardcoded tab
names) both reuse this exact shape without it needing to be reinvented.

**CS lens — visiting every element of a collection, once each, in order,
is called traversal.** `.map()` is one specific, common shape of
**traversal**: visit every item, transform it, keep the result. Not every
traversal transforms — some just look (searching for one matching item),
some just act (printing each one) — but the "visit each element exactly
once" shape underneath is the same one, and it's worth recognizing by name
every time it appears, because it appears constantly: lesson 22's
`.filter()`, lesson 24's `.reduce()`, and ordinary `for` loops are all
traversals too, differing only in what they do with each element visited.

`(label) => ( ... )` is an **arrow function** — shorthand for `function
(label) { return ( ... ); }`. The parentheses around the JSX
(`( <Button ... /> )`) are not JSX syntax; they're there purely so the
arrow function's body can span multiple lines while still being understood
as "return this expression," the same way they'd be needed around any
multi-line expression after `return`.

**Walkthrough — `{digitLabels.map(...)}`.** This is the same curly-brace
rule from lesson 03: JSX drops back into plain JavaScript inside `{ }`.
Here, the JavaScript expression happens to evaluate to an *array* of
elements rather than a single string — and that's fine. JSX accepts a
single element, a string, a number, `null`, or an array of any of those, as
something it knows how to render.

---

## Step 3 — The `key` Prop

**The problem:** Even though the output looks identical to lesson 03,
Monaco (and React itself, at runtime, in the browser console) will
complain loudly if `key={label}` is removed from the `<Button />` call
inside `.map()` — a warning that looks unrelated to anything you actually
changed.

Leave `key={label}` in place — it's already in the code above. This step
is about understanding what it does and why it's required specifically
inside `.map()`, and only inside `.map()`.

**CS lens — this is reconciliation, React's list-diffing problem.** Every
time a component re-renders, React needs to figure out, as cheaply as
possible, what actually changed on the page — it does not want to tear
down and rebuild ten real DOM buttons just because one of them changed.
`key` gives React a **stable identity** for each item in a list: something
it can use to recognize "this specific button is the same one as before,
just possibly re-rendered," across renders, even if the array is
reordered, has items added, or has items removed. Without a `key`, React
falls back to matching purely by position (item 0, item 1, item 2...) —
which silently breaks the moment items are inserted, removed, or reordered
anywhere but the very end, because "item 3" no longer refers to the same
logical thing it did before.

**How the diffing algorithm actually uses `key`, at a level worth
knowing.** When `Keypad` re-renders, React has two lists of `<Button />`
elements to compare: the one from last render, and the new one from this
render. Without keys, React compares them position by position — element 0
against element 0, element 1 against element 1 — which is correct only if
nothing has been added, removed, or reordered. With keys, React instead
builds a lookup from key to element for *both* lists, and matches entries
by key first: an element whose key existed in both the old and new list is
recognized as "the same logical thing, possibly with different props now"
and is *updated* in place rather than destroyed and rebuilt; a key present
only in the new list is a genuinely new element to *create*; a key present
only in the old list is one to *remove*. This key-based matching is
**identity** — reconciliation's whole job is answering "is this the same
thing as before, or a different thing that merely looks similar?", and
`key` is the one piece of information your code provides to answer it
correctly instead of by position-guessing.

Right now, this list never changes — the keys aren't yet load-bearing for
correctness, only for silencing the warning. **Forward connection:**
lesson 22 (formula editing and deletion) is exactly the situation where
`key` stops being a formality and starts being the difference between
correct and subtly broken behavior — deleting the wrong item's rendered
state instead of the one actually removed, if keys are missing or wrong.

**Why `label` is a safe key here, specifically.** A `key` must be unique
among siblings in the same list. `digitLabels` has ten different strings,
so `label` works. This will not always be true — a formula's *name* in
lesson 22 could theoretically repeat, which is exactly why that lesson
gives each saved formula its own generated id instead of reusing a
user-editable field as a key.

**SE lens — `key` is a prop React reads and consumes itself; your
component never sees it.** `key` is passed in JSX exactly like any other
prop, `key={label}`, but it is reserved — React intercepts it before your
component function ever runs, uses it internally for reconciliation, and
does **not** include it in the props object your component receives. If
`Button` needs the label for its own rendering (it does), it must still be
passed a second time as an ordinary prop, `label={label}` — that
repetition (`key={label} label={label}`) is normal and expected, not a
mistake.

---

## Connect the Pieces

```
Keypad.tsx   digitLabels — the data: ten strings, defined once
             Keypad() — one .map() call replacing ten hand-written
             <Button /> calls; key={label} gives React stable identity
             per button
```

---

## What Breaks Without This

**Removing `key={label}` entirely:** ▶ Preview still works — the ten
buttons still appear, correctly. Open the browser console (F12 → Console)
and you'll see a real warning: `Warning: Each child in a list should have
a unique "key" prop.` Nothing is broken *yet*, because this specific list
never reorders or changes length — but the warning is React telling you,
honestly, that it can't guarantee correct behavior the moment it does.

**Using the button's array index as the key instead of its label
(`key={index}`):** No warning, and it works fine *today*, but this is a
well-known trap: index-as-key looks identical to a good key right up until
the list's order or length changes, at which point items can silently keep
the wrong internal state after a reorder or deletion. This project uses a
real, stable identity as the key everywhere a list appears, specifically
to never depend on position.

---

## Definition of Done

- [ ] `Keypad` renders its ten buttons from a `digitLabels` array via `.map()`
- [ ] Every `<Button />` inside the `.map()` has a `key` prop
- [ ] ▶ Preview shows the same ten buttons, in the same order, as lesson 03
- [ ] You can explain what `.map()` returns, and that it does not modify the original array
- [ ] You can explain what problem the `key` prop solves, and why index-as-key is risky
- [ ] You can explain what makes an array a "reference type," using `const copy = digitLabels` as the example
- [ ] You can describe, in your own words, how React's diffing algorithm uses keys to match old elements to new ones

---

*Next: Lesson 05 — State: Giving the Display a Memory. `Display` stops
always showing "0" — the first value in this project that can actually
change while the page is running.*

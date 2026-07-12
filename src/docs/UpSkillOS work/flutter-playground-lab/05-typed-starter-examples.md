# Lesson 5 — Typed Starter Examples and a Controlled Dropdown

Today we study **arrays of typed objects** and **controlled form inputs**. Our case
study is letting a student pick from a small list of named starting points — "Blank
counter," "Your own gist" — instead of always loading DartPad's single hardcoded
default. This is the same "small, named, typed collection" shape you've now seen
twice already in this app (`SERIES` in the lesson engine, `PRESETS` in Decomp Lab's
kernel editor, if you've read either) — recognizing that repetition is most of the
point of this lesson.

---

## What You Will Build

A dropdown menu above the DartPad embed listing a couple of starter options. Picking
one changes which gist DartPad loads — including an entry that reads a real gist ID
*you* create yourself on GitHub, proving the full loop end to end with real content
you own, not a placeholder.

---

## What You Need to Know First

Lessons 1 through 4 of this set: `interface`, union types, `useState`, template
literals, and `useGlobalTheme()`. Nothing else is assumed.

---

## The Lesson

### Step 1 — Why a Plain Array of Strings Isn't Enough

You need each option to carry at least two things: a human-readable label ("Blank
counter") and the actual gist ID DartPad should load. A plain `string[]` (an array
of strings) can only hold one piece of information per entry — you'd have to
somehow encode both the label and the ID into a single string and parse them back
apart later, which is exactly the kind of fragile, ad-hoc data shape TypeScript
exists to help you avoid.

#### Concept lab: an array of typed objects

Disposable — deleted at the end of this step.

Create `src/labs/_scratch/fruit-stand.ts` (no `.tsx` — this file has no JSX in it at
all, so it doesn't need the extra `x`; `.ts` is for plain TypeScript, `.tsx` is
specifically for TypeScript files containing JSX):

```typescript
interface FruitStandItem {
  name: string
  priceInCents: number
}

const inventory: FruitStandItem[] = [
  { name: 'Apple', priceInCents: 75 },
  { name: 'Banana', priceInCents: 50 },
  { name: 'Mango', priceInCents: 200 },
]

const totalPriceInCents = inventory.reduce((runningTotal, item) => runningTotal + item.priceInCents, 0)

console.log(`Total inventory value: $${(totalPriceInCents / 100).toFixed(2)}`)
```

**`interface FruitStandItem { name: string; priceInCents: number }`** — the same
`interface` syntax from Lesson 1's `AnnouncementProps`, describing an object shape
with two required fields instead of one.

**`const inventory: FruitStandItem[] = [ ... ]`** — `FruitStandItem[]` reads as "an
array of `FruitStandItem`." Every element inside the `[ ... ]` array literal is
checked against that shape — try adding `{ name: 'Grape' }` with no `priceInCents`
and TypeScript rejects it immediately, before this ever runs, the same fail-fast
guarantee as always, now checking every element of a whole collection at once
instead of one single value.

**`inventory.reduce((runningTotal, item) => runningTotal + item.priceInCents, 0)`**
— `reduce` is an array method that walks every element and combines them into one
final value, using a function you provide. `(runningTotal, item) => runningTotal +
item.priceInCents` is an arrow function taking two parameters: `runningTotal` (the
combined value *so far*) and `item` (the current array element). The `, 0` after
the function is `reduce`'s **starting value** for `runningTotal`, before the first
element is even processed.

**Execution trace — walking through exactly what `reduce` does, step by step:**
```
Start: runningTotal = 0 (the initial value passed as reduce's second argument)

Call 1: item = { name: 'Apple',  priceInCents: 75  }, runningTotal 0   → 0 + 75  = 75
Call 2: item = { name: 'Banana', priceInCents: 50  }, runningTotal 75  → 75 + 50 = 125
Call 3: item = { name: 'Mango',  priceInCents: 200 }, runningTotal 125 → 125 + 200 = 325

reduce returns 325 (no more elements left)
```

**`` `Total inventory value: $${(totalPriceInCents / 100).toFixed(2)}` ``** — the
same template literal syntax from Lesson 4, with one new piece:
`.toFixed(2)` is a method on numbers that formats it as a string with exactly 2
digits after the decimal point — `325 / 100` is `3.25`, and `.toFixed(2)` guarantees
it prints as `"3.25"` rather than, say, `"3.2"` or `"3.250000001"` (a real
possibility with floating-point arithmetic on some numbers, not this particular one
— `.toFixed` is the standard, reliable way to avoid that class of surprise entirely
when displaying a number to a user).

Run it:

```
npx tsc --noEmit src/labs/_scratch/fruit-stand.ts && node -e "require('ts-node/register'); require('./src/labs/_scratch/fruit-stand.ts')"
```

If that exact command doesn't run cleanly in your terminal setup (this project isn't
configured to directly execute standalone `.ts` files with Node — everything real
here runs through Vite instead), it's fine to trust the execution trace above and
skip straight to deleting the file; the trace already showed you every intermediate
value truthfully. **Expected output**, if you do run it: `Total inventory value:
$3.25`.

Delete `src/labs/_scratch/fruit-stand.ts` now.

**CS lens:** `reduce` is the general-purpose shape underneath **every** kind of
array aggregation — summing, counting, finding a maximum, building a new object from
a list, flattening nested arrays. `[1,2,3].reduce((a,b) => a+b, 0)` (sum) and
`[1,2,3].reduce((a,b) => Math.max(a,b), -Infinity)` (maximum) are the same function,
different combining logic. Once you know `reduce`, most "walk a list and produce one
answer" problems are a specific combining function away from solved.

**SE lens:** Typing the array as `FruitStandItem[]` rather than leaving it untyped
means every place that later reads `inventory` — a rendering function, a search, a
sort — gets the same compile-time guarantee: every element definitely has `name`
and `priceInCents`, with no need to defensively check `if (item.priceInCents !==
undefined)` everywhere out of uncertainty about the data's shape.

**Recognition — `reduce`-shaped aggregation recurs in:** SQL's `SUM()`/`COUNT()`/
`MAX()` aggregate functions, spreadsheet `SUM()` formulas, MapReduce (a distributed
computing pattern literally named after this exact idea, at massive scale), and
functional programming's `fold`/`foldl` (the name `reduce` uses in many other
languages).

---

### Step 2 — The Real Starter-Example List

Real project code. Add this above the `FlutterPlaygroundLab` function:

```typescript
interface StarterExample {
  id: string
  label: string
  gistId: string | null
}

const STARTER_EXAMPLES: StarterExample[] = [
  { id: 'default', label: 'Blank counter (DartPad default)', gistId: null },
  { id: 'my-gist', label: 'Your own gist', gistId: null },
]
```

**`gistId: string | null`** — a union type again (Lesson 3's `'phone' | 'full'`),
but this time combining a real type (`string`) with the special type `null` instead
of two string literals. This says: this field is either a real string, or explicitly
"no value here." **Why not just leave `gistId` optional (`gistId?: string`)
instead**, which you already know from Lesson 1: `?` would mean the field can be
*missing entirely* — the key wouldn't exist on the object at all. `string | null`
means the field is *always present*, but its value might explicitly be "nothing" —
a meaningfully different guarantee. Here, every `StarterExample` should always
*have* a `gistId` field to check; it just might currently hold `null`, meaning "load
DartPad's own default," rather than sometimes not existing as a key at all. Choosing
between "optional field" and "required field that can be `null`" is a real design
decision every time you shape a type — not interchangeable, and worth pausing on
each time.

**Set your own gist ID:** go to `gist.github.com`, sign in, and create a new public
gist containing one file named `main.dart` with any small Dart snippet — even just
```dart
void main() {
  print('Hello from my own gist!');
}
```
is enough. Save it, and copy the gist's ID from its URL (the long string of letters
and numbers after your username, e.g. `gist.github.com/yourname/a1b2c3d4...` — the
`a1b2c3d4...` part). Paste that real ID into the `'my-gist'` entry above, replacing
`null`:

```typescript
{ id: 'my-gist', label: 'Your own gist', gistId: 'a1b2c3d4e5f6...' },
```

This is a deliberate, real step, not a placeholder — you are about to load content
*you* actually created into the embed, proving the whole mechanism with something
that isn't hand-fed to you by this lesson.

---

### Step 3 — The Controlled `<select>`

Add state for which example is currently selected, and build the URL from it:

```typescript
const [selectedExampleId, setSelectedExampleId] = useState('default')
const selectedExample = STARTER_EXAMPLES.find(example => example.id === selectedExampleId) ?? STARTER_EXAMPLES[0]

const dartPadTheme = isDarkGlobal ? 'dark' : 'light'
const gistParam = selectedExample.gistId ? `&id=${selectedExample.gistId}` : ''
const dartPadUrl = `https://dartpad.dev/embed-flutter.html?theme=${dartPadTheme}&run=true&split=50${gistParam}`
```

And render the dropdown itself, in the header bar next to the phone/full toggle:

```typescript
<select
  value={selectedExampleId}
  onChange={event => setSelectedExampleId(event.target.value)}
  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"
>
  {STARTER_EXAMPLES.map(example => (
    <option key={example.id} value={example.id}>{example.label}</option>
  ))}
</select>
```

**`STARTER_EXAMPLES.find(example => example.id === selectedExampleId)`** — `find` is
an array method, already introduced by name in `lesson-engine-autofind` if you've
read it, explained fully here regardless: it walks the array from the start and
returns the *first* element for which the given function returns `true`, or
`undefined` if none match. `?? STARTER_EXAMPLES[0]` — the nullish coalescing
operator from Lesson 1 — falls back to the first example if, somehow,
`selectedExampleId` didn't match anything (defensive, but genuinely unreachable in
this code as written, because `selectedExampleId` only ever gets set by the
`<select>` below, which only ever offers valid ids — a small piece of defensive
programming for robustness against future changes, not a bug you're expected to hit
today).

**`selectedExample.gistId ? `&id=${selectedExample.gistId}` : ''`** — the ternary
operator again, this time producing either a real query-string fragment or an empty
string. When `gistId` is `null` (the "Blank counter" option), `gistParam` becomes
`''`, and the final template literal's trailing `${gistParam}` contributes nothing —
the URL ends up identical to Lesson 4's version, no `id=` parameter at all, DartPad's
own default loads. When `gistId` holds your real pasted ID, `gistParam` becomes
`&id=a1b2c3d4...`, appended onto the end of the existing query string.

**`<select value={selectedExampleId} onChange={...}>`** — this is a **controlled
component**, a specific, important React pattern, first appearance in this lesson
set. An *uncontrolled* HTML `<select>` manages its own selected value internally,
the way it would on a plain HTML page with no JavaScript at all — the browser
remembers what's selected, and you'd have to actively ask it (via a ref) to find out
later. A *controlled* `<select>` instead has its `value` **prop** tell it what to
show — React, not the browser, is the single source of truth for what's currently
selected — and `onChange` is required to keep that value updated: without it, the
`<select>` would visually appear entirely unresponsive to clicks, because React
would keep forcing it back to whatever `value` says on every render, and nothing
would ever change `value`.

**`onChange={event => setSelectedExampleId(event.target.value)}`** — `event` is the
**DOM event object** React hands to any `on*` handler, describing what just
happened. `event.target` is the actual `<select>` DOM element that fired the event;
`.value` is that element's current selected value (a string — every value in an
HTML `<option>` is always a string, which is exactly why `STARTER_EXAMPLES`'s `id`
fields are `string`, matching what a real `<select>` can ever actually hand back).

**`{STARTER_EXAMPLES.map(example => ( <option key={example.id} ...> ))}`** — `map`
transforms every element of an array into something else, one-to-one, producing a
new array of the same length — here, transforming each `StarterExample` object into
one `<option>` JSX element. `key={example.id}` is required by React whenever you
render a list this way: it needs a stable, unique identifier per item to correctly
track which rendered element corresponds to which data across re-renders (if the
list order ever changed, `key` is what lets React reuse the right DOM nodes instead
of tearing everything down and rebuilding it) — a concept worth naming now even
though this particular list never reorders, because you will write many lists in
this app that do.

---

### Step 4 — Run It

`npm run dev`, open Flutter Playground. **Expected output:** a dropdown appears
showing "Blank counter (DartPad default)" and "Your own gist." Leave it on the
default — DartPad shows its usual counter app, as in every prior lesson. Switch the
dropdown to "Your own gist." **Expected output:** the "Loading DartPad…" overlay
briefly reappears (same reload-on-`src`-change behavior from Lesson 4, now
triggered by a different piece of state changing the URL instead of the theme), and
DartPad loads **your actual gist** — the exact Dart code you wrote and saved on
GitHub, proving the full chain: your typed `StarterExample` list → your selected
`gistId` → the URL's `id=` parameter → DartPad fetching and rendering the real gist
by that ID.

---

## Connect the Pieces

`STARTER_EXAMPLES` is a small, local, typed array — deliberately not yet using this
app's `import.meta.glob` auto-discovery pattern from `lesson-engine-autofind`, and
that's a real, correct choice worth stating explicitly: auto-discovery earns its
complexity when a *list of files on disk* needs to become a list of options (dozens
of lesson files, in that lesson's case). Two hardcoded starter examples don't need
that machinery yet — reaching for the more powerful tool before the simpler one
stops being enough is its own mistake, not a virtue, the same restraint Lesson 3
named when it chose not to extract shared iframe JSX prematurely.

`dartPadUrl` is now built from *two* independent pieces of derived state
(`dartPadTheme` from Lesson 4, `gistParam` from this lesson), combined into one
template literal — proving the "derive, don't duplicate" approach from Lesson 4
scales cleanly to more than one input without needing a different technique.

---

## What Breaks Without This

Forget `key={example.id}` on the mapped `<option>` elements: nothing visibly breaks
today, because this particular list is small and never reorders — but React logs a
console warning ("Each child in a list should have a unique key prop"), and the
*reason* that warning exists is real: without stable keys, adding, removing, or
reordering items in a larger, changing list can cause React to reuse the wrong DOM
element for the wrong data, occasionally producing UI that shows stale content next
to the wrong label — a bug class that's hard to spot until a list actually changes
shape in production.

Use an *uncontrolled* `<select>` (no `value` prop, only `onChange`) while also
programmatically changing `selectedExampleId` from somewhere else in the code (not
written in this lesson, but a realistic future addition — a "reset" button, say):
the dropdown's visible selection and React's own state variable would silently
drift apart, because nothing forces the DOM element back to match `value` — this is
exactly what "controlled" prevents, by making React the single, enforced source of
truth for what the `<select>` shows.

---

## Definition of Done

- [ ] `STARTER_EXAMPLES` exists as a typed `StarterExample[]`, with `'my-gist'`
      pointing at a real gist ID you created and can show someone else working
- [ ] A controlled `<select>` renders both options via `.map()`, with a correct
      `key`, and switching between them changes which gist DartPad loads
- [ ] You can explain the execution trace of `reduce` well enough to predict its
      output for a different starting array without running it
- [ ] You can explain the difference between `gistId?: string` (optional field) and
      `gistId: string | null` (required field, possibly null) — and why this lesson
      chose the second one
- [ ] You can explain what makes a `<select>` "controlled," and what would visibly
      go wrong if `onChange` were removed while `value` stayed
- [ ] `_scratch/fruit-stand.ts` is deleted
- [ ] `git commit` explaining why: for example, "Add a typed starter-example
      dropdown to Flutter Playground, including a real user-owned gist — proves the
      gist-loading mechanism end to end instead of only ever showing DartPad's
      built-in default"

# React Calculator — Lesson 03 — Props: Making Button Reusable

## What You Will Build

Ten number buttons, `0` through `9`, all built from **one** `Button`
component instead of ten separate, copy-pasted blocks of JSX. Clicking them
still does nothing — lesson 06 wires that up. This lesson is entirely about
a single question: how does one component show ten different things?

---

## What You Need to Know First

Lesson 02 — a `Keypad` component rendering a few hardcoded `<button>`
elements directly. This lesson replaces that hardcoding.

---

## Step 1 — Name the Problem With the Current `Keypad`

**The problem:** `Keypad.tsx` currently has three `<button>` elements, each
written out by hand:

```tsx
<button>7</button>
<button>8</button>
<button>9</button>
```

A real keypad needs at least sixteen buttons (ten digits, four operators,
`=`, and clear). Copy-pasting `<button>...</button>` sixteen times and
changing one character each time is the exact kind of repetition a
component is supposed to eliminate — and the moment a button needs *real*
behavior in lesson 06 (an `onClick`), every single copy would need the
identical change made to it sixteen separate times.

---

## Step 2 — Create `Button.tsx` With a Prop

In the **JavaScript** tab, click **+ New** and create `Button.tsx`:

```tsx
interface ButtonProps {
  label: string;
}

function Button({ label }: ButtonProps) {
  return <button className="calc-button">{label}</button>;
}
```

**Walkthrough — `ButtonProps`, and why it's an `interface`.** This project
already established its own convention, in the TypeScript Spreadsheet
project: `interface` names the shape of an object with more than one
field. `ButtonProps` currently has exactly one (`label`), but every
component in this project that accepts configuration will define an
interface named `<ComponentName>Props` for it — a consistent naming
pattern, not a rule React itself enforces, that makes every component's
file instantly tell you what it needs just by reading its top few lines.

**Walkthrough — `{ label }: ButtonProps`, your first destructured
parameter.** Every component function receives exactly **one** argument:
a single object holding every prop passed to it. `Button({ label }:
ButtonProps)` immediately **destructures** that object — pulling the
`label` field out into its own local variable named `label`, instead of
writing `props.label` every time it's needed. Written without
destructuring, this is identical:

```typescript
function Button(props: ButtonProps) {
  return <button className="calc-button">{props.label}</button>;
}
```

Both versions do exactly the same thing. Destructuring in the parameter
list is the convention this project uses from here on, because most
components in this project only ever need one or two specific props, and
naming them directly in the signature makes a component's real dependency
list visible without reading its body.

**Walkthrough — `{label}` inside the JSX.** Curly braces inside JSX are a
new piece of syntax: anywhere JSX expects a child or an attribute value,
`{ }` lets you drop back into plain JavaScript and insert the result of any
expression. `{label}` evaluates the variable `label` and inserts its
current value as text. This is different from `className="calc-button"` —
a plain quoted string is JSX's shorthand for a literal string value; `{ }`
is required the moment the value is anything other than a literal string
(a variable, a number, a function call, an expression). Both are used
constantly from here on: quotes for literal text, curly braces for
anything computed.

**SE lens — why one object argument, not `Button(label)`.** React could
have designed components to take positional arguments, the way
`columnLetter(col: number)` did in the TypeScript Spreadsheet project. It
deliberately didn't. A single props object means: the order attributes
appear in JSX never matters (`<Button label="7" />` and any other
attributes you add later can be written in any order), and adding a second
prop later never requires updating every existing call site's argument
order — only the interface, and only the call sites that actually need the
new prop.

---

## Step 3 — Use `Button` for Every Digit

Replace `Keypad.tsx`'s contents:

```tsx
function Keypad() {
  return (
    <div className="keypad">
      <Button label="7" />
      <Button label="8" />
      <Button label="9" />
      <Button label="4" />
      <Button label="5" />
      <Button label="6" />
      <Button label="1" />
      <Button label="2" />
      <Button label="3" />
      <Button label="0" />
    </div>
  );
}
```

Click **▶ Preview**. Ten number buttons appear, laid out in the order
they're written.

**Walkthrough.** `<Button label="7" />` calls `Button({ label: "7" })`.
JSX's attribute syntax, `label="7"`, is how a prop is passed — visually
identical to an HTML attribute, but this one is a real JavaScript function
argument underneath, not a browser-native attribute the way `class` or
`id` are.

**CS lens — this is parameterization, the same idea as a function
argument, applied to UI.** `columnLetter(col: number)` in the TypeScript
Spreadsheet project let one function produce six different letters from
one number. `Button({ label })` lets one component produce ten different
buttons from one string. Same principle — one piece of logic, many
outputs, driven entirely by what's passed in — applied to markup instead
of a return value.

**Forward connection.** Ten separate, nearly-identical `<Button label="..." />`
lines is itself a form of repetition — a smaller one than before, but
still real. Lesson 04 removes it entirely, generating this exact same
output from a plain array of labels.

---

## Connect the Pieces

```
Button.tsx   ButtonProps — the prop contract for Button
             Button({ label }) — one component, driven entirely by its
             label prop
Keypad.tsx   ten <Button label="..." /> calls — the one component reused
             ten times with ten different values
```

---

## What Breaks Without This

**Calling `<Button />` with no `label` prop at all:** Monaco flags it
immediately, before you even click ▶ Preview — a red squiggly line under
`<Button />` reading "Property 'label' is missing." `ButtonProps` declared
`label: string` as required (not `label?: string`), so TypeScript refuses
to accept a call site that doesn't provide it. This is exactly the same
protection `Coordinate` gave the TypeScript Spreadsheet project in its own
lesson 01 — a missing or misspelled field is caught before the page ever
loads, not discovered later as a blank button in the browser.

**Passing a number instead of a string, `<Button label={7} />`:** Also
flagged by Monaco — `ButtonProps` requires a `string`, and `7` (inside
curly braces, so it's a real number, not text) is a `number`. This is a
deliberate, small design choice worth noticing: every digit is passed as
the *string* `"7"`, not the *number* `7`, because a button's label is
always displayed as text — nothing about it is ever added or multiplied.
The digits your calculator actually computes with won't come from these
props at all; they'll come from what the user clicks, handled starting in
lesson 06.

---

## Definition of Done

- [ ] `Button.tsx` exists with a `ButtonProps` interface and a destructured `label` prop
- [ ] `Keypad` renders ten digit buttons, all built from `<Button />`
- [ ] ▶ Preview shows all ten buttons with correct labels
- [ ] You can explain what destructuring a parameter does, and why it's written that way here
- [ ] You can explain why `label` is typed as `string`, not `number`

---

*Next: Lesson 04 — Rendering the Keypad From Data. Ten near-identical lines
of JSX become one array and one `.map()` call.*

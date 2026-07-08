# React Calculator — Lesson 21 — Forms: A Formula Editor

## What You Will Build

A real form: two text fields and a "Save Formula" button. Type a name
like "Area of Circle" and an expression like `3.14159×5×5`, click Save,
and it appears in a running list below — the start of the Formula
Library.

---

## What You Need to Know First

Lesson 20 — a working calculator with digits, operators, memory, and
scientific functions, all driven by `dispatch` and hooks.

---

## Step 1 — A Controlled Form

Create `FormulaEditor.tsx`:

```tsx
interface FormulaEditorProps {
  onSave: (name: string, expression: string) => void;
}

function FormulaEditor({ onSave }: FormulaEditorProps) {
  const [name, setName] = React.useState("");
  const [expression, setExpression] = React.useState("");

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    if (name.trim() === "" || expression.trim() === "") return;
    onSave(name, expression);
    setName("");
    setExpression("");
  }

  return (
    <form className="formula-editor" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Formula name (e.g. Area of Circle)"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        type="text"
        placeholder="Expression (e.g. 3.14159×5×5)"
        value={expression}
        onChange={(event) => setExpression(event.target.value)}
      />
      <button type="submit">Save Formula</button>
    </form>
  );
}
```

**Walkthrough — `<form>` and `onSubmit`, browser behavior used for the
first time in this project.** `<form>` is an HTML element with real,
built-in browser behavior: submitting one (clicking a `type="submit"`
button inside it, or pressing Enter in one of its text fields) tells the
browser to **navigate** — by default, reloading the current page and
sending the form's data as part of that new request, exactly the way
submitting a search box or a login form works on an ordinary website.
`onSubmit={handleSubmit}` registers a function to run when that submit
event fires, *before* the browser's default navigation happens.

**Walkthrough — `event.preventDefault()`, and why it's the very first
line.** Calling `preventDefault()` on the event tells the browser "don't
do your default behavior for this event" — here, specifically, "don't
reload the page." Without it, clicking "Save Formula" would trigger a
full page navigation the instant the browser processes the submit, wiping
out this entire running React application (its whole in-memory state,
including every prior calculation) and replacing it with a freshly
reloaded, blank page. This project has no server to actually navigate
*to* — the reload would just show the same page again, empty, having
silently destroyed everything that was on screen. `preventDefault()` is
what makes a `<form>` usable as a piece of a single-page application
instead of a classic full-page-reload web form.

**Walkthrough — `value={name}` and `onChange`, a controlled input.**
Every keystroke in the name field fires `onChange`, which calls
`setName(event.target.value)` — `event.target` is the actual `<input>`
DOM element the event happened on, and `.value` is its current text,
including the character that was just typed. This is a **controlled
input**: the text box's displayed value is driven entirely by React state
(`value={name}`), not by the browser's own internal memory of what was
typed. The data flow is the same one-way flow every piece of state in this
project has used since lesson 06 — user action, `setState` call,
re-render, new value displayed — applied to a text field instead of a
button click. The alternative, an **uncontrolled** input (no `value` prop,
reading the DOM directly only when needed, usually through a `ref`), is a
legitimate approach elsewhere, but a controlled input is what lets this
project validate, clear, or react to the name and expression as they're
typed, not just once, at the end.

**Walkthrough — the validation guard, and clearing after save.**
`name.trim() === "" || expression.trim() === ""` refuses to save a
formula with a blank name or expression, silently ignoring the submit
rather than saving something meaningless. `.trim()` removes leading and
trailing whitespace first, so a name of just spaces is correctly treated
as empty too. After a successful save, `setName("")` and
`setExpression("")` reset both fields — a real, expected behavior of a
"submit and add another" form, confirmed the moment you see the fields go
blank after clicking Save.

**Walkthrough — `React.FormEvent`, a generic event type.** `handleSubmit`'s
parameter, `event: React.FormEvent`, is itself a generic type (lesson 08
named generics precisely) describing the object React hands every form-
submission handler: which real DOM element the event happened on, methods
like `preventDefault()`, and — for more specific event types this project
hasn't needed yet, like `React.ChangeEvent<HTMLInputElement>` for
`onChange` above — exactly which properties are available depends on
*which* kind of event occurred, encoded directly in the type. This is the
same idea `KeypadProps`' `onDigit: (digit: string) => void` used in lesson
06 (a function's type says exactly what it needs and returns), applied to
the specific shape of data a browser event carries.

**Connect to the real world — "two-way data binding," a term from other
frameworks, and why React deliberately doesn't work that way.** Frameworks
like Angular and Vue offer **two-way data binding** as a built-in feature:
bind an input directly to a variable, and the framework automatically
keeps both in sync in both directions — the variable updates the input,
and the input updates the variable, without the developer writing an
explicit handler for either direction. React deliberately chose not to
offer this: `value={name}` and `onChange={(event) => setName(...)}` are
two separate, explicit steps, precisely so the *exact* path data takes is
always visible in the code, never implicit framework magic. This is a real
design philosophy difference, not an oversight — the cost is a little more
boilerplate per input; the benefit is that reading `FormulaEditor`'s code
alone tells you, completely, everything that happens when a keystroke
occurs, with nothing happening invisibly on the framework's behalf.

**CS lens — a controlled form is a tiny, real state machine.** Lesson 18
defined a state machine as a fixed set of states with rules for moving
between them. This form has two meaningful states — "empty, ready for
input" and "has content, ready to submit" — and the transitions between
them are exactly `onChange` (moves toward "has content") and a successful
submit (moves back to "empty"). Recognizing a controlled form this way is
what makes `FormulaEditor`'s behavior predictable: at every instant, its
displayed values are a pure function of its own `name`/`expression`
state — never anything the DOM is independently remembering on its own —
the identical `(state) → UI` shape lesson 01 defined for every component
in this project, applied here specifically to form fields.

---

## Step 2 — Store Saved Formulas and Render Them

In `Calculator.tsx`, add state for the list and a save handler:

```tsx
interface SavedFormula {
  id: string;
  name: string;
  expression: string;
}

const [formulas, setFormulas] = React.useState<SavedFormula[]>([]);

function handleSaveFormula(name: string, expression: string): void {
  const formula: SavedFormula = { id: Date.now().toString(), name, expression };
  setFormulas([...formulas, formula]);
}
```

Render the editor and a read-only list beneath it:

```tsx
<FormulaEditor onSave={handleSaveFormula} />
<ul className="formula-list">
  {formulas.map((formula) => (
    <li key={formula.id}>
      {formula.name}: {formula.expression}
    </li>
  ))}
</ul>
```

Click **▶ Preview**. Save "Area of Circle" with expression
`3.14159×5×5`. It appears in the list below. Save a second formula — both
appear, in the order saved.

**Walkthrough — `Date.now().toString()` as an id, and its real limit.**
`Date.now()` returns the current time in milliseconds since a fixed
reference point — a real, always-increasing number, different on almost
every call. Using it as an id is simple and good enough for this project,
where formulas are saved one distinct button click at a time. **Honest
limit:** two formulas saved within the same millisecond (only realistically
possible from code, not a real click) would collide and receive the same
id — a known, narrow edge case being named rather than hidden, not a
defect being fixed here, since it can't happen through this project's
actual UI.

**`[...formulas, formula]`, the same immutable array pattern lesson 04
used for `.map()`.** A new array is created containing every existing
formula plus the new one at the end — `formulas` itself is never mutated.
`key={formula.id}` in the `.map()` below is exactly as load-bearing as
lesson 04 predicted it would eventually become: lesson 22 adds deleting a
formula from the middle of this list, the precise situation where a
stable, real id (not an array index) is the difference between deleting
the right item and silently corrupting the wrong one's displayed state.

**Security — naming the threat, even though this project is already
safe.** `formula.name` and `formula.expression` are text a user typed
themselves, now being redisplayed on the page — the textbook shape of a
risk called **XSS (Cross-Site Scripting)**: if user-provided text were
inserted into the page *as HTML* rather than as plain text, someone could
type something like `<img src=x onerror="/* malicious code */">` as a
"formula name," and the browser would parse and run it. This project
never does that: `{formula.name}` inside JSX inserts the value as
**plain text**, always — React escapes it automatically, character for
character, no matter what it contains. The dangerous alternative,
`dangerouslySetInnerHTML`, exists in React specifically as an opt-in,
loudly-named escape hatch for the rare case where raw HTML genuinely needs
to be inserted — this project never uses it, and that absence is the
actual safeguard, not an accident.

---

## Connect the Pieces

```
FormulaEditor.tsx   a controlled form; validates, saves, and clears itself
Calculator.tsx      formulas: SavedFormula[] — the list, appended to
                    immutably; a read-only rendering, for now
```

---

## What Breaks Without This

**Omitting `event.preventDefault()`:** clicking "Save Formula" reloads the
page. Every calculation, every memory value, every previously saved
formula this session — all of it, gone, replaced by a fresh, empty load of
the same page. This is not a hypothetical; it is the literal, default
behavior of every `<form>` element on the web unless told otherwise.

**Giving `<input>` a `value` prop with no `onChange` handler:** React logs
a real console warning — "You provided a `value` prop to a form field
without an `onChange` handler" — and the field becomes impossible to type
into at all. A controlled input's displayed value comes entirely from
state; without `onChange` updating that state, every keystroke is
immediately overridden back to whatever `value` already was, one render
later, faster than it's visible.

---

## Definition of Done

- [ ] Saving a formula with a name and expression adds it to the visible list
- [ ] Submitting with the browser's default behavior does not reload the page
- [ ] Saving with an empty name or expression is correctly ignored
- [ ] You can explain what a controlled input is and how its value prop and onChange work together
- [ ] You can explain the XSS threat this project avoids, and specifically how JSX's `{ }` avoids it
- [ ] You can explain what two-way data binding is and why React requires an explicit `onChange` instead

---

*Next: Lesson 22 — Lists, Editing, Deleting. Saved formulas can be removed
and renamed — real CRUD, over the array this lesson started.*

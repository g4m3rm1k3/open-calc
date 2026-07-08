# React Calculator — Lesson 22 — Lists, Editing, Deleting

## What You Will Build

Real CRUD over the Formula Library: every saved formula gets an Edit
button and a Delete button. Editing loads a formula back into the form
above; saving again updates it in place instead of adding a duplicate.
Deleting removes exactly the one formula clicked, correctly, no matter how
many others exist.

---

## What You Need to Know First

Lesson 21 — `FormulaEditor`, a controlled form, and `formulas: SavedFormula[]`
in `Calculator`, appended to on save.

**CRUD, spelled out, since this lesson builds three-quarters of it.**
**CRUD** is an acronym for the four operations almost any real data-backed
feature needs: **C**reate (lesson 21 already built this — saving a new
formula), **R**ead (already built too — rendering the list), **U**pdate
(this lesson's editing), and **D**elete (this lesson's deleting). Naming
it now is useful beyond vocabulary: recognizing "this feature needs CRUD"
early tells you, immediately, that all four operations need designing
together, consistently, rather than discovering partway through that
Update was never actually planned for.

**`SavedFormula`, a record, and why it needs an `id` at all.** `{ id,
name, expression }` is a **record**: a fixed set of named fields describing
one real, meaningful thing this project's domain actually has — a saved
formula — as opposed to `digitLabels`, an array of interchangeable,
identical-in-kind strings. Structuring domain data this way, as records
with named fields rather than loose, separately-tracked variables, is
called **domain modeling** — deliberately shaping your types to mirror the
real things your program manages. The `id` field specifically exists to
answer one question precisely: **identity** — "is this the *same* formula
as before, or merely one that currently looks the same?" Two formulas
could easily share a `name` (nothing stops two people naming a formula
"Area") or even a `name` *and* `expression` — `id`, generated fresh at
creation and never reused, is what lets this project always tell them
apart, no matter how similar their visible content becomes.

---

## Step 1 — Track Which Formula Is Being Edited

In `Calculator.tsx`:

```tsx
const [editingId, setEditingId] = React.useState<string | null>(null);
const editingFormula = formulas.find((formula) => formula.id === editingId) ?? null;
```

**Walkthrough — `.find()`, a new array method.** `Array.prototype.find`
scans an array and returns the *first* element for which the given
function returns `true`, or `undefined` if none match. `formulas.find(
(formula) => formula.id === editingId)` looks up the one formula currently
being edited by its id — the same "search by a stable id, not by
position" instinct `key` has represented since lesson 04. `?? null`
converts a possible `undefined` (nothing currently being edited, or the
id somehow doesn't match anything) into an explicit `null`, matching the
type this project already uses everywhere else for "intentionally
nothing" (`result: string | null` since lesson 14).

---

## Step 2 — Let `FormulaEditor` Start Pre-Filled

Update `FormulaEditor.tsx` to accept optional starting values:

```tsx
interface FormulaEditorProps {
  onSave: (name: string, expression: string) => void;
  initialName?: string;
  initialExpression?: string;
}

function FormulaEditor({ onSave, initialName = "", initialExpression = "" }: FormulaEditorProps) {
  const [name, setName] = React.useState(initialName);
  const [expression, setExpression] = React.useState(initialExpression);

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    if (name.trim() === "" || expression.trim() === "") return;
    onSave(name, expression);
    setName("");
    setExpression("");
  }

  return (
    <form className="formula-editor" onSubmit={handleSubmit}>
      <input type="text" placeholder="Formula name" value={name} onChange={(event) => setName(event.target.value)} />
      <input type="text" placeholder="Expression" value={expression} onChange={(event) => setExpression(event.target.value)} />
      <button type="submit">Save Formula</button>
    </form>
  );
}
```

**Walkthrough — `initialName?: string` and the `= ""` default.** The `?`
marks both props optional — `<FormulaEditor onSave={...} />` alone, with
neither prop, is valid. `= ""` in the destructured parameter supplies a
fallback whenever the caller genuinely omits the prop (as opposed to
passing an explicit empty string, which would look identical here but
means something slightly different conceptually — "no starting value was
given" versus "the starting value is blank").

**A real problem, worth hitting before it's explained away.** `useState(initialName)`
only ever uses `initialName` on this component's *very first* render — if
this exact `FormulaEditor` instance stays mounted and `initialName` changes
later (switching from editing one formula to editing a different one, for
instance), the text fields will **not** update to match. `useState`'s
argument is a true one-time seed, not a value it keeps re-reading.

---

## Step 3 — Force a Fresh Instance With `key`

Back in `Calculator.tsx`:

```tsx
<FormulaEditor
  key={editingId ?? "new"}
  onSave={handleSaveFormula}
  initialName={editingFormula?.name ?? ""}
  initialExpression={editingFormula?.expression ?? ""}
/>
```

**Walkthrough — `key`, used for something other than a list, for the
first time.** Lesson 04 introduced `key` as a hint React uses to match up
items across renders of a `.map()`. `key` actually does something more
general than that: whenever a component's `key` **changes** between
renders, React treats it as a genuinely different component — fully
unmounting the old instance (discarding all of its state) and mounting a
brand new one, `useState` calls and all, running fresh with whatever props
it was just given. `key={editingId ?? "new"}` exploits this precisely:
switching from editing one formula (`key="17203..."`) to a different one,
or back to adding a new formula (`key="new"`), is a different `key` each
time, so React discards the old, stale `FormulaEditor` and mounts a new
one that correctly starts from the current `initialName`/`initialExpression`.
This is the exact same mechanism CodePanel.tsx (the tool you've been using
this entire project) uses to reset its own editor when switching between
files of different languages — not a special trick invented for this
lesson, a real, general property of how `key` works.

---

## Step 4 — Update, Delete, and Wire the Buttons

```tsx
function handleSaveFormula(name: string, expression: string): void {
  if (editingId === null) {
    const formula: SavedFormula = { id: Date.now().toString(), name, expression };
    setFormulas([...formulas, formula]);
  } else {
    setFormulas(formulas.map((formula) => (formula.id === editingId ? { ...formula, name, expression } : formula)));
    setEditingId(null);
  }
}

function handleDeleteFormula(id: string): void {
  setFormulas(formulas.filter((formula) => formula.id !== id));
  if (editingId === id) setEditingId(null);
}
```

```tsx
<ul className="formula-list">
  {formulas.map((formula) => (
    <li key={formula.id}>
      {formula.name}: {formula.expression}
      <button onClick={() => setEditingId(formula.id)}>Edit</button>
      <button onClick={() => handleDeleteFormula(formula.id)}>Delete</button>
    </li>
  ))}
</ul>
```

Click **▶ Preview**. Save two formulas. Click Edit on the first, change
its expression, save — it updates in place, still first in the list.
Click Delete on the second — only it disappears.

**Walkthrough — `.map()` used to update one item, a different shape than
lesson 04's.** `formulas.map((formula) => (formula.id === editingId ? {
...formula, name, expression } : formula))` visits every formula and
returns either a **changed copy** of the one being edited (`{ ...formula,
name, expression }` — every existing field, with `name` and `expression`
overridden) or the **exact same object**, unchanged, for every other
formula. The result is a new array, same length, with exactly one entry
different — an update, expressed as "build a new list where one item
differs," never as "reach into the array and change a value in place."

**Walkthrough — `.filter()`, a new array method, deleting by exclusion.**
`Array.prototype.filter` returns a new array containing only the elements
for which the given function returns `true`. `formulas.filter((formula) =>
formula.id !== id)` keeps every formula *except* the one matching `id` —
deletion, expressed as "keep everything that isn't this," rather than
"find this item's position and remove it." Both `.map()` for updating and
`.filter()` for deleting share the same instinct as `[...formulas,
formula]` for adding, back in lesson 21: never mutate the existing array,
always produce a new one.

**CS lens — `handleDeleteFormula` is idempotent, a real property worth
naming precisely.** An operation is **idempotent** when doing it more than
once has the exact same effect as doing it exactly once. Calling
`handleDeleteFormula("17203...")` a second time, after the formula with
that id is already gone, does nothing new: `.filter()` simply keeps every
formula that isn't a match, and if none match, the "new" array is just an
identical copy of the old one. Contrast this with `handleSaveFormula`'s
create branch — calling it twice with the same name and expression
genuinely creates *two* separate formulas, since each call generates a
fresh `id` — creation is **not** idempotent here, by design. Recognizing
which operations in a system are idempotent matters beyond trivia: it's
exactly the property that makes an operation safe to retry blindly (a
double-click, a network request resent after a timeout) without worrying
about corrupting anything — a real, common concern in production code that
this lesson's delete button happens to satisfy for free.

**Connect to the real world — this project deliberately skips a
confirmation dialog before deleting, worth naming as a real, honest scope
cut.** `handleDeleteFormula` runs immediately on click, with no "Are you
sure?" step in between — a real, common UX pattern for destructive actions
that this project chooses not to build here, to keep the lesson focused on
CRUD mechanics rather than dialog UI. HTML Lab itself, the tool this
lesson is being completed inside, uses exactly this kind of confirmation
step for its own destructive actions (resetting a project) via a real
`ConfirmDialog` component — worth opening as a reference if this project
ever gets extended to add the same safeguard here.

**CS lens — this is why `key` had to be a real, stable id, and not the
array index, all along.** Lesson 04 flagged index-as-key as risky the
moment a list could reorder or change length — this is that moment,
arrived. Deleting the *first* formula shifts every remaining formula's
*index* down by one. If `key` had ever been the array index instead of
`formula.id`, React would have matched the *new* first item's index (`0`)
to whatever internal state the *old* first item's row held — visually,
the wrong formula's row could appear to "survive" the deletion instead of
the one actually still in the array. A real, stable id sidesteps this
completely, because deleting an item removes *that id* from the list —
nothing else's identity shifts at all.

---

## Connect the Pieces

```
FormulaEditor.tsx   initialName/initialExpression — optional starting
                    values; a fresh key from Calculator forces a true
                    reset when switching what's being edited
Calculator.tsx      editingId — which formula (if any) is being edited
                    handleSaveFormula() — branches on editingId to add
                    or update; handleDeleteFormula() — filters by id
```

---

## What Breaks Without This

Already demonstrated conceptually above: using the formula's array index
as `key` instead of `formula.id` would make deleting a formula from the
middle of the list risk showing stale, mismatched data on the rows that
shift position afterward — a real, subtle class of bug, not a
hypothetical one, and the exact reason lesson 04 insisted on a stable id
from the very first list this project ever rendered.

---

## Definition of Done

- [ ] Editing a formula loads its current values into the form above
- [ ] Saving while editing updates that formula in place, without creating a duplicate
- [ ] Deleting a formula removes only that one, correctly, regardless of its position
- [ ] You can explain why changing `key` forces a component to fully remount
- [ ] You can explain the difference between how `.map()` updates one item and how `.filter()` removes one
- [ ] You can explain what idempotent means and why delete is idempotent here but create is not

---

*Next: Lesson 23 — Persisting Formulas. Reload the page — every saved
formula survives, via `useEffect` and `localStorage`.*

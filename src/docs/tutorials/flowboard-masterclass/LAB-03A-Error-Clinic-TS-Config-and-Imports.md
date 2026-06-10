# FlowBoard Masterclass — LAB 03A — Error Clinic: TypeScript Config, Imports, and Props

**Prerequisites:** LAB-03 in progress (any step).

**What this lab adds:**
- A practical mental model for why TypeScript errors happen in this project
- Fix patterns for the most common errors in LAB-03
- A quick reference you can use while coding

**Time:** 25–35 minutes

---

## What You Will Build

No new UI feature. You will build a debugging workflow:
- You can read the error
- Identify whether it is a type rule, module rule, or React list/props rule
- Apply the smallest fix confidently

This is a support lab meant to be used while finishing LAB-03.

---

## Concept: Why This Project Is Stricter Than Typical Tutorials

**What it is:** Your project configuration enables strict module/type behavior in TypeScript. The key option is `verbatimModuleSyntax: true` in `tsconfig.app.json`.

**The problem before:** Many tutorials hide config details and show imports that "just work" in looser setups. In this project, those same imports can error.

**The solution:** Understand one rule first:
- If you import something used only as a type (like an interface), import it as a type.

**Project application:**
- `Card` is a runtime value (component function) -> normal import
- `CardData` is a type only (interface) -> type-only import

### Step 1 — Verify the Config Rule

Open `flowbard/tsconfig.app.json` and find:

```json
"verbatimModuleSyntax": true
```

### SAVE AND TRY

In your own words, say what this means:
- Type imports must be explicit
- TypeScript should not rewrite import style behind your back

If you can explain that, move on.

---

## Concept: Value Import vs Type Import

**What it is:**
- Value import: something that exists at runtime (component, function, const)
- Type import: something erased before runtime (interface, type alias)

**The problem before:**

```tsx
import Card, { CardData } from './Card';
```

With strict module syntax, importing `CardData` as a value causes a type import error because `CardData` is not a runtime value.

**The solution:**

```tsx
import Card from './Card';
import type { CardData } from './Card';
```

### Step 2 — Apply and Observe

In `flowbard/src/App.tsx`, use the two-line import pattern above.

### SAVE AND TRY

You should see:
- The type import error disappears
- No visual UI change

Change something:
- Temporarily merge back to one line `import Card, { CardData } from './Card';`
- Save and observe the error reappear
- Restore the type-only import

---

## Concept: Export Styles in the Same File

**What it is:** One file can export both:
- A default export
- Named exports

**The pattern in this project:**

```tsx
export interface CardData {
  id: string;
  title: string;
  label: string;
}

function Card(props: CardData) {
  // ...
}

export default Card;
```

**Why it matters:**
- `Card` (default export) imported without braces
- `CardData` (named export) imported with braces and as type-only

### Step 3 — Confirm Import Pairing

In `App.tsx`, make sure these pairings are true:
- `Card` import without braces
- `CardData` import with braces and `import type`

### SAVE AND TRY

Try these controlled mistakes and fix them:
1. Add braces around `Card` in import -> observe error -> revert
2. Remove braces from `CardData` import -> observe error -> revert

---

## Concept: Props Contract Errors Are Good Errors

**What it is:** Once `Card` accepts typed props, TypeScript enforces the contract everywhere `Card` is used.

**Common error shape:**
- Missing required prop
- Wrong prop type
- Unknown prop name typo

### Step 4 — Trigger Contract Errors on Purpose

Use one card call in `App.tsx`:

```tsx
<Card id="1" title="Fix the login bug" label="Bug" />
```

Now test each case one by one:
1. Remove `title` -> observe missing prop error -> restore
2. Set `title={42}` -> observe type mismatch -> restore
3. Add `tittle="typo"` -> observe unknown prop error -> remove

### SAVE AND TRY

You should now be able to look at a props error and classify it instantly:
- missing field
- wrong type
- wrong name

---

## Concept: List Rendering Errors (`map` and `key`)

**What it is:** When rendering from an array, React expects stable identity for each rendered child using `key`.

**The problem before:**
- `.map(...)` without `key`
- Using array index as key for reorderable data

**The solution pattern:**

```tsx
{cards.map((card) => (
  <Card key={card.id} id={card.id} title={card.title} label={card.label} />
))}
```

### Step 5 — Validate Key Behavior

Temporarily remove `key={card.id}` from your map.

### SAVE AND TRY

You should see a React warning in console about missing key.

Restore `key={card.id}` and confirm warning is gone.

---

## Quick Reference — Error to Fix Pattern

| Error symptom | Root cause | Fix pattern |
|---|---|---|
| "must be imported using a type-only import" | strict module syntax + interface imported as value | split import and use `import type` |
| "Property X is missing" | required prop not passed | pass the missing prop |
| "Type number is not assignable to type string" | wrong prop type | pass correct type |
| "Object literal may only specify known properties" | typo prop name | fix spelling to declared prop name |
| React warning: unique key | list item rendered without `key` | use stable ID key, e.g. `key={card.id}` |

---

## Final Check

- You can explain why `CardData` needs `import type`
- You can identify default vs named export usage without guessing
- You can intentionally trigger and then fix one props error
- You can intentionally trigger and then fix a missing `key` warning
- You can classify each error as config/module, type contract, or list rendering

---

## Quick Check Answers

1. Why did the type import error happen?  
Because `CardData` is an interface (type-only) and strict module syntax requires explicit type-only imports.

2. Why can one file export both `Card` and `CardData`?  
Because default and named exports are different mechanisms and can coexist in the same module.

3. Why is a props error useful?  
It catches data contract mismatches before runtime, preventing hidden UI bugs.

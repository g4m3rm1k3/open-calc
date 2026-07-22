# Concept: JavaScript/TypeScript Destructuring

**What you'll understand by the end:** how to pull individual values out of an array or object directly into named variables in one step, including directly inside a function's parameter list.

**Prerequisites:** none.

## Setup

Any JavaScript or TypeScript runtime — no install needed.

## The Problem

Extracting several individual values out of an array or object one at a time (`const first = pair[0]; const second = pair[1];`, or `const x = point.x; const y = point.y;`) is real, repetitive scaffolding around what is conceptually a single step: "give me these specific pieces, by these names."

## The Isolated Example

```javascript
// Array destructuring
const pair = [10, "ten"];
const [num, word] = pair;
console.log(num, word);

// Object destructuring
const point = { x: 1, y: 2, z: 3 };
const { x, y } = point;
console.log(x, y);

// Destructuring directly in a function parameter
function describe({ x, y }) {
    return `(${x}, ${y})`;
}
console.log(describe(point));
```

**Real output:**
```
10 ten
1 2
(1, 2)
```

**What this proves:** all three forms extracted exactly the named pieces requested, in one step each, without any of them needing an intermediate `point.x`/`point.y` or `pair[0]`/`pair[1]` reference written out anywhere.

## Mechanical Walkthrough

- `const [num, word] = pair;` — **array destructuring**: matches by *position* — `num` gets `pair[0]`, `word` gets `pair[1]`, regardless of what those elements are actually named or represent; this is exactly the mechanism `react-usestate-hook.md`'s `const [count, setCount] = useState(0)` relies on, since `useState` returns a plain two-element array.
- `const { x, y } = point;` — **object destructuring**: matches by *name* — `x` and `y` are pulled out because the object has properties with those exact names; `point.z` is simply left alone, ignored, not an error.
- `function describe({ x, y }) { ... }` — the identical object-destructuring syntax, applied directly to a function's parameter instead of a separate `const` statement — the function receives one object argument, and immediately unpacks the fields it needs, without ever binding a name to the whole object at all (there is no `props`/`point` variable inside `describe`, only `x` and `y` directly).
- Both forms support renaming (`const { x: xPos } = point;` binds the value of `point.x` to a new local name `xPos`) and default values (`const { w = 0 } = point;` binds `w` to `0` since `point.w` doesn't exist) — real, common refinements beyond the basic form shown above.

## CS Lens

Destructuring is **pattern matching** applied to assignment — the left-hand side of `=` describes the *shape* of what's expected on the right, and the language extracts pieces from any actual value matching that shape. This is a lightweight, single-purpose instance of a much more general and powerful feature in languages built around pattern matching (Haskell, Rust, OCaml), where matching can additionally branch on which shape a value actually has, not just extract from an assumed one.

Also recognized in: Python's own tuple unpacking (`x, y = pair` — see `python-tuple-unpacking.md`), which serves array destructuring's identical role for Python's own sequence types, though Python has no direct object/dict equivalent built into assignment syntax the way JavaScript does.

## SE Lens

Destructuring directly in a function's parameter list (as `describe({ x, y })` does) is a real, common readability choice: it documents, right in the function's own signature, exactly which fields of the incoming object that function actually uses — a reader never has to scan the whole function body to discover whether `point.z` matters here (it doesn't; it isn't even named). The tradeoff: a function with many parameters destructured this way can make its signature harder to skim at a glance than a few, clearly-named, non-destructured parameters would — worth weighing against the documentation benefit above once a destructured shape grows large.

## Connection

Used throughout `react-usestate-hook.md` (array destructuring on `useState`'s return) and `react-component-props.md` (object destructuring directly in a component's parameter list, exactly as `describe({ x, y })` demonstrates here).

## Try It Yourself

1. Destructure only the *second* element of an array, skipping the first (`const [, second] = pair;`), and confirm the leading comma correctly leaves a gap for the skipped position.
2. Combine destructuring with a default value for a property that doesn't exist on the object (`const { w = 99 } = point;`) and confirm `w` is `99`, while confirming `x`/`y`, which *do* exist, ignore their own defaults entirely if given one.
3. Write a function accepting a parameter shaped `{ name, age = 0 }`, and call it once with both fields present and once with only `name` — confirming the default applies correctly only when a field is genuinely missing from the passed object.

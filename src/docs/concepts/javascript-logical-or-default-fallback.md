# Concept: `||` as a Default-Value Fallback

**What you'll understand by the end:** how to use JavaScript's logical OR to supply a fallback value when something might be missing or zero, and the real gotcha it carries with legitimately falsy values.

**Prerequisites:** none.

## Setup

Any JavaScript or TypeScript runtime — no install needed.

## The Problem

A value — a function argument, a DOM property, a config field — sometimes isn't there, or is `0`, `""`, or `null`, and code needs a reasonable default to fall back on in that case, without writing a full `if` statement every time.

## The Isolated Example

```javascript
function describe(width) {
    const effectiveWidth = width || 700;
    return `using width ${effectiveWidth}`;
}

console.log(describe(300));
console.log(describe(0));
console.log(describe(undefined));
```

**Real output:**
```
using width 300
using width 700
using width 700
```

**What this proves:** `width || 700` supplied `300` unchanged when it was a genuine, meaningful nonzero value, but replaced *both* `0` and `undefined` with `700` — `||` cannot tell the difference between "this value is legitimately zero" and "this value is missing," which is the real, important limit of this pattern.

## Mechanical Walkthrough

- `a || b` evaluates `a`; if `a` is **truthy**, the whole expression's value is `a`, and `b` is never even evaluated (this is called **short-circuit evaluation**). If `a` is **falsy**, the expression's value is `b` instead.
- JavaScript's falsy values are exactly: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, and `NaN` — every other value, including `"0"` (a string) and `[]` (an empty array), is truthy.
- `width || 700` therefore reads as "use `width`, unless it's falsy, in which case use `700`" — correct and intended when `width` being `0` genuinely should be treated the same as it being missing (a browser element with zero rendered width, in this pattern's real motivating case, isn't usefully different from one that hasn't rendered at all yet), but a real bug source whenever `0` (or `""`) is a legitimate, meaningful value that shouldn't be silently replaced.

## CS Lens

This exploits JavaScript's **short-circuit boolean evaluation** combined with **implicit truthiness coercion** — the operator doesn't return a boolean here at all, it returns whichever *operand* determined the result, a JavaScript-specific behavior (many other languages' logical operators only ever return `true`/`false`). This dual nature — a boolean operator usable as a value-selecting expression — is what makes the fallback idiom possible at all.

Also recognized in: Python's own `a or b` (near-identical short-circuit-and-return-operand behavior, with Python's own distinct set of falsy values), and shell scripting's `${VAR:-default}` parameter expansion (a different mechanism, the identical intent).

## SE Lens

The real, common bug this pattern causes: a counter, a valid array index, or an amount-of-money field that can legitimately be `0` gets silently replaced by a fallback default the moment it's actually zero — `count || 10` "helpfully" turns a real, correct zero into `10`. The fix, when zero (or empty string) must be preserved as a real value, is the **nullish coalescing operator** `??`, which only falls back on `null`/`undefined` specifically, leaving `0`/`""`/`false` untouched — a real, later refinement of this exact pattern, added to JavaScript specifically to close this gap.

## Connection

Commonly used to supply a default for a DOM measurement that might read as `0` before an element is attached to the visible page — a real, common pattern seen wherever a size or dimension is read from `threejs-renderer-scene-camera.md`'s container element before rendering begins.

## Try It Yourself

1. Rewrite `describe` using `??` instead of `||` (`const effectiveWidth = width ?? 700;`), and call it with `0` again — confirm this version preserves the real `0` instead of replacing it, and reason about which of the two operators is actually correct for a "width" value specifically (should a genuinely zero-width container fall back to `700`, or should `0` be trusted?).
2. Call the original `||`-based `describe` with `""` (an empty string) and confirm it also gets replaced by `700`, even though a string and a number are unrelated types — direct proof that falsiness, not type, is what `||` checks.
3. Chain three fallbacks together (`a || b || c || "final default"`) and reason through, for several different combinations of truthy/falsy `a`/`b`/`c`, which one actually gets returned — confirming `||` scans left to right and stops at the first truthy value.

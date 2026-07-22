# Concept: Default Parameter Values

**What you'll understand by the end:** how to give a function parameter a
fallback value that's used only when the caller genuinely omits that
argument, including when the parameter is a destructured property rather
than a plain name.

**Prerequisites:** `javascript-destructuring.md`.

## Setup

Plain JavaScript or TypeScript — no libraries needed.

## The Problem

A function with an optional piece of configuration — a list of extra
actions, a flag, a limit — needs *something* to work with even when a
caller doesn't provide it. Checking for that manually
(`const actions = providedActions || []`) as the first line of a
function body works, but it's a repeated, easy-to-forget pattern; the
parameter itself can carry that fallback instead, stated once, at the
point where the parameter is declared.

## The Isolated Example

```javascript
function RibbonToolbar({ groups, actions = [] }) {
  console.log("actions:", actions, "length:", actions.length);
}

RibbonToolbar({ groups: [] });
RibbonToolbar({ groups: [], actions: [{ id: "settings" }] });
```

**Real output, run this session:**
```
actions: [] length: 0
actions: [ { id: 'settings' } ] length: 1
```

**What this proves:** calling the function with no `actions` key at all
still produces a real, usable empty array (`.length` works — it's never
`undefined`), while providing `actions` explicitly overrides the default
entirely rather than merging with it.

## Mechanical Walkthrough

- `{ groups, actions = [] }` — **(b) reappearing** the destructuring
  syntax itself (`javascript-destructuring.md`) that pulls `groups` and
  `actions` out of the single object argument — **(a) first appearance**
  of the `= []` part specifically: a default value attached directly to a
  destructured property. It applies only when that property is
  `undefined` on the object passed in (missing entirely, or explicitly
  set to `undefined`) — not when it's any other falsy value like `null`
  or `0`.
- `RibbonToolbar({ groups: [] })` — **(c) already basic** — a function
  call with an object literal argument. `actions` is simply absent from
  this object, which is exactly the condition the default exists to
  handle.
- `RibbonToolbar({ groups: [], actions: [...] })` — **(c) already
  basic** — same call shape, this time supplying `actions` explicitly,
  which is used as-is instead of the default.

## CS Lens

This is the same idea as a function signature with an optional parameter
in any language — Python's `def f(x=[])` (already taught, in a different
language, in `python-default-parameter-values.md`), C++ default
arguments, named/optional parameters in Kotlin or Swift. The specific
detail that varies by language is *which* "absent" values trigger the
default (JavaScript: only `undefined`; Python: only "argument not
supplied at all," since Python has no implicit `undefined`) — the
underlying goal, a caller-optional value with a built-in fallback, is the
same everywhere it appears.

Also recognized in: REST API request bodies with optional fields and
server-side defaults, CLI flags with a documented default, database
columns with a `DEFAULT` clause.

## SE Lens

The real alternative — a manual fallback line inside the function body
(`actions = actions || []`) — is not just more verbose; it also runs
*every single call*, even when the caller always supplies the value,
whereas the parameter default is only ever evaluated on the calls that
actually need it. More importantly, stating the default at the parameter
means anyone reading the function's signature alone — without reading a
single line of its body — already knows this parameter is optional and
what it becomes when omitted. The real cost: a mutable default value
(an object or array, as here) is evaluated fresh on every call that needs
it in JavaScript specifically — a genuine, occasionally surprising
difference from languages where a mutable default is created *once* and
silently shared across calls (a well-known real footgun in Python, which
is exactly why `python-default-parameter-values.md` calls it out
separately for that language).

## Connection

Builds on `javascript-destructuring.md`. Used in this project's real code
in `RibbonToolbar`'s `actions` prop, so every existing caller that has no
actions to pass — which was every caller, before this feature — keeps
working with zero changes required at the call site.

## Try It Yourself

1. Call `RibbonToolbar({ groups: [], actions: undefined })` explicitly —
   confirm the default still applies, then call it with
   `actions: null` — confirm the default does *not* apply, and reason
   about why `actions.length` then throws a real error instead.
2. Add a second defaulted, destructured parameter (`activeIndex = 0`) to
   the same function, and confirm both defaults apply independently when
   neither is supplied.

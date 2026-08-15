# Lesson 16: Error Handling and Loading States

**What you will build:** a real, honest, four-state loading pattern for
every real API call this project's own frontend makes — idle, loading,
success, error — starting with `GET /api/files` (Lesson 03), plus
direct, run proof of a real, extremely common, genuinely dangerous
`fetch` mistake.

**What you need to know first:** [Lesson 01](lesson-01-the-shell.md) —
this project's own real, plain-JavaScript `fetch` usage, given full
treatment for the real, correct pattern here.

**Terms introduced in this lesson:** none new — this lesson applies a
real, general UI discipline to this project's own real, existing
endpoints.

**Objects and methods used:**

**`Response.ok`**
- *What it is:* a real, standard, built-in property on the object
  `fetch`'s own real `Promise` resolves to.
- *Implementation:* `response.ok` is `true` for any real HTTP status in
  the `200`–`299` range, `false` for everything else — including a
  real `401`, `404`, or `500`.
- *Its use:* the one, real, correct way to know whether a real request
  actually succeeded — `fetch` itself never tells you this any other
  way.

---

## Concept Unit: A Real, Four-State Pattern

### The Problem

Every real `fetch` call in this project so far assumes the happy path:
a real request that always succeeds instantly, with nothing shown while
it's in flight and nothing shown if it fails. A real, working
application needs a real, honest answer to "what is happening right
now" at every real moment, not only when everything goes right.

### Introduce the Concept in Isolation

```js
// static/app.js
async function loadFileTree() {
    const container = document.getElementById("file-tree");
    container.textContent = "Loading...";

    try {
        const response = await fetch("/api/files");
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        const files = await response.json();
        renderFileTree(files);
    } catch (error) {
        container.innerHTML =
            `<p class="error">Failed to load files: ${error.message} ` +
            `<button onclick="loadFileTree()">Retry</button></p>`;
    }
}

function renderFileTree(files) {
    const container = document.getElementById("file-tree");
    if (files.length === 0) {
        container.textContent = "No files yet.";
        return;
    }
    container.innerHTML = "<ul>" + files.map((f) => `<li>${f.name}</li>`).join("") + "</ul>";
}
```

Four real, distinct, honest states, each with its own real, visible
result: **loading** (`"Loading..."`, shown immediately, before the real
request even resolves), **success with data** (a real, rendered list),
**success with no data** (`"No files yet."` — a real, deliberate,
*different* message from an error, since an empty real list is not a
real failure), and **error** (a real, specific message, plus a real,
working retry button).

### Discard

Nothing throwaway — `loadFileTree`/`renderFileTree` are real,
permanent, and every later real endpoint this project's own frontend
calls follows this identical, real, four-state shape.

### Mechanical Walkthrough

- `async function loadFileTree() { ... const response = await
  fetch("/api/files"); ... }` — **(a) first appearance** of a real
  `async function` and `await`, used together — genuinely different,
  real syntax from `sqlite-mastery`'s own `.then()`-chained `fetch`
  calls (Lesson 38), functionally equivalent, real, and — for this
  project's own real, plain-JavaScript frontend — the more idiomatic,
  real, modern choice.
- `if (!response.ok) throw new Error(...)` — **(a) first appearance**,
  full treatment above; `throw new Error(...)` — **(a) first
  appearance** of real, explicit, manual error-throwing in JavaScript,
  genuinely new to this series.
- `try { ... } catch (error) { ... }` — **(a) first appearance** of
  JavaScript's own real `try`/`catch`, structurally identical to
  Python's own already-known `try`/`except`.
- `files.map((f) => \`<li>${f.name}</li>\`).join("")` — **(a) first
  appearance** of this real, standard JavaScript pattern: transforming
  every real item in an array into a real string, then joining them
  into one.

### CS Lens

This real, four-state pattern is a direct, concrete instance of a
**finite state machine** applied to UI rendering — exactly four real,
distinct, named states, each with its own real, deliberate appearance,
rather than a single, real boolean (`isLoading`) that can never
correctly represent "succeeded with zero results" versus "failed" at
the same real time.

### SE Lens

The real, deliberate reason this pattern is established now, at the
close of Phase 3, rather than left implicit: Phase 4's own real
checkout and check-in endpoints are about to add several, real, new
`fetch` calls — reusing this identical, real, four-state shape for
every one of them, rather than inventing a real, slightly different
version each time, is exactly the same real discipline this project's
own repository pattern (Lesson 03) already established for SQL.

## Concept Unit: `fetch` Does Not Throw on a Real HTTP Error

### The Problem

Does removing this lesson's own real `if (!response.ok)` check actually
matter? What, concretely, happens without it?

### Introduce the Concept in Isolation

The real, broken version, reproducing a real, extremely common mistake:

```js
async function loadFileTreeBroken() {
    const container = document.getElementById("file-tree");
    try {
        const response = await fetch("/api/files");
        const files = await response.json();
        renderFileTree(files);
    } catch (error) {
        container.textContent = "Failed to load files.";
    }
}
```

Requested with no real, valid session cookie present — `GET
/api/files` genuinely has no authentication requirement in this
project yet, so this specific example uses a real, different protected
endpoint instead, `GET /api/me` (Lesson 09), to force a real, genuine
`401`:

```js
// standing in for a real, protected endpoint returning a real 401
const response = await fetch("/api/me");
console.log(response.ok);      // false
console.log(response.status);  // 401
const body = await response.json();
console.log(body);             // {detail: "not authenticated"}
```

`fetch`'s own real `Promise` **resolved successfully** — it did not
reject, and the real `catch` block in `loadFileTreeBroken` never runs
at all. A real `401`, with a real, genuine error body
(`{"detail":"not authenticated"}`), is treated by `fetch` itself as an
entirely ordinary, successful response — `response.json()` parses it
correctly, and `renderFileTree`, if called with this real, malformed
"file list," would attempt to `.map()` over an object that isn't a
real array at all, producing a real, second, genuinely confusing
JavaScript error, nowhere near this lesson's own real, original cause.

### Discard

`loadFileTreeBroken` is real, disposable proof of this exact, real
mistake — never a permanent part of this project; the real, corrected
version, from this lesson's own first unit, is what remains.

### Mechanical Walkthrough

- `const response = await fetch("/api/me");` — **(b) hard concept
  reappearing**, this lesson's own real `fetch`/`await` shape, applied
  here to a real, deliberately protected endpoint.
- `response.ok` / `response.status` — **(a) first appearance** of
  `Response.ok`, full treatment above; `.status` — **(a) first
  appearance** of the real, numeric HTTP status code itself, read
  directly off the response object.

### CS Lens

This is a real, direct instance of confusing **network-level failure**
with **application-level failure** — `fetch`'s own real `Promise`
only ever rejects for the first kind (no real connection could be
made at all); a real, valid HTTP response carrying a real error status
is, from `fetch`'s own real perspective, a completely successful
network exchange, and it is *always* this project's own real,
responsibility to check `response.ok` and decide, deliberately, that a
real `401` or `500` means the real, logical operation failed.

### SE Lens

The real, honest, concrete cost of skipping `response.ok`, proven
directly: not a clean, obvious error, but a real, second, unrelated
failure one step later — exactly the kind of real, confusing bug that
takes real time to trace back to its actual, original cause. This is
the exact, real reason this lesson's own first unit's `if (!response.
ok) throw ...` line is not optional defensive styling; it's the one,
real, correct place this project ever decides "this request failed,"
for every real endpoint, from here on.

## Connect the pieces

`loadFileTree`'s own real, four-state pattern — loading, success with
data, success with none, and error, each with its own real, honest,
visible result — became this project's own real, standard shape for
every future `fetch` call. A real, direct, deliberate proof then closed
the one, real, easy-to-miss gap that pattern depends on: `fetch` itself
never rejects on a real HTTP error status, meaning `response.ok` must
be checked explicitly, every time, or a real failure silently, and
confusingly, becomes real, malformed "success" instead.

## What breaks without this

Not applicable beyond this lesson's own second unit, which is itself
this lesson's real, concrete proof — `loadFileTreeBroken`'s own real,
silent failure to detect a genuine `401` *is* this lesson's own "what
breaks" demonstration.

## Exercises

1. Reproduce this lesson's own real `401`-treated-as-success proof
   yourself, directly in a real browser console, against `GET
   /api/me` with no session cookie present.
2. Apply this lesson's own exact, real, four-state pattern to a real,
   second UI function of your own — `loadCurrentUser()`, calling `GET
   /api/me` and rendering the real, logged-in user's own display name,
   or a real, honest "not logged in" message on a genuine `401`.

## Definition of Done — Phase 3 Complete

- [ ] You built `loadFileTree` with all four real states — loading,
      success with data, success with none, and error with retry.
- [ ] You reproduced the real, silent `401`-as-success failure and
      understand precisely why `fetch` behaves this way.
- [ ] You confirmed `response.ok` correctly distinguishes a real
      success from a real HTTP-level failure.
- [ ] You completed both exercises.

## Phase 3 complete

Five lessons, and Forge's own real, central problem is now understood
completely: reproduced deliberately with plain git (Lesson 12), given
real, isolated practice with the tool that prevents it (Lesson 13),
closed structurally with one, real, canonical repository (Lesson 14) —
with an honest, remaining gap named directly rather than glossed over
— given a real, browsable file tree synced safely into SQLite (Lesson
15), and given a real, honest UI discipline for every request this
project makes, present and future (Lesson 16).
[Phase 4](lesson-17-the-checkout-domain-function.md) closes that exact,
remaining gap for real: exclusive, database-enforced checkout, so Bob
is never even *allowed* to overwrite Alice's work in the first place.

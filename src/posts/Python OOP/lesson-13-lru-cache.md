# Lesson 13: Not Redoing Work You've Already Done
### (Project 5 — Markdown Editor, JavaScript)

**What you will build.** A cache in front of `parseMarkdown`, so
identical text — from an undo, a redo, or simply retyping something
already seen — gets served instantly instead of re-parsed, followed by
a real, bounded **LRU cache**, so that cache can't just grow forever
across a long editing session. The transferable problems this lesson is
actually about: skipping work entirely instead of merely delaying it
(Lesson 12's job), and the real cost of "just cache everything" once
"everything" has no natural upper bound.

**What you need to know first.** Lesson 12 — `parseMarkdown`, and the
measured, proven cost of re-running it unnecessarily.

---

## Concept Unit: Caching Identical Work

### The Problem

Lesson 12's debounce fixed *how often* `parseMarkdown` runs during a
burst of typing — but it still runs fresh, every time, even when the
text is something already parsed a moment ago. Undo, redo, or simply
backspacing back to an earlier draft and retyping it verbatim all
produce text `parseMarkdown` has already, correctly, processed once
before — debounce doesn't help here at all, since each of those is its
own separate pause-then-render, not a rapid burst.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `memo_lab.js` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new; `Map`, part of JavaScript itself.

### The New Code

```javascript
function memoize(fn) {
  const cache = new Map();
  return function (arg) {
    if (cache.has(arg)) {
      return cache.get(arg);
    }
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```javascript
let calls = 0;
function square(n) {
  calls++;
  return n * n;
}

const memoSquare = memoize(square);
console.log(memoSquare(5));
console.log(memoSquare(5));
console.log(memoSquare(5));
console.log("underlying square() actually called:", calls, "times");
```

Real output:

```
25
25
25
underlying square() actually called: 1 times
```

Three calls to `memoSquare(5)`, three correct results — and the real
`square` function, proven by the counter, only ran **once**. The second
and third calls found `5` already sitting in `cache` and returned the
stored result directly, never touching `square` at all. This is called
**memoization**: caching a function's result, keyed by its input, so
the same input never triggers the real work twice.

### Discard the throwaway example

`square`/`memoSquare` are deleted — they only existed to prove a cached
function skips real work on a repeated input, isolated from
`parseMarkdown` entirely.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `cached_render.js`; modified
  `markdown.js` to expose a call counter for this lesson's own proof,
  the same technique Lesson 12 used for `renderCount`.
- **Change type** — add.
- **Location** — new file, alongside `markdown.js`.
- **Dependencies** — `markdown.js`, Lesson 12.

### The New Code

```javascript
const cache = new Map();

function renderCached(text) {
  if (cache.has(text)) {
    return cache.get(text);
  }
  const html = parseMarkdown(text);
  cache.set(text, html);
  return html;
}
```

### The Updated Project

Brand-new file, shown whole above — the exact shape of the isolated
`memoize` lab, applied directly rather than wrapped through a generic
helper, since `renderCached` only ever needs to cache one specific
function.

### Mechanical walkthrough

- `const cache = new Map();` — **(b) hard concept reappearing**, `Map`
  from the isolated lab.
- `if (cache.has(text)) { return cache.get(text); }` — **(b) hard
  concept reappearing**, the exact check-then-return shape from
  `memoize`.
- `const html = parseMarkdown(text); cache.set(text, html); return
  html;` — **(b) hard concept reappearing**, the same fall-through path.

### CS lens

This is **memoization**, applied directly — the previous unit's lens
already covers it in full; nothing new to add here beyond the
application itself.

### SE lens

Using `text` — the raw, potentially long Markdown string — directly as
the cache key works here because JavaScript's `Map` compares string
keys by their actual content, not by reference identity; two separate
string values that happen to contain the same characters are treated as
the same key. That's worth stating plainly rather than assuming: if the
cache were keyed by some other kind of value — a plain object, say —
two objects with identical *contents* would still count as two
*different* keys, since objects are compared by reference by default.
Text happens to be exactly the right kind of value for this to just
work.

### Commands needed

None new.

### Run it

```javascript
console.log(renderCached("# Lesson 13"));
console.log(renderCached("# Lesson 13 draft"));
console.log(renderCached("# Lesson 13"));       // undo back to the first state
console.log(renderCached("# Lesson 13 draft")); // redo back to the second

console.log("parseMarkdown was actually called", getParseCallCount(), "times for 4 renders");
```

Real output:

```
<h1>Lesson 13</h1>
<h1>Lesson 13 draft</h1>
<h1>Lesson 13</h1>
<h1>Lesson 13 draft</h1>
parseMarkdown was actually called 2 times for 4 renders
```

Four renders, all correct — and only **2** real calls to
`parseMarkdown`, exactly matching the two genuinely distinct texts
involved; the simulated undo and redo were both served from `cache`
without re-parsing anything.

### Connecting sentence

Identical text no longer gets re-parsed — what's still unaddressed is
*how long* this cache is allowed to keep growing, which the next unit
takes seriously instead of ignoring.

---

## Concept Unit: A Cache Needs a Limit

### The Problem

`cache` in the previous unit is a plain `Map` with no size limit at
all. Over the course of a long editing session — hundreds or thousands
of distinct intermediate states, every pause during typing potentially
adding a new entry — it would grow without bound, holding onto every
piece of text ever typed, most of which will never be revisited again.
That's a real memory leak, growing quietly, with no crash to announce
it — the same *kind* of honest, easy-to-miss problem Lesson 11 named
for a missing `preventDefault()`, here showing up as silently expanding
memory instead of a silently broken interaction.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `map_order_lab.js` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```javascript
const map = new Map();
map.set("a", 1);
map.set("b", 2);
map.set("c", 3);

console.log([...map.keys()]);

map.delete("a");
map.set("a", 1);

console.log([...map.keys()]);
console.log("oldest key now:", map.keys().next().value);
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

Real output:

```
[ 'a', 'b', 'c' ]
[ 'b', 'c', 'a' ]
oldest key now: b
```

`a`, `b`, `c` were added in that order, and `[...map.keys()]` confirms a
JavaScript `Map` genuinely **remembers insertion order** — not
guaranteed for a plain `{}` object, but guaranteed for `Map`. Deleting
`"a"` and immediately re-inserting it moved it to the *end* of that
order — `b` is now the oldest entry, even though nothing about `a`'s
*value* changed, only when it was last touched. This delete-then-reinsert
trick is the mechanism the next unit's real cache uses to track which
entry has gone the longest without being used.

### Discard the throwaway example

`map` above is deleted — it only existed to prove `Map`'s insertion-
order guarantee and the delete-then-reinsert trick, isolated from
caching entirely.

### CS lens

A cache with no limit isn't really a cache — it's just an
ever-growing store that happens to also serve as one. A genuine cache
needs an **eviction policy**: a rule for what to remove once it's full.
**Least Recently Used (LRU)** — evict whichever entry hasn't been
accessed in the longest time — is one of the most common such policies,
built on the reasonable assumption that something used recently is more
likely to be needed again soon than something untouched for a while.
Also recognized in: a CPU's own memory cache, a database's buffer pool,
a browser's disk cache for recently visited pages, Python's own
`functools.lru_cache` decorator — this exact algorithm, built into the
standard library this curriculum's Phase 1 already used.

### SE lens

The alternative to any eviction policy at all — this lesson's previous
unit — trades unbounded memory growth for perfect cache accuracy (every
text ever seen stays cached forever). LRU accepts a real cost —
sometimes evicting something that, unpredictably, does get needed again
right after being evicted, forcing a real re-parse — in exchange for a
hard guarantee on how much memory the cache can ever consume, regardless
of session length. That guarantee is the entire point.

### Commands needed

None new.

### Run it

Shown above.

### Connecting sentence

`Map`'s insertion-order guarantee, plus the delete-and-reinsert trick,
is exactly enough machinery to build a real, bounded LRU cache — the
next unit does exactly that.

---

## Concept Unit: A Real LRU Cache

### The Problem

The previous two units proved the two pieces separately: caching avoids
redundant work, and `Map`'s ordering can track recency. Neither alone is
a complete answer — a cache with no size limit still leaks memory; a
size limit with no recency tracking would have to evict *something*
arbitrary, possibly the very entry about to be needed again. Both
pieces need to work together, in one real, reusable structure.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `lru_cache.js`; modified
  `cached_render.js`.
- **Change type** — add; replace the plain `Map` with `LRUCache`.
- **Location** — new file; `renderCached`'s `cache` variable.
- **Dependencies** — none new.

### The New Code

```javascript
class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.maxSize) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
    this.map.set(key, value);
  }
}
```

### The Updated Project

Brand-new file, shown whole above. `renderCached` changes from:

```javascript
const cache = new Map();

function renderCached(text) {
  if (cache.has(text)) {
    return cache.get(text);
  }
  const html = parseMarkdown(text);
  cache.set(text, html);
  return html;
}
```

to:

```javascript
const cache = new LRUCache(3);                        // ← changed

function renderCached(text) {
  const cached = cache.get(text);                       // ← changed
  if (cached !== undefined) {                             // ← changed
    return cached;
  }
  const html = parseMarkdown(text);
  cache.set(text, html);
  return html;
}
```

`renderCached`'s own logic barely changed — swapping `Map` for
`LRUCache` and `.has()`/`.get()` for a single `.get()` that returns
`undefined` on a miss — because `LRUCache` was deliberately built to
present the same basic shape as `Map`, echoing Project 3, Lesson 9's
Adapter: a new implementation, wrapped to fit the interface already
being used.

### Introduce the concept in isolation

No separate lab needed — every piece inside `LRUCache` was proven
individually in this lesson's first two units: `Map`'s `has`/`get`/`set`
from the memoization unit, and the delete-then-reinsert recency trick
from this unit's own second unit. `LRUCache` is exactly those two
proven pieces, combined, shown directly in the real code.

### Discard the throwaway example

Not applicable.

### Mechanical walkthrough

- `constructor(maxSize) { this.maxSize = maxSize; this.map = new
  Map(); }` — **(c) already basic**, storing a configuration value and
  starting with an empty `Map`.
- `get(key) { if (!this.map.has(key)) return undefined; ... }` — **(b)
  hard concept reappearing**, `Map.has`/`Map.get` from the memoization
  unit.
- `this.map.delete(key); this.map.set(key, value);` inside `get` — **(b)
  hard concept reappearing**: the exact delete-then-reinsert trick from
  the isolated `Map` order lab — reading an entry now *also* marks it as
  most-recently-used, which is precisely why `get` exists as a method
  here rather than plain `Map.get` being used directly: a cache hit has
  to be recorded as recent use, not just returned silently.
- `if (this.map.has(key)) { this.map.delete(key); }` inside `set` —
  **(a) first appearance** of this specific case: updating an
  *existing* key's value still needs the delete-then-reinsert treatment,
  or it would keep its old position in the order despite being touched
  just now.
- `else if (this.map.size >= this.maxSize) { const oldestKey =
  this.map.keys().next().value; this.map.delete(oldestKey); }` — **(a)
  first appearance** of the actual eviction: only runs when adding a
  genuinely *new* key would push the cache over its limit;
  `this.map.keys().next().value` reads the very first key in insertion
  order — proven, by this lesson's second unit, to always be the least
  recently used one — and removes it before the new entry is added.
- `this.map.set(key, value);` — **(c) already basic**, the actual
  write, happening after any needed eviction.

### CS lens

`LRUCache` is a complete, working instance of the pattern named in the
previous unit — a bounded cache with a real eviction policy. Nothing
further to add beyond what's already been named; this unit is the
synthesis, not a new idea.

### SE lens

The `LRUCache(3)` chosen for this lesson's demo is deliberately small,
to make eviction observable within a few calls — a real editor would
likely size this much larger, tuned against how much memory is
reasonable to spend versus how often genuinely old text tends to get
revisited. That's a real tuning decision with no universally correct
answer, the same honest shape as Lesson 12's debounce delay: too small
and the cache barely helps; too large and it approaches the previous
unit's unbounded-growth problem again, just with a very long runway
before it matters.

### Commands needed

None new.

### Run it

```javascript
renderCached("# Draft 1");
renderCached("# Draft 2");
renderCached("# Draft 3");
console.log("cache size after 3 unique renders:", cache.map.size);

renderCached("# Draft 1"); // touch draft 1, keep it "fresh"
renderCached("# Draft 4"); // pushes cache over capacity 3

console.log("cache now holds:", [...cache.map.keys()]);
console.log("parseMarkdown actually called:", getParseCallCount(), "times");

renderCached("# Draft 1"); // still cached
console.log("parseMarkdown calls after that:", getParseCallCount());

renderCached("# Draft 2"); // evicted
console.log("parseMarkdown calls after that:", getParseCallCount());
```

Real output:

```
cache size after 3 unique renders: 3
cache now holds: [ '# Draft 3', '# Draft 1', '# Draft 4' ]
parseMarkdown actually called: 4 times
parseMarkdown calls after that: 4
parseMarkdown calls after that: 5
```

Exactly the behavior LRU promises, proven step by step: after three
unique renders, the cache holds all three. Touching `"# Draft 1"` again
marks it recently used; adding a fourth, `"# Draft 4"`, pushes the
cache over capacity — and `"# Draft 2"`, the one entry nobody touched
again, is the one gone, confirmed by `"# Draft 3"` and `"# Draft 1"`
both surviving in the final key list. Re-requesting `"# Draft 1"`
afterward costs nothing (`parseMarkdown` call count stays at 4);
re-requesting the evicted `"# Draft 2"` costs a real re-parse (the count
rises to 5) — the exact, deliberate cost this lesson's second unit
named as the honest tradeoff for a hard memory bound.

### Connecting sentence

Every idea in this lesson now lives in one small, reusable class:
caching to skip redundant work, and a genuine, provable limit on how
much that cache is allowed to cost.

---

## Closing

**Connect the pieces.** One piece of text, through the whole lesson:
`renderCached("# Draft 1")` first checks `cache.get("# Draft 1")`, which
returns `undefined` — nothing cached yet — so `parseMarkdown` genuinely
runs, and the result is stored via `cache.set(...)`, landing at the
*newest* position in the underlying `Map`'s order. Later,
`renderCached("# Draft 1")` again finds it via `cache.get(...)`, which
— because `get` itself deletes and reinserts on a hit — moves it back
to the newest position again, protecting it from eviction even though
time has passed and other entries have been added since. When the cache
does overflow, `set`'s own logic reads the genuinely oldest key directly
from `Map`'s own remembered order and removes exactly that one — the
same mechanism, `get` and `set` both leaning on one guarantee `Map`
provides for free.

**What breaks without this.** Comment out the two lines inside `get`
that do the delete-then-reinsert (`this.map.delete(key);
this.map.set(key, value);`), leaving `get` as a plain `return
this.map.get(key);`. Re-run this lesson's own demo: `"# Draft 1"` gets
*read* via `get` right before `"# Draft 4"` is added, but without those
two lines, reading it no longer marks it as recently used — it stays
sitting at its old position in the `Map`'s order. The result: `"# Draft
1"`, despite being the most recently *touched* entry, would be the one
evicted instead of `"# Draft 2"` — a real, silent correctness bug, the
cache evicting the wrong thing while still running without a single
error anywhere, exactly the kind of failure this curriculum keeps
insisting gets named and demonstrated rather than glossed over.

**Exercises.**
1. Reproduce the broken scenario above for real: comment out the two
   lines described, rerun the demo, and confirm — with real printed
   output — that `"# Draft 1"` gets evicted instead of `"# Draft 2"`.
   Restore the fix afterward.
2. Add a `size()` method to `LRUCache` and a `pytest`-style test (using
   Node's own assertions, or a JS test runner if you set one up) proving
   an `LRUCache(2)` never exceeds size 2, no matter how many `.set()`
   calls it receives.
3. `LRUCache` currently has no way to tell a caller *how many* cache
   hits versus real parses have happened over a session — add hit/miss
   counters to the class itself, replacing this lesson's own
   `getParseCallCount()` workaround with something the cache tracks
   directly.

**Definition of done.**
- [ ] `renderCached` correctly serves repeated identical text from
      cache, confirmed by a real parse-call counter showing fewer real
      parses than renders.
- [ ] `LRUCache` correctly bounds itself to `maxSize`, confirmed by
      real output showing the exact least-recently-used entry evicted,
      not an arbitrary one.
- [ ] You've reproduced the broken-recency-tracking bug for real,
      confirmed the wrong entry gets evicted, and restored the fix.
- [ ] You can explain, in one sentence, why `Map`'s insertion-order
      guarantee — not just "a `Map` can store key-value pairs" — is the
      specific property this whole cache depends on.
- [ ] Commit with a message explaining why — e.g. `"Cache parsed
      Markdown to skip redundant reparses, bounded by a real LRU
      eviction policy instead of growing without limit"` — not `"add
      caching"`.

**This closes Project 5.** Across Lessons 12–13: regex-based parsing,
debounce and throttle proven side by side rather than assumed
interchangeable, and a from-scratch LRU cache built entirely from one
`Map` guarantee and one deliberate trick. **Project 6** moves to a Chat
Client — real networking, this time from the browser's side — where
`fetch` and WebSockets bring genuine asynchronous, multi-party
communication into this curriculum for the first time, and Project 3's
own REST API, built back in Phase 1, gets called from the other end of
the wire it was originally built to serve.

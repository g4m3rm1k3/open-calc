# Phase Transition: Python → JavaScript
### What carries over, what's genuinely new, and what's ahead

Nine lessons, three projects, one language. Before Lesson 10 starts
Project 4 in JavaScript, it's worth being explicit about what actually
changes at a language boundary like this one — because most of what
Phase 1 taught isn't Python-specific at all, and pretending otherwise
would mean re-teaching things that don't need re-teaching, which is
exactly the kind of padding this curriculum has been avoiding since
Lesson 1.

---

## What carries over completely

These aren't going to get re-explained. When they show up in JavaScript
code, later lessons will name them and move on, the same way "hard
concept reappearing" items have been handled since Lesson 1 — a real
restatement where the language's version differs, silence where it
doesn't.

- **Objects bundling data and behavior** (Lesson 1). A JS `class` looks
  almost identical to Python's — `constructor` instead of `__init__`,
  otherwise the shape is the same idea.
- **Collections and iteration** (Lesson 2). JS arrays are Python lists
  by another name; `for...of` is a `for` loop over an iterable.
- **Converting between objects and plain data for storage** (Lesson 2).
  JSON isn't a Python library there — it's JavaScript's native data
  format, `JSON.stringify`/`JSON.parse` instead of `json.dumps`/`json.loads`.
- **Functions as values** (Lesson 3, Strategy). This transfers directly
  and gets *more* central, not less — JavaScript leans on passing
  functions around even more heavily than Python does, especially once
  event handling starts in Project 4.
- **Dispatch tables over `if`/`elif` chains** (Lesson 3, and Lesson 8's
  routing). The exact same idea, same justification.
- **Automated testing** (Lesson 4). The *tool* changes (this curriculum
  will use a JS test runner instead of `pytest`), the *reasoning* for
  using one at all does not.
- **Encapsulating an action as an object** (Command, Lesson 5) and
  **decoupling "something happened" from "who's listening"** (Observer,
  Lesson 7). Both ideas are about to become directly relevant to
  JavaScript's own core model — more on that below.
- **Naming a real, honest limitation instead of hiding it** — linear
  search's cost (Lesson 6), the Adapter/`find_by_id` gap (Lesson 9).
  That habit isn't language-specific either; it'll keep showing up.

If a lesson from here on spends time re-explaining any of the above from
scratch, that's a sign something's gone wrong — flag it.

---

## What's genuinely new about JavaScript as a language

### The browser is the runtime, not just an interpreter

Every Python lesson so far ran as `python3 file.py` — one program,
start to finish, in one process you controlled completely. JavaScript,
in this curriculum's next three projects, mostly runs *inside a browser
tab*, which already has an entire object model waiting
(`document`, `window`), a rendering engine repainting the screen, and — critically —
things happening in response to a person clicking around, not in a
predictable top-to-bottom order a script controls. Project 4 (Browser
Kanban) is where this actually lands.

### `this` does not work like `self`

In Python, `self` is bound automatically, permanently, the moment a
method is called on an instance — Lesson 1 covered this, and it never
once broke down across nine lessons. In JavaScript, `this` is decided
by *how a function is called*, not by where it was defined — and it can
break in ways that look like nothing went wrong at the call site. Real
proof, not an assertion:

```javascript
class Counter {
  constructor() {
    this.count = 0;
  }

  increment() {
    this.count = this.count + 1;
    console.log(this.count);
  }
}

const counter = new Counter();
counter.increment();          // called normally
counter.increment();

const loose = counter.increment;
loose();                      // called detached from the object
```

Real output:

```
1
2
TypeError: Cannot read properties of undefined (reading 'count')
    at increment (this_demo.js:7:23)
```

The first two calls work exactly like Python's `self` would predict.
The third one — calling the *exact same function*, just reached through
a plain variable instead of `counter.increment(...)` — crashes, because
`this` inside `increment` is decided fresh at call time, and calling it
as `loose()` gives it no object to bind to at all. This isn't a rare
edge case: it's *precisely* what happens when a method gets handed
directly to something like `addEventListener` as a callback, which
Project 4 will do constantly. This gets a real Concept Unit, with a
real throwaway lab, the first time it actually matters — it's previewed
here so the crash isn't a surprise divorced from any explanation when it
first shows up in project code.

### Prototypes underneath, `class` on top

Python's `class` is the real mechanism. JavaScript's `class` keyword,
by contrast, is a relatively modern layer of syntax sitting on top of an
older mechanism — **prototypal inheritance** — that still shows through
in places. This won't matter for most of Phase 2's project code, which
will mostly use `class` the way Python code uses `class`, but the first
time it surfaces (likely once Phase 2 needs to explain why some
JavaScript idioms look stranger than a Python-shaped mental model would
predict), it'll get its own unit rather than being hand-waved.

### Asynchronous by default, not by choice

Every Python lesson so far ran synchronously, one line finishing before
the next started, because nothing in these projects needed anything
else. JavaScript's browser environment makes waiting for *something* —
a network request, a timer, a user click — the normal case, not a
special one, and the language has real, first-class syntax for it
(callbacks, then `Promise`s, then `async`/`await`). This shows up
directly once Project 4 needs to react to clicks and Project 6 (Chat
Client) needs real network communication over WebSockets — it's a
genuinely new *shape* of program, not just new syntax, and it'll be
taught as such, with its own Concept Units, not folded quietly into
whatever lesson happens to need it first.

### Dynamic typing, familiar from Python, with different edges

JavaScript is dynamically typed, the same as Python — nothing new about
*that* framing. What's different: JavaScript's automatic type coercion
in comparisons and arithmetic (`"5" + 3` behaves differently from `"5" - 3`,
for reasons worth actually seeing run rather than memorizing) is a real,
distinct source of bugs Python's own dynamic typing doesn't share in the
same way. This gets a real throwaway lab the first time project code
actually depends on getting it right, not before.

---

## What's ahead: Observer, recognized in the wild

Project 2, Lesson 7 built the Observer pattern entirely by hand:
`TaskList.observers`, `add_observer`, `notify`, calling `on_event` on
every registered listener. That was necessary work in Python, because
Python's standard library has no built-in concept of "broadcast an
event to whoever's listening" baked into the language itself.

JavaScript's browser environment does. `element.addEventListener("click",
handler)` *is* Observer — the browser is the subject, `element` is being
observed, `handler` is the observer function, and `addEventListener` is
`TaskList.add_observer` under a different name, already built, already
battle-tested, and already sitting there waiting to be used the first
time Project 4 needs a button to do something when clicked. This is the
first real "oh — I've already learned this" moment the project map
promised, and it'll be called out explicitly, by name, the first time it
happens — not as a footnote, but as the actual point of the lesson it
shows up in.

---

## What's ahead: the projects themselves

- **Project 4 — Browser Kanban.** DOM manipulation, event listeners
  (Observer, recognized), and the `this`-binding gotcha previewed above,
  landing for real. Likely DSA: trees, once nested board structure
  matters.
- **Project 5 — Markdown Editor.** Parsing user input as it's typed,
  which is where **debouncing** and **throttling** earn their place —
  two DSA/timing techniques with no real equivalent in anything built
  so far, because nothing so far reacted to input arriving faster than
  it could reasonably be processed.
- **Project 6 — Chat Client.** Real networking — WebSockets — and
  `fetch` for HTTP requests from the browser side, which will call back
  directly to Project 3's REST API, this time from the *client's*
  perspective instead of the server's.

Same engineering instincts as Phase 1 — a pattern or a data structure
earns its place because the project's problem needs it, not because a
syllabus scheduled it. Different language, same rule.

---

## One practical note on how these lessons will run

Phase 1 code ran with `python3 file.py`, output pasted directly from a
real run. Phase 2's non-DOM JavaScript (plain logic, data structures)
will run the same way, with real output, via `node file.js`. Lessons
that touch the DOM specifically will show two things: the real HTML/JS
you'll open in an actual browser to see it visually, *and* real,
verified output from running the same code in a lightweight in-memory
DOM (via a small Node-based tool) — so every "Run it" section still
means a real execution happened, not a description of what a browser
would probably do.

---

Ready for Lesson 10 — Project 4, Lesson 1 — whenever you are.

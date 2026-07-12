# Promises, async/await, and How This App Actually Syncs Data

Today we study **asynchronous code** — operations that take time (a network
request, reading a file, waiting on a timer) and how JavaScript lets the rest of
your program keep running while they finish, instead of freezing until they're
done. Our case study is real code: `src/context/AuthContext.jsx`'s
`pushToFirestore` and `syncOnSignIn` — the actual functions that save and restore
your progress across devices when you sign in.

---

## What You Need to Know First

Basic function calls and `useState` (Flutter Playground Lessons 1 and 3). Nothing
else is assumed — this lesson does not assume you've written asynchronous code in
any language before.

---

## The Lesson

### Step 1 — Why Synchronous Code Isn't Enough

Every function you've written in this curriculum so far is **synchronous**: call
it, and it runs to completion, top to bottom, before your code moves on to the next
line — `double(21)` returns `42` immediately; there's no waiting involved. A network
request to Firestore (this app's database) cannot work that way — it might take
50 milliseconds, or 2 seconds, or fail entirely, and **JavaScript is
single-threaded** (a term from `LESSON_CONTRACT.md`'s own performance section,
explained now if this is your first time meeting it): there is exactly one thread
running your code, ever, in a browser tab. If a function call literally paused
that single thread until a network request finished, the *entire page* — every
button, every animation, every keystroke — would freeze solid for however long the
request took. Nothing else in this app is even running the rest of the time; there's
no second thread quietly keeping the UI responsive.

### Step 2 — The `Promise`: A Placeholder for a Future Value

#### Concept lab: watching a promise resolve, with your own eyes, in order

Disposable — `src/labs/_scratch/promise-probe.ts` (no JSX, plain `.ts`).

```typescript
console.log('1: starting')

const futureValue = new Promise<string>(resolve => {
  setTimeout(() => resolve('the delayed value'), 1000)
})

console.log('2: promise created, but not resolved yet')

futureValue.then(value => {
  console.log('4: promise resolved with:', value)
})

console.log('3: this runs before the promise resolves')
```

**`new Promise<string>(resolve => { ... })`** — a `Promise` is an object
representing a value that doesn't exist *yet*, but will (or will fail to) at some
point in the future. `<string>` is a generic type argument (the same kind you met in
`useState<ViewMode>`) saying "when this eventually resolves, it will resolve with a
`string`." The function passed to `new Promise(...)` runs **immediately**, and
receives one argument — conventionally named `resolve` — which is itself a
function: calling `resolve(someValue)` is how you mark this specific promise as
successfully completed, carrying `someValue`.

**`setTimeout(() => resolve('the delayed value'), 1000)`** — `setTimeout`, met
briefly in the previous installment's `Ticker` example, here runs its callback once,
after 1000 milliseconds, calling `resolve('the delayed value')` — simulating "a slow
operation that eventually produces a real value," standing in for what would, in
real code, be a network request actually finishing.

**`futureValue.then(value => { ... })`** — `.then` registers a callback to run
**whenever** this promise eventually resolves — not now, not synchronously, but the
moment `resolve(...)` is actually called inside it, whenever that happens. The value
passed to `resolve` is exactly what `value` receives inside `.then`'s callback.

**Run this file's logic conceptually (or genuinely paste it into your browser's
console directly and watch) — expected output, and the order is the entire
point:**
```
1: starting
2: promise created, but not resolved yet
3: this runs before the promise resolves
(... about one second passes ...)
4: promise resolved with: the delayed value
```

**Line 3 printing before line 4 is not a mistake — it's the entire mechanism.**
`futureValue.then(...)` does not pause anything; it registers a callback and moves
on immediately, letting `console.log('3: ...')` run right away, exactly like every
other line of code so far. The `.then` callback only actually runs, later, once the
`setTimeout` inside the promise's executor calls `resolve`.

Delete `promise-probe.ts` now.

**CS lens:** This is the **event loop** — JavaScript's mechanism for handling
asynchronous work on a single thread: run synchronous code to completion, then, as
outstanding asynchronous operations complete (a timer firing, a network response
arriving), run their registered callbacks, one at a time, still on that same single
thread — never two callbacks truly simultaneously, but never blocking the whole
program on a slow one either.

**SE lens:** This is **non-blocking I/O** — the general term for exactly what Step
1 said was necessary: the program keeps running, keeps responding to clicks, keeps
animating, while slow operations happen "in the background" and are dealt with via
a callback once they're actually done, instead of freezing everything to wait.

**Recognition — this exact "register a callback, keep going, get called back
later" shape recurs in:** `addEventListener` itself (a click "resolves" whenever
the user actually clicks, and your handler runs then, not before), Node.js's entire
server model (handling thousands of simultaneous connections on one thread, exactly
this way), and GUI frameworks generally (a button's `onClick` is conceptually the
same "callback fires later" idea as `.then`).

---

### Step 3 — `async`/`await`: The Same Thing, Easier to Read

`.then(callback)` chains get hard to read once you need several sequential
asynchronous steps. `async`/`await` is **syntax sugar** — a different, cleaner way
to write the exact same underlying Promise mechanism, not a different mechanism.

#### Concept lab: the same promise, written with `await`

Disposable — `src/labs/_scratch/await-probe.ts`.

```typescript
function wait(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function demo() {
  console.log('1: starting')
  await wait(1000)
  console.log('2: this runs one second later, in the same function')
}

demo()
console.log('3: this runs before demo() finishes')
```

**`async function demo() { ... }`** — the `async` keyword marks a function as one
that can use `await` inside it, and, automatically, makes it always return a
`Promise` itself (even though nothing here explicitly constructs one — this is part
of what `async` does for you).

**`await wait(1000)`** — `await` can only appear inside an `async` function. It
takes a `Promise` and **pauses execution of this specific function** (not the whole
program, not any other function — the wider engine keeps running everything else
normally, exactly as `.then` didn't block anything either) until that promise
resolves, then continues to the next line with the resolved value available
directly, with no `.then` callback needed.

**Execution trace:**
```
demo() is called
  → "1: starting" prints
  → wait(1000) is called, returns a pending Promise
  → await pauses demo() here — control returns to whoever called demo()
"3: this runs before demo() finishes" prints  (demo() is paused, not finished)
(... about one second passes ...)
  → wait(1000)'s promise resolves
  → demo() resumes exactly where it paused
  → "2: this runs one second later..." prints
```

This produces **the exact same output order** as Step 2's `.then` version —
`1`, `3`, (pause), `2` — because it's the same underlying mechanism, written
differently. `await` reads top-to-bottom like synchronous code, but everything
about *when* things actually happen is identical to the explicit `.then` version.

Delete `await-probe.ts` now.

**CS lens:** `async`/`await` is **syntactic sugar over Promises** — the JavaScript
engine transforms `async function`s and `await` expressions into the equivalent
`.then`-chain machinery automatically; you're never choosing between "a
Promise-based approach" and "an async/await-based approach" as if they were
different systems — `await` always requires something that's a `Promise`
underneath.

**SE lens:** Readability at scale: a real sequence of several dependent
asynchronous steps (fetch a user, then fetch their data, then merge it, then save
it) reads as a flat, linear sequence of `await` lines with `async`/`await`, versus
a `.then(result => { ... .then(result2 => { ... }) })` pyramid that gets harder to
read with every additional step — the same underlying operations, a meaningfully
easier-to-maintain shape.

---

### Step 4 — Reading the Real Code: `AuthContext.jsx`

```javascript
async function pushToFirestore(uid) {
  if (IS_LOCAL_ENV) return
  const data = snapshotLocalStorage()
  if (Object.keys(data).length === 0) return
  const ref = doc(db, 'users', uid, 'appData', 'snapshot')
  await setDoc(ref, { ...data, _syncedAt: Date.now() }, { merge: true })
}
```

You can now read every piece of this precisely. `async function pushToFirestore(uid)`
— an async function, so it can `await` inside it, and it implicitly returns a
`Promise`. Two **guard clauses** at the top (the same pattern named in the
Context-from-scratch installment): `if (IS_LOCAL_ENV) return` skips the whole
function early during local development — the comment right there, `// never write
dev data to production`, states *why* directly, exactly the "comments explain
non-obvious decisions" rule from `LESSON_CONTRACT.md`'s Code Standards. `if
(Object.keys(data).length === 0) return` skips pointlessly writing an empty object
if there's genuinely nothing to sync yet.

`await setDoc(ref, { ...data, _syncedAt: Date.now() }, { merge: true })` —
`setDoc` is a real function from the Firestore SDK (a library, imported at the top
of this file, not shown here) that writes data to the database and returns a
`Promise` that resolves once the write genuinely completes (or **rejects** — a new
term, meaning "the promise failed instead of succeeding," covered in Step 5).
`await` here means: this function doesn't return (and doesn't implicitly resolve
its own returned `Promise`) until the actual database write has finished — a
caller awaiting `pushToFirestore(uid)` can trust that once it resolves, the data
genuinely made it to Firestore, not just "was requested."

```javascript
async function syncOnSignIn(uid) {
  // ...
  const ref = doc(db, 'users', uid, 'appData', 'snapshot')
  const snap = await getDoc(ref)
  const localTs = parseInt(localStorage.getItem(TS_KEY) ?? '0')

  if (snap.exists()) {
    const remote = snap.data()
    // ...
  }
}
```

`const snap = await getDoc(ref)` — `getDoc` fetches the current stored data and
returns a `Promise`; `await` pauses `syncOnSignIn` until that fetch genuinely
completes, and `snap` receives the actual result — a **document snapshot** object
(Firestore's own term), which is why the next lines call `.exists()` and `.data()`
*on* `snap`, rather than on some placeholder — by the time this line runs, the real
data has genuinely arrived.

---

### Step 5 — `try`/`catch`: What Happens When a Promise Fails

A `Promise` doesn't only ever succeed — it can **reject**: a network request that
fails, a database write that's denied, a timeout. `await`ing a rejected promise
**throws an error** at that exact `await` line, exactly like any other JavaScript
error — and it's caught the same way, with `try`/`catch`.

#### Concept lab: proving a rejection is a real, catchable throw

Disposable — `src/labs/_scratch/rejection-probe.ts`.

```typescript
function unreliableOperation(): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('the network request failed')), 500)
  })
}

async function demo() {
  try {
    const result = await unreliableOperation()
    console.log('success:', result)
  } catch (error) {
    console.log('caught a real error:', (error as Error).message)
  }
}

demo()
```

**`reject(new Error('the network request failed'))`** — the second function `new
Promise` hands you (alongside `resolve`): calling it marks the promise as failed,
carrying whatever value you pass — conventionally a real `Error` object, as here.

**`try { ... } catch (error) { ... }`** — wraps the `await` in a `try` block; if the
awaited promise rejects, control jumps immediately to `catch`, with `error` holding
whatever was passed to `reject`. Without the `try`/`catch`, a rejected `await` would
throw all the way out of `demo()` entirely, uncaught, exactly the way a
synchronous `throw` with no surrounding `try` would.

Run it (mentally trace it, or paste into a real environment). **Expected output**,
after half a second: `caught a real error: the network request failed`. Delete
`rejection-probe.ts` now.

**Look back at `syncOnSignIn` in the real file** and notice it has **no**
`try`/`catch` around its `await getDoc(ref)` call. This is worth naming honestly
rather than glossing over: if that fetch genuinely fails (no network, permission
denied), this function throws, uncaught, at that exact line — whatever called
`syncOnSignIn` needs its *own* `try`/`catch` around that call for this to fail
gracefully instead of crashing something. This is real, existing, debatable code —
not a mistake this lesson is pretending doesn't exist, and a legitimate thing to
flag if you were reviewing this file for the first time.

---

## Connect the Pieces

Every `await` you'll ever write is unwrapping a `Promise` — the exact same object
`.then` chains work with directly — and every `async function` implicitly returns
one. `AuthContext.jsx`'s real sync functions use this mechanism to talk to
Firestore without ever freezing the UI while a network request is in flight, the
same non-blocking guarantee Step 1 opened with, now traced through genuinely
running production code instead of a disposable timer simulation.

---

## What Breaks Without This

Remove `await` from in front of `setDoc(...)` in `pushToFirestore` (leave
everything else): the function returns **immediately**, before the write has
actually reached Firestore — any code that called `await pushToFirestore(uid)`
expecting the data to genuinely be saved by the time it resolves would be wrong; it
resolved, but the underlying write might still be in flight, or might still fail,
with nothing left to observe either outcome. This is a real, subtle class of bug —
"looks like it worked because nothing crashed" — precisely because a `Promise` that
isn't awaited doesn't block anything, which is normally the *feature*, and here
becomes the trap.

---

## Definition of Done

- [ ] You can, without looking back, explain why `console.log('3: ...')` prints
      before the delayed `.then`/`await` callback in both of Steps 2 and 3's traces
- [ ] You can explain what `async` does to a function's return value, even when
      nothing inside it explicitly constructs a `Promise`
- [ ] You reproduced Step 5's rejection-and-catch yourself and saw the caught error
      message, not just read about it
- [ ] You can point to the real `await getDoc(ref)` line in `AuthContext.jsx` and
      explain, honestly, what currently happens if it rejects
- [ ] All three `_scratch/*.ts` probes from this lesson are deleted
- [ ] `git commit` is **not** required — this lesson, like the useEffect/useRef
      installment, was entirely reading and tracing real existing code

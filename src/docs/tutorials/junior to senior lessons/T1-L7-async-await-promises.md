# Junior to Senior — T1·L7 — Async/Await and Promises

**Prerequisites:** T1·L6 (Validation and Error Accumulation). You can validate
data synchronously. This lesson covers how to handle operations that take time —
network requests, file I/O, timers — without blocking execution.

**What this lab adds:**
- What a Promise is and why it exists
- `async`/`await` — readable async code that looks synchronous
- `Promise.all` — parallel execution
- `Promise.allSettled` — parallel with partial failure handling
- Error handling in async code
- The event loop — a mental model for why async works

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `setTimeout(() => console.log('A'), 0); console.log('B')` — which prints
>    first? Why?
> 2. You `await` a function that throws. Where does the error go?
> 3. `Promise.all` vs `Promise.allSettled` — what happens to the others when
>    one promise fails?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

An async contact enrichment system that fetches additional data for each contact
from a simulated API:

```
$ npx ts-node async-contacts.ts

--- Sequential (slow) ---
Fetching Alice... done (120ms)
Fetching Bob...   done (80ms)
Fetching Carol... done (150ms)
Total: 350ms (sum of all waits)

--- Parallel (fast) ---
Fetching all contacts in parallel...
All done in 150ms (longest wait, not sum)

--- Partial Failure ---
Alice: enriched
Bob:   FAILED — API timeout
Carol: enriched

2 of 3 contacts enriched
```

---

### Concept: The Event Loop — Why Async Doesn't Block

**What it is:** JavaScript runs on a single thread. The event loop is the mechanism
that lets it handle multiple things apparently simultaneously — it checks a queue
of pending events and runs them when the main execution stack is empty.

**The problem before:**

Without async, waiting for I/O (a file read, a network request, a timer) means
nothing else can run. A web server handling 100 requests would process them
strictly one-at-a-time, each waiting for the previous to finish.

**The mechanism:**

```
Call stack         Event queue
──────────         ───────────
main()             (empty)
  fetch(url)  ─────────────────────────┐ (async: schedules network request)
  console.log('after fetch')           │ (runs immediately — fetch hasn't completed)
  ↩ returns                            │
(stack empty)                          │
                                       ↓
              network response arrives → response handler added to queue
                                       ↓
              event loop picks it up → handler runs → you get your data
```

**Canonical example:** The event loop is like a restaurant kitchen with one
chef. The chef takes an order (starts a network request), passes it to the
kitchen station (the OS handles the I/O), and immediately takes the next
order without waiting. When the food is ready (network responds), the waiter
signals the chef (event queue), and the chef plates it when free. Multiple
orders are in flight simultaneously even though one chef handles everything.

**You will see this again in:** Node.js server performance, React's rendering
batching, browser animation frames, any async operation. Understanding the event
loop is why `setTimeout(fn, 0)` is not instant (the function runs after the
current synchronous code finishes).

**Watch for:** CPU-intensive work (complex calculations, tight loops) blocks
the event loop — it is synchronous. `await` only helps with I/O-bound work.

---

### Concept: Promises — A Value That May Not Exist Yet

**What it is:** A `Promise<T>` is an object representing a future value of
type `T`. It is either *pending* (the operation is running), *fulfilled* (it
succeeded with a value), or *rejected* (it failed with an error).

**The problem before:**

Async code without Promises used *callbacks* — functions passed as arguments
that run when the operation completes:

```ts
// Callback hell — three nested async operations:
readFile('a.txt', (errA, dataA) => {
  if (errA) { handle(errA); return; }
  readFile('b.txt', (errB, dataB) => {
    if (errB) { handle(errB); return; }
    writeFile('c.txt', dataA + dataB, (errC) => {
      if (errC) { handle(errC); return; }
      console.log('done');
    });
  });
});
```

Each level of nesting is a callback. Error handling must be repeated at every level.

**The solution:**

```ts
// Promise chain — flat, readable:
readFile('a.txt')
  .then(dataA => readFile('b.txt').then(dataB => [dataA, dataB]))
  .then(([dataA, dataB]) => writeFile('c.txt', dataA + dataB))
  .then(() => console.log('done'))
  .catch(err => handle(err));  // one catch for all errors
```

**What it hides:** A Promise hides the callback registration mechanism.
Instead of "call me when done," you get "give me an object that represents
the eventual result." You can pass this object around, chain transformations,
and handle errors in one place.

The invariant: a Promise transitions from `pending` → `fulfilled` OR
`pending` → `rejected`. It never changes state again. A fulfilled Promise
always resolves to the same value.

---

## Step 1 — Simulate an Async API

Create `async-contacts.ts`:

```ts
interface Contact { name: string; email: string }
interface EnrichedContact extends Contact {
  city:    string;
  country: string;
}

// Simulate an API that takes time and sometimes fails:
function fetchContactDetails(
  contact: Contact,
  delayMs: number,
  shouldFail: boolean = false,
): Promise<EnrichedContact> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error(`API timeout for ${contact.name}`));
      } else {
        resolve({
          ...contact,
          city:    'London',
          country: 'UK',
        });
      }
    }, delayMs);
  });
}
```

### SAVE AND TRY

```bash
npx ts-node async-contacts.ts
```

Expected: no output — the function is defined but not called yet.

**Change something:** Call `fetchContactDetails({ name: 'Test', email: 'test@example.com' }, 100)`.
Without `await` or `.then()`, the Promise is created but you cannot see its value.
Add `.then(c => console.log(c)).catch(e => console.error(e))` to see it.

---

### Concept: `async`/`await` — Reading Async Code Like Sync

**What it is:** `async` and `await` are syntax sugar over Promises. An `async`
function always returns a Promise. `await` pauses the async function at that
point and resumes when the Promise settles — but does not block other code.

**The solution (compared to callbacks and Promise chains):**

```ts
// Callback version:
fetchDetails(contact, (err, data) => {
  if (err) handleError(err);
  else process(data);
});

// Promise chain version:
fetchDetails(contact)
  .then(data => process(data))
  .catch(err => handleError(err));

// async/await version — reads like synchronous code:
try {
  const data = await fetchDetails(contact);
  process(data);
} catch (err) {
  handleError(err);
}
```

**What it hides:** `async`/`await` hides the Promise state machine and the
`.then`/`.catch` chaining. The code looks sequential but executes asynchronously.
TypeScript also understands `await` — the type of `await fetchDetails(contact)`
is the resolved type, not `Promise<EnrichedContact>`.

The invariant: `await` can only be used inside an `async` function. Using it
at the top level requires top-level `await` support (ESM only) or wrapping
in an immediately invoked async function.

**Canonical example:** `async`/`await` is like reading a recipe that says
"marinate the chicken for 2 hours, then sear it." The recipe reads linearly
— but the chef knows that during those 2 hours, they can prepare other dishes.
The linearity is the reader's experience; the parallelism is the chef's reality.

**Smallest possible example:**
```ts
async function getUser(id: string): Promise<string> {
  const response = await fetch(`https://api.example.com/users/${id}`);
  const data     = await response.json();
  return data.name;  // TypeScript knows this returns Promise<string>
}

// Calling it:
const name = await getUser('alice');  // TypeScript infers name: string
```

**You will see this again in:** Every API call in every web application, every
file operation in Node.js, every database query. `async`/`await` is the standard
for all async code in modern JavaScript and TypeScript.

**Watch for:** `await` only unwraps one level. `await Promise.resolve(42)` gives
`42`. `await` on a non-Promise value just returns the value immediately. If you
forget `await`, you get a `Promise<T>` object instead of the resolved `T`.

---

## Step 2 — Sequential vs Parallel Fetching

```ts
// ── Sequential — each fetch waits for the previous ────────────────────

async function fetchSequential(contacts: Contact[]): Promise<void> {
  console.log('\n--- Sequential (slow) ---');
  const startTime = Date.now();

  for (const contact of contacts) {
    const delayMs = Math.floor(Math.random() * 150) + 50; // 50–200ms
    process.stdout.write(`Fetching ${contact.name}... `);
    const enriched = await fetchContactDetails(contact, delayMs);
    console.log(`done (${delayMs}ms)`);
  }

  console.log(`Total: ${Date.now() - startTime}ms`);
}

// ── Parallel — all fetches at the same time ───────────────────────────

async function fetchParallel(contacts: Contact[]): Promise<void> {
  console.log('\n--- Parallel (fast) ---');
  console.log('Fetching all contacts in parallel...');
  const startTime = Date.now();

  // Promise.all launches all Promises immediately, waits for all to finish:
  const delays   = contacts.map(() => Math.floor(Math.random() * 150) + 50);
  const promises = contacts.map((contact, i) =>
    fetchContactDetails(contact, delays[i])
  );

  const enriched = await Promise.all(promises);

  console.log(`All done in ${Date.now() - startTime}ms (longest wait, not sum)`);
  enriched.forEach(c => console.log(`  ${c.name}: ${c.city}, ${c.country}`));
}

// ── Run both ──────────────────────────────────────────────────────────

const contacts: Contact[] = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob',   email: 'bob@example.com'   },
  { name: 'Carol', email: 'carol@example.com' },
];

async function main(): Promise<void> {
  await fetchSequential(contacts);
  await fetchParallel(contacts);
}

main().catch(console.error);
```

### SAVE AND TRY

```bash
npx ts-node async-contacts.ts
```

Expected (times will vary):
```
--- Sequential (slow) ---
Fetching Alice... done (123ms)
Fetching Bob...   done (87ms)
Fetching Carol... done (156ms)
Total: 366ms

--- Parallel (fast) ---
Fetching all contacts in parallel...
All done in 156ms (longest wait, not sum)
  Alice: London, UK
  Bob: London, UK
  Carol: London, UK
```

**The sequential total is the sum of all delays. The parallel total is the longest
single delay.** This is the core performance argument for `Promise.all`.

**Change something:** Change `fetchParallel` to use `await` inside the loop
instead of `Promise.all`. The parallel function becomes sequential. Confirm
the times change to show the sum instead of the maximum.

---

### Concept: `Promise.all` vs `Promise.allSettled`

**What it is:** Both run multiple Promises in parallel. They differ in what
happens when one fails.

**`Promise.all`:**
- Waits for ALL to succeed
- If ANY rejects, the whole `Promise.all` rejects immediately (short-circuits)
- The other Promises continue running, but their results are discarded

**`Promise.allSettled`:**
- Waits for ALL to complete (fulfilled OR rejected)
- Never rejects — always resolves with an array of results
- Each result is `{ status: 'fulfilled', value: T }` or `{ status: 'rejected', reason: E }`

**When to use each:**

| Use `Promise.all` | Use `Promise.allSettled` |
|---|---|
| All operations must succeed | Partial success is acceptable |
| The result is meaningless if any fail | Want to process what succeeded |
| Loading required configuration | Enriching optional data |
| "Fetch all required resources" | "Fetch as many as possible" |

**Canonical example:** `Promise.all` is like a flight that waits for all
passengers before taking off — one missing passenger grounds the flight.
`Promise.allSettled` is like a bus that departs on time regardless — passengers
who make it are on the bus; those who miss it are reported as absent.

---

## Step 3 — Handling Partial Failures with `Promise.allSettled`

```ts
async function fetchWithPartialFailure(contacts: Contact[]): Promise<void> {
  console.log('\n--- Partial Failure ---');

  // Bob's request will fail:
  const promises = contacts.map((contact, index) =>
    fetchContactDetails(
      contact,
      100,
      contact.name === 'Bob',  // Bob fails
    )
  );

  // allSettled — never throws, gives results for all:
  const results = await Promise.allSettled(promises);

  let successCount = 0;
  results.forEach((result, index) => {
    const name = contacts[index].name;
    if (result.status === 'fulfilled') {
      console.log(`${name}: enriched`);
      successCount++;
    } else {
      console.log(`${name}: FAILED — ${result.reason.message}`);
    }
  });

  console.log(`\n${successCount} of ${contacts.length} contacts enriched`);
}

// Add to main():
async function main(): Promise<void> {
  await fetchSequential(contacts);
  await fetchParallel(contacts);
  await fetchWithPartialFailure(contacts);
}
```

### SAVE AND TRY

```bash
npx ts-node async-contacts.ts
```

Expected at the end:
```
--- Partial Failure ---
Alice: enriched
Bob: FAILED — API timeout for Bob
Carol: enriched

2 of 3 contacts enriched
```

**Change something:** Replace `Promise.allSettled` with `Promise.all`. Run again.
Expected: the entire function fails when Bob's request fails. `Alice: enriched` may
not appear (depends on timing). The partial results are lost. This is why
`Promise.allSettled` exists — when partial success is acceptable.

---

## 🎯 Challenge: Retry with Exponential Backoff

**You know:** `async`/`await`, `Promise`, error handling.

**Task:** Write a `retry<T>(fn: () => Promise<T>, maxAttempts: number): Promise<T>`
function that calls `fn` up to `maxAttempts` times. If `fn` succeeds, return
the result. If it fails, wait `2^attempt * 100ms` before trying again (exponential
backoff). After all attempts fail, throw the last error.

```ts
// A function that fails the first 2 times, succeeds on the 3rd:
let callCount = 0;
function unreliableFetch(): Promise<string> {
  callCount++;
  if (callCount < 3) return Promise.reject(new Error(`Attempt ${callCount} failed`));
  return Promise.resolve('Success!');
}

const result = await retry(unreliableFetch, 5);
console.log(result); // 'Success!'
console.log(`Took ${callCount} attempts`); // 3
```

**Requirements:**
- Uses `async`/`await` internally
- Waits `2^attempt * 100ms` between retries (attempt 0 = 0ms, attempt 1 = 200ms, attempt 2 = 400ms)
- After `maxAttempts`, throws the last error unchanged
- Logs each attempt for debugging

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number,
): Promise<T> {
  let lastError: Error = new Error('No attempts made');

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Wait before each retry (not before the first attempt):
    if (attempt > 0) {
      const delayMs = Math.pow(2, attempt - 1) * 100; // 100, 200, 400...
      console.log(`  Waiting ${delayMs}ms before attempt ${attempt + 1}...`);
      await sleep(delayMs);
    }

    try {
      console.log(`  Attempt ${attempt + 1} of ${maxAttempts}...`);
      const result = await fn();
      console.log(`  Succeeded on attempt ${attempt + 1}`);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`  Failed: ${lastError.message}`);
    }
  }

  throw lastError;  // all attempts exhausted
}
```

**Key insight:** The `sleep` helper wraps `setTimeout` in a Promise —
the standard pattern for async delays in Node.js. The exponential backoff
(`2^(attempt-1) * 100`) grows as: 0ms, 100ms, 200ms, 400ms, 800ms...
Each failure doubles the wait. This prevents hammering a struggling server
and gives it time to recover. The retry pattern is used in every production
HTTP client and job queue system.

</details>

---

## Final Check

| What to verify | How to verify | Expected result |
|---|---|---|
| `await` suspends not blocks | Log before and after `await`; add other code | Other code still runs |
| `async` returns Promise | Check `typeof asyncFn()` | `'object'` (Promise) |
| `Promise.all` short-circuits | One failing + `Promise.all` | All catch triggers |
| `Promise.allSettled` completes | One failing + `allSettled` | Array with mixed statuses |
| Sequential vs parallel time | Run both with 3×100ms delays | ~300ms vs ~100ms |
| Error handling | `await` a rejecting Promise without try/catch | Unhandled rejection |

---

## Quick Check Answers

**1. `setTimeout(() => console.log('A'), 0); console.log('B')` — which first?**

`'B'` prints first, then `'A'`. `console.log('B')` runs synchronously —
it is in the current execution frame. `setTimeout(fn, 0)` schedules `fn` to run
after the current synchronous code finishes, by adding it to the event queue.
The event loop only processes the queue when the call stack is empty.
So `B` (synchronous) runs first, the stack empties, the event loop picks up
the setTimeout callback, and `A` (queued) runs second. `setTimeout(fn, 0)`
does not mean "run immediately" — it means "run as soon as possible after the
current code finishes."

**2. You `await` a function that throws — where does the error go?**

When an `async` function throws (or rejects), the `await` expression throws
the same error at the call site. If the `await` is inside a `try/catch`, the
`catch` block receives it. If there is no `try/catch`, the error propagates as
a rejected Promise up the async call chain. If the top-level caller also has no
`try/catch`, it becomes an unhandled promise rejection — in Node.js, this prints
a warning and (in newer versions) terminates the process.

**3. `Promise.all` vs `Promise.allSettled` when one fails?**

`Promise.all`: if any Promise rejects, `Promise.all` immediately rejects with
that error. The other Promises continue running, but their results are discarded —
you cannot access them. Use this when all results are required.

`Promise.allSettled`: waits for every Promise to complete (fulfilled or rejected)
regardless of failures. Returns an array where each element is either
`{ status: 'fulfilled', value: T }` or `{ status: 'rejected', reason: Error }`.
Never rejects itself. Use this when partial success is acceptable.

# Lesson 2: A Second Process That Already Knows Databases

**What you will build** — this project's own second, real process
boundary: the main process spawns the real, already-built `pocket-db`
Python engine as a real, separate OS process, and talks to it through
a real, hand-rolled, newline-delimited JSON protocol over its own
`stdin`/`stdout`. By the end, a real TypeScript function asks "what
tables does this file have" and gets a real, correct answer back from
`pocket-db`'s own real, already-verified engine — not a shortcut, not
a rebuild, the actual thing.

**What you need to know first:** Lesson 1 (a real, narrow IPC
boundary); `pocket-db`'s own `Database.table_names()` (its Lesson 28) —
this lesson doesn't rebuild it, it calls it.

**Terms introduced in this lesson:** **`child_process.spawn`** — real,
standard Node.js — starts a real, genuinely separate OS process,
giving real, direct access to its own `stdin`/`stdout`/`stderr` as
real, live streams. **JSON-lines** — a real, simple, standard protocol
shape: one real, complete JSON object per real line, separated by
real `\n` characters — chosen here specifically because a real stream
has no other, built-in notion of "one message ends here."

**Objects and methods used**
- **`spawn(command, args, options)`**
  - *What it is:* real, standard Node.js — launches a real, separate
    process; returns a real `ChildProcess` object with real, live
    `stdin`/`stdout`/`stderr` streams.
  - *Implementation:* `spawn("python", ["query_server.py"], { env:
    {...} })`.
  - *Its use:* this lesson's own real, entire connection to the
    already-real `pocket-db` engine.
- **`process.stdout.on("data", listener)`**
  - *What it is:* real, standard Node.js stream event — fires every
    real time *some* new, real output arrives — with no real guarantee
    it's a whole, complete message.
  - *Implementation:* covered fully in this lesson's own second unit.
  - *Its use:* this lesson's own real, entire way of receiving
    responses from the spawned Python process.

---

## Concept Unit: A Real Protocol, One Line at a Time

### The Problem

Two real, separate processes — a real Node.js main process, a real
Python child process — share no real memory at all. The only real
connection between them is `stdin`/`stdout`, which is really just a
real, plain stream of bytes with no built-in notion of "message." A
real, deliberate, simple protocol has to decide where one real message
ends and the next begins.

### Introduce the Concept in Isolation

This project keeps its own real, direct copy of `pocketdb.py` and
`pocketdb_engine.dll` — a real, deployed app bundles what it depends
on, rather than reaching into a sibling project's own dev folder at
runtime:

```bash
cp <path-to-pocketdb>/pocketdb.py <path-to-pocketdb>/pocketdb_engine.dll .
```

Save this as `query_server.py`, in this project's own real root
folder, alongside the real files just copied in:

```python
import sys
import json
from pocketdb import Database, PocketDBError

db = None


def handle_request(request):
    method = request["method"]
    params = request.get("params", {})

    if method == "open":
        global db
        db = Database(params["path"])
        return {"ok": True}
    elif method == "list_tables":
        return {"tables": db.table_names()}
    else:
        raise ValueError(f"Unknown method: {method}")


for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    request = json.loads(line)
    try:
        result = handle_request(request)
        response = {"id": request["id"], "result": result}
    except Exception as e:
        response = {"id": request["id"], "error": str(e)}
    print(json.dumps(response), flush=True)
```

Real, isolated proof, piping two real requests directly into it from a
real, plain shell:

```bash
printf '{"id": 1, "method": "open", "params": {"path": "test.pdb"}}\n{"id": 2, "method": "list_tables"}\n' | python query_server.py
```

Real output:

```text
{"id": 1, "result": {"ok": true}}
{"id": 2, "result": {"tables": []}}
```

### Discard the Throwaway Example

`query_server.py` is kept — a real, permanent, new project file. No
other real file was created for this unit.

### Mechanical Walkthrough

- `for line in sys.stdin:` — reappearing shape (`pocket-db`'s own
  established Python idioms) — Python's own real, standard way of
  reading a real stream one real, complete line at a time.
- `print(json.dumps(response), flush=True)` — `flush=True` is real,
  deliberately required: Python normally buffers real `stdout` when
  it isn't a real, interactive terminal (exactly the real case once a
  parent process spawns it) — without a real, explicit flush, a real
  response could sit in Python's own internal buffer indefinitely,
  never actually reaching the real parent process at all.
- `db.table_names()` — reappearing, real, already-built (`pocket-db`,
  Lesson 28) — this lesson calls it, doesn't reimplement it.

### CS Lens

Choosing "one real, complete JSON object per real line" is a real,
deliberate **framing** decision — a real, general problem every
stream-based protocol has to solve (HTTP uses real, explicit
`Content-Length` headers; this project's own protocol uses the
simplest real framing that works for structured, line-oriented text:
a real newline never legally appears inside compact, real JSON).

### SE Lens

Why `flush=True` on *every* real response, rather than only the last
one? Because this lesson's own real protocol is a real, ongoing
conversation — the real, calling process is genuinely waiting, right
now, for each real response before it can send its next real request;
a real, delayed flush would make the whole real system hang, not just
run slow.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

A real, working protocol exists on the Python side. Real proof that
receiving it correctly, from Node.js, needs more care than it first
appears is next.

---

## Concept Unit: A Response That Arrives in Pieces

### The Problem

`process.stdout.on("data", ...)` fires with *whatever* real bytes have
arrived so far — a real stream gives no real guarantee that one
`"data"` event contains one complete, real line, or even a whole real
character. A real response can genuinely arrive split across two or
more separate, real events.

### Introduce the Concept in Isolation

Save this as `buffer_check.js`:

```javascript
let buffer = "";

function handleData(chunk) {
  buffer += chunk;
  let newlineIndex;
  while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
    const line = buffer.slice(0, newlineIndex);
    buffer = buffer.slice(newlineIndex + 1);
    if (line.trim().length === 0) continue;
    console.log("real, complete line received:", JSON.parse(line));
  }
}

const fullResponse = '{"id": 1, "result": {"tables": ["games", "scores"]}}\n';
const splitPoint = 20;
const firstChunk = fullResponse.slice(0, splitPoint);
const secondChunk = fullResponse.slice(splitPoint);

console.log("first chunk (incomplete JSON):", JSON.stringify(firstChunk));
handleData(firstChunk);
console.log("(nothing printed above this line -- buffer has no real newline yet)");

console.log("second chunk (completes the line):", JSON.stringify(secondChunk));
handleData(secondChunk);
```

Run with:

```bash
node buffer_check.js
```

Real output:

```text
first chunk (incomplete JSON): "{\"id\": 1, \"result\": "
(nothing printed above this line -- buffer has no real newline yet)
second chunk (completes the line): "{\"tables\": [\"games\", \"scores\"]}}\n"
real, complete line received: { id: 1, result: { tables: [ 'games', 'scores' ] } }
```

The real `handleData` calls, traced one at a time against the two, real,
separate chunks:

#### Execution Trace

```text
Iteration 1: handleData(firstChunk) runs, and buffer.indexOf("\n") returns -1
             so the while loop body never runs, because no real newline exists yet
Iteration 2: handleData(secondChunk) runs, and buffer.indexOf("\n") returns a real index
             so the while loop body runs once, printing the real, complete line
```

Real, direct proof a *naive* approach genuinely fails on the identical,
real, split input:

```javascript
try {
  JSON.parse(firstChunk);
} catch (e) {
  console.log("naive JSON.parse on the first raw chunk fails:", e.message);
}
```

Real output:

```text
naive JSON.parse on the first raw chunk fails: Unexpected end of JSON input
```

### Discard the Throwaway Example

```bash
rm buffer_check.js
```

### Mechanical Walkthrough

- `buffer += chunk;` — every real, incoming chunk is appended to a
  real, persistent, growing buffer — nothing is ever parsed directly
  from a raw, incoming chunk.
- `while ((newlineIndex = buffer.indexOf("\n")) !== -1) { ... }` — a
  real loop, not an `if` — because a single, real chunk could
  genuinely contain *more* than one complete, real line at once (the
  identical real scenario in reverse); real code that only checked
  once per event would silently miss real, extra messages.

### CS Lens

This is a real, small, hand-rolled instance of a genuinely standard
problem: parsing a real, framed protocol out of an **unbounded,
arbitrarily-chunked byte stream** — the identical real challenge every
real network protocol parser (HTTP, a real database's own wire
protocol) solves the same, general way: buffer everything received,
extract complete real messages only once a real, complete boundary
(here, `\n`) has actually arrived.

### SE Lens

Why `buffer.slice(0, newlineIndex)` / `buffer.slice(newlineIndex + 1)`
— rebuilding `buffer` on every real iteration — rather than tracking a
real, separate read-position index into an unchanging buffer? Because
this lesson's own real, simpler version favors real, obvious
correctness over real, marginal performance — a real database's own
wire protocol, handling real megabytes per second, would genuinely
need the faster, index-tracking version; this lesson's own real
traffic (one small, real JSON object at a time) never will.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

A real client can now correctly buffer and parse responses, even split
ones. Assembling the real, full client — spawning the real process,
sending real requests, resolving real `Promise`s — and finding one
more, real, familiar gotcha along the way, is last.

---

## Concept Unit: The Real, Full Connection

### The Problem

A real protocol and a real buffering strategy both exist. Nothing yet
actually spawns `query_server.py`, sends it real requests, or
resolves real `Promise`s when its real answers arrive.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `src/pocketdb-client.ts` (new).
- **Change type:** Add.
- **Dependencies:** This lesson's own first two units.

### The New Code — `src/pocketdb-client.ts`

```typescript
import { spawn, ChildProcessWithoutNullStreams } from "child_process";

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
}

interface RpcResponse {
  id: number;
  result?: unknown;
  error?: string;
}

export class PocketDBClient {
  private process: ChildProcessWithoutNullStreams;
  private nextId = 1;
  private pending = new Map<number, PendingRequest>();
  private buffer = "";

  constructor(pythonPath: string, scriptPath: string, extraPathEntry: string) {
    this.process = spawn(pythonPath, [scriptPath], {
      env: { ...process.env, PATH: `${extraPathEntry};${process.env.PATH}` },
    });
    this.process.stdout.on("data", (chunk: Buffer) => this.handleData(chunk));
  }

  private handleData(chunk: Buffer): void {
    this.buffer += chunk.toString();

    let newlineIndex: number;
    while ((newlineIndex = this.buffer.indexOf("\n")) !== -1) {
      const line = this.buffer.slice(0, newlineIndex);
      this.buffer = this.buffer.slice(newlineIndex + 1);
      if (line.trim().length === 0) {
        continue;
      }

      const response: RpcResponse = JSON.parse(line);
      const pending = this.pending.get(response.id);
      if (!pending) {
        continue;
      }
      this.pending.delete(response.id);

      if (response.error !== undefined) {
        pending.reject(new Error(response.error));
      } else {
        pending.resolve(response.result);
      }
    }
  }

  request(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.process.stdin.write(JSON.stringify({ id, method, params }) + "\n");
    });
  }

  close(): void {
    this.process.kill();
  }
}
```

Real, first proof — with no PATH fix yet — real-fails, the identical
real gotcha `pocket-db`'s own Lesson 6 already taught, now showing up
again in a genuinely new, real context:

```text
FileNotFoundError: Could not find module '...\pocketdb_engine.dll' (or one of its dependencies).
```

*Real, honest explanation:* a spawned child process doesn't
necessarily inherit the same, real, effective `PATH` an interactive
terminal has — `pocketdb.py`'s own `ctypes.CDLL(...)` call (Lesson 6)
needs `pocket-db`'s own compiler toolchain directory on `PATH` at the
exact real moment it runs, and a naive `spawn("python", [...])` with no
explicit `env` doesn't real-guarantee that.

Fixed — `extraPathEntry` (this lesson's own real constructor
parameter) is prepended to the real, spawned process's own `PATH`:

```typescript
const client = new PocketDBClient("python", "query_server.py", "C:\\msys64\\ucrt64\\bin");

const openResult = await client.request("open", { path: "test.pdb" });
console.log("open result:", openResult);

const listResult = await client.request("list_tables");
console.log("list_tables result:", listResult);

client.close();
```

Real output:

```text
open result: { ok: true }
list_tables result: { tables: [ 'games' ] }
```

### Discard the Throwaway Example

`src/pocketdb-client.ts` is kept — a real, permanent project file.

### Mechanical Walkthrough

- `env: { ...process.env, PATH: \`${extraPathEntry};${process.env.PATH}\` }`
  — reappearing shape (real, environment-variable manipulation,
  `pocket-db`'s own Lesson 6 concept, applied here from the Node.js
  side instead of the shell) — the spawned process's own real
  environment is a real *copy* of the current one (`...process.env`),
  with one real, extra directory prepended to `PATH`.
- `this.pending.set(id, { resolve, reject });` then `this.process.
  stdin.write(...)` — real, standard **Promise executor** pattern —
  `resolve`/`reject` are saved *before* the real request is even sent,
  so they're already real and ready the moment a real, matching
  response arrives, however long that takes.
- `const response: RpcResponse = JSON.parse(line);` — reappearing
  shape (this lesson's own second unit) — only ever runs on a real,
  complete line, never a raw, unbuffered chunk.

### CS Lens

Matching each real response back to the real request that caused it,
by a real, numeric `id`, is what lets multiple real requests be
**in flight at once** without real confusion — even though this
lesson's own real proof sends them one at a time, `pending` being a
real `Map` (not a single, real pending slot) means the identical real
client already supports real, concurrent requests correctly, the
moment a later real lesson actually needs to send more than one at
once.

### SE Lens

Why does `PocketDBClient` take `extraPathEntry` as a real, explicit
constructor parameter, rather than hardcoding `"C:\\msys64\\ucrt64\\
bin"` directly inside the class? Because a real, hardcoded path would
only work on *this* real machine, in *this* real project's own current
setup — a real, explicit parameter is what lets this lesson's own real
class stay honest about depending on something real and
environment-specific, without silently assuming it.

### Commands Needed

No new, separate commands — this unit's own real proof is the full,
compiled, run script shown above.

### Run It

Already shown above, in "The New Code."

### Connection

S02 is complete: the main process now really talks to `pocket-db`'s
own real, already-built engine, through a real, hand-rolled protocol,
correctly buffered, correctly PATH-configured. S03, next, is where
this project's own real UI finally begins — React, rendering this
lesson's own real `list_tables` result as an actual, visible list, in
the actual, real window.

---

## Closing

### Connect the Pieces

This lesson's first unit built a real, minimal, line-oriented JSON
protocol on the Python side, calling nothing but `pocket-db`'s own
already-real, already-verified `Database.table_names()` — no database
logic rebuilt here. The second unit proved, directly, that a real
response can arrive split across real, separate stream events, and
that a real buffering strategy — not a naive, direct parse — is what
correctly handles it. The third assembled both into a real
`PocketDBClient`, hit the identical real DLL-PATH gotcha `pocket-db`'s
own Lesson 6 already taught (now in a genuinely new, real context —
a spawned child process's own environment), fixed it the same real
way, and proved the whole real chain end to end.

### What Breaks Without This

In `handleData`, change the `while` loop to an `if` statement (parsing
at most one real line per real event), rebuild, and feed it two real,
complete responses that happen to arrive in the identical, real chunk
at once (a real, plausible event under real, fast-arriving output).
The real, second response is silently lost — its own real `pending`
entry never resolves, and any real code `await`-ing it hangs forever,
with no real error at all. Restore the `while` loop and confirm both
real responses are received correctly.

### Exercises

- Add a third, real method to `query_server.py` — `"get_row"`, taking
  a real `table` and `index`, calling `pocket-db`'s own already-real
  `db.get(table, index)` — and a matching real
  `PocketDBClient.request("get_row", ...)` call, proven end to end.
- Deliberately send a request for an unknown real method (`client.
  request("nonsense")`), and confirm the real, resulting `Promise`
  rejects with the real, exact error message `query_server.py`'s own
  `except Exception as e:` branch produced.
- `PocketDBClient.close()` calls `this.process.kill()` directly, with
  no real check for any requests still genuinely pending. Explain,
  referencing this lesson's own SE Lens on the `Promise` executor
  pattern, what real, observable behavior a pending request's own
  caller would see if `close()` were called while it was still
  waiting.

### Definition of Done

- [ ] `query_server.py` and `src/pocketdb-client.ts` both exist as
      real, permanent files.
- [ ] You piped real, raw JSON lines into `query_server.py` directly
      and confirmed the real, correct responses.
- [ ] You ran this lesson's own real, split-chunk buffering proof
      yourself and confirmed the real, correct output.
- [ ] A real, compiled TypeScript script spawns `query_server.py`,
      opens a real `.pdb` file, and lists its real tables correctly.
- [ ] You caused the real DLL-PATH failure yourself (by removing the
      `env` override) and confirmed restoring it fixes it.
- [ ] You can explain, from memory, why `handleData` uses a `while`
      loop instead of an `if` — referencing this lesson's own "What
      Breaks Without This."
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add a real JSON-lines client talking to the real pocket-db engine"`.

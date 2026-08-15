# Lesson 27: Opening the Same `.db` From a Browser

**What you will build:** `pocket_hardware.db` loaded and queried
correctly inside a real, ordinary web browser — and direct, run proof
that a real, successful write made there never reaches the real file at
all, the one genuine break in this arc's own portability streak.

**What you need to know first:** [Lesson 25](lesson-25-opening-the-same-db-from-nodejs.md)
and [Lesson 26](lesson-26-opening-the-same-db-from-csharp.md) — both
proved a real write in that language is exactly as real and permanent
as one from the CLI; this lesson proves that guarantee genuinely does
not extend to a browser, for a real, structural reason.

**Terms introduced in this lesson:**
- **WebAssembly (WASM)** — a real, binary instruction format browsers
  can run at near-native speed; `sql.js`'s own real SQLite engine is
  compiled to this format, letting genuine SQLite C code run inside a
  browser tab with no server involved in running the actual queries.

**Objects and methods used:**

**`sql.js`'s `initSqlJs`/`SQL.Database`**
- *What it is:* a real, third-party JavaScript library
  (`npm install sql.js`) providing genuine SQLite, compiled to
  WebAssembly, runnable directly in a browser.
- *Implementation:* `initSqlJs({ locateFile })` asynchronously loads
  the real WASM binary; `new SQL.Database(bytes)` constructs a real,
  in-memory database from a raw `Uint8Array` of an actual `.db` file's
  own bytes; `.exec(sql)` runs a real query, returning an array of
  `{ columns, values }` result objects.
- *Its use:* the real, genuine SQLite engine this lesson runs entirely
  client-side, inside the browser tab itself.

---

## Concept Unit: Loading a Real `.db` File Into the Browser

### The Problem

A browser has no real, direct filesystem access — `sqlite3.connect`
(Python), `DatabaseSync` (Node.js), and `SqliteConnection` (C#) all
opened `pocket_hardware.db` by its own real path on disk; a browser tab
cannot do that at all, for any file, by design (a real, deliberate
security boundary, not an oversight). Can this project's own real
`.db` file still be queried from inside one?

### Introduce the Concept in Isolation

```js
import initSqlJs from "sql.js";

const SQL = await initSqlJs({ locateFile: (file) => `https://sql.js.org/dist/${file}` });
const response = await fetch("pocket_hardware.db");
const buffer = await response.arrayBuffer();
const db = new SQL.Database(new Uint8Array(buffer));

const result = db.exec("SELECT name, price FROM parts WHERE price > 10");
console.log(result);
```

```
[
  {
    columns: ["name", "price"],
    values: [
      ["Hammer", 12.99],
      ["Drill", 45],
      ["Level", 14.75]
    ]
  }
]
```

The identical real three rows a fourth genuinely different way — but
notice the real mechanism: `fetch("pocket_hardware.db")` requests the
file the same way a browser requests any real resource, over HTTP, from
whatever real server is hosting it; `response.arrayBuffer()` reads its
entire real, raw bytes into memory; `new SQL.Database(...)` then hands
those genuine bytes to a real, WASM-compiled copy of SQLite's own C
engine, which parses them exactly as any other real SQLite client
would. Every earlier lesson's own client opened the file *by path*,
directly; this one downloaded a real, complete *copy* of its bytes
first — a real, structural difference this lesson's own next unit
proves has real consequences.

### Discard

Nothing throwaway — this real loading pattern is exactly what a real,
future browser-based reporting tool for this project would use; no
permanent code is added to this series' own project, though, since Arc
5's own desktop UI uses `pywebview` and a real backend instead (Lesson
37).

### Mechanical Walkthrough

- `initSqlJs({ locateFile: ... })` — **(a) first appearance**, full
  treatment above; `locateFile` — a real, required callback telling
  `sql.js` where to fetch its own WASM binary from.
- `fetch("pocket_hardware.db")` / `response.arrayBuffer()` — **(a)
  first appearance** of the real, standard browser `fetch` API reading
  raw binary bytes — genuinely new to this series (every earlier
  lesson's own client used a language-level file-path API instead of an
  HTTP request to reach the file at all).
- `new SQL.Database(new Uint8Array(buffer))` — **(a) first appearance**,
  full treatment above; `Uint8Array` — a real, standard JavaScript
  typed-array view over raw binary bytes.
- `db.exec("SELECT name, price FROM parts WHERE price > 10")` — **(b)
  hard concept reappearing**, the SQL itself unchanged since Lesson 04;
  `.exec` — **(a) first appearance** of `sql.js`'s own specific return
  shape, full treatment above.

### CS Lens

WebAssembly is a real, general **portable compilation target**: SQLite's
own genuine C source code, compiled once to WASM, runs correctly inside
any real, standards-compliant browser regardless of the visitor's own
operating system or CPU architecture — the identical underlying idea as
the Java Virtual Machine or the .NET CLR, applied to a real, existing C
codebase instead of a language designed for it from the start.

### SE Lens

The real, deliberate reason a browser has no direct filesystem access
at all — unlike every other client in this arc — is security: an
ordinary web page has no business reading or writing arbitrary files on
a visitor's real computer, and browsers enforce that boundary
structurally, not by convention. `sql.js`'s own real design — download
a complete copy, operate on it entirely in memory — is the correct,
honest way to bring genuine SQLite querying into that constrained real
environment, not a workaround hiding a real filesystem connection
underneath.

## Concept Unit: A Real Write That Never Reaches the Real File

### The Problem

Every earlier lesson's own real write (Lesson 17's Python `INSERT`,
Lesson 25's Node `run`, Lesson 26's C# insert) was confirmed
independently at the CLI afterward — genuinely permanent. Does a write
from this lesson's own in-browser database behave the same way?

### Introduce the Concept in Isolation

A real, successful-looking write, against the exact same in-memory
database this lesson's first unit already loaded:

```js
db.run("UPDATE parts SET quantity = 999 WHERE name = 'Hammer'");
const check = db.exec("SELECT quantity FROM parts WHERE name = 'Hammer'");
console.log(check);
```

```
[ { columns: ["quantity"], values: [[999]] } ]
```

Inside the browser's own tab, this looks exactly like every earlier
lesson's own real write — the change is genuinely there, immediately,
read back correctly. The real, load-bearing question this lesson exists
to answer: is `pocket_hardware.db`, the real file on disk, actually
`999` now too?

```
$ sqlite3 pocket_hardware.db "SELECT quantity FROM parts WHERE name = 'Hammer';"
4
```

Still `4` — real, provable proof the browser's own `999` never reached
the real file at all. `db.run`'s own write only ever touched the
in-memory `Uint8Array` copy this lesson's first unit downloaded — the
identical real distinction this series' own Lesson 23 already proved
for `:memory:` databases generally, now shown to apply to `sql.js`
specifically, for the exact same structural reason: no real, persistent
storage sits underneath this copy at all, by design, because a browser
tab has no real filesystem to write one to.

Making a browser-side change genuinely permanent requires one further,
real step this lesson's own code never took: `db.export()` returns the
in-memory database's own current, real bytes as a fresh `Uint8Array`,
which then has to be sent somewhere real and durable by hand — a real
file download the visitor saves themselves, or a real `POST` request
back to a server that writes those bytes to its own real disk. Nothing
about `sql.js` does that step automatically.

### Discard

Nothing throwaway — this real, structural limitation is exactly why
Arc 5's own desktop shell (Lesson 37 onward) is built with `pywebview`
and a real Python backend with genuine filesystem access, instead of a
browser-only `sql.js` approach — a deliberate architectural choice this
lesson's own proof directly justifies.

### Mechanical Walkthrough

- `db.run("UPDATE parts SET quantity = 999 WHERE name = 'Hammer'")` —
  **(a) first appearance** of `.run` (as opposed to `.exec`) on a real
  `sql.js` database — used for a statement whose own result rows, if
  any, aren't needed; the SQL itself — **(b) hard concept reappearing**,
  Lesson 06's own `UPDATE`, unchanged.
- `db.export()` — **(a) first appearance**: the real, only way to get
  this in-memory database's own current bytes back out, mentioned here
  as the real, necessary next step this lesson's own code deliberately
  stops short of.

### CS Lens

This is the identical real distinction Lesson 23 already named directly
— **volatile vs. persistent storage** — encountered here for a genuinely
different, structural reason (no browser filesystem access at all)
rather than a deliberate testing choice (`:memory:`, chosen on purpose
in Lesson 23 specifically because volatility was the whole point there).

### SE Lens

The real, honest architectural lesson this whole arc has been building
toward: a SQLite file's own format is real and fully portable (Lessons
25–26 both proved a write is exactly as permanent from Node.js or C# as
from Python or the CLI) — but *durable, shared write access* depends on
the client having a real, persistent filesystem underneath it, which a
browser tab structurally does not. This is the concrete, provable reason
this series' own Arc 5 desktop application is not simply "a web page
that opens the `.db` file directly" — `pywebview`'s own real value,
proven directly in Lesson 37, is bridging a real web UI to Python code
that *does* have genuine filesystem access, rather than asking a
browser to do something this lesson just proved it structurally cannot.

## Connect the pieces

One real file, loaded a fourth genuinely different way: `fetch` and
`sql.js` proved the identical `parts` data readable from inside a
browser, with genuine SQLite C code running as real WebAssembly. And
one real, structural limit, proven directly rather than assumed: a
write made there, however real it looks inside the tab, never reaches
the actual file on disk — confirmed independently at the CLI — because
`sql.js` operates on a real, in-memory *copy*, the identical underlying
fact Lesson 23 already proved about `:memory:` databases, now shown to
be true of every browser-based SQLite client, structurally, not by
choice.

## What breaks without this

Reload the exact same page, re-running this lesson's own first unit's
loading code, with no other real change:

```js
const response = await fetch("pocket_hardware.db");
const buffer = await response.arrayBuffer();
const db = new SQL.Database(new Uint8Array(buffer));
const check = db.exec("SELECT quantity FROM parts WHERE name = 'Hammer'");
console.log(check);
```

```
[ { columns: ["quantity"], values: [[4]] } ]
```

`4` again — not `999`. A fresh `fetch` downloads the real file's own
current, correct bytes from the real server, and the previous tab's own
in-memory `999` is gone the instant that tab's own JavaScript state was
discarded — real, direct, final proof that nothing about this lesson's
own earlier write was ever real or shared in the first place, only
locally, temporarily visible inside one specific browser tab's own
memory.

## Exercises

1. Reproduce this lesson's own real write-then-reload proof yourself,
   and additionally call `db.export()` after the write, saving the
   resulting bytes as a real, new local file (`modified.db`) using
   whatever real mechanism your own environment provides. Confirm
   `modified.db`, opened with the `sqlite3` CLI, really does show `999`
   — proof `export()` genuinely captures the in-memory change, even
   though nothing wrote it back to the *original* file automatically.
2. State, in your own words, what a real server-side endpoint would
   need to do to accept a browser's own `db.export()`-produced bytes
   and make them the real, new, permanent content of
   `pocket_hardware.db` on disk — you are not required to build this
   endpoint; Arc 4's own FastAPI backend is the real, correct place
   such an endpoint would eventually live.

## Definition of Done

- [ ] You loaded `pocket_hardware.db` into a browser with `sql.js` and
      read the same real rows every earlier client in this series has.
- [ ] You made a real write inside the browser and confirmed,
      independently at the CLI, that the real file never changed.
- [ ] You reproduced the real "reload discards the change" proof and
      can state, from memory, the structural reason a browser has no
      real, persistent filesystem to write to at all.
- [ ] You completed both exercises.

## Arc 3 complete

Three lessons, one real file, four genuinely different real clients:
Node.js and C# both proved a write is exactly as permanent as one from
Python or the CLI — real, direct confirmation that `pocket_hardware.db`
is a portable, language-agnostic artifact, not a Python-specific one.
The browser, the one genuine exception, proved *reading* is equally
portable while *writing* structurally is not — the concrete, provable
reason [Arc 5](lesson-37-what-pywebview-is.md)'s own desktop shell
bridges a real web UI to Python code with genuine filesystem access,
rather than asking a browser to persist data it structurally cannot.
[Arc 4](lesson-28-why-a-backend-at-all.md) returns this series fully to
Python, building the real backend every later arc depends on.

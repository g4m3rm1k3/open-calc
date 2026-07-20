# MyDB Curriculum Map

This is the anchor document for the whole project. **To resume in a new
chat:** upload this file + your current project folder (or just the
relevant module's source), and say which lesson number to write next.
No prior chat history is needed — this document + the code itself is
enough context.

---

## Architecture (module boundaries)

Each box below is a real API boundary, not just a folder. A module is
done when another module can call it through its public interface
without knowing its internals. This is what lets levels be built,
tested, and resumed independently.

```
mydb/
├── storage/        Storage Engine
│   Public API:      Table::insert(Record), Table::selectAll(),
│                     Table::update(id, Record), Table::remove(id)
│   Internals:        file format, later: pages, B+ tree indexes
│
├── sql/             SQL Parser  (Level 2+)
│   Public API:      parse(std::string sql) -> AST
│   Internals:        Lexer, Parser, AST node types
│
├── engine/          Query Executor  (Level 2+)
│   Public API:      execute(AST) -> Result
│   Depends on:       sql/ (AST in) and storage/ (Table calls out)
│
├── auth/            Authentication & Authorization  (Level 4+)
│   Public API:      login(user, pass) -> Session
│                     authorize(Session, operation) -> bool
│   Internals:        password hashing, users/roles/permissions tables
│                     (stored via storage/ itself)
│
├── net/             Networking  (Level 5+)
│   Public API:      Server::listen(port), Client::connect(host, port)
│   Depends on:       engine/ (runs queries received over the wire)
│                     and auth/ (authenticates connections)
│
└── studio/          Admin client UI  (Level 6)
    Depends on:       net/ (talks to a running MyDB server like any client)
```

**Why this matters for pacing:** once `storage/` has a stable public
API (end of Level 1), Level 2's lessons never need to re-explain how
records are stored — they just call `Table::insert(...)`. Same at every
later boundary. This is also why lessons should be written module by
module, not skipping ahead — the interface has to exist before the next
module can be taught calling it truthfully.

---

## Concept Ledger

Every concept a lesson gives full first-appearance treatment to gets
logged here. Before writing a new lesson, check this list — anything on
it gets a brief reminder at most, never a full re-explanation (per the
Repetition Rule).

### Taught so far (Level 1, Lessons 1)
- Compile/link model (`g++`, source vs. executable)
- `#include`, `int main()`, `std::cout`, `<<`
- `std::string`
- `std::ofstream`, `std::ios::app`
- `std::ifstream`, `std::getline`, `while` loop, sentinel iteration

*(This section gets appended to after every lesson that's actually
written — treat it as the running source of truth, more current than
the lesson list below if the two ever disagree.)*

---

## Level 1 — TinyDB (single file, no SQL yet)

Goal: leave this level with a working `storage/` module behind a clean
API, built entirely by hand — no libraries beyond the C++ standard
library.

| # | Title (concept focus) | New concepts | Files |
|---|---|---|---|
| 1 | ✅ The Shape of a Program Before It Becomes One | compile model, `string`, `ofstream`/`ifstream`, `getline` loop | `mydb.cpp` |
| 2 | Naming What a Record Is (`struct`) | `struct`, `std::vector`, building a record from parts instead of one literal string | `mydb.cpp` |
| 3 | Letting the Program Be Told, Not Told-to (`std::cin`) | `std::cin`, basic input validation, functions (splitting `main` into named pieces) | `mydb.cpp` |
| 4 | Drawing the Line Between Module and User (`.h`/`.cpp` split, classes) | header files, `class` vs `struct`, public/private, encapsulation | `storage/table.h`, `storage/table.cpp`, `mydb.cpp` |
| 5 | Changing Your Mind After You've Already Written It Down (update/delete) | append-only file limitations, temp-file-and-rename pattern, error handling (exceptions) | `storage/table.cpp` |
| 6 | Proving It Without Reading the Output Yourself (tests + API freeze) | unit testing basics, asserting behavior instead of eyeballing output, finalizing `storage/`'s public API | `storage/table_test.cpp`, `storage/table.h` |

**End of Level 1 deliverable:** `storage/` module with a frozen public
API (`insert`, `selectAll`, `update`, `remove`), tests proving it, and
`mydb.cpp` reduced to a thin CLI that calls into it.

---

## Level 2 — MiniSQL (lexer → parser → AST → executor)

Goal: real SQL text in, real query execution out, calling `storage/`'s
API from Level 1 — `storage/` itself does not change.

Pipeline this level establishes (gets restated with a concrete value at
the top of every lesson that touches it, per the lesson schema):

```
SQL text → Lexer → Tokens → Parser → AST → Executor → storage/ calls
```

Planned lessons (concepts, not yet mechanically detailed):
1. Characters to Tokens — the Lexer for one statement shape (`SELECT * FROM students;`)
2. Growing the Lexer — literals, operators, keywords vs. identifiers
3. Tokens to a Tree — the Parser and what an AST node is
4. Parsing `INSERT` and `WHERE` — recursive descent basics, operator precedence
5. Walking the Tree — the Executor, visitor-pattern-shaped dispatch
6. Wiring the Executor to `storage/` — the first real `SELECT * FROM students;` running end to end
7. Errors That Point Somewhere — parse errors with line/column, not just crashes
8. `UPDATE` / `DELETE` with `WHERE` — executor calling `storage/`'s update/remove
9. (buffer lesson — likely needed) multiple tables, `CREATE TABLE`
10. (buffer lesson — likely needed) tying it together, `sql/` and `engine/` API freeze

---

## Level 3 — MyDB Core (pages, B+ tree indexes, transactions)

Goal: replace `storage/`'s naive whole-file read/write internals with a
real page-based engine — **without changing its public API**, so
nothing above it (Level 2's executor) has to change at all. This is the
lesson-scale payoff of having frozen that API back in Level 1.

Rough shape (8–12 lessons): binary file layout and pages → fixed vs.
variable-length records → a free-space map → B+ tree structure →
B+ tree search/insert/split → using the index from `SELECT ... WHERE` →
write-ahead logging → transactions and rollback → concurrency basics
(likely capped at single-writer for this project's scope).

---

## Level 4 — MyDB Secure (users, hashing, RBAC)

Goal: a new `auth/` module, storing users/roles/permissions *through*
`storage/`'s own API (proving it's general-purpose), sitting in front
of `engine/` so every query passes through an authorization check.

Rough shape (5–7 lessons): a `system` database via `storage/` → users
table → password hashing (why plaintext is wrong, salts, then a real
algorithm) → roles and permissions tables → `GRANT`/`REVOKE` parsed by
`sql/` → `engine/` checking authorization before execution.

---

## Level 5 — MyDB Server (TCP, protocol, sessions)

Goal: a new `net/` module. `engine/` and `auth/` don't change — they
just get called from a socket handler instead of directly from `main`.

Rough shape (6–9 lessons): sockets fundamentals → a minimal
request/response protocol → serializing a query and a result set →
`LOGIN` producing a session token → subsequent queries using that token
→ handling multiple connected clients.

---

## Level 6 — MyDB Studio (admin client)

Goal: a separate client program, talking to a running MyDB server
purely through `net/`'s protocol — proving the server boundary is real
by building a second, independent client against it.

Rough shape (4–6 lessons): connecting and authenticating → listing
databases/tables → running ad hoc queries and rendering results →
a simple users/permissions view.

---

## How to resume a session

1. Upload this file.
2. Upload (or paste) the current state of the relevant module(s) — you
   don't need the whole repo, just what the next lesson will touch.
3. Say: *"Write Lesson N of Level M."*
4. After the lesson is written, its new concepts get appended to the
   Concept Ledger above — update this file and keep it as your source
   of truth going forward.

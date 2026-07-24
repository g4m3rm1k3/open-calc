# Level 2, Lesson 5: Walking the Tree
*(A Reference Member, Turning Tokens Into Typed Values, and Dispatching by Statement Kind)*

```
SQL text → Lexer → Tokens → Parser → AST → Executor → storage/ calls
```

**This lesson builds the Executor stage — the last one in the whole
pipeline**, and the first time this project's two independent modules,
`sql/` and `storage/`, actually call into each other. Carried through
every stage, start to finish, for the first time ever in this project:

```
"INSERT INTO students VALUES (1, 'Alice', 20);"
    → Lexer → Tokens → Parser →
InsertStatement { tableName: "students", values: [NUMBER "1", STRING "Alice", NUMBER "20"] }
    → Executor →
table.insert(Student{ id: 1, name: "Alice", age: 20 })
    → storage/ →
a new line written to school.db
```

**What you will build.** Every lesson through Level 2, Lesson 4 has
produced AST nodes — real, typed values — that nothing ever actually
*acted on*. Today changes that: `engine/executor.h`/`.cpp` is a new
module holding an `Executor` that takes a parsed `InsertStatement` or
`SelectStatement` and genuinely calls `storage/`'s `Table::insert`/
`selectAll` — the exact frozen API Level 1 Lesson 6 built and tested,
untouched, called for real for the first time. A small dispatcher
decides, from one line of typed SQL, which parsing rule and which
executor method apply.

**What you need to know first.** All of Level 1 (`Table`'s frozen API)
and Level 2 Lessons 1–4 (`Token`, `Lexer`, `Parser`, both AST node
types). Nothing in either module is modified today — `engine/` is new
and calls both without changing either.

---

## Concept Unit: Sharing One Object, Not Copying It (A Reference Member)

### The Problem

`Executor` needs to call methods on a `Table` — the same `Table` that
`mydb.cpp`'s `main` will construct once, pointed at `school.db`. If
`Executor` stored its own separate `Table` (even one built from the
exact same filename), it would be a genuinely different object, doing
its own independent work — not obviously wrong for `Table` specifically
today, but the wrong *general* idea: `Executor` doesn't own a table, it
operates *on* one that something else is responsible for.

### Introduce the Concept in Isolation

Throwaway file, `reference_lab.cpp`:

```cpp
#include <iostream>

class Wallet {
public:
    Wallet(int startingBalance) : balance(startingBalance) {}
    void addFunds(int amount) { balance += amount; }
    int getBalance() const { return balance; }

private:
    int balance;
};

class Spender {
public:
    Spender(Wallet& wallet) : wallet(wallet) {}
    void spend(int amount) {
        wallet.addFunds(-amount);
    }

private:
    Wallet& wallet;
};

int main() {
    Wallet w(100);
    Spender s(w);
    s.spend(30);
    std::cout << "wallet balance: " << w.getBalance();
    return 0;
}
```

```
$ g++ reference_lab.cpp -o reference_lab
$ ./reference_lab
wallet balance: 70
```

`w` itself changed, from `100` to `70`, even though `s.spend(30)` was
called on `Spender`, not on `w` directly — proof `wallet` inside
`Spender` genuinely refers to the *same* `Wallet` object `main` created,
not a separate copy. If `Spender` had stored `Wallet wallet;` (no `&`),
`w.getBalance()` would still print `100` — `Spender` would have been
quietly working on its own private copy the whole time.

### Discard the Throwaway Example

`reference_lab.cpp`, `Wallet`, and `Spender` are scratch work. The real
project builds `Executor` with this exact shape, next.

### Project Change

- **Files affected:** `engine/executor.h` — new file. `engine/executor.cpp`
  — new file.
- **Change type:** create.
- **Location:** n/a — new files, and a new module, `engine/`, alongside
  `sql/` and `storage/`.
- **Dependencies:** `storage/table.h`, `sql/ast.h`.

### The New Code

```cpp
class Executor {
public:
    Executor(Table& table);

private:
    Table& table;
};
```

### The Updated Project

`engine/executor.h`, in full — new file, nothing to return to yet:

```cpp
#pragma once
#include "../storage/table.h"
#include "../sql/ast.h"

class Executor {
public:
    Executor(Table& table);
    void executeSelect(const SelectStatement& stmt);
    void executeInsert(const InsertStatement& stmt);

private:
    Table& table;
};
```

`engine/executor.cpp`, so far — just the constructor; `executeSelect`
and `executeInsert` are declared above but defined in the next unit:

```cpp
#include "executor.h"

Executor::Executor(Table& table) : table(table) {}
```

### Mechanical Walkthrough
- `Table& table;` as a private member — **first appearance** of a
  *reference member*: unlike every earlier member variable in this
  project (`Table::filename`, `Parser::pos`), this one doesn't hold its
- own value — it refers to a `Table` that belongs to someone else.
- `Executor(Table& table);` — the constructor takes a reference
  parameter, exactly like `Table::insert(const Student& s)` already did
  (Level 1 Lesson 4) — reused, not new.
- `Executor::Executor(Table& table) : table(table) {}` — reuses the
  member-initializer-list pattern (Level 1 Lesson 4), with one hard
  requirement worth naming: a reference member *must* be initialized in
- the initializer list — unlike an `int` or `std::string` member, it
  cannot be left uninitialized and assigned later in the constructor
  body, because a reference has to refer to something from the moment
  it exists; there's no such thing as a reference that doesn't yet
  point anywhere.

### CS Lens

This is **reference semantics** versus **value semantics**: whether an
object holds its own independent data, or refers to data that lives
elsewhere and is shared. Also recognized in: Python's variables, which
are *always* references to objects (there's no value-semantics option
at all in Python the way C++ offers both); a database cursor operating
on a shared connection rather than opening its own; and — worth naming
honestly — `Table` itself, as it stands today, doesn't actually *need*
to be shared this way: it holds nothing but a filename, and every
operation reopens the file fresh, so a **copy** of a `Table` would
behave identically to the original right now. Using `Table&` here isn't
fixing a bug that exists today.

### SE Lens

So why do it anyway? Because `Table` is explicitly planned to stop
being "just a filename" starting in Level 3 — pages, a free-space map,
eventually an in-memory index — real state that a copy would either
duplicate wastefully or, worse, silently diverge from the original.
Writing `Executor` against a reference *now* means it's already correct
for the `Table` Level 3 will build, without `Executor` itself needing
to change at all when that happens — the exact same "written against a
frozen interface, insulated from internal changes" property Level 1
Lesson 4 built `storage/`'s API around in the first place. The
alternative — storing `Table table;` by value, which would pass every
test in this lesson today — is a real trap: it would compile, run
correctly, and quietly stop being correct the moment `Table` gains real
internal state, with no compiler warning marking the exact day it broke.

### Commands

No new commands.

### Run It

Not runnable standalone — `Executor`'s constructor exists but its real
methods don't yet. Connects into the next unit.

### One Sentence Connecting This to What Came Before

Every class this project has built so far owned its own data;
`Executor` is the first one built specifically to act *on* someone
else's, without ever taking a copy of it.

---

## Concept Unit: From Tokens to Typed Values, and Filtering While Walking

### The Problem

`InsertStatement::values` is a `std::vector<Token>` — raw lexer output,
each value still just `{NUMBER, "1"}` or `{STRING, "Alice"}`, exactly as
Level 2 Lesson 2's SE Lens flagged and deferred: "converting to a real
number is the parser's job... or a later stage's." That later stage is
now. And `SelectStatement::hasWhere`/`where` need to actually *do*
something — right now they're just data sitting on the AST node,
never consulted by anything.

This unit is skipped for the Concept Isolation Rule's throwaway-lab
step: `std::stoi` (Level 1 Lesson 5), struct field assignment (Level 1
Lesson 2), `if`, `continue` (Level 1 Lesson 5), and `!=` (Level 1
Lesson 6) are all already fully taught. What's new is only their
composition, shown directly in the real project.

### Discard the Throwaway Example

N/A — no lab was introduced for this unit, per above.

### Project Change

- **Files affected:** `engine/executor.cpp` — modified.
- **Change type:** add.
- **Location:** `executeInsert` and `executeSelect` are added below the
  constructor from the previous unit.
- **Dependencies:** `<stdexcept>`.

### The New Code

```cpp
void Executor::executeInsert(const InsertStatement& stmt) {
    Student s;
    s.id = std::stoi(stmt.values[0].text);
    s.name = stmt.values[1].text;
    s.age = std::stoi(stmt.values[2].text);
    table.insert(s);
}
```

### The Updated Project

`engine/executor.cpp`, in full:

```cpp
#include "executor.h"
#include <iostream>
#include <stdexcept>

Executor::Executor(Table& table) : table(table) {}

void Executor::executeInsert(const InsertStatement& stmt) {          // ← new
    Student s;                                                          // ← new
    s.id = std::stoi(stmt.values[0].text);                                // ← new
    s.name = stmt.values[1].text;                                            // ← new
    s.age = std::stoi(stmt.values[2].text);                                     // ← new
    table.insert(s);                                                              // ← new
}                                                                                     // ← new

void Executor::executeSelect(const SelectStatement& stmt) {                            // ← new
    std::vector<Student> students = table.selectAll();                                   // ← new

    for (const Student& s : students) {                                                     // ← new
        if (stmt.hasWhere) {                                                                    // ← new
            if (stmt.where.column != "id") {                                                        // ← new
                throw std::runtime_error("Executor error: WHERE only supports filtering by id");        // ← new
            }                                                                                              // ← new
            int filterId = std::stoi(stmt.where.value.text);                                                  // ← new
            if (s.id != filterId) {                                                                              // ← new
                continue;                                                                                           // ← new
            }                                                                                                          // ← new
        }                                                                                                                  // ← new
        std::cout << s.id << "," << s.name << "," << s.age << "\n";                                                          // ← new
    }
}
```

`executeInsert` converts an `InsertStatement`'s three raw tokens into a
real `Student` — `stoi` for the two numeric fields, direct text for the
name — and hands it straight to `table.insert`, `storage/`'s own,
already-tested, frozen method, completely unaware it's being called
from freshly-parsed SQL rather than a hardcoded literal.
`executeSelect` reads every student back via `table.selectAll` and
prints each one, skipping any that don't match an optional `WHERE`
filter — currently limited, honestly, to filtering by `id` alone.

### Mechanical Walkthrough
- `Student s; s.id = std::stoi(stmt.values[0].text); ...` — reuses
  `struct` field assignment (Level 1 Lesson 2) and `std::stoi` (Level 1
  Lesson 5) exactly — this is the debt Level 2 Lesson 2 explicitly
  deferred, paid off here in three lines.
- `table.insert(s);` — reuses `Table::insert` (Level 1 Lesson 4/5,
- frozen since Lesson 6) — the actual moment `sql/` and `storage/`
  connect for the first time in this project's history.
- `table.selectAll()` — reuses `Table::selectAll` identically.
- `if (stmt.where.column != "id") { throw ...; }` — reuses `!=` and
- `throw`/`std::runtime_error` — an honest, explicit refusal rather
  than a silent wrong answer, the same principle Level 2 Lesson 2's
  lexer error and this project's every other `throw` has followed.
- `if (s.id != filterId) { continue; }` — reuses `continue` (Level 1
- Lesson 5) — skipping a non-matching student without an `else`
  wrapped around the print line below it.

### CS Lens

`executeInsert` and `executeSelect` are each doing **query execution**:
walking an already-built AST node and actually producing effects (a
write, or filtered reads) from it — the very last stage of the pipeline
this whole level has been building toward. Also recognized in: how a
real database engine's executor walks a query plan; an interpreter
walking a parsed expression tree to actually compute a value; and the
`continue`-based filtering here is a small, concrete instance of the
same idea a real database's query planner applies at much larger scale
when deciding which rows satisfy a `WHERE` clause.

### SE Lens

Restricting `WHERE` to `id` only, and throwing a clear, specific error
for anything else, is a deliberate choice over the alternative: silently
ignoring an unsupported column and returning every row regardless,
which would look like a filter that just happens to match everything —
a wrong answer delivered with total confidence. The real cost, named
honestly: this executor still can't filter by `name` or `age` at all,
and `stmt.where.value` is trusted to be a number without being checked
first — if it isn't, `std::stoi` itself throws a different, less clear
exception, `std::invalid_argument`, uncaught, straight past this
executor's own error handling. Confirmed concretely below.

### Commands

No new commands.

### Run It

Full pipeline, actually run, for the first time end to end:

```
$ g++ demo.cpp run_statement.cpp sql/lexer.cpp sql/parser.cpp storage/table.cpp engine/executor.cpp -o demo -Wall
$ ./demo
--- all students ---
1,Alice,20
2,Bob,22
--- where id = 1 ---
1,Alice,20
```

Two real `INSERT` statements, parsed and executed, genuinely landing in
`school.db` — then two real `SELECT`s, one unfiltered, one filtered by
`WHERE id = 1`, both correct.

And the SE Lens's honest gap, confirmed rather than just asserted —
filtering by a column other than `id` (here, `name`) crashes instead of
producing this executor's own clear error:

```
$ ./broken_where_demo
terminate called after throwing an instance of 'std::invalid_argument'
  what():  stoi
Aborted
```

This is the *current* project's real behavior for `WHERE name =
'Bob'` — this lesson's own `if (stmt.where.column != "id")` guard is
what prevents it, by rejecting the query with a clear message before
`stoi` ever gets a chance to choke on `"Bob"`. Exercise 2 below asks
you to widen this properly.

### One Sentence Connecting This to What Came Before

Every AST node built through Lesson 4 was inert — data with nowhere to
go; this unit is the first time any of it actually reached
`storage/` and changed what's on disk.

---

## Concept Unit: Deciding Which Rule Applies

### The Problem

`Executor` can run a `SelectStatement` or an `InsertStatement`, and
`Parser` can produce either — but nothing yet decides, from a raw line
of SQL text, *which one to even try*. `runStatement("INSERT INTO
students VALUES (1, 'Alice', 20);", executor)` needs to somehow know to
call `parser.parseInsert()`, not `parser.parseSelect()`, before parsing
has even started.

This unit is skipped for the Concept Isolation Rule's throwaway-lab
step: every piece (`tokens[0]`, `==`, `if`/`else if`, `throw`) is
already fully taught. The new material is purely the *idea* — deciding
which grammar rule applies from the very first token, before parsing
proper begins — shown directly below.

### Discard the Throwaway Example

N/A — no lab was introduced for this unit, per above.

### Project Change

- **Files affected:** `run_statement.h` — new file. `run_statement.cpp`
  — new file.
- **Change type:** create.
- **Location:** n/a — new files, sitting alongside `mydb.cpp` as the
  glue between `sql/` and `engine/`.
- **Dependencies:** `sql/lexer.h`, `sql/parser.h`, `engine/executor.h`.

### The New Code

```cpp
void runStatement(const std::string& sql, Executor& executor) {
    Lexer lexer;
    std::vector<Token> tokens = lexer.tokenize(sql);

    if (tokens.empty()) {
        throw std::runtime_error("Executor error: empty statement");
    }

    if (tokens[0].type == TokenType::KEYWORD && tokens[0].text == "SELECT") {
        Parser parser(tokens);
        executor.executeSelect(parser.parseSelect());
    } else if (tokens[0].type == TokenType::KEYWORD && tokens[0].text == "INSERT") {
        Parser parser(tokens);
        executor.executeInsert(parser.parseInsert());
    } else {
        throw std::runtime_error("Executor error: unrecognized statement");
    }
}
```

### The Updated Project

`run_statement.h`, in full — new file:

```cpp
#pragma once
#include <string>
#include "engine/executor.h"

void runStatement(const std::string& sql, Executor& executor);
```

`run_statement.cpp`, in full:

```cpp
#include "run_statement.h"
#include "sql/lexer.h"
#include "sql/parser.h"
#include <stdexcept>

void runStatement(const std::string& sql, Executor& executor) {
    Lexer lexer;
    std::vector<Token> tokens = lexer.tokenize(sql);

    if (tokens.empty()) {
        throw std::runtime_error("Executor error: empty statement");
    }

    if (tokens[0].type == TokenType::KEYWORD && tokens[0].text == "SELECT") {
        Parser parser(tokens);
        executor.executeSelect(parser.parseSelect());
    } else if (tokens[0].type == TokenType::KEYWORD && tokens[0].text == "INSERT") {
        Parser parser(tokens);
        executor.executeInsert(parser.parseInsert());
    } else {
        throw std::runtime_error("Executor error: unrecognized statement");
    }
}
```

`runStatement` is the single entry point tying every stage in this
level's pipeline diagram together: tokenize, inspect the very first
token to decide which grammar rule applies, construct a `Parser` and
call the matching `parse*` method, then hand the result straight to the
matching `execute*` method — one function, doing exactly what the
header diagram at the top of every lesson in this level has been
describing all along.

### Mechanical Walkthrough
- `tokens[0].type == TokenType::KEYWORD && tokens[0].text == "SELECT"`
- — reuses `&&` and `==` (Level 2 Lessons 1–2) — checking the very
  first token directly, by index, rather than through any of `Parser`'s
  own lookahead methods (`checkKeyword`, Lesson 4), since no `Parser`
  has even been constructed yet at this point — deciding *which*
  parsing rule to use has to happen *before* parsing starts.
- `else if (tokens[0].type == TokenType::KEYWORD && tokens[0].text ==
- "INSERT")` — reuses `else if` (Level 1 Lesson 6).
- `executor.executeSelect(parser.parseSelect());` — **first
  appearance** of directly nesting one function's return value straight
  into another call's argument, rather than storing it in a named
  variable first (contrast with Level 2 Lesson 3's `SelectStatement
- stmt = parser.parseSelect(); ...` in two steps) — a small stylistic
  choice, safe here because the intermediate `SelectStatement` value
  isn't needed for anything else.

### CS Lens

This is **dispatch by tag**: deciding which code path to run based on a
small, explicit marker inspected up front — here, the first token's
text — rather than through C++'s more general mechanism for this kind
of problem, **polymorphic dispatch** (a base `Statement` class with
`SelectStatement`/`InsertStatement` as subclasses, and `virtual`
methods letting the right `execute` get called automatically). Both are
real, valid designs; this project deliberately uses the simpler one.
Also recognized in: a JSON value's `"type"` field driving which parser
branch handles it; an HTTP router matching a request method before
picking a handler; and a real database's own query dispatcher deciding
`SELECT` vs. `INSERT` vs. `UPDATE` handling, often via exactly this
kind of tag check before deeper parsing begins.

### SE Lens

The alternative — a unified `Statement` base class with `virtual
execute()`, letting `runStatement` call `stmt->execute(table)` without
an `if`/`else if` chain at all — is the textbook Visitor-pattern-
adjacent design, and it scales better as the *number* of statement
kinds grows: adding a tenth statement type to an `if`/`else if` chain
means finding and extending that one long chain, while a virtual-
dispatch design would need only one new subclass. With two statement
kinds, that extra structure is real cost (a base class, virtual
functions, and the parser producing a common pointer type instead of
two distinct concrete structs) for a benefit this project doesn't need
yet. This is a genuine, revisitable tradeoff — worth reconsidering
honestly once `UPDATE`/`DELETE` (Level 2 Lesson 8) push the statement
count to four.

### Commands

No new commands.

### Run It

See this unit's own contribution folded into the previous unit's full
`./demo` run above — `runStatement` is the function that made every
one of those calls possible in the first place, dispatching each of the
four real SQL strings (two `INSERT`s, two `SELECT`s) to its correct
parse-and-execute path, plus correctly rejecting the deliberately
unsupported `"DELETE FROM students;"` with a clear, thrown error rather
than a crash or a silent no-op.

### One Sentence Connecting This to What Came Before

The previous unit made `Executor` capable of real work; this unit is
what finally lets a plain string of SQL text reach it at all, with no
manual wiring required.

---

## Closing

**Connect the pieces.** Follow `"INSERT INTO students VALUES (1,
'Alice', 20);"` through the entire pipeline diagram this lesson opened
with, for the first time genuinely start to finish: `runStatement`
tokenizes it (Level 2, Lesson 2) → inspects `tokens[0]`, sees `KEYWORD
"INSERT"`, and dispatches to the `INSERT` branch (this lesson's third
unit) → constructs a `Parser` and calls `parseInsert()` (Level 2,
Lesson 4), which returns a complete `InsertStatement` → `runStatement`
hands that straight to `executor.executeInsert(...)` → `executeInsert`
converts its three raw tokens into a real `Student` via `stoi` and
direct text (this lesson's second unit) → calls `table.insert(s)` —
`storage/`'s own frozen, tested method from Level 1 — which appends a
real line to `school.db`. Six lessons across two levels, one line of
SQL text, one new row on disk.

**What breaks without this.** Two real breakages, both confirmed
concretely during this lesson rather than just asserted: a `Table`
stored by value instead of by reference in `Executor` would pass every
test in this lesson today, and quietly stop being correct the moment
Level 3 gives `Table` real in-memory state — a bug with no clear day it
was introduced. And, confirmed directly above, removing the `if
(stmt.where.column != "id")` guard turns an unsupported `WHERE` column
from a clear, caught `Executor error` into an uncaught `std::stoi`
crash — real output, not a hypothetical, captured while this lesson was
being verified.

**Exercises.**
1. Add a test to a new `engine/executor_test.cpp` confirming that
   `WHERE name = 'Bob'` throws a *clear* `Executor error` (not a raw
   `stoi` crash) — this requires actually fixing the gap this lesson
   flagged, not just testing around it.
2. Widen `executeSelect`'s `WHERE` support to also allow filtering by
   `name` (comparing `s.name` against `stmt.where.value.text` directly,
   with no `stoi` needed) while still rejecting `age` (or anything
   else) with a clear error.
3. `runStatement`'s dispatch chain will need a third branch once
   `UPDATE`/`DELETE` parsing exists (Level 2 Lesson 8). Sketch, in
   prose, exactly what that third `else if` branch would need to check
   and call — you don't need `Parser`/`Executor` support to exist yet,
   just reason about the shape.

**Definition of done.**
- [ ] `g++ engine/executor_test.cpp engine/executor.cpp storage/table.cpp
      sql/lexer.cpp sql/parser.cpp -o executor_test -Wall` compiles and
      passes.
- [ ] `./demo` (or equivalent, via `runStatement`) correctly inserts two
      students and selects them back, both filtered and unfiltered, as
      shown in this lesson's Run It sections.
- [ ] You can explain, without rereading the SE Lens, why `Table&`
      rather than `Table` in `Executor` isn't fixing a bug that exists
      today.
- [ ] You've completed exercises 1 and 2 above — the `WHERE name = ...`
      crash from this lesson's own Run It section should no longer be
      reproducible after exercise 1.
- [ ] **Update `API_Reference.md`** — add a new `engine/` section:
      `Executor`'s constructor, `executeSelect`, `executeInsert`, and
      `runStatement`. Mark it 🟡 — `WHERE` only supports `id`, no
      `UPDATE`/`DELETE` dispatch yet.
- [ ] `git add engine/ run_statement.h run_statement.cpp
      API_Reference.md && git commit -m "Add Executor and runStatement:
      the pipeline runs end to end for the first time

      sql/ and storage/ finally call each other — real SQL text now
      writes to and reads from school.db. Executor holds Table by
      reference, not copy, anticipating Level 3's real in-memory state
      even though a copy would still work correctly today. WHERE
      filtering is deliberately restricted to id, with a clear thrown
      error otherwise — confirmed by reproducing the uncaught stoi
      crash that happens without that guard."'

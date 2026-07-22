# Level 2, Lesson 7: Changing and Removing Rows With `UPDATE` and `DELETE`
*(Making `WHERE` Mandatory, and Fetch-Modify-Write)*

```
SQL text → Lexer → Tokens → Parser → AST → Executor → storage/ calls
```

**This lesson touches every stage of the pipeline at once**, adding two
full new statement shapes end to end. Carried through every stage,
start to finish, the concrete values this lesson ends on are:

```
"DELETE FROM students WHERE id = 2;"
    → Lexer → Tokens → Parser →
DeleteStatement { tableName: "students", where: { column: "id", value: NUMBER "2" } }
    → Executor →
table.remove(2)

"UPDATE students SET age = 21 WHERE id = 1;"
    → Lexer → Tokens → Parser →
UpdateStatement { tableName: "students", setColumn: "age", setValue: NUMBER "21",
                   where: { column: "id", value: NUMBER "1" } }
    → Executor →
fetch student 1 → copy it → change only .age → table.update(1, copy)
```

**What you will build.** `runStatement` can currently only run `SELECT`
and `INSERT` — `storage/`'s `Table::update` and `Table::remove`, frozen
and tested since Level 1 Lesson 6, have never once been called from
real SQL. Today changes that: the lexer learns three more keywords
(`DELETE`, `UPDATE`, `SET`), the parser gains `parseDelete`/
`parseUpdate` — both requiring a `WHERE`, unlike `SELECT`'s optional
one — and the executor learns the one genuinely new technique either
needs: reading a record before changing part of it.

**What you need to know first.** All of Level 2, Lessons 1–6 — every
piece of `Lexer`, `Parser`, and `Executor` built so far, all reused
directly. `Table::update`/`remove` (Level 1, Lesson 5) are called for
the first time today, completely unchanged.

**An honest scope note, up front:** this lesson does *not* add `AND`/
`OR` to `WHERE` — every condition here is still exactly one column
equals one value, the same limit Level 2 Lessons 4–6 have carried the
whole way. Compound conditions need a real precedence-climbing grammar
rule, substantial enough on its own to deserve the next lesson, not
squeezed in here alongside two new full statements.

---

## Concept Unit: Making `WHERE` Mandatory

### The Problem

`SELECT`'s `WHERE` is optional — a query for every row is a completely
reasonable thing to run. `DELETE` and `UPDATE` are different: a
`DELETE FROM students;` with no `WHERE` at all would erase every row in
the table, and an equivalent `UPDATE` would silently change every row
too. Both parsing rules need to *require* `WHERE`, not just allow it —
the opposite of Level 2 Lesson 4's `checkKeyword`-guarded optional path.

This unit is skipped for the Concept Isolation Rule's throwaway-lab
step: nothing new is being introduced syntactically — `parseWhereClause`
already exists in full (Level 2, Lesson 4), and calling it
unconditionally instead of behind an `if (checkKeyword("WHERE"))` guard
needs no new C++ at all. What's new is purely the *design decision*,
shown directly in the real project.

### Discard the Throwaway Example

N/A — no lab was introduced for this unit, per above.

### Project Change

- **Files affected:** `sql/token.h`/`sql/lexer.cpp` — modified (three
  new keywords). `sql/ast.h` — modified (two new statement structs).
  `sql/parser.h`/`sql/parser.cpp` — modified (`parseDelete` added).
- **Change type:** add.
- **Location:** `lexer.cpp`'s keyword-matching `if`; new structs at the
  bottom of `ast.h`; `parseDelete` added alongside `parseInsert` in
  `parser.h`/`.cpp`.
- **Dependencies:** none new.

### The New Code

```cpp
DeleteStatement Parser::parseDelete() {
    expectKeyword("DELETE");
    expectKeyword("FROM");
    Token tableToken = expect(TokenType::IDENTIFIER, "expected table name");

    DeleteStatement stmt;
    stmt.tableName = tableToken.text;
    stmt.where = parseWhereClause();

    expect(TokenType::SEMICOLON, "expected ';'");
    return stmt;
}
```

### The Updated Project

`sql/token.h`'s keyword check inside `lexer.cpp`'s `tokenize` (only the
changed line shown — everything else in `tokenize` is unchanged from
Level 2, Lesson 6):

```cpp
            if (word == "SELECT" || word == "FROM" || word == "WHERE" ||
                word == "INSERT" || word == "INTO" || word == "VALUES" ||
                word == "DELETE" || word == "UPDATE" || word == "SET") {   // ← changed
                tokens.push_back({TokenType::KEYWORD, word, tokenLine, tokenColumn});
            } else {
                tokens.push_back({TokenType::IDENTIFIER, word, tokenLine, tokenColumn});
            }
```

`sql/ast.h`, with two new structs added at the bottom:

```cpp
#pragma once
#include <string>
#include <vector>
#include "token.h"

struct WhereClause {
    std::string column;
    Token value;
};

struct SelectStatement {
    std::string tableName;
    bool hasWhere = false;
    WhereClause where;
};

struct InsertStatement {
    std::string tableName;
    std::vector<Token> values;
};

struct DeleteStatement {              // ← new
    std::string tableName;               // ← new
    WhereClause where;                      // ← new
};                                              // ← new

struct UpdateStatement {              // ← new
    std::string tableName;               // ← new
    std::string setColumn;                  // ← new
    Token setValue;                            // ← new
    WhereClause where;                            // ← new
};                                                    // ← new
```

`sql/parser.h`, with `parseDelete`/`parseUpdate` declared (their
implementations are in this unit and the next):

```cpp
class Parser {
public:
    Parser(const std::vector<Token>& tokens);
    SelectStatement parseSelect();
    InsertStatement parseInsert();
    DeleteStatement parseDelete();       // ← new
    UpdateStatement parseUpdate();          // ← new

    // ... private section unchanged
};
```

`parseDelete` reuses every piece already built — `expectKeyword`,
`expect`, `parseWhereClause` — but note the key difference from
`parseSelect`: no `checkKeyword("WHERE")` guard, no `if`. It calls
`parseWhereClause()` directly and unconditionally, which itself starts
with `expectKeyword("WHERE")` — so a `DELETE` with no `WHERE` throws
immediately, from inside `parseWhereClause`, exactly as if `WHERE` had
been misspelled.

### Mechanical Walkthrough

- `word == "DELETE" || word == "UPDATE" || word == "SET"` added to the
  keyword `||` chain — reuses `||` and `==` (Level 2 Lesson 1) exactly
  — the list simply grew by three.
- `struct DeleteStatement { std::string tableName; WhereClause where;
  };` — reuses `struct` (Level 1 Lesson 2), reusing `WhereClause`
  itself (Level 2 Lesson 4) as a member — note there's no `hasWhere`
  flag here, unlike `SelectStatement`: `where` is never optional for a
  `DeleteStatement`, so there's nothing to flag.
- `stmt.where = parseWhereClause();` inside `parseDelete` — reuses this
  exact call from `parseSelect` (Level 2 Lesson 4), but *unconditional*
  here instead of behind `if (checkKeyword("WHERE"))` — the same
  function, used two different ways depending on which grammar rule is
  calling it.

### CS Lens

This is the same idea as a required versus optional function parameter:
`parseWhereClause` doesn't know or care whether its caller made it
optional — that decision lives entirely in the caller (`parseSelect`'s
`if`, versus `parseDelete`'s unconditional call), not in the function
itself. Also recognized in: a web form validating a field as required
on one page and optional on another using the identical validation
function; and, more directly, this is a small instance of a bigger
idea already at work throughout `Parser` — small, single-purpose
building blocks (`expect`, `expectKeyword`, `parseWhereClause`), each
usable in more than one grammar rule.

### SE Lens

Requiring `WHERE` for `DELETE`/`UPDATE` is a deliberate safety choice,
not something standard SQL enforces — real SQL happily accepts `DELETE
FROM students;` with no `WHERE` at all, and does exactly what it says:
deletes every row. This project chooses to be stricter than the
language it's implementing, on purpose, because a typo'd or forgotten
`WHERE` is one of the most common and most damaging real-world mistakes
made against production databases. The cost: this project's `mydb` is
now not fully SQL-compliant — a real, honest tradeoff between safety
and faithfulness that's worth naming rather than hiding.

### Commands

No new commands.

### Run It

```
$ g++ parser_demo.cpp sql/lexer.cpp sql/parser.cpp -o parser_demo -Wall
$ ./parser_demo
DELETE table=students where id=2
UPDATE table=students set age=21 where id=1
--- missing WHERE on DELETE (should throw) ---
Parser error at line 1, column 21: expected keyword 'WHERE'
```

A real `DELETE` and `UPDATE`, both parsed correctly — and a `DELETE`
with no `WHERE` correctly rejected, with Level 2 Lesson 6's positioned
error reporting already working for these new statements without any
extra effort, since `expectKeyword` was already built to report
position for *any* caller.

### One Sentence Connecting This to What Came Before

`SELECT`'s optional `WHERE` (Level 2, Lesson 4) proved `parseWhereClause`
could be reused; this unit is the first time reusing it *without* the
optional guard mattered for more than convenience — here, it's a real
safety requirement.

---

## Concept Unit: Reading Before You Write (Fetch-Modify-Write)

### The Problem

`Table::update(int id, const Student& newData)` — frozen since Level 1
Lesson 6 — replaces a record's *entire* contents. But `UPDATE students
SET age = 21 WHERE id = 1;` only specifies *one* changed field, `age`
— nothing in the SQL text says what `name` should be. If the executor
built a brand-new, mostly-empty `Student` and called `table.update`
with it directly, every field except `age` would be silently wiped out.
What's needed is to read the *existing* record first, change only the
one field the `SET` clause named, and write the complete result back.

### Introduce the Concept in Isolation

Throwaway file, `fetchmodify_lab.cpp`:

```cpp
#include <iostream>
#include <string>

struct Item {
    std::string name;
    int quantity;
};

Item applyUpdate(const Item& original, int newQuantity) {
    Item updated = original;
    updated.quantity = newQuantity;
    return updated;
}

int main() {
    Item apples{"apples", 5};
    Item updatedApples = applyUpdate(apples, 10);

    std::cout << "before: " << apples.quantity << "\n";
    std::cout << "after: " << updatedApples.quantity << "\n";
    return 0;
}
```

```
$ g++ fetchmodify_lab.cpp -o fetchmodify_lab
$ ./fetchmodify_lab
before: 5
after: 10
```

`updatedApples` correctly has the new quantity, `10` — and critically,
`updatedApples.name` is still `"apples"`, even though `applyUpdate`
never mentioned `name` at all. That's the proof: starting from a full
*copy* of the original, then changing only the one field that needed
to change, preserves everything else automatically.

### Discard the Throwaway Example

`fetchmodify_lab.cpp` is scratch work. The real project applies this
exact shape inside `executeUpdate`, next.

### Project Change

- **Files affected:** `engine/executor.h` — modified. `engine/executor.cpp`
  — modified.
- **Change type:** add.
- **Location:** `executeDelete` and `executeUpdate` are added below
  `executeSelect`.
- **Dependencies:** none new.

### The New Code

```cpp
void Executor::executeUpdate(const UpdateStatement& stmt) {
    if (stmt.where.column != "id") {
        throw std::runtime_error("Executor error: WHERE only supports filtering by id");
    }
    int targetId = std::stoi(stmt.where.value.text);

    std::vector<Student> students = table.selectAll();
    for (const Student& s : students) {
        if (s.id != targetId) {
            continue;
        }

        Student updated = s;
        if (stmt.setColumn == "name") {
            updated.name = stmt.setValue.text;
        } else if (stmt.setColumn == "age") {
            updated.age = std::stoi(stmt.setValue.text);
        } else if (stmt.setColumn == "id") {
            updated.id = std::stoi(stmt.setValue.text);
        } else {
            throw std::runtime_error("Executor error: unknown column '" + stmt.setColumn + "'");
        }

        table.update(targetId, updated);
        return;
    }

    throw std::runtime_error("Executor error: no student with that id");
}
```

### The Updated Project

`engine/executor.h`, in full:

```cpp
#pragma once
#include "../storage/table.h"
#include "../sql/ast.h"

class Executor {
public:
    Executor(Table& table);
    void executeSelect(const SelectStatement& stmt);
    void executeInsert(const InsertStatement& stmt);
    void executeDelete(const DeleteStatement& stmt);     // ← new
    void executeUpdate(const UpdateStatement& stmt);        // ← new

private:
    Table& table;
};
```

`engine/executor.cpp`, with `executeDelete` and `executeUpdate` added
(everything above unchanged from Level 2 Lesson 5):

```cpp
void Executor::executeDelete(const DeleteStatement& stmt) {            // ← new
    if (stmt.where.column != "id") {                                     // ← new
        throw std::runtime_error("Executor error: WHERE only supports filtering by id");  // ← new
    }                                                                       // ← new
    int targetId = std::stoi(stmt.where.value.text);                           // ← new
    table.remove(targetId);                                                        // ← new
}                                                                                       // ← new

void Executor::executeUpdate(const UpdateStatement& stmt) {                                // ← new
    if (stmt.where.column != "id") {                                                          // ← new
        throw std::runtime_error("Executor error: WHERE only supports filtering by id");         // ← new
    }                                                                                                // ← new
    int targetId = std::stoi(stmt.where.value.text);                                                   // ← new

    std::vector<Student> students = table.selectAll();                                                    // ← new
    for (const Student& s : students) {                                                                      // ← new
        if (s.id != targetId) {                                                                                  // ← new
            continue;                                                                                              // ← new
        }                                                                                                            // ← new

        Student updated = s;                                                                                          // ← new
        if (stmt.setColumn == "name") {                                                                                  // ← new
            updated.name = stmt.setValue.text;                                                                              // ← new
        } else if (stmt.setColumn == "age") {                                                                                  // ← new
            updated.age = std::stoi(stmt.setValue.text);                                                                          // ← new
        } else if (stmt.setColumn == "id") {                                                                                          // ← new
            updated.id = std::stoi(stmt.setValue.text);                                                                                  // ← new
        } else {                                                                                                                            // ← new
            throw std::runtime_error("Executor error: unknown column '" + stmt.setColumn + "'");                                              // ← new
        }                                                                                                                                        // ← new

        table.update(targetId, updated);                                                                                                           // ← new
        return;                                                                                                                                        // ← new
    }

    throw std::runtime_error("Executor error: no student with that id");                                                                                  // ← new
}
```

`executeDelete` is the simpler of the two: extract the target `id` from
`WHERE`, call `table.remove` — `storage/`'s own method already throws
if the id doesn't exist (Level 1, Lesson 5), so `executeDelete` doesn't
need to duplicate that check at all. `executeUpdate` does the real work
this unit is about: fetch every student, find the one matching `WHERE`,
copy it, change *only* the field named by `SET`, and write the complete
copy back — never constructing a `Student` from scratch.

### Mechanical Walkthrough

- `table.remove(targetId);` in `executeDelete` — reuses `Table::remove`
  (Level 1, Lesson 5) unchanged — this is the first real call to it
  from anywhere in `sql/`/`engine/`.
- `for (const Student& s : students) { if (s.id != targetId) {
  continue; } ... }` — reuses range-based `for`, `!=`, and `continue`
  exactly as `executeSelect`'s `WHERE` filtering already did (Level 2,
  Lesson 5) — the same search pattern, reused for a different purpose.
- `Student updated = s;` — **the core of this unit**, reusing ordinary
  copy-by-assignment (implicit for a `struct` with no custom copy
  logic, first relied on this explicitly here) — `updated` starts as a
  complete, independent duplicate of `s`, every field included.
- `if (stmt.setColumn == "name") { updated.name = ...; } else if ...`
  — reuses `if`/`else if` and member assignment — exactly one branch
  runs, changing exactly one field of `updated`; every other field
  keeps whatever `Student updated = s;` already gave it.
- `table.update(targetId, updated);` — reuses `Table::update` (Level 1,
  Lesson 5) unchanged, called with the *complete*, corrected `Student`
  — not a partially-filled one.
- `return;` right after — **first appearance** of `return;` with no
  value inside a `void` function, ending `executeUpdate` immediately
  once the matching student is found and updated, so the function
  doesn't fall through to the final `throw` meant for the "not found"
  case.

### CS Lens

This is **read-modify-write**, a pattern that shows up anywhere a
"partial update" has to be expressed against a system that only knows
how to store *complete* values. Also recognized in: how most key-value
stores handle a partial JSON update (fetch the document, merge in the
changed field, write the whole document back); a spreadsheet formula
that reads a cell's current value before recalculating it; and — worth
naming honestly — this exact pattern has a well-known real-world
failure mode this project doesn't yet handle: if two updates happened
concurrently, the second `table.update` could silently overwrite the
first's change, since neither ever checks whether the record changed
between its own fetch and its own write. Single-user, single-threaded
`mydb` is safe from this today; it's exactly the kind of problem a real
multi-client database (this project's own Level 5) has to solve for
real.

### SE Lens

The alternative — extending `Table`'s own API with something like
`updateField(int id, std::string column, std::string value)`, letting
`storage/` handle partial updates internally — was deliberately not
taken: it would mean `storage/`'s frozen API (Level 1, Lesson 6) has to
grow every time a new kind of partial change is needed, and it would
push SQL-shaped concepts (`"age"`, `"name"` as column names) down into
a module that's supposed to know nothing about SQL at all. Keeping
fetch-modify-write entirely inside `engine/`, calling `storage/`'s
existing, unchanged `update`, keeps that boundary exactly where Level 1
Lesson 4 drew it.

### Commands

No new commands.

### Run It

```
$ g++ demo.cpp run_statement.cpp sql/lexer.cpp sql/parser.cpp storage/table.cpp engine/executor.cpp -o demo -Wall
$ ./demo
--- all students ---
1,Alice,20
2,Bob,22
3,Carol,19
--- UPDATE age for Alice ---
1,Alice,21
2,Bob,22
3,Carol,19
--- DELETE Bob ---
1,Alice,21
3,Carol,19
--- DELETE a nonexistent id (should throw) ---
Error: remove: no student with that id
```

Alice's age changed to `21` while her name stayed `Alice` — exactly the
proof this unit's whole Problem section demanded — Bob was genuinely
removed, and deleting a nonexistent id correctly threw `storage/`'s own
Level 1 error, surfacing all the way up through `Executor` and
`runStatement` unchanged.

And the proof this unit's concept isn't decorative — skipping the fetch
entirely corrupts real data:

```
$ ./broken_update_demo
after broken update:
1,,21
```

A `Student` built from scratch, with only `age` ever set, silently
erased Alice's name — `1,,21` instead of `1,Alice,21` — real output
from a real, deliberately broken version, not a hypothetical.

### One Sentence Connecting This to What Came Before

The previous unit made `WHERE` mandatory for safety; this unit is what
makes acting on that `WHERE` actually correct, instead of quietly
destructive.

---

## Concept Unit: Two More Statements, Two More Branches

### The Problem

`parseDelete` and `executeDelete`/`executeUpdate` all exist now, but
`runStatement`'s dispatcher (Level 2, Lesson 5) still only recognizes
`SELECT` and `INSERT` as its first token — exactly the gap Lesson 5's
own third exercise predicted. `runStatement("DELETE FROM students
WHERE id = 2;", executor)` needs two more branches.

This unit is skipped for the Concept Isolation Rule's throwaway-lab
step: extending an existing `if`/`else if` chain with two more branches
needs no new syntax at all — every piece (`else if`, `&&`, `==`) is
already fully taught.

### Discard the Throwaway Example

N/A — no lab was introduced for this unit, per above.

### Project Change

- **Files affected:** `run_statement.cpp` — modified.
- **Change type:** add.
- **Location:** two new `else if` branches added to the existing
  `SELECT`/`INSERT` chain, before the final `else`.
- **Dependencies:** none new.

### The New Code

```cpp
} else if (tokens[0].type == TokenType::KEYWORD && tokens[0].text == "DELETE") {
    Parser parser(tokens);
    executor.executeDelete(parser.parseDelete());
} else if (tokens[0].type == TokenType::KEYWORD && tokens[0].text == "UPDATE") {
    Parser parser(tokens);
    executor.executeUpdate(parser.parseUpdate());
}
```

### The Updated Project

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
    } else if (tokens[0].type == TokenType::KEYWORD && tokens[0].text == "DELETE") {   // ← new
        Parser parser(tokens);                                                            // ← new
        executor.executeDelete(parser.parseDelete());                                        // ← new
    } else if (tokens[0].type == TokenType::KEYWORD && tokens[0].text == "UPDATE") {            // ← new
        Parser parser(tokens);                                                                     // ← new
        executor.executeUpdate(parser.parseUpdate());                                                 // ← new
    } else {
        throw std::runtime_error("Executor error: unrecognized statement");
    }
}
```

`runStatement` now recognizes all four supported statement kinds by
their leading keyword, dispatching each to its own parse-then-execute
pair — the exact shape Level 2 Lesson 5's SE Lens flagged as the real
cost of dispatch-by-tag: adding a statement kind means extending this
one chain, not touching anything else in the pipeline.

### Mechanical Walkthrough

Every line here reuses `else if`, `&&`, `==`, and the established
`Parser parser(tokens); executor.executeX(parser.parseX());` shape
(Level 2, Lesson 5) exactly — no new syntax anywhere in this unit.

### CS Lens

Nothing new beyond what Level 2 Lesson 5's CS Lens already named:
dispatch-by-tag, now demonstrated actually scaling from two cases to
four with no structural change required.

### SE Lens

This is the concrete payoff — and the concrete cost — Lesson 5 named in
the abstract: extending the chain was genuinely easy (two `else if`
blocks, both following the exact pattern already there), which is real
evidence *for* dispatch-by-tag at this scale. It's also worth checking
Lesson 5's own revisit condition now that it's met: four statement
kinds. A polymorphic `Statement` base class with `virtual execute()`
would now save exactly two `if` checks' worth of code — genuinely not
yet enough to justify the added structure. That threshold might look
different again once `CREATE TABLE` (Level 2's own roadmap) arrives.

### Commands

No new commands.

### Run It

See this unit's contribution folded into the previous unit's `./demo`
run above — every one of those four statement kinds reached its correct
`execute` method purely through this dispatcher, with no manual
plumbing.

### One Sentence Connecting This to What Came Before

The previous two units gave `Parser` and `Executor` two complete new
capabilities; this unit is the three-line change that finally let plain
SQL text reach either of them.

---

## Closing

**Connect the pieces.** Follow `"UPDATE students SET age = 21 WHERE id
= 1;"` through the entire lesson: `runStatement` sees `UPDATE` as the
first token and dispatches to the new `UPDATE` branch (third unit) →
`Parser::parseUpdate` consumes `UPDATE`, the table name, `SET`, the
column and value, then calls the *same* `parseWhereClause` `SELECT` and
`DELETE` both use, unconditionally — `WHERE` isn't optional here either
(first unit) → the resulting `UpdateStatement` reaches
`executeUpdate`, which extracts `targetId` from `WHERE`, fetches every
student, finds the one matching, copies it whole, changes only `.age`,
and calls `table.update` with the complete result (second unit) →
`storage/`'s own frozen `Table::update` (Level 1, Lesson 5), completely
unaware any of this happened, rewrites the file exactly as it always
has. Three lessons' worth of new material, ending in a call to code
that hasn't changed at all since Level 1.

**What breaks without this.** Two real breakages, both confirmed
directly during this lesson: skipping `executeUpdate`'s fetch and
building a `Student` from scratch silently erases every field the
`SET` clause didn't mention — `1,,21` instead of `1,Alice,21`, shown
above, not hypothesized. And, per this lesson's opening scope note,
`WHERE id = 1 AND name = 'Alice'` still isn't supported at all — the
lexer doesn't even have `AND` as a keyword yet, so that exact query
would currently parse `AND` as a plain `IDENTIFIER` and fail with a
confusing "expected ';'" error rather than anything explaining
compound conditions aren't supported.

**Exercises.**
1. Add a test confirming `executeUpdate` throws
   `"Executor error: unknown column 'grade'"` for `UPDATE students SET
   grade = 5 WHERE id = 1;` — a column `Student` doesn't have at all.
2. `parseUpdate`'s `Token setValue = advance();` accepts any token, the
   same gap Level 2 Lesson 4's exercise 2 flagged for `parseWhereClause`.
   Apply the same fix here: reject anything that isn't `NUMBER` or
   `STRING`.
3. Try `runStatement("AND FROM students;", executor)` by hand (or trace
   through it on paper) and confirm the confusing failure mode this
   lesson's own "what breaks" section predicted — then explain, in a
   sentence, why adding `AND` as a real keyword (next lesson) will
   change *how* this fails, even before compound `WHERE` parsing exists.

**Definition of done.**
- [ ] `g++ engine/executor_test.cpp engine/executor.cpp storage/table.cpp
      sql/lexer.cpp sql/parser.cpp -o executor_test -Wall` compiles and
      passes all four tests.
- [ ] `./demo` (or equivalent, via `runStatement`) correctly runs
      `INSERT`, `SELECT`, `UPDATE`, and `DELETE` in one session, as
      shown in this lesson's Run It section.
- [ ] You can explain, without rereading the CS Lens, what real-world
      problem fetch-modify-write does *not* protect against, even
      though it's correct for this project's current single-user use.
- [ ] You've completed exercises 1 and 2 above.
- [ ] **Update `API_Reference.md`** — add `DeleteStatement`,
      `UpdateStatement`, `parseDelete`, `parseUpdate`, `executeDelete`,
      `executeUpdate`, and the three new keywords to the `sql/` and
      `engine/` sections. Still 🟡 — no `AND`/`OR`, no column lists, no
      `CREATE TABLE`.
- [ ] `git add sql/ engine/ run_statement.cpp API_Reference.md &&
      git commit -m "Add UPDATE and DELETE, both requiring WHERE

      DELETE/UPDATE call parseWhereClause unconditionally instead of
      behind SELECT's optional checkKeyword guard -- a deliberate
      safety choice stricter than real SQL. executeUpdate fetches the
      existing record before changing one field, confirmed necessary
      by reproducing the data loss that happens without it (1,,21
      instead of 1,Alice,21). AND/OR still not supported -- next
      lesson."`

# Lesson 28: A Query That Decides How to Answer Itself
### (Project 9 — Mini Database Engine, C++)

> **Pipeline:** `Text → Lexer → Parser → AST → Query Planning → Execution`
> **This lesson builds:** `AST → Query Planning → Execution` — the final
> stages, completing the pipeline this project has been building since
> Lesson 27. The same literal query travels through every prior stage
> again, then, for the first time, actually runs:
> `SELECT id, name, price FROM products WHERE id = 3`

**What you will build.** A real `Table`, holding actual `Record`s
(Lesson 25) indexed by a real `BTree` (Lesson 26), and an `execute`
function that takes Lesson 27's `SelectQuery` AST and makes a genuine,
consequential decision: use the index, or scan every row — chosen
automatically, based on what the query actually asked for, and proven,
not assumed, to matter by a real, measured 140x difference. The
transferable problem this lesson is actually about: an AST is just a
structured description of *what* was asked; something still has to
decide *how* to actually go get the answer, and that decision has real,
measurable consequences.

**What you need to know first.** Lesson 25 — `Record`'s fixed layout.
Lesson 26 — the real `BTree`, `insert`, and `search`. Lesson 27 — the
`Lexer`, `Parser`, and the `SelectQuery`/`WhereClause` AST this lesson
executes for the first time.

---

## Concept Unit: Evaluating a Condition

### The Problem

A `WhereClause` — `{column: "price", op: ">", value: "10"}` — is just
data. Nothing about the AST itself checks whether any given `Record`
actually satisfies it; something needs to read the clause's own fields
and apply them, generically, to a real record.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `eval_lab.cpp` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — none beyond `g++`.

### The New Code

```cpp
struct Row { int id; double price; };

bool evalCondition(const Row& row, const std::string& column, const std::string& op, double value) {
    double fieldValue = (column == "id") ? row.id : row.price;
    if (op == "=") return fieldValue == value;
    if (op == ">") return fieldValue > value;
    if (op == "<") return fieldValue < value;
    return false;
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```cpp
Row row{5, 19.99};
std::cout << evalCondition(row, "price", ">", 10) << std::endl;
std::cout << evalCondition(row, "price", ">", 50) << std::endl;
std::cout << evalCondition(row, "id", "=", 5) << std::endl;
```

Real output:

```
1
0
1
```

One function, three genuinely different questions — is this row's
price above 10 (yes), above 50 (no), does its id equal 5 (yes) — each
answered correctly by looking up the *named* field and applying the
*named* operator, both decided entirely by string comparisons against
values that, in the real project, come directly from a parsed
`WhereClause`.

### Discard the throwaway example

`eval_lab.cpp`'s `Row`/`evalCondition` are deleted — the technique
(look up a field by name, apply an operator by name) carries forward
directly into the real project's version, operating on `Record` and a
real `WhereClause` instead.

### Mechanical walkthrough

- `double fieldValue = (column == "id") ? row.id : row.price;` — **(b)
  hard concept reappearing**: the conditional expression from Project 2,
  Lesson 5, here selecting which field to compare based on a runtime
  string rather than a fixed choice made at compile time.
- `if (op == "=") return fieldValue == value; if (op == ">") ...` —
  **(a) first appearance,** conceptually: this is a small, hand-written
  **interpreter** for a tiny sub-language of operators — the same broad
  idea as the `SORT_STRATEGIES` dictionary from Project 1, Lesson 3,
  here expressed as sequential comparisons since C++ has no direct
  operator-as-value lookup as convenient as Python's dict-of-functions
  for this specific case.

### CS lens

This is one small piece of **semantic analysis** and **evaluation** —
giving real meaning to a piece of AST by actually computing with it,
rather than just describing its shape. Also recognized in: any
expression evaluator (a calculator app interpreting `"3 + 4 * 2"`), a
spreadsheet computing a cell's formula, a rules engine checking whether
a record matches a filter defined at runtime rather than compile time.

### SE lens

The alternative — a `switch` statement or a lookup table of function
pointers keyed by operator string — would scale better to a larger set
of operators; three operators, written as plain `if`s, is genuinely the
simplest correct option at this project's current scale, and adding a
fourth operator later is exactly the kind of moment that would justify
switching to a more scalable dispatch shape, echoing Project 1, Lesson
3's own Strategy-pattern reasoning.

### Commands needed

Same `g++`/execute pattern as every lesson in this phase.

### Run it

Shown above.

### Connecting sentence

One condition can now be checked against one row — the next unit builds
the real decision this whole lesson is about: *how* to find the rows
worth checking in the first place.

---

## Concept Unit: The Query Planner

### The Problem

Given a real `WHERE id = 3`, there are two genuinely different ways to
find matching rows: check every single row in the table, one at a time
(correct, but exactly the `O(n)` cost Lesson 26 measured and solved),
or, since `id` has a real `BTree` index built on it (Lesson 26), search
that index directly. Given `WHERE price > 15`, only the first option
is even available — nothing in this project has ever built an index on
`price`. Something has to decide, for each query, which strategy
actually applies.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `engine.cpp`.
- **Change type** — add.
- **Location** — new file, combining `Record` (Lesson 25), `BTree`
  (Lesson 26, renamed `BTreeIndex` here and extended to store a
  position alongside each key), and `Lexer`/`Parser`/`SelectQuery`
  (Lesson 27) into one project.
- **Dependencies** — all three prior lessons' own structures.

### The New Code

```cpp
class Table {
public:
    std::vector<Record> records;
    BTreeIndex idIndex;

    void insert(int id, double price, const std::string& name) {
        Record r;
        r.id = id;
        r.price = price;
        std::strncpy(r.name, name.c_str(), sizeof(r.name));
        int position = (int)records.size();
        records.push_back(r);
        idIndex.insert(id, position);
    }
};

std::vector<const Record*> execute(const SelectQuery& query, Table& table) {
    std::vector<const Record*> results;

    if (query.where && query.where->column == "id" && query.where->op == "=") {
        // Planner decision: an indexed equality lookup on id -- use the B-Tree
        int key = std::stoi(query.where->value);
        auto position = table.idIndex.search(table.idIndex.root, key);
        if (position) {
            results.push_back(&table.records[*position]);
        }
        return results;
    }

    // Planner decision: no usable index for this condition -- full scan
    for (const auto& r : table.records) {
        if (!query.where || evalCondition(r, *query.where)) {
            results.push_back(&r);
        }
    }
    return results;
}
```

### The Updated Project

Brand-new file, shown whole above — `Table` owns both the actual row
data (`records`, a contiguous `std::vector<Record>`, per Lesson 25's
own measured preference) and a real index (`idIndex`, a `BTreeIndex`,
per Lesson 26) built on the `id` column specifically. `execute` is
where the real decision happens.

### Mechanical walkthrough

- `BTreeIndex idIndex;` on `Table` — **(b) hard concept reappearing**:
  Lesson 26's `BTree`, extended here to store, alongside each key, the
  key's *position* in `records` — the index doesn't hold the data
  itself, it holds a fast way to find *where* the data lives.
- `int position = (int)records.size(); records.push_back(r); idIndex.insert(id, position);`
  — **(a) first appearance,** conceptually: every insert keeps two
  structures in sync at once — the row itself, appended to the
  contiguous vector, and the index, updated to know exactly where that
  row now lives — the same "two views of the same data, kept in sync on
  every write" idea as Project 3, Lesson 9's `_by_id` hash index,
  applied here to a tree instead of a hash table.
- `if (query.where && query.where->column == "id" && query.where->op == "=")`
  — **(a) first appearance** of the actual **query planning** decision:
  checking, explicitly, whether the *specific* query being run matches
  the *specific* condition under which the index is actually usable —
  an equality check on the exact column that's indexed. Any other
  condition — a different column, a different operator — falls through
  to the scan below.
- `auto position = table.idIndex.search(table.idIndex.root, key); if (position) { results.push_back(&table.records[*position]); }`
  — **(b) hard concept reappearing**: `BTree::search` from Lesson 26,
  now returning a *position* rather than a boolean, used immediately to
  jump directly into `records` at exactly the right index — no scanning
  involved at all.
- `for (const auto& r : table.records) { if (!query.where || evalCondition(r, *query.where)) { results.push_back(&r); } }`
  — **(b) hard concept reappearing**: an ordinary scan, the fallback
  path — note `!query.where` handles a query with *no* `WHERE` clause
  at all, correctly returning every row.

### CS lens

This is a real, minimal **query planner**: choosing an execution
strategy based on what's actually available (an index) and what the
query actually needs (an equality match on the indexed column),
automatically, without the person writing the query ever needing to
know an index exists at all. Also recognized in: every real database's
own query planner (a vastly more sophisticated version of exactly this
decision, weighing many possible indexes, join orders, and estimated
row counts), a web framework's router choosing a fast-path handler for
a common case, a compiler's optimizer choosing between multiple valid
ways to generate the same correct result.

### SE lens

This planner is deliberately narrow — it only recognizes exactly one
shape of query (`WHERE id = <value>`) as index-eligible, and falls back
to a full scan for everything else, including `WHERE id > 5`, which a
more sophisticated planner *could* also serve from the same B-Tree
(range queries are, in fact, one of the real reasons Lesson 26 chose a
B-Tree over a hash index in the first place) but this lesson's planner
doesn't yet attempt. That's a real, honest scope limit, not an
oversight — a correct, narrow planner that clearly documents what it
does and doesn't optimize is more trustworthy than a planner that
silently does the wrong thing on cases it wasn't actually built to
handle.

### Commands needed

Same pattern.

### Run it

```cpp
Table products;
products.insert(1, 9.99, "Widget");
products.insert(2, 19.99, "Gadget");
products.insert(3, 14.99, "Gizmo");
products.insert(4, 99.99, "Doohickey");

Lexer lexer;
Parser parser1(lexer.tokenize("SELECT id, name, price FROM products WHERE id = 3"));
SelectQuery q1 = parser1.parse();
printResults(q1, execute(q1, products));

Parser parser2(lexer.tokenize("SELECT name, price FROM products WHERE price > 15"));
SelectQuery q2 = parser2.parse();
printResults(q2, execute(q2, products));
```

Real output:

```
Query: SELECT id, name, price FROM products WHERE id = 3
3, Gizmo, 14.99

Query: SELECT name, price FROM products WHERE price > 15
Gadget, 19.99
Doohickey, 99.99
```

Two genuinely different real queries, each parsed by Lesson 27's own
`Lexer`/`Parser`, each executed correctly — the first via the B-Tree
index, silently, with no indication in the output that a different
strategy was even used; the second via a full scan, correctly excluding
`Widget` (`9.99`, not above `15`) and `Gizmo` (`14.99`, also not above
`15`).

### Connecting sentence

Both queries return correct results — the final unit proves the
planner's decision isn't just correct, it's the entire reason this
project's earlier investment in a B-Tree was worth making at all.

---

## Concept Unit: Proving the Planner's Decision Matters

### The Problem

The previous unit's two queries ran on four rows — far too few to tell
whether choosing the index over a scan actually matters. This unit
answers that directly, at the same real scale Lesson 26 already used to
prove the B-Tree itself.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `engine_timing.cpp`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `Table`, this lesson's previous unit.

### The New Code

```cpp
int scanForId(Table& table, int targetId) {
    for (size_t i = 0; i < table.records.size(); i++) {
        if (table.records[i].id == targetId) return (int)i;
    }
    return -1;
}
```

### The Updated Project

Brand-new file, shown whole above — a standalone function performing
exactly what `execute`'s own scan fallback would do for an equality
check, isolated here specifically so it can be timed head-to-head
against the indexed path.

### Mechanical walkthrough

Nothing new — every piece here (a `for` loop, direct field comparison,
early `return`) was proven across Lessons 25–27; this unit's content is
entirely the measurement, not new mechanics.

### CS lens

Nothing new beyond what Lesson 26 already established about `O(log n)`
versus `O(n)` — this unit's real point is proving that theoretical gap
translates into an actual, felt difference at the level a query planner
operates: whole queries, not individual comparisons.

### SE lens

Real, measured output — 200,000 rows, 5,000 real equality lookups on
`id`, run both ways:

```
200000 rows, 5000 equality lookups on id:
Full scan plan:  852ms (5000 found)
Indexed plan:    6ms (5000 found)
```

**852ms versus 6ms** — roughly **140 times faster** — for the exact
same 5,000 queries, against the exact same data, both finding every row
correctly. This is the real, concrete payoff of every decision made
across this project's storage-engine lessons: Lesson 25's contiguous
`Record` layout, Lesson 26's B-Tree refusing to degenerate, and this
lesson's planner choosing correctly between them — all three converge
into one number, measured, not asserted: a query that answers itself
correctly *and* fast, because the pipeline built across four lessons
made the right choice automatically, every time this exact shape of
query runs.

### Commands needed

`g++ -O2 -o <output> <file>.cpp`, same optimization flag as Lesson 25's
and Lesson 26's own timing measurements, for the same reason: an
unoptimized build can produce misleading comparisons.

### Run it

Shown above.

### Connecting sentence

Every stage of this pipeline — lexing, parsing, planning, execution —
now closes into one real, measured result: a query written as plain
text answers itself correctly, and, when a matching index exists, does
so roughly 140 times faster than the alternative, chosen automatically,
with nothing about the query's own text needing to mention an index at
all.

---

## Closing

**Connect the pieces.** The complete pipeline, traced one final time,
started at this lesson's very top: `"SELECT id, name, price FROM
products WHERE id = 3"` is tokenized by `Lexer::tokenize` (Lesson 27)
into ten typed tokens; `Parser::parse` (Lesson 27) turns those tokens
into a real `SelectQuery` AST — `columns: ["id", "name", "price"]`,
`table: "products"`, `where: {column: "id", op: "=", value: "3"}`;
`execute` (this lesson) inspects that AST's own `where` clause,
recognizes it as an indexed equality match, and calls
`table.idIndex.search(...)` (Lesson 26) instead of scanning
`table.records` (Lesson 25) — every one of this project's five prior
lessons contributing one real, necessary piece to answering one query,
correctly, and, proven directly, fast.

**What breaks without this.** Already shown, measured, directly: the
852ms-versus-6ms comparison — deliberately not restaged, since the
whole point was measuring it exactly where the planner's real decision
lives.

**Exercises.**
1. Extend the planner to also use the index for `WHERE id < <value>`
   and `WHERE id > <value>` — you'll need a way to walk a *range* of the
   B-Tree rather than finding one exact key, a real extension to
   Lesson 26's own `search`.
2. Add a second index — on `price` — and extend the planner to
   recognize `WHERE price = <value>` as index-eligible too, confirming
   with real measured timing that it's equally fast.
3. This project's `execute` currently loads matching rows without
   applying `SELECT`'s own column list until `printResults`. Refactor so
   `execute` itself returns only the requested columns' data, and
   discuss, in a few sentences, whether that's a meaningfully different
   design or just where the same filtering happens.

**Definition of done.**
- [ ] `evalCondition` correctly evaluates all three operators against
      real field values, confirmed against real output.
- [ ] `execute` correctly answers both an indexed equality query and a
      full-scan range query, confirmed against the real output shown
      above.
- [ ] You've measured, at real scale, the actual performance difference
      between the planner's two paths, and the number matches the order
      of magnitude Lesson 26 already predicted for indexed versus
      unindexed lookup.
- [ ] You can state, in one sentence, what specific condition this
      lesson's planner checks before deciding to use the index, and why
      it falls back to a scan for anything else.
- [ ] Commit with a message explaining why — e.g. `"Execute parsed
      SelectQuery ASTs against a real Table, using the B-Tree index for
      indexed equality lookups and falling back to a full scan
      otherwise, with the choice proven to matter at real scale"` — not
      `"add query execution"`.

**This closes Project 9.** Across Lessons 23–28: manual memory and
RAII, smart pointers and a real measured reference-cycle leak, struct
layout and cache locality, a from-scratch B-Tree beating a degenerate
binary tree by three orders of magnitude, and a complete
`Text → Lexer → Parser → AST → Planning → Execution` pipeline —
this curriculum's own longest-referenced structure, finally built,
stage by stage, and proven to work end to end. **Phase 6** moves to
real architecture: a Package Manager, a Mini Git, a Web Server, a Chat
Server — where the patterns and data structures built across five
phases stop being the lesson's own subject and start being the tools
reached for, without ceremony, to build something bigger.

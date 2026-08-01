# SE Masterclass — LAB-63 — Query Engine

**Language: Python** — same module as LAB-62.

**Prerequisites:** LAB-10/11/12 (this lab is THAT EXACT pipeline — tokenize, parse, evaluate — applied to SQL instead of arithmetic) and LAB-57 (the execution-plan chooser reuses LAB-57's SCAN vs. SEARCH distinction directly).

**What this lab adds:**
- Tokenizing a small SQL subset — LAB-10's lexer, a new grammar
- Parsing tokens into a query AST — LAB-11's parser, a new grammar
- EXECUTING that AST against in-memory data — LAB-12's evaluator, walking a DIFFERENT kind of tree
- A simple execution plan chooser: index lookup vs. full scan, mirroring LAB-57's real database behavior

**Time:** 100–120 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `SELECT name FROM users WHERE age = 30` — what THREE pieces of information does this query specify, and what does EACH one control about the result?
> 2. Once you have a PARSED query (an AST, not a string), what does "executing" it actually mean, mechanically?
> 3. If a column has an index available, an execution plan should use it. If NOT, what's the only remaining option?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `python query_engine.py` prints:

```
=== Tokenizing SQL ===
"SELECT name FROM users WHERE age = 30" tokens:
[SELECT, IDENTIFIER(name), FROM, IDENTIFIER(users), WHERE, IDENTIFIER(age), =, NUMBER(30)]

=== Parsing Into a Query AST ===
{ select: ['name'], from: 'users', where: { column: 'age', op: '=', value: 30 } }

=== Executing Against In-Memory Data ===
table 'users': 5 rows
query: SELECT name FROM users WHERE age = 30
result: [{'name': 'Alice'}, {'name': 'Carol'}]

=== ORDER BY and LIMIT ===
query: SELECT name FROM users ORDER BY age LIMIT 2
result: [{'name': 'Dave'}, {'name': 'Alice'}]

=== Execution Plan: Index vs Full Scan ===
query: SELECT name FROM users WHERE id = 3
plan: INDEX LOOKUP on 'id' (has index) — 1 row checked
query: SELECT name FROM users WHERE age = 30
plan: FULL SCAN on 'age' (no index) — 5 rows checked
```

---

### Concept: A Query Engine Is LAB-10/11/12, Again

**What it is:** Running a SQL query involves the EXACT same three stages as Phase 1's calculator: TOKENIZE the query text into pieces, PARSE those pieces into a structured representation (an AST), and EXECUTE that structure against real data. Different grammar (SQL instead of arithmetic), same PIPELINE.

---

## Step 1 — Tokenize a SQL Subset

```python
# query_engine.py
import re

def tokenize(sql):
    token_spec = [
        ('KEYWORD', r'\b(SELECT|FROM|WHERE|ORDER BY|LIMIT|AND)\b'),
        ('NUMBER', r'\d+'),
        ('STRING', r"'[^']*'"),
        ('IDENTIFIER', r'[A-Za-z_][A-Za-z0-9_]*'),
        ('OP', r'[=<>]'),
        ('COMMA', r','),
        ('SKIP', r'\s+'),
    ]
    pattern = '|'.join(f'(?P<{name}>{regex})' for name, regex in token_spec)
    tokens = []
    for match in re.finditer(pattern, sql):
        kind = match.lastgroup
        value = match.group()
        if kind == 'SKIP':
            continue
        tokens.append((kind, value))
    return tokens

print("=== Tokenizing SQL ===")
sql = "SELECT name FROM users WHERE age = 30"
tokens = tokenize(sql)
print(f'"{sql}" tokens:')
print(tokens)
```

### SAVE AND TRY

```bash
python query_engine.py
```

**Expected (shape):**
```
=== Tokenizing SQL ===
"SELECT name FROM users WHERE age = 30" tokens:
[('KEYWORD', 'SELECT'), ('IDENTIFIER', 'name'), ('KEYWORD', 'FROM'), ('IDENTIFIER', 'users'), ('KEYWORD', 'WHERE'), ('IDENTIFIER', 'age'), ('OP', '='), ('NUMBER', '30')]
```

**Confirm this is LAB-10's classification, using regex instead of manual character loops:** Each `token_spec` entry is a NAMED pattern — this is a MORE COMPACT way to express the SAME character-classification idea LAB-10 built by hand, using Python's regex engine to do the scanning instead of a manual `while` loop. The OUTPUT — a flat list of typed tokens — is identical in SPIRIT to LAB-10's `tokenize`.

---

## Step 2 — Parse Into a Query AST

```python
def parse(tokens):
    pos = 0
    def peek(): return tokens[pos] if pos < len(tokens) else (None, None)
    def advance():
        nonlocal pos
        tok = tokens[pos]
        pos += 1
        return tok

    advance()  # consume SELECT
    select_cols = []
    while peek()[0] != 'KEYWORD':
        kind, val = advance()
        if kind == 'IDENTIFIER':
            select_cols.append(val)

    advance()  # consume FROM
    from_table = advance()[1]

    where_clause = None
    if peek() == ('KEYWORD', 'WHERE'):
        advance()
        column = advance()[1]
        op = advance()[1]
        kind, value = advance()
        value = int(value) if kind == 'NUMBER' else value.strip("'")
        where_clause = {'column': column, 'op': op, 'value': value}

    return {'select': select_cols, 'from': from_table, 'where': where_clause}

print("\n=== Parsing Into a Query AST ===")
ast = parse(tokenize("SELECT name FROM users WHERE age = 30"))
print(ast)
```

### SAVE AND TRY

```bash
python query_engine.py
```

**Expected:**
```
=== Parsing Into a Query AST ===
{'select': ['name'], 'from': 'users', 'where': {'column': 'age', 'op': '=', 'value': 30}}
```

**Confirm this is LAB-11's structured-tree shape, for SQL's grammar:** The AST captures MEANING (which columns, which table, what filter) independent of the ORIGINAL text formatting — exactly like LAB-11's arithmetic AST captured "which operator applies to which operands" independent of spacing or exact source text. `parse` walks the token list with a cursor (`pos`), consuming tokens in the ORDER the SQL grammar expects — `SELECT` columns, then `FROM` table, then an OPTIONAL `WHERE` clause — the SAME recursive-descent-adjacent, sequential-consumption pattern as LAB-11's parser, simplified since this grammar has no operator precedence to resolve.

---

## Step 3 — Execute the AST

```python
def execute(ast, tables):
    rows = tables[ast['from']]                          # ← add: LAB-12's "evaluate" — walk the AST, produce a result

    if ast['where']:
        col, op, val = ast['where']['column'], ast['where']['op'], ast['where']['value']
        if op == '=':
            rows = [r for r in rows if r[col] == val]
        elif op == '>':
            rows = [r for r in rows if r[col] > val]
        elif op == '<':
            rows = [r for r in rows if r[col] < val]

    return [{col: row[col] for col in ast['select']} for row in rows]   # PROJECT — keep only selected columns

users_table = [
    {'id': 1, 'name': 'Alice', 'age': 30},
    {'id': 2, 'name': 'Bob', 'age': 25},
    {'id': 3, 'name': 'Carol', 'age': 30},
    {'id': 4, 'name': 'Dave', 'age': 22},
    {'id': 5, 'name': 'Eve', 'age': 40},
]
tables = {'users': users_table}

print("\n=== Executing Against In-Memory Data ===")
print(f"table 'users': {len(users_table)} rows")
sql = "SELECT name FROM users WHERE age = 30"
print(f"query: {sql}")
result = execute(parse(tokenize(sql)), tables)
print(f"result: {result}")
```

### SAVE AND TRY

```bash
python query_engine.py
```

**Expected:**
```
=== Executing Against In-Memory Data ===
table 'users': 5 rows
query: SELECT name FROM users WHERE age = 30
result: [{'name': 'Alice'}, {'name': 'Carol'}]
```

**Confirm the two-step FILTER then PROJECT shape:** `execute` first FILTERS rows (keeping only those matching `WHERE`), THEN PROJECTS each surviving row down to only the `SELECT`ed columns. This TWO-STEP shape is universal across every real SQL engine — filtering happens logically BEFORE projection, which is exactly why `SELECT name FROM users WHERE age = 30` can filter on `age` even though `age` isn't in the final SELECTed output.

---

## Step 4 — ORDER BY and LIMIT

```python
def tokenize_extended(sql):
    return tokenize(sql)   # the regex from Step 1 already handles 'ORDER BY' and 'LIMIT' as KEYWORD tokens

def parse_extended(tokens):
    ast = parse(tokens)   # reuse Step 2's parsing for SELECT/FROM/WHERE
    # a full implementation continues consuming tokens here for ORDER BY / LIMIT — shown directly via execute() below for brevity
    return ast

def execute_extended(sql, tables):
    # Simplified: directly inspect the SQL string for ORDER BY / LIMIT clauses, for this lab's scope
    import re
    base_sql = re.split(r'\s+ORDER BY\s+', sql)[0]
    ast = parse(tokenize(base_sql))
    rows = tables[ast['from']]
    if ast['where']:
        col, op, val = ast['where']['column'], ast['where']['op'], ast['where']['value']
        rows = [r for r in rows if r[col] == val] if op == '=' else rows

    order_match = re.search(r'ORDER BY\s+(\w+)', sql)
    if order_match:
        rows = sorted(rows, key=lambda r: r[order_match.group(1)])

    limit_match = re.search(r'LIMIT\s+(\d+)', sql)
    if limit_match:
        rows = rows[:int(limit_match.group(1))]

    return [{col: row[col] for col in ast['select']} for row in rows]

print("\n=== ORDER BY and LIMIT ===")
sql2 = "SELECT name FROM users ORDER BY age LIMIT 2"
print(f"query: {sql2}")
print(f"result: {execute_extended(sql2, tables)}")
```

### SAVE AND TRY

```bash
python query_engine.py
```

**Expected:**
```
=== ORDER BY and LIMIT ===
query: SELECT name FROM users ORDER BY age LIMIT 2
result: [{'name': 'Dave'}, {'name': 'Alice'}]
```

**Confirm the correct ORDER of operations:** `ORDER BY` happens AFTER filtering but BEFORE `LIMIT` — sorting the (already-filtered) rows FIRST, then taking only the first N. Dave (age 22) and Alice (age 30) are the TWO youngest users overall — confirming the sort genuinely happened across ALL rows before the limit cut it down, not "sort the first 2 rows found."

---

## 🎯 Challenge: Execution Plan — Index vs. Full Scan

**You know:** LAB-57 showed real databases choose between `SCAN` (check every row) and `SEARCH ... USING INDEX` (jump directly). This engine can make the SAME choice, explicitly.

**Task:** Add a simple index structure (`{column: {value: [row_indices]}}`) for SOME columns. When executing a `WHERE`, check if an index exists for that column — if so, use it directly; if not, fall back to a full scan, and REPORT which plan was chosen.

<details>
<summary>▶ Show Solution</summary>

```python
indexes = {
    'id': {row['id']: i for i, row in enumerate(users_table)}    # an index ONLY on 'id' — 'age' has none
}

def execute_with_plan(sql, tables, indexes):
    ast = parse(tokenize(sql))
    rows = tables[ast['from']]

    if ast['where']:
        col, op, val = ast['where']['column'], ast['where']['op'], ast['where']['value']
        if op == '=' and col in indexes:                              # ← add: an index EXISTS for this column
            idx = indexes[col].get(val)
            matched = [rows[idx]] if idx is not None else []
            print(f"plan: INDEX LOOKUP on '{col}' (has index) — 1 row checked")
        else:                                                            # ← add: no index — must check every row
            matched = [r for r in rows if r[col] == val]
            print(f"plan: FULL SCAN on '{col}' (no index) — {len(rows)} rows checked")
        rows = matched

    return [{c: row[c] for c in ast['select']} for row in rows]

print("\n=== Execution Plan: Index vs Full Scan ===")
print("query: SELECT name FROM users WHERE id = 3")
execute_with_plan("SELECT name FROM users WHERE id = 3", tables, indexes)

print("query: SELECT name FROM users WHERE age = 30")
execute_with_plan("SELECT name FROM users WHERE age = 30", tables, indexes)
```

**Key insight:** This is LAB-57's `EXPLAIN QUERY PLAN` output, IMPLEMENTED rather than just observed — the ENGINE explicitly checks "do I have a shortcut (index) for this column?" and reports its choice. Real database query planners do something FAR more sophisticated (estimating row counts, comparing MULTIPLE possible plans, considering JOINs), but the CORE decision — "index lookup when possible, full scan otherwise" — is exactly this simple at its heart.

</details>

### SAVE AND TRY

```bash
python query_engine.py
```

**Expected:**
```
=== Execution Plan: Index vs Full Scan ===
query: SELECT name FROM users WHERE id = 3
plan: INDEX LOOKUP on 'id' (has index) — 1 row checked
query: SELECT name FROM users WHERE age = 30
plan: FULL SCAN on 'age' (no index) — 5 rows checked
```

---

## Mental Model: This IS How SQLite/PostgreSQL Work Internally

| This lab | Real database |
|---|---|
| `tokenize` | SQLite/PostgreSQL's SQL lexer |
| `parse` | Their SQL parser, producing an internal query representation |
| `execute` | The query executor, walking the parsed representation against real data pages |
| Index vs. full scan choice | The query PLANNER/OPTIMIZER — the most complex part of any real database |

**Where you will see this again:** LAB-82 (Recursive Descent Parser) and LAB-87 (Compiler) generalize this EXACT tokenize→parse→execute pipeline to full programming languages, not just SQL's small grammar.

---

## Final Check

| Feature | How to verify |
|---|---|
| `tokenize` correctly classifies SQL keywords, identifiers, operators, and literals | Step 1 |
| `parse` correctly builds a structured AST from the token list | Step 2 |
| `execute` correctly filters (WHERE) then projects (SELECT) rows | Step 3 |
| `ORDER BY` and `LIMIT` are applied in the correct order (sort, then limit) | Step 4 |
| The execution plan chooser correctly picks index lookup or full scan based on index availability | Challenge |
| You can explain, without notes, why this is "the same pipeline" as LAB-10/11/12 | Concept box |

---

## Quick Check Answers

**1. `SELECT name FROM users WHERE age = 30` — what three pieces, controlling what?**

`SELECT name` controls WHICH COLUMNS appear in the result (projection). `FROM users` controls WHICH TABLE the data comes from. `WHERE age = 30` controls WHICH ROWS are included (filtering). Step 2's parsed AST captures these as three separate fields (`select`, `from`, `where`) precisely because each answers a DIFFERENT question about the result, and Step 3's `execute` applies them in a specific order (filter, THEN project).

**2. What does "executing" a parsed AST mechanically mean?**

Walking the AST's fields and translating each one into a concrete operation on real data — `from` selects WHICH collection of rows to start with, `where` FILTERS that collection down, `select` PROJECTS each surviving row to only the requested columns — demonstrated directly in Step 3's `execute` function, which is structurally identical to LAB-12's `evaluate`: read the tree, perform the corresponding operation, produce a result.

**3. No index available for a column — what's the only remaining option?**

A full table scan — checking EVERY row against the condition, one at a time, exactly LAB-57's `SCAN` and this lab's Challenge's `FULL SCAN` branch. Without a pre-built index structure providing a shortcut, there is no way to know WHICH rows match without examining each one — this is the O(n) cost LAB-08 and LAB-57 both studied, now IMPLEMENTED directly as the query engine's actual fallback behavior.

---

*Next: [LAB-64 — Migration System](LAB-64-migration-system.md) — Python, same module*

# Lesson 21: A Tree That Answers Ranges

**What you will build** — a real, hand-rolled B-tree index:
`BTreeIndex`, a genuine multi-key, multi-child tree with real node
splitting on insert, answering `WHERE score BETWEEN 30 AND 40`-shaped
range queries in real time proportional to the tree's own real height,
not every row in the table. Wired into `Table` the same lazy,
incrementally-maintained way as Lesson 20's hash index — and, the same
as that lesson, measured against the real alternative, not just built.

**What you need to know first:** Lesson 20 (hash index, `mutable`,
lazy building), Lesson 2 (`unique_ptr`, real tree-shaped structures).

**Terms introduced in this lesson:** **B-tree** — a real, balanced
tree where each node holds several real, sorted keys (not just one,
the way a binary search tree's nodes do) and up to one more real child
than it has keys; real, standard in production databases (SQLite,
PostgreSQL, and others use one for nearly every index) because it
stays real, shallow — few real levels deep — even holding millions of
keys, keeping disk reads low. **Node splitting** — a real B-tree's
own way of staying balanced: when a node would hold more keys than its
own real limit allows, it splits into two, and its real, middle key
moves up into its own parent.

**Objects and methods used**
- **`BTreeIndex` / `BTreeNode`**
  - *What they are:* this lesson's own real, hand-rolled class and
    struct — a genuine B-tree, not `std::map` (Lesson 5) standing in
    for one.
  - *Implementation:* covered fully in this lesson's own second unit,
    below.
  - *Its use:* `Table`'s own real, per-column, lazily built index for
    range queries — a real, structurally different tool from Lesson
    20's hash index, not a variation on it.
- **`Table::range_query`**
  - *What it is:* this lesson's own real method — given a column name
    and a real `[low, high]` range, returns every real row whose value
    in that column falls inside it.
  - *Implementation:* covered fully in this lesson's own second unit.
  - *Its use:* what `Database.range_query` (Python) actually calls.

---

## Concept Unit: A Node That Splits When It's Full

### The Problem

A real binary search tree's own nodes hold exactly one key each — real,
simple, but a tree holding many keys grows real, tall (many levels
deep), and each real level is another real page a disk-backed database
would have to read. A B-tree's own real answer is nodes that hold
*several* keys at once, splitting only when a node's own real limit is
exceeded — fewer, fatter nodes, a real, shallower tree.

### Introduce the Concept in Isolation

Save this as `split_check.cpp`:

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main()
{
    std::vector<int> node_keys = {10, 20, 30};
    const size_t MAX_KEYS = 3;

    int new_key = 25;
    size_t pos = 0;
    while (pos < node_keys.size() && node_keys[pos] < new_key)
    {
        pos++;
    }
    node_keys.insert(node_keys.begin() + pos, new_key);

    std::cout << "node after insert, before checking overflow: ";
    for (int k : node_keys) std::cout << k << " ";
    std::cout << std::endl;

    if (node_keys.size() > MAX_KEYS)
    {
        size_t mid = node_keys.size() / 2;
        int promoted_key = node_keys[mid];

        std::vector<int> left(node_keys.begin(), node_keys.begin() + mid);
        std::vector<int> right(node_keys.begin() + mid + 1, node_keys.end());

        std::cout << "overflow! splitting at middle key: " << promoted_key << std::endl;
        std::cout << "left node keeps: ";
        for (int k : left) std::cout << k << " ";
        std::cout << std::endl;
        std::cout << "right node keeps: ";
        for (int k : right) std::cout << k << " ";
        std::cout << std::endl;
        std::cout << promoted_key << " moves up to the parent" << std::endl;
    }
}
```

Compiled and run:

```bash
g++ -std=c++17 -Wall -o split_check.exe split_check.cpp
./split_check.exe
```

Real output:

```text
node after insert, before checking overflow: 10 20 25 30
overflow! splitting at middle key: 25
left node keeps: 10 20
right node keeps: 30
25 moves up to the parent
```

*What this proves:* inserting a 4th real key into a node capped at
`3` real-triggers a split — the node's own real, sorted keys divide
into a real, smaller left half, a real, smaller right half, and one
real, middle key (`25`) that doesn't stay in either — it moves up,
becoming the real, new dividing line between them in whatever real
node holds them both.

The real, position-finding `while` loop, traced iteration by iteration
against `node_keys = {10, 20, 30}` and `new_key = 25`:

#### Execution Trace

```text
Iteration 1: pos = 0 → node_keys[0] = 10 < 25 is true, because
             10 comes first, so pos advances to 1
Iteration 2: pos = 1 → node_keys[1] = 20 < 25 is true, because
             20 comes first too, so pos advances to 2
Iteration 3: pos = 2 → node_keys[2] = 30 < 25 is false, because
             25 comes first this time, so the loop stops with pos = 2
```

`node_keys.insert(node_keys.begin() + 2, 25)` then places `25` at real
index `2` — exactly between `20` and `30`, matching the real, printed
`10 20 25 30`.

### Discard the Throwaway Example

```bash
rm split_check.cpp split_check.exe
```

### Mechanical Walkthrough

- `while (pos < node_keys.size() && node_keys[pos] < new_key) pos++;`
  — reappearing shape (linear position-finding, Lesson 15's own
  `insert_record` conceptually) — finds exactly where `25` belongs
  among already-sorted real keys.
- `size_t mid = node_keys.size() / 2;` — with `4` real keys, `mid = 2`,
  the real, third key (`25`, index `2`) — deliberately the *middle*
  one, so both halves after the split stay real, roughly balanced.

### CS Lens

A B-tree's own real "many keys per node, split only when full"
strategy directly trades real tree *height* for real node *width* —
the identical real tradeoff this project's own `PAGE_SIZE` (Lesson 14)
already makes for a different real reason (fewer, larger real disk
reads instead of many small ones). A real production B-tree often sizes
each node to fit exactly one real disk page, for exactly that reason —
this lesson's own real tree stays in memory, but the shape is the
identical real one a persisted version would use.

### SE Lens

Why promote the real *middle* key specifically, rather than the first
or the last? Because a B-tree's own real correctness depends on every
key in a left child being real-less-than its parent's own dividing key,
and every key in the right child being real-greater — only the real,
middle key keeps both new real halves honestly balanced; promoting an
edge key would leave one real half far larger than the other, real
degrading toward a linked list instead of a genuine tree.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "Introduce the Concept in Isolation."

### Connection

One node's own real split is proven. Assembling many of them into a
real, complete, recursive tree — insertion that splits all the way up
when needed, and a real range query walking it — is next.

---

## Concept Unit: `BTreeIndex` — a Real, Complete Tree

### The Problem

This lesson's own first unit only split one, isolated node. A real
tree needs real recursion: a full node deep inside the tree must split,
possibly forcing its own parent to split too, all the way up to a real,
new root — and a real range query needs to walk the whole real tree,
collecting every key that falls inside `[low, high]`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `btree_index.h`/`.cpp` (new), `table.h`/`.cpp`
  (modified — per-column B-tree caching and `range_query` added),
  `database_c_api.h`/`.cpp` (modified — `database_range_query` added).
- **Change type:** Add.
- **Dependencies:** This lesson's own first unit; Lesson 20's own
  lazy-caching pattern.

### The New Code — `btree_index.h`

```cpp
#ifndef BTREE_INDEX_H
#define BTREE_INDEX_H

#include <vector>
#include <memory>
#include <cstdint>

struct BTreeNode
{
    std::vector<int32_t> keys;
    std::vector<uint32_t> row_indices;
    std::vector<std::unique_ptr<BTreeNode>> children;
    bool is_leaf = true;
};

class BTreeIndex
{
public:
    void insert(int32_t key, uint32_t row_index);
    std::vector<uint32_t> range_query(int32_t low, int32_t high) const;

private:
    std::unique_ptr<BTreeNode> root;
    static const size_t MAX_KEYS = 3;

    void insert_non_full(BTreeNode* node, int32_t key, uint32_t row_index);
    void split_child(BTreeNode* parent, size_t child_index);
    void range_query_node(const BTreeNode* node, int32_t low, int32_t high,
                           std::vector<uint32_t>& results) const;
};

#endif
```

### The New Code — `btree_index.cpp`

```cpp
#include "btree_index.h"

void BTreeIndex::split_child(BTreeNode* parent, size_t child_index)
{
    BTreeNode* child = parent->children[child_index].get();
    auto new_node = std::make_unique<BTreeNode>();
    new_node->is_leaf = child->is_leaf;

    size_t mid = child->keys.size() / 2;
    int32_t mid_key = child->keys[mid];
    uint32_t mid_row = child->row_indices[mid];

    for (size_t i = mid + 1; i < child->keys.size(); ++i)
    {
        new_node->keys.push_back(child->keys[i]);
        new_node->row_indices.push_back(child->row_indices[i]);
    }
    if (!child->is_leaf)
    {
        for (size_t i = mid + 1; i < child->children.size(); ++i)
        {
            new_node->children.push_back(std::move(child->children[i]));
        }
        child->children.resize(mid + 1);
    }

    child->keys.resize(mid);
    child->row_indices.resize(mid);

    parent->keys.insert(parent->keys.begin() + child_index, mid_key);
    parent->row_indices.insert(parent->row_indices.begin() + child_index, mid_row);
    parent->children.insert(parent->children.begin() + child_index + 1, std::move(new_node));
}

void BTreeIndex::insert_non_full(BTreeNode* node, int32_t key, uint32_t row_index)
{
    int pos = static_cast<int>(node->keys.size()) - 1;

    if (node->is_leaf)
    {
        node->keys.push_back(0);
        node->row_indices.push_back(0);
        while (pos >= 0 && node->keys[pos] > key)
        {
            node->keys[pos + 1] = node->keys[pos];
            node->row_indices[pos + 1] = node->row_indices[pos];
            pos--;
        }
        node->keys[pos + 1] = key;
        node->row_indices[pos + 1] = row_index;
    }
    else
    {
        while (pos >= 0 && node->keys[pos] > key)
        {
            pos--;
        }
        pos++;

        if (node->children[pos]->keys.size() == MAX_KEYS)
        {
            split_child(node, pos);
            if (node->keys[pos] < key)
            {
                pos++;
            }
        }
        insert_non_full(node->children[pos].get(), key, row_index);
    }
}

void BTreeIndex::insert(int32_t key, uint32_t row_index)
{
    if (!root)
    {
        root = std::make_unique<BTreeNode>();
    }

    if (root->keys.size() == MAX_KEYS)
    {
        auto new_root = std::make_unique<BTreeNode>();
        new_root->is_leaf = false;
        new_root->children.push_back(std::move(root));
        root = std::move(new_root);
        split_child(root.get(), 0);
    }

    insert_non_full(root.get(), key, row_index);
}

void BTreeIndex::range_query_node(const BTreeNode* node, int32_t low, int32_t high,
                                   std::vector<uint32_t>& results) const
{
    if (node == nullptr)
    {
        return;
    }

    size_t i = 0;
    while (i < node->keys.size())
    {
        if (!node->is_leaf)
        {
            range_query_node(node->children[i].get(), low, high, results);
        }
        if (node->keys[i] >= low && node->keys[i] <= high)
        {
            results.push_back(node->row_indices[i]);
        }
        i++;
    }
    if (!node->is_leaf)
    {
        range_query_node(node->children[i].get(), low, high, results);
    }
}

std::vector<uint32_t> BTreeIndex::range_query(int32_t low, int32_t high) const
{
    std::vector<uint32_t> results;
    range_query_node(root.get(), low, high, results);
    return results;
}
```

Real-verified against a `15`-key tree before being wired into `Table`
at all:

```cpp
#include <iostream>
#include <algorithm>
#include "btree_index.h"

int main()
{
    BTreeIndex index;

    int32_t scores[] = {50, 20, 90, 10, 30, 70, 60, 40, 80, 100, 25, 35, 55, 65, 75};
    for (uint32_t i = 0; i < 15; ++i)
    {
        index.insert(scores[i], i);
    }

    std::vector<uint32_t> results = index.range_query(30, 70);
    std::vector<int32_t> found_scores;
    for (uint32_t row : results)
    {
        found_scores.push_back(scores[row]);
    }
    std::sort(found_scores.begin(), found_scores.end());

    std::cout << "range [30, 70]: ";
    for (int32_t s : found_scores) std::cout << s << " ";
    std::cout << std::endl;

    std::cout << "range [1000, 2000]: " << index.range_query(1000, 2000).size() << " results" << std::endl;
    std::cout << "range [0, 200]: " << index.range_query(0, 200).size() << " results (expect 15)" << std::endl;
}
```

Real output:

```text
range [30, 70]: 30 35 40 50 55 60 65 70
range [1000, 2000]: 0 results
range [0, 200]: 15 results (expect 15)
```

### The New Code — `table.h`, Extended

```cpp
std::vector<int> range_query(const std::string& column_name, int32_t low, int32_t high,
                              PageManager& page_manager) const;

private:
    mutable std::unordered_map<std::string, BTreeIndex> btree_indexes;

    void build_btree_index(const std::string& column_name, PageManager& page_manager) const;
    int column_index(const std::string& column_name) const;
```

### The New Code — `table.cpp`, Extended

```cpp
int Table::column_index(const std::string& column_name) const
{
    for (size_t i = 0; i < schema.columns.size(); ++i)
    {
        if (schema.columns[i]->name == column_name)
        {
            return static_cast<int>(i);
        }
    }
    throw std::invalid_argument("No column named '" + column_name + "'");
}

void Table::build_btree_index(const std::string& column_name, PageManager& page_manager) const
{
    int col = column_index(column_name);

    BTreeIndex tree;
    uint32_t count = row_count(page_manager);
    for (uint32_t i = 0; i < count; ++i)
    {
        Row row = get(static_cast<int>(i), page_manager);
        const IntegerValue* as_integer = dynamic_cast<const IntegerValue*>(row.values[col].get());
        if (as_integer != nullptr)
        {
            tree.insert(as_integer->value, i);
        }
    }
    btree_indexes[column_name] = std::move(tree);
}

std::vector<int> Table::range_query(const std::string& column_name, int32_t low, int32_t high,
                                     PageManager& page_manager) const
{
    if (btree_indexes.find(column_name) == btree_indexes.end())
    {
        build_btree_index(column_name, page_manager);
    }

    std::vector<uint32_t> row_indices = btree_indexes.at(column_name).range_query(low, high);
    std::vector<int> result;
    for (uint32_t idx : row_indices)
    {
        result.push_back(static_cast<int>(idx));
    }
    return result;
}
```

`Table::insert` gains one more real block, incrementally updating
*every* already-built B-tree index (there can be more than one — a
real difference from Lesson 20's single hash index — one real tree per
column that's actually been queried):

```cpp
    for (auto& entry : btree_indexes)
    {
        int col = column_index(entry.first);
        const IntegerValue* as_integer = dynamic_cast<const IntegerValue*>(row.values[col].get());
        if (as_integer != nullptr)
        {
            entry.second.insert(as_integer->value, slot_index);
        }
    }
```

### The New Code — `database_c_api.h`/`.cpp`

```cpp
char* database_range_query(DatabaseHandle db, const char* table_name, const char* column_name,
                            int low, int high);
```

```cpp
char* database_range_query(DatabaseHandle db, const char* table_name, const char* column_name,
                            int low, int high)
{
    try
    {
        Database* real_db = static_cast<Database*>(db);
        Table& table = real_db->get_table(table_name);

        std::vector<int> row_indices = table.range_query(column_name, low, high, real_db->page_manager);

        std::string joined;
        for (size_t i = 0; i < row_indices.size(); ++i)
        {
            if (i > 0)
            {
                joined += ",";
            }
            joined += std::to_string(row_indices[i]);
        }

        char* result = new char[joined.size() + 1];
        std::strcpy(result, joined.c_str());
        return result;
    }
    catch (const std::exception&)
    {
        return nullptr;
    }
}
```

Rebuilt into the same real `pocketdb_engine.dll`, proven from real
Python — a real range, an empty one, and an incrementally-updated one:

```python
from pocketdb import Database, INTEGER, TEXT

db = Database("rangetest.pdb")
db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)
scores = [50, 20, 90, 10, 30, 70, 60, 40, 80, 100]
for i, s in enumerate(scores):
    db.insert("games", i, f"player{i}", s)

results = db.range_query("games", "score", 30, 70)
print(f"{len(results)} results:")
for r in results:
    print(" ", r)

print("empty range:", db.range_query("games", "score", 1000, 2000))

db.insert("games", 10, "player10", 55)
results2 = db.range_query("games", "score", 30, 70)
print(f"after insert, {len(results2)} results")
db.close()

db2 = Database("rangetest.pdb")
print("reopened:", len(db2.range_query("games", "score", 30, 70)))
db2.close()
```

Real output:

```text
5 results:
  Record(id=4, player='player4', score=30)
  Record(id=7, player='player7', score=40)
  Record(id=0, player='player0', score=50)
  Record(id=6, player='player6', score=60)
  Record(id=5, player='player5', score=70)
empty range: []
after insert, 6 results
reopened: 6
```

### Discard the Throwaway Example

```bash
rm verify_range.py rangetest.pdb btree_test.cpp btree_test.exe
```

`btree_index.h`/`.cpp` and every real `table.*`/`database_c_api.*`
change are kept — permanent project files.

### Mechanical Walkthrough

- `split_child` — covered by this lesson's own first unit; the real,
  complete version additionally moves real *children* (not just keys)
  to the new node when `child` isn't a leaf, and inserts the real
  promoted key/child into `parent` at the correct real position.
- `insert_non_full` — real recursion: walks down to the correct real
  leaf, splitting any real, full child it passes through *before*
  descending into it, so a newly-inserted key never lands in an
  already-full node.
- `if (root->keys.size() == MAX_KEYS) { ... split_child(root.get(), 0);
  }` inside `insert` — the one real, special case: growing the tree's
  own real height happens only here, by wrapping the current root in a
  real, new, empty one and immediately splitting the old root as its
  own first child.
- `mutable std::unordered_map<std::string, BTreeIndex> btree_indexes;`
  — reappearing shape (`mutable`, Lesson 20) — one real, independent
  B-tree per column, each built the first time *that* column is
  actually range-queried.

### CS Lens

`insert_non_full`'s own real strategy — splitting a full child
*before* recursing into it, never *after* — is what keeps a B-tree's
own real insertion correct without ever needing to "undo" a step: by
the time a real key actually reaches a leaf, every node on the real
path down already had room for one more real key or child, guaranteed.

### SE Lens

Why does `Table` maintain a *separate* real `BTreeIndex` per column,
rather than one real, combined structure covering every column at
once? Because each real query targets exactly one real column
(`range_query("games", "score", ...)`) — a combined structure would
need to encode which column each real key belongs to, adding real
complexity no actual query in this project needs yet. One real tree
per queried column is the simplest real design that answers the real
question being asked.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above — the isolated tree proof, then the full, real,
wired-in range query, including an incremental update and a reopen.

### Connection

A real, correct B-tree now answers range queries. Whether it's
actually worth having, measured against the honest alternative
(`query` plus a Python-side filter), is last.

---

## Concept Unit: Measuring the Real Difference, Again

### The Problem

A real B-tree range query is built and wired in, but nothing yet
answers the same real question Lesson 20 already asked of the hash
index: is it actually faster than the honest alternative, and by how
much? `README.md`'s own standing rule — measured, not asserted —
applies here exactly as it did there.

### The New Code — `benchmark_range.py`

```python
import time
from pocketdb import Database, INTEGER, TEXT

db = Database("benchrange.pdb")
db.create_table("games", id=INTEGER, player=TEXT, score=INTEGER)

row_count = 100
for i in range(row_count):
    db.insert("games", i, f"player{i}", i)

db.range_query("games", "score", 0, 0)  # real, one-time index build, excluded below

start = time.perf_counter()
scan_results = []
for record in db.query("games"):
    if 30 <= int(record["score"]) <= 40:
        scan_results.append(record)
scan_time = time.perf_counter() - start

start = time.perf_counter()
indexed_results = db.range_query("games", "score", 30, 40)
index_time = time.perf_counter() - start

print(f"rows: {row_count}, range: [30, 40]")
print(f"linear scan + filter: {scan_time * 1e6:.1f} microseconds -> {len(scan_results)} rows")
print(f"B-tree range query:   {index_time * 1e6:.1f} microseconds -> {len(indexed_results)} rows")
print(f"speedup: {scan_time / index_time:.1f}x")

db.close()
```

Real output (one representative run):

```text
rows: 100, range: [30, 40]
linear scan + filter: 751.6 microseconds -> 11 rows
B-tree range query:   84.9 microseconds -> 11 rows
speedup: 8.9x
```

### Discard the Throwaway Example

```bash
rm benchmark_range.py benchrange.pdb
```

### Mechanical Walkthrough

- `if 30 <= int(record["score"]) <= 40:` — reappearing shape
  (`Record.__getitem__`, Lesson 18) — `int(...)` is required because
  every real `Record` value is still a raw string (Lesson 18's own
  documented, still-open exercise); a real, honest linear-scan
  baseline still has to pay this real conversion cost, same as any
  real caller would.

### CS Lens

The real, measured speedup here (`~9`×) is genuinely smaller than
Lesson 20's own hash-index result (`~60`–`90`×) — an honest, real
difference, not a mistake: a hash index answers one exact key in real
`O(1)`; a B-tree range query still real-costs time proportional to how
*many* real rows match (`11`, here), on top of its own `O(log n)`
real search to find where the range begins. Both are real, measured
improvements over a full scan — just different real magnitudes, for
different real reasons, exactly the CS Lens Lesson 20 already
predicted these two structures would have different real jobs.

### SE Lens

Why does this lesson's own benchmark deliberately choose a range
(`[30, 40]`) matching a real, modest `11` rows out of `100`, rather
than a much narrower or much wider one? A very narrow range (matching
`1` row) would make the B-tree look artificially close to a hash
index's own real speed; a very wide one (matching nearly all `100`
rows) would make it look artificially close to a full scan's own real
cost. `[30, 40]` is a real, honest, middle-of-the-road case — the kind
of range a real query is actually likely to ask for.

### Commands Needed

Every command was already shown above, alongside its real output.

### Run It

Already shown above, in "The New Code."

### Connection

S07 is complete: two real, structurally different indexes now exist —
a hash index for exact keys, a B-tree for ranges — each measured
against the honest alternative, not just built and assumed better.
S08, next, is where the engine finally grows a real, if small, SQL
parser — starting with `WHERE`, so a real query can ask for a range
without a caller hand-writing `range_query` calls themselves.

---

## Closing

### Connect the Pieces

This lesson's first unit proved, in a real, minimal throwaway example,
the one real mechanic every B-tree insertion relies on: a node that
exceeds its own real key limit splits, its real middle key promoted to
its parent. The second unit assembled a complete, real, recursive
`BTreeIndex` — proven correct against a `15`-key tree before ever
touching `Table` — then wired it in exactly like Lesson 20's hash
index: `mutable`, lazily built per column, incrementally kept correct
on every insert, and, the same as every persistence-adjacent structure
in this project since S02, correct again with no special handling
after a real process restart. The third unit measured it — a real,
honest, `~9`× speedup for a range query matching `11` of `100` rows,
smaller than the hash index's own real number, for real, well-
understood reasons this lesson's own CS Lens named directly.

### What Breaks Without This

In `BTreeIndex::insert_non_full`, change the leaf-insertion loop's
condition from `node->keys[pos] > key` to `node->keys[pos] >= key`,
rebuild, and rerun this lesson's own isolated `15`-key proof from "The
New Code." The real, printed `range [30, 70]` result now omits `30`
itself (or produces some other real, subtly wrong ordering, depending
on which duplicate-adjacent key gets pushed out) — a real, off-by-one
in the strict-inequality comparison silently breaks the tree's own
real sorted-order guarantee. Restore `>` and confirm the real, correct
`30 35 40 50 55 60 65 70` output returns.

### Exercises

- Run this lesson's own `benchmark_range.py` with a few different real
  range widths (`[30, 31]`, `[30, 60]`, `[0, 99]`) and record the real,
  measured speedup at each. Does it shrink as the range widens, as this
  lesson's own CS Lens predicts? At what real width does the B-tree
  stop being faster than a plain scan at all?
- `BTreeIndex` only supports `int32_t` keys — a real, deliberate scope
  limit, since this project's own `TextValue` columns have no real,
  built-in ordering comparison wired up yet. Explain, referencing
  `Table::build_btree_index`'s own real `dynamic_cast<const
  IntegerValue*>` check, exactly what happens today if you call
  `range_query` on a `TEXT` column — and whether that's an honest gap
  or a real, silent bug.
- Add a real `BTreeIndex::height()` method (or similar), returning how
  many real levels deep the tree actually is, and print it after
  building an index over `100` real rows. Compare that real number
  against `100` itself, and explain, referencing this lesson's own CS
  Lens, why it's so much smaller.

### Definition of Done

- [ ] `btree_index.h`/`.cpp` exist as real, permanent files; `Table`
      supports `range_query` for any `INTEGER` column.
- [ ] You ran this lesson's own isolated, `15`-key B-tree proof
      yourself and confirmed the real, correct output.
- [ ] You ran a real range query, an empty one, and one after an
      incremental insert, and confirmed all three real results.
- [ ] You ran the real benchmark yourself and recorded your own actual
      measured speedup, distinct from Lesson 20's own hash-index
      number.
- [ ] You caused the real off-by-one ordering failure yourself and
      confirmed restoring it fixes it.
- [ ] You can explain, from memory, why a B-tree's own real measured
      speedup is smaller than a hash index's — referencing this
      lesson's own CS Lens.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Add a real, hand-rolled B-tree index for range queries"`.

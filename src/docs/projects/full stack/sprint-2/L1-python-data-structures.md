# Sprint 2 · Lesson 1 — Python data structures and types

## What you will build

By the end of this lesson, you will have a Python script that models a work order as a dictionary, stores five of them in a list, and filters, transforms, and prints them. The script runs from the terminal. You will understand Python's core data structures — dict, list, and their operations — and the type system well enough to model any real-world object. This is the data foundation that the CRUD API in Lesson 3 will be built on.

---

## What you need to know first

- Sprint 1 complete: Python installed, virtual environment created and activated in `fullstack-project/`.
- You can navigate the terminal, activate the virtual environment, and run Python files.

**Concepts carried forward:** virtual environment, Python interpreter, working directory, `python3` command.

---

## The lesson

---

### 1. Create the script and run it

**The problem:** Before writing the FastAPI endpoints that manage work orders, you need to understand the data shape they will work with. A work order has fields — an ID, a title, a status, a priority, an assigned user. You need to represent this in Python.

Create `backend/models_scratch.py` — a scratch file for exploration. You will delete it at the end of this lesson after the concepts transfer to the real code.

```python
work_order = {
    "id": 1,
    "title": "Fix broken conveyor belt",
    "status": "open",
    "priority": "high",
    "assigned_to": "Alice"
}

print(work_order)
```

Run it (from `backend/`, with the virtual environment active):

```
python3 models_scratch.py
```

Expected output:
```
{'id': 1, 'title': 'Fix broken conveyor belt', 'status': 'open', 'priority': 'high', 'assigned_to': 'Alice'}
```

**Walkthrough:** `python3 models_scratch.py` tells the Python interpreter to load the file `models_scratch.py` and execute it top to bottom. `work_order = { ... }` creates a **dictionary** and binds it to the name `work_order`. `print(work_order)` calls Python's built-in `print` function with the dictionary as its argument. `print` calls the dictionary's `__repr__` method (its text representation) and writes the result to standard output.

**CS lens — the dictionary as a hash map.** A Python `dict` is a **hash map** — the same data structure as a JavaScript object, a Java `HashMap`, and a Go `map`. It stores key-value pairs where keys are hashed to determine storage location, giving O(1) average-case lookup, insertion, and deletion. The key is hashed (converted to an integer via a hash function), used as an index into an internal array, and the value is stored there. Looking up a key rehashes it and checks the same index. This is why `work_order["id"]` is fast regardless of how many keys the dict has — the lookup time does not grow with the size of the dict.

**SE lens — the dict as the lingua franca of web APIs.** Python dicts and JSON objects are structurally identical: both are key-value maps with string keys. FastAPI converts dicts to JSON automatically. This correspondence is why Python is so natural for web APIs — the data model you reason about in Python is the same structure the client receives over the network. When you write `return {"id": 1, "status": "open"}`, the JavaScript in the browser receives `{id: 1, status: "open"}`.

**What breaks without this:** If you use a Python `list` where you meant a `dict` — `work_order = [1, "Fix broken...", "open"]` — you lose the named keys. Accessing `work_order[0]` returns `1`, but nothing tells you that `0` means `id`. The code becomes impossible to read and brittle to changes in field order. Named keys are not optional for representing structured data.

---

### 2. Access and modify dictionary values

**The problem:** You can create a dict. Now you need to read from it, update it, and handle the case when a key does not exist.

Add to `models_scratch.py`:

```python
# Reading a value
print(work_order["title"])

# Updating a value
work_order["status"] = "in_progress"
print(work_order["status"])

# Safe read: returns None instead of raising KeyError
print(work_order.get("assigned_to"))
print(work_order.get("missing_key"))

# Adding a new key
work_order["completed_at"] = None
print(work_order)
```

Expected output:
```
Fix broken conveyor belt
in_progress
Alice
None
{'id': 1, 'title': 'Fix broken conveyor belt', 'status': 'in_progress', 'priority': 'high', 'assigned_to': 'Alice', 'completed_at': None}
```

**Walkthrough:**

`work_order["title"]` — bracket notation accesses the value for the key `"title"`. Python computes the hash of `"title"`, looks up the internal array at that position, and returns the stored value. The time complexity is O(1).

`work_order["status"] = "in_progress"` — the same bracket notation on the left side of an assignment updates the value. Python hashes `"status"`, finds the existing entry, and replaces its value.

`work_order.get("assigned_to")` — the `.get()` method is a safer alternative to bracket notation. If the key exists, it returns the value. If the key does not exist, it returns `None` (by default) instead of raising a `KeyError`. Use `.get()` when a key's absence is valid and expected; use bracket notation when the key must exist.

`work_order.get("missing_key")` — returns `None`. No exception.

`work_order["completed_at"] = None` — adds a new key-value pair. Python dicts are mutable — you can add, change, and remove keys at any time. `None` is Python's null value — the absence of a value. It is not zero, not empty string, not false. It specifically means "no value." You will use `None` for optional fields that have not been set.

**CS lens — `None` as a typed absence.** In Python, `None` is an object — an instance of the `NoneType` class. It is not `0`, not `""`, not `False`. Comparing `None` with `==` works, but the idiomatic check is `is None` (identity check) rather than `== None` (equality check). The reason: `is` checks whether two names refer to the same object in memory. `None` is a singleton — there is exactly one `None` object in a Python process. `is None` is guaranteed to work correctly; `== None` could be tricked by an object that overrides `__eq__`. This is why `if value is None:` is correct Python and `if value == None:` produces a linter warning.

**SE lens — the KeyError as a design signal.** When bracket notation raises `KeyError` for a missing key, it is Python saying: "you assumed this key exists, but it does not." This is almost always a bug — you are accessing data you did not verify is present. In a web API, keys can be absent because the client sent an incomplete request, or because the database returned a partial record. The discipline is: use `.get()` when absence is possible and handle the `None` case; use bracket notation only when you have already verified the key exists. Pydantic (Lesson 2) will take over this discipline at the model level.

**What breaks without this:** Accessing a missing key with bracket notation raises `KeyError: 'missing_key'`. This is a runtime exception — your server returns 500. The fix is to either verify the key exists first (`if "key" in work_order:`) or use `.get()`. In FastAPI, an unhandled `KeyError` produces an HTTP 500 response and a stack trace in the uvicorn terminal.

---

### 3. Build a list of work orders

**The problem:** A single work order is not useful. You need a collection of them — a data structure you can search, filter, and iterate.

Replace the contents of `models_scratch.py` with:

```python
work_orders = [
    {"id": 1, "title": "Fix conveyor belt", "status": "open", "priority": "high"},
    {"id": 2, "title": "Lubricate pump", "status": "open", "priority": "medium"},
    {"id": 3, "title": "Replace gasket", "status": "in_progress", "priority": "high"},
    {"id": 4, "title": "Inspect safety valves", "status": "closed", "priority": "low"},
    {"id": 5, "title": "Clean filters", "status": "open", "priority": "medium"},
]

print(f"Total orders: {len(work_orders)}")
print(f"First order: {work_orders[0]}")
print(f"Last order: {work_orders[-1]}")
```

Expected output:
```
Total orders: 5
First order: {'id': 1, 'title': 'Fix conveyor belt', 'status': 'open', 'priority': 'high'}
Last order: {'id': 5, 'title': 'Clean filters', 'status': 'open', 'priority': 'medium'}
```

**Walkthrough:**

`work_orders = [ ... ]` — a Python **list**. A list is an ordered, mutable sequence. Ordered means the items have defined positions; position 0 is always the first item. Mutable means you can add, remove, and change items after creation.

`len(work_orders)` — the built-in `len()` function returns the number of items in any sequence (list, string, dict, etc.).

`work_orders[0]` — index access. Lists are zero-indexed: the first item is at index 0, the second at index 1. Accessing an index beyond the list length raises `IndexError`.

`work_orders[-1]` — negative indexing. `-1` is the last item, `-2` is the second-to-last, and so on. Python lists support negative indices as a shorthand for counting from the end. `work_orders[-1]` is equivalent to `work_orders[len(work_orders) - 1]`.

`f"Total orders: {len(work_orders)}"` — the first appearance of an f-string in actual code. The `f` prefix marks a **formatted string literal**. Any expression inside `{}` is evaluated and its result is converted to a string and inserted at that position. `f"Total orders: {len(work_orders)}"` with `len(work_orders) = 5` produces the string `"Total orders: 5"`. This is Python's most readable string formatting mechanism.

**CS lens — list as a dynamic array.** Python lists are implemented as **dynamic arrays** — not linked lists. Items are stored contiguously in memory. Index access (`work_orders[2]`) is O(1) — computing the memory address of item 2 is arithmetic: `base_address + 2 * item_size`. Appending to the end is amortised O(1) — the list pre-allocates extra capacity and only reallocates (doubles in size) when capacity is exceeded. Inserting in the middle is O(n) — all items after the insertion point must shift. For a list of work orders that you typically read in full or append to, dynamic array performance is ideal.

**SE lens — in-memory list as the simplest possible store.** This list is your "database" for Sprint 2. It is not persistent (cleared on server restart), not concurrent-safe (simultaneous requests could corrupt it), and not searchable (finding an item requires scanning the whole list). These are real limitations. But using the simplest possible implementation first — before adding Postgres — means you understand every layer you add in Sprint 3. Engineers who go straight to the database never understand what the database is doing for them.

**What breaks without this:** If you access `work_orders[10]` on a list with 5 items, Python raises `IndexError: list index out of range`. In a web API, this produces a 500 error. Always validate that an index is within range before accessing it — or use a method like `.get()` on a dict keyed by ID, which the CRUD API in Lesson 3 will use.

---

### 4. Iterate with for loops

**The problem:** You need to process every item in the list — print them, transform them, filter them. You need a `for` loop.

```python
for order in work_orders:
    print(f"Order {order['id']}: {order['title']} [{order['status']}]")
```

Expected output:
```
Order 1: Fix conveyor belt [open]
Order 2: Lubricate pump [open]
Order 3: Replace gasket [in_progress]
Order 4: Inspect safety valves [closed]
Order 5: Clean filters [open]
```

**Walkthrough:** `for order in work_orders:` iterates over `work_orders`. On each iteration, the next item from the list is bound to the name `order`. The loop body runs once per item. `order['id']`, `order['title']`, `order['status']` access dictionary values using bracket notation.

The indented block under `for` is the loop body. Python uses **indentation** to delimit blocks — unlike JavaScript, which uses `{}` braces. Four spaces is the universal convention. The block ends when the indentation returns to the level of the `for` statement.

**CS lens — iteration as sequential state traversal.** A `for` loop is an abstraction over the **iterator protocol**: Python calls `iter(work_orders)` to get an iterator object, then calls `next(iterator)` on each iteration to get the next item. When `next()` raises `StopIteration`, the loop ends. Any Python object can implement the iterator protocol — lists, dicts, files, database cursors, HTTP response streams. `for item in anything` works as long as `anything` implements `__iter__` and `__next__`. This is why you will later write `for row in database_cursor:` without needing to know the database cursor's size in advance.

**SE lens — readable iteration.** Python's `for item in collection:` is more readable than `for (let i = 0; i < items.length; i++)` because it expresses intent — "for each order" — rather than mechanics — "start at 0, increment until length." Readable code is code where the reader can understand intent without reconstructing mechanics. The Python idiom is preferred when you do not need the index.

**What breaks without this:** An off-by-one error in index-based iteration — a bug that Python's `for item in collection` style eliminates entirely. If you index-iterate and write `for i in range(1, len(work_orders)):`, you skip the first item (index 0). `for order in work_orders:` has no such risk.

---

### 5. Filter with list comprehensions

**The problem:** You need only the open work orders. You could use a `for` loop and an `if` statement to build a new list. Python has a more concise syntax for this: the list comprehension.

```python
open_orders = [order for order in work_orders if order["status"] == "open"]
print(f"Open orders: {len(open_orders)}")
for order in open_orders:
    print(f"  - {order['title']}")
```

Expected output:
```
Open orders: 3
  - Fix conveyor belt
  - Lubricate pump
  - Clean filters
```

**Walkthrough:** `[order for order in work_orders if order["status"] == "open"]` is a **list comprehension**. Reading it left to right: "build a list by taking `order` for each `order` in `work_orders` if the order's status equals `"open"`."

The three parts:
1. `order` — what to include in the result list (can be any expression, e.g., `order["title"]` to produce a list of titles)
2. `for order in work_orders` — the source of items
3. `if order["status"] == "open"` — the filter condition (optional)

This is equivalent to:
```python
open_orders = []
for order in work_orders:
    if order["status"] == "open":
        open_orders.append(order)
```

Both are correct. The list comprehension is preferred when the logic is simple — it is readable in one line and does not require a temporary variable for the result list.

`==` is Python's equality operator. It compares values. `order["status"] == "open"` evaluates to `True` if the value at key `"status"` equals the string `"open"`, and `False` otherwise.

**CS lens — filter as a higher-order operation.** A list comprehension with a filter condition is an implementation of the functional programming `filter` operation: given a collection and a predicate (a function returning True/False), produce a new collection containing only items for which the predicate is True. The same operation appears in every language: JavaScript has `Array.filter()`, SQL has `WHERE`, Pandas has boolean indexing. The concept is universal; the syntax differs.

**SE lens — comprehensions vs explicit loops.** Use a list comprehension when:
- The transformation is a single expression
- The filter condition is simple
- The resulting list is what you want

Use an explicit `for` loop when:
- The loop body has multiple statements
- You need to handle errors inside the loop
- You are building something more complex than a filtered/transformed list

The rule is readability: if you have to explain what the comprehension does, it is too complex. If the explicit loop is four lines for one simple thing, it is too verbose.

**What breaks without this:** Writing `open_orders = [order for order in work_orders if order["status"] is "open"]` — using `is` instead of `==` for string comparison. `is` checks identity (same object in memory). String literals may or may not be the same object depending on Python's string interning. `"open" is "open"` might be `True` (Python often interns short strings), but `status = "op" + "en"; status is "open"` is `False`. Always use `==` for value comparison. The bug is silent — `is` appears to work in simple cases but fails intermittently in complex ones.

---

### 6. Find a specific item by ID

**The problem:** You will need to look up a specific work order by its ID — for the GET `/orders/{id}` endpoint in Lesson 3. A list requires scanning all items to find one by ID.

```python
def find_by_id(orders: list, order_id: int):
    for order in orders:
        if order["id"] == order_id:
            return order
    return None

found = find_by_id(work_orders, 3)
not_found = find_by_id(work_orders, 99)

print(f"Found: {found}")
print(f"Not found: {not_found}")
```

Expected output:
```
Found: {'id': 3, 'title': 'Replace gasket', 'status': 'in_progress', 'priority': 'high'}
Not found: None
```

**Walkthrough:**

`def find_by_id(orders: list, order_id: int):` — defines a function. `orders: list` and `order_id: int` are **type annotations** on the parameters. In plain Python (without Pydantic), these are hints — Python does not enforce them at runtime. But they document intent and enable Pylance's type checking in VS Code. A programmer reading this knows: `orders` should be a list, `order_id` should be an integer.

The function body scans `orders` one item at a time (`for order in orders:`). If it finds an item whose `id` matches `order_id`, it returns immediately. If the loop completes without finding a match, `return None` is reached.

The caller uses `find_by_id(work_orders, 99)` — passes the list and the ID to search for. The return value is either a dict or `None`.

**CS lens — linear search.** This is a **linear search** — O(n) time complexity. For five work orders, it is instant. For 5 million, it would scan half on average before finding a match or reaching the end. The correct data structure for ID-based lookup is a **hash map**: a dict keyed by ID. `orders_by_id = {order["id"]: order for order in work_orders}` creates such a dict. `orders_by_id.get(3)` is O(1) lookup. In Sprint 3, when you use a database, the database's primary key index provides O(log n) lookup — faster than linear scan, though not as fast as a hash map for exact-match lookups.

**SE lens — returning `None` for not-found.** The function returns `None` when no match exists, rather than raising an exception. In Lesson 3, the FastAPI route handler will call this function and check if the result is `None`. If it is, it will return HTTP 404. The logic is: `None` means "does not exist." An exception would mean "something went wrong." These are different situations and should be handled differently. A 404 is not an error — it is a valid answer.

**What breaks without this:** If you forget `return None` and the loop completes without finding a match, Python functions implicitly return `None`. The function still returns `None` — but the intent is unclear. Explicit `return None` documents that this case is expected and handled. In strict TypeScript or Rust, forgetting the return would be a compile error. In Python it is a silent convention violation.

---

### 7. Add a new item and remove one

**The problem:** You need to add new work orders (POST) and remove existing ones (DELETE) — two of the four CRUD operations.

```python
# Add a new work order
new_order = {"id": 6, "title": "Oil bearings", "status": "open", "priority": "low"}
work_orders.append(new_order)
print(f"After append: {len(work_orders)} orders")

# Remove by ID
work_orders = [order for order in work_orders if order["id"] != 4]
print(f"After remove ID 4: {len(work_orders)} orders")
```

Expected output:
```
After append: 6 orders
After remove ID 4: 5 orders
```

**Walkthrough:**

`work_orders.append(new_order)` — appends `new_order` to the end of the list. `append` is a list method. It modifies the list in place (mutates it) and returns `None`. This is O(1) amortised time.

`[order for order in work_orders if order["id"] != 4]` — a list comprehension that builds a new list containing every order whose ID is not 4. This effectively deletes order 4 by exclusion. The variable `work_orders` is reassigned to the new list. The original list (with order 4) is discarded.

`!=` is Python's not-equal operator. `order["id"] != 4` is `True` for every order except the one with ID 4.

**CS lens — deletion by reconstruction.** This delete operation is O(n) — it iterates the entire list. The standard alternative — `list.remove(item)` — also scans the list. For a list-based store, there is no O(1) delete. This is a known limitation of the in-memory list approach and is the primary reason you will replace it with a database in Sprint 3. A hash map (`dict` keyed by ID) would give O(1) delete: `del orders_by_id[4]`. A database table with a primary key index gives O(log n) delete.

**SE lens — immutable update pattern.** Instead of modifying the list in place (`work_orders.remove(item)`), the comprehension creates a new list. This is the **immutable update pattern** — creating a new collection rather than mutating the existing one. Immutable updates make code easier to reason about (the original list is unchanged; the new list reflects the change) and easier to test (you can verify both the old and new state). React uses this pattern for state updates: `setItems(items.filter(item => item.id !== id))` rather than `items.splice(index, 1)`.

**What breaks without this:** Calling `list.remove(item)` where `item` is the dict object itself (not the ID) requires that the exact same dict object be in the list — Python compares by identity, not by the dict's content. `work_orders.remove({"id": 4, ...})` raises `ValueError: list.remove(x): x not in list` because the new dict you created with the same keys is a different object. The filter-by-ID approach avoids this entirely.

---

## Connect the pieces

You have built the data layer that Lesson 3's CRUD API will use: a list of dicts with find, append, and filter operations. Lesson 2 will replace the untyped dicts with Pydantic models — validated, typed data contracts that FastAPI uses to accept input and validate it automatically. Lesson 3 will wire these data operations into HTTP endpoints.

The concepts from this lesson — dict access, list comprehensions, `None` for absence, linear search — are the Python fundamentals that appear in every route handler, every service function, and every test in the remainder of the curriculum.

---

## What breaks without this

**`TypeError: list indices must be integers or slices, not str`:** You used bracket notation on a list with a string key: `work_orders["id"]` instead of `work_orders[0]["id"]`. Lists are indexed by integer position; dicts are indexed by key. `work_orders[0]` gives the first dict; `work_orders[0]["id"]` gives its ID.

**`KeyError: 'status'`:** You accessed a key that does not exist on some dict in the list. This typically means the dicts were created inconsistently — some have the key, others do not. Fix: ensure every dict is created with the same set of keys, or use `.get()` for optional keys.

---

## Definition of done

- [ ] `python3 models_scratch.py` runs without errors and prints the expected output for all sections
- [ ] You can explain what a Python dict is, how it differs from a list, and when to use each
- [ ] You can explain what `None` means in Python and why it is not the same as `0` or `False`
- [ ] You can write a list comprehension with a filter condition without looking it up
- [ ] You can explain why linear search is O(n) and why a dict lookup is O(1)
- [ ] You can explain what `append` does to a list and what it returns

**Git commit:**

```
git add backend/models_scratch.py
git commit -m "Add Python data structure scratch: dict, list, comprehension, and search operations for work orders"
```

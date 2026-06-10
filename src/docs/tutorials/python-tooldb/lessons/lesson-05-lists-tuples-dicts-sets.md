# Python Tool Database — LAB 05 — Lists, Tuples, Dicts, and Sets

**Prerequisites:** Lab 04. You know functions, default arguments, and control flow. `tooldb/sfm_lookup.py` exists with `MATERIAL_SFM_TARGETS` as a dict.

**What this lab adds:**
- `list` — ordered, mutable collection — the workhorse of data storage
- `tuple` — ordered, immutable collection — when the sequence must not change
- `dict` — key-value map — instant lookup by key
- `set` — unordered collection of unique values — fast membership testing
- A `get_sfm_range` function that looks up material-specific SFM ranges, built through Red-Green-Refactor

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A list and a tuple both hold ordered sequences of values. What is the one difference that determines when to use each?
> 2. If a dict lookup (`my_dict["key"]`) is O(1) and a list search (`"key" in my_list`) is O(n), what does that mean in practice for 10,000 records?
> 3. You have a list of 500 tool names and need to check 1000 times whether "EM-0500" is in the collection. Which data structure makes this fast?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have a `get_sfm_range(material)` function that returns a `(min_sfm, max_sfm)` tuple for a given material, plus a `find_tools_by_material` function that filters a list of tool dicts:

```python
get_sfm_range("carbide")   # → (800, 1200)
get_sfm_range("HSS")       # → (100, 300)

tools = [
    {"name": "EM-0500", "material": "carbide"},
    {"name": "DR-0250", "material": "HSS"},
    {"name": "FM-0750", "material": "carbide"},
]
find_tools_by_material(tools, "carbide")
# → [{"name": "EM-0500", ...}, {"name": "FM-0750", ...}]
```

---

## Step 1 — Lists

A `list` is an ordered, mutable collection. "Ordered" means items have positions (index 0, 1, 2...). "Mutable" means you can add, remove, or change items after creation.

Open the REPL: `python`

```python
diameters = [0.125, 0.25, 0.5, 0.75, 1.0]   # create a list with [ ] and comma-separated values

diameters[0]       # → 0.125   (index 0 = first item)
diameters[-1]      # → 1.0     (index -1 = last item)
diameters[1:3]     # → [0.25, 0.5]  (slice: items at index 1 and 2, NOT 3)

len(diameters)     # → 5       (number of items)
```

---

### Concept: `list` — Ordered Mutable Sequence

**What it is:** A collection that holds any number of values in a specific order, with each value accessible by its integer index.

**The problem before:** Storing multiple related values in separate variables:

```python
name_1 = "EM-0500"
name_2 = "DR-0250"
name_3 = "FM-0750"
# cannot iterate over these, cannot pass them to a function as one argument
```

**The solution:**

```python
names = ["EM-0500", "DR-0250", "FM-0750"]   # one variable holds all three
for name in names:                           # iterable: works with for loop
    print(name)
```

**Common list operations:**

```python
tools = ["EM-0500", "DR-0250"]

tools.append("FM-0750")             # add to end → ["EM-0500", "DR-0250", "FM-0750"]
tools.insert(0, "THREAD-0500")      # insert at index 0 → shifts others right
tools.remove("DR-0250")             # remove first occurrence of this value
tools.pop()                         # remove and return the last item
tools.pop(0)                        # remove and return item at index 0

sorted_tools = sorted(tools)        # returns a NEW sorted list — tools is unchanged
tools.sort()                        # sorts tools IN PLACE — modifies tools directly
```

**Indexing rules:**

```python
names = ["a", "b", "c", "d", "e"]
names[0]     # "a"   — first item
names[-1]    # "e"   — last item (counts from end)
names[1:3]   # ["b", "c"] — slice from index 1 up to (not including) 3
names[:2]    # ["a", "b"] — slice from start up to index 2
names[2:]    # ["c", "d", "e"] — slice from index 2 to end
```

**What it hides:** Memory management — lists automatically resize when you append. A C programmer would manage a fixed-size array and manually copy when it fills. Python handles all of that.

**Canonical example (General):**

A shopping list. You add items as you think of them, remove them as you buy them, and read them in order. The order matters (you shop the list in sequence), and the list changes as you shop.

**Project application:** Query results from the database come back as a list of rows. `ToolService.list_tools()` returns a `list` of `Tool` objects. The import function builds a list of `Tool` objects from the Mastercam file.

**Smallest possible example:**

```python
tools = []                              # empty list
tools.append({"name": "EM-0500", "diameter_inches": 0.5})   # add a tool dict
tools.append({"name": "DR-0250", "diameter_inches": 0.25})
print(len(tools))    # → 2
print(tools[0])      # → {'name': 'EM-0500', 'diameter_inches': 0.5}
```

**You will see this again in:** Every Python program. In Block 2 (SQL): `cursor.fetchall()` returns a list of row tuples. In Block 3 (PySide6): `QAbstractTableModel` wraps a list of tools. In Block 9 (Pydantic): validator functions return a list of error messages.

**Watch for:** `list.sort()` modifies in place and returns `None`. A common bug: `sorted_tools = tools.sort()` — `sorted_tools` will be `None`. Use `sorted(tools)` to get a new sorted list without modifying the original.

---

### SAVE AND TRY

In the REPL:

```python
STANDARD_DIAMETERS = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 1.0]

print(f"Count: {len(STANDARD_DIAMETERS)}")
print(f"Smallest: {STANDARD_DIAMETERS[0]}")
print(f"Largest: {STANDARD_DIAMETERS[-1]}")
print(f"Middle three: {STANDARD_DIAMETERS[2:5]}")
```

**You should see:**

```
Count: 7
Smallest: 0.125
Largest: 1.0
Middle three: [0.375, 0.5, 0.625]
```

**Console test:**

```python
0.5 in STANDARD_DIAMETERS    # membership test
```

**Expected:** `True`

**Change something:** Try `STANDARD_DIAMETERS.sort()`. Then `print(STANDARD_DIAMETERS)`. Confirm it is still the same order (already sorted). Try `STANDARD_DIAMETERS.sort(reverse=True)`. Now try `STANDARD_DIAMETERS[0]` — it should be the largest. Change it back.

---

## Step 2 — Tuples

A `tuple` is like a list but immutable — once created, its items cannot be added, removed, or changed.

```python
sfm_range = (800, 1200)     # create a tuple with ( ) and comma-separated values

sfm_range[0]    # → 800     (index access works, same as list)
sfm_range[-1]   # → 1200    (negative index works)

sfm_range.append(1400)   # AttributeError: 'tuple' object has no attribute 'append'
sfm_range[0] = 700       # TypeError: 'tuple' object does not support item assignment
```

---

### Concept: `tuple` — Ordered Immutable Sequence

**What it is:** A sequence that, once created, cannot be changed. Items have positions (indexed 0, 1...) but cannot be modified.

**The problem tuples solve:** A list that represents a "fixed fact" can be accidentally mutated:

```python
sfm_range = [800, 1200]    # if this is a list, someone could do:
sfm_range.append(9999)     # this is now wrong — SFM range has no third value
sfm_range[0] = -5          # this is wrong — negative SFM is impossible
```

Using a tuple communicates intent: "these two values belong together and must not change":

```python
sfm_range = (800, 1200)    # immutable: cannot be changed accidentally
```

**When to use a tuple vs a list:**

| Use a list | Use a tuple |
|-----------|-------------|
| A collection that grows or shrinks | A fixed set of related values |
| Items are all the same "kind" | Items have different roles (first = min, second = max) |
| You will sort or filter it | You will destructure it into named variables |

**Tuple unpacking:** The cleanest use of tuples is immediate destructuring:

```python
sfm_range = (800, 1200)
min_sfm, max_sfm = sfm_range    # unpack into two named variables
print(min_sfm)    # → 800
print(max_sfm)    # → 1200
```

**A function returning multiple values is actually returning a tuple:**

```python
def sfm_range_for_carbide():
    return 800, 1200        # Python sees this as return (800, 1200)

low, high = sfm_range_for_carbide()   # unpack immediately
print(f"Range: {low}–{high} SFM")
```

**Canonical example (General):**

GPS coordinates: `(latitude, longitude)`. These two values belong together and define one location. They are ordered (latitude first), they have different roles (lat ≠ lon), and they should not change once set.

**What it hides:** There is nothing technically different about a tuple's contents — Python still stores the values in memory. What immutability hides is the risk of accidental mutation. The protection is enforced by the Python runtime, not by you.

**Project application:** `get_sfm_range` returns `(min_sfm, max_sfm)` — two related values that belong together. Callers can unpack immediately: `low, high = get_sfm_range("carbide")`.

**Smallest possible example:**

```python
def get_rpm_range(diameter_inches, material_sfm_range):
    min_sfm, max_sfm = material_sfm_range           # unpack tuple
    import math
    min_rpm = round(min_sfm * 12 / (math.pi * diameter_inches))
    max_rpm = round(max_sfm * 12 / (math.pi * diameter_inches))
    return min_rpm, max_rpm                         # returns a tuple

low_rpm, high_rpm = get_rpm_range(0.5, (800, 1200))
print(f"{low_rpm}–{high_rpm} RPM")   # → 6112–9168 RPM
```

**You will see this again in:** Function return values throughout Python. `str.split()` in some contexts, `divmod()`, `enumerate()` — many built-ins return tuples. In database query results (Block 2): `cursor.fetchone()` returns a tuple of column values.

**Watch for:** `(1)` is NOT a one-element tuple — it is just `1` in parentheses. A one-element tuple requires a trailing comma: `(1,)`. This catches everyone at least once.

---

### SAVE AND TRY

In the REPL:

```python
carbide_sfm_range = (800, 1200)   # min and max SFM for carbide tools
hss_sfm_range = (100, 300)        # min and max SFM for HSS tools

min_sfm, max_sfm = carbide_sfm_range   # unpack into named variables
print(f"Carbide range: {min_sfm}–{max_sfm} SFM")
```

**You should see:** `Carbide range: 800–1200 SFM`

**Console test:** Try to modify the tuple:

```python
carbide_sfm_range[0] = 700
```

**Expected:** `TypeError: 'tuple' object does not support item assignment` — the immutability protection working correctly.

**Change something:** Try `type((1))` and `type((1,))`. Confirm that `(1)` is `int` and `(1,)` is `tuple`. This is the one-element tuple trap.

---

## Step 3 — Dicts

A `dict` (dictionary) maps keys to values. Any immutable value can be a key.

```python
sfm_targets = {
    "carbide": 1000,    # key: str → value: int
    "HSS": 200,
    "cobalt": 400,
}

sfm_targets["carbide"]     # → 1000  (lookup by key)
sfm_targets["titanium"]    # → KeyError: 'titanium'

sfm_targets.get("titanium")           # → None (no error if missing)
sfm_targets.get("titanium", 500)      # → 500  (default if missing)
```

---

### Concept: `dict` — Key-Value Map with O(1) Lookup

**What it is:** A collection that maps keys to values, with instant lookup regardless of how many items are in the dict.

**The problem before:** Finding a value in a list requires searching every item:

```python
# Without a dict — searching a list of tuples:
sfm_data = [("carbide", 1000), ("HSS", 200), ("cobalt", 400)]
for material, sfm in sfm_data:   # search every item
    if material == "carbide":
        return sfm               # found it — but checked every item before it
```

With 100 materials, this checks up to 100 pairs. With 10,000, up to 10,000.

**The solution:**

```python
sfm_targets = {"carbide": 1000, "HSS": 200, "cobalt": 400}
sfm_targets["carbide"]   # instant — no search at all
```

**How it works (briefly):** Python applies a **hash function** to the key, producing a number that determines where in memory the value is stored. Lookup `sfm_targets["carbide"]` hashes `"carbide"` and jumps directly to that location. No searching. The time is the same whether the dict has 3 entries or 3 million.

**O(1) vs O(n):** O(1) means the time is constant regardless of size. O(n) means the time grows with size. For 10,000 materials, list search takes up to 10,000 comparisons; dict lookup takes roughly 1. For 1 million, list search takes up to 1 million comparisons; dict lookup still takes roughly 1.

**Common dict operations:**

```python
d = {"a": 1, "b": 2}

d["c"] = 3              # add or update a key
del d["a"]              # remove a key (KeyError if missing)
"b" in d                # → True  (membership test — checks keys)

d.keys()                # → dict_keys(["b", "c"])  (all keys)
d.values()              # → dict_values([2, 3])    (all values)
d.items()               # → dict_items([("b", 2), ("c", 3)])  (key-value pairs)

for key, value in d.items():   # iterate over key-value pairs
    print(f"{key}: {value}")
```

**What it hides:** Hash function computation and collision handling. You provide a key, get a value — the mechanism is invisible.

**Canonical example (General):**

A phone book. You look up "Smith" and immediately get "555-1234." You do not start at A and read every name — you jump directly to Smith. That is O(1) lookup.

**Project application:** `MATERIAL_SFM_TARGETS` in `sfm_lookup.py` is a dict. The tool type to class mapping in Block 4 (Factory pattern) will be a dict. Setup sheet data (XML field names → Tool attributes) is a dict.

**Smallest possible example:**

```python
MATERIAL_SFM_TARGETS = {
    "carbide": 1000,
    "HSS": 200,
    "cobalt": 400,
}

material = "carbide"
if material in MATERIAL_SFM_TARGETS:
    target = MATERIAL_SFM_TARGETS[material]
    print(f"{material}: target {target} SFM")
```

**You will see this again in:** Every Python program. JSON data (Block 11) arrives as a Python dict. In Block 2 (SQL): database row as dict from `row_factory`. In Pydantic (Block 9): model validation uses dicts. In every configuration file that is parsed into Python.

**Watch for:** Dict ordering is guaranteed in Python 3.7+ — keys maintain insertion order. This means `for key in my_dict` iterates in the order keys were added. Before Python 3.7, dicts were unordered — some tutorials still warn about this even though it no longer applies.

---

### SAVE AND TRY

In the REPL:

```python
SFM_RANGES = {
    "carbide": (800, 1200),    # tuple as dict value — allowed
    "HSS":     (100, 300),
    "cobalt":  (300, 500),
}

material = "carbide"
min_sfm, max_sfm = SFM_RANGES[material]   # lookup returns tuple, unpack immediately
print(f"{material}: {min_sfm}–{max_sfm} SFM")
```

**You should see:** `carbide: 800–1200 SFM`

**Console test:**

```python
"titanium" in SFM_RANGES   # membership test on keys
```

**Expected:** `False`

**Change something:** Try `SFM_RANGES.get("titanium", (400, 600))`. What does it return? **Expected:** `(400, 600)` — the default value when the key is missing. Change it back.

---

## Step 4 — Sets

A `set` is an unordered collection of **unique** values. Each value appears at most once.

```python
materials = {"carbide", "HSS", "carbide", "HSS", "cobalt"}   # create with { }
print(materials)   # → {'cobalt', 'HSS', 'carbide'}  — duplicates removed, order not guaranteed

"carbide" in materials   # → True   (fast membership test)
"titanium" in materials  # → False
```

---

### Concept: `set` — Unordered Collection of Unique Values

**What it is:** A collection that stores each value at most once, using the same hash-based approach as dicts for O(1) membership testing.

**The problem sets solve:** Checking "is this value already in the collection?" against a list is O(n) — Python checks every item. Against a set it is O(1):

```python
seen_names = []
for tool in tools:
    if tool["name"] in seen_names:   # O(n) — checks every seen name
        print("duplicate!")
    seen_names.append(tool["name"])

# With a set:
seen_names = set()
for tool in tools:
    if tool["name"] in seen_names:   # O(1) — hash lookup
        print("duplicate!")
    seen_names.add(tool["name"])
```

**Common set operations:**

```python
carbide_tools = {"EM-0500", "FM-0750", "EM-0375"}
hss_tools = {"DR-0250", "DR-0375", "EM-0500"}  # EM-0500 appears in both

carbide_tools & hss_tools    # intersection: {"EM-0500"}         (in both)
carbide_tools | hss_tools    # union: {"EM-0500", "FM-0750", "EM-0375", "DR-0250", "DR-0375"}
carbide_tools - hss_tools    # difference: {"FM-0750", "EM-0375"} (in carbide but not HSS)
```

**When to use a set:**
- Deduplication (remove duplicates from a list: `list(set(items))`)
- Fast membership testing (is this value in the collection?)
- Set operations (which tools are in both the carbide set and the HSS set?)

**Canonical example (General):**

A roll-call list. Each student's name appears once. If you want to know if "Alice" is present, you look up the name — instant answer, regardless of class size.

**What it hides:** Hash computation and memory layout. You add values; Python ensures uniqueness and fast lookup without you managing it.

**Project application:** Tracking which tool names have been imported so far (deduplication during Mastercam import in Block 7). Checking which materials are represented in a tool library.

**Smallest possible example:**

```python
tools = [
    {"name": "EM-0500", "material": "carbide"},
    {"name": "DR-0250", "material": "HSS"},
    {"name": "EM-0750", "material": "carbide"},   # carbide again
]

materials_present = {tool["material"] for tool in tools}   # set comprehension
print(materials_present)   # → {'carbide', 'HSS'}  — each material once
```

**You will see this again in:** Block 7 (Mastercam import): tracking seen tool names to detect duplicates. In Block 9 (validation): checking whether a value is in a set of allowed values. In React (Block 11): JavaScript uses `Set` for the same purpose.

**Watch for:** Sets are unordered — `{1, 2, 3}` might print as `{2, 1, 3}`. Never rely on set iteration order. If order matters, use a list.

---

### SAVE AND TRY

In the REPL:

```python
tool_materials = ["carbide", "HSS", "carbide", "carbide", "cobalt", "HSS"]

unique_materials = set(tool_materials)   # set() removes duplicates
print(f"Unique materials: {unique_materials}")
print(f"Count of originals: {len(tool_materials)}")
print(f"Count unique: {len(unique_materials)}")
```

**You should see:**

```
Unique materials: {'carbide', 'HSS', 'cobalt'}  (order may vary)
Count of originals: 6
Count unique: 3
```

**Console test:**

```python
"cobalt" in unique_materials
"titanium" in unique_materials
```

**Expected:** `True`, `False`

**Change something:** Try `unique_materials.add("titanium")`. Then test `"titanium" in unique_materials`. **Expected:** `True` — sets are mutable (unlike frozensets, which are the immutable version). Change it back.

---

## Step 5 — Red: Write the Tests

Now build `get_sfm_range` and `find_tools_by_material` through Red-Green-Refactor.

Create `tests/test_collections.py`:

```python
from tooldb.tool_data import get_sfm_range, find_tools_by_material   # ← will fail


def test_get_sfm_range_carbide():
    low, high = get_sfm_range("carbide")   # unpack the tuple
    assert low == 800
    assert high == 1200


def test_get_sfm_range_hss():
    low, high = get_sfm_range("HSS")
    assert low == 100
    assert high == 300


def test_get_sfm_range_unknown_material_raises():
    import pytest
    with pytest.raises(ValueError):
        get_sfm_range("unobtanium")


def test_find_tools_by_material_returns_correct_tools():
    tools = [
        {"name": "EM-0500", "material": "carbide"},
        {"name": "DR-0250", "material": "HSS"},
        {"name": "FM-0750", "material": "carbide"},
    ]
    result = find_tools_by_material(tools, "carbide")
    assert len(result) == 2                         # two carbide tools
    assert result[0]["name"] == "EM-0500"
    assert result[1]["name"] == "FM-0750"


def test_find_tools_by_material_returns_empty_for_no_match():
    tools = [{"name": "EM-0500", "material": "carbide"}]
    result = find_tools_by_material(tools, "HSS")
    assert result == []                             # no HSS tools in list
```

Run:

```powershell
pytest tests/test_collections.py
```

**You should see:**

```
ModuleNotFoundError: No module named 'tooldb.tool_data'
```

Red.

---

## Step 6 — Green: Write the Functions

Create `tooldb/tool_data.py`:

```python
SFM_RANGES = {              # material → (min_sfm, max_sfm) tuple
    "carbide": (800, 1200),
    "HSS":     (100, 300),
    "cobalt":  (300, 500),
}
```

Add the first function:

```python
def get_sfm_range(material: str) -> tuple:
    if material not in SFM_RANGES:                            # check before lookup
        raise ValueError(
            f"Unknown material: {material!r}. "
            f"Known materials: {list(SFM_RANGES.keys())}"
        )
    return SFM_RANGES[material]                               # return the (min, max) tuple
```

Run the first three tests:

```powershell
pytest tests/test_collections.py::test_get_sfm_range_carbide tests/test_collections.py::test_get_sfm_range_hss tests/test_collections.py::test_get_sfm_range_unknown_material_raises
```

**You should see:** 3 passed.

Now add the second function:

```python
def find_tools_by_material(tools: list, material: str) -> list:
    return [                          # list comprehension: build a filtered list
        tool                         # each item: the whole tool dict
        for tool in tools            # source: iterate over the input list
        if tool["material"] == material   # filter: only tools with matching material
    ]
```

Run all tests:

```powershell
pytest tests/test_collections.py
```

**You should see:** 5 passed.

---

### Concept: List Comprehension — Declarative Filtering

**What it is:** A one-expression way to build a list by filtering or transforming another sequence. Introduced briefly in Lab 00i; used in production here.

**The problem before (imperative):**

```python
def find_tools_by_material(tools, material):
    result = []                         # step 1: empty list
    for tool in tools:                  # step 2: iterate
        if tool["material"] == material: # step 3: check condition
            result.append(tool)         # step 4: collect match
    return result                       # step 5: return
```

Five lines to say "give me the tools where material matches."

**The solution (declarative):**

```python
return [tool for tool in tools if tool["material"] == material]
```

One line. Same result. The list comprehension syntax:

```
[expression  for  item  in  sequence  if  condition]
```

- **expression**: what to put in the new list (here: the whole `tool` dict)
- **for item in sequence**: iterate over the source
- **if condition**: optional filter — only include items where condition is True

**When to use list comprehension vs `for` loop:** Use a list comprehension when the result is a new list and the logic fits on one line. Use a `for` loop when the logic is complex, has side effects, or builds something other than a list.

**You will see this again in:** Throughout this project. In Block 4 (polymorphic types): `[t for t in tools if isinstance(t, EndMill)]`. In Block 7 (Mastercam import): `[parse_row(row) for row in raw_rows]`.

**Watch for:** Nested list comprehensions (a comprehension inside a comprehension) become hard to read quickly. If it does not fit clearly on one line, use a `for` loop.

---

## Step 7 — Refactor: All Tests Green

Run the full test suite:

```powershell
pytest tests/
```

**You should see:** All tests pass.

**Console test:** Try the functions in the REPL:

```python
from tooldb.tool_data import get_sfm_range, find_tools_by_material

low, high = get_sfm_range("carbide")
print(f"Carbide: {low}–{high} SFM")

tools = [
    {"name": "EM-0500", "material": "carbide"},
    {"name": "DR-0250", "material": "HSS"},
    {"name": "FM-0750", "material": "carbide"},
    {"name": "THREAD-0500", "material": "cobalt"},
]

carbide_tools = find_tools_by_material(tools, "carbide")
print(f"Carbide tools: {[t['name'] for t in carbide_tools]}")
```

**You should see:**

```
Carbide: 800–1200 SFM
Carbide tools: ['EM-0500', 'FM-0750']
```

**Change something:** Change `get_sfm_range("carbide")` to `get_sfm_range("CARBIDE")` (uppercase). What happens? **Expected:** `ValueError` — the key is case-sensitive. In a real system, you would normalize the input: `material.lower()` before lookup. Leave it as-is for now; that will be a validation task in Block 9.

---

## 🎯 Challenge: Summarize a Tool Collection

**You know:** Lists, tuples, dicts, sets, list comprehensions.

**Task:** Write a function `summarize_tools(tools: list) -> dict` in `tooldb/tool_data.py` that returns a summary dict:

```python
{
    "total": 4,
    "materials": {"carbide", "HSS", "cobalt"},   # set — each material once
    "smallest_diameter": 0.25,
    "largest_diameter": 1.0,
}
```

Write the test first. Test with this data:

```python
tools = [
    {"name": "EM-0500", "material": "carbide", "diameter_inches": 0.5},
    {"name": "DR-0250", "material": "HSS",     "diameter_inches": 0.25},
    {"name": "FM-0750", "material": "carbide", "diameter_inches": 0.75},
    {"name": "THREAD-1000", "material": "cobalt", "diameter_inches": 1.0},
]
```

**Hints:**
1. `{tool["material"] for tool in tools}` is a set comprehension — same syntax as list comprehension but with `{}`
2. `min(value for value in ...)` and `max(...)` find the smallest and largest values
3. `len(tools)` gives the total count

---

<details>
<summary>▶ Show Solution</summary>

**Test first** (add to `tests/test_collections.py`):

```python
def test_summarize_tools():
    from tooldb.tool_data import summarize_tools

    tools = [
        {"name": "EM-0500",    "material": "carbide", "diameter_inches": 0.5},
        {"name": "DR-0250",    "material": "HSS",     "diameter_inches": 0.25},
        {"name": "FM-0750",    "material": "carbide", "diameter_inches": 0.75},
        {"name": "THREAD-1000","material": "cobalt",  "diameter_inches": 1.0},
    ]
    result = summarize_tools(tools)

    assert result["total"] == 4
    assert result["materials"] == {"carbide", "HSS", "cobalt"}   # set equality
    assert result["smallest_diameter"] == 0.25
    assert result["largest_diameter"] == 1.0
```

**Then the function** (add to `tooldb/tool_data.py`):

```python
def summarize_tools(tools: list) -> dict:
    if not tools:                                     # empty list → empty summary
        return {"total": 0, "materials": set(), "smallest_diameter": None, "largest_diameter": None}

    diameters = [tool["diameter_inches"] for tool in tools]   # list of all diameters
    materials = {tool["material"] for tool in tools}          # set: unique materials

    return {
        "total": len(tools),
        "materials": materials,
        "smallest_diameter": min(diameters),
        "largest_diameter": max(diameters),
    }
```

**Key insight:** `{tool["material"] for tool in tools}` is a **set comprehension** — same shape as a list comprehension but with `{}` instead of `[]`. It automatically deduplicates. `[tool["diameter_inches"] for tool in tools]` is a list comprehension that extracts diameters so `min()` and `max()` can work on them. Each built-in function (`len`, `min`, `max`, `set`) does one job, and composing them produces the summary.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `get_sfm_range("carbide")` returns `(800, 1200)` | `pytest tests/test_collections.py::test_get_sfm_range_carbide` |
| Unknown material raises `ValueError` | `test_get_sfm_range_unknown_material_raises` passes |
| `find_tools_by_material` returns matching tools | `test_find_tools_by_material_returns_correct_tools` passes |
| Empty list returned for no match | `test_find_tools_by_material_returns_empty_for_no_match` passes |
| All previous tests still pass | `pytest tests/` — no regressions |
| Can explain O(1) vs O(n) in one sentence | Dict lookup is constant time; list search grows with size |
| Can state when to use list vs tuple vs dict vs set | List=ordered mutable, Tuple=fixed sequence, Dict=key lookup, Set=unique membership |

---

## Quick Check Answers

**1. List vs tuple — the one difference:**

Mutability. A `list` can be modified after creation — you can append, remove, or change items. A `tuple` cannot — once created, it is fixed. Use a list for collections that grow or change (tool records from a query, accumulated results, work-in-progress). Use a tuple for values that are logically fixed and belong together (an SFM range `(800, 1200)`, GPS coordinates, a function returning two values). The immutability of a tuple is a signal to the reader: "these values are fixed — they should not change."

**2. O(1) vs O(n) for 10,000 records:**

O(1) means the time is constant — looking up key `"carbide"` in a dict with 10,000 entries takes approximately the same time as looking it up in a dict with 3 entries. O(n) means the time grows linearly — searching a list of 10,000 items takes up to 10,000 comparisons. At small scale (under 100 items) this difference is imperceptible. At large scale (100,000+ tool records), it becomes significant: a dict-based lookup completes in microseconds; a list search takes milliseconds or more. In a tool database with thousands of entries being queried repeatedly, this matters.

**3. Which structure for fast membership testing of 500 names, checked 1000 times?**

A `set`. Convert the list to a set once: `name_set = set(tool_names)`. Then `"EM-0500" in name_set` is O(1) for each of the 1000 checks. Using the original list, each `in` check scans up to 500 items, so 1000 checks could scan up to 500,000 items total. The set reduces that to 1000 hash lookups. The conversion `set(tool_names)` is a one-time O(n) cost that is amortized across all subsequent checks.

// Chapter 0.6 — Lesson 17: Mutability
//
// DEPENDENCIES:
//   - Lesson 15: Lists (mutation, aliasing, copy)
//   - Lesson 16: Dicts (same aliasing gotcha)
//
// TEACHES:
//   1.  Mutable vs immutable — the core distinction
//   2.  Immutable types: int, float, str, tuple, frozenset, bytes
//   3.  Mutable types: list, dict, set, bytearray, custom objects
//   4.  Why mutation matters — shared references
//   5.  id() and is — identity vs equality
//   6.  Rebinding vs mutation — what += actually does on each type
//   7.  Strings are immutable — every "change" is a new object
//   8.  Tuples are immutable but can contain mutable items
//   9.  Shallow copy vs deep copy
//   10. Function arguments — pass by object reference
//   11. Mutable default arguments — the classic Python gotcha
//   12. Immutability enables hashing — why dicts require hashable keys

export default {
  id: 'py-0-6-mutability',
  slug: 'mutability',
  chapter: 0.6,
  order: 17,
  title: 'Mutability',
  subtitle: 'Why some objects can change in place — and others cannot',
  tags: ['mutable', 'immutable', 'id', 'is', 'copy', 'deepcopy', 'tuple', 'reference', 'alias', 'hashable'],

  hook: {
    question: 'When you assign a variable, do you get the value — or a reference to it?',
    realWorldContext:
      'Two variables pointing at the same list means changing one changes both. ' +
      'A string you "modify" is actually a brand-new object every time. ' +
      'A function that receives a list can mutate the caller\'s data without warning. ' +
      'Understanding mutability is the single most important concept for reasoning about ' +
      'Python programs correctly — and avoiding subtle, hard-to-debug bugs.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Every Python object is either **mutable** (can be changed after creation) or **immutable** (frozen forever). Mutation means altering the object\'s contents in place — the same object, same memory address, different data. Immutability means any operation that "changes" a value must create a brand-new object.',
      'The distinction matters because Python variables are **names that point to objects**, not boxes that contain values. When two names point to the same mutable object, a mutation through either name is visible through both. With immutable objects this can never happen — every apparent change points the name at a new object.',
      'This model is called **pass by object reference** (sometimes "pass by assignment"). Understanding it eliminates an entire category of confusing bugs around function side-effects, default arguments, and list copying.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'Mutable: list, dict, set — Immutable: int, float, str, tuple, frozenset',
        body: 'Memorise this split. When in doubt, try `id()` before and after an operation — if the id changes, a new object was created; if it stays the same, the object was mutated in place.',
      },
      {
        type: 'warning',
        title: 'Mutable default arguments are a classic Python trap',
        body: 'Never use `def f(x, data=[]):` — the list is created once and shared across all calls. Use `def f(x, data=None): if data is None: data = []` instead.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'The Mutability Model',
        mathBridge: 'Think of variables as pointers in C, or references in Java. `a = b` copies the pointer, not the pointed-to data. Mutation changes what the pointer points to; rebinding moves the pointer to a new location.',
        caption: 'Each cell builds one piece of the mutability mental model.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'The core distinction — mutable vs immutable',
              prose: 'Mutable objects can be changed in place after creation. Immutable objects cannot — every apparent modification produces a new object. The type determines which category an object belongs to.',
              code: '# Mutable types\nlst = [1, 2, 3]\nlst.append(4)     # same object, now has 4 elements\nprint(id(lst))    # same address before and after\n\nd = {"a": 1}\nd["b"] = 2        # same object, new key added\nprint(id(d))\n\n# Immutable types\ns = "hello"\nt = (1, 2, 3)\nn = 42\n# s[0] = "H"   # TypeError — strings are immutable\n# t[0] = 99    # TypeError — tuples are immutable',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'id() — every object has a unique identity',
              prose: '`id(x)` returns a unique integer identifying the object — in CPython this is its memory address. If two variables have the same `id`, they point to the exact same object. Use `id()` to verify whether an operation created a new object or mutated the existing one.',
              code: 'a = [1, 2, 3]\nprint("before append:", id(a))\na.append(4)\nprint("after append: ", id(a))   # same — mutation\n\nb = "hello"\nprint("\\nbefore + :", id(b))\nb = b + " world"\nprint("after + :  ", id(b))      # different — new string object',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'is vs == — identity vs equality',
              prose: '`==` tests whether two objects have the same **value**. `is` tests whether they are the exact **same object** (same `id`). Two different lists can be equal (`==`) without being identical (`is`).',
              code: 'a = [1, 2, 3]\nb = [1, 2, 3]\nc = a\n\nprint(a == b)   # True  — same values\nprint(a is b)   # False — different objects\nprint(a is c)   # True  — same object, c is an alias\n\n# Small integers and interned strings are a special case:\nx = 256\ny = 256\nprint(x is y)   # True — CPython caches small ints\n\nx = 1000\ny = 1000\nprint(x is y)   # May be False — large ints not cached',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Shared references — the aliasing problem',
              prose: 'When you assign one variable to another, both names point to the **same object**. Mutating through either name affects what the other sees. This surprises programmers coming from languages where assignment copies values.',
              code: 'a = [1, 2, 3]\nb = a           # b is an alias — NOT a copy\n\nb.append(4)\nprint(a)        # [1, 2, 3, 4] — a changed too!\nprint(b)        # [1, 2, 3, 4]\nprint(a is b)   # True\n\n# Fix: copy first\nc = a.copy()    # or list(a) or a[:]\nc.append(99)\nprint(a)        # [1, 2, 3, 4] — a unchanged\nprint(c)        # [1, 2, 3, 4, 99]',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Rebinding vs mutation — what += really does',
              prose: '`+=` behaves **differently** on mutable vs immutable types. On an immutable (int, str, tuple), `x += y` creates a new object and rebinds the name. On a mutable (list), `x += y` calls `__iadd__` which mutates in place and keeps the same id.',
              code: '# Immutable — rebinding\nn = 10\nprint(id(n))\nn += 5\nprint(id(n))   # different — new int object\n\ns = "hello"\nprint(id(s))\ns += " world"\nprint(id(s))   # different — new string object\n\n# Mutable — in-place mutation\nlst = [1, 2]\nprint(id(lst))\nlst += [3, 4]   # calls lst.__iadd__([3, 4])\nprint(id(lst))  # SAME — mutated in place\nprint(lst)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'Strings are immutable — every change is a new object',
              prose: 'String "modification" always produces a new string object. This has performance implications: building a string with `+=` in a loop creates O(n) intermediate strings. The idiomatic fix is to accumulate parts in a list and join at the end.',
              code: '# Naive string building — O(n²) copies\nresult = ""\nfor word in ["the", "quick", "brown", "fox"]:\n    result += word + " "\nprint(result.strip())\n\n# Idiomatic — collect then join — O(n)\nparts = []\nfor word in ["the", "quick", "brown", "fox"]:\n    parts.append(word)\nresult = " ".join(parts)\nprint(result)\n\n# String methods always return new strings:\ns = "hello"\nprint(s.upper() is s)  # False — new object\nprint(s)               # still "hello"',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 7,
              cellTitle: 'Tuples are immutable — but can hold mutable items',
              prose: 'A tuple\'s structure is frozen: you cannot add, remove, or replace its elements. However, if an element is itself mutable (like a list), you can mutate the object that element points to — the tuple still holds the same reference, but the referenced object changed.',
              code: 't = (1, [2, 3], 4)\n# t[0] = 99         # TypeError — cannot rebind\n# t[1] = [99]       # TypeError — cannot rebind\nt[1].append(99)    # OK — mutating the list the tuple points to\nprint(t)           # (1, [2, 3, 99], 4)\n\n# This means a tuple with a list element is NOT hashable:\ntry:\n    hash(t)\nexcept TypeError as e:\n    print(e)   # unhashable type: "list"\n\n# A tuple of only immutables IS hashable:\npt = (3, 4)\nprint(hash(pt))   # works fine',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 8,
              cellTitle: 'Shallow copy — one level deep',
              prose: 'A shallow copy creates a new container but fills it with the **same references** as the original. Top-level elements are independent, but nested mutable objects are still shared. Use `.copy()`, `list()`, `dict()`, or the `copy` module\'s `copy()` function.',
              code: 'import copy\n\norig = [[1, 2], [3, 4], [5, 6]]\nshallow = orig.copy()        # or list(orig) or orig[:]\n\n# Top-level independence:\nshallow.append([7, 8])\nprint(len(orig))   # 3 — original unchanged\n\n# But nested lists are still shared:\nshallow[0].append(99)\nprint(orig[0])     # [1, 2, 99] — orig affected!\nprint(shallow[0])  # [1, 2, 99]\nprint(orig[0] is shallow[0])  # True — same object',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 9,
              cellTitle: 'Deep copy — fully independent clone',
              prose: '`copy.deepcopy()` recursively copies every object in the structure. The result is completely independent — no shared references at any depth. Use it when you need a true independent snapshot of nested data.',
              code: 'import copy\n\norig = [[1, 2], [3, 4], [5, 6]]\ndeep = copy.deepcopy(orig)\n\ndeep[0].append(99)\nprint(orig[0])   # [1, 2]     — original untouched\nprint(deep[0])   # [1, 2, 99] — only deep affected\n\nprint(orig[0] is deep[0])  # False — different objects\n\n# Deep copy works on dicts too:\noriginal = {"scores": [10, 20, 30]}\nclone = copy.deepcopy(original)\nclone["scores"].append(40)\nprint(original)  # {"scores": [10, 20, 30]} — untouched',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 10,
              cellTitle: 'Function arguments — pass by object reference',
              prose: 'Python passes the **reference** to the object, not a copy of the object. If the function mutates the argument (e.g., appends to a list), the caller sees the change. If it rebinds the parameter (e.g., `lst = []`), the caller\'s variable is unaffected.',
              code: 'def add_item(lst, item):\n    lst.append(item)   # mutates the caller\'s list\n\nmy_list = [1, 2, 3]\nadd_item(my_list, 99)\nprint(my_list)   # [1, 2, 3, 99] — changed!\n\ndef replace_list(lst):\n    lst = [100, 200]   # rebinds local name only\n\nmy_list2 = [1, 2, 3]\nreplace_list(my_list2)\nprint(my_list2)  # [1, 2, 3] — unchanged\n\n# Immutable args cannot be mutated:\ndef try_change(n):\n    n += 1\n\nnum = 5\ntry_change(num)\nprint(num)  # 5 — immutable, rebinding is local',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 11,
              cellTitle: 'Mutable default arguments — the classic gotcha',
              prose: 'Default argument values are evaluated **once** when the function is defined, not each time it is called. A mutable default (like `[]` or `{}`) is therefore shared across all calls that use the default — it accumulates state.',
              code: '# THE BUG:\ndef broken_append(item, lst=[]):\n    lst.append(item)\n    return lst\n\nprint(broken_append(1))    # [1]\nprint(broken_append(2))    # [1, 2]  — not [2]!\nprint(broken_append(3))    # [1, 2, 3]\n\n# THE FIX: use None as the sentinel\ndef safe_append(item, lst=None):\n    if lst is None:\n        lst = []       # new list each call\n    lst.append(item)\n    return lst\n\nprint(safe_append(1))    # [1]\nprint(safe_append(2))    # [2]\nprint(safe_append(3))    # [3]',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 12,
              cellTitle: 'Immutability enables hashing — why dict keys must be hashable',
              prose: 'A hash value for an object must never change while the object exists in a hash table. Immutable objects can be safely hashed because their content cannot change. Mutable objects cannot be hashed. This is why only immutable types work as dict keys or set members.',
              code: '# Hashable (immutable) — OK as dict keys / set members\nprint(hash(42))           # works\nprint(hash(3.14))         # works\nprint(hash("hello"))      # works\nprint(hash((1, 2, 3)))    # works — tuple of hashables\n\n# Unhashable (mutable) — forbidden\ntry:\n    hash([1, 2, 3])\nexcept TypeError as e:\n    print(e)  # unhashable type: "list"\n\ntry:\n    hash({"a": 1})\nexcept TypeError as e:\n    print(e)  # unhashable type: "dict"\n\n# Use a tuple as a dict key instead of a list:\ngrid = {}\ngrid[(0, 0)] = "start"\ngrid[(3, 4)] = "end"\nprint(grid[(0, 0)])',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 13,
              cellTitle: 'frozenset — an immutable set',
              prose: '`frozenset` is the immutable counterpart to `set`. It supports all non-mutating set operations (union, intersection, `in`, `len`) but cannot be modified after creation. Because it is immutable, it is hashable and can be used as a dict key or stored inside a set.',
              code: 'fs = frozenset([1, 2, 3, 2, 1])\nprint(fs)             # frozenset({1, 2, 3})\nprint(hash(fs))       # works — it\'s hashable\n\n# Use frozenset as a dict key:\ngroup_scores = {}\ng1 = frozenset(["Alice", "Bob"])\ng2 = frozenset(["Carol", "Dave"])\ngroup_scores[g1] = 95\ngroup_scores[g2] = 88\nprint(group_scores)\n\n# Set operations still work:\na = frozenset([1, 2, 3])\nb = frozenset([2, 3, 4])\nprint(a & b)   # frozenset({2, 3})\nprint(a | b)   # frozenset({1, 2, 3, 4})',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 14,
              cellTitle: 'Mutability and equality for containers',
              prose: '`==` on containers does a deep element-wise comparison. Two lists are equal if they have the same elements in the same order, regardless of whether they are the same object. `is` checks object identity — only True if both names point to the exact same object.',
              code: 'a = [1, [2, 3], 4]\nb = [1, [2, 3], 4]\nprint(a == b)    # True  — same structure and values\nprint(a is b)    # False — different objects\n\n# Nested equality:\nprint(a[1] == b[1])  # True  — [2,3] == [2,3]\nprint(a[1] is b[1])  # False — different inner lists\n\n# dict equality:\nd1 = {"x": 1, "y": 2}\nd2 = {"y": 2, "x": 1}   # different insertion order\nprint(d1 == d2)          # True — same key-value pairs\nprint(d1 is d2)          # False\n\n# Tuple equality:\nprint((1, 2, 3) == (1, 2, 3))   # True\nprint((1, 2, 3) is (1, 2, 3))   # usually False (may vary)',
              output: '', status: 'idle', figureJson: null,
            },
            // CHALLENGES
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Spot the alias',
              difficulty: 'easy',
              prompt: 'The function below mutates its argument instead of returning a copy. Fix `top_scores` so the original list is never changed.',
              code: 'def top_scores(scores):\n    scores.sort(reverse=True)\n    return scores\n\noriginal = [42, 7, 99, 3]\nresult = top_scores(original)\nprint("result  :", result)\nprint("original:", original)  # should still be [42, 7, 99, 3]\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'top_scores' not in dir():
    res = "ERROR: Function 'top_scores' not defined."
else:
    original = [42, 7, 99, 3]
    result = top_scores(original)
    if result != [99, 42, 7, 3]:
        res = f"ERROR: Expected [99,42,7,3], got {result}."
    elif original != [42, 7, 99, 3]:
        res = "ERROR: Original list was mutated — use sorted() or copy first."
    else:
        res = "SUCCESS: top_scores returns sorted copy without mutating original."
res
`,
              hint: 'Use sorted(scores, reverse=True) which returns a new list instead of sorting in place.',
            },
            {
              id: 'c2',
              challengeType: 'fill',
              challengeNumber: 2,
              challengeTitle: 'Fix the mutable default',
              difficulty: 'easy',
              prompt: 'Fill in the two blanks so that each call without an explicit `results` argument gets a fresh list — not the shared default.',
              starterBlock: `def collect(item, results=___):
    if results is ___:
        results = []
    results.append(item)
    return results

print(collect("a"))   # ["a"]
print(collect("b"))   # ["b"]  (not ["a", "b"]!)
`,
              code: `def collect(item, results=___):
    if results is ___:
        results = []
    results.append(item)
    return results

print(collect("a"))   # ["a"]
print(collect("b"))   # ["b"]  (not ["a", "b"]!)
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'collect' not in dir():
    res = "ERROR: Function 'collect' not defined."
else:
    r1 = collect("a")
    r2 = collect("b")
    r3 = collect("c", ["x"])
    if r1 != ["a"]:
        res = f"ERROR: First call returned {r1}, expected ['a']."
    elif r2 != ["b"]:
        res = f"ERROR: Second call returned {r2}, expected ['b'] — default is being shared."
    elif r3 != ["x", "c"]:
        res = f"ERROR: Explicit list call returned {r3}, expected ['x', 'c']."
    else:
        res = "SUCCESS: collect uses None sentinel correctly — no shared state."
res
`,
              hint: 'Use None as the default: `results=None`. Then check `if results is None: results = []`.',
            },
            {
              id: 'c3',
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Deep copy a nested structure',
              difficulty: 'medium',
              prompt: 'Write `clone_records(records)` that returns a fully independent deep copy of a list of lists. Mutating an inner list in the clone must not affect the original.',
              code: 'import copy\n\ndef clone_records(records):\n    pass  # return a deep copy\n\ndata = [[90, 85, 78], [60, 70, 80], [95, 92, 88]]\nclone = clone_records(data)\nclone[0].append(100)\nprint("original:", data[0])   # should not contain 100\nprint("clone:   ", clone[0])  # should contain 100\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
import copy
if 'clone_records' not in dir():
    res = "ERROR: Function 'clone_records' not defined."
else:
    data = [[1, 2], [3, 4]]
    clone = clone_records(data)
    clone[0].append(99)
    if data[0] != [1, 2]:
        res = f"ERROR: Original inner list was modified to {data[0]} — use deepcopy."
    elif clone[0] != [1, 2, 99]:
        res = f"ERROR: Clone inner list is {clone[0]}, expected [1, 2, 99]."
    elif data is clone:
        res = "ERROR: clone_records returned the same object, not a copy."
    else:
        res = "SUCCESS: Deep copy verified — original untouched after mutating clone."
res
`,
              hint: 'import copy and use copy.deepcopy(records).',
            },
            {
              id: 'c4',
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Group average with frozenset keys',
              difficulty: 'medium',
              prompt: 'Write `group_average(groups, scores)` that maps each frozenset of student names to the average score of that group. Use frozensets as dict keys.',
              code: 'def group_average(groups, scores):\n    pass\n\nscores = {"Alice": 90, "Bob": 80, "Carol": 70, "Dave": 60}\ngroups = [\n    frozenset(["Alice", "Bob"]),\n    frozenset(["Carol", "Dave"]),\n]\nresult = group_average(groups, scores)\nfor group, avg in result.items():\n    print(sorted(group), "->", avg)\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'group_average' not in dir():
    res = "ERROR: Function 'group_average' not defined."
else:
    scores = {"Alice": 90, "Bob": 80, "Carol": 70, "Dave": 60}
    groups = [frozenset(["Alice", "Bob"]), frozenset(["Carol", "Dave"])]
    result = group_average(groups, scores)
    ab = result.get(frozenset(["Alice", "Bob"]))
    cd = result.get(frozenset(["Carol", "Dave"]))
    if not isinstance(result, dict):
        res = f"ERROR: Expected a dict, got {type(result)}."
    elif ab != 85.0:
        res = f"ERROR: Alice+Bob average should be 85.0, got {ab}."
    elif cd != 65.0:
        res = f"ERROR: Carol+Dave average should be 65.0, got {cd}."
    else:
        res = "SUCCESS: group_average correctly maps frozenset groups to averages."
res
`,
              hint: 'Iterate over groups: for g in groups: result[g] = sum(scores[n] for n in g) / len(g)',
            },
            {
              id: 'c5',
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Non-mutating config merge',
              difficulty: 'medium',
              prompt: 'Write `apply_overrides(base_config, overrides)` that returns a new dict with overrides applied, leaving `base_config` unchanged. Compound: dict unpacking, mutability.',
              code: 'def apply_overrides(base_config, overrides):\n    pass\n\nbase = {"debug": False, "timeout": 30, "retries": 3}\noverrides = {"debug": True, "timeout": 60}\nnew_cfg = apply_overrides(base, overrides)\nprint(new_cfg)\nprint(base)  # must still be {"debug": False, "timeout": 30, "retries": 3}\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'apply_overrides' not in dir():
    res = "ERROR: Function 'apply_overrides' not defined."
else:
    base = {"debug": False, "timeout": 30, "retries": 3}
    overrides = {"debug": True, "timeout": 60}
    new_cfg = apply_overrides(base, overrides)
    if new_cfg.get("debug") != True:
        res = f"ERROR: debug should be True in result, got {new_cfg.get('debug')}."
    elif new_cfg.get("timeout") != 60:
        res = f"ERROR: timeout should be 60 in result, got {new_cfg.get('timeout')}."
    elif new_cfg.get("retries") != 3:
        res = f"ERROR: retries from base should be preserved, got {new_cfg.get('retries')}."
    elif base.get("debug") != False:
        res = "ERROR: base_config was mutated — return a new dict instead."
    elif base is new_cfg:
        res = "ERROR: Returned the same dict object — must return a new one."
    else:
        res = "SUCCESS: apply_overrides returns merged dict without mutating base."
res
`,
              hint: 'return {**base_config, **overrides} — overrides keys win when there are conflicts.',
            },
          ],
        },
      },
    ],
  },
}

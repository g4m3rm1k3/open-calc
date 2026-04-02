// Chapter 0.6 — Lesson 16: Dictionaries
//
// DEPENDENCIES:
//   - Lesson 15: Lists (iteration patterns, comprehensions, map/filter carry over)
//
// TEACHES:
//   1.  Dict literal — {key: value} syntax
//   2.  Empty dict and isinstance check
//   3.  Accessing values — d[key] and KeyError
//   4.  .get(key, default) — safe access without KeyError
//   5.  Adding and updating keys
//   6.  Deleting keys — del d[key] and .pop(key, default)
//   7.  .keys(), .values(), .items() — the three views
//   8.  Looping — keys by default; unpacking with .items()
//   9.  in operator — tests keys (not values)
//   10. len(), truthiness of empty dict
//   11. Nested dicts — access and mutation
//   12. Dict comprehension — {k: v for ...}
//   13. .update() — merge another dict in place
//   14. {**a, **b} and | operator — non-mutating merge
//   15. dict.fromkeys(keys, default) — build from a key list
//   16. .setdefault(key, default) — insert only if missing
//   17. .copy() and aliasing — same gotcha as lists
//   18. Iterating and modifying — the danger and fix
//   19. Sorting a dict by keys or values
//   20. Inverting a dict — swap keys and values
//   21. Converting between dicts and lists of tuples
//   22. ** unpacking in function calls
//   23. collections.Counter — frequency counting
//   24. collections.defaultdict — auto-initialised values
//   25. dict as a dispatch table — functions as values

export default {
  id: 'py-0-6-dicts',
  slug: 'dictionaries',
  chapter: 0.6,
  order: 16,
  title: 'Dictionaries',
  subtitle: 'Key-value mapping — the most versatile data structure in Python',
  tags: ['dict', 'keys', 'values', 'items', 'get', 'setdefault', 'comprehension', 'Counter', 'defaultdict', 'merge'],

  hook: {
    question: 'What if you want to look things up by name instead of position?',
    realWorldContext:
      'A list answers "what is at position 3?" A dictionary answers "what is the score for Alice?" ' +
      'Dictionaries map arbitrary keys to values — a phone book, a JSON object, a config file, ' +
      'a word frequency count, a database record. Nearly every Python program uses dicts heavily. ' +
      'As of Python 3.7 they also maintain insertion order, making them even more useful.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A dict is written as `{key: value, key: value, ...}`. Keys must be **hashable** (immutable: strings, numbers, tuples). Values can be anything. Each key is unique — assigning to an existing key overwrites its value.',
      'The core operation is lookup: `d[key]` returns the value in O(1) time regardless of dict size. This is fundamentally different from a list where you search linearly. Under the hood, Python uses a hash table.',
      'Three views give you flexible access: `.keys()` for just the keys, `.values()` for just the values, `.items()` for `(key, value)` pairs. All three are live — they reflect changes to the dict immediately.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'Keys must be hashable — values can be anything',
        body: 'Strings, integers, floats, tuples of hashable items → valid keys. Lists, dicts, sets → invalid keys (they are mutable and unhashable). Values have no restrictions.',
      },
      {
        type: 'insight',
        title: 'Dicts are ordered since Python 3.7',
        body: 'Iteration and `.keys()` always return items in insertion order. This is guaranteed by the language spec, not just an implementation detail.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'The Key-Value Engine',
        mathBridge: 'A dict is a mathematical function with a finite domain: f: key → value, where lookup is O(1).',
        caption: 'Every cell teaches one new dict concept. Build the mental model progressively.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Creating a dict literal',
              prose: 'Curly braces with `key: value` pairs separated by commas. Keys are typically strings but can be any hashable type.',
              code: 'person = {"name": "Alice", "age": 30, "city": "NYC"}\nperson',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Empty dict and type checking',
              prose: '`{}` is an empty dict (not a set — use `set()` for an empty set). `isinstance(x, dict)` checks the type. An empty dict is falsy; any non-empty dict is truthy.',
              code: 'empty = {}\nprint(isinstance(empty, dict))   # True\nprint(bool(empty))               # False\nprint(bool({"a": 1}))            # True\n\n# {} vs set()\nprint(type({}))      # <class \'dict\'>\nprint(type(set()))   # <class \'set\'>',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'd[key] — access by key, KeyError if missing',
              prose: '`d[key]` returns the value for that key. If the key does not exist, Python raises a `KeyError`. This is the fast O(1) lookup that makes dicts powerful.',
              instructions: 'Uncomment the last line to see KeyError.',
              code: 'scores = {"Alice": 92, "Bob": 85, "Carol": 78}\nprint(scores["Alice"])     # 92\nprint(scores["Carol"])     # 78\n# print(scores["David"])   # KeyError: "David"',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: '.get(key, default) — safe access without KeyError',
              prose: '`.get(key)` returns the value if the key exists, or `None` if it does not. `.get(key, default)` returns `default` instead of `None` for missing keys. Never raises KeyError.',
              code: 'scores = {"Alice": 92, "Bob": 85}\nprint(scores.get("Alice"))          # 92\nprint(scores.get("David"))          # None\nprint(scores.get("David", 0))       # 0 — explicit default\nprint(scores.get("David", "N/A"))   # "N/A"',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Adding and updating keys',
              prose: 'Assigning to a key that exists **overwrites** its value. Assigning to a new key **adds** it. Both use the same syntax: `d[key] = value`.',
              code: 'd = {"x": 1, "y": 2}\nd["z"] = 3          # add new key\nd["x"] = 99         # overwrite existing\nprint(d)            # {"x": 99, "y": 2, "z": 3}',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'del and .pop() — removing keys',
              prose: '`del d[key]` removes the key; raises `KeyError` if missing. `.pop(key)` removes and returns the value; `.pop(key, default)` is safe (returns default if missing).',
              code: 'd = {"a": 1, "b": 2, "c": 3, "d": 4}\ndel d["a"]\nprint(d)\n\nval = d.pop("b")        # removes and returns 2\nprint(val, d)\n\nsafe = d.pop("z", -1)   # key missing — returns -1, no error\nprint(safe)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 7,
              cellTitle: '.keys(), .values(), .items() — the three views',
              prose: 'These return **view objects** — live windows into the dict. They update automatically if the dict changes. Wrap in `list()` to get a snapshot.',
              code: 'd = {"a": 1, "b": 2, "c": 3}\nprint(list(d.keys()))    # ["a", "b", "c"]\nprint(list(d.values()))  # [1, 2, 3]\nprint(list(d.items()))   # [("a",1), ("b",2), ("c",3)]\n\n# views are live:\nd["d"] = 4\nkeys_view = d.keys()\nprint(list(keys_view))   # includes "d"',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 8,
              cellTitle: 'Looping — keys by default, .items() for both',
              prose: '`for k in d` iterates keys. `for k, v in d.items()` unpacks key-value pairs. `for v in d.values()` iterates values only.',
              code: 'scores = {"Alice": 92, "Bob": 85, "Carol": 78}\n\n# keys only\nfor name in scores:\n    print(name)\n\n# key + value\nfor name, score in scores.items():\n    print(f"{name}: {score}")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 9,
              cellTitle: 'in operator — tests keys, not values',
              prose: '`key in d` checks whether the key exists — O(1) hash lookup. To check values, use `value in d.values()` — but that is O(n). `not in` works too.',
              code: 'd = {"a": 1, "b": 2, "c": 3}\nprint("a" in d)            # True — key exists\nprint("z" in d)            # False\nprint(1 in d)              # False — 1 is a value, not a key\nprint(1 in d.values())     # True — but O(n)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 10,
              cellTitle: 'len() and counting patterns',
              prose: '`len(d)` returns the number of key-value pairs. Combining `len()` with comprehensions or `.values()` enables powerful counting patterns.',
              code: 'd = {"a": 1, "b": 2, "c": 3, "d": 4}\nprint(len(d))                          # 4\nprint(sum(d.values()))                 # 10\nprint(max(d.values()))                 # 4\nprint(min(d, key=d.get))               # "a" — key with smallest value',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 11,
              cellTitle: 'Nested dicts — access and mutation',
              prose: 'Dict values can themselves be dicts. Access inner values by chaining: `d[outer][inner]`. You can nest to any depth — this is how JSON data is structured.',
              code: 'users = {\n    "alice": {"age": 30, "city": "NYC"},\n    "bob":   {"age": 25, "city": "LA"},\n}\nprint(users["alice"]["city"])    # "NYC"\nusers["alice"]["age"] = 31       # mutate nested\nprint(users["alice"])',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 12,
              cellTitle: 'Dict comprehension — {k: v for ...}',
              prose: 'Dict comprehensions build a new dict in one expression. The syntax is `{key_expr: val_expr for item in iterable if condition}`. The `if` filter is optional.',
              code: '# square of each number\nsquares = {n: n**2 for n in range(1, 6)}\nprint(squares)   # {1:1, 2:4, 3:9, 4:16, 5:25}\n\n# filter — only even squares\neven_sq = {n: n**2 for n in range(1, 11) if n % 2 == 0}\nprint(even_sq)\n\n# invert a dict\norig = {"a": 1, "b": 2, "c": 3}\ninverted = {v: k for k, v in orig.items()}\nprint(inverted)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 13,
              cellTitle: '.update() — merge another dict in place',
              prose: '`.update(other)` adds all key-value pairs from `other` into the dict, overwriting any existing keys. Accepts a dict, a list of `(key, value)` tuples, or keyword arguments.',
              code: 'base = {"a": 1, "b": 2}\nbase.update({"b": 99, "c": 3})   # "b" overwritten, "c" added\nprint(base)\n\n# also accepts keyword args:\nbase.update(d=4, e=5)\nprint(base)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 14,
              cellTitle: '{**a, **b} and | — non-mutating merge',
              prose: '`{**a, **b}` creates a NEW dict combining both; later keys win on conflict. Python 3.9+ also supports `a | b`. Neither modifies `a` or `b`. `a |= b` is the in-place version.',
              code: 'defaults = {"color": "red", "size": 10, "bold": False}\noverrides = {"size": 20, "italic": True}\n\nmerged = {**defaults, **overrides}   # overrides wins on "size"\nprint(merged)\nprint(defaults)   # unchanged\n\n# Python 3.9+ syntax (same result):\nmerged2 = defaults | overrides\nprint(merged2)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 15,
              cellTitle: 'dict.fromkeys() — create from a list of keys',
              prose: '`dict.fromkeys(iterable, value)` creates a dict with every item in the iterable as a key, all mapped to the same `value` (default `None`). Useful for initialising counters or seen-sets.',
              code: 'keys = ["a", "b", "c", "d"]\nzero_counts = dict.fromkeys(keys, 0)\nprint(zero_counts)    # {"a":0, "b":0, "c":0, "d":0}\n\n# initialise with None\nrecord = dict.fromkeys(["name", "age", "email"])\nprint(record)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 16,
              cellTitle: '.setdefault() — insert only if key is missing',
              prose: '`.setdefault(key, default)` returns the value if the key exists; if the key is missing, it inserts `key: default` and returns `default`. Useful for building grouping structures without checking first.',
              code: 'd = {"a": 1}\nprint(d.setdefault("a", 99))   # 1 — key exists, unchanged\nprint(d.setdefault("b", 99))   # 99 — key added\nprint(d)\n\n# Classic use: grouping\ngroups = {}\nfor word in ["cat", "car", "bar", "bat"]:\n    groups.setdefault(word[0], []).append(word)\nprint(groups)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 17,
              cellTitle: '.copy() and aliasing — same gotcha as lists',
              prose: '`b = a` aliases the dict — mutations through `b` affect `a`. `.copy()` makes a **shallow** copy: the dict object is new but nested values are still shared. `copy.deepcopy()` for full independence.',
              code: 'import copy\n\na = {"x": [1, 2, 3], "y": 10}\nb = a.copy()         # shallow copy\nb["y"] = 99          # new key assignment — a unaffected\nb["x"].append(4)     # mutates the shared list — a IS affected!\nprint(a)             # {"x": [1,2,3,4], "y": 10}\n\nc = copy.deepcopy(a) # full independence\nc["x"].append(5)\nprint(a["x"])        # still [1,2,3,4]',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 18,
              cellTitle: 'Mutating a dict while iterating — RuntimeError',
              prose: 'Unlike lists (which silently misbehave), Python raises `RuntimeError: dictionary changed size during iteration` if you add or remove keys while iterating. Fix: iterate over a copy of the keys.',
              code: 'd = {"a": 1, "b": 2, "c": 3, "d": 4}\n\n# Safe: iterate over a snapshot of keys\nfor key in list(d.keys()):\n    if d[key] % 2 == 0:\n        del d[key]     # safe — iterating list(d.keys()), not d\nprint(d)           # only odd-valued keys remain',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 19,
              cellTitle: 'Sorting a dict — by key or by value',
              prose: '`sorted(d)` sorts keys. `sorted(d.items(), key=lambda kv: kv[1])` sorts by value. To get a sorted dict, pass to `dict()`. Python dicts preserve insertion order, so the result is ordered.',
              code: 'scores = {"Carol": 78, "Alice": 92, "Bob": 85}\n\n# sort by key\nby_key = dict(sorted(scores.items()))\nprint(by_key)\n\n# sort by value descending\nby_score = dict(sorted(scores.items(), key=lambda kv: kv[1], reverse=True))\nprint(by_score)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 20,
              cellTitle: 'Converting between dicts and lists of tuples',
              prose: '`dict(list_of_tuples)` builds a dict from `[(k,v), ...]`. `list(d.items())` goes the other way. `zip(keys, values)` is the idiomatic way to create a dict from two parallel lists.',
              code: 'pairs = [("a", 1), ("b", 2), ("c", 3)]\nd = dict(pairs)\nprint(d)\n\nkeys   = ["x", "y", "z"]\nvalues = [10,  20,  30]\nd2 = dict(zip(keys, values))\nprint(d2)\n\n# back to list of tuples\nprint(list(d2.items()))',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 21,
              cellTitle: '** unpacking in function calls',
              prose: '`**d` unpacks a dict as keyword arguments. This lets you build argument sets dynamically and pass them to any function that accepts `**kwargs`. Overlapping keys are resolved left-to-right.',
              code: 'def greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\nparams = {"name": "Alice", "greeting": "Hi"}\nprint(greet(**params))       # "Hi, Alice!"\n\n# Merge with override\nbase = {"name": "Bob", "greeting": "Hello"}\nprint(greet(**{**base, "greeting": "Hey"}))',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 22,
              cellTitle: 'collections.Counter — frequency counting',
              prose: '`Counter(iterable)` counts occurrences of each element and returns a dict-like object. `.most_common(n)` returns the n most frequent items. Supports arithmetic: counters can be added and subtracted.',
              code: 'from collections import Counter\n\nwords = ["the", "cat", "sat", "on", "the", "mat", "the"]\nc = Counter(words)\nprint(c)                      # {"the": 3, "cat": 1, ...}\nprint(c.most_common(2))       # [("the",3), ("cat",1)]\nprint(c["the"])               # 3\nprint(c["missing"])           # 0 — no KeyError!',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 23,
              cellTitle: 'collections.defaultdict — auto-initialised values',
              prose: '`defaultdict(factory)` behaves like a dict but calls `factory()` to create a default value when a missing key is accessed. Common factories: `int` (default 0), `list` (default []), `set`.',
              code: 'from collections import defaultdict\n\n# count without checking\ncounts = defaultdict(int)\nfor ch in "mississippi":\n    counts[ch] += 1   # no KeyError on first occurrence\nprint(dict(counts))\n\n# group without setdefault\ngroups = defaultdict(list)\nfor word in ["cat", "car", "bar", "bat"]:\n    groups[word[0]].append(word)\nprint(dict(groups))',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 24,
              cellTitle: 'Dict as a dispatch table',
              prose: 'Functions are first-class values in Python — they can be dict values. A dispatch table maps keys to functions, replacing long `if/elif` chains. This is one of the most powerful dict patterns.',
              code: 'def add(a, b): return a + b\ndef sub(a, b): return a - b\ndef mul(a, b): return a * b\ndef div(a, b): return a / b if b != 0 else None\n\nops = {"+": add, "-": sub, "*": mul, "/": div}\n\n# evaluate an expression from user input\nexpr = ("*", 6, 7)\nop, x, y = expr\nprint(ops[op](x, y))    # 42\n\n# dynamically choose behaviour\nfor symbol, fn in ops.items():\n    print(f"10 {symbol} 3 = {fn(10, 3)}")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 25,
              cellTitle: 'Practical patterns — word frequency, grouping, inverted index',
              prose: 'Three high-value real-world dict patterns using everything in this lesson.',
              code: 'text = "to be or not to be that is the question"\n\n# 1. Word frequency with Counter\nfrom collections import Counter\nfreq = Counter(text.split())\nprint(freq.most_common(3))\n\n# 2. Group words by length\nfrom collections import defaultdict\nby_len = defaultdict(list)\nfor word in set(text.split()):\n    by_len[len(word)].append(word)\nprint(dict(sorted(by_len.items())))\n\n# 3. Inverted index: char → positions\nindex = defaultdict(list)\nfor i, ch in enumerate(text):\n    if ch != " ":\n        index[ch].append(i)\nprint(dict(list(index.items())[:4]))',
              output: '', status: 'idle', figureJson: null,
            },

            // ── Challenges ────────────────────────────────────────────────────
            {
              id: 31,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Safe Score Lookup',
              difficulty: 'easy',
              prompt: 'Write `get_grade(scores, name)` that returns the score for `name` from the dict, or the string `"Not found"` if the name is not a key.\n\nDo not use try/except — use `.get()`.',
              instructions: 'One line: return scores.get(name, "Not found")',
              code: '# Define get_grade(scores, name) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'get_grade' not in dir():
    res = "ERROR: Function 'get_grade' not found."
else:
    d = {"Alice": 92, "Bob": 85}
    if get_grade(d, "Alice") == 92 and get_grade(d, "Charlie") == "Not found":
        res = "SUCCESS: Safe lookup with .get() verified."
    else:
        res = f"ERROR: get_grade(d,'Alice')={get_grade(d,'Alice')}, get_grade(d,'Charlie')={get_grade(d,'Charlie')}."
res
`,
              hint: 'return scores.get(name, "Not found")',
            },
            {
              id: 32,
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Word Frequency Counter',
              difficulty: 'easy',
              prompt: 'Write `word_freq(text)` that returns a dict mapping each word to its count in the string.\n\nExample: `word_freq("the cat and the dog")` → `{"the": 2, "cat": 1, "and": 1, "dog": 1}`',
              instructions: 'Split the text into words, loop, and build the count dict.',
              code: '# Define word_freq(text) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'word_freq' not in dir():
    res = "ERROR: Function 'word_freq' not found."
else:
    result = word_freq("the cat and the dog")
    if result == {"the": 2, "cat": 1, "and": 1, "dog": 1}:
        res = "SUCCESS: word_freq verified. 'the' counted 2 times."
    else:
        res = f"ERROR: Got {result}. Expected {{'the':2,'cat':1,'and':1,'dog':1}}."
res
`,
              hint: 'counts = {}. for word in text.split(): counts[word] = counts.get(word, 0) + 1. return counts',
            },
            {
              id: 33,
              challengeType: 'fill',
              challengeNumber: 3,
              challengeTitle: 'Group by First Letter',
              difficulty: 'easy',
              prompt: 'Fill in the blanks to group words by their first letter using `.setdefault()`.',
              starterBlock: `words = ["apple", "avocado", "banana", "blueberry", "cherry"]
groups = {}
for word in words:
    groups.setdefault(___, ___).append(___)
groups
`,
              code: `words = ["apple", "avocado", "banana", "blueberry", "cherry"]
groups = {}
for word in words:
    groups.setdefault(___, ___).append(___)
groups
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
words = ["apple", "avocado", "banana", "blueberry", "cherry"]
groups = {}
for word in words:
    groups.setdefault(word[0], []).append(word)
if groups == {"a": ["apple","avocado"], "b": ["banana","blueberry"], "c": ["cherry"]}:
    res = "SUCCESS: Grouping by first letter verified."
else:
    res = f"ERROR: Got {groups}."
res
`,
              hint: 'groups.setdefault(word[0], []).append(word)',
            },
            {
              id: 34,
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Invert a Dict',
              difficulty: 'medium',
              prompt: 'Write `invert(d)` that returns a new dict with keys and values swapped.\n\nIf multiple keys share the same value, collect all original keys into a list.\n\nExample: `invert({"a":1, "b":2, "c":1})` → `{1: ["a","c"], 2: ["b"]}`',
              instructions: 'Use .setdefault() or defaultdict(list) to collect multiple original keys per value.',
              code: '# Define invert(d) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'invert' not in dir():
    res = "ERROR: Function 'invert' not found."
else:
    r1 = invert({"a":1,"b":2,"c":1})
    r2 = invert({"x":9,"y":9,"z":9})
    ok1 = sorted(r1[1]) == ["a","c"] and r1[2] == ["b"]
    ok2 = sorted(r2[9]) == ["x","y","z"]
    if ok1 and ok2:
        res = "SUCCESS: Dict inversion with value-collision handling verified."
    else:
        res = f"ERROR: invert({{'a':1,'b':2,'c':1}})={r1}. Expected {{1:['a','c'],2:['b']}}."
res
`,
              hint: 'result = {}. for k, v in d.items(): result.setdefault(v, []).append(k). return result',
            },
            {
              id: 35,
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Config Merger',
              difficulty: 'medium',
              prompt: 'Write `merge_config(defaults, user)` that returns a new dict combining `defaults` with `user` settings. User settings override defaults. Neither input dict should be modified.\n\nCompound: uses dict merging and non-mutation.',
              instructions: 'Use {**defaults, **user} or | operator.',
              code: '# Define merge_config(defaults, user) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'merge_config' not in dir():
    res = "ERROR: Function 'merge_config' not found."
else:
    defaults = {"color": "red", "size": 10, "bold": False}
    user     = {"size": 20, "italic": True}
    result   = merge_config(defaults, user)
    expected = {"color": "red", "size": 20, "bold": False, "italic": True}
    if result == expected and defaults == {"color":"red","size":10,"bold":False}:
        res = "SUCCESS: Config merged, defaults untouched."
    else:
        res = f"ERROR: Got {result}, defaults={defaults}."
res
`,
              hint: 'return {**defaults, **user}',
            },
            {
              id: 36,
              challengeType: 'write',
              challengeNumber: 6,
              challengeTitle: 'Top N Words',
              difficulty: 'medium',
              prompt: 'Write `top_n(text, n)` that returns a list of the `n` most frequent words in `text`, sorted by frequency descending.\n\nCompound: Counter, sorting with key=, list slicing.',
              instructions: 'Use Counter or build manually. Sort .items() by value descending.',
              code: '# Define top_n(text, n) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'top_n' not in dir():
    res = "ERROR: Function 'top_n' not found."
else:
    text = "to be or not to be that is the question to"
    r = top_n(text, 3)
    if r[0] == "to" and len(r) == 3:
        res = f"SUCCESS: top_n verified. Top 3: {r}."
    else:
        res = f"ERROR: Expected ['to', ...] as first item. Got {r}."
res
`,
              hint: 'from collections import Counter. c = Counter(text.split()). return [w for w, _ in c.most_common(n)]',
            },
            {
              id: 37,
              challengeType: 'fill',
              challengeNumber: 7,
              challengeTitle: 'Dispatch Table Calculator',
              difficulty: 'hard',
              prompt: 'Fill in the dispatch table and the evaluation logic so the function computes `a op b` where `op` is a string like `"+"`, `"-"`, `"*"`, `"/"`.',
              starterBlock: `def calculate(a, op, b):
    ops = {
        "+": ___,
        "-": ___,
        "*": ___,
        "/": ___,
    }
    if op not in ops:
        return None
    return ___(a, b)

print(calculate(10, "+", 5))   # 15
print(calculate(10, "/", 0))   # None
`,
              code: `def calculate(a, op, b):
    ops = {
        "+": ___,
        "-": ___,
        "*": ___,
        "/": ___,
    }
    if op not in ops:
        return None
    return ___(a, b)

print(calculate(10, "+", 5))   # 15
print(calculate(10, "/", 0))   # None
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'calculate' not in dir():
    res = "ERROR: Function 'calculate' not found."
elif (calculate(10,"+",5)==15 and calculate(10,"-",3)==7 and
      calculate(3,"*",4)==12 and calculate(10,"/",4)==2.5 and
      calculate(10,"^",2) is None):
    res = "SUCCESS: Dispatch table calculator verified. All four operators work."
else:
    res = f"ERROR: Got +={calculate(10,'+',5)}, -={calculate(10,'-',3)}, *={calculate(3,'*',4)}, /={calculate(10,'/',4)}."
res
`,
              hint: 'Use lambdas or named functions. For "/", guard against division by zero: lambda a,b: a/b if b!=0 else None. Return ops[op](a, b).',
            },
            {
              id: 38,
              challengeType: 'write',
              challengeNumber: 8,
              challengeTitle: 'Nested Config Access',
              difficulty: 'hard',
              prompt: 'Write `deep_get(d, *keys)` that safely traverses a nested dict using a sequence of keys, returning `None` if any key is missing at any level.\n\nExample:\n```python\nd = {"a": {"b": {"c": 42}}}\ndeep_get(d, "a", "b", "c")  # 42\ndeep_get(d, "a", "x", "c")  # None\n```',
              instructions: 'Use a loop over the keys. At each step, use .get() and check if the result is a dict before going deeper.',
              code: '# Define deep_get(d, *keys) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'deep_get' not in dir():
    res = "ERROR: Function 'deep_get' not found."
else:
    d = {"a": {"b": {"c": 42}}, "x": 99}
    if (deep_get(d,"a","b","c") == 42 and
        deep_get(d,"a","x","c") is None and
        deep_get(d,"x") == 99 and
        deep_get(d,"z") is None):
        res = "SUCCESS: deep_get verified. Traverses nested dicts safely."
    else:
        res = f"ERROR: deep_get(d,'a','b','c')={deep_get(d,'a','b','c')}, deep_get(d,'a','x','c')={deep_get(d,'a','x','c')}."
res
`,
              hint: 'current = d. for key in keys: if not isinstance(current, dict): return None; current = current.get(key). return current',
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Hash tables and O(1) lookup**: Python dicts are implemented as hash tables. `d[key]` computes `hash(key)` to find the bucket directly — O(1) average, O(n) worst case (hash collision). This is why keys must be hashable: mutable objects like lists have no stable hash.',
      '**dict vs list — when to use which**: use a list when order and position matter (sequences). Use a dict when you need named lookup, fast membership testing, or key-value association. Rule of thumb: if you find yourself using a list and tracking indices manually to find items, you probably want a dict.',
      '**View objects are not copies**: `d.keys()`, `d.values()`, `d.items()` return views that reflect the dict\'s current state. If you need a snapshot, wrap in `list()`. Iterating views while modifying the dict raises `RuntimeError`.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'dict.fromkeys() shares the same default object',
        body: '`dict.fromkeys(["a","b","c"], [])` creates three keys all pointing to the **same** list. Appending to one appends to all. Use a comprehension instead: `{k: [] for k in keys}`.',
      },
      {
        type: 'insight',
        title: 'JSON is a dict',
        body: 'JSON objects map directly to Python dicts. `json.loads(\'{"name":"Alice","age":30}\')` returns `{"name": "Alice", "age": 30}`. Every web API, config file, and data exchange format you will encounter is just nested dicts and lists.',
      },
    ],
  },

  mentalModel: [
    'd[key] is O(1); key in d is O(1) — both use the hash table directly.',
    '.get(key, default) never raises KeyError — use it for optional keys.',
    '.items() gives (k,v) pairs; iterate with: for k, v in d.items().',
    '{**a, **b} merges non-destructively; .update() merges in place.',
    '.setdefault(k, []).append(x) is the idiomatic grouping pattern.',
    'Counter for frequency, defaultdict for auto-init, dispatch table for if/elif chains.',
    'Shallow copy shares nested objects — use copy.deepcopy() for full independence.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}

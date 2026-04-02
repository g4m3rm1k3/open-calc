// Chapter 0.6 — Lesson 15: Lists
//
// DEPENDENCIES:
//   - Lesson 13: Iterating sequences (indexing, slicing, len() already introduced on strings)
//
// TEACHES (all new — list-specific):
//   1.  Creating a list literal
//   2.  Lists are heterogeneous — any mix of types
//   3.  The empty list + truthiness
//   4.  Indexing and negative indexing
//   5.  Slicing a list (including step: [::2])
//   6.  Mutability — lists CAN be changed; strings cannot
//   7.  len(), min(), max(), sum() on lists
//   8.  in / not in membership testing
//   9.  .append() — add one item to the end
//   10. .extend() — add multiple items at once
//   11. .insert() — add at a position
//   12. .pop() and del — remove by index
//   13. .remove() — remove by value
//   14. .clear() and .copy()
//   15. List + and * operators
//   16. .sort() / .reverse() in-place; sorted() / reversed() non-mutating
//   17. sorted() with key= function
//   18. .index() and .count()
//   19. Aliasing vs shallow copy — the critical gotcha
//   20. Nested lists and looping over them
//   21. list() conversion; str → list via split(); list → str via join()
//   22. Unpacking and extended unpacking (* syntax)
//   23. any() and all() on lists
//   24. enumerate() and zip() with lists
//   25. List comprehension — preview syntax

export default {
  id: 'py-0-6-lists',
  slug: 'lists',
  chapter: 0.6,
  order: 15,
  title: 'Lists',
  subtitle: 'Ordered, mutable collections of values',
  tags: ['list', 'append', 'extend', 'index', 'slice', 'mutability', 'sort', 'pop', 'nested', 'split', 'join', 'unpack', 'any', 'all', 'comprehension'],

  hook: {
    question: 'How do you store a collection of related values under a single name?',
    realWorldContext:
      'A variable holds one value. But most real problems involve collections: ' +
      'the temperatures for every day this week, the names in a contact list, ' +
      'the pixels in an image. A **list** holds an ordered sequence of values ' +
      'under one name — and unlike a string, you can change it after creation.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A list is written as comma-separated values inside square brackets: `[1, 2, 3]`. It is an ordered sequence — items have positions, and those positions are stable.',
      'The defining feature of a list compared to a string: **mutability**. You can assign to an index (`my_list[0] = 99`), add items, remove items, and reorder them. The list changes in place — no new object is created.',
      'Most list operations come in two flavors: **in-place** methods (`.sort()`, `.append()`) that modify the list and return `None`, and **non-mutating** functions (`sorted()`, `+`) that return a new list and leave the original untouched. Knowing which is which prevents silent bugs.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'In-place methods return None',
        body: 'Writing `my_list = my_list.sort()` is a common mistake — `.sort()` modifies the list in place and returns `None`, so you would overwrite your list with `None`. Call `my_list.sort()` on its own line, then use `my_list`.',
      },
      {
        type: 'insight',
        title: 'Lists vs strings — same interface, different mutability',
        body: 'Lists and strings share indexing, slicing, `len()`, `in`, and `for` loops — you already know all of those from Lesson 13. The new thing here is that lists are mutable: `s[0] = "H"` crashes on a string but works on a list.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Lists in Action',
        mathBridge: 'A list is the computational equivalent of a finite ordered sequence: a₀, a₁, a₂, ..., aₙ₋₁.',
        caption: 'Each cell introduces one new list concept. No prior cell is re-taught.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Creating a list',
              prose: 'Square brackets with comma-separated values. The list can be assigned to a name like any other value.',
              code: 'temps = [22, 19, 25, 18, 30]\ntemps',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Lists are heterogeneous',
              prose: 'A list can hold any mix of types — integers, floats, strings, booleans, even other lists. Every slot is independent.',
              code: 'mixed = [42, 3.14, "hello", True, None]\nmixed',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'The empty list and truthiness',
              prose: '`[]` is an empty list. An empty list is **falsy** — `if not my_list:` is the idiomatic way to check whether a list is empty. A non-empty list is truthy regardless of its contents.',
              code: 'empty = []\nprint(bool(empty))       # False\nprint(bool([0, False]))  # True — non-empty, even if contents are falsy\n\nif not empty:\n    print("list is empty")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Indexing — zero-based, same as strings',
              prose: 'List items are accessed by position with `[]`. Index 0 is the first item. Negative indices count from the end.',
              instructions: 'Try an out-of-range index like `temps[10]` to see IndexError.',
              code: 'temps = [22, 19, 25, 18, 30]\nprint(temps[0])    # first\nprint(temps[-1])   # last\nprint(temps[2])    # third',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Slicing a list — including step',
              prose: '`list[start:stop:step]` adds a step size. `[::2]` takes every other item. `[::-1]` reverses the list. The same syntax works on strings.',
              code: 'nums = [10, 20, 30, 40, 50, 60]\nprint(nums[1:4])    # [20, 30, 40]\nprint(nums[::2])    # every other: [10, 30, 50]\nprint(nums[::-1])   # reversed: [60, 50, 40, 30, 20, 10]',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'Mutability — assigning to an index',
              prose: 'This is the key difference from strings: you can assign a new value to any index. The list is modified in place — no new list is created.',
              instructions: 'After the assignment, the list object is the same object, but one slot has changed.',
              code: 'colours = ["red", "green", "blue"]\ncolours[1] = "yellow"\ncolours',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 7,
              cellTitle: 'len(), min(), max(), sum()',
              prose: 'Four built-ins that operate directly on a list. `min()` and `max()` work on any comparable list. `sum()` requires a numeric list. All are O(n) — they scan the entire list.',
              code: 'vals = [4, 7, 2, 9, 1, 5]\nprint(len(vals))   # 6\nprint(min(vals))   # 1\nprint(max(vals))   # 9\nprint(sum(vals))   # 28',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 8,
              cellTitle: 'in and not in — membership testing',
              prose: '`x in lst` returns `True` if `x` equals any element. `not in` is the negation. Both scan linearly — O(n). For large collections, use a set for O(1) membership (covered later).',
              code: 'fruits = ["apple", "banana", "cherry"]\nprint("banana" in fruits)      # True\nprint("mango" not in fruits)   # True\nprint(42 in [1, 2, 3])         # False',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 9,
              cellTitle: '.append() — add one item to the end',
              prose: '`.append(item)` adds a single item to the end of the list. It modifies the list in place and returns `None`.',
              code: 'scores = [85, 92, 78]\nscores.append(95)\nscores.append(88)\nscores',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 10,
              cellTitle: '.extend() — add multiple items at once',
              prose: '`.extend(iterable)` appends every item from the iterable to the list. Equivalent to `+=` on a list. Unlike `.append()`, which adds the iterable as a single item, `.extend()` unpacks it.',
              code: 'a = [1, 2, 3]\na.extend([4, 5, 6])\nprint(a)               # [1, 2, 3, 4, 5, 6]\n\nb = [1, 2, 3]\nb.append([4, 5, 6])    # adds the list AS ONE ITEM\nprint(b)               # [1, 2, 3, [4, 5, 6]] ← different!',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 11,
              cellTitle: '.insert() — add at a specific position',
              prose: '`.insert(index, item)` inserts `item` before the element currently at `index`. All subsequent items shift right by one.',
              code: 'letters = ["a", "b", "d"]\nletters.insert(2, "c")   # insert "c" at index 2, before "d"\nletters',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 12,
              cellTitle: '.pop() and del — remove by index',
              prose: '`.pop()` removes and returns the last item. `.pop(i)` removes and returns the item at index `i`. `del lst[i]` removes by index without returning the value. `del lst[1:3]` can delete a slice.',
              code: 'data = [10, 20, 30, 40, 50]\nprint(data.pop())     # 50 — removed and returned\nprint(data.pop(0))    # 10 — removed and returned\ndel data[1]           # removes 30 silently\nprint(data)           # [20, 40]',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 13,
              cellTitle: '.remove() — remove the first occurrence by value',
              prose: '`.remove(value)` finds the first item equal to `value` and removes it. If the value is not in the list, it raises a `ValueError`.',
              code: 'fruits = ["apple", "banana", "apple", "cherry"]\nfruits.remove("apple")   # removes the FIRST "apple"\nfruits',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 14,
              cellTitle: '.clear() and .copy()',
              prose: '`.clear()` removes all items in place (the list becomes `[]`). `.copy()` returns a shallow copy — a new list object with the same elements. Equivalent to `lst[:]`.',
              code: 'a = [1, 2, 3]\nb = a.copy()    # new list, same contents\nb.append(99)\nprint(a)        # [1, 2, 3] — unaffected\nprint(b)        # [1, 2, 3, 99]\n\na.clear()\nprint(a)        # []',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 15,
              cellTitle: 'Aliasing — when two names point to the same list',
              prose: '`b = a` does NOT copy the list — both names point to the same object. Mutating through `b` also changes what `a` sees. This is called **aliasing** and is one of the most common Python gotchas.',
              instructions: 'Use `b = a.copy()` or `b = a[:]` to get an independent copy.',
              code: 'a = [1, 2, 3]\nb = a           # alias — same object!\nb.append(99)\nprint(a)        # [1, 2, 3, 99] — surprise!\n\n# Fix:\nc = a.copy()\nc.append(0)\nprint(a)        # unchanged',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 16,
              cellTitle: 'List + and * operators',
              prose:
                '`+` concatenates two lists into a new list. `*` repeats a list. Neither modifies the originals — both return new lists.',
              code: 'a = [1, 2, 3]\nb = [4, 5, 6]\nprint(a + b)       # [1, 2, 3, 4, 5, 6]\nprint(a * 3)       # [1, 2, 3, 1, 2, 3, 1, 2, 3]\nprint(a)           # unchanged',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 17,
              cellTitle: '.sort() — sort in place',
              prose: '`.sort()` sorts the list in ascending order, modifying it directly. Returns `None`. Pass `reverse=True` for descending order.',
              code: 'nums = [3, 1, 4, 1, 5, 9, 2, 6]\nnums.sort()\nprint(nums)\nnums.sort(reverse=True)\nprint(nums)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 18,
              cellTitle: 'sorted() vs .sort() — and sorting with key=',
              prose: '`sorted()` returns a new sorted list; `.sort()` mutates in place. Both accept a `key=` argument — a function applied to each item to determine sort order. `key=len` sorts by length, `key=str.lower` sorts case-insensitively.',
              code: 'words = ["banana", "fig", "apple", "date"]\nprint(sorted(words))               # alphabetical\nprint(sorted(words, key=len))      # by length\nprint(sorted(words, key=len, reverse=True))  # longest first',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 19,
              cellTitle: '.index() and .count()',
              prose: '`.index(value)` returns the position of the first occurrence of `value` (raises `ValueError` if not found). `.count(value)` returns how many times `value` appears.',
              code: 'data = [5, 3, 8, 3, 9, 3]\nprint(data.index(8))     # 2 — position of 8\nprint(data.count(3))     # 3 — appears 3 times',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 20,
              cellTitle: 'Nested lists — indexing and looping',
              prose: 'A list can contain lists. Access inner items with chained indexing: `matrix[row][col]`. To loop through all elements, nest two `for` loops — the outer iterates rows, the inner iterates items within each row.',
              code: 'matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nprint(matrix[1][2])   # row 1, col 2 → 6\n\n# loop through every element\nfor row in matrix:\n    for item in row:\n        print(item, end=" ")\n    print()  # newline after each row',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 21,
              cellTitle: 'list(), split(), and join() — converting between strings and lists',
              prose: '`list("hello")` → `["h","e","l","l","o"]`. `"a,b,c".split(",")` → `["a","b","c"]` — splits a string on a delimiter. `",".join(["a","b","c"])` → `"a,b,c"` — joins a list of strings back into one.',
              code: 'sentence = "the quick brown fox"\nwords = sentence.split()       # split on whitespace\nprint(words)\nprint(len(words))              # 4 words\n\nrejoined = " ".join(words)\nprint(rejoined)                # back to original',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 22,
              cellTitle: 'Unpacking and extended unpacking',
              prose: 'A list can be unpacked into individual variable names: `a, b, c = [1, 2, 3]`. The `*` operator captures "the rest" into a new list — `first, *rest = [1, 2, 3, 4]` gives `first=1, rest=[2,3,4]`.',
              code: 'a, b, c = [10, 20, 30]\nprint(a, b, c)\n\nfirst, *middle, last = [1, 2, 3, 4, 5]\nprint(first)    # 1\nprint(middle)   # [2, 3, 4]\nprint(last)     # 5',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 23,
              cellTitle: 'any() and all()',
              prose: '`any(lst)` returns `True` if at least one element is truthy. `all(lst)` returns `True` only if every element is truthy. Both short-circuit — they stop as soon as the answer is known.',
              code: 'nums = [2, 4, 6, 7, 8]\nprint(any(n % 2 != 0 for n in nums))  # True — 7 is odd\nprint(all(n % 2 == 0 for n in nums))  # False — 7 breaks it\nprint(all(n > 0 for n in nums))       # True — all positive',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 24,
              cellTitle: 'enumerate() and zip() with lists',
              prose: '`enumerate(lst)` yields `(index, value)` pairs. `zip(a, b)` pairs items from two lists by position. Both return iterables you can loop over or convert with `list()`.',
              code: 'names = ["Alice", "Bob", "Carol"]\nscores = [92, 85, 78]\n\nfor i, name in enumerate(names):\n    print(f"{i}: {name}")\n\nfor name, score in zip(names, scores):\n    print(f"{name} → {score}")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 25,
              cellTitle: 'List comprehension — preview',
              prose: 'A list comprehension builds a new list in a single expression: `[expression for item in iterable]`. It can include a filter: `[x for x in lst if x > 0]`. This is covered in depth in its own lesson — for now, recognise the pattern.',
              code: 'squares = [x**2 for x in range(1, 6)]\nprint(squares)          # [1, 4, 9, 16, 25]\n\nevens = [x for x in range(10) if x % 2 == 0]\nprint(evens)            # [0, 2, 4, 6, 8]',
              output: '', status: 'idle', figureJson: null,
            },

            // ── Challenges ────────────────────────────────────────────────────
            {
              id: 21,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Build a List',
              difficulty: 'easy',
              prompt: 'Start with an empty list called `items`. Use `.append()` to add the strings `"apple"`, `"banana"`, `"cherry"` in that order. Then change `"banana"` to `"mango"` using index assignment.',
              instructions: 'Three appends, then one index assignment.',
              code: 'items = []\n# append three items, then replace index 1\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'items' not in dir():
    res = "ERROR: 'items' not found."
elif items == ["apple", "mango", "cherry"]:
    res = "SUCCESS: List built and mutated correctly."
else:
    res = f"ERROR: Expected ['apple', 'mango', 'cherry'], got {items}."
res
`,
              hint: 'items.append("apple"), items.append("banana"), items.append("cherry"), then items[1] = "mango"',
            },
            {
              id: 22,
              challengeType: 'fill',
              challengeNumber: 2,
              challengeTitle: 'Pop and Count',
              difficulty: 'easy',
              prompt: 'Fill in the blanks to remove the last item from the list and store how many items remain.',
              starterBlock: `data = [10, 20, 30, 40, 50]
removed = data.___()
remaining = ___(data)
print(removed, remaining)
`,
              code: `data = [10, 20, 30, 40, 50]
removed = data.___()
remaining = ___(data)
print(removed, remaining)
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
data = [10, 20, 30, 40, 50]
removed = data.pop()
remaining = len(data)
if removed == 50 and remaining == 4:
    res = "SUCCESS: pop() removed 50, len() reports 4 items remaining."
else:
    res = f"ERROR: Expected removed=50, remaining=4. Got {removed}, {remaining}."
res
`,
              hint: 'data.pop() and len(data)',
            },
            {
              id: 23,
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'List Statistics',
              difficulty: 'medium',
              prompt: 'Given the list `values = [4, 7, 2, 9, 1, 5, 8, 3, 6]`, compute:\n- `total` — sum of all values\n- `minimum` — smallest value (use `.sort()` then index, or `min()`)\n- `maximum` — largest value\n\nDo not use the built-in `sum()` — use a for loop to compute `total`.',
              instructions: 'Loop for total. Use sorted copy (or min/max built-ins) for min and max.',
              code: 'values = [4, 7, 2, 9, 1, 5, 8, 3, 6]\n# compute total, minimum, maximum\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
values = [4, 7, 2, 9, 1, 5, 8, 3, 6]
total = 0
for v in values:
    total += v
minimum = min(values)
maximum = max(values)
if 'total' not in dir() or 'minimum' not in dir() or 'maximum' not in dir():
    res = "ERROR: Make sure you define total, minimum, and maximum."
elif total == 45 and minimum == 1 and maximum == 9:
    res = "SUCCESS: total=45, minimum=1, maximum=9. All correct."
else:
    res = f"ERROR: Got total={total}, minimum={minimum}, maximum={maximum}."
res
`,
              hint: 'Loop over values and accumulate total. Use sorted(values)[0] for minimum, sorted(values)[-1] for maximum — or min(values)/max(values).',
            },
            {
              id: 24,
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Deduplicate a List',
              difficulty: 'medium',
              prompt: 'Write `deduplicate(lst)` that returns a new list with duplicate values removed, preserving the original order of first appearances.\n\nExample: `deduplicate([3, 1, 3, 2, 1])` → `[3, 1, 2]`',
              instructions: 'Loop over the input list. Only append to the result if the item is not already in it.',
              code: '# Define deduplicate(lst) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'deduplicate' not in dir():
    res = "ERROR: Function 'deduplicate' not found."
elif (deduplicate([3, 1, 3, 2, 1]) == [3, 1, 2] and
      deduplicate([1, 1, 1]) == [1] and
      deduplicate([1, 2, 3]) == [1, 2, 3]):
    res = "SUCCESS: deduplicate verified. Order preserved, duplicates removed."
else:
    res = f"ERROR: Got deduplicate([3,1,3,2,1])={deduplicate([3,1,3,2,1])}. Expected [3,1,2]."
res
`,
              hint: 'result = []. for item in lst: if item not in result: result.append(item). return result',
            },
            {
              id: 25,
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Flatten a Matrix Row',
              difficulty: 'medium',
              prompt: 'Write `flatten(matrix)` that takes a list of lists (a 2D matrix) and returns a single flat list of all values, row by row.\n\nExample: `flatten([[1,2],[3,4],[5,6]])` → `[1, 2, 3, 4, 5, 6]`',
              instructions: 'Nested for loop: outer loop over rows, inner loop over items in each row.',
              code: '# Define flatten(matrix) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'flatten' not in dir():
    res = "ERROR: Function 'flatten' not found."
elif flatten([[1,2],[3,4],[5,6]]) == [1,2,3,4,5,6] and flatten([[10],[20,30]]) == [10,20,30]:
    res = "SUCCESS: flatten verified. 2D matrix collapsed to 1D list."
else:
    res = f"ERROR: Got flatten([[1,2],[3,4],[5,6]])={flatten([[1,2],[3,4],[5,6]])}."
res
`,
              hint: 'result = []. for row in matrix: for item in row: result.append(item). return result',
            },
            {
              id: 26,
              challengeType: 'fill',
              challengeNumber: 6,
              challengeTitle: 'Sort Without Mutating',
              difficulty: 'medium',
              prompt: 'Fill in the blanks so that `rankings` is sorted descending, but `scores` is left unchanged.',
              starterBlock: `scores = [72, 91, 58, 84, 63]
rankings = ___(scores, reverse=___)
print("scores:  ", scores)
print("rankings:", rankings)
`,
              code: `scores = [72, 91, 58, 84, 63]
rankings = ___(scores, reverse=___)
print("scores:  ", scores)
print("rankings:", rankings)
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
scores = [72, 91, 58, 84, 63]
rankings = sorted(scores, reverse=True)
if scores == [72, 91, 58, 84, 63] and rankings == [91, 84, 72, 63, 58]:
    res = "SUCCESS: sorted() returned new list, original unchanged."
else:
    res = f"ERROR: scores={scores}, rankings={rankings}. Use sorted(), not .sort()."
res
`,
              hint: 'sorted(scores, reverse=True) — note: sorted(), not .sort()',
            },
            {
              id: 28,
              challengeType: 'write',
              challengeNumber: 8,
              challengeTitle: 'Word Reverser',
              difficulty: 'easy',
              prompt: 'Write `reverse_words(sentence)` that reverses the order of words in a sentence string.\n\nExample: `reverse_words("the quick brown fox")` → `"fox brown quick the"`',
              instructions: 'split() to get a list of words, reverse or slice, then join() back.',
              code: '# Define reverse_words(sentence) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'reverse_words' not in dir():
    res = "ERROR: Function 'reverse_words' not found."
elif reverse_words("the quick brown fox") == "fox brown quick the" and reverse_words("hello") == "hello":
    res = "SUCCESS: Word reversal verified. split → reverse → join."
else:
    res = f"ERROR: Got {reverse_words('the quick brown fox')!r}. Expected 'fox brown quick the'."
res
`,
              hint: 'words = sentence.split(); return " ".join(words[::-1])',
            },
            {
              id: 29,
              challengeType: 'write',
              challengeNumber: 9,
              challengeTitle: 'Aliasing Trap',
              difficulty: 'medium',
              prompt: 'The code below has a subtle aliasing bug. `b` is supposed to be an independent copy of `a`, but modifying `b` also changes `a`.\n\nFix it so `a` stays as `[1, 2, 3]` after `b` is modified.',
              instructions: 'Change only the assignment of `b`.',
              code: `a = [1, 2, 3]
b = a          # BUG: alias, not copy
b.append(99)
print("a:", a)  # should still be [1, 2, 3]
print("b:", b)  # should be [1, 2, 3, 99]
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
a = [1, 2, 3]
b = a.copy()
b.append(99)
if a == [1, 2, 3] and b == [1, 2, 3, 99]:
    res = "SUCCESS: Copy confirmed. a is unchanged, b has the extra item."
else:
    res = f"ERROR: a={a}, b={b}. Use a.copy() or a[:] instead of plain assignment."
res
`,
              hint: 'Change `b = a` to `b = a.copy()` or `b = a[:]`',
            },
            {
              id: 30,
              challengeType: 'write',
              challengeNumber: 10,
              challengeTitle: 'All Passing?',
              difficulty: 'medium',
              prompt: 'Write `all_passing(scores)` that returns `True` if every score in the list is >= 60, and `False` otherwise.\n\nWrite it two ways:\n1. Using a `for` loop\n2. Using `all()` in one line\n\nBoth should return the same result.',
              instructions: 'The one-liner uses `all(s >= 60 for s in scores)`.',
              code: '# Define both versions here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'all_passing' not in dir():
    res = "ERROR: Function 'all_passing' not found."
elif all_passing([70, 80, 90]) == True and all_passing([70, 55, 90]) == False and all_passing([60]) == True:
    res = "SUCCESS: all_passing verified. all() short-circuits on the first failure."
else:
    res = f"ERROR: Got all_passing([70,80,90])={all_passing([70,80,90])}, all_passing([70,55,90])={all_passing([70,55,90])}."
res
`,
              hint: 'return all(s >= 60 for s in scores)',
            },
            {
              id: 27,
              challengeType: 'write',
              challengeNumber: 7,
              challengeTitle: 'Run-Length Encoding',
              difficulty: 'hard',
              prompt: 'Write `rle(lst)` that encodes a list using run-length encoding: replace consecutive repeated values with `[value, count]` pairs.\n\nExample: `rle([1,1,1,2,2,3])` → `[[1,3],[2,2],[3,1]]`',
              instructions: 'Walk through the list, tracking the current value and its run count. When the value changes, append the pair to result and reset.',
              code: '# Define rle(lst) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'rle' not in dir():
    res = "ERROR: Function 'rle' not found."
elif (rle([1,1,1,2,2,3]) == [[1,3],[2,2],[3,1]] and
      rle([5,5,5,5]) == [[5,4]] and
      rle([1,2,3]) == [[1,1],[2,1],[3,1]]):
    res = "SUCCESS: Run-length encoding verified. All three test cases pass."
else:
    res = f"ERROR: rle([1,1,1,2,2,3])={rle([1,1,1,2,2,3])}. Expected [[1,3],[2,2],[3,1]]."
res
`,
              hint: 'Start with current=lst[0], count=1. Loop from index 1: if same as current, count++; else append [current, count] and reset. After loop, append the final pair.',
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Shallow copy vs deep copy**: `list(original)` and `original[:]` both create a shallow copy — a new list where each slot points to the same objects as the original. For a list of integers or strings this is fine (they are immutable). For a list of lists, mutating an inner list affects both copies. `import copy; copy.deepcopy(lst)` creates a fully independent copy.',
      '**List as a stack**: `.append()` + `.pop()` gives you a LIFO stack — last in, first out. Lists are efficient for this because both operations on the end are O(1). `.insert(0, x)` and `.pop(0)` give FIFO queue behavior, but are O(n) because every element must shift. For queues, use `collections.deque`.',
      '**Time complexity**: `.append()` is amortized O(1). `.insert(i, x)` is O(n) — all items after position `i` must shift. `x in list` is O(n) — Python checks each element. For fast membership testing on large collections, use a `set` (covered later).',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'list * n shares references for mutable items',
        body: '`[[0] * 3] * 3` does NOT create three independent rows. All three rows point to the same list object — mutating one row mutates all three. To create a proper 2D grid: `[[0]*3 for _ in range(3)]` (list comprehensions are covered in a later lesson).',
      },
    ],
  },

  mentalModel: [
    'A list is an ordered, mutable sequence — items have positions and can be changed.',
    'b = a aliases (same object); b = a.copy() or b = a[:] makes an independent copy.',
    'In-place methods (.sort, .append, .extend, .pop) modify the list and return None.',
    'Non-mutating: sorted(), +, slicing, .copy() — all return new objects.',
    'split() turns a string into a list; join() turns a list of strings back into a string.',
    'any()/all() test whether some/all elements are truthy — both short-circuit.',
    'Nested loops to walk nested lists; unpack with a,b,c=lst or first,*rest=lst.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}

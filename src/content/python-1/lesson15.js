// Chapter 0.6 — Lesson 15: Lists
//
// DEPENDENCIES:
//   - Lesson 13: Iterating sequences (indexing, slicing, len() already introduced on strings)
//
// TEACHES (all new — list-specific):
//   1.  Creating a list literal
//   2.  Lists are heterogeneous — any mix of types
//   3.  The empty list
//   4.  Indexing and negative indexing
//   5.  Slicing a list
//   6.  Mutability — lists CAN be changed; strings cannot
//   7.  .append() — add to the end
//   8.  .insert() — add at a position
//   9.  .pop() — remove and return by index
//   10. .remove() — remove by value
//   11. List concatenation (+) and repetition (*)
//   12. .sort() and .reverse() in-place
//   13. sorted() and reversed() — non-mutating versions
//   14. .index() and .count()
//   15. Nested lists — lists of lists
//   16. list() — converting other iterables to a list

export default {
  id: 'py-0-6-lists',
  slug: 'lists',
  chapter: 0.6,
  order: 15,
  title: 'Lists',
  subtitle: 'Ordered, mutable collections of values',
  tags: ['list', 'append', 'index', 'slice', 'mutability', 'sort', 'pop', 'nested'],

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
              cellTitle: 'The empty list',
              prose: '`[]` is an empty list — length zero, no elements. It is a valid list and a common starting point for building up a collection.',
              code: 'empty = []\nprint(empty)\nprint(len(empty))',
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
              cellTitle: 'Slicing a list',
              prose: '`list[start:stop]` returns a new list with items from `start` up to (not including) `stop`. Omit either end to go from the beginning or to the end.',
              code: 'nums = [10, 20, 30, 40, 50]\nprint(nums[1:4])   # [20, 30, 40]\nprint(nums[:3])    # [10, 20, 30]\nprint(nums[2:])    # [30, 40, 50]',
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
              cellTitle: '.append() — add one item to the end',
              prose: '`.append(item)` adds a single item to the end of the list. It modifies the list in place and returns `None`.',
              code: 'scores = [85, 92, 78]\nscores.append(95)\nscores.append(88)\nscores',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 8,
              cellTitle: '.insert() — add at a specific position',
              prose: '`.insert(index, item)` inserts `item` before the element currently at `index`. All subsequent items shift right by one.',
              code: 'letters = ["a", "b", "d"]\nletters.insert(2, "c")   # insert "c" at index 2, before "d"\nletters',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 9,
              cellTitle: '.pop() — remove and return by index',
              prose: '`.pop()` removes and returns the last item. `.pop(i)` removes and returns the item at index `i`. The list shrinks by one.',
              code: 'stack = [1, 2, 3, 4]\nlast = stack.pop()      # removes 4\nfirst = stack.pop(0)    # removes 1\nprint(last, first)\nprint(stack)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 10,
              cellTitle: '.remove() — remove the first occurrence by value',
              prose: '`.remove(value)` finds the first item equal to `value` and removes it. If the value is not in the list, it raises a `ValueError`.',
              code: 'fruits = ["apple", "banana", "apple", "cherry"]\nfruits.remove("apple")   # removes the FIRST "apple"\nfruits',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 11,
              cellTitle: 'List + and * operators',
              prose:
                '`+` concatenates two lists into a new list. `*` repeats a list. Neither modifies the originals — both return new lists.',
              code: 'a = [1, 2, 3]\nb = [4, 5, 6]\nprint(a + b)       # [1, 2, 3, 4, 5, 6]\nprint(a * 3)       # [1, 2, 3, 1, 2, 3, 1, 2, 3]\nprint(a)           # unchanged',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 12,
              cellTitle: '.sort() — sort in place',
              prose: '`.sort()` sorts the list in ascending order, modifying it directly. Returns `None`. Pass `reverse=True` for descending order.',
              code: 'nums = [3, 1, 4, 1, 5, 9, 2, 6]\nnums.sort()\nprint(nums)\nnums.sort(reverse=True)\nprint(nums)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 13,
              cellTitle: 'sorted() vs .sort() — new list vs in-place',
              prose: '`sorted(list)` returns a new sorted list; the original is untouched. `.sort()` modifies the original and returns `None`. Use `sorted()` when you need to preserve the original.',
              code: 'original = [3, 1, 4, 1, 5]\nnew_sorted = sorted(original)\nprint("original:", original)\nprint("sorted:  ", new_sorted)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 14,
              cellTitle: '.index() and .count()',
              prose: '`.index(value)` returns the position of the first occurrence of `value` (raises `ValueError` if not found). `.count(value)` returns how many times `value` appears.',
              code: 'data = [5, 3, 8, 3, 9, 3]\nprint(data.index(8))     # 2 — position of 8\nprint(data.count(3))     # 3 — appears 3 times',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 15,
              cellTitle: 'Nested lists — lists of lists',
              prose: 'A list item can itself be a list. Access inner items by chaining index operations: `matrix[row][col]`.',
              code: 'matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nprint(matrix[0])        # first row: [1, 2, 3]\nprint(matrix[1][2])     # row 1, col 2: 6',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 16,
              cellTitle: 'list() — converting iterables to a list',
              prose: '`list()` converts any iterable into a list. Useful for materializing a range, turning a string into a list of characters, or copying a list.',
              code: 'print(list(range(5)))        # [0, 1, 2, 3, 4]\nprint(list("hello"))         # ["h", "e", "l", "l", "o"]\n\noriginal = [1, 2, 3]\ncopy = list(original)        # shallow copy\ncopy.append(99)\nprint(original)              # unchanged',
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
    'In-place methods (.sort, .append, .pop) modify the list and return None.',
    'Non-mutating operations (sorted(), +, slicing) return new lists.',
    'Indexing and slicing work identically to strings — zero-based, negatives from end.',
    'Nested lists: access inner items with chained indexing matrix[row][col].',
    'list() converts any iterable to a list; also use it to make a shallow copy.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}

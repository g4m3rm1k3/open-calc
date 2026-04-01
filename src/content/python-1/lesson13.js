// Chapter 0.5 — Lesson 13: Iterating Over Sequences
//
// DEPENDENCIES:
//   - Lesson 1:  Values (strings are values)
//   - Lesson 12: for Loops with range() (the loop syntax is already known)
//
// TEACHES:
//   1. What an iterable IS — anything Python can step through one item at a time
//   2. Looping over a string — characters one by one
//   3. The `in` operator — membership testing
//   4. len() on strings and sequences
//   5. Indexing with [] — accessing items by position
//   6. Negative indexing — counting from the end
//   7. Slicing — extracting a sub-sequence
//   8. enumerate() — getting index AND value together
//   9. Preview: lists are iterables too — [1, 2, 3]
//  10. Preview: tuples are iterables — (1, 2, 3)
//  11. Preview: dicts are iterables — looping over keys
//  12. sorted() and reversed() — iterable wrappers
//  13. range() is an iterable — connecting back to Lesson 12
//  14. zip() — iterating two sequences in lockstep (preview)
//  15. The for loop works on ANY iterable — the design principle
//
// NOTE: Lists, dicts, and tuples are introduced here as EXPOSURE only.
// Full teaching (creation, mutation, methods) comes in the Data Structures lessons.

export default {
  id: 'py-0-5-iterables',
  slug: 'iterating-sequences',
  chapter: 0.5,
  order: 13,
  title: 'Iterating Over Sequences',
  subtitle: 'The for loop works on anything — here\'s what that means',
  tags: ['iterable', 'for', 'string', 'enumerate', 'in', 'index', 'slice', 'zip', 'sorted'],

  hook: {
    question: 'You already know how to loop over numbers — but what else can a for loop step through?',
    realWorldContext:
      'The `for` loop in Python is not limited to counting with `range()`. ' +
      'It works on any sequence of values: every character in a text message, ' +
      'every item in a shopping cart, every row in a spreadsheet. ' +
      'The word for this is **iterable** — anything Python can step through one element at a time. ' +
      'This lesson gives you the concept and your first iterable you already know: the string.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'In Lesson 12 you wrote `for i in range(5)` — the `range` object is an iterable. Python asked it for one value at a time: 0, then 1, then 2, then 3, then 4. The loop worked because `range` knows how to deliver a sequence.',
      'A **string** is also an iterable. It delivers one character at a time. `for ch in "hello"` gives `ch` the values `"h"`, `"e"`, `"l"`, `"l"`, `"o"` in order. The loop syntax is identical — only the thing after `in` changes.',
      'Python\'s `for` loop is designed around this idea: it does not care whether the iterable is a range, a string, a list, or something you define yourself. If Python can ask it for the next item, the loop works. This is one of the most powerful design decisions in the language.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Iterable = "Python can ask it for the next item"',
        body: 'You do not need to know how large an iterable is to loop over it. Python just keeps asking "give me the next item" until the iterable says "I\'m done." This is why `for` works uniformly on strings, lists, files, and generators.',
      },
      {
        type: 'important',
        title: 'Lists and dicts are previews here',
        body: 'This lesson shows you lists `[1, 2, 3]` and dicts `{"a": 1}` so you can see how iteration extends to them. You will learn to create and manipulate them fully in the Data Structures lessons. For now: observe, don\'t worry about the details.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'The Iterable Universe',
        mathBridge:
          'An iterable is the computational equivalent of an ordered set — a collection you can walk through element by element.',
        caption:
          'Run each cell and observe what the for loop receives each iteration.',
        props: {
          initialCells: [
            // ── Lesson cells ─────────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'Looping over a string',
              prose:
                'A string is a sequence of characters. `for ch in "hello"` delivers one character per iteration. The loop variable holds a one-character string each time.',
              instructions:
                'The loop runs 5 times — once per character. Each character is itself a string of length 1.',
              code: 'for ch in "hello":\n    print(ch)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'The in operator — membership testing',
              prose:
                '`in` does two different jobs: inside a `for` loop it drives iteration, but used as a standalone operator it tests membership — "is this value in this iterable?"',
              instructions:
                'Both usages share the same keyword. The standalone `in` returns a boolean.',
              code: 'print("e" in "hello")    # True — e is in the string\nprint("z" in "hello")    # False\nprint("ell" in "hello")  # True — substring check',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'len() — length of a sequence',
              prose:
                '`len()` works on any sequence and returns the number of items. For a string, that is the number of characters. For a list, the number of elements.',
              instructions:
                'len() is the standard way to know how many items are in any sequence.',
              code: 'print(len("hello"))       # 5 characters\nprint(len(""))            # 0 — empty string\nprint(len("hello world")) # 11 — spaces count',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Indexing with [] — access by position',
              prose:
                'Square brackets after a sequence access a single item by its **zero-based index**. The first item is index 0, the second is index 1, and so on.',
              instructions:
                'Try changing the index. What does s[5] give for "hello"? (An IndexError — index out of range.)',
              code: 's = "hello"\nprint(s[0])   # h — first character\nprint(s[1])   # e — second\nprint(s[4])   # o — last (index 4 for length-5 string)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Negative indexing — counting from the end',
              prose:
                'Negative indices count from the end. `-1` is always the last item, `-2` is second-to-last, and so on. This works on any sequence.',
              instructions:
                'This is equivalent to s[len(s) - 1] but much cleaner. Negative indexing is idiomatic Python.',
              code: 's = "python"\nprint(s[-1])   # n — last character\nprint(s[-2])   # o — second to last\nprint(s[-6])   # p — same as s[0]',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'Slicing — extracting a sub-sequence',
              prose:
                '`s[start:stop]` extracts a sub-sequence from index `start` up to (but not including) `stop`. Omitting `start` defaults to 0; omitting `stop` defaults to the end.',
              instructions:
                'Slicing returns a new sequence of the same type. The original is unchanged.',
              code: 's = "hello world"\nprint(s[0:5])    # "hello"\nprint(s[6:])     # "world" — to end\nprint(s[:5])     # "hello" — from start\nprint(s[-5:])    # "world" — last 5',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 7,
              cellTitle: 'Looping with index using enumerate()',
              prose:
                '`enumerate(iterable)` delivers `(index, value)` pairs. Use it when you need both the position and the value in a loop — no manual counter needed.',
              instructions:
                'Compare this to the manual version: `i = 0; for ch in s: print(i, ch); i += 1`. enumerate() is cleaner.',
              code: 'for i, ch in enumerate("python"):\n    print(i, ch)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 8,
              cellTitle: 'for loop over a range is also iterating an iterable',
              prose:
                '`range()` is itself an iterable — it delivers integers one at a time. There is no special "range loop" in Python; it is just `for` applied to a range object, the same way you apply it to a string.',
              instructions:
                'This makes the connection explicit: range, string, and any other iterable are all treated the same by the for loop.',
              code: 'print("range:", list(range(5)))\nprint("string:", list("hello"))\n# Both are sequences Python can iterate',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 9,
              cellTitle: 'Preview: list is an iterable',
              prose:
                'A list — written as `[item1, item2, item3]` — is a sequence of values. You will learn to create and work with lists fully in the Data Structures chapter. For now: notice that `for` works on it exactly the same way as on strings.',
              instructions:
                'The loop doesn\'t care that the items are integers rather than characters. An iterable is an iterable.',
              code: 'numbers = [10, 20, 30, 40, 50]   # a list — full details come later\nfor n in numbers:\n    print(n)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 10,
              cellTitle: 'Preview: tuple is an iterable',
              prose:
                'A tuple — written with parentheses `(a, b, c)` — is an immutable sequence. Like a list, but it cannot be changed after creation. Iteration works identically.',
              instructions:
                'Tuples are often used for fixed collections — coordinates, RGB colors, database rows.',
              code: 'point = (3, 7, -2)   # a tuple — details later\nfor coordinate in point:\n    print(coordinate)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 11,
              cellTitle: 'Preview: dict iteration loops over keys',
              prose:
                'A dictionary — written as `{"key": value}` — maps keys to values. When you iterate a dict with `for`, you get the **keys** by default. Accessing the value uses `dict[key]`.',
              instructions:
                'You will learn dicts fully later. For now, notice that `for` still works — you just get keys, not (key, value) pairs.',
              code: 'scores = {"Alice": 92, "Bob": 85, "Carol": 78}   # a dict\nfor name in scores:\n    print(name, "->", scores[name])',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 12,
              cellTitle: 'sorted() — iterate in sorted order',
              prose:
                '`sorted(iterable)` returns a new sorted list from any iterable, without modifying the original. You can iterate the result directly in a `for` loop.',
              instructions:
                'The original string is unchanged — sorted() creates a new sequence.',
              code: 'letters = "dcbae"\nfor ch in sorted(letters):\n    print(ch, end=" ")',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 13,
              cellTitle: 'reversed() — iterate in reverse',
              prose:
                '`reversed(sequence)` returns an iterator that steps through the sequence backwards. Works on strings (via `reversed`), lists, tuples, and ranges.',
              instructions:
                'For strings, reversed() requires wrapping in list() or joining, because strings are not directly reversible by index — use slicing `s[::-1]` as a shorthand.',
              code: 'for ch in reversed("hello"):\n    print(ch, end=" ")\n\nprint()\nprint("hello"[::-1])   # slice shorthand for reverse',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 14,
              cellTitle: 'zip() — iterate two sequences in lockstep',
              prose:
                '`zip(a, b)` pairs up items from two iterables by position: first item of a with first item of b, second with second, and so on. The loop stops when the shorter sequence runs out.',
              instructions:
                'zip() is a preview of how Python handles parallel sequences. Full details come when we cover lists.',
              code: 'names = ["Alice", "Bob", "Carol"]\nscores = [92, 85, 78]\nfor name, score in zip(names, scores):\n    print(name, "scored", score)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 15,
              cellTitle: 'Building results by iterating a string',
              prose:
                'The accumulator pattern from Lesson 12 works on any iterable. Here we iterate a string and filter characters — building a new string from only the ones that pass a condition.',
              instructions:
                'This removes all vowels from a string. The condition is membership testing with `in`.',
              code: 'vowels = "aeiouAEIOU"\nword = "programming"\nresult = ""\nfor ch in word:\n    if ch not in vowels:\n        result += ch\nprint(result)',
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 16,
              cellTitle: 'Every iterable works the same way',
              prose:
                'This is the design principle: `for x in iterable` works identically regardless of what the iterable is. Range, string, list, tuple, dict, file, generator — the loop syntax never changes. Only the thing after `in` changes.',
              instructions:
                'Four different iterables, identical loop syntax. This uniformity is why Python is so readable.',
              code: 'for x in range(3):        print("range:", x)\nfor x in "abc":           print("string:", x)\nfor x in [10, 20, 30]:    print("list:", x)\nfor x in (True, False):   print("tuple:", x)',
              output: '', status: 'idle', figureJson: null,
            },

            // ── Challenge cells ───────────────────────────────────────────────
            {
              id: 21,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Count Vowels',
              difficulty: 'easy',
              prompt:
                'Write `count_vowels(s)` that counts how many vowel characters (a, e, i, o, u — case-insensitive) are in the string `s`.',
              instructions:
                'Iterate over the string. Use `in` to check membership against `"aeiou"`. Convert each character to lowercase first.',
              code: '# Define count_vowels(s) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'count_vowels' not in dir():
    res = "ERROR: Function 'count_vowels' not found."
elif count_vowels("hello") == 2 and count_vowels("Python") == 1 and count_vowels("rhythm") == 0:
    res = "SUCCESS: count_vowels verified. 'hello'=2, 'Python'=1, 'rhythm'=0."
else:
    res = f"ERROR: Got count_vowels('hello')={count_vowels('hello')}, count_vowels('Python')={count_vowels('Python')}."
res
`,
              hint: 'for ch in s: if ch.lower() in "aeiou": count += 1',
            },
            {
              id: 22,
              challengeType: 'fill',
              challengeNumber: 2,
              challengeTitle: 'Enumerate Positions',
              difficulty: 'easy',
              prompt:
                'Fill in the blanks to print each character and its index in the format `0: h`, `1: e`, etc.',
              instructions:
                'Use `enumerate()` to get both the index and the character in one step.',
              starterBlock: `for ___, ___ in enumerate("hello"):
    print(f"___: ___")
`,
              code: `for ___, ___ in enumerate("hello"):
    print(f"___: ___")
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
output = []
for i, ch in enumerate("hello"):
    output.append(f"{i}: {ch}")
if output == ["0: h", "1: e", "2: l", "3: l", "4: o"]:
    res = "SUCCESS: enumerate() verified. Index and character paired correctly."
else:
    res = f"ERROR: Expected ['0: h', '1: e', ...]. Got {output}."
res
`,
              hint: 'for i, ch in enumerate("hello"): print(f"{i}: {ch}")',
            },
            {
              id: 23,
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Reverse a String',
              difficulty: 'easy',
              prompt:
                'Write `reverse_string(s)` that returns the string reversed.\n\nWrite two versions:\n1. Using a `for` loop and accumulator\n2. Using slicing `s[::-1]`\n\nBoth should return the same result.',
              instructions:
                'The loop version: iterate in reverse using reversed(s), or iterate forward and prepend each character.',
              code: '# Define reverse_string(s) using a for loop\n# Then add reverse_string_v2 using slicing\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'reverse_string' not in dir():
    res = "ERROR: Function 'reverse_string' not found."
elif reverse_string("hello") == "olleh" and reverse_string("python") == "nohtyp" and reverse_string("a") == "a":
    res = "SUCCESS: reverse_string verified. 'hello'→'olleh', 'python'→'nohtyp'."
else:
    res = f"ERROR: Got reverse_string('hello')={reverse_string('hello')!r}. Expected 'olleh'."
res
`,
              hint: 'Loop version: result = ""; for ch in reversed(s): result += ch; return result. Slice version: return s[::-1]',
            },
            {
              id: 24,
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Find First Digit',
              difficulty: 'medium',
              prompt:
                'Write `first_digit(s)` that returns the first digit character found in the string, or `None` if there are no digits.\n\nCompound: uses `for`, `in`, conditionals (L11), string iteration (L13).',
              instructions:
                'Use `ch.isdigit()` to check if a character is a digit. Return immediately on the first match.',
              code: '# Define first_digit(s) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'first_digit' not in dir():
    res = "ERROR: Function 'first_digit' not found."
elif first_digit("abc3def7") == "3" and first_digit("hello") is None and first_digit("9xyz") == "9":
    res = "SUCCESS: first_digit verified. Returns first digit character or None."
else:
    res = f"ERROR: Got first_digit('abc3def7')={first_digit('abc3def7')!r}, first_digit('hello')={first_digit('hello')!r}."
res
`,
              hint: 'for ch in s: if ch.isdigit(): return ch. After the loop: return None',
            },
            {
              id: 25,
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Zip Score Reporter',
              difficulty: 'medium',
              prompt:
                'Given two lists (provided), use `zip()` to iterate them in lockstep and print a summary.\n\nFor each (name, score) pair, print:\n- `"PASS: Alice - 92"` if score >= 60\n- `"FAIL: Bob - 45"` if score < 60\n\nCompound: zip(), conditionals (L11), f-strings, for loop.',
              instructions:
                'The lists are already defined — just write the for loop using zip().',
              code: `names = ["Alice", "Bob", "Carol", "David"]
scores = [92, 45, 78, 55]

# Write your for loop here using zip(names, scores)
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
names = ["Alice", "Bob", "Carol", "David"]
scores = [92, 45, 78, 55]
results = []
for name, score in zip(names, scores):
    if score >= 60:
        results.append(f"PASS: {name} - {score}")
    else:
        results.append(f"FAIL: {name} - {score}")
expected = ["PASS: Alice - 92", "FAIL: Bob - 45", "PASS: Carol - 78", "FAIL: David - 55"]
if results == expected:
    res = "SUCCESS: zip() reporter verified. PASS/FAIL applied to all pairs."
else:
    res = f"ERROR: Expected {expected}. Got {results}."
res
`,
              hint: 'for name, score in zip(names, scores): if score >= 60: print(f"PASS: {name} - {score}") else: ...',
            },
            {
              id: 26,
              challengeType: 'write',
              challengeNumber: 6,
              challengeTitle: 'Caesar Cipher',
              difficulty: 'hard',
              prompt:
                'CUMULATIVE — Lessons 1, 2, 4, 9, 11, 13.\n\nWrite `caesar(text, shift)` that shifts every letter by `shift` positions in the alphabet (wrapping around). Non-letter characters are unchanged.\n\nHints:\n- `ord(ch)` converts a character to its ASCII code\n- `chr(n)` converts an ASCII code back to a character\n- Lowercase letters are ASCII 97–122, uppercase 65–90\n- Use `%` for wrapping',
              instructions:
                'For each character: if it\'s a letter, shift it (preserving case). If not a letter, keep it as-is.',
              code: '# Define caesar(text, shift) here\n',
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'caesar' not in dir():
    res = "ERROR: Function 'caesar' not found."
elif (caesar("hello", 3) == "khoor" and
      caesar("xyz", 3) == "abc" and
      caesar("Hello, World!", 13) == "Uryyb, Jbeyq!" and
      caesar("abc", 0) == "abc"):
    res = "SUCCESS: Caesar cipher verified. Shift, wrap, and non-letter preservation all correct."
else:
    res = f"ERROR: caesar('hello',3)={caesar('hello',3)!r} (expected 'khoor'), caesar('xyz',3)={caesar('xyz',3)!r} (expected 'abc')."
res
`,
              hint: 'for ch in text: if ch.isalpha(): base = ord("a") if ch.islower() else ord("A"); result += chr((ord(ch) - base + shift) % 26 + base) else: result += ch',
            },
            {
              id: 27,
              challengeType: 'fill',
              challengeNumber: 7,
              challengeTitle: 'Dict Score Summary',
              difficulty: 'hard',
              prompt:
                'A dict is provided. Fill in the loop to compute the average score across all students.\n\nThe dict maps names (keys) to scores (values). Access the value for each key with `scores[name]`.',
              instructions:
                'Loop over the dict (you get keys). Sum the values, divide by count. Round to 1 decimal place.',
              starterBlock: `scores = {"Alice": 92, "Bob": 85, "Carol": 78, "David": 91, "Eve": 64}

total = 0
count = 0
for ___ in ___:
    total += ___
    count += 1

average = round(total / count, 1)
average
`,
              code: `scores = {"Alice": 92, "Bob": 85, "Carol": 78, "David": 91, "Eve": 64}

total = 0
count = 0
for ___ in ___:
    total += ___
    count += 1

average = round(total / count, 1)
average
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
scores = {"Alice": 92, "Bob": 85, "Carol": 78, "David": 91, "Eve": 64}
total = 0
count = 0
for name in scores:
    total += scores[name]
    count += 1
average = round(total / count, 1)
if average == 82.0:
    res = "SUCCESS: Dict iteration verified. Average score = 82.0."
else:
    res = f"ERROR: Expected 82.0, got {average}. Did you access scores[name] inside the loop?"
res
`,
              hint: 'for name in scores: total += scores[name], count += 1',
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Iterables vs iterators**: an *iterable* is anything that can produce an iterator (a string, list, range). An *iterator* is the object that actually tracks position and delivers the next item. `iter(iterable)` creates an iterator; `next(iterator)` advances it. The `for` loop calls these internally — you never need to call them directly, but knowing they exist explains how `for` works under the hood.',
      '**Strings are immutable sequences**: you can index and slice a string, but you cannot assign to an index (`s[0] = "H"` raises a TypeError). This will contrast with lists, which are mutable.',
      '**dict ordering**: as of Python 3.7, dictionaries maintain insertion order. Iterating a dict gives keys in the order they were inserted. This was not guaranteed in earlier versions.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'dict.keys(), .values(), .items()',
        body: 'Dicts have three iterator-producing methods. `.keys()` gives keys (same as iterating the dict directly). `.values()` gives just the values. `.items()` gives (key, value) tuples — letting you unpack both in a for loop: `for name, score in scores.items()`. Full coverage in the Data Structures lesson.',
      },
      {
        type: 'insight',
        title: 'map() and filter() are also iterables',
        body: '`map(func, iterable)` applies a function to every item and returns an iterable of results. `filter(func, iterable)` returns only items where the function returns True. These are more advanced patterns you will see when combining functions with data.',
      },
    ],
  },

  mentalModel: [
    'An iterable is anything Python can step through one item at a time.',
    'for x in iterable: always works — range, string, list, tuple, dict (keys), file.',
    'in tests membership: "e" in "hello" → True.',
    's[i] accesses by index (0-based); s[-1] is the last item.',
    's[start:stop] slices from start up to (not including) stop.',
    'enumerate() gives (index, value); zip() pairs two iterables together.',
  ],

  checkpoints: ['read-intuition'],
  quiz: [],
}

export default {
  id: 'a-02',
  slug: 'values-and-types',
  track: 'A',
  order: 2,
  title: 'Values and Types',
  subtitle: 'The Four Primitive Types',
  tags: ['types', 'int', 'float', 'str', 'bool', 'type-conversion'],
  prereqs: ['a-01'],
  unlocks: ['a-03', 'a-04'],

  hook: {
    question: 'Why does 3 + 4 give 7 but "3" + "4" give "34"?',
    realWorldContext:
      'The same operator (+) does completely different things depending on the type of the values it operates on. ' +
      'Type is not metadata — it determines every operation. A data scientist who ignores types will spend hours ' +
      'debugging why their average is wrong because a column of numbers was stored as strings.',
  },

  intuition: {
    prose: [
      'Python has four **primitive types**: `int` (whole numbers), `float` (decimals), `str` (text), and `bool` (True/False). Every value belongs to exactly one type.',
      'The type determines what operations are valid and what they mean. `+` on two ints means arithmetic addition. `+` on two strings means concatenation. `+` on a string and an int means a **TypeError** — Python refuses to guess what you meant.',
      'You can **convert** between types explicitly using `int()`, `float()`, `str()`, and `bool()`. Python will sometimes convert automatically — `3 + 4.0` gives `7.0` because int was promoted to float. But it will never convert silently between numbers and strings.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The Four Primitive Types',
        body: 'int: whole numbers (3, -10, 1000000)\nfloat: decimals (3.14, -0.001, 1.0)\nstr: text ("hello", "42", "")\nbool: True or False (exactly these two values)',
      },
      {
        type: 'warning',
        title: '"42" is not 42',
        body: 'The string "42" and the integer 42 are completely different values. "42" + 1 is a TypeError. int("42") + 1 is 43. Always know which one you have.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Types in Action',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Stage 1 — Revealing the Four Types',
              prose: '`type()` is a built-in function that tells you the type of any value. Run each line and see the type labels Python uses.',
              instructions: 'Run the cell. Notice Python says <class \'int\'> not just "int". The word class means type here — they are the same thing.',
              code: 'print(type(42))\nprint(type(3.14))\nprint(type("hello"))\nprint(type(True))',
              output: '',
              status: 'idle',
            },
            {
              id: 2,
              cellTitle: 'Stage 2 — Same Operator, Different Meaning',
              prose: 'The + operator means completely different things depending on type. This is not a quirk — it is the design. The operator asks "what does addition mean for this type?"',
              instructions: 'Run the cell. Notice: ints add arithmetically, strings concatenate, and mixing them crashes. This crash is Python doing the right thing — refusing to guess.',
              code: 'print(3 + 4)          # int + int = arithmetic\nprint("3" + "4")       # str + str = concatenation\n# print("3" + 4)       # TypeError — uncomment to see it',
              output: '',
              status: 'idle',
            },
            {
              id: 3,
              cellTitle: 'Stage 3 — Automatic Type Promotion',
              prose: 'When Python mixes int and float in arithmetic, it promotes the int to float. This is the only automatic conversion Python does between numeric types. The result is always float.',
              instructions: 'Run the cell. Notice that 3 + 4.0 produces 7.0 (a float), not 7 (an int). The decimal point is Python\'s signal that this is a float.',
              code: 'print(3 + 4)      # int + int → int\nprint(3 + 4.0)    # int + float → float\nprint(type(3 + 4))\nprint(type(3 + 4.0))',
              output: '',
              status: 'idle',
            },
            {
              id: 4,
              cellTitle: 'Stage 4 — Explicit Type Conversion',
              prose: 'You can convert between types explicitly. `int()` truncates floats (drops the decimal). `float()` adds a decimal. `str()` converts any value to its text representation. `bool()` converts to True or False.',
              instructions: 'Run the cell. Notice int(3.9) gives 3, not 4 — it truncates, does not round. Notice int("42") works but int("hello") crashes.',
              code: 'print(int(3.9))       # truncates, does not round\nprint(float(7))       # 7.0\nprint(str(42))        # "42"\nprint(int("42"))      # "42" → 42\n# print(int("hello")) # ValueError — uncomment to see',
              output: '',
              status: 'idle',
            },
            {
              id: 5,
              cellTitle: 'Stage 5 — Boolean Values',
              prose: 'bool has exactly two values: True and False (capital T, capital F). They behave as 1 and 0 in arithmetic. This is rarely useful but important to know — it is why `True + True` equals 2.',
              instructions: 'Run the cell. The bool type will reappear heavily in Lesson A.09 (comparisons) and A.10 (conditionals).',
              code: 'print(True)\nprint(False)\nprint(type(True))\nprint(True + True)   # 2 — True behaves as 1\nprint(True * 5)      # 5',
              output: '',
              status: 'idle',
            },
            {
              id: 6,
              cellTitle: 'Stage 6 — The "42 is not 42" Problem',
              prose: 'This cell demonstrates the most common data-science type confusion: a column of numbers stored as strings. Everything looks fine until you try to compute with it.',
              instructions: 'Run the cell. The prices list looks like numbers but every element is a string. The sum fails because you cannot add strings. Fix it by converting each element to float.',
              code: 'prices = ["10.99", "5.50", "3.25"]  # looks like numbers!\nprint(type(prices[0]))              # but it\'s a string\n# print(sum(prices))               # TypeError — uncomment\n\n# Fix: convert to float\nfloat_prices = [float(p) for p in prices]\nprint(sum(float_prices))',
              output: '',
              status: 'idle',
            },
            {
              id: 11,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Challenge 1 — Type Surgery',
              difficulty: 'easy',
              prompt: 'Given the string `raw = "365"`, create three new variables: `as_int` (the value as an integer), `as_float` (the value as a float), and `as_bool` (the value as a boolean). Do this using explicit conversion functions — not by typing the values directly.',
              instructions: '1. Start from raw = "365".\n2. Convert it to int, float, and bool.\n3. Store each in the named variable.\n4. The test will check all three.',
              code: 'raw = "365"\n# Your code here\nas_int = \nas_float = \nas_bool = \n',
              output: '',
              status: 'idle',
              testCode: `
if 'as_int' not in locals(): raise ValueError("Missing: as_int")
if 'as_float' not in locals(): raise ValueError("Missing: as_float")
if 'as_bool' not in locals(): raise ValueError("Missing: as_bool")
if type(as_int) != int: raise ValueError(f"as_int should be int, got {type(as_int)}")
if type(as_float) != float: raise ValueError(f"as_float should be float, got {type(as_float)}")
if type(as_bool) != bool: raise ValueError(f"as_bool should be bool, got {type(as_bool)}")
if as_int != 365: raise ValueError(f"as_int should be 365, got {as_int}")
if as_float != 365.0: raise ValueError(f"as_float should be 365.0, got {as_float}")
if as_bool != True: raise ValueError(f"as_bool should be True (any nonzero number is truthy), got {as_bool}")
res = "SUCCESS: All three conversions correct. Note: bool(365) is True because any non-zero number is truthy."
res
`,
              hint: 'as_int = int(raw) | as_float = float(raw) | as_bool = bool(int(raw))',
            },
            {
              id: 12,
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Challenge 2 — The Data Import Problem',
              difficulty: 'medium',
              prompt: 'A CSV file was loaded incorrectly. The list `data` contains prices as strings with dollar signs. Compute the total and average as proper floats. Store them as `total` and `average`.',
              instructions: '1. Strip the "$" from each string (hint: s.replace("$",""))\n2. Convert to float\n3. Compute sum and average\n4. No loops — use a list comprehension for step 1-2',
              code: 'data = ["$12.50", "$8.99", "$24.00", "$5.75", "$15.30"]\n# Your code here\ntotal = \naverage = \n',
              output: '',
              status: 'idle',
              testCode: `
if 'total' not in locals(): raise ValueError("Missing: total")
if 'average' not in locals(): raise ValueError("Missing: average")
expected_total = 12.50 + 8.99 + 24.00 + 5.75 + 15.30
expected_avg = expected_total / 5
if abs(total - expected_total) > 0.01:
    raise ValueError(f"total should be {expected_total:.2f}, got {total:.2f}. Did you strip the $ and convert to float?")
if abs(average - expected_avg) > 0.01:
    raise ValueError(f"average should be {expected_avg:.2f}, got {average:.2f}.")
res = f"SUCCESS: total={total:.2f}, average={average:.2f}. This exact problem appears in every real data pipeline."
res
`,
              hint: 'cleaned = [float(s.replace("$","")) for s in data]\ntotal = sum(cleaned)\naverage = total / len(cleaned)',
            },
          ],
        },
      },
    ],
  },

  mentalModel: [
    'Every value has exactly one type: int, float, str, or bool.',
    'The type determines which operations are valid and what they mean.',
    'int + float → float (automatic promotion). str + int → TypeError (no automatic conversion).',
    'Convert explicitly: int(), float(), str(), bool().',
    'In real data, numbers stored as strings are an extremely common problem.',
  ],
}

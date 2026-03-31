export default {
  id: 'py-0-2',
  slug: 'python-syntax',
  chapter: 0.2,
  order: 1,
  title: 'Python Core Syntax: Variables & Types',
  subtitle: 'The four primitive types and how Python stores everything',
  tags: ['basics', 'python', 'variables', 'types', 'int', 'float', 'str', 'bool', 'operators'],

  hook: {
    question: 'What is the difference between 3, 3.0, "3", and True — and why does Python care?',
    realWorldContext:
      'Every piece of data in a program has a type — the category that determines what you can do with it. ' +
      'You can divide 3.0 by 2 and get 1.5. You cannot divide "hello" by 2. ' +
      'Python tracks this distinction automatically, but you need to understand it to predict how your code behaves. ' +
      'Data science bugs are overwhelmingly type bugs: mixing numbers and strings, treating integers as floats, or testing booleans the wrong way.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Python has four **primitive types** you will use constantly:',

      '**int** — whole numbers with no decimal point. ' +
      'Used for counts, indices, iteration limits. ' +
      'Integers in Python have arbitrary precision — no overflow.',

      '**float** — decimal numbers, stored as IEEE 754 64-bit values. ' +
      'Used for measurements, ratios, scientific values. ' +
      'Floats have limited precision (~15 significant digits) — this matters for numerical computing.',

      '**str** — text, enclosed in single or double quotes. ' +
      'Strings are sequences of characters. ' +
      'They support indexing, slicing, concatenation, and a rich library of methods.',

      '**bool** — exactly two values: True or False. ' +
      'Booleans are the result of comparisons and drive all conditional logic. ' +
      'In Python, bool is a subtype of int: True == 1 and False == 0.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Dynamic Typing — Python Infers the Type',
        body: 'You never write "int x = 5". You just write x = 5 and Python infers the type from the value. ' +
              'The type lives with the value, not the variable name. ' +
              'This means the same variable can hold different types at different times — which is flexible but requires care.',
      },
      {
        type: 'warning',
        title: 'Integer Division vs. Float Division',
        body: 'In Python 3, 7 / 2 gives 3.5 (float division). ' +
              '7 // 2 gives 3 (floor division, discards the remainder). ' +
              '7 % 2 gives 1 (modulo, the remainder). ' +
              'Know which one you need before you write it.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Types in Action — Build Your Understanding',
        mathBridge: 'Each challenge teaches one concept. All cells share a kernel — variables from earlier cells carry forward.',
        caption: 'Work through the challenges in order. The final challenge combines all four types.',
        props: {
          initialCells: [
            // ── DEMO: The four types ───────────────────────────────────────────
            {
              id: 1,
              code: [
                '# DEMO: Python\'s four primitive types.',
                '# type() tells you what kind of value you have.',
                '',
                'a = 42          # int',
                'b = 3.14        # float',
                'c = "open-calc" # str',
                'd = True        # bool',
                '',
                'print(type(a))  # <class \'int\'>',
                'print(type(b))  # <class \'float\'>',
                'print(type(c))  # <class \'str\'>',
                'print(type(d))  # <class \'bool\'>',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGE 1: Fill-in — create typed variables ──────────────────
            {
              id: 2,
              challengeType: 'fill-in',
              challengeNumber: 1,
              challengeTitle: 'One of Each Type',
              difficulty: 'easy',
              prompt:
                'Copy the starter code and fill in each blank with a value of the correct type. ' +
                'The assert statements will verify your types automatically.',
              starterBlock: [
                'students   = ___     # int: how many students are in a class',
                'gpa        = ___     # float: a grade point average, e.g. 3.75',
                'course     = ___     # str: the name of a course in quotes',
                'passed     = ___     # bool: did the student pass? True or False',
                '',
                'print(f"Course: {course}")',
                'print(f"Students: {students}, Average GPA: {gpa}, All passed: {passed}")',
              ].join('\n'),
              code: '# Paste the starter code and fill in each ___\n\n',
              output: '', status: 'idle', figureJson: null,
              testCode: [
                'assert isinstance(students, int),   f"students must be int, got {type(students).__name__}"',
                'assert isinstance(gpa, float),      f"gpa must be float, got {type(gpa).__name__}"',
                'assert isinstance(course, str) and len(course) > 0, \\',
                '    f"course must be a non-empty string, got {course!r}"',
                'assert isinstance(passed, bool),    f"passed must be bool, got {type(passed).__name__}"',
                '"SUCCESS: All four types are correct!"',
              ].join('\n'),
              hint: [
                'int: students = 30          (no decimal, no quotes)',
                'float: gpa = 3.75           (decimal point required)',
                'str: course = "Calculus I"  (text inside quotes)',
                'bool: passed = True         (capital T, no quotes)',
              ].join('\n'),
            },

            // ── DEMO: Arithmetic operators ─────────────────────────────────────
            {
              id: 3,
              code: [
                '# DEMO: Arithmetic operators.',
                '# Python supports +, -, *, /, //, %, **',
                '',
                'x = 17',
                'y = 5',
                '',
                'print(f"{x} + {y}  = {x + y}")   # addition',
                'print(f"{x} - {y}  = {x - y}")   # subtraction',
                'print(f"{x} * {y}  = {x * y}")   # multiplication',
                'print(f"{x} / {y}  = {x / y}")   # true division  → float',
                'print(f"{x} // {y} = {x // y}")  # floor division → int',
                'print(f"{x} % {y}  = {x % y}")   # modulo (remainder)',
                'print(f"{x} ** {y} = {x ** y}")  # exponentiation',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGE 2: Write — arithmetic ───────────────────────────────
            {
              id: 4,
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Circle Geometry',
              difficulty: 'easy',
              prompt:
                'Given a circle with radius 7, compute:\n' +
                '• circumference = 2 × π × radius\n' +
                '• area = π × radius²\n\n' +
                'Use 3.14159 for π. Store radius in a variable. Print both results rounded to 2 decimal places.',
              code: '# Compute circumference and area of a circle with radius 7.\n# Use round(value, 2) or an f-string like f"{value:.2f}"\n\n',
              output: '', status: 'idle', figureJson: null,
              testCode: [
                'import math as _math',
                'assert "radius" in dir(), "Define a variable called radius."',
                'assert abs(radius - 7) < 1e-9, f"radius should be 7, got {radius}"',
                'assert "circumference" in dir(), "Define a variable called circumference."',
                'assert "area" in dir(), "Define a variable called area."',
                'assert abs(circumference - 2 * 3.14159 * 7) < 0.01, \\',
                '    f"circumference should be ≈43.98, got {circumference:.4f}"',
                'assert abs(area - 3.14159 * 7**2) < 0.01, \\',
                '    f"area should be ≈153.94, got {area:.4f}"',
                '"SUCCESS: circumference ≈ 43.98, area ≈ 153.94"',
              ].join('\n'),
              hint: [
                'radius = 7',
                'pi = 3.14159',
                'circumference = 2 * pi * radius',
                'area = pi * radius ** 2',
                'print(f"Circumference: {circumference:.2f}")',
                'print(f"Area:          {area:.2f}")',
              ].join('\n'),
            },

            // ── DEMO: String operations ────────────────────────────────────────
            {
              id: 5,
              code: [
                '# DEMO: Strings — sequences of characters.',
                '',
                'first = "open"',
                'last  = "calc"',
                '',
                '# Concatenation (joining)',
                'combined = first + "-" + last',
                'print(combined)              # open-calc',
                '',
                '# f-strings (formatted strings) — embed values directly',
                'version = 2.0',
                'print(f"{combined} v{version}")  # open-calc v2.0',
                '',
                '# Useful string methods',
                'word = "  Python  "',
                'print(word.strip())          # removes whitespace: "Python"',
                'print(word.upper())          # "  PYTHON  "',
                'print(len(word))             # 10 (includes the spaces)',
                '',
                '# Indexing and slicing',
                'lang = "Python"',
                'print(lang[0])       # "P"  (first character, index 0)',
                'print(lang[-1])      # "n"  (last character)',
                'print(lang[0:3])     # "Pyt" (characters 0, 1, 2)',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGE 3: Fill-in — strings ────────────────────────────────
            {
              id: 6,
              challengeType: 'fill-in',
              challengeNumber: 3,
              challengeTitle: 'String Surgery',
              difficulty: 'easy',
              prompt:
                'Complete the blanks to produce the required outputs. ' +
                'Each blank uses a string method or operator you saw in the demo.',
              starterBlock: [
                'sentence = "the quick brown fox"',
                '',
                '# 1. Make it ALL CAPS and store in "upper_sentence"',
                'upper_sentence = sentence.___',
                '',
                '# 2. Capitalise only the first letter (use .capitalize())',
                'cap_sentence = sentence.___',
                '',
                '# 3. Count how many characters are in the sentence',
                'char_count = ___',
                '',
                '# 4. Replace "fox" with "data scientist"',
                'new_sentence = sentence.replace(___, ___)',
                '',
                'print(upper_sentence)',
                'print(cap_sentence)',
                'print(f"Length: {char_count}")',
                'print(new_sentence)',
              ].join('\n'),
              code: '# Paste the starter code and fill in the blanks.\n\n',
              output: '', status: 'idle', figureJson: null,
              testCode: [
                'sentence = "the quick brown fox"',
                'assert "upper_sentence" in dir(), "Define upper_sentence."',
                'assert upper_sentence == sentence.upper(), \\',
                '    f"upper_sentence should be {sentence.upper()!r}, got {upper_sentence!r}"',
                'assert "cap_sentence" in dir(), "Define cap_sentence."',
                'assert cap_sentence == sentence.capitalize(), \\',
                '    f"cap_sentence should be {sentence.capitalize()!r}, got {cap_sentence!r}"',
                'assert "char_count" in dir()',
                'assert char_count == len(sentence), \\',
                '    f"char_count should be {len(sentence)}, got {char_count}"',
                'assert "new_sentence" in dir()',
                'assert new_sentence == sentence.replace("fox", "data scientist"), \\',
                '    f"new_sentence should replace \'fox\' with \'data scientist\'"',
                '"SUCCESS: All string operations are correct!"',
              ].join('\n'),
              hint: [
                'upper_sentence = sentence.upper()',
                'cap_sentence   = sentence.capitalize()',
                'char_count     = len(sentence)',
                'new_sentence   = sentence.replace("fox", "data scientist")',
              ].join('\n'),
            },

            // ── DEMO: Booleans and comparison operators ────────────────────────
            {
              id: 7,
              code: [
                '# DEMO: Booleans and comparisons.',
                '# Comparison operators always return True or False.',
                '',
                'x = 10',
                'y = 3',
                '',
                'print(x > y)    # True',
                'print(x < y)    # False',
                'print(x == y)   # False  (== is equality, not assignment)',
                'print(x != y)   # True',
                'print(x >= 10)  # True',
                '',
                '# Logical operators combine booleans',
                'print(x > 5 and y < 10)   # True  (both must hold)',
                'print(x < 0 or  y < 10)   # True  (at least one must hold)',
                'print(not x > 5)           # False (flips the result)',
                '',
                '# Bool is a subtype of int',
                'print(True + True)   # 2',
                'print(True * 7)      # 7',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGE 4: Write — boolean logic ────────────────────────────
            {
              id: 8,
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Boolean Logic Lab',
              difficulty: 'medium',
              prompt:
                'Given score = 82 and attendance = 0.78:\n\n' +
                '• passed_exam: True if score >= 70\n' +
                '• good_attendance: True if attendance >= 0.80\n' +
                '• gets_distinction: True if score >= 90 and attendance >= 0.80\n' +
                '• needs_intervention: True if score < 60 or attendance < 0.60\n\n' +
                'Print all four results with descriptive labels.',
              code: 'score = 82\nattendance = 0.78\n\n# Compute the four boolean variables below:\n\n',
              output: '', status: 'idle', figureJson: null,
              testCode: [
                'assert "passed_exam" in dir(), "Define passed_exam."',
                'assert "good_attendance" in dir(), "Define good_attendance."',
                'assert "gets_distinction" in dir(), "Define gets_distinction."',
                'assert "needs_intervention" in dir(), "Define needs_intervention."',
                'assert passed_exam == True,          f"passed_exam should be True (score {score} >= 70)"',
                'assert good_attendance == False,     f"good_attendance should be False (attendance {attendance} < 0.80)"',
                'assert gets_distinction == False,    f"gets_distinction should be False (score {score} < 90)"',
                'assert needs_intervention == False,  f"needs_intervention should be False"',
                '"SUCCESS: All four boolean expressions are correct!"',
              ].join('\n'),
              hint: [
                'passed_exam       = score >= 70',
                'good_attendance   = attendance >= 0.80',
                'gets_distinction  = score >= 90 and attendance >= 0.80',
                'needs_intervention = score < 60 or attendance < 0.60',
              ].join('\n'),
            },

            // ── DEMO: Type conversion ──────────────────────────────────────────
            {
              id: 9,
              code: [
                '# DEMO: Converting between types.',
                '# int(), float(), str(), bool() are constructor functions.',
                '',
                'raw_input = "42"           # str, as if read from user input',
                'as_int    = int(raw_input)  # "42" → 42',
                'as_float  = float(raw_input) # "42" → 42.0',
                '',
                'print(type(raw_input), raw_input)  # <class \'str\'>  42',
                'print(type(as_int),    as_int)      # <class \'int\'>  42',
                'print(type(as_float),  as_float)    # <class \'float\'>  42.0',
                '',
                '# Truthy and falsy values',
                'print(bool(0))     # False — zero is falsy',
                'print(bool(1))     # True  — any non-zero number is truthy',
                'print(bool(""))    # False — empty string is falsy',
                'print(bool("hi"))  # True  — non-empty string is truthy',
                '',
                '# str() turns anything into a string',
                'print(str(3.14) + " is pi")  # "3.14 is pi"',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGE 5: Fill-in — type conversion ────────────────────────
            {
              id: 10,
              challengeType: 'fill-in',
              challengeNumber: 5,
              challengeTitle: 'Type Conversion',
              difficulty: 'medium',
              prompt:
                'Data arrives as strings from external sources (files, APIs, user input). ' +
                'Fill in the blanks to convert each value to the correct type before computing.',
              starterBlock: [
                '# Raw data — everything is a string',
                'raw_price    = "19.99"',
                'raw_quantity = "12"',
                'raw_discount = "0.15"',
                '',
                '# Convert to the right numeric types',
                'price    = ___(raw_price)     # float — needs a decimal',
                'quantity = ___(raw_quantity)  # int   — whole number',
                'discount = ___(raw_discount)  # float — ratio between 0 and 1',
                '',
                '# Compute total after discount',
                'subtotal = price * quantity',
                'total    = subtotal * (1 - discount)',
                '',
                'print(f"Price: ${price:.2f}, Qty: {quantity}")',
                'print(f"Subtotal: ${subtotal:.2f}")',
                'print(f"After {int(discount*100)}% discount: ${total:.2f}")',
              ].join('\n'),
              code: '# Paste the starter code and replace each ___ with the correct constructor.\n\n',
              output: '', status: 'idle', figureJson: null,
              testCode: [
                'assert "price" in dir() and isinstance(price, float), \\',
                '    f"price must be float, got {type(price).__name__}"',
                'assert "quantity" in dir() and isinstance(quantity, int), \\',
                '    f"quantity must be int, got {type(quantity).__name__}"',
                'assert "discount" in dir() and isinstance(discount, float), \\',
                '    f"discount must be float, got {type(discount).__name__}"',
                'assert abs(price - 19.99) < 1e-9,    f"price should be 19.99, got {price}"',
                'assert quantity == 12,                f"quantity should be 12, got {quantity}"',
                'assert abs(discount - 0.15) < 1e-9,  f"discount should be 0.15, got {discount}"',
                'expected_total = 19.99 * 12 * (1 - 0.15)',
                'assert abs(total - expected_total) < 0.01, \\',
                '    f"total should be ≈{expected_total:.2f}, got {total:.2f}"',
                '"SUCCESS: Correct types and correct total!"',
              ].join('\n'),
              hint: [
                'price    = float(raw_price)',
                'quantity = int(raw_quantity)',
                'discount = float(raw_discount)',
              ].join('\n'),
            },

            // ── CHALLENGE 6: Write — synthesis ────────────────────────────────
            {
              id: 11,
              challengeType: 'write',
              challengeNumber: 6,
              challengeTitle: 'Synthesis: Student Report',
              difficulty: 'medium',
              prompt:
                'Build a mini student report using all four types.\n\n' +
                'Create variables:\n' +
                '• name (str): a student name\n' +
                '• grade (int): a score 0–100\n' +
                '• gpa (float): derived from grade, e.g. grade / 25\n' +
                '• honours (bool): True if grade >= 85\n\n' +
                'Then print a formatted report:\n' +
                '  Student: [name]\n' +
                '  Grade: [grade]/100, GPA: [gpa to 2dp]\n' +
                '  Honours: [honours]',
              code: '# Create all four variables and print the formatted report.\n\n',
              output: '', status: 'idle', figureJson: null,
              testCode: [
                'assert "name" in dir()    and isinstance(name, str)   and len(name) > 0, "name must be a non-empty str"',
                'assert "grade" in dir()   and isinstance(grade, int)  and 0 <= grade <= 100, "grade must be int 0-100"',
                'assert "gpa" in dir()     and isinstance(gpa, float),  "gpa must be a float"',
                'assert "honours" in dir() and isinstance(honours, bool), "honours must be bool"',
                'assert honours == (grade >= 85), \\',
                '    f"honours should be {grade >= 85} for grade={grade}, got {honours}"',
                '"SUCCESS: All variables correct — great report!"',
              ].join('\n'),
              hint: [
                'name    = "Ada Lovelace"',
                'grade   = 91',
                'gpa     = grade / 25',
                'honours = grade >= 85',
                'print(f"Student: {name}")',
                'print(f"Grade: {grade}/100, GPA: {gpa:.2f}")',
                'print(f"Honours: {honours}")',
              ].join('\n'),
            },
          ],
        },
      },
    ],
  },

  math: { prose: [], callouts: [], visualizations: [] },

  rigor: {
    prose: [
      '**Floating-point precision:** floats are not exact. ' +
      '0.1 + 0.2 in Python gives 0.30000000000000004, not 0.3. ' +
      'This is not a Python bug — it is a consequence of representing decimals in binary. ' +
      'For financial calculations use the decimal module. For comparisons use abs(a - b) < epsilon.',

      '**Type coercion rules:** Python almost never coerces types silently. ' +
      'Adding an int and a float gives a float. ' +
      'Adding a str and an int raises a TypeError. ' +
      'You must convert explicitly.',

      '**Truthiness vs equality:** every Python value has a truth value when used in a boolean context. ' +
      'Empty containers ([], {}, "") and zero values (0, 0.0) are falsy. ' +
      'Everything else is truthy. ' +
      'Do not write if x == True: — write if x:',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'isinstance(value, type) vs type(value) == type',
        body: 'isinstance(x, int) is preferred over type(x) == int because isinstance respects inheritance. ' +
              'bool is a subclass of int, so isinstance(True, int) returns True — which is correct. ' +
              'Use isinstance() for type checking in your own code.',
      },
    ],
    visualizations: [],
  },

  examples: [],
  challenges: [],
  semantics: { core: [] },
  spiral: {
    recoveryPoints: [
      'If you see TypeError: can only concatenate str (not "int") to str, convert the int first with str(n).',
      'If you see ValueError: invalid literal for int(), the string is not a valid integer.',
    ],
    futureLinks: [
      'In Chapter 0.3 (Control Flow), booleans drive if/else branching.',
      'In Chapter 0.5 (Data Structures), strings, ints, and floats become elements of lists and dicts.',
      'In Phase 2, NumPy arrays replace Python floats for numerical computing.',
    ],
  },
  assessment: {
    questions: [
      {
        id: 'q1',
        text: 'What does 7 // 2 evaluate to?',
        options: ['3.5', '3', '4', '1'],
        correct: 1,
      },
      {
        id: 'q2',
        text: 'Which of these is a bool?',
        options: ['42', '"True"', 'True', '1'],
        correct: 2,
      },
      {
        id: 'q3',
        text: 'What does int("3.7") do?',
        options: ['Returns 3', 'Returns 4', 'Raises a ValueError', 'Returns 3.7'],
        correct: 2,
      },
    ],
  },
  mentalModel: [
    'Every value has a type: int, float, str, or bool are the four fundamentals.',
    'Python infers types — you assign values, not types.',
    'Use int(), float(), str(), bool() to convert explicitly.',
    'Floats have limited precision — use comparisons with tolerance, not ==.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
}

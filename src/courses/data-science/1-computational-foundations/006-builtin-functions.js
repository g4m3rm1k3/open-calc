export default {
  id:'a-06', slug:'builtin-functions', track:'A', order:6,
  title:'Built-in Functions', subtitle:'The First Tools',
  tags:['functions','abs','len','round','print','pure','side-effects'],
  prereqs:['a-04','a-05'], unlocks:['a-07','a-08'],
  hook:{
    question:'What is a function, and why does print() return None?',
    realWorldContext:'Functions are the atomic unit of computation. Every program is functions calling functions. Understanding the difference between a function that RETURNS a value (pure) and one that DOES something (side effect) prevents a whole class of subtle bugs.',
  },
  intuition:{
    prose:[
      'A **function** takes inputs (arguments) and produces an output (return value). `abs(-5)` takes -5 and returns 5. The name is the machine. The parentheses are the on-switch.',
      '**Pure functions** return a value and change nothing. `abs()`, `len()`, `round()`, `min()`, `max()` are pure — you can use their return value in any expression.',
      '`print()` is a **side effect** function — it writes to the screen and returns `None`. If you write `x = print("hi")`, x will be None, not "hi". This surprises nearly every beginner.',
    ],
    callouts:[
      {type:'important',title:'Pure vs Side Effect',body:`Pure function: returns a useful value, changes nothing
  abs(-5) → 5
  len("abc") → 3

Side effect: changes something (screen, file, network), returns None
  print("hi") → None (but shows "hi" on screen)

Never nest print() inside another function expecting a value.`},
    ],
    visualizations:[{
      id:'PythonNotebook', title:'Built-in Functions',
      props:{initialCells:[
        {id:1,cellTitle:'Stage 1 — Pure Functions',
          prose:'These functions return useful values. Their results can be used in expressions, assigned to variables, passed to other functions.',
          instructions:'Run the cell. Each function call produces a value you can see and use.',
          code:`print(abs(-42))         # 42
print(round(3.7))        # 4
print(round(3.1415, 2))  # 3.14 (2 decimal places)
print(len("hello"))      # 5
print(min(3, 1, 4, 1))   # 1
print(max(3, 1, 4, 1))   # 4`},
        {id:2,cellTitle:'Stage 2 — print() Returns None',
          prose:'print() is a side-effect function. Its purpose is showing text on screen. Its return value is None. If you try to use print() as if it returns the printed value, you will get None.',
          instructions:'Run the cell. x is None — not "hi". This surprises almost everyone the first time.',
          code:`x = print("hi")  # prints "hi", x gets None
print(x)         # None
print(type(x))   # <class 'NoneType'>`},
        {id:3,cellTitle:'Stage 3 — Useful Built-ins',
          prose:'Python ships with many built-in functions. These are the most important ones for early data work.',
          instructions:'Run the cell. Note: sum() expects an iterable (like a list), not individual arguments.',
          code:`nums = [3, 1, 4, 1, 5, 9, 2, 6]
print(sum(nums))       # 31
print(min(nums))       # 1
print(max(nums))       # 9
print(len(nums))       # 8
print(sorted(nums))    # [1,1,2,3,4,5,6,9]
print(sum(nums)/len(nums))  # average: 3.875`},
        {id:4,cellTitle:'Stage 4 — The int/float/str/bool Are Also Functions',
          prose:'The type names you learned in A.02 are also callable functions. They convert values between types.',
          instructions:'Run the cell. These are the same conversions from A.02, just seen now as function calls.',
          code:`print(int(3.9))    # 3
print(float(7))    # 7.0
print(str(42))     # "42"
print(bool(0))     # False
print(bool(-5))    # True (any nonzero is truthy)`},
        {id:5,cellTitle:'Stage 5 — Help System',
          prose:'Every built-in function has documentation you can access instantly from the notebook.',
          instructions:'Run the cell. Read the help output for round(). Then run help(abs) and help(len).',
          code:`help(round)`},
        {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — Chained Built-ins',
          difficulty:'easy',
          prompt:'Using only built-in functions (no arithmetic operators), compute: the absolute value of the minimum of the list `scores`. Store the result in `result`. The list is: [-5, 3, -8, 2, -1].',
          instructions:`1. Use min() to find the minimum.
2. Wrap it in abs() to get the absolute value.
3. One line of code.`,
          code:`scores = [-5, 3, -8, 2, -1]
result = `,
          testCode:`
if 'result' not in locals(): raise ValueError("Missing: result")
if result != 8: raise ValueError(f"Expected 8 (abs(min([-5,3,-8,2,-1])) = abs(-8) = 8), got {result}")
res = "SUCCESS: abs(min(scores)) = 8. Inner evaluates first: min gives -8, abs gives 8."
res
`,
          hint:'result = abs(min(scores))'},
        {id:12,challengeType:'write',challengeNumber:2,challengeTitle:'Challenge 2 — The None Trap',
          difficulty:'medium',
          prompt:'The code below has a bug: it tries to compute a total using print(), which returns None. Rewrite it so `doubled` contains the actual doubled value, not None.',
          instructions:'1. Run the broken code to see the TypeError. 2. Replace print() with the correct expression. 3. doubled should be 84.',
          code:`value = 42
# Bug: print returns None, not 42
doubled = print(value) * 2
print(doubled)`,
          testCode:`
if 'doubled' not in locals(): raise ValueError("Missing: doubled")
if doubled != 84: raise ValueError(f"doubled should be 84 (42 * 2). Got {doubled}. Remove the print() wrapper — you want the value itself.")
res = "SUCCESS: doubled = 84. Remove print() when you need the VALUE, not the display."
res
`,
          hint:'doubled = value * 2'},
      ]}
    }],
  },
  mentalModel:[
    'Functions take arguments and return a value.',
    'Pure functions: return useful values, change nothing.',
    'print() is a side effect: shows text, returns None.',
    'Never use print() where you need the value.',
    'Built-in functions are the standard toolkit: abs, len, round, min, max, sum, sorted.',
  ],
}
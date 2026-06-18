export default {
  id:'a-10',slug:'conditional-execution',track:'A',order:10,
  title:'Conditional Execution',subtitle:'Branching Paths',
  tags:['if','else','elif','branching','ternary'],
  prereqs:['a-09'],unlocks:['a-11','a-12'],
  hook:{
    question:'How does a program take different actions based on different conditions?',
    realWorldContext:'Every decision in software is an if statement. Data pipelines branch on data quality. Models branch on input ranges. The difference between a correct and incorrect program is often a single condition written wrong.',
  },
  intuition:{
    prose:[
      '`if` evaluates a boolean expression. If True, the indented block runs. If False, it is skipped. `else` provides the fallback. `elif` adds additional conditions tried in order — the first True one wins, the rest are skipped.',
      '**Indentation is not style — it is syntax.** Python uses indentation to define blocks. 4 spaces is standard. Inconsistent indentation causes IndentationError. Every line in a block must have the same indentation.',
      'The **ternary expression** `value_if_true if condition else value_if_false` is a one-line conditional that produces a value. Use it for simple cases. For anything complex, use if/else.',
    ],
    callouts:[
      {type:'important',title:'elif is First-Match',body:`if condition1:
    # runs if condition1 is True
elif condition2:
    # runs if condition1 False AND condition2 True
elif condition3:
    # runs if both above False AND condition3 True
else:
    # runs if ALL conditions False

Only ONE branch ever runs.`},
      {type:'warning',title:'Indentation is Mandatory',body:`if x > 0:
print("positive")  # IndentationError!

if x > 0:
    print("positive")  # correct — 4 spaces`},
    ],
    visualizations:[{
      id:'PythonNotebook',title:'Conditional Execution',
      props:{initialCells:[
        {id:1,cellTitle:'Stage 1 — Basic if/else',
          prose:'The simplest conditional: two paths, exactly one runs.',
          instructions:'Run the cell. Then change temperature to 15 and run again.',
          code:`temperature = 25
if temperature > 20:
    print("warm day")
else:
    print("cold day")`,
          output:'',status:'idle'},
        {id:2,cellTitle:'Stage 2 — elif Chain',
          prose:'Multiple conditions checked in order. First True wins.',
          instructions:'Run the cell with score=85. Then change score to 55 and observe which branch runs.',
          code:`score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"
print(f"Score {score} = grade {grade}")`,
          output:'',status:'idle'},
        {id:3,cellTitle:'Stage 3 — Nested Conditionals',
          prose:'Conditionals can be nested. Each nested level adds more indentation.',
          instructions:'Run the cell. Nested ifs are valid but get hard to read quickly — prefer elif when possible.',
          code:`x = 15
if x > 0:
    if x > 10:
        print("large positive")
    else:
        print("small positive")
else:
    print("non-positive")`,
          output:'',status:'idle'},
        {id:4,cellTitle:'Stage 4 — Conditional with Functions',
          prose:'Conditions often call functions. The function runs and its return value is evaluated as a bool.',
          instructions:'Run the cell. is_even() returns a bool, used directly as the condition.',
          code:`def is_even(n):
    return n % 2 == 0

numbers = [1, 2, 3, 4, 5, 6]
for n in numbers:
    if is_even(n):
        print(f"{n} is even")`,
          output:'',status:'idle'},
        {id:5,cellTitle:'Stage 5 — Ternary Expression',
          prose:'For simple two-value cases, the ternary expression is cleaner than if/else.',
          instructions:'Run the cell. Both forms produce identical results — ternary is preferred when one line is clear.',
          code:`x = 7

# Verbose form
if x % 2 == 0:
    label = "even"
else:
    label = "odd"
print(label)

# Ternary form — same thing
label = "even" if x % 2 == 0 else "odd"
print(label)`,
          output:'',status:'idle'},
        {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — BMI Classifier',
          difficulty:'easy',
          prompt:'Write classify_bmi(bmi) returning: "Underweight" (<18.5), "Normal" (18.5-24.9), "Overweight" (25-29.9), "Obese" (>=30).',
          instructions:'Use an elif chain. Return a string, do not print.',
          code:`def classify_bmi(bmi):
    # Your code here
    pass
`,
          output:'',status:'idle',
          testCode:`
cases=[(17.5,"Underweight"),(22,"Normal"),(27,"Overweight"),(32,"Obese"),(18.5,"Normal"),(25,"Overweight")]
for bmi,expected in cases:
    got=classify_bmi(bmi)
    if got!=expected: raise ValueError(f"classify_bmi({bmi}) should be {expected!r}, got {got!r}")
res="SUCCESS: All BMI classifications correct."
res
`,hint:`def classify_bmi(bmi):
    if bmi < 18.5: return "Underweight"
    elif bmi < 25: return "Normal"
    elif bmi < 30: return "Overweight"
    else: return "Obese"`},
        {id:12,challengeType:'write',challengeNumber:2,challengeTitle:'Challenge 2 — Tax Bracket',
          difficulty:'hard',
          prompt:'Compute US federal income tax using two brackets: first $10,000 taxed at 10%, income above $10,000 taxed at 20%. Write compute_tax(income) returning the total tax owed.',
          instructions:`1. If income <= 10000: tax = income * 0.10
2. Else: tax = 10000 * 0.10 + (income - 10000) * 0.20
3. Return the tax amount.`,
          code:`def compute_tax(income):
    # Your code here
    pass
`,
          output:'',status:'idle',
          testCode:`
cases=[(5000,500),(10000,1000),(15000,2000),(0,0),(20000,3000)]
for income,expected in cases:
    got=round(compute_tax(income),2)
    if abs(got-expected)>0.01: raise ValueError(f"compute_tax({income}) should be {expected}, got {got}")
res="SUCCESS: All tax brackets correct. This pattern (progressive brackets) is fundamental to financial computing."
res
`,hint:`def compute_tax(income):
    if income <= 10000:
        return income * 0.10
    else:
        return 10000 * 0.10 + (income - 10000) * 0.20`},
      ]}
    }],
  },
  mentalModel:[
    'if evaluates a condition. True: run the block. False: skip it.',
    'elif is first-match: conditions tested in order, only one branch runs.',
    'Indentation defines blocks in Python — it is not optional.',
    'Ternary expression: value_if_true if condition else value_if_false.',
    'Conditions can call functions — the return value is evaluated as a bool.',
  ],
}
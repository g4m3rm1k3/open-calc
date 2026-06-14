export default {
  id:'a-09',slug:'boolean-logic',track:'A',order:9,
  title:'Boolean Logic and Comparisons',subtitle:'The Decision Layer',
  tags:['bool','comparisons','and','or','not','truthiness','short-circuit'],
  prereqs:['a-04','a-08'],unlocks:['a-10','a-11'],
  hook:{
    question:'How does a program compare values and combine conditions?',
    realWorldContext:'Every filter in a data pipeline, every validation rule, every conditional in any program reduces to boolean expressions. Data scientists who cannot read complex boolean conditions will misread filter logic and silently select the wrong rows.',
  },
  intuition:{
    prose:[
      'Comparison operators produce booleans: `<`, `>`, `<=`, `>=`, `==`, `!=`. Note: `==` is equality testing (two equals signs). `=` is assignment (one equals sign). Confusing them is one of the most common Python bugs.',
      '`and` requires BOTH conditions true. `or` requires AT LEAST ONE true. `not` inverts. Python evaluates left to right and **short-circuits**: `False and X` never evaluates X (already false). `True or X` never evaluates X (already true).',
      '**Truthiness**: Every value in Python has a boolean interpretation. `0`, `0.0`, `""`, `[]`, `{}`, `None` are all falsy. Everything else is truthy. This is why `if x:` works even when x is not a bool.',
    ],
    callouts:[
      {type:'important',title:'== vs =',body:`x = 5    # assignment — binds x to 5
x == 5   # comparison — asks "is x equal to 5?"

== returns True or False
= changes state

Confusing these causes bugs that look like logic errors.`},
      {type:'important',title:'Falsy Values',body:`bool(0) == False
bool(0.0) == False
bool("") == False
bool([]) == False
bool({}) == False
bool(None) == False

Everything else is truthy.`},
    ],
    visualizations:[{
      id:'PythonNotebook',title:'Boolean Logic',
      props:{initialCells:[
        {id:1,cellTitle:'Stage 1 — Comparison Operators',
          prose:'These operators compare two values and produce True or False.',
          instructions:'Run. Then predict each result before running.',
          code:`print(3 > 2)    # True
print(3 < 2)    # False
print(3 == 3)   # True (equality)
print(3 != 4)   # True (not equal)
print(3 >= 3)   # True
print("a" < "b") # True (alphabetical)`,
          output:'',status:'idle'},
        {id:2,cellTitle:'Stage 2 — and, or, not',
          prose:'Boolean operators combine conditions. Truth table: and requires both, or requires either, not inverts.',
          instructions:'Predict each result. Pay attention to and vs or.',
          code:`print(True and True)   # True
print(True and False)  # False
print(False or True)   # True
print(False or False)  # False
print(not True)        # False
print(not False)       # True`,
          output:'',status:'idle'},
        {id:3,cellTitle:'Stage 3 — Compound Conditions',
          prose:'Real conditions combine comparisons with boolean operators.',
          instructions:'Trace each condition manually. Is x in the range [5,10]?',
          code:`x = 7
print(x > 5 and x < 10)  # True: x is between 5 and 10
print(x < 5 or x > 10)   # False: x is not outside range
print(5 <= x <= 10)       # True: Python chaining (shorthand)`,
          output:'',status:'idle'},
        {id:4,cellTitle:'Stage 4 — Short-Circuit Evaluation',
          prose:'Python stops evaluating as soon as the result is determined. This is not an optimization — it is a feature you can rely on.',
          instructions:'Run the cell. The expensive_fn is never called in both short-circuit cases.',
          code:`def expensive_fn():
    print("   (expensive called)")
    return True

print(False and expensive_fn())  # False, never calls fn
print(True or expensive_fn())    # True, never calls fn
print(True and expensive_fn())   # must call fn
print(False or expensive_fn())   # must call fn`,
          output:'',status:'idle'},
        {id:5,cellTitle:'Stage 5 — Truthiness',
          prose:'Every value has a boolean interpretation. Use this to write cleaner conditions.',
          instructions:'Run the cell. An empty list, empty string, and 0 are all falsy.',
          code:`print(bool(0))
print(bool(""))
print(bool([]))
print(bool(42))
print(bool("x"))
print(bool([1,2,3]))

# This is why these idioms work:
name = ""
if not name:
    print("Name is empty")`,
          output:'',status:'idle'},
        {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — Range Check',
          difficulty:'easy',
          prompt:'Write is_valid_age(age) returning True if age is a whole number between 0 and 120 inclusive.',
          instructions:`1. Check age >= 0 and age <= 120.
2. Also check it is an integer type.
3. One return statement using and.`,
          code:`def is_valid_age(age):
    # Your code here
    pass
`,
          output:'',status:'idle',
          testCode:`
cases=[(25,True),(0,True),(120,True),(-1,False),(121,False),(25.5,False),(None,False)]
for age,expected in cases:
    try:
        got=is_valid_age(age)
        if got!=expected: raise ValueError(f"is_valid_age({age!r}) should be {expected}, got {got}")
    except TypeError:
        if expected: raise ValueError(f"is_valid_age({age!r}) crashed but should return {expected}")
res="SUCCESS: All age validations correct including edge cases."
res
`,hint:`def is_valid_age(age):
    return isinstance(age, int) and 0 <= age <= 120`},
        {id:12,challengeType:'write',challengeNumber:2,challengeTitle:'Challenge 2 — Password Validator',
          difficulty:'medium',
          prompt:'Write is_strong_password(pwd) returning True if: length >= 8, contains at least one digit, contains at least one uppercase letter. Use any() and a generator expression.',
          instructions:`1. len(pwd) >= 8
2. any(c.isdigit() for c in pwd)
3. any(c.isupper() for c in pwd)
4. All three must be true.`,
          code:`def is_strong_password(pwd):
    # Your code here
    pass
`,
          output:'',status:'idle',
          testCode:`
cases=[("Hello123",True),("hello123",False),("HELLO123",False),("Hello1",False),("HelloWorld1!",True),("",False)]
for pwd,expected in cases:
    got=is_strong_password(pwd)
    if got!=expected: raise ValueError(f"is_strong_password({pwd!r}) should be {expected}, got {got}")
res="SUCCESS: All password rules enforced. any() with generator is a Pythonic pattern."
res
`,hint:`def is_strong_password(pwd):
    return len(pwd)>=8 and any(c.isdigit() for c in pwd) and any(c.isupper() for c in pwd)`},
      ]}
    }],
  },
  mentalModel:[
    '== tests equality. = assigns. Never confuse them.',
    'and requires both true. or requires at least one true. not inverts.',
    'Short-circuit: False and X never evaluates X. True or X never evaluates X.',
    'Falsy values: 0, 0.0, "", [], {}, None. Everything else is truthy.',
    'Python allows chained comparisons: 5 <= x <= 10 works as expected.',
  ],
}
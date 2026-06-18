export default {
  id: 'a-07', slug: 'function-composition', track: 'A', order: 7,
  title: 'Function Composition', subtitle: 'The Matryoshka Model',
  tags: ['composition', 'nesting', 'execution-order', 'substitution', 'none-propagation'],
  prereqs: ['a-06'], unlocks: ['a-08', 'a-09'],
  hook: {
    question: 'How do you chain computations without naming every intermediate result?',
    realWorldContext: 'In a factory, the output of one machine is the input of the next. In Python, this is composition. Understanding evaluation order — inside out — is the key to reading any complex expression correctly.',
  },
  intuition: {
    prose: [
      '**Composition** means using the return value of one function call as the argument to another: `abs(round(-10.5))`. Python evaluates this inside-out: first `round(-10.5)` → -10, then `abs(-10)` → 10.',
      'The **inside-out rule** is not optional — it is how Python works. The innermost function must return before the outer function can receive its argument. You can always break composition into steps to verify.',
      'The **None trap** in composition: if any function in a chain returns None (like print()), every outer function will receive None. `abs(print(-5))` prints -5 but then crashes — you cannot take abs() of None.',
    ],
    callouts: [
      {
        type: 'important', title: 'The Inside-Out Spiral', body: `print(len("hello"))

Step 1: len("hello") → 5
Step 2: Substitute: print(5)
Step 3: print(5) → displays 5, returns None

The code becomes simpler from the inside out.`},
      {
          type: 'warning', title: 'The Print Ghost', body: `print(print("hi")) prints:
hi
None

The inner print("hi") displays "hi" and returns None.
The outer print(None) displays None.
Never nest print() expecting it to pass a value outward.`},
    ],
    visualizations: [{
      id: 'PythonNotebook', title: 'The Composition Lab',
      props: {
        initialCells: [
          {
            id: 1, cellTitle: 'Stage 1 — Basic Nesting',
            prose: 'abs(len("Python")) — two functions, inside-out.',
            instructions: 'Predict: 1. len("Python") → 6. 2. abs(6) → 6. Run to verify.',
            code: `res = abs(len("Python"))
res`,output:'',status:'idle'},
        {
              id: 2, cellTitle: 'Stage 2 — Three Levels Deep',
              prose: 'pow(abs(round(-3.8)), 2) — three machines chained.',
              instructions: 'Trace: 1. round(-3.8)→-4. 2. abs(-4)→4. 3. pow(4,2)→16.',
              code: `final = pow(abs(round(-3.8)), 2)
final`,output:'',status:'idle'},
        {
                id: 3, cellTitle: 'Stage 3 — The Double-Print Paradox',
                prose: 'What happens when you nest a side-effect function?',
                instructions: 'Run. Notice "hi" appears first (inner print), then "None" (outer print printing the return value of inner print).',
                code: 'print(print("hi"))', output: '', status: 'idle'
              },
        {
            id: 4, cellTitle: 'Stage 4 — String to Math Bridge',
            prose: 'pow(len("logic"), 2) bridges a string operation into arithmetic.',
            instructions: 'Trace: len("logic")→5. pow(5,2)→25.',
            code: `val = pow(len("logic"), 2)
val`,output:'',status:'idle'},
        {
              id: 5, cellTitle: 'Stage 5 — Type Inspection',
              prose: 'type(len("metadata")) — inspect the type of a computed value.',
              instructions: 'The inner len() returns int. So type() finds <class int>.',
              code: `info = type(len("metadata"))
info`,output:'',status:'idle'},
        {
                id: 6, cellTitle: 'Stage 6 — Clamping with Composition',
                prose: 'max(0, min(score, 100)) — a pattern for keeping values in a range.',
                instructions: 'Trace inner min() first: min(150,100)=100. Then max(0,100)=100.',
                code: `score = 150
result = max(0, min(score, 100))
result`,output:'',status:'idle'},
        {
                  id: 7, cellTitle: 'Stage 7 — Multi-Argument Nesting',
                  prose: 'Both arguments of max() can be function calls.',
                  instructions: 'Both len() calls resolve before max() runs.',
                  code: `greatest = max(len("A"), len("BBB"))
greatest`,output:'',status:'idle'},
        {
                      id: 11, challengeType: 'write', challengeNumber: 1, challengeTitle: 'Challenge 1 — The String Cube',
                      difficulty: 'easy',
                      prompt: `Use pow() and len() to store the cube (power of 3) of the length of "Python" in \`cube\`.`,
                      instructions: '1. Measure length with len(). 2. Cube with pow(). 3. Save to cube.',
                      code: `word = "Python"
cube = `,output:'',status:'idle',
          testCode:`
if 'cube' not in locals(): raise ValueError("Missing: cube")
if cube == 216: res = "SUCCESS: len('Python')=6, 6^3=216."
else: raise ValueError(f"Got {cube}, expected 216.")
res
`, hint: 'cube = pow(len(word), 3)'
                },
        {
            id: 12, challengeType: 'write', challengeNumber: 2, challengeTitle: 'Challenge 2 — Safe Rounding',
            difficulty: 'medium',
            prompt: 'Round -15.8 and ensure result never goes below 0. Store in safe_result.',
            instructions: '1. round(-15.8)→-16. 2. max(0,-16)→0.',
            code: `val = -15.8
safe_result = `,output:'',status:'idle',
          testCode:`
if 'safe_result' not in locals(): raise ValueError("Missing: safe_result")
if safe_result == 0: res = "SUCCESS: max(0, round(-15.8)) = max(0,-16) = 0."
else: raise ValueError(f"Got {safe_result}, expected 0.")
res
`, hint: 'safe_result = max(0, round(val))'},
        {
      id: 13, challengeType: 'write', challengeNumber: 3, challengeTitle: 'Challenge 3 — Master Trace',
      difficulty: 'hard',
      prompt: `PREDICT the value of master BEFORE typing: abs(round(-5.5)) + pow(len("OK"), 2). Trace by hand first.`,
      instructions: '1. abs(round(-5.5))→abs(-6)→6. 2. pow(len("OK"),2)→pow(2,2)→4. 3. 6+4=10.',
      code: `a = -5.5
master = `,output:'',status:'idle',
          testCode:`
if 'master' not in locals(): raise ValueError("Missing: master")
if master == 10: res = "SUCCESS: Master trace correct! abs(round(-5.5)) + pow(len('OK'),2) = 6+4 = 10."
else: raise ValueError(f"Expected 10, got {master}.")
res
`, hint: 'master = abs(round(a)) + pow(len("OK"), 2)'},
      ]
}
    }],
  },
  mentalModels: [
    'Composition: the return value of an inner function becomes the argument of the outer.',
    'Inside-out evaluation: innermost runs first, result substituted, outer runs.',
    'You can always break composition into steps to debug or verify.',
    'print() returns None — never nest it expecting it to pass a value outward.',
    'Both arguments of a function can themselves be function calls.',
  ],
}
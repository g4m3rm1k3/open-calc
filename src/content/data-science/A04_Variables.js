export default {
  id: 'a-04', slug: 'variables-as-bindings', track: 'A', order: 4,
  title: 'Variables as Bindings', subtitle: 'Names, Values, and Memory',
  tags: ['variables', 'assignment', 'binding', 'naming', 'memory'],
  prereqs: ['a-02','a-03'], unlocks: ['a-05','a-06'],
  hook: {
    question: 'What does x = 5 actually do?',
    realWorldContext: 'Assignment is not mathematical equality. x = x + 1 is not a contradiction — it is an instruction. This distinction trips up almost every beginner and causes bugs that take hours to find because the code looks correct.',
  },
  intuition: {
    prose: [
      'A **variable** is a name bound to a value in memory. `x = 5` means: evaluate the right side (5), then bind the name x to that value. The name x now refers to 5 whenever you use it.',
      '**Assignment is not equality.** In math, x = x + 1 has no solution. In Python, it is an instruction: look up x (say, 5), compute x + 1 (6), bind x to 6. The old binding (5) is gone.',
      'Variable names are case-sensitive (`x` and `X` are different). By convention, use lowercase with underscores for variables (`student_count`), not camelCase or single letters (except for throwaway loop variables).',
    ],
    callouts: [
      { type: 'important', title: 'The Assignment Model', body: '1. Evaluate the RIGHT side completely\n2. Bind the name on the LEFT to that result\n3. The name now refers to the new value\n4. Any previous binding to that name is gone' },
      { type: 'warning', title: 'Names Are Not Values', body: 'The name x is not 5. x points to 5. Two names can point to the same value. Changing one name does not change what the other name points to (for simple types).' },
    ],
    visualizations: [{
      id: 'PythonNotebook',
      title: 'Variables and Binding',
      props: { initialCells: [
        { id:1, cellTitle:'Stage 1 — Basic Binding',
          prose:'When you assign x = 5, Python creates a binding: the name "x" now refers to the value 5. Using x anywhere evaluates to 5.',
          instructions:'Run the cell. Notice that x on its own on the last line evaluates to 5 — it looks up what x is bound to.',
          code:'x = 5\ny = 10\nz = x + y\nprint(x, y, z)\nz',
          output:'', status:'idle' },
        { id:2, cellTitle:'Stage 2 — Reassignment',
          prose:'A name can be rebound to a new value at any time. The old value is not "updated" — the name is repointed. Python\'s garbage collector reclaims unreferenced values.',
          instructions:'Run the cell. Watch x change: 5 → 10 → 100 → 99. Each assignment completely replaces the previous binding.',
          code:'x = 5\nprint(x)    # 5\nx = 10\nprint(x)    # 10\nx = x * 10\nprint(x)    # 100\nx = x - 1\nprint(x)    # 99',
          output:'', status:'idle' },
        { id:3, cellTitle:'Stage 3 — Assignment is Evaluated Right First',
          prose:'Python always evaluates the ENTIRE right side before binding. This is why x = x + 1 works — Python reads the old x, computes x+1, then writes the new x.',
          instructions:'Trace this by hand: what is count at each step? Run to verify.',
          code:'count = 0\ncount = count + 1\ncount = count + 1\ncount = count * 2\nprint(count)  # what is this?',
          output:'', status:'idle' },
        { id:4, cellTitle:'Stage 4 — Multiple Assignment',
          prose:'Python supports assigning multiple names at once, and swapping values elegantly using tuple unpacking.',
          instructions:'Run the cell. The swap on lines 5-6 is idiomatic Python — notice it uses no temporary variable.',
          code:'a, b = 3, 7       # assign both at once\nprint(a, b)\na, b = b, a       # swap — Pythonic idiom\nprint(a, b)       # now reversed\nx = y = z = 0     # all three bound to 0\nprint(x, y, z)',
          output:'', status:'idle' },
        { id:5, cellTitle:'Stage 5 — Augmented Assignment',
          prose:'Python provides shorthand for common patterns: x += 1 means x = x + 1. These are called augmented assignment operators.',
          instructions:'Run the cell. These are not new operators — they are abbreviations for the pattern variable = variable op value.',
          code:'score = 100\nscore += 10    # score = score + 10\nprint(score)   # 110\nscore -= 5     # score = score - 5\nprint(score)   # 105\nscore *= 2     # score = score * 2\nprint(score)   # 210\nscore //= 3    # score = score // 3\nprint(score)   # 70',
          output:'', status:'idle' },
        { id:6, cellTitle:'Stage 6 — Naming Conventions',
          prose:'Bad names make code unmaintainable. Python convention: lowercase_with_underscores for variables. Names should say WHAT, not HOW. `student_count` beats `x`. `price_per_unit` beats `ppu`.',
          instructions:'This cell shows the same computation with bad and good naming. Run both — they produce identical results. Which one would you rather debug at 2am?',
          code:'# Bad naming\nx = 50\ny = 8.5\nz = x * y\nprint(z)\n\n# Good naming\nhours_worked = 50\nhourly_rate = 8.5\nweekly_pay = hours_worked * hourly_rate\nprint(weekly_pay)',
          output:'', status:'idle' },
        { id:11, challengeType:'write', challengeNumber:1, challengeTitle:'Challenge 1 — State Tracer',
          difficulty:'easy',
          prompt:'Before running this code, trace it by hand and predict the final value of result. Then run it and check. Finally, write a single additional line that sets result to half of whatever it currently is (use augmented assignment).',
          instructions:'1. Trace by hand: what is result after each line?\n2. Add one line using /= to halve result.\n3. The test checks your final result value.',
          code:'result = 10\nresult = result * 3\nresult = result - 5\nresult += 10\nresult //= 2\n# Add your line here\n',
          output:'', status:'idle',
          testCode:`
# After the given lines: 10*3=30, 30-5=25, 25+10=35, 35//2=17
# After halving: 17/2 = 8.5 (true division) or 17//2 = 8 (floor division)
if 'result' not in locals(): raise ValueError("Missing: result")
if result not in (8, 8.5):
    raise ValueError(f"Expected 8 or 8.5 (half of 17), got {result}. Trace each line again.")
res = f"SUCCESS: result = {result}. Traced correctly. The intermediate values were 10→30→25→35→17→{result}."
res
`,
          hint:'result /= 2  (or result //= 2 for integer division)' },
        { id:12, challengeType:'write', challengeNumber:2, challengeTitle:'Challenge 2 — Compound Interest',
          difficulty:'medium',
          prompt:'Compute compound interest. Start with `principal = 1000`. Apply 5% interest (multiply by 1.05) for exactly 3 years using reassignment — do not use ** or any loop. Store the final amount in `final_amount`.',
          instructions:'1. Apply the 1.05 multiplier once per year.\n2. Use augmented assignment each time.\n3. Round the final result to 2 decimal places with round().',
          code:'principal = 1000\n# Apply interest 3 times\n\n\n\nfinal_amount = round(principal, 2)\n',
          output:'', status:'idle',
          testCode:`
if 'final_amount' not in locals(): raise ValueError("Missing: final_amount")
expected = round(1000 * 1.05 * 1.05 * 1.05, 2)
if abs(final_amount - expected) > 0.01:
    raise ValueError(f"Expected {expected}, got {final_amount}. Did you multiply by 1.05 exactly 3 times?")
res = f"SUCCESS: 1000 at 5% for 3 years = {final_amount}. Each *= 1.05 was one year of growth."
res
`,
          hint:'principal *= 1.05  (repeat 3 times)\nfinal_amount = round(principal, 2)' },
      ]}
    }],
  },
  mentalModel: [
    'Assignment evaluates the right side completely, then binds the name on the left.',
    'x = x + 1 is not a contradiction — it reads old x, computes, writes new x.',
    'Multiple assignment and swap work because the right side is fully evaluated first.',
    'Augmented assignment (+=, -=, *=) is shorthand, not a new operation.',
    'Name variables by what they represent, not how they are computed.',
  ],
}

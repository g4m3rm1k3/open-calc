export default {
  id:'a-05', slug:'state-and-execution-flow', track:'A', order:5,
  title:'State and Execution Flow', subtitle:'Tracing Memory Over Time',
  tags:['state','execution','tracing','debugging','nameerror'],
  prereqs:['a-04'], unlocks:['a-06','a-10'],
  hook:{
    question:'What is "state" and why does it change?',
    realWorldContext:'A data pipeline that produces wrong results but no errors is usually a state bug — a variable was overwritten at the wrong moment, or read before it was written. Learning to trace state is learning to debug.',
  },
  intuition:{
    prose:[
      '**State** is the complete set of variable bindings at any moment in program execution. Every assignment changes state. Understanding a program means being able to reconstruct state at every line.',
      'A **NameError** occurs when you try to read a variable that has not yet been bound. The name does not exist in state. This always means: the assignment came after the read, or the assignment never happened.',
      'Tracing state means writing down, after each line: every variable name and its current value. If you cannot do this, you cannot debug systematically. It feels slow but it is the fastest way to find bugs.',
    ],
    callouts:[
      {type:'important',title:'State Trace Format',body:'After each line, write:\nname1 = value1\nname2 = value2\n...\nIf a name was not yet assigned, it does not appear.\nIf a name was reassigned, show the new value only.'},
      {type:'warning',title:'NameError Means Wrong Order',body:'If you get NameError: name \'x\' is not defined, it means:\n- x was never assigned, OR\n- x was assigned AFTER this line\nFix: move the assignment before the read.'},
    ],
    visualizations:[{
      id:'PythonNotebook', title:'Tracing State',
      props:{initialCells:[
        {id:1,cellTitle:'Stage 1 — Building State Line by Line',
          prose:'Watch state build up as each line runs. After each assignment, there is one more binding in state.',
          instructions:'Run the cell. Then, in a comment below the code, write the state (all variable values) after each of the 5 lines.',
          code:'a = 10           # State: a=10\nb = 20           # State: a=10, b=20\nc = a + b        # State: a=10, b=20, c=30\na = c - a        # State: ?\nb = a * 2        # State: ?\nprint(a, b, c)',
          output:'', status:'idle'},
        {id:2,cellTitle:'Stage 2 — NameError in Practice',
          prose:'This cell reads a variable before it is bound. Python raises NameError. The fix is always the same: move the assignment before the read.',
          instructions:'Run the cell to see the NameError. Then fix it by reordering the lines so total is computed after x and y are defined.',
          code:'total = x + y    # NameError — x and y not yet bound\nx = 15\ny = 25\nprint(total)',
          output:'', status:'idle'},
        {id:3,cellTitle:'Stage 3 — Overwriting State',
          prose:'When a variable is reassigned, the old value is completely gone. There is no "undo." This is intentional — but it causes bugs when you overwrite a variable you still needed.',
          instructions:'Run the cell. The bug: original is overwritten before it is used in the final calculation. Find and fix the bug.',
          code:'original = 100\nresult = original * 2\noriginal = result + 50  # bug: original is gone!\nfinal = original + result  # this uses the WRONG original\nprint(final)  # should be 100 + 200 = 300, but gets 350',
          output:'', status:'idle'},
        {id:4,cellTitle:'Stage 4 — State in a 10-Line Trace',
          prose:'This is a full state trace exercise. Do NOT run the cell until you have predicted every value.',
          instructions:'Write down the state after each line. Then run and compare.',
          code:'x = 5\ny = x + 3\nx = y * 2\nz = x - y\ny = z + x\nw = y // z\nprint(x, y, z, w)',
          output:'', status:'idle'},
        {id:5,cellTitle:'Stage 5 — Using Intermediate Variables to Preserve State',
          prose:'When you need to use a value both in a computation and later on, save it before overwriting. This is the fix for the Stage 3 bug.',
          instructions:'Run the cell. The intermediate_original variable preserves the value before it is overwritten.',
          code:'original = 100\nintermediate_original = original  # save before overwriting\nresult = original * 2\noriginal = result + 50\nfinal = intermediate_original + result  # uses saved original\nprint(final)  # correctly 300',
          output:'', status:'idle'},
        {id:11,challengeType:'write',challengeNumber:1,challengeTitle:'Challenge 1 — The Swap Bug',
          difficulty:'easy',
          prompt:'The code below tries to swap a and b but does it incorrectly — both end up with the same value. Fix it using a temporary variable.',
          instructions:'1. Run the broken version to see the bug.\n2. Add a temp variable to preserve the overwritten value.\n3. After fixing: a should be 99, b should be 7.',
          code:'a = 7\nb = 99\n# Broken swap:\na = b\nb = a   # too late — a is already 99\nprint(a, b)  # should be 99 7 but gets 99 99\n',
          output:'', status:'idle',
          testCode:`
if a != 99 or b != 7:
    raise ValueError(f"Got a={a}, b={b}. Expected a=99, b=7. Use a temp variable: temp=a; a=b; b=temp")
res = "SUCCESS: Swap works. The pattern: temp=a; a=b; b=temp is the classic swap."
res
`,
          hint:'temp = a\na = b\nb = temp'},
        {id:12,challengeType:'write',challengeNumber:2,challengeTitle:'Challenge 2 — Running Total',
          difficulty:'medium',
          prompt:'Five sales figures come in one at a time. Accumulate them into a running total WITHOUT using a list or sum(). Use only assignment and addition. Store the final total in `total` and the count in `sales_count`.',
          instructions:'1. Initialize total = 0 and sales_count = 0.\n2. Add each sale to total, increment sales_count.\n3. Compute average = total / sales_count.',
          code:'sale1 = 120.50\nsale2 = 89.99\nsale3 = 204.00\nsale4 = 55.25\nsale5 = 178.30\n# Your accumulator here\ntotal = \nsales_count = \naverage = \n',
          output:'', status:'idle',
          testCode:`
if 'total' not in locals(): raise ValueError("Missing: total")
if 'sales_count' not in locals(): raise ValueError("Missing: sales_count")
if 'average' not in locals(): raise ValueError("Missing: average")
expected = 120.50 + 89.99 + 204.00 + 55.25 + 178.30
if abs(total - expected) > 0.01: raise ValueError(f"total should be {expected:.2f}, got {total}")
if sales_count != 5: raise ValueError(f"sales_count should be 5, got {sales_count}")
if abs(average - expected/5) > 0.01: raise ValueError(f"average wrong")
res = f"SUCCESS: total={total:.2f}, average={average:.2f}. The accumulator pattern is fundamental."
res
`,
          hint:'total = 0\nsales_count = 0\ntotal += sale1; sales_count += 1\n(repeat for each sale)\naverage = total / sales_count'},
      ]}
    }],
  },
  mentalModel:[
    'State = all current variable bindings at a point in time.',
    'Every assignment changes exactly one binding.',
    'NameError = reading a variable before it was bound.',
    'Save values in intermediate variables before overwriting them.',
    'Tracing state line by line is the foundation of systematic debugging.',
  ],
}

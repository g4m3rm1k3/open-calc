export default {
  id: 'logic0-001',
  slug: 'boolean-algebra-basics',
  chapter: 'logic0',
  order: 1,
  title: 'Boolean Algebra Basics',
  subtitle: 'The mathematics of true and false — and why every rung in a ladder diagram is a boolean equation.',
  tags: ['boolean algebra', 'AND', 'OR', 'NOT', 'truth tables', 'logic gates', 'ladder logic foundation'],
  aliases: 'boolean logic binary true false 0 1 AND OR NOT gates',
  timeToComplete: 20,
  coreConcept: 'Boolean algebra uses only two values — 0 and 1, false and true — and three fundamental operations: AND (both), OR (either), NOT (opposite). Every PLC rung, every control circuit, and every safety interlock is a boolean equation drawn as a ladder.',
  prerequisites: [],
  nextLesson: 'logic-gates-and-truth-tables',

  hook: {
    question: "A machine should start only when the door is closed AND the E-stop is released AND the operator presses the start button. How do you describe that logic to a computer?",
    realWorldContext: "Every interlock on every machine you've ever worked on is a boolean expression. 'The spindle runs only if the door is closed AND the coolant is on AND no faults are active' — that's boolean AND. 'The alarm sounds if the temperature is too high OR the pressure is too high OR the level sensor trips' — that's boolean OR. 'The output is enabled when the input is NOT in fault' — that's boolean NOT. Before you write a single rung of ladder logic, you need to understand the algebra underneath it. Boole invented this system in 1854 to put logic on a mathematical foundation. In 1938, Claude Shannon realized it was exactly what you needed to design circuits. Today it is the foundation of every digital device ever built.",
  },

  mentalModel: [
    "**Two values, not infinite.** Boolean algebra abandons the number line. There is no 0.5, no -3, no fractions. Every variable is either 0 (false, off, open) or 1 (true, on, closed). A sensor is either triggered or it isn't. A coil is either energized or it isn't. This binary simplicity is what makes digital systems reliable — there's no ambiguous middle state.",
    "**The three operations as English words.** AND means 'both must be true.' OR means 'at least one must be true.' NOT means 'flip it — true becomes false, false becomes true.' Every boolean expression, no matter how complex, is built from these three operations, just like every mathematical expression is built from +, −, ×, ÷.",
    "**A ladder rung IS a boolean equation.** When you draw two contacts in series in ladder logic, you're writing A AND B. Two contacts in parallel is A OR B. A normally-closed contact is NOT A. The diagram is just a visual notation for boolean algebra — which is why understanding the algebra first makes ladder logic instantly readable.",
  ],

  intuition: {
    prose: [
      "**What 'boolean' means.** George Boole published *An Investigation of the Laws of Thought* in 1854, creating an algebra where variables represent propositions (statements that are either true or false) and the operations are logical connectives. He called the two values True and False. Claude Shannon's 1938 master's thesis proved that the same algebra describes switching circuits — and the rest is the history of computing. We use 1 for True/On/Closed and 0 for False/Off/Open.",
      "**AND: both inputs must be 1.** Written A · B (or just AB). The output is 1 only when A = 1 AND B = 1. If either input is 0, the output is 0. This models: 'the machine runs only when the door interlock AND the E-stop are both clear.' In a series electrical circuit, both switches must be closed for current to flow. In a PLC ladder rung, two contacts in series form an AND.",
      "**OR: at least one input must be 1.** Written A + B (the + symbol means OR in boolean algebra, not addition). The output is 1 when A = 1 OR B = 1 OR both are 1. The output is 0 only when both are 0. This models: 'the alarm activates if sensor A OR sensor B trips.' In an electrical circuit, parallel switches — either one closed lets current through. In ladder logic, contacts on parallel branches form an OR.",
      "**NOT: flip the value.** Written Ā (A with a bar over it), or A' or !A. NOT 1 = 0. NOT 0 = 1. That's the entire truth table. This models: 'enable the output when the fault signal is NOT active.' In electrical circuits, a normally-closed (NC) contact passes current when the coil is OFF — that's a NOT. In ladder logic, an XIO (Examine If Open) instruction is a NOT.",
      "**Combining operations.** Real control logic chains these operations together. 'The conveyor runs when the start button is pressed AND the E-stop is NOT active AND (the safety curtain is clear OR the guard is closed)' becomes: Run = Start · (¬EStop) · (Curtain + Guard). Reading boolean expressions is exactly like reading these English sentences — once you see the pattern, every ladder program becomes instantly parseable.",
      "**Precedence rules.** Like standard algebra where × binds tighter than +, boolean has a precedence order: NOT binds tightest (applied first), then AND, then OR. So A + B·C means A OR (B AND C) — the AND is evaluated first. Parentheses override precedence: (A + B)·C means (A OR B) AND C. This matters because 'alarm if door open OR E-stop pressed AND fault active' could mean two very different things depending on where the AND groups.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'AND Operation (·)',
        body: '**A · B = 1 if and only if A = 1 AND B = 1**\n\nTruth table:\n```\nA  B  A·B\n0  0   0\n0  1   0\n1  0   0\n1  1   1\n```\nPLC ladder: contacts in **series**\nElectrical: switches in **series**\nBoolean notation: A·B, AB, A AND B',
      },
      {
        type: 'definition',
        title: 'OR Operation (+)',
        body: '**A + B = 1 if A = 1 OR B = 1 (or both)**\n\nTruth table:\n```\nA  B  A+B\n0  0   0\n0  1   1\n1  0   1\n1  1   1\n```\nPLC ladder: contacts in **parallel**\nElectrical: switches in **parallel**\nBoolean notation: A+B, A OR B\n⚠ The + symbol here means OR, not arithmetic addition.',
      },
      {
        type: 'definition',
        title: 'NOT Operation (¬ or overbar)',
        body: '**Ā = 1 if A = 0; Ā = 0 if A = 1**\n\nTruth table:\n```\nA   Ā\n0   1\n1   0\n```\nPLC ladder: **Normally Closed (XIO)** contact\nElectrical: **normally-closed switch**\nBoolean notation: Ā, A\', ¬A, NOT A\nKey insight: "enabled when fault is absent" = Enable · (¬Fault)',
      },
      {
        type: 'theorem',
        title: "De Morgan's Theorem — Critical for PLC Work",
        body: 'Two laws that let you rewrite any boolean expression:\n\n**Law 1:** ¬(A · B) = Ā + B̄\n"NOT (A AND B)" equals "NOT-A OR NOT-B"\n\n**Law 2:** ¬(A + B) = Ā · B̄\n"NOT (A OR B)" equals "NOT-A AND NOT-B"\n\nPLC application: a NAND gate (output off only when ALL inputs on) is equivalent to individual NOT gates feeding an OR. Understanding this lets you simplify complex interlocks.',
      },
      {
        type: 'insight',
        title: 'Boolean Precedence (Most to Least Binding)',
        body: '1. Parentheses — evaluated first\n2. NOT (¬ or overbar)\n3. AND (·)\n4. OR (+)\n\nSo: A + B·¬C = A + (B · (¬C))\n\nAlways use parentheses in PLC programs when combining AND and OR to make your intent explicit. A missing parenthesis can cause a machine to start when it shouldn\'t — or fail to stop when it should.',
      },
      {
        type: 'insight',
        title: 'Boolean Identities Worth Memorizing',
        body: 'These come up constantly when simplifying PLC logic:\n\n**Identity laws:** A + 0 = A,  A · 1 = A\n**Null laws:** A + 1 = 1,  A · 0 = 0\n**Complement:** A + Ā = 1,  A · Ā = 0\n**Idempotent:** A + A = A,  A · A = A\n**Double NOT:** ¬(¬A) = A\n**Absorption:** A + A·B = A,  A · (A + B) = A\n\nThe complement laws are especially useful: if a signal AND its inverse are ANDed, the output is always 0. If ORed, always 1.',
      },
      {
        type: 'warning',
        title: 'Common Mistake: Confusing Boolean + with Arithmetic +',
        body: 'In boolean algebra, + means OR — not addition. So 1 + 1 = 1 (not 2). "True OR True is True." This confuses everyone at first. Remember: in boolean, there is no number greater than 1. If you need actual arithmetic in a PLC, you use math instructions (ADD, SUB) operating on integer tags — completely separate from the boolean contact logic on the rung.',
      },
    ],
    visualizations: [
      {
        id: 'LogicGateLab',
        title: 'Boolean Operations — AND, OR, NOT',
        mathBridge: 'Toggle A and B. Use the AND gate to verify: output is 1 only when BOTH inputs are 1. Switch to OR: output is 1 when ANY input is 1. The truth table highlights the current row in real time.',
      },
    ],
  },

  math: {
    prose: [
      "Boolean algebra follows formal laws that look like — but differ from — regular algebra. The key operations are defined by truth tables, and the laws are proven by exhaustive checking (since there are only finitely many cases with 0/1 variables).",
      "**Duality principle:** Every boolean theorem has a *dual* obtained by swapping AND↔OR and 0↔1. If you prove one form, the dual is free. This is why De Morgan's two laws are truly one law viewed from two angles.",
      "A **boolean expression** with n variables has $2^n$ possible input combinations. With 10 inputs (10 PLC conditions), there are $2^{10} = 1024$ possible input states. That's why we can't exhaustively test every combination on a real machine — we use boolean algebra to reason about the logic symbolically.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Complete Boolean Axioms (Huntington)',
        body: 'All of boolean algebra follows from just these axioms:\n\n1. A + B = B + A and A·B = B·A  (commutativity)\n2. A+(B·C) = (A+B)·(A+C)  (distributivity — note OR distributes over AND, unlike regular algebra)\n3. A + 0 = A and A·1 = A  (identity elements)\n4. A + Ā = 1 and A·Ā = 0  (complement)\n\nEverything else — De Morgan, absorption, idempotence — is derived from these four.',
      },
    ],
  },

  challenges: [
    {
      problem: 'Simplify: A·1 = ? and A+0 = ?',
      hint: 'These are the Identity laws. Multiplying by 1 and adding 0 are no-ops in boolean algebra.',
      walkthrough: [
        'Apply the AND Identity law: A·1 = A. Multiplying any boolean value by 1 leaves it unchanged.',
        'Apply the OR Identity law: A+0 = A. OR-ing any boolean value with 0 leaves it unchanged.',
        'Both results are simply A — the constant acts as a neutral element for its operation.',
      ],
      answer: 'A·1 = A and A+0 = A',
      difficulty: 'easy',
    },
    {
      problem: 'A PLC rung reads: (DOOR_CLOSED · ESTOP · FAULT) + (DOOR_CLOSED · ESTOP). Simplify using absorption.',
      hint: 'The Absorption law states: X + X·Y = X. Identify X and Y in this expression.',
      walkthrough: [
        'Rewrite the expression: (DOOR_CLOSED · ESTOP · FAULT) + (DOOR_CLOSED · ESTOP)',
        'Factor: let X = DOOR_CLOSED · ESTOP. Then the expression is X·FAULT + X.',
        'Rearrange: X + X·FAULT (commutativity of OR)',
        'Apply Absorption law (X + X·Y = X): X + X·FAULT = X',
        'Substitute back: X = DOOR_CLOSED · ESTOP',
        'Result: DOOR_CLOSED · ESTOP. The FAULT term is completely absorbed — it adds no new logic.',
      ],
      answer: 'DOOR_CLOSED · ESTOP',
      difficulty: 'medium',
    },
    {
      problem: 'Prove using a truth table that A·(A+B) = A. Then state which Boolean law this represents.',
      hint: 'Build a truth table with columns for A, B, (A+B), and A·(A+B). Check if the last column always matches A.',
      walkthrough: [
        'Build the truth table for all 4 combinations of A and B:',
        'A=0, B=0: A+B=0, A·(A+B)=0·0=0. Matches A=0. ✓',
        'A=0, B=1: A+B=1, A·(A+B)=0·1=0. Matches A=0. ✓',
        'A=1, B=0: A+B=1, A·(A+B)=1·1=1. Matches A=1. ✓',
        'A=1, B=1: A+B=1, A·(A+B)=1·1=1. Matches A=1. ✓',
        'For all 4 rows, A·(A+B) = A. The expression is equivalent to A regardless of B.',
        'This is the Absorption Law (AND form): A·(A+B) = A.',
      ],
      answer: 'A·(A+B) = A — this is the Absorption Law.',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Machine start interlock',
      problem: 'A lathe starts only when: (door is closed) AND (E-stop is NOT pressed) AND (spindle speed is set). Write the boolean expression and build a truth table for the case where door=1, Estop=1 (pressed), speed=1.',
      solution: 'Expression: Start = Door · ¬EStop · Speed\n\nWith Door=1, EStop=1 (pressed), Speed=1:\nStart = 1 · ¬1 · 1 = 1 · 0 · 1 = 0\n\nThe machine will NOT start because the E-stop is pressed. Correct behavior — when EStop=0 (released), ¬EStop=1, and all conditions can be met.',
    },
    {
      title: 'Applying De Morgan\'s theorem',
      problem: 'A safety system outputs a FAULT signal when a NAND gate combines inputs A and B: Fault = ¬(A · B). The outputs panel shows: "Fault is OFF." What can you conclude about A and B?',
      solution: 'Fault = ¬(A · B) = Ā + B̄ (De Morgan)\n\nFault = 0 means Ā + B̄ = 0\nFor an OR to equal 0, both terms must be 0: Ā = 0 AND B̄ = 0\nTherefore: A = 1 AND B = 1\n\nBoth inputs must be 1 for the NAND output to be 0. If either input drops to 0, the fault output activates. This is a common safety pattern: the system is "healthy" only when all safety confirmations are active.',
    },
    {
      title: 'Simplify a PLC rung',
      problem: 'A PLC program has this logic: Output = (Sensor_A + Sensor_A · Sensor_B). Simplify it.',
      solution: 'Apply the Absorption law: A + A·B = A\n\nOutput = Sensor_A + Sensor_A · Sensor_B = Sensor_A\n\nThe entire second term is redundant. When Sensor_A is 1, the output is 1 regardless of Sensor_B. When Sensor_A is 0, no amount of Sensor_B can make it 1. The original programmer added an unnecessary condition.',
    },
  ],
};

export default {
  id: 'discrete-1-03',
  slug: 'induction-and-recursion',
  chapter: 'discrete-1',
  order: 5,
  title: 'Induction and Recursion',
  subtitle: 'Proving infinitely scaling logic with finite mechanical work',
  tags: ['induction', 'strong induction', 'recursion', 'recurrence', 'well-ordering'],
  aliases: 'mathematical induction recurrence relation recursive sequence strong induction',

  hook: {
    question: 'How can a Software Engineer mathematically guarantee that a loop or algorithm will definitively work for 10 Billion users, without sitting and testing 10 Billion distinct test cases?',
    realWorldContext: 'Induction is the engine powering all scalable Computer Science logic. It mathematically certifies Loop Invariants, algorithmic correctness (like Divide & Conquer), and recursive data structures like Trees and Graphs. Recursion, on the other hand, is the exact computational mirror of Induction—it executes the logic backwards!',
    previewVisualizationId: 'DominoInductionLab',
  },

  intuition: {
    prose: [
      '### 1. The Domino Physics System',
      'The single most common illusion for beginners is thinking that Induction is "Circular Logic" (assuming exactly what you are trying to prove). This is fundamentally wrong!',
      'Instead, think of Induction as pure mechanical physics: You are setting up an infinitely long chain of Dominoes. You DO NOT assume the entire chain falls. You only assume two highly specific mechanical things:',
      '• **The Base Case $P(1)$:** Do you possess the physical finger to knock over the very first domino? *(Note: The first domino isn\'t always $n=1$! In programming arrays, the base case is often $n=0$. In geometry polygon proofs, the base case is $n=3$. You just need to flick the FIRST domino, wherever it lies!)*',
      '• **The Inductive Step $P(k) \\to P(k+1)$:** If we zoom into completely random domino $k$ somewhere in the line, is the geometric spacing tight enough that it will *guarantee* a collision with domino $k+1$?',
      'If BOTH specific mechanics are proven, you don\'t need to test infinity! The absolute truth propagates geometrically forever.',
      '### 2. The Illusion of "Testing a Few Cases"',
      'Beginners constantly ask: "If I physically test the math for $n=1, 2,$ and $3$ and it works perfectly, why can\'t I just stop and assume it always works?"',
      'Because of the **Fake Domino Chain Trap!** Consider the formula $f(n) = n^2 + n + 41$. If you test $n = 0, 1, 2$, all the way up to $39$, it flawlessly generates nothing but perfect Prime numbers. It looks unassailable! But the split second you test $n=40$, the math suddenly explodes into a wildly composite number ($41^2 = 1681$). The Inductive Step isn\'t just "extra work"—it is the ironclad insurance policy that visually guarantees the pattern never, ever breaks at index $10\\text{ Billion}$.',
      '### 3. The Algebra Gap (Where does k+1 come from?)',
      'When executing an Inductive Step mathematically, you formally assume the formula works perfectly for step $k$ (The Inductive Hypothesis).',
      'Then, you must brutally force the equation to simulate what physically happens locally at strictly $k+1$. You do this by deliberately injecting the exact next raw target integer into the system, and aggressively using algebra to compress it all back into the original formula structure.'
    ],
    callouts: [
      {
        type: 'warning',
        title: '⚠️ The Absolute Deadline Trap',
        body: 'If you ever complete an Inductive Step proof mathematically, but you never organically substituted your "Inductive Hypothesis $P(k)$" into the equations to help you solve it... your proof is 100% fundamentally invalid. Every single $P(k+1)$ derivation absolutely requires the mechanical kinetic energy of $P(k)$ to algebraically function!'
      }
    ],
    visualizations: [
      {
        id: 'SigmaDecoderLab',
        title: 'The Sigma (\\Sigma) Notation Decoder',
        caption: 'Deconstruct the terrifying Greek symbol into a simple 3-part programming For-Loop before attempting Mathematical Proofs.'
      },
      {
        id: 'InductionAlgebraDecoderLab',
        title: 'The Core "Aha!" Mechanical Substitution',
        caption: 'Watch the exact moment the Inductive Hypothesis $P(k)$ is mathematically injected to flawlessly close the gap.'
      },
      {
        id: 'DominoInductionLab',
        title: 'The Mechanical Engine of Proofs',
        caption: 'Adjust the logic parameters to successfully trigger an infinitely cascading chain of unassailable mathematical truth.'
      },
      {
        id: 'InductionGrowthExplorer',
        title: 'Recursive Growth Explorer',
        caption: 'A second perspective: visualize induction as layered recursive growth from a base seed.',
        mathBridge: 'Complements domino induction by showing how each verified step supports a larger recursive structure.',
        props: { guided: true }
      },
      {
        id: 'InductionStairCase',
        title: 'Induction Staircase Explorer',
        caption: 'Geometric proof perspective: duplicate and flip a staircase to see the rectangle argument for sums.',
        mathBridge: 'Shows why 1 + 2 + ... + n = n(n+1)/2 through geometry and links directly to the inductive step.',
        props: { guided: true }
      }
    ]
  },

  math: {
    prose: [
      '### 4. Strong Induction (The Heavier Domino)',
      'Standard (Weak) Induction only relies on the immediately preceding Domino $k$ to push $k+1$. But what if the math is so incredibly heavy that one single domino isn\'t physically strong enough to push it over?',
      '**Strong Induction** completely shatters this limitation. Instead of relying solely on $P(k)$, Strong Induction structurally relies on the combined truth of EVERY SINGLE historical domino that has ever fallen: $P(1) \\wedge P(2) \\dots \\wedge P(k)$.',
      'This grants the system immense architectural power. It is absolutely necessary when analyzing logic that skips steps, like Integer Prime Factorization or the legendary Fibonacci sequence.',
      '### 5. Recursion (Induction in Reverse)',
      'Recursion perfectly mirrors Induction, but strictly runs the engine backwards!',
      '• Induction builds upward: Proves $P(1)$ is true, which forces $P(2)$, which forces $P(3)$, up to Infinity.',
      '• Recursion unwinds downward: It starts at $P(10)$, demands $P(9)$ to solve it, which demands $P(8)$, collapsing all the way down until it aggressively hits the hardcoded Base Case stopping condition.'
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The Well-Ordering Principle',
        body: 'Why does Induction mathematically work at all? Because of the deeply profound Well-Ordering Principle: "Every single non-empty set of positive integers MUST possess an absolute smallest baseline element." Without a true structural floor (Base Case), the mathematical domino chain simply floats in a void and can never begin!'
      }
    ],
    visualizations: [
      {
        id: 'StrongInductionWallLab',
        title: 'Visualizing Strong Induction Weight',
        caption: 'Watch a single Domino completely fail to push a heavy target, demanding the massive architectural support of Strong Induction.'
      },
      {
        id: 'RecursiveStackLab',
        title: 'The Recursive Architecture',
        caption: 'Execute the Fibonacci(4) logic cycle. Notice how heavily it relies on Strong Induction to perfectly trace the historical logic dependencies.'
      }
    ]
  },

  rigor: {
    prose: [
      '### 6. Architectural Proof Blueprints',
      'Induction proofs are highly formalized structural essays. They strictly demand four specific structural headers:',
      '1. **Define $P(n)$:** Clearly map out the exact proposition you are attacking.',
      '2. **The Base Case:** Explicitly prove $P(1)$ (or $P(0)$) geometrically holds.',
      '3. **The Inductive Hypothesis (IH):** Formally declare "Assume $P(k)$ is true for some arbitrary integer $k \\ge 1$."',
      '4. **The Inductive Step:** Write out the target goal for $P(k+1)$. Perform aggressive algebraic manipulation, explicitly noting down where you strictly injected the IH to force the chain sequence closed.'
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The Proof Scaffolding Template (The Ritual)',
        body: 'Induction is a rigorous ritual. Beginners often know the math but functionally freeze because they don\'t know the absolute "magic words" to write down on the blank page. Use this guaranteed Fill-in-the-Blanks Template:\n\n**1. Base Case:** "We prove the formula works for the very first step. Let $n = [1, or\\; 0]$. [Show the math equals perfectly]. Thus, the base case holds."\n**2. Inductive Hypothesis:** "Assume the formula definitively works for some arbitrary step $k \\ge 1$. That is, assume [Write the exact formula here, swapping $n$ for $k$]."\n**3. Inductive Step:** "We use our assumption to firmly prove it MUST work for step $k+1$. That is, we must formally prove [Write the formula swapping $n$ for $k+1$]." \n*(Execute algebra, forcefully substitute IH, and physically reduce!)* \n**4. The Conclusion:** "Therefore, by the Strict Principle of Mathematical Induction, the proposition $P(n)$ holds $\\forall n \\ge 1$."'
      }
    ],
    visualizations: [
      {
        id: 'ProofEngineViz',
        title: 'Rigorous Proof Engine',
        caption: 'Transition from geometric intuition to Formal Invariants. Watch the system verify the truth of the state at every step.',
        mathBridge: 'Enforces the connection between Algebra (the sum) and Invariants (the row properties) to create an unassailable proof.',
        props: { guided: true }
      }
    ]
  },

  examples: [
    {
      id: 'discrete-1-03-ex1',
      title: 'The Classic Arithmetic Sum',
      problem: 'Prove flawlessly via Induction that the sum of the first `n` positive integers perfectly equals: $\\frac{n(n+1)}{2}$.',
      steps: [
        { expression: '\\text{Base Case (n=1): } 1 = \\frac{1(1+1)}{2} = \\frac{2}{2} = 1', annotation: 'The Base Domino successfully falls. The floor is mechanically established.' },
        { expression: '\\text{Inductive Hypothesis (IH): Assume } \\sum_{i=1}^k i = \\frac{k(k+1)}{2}', annotation: 'We assume domino k successfully transfers forward kinetic energy.' },
        { expression: '\\text{Step to } k+1: \\sum_{i=1}^{k+1} i = \\left( \\sum_{i=1}^k i \\right) + (k+1)', annotation: 'We physically inject the absolute next integer (k+1) into the chain.' },
        { expression: '= \\frac{k(k+1)}{2} + (k+1)', annotation: '💥 WE DEPLOYED THE IH! We swapped the massive sum securely for the fraction.' },
        { expression: '= \\frac{k(k+1) + 2(k+1)}{2} = \\frac{(k+1)(k+2)}{2}', annotation: 'Strict algebraic reduction perfectly outputs the exact original formula structure with (k+1) injected! Chain closed.' }
      ],
      conclusion: 'By the Principle of Mathematical Induction, the formula organically holds identically true for all $n \\ge 1$.'
    },
    {
      id: 'discrete-1-03-ex2',
      title: 'Strong Induction Factorization',
      problem: 'Prove that every integer $n \\ge 2$ can be factored cleanly into primes.',
      steps: [
        { expression: '\\text{Base Case (n=2): 2 is already a prime.}', annotation: 'The base floor is immediately secure.' },
        { expression: '\\text{Strong IH: Assume EVERYTHING from } 2 \\text{ up to } k \\text{ can be cleanly factored.}', annotation: 'We assume all previous historical dominos reliably hold.' },
        { expression: '\\text{Goal: Prove for } k+1.', annotation: 'We examine the next arbitrary integer.' },
        { expression: '\\text{If } k+1 \\text{ is prime, we are already done!}', annotation: 'One specific subcase instantly cleared.' },
        { expression: '\\text{If } k+1 \\text{ is composite, it splits into } a \\times b \\text{ (where } a \\text{ and } b \\le k \\text{).}', annotation: 'Because a and b are strictly smaller than k, the Strong IH instantly guarantees they are prime! Weak Induction would fail here completely because we don\'t specifically need $k$ alone, we need the historically smaller $a$ and $b$!' }
      ],
      conclusion: 'We required the absolute combined weight of all prior dominos to push this logic over. Strong Induction achieves this perfectly.'
    },
    {
      id: 'discrete-1-03-ex3',
      title: 'Proof by Contradiction: The \\sqrt{2} Anomaly',
      problem: 'To finalize your "Proof Toolkit", prove that mathematically $\\sqrt{2}$ is irrational (it legally cannot ever be written as a clean fraction $a/b$).',
      steps: [
        { expression: '\\text{Assume the "Lie": } \\sqrt{2} = \\frac{a}{b}', annotation: 'Contradiction starts by aggressively assuming the EXACT opposite! Assume it IS a perfectly reduced fraction where $a$ and $b$ share no common factors.' },
        { expression: '2 = \\frac{a^2}{b^2} \\implies a^2 = 2b^2', annotation: 'Basic algebra. But notice the right side is explicitly multiplied by 2! This means $a^2$ is an EVEN number.' },
        { expression: '\\text{If } a^2 \\text{ is even, } a \\text{ MUST be even.}', annotation: 'An odd squared is always odd. So $a$ is even. Let\'s formally declare $a = 2k$.' },
        { expression: '(2k)^2 = 2b^2 \\implies 4k^2 = 2b^2 \\implies b^2 = 2k^2', annotation: 'Wait. If $b^2 = 2k^2$, that rigidly means $b$ is ALSO an EVEN number!' },
        { expression: '\\text{The Explosion: Both } a \\text{ and } b \\text{ are EVEN.}', annotation: 'If both are even, the fraction $a/b$ could still be divided by 2! But Step 1 rigidly declared $a/b$ was perfectly reduced! The Math just violently imploded on itself.' }
      ],
      conclusion: 'Because the "lie" results in an impossible paradoxical statement, the absolute opposite must rigorously be true: $\\sqrt{2}$ is definitively Irrational.'
    }
  ],

  challenges: [
    {
      id: 'discrete-1-03-ch1',
      difficulty: 'easy',
      problem: 'Quick Check: If you mathematically prove the Inductive Step $P(k) \\to P(k+1)$, but entirely forget to prove the Base Case $P(1)$, what happens to the Domino line?',
      hint: 'Think about the physical kinetic energy required to start a reaction.',
      walkthrough: [
        { expression: '\\text{No Base Case = No initial push energy}', annotation: 'The dominoes are perfectly spaced, but nothing ever initiates the chain reaction!' }
      ],
      answer: 'The chain NEVER STARTS! You just proved the dominoes are perfectly spaced, but they all remain standing perfectly still forever.'
    },
    {
      id: 'discrete-1-03-ch2',
      difficulty: 'medium',
      problem: 'The "All Horses are the Same Color" Paradox! A famous fake inductive proof claims $P(n):$ "In any set of $n$ horses, all horses are the exact same color." Base case $P(1)$ is true (1 horse is exactly the same color as itself). For $P(k+1)$, if you have $k+1$ horses, you remove 1, making it a group of $k$ horses (which are all the same color by IH). Then you swap horses. Thus all $k+1$ horses are identical! Where is the fatal geometric flaw?',
      hint: 'The fake proof implicitly relies on the two groups "overlapping" to logically share the color constraint. What if $k=1$ mapping to $k=2$?',
      walkthrough: [
        { expression: '\\text{Test exactly at } P(1) \\to P(2)', annotation: 'Lets trace the domino spacing precisely at the very start.' },
        { expression: '\\text{Take 2 horses. Cover Horse A. Horse B is one color. Cover B. Horse A is one color.}', annotation: 'By the fake IH, both sub-groups are internally consistent.' },
        { expression: '\\text{But there is ZERO overlap!} ', annotation: 'Horse A and Horse B never interacted in a sub-group together to force the colors to match!' }
      ],
      answer: 'The spacing breaks exactly between Domino 1 and Domino 2! The Inductive Step completely fails because the logic of "overlapping subgroups sharing color" structurally requires a minimum of $k=3$ horses! The chain violently breaks instantly on the very first jump.'
    }
  ],
  semantics: {
    core: [
      { symbol: 'P(n)', meaning: 'Proposition — a statement depending on an integer n' },
      { symbol: 'Base Case', meaning: 'The smallest value (e.g., P(1)) for which the statement is proven' },
      { symbol: 'Inductive Hypothesis', meaning: 'The assumption that P(k) is true for some arbitrary k' },
      { symbol: 'Inductive Step', meaning: 'Proving that P(k) ⇒ P(k+1)' },
      { symbol: 'Strong Induction', meaning: 'Assuming P(i) is true for all 1 ≤ i ≤ k' },
      { symbol: 'Recursion', meaning: 'Defining a function or set in terms of itself' },
      { symbol: 'Base Case (Recursion)', meaning: 'The stopping condition for a recursive process' },
    ],
    rulesOfThumb: [
      'Induction is for proving; Recursion is for computing.',
      'Always verify the base case first. Without it, the "ladder" has no floor.',
      'In the inductive step, you MUST use the inductive hypothesis.',
      'Strong induction is best for properties like prime factorization or Fibonacci sequences.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-01b-logic-and-proofs',
        label: 'Logic and Proofs',
        note: 'Induction is a specific formal proof technique used for claims involving natural numbers.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-07-recurrence-relations',
        label: 'Recurrence Relations',
        note: 'We will use induction to prove the closed-form solutions of recursive sequences.',
      },
    ],
  },

  mentalModel: [
    'Induction is a domino effect: if one falls, the next MUST fall.',
    'Recursion is a "Divide and Conquer" strategy: solve a smaller version of the same problem.',
    'The Well-Ordering Principle guarantees there is always a "first" domino.',
    'Strong induction is just standard induction with a bigger "history" buffer.',
  ],

  assessment: {
    questions: [
      {
        id: 'ind-assess-1',
        type: 'choice',
        text: 'What is the "Inductive Hypothesis"?',
        options: ['The base case', 'The conclusion to be proven', 'The assumption that P(k) is true', 'The final step of the proof'],
        answer: 'The assumption that P(k) is true',
        hint: 'You assume the statement holds for k to prove it holds for k+1.',
      },
      {
        id: 'ind-assess-2',
        type: 'input',
        text: 'In recursive Fibonacci f(n) = f(n-1) + f(n-2), how many base cases are needed?',
        answer: '2',
        hint: 'Since it looks back at two prior values, you need two seeds to start.',
      },
    ],
  },

  quiz: [
    {
      id: 'ind-q1',
      type: 'choice',
      text: 'What happens if you prove the Inductive Step but the Base Case is False?',
      options: ['The statement is still True', 'The proof is valid for n > 1', 'The entire statement is unproven', 'The statement is only true for prime numbers'],
      answer: 'The entire statement is unproven',
      hints: ['Without the base case, the domino chain is never initiated.'],
    },
    {
      id: 'ind-q2',
      type: 'choice',
      text: 'When should you use Strong Induction instead of Weak Induction?',
      options: ['When n is very large', 'When the k+1 step depends on multiple previous steps', 'When proving geometric theorems', 'When the base case is n=0'],
      answer: 'When the k+1 step depends on multiple previous steps',
      hints: ['Strong induction allows you to use the entire history of proven cases.'],
    },
  ],
}

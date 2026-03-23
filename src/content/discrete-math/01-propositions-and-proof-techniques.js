export default {
  id: 'discrete-1-01',
  slug: 'propositions-and-proof-techniques',
  chapter: 'discrete-1',
  order: 1,
  title: 'Propositions and Logical Operators',
  subtitle: 'Translating human language into absolute mathematical truth',
  tags: ['propositions', 'logic', 'proof', 'contrapositive', 'contradiction', 'direct proof', 'quantifiers'],
  aliases: 'discrete logic proofs truth table contrapositive contradiction quantifiers',

  hook: {
    question:
      "If I promise you: *'If you get an A on the test, I will buy you a car.'* \n\nThen you take the test, you get a **B**, but I decide to buy you a car anyway... Did I logically lie to you?",
    realWorldContext:
      "If you ask humans, many will say yes. But in mathematics, the answer is undeniably NO. Human language is full of implied meanings and ambiguities. Formal Logic strips away all assumptions and establishes rigid, unbreakable rules for *Truth*. Designing these perfect logical rules is the exact same skill utilized by software engineers to wire CPU transistors, build database queries, and design AI architectures.",
    previewVisualizationId: 'TruthTableLab',
  },

  intuition: {
    prose: [
      "### 1. Foundations: What is a Proposition?",
      "Before we connect logic to computer hardware, we need raw material. That raw material is the **Proposition**.",
      "**Definition:** A proposition is a declarative statement that is either True (T) or False (F), but never both.",
      "• **Valid:** \"The number 4 is even.\" (True)",
      "• **Valid:** \"The moon is made of green cheese.\" (False, but still a proposition!)",
      "• **Invalid:** \"Go to your room!\" (Command) or \"How are you?\" (Question).",
      "We use lowercase letters like p, q, and r to represent these statements so we don't have to rewrite \"The moon is made of cheese\" every time."
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The Logic Dictionary',
        body: "We use symbols to connect propositions. Think of these as the \"math operators\" of language.\n\n| Symbol | Name | English Equivalent | Quick Rule |\n|---|---|---|---|\n| ¬ or ~ | Negation | \"Not p\" | Opposite of the original value. |\n| ∧ | Conjunction | \"p AND q\" | Only True if both are True. |\n| ∨ | Disjunction | \"p OR q\" | True if at least one is True. |\n| → | Conditional | \"If p, then q\" | Only False if p is True and q is False. |\n| ↔ | Biconditional | \"p iff q\" | True only if both match. |",
      }
    ],
    visualizations: [
       {
         id: 'VennDiagram',
         title: 'Spatial Logic: Venn Diagrams',
         caption: 'Some people are algebraic, but some are spatial. Visualize the "Logic Universe" using Set Theory.',
       },
       {
         id: 'TruthCube3D',
         title: 'The Truth Cube (The Multiverse Map)',
         caption: 'Every variable doubles the number of possible universes. See Logical Density in 3D: "AND" is restrictive, "OR" is permissive.',
       }
    ]
  },

  math: {
    prose: [
      "### 2. The Language Bridge: Translating English to Logic",
      "Logic is the art of translating ambiguous human English into perfectly mapped symbols. To avoid fatal errors, we must map our vocabulary rigidly to the 5 symbols above.",
      "**The 'If-Then' (p → q) Variations**\nThe Conditional is highly confusing because humans use \"If-Then\" loosely. The mathematical p → q covers ALL of these English variations:\n• **The Standard:** \"If p, then q.\"\n• **The 'Only If':** \"p only if q.\" (Be careful! This is NOT the same as \"If q, then p\").\n• **The Requirement:** \"q is necessary for p.\"\n• **The Trigger:** \"p is sufficient for q.\"\n• **The Converse Trap:** p → q does NOT guarantee q → p. (If I am a dog, I am an animal... does not mean If I am an animal, I am a dog!).",
      "**The Biconditional ($\\leftrightarrow$) Two-Way Contract**\nThe Conditional is barely half the story. The Biconditional (p ↔ q) is a strict **Two-Way Contract**: \"I will go to the party IF AND ONLY IF you go.\"\n• If we both go, the statement is True.\n• If neither of us goes, the statement is STILL True (the contract wasn't broken).\n• If one goes without the other, the contract is broken (False).",
      "**The 'Hidden' Connectives**\n• **The 'But' Clause:** \"It is sunny but cold\" uses contrast in English, but mathematically it is a Conjunction: S ∧ C. \n• **The 'Inclusive Or' Trap:** If I ask \"Do you want cake or pie?\", human English implies you only get one. Mathematical p ∨ q guarantees you can have *both* simultaneously. If you want exclusivity, you explicitly invoke Exclusive Or (XOR: $\\oplus$).",
      "**De Morgan's Laws (The 'Sign Flip')**\nHow do you negatively flip an entire sentence like \"I will study Algebra OR Geometry\"? You don't just negate the verbs! By expanding the negation over the parentheses, De Morgan's Law states you must FLIP the operator: $\\neg(p \\wedge q) \\equiv \\neg p \\vee \\neg q$, and similarly $\\neg(p \\vee q) \\equiv \\neg p \\wedge \\neg q$. \nSo denying \"Algebra OR Geometry\" actually translates correctly to: \"I will NOT study Algebra AND I will NOT study Geometry.\"",
      "### 3. Circuit Intuition: Logic in Hardware",
      "Logic isn't just a word game—it is a physical mechanism. Computer Science translates p and q directly into electrical voltage (True = High Voltage, False = Ground). By wiring millions of these logic gates together, you build the processors powering your device right now.",
      "• **Conjunction (p ∧ q)** acts exactly like two electrical switches wired in **Series**. If either switch breaks, the entire wire goes dead.",
      "• **Disjunction (p ∨ q)** acts exactly like two switches wired in **Parallel**. The current will happily bypass a broken switch if the parallel route is closed."
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Categorizing Results: Truth Table Terminology',
        body: "Once you build a truth table for an argument, the final column determines the absolute nature of the statement. Memorize these three categories:\n\n• **Tautology:** A perfectly bulletproof statement that is *always True* regardless of what happens in reality (e.g. p ∨ ¬p). The final column is exclusively entirely 'T's.\n• **Contradiction:** An impossible statement that is mathematically *always False* (e.g. p ∧ ¬p). The final column is entirely 'F's.\n• **Contingency:** A statement that is sometimes True and sometimes False, depending entirely on the variables (a mix of T and F).",
      },
      {
        type: 'warning',
        title: '💡 Pro-Tip for the Vacuous Truth Trap',
        body: "Remember the original promise: \"If you get an A (P), I'll buy you a car (Q).\"\n\n**The Broken Promise** (T $\\rightarrow$ F)\nYou got an A. I didn't buy the car. I lied to you. The statement is evaluated as **False**.\n\n**The Unmet Condition** (F $\\rightarrow$ T/F)\nYou got a B ($\\neg P$). The \"If\" part is False.\nIn logic, **if the premise is False, the whole conditional contract is automatically True.**\n\nThis is why buying the car anyway isn't a \"lie\"—the condition for the promise was never met, so the promise was never broken!",
      }
    ],
    visualizations: [
      {
        id: 'LogicGateSim',
        title: 'Circuit Intuition: Logic Gates in Hardware',
        caption: 'Interact with the 2D switches to visualize how Truth translates directly into physical electrical pathways and physical CPU hardware.',
      },
      {
         id: 'TruthTableLab',
         title: 'The Dynamic Table Lab',
         caption: 'Use the calculator below to dynamically test complex logic networks. Can you build an argument column that proves to be a perfectly bulletproof Tautology?',
      }
    ]
  },

  rigor: {
    prose: [
      "Now we arrive at the art of the **Formal Proof**. A proof is a flawless, unbroken chain of logical implications (p → q → r) that guarantees truth. Before you can prove any algebraic statements, you must establish strict logical definitions.",
      "**Even Integer:** An integer n is even if n=2k for some integer k.\n**Odd Integer:** An integer n is odd if n=2k+1 for some integer k.\n**Consecutive Integers:** Represented mathematically as n and n+1.",
      "There are essentially three logic templates we use to attack arguments."
    ],
    callouts: [
      {
        type: 'definition',
        title: '1. Direct Proof',
        body: "The sledgehammer approach. Assume your premise p is True. Keep applying known algebraic definitions (like Even/Odd) step-by-step in a forward direction until you undeniably arrive at q.",
      },
      {
        type: 'insight',
        title: '2. Proof by Contrapositive',
        body: "Leveraging Logical Equivalence! Proving \"If x² is even, then x is even\" is incredibly annoying because working backward from square roots is messy. However, p → q is mathematically identical to its Contrapositive: ¬q → ¬p.\n\nInstead, we prove: \"If x is ODD, then x² is ODD.\" Because this is much easier to prove directly, proving it mathematically proves original statement by proxy!",
      },
      {
        type: 'definition',
        title: '3. Proof by Contradiction',
        body: "The trap. You assume the very thing you are trying to prove is actually FALSE. You then relentlessly trace the logic from this fake premise until reality explicitly breaks (e.g., finding a statement that evaluates as a Contradiction). Because reality cannot break, your assumption must have been wrong, meaning your original statement MUST be true.",
      }
    ],
    visualizations: [
      {
        id: 'DominoInductionLab',
        title: 'Looking Ahead: Mathematical Induction',
        caption: 'A preview of how we prove infinitely scaling statements using a formal domino-based chain reaction.',
      }
    ]
  },

  examples: [
    {
      id: 'discrete-1-01-ex0',
      title: 'The Translation Bridge Challenge',
      problem: "\\text{Translate to logic where } p\\text{: \"Raining\" and } q\\text{: \"Wet ground\"}",
      steps: [
        { expression: '\\text{Easy: \"It is not raining and the ground is wet.\"}', annotation: 'The "not" applies only to the raining part.' },
        { expression: '\\neg p \\wedge q', annotation: 'Matches the Easy translation!' },
        { expression: '\\text{Medium: \"If it is raining, then the ground is wet.\"}', annotation: 'The standard "If-Then" structure.' },
        { expression: 'p \\rightarrow q', annotation: 'Matches the Medium translation!' },
        { expression: '\\text{Hard: \"The ground is wet only if it is raining.\"}', annotation: '"Only if" is incredibly tricky. "q only if p" equates to q -> p.' },
        { expression: 'q \\rightarrow p', annotation: 'Did this trip you up? "Only if" enforces that rain is a mandatory consequence or requirement for wetness.' },
        { expression: '\\text{Boss Mode: \"It is false that: if it is raining, then the ground is not wet.\"}', annotation: '"It is false that" negates the entire grouping that follows.' },
        { expression: '\\neg(p \\rightarrow \\neg q)', annotation: 'Matches the Boss Mode translation!' }
      ],
      conclusion: 'If you figured out the Hard and Boss Mode translations, you are genuinely already thinking completely like a discrete mathematician.'
    },
    {
      id: 'discrete-1-01-ex1',
      title: 'Worked Proof: Direct Approach',
      problem: '\\text{Prove: If } a \\text{ and } b \\text{ are even integers, then } (a + b) \\text{ is even.}',
      steps: [
        { expression: '\\text{Assume } a \\text{ and } b \\text{ are even.}', annotation: 'Define the Starting Point: We assume the "If" part is totally true.' },
        { expression: 'a = 2k \\text{ and } b = 2j', annotation: 'Narrative: We are giving "Evenness" a mathematical body. By writing 2k and 2j, we can now use algebra to see what happens when we add two even things together.' },
        { expression: 'a + b = 2k + 2j', annotation: 'The Transformation: Substitute our strict rules directly into the target question.' },
        { expression: 'a + b = 2(k + j)', annotation: 'Algebraic manipulation: By factoring out a 2, we expose the underlying structure of the number.' },
        { expression: '\\text{Let } m = (k + j).', annotation: 'Because an integer plus an integer makes a new integer, m is a rock-solid integer.' },
        { expression: 'a + b = 2m', annotation: 'The Victory: Since (a+b) equals exactly 2 times some integer, it perfectly matches the definition of an even number.' }
      ],
      conclusion: 'By strictly defining Even numbers using 2k, we directly chained logic forward to prove p → q.'
    },
    {
      id: 'discrete-1-01-ex2',
      title: 'Proof by Contrapositive: The Flipped Script',
      problem: '\\text{Prove: If } 3n + 2 \\text{ is odd, then } n \\text{ is odd.}',
      steps: [
        { expression: '\\text{Let } p=(3n+2 \\text{ is odd}) \\text{ and } q=(n \\text{ is odd})', annotation: 'Identify the players: We label our "If" (p) and our "Then" (q) so we can rearrange them later.' },
        { expression: '\\text{The Contrapositive is } \\neg q \\implies \\neg p', annotation: 'Change the Goal: Instead of proving p -> q, we prove "If n is even, then 3n+2 is even." They are logically identical!' },
        { expression: '\\text{Assume } n \\text{ is even. Therefore, } n = 2k.', annotation: 'The Starting Point: It’s much easier to start with a simple n than a complex 3n+2. We use 2k because that is the "DNA" of an even number.' },
        { expression: '3(2k) + 2', annotation: 'The Transformation: We plug our "even" definition into the expression to see how it behaves under pressure.' },
        { expression: '= 6k + 2', annotation: 'Algebraic Cleanup: Just standard math here to get it into a shape we can analyze.' },
        { expression: '= 2(3k + 1)', annotation: 'The "Smoking Gun": By pulling out a 2, we prove the whole result is divisible by 2. Anything in the form 2(something) is even by definition.' }
      ],
      conclusion: 'The Victory: Since we proved the "flipped" version is true, the original statement must also be true. We avoided all the messy fractions of a direct proof!'
    },
    {
      id: 'discrete-1-01-ex3',
      title: 'Proof by Contradiction: The Final Boss',
      problem: '\\text{Prove that } \\sqrt{2} \\text{ is irrational.}',
      steps: [
        { expression: '\\text{Assume } \\sqrt{2} = \\frac{a}{b}', annotation: 'The Trap: We assume the exact OPPOSITE of what we want to prove. We assume it IS rational (a fraction in simplest form).' },
        { expression: '2 = \\frac{a^2}{b^2} \\implies 2b^2 = a^2', annotation: 'Square both sides and multiply by b^2 to remove the radical and the fraction.' },
        { expression: 'a^2 \\text{ is even, so } a \\text{ is even.}', annotation: 'Since a^2 equals 2 times an integer, it must be even!' },
        { expression: 'a = 2k \\implies 2b^2 = (2k)^2 = 4k^2', annotation: 'If a is even, we can write it perfectly as 2k and substitute it back.' },
        { expression: 'b^2 = 2k^2 \\implies b \\text{ is even.}', annotation: 'Divide by 2. Now b^2 is even, which forces b to inevitably be even as well!' },
        { expression: '\\text{Contradiction!}', annotation: 'The Explosion: We assumed a/b was in absolute simplest form, but they are BOTH even (divisible by 2)! Reality broke.' }
      ],
      conclusion: 'Because assuming $\\sqrt{2}$ is rational led to a mathematically broken universe, our assumption must have been strictly false. Therefore, $\\sqrt{2}$ is undeniably irrational.'
    }
  ],

  challenges: [
    {
      id: 'discrete-1-01-ch1',
      difficulty: 'easy',
      problem: 'What is the logical status of the statement: p ∨ ¬p?',
      hint: 'Build a tiny mental truth table. If p is True, what is the statement? If p is False, what is the statement?',
      walkthrough: [
        { expression: 'p = T \\implies (T \\vee F) = T', annotation: 'If p is True, the overall OR statement evaluates True.' },
        { expression: 'p = F \\implies (F \\vee T) = T', annotation: 'If p is False, the overall OR statement STILL evaluates True.' },
      ],
      answer: 'Tautology. The statement evaluates as True regardless of the outcome of reality.',
    },
    {
      id: 'discrete-1-01-ch2',
      difficulty: 'medium',
      problem: 'Apply De Morgan\'s Law to negate the following statement mathematically: "I will study Algebra OR I will study Geometry".',
      hint: 'Remember that denying an OR statement mathematically requires denying BOTH options simultaneously.',
      walkthrough: [
        { expression: '\\neg(A \\vee G)', annotation: 'Formulate the sentence symbolically into math terms.' },
        { expression: '\\equiv \\neg A \\wedge \\neg G', annotation: 'Apply De Morgan\'s Law which pushes the NOT inside and swaps the OR into an AND.' },
        { expression: '\\text{"I will NOT study Algebra AND I will NOT study Geometry"}', annotation: 'Translate back into normal English.' },
      ],
      answer: 'I will not study Algebra AND I will not study Geometry.',
    },
    {
      id: 'discrete-1-01-ch3',
      difficulty: 'hard',
      problem: 'Puzzle: In a system, p = "request is authenticated" and q = "request can access admin route". Translate and assess whether each policy is safe: (1) p -> q, (2) q -> p, (3) p <-> q.',
      walkthrough: [
        { expression: 'p -> q means authentication is sufficient for admin access', annotation: 'Usually unsafe if authorization roles are missing.' },
        { expression: 'q -> p means admin access requires authentication', annotation: 'Necessary security requirement.' },
        { expression: 'p <-> q forces both directions', annotation: 'Equivalent classes: only authenticated users get admin, and all authenticated users get admin (often too broad).' },
      ],
      answer: 'Policy (2) is the core minimum safety rule; (1) and especially (3) are typically over-permissive without role constraints.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'predicate-logic-and-quantifiers', label: 'Predicate Logic and Quantifiers', context: 'Propositional logic is the base layer before quantified statements.' },
    { lessonSlug: 'relations-and-structures', label: 'Relations and Structures', context: 'Logical predicates define many relation properties.' },
    { lessonSlug: 'boolean-algebra-and-circuits', label: 'Boolean Algebra and Circuits', context: 'Truth-functional logic becomes gate simplification and hardware design.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
}

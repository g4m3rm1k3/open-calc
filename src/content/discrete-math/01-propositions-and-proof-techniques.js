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
      "We use lowercase letters like $p, q,$ and $r$ to represent these statements so we don't have to rewrite \"The moon is made of cheese\" every time."
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The Logic Dictionary',
        body: "We use symbols to connect propositions. Think of these as the \"math operators\" of language.\n\n| Symbol | Name | English Equivalent | Quick Rule |\n|---|---|---|---|\n| $\\neg$ or $\\sim$ | Negation | \"Not p\" | Opposite of the original value. |\n| $\\wedge$ | Conjunction | \"p AND q\" | Only True if both are True. |\n| $\\vee$ | Disjunction | \"p OR q\" | True if at least one is True. |\n| $\\rightarrow$ | Conditional | \"If p, then q\" | Only False if p is True and q is False. |\n| $\\leftrightarrow$ | Biconditional | \"p iff q\" | True only if both match. |",
      }
    ],
    visualizations: [
       {
         id: 'TruthCube3D',
         title: 'Logic Lab: The Truth Cube (3D Space)',
         caption: 'Interact with the 2x2x2 space representing 3 propositions (p, q, r). Notice how "OR" statements consume almost the entire volume, while "AND" statements are extremely restrictive!',
       }
    ]
  },

  math: {
    prose: [
      "### 2. The Language Bridge: Translating English to Logic",
      "Logic is the art of translating ambiguous human English into perfectly mapped symbols. To avoid fatal errors, we must map our vocabulary rigidly to the 5 symbols above.",
      "**The 'If-Then' ($p \\rightarrow q$) Variations**\nThe Conditional is highly confusing because humans use \"If-Then\" loosely. The mathematical $p \\rightarrow q$ covers ALL of these English variations:\n• **The Standard:** \"If p, then q.\"\n• **The 'Only If':** \"p only if q.\" (Be careful! This is NOT the same as \"If q, then p\").\n• **The Requirement:** \"q is necessary for p.\"\n• **The Trigger:** \"p is sufficient for q.\"\n• **The Converse Trap:** $p \\rightarrow q$ does NOT guarantee $q \\rightarrow p$. (If I am a dog, I am an animal... does not mean If I am an animal, I am a dog!).",
      "**The 'Hidden' Connectives**\n• **The 'But' Clause:** \"It is sunny but cold\" uses contrast in English, but mathematically it is a Conjunction: $S \\wedge C$. \n• **The 'Inclusive Or' Trap:** If I ask \"Do you want cake or pie?\", human English implies you only get one. Mathematical $p \\vee q$ guarantees you can have *both* simultaneously. If you want exclusivity, you explicitly invoke Exclusve Or (XOR: $\\oplus$).",
      "### 3. Circuit Intuition: Logic in Hardware",
      "Logic isn't just a word game—it is a physical mechanism. Computer Science translates $p$ and $q$ directly into electrical voltage (True = High Voltage, False = Ground). By wiring millions of these logic gates together, you build the processors powering your device right now.",
      "• **Conjunction ($p \\wedge q$)** acts exactly like two electrical switches wired in **Series**. If either switch breaks, the entire wire goes dead.",
      "• **Disjunction ($p \\vee q$)** acts exactly like two switches wired in **Parallel**. The current will happily bypass a broken switch if the parallel route is closed."
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Categorizing Results: Truth Table Terminology',
        body: "Once you build a truth table for an argument, the final column determines the absolute nature of the statement. Memorize these three categories:\n\n• **Tautology:** A perfectly bulletproof statement that is *always True* regardless of what happens in reality (e.g. $p \\vee \\neg p$). The final column is exclusively entirely 'T's.\n• **Contradiction:** An impossible statement that is mathematically *always False* (e.g. $p \\wedge \\neg p$). The final column is entirely 'F's.\n• **Contingency:** A statement that is sometimes True and sometimes False, depending entirely on the variables (a mix of T and F).",
      },
      {
        type: 'warning',
        title: '💡 Pro-Tip for the Vacuous Truth Trap',
        body: "Remember the original promise: \"If you get an A (P), I'll buy you a car (Q).\"\n\nIf you get a B ($\\neg P$), the \"If\" part is False.\nIn logic, **if the \"If\" part is False, the whole statement $p \\rightarrow q$ is Automatically True.**\n\nThis is why buying the car anyway isn't a \"lie\"—the condition for the promise was never met, so the promise was never broken!",
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
      "Now we arrive at the art of the **Formal Proof**. A proof is a flawless, unbroken chain of logical implications ($p \\implies q \\implies r$) that guarantees truth. Before you can prove any algebraic statements, you must establish strict logical definitions.",
      "**Even Integer:** An integer $n$ is even if $n=2k$ for some integer $k$.\n**Odd Integer:** An integer $n$ is odd if $n=2k+1$ for some integer $k$.\n**Consecutive Integers:** Represented mathematically as $n$ and $n+1$.",
      "There are essentially three logic templates we use to attack arguments."
    ],
    callouts: [
      {
        type: 'definition',
        title: '1. Direct Proof',
        body: "The sledgehammer approach. Assume your premise $p$ is True. Keep applying known algebraic definitions (like Even/Odd) step-by-step in a forward direction until you undeniably arrive at $q$.",
      },
      {
        type: 'insight',
        title: '2. Proof by Contrapositive',
        body: "Leveraging Logical Equivalence! Proving \"If $x^2$ is even, then $x$ is even\" is incredibly annoying because working backward from square roots is messy. However, $p \\implies q$ is mathematically identical to its Contrapositive: $\\neg q \\implies \\neg p$.\n\nInstead, we prove: \"If $x$ is ODD, then $x^2$ is ODD.\" Because this is much easier to prove directly, proving it mathematically proves original statement by proxy!",
      },
      {
        type: 'definition',
        title: '3. Proof by Contradiction',
        body: "The trap. You assume the very thing you are trying to prove is actually FALSE. You then relentlessly trace the logic from this fake premise until reality explicitly breaks (e.g., finding a statement that evaluates as a Contradiction). Because reality cannot break, your assumption must have been wrong, meaning your original statement MUST be true.",
      }
    ],
    visualizations: []
  },

  examples: [
    {
      id: 'discrete-1-01-ex0',
      title: 'The Translation Bridge Challenge',
      problem: "\\text{We will use two base propositions: } p\\text{: \"It is raining.\"} \\quad q\\text{: \"The ground is wet.\"}\\text{Translate the 4 sentences below into logic.}",
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
      title: 'Worked Proof: Direct',
      problem: '\\text{Prove: If } a \\text{ and } b \\text{ are even integers, then } (a + b) \\text{ is even.}',
      steps: [
        { expression: '\\text{Assume } a \\text{ and } b \\text{ are even.}', annotation: 'Establish the explicit premise.' },
        { expression: '\\text{By definition, } a = 2k \\text{ and } b = 2j \\text{ for some integers } k, j.', annotation: 'Convert the English word "even" into strict algebraic notation.' },
        { expression: 'a + b = 2k + 2j', annotation: 'Substitute our new mathematical definitions into the target expression.' },
        { expression: 'a + b = 2(k + j)', annotation: 'Factor out the 2.' },
        { expression: '\\text{Let } m = (k + j). \\text{ Since integers added together make an integer, } m \\text{ is an integer.}', annotation: 'Close the loop strictly. We created a new solid integer m.' },
        { expression: 'a + b = 2m', annotation: 'Since (a+b) equals exactly 2 times an integer, it perfectly matches the definition of an even number.' }
      ],
      conclusion: 'By strictly defining Even numbers using $2k$, we directly chained logic forward to prove $p \\implies q$.'
    },
    {
      id: 'discrete-1-01-ex2',
      title: 'Worked Proof: Contrapositive',
      problem: '\\text{Prove: If } 3n + 2 \\text{ is odd, then } n \\text{ is odd.}',
      steps: [
        { expression: '\\text{Original statement: } p \\implies q \\text{ where } p = (3n+2 \\text{ is odd}), q = (n \\text{ is odd})', annotation: 'If we try to prove this directly, starting with (3n+2 = 2k+1) makes isolating n messy with fractions.' },
        { expression: '\\text{Contrapositive: } \\neg q \\implies \\neg p \\text{ (If } n \\text{ is even, then } 3n+2 \\text{ is even)}', annotation: 'We construct the algebra trick contrapositive because proving things from "n=" is much easier.' },
        { expression: '\\text{Assume } n \\text{ is even. Therefore, } n = 2k \\text{ for an integer } k.', annotation: 'Start the direct proof of the contrapositive scenario using the formal equations.' },
        { expression: '3n + 2 = 3(2k) + 2', annotation: 'Substitute 2k into our target.' },
        { expression: '3n + 2 = 6k + 2 = 2(3k + 1)', annotation: 'Factor out a 2 from the entire expression.' },
        { expression: '2(\\text{integer}) \\implies \\text{Even.}', annotation: 'Since it is 2 multiplied by an integer, 3n+2 is definitively EVEN.' }
      ],
      conclusion: 'By proving that an EVEN $n$ always results in an EVEN outcome, we successfully proved the contrapositive ($\\neg q \\implies \\neg p$). By proxy, $p \\implies q$ is true!'
    }
  ],

  challenges: [
    {
      id: 'discrete-1-01-ch1',
      difficulty: 'easy',
      problem: 'What is the logical status of the statement: $p \\vee \\neg p$?',
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
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
  ],
}

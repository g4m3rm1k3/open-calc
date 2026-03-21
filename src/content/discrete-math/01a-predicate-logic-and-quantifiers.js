export default {
  id: 'discrete-1-01a',
  slug: 'predicate-logic-and-quantifiers',
  chapter: 'discrete-1',
  order: 2,
  title: 'Predicate Logic and Quantifiers',
  subtitle: 'From propositional truth to Universal Laws',
  tags: ['predicate logic', 'quantifiers', 'forall', 'exists', 'nested quantifiers'],
  aliases: 'first order logic quantified statements quantifier negation domain of discourse',

  hook: {
    question: 'If I say "Someone in this room is a spy," how many people do I need to check to prove it true? What if I say "EVERYONE in this room is a spy"?',
    realWorldContext: 'In propositional logic, statements are completely rigid: "It is raining" is either True or False. But what if we want to express a concept about an entire database of a million users? We cannot manually write 1,000,000 separate "AND" statements. Predicate logic introduces Variables (x) and Quantifiers (∀, ∃)—the foundational mathematics behind SQL databases, search algorithms, and writing absolute proofs for infinite numbers.',
    previewVisualizationId: 'QuantifierGridLab',
  },

  intuition: {
    prose: [
      '### 1. Foundations: Predicates and Domains',
      'A **Predicate** P(x) is essentially a function that returns True or False. It is a "statement template" that is incomplete until you plug a specific object into the variable x.',
      '• **Example:** Let P(x) be "x is an even number".',
      'If you plug in x=4, P(4) becomes "4 is an even number" (True). If x=5, P(5) evaluates to False. Until x is defined, P(x) has no truth value!',
      'The **Domain of Discourse** (or Universe) is the specific set of all possible values that x is allowed to be. If your Domain is "All positive integers", playing x=−5 is an illegal move that mathematically crashes the system. Always look for the Domain first.',
      '### 2. The Quantifiers (∀ and ∃)',
      'To turn a floating Predicate P(x) into a hard mathematical proposition, we attach a **Quantifier** to bind the variable. There are exactly two rulers of the logical universe:',
      '• **The Universal Quantifier (∀):** "For All". Evaluates as True ONLY if P(x) is True for every single item in the entire Domain. It is the equivalent of a massive chained AND statement: P(1) ∧ P(2) ∧ P(3)...',
      '• **The Existential Quantifier (∃):** "There Exists". Evaluates as True if P(x) is True for *at least one* item in the Domain. It is the equivalent of a massive chained OR statement: P(1) ∨ P(2) ∨ P(3)...'
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The Sledgehammer vs. The Sniper',
        body: 'Proving a ∀ (Universal) statement requires a **Sledgehammer**. You must prove it works generically for an arbitrary value "k", because missing even a single item destroys the entire claim.\n\nProving a ∃ (Existential) statement only requires a **Sniper**. You do not need a generic proof—you just need to find ONE single specific example (a "Witness") that triggers True, and the whole statement mathematically wins.'
      }
    ],
    visualizations: [
      {
        id: 'QuantifierGridLab',
        title: 'Variable Binding: The Quantifier Grid',
        caption: 'Interact with the grid of objects to see how ∀ demands perfect total compliance, while ∃ is instantly satisfied by a single glowing node.'
      },
      {
        id: 'DomainExplorerLab',
        title: 'The Multi-Verse Viewer',
        caption: 'Change the universe from Naturals to Reals to an Empty Set, and watch mathematical Truth flip immediately even though the formula never changed.'
      }
    ]
  },

  math: {
    prose: [
      '### 3. Nested Quantifiers (The Order Dictates Reality)',
      'When you have multiple variables (like an x and a y), adding multiple quantifiers creates a nested scope. **The order in which you read them completely changes the meaning of the universe!**',
      'Let the Domain be "All people". Let Loves(x, y) mean "Person x loves Person y".',
      '• **∀x ∃y Loves(x, y)** translates left-to-right as: "For every person x, there exists some person y, such that x loves y." (Everyone loves *somebody*. A completely normal world.)',
      '• **∃y ∀x Loves(x, y)** translates exactly as: "There exists some specific person y, such that for every person x, x loves y." (There is ONE specific mega-celebrity that *everyone* secretly loves. A completely different world!)',
      'Always read nested statements strictly outward-in, matching the algebraic variables physically left-to-right.'
    ],
    callouts: [
      {
        type: 'warning',
        title: '⚠️ The Scope Trap (Free vs. Bound)',
        body: 'A variable is **Bound** if a Quantifier has claimed it (e.g., ∀x P(x) means x is safely locked away). A variable is **Free** if it is floating outside a quantifier\'s reach. You cannot evaluate a statement to True or False if it still contains Free variables!'
      },
      {
        type: 'insight',
        title: 'The Implicit "For All" Trap',
        body: 'In calculus, if a textbook says "If x is even, x² is even", beginners often miss that there is a **Hidden Universal Quantifier** secretly protecting the statement. The true mathematical structure is always actually ∀x (Even(x) → Even(x²)).'
      }
    ],
    visualizations: [
      {
        id: 'BipartiteQuantifierViz',
        title: 'Unraveling Nested Scopes',
        caption: 'See the radical difference between ∀x ∃y (everyone finds somebody) and ∃y ∀x (there is one fixed person that everyone finds).'
      }
    ]
  },

  rigor: {
    prose: [
      '### 4. Quantifier Negation (The Core Strategy)',
      'What happens when you try to deny a quantified claim? Negating quantified statements is a core survival skill in discrete math proofs.',
      'If I claim: "Every computer here is a Mac." ∀x Mac(x). How do you prove me a liar? You **don\'t** need to prove that "Every computer here is a PC". You only need to find **ONE single computer** that is absolutely not a Mac!',
      'Therefore, ¬(∀x P(x)) mathematically flips over into ∃x ¬P(x).',
      'The exact reverse is true! If I claim: "There is a spy in this room." ∃x Spy(x). To prove me a liar, you must mathematically prove that **EVERY SINGLE PERSON** in the room is Not a Spy. Therefore, ¬(∃x P(x)) securely flips over into ∀x ¬P(x).'
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'De Morgan\'s Laws for Quantifiers',
        body: 'When dragging a negation operator (¬) past a quantifier, you must exactly FLIP the quantifier, and then apply the negation directly to the inner Predicate.\n\n• ¬(∀x P(x)) ≡ ∃x (¬P(x))\n• ¬(∃x P(x)) ≡ ∀x (¬P(x))\n\nRemember: Because ∀ is just an infinite AND, and ∃ is just an infinite OR, this perfectly mirrors standard De Morgan\'s Law!'
      }
    ],
    visualizations: []
  },

  examples: [
    {
      id: 'discrete-1-01a-ex1',
      title: 'Worked Proof: Negating Nested Quantifiers',
      problem: '\\text{Negate the mathematical definition of a limit: } \\forall \\varepsilon > 0, \\exists \\delta > 0, \\forall x \\in \\mathbb{R}, (0 < |x - c| < \\delta \\implies |f(x) - L| < \\varepsilon)',
      steps: [
        { expression: '\\neg (\\forall \\varepsilon > 0, \\exists \\delta > 0, \\forall x \\in \\mathbb{R}, P(x))', annotation: 'Step 1: Wrap the entire colossal statement in a single outer Negation bracket.' },
        { expression: '\\exists \\varepsilon > 0, \\neg (\\exists \\delta > 0, \\forall x \\in \\mathbb{R}, P(x))', annotation: 'Step 2: Push the ¬ past the first ∀, flipping it strictly into an ∃ quantifier.' },
        { expression: '\\exists \\varepsilon > 0, \\forall \\delta > 0, \\neg (\\forall x \\in \\mathbb{R}, P(x))', annotation: 'Step 3: Push the ¬ past the second ∃, flipping it strictly into a ∀ quantifier.' },
        { expression: '\\exists \\varepsilon > 0, \\forall \\delta > 0, \\exists x \\in \\mathbb{R}, \\neg (P(x))', annotation: 'Step 4: Push the ¬ past the final ∀, flipping it to ∃. The negator now rests perfectly against the inner predicate!' },
        { expression: '\\neg (0 < |x-c| < \\delta \\implies |f(x)-L| < \\varepsilon)', annotation: 'Step 5: Now we must negate the actual P(x) conditional statement.' },
        { expression: '0 < |x-c| < \\delta \\wedge |f(x)-L| \\ge \\varepsilon', annotation: 'The Smoking Gun: Denying "If A then B" implicitly means asserting "A happens AND B strictly fails to happen".' }
      ],
      conclusion: 'By methodically pushing the ¬ operator inward and flipping every quantifier it touches, we effortlessly found the mechanical definition of a limit failing.'
    },
    {
      id: 'discrete-1-01a-ex2',
      title: 'Worked Proof: Existential Witness (The Sniper)',
      problem: '\\text{Prove: } \\exists n \\in \\mathbb{Z} \\text{ such that } n^2 + n = 6',
      steps: [
        { expression: '\\text{We must find ONE explicit integer } n \\text{ that satisfies the predicate.}', annotation: 'The Strategy: This is an Existential (∃) claim. We do not need general formulas; we just need a single numeric bullet.' },
        { expression: '\\text{Let } n = 2.', annotation: 'The Witness: We isolate a specific target from the Domain of Discourse.' },
        { expression: '(2)^2 + (2)', annotation: 'The Transformation: Plug our witness n=2 exactly into the predicate machinery.' },
        { expression: '= 4 + 2', annotation: 'Algebraic calculation.' },
        { expression: '= 6', annotation: 'The Victory: The expression perfectly evaluates to 6, confirming our specific witness.' }
      ],
      conclusion: 'By explicitly providing n=2 (a valid integer), we satisfied the Predicate once. Because ∃ only demands a single success, the entire statement is absolutely proven true.'
    }
  ],

  challenges: [
    {
      id: 'discrete-1-01a-ch1',
      difficulty: 'easy',
      problem: 'Translate the English sentence "Every student has at least one favorite course" rigidly into First-Order Predicate Logic.',
      hint: 'Determine the domains. You need a Universal quantifier for "Every" targeting Students, and an Existential quantifier for "at least one" targeting Courses.',
      walkthrough: [
        { expression: '\\forall s \\in \\text{Students}', annotation: 'We cover the entire domain of Students.' },
        { expression: '\\exists c \\in \\text{Courses}', annotation: 'We demand there exists at least one course for whichever student `s` we grabbed.' },
        { expression: '\\text{Favors}(s, c)', annotation: 'The inner mathematical predicate binds them together.' }
      ],
      answer: '\\forall s \\in \\text{Students}, \\exists c \\in \\text{Courses}, \\text{Favors}(s, c)'
    },
    {
      id: 'discrete-1-01a-ch2',
      difficulty: 'medium',
      problem: 'If the Domain is "All Real Numbers", determine if this statement is True or False: $\\forall x \\exists y (x+y=0)$',
      hint: 'Read it left to right. Grab ANY number x. Can you always find a specific y to cancel it back to zero?',
      walkthrough: [
        { expression: '\\text{For any arbitrary real number } x...', annotation: 'The Sledgehammer premise.' },
        { expression: '\\text{Let } y = -x.', annotation: 'The Witness response. Because -x is always a Real Number, it is a valid choice.' },
        { expression: 'x + (-x) = 0', annotation: 'The condition undeniably satisfies the predicate zero sum.' }
      ],
      answer: 'True. For every single number, you can always just pick its exact negative inverse to cancel it out.'
    }
  ],

  crossRefs: [
    { lessonSlug: 'propositions-and-proof-techniques', label: 'Propositions and Proof Techniques', context: 'Predicate logic acts as the massive parent wrapper over standard propositional operators.' },
    { lessonSlug: 'relations-and-structures', label: 'Relations and Structures', context: 'Database queries and mathematical relation properties (like transitivity) are encoded using nested predicates.' }
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'attempted-challenge-easy',
    'attempted-challenge-medium'
  ]
};

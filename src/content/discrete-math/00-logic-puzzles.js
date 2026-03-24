export default {
  id: 'discrete-1-00',
  slug: 'pigeonhole-principle',
  chapter: 'discrete-1',
  order: 0,
  title: 'The Pigeonhole Principle',
  subtitle: 'The undeniable power of pure counting',
  tags: ['logic', 'discrete', 'pigeonhole', 'proofs', 'puzzles', 'compression limit'],

  hook: {
    question: "Imagine you are blindfolded in a room. In a drawer, there are 10 black socks and 10 white socks completely mixed together. How many socks must you pull out to **guarantee** you have a matching pair?",
    realWorldContext: "This sounds like a riddler's game, but it is the absolute foundation of Discrete Mathematics. It is the mathematical proof behind why lossless data compression (like `.zip` files) cannot mathematically compress every single file indefinitely, and why there **must** exist at least two people in London right now with the exact same number of hairs on their head.",
    previewVisualizationId: 'PigeonholeViz',
  },

  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          "Most people guess they need to pull out 11 socks to guarantee a pair. But think about it very carefully:",
          "You pull out one sock. It's black. You pull out a second sock. It's white.",
          "You are now holding one black sock and one white sock. What happens when you pull out the **third** sock?",
          "It MUST be either black or white! Whichever color it is, it will form a matching pair with one of the two you are already holding. You only need to pull out 3 socks to guarantee a pair."
        ]
      },
      {
        type: 'callout',
        title: 'Boxes and Pigeons',
        body: "Instead of socks, think of \"Colors\" as \"Boxes\". There are only 2 boxes (Black and White). The socks you draw are \"Pigeons\". If you put 3 Pigeons into 2 Boxes, one box is absolutely forced to hold more than 1 pigeon.",
        type: 'insight'
      }
    ],
    visualizations: [
      {
        id: 'PigeonholeViz',
        title: 'The Inevitability Engine',
        caption: 'Try to place more items than there are holes. No matter how you distribute them, the universe forces a collision. Math prevents you from finding a loophole.',
      },
      {
        id: 'PigeonHoleDemo',
        title: 'Pigeonhole Sandbox (Second Perspective)',
        caption: 'A second perspective: toggle presets, drop pigeons, and watch collisions emerge from counting constraints in real time.',
      }
    ]
  },

  math: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          "Calculus relies on infinity, fractions, and smooth slopes. Discrete math relies on things that **cannot be divided**: integers, networks, and logic gates.",
          "Mathematical puzzles train your brain to write rigorous proofs by forcing you to identify the abstract 'Pigeonholes' in a seemingly chaotic scenario."
        ]
      },
      {
        type: 'callout',
        title: 'The Pigeonhole Principle (Formal)',
        body: "If k items are put into n containers, and k > n, then at least one container must contain strictly more than one item.",
        type: 'theorem'
      },
      {
        type: 'callout',
        title: 'The Generalized (Strong) Pigeonhole Principle',
        body: "If k items are put into n containers, then at least one container must contain at least $\\lceil k / n \\rceil$ items. *(The ceiling bracket $\\lceil \\dots \\rceil$ means \"round up to the nearest whole number\").*",
        type: 'theorem'
      }
    ]
  },

  rigor: {
    blocks: [
      {
        type: 'stepthrough',
        title: 'Proof by Contradiction',
        steps: [
          { expression: "\\text{Assume } k > n \\text{ items are placed in } n \\text{ containers.}", annotation: "Step 1: Set up the premise." },
          { expression: "\\text{Suppose for contradiction: NO container has more than } 1 \\text{ item.}", annotation: "Step 2: We pretend the principle is false to see if math breaks. This means every container has 0 or 1 items." },
          { expression: "\\text{Max total items} = n \\times 1 = n", annotation: "Step 3: If 1 is the absolute maximum per container, the most items we could possibly have across all containers is n." },
          { expression: "k \\le n", annotation: "Step 4: Therefore, the total items k must be less than or equal to n." },
          { expression: "k \\le n \\quad \\text{CONTRADICTS} \\quad k > n", annotation: "Step 5: But our very first rule was that k > n! The universe has crashed. The math is broken." },
          { expression: "\\therefore \\text{Our supposition was false.}", annotation: "Conclusion: It is utterly impossible for all containers to have 1 or 0 items. At least one MUST have 2 or more." }
        ]
      }
    ]
  },

  examples: [
    {
      id: 'discrete-1-00-ex1',
      title: 'Hairs in London',
      problem: "\\text{Prove that there must be at least two people in London with the EXACT same number of hairs on their head.}",
      steps: [
        { expression: "\\text{Max hairs on a human head} \\approx 300,000", annotation: "Scientific upper limit of hair follicles for a human being." },
        { expression: "\\text{Number of 'Holes' } (n) = 300,000", annotation: "Think of every possible hair count (0, 1, 2... 300k) as a distinct box." },
        { expression: "\\text{Population of London} = 9,000,000", annotation: "The total number of people ('Pigeons')." },
        { expression: "\\text{Number of 'Pigeons' } (k) = 9,000,000", annotation: "We are stuffing 9 million people into 300k distinct hair-count boxes." },
        { expression: "9,000,000 > 300,000 \\implies k > n", annotation: "Since Pigeons > Holes, at least one box is forced to have multiple people in it!" }
      ],
      conclusion: 'Without checking a single head in London, mathematics guarantees absolutely that at least two people have identical hair counts. In fact, by the Generalized Principle, at least 30 people share the exact same count! (9,000,000 / 300,000 = 30).'
    },
    {
      id: 'discrete-1-00-ex2',
      title: 'The Birthday Guarantee (Absolute)',
      problem: "\\text{How many people must you invite to a party to GUARANTEE that two people share the same birthday?}",
      steps: [
        { expression: "\\text{Possible Birthdays } = 366 \\text{ (including Feb 29)}", annotation: "These are the 'Holes'. There are 366 distinct boxes." },
        { expression: "\\text{We need } k > n \\implies k > 366", annotation: "To force a collision, we simply need one more pigeon than holes." },
        { expression: "k = 367", annotation: "If you have 367 people, it is mathematically impossible for all of them to have a unique birthday." }
      ],
      conclusion: 'Notice the difference between Discrete Math and Probability. In probability, you only need 23 people for a 50% *chance* of a shared birthday. But in Discrete Math proofs, we deal with 100% absolutes. 367 people GUARANTEES it.'
    },
    {
      id: 'discrete-1-00-ex3',
      title: 'The Inevitable Friendship',
      problem: "\\text{Show that at any party with 2 or more people, there are ALWAYS two people with the exact same number of friends at that party.}",
      steps: [
        { expression: "\\text{Let } P \\text{ be the number of people at the party.}", annotation: "Assume friendship is mutual (if I am your friend, you are mine)." },
        { expression: "\\text{Possible friend counts for one person} = {0, 1, 2, \\dots, P-1}", annotation: "A person can be friends with nobody (0), or everybody else (P-1)." },
        { expression: "\\text{Wait... can a person have 0 friends AND another have } P-1 \\text{ friends?}", annotation: "If someone is friends with EVERYONE (P-1), then nobody can have 0 friends! Because the popular person is friends with them." },
        { expression: "\\text{Therefore, 0 and P-1 cannot be options at the SAME time.}", annotation: "This means the available options for friend counts is actually only (P-1) options!" },
        { expression: "\\text{Holes } (n) = P - 1", annotation: "The number of distinct friend-counts available is strictly P-1." },
        { expression: "\\text{Pigeons } (k) = P", annotation: "Since there are P people, and only P-1 possible counts... a collision is inevitable." }
      ],
      conclusion: 'By looking deeply at the boundaries (0 and P-1 cannot coexist), we reduced the number of "Holes" to be less than the number of "Pigeons". A brilliant abstract application!'
    }
  ],

  challenges: [
    {
      id: 'discrete-1-00-ch1',
      difficulty: 'easy',
      problem: 'You have 13 pairs of socks (26 socks total), all mixed in a dark drawer. How many socks guarantee at least one matching pair?',
      walkthrough: [
        { expression: 'Holes = 13 possible sock types (each pair type)', annotation: 'Model each type as a hole.' },
        { expression: 'To avoid a match as long as possible, draw one from each type => 13 socks', annotation: 'Worst-case no-match scenario.' },
        { expression: 'One more draw forces a collision by pigeonhole', annotation: 'k=n+1 guarantees repeat.' },
      ],
      answer: '14 socks',
    },
    {
      id: 'discrete-1-00-ch2',
      difficulty: 'medium',
      problem: 'Show that in any set of 6 integers, two have the same remainder mod 5.',
      walkthrough: [
        { expression: 'Remainders mod 5 are only {0,1,2,3,4}', annotation: 'Exactly 5 remainder classes.' },
        { expression: 'Choose 6 integers as pigeons into 5 remainder holes', annotation: 'Setup for direct pigeonhole.' },
        { expression: 'Since 6>5, at least one remainder class has at least 2 integers', annotation: 'Collision gives equal remainder.' },
      ],
      answer: 'Guaranteed by pigeonhole with 6 pigeons and 5 remainder classes.',
    },
    {
      id: 'discrete-1-00-ch3',
      difficulty: 'hard',
      problem: 'In any group of 9 people, prove that at least 5 were born in the same half of the year (Jan-Jun or Jul-Dec).',
      walkthrough: [
        { expression: 'Holes = 2 halves of the year', annotation: 'Jan-Jun and Jul-Dec.' },
        { expression: 'Generalized pigeonhole: at least ceil(9/2)=5 in one hole', annotation: 'Strong form with ceilings.' },
        { expression: 'Therefore one half-year contains at least 5 birthdays', annotation: 'Direct consequence.' },
      ],
      answer: 'At least 5 by the generalized pigeonhole principle.',
    },
    {
      id: 'discrete-1-00-ch4',
      difficulty: 'hard',
      problem: 'Puzzle: You hash 1,001 keys into 1,000 buckets. Explain what collision guarantee you get and why this matters for DSA hash tables.',
      walkthrough: [
        { expression: 'Buckets are holes (n=1000), keys are pigeons (k=1001)', annotation: 'Model hash insertions.' },
        { expression: 'Since k>n, at least one bucket has at least 2 keys', annotation: 'Collision is mathematically unavoidable.' },
        { expression: 'This is why hash-table design focuses on collision handling, not collision elimination', annotation: 'DSA consequence.' },
      ],
      answer: 'At least one collision is guaranteed.',
    },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
};

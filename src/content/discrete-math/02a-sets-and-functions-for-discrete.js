export default {
  id: 'discrete-1-02a',
  slug: 'sets-and-functions-for-discrete',
  chapter: 'discrete-1',
  order: 3,
  title: 'Sets and Functions for Discrete Math',
  subtitle: 'The fundamental data structures of mathematical reality',
  tags: ['sets', 'subsets', 'power set', 'cartesian product', 'functions', 'injective', 'surjective', 'bijective'],
  aliases: 'set operations cartesian product function mapping injective surjective bijective',

  hook: {
    question: 'Before writing an algorithm, you must explicitly define exactly what data is allowed into the system, and exactly how the system reacts to it. How do mathematicians define "valid data"?',
    realWorldContext: 'Sets and functions are the grammatical backbone of modern Computer Science. Relational databases, API endpoints, hardware pipelines, and object-oriented architectures completely rely on Set Theory (defining strict groups of data) and Function Mappings (strict rules for converting inputs into predictable outputs).',
    previewVisualizationId: 'FunctionMappingLab',
  },

  intuition: {
    prose: [
      '### 1. The Anatomy of a Set',
      'A **Set** is just a bag or a box of unique objects. It is the absolute simplest data structure in existence.',
      'There is no "order" inside a set, and there are absolutely no "duplicates". The set {1, 2, 3} is mathematically completely identical to {3, 1, 2} and {1, 1, 2, 3}.',
      '### 2. The "Nothing" Box (Empty Sets)',
      'Beginners often struggle with the concept of "Nothing" existing as an actual object. Think of a set as an Amazon shipping box.',
      '• **∅** (The Empty Set) is an empty, folded cardboard box. It contains literally nothing. Its cardinality is 0.',
      '• **{∅}** is a box that contains an empty box stacked inside of it! It is mathematically NOT empty! Its cardinality (size) is precisely 1.',
      'In Computer Science, this is the exact same strict difference between a totally `null` variable and an empty array `[]`.',
      '### 3. Set Algebra (Database Operations)',
      '**Set Algebra** is how we mechanically filter these bags of data. Almost every SQL database query identically leverages these exact operations:',
      '• **Intersection (A ∩ B):** The Database INNER JOIN. Filtering for "Users who live in NY" AND "Users who bought a shirt" strictly extracts the data surviving in the overlap.',
      '• **Union (A ∪ B):** Matches the Logical OR (∨). Combine everything from both bags into one massive query group.',
      '• **Complement (Aᶜ):** Matches the Logical NOT (¬). Select absolutely everything in the local Universe that is NOT inside bag A.',
      '### 4. The Math Recipe (Set-Builder Notation)',
      'Beginners can easily handle reading {1, 2, 3}, but they instantly freeze when they see the algebraic: {x ∈ ℤ | x² < 10}.',
      'Think of it strictly as a **Filter Recipe**: ',
      '1. **The Ingredients:** The first part (x ∈ ℤ) tells you exactly what Universe of items you are allowed to test (Integers).',
      '2. **The Sieve:** The second part (x² < 10) is the strict conditional rule. Any integer whose square is less than 10 survives the filter and drops into the final Set bag!'
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The Domain Cheat Sheet',
        body: '**The Domain Cheat Sheet:**\nBecause logic frequently evaluates number systems, you should memorize these Universe symbols before we continue:\n| Symbol | Name | What it means |\n|---|---|---|\n| ∈ | "In" | Means "is an element of" (e.g., x ∈ ℤ means x lives in the Integers). |\n| ℕ | Naturals | The counting numbers: 0, 1, 2, 3... |\n| ℤ | Integers | All whole numbers, including negatives: ...-2, -1, 0, 1, 2... |\n| ℚ | Rationals | Any number that can perfectly be expressed as a fraction. |\n| ℝ | Reals | Absolutely every number on the continuous number line, including decimals. |'
      },
      {
        type: 'definition',
        title: 'Proper Subset (⊂) vs Subset (⊆)',
        body: 'The difference perfectly mirrors "strictly less than" (<) versus "less than or equal to" (≤).\n\n| Symbol | Name | Meaning |\n|---|---|---|\n| ⊆ | Subset | A is contained in B, but they might theoretically be the exact same set. (A ≤ B) |\n| ⊂ | Proper Subset | A is completely swallowed by B, but B is strictly larger. (A < B) |\n\nYou are a proper subset of your family, but mathematically, you are a regular subset of yourself!'
      },
      {
        type: 'definition',
        title: 'Cardinality |A|',
        body: 'Cardinality is just the "Size" or "Length" of a Set (how many distinct items are inside the bag). If A = {x, y, z}, then |A| = 3. The cardinality of the Empty Set |∅| is simply 0.'
      }
    ],
    visualizations: [
      {
        id: 'SetExplorer',
        title: 'Set Algebra Interactive Filter',
        caption: 'Click through the strict mathematical filters to see exactly what combinations of data survive the operation.'
      },
      {
        id: 'SetBuilderDecoderLab',
        title: 'Set-Builder Notation Syntax Decoder',
        caption: 'Hover over the symbols to instantly translate the dense mathematical grammar into plain English filter logic.'
      }
    ]
  },

  math: {
    prose: [
      '### 5. The Power Set',
      'If you have a set A = {Apple, Banana}, what happens if we want a master list of all possible "combo meals" we could create from it?',
      'The **Power Set P(A)** is exactly that: a massive set containing *every possible subset* generated from the original items.',
      'The combo meals for A would be: {Apple, Banana}, {Apple}, {Banana}, and finally ∅ (the empty set, representing you ordering literally nothing).',
      '### 6. The Grid Creator (Cartesian Product)',
      'What if you have Set A = {Shirts, Pants} and Set B = {Red, Blue}? How do you mathematically generate every possible outfit combo?',
      'The Cartesian Product (A × B) is structurally a **2D Coordinate Grid**. Every item in Set A is dragged against every single item in Set B, creating strictly structured points (x, y).',
      'This is incredibly important because every "Relation" and "Function" you will ever construct mathematically lives perfectly as a subset hiding inside this massive combinatorial Grid!',
      '### 7. The Function Machine (f: X → Y)',
      'A Function is an industrial machine that eats an input from Domain X, grinds it up, and spits out an output into Codomain Y.',
      'It has only **ONE STRICT RULE**: The machine cannot be broken. If you pump the number 5 into the machine, it must spit out a single specific answer (e.g., 25). It cannot spit out 25 sometimes and -25 other times. That breaks functional predictability!'
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Power Set Cardinality',
        body: 'If a finite set A has a size of n, then its Power Set P(A) has a size of exactly 2^n.\n\nThink of it efficiently: When building a combo meal from 4 possible ingredients, every single ingredient independently flips a binary coin (IN or OUT). That is 2 × 2 × 2 × 2 = 16 combinations!'
      }
    ],
    visualizations: [
      {
        id: 'PowerSetTreeLab',
        title: 'The Binary Choice Explosion',
        caption: 'For every element you evaluate, the timeline splits. Branching all possible "Keep" or "Drop" decisions mathematically generates every single subset.'
      },
      {
        id: 'CartesianGridLab',
        title: 'The Cartesian Space',
        caption: 'Watch how pairing completely independent variables builds an entire combinatorial geometry.'
      },
      {
        id: 'SetProofVisualizer',
        title: 'The Distributive Law Geometric Proof',
        caption: 'Toggle the algebraic equations algebraically. Notice how both logic flows physically mask the exact identical overlapping pixels.'
      }
    ]
  },

  rigor: {
    prose: [
      '### 8. Classifying the Machine (Injective, Surjective, Bijective)',
      'Programmers and mathematicians categorize functions based on how aggressively they attack the Codomain (the target Y outputs).',
      '• **Domain vs Range vs Codomain:** This is the biggest point of confusion for beginners! The Codomain is the entire theoretical **Goalie Net** where the ball *could* go. The Range (or Image) is only the specific spots inside the net where the ball *actually* hit. A function is ONLY Surjective if the Range perfectly covers the entire Codomain net.',
      '• **Injective (1-to-1):** Think: **Unique Database Hashing**. Every single input gets a completely unique ID output. If two users get the same exact output hash (a collision), the system breaks. Visually, this fails the horizontal line test! No two generic arrows arrive at identical targets.',
      '• **Surjective (Onto):** Think: **Resource CPU Allocation**. You have 5 tasks and 4 worker cores. The function is strictly Surjective if every single worker core (the target) receives at least one task. No idle workers are allowed!',
      '• **Bijective (Perfect Invertibility):** If a function is BOTH Injective and Surjective, it is Bijective. This creates a flawless 1:1 paired dance between Set X and Set Y. Because it is flawless, you can literally physically press the "Reverse" button on the machine and it will unwind backwards without throwing errors!',
      '### 9. Composition and Identity (The Assembly Line)',
      'Functions drastically scale in computational complexity because they can be mechanically chained perfectly together: **g ∘ f**.',
      'Think of an industrial Assembly Line. Function **f** builds the plastic toy. Function **g** paints the toy metallic blue.',
      'Order dictates reality! If you run **g ∘ f** (Evaluate f first), you successfully assemble the raw toy, then beautifully paint it. But if you accidentally run **f ∘ g** (Evaluate g first), you violently paint a bunch of raw unconnected plastic blocks, and *then* force them together later. Function Composition is brutally **Not Commutative**!',
      'Eventually, you will hit the absolute baseline: **f(x) = x**. Whatever input x you feed the machine, it spits out the exact same untouched x. This is the **Identity Function**. If you run a Bijective function entirely forward, and then throw it backwards into its mathematical Inverse, you will perfectly hit the Identity Function — because you literally just returned to exactly where you started!'
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Pigeonhole Intuition',
        body: 'If Domain X is massively larger than Codomain Y (e.g., 5 pigeons flying into 3 holes), the function can NEVER be Injective, because multiple arrows are absolutely forced to collide into the same target hole!\n\nConversely, if |X| is smaller than |Y|, the function can NEVER be Surjective, because you simply do not have enough mathematical ammunition to hit every available target.'
      },
      {
        type: 'warning',
        title: '⚠️ The Absolute Beginner Pitfalls',
        body: '• **{1, 2} ≠ (1, 2)**: A set { } is an unordered bag. A coordinate ( ) is an ordered pair. They are completely different species!\n• **0 ≠ ∅**: Zero is a mathematical number. The empty set is an actual physical container that happens to be empty.\n• **Range ⊆ Codomain**: Always remember that your function\'s Range can be smaller than the Codomain (Goalie net), but it can mathematically NEVER be larger!'
      },
      {
        type: 'insight',
        title: 'Looking Ahead: Hilbert\'s Hotel & Infinity',
        body: 'Here is a brain-teaser to prepare you for Countability later in Discrete Math:\n**Are there technically more Integers than Even Integers?**\n\nThe answer is shockingly NO! Because we can physically map $f(n) = 2n$ to permanently create a flawless Bijective bridge linking every single Integer 1:1 to every Even Integer, mathematicians correctly conclude that the two infinite sets are actually the exact identically same immense size ($\\aleph_0$)! Infinity acts deeply strange.'
      }
    ],
    visualizations: [
      {
        id: 'HorizontalLineTestLab',
        title: 'Horizontal Line Test Visualizer',
        caption: 'Slide the continuous horizontal sweeper up the axis to physically prove how the geometric coordinate grid traps non-injective function collisions.'
      },
      {
        id: 'FunctionMappingLab',
        title: 'The Mapping Matchmaker Mini-Game',
        caption: 'MISSION: The Boss wants a function that is strictly Surjective, but specifically NOT Injective! Try to trigger the Reverse gear and watch why the broken inversion algorithm explodes.'
      },
      {
        id: 'FunctionCompositionLab',
        title: 'The Assembly Line Sandbox',
        caption: 'Verify exactly why chaining mathematical operations backwards causes the algebraic output payload to violently corrupt.'
      }
    ]
  },

  examples: [
    {
      id: 'discrete-1-02a-ex1',
      title: 'Worked Proof: Counting the Infinite Subsets',
      problem: '\\text{Calculate the cardinality of the Power Set for } A = \\{1, 2, 3, 4\\}',
      steps: [
        { expression: '|A| = 4', annotation: 'Step 1: Extract the Cardinality (size) of the original base set.' },
        { expression: '|\\mathcal{P}(A)| = 2^4', annotation: 'The Power Set Rule: Every single item in the set has exactly 2 binary choices—either it is safely IN the subset, or it is safely OUT.' },
        { expression: '2 \\times 2 \\times 2 \\times 2 = 16', annotation: 'Expanding the exponential.' }
      ],
      conclusion: 'Because 4 separate numbers independently flipped a two-sided coin, there are 16 total mathematically valid subsets, including the massive 4-item original set and the 0-item Empty Set.'
    },
    {
      id: 'discrete-1-02a-ex2',
      title: 'Worked Proof: Testing Injectivity',
      problem: '\\text{Prove algebraically whether } f(n) = n^2 \\text{ is Injective across all Integers } \\mathbb{Z}.',
      steps: [
        { expression: '\\text{Injective Definition: } f(a) = f(b) \\implies a = b', annotation: 'The Strategy: To prove Injectivity, we assume the machine spit out the same exact output twice. We must then force the proof to show that the inputs MUST have been identical.' },
        { expression: 'a^2 = b^2', annotation: 'The Transformation: Plug arbitrary inputs a and b directly into the mechanical function.' },
        { expression: '\\sqrt{a^2} = \\sqrt{b^2}', annotation: 'Take the square root of both sides to attack the variables.' },
        { expression: '|a| = |b| \\implies a = \\pm b', annotation: 'The Explosion: Because of the absolute value rules of Algebra, a can equal positive b OR negative b!' },
        { expression: 'f(3) = 9 \\text{ and } f(-3) = 9', annotation: 'The Counterexample: We can easily fire input 3 and input -3 into the machine, and both arrows will absolutely collide on the target 9.' }
      ],
      conclusion: 'Because two completely distinct inputs collided mathematically onto the exact same output, the function is brutally NOT Injective (Not 1-to-1).'
    }
  ],

  challenges: [
    {
      id: 'discrete-1-02a-qz1',
      difficulty: 'easy',
      problem: 'Power Set Math: If an absolutely massive super-set has exactly 10 unique elements, how many possible subsets can you theoretically generate?',
      hint: 'Remember the Binary Choice exponential explosion!',
      walkthrough: [
        { expression: '2^{10}', annotation: 'Every element perfectly flips a binary Keep/Drop coin 10 independent times.' }
      ],
      answer: 'Exactly $1,024$ mathematically distinct subsets.'
    },
    {
      id: 'discrete-1-02a-qz2',
      difficulty: 'medium',
      problem: 'Injectivity Test: If every single citizen in the country is successfully mapped to their own completely unique Social Security Number, is that specific mapping Injective?',
      hint: 'Does any single SSN belong to two different people? (Are there any collisions?)',
      walkthrough: [
        { expression: 'f(\\text{Person A}) \\neq f(\\text{Person B})', annotation: 'By absolute federal law, two distinct people can never ever receive identical outputs.' }
      ],
      answer: 'Yes! It is flawlessly Injective. It is, however, technically NOT Surjective, because there are billions of valid 9-digit numbers that have never been issued to any citizen yet!'
    },
    {
      id: 'discrete-1-02a-qz3',
      difficulty: 'hard',
      problem: 'Prove algebraically using Double Inclusion that $A \\cap (B \\cup C) = (A \\cap B) \\cup (A \\cap C)$',
      hint: 'In set theory proofs, to prove a massive Set X = Set Y, you must prove that any random element dropping into X secretly lives in Y, and vice versa!',
      walkthrough: [
        { expression: '\\text{Assume } x \\in A \\cap (B \\cup C)', annotation: 'Start on the Left side. Pick an arbitrary element hiding inside it.' },
        { expression: 'x \\in A \\text{ AND } (x \\in B \\text{ OR } x \\in C)', annotation: 'Unpack the Set Algebra directly into Propositional Logic.' },
        { expression: '(x \\in A \\text{ AND } x \\in B) \\text{ OR } (x \\in A \\text{ AND } x \\in C)', annotation: 'Distribute the AND constraint perfectly across the OR bracket.' },
        { expression: 'x \\in (A \\cap B) \\cup (A \\cap C)', annotation: 'Repack the Logic directly back into Set Algebra formatting! The right side is verified.' }
      ],
      answer: 'True! By dropping the sets securely into Propositional Logic, we efficiently deployed the standard mathematical distribution law.'
    }
  ],

  crossRefs: [
    { lessonSlug: 'propositions-and-proof-techniques', label: 'Propositions and Proof Techniques', context: 'Set operations blindly obey all underlying propositional rules you mapped earlier.' },
    { lessonSlug: 'counting-and-combinatorics', label: 'Counting and Combinatorics', context: 'The bijective pairing and power sets are the absolute core of combinatorial analysis.' }
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

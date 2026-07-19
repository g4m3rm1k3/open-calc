import setOperationsVennUrl from '../diagrams/dm-set-operations-venn.svg?url'
import functionClassificationUrl from '../diagrams/dm-function-classification.svg?url'

export default {
  id: 'discrete-1-02a',
  slug: 'sets-and-functions-for-discrete',
  chapter: 'discrete-2',
  order: 0,
  title: 'Sets and Functions for Discrete Math',
  subtitle: 'The fundamental data structures of mathematical reality',
  tags: ['sets', 'subsets', 'power set', 'cartesian product', 'functions', 'injective', 'surjective', 'bijective'],
  aliases: 'set operations cartesian product function mapping injective surjective bijective',

  hook: {
    question: 'Before writing an algorithm, you must explicitly define exactly what data is allowed into the system, and exactly how the system reacts to it. How do mathematicians define "valid data"?',
    realWorldContext: 'Sets and functions are the grammatical backbone of modern Computer Science. Relational databases, API endpoints, hardware pipelines, and object-oriented architectures completely rely on Set Theory (defining strict groups of data) and Function Mappings (strict rules for converting inputs into predictable outputs).',
  },

  intuition: {
    prose: [
      '### 1. The Anatomy of a Set',
      'A **Set** is just a bag or a box of unique objects. It is the absolute simplest data structure in existence.',
      'There is no "order" inside a set, and there are absolutely no "duplicates". The set {1, 2, 3} is mathematically completely identical to {3, 1, 2} and {1, 1, 2, 3}.',
      '### 2. The "Nothing" Box (Empty Sets)',
      '"Nothing" existing as an actual object trips people up at first. Think of a set as a shipping box.',
      '• **∅** (The Empty Set) is an empty, folded cardboard box. It contains literally nothing. Its cardinality is 0.',
      '• **{∅}** is a box that contains an empty box stacked inside of it! It is mathematically NOT empty! Its cardinality (size) is precisely 1.',
      'In Computer Science, this is the exact same strict difference between a totally `null` variable and an empty array `[]`.',
      '### 3. Set Algebra (Database Operations)',
      '**Set Algebra** is how we mechanically filter these bags of data. Almost every SQL database query identically leverages these exact operations:',
      '• **Intersection (A ∩ B):** The Database INNER JOIN. Filtering for "Users who live in NY" AND "Users who bought a shirt" strictly extracts the data surviving in the overlap.',
      '• **Union (A ∪ B):** Matches the Logical OR (∨). Combine everything from both bags into one massive query group.',
      '• **Complement (Aᶜ):** Matches the Logical NOT (¬). Select absolutely everything in the local Universe that is NOT inside bag A.',
      `![Three Venn diagrams side by side: union (both circles shaded), intersection (only overlap shaded), complement (everything outside A shaded)](${setOperationsVennUrl})`,
      'Notice the shape of each operation before you memorize its symbol: union shades everything either circle touches, intersection shades only where they overlap, and complement shades everything *outside* the circle entirely — it doesn\'t reference B at all.',
      '### 4. The Math Recipe (Set-Builder Notation)',
      'Reading {1, 2, 3} is easy. The algebraic form {x ∈ ℤ | x² < 10} describes the same idea but tends to stall people the first time they see it.',
      'Think of it strictly as a **Filter Recipe**: ',
      '1. **The Ingredients:** The first part (x ∈ ℤ) tells you exactly what Universe of items you are allowed to test (Integers).',
      '2. **The Sieve:** The second part (x² < 10) is the strict conditional rule. Any integer whose square is less than 10 survives the filter and drops into the final Set bag!',
      'Quick precision pass: A <span class="tooltip" data-tooltip="A set is an unordered collection of distinct elements.">set</span> has <span class="tooltip" data-tooltip="Elements are members of a set. We write x ∈ S.">elements</span>, and a <span class="tooltip" data-tooltip="A function maps each input in the domain to exactly one output in the codomain.">function</span> classifies as <span class="tooltip" data-tooltip="Injective: distinct inputs map to distinct outputs.">injective</span>, <span class="tooltip" data-tooltip="Surjective: every codomain element is hit by at least one input.">surjective</span>, or <span class="tooltip" data-tooltip="Bijective: both injective and surjective.">bijective</span>.'
    ],
    checks: [
      {
        afterParagraph: 6,
        question: 'What is the cardinality of the set {∅}?',
        options: ['0', '1', '2', 'Undefined'],
        answer: '1',
        explanation: '{∅} is a box containing one item — an empty box. It is NOT empty itself, so its cardinality is 1, not 0.',
      },
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
      },
      {
        type: 'insight',
        title: 'Use the Guided Explorer as a Mini-Lesson',
        body: 'The added SetsAndFunctionsExplorer below is intentionally a second perspective. Use Set mode first, then Function mode. Try to create injective-only, surjective-only, and bijective mappings, then compare with the formal definitions in Rigor.'
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
      },
      {
        id: 'SetsAndFunctionsExplorer',
        title: 'Interactive Sets and Functions Lesson',
        caption: 'Second perspective: build sets and mapping arrows, then verify injective/surjective/bijective behavior live.',
        mathBridge: 'The interaction is designed to map directly onto the rigor definitions.',
        props: { guided: true, initialMode: 'sets' }
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
      'It has only **ONE STRICT RULE**: The machine cannot be broken. If you pump the number 5 into the machine, it must spit out a single specific answer (e.g., 25). It cannot spit out 25 sometimes and -25 other times. That breaks functional predictability!',
      'Vocabulary bridge: <span class="tooltip" data-tooltip="Cardinality |S| is the number of elements in a finite set.">cardinality</span> measures set size. The <span class="tooltip" data-tooltip="Image f(A) is the set of outputs actually produced.">image</span> is what the function actually hits, while the <span class="tooltip" data-tooltip="Preimage of b is the set of all inputs that map to b.">preimage</span> tracks which inputs produce a chosen output.'
    ],
    checks: [
      {
        afterParagraph: 3,
        question: 'A set has 5 elements. How many elements does its power set have?',
        options: ['10', '25', '32', '5'],
        answer: '32',
        explanation: 'Each of the 5 elements independently flips a Keep/Drop coin: 2⁵ = 32 possible subsets.',
      },
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
      '• **Injective (1-to-1):** Think: **unique database hashing**. Every input gets a distinct output. If two users get the same hash (a collision), the system breaks. Visually, this is what the horizontal line test checks: no two arrows arrive at the same target.',
      '• **Surjective (Onto):** Think: **CPU task allocation**. You have 5 tasks and 4 worker cores. The assignment is surjective if every worker core receives at least one task — no core sits idle.',
      '• **Bijective (Perfect Invertibility):** If a function is both injective and surjective, it is bijective. This gives a perfect 1-to-1 pairing between Set X and Set Y — precise enough that you can run the machine in reverse and it will unwind cleanly, with no ambiguity about which output came from which input.',
      `![Three arrow diagrams contrasting injective-only, surjective-only, and bijective mappings between X and Y](${functionClassificationUrl})`,
      'Read the three diagrams left to right: injective-only leaves targets in Y untouched but never doubles up; surjective-only hits every target but lets two arrows land on the same one; bijective does both simultaneously — every element of Y is hit by exactly one element of X, which is precisely what makes an inverse function possible.',
      '### 9. Composition and Identity (The Assembly Line)',
      'Functions scale because they can be chained together: **g ∘ f**.',
      'Think of an assembly line. Function **f** builds a toy. Function **g** paints the toy blue.',
      'Order matters. Run **g ∘ f** (evaluate f first) and you assemble the toy, then paint it. Run **f ∘ g** instead (evaluate g first) and you\'d be painting unassembled plastic blocks before anything is put together — a different result entirely. Function composition is **not commutative**: g ∘ f and f ∘ g are, in general, different functions.',
      'Eventually you reach the baseline case: **f(x) = x**. Whatever input x you feed the machine, it returns that same x untouched. This is the **identity function**. Run a bijective function forward, then run its inverse on the result, and you land exactly on the identity function — because you\'ve returned precisely to where you started.'
    ],
    checks: [
      {
        afterParagraph: 4,
        question: 'A function maps 5 workers onto 4 tasks so every task gets done, but two workers share one task. Is this injective, surjective, both, or neither?',
        options: ['Injective only', 'Surjective only', 'Both (bijective)', 'Neither'],
        answer: 'Surjective only',
        explanation: 'Every task (codomain element) is hit by at least one worker, so it\'s surjective — but two workers colliding on the same task breaks injectivity.',
      },
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Pigeonhole Intuition',
        body: 'If Domain X is larger than Codomain Y (e.g., 5 pigeons into 3 holes), the function can never be injective — by the Pigeonhole Principle, some hole must receive 2 or more arrows.\n\nConversely, if |X| is smaller than |Y|, the function can never be surjective — there simply aren\'t enough inputs to reach every target.'
      },
      {
        type: 'warning',
        title: '⚠️ The Absolute Beginner Pitfalls',
        body: '• **{1, 2} ≠ (1, 2)**: A set { } is unordered. A coordinate ( ) is an ordered pair, where position matters. Different objects entirely.\n• **0 ≠ ∅**: Zero is a number. The empty set is a container that happens to hold nothing.\n• **Range ⊆ Codomain**: A function\'s range can be smaller than its codomain (the "goalie net"), but it can never be larger.'
      },
      {
        type: 'insight',
        title: 'Looking Ahead: Hilbert\'s Hotel & Infinity',
        body: 'Here is a brain-teaser to prepare you for countability later in Discrete Math:\n**Are there more integers than even integers?**\n\nThe answer is no. The map $f(n) = 2n$ is a bijection from ℤ to the even integers — proved step by step below — so the two infinite sets have exactly the same size ($\\aleph_0$). Infinity does not behave like finite intuition suggests.'
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
        caption: 'See exactly why running the operations in the wrong order produces a different, incorrect result.'
      }
    ],
    // Flat {expression, annotation} steps — DynamicProof (the component that
    // renders rigor.proofSteps) reads exactly this shape per step, one at a
    // time, with Prev/Next/Play controls.
    proofSteps: [
      { expression: 'f: \\mathbb{Z} \\to E, \\quad f(n) = 2n', annotation: '**State the goal.** Let f: ℤ → E be defined by f(n) = 2n, where E is the set of even integers. Prove f is bijective — both injective and surjective.' },
      { expression: 'f(a) = f(b) \\implies 2a = 2b', annotation: '**Prove injective.** Assume f(a) = f(b) for integers a, b. By definition of f, this means 2a = 2b.' },
      { expression: '2a = 2b \\implies a = b', annotation: '**Divide** both sides by 2 (valid since 2 ≠ 0). This gives a = b directly — exactly the injective definition.' },
      { expression: '\\therefore f \\text{ is injective.}', annotation: 'f(a) = f(b) forced a = b, with no extra cases (unlike n² earlier in this lesson — there is no ± ambiguity here, since division by 2 is unconditionally reversible).' },
      { expression: '\\text{Let } y \\in E \\implies y = 2k \\text{ for some } k \\in \\mathbb{Z}', annotation: '**Prove surjective.** Take an arbitrary even integer y ∈ E. By definition of even, y = 2k for some integer k.' },
      { expression: '\\text{Let } n = k \\in \\mathbb{Z}', annotation: '**Produce a witness.** Choose n = k. Since k is an integer, n = k is a valid input to f.' },
      { expression: 'f(n) = 2k = y \\quad \\checkmark', annotation: '**Verify.** Compute f(n) with this choice: f(n) = f(k) = 2k = y. This exact y was reached.' },
      { expression: '\\therefore f \\text{ is surjective.}', annotation: 'Every y ∈ E has some input (namely n = k = y/2) that maps to it.' },
      { expression: 'f \\text{ injective} \\land f \\text{ surjective} \\implies f \\text{ bijective} \\quad \\blacksquare', annotation: '**Conclude.** f is both injective and surjective, so f is bijective. A bijection between ℤ and E means the two sets are the same size, even though E looks like "half" of ℤ.' },
    ],
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
      conclusion: 'Because two distinct inputs (3 and −3) collide on the same output (9), the function is not injective.'
    }
  ],

  challenges: [
    {
      id: 'discrete-1-02a-qz1',
      difficulty: 'easy',
      problem: 'Power Set Math: If a set has exactly 10 unique elements, how many possible subsets can you generate?',
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
    { lessonSlug: 'counting-and-combinatorics', label: 'Counting and Combinatorics', context: 'The bijective pairing and power sets are the absolute core of combinatorial analysis.' },
    { lessonSlug: 'countability-and-infinity', label: 'Countability and Infinity', context: 'The f(n) = 2n bijection proved here is the exact technique that resolves Hilbert\'s Hotel and proves ℤ, ℚ, and ℕ are all the same size.' }
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'attempted-challenge-easy',
    'attempted-challenge-medium'
  ],
  semantics: {
    core: [
      { symbol: 'A, B', meaning: 'Sets — collections of unique elements' },
      { symbol: '∈, ∉', meaning: 'Membership — "is an element of" or "is NOT an element of"' },
      { symbol: '⊆, ⊂', meaning: 'Subset and Proper Subset' },
      { symbol: '∪, ∩', meaning: 'Union (ALL elements) and Intersection (Common elements)' },
      { symbol: 'A \\ B', meaning: 'Set Difference — elements in A but not in B' },
      { symbol: 'P(A)', meaning: 'Power Set — the set of all subsets of A' },
      { symbol: 'A × B', meaning: 'Cartesian Product — set of all ordered pairs (a, b)' },
      { symbol: '|A|', meaning: 'Cardinality — the number of elements in a set' },
    ],
    rulesOfThumb: [
      'Sets are unordered and contain only unique items. {1,2} = {2,1} = {1,1,2}.',
      'The empty set ∅ is a subset of EVERY set.',
      'A function f: A → B maps EVERY element of A to EXACTLY ONE element of B.',
      'Injective = One-to-One (no collisions). Surjective = Onto (all targets hit).',
      'Bijective = Both (perfect matching, invertible).',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'discrete-1-01',
        label: 'Propositions and Proof Techniques',
        note: 'Set operations (∪, ∩, ᶜ) are the direct set-theoretic image of the logical connectives (∨, ∧, ¬) you already proved things with.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'discrete-1-02',
        label: 'Relations and Structures',
        note: 'We will generalize functions into relations, where one input can map to multiple outputs.',
      },
      {
        lessonId: 'discrete-1-06a',
        label: 'Countability and Infinity',
        note: 'The Hilbert\'s Hotel teaser above gets fully resolved here, using exactly the bijection idea from this lesson.',
      },
    ],
  },

  mentalModel: [
    'Sets are bags; functions are predictable machines.',
    'A function is just a specific subset of the Cartesian Product that obeys the "One-Arrow-Out" rule.',
    'The Power Set is an exponential explosion of possibilities (2^n).',
    'Surjective means "No target left behind"; Injective means "No collisions allowed".',
  ],

  assessment: {
    questions: [
      {
        id: 'sf-assess-1',
        type: 'choice',
        text: 'If A = {1, 2} and B = {x, y}, what is the cardinality of A × B?',
        options: ['2', '4', '8', '1'],
        answer: '4',
        hint: 'The Cartesian product size is |A| * |B|.',
      },
      {
        id: 'sf-assess-2',
        type: 'input',
        text: 'What is the cardinality of the power set of the empty set |P(∅)|?',
        answer: '1',
        hint: 'The power set of ∅ contains exactly one element: the empty set itself. 2^0 = 1.',
      },
    ],
  },

  quiz: [
    {
      id: 'sf-q1',
      type: 'choice',
      text: 'Which type of function is required to be "perfectly invertible"?',
      options: ['Injective', 'Surjective', 'Bijective', 'Constant'],
      answer: 'Bijective',
      hints: ['A function must be both one-to-one and onto for its inverse to be a valid function.'],
    },
    {
      id: 'sf-q2',
      type: 'choice',
      text: 'If f: A → B is surjective, which of the following is true about the codomain B?',
      options: ['B equals the Range', 'B contains zero elements', 'B is a subset of the Domain', 'B has more elements than A'],
      answer: 'B equals the Range',
      hints: ['Surjective means every element in the codomain is hit by at least one arrow from the domain.'],
    },
    {
      id: 'sf-q3',
      type: 'choice',
      text: 'What is |{1, 2} × {a, b, c}| (the cardinality of the Cartesian product)?',
      options: ['5', '6', '2', '3'],
      answer: '6',
      hints: ['The Cartesian product pairs every element of the first set with every element of the second: |A × B| = |A| · |B|.'],
    },
    {
      id: 'sf-q4',
      type: 'choice',
      text: 'Which statement about ⊆ and ⊂ is correct?',
      options: [
        'A ⊆ B means A is smaller than B',
        'A ⊂ B allows A to equal B',
        'A ⊆ B allows A to equal B, but A ⊂ B does not',
        'They mean exactly the same thing',
      ],
      answer: 'A ⊆ B allows A to equal B, but A ⊂ B does not',
      hints: ['⊆ mirrors "≤" (allows equality); ⊂ mirrors "<" (strictly smaller).'],
    },
    {
      id: 'sf-q5',
      type: 'input',
      text: 'If A = {∅, {∅}}, what is |A| (the cardinality of A)?',
      answer: '2',
      hints: ['A contains exactly two distinct elements: the empty set, and the set containing the empty set — even though one "looks empty," they are different objects.'],
    },
    {
      id: 'sf-q6',
      type: 'choice',
      text: 'g ∘ f means "first apply f, then apply g." Why is function composition generally NOT commutative (g ∘ f ≠ f ∘ g)?',
      options: [
        'It actually is always commutative',
        'Applying operations in a different order can produce a completely different result — like painting before assembly vs. after',
        'Composition is only defined for one function at a time',
        'Because functions can\'t be chained',
      ],
      answer: 'Applying operations in a different order can produce a completely different result — like painting before assembly vs. after',
      hints: ['Think of the assembly-line example: build-then-paint gives a different object than paint-then-build.'],
    },
  ],
};

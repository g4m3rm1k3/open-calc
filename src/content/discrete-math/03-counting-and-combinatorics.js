export default {
  id: 'discrete-1-04',
  slug: 'counting-and-combinatorics',
  chapter: 'discrete-1',
  order: 6,
  title: 'Counting and Combinatorics',
  subtitle: 'The dark art of enumerating massive keyspaces before brute-force computation fails',
  tags: ['counting', 'combinatorics', 'permutations', 'combinations', 'binomial coefficient'],
  aliases: 'n choose k permutations combinations multiplication principle inclusion exclusion',

  hook: {
    question: 'How do you theoretically prove that a 256-bit encryption key will take the world\'s fastest supercomputer roughly 3 million years to crack via brute-force?',
    realWorldContext: 'Combinatorics is the mathematical engine behind cryptography, database indexing efficiency, and AI game trees. If a software engineer cannot estimate branching path counts, their algorithms can become computationally impractical very quickly (the State Explosion Problem).',
    previewVisualizationId: 'CountingTreeLab'
  },

  intuition: {
    prose: [
      '### 1. The "AND" vs "OR" Geometry',
      'The foundation of all counting perfectly mirrors standard boolean logic. There are strictly two distinct maneuvers you can make:',
      '• **The "AND" Rule (Multiplication):** If you must pick a Shirt AND a pair of Pants, every single shirt generates a brand new duplicate tree of pants. The branches strictly multiply geometrically ($3 \\times 2 = 6$).',
      '• **The "OR" Rule (Addition):** If you must pick exactly ONE item to wear (either a Shirt OR a pair of Pants), the branches remain completely isolated. The totals just lazily add together ($3 + 2 = 5$).',
      '• **Overlap Warning:** OR means plain addition only when groups are disjoint. If categories overlap, use Inclusion-Exclusion to subtract the overlap once.',
      '### 2. The physical "Slot Machine" Hack',
      'Beginners often reach for formulas too early before understanding structure. This usually causes confusion.',
      'Instead, immediately draw literal physical blanks on your paper: `_ _ _ _`. Treat every blank as an absolute stage in the sequence. If you are hacking a 4-digit PIN code, write `10 x 10 x 10 x 10`. This strictly anchors your brain into the Multiplication Principle before things get complicated.'
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The Factorial Primer ($n!$)',
        body: 'Before diving into formulas, you need a solid grasp of factorials ($n!$). It means multiplying a number by every positive integer below it down to 1.\n\n$5! = 5 \\times 4 \\times 3 \\times 2 \\times 1 = 120$\n\n**CRITICAL GOTCHA:** Mathematically, $0! = 1$. If you use $0! = 0$, many formulas break. Intuition: there is exactly 1 way to arrange zero objects, the empty arrangement.'
      },
      {
        type: 'theorem',
        title: 'The Multiplication Principle',
        body: 'If a highly complex process can be structurally broken down into independent stages, and Stage 1 has $A$ outcomes, Stage 2 has $B$ outcomes... the total geometric number of outcome paths is rigorously $A \\times B \\dots$'
      },
      {
        type: 'theorem',
        title: 'Inclusion-Exclusion (Double-Count Fix)',
        body: 'If sets overlap, raw addition overcounts the shared region. Correct formula: $|A \\cup B| = |A| + |B| - |A \\cap B|$. Story: add both groups, then subtract the overlap once to be fair.'
      }
    ],
    visualizations: [
      {
        id: 'CountingTreeLab',
        title: 'The Multiplication Tree Branching',
        caption: 'Visually trace exact logic branches to prove why independent choices are mathematically forced to strictly multiply.'
      }
    ]
  },

  math: {
    prose: [
      '### 3. Permutations (When Sequence is King)',
      'A **Permutation** strictly tracks the specific ordered sequence of elements. Imagine a sophisticated vault lock where the code `1-2-3` easily unlocks the vault, but `3-2-1` furiously blares the alarm. Because the *Order Matters*, those are aggressively logged as completely distinct events.',
      'The algebra is $P(n,k) = \\frac{n!}{(n-k)!}$. This means: take the total ordered pool ($n!$) and divide away the trailing part corresponding to items you did not choose.',
      '### 4. Combinations (Crushing the Overcount)',
      'A **Combination** ignores sequence. Imagine making a smoothie with an apple, banana, and orange. Changing the order you drop fruit in does not change the ingredient set.',
      'The formula $C(n,k) = \\frac{n!}{k!(n-k)!}$ starts from permutation logic, then divides by $k!$ to remove overcount from reordered versions of the same selection.',
      '*Notation Decoder:* In academia, exams, and source code, you will rarely see $C(n,k)$ actually written out. It is structurally written universally as the massive brackets $\\binom{n}{k}$, and is physically pronounced out loud as "$n$ choose $k$".',
      '### 5. The Formula Logic Flowchart',
      'Beginners fail exams because they randomly panic-guess which formula to use. Memorize exactly this formal flowchart binary tree:',
      '• **Does Order Matter?**',
      '  ↳ **YES** $\\to$ Use **Permutation** formulas ($P(n,k)$).',
      '  ↳ **NO** $\\to$ Use **Combination** formulas ($\\binom{n}{k}$).'
    ],
    callouts: [
      {
        type: 'warning',
        title: 'The "Identical Twin" Overcount Trap',
        body: 'If you ever run a complex counting algorithm and your final number is wildly larger than it realistically should be, you failed to mathematically account for "Identical Twins". If you are constantly swapping objects that literally look exactly the same, you are creating massive ghost clones. You MUST divide your final answer by $X!$ (the factorial of the identical objects) to legally merge those ghost clones back together.'
      },
      {
        type: 'theorem',
        title: 'The Master Matrix (Order x Repetition)',
        body: 'Use this as your first decision table before touching formulas:\n\nOrder Matters + No Repetition: $P(n,k)=\\frac{n!}{(n-k)!}$\n\nOrder Matters + Repetition Allowed: $n^k$ (PINs, passwords)\n\nOrder Does Not Matter + No Repetition: $\\binom{n}{k}$\n\nOrder Does Not Matter + Repetition Allowed: $\\binom{n+k-1}{k-1}$ (Stars and Bars)'
      },
      {
        type: 'insight',
        title: 'Handshake Intuition for n Choose 2',
        body: 'If $n$ people all shake hands once, each handshake is a pair of distinct people. Counting pairs gives $\\binom{n}{2}=\\frac{n(n-1)}{2}$. The divide-by-2 appears because (A,B) and (B,A) are physically the same handshake.'
      },
      {
        type: 'definition',
        title: 'Multiset Permutations (Identical Twins)',
        body: 'If total objects are $n$ with repeated groups of sizes $n_1,n_2,\\dots,n_k$, distinct arrangements are $\\frac{n!}{n_1!n_2!\\cdots n_k!}$. Intuition: numerator counts all orderings, denominator removes duplicates from swapping identical items.'
      },
      {
        type: 'theorem',
        title: 'Binomial Theorem (Pascal to Algebra Bridge)',
        body: '$(x+y)^n = \\sum_{k=0}^{n} \\binom{n}{k}x^{n-k}y^k$. Example: $(x+y)^3 = 1x^3 + 3x^2y + 3xy^2 + 1y^3$. Coefficients $(1,3,3,1)$ are exactly Pascal row 3.'
      },
      {
        type: 'tip',
        title: 'Circular Permutations Pro Tip',
        body: 'Round table count is $(n-1)!$, not $n!$. There is no head seat, so fix one person as anchor, then permute the remaining $n-1$ positions linearly.'
      }
    ],
    visualizations: [
      {
        id: 'PascalsTriangleLab',
        title: 'Pascal\'s Geometric Bridge',
        caption: 'Hover over Pascal\'s Triangle to visually decode how $\\binom{n}{k}$ mathematically maps to a repeating geometric lattice.'
      },
      {
        id: 'CombinationVsPermutationLab',
        title: 'The Overcount Compression Engine',
        caption: 'Watch the geometric difference as Combinations physically crush 6 distinct Permutations down into 1 single block.'
      },
      {
        id: 'VennDiagram',
        title: 'Overlap and Inclusion-Exclusion',
        caption: 'Use the overlap region to see exactly why raw OR-counts must subtract the intersection once.'
      }
    ]
  },

  rigor: {
    prose: [
      '### 6. Inclusion-Exclusion (The Failsafe)',
      'When adding two distinct sets together (The OR Rule), a fatal error occurs if the sets partially overlap. You accidentally count the intersecting objects twice!',
      'To cleanly resolve this, use Mathematical Inclusion-Exclusion: $|A \\cup B| = |A| + |B| - |A \\cap B|$.',
      'Add the two raw groups together, and then physically subtract the intersection size precisely once. This perfectly resets the geometry.',
      '### 7. Stars and Bars (The Final Boss)',
      'The absolute final boss of combinations is "Combinations with Repetition." (e.g., "You officially want to buy exactly 10 sodas, and the store sells Coke, Sprite, and Fanta. How many uniquely combined carts can you buy?").',
      'Direct math violently fails here. Instead, deploy the "Stars and Bars" hack. You physically represent the 10 generic sodas as 10 identical Stars ($\\star$), and you use exactly 2 vertical Bars ($|$) to mathematically split them rigidly into 3 brand subsets.',
      'Example picture: $***|*****|**$ means (3,5,2). Same total stars, different bar positions means a new distribution.',
      'General formula for distributing $n$ identical items into $k$ bins is $\\binom{n+k-1}{k-1}$ because you are choosing bar positions among $(n+k-1)$ total symbol slots.',
      'Donut example: 12 donuts, 5 flavors, unlimited repeats => $\\binom{12+5-1}{5-1}=\\binom{16}{4}=1820$.',
      '### 8. Circular Permutations (Round Table Symmetry)',
      'In circles, rotations are identical. For beginners: ABC, BCA, and CAB are the same seating pattern, not three different ones.',
      'To break rotational symmetry, "pin" one person in place and only permute the remaining $n-1$ people. This gives $(n-1)!$ instead of $n!$.',
      'This pinning trick is the standard proof idea behind all circular permutation formulas.'
    ],
    callouts: [],
    visualizations: [
      {
        id: 'StarsAndBarsLab',
        title: 'The Stars and Bars Exploit',
        caption: 'Watch how geometrically scattering bars between stars instantly trivializes the most terrifying Combination problems.'
      }
    ]
  },

  examples: [
    {
      id: 'discrete-1-04-ex1',
      title: 'The MISSISSIPPI Protocol',
      problem: 'How many absolutely distinct, unique ways can you scramble the letters in the word MISSISSIPPI?',
      steps: [
        { expression: '\\text{Total Letters: } 11', annotation: 'If every single letter was distinctly unique (like a rainbow of colors), the answer would just be a raw 11! Permutation.' },
        { expression: '\\text{The Identical Twins: } S=4, I=4, P=2, M=1', annotation: 'But the letters are NOT unique! Swapping the first S with the very last S physically looks completely identical. We are massively overcounting ghosts.' },
        { expression: '\\text{The Compression: } \\frac{11!}{4! \\times 4! \\times 2! \\times 1!}', annotation: 'We mathematically divide out the exact factorial counts of the specific clone clusters to forcefully eliminate the ghost duplicates.' },
        { expression: '= 34,650', annotation: 'The raw 11! (39 million) permutations violently collapses down to just 34,650 truly unique geometric strings.' }
      ],
      conclusion: 'By rigidly dividing out the indistinguishable elements, we successfully neutralized the massive geometric overcount.'
    },
    {
      id: 'discrete-1-04-ex2',
      title: 'The Complementary Trick ("At Least One")',
      problem: 'A hacker is generating 5-letter passwords using fully lowercase alphabet letters. How many totally unique 5-letter passwords contain **at least one** vowel?',
      steps: [
        { expression: '\\text{Direct Counting is a Nightmare: }', annotation: 'You would have to explicitly calculate EXACTLY 1 vowel, + EXACTLY 2 vowels, + EXACTLY 3 vowels... the math is incredibly tedious.' },
        { expression: '\\text{Total Universal State Space: } 26^5', annotation: 'Ignore the vowels entirely. A completely unrestricted 5-letter password simply branches geometrically 26 x 26 x 26 x 26 x 26.' },
        { expression: '\\text{The "Garbage" State Space: } 21^5', annotation: 'Calculate the absolute opposite of what you want: Passwords with ZERO vowels (strictly only the 21 consonants).' },
        { expression: '\\text{Total} - \\text{Garbage} = 26^5 - 21^5 = 11,881,376 - 4,084,101', annotation: 'Subtract the raw garbage strictly from the Universal Space. What mathematically remains is perfectly what you desire.' }
      ],
      conclusion: 'The total is strictly 7,797,275 passwords. Complementary counting is mathematically devastating when "At Least One" triggers a cascade of nested sub-cases.'
    },
    {
      id: 'discrete-1-04-ex3',
      title: 'The Handshake Count (n Choose 2)',
      problem: 'Exactly 10 people are in a room and each pair shakes hands exactly once. How many total handshakes occur?',
      steps: [
        { expression: 'Each handshake corresponds to a unique pair of people', annotation: 'Order does not matter: (A,B) is same as (B,A).' },
        { expression: '\\binom{10}{2}=\\frac{10\\cdot9}{2}', annotation: 'Choose 2 out of 10.' },
        { expression: '=45', annotation: 'Final count.' },
      ],
      conclusion: 'This is the cleanest real-world anchor for why combinations divide by 2 when choosing pairs.'
    },
    {
      id: 'discrete-1-04-ex4',
      title: 'Stars and Bars in One Line',
      problem: 'How many ways can you buy exactly 12 donuts from 5 varieties if any variety can repeat?',
      steps: [
        { expression: 'Model as 12 identical stars and 4 bars', annotation: '5 bins need 4 separators.' },
        { expression: 'Total slots = 12 + 4 = 16', annotation: 'Stars and bars share one line.' },
        { expression: 'Choose bar positions: \\binom{16}{4}=1820', annotation: 'Equivalent to choosing star positions.' },
      ],
      conclusion: 'Combinations with repetition become straightforward once converted to bar-position counting.'
    }
  ],

  challenges: [
    {
      id: 'discrete-1-04-ch1',
      difficulty: 'easy',
      problem: 'A standard US License Plate uses exactly 3 generic letters followed continuously by 4 distinct numbers. If absolutely repetition is permitted, exactly how many unique, unassailable license plates can be geometrically generated?',
      hint: 'Draw the physical 7-Slot Machine!',
      walkthrough: [
        { expression: '\\text{Letters: } 26 \\times 26 \\times 26', annotation: 'Three completely independent stages with 26 valid options.' },
        { expression: '\\text{Numbers: } 10 \\times 10 \\times 10 \\times 10', annotation: 'Four completely independent stages with 10 generic numeric options (0-9).' },
        { expression: '26^3 \\times 10^4', annotation: 'Multiply the entire sequence together.' }
      ],
      answer: '175,760,000 uniquely distinct combinations.'
    },
    {
      id: 'discrete-1-04-ch2',
      difficulty: 'medium',
      problem: 'You are mathematically sorting exactly 5 identical red marbles and precisely 3 identical blue marbles rigidly into a single straight line. How many formally distinct arrangements theoretically exist?',
      hint: 'This is fundamentally mathematically identical to the "MISSISSIPPI" protocol! It is a distinct permutation geometrically battling identical ghosts.',
      walkthrough: [
        { expression: '\\text{Total Raw Slots: } 8!', annotation: 'If all 8 completely spheres were distinctly numbered, it would be a flat factorial.' },
        { expression: '\\text{The Compression: } \\frac{8!}{5! \\times 3!}', annotation: 'You rigorously divide out the 5 identical red ghosts, and formally divide out the 3 identical blue ghosts.' },
        { expression: '= 56', annotation: 'The exact factorial reduction calculates structurally to 56.' }
      ],
      answer: '56. Fascinatingly, this is identical algebra to the combination equation $C(8, 5)$!'
    },
    {
      id: 'discrete-1-04-ch3',
      difficulty: 'hard',
      problem: 'The Knight of the Round Table Paradox: Exactly 7 high-ranking lords are seating themselves evenly around a perfectly circular wooden table. How many perfectly distinct seating arrangements mathematically exist? (Note: Rotations are functionally considered identically the same!).',
      hint: 'In a straight line, it\'s 7!. But on a circle, every single seating arrangement creates 7 perfectly identical rotated clone variations!',
      walkthrough: [
        { expression: '\\text{The Raw Line: } 7!', annotation: 'If the table was snapped completely straight, it would freely generate 5,040.' },
        { expression: '\\text{The Rotational Overcount: } \\frac{7!}{7}', annotation: 'Because an identical seating arrangement can technically geometrically rotate precisely into 7 distinct visual positions, we forcibly divide out the 7 clones.' },
        { expression: '(7-1)! = 6! = 720', annotation: 'This is formally registered as the Circular Permutation theorem: $(n-1)!$' }
      ],
      answer: '720 distinctly formal architectural geometries. Fixing exactly one single person to break the orbital symmetry instantly resolves the calculation down to $6!$.'
    },
    {
      id: 'discrete-1-04-ch4',
      difficulty: 'hard',
      problem: 'Master matrix drill: classify and solve each quickly. (a) 6-digit PIN with repetition. (b) Select 4 toppings from 9 without repetition, order irrelevant. (c) Distribute 8 identical candies to 3 children.',
      walkthrough: [
        { expression: '(a) Order matters + repetition => 10^6', annotation: 'PIN digits are ordered and repeatable.' },
        { expression: '(b) Order not matter + no repetition => \\binom{9}{4}=126', annotation: 'Classic combination.' },
        { expression: '(c) Order not matter + repetition => Stars and Bars: \\binom{8+3-1}{3-1}=\\binom{10}{2}=45', annotation: 'Identical candies into distinct children bins.' },
      ],
      answer: '(a) 1,000,000; (b) 126; (c) 45',
    }
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

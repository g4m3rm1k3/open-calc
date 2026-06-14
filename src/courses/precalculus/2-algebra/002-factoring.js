export default {
  id: 'ch2-alg-002',
  slug: 'factoring-every-method',
  chapter: 'precalc-2',
  order: 2,
  title: 'Factoring: Every Method, Every Case',
  subtitle: 'GCF, trinomials, special forms — and why factoring is just multiplication run backwards',
  tags: ['factoring', 'GCF', 'trinomial', 'difference of squares', 'sum of cubes', 'grouping', 'ac method'],
  aliases: 'factor polynomial GCF greatest common factor trinomial difference squares sum cubes difference cubes grouping ac method foil reverse',

  hook: {
    question: 'Factoring is described as "un-multiplying." But what does that actually mean visually — and why does it always work?',
    realWorldContext: 'Factoring is the algebraic version of prime decomposition. Engineers factor polynomials to find the resonant frequencies of a system (the roots of the characteristic polynomial). Factoring a denominator in calculus is the mandatory first step before partial fraction decomposition, which is how rational functions are integrated. Without factoring, those integrals are unsolvable.',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** In Lesson 1 you learned to build expressions — expanding products into sums using the distributive property. This lesson runs that process in reverse. If Lesson 1 was assembling the engine, Lesson 2 is taking it apart to see how the pieces fit. The same algebraic identities you memorised for expansion are now your factoring templates.',
      'Multiplication builds expressions; factoring dismantles them. When you multiply $(x+3)(x-2)$, you get $x^2 + x - 6$. Factoring asks: given $x^2 + x - 6$, can you recover the pieces? The answer is yes — because multiplication of polynomials has a unique inverse (over the integers).',
      'The area model makes this concrete. A rectangle with width $(x+3)$ and height $(x-2)$ has area $x^2 + x - 6$. Factoring means finding rectangle dimensions whose product gives the target area. This is not just a mnemonic — it is why factoring works: multiplication IS area, and area has a unique rectangular decomposition.',
      'Every factoring problem has a decision tree. The first question is always: is there a GCF? Pull it out before anything else — it simplifies every subsequent step. The second question: how many terms? Two terms have special forms (difference of squares, sum/difference of cubes). Three terms are trinomials. Four or more terms usually factor by grouping.',
      '**Finding the DNA**: In biology, DNA determines the traits of an organism. In algebra, **Factors** are the "DNA" of a function—they tell you exactly where the graph touches the ground (the x-axis) and how it behaves when it gets there. To factor is to find the fundamental identity of the mathematical system.',
      '**Where this is heading:** The factoring skills here feed directly into the next two lessons. Quadratics (Lesson 3) use factoring to find roots and vertex form. Rational expressions (Lesson 4) require complete factoring of numerators and denominators before any simplification or partial fraction decomposition is possible.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Precalc-2 arc — Lesson 2 of 8',
        body: '← Expressions & Algebraic Structure | **Factoring: Every Method** | Quadratics →',
      },
      {
        type: 'proof-map',
        title: 'The factoring decision tree',
        body: '\\text{1. GCF?} \\to \\text{pull it out first, always} \\\\ \\text{2. How many terms?} \\\\ \\quad 2 \\text{ terms} \\to \\text{difference of squares? sum/diff of cubes?} \\\\ \\quad 3 \\text{ terms} \\to \\text{trinomial (}ac\\text{ method or inspection)} \\\\ \\quad 4 \\text{ terms} \\to \\text{grouping}',
      },
      {
        type: 'insight',
        title: 'The area model of factoring',
        body: 'x^2 + 5x + 6 = (x+2)(x+3) \\\\ \\text{Visually: a rectangle with sides }(x+2)\\text{ and }(x+3)\\text{ has area }x^2+5x+6. \\\\ \\text{The four tile regions are: }x^2,\\; 3x,\\; 2x,\\; 6.',
      },
      {
        type: 'warning',
        title: 'Sum of squares does NOT factor over the reals',
        body: 'a^2 - b^2 = (a-b)(a+b) \\qquad \\checkmark \\\\ a^2 + b^2 = \\text{prime over } \\mathbb{R} \\qquad \\times \\\\ \\text{(It factors over } \\mathbb{C}\\text{: }(a+bi)(a-bi)\\text{ — covered in L6.)}',
      },
      {
        type: 'insight',
        title: 'Linguistic Learner: The Etymology of Algebra',
        body: '\\text{Factoring is like finding the "root" of a complex word.} \\\\ \\text{Just as "un-happy" breaks into "un" and "happy," } x^2-9 \\text{ breaks into its fundamental meanings: } (x-3) \\text{ and } (x+3).',
      },
      {
        type: 'insight',
        title: 'Logical Learner: Reverse Engineering',
        body: '\\text{If expansion was the "Build" step, factoring is the "Debug" step.} \\\\ \\text{You are taking the final result and tracing it back to the original inputs to find why it "zeros out."}',
      },
      {
        type: 'insight',
        title: 'Physical Learner: Tiling the Footprint',
        body: '\\text{Imagine you have } 6x^2+7x-3 \\text{ floor tiles. Factoring is the physical act of arranging them into a perfect rectangle.} \\\\ \\text{The dimensions of that rectangle are your factors.}',
      },
      {
        type: 'insight',
        title: 'Visual Learner: Visions of Zero',
        body: '\\text{Look for the "Sign Crossings." Every factor } (x-c) \\text{ is a visual instruction to cross the origin at point } c. \\\\ \\text{Factoring is drawing the map of the crossing points.}',
      },
    ],
    visualizations: [
      {
        id: 'FactoringAreaViz',
        title: 'Factoring as Rectangle Area',
        mathBridge: 'Before interacting, notice the grid of algebra tiles representing a polynomial area. Step 1: Observe how the $x^2$, $x$, and constant tiles are arranged in a rectangle. Step 2: Drag the width and height labels to try different factor pairs — the tiles rearrange. Step 3: Find the unique rectangular arrangement that uses all tiles with no gaps or overlaps. The key lesson: factoring is finding the unique rectangle dimensions whose product equals the target polynomial area.',
        caption: 'Each cell of the grid is one term from the multiplication. Factoring recovers the dimensions.',
      },
    ],
  },

  math: {
    prose: [
      'The ac method works for any trinomial $ax^2 + bx + c$. Compute the product $ac$. Find two numbers that multiply to $ac$ and add to $b$. Rewrite the middle term using those two numbers, then factor by grouping. This always works — it is an algorithm, not a guessing game.',
      'The special product identities are worth memorising in both directions — as expansion formulas AND as factoring templates. Every time you see $a^2 - b^2$, your brain should fire "difference of squares." Every time you see $a^3 + b^3$, it should fire "sum of cubes."',
      'Factoring over the integers means all coefficients stay as integers. Factoring over the reals allows irrational coefficients. Over the complex numbers, every polynomial factors completely into linear factors. These are progressively larger universes of factorability.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Special factoring forms — both directions',
        body: 'a^2 - b^2 = (a-b)(a+b) \\qquad \\text{(difference of squares)} \\\\ a^3 - b^3 = (a-b)(a^2+ab+b^2) \\qquad \\text{(difference of cubes)} \\\\ a^3 + b^3 = (a+b)(a^2-ab+b^2) \\qquad \\text{(sum of cubes)}',
      },
      {
        type: 'definition',
        title: 'The ac method — step by step',
        body: '\\text{Factor } ax^2+bx+c: \\\\ 1.\\; \\text{compute } ac. \\quad 2.\\; \\text{find } p,q \\text{ with } pq=ac \\text{ and } p+q=b. \\\\ 3.\\; \\text{rewrite: } ax^2+px+qx+c. \\quad 4.\\; \\text{factor by grouping.}',
      },
      {
        type: 'insight',
        title: 'Sum/difference of cubes memory: SOAP',
        body: '(a \\pm b)(a^2 \\mp ab + b^2) \\\\ \\text{S: Same sign as original. O: Opposite sign. A: Always positive.} \\\\ a^3 + b^3 = (a+b)(a^2 - ab + b^2) \\quad \\text{same, opposite, always}+',
      },
      {
        type: 'theorem',
        title: 'The Rational Roots Theorem',
        body: '\\text{For a polynomial with integer coefficients: any rational zero must be } \\frac{\\text{factor of constant term } a_0}{\\text{factor of leading coeff } a_n}. \\\\ \\text{This provides the list of all possible "DNA candidates" for factoring.}',
      },
      {
        type: 'theorem',
        title: 'Proof of the Zero Product Property',
        body: '\\text{If } a \\cdot b = 0 \\text{ and } a \\neq 0, \\text{ then } \\frac{1}{a}(a \\cdot b) = \\frac{1}{a}(0) \\implies b = 0. \\\\ \\text{This logic is why factoring is a mandatory tool for solving equations.}',
      },
    ],
  },

  rigor: {
    title: 'Proof: The Geometry of Factoring',
    proofSteps: [
      {
        expression: '\\text{--- Part I: The Difference of Squares Area Move ---}',
        annotation: 'Let us visualize $a^2 - b^2$ through area rearrangement.',
      },
      {
        expression: '\\text{Start with a square of side } a. \\text{ Area} = a^2.',
        annotation: 'Draw a large square with side length $a$.',
      },
      {
        expression: '\\text{Remove a corner square of side } b. \\text{ Remaining area} = a^2 - b^2.',
        annotation: 'Cut out a $b \\times b$ square from one corner. The L-shaped region has area $a^2 - b^2$.',
      },
      {
        expression: '\\text{Slice and rotate: the L-shape becomes a rectangle of } (a-b) \\times (a+b).',
        annotation: 'Same area, two representations. $a^2 - b^2 = (a-b)(a+b)$.',
      },
      {
        expression: '\\text{--- Part II: Sum of Cubes Volume Decomposition ---}',
        annotation: 'A sum of cubes $a^3 + b^3$ can be visualized as two solid blocks fused into one L-shaped volume.',
      },
      {
        expression: '\\text{Volume} = (a+b)a^2 - (a+b)ab + (a+b)b^2',
        annotation: 'By slicing the combined volume along the junction planes, we find three sub-volumes that all share the factor $(a+b)$.',
      },
      {
        expression: '= (a+b)(a^2 - ab + b^2) \\qquad \\blacksquare',
        annotation: 'Factoring out $(a+b)$ reveals the quadratic "base" of the identity. Geometry again verifies the algebra.',
      },
    ],
  },

  examples: [
    {
      id: 'ch2-002-ex1',
      title: 'GCF first, then trinomial',
      problem: '\\text{Factor completely: } 6x^3 - 24x^2 + 18x',
      steps: [
        {
          expression: '= 6x(x^2 - 4x + 3)',
          annotation: 'GCF is $6x$. Always pull this out first — it simplifies everything inside.',
          hint: 'Find the largest factor common to all three terms: $6$ divides $6, 24, 18$; $x$ divides $x^3, x^2, x$. So GCF $= 6x$.',
        },
        {
          expression: '= 6x(x-1)(x-3)',
          annotation: 'Factor the trinomial $x^2 - 4x + 3$. Need two numbers that multiply to $3$ and add to $-4$: those are $-1$ and $-3$.',
          hint: 'For $x^2 - 4x + 3$: find two numbers with product $+3$ and sum $-4$. Since both must be negative: $(-1)(-3) = 3$ and $-1 + (-3) = -4$.',
        },
      ],
      conclusion: 'Never skip the GCF step. It reduces the degree of the remaining factor, making the next step easier.',
    },
    {
      id: 'ch2-002-ex2',
      title: 'The ac method on a hard trinomial',
      problem: '\\text{Factor: } 6x^2 + 7x - 3',
      steps: [
        {
          expression: 'a=6,\\; c=-3 \\Rightarrow ac = -18. \\text{ Need } p+q=7,\\; pq=-18.',
          annotation: 'Compute $ac$. Find two numbers with that product and sum equal to $b = 7$.',
          hint: 'Since $ac = -18$ is negative, the two numbers have opposite signs. List factor pairs of $18$: $(1,18),(2,9),(3,6)$. Adjust signs to get a sum of $+7$.',
        },
        {
          expression: 'p = 9,\\; q = -2 \\quad (9 \\times -2 = -18,\\; 9 + (-2) = 7)',
          annotation: 'List factor pairs of $-18$: try $(9,-2)$. It works.',
          hint: '$9 \\times (-2) = -18$ ✓ and $9 + (-2) = 7$ ✓. This is the pair needed.',
        },
        {
          expression: '6x^2 + 9x - 2x - 3',
          annotation: 'Rewrite middle term using the two numbers found.',
          hint: 'Replace $7x$ with $9x - 2x$. The expression is equivalent — you have split the middle term.',
        },
        {
          expression: '= 3x(2x+3) - 1(2x+3) = (3x-1)(2x+3)',
          annotation: 'Factor by grouping. The common factor $(2x+3)$ appears in both groups.',
          hint: 'Group the first two and last two terms. Factor the GCF from each group, then factor out the common binomial.',
        },
      ],
      conclusion: 'The ac method removes all guesswork. It turns a hard trinomial into a grouping problem.',
    },
    {
      id: 'ch2-002-ex3',
      title: 'Sum of cubes — recognising the pattern',
      problem: '\\text{Factor: } 8x^3 + 27',
      steps: [
        {
          expression: '8x^3 + 27 = (2x)^3 + 3^3',
          annotation: 'Recognise as sum of cubes with $a = 2x$ and $b = 3$.',
          hint: 'Write each term as a perfect cube: $8x^3 = (2x)^3$ and $27 = 3^3$.',
        },
        {
          expression: '= (2x + 3)\\bigl((2x)^2 - (2x)(3) + 3^2\\bigr)',
          annotation: 'Apply the sum of cubes formula: $(a+b)(a^2-ab+b^2)$.',
          hint: 'In the SOAP pattern: $a+b = 2x+3$ (Same sign), $a^2 - ab + b^2$ (Opposite, Always positive).',
        },
        {
          expression: '= (2x+3)(4x^2 - 6x + 9)',
          annotation: 'Simplify. Note: $4x^2 - 6x + 9$ has discriminant $36 - 144 < 0$ — it does not factor over the reals.',
          hint: 'Compute each part: $(2x)^2 = 4x^2$, $(2x)(3) = 6x$, $3^2 = 9$. Always check the quadratic factor\'s discriminant.',
        },
      ],
      conclusion: 'The quadratic factor from a sum/difference of cubes is usually irreducible over the reals. Always check by computing the discriminant.',
    },
    {
      id: 'ch2-002-ex4',
      title: 'Factoring by grouping — four terms',
      problem: '\\text{Factor: } x^3 + 2x^2 - 9x - 18',
      steps: [
        {
          expression: '= x^2(x+2) - 9(x+2)',
          annotation: 'Group first two and last two terms. Factor GCF from each pair: $x^2$ from the first, $-9$ from the second.',
          hint: 'Group: $(x^3 + 2x^2) + (-9x - 18)$. From the first group factor $x^2$; from the second factor $-9$.',
        },
        {
          expression: '= (x^2 - 9)(x + 2)',
          annotation: 'The common factor $(x+2)$ appears — pull it out.',
          hint: 'Both groups contain the factor $(x+2)$. Factor it out: $(x^2 - 9)(x+2)$.',
        },
        {
          expression: '= (x-3)(x+3)(x+2)',
          annotation: '$x^2 - 9$ is a difference of squares. Factor again. Completely factored.',
          hint: '$x^2 - 9 = x^2 - 3^2 = (x-3)(x+3)$. Always check if any remaining factor can be factored further.',
        },
      ],
      conclusion: 'Grouping works when the four terms split into two pairs that share a common factor. If the first grouping does not work, try a different pairing.',
    },
    {
      id: 'ex-factoring-rational',
      title: 'Advanced Structure: Rational Exponents',
      problem: '\\text{Factor completely: } x^{3/2} - x^{1/2} - 6x^{-1/2}',
      steps: [
        {
          expression: '= x^{-1/2}(x^2 - x - 6)',
          annotation: 'Step 1: Always pull out the GCF. Here, the lowest power $x^{-1/2}$ is the factor common to all terms.',
          hint: 'The GCF of $x^{3/2}, x^{1/2}, x^{-1/2}$ is the smallest power: $x^{-1/2}$. Dividing each term by $x^{-1/2}$ is the same as multiplying by $x^{1/2}$.',
        },
        {
          expression: '= x^{-1/2}(x-3)(x+2)',
          annotation: 'Step 2: Factor the remaining quadratic trinomial. Need product $-6$ and sum $-1$.',
          hint: 'For $x^2 - x - 6$: find factors of $-6$ that sum to $-1$. The pair $(-3)(+2) = -6$ and $-3+2 = -1$ works.',
        },
      ],
      conclusion: 'Even with negative or fractional exponents, the "Lowest Power" is always your GCF. This unlocks the quadratic structure inside.',
    },
    {
      id: 'ex-factoring-quadform',
      title: 'Factoring in Quadratic Form',
      problem: '\\text{Factor completely: } x^4 - 5x^2 + 4',
      steps: [
        {
          expression: '(x^2)^2 - 5(x^2) + 4',
          annotation: 'Step 1: Recognise the structure as $u^2 - 5u + 4$ where $u = x^2$.',
          hint: 'Substitute $u = x^2$ mentally. The expression becomes $u^2 - 5u + 4$, a standard trinomial.',
        },
        {
          expression: '(x^2 - 1)(x^2 - 4)',
          annotation: 'Step 2: Factor the trinomial. Need product $4$ and sum $-5$.',
          hint: 'For $u^2 - 5u + 4$: factors of $4$ that sum to $-5$ are $(-1)(-4)$. So $(u-1)(u-4) = (x^2-1)(x^2-4)$.',
        },
        {
          expression: '(x-1)(x+1)(x-2)(x+2)',
          annotation: 'Step 3: Each factor is a Difference of Squares. Break them down completely.',
          hint: '$x^2 - 1 = (x-1)(x+1)$ and $x^2 - 4 = (x-2)(x+2)$. Always factor completely.',
        },
      ],
      conclusion: 'Many high-degree polynomials are just quadratics in disguise. Scaling the variable (substitution) reveals the path.',
    },
  ],

  challenges: [
    {
      id: 'ch2-002-ch1',
      difficulty: 'medium',
      problem: '\\text{Factor completely: } x^4 - 16',
      hint: 'Treat $x^4$ as $(x^2)^2$ — this is a difference of squares. Then check if the factors continue to factor.',
      walkthrough: [
        {
          expression: 'x^4 - 16 = (x^2)^2 - 4^2 = (x^2-4)(x^2+4)',
          annotation: 'Difference of squares with $a = x^2$, $b = 4$.',
        },
        {
          expression: '(x^2-4) = (x-2)(x+2)',
          annotation: 'Difference of squares again.',
        },
        {
          expression: '(x^2+4) \\text{ is irreducible over } \\mathbb{R}',
          annotation: 'Sum of squares never factors over the reals.',
        },
        {
          expression: 'x^4 - 16 = (x-2)(x+2)(x^2+4)',
          annotation: 'Fully factored over the reals. Over $\\mathbb{C}$: $(x-2)(x+2)(x-2i)(x+2i)$.',
        },
      ],
      answer: '(x-2)(x+2)(x^2+4)',
    },
    {
      id: 'ch2-002-ch2',
      difficulty: 'hard',
      problem: '\\text{Factor } x^6 - 1 \\text{ completely over the reals.}',
      hint: 'First treat as difference of squares $(x^3)^2 - 1^2$, then as difference/sum of cubes.',
      walkthrough: [
        {
          expression: 'x^6-1 = (x^3-1)(x^3+1)',
          annotation: 'Difference of squares with $a=x^3$, $b=1$.',
        },
        {
          expression: 'x^3-1 = (x-1)(x^2+x+1)',
          annotation: 'Difference of cubes.',
        },
        {
          expression: 'x^3+1 = (x+1)(x^2-x+1)',
          annotation: 'Sum of cubes.',
        },
        {
          expression: 'x^6-1 = (x-1)(x+1)(x^2+x+1)(x^2-x+1)',
          annotation: 'Both quadratic factors have negative discriminants — irreducible over $\\mathbb{R}$. This is the complete factorisation.',
        },
      ],
      answer: '(x-1)(x+1)(x^2+x+1)(x^2-x+1)',
    },
    {
      id: 'ch2-002-ch3',
      difficulty: 'harder',
      problem: '\\text{Factor completely using the "Sophie Germain" identity: } x^4 + 4.',
      hint: 'Add and subtract a term ($4x^2$) to complete a perfect square. The original is not a difference of squares... yet.',
      walkthrough: [
        {
          expression: 'x^4 + 4 = (x^4 + 4x^2 + 4) - 4x^2',
          annotation: 'Step 1: Complete the square $(x^2+2)^2$ by adding and subtracting $4x^2$.',
        },
        {
          expression: '= (x^2+2)^2 - (2x)^2',
          annotation: 'Step 2: Recognize the difference of squares: $a = (x^2+2)$ and $b = (2x)$.',
        },
        {
          expression: '= (x^2 + 2x + 2)(x^2 - 2x + 2) \\qquad \\blacksquare',
          annotation: 'Step 3: Factors are the sum and difference. Both are irreducible over the reals.',
        },
      ],
      answer: '(x^2+2x+2)(x^2-2x+2)',
    },
  ],

  crossRefs: [
    { slug: 'expressions-and-structure', reason: 'Factoring reverses the expansion techniques from Lesson 1 — the distributive property and special product identities are applied in reverse.' },
    { slug: 'quadratics-completing-the-square', reason: 'Factoring trinomials is the fastest method for solving quadratics when the factors are integers; it leads directly into the quadratic formula.' },
    { slug: 'rational-expressions-partial-fractions', reason: 'Complete factoring of the denominator is the mandatory first step in partial fraction decomposition.' },
  ],

  checkpoints: [
    'What is the first question to ask for any factoring problem, regardless of the number of terms?',
    'When does the ac method apply, and what does it reduce to?',
    'State the sum of cubes identity and the SOAP memory device for the signs.',
    'Why does $a^2 + b^2$ not factor over the reals?',
    'What does it mean to factor completely, and how do you know when you are done?',
  ],

  semantics: {
    symbols: [
      { symbol: 'GCF', meaning: 'Greatest Common Factor — the largest expression that divides all terms' },
      { symbol: 'ac', meaning: 'Product of leading coefficient and constant in $ax^2+bx+c$; used in the ac method' },
      { symbol: 'p, q', meaning: 'The two numbers found in the ac method: $pq = ac$ and $p+q = b$' },
    ],
    rulesOfThumb: [
      'Always extract the GCF first — it reduces the complexity of every subsequent step.',
      'Count terms: 2 → special forms; 3 → ac method; 4 → grouping.',
      'The quadratic factor from a sum or difference of cubes is almost always irreducible — verify with the discriminant.',
      'Factor completely: always check if any factor can be factored again.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { topic: 'Distributive property and expansion', where: 'Precalc-2 Lesson 1 — Expressions & Structure', why: 'Factoring is the distributive property in reverse; fluent expansion is a prerequisite.' },
      { topic: 'Integer arithmetic and factor pairs', where: 'Pre-algebra — factors and multiples', why: 'The ac method requires finding all factor pairs of the product $ac$.' },
    ],
    futureLinks: [
      { topic: 'Solving quadratic equations', where: 'Precalc-2 Lesson 3 — Quadratics', why: 'Factoring is the fastest method for solving quadratics when integer factors exist.' },
      { topic: 'Partial fraction decomposition', where: 'Precalc-2 Lesson 4 — Rational Expressions', why: 'The denominator must be completely factored before any decomposition template can be set up.' },
      { topic: 'Limit evaluation of $0/0$ forms', where: 'Calculus — limits and continuity', why: 'Cancelling a common factor after factoring is the standard technique for resolving indeterminate limits.' },
    ],
  },

  assessment: [
    {
      question: 'Factor completely: $2x^2 - 8$',
      answer: '$2(x-2)(x+2)$',
      difficulty: 'quick-fire',
    },
    {
      question: 'Factor: $x^2 - 7x + 12$',
      answer: '$(x-3)(x-4)$',
      difficulty: 'quick-fire',
    },
    {
      question: 'What is the first step in factoring any polynomial?',
      answer: 'Extract the GCF.',
      difficulty: 'quick-fire',
    },
  ],

  mentalModel: [
    'Factoring is multiplication in reverse: given the product, find the factors.',
    'The GCF is always the first move — it simplifies all subsequent steps.',
    'Two terms: check for difference of squares or sum/difference of cubes.',
    'Three terms: use the ac method — it always works and removes guessing.',
    'Four terms: try grouping — split into two pairs, factor each, pull out the common binomial.',
  ],

  quiz: [
    {
      id: 'q-fac-01',
      type: 'input',
      text: 'Factor completely: $4x^2 - 36$',
      answer: '4(x-3)(x+3)',
      hints: ['First look for a GCF: all terms are divisible by 4.', 'After factoring out 4, you have $4(x^2 - 9)$. Recognise $x^2-9$ as a difference of squares.'],
      reviewSection: 'Examples tab — GCF first',
    },
    {
      id: 'q-fac-02',
      type: 'choice',
      text: 'Factor: $x^2 + 5x + 6$',
      options: ['$(x+1)(x+6)$', '$(x+2)(x+3)$', '$(x-2)(x-3)$', '$(x+6)(x-1)$'],
      answer: '$(x+2)(x+3)$',
      hints: ['Find two numbers that multiply to $6$ and add to $5$.', 'The pair $(2, 3)$ satisfies $2 \\cdot 3 = 6$ and $2 + 3 = 5$.'],
      reviewSection: 'Intuition tab — the area model of factoring',
    },
    {
      id: 'q-fac-03',
      type: 'input',
      text: 'Use the ac method to factor: $2x^2 + 5x + 3$',
      answer: '(2x+3)(x+1)',
      hints: ['$ac = 2 \\cdot 3 = 6$. Find two numbers with product 6 and sum 5: those are 2 and 3.', 'Rewrite: $2x^2 + 2x + 3x + 3$. Group: $2x(x+1) + 3(x+1) = (2x+3)(x+1)$.'],
      reviewSection: 'Math tab — the ac method',
    },
    {
      id: 'q-fac-04',
      type: 'choice',
      text: 'Which of the following cannot be factored over the real numbers?',
      options: ['$x^2 - 4$', '$x^2 + 4$', '$x^2 - 4x + 4$', '$x^2 - 4x - 5$'],
      answer: '$x^2 + 4$',
      hints: ['Sum of squares ($a^2 + b^2$) has no real factors.', 'Check the discriminant: $b^2 - 4ac = 0 - 16 = -16 < 0$ for $x^2 + 4$.'],
      reviewSection: 'Intuition tab — sum of squares does NOT factor',
    },
    {
      id: 'q-fac-05',
      type: 'input',
      text: 'Factor: $8x^3 - 1$',
      answer: '(2x-1)(4x^2+2x+1)',
      hints: ['Recognise $8x^3 = (2x)^3$ and $1 = 1^3$. This is a difference of cubes.', 'Apply $a^3 - b^3 = (a-b)(a^2+ab+b^2)$ with $a=2x$, $b=1$.'],
      reviewSection: 'Math tab — special factoring forms',
    },
    {
      id: 'q-fac-06',
      type: 'choice',
      text: 'Factor by grouping: $x^3 - 3x^2 + 2x - 6$',
      options: ['$(x-3)(x^2+2)$', '$(x+3)(x^2-2)$', '$(x-3)(x^2-2)$', '$(x+2)(x^2-3)$'],
      answer: '$(x-3)(x^2+2)$',
      hints: ['Group: $(x^3 - 3x^2) + (2x - 6)$. Factor each group.', 'First group: $x^2(x-3)$. Second group: $2(x-3)$. Common factor is $(x-3)$.'],
      reviewSection: 'Examples tab — factoring by grouping',
    },
    {
      id: 'q-fac-07',
      type: 'input',
      text: 'Factor completely: $3x^3 - 12x$',
      answer: '3x(x-2)(x+2)',
      hints: ['GCF of $3x^3$ and $12x$ is $3x$. Factor it out first.', 'After extracting $3x$: $3x(x^2 - 4)$. Now $x^2 - 4$ is a difference of squares.'],
      reviewSection: 'Examples tab — GCF first, then trinomial',
    },
    {
      id: 'q-fac-08',
      type: 'choice',
      text: 'Which identity does SOAP help you remember?',
      options: ['Difference of squares', 'Sum/difference of cubes', 'Perfect square trinomial', 'Quadratic formula'],
      answer: 'Sum/difference of cubes',
      hints: ['SOAP stands for: Same, Opposite, Always Positive — describing the signs in the cube factoring formula.', 'It helps with $(a \\pm b)(a^2 \\mp ab + b^2)$.'],
      reviewSection: 'Math tab — SOAP',
    },
    {
      id: 'q-fac-09',
      type: 'input',
      text: 'Factor completely: $x^4 - 5x^2 + 4$',
      answer: '(x-1)(x+1)(x-2)(x+2)',
      hints: ['Let $u = x^2$. The expression becomes $u^2 - 5u + 4$.', 'Factor $u^2 - 5u + 4 = (u-1)(u-4) = (x^2-1)(x^2-4)$, then factor each as a difference of squares.'],
      reviewSection: 'Examples tab — factoring in quadratic form',
    },
    {
      id: 'q-fac-10',
      type: 'choice',
      text: 'According to the Rational Roots Theorem, which value could NOT be a rational root of $2x^3 - 5x + 3$?',
      options: ['$1/2$', '$3/2$', '$2/3$', '$3$'],
      answer: '$2/3$',
      hints: ['Rational roots must be (factor of constant term) / (factor of leading coefficient).', 'Constant term is $3$ (factors: $1, 3$); leading coefficient is $2$ (factors: $1, 2$). Possible rationals: $\\pm 1, \\pm 3, \\pm 1/2, \\pm 3/2$. Note $2/3$ is not on this list.'],
      reviewSection: 'Math tab — the Rational Roots Theorem',
    },
  ],
}

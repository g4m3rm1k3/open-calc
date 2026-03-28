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
      'Multiplication builds expressions; factoring dismantles them. When you multiply $(x+3)(x-2)$, you get $x^2 + x - 6$. Factoring asks: given $x^2 + x - 6$, can you recover the pieces? The answer is yes — because multiplication of polynomials has a unique inverse (over the integers).',
      'The area model makes this concrete. A rectangle with width $(x+3)$ and height $(x-2)$ has area $x^2 + x - 6$. Factoring means finding rectangle dimensions whose product gives the target area. This is not just a mnemonic — it is why factoring works: multiplication IS area, and area has a unique rectangular decomposition.',
      'Every factoring problem has a decision tree. The first question is always: is there a GCF? Pull it out before anything else — it simplifies every subsequent step. The second question: how many terms? Two terms have special forms (difference of squares, sum/difference of cubes). Three terms are trinomials. Four or more terms usually factor by grouping.',
      '**Finding the DNA**: In biology, DNA determines the traits of an organism. In algebra, **Factors** are the "DNA" of a function—they tell you exactly where the graph touches the ground (the x-axis) and how it behaves when it gets there. To factor is to find the fundamental identity of the mathematical system.',
      '**Reverse Engineering**: If Lesson 1 was "building the engine" (expansion), Lesson 2 is "taking it apart" (factoring). Every time you pull out a GCF or a binomial factor, you are reducing the complexity of the machine to see how its parts work together.',
    ],
    callouts: [
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
        mathBridge: 'Drag tiles to rearrange the area model. Factoring means finding the dimensions of the rectangle that gives the target polynomial area.',
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
        type: 'mnemonic',
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
        },
        {
          expression: '= 6x(x-1)(x-3)',
          annotation: 'Factor the trinomial $x^2 - 4x + 3$. Need two numbers that multiply to $3$ and add to $-4$: those are $-1$ and $-3$.',
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
        },
        {
          expression: 'p = 9,\\; q = -2 \\quad (9 \\times -2 = -18,\\; 9 + (-2) = 7)',
          annotation: 'List factor pairs of $-18$: try $(9,-2)$. It works.',
        },
        {
          expression: '6x^2 + 9x - 2x - 3',
          annotation: 'Rewrite middle term using the two numbers found.',
        },
        {
          expression: '= 3x(2x+3) - 1(2x+3) = (3x-1)(2x+3)',
          annotation: 'Factor by grouping. The common factor $(2x+3)$ appears in both groups.',
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
        },
        {
          expression: '= (2x + 3)\\bigl((2x)^2 - (2x)(3) + 3^2\\bigr)',
          annotation: 'Apply the sum of cubes formula: $(a+b)(a^2-ab+b^2)$.',
        },
        {
          expression: '= (2x+3)(4x^2 - 6x + 9)',
          annotation: 'Simplify. Note: $4x^2 - 6x + 9$ has discriminant $36 - 144 < 0$ — it does not factor over the reals.',
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
        },
        {
          expression: '= (x^2 - 9)(x + 2)',
          annotation: 'The common factor $(x+2)$ appears — pull it out.',
        },
        {
          expression: '= (x-3)(x+3)(x+2)',
          annotation: '$x^2 - 9$ is a difference of squares. Factor again. Completely factored.',
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
          annotation: 'Step 1: Always pull out the GCF. Here, the lowest power $x^{-1/2}$ is the factor common to all terms.'
        },
        {
          expression: '= x^{-1/2}(x-3)(x+2)',
          annotation: 'Step 2: Factor the remaining quadratic trinomial. Need product $-6$ and sum $-1$.'
        }
      ],
      conclusion: 'Even with negative or fractional exponents, the "Lowest Power" is always your GCF. This unlocks the quadratic structure inside.'
    },
    {
      id: 'ex-factoring-quadform',
      title: 'Factoring in Quadratic Form',
      problem: '\\text{Factor completely: } x^4 - 5x^2 + 4',
      steps: [
        {
          expression: '(x^2)^2 - 5(x^2) + 4',
          annotation: 'Step 1: Recognise the structure as $u^2 - 5u + 4$ where $u = x^2$.'
        },
        {
          expression: '(x^2 - 1)(x^2 - 4)',
          annotation: 'Step 2: Factor the trinomial. Need product $4$ and sum $-5$.'
        },
        {
          expression: '(x-1)(x+1)(x-2)(x+2)',
          annotation: 'Step 3: Each factor is a Difference of Squares. Break them down completely.'
        }
      ],
      conclusion: 'Many high-degree polynomials are just quadratics in disguise. Scaling the variable (substitution) reveals the path.'
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
          annotation: 'Step 1: Complete the square $(x^2+2)^2$ by adding and subtracting $4x^2$.'
        },
        {
          expression: '= (x^2+2)^2 - (2x)^2',
          annotation: 'Step 2: Recognize the difference of squares: $a = (x^2+2)$ and $b = (2x)$.'
        },
        {
          expression: '= (x^2 + 2x + 2)(x^2 - 2x + 2) \\qquad \\blacksquare',
          annotation: 'Step 3: Factors are the sum and difference. Both are irreducible over the reals.'
        }
      ],
      answer: '(x^2+2x+2)(x^2-2x+2)'
    }
  ],

  calcBridge: {
    teaser: 'In calculus, factoring is essential for two things: (1) evaluating limits of the form $0/0$ by cancelling a common factor, and (2) partial fraction decomposition for integration. A rational function cannot be integrated by any standard method until its denominator is fully factored.',
    linkedLessons: ['limits-and-continuity', 'logarithm-relationships'],
  },
}

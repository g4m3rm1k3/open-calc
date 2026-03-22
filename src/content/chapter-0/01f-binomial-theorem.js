export default {
  id: 'ch0-01f',
  slug: 'binomial-theorem',
  chapter: 0,
  order: 5.5, // Between partial fractions and trig review
  title: 'The Binomial Expansion',
  subtitle: 'Expanding powers without losing your mind',
  tags: ['algebra', 'binomial theorem', 'pascal\'s triangle', 'expansion', 'powers'],

  hook: {
    question: "If I ask you to compute $(x+3)^2$, you just FOIL it. But what if I need you to compute $(x+h)^5$? Multiplying five polynomials by hand is a punishment, not math. Luckily, there is a perfect geometric symmetry that does it for us in a matter of seconds.",
    realWorldContext: "The Binomial Theorem isn't just an algebra trick. It dictates the shapes of Gaussian distribution curves in probability, it drives combinatorial genetics, and in Calculus, it is the solitary key to unlocking the derivative of $x^{100}$.",
    previewVisualizationId: 'PascalsTriangle',
  },

  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'Every time you raise a binomial $(x+y)$ to a power $n$, you are secretly walking down Pascal\'s Triangle. The triangle generates the coefficients of the polynomial symmetrically.',
          'When we start calculus, the most important expression you will ever expand is $(x+h)^n$. Our goal isn\'t to memorize the whole massive polynomial, but to understand the shape of the expansion. The shape is always the same: $x$ starts at full power and drops, while $h$ starts at zero and rises, with Pascal\'s numbers glued to the front.'
        ]
      },
      {
        type: 'callout',
        title: 'Symmetry of Powers',
        body: "Look closely at the formula in the interactive below. If $n=4$, the terms are $x^4$, then $x^3h$, then $x^2h^2$, then $xh^3$, and finally $h^4$. The total power in each individual chunk always sums exactly to $n$.",
        type: 'tip'
      },
      { type: 'viz', id: 'PascalsTriangle', title: 'The Blueprint for Polynomials',
        caption: 'Drag the slider to build larger polynomials. Pay extremely close attention to the second block of the output. The coefficient is ALWAYS exactly the power $n$.',
      },
      { type: 'viz', id: 'VideoEmbed', title: 'Binomial Theorem Introduction', props: { url: 'https://www.youtube.com/embed/G8dHmjgzVFM' } },
    ],
  },

  math: {
    blocks: [
      {
        type: 'callout',
        title: 'The Binomial Theorem',
        body: "(x+y)^n = \\binom{n}{0}x^n y^0 + \\binom{n}{1}x^{n-1}y^1 + \\dots + \\binom{n}{n}x^0 y^n",
        type: 'theorem'
      },
      {
        type: 'prose',
        paragraphs: [
          'The funny brackets $\\binom{n}{k}$ are called the "binomial coefficients". They literally just mean "look at row $n$, col $k$, of Pascal\'s triangle".',
          'In future lessons when taking a limit, the expression $(x+h)^n$ will appear constantly. But because of the Binomial Theorem, we only care about the front of the train:'
        ]
      },
      {
        type: 'callout',
        title: 'The Only Calculus Line You Need to Memorize for x^n:',
        body: "(x+h)^n = x^n + n x^{n-1}h + \\text{terms containing } h^2 \\text{ or more}",
        type: 'definition'
      }
    ]
  },

  rigor: {
    blocks: [
      {
        type: 'stepthrough',
        title: 'Expanding $(x+3)^4$',
        steps: [
          { expression: "n = 4 \\implies \\text{Row 4 of Pascal's Triangle: } 1, 4, 6, 4, 1", annotation: "Step 1: Identify the coefficients from the triangle." },
          { expression: "1(x^4)(3^0) + 4(x^3)(3^1) + 6(x^2)(3^2) + 4(x^1)(3^3) + 1(x^0)(3^4)", annotation: "Step 2: Start x at power 4 going down. Start 3 at power 0 going up." },
          { expression: "x^4 + 4(x^3)(3) + 6(x^2)(9) + 4(x)(27) + 81", annotation: "Step 3: Simplify the powers of 3." },
          { expression: "x^4 + 12x^3 + 54x^2 + 108x + 81", annotation: "Step 4: Multiply out the coefficients." }
        ]
      }
    ]
  },

  examples: [
    {
      id: 'ch0-01f-ex1',
      title: 'Isolating Specific Terms',
      problem: "\\text{Find the coefficient of } x^3 \\text{ in the expansion of } (x+2)^5.",
      steps: [
        { expression: "\\text{Row 5 coefficients: } 1, 5, 10, 10, 5, 1", annotation: "List Pascal's Row 5." },
        { expression: "\\text{Term format: } (\\text{coef}) x^{(\\text{power})} (2)^{(\\text{remainder})}", annotation: "The total power is 5. So if x is power 3, then 2 must be power 2." },
        { expression: "x^3 \\implies \\text{Position } k=2 \\text{ (third term)}", annotation: "We count powers of x starting from x^5, x^4, x^3... which is the third position." },
        { expression: "\\text{Coefficient is } 10", annotation: "The third block in row 5 is 10." },
        { expression: "10(x^3)(2^2) = 10(x^3)(4) = 40x^3", annotation: "Compute the finalized component." }
      ],
      conclusion: 'The coefficient of x³ is 40. You don\'t need to expand the entire polynomial to find a single piece!'
    },
    {
      id: 'ch0-01f-ex2',
      title: 'The Calculus Preview',
      problem: "\\text{Expand } \\frac{(x+h)^3 - x^3}{h}. \\text{ Then determine what happens if } h \\text{ goes to zero.}",
      steps: [
        { expression: "(x+h)^3 = x^3 + 3x^2h + 3xh^2 + h^3", annotation: "Use row 3 (1, 3, 3, 1) to expand the binomial." },
        { expression: "\\frac{(x^3 + 3x^2h + 3xh^2 + h^3) - x^3}{h}", annotation: "Substitute the expansion into the fraction." },
        { expression: "\\frac{3x^2h + 3xh^2 + h^3}{h}", annotation: "The initial x³ cleanly cancels against the -x³ at the end." },
        { expression: "3x^2 + 3xh + h^2 \\quad (h \\neq 0)", annotation: "Since everything has an 'h', we can safely factor it out and cancel the denominator." },
        { expression: "\\text{If } h \\to 0 \\implies 3x^2 + 3x(0) + 0^2 = 3x^2", annotation: "Finally, let h go to zero. Every term except the first one evaporates!" }
      ],
      conclusion: 'This sequence is exactly what you will do to invent the Power Rule in Chapter 2. And the result is beautifully simple: 3x².'
    }
  ],
  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
  ],
};

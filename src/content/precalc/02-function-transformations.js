export default {
  id: 'ch1-graphs-002',
  slug: 'function-transformations',
  chapter: 'precalc-1',
  order: 2,
  title: 'Transformations: How Functions Move, Flip, and Stretch',
  subtitle: 'Building intuition for reading and predicting graph changes without plotting a single point',
  tags: ['transformations', 'shifts', 'reflections', 'stretches', 'even odd symmetry', 'inverse functions', 'piecewise', 'absolute value'],
  aliases: 'horizontal shift vertical shift reflection stretch compress even odd symmetry inverse function piecewise absolute value',

  hook: {
    question: 'If you know the graph of $f(x)$, how much of $g(x) = -2f(x-3) + 1$ can you sketch without doing any new calculations?',
    realWorldContext: 'Every audio equalizer shifts, scales, and reflects frequency curves. Image processing transforms — crop, scale, flip — are the same operations applied to 2D functions. In manufacturing, CNC tool paths are often defined as transformations of a base curve. The ability to read transformations saves enormous calculation time in calculus when integrating or differentiating transformed functions.',
  },

  intuition: {
    prose: [
      'A transformation is an operation on a function that moves or reshapes its graph in a predictable way. There are four fundamental types: **vertical shifts** (up/down), **horizontal shifts** (left/right), **reflections** (flips), and **scaling** (stretches/compressions). Every complicated-looking function is often just a base function with some combination of these applied.',
      'The counterintuitive one is the horizontal shift: $f(x - 3)$ shifts the graph **right** by 3, not left. Why? Because you need $x$ to be 3 units larger before the function "sees" the same input — so every point moves 3 units to the right. The sign inside the function is opposite to the direction of movement.',
      'When you compose multiple transformations, **order matters** in the horizontal direction. Horizontal shifts and horizontal stretches do not commute. The standard order for reading $af(b(x-h))+k$: horizontal shift by $h$, horizontal scale by $1/|b|$, vertical scale by $|a|$, reflections from signs, vertical shift by $k$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The master transformation formula',
        body: 'g(x) = a \\cdot f\\bigl(b(x - h)\\bigr) + k \\\\ a: \\text{vertical scale/reflect} \\quad b: \\text{horizontal scale/reflect} \\\\ h: \\text{horizontal shift (right if } h>0\\text{)} \\quad k: \\text{vertical shift (up if } k>0\\text{)}',
      },
      {
        type: 'warning',
        title: 'The horizontal direction is always backwards',
        body: 'f(x-3) \\to \\text{RIGHT 3} \\qquad f(x+3) \\to \\text{LEFT 3} \\\\ f(2x) \\to \\text{COMPRESS horizontally by } \\tfrac{1}{2} \\qquad f(\\tfrac{x}{2}) \\to \\text{STRETCH horizontally by } 2',
      },
      {
        type: 'insight',
        title: 'Reading a transformation in plain English',
        body: 'g(x) = -2f(x-3) + 1: \\text{ shift right 3, vertical stretch by 2, reflect over } x\\text{-axis, shift up 1}',
      },
    ],
    visualizations: [
      {
        id: 'TransformationBuilderViz',
        title: 'Build a Transformation Live',
        mathBridge: 'Adjust $a$, $b$, $h$, $k$ with sliders and watch exactly how each parameter moves the graph. The base function $f(x) = x^2$ is your reference.',
        caption: 'Every parameter has a single, predictable effect. Build the intuition by isolating one at a time.',
        props: { baseFunction: 'quadratic' },
      },
                            ],
  },

  math: {
    prose: [
      '**Even and odd symmetry** are graph properties with deep algebraic meaning. An even function satisfies $f(-x) = f(x)$ for all $x$ — its graph is symmetric about the $y$-axis. An odd function satisfies $f(-x) = -f(x)$ — its graph has 180° rotational symmetry about the origin. Most functions are neither.',
      'Why does this matter in calculus? The integral of an odd function over $[-a, a]$ is always zero — the areas on either side cancel. The integral of an even function over $[-a, a]$ doubles the integral over $[0, a]$. Recognizing symmetry can instantly halve your work.',
      '**Inverse functions** undo each other: $(f \\circ f^{-1})(x) = x$. Graphically, $f^{-1}$ is the reflection of $f$ over the line $y = x$. This is because every point $(a, b)$ on $f$ corresponds to the point $(b, a)$ on $f^{-1}$ — the coordinates swap, and swapping coordinates is exactly reflection over $y = x$.',
      '**Piecewise functions** and **absolute value** graphs are not strange exceptions — they are ordinary functions that behave differently on different domains. Absolute value is the simplest piecewise function: $|x| = x$ when $x \\geq 0$ and $|x| = -x$ when $x < 0$. The graph is a V-shape. Every absolute value equation or inequality should be split into two cases at the point where the inside equals zero.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Even and odd — algebraic test',
        body: '\\text{Even: } f(-x) = f(x) \\text{ for all } x \\quad (\\text{e.g., } x^2, \\cos x, |x|) \\\\ \\text{Odd: } f(-x) = -f(x) \\text{ for all } x \\quad (\\text{e.g., } x^3, \\sin x, x)',
      },
      {
        type: 'insight',
        title: 'Even + odd decomposition — every function has this',
        body: 'f(x) = \\underbrace{\\frac{f(x)+f(-x)}{2}}_{\\text{even part}} + \\underbrace{\\frac{f(x)-f(-x)}{2}}_{\\text{odd part}}',
      },
      {
        type: 'theorem',
        title: 'Inverse function existence condition',
        body: 'f^{-1} \\text{ exists} \\iff f \\text{ is one-to-one (injective)} \\iff f \\text{ passes the horizontal line test} \\\\ \\text{Graphically: no horizontal line crosses the graph more than once.}',
      },
      {
        type: 'definition',
        title: 'Absolute value as piecewise',
        body: '|x| = \\begin{cases} x & x \\geq 0 \\\\ -x & x < 0 \\end{cases} \\qquad |f(x)| = \\begin{cases} f(x) & f(x) \\geq 0 \\\\ -f(x) & f(x) < 0 \\end{cases}',
      },
      {
        type: 'warning',
        title: 'Inverses require restricted domains for non-injective functions',
        body: '\\sin x \\text{ is not one-to-one, so } \\sin^{-1} x \\text{ requires restricting to } [-\\pi/2, \\pi/2]. \\\\ \\text{Always state the domain when defining an inverse.}',
      },
    ],
    visualizations: [
      {
        id: 'EvenOddSymmetryViz',
        title: 'Even, Odd, and Neither — Live Classification',
        mathBridge: 'For any function, the even part folds symmetrically over the $y$-axis; the odd part rotates 180° around the origin. Together they reconstruct the original.',
        caption: 'Test a function by checking $f(-x)$ — it either matches $f(x)$, negates it, or neither.',
      },
      {
        id: 'InverseFunctionViz',
        title: 'Inverse as Reflection Over $y = x$',
        mathBridge: 'Every point $(a,b)$ on $f$ maps to $(b,a)$ on $f^{-1}$. That swap is reflection over $y=x$.',
        caption: 'A function and its inverse are mirror images across the diagonal line.',
      },
      {
        id: 'UniversalInverseLab',
        title: 'Inverse Reflection Across Function Families',
        mathBridge: 'Try several one-to-one functions and see the same coordinate swap $(a,b)\leftrightarrow(b,a)$ each time. This generalizes inverse reflection beyond one canned graph.',
        caption: 'Switch presets to see inverse reflection as a universal rule, not a one-example trick.',
      },
    ],
  },

  rigor: {
    title: 'Why reflecting over $y = x$ gives the inverse',

    proofSteps: [
      {
        expression: '\\text{Let } (a, b) \\text{ be any point on } f. \\text{ Then } f(a) = b.',
        annotation: 'Starting point: any point on the original function.',
      },
      {
        expression: 'f(a) = b \\iff a = f^{-1}(b)',
        annotation: 'By definition of inverse function: $f^{-1}$ undoes $f$, so $f^{-1}(b) = a$.',
      },
      {
        expression: '\\therefore (b, a) \\text{ lies on the graph of } f^{-1}',
        annotation: 'The inverse function passes through $(b, a)$ whenever $f$ passes through $(a, b)$.',
      },
      {
        expression: '(a,b) \\xrightarrow{\\text{reflect over } y=x} (b,a)',
        annotation: 'Reflection over $y=x$ swaps the two coordinates: $(x,y) \\to (y,x)$. This is exactly what we found.',
      },
      {
        expression: '\\therefore \\text{graph}(f^{-1}) = \\text{reflection of graph}(f) \\text{ over } y = x \\qquad \\blacksquare',
        annotation: 'The inverse graph is always the $y=x$ reflection. This is not a convention — it follows from the definition.',
      },
    ],
  },

  examples: [
    {
      id: 'ch1-002-ex1',
      title: 'Decomposing a composed transformation',
      problem: '\\text{Describe all transformations in } g(x) = -\\tfrac{1}{2}f(2x + 6) + 3.',
      steps: [
        {
          expression: 'g(x) = -\\tfrac{1}{2}f\\bigl(2(x + 3)\\bigr) + 3',
          annotation: 'Factor the inside first: $2x + 6 = 2(x+3)$. This reveals the horizontal shift clearly.',
        },
        {
          expression: 'b = 2 \\Rightarrow \\text{compress horizontally by } \\tfrac{1}{2}',
          annotation: 'The $b=2$ inside compresses the graph horizontally — each $x$-value is halved.',
        },
        {
          expression: 'h = -3 \\Rightarrow \\text{shift LEFT 3}',
          annotation: 'Inside the function we have $(x - (-3))$, so $h = -3$: shift left by 3.',
        },
        {
          expression: 'a = -\\tfrac{1}{2} \\Rightarrow \\text{vertical compress by } \\tfrac{1}{2} \\text{ and reflect over } x\\text{-axis}',
          annotation: 'The negative reflects over the $x$-axis. The $\\tfrac{1}{2}$ compresses vertically.',
        },
        {
          expression: 'k = 3 \\Rightarrow \\text{shift up 3}',
          annotation: 'Final step: vertical shift up 3 units.',
        },
      ],
      conclusion: 'Always factor the horizontal part before reading off the shift. The order to apply: horizontal shift, horizontal scale, vertical scale/reflect, vertical shift.',
    },
    {
      id: 'ch1-002-ex2',
      title: 'Testing even/odd symmetry',
      problem: '\\text{Is } f(x) = x^4 - 3x^2 + 1 \\text{ even, odd, or neither?}',
      steps: [
        {
          expression: 'f(-x) = (-x)^4 - 3(-x)^2 + 1 = x^4 - 3x^2 + 1',
          annotation: 'Substitute $-x$ everywhere. Even powers eliminate the negatives.',
        },
        {
          expression: 'f(-x) = f(x) \\checkmark',
          annotation: 'The result equals the original function exactly — the function is even.',
        },
      ],
      conclusion: 'All polynomials with only even-degree terms are even functions. Their graphs are symmetric about the $y$-axis.',
    },
    {
      id: 'ch1-002-ex3',
      title: 'Solving an absolute value equation — the two-case split',
      problem: '\\text{Solve } |2x - 5| = 7.',
      steps: [
        {
          expression: '2x - 5 = 7 \\quad \\text{or} \\quad 2x - 5 = -7',
          annotation: '$|A| = 7$ means $A = 7$ or $A = -7$. Always split into two equations.',
        },
        {
          expression: 'x = 6 \\quad \\text{or} \\quad x = -1',
          annotation: 'Solve each equation. Two solutions: the graph $y = |2x-5|$ crosses $y=7$ at both these points.',
        },
      ],
      conclusion: 'Absolute value equations always produce two cases (unless the value is 0 or negative). Each case corresponds to one branch of the V-shaped graph.',
    },
    {
      id: 'ch1-002-ex4',
      title: 'Finding an inverse function algebraically and graphically',
      problem: '\\text{Find } f^{-1}(x) \\text{ for } f(x) = 2x - 4. \\text{ Verify graphically.}',
      steps: [
        {
          expression: 'y = 2x - 4 \\Rightarrow x = 2y - 4 \\Rightarrow y = \\tfrac{x+4}{2}',
          annotation: 'Swap $x$ and $y$ (reflecting), then solve for the new $y$. This IS the reflection procedure.',
        },
        {
          expression: 'f^{-1}(x) = \\tfrac{x+4}{2} = \\tfrac{1}{2}x + 2',
          annotation: 'The inverse. Note: slope $2$ becomes slope $\\tfrac{1}{2}$ — slopes of inverse functions are reciprocals.',
        },
        {
          expression: 'f(f^{-1}(x)) = 2\\bigl(\\tfrac{x+4}{2}\\bigr) - 4 = x + 4 - 4 = x \\checkmark',
          annotation: 'Verify: composing $f$ and $f^{-1}$ gives $x$ — they undo each other.',
        },
      ],
      conclusion: 'Algebraic method: swap $x \\leftrightarrow y$, solve for $y$. The resulting function has reciprocal slope and the $y$-intercept changes. The two graphs are mirror images over $y=x$.',
    },
  ],

  challenges: [
    {
      id: 'ch1-002-ch1',
      difficulty: 'hard',
      problem: '\\text{A function } f \\text{ has the graph shown. Sketch } g(x) = |f(x)| \\text{ and } h(x) = f(|x|).',
      hint: 'For $|f(x)|$: reflect any part of $f$ that goes below the $x$-axis upward. For $f(|x|)$: keep the right half of $f$, then mirror it to the left.',
      walkthrough: [
        {
          expression: '|f(x)|: \\text{ wherever } f(x) < 0, \\text{ reflect that portion up (negate the } y\\text{-values)}',
          annotation: '$|f(x)|$ takes the absolute value of the output — anything below the $x$-axis folds up.',
        },
        {
          expression: 'f(|x|): \\text{ for } x<0, |x| = -x, \\text{ so the left side mirrors the right side}',
          annotation: '$f(|x|)$ takes the absolute value of the input — the left half becomes a reflection of the right half. The result is always an even function.',
        },
      ],
      answer: '|f(x)|\\text{ folds negative outputs up; } f(|x|) \\text{ makes the graph even (symmetric about } y\\text{-axis)}.',
    },
    {
      id: 'ch1-002-ch2',
      difficulty: 'medium',
      problem: '\\text{Prove that } f(x) = x^3 + x \\text{ is odd, then use this to evaluate } \\int_{-2}^{2}(x^3+x)\\,dx \\text{ without computing.}',
      hint: 'Test $f(-x) = -f(x)$. Then recall what odd symmetry means for a definite integral over a symmetric interval.',
      walkthrough: [
        {
          expression: 'f(-x) = (-x)^3 + (-x) = -x^3 - x = -(x^3+x) = -f(x) \\checkmark',
          annotation: 'The function is odd: every odd-power polynomial with no even terms is odd.',
        },
        {
          expression: '\\int_{-2}^{2} f(x)\\,dx = 0 \\text{ for any odd function}',
          annotation: 'The area on the right cancels the area on the left by symmetry — no computation needed.',
        },
      ],
      answer: '\\int_{-2}^{2}(x^3+x)\\,dx = 0 \\text{ by odd symmetry.}',
    },
  ],
}

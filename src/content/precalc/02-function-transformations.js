export default {
  id: 'ch1-graphs-002',
  slug: 'function-transformations',
  chapter: 'precalc-1',
  order: 2,
  title: 'Transformations: How Functions Move, Flip, and Stretch',
  subtitle: 'Building intuition and algebraic rigor for reading complex functions',
  tags: ['transformations', 'shifts', 'reflections', 'stretches', 'even odd symmetry', 'inverse functions', 'piecewise', 'absolute value', 'decomposition'],
  aliases: 'horizontal shift vertical shift reflection stretch compress even odd symmetry inverse function piecewise absolute value decomposition',

  hook: {
    question: 'How does an audio equalizer change the sound of your music? How does a heart monitor (ECG) adjust the signal you see on the screen?',
    realWorldContext: 'Transformations are the "remote control" for math. In **Engineering**, an Equalizer scales the amplitude ($a$) of specific frequencies. In **Computer Graphics**, every move, zoom, or flip you do in Photoshop is a combination of $(x, y)$ transformations. In **Medicine**, an ECG technician might shift or scale a heart rhythm signal to make it easier to read. Understanding these moves allows you to "read" a complex system by seeing the simple base function hiding inside it.',
  },

  intuition: {
    prose: [
      'Think of a function like a machine. $f(x)$ is the machine. Transformations are things you do to the **Input** ($x$) before it enters the machine, or to the **Output** ($y$) after it leaves.',
      '**Outside the Machine (Vertical)**: These effects happen *after* the function has done its work. $f(x) + k$ moves the result up or down. $a \\cdot f(x)$ stretches or compresses the result. These are "Post-Processing" steps affecting the baseline and magnitude.',
      '**Inside the Machine (Horizontal)**: These happen *before* the function sees the data. $f(x - h)$ moves the graph **Right**. Why? Think of $x$ as "Time." If you subtract 3 from the time before the machine sees it ($f(x-3)$), you are **delaying** the input. The signal that used to happen at $t=0$ now has to wait until $t=3$ to happen. A delay moves the whole picture to the right.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Cognitive Framing: The Remote Control',
        body: '\\text{Inside (Input): Changes the "When" and "How fast."} \\\\ \\text{Outside (Output): Changes the "Where" and "How much."}',
      },
      {
        type: 'definition',
        title: 'Injective Functions (One-to-One)',
        body: 'f(x_1) = f(x_2) \\iff x_1 = x_2 \\\\ \\text{This is the formal requirement for an inverse function to exist.}',
      },
      {
        type: 'insight',
        title: 'The "Inside-is-Inverse" Rule',
        body: '\\text{Horizontal changes ($b, h$) always behave opposite to what you expect.} \\\\ f(x-3) \\implies \\text{RIGHT 3 (Delay)} \\\\ f(2x) \\implies \\text{COMPRESS by } \\tfrac{1}{2} \\text{ (Input is doubled, so you need less } x \\text{ to get the same result)}',
      },
      {
        type: 'definition',
        title: 'The Identity Axis ($y=x$)',
        body: '\\text{The line where input equals output. All inverse relationships are reflections across this diagonal baseline.}',
      },
    ],
    visualizations: [
      {
        id: 'TransformationBuilderViz',
        title: 'The Function Remote Control',
        mathBridge: 'Slide $h$ to "delay" the input (shift right) or $a$ to "amplify" the signal (stretch up). Notice how $b > 1$ "speeds up" the function (horizontal compression).',
        caption: 'Inside changes the experience; Outside changes the outcome.',
        props: { baseFunction: 'quadratic' },
      },
    ],
  },

  math: {
    prose: [
      'Mastering transformations is the art of manipulating the flow of data through a functional machine. These operations are categorized by where they occur in the order of evaluation.',
      '**Functional Pre-composition (Horizontal)**: Operations performed on the input variable $x$ *before* the function $f$ is evaluated. $f(x-h)$ is a horizontal shift because it modifies the "Clock" of the system. This is the **Input Domain** layer.',
      '**Functional Post-composition (Vertical)**: Operations applied to the result $f(x)$ *after* evaluation. $a \\cdot f(x) + k$ scales and offsets the system baseline. This is the **Output Range** layer.',
      '**The Principle of Reversibility (Inverses)**: An **Inverse Function** $f^{-1}(x)$ "undoes" the action of $f$. Geometrically, this is a reflection over the line $y=x$. Since the roles of input and output are interchanged, the domain of $f$ becomes the range of $f^{-1}$, and vice-versa.',
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
      {
        type: 'theorem',
        title: 'Master Transformation Identity',
        body: 'g(x) = a \\cdot f\\bigl(b(x - h)\\bigr) + k \\\\ \\text{Order: Horizontal Shift } \\to \\text{Horizontal Stretch } \\to \\text{Reflection } \\to \\text{Vertical Stretch } \\to \\text{Vertical Shift}',
      },
      {
        type: 'definition',
        title: 'Geometric Inversion Rule',
        body: 'f(a) = b \\iff f^{-1}(b) = a \\\\ \\text{Point } (a,b) \\text{ on } f \\iff \\text{Point } (b,a) \\text{ on } f^{-1}',
      },
      {
        type: 'warning',
        title: 'Horizontal behavior is reciprocal',
        body: '\\text{For } f(bx), \\text{ the graph is compressed by a factor of } 1/b. \\\\ \\text{This is because the input "speeds up," reaching values faster than before.}',
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
      {
        id: 'InverseFunctionViz',
        title: 'Reflecting the Logic',
        mathBridge: 'Toggle the "Inverse" switch. Watch how the point $(a, b)$ is mirrored across the line $y=x$ to become $(b, a)$. This is the physical representation of functional reversal.',
        caption: 'The inverse is a swap of roles: Input $\\leftrightarrow$ Output.',
      },
    ],
  },

  rigor: {
    title: 'Proving Inverse Geometry',
    prose: [
      'Why is the inverse a reflection over $y=x$? We can prove this by examining the transformation of coordinates.'
    ],
    proofSteps: [
      {
        expression: '\\text{Let } f(a) = b. \\text{ By definition, } (a, b) \\text{ lies on the graph of } f.',
        annotation: 'Define a point in the original function\'s space.'
      },
      {
        expression: '\\text{The inverse function satisfies } f^{-1}(b) = a. \\text{ Thus, } (b, a) \\text{ lies on } f^{-1}.',
        annotation: 'The definition of an inverse is the reversal of input and output positions.'
      },
      {
        expression: '\\text{Midpoint of } (a, b) \\text{ and } (b, a) = \\left( \\frac{a+b}{2}, \\frac{a+b}{2} \\right)',
        annotation: 'The midpoint between a point and its inverse always lies on the line $y=x$.'
      },
      {
        expression: 'm_{line} = \\frac{a-b}{b-a} = -1. \\text{ Slope of } y=x \\text{ is } 1.',
        annotation: 'The segment connecting $(a,b)$ to $(b,a)$ is perpendicular to $y=x$. Thus, the inverse is a perfect reflection across $y=x$.'
      }
    ]
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
    {
      id: 'ex-inverse-algebra',
      title: 'Algebra: Finding a Rational Inverse',
      problem: '\\text{Find the inverse of } f(x) = \\frac{2x + 1}{x - 3}.',
      steps: [
        {
          expression: 'x = \\frac{2y + 1}{y - 3}',
          annotation: 'Step 1: Swap $x$ and $y$ to represent the functional reversal.'
        },
        {
          expression: 'x(y - 3) = 2y + 1 \\implies xy - 3x = 2y + 1',
          annotation: 'Step 2: Cross-multiply and distribute to isolate $y$.'
        },
        {
          expression: 'xy - 2y = 3x + 1 \\implies y(x - 2) = 3x + 1',
          annotation: 'Step 3: Collect terms with $y$ on one side and factor out $y$.'
        },
        {
          expression: 'y = \\frac{3x + 1}{x - 2}',
          annotation: 'Step 4: Divide to solve for $y$. This is $f^{-1}(x)$.'
        }
      ],
      conclusion: 'The inverse is $f^{-1}(x) = \\frac{3x+1}{x-2}$. Note how the original VA ($x=3$) became the inverse HA ($y=3$).'
    },
    {
      id: 'ex-trans-audio',
      title: 'Applied: Audio Signal Decomposition',
      problem: '\\text{Decompose } g(x) = -3f(x + 2) - 4. \\text{ Describe the signal\'s history.}',
      steps: [
        {
          expression: 'f(x) \\xrightarrow{\\text{Left 2}} f(x+2)',
          annotation: 'Inside: Shift left by 2 (Advance the signal).'
        },
        {
          expression: 'f(x+2) \\xrightarrow{\\text{Reflect}} -f(x+2)',
          annotation: 'Outside: Reflect over the x-axis (Invert the phase).'
        },
        {
          expression: '-f(x+2) \\xrightarrow{\\text{Scale 3}} -3f(x+2)',
          annotation: 'Outside: Stretch by 3 (Amplify the signal).'
        },
        {
          expression: '-3f(x+2) \\xrightarrow{\\text{Down 4}} g(x)',
          annotation: 'Outside: Shift down by 4 (Add a DC offset).'
        }
      ],
      conclusion: 'The signal was advanced, inverted, amplified, and then offset.'
    }
  ],

  challenges: [
    {
      id: 'ch-02-01',
      difficulty: 'medium',
      problem: '\\text{If } f(3) = 10, \\text{ what is } f^{-1}(10)?',
      answer: '3'
    },
    {
      id: 'ch-02-02',
      difficulty: 'hard',
      problem: '\\text{Identify the domain of } f(g(x)) \\text{ if } f(x) = \\sqrt{x} \\text{ and } g(x) = x - 5.',
      walkthrough: [
        { expression: 'g(x) \\geq 0 \\implies x - 5 \\geq 0', annotation: 'The output of $g$ must be in the domain of $f$.' },
        { expression: 'x \\geq 5', annotation: 'Solve the inequality.' }
      ],
      answer: '[5, \\infty)'
    },
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

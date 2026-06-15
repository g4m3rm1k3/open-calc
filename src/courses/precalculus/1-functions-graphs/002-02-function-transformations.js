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
    realWorldContext: 'Transformations are the "remote control" of mathematics. In **Engineering**, an equalizer scales the amplitude of specific frequencies. In **Computer Graphics**, every move, zoom, or flip in Photoshop is a combination of $(x, y)$ transformations. In **Medicine**, an ECG technician might shift or scale a heart rhythm signal to make it easier to read. Understanding these moves lets you "read" a complex function by seeing the simple base function hidden inside it.',
    previewVisualizationId: 'TransformationBuilderViz',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** The previous lesson built the Cartesian plane — you can now locate points, measure distances, and read a graph\'s landmarks. This lesson answers the next question: once you have a function\'s graph, what happens to it when you modify the equation? Every transformation is a predictable, reversible move in the coordinate plane.',
      'Think of a function as a machine. $f(x)$ is the machine. Transformations are things you do to the **input** ($x$) before it enters the machine, or to the **output** ($y$) after it leaves. These two locations — inside and outside the function — behave very differently.',
      '**Outside the machine (vertical effects)**: $f(x) + k$ moves the output up by $k$. $a \\cdot f(x)$ stretches the output by factor $|a|$. If $a < 0$, the output flips. These are post-processing steps — they change how tall or where the result sits.',
      '**Inside the machine (horizontal effects)**: $f(x - h)$ shifts the graph *right* by $h$. This seems backward — why does subtracting shift right? Think of $x$ as "time." Subtracting 3 from the time input ($f(x-3)$) delays the signal: the event that used to happen at $t=0$ now waits until $t=3$. A delay is a rightward shift. Inside changes are always the opposite of what the sign suggests.',
      '**Where this is heading:** The next lesson uses these tools to read a function\'s long-run behavior — asymptotes, extrema, and concavity. Transformations let you see *which family* a function belongs to and *how* it has been moved or stretched from its base form.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Precalc arc — Lesson 2 of 5',
        body: '← Graphs & Coordinate Geometry | **Function Transformations** | Function Behaviour →',
      },
      {
        type: 'insight',
        title: 'The input/output framing',
        body: '\\text{Inside (Input): Changes the "When" and "How fast."} \\\\ \\text{Outside (Output): Changes the "Where" and "How much."}',
      },
      {
        type: 'insight',
        title: 'The "inside-is-inverse" rule',
        body: '\\text{Horizontal changes always behave opposite to what you expect.} \\\\ f(x-3) \\implies \\text{RIGHT 3 (delay)} \\\\ f(2x) \\implies \\text{COMPRESS by } \\tfrac{1}{2} \\text{ (input doubled, so less } x \\text{ needed)}',
      },
      {
        type: 'definition',
        title: 'Injective functions — the condition for an inverse to exist',
        body: 'f(x_1) = f(x_2) \\iff x_1 = x_2 \\\\ \\text{This is the formal requirement for an inverse function to exist.}',
      },
      {
        type: 'definition',
        title: 'The identity axis ($y = x$)',
        body: '\\text{The line where input equals output.} \\\\ \\text{All inverse relationships are reflections across this diagonal.}',
      },
    ],
    visualizations: [
      {
        id: 'TransformationBuilderViz',
        title: 'The Function Remote Control',
        mathBridge: 'Step 1: Start with $a = 1$, $b = 1$, $h = 0$, $k = 0$ — this is the base function. Step 2: Increase $k$ to 2. The entire graph lifts. Decrease to $-2$: it drops. This is a vertical shift — output changes directly with $k$. Step 3: Now increase $h$ to 3. The graph slides right. This seems backward from the sign — the minus inside $f(x - h)$ causes a rightward shift. Step 4: Set $b = 2$. Watch the graph compress horizontally — the function "speeds up" because the input is doubled. The key lesson: inside changes are always opposite to their signs; outside changes are direct.',
        caption: 'Inside changes the experience; outside changes the outcome.',
        props: { baseFunction: 'quadratic' },
      },
    ],
  },

  math: {
    prose: [
      'The master transformation formula $g(x) = a \\cdot f(b(x-h)) + k$ encodes all four transformation types in one expression. Reading it correctly requires applying the operations in the right order.',
      '**Horizontal layer (inside $f$)**: Factor any coefficient out of the argument first. $f(2x+6) = f(2(x+3))$ — the shift is $h = -3$ (left 3), not $h = 6$. Horizontal scale $b = 2$ compresses by $1/2$.',
      '**Vertical layer (outside $f$)**: $a$ stretches (if $|a|>1$) or compresses (if $|a|<1$). Negative $a$ reflects over the $x$-axis. $k$ shifts up or down.',
      '**The Principle of Reversibility — Inverses**: An inverse function $f^{-1}(x)$ "undoes" $f$. Geometrically, it is the reflection of $f$ over the line $y = x$ — because the roles of input and output swap. The domain of $f$ becomes the range of $f^{-1}$, and vice versa.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Master transformation identity',
        body: 'g(x) = a \\cdot f\\bigl(b(x - h)\\bigr) + k \\\\ \\text{Order: Horizontal Shift } \\to \\text{Horizontal Scale} \\to \\text{Vertical Scale/Reflect} \\to \\text{Vertical Shift}',
      },
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
        body: 'f^{-1} \\text{ exists} \\iff f \\text{ is one-to-one (injective)} \\iff \\text{passes the horizontal line test} \\\\ \\text{Graphically: no horizontal line crosses the graph more than once.}',
      },
      {
        type: 'definition',
        title: 'Absolute value as piecewise',
        body: '|x| = \\begin{cases} x & x \\geq 0 \\\\ -x & x < 0 \\end{cases} \\qquad |f(x)| = \\begin{cases} f(x) & f(x) \\geq 0 \\\\ -f(x) & f(x) < 0 \\end{cases}',
      },
      {
        type: 'definition',
        title: 'Geometric inversion rule',
        body: 'f(a) = b \\iff f^{-1}(b) = a \\\\ \\text{Point } (a,b) \\text{ on } f \\iff \\text{Point } (b,a) \\text{ on } f^{-1}',
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
        mathBridge: 'Step 1: Select an even function. Notice the left and right halves are mirror images across the $y$-axis — $f(-x) = f(x)$. Step 2: Select an odd function. The graph has 180° rotational symmetry around the origin. Step 3: Watch the even/odd decomposition panel if available: every function splits into a symmetric part (even) and a rotational part (odd). The key lesson: symmetry is an algebraic property testable with $f(-x)$, not just a visual impression.',
        caption: 'Test a function by checking $f(-x)$ — it either matches $f(x)$, negates it, or neither.',
      },
      {
        id: 'InverseFunctionViz',
        title: 'Inverse as Reflection Over $y = x$',
        mathBridge: 'Step 1: Observe the function curve and the diagonal line $y = x$. Step 2: Toggle the inverse on. Watch the graph flip across the diagonal — every point $(a, b)$ on the original maps to $(b, a)$ on the inverse. Step 3: Pick a specific point $(a, b)$ on the original and verify the inverse passes through $(b, a)$. The key lesson: the coordinate swap $(x, y) \\to (y, x)$ is exactly what reflection over $y = x$ does geometrically.',
        caption: 'A function and its inverse are mirror images across the diagonal line.',
      },
      {
        id: 'UniversalInverseLab',
        title: 'Inverse Reflection Across Function Families',
        mathBridge: 'Step 1: Try a linear function. Note the inverse is also linear with reciprocal slope. Step 2: Try a quadratic (restricted domain). The inverse is the square root function. Step 3: Try an exponential. The inverse is a logarithm. The key lesson: the coordinate swap $(a, b) \\leftrightarrow (b, a)$ is universal — it generates the inverse for every injective function, not just special cases.',
        caption: 'Switch presets to see inverse reflection as a universal rule.',
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
        annotation: 'Reflection over $y=x$ swaps the two coordinates: $(x,y) \\to (y,x)$. This is exactly the coordinate swap we found.',
      },
      {
        expression: '\\therefore \\text{graph}(f^{-1}) = \\text{reflection of graph}(f) \\text{ over } y = x \\qquad \\blacksquare',
        annotation: 'The inverse graph is always the $y=x$ reflection. This follows from the definition — it is not a convention.',
      },
    ],
  },

  examples: [
    {
      id: 'ch1-002-ex1',
      title: 'Decomposing a composed transformation',
      problem: 'Describe all transformations in $g(x) = -\\tfrac{1}{2}f(2x + 6) + 3$.',
      steps: [
        {
          expression: 'g(x) = -\\tfrac{1}{2}f\\bigl(2(x + 3)\\bigr) + 3',
          annotation: 'Factor the inside first: $2x + 6 = 2(x+3)$. This reveals the horizontal shift clearly.',
          hint: 'Always factor the inside expression before reading transformations. $2x + 6 = 2(x+3)$ shows $b = 2$ and $h = -3$ (shift left 3).',
        },
        {
          expression: 'b = 2 \\Rightarrow \\text{compress horizontally by } \\tfrac{1}{2}',
          annotation: 'The $b = 2$ inside compresses the graph horizontally — each $x$-value is halved.',
          hint: 'Inside scaling is the reciprocal: $b = 2$ means the input is doubled, so the graph is compressed to $\\frac{1}{b} = \\frac{1}{2}$ of its original width.',
        },
        {
          expression: 'h = -3 \\Rightarrow \\text{shift LEFT 3}',
          annotation: 'Inside the function we have $(x - (-3))$, so $h = -3$: shift left by 3.',
          hint: 'The form is $f(b(x - h))$. Here $x + 3 = x - (-3)$, so $h = -3$. Negative $h$ means leftward shift.',
        },
        {
          expression: 'a = -\\tfrac{1}{2} \\Rightarrow \\text{vertical compress by } \\tfrac{1}{2} \\text{ and reflect over } x\\text{-axis}',
          annotation: 'The negative reflects over the $x$-axis. The $\\tfrac{1}{2}$ compresses vertically.',
          hint: 'The sign of $a$ determines reflection (negative = flip over $x$-axis). The magnitude of $a$ determines vertical stretch/compress.',
        },
        {
          expression: 'k = 3 \\Rightarrow \\text{shift up 3}',
          annotation: 'Final step: vertical shift up 3 units.',
          hint: '$k$ is added after everything else. Positive $k$ = up. Negative $k$ = down.',
        },
      ],
      conclusion: 'Always factor the horizontal part before reading the shift. Order of application: horizontal shift, horizontal scale, vertical scale/reflect, vertical shift.',
    },
    {
      id: 'ch1-002-ex2',
      title: 'Testing even/odd symmetry',
      problem: 'Is $f(x) = x^4 - 3x^2 + 1$ even, odd, or neither?',
      steps: [
        {
          expression: 'f(-x) = (-x)^4 - 3(-x)^2 + 1 = x^4 - 3x^2 + 1',
          annotation: 'Substitute $-x$ everywhere. Even powers eliminate the negatives.',
          hint: 'Replace every $x$ with $-x$. For even powers: $(-x)^2 = x^2$, $(-x)^4 = x^4$. Odd powers: $(-x)^3 = -x^3$.',
        },
        {
          expression: 'f(-x) = f(x) \\checkmark',
          annotation: 'The result equals the original function — the function is even.',
          hint: 'Compare $f(-x)$ to $f(x)$ and $-f(x)$. Here $f(-x) = f(x)$, so it\'s even. The graph is symmetric about the $y$-axis.',
        },
      ],
      conclusion: 'All polynomials with only even-degree terms are even functions. Their graphs are symmetric about the $y$-axis.',
    },
    {
      id: 'ch1-002-ex3',
      title: 'Solving an absolute value equation — the two-case split',
      problem: 'Solve $|2x - 5| = 7$.',
      steps: [
        {
          expression: '2x - 5 = 7 \\quad \\text{or} \\quad 2x - 5 = -7',
          annotation: '$|A| = 7$ means $A = 7$ or $A = -7$. Always split into two equations.',
          hint: 'Absolute value means the expression inside can be either $+7$ or $-7$. Write both cases.',
        },
        {
          expression: 'x = 6 \\quad \\text{or} \\quad x = -1',
          annotation: 'Solve each equation. Two solutions: the graph $y = |2x-5|$ crosses $y = 7$ at both these $x$-values.',
          hint: 'Case 1: $2x = 12 \\Rightarrow x = 6$. Case 2: $2x = -2 \\Rightarrow x = -1$.',
        },
      ],
      conclusion: 'Absolute value equations always produce two cases (unless the value is 0 or negative). Each case corresponds to one branch of the V-shaped graph.',
    },
    {
      id: 'ch1-002-ex4',
      title: 'Finding an inverse function algebraically',
      problem: 'Find $f^{-1}(x)$ for $f(x) = 2x - 4$. Verify by composition.',
      steps: [
        {
          expression: 'y = 2x - 4 \\Rightarrow x = 2y - 4 \\Rightarrow y = \\tfrac{x+4}{2}',
          annotation: 'Swap $x$ and $y$ (the coordinate swap of the reflection), then solve for the new $y$.',
          hint: 'Step 1: Write $y = f(x)$. Step 2: Swap $x$ and $y$. Step 3: Solve for $y$ — that gives $f^{-1}(x)$.',
        },
        {
          expression: 'f^{-1}(x) = \\tfrac{x+4}{2} = \\tfrac{1}{2}x + 2',
          annotation: 'The inverse. Slope $2$ becomes slope $\\tfrac{1}{2}$ — slopes of linear inverses are reciprocals.',
          hint: 'The slope of the inverse is the reciprocal of the original slope. If $f$ has slope 2, $f^{-1}$ has slope $\\frac{1}{2}$.',
        },
        {
          expression: 'f(f^{-1}(x)) = 2\\bigl(\\tfrac{x+4}{2}\\bigr) - 4 = x + 4 - 4 = x \\checkmark',
          annotation: 'Verify: composing $f$ and $f^{-1}$ gives $x$ — they undo each other.',
          hint: 'Substitute $f^{-1}(x)$ into $f$. If $f(f^{-1}(x)) = x$, the inverse is correct.',
        },
      ],
      conclusion: 'Algebraic method: swap $x \\leftrightarrow y$, solve for $y$. The two graphs are mirror images over $y = x$.',
    },
  ],

  challenges: [
    {
      id: 'ch1-002-ch1',
      difficulty: 'hard',
      problem: 'A function $f$ has a graph. Describe how the graphs of $g(x) = |f(x)|$ and $h(x) = f(|x|)$ differ from $f$.',
      hint: 'For $|f(x)|$: reflect any part of $f$ that goes below the $x$-axis upward. For $f(|x|)$: keep the right half of $f$, then mirror it to the left.',
      walkthrough: [
        {
          expression: '|f(x)|: \\text{ wherever } f(x) < 0, \\text{ reflect that portion up (negate the } y\\text{-values)}',
          annotation: '$|f(x)|$ takes the absolute value of the output — anything below the $x$-axis folds up. No part of $|f(x)|$ is negative.',
        },
        {
          expression: 'f(|x|): \\text{ for } x<0, |x| = -x, \\text{ so the left side mirrors the right side}',
          annotation: '$f(|x|)$ takes the absolute value of the input — the left half becomes a reflection of the right half. The result is always an even function.',
        },
      ],
      answer: '$|f(x)|$ folds negative outputs up. $f(|x|)$ makes the graph even (symmetric about the $y$-axis).',
    },
    {
      id: 'ch1-002-ch2',
      difficulty: 'medium',
      problem: 'Prove that $f(x) = x^3 + x$ is odd, then use this to evaluate $\\int_{-2}^{2}(x^3+x)\\,dx$ without computing.',
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
    {
      id: 'ch1-002-ch3',
      difficulty: 'hard',
      problem: 'Find the inverse of the rational function $f(x) = \\dfrac{2x+1}{x-3}$ and identify the domains.',
      hint: 'Swap $x$ and $y$, then solve for $y$ by cross-multiplying and collecting $y$ terms on one side.',
      walkthrough: [
        {
          expression: 'x = \\frac{2y+1}{y-3} \\Rightarrow x(y-3) = 2y+1 \\Rightarrow xy - 3x = 2y+1',
          annotation: 'Swap and cross-multiply.',
        },
        {
          expression: 'xy - 2y = 3x+1 \\Rightarrow y(x-2) = 3x+1 \\Rightarrow y = \\frac{3x+1}{x-2}',
          annotation: 'Collect $y$ terms, factor, divide.',
        },
        {
          expression: 'f^{-1}(x) = \\frac{3x+1}{x-2}, \\quad \\text{domain: } x \\neq 2',
          annotation: 'Note: the original VA at $x = 3$ becomes the HA $y = 3$ of $f^{-1}$, and the original HA $y = 2$ becomes the VA $x = 2$ of $f^{-1}$. Inverses swap VAs and HAs.',
        },
      ],
      answer: 'f^{-1}(x) = \\dfrac{3x+1}{x-2}, \\text{ domain: } x \\neq 2.',
    },
  ],

  crossRefs: [
    { slug: 'graphs-foundations', reason: 'Transformations act on the Cartesian coordinates and graph structure built in Lesson 1' },
    { slug: 'function-behaviour', reason: 'Recognizing the base family of a transformed function is the first step in reading its behaviour' },
    { slug: '02-chain-rule', reason: 'The chain rule differentiates composed transformations — the decomposition practiced here is the same skill' },
  ],

  checkpoints: [
    'Can you read all four parameters $a$, $b$, $h$, $k$ from $g(x) = a\\cdot f(b(x-h))+k$ and describe what each does?',
    'Do you always factor the inside before reading the horizontal shift?',
    'Can you test even/odd symmetry by computing $f(-x)$ and comparing to $f(x)$ and $-f(x)$?',
    'Can you find the inverse of a function algebraically and verify it by composition?',
    'Do you know that horizontal effects are reciprocal/opposite to their apparent sign?',
  ],

  semantics: {
    symbols: [
      { symbol: 'g(x) = af(b(x-h))+k', meaning: 'Master transformation: $h$ = horizontal shift, $b$ = horizontal scale, $a$ = vertical scale/reflect, $k$ = vertical shift' },
      { symbol: 'f^{-1}(x)', meaning: 'Inverse function — undoes $f$. Exists iff $f$ is one-to-one.' },
      { symbol: '|f(x)|', meaning: 'Absolute value of output — folds negative portions of the graph upward' },
      { symbol: 'f(|x|)', meaning: 'Absolute value of input — mirrors the right half of the graph to the left' },
      { symbol: 'f(-x)', meaning: 'Input negated — used to test even/odd symmetry' },
    ],
    rulesOfThumb: [
      'Inside changes are opposite to their sign: $f(x-h)$ shifts RIGHT by $h$; $f(bx)$ with $b>1$ compresses.',
      'Outside changes are direct: $f(x) + k$ shifts up by $k$; $af(x)$ stretches by $|a|$.',
      'For inverses: swap $x \\leftrightarrow y$, solve for $y$. The graph reflects over $y = x$.',
      'Check injectivity before finding an inverse — non-injective functions need domain restriction first.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { topic: 'Function notation', where: 'Algebra 2', why: 'Reading $f(x-h)$ as "input is $x-h$" requires comfort with substituting expressions into function notation' },
      { topic: 'Even/odd exponent rules', where: 'Algebra 1', why: 'Testing symmetry relies on knowing $(-x)^n = x^n$ for even $n$ and $(-x)^n = -x^n$ for odd $n$' },
      { topic: 'Solving equations for a variable', where: 'Algebra 2', why: 'Finding inverses of rational functions requires isolating $y$ from complex expressions' },
    ],
    futureLinks: [
      { topic: 'Function behaviour and asymptotes', where: 'Precalc Lesson 3', why: 'Identifying the base function of a transformed rational/exponential/log determines its asymptote structure' },
      { topic: 'Chain rule', where: 'Chapter 2 Calculus', why: 'Differentiating $f(g(x))$ is the calculus of composed transformations — the decomposition practiced here is the same skill' },
      { topic: 'Inverse trig functions', where: 'Trig / Calculus', why: 'sin$^{-1}$, cos$^{-1}$ etc. are inverses of restricted trig functions — the domain restriction idea from this lesson' },
    ],
  },

  assessment: [
    {
      question: 'Describe the transformation: $g(x) = f(x+4) - 2$.',
      answer: 'Shift left 4 units, shift down 2 units.',
      difficulty: 'quick-fire',
    },
    {
      question: 'If $f(5) = 8$, what is $f^{-1}(8)$?',
      answer: '$5$. By definition of inverse: $f(a) = b \\iff f^{-1}(b) = a$.',
      difficulty: 'quick-fire',
    },
    {
      question: 'Is $f(x) = x^5 - 3x$ even, odd, or neither?',
      answer: 'Odd: $f(-x) = -x^5 + 3x = -(x^5-3x) = -f(x)$.',
      difficulty: 'quick-fire',
    },
  ],

  mentalModel: [
    'Inside = horizontal (input stage). Outside = vertical (output stage). Inside effects are always reversed.',
    'Factor the inside before reading: $f(2x+6) = f(2(x+3))$ — shift is $-3$, not $-6$.',
    'Even: $y$-axis mirror. Odd: 180° origin rotation. Test with $f(-x)$.',
    'Inverse: swap $x$ and $y$, solve for $y$. Graph reflects over $y = x$.',
    'Absolute value of output folds graph up. Absolute value of input mirrors the right half left.',
  ],

  quiz: [
    {
      id: 'pc1-002-q1',
      type: 'choice',
      text: 'What transformation does $g(x) = f(x - 3) + 2$ apply to the graph of $f$?',
      options: ['Left 3, up 2', 'Right 3, up 2', 'Left 3, down 2', 'Right 3, down 2'],
      answer: 'Right 3, up 2',
      hints: [
        'Inside: $(x - 3)$ means $h = 3$, which shifts RIGHT 3 (inside effects are opposite to sign).',
        'Outside: $+2$ shifts the output up 2. Combined: right 3, up 2.',
      ],
      reviewSection: 'Intuition tab — inside-is-inverse rule',
    },
    {
      id: 'pc1-002-q2',
      type: 'choice',
      text: 'For $g(x) = -f(2x)$, which two transformations are applied?',
      options: [
        'Horizontal stretch by 2 and reflect over $x$-axis',
        'Horizontal compress by $\\frac{1}{2}$ and reflect over $x$-axis',
        'Vertical stretch by 2 and reflect over $y$-axis',
        'Horizontal stretch by 2 and reflect over $y$-axis',
      ],
      answer: 'Horizontal compress by $\\frac{1}{2}$ and reflect over $x$-axis',
      hints: [
        '$f(2x)$: inside multiplier $b=2$ compresses horizontally by $\\frac{1}{b} = \\frac{1}{2}$ (input speeds up).',
        'The negative outside ($-f$) reflects over the $x$-axis.',
      ],
      reviewSection: 'Math tab — master transformation identity',
    },
    {
      id: 'pc1-002-q3',
      type: 'input',
      text: 'What is the horizontal shift of $g(x) = f(3x - 9)$? (Give a number, positive = right)',
      answer: '3',
      hints: [
        'Factor the inside first: $3x - 9 = 3(x - 3)$.',
        'The form is $f(b(x - h))$ with $b = 3$ and $h = 3$. The horizontal shift is $h = 3$ (right 3).',
      ],
      reviewSection: 'Examples tab — decomposing a composed transformation',
    },
    {
      id: 'pc1-002-q4',
      type: 'choice',
      text: 'Is $f(x) = x^4 - 3x^2 + 1$ even, odd, or neither?',
      options: ['Even', 'Odd', 'Neither'],
      answer: 'Even',
      hints: [
        'Compute $f(-x)$: substitute $-x$ everywhere.',
        '$f(-x) = (-x)^4 - 3(-x)^2 + 1 = x^4 - 3x^2 + 1 = f(x)$. So it is even.',
      ],
      reviewSection: 'Examples tab — testing even/odd symmetry',
    },
    {
      id: 'pc1-002-q5',
      type: 'input',
      text: 'Solve $|3x + 1| = 7$. List both solutions separated by a comma.',
      answer: 'x = 2, x = -8/3',
      hints: [
        'Split: $3x + 1 = 7$ or $3x + 1 = -7$.',
        'Case 1: $3x = 6 \\Rightarrow x = 2$. Case 2: $3x = -8 \\Rightarrow x = -\\frac{8}{3}$.',
      ],
      reviewSection: 'Examples tab — absolute value two-case split',
    },
    {
      id: 'pc1-002-q6',
      type: 'input',
      text: 'Find $f^{-1}(x)$ for $f(x) = 3x + 6$.',
      answer: 'f^{-1}(x) = (x - 6)/3',
      hints: [
        'Write $y = 3x + 6$, then swap: $x = 3y + 6$.',
        'Solve for $y$: $3y = x - 6 \\Rightarrow y = \\frac{x-6}{3}$.',
      ],
      reviewSection: 'Examples tab — finding an inverse algebraically',
    },
    {
      id: 'pc1-002-q7',
      type: 'choice',
      text: 'If $f(7) = 3$, what is $f^{-1}(3)$?',
      options: ['$7$', '$3$', '$1/3$', 'Cannot be determined'],
      answer: '$7$',
      hints: [
        'The inverse swaps inputs and outputs.',
        '$f(7) = 3 \\iff f^{-1}(3) = 7$.',
      ],
      reviewSection: 'Math tab — geometric inversion rule',
    },
    {
      id: 'pc1-002-q8',
      type: 'choice',
      text: 'Which condition must hold for $f^{-1}$ to exist?',
      options: [
        '$f$ must be a polynomial',
        '$f$ must pass the vertical line test',
        '$f$ must pass the horizontal line test',
        '$f$ must be continuous',
      ],
      answer: '$f$ must pass the horizontal line test',
      hints: [
        'An inverse requires the function to be one-to-one (injective).',
        'The horizontal line test checks one-to-one: if any horizontal line crosses the graph more than once, the function is not injective and has no inverse.',
      ],
      reviewSection: 'Math tab — inverse function existence condition',
    },
    {
      id: 'pc1-002-q9',
      type: 'choice',
      text: 'How does the graph of $|f(x)|$ differ from the graph of $f(x)$?',
      options: [
        'The right half is mirrored to the left',
        'All $y$-values are doubled',
        'Portions where $f(x) < 0$ are reflected upward',
        'The graph is shifted up',
      ],
      answer: 'Portions where $f(x) < 0$ are reflected upward',
      hints: [
        '$|f(x)|$ applies absolute value to the output.',
        'Any part of the graph below the $x$-axis (where $f(x) < 0$) gets flipped above it.',
      ],
      reviewSection: 'Challenges tab — $|f(x)|$ vs $f(|x|)$',
    },
    {
      id: 'pc1-002-q10',
      type: 'choice',
      text: 'What does $g(x) = f(|x|)$ do to the graph of $f$?',
      options: [
        'Folds the graph upward where $f < 0$',
        'Makes the graph even by mirroring the right half to the left',
        'Reflects over the $x$-axis',
        'Shifts the graph right',
      ],
      answer: 'Makes the graph even by mirroring the right half to the left',
      hints: [
        '$f(|x|)$ applies absolute value to the input: for $x < 0$, $|x| = -x$, so the left half becomes $f(-x)$.',
        'Since both halves evaluate $f$ at positive values, the result is symmetric — an even function.',
      ],
      reviewSection: 'Challenges tab — $|f(x)|$ vs $f(|x|)$',
    },
  ],
}

/* eslint-disable no-useless-escape */
export default {
  id: 'precalc4-e-and-ln',
  slug: 'natural-base-e-and-ln',
  chapter: 'precalc-4',
  order: 2,
  title: 'The Natural Base e and the Natural Logarithm ln',
  subtitle: 'The most important number in mathematics — where it comes from, what makes it special, and why it owns calculus',
  tags: [
    'e',
    'euler number',
    'natural base',
    'natural logarithm',
    'ln',
    'compound interest',
    'continuous growth',
    'inverse functions',
    'logarithm identities',
    'calculus bridge',
  ],
  aliases:
    'e euler natural base ln natural log inverse exponential 2.71828 continuous compounding slope derivative',

  hook: {
    question:
      'Why does every scientist, engineer, and mathematician always use $e \\approx 2.71828$ as the base for their exponentials — instead of the much simpler $2$ or $10$? What is so special about this ugly irrational number?',
    realWorldContext:
      'The number $e$ shows up in: compound interest (banks use it for continuous compounding), population growth models, radioactive decay, electrical circuits (discharging capacitors), probability (the bell curve in statistics), and quantum mechanics. It is not a coincidence — $e$ is the base that makes calculus the simplest it can possibly be. The natural logarithm $\\ln$ is its inverse, and it is the key to "undoing" any exponential equation. By the end of this lesson you will understand not just what $e$ and $\\ln$ are, but why they are the natural choice for all of mathematics.',
    previewVisualizationId: 'ExponentialGrowth',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You have seen exponential functions $f(x) = b^x$ in general, and you know that the base $b$ controls everything about the shape. But one particular base keeps showing up everywhere — in finance, in physics, in calculus — and it is not 2 or 10. This lesson is the story of why $e \\approx 2.71828$ is the natural choice, and why its inverse $\\ln$ is the key to solving any exponential equation.',
      '**Start with a question about money.** Suppose a bank offers you 100% interest per year on \\$1. If they pay it all at once at the end of the year, you finish with \\$2. But what if they pay half the interest (50%) twice a year — mid-year and year-end? Mid-year you have \\$1.50, and then 50% of \\$1.50 is \\$0.75, so you finish with \\$2.25. Better! What if they compound every month? Every day? Every second? You keep winning more money each time — but the gains slow down. The amounts are: \\$2.00 → \\$2.25 → \\$2.59 → \\$2.71 → \\$2.718... They are approaching a wall. That wall is $e$.',
      '**So $e$ is a limit, not just a number.** Formally: $e = \\lim_{n \\to \\infty}\\left(1 + \\frac{1}{n}\\right)^n \\approx 2.71828...$. Each value of $n$ represents compounding $n$ times per year. As $n$ grows toward infinity (continuous compounding), the amount approaches $e$ — it never reaches $e$, but gets infinitely close. $e$ is the exact amount \\$1 grows to at 100% interest compounded continuously for 1 year. That is its definition. Everything else about $e$ follows from this.',
      '**But why should a number born from interest rates show up in physics and probability?** Because the real pattern behind $e$ is not money — it is the idea of *continuous proportional growth*. Any time a quantity grows (or shrinks) at a rate proportional to itself, the solution involves $e^x$. A population where each organism reproduces continuously, a hot object cooling at a rate proportional to temperature difference, a radioactive atom decaying at a rate proportional to how many atoms remain — they all obey $y = Ce^{kt}$. The money example is just one instance of this universal pattern.',
      '**The magical property: $e^x$ is its own rate of change.** This is the real reason mathematicians chose $e$. For any base $b$, the derivative of $b^x$ is $b^x$ multiplied by some constant. For $b = 2$: that constant is $\\ln 2 \\approx 0.693$. For $b = 10$: it is $\\ln 10 \\approx 2.303$. For $b = e$: the constant is $\\ln e = 1$. So $\\frac{d}{dx}[e^x] = 1 \\cdot e^x = e^x$. The derivative of $e^x$ is itself. No other base does this. This means $e^x$ is the unique function that describes its own rate of change — growth that is perfectly synchronized with its own size.',
      '**Now understand $\\ln$.** The natural logarithm $\\ln(x)$ is the inverse of $e^x$. That means: if $e^y = x$, then $\\ln(x) = y$. In plain English: $\\ln(x)$ asks "to what power must I raise $e$ to get $x$?" So $\\ln(e^3) = 3$ because $e^3 = e^3$. And $\\ln(1) = 0$ because $e^0 = 1$. The graph of $\\ln(x)$ is the mirror image of $e^x$ — reflected across the line $y = x$.',
      '**A second beautiful way to understand $\\ln$: it is about time.** Imagine a population that doubles every fixed period, or \\$1 growing at continuous 100% interest. The natural log $\\ln(x)$ answers: "how long does it take to grow from 1 to $x$?" So $\\ln(2) \\approx 0.693$ means it takes about 0.693 years to double (at 100% continuous rate). $\\ln(7.389) \\approx 2$ means it takes exactly 2 years to reach \\$7.389. $\\ln$ measures the *time required for proportional growth* — and that is exactly what you need to solve exponential equations.',
      '**A third perspective from geometry.** The natural log has a stunning geometric meaning: $\\ln(x)$ is the area under the curve $y = 1/t$ from $t = 1$ to $t = x$. Specifically: $\\ln(x) = \\int_1^x \\frac{1}{t}\\,dt$. This connects $\\ln$ to integration in a deep way — and you will use this definition in calculus to prove that the derivative of $\\ln(x)$ is $1/x$. For now, just appreciate that the logarithm is secretly an area.',
      '**Where this is heading:** The next lesson builds on everything here to give you the toolkit for solving any exponential or logarithmic equation. After that, exponential applications will show you how $A = A_0 e^{kt}$ models every real-world growth and decay problem. And in calculus, $e^x$ and $\\ln x$ will be the two functions you use most.',
    ],
    callouts: [
      { type: 'sequencing', title: 'Precalc-4 arc — Lesson 4 of 6', body: '← Properties of Logarithms | **The Natural Base e and ln** | Solving Exponential & Log Equations →' },
      {
        type: 'definition',
        title: 'The Number $e$ — Three Equivalent Definitions',
        body: 'e = \\lim_{n\\to\\infty}\\left(1+\\tfrac{1}{n}\\right)^n \\approx 2.71828\\ldots \\\\ e = 1 + 1 + \\tfrac{1}{2!} + \\tfrac{1}{3!} + \\tfrac{1}{4!} + \\cdots \\quad (\\text{Taylor series}) \\\\ e = \\text{unique number where } \\tfrac{d}{dx}[e^x] = e^x',
      },
      {
        type: 'definition',
        title: 'The Natural Logarithm $\\ln$',
        body: '\\ln(x) = \\log_e(x) \\qquad \\text{(logarithm base } e\\text{)} \\\\ \\ln(x) = y \\iff e^y = x \\\\ \\text{Domain: } x > 0 \\qquad \\text{Range: } (-\\infty, \\infty) \\\\ \\text{Key values: } \\ln(1) = 0,\\; \\ln(e) = 1,\\; \\ln(e^n) = n',
      },
      {
        type: 'insight',
        title: 'The Inverse Relationship — How to Switch Between $e^x$ and $\\ln$',
        body: 'e^{\\ln(x)} = x \\quad \\text{for all } x > 0 \\\\ \\ln(e^x) = x \\quad \\text{for all } x \\in \\mathbb{R} \\\\ \\text{These are the "cancel" identities. Use them to undo } e^x \\text{ with } \\ln, \\text{ or undo } \\ln \\text{ with } e^x.',
      },
      {
        type: 'insight',
        title: 'Common Errors with $\\ln$',
        body: '\\ln(a + b) \\neq \\ln(a) + \\ln(b) \\quad \\text{(no addition rule!)} \\\\ \\ln(a) + \\ln(b) = \\ln(a \\cdot b) \\quad \\text{(product rule)} \\\\ \\ln(0) \\text{ is undefined.} \\quad \\ln(\\text{negative}) \\text{ is undefined (over reals).} \\\\ \\ln(1) = 0, \\text{ NOT } 1.',
      },
    ],
    visualizations: [
      {
        id: 'ExponentialGrowth',
        title: 'Compounding Frequency → $e$: Watch the Limit Form',
        mathBridge:
          'Step 1: Set $n = 1$ (annual compounding). The output is exactly $A = 2.00$. Step 2: Slide $n$ to 12 (monthly). Watch the output climb to $2.613$. Step 3: Continue to $n = 365$ (daily, $A = 2.7146$) and $n = 8760$ (hourly, $A = 2.7181$). The horizontal dashed line at $e \\approx 2.71828$ is the asymptote. Step 4: Notice the bar chart showing diminishing returns — each doubling of $n$ adds less than the previous doubling. The key lesson: more frequent compounding always helps, but the gains shrink, and the absolute limit is $e$. This is why $e$ is defined as this limit.',
        caption:
          'Each step of the slider doubles the compounding frequency. The limit $e \\approx 2.71828$ is the horizontal asymptote the curve can never reach.',
      },
      {
        id: 'ExponentialSlopeAtZero',
        title: 'Why $e$ is the "Natural" Base — The Slope Argument',
        mathBridge:
          'Step 1: Set the base to $b = 2$. The tangent line to $y = 2^x$ at $x = 0$ has slope $\\ln 2 \\approx 0.693$ — less than 1, so the curve rises more slowly than the 45° line $y = x + 1$ at the origin. Step 2: Set $b = 3$. Slope becomes $\\ln 3 \\approx 1.099$ — steeper than 45°. Step 3: Drag $b$ slowly from 2 toward 3. Watch the slope pass through exactly 1. That crossover point is $b = e$. The key lesson: $e$ is the unique base where the slope of $b^x$ at $x = 0$ equals exactly 1 — meaning the curve is its own tangent at the origin, and its derivative is itself everywhere.',
        caption:
          'Drag the base slider. The slope of $b^x$ at $x=0$ equals $\\ln(b)$. Only at $b=e$ does this slope equal exactly 1.',
      },
      {
        id: 'ExpLogBridgeLab',
        title: 'The Inverse Bridge: $e^x$ and $\\ln(x)$ as Reflections',
        mathBridge:
          'Step 1: Click any point on the $e^x$ curve, say $(1, e)$. Step 2: The visualization draws the reflected point $(e, 1)$ on the $\\ln(x)$ curve across the line $y = x$. Step 3: Verify: $e^1 = e$ and $\\ln(e) = 1$ — input and output have swapped. Step 4: Try the point $(0, 1)$ on $e^x$ — its reflection is $(1, 0)$ on $\\ln x$. The key lesson: inverse functions are geometric reflections across $y = x$, and the cancel identities $\\ln(e^x) = x$ and $e^{\\ln x} = x$ are just this picture stated algebraically.',
        caption:
          'Toggle between $e^x$ and $\\ln(x)$. The reflection line $y = x$ is shown. Input and output swap — that is what inverse means.',
      },
    ],
  },

  math: {
    prose: [
      'The natural logarithm obeys the same rules as all logarithms, but because its base is $e$, the formulas look cleaner. All log properties follow from the definition: $\\ln(x) = y \\iff e^y = x$. They translate directly from the exponent laws for $e^x$.',
      '**Product Rule for $\\ln$:** $\\ln(ab) = \\ln(a) + \\ln(b)$. Why? Because $e^{\\ln a} \\cdot e^{\\ln b} = e^{\\ln a + \\ln b}$. The product of two powers of $e$ equals $e$ to the sum of the exponents — that is just the exponent rule $e^m \\cdot e^n = e^{m+n}$. Taking $\\ln$ of both sides gives the product rule.',
      '**Quotient Rule for $\\ln$:** $\\ln(a/b) = \\ln(a) - \\ln(b)$. Follows from $e^{\\ln a}/e^{\\ln b} = e^{\\ln a - \\ln b}$ (exponent subtraction rule). Note: $\\ln(a/b) \\neq \\ln(a)/\\ln(b)$ — division does NOT move from inside to outside $\\ln$.',
      '**Power Rule for $\\ln$:** $\\ln(a^n) = n \\cdot \\ln(a)$. This is the most powerful rule. It lets you pull exponents outside the logarithm. Why? Because $\\ln(a^n) = \\ln(e^{n \\ln a}) = n \\ln a$ by using $a = e^{\\ln a}$ and then the chain. This rule is why we take $\\ln$ of both sides when solving $e^{kx} = C$ — it brings the exponent down into the equation.',
      '**Change of Base Formula:** $\\log_b(x) = \\frac{\\ln(x)}{\\ln(b)}$. This converts ANY logarithm to natural log. Why? If $\\log_b(x) = y$, then $b^y = x$. Take $\\ln$ of both sides: $y \\ln b = \\ln x$. Solve: $y = \\frac{\\ln x}{\\ln b}$. This is why your calculator only has $\\ln$ and $\\log_{10}$ buttons — any base can be computed by dividing two of them.',
      '**Solving exponential equations with $\\ln$:** The strategy is always: isolate the exponential expression on one side, then take $\\ln$ of both sides and use the power rule to bring the exponent down. This converts a transcendental equation (hard) into a linear equation (easy).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Four Laws of Natural Logarithms',
        body: '\\ln(ab) = \\ln a + \\ln b \\quad \\text{(Product)} \\\\ \\ln\\!\\left(\\tfrac{a}{b}\\right) = \\ln a - \\ln b \\quad \\text{(Quotient)} \\\\ \\ln(a^n) = n \\ln a \\quad \\text{(Power)} \\\\ \\log_b x = \\dfrac{\\ln x}{\\ln b} \\quad \\text{(Change of Base)}',
      },
      {
        type: 'theorem',
        title: 'The Cancel Identities (Use These Constantly)',
        body: 'e^{\\ln x} = x \\quad \\text{for } x > 0 \\\\ \\ln(e^x) = x \\quad \\text{for all } x \\\\ \\text{These "undo" each other. Apply to both sides to solve equations.}',
      },
      {
        type: 'definition',
        title: 'Key Graph Facts for $e^x$ and $\\ln(x)$',
        body: 'y = e^x: \\text{ domain } (-\\infty,\\infty),\\; \\text{range }(0,\\infty),\\; \\text{passes through }(0,1) \\\\ \\text{HA: } y=0 \\;(\\text{as }x\\to-\\infty).\\; \\text{Always increasing.} \\\\ y = \\ln(x): \\text{ domain }(0,\\infty),\\; \\text{range }(-\\infty,\\infty),\\; \\text{passes through }(1,0) \\\\ \\text{VA: } x=0.\\; \\text{Always increasing.}',
      },
    ],
    visualizations: [
      {
        id: 'ExpLogGeometricProof',
        title: 'Log Product Rule — Geometric Proof via Areas',
        mathBridge:
          'Step 1: Set $a = 3$ and $b = 4$. The area under $y = 1/t$ from $t = 1$ to $t = 12$ is shaded — this area equals $\\ln(12)$. Step 2: Toggle the split: see the area from 1 to 3 (which is $\\ln 3$) and the area from 3 to 12 (which equals $\\ln 4$ after a substitution $t = 3s$). They sum to $\\ln 12 = \\ln(3 \\cdot 4)$. Step 3: Drag $a$ and $b$ to other values and verify the areas always add up correctly. The key lesson: $\\ln(ab) = \\ln a + \\ln b$ is not a rule to memorize but a geometric fact — splitting one area under $1/t$ into two pieces.',
        caption: 'The log product rule is an area decomposition. Drag $a$ and $b$ and watch the areas add up correctly.',
      },
    ],
  },

  rigor: {
    title: 'Proving $\\ln$ is the inverse of $e^x$ — and the full story of where $e$ comes from',
    prose: [
      'We define $e$ as the limit $e = \\lim_{n \\to \\infty}\\left(1 + \\frac{1}{n}\\right)^n$. But how do we actually know this limit exists? And how does this connect to the derivative of $b^x$?',
      'The argument runs through the derivative of $b^x$ from first principles. The difference quotient is $\\frac{b^{x+h} - b^x}{h} = b^x \\cdot \\frac{b^h - 1}{h}$. The factor $b^x$ just comes out, so the derivative of $b^x$ always equals $b^x$ times the constant $\\lim_{h\\to 0}\\frac{b^h - 1}{h}$. This constant depends only on $b$ — call it $L(b)$. We want the base where $L(b) = 1$: that is the base where its derivative equals itself exactly.',
      'One can show (using the substitution $h = 1/n$ and the squeeze theorem) that $L(b) = \\ln(b)$ — the natural log. So $L(b) = 1$ when $\\ln(b) = 1$, i.e., when $b = e$. This completes the circle: $e$ is both the compound-interest limit AND the unique base whose exponential is its own derivative.',
    ],
    proofSteps: [
      {
        expression: 'e^y = x \\implies \\text{we want to show } y = \\ln(x) \\text{ is the unique inverse}',
        annotation:
          'Set up the inverse relationship. We need to show $e^x$ is strictly increasing (one-to-one) and onto $(0,\\infty)$.',
      },
      {
        expression: '\\frac{d}{dx}[e^x] = e^x > 0 \\text{ for all } x',
        annotation:
          'Since the derivative is always positive, $e^x$ is strictly increasing. Strictly increasing functions are one-to-one, so each output value has exactly one input — the inverse exists.',
      },
      {
        expression: 'e^x \\to +\\infty \\text{ as } x\\to+\\infty \\qquad e^x \\to 0^+ \\text{ as } x\\to-\\infty',
        annotation:
          'The range of $e^x$ is all of $(0, \\infty)$. By the Intermediate Value Theorem, for every $x > 0$ there exists exactly one $y$ with $e^y = x$. We call that $y = \\ln(x)$.',
      },
      {
        expression: '\\ln(e^x) = x \\text{ and } e^{\\ln x} = x',
        annotation:
          'These follow directly from the definition of inverse functions: $f(f^{-1}(x)) = x$ and $f^{-1}(f(x)) = x$. They hold wherever both sides are defined.',
      },
      {
        expression:
          '\\frac{d}{dx}[\\ln x] = \\frac{1}{x} \\quad \\text{(derived using implicit differentiation on } e^y = x\\text{)}',
        annotation:
          'Differentiate both sides of $e^y = x$ with respect to $x$: $e^y \\cdot \\frac{dy}{dx} = 1$. Solve: $\\frac{dy}{dx} = \\frac{1}{e^y} = \\frac{1}{x}$. This is the derivative of $\\ln(x)$ — the result you will use in every calculus course. ∎',
      },
    ],
    visualizations: [
      {
        id: 'ExpLogGeometricProof',
        title: '$\\ln(x) = \\int_1^x (1/t)\\,dt$ — The Area Definition',
        mathBridge:
          'Step 1: Set $x = 3$. The shaded area under $y = 1/t$ from $t = 1$ to $t = 3$ equals $\\ln 3 \\approx 1.099$. Step 2: Drag $x$ to the right of 1 — the area grows (positive). Drag it to the left toward 0 — the area shrinks and becomes negative (you are integrating backward). Step 3: Set $x = 1$ — no area, which is why $\\ln(1) = 0$. The key lesson: this is the rigorous definition of $\\ln$. All properties (product law, quotient law, derivative $1/x$) can be proved directly from this area picture without any other assumptions.',
        caption:
          'Drag $x$ right or left. The shaded area under $1/t$ from 1 to $x$ is exactly $\\ln(x)$. When $x < 1$, the area is negative.',
      },
    ],
  },

  examples: [
    {
      id: 'precalc4-eln-ex1',
      title: 'Evaluating $\\ln$ Expressions Without a Calculator',
      problem:
        'Evaluate exactly: (a) $\\ln(e^5)$, (b) $\\ln(1)$, (c) $e^{\\ln 7}$, (d) $\\ln(e^{-3})$, (e) $\\ln\\!\\left(\\dfrac{1}{e^2}\\right)$.',
      visualizations: [
        {
          id: 'ExpLogBridgeLab',
          title: 'Cancel Identity Visualizer',
          mathBridge:
            'Step 1: For each expression, identify whether you have $\\ln(e^{\\text{something}})$ or $e^{\\ln(\\text{something})}$. Step 2: Apply the matching cancel identity — $\\ln(e^x) = x$ or $e^{\\ln x} = x$. Step 3: Toggle between the two curves to see why: any point $(a, e^a)$ on $e^x$ has reflection $(e^a, a)$ on $\\ln x$, and those coordinates are exactly the cancel identities in action. The key lesson: these are not formulas to memorize but the geometric statement that inverse functions undo each other.',
          caption: 'The cancel identities make these evaluations immediate once you see the pattern.',
        },
      ],
      steps: [
        {
          expression: '(a)\\; \\ln(e^5) = 5',
          annotation: 'Direct: $\\ln(e^x) = x$. The logarithm and exponential are inverses — they cancel.',
          hint: 'Identify the pattern: ln(e^something). The cancel identity says the answer is just "something."',
        },
        {
          expression: '(b)\\; \\ln(1) = \\ln(e^0) = 0',
          annotation: '$1 = e^0$. Rewrite 1 as $e^0$, then apply $\\ln(e^x) = x$.',
          hint: 'Rewrite 1 as e^0 first — then the cancel identity applies directly.',
        },
        {
          expression: '(c)\\; e^{\\ln 7} = 7',
          annotation: 'Direct: $e^{\\ln x} = x$. The exponential undoes the logarithm.',
          hint: 'Identify the pattern: e^(ln of something). The cancel identity says the answer is just "something."',
        },
        {
          expression: '(d)\\; \\ln(e^{-3}) = -3',
          annotation: '$\\ln(e^x) = x$ works for negative exponents too.',
          hint: 'The cancel identity works for any exponent, including negative ones.',
        },
        {
          expression: '(e)\\; \\ln\\!\\left(\\tfrac{1}{e^2}\\right) = \\ln(e^{-2}) = -2',
          annotation: 'Rewrite $1/e^2 = e^{-2}$ using the negative exponent rule, then cancel.',
          hint: 'Rewrite 1/e^2 using a negative exponent: 1/e^2 = e^(-2). Then apply the cancel identity.',
        },
      ],
      conclusion:
        'Pattern: whenever you see $\\ln(e^{\\text{something}})$ or $e^{\\ln(\\text{something})}$, they immediately simplify to "something." Memorize the cancel identities — they are used in virtually every calculus problem involving $e$ or $\\ln$.',
    },
    {
      id: 'precalc4-eln-ex2',
      title: 'Expanding and Condensing $\\ln$ Expressions Using Properties',
      problem:
        '(a) Expand $\\ln\\!\\left(\\dfrac{x^3 \\sqrt{y}}{z^2}\\right)$ fully. (b) Condense $3\\ln(x) - \\tfrac{1}{2}\\ln(y) + \\ln(5)$ into a single logarithm.',
      steps: [
        {
          expression: '(a)\\; \\ln\\!\\left(\\frac{x^3 \\sqrt{y}}{z^2}\\right) = \\ln(x^3 \\sqrt{y}) - \\ln(z^2)',
          annotation: 'Apply the quotient rule first: $\\ln(A/B) = \\ln(A) - \\ln(B)$.',
          hint: 'Always handle the fraction (quotient rule) before the products inside numerator and denominator.',
        },
        {
          expression: '= \\ln(x^3) + \\ln(\\sqrt{y}) - \\ln(z^2)',
          annotation: 'Apply the product rule: $\\ln(AB) = \\ln(A) + \\ln(B)$.',
          hint: 'The numerator x^3·√y splits into a sum; the minus sign carries to all denominator terms.',
        },
        {
          expression: '= 3\\ln(x) + \\tfrac{1}{2}\\ln(y) - 2\\ln(z)',
          annotation:
            'Apply the power rule: $\\ln(a^n) = n\\ln(a)$. Note $\\sqrt{y} = y^{1/2}$ and $\\ln(z^2) = 2\\ln(z)$.',
          hint: 'Bring each exponent down as a coefficient: x^3 gives 3·ln(x), y^(1/2) gives (1/2)·ln(y), z^2 gives 2·ln(z).',
        },
        {
          expression: '(b)\\; 3\\ln(x) - \\tfrac{1}{2}\\ln(y) + \\ln(5)',
          annotation: 'Start condensing. Power rule reverses the coefficients into exponents.',
          hint: 'To condense, reverse the steps of expansion. Start by making each coefficient into an exponent using the power rule.',
        },
        {
          expression: '= \\ln(x^3) - \\ln(y^{1/2}) + \\ln(5)',
          annotation: 'Power rule: $n\\ln(a) = \\ln(a^n)$.',
          hint: '3·ln(x) = ln(x^3); (1/2)·ln(y) = ln(y^(1/2)) = ln(√y).',
        },
        {
          expression: '= \\ln\\!\\left(\\frac{5x^3}{\\sqrt{y}}\\right)',
          annotation:
            'Product rule adds logs: $\\ln(x^3) + \\ln(5) = \\ln(5x^3)$. Quotient rule subtracts: $- \\ln(\\sqrt{y}) = \\ln(1/\\sqrt{y})$. Combined: single logarithm.',
          hint: 'Positive log terms go to the numerator (product rule), negative terms go to the denominator (quotient rule).',
        },
      ],
      conclusion:
        'Expansion: work outward from the structure (quotient → product → powers). Condensation: reverse the steps (powers → product/quotient → single log). The order of rules must be reversed.',
    },
    {
      id: 'precalc4-eln-ex3',
      title: 'Solving Exponential Equations with $\\ln$',
      problem: 'Solve exactly: (a) $e^{2x} = 7$, (b) $3e^{x-1} + 5 = 20$, (c) $e^{2x} - 5e^x + 6 = 0$.',
      steps: [
        {
          expression: '(a)\\; e^{2x} = 7 \\implies \\ln(e^{2x}) = \\ln(7)',
          annotation:
            'Take $\\ln$ of both sides. This is always the first move when the exponential is isolated.',
          hint: 'The exponential is already isolated on the left. Take ln of both sides immediately.',
        },
        {
          expression: '2x = \\ln(7) \\implies x = \\frac{\\ln 7}{2}',
          annotation:
            'Cancel: $\\ln(e^{2x}) = 2x$. Divide by 2. Exact answer — do not try to compute $\\ln(7)$ by hand.',
          hint: 'Cancel identity: ln(e^(2x)) = 2x. Then divide both sides by 2 for the exact answer.',
        },
        {
          expression: '(b)\\; 3e^{x-1} = 15 \\implies e^{x-1} = 5',
          annotation: 'Isolate the exponential first: subtract 5, divide by 3.',
          hint: 'Do not take ln yet — first isolate the exponential by subtracting 5 and then dividing by 3.',
        },
        {
          expression: 'x - 1 = \\ln 5 \\implies x = 1 + \\ln 5',
          annotation: 'Take $\\ln$ of both sides: $\\ln(e^{x-1}) = x - 1 = \\ln 5$. Solve for $x$.',
          hint: 'Cancel: ln(e^(x-1)) = x - 1. Set equal to ln(5), then add 1 to both sides.',
        },
        {
          expression: '(c)\\; e^{2x} - 5e^x + 6 = 0 \\implies u = e^x: \\quad u^2 - 5u + 6 = 0',
          annotation:
            'Substitution! This is disguised as a quadratic in $u = e^x$. Notice $e^{2x} = (e^x)^2$.',
          hint: 'Recognize e^(2x) = (e^x)^2 — this is a quadratic in e^x. Let u = e^x and substitute.',
        },
        {
          expression: '(u-2)(u-3) = 0 \\implies u = 2 \\text{ or } u = 3',
          annotation: 'Factor the quadratic.',
          hint: 'Factor u^2 - 5u + 6 = (u - 2)(u - 3) = 0.',
        },
        {
          expression: 'e^x = 2 \\implies x = \\ln 2 \\qquad e^x = 3 \\implies x = \\ln 3',
          annotation: 'Both solutions valid since $e^x > 0$ always. Two exact answers.',
          hint: 'Back-substitute u = e^x and take ln of both sides for each case. Since e^x > 0 always, no extraneous solutions.',
        },
      ],
      conclusion:
        'Strategy: (1) Isolate the exponential. (2) Take $\\ln$ of both sides. (3) Use $\\ln(e^x) = x$ to cancel. (4) Solve the resulting linear/algebraic equation. When you see $e^{2x}$ and $e^x$ together — substitute $u = e^x$ to get a quadratic.',
    },
    {
      id: 'precalc4-eln-ex4',
      title: 'Solving Logarithmic Equations by Exponentiating',
      problem: 'Solve: (a) $\\ln(x) = 4$, (b) $\\ln(2x-1) = 3$, (c) $\\ln(x) + \\ln(x-2) = \\ln(8)$.',
      steps: [
        {
          expression: '(a)\\; \\ln(x) = 4 \\implies e^{\\ln x} = e^4 \\implies x = e^4',
          annotation:
            'Exponentiate both sides (raise $e$ to the power of each side). The left side simplifies immediately via $e^{\\ln x} = x$.',
          hint: 'To undo ln, raise e to both sides. The cancel identity e^(ln x) = x clears the left side immediately.',
        },
        {
          expression: '(b)\\; \\ln(2x-1) = 3 \\implies 2x-1 = e^3',
          annotation: 'Exponentiate: $e^{\\ln(2x-1)} = e^3$ gives $2x - 1 = e^3$.',
          hint: 'Raise e to both sides: e^(ln(2x-1)) = e^3 simplifies to 2x-1 = e^3 by the cancel identity.',
        },
        {
          expression: '2x = 1 + e^3 \\implies x = \\frac{1 + e^3}{2} \\approx 10.54',
          annotation: 'Solve for $x$. Always check: the argument $2x - 1 = e^3 > 0$ ✓.',
          hint: 'Solve the resulting linear equation. Verify the domain: substitute back and confirm the log argument is positive.',
        },
        {
          expression: '(c)\\; \\ln(x) + \\ln(x-2) = \\ln(8) \\implies \\ln(x(x-2)) = \\ln(8)',
          annotation:
            'Apply product rule: $\\ln(A) + \\ln(B) = \\ln(AB)$. Both sides are now $\\ln$ of something.',
          hint: 'Use the product rule to combine the two ln terms on the left into a single ln.',
        },
        {
          expression: 'x(x-2) = 8 \\implies x^2 - 2x - 8 = 0 \\implies (x-4)(x+2) = 0',
          annotation: 'Since $\\ln$ is one-to-one, $\\ln(A) = \\ln(B) \\implies A = B$. Factor the quadratic.',
          hint: 'One-to-one property: equal logs mean equal arguments. Set x(x-2) = 8 and solve the quadratic.',
        },
        {
          expression: 'x = 4 \\text{ or } x = -2. \\quad \\text{Check: } x = -2 \\text{ makes } \\ln(-2) \\text{ undefined — reject.}',
          annotation:
            'Always check domain! $x = -2$ gives $\\ln(-2)$, which does not exist for real numbers. The only solution is $x = 4$.',
          hint: 'Check both solutions in the original equation. If any log argument becomes negative or zero, that solution is extraneous.',
        },
      ],
      conclusion:
        'To solve $\\ln(\\cdots) = $ number: exponentiate both sides. To solve $\\ln + \\ln = \\ln$: use log laws to combine, then set arguments equal. Always check that all arguments of $\\ln$ are positive in the final answer — extraneous solutions are common.',
    },
    {
      id: 'precalc4-eln-ex5',
      title: 'The Continuous Growth Model — Radioactive Decay',
      problem:
        'Carbon-14 has a half-life of 5730 years. An artifact contains 35% of its original carbon-14. How old is it? (Use the continuous decay model $A = A_0 e^{kt}$.)',
      visualizations: [
        {
          id: 'ExponentialGrowth',
          title: 'Radioactive Decay — Exponential Model',
          mathBridge:
            'Step 1: Set the model to decay ($k < 0$) and the half-life to 5730 years. At $t = 5730$, confirm that exactly 50% of the original amount remains — the model is calibrated. Step 2: Drag the slider to find the time when 35% remains. The graph shows this visually before you compute it algebraically. Step 3: Read off the approximate $t$ value, then verify it matches the algebraic calculation. The key lesson: every step of the algebraic procedure corresponds to a geometric action on the graph.',
          caption:
            'Drag the slider to the half-life (5730 yr). Notice exactly half the original remains. Then find the time for 35% remaining.',
        },
      ],
      steps: [
        {
          expression: '\\text{Step 1: Find } k \\text{ using the half-life.} \\quad \\frac{A_0}{2} = A_0 e^{k \\cdot 5730}',
          annotation: 'At $t = 5730$, exactly half the original amount remains. $A_0$ cancels.',
          hint: 'Substitute A = A₀/2 and t = 5730 into the model. A₀ cancels from both sides.',
        },
        {
          expression: '\\frac{1}{2} = e^{5730k} \\implies \\ln\\!\\left(\\tfrac{1}{2}\\right) = 5730k',
          annotation: 'Take $\\ln$ of both sides.',
          hint: 'Take ln of both sides and use the cancel identity ln(e^(5730k)) = 5730k.',
        },
        {
          expression: 'k = \\frac{\\ln(0.5)}{5730} = \\frac{-\\ln 2}{5730} \\approx -0.0001209\\ \\text{yr}^{-1}',
          annotation: 'Exact value: $k = -\\ln(2)/5730$. Negative confirms decay.',
          hint: 'ln(1/2) = ln(1) - ln(2) = 0 - ln(2) = -ln(2). Divide by 5730 to get k.',
        },
        {
          expression: '\\text{Step 2: Solve } 0.35 A_0 = A_0 e^{kt}',
          annotation: 'Now use $k$ to find $t$ when 35% remains.',
          hint: 'Substitute A = 0.35·A₀ into the model. A₀ will cancel again.',
        },
        {
          expression: '0.35 = e^{kt} \\implies \\ln(0.35) = kt',
          annotation: 'Cancel $A_0$, take $\\ln$ of both sides.',
          hint: 'Take ln of both sides and cancel: ln(e^(kt)) = kt.',
        },
        {
          expression:
            't = \\frac{\\ln(0.35)}{k} = \\frac{\\ln(0.35)}{-\\ln 2 / 5730} = \\frac{5730 \\ln(0.35)}{-\\ln 2} \\approx \\frac{5730(-1.0498)}{-0.6931} \\approx 8684\\ \\text{years}',
          annotation:
            'Divide both sides by $k$. Compute numerically. The artifact is approximately 8684 years old.',
          hint: 'Substitute the exact expression for k and simplify. Compute numerically at the end to minimize rounding error.',
        },
      ],
      conclusion:
        'The pattern for all exponential problems with unknown $k$: (1) Use a known condition (half-life, doubling time) to find $k$ exactly. (2) Use that $k$ to solve the target question. Both steps use "take $\\ln$, bring the exponent down."',
    },
  ],

  challenges: [
    {
      id: 'precalc4-eln-ch1',
      difficulty: 'medium',
      problem: 'Without a calculator, determine which is larger: $e^\\pi$ or $\\pi^e$. (Hint: take $\\ln$ of both and compare.)',
      hint: 'You need to compare $\\pi$ and $e \\ln \\pi$. Is $\\pi/e > \\ln \\pi$? Consider the function $f(x) = x/e - \\ln(x)$.',
      walkthrough: [
        {
          expression: '\\text{Compare } e^\\pi \\text{ vs } \\pi^e. \\text{ Take } \\ln \\text{ of both: compare } \\pi \\text{ vs } e\\ln\\pi.',
          annotation:
            'Since $\\ln$ is increasing, $e^\\pi > \\pi^e \\iff \\ln(e^\\pi) > \\ln(\\pi^e) \\iff \\pi > e\\ln\\pi$.',
        },
        {
          expression: '\\text{Equiv: is } \\pi/e > \\ln \\pi?',
          annotation: 'Divide both sides by $e$.',
        },
        {
          expression: 'f(x) = x/e - \\ln(x). \\quad f\'(x) = 1/e - 1/x = 0 \\implies x = e',
          annotation: '$f$ has a minimum at $x = e$.',
        },
        {
          expression: 'f(e) = e/e - \\ln e = 1 - 1 = 0.',
          annotation: 'The minimum value of $f$ is exactly 0, achieved only at $x = e$.',
        },
        {
          expression: '\\text{For } x \\neq e: f(x) > 0 \\implies x/e > \\ln x.',
          annotation: 'At $x = \\pi \\neq e$: $\\pi/e > \\ln\\pi$. Therefore $\\pi > e\\ln\\pi$, so $e^\\pi > \\pi^e$. ∎',
        },
      ],
      answer: 'e^\\pi > \\pi^e \\approx 23.14 > 22.46',
    },
    {
      id: 'precalc4-eln-ch2',
      difficulty: 'hard',
      problem:
        'Show that $\\lim_{n\\to\\infty}\\left(1+\\frac{r}{n}\\right)^{nt} = e^{rt}$ for any rate $r$ and time $t$. This is the derivation of the continuous compounding formula.',
      hint: 'Let $m = n/r$ (so $n = mr$). Rewrite the expression in terms of $m$ and use the definition of $e$.',
      walkthrough: [
        {
          expression: '\\left(1+\\frac{r}{n}\\right)^{nt} = \\left[\\left(1+\\frac{1}{n/r}\\right)^{n/r}\\right]^{rt}',
          annotation:
            'Rewrite: factor the exponent as $rt$ and combine the base to create the pattern $(1 + 1/m)^m$.',
        },
        {
          expression: 'Let\\ m = n/r. \\text{ As } n\\to\\infty,\\ m\\to\\infty. \\text{ The expression becomes } \\left[(1+1/m)^m\\right]^{rt}',
          annotation: 'Substitution maps the $r$-dependent expression to the standard form.',
        },
        {
          expression: '\\lim_{m\\to\\infty}\\left[(1+1/m)^m\\right]^{rt} = e^{rt} \\quad \\blacksquare',
          annotation:
            'The inner limit $\\lim_{m\\to\\infty}(1+1/m)^m = e$ by definition. The outer exponent $rt$ passes through the limit. So the continuous compounding formula is proved.',
        },
      ],
      answer: 'e^{rt} — the general continuous compounding formula. ∎',
    },
  ],

  calcBridge: {
    teaser: 'The derivative of $e^x$ is itself: $\\frac{d}{dx}e^x = e^x$. The derivative of $\\ln x$ is $1/x$: $\\frac{d}{dx}\\ln x = 1/x$. These two facts — proved in this lesson via the rigor section — are the two most-used derivative formulas in all of calculus. Every chain rule application involving $e$ or $\\ln$, every implicit differentiation, and every integration by parts problem involving logarithms builds on exactly what you learned here.',
    linkedLessons: ['solving-exponential-log', 'exponential-applications'],
  },

  crossRefs: [
    { slug: 'exponential-functions', reason: 'All properties of b^x apply to e^x — this lesson is a deep dive into the single most important base.' },
    { slug: 'logarithms-intro', reason: 'ln is log base e — the inverse relationship and cancel identities covered there apply directly here.' },
    { slug: 'log-properties', reason: 'The product, quotient, and power rules for ln follow directly from the definitions and exponent laws covered here.' },
    { slug: 'solving-exponential-log', reason: 'The solving techniques in the next lesson — take ln of both sides, or exponentiate — are direct applications of the cancel identities from this lesson.' },
  ],

  checkpoints: [
    'State the definition of $e$ as a limit and explain what each piece of the expression means in the compound interest context.',
    'Why is $e$ the "natural" base — what unique property does $e^x$ have that no other base does?',
    'Evaluate $\\ln(e^{-4})$ and $e^{\\ln 9}$ without a calculator.',
    'What is the domain of $\\ln(x)$, and why cannot you take the natural log of a negative number?',
    'Solve $e^{2x} = 15$ for $x$ exactly, and describe each step.',
  ],

  semantics: {
    symbols: [
      { symbol: 'e', meaning: "Euler's number ≈ 2.71828; defined as lim(1+1/n)^n as n→∞; the base of natural exponential and logarithm" },
      { symbol: 'ln(x)', meaning: 'Natural logarithm — the inverse of e^x; asks "to what power must e be raised to get x?"' },
      { symbol: 'e^{\\ln x} = x', meaning: 'Cancel identity: exponential undoes logarithm (for x > 0)' },
      { symbol: 'ln(e^x) = x', meaning: 'Cancel identity: logarithm undoes exponential (for all real x)' },
    ],
    rulesOfThumb: [
      'To solve e^(something) = number: take ln of both sides, use cancel identity.',
      'To solve ln(something) = number: raise e to both sides, use cancel identity.',
      'Always check domain after solving: ln requires positive argument.',
      'Expand logs with quotient/product/power rules; condense by reversing.',
      'The cancel identities (e^(ln x) = x and ln(e^x) = x) are used in nearly every calculus problem involving e or ln.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        topic: 'Exponential functions (general base)',
        where: 'Precalc-4, Lesson 1',
        why: 'This lesson is a deep dive into the single most important exponential base: e. All the graph properties (asymptote at 0, passes through (0,1), always positive) from that lesson apply here.',
      },
      {
        topic: 'Logarithms with other bases',
        where: 'Precalc-4, Lesson 2',
        why: 'ln is log base e. If the idea of "inverse of an exponential" feels shaky, review the logarithms introduction which covers all bases.',
      },
    ],
    futureLinks: [
      {
        topic: 'Derivatives of e^x and ln(x)',
        where: 'Calc 1: Derivatives',
        why: "d/dx[e^x] = e^x (the derivative equals itself) and d/dx[ln x] = 1/x. These are proved using the identities from this lesson. Every calc student uses these rules daily.",
      },
      {
        topic: 'Chain Rule with e^(f(x))',
        where: 'Calc 1: Chain Rule',
        why: "d/dx[e^(f(x))] = e^(f(x)) · f'(x) — the chain rule requires knowing the cancel identities and the derivative of e^x from this lesson.",
      },
      {
        topic: '∫(1/x)dx = ln|x| + C',
        where: 'Calc 1: Integration',
        why: 'The integral of 1/x is ln|x|, which follows from the area definition of ln covered in the rigor section here.',
      },
    ],
  },

  assessment: [
    {
      question: 'Evaluate $\\ln(e^7)$.',
      answer: '7',
      difficulty: 'quick-fire',
    },
    {
      question: 'Solve $e^{2x} = 5$. Give your answer in exact form.',
      answer: 'x = \\frac{\\ln 5}{2}',
      difficulty: 'quick-fire',
    },
    {
      question: 'Which expression equals $\\ln(x^3/\\sqrt{y})$?',
      answer: '3\\ln(x) - \\tfrac{1}{2}\\ln(y)',
      difficulty: 'quick-fire',
    },
  ],

  mentalModel: [
    'e ≈ 2.718 = the limit of (1+1/n)^n as n→∞ = the compound interest wall',
    'e^x owns calculus because its derivative is itself — the only function with this property',
    'ln(x) = inverse of e^x = "the exponent you need" = area under 1/t from 1 to x',
    'Cancel identities: ln(e^x)=x and e^(ln x)=x — use constantly to undo one function with the other',
    'Solve e^(stuff)=number → take ln. Solve ln(stuff)=number → raise e to both sides.',
  ],

  checkpoints: [
    'Can you state what e equals and explain what the limit definition means in the compound interest context?',
    'Can you evaluate ln(e^5), e^(ln 3), and ln(1) without a calculator?',
    'Can you solve e^(2x) = 7 step-by-step?',
    'Can you expand ln(x²y/z³) into a sum of simple logs?',
    'Can you identify when a quadratic substitution u = e^x is needed?',
  ],

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Which limit defines $e$?',
      options: ['lim(1+n)^(1/n) as n→∞', 'lim(1+1/n)^n as n→∞', 'lim(1+1/n)^(1/n) as n→∞', 'lim(n)^(1/n) as n→∞'],
      answer: 'lim(1+1/n)^n as n→∞',
      hints: ['This comes from the compound interest problem: $1 at 100% interest, compounded n times.', 'As n → ∞, the amount approaches e ≈ 2.71828.'],
      reviewSection: 'Intuition tab — e is a limit, not just a number',
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Evaluate $\\ln(e^{-2})$.',
      options: ['-2', '2', '-1/2', 'e^(-2)'],
      answer: '-2',
      hints: ['Apply the cancel identity: ln(e^x) = x for any x.', 'ln(e^(-2)) = -2 directly.'],
      reviewSection: 'Intuition tab — key values of ln',
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Evaluate $e^{\\ln 5}$.',
      options: ['5', 'ln(5)', 'e^5', '1/5'],
      answer: '5',
      hints: ['Apply the cancel identity: e^(ln x) = x for x > 0.', 'e^(ln 5) = 5 directly.'],
      reviewSection: 'Intuition tab — the inverse relationship',
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What unique property does $f(x) = e^x$ have that no other base satisfies?',
      options: ['Its range is all positive numbers', 'Its derivative equals itself', 'It passes through (0,1)', 'It has a horizontal asymptote'],
      answer: 'Its derivative equals itself',
      hints: ['For any base b, the derivative of b^x is b^x · ln(b). When does ln(b) = 1?', 'ln(e) = 1, so d/dx[e^x] = e^x · 1 = e^x. Only for b = e.'],
      reviewSection: 'Intuition tab — e^x is its own rate of change',
    },
    {
      id: 'q5',
      type: 'choice',
      text: 'Solve $e^{3x} = 12$ exactly.',
      options: ['x = 12/e³', 'x = ln(12)/3', 'x = 3/ln(12)', 'x = ln(4)'],
      answer: 'x = ln(12)/3',
      hints: ['Take ln of both sides: ln(e^(3x)) = ln(12). Cancel the left side.', 'ln(e^(3x)) = 3x. Divide both sides by 3.'],
      reviewSection: 'Examples tab — solving exponential equations with ln',
    },
    {
      id: 'q6',
      type: 'choice',
      text: 'Which expression equals $\\ln\\!\\left(\\dfrac{x^2}{y^3}\\right)$?',
      options: ['2ln(x) + 3ln(y)', '2ln(x) - 3ln(y)', '(2/3)ln(x/y)', 'ln(x²) / ln(y³)'],
      answer: '2ln(x) - 3ln(y)',
      hints: ['First apply the quotient rule: ln(A/B) = ln(A) - ln(B).', 'Then apply the power rule: ln(x²) = 2ln(x) and ln(y³) = 3ln(y).'],
      reviewSection: 'Math tab — four laws of natural logarithms',
    },
    {
      id: 'q7',
      type: 'choice',
      text: 'Solve $\\ln(x) = -3$ exactly.',
      options: ['x = -e³', 'x = 1/e³', 'x = e^(-1/3)', 'x = -3e'],
      answer: 'x = 1/e³',
      hints: ['Raise e to both sides: e^(ln x) = e^(-3).', 'e^(ln x) = x and e^(-3) = 1/e³.'],
      reviewSection: 'Examples tab — solving logarithmic equations by exponentiating',
    },
    {
      id: 'q8',
      type: 'choice',
      text: 'The geometric meaning of $\\ln(x)$ is:',
      options: ['The slope of e^x at x', 'The area under 1/t from t=0 to t=x', 'The area under 1/t from t=1 to t=x', 'The height of e^x at x'],
      answer: 'The area under 1/t from t=1 to t=x',
      hints: ['This is the integral definition: ln(x) = ∫₁ˣ (1/t) dt.', 'Note: the lower limit is 1, not 0. At x=1, there is no area, which is why ln(1) = 0.'],
      reviewSection: 'Intuition tab — a third perspective from geometry',
    },
    {
      id: 'q9',
      type: 'choice',
      text: '$e^{2x} - 6e^x + 5 = 0$ has how many real solutions?',
      options: ['0', '1', '2', '3'],
      answer: '2',
      hints: ['Let u = e^x. The equation becomes u² - 6u + 5 = (u-1)(u-5) = 0.', 'u = 1 gives e^x = 1, so x = 0. u = 5 gives e^x = 5, so x = ln(5). Two solutions.'],
      reviewSection: 'Examples tab — solving exponential equations with ln',
    },
    {
      id: 'q10',
      type: 'choice',
      text: 'The domain of $y = \\ln(x)$ is:',
      options: ['(-∞, ∞)', '(0, ∞)', '(-∞, 0)', '[0, ∞)'],
      answer: '(0, ∞)',
      hints: ['You can only take the log of a positive number — ln is undefined for x ≤ 0.', 'The domain of ln is the range of e^x, which is (0, ∞).'],
      reviewSection: 'Intuition tab — now understand ln',
    },
  ],
}

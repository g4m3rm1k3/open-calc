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
      '**Start with a question about money.** Suppose a bank offers you 100% interest per year on \\$1. If they pay it all at once at the end of the year, you finish with \\$2. But what if they pay half the interest (50%) twice a year — mid-year and year-end? Mid-year you have \\$1.50, and then 50% of \\$1.50 is \\$0.75, so you finish with \\$2.25. Better! What if they compound every month? Every day? Every second? You keep winning more money each time — but the gains slow down. The amounts are: \\$2.00 → \\$2.25 → \\$2.59 → \\$2.71 → \\$2.718... They are approaching a wall. That wall is $e$.',

      '**So $e$ is a limit, not just a number.** Formally: $e = \\lim_{n \\to \\infty}\\left(1 + \\frac{1}{n}\\right)^n \\approx 2.71828...$. Each value of $n$ represents compounding $n$ times per year. As $n$ grows toward infinity (continuous compounding), the amount approaches $e$ — it never reaches $e$, but gets infinitely close. $e$ is the exact amount \\$1 grows to at 100% interest compounded continuously for 1 year. That is its definition. Everything else about $e$ follows from this.',

      '**But why should a number born from interest rates show up in physics and probability?** Because the real pattern behind $e$ is not money — it is the idea of *continuous proportional growth*. Any time a quantity grows (or shrinks) at a rate proportional to itself, the solution involves $e^x$. A population where each organism reproduces continuously, a hot object cooling at a rate proportional to temperature difference, a radioactive atom decaying at a rate proportional to how many atoms remain — they all obey $y = Ce^{kt}$. The money example is just one instance of this universal pattern.',

      '**The magical property: $e^x$ is its own rate of change.** This is the real reason mathematicians chose $e$. For any base $b$, the derivative of $b^x$ is $b^x$ multiplied by some constant. For $b = 2$: that constant is $\\ln 2 \\approx 0.693$. For $b = 10$: it is $\\ln 10 \\approx 2.303$. For $b = e$: the constant is $\\ln e = 1$. So $\\frac{d}{dx}[e^x] = 1 \\cdot e^x = e^x$. The derivative of $e^x$ is itself. No other base does this. This means $e^x$ is the unique function that describes its own rate of change — growth that is perfectly synchronized with its own size.',

      '**Now understand $\\ln$.** The natural logarithm $\\ln(x)$ is the inverse of $e^x$. That means: if $e^y = x$, then $\\ln(x) = y$. In plain English: $\\ln(x)$ asks "to what power must I raise $e$ to get $x$?" So $\\ln(e^3) = 3$ because $e^3 = e^3$. And $\\ln(1) = 0$ because $e^0 = 1$. The graph of $\\ln(x)$ is the mirror image of $e^x$ — reflected across the line $y = x$.',

      '**A second beautiful way to understand $\\ln$: it is about time.** Imagine a population that doubles every fixed period, or \\$1 growing at continuous 100% interest. The natural log $\\ln(x)$ answers: "how long does it take to grow from 1 to $x$?" So $\\ln(2) \\approx 0.693$ means it takes about 0.693 years to double (at 100% continuous rate). $\\ln(7.389) \\approx 2$ means it takes exactly 2 years to reach \\$7.389. $\\ln$ measures the *time required for proportional growth* — and that is exactly what you need to solve exponential equations.',

      '**A third perspective from geometry.** The natural log has a stunning geometric meaning: $\\ln(x)$ is the area under the curve $y = 1/t$ from $t = 1$ to $t = x$. Specifically: $\\ln(x) = \\int_1^x \\frac{1}{t}\\,dt$. This connects $\\ln$ to integration in a deep way — and you will use this definition in calculus to prove that the derivative of $\\ln(x)$ is $1/x$. For now, just appreciate that the logarithm is secretly an area.',
    ],
    callouts: [
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
        type: 'misconception',
        title: 'Common Errors with $\\ln$',
        body: '\\ln(a + b) \\neq \\ln(a) + \\ln(b) \\quad \\text{(no addition rule!)} \\\\ \\ln(a) + \\ln(b) = \\ln(a \\cdot b) \\quad \\text{(product rule)} \\\\ \\ln(0) \\text{ is undefined.} \\quad \\ln(\\text{negative}) \\text{ is undefined (over reals).} \\\\ \\ln(1) = 0, \\text{ NOT } 1.',
      },
    ],
    visualizations: [
      {
        id: 'ExponentialGrowth',
        title: 'Compounding Frequency → $e$: Watch the Limit Form',
        mathBridge:
          'This visualization shows $A(n) = \\left(1 + \\frac{1}{n}\\right)^n$ for increasing values of $n$. As $n$ grows (compounding more frequently), the output climbs: $n=1$ gives exactly 2, $n=12$ gives 2.613, $n=365$ gives 2.7146, $n\\to\\infty$ gives $e \\approx 2.71828$. The horizontal dashed line IS $e$. Notice how the values approach it asymptotically — getting closer but never arriving. That asymptote IS the definition of $e$.',
        caption:
          'Each step of the slider doubles the compounding frequency. The limit $e \\approx 2.71828$ is the horizontal asymptote the curve can never reach.',
      },
      {
        id: 'ExponentialSlopeAtZero',
        title: 'Why $e$ is the "Natural" Base — The Slope Argument',
        mathBridge:
          'For base $b$, the slope of $y = b^x$ at $x = 0$ is exactly $\\ln(b)$. Watch how the tangent line at $x=0$ changes as you adjust the base. When $b = 2$, the slope at zero is $\\ln 2 \\approx 0.693$ — less than 1 (the curve rises slower than $y=x$). When $b = 3$, slope is $\\ln 3 \\approx 1.099$ (steeper than 1). There is exactly ONE base where the slope at zero equals 1 exactly — that base is $e$. When slope = 1, the tangent line at the origin is the 45-degree line $y = x$, and the derivative of $e^x$ is exactly $e^x$ everywhere.',
        caption:
          'Drag the base slider. The slope of $b^x$ at $x=0$ equals $\\ln(b)$. Only at $b=e$ does this slope equal exactly 1.',
      },
      {
        id: 'ExpLogBridgeLab',
        title: 'The Inverse Bridge: $e^x$ and $\\ln(x)$ as Reflections',
        mathBridge:
          'The graphs of $y = e^x$ and $y = \\ln(x)$ are mirror images across the line $y = x$ — they are inverse functions. Every point $(a, b)$ on $e^x$ corresponds to the point $(b, a)$ on $\\ln(x)$. The key points: $(0, 1)$ on $e^x$ corresponds to $(1, 0)$ on $\\ln(x)$; $(1, e)$ on $e^x$ corresponds to $(e, 1)$ on $\\ln(x)$. This mirroring is the geometric meaning of "inverse function" — and it is why $\\ln(e^x) = x$ and $e^{\\ln x} = x$ (cancellation laws).',
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
          'Because $\\ln(x) = \\int_1^x \\frac{1}{t}\\,dt$ (area under $1/t$), the product rule $\\ln(ab) = \\ln(a) + \\ln(b)$ is literally about cutting and rearranging areas. The area from 1 to $ab$ under $1/t$ can be split into: area from 1 to $a$, plus area from $a$ to $ab$. A substitution shows the second piece equals the area from 1 to $b$. Together: area(1 to $ab$) = area(1 to $a$) + area(1 to $b$), which is $\\ln(ab) = \\ln(a) + \\ln(b)$. This visualization shows that area decomposition.',
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
        expression: '\\ln(e^x) = x \\text{ and } e^{\\ln x} = x$',
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
          'This is the rigorous definition of $\\ln$: it is the area under the curve $y = 1/t$ from $t = 1$ to $t = x$. When $x > 1$ the area is positive. When $0 < x < 1$ the area is negative (we are going backward from 1 toward 0). When $x = 1$ there is no area — that is why $\\ln(1) = 0$. All properties of $\\ln$ (product law, derivative $1/x$) can be proved directly from this area definition.',
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
            'Each of these uses either $\\ln(e^x) = x$ or $e^{\\ln x} = x$. Toggle between "starting with $e^x$" and "starting with $\\ln$" to see which cancel rule applies.',
          caption: 'The cancel identities make these evaluations immediate once you see the pattern.',
        },
      ],
      steps: [
        {
          expression: '(a)\\; \\ln(e^5) = 5',
          annotation: 'Direct: $\\ln(e^x) = x$. The logarithm and exponential are inverses — they cancel.',
        },
        {
          expression: '(b)\\; \\ln(1) = \\ln(e^0) = 0',
          annotation: '$1 = e^0$. Rewrite 1 as $e^0$, then apply $\\ln(e^x) = x$.',
        },
        {
          expression: '(c)\\; e^{\\ln 7} = 7',
          annotation: 'Direct: $e^{\\ln x} = x$. The exponential undoes the logarithm.',
        },
        {
          expression: '(d)\\; \\ln(e^{-3}) = -3',
          annotation: '$\\ln(e^x) = x$ works for negative exponents too.',
        },
        {
          expression: '(e)\\; \\ln\\!\\left(\\tfrac{1}{e^2}\\right) = \\ln(e^{-2}) = -2',
          annotation: 'Rewrite $1/e^2 = e^{-2}$ using the negative exponent rule, then cancel.',
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
        },
        {
          expression: '= \\ln(x^3) + \\ln(\\sqrt{y}) - \\ln(z^2)',
          annotation: 'Apply the product rule: $\\ln(AB) = \\ln(A) + \\ln(B)$.',
        },
        {
          expression: '= 3\\ln(x) + \\tfrac{1}{2}\\ln(y) - 2\\ln(z)',
          annotation:
            'Apply the power rule: $\\ln(a^n) = n\\ln(a)$. Note $\\sqrt{y} = y^{1/2}$ and $\\ln(z^2) = 2\\ln(z)$.',
        },
        {
          expression: '(b)\\; 3\\ln(x) - \\tfrac{1}{2}\\ln(y) + \\ln(5)',
          annotation: 'Start condensing. Power rule reverses the coefficients into exponents.',
        },
        {
          expression: '= \\ln(x^3) - \\ln(y^{1/2}) + \\ln(5)',
          annotation: 'Power rule: $n\\ln(a) = \\ln(a^n)$.',
        },
        {
          expression: '= \\ln\\!\\left(\\frac{5x^3}{\\sqrt{y}}\\right)',
          annotation:
            'Product rule adds logs: $\\ln(x^3) + \\ln(5) = \\ln(5x^3)$. Quotient rule subtracts: $- \\ln(\\sqrt{y}) = \\ln(1/\\sqrt{y})$. Combined: single logarithm.',
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
        },
        {
          expression: '2x = \\ln(7) \\implies x = \\frac{\\ln 7}{2}',
          annotation:
            'Cancel: $\\ln(e^{2x}) = 2x$. Divide by 2. Exact answer — do not try to compute $\\ln(7)$ by hand.',
        },
        {
          expression: '(b)\\; 3e^{x-1} = 15 \\implies e^{x-1} = 5',
          annotation: 'Isolate the exponential first: subtract 5, divide by 3.',
        },
        {
          expression: 'x - 1 = \\ln 5 \\implies x = 1 + \\ln 5',
          annotation: 'Take $\\ln$ of both sides: $\\ln(e^{x-1}) = x - 1 = \\ln 5$. Solve for $x$.',
        },
        {
          expression: '(c)\\; e^{2x} - 5e^x + 6 = 0 \\implies u = e^x: \\quad u^2 - 5u + 6 = 0',
          annotation:
            'Substitution! This is disguised as a quadratic in $u = e^x$. Notice $e^{2x} = (e^x)^2$.',
        },
        {
          expression: '(u-2)(u-3) = 0 \\implies u = 2 \\text{ or } u = 3',
          annotation: 'Factor the quadratic.',
        },
        {
          expression: 'e^x = 2 \\implies x = \\ln 2 \\qquad e^x = 3 \\implies x = \\ln 3',
          annotation: 'Both solutions valid since $e^x > 0$ always. Two exact answers.',
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
          expression: '(a)\\; \\ln(x) = 4 \\implies e^{\\ln x} = e^4 \\implies x = e^4$',
          annotation:
            'Exponentiate both sides (raise $e$ to the power of each side). The left side simplifies immediately via $e^{\\ln x} = x$.',
        },
        {
          expression: '(b)\\; \\ln(2x-1) = 3 \\implies 2x-1 = e^3',
          annotation: 'Exponentiate: $e^{\\ln(2x-1)} = e^3$ gives $2x - 1 = e^3$.',
        },
        {
          expression: '2x = 1 + e^3 \\implies x = \\frac{1 + e^3}{2} \\approx 10.54',
          annotation: 'Solve for $x$. Always check: the argument $2x - 1 = e^3 > 0$ ✓.',
        },
        {
          expression: '(c)\\; \\ln(x) + \\ln(x-2) = \\ln(8) \\implies \\ln(x(x-2)) = \\ln(8)',
          annotation:
            'Apply product rule: $\\ln(A) + \\ln(B) = \\ln(AB)$. Both sides are now $\\ln$ of something.',
        },
        {
          expression: 'x(x-2) = 8 \\implies x^2 - 2x - 8 = 0 \\implies (x-4)(x+2) = 0',
          annotation: 'Since $\\ln$ is one-to-one, $\\ln(A) = \\ln(B) \\implies A = B$. Factor the quadratic.',
        },
        {
          expression: 'x = 4 \\text{ or } x = -2. \\quad \\text{Check: } x = -2 \\text{ makes } \\ln(-2) \\text{ undefined — reject.}',
          annotation:
            'Always check domain! $x = -2$ gives $\\ln(-2)$, which does not exist for real numbers. The only solution is $x = 4$.',
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
            'The continuous decay model $A = A_0 e^{kt}$ with $k < 0$ produces a decaying exponential. The half-life is when $A = A_0/2$. Set $k$ so that at $t = 5730$ years, $A = A_0/2$. Then use the model to find the $t$ where $A = 0.35 A_0$.',
          caption:
            'Drag the slider to the half-life (5730 yr). Notice exactly half the original remains. Then find the time for 35% remaining.',
        },
      ],
      steps: [
        {
          expression: '\\text{Step 1: Find } k \\text{ using the half-life.} \\quad \\frac{A_0}{2} = A_0 e^{k \\cdot 5730}',
          annotation: 'At $t = 5730$, exactly half the original amount remains. $A_0$ cancels.',
        },
        {
          expression: '\\frac{1}{2} = e^{5730k} \\implies \\ln\\!\\left(\\tfrac{1}{2}\\right) = 5730k',
          annotation: 'Take $\\ln$ of both sides.',
        },
        {
          expression: 'k = \\frac{\\ln(0.5)}{5730} = \\frac{-\\ln 2}{5730} \\approx -0.0001209\\ \\text{yr}^{-1}',
          annotation: 'Exact value: $k = -\\ln(2)/5730$. Negative confirms decay.',
        },
        {
          expression: '\\text{Step 2: Solve } 0.35 A_0 = A_0 e^{kt}',
          annotation: 'Now use $k$ to find $t$ when 35% remains.',
        },
        {
          expression: '0.35 = e^{kt} \\implies \\ln(0.35) = kt',
          annotation: 'Cancel $A_0$, take $\\ln$ of both sides.',
        },
        {
          expression:
            't = \\frac{\\ln(0.35)}{k} = \\frac{\\ln(0.35)}{-\\ln 2 / 5730} = \\frac{5730 \\ln(0.35)}{-\\ln 2} \\approx \\frac{5730(-1.0498)}{-0.6931} \\approx 8684\\ \\text{years}$',
          annotation:
            'Divide both sides by $k$. Compute numerically. The artifact is approximately 8684 years old.',
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

  crossRefs: [
    {
      lessonSlug: 'exponential-functions',
      label: 'Previous: Exponential Functions',
      context:
        'The base $e$ is the most important case of $b^x$. Everything about transformations and asymptotes from that lesson applies to $e^x$.',
    },
    {
      lessonSlug: 'logarithms-intro',
      label: 'Next: Logarithms (All Bases)',
      context:
        '$\\ln$ is base-$e$ logarithm. All other logarithms share the same rules, just with different bases. The change-of-base formula connects them all.',
    },
    {
      lessonSlug: 'solving-exponential-log',
      label: 'Apply: Solving Exponential and Log Equations',
      context:
        'Full drill on applying the $\\ln$-as-inverse technique to solve any exponential or log equation, including more complex compound cases.',
    },
  ],

  semantics: {
    core: [
      {
        symbol: 'e',
        meaning:
          "Euler's number ≈ 2.71828; defined as lim(1+1/n)^n as n→∞; the base of natural exponential and logarithm",
      },
      {
        symbol: 'ln(x)',
        meaning: 'Natural logarithm — the inverse of e^x; asks "to what power must e be raised to get x?"',
      },
      {
        symbol: 'e^(ln x) = x',
        meaning: 'Cancel identity: exponential undoes logarithm (for x > 0)',
      },
      {
        symbol: 'ln(e^x) = x',
        meaning: 'Cancel identity: logarithm undoes exponential (for all real x)',
      },
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
        lessonId: 'precalc4-exponential-functions',
        label: 'Previous: Exponential Functions',
        note: 'This lesson is a deep dive into the single most important exponential base: e. All the graph properties (asymptote at 0, passes through (0,1), always positive) from that lesson apply here.',
      },
      {
        lessonId: 'precalc4-logarithms-intro',
        label: 'Logarithms with other bases',
        note: 'ln is log base e. If the idea of "inverse of an exponential" feels shaky, review the logarithms introduction which covers all bases.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'ch2-exp-log-derivatives',
        label: 'Calc 1: Derivatives of e^x and ln(x)',
        note: "d/dx[e^x] = e^x (the derivative equals itself) and d/dx[ln x] = 1/x. These are proved using the identities from this lesson. Every calc student uses these rules daily.",
      },
      {
        lessonId: 'ch2-chain-rule',
        label: 'Calc 1: Chain Rule with e^(f(x))',
        note: 'd/dx[e^(f(x))] = e^(f(x)) · f\'(x) — the chain rule requires knowing the cancel identities and the derivative of e^x from this lesson.',
      },
      {
        lessonId: 'ch4-fundamental-theorem',
        label: 'Calc 1: ∫(1/x)dx = ln|x| + C',
        note: 'The integral of 1/x is ln|x|, which follows from the area definition of ln covered in the rigor section here.',
      },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'eln-assess-1',
        type: 'input',
        text: 'Evaluate ln(e^7).',
        answer: '7',
        hint: 'Cancel identity: ln(e^x) = x.',
      },
      {
        id: 'eln-assess-2',
        type: 'input',
        text: 'Solve e^(2x) = 5. Give your answer in exact form.',
        answer: 'ln(5)/2',
        hint: 'Take ln of both sides: 2x = ln(5). Divide by 2.',
      },
      {
        id: 'eln-assess-3',
        type: 'choice',
        text: 'Which expression equals ln(x³/√y)?',
        options: [
          '3ln(x) - (1/2)ln(y)',
          '3ln(x) + (1/2)ln(y)',
          '(3/2)ln(x/y)',
          '3ln(x)·(1/2)ln(y)',
        ],
        answer: '3ln(x) - (1/2)ln(y)',
        hint: 'Quotient rule: ln(A/B) = ln(A) - ln(B). Power rule: ln(x³) = 3ln(x), ln(√y) = (1/2)ln(y).',
      },
      {
        id: 'eln-assess-4',
        type: 'input',
        text: 'What is e^(ln 12)?',
        answer: '12',
        hint: 'Cancel identity: e^(ln x) = x.',
      },
      {
        id: 'eln-assess-5',
        type: 'input',
        text: 'Solve ln(x) + ln(x+2) = ln(8). State all valid solutions.',
        answer: '2',
        hint: 'Product rule: ln(x(x+2)) = ln(8), so x(x+2) = 8. Solve x²+2x-8=0. Check domain (x must be positive).',
      },
    ],
  },

  mentalModel: [
    'e ≈ 2.718 = the limit of (1+1/n)^n as n→∞ = the compound interest wall',
    'e^x owns calculus because its derivative is itself',
    'ln(x) = inverse of e^x = "the exponent you need" = area under 1/t from 1 to x',
    'Cancel identities: ln(e^x)=x and e^(ln x)=x — use constantly',
    'Solve e^(stuff)=number → take ln. Solve ln(stuff)=number → raise e to both sides.',
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'completed-example-5',
    'attempted-challenge',
  ],
}

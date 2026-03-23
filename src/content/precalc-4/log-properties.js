export default {
  id: 'ch4-003',
  slug: 'log-properties',
  chapter: 4,
  order: 3,
  title: 'Properties of Logarithms: Why Every Rule Follows from the Exponent Laws',
  subtitle: 'Log properties are not arbitrary rules to memorise — each one is just an exponent law in disguise',
  tags: ['log properties', 'product rule', 'quotient rule', 'power rule', 'change of base', 'expand logarithms', 'condense logarithms', 'logarithm rules'],
  aliases: 'log properties product quotient power rule change of base formula expand condense logarithms combine simplify',

  hook: {
    question: 'Why does $\\log(AB) = \\log A + \\log B$? This looks like a miracle until you remember that logarithms are exponents — and when you multiply powers of the same base, you add exponents. Every log property is that observation, dressed up in log notation.',
    realWorldContext: 'Log properties are why slide rules worked: multiplying two numbers was done by adding their logarithms, then reading off the antilog. Before electronic calculators, this was how engineers, navigators, and scientists performed complex multiplication in seconds. Today, log properties are used to linearise multiplicative models — taking the log of a power law $y = ax^b$ gives $\\ln y = \\ln a + b\\ln x$, a linear relationship that is easy to fit to data.',
    previewVisualizationId: 'LogPropertiesViz',
  },

  intuition: {
    prose: [
      'Every log property comes from the corresponding exponent law. The product rule $\\log_b(MN) = \\log_b M + \\log_b N$ mirrors $b^m \\cdot b^n = b^{m+n}$. The quotient rule $\\log_b(M/N) = \\log_b M - \\log_b N$ mirrors $b^m / b^n = b^{m-n}$. The power rule $\\log_b(M^p) = p\\log_b M$ mirrors $(b^m)^p = b^{mp}$. Once you see this connection, the properties are not rules to memorise — they are consequences of something you already know.',
      'Expanding a logarithm means breaking it into a sum/difference of simpler logs using these properties. Condensing means running the properties in reverse to combine multiple logs into a single log. Both operations are the same rules — just different directions.',
      'The change of base formula $\\log_b x = \\frac{\\ln x}{\\ln b} = \\frac{\\log x}{\\log b}$ lets you compute any logarithm using only the ln or log button on a calculator. It also reveals a beautiful fact: all logarithm functions of the same shape are just vertical scalings of each other. $\\log_b x = \\frac{1}{\\ln b} \\cdot \\ln x$ — they are all multiples of $\\ln x$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The three log properties — and their exponent law twins',
        body: '\\log_b(MN) = \\log_b M + \\log_b N \\quad [b^m \\cdot b^n = b^{m+n}] \\\\ \\log_b\\frac{M}{N} = \\log_b M - \\log_b N \\quad [b^m / b^n = b^{m-n}] \\\\ \\log_b(M^p) = p\\,\\log_b M \\quad [(b^m)^p = b^{mp}]',
      },
      {
        type: 'theorem',
        title: 'Change of base formula',
        body: '\\log_b x = \\frac{\\log x}{\\log b} = \\frac{\\ln x}{\\ln b} \\\\ \\text{Works with any consistent base in numerator and denominator.} \\\\ \\text{Example: } \\log_5 17 = \\frac{\\ln 17}{\\ln 5} = \\frac{2.833}{1.609} \\approx 1.760',
      },
      {
        type: 'warning',
        title: 'The two most common log errors',
        body: '\\log_b(M + N) \\neq \\log_b M + \\log_b N \\quad \\text{(no sum rule!)} \\\\ \\frac{\\log_b M}{\\log_b N} \\neq \\log_b M - \\log_b N \\quad \\text{(quotient rule requires } \\log_b \\frac{M}{N}\\text{)} \\\\ \\text{These errors are extremely common — check every step.}',
      },
      {
        type: 'insight',
        title: 'Why all logs are proportional to each other',
        body: '\\log_b x = \\frac{\\ln x}{\\ln b} = \\underbrace{\\frac{1}{\\ln b}}_{\\text{constant}} \\cdot \\ln x \\\\ \\text{Every log function is just } \\ln x \\text{ scaled by a constant.} \\\\ \\text{Larger base } b \\Rightarrow \\text{smaller constant } \\frac{1}{\\ln b} \\Rightarrow \\text{slower growth.}',
      },
    ],
    videos: [
      {
        id: 'change-of-base',
        title: 'Change of Base Formula Logarithms',
        youtubeId: '-YdDWWokOqQ',
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/-YdDWWokOqQ" frameborder="0" allowfullscreen></iframe>',
        placement: 'after-callouts',
        caption: 'Derives the change of base formula and works through examples evaluating logs of any base on a calculator.',
      },
    ],
    visualizations: [
      {
        id: 'LogPropertiesViz',
        title: 'Log Properties as Area Decomposition',
        mathBridge: 'Drag the sliders for $M$ and $N$. See $\\ln(MN)$ as the area of $\\ln M$ plus the area of $\\ln N$ under $y=1/t$ — the product rule as geometry.',
        caption: 'This is why the log product rule is true: areas add under integration, and ln is defined as an area.',
      },
    ],
  },

  math: {
    prose: [
      'Expanding logs fully means applying all three properties until no log contains a product, quotient, or power. The order is: (1) log of quotient → subtraction, (2) log of product → addition, (3) log of power → bring exponent out front. Always handle quotients before products to avoid sign errors.',
      'Condensing logs means reversing: (1) coefficients become exponents using the power rule, (2) sums become products using the product rule, (3) differences become quotients using the quotient rule. The goal is always a single logarithm.',
      'The change of base formula is most useful for computing numerical values and for calculus. In calculus, $\\log_b x = \\frac{\\ln x}{\\ln b}$ means $\\frac{d}{dx}\\log_b x = \\frac{1}{x\\ln b}$ — the derivative of any log is just $1/(x\\ln b)$, reducing to $1/x$ when $b = e$. This is why natural logs dominate in calculus.',
    ],
    callouts: [
      {
        type: 'proof-map',
        title: 'Expanding a logarithm — step by step',
        body: '\\log_b\\frac{x^3\\sqrt{y}}{z^2}: \\\\ 1.\\; = \\log_b(x^3\\sqrt{y}) - \\log_b z^2 \\quad\\text{(quotient)} \\\\ 2.\\; = \\log_b x^3 + \\log_b y^{1/2} - \\log_b z^2 \\quad\\text{(product)} \\\\ 3.\\; = 3\\log_b x + \\tfrac{1}{2}\\log_b y - 2\\log_b z \\quad\\text{(power)}',
      },
      {
        type: 'proof-map',
        title: 'Condensing logarithms — step by step',
        body: '3\\ln x + \\tfrac{1}{2}\\ln y - 2\\ln z: \\\\ 1.\\; = \\ln x^3 + \\ln y^{1/2} - \\ln z^2 \\quad\\text{(power rule reversal)} \\\\ 2.\\; = \\ln(x^3 y^{1/2}) - \\ln z^2 \\quad\\text{(product rule reversal)} \\\\ 3.\\; = \\ln\\frac{x^3\\sqrt{y}}{z^2} \\quad\\text{(quotient rule reversal)}',
      },
    ],
    videos: [
      {
        id: 'expand-logs',
        title: 'Using Properties of Logarithms to Expand Logs',
        youtubeId: 'e4NAYp1EvzU',
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/e4NAYp1EvzU" frameborder="0" allowfullscreen></iframe>',
        placement: 'after-prose',
        caption: 'Multiple worked examples expanding complex logarithmic expressions using all three properties.',
      },
      {
        id: 'condense-logs',
        title: 'Using Properties of Logarithms to Condense Logs',
        youtubeId: 'EmYqoq0-1H0',
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/EmYqoq0-1H0" frameborder="0" allowfullscreen></iframe>',
        placement: 'after-callouts',
        caption: 'Reversing the properties to combine multiple log terms into a single logarithm — the key skill for solving log equations.',
      },
    ],
  },

  rigor: {
    title: 'Proving the product rule: $\\log_b(MN) = \\log_b M + \\log_b N$',
    visualizationId: 'LogPropertiesViz',
    proofSteps: [
      {
        expression: '\\text{Let } \\log_b M = p \\text{ and } \\log_b N = q.',
        annotation: 'Name the two log values. By definition, $b^p = M$ and $b^q = N$.',
      },
      {
        expression: 'MN = b^p \\cdot b^q = b^{p+q}',
        annotation: 'Multiply using the exponential form. Exponent law: same base, add exponents.',
      },
      {
        expression: '\\log_b(MN) = \\log_b(b^{p+q}) = p + q',
        annotation: 'Take $\\log_b$ of both sides. Cancellation identity: $\\log_b(b^{p+q}) = p+q$.',
      },
      {
        expression: '\\therefore \\log_b(MN) = p + q = \\log_b M + \\log_b N \\qquad \\blacksquare',
        annotation: 'Substitute back. The quotient rule and power rule follow by the same argument with $b^{p-q}$ and $b^{mp}$ respectively.',
      },
    ],
  },

  examples: [
    {
      id: 'ch4-003-ex1',
      title: 'Expanding fully',
      problem: '\\text{Expand completely: } \\log_4\\frac{\\sqrt{x}\\,y^3}{16z}',
      steps: [
        {
          expression: '= \\log_4(\\sqrt{x}\\,y^3) - \\log_4(16z)',
          annotation: 'Quotient rule first.',
        },
        {
          expression: '= \\log_4 x^{1/2} + \\log_4 y^3 - \\log_4 16 - \\log_4 z',
          annotation: 'Product rule on both parts.',
        },
        {
          expression: '= \\frac{1}{2}\\log_4 x + 3\\log_4 y - 2 - \\log_4 z',
          annotation: 'Power rule, and $\\log_4 16 = \\log_4 4^2 = 2$.',
        },
      ],
      conclusion: 'Always simplify any logs that evaluate to integers — $\\log_4 16 = 2$ is exact and should not be left as a log.',
    },
    {
      id: 'ch4-003-ex2',
      title: 'Condensing to a single logarithm',
      problem: '2\\log x - \\frac{1}{3}\\log y + \\log z^2',
      steps: [
        {
          expression: '= \\log x^2 - \\log y^{1/3} + \\log z^2',
          annotation: 'Power rule: bring coefficients up as exponents.',
        },
        {
          expression: '= \\log\\frac{x^2 z^2}{y^{1/3}}',
          annotation: 'Positive terms → numerator (product rule), negative terms → denominator (quotient rule).',
        },
        {
          expression: '= \\log\\frac{x^2 z^2}{\\sqrt[3]{y}}',
          annotation: 'Write the fractional exponent as a radical for clean final form.',
        },
      ],
      conclusion: 'The sign in front of each log term determines numerator (positive) or denominator (negative) placement.',
    },
    {
      id: 'ch4-003-ex3',
      title: 'Change of base',
      problem: '\\text{Evaluate } \\log_7 200 \\text{ to 4 decimal places.}',
      steps: [
        {
          expression: '\\log_7 200 = \\frac{\\ln 200}{\\ln 7} = \\frac{5.2983}{1.9459} \\approx 2.7228',
          annotation: 'Change of base with natural log. Could equally use $\\log/\\log$.',
        },
        {
          expression: '\\text{Check: } 7^{2.7228} \\approx 200 \\checkmark',
          annotation: 'Verify by computing the exponential.',
        },
      ],
      conclusion: 'Change of base is the only way to compute logs of non-standard bases on a calculator. Always verify by checking $b^{\\text{answer}} \\approx x$.',
    },
  ],

  challenges: [
    {
      id: 'ch4-003-ch1',
      difficulty: 'medium',
      problem: '\\text{If } \\log_b 2 = 0.3869 \\text{ and } \\log_b 3 = 0.6131, \\text{ find } \\log_b 72 \\text{ without a calculator.}',
      hint: 'Factor 72 into powers of 2 and 3. Use log properties.',
      walkthrough: [
        {
          expression: '72 = 8 \\cdot 9 = 2^3 \\cdot 3^2',
          annotation: 'Factor 72.',
        },
        {
          expression: '\\log_b 72 = \\log_b(2^3 \\cdot 3^2) = 3\\log_b 2 + 2\\log_b 3',
          annotation: 'Product and power rules.',
        },
        {
          expression: '= 3(0.3869) + 2(0.6131) = 1.1607 + 1.2262 = 2.3869',
          annotation: 'Substitute known values.',
        },
      ],
      answer: '\\log_b 72 \\approx 2.3869',
    },
    {
      id: 'ch4-003-ch2',
      difficulty: 'hard',
      problem: '\\text{Prove the change of base formula: } \\log_b x = \\frac{\\log_a x}{\\log_a b}.',
      hint: 'Let $y = \\log_b x$, convert to exponential form, then take $\\log_a$ of both sides.',
      walkthrough: [
        {
          expression: 'y = \\log_b x \\iff b^y = x',
          annotation: 'Convert to exponential form.',
        },
        {
          expression: '\\log_a(b^y) = \\log_a x \\Rightarrow y\\log_a b = \\log_a x',
          annotation: 'Take $\\log_a$ of both sides. Power rule on the left.',
        },
        {
          expression: 'y = \\frac{\\log_a x}{\\log_a b} \\Rightarrow \\log_b x = \\frac{\\log_a x}{\\log_a b} \\qquad \\blacksquare',
          annotation: 'Solve for $y$. Works for any base $a > 0$, $a \\neq 1$.',
        },
      ],
      answer: '\\log_b x = \\frac{\\log_a x}{\\log_a b}',
    },
  ],

  calcBridge: {
    teaser: 'Log properties are the engine behind logarithmic differentiation in calculus. To differentiate $y = x^x$, take $\\ln$ of both sides: $\\ln y = x\\ln x$. Now differentiate implicitly using the product rule, then solve for $y\'$. Without log properties, functions like $y = \\frac{x^3(x+1)^4}{\\sqrt{x^2+1}}$ would require the product and quotient rules repeatedly. With log differentiation, one application of the properties turns it into a sum of simple derivatives.',
    linkedLessons: ['logarithms-intro', 'solving-exponential-log', 'logarithm-relationships'],
  },
}

export default {
  id: 'ch4-002',
  slug: 'logarithms-intro',
  chapter: 4,
  order: 2,
  title: 'Logarithms: The Inverse of the Exponential',
  subtitle: 'A logarithm answers one question: "what exponent did we use?" — understanding this makes every log property obvious',
  tags: ['logarithm', 'log', 'natural log', 'ln', 'common log', 'log base', 'graphing logarithms', 'inverse function', 'domain', 'transformations', 'logarithm definition'],
  aliases: 'logarithm log base natural log ln common log base 10 graph domain range transformations inverse exponential',

  hook: {
    question: 'If $2^x = 8$, you can see by inspection that $x = 3$. But if $2^x = 10$, what is $x$? There is no clean answer — yet the question is completely well-posed. Logarithms were invented precisely to answer it: $x = \\log_2 10 \\approx 3.32$.',
    realWorldContext: 'Logarithms compress enormous ranges into manageable numbers. The Richter scale for earthquakes, decibels for sound, pH for acidity, and stellar magnitude for brightness — all use logarithmic scales because the underlying phenomena span factors of millions. A magnitude-7 earthquake releases roughly 32 times the energy of a magnitude-6 earthquake. Logarithms make these relationships linear and intuitive. In CS, $\\log_2 n$ appears in binary search, merge sort, and tree height — anywhere you repeatedly halve a problem.',
    previewVisualizationId: 'LogGraphViz',
  },

  intuition: {
    prose: [
      'The logarithm is defined as the inverse of the exponential. $\\log_b x = y$ means exactly the same thing as $b^y = x$. Reading it: "the logarithm base $b$ of $x$ is $y$" — meaning "$b$ raised to the power $y$ gives $x$." The logarithm asks: what exponent do we need?',
      'Because it is the inverse of $b^x$, the graph of $y = \\log_b x$ is the reflection of $y = b^x$ over the line $y = x$. Everything flips: the horizontal asymptote $y = 0$ of the exponential becomes a vertical asymptote $x = 0$ of the logarithm. The $y$-intercept $(0, 1)$ of the exponential becomes the $x$-intercept $(1, 0)$ of the logarithm. The domain of the exponential ($-\\infty, \\infty$) becomes the range of the logarithm — and vice versa.',
      'The domain of $\\log_b x$ is $(0, \\infty)$ — you can only take the log of a positive number. This is not arbitrary: $b^y$ is always positive for any $b > 0$, so the output of the exponential (which becomes the input of the logarithm) is always positive. $\\log_b 0$ and $\\log_b(-5)$ are undefined over the reals.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The logarithm — two equivalent forms',
        body: '\\log_b x = y \\iff b^y = x \\\\ \\text{Conditions: } b > 0, \\; b \\neq 1, \\; x > 0 \\\\ \\text{Read: "log base } b \\text{ of } x \\text{ equals } y"',
      },
      {
        type: 'definition',
        title: 'Special bases you must know',
        body: '\\log x = \\log_{10} x \\quad \\text{(common log — base 10, calculator "log")} \\\\ \\ln x = \\log_e x \\quad \\text{(natural log — base } e \\approx 2.718\\text{, calculator "ln")} \\\\ \\log_2 x \\quad \\text{(binary log — ubiquitous in CS and information theory)}',
      },
      {
        type: 'insight',
        title: 'The inverse relationship — domain and range swap',
        body: 'y = b^x: \\; \\text{domain } (-\\infty,\\infty), \\; \\text{range } (0,\\infty), \\; \\text{passes through } (0,1) \\\\ y = \\log_b x: \\; \\text{domain } (0,\\infty), \\; \\text{range } (-\\infty,\\infty), \\; \\text{passes through } (1,0) \\\\ \\text{Reflection: swap every } (x,y) \\text{ pair.}',
      },
      {
        type: 'theorem',
        title: 'Key log values to know cold',
        body: '\\log_b 1 = 0 \\quad \\text{(because } b^0=1\\text{)} \\\\ \\log_b b = 1 \\quad \\text{(because } b^1=b\\text{)} \\\\ \\log_b b^x = x \\quad \\text{(inverse cancels)} \\\\ b^{\\log_b x} = x \\quad \\text{(inverse cancels the other way)}',
      },
    ],
    videos: [
      {
        id: 'logarithm-introduction',
        title: 'Logarithm Introduction',
        youtubeId: 'UpUjJQGSlDY',
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/UpUjJQGSlDY" frameborder="0" allowfullscreen></iframe>',
        placement: 'after-callouts',
        caption: 'Introduces logarithms from scratch — definition, notation, converting between log and exponential form, evaluating basic logs.',
      },
    ],
    visualizations: [
      {
        id: 'LogGraphViz',
        title: 'Logarithm as Inverse — Reflection Over y = x',
        mathBridge: 'Toggle the exponential and its reflection. Watch how the domain and range swap perfectly. Drag the base slider to see growth vs decay logs.',
        caption: 'Every feature of the log graph is a mirror image of the exponential — once you see this, you never need to memorise log properties separately.',
      },
      {
        id: 'LogExpReciprocalViz',
        title: 'Exponential and Log as Inverse Partners',
        mathBridge: 'Match points on $y=e^x$ and $y=\ln x$ to see inverse reflection in action. Even before derivatives, this builds intuition that these two functions are locked together geometrically.',
        caption: 'Track mirrored points across y=x to reinforce why logs answer "what exponent?"',
      },
    ],
  },

  math: {
    prose: [
      'Transformations of $y = \\log_b x$ follow the same master template as all functions. The general form is $f(x) = a\\log_b(x - h) + k$, where $a$ is a vertical stretch/reflection, $h$ is a horizontal shift that also moves the vertical asymptote from $x=0$ to $x=h$, and $k$ is a vertical shift.',
      'The critical domain check: for $\\log_b(x - h)$ to be defined, we need $x - h > 0$, meaning $x > h$. For $\\log_b(2x + 3)$, set $2x + 3 > 0$, giving $x > -3/2$. Always find the domain before anything else. The vertical asymptote is at the boundary of the domain.',
      'The natural logarithm $\\ln x$ and common logarithm $\\log x$ have the same shape — just different scales on the $y$-axis. Since $e \\approx 2.718$, the natural log grows slightly slower than $\\log_3 x$ but faster than $\\log_{10} x$. All logarithm graphs with base $b > 1$ have the same shape: increasing, concave down, passing through $(1,0)$, with a vertical asymptote at $x = 0$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'General log transformation: $f(x) = a\\log_b(x-h)+k$',
        body: 'a: \\text{vertical stretch; reflection over x-axis if } a < 0 \\\\ h: \\text{horizontal shift; vertical asymptote moves to } x = h \\\\ k: \\text{vertical shift} \\\\ \\text{Domain: } (h, \\infty) \\text{ if } a > 0, \\text{ same if } a < 0 \\\\ \\text{Key point: } (h+1, k) \\text{ — because } \\log_b(1) = 0',
      },
      {
        type: 'warning',
        title: 'Domain is the first thing to check',
        body: '\\log_b(\\text{expression}) \\Rightarrow \\text{set expression} > 0 \\text{ and solve.} \\\\ \\ln(x^2 - 4): \\; x^2 - 4 > 0 \\Rightarrow x < -2 \\text{ or } x > 2 \\\\ \\text{Never skip this — logs of negative numbers are undefined over } \\mathbb{R}.',
      },
      {
        type: 'insight',
        title: 'Comparing log bases — faster vs slower growth',
        body: 'b_1 > b_2 > 1 \\Rightarrow \\log_{b_1} x < \\log_{b_2} x \\text{ for } x > 1 \\\\ \\text{Larger base} = \\text{slower growth} \\\\ \\log_{10} 100 = 2 < \\log_2 100 \\approx 6.64 \\\\ \\text{Binary log grows fastest; common log grows slowest.}',
      },
    ],
    videos: [
      {
        id: 'graphing-logarithms',
        title: 'Graphing Logarithms',
        youtubeId: 'GT6AYjgoFco',
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/GT6AYjgoFco" frameborder="0" allowfullscreen></iframe>',
        placement: 'after-prose',
        caption: 'Builds the log graph from a t-table, identifies key features, compares different bases.',
      },
      {
        id: 'graphing-log-transformations',
        title: 'Graphing Logarithmic Functions with Transformations',
        youtubeId: 'Y-yonLqEdzU',
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/Y-yonLqEdzU" frameborder="0" allowfullscreen></iframe>',
        placement: 'after-callouts',
        caption: 'Three worked examples applying all four transformations — shift, stretch, reflect, and finding the new domain and asymptote.',
      },
    ],
    visualizations: [
      {
        id: 'LogGraphViz',
        title: 'Log Transformations — All Four Parameters Live',
        mathBridge: 'Switch to transformation mode. Adjust $a$, $h$, $k$ and watch the asymptote move, domain shift, and graph reshape. The domain boundary tracks the asymptote exactly.',
        caption: 'The domain is always everything to the right of the vertical asymptote (or left, if $a < 0$ causes reflection issues).',
      },
      {
        id: 'LogExpReciprocalViz',
        title: 'Why Inverse Reflection Matters for Calculus Later',
        mathBridge: 'This preview connects precalc graph intuition to upcoming calculus: inverse graphs reflect across $y=x$, and that same pairing later becomes reciprocal tangent slopes.',
        caption: 'Use this now for inverse-graph intuition; revisit in derivatives for slope reciprocity.',
      },
    ],
  },

  rigor: {
    title: 'Proving $\\log_b(b^x) = x$ and $b^{\\log_b x} = x$ — the cancellation identities',
    visualizationId: 'LogGraphViz',
    proofSteps: [
      {
        expression: '\\text{Let } f(x) = b^x \\text{ and } g(x) = \\log_b x.',
        annotation: 'We want to show $f$ and $g$ are true inverses — each undoes the other.',
      },
      {
        expression: 'g(f(x)) = \\log_b(b^x)',
        annotation: 'Apply $g$ after $f$.',
      },
      {
        expression: '= x \\quad \\text{by definition: } \\log_b(b^x) = y \\text{ where } b^y = b^x, \\text{ so } y = x.',
        annotation: 'The log asks "what exponent gives $b^x$?" The answer is $x$.',
      },
      {
        expression: 'f(g(x)) = b^{\\log_b x}',
        annotation: 'Apply $f$ after $g$.',
      },
      {
        expression: '\\text{Let } y = \\log_b x, \\text{ so } b^y = x. \\text{ Then } b^{\\log_b x} = b^y = x. \\qquad \\blacksquare',
        annotation: 'Substituting the definition of log directly gives the result. Both cancellation identities follow from the definition alone.',
      },
    ],
  },

  examples: [
    {
      id: 'ch4-002-ex1',
      title: 'Converting between log and exponential form',
      problem: '\\text{Convert: (a) } \\log_5 125 = 3 \\text{ to exponential. (b) } 4^{-2} = \\frac{1}{16} \\text{ to log.}',
      steps: [
        {
          expression: '(a)\\; \\log_5 125 = 3 \\iff 5^3 = 125 \\checkmark',
          annotation: '$\\log_b x = y \\iff b^y = x$. Base stays base, exponent and log value swap positions.',
        },
        {
          expression: '(b)\\; 4^{-2} = \\frac{1}{16} \\iff \\log_4 \\frac{1}{16} = -2 \\checkmark',
          annotation: 'The exponent $-2$ becomes the log value. Verify: $4^{-2} = 1/4^2 = 1/16$ ✓',
        },
      ],
      conclusion: 'Converting between forms is mechanical once you fix the pattern: base stays base, exponent and log value trade places.',
    },
    {
      id: 'ch4-002-ex2',
      title: 'Evaluating logs without a calculator',
      problem: '\\text{Evaluate: (a) } \\log_3 81 \\quad \\text{(b) } \\log_4 \\frac{1}{64} \\quad \\text{(c) } \\ln e^7 \\quad \\text{(d) } \\log_5 1',
      steps: [
        {
          expression: '(a)\\; \\log_3 81 = \\log_3 3^4 = 4',
          annotation: 'Write 81 as a power of 3: $81 = 3^4$. Then $\\log_3 3^4 = 4$.',
        },
        {
          expression: '(b)\\; \\log_4 \\frac{1}{64} = \\log_4 4^{-3} = -3',
          annotation: '$64 = 4^3$, so $1/64 = 4^{-3}$. Log gives the exponent: $-3$.',
        },
        {
          expression: '(c)\\; \\ln e^7 = 7',
          annotation: 'Direct application of $\\ln e^x = x$. The cancellation identity.',
        },
        {
          expression: '(d)\\; \\log_5 1 = 0',
          annotation: '$5^0 = 1$ for any base. $\\log_b 1 = 0$ always.',
        },
      ],
      conclusion: 'The strategy: write the argument as a power of the base, then read off the exponent. This always works for "nice" arguments.',
    },
    {
      id: 'ch4-002-ex3',
      title: 'Graphing with transformations — full analysis',
      problem: 'f(x) = -2\\ln(x+3) + 1. \\text{ Find domain, asymptote, x-intercept, and sketch.}',
      steps: [
        {
          expression: '\\text{Domain: } x + 3 > 0 \\Rightarrow x > -3. \\quad \\text{Domain: } (-3, \\infty)',
          annotation: 'The argument of ln must be positive.',
        },
        {
          expression: '\\text{Vertical asymptote: } x = -3 \\quad (\\text{left boundary of domain})',
          annotation: 'Asymptote is at the value that makes the argument zero.',
        },
        {
          expression: 'x\\text{-intercept: } 0 = -2\\ln(x+3)+1 \\Rightarrow \\ln(x+3) = \\frac{1}{2} \\Rightarrow x+3 = e^{1/2} \\Rightarrow x = \\sqrt{e}-3 \\approx -1.35',
          annotation: 'Set $f(x) = 0$ and solve. Convert from log to exponential form.',
        },
        {
          expression: 'y\\text{-intercept: } f(0) = -2\\ln(3)+1 \\approx -2(1.099)+1 \\approx -1.20',
          annotation: 'Substitute $x = 0$.',
        },
        {
          expression: '\\text{Transformations: reflect (}a=-2<0\\text{), stretch by 2, shift left 3, up 1.}',
          annotation: 'The negative $a$ means the graph opens downward — as $x \\to \\infty$, $f(x) \\to -\\infty$.',
        },
      ],
      conclusion: 'Full analysis order: (1) domain, (2) asymptote, (3) intercepts, (4) describe transformations, (5) sketch.',
    },
  ],

  challenges: [
    {
      id: 'ch4-002-ch1',
      difficulty: 'medium',
      problem: '\\text{Find the domain of } f(x) = \\log_3(x^2 - 5x + 4).',
      hint: 'Factor the quadratic inside the log. The argument must be strictly positive.',
      walkthrough: [
        {
          expression: 'x^2 - 5x + 4 = (x-1)(x-4) > 0',
          annotation: 'Factor. Need the product to be positive.',
        },
        {
          expression: '\\text{Sign chart: positive when } x < 1 \\text{ or } x > 4.',
          annotation: 'Product of two factors is positive when both positive or both negative. Both positive: $x>4$. Both negative: $x<1$.',
        },
        {
          expression: '\\text{Domain: } (-\\infty, 1) \\cup (4, \\infty)',
          annotation: 'Two separate intervals — the log is undefined between the roots where the quadratic is negative.',
        },
      ],
      answer: '(-\\infty, 1) \\cup (4, \\infty)',
    },
    {
      id: 'ch4-002-ch2',
      difficulty: 'hard',
      problem: '\\text{Prove: } \\log_{1/b} x = -\\log_b x \\text{ for all valid } x.',
      hint: 'Use the definition. Let $\\log_{1/b} x = y$ and convert to exponential form.',
      walkthrough: [
        {
          expression: '\\log_{1/b} x = y \\iff \\left(\\frac{1}{b}\\right)^y = x \\iff b^{-y} = x',
          annotation: '$(1/b)^y = b^{-y}$ by negative exponent rule.',
        },
        {
          expression: 'b^{-y} = x \\iff \\log_b x = -y',
          annotation: 'Convert back to log form.',
        },
        {
          expression: '\\therefore \\log_{1/b} x = y = -\\log_b x \\qquad \\blacksquare',
          annotation: 'This explains why $\\log_{1/2} x = -\\log_2 x$ — a decay base gives the negative of the corresponding growth base log.',
        },
      ],
      answer: '\\log_{1/b} x = -\\log_b x',
    },
  ],

  calcBridge: {
    teaser: 'The natural log is the most important function in calculus after $e^x$ itself. Its derivative is $\\frac{d}{dx}\\ln x = \\frac{1}{x}$ — the one antiderivative the power rule cannot provide ($\\int x^{-1}\\,dx$). This is why $\\ln|x| + C$ appears so often in integration. Every rational function integration problem that ends up with a log is using this formula.',
    linkedLessons: ['logarithm-relationships', 'log-properties'],
  },
}

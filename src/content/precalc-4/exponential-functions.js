export default {
  id: 'ch4-001',
  slug: 'exponential-functions',
  chapter: 4,
  order: 1,
  title: 'Exponential Functions: When the Exponent Is the Variable',
  subtitle: 'The difference between $x^2$ and $2^x$ is everything — one grows polynomially, the other eventually overtakes any polynomial',
  tags: ['exponential functions', 'exponential growth', 'exponential decay', 'base', 'natural base e', 'compound interest', 'graphing exponentials', 'transformations'],
  aliases: 'exponential function graph base growth decay compound interest continuous e natural base transformations horizontal asymptote',

  hook: {
    question: 'A population of bacteria doubles every hour. After 24 hours starting from 1 bacterium, how many are there? The answer — 16,777,216 — is why exponential growth is called explosive. But what makes the function $f(t) = 2^t$ so fundamentally different from $f(t) = t^2$?',
    realWorldContext: 'Exponential functions model anything that grows or decays at a rate proportional to its current size: compound interest, radioactive decay, viral spread, cooling of a hot object, charging of a capacitor. In manufacturing, the learning curve — the observation that production cost drops by a fixed percentage each time cumulative output doubles — is an exponential relationship. Every one of these models uses the same family of functions.',
    previewVisualizationId: 'ExponentialGraphViz',
  },

  intuition: {
    prose: [
      'In $f(x) = b^x$, the variable $x$ is in the exponent and $b$ is a constant called the base. This is the opposite of power functions like $x^b$ where the variable is the base. The distinction matters enormously: $x^2$ grows like a parabola, but $2^x$ eventually overtakes any polynomial, no matter how high the degree.',
      'The base $b$ determines everything about the shape. When $b > 1$, the function grows — each unit increase in $x$ multiplies the output by $b$. This is multiplicative growth, which is why it accelerates so dramatically. When $0 < b < 1$, the function decays — each unit increase in $x$ multiplies the output by a fraction less than 1.',
      'Every exponential function $f(x) = b^x$ passes through $(0, 1)$ because $b^0 = 1$ for any valid base. The $x$-axis is a horizontal asymptote: the function approaches but never touches it. For growth functions, as $x \\to -\\infty$; for decay functions, as $x \\to +\\infty$.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Exponential function',
        body: 'f(x) = b^x \\quad \\text{where } b > 0, \\; b \\neq 1, \\; b \\in \\mathbb{R} \\\\ \\text{Domain: } (-\\infty, \\infty) \\qquad \\text{Range: } (0, \\infty) \\\\ \\text{Always passes through } (0,1). \\text{ Horizontal asymptote: } y = 0.',
      },
      {
        type: 'insight',
        title: 'Growth vs decay — the base tells you which',
        body: 'b > 1: \\text{ exponential GROWTH — function increases} \\\\ 0 < b < 1: \\text{ exponential DECAY — function decreases} \\\\ \\text{Note: } f(x) = \\left(\\tfrac{1}{2}\\right)^x = 2^{-x} \\text{ — decay is just growth reflected.}',
      },
      {
        type: 'warning',
        title: 'What makes a valid base',
        body: 'b > 0 \\text{ — negative bases give complex numbers for fractional exponents} \\\\ b \\neq 1 \\text{ — base 1 gives the constant function } f(x)=1 \\text{, not exponential} \\\\ b \\neq 0 \\text{ — base 0 gives } 0^x = 0 \\text{ for all } x > 0 \\text{, undefined at 0}',
      },
    ],
    videos: [
      {
        id: 'graphing-exponential-functions',
        title: 'Graphing Exponential Functions w/ t-table or Transformations',
        youtubeId: 'C5jnasB2x5Y',
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/C5jnasB2x5Y" frameborder="0" allowfullscreen></iframe>',
        placement: 'after-callouts',
        caption: 'Builds the graph from a t-table and shows how transformations shift, stretch, and reflect the base curve.',
      },
    ],
    visualizations: [
      {
        id: 'ExponentialGraphViz',
        title: 'Exponential Functions — Live Base and Transformation Control',
        mathBridge: 'Adjust the base $b$ and the transformation parameters $a$, $h$, $k$ in $f(x) = a \\cdot b^{x-h} + k$. Watch how each parameter changes the graph. Toggle growth vs decay.',
        caption: 'Every transformation has a geometric meaning. The horizontal asymptote shifts with $k$; the base controls steepness.',
      },
    ],
  },

  math: {
    prose: [
      'Transformations of exponential functions follow the same master formula as all functions: $f(x) = a \\cdot b^{x-h} + k$. Here $a$ is a vertical stretch/reflection, $h$ is a horizontal shift, and $k$ is a vertical shift that also moves the horizontal asymptote from $y=0$ to $y=k$. When $a < 0$, the function reflects over the $x$-axis and the range becomes $(-\\infty, k)$.',
      'The natural base $e \\approx 2.71828$ is the most important base in calculus. It is defined as $e = \\lim_{n \\to \\infty}\\left(1 + \\frac{1}{n}\\right)^n$, which emerges naturally from compound interest. The function $f(x) = e^x$ is its own derivative — the only function with this property — which is why it dominates in calculus, differential equations, and physics.',
      'Compound interest is the direct application of exponential functions to finance. If principal $P$ grows at annual rate $r$, compounded $n$ times per year for $t$ years: $A = P\\left(1 + \\frac{r}{n}\\right)^{nt}$. As $n \\to \\infty$ (continuous compounding), this becomes $A = Pe^{rt}$. The difference between monthly and continuous compounding is small but real.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'General exponential transformation',
        body: 'f(x) = a \\cdot b^{x-h} + k \\\\ a: \\text{ vertical stretch } (|a|>1) \\text{ or compression } (|a|<1); \\text{ reflection if } a<0 \\\\ h: \\text{ horizontal shift (right if } h>0\\text{)} \\\\ k: \\text{ vertical shift; horizontal asymptote becomes } y=k',
      },
      {
        type: 'definition',
        title: 'The natural base $e$',
        body: 'e = \\lim_{n\\to\\infty}\\left(1+\\frac{1}{n}\\right)^n \\approx 2.71828\\ldots \\\\ f(x) = e^x: \\text{ derivative is itself — } \\frac{d}{dx}e^x = e^x \\\\ \\text{Used in: continuous growth, calculus, probability, physics}',
      },
      {
        type: 'theorem',
        title: 'Compound interest formulas',
        body: 'A = P\\left(1+\\frac{r}{n}\\right)^{nt} \\quad \\text{(compounded } n \\text{ times/year)} \\\\ A = Pe^{rt} \\quad \\text{(continuous compounding)} \\\\ P = \\text{principal},\\; r = \\text{annual rate},\\; t = \\text{years}',
      },
      {
        type: 'insight',
        title: 'Doubling time and half-life',
        body: 'A(t) = A_0 \\cdot 2^{t/T_d} \\quad (T_d = \\text{doubling time}) \\\\ A(t) = A_0 \\cdot \\left(\\tfrac{1}{2}\\right)^{t/T_h} \\quad (T_h = \\text{half-life}) \\\\ \\text{Rule of 72: doubling time} \\approx 72/r\\% \\text{ (e.g. 6\\% → doubles in ~12 years)}',
      },
    ],
    videos: [
      {
        id: 'compound-interest',
        title: 'Solving Compound Interest Problems',
        youtubeId: '4EpI7UbQvUI',
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/4EpI7UbQvUI" frameborder="0" allowfullscreen></iframe>',
        placement: 'after-callouts',
        caption: 'Worked examples covering periodic and continuous compounding — includes finding time to reach a target amount.',
      },
    ],
    visualizations: [
      {
        id: 'GrowthDecayViz',
        title: 'Compound Interest & Exponential Growth/Decay',
        mathBridge: 'Set principal, rate, and compounding. See how the curve changes between discrete and continuous compounding. Drag the time slider to read off the accumulated amount.',
        caption: 'The gap between monthly and continuous compounding is visible but small. The real power is the exponential shape itself.',
      },
    ],
  },

  rigor: {
    title: "Why $e = \\lim_{n\\to\\infty}\\left(1+\\frac{1}{n}\\right)^n$ emerges from continuous compounding",
    visualizationId: 'GrowthDecayViz',
    proofSteps: [
      {
        expression: '\\text{Start: } \\$1 \\text{ at annual rate } 100\\%, \\text{ compounded } n \\text{ times per year for 1 year.}',
        annotation: 'We use 100% rate and $1 principal to keep the algebra clean. The result generalises to any rate and principal.',
      },
      {
        expression: 'A(n) = 1 \\cdot \\left(1 + \\frac{1}{n}\\right)^n',
        annotation: 'Compound interest formula with $P=1$, $r=1$, $t=1$.',
      },
      {
        expression: 'n=1: \\$2.00 \\quad n=12: \\$2.613 \\quad n=365: \\$2.7146 \\quad n=8760: \\$2.7181',
        annotation: 'As $n$ increases (more frequent compounding), the amount grows — but slower and slower. It is approaching a limit.',
      },
      {
        expression: '\\lim_{n\\to\\infty}\\left(1+\\frac{1}{n}\\right)^n = e \\approx 2.71828\\ldots',
        annotation: 'The limit exists and is irrational. This is the definition of $e$ — it is the amount $\\$1$ grows to at 100% continuous compounding for 1 year.',
      },
      {
        expression: 'A = Pe^{rt} \\qquad \\blacksquare',
        annotation: 'For general $P$, $r$, and $t$: substitute $n = m/r$ and let $m \\to \\infty$. The same limit gives $e^{rt}$ in the exponent.',
      },
    ],
  },

  examples: [
    {
      id: 'ch4-001-ex1',
      title: 'Reading a graph and identifying transformations',
      problem: 'f(x) = -2 \\cdot 3^{x+1} + 4. \\text{ Identify all transformations, domain, range, and asymptote.}',
      steps: [
        {
          expression: '\\text{Base function: } g(x) = 3^x \\text{ (growth, base 3)}',
          annotation: 'Always start by identifying the parent function.',
        },
        {
          expression: 'h = -1: \\text{ shift left 1} \\quad k = 4: \\text{ shift up 4} \\quad a = -2: \\text{ reflect over x-axis, stretch by 2}',
          annotation: 'Read off each parameter from $f(x) = a \\cdot b^{x-h} + k$. Note: $x+1 = x-(-1)$ so $h = -1$.',
        },
        {
          expression: '\\text{Asymptote: } y = k = 4 \\qquad \\text{Domain: } (-\\infty, \\infty)',
          annotation: 'The vertical shift moves the asymptote.',
        },
        {
          expression: '\\text{Range: } (-\\infty, 4) \\quad \\text{because } a = -2 < 0 \\text{ (reflected, so approaches 4 from below)}',
          annotation: 'Negative $a$ flips the range. Without the reflection, range would be $(4, \\infty)$.',
        },
      ],
      conclusion: 'The key point $(0,1)$ of $3^x$ maps to: shift $x$ by $-1$ gives $(-1,1)$; stretch/reflect gives $(-1,-2)$; shift up 4 gives $(-1, 2)$.',
    },
    {
      id: 'ch4-001-ex2',
      title: 'Compound interest — finding the amount',
      problem: '\\$5000 \\text{ is invested at 4.5\\% annual interest. Find the amount after 10 years (a) compounded monthly, (b) compounded continuously.}',
      steps: [
        {
          expression: '(a)\\; A = 5000\\left(1+\\frac{0.045}{12}\\right)^{12 \\times 10} = 5000(1.00375)^{120} \\approx \\$7841.10',
          annotation: '$n=12$ (monthly), $r=0.045$, $t=10$.',
        },
        {
          expression: '(b)\\; A = 5000e^{0.045 \\times 10} = 5000e^{0.45} \\approx 5000(1.5683) \\approx \\$7841.56',
          annotation: 'Continuous compounding. Notice: only $\\$0.46$ more than monthly — the difference is tiny at moderate rates.',
        },
      ],
      conclusion: 'Continuous compounding always gives the maximum possible amount for a given rate. The gap shrinks as rates decrease.',
    },
    {
      id: 'ch4-001-ex3',
      title: 'Doubling time',
      problem: '\\text{An investment grows continuously at 6\\%. How long to double?}',
      steps: [
        {
          expression: '2P = Pe^{0.06t} \\Rightarrow 2 = e^{0.06t}',
          annotation: 'Set $A = 2P$ (doubled). Divide both sides by $P$.',
        },
        {
          expression: '\\ln 2 = 0.06t \\Rightarrow t = \\frac{\\ln 2}{0.06} \\approx \\frac{0.6931}{0.06} \\approx 11.55 \\text{ years}',
          annotation: 'Take the natural log of both sides. Rule of 72 approximation: $72/6 = 12$ years — close!',
        },
      ],
      conclusion: 'Doubling time for continuous growth at rate $r$ is always $t = \\ln 2 / r$. The Rule of 72 ($\\approx 72/r\\%$) is a quick mental estimate.',
    },
  ],

  challenges: [
    {
      id: 'ch4-001-ch1',
      difficulty: 'medium',
      problem: '\\text{An account compounds quarterly at 5\\%. How long until \\$3000 grows to \\$5000?}',
      hint: 'Set up the compound interest formula, divide both sides by $P$, then take the logarithm of both sides.',
      walkthrough: [
        {
          expression: '5000 = 3000\\left(1 + \\frac{0.05}{4}\\right)^{4t} \\Rightarrow \\frac{5}{3} = (1.0125)^{4t}',
          annotation: 'Set up and simplify.',
        },
        {
          expression: '\\ln\\frac{5}{3} = 4t \\ln(1.0125) \\Rightarrow t = \\frac{\\ln(5/3)}{4\\ln(1.0125)} \\approx \\frac{0.5108}{4(0.01242)} \\approx 10.28 \\text{ years}',
          annotation: 'Take ln of both sides, use log power rule, solve for $t$.',
        },
      ],
      answer: 't \\approx 10.28 \\text{ years}',
    },
    {
      id: 'ch4-001-ch2',
      difficulty: 'hard',
      problem: '\\text{Show that if a quantity grows continuously at rate } r\\text{, it increases by } (e^r - 1) \\times 100\\% \\text{ per year. What is the effective annual rate for 5\\% continuous compounding?}',
      hint: 'Compare $A = Pe^{r \\cdot 1}$ to $A = P(1 + r_{\\text{eff}})$ for $t = 1$ year.',
      walkthrough: [
        {
          expression: 'Pe^r = P(1 + r_{\\text{eff}}) \\Rightarrow r_{\\text{eff}} = e^r - 1',
          annotation: 'Equate one year of continuous and annual growth. Solve for the effective rate.',
        },
        {
          expression: 'r = 0.05: \\; r_{\\text{eff}} = e^{0.05} - 1 \\approx 1.05127 - 1 = 0.05127 = 5.127\\%',
          annotation: 'The effective annual rate is 5.127% — slightly higher than the stated 5% continuous rate.',
        },
      ],
      answer: 'r_{\\text{eff}} = e^r - 1 \\approx 5.127\\% \\text{ for } r=5\\%',
    },
  ],

  calcBridge: {
    teaser: 'The function $f(x) = e^x$ is its own derivative: $\\frac{d}{dx}e^x = e^x$. This makes it the central function of differential equations — any equation of the form $y\' = ky$ has solution $y = Ce^{kx}$. The compound interest formula $A = Pe^{rt}$ is the solution to the differential equation $\\frac{dA}{dt} = rA$ (growth proportional to amount). Every continuous growth/decay problem in calculus is this equation.',
    linkedLessons: ['logarithms-intro', 'solving-exponential-log'],
  },
}

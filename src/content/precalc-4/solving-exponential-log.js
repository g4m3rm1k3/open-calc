export default {
  id: 'ch4-005',
  slug: 'solving-exponential-log',
  chapter: 4,
  order: 5,
  title: 'Solving Exponential and Logarithmic Equations',
  subtitle: 'Two moves unlock every equation in this family: take a log of both sides, or exponentiate both sides',
  tags: ['solving exponential equations', 'solving logarithmic equations', 'natural log', 'common log', 'extraneous solutions', 'one-to-one property', 'different bases'],
  aliases: 'solve exponential equation logarithmic equation log both sides exponentiate one-to-one property extraneous solutions different bases',

  hook: {
    question: 'To solve $2^x = 5$, you cannot just take a square root or factor. You need to "undo" the exponential — and that is exactly what logarithms are for. Once you know the move, every exponential equation becomes a linear or quadratic equation in disguise.',
    realWorldContext: 'Solving exponential equations is how scientists compute radioactive half-lives, how pharmacists calculate drug elimination times, and how financial analysts find the time for an investment to reach a target. Solving logarithmic equations appears in chemistry (pH calculations), acoustics (decibel levels), and seismology (Richter magnitudes). The same two algebraic moves — take a log, or exponentiate — unlock all of these.',
    previewVisualizationId: 'ExpLogSolverViz',
  },

  intuition: {
    prose: [
      'There are two master moves. To solve an exponential equation: take the logarithm of both sides. To solve a logarithmic equation: exponentiate both sides (raise the base to each side as an exponent). These two moves are inverses of each other — each undoes what the other does.',
      'The one-to-one property makes both moves valid: if $b^x = b^y$ then $x = y$ (exponentials are one-to-one), and if $\\log_b x = \\log_b y$ then $x = y$ (logs are one-to-one). This means equal outputs imply equal inputs — the foundation for all equation solving here.',
      'Logarithmic equations require a domain check — extraneous solutions are common. After solving, substitute every answer back into the original equation. Any answer that makes a log argument non-positive is extraneous and must be discarded. Exponential equations have no extraneous solutions because $b^x > 0$ always.',
    ],
    callouts: [
      {
        type: 'proof-map',
        title: 'Master strategy — two types, two moves',
        body: '\\text{Exponential equation (variable in exponent):} \\\\ \\quad \\Rightarrow \\text{take } \\ln \\text{ (or } \\log\\text{) of both sides, use power rule} \\\\ \\quad \\Rightarrow \\text{if same base: set exponents equal (one-to-one)} \\\\ \\text{Logarithmic equation (variable inside log):} \\\\ \\quad \\Rightarrow \\text{condense to one log, then exponentiate both sides} \\\\ \\quad \\Rightarrow \\textbf{always check for extraneous solutions}',
      },
      {
        type: 'theorem',
        title: 'One-to-one properties',
        body: 'b^x = b^y \\iff x = y \\quad \\text{(exponential one-to-one)} \\\\ \\log_b x = \\log_b y \\iff x = y \\quad \\text{(log one-to-one)} \\\\ \\text{These let you "cancel" matching bases or matching logs.}',
      },
      {
        type: 'warning',
        title: 'Extraneous solutions in log equations',
        body: '\\text{Solve, then CHECK every answer.} \\\\ \\text{Example: if you get } x = -5 \\text{, and the equation has } \\ln(x+3), \\\\ \\text{then } \\ln(-5+3) = \\ln(-2) \\text{ is undefined.} \\\\ x = -5 \\text{ is extraneous — discard it.}',
      },
    ],
    videos: [
      {
        id: 'solving-log-equations-1',
        title: 'Solving Equations with Logarithms Pt 1',
        youtubeId: 'fO06womr41k',
        embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
        placement: 'after-callouts',
        caption: 'Fundamental examples — converting between log and exponential form to solve, one-to-one property applications.',
      },
    ],
    visualizations: [
      {
        id: 'ExpLogSolverViz',
        title: 'Graphical Solution — Where the Curves Intersect',
        mathBridge: 'Enter an exponential or log equation. See both sides plotted as functions — the solution is where they cross. Confirms the algebraic answer geometrically.',
        caption: 'Every equation is secretly "find where two functions are equal." Seeing the intersection makes the solution concrete.',
      },
    ],
  },

  math: {
    prose: [
      'When both sides have the same base, set exponents equal directly: $3^{2x+1} = 3^{x-4} \\Rightarrow 2x+1 = x-4$. When bases differ, take $\\ln$ of both sides and use the power rule: $5^x = 12 \\Rightarrow x\\ln 5 = \\ln 12 \\Rightarrow x = \\ln 12 / \\ln 5$. This is exact — do not approximate until the final step.',
      'Some exponential equations are quadratic in disguise. $e^{2x} - 5e^x + 6 = 0$ is a quadratic in $e^x$: let $u = e^x$, factor $u^2 - 5u + 6 = (u-2)(u-3) = 0$, giving $e^x = 2$ or $e^x = 3$, so $x = \\ln 2$ or $x = \\ln 3$. Recognising this substitution is a key skill.',
      'Equations with different log bases: use the change of base formula to convert everything to $\\ln$ or $\\log$, then solve algebraically. Alternatively, use the one-to-one property after getting logs with the same base on both sides.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Solving exponential equations — the full toolkit',
        body: '\\text{Same base: } b^{f(x)} = b^{g(x)} \\Rightarrow f(x) = g(x) \\\\ \\text{Different bases: take ln both sides} \\Rightarrow x = \\frac{\\ln(\\text{RHS})}{\\ln(\\text{base})} \\\\ \\text{Quadratic type: substitute } u = b^x, \\text{ factor, solve for } u, \\text{ then } x = \\log_b u',
      },
      {
        type: 'definition',
        title: 'Solving logarithmic equations — the full toolkit',
        body: '\\text{One log: } \\log_b f(x) = c \\Rightarrow f(x) = b^c \\\\ \\text{Multiple logs: condense to one log first, then exponentiate} \\\\ \\text{Equal logs: } \\log_b f(x) = \\log_b g(x) \\Rightarrow f(x) = g(x) \\\\ \\textbf{Always: check domain of original equation}',
      },
    ],
    videos: [
      {
        id: 'solving-log-equations-2',
        title: 'Solving Equations with Logarithms Pt 2',
        youtubeId: 'NRjfc_u-vyQ',
        embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
        placement: 'after-prose',
        caption: 'Intermediate examples including equations requiring condensing multiple logs before solving.',
      },
      {
        id: 'solving-log-equations-3',
        title: 'Solving Equations with Logarithms Pt 3',
        youtubeId: 'UZS2__IgFuw',
        embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
        placement: 'after-callouts',
        caption: 'Advanced examples — quadratic-type exponential equations and equations with extraneous solutions.',
      },
      {
        id: 'log-different-bases',
        title: 'Logarithm Equations with Different Bases',
        youtubeId: 'KNS75J5XpnE',
        embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
        placement: 'after-callouts',
        caption: 'Equations where different bases appear — using change of base to convert and solve.',
      },
      {
        id: 'natural-exponential',
        title: 'Solving Natural Exponential Functions with Natural Logarithms',
        youtubeId: 'Hm2DV0iruJk',
        embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
        placement: 'after-callouts',
        caption: 'Three examples with $e$ as the base — the most common case in calculus.',
      },
    ],
  },

  rigor: {
    title: 'Solving a quadratic exponential: $e^{2x} - 7e^x + 10 = 0$',
    visualizationId: 'ExpLogSolverViz',
    proofSteps: [
      {
        expression: '\\text{Recognise: } e^{2x} = (e^x)^2. \\text{ Let } u = e^x.',
        annotation: 'Substitution reveals the hidden quadratic structure. $u > 0$ always (exponential is always positive).',
      },
      {
        expression: 'u^2 - 7u + 10 = 0 \\Rightarrow (u-2)(u-5) = 0',
        annotation: 'Factor the quadratic in $u$.',
      },
      {
        expression: 'u = 2 \\Rightarrow e^x = 2 \\Rightarrow x = \\ln 2 \\approx 0.693',
        annotation: 'First solution: take $\\ln$ of both sides.',
      },
      {
        expression: 'u = 5 \\Rightarrow e^x = 5 \\Rightarrow x = \\ln 5 \\approx 1.609',
        annotation: 'Second solution.',
      },
      {
        expression: '\\text{No domain check needed — } e^x > 0 \\text{ always, so no extraneous solutions.} \\qquad \\blacksquare',
        annotation: 'Both solutions are valid. Answer: $x = \\ln 2$ or $x = \\ln 5$.',
      },
    ],
  },

  examples: [
    {
      id: 'ch4-004-ex1',
      title: 'Different bases — take ln of both sides',
      problem: '\\text{Solve: } 5^{x+2} = 3^{2x-1}',
      steps: [
        {
          expression: '\\ln(5^{x+2}) = \\ln(3^{2x-1})',
          annotation: 'Take ln of both sides. Valid because ln is one-to-one.',
        },
        {
          expression: '(x+2)\\ln 5 = (2x-1)\\ln 3',
          annotation: 'Power rule: bring exponents down.',
        },
        {
          expression: 'x\\ln 5 + 2\\ln 5 = 2x\\ln 3 - \\ln 3',
          annotation: 'Expand both sides.',
        },
        {
          expression: 'x(\\ln 5 - 2\\ln 3) = -\\ln 3 - 2\\ln 5',
          annotation: 'Collect $x$ terms on one side.',
        },
        {
          expression: 'x = \\frac{-\\ln 3 - 2\\ln 5}{\\ln 5 - 2\\ln 3} = \\frac{\\ln 3 + 2\\ln 5}{2\\ln 3 - \\ln 5} \\approx \\frac{4.288}{1.415} \\approx 3.03',
          annotation: 'Solve. Leave exact, approximate at the end.',
        },
      ],
      conclusion: 'When bases differ, take ln immediately. The power rule converts the equation to linear — collect $x$ terms, factor, divide.',
    },
    {
      id: 'ch4-004-ex2',
      title: 'Log equation — extraneous solution',
      problem: '\\text{Solve: } \\log_2(x+3) + \\log_2(x-3) = 4',
      steps: [
        {
          expression: '\\log_2[(x+3)(x-3)] = 4',
          annotation: 'Condense using the product rule.',
        },
        {
          expression: '\\log_2(x^2-9) = 4 \\Rightarrow x^2 - 9 = 2^4 = 16',
          annotation: 'Exponentiate both sides: $2^{\\log_2(...)} = ...$',
        },
        {
          expression: 'x^2 = 25 \\Rightarrow x = \\pm 5',
          annotation: 'Solve the resulting equation.',
        },
        {
          expression: '\\text{Check } x=5: \\log_2(8)+\\log_2(2)=3+1=4 \\checkmark',
          annotation: 'Valid.',
        },
        {
          expression: '\\text{Check } x=-5: \\log_2(-2) \\text{ is undefined.} \\times \\Rightarrow \\text{extraneous}',
          annotation: 'Discard $x=-5$. Only $x=5$ is valid.',
        },
      ],
      conclusion: 'Quadratic log equations often produce two candidates but one is extraneous. Always check both.',
    },
    {
      id: 'ch4-004-ex3',
      title: 'Natural exponential equation',
      problem: '\\text{Solve: } 3e^{2x} - 4 = 11',
      steps: [
        {
          expression: '3e^{2x} = 15 \\Rightarrow e^{2x} = 5',
          annotation: 'Isolate the exponential first.',
        },
        {
          expression: '\\ln(e^{2x}) = \\ln 5 \\Rightarrow 2x = \\ln 5',
          annotation: 'Take ln of both sides. $\\ln(e^{2x}) = 2x$ by cancellation identity.',
        },
        {
          expression: 'x = \\frac{\\ln 5}{2} \\approx \\frac{1.609}{2} \\approx 0.805',
          annotation: 'Exact answer first, decimal approximation second.',
        },
      ],
      conclusion: 'Always isolate the exponential before taking the log. Never take ln before the base is alone on one side.',
    },
  ],

  challenges: [
    {
      id: 'ch4-004-ch1',
      difficulty: 'medium',
      problem: '\\text{Solve: } \\log_3(x-1) - \\log_3(x+1) = 2',
      hint: 'Use the quotient rule to condense, then exponentiate base 3.',
      walkthrough: [
        {
          expression: '\\log_3\\frac{x-1}{x+1} = 2 \\Rightarrow \\frac{x-1}{x+1} = 3^2 = 9',
          annotation: 'Condense and exponentiate.',
        },
        {
          expression: 'x - 1 = 9(x+1) = 9x + 9 \\Rightarrow -8x = 10 \\Rightarrow x = -\\frac{5}{4}',
          annotation: 'Solve the resulting equation.',
        },
        {
          expression: '\\text{Check: } x-1 = -\\tfrac{9}{4} < 0. \\text{ Logarithm undefined.} \\Rightarrow \\text{no solution}',
          annotation: 'Extraneous! The original equation has NO solution.',
        },
      ],
      answer: '\\text{No solution (extraneous result)}',
    },
    {
      id: 'ch4-004-ch2',
      difficulty: 'hard',
      problem: '\\text{Solve } 2^x + 2^{-x} = 5. \\text{ Hint: it is quadratic in } 2^x.',
      hint: 'Multiply through by $2^x$ to clear the negative exponent.',
      walkthrough: [
        {
          expression: '\\text{Let } u = 2^x. \\text{ Then } 2^{-x} = 1/u. \\text{ Equation: } u + 1/u = 5.',
          annotation: 'Substitution.',
        },
        {
          expression: 'u^2 + 1 = 5u \\Rightarrow u^2 - 5u + 1 = 0 \\Rightarrow u = \\frac{5 \\pm \\sqrt{21}}{2}',
          annotation: 'Multiply by $u$, apply quadratic formula.',
        },
        {
          expression: 'u > 0 \\text{ both roots}: u = \\frac{5+\\sqrt{21}}{2} \\approx 4.79 \\text{ or } u = \\frac{5-\\sqrt{21}}{2} \\approx 0.21',
          annotation: 'Both are positive, so both give valid solutions.',
        },
        {
          expression: 'x = \\log_2\\frac{5+\\sqrt{21}}{2} \\approx 2.26 \\quad \\text{or} \\quad x = \\log_2\\frac{5-\\sqrt{21}}{2} \\approx -2.26',
          annotation: 'Note symmetry: the two solutions are negatives of each other (because $2^x + 2^{-x}$ is even).',
        },
      ],
      answer: 'x = \\pm\\log_2\\!\\left(\\dfrac{5+\\sqrt{21}}{2}\\right) \\approx \\pm 2.26',
    },
  ],

  calcBridge: {
    teaser: 'Solving $e^{kt} = N$ is the fundamental step in every separable differential equation with exponential solutions. The technique appears in: Newton\'s Law of Cooling ($T = T_e + Ce^{kt}$), population dynamics ($P = P_0 e^{rt}$), and RC circuits ($V = V_0 e^{-t/RC}$). In each case, isolating the exponential and taking $\\ln$ of both sides gives the time variable directly.',
    linkedLessons: ['exponential-functions', 'exponential-applications', 'log-properties'],
  },
}

export default {
  id: 'ch3-005',
  slug: 'trig-applications',
  chapter: 'precalc-3',
  order: 4,
  title: 'Trig in the Real World: Periodic Models & Solving Equations',
  subtitle: 'Sinusoidal models, solving trig equations completely, and why periodicity matters in calculus',
  tags: ['trig applications', 'sinusoidal model', 'periodic', 'solving trig equations', 'amplitude', 'phase shift', 'period'],
  aliases: 'sinusoidal model amplitude period phase shift solve trig equation general solution periodic function application',

  hook: {
    question: 'A sound wave, a tidal pattern, an electrical signal, the position of a piston — all are modelled by $A\\sin(Bt + C) + D$. What do those four constants actually control, and how do you read them from a graph or a real-world description?',
    realWorldContext: 'AC electrical circuits run at 60 Hz — the current is $I(t) = I_0 \\sin(120\\pi t)$. Manufacturing processes that involve rotating machinery produce sinusoidal vibrations — predictable and modelable. In calculus, knowing the period, amplitude, and phase shift of a function lets you immediately write down its integral and derivative without computation, just by reading the transformed formula.',
    previewVisualizationId: 'SinusoidalModelViz',
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: ['The general sinusoidal function $f(t) = A\\sin(Bt - C) + D$ has four parameters, each with a clear geometric meaning. $A$ is the amplitude — the maximum deviation from the midline, always positive. $B$ controls the period: period $= 2\\pi/|B|$. $C/B$ is the phase shift — how far the graph slides horizontally. $D$ is the vertical shift — the midline of the oscillation.'] },
      { type: 'callout', callout: { type: 'definition', title: 'The four parameters of $A\\sin(Bt - C) + D$', body: 'A: \\text{amplitude (half the peak-to-trough distance, always} > 0\\text{)} \\\\ \\frac{2\\pi}{|B|}: \\text{period (length of one complete cycle)} \\\\ \\frac{C}{B}: \\text{phase shift (positive = right, negative = left)} \\\\ D: \\text{vertical shift (midline of oscillation)}' } },
      { type: 'callout', callout: { type: 'warning', title: 'Phase shift sign convention', body: 'A\\sin(B(t - h)) + D \\Rightarrow \\text{shift RIGHT by } h \\\\ A\\sin(Bt - C) + D \\Rightarrow \\text{shift right by } C/B \\\\ \\text{Factor B out of the argument before reading the phase shift.}' } },
      { type: 'viz', id: 'SinusoidalModelViz', title: 'Sinusoidal Model — Live Parameter Control',
        mathBridge: 'Adjust A, B, C, D with sliders. See how each one changes the graph and the equation simultaneously.',
        caption: 'Every periodic real-world phenomenon fits this template. Reading the parameters is the first step in modelling.',
      },
      { type: 'prose', paragraphs: ['Angles in standard position and the relationship between degrees and radians are fundamental. Linear speed $v = r\\omega$ where $\\omega$ is angular speed in rad/s — this connects circular motion to the sinusoidal model.'] },
      { type: 'viz', id: 'VideoCarousel', title: 'Standard Position & Angle Measures',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/ABDKOmamIwo', title: 'Standard Position Angles & Radians Pt 1' },
          { url: 'https://www.youtube.com/embed/d0mmCN6rOXM', title: 'Standard Position Angles Pt 2' },
          { url: 'https://www.youtube.com/embed/CMWK3ErKAhc', title: 'Angle Measures in Degrees, Minutes & Seconds' },
        ]},
      },
      { type: 'viz', id: 'VideoCarousel', title: 'Linear & Angular Speed',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/76Zh40KPQoY', title: 'Linear & Angular Speed Pt 1' },
          { url: 'https://www.youtube.com/embed/iMgckNT8K6s', title: 'Linear & Angular Speed Pt 2' },
        ]},
      },
      { type: 'prose', paragraphs: ['Reading these from a graph: the amplitude is half the distance from maximum to minimum. The period is the horizontal distance for one complete cycle. The midline is $D = (\\max + \\min)/2$. The phase shift is where the first peak or zero crossing occurs.'] },
      { type: 'viz', id: 'VideoCarousel', title: 'Graphing Sine & Cosine',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/qQOKUIrcuRs', title: 'Understanding Basic Sine & Cosine Graphs' },
          { url: 'https://www.youtube.com/embed/yR7y8hyOpDU', title: 'Graphing Sine & Cosine Without a Calculator Pt 1' },
          { url: 'https://www.youtube.com/embed/c1VD_LEs5ZY', title: 'Graphing Sine & Cosine Without a Calculator Pt 2' },
        ]},
      },
      { type: 'viz', id: 'VideoEmbed', title: 'Finding the Equation of Sine/Cosine from a Graph', props: { url: 'https://www.youtube.com/embed/tZ-25bp24pE' } },
      { type: 'viz', id: 'VideoEmbed', title: 'Water Depth Word Problem — Sinusoidal Model', props: { url: 'https://www.youtube.com/embed/Do0eJ-pRVT8' } },
      { type: 'prose', paragraphs: ['Tangent and cotangent have period π and vertical asymptotes; secant and cosecant are reciprocals of cosine and sine with period 2π. Graph transformations apply the same A, B, C, D parameters.'] },
      { type: 'viz', id: 'VideoCarousel', title: 'Graphing Tan, Cot, Sec & Csc with Transformations',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/kMPtrgBO7ME', title: 'Intro to Tangent & Cotangent Graphs' },
          { url: 'https://www.youtube.com/embed/qKa8HL_oHf0', title: 'Tangent & Cotangent Graphs with Transformations' },
          { url: 'https://www.youtube.com/embed/EAyDXQnkPmY', title: 'Graphing Secant & Cosecant' },
        ]},
      },
      { type: 'prose', paragraphs: ['Solving trig equations requires finding all angles, not just one. $\\sin\\theta = 1/2$ has two solutions in $[0, 2\\pi)$: $\\pi/6$ and $5\\pi/6$. The general solution adds all multiples of the period: $\\pi/6 + 2k\\pi$ and $5\\pi/6 + 2k\\pi$ for any integer $k$. Forgetting the general solution is the most common error.'] },
      { type: 'callout', callout: { type: 'proof-map', title: 'Strategy for solving $\\sin(\\theta) = k$', body: '1.\\; \\text{Find the reference angle: } \\alpha = \\arcsin|k| \\\\ 2.\\; \\text{Identify quadrants where sin has the sign of } k \\\\ 3.\\; \\text{Write the two solutions in } [0, 2\\pi) \\\\ 4.\\; \\text{Add } + 2k\\pi \\text{ to each for the general solution}' } },
    ],
  },

  math: {
    blocks: [
      { type: 'prose', paragraphs: ['For equations of the form $\\sin(f(x)) = k$, first solve $f(x) = \\arcsin k$ (and $f(x) = \\pi - \\arcsin k$ if sin), then solve the resulting equation for $x$. The period of $\\sin(Bx)$ is $2\\pi/|B|$, so the general solution repeats with that period.'] },
      { type: 'callout', callout: { type: 'theorem', title: 'General solutions for trig equations', body: '\\sin\\theta = k \\Rightarrow \\theta = \\arcsin k + 2k\\pi \\text{ or } \\theta = \\pi - \\arcsin k + 2k\\pi \\\\ \\cos\\theta = k \\Rightarrow \\theta = \\pm\\arccos k + 2k\\pi \\\\ \\tan\\theta = k \\Rightarrow \\theta = \\arctan k + k\\pi \\quad (\\text{period is } \\pi)' } },
      { type: 'viz', id: 'VideoCarousel', title: 'Solving Trigonometric Equations',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/9206OVkXH50', title: 'Solving Trig Equations (5 Examples)' },
          { url: 'https://www.youtube.com/embed/iZihVtFaAko', title: 'Single Angle Equations 0 to 2π' },
          { url: 'https://www.youtube.com/embed/FcrXDkwPspU', title: 'Single Angle Equations All Solutions' },
          { url: 'https://www.youtube.com/embed/wvwCwUxxIkE', title: 'Multiple Angle Equations 0 to 2π' },
          { url: 'https://www.youtube.com/embed/u8kif93O1lY', title: 'Multiple Angle Equations All Solutions' },
        ]},
      },
      { type: 'prose', paragraphs: ['Trig identities appear in solving equations: if you see $\\sin^2 x = 3/4$, the Pythagorean identity is irrelevant — just take square roots: $\\sin x = \\pm\\sqrt{3}/2$, giving four solutions in $[0, 2\\pi)$. If you see $2\\sin x\\cos x = 1$, recognise the double angle: $\\sin 2x = 1$, giving $2x = \\pi/2 + 2k\\pi$, so $x = \\pi/4 + k\\pi$.'] },
      { type: 'prose', paragraphs: ['The **Law of Sines and Cosines** are required for solving oblique (non-right) triangles. The ambiguous case (SSA) may yield 0, 1, or 2 valid triangles — always check.'] },
      { type: 'viz', id: 'VideoCarousel', title: 'Law of Sines — Applications',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/FtYbQ8X7U_w', title: 'Oblique Triangles — Law of Sines' },
          { url: 'https://www.youtube.com/embed/57nlvT_o8uw', title: 'Ambiguous Case for Law of Sines' },
        ]},
      },
      { type: 'viz', id: 'VideoCarousel', title: "Law of Cosines & Heron's Formula",
        props: { videos: [
          { url: 'https://www.youtube.com/embed/BINTSm6lTWE', title: "Law of Cosines & Heron's Area" },
          { url: 'https://www.youtube.com/embed/07w-wk8kRRE', title: 'Law of Cosines' },
          { url: 'https://www.youtube.com/embed/pyftYzmOwr4', title: "Oblique Triangle Area & Heron's Formula" },
        ]},
      },
      { type: 'viz', id: 'SinusoidalModelViz', title: 'Reading Parameters from a Graph',
        mathBridge: 'Given a graph, identify max, min, period, and phase — then recover A, B, C, D.',
        caption: 'The model-fitting procedure is systematic: amplitude first, then period, then midline, then phase.',
      },
      { type: 'callout', callout: { type: 'insight', title: 'Reading a sinusoidal model from data', body: '\\text{Given: max}=M, \\text{min}=m, \\text{period}=T, \\text{phase shift}=\\phi: \\\\ A = \\frac{M-m}{2}, \\quad D = \\frac{M+m}{2}, \\quad B = \\frac{2\\pi}{T}, \\quad C = B\\phi' } },
      { type: 'viz', id: 'VideoCarousel', title: 'Applications — Navigation & Bearings',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/qMS0yOoF2c4', title: 'Applications of Law of Sines & Cosines' },
          { url: 'https://www.youtube.com/embed/qYKsli4L3RM', title: 'Bearing Problems — Navigation (4 Examples)' },
        ]},
      },
      { type: 'prose', paragraphs: ['The calculus connection: for a sinusoidal function $f(t) = A\\sin(Bt + C) + D$, the derivative is $f\'(t) = AB\\cos(Bt + C)$. The amplitude of the derivative is $|AB|$ — it is scaled by the frequency. Fast oscillations ($B$ large) have large derivatives.'] },
      { type: 'callout', callout: { type: 'theorem', title: 'Derivative of a sinusoidal model', body: '\\frac{d}{dt}\\bigl[A\\sin(Bt+C)+D\\bigr] = AB\\cos(Bt+C) \\\\ \\text{Amplitude multiplied by frequency. Sine becomes cosine (phase shift of } \\pi/2\\text{).}' } },
    ],
  },

  rigor: {
    title: 'Solving a compound trig equation completely',
    visualizationId: 'SinusoidalModelViz',
    proofSteps: [
      {
        expression: '2\\cos^2 x - \\cos x - 1 = 0 \\quad \\text{on } [0, 2\\pi)',
        annotation: 'This is a quadratic in $\\cos x$. Let $u = \\cos x$ — it becomes $2u^2 - u - 1 = 0$.',
      },
      {
        expression: '(2u + 1)(u - 1) = 0 \\Rightarrow u = -\\tfrac{1}{2} \\text{ or } u = 1',
        annotation: 'Factor the quadratic. Two solutions for $u$.',
      },
      {
        expression: '\\cos x = 1 \\Rightarrow x = 0',
        annotation: 'In $[0, 2\\pi)$: $\\cos x = 1$ only at $x = 0$.',
      },
      {
        expression: '\\cos x = -\\tfrac{1}{2} \\Rightarrow x = \\tfrac{2\\pi}{3} \\text{ or } x = \\tfrac{4\\pi}{3}',
        annotation: 'Reference angle $= \\arccos(1/2) = \\pi/3$. Cosine is negative in QII and QIII: $\\pi - \\pi/3 = 2\\pi/3$ and $\\pi + \\pi/3 = 4\\pi/3$.',
      },
      {
        expression: 'x = 0, \\quad \\frac{2\\pi}{3}, \\quad \\frac{4\\pi}{3} \\qquad \\blacksquare',
        annotation: 'Three solutions in $[0, 2\\pi)$. If the general solution were asked: $0 + 2k\\pi$, $\\frac{2\\pi}{3} + 2k\\pi$, $\\frac{4\\pi}{3} + 2k\\pi$.',
      },
    ],
  },

  examples: [
    {
      id: 'ch3-005-ex1',
      title: 'Building a sinusoidal model from a description',
      problem: '\\text{A tide oscillates between 0.5 m and 3.5 m with a period of 12.4 hours. High tide occurs at } t=2 \\text{ h. Write a model.}',
      steps: [
        {
          expression: 'A = \\frac{3.5 - 0.5}{2} = 1.5 \\qquad D = \\frac{3.5 + 0.5}{2} = 2',
          annotation: 'Amplitude = half the range. Midline = average of max and min.',
        },
        {
          expression: 'B = \\frac{2\\pi}{12.4} \\approx 0.507',
          annotation: '$B = 2\\pi/\\text{period}$.',
        },
        {
          expression: 'h(t) = 1.5\\cos\\!\\left(\\frac{2\\pi}{12.4}(t - 2)\\right) + 2',
          annotation: 'Use cosine — peaks at the phase shift. High tide at $t=2$ means shift right by 2. Check: $h(2) = 1.5 + 2 = 3.5$ ✓',
        },
      ],
      conclusion: 'Systematic model building: amplitude, midline, period, phase shift — in that order. Cosine is natural when you know where the maximum occurs.',
    },
    {
      id: 'ch3-005-ex2',
      title: 'Solving a trig equation using a double angle identity',
      problem: '\\text{Solve: } \\sin 2x = \\sin x \\text{ on } [0, 2\\pi).',
      steps: [
        {
          expression: '2\\sin x\\cos x - \\sin x = 0',
          annotation: 'Replace $\\sin 2x = 2\\sin x\\cos x$, move everything to one side.',
        },
        {
          expression: '\\sin x(2\\cos x - 1) = 0',
          annotation: 'Factor out $\\sin x$.',
        },
        {
          expression: '\\sin x = 0 \\Rightarrow x = 0, \\pi \\qquad \\cos x = \\tfrac{1}{2} \\Rightarrow x = \\tfrac{\\pi}{3}, \\tfrac{5\\pi}{3}',
          annotation: 'Set each factor to zero. Four solutions total in $[0, 2\\pi)$.',
        },
      ],
      conclusion: 'When you see a double angle in an equation, apply the identity immediately to get everything in terms of the same angle. Then factor algebraically.',
    },
    {
      id: 'ch3-005-ex3',
      title: 'Calculus connection — rate of change of a sinusoidal model',
      problem: '\\text{For the tide model } h(t) = 1.5\\cos\\!\\left(\\frac{2\\pi}{12.4}(t-2)\\right) + 2, \\text{ how fast is the tide rising at } t=5 \\text{ h?}',
      steps: [
        {
          expression: "h'(t) = -1.5 \\cdot \\frac{2\\pi}{12.4}\\sin\\!\\left(\\frac{2\\pi}{12.4}(t-2)\\right)",
          annotation: 'Differentiate: amplitude $\\times$ frequency becomes the new amplitude. Cosine → negative sine.',
        },
        {
          expression: "h'(5) = -1.5 \\cdot \\frac{2\\pi}{12.4} \\cdot \\sin\\!\\left(\\frac{2\\pi}{12.4}(3)\\right) \\approx -0.507\\sin(1.532) \\approx -0.507 \\times 0.9996 \\approx -0.507",
          annotation: 'Substitute $t=5$. The negative value means the tide is falling at about 0.507 m/h at $t=5$.',
        },
      ],
      conclusion: 'The derivative of a sinusoidal model is another sinusoidal model — same period, amplitude scaled by the frequency, phase shifted by $\\pi/2$.',
    },
  ],

  challenges: [
    {
      id: 'ch3-005-ch1',
      difficulty: 'medium',
      problem: '\\text{Solve } 2\\sin^2 x + 3\\cos x = 3 \\text{ on } [0, 2\\pi).',
      hint: 'Replace $\\sin^2 x$ using the Pythagorean identity to get a quadratic in $\\cos x$.',
      walkthrough: [
        {
          expression: '2(1-\\cos^2 x) + 3\\cos x = 3',
          annotation: 'Substitute $\\sin^2 x = 1-\\cos^2 x$.',
        },
        {
          expression: '2\\cos^2 x - 3\\cos x + 1 = 0 \\Rightarrow (2\\cos x - 1)(\\cos x - 1) = 0',
          annotation: 'Rearrange and factor the quadratic.',
        },
        {
          expression: '\\cos x = \\tfrac{1}{2} \\Rightarrow x = \\tfrac{\\pi}{3}, \\tfrac{5\\pi}{3} \\qquad \\cos x = 1 \\Rightarrow x = 0',
          annotation: 'Three solutions: $x = 0, \\pi/3, 5\\pi/3$.',
        },
      ],
      answer: 'x = 0,\\; \\pi/3,\\; 5\\pi/3',
    },
    {
      id: 'ch3-005-ch2',
      difficulty: 'hard',
      problem: '\\text{A particle oscillates with position } s(t) = 3\\sin(2t) + 4\\cos(2t). \\text{ Write this as } A\\sin(2t + \\phi) \\text{ and find the amplitude and phase shift.}',
      hint: 'Use the identity $a\\sin\\theta + b\\cos\\theta = \\sqrt{a^2+b^2}\\sin(\\theta + \\phi)$ where $\\tan\\phi = b/a$.',
      walkthrough: [
        {
          expression: 'A = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5',
          annotation: 'Amplitude from the combining formula.',
        },
        {
          expression: '\\tan\\phi = \\frac{4}{3} \\Rightarrow \\phi = \\arctan\\frac{4}{3} \\approx 0.927 \\text{ rad}',
          annotation: 'Phase shift from $\\tan\\phi = b/a$ where $b=4$, $a=3$.',
        },
        {
          expression: 's(t) = 5\\sin(2t + 0.927)',
          annotation: 'Combined form. Amplitude 5, phase shift $\\approx 53.1°$. The maximum of 5 is larger than either original amplitude (3 or 4) — the two oscillations partially reinforce each other.',
        },
      ],
      answer: 'A = 5, \\; \\phi = \\arctan(4/3) \\approx 0.927 \\text{ rad}',
    },
  ],

  calcBridge: {
    teaser: 'In calculus, integrals like $\\int \\sin(Bx)\\,dx = -\\cos(Bx)/B + C$ show the frequency $B$ appearing in the denominator — high-frequency functions integrate to small-amplitude functions. This is why rapidly oscillating integrands can cancel out over a period. Understanding the sinusoidal model formula deeply makes derivative and integral formulas for trig functions feel inevitable rather than arbitrary.',
    linkedLessons: ['derivatives-introduction', 'trig-in-calculus'],
  },
}

export default {
  id: 'ch3-trig-005',
  slug: 'graphing-trig-functions',
  chapter: 'precalc-3',
  order: 4,
  title: 'Graphing All Six Trig Functions',
  subtitle: 'Period, amplitude, asymptotes, domain and range — and why the graphs look exactly the way they do',
  tags: ['graphing', 'sine', 'cosine', 'tangent', 'cotangent', 'secant', 'cosecant', 'period', 'asymptotes', 'domain', 'range'],
  aliases: 'graph sine cosine tangent cotangent secant cosecant period amplitude asymptote domain range periodic',

  hook: {
    question: 'Why does the tangent graph have vertical asymptotes at $\\pi/2$, $3\\pi/2$, $5\\pi/2$... but the sine graph never has any? The answer is in the definition: $\\tan x = \\sin x / \\cos x$, and the denominator hits zero exactly at those points.',
    realWorldContext: 'Sine and cosine graphs model every oscillation in physics: sound waves, light waves, AC current, spring motion. Tangent appears in slope calculations and optics (angle of refraction). Secant appears in navigation and in calculus integrals. Knowing these graphs deeply — not just their shapes but exactly why each feature is where it is — makes reading physical phenomena from equations automatic.',
    previewVisualizationId: 'SixTrigGraphsViz',
  },

  intuition: {
    prose: [
      'Sine and cosine are the foundation. Their graphs are identical in shape — cosine is just sine shifted left by $\\pi/2$. Both oscillate between $-1$ and $+1$, completing one full cycle every $2\\pi$. The sine graph starts at $(0,0)$; the cosine graph starts at $(0,1)$. Everything else about them follows directly from the unit circle.',
      'Tangent and cotangent have a completely different character. They are not bounded — they shoot to $\\pm\\infty$ at their asymptotes. Tangent has period $\\pi$ (not $2\\pi$), because $\\tan(x+\\pi) = \\tan x$ — the sine and cosine both flip sign, and the negatives cancel. Tangent is zero where sine is zero and undefined where cosine is zero.',
      'Secant and cosecant are the reciprocals of cosine and sine. Wherever cosine is 1, secant is 1; wherever cosine approaches 0, secant shoots to infinity. The secant graph looks like a series of upward and downward parabola-like arcs, never crossing the band $(-1, 1)$ — because $|\\sec x| = 1/|\\cos x| \\geq 1$ always.',
      '**The Circle Unrolled**: Visualize a point spinning around the unit circle at a constant speed. If you track its vertical height over "time" (the angle), you trace out the sine curve. If you track its horizontal position, you trace out the cosine curve. A "wave" is just a circular rotation laid out flat.',
      '**The Periodic Signature**: Nature repeats. Because a circle returns to its starting point every $2\\pi$, every trigonometric relationship MUST restart its story at that same interval. This is the "Periodic Signature"—the mathematical fingerprint of everything that oscillates.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Period and range of all six trig functions',
        body: '\\sin x: \\text{ period } 2\\pi, \\text{ range } [-1,1] \\\\ \\cos x: \\text{ period } 2\\pi, \\text{ range } [-1,1] \\\\ \\tan x: \\text{ period } \\pi, \\text{ range } (-\\infty,\\infty) \\\\ \\cot x: \\text{ period } \\pi, \\text{ range } (-\\infty,\\infty) \\\\ \\sec x: \\text{ period } 2\\pi, \\text{ range } (-\\infty,-1]\\cup[1,\\infty) \\\\ \\csc x: \\text{ period } 2\\pi, \\text{ range } (-\\infty,-1]\\cup[1,\\infty)',
      },
      {
        type: 'insight',
        title: 'Where the asymptotes come from — no memorisation needed',
        body: '\\tan x = \\sin x / \\cos x \\Rightarrow \\text{VA where } \\cos x = 0 \\Rightarrow x = \\frac{\\pi}{2} + k\\pi \\\\ \\cot x = \\cos x / \\sin x \\Rightarrow \\text{VA where } \\sin x = 0 \\Rightarrow x = k\\pi \\\\ \\sec x = 1/\\cos x \\Rightarrow \\text{same VAs as tangent} \\\\ \\csc x = 1/\\sin x \\Rightarrow \\text{same VAs as cotangent}',
      },
      {
        type: 'insight',
        title: 'Why $|\\sec x| \\geq 1$ and $|\\csc x| \\geq 1$ — always',
        body: '|\\cos x| \\leq 1 \\Rightarrow |\\sec x| = \\frac{1}{|\\cos x|} \\geq 1 \\\\ \\text{The secant and cosecant graphs never enter the band } (-1, 1).',
      },
      {
        type: 'insight',
        title: 'Linguistic Learner: The Language of Oscillation',
        body: '\\text{The word "Sinusoidal" comes from "Sinus" (fold/pocket), but in physics, we call it a "Wave."} \\\\ \\text{The "Period" is the time it takes to complete one full "Trip" around the circle. It is the heartbeat of the function.}',
      },
      {
        type: 'insight',
        title: 'Logical Learner: The Periodic Signature',
        body: '\\text{Rotation is the only motion that is infinite yet bounded.} \\\\ \\text{Because you cannot go farther "Up" than one radius, the graph MUST turn back. This creates the local maxima and minima that define the wave\'s intensity.}',
      },
      {
        type: 'insight',
        title: 'Physical Learner: The Harmonic Pendulum',
        body: '\\text{Every vibrating thing—a bridge in the wind, a guitar string, a light wave—follows a sine graph.} \\\\ \\text{Even your own heart rate is a sequence of non-sinusoidal periodic waves. Sine is the "Atom" of all vibration.}',
      },
      {
        type: 'insight',
        title: 'Visual Learner: The Circle Unrolled',
        body: '\\text{Imagine a rolling wheel with a pen on the rim.} \\\\ \\text{As the wheel moves forward, the pen draws a curve. This "Cycloid" logic is the physical intuition behind why trig functions are so smooth and continuous.}',
      },
    ],
    visualizations: [
      {
        id: 'SixTrigGraphsViz',
        title: 'All Six Trig Functions — Toggle and Compare',
        mathBridge: 'Toggle each function on/off. See asymptotes, period markers, and the connection between reciprocal pairs. Drag the x-line to read values.',
        caption: "Sec and csc are defined exactly where cos and sin are nonzero — their asymptotes are each other's zeros.",
      },
      { id: 'VideoCarousel', title: 'Using Trig Functions Practically', props: { videos: [
          { url: "", title: 'TR-16 — Trig Functions on a Calculator' },
          { url: "", title: 'TR-17 — Most Common Use of Trigonometry' },
        ]},
      },
            { id: 'VideoCarousel', title: 'Graphing Tan, Cot, Sec, Csc', props: { videos: [
          { url: "", title: 'TR-19 — Graphing Tangent & Cotangent' },
          { url: "", title: 'TR-20 — Graphing Secant & Cosecant' },
        ]},
      },
            { id: 'VideoCarousel', title: 'Trig Graph Variations', props: { videos: [
          { url: "", title: 'TR-42 — Trig Graph Variations 1' },
          { url: "", title: 'TR-43 — Trig Graph Variations 2' },
          { url: "", title: 'TR-44 — Trig Graph Variations 3' },
        ]},
      },
    ],
  },

  math: {
    prose: [
      'The domain of each trig function excludes the points where it is undefined. $\\sin x$ and $\\cos x$ are defined everywhere. $\\tan x$ and $\\sec x$ are undefined where $\\cos x = 0$: $x \\neq \\pi/2 + k\\pi$. $\\cot x$ and $\\csc x$ are undefined where $\\sin x = 0$: $x \\neq k\\pi$.',
      'The five key points of one cycle of $y = \\sin x$ on $[0, 2\\pi]$ are: $(0,0)$, $(\\pi/2, 1)$, $(\\pi, 0)$, $(3\\pi/2, -1)$, $(2\\pi, 0)$. For $y = \\cos x$: $(0,1)$, $(\\pi/2, 0)$, $(\\pi, -1)$, $(3\\pi/2, 0)$, $(2\\pi, 1)$. Memorise these — they anchor every graph.',
      'The tangent graph on $(-\\pi/2, \\pi/2)$ passes through $(-\\pi/4, -1)$, $(0, 0)$, $(\\pi/4, 1)$ and increases without bound at both ends. Cotangent is the reflection: it passes through $(\\pi/4, 1)$, $(\\pi/2, 0)$, $(3\\pi/4, -1)$ and has asymptotes at $x = 0$ and $x = \\pi$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Domain of all six trig functions',
        body: '\\sin, \\cos: \\text{ domain } (-\\infty, \\infty) \\\\ \\tan, \\sec: \\text{ domain } \\mathbb{R} \\setminus \\{\\tfrac{\\pi}{2}+k\\pi\\} \\\\ \\cot, \\csc: \\text{ domain } \\mathbb{R} \\setminus \\{k\\pi\\} \\\\ (k \\text{ any integer})',
      },
      {
        type: 'definition',
        title: 'Five key points for sine and cosine (one cycle)',
        body: '\\sin x:\\; (0,0),\\, (\\tfrac{\\pi}{2},1),\\, (\\pi,0),\\, (\\tfrac{3\\pi}{2},-1),\\, (2\\pi,0) \\\\ \\cos x:\\; (0,1),\\, (\\tfrac{\\pi}{2},0),\\, (\\pi,-1),\\, (\\tfrac{3\\pi}{2},0),\\, (2\\pi,1)',
      },
      {
        type: 'warning',
        title: 'Secant and cosecant touch but never cross the range gap',
        body: '\\sec x \\geq 1 \\text{ or } \\sec x \\leq -1 \\text{ — never in } (-1,1) \\\\ \\text{The arcs of sec touch } y=1 \\text{ where } \\cos x = 1, \\text{ and touch } y=-1 \\text{ where } \\cos x=-1. \\\\ \\text{They "hug" the sine and cosine curves from outside.}',
      },
      {
        type: 'theorem',
        title: 'The Logic of the Full Circle',
        body: '\\forall \\theta \\in \\mathbb{R}, \\; \\sin(\\theta + 2\\pi) = \\sin \\theta. \\\\ \\text{Algebraically: translating the unit circle by a full rotation returns all coordinates to their original indices.} \\\\ \\text{This confirms that periodicity is a fundamental topological property of circles.}',
      },
      {
        type: 'theorem',
        title: 'The Horizontal Lag (Phase Shift)',
        body: '\\text{In } f(x - C), \\text{ the input } x \\text{ must be GREATER than usual to achieve the same output.} \\\\ \\text{This means the graph is "Delayed," shifting it to the RIGHT by } C \\text{ units.}',
      },
    ],
  },

  rigor: {
    title: 'Proving $\\tan(x + \\pi) = \\tan x$ — why tangent has period $\\pi$, not $2\\pi$',
    visualizationId: 'SixTrigGraphsViz',
    proofSteps: [
      {
        expression: '\\tan(x + \\pi) = \\frac{\\sin(x+\\pi)}{\\cos(x+\\pi)}',
        annotation: 'Definition of tangent.',
      },
      {
        expression: '\\sin(x+\\pi) = -\\sin x \\qquad \\cos(x+\\pi) = -\\cos x',
        annotation: 'Adding $\\pi$ to any angle flips both coordinates on the unit circle — the point moves to the diametrically opposite point.',
      },
      {
        expression: '\\tan(x+\\pi) = \\frac{-\\sin x}{-\\cos x} = \\frac{\\sin x}{\\cos x} = \\tan x \\qquad \\blacksquare',
        annotation: 'The negatives cancel. Tangent has period exactly $\\pi$, not $2\\pi$. The same argument works for cotangent.',
      },
      {
        expression: '\\text{--- Part II: Deriving the Period Formula ---}',
        annotation: 'Let us prove why the period of $f(Bx)$ is $2\\pi/B$ for sin and cos.'
      },
      {
        expression: 'f(\\text{Input}) = f(\\text{Input} + 2\\pi)',
        annotation: 'Step 1: The standard trig function repeats when its argument increases by $2\\pi$.'
      },
      {
        expression: '\\sin(B(x + T)) = \\sin(Bx + 2\\pi)',
        annotation: 'Step 2: Let $T$ be the new period. The output at $x+T$ must match the output at $x$—which happens when the argument has grown by $2\\pi$.'
      },
      {
        expression: 'Bx + BT = Bx + 2\\pi',
        annotation: 'Step 3: Distribute the B coefficient.'
      },
      {
        expression: 'BT = 2\\pi \\implies T = \\frac{2\\pi}{B} \\qquad \\blacksquare',
        annotation: 'Step 4: Solve for $T$. The period is inversely proportional to the frequency coefficient.'
      }
    ],
  },

  examples: [
    {
      id: 'ch3-trig-005-ex1',
      title: 'Identifying features of a trig graph from its equation',
      problem: '\\text{For } y = 3\\sec(2x): \\text{ find the period, amplitude (if any), asymptotes, and range.}',
      steps: [
        {
          expression: '\\sec(2x) = 1/\\cos(2x) \\Rightarrow \\text{period of } \\cos(2x) = \\frac{2\\pi}{2} = \\pi \\Rightarrow \\text{period of } \\sec(2x) = \\pi',
          annotation: 'Secant inherits the period of cosine. The coefficient 2 halves the period.',
        },
        {
          expression: '\\text{Amplitude: undefined (sec is unbounded). Vertical stretch: 3.}',
          annotation: 'Amplitude is only defined for bounded functions like sin and cos. For sec, the 3 is a vertical stretch factor.',
        },
        {
          expression: '\\text{VAs: } \\cos(2x) = 0 \\Rightarrow 2x = \\frac{\\pi}{2}+k\\pi \\Rightarrow x = \\frac{\\pi}{4}+\\frac{k\\pi}{2}',
          annotation: 'Find where the denominator is zero.',
        },
        {
          expression: '\\text{Range: } (-\\infty, -3] \\cup [3, \\infty)',
          annotation: 'The stretch factor 3 scales the range: $|\\sec| \\geq 1$ becomes $|3\\sec| \\geq 3$.',
        },
      ],
      conclusion: 'For reciprocal trig functions: period from the inner function, asymptotes from denominator zeros, range stretched by the amplitude factor.',
    },
    {
      id: 'ch3-trig-005-ex2',
      title: 'Matching equations to graphs',
      problem: '\\text{A trig graph has: period } \\pi/2, \\text{ asymptotes at } x = \\pi/4 + k\\pi/2, \\text{ passes through origin. Which function?}',
      steps: [
        {
          expression: '\\text{Asymptotes at } x = \\pi/4 + k\\pi/2 \\Rightarrow \\cos(Bx) = 0 \\Rightarrow \\text{tangent or secant}',
          annotation: 'Asymptotes with this structure come from where cosine is zero.',
        },
        {
          expression: '\\text{Passes through origin} \\Rightarrow \\text{tangent (not secant, which never passes through origin)}',
          annotation: 'Secant has range $\\leq -1$ or $\\geq 1$, so it cannot pass through $(0,0)$.',
        },
        {
          expression: '\\text{Period } \\pi/2 = \\pi/B \\Rightarrow B = 2 \\Rightarrow y = \\tan(2x)',
          annotation: 'The period of tangent is $\\pi/B$. Solve for $B$.',
        },
      ],
      conclusion: 'Work backwards from features: period determines $B$, asymptote positions identify the function family, key points distinguish between candidates.',
    },
    {
      id: 'ex-trig-total-transform',
      title: 'The Multi-Stage Wave: Total Transformation',
      problem: '\\text{Sketch one period of } y = -2\\sin(2x - \\pi/2) + 1.',
      steps: [
        {
          expression: 'A = |-2| = 2, \\quad \\text{Reflected over x-axis}',
          annotation: 'Step 1: Amplitude is 2. The negative sign means it starts by going DOWN.'
        },
        {
          expression: 'T = \\frac{2\\pi}{2} = \\pi',
          annotation: 'Step 2: Period is pi.'
        },
        {
          expression: '2x - \\pi/2 = 0 \\implies x = \\pi/4',
          annotation: 'Step 3: Phase shift is pi/4 to the right.'
        },
        {
          expression: 'D = 1',
          annotation: 'Step 4: Vertical shift is up 1. The midline is y=1.'
        }
      ],
      conclusion: 'Combine the "Four Pillars": Amplitude, Period, Phase, and Vertical Shift. Map the five key points starting from the shifted origin.'
    },
    {
      id: 'ex-trig-signal-recon',
      title: 'Signal Reconnaissance: Equation from Two Peaks',
      problem: '\\text{Find the cosine equation for a wave with a peak at } (1, 10) \\text{ and the next peak at } (5, 10), \\text{ with a minimum valley at } y = 2.',
      steps: [
        {
          expression: 'v = \\frac{10+2}{2} = 6, \\quad A = 10-6 = 4',
          annotation: 'Step 1: Find the midline and amplitude. Midline is the average of max/min; amplitude is the distance from max to midline.'
        },
        {
          expression: 'T = 5 - 1 = 4 \\implies \\frac{2\\pi}{B} = 4 \\implies B = \\frac{\\pi}{2}',
          annotation: 'Step 2: Period is the horizontal peak-to-peak distance.'
        },
        {
          expression: 'x = 1 \\implies y = A\\cos(B(x-C)) + D',
          annotation: 'Step 3: Since the maximum is at x=1, the phase shift is 1 to the right.'
        },
        {
          expression: 'y = 4\\cos(\\frac{\\pi}{2}(x-1)) + 6',
          annotation: 'Step 4: Assemble the pieces.'
        }
      ],
      conclusion: 'Every physical signal can be reconstructed by identifying its boundary box (max/min) and its temporal cycle (period).'
    },
  ],

  challenges: [
    {
      id: 'ch3-trig-005-ch1',
      difficulty: 'medium',
      problem: '\\text{Sketch one full period of } y = -2\\csc(x/2) \\text{ and state its domain, range, and period.}',
      hint: 'Find where $\\sin(x/2) = 0$ for the asymptotes, then sketch $y = -2\\sin(x/2)$ as a guide curve.',
      walkthrough: [
        {
          expression: '\\text{Period of } \\sin(x/2) = \\frac{2\\pi}{1/2} = 4\\pi \\Rightarrow \\text{period of csc} = 4\\pi',
          annotation: 'The $1/2$ stretches the period to $4\\pi$.',
        },
        {
          expression: '\\text{Asymptotes: } \\sin(x/2) = 0 \\Rightarrow x/2 = k\\pi \\Rightarrow x = 2k\\pi',
          annotation: 'At $x = 0, \\pm 2\\pi, \\pm 4\\pi, \\ldots$',
        },
        {
          expression: '\\text{Range: } (-\\infty,-2]\\cup[2,\\infty)',
          annotation: '$-2\\csc$ means we multiply by $-2$: the graph flips AND stretches. Arcs that normally go up now go down and vice versa.',
        },
      ],
      answer: '\\text{Period } 4\\pi. \\text{ Domain: } x \\neq 2k\\pi. \\text{ Range: } (-\\infty,-2]\\cup[2,\\infty).',
    },
    {
      id: 'ch3-trig-005-ch2',
      difficulty: 'harder',
      problem: '\\text{Find the horizontal shift } C \\text{ such that } \\sin(x + C) = \\cos(x) \\text{ for all } x. \\text{ Verify your result by sketching the relation.}',
      hint: 'The cosine wave is just the sine wave shifted so its peak appears where the sine wave is at zero.',
      walkthrough: [
        {
          expression: '\\sin(x + \\pi/2) = \\sin(x) \\cos(\\pi/2) + \\cos(x) \\sin(\\pi/2)',
          annotation: 'Step 1: Use the sum identity. $\\cos(90^\\circ)=0$ and $\\sin(90^\\circ)=1$.'
        },
        {
          expression: '0 + \\cos(x) \\cdot 1 = \\cos(x)',
          annotation: 'Step 2: Simplify. This reveals the identity.'
        },
        {
          expression: 'C = \\pi/2 \\qquad \\blacksquare',
          annotation: 'Step 3: The cosine function is simply a sine function that has been "phase-advanced" by 90 degrees.'
        }
      ],
      answer: 'C = \\pi/2'
    }
  ],

  calcBridge: {
    teaser: 'In calculus, the graphs of trig functions directly explain their derivatives. The sine graph rises from 0 to its peak — and the derivative (cosine) is positive and large there. At the peak of sine, the tangent is horizontal — cosine is zero. Reading derivatives from graphs is only possible if you know the graphs deeply. The asymptotes of tangent and secant also appear as limits: $\\lim_{x\\to\\pi/2^-}\\tan x = +\\infty$.',
    linkedLessons: ['trig-applications', 'inverse-trig-functions'],
  },
}

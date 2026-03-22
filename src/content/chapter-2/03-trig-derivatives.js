// FILE: src/content/chapter-2/03-trig-derivatives.js
export default {
  id: 'ch2-003',
  slug: 'trig-derivatives',
  chapter: 2,
  order: 3,
  title: 'Derivatives of Trigonometric Functions',
  subtitle: 'Why the slope of the sine curve is cosine — and deriving all six trig derivatives',
  tags: ['sine derivative', 'cosine derivative', 'tangent derivative', 'trigonometric functions', 'trig limits', 'chain rule with trig'],
  aliases: 'section 3.5 derivatives trig functions formal proof sin cos tan cot sec csc limit definition derivative',

  hook: {
    question: 'A point moves around the unit circle at constant angular speed. Its y-coordinate is y = sin(theta). When theta = 0, the point is at (1, 0) and is moving straight upward, so height increases as fast as possible. When theta = pi/2, the point is at (0, 1) moving sideways, so height is not changing at all. When theta = pi, the point is at (-1, 0) moving downward, so height decreases at maximum rate. These rates, 1, 0, and -1, are exactly cos(0), cos(pi/2), and cos(pi). Why does this happen for every angle?',
    realWorldContext: 'Periodic phenomena dominate science and engineering: alternating current in electrical circuits, vibrations in mechanical systems, sound waves, ocean tides, the positions of planets. All of these are modeled using sine and cosine. To analyze how these quantities change — how quickly a current switches direction, how rapidly a spring approaches equilibrium, how fast a tide is rising — we need derivatives of trigonometric functions. The fact that d/dx[sin x] = cos x is not just elegant mathematics; it is the foundation of all oscillation and wave analysis.',
    previewVisualizationId: 'TrigDerivativeSync',
  },

  intuition: {
    prose: [
      'Imagine tracing around the unit circle as the angle theta increases from 0. The y-coordinate follows the sine function. Let\'s watch what happens to the slope of the sine curve as theta varies.',
      'At theta = 0: the point (1, 0) is moving straight upward. The y-coordinate is increasing at maximum rate. The slope of sin(theta) is 1, and cos(0) = 1.',
      'At theta = pi/2: the point (0, 1) is moving horizontally. The y-coordinate is at a local maximum, so its instantaneous rate is 0. The slope is 0, and cos(pi/2) = 0.',
      'At theta = pi: the point (-1, 0) is moving straight downward. The y-coordinate decreases at maximum rate. The slope is -1, and cos(pi) = -1.',
      'This pattern is a theorem, not a coincidence: d/dtheta[sin(theta)] = cos(theta).',
      'Geometric proof bridge: position is (cos(theta), sin(theta)) and velocity is perpendicular to radius, so velocity has direction (-sin(theta), cos(theta)). The y-component of velocity is cos(theta), and that y-component is exactly d/dtheta[sin(theta)].',
      'Why the minus sign for cosine? As theta increases through the first quadrant, cosine tracks horizontal position moving left, so its rate of change is negative. That directional fact is d/dx[cos x] = -sin x.',
      'Expert intuition: each derivative is a 90-degree phase rotation of the trig wave. sin -> cos -> -sin -> -cos -> sin.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Geometric Intuition: Unit Circle',
        body: '\\text{At } \\theta: \\text{slope of } \\sin\\theta = \\cos\\theta',
      },
      {
        type: 'insight',
        title: 'Velocity-Vector Proof in One Line',
        body: "\\vec r(\\theta)=(\\cos\\theta,\\sin\\theta),\\;\\vec r'(\\theta)=(-\\sin\\theta,\\cos\\theta)\\Rightarrow\\frac{d}{d\\theta}[\\sin\\theta]=\\cos\\theta",
      },
      {
        type: 'insight',
        title: 'The "co-" Functions All Have Minus Signs',
        body: "\\frac{d}{dx}[\\cos x] = -\\sin x, \\quad \\frac{d}{dx}[\\csc x] = -\\csc x\\cot x, \\quad \\frac{d}{dx}[\\cot x] = -\\csc^2 x",
      },
      {
        type: 'warning',
        title: 'Chain Rule Trap: sin(x^2) vs sin^2(x)',
        body: "\\sin(x^2) \\neq (\\sin x)^2.\\; \\frac{d}{dx}[\\sin(x^2)] = 2x\\cos(x^2),\\; \\frac{d}{dx}[(\\sin x)^2] = 2\\sin x\\cos x",
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "Calculus I - 5.7.2 Inverse Trigonometric Functions: Differentiation",
        props: { url: "https://www.youtube.com/embed/xoBwEFKVHKE" }
      },
      {
        id: 'VideoEmbed',
        title: "Calculus I - 2.3.2 Trigonometric and Higher-Order Derivatives",
        props: { url: "https://www.youtube.com/embed/cHaZmLIyWjg" }
      },
    {
        id: 'VideoEmbed',
        title: "Derivative of Inverse Trigonometric Functions",
        props: { url: "https://www.youtube.com/embed/SOYcqhFw5vo" }
      },
      {
        id: 'VideoEmbed',
        title: "The derivative of Trigonometric Functions",
        props: { url: "https://www.youtube.com/embed/QDKj-E-ICPo" }
      },
      {
        id: 'TrigDerivativeSync',
        title: 'The "Moving Point" Deep Sync',
        mathBridge: 'This shows three views of the same fact: $\\frac{d}{d\\theta}[\\sin\\theta] = \\cos\\theta$. The unit-circle panel shows where the point is. The middle panel shows the slope of the sine curve there. The right panel shows the cosine value. All three update together because slope of sine = cosine — every single angle.',
        caption: 'Watch one angle drive three views at once: motion on the circle, slope of sine, and value of cosine. They stay synchronized because the sine slope is exactly cosine.',
      },
      {
        id: 'VelocityVectorProofLab',
        title: 'Velocity Vector Lab (Zero Algebra Proof)',
        mathBridge: 'A point at angle $\\theta$ on the unit circle has position $\\vec{r} = (\\cos\\theta, \\sin\\theta)$. Its velocity vector is perpendicular to the radius: $\\vec{r}\' = (-\\sin\\theta, \\cos\\theta)$. The $y$-component of velocity is the rate of change of $y = \\sin\\theta$, and that component is $\\cos\\theta$. So $\\frac{d}{d\\theta}[\\sin\\theta] = \\cos\\theta$ — no limit algebra required.',
        caption: 'Drag theta and verify: radius is (cos(theta), sin(theta)) while velocity is (-sin(theta), cos(theta)). The y-component of velocity is cos(theta), so d/dtheta[sin(theta)] = cos(theta).',
      },
      {
        id: 'TrigMotionBridgeLab',
        title: 'Trig Motion Bridge Lab',
        mathBridge: 'The sign of $\\frac{d}{d\\theta}[\\sin\\theta]$ tells you whether $\\sin\\theta$ is increasing or decreasing. When the point moves upward (first quadrant), $\\sin$ increases so the derivative is positive. At the top ($\\theta = \\pi/2$), motion is horizontal so $\\frac{d}{d\\theta}[\\sin(\\pi/2)] = \\cos(\\pi/2) = 0$. Motion direction determines derivative sign.',
        caption: 'Predict derivative signs from unit-circle motion and verify them instantly with the cosine readout.',
      },
      {
        id: 'CoDirectionCompass',
        title: 'Why the Minus Sign? Co-Direction Compass',
        mathBridge: 'As $\\theta$ increases, the point moves counterclockwise. The $x$-coordinate ($\\cos\\theta$) moves left in the first and second quadrants — a decrease — so its rate of change is negative. That is why $\\frac{d}{dx}[\\cos x] = -\\sin x$. The minus sign is not arbitrary; it reflects which direction the horizontal component moves.',
        caption: 'Track vertical and horizontal motion signs as theta increases. This turns d/dx[cos x] = -sin x into directional geometry.',
      },
      {
        id: 'DerivativeCycleClock',
        title: 'The Higher-Order Derivative Clock',
        mathBridge: 'Each derivative shifts the trig wave by a quarter period: $\\sin x \\xrightarrow{d/dx} \\cos x \\xrightarrow{d/dx} -\\sin x \\xrightarrow{d/dx} -\\cos x \\xrightarrow{d/dx} \\sin x$. After 4 derivatives you return to the original — so $\\frac{d^4}{dx^4}[\\sin x] = \\sin x$. To find the $n$th derivative, use $n \\bmod 4$.',
        caption: 'Click d/dx to take successive derivatives. Every 4 steps returns to sin(x). Think of each derivative as a 90-degree phase rotation.',
      },
      {
        id: 'SpringOscillation',
        title: 'Simple Harmonic Motion — Derivatives in Action',
        mathBridge: "Hooke's Law gives acceleration $a = -kx$, so the position satisfies $x''(t) = -\\omega^2 x(t)$. The solution is $x(t) = A\\cos(\\omega t)$. Its derivatives are $v(t) = x'(t) = -A\\omega\\sin(\\omega t)$ and $a(t) = x''(t) = -A\\omega^2\\cos(\\omega t)$. The spring obeys the same derivative cycle as the clock: each level is the derivative of the one above it.",
        caption: 'Position x(t)=A cos(t), velocity v(t)=-A sin(t), acceleration a(t)=-A cos(t). Each graph is the derivative of the one above.',
      },
      {
        id: 'TangentExplosion',
        title: 'Why tan(x) Explodes — Quotient Rule Intuition',
        mathBridge: '$\\tan x = \\frac{\\sin x}{\\cos x}$. Near $x = \\pi/2$: $\\sin(\\pi/2) = 1$ while $\\cos(\\pi/2) = 0$, so the fraction $\\frac{1}{0}$ has a vertical asymptote. The derivative is $\\frac{d}{dx}[\\tan x] = \\sec^2 x = \\frac{1}{\\cos^2 x}$, which also blows up at $x = \\pi/2$ for the same reason — the denominator goes to zero.',
        caption: 'Drag toward x = pi/2. cos(x) shrinks toward 0 while sin(x) stays near 1, so tan(x)=sin(x)/cos(x) explodes.',
      },
      {
        id: 'QuotientRuleTanBuilder',
        title: 'Interactive Quotient Rule Builder for tan(x)',
        mathBridge: 'Applying the quotient rule $\\frac{d}{dx}\\left[\\frac{f}{g}\\right] = \\frac{f\'g - fg\'}{g^2}$ to $\\tan x = \\frac{\\sin x}{\\cos x}$ gives $\\frac{\\cos x \\cdot \\cos x - \\sin x \\cdot (-\\sin x)}{\\cos^2 x} = \\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x} = \\frac{1}{\\cos^2 x} = \\sec^2 x$. The Pythagorean identity is the key simplification.',
        caption: 'Step through "low d high minus high d low" and watch cos²(x)+sin²(x) collapse to 1.',
      },
      {
        id: 'NestedTrigMachine',
        title: 'Nested Machine: sin(x²) vs sin²(x)',
        mathBridge: 'Composition order matters: $\\sin(x^2)$ means square first, then sine, giving $\\frac{d}{dx}[\\sin(x^2)] = \\cos(x^2) \\cdot 2x$. But $\\sin^2(x) = (\\sin x)^2$ means sine first, then square, giving $\\frac{d}{dx}[(\\sin x)^2] = 2\\sin x \\cos x$. The chain rule multiplies by the inner derivative — which is completely different in each case.',
        caption: 'Swap machine order to fix the most common chain-rule mistake. Square-then-sine and sine-then-square produce different derivatives.',
      },
      {
        id: 'ChainRuleOnionLab',
        title: 'Peel-the-Onion Chain Rule Lab',
        mathBridge: 'For a composition $h(x) = f(g(x))$: the chain rule says $h\'(x) = f\'(g(x)) \\cdot g\'(x)$. Peel the outermost layer, differentiate it (keeping the inside unchanged), then multiply by the derivative of the inside. Each peel corresponds to one multiplication in the chain.',
        caption: 'Practice peeling compositions in order. The outside changes first, the inside stays intact, then multiply by the core derivative.',
      },
      {
        id: 'SineAdditionProofBuilder',
        title: 'Sine-of-a-Sum Proof Builder',
        mathBridge: 'The limit proof of $\\frac{d}{dx}[\\sin x] = \\cos x$ uses two key trig limits: $\\lim_{h \\to 0} \\frac{\\sin h}{h} = 1$ and $\\lim_{h \\to 0} \\frac{\\cos h - 1}{h} = 0$. After expanding $\\sin(x+h)$ using the angle addition formula, these two limits turn the messy difference quotient into $\\cos x$.',
        caption: 'Follow the formal proof with strategy tags. The colored limit blobs show exactly where the final cosine comes from.',
      },
      {
        id: 'InverseBridgeTriangleLab',
        title: 'Inverse Bridge: From sin to arcsin',
        mathBridge: 'If $y = \\arcsin x$, then $\\sin y = x$. Implicit differentiation gives $\\cos y \\cdot \\frac{dy}{dx} = 1$, so $\\frac{dy}{dx} = \\frac{1}{\\cos y}$. Since $\\sin y = x$, a right triangle gives $\\cos y = \\sqrt{1-x^2}$. Therefore $\\frac{d}{dx}[\\arcsin x] = \\frac{1}{\\sqrt{1-x^2}}$. The triangle converts the trig back to algebra.',
        caption: 'Use a right triangle plus implicit differentiation to derive d/dx[arcsin x] = 1/√(1−x²).',
      },
      {
        id: 'VideoEmbed',
        title: 'Setting up the Unit Circle Part 1 and Reference Angle',
        props: { url: 'https://www.youtube.com/embed/j5SoWzBSUmY' },
      },
      {
        id: 'VideoEmbed',
        title: 'Fundamental Trigonometric Identities Intro & Proofs',
        props: { url: 'https://www.youtube.com/embed/W6GbAtk08Vo' },
      },
      {
        id: 'VideoEmbed',
        title: 'Intro to Fundamental Trig Identities',
        props: { url: 'https://www.youtube.com/embed/zHswnV-Na40' },
      },
      {
        id: 'VideoEmbed',
        title: 'Understanding Basic Sine & Cosine Graphs',
        props: { url: 'https://www.youtube.com/embed/qQOKUIrcuRs' },
      },
      {
        id: 'VideoEmbed',
        title: 'Evaluating Trig Functions w/ Unit Circle Degrees & Radians',
        props: { url: 'https://www.youtube.com/embed/NO4H4YROdqk' },
      },
    ],
  },

  math: {
    prose: [
      'We state all six trigonometric derivative formulas. The first two (sine and cosine) are proved from the limit definition. The other four are derived using the quotient rule, since tan, csc, sec, and cot are all rational combinations of sine and cosine.',
      'Once we have d/dx[sin x] and d/dx[cos x], the quotient rule handles everything else. Recall that tan x = sin x / cos x, csc x = 1/sin x, sec x = 1/cos x, and cot x = cos x / sin x.',
      'The memory device for the four derived formulas: all three "co-" functions (cosine, cosecant, cotangent) have negative derivatives. The remaining three (sine, tangent, secant) have positive derivatives. Within each pair: sine and cosine swap (but cosine gets a minus sign), tangent becomes sec\u00b2, cotangent becomes -csc\u00b2, and secant and cosecant follow their own symmetric patterns.',
      'Every one of these formulas extends to compositions via the chain rule. For any differentiable function u = g(x): d/dx[sin(u)] = cos(u)\u00b7u\', d/dx[cos(u)] = -sin(u)\u00b7u\', d/dx[tan(u)] = sec\u00b2(u)\u00b7u\', and so on. These extended forms are the versions used in 90% of calculations.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Six Trig Derivatives',
        body: "\\begin{aligned} \\frac{d}{dx}[\\sin x] &= \\cos x \\\\ \\frac{d}{dx}[\\cos x] &= -\\sin x \\\\ \\frac{d}{dx}[\\tan x] &= \\sec^2 x \\\\ \\frac{d}{dx}[\\csc x] &= -\\csc x\\cot x \\\\ \\frac{d}{dx}[\\sec x] &= \\sec x\\tan x \\\\ \\frac{d}{dx}[\\cot x] &= -\\csc^2 x \\end{aligned}",
      },
      {
        type: 'theorem',
        title: 'Six Trig Derivatives with Chain Rule',
        body: "\\begin{aligned} \\frac{d}{dx}[\\sin u] &= \\cos u \\cdot u' \\\\ \\frac{d}{dx}[\\cos u] &= -\\sin u \\cdot u' \\\\ \\frac{d}{dx}[\\tan u] &= \\sec^2 u \\cdot u' \\end{aligned}",
      },
      {
        type: 'derivation',
        title: 'Deriving d/dx[tan x] via Quotient Rule',
        body: "\\frac{d}{dx}\\left[\\frac{\\sin x}{\\cos x}\\right] = \\frac{\\cos x \\cdot \\cos x - \\sin x \\cdot (-\\sin x)}{\\cos^2 x} = \\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x} = \\frac{1}{\\cos^2 x} = \\sec^2 x",
      },
      {
        type: 'insight',
        title: 'Derivative as 90-Degree Phase Shift',
        body: "\\frac{d}{dx}[\\sin x]=\\cos x=\\sin\\left(x+\\frac{\\pi}{2}\\right),\\quad \\frac{d}{dx}[\\cos x]=-\\sin x=\\cos\\left(x+\\frac{\\pi}{2}\\right)",
      },
      {
        type: 'derivation',
        title: 'Deriving d/dx[csc x] via Quotient Rule',
        body: "\\frac{d}{dx}\\left[\\frac{1}{\\sin x}\\right] = \\frac{0 \\cdot \\sin x - 1 \\cdot \\cos x}{\\sin^2 x} = \\frac{-\\cos x}{\\sin^2 x} = -\\frac{1}{\\sin x}\\cdot\\frac{\\cos x}{\\sin x} = -\\csc x\\cot x",
      },
      {
        type: 'derivation',
        title: 'Deriving d/dx[cot x] via Quotient Rule',
        body: "\\frac{d}{dx}\\left[\\frac{\\cos x}{\\sin x}\\right] = \\frac{-\\sin x \\cdot \\sin x - \\cos x \\cdot \\cos x}{\\sin^2 x} = \\frac{-(\\sin^2 x + \\cos^2 x)}{\\sin^2 x} = \\frac{-1}{\\sin^2 x} = -\\csc^2 x",
      },
    ],
    visualizationId: 'TrigDerivativeSync',
    visualizationProps: {},
  },

  rigor: {
    // Geometric proof steps — synced with SinDerivativeGeometric visualization
    proofSteps: [
      {
        expression: 'P = (\\cos x,\\, \\sin x)',
        annotation: 'Position vector on the unit circle at angle x.',
      },
      {
        expression: '\\vec{v} = (-\\sin x,\\, \\cos x)',
        annotation: 'The velocity vector is perpendicular to the radius. For unit speed, this is the derivative of position.',
      },
      {
        expression: '\\frac{d}{dx}[\\sin x] = v_y = \\cos x',
        annotation: 'The vertical rate of change of the point is the y-component of its velocity. This matches the height of the cosine graph at that angle.',
      },
      {
        expression: '\\frac{d}{dx}[\\cos x] = v_x = -\\sin x',
        annotation: 'The horizontal rate of change is the x-component of velocity. Notice it points left (negative) for positive sine heights. This is why d/dx[cos x] = -sin x.',
      },
      {
        expression: '\\text{Tangent Geometry: } \\tan x',
        annotation: 'Extend the radius to the line x=1. The height of this segment is tan(x).',
      },
      {
        expression: '\\text{Arc } dx \\xrightarrow{\\text{sec } x} \\text{Vertical } dy',
        annotation: 'As the angle increases by dx, the tip of the tangent segment moves vertically. Because the segment is at distance 1, this change is amplified by sec^2 x.',
      },
      {
        expression: '\\frac{d}{dx}[\\tan x] = \\sec^2 x',
        annotation: 'The geometric growth rate of the tangent segment is secant squared. No algebra, just projection geometry.',
      },
    ],
    visualizationId: 'TrigDerivativeGeometric',
    visualizationProps: {},

    prose: [
      'We now prove d/dx[sin x] = cos x rigorously from the limit definition. This proof depends on two fundamental trigonometric limits, which we state but do not re-derive here (they were established in the limits chapter): lim(h\u21920) sin(h)/h = 1 and lim(h\u21920) (1 - cos h)/h = 0.',
      'PROOF that d/dx[sin x] = cos x: Using the limit definition, d/dx[sin x] = lim(h\u21920) [sin(x+h) - sin(x)] / h. Apply the sine addition formula: sin(x+h) = sin(x)cos(h) + cos(x)sin(h). So the numerator becomes: sin(x)cos(h) + cos(x)sin(h) - sin(x) = sin(x)[cos(h) - 1] + cos(x)sin(h). Dividing by h: sin(x) \u00b7 [cos(h)-1]/h + cos(x) \u00b7 sin(h)/h.',
      'Use the live-link panel below while reading this line: hover cos(x)\u00b7sin(h)/h to glow the vertical velocity arrow, and hover sin(x)\u00b7(cos(h)-1)/h to blink the horizontal correction that vanishes as h approaches 0.',
      'As h \u2192 0: the first term has sin(x) (a constant with respect to h) times [cos(h)-1]/h. Rearranging, [cos(h)-1]/h = -(1-cos h)/h \u2192 -0 = 0. The second term has cos(x) (constant) times sin(h)/h \u2192 1. Therefore the entire expression approaches sin(x)\u00b70 + cos(x)\u00b71 = cos(x). This completes the proof.',
      'PROOF that d/dx[cos x] = -sin x: Using the limit definition with the cosine addition formula cos(x+h) = cos(x)cos(h) - sin(x)sin(h): [cos(x+h)-cos(x)]/h = cos(x)\u00b7[cos(h)-1]/h - sin(x)\u00b7sin(h)/h. As h\u21920, the first term approaches cos(x)\u00b70 = 0 and the second approaches sin(x)\u00b71 = sin(x). So d/dx[cos x] = -sin(x). The minus sign comes from the minus sign in the cosine addition formula.',
      'The two key limits sin(h)/h \u2192 1 and (1-cos h)/h \u2192 0 as h \u2192 0 are the real engine of these proofs. The first was established geometrically by the squeeze theorem (the arc length h is squeezed between sin h and tan h for small h > 0). The second follows from the first via the identity (1-cos h)/h = sin\u00b2(h) / [h(1+cos h)] = [sin(h)/h] \u00b7 [sin(h)/(1+cos h)] \u2192 1\u00b70/2 = 0.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Fundamental Trig Limits',
        body: '\\lim_{h\\to 0}\\frac{\\sin h}{h} = 1 \\qquad \\lim_{h\\to 0}\\frac{1-\\cos h}{h} = 0',
      },
      {
        type: 'insight',
        title: 'Proof Strategy Tags',
        body: '\\text{Isolation: expand }\\sin(x+h).\\;\\text{Hunting: group }\\frac{\\sin h}{h}\\text{ and }\\frac{\\cos h-1}{h}.\\;\\text{Survival: cosine term times 1 remains.}',
      },
      {
        type: 'proof',
        title: 'Proof: d/dx[sin x] = cos x',
        body: "\\frac{d}{dx}[\\sin x] = \\lim_{h\\to 0}\\frac{\\sin(x+h)-\\sin x}{h} = \\lim_{h\\to 0}\\left[\\sin x\\cdot\\frac{\\cos h - 1}{h} + \\cos x \\cdot\\frac{\\sin h}{h}\\right] = \\sin x\\cdot 0 + \\cos x\\cdot 1 = \\cos x",
      },
    ],
    visualizations: [
      {
        id: 'ProofCircleLinkLab',
        title: 'Live-Link: Proof Terms ↔ Circle Geometry',
        mathBridge: 'The two proof terms $\\sin x \\cdot \\frac{\\cos h - 1}{h}$ and $\\cos x \\cdot \\frac{\\sin h}{h}$ each correspond to visible geometry on the circle. Hover either term to highlight it. As $h \\to 0$, the horizontal correction (amber, vanishing) shrinks away and only the vertical velocity component (red, surviving) remains — giving $\\cos x$.',
        caption: 'Hover the proof terms to light up the matching geometry. Use the theta and h sliders to verify at any angle.',
      },
    ],
  },

  examples: [
    {
      id: 'ch2-003-ex1',
      title: 'Sine with Chain Rule',
      problem: "f(x) = \\sin(3x). \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Outer: } F(u) = \\sin(u), \\quad \\text{Inner: } u = 3x",
          annotation: 'Identify the composition. The outer function is sine; the inner is 3x.',
        },
        {
          expression: "F'(u) = \\cos(u), \\quad u' = 3",
          annotation: 'Derivative of sine is cosine; derivative of the inner function 3x is 3.',
        },
        {
          expression: "f'(x) = \\cos(3x) \\cdot 3 = 3\\cos(3x)",
          annotation: 'Apply chain rule: outer derivative (cosine, evaluated at inner) times inner derivative (3). The argument of cosine is the same as the original argument of sine.',
        },
      ],
      conclusion: 'f\'(x) = 3cos(3x). The chain rule "multiplies in" the factor of 3 from the inner function. Without the chain rule, the answer would be cos(3x) — missing the crucial factor of 3.',
    },
    {
      id: 'ch2-003-ex2',
      title: 'Product Rule with Cosine',
      problem: "f(x) = x^2 \\cos(x). \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Identify: } u(x) = x^2, \\quad v(x) = \\cos x",
          annotation: 'This is a product of two functions. Assign the first factor and second factor for the product rule.',
        },
        {
          expression: "u'(x) = 2x, \\quad v'(x) = -\\sin x",
          annotation: 'Differentiate each factor separately. d/dx[x\u00b2] = 2x by the power rule; d/dx[cos x] = -sin x.',
        },
        {
          expression: "f'(x) = u'v + uv' = (2x)(\\cos x) + (x^2)(-\\sin x)",
          annotation: 'Apply the product rule: (first)(second)\' + (first)\'(second).',
        },
        {
          expression: "= 2x\\cos x - x^2 \\sin x",
          annotation: 'Simplify by writing the two terms separately. This is the fully simplified form.',
        },
        {
          expression: "= x(2\\cos x - x\\sin x)",
          annotation: 'Optionally factor out x from both terms. This factored form can be useful for finding zeros.',
        },
      ],
      conclusion: 'f\'(x) = 2x cos(x) - x\u00b2 sin(x). The product rule gives two terms: the first represents the rate of change from the x\u00b2 factor, and the second from the cos(x) factor.',
    },
    {
      id: 'ch2-003-ex3',
      title: 'Tangent with Chain Rule',
      problem: "f(x) = \\tan(x^2+1). \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Outer: } F(u) = \\tan u, \\quad \\text{Inner: } u = x^2 + 1",
          annotation: 'Identify the composition. The outer function is tangent; the inner is x\u00b2+1.',
        },
        {
          expression: "F'(u) = \\sec^2 u, \\quad u' = 2x",
          annotation: 'The derivative of tan(u) is sec\u00b2(u). The inner derivative is 2x.',
        },
        {
          expression: "f'(x) = \\sec^2(x^2+1) \\cdot 2x = 2x\\sec^2(x^2+1)",
          annotation: 'Apply chain rule: outer derivative (sec\u00b2, evaluated at x\u00b2+1) times inner derivative (2x).',
        },
      ],
      conclusion: 'f\'(x) = 2x sec\u00b2(x\u00b2+1). The derivative of tangent is always sec\u00b2, and when the argument is a function of x, the chain rule contributes the derivative of that argument.',
    },
    {
      id: 'ch2-003-ex4',
      title: 'Power of Sine — Chain Rule',
      problem: "f(x) = \\sin^2(x). \\text{ Find } f'(x).",
      steps: [
        {
          expression: "f(x) = (\\sin x)^2",
          annotation: 'Logic narrator: this is a power-rule shell first, not a trig-first move. See a square around something, peel the square before touching the sine.',
        },
        {
          expression: "\\text{Outer: } F(u) = u^2, \\quad \\text{Inner: } u = \\sin x",
          annotation: 'Identify the layers.',
        },
        {
          expression: "F'(u) = 2u, \\quad u' = \\cos x",
          annotation: 'Differentiate each layer.',
        },
        {
          expression: "f'(x) = 2\\sin x \\cdot \\cos x",
          annotation: 'Chain rule: 2u evaluated at u = sin x gives 2 sin x, times the inner derivative cos x.',
        },
        {
          expression: "= \\sin(2x)",
          annotation: 'Apply the double angle identity: 2 sin(x) cos(x) = sin(2x). This is a nice simplification, though both forms are correct.',
        },
      ],
      conclusion: 'f\'(x) = 2 sin(x) cos(x) = sin(2x). The double angle identity provides a beautiful simplification here.',
    },
    {
      id: 'ch2-003-ex5',
      title: 'Composition of Two Trig Functions',
      problem: "f(x) = \\cos(\\sin x). \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Outer: } F(u) = \\cos u, \\quad \\text{Inner: } u = \\sin x",
          annotation: 'Both outer and inner functions are trigonometric. The outer is cosine (acting on the result of sine) and the inner is sine.',
        },
        {
          expression: "F'(u) = -\\sin u, \\quad u' = \\cos x",
          annotation: 'Differentiate each layer: derivative of cosine is negative sine; derivative of sin x is cos x.',
        },
        {
          expression: "f'(x) = -\\sin(\\sin x) \\cdot \\cos x",
          annotation: 'Apply chain rule: outer derivative -sin(u) evaluated at u = sin x gives -sin(sin x), times the inner derivative cos x.',
        },
      ],
      conclusion: 'f\'(x) = -cos(x) sin(sin x). Note that the argument of the outermost sine is sin(x), not x — we evaluate the outer derivative at the inner function, preserving the inner function completely.',
    },
    {
      id: 'ch2-003-ex6',
      title: 'Product Rule with Chain Rule: Secant Times Tangent',
      problem: "f(x) = \\sec(5x)\\cdot\\tan(5x). \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Let } u(x) = \\sec(5x), \\quad v(x) = \\tan(5x)",
          annotation: 'This is a product of two functions, each requiring the chain rule.',
        },
        {
          expression: "u'(x) = \\sec(5x)\\tan(5x) \\cdot 5 = 5\\sec(5x)\\tan(5x)",
          annotation: 'Differentiate sec(5x) using the chain rule: d/dx[sec u] = sec u tan u times u\'. Here u = 5x and u\' = 5.',
        },
        {
          expression: "v'(x) = \\sec^2(5x) \\cdot 5 = 5\\sec^2(5x)",
          annotation: 'Differentiate tan(5x) using the chain rule: d/dx[tan u] = sec\u00b2 u times u\'. Here u = 5x and u\' = 5.',
        },
        {
          expression: "f'(x) = u'v + uv' = [5\\sec(5x)\\tan(5x)]\\cdot\\tan(5x) + \\sec(5x)\\cdot[5\\sec^2(5x)]",
          annotation: 'Apply the product rule.',
        },
        {
          expression: "= 5\\sec(5x)\\tan^2(5x) + 5\\sec^3(5x)",
          annotation: 'Expand: tan(5x) \u00b7 tan(5x) = tan\u00b2(5x) and sec(5x) \u00b7 sec\u00b2(5x) = sec\u00b3(5x).',
        },
        {
          expression: "= 5\\sec(5x)[\\tan^2(5x) + \\sec^2(5x)]",
          annotation: 'Factor out 5 sec(5x) from both terms.',
        },
      ],
      conclusion: 'f\'(x) = 5 sec(5x)[tan\u00b2(5x) + sec\u00b2(5x)]. This can be further simplified using the identity tan\u00b2(x) + 1 = sec\u00b2(x), giving tan\u00b2+sec\u00b2 = sec\u00b2-1+sec\u00b2 = 2sec\u00b2-1.',
    },
    {
      id: 'ch2-003-ex7',
      title: 'Quotient Rule with Sine',
      problem: "f(x) = \\frac{1+\\sin x}{1-\\sin x}. \\text{ Find } f'(x) \\text{ and simplify.}",
      steps: [
        {
          expression: "\\text{Numerator: } N = 1+\\sin x, \\quad \\text{Denominator: } D = 1-\\sin x",
          annotation: 'Identify numerator and denominator for the quotient rule.',
        },
        {
          expression: "N' = \\cos x, \\quad D' = -\\cos x",
          annotation: 'Differentiate numerator: d/dx[1+sin x] = cos x. Differentiate denominator: d/dx[1-sin x] = -cos x.',
        },
        {
          expression: "f'(x) = \\frac{N'D - ND'}{D^2} = \\frac{\\cos x(1-\\sin x) - (1+\\sin x)(-\\cos x)}{(1-\\sin x)^2}",
          annotation: 'Logic narrator: run quotient rule cleanly, then hunt for identity-style collapse opportunities in the numerator to escape complexity.',
        },
        {
          expression: "= \\frac{\\cos x(1-\\sin x) + \\cos x(1+\\sin x)}{(1-\\sin x)^2}",
          annotation: 'Distribute the negative sign on the second term: -(1+sin x)(-cos x) = +cos x(1+sin x).',
        },
        {
          expression: "= \\frac{\\cos x[(1-\\sin x) + (1+\\sin x)]}{(1-\\sin x)^2}",
          annotation: 'Factor cos x from both terms in the numerator.',
        },
        {
          expression: "= \\frac{\\cos x \\cdot 2}{(1-\\sin x)^2} = \\frac{2\\cos x}{(1-\\sin x)^2}",
          annotation: 'Simplify inside the brackets: (1-sin x)+(1+sin x) = 2. The sin x terms cancel.',
        },
      ],
      conclusion: 'f\'(x) = 2cos(x) / (1-sin x)\u00b2. The simplification of the numerator was made possible by factoring out cos x.',
    },
    {
      id: 'ch2-003-ex8',
      title: 'Tangent Line to Sine Curve',
      problem: "\\text{Find the equation of the tangent line to } f(x) = \\sin x \\text{ at } x = \\pi/3.",
      steps: [
        {
          expression: "f'(x) = \\cos x",
          annotation: 'The derivative of sin x is cos x — no chain rule needed since the argument is just x.',
        },
        {
          expression: "f'(\\pi/3) = \\cos(\\pi/3) = \\frac{1}{2}",
          annotation: 'Logic narrator: this derivative value is the steerable slope. Plugging x = pi/3 locks the steering wheel to one tangent line.',
        },
        {
          expression: "f(\\pi/3) = \\sin(\\pi/3) = \\frac{\\sqrt{3}}{2}",
          annotation: 'Find the y-coordinate of the tangent point. From the unit circle, sin(\u03c0/3) = \u221a3/2.',
        },
        {
          expression: "y - \\frac{\\sqrt{3}}{2} = \\frac{1}{2}\\left(x - \\frac{\\pi}{3}\\right)",
          annotation: 'Write in point-slope form with point (\u03c0/3, \u221a3/2) and slope 1/2.',
        },
        {
          expression: "y = \\frac{1}{2}x - \\frac{\\pi}{6} + \\frac{\\sqrt{3}}{2}",
          annotation: 'Distribute 1/2 across (x - \u03c0/3) = x - \u03c0/3, giving (1/2)x - \u03c0/6, then add \u221a3/2.',
        },
      ],
      conclusion: 'The tangent line is y = (1/2)x + (\u221a3/2 - \u03c0/6). At x = \u03c0/3 \u2248 1.047, the sine curve has slope exactly 1/2 — the curve is rising gently as it approaches its peak at x = \u03c0/2.',
    },
  ],

  challenges: [
    {
      id: 'ch2-003-ch1',
      difficulty: 'easy',
      problem: '\\text{Differentiate } f(x) = 3\\cos x - 4\\sin x.',
      hint: 'Differentiate each trig term separately: d/dx[cos x] = -sin x and d/dx[sin x] = cos x, then keep the constants 3 and -4 attached.',
      walkthrough: [
        {
          expression: "f'(x) = 3 \\cdot \\frac{d}{dx}[\\cos x] - 4 \\cdot \\frac{d}{dx}[\\sin x]",
          annotation: 'Apply the sum rule and constant multiple rule.',
        },
        {
          expression: "= 3(-\\sin x) - 4(\\cos x)",
          annotation: 'Use d/dx[cos x] = -sin x and d/dx[sin x] = cos x.',
        },
        {
          expression: "= -3\\sin x - 4\\cos x",
          annotation: 'Final simplified form.',
        },
      ],
      answer: "f'(x) = -3\\sin x - 4\\cos x",
    },
    {
      id: 'ch2-003-ch2',
      difficulty: 'medium',
      problem: 'Prove from the quotient rule that \\dfrac{d}{dx}[\\sec x] = \\sec x \\tan x.',
      hint: 'Write sec x = 1/cos x and apply the quotient rule with numerator 1 and denominator cos x.',
      walkthrough: [
        {
          expression: "\\sec x = \\frac{1}{\\cos x}",
          annotation: 'Write secant in terms of cosine.',
        },
        {
          expression: "\\frac{d}{dx}\\left[\\frac{1}{\\cos x}\\right] = \\frac{0 \\cdot \\cos x - 1 \\cdot (-\\sin x)}{\\cos^2 x}",
          annotation: 'Apply the quotient rule: numerator is (N\'D - ND\'). N = 1, N\' = 0, D = cos x, D\' = -sin x.',
        },
        {
          expression: "= \\frac{\\sin x}{\\cos^2 x}",
          annotation: 'Simplify numerator: 0\u00b7cos x = 0 and -1\u00b7(-sin x) = sin x.',
        },
        {
          expression: "= \\frac{\\sin x}{\\cos x} \\cdot \\frac{1}{\\cos x} = \\tan x \\cdot \\sec x",
          annotation: 'Split the fraction: sin x / cos x = tan x and 1/cos x = sec x.',
        },
        {
          expression: "= \\sec x \\tan x \\quad \\blacksquare",
          annotation: 'Rewrite in standard order.',
        },
      ],
      answer: '\\dfrac{d}{dx}[\\sec x] = \\sec x \\tan x',
    },
    {
      id: 'ch2-003-ch3',
      difficulty: 'hard',
      problem: '\\text{Find all } x \\in [0, 2\\pi] \\text{ where } f(x) = 2\\sin x - \\sin(2x) \\text{ has a horizontal tangent line.}',
      hint: 'Set f\'(x) = 0. You will need the chain rule for sin(2x). Then use the identity sin(2x) = 2sin(x)cos(x) or factor the resulting equation. There are 4 solutions in [0, 2\u03c0].',
      walkthrough: [
        {
          expression: "f'(x) = 2\\cos x - \\frac{d}{dx}[\\sin(2x)]",
          annotation: 'Differentiate term by term.',
        },
        {
          expression: "\\frac{d}{dx}[\\sin(2x)] = \\cos(2x) \\cdot 2 = 2\\cos(2x)",
          annotation: 'Apply the chain rule to sin(2x): outer derivative is cosine, inner is 2x with derivative 2.',
        },
        {
          expression: "f'(x) = 2\\cos x - 2\\cos(2x)",
          annotation: 'Combine the derivatives.',
        },
        {
          expression: "f'(x) = 0 \\implies 2\\cos x - 2\\cos(2x) = 0 \\implies \\cos x = \\cos(2x)",
          annotation: 'Set equal to zero and divide by 2.',
        },
        {
          expression: "\\cos(2x) = 2\\cos^2 x - 1",
          annotation: 'Use the double angle identity to express cos(2x) in terms of cos(x).',
        },
        {
          expression: "\\cos x = 2\\cos^2 x - 1 \\implies 2\\cos^2 x - \\cos x - 1 = 0",
          annotation: 'Substitute and rearrange into a quadratic in cos x.',
        },
        {
          expression: "(2\\cos x + 1)(\\cos x - 1) = 0",
          annotation: 'Factor the quadratic: check that (2u+1)(u-1) = 2u\u00b2-u-1. —',
        },
        {
          expression: "\\cos x = -\\frac{1}{2} \\quad \\text{or} \\quad \\cos x = 1",
          annotation: 'Set each factor equal to zero.',
        },
        {
          expression: "\\cos x = 1 \\implies x = 0 \\text{ (and } 2\\pi \\text{, but that\'s the endpoint)}",
          annotation: 'In [0, 2\u03c0], cos x = 1 at x = 0 (and at 2\u03c0 = 0 again at the boundary).',
        },
        {
          expression: "\\cos x = -\\tfrac{1}{2} \\implies x = \\frac{2\\pi}{3} \\text{ or } x = \\frac{4\\pi}{3}",
          annotation: 'In [0, 2\u03c0], cos x = -1/2 at x = 2\u03c0/3 (second quadrant, reference angle \u03c0/3) and x = 4\u03c0/3 (third quadrant).',
        },
        {
          expression: "x \\in \\left\\{0,\\; \\frac{2\\pi}{3},\\; \\frac{4\\pi}{3}\\right\\} \\text{ on } [0,2\\pi]",
          annotation: 'Collect all solutions. (x = 2\u03c0 is the same point as x = 0 on the circle, included if the interval is closed.)',
        },
      ],
      answer: 'x = 0,\\; \\dfrac{2\\pi}{3},\\; \\dfrac{4\\pi}{3} \\; (\\text{and } 2\\pi \\text{ if counted})',
    },
  ],

  crossRefs: [
    { lessonSlug: 'chain-rule', label: 'The Chain Rule', context: 'Every trig derivative formula extends to compositions via the chain rule. Most applied trig differentiation involves the chain rule.' },
    { lessonSlug: 'tangent-problem', label: 'Limit Definition', context: 'The proof of d/dx[sin x] = cos x uses the limit definition and the fundamental trig limits.' },
    { lessonSlug: 'implicit-differentiation', label: 'Implicit Differentiation', context: 'Trig functions appear frequently in implicit equations; their derivatives are used in implicit differentiation.' },
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
    'completed-example-6',
    'completed-example-7',
    'completed-example-8',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
};

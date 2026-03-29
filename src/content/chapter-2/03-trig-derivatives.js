// FILE: src/content/chapter-2/03-trig-derivatives.js
export default {
  id: "ch2-003",
  slug: "trig-derivatives",
  chapter: 2,
  order: 5,
  title: "Derivatives of Trigonometric Functions",
  subtitle:
    "Why the slope of the sine curve is cosine — and deriving all six trig derivatives",
  tags: [
    "sine derivative",
    "cosine derivative",
    "tangent derivative",
    "trigonometric functions",
    "trig limits",
    "chain rule with trig",
  ],
  aliases:
    "section 3.5 derivatives trig functions formal proof sin cos tan cot sec csc limit definition derivative",

  spiral: {
    recoveryPoints: [
      { label: 'Chain Rule (Lesson 4)', note: 'Every trig derivative involving a composed argument — sin(g(x)), cos(g(x)) — requires the chain rule for its derivative. Without it the inner derivative is missing.' },
      { label: 'Unit Circle Definitions of sin/cos (Chapter 0/Trig)', note: 'The definitions sin(θ) = y-coordinate and cos(θ) = x-coordinate on the unit circle are the geometric engine behind the derivative formulas proved in this lesson.' },
    ],
    futureLinks: [
      { label: 'Exponential/Log Derivatives (next lesson)', note: 'Same toolkit — just applied to a different family of functions. The pattern of "one clean self-referential formula" appears again with e^x.' },
      { label: 'Implicit Differentiation (Lesson 9)', note: 'Equations like x·sin(y) = y·cos(x) require differentiating trig functions of y, which uses the chain rule with dy/dx — all the formulas from this lesson reappear.' },
    ],
  },

  hook: {
    question:
      "A point moves around the unit circle at constant angular speed. Its y-coordinate is y = sin(theta). When theta = 0, the point is at (1, 0) and is moving straight upward, so height increases as fast as possible. When theta = pi/2, the point is at (0, 1) moving sideways, so height is not changing at all. When theta = pi, the point is at (-1, 0) moving downward, so height decreases at maximum rate. These rates, 1, 0, and -1, are exactly cos(0), cos(pi/2), and cos(pi). Why does this happen for every angle?",
    realWorldContext:
      "Periodic phenomena dominate science and engineering: alternating current in electrical circuits, vibrations in mechanical systems, sound waves, ocean tides, the positions of planets. All of these are modeled using sine and cosine. To analyze how these quantities change — how quickly a current switches direction, how rapidly a spring approaches equilibrium, how fast a tide is rising — we need derivatives of trigonometric functions. The fact that d/dx[sin x] = cos x is not just elegant mathematics; it is the foundation of all oscillation and wave analysis.",
    previewVisualizationId: "TrigDerivativeSync",
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You now have a complete differentiation toolkit: power, product, quotient, and chain rules. That toolkit applies to any function — but we have only tested it on polynomials. This lesson and the next two apply the same toolkit to the three fundamental families of functions that appear throughout science and engineering: trigonometric functions (this lesson), exponential and logarithmic functions (next lesson), and inverse functions (the lesson after).',

      '**The central question of this lesson:** The sine function oscillates smoothly. At some angles it is rising fast, at others it is flat, and at others it is falling. Can we find a formula for that rate of change at every angle? The answer turns out to be startlingly clean: the rate of change of sin(θ) is cos(θ). The cosine curve IS the derivative of the sine curve. This lesson shows why — geometrically, analytically, and through the unit circle.',

      "Imagine tracing around the unit circle as the angle theta increases from 0. The y-coordinate follows the sine function. Let's watch what happens to the slope of the sine curve as theta varies.",
      "At theta = 0: the point (1, 0) is moving straight upward. The y-coordinate is increasing at maximum rate. The slope of sin(theta) is 1, and cos(0) = 1.",
      "At theta = pi/2: the point (0, 1) is moving horizontally. The y-coordinate is at a local maximum, so its instantaneous rate is 0. The slope is 0, and cos(pi/2) = 0.",
      "At theta = pi: the point (-1, 0) is moving straight downward. The y-coordinate decreases at maximum rate. The slope is -1, and cos(pi) = -1.",
      "This pattern is a theorem, not a coincidence: d/dtheta[sin(theta)] = cos(theta).",
      "Geometric proof bridge: position is (cos(theta), sin(theta)) and velocity is perpendicular to radius, so velocity has direction (-sin(theta), cos(theta)). The y-component of velocity is cos(theta), and that y-component is exactly d/dtheta[sin(theta)].",
      "Why the minus sign for cosine? As theta increases through the first quadrant, cosine tracks horizontal position moving left, so its rate of change is negative. That directional fact is d/dx[cos x] = -sin x.",
      "Expert intuition: each derivative is a 90-degree phase rotation of the trig wave. sin -> cos -> -sin -> -cos -> sin.",

      '**Where this is heading:** You now have derivatives for all six trig functions. The next lesson introduces the other great family: exponential and logarithmic functions. The highlight is e — the one base for which the exponential function literally equals its own derivative. That self-referential property is one of the most surprising facts in mathematics.',

      '**The 90-degree phase shift pattern — a cycle of four:** Each derivative of a trig function is a quarter-period (90-degree) shift of the wave. Starting from sin(x): its derivative is cos(x), which is sin(x) shifted left by π/2. The derivative of cos(x) is −sin(x), another 90-degree shift. The derivative of −sin(x) is −cos(x), and the derivative of −cos(x) returns to sin(x). So the cycle is sin → cos → −sin → −cos → sin, repeating every four derivatives. This means: to find the 47th derivative of sin(x), compute 47 mod 4 = 3, so the 47th derivative is −cos(x). This four-step cycle is unique to trigonometric functions and reflects the geometric fact that rotating the unit-circle velocity vector by 90 degrees four times returns to the original direction.',

      '**Chain rule with trig — the most important application:** Once you have d/dx[sin(x)] = cos(x) and d/dx[cos(x)] = −sin(x), the chain rule extends these to any composite argument. The pattern is: d/dx[sin(g(x))] = cos(g(x))·g\'(x) and d/dx[cos(g(x))] = −sin(g(x))·g\'(x). The outer derivative uses the trig formula as usual, but the result must be multiplied by the derivative of the inner function g\'(x). Example 1: d/dx[sin(3x)] = cos(3x)·3 = 3cos(3x). Example 2: d/dx[cos(x²)] = −sin(x²)·2x = −2x·sin(x²). Forgetting the inner derivative is the chain-trap in trig form — the same mistake isolated in the previous lesson now appears in trig context.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 6 of 10 — Act 3: Special Functions Begin',
        body: '**Previous:** Product + chain trap drill — the correct workflow for combining rules.\n**This lesson:** Trig derivatives — why the slope of sin(x) is cos(x), and all six trig derivative formulas.\n**Next:** Exponential and logarithmic derivatives — the self-referential property of e^x and the derivative of ln(x).',
      },
      {
        type: "insight",
        title: "Geometric Intuition: Unit Circle",
        body: "\\text{At } \\theta: \\text{slope of } \\sin\\theta = \\cos\\theta",
      },
      {
        type: "insight",
        title: "Velocity-Vector Proof in One Line",
        body: "\\vec r(\\theta)=(\\cos\\theta,\\sin\\theta),\\;\\vec r'(\\theta)=(-\\sin\\theta,\\cos\\theta)\\Rightarrow\\frac{d}{d\\theta}[\\sin\\theta]=\\cos\\theta",
      },
      {
        type: "insight",
        title: 'The "co-" Functions All Have Minus Signs',
        body: "\\frac{d}{dx}[\\cos x] = -\\sin x, \\quad \\frac{d}{dx}[\\csc x] = -\\csc x\\cot x, \\quad \\frac{d}{dx}[\\cot x] = -\\csc^2 x",
      },
      {
        type: "warning",
        title: "Chain Rule Trap: sin(x^2) vs sin^2(x)",
        body: "\\sin(x^2) \\neq (\\sin x)^2.\\; \\frac{d}{dx}[\\sin(x^2)] = 2x\\cos(x^2),\\; \\frac{d}{dx}[(\\sin x)^2] = 2\\sin x\\cos x",
      },
    ],
    visualizations: [
      {
        id: "InverseFunctionExplorer",
        title: "Inverse Function Explorer: Global vs Local Inverse",
        mathBridge:
          "Notice how geometry, slope data, and theorem language agree at the same time: reflected points encode inverse pairing, tangent slopes encode reciprocal rates, and the rigorous identity $\\left(f^{-1}\\right)'\\big(f(x_0)\\big)=1/f'(x_0)$ explains why that reciprocity is not visual coincidence. Use global vs local branch behavior to connect intuition (shape) to rigor (conditions for inverse differentiability).",
        caption:
          "Use the solver-style panel to inspect derivative, inverse behavior, and inverse-derivative logic before the rest of trig derivative content.",
      },
      {
        id: "TrigDerivativeSync",
        title: 'The "Moving Point" Deep Sync',
        mathBridge:
          "Before interacting, identify the four quadrants of the unit circle and predict: where is sin(θ) increasing fastest? Where does it flatten? Now drag θ and watch the slope value. At θ=0 the slope is 1 — which is cos(0)=1. At θ=π/2 the slope is 0 — which is cos(π/2)=0. At θ=π the slope is −1 — which is cos(π)=−1. Every value matches cos(θ). This is not coincidence — it is a theorem. The three panels stay synchronized because slope of sine = cosine at every single angle: the unit-circle panel shows where the point is, the middle panel shows the slope of the sine curve there, and the right panel shows the cosine value confirming the match.",
        caption:
          "Watch one angle drive three views at once: motion on the circle, slope of sine, and value of cosine. They stay synchronized because the sine slope is exactly cosine.",
      },
      {
        id: "Ch2_1_LighthouseAngle",
        title: "Story Viz — Lighthouse Angle",
        caption:
          "Book 2 Chapter 1 story visualization for angle measurement and trig setup.",
      },
      {
        id: "Ch2_2_TwoStars",
        title: "Story Viz — Two Stars",
        caption:
          "Book 2 Chapter 2 story visualization connecting triangles to angular relationships.",
      },
      {
        id: "Ch2_3_RippleAndWave",
        title: "Story Viz — Ripple and Wave",
        caption:
          "Book 2 Chapter 3 story visualization for amplitude, period, and phase shift.",
      },
      {
        id: "Ch2_4_AngleAddition",
        title: "Story Viz — Angle Addition",
        caption:
          "Book 2 Chapter 4 story visualization for sum-angle structure used in trig proofs.",
      },
      {
        id: "Ch2_5_SpinningWheel",
        title: "Story Viz — Spinning Wheel",
        caption:
          "Book 2 Chapter 5 story visualization for periodic motion and rotating-angle intuition.",
      },
      {
        id: "Ch2_6_EchoProblem",
        title: "Story Viz — Echo Problem",
        caption:
          "Book 2 Chapter 6 story visualization for inverse/trig modeling context before calculus.",
      },
      {
        id: "VelocityVectorProofLab",
        title: "Velocity Vector Lab (Zero Algebra Proof)",
        mathBridge:
          "A point at angle $\\theta$ on the unit circle has position $\\vec{r} = (\\cos\\theta, \\sin\\theta)$. Its velocity vector is perpendicular to the radius: $\\vec{r}' = (-\\sin\\theta, \\cos\\theta)$. The $y$-component of velocity is the rate of change of $y = \\sin\\theta$, and that component is $\\cos\\theta$. So $\\frac{d}{d\\theta}[\\sin\\theta] = \\cos\\theta$ — no limit algebra required.",
        caption:
          "Drag theta and verify: radius is (cos(theta), sin(theta)) while velocity is (-sin(theta), cos(theta)). The y-component of velocity is cos(theta), so d/dtheta[sin(theta)] = cos(theta).",
      },
      {
        id: "TrigMotionBridgeLab",
        title: "Trig Motion Bridge Lab",
        mathBridge:
          "The sign of $\\frac{d}{d\\theta}[\\sin\\theta]$ tells you whether $\\sin\\theta$ is increasing or decreasing. When the point moves upward (first quadrant), $\\sin$ increases so the derivative is positive. At the top ($\\theta = \\pi/2$), motion is horizontal so $\\frac{d}{d\\theta}[\\sin(\\pi/2)] = \\cos(\\pi/2) = 0$. Motion direction determines derivative sign.",
        caption:
          "Predict derivative signs from unit-circle motion and verify them instantly with the cosine readout.",
      },
      {
        id: "CoDirectionCompass",
        title: "Why the Minus Sign? Co-Direction Compass",
        mathBridge:
          "As $\\theta$ increases, the point moves counterclockwise. The $x$-coordinate ($\\cos\\theta$) moves left in the first and second quadrants — a decrease — so its rate of change is negative. That is why $\\frac{d}{dx}[\\cos x] = -\\sin x$. The minus sign is not arbitrary; it reflects which direction the horizontal component moves.",
        caption:
          "Track vertical and horizontal motion signs as theta increases. This turns d/dx[cos x] = -sin x into directional geometry.",
      },
      {
        id: "DerivativeCycleClock",
        title: "The Higher-Order Derivative Clock",
        mathBridge:
          "Each derivative shifts the trig wave by a quarter period: $\\sin x \\xrightarrow{d/dx} \\cos x \\xrightarrow{d/dx} -\\sin x \\xrightarrow{d/dx} -\\cos x \\xrightarrow{d/dx} \\sin x$. After 4 derivatives you return to the original — so $\\frac{d^4}{dx^4}[\\sin x] = \\sin x$. To find the $n$th derivative, use $n \\bmod 4$.",
        caption:
          "Click d/dx to take successive derivatives. Every 4 steps returns to sin(x). Think of each derivative as a 90-degree phase rotation.",
      },
      {
        id: "SpringOscillation",
        title: "Simple Harmonic Motion — Derivatives in Action",
        mathBridge:
          "Hooke's Law gives acceleration $a = -kx$, so the position satisfies $x''(t) = -\\omega^2 x(t)$. The solution is $x(t) = A\\cos(\\omega t)$. Its derivatives are $v(t) = x'(t) = -A\\omega\\sin(\\omega t)$ and $a(t) = x''(t) = -A\\omega^2\\cos(\\omega t)$. The spring obeys the same derivative cycle as the clock: each level is the derivative of the one above it.",
        caption:
          "Position x(t)=A cos(t), velocity v(t)=-A sin(t), acceleration a(t)=-A cos(t). Each graph is the derivative of the one above.",
      },
      {
        id: "TangentExplosion",
        title: "Why tan(x) Explodes — Quotient Rule Intuition",
        mathBridge:
          "$\\tan x = \\frac{\\sin x}{\\cos x}$. Near $x = \\pi/2$: $\\sin(\\pi/2) = 1$ while $\\cos(\\pi/2) = 0$, so the fraction $\\frac{1}{0}$ has a vertical asymptote. The derivative is $\\frac{d}{dx}[\\tan x] = \\sec^2 x = \\frac{1}{\\cos^2 x}$, which also blows up at $x = \\pi/2$ for the same reason — the denominator goes to zero.",
        caption:
          "Drag toward x = pi/2. cos(x) shrinks toward 0 while sin(x) stays near 1, so tan(x)=sin(x)/cos(x) explodes.",
      },
      {
        id: "QuotientRuleTanBuilder",
        title: "Interactive Quotient Rule Builder for tan(x)",
        mathBridge:
          "Applying the quotient rule $\\frac{d}{dx}\\left[\\frac{f}{g}\\right] = \\frac{f'g - fg'}{g^2}$ to $\\tan x = \\frac{\\sin x}{\\cos x}$ gives $\\frac{\\cos x \\cdot \\cos x - \\sin x \\cdot (-\\sin x)}{\\cos^2 x} = \\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x} = \\frac{1}{\\cos^2 x} = \\sec^2 x$. The Pythagorean identity is the key simplification.",
        caption:
          'Step through "low d high minus high d low" and watch cos²(x)+sin²(x) collapse to 1.',
      },
      {
        id: "NestedTrigMachine",
        title: "Nested Machine: sin(x²) vs sin²(x)",
        mathBridge:
          "Composition order matters: $\\sin(x^2)$ means square first, then sine, giving $\\frac{d}{dx}[\\sin(x^2)] = \\cos(x^2) \\cdot 2x$. But $\\sin^2(x) = (\\sin x)^2$ means sine first, then square, giving $\\frac{d}{dx}[(\\sin x)^2] = 2\\sin x \\cos x$. The chain rule multiplies by the inner derivative — which is completely different in each case.",
        caption:
          "Swap machine order to fix the most common chain-rule mistake. Square-then-sine and sine-then-square produce different derivatives.",
      },
      {
        id: "ChainRuleOnionLab",
        title: "Peel-the-Onion Chain Rule Lab",
        mathBridge:
          "For a composition $h(x) = f(g(x))$: the chain rule says $h'(x) = f'(g(x)) \\cdot g'(x)$. Peel the outermost layer, differentiate it (keeping the inside unchanged), then multiply by the derivative of the inside. Each peel corresponds to one multiplication in the chain.",
        caption:
          "Practice peeling compositions in order. The outside changes first, the inside stays intact, then multiply by the core derivative.",
      },
      {
        id: "SineAdditionProofBuilder",
        title: "Sine-of-a-Sum Proof Builder",
        mathBridge:
          "The limit proof of $\\frac{d}{dx}[\\sin x] = \\cos x$ uses two key trig limits: $\\lim_{h \\to 0} \\frac{\\sin h}{h} = 1$ and $\\lim_{h \\to 0} \\frac{\\cos h - 1}{h} = 0$. After expanding $\\sin(x+h)$ using the angle addition formula, these two limits turn the messy difference quotient into $\\cos x$.",
        caption:
          "Follow the formal proof with strategy tags. The colored limit blobs show exactly where the final cosine comes from.",
      },
      {
        id: "InverseBridgeTriangleLab",
        title: "Inverse Bridge: From sin to arcsin",
        mathBridge:
          "If $y = \\arcsin x$, then $\\sin y = x$. Implicit differentiation gives $\\cos y \\cdot \\frac{dy}{dx} = 1$, so $\\frac{dy}{dx} = \\frac{1}{\\cos y}$. Since $\\sin y = x$, a right triangle gives $\\cos y = \\sqrt{1-x^2}$. Therefore $\\frac{d}{dx}[\\arcsin x] = \\frac{1}{\\sqrt{1-x^2}}$. The triangle converts the trig back to algebra.",
        caption:
          "Use a right triangle plus implicit differentiation to derive d/dx[arcsin x] = 1/√(1−x²).",
      },
      {
        id: "ArcSinTriangleDerivationLab",
        title: "arcsin Derivative: Triangle + Meaning of Every Symbol",
        mathBridge:
          "We define y = arcsin(x), which means sin(y) = x. This converts an inverse trig function into a standard trig equation. Differentiating gives cos(y) * dy/dx = 1, so dy/dx = 1 / cos(y). A right triangle lets us rewrite cos(y) in terms of x: cos(y) = sqrt(1 - x^2). This yields dy/dx = 1 / sqrt(1 - x^2).",
        caption:
          "Every symbol is mapped: x is a ratio, arcsin returns an angle, the triangle converts angle back into algebra. The square root appears from geometry, not memorization. Domain restriction ensures the square root stays positive.",
      },
      {
        id: "UniversalInverseLab",
        title: "Inverse Reflection + Reciprocal Slopes (Calc Bridge)",
        mathBridge:
          "Before inverse trig formulas, lock in the general theorem: if points correspond by inverse reflection, tangent slopes are reciprocals at matched points. This is the geometric engine behind $\\frac{d}{dx}[f^{-1}(x)] = 1/f'(f^{-1}(x))$.",
        caption:
          "Try multiple invertible families and verify slope reciprocity at reflected points.",
      },
                                  ],
  },

  math: {
    prose: [
      "We state all six trigonometric derivative formulas. The first two (sine and cosine) are proved from the limit definition. The other four are derived using the quotient rule, since tan, csc, sec, and cot are all rational combinations of sine and cosine.",
      "Once we have d/dx[sin x] and d/dx[cos x], the quotient rule handles everything else. Recall that tan x = sin x / cos x, csc x = 1/sin x, sec x = 1/cos x, and cot x = cos x / sin x.",
      'The memory device for the four derived formulas: all three "co-" functions (cosine, cosecant, cotangent) have negative derivatives. The remaining three (sine, tangent, secant) have positive derivatives. Within each pair: sine and cosine swap (but cosine gets a minus sign), tangent becomes sec\u00b2, cotangent becomes -csc\u00b2, and secant and cosecant follow their own symmetric patterns.',
      "Every one of these formulas extends to compositions via the chain rule. For any differentiable function u = g(x): d/dx[sin(u)] = cos(u)\u00b7u', d/dx[cos(u)] = -sin(u)\u00b7u', d/dx[tan(u)] = sec\u00b2(u)\u00b7u', and so on. These extended forms are the versions used in 90% of calculations.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Six Trig Derivatives",
        body: "\\begin{aligned} \\frac{d}{dx}[\\sin x] &= \\cos x \\\\ \\frac{d}{dx}[\\cos x] &= -\\sin x \\\\ \\frac{d}{dx}[\\tan x] &= \\sec^2 x \\\\ \\frac{d}{dx}[\\csc x] &= -\\csc x\\cot x \\\\ \\frac{d}{dx}[\\sec x] &= \\sec x\\tan x \\\\ \\frac{d}{dx}[\\cot x] &= -\\csc^2 x \\end{aligned}",
      },
      {
        type: "theorem",
        title: "Six Trig Derivatives with Chain Rule",
        body: "\\begin{aligned} \\frac{d}{dx}[\\sin u] &= \\cos u \\cdot u' \\\\ \\frac{d}{dx}[\\cos u] &= -\\sin u \\cdot u' \\\\ \\frac{d}{dx}[\\tan u] &= \\sec^2 u \\cdot u' \\end{aligned}",
      },
      {
        type: "derivation",
        title: "Deriving d/dx[tan x] via Quotient Rule",
        body: "\\frac{d}{dx}\\left[\\frac{\\sin x}{\\cos x}\\right] = \\frac{\\cos x \\cdot \\cos x - \\sin x \\cdot (-\\sin x)}{\\cos^2 x} = \\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x} = \\frac{1}{\\cos^2 x} = \\sec^2 x",
      },
      {
        type: "insight",
        title: "Derivative as 90-Degree Phase Shift",
        body: "\\frac{d}{dx}[\\sin x]=\\cos x=\\sin\\left(x+\\frac{\\pi}{2}\\right),\\quad \\frac{d}{dx}[\\cos x]=-\\sin x=\\cos\\left(x+\\frac{\\pi}{2}\\right)",
      },
      {
        type: "derivation",
        title: "Deriving d/dx[csc x] via Quotient Rule",
        body: "\\frac{d}{dx}\\left[\\frac{1}{\\sin x}\\right] = \\frac{0 \\cdot \\sin x - 1 \\cdot \\cos x}{\\sin^2 x} = \\frac{-\\cos x}{\\sin^2 x} = -\\frac{1}{\\sin x}\\cdot\\frac{\\cos x}{\\sin x} = -\\csc x\\cot x",
      },
      {
        type: "derivation",
        title: "Deriving d/dx[cot x] via Quotient Rule",
        body: "\\frac{d}{dx}\\left[\\frac{\\cos x}{\\sin x}\\right] = \\frac{-\\sin x \\cdot \\sin x - \\cos x \\cdot \\cos x}{\\sin^2 x} = \\frac{-(\\sin^2 x + \\cos^2 x)}{\\sin^2 x} = \\frac{-1}{\\sin^2 x} = -\\csc^2 x",
      },
      {
        type: "derivation",
        title: "Deriving cos(arcsin x)",
        body: "\\theta = \\arcsin x \\Rightarrow \\sin\\theta = x = \\frac{\\text{opp}}{\\text{hyp}} = \\frac{x}{1}.\\\\ \\text{Then } \\text{adj} = \\sqrt{1 - x^2}.\\\\ \\cos(\\arcsin x) = \\frac{\\text{adj}}{\\text{hyp}} = \\sqrt{1 - x^2}.",
      },
      {
        type: "derivation",
        title: "Deriving sin(arccos x)",
        body: "\\theta = \\arccos x \\Rightarrow \\cos\\theta = x = \\frac{\\text{adj}}{\\text{hyp}} = \\frac{x}{1}.\\\\ \\text{Then } \\text{opp} = \\sqrt{1 - x^2}.\\\\ \\sin(\\arccos x) = \\frac{\\text{opp}}{\\text{hyp}} = \\sqrt{1 - x^2}.",
      },
      {
        type: "derivation",
        title: "Deriving tan(arcsin x)",
        body: "\\theta = \\arcsin x \\Rightarrow \\sin\\theta = x = \\frac{\\text{opp}}{\\text{hyp}} = \\frac{x}{1}.\\\\ \\text{Then } \\text{adj} = \\sqrt{1 - x^2}.\\\\ \\tan(\\arcsin x) = \\frac{\\text{opp}}{\\text{adj}} = \\frac{x}{\\sqrt{1 - x^2}}.",
      },
      {
        type: "derivation",
        title: "Deriving tan(arccos x)",
        body: "\\theta = \\arccos x \\Rightarrow \\cos\\theta = x = \\frac{\\text{adj}}{\\text{hyp}} = \\frac{x}{1}.\\\\ \\text{Then } \\text{opp} = \\sqrt{1 - x^2}.\\\\ \\tan(\\arccos x) = \\frac{\\text{opp}}{\\text{adj}} = \\frac{\\sqrt{1 - x^2}}{x}.",
      },
      {
        type: "derivation",
        title: "Deriving sec(arctan x)",
        body: "\\theta = \\arctan x \\Rightarrow \\tan\\theta = x = \\frac{\\text{opp}}{\\text{adj}} = \\frac{x}{1}.\\\\ \\text{Then } \\text{hyp} = \\sqrt{1 + x^2}.\\\\ \\sec(\\arctan x) = \\frac{\\text{hyp}}{\\text{adj}} = \\sqrt{1 + x^2}.",
      },
    ],
    visualizationId: "TrigDerivativeSync",
    visualizationProps: {},
  },

  rigor: {
    // Geometric proof steps — synced with SinDerivativeGeometric visualization
    proofSteps: [
      {
        expression: "P = (\\cos x,\\, \\sin x)",
        annotation: "Position vector on the unit circle at angle x.",
      },
      {
        expression: "\\vec{v} = (-\\sin x,\\, \\cos x)",
        annotation:
          "The velocity vector is perpendicular to the radius. For unit speed, this is the derivative of position.",
      },
      {
        expression: "\\frac{d}{dx}[\\sin x] = v_y = \\cos x",
        annotation:
          "The vertical rate of change of the point is the y-component of its velocity. This matches the height of the cosine graph at that angle.",
      },
      {
        expression: "\\frac{d}{dx}[\\cos x] = v_x = -\\sin x",
        annotation:
          "The horizontal rate of change is the x-component of velocity. Notice it points left (negative) for positive sine heights. This is why d/dx[cos x] = -sin x.",
      },
      {
        expression: "\\text{Tangent Geometry: } \\tan x",
        annotation:
          "Extend the radius to the line x=1. The height of this segment is tan(x).",
      },
      {
        expression:
          "\\text{Arc } dx \\xrightarrow{\\text{sec } x} \\text{Vertical } dy",
        annotation:
          "As the angle increases by dx, the tip of the tangent segment moves vertically. Because the segment is at distance 1, this change is amplified by sec^2 x.",
      },
      {
        expression: "\\frac{d}{dx}[\\tan x] = \\sec^2 x",
        annotation:
          "The geometric growth rate of the tangent segment is secant squared. No algebra, just projection geometry.",
      },
    ],
    visualizationId: "TrigDerivativeGeometric",
    visualizationProps: {},

    prose: [
      "We now prove d/dx[sin x] = cos x rigorously from the limit definition. This proof depends on two fundamental trigonometric limits, which we state but do not re-derive here (they were established in the limits chapter): lim(h\u21920) sin(h)/h = 1 and lim(h\u21920) (1 - cos h)/h = 0.",
      "PROOF that d/dx[sin x] = cos x: Using the limit definition, d/dx[sin x] = lim(h\u21920) [sin(x+h) - sin(x)] / h. Apply the sine addition formula: sin(x+h) = sin(x)cos(h) + cos(x)sin(h). So the numerator becomes: sin(x)cos(h) + cos(x)sin(h) - sin(x) = sin(x)[cos(h) - 1] + cos(x)sin(h). Dividing by h: sin(x) \u00b7 [cos(h)-1]/h + cos(x) \u00b7 sin(h)/h.",
      "Use the live-link panel below while reading this line: hover cos(x)\u00b7sin(h)/h to glow the vertical velocity arrow, and hover sin(x)\u00b7(cos(h)-1)/h to blink the horizontal correction that vanishes as h approaches 0.",
      "As h \u2192 0: the first term has sin(x) (a constant with respect to h) times [cos(h)-1]/h. Rearranging, [cos(h)-1]/h = -(1-cos h)/h \u2192 -0 = 0. The second term has cos(x) (constant) times sin(h)/h \u2192 1. Therefore the entire expression approaches sin(x)\u00b70 + cos(x)\u00b71 = cos(x). This completes the proof.",
      "PROOF that d/dx[cos x] = -sin x: Using the limit definition with the cosine addition formula cos(x+h) = cos(x)cos(h) - sin(x)sin(h): [cos(x+h)-cos(x)]/h = cos(x)\u00b7[cos(h)-1]/h - sin(x)\u00b7sin(h)/h. As h\u21920, the first term approaches cos(x)\u00b70 = 0 and the second approaches sin(x)\u00b71 = sin(x). So d/dx[cos x] = -sin(x). The minus sign comes from the minus sign in the cosine addition formula.",
      "The two key limits sin(h)/h \u2192 1 and (1-cos h)/h \u2192 0 as h \u2192 0 are the real engine of these proofs. The first was established geometrically by the squeeze theorem (the arc length h is squeezed between sin h and tan h for small h > 0). The second follows from the first via the identity (1-cos h)/h = sin\u00b2(h) / [h(1+cos h)] = [sin(h)/h] \u00b7 [sin(h)/(1+cos h)] \u2192 1\u00b70/2 = 0.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Fundamental Trig Limits",
        body: "\\lim_{h\\to 0}\\frac{\\sin h}{h} = 1 \\qquad \\lim_{h\\to 0}\\frac{1-\\cos h}{h} = 0",
      },
      {
        type: "insight",
        title: "Proof Strategy Tags",
        body: "\\text{Isolation: expand }\\sin(x+h).\\;\\text{Hunting: group }\\frac{\\sin h}{h}\\text{ and }\\frac{\\cos h-1}{h}.\\;\\text{Survival: cosine term times 1 remains.}",
      },
      {
        type: "proof",
        title: "Proof: d/dx[sin x] = cos x",
        body: "\\frac{d}{dx}[\\sin x] = \\lim_{h\\to 0}\\frac{\\sin(x+h)-\\sin x}{h} = \\lim_{h\\to 0}\\left[\\sin x\\cdot\\frac{\\cos h - 1}{h} + \\cos x \\cdot\\frac{\\sin h}{h}\\right] = \\sin x\\cdot 0 + \\cos x\\cdot 1 = \\cos x",
      },
    ],
    visualizations: [
      {
        id: "ProofCircleLinkLab",
        title: "Live-Link: Proof Terms ↔ Circle Geometry",
        mathBridge:
          "The two proof terms $\\sin x \\cdot \\frac{\\cos h - 1}{h}$ and $\\cos x \\cdot \\frac{\\sin h}{h}$ each correspond to visible geometry on the circle. Hover either term to highlight it. As $h \\to 0$, the horizontal correction (amber, vanishing) shrinks away and only the vertical velocity component (red, surviving) remains — giving $\\cos x$.",
        caption:
          "Hover the proof terms to light up the matching geometry. Use the theta and h sliders to verify at any angle.",
      },
    ],
  },

  examples: [
    {
      id: "ch2-003-ex1",
      title: "Sine with Chain Rule",
      problem: "f(x) = \\sin(3x). \\text{ Find } f'(x).",
      steps: [
        {
          expression:
            "\\text{Outer: } F(u) = \\sin(u), \\quad \\text{Inner: } u = 3x",
          annotation:
            "Identify the composition. The outer function is sine; the inner is 3x.",
          strategyTitle: "Identify the composite structure: outer = sin, inner = 3x",
          checkpoint: "Before differentiating, predict: is the argument of sin just plain x, or something else? Does that difference change which rules you need?",
          hints: [
            "Level 1: When a trig function's argument is not plain x, the chain rule is required. Spotting the inner function before differentiating prevents the most common trig derivative mistake.",
            "Level 2: The Pythagorean identity sin²x + cos²x = 1 is not needed here — this step is purely about recognising the layered structure (composition) before touching any derivative.",
            "Level 3: On the unit circle, sin(3x) traces the y-coordinate three times faster than sin(x). The factor of 3 that will appear in the derivative reflects that speed — it is the geometric meaning of the inner derivative.",
          ],
        },
        {
          expression: "F'(u) = \\cos(u), \\quad u' = 3",
          annotation:
            "Derivative of sine is cosine; derivative of the inner function 3x is 3.",
          strategyTitle: "Apply d/dx[sin(u)] = cos(u) · u' (chain rule): outer gives cos, inner gives 3",
          checkpoint: "Predict the sign of F'(u): is the derivative of sine positive or negative? Does the inner derivative u' = 3 change the sign, or only the magnitude?",
          hints: [
            "Level 1: The trig derivative rule is d/dx[sin x] = cos x — the derivative of sine is cosine, always positive on (0, π/2). Remember this paired rule: d/dx[cos x] = -sin x (note the negative sign).",
            "Level 2: No trig identity is needed here — the inner function 3x is linear, so its derivative 3 is just a constant multiplier. The sign of the final answer is determined by cos(3x), not by the inner derivative.",
            "Level 3: Geometrically, on the unit circle the rate of change of the y-coordinate (sin) equals the x-coordinate (cos). The inner derivative 3 scales this rate — sin(3x) oscillates 3× faster, so its slope is 3× steeper at every point.",
          ],
        },
        {
          expression: "f'(x) = \\cos(3x) \\cdot 3 = 3\\cos(3x)",
          annotation:
            "Apply chain rule: outer derivative (cosine, evaluated at inner) times inner derivative (3). The argument of cosine is the same as the original argument of sine.",
          strategyTitle: "Assemble the chain rule result: cos(3x) · 3 = 3cos(3x)",
          checkpoint: "Check the argument: the derivative of sin(3x) should produce cos of the same inner expression 3x. Did you keep the argument 3x inside the cosine, or did you accidentally simplify to cos(x)?",
          hints: [
            "Level 1: The chain rule assembly is: outer derivative evaluated at the inner × inner derivative. So d/dx[sin(3x)] = cos(3x) · 3. The inner function 3x stays intact inside cosine — it is not differentiated again.",
            "Level 2: No trig identity is needed at this stage — the result 3cos(3x) is already fully simplified. The double-angle identity would be relevant if the original function were sin²(x), not sin(3x).",
            "Level 3: Verify numerically: f(x) = sin(3x) at x = 0, the slope should be 3cos(0) = 3. A finite-difference check (f(0.001) - f(0))/0.001 = sin(0.003)/0.001 ≈ 3.000, confirming the factor of 3 is correct.",
          ],
        },
      ],
      conclusion:
        'f\'(x) = 3cos(3x). The chain rule "multiplies in" the factor of 3 from the inner function. Without the chain rule, the answer would be cos(3x) — missing the crucial factor of 3.',
    },
    {
      id: "ch2-003-ex2",
      title: "Product Rule with Cosine",
      problem: "f(x) = x^2 \\cos(x). \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Identify: } u(x) = x^2, \\quad v(x) = \\cos x",
          annotation:
            "This is a product of two functions. Assign the first factor and second factor for the product rule.",
          strategyTitle: "Product rule setup: identify u = x² and v = cos x",
          checkpoint: "Before differentiating, predict: does v = cos x need the chain rule, or is its argument plain x? Will v' be positive or negative?",
          hints: [
            "Level 1: The product rule applies whenever f(x) = u(x)·v(x). Labelling u and v first — before computing any derivatives — is the key habit that prevents the chain-trap mistake.",
            "Level 2: v = cos x has plain x as its argument, so no chain rule is needed here. If it were cos(3x), the chain rule would add a factor of 3. This example is the simpler case.",
            "Level 3: On the unit circle, cos(x) is the x-coordinate. The derivative -sin(x) is negative on (0, π) because the x-coordinate is decreasing there — the sign of v' has direct geometric meaning.",
          ],
        },
        {
          expression: "u'(x) = 2x, \\quad v'(x) = -\\sin x",
          annotation:
            "Differentiate each factor separately. d/dx[x\u00b2] = 2x by the power rule; d/dx[cos x] = -sin x.",
          strategyTitle: "Apply d/dx[cos x] = -sin x: note the negative sign",
          checkpoint: "Confirm the sign of v': is d/dx[cos x] equal to +sin x or -sin x? Why does the negative sign appear?",
          hints: [
            "Level 1: The paired trig derivative rules are d/dx[sin x] = cos x (positive) and d/dx[cos x] = -sin x (negative). The negative sign on the cosine derivative is one of the most common sign errors in trig calculus.",
            "Level 2: The Pythagorean identity sin²x + cos²x = 1 is not directly used here, but it is the reason d/dx[cos x] = -sin x — differentiating both sides of the identity gives 2sin x cos x + 2cos x(-sin x) = 0, which is consistent.",
            "Level 3: Geometrically, cosine starts at its maximum at x = 0 and decreases — so its derivative at x = 0 should be 0 (flat). Check: v'(0) = -sin(0) = 0. ✓ At x = π/2, cosine is decreasing most steeply: v'(π/2) = -sin(π/2) = -1, the steepest negative slope.",
          ],
        },
        {
          expression: "f'(x) = u'v + uv' = (2x)(\\cos x) + (x^2)(-\\sin x)",
          annotation:
            "Apply the product rule: (first)(second)' + (first)'(second).",
          strategyTitle: "Assemble u'v + uv' with the correct negative sign from v'",
          checkpoint: "Before simplifying, verify the sign of the second term: u = x², v' = -sin x, so uv' = x²·(-sin x). Is the second term positive or negative?",
          hints: [
            "Level 1: Product rule assembly: Term 1 = u'·v = 2x·cos x; Term 2 = u·v' = x²·(-sin x). Both ingredients are complete — no chain rule was needed on v because its argument was plain x.",
            "Level 2: The negative sign belongs to v' = -sin x, not to the product rule template itself. The template h' = u'v + uv' always uses addition; the subtraction that appears in the simplified form comes from the negative sign in v'.",
            "Level 3: No trig identity is needed for assembly. If the argument of cosine had been a function g(x) instead of plain x, the chain rule would have added a factor of g'(x) to v'. In this example g(x) = x, g'(x) = 1, so the chain rule multiplier is invisible.",
          ],
        },
        {
          expression: "= 2x\\cos x - x^2 \\sin x",
          annotation:
            "Simplify by writing the two terms separately. This is the fully simplified form.",
          strategyTitle: "Simplify: combine terms into standard form 2x cos x - x² sin x",
          checkpoint: "Is there a common factor in both terms? Could this expression be factored further? Predict the factored form before reading the next step.",
          hints: [
            "Level 1: Both terms are already simplified. The result 2x cos x - x² sin x is the standard fully-expanded form of the derivative.",
            "Level 2: No trig identity simplifies this further — sin and cos have different arguments (both are plain x, so the double-angle identity 2 sin x cos x = sin(2x) does not apply to these separated terms).",
            "Level 3: To locate critical points of f(x) = x² cos x, you would set f'(x) = 0: 2x cos x - x² sin x = 0. The factored form in the next step makes solving this equation easier.",
          ],
        },
        {
          expression: "= x(2\\cos x - x\\sin x)",
          annotation:
            "Optionally factor out x from both terms. This factored form can be useful for finding zeros.",
          strategyTitle: "Factor out x to reveal critical-point structure",
          checkpoint: "From the factored form x(2cos x - x sin x) = 0, what are the solutions? Is x = 0 always a critical point? What about the solutions from (2cos x - x sin x) = 0?",
          hints: [
            "Level 1: Factoring out x is optional — both forms are correct derivatives. Factoring is useful when you need to find zeros (critical points) or when the factored form matches a pattern needed in later work.",
            "Level 2: Setting f'(x) = 0 gives x = 0 or 2cos x = x sin x, i.e. 2/x = tan x (for x ≠ 0). This transcendental equation has infinitely many solutions that cannot be found in closed form — numerical methods are needed.",
            "Level 3: The factored form also connects to the unit circle: the factor (2cos x - x sin x) = 0 can be rewritten as tan x = 2/x, which geometrically describes intersections of the tangent curve with the hyperbola y = 2/x.",
          ],
        },
      ],
      conclusion:
        "f'(x) = 2x cos(x) - x\u00b2 sin(x). The product rule gives two terms: the first represents the rate of change from the x\u00b2 factor, and the second from the cos(x) factor.",
    },
    {
      id: "ch2-003-ex3",
      title: "Tangent with Chain Rule",
      problem: "f(x) = \\tan(x^2+1). \\text{ Find } f'(x).",
      steps: [
        {
          expression:
            "\\text{Outer: } F(u) = \\tan u, \\quad \\text{Inner: } u = x^2 + 1",
          annotation:
            "Identify the composition. The outer function is tangent; the inner is x\u00b2+1.",
          strategyTitle: "Decompose the composition: outer = tan, inner = x\u00b2+1",
          checkpoint: "Is the argument of tan just plain x, or something more? Does that change which rules you need?",
          hints: [
            "Level 1: When tan\u2019s argument is not plain x, chain rule is required. The inner function is x\u00b2+1 \u2014 not x \u2014 so the chain rule will add a factor of 2x in the final answer.",
            "Level 2: The derivative rule for tangent is d/dx[tan u] = sec\u00b2(u)\u00b7u\u2019. The sec\u00b2 comes from tan = sin/cos; the quotient rule on sin/cos produces 1/cos\u00b2 = sec\u00b2.",
            "Level 3: Numerically verify: f(x) = tan(x\u00b2+1) at x = 0 gives tan(1) \u2248 1.557. The derivative at x=0 should be sec\u00b2(1)\u00b72\u00b70 = 0 (since inner derivative 2x = 0 at x=0). Check: (tan(0.001\u00b2+1) - tan(1))/0.001 \u2248 0.000. \u2713",
          ],
        },
        {
          expression: "F'(u) = \\sec^2 u, \\quad u' = 2x",
          annotation:
            "The derivative of tan(u) is sec\u00b2(u). The inner derivative is 2x.",
          strategyTitle: "Apply d/dx[tan u] = sec\u00b2(u): where does sec\u00b2 come from?",
          checkpoint: "Can you derive d/dx[tan x] = sec\u00b2 x from the quotient rule on sin x / cos x? Try it before moving on.",
          hints: [
            "Level 1: tan x = sin x / cos x. Quotient rule: (cos x \u00b7 cos x - sin x \u00b7 (-sin x)) / cos\u00b2 x = (cos\u00b2x + sin\u00b2x)/cos\u00b2x = 1/cos\u00b2x = sec\u00b2x.",
            "Level 2: This derivation is the proof that d/dx[tan x] = sec\u00b2 x. Memorize the result but also know it follows from quotient rule on sin/cos.",
            "Level 3: The inner derivative u\u2019 = 2x is the derivative of x\u00b2+1 by the power rule. Always compute inner and outer derivatives separately before combining via chain rule.",
          ],
        },
        {
          expression: "f'(x) = \\sec^2(x^2+1) \\cdot 2x = 2x\\sec^2(x^2+1)",
          annotation:
            "Apply chain rule: outer derivative (sec\u00b2, evaluated at x\u00b2+1) times inner derivative (2x).",
          strategyTitle: "Assemble: sec\u00b2(x\u00b2+1) \u00b7 2x \u2014 keep the argument x\u00b2+1 inside sec\u00b2",
          checkpoint: "Why is the argument of sec\u00b2 still x\u00b2+1, not x? What would be wrong about writing 2x sec\u00b2(x)?",
          hints: [
            "Level 1: Chain rule: F\u2019(g(x)) \u00b7 g\u2019(x). Here F\u2019(u) = sec\u00b2(u) evaluated at u = x\u00b2+1 gives sec\u00b2(x\u00b2+1). The inner function x\u00b2+1 is preserved inside sec\u00b2.",
            "Level 2: Writing sec\u00b2(x) would mean you replaced u with x instead of u = x\u00b2+1 \u2014 that discards the inner function entirely. This is the chain-trap error.",
            "Level 3: Multiply 2x to the left by convention: 2x sec\u00b2(x\u00b2+1). Both orders are correct, but leading with the inner derivative coefficient is standard form.",
          ],
        },
      ],
      conclusion:
        "f'(x) = 2x sec\u00b2(x\u00b2+1). The derivative of tangent is always sec\u00b2, and when the argument is a function of x, the chain rule contributes the derivative of that argument.",
    },
    {
      id: "ch2-003-ex4",
      title: "Power of Sine — Chain Rule",
      problem: "f(x) = \\sin^2(x). \\text{ Find } f'(x).",
      steps: [
        {
          expression: "f(x) = (\\sin x)^2",
          annotation:
            "Logic narrator: this is a power-rule shell first, not a trig-first move. See a square around something, peel the square before touching the sine.",
          strategyTitle: "Rewrite: sin\u00b2x means (sin x)\u00b2 \u2014 outer = power, inner = trig",
          checkpoint: "Which operation acts LAST when evaluating sin\u00b2(x)? Is it \u2018taking the sine\u2019 or \u2018squaring\u2019? The last operation is the outer function.",
          hints: [
            "Level 1: sin\u00b2(x) is shorthand for (sin x)\u00b2. The squaring happens last \u2014 so outer = u\u00b2, inner = sin x. This is the opposite trap from sin(x\u00b2): there, the squaring is INSIDE the trig.",
            "Level 2: This is critical: sin(x\u00b2) has outer = sin, inner = x\u00b2. But sin\u00b2(x) = (sin x)\u00b2 has outer = u\u00b2, inner = sin x. The derivatives are completely different.",
            "Level 3: Numerically: at x = \u03c0/4, sin\u00b2(x) = 0.5, d/dx[sin\u00b2x] should be sin(2x) = sin(\u03c0/2) = 1. At the same point, d/dx[sin(x\u00b2)] = 2x cos(x\u00b2) = (\u03c0/2)cos(\u03c0\u00b2/16) \u2248 1.25. Completely different.",
          ],
        },
        {
          expression:
            "\\text{Outer: } F(u) = u^2, \\quad \\text{Inner: } u = \\sin x",
          annotation: "Identify the layers.",
          strategyTitle: "Set up chain rule: outer = u\u00b2, inner = sin x",
          checkpoint: "What is F\u2019(u) for F(u) = u\u00b2? What is u\u2019 for u = sin x?",
          hints: [
            "Level 1: F\u2019(u) = 2u by the power rule. u\u2019 = cos x by the trig derivative rule.",
            "Level 2: Keep them separate for now: F\u2019(u) = 2u and u\u2019 = cos x. Combine in the next step.",
            "Level 3: This is exactly the chain rule pattern from Lesson 2: d/dx[F(g(x))] = F\u2019(g(x))\u00b7g\u2019(x). Here F = u\u00b2, g = sin x.",
          ],
        },
        {
          expression: "F'(u) = 2u, \\quad u' = \\cos x",
          annotation: "Differentiate each layer.",
          strategyTitle: "Differentiate each layer independently",
          checkpoint: "Before combining: write out F\u2019(g(x)) by substituting u = sin x into 2u. What do you get?",
          hints: [
            "Level 1: F\u2019(u) = 2u. Evaluated at u = sin x: F\u2019(sin x) = 2 sin x. The inner derivative: u\u2019 = cos x.",
            "Level 2: The chain rule then gives 2 sin x \u00b7 cos x. This is the unsimplified form \u2014 valid and complete.",
            "Level 3: Recognizing 2 sin x cos x = sin(2x) is the bonus simplification in the next step. It uses the double-angle identity, which comes from the angle-addition formula for sine.",
          ],
        },
        {
          expression: "f'(x) = 2\\sin x \\cdot \\cos x",
          annotation:
            "Chain rule: 2u evaluated at u = sin x gives 2 sin x, times the inner derivative cos x.",
          strategyTitle: "Assemble via chain rule: 2 sin x \u00b7 cos x",
          checkpoint: "Is 2 sin x \u00b7 cos x a valid final answer? Or must you simplify to sin(2x)?",
          hints: [
            "Level 1: Both 2 sin x cos x and sin(2x) are correct. The double-angle form is more compact but 2 sin x cos x is equally valid on any exam.",
            "Level 2: The simplification uses the identity 2 sin\u03b8 cos\u03b8 = sin(2\u03b8). This identity comes from the sine addition formula: sin(A+B) = sin A cos B + cos A sin B with A = B = x.",
            "Level 3: In integration, you will prefer the form 2 sin x cos x because it suggests the u-substitution u = sin x: \u222b 2 sin x cos x dx = \u222b 2u du = u\u00b2 = sin\u00b2x + C.",
          ],
        },
        {
          expression: "= \\sin(2x)",
          annotation:
            "Apply the double angle identity: 2 sin(x) cos(x) = sin(2x). This is a nice simplification, though both forms are correct.",
          strategyTitle: "Apply double-angle identity: 2 sin x cos x = sin(2x)",
          checkpoint: "Where does the identity 2 sin x cos x = sin(2x) come from? Can you derive it from the sine addition formula?",
          hints: [
            "Level 1: sin(A+B) = sin A cos B + cos A sin B. Set A = B = x: sin(2x) = sin x cos x + cos x sin x = 2 sin x cos x.",
            "Level 2: This identity appears constantly in integration (Chapter 4). Recognizing it now saves work later: \u222b sin(2x) dx = -cos(2x)/2 + C.",
            "Level 3: Verify numerically: at x = \u03c0/4, sin(2\u00b7\u03c0/4) = sin(\u03c0/2) = 1. And 2 sin(\u03c0/4) cos(\u03c0/4) = 2\u00b7(1/\u221a2)\u00b7(1/\u221a2) = 2\u00b71/2 = 1. \u2713",
          ],
        },
      ],
      conclusion:
        "f'(x) = 2 sin(x) cos(x) = sin(2x). The double angle identity provides a beautiful simplification here.",
    },
    {
      id: "ch2-003-ex5",
      title: "Composition of Two Trig Functions",
      problem: "f(x) = \\cos(\\sin x). \\text{ Find } f'(x).",
      steps: [
        {
          expression:
            "\\text{Outer: } F(u) = \\cos u, \\quad \\text{Inner: } u = \\sin x",
          annotation:
            "Both outer and inner functions are trigonometric. The outer is cosine (acting on the result of sine) and the inner is sine.",
          strategyTitle: "Both functions are trig \u2014 outer = cos, inner = sin",
          checkpoint: "What acts last when evaluating cos(sin x)? First you compute sin x, then you take the cosine of that result. Which is outer?",
          hints: [
            "Level 1: The last operation is \u2018take cosine of \u2026\u2019. So outer = cos(u), inner = sin x. This is a composition of two trig functions \u2014 chain rule is required.",
            "Level 2: The chain rule does not care what the functions are, only their order of composition. Outer derivative times inner derivative, always.",
            "Level 3: cos(sin x) oscillates within [\u22121, 1] but its oscillation rate varies \u2014 fastest where |cos x| is largest (near x = 0 and \u03c0), zero where cos x = 0 (at x = \u03c0/2).",
          ],
        },
        {
          expression: "F'(u) = -\\sin u, \\quad u' = \\cos x",
          annotation:
            "Differentiate each layer: derivative of cosine is negative sine; derivative of sin x is cos x.",
          strategyTitle: "d/dx[cos u] = \u2212sin u: the outer derivative carries a negative sign",
          checkpoint: "The derivative of cosine is negative sine. Why negative? Can you verify using the unit-circle velocity-vector argument?",
          hints: [
            "Level 1: d/dx[cos x] = \u2212sin x. The negative sign appears because cosine is decreasing on (0, \u03c0) \u2014 it starts at its maximum (1) and decreases, so its derivative must start negative.",
            "Level 2: Unit circle: the position vector is (cos\u03b8, sin\u03b8). The velocity vector (derivative) is (\u2212sin\u03b8, cos\u03b8). The x-component is \u2212sin x \u2014 that\u2019s d/dx[cos x].",
            "Level 3: The inner derivative u\u2019 = cos x comes from d/dx[sin x] = cos x. Note: inner here is sin x \u2014 the trig function whose derivative is POSITIVE cosine, unlike the outer function (cosine) whose derivative is NEGATIVE sine.",
          ],
        },
        {
          expression: "f'(x) = -\\sin(\\sin x) \\cdot \\cos x",
          annotation:
            "Apply chain rule: outer derivative -sin(u) evaluated at u = sin x gives -sin(sin x), times the inner derivative cos x.",
          strategyTitle: "Assemble: \u2212sin(sin x) \u00b7 cos x \u2014 inner function preserved inside outer derivative",
          checkpoint: "Why is the argument of the outermost sin still \u2018sin x\u2019 and not just \u2018x\u2019?",
          hints: [
            "Level 1: F\u2019(u) = \u2212sin(u). Evaluate at u = sin x: F\u2019(sin x) = \u2212sin(sin x). The argument is sin x, not x. Multiplied by inner derivative cos x gives the final answer.",
            "Level 2: This is the key chain rule preservation rule: when evaluating F\u2019(g(x)), replace u with the ENTIRE inner function g(x). Never simplify g(x) inside F\u2019 before evaluation.",
            "Level 3: Verify: at x = 0, f(x) = cos(sin 0) = cos(0) = 1. f\u2019(0) = \u2212sin(sin 0) \u00b7 cos(0) = \u2212sin(0) \u00b7 1 = 0. This makes sense: x = 0 is near a local max of cos(sin x) (since sin x = 0 is an extremum of cos), so slope should be 0.",
          ],
        },
      ],
      conclusion:
        "f'(x) = -cos(x) sin(sin x). Note that the argument of the outermost sine is sin(x), not x — we evaluate the outer derivative at the inner function, preserving the inner function completely.",
    },
    {
      id: "ch2-003-ex6",
      title: "Product Rule with Chain Rule: Secant Times Tangent",
      problem: "f(x) = \\sec(5x)\\cdot\\tan(5x). \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Let } u(x) = \\sec(5x), \\quad v(x) = \\tan(5x)",
          annotation:
            "This is a product of two functions, each requiring the chain rule.",
          strategyTitle: "Product rule setup: u = sec(5x), v = tan(5x) \u2014 both need chain rule",
          checkpoint: "Does each factor require the chain rule? What is the inner function for both sec(5x) and tan(5x)?",
          hints: [
            "Level 1: Both sec(5x) and tan(5x) have inner function 5x (not plain x), so both require chain rule when differentiating. The outer product rule structure is u\u2019v + uv\u2019.",
            "Level 2: Identify the four derivative rules needed: product rule (outer structure), chain rule for sec(5x), chain rule for tan(5x). That is three rule applications in a single problem.",
            "Level 3: This example is the product-chain combination from Lesson 4.5. The discipline is: compute u\u2019 and v\u2019 SEPARATELY with their chain rule factors, then assemble the product rule. Never mix the two steps.",
          ],
        },
        {
          expression:
            "u'(x) = \\sec(5x)\\tan(5x) \\cdot 5 = 5\\sec(5x)\\tan(5x)",
          annotation:
            "Differentiate sec(5x) using the chain rule: d/dx[sec u] = sec u tan u times u'. Here u = 5x and u' = 5.",
          strategyTitle: "d/dx[sec(5x)]: use d/dx[sec u] = sec u tan u, then \u00d7 inner derivative 5",
          checkpoint: "What is d/dx[sec u]? Where does the \u2018sec u tan u\u2019 form come from? Can you derive it from the quotient rule on 1/cos u?",
          hints: [
            "Level 1: sec u = 1/cos u. Quotient rule: d/du[1/cos u] = (0 \u00b7 cos u \u2212 1 \u00b7 (\u2212sin u))/cos\u00b2u = sin u/cos\u00b2u = (1/cos u)(sin u/cos u) = sec u tan u.",
            "Level 2: The chain rule adds the inner derivative: d/dx[sec(5x)] = sec(5x)tan(5x) \u00b7 5. The factor of 5 is the derivative of the inner function 5x.",
            "Level 3: Memorize the six trig derivatives as three pairs: (sin, cos), (tan, sec\u00b2), (sec, sec\u00b7tan). The co-functions (cos, cot, csc) each have a minus sign. This pairing makes them easier to recall.",
          ],
        },
        {
          expression: "v'(x) = \\sec^2(5x) \\cdot 5 = 5\\sec^2(5x)",
          annotation:
            "Differentiate tan(5x) using the chain rule: d/dx[tan u] = sec\u00b2 u times u'. Here u = 5x and u' = 5.",
          strategyTitle: "d/dx[tan(5x)]: use d/dx[tan u] = sec\u00b2u, then \u00d7 inner derivative 5",
          checkpoint: "Compare u\u2019 and v\u2019: both have a factor of 5. Is this a coincidence, or does it always happen when both functions share the same inner function?",
          hints: [
            "Level 1: d/dx[tan(5x)] = sec\u00b2(5x) \u00b7 5. The chain rule factor is 5 because the inner function is 5x and d/dx[5x] = 5.",
            "Level 2: Both factors u = sec(5x) and v = tan(5x) share the same inner function 5x. Both therefore get the same chain rule factor of 5. This is exactly what will let us factor out 5 sec(5x) at the end.",
            "Level 3: If the factors had different inner functions (e.g., sec(3x)\u00b7tan(5x)), the chain rule factors would be 3 and 5 respectively, and no clean factoring would emerge. Same inner function = clean factoring at the end.",
          ],
        },
        {
          expression:
            "f'(x) = u'v + uv' = [5\\sec(5x)\\tan(5x)]\\cdot\\tan(5x) + \\sec(5x)\\cdot[5\\sec^2(5x)]",
          annotation: "Apply the product rule.",
          strategyTitle: "Product rule assembly: u\u2019v + uv\u2019 with all chain-rule factors included",
          checkpoint: "Before expanding, verify: did both u\u2019 and v\u2019 include their chain-rule factors of 5? What happens if you forget them?",
          hints: [
            "Level 1: u\u2019 = 5sec(5x)tan(5x) and v\u2019 = 5sec\u00b2(5x). Both already include the chain-rule factor 5. Assemble: u\u2019v + uv\u2019 = [5 sec(5x)tan(5x)] \u00b7 tan(5x) + sec(5x) \u00b7 [5 sec\u00b2(5x)].",
            "Level 2: If you forgot the chain-rule \u00d75 in u\u2019 or v\u2019, the assembled product rule would be off by a factor of 5 on one or both terms \u2014 a very common exam error.",
            "Level 3: At this stage the expression looks messy. Resist simplifying prematurely \u2014 write out both terms in full first, then look for common factors in the next step.",
          ],
        },
        {
          expression: "= 5\\sec(5x)\\tan^2(5x) + 5\\sec^3(5x)",
          annotation:
            "Expand: tan(5x) \u00b7 tan(5x) = tan\u00b2(5x) and sec(5x) \u00b7 sec\u00b2(5x) = sec\u00b3(5x).",
          strategyTitle: "Expand powers: tan \u00b7 tan = tan\u00b2, sec \u00b7 sec\u00b2 = sec\u00b3",
          checkpoint: "What is sec(5x) \u00b7 sec\u00b2(5x)? Is it sec\u00b3(5x) or sec\u00b2(5x)?",
          hints: [
            "Level 1: sec(5x) \u00b7 sec\u00b2(5x) = sec^{1+2}(5x) = sec\u00b3(5x). And tan(5x) \u00b7 tan(5x) = tan\u00b2(5x).",
            "Level 2: When multiplying powers of the same base function, add exponents: sec^a \u00b7 sec^b = sec^{a+b}.",
            "Level 3: After this step, both terms have the common factor 5 sec(5x). Factoring it out in the next step yields the compact final form.",
          ],
        },
        {
          expression: "= 5\\sec(5x)[\\tan^2(5x) + \\sec^2(5x)]",
          annotation: "Factor out 5 sec(5x) from both terms.",
          strategyTitle: "Factor 5 sec(5x) from both terms: common factor in every term",
          checkpoint: "After factoring, can the bracket [tan\u00b2(5x) + sec\u00b2(5x)] be simplified further using a trig identity?",
          hints: [
            "Level 1: Both terms contain 5 sec(5x). Factor it out: 5 sec(5x) \u00b7 [tan\u00b2(5x) + sec\u00b2(5x)].",
            "Level 2: The identity tan\u00b2(x) + 1 = sec\u00b2(x) gives tan\u00b2(x) = sec\u00b2(x) \u2212 1. So tan\u00b2(5x) + sec\u00b2(5x) = (sec\u00b2(5x) \u2212 1) + sec\u00b2(5x) = 2sec\u00b2(5x) \u2212 1.",
            "Level 3: Fully simplified: f\u2019(x) = 5 sec(5x)[2sec\u00b2(5x) \u2212 1]. Both the factored form and this simplified form are correct. Which to use depends on whether the Pythagorean identity simplification is required.",
          ],
        },
      ],
      conclusion:
        "f'(x) = 5 sec(5x)[tan\u00b2(5x) + sec\u00b2(5x)]. This can be further simplified using the identity tan\u00b2(x) + 1 = sec\u00b2(x), giving tan\u00b2+sec\u00b2 = sec\u00b2-1+sec\u00b2 = 2sec\u00b2-1.",
    },
    {
      id: "ch2-003-ex7",
      title: "Quotient Rule with Sine",
      problem:
        "f(x) = \\frac{1+\\sin x}{1-\\sin x}. \\text{ Find } f'(x) \\text{ and simplify.}",
      steps: [
        {
          expression:
            "\\text{Numerator: } N = 1+\\sin x, \\quad \\text{Denominator: } D = 1-\\sin x",
          annotation:
            "Identify numerator and denominator for the quotient rule.",
          strategyTitle: "Quotient rule setup: label N and D before differentiating",
          checkpoint: "Do either N or D require the chain rule when differentiating? What is the argument of sin in each?",
          hints: [
            "Level 1: N = 1 + sin x (argument is plain x, no chain rule). D = 1 \u2212 sin x (same). Both differentiate simply with d/dx[sin x] = cos x.",
            "Level 2: The quotient rule is (N\u2019D \u2212 ND\u2019)/D\u00b2. This formula is sometimes remembered as \u2018low d-high minus high d-low, all over low squared.\u2019",
            "Level 3: Prediction before computing: the numerator will have cos x factors (from differentiating sin x). The denominator squared becomes (1 \u2212 sin x)\u00b2. The key simplification will happen in the numerator via factoring cos x.",
          ],
        },
        {
          expression: "N' = \\cos x, \\quad D' = -\\cos x",
          annotation:
            "Differentiate numerator: d/dx[1+sin x] = cos x. Differentiate denominator: d/dx[1-sin x] = -cos x.",
          strategyTitle: "Differentiate N and D: note D\u2019 is \u2212cos x (negative from \u2212sin x term)",
          checkpoint: "Why is D\u2019 = \u2212cos x and not +cos x? Trace through d/dx[1 \u2212 sin x] step by step.",
          hints: [
            "Level 1: d/dx[1 \u2212 sin x] = d/dx[1] \u2212 d/dx[sin x] = 0 \u2212 cos x = \u2212cos x. The minus sign in the original expression carries through.",
            "Level 2: The derivative rules are linear: d/dx[f \u2212 g] = f\u2019 \u2212 g\u2019. The constant 1 vanishes; the \u2212sin x term gives \u2212cos x.",
            "Level 3: A sign error here (writing D\u2019 = +cos x) would cause incorrect sign in the quotient rule numerator, leading to a completely wrong answer. Double-check D\u2019 signs before proceeding.",
          ],
        },
        {
          expression:
            "f'(x) = \\frac{N'D - ND'}{D^2} = \\frac{\\cos x(1-\\sin x) - (1+\\sin x)(-\\cos x)}{(1-\\sin x)^2}",
          annotation:
            "Logic narrator: run quotient rule cleanly, then hunt for identity-style collapse opportunities in the numerator to escape complexity.",
          strategyTitle: "Apply quotient rule: (N\u2019D \u2212 ND\u2019) / D\u00b2",
          checkpoint: "Before distributing, predict: the second term has \u2212(1+sin x)(\u2212cos x). Two negatives multiply to give what sign?",
          hints: [
            "Level 1: N\u2019D = cos x \u00b7 (1 \u2212 sin x). ND\u2019 = (1 + sin x) \u00b7 (\u2212cos x). The formula is N\u2019D \u2212 ND\u2019 = cos x(1 \u2212 sin x) \u2212 (1 + sin x)(\u2212cos x).",
            "Level 2: The minus sign in the quotient rule formula combined with D\u2019 = \u2212cos x gives \u2212(1+sin x)(\u2212cos x) = +(1+sin x)cos x. Two negatives cancel to a positive.",
            "Level 3: This double-negative collapse is the algebraic key that makes the problem tractable. When the quotient rule produces a \u2212(\u2026)(\u2212\u2026) term, expand the double negative immediately to reveal the factoring opportunity.",
          ],
        },
        {
          expression:
            "= \\frac{\\cos x(1-\\sin x) + \\cos x(1+\\sin x)}{(1-\\sin x)^2}",
          annotation:
            "Distribute the negative sign on the second term: -(1+sin x)(-cos x) = +cos x(1+sin x).",
          strategyTitle: "Simplify the double negative: \u2212(1+sin x)(\u2212cos x) = +cos x(1+sin x)",
          checkpoint: "Now both terms in the numerator contain cos x as a factor. What can you factor out?",
          hints: [
            "Level 1: After simplifying the double negative: numerator = cos x(1\u2212sin x) + cos x(1+sin x). Both terms have cos x as a factor.",
            "Level 2: Factor cos x from both terms: cos x [(1\u2212sin x) + (1+sin x)]. This is the factoring step that cleans up the numerator.",
            "Level 3: The factoring is enabled by the double-negative collapse. Without recognizing that opportunity, you might try to expand everything and drown in algebra. Pattern: when quotient rule gives two terms with a common factor in the numerator, factor before expanding.",
          ],
        },
        {
          expression:
            "= \\frac{\\cos x[(1-\\sin x) + (1+\\sin x)]}{(1-\\sin x)^2}",
          annotation: "Factor cos x from both terms in the numerator.",
          strategyTitle: "Factor cos x from the numerator: reveal the cancellation inside brackets",
          checkpoint: "Simplify the bracket (1\u2212sin x) + (1+sin x). What do the sin x terms do?",
          hints: [
            "Level 1: (1\u2212sin x) + (1+sin x) = 1 \u2212 sin x + 1 + sin x = 2. The sin x terms cancel exactly.",
            "Level 2: This cancellation is the beautiful payoff of the double-negative collapse and factoring strategy. The \u2212sin x and +sin x annihilate each other.",
            "Level 3: This type of simplification \u2014 where opposite terms cancel in the numerator after factoring \u2014 is the hallmark of a well-structured trig quotient rule problem. Exam problems are often designed to produce this clean cancellation.",
          ],
        },
        {
          expression:
            "= \\frac{\\cos x \\cdot 2}{(1-\\sin x)^2} = \\frac{2\\cos x}{(1-\\sin x)^2}",
          annotation:
            "Simplify inside the brackets: (1-sin x)+(1+sin x) = 2. The sin x terms cancel.",
          strategyTitle: "Final form: 2 cos x / (1\u2212sin x)\u00b2",
          checkpoint: "Is further simplification possible? Could you use sin\u00b2x + cos\u00b2x = 1 to rewrite the denominator?",
          hints: [
            "Level 1: The answer 2cos x / (1\u2212sin x)\u00b2 is fully simplified. No further trig identity applies here.",
            "Level 2: You could multiply numerator and denominator by (1+sin x) to get 2cos x(1+sin x)/(1\u2212sin\u00b2x) = 2cos x(1+sin x)/cos\u00b2x = 2(1+sin x)/cos x. Different equivalent form, not necessarily simpler.",
            "Level 3: Verify at x = 0: f(0) = (1+0)/(1\u22120) = 1. f\u2019(0) = 2cos(0)/(1\u2212sin(0))\u00b2 = 2\u00b71/1\u00b2 = 2. Finite difference: (f(0.001)\u2212f(0))/0.001 = ((1+0.001)/(1\u22120.001)\u22121)/0.001 \u2248 2.000. \u2713",
          ],
        },
      ],
      conclusion:
        "f'(x) = 2cos(x) / (1-sin x)\u00b2. The simplification of the numerator was made possible by factoring out cos x.",
    },
    {
      id: "ch2-003-ex8",
      title: "Tangent Line to Sine Curve",
      problem:
        "\\text{Find the equation of the tangent line to } f(x) = \\sin x \\text{ at } x = \\pi/3.",
      steps: [
        {
          expression: "f'(x) = \\cos x",
          annotation:
            "The derivative of sin x is cos x \u2014 no chain rule needed since the argument is just x.",
          strategyTitle: "Find the slope function: f\u2019(x) = cos x",
          checkpoint: "The slope at every point on y = sin x is given by f\u2019(x) = cos x. What is the slope at x = 0? At x = \u03c0/2? At x = \u03c0?",
          hints: [
            "Level 1: d/dx[sin x] = cos x. No chain rule since the argument is plain x.",
            "Level 2: The slope values confirm the geometry: at x = 0 (bottom of a rising section), slope = cos(0) = 1 (steepest rise). At x = \u03c0/2 (the peak), slope = cos(\u03c0/2) = 0 (horizontal tangent). At x = \u03c0 (zero crossing with descending sine), slope = cos(\u03c0) = \u22121 (steepest descent).",
            "Level 3: The fact that the derivative of sine is cosine is why these two functions are described as 90\u00b0 phase shifts of each other. Sine leads cosine by \u03c0/2 in position; their derivatives satisfy the same relationship.",
          ],
        },
        {
          expression: "f'(\\pi/3) = \\cos(\\pi/3) = \\frac{1}{2}",
          annotation:
            "Logic narrator: this derivative value is the steerable slope. Plugging x = pi/3 locks the steering wheel to one tangent line.",
          strategyTitle: "Evaluate the slope at x = \u03c0/3: cos(\u03c0/3) = 1/2",
          checkpoint: "From the unit circle, what are the exact values of cos(\u03c0/3), cos(\u03c0/4), and cos(\u03c0/6)?",
          hints: [
            "Level 1: Unit circle values: cos(\u03c0/6) = \u221a3/2, cos(\u03c0/4) = 1/\u221a2, cos(\u03c0/3) = 1/2. These are essential to memorize for any calculus exam.",
            "Level 2: At x = \u03c0/3 \u2248 60\u00b0, the tangent line has slope 1/2. The sine curve is still rising at this point (slope > 0), but not as steeply as at x = 0 (slope = 1).",
            "Level 3: The slope m = 1/2 is the only piece of information needed to write the tangent line, once we also know the point (x\u2080, f(x\u2080)). Two pieces of information define a unique line.",
          ],
        },
        {
          expression: "f(\\pi/3) = \\sin(\\pi/3) = \\frac{\\sqrt{3}}{2}",
          annotation:
            "Find the y-coordinate of the tangent point. From the unit circle, sin(\u03c0/3) = \u221a3/2.",
          strategyTitle: "Find the contact point: evaluate f(\u03c0/3) = sin(\u03c0/3) = \u221a3/2",
          checkpoint: "You now have both pieces needed for a line: a point (\u03c0/3, \u221a3/2) and a slope (1/2). Which line equation formula will you use?",
          hints: [
            "Level 1: sin(\u03c0/3) = \u221a3/2 \u2248 0.866. The contact point is (\u03c0/3, \u221a3/2) \u2248 (1.047, 0.866).",
            "Level 2: Two methods to write the line: (1) point-slope: y \u2212 y\u2080 = m(x \u2212 x\u2080), or (2) slope-intercept: y = mx + b with b found by substitution. Point-slope is faster here.",
            "Level 3: Confirm \u03c0/3 is on the curve: f(\u03c0/3) = sin(\u03c0/3) = \u221a3/2. The tangent line touches the curve at exactly this point and has the same slope there.",
          ],
        },
        {
          expression:
            "y - \\frac{\\sqrt{3}}{2} = \\frac{1}{2}\\left(x - \\frac{\\pi}{3}\\right)",
          annotation:
            "Write in point-slope form with point (\u03c0/3, \u221a3/2) and slope 1/2.",
          strategyTitle: "Point-slope form: y \u2212 y\u2080 = m(x \u2212 x\u2080)",
          checkpoint: "Identify m, x\u2080, and y\u2080 in this equation. Where did each quantity come from?",
          hints: [
            "Level 1: m = 1/2 (from f\u2019(\u03c0/3)), x\u2080 = \u03c0/3, y\u2080 = \u221a3/2 (from f(\u03c0/3)). Point-slope form is the most direct way to write any tangent line.",
            "Level 2: This formula works for any tangent line: y \u2212 f(a) = f\u2019(a)(x \u2212 a). You only need the base point a and the function value and derivative at a.",
            "Level 3: This is exactly the linear approximation formula L(x) = f(a) + f\u2019(a)(x \u2212 a) from Chapter 3. Tangent lines and linear approximations are the same object viewed differently: geometry vs. computation.",
          ],
        },
        {
          expression:
            "y = \\frac{1}{2}x - \\frac{\\pi}{6} + \\frac{\\sqrt{3}}{2}",
          annotation:
            "Distribute 1/2 across (x \u2212 \u03c0/3) = x \u2212 \u03c0/3, giving (1/2)x \u2212 \u03c0/6, then add \u221a3/2.",
          strategyTitle: "Simplify to slope-intercept form y = mx + b",
          checkpoint: "What is the y-intercept b = \u2212\u03c0/6 + \u221a3/2 numerically? Is it positive or negative?",
          hints: [
            "Level 1: Distribute: (1/2)(x \u2212 \u03c0/3) = x/2 \u2212 \u03c0/6. Add y\u2080 = \u221a3/2: y = x/2 \u2212 \u03c0/6 + \u221a3/2.",
            "Level 2: y-intercept: b = \u2212\u03c0/6 + \u221a3/2 \u2248 \u22120.524 + 0.866 = 0.342. The tangent line crosses the y-axis above zero.",
            "Level 3: Sanity check: the tangent line at x = \u03c0/3 should pass through (\u03c0/3, \u221a3/2). Check: y = (1/2)(\u03c0/3) \u2212 \u03c0/6 + \u221a3/2 = \u03c0/6 \u2212 \u03c0/6 + \u221a3/2 = \u221a3/2. \u2713",
          ],
        },
      ],
      conclusion:
        "The tangent line is y = (1/2)x + (\u221a3/2 - \u03c0/6). At x = \u03c0/3 \u2248 1.047, the sine curve has slope exactly 1/2 — the curve is rising gently as it approaches its peak at x = \u03c0/2.",
    },
  ],

  challenges: [
    {
      id: "ch2-003-ch1",
      difficulty: "easy",
      problem: "\\text{Differentiate } f(x) = 3\\cos x - 4\\sin x.",
      hint: "Differentiate each trig term separately: d/dx[cos x] = -sin x and d/dx[sin x] = cos x, then keep the constants 3 and -4 attached.",
      walkthrough: [
        {
          expression:
            "f'(x) = 3 \\cdot \\frac{d}{dx}[\\cos x] - 4 \\cdot \\frac{d}{dx}[\\sin x]",
          annotation: "Apply the sum rule and constant multiple rule.",
        },
        {
          expression: "= 3(-\\sin x) - 4(\\cos x)",
          annotation: "Use d/dx[cos x] = -sin x and d/dx[sin x] = cos x.",
        },
        {
          expression: "= -3\\sin x - 4\\cos x",
          annotation: "Final simplified form.",
        },
      ],
      answer: "f'(x) = -3\\sin x - 4\\cos x",
    },
    {
      id: "ch2-003-ch2",
      difficulty: "medium",
      problem:
        "Prove from the quotient rule that \\dfrac{d}{dx}[\\sec x] = \\sec x \\tan x.",
      hint: "Write sec x = 1/cos x and apply the quotient rule with numerator 1 and denominator cos x.",
      walkthrough: [
        {
          expression: "\\sec x = \\frac{1}{\\cos x}",
          annotation: "Write secant in terms of cosine.",
        },
        {
          expression:
            "\\frac{d}{dx}\\left[\\frac{1}{\\cos x}\\right] = \\frac{0 \\cdot \\cos x - 1 \\cdot (-\\sin x)}{\\cos^2 x}",
          annotation:
            "Apply the quotient rule: numerator is (N'D - ND'). N = 1, N' = 0, D = cos x, D' = -sin x.",
        },
        {
          expression: "= \\frac{\\sin x}{\\cos^2 x}",
          annotation:
            "Simplify numerator: 0\u00b7cos x = 0 and -1\u00b7(-sin x) = sin x.",
        },
        {
          expression:
            "= \\frac{\\sin x}{\\cos x} \\cdot \\frac{1}{\\cos x} = \\tan x \\cdot \\sec x",
          annotation:
            "Split the fraction: sin x / cos x = tan x and 1/cos x = sec x.",
        },
        {
          expression: "= \\sec x \\tan x \\quad \\blacksquare",
          annotation: "Rewrite in standard order.",
        },
      ],
      answer: "\\dfrac{d}{dx}[\\sec x] = \\sec x \\tan x",
    },
    {
      id: "ch2-003-ch3",
      difficulty: "hard",
      problem:
        "\\text{Find all } x \\in [0, 2\\pi] \\text{ where } f(x) = 2\\sin x - \\sin(2x) \\text{ has a horizontal tangent line.}",
      hint: "Set f'(x) = 0. You will need the chain rule for sin(2x). Then use the identity sin(2x) = 2sin(x)cos(x) or factor the resulting equation. There are 4 solutions in [0, 2\u03c0].",
      walkthrough: [
        {
          expression: "f'(x) = 2\\cos x - \\frac{d}{dx}[\\sin(2x)]",
          annotation: "Differentiate term by term.",
        },
        {
          expression:
            "\\frac{d}{dx}[\\sin(2x)] = \\cos(2x) \\cdot 2 = 2\\cos(2x)",
          annotation:
            "Apply the chain rule to sin(2x): outer derivative is cosine, inner is 2x with derivative 2.",
        },
        {
          expression: "f'(x) = 2\\cos x - 2\\cos(2x)",
          annotation: "Combine the derivatives.",
        },
        {
          expression:
            "f'(x) = 0 \\implies 2\\cos x - 2\\cos(2x) = 0 \\implies \\cos x = \\cos(2x)",
          annotation: "Set equal to zero and divide by 2.",
        },
        {
          expression: "\\cos(2x) = 2\\cos^2 x - 1",
          annotation:
            "Use the double angle identity to express cos(2x) in terms of cos(x).",
        },
        {
          expression:
            "\\cos x = 2\\cos^2 x - 1 \\implies 2\\cos^2 x - \\cos x - 1 = 0",
          annotation: "Substitute and rearrange into a quadratic in cos x.",
        },
        {
          expression: "(2\\cos x + 1)(\\cos x - 1) = 0",
          annotation:
            "Factor the quadratic: check that (2u+1)(u-1) = 2u\u00b2-u-1. —",
        },
        {
          expression:
            "\\cos x = -\\frac{1}{2} \\quad \\text{or} \\quad \\cos x = 1",
          annotation: "Set each factor equal to zero.",
        },
        {
          expression:
            "\\cos x = 1 \\implies x = 0 \\text{ (and } 2\\pi \\text{, but that\'s the endpoint)}",
          annotation:
            "In [0, 2\u03c0], cos x = 1 at x = 0 (and at 2\u03c0 = 0 again at the boundary).",
        },
        {
          expression:
            "\\cos x = -\\tfrac{1}{2} \\implies x = \\frac{2\\pi}{3} \\text{ or } x = \\frac{4\\pi}{3}",
          annotation:
            "In [0, 2\u03c0], cos x = -1/2 at x = 2\u03c0/3 (second quadrant, reference angle \u03c0/3) and x = 4\u03c0/3 (third quadrant).",
        },
        {
          expression:
            "x \\in \\left\\{0,\\; \\frac{2\\pi}{3},\\; \\frac{4\\pi}{3}\\right\\} \\text{ on } [0,2\\pi]",
          annotation:
            "Collect all solutions. (x = 2\u03c0 is the same point as x = 0 on the circle, included if the interval is closed.)",
        },
      ],
      answer:
        "x = 0,\\; \\dfrac{2\\pi}{3},\\; \\dfrac{4\\pi}{3} \\; (\\text{and } 2\\pi \\text{ if counted})",
    },
  ],

  crossRefs: [
    {
      lessonSlug: "chain-rule",
      label: "The Chain Rule",
      context:
        "Every trig derivative formula extends to compositions via the chain rule. Most applied trig differentiation involves the chain rule.",
    },
    {
      lessonSlug: "tangent-problem",
      label: "Limit Definition",
      context:
        "The proof of d/dx[sin x] = cos x uses the limit definition and the fundamental trig limits.",
    },
    {
      lessonSlug: "implicit-differentiation",
      label: "Implicit Differentiation",
      context:
        "Trig functions appear frequently in implicit equations; their derivatives are used in implicit differentiation.",
    },
  ],

  checkpoints: [
    "read-intuition",
    "read-math",
    "read-rigor",
    "completed-example-1",
    "completed-example-2",
    "completed-example-3",
    "completed-example-4",
    "completed-example-5",
    "completed-example-6",
    "completed-example-7",
    "completed-example-8",
    "attempted-challenge-easy",
    "attempted-challenge-medium",
    "attempted-challenge-hard",
  ],

  quiz: [
    {
      id: 'trig-deriv-q1',
      type: 'choice',
      text: 'What is $\\dfrac{d}{dx}[\\sin(x)]$?',
      options: ['$-\\sin(x)$', '$\\cos(x)$', '$-\\cos(x)$', '$\\tan(x)$'],
      answer: '$\\cos(x)$',
      hints: ['This is a fundamental trig derivative formula — the derivative of sine is cosine.'],
      reviewSection: 'Math tab — basic trig derivatives',
    },
    {
      id: 'trig-deriv-q2',
      type: 'choice',
      text: 'What is $\\dfrac{d}{dx}[\\cos(x)]$?',
      options: ['$\\sin(x)$', '$-\\sin(x)$', '$\\sec^2(x)$', '$-\\cos(x)$'],
      answer: '$-\\sin(x)$',
      hints: ['The derivative of cosine has a negative sign — cosine is "going down" when sine is positive.'],
      reviewSection: 'Math tab — basic trig derivatives',
    },
    {
      id: 'trig-deriv-q3',
      type: 'input',
      text: 'Differentiate $f(x) = \\sin(3x)$ using the chain rule.',
      answer: '3*cos(3*x)',
      hints: ['Outside: $\\sin(u)$; inside: $3x$. Derivative: $\\cos(3x) \\cdot 3$.'],
      reviewSection: 'Math tab — chain rule with trig functions',
    },
    {
      id: 'trig-deriv-q4',
      type: 'input',
      text: 'Differentiate $g(x) = \\cos(x^2)$ using the chain rule.',
      answer: '-2*x*sin(x^2)',
      hints: ['Outside: $\\cos(u)$; inside: $x^2$. Derivative: $-\\sin(x^2) \\cdot 2x$.'],
      reviewSection: 'Math tab — chain rule with cosine',
    },
    {
      id: 'trig-deriv-q5',
      type: 'input',
      text: 'Find $\\dfrac{d}{dx}[\\tan(x)]$.',
      answer: '1/cos(x)^2',
      hints: ['Write $\\tan(x) = \\sin(x)/\\cos(x)$ and apply the quotient rule, or recall the standard result.'],
      reviewSection: 'Math tab — derivative of tan',
    },
    {
      id: 'trig-deriv-q6',
      type: 'input',
      text: 'Differentiate $h(x) = x^2 \\sin(x)$ using the product rule.',
      answer: '2*x*sin(x) + x^2*cos(x)',
      hints: ['Product rule: $(x^2)\'\\sin(x) + x^2(\\sin(x))\'$.'],
      reviewSection: 'Math tab — product rule with trig',
    },
    {
      id: 'trig-deriv-q7',
      type: 'input',
      text: 'Differentiate $y = \\sin^3(x)$ (i.e., $(\\sin x)^3$) using the chain rule.',
      answer: '3*sin(x)^2 * cos(x)',
      hints: ['Outside: $u^3$; inside: $\\sin(x)$. Derivative: $3(\\sin x)^2 \\cdot \\cos(x)$.'],
      reviewSection: 'Math tab — chain rule applied to a trig power',
    },
    {
      id: 'trig-deriv-q8',
      type: 'input',
      text: 'Find $\\dfrac{d}{dx}[\\sec(x)]$.',
      answer: 'sec(x)*tan(x)',
      hints: ['Write $\\sec(x) = 1/\\cos(x)$ and use the quotient rule, or recall the standard result: $\\sec(x)\\tan(x)$.'],
      reviewSection: 'Math tab — derivatives of sec, csc, cot',
    },
    {
      id: 'trig-deriv-q9',
      type: 'input',
      text: 'Differentiate $f(x) = \\tan(5x)$ using the chain rule.',
      answer: '5 / cos(5*x)^2',
      hints: ['Chain rule: $\\sec^2(5x) \\cdot 5$. Note $\\sec^2(u) = 1/\\cos^2(u)$.'],
      reviewSection: 'Math tab — chain rule with tan',
    },
    {
      id: 'trig-deriv-q10',
      type: 'input',
      text: 'Find the derivative of $y = \\dfrac{\\sin(x)}{x}$ using the quotient rule.',
      answer: '(x*cos(x) - sin(x)) / x^2',
      hints: ['Quotient rule with $f = \\sin x$, $g = x$: $(g f\' - f g\')/g^2 = (x\\cos x - \\sin x)/x^2$.'],
      reviewSection: 'Math tab — quotient rule with trig',
    },
  ],
};

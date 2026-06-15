export default {
  id: 'p1-ch2-007',
  slug: 'definition-of-dx-dt',
  chapter: 'p2',
  order: 7,
  title: "Definition of dx/dt — Instantaneous Velocity",
  subtitle:
    "How physicists forced mathematicians to invent calculus: the problem of velocity at a single instant.",
  tags: ["derivative", "limit", "instantaneous velocity", "difference quotient", "calculus", "kinematics", "dx/dt"],
  aliases: "definition-of-dx-dt instantaneous velocity limit derivative",

  hook: {
    question:
      "Your car speedometer reads 60 mph right now. But speed = distance/time. If we measure over zero time, the car travels zero distance — so speed = 0/0, which is undefined. How can you have a speed at an instant if it takes time to measure speed?",
    realWorldContext:
      "This is not just a philosophical puzzle — it is the exact paradox that Newton and Leibniz solved when they invented calculus in the 1660s–70s. Every speedometer, radar gun, GPS velocity readout, and physics simulation in the world answers this question millions of times per second. The answer is the derivative: the limit of the average speed as the measurement interval shrinks to zero. Understanding this limit is understanding why calculus exists.",
    previewVisualizationId: 'SVGDiagram',
  },

  videos: [
    {
      title: "Physics 2 – Motion in One Dimension (7 of 22) Definition of dx/dt",
      embedCode: `<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>`,
      placement: "intuition",
    },
  ],

  intuition: {
    prose: [
      `Before reading on, predict: a car drives from $x = 0$ to $x = 100$ m in 5 s. Its average velocity is 20 m/s. But was it going exactly 20 m/s at every instant? If you only know $x(t)$, how would you find its velocity at exactly $t = 2$ s? Write your method before reading on.`,
      "The key problem: velocity measures how position changes over time. The formula is Δx/Δt — change in position divided by change in time. But this gives average velocity over an interval. What does it mean to ask for velocity at a single instant — a moment with no duration? Setting Δt = 0 gives 0/0, which is meaningless. Yet physically, your speedometer clearly shows a number. How?",
      "The resolution: instead of measuring over zero time (impossible), measure over a very small time interval and see what the measurement approaches. Pick a moment t. Measure position: x(t). Wait a small time h. Measure position again: x(t+h). Compute average velocity: [x(t+h) − x(t)]/h. Now repeat with a smaller h. And smaller again. If these average velocities converge to a definite number as h → 0, that number IS the instantaneous velocity at time t. This convergence is the limit.",
      "Geometrically, average velocity is the slope of the secant line through (t, x(t)) and (t+h, x(t+h)) on the position-time graph. As h → 0, the second point slides toward the first, and the secant line rotates into the tangent line at (t, x(t)). The slope of the tangent line is the instantaneous velocity. The derivative IS the tangent slope — that is its geometric definition.",
      "This lesson is the calculus bridge. If you have already taken calculus, you know the limit definition of the derivative. This lesson shows that definition in its original physical context — the problem it was invented to solve. If you haven't taken calculus yet, this lesson IS calculus: you are learning the derivative at the same time physicists first learned it, through velocity.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Three steps for computing instantaneous velocity from first principles',
        body: `1. Write the difference quotient: $[x(t+h) - x(t)]/h$ with $h \\neq 0$. 2. Simplify algebraically — factor, expand, or rationalize until $h$ cancels from the denominator. 3. Take the limit as $h \\to 0$: the remaining expression (with no $h$ in the denominator) is $v(t)$.`,
      },
      {
        type: 'definition',
        title: 'Average velocity (starting point)',
        body: `\\bar{v} = \\frac{\\Delta x}{\\Delta t} = \\frac{x(t+h) - x(t)}{h} \\qquad (h \\neq 0)`,
      },
      {
        type: 'theorem',
        title: 'Instantaneous velocity (the derivative)',
        body: `v(t) = \\lim_{h \\to 0} \\frac{x(t+h) - x(t)}{h} = \\frac{dx}{dt}`,
      },
      {
        type: 'insight',
        title: 'This IS Calculus Chapter 2',
        body: `The formula $v(t) = \\lim_{h \\to 0} [x(t+h)-x(t)]/h$ is the definition of the derivative from calculus, written with $t$ as the variable instead of $x$. The power rule, product rule, and chain rule are all theorems that automate this limit for specific function families. Kinematics is the original physical context that motivated the invention of derivatives.`,
      },
      {
        type: 'insight',
        title: 'Secant → Tangent is the whole story',
        body: `Secant slope = average velocity over a finite interval $h$. As $h \\to 0$: secant rotates → tangent. Tangent slope = instantaneous velocity. The derivative is nothing more — and nothing less — than this limiting process applied to the position-time graph.`,
      },
      {
        type: 'warning',
        title: 'You CANNOT just set h = 0',
        body: `Plugging $h = 0$ directly into $[x(t+h)-x(t)]/h$ gives $[x(t)-x(t)]/0 = 0/0$ — an indeterminate form with no value. The limit process approaches $h = 0$ without reaching it. You must first simplify algebraically so the $h$ in the denominator cancels, and THEN take the limit. This algebraic step is what differentiation rules automate.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'slope-triangle' },
        title: 'The slope triangle',
        caption: 'Δx/Δt is the rise-over-run of the secant. As Δt → 0 the secant becomes the tangent — that limiting ratio is the derivative.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'slope-triangle' },
        title: 'Secant to tangent: the limit process',
        caption: `As h shrinks, the second point slides toward the first and the secant rotates toward the tangent. The slope of the secant [x(t+h)−x(t)]/h converges to the instantaneous velocity = slope of the tangent = dx/dt.`,
      },
    ],
  },

  math: {
    prose: [
      `To compute instantaneous velocity analytically, apply differentiation rules to $x(t)$. For polynomials: $d/dt[t^n] = nt^{n-1}$ (power rule). For a sum: differentiate term by term. In practice, these rules automate the limit for common function types — you never need to evaluate the limit directly after learning them.`,
      `Numerical estimation: if $x(t)$ is known only at discrete samples (sensor data), approximate $v(t)$ using the central difference: $v(t) \\approx [x(t+h) - x(t-h)]/(2h)$ for small $h$. This is more accurate than the one-sided forward difference and converges as $h^2$, not $h$. It is the formula used in every numerical physics simulation.`,
      `For $x(t) = x_0 + v_0 t + \\tfrac{1}{2}at^2$, the derivative is $v(t) = v_0 + at$. Power rule term by term: $d/dt[x_0] = 0$, $d/dt[v_0 t] = v_0$, $d/dt[\\tfrac{1}{2}at^2] = at$. This is why $v = v_0 + at$ is the kinematic velocity formula — it IS the derivative of the position formula.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Difference quotient (explicit form)',
        body: `\\frac{x(t+h)-x(t)}{h} \\xrightarrow{h\\to 0} v(t) = \\frac{dx}{dt}`,
      },
      {
        type: 'insight',
        title: 'Power rule for polynomials',
        body: `$\\frac{d}{dt}[ct^n] = cn\\,t^{n-1}$ where $c$ is any constant. Applied term by term: $\\frac{d}{dt}[3t^2 - 2t + 1] = 6t - 2$.`,
      },
      {
        type: 'insight',
        title: 'Central difference for numerical estimation',
        body: `$v(t) \\approx \\frac{x(t+h) - x(t-h)}{2h}$ with error $\\sim h^2$. This is more accurate than the forward difference $[x(t+h)-x(t)]/h$ whose error is $\\sim h$. For the same step size, central difference gives error about $1000\\times$ smaller when $h = 0.01$.`,
      },
      {
        type: 'warning',
        title: 'Numerical caution: optimal h',
        body: `If $h$ is too large, the secant poorly approximates the tangent. If $h$ is too small in floating-point arithmetic, round-off error dominates. The sweet spot is typically $h \\approx \\sqrt{\\varepsilon_{\\text{machine}}} \\approx 10^{-8}$ for double-precision. Below $h \\sim 10^{-12}$, errors grow again.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'slope-triangle' },
        title: 'Forward vs central difference convergence',
        caption: `Forward difference error is O(h); central difference error is O(h²). For h = 0.1: forward error ≈ 0.1 × |v'(t)|/2; central error ≈ 0.01 × |v''(t)|/6. Use central difference in all numerical work whenever possible.`,
      },
    ],
  },

  rigor: {
    title: "Instantaneous velocity is the derivative — formal statement",
    prose: [
      `Let $x(t)$ be a position function. We say $x$ is differentiable at $t$ if the limit $\\lim_{h \\to 0} [x(t+h)-x(t)]/h$ exists as a finite real number. When this limit exists, it is called the derivative $x'(t) = dx/dt$, and we define the instantaneous velocity $v(t) = x'(t)$.`,
      `The definition requires one-sided limits to agree: $\\lim_{h \\to 0^+}$ and $\\lim_{h \\to 0^-}$ must both equal the same value. If they disagree, the derivative does not exist at that point — physically this corresponds to a sudden jump in velocity, which is impossible for a massive object (it would require infinite force) but admissible as an idealization in perfectly elastic collision models.`,
      `For $x(t) = t^n$, the derivative follows from the binomial theorem: $[(t+h)^n - t^n]/h = nt^{n-1} + $ (terms in $h$). As $h \\to 0$, only the first term survives, giving $x'(t) = nt^{n-1}$. This is the power rule proved from first principles. All differentiation rules (product, quotient, chain) are theorems derived from the same limit definition.`,
      `This limit definition is the foundation that all of calculus rests on. Once you accept it, every derivative formula becomes a theorem — something that can be proved rather than memorized. The chain rule (essential for all multi-variable physics from energy to wave functions) is proved by applying this same limit to a composed function $f(g(t))$. Understanding the limit definition means understanding why every rule works, not just how to use it.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The derivative (formal)',
        body: `x'(t) = \\frac{dx}{dt} = \\lim_{h \\to 0} \\frac{x(t+h)-x(t)}{h}`,
      },
    ],
  },

  examples: [
    {
      id: 'p1-ch2-007-ex1',
      title: "Find velocity by differentiating",
      problem:
        "Given $x(t) = 3t^2 - 2t + 1$ (meters), find $v(t)$ and the instantaneous velocity at $t = 2$ s.",
      steps: [
        {
          expression: `v(t) = \\frac{dx}{dt} = \\frac{d}{dt}[3t^2 - 2t + 1]`,
          annotation: "Set up the derivative — differentiate each term using the power rule.",
        },
        {
          expression: `v(t) = 6t - 2`,
          annotation: "$d/dt[3t^2] = 6t$, $d/dt[-2t] = -2$, $d/dt[1] = 0$. The velocity is a linear function (constant acceleration $a = 6$ m/s²).",
        },
        {
          expression: `v(2) = 6(2) - 2 = 10 \\text{ m/s}`,
          annotation: "Substitute $t = 2$ into the velocity function.",
        },
      ],
      conclusion:
        "Instantaneous velocity at $t = 2$ s is 10 m/s. The quadratic position function differentiates to a linear velocity — consistent with constant acceleration.",
    },
    {
      id: 'p1-ch2-007-ex2',
      title: "Velocity from first principles for x(t) = t³",
      problem:
        "Compute $v(t)$ for $x(t) = t^3$ directly from the limit definition (without using the power rule).",
      steps: [
        {
          expression: `\\frac{x(t+h)-x(t)}{h} = \\frac{(t+h)^3 - t^3}{h}`,
          annotation: "Set up the difference quotient.",
        },
        {
          expression: `= \\frac{t^3 + 3t^2h + 3th^2 + h^3 - t^3}{h}`,
          annotation: "Expand $(t+h)^3$ using the binomial theorem.",
        },
        {
          expression: `= \\frac{3t^2h + 3th^2 + h^3}{h} = 3t^2 + 3th + h^2`,
          annotation: "Cancel $h$ from numerator and denominator. Note: $h \\neq 0$ at this stage — we cancel before taking the limit.",
        },
        {
          expression: `v(t) = \\lim_{h\\to 0}(3t^2 + 3th + h^2) = 3t^2`,
          annotation: "Now take the limit: all terms containing $h$ vanish, leaving $3t^2$.",
        },
      ],
      conclusion:
        "v(t) = 3t². This confirms the power rule: $d/dt[t^3] = 3t^2$. The algebraic cancellation that removes $h$ from the denominator before the limit is the key step — this is what differentiation rules automate.",
    },
    {
      id: 'p1-ch2-007-ex3',
      title: "Velocity from first principles for x(t) = 1/t",
      problem:
        "Compute $v(t)$ for $x(t) = 1/t$ directly from the limit definition by simplifying the difference quotient. Find $v(2)$.",
      steps: [
        {
          expression: `\\frac{x(t+h)-x(t)}{h} = \\frac{\\dfrac{1}{t+h} - \\dfrac{1}{t}}{h}`,
          annotation: "Set up the difference quotient for $x(t) = 1/t$.",
        },
        {
          expression: `= \\frac{1}{h} \\cdot \\frac{t - (t+h)}{t(t+h)} = \\frac{-h}{h \\cdot t(t+h)}`,
          annotation: "Combine the fractions over a common denominator $t(t+h)$. The numerator simplifies to $-h$.",
        },
        {
          expression: `= \\frac{-1}{t(t+h)}`,
          annotation: "Cancel $h$ ($h \\neq 0$). Now the denominator is $h$-free after cancellation.",
        },
        {
          expression: `v(t) = \\lim_{h \\to 0} \\frac{-1}{t(t+h)} = \\frac{-1}{t^2}`,
          annotation: "Take the limit: as $h \\to 0$, $t(t+h) \\to t^2$.",
        },
        {
          expression: `v(2) = \\frac{-1}{4} = -0.25 \\text{ m/s}`,
          annotation: "Substitute $t = 2$.",
        },
      ],
      conclusion:
        "$v(t) = -1/t^2$. Consistent with the power rule: $d/dt[t^{-1}] = -1 \\cdot t^{-2} = -1/t^2$. At $t = 2$, velocity is $-0.25$ m/s — the object is moving backward and slowing (the magnitude of velocity decreases as $t$ grows).",
    },
  ],

  challenges: [
    {
      id: 'p1-ch2-007-ch1',
      difficulty: 'medium',
      problem: `Given $x(t) = t^3$, estimate $v(1)$ numerically using $h = 0.1$. Compare the forward and central difference estimates to the exact answer. What is the error ratio?`,
      hint: "Forward: $[x(1.1) - x(1)]/0.1$. Central: $[x(1.1) - x(0.9)]/0.2$. Exact: $v(1) = 3t^2|_{t=1} = 3$.",
      walkthrough: [
        {
          step: "Compute the forward difference estimate.",
          expression: `\\frac{x(1.1)-x(1)}{0.1}=\\frac{1.331-1}{0.1}=3.31`,
          annotation: "Error = 3.31 − 3 = 0.31 ≈ 0.1 × 3 (consistent with O(h) error).",
        },
        {
          step: "Compute the central difference estimate.",
          expression: `\\frac{x(1.1)-x(0.9)}{0.2}=\\frac{1.331-0.729}{0.2}=\\frac{0.602}{0.2}=3.01`,
          annotation: "Error = 3.01 − 3 = 0.01, which is 31 times smaller than the forward error.",
        },
        {
          step: "Compare error scaling.",
          expression: `\\text{Forward error} \\approx h \\cdot |v'(t)|/2 = 0.1 \\cdot 3 = 0.3 \\qquad \\text{Central error} \\approx h^2 \\cdot |v''(t)|/6 = 0.01 \\cdot 1 = 0.01`,
          annotation: "For the same $h = 0.1$, central difference gives 30× smaller error. This is why central differences are preferred.",
        },
      ],
      conclusion:
        "Forward estimate: 3.31 (error ≈ 0.31). Central estimate: 3.01 (error ≈ 0.01). Central difference is significantly more accurate for the same $h$ because its error scales as $h^2$ rather than $h$.",
    },
    {
      id: 'p1-ch2-007-ch2',
      difficulty: 'hard',
      problem: `Find $v(t) = d/dt[\\sin(t)]$ from the limit definition. You will need: $\\sin(a+b) = \\sin a \\cos b + \\cos a \\sin b$, and $\\lim_{h \\to 0} \\sin(h)/h = 1$, $\\lim_{h \\to 0} (\\cos h - 1)/h = 0$.`,
      hint: "Expand $\\sin(t+h)$ using the angle addition formula, then group into two limits.",
      walkthrough: [
        {
          step: "Set up the difference quotient.",
          expression: `\\frac{\\sin(t+h) - \\sin(t)}{h}`,
          annotation: "This is the standard limit definition applied to $x(t) = \\sin(t)$.",
        },
        {
          step: "Expand $\\sin(t+h)$ using angle addition.",
          expression: `= \\frac{\\sin(t)\\cos(h) + \\cos(t)\\sin(h) - \\sin(t)}{h}`,
          annotation: "Apply $\\sin(a+b) = \\sin a \\cos b + \\cos a \\sin b$.",
        },
        {
          step: "Group into two separate fractions.",
          expression: `= \\sin(t) \\cdot \\frac{\\cos(h)-1}{h} + \\cos(t) \\cdot \\frac{\\sin(h)}{h}`,
          annotation: "Rearrange: the first group has $[\\cos(h)-1]/h$, the second has $\\sin(h)/h$.",
        },
        {
          step: "Take the limit using the given standard limits.",
          expression: `\\lim_{h \\to 0} = \\sin(t) \\cdot 0 + \\cos(t) \\cdot 1 = \\cos(t)`,
          annotation: "$\\lim_{h \\to 0}(\\cos h - 1)/h = 0$ and $\\lim_{h \\to 0} \\sin(h)/h = 1$ are the two key trig limits.",
        },
      ],
      conclusion:
        "$v(t) = \\cos(t)$. This is the derivative of sine, proved from first principles using the angle addition formula and the two fundamental trig limits. The same method applied to $\\cos(t)$ gives $-\\sin(t)$.",
    },
    {
      id: 'p1-ch2-007-ch3',
      difficulty: 'hard',
      problem: `Find $v(t)$ for $x(t) = \\sqrt{t}$ from the limit definition. Use the technique of rationalizing the numerator. Find the time $t$ when $v = 0.1$ m/s.`,
      hint: "Multiply numerator and denominator by $[\\sqrt{t+h} + \\sqrt{t}]$ to eliminate the square root difference in the numerator.",
      walkthrough: [
        {
          step: "Set up the difference quotient.",
          expression: `\\frac{\\sqrt{t+h} - \\sqrt{t}}{h}`,
          annotation: "Direct substitution of $h=0$ gives $0/0$ — need to simplify.",
        },
        {
          step: "Rationalize the numerator by multiplying by the conjugate.",
          expression: `= \\frac{\\sqrt{t+h} - \\sqrt{t}}{h} \\cdot \\frac{\\sqrt{t+h} + \\sqrt{t}}{\\sqrt{t+h} + \\sqrt{t}}`,
          annotation: "Multiplying by 1 in the form of conjugate/conjugate.",
        },
        {
          step: "Simplify the numerator using the difference of squares.",
          expression: `= \\frac{(t+h) - t}{h(\\sqrt{t+h} + \\sqrt{t})} = \\frac{h}{h(\\sqrt{t+h} + \\sqrt{t})}`,
          annotation: "$(a-b)(a+b) = a^2 - b^2$, so $(\\sqrt{t+h})^2 - (\\sqrt{t})^2 = h$.",
        },
        {
          step: "Cancel h and take the limit.",
          expression: `= \\frac{1}{\\sqrt{t+h} + \\sqrt{t}} \\xrightarrow{h \\to 0} \\frac{1}{2\\sqrt{t}}`,
          annotation: "As $h \\to 0$: $\\sqrt{t+h} \\to \\sqrt{t}$, so denominator $\\to 2\\sqrt{t}$.",
        },
        {
          step: "Find t when v = 0.1 m/s.",
          expression: `\\frac{1}{2\\sqrt{t}} = 0.1 \\Rightarrow 2\\sqrt{t} = 10 \\Rightarrow \\sqrt{t} = 5 \\Rightarrow t = 25 \\text{ s}`,
          annotation: "Solve for $t$ algebraically.",
        },
      ],
      conclusion:
        "$v(t) = 1/(2\\sqrt{t})$. Consistent with power rule: $d/dt[t^{1/2}] = \\tfrac{1}{2}t^{-1/2}$. At $t = 25$ s, $v = 0.1$ m/s. The velocity decreases toward zero as $t$ grows — the position curve flattens out.",
    },
  ],

  checkpoints: [
    {
      id: 'p1-ch2-007-cp1',
      question: `Use the limit definition to find $v(t)$ for $x(t) = 5t^2$. What is $v(3)$?`,
      answer: `$[(5(t+h)^2 - 5t^2]/h = [10th + 5h^2]/h = 10t + 5h \\to 10t$ as $h \\to 0$. So $v(t) = 10t$, and $v(3) = 30$ m/s.`,
    },
    {
      id: 'p1-ch2-007-cp2',
      question: `Why does the central difference formula give a smaller error than the forward difference for the same step size $h$?`,
      answer: `The forward difference is a first-order approximation (error $\\sim h$). The central difference is a second-order approximation (error $\\sim h^2$) because the leading error term in the Taylor expansion cancels between the $+h$ and $-h$ evaluations. For $h = 0.01$: forward error $\\sim 0.01$; central error $\\sim 0.0001$.`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Convergence table: forward vs central difference',
          type: 'code',
          language: 'python',
          code: `import numpy as np

def x(t): return t**3
def v_exact(t): return 3*t**2   # power rule

t0 = 1.0
true_v = v_exact(t0)   # = 3.0

print(f"{'h':>12} | {'forward':>14} | {'central':>14} | {'fwd err':>12} | {'cen err':>12}")
print("-" * 72)
for h in [1e-1, 1e-2, 1e-3, 1e-4, 1e-6, 1e-8]:
    fwd = (x(t0+h) - x(t0)) / h
    cen = (x(t0+h) - x(t0-h)) / (2*h)
    print(f"{h:>12.2e} | {fwd:>14.8f} | {cen:>14.8f} | {abs(fwd-true_v):>12.2e} | {abs(cen-true_v):>12.2e}")`,
          prose: [
            `The forward difference $[x(t_0+h)-x(t_0)]/h$ is the secant slope from $t_0$ to $t_0+h$. The central difference $[x(t_0+h)-x(t_0-h)]/(2h)$ uses a symmetric interval around $t_0$. Both approximate $v(t_0) = 3t_0^2 = 3$, but with very different accuracy.`,
            `As $h$ decreases from 0.1 to $10^{-8}$, the forward error shrinks proportionally (O(h)) while the central error shrinks as $h^2$ — much faster. At $h = 0.01$, the forward error is roughly 100× larger than the central error. This is the practical reason central differences are used in numerical simulations.`,
            `At very small $h$ (like $10^{-12}$ or smaller), round-off error in floating-point arithmetic starts to grow. This is the "optimal $h$" trade-off: truncation error (large $h$) vs round-off error (tiny $h$). The sweet spot for double precision is around $h \\approx 10^{-8}$ for forward, $h \\approx 10^{-5}$ for central.`,
          ],
        },
        {
          cellTitle: 'Visualize x(t) and its derivative v(t)',
          type: 'code',
          language: 'python',
          code: `import matplotlib.pyplot as plt

t = np.linspace(0, 4, 1000)
x_poly = 3*t**2 - 2*t + 1

# Analytical velocity (power rule)
v_analytical = 6*t - 2

# Numerical velocity using central differences
v_numerical = np.gradient(x_poly, t)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
ax1.plot(t, x_poly, 'b-', linewidth=2)
ax1.set_xlabel('t (s)'); ax1.set_ylabel('x (m)')
ax1.set_title('x(t) = 3t² − 2t + 1'); ax1.grid(True, alpha=0.4)

ax2.plot(t, v_analytical, 'r-', linewidth=2, label='v = 6t − 2 (exact)')
ax2.plot(t, v_numerical, 'g--', linewidth=1.5, label='np.gradient (numerical)')
ax2.set_xlabel('t (s)'); ax2.set_ylabel('v (m/s)')
ax2.set_title('Derivative: exact vs numerical'); ax2.legend(); ax2.grid(True, alpha=0.4)

plt.tight_layout()
plt.savefig('derivative_comparison.png', dpi=100, bbox_inches='tight')
plt.show()
print(f"Max error: {np.max(np.abs(v_numerical - v_analytical)):.2e} m/s")`,
          prose: [
            `\`np.gradient(x_poly, t)\` computes the numerical derivative using central differences at interior points and one-sided differences at the endpoints. It is NumPy's built-in implementation of $dx/dt \\approx [x(t+h)-x(t-h)]/(2h)$, applied element-wise across the time array.`,
            `The left panel shows $x(t) = 3t^2 - 2t + 1$: a parabola curving upward. The right panel shows both the exact $v(t) = 6t - 2$ (red, linear) and the numerical estimate (green dashed). The two curves should be nearly indistinguishable, confirming that the power-rule derivative and the limit-based definition agree exactly.`,
            `The maximum error printed at the end is typically on the order of $10^{-9}$ m/s — this is machine-precision error, not conceptual error. The derivative and the limit definition are the same object; the tiny residual is just floating-point rounding.`,
          ],
        },
        {
          cellTitle: 'Prove the power rule symbolically with SymPy',
          type: 'code',
          language: 'python',
          code: `from sympy import symbols, expand, limit, factor

t, h = symbols('t h')

# Test for n = 3
n = 3
diff_quotient = ((t+h)**n - t**n) / h
expanded = expand(diff_quotient)
print(f"Difference quotient (expanded): {expanded}")

lim_val = limit(diff_quotient, h, 0)
print(f"Limit as h → 0: {lim_val}")
print(f"Power rule: n*t^(n-1) = {n}*t^{n-1}")

# Generalize: verify for n = 4
n4 = 4
lim4 = limit(((t+h)**n4 - t**n4) / h, h, 0)
print(f"\\nFor n=4: limit = {lim4}  (expected: 4t³)")`,
          prose: [
            `SymPy's \`expand\` function performs the algebraic expansion of $(t+h)^3 - t^3$ and divides by $h$ symbolically — showing you the full expression $3t^2 + 3th + h^2$ before the limit is taken. This is the algebraic simplification step that makes the $h$ cancellation visible.`,
            `SymPy's \`limit(expr, h, 0)\` evaluates $\\lim_{h \\to 0}$ symbolically. It confirms that the $3th$ and $h^2$ terms vanish, leaving exactly $3t^2$. This is the power rule proved from first principles — the computer is executing the same steps you did by hand in Example 2.`,
            `Repeating for $n = 4$ demonstrates the pattern: the limit always gives $nt^{n-1}$. SymPy handles arbitrary $n$ using the binomial theorem internally — the same proof strategy works for all positive integers, and can be extended to rationals and reals.`,
          ],
        },
        {
          cellTitle: 'Challenge: find the optimal h for numerical differentiation',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np
import matplotlib.pyplot as plt

t0 = np.pi / 4
exact = np.cos(t0)   # d/dt[sin(t)] = cos(t)

# TODO: compute forward and central difference errors for
# h = 10^-k, k = 1..15 (use np.logspace(-1, -15, 30))
# Plot log10(|error|) vs log10(h) for both methods
# Identify the h that minimises error for each method
`,
          prose: [
            `The goal is to find the step size $h$ that balances truncation error (too large $h$) against floating-point round-off error (too small $h$). For $x(t) = \\sin(t)$ at $t = \\pi/4$, the exact velocity is $\\cos(\\pi/4) = 1/\\sqrt{2}$.`,
            `Use \`h_vals = np.logspace(-1, -15, 30)\` to generate 30 values of $h$ from 0.1 down to $10^{-15}$. For each $h$, compute forward error \`abs((sin(t0+h) - sin(t0))/h - exact)\` and central error. Plot both on a log-log scale — you should see a V-shape.`,
            `Expected result: forward difference minimum error near $h \\approx 10^{-8}$; central difference minimum near $h \\approx 10^{-5}$. Below these optimal values, floating-point precision limits overwhelm the mathematical convergence — the actual reason why you cannot just use arbitrarily small $h$ in practice.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Convergence table: forward vs central difference',
          type: 'code',
          language: 'matlab',
          code: `t0 = 1.0;
true_v = 3 * t0^2;   % exact v(1) = 3 for x = t^3

fprintf('%-12s | %-14s | %-14s | %-12s | %-12s\\n', ...
    'h', 'forward', 'central', 'fwd err', 'cen err');
fprintf('%s\\n', repmat('-', 1, 72));

h_vals = [1e-1, 1e-2, 1e-3, 1e-4, 1e-6, 1e-8];
for h = h_vals
    fwd = (x_cube(t0+h) - x_cube(t0)) / h;
    cen = (x_cube(t0+h) - x_cube(t0-h)) / (2*h);
    fprintf('%12.2e | %14.8f | %14.8f | %12.2e | %12.2e\\n', ...
        h, fwd, cen, abs(fwd - true_v), abs(cen - true_v));
end

function y = x_cube(t)
    y = t.^3;
end`,
          prose: [
            `A local function \`x_cube\` defines $x(t) = t^3$ in MATLAB syntax. The \`.\` operator in \`t.^3\` ensures element-wise exponentiation so the function works on both scalars and arrays. This matches how MATLAB handles vectorized computation — necessary for plotting and bulk evaluation.`,
            `The \`for\` loop iterates over the array \`h_vals\`, computing both forward and central difference estimates at each step size. \`fprintf\` formats the output as a table showing all four quantities side by side — the standard way to diagnose numerical convergence in a MATLAB script.`,
            `Observe the convergence rates: forward errors shrink by a factor of 10 for each 10× reduction in $h$ (O(h)); central errors shrink by a factor of 100 (O(h²)). This confirms the theoretical analysis and demonstrates why central differences are preferable in practice.`,
          ],
        },
        {
          cellTitle: 'Visualize x(t) and the numerical derivative',
          type: 'code',
          language: 'matlab',
          code: `t = linspace(0, 4, 1000);
x_poly = 3*t.^2 - 2*t + 1;

% Analytical velocity (power rule)
v_analytical = 6*t - 2;

% Numerical velocity using gradient (central differences)
v_numerical = gradient(x_poly, t);

figure;
subplot(1,2,1);
plot(t, x_poly, 'b-', 'LineWidth', 2);
xlabel('t (s)'); ylabel('x (m)');
title('x(t) = 3t² − 2t + 1'); grid on;

subplot(1,2,2);
plot(t, v_analytical, 'r-', 'LineWidth', 2, 'DisplayName', 'v = 6t − 2 (exact)');
hold on;
plot(t, v_numerical, 'g--', 'LineWidth', 1.5, 'DisplayName', 'gradient (numerical)');
xlabel('t (s)'); ylabel('v (m/s)');
title('Derivative: exact vs numerical');
legend; grid on;

fprintf('Max error: %.2e m/s\\n', max(abs(v_numerical - v_analytical)));`,
          prose: [
            `\`gradient(x_poly, t)\` is MATLAB's built-in central difference differentiator. It computes the derivative of the \`x_poly\` array with respect to the \`t\` array, using central differences at interior points and one-sided differences at the endpoints. This is the MATLAB equivalent of NumPy's \`np.gradient\`.`,
            `The two panels show position and velocity side by side. The exact velocity $v = 6t - 2$ is a straight line (constant acceleration). The numerical estimate from \`gradient\` should overlay it exactly at this scale, confirming that the finite-difference approximation is highly accurate when the time step is small.`,
            `The \`fprintf\` line reports the maximum absolute error between the exact and numerical velocity. A value near $10^{-9}$ or smaller confirms that the numerical derivative is essentially exact — the residual is floating-point arithmetic noise, not a conceptual error in the limit approximation.`,
          ],
        },
        {
          cellTitle: 'Prove the power rule symbolically with the Symbolic Toolbox',
          type: 'code',
          language: 'matlab',
          code: `% Requires MATLAB Symbolic Math Toolbox (or Octave with symbolic package)
syms t h

n = 3;
diff_quotient = ((t+h)^n - t^n) / h;
expanded = expand(diff_quotient);
fprintf('Difference quotient (n=%d): %s\\n', n, char(expanded));

lim_val = limit(diff_quotient, h, 0);
fprintf('Limit as h → 0: %s\\n', char(lim_val));
fprintf('Power rule: %d*t^%d\\n', n, n-1);

% Verify for n = 4
lim4 = limit(((t+h)^4 - t^4) / h, h, 0);
fprintf('For n=4: limit = %s  (expected: 4t^3)\\n', char(lim4));`,
          prose: [
            `\`syms t h\` declares symbolic variables — MATLAB's way of doing computer algebra. The expression \`((t+h)^n - t^n) / h\` is computed symbolically, not numerically, so \`expand\` can show you the exact polynomial form before any limits are taken.`,
            `\`limit(expr, h, 0)\` evaluates $\\lim_{h \\to 0}$ using the Symbolic Math Toolbox. MATLAB internally uses the binomial expansion and algebraic simplification — the same steps done by hand in Example 2 — and confirms that only the $nt^{n-1}$ term survives.`,
            `In Octave (the open-source MATLAB alternative), the \`symbolic\` package provides the same \`syms\`, \`expand\`, and \`limit\` commands. The code above runs unchanged in Octave after \`pkg load symbolic\`. This makes the power-rule proof accessible without a commercial MATLAB license.`,
          ],
        },
        {
          cellTitle: 'Challenge: find the optimal h for numerical differentiation',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `t0 = pi / 4;
exact = cos(t0);   % d/dt[sin(t)] = cos(t)

% TODO: compute forward and central difference errors for
% h = logspace(-1, -15, 30)
% Plot log10(|error|) vs log10(h) for both methods on the same axes
% Print the h that minimises each error
`,
          prose: [
            `\`logspace(-1, -15, 30)\` generates 30 values of $h$ spaced logarithmically from 0.1 down to $10^{-15}$. For each $h$, compute the forward error \`abs((sin(t0+h) - sin(t0))/h - exact)\` and the central error. Store both in arrays.`,
            `Plot both error arrays against $h$ using \`loglog\` for a log-log scale. The plot should show a V-shape: errors decrease (the limit converges) as $h$ decreases, then increase again as round-off error dominates. The minimum of each V is the optimal $h$.`,
            `Expected MATLAB output: forward minimum near $h \\approx 10^{-8}$; central minimum near $h \\approx 10^{-5}$. Use \`[~, idx] = min(errors)\` to find the index of the minimum, then read \`h_vals(idx)\` to get the optimal value.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch2-007-q1',
      type: 'choice',
      question: `Why can't we just set $h = 0$ in $[x(t+h) - x(t)]/h$ to find instantaneous velocity?`,
      options: [
        `Because $h$ must be large`,
        `Because setting $h = 0$ gives $0/0$, an indeterminate form`,
        `Because position is always zero at $t = 0$`,
        `Because velocity is always infinite`,
      ],
      answer: `Because setting $h = 0$ gives $0/0$, an indeterminate form`,
      hints: [
        `What happens to the numerator $x(t+h) - x(t)$ when you set $h = 0$?`,
        `What happens to the denominator? Is 0/0 a valid number?`,
      ],
      reviewSection: 'intuition',
      explanation: `Setting $h = 0$ gives $[x(t) - x(t)]/0 = 0/0$. This is undefined. The limit approaches $h = 0$ without reaching it — algebraic cancellation removes the $h$ from the denominator first.`,
    },
    {
      id: 'p1-ch2-007-q2',
      type: 'choice',
      question: `The derivative $dx/dt$ is defined as:`,
      options: [
        `$\\Delta x / \\Delta t$ for large $\\Delta t$`,
        `$\\lim_{h \\to 0} \\frac{x(t+h)-x(t)}{h}$`,
        `$x(t+1) - x(t)$`,
        `$x \\cdot t$`,
      ],
      answer: `$\\lim_{h \\to 0} \\frac{x(t+h)-x(t)}{h}$`,
      hints: [
        `The derivative is a limit — which option involves a limit?`,
        `The notation $h \\to 0$ means "as h approaches zero." Which option has this?`,
      ],
      reviewSection: 'math',
      explanation: `$v(t) = dx/dt = \\lim_{h \\to 0} [x(t+h)-x(t)]/h$. This is the formal definition of the derivative.`,
    },
    {
      id: 'p1-ch2-007-q3',
      type: 'choice',
      question: `For $x(t) = 3t^2 - 2t + 1$, what is $v(2)$?`,
      options: [`10 m/s`, `12 m/s`, `6 m/s`, `14 m/s`],
      answer: `10 m/s`,
      hints: [
        `First differentiate: $v(t) = d/dt[3t^2 - 2t + 1]$.`,
        `Then substitute $t = 2$ into the velocity function.`,
      ],
      reviewSection: 'examples',
      explanation: `$v(t) = 6t - 2$ (power rule). At $t = 2$: $v(2) = 6(2) - 2 = 10$ m/s.`,
    },
    {
      id: 'p1-ch2-007-q4',
      type: 'choice',
      question: `The forward difference $[x(t+h)-x(t)]/h$ has an error that scales as:`,
      options: [`$h^2$`, `$h$`, `$1/h$`, `$h^3$`],
      answer: `$h$`,
      hints: [
        `When you halve $h$, what happens to the forward difference error?`,
        `O(h) means the error is proportional to $h$. O(h²) means it's proportional to $h^2$.`,
      ],
      reviewSection: 'math',
      explanation: `Forward difference error is O(h) — halving $h$ halves the error. Central difference is O(h²) — halving $h$ quarters the error.`,
    },
    {
      id: 'p1-ch2-007-q5',
      type: 'choice',
      question: `Geometrically, the derivative at a point equals:`,
      options: [
        `Area under the curve up to that point`,
        `Slope of the tangent line at that point`,
        `Height of the curve at that point`,
        `Length of the curve up to that point`,
      ],
      answer: `Slope of the tangent line at that point`,
      hints: [
        `The difference quotient $[x(t+h)-x(t)]/h$ is the slope of what line?`,
        `What happens to that line as $h \\to 0$?`,
      ],
      reviewSection: 'intuition',
      explanation: `As $h \\to 0$, the secant through $(t, x(t))$ and $(t+h, x(t+h))$ approaches the tangent at $(t, x(t))$. The limit of the secant slope is the slope of the tangent = the derivative.`,
    },
    {
      id: 'p1-ch2-007-q6',
      type: 'choice',
      question: `From first principles, $d/dt[t^3]$ is found by:`,
      options: [
        `Expanding $(t+h)^3$, cancelling $h$, then taking the limit to get $3t^2$`,
        `Multiplying $t^3$ by 3`,
        `Setting $t = 0$ in the difference quotient`,
        `Integrating $t^3$`,
      ],
      answer: `Expanding $(t+h)^3$, cancelling $h$, then taking the limit to get $3t^2$`,
      hints: [
        `The three-step procedure: (1) write the difference quotient, (2) simplify, (3) take the limit.`,
        `After expanding $(t+h)^3$ and subtracting $t^3$, the $h$ in the numerator cancels with the $h$ in the denominator.`,
      ],
      reviewSection: 'examples',
      explanation: `Expand $(t+h)^3 = t^3 + 3t^2h + 3th^2 + h^3$. Subtract $t^3$, divide by $h$: $3t^2 + 3th + h^2$. Take limit: $3t^2$.`,
    },
    {
      id: 'p1-ch2-007-q7',
      type: 'choice',
      question: `Why does extremely small $h$ (like $h = 10^{-15}$) reduce numerical differentiation accuracy?`,
      options: [
        `Because the limit hasn't converged yet`,
        `Because floating-point round-off error dominates when $h$ is near machine epsilon`,
        `Because the position function is not differentiable`,
        `Because large $h$ is always more accurate`,
      ],
      answer: `Because floating-point round-off error dominates when $h$ is near machine epsilon`,
      hints: [
        `Double-precision machine epsilon is about $10^{-16}$. What happens when $h$ is smaller than that?`,
        `If $x(t+h)$ and $x(t)$ round to the same float, what does the numerator become?`,
      ],
      reviewSection: 'math',
      explanation: `When $h < 10^{-12}$, $x(t+h)$ and $x(t)$ become indistinguishable in double precision. The numerator becomes exactly 0, destroying accuracy. Optimal $h$ balances truncation and round-off error.`,
    },
    {
      id: 'p1-ch2-007-q8',
      type: 'choice',
      question: `For $x(t) = \\sin(t)$, the instantaneous velocity is:`,
      options: [`$-\\sin(t)$`, `$\\cos(t)$`, `$\\tan(t)$`, `$-\\cos(t)$`],
      answer: `$\\cos(t)$`,
      hints: [
        `The derivative of $\\sin(t)$ is a standard result. Can you derive it from the angle addition formula?`,
        `$\\lim_{h \\to 0} \\sin(h)/h = 1$ and $\\lim_{h \\to 0} (\\cos h - 1)/h = 0$ are the two key trig limits needed.`,
      ],
      reviewSection: 'challenges',
      explanation: `$v(t) = d/dt[\\sin(t)] = \\cos(t)$. Proved from first principles using angle addition: $[\\sin(t+h)-\\sin(t)]/h = \\sin(t) \\cdot [\\cos h -1]/h + \\cos(t) \\cdot \\sin(h)/h \\to \\cos(t)$.`,
    },
    {
      id: 'p1-ch2-007-q9',
      type: 'choice',
      question: `For $x(t) = 1/t$, what is the instantaneous velocity $v(t)$?`,
      options: [`$-1/t$`, `$-1/t^2$`, `$1/t^2$`, `$\\ln(t)$`],
      answer: `$-1/t^2$`,
      hints: [
        `Set up the difference quotient $[1/(t+h) - 1/t]/h$ and combine over a common denominator.`,
        `After combining, the numerator is $-h$; cancel with the $h$ in the denominator, then take $h \\to 0$.`,
      ],
      reviewSection: 'examples',
      explanation: `$[1/(t+h) - 1/t]/h = [-h/(t(t+h))]/h = -1/(t(t+h)) \\to -1/t^2$ as $h \\to 0$. Consistent with the power rule: $d/dt[t^{-1}] = -t^{-2}$.`,
    },
    {
      id: 'p1-ch2-007-q10',
      type: 'choice',
      question: `If you halve the step size $h$ for the central difference formula, what happens to the error?`,
      options: [
        `It is halved`,
        `It stays the same`,
        `It is reduced by a factor of 4`,
        `It doubles`,
      ],
      answer: `It is reduced by a factor of 4`,
      hints: [
        `Central difference error scales as O(h²).`,
        `If $h$ is halved ($h \\to h/2$), then $h^2 \\to h^2/4$.`,
      ],
      reviewSection: 'math',
      explanation: `Central difference error $\\sim h^2$. Halving $h$ gives $(h/2)^2 = h^2/4$, reducing the error by a factor of 4. This is why central differences converge faster than forward differences as $h$ decreases.`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch2-007-m1',
      misconception: `"The instantaneous velocity at time $t$ is just the average velocity over a very small interval."`,
      correction: `Instantaneous velocity is the limit of average velocities as the interval shrinks to zero — not simply "a very small average." The limit may equal the limit of small averages, but the concept is precise: we define $v(t)$ as the number that the average converges to, not as any particular small average. The distinction matters when discussing error analysis and differentiability.`,
      correctionExample: `For $x(t) = t^3$ at $t = 1$: the average over $[1, 1.01]$ is 3.0301 m/s (not exactly 3). The instantaneous velocity is exactly 3 m/s. The limit equals 3, even though no finite interval gives 3.`,
    },
    {
      id: 'p1-ch2-007-m2',
      misconception: `"Smaller $h$ always gives a more accurate numerical derivative."`,
      correction: `This is only true down to the floating-point precision limit. Below $h \\approx 10^{-8}$ (for double precision and forward differences), the numerator $x(t+h) - x(t)$ loses significant digits due to catastrophic cancellation, and the error starts growing. The optimal $h$ is around $10^{-8}$ for forward differences and $10^{-5}$ for central differences.`,
      correctionExample: `At $h = 10^{-15}$, Python computes \`(sin(1+h) - sin(1))/h ≈ 0\` due to round-off — even though the true derivative \`cos(1) ≈ 0.5403\` is clearly nonzero.`,
    },
  ],

  transferPrompts: [
    `In economics, if $P(t)$ is the price of a stock, then $P'(t)$ is the "instantaneous rate of return." Translate the limit definition: what would it mean to measure $[P(t+h) - P(t)]/h$ for a stock price? What $h$ values are physically meaningful (seconds, days, years)? What does a discontinuity in $P(t)$ mean for $P'(t)$?`,
    `The electric current $I$ is defined as $I = dQ/dt$ — the instantaneous rate of charge flow. Write the limit definition of current from the definition of average current $\\bar{I} = \\Delta Q / \\Delta t$. In a circuit that charges a capacitor, $Q(t) = Q_0(1 - e^{-t/RC})$. Find the current $I(t)$ by differentiation.`,
  ],

  debugging: [
    {
      id: 'p1-ch2-007-d1',
      buggyWork: `Student computes: "$v(t) = \\lim_{h \\to 0} [x(t+h) - x(t)] / h$. For $x(t) = 5$, the answer is $v = 5/0$, which is undefined."`,
      question: `What is wrong with this reasoning?`,
      answer: `$x(t) = 5$ is a constant — the object is stationary. The difference quotient is $[5 - 5]/h = 0/h = 0$ for all $h \\neq 0$. The limit is $\\lim_{h \\to 0} 0 = 0$. The student made an error before the limit: the numerator is $x(t+h) - x(t) = 5 - 5 = 0$, not $5$.  The velocity of a stationary object is zero, not undefined.`,
    },
    {
      id: 'p1-ch2-007-d2',
      buggyWork: `Student writes: "For $x(t) = t^2$, I set up $[(t+h)^2 - t^2]/h = [t^2 + h^2 - t^2]/h = h^2/h = h$. As $h \\to 0$: $v = 0$."`,
      question: `Find the algebra error.`,
      answer: `The student incorrectly expanded $(t+h)^2 = t^2 + h^2$, missing the cross term. The correct expansion is $(t+h)^2 = t^2 + 2th + h^2$. The correct difference quotient is $[t^2 + 2th + h^2 - t^2]/h = [2th + h^2]/h = 2t + h \\to 2t$. So $v(t) = 2t$, not 0.`,
    },
  ],

  mastery: {
    targetLevel: `Apply the limit definition to compute derivatives for polynomial, rational, and radical functions; compare numerical finite-difference estimates; and explain the physical meaning of the limit as the instantaneous-velocity concept.`,
    coreSkill: `Setting up and evaluating the difference quotient $[x(t+h)-x(t)]/h$ — algebraically simplifying to cancel $h$, then taking the limit — for at least three function types.`,
    commonSticking: `Students often try to substitute $h = 0$ before simplifying, getting 0/0 and concluding the derivative is undefined. The algebraic simplification step (cancellation of $h$) must happen first.`,
    connections: `Directly connects to all differentiation rules in calculus (which are theorems proved from this definition), numerical methods in computing, and the physical interpretation of rate of change that appears in every subsequent physics topic.`,
  },

  semantics: {
    core: [
      { symbol: `\\Delta x / \\Delta t`, meaning: `Average velocity over a finite time interval — the secant slope on the x–t graph.` },
      { symbol: `\\lim_{h \\to 0}`, meaning: `The limit process: approach but never reach the value $h = 0$, observing what the expression converges to.` },
      { symbol: `dx/dt`, meaning: `Instantaneous velocity — the limit of the average velocity as the time interval shrinks to zero; the tangent slope on the x–t graph.` },
      { symbol: `[x(t+h)-x(t)]/h`, meaning: `The difference quotient — average velocity over $[t, t+h]$; also the slope of the secant through $(t, x(t))$ and $(t+h, x(t+h))$.` },
      { symbol: `h \\to 0`, meaning: `The step size $h$ approaches zero — not equal to zero, but converging toward it.` },
    ],
    rulesOfThumb: [
      `Never substitute $h = 0$ before simplifying — cancel $h$ algebraically first.`,
      `Central difference $[x(t+h)-x(t-h)]/(2h)$ is more accurate than forward difference for the same $h$.`,
      `Optimal numerical step: $h \\approx 10^{-8}$ for forward difference, $h \\approx 10^{-5}$ for central difference in double precision.`,
      `The secant slope approaches the tangent slope as the interval shrinks — this geometric fact IS the derivative.`,
      `Differentiable $\\Rightarrow$ continuous, but continuous $\\not\\Rightarrow$ differentiable (e.g., corners have no unique tangent).`,
    ],
  },
};

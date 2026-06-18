export default {
  id: 'p1-ch2-006',
  slug: 'linked-motion-graphs',
  chapter: 'p2',
  order: 6,
  title: "Linking x(t), v(t), and a(t)",
  subtitle:
    "One motion, three graphs. Differentiate downward, integrate upward — and never lose the thread.",
  tags: ["triple graph", "derivative chain", "integral chain", "kinematics", "differentiation", "integration"],
  aliases: "x v a relationship triple graphs position velocity acceleration linked",

  hook: {
    question:
      "An engineering team has three screens: one showing x(t), one showing v(t), and one showing a(t) for the same rocket launch. Suddenly, x(t) shows a brief pause in climb. What must v(t) and a(t) look like at that moment? Can you predict the shape of all three screens from just one of them?",
    realWorldContext:
      "Flight computers, robotics trajectory planners, and biomechanics labs routinely transform between these three representations. A physical therapist analyzing a patient's gait reads x(t) from motion capture, then computes v(t) and a(t) numerically to detect muscle force abnormalities. A rocket guidance system compares commanded a(t) against measured a(t) from an accelerometer, then integrates twice to estimate x(t). Understanding the three-graph chain — and how to move up and down it — is the core skill that connects physics to calculus.",
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      `Before reading on, predict: an x–t graph shows a smooth peak at $t = 2$ s — the object reaches its farthest point and then turns back. Without any calculation, write down: what must $v(t)$ equal at exactly $t = 2$ s? What sign must $a(t)$ have just after the peak? Sketch both graphs before reading on.`,
      "Position, velocity, and acceleration are not three separate things — they are one motion described three different ways. Every physical trajectory generates all three graphs simultaneously. If you know any one of them completely (plus initial conditions), you can reconstruct the other two exactly. The chain is: x(t) → differentiate → v(t) → differentiate → a(t), and in reverse: a(t) → integrate → v(t) → integrate → x(t).",
      "Reading the chain downward (differentiation): the slope of x(t) at each moment is v(t) at that moment. When the x-graph climbs steeply, the v-graph is large and positive. When x peaks (flat tangent), v = 0. When x descends, v is negative. Apply the same logic one more time: the slope of v(t) is a(t). When v is increasing, a is positive. When v peaks, a = 0. When v decreases, a is negative.",
      `Reading the chain upward (integration): the area under $a(t)$ from $t_1$ to $t_2$ gives the change in velocity $\\Delta v$. The area under $v(t)$ from $t_1$ to $t_2$ gives the displacement $\\Delta x$. This is the FTC in physics clothing — and it runs in the opposite direction from differentiation. To reconstruct $x(t)$ from $a(t)$, you need two pieces of information the a-graph cannot provide: the initial position $x_0$ and the initial velocity $v_0$. These are the constants of integration.`,
      "The key mental skill is reading features across all three graphs for the same instant: a flat spot on x (local max or min) corresponds to a zero crossing on v and a nonzero value of a. An inflection point on x corresponds to a local extremum on v and a zero crossing on a. These correspondences let you check consistency — if the graphs disagree at any instant, one of them is wrong.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Reading the triple graph — five questions to ask',
        body: `1. Where does x have a peak or trough? → v = 0 at those times. 2. Where does x have an inflection point? → v has a peak or trough → a = 0 there. 3. What is the sign of x's slope? → sign of v at that instant. 4. Is x curving up or down? → sign of a over that interval. 5. What is the area under v (or a) over an interval? → Δx (or Δv) for that interval.`,
      },
      {
        type: 'insight',
        title: 'Feature Translation Table',
        body: `x has a peak or trough → v = 0 at that moment. x has an inflection point → v has a peak or trough → a = 0. x has constant slope → v is constant → a = 0. x curves upward → v is increasing → a is positive. Memorize this table: it is the core of triple-graph reading.`,
      },
      {
        type: 'insight',
        title: 'Calculus Connection: This IS Differential Calculus',
        body: `The derivative chain $v = dx/dt$, $a = dv/dt = d^2x/dt^2$ is the core application of differential calculus. The integral chain $\\Delta x = \\int v\\,dt$, $\\Delta v = \\int a\\,dt$ is the core application of integral calculus. Kinematics is not just "using calculus" — it IS calculus applied to motion.`,
      },
      {
        type: 'insight',
        title: 'Initial Conditions Are Required for Integration',
        body: `Differentiation is unique: given $x(t)$, there is exactly one $v(t)$ and one $a(t)$. Integration is not: given $a(t)$, there are infinitely many $v(t)$ functions (differing by $C_1$). Initial conditions $x_0$ and $v_0$ pin down these constants. Without them you know the shape but not where the motion starts.`,
      },
      {
        type: 'warning',
        title: 'The Graphs Are NOT Independent',
        body: `Students sometimes draw x, v, and a graphs that are mutually inconsistent — for example a v-graph with a peak where the x-graph has no inflection point. This is mathematically impossible. The three graphs are coupled: they are different representations of the same function. Always verify that the slope of x matches the value of v, and the slope of v matches the value of a.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'The x → v → a chain',
        caption: 'Each arrow is a derivative; each reverse arrow is an integral. The entire kinematics course lives in this one diagram.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'xt-vt-graphs' },
        title: 'x–v–a: one motion, three synchronized views',
        caption: `Peaks on x–t → zero crossing on v–t. Inflection points on x–t → peaks/troughs on v–t → zero on a–t. Steep x → large v. Constant x-slope → constant v → zero a.`,
      },
    ],
  },

  math: {
    prose: [
      `The formal chain uses derivatives and antiderivatives. Going down: $v(t) = dx/dt$ (instantaneous velocity is the time-derivative of position); $a(t) = dv/dt = d^2x/dt^2$ (acceleration is the first derivative of velocity, or equivalently the second derivative of position).`,
      `Going up: given $a(t)$ and initial conditions, find $v(t) = v_0 + \\int_0^t a(t')\\,dt'$ by integrating once; find $x(t) = x_0 + \\int_0^t v(t')\\,dt'$ by integrating again. The notation $v_0 = v(0)$ and $x_0 = x(0)$ is standard for the initial values at $t = 0$.`,
      `For constant acceleration the integrals close in algebra: $v(t) = v_0 + at$ and $x(t) = x_0 + v_0 t + \\tfrac{1}{2}at^2$. These are the SUVAT equations — they are what you get from integrating the constant-a graph twice and applying initial conditions. Calculus proves them; algebra is just the simplified result.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Derivative chain (going down)',
        body: `v(t) = \\frac{dx}{dt}, \\qquad a(t) = \\frac{dv}{dt} = \\frac{d^2x}{dt^2}`,
      },
      {
        type: 'theorem',
        title: 'Integral chain (going up)',
        body: `v(t) = v_0 + \\int_0^t a(t')\\,dt', \\qquad x(t) = x_0 + \\int_0^t v(t')\\,dt'`,
      },
      {
        type: 'definition',
        title: 'SUVAT (constant acceleration only)',
        body: `v = v_0 + at, \\quad x = x_0 + v_0 t + \\tfrac{1}{2}at^2, \\quad v^2 = v_0^2 + 2a\\,\\Delta x`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'Choosing the right operation',
        caption: `Going from x to v: differentiate (d/dt). From v to a: differentiate again. Going from a to v: integrate (add initial condition v₀). From v to x: integrate again (add x₀). Identify your starting point and destination in the chain, then choose differentiation or integration accordingly.`,
      },
    ],
  },

  rigor: {
    title: "Why the chain works — FTC applied twice",
    prose: [
      `The chain is a direct consequence of the Fundamental Theorem of Calculus (FTC) applied twice. First application: since $v = dx/dt$, the FTC says $\\int_{t_1}^{t_2} v(t)\\,dt = x(t_2) - x(t_1) = \\Delta x$. The statement "area under v–t gives displacement" is the FTC — nothing more, nothing less.`,
      `Second application: since $a = dv/dt$, the FTC gives $\\int_{t_1}^{t_2} a(t)\\,dt = v(t_2) - v(t_1) = \\Delta v$. These two FTC statements are the entire mathematical foundation of kinematic graph reading. Every area-under-curve and every slope-reading technique in kinematics is the FTC wearing different clothing.`,
      `The uniqueness of the reconstruction (given initial conditions) follows from the uniqueness theorem for antiderivatives: if two functions have the same derivative everywhere, they differ by at most a constant. So there is exactly one velocity function consistent with a given acceleration function AND a given $v_0$. This is why initial conditions fully determine the solution — they specify the otherwise-free constant of integration.`,
      `This chain generalizes far beyond kinematics. In electromagnetism the electric field $E = -dV/dx$ is the derivative of the potential, and the charge density is proportional to $dE/dx$ — the same three-level chain with the same FTC rules. In signal processing, displacement, velocity, and acceleration correspond to three different frequency weightings of the same waveform. Whenever one physical quantity is the derivative of another, the FTC governs how you move between them.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'FTC applied to kinematics',
        body: `\\Delta x = \\int_{t_1}^{t_2} v(t)\\,dt, \\qquad \\Delta v = \\int_{t_1}^{t_2} a(t)\\,dt`,
      },
    ],
  },

  examples: [
    {
      id: 'p1-ch2-006-ex1',
      title: "Reconstruct position from constant acceleration",
      problem:
        "An object starts at $x_0 = 5$ m with $v_0 = 2$ m/s and constant acceleration $a = 3$ m/s². Find $v(t)$ and $x(t)$, then evaluate both at $t = 4$ s.",
      steps: [
        {
          expression: `v(t) = v_0 + at = 2 + 3t`,
          annotation: "Integrate constant acceleration: $v = v_0 + \\int a\\,dt = v_0 + at$.",
        },
        {
          expression: `x(t) = x_0 + v_0 t + \\tfrac{1}{2}at^2 = 5 + 2t + 1.5t^2`,
          annotation: "Integrate velocity: $x = x_0 + \\int v\\,dt = x_0 + v_0 t + \\tfrac{1}{2}at^2$.",
        },
        {
          expression: `v(4) = 2 + 3(4) = 14 \\text{ m/s}`,
          annotation: "Substitute $t = 4$ into the v-formula.",
        },
        {
          expression: `x(4) = 5 + 2(4) + 1.5(16) = 5 + 8 + 24 = 37 \\text{ m}`,
          annotation: "Substitute $t = 4$ into the x-formula.",
        },
      ],
      conclusion:
        "At $t = 4$ s: $v = 14$ m/s, $x = 37$ m. Both follow directly from integrating down from the constant acceleration with the given initial conditions.",
    },
    {
      id: 'p1-ch2-006-ex2',
      title: "Read from x(t) — find v, a, stops, and direction of acceleration",
      problem:
        "An object's position is $x(t) = 4t^3 - 12t^2 + 9t$. Find $v(t)$ and $a(t)$. When is the object stopped? When is it accelerating positively?",
      steps: [
        {
          expression: `v(t) = \\frac{dx}{dt} = 12t^2 - 24t + 9`,
          annotation: "Differentiate $x(t)$ using the power rule.",
        },
        {
          expression: `a(t) = \\frac{dv}{dt} = 24t - 24`,
          annotation: "Differentiate $v(t)$.",
        },
        {
          expression: `v = 0:\\quad 12t^2 - 24t + 9 = 0 \\Rightarrow t = \\frac{24 \\pm \\sqrt{576 - 432}}{24} = \\frac{24 \\pm 12}{24}`,
          annotation: "Apply the quadratic formula. Two stops exist.",
        },
        {
          expression: `t = \\tfrac{1}{2} \\text{ s and } t = \\tfrac{3}{2} \\text{ s}`,
          annotation: "Object stops at $t = 0.5$ s and $t = 1.5$ s — once going out, once coming back.",
        },
        {
          expression: `a > 0 \\text{ when } 24t - 24 > 0 \\Rightarrow t > 1 \\text{ s}`,
          annotation: "The object accelerates positively for all $t > 1$ s.",
        },
      ],
      conclusion:
        "Object stops at $t = 0.5$ s and $t = 1.5$ s. It accelerates positively for all $t > 1$ s. The entire motion history is encoded in the single formula $x(t)$ — differentiate once or twice to read velocity or acceleration at any instant.",
    },
    {
      id: 'p1-ch2-006-ex3',
      title: "Read from v(t) — find displacement, a(t), and total distance",
      problem:
        "A runner's velocity is $v(t) = 8 - 2t$ m/s. Find $a(t)$, the displacement from $t = 0$ to $t = 4$ s, the total distance traveled, and the time at which the runner stops.",
      steps: [
        {
          expression: `a(t) = \\frac{dv}{dt} = -2 \\text{ m/s}^2`,
          annotation: "Slope of the linear v-graph is constant — uniform deceleration.",
        },
        {
          expression: `v = 0:\\quad 8 - 2t = 0 \\Rightarrow t = 4 \\text{ s}`,
          annotation: "Runner stops at $t = 4$ s.",
        },
        {
          expression: `\\Delta x = \\int_0^4 (8 - 2t)\\,dt = \\left[8t - t^2\\right]_0^4 = 32 - 16 = 16 \\text{ m}`,
          annotation: "Area under v–t (a triangle with base 4 and height 8) gives displacement.",
        },
        {
          expression: `\\text{Total distance} = \\int_0^4 |v(t)|\\,dt`,
          annotation: "Since $v \\geq 0$ throughout $[0, 4]$ (runner never reverses), distance = displacement.",
        },
        {
          expression: `\\text{Total distance} = 16 \\text{ m}`,
          annotation: "Runner traveled 16 m forward before stopping.",
        },
      ],
      conclusion:
        "With a linear v-t graph, you can read everything: $a$ from the slope, stops from zero-crossings, and displacement from the area under the curve. The runner decelerated uniformly from 8 m/s to rest over 4 s, covering exactly 16 m.",
    },
  ],

  challenges: [
    {
      id: 'p1-ch2-006-ch1',
      difficulty: 'medium',
      problem: `If $x(t)$ is a straight line (linear in $t$), what must $v(t)$ and $a(t)$ look like? Justify using the chain.`,
      hint: "Differentiate a linear function twice.",
      walkthrough: [
        {
          step: "Write the general linear position.",
          expression: `x(t) = mt + b`,
          annotation: "m is the slope (constant), b is the initial position.",
        },
        {
          step: "Differentiate once for velocity.",
          expression: `v(t) = \\frac{dx}{dt} = m`,
          annotation: "Derivative of a linear function is a constant. Velocity is the slope — and it does not change.",
        },
        {
          step: "Differentiate again for acceleration.",
          expression: `a(t) = \\frac{dv}{dt} = 0`,
          annotation: "Derivative of a constant is zero. Zero acceleration means no net force.",
        },
      ],
      conclusion:
        "Linear $x(t)$ → constant $v(t)$ → zero $a(t)$. This is uniform motion. The chain tells you: any object moving at constant speed has zero acceleration, regardless of how fast it's going.",
    },
    {
      id: 'p1-ch2-006-ch2',
      difficulty: 'hard',
      problem: `Given $a(t) = \\sin(t)$ with $v(0) = 0$ and $x(0) = 0$, find $x(t)$. At what times, if any, does the object return to $x = 0$ for $t > 0$?`,
      hint: "Integrate $\\sin(t)$ twice and apply each initial condition in turn.",
      walkthrough: [
        {
          step: "Integrate $a(t)$ to get $v(t)$.",
          expression: `v(t) = \\int \\sin(t)\\,dt = -\\cos(t) + C_1`,
          annotation: "Antiderivative of sin is −cos.",
        },
        {
          step: "Apply $v(0) = 0$ to find $C_1$.",
          expression: `-\\cos(0) + C_1 = 0 \\Rightarrow C_1 = 1 \\Rightarrow v(t) = 1 - \\cos(t)`,
          annotation: "The initial condition pins down the constant of integration.",
        },
        {
          step: "Integrate $v(t)$ to get $x(t)$.",
          expression: `x(t) = \\int (1 - \\cos t)\\,dt = t - \\sin(t) + C_2`,
          annotation: "Antiderivatives: $\\int 1\\,dt = t$, $\\int \\cos t\\,dt = \\sin t$.",
        },
        {
          step: "Apply $x(0) = 0$ to find $C_2$.",
          expression: `0 - \\sin(0) + C_2 = 0 \\Rightarrow C_2 = 0 \\Rightarrow x(t) = t - \\sin(t)`,
          annotation: "Second initial condition pins down the second constant.",
        },
        {
          step: "Check whether $x(t) = 0$ for $t > 0$.",
          expression: `x'(t) = 1 - \\cos(t) \\geq 0 \\text{ for all } t`,
          annotation: "Since $\\cos(t) \\leq 1$ always, $x'(t) = v(t) \\geq 0$. The object moves in the positive direction forever (or stays put at $t = 2\\pi k$).",
        },
        {
          step: "Conclude.",
          expression: `x(t) = t - \\sin(t) > 0 \\text{ for all } t > 0`,
          annotation: "The object never returns to $x = 0$. Even though it oscillates in velocity (sometimes momentarily stopped), it keeps drifting forward.",
        },
      ],
      conclusion:
        "$x(t) = t - \\sin(t)$. The object never returns to $x = 0$ for $t > 0$. Despite oscillating acceleration, the velocity $v = 1 - \\cos(t)$ is always non-negative, so position drifts monotonically forward.",
    },
    {
      id: 'p1-ch2-006-ch3',
      difficulty: 'hard',
      problem: `A particle has acceleration $a(t) = 4 - 2t$ m/s² with $v_0 = 0$ m/s and $x_0 = 0$ m. (a) When does it stop? (b) How far has it traveled when it stops? (c) When does it return to $x = 0$?`,
      hint: "Integrate $a(t)$ with v₀ = 0 to get v(t), then set v = 0. Integrate again to get x(t), then set x = 0.",
      walkthrough: [
        {
          step: "Integrate $a(t)$ to get $v(t)$.",
          expression: `v(t) = 0 + \\int_0^t (4 - 2s)\\,ds = 4t - t^2`,
          annotation: "Apply the power rule: $\\int (4 - 2t)\\,dt = 4t - t^2$. Initial velocity v₀ = 0 means no constant.",
        },
        {
          step: "Find when the particle stops.",
          expression: `v = 0:\\quad 4t - t^2 = 0 \\Rightarrow t(4 - t) = 0 \\Rightarrow t = 0 \\text{ or } t = 4 \\text{ s}`,
          annotation: "The particle is stopped at $t = 0$ (initially at rest) and again at $t = 4$ s.",
        },
        {
          step: "Integrate $v(t)$ to get $x(t)$.",
          expression: `x(t) = 0 + \\int_0^t (4s - s^2)\\,ds = 2t^2 - \\frac{t^3}{3}`,
          annotation: "Integrate the velocity function. Initial position x₀ = 0.",
        },
        {
          step: "Find position when the particle stops.",
          expression: `x(4) = 2(16) - \\frac{64}{3} = 32 - \\frac{64}{3} = \\frac{96 - 64}{3} = \\frac{32}{3} \\approx 10.67 \\text{ m}`,
          annotation: "Substitute $t = 4$ into the x-formula.",
        },
        {
          step: "Find when the particle returns to $x = 0$.",
          expression: `2t^2 - \\frac{t^3}{3} = 0 \\Rightarrow t^2\\left(2 - \\frac{t}{3}\\right) = 0 \\Rightarrow t = 0 \\text{ or } t = 6 \\text{ s}`,
          annotation: "Factor out $t^2$. The non-trivial return happens at $t = 6$ s.",
        },
      ],
      conclusion:
        "The particle stops at $t = 4$ s at position $x = 32/3 \\approx 10.67$ m. It then reverses (v becomes negative for $t > 4$) and returns to $x = 0$ at $t = 6$ s. Double-integration from $a(t)$ gives the full trajectory.",
    },
  ],

  checkpoints: [
    {
      id: 'p1-ch2-006-cp1',
      question: `For $x(t) = t^3 - 3t$, find $v(t)$ and $a(t)$. At $t = 1$ s, is the object speeding up, slowing down, or at a turning point?`,
      answer: `$v(t) = 3t^2 - 3$; $v(1) = 3 - 3 = 0$. The object is momentarily stopped (turning point). $a(t) = 6t$; $a(1) = 6 > 0$, so it immediately begins speeding up in the positive direction after $t = 1$.`,
    },
    {
      id: 'p1-ch2-006-cp2',
      question: `Gravity gives $a(t) = -10$ m/s² (constant). A ball is thrown upward with $v_0 = 20$ m/s from $x_0 = 0$. Write $x(t)$ and find when it returns to $x = 0$.`,
      answer: `$v(t) = 20 - 10t$, so $x(t) = 20t - 5t^2$. Setting $x = 0$: $t(20 - 5t) = 0$, giving $t = 0$ or $t = 4$ s. The ball returns to the launch point at $t = 4$ s.`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Differentiate down: x(t) → v(t) → a(t)',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(0, 3, 1000)

# Analytical formulas from Example 2
x = 4*t**3 - 12*t**2 + 9*t   # x(t)
v = 12*t**2 - 24*t + 9        # v(t) = dx/dt
a = 24*t - 24                  # a(t) = dv/dt

fig, axes = plt.subplots(3, 1, figsize=(8, 9), sharex=True)
for ax, y, lbl, col in zip(axes, [x, v, a], ['x (m)', 'v (m/s)', 'a (m/s²)'], ['b','r','g']):
    ax.plot(t, y, color=col, linewidth=2)
    ax.axhline(0, color='k', linewidth=0.8, linestyle='--')
    ax.set_ylabel(lbl)
    ax.grid(True, alpha=0.4)
axes[-1].set_xlabel('Time (s)')
fig.suptitle('x–v–a chain: x = 4t³ − 12t² + 9t', fontsize=13)
plt.tight_layout()
plt.savefig('xva_chain.png', dpi=100, bbox_inches='tight')
plt.show()

# Find zero crossings of v (stops)
stops = t[np.where(np.diff(np.sign(v)))[0]]
print(f"Object stops near t = {stops.round(2)} s")`,
          prose: [
            `The three arrays \`x\`, \`v\`, and \`a\` are computed analytically: each is the exact derivative of the one above it. \`v = 12t² - 24t + 9\` comes from differentiating \`x = 4t³ - 12t² + 9t\` term by term using the power rule. \`a = 24t - 24\` comes from differentiating \`v\`.`,
            `\`plt.subplots(3, 1, sharex=True)\` creates three stacked panels sharing the same time axis — this is the standard layout for visualizing the kinematic chain. You can read directly between panels: wherever the x-graph peaks, the v-graph crosses zero, and the a-graph is at a specific nonzero value.`,
            `\`np.diff(np.sign(v))\` detects sign changes in v — moments where velocity crosses zero. These are the stopping times predicted analytically at t ≈ 0.5 s and t ≈ 1.5 s. Comparing numerical detections to analytical predictions verifies both the code and the math.`,
          ],
        },
        {
          cellTitle: 'Integrate up: a(t) → v(t) → x(t)',
          type: 'code',
          language: 'python',
          code: `from scipy.integrate import cumulative_trapezoid

dt = 0.001
t2 = np.arange(0, 5, dt)
a_const = 3.0   # constant acceleration, m/s²
v0, x0 = 2.0, 5.0

# Numerical integration (trapezoid rule)
v2 = v0 + cumulative_trapezoid(np.full_like(t2, a_const), t2, initial=0)
x2 = x0 + cumulative_trapezoid(v2, t2, initial=0)

# Analytical check (SUVAT)
v_exact = v0 + a_const * t2
x_exact = x0 + v0*t2 + 0.5*a_const*t2**2

print(f"Max v error: {np.max(np.abs(v2 - v_exact)):.6f} m/s")
print(f"Max x error: {np.max(np.abs(x2 - x_exact)):.4f} m")

plt.figure(figsize=(8, 4))
plt.plot(t2, x_exact, 'b-', label='Exact x(t)')
plt.plot(t2, x2, 'r--', label='Integrated x(t)')
plt.xlabel('t (s)'); plt.ylabel('x (m)')
plt.title('Reconstructing x(t) by integrating a(t) twice')
plt.legend(); plt.grid(True, alpha=0.4)
plt.savefig('reconstruct_x.png', dpi=100, bbox_inches='tight')
plt.show()`,
          prose: [
            `\`cumulative_trapezoid\` implements $v(t) = v_0 + \\int_0^t a\\,dt'$ numerically using the trapezoid rule — a numerical version of the FTC. The \`initial=0\` argument ensures the output starts at zero displacement so we can add \`v0\` directly. We apply it twice: first to get v from a, then to get x from v.`,
            `The \`v_exact\` and \`x_exact\` arrays use the SUVAT formulas — the analytical result of integrating constant acceleration. Comparing them to the numerical integration via \`np.max(np.abs(...))\` confirms that the trapezoid rule matches the analytical answer to many decimal places, validating the chain.`,
            `The plot overlays the exact and integrated position curves. They should be nearly indistinguishable for a small time step. This is the fundamental loop of numerical physics: integrate measured or computed acceleration, compare against analytical solutions or position sensors, and use the error to diagnose problems.`,
          ],
        },
        {
          cellTitle: 'Consistency check: slope of x matches v',
          type: 'code',
          language: 'python',
          code: `# Numerical derivative of x (central differences)
v_numerical = np.gradient(x2, t2)

max_err = np.max(np.abs(v_numerical - v2))
print(f"Max |d(x_integrated)/dt - v_integrated|: {max_err:.6f} m/s")
print("The kinematic chain is self-consistent ✓")

# Visualize the agreement
plt.figure(figsize=(8, 4))
plt.plot(t2, v2, 'r-', linewidth=2, label='v from integration of a')
plt.plot(t2, v_numerical, 'k--', linewidth=1.5, label='d(x)/dt numerically')
plt.xlabel('t (s)'); plt.ylabel('v (m/s)')
plt.title('Checking consistency: does d(x)/dt match v?')
plt.legend(); plt.grid(True, alpha=0.4)
plt.savefig('consistency_check.png', dpi=100, bbox_inches='tight')
plt.show()`,
          prose: [
            `\`np.gradient(x2, t2)\` computes the numerical derivative of the position array using central differences — a finite-difference approximation to $dx/dt$. This is the chain in reverse: start from x (computed by integrating a) and differentiate to get v back.`,
            `If the chain is self-consistent, \`v_numerical\` (slope of x) should match \`v2\` (integral of a) everywhere. The near-zero max error confirms both the math and the numerics: the FTC guarantees these agree analytically, and the small numerical error shows the discretization is accurate.`,
            `This is how engineers verify sensor fusion in practice: integrate the accelerometer to get estimated position, then differentiate the position estimate and compare to the velocity sensor. Large disagreement reveals sensor drift, integration error, or a missed initial condition.`,
          ],
        },
        {
          cellTitle: 'Challenge: reconstruct x(t) from noisy accelerometer data',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `np.random.seed(42)
t_noisy = np.linspace(0, 5, 500)
a_true = 3.0 * np.ones_like(t_noisy)         # true: constant 3 m/s²
a_noisy = a_true + np.random.normal(0, 0.5, len(t_noisy))  # sensor noise
v0_est, x0_est = 2.0, 5.0

# TODO: use cumulative_trapezoid to integrate a_noisy twice.
# Recover v_est (add v0_est) and x_est (add x0_est).
# Then plot x_est vs x_exact = 5 + 2*t_noisy + 1.5*t_noisy**2
# and print the RMS position error.
`,
          prose: [
            `Accelerometers measure $a(t)$ directly, but they are always noisy. The challenge is to integrate a noisy signal twice — accumulating errors at each step — and compare the estimated position to the true trajectory $x(t) = 5 + 2t + 1.5t^2$.`,
            `Use \`cumulative_trapezoid(a_noisy, t_noisy, initial=0)\` to integrate once (add \`v0_est\`), then apply it again to that result (add \`x0_est\`). The "error accumulation" phenomenon — small noise in $a$ growing into large errors in $x$ — is the reason GPS is used alongside accelerometers in real navigation systems.`,
            `Compute RMS error as \`np.sqrt(np.mean((x_est - x_exact)**2))\`. Typical result: noise of $\\pm 0.5$ m/s² in acceleration accumulates to several meters of position error over 5 seconds of integration.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Differentiate down: x(t) → v(t) → a(t)',
          type: 'code',
          language: 'matlab',
          code: `t = linspace(0, 3, 1000);

% Analytical formulas
x = 4*t.^3 - 12*t.^2 + 9*t;   % x(t)
v = 12*t.^2 - 24*t + 9;        % v(t) = dx/dt
a = 24*t - 24;                  % a(t) = dv/dt

figure;
subplot(3,1,1); plot(t, x, 'b', 'LineWidth', 2);
ylabel('x (m)'); grid on; yline(0,'k--');
title('x–v–a chain: x = 4t³ − 12t² + 9t');

subplot(3,1,2); plot(t, v, 'r', 'LineWidth', 2);
ylabel('v (m/s)'); grid on; yline(0,'k--');

subplot(3,1,3); plot(t, a, 'g', 'LineWidth', 2);
ylabel('a (m/s²)'); xlabel('t (s)'); grid on; yline(0,'k--');

% Find stops (v = 0)
sign_changes = find(diff(sign(v)));
fprintf('Object stops near t = %.2f s and t = %.2f s\\n', t(sign_changes));`,
          prose: [
            `Element-wise exponentiation uses the dot operator: \`t.^3\` (not \`t^3\`, which is matrix power). Each formula is the exact power-rule derivative of the one above it: \`v\` differentiates \`x\`, and \`a\` differentiates \`v\`. MATLAB computes all 1000 values simultaneously using vectorized arithmetic.`,
            `\`subplot(3,1,1)\` creates the first of three stacked panels — the standard layout for the kinematic chain. \`yline(0,'k--')\` draws a horizontal dashed line at zero, making zero crossings visible across all three plots simultaneously.`,
            `\`diff(sign(v))\` produces a nonzero entry wherever \`v\` changes sign. These are the stopping times. \`find\` returns their indices, and indexing \`t(sign_changes)\` converts to actual times — confirming the analytical values $t = 0.5$ s and $t = 1.5$ s.`,
          ],
        },
        {
          cellTitle: 'Integrate up: a(t) → v(t) → x(t)',
          type: 'code',
          language: 'matlab',
          code: `dt = 0.001;
t2 = 0:dt:5;
a_const = 3.0;
v0 = 2.0; x0 = 5.0;

% Numerical integration using cumulative trapezoid
v2 = v0 + cumtrapz(t2, a_const * ones(size(t2)));
x2 = x0 + cumtrapz(t2, v2);

% Analytical SUVAT check
v_exact = v0 + a_const * t2;
x_exact = x0 + v0*t2 + 0.5*a_const*t2.^2;

fprintf('Max v error: %.6f m/s\\n', max(abs(v2 - v_exact)));
fprintf('Max x error: %.4f m\\n', max(abs(x2 - x_exact)));

figure;
plot(t2, x_exact, 'b-', 'LineWidth', 2, 'DisplayName', 'Exact x(t)');
hold on;
plot(t2, x2, 'r--', 'LineWidth', 1.5, 'DisplayName', 'Integrated x(t)');
xlabel('t (s)'); ylabel('x (m)');
title('Reconstructing x(t) by integrating a(t) twice');
legend; grid on;`,
          prose: [
            `\`cumtrapz(t2, a_array)\` computes the cumulative integral of \`a_array\` over \`t2\` using the trapezoidal rule — the MATLAB equivalent of \`scipy.integrate.cumulative_trapezoid\`. The result is an array of the same length as \`t2\`, representing $\\int_0^t a\\,dt'$ for each time point. Adding \`v0\` implements $v(t) = v_0 + \\int_0^t a\\,dt'$.`,
            `Applying \`cumtrapz\` a second time to \`v2\` and adding \`x0\` completes the double integration: $x(t) = x_0 + \\int_0^t v\\,dt'$. This two-line pair is the numerical implementation of the FTC applied twice — the entire kinematic reconstruction in code.`,
            `Comparing max errors against the SUVAT analytical formulas confirms numerical accuracy. The tiny errors (order $10^{-5}$ or smaller) are due to the finite time step $dt$, not a conceptual error — the trapezoid rule converges to the true integral as $dt \\to 0$.`,
          ],
        },
        {
          cellTitle: 'Consistency check: does d(x)/dt match v?',
          type: 'code',
          language: 'matlab',
          code: `% Numerical derivative of x (central differences via gradient)
v_numerical = gradient(x2, t2);

max_err = max(abs(v_numerical - v2));
fprintf('Max |d(x_integrated)/dt - v_integrated|: %.6f m/s\\n', max_err);
disp('Kinematic chain is self-consistent ✓');

figure;
plot(t2, v2, 'r-', 'LineWidth', 2, 'DisplayName', 'v from integration of a');
hold on;
plot(t2, v_numerical, 'k--', 'LineWidth', 1.5, 'DisplayName', 'd(x)/dt numerically');
xlabel('t (s)'); ylabel('v (m/s)');
title('Consistency check: slope of x vs integrated v');
legend; grid on;`,
          prose: [
            `\`gradient(x2, t2)\` computes the numerical derivative of \`x2\` with respect to \`t2\` using central differences at interior points and one-sided differences at endpoints. This is $dx/dt$ computed from the position data — the reverse direction through the chain.`,
            `The two curves — velocity computed by integrating acceleration, and velocity computed by differentiating position — should overlap exactly if the chain is self-consistent. The near-zero max error confirms that integrating upward and differentiating downward are inverse operations (the FTC), as expected.`,
            `This is the foundation of inertial navigation system (INS) verification: integrate the accelerometer output to estimate position, then differentiate to get back an estimated velocity, and compare against a velocity sensor. Large discrepancies reveal integration drift or initial-condition errors.`,
          ],
        },
        {
          cellTitle: 'Challenge: integrate noisy accelerometer data',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `rng(42);
t_noisy = linspace(0, 5, 500);
a_true = 3 * ones(size(t_noisy));
a_noisy = a_true + 0.5 * randn(size(t_noisy));
v0_est = 2.0; x0_est = 5.0;

% TODO: use cumtrapz to integrate a_noisy twice.
% Recover v_est (add v0_est) and x_est (add x0_est).
% Plot x_est vs x_exact = 5 + 2*t_noisy + 1.5*t_noisy.^2
% and print the RMS position error.
`,
          prose: [
            `\`rng(42)\` seeds MATLAB's random number generator for reproducibility — equivalent to Python's \`np.random.seed(42)\`. \`randn\` generates standard normal noise; scaling by 0.5 gives $\\sigma = 0.5$ m/s² sensor noise, a realistic accelerometer specification.`,
            `Integrate \`a_noisy\` with \`cumtrapz(t_noisy, a_noisy)\`, add \`v0_est\`, then integrate the resulting velocity to get \`x_est\`. Compare to \`x_exact = 5 + 2*t_noisy + 1.5*t_noisy.^2\`. The RMS error is \`sqrt(mean((x_est - x_exact).^2))\`.`,
            `Expected finding: noise of $\\pm 0.5$ m/s² in acceleration accumulates to meters of error in position after 5 seconds. This error accumulation is why GPS is fused with inertial sensors in navigation — the GPS corrects the drifting integral periodically.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch2-006-q1',
      type: 'choice',
      question: `If $x(t)$ has a local maximum (peak), what must $v(t)$ equal at that instant?`,
      options: [`Maximum value`, `0`, `Same as acceleration`, `Negative`],
      answer: `0`,
      hints: [
        `At a peak, the tangent line to x(t) is horizontal — what does a horizontal tangent mean for the derivative?`,
        `$v = dx/dt$ = slope of x at that point. What is the slope of a horizontal tangent?`,
      ],
      reviewSection: 'intuition',
      explanation: `At a peak of $x$, the tangent is horizontal → slope = 0 → $v = dx/dt = 0$. The object is momentarily stopped at the peak.`,
    },
    {
      id: 'p1-ch2-006-q2',
      type: 'choice',
      question: `An inflection point on $x(t)$ corresponds to what feature on $v(t)$?`,
      options: [`A zero crossing`, `A local maximum or minimum`, `A constant segment`, `A discontinuity`],
      answer: `A local maximum or minimum`,
      hints: [
        `At an inflection point, concavity changes — what does that say about the second derivative?`,
        `$a = d^2x/dt^2 = dv/dt$. If $a = 0$ at that point, what must $v$ be doing?`,
      ],
      reviewSection: 'intuition',
      explanation: `At an inflection point of $x$, the concavity changes — meaning $a(t) = 0$ at that point. Zero acceleration means $v$ has a local extremum (its rate of change is zero).`,
    },
    {
      id: 'p1-ch2-006-q3',
      type: 'choice',
      question: `To reconstruct $v(t)$ from $a(t)$, you need:`,
      options: [
        `Only the acceleration function`,
        `The acceleration function plus initial velocity $v_0$`,
        `The position function`,
        `No additional information`,
      ],
      answer: `The acceleration function plus initial velocity $v_0$`,
      hints: [
        `Integration always produces a constant of integration — what determines that constant here?`,
        `$v(t) = v_0 + \\int a\\,dt$. Without $v_0$, how many valid v-curves are there?`,
      ],
      reviewSection: 'math',
      explanation: `Integration adds a constant: $v(t) = v_0 + \\int a\\,dt$. Without $v_0$, you know the shape of $v(t)$ but not its vertical position.`,
    },
    {
      id: 'p1-ch2-006-q4',
      type: 'choice',
      question: `For $x(t) = 4t^3 - 12t^2 + 9t$, when is $v = 0$?`,
      options: [`$t = 0$ only`, `$t = 0.5$ s and $t = 1.5$ s`, `$t = 1$ s only`, `Never`],
      answer: `$t = 0.5$ s and $t = 1.5$ s`,
      hints: [
        `Find $v(t) = dx/dt$ first, then set it equal to zero.`,
        `$v = 12t^2 - 24t + 9 = 0$. Use the quadratic formula with $a=12$, $b=-24$, $c=9$.`,
      ],
      reviewSection: 'examples',
      explanation: `$v = 12t^2 - 24t + 9 = 0$. Quadratic formula: $t = (24 \\pm \\sqrt{576 - 432})/24 = (24 \\pm 12)/24$, giving $t = 0.5$ s and $t = 1.5$ s.`,
    },
    {
      id: 'p1-ch2-006-q5',
      type: 'choice',
      question: `Which pair of operations moves you down and then back up the kinematic chain?`,
      options: [
        `Integrate then differentiate`,
        `Multiply then divide`,
        `Differentiate then integrate`,
        `Add then subtract`,
      ],
      answer: `Differentiate then integrate`,
      hints: [
        `"Down the chain" means going from x → v → a. What operation does that?`,
        `"Up the chain" means going from a → v → x. What operation does that?`,
      ],
      reviewSection: 'math',
      explanation: `Differentiating $x$ gives $v$ (going down); integrating $v$ gives $x$ back (going up). These are inverse operations by the FTC.`,
    },
    {
      id: 'p1-ch2-006-q6',
      type: 'choice',
      question: `A straight-line (constant slope) $x(t)$ graph implies:`,
      options: [
        `Constant acceleration`,
        `Zero velocity`,
        `Constant velocity and zero acceleration`,
        `Variable acceleration`,
      ],
      answer: `Constant velocity and zero acceleration`,
      hints: [
        `What is the first derivative of a linear function $x = mt + b$?`,
        `What is the second derivative?`,
      ],
      reviewSection: 'intuition',
      explanation: `Constant slope = constant first derivative = constant $v$. Derivative of a constant is zero, so $a = 0$. This is uniform motion.`,
    },
    {
      id: 'p1-ch2-006-q7',
      type: 'choice',
      question: `"Area under v–t gives $\\Delta x$" and "slope of x–t gives $v$" are consequences of:`,
      options: [
        `SUVAT equations`,
        `The Fundamental Theorem of Calculus`,
        `Newton's second law`,
        `The Pythagorean theorem`,
      ],
      answer: `The Fundamental Theorem of Calculus`,
      hints: [
        `Both involve the relationship between a function and its antiderivative.`,
        `The FTC states: if $F' = f$, then $\\int_a^b f\\,dx = F(b) - F(a)$.`,
      ],
      reviewSection: 'rigor',
      explanation: `Both follow directly from the FTC: since $v = dx/dt$, the FTC gives $\\int v\\,dt = \\Delta x$, and since the antiderivative of $v$ is $x$, the slope of $x$ is $v$.`,
    },
    {
      id: 'p1-ch2-006-q8',
      type: 'choice',
      question: `For $a(t) = \\sin(t)$ with $v(0) = 0$ and $x(0) = 0$, what is $v(t)$?`,
      options: [
        `$\\cos(t)$`,
        `$-\\cos(t)$`,
        `$1 - \\cos(t)$`,
        `$\\sin(t)$`,
      ],
      answer: `$1 - \\cos(t)$`,
      hints: [
        `Integrate $\\sin(t)$: what is $\\int \\sin(t)\\,dt$?`,
        `After integrating, apply $v(0) = 0$ to find the constant of integration.`,
      ],
      reviewSection: 'challenges',
      explanation: `$v(t) = v_0 + \\int_0^t \\sin(t')\\,dt' = 0 + [-\\cos(t')]_0^t = -\\cos(t) + 1 = 1 - \\cos(t)$.`,
    },
    {
      id: 'p1-ch2-006-q9',
      type: 'choice',
      question: `If the $v(t)$ graph is a straight line with negative slope, what does the $a(t)$ graph look like?`,
      options: [
        `A downward-opening parabola`,
        `A negative horizontal line (constant negative value)`,
        `Zero everywhere`,
        `An increasing line`,
      ],
      answer: `A negative horizontal line (constant negative value)`,
      hints: [
        `$a = dv/dt$ = slope of the v-t graph.`,
        `If v-t is linear with a constant slope, what is the derivative of a linear function?`,
      ],
      reviewSection: 'intuition',
      explanation: `A straight v-graph has a constant slope. $a = dv/dt$ = that constant slope. If the slope is negative, then $a$ is a negative constant — a horizontal line below zero.`,
    },
    {
      id: 'p1-ch2-006-q10',
      type: 'choice',
      question: `For $x(t) = 2t^2 - t^3/3$, what is the velocity at $t = 3$ s?`,
      options: [`0 m/s`, `3 m/s`, `6 m/s`, `9 m/s`],
      answer: `3 m/s`,
      hints: [
        `Differentiate $x(t)$ using the power rule to find $v(t)$.`,
        `Then substitute $t = 3$.`,
      ],
      reviewSection: 'examples',
      explanation: `$v(t) = dx/dt = 4t - t^2$. At $t = 3$: $v(3) = 4(3) - (3)^2 = 12 - 9 = 3$ m/s.`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch2-006-m1',
      misconception: `"A steep x-t graph means large acceleration."`,
      correction: `A steep slope on x–t means large speed (magnitude of velocity), not acceleration. Acceleration is about how velocity changes — $a = dv/dt = d^2x/dt^2$. A car on a straight highway at 100 km/h has a steep x-t graph but zero acceleration (constant speed).`,
      correctionExample: `For $x(t) = 10t$ (steep constant slope), $v = 10$ m/s, $a = 0$. Large speed, zero acceleration.`,
    },
    {
      id: 'p1-ch2-006-m2',
      misconception: `"I can draw x, v, and a graphs independently without checking consistency."`,
      correction: `The three graphs are mathematically coupled. Given any one of them, the other two are determined (up to initial conditions). If your x-graph peaks but your v-graph does not cross zero at that exact time, one graph is wrong. Always verify: slope of x = value of v, and slope of v = value of a.`,
      correctionExample: `If x peaks at $t = 2$ but v is drawn as $v = 5$ m/s at $t = 2$, that is impossible. At a peak of x, $v = dx/dt = 0$ exactly. The graphs cannot contradict each other.`,
    },
  ],

  transferPrompts: [
    `A guitar string's displacement as a function of time gives $x(t) = A\\sin(\\omega t)$. What are $v(t)$ and $a(t)$? What does $a(t) = -\\omega^2 x(t)$ tell you about restoring forces in oscillatory motion?`,
    `In economics, let $P(t)$ be the price of a stock. Then $P'(t)$ is the rate of price change (velocity of price) and $P''(t)$ is the "acceleration" of price. Translate the kinematic chain rules: what does it mean if $P(t)$ has an inflection point? What does a zero crossing of $P'(t)$ correspond to?`,
  ],

  debugging: [
    {
      id: 'p1-ch2-006-d1',
      buggyWork: `Student writes: "$x(t) = t^2 + 3$ has a peak at $t = 0$ where $v = 0$."`,
      question: `Is this correct? If not, what is wrong?`,
      answer: `Incorrect. $v(t) = dx/dt = 2t$, so $v = 0$ at $t = 0$ — that part is right. But $x(t) = t^2 + 3$ has a minimum at $t = 0$, not a peak (it is an upward-opening parabola). The student confused "v = 0" with "x has a peak." $v = 0$ occurs at both peaks and troughs of x; context (sign of $a$) determines which one. At $t = 0$: $a = 2 > 0$, confirming it is a minimum.`,
    },
    {
      id: 'p1-ch2-006-d2',
      buggyWork: `Student writes: "$x(t) = 2t + 5$, so $v(t) = 2$ m/s and $a(t) = 2$ m/s²."`,
      question: `Find the error.`,
      answer: `$v(t) = 2$ m/s is correct (slope of the linear x-graph). But $a(t) = dv/dt = d(2)/dt = 0$, not 2. The student confused the value of $v$ with the value of $a$. Constant velocity means zero acceleration — no change in velocity means no acceleration.`,
    },
  ],

  mastery: {
    targetLevel: `Read any triple x–v–a graph set, translate features across the chain, and integrate $a(t)$ twice with initial conditions to reconstruct $x(t)$.`,
    coreSkill: `Bidirectional chain translation: differentiate downward ($x \\to v \\to a$) and integrate upward ($a \\to v \\to x$) with correct initial conditions.`,
    commonSticking: `Students forget that integration requires initial conditions to determine the constant of integration. Knowing $a(t)$ exactly still gives infinitely many $v(t)$ curves differing by $v_0$.`,
    connections: `Directly connects to the FTC (calculus), SUVAT equations, and all future dynamics (Newton's second law gives $a(t)$, which you integrate to get $x(t)$). Also the foundation of inertial navigation and signal processing.`,
  },

  semantics: {
    core: [
      { symbol: `v = dx/dt`, meaning: `Velocity is the time-derivative of position — the instantaneous slope of the x–t graph.` },
      { symbol: `a = dv/dt = d^2x/dt^2`, meaning: `Acceleration is the derivative of velocity, or the second derivative of position.` },
      { symbol: `\\Delta x = \\int_{t_1}^{t_2} v\\,dt`, meaning: `Displacement equals the area under the v–t graph (FTC applied to kinematics).` },
      { symbol: `\\Delta v = \\int_{t_1}^{t_2} a\\,dt`, meaning: `Velocity change equals the area under the a–t graph.` },
      { symbol: `v_0, x_0`, meaning: `Initial conditions — the constants of integration that pin down the unique solution when integrating upward through the chain.` },
    ],
    rulesOfThumb: [
      `Peaks and troughs of x → zero crossings of v at the same instant.`,
      `Inflection points of x → peaks or troughs of v → zero crossings of a.`,
      `Steeper x-graph → larger |v|; upward-curving x-graph → positive a.`,
      `Integration always requires an initial condition; differentiation is unique with none needed.`,
      `If the three graphs are self-consistent, differentiating x to get v and integrating that v back recovers x exactly (by the FTC).`,
    ],
  },
};

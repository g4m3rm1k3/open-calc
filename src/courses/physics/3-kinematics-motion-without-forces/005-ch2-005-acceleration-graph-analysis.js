export default {
  id: 'p1-ch2-005',
  slug: 'acceleration-graph-analysis',
  chapter: 'p2',
  order: 5,
  title: 'Acceleration-Time Graph Analysis',
  subtitle: 'Use a–t graphs to predict how velocity — and therefore position — evolves over time.',
  tags: ['acceleration graph', 'delta v', 'kinematics', 'integration chain', 'jerk'],
  aliases: 'a t graph change in velocity acceleration kinematics',

  hook: {
    question: `An elevator's control system receives an acceleration command: +2 m/s² for 3 s, then 0 m/s² for 4 s, then −3 m/s² until it stops. You have the a–t graph. Can you figure out the complete velocity and position history — and how long the whole ride takes?`,
    realWorldContext: `Rocket guidance, aircraft autopilots, and prosthetic limb controllers all operate on acceleration commands rather than position targets. GPS receivers and inertial navigation systems reconstruct position from accelerometer data — a process called dead reckoning — by integrating the a–t signal twice.`,
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      `Before reading on, predict: from the elevator profile in the hook (+2 m/s² for 3 s, then 0 for 4 s, then −3 m/s² to stop), estimate the maximum velocity and the total ride time. The first phase tells you how much velocity the elevator gains; the last phase tells you how long it takes to lose that velocity. Commit to an estimate.`,

      `An a–t graph tells you how rapidly velocity is changing at every moment. The height of the curve at any time gives acceleration at that instant: positive means velocity is increasing, negative means velocity is decreasing, zero means constant velocity.`,

      `The area under an a–t graph gives the change in velocity. This is the same "area gives change" rule as in the v–t lesson — applied one level up the differentiation chain. If acceleration is $+2$ m/s² for 3 seconds, the area is $2 \\times 3 = 6$ m/s, so velocity increases by 6 m/s. The shape of the curve tells you the story; the area tells you the magnitude.`,

      `You can read the three-level kinematic chain directly from a–t graphs: differentiation goes downhill (slope of x–t gives v; slope of v–t gives a), and integration goes uphill (area under a–t gives $\\Delta v$; area under v–t gives $\\Delta x$). The a–t graph is at the top of the chain — it contains all the information needed to reconstruct the entire motion, as long as you know the initial conditions.`,

      `Jerk is the rate of change of acceleration — the slope of the a–t graph. It matters more than you might expect: elevator designers minimize jerk (not just acceleration) because humans feel sudden changes in acceleration as discomfort. Smooth rides have gentle a–t slopes. An a–t graph with sudden jumps causes the lurching feeling in old elevators.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Step-by-step reconstruction from any a-t graph',
        body: `**Step 1:** Identify a–t segments (constant or linear pieces).\n**Step 2:** For each segment, compute area (rectangle or triangle) → that area is $\\Delta v$.\n**Step 3:** Add $\\Delta v$ to the running velocity: $v_{end} = v_{start} + \\Delta v$.\n**Step 4:** Use the resulting v–t segment to compute $\\Delta x$ (area under that v–t piece).\n**Step 5:** Add $\\Delta x$ to the running position. Repeat for each segment.`,
      },
      {
        type: 'insight',
        title: 'The kinematic chain',
        body: `$x(t) \\xrightarrow{d/dt} v(t) \\xrightarrow{d/dt} a(t)$ (differentiation going right). $a(t) \\xrightarrow{\\int dt} \\Delta v \\xrightarrow{\\int dt} \\Delta x$ (integration going left). The a–t graph sits at the top. Calculus makes the chain exact; geometry (area of shapes) gives the algebra-level approximation for piecewise-linear profiles.`,
      },
      {
        type: 'insight',
        title: 'Piece-by-piece reconstruction',
        body: `Starting from an a–t graph, reconstruct velocity step by step: pick a starting velocity $v_0$, add each area segment to get the running velocity. Then reconstruct position from the resulting v–t graph. This is dead reckoning — used in navigation, robotics, and spaceflight. The only inputs needed are the initial conditions $(x_0, v_0)$ and the a–t profile.`,
      },
      {
        type: 'insight',
        title: 'Calculus connection: double integration',
        body: `If you know $a(t)$ as a function, recover $v(t)$ and $x(t)$ by integrating twice: $v(t) = v_0 + \\int a(t)\\,dt$, then $x(t) = x_0 + \\int v(t)\\,dt$. This is solving the second-order ODE $\\ddot{x} = a(t)$. For constant $a$, SUVAT equations are the closed-form solution. For variable $a(t)$, you need calculus.`,
      },
      {
        type: 'warning',
        title: 'Constant a ≠ constant v',
        body: `A flat (constant) a–t graph does NOT mean constant velocity — it means velocity changes at a constant rate. If $a = -9.8$ m/s², velocity decreases by 9.8 m/s every second. Only if $a = 0$ is velocity constant. This is the most common confusion in reading a–t graphs.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-rectangle' },
        title: 'Δv = a·Δt (constant acceleration)',
        caption: `For constant acceleration, Δv = a·Δt — the rectangle area under the a–t graph. Positive area → velocity increases. Negative area → velocity decreases.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'xt-vt-graphs' },
        title: 'x–v–a all three graphs simultaneously',
        caption: `Slope of x–t = value of v–t; slope of v–t = value of a–t. Area under a–t = change in v–t; area under v–t = change in x–t. A sudden jump in a–t (high jerk) appears as a sharp corner in v–t.`,
      },
    ],
  },

  math: {
    prose: [
      `For any a–t graph, the change in velocity over $[t_1, t_2]$ equals the signed area under the curve: $\\Delta v = \\int_{t_1}^{t_2} a(t)\\,dt$. For piecewise-constant or linear acceleration, this area is computed geometrically. If you know $v_0$ and the area, you know the final velocity: $v(t_2) = v_0 + \\Delta v$.`,
      `For constant acceleration $a$, the area is $a \\cdot \\Delta t$, giving $v = v_0 + a\\Delta t$. This is SUVAT equation 1. Substituting this into the v–t area formula and integrating gives $x = x_0 + v_0 t + \\frac{1}{2}at^2$ — SUVAT equation 3. Both equations follow by integrating the constant-a graph twice.`,
      `For variable acceleration $a(t)$, integrate analytically: $v(t) = v_0 + \\int a(t)\\,dt$, then $x(t) = x_0 + \\int v(t)\\,dt$. In general physics problems, $a(t)$ might be sinusoidal (oscillating systems), exponential (drag-limited motion), or piecewise (engine thrust profiles). SUVAT fails in all these cases.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Velocity update from acceleration',
        body: `v(t) = v_0 + \\int_0^t a(t')\\,dt'`,
      },
      {
        type: 'definition',
        title: 'Constant acceleration: area rule',
        body: `\\Delta v = a\\,\\Delta t \\quad \\Longrightarrow \\quad v = v_0 + a\\,t`,
      },
      {
        type: 'definition',
        title: 'SUVAT via double integration',
        body: `x(t) = x_0 + v_0 t + \\tfrac{1}{2}a t^2`,
      },
      {
        type: 'procedure',
        title: 'Computing Δv from a piecewise a-t graph',
        body: `**Step 1:** Identify each segment (constant or linear a).\n**Step 2:** Rectangle segment: $\\Delta v = a \\cdot \\Delta t$. Triangle segment: $\\Delta v = \\frac{1}{2} \\cdot \\Delta a \\cdot \\Delta t$.\n**Step 3:** Apply sign: positive area → velocity increases; negative area → velocity decreases.\n**Step 4:** $v_{end} = v_{start} + \\Delta v$. Use this as $v_{start}$ for the next segment.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'Formulas from integration of acceleration',
        caption: `For constant a: integrate once → v = v₀ + at (SUVAT eq. 1). Integrate again → x = x₀ + v₀t + ½at² (SUVAT eq. 3). For variable a(t): v(t) = v₀ + ∫a dt, x(t) = x₀ + ∫v dt. Numerically, each step is an area under the graph of the function above.`,
      },
    ],
  },

  rigor: {
    prose: [
      `The area-under-a-gives-$\\Delta v$ rule is the FTC applied to the $(v, a)$ pair. Since $a = dv/dt$, by the FTC: $\\int_{t_1}^{t_2} a(t)\\,dt = v(t_2) - v(t_1) = \\Delta v$. Applying the same argument one level down: since $v = dx/dt$, $\\int_{t_1}^{t_2} v(t)\\,dt = x(t_2) - x(t_1) = \\Delta x$. The entire kinematic chain is a cascade of FTC applications.`,

      `Each integration introduces one constant of integration — an initial condition. Integrating $a(t)$ gives $v(t) = \\int a(t)\\,dt + C_1$, where $C_1 = v_0$. Integrating again gives $x(t) = \\int v(t)\\,dt + C_2$, where $C_2 = x_0$. Without the initial conditions, the motion is underdetermined — infinitely many trajectories share the same a-t profile. This is why "starting from rest at $x = 0$" is a standard problem setup: it pins down $C_1 = 0$ and $C_2 = 0$, giving a unique solution.`,

      `Geometrically, each integration smooths the function by one degree. A staircase a-t (piecewise constant) integrates to a piecewise-linear v-t (corners at each step). Integrating again gives a piecewise-parabolic x-t (curves connecting at the corners). A triangular a-t integrates to a piecewise-quadratic v-t, then to a piecewise-cubic x-t. Each level up in the kinematic chain adds one degree of smoothness: steps → lines → parabolas → cubics.`,

      `The equation $\\ddot{x} = a(t)$ is a second-order ordinary differential equation (ODE). SUVAT is its closed-form solution for constant $a$ — found by double integration with constant acceleration. For variable $a(t)$, the solution requires analytic or numerical integration. Numerical ODE solvers (Euler method: $v_{n+1} = v_n + a(t_n)\\Delta t$, $x_{n+1} = x_n + v_n \\Delta t$) implement this chain step by step. Higher-order methods (Runge-Kutta) achieve better accuracy at the same step size. These methods are what planet-trajectory simulations, climate models, and collision physics engines all use at their core.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Double integration recovers position from acceleration',
        body: `x(t) = x_0 + v_0 t + \\int_0^t\\!\\int_0^{t'} a(t'')\\,dt'\\,dt'`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'FTC applied twice: a → v → x',
        caption: `Area under a–t = Δv (FTC applied to dv/dt = a). Area under v–t = Δx (FTC applied to dx/dt = v). Each level requires one initial condition to pin down the constant of integration.`,
      },
    ],
  },

  checkpoints: [
    {
      id: 'ch2-005-cp1',
      question: `An object starts at $v_0 = 5$ m/s. The area under the a-t graph from $t=0$ to $t=4$ s is $-12$ m/s². What is $v(4)$?`,
      answer: `$v(4) = v_0 + \\Delta v = 5 + (-12) = -7$ m/s. The negative area reduced velocity below zero — the object reversed direction during the interval.`,
    },
    {
      id: 'ch2-005-cp2',
      question: `A flat a-t graph at $a = +3$ m/s² means what about the v-t graph?`,
      answer: `The v-t graph is a straight line with slope $+3$ m/s². Velocity increases by 3 m/s every second — NOT constant velocity. Constant velocity would require $a = 0$.`,
    },
  ],

  examples: [
    {
      id: 'ch2-005-ex1',
      title: 'Constant acceleration — velocity update',
      problem: `\\text{Object starts at }v_0 = 3\\,\\text{m/s with }a = -1.5\\,\\text{m/s}^2\\text{ for 4 s. Find final velocity.}`,
      steps: [
        { expression: `\\Delta v = a \\cdot \\Delta t = (-1.5)(4) = -6\\,\\text{m/s}`, annotation: `Area under the constant a–t graph is a rectangle: base × height = 4 × (−1.5). Negative because a < 0.` },
        { expression: `v = v_0 + \\Delta v = 3 + (-6) = -3\\,\\text{m/s}`, annotation: `Final velocity: started positive, ended negative — the object slowed, stopped at $t = 2$ s, then reversed.` },
        { expression: `\\text{Reversal at: }v = 0 \\implies 3 + (-1.5)t = 0 \\implies t = 2\\,\\text{s}`, annotation: `Cross-check: velocity zero (direction reversal) occurs at $t = 2$ s. After that, v becomes negative.` },
      ],
      conclusion: `Final velocity is $-3$ m/s. The object reversed direction at $t = 2$ s — visible as the v-t graph crossing zero.`,
    },
    {
      id: 'ch2-005-ex2',
      title: 'Piecewise acceleration — reconstruct v(t)',
      problem: `\\text{Object starts at rest. a–t: }a=+4\\text{ m/s}^2\\text{ for }[0,3],\\text{ then }a=0\\text{ for }[3,5],\\text{ then }a=-2\\text{ m/s}^2\\text{ for }[5,9].\\text{ Find }v\\text{ at }t=9.`,
      steps: [
        { expression: `\\Delta v_1 = (4)(3) = +12\\,\\text{m/s} \\implies v(3) = 12\\,\\text{m/s}`, annotation: `Phase 1: rectangle area = 12. Object accelerates from rest to 12 m/s.` },
        { expression: `\\Delta v_2 = (0)(2) = 0 \\implies v(5) = 12\\,\\text{m/s}`, annotation: `Phase 2: a = 0 → zero area → velocity constant at 12 m/s.` },
        { expression: `\\Delta v_3 = (-2)(4) = -8\\,\\text{m/s} \\implies v(9) = 12-8 = 4\\,\\text{m/s}`, annotation: `Phase 3: negative rectangle area reduces velocity. Object still moving forward.` },
      ],
      conclusion: `$v(9) = 4$ m/s. The velocity history is: rises to 12, holds at 12, falls to 4. This is the staircase v-t graph from a piecewise a-t.`,
    },
    {
      id: 'ch2-005-ex3',
      title: 'Elevator ride — full reconstruction',
      problem: `\\text{Elevator from rest: }a=+2\\text{ m/s}^2\\text{ for 3 s, then }a=0\\text{ for 4 s, then }a=-3\\text{ m/s}^2\\text{ until stop. Find total displacement.}`,
      steps: [
        { expression: `v_{max} = 0 + 2(3) = 6\\,\\text{m/s}\\text{ (after phase 1)}`, annotation: `Phase 1 area = 2 × 3 = 6 m/s. Elevator reaches 6 m/s.` },
        { expression: `t_3 = v_{max}/|a_3| = 6/3 = 2\\,\\text{s (phase 3 duration)}`, annotation: `Phase 3 must reduce v from 6 to 0. Time = Δv/a = 6/3 = 2 s.` },
        { expression: `\\Delta x_1 = \\tfrac{1}{2}(0+6)(3) = 9\\,\\text{m}`, annotation: `Phase 1: trapezoid (0 to 6 m/s over 3 s). Or triangle: ½ × 3 × 6 = 9 m.` },
        { expression: `\\Delta x_2 = 6 \\times 4 = 24\\,\\text{m}`, annotation: `Phase 2: rectangle. Constant 6 m/s for 4 s.` },
        { expression: `\\Delta x_3 = \\tfrac{1}{2}(6+0)(2) = 6\\,\\text{m}`, annotation: `Phase 3: triangle (6 to 0 m/s over 2 s). ½ × 2 × 6 = 6 m.` },
        { expression: `\\Delta x_{total} = 9 + 24 + 6 = 39\\,\\text{m}`, annotation: `Total elevator displacement = 39 m in 9 s (3 + 4 + 2).` },
      ],
      conclusion: `Total displacement = 39 m over 9 s. This is the answer to the hook problem — the a-t graph alone gives the full motion story once you know $v_0 = 0$.`,
    },
  ],

  challenges: [
    {
      id: 'ch2-005-ch1',
      difficulty: 'medium',
      problem: `\\text{Can acceleration be zero while velocity is nonzero? Give an example.}`,
      hint: `Think about what zero acceleration means on a v–t graph.`,
      walkthrough: [
        { expression: `a = \\frac{dv}{dt} = 0 \\iff v = \\text{constant (nonzero)}`, annotation: `Zero acceleration = zero slope of v-t = constant velocity.` },
        { expression: `\\text{Example: cruise control at 30 m/s. } a = 0,\\text{ but }v = 30\\,\\text{m/s}`, annotation: `Constant non-zero velocity → zero acceleration. The a-t graph is a flat line at zero.` },
      ],
      answer: `Yes. Zero acceleration means the slope of v–t is zero — velocity is constant and nonzero. Acceleration measures change in velocity, not velocity itself.`,
    },
    {
      id: 'ch2-005-ch2',
      difficulty: 'hard',
      problem: `\\text{Object starts from rest at }x=0.\\text{ Its acceleration is }a(t) = 6t\\text{ m/s}^2.\\text{ Find }v(t),\\;x(t),\\text{ and }x(4\\,\\text{s}).`,
      hint: `Integrate a(t) to get v(t), integrate again to get x(t). SUVAT cannot be used here — why?`,
      walkthrough: [
        { expression: `v(t) = \\int_0^t 6t'\\,dt' = 3t^2`, annotation: `Integrate $a = 6t$: power rule gives $3t^2$. With $v(0) = 0$, constant of integration = 0.` },
        { expression: `x(t) = \\int_0^t 3t'^2\\,dt' = t^3`, annotation: `Integrate $v = 3t^2$: power rule gives $t^3$. With $x(0) = 0$, constant of integration = 0.` },
        { expression: `x(4) = 4^3 = 64\\,\\text{m}`, annotation: `Evaluate at $t = 4$ s.` },
        { expression: `\\text{SUVAT would give: }x = v_0 t + \\tfrac{1}{2}a\\cdot t^2 = 0 + \\tfrac{1}{2}(6 \\cdot 4) \\cdot 16 = 192\\,\\text{m (WRONG)}`, annotation: `SUVAT used $a = 6(4) = 24$ (the value at $t=4$) as if it were constant. The actual x = 64 m — factor of 3 error.` },
      ],
      answer: `$v(t) = 3t^2$; $x(t) = t^3$; $x(4) = 64$ m. SUVAT fails because $a$ is not constant — it grows linearly with time.`,
    },
    {
      id: 'ch2-005-ch3',
      difficulty: 'medium',
      problem: `\\text{Object: }v_0 = 0,\\;x_0 = 0,\\;a(t) = 2 - t\\text{ m/s}^2\\text{ for }t \\in [0, 4]\\text{ s.}\\text{ Find: (a) when }a=0,\\text{ (b) }v(t),\\text{ (c) when }v=0,\\text{ (d) }x(4).`,
      hint: `Integrate $a(t) = 2-t$ to get $v(t)$. Set $v = 0$ to find when the object is momentarily stopped.`,
      walkthrough: [
        { expression: `a = 0:\\quad 2-t = 0 \\implies t = 2\\,\\text{s}`, annotation: `(a) Acceleration is zero at $t = 2$ s — the object is neither speeding up nor slowing down at that moment.` },
        { expression: `v(t) = \\int_0^t (2-t')\\,dt' = 2t - \\tfrac{t^2}{2}`, annotation: `(b) Integrate $a(t)$: $v_0 = 0$ fixes the constant.` },
        { expression: `v = 0:\\quad 2t - \\tfrac{t^2}{2} = 0 \\implies t\\left(2 - \\tfrac{t}{2}\\right) = 0 \\implies t = 0\\text{ or }t = 4\\,\\text{s}`, annotation: `(c) $v = 0$ at start ($t=0$) and again at $t=4$ s — the object returns to rest at $t=4$.` },
        { expression: `x(t) = \\int_0^t \\left(2t' - \\tfrac{t'^2}{2}\\right)dt' = t^2 - \\tfrac{t^3}{6}`, annotation: `Integrate $v(t)$: $x_0 = 0$ fixes the constant.` },
        { expression: `x(4) = 16 - \\tfrac{64}{6} = 16 - 10.\\overline{6} \\approx 5.33\\,\\text{m}`, annotation: `(d) Despite returning to $v=0$ at $t=4$, the object is not back at the origin — it moved 5.33 m from start.` },
      ],
      answer: `(a) $t = 2$ s; (b) $v(t) = 2t - t^2/2$; (c) $t = 0$ and $t = 4$ s; (d) $x(4) \\approx 5.33$ m.`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Piecewise constant acceleration: step-by-step velocity reconstruction',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Elevator profile: (duration_s, acceleration_m_s2)
phases = [(3, 2.0), (4, 0.0), (2, -3.0)]

v0 = 0.0
t_pts = [0.0]
v_pts = [v0]
a_pts = [phases[0][1]]

t_now, v_now = 0.0, v0
for dur, a in phases:
    dv = a * dur                  # Δv = area of rectangle under a-t
    t_end = t_now + dur
    v_end = v_now + dv
    t_pts.append(t_end)
    v_pts.append(v_end)
    a_pts.append(a)
    print(f"Phase a={a:+.1f} m/s²: Δv = {dv:+.1f} m/s  →  v = {v_end:.1f} m/s  (t={t_end}s)")
    t_now, v_now = t_end, v_end

# Displacement = area under v-t = sum of trapezoidal segments
t_arr = np.array(t_pts)
v_arr = np.array(v_pts)
dx_segments = 0.5 * (v_arr[:-1] + v_arr[1:]) * np.diff(t_arr)
print(f"\\nDisplacement per phase: {dx_segments}")
print(f"Total displacement: {dx_segments.sum():.1f} m")`,
          prose: [
            `\`dv = a * dur\` implements $\\Delta v = a \\cdot \\Delta t$ — the area of the rectangle under the constant a-t segment. This is the first-level integration: area under a-t = change in velocity.`,
            `\`v_end = v_now + dv\` updates the running velocity. This is dead reckoning: each phase adds its $\\Delta v$ to the accumulated velocity. The velocity after phase 1 becomes the initial velocity for phase 2.`,
            `The displacement calculation uses the trapezoidal rule on the v-t points — this is the second integration. Note how the total displacement (39 m) matches the analytical result from example 3: the integration chain $a \\to v \\to x$ gives the exact same answer whether done geometrically or numerically.`,
          ],
        },
        {
          cellTitle: 'Visualizing a-t, v-t, and x-t simultaneously',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import cumulative_trapezoid

# Build the elevator a(t) profile on a fine time grid
t_arr = np.linspace(0, 9, 1000)
a_arr = np.piecewise(t_arr,
    [t_arr <= 3, (t_arr > 3) & (t_arr <= 7), t_arr > 7],
    [2.0, 0.0, -3.0])

# Integrate a(t) once → v(t), then again → x(t)
v_arr = cumulative_trapezoid(a_arr, t_arr, initial=0)
x_arr = cumulative_trapezoid(v_arr, t_arr, initial=0)

fig, axes = plt.subplots(3, 1, figsize=(8, 9), sharex=True)
labels = ['a (m/s²)', 'v (m/s)', 'x (m)']
data   = [a_arr, v_arr, x_arr]
colors = ['green', 'red', 'blue']

for ax, y, lbl, col in zip(axes, data, labels, colors):
    ax.fill_between(t_arr, y, alpha=0.15, color=col)
    ax.plot(t_arr, y, color=col, linewidth=2)
    ax.axhline(0, color='k', linewidth=0.8)
    ax.set_ylabel(lbl); ax.grid(True, alpha=0.4)

axes[2].set_xlabel('Time (s)')
fig.suptitle('Elevator: a–t, v–t, x–t linked by integration', fontsize=12)
plt.tight_layout()
plt.savefig('elevator_xva.png', dpi=100, bbox_inches='tight')
plt.show()`,
          prose: [
            `\`np.piecewise\` builds the a-t profile as a function of time — three flat segments corresponding to the three acceleration phases. The piecewise array is then the starting point for numerical integration.`,
            `\`cumulative_trapezoid(a_arr, t_arr, initial=0)\` integrates step by step: it computes the running sum of trapezoidal areas, returning a v(t) array that grows as the elevator accelerates. Calling it again on v_arr gives x(t).`,
            `The three panels show the kinematic chain visually. The a-t graph (green, top) is the staircase of three phases. The v-t graph (red, middle) shows the resulting piecewise-linear velocity — rising, flat, then falling. The x-t graph (blue, bottom) is piecewise-parabolic, showing the position growing non-linearly. Each graph is the integral of the one above it.`,
          ],
        },
        {
          cellTitle: 'Variable acceleration — double integration',
          type: 'code',
          language: 'python',
          code: `from scipy.integrate import quad
import numpy as np

# a(t) = 6t (non-constant: SUVAT CANNOT be used)
def a_var(t):  return 6*t

def v_var(t):
    result, _ = quad(a_var, 0, t)
    return result   # v = ∫₀ᵗ 6t' dt' = 3t²

def x_var(t):
    result, _ = quad(v_var, 0, t)
    return result   # x = ∫₀ᵗ 3t'² dt' = t³

print("Comparison: numerical integration vs analytical formula")
print(f"{'t':>4}  {'v (scipy)':>10}  {'v (3t²)':>10}  {'x (scipy)':>10}  {'x (t³)':>10}")
for t in [0, 1, 2, 3, 4]:
    v_n, v_a = v_var(t), 3*t**2
    x_n, x_a = x_var(t), t**3
    print(f"{t:>4}  {v_n:>10.4f}  {v_a:>10.4f}  {x_n:>10.4f}  {x_a:>10.4f}")

print()
suvat_x = 0 + 0 + 0.5 * (6*4) * 4**2   # using a(4) = 24 as if constant
print(f"SUVAT (wrong — uses a(t=4) as if constant): x = {suvat_x:.0f} m")
print(f"Correct (double integration):                x = {x_var(4):.0f} m")
print(f"SUVAT overestimates by factor: {suvat_x/x_var(4):.1f}×")`,
          prose: [
            `\`quad(a_var, 0, t)\` calls SciPy\'s adaptive quadrature to compute $\\int_0^t 6t'\\,dt'$ numerically. The analytical result is $3t^2$. Comparing the two columns confirms they agree to 4 decimal places.`,
            `The second call \`quad(v_var, 0, t)\` integrates the *numerical* $v(t)$ function. This is the second integration: $x = \\int_0^t v\\,dt$. The result matches $t^3$ exactly — confirming the double-integration chain works.`,
            `The SUVAT comparison shows the danger of using SUVAT for variable acceleration: it overestimates by a factor of 3 (192 m vs 64 m at $t=4$ s). This happens because SUVAT assumes $a = \\text{const}$, but here $a = 6t$ grows with time.`,
          ],
        },
        {
          cellTitle: 'Challenge — sinusoidal acceleration',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `from scipy.integrate import quad
import numpy as np

# a(t) = sin(t), v(0) = 0, x(0) = 0

def a_sin(t):
    return np.sin(t)

# TODO:
# 1. Define v_sin(t) = ∫₀ᵗ sin(t') dt' using quad
# 2. Define x_sin(t) = ∫₀ᵗ v_sin(t') dt' using quad
# 3. Compute and print v(π), x(π), x(2π)
# 4. BONUS: plot x(t), v(t), a(t) from t=0 to t=4π`,
          prose: [
            `$\\int_0^t \\sin(t')\\,dt' = [-\\cos(t')]_0^t = 1 - \\cos(t)$. So $v(\\pi) = 1 - \\cos(\\pi) = 1 + 1 = 2$ m/s. Use this as a check: your \`quad\` result should match.`,
            `For $x(\\pi)$: integrate $v(t) = 1 - \\cos(t)$: $x(t) = t - \\sin(t)$. So $x(\\pi) = \\pi - 0 = \\pi \\approx 3.14$ m. And $x(2\\pi) = 2\\pi - \\sin(2\\pi) = 2\\pi \\approx 6.28$ m — the object keeps moving forward despite the oscillating acceleration.`,
            `The bonus plot shows that the sinusoidal a-t creates a periodic-ish v-t (between 0 and 2 m/s) and a monotonically increasing x-t. This demonstrates a key insight: oscillating acceleration doesn't necessarily mean oscillating position.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Piecewise constant acceleration: velocity reconstruction',
          type: 'code',
          language: 'matlab',
          code: `% Elevator profile: [duration, acceleration]
phases = [3, 2.0;
          4, 0.0;
          2, -3.0];

v0 = 0;
t_pts = 0;
v_pts = v0;

t_now = 0; v_now = v0;
for k = 1:size(phases, 1)
    dur = phases(k, 1);
    a   = phases(k, 2);
    dv  = a * dur;                % Δv = rectangle area under a-t
    t_end = t_now + dur;
    v_end = v_now + dv;
    t_pts(end+1) = t_end;
    v_pts(end+1) = v_end;
    fprintf('Phase a=%+.1f: Δv = %+.1f → v = %.1f m/s (t=%.0fs)\\n', a, dv, v_end, t_end)
    t_now = t_end; v_now = v_end;
end

% Total displacement = trapezoidal area under v-t
t_arr = t_pts;
v_arr = v_pts;
dx_segs = 0.5 * (v_arr(1:end-1) + v_arr(2:end)) .* diff(t_arr);
fprintf('\\nTotal displacement: %.1f m\\n', sum(dx_segs))`,
          prose: [
            `\`dv = a * dur\` computes the area of the rectangle under the constant a-t segment. The loop accumulates these into a growing velocity, tracking where the elevator is in its speed profile at each transition.`,
            `\`v_pts(end+1) = v_end\` appends to the MATLAB array dynamically. This is equivalent to Python\'s \`list.append()\` but uses MATLAB\'s index notation.`,
            `The displacement computation mirrors the Python version: trapezoidal areas of each v-t segment. The result (39 m) is the full elevator travel distance — computed entirely from the a-t profile and the initial condition $v_0 = 0$.`,
          ],
        },
        {
          cellTitle: 'Visualizing a-t, v-t, x-t together',
          type: 'code',
          language: 'matlab',
          code: `t_arr = linspace(0, 9, 1000);
a_arr = zeros(size(t_arr));
a_arr(t_arr <= 3) = 2.0;
a_arr(t_arr > 3 & t_arr <= 7) = 0.0;
a_arr(t_arr > 7) = -3.0;

% Cumulative integration
v_arr = cumtrapz(t_arr, a_arr);
x_arr = cumtrapz(t_arr, v_arr);

figure
labels = {'a (m/s^2)', 'v (m/s)', 'x (m)'};
data   = {a_arr, v_arr, x_arr};
colors = {[0 0.6 0], [0.8 0 0], [0 0 0.8]};

for k = 1:3
    subplot(3, 1, k); hold on
    area(t_arr, data{k}, 'FaceAlpha', 0.15, 'FaceColor', colors{k}, 'EdgeColor', 'none')
    plot(t_arr, data{k}, 'Color', colors{k}, 'LineWidth', 2)
    yline(0, 'k', 'LineWidth', 0.8)
    ylabel(labels{k}); grid on
end
subplot(3,1,3); xlabel('Time (s)')
sgtitle('Elevator: a–t, v–t, x–t linked by integration')`,
          prose: [
            `Logical indexing \`a_arr(t_arr <= 3) = 2.0\` assigns acceleration values to the array based on time ranges — this is more efficient than a loop and MATLAB\'s preferred style for vectorized operations.`,
            `\`cumtrapz(t_arr, a_arr)\` returns an array of cumulative trapezoidal integrals — each element is $\\int_0^{t_k} a(t)\\,dt$. This gives $v(t)$ directly. Calling \`cumtrapz\` again on the result gives $x(t)$.`,
            `The three subplots show the kinematic chain: staircase a-t (green, top) → piecewise-linear v-t (red, middle) → piecewise-parabolic x-t (blue, bottom). Each graph is the cumulative integral of the one above it.`,
          ],
        },
        {
          cellTitle: 'Variable acceleration via numerical ODE',
          type: 'code',
          language: 'matlab',
          code: `% a(t) = 6t — non-constant, SUVAT cannot be used
a_func = @(t) 6*t;

% Fine time grid
t_arr = linspace(0, 4, 1000);
a_arr = a_func(t_arr);

% Integrate numerically (cumtrapz)
v_arr = cumtrapz(t_arr, a_arr);    % v(t) = ∫a dt
x_arr = cumtrapz(t_arr, v_arr);    % x(t) = ∫v dt

% Compare to analytical result
v_exact = 3 * t_arr.^2;     % v = 3t²
x_exact = t_arr.^3;          % x = t³

fprintf('At t=4 s:\\n')
fprintf('  v (numerical) = %.4f m/s   (analytical 3t²: %.4f)\\n', v_arr(end), 3*4^2)
fprintf('  x (numerical) = %.4f m    (analytical t³:  %.4f)\\n', x_arr(end), 4^3)

% SUVAT comparison (wrong — uses a(t=4) as constant)
suvat_x = 0.5 * a_func(4) * 4^2;
fprintf('  SUVAT (wrong): %.0f m  vs  correct: %.0f m\\n', suvat_x, x_arr(end))

figure
subplot(2,1,1); plot(t_arr, v_arr, 'r-', t_arr, v_exact, 'k--', 'LineWidth', 1.5)
xlabel('t (s)'); ylabel('v (m/s)'); legend('numerical','3t² analytical'); grid on
subplot(2,1,2); plot(t_arr, x_arr, 'b-', t_arr, x_exact, 'k--', 'LineWidth', 1.5)
xlabel('t (s)'); ylabel('x (m)'); legend('numerical','t³ analytical'); grid on`,
          prose: [
            `\`a_func = @(t) 6*t\` is a MATLAB anonymous function. \`a_func(t_arr)\` evaluates it at all 1000 time points simultaneously — MATLAB\'s vectorization means no loop is needed.`,
            `Two rounds of \`cumtrapz\` implement the double-integration chain: $a(t) \\to v(t) \\to x(t)$. The results are compared to the analytical formulas $v = 3t^2$ and $x = t^3$. The curves should nearly overlap.`,
            `The SUVAT comparison prints 192 m vs the correct 64 m — a factor-of-3 overestimate. The error comes from using the final acceleration value ($a = 24$ m/s² at $t=4$) as if it were the constant acceleration throughout. For non-constant $a(t)$, always integrate rather than applying SUVAT.`,
          ],
        },
        {
          cellTitle: 'Challenge — sinusoidal acceleration',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% a(t) = sin(t), v(0) = 0, x(0) = 0

a_func = @(t) sin(t);

% TODO:
% 1. Build a fine time array from 0 to 4*pi
% 2. Evaluate a(t) on the array
% 3. Integrate once with cumtrapz to get v(t)
% 4. Integrate again to get x(t)
% 5. Print v(pi), x(pi), x(2*pi)
% 6. Compare v(pi) to the analytical result: integral of sin from 0 to pi = 2
%
% BONUS: plot all three graphs`,
          prose: [
            `The analytical result for $v(\\pi)$ is $\\int_0^\\pi \\sin(t)\\,dt = [-\\cos(t)]_0^\\pi = -\\cos(\\pi) + \\cos(0) = 1 + 1 = 2$ m/s. Your \`cumtrapz\` result at $t = \\pi$ should be very close to 2.`,
            `For position: $x(t) = \\int_0^t (1 - \\cos(t'))\\,dt' = t - \\sin(t)$. At $t = \\pi$: $x = \\pi - 0 = \\pi \\approx 3.14$ m. At $t = 2\\pi$: $x = 2\\pi \\approx 6.28$ m.`,
            `Interestingly, the position increases monotonically even though the acceleration is oscillating. This is because $v(t) = 1 - \\cos(t) \\geq 0$ always — the oscillating acceleration never makes the velocity negative, so the object never reverses direction.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch2-005-q1',
      type: 'choice',
      question: `What does the area under an a–t graph represent?`,
      options: [`Displacement`, `Speed`, `Change in velocity (Δv)`, `Position`],
      answer: `Change in velocity (Δv)`,
      hints: [
        `$\\int a\\,dt = ?$. Since $a = dv/dt$, what does the FTC say?`,
        `Area under a-t is one level up from area under v-t. Area under v-t = displacement; area under a-t = ?`,
      ],
      reviewSection: 'intuition',
      explanation: `Area under a–t = $\\int a\\,dt = \\Delta v$. This is the FTC applied to the $(v, a)$ pair, since $a = dv/dt$.`,
    },
    {
      id: 'p1-ch2-005-q2',
      type: 'choice',
      question: `An object starts at $v_0 = 3$ m/s and experiences $a = -1.5$ m/s² for 4 s. What is the final velocity?`,
      options: [`9 m/s`, `−3 m/s`, `−9 m/s`, `4.5 m/s`],
      answer: `−3 m/s`,
      hints: [
        `$\\Delta v = a \\cdot \\Delta t$. What is $(-1.5)(4)$?`,
        `$v_f = v_0 + \\Delta v$. The negative $\\Delta v$ reduces velocity below zero.`,
      ],
      reviewSection: 'examples',
      explanation: `$\\Delta v = a \\cdot \\Delta t = -1.5 \\times 4 = -6$ m/s. $v_f = 3 + (-6) = -3$ m/s. The object reversed direction.`,
    },
    {
      id: 'p1-ch2-005-q3',
      type: 'choice',
      question: `A flat (horizontal) a–t graph at some non-zero value means:`,
      options: [
        `Constant velocity`,
        `Constant acceleration (velocity changes at a steady rate)`,
        `Object is stopped`,
        `Position is constant`,
      ],
      answer: `Constant acceleration (velocity changes at a steady rate)`,
      hints: [
        `Flat a-t → constant acceleration. What does constant acceleration do to velocity?`,
        `Constant velocity requires $a = 0$. Non-zero constant $a$ means velocity is changing at a steady rate.`,
      ],
      reviewSection: 'intuition',
      explanation: `Constant non-zero a–t → velocity changes at a constant rate → linear v–t graph → SUVAT applies. The object is NOT at constant velocity.`,
    },
    {
      id: 'p1-ch2-005-q4',
      type: 'choice',
      question: `Starting from an a–t graph, what two things do you need in addition to reconstruct position $x(t)$?`,
      options: [
        `Final velocity and final position`,
        `Initial velocity $v_0$ and initial position $x_0$`,
        `The average acceleration and total time`,
        `Nothing — a–t alone is sufficient`,
      ],
      answer: `Initial velocity $v_0$ and initial position $x_0$`,
      hints: [
        `Integration always adds a constant. What physical quantities fix the constants of integration?`,
        `First integration: $v(t) = \\int a\\,dt + C_1$. What is $C_1$ equal to?`,
      ],
      reviewSection: 'rigor',
      explanation: `Integration adds a constant. You need $v_0$ to pin down $v(t)$, and $x_0$ to pin down $x(t)$. These are the initial conditions required to solve $\\ddot{x} = a(t)$.`,
    },
    {
      id: 'p1-ch2-005-q5',
      type: 'choice',
      question: `For $a(t) = 6t$, which method gives the correct $x(t)$?`,
      options: [
        `SUVAT equation 3`,
        `Double integration: $v = \\int a\\,dt$, then $x = \\int v\\,dt$`,
        `Reading the slope of the a–t graph`,
        `Multiplying $a$ by $t^2$`,
      ],
      answer: `Double integration: $v = \\int a\\,dt$, then $x = \\int v\\,dt$`,
      hints: [
        `SUVAT requires constant acceleration. Is $a = 6t$ constant?`,
        `For variable $a(t)$, the correct method is to integrate twice with initial conditions.`,
      ],
      reviewSection: 'challenges',
      explanation: `SUVAT requires constant acceleration. For variable $a(t)$, integrate: first $v(t) = v_0 + \\int a\\,dt = 3t^2$, then $x(t) = x_0 + \\int v\\,dt = t^3$.`,
    },
    {
      id: 'p1-ch2-005-q6',
      type: 'choice',
      question: `"Jerk" in physics refers to:`,
      options: [
        `Acceleration in the downward direction`,
        `Rate of change of acceleration (slope of a–t)`,
        `Very high speed`,
        `Negative velocity`,
      ],
      answer: `Rate of change of acceleration (slope of a–t)`,
      hints: [
        `Jerk is the third derivative of position with respect to time.`,
        `In the kinematic chain: position → velocity → acceleration → ???`,
      ],
      reviewSection: 'intuition',
      explanation: `Jerk = $da/dt$ = slope of the a–t graph. High jerk = sudden change in acceleration = the lurching feeling in a poorly designed elevator or car.`,
    },
    {
      id: 'p1-ch2-005-q7',
      type: 'choice',
      question: `An object starts from rest. $a = +4$ m/s² for 3 s, then $a = 0$ for 2 s, then $a = -2$ m/s² for 4 s. What is $v$ at the end?`,
      options: [`4 m/s`, `12 m/s`, `16 m/s`, `8 m/s`],
      answer: `4 m/s`,
      hints: [
        `Compute $\\Delta v$ for each phase and accumulate: $v = v_0 + \\sum \\Delta v_i$.`,
        `Phase 1: $\\Delta v = 4 \\times 3 = +12$. Phase 2: $\\Delta v = 0$. Phase 3: $\\Delta v = -2 \\times 4 = ?$.`,
      ],
      reviewSection: 'examples',
      explanation: `$\\Delta v_1 = 4 \\times 3 = +12$ → $v = 12$. $\\Delta v_2 = 0$ → $v = 12$. $\\Delta v_3 = -2 \\times 4 = -8$ → $v = 4$ m/s.`,
    },
    {
      id: 'p1-ch2-005-q8',
      type: 'choice',
      question: `Which statement about the kinematic chain is correct?`,
      options: [
        `Differentiating position gives acceleration`,
        `Integrating acceleration gives displacement, integrating displacement gives position`,
        `Differentiating position gives velocity; differentiating velocity gives acceleration`,
        `Integrating position gives velocity`,
      ],
      answer: `Differentiating position gives velocity; differentiating velocity gives acceleration`,
      hints: [
        `$v = dx/dt$ — differentiating position gives what?`,
        `$a = dv/dt$ — differentiating velocity gives what?`,
      ],
      reviewSection: 'intuition',
      explanation: `The chain: $x \\xrightarrow{d/dt} v \\xrightarrow{d/dt} a$ (differentiation going right). The reverse: $a \\xrightarrow{\\int dt} \\Delta v \\xrightarrow{\\int dt} \\Delta x$ (integration going left).`,
    },
    {
      id: 'p1-ch2-005-q9',
      type: 'choice',
      question: `If the a–t graph is a straight line with positive slope, what is the shape of the v–t graph?`,
      options: [
        `Straight line with positive slope`,
        `Parabola opening upward`,
        `Horizontal line`,
        `Exponential curve`,
      ],
      answer: `Parabola opening upward`,
      hints: [
        `The v-t graph is the integral of the a-t graph. What is $\\int at\\,dt$?`,
        `Integrating a linear function (straight line) gives a quadratic (parabola).`,
      ],
      reviewSection: 'rigor',
      explanation: `Integrating $a(t) = ct$ (linear) gives $v(t) = \\frac{c}{2}t^2$ — a parabola opening upward. Each level of integration increases the polynomial degree by 1.`,
    },
    {
      id: 'p1-ch2-005-q10',
      type: 'choice',
      question: `An object has $v_0 = 5$ m/s. The area under the a–t graph from $t=0$ to $t=3$ s is $-15$ m/s². What is the velocity at $t=3$?`,
      options: [`$-10$ m/s`, `$10$ m/s`, `$-20$ m/s`, `$20$ m/s`],
      answer: `$-10$ m/s`,
      hints: [
        `$v_f = v_0 + \\Delta v$. The area under the a-t graph IS $\\Delta v$.`,
        `$v_f = 5 + (-15) = ?$`,
      ],
      reviewSection: 'math',
      explanation: `$v_f = v_0 + \\Delta v = 5 + (-15) = -10$ m/s. The negative area (negative acceleration) reduced velocity below zero — the object reversed direction during the interval.`,
    },
  ],

  misconceptions: [
    {
      id: 'ch2-005-m1',
      myth: `A flat (horizontal) a–t graph means constant velocity.`,
      reality: `A flat a-t graph means constant acceleration — which means velocity is changing at a constant rate. The only case with constant velocity is when the a-t graph is flat at zero ($a = 0$). A flat a-t line at $a = +5$ m/s² means velocity increases by 5 m/s every second.`,
      correctionExample: `A ball in free fall: $a = -9.8$ m/s² — a flat a-t line. Velocity changes continuously: $v = v_0 - 9.8t$. After 3 s, velocity has changed by $-29.4$ m/s. The a-t graph being flat means the RATE of change is constant — not that velocity is constant.`,
    },
    {
      id: 'ch2-005-m2',
      myth: `You can use SUVAT equations for any acceleration profile as long as you use the average acceleration.`,
      reality: `SUVAT requires constant acceleration throughout the interval. Using an average of a time-varying $a(t)$ in SUVAT gives the wrong answer except in special cases. For variable $a(t)$, the correct approach is to integrate: $v(t) = v_0 + \\int a(t)\\,dt$.`,
      correctionExample: `$a(t) = 6t$ over $[0, 4]$ s, $v_0 = 0$. Average acceleration = $\\frac{1}{4}\\int_0^4 6t\\,dt = 12$ m/s². SUVAT with $\\bar{a} = 12$: $v_f = 12 \\times 4 = 48$ m/s. Correct: $v_f = 3(4)^2 = 48$ m/s (coincidentally the same!). But $\\Delta x$: SUVAT gives $\\frac{1}{2}(12)(16) = 96$ m; correct: $x = 4^3 = 64$ m. The average-acceleration trick only works for velocity, not position.`,
    },
  ],

  transferPrompts: [
    `A rocket's thrust varies with time as $F(t) = F_0 e^{-bt}$ (exponential decay as fuel burns). The mass also decreases. Using $a = F/m$, sketch qualitatively what the a-t, v-t, and x-t graphs look like. Why can\'t SUVAT be applied?`,
    `A smartphone's accelerometer measures $a(t)$ at 100 samples/second. The phone starts at rest on a table, is picked up, waved around, and put back. Describe what the a-t, v-t, and x-t graphs look like during this sequence. What problem would arise if you tried to use this data to reconstruct the phone's trajectory over a 10-minute period?`,
  ],

  debugging: [
    {
      id: 'ch2-005-d1',
      buggyWork: `A student computes $v(t)$ for $a(t) = 6t$ (starting from rest) by writing $v = a \\cdot t = 6t \\cdot t = 6t^2$.`,
      question: `Identify the error and give the correct formula.`,
      answer: `The student multiplied $a(t) \\times t$ instead of integrating $a(t)$. Correct: $v(t) = \\int_0^t 6t'\\,dt' = 3t^2$ (power rule: bring down the exponent, add 1 to the exponent, then $6/(1+1) = 3$). The factor is 3, not 6. At $t=4$: correct $v = 48$ m/s; student\'s answer = 96 m/s — factor of 2 error.`,
    },
    {
      id: 'ch2-005-d2',
      buggyWork: `A student computes the elevator problem (phase 3: $a = -3$ m/s² for 2 s, starting at $v = 6$ m/s) as: $\\Delta v = |-3| \\times 2 = +6$ m/s, so $v_{end} = 6 + 6 = 12$ m/s.`,
      question: `What is the error? What is the correct final velocity?`,
      answer: `The student took the absolute value of acceleration before computing $\\Delta v$, losing the sign. The area under the a-t graph is signed: $\\Delta v = (-3)(2) = -6$ m/s. Correct: $v_{end} = 6 + (-6) = 0$ m/s. The elevator stops — which is the whole point of the negative acceleration phase. Taking $|a|$ would imply the elevator is speeding up rather than stopping.`,
    },
  ],

  mastery: {
    targetLevel: `You can start from any piecewise a-t profile, reconstruct the v-t and x-t graphs step by step using the area rule, and explain why double integration gives position and why SUVAT fails for variable acceleration.`,
    coreSkill: `Computing $\\Delta v = \\int a\\,dt$ (area under a-t) for each phase and accumulating to get the running velocity; then computing displacement from the resulting v-t segments.`,
    commonSticking: `Forgetting the sign on negative-acceleration areas (taking absolute value), or applying SUVAT to variable-acceleration problems.`,
    connections: [
      `Lessons 3–4 (x-t and v-t graphs): same area-slope duality applied one level up — a-t slope is jerk, a-t area is Δv.`,
      `SUVAT (lesson 2): constant-a a-t is a flat line; the SUVAT equations are the closed-form double-integration result.`,
      `Calculus 1 (integration): $\\Delta x = \\int v\\,dt$ and $\\Delta v = \\int a\\,dt$ are the first kinematic applications of the FTC.`,
    ],
  },

  semantics: {
    core: [
      { symbol: `\\Delta v = \\int a\\,dt`, meaning: `Change in velocity = signed area under the a-t graph (FTC)` },
      { symbol: `j = da/dt`, meaning: `Jerk — rate of change of acceleration; slope of the a-t graph` },
      { symbol: `v(t) = v_0 + \\int_0^t a\\,dt'`, meaning: `Velocity at time t given initial velocity and acceleration history` },
      { symbol: `x(t) = x_0 + v_0 t + \\tfrac{1}{2}at^2`, meaning: `SUVAT position formula — valid only for constant a` },
    ],
    rulesOfThumb: [
      `Area under a-t = Δv. Area under v-t = Δx. Each level of integration requires one initial condition.`,
      `Flat non-zero a-t means constant acceleration, NOT constant velocity. Zero a-t means constant velocity.`,
      `The kinematic chain: $x \\xrightarrow{d/dt} v \\xrightarrow{d/dt} a$ and $a \\xrightarrow{\\int} v \\xrightarrow{\\int} x$.`,
      `SUVAT only applies when a is truly constant throughout the interval. For variable a(t), always integrate.`,
      `Piecewise reconstruction: for each segment, compute area → Δv → new v. Repeat to get v(t). Then compute area under v(t) → Δx.`,
    ],
  },
}

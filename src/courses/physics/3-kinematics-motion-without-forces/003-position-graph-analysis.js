export default {
  id: 'p1-ch2-003',
  slug: 'position-graph-analysis',
  chapter: 'p2',
  order: 3,
  title: 'Position-Time Graph Analysis',
  subtitle: 'Read motion directly from the shape and slope of an x–t graph.',
  tags: ['position graph', 'slope', 'kinematics', 'velocity', 'instantaneous rate of change'],
  aliases: 'x t graph slope velocity position graph',

  hook: {
    question: `Two cars pass through the same intersection at the same moment. One is cruising at 30 mph; the other is slamming on the brakes from 60 mph. At that instant, they share the same position — but their x–t graphs look completely different. How?`,
    realWorldContext: `GPS navigation apps, traffic analytics systems, and sports tracking all start with raw position-time data. Interpreting the shape and slope of that data tells you everything about how an object is moving — without ever measuring speed directly.`,
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      `Before reading on, predict: an x-t graph has a steep positive slope at $t = 2$ s, then becomes a horizontal flat line at $t = 5$ s. Without any calculation, what is the object doing at each of those moments? Commit to an answer — then read on to check.`,

      `An x–t graph is the story of where an object is at every moment in time. The horizontal axis is time; the vertical axis is position. A single dot on the graph tells you one fact: "at this time, the object was at this location." The entire curve tells you the whole journey.`,

      `You can read motion directly from the shape of the curve — before doing any algebra. A flat horizontal line means the object is stopped: position never changes. A straight diagonal line means the object is moving at constant speed: equal position changes in equal time intervals. A curve that bends upward (concave up) means the object is speeding up; a curve that flattens out (concave down) means it is slowing down. The shape is the story.`,

      `The slope of the x–t curve at any moment tells you velocity. Steep positive slope means fast forward motion. Gentle positive slope means slow forward motion. Zero slope (flat tangent) means momentarily stopped. Negative slope means moving backward — position is decreasing. This is the key translation: **steepness of curve = speed, sign of slope = direction.**`,

      `Two objects can be at the same position at the same time but have completely different slopes at that point — meaning different velocities. This is why the two cars in the hook have different graphs even though they cross the same intersection simultaneously: one has a gentle, nearly constant slope; the other has a steep slope that is rapidly decreasing as the brakes take effect.`,

      `Over any time interval, you estimate average velocity by drawing the secant line — the straight line connecting two points on the curve. The slope of that secant line gives the average velocity over that interval. This is pure algebra: rise over run, $\\Delta x / \\Delta t$. No calculus needed. The finer you make the interval, the better the estimate becomes — until, in the limit, you get the instantaneous velocity.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Four steps to reading any x-t graph',
        body: `**Step 1 — Identify shape:** Classify each segment as flat (stopped), straight diagonal (constant velocity), or curved.\n**Step 2 — Read slope sign:** Positive slope = moving in +x direction; negative slope = moving in −x direction; zero slope = stopped.\n**Step 3 — Compute average velocity:** Draw a secant between two points and compute $\\Delta x / \\Delta t$.\n**Step 4 — Identify acceleration from curvature:** Concave up = slope increasing = speeding up. Concave down = slope decreasing = slowing down. Straight line = zero acceleration.`,
      },
      {
        type: 'insight',
        title: 'Slope from algebra: Δx/Δt',
        body: `The slope of any line through $(t_1, x_1)$ and $(t_2, x_2)$ is $\\Delta x / \\Delta t = (x_2 - x_1)/(t_2 - t_1)$. This is rise over run with position on the y-axis and time on the x-axis. Reading a motion graph is applying this formula to real-world data.`,
      },
      {
        type: 'insight',
        title: 'Three shapes, three stories',
        body: `Flat line → stopped. Straight diagonal → constant velocity (uniform motion). Curve concave up → speeding up (positive acceleration). Curve concave down → slowing down (negative acceleration). You can identify all four situations from graph shape alone, before calculating a single number.`,
      },
      {
        type: 'insight',
        title: 'Calculus connection: slope → derivative',
        body: `The slope of the secant line (average velocity) becomes the slope of the tangent line (instantaneous velocity) as the interval $\\Delta t \\to 0$. This limit is exactly the derivative $dx/dt$. The speedometer paradox — how can speed exist at a single instant? — is fully resolved by the limit definition of the derivative.`,
      },
      {
        type: 'warning',
        title: 'x–t slope is NOT the shape of the path',
        body: `A steep x–t graph does not mean the object moved steeply through space. It means the object moved quickly. A ball thrown horizontally has a curved path in 2D space, but its x-coordinate vs time is a straight line (constant horizontal velocity). Always remember: x–t graphs plot position against time, not trajectory through space.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-avg-velocity' },
        title: 'Average velocity — algebra only',
        caption: `Pick any two points on the x–t curve. Divide the rise (Δx) by the run (Δt). That ratio is the average velocity over that interval. No calculus — just subtraction and division.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'slope-triangle' },
        title: 'Secant slope → tangent slope',
        caption: `As Δt shrinks, the secant (dashed, average) rotates onto the tangent (solid, instantaneous). The limiting slope is dx/dt = velocity.`,
      },
    ],
  },

  math: {
    prose: [
      `The average velocity over any interval $[t_1, t_2]$ is the secant slope: the ratio of the change in position to the change in time. You compute it algebraically — read two coordinates off the graph, subtract, divide. If position decreases ($x_2 < x_1$), the slope is negative and velocity is negative: the object is moving in the negative direction.`,
      `Instantaneous velocity at a single moment $t$ is the slope of the tangent line to the x–t curve at that point. You can only estimate it by drawing as small a secant as possible. The exact value requires taking the limit: $v(t) = \\lim_{\\Delta t \\to 0} \\Delta x / \\Delta t = dx/dt$. In problems, instantaneous velocity is found analytically by differentiating the position function.`,
      `For a position function $x(t) = x_0 + v_0 t + \\frac{1}{2}at^2$ (constant acceleration), the slope at time $t$ is exactly $v(t) = v_0 + at$. The x–t graph is a parabola; its slope changes linearly with time. This is why the v-t graph is a straight line when the x-t graph is a parabola.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Average velocity (secant slope)',
        body: `\\bar{v} = \\frac{\\Delta x}{\\Delta t} = \\frac{x(t_2) - x(t_1)}{t_2 - t_1}`,
      },
      {
        type: 'definition',
        title: 'Instantaneous velocity (tangent slope)',
        body: `v(t) = \\lim_{\\Delta t \\to 0} \\frac{\\Delta x}{\\Delta t} = \\frac{dx}{dt}`,
      },
      {
        type: 'insight',
        title: 'Slope signs tell direction and speed',
        body: `Positive slope ($x$ increasing) → moving in +x direction. Negative slope ($x$ decreasing) → moving in −x direction. Zero slope → momentarily stopped. The magnitude of the slope tells you speed; the sign tells you direction. Speed = $|\\text{slope}|$.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'xt-vt-graphs' },
        title: 'Shape on x–t, slope on v–t',
        caption: `For x(t) = x₀ + v₀t + ½at², the slope at any point is v(t) = v₀ + at — a linear function. At a peak (v=0), the tangent is horizontal. Concave up = positive acceleration. Concave down = negative acceleration.`,
      },
    ],
  },

  rigor: {
    prose: [
      `The claim that "slope of x–t equals velocity" is not a geometric analogy — it is a theorem. Define average velocity over $[t, t+\\Delta t]$ as $\\bar{v} = (x(t+\\Delta t) - x(t)) / \\Delta t$ — this is exactly the secant slope. Define instantaneous velocity as the limit $v(t) = \\lim_{\\Delta t \\to 0} \\bar{v}$. By definition this is the derivative $dx/dt$. So velocity literally is the derivative of position with respect to time — the two concepts are the same object viewed algebraically and geometrically.`,

      `The velocity-as-slope theorem holds for any differentiable $x(t)$, regardless of functional form. For $x(t) = x_0 + v_0 t + \\frac{1}{2}at^2$, differentiation gives $v(t) = v_0 + at$ — linear in $t$. For $x(t) = A\\sin(\\omega t)$, $v(t) = A\\omega\\cos(\\omega t)$. For $x(t) = e^{bt}$, $v(t) = be^{bt}$. In all cases, slope of x-t = velocity. The only requirement is differentiability — if the x-t curve has a corner (non-differentiable kink), velocity is undefined at that point.`,

      `Geometric facts: at a local maximum of $x(t)$, $v = 0$ (horizontal tangent) and the object reverses direction. Between a local max and the next local min, $v < 0$. At an inflection point of $x(t)$, $a = d^2x/dt^2 = 0$ — neither speeding up nor slowing down. These facts connect the visual appearance of the graph to physics: finding turning points and inflection points on the x-t graph is equivalent to solving $v = 0$ and $a = 0$.`,

      `Numerical differentiation approximates $v(t)$ from discrete data: $v(t) \\approx (x(t+\\Delta t) - x(t)) / \\Delta t$ (forward difference, error $O(\\Delta t)$) or $(x(t+h) - x(t-h))/(2h)$ (central difference, error $O(\\Delta t^2)$). All digital motion sensors — GPS, IMUs, smartphone accelerometers — implement this. The central-difference formula is the "smoother" estimate used in most engineering software. The exact derivative, lesson 7 of this chapter, is the analytical limit of these formulas.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Velocity is the derivative of position',
        body: `v(t) = \\frac{dx}{dt} = \\lim_{\\Delta t \\to 0} \\frac{x(t+\\Delta t)-x(t)}{\\Delta t}`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'xt-vt-graphs' },
        title: 'Secant converges to tangent as Δt → 0',
        caption: `Average velocity (secant slope) → instantaneous velocity (tangent slope) as the time interval shrinks. The slope of the tangent is the derivative dx/dt.`,
      },
    ],
  },

  checkpoints: [
    {
      id: 'ch2-003-cp1',
      question: `An object at $x = 15$ m has a zero slope on the x-t graph. What is its velocity?`,
      answer: `Velocity = 0 m/s. Zero slope (horizontal tangent) means the position is momentarily not changing — the object is stopped at that instant. The position 15 m tells you where the object is, not how fast it is moving.`,
    },
    {
      id: 'ch2-003-cp2',
      question: `An x-t curve is concave down at $t = 3$ s. What does this tell you about acceleration?`,
      answer: `Concave down means the slope (velocity) is decreasing at $t = 3$ s, which means acceleration is negative at that moment. The object is either slowing down (if moving forward) or speeding up in the backward direction.`,
    },
  ],

  examples: [
    {
      id: 'ch2-003-ex1',
      title: 'Read average velocity from two graph points',
      problem: `\\text{A car\'s x–t data shows }x(2) = 4\\text{ m and }x(6) = 20\\text{ m. Find average velocity over }[2, 6].`,
      steps: [
        { expression: `\\bar{v} = \\frac{x(6) - x(2)}{6 - 2} = \\frac{20 - 4}{4} = \\frac{16}{4}`, annotation: `Apply the secant slope formula: rise = Δx, run = Δt.` },
        { expression: `\\bar{v} = 4\\,\\text{m/s}`, annotation: `The car moved 16 m in 4 s, averaging 4 m/s forward.` },
      ],
      conclusion: `Average velocity is 4 m/s. This is the slope of the secant line between the two graph points — pure algebra, no calculus.`,
    },
    {
      id: 'ch2-003-ex2',
      title: 'Identify motion from graph shape',
      problem: `\\text{An x–t graph shows: (A) flat line from }t=0\\text{ to }3,\\text{ (B) increasing straight line from }3\\text{ to }7,\\text{ (C) decreasing curve from }7\\text{ to }10.\\text{ Describe the motion.}`,
      steps: [
        { expression: `v = 0\\text{ on }[0, 3]`, annotation: `(A) Flat line → zero slope → object is stopped.` },
        { expression: `v > 0,\\text{ constant on }[3, 7]`, annotation: `(B) Straight diagonal → constant slope → constant positive velocity.` },
        { expression: `v < 0,\\text{ slope becoming less negative on }[7, 10]`, annotation: `(C) Decreasing curve → negative but increasing (less negative) slope → moving backward, slowing down.` },
      ],
      conclusion: `Stopped → constant forward motion → decelerating backward motion. Three shapes, three stories.`,
    },
    {
      id: 'ch2-003-ex3',
      title: 'Full analysis of a quadratic position function',
      problem: `\\text{A particle has }x(t) = 5 + 3t - 2t^2\\text{ m. Find: (a) initial position, (b) initial velocity, (c) velocity at }t=2\\text{ s, (d) when is the particle momentarily stopped?}`,
      steps: [
        { expression: `x(0) = 5\\,\\text{m}`, annotation: `(a) Evaluate at $t=0$: the particle starts 5 m from the origin.` },
        { expression: `v(t) = \\frac{dx}{dt} = 3 - 4t`, annotation: `Differentiate $x(t)$: power rule on each term.` },
        { expression: `v(0) = 3\\,\\text{m/s}`, annotation: `(b) Initial velocity is positive — moving in the +x direction.` },
        { expression: `v(2) = 3 - 4(2) = -5\\,\\text{m/s}`, annotation: `(c) At $t=2$ s the velocity is negative — moving backward. The particle reversed direction before $t=2$ s.` },
        { expression: `v = 0:\\quad 3 - 4t = 0 \\implies t = 0.75\\,\\text{s}`, annotation: `(d) Solve $v(t) = 0$. At $t = 0.75$ s the particle is at its maximum displacement, then reverses.` },
      ],
      conclusion: `$x(0) = 5$ m; $v(0) = 3$ m/s (forward); $v(2) = -5$ m/s (backward); reversal at $t = 0.75$ s. The negative velocity at $t=2$ s is visible on the x-t graph as a downward slope.`,
    },
  ],

  challenges: [
    {
      id: 'ch2-003-ch1',
      difficulty: 'medium',
      problem: `\\text{Can velocity be zero while position is nonzero? Explain with a graph sketch.}`,
      hint: `Think about a flat tangent on x–t — at what position does it occur?`,
      walkthrough: [
        { expression: `v = 0 \\iff \\frac{dx}{dt} = 0 \\iff \\text{horizontal tangent}`, annotation: `Velocity is zero when slope is zero — not when position is zero.` },
        { expression: `\\text{Example: } x(t) = 10 - 2t^2,\\quad v(t) = -4t`, annotation: `At $t=0$: $x=10$ m (nonzero position) and $v=0$ (stopped). Position is 10 m from the origin; the object is there and not moving.` },
      ],
      answer: `Yes. $v = 0$ means the slope is zero (flat tangent) — the object is momentarily stopped wherever it is. Position is completely independent of velocity.`,
    },
    {
      id: 'ch2-003-ch2',
      difficulty: 'medium',
      problem: `\\text{An x–t graph is a parabola: }x(t) = 2t^2.\\text{ Find instantaneous velocity at }t=3\\text{ and average velocity over }[2, 4].`,
      hint: `Use derivative for instantaneous; use Δx/Δt for average. Do they match?`,
      walkthrough: [
        { expression: `v(t) = \\frac{dx}{dt} = 4t`, annotation: `Differentiate $x = 2t^2$.` },
        { expression: `v(3) = 4(3) = 12\\,\\text{m/s}`, annotation: `Instantaneous velocity at $t = 3$ s.` },
        { expression: `\\bar{v}_{[2,4]} = \\frac{x(4)-x(2)}{4-2} = \\frac{32-8}{2} = 12\\,\\text{m/s}`, annotation: `Average velocity over $[2, 4]$ — the interval is symmetric about $t=3$.` },
      ],
      answer: `Both are 12 m/s. For any quadratic $x(t)$, the average velocity over a symmetric interval $[t_0-h, t_0+h]$ equals the instantaneous velocity at the midpoint $t_0$ (Mean Value Theorem).`,
    },
    {
      id: 'ch2-003-ch3',
      difficulty: 'hard',
      problem: `\\text{For }x(t) = 3t^3 - 9t^2 + 5\\text{ m: find (a) velocity function, (b) when }v=0\\text{, (c) whether those times are local max or min of }x(t).`,
      hint: `$v = 0$ gives turning points. The second derivative $a = d^2x/dt^2$ determines max vs min.`,
      walkthrough: [
        { expression: `v(t) = \\frac{dx}{dt} = 9t^2 - 18t = 9t(t-2)`, annotation: `(a) Differentiate: power rule on each term, factor.` },
        { expression: `v = 0:\\quad 9t(t-2) = 0 \\implies t = 0\\text{ or }t = 2\\,\\text{s}`, annotation: `(b) Two turning points.` },
        { expression: `a(t) = \\frac{dv}{dt} = 18t - 18`, annotation: `Second derivative (acceleration) needed to classify extrema.` },
        { expression: `a(0) = -18\\,\\text{m/s}^2 < 0 \\implies \\text{local max at }t=0`, annotation: `Negative second derivative at $t=0$ → concave down → local maximum. $x(0) = 5$ m.` },
        { expression: `a(2) = +18\\,\\text{m/s}^2 > 0 \\implies \\text{local min at }t=2`, annotation: `Positive second derivative at $t=2$ → concave up → local minimum. $x(2) = 24-36+5 = -7$ m.` },
      ],
      answer: `$v(t) = 9t(t-2)$; $v=0$ at $t=0$ (local max, $x=5$ m) and $t=2$ (local min, $x=-7$ m). The particle moves backward from $t=0$ to $t=2$, reaching $-7$ m, then turns around.`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Average velocity: computing and visualizing secant slopes',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# x–t data for a car (position in metres, time in seconds)
t = np.array([0, 1, 2, 3, 4, 5, 6])
x = np.array([0, 3, 8, 15, 20, 22, 22])

# Average velocity = Δx/Δt for each consecutive interval
v_avg = np.diff(x) / np.diff(t)
t_mid = (t[:-1] + t[1:]) / 2

print("Interval midpoint (s) | Avg velocity (m/s) | Motion")
for tm, v in zip(t_mid, v_avg):
    status = "stopped" if abs(v) < 0.5 else ("forward" if v > 0 else "backward")
    print(f"    {tm:.1f}                |     {v:5.1f}           | {status}")

# Plot x–t with a secant line drawn
i1, i2 = 1, 4    # use data points at t=1 and t=4 s
slope_12 = (x[i2] - x[i1]) / (t[i2] - t[i1])

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(t, x, 'b-o', linewidth=2, markersize=6, label='x(t) data')
t_line = np.linspace(t[i1], t[i2], 50)
x_line = x[i1] + slope_12 * (t_line - t[i1])
ax.plot(t_line, x_line, 'r--', linewidth=1.5,
        label=f'secant slope = {slope_12:.1f} m/s (avg velocity)')
ax.set(xlabel='Time (s)', ylabel='Position (m)', title='x–t Graph with Secant Slope')
ax.legend(); ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('xt_secant.png', dpi=100, bbox_inches='tight')
plt.show()`,
          prose: [
            `\`np.diff(x) / np.diff(t)\` computes $\\Delta x / \\Delta t$ for every consecutive pair — this is the secant slope = average velocity over each interval. The result array has one fewer element than the original (each velocity is defined *between* two position measurements).`,
            `The printed table shows the velocities decreasing from 3 → 5 → 7 → 5 → 2 → 0 m/s. You can read the motion from the numbers: the object accelerates then decelerates, finally stopping. This pattern shows up on the x-t graph as a curve that gets steeper then flattens.`,
            `The secant line on the plot has slope = average velocity over $[t_1, t_4]$. The steeper the actual x-t curve in a region, the higher the velocity in that region. Where the x-t curve is horizontal ($t=5$ to $t=6$), velocity = 0.`,
          ],
        },
        {
          cellTitle: 'x-t and v-t graphs: the derivative relationship',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

t = np.array([0, 1, 2, 3, 4, 5, 6])
x = np.array([0, 3, 8, 15, 20, 22, 22])
v_avg = np.diff(x) / np.diff(t)
t_mid = (t[:-1] + t[1:]) / 2

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 6), sharex=True)

# Top: x-t graph
ax1.plot(t, x, 'b-o', linewidth=2, markersize=6)
ax1.set_ylabel('Position (m)')
ax1.set_title('x–t graph (position vs time)')
ax1.grid(True, alpha=0.4)

# Bottom: v-t graph (discrete derivative of x-t)
ax2.bar(t_mid, v_avg, width=0.7, color='salmon', edgecolor='red', alpha=0.8)
ax2.axhline(0, color='k', linewidth=0.8, linestyle='--')
ax2.set_ylabel('Avg velocity (m/s)')
ax2.set_xlabel('Time (s)')
ax2.set_title('v–t graph (numerical derivative of x-t)')
ax2.grid(True, alpha=0.4)

plt.tight_layout()
plt.savefig('xt_vt_linked.png', dpi=100, bbox_inches='tight')
plt.show()

print("When x-t slope is steep → v-t bar is tall")
print("When x-t is flat → v-t bar approaches zero")`,
          prose: [
            `The two panels are linked: the v-t graph (bottom) is the *derivative* of the x-t graph (top). Where the x-t curve is steep (large slope), the v-t bar is tall. Where the x-t curve is flat, the v-t bar is near zero.`,
            `\`ax2.bar(t_mid, v_avg, ...)\` plots each average velocity as a bar centered at the midpoint of its interval. This is the "staircase" approximation — as the time intervals shrink, it converges to the smooth v(t) curve.`,
            `Notice the last two bars: v drops to 2 m/s then 0 m/s. On the x-t graph above, the curve flattens and becomes horizontal. The two graphs tell the same story in different languages — the v-t graph is the "slope story" of the x-t graph.`,
          ],
        },
        {
          cellTitle: 'Secant converges to tangent: the limit in action',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

def x_func(t): return 2*t**2      # x(t) = 2t²
def v_exact(t): return 4*t        # v(t) = dx/dt = 4t

t0 = 3.0
true_v = v_exact(t0)

print(f"True instantaneous velocity at t={t0} s: {true_v} m/s")
print()
print(f"{'Δt':>8}  {'secant slope':>14}  {'error':>10}")
for dt in [2.0, 1.0, 0.5, 0.1, 0.01, 0.001]:
    secant = (x_func(t0 + dt) - x_func(t0)) / dt
    err = abs(secant - true_v)
    print(f"{dt:8.4f}  {secant:14.8f}  {err:10.8f}")

# Visualize convergence
fig, ax = plt.subplots(figsize=(7, 4))
t_arr = np.linspace(0, 5, 200)
ax.plot(t_arr, x_func(t_arr), 'b-', linewidth=2, label='x(t) = 2t²')

for dt, color in [(2.0, 'lightcoral'), (0.5, 'orange'), (0.1, 'green')]:
    slope = (x_func(t0+dt) - x_func(t0)) / dt
    t_line = np.array([t0 - 1, t0 + dt + 0.5])
    x_line = x_func(t0) + slope * (t_line - t0)
    ax.plot(t_line, x_line, '--', color=color, linewidth=1.5,
            label=f'secant Δt={dt}: slope={slope:.1f}')

ax.plot(t_arr, x_func(t0) + true_v*(t_arr-t0), 'k-', linewidth=2,
        label=f'tangent: slope={true_v}')
ax.set_xlim(1, 5); ax.set_ylim(0, 55)
ax.set(xlabel='Time (s)', ylabel='Position (m)', title='Secant slopes converging to tangent')
ax.legend(fontsize=8); ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('secant_convergence.png', dpi=100, bbox_inches='tight')
plt.show()`,
          prose: [
            `For $x(t) = 2t^2$, the true instantaneous velocity at $t=3$ is $v = 4(3) = 12$ m/s (from the derivative). The secant slope $(x(3+\\Delta t) - x(3)) / \\Delta t$ converges to this as $\\Delta t \\to 0$.`,
            `The error column shows the secant is only 12.000001 when $\\Delta t = 0.001$ — the approximation is excellent at small intervals. This numerical convergence is exactly the limit definition of the derivative in action.`,
            `The plot shows three secant lines (light colors) and the exact tangent (black). As $\\Delta t$ shrinks from 2 to 0.1, the secant rotates toward the tangent. The tangent is the "infinitely precise" limit of this rotation — it touches $x(t)$ at exactly one point and has slope $= v(t_0)$.`,
          ],
        },
        {
          cellTitle: 'Challenge — classify motion phases from x-t data',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

t2 = np.array([0, 1, 2, 3, 4, 5, 6, 7, 8])
x2 = np.array([5, 5, 5, 8, 11, 14, 16, 15, 13])

# TODO: Compute the average velocity for each 1-second interval
# Then classify each interval as one of:
#   'stopped'   — |v| < 0.5 m/s
#   'forward'   — v > 0.5 m/s and velocity is roughly constant
#   'backward'  — v < -0.5 m/s
# Print: [t_a, t_b] | v | classification
#
# BONUS: also compute the acceleration (Δv/Δt from consecutive velocities)
# and identify which intervals show acceleration vs deceleration`,
          prose: [
            `\`np.diff(x2)\` gives all the $\\Delta x$ steps; dividing by \`np.diff(t2)\` gives the average velocity for each interval. The thresholds ($|v| < 0.5$ for "stopped") are arbitrary — in real data you'd choose them based on sensor noise.`,
            `To find acceleration, apply \`np.diff()\` a second time on the velocity array: $a \\approx \\Delta v / \\Delta t$. Each acceleration value has one fewer element again (now you have $n-2$ acceleration values for $n$ position readings).`,
            `Challenge: the object in this dataset stops for 2 seconds, then moves forward, then reverses. Can you identify all three phases and the exact moments of transition from the computed velocities?`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Average velocity: secant slopes from data',
          type: 'code',
          language: 'matlab',
          code: `% x–t data for a car
t = [0, 1, 2, 3, 4, 5, 6];
x = [0, 3, 8, 15, 20, 22, 22];

% Average velocity = Δx/Δt for each interval
v_avg = diff(x) ./ diff(t);
t_mid = (t(1:end-1) + t(2:end)) / 2;

fprintf('%-22s | %-18s\\n', 'Interval midpoint (s)', 'Avg velocity (m/s)')
for i = 1:length(v_avg)
    if abs(v_avg(i)) < 0.5
        status = 'stopped';
    elseif v_avg(i) > 0
        status = 'forward';
    else
        status = 'backward';
    end
    fprintf('    %.1f                 |     %5.1f           (%s)\\n', ...
            t_mid(i), v_avg(i), status)
end

% Plot x-t with secant
i1 = 2; i2 = 5;  % indices for t=1 and t=4
slope_12 = (x(i2) - x(i1)) / (t(i2) - t(i1));

figure; hold on
plot(t, x, 'b-o', 'LineWidth', 2, 'MarkerSize', 6)
t_line = linspace(t(i1), t(i2), 50);
x_line = x(i1) + slope_12 * (t_line - t(i1));
plot(t_line, x_line, 'r--', 'LineWidth', 1.5)
xlabel('Time (s)'); ylabel('Position (m)')
title(sprintf('x–t graph  |  secant slope = %.1f m/s', slope_12))
legend('x(t) data', 'secant line')
grid on`,
          prose: [
            `\`diff(x) ./ diff(t)\` uses MATLAB\'s element-wise division to compute $\\Delta x / \\Delta t$ for every consecutive pair. The \`./\` operator is essential here — without it, MATLAB would attempt matrix division.`,
            `\`t(1:end-1)\` and \`t(2:end)\` extract the first $n-1$ and last $n-1$ elements, respectively. Their average gives the midpoint of each interval — where the velocity "lives" in the discrete approximation.`,
            `The secant line is drawn using the linear formula $x_{line} = x(i_1) + \\text{slope} \\cdot (t - t(i_1))$. The slope of this line is the average velocity over the selected interval — the same number printed in the table.`,
          ],
        },
        {
          cellTitle: 'x-t and v-t linked panels',
          type: 'code',
          language: 'matlab',
          code: `t = [0, 1, 2, 3, 4, 5, 6];
x = [0, 3, 8, 15, 20, 22, 22];
v_avg = diff(x) ./ diff(t);
t_mid = (t(1:end-1) + t(2:end)) / 2;

figure

subplot(2,1,1)
plot(t, x, 'b-o', 'LineWidth', 2, 'MarkerSize', 6)
ylabel('Position (m)'); title('x–t graph')
grid on

subplot(2,1,2)
bar(t_mid, v_avg, 0.7, 'FaceColor', [1 0.6 0.6], 'EdgeColor', 'red')
yline(0, 'k--')
ylabel('Avg velocity (m/s)'); xlabel('Time (s)')
title('v–t graph (numerical derivative of x–t)')
grid on`,
          prose: [
            `\`subplot(2,1,1)\` creates a 2-row, 1-column figure with the x-t graph on top and v-t on the bottom. The \`sharex\` behavior is implicit — both x-axes show time in seconds.`,
            `\`bar(t_mid, v_avg, 0.7, ...)\` plots velocity as bars centered at interval midpoints. The height of each bar is the slope of the x-t curve in that interval. Tall bar = steep x-t slope. Zero-height bar = flat x-t region.`,
            `Reading the two panels together: the tallest v-t bar (7 m/s at $t \\approx 2.5$ s) corresponds to the steepest segment of the x-t curve. Where the x-t curve flattens (last two seconds), the v-t bars drop to 2 then 0.`,
          ],
        },
        {
          cellTitle: 'Secant converges to tangent',
          type: 'code',
          language: 'matlab',
          code: `x_func = @(t) 2*t.^2;
v_exact = @(t) 4*t;

t0 = 3.0;
true_v = v_exact(t0);
fprintf('True instantaneous velocity at t=%.1f s: %.1f m/s\\n\\n', t0, true_v)

dt_vals = [2.0, 1.0, 0.5, 0.1, 0.01, 0.001];
fprintf('%8s  %14s  %10s\\n', 'Δt', 'secant slope', 'error')
for dt = dt_vals
    secant = (x_func(t0 + dt) - x_func(t0)) / dt;
    err = abs(secant - true_v);
    fprintf('%8.4f  %14.8f  %10.8f\\n', dt, secant, err)
end

% Plot convergence
t_arr = linspace(0, 5, 200);
figure; hold on
plot(t_arr, x_func(t_arr), 'b-', 'LineWidth', 2)

colors = {[1 0.6 0.6], [1 0.8 0], [0 0.7 0]};
dt_plot = [2.0, 0.5, 0.1];
for k = 1:3
    dt = dt_plot(k);
    s = (x_func(t0+dt) - x_func(t0)) / dt;
    t_line = [t0-1, t0+dt+0.5];
    x_line = x_func(t0) + s*(t_line - t0);
    plot(t_line, x_line, '--', 'Color', colors{k}, 'LineWidth', 1.5, ...
         'DisplayName', sprintf('secant Δt=%.1f: slope=%.1f', dt, s))
end
t_tan = linspace(1, 5, 100);
plot(t_tan, x_func(t0)+true_v*(t_tan-t0), 'k-', 'LineWidth', 2, ...
     'DisplayName', sprintf('tangent: slope=%.0f', true_v))
xlim([1 5]); ylim([0 55])
xlabel('Time (s)'); ylabel('Position (m)')
title('Secant slopes converging to tangent')
legend('show'); grid on`,
          prose: [
            `For $x(t) = 2t^2$, the anonymous function \`v_exact = @(t) 4*t\` is the exact derivative. The loop computes the secant approximation at decreasing $\\Delta t$ and prints the convergence — by $\\Delta t = 0.001$, the error is less than $10^{-5}$.`,
            `The colored dashed lines are secants with different $\\Delta t$ values (red = largest, green = smallest). Watch how they rotate toward the black tangent as $\\Delta t$ decreases. This rotation is the geometric meaning of the derivative as a limit.`,
            `This example uses a simple quadratic, but the convergence happens for any differentiable function. The key insight: "instantaneous velocity" is not a paradox — it is the limit of average velocities over shrinking intervals, which always converges for smooth motion.`,
          ],
        },
        {
          cellTitle: 'Challenge — classify motion phases',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `t2 = [0, 1, 2, 3, 4, 5, 6, 7, 8];
x2 = [5, 5, 5, 8, 11, 14, 16, 15, 13];

% TODO: Compute average velocity for each 1-second interval
% Classify each interval as 'stopped', 'forward', or 'backward'
% Print: [t_a, t_b] | v | classification
%
% BONUS: compute acceleration (diff of velocity array)
% and identify accelerating vs decelerating intervals`,
          prose: [
            `\`diff(x2) ./ diff(t2)\` gives 8 velocity values for 9 position readings. Use a \`for\` loop or logical indexing to classify each based on sign and magnitude.`,
            `For the bonus: \`diff(v_avg)\` gives acceleration estimates (one fewer element again). Positive acceleration = speeding up in the +x direction; negative = slowing down or speeding up backward. Pair this with the velocity sign to determine whether the object is accelerating or decelerating.`,
            `The expected phases: stopped for $t \\in [0,2]$, forward with roughly constant velocity for $t \\in [2,6]$, then backward for $t \\in [6,8]$. Verify this by inspecting the velocity signs.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch2-003-q1',
      type: 'choice',
      question: `A flat horizontal line on an x–t graph means the object is:`,
      options: [`Moving at constant velocity`, `Accelerating`, `Stopped (at rest)`, `Moving backward`],
      answer: `Stopped (at rest)`,
      hints: [
        `Flat line → zero slope. What kinematic quantity equals the slope of an x-t graph?`,
        `Position not changing = object not moving.`,
      ],
      reviewSection: 'intuition',
      explanation: `Flat line → zero slope → zero velocity. Position isn\'t changing, so the object is stopped.`,
    },
    {
      id: 'p1-ch2-003-q2',
      type: 'choice',
      question: `What does a negative slope on an x–t graph indicate?`,
      options: [`Decelerating`, `Moving in the negative direction`, `At a negative position`, `At rest`],
      answer: `Moving in the negative direction`,
      hints: [
        `Slope = Δx/Δt. What does a negative Δx mean about the direction of motion?`,
        `Sign of slope = direction. Magnitude of slope = speed.`,
      ],
      reviewSection: 'math',
      explanation: `Negative slope means position is decreasing — the object moves in the −x direction. Sign of slope = direction; magnitude of slope = speed.`,
    },
    {
      id: 'p1-ch2-003-q3',
      type: 'choice',
      question: `$x(2) = 4$ m and $x(6) = 20$ m. What is the average velocity over $[2, 6]$?`,
      options: [`2 m/s`, `4 m/s`, `8 m/s`, `16 m/s`],
      answer: `4 m/s`,
      hints: [
        `Average velocity = Δx/Δt. Compute the rise (Δx) and the run (Δt).`,
        `$\\Delta x = 20 - 4 = 16$ m; $\\Delta t = 6 - 2 = 4$ s.`,
      ],
      reviewSection: 'examples',
      explanation: `$\\bar{v} = \\Delta x / \\Delta t = (20-4)/(6-2) = 16/4 = 4$ m/s. This is the secant slope.`,
    },
    {
      id: 'p1-ch2-003-q4',
      type: 'choice',
      question: `A concave-upward (bowl-shaped) x–t curve indicates:`,
      options: [`Decelerating`, `Moving backward`, `Speeding up (positive acceleration)`, `Stopped`],
      answer: `Speeding up (positive acceleration)`,
      hints: [
        `Concave up means the slope is increasing over time. What does increasing slope mean for velocity?`,
        `Slope of x-t = velocity. Increasing slope = increasing velocity = positive acceleration.`,
      ],
      reviewSection: 'intuition',
      explanation: `Concave up → increasing slope → increasing velocity → positive acceleration. Concave down → decreasing slope → decreasing velocity → deceleration.`,
    },
    {
      id: 'p1-ch2-003-q5',
      type: 'choice',
      question: `Instantaneous velocity equals:`,
      options: [
        `Area under the x–t curve`,
        `Secant slope over a large interval`,
        `Slope of the tangent line at that instant`,
        `y-intercept of the curve`,
      ],
      answer: `Slope of the tangent line at that instant`,
      hints: [
        `Instantaneous velocity is the limit of average velocity as the time interval shrinks to zero.`,
        `As Δt → 0, the secant line becomes the tangent line.`,
      ],
      reviewSection: 'rigor',
      explanation: `Instantaneous velocity = slope of the tangent = $\\lim_{\\Delta t \\to 0} \\Delta x / \\Delta t = dx/dt$.`,
    },
    {
      id: 'p1-ch2-003-q6',
      type: 'choice',
      question: `Can two objects have the same position but different velocities at the same instant?`,
      options: [
        `No — same position means same velocity`,
        `Yes — same position just means the curves cross, not that slopes are equal`,
        `Only if one is accelerating`,
        `Only in 2D`,
      ],
      answer: `Yes — same position just means the curves cross, not that slopes are equal`,
      hints: [
        `Think of two x-t curves that intersect. What does crossing mean vs having the same slope?`,
        `Same position = same y-value at the crossing point. Same velocity would require identical slopes there too.`,
      ],
      reviewSection: 'intuition',
      explanation: `When two x–t curves cross, positions are equal but slopes (velocities) can differ completely — as with the two cars in the hook.`,
    },
    {
      id: 'p1-ch2-003-q7',
      type: 'choice',
      question: `For $x(t) = 2t^2$, what is the instantaneous velocity at $t = 3$ s?`,
      options: [`6 m/s`, `12 m/s`, `18 m/s`, `9 m/s`],
      answer: `12 m/s`,
      hints: [
        `Find $v(t) = dx/dt$ by differentiating $x(t) = 2t^2$.`,
        `Power rule: $d/dt(2t^2) = 4t$. Evaluate at $t = 3$.`,
      ],
      reviewSection: 'examples',
      explanation: `$v(t) = dx/dt = 4t$. At $t=3$: $v = 12$ m/s.`,
    },
    {
      id: 'p1-ch2-003-q8',
      type: 'choice',
      question: `The slope of the secant line on an x–t graph represents:`,
      options: [`Instantaneous velocity`, `Average velocity over that interval`, `Average acceleration`, `Distance travelled`],
      answer: `Average velocity over that interval`,
      hints: [
        `Secant slope = Δx/Δt. Which kinematic quantity is this?`,
        `As the interval shrinks to zero, the secant becomes the tangent and approaches instantaneous velocity.`,
      ],
      reviewSection: 'math',
      explanation: `Secant slope = $\\Delta x / \\Delta t$ = average velocity over the interval. As the interval shrinks, it converges to instantaneous velocity.`,
    },
    {
      id: 'p1-ch2-003-q9',
      type: 'choice',
      question: `An x–t graph has a local maximum (peak). What is the velocity at the peak?`,
      options: [
        `Maximum velocity`,
        `Zero velocity`,
        `Negative velocity`,
        `Undefined`,
      ],
      answer: `Zero velocity`,
      hints: [
        `At a local maximum, the function is neither increasing nor decreasing at that instant.`,
        `A local maximum has a horizontal tangent — what slope does that correspond to?`,
      ],
      reviewSection: 'rigor',
      explanation: `At a local maximum of $x(t)$, the tangent is horizontal — slope = 0 — so velocity = 0. The object is momentarily stopped before reversing direction.`,
    },
    {
      id: 'p1-ch2-003-q10',
      type: 'choice',
      question: `For $x(t) = 5t - t^2$, what is the instantaneous velocity at $t = 3$ s?`,
      options: [`$-1$ m/s`, `$1$ m/s`, `$5$ m/s`, `$-3$ m/s`],
      answer: `$-1$ m/s`,
      hints: [
        `Differentiate $x(t) = 5t - t^2$ to find $v(t)$.`,
        `$v(t) = 5 - 2t$. Evaluate at $t = 3$.`,
      ],
      reviewSection: 'examples',
      explanation: `$v(t) = dx/dt = 5 - 2t$. At $t = 3$: $v = 5 - 6 = -1$ m/s. Negative means the object is moving in the −x direction at that moment.`,
    },
  ],

  misconceptions: [
    {
      id: 'ch2-003-m1',
      myth: `The x–t graph shows the physical path (trajectory) the object follows through space.`,
      reality: `The x–t graph plots position (one coordinate) versus time — not a map of the object\'s path. A curved x–t graph means changing velocity, not a curved path in space. The object is still moving in one dimension; the curve only shows that its speed is changing.`,
      correctionExample: `A ball thrown horizontally at 10 m/s follows a parabolic arc in 2D space. But its x-coordinate (horizontal position) vs time is a straight line ($x = 10t$) — constant horizontal velocity. The curved physical path and the straight x-t graph coexist. The x-t graph captures only one coordinate, not the full trajectory.`,
    },
    {
      id: 'ch2-003-m2',
      myth: `A steep slope on the x–t graph always means the object is moving forward quickly.`,
      reality: `Steep slope means high speed — but the sign tells direction. A slope of −8 m/s means the object is moving backward at 8 m/s, which is faster than an object with slope +3 m/s. Speed = $|\\text{slope}|$. Fast backward motion looks like a steep negative slope on the x-t graph.`,
      correctionExample: `Two objects on the same x-t graph: Object A has slope +3 m/s (moving forward slowly). Object B has slope −8 m/s (moving backward rapidly). Object B is faster despite its negative slope. The person who says "steeper means faster forward motion" would incorrectly conclude A is faster.`,
    },
  ],

  transferPrompts: [
    `A GPS tracker records your car\'s position every second. Describe exactly how you would compute your instantaneous speed at $t = 10$ s from this discrete data. What sources of error exist in your estimate, and how would you reduce them?`,
    `An x-t graph has an inflection point at $t = 4$ s — the concavity changes from concave up to concave down. What does this mean physically? At that moment, is the object speeding up, slowing down, or at constant speed?`,
  ],

  debugging: [
    {
      id: 'ch2-003-d1',
      buggyWork: `A student reads $x(0) = 2$ m and $x(4) = 10$ m from a curved x-t graph and concludes: "The velocity is $(10-2)/4 = 2$ m/s at every moment from $t=0$ to $t=4$ s."`,
      question: `What is wrong with this statement?`,
      answer: `The student correctly computed the *average* velocity over $[0, 4]$ s as 2 m/s. But because the graph is curved, the instantaneous velocity varies continuously — it is not 2 m/s at every moment. At some instants it may be faster, at others slower. The average tells you the overall rate of displacement, not the instantaneous rate. To find instantaneous velocity at any specific moment, you need the tangent slope at that point, not the secant.`,
    },
    {
      id: 'ch2-003-d2',
      buggyWork: `A student looks at an x-t graph where position decreases from $x = 20$ m to $x = 5$ m and says: "The object went backward, so it must be decelerating."`,
      question: `Identify the logical error.`,
      answer: `Negative velocity (moving backward) and deceleration are different things. Deceleration means speed is decreasing, not that the object is moving in the negative direction. An object moving backward at increasing speed is accelerating (in the negative direction). Negative slope on x-t = moving backward. Concave down slope = slope becoming less positive (or more negative) = acceleration in the negative direction. To determine if the object is decelerating, you need to check whether $|v|$ is decreasing — which requires seeing how the slope magnitude changes over time.`,
    },
  ],

  mastery: {
    targetLevel: `You can look at any x-t graph and immediately describe the motion: identify stopped regions, direction of motion in each segment, and whether the object is accelerating or decelerating from curvature alone.`,
    coreSkill: `Computing average velocity as a secant slope ($\\Delta x / \\Delta t$) and interpreting graph shape: flat = stopped, straight = constant velocity, concave up = accelerating, concave down = decelerating.`,
    commonSticking: `Confusing steepness with forward direction (negative slopes can be steeper), or treating the average velocity as the instantaneous velocity at every point on a curved segment.`,
    connections: [
      `Lesson 4 (velocity-time graphs) shows the v-t graph, which is the derivative of the x-t graph.`,
      `Lesson 7 (definition of dx/dt) formalizes the limit definition that turns secant slopes into instantaneous velocity.`,
      `Calculus 1: tangent lines, the derivative, and the limit definition — the rigorous foundation of everything here.`,
    ],
  },

  semantics: {
    core: [
      { symbol: `\\bar{v}`, meaning: `Average velocity — secant slope on x-t graph: $\\Delta x / \\Delta t$` },
      { symbol: `v(t)`, meaning: `Instantaneous velocity — tangent slope on x-t graph: $dx/dt$` },
      { symbol: `\\Delta x / \\Delta t`, meaning: `Rise over run on x-t graph — average velocity over the interval` },
      { symbol: `dx/dt`, meaning: `Derivative of position — exact slope of tangent, the limit of secant slopes` },
    ],
    rulesOfThumb: [
      `Slope of x-t graph = velocity. Always. Positive = forward, negative = backward, zero = stopped.`,
      `Concave up on x-t = acceleration > 0 (speeding up in +x direction). Concave down = acceleration < 0.`,
      `At a local maximum of x(t), velocity = 0. The object is momentarily stopped at its furthest point.`,
      `Speed = |slope|. A steep negative slope means moving fast in the backward direction.`,
      `The x-t graph shows position vs time, not the physical path through space.`,
    ],
  },
}

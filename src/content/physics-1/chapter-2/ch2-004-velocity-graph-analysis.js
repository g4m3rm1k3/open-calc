export default {
  id: 'p1-ch2-004',
  slug: 'velocity-graph-analysis',
  chapter: 'p2',
  order: 4,
  title: 'Velocity-Time Graph Analysis',
  subtitle: 'On a v–t graph, slope gives acceleration and signed area gives displacement.',
  tags: ['velocity graph', 'area', 'acceleration', 'displacement', 'integration', 'fundamental theorem'],
  aliases: 'v t graph area displacement acceleration',

  hook: {
    question: `A car is moving at 20 m/s and braking hard. Its velocity decreases steadily to zero over 4 seconds. How far does it travel while braking? You have a v–t graph — but no position data at all. Can you find the distance from velocity alone?`,
    realWorldContext: `Brake testing, landing distance calculations, and elevator control all rely on computing displacement from velocity profiles. Crash reconstructionists use v–t graphs — not x–t graphs — because velocity data is easier to measure from impact sensors and black boxes.`,
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      `Before reading on, predict: a car brakes from 20 m/s to 0 in 4 seconds. On the v-t graph this looks like a right triangle (velocity drops linearly from 20 to 0). Without computing, estimate the stopping distance — would you guess closer to 20 m, 40 m, or 80 m? Think of the "average" velocity during the stop.`,

      `A v–t graph tells you how fast an object is moving at every moment in time. The height of the curve at any time gives the instantaneous velocity at that moment: above the axis means moving in the positive direction, below means moving in the negative direction, crossing zero means reversing direction.`,

      `The most powerful thing you can read from a v–t graph is displacement — not by looking at height, but by looking at area. The signed area between the curve and the time-axis, over any interval, equals the displacement during that interval. This is the fundamental bridge between velocity and position: area under v–t gives $\\Delta x$, just as slope on x–t gave velocity.`,

      `Why area? Think about what happens when velocity is constant. If you travel at 10 m/s for 4 seconds, your displacement is $10 \\times 4 = 40$ m. On a v–t graph, this is a horizontal line at height 10 over a width of 4 — a rectangle with area $10 \\times 4 = 40$. Displacement IS area when velocity is constant. For varying velocity, the area rule still holds — the "area" is under a curve, which is exactly what an integral measures.`,

      `The slope of the v–t curve tells you acceleration. Just as velocity was the slope of x–t, acceleration is the slope of v–t. Positive slope (velocity increasing) means positive acceleration. Negative slope (velocity decreasing) means the object is decelerating. Flat slope (constant velocity) means zero acceleration.`,

      `An important distinction: speed is the magnitude of velocity. The signed area under v–t gives displacement (which can be negative); the unsigned area (treating all area as positive) gives total distance traveled. These differ when the object reverses direction.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Three readings from any v-t graph',
        body: `**Height → velocity:** The y-value at any time $t$ is the instantaneous velocity. Positive = forward, negative = backward, zero = stopped.\n**Slope → acceleration:** $a = \\Delta v / \\Delta t$ — slope of the line segment. Positive slope = speeding up; negative slope = slowing down.\n**Signed area → displacement:** Sum all areas between the curve and the time-axis: positive area (above axis) adds to $\\Delta x$; negative area (below axis) subtracts. Unsigned area = total distance.`,
      },
      {
        type: 'insight',
        title: 'Area computation for piecewise-linear graphs',
        body: `For a v–t graph made of straight-line segments, area is always a sum of rectangles and triangles. Rectangle: base × height. Triangle: ½ × base × height. Trapezoid: ½ × (top + bottom) × height. You can compute displacement exactly from piecewise-linear v–t graphs using just this algebra — no calculus required.`,
      },
      {
        type: 'insight',
        title: 'Two ways to read a v-t graph',
        body: `**Slope** of v–t → acceleration (how fast velocity is changing, in m/s²). **Area** under v–t → displacement (how far the object moved, in m). These are opposite operations: slope is differentiation, area is integration. The v–t graph is where the entire story of kinematics lives.`,
      },
      {
        type: 'insight',
        title: 'Calculus connection: area → integral',
        body: `The area under a v–t curve is a definite integral: $\\Delta x = \\int v(t)\\,dt$. When velocity is not constant, you cannot compute this area exactly with simple geometry. Riemann sums formalize this: divide time into tiny intervals, approximate velocity as constant on each, sum the rectangles, take the limit. The Fundamental Theorem of Calculus guarantees that anti-differentiation gives the exact area — so $\\int v\\,dt = x(t) + C$.`,
      },
      {
        type: 'warning',
        title: 'Displacement ≠ distance',
        body: `If an object goes forward 20 m then backward 8 m, displacement = +12 m but distance = 28 m. On a v–t graph: positive area (v > 0) adds to displacement; negative area (v < 0) subtracts. To find total distance, take the absolute value of each signed area and sum them. This distinction matters in "how far did the object travel" vs "where did it end up" problems.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-trapezoid' },
        title: 'Area under constant-acceleration v–t is a trapezoid',
        caption: `When v changes linearly (constant a), displacement = ½(v₀+v)t — the trapezoid area. Still algebra. This is SUVAT equation 2.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'xt-vt-graphs' },
        title: 'Signed area gives displacement',
        caption: `Area above the time-axis (v > 0) is positive displacement. Area below (v < 0) is negative displacement. Net displacement = signed total area. Distance traveled = unsigned total area.`,
      },
    ],
  },

  math: {
    prose: [
      `For a piecewise-linear v–t graph, compute displacement as a sum of triangle and rectangle areas. Each segment is a trapezoid (or special case: rectangle if velocity is constant, triangle if it starts or ends at zero). Sum the signed areas, taking areas above the time-axis as positive and areas below as negative.`,
      `For constant acceleration, $v(t) = v_0 + at$ is a straight line on the v–t graph. The area under this line over $[0, t]$ is the area of a trapezoid: $\\Delta x = \\frac{1}{2}(v_0 + v)t$. This is one of the SUVAT equations derived purely geometrically. Substituting $v = v_0 + at$ gives $\\Delta x = v_0 t + \\frac{1}{2}at^2$ — the same quadratic formula.`,
      `For non-constant acceleration, you must integrate: $\\Delta x = \\int v(t)\\,dt$. Position is the antiderivative of velocity; acceleration is the derivative of velocity. These three quantities are linked by differentiation and integration in an unbroken chain: $a \\xrightarrow{\\int} v \\xrightarrow{\\int} x$.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Displacement from velocity',
        body: `\\Delta x = \\int_{t_1}^{t_2} v(t)\\,dt`,
      },
      {
        type: 'definition',
        title: 'Acceleration from velocity',
        body: `a(t) = \\frac{dv}{dt}`,
      },
      {
        type: 'definition',
        title: 'SUVAT from area (constant a)',
        body: `\\Delta x = \\frac{1}{2}(v_0 + v)\\,t = v_0 t + \\frac{1}{2}at^2`,
      },
      {
        type: 'procedure',
        title: 'Algebra-only area method (piecewise-linear v–t)',
        body: `**Step 1:** Identify linear segments on the v–t graph.\n**Step 2:** For each segment, compute area = ½(v_start + v_end)(t_end − t_start).\n**Step 3:** Assign sign: + if above t-axis (forward motion), − if below (backward motion).\n**Step 4:** If the segment crosses v=0, split it at the crossing before summing.\n**Step 5:** Sum all signed areas → displacement. Sum absolute areas → distance.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-trapezoid' },
        title: 'From graph area to SUVAT equation',
        caption: `When acceleration is constant, the v–t graph is a straight line — the area is a trapezoid: Δx = ½(v₀+v)t. This is SUVAT equation 2, derived geometrically. Substituting v = v₀+at gives Δx = v₀t + ½at² (equation 3).`,
      },
    ],
  },

  rigor: {
    prose: [
      `The area-under-v-gives-$\\Delta x$ rule is a consequence of the Fundamental Theorem of Calculus (FTC). Define average velocity over $[t, t+\\Delta t]$ as $\\bar{v} = \\Delta x / \\Delta t$. Since $v = dx/dt$, position is an antiderivative of velocity: $x(t) = \\int v(t)\\,dt + C$. By the FTC: $\\int_{t_1}^{t_2} v(t)\\,dt = x(t_2) - x(t_1) = \\Delta x$. So area under v–t equals displacement not as a trick or approximation — it is an exact theorem for any integrable $v(t)$.`,

      `The FTC result $\\Delta x = \\int v\\,dt$ holds for any integrable velocity function, regardless of functional form: constant, linear, quadratic, sinusoidal, measured from sensors. The only requirement is integrability (v(t) must not blow up). Applying the same logic one level up: $\\Delta v = \\int a\\,dt$ — area under the a–t graph gives the change in velocity. The entire kinematic chain $a \\xrightarrow{\\int} v \\xrightarrow{\\int} x$ is a chain of FTC applications.`,

      `Riemann sums make the connection explicit. Divide $[t_1, t_2]$ into $n$ equal subintervals of width $\\Delta t = (t_2-t_1)/n$. On each subinterval $[t_k, t_k+\\Delta t]$, approximate velocity as constant at $v(t_k)$. Displacement on that piece $\\approx v(t_k)\\Delta t$ — a thin rectangle. Total displacement $\\approx \\sum_{k=0}^{n-1} v(t_k)\\Delta t$. As $n \\to \\infty$ ($\\Delta t \\to 0$), this Riemann sum converges to $\\int_{t_1}^{t_2} v(t)\\,dt = \\Delta x$. The signed rectangles below the axis contribute negative terms; their absolute values give distance.`,

      `In numerical computation, where $v(t)$ is known only at discrete time steps (from a sensor or simulation), the trapezoidal rule approximates $\\Delta x \\approx \\sum \\frac{1}{2}(v_k + v_{k+1})\\Delta t_k$ — error $O(\\Delta t^2)$. Simpson\'s rule achieves $O(\\Delta t^4)$ using parabolic interpolation. These numerical integration methods appear in calculus (chapter 4 of the calculus course) and are the foundation of the Euler and Runge-Kutta methods for solving differential equations computationally. Every physics simulation and GPS navigation system uses them.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Displacement as a definite integral (FTC)',
        body: `\\Delta x = x(t_2)-x(t_1) = \\int_{t_1}^{t_2} v(t)\\,dt`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'riemann-rect' },
        title: 'Riemann sums: thin rectangles converge to the integral',
        caption: `Each rectangle has height v(tₖ) and width Δt. Their total area approximates displacement. As Δt → 0, the Riemann sum converges to ∫v dt = Δx. Negative rectangles (v < 0) subtract from displacement.`,
      },
    ],
  },

  checkpoints: [
    {
      id: 'ch2-004-cp1',
      question: `A v-t graph shows a constant positive velocity of 8 m/s for 5 seconds. What is the displacement?`,
      answer: `Displacement = area = rectangle with height 8 and base 5: $\\Delta x = 8 \\times 5 = 40$ m. Positive because velocity is positive throughout.`,
    },
    {
      id: 'ch2-004-cp2',
      question: `A v-t graph has a negative slope from $t=0$ to $t=3$ s. What is the sign of acceleration during that interval?`,
      answer: `Negative. Slope of v-t = $\\Delta v / \\Delta t = a$. A negative slope means velocity is decreasing — negative acceleration. The object could still be moving forward (positive velocity) but slowing down.`,
    },
  ],

  examples: [
    {
      id: 'ch2-004-ex1',
      title: 'Triangular area — braking car',
      problem: `\\text{A car decelerates uniformly from }v = 20\\,\\text{m/s to }v = 0\\text{ over 4 seconds. Find displacement during braking.}`,
      steps: [
        { expression: `\\text{Shape: right triangle, base }= 4\\,\\text{s, height }= 20\\,\\text{m/s}`, annotation: `Velocity decreases linearly from 20 to 0 — straight line from (0, 20) to (4, 0) on v-t graph.` },
        { expression: `\\Delta x = \\tfrac{1}{2}(4)(20) = 40\\,\\text{m}`, annotation: `Triangle area = ½ × base × height. Positive because all area is above the time-axis (v > 0 throughout).` },
        { expression: `\\text{Check (SUVAT eq 2): }\\Delta x = \\tfrac{1}{2}(v_0+v)t = \\tfrac{1}{2}(20+0)(4) = 40\\,\\text{m}\\,\\checkmark`, annotation: `SUVAT equation 2 gives the same result — geometric area and algebraic formula agree.` },
      ],
      conclusion: `The car travels 40 m while braking. The triangle area is the displacement. The SUVAT cross-check confirms it.`,
    },
    {
      id: 'ch2-004-ex2',
      title: 'Displacement with direction reversal',
      problem: `\\text{v–t graph: }v = +6\\,\\text{m/s for 3 s (forward), then }v = -4\\,\\text{m/s for 2 s (backward). Find (a) net displacement, (b) total distance.}`,
      steps: [
        { expression: `\\text{Area}_1 = (+6)(3) = +18\\,\\text{m}`, annotation: `Forward phase: rectangle above the time-axis. Positive displacement.` },
        { expression: `\\text{Area}_2 = (-4)(2) = -8\\,\\text{m}`, annotation: `Backward phase: rectangle below the time-axis. Negative displacement.` },
        { expression: `\\Delta x = +18 + (-8) = +10\\,\\text{m}`, annotation: `Signed areas sum to net displacement. The object ends up 10 m ahead of where it started.` },
        { expression: `d = |{+18}| + |{-8}| = 26\\,\\text{m}`, annotation: `Unsigned areas sum to total distance traveled — always ≥ |Δx|.` },
      ],
      conclusion: `Net displacement = +10 m. Total distance = 26 m. They differ because the object reversed direction.`,
    },
    {
      id: 'ch2-004-ex3',
      title: 'Multi-segment motion with acceleration and reversal',
      problem: `\\text{v–t graph: }v = 12\\,\\text{m/s from }t=0\\text{ to }t=3\\,\\text{s, then decreases linearly to }v=-4\\,\\text{m/s at }t=7\\,\\text{s. Find (a) time when }v=0,\\text{ (b) total displacement, (c) total distance.}`,
      steps: [
        { expression: `v(t) = 12 + \\frac{-4-12}{7-3}(t-3) = 12 - 4(t-3)\\text{ for }t\\in[3,7]`, annotation: `Linear interpolation for the decreasing phase.` },
        { expression: `v = 0:\\quad 12 - 4(t-3) = 0\\implies t = 6\\,\\text{s}`, annotation: `(a) Object reverses direction at $t = 6$ s.` },
        { expression: `A_1 = 12\\times3 = +36\\,\\text{m};\\quad A_2 = \\tfrac{1}{2}(3)(12) = +18\\,\\text{m};\\quad A_3 = \\tfrac{1}{2}(1)(-4) = -2\\,\\text{m}`, annotation: `(b) Three segments: rectangle (0–3), triangle forward (3–6), triangle backward (6–7). Signs follow v.` },
        { expression: `\\Delta x = 36 + 18 + (-2) = +52\\,\\text{m}`, annotation: `Signed sum = net displacement.` },
        { expression: `d = 36 + 18 + 2 = 56\\,\\text{m}`, annotation: `(c) Unsigned sum = total distance. Slightly more than displacement.` },
      ],
      conclusion: `$v = 0$ at $t = 6$ s; $\\Delta x = 52$ m; total distance = 56 m. The small backward segment (2 m) makes distance slightly exceed displacement.`,
    },
  ],

  challenges: [
    {
      id: 'ch2-004-ch1',
      difficulty: 'medium',
      problem: `\\text{If } v\\text{ is positive but decreasing, what is the sign of }a\\text{? Is the object speeding up or slowing down?}`,
      hint: `Look at the slope of the v-t graph.`,
      walkthrough: [
        { expression: `a = \\frac{\\Delta v}{\\Delta t} = \\text{slope of v–t}`, annotation: `Acceleration is the slope of the v-t graph.` },
        { expression: `v > 0\\text{ and decreasing} \\implies \\text{slope} < 0 \\implies a < 0`, annotation: `Velocity is positive (moving forward) but the slope is negative (decreasing). So $a < 0$.` },
        { expression: `\\text{Speed} = |v|\\text{ is decreasing since }v\\text{ is decreasing toward zero}`, annotation: `Object is slowing down: moving forward but with velocity and acceleration in opposite directions.` },
      ],
      answer: `$a < 0$ (negative). The object moves forward but decelerates — velocity and acceleration have opposite signs, so speed decreases.`,
    },
    {
      id: 'ch2-004-ch2',
      difficulty: 'hard',
      problem: `\\text{A v–t graph shows a quarter-circle of radius 10: }v(t) = \\sqrt{100 - t^2}\\text{ for }t\\in[0, 10].\\text{ Find the exact displacement.}`,
      hint: `The area under this curve is the area of a quarter-disk of radius 10 — use geometry, not the integral formula.`,
      walkthrough: [
        { expression: `\\Delta x = \\int_0^{10} \\sqrt{100 - t^2}\\,dt`, annotation: `Displacement = area under the quarter-circle curve.` },
        { expression: `\\text{Area of quarter-circle with radius }r = 10: \\quad \\tfrac{1}{4}\\pi r^2 = \\tfrac{1}{4}\\pi(100) = 25\\pi`, annotation: `Recognize the geometric shape. The curve $v = \\sqrt{100-t^2}$ traces the first quadrant of a circle of radius 10.` },
        { expression: `\\Delta x = 25\\pi \\approx 78.5\\,\\text{m}`, annotation: `Exact answer uses $\\pi$. Numerical approximation ≈ 78.5 m.` },
      ],
      answer: `$\\Delta x = 25\\pi \\approx 78.5$ m. Geometric shortcut: area of quarter-disk with radius 10. This avoids the need for trigonometric substitution.`,
    },
    {
      id: 'ch2-004-ch3',
      difficulty: 'medium',
      problem: `\\text{A v–t graph shows: }v = 0\\text{ from }t=0\\text{ to }1,\\text{ then increases linearly to }v=12\\text{ m/s at }t=4,\\text{ then constant }v=12\\text{ m/s to }t=7.\\text{ Find: (a) acceleration in each phase, (b) total displacement.}`,
      hint: `Phase 1: stopped. Phase 2: slope = Δv/Δt. Phase 3: flat v-t → a = 0.`,
      walkthrough: [
        { expression: `a_1 = 0\\,\\text{m/s}^2,\\quad v=0\\text{ the whole time}`, annotation: `Phase 1 (0–1 s): flat line at v = 0 → no acceleration and no displacement.` },
        { expression: `a_2 = \\frac{12-0}{4-1} = 4\\,\\text{m/s}^2`, annotation: `Phase 2 (1–4 s): slope of v-t = Δv/Δt = 12/3 = 4 m/s².` },
        { expression: `a_3 = 0\\,\\text{m/s}^2`, annotation: `Phase 3 (4–7 s): flat line at v = 12 m/s → zero acceleration.` },
        { expression: `A_1 = 0;\\quad A_2 = \\tfrac{1}{2}(3)(12) = 18\\,\\text{m};\\quad A_3 = 12\\times3 = 36\\,\\text{m}`, annotation: `Areas: phase 1 = zero; phase 2 = triangle (½ × base × height); phase 3 = rectangle.` },
        { expression: `\\Delta x = 0 + 18 + 36 = 54\\,\\text{m}`, annotation: `Total displacement = sum of all areas (all positive, no reversal).` },
      ],
      answer: `$a_1=0$, $a_2=4$ m/s², $a_3=0$; total displacement = 54 m.`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Braking car: triangular area = displacement',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Braking: linear velocity from 20 m/s → 0 over 4 s
t = np.linspace(0, 4, 100)
v = 20 - 5*t    # v(t) = 20 - 5t: equation 1 with v0=20, a=-5

# np.trapz computes the trapezoidal-rule approximation to ∫v dt
# For a linear v(t), the trapezoid rule is EXACT
displacement = np.trapz(v, t)

# Expected: triangle area = ½ × base × height = ½ × 4 × 20
expected = 0.5 * 4 * 20
print(f"np.trapz result  : {displacement:.4f} m")
print(f"Triangle formula : {expected} m")
print(f"Difference       : {abs(displacement - expected):.6f} m (≈ 0 for linear v)")

fig, ax = plt.subplots(figsize=(7, 4))
ax.fill_between(t, v, alpha=0.3, color='blue', label=f'Area = {displacement:.1f} m (displacement)')
ax.plot(t, v, 'b-', linewidth=2)
ax.axhline(0, color='k', linewidth=0.8)
ax.set(xlabel='Time (s)', ylabel='Velocity (m/s)',
       title='v–t graph: braking car (triangle area)')
ax.legend(); ax.grid(True, alpha=0.4)
plt.tight_layout()
plt.savefig('vt_braking.png', dpi=100, bbox_inches='tight')
plt.show()`,
          prose: [
            `\`v = 20 - 5*t\` is equation 1 ($v = v_0 + at = 20 + (-5)t$). On the v-t graph, this is a straight line — the area below it is a right triangle with base 4 s and height 20 m/s.`,
            `\`np.trapz(v, t)\` implements the trapezoidal rule: $\\sum \\frac{1}{2}(v_k+v_{k+1})\\Delta t_k$. For a *linear* v(t), this gives the exact area — no approximation error. For curved v(t), the error scales as $O(\\Delta t^2)$.`,
            `The shaded region between the v(t) curve and the time-axis is the displacement — this is what "area under v-t = displacement" looks like visually. The area is 40 m, matching both the triangle formula and the SUVAT prediction ($\\Delta x = \\frac{1}{2}(v_0+v)t = \\frac{1}{2}(20)(4) = 40$ m).`,
          ],
        },
        {
          cellTitle: 'Direction reversal: displacement ≠ distance',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Phase 1: v = +6 m/s for 3 s, Phase 2: v = -4 m/s for 2 s
t = np.array([0, 3, 5])
v = np.array([6, 6, -4])   # piecewise constant

# Compute signed area (displacement) and unsigned area (distance)
def compute_disp_and_dist(t, v):
    dt = np.diff(t)
    # Trapezoidal rule for each segment
    seg_areas = 0.5 * (v[:-1] + v[1:]) * dt
    displacement = seg_areas.sum()
    distance = np.abs(seg_areas).sum()
    return displacement, distance, seg_areas

disp, dist, seg = compute_disp_and_dist(t, v)
print(f"Segment 1 area  : {seg[0]:+.1f} m")
print(f"Segment 2 area  : {seg[1]:+.1f} m")
print(f"Net displacement: {disp:.1f} m")
print(f"Total distance  : {dist:.1f} m")

# Plot
fig, ax = plt.subplots(figsize=(7, 4))
t_fine = np.array([0, 3, 3, 5])
v_fine = np.array([6, 6, -4, -4])
ax.fill_between(t_fine, v_fine, where=(v_fine >= 0), alpha=0.3, color='green',
                label='positive area (forward)')
ax.fill_between(t_fine, v_fine, where=(v_fine < 0), alpha=0.3, color='red',
                label='negative area (backward)')
ax.plot(t_fine, v_fine, 'k-', linewidth=2)
ax.axhline(0, color='k', linewidth=0.8)
ax.set(xlabel='Time (s)', ylabel='Velocity (m/s)',
       title='v–t: direction reversal — displacement vs distance')
ax.legend(); ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('vt_reversal.png', dpi=100, bbox_inches='tight')
plt.show()`,
          prose: [
            `\`seg_areas = 0.5*(v[:-1]+v[1:])*dt\` computes the signed area of each trapezoidal segment. For the constant-velocity phases here, this simplifies to $v \\times \\Delta t$ for each rectangle.`,
            `\`displacement = seg_areas.sum()\` adds the signed areas: $+18 + (-8) = +10$ m. The negative area in phase 2 cancels part of the forward progress. \`distance = np.abs(seg_areas).sum()\` adds the unsigned areas: $18 + 8 = 26$ m.`,
            `The green region (above axis) adds to displacement; the red region (below axis) subtracts. The gap between displacement (10 m) and distance (26 m) is entirely due to the reversal — the backward motion "undoes" 8 m of the forward progress.`,
          ],
        },
        {
          cellTitle: 'Acceleration from v-t slope and total displacement',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Piecewise linear v–t data
t_data = np.array([0, 2, 5, 8, 10])
v_data = np.array([0, 8, 8, 2, 0])   # m/s

# Acceleration = slope of each segment = Δv/Δt
a_avg = np.diff(v_data) / np.diff(t_data)
t_mid = (t_data[:-1] + t_data[1:]) / 2

print("Segment midpoint (s) | Acceleration (m/s²) | Meaning")
descriptions = ['speeding up', 'constant v', 'decelerating', 'decelerating']
for tm, a, d in zip(t_mid, a_avg, descriptions):
    print(f"    {tm:.1f}              |     {a:5.2f}            | {d}")

# Displacement = total signed area
dx_total = np.trapz(v_data, t_data)
print(f"\nTotal displacement: {dx_total:.1f} m")

# Plot both x-t (reconstructed) and v-t
from scipy.integrate import cumulative_trapezoid
x_reconstructed = cumulative_trapezoid(v_data, t_data, initial=0)

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 6), sharex=True)
ax1.fill_between(t_data, v_data, alpha=0.2, color='blue')
ax1.plot(t_data, v_data, 'b-o', linewidth=2)
ax1.set(ylabel='Velocity (m/s)', title='v–t graph')
ax1.grid(True, alpha=0.4)
ax2.plot(t_data, x_reconstructed, 'g-o', linewidth=2)
ax2.set(ylabel='Position (m)', xlabel='Time (s)', title='x–t graph (integrated from v–t)')
ax2.grid(True, alpha=0.4)
plt.tight_layout()
plt.savefig('vt_xt_linked.png', dpi=100, bbox_inches='tight')
plt.show()`,
          prose: [
            `\`np.diff(v_data) / np.diff(t_data)\` computes acceleration as $\\Delta v / \\Delta t$ for each segment — this is the slope of the v-t graph, the same formula as for velocity from x-t, applied one level up in the kinematic chain.`,
            `\`cumulative_trapezoid(v_data, t_data, initial=0)\` integrates velocity step-by-step to reconstruct position. This is the integration direction of the kinematic chain: $a \\to v \\to x$. The resulting x-t graph (bottom) is derived entirely from the v-t graph (top) — no position data needed.`,
            `This "integration from velocity" is how inertial navigation systems (INS) work: they measure acceleration with accelerometers, integrate once to get velocity, integrate again to get position. The cumulative trapezoid operation here is the discrete version of $x(t) = \\int v(t)\\,dt$.`,
          ],
        },
        {
          cellTitle: 'Challenge — displacement and distance with multiple reversals',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np
import matplotlib.pyplot as plt

t_c = np.array([0, 1, 2, 3, 4, 5, 6, 7])
v_c = np.array([4, 6, 3, -2, -5, -3, 1, 4])

# TODO:
# 1. Compute total displacement using np.trapz(v_c, t_c)
# 2. Compute total distance: find where v changes sign, sum |areas| of each piece
#    (Hint: np.sign(v_c) changes at sign reversals; split there)
# 3. Plot the v–t graph with positive areas shaded green and negative areas shaded red
# 4. Print both displacement and distance`,
          prose: [
            `\`np.trapz(v_c, t_c)\` gives the signed area directly — this is displacement. For distance, you need to sum the absolute area of each piece between sign changes.`,
            `To find sign-change indices: \`sign_changes = np.where(np.diff(np.sign(v_c)))[0]\`. This gives the indices where the sign of v flips. Between each pair of consecutive sign changes, compute the trapezoidal area and take its absolute value.`,
            `The expected displacement is approximately 8–9 m (the object moves forward overall). The distance will be larger because the object reverses around $t=3$ s and again around $t=6$ s. The colored area plot shows both contributions clearly.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Braking car: triangle area = displacement',
          type: 'code',
          language: 'matlab',
          code: `% Braking: v(t) = 20 - 5t over [0, 4 s]
t = linspace(0, 4, 100);
v = 20 - 5*t;

% trapz computes the trapezoidal rule approximation to ∫v dt
% For linear v(t) this is exact
displacement = trapz(t, v);
expected = 0.5 * 4 * 20;

fprintf('trapz result     : %.4f m\\n', displacement)
fprintf('Triangle formula : %.1f m\\n', expected)
fprintf('Difference       : %.6f m (exact for linear v)\\n', abs(displacement-expected))

% Plot
figure; hold on
fill([t, fliplr(t)], [v, zeros(1,100)], 'b', 'FaceAlpha', 0.3, ...
     'EdgeColor', 'none', 'DisplayName', sprintf('Area = %.1f m', displacement))
plot(t, v, 'b-', 'LineWidth', 2)
yline(0, 'k')
xlabel('Time (s)'); ylabel('Velocity (m/s)')
title('v–t graph: braking car')
legend('show'); grid on`,
          prose: [
            `\`trapz(t, v)\` uses MATLAB\'s built-in trapezoidal rule: $\\sum \\frac{1}{2}(v_k+v_{k+1})(t_{k+1}-t_k)$. Note: MATLAB\'s \`trapz\` takes \`(x, y)\` in that order — the independent variable first.`,
            `The \`fill\` command shades the area between the velocity curve and the zero line. \`[t, fliplr(t)]\` and \`[v, zeros(1,100)]\` trace the boundary of the filled region (forward along v, then back along zero).`,
            `For a linear v(t), the trapezoid rule is exact because each sub-interval is itself trapezoidal. The displacement (40 m) equals the SUVAT result $\\frac{1}{2}(v_0+v)t = \\frac{1}{2}(20+0)(4) = 40$ m.`,
          ],
        },
        {
          cellTitle: 'Direction reversal: displacement vs distance',
          type: 'code',
          language: 'matlab',
          code: `% Phase 1: v = +6 m/s for 3 s; Phase 2: v = -4 m/s for 2 s
t = [0, 3, 5];
v = [6, 6, -4];   % velocity at each time point

dt = diff(t);
% Signed area (displacement) for each segment
seg_areas = 0.5 * (v(1:end-1) + v(2:end)) .* dt;
displacement = sum(seg_areas);
distance     = sum(abs(seg_areas));

fprintf('Segment 1 area  : %+.1f m\\n', seg_areas(1))
fprintf('Segment 2 area  : %+.1f m\\n', seg_areas(2))
fprintf('Net displacement: %.1f m\\n', displacement)
fprintf('Total distance  : %.1f m\\n', distance)

% Plot with colored fill
t_fine = [0, 3, 3, 5];
v_fine = [6, 6, -4, -4];

figure; hold on
fill([t_fine(1:2), fliplr(t_fine(1:2))], [v_fine(1:2), 0, 0], ...
    'g', 'FaceAlpha', 0.3, 'EdgeColor', 'none')
fill([t_fine(3:4), fliplr(t_fine(3:4))], [v_fine(3:4), 0, 0], ...
    'r', 'FaceAlpha', 0.3, 'EdgeColor', 'none')
plot(t_fine, v_fine, 'k-', 'LineWidth', 2)
yline(0, 'k')
xlabel('Time (s)'); ylabel('Velocity (m/s)')
title('v–t graph: direction reversal')
legend('forward +18 m', 'backward -8 m'); grid on`,
          prose: [
            `\`seg_areas = 0.5*(v(1:end-1)+v(2:end)).*dt\` computes the signed trapezoidal area for each segment — the same formula as in Python but using MATLAB\'s indexing. Here each "segment" is constant velocity, so it simplifies to $v \\cdot \\Delta t$.`,
            `\`sum(abs(seg_areas))\` takes the absolute value of each segment area before summing — this counts every metre traveled regardless of direction, giving total distance. \`sum(seg_areas)\` keeps the signs, giving displacement.`,
            `The green fill shows the forward phase (+18 m); the red fill shows the backward phase (−8 m). The net displacement is the green area minus the red area = 10 m. The total distance is green plus red = 26 m.`,
          ],
        },
        {
          cellTitle: 'Acceleration from v-t slope',
          type: 'code',
          language: 'matlab',
          code: `t_data = [0, 2, 5, 8, 10];
v_data = [0, 8, 8, 2, 0];

% Acceleration = Δv/Δt for each segment (slope of v-t)
a_avg = diff(v_data) ./ diff(t_data);
t_mid = (t_data(1:end-1) + t_data(2:end)) / 2;

fprintf('Segment midpoint | Acceleration (m/s^2)\\n')
for i = 1:length(a_avg)
    fprintf('    %.1f           |     %5.2f\\n', t_mid(i), a_avg(i))
end

% Total displacement
dx_total = trapz(t_data, v_data);
fprintf('\\nTotal displacement: %.1f m\\n', dx_total)

% Reconstruct x(t) from v(t) by cumulative integration
x_reconstructed = cumtrapz(t_data, v_data);

% Plot both panels
figure
subplot(2,1,1)
fill([t_data, fliplr(t_data)], [v_data, zeros(1,5)], ...
    'b', 'FaceAlpha', 0.2, 'EdgeColor', 'none')
hold on
plot(t_data, v_data, 'b-o', 'LineWidth', 2)
ylabel('Velocity (m/s)'); title('v–t graph'); grid on

subplot(2,1,2)
plot(t_data, x_reconstructed, 'g-o', 'LineWidth', 2)
ylabel('Position (m)'); xlabel('Time (s)')
title('x–t graph (integrated from v–t)'); grid on`,
          prose: [
            `\`diff(v_data)./diff(t_data)\` computes acceleration as $\\Delta v/\\Delta t$ — the v-t slope for each segment. Positive = speeding up, negative = decelerating, zero = constant velocity.`,
            `\`cumtrapz(t_data, v_data)\` is MATLAB\'s cumulative trapezoidal integration — it builds up the displacement step-by-step, giving the x(t) curve. This is integration in the kinematic chain: $v \\to x$.`,
            `The two panels together show the derivative relationship: the slope of the x-t curve (bottom) at any instant equals the height of the v-t curve (top) at that instant. Where the v-t graph is flat at 8 m/s, the x-t graph is a straight line with slope 8.`,
          ],
        },
        {
          cellTitle: 'Challenge — displacement and distance with reversals',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `t_c = [0, 1, 2, 3, 4, 5, 6, 7];
v_c = [4, 6, 3, -2, -5, -3, 1, 4];

% TODO:
% 1. Compute total displacement using trapz(t_c, v_c)
% 2. Compute total distance: find sign changes, sum |areas| of each piece
%    (Hint: use sign(v_c) and find indices where it changes)
% 3. Plot v–t with positive sections shaded green, negative red
% 4. Print both displacement and distance`,
          prose: [
            `\`trapz(t_c, v_c)\` gives the signed total area — displacement. For distance, find the sign-change indices first: \`idx = find(diff(sign(v_c)) ~= 0)\`. These are the indices where velocity crosses zero.`,
            `Between consecutive sign-change indices, each piece of the v-t graph has a consistent sign. Compute \`trapz\` for each piece separately and sum the absolute values. This is the mathematical definition of $\\int |v|\\,dt$.`,
            `There are two sign changes in this dataset (near $t=3$ and $t=6$). The displacement should be positive (the object ends ahead of where it started); the distance should be larger than the displacement magnitude.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch2-004-q1',
      type: 'choice',
      question: `What does the area under a v–t graph represent?`,
      options: [`Acceleration`, `Displacement`, `Speed`, `Average velocity`],
      answer: `Displacement`,
      hints: [
        `$\\Delta x = \\int v\\,dt$. The right side is a definite integral — what is the geometric meaning of a definite integral?`,
        `Think: if $v = \\text{const}$, then $\\Delta x = v \\cdot \\Delta t$ = a rectangle. Area = displacement in that case.`,
      ],
      reviewSection: 'intuition',
      explanation: `Area under the v–t curve = $\\int v\\,dt = \\Delta x$ — the displacement. This follows from the FTC since position is the antiderivative of velocity.`,
    },
    {
      id: 'p1-ch2-004-q2',
      type: 'choice',
      question: `A car decelerates uniformly from 20 m/s to 0 in 4 s. What is the displacement?`,
      options: [`40 m`, `80 m`, `20 m`, `10 m`],
      answer: `40 m`,
      hints: [
        `The v-t graph is a right triangle. What is the area formula for a triangle?`,
        `Area = ½ × base × height = ½ × 4 s × 20 m/s.`,
      ],
      reviewSection: 'examples',
      explanation: `The v–t graph is a right triangle: area = ½ × base × height = ½ × 4 × 20 = 40 m.`,
    },
    {
      id: 'p1-ch2-004-q3',
      type: 'choice',
      question: `What does the slope of a v–t graph represent?`,
      options: [`Displacement`, `Position`, `Speed`, `Acceleration`],
      answer: `Acceleration`,
      hints: [
        `Slope = Δy/Δx on any graph. On a v-t graph, Δy is the change in velocity and Δx is the change in time.`,
        `$\\Delta v / \\Delta t$ is the definition of which kinematic quantity?`,
      ],
      reviewSection: 'math',
      explanation: `Slope of v–t = $\\Delta v / \\Delta t = a$. This is the same secant/tangent logic applied to the (v, t) pair instead of (x, t).`,
    },
    {
      id: 'p1-ch2-004-q4',
      type: 'choice',
      question: `An object moves at $v = +6$ m/s for 3 s, then $v = -4$ m/s for 2 s. What is the net displacement?`,
      options: [`26 m`, `18 m`, `10 m`, `2 m`],
      answer: `10 m`,
      hints: [
        `Compute the signed area for each phase separately, then sum.`,
        `Phase 1: $+6 \\times 3 = +18$ m. Phase 2: $-4 \\times 2 = -8$ m.`,
      ],
      reviewSection: 'examples',
      explanation: `Signed areas: $+6 \\times 3 = +18$ m, $-4 \\times 2 = -8$ m. Net displacement = $18 + (-8) = 10$ m.`,
    },
    {
      id: 'p1-ch2-004-q5',
      type: 'choice',
      question: `In the same problem above, what is the total distance traveled?`,
      options: [`10 m`, `18 m`, `26 m`, `14 m`],
      answer: `26 m`,
      hints: [
        `Distance = sum of unsigned areas. Take the absolute value of each area before summing.`,
        `$|{+18}| + |{-8}| = ?$`,
      ],
      reviewSection: 'examples',
      explanation: `Total distance = sum of absolute areas = $|{+18}| + |{-8}| = 26$ m. Distance is always $\\geq$ |displacement|.`,
    },
    {
      id: 'p1-ch2-004-q6',
      type: 'choice',
      question: `A flat horizontal line on a v–t graph (constant velocity) means:`,
      options: [
        `The object is stopped`,
        `Acceleration is zero and velocity is constant`,
        `The object is at constant position`,
        `Displacement is zero`,
      ],
      answer: `Acceleration is zero and velocity is constant`,
      hints: [
        `Flat v-t → zero slope. What is the slope of the v-t graph?`,
        `The line could be at any height — including v = 5 m/s. That does NOT mean the object is stopped.`,
      ],
      reviewSection: 'intuition',
      explanation: `Flat v–t → zero slope → zero acceleration. The object moves at constant velocity. Displacement is still accumulating (area is growing as long as $v \\neq 0$).`,
    },
    {
      id: 'p1-ch2-004-q7',
      type: 'choice',
      question: `For constant acceleration, the area under the v–t graph is a trapezoid. The formula for this area is:`,
      options: [
        `$v_0 \\cdot t$`,
        `$\\frac{1}{2}(v_0 + v)t$`,
        `$(v - v_0)t$`,
        `$\\frac{1}{2}(v - v_0)t$`,
      ],
      answer: `$\\frac{1}{2}(v_0 + v)t$`,
      hints: [
        `Trapezoid area = ½ × (sum of parallel sides) × height. On a v-t graph, what are the parallel sides and what is the height?`,
        `The two parallel sides are $v_0$ and $v$; the height is $t$.`,
      ],
      reviewSection: 'math',
      explanation: `Trapezoid area = ½ × (top + bottom) × height = ½(v₀ + v)t. This is SUVAT equation 2, derived purely from the geometry of a linear v–t graph.`,
    },
    {
      id: 'p1-ch2-004-q8',
      type: 'choice',
      question: `Why does the area-under-v-t rule hold for any $v(t)$, not just constant acceleration?`,
      options: [
        `Because velocity is always constant`,
        `Because of the FTC: since $v = dx/dt$, its antiderivative is $x$, so $\\int v\\,dt = \\Delta x$`,
        `Because speed equals distance divided by time`,
        `Only for linear v–t graphs`,
      ],
      answer: `Because of the FTC: since $v = dx/dt$, its antiderivative is $x$, so $\\int v\\,dt = \\Delta x$`,
      hints: [
        `What is the relationship between $v(t)$ and $x(t)$? ($v = dx/dt$ means what about $x$ and $v$?)`,
        `If $v = dx/dt$, then $x$ is the antiderivative of $v$. What does the FTC say about $\\int v\\,dt$?`,
      ],
      reviewSection: 'rigor',
      explanation: `By the FTC: if $v = dx/dt$, then $x$ is an antiderivative of $v$, so $\\int_{t_1}^{t_2} v\\,dt = x(t_2) - x(t_1) = \\Delta x$. This holds for any velocity function, not just constant acceleration.`,
    },
    {
      id: 'p1-ch2-004-q9',
      type: 'choice',
      question: `A v–t graph is a straight line with a negative slope. What can you say about the acceleration?`,
      options: [
        `Acceleration is zero`,
        `Acceleration is positive`,
        `Acceleration is negative`,
        `Acceleration cannot be determined from slope`,
      ],
      answer: `Acceleration is negative`,
      hints: [
        `Slope of v-t = Δv/Δt = acceleration.`,
        `Negative slope → velocity is decreasing → acceleration is negative.`,
      ],
      reviewSection: 'math',
      explanation: `Slope of v–t = $\\Delta v / \\Delta t = a$. A negative slope means velocity is decreasing, which means acceleration is negative. The object could still be moving forward (if v > 0) but slowing down.`,
    },
    {
      id: 'p1-ch2-004-q10',
      type: 'choice',
      question: `An object moves forward at 8 m/s for 3 s, then backward at 5 m/s for 2 s. What is the total distance traveled?`,
      options: [`14 m`, `24 m`, `34 m`, `10 m`],
      answer: `34 m`,
      hints: [
        `Distance = sum of unsigned areas. Add up the magnitudes of each phase, ignoring sign.`,
        `Forward: $8 \\times 3 = 24$ m. Backward: $5 \\times 2 = 10$ m.`,
      ],
      reviewSection: 'intuition',
      explanation: `Distance = $|8 \\times 3| + |5 \\times 2| = 24 + 10 = 34$ m. Net displacement = $+24 - 10 = +14$ m. Distance (34) > |displacement| (14) because the object reversed direction.`,
    },
  ],

  misconceptions: [
    {
      id: 'ch2-004-m1',
      myth: `A flat horizontal line on a v-t graph means the object is stopped.`,
      reality: `A flat (horizontal) v-t line means velocity is **constant** — not zero. If the line is at $v = 8$ m/s, the object is moving at 8 m/s with zero acceleration. The object is stopped only if the horizontal line is specifically at $v = 0$.`,
      correctionExample: `A car on a highway at 30 m/s with cruise control engaged: flat v-t line at height 30 m/s. Acceleration = 0 (slope is zero). Displacement is growing at 30 m/s (area is growing). The car is definitely not stopped.`,
    },
    {
      id: 'ch2-004-m2',
      myth: `The area under the v-t graph gives total distance, not displacement.`,
      reality: `The signed area gives displacement ($\\Delta x$, which can be negative). For total distance, you need the unsigned area (absolute values). They agree only when the object never reverses direction. Whenever velocity crosses zero, the two diverge.`,
      correctionExample: `Object moves at $+5$ m/s for 4 s, then $-5$ m/s for 4 s. Signed area = $+20 + (-20) = 0$ m (displacement = 0, returned to start). Unsigned area = $20 + 20 = 40$ m (distance = 40 m). The graph has equal area above and below the axis — displacement is zero but distance is 40 m.`,
    },
  ],

  transferPrompts: [
    `A fitness tracker records your speed (not velocity) every second. Explain why you cannot directly compute your displacement from speed data alone — what extra information would you need? What can you compute from speed data?`,
    `The area under a v-t graph gives $\\Delta x = \\int v\\,dt$. What does the area under an acceleration-time (a-t) graph give? Write the analogous formula and explain what it represents physically.`,
  ],

  debugging: [
    {
      id: 'ch2-004-d1',
      buggyWork: `A student computes the displacement from a v-t graph where v goes from +10 m/s at t=0 to −6 m/s at t=5 s (linearly). They write: "Area = ½ × 5 × 10 + ½ × 5 × 6 = 25 + 15 = 40 m."`,
      question: `Identify the error. What is the correct net displacement?`,
      answer: `The student added the two triangle areas without accounting for signs. The v-t curve crosses zero somewhere between t=0 and t=5. Forward area (positive) and backward area (negative) partially cancel. Step 1: find when v=0: $v(t) = 10 - (16/5)t = 0 \\implies t = 50/16 = 3.125$ s. Step 2: forward triangle (0 to 3.125 s): $\\frac{1}{2}(3.125)(10) = 15.625$ m. Step 3: backward triangle (3.125 to 5 s): $\\frac{1}{2}(1.875)(6) = 5.625$ m. Net displacement = $+15.625 - 5.625 = +10$ m. Alternatively use the trapezoid formula: $\\Delta x = \\frac{1}{2}(10 + (-6))(5) = \\frac{1}{2}(4)(5) = 10$ m.`,
    },
    {
      id: 'ch2-004-d2',
      buggyWork: `A student says: "The v-t graph shows positive velocity throughout, so displacement equals distance."`,
      question: `Is this correct? Under what condition is it true?`,
      answer: `This is correct for the given condition (v > 0 throughout). When velocity never changes sign, displacement = distance because the object never moves backward. The signed area and unsigned area are equal when all area is on the same side of the time-axis. The statement would be wrong if the graph ever crossed v = 0 to negative values.`,
    },
  ],

  mastery: {
    targetLevel: `You can look at any v-t graph and immediately compute displacement (signed area), distance (unsigned area), and acceleration (slope), and explain the Fundamental Theorem connection between area-under-v-t and displacement.`,
    coreSkill: `Computing signed areas (rectangles, triangles, trapezoids) from piecewise-linear v-t graphs, with correct signs — and distinguishing net displacement from total distance when velocity reverses sign.`,
    commonSticking: `Treating area as always positive (forgetting about signed area), or confusing the area (displacement) with the slope (acceleration).`,
    connections: [
      `Lesson 3 (x-t graphs): slope of x-t = velocity; this lesson: slope of v-t = acceleration. The derivative chain runs x → v → a.`,
      `Lesson 9 (displacement from velocity area): builds directly on this lesson with more examples.`,
      `Calculus 1 (integration): $\\Delta x = \\int v\\,dt$ is the first kinematic application of the Fundamental Theorem of Calculus.`,
    ],
  },

  semantics: {
    core: [
      { symbol: `\\Delta x = \\int v\\,dt`, meaning: `Displacement = signed area under the v-t graph (FTC)` },
      { symbol: `a = dv/dt`, meaning: `Acceleration = slope of the v-t graph` },
      { symbol: `\\text{signed area}`, meaning: `Sum of areas with sign: positive above axis, negative below axis` },
      { symbol: `\\text{unsigned area}`, meaning: `Sum of absolute areas — gives total distance traveled` },
    ],
    rulesOfThumb: [
      `Slope of v-t = acceleration. Area under v-t = displacement. These are different readings from the same graph.`,
      `Flat v-t line = constant velocity = zero acceleration. NOT stopped (unless the flat line is at v=0).`,
      `When v changes sign, displacement and distance diverge. Always split the area at sign crossings when computing distance.`,
      `Signed area is displacement ($\\Delta x$ can be negative). Unsigned area is distance (always positive).`,
      `The area rule holds for any v(t) — not just constant acceleration — because of the FTC: $v = dx/dt$ implies $x$ is the antiderivative of $v$.`,
    ],
  },
}

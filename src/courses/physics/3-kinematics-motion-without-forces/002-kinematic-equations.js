export default {
  id: 'p1-ch2-002',
  slug: 'kinematic-equations',
  chapter: 'p2',
  order: 2,
  title: 'Kinematic Equations',
  subtitle: 'The five equations that solve every constant-acceleration problem.',
  tags: ['kinematic equations','SUVAT','constant acceleration','equations of motion'],
  aliases: 'suvat equations of motion big five kinematics',

  hook: {
    question: `A car accelerates from rest at 3 m/s² for 5 s. How far does it travel? You need the kinematic equations.`,
    realWorldContext: `These five equations are the engine of classical mechanics. Every projectile, every braking distance, every rocket launch uses them.`,
    previewVisualizationId: 'SVGDiagram',
  },

  videos: [{
    title: `Physics 2 – Motion in One Dimension (2 of 22) Equations in Kinematics`,
    embedCode: `<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>`,
    placement: 'intuition',
  }],

  intuition: {
    prose: [
      `Before reading on, predict: a car starts from rest and accelerates at $3\\,\\text{m/s}^2$. Without any equations, estimate how far it travels in $5\\,\\text{s}$ — is it closer to 20 m, 40 m, or 80 m? Think about the average velocity during the trip ($v$ goes from 0 to 15 m/s, so the average is roughly 7.5 m/s over 5 s — about 37 m). The equations will confirm this.`,

      `When acceleration is **constant**, five quantities are related: displacement $\\Delta x$, initial velocity $v_0$, final velocity $v$, acceleration $a$, and time $t$. Any three known quantities determine the other two — that is the power of constant acceleration.`,

      `There are five equations, each leaving out one of the five variables. The strategy for every constant-acceleration problem is the same: identify which variable is missing, then pick the equation that doesn't contain it. There is always exactly one equation that avoids the variable you don't have.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Five steps to any constant-acceleration problem',
        body: `**Step 1 — List variables:** Write the five SUVAT letters (s = Δx, u = v₀, v, a, t) with blanks.\n**Step 2 — Fill knowns:** Enter the three given values including signs.\n**Step 3 — Identify missing variable:** Which letter is neither given nor asked for? That is your "missing variable."\n**Step 4 — Pick equation:** Choose the one equation that does NOT contain the missing variable.\n**Step 5 — Solve and check:** Substitute, solve algebraically, then verify units and that the sign makes physical sense.`,
      },
      {
        type: 'definition',
        title: 'The five kinematic equations',
        body: `v = v_0 + at \\quad (1)\\\\\\Delta x = \\tfrac{1}{2}(v_0+v)t \\quad (2)\\\\\\Delta x = v_0t + \\tfrac{1}{2}at^2 \\quad (3)\\\\\\Delta x = vt - \\tfrac{1}{2}at^2 \\quad (4)\\\\v^2 = v_0^2 + 2a\\Delta x \\quad (5)`,
      },
      {
        type: 'mnemonic',
        title: 'SUVAT — which equation to pick',
        body: `s = displacement (Δx), u = initial velocity (v₀), v = final velocity, a = acceleration, t = time. Missing v? → use equation 3 (no v). Missing t? → use equation 5 (no t). Missing a? → use equation 2 (no a). Missing Δx? → use equation 1 (no Δx). Missing v₀? → use equation 4 (no v₀).`,
      },
      {
        type: 'warning',
        title: 'Only valid for constant acceleration',
        body: `These equations break down the moment acceleration changes. For variable acceleration, use calculus (integration). Every time you apply SUVAT, ask yourself: is $a$ truly constant in this problem?`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'suvat-map' },
        title: 'SUVAT relationship map',
        caption: `Each equation connects 4 of the 5 quantities — it omits the one you don't know or don't need.`,
      },
    ],
  },

  math: {
    prose: [
      `The equations are derived from the two fundamental definitions: velocity as the rate of change of position, and acceleration as the rate of change of velocity — with the single constraint that $a$ is constant. Integrating $a = \\text{const}$ once gives $v = v_0 + at$; integrating again gives $\\Delta x = v_0 t + \\frac{1}{2}at^2$. The other three equations are algebraic eliminations of one variable at a time.`,
      `Every time you use SUVAT, you are implicitly solving a pair of simultaneous equations. The five-equation system has exactly two degrees of freedom (any two give you the rest). Memorizing all five is a convenience, not a necessity — equations 1 and 3 are the only two you strictly need.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Derivation of equation 3',
        body: `\\Delta x = \\int_0^t v\\,dt = \\int_0^t (v_0+at)\\,dt = v_0t + \\tfrac{1}{2}at^2`,
      },
      {
        type: 'insight',
        title: 'Derivation of equation 5',
        body: `Combine equations 1 and 3 to eliminate $t$. Square equation 1: $v^2 = (v_0+at)^2 = v_0^2 + 2av_0 t + a^2 t^2 = v_0^2 + 2a(v_0 t + \\frac{1}{2}at^2)$. Recognizing the bracket as $\\Delta x$ gives $v^2 = v_0^2 + 2a\\Delta x$. Time disappears.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-trapezoid' },
        title: 'Where Δx = ½(v₀+v)t comes from',
        caption: `For constant acceleration, v(t) is a straight line. The displacement is the area of the trapezoid under it — ½ × (top + bottom) × height. That\'s algebra, not calculus.`,
      },
    ],
  },

  rigor: {
    prose: [
      `The kinematic equations are the closed-form solution of the initial-value problem $\\ddot{x} = a = \\text{const}$, $x(0) = x_0$, $\\dot{x}(0) = v_0$. Integrating once: $v(t) = v_0 + at$. Integrating again: $x(t) = x_0 + v_0 t + \\frac{1}{2}at^2$. The displacement $\\Delta x = x(t) - x_0 = v_0 t + \\frac{1}{2}at^2$ (equation 3). Equation 5 follows by substituting $t = (v-v_0)/a$ from equation 1 into equation 3 and simplifying. Equations 2 and 4 are the same substitution from different starting points. The entire five-equation system contains exactly two independent equations.`,

      `Only equations 1 and 3 are independent — all others are algebraic identities derivable from them. Equation 2 ($\\Delta x = \\frac{1}{2}(v_0+v)t$) arises by expressing $v = v_0 + at$, substituting into equation 3, and factoring. Equation 5 eliminates $t$. Equation 4 eliminates $v_0$. The five-equation set is therefore a complete, redundant basis for the 2D solution space of the constant-acceleration ODE. Knowing which two are primary means you could, in principle, rederive any SUVAT equation on the spot if you forgot it.`,

      `Geometrically, $v(t) = v_0 + at$ is a straight line on the v-t graph. The displacement $\\Delta x$ is the area under this line over $[0, t]$ — the area of a trapezoid with parallel sides $v_0$ and $v$ and height $t$: $\\Delta x = \\frac{1}{2}(v_0 + v)t$. This is equation 2 without any calculus — pure plane geometry. Equation 3 is the same area split into a rectangle ($v_0 t$) and a triangle ($\\frac{1}{2}at^2$). Constant acceleration means the x-t graph is a parabola (second-degree polynomial in $t$), and the v-t graph is a straight line. These two shapes are the visual fingerprint of constant acceleration.`,

      `When acceleration is not constant, the SUVAT equations do not apply. The correct approach is $\\Delta x = \\int_0^t v(t')\\,dt'$ and $v(t) = v_0 + \\int_0^t a(t')\\,dt'$. SUVAT is the special case that arises when $a(t) = \\text{const}$, which makes these integrals trivial. The next step beyond constant acceleration — non-constant $a(t)$ — appears in the non-constant acceleration lesson (lesson 22 of this chapter) and requires numerical integration or analytic integration depending on the form of $a(t)$.`,
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Only two are independent',
        body: `Equations 1 ($v = v_0 + at$) and 3 ($\\Delta x = v_0 t + \\frac{1}{2}at^2$) are the two primary equations. Equations 2, 4, and 5 are derived by algebraically combining them to eliminate one variable at a time. You only ever need to memorise two — the rest follow from algebra.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'suvat-map' },
        title: 'Deriving all five from two',
        caption: `Start from a = const → v(t) = v₀ + at (integrate once) → Δx = v₀t + ½at² (integrate again). Square equation 1 and substitute equation 3 to eliminate t → v² = v₀² + 2aΔx. Average the two velocities × time → Δx = ½(v₀+v)t. All five flow from two integrations.`,
      },
    ],
  },

  checkpoints: [
    {
      id: 'ch2-002-cp1',
      question: `A car starts from rest with $a = 5$ m/s². Which SUVAT equation gives $\\Delta x$ after $t = 4$ s without needing to find $v$ first?`,
      answer: `Equation 3: $\\Delta x = v_0 t + \\frac{1}{2}at^2 = 0 + \\frac{1}{2}(5)(16) = 40$ m. Equation 3 does not contain $v$, so $v$ is the "missing variable" and this equation applies directly.`,
    },
    {
      id: 'ch2-002-cp2',
      question: `Why doesn't equation 5 ($v^2 = v_0^2 + 2a\\Delta x$) contain $t$?`,
      answer: `It was derived by combining equations 1 and 3 specifically to eliminate $t$. It is algebraically equivalent to the other equations — it just trades $t$ for $\\Delta x$. Useful whenever time is unknown and not needed.`,
    },
  ],

  examples: [
    {
      id: 'ch2-002-ex1',
      title: 'Car accelerates from rest',
      problem: `v_0=0,\\;a=3\\,\\text{m/s}^2,\\;t=5\\,\\text{s}\\text{. Find }\\Delta x\\text{ and }v.`,
      steps: [
        { expression: `\\text{Missing variable: }\\Delta x\\text{ (eq 3) and }v\\text{ (eq 1)}`, annotation: `List all 5 SUVAT: s=?, u=0, v=?, a=3, t=5. Two unknowns — use one equation for each.` },
        { expression: `v = v_0 + at = 0 + 3(5) = 15\\,\\text{m/s}`, annotation: `Equation 1 (missing Δx). Substitute v₀=0, a=3, t=5.` },
        { expression: `\\Delta x = v_0 t + \\tfrac{1}{2}at^2 = 0 + \\tfrac{1}{2}(3)(25) = 37.5\\,\\text{m}`, annotation: `Equation 3 (missing v). The parabolic term ½at² dominates when v₀=0.` },
        { expression: `\\text{Check: } v^2 = 0 + 2(3)(37.5) = 225 = 15^2\\,\\checkmark`, annotation: `Equation 5 cross-check: both methods agree.` },
      ],
      conclusion: `$v = 15$ m/s, $\\Delta x = 37.5$ m. The check via equation 5 confirms consistency — this is a good habit for any SUVAT problem.`,
    },
    {
      id: 'ch2-002-ex2',
      title: 'Braking distance — equation 5',
      problem: `v_0=30\\,\\text{m/s},\\;v=0,\\;a=-6\\,\\text{m/s}^2\\text{. Find }\\Delta x.`,
      steps: [
        { expression: `\\text{Missing variable: }t\\text{ — use equation 5 (no }t\\text{)}`, annotation: `Time is neither given nor asked for. Equation 5 is the right tool.` },
        { expression: `0 = 30^2 + 2(-6)\\Delta x = 900 - 12\\Delta x`, annotation: `Substitute into $v^2 = v_0^2 + 2a\\Delta x$. At full stop, $v = 0$.` },
        { expression: `\\Delta x = \\frac{900}{12} = 75\\,\\text{m}`, annotation: `Positive: the car moved in the positive direction while stopping. Makes sense.` },
      ],
      conclusion: `Braking distance = 75 m. Note: this doubles if $v_0$ doubles (quadratic dependence on $v_0$) — that is why highway speed limits matter so much for safety.`,
    },
    {
      id: 'ch2-002-ex3',
      title: 'Finding time from two velocities and displacement',
      problem: `\\text{A runner accelerates from }v_0=5\\,\\text{m/s to }v=11\\,\\text{m/s}\\text{ over }\\Delta x=24\\,\\text{m. Find the time taken.}`,
      steps: [
        { expression: `\\text{Missing variable: }a\\text{ — use equation 2 (no }a\\text{)}`, annotation: `Acceleration is neither given nor asked for. Equation 2 avoids $a$ entirely.` },
        { expression: `\\Delta x = \\tfrac{1}{2}(v_0+v)t \\implies 24 = \\tfrac{1}{2}(5+11)t = 8t`, annotation: `Substitute: average of the two velocities times time = displacement.` },
        { expression: `t = \\frac{24}{8} = 3\\,\\text{s}`, annotation: `Solve for $t$.` },
        { expression: `\\text{Check: }a = (v-v_0)/t = (11-5)/3 = 2\\,\\text{m/s}^2`, annotation: `Equation 1 gives the acceleration we never needed — but we can verify it is constant.` },
      ],
      conclusion: `$t = 3$ s. Equation 2 is underused — it is the cleanest equation whenever both velocities and either time or displacement are known.`,
    },
  ],

  challenges: [
    {
      id: 'ch2-002-ch1',
      difficulty: 'easy',
      problem: `v_0=10\\,\\text{m/s},\\;a=2\\,\\text{m/s}^2,\\;t=3\\,\\text{s.}\\text{ Find }v\\text{ and }\\Delta x.`,
      hint: `Use equation 1 for $v$, then equation 3 for $\\Delta x$.`,
      walkthrough: [
        { expression: `v = 10 + 2(3) = 16\\,\\text{m/s}`, annotation: `Equation 1: missing Δx.` },
        { expression: `\\Delta x = 10(3) + \\tfrac{1}{2}(2)(9) = 30+9 = 39\\,\\text{m}`, annotation: `Equation 3: missing v.` },
      ],
      answer: `v=16\\,\\text{m/s},\\;\\Delta x=39\\,\\text{m}`,
    },
    {
      id: 'ch2-002-ch2',
      difficulty: 'medium',
      problem: `\\text{A stone is thrown upward at }v_0=20\\,\\text{m/s}.\\text{ Find max height and total air time. Use }a=-9.8\\,\\text{m/s}^2.`,
      hint: `At maximum height, $v = 0$. Use equation 5 for height (no $t$), then equation 1 for time up, then double.`,
      walkthrough: [
        { expression: `v^2 = v_0^2 + 2a\\Delta x \\implies 0 = 400 + 2(-9.8)\\Delta x`, annotation: `At peak: $v = 0$. Equation 5 (no $t$).` },
        { expression: `\\Delta x = \\frac{400}{19.6} \\approx 20.4\\,\\text{m}`, annotation: `Maximum height above the launch point.` },
        { expression: `t_{up} = \\frac{0-20}{-9.8} \\approx 2.04\\,\\text{s}`, annotation: `Equation 1: time to reach peak.` },
        { expression: `t_{total} = 2 \\times 2.04 \\approx 4.08\\,\\text{s}`, annotation: `By symmetry (same launch and landing height), flight down = flight up.` },
      ],
      answer: `h \\approx 20.4\\,\\text{m},\\;t_{total}\\approx 4.08\\,\\text{s}`,
    },
    {
      id: 'ch2-002-ch3',
      difficulty: 'hard',
      problem: `\\text{A train decelerates uniformly from }v_0=40\\,\\text{m/s to rest with }a=-2\\,\\text{m/s}^2.\\text{ Find: (a) stopping distance, (b) time to stop, (c) displacement in the first 5 s.}`,
      hint: `For (a): equation 5 (no $t$). For (b): equation 1 (no $\\Delta x$). For (c): equation 3 with $t=5$.`,
      walkthrough: [
        { expression: `(a)\\;0 = 1600 + 2(-2)\\Delta x \\implies \\Delta x = 400\\,\\text{m}`, annotation: `Equation 5 — time not needed for stopping distance.` },
        { expression: `(b)\\;0 = 40 + (-2)t \\implies t = 20\\,\\text{s}`, annotation: `Equation 1 — full stop after 20 s.` },
        { expression: `(c)\\;\\Delta x_5 = 40(5) + \\tfrac{1}{2}(-2)(25) = 200-25 = 175\\,\\text{m}`, annotation: `Equation 3 with $t=5$ s. The train covers 175 of its 400 m stopping distance in the first quarter of the stopping time.` },
      ],
      answer: `\\Delta x_{stop}=400\\,\\text{m},\\;t_{stop}=20\\,\\text{s},\\;\\Delta x_5=175\\,\\text{m}`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'The five SUVAT equations as functions',
          type: 'code',
          language: 'python',
          code: `import numpy as np

# Each function implements one SUVAT equation.
# The function name indicates which variable is ABSENT.
def eq1_no_dx(v0, a, t):    return v0 + a*t              # v = v0 + at
def eq2_no_a( v0, v, t):    return 0.5*(v0 + v)*t        # Δx = ½(v0+v)t
def eq3_no_v( v0, a, t):    return v0*t + 0.5*a*t**2     # Δx = v0t + ½at²
def eq4_no_v0(v, a, t):     return v*t - 0.5*a*t**2      # Δx = vt - ½at²
def eq5_no_t( v0, a, dx):   return np.sqrt(v0**2 + 2*a*dx)  # v² = v0² + 2aΔx

# Car from rest: a = 3 m/s², t = 5 s
v0, a, t = 0.0, 3.0, 5.0
v  = eq1_no_dx(v0, a, t)
dx = eq3_no_v( v0, a, t)

print(f"Final velocity : {v} m/s")
print(f"Displacement  : {dx} m")
print(f"Cross-check (eq5): v = {eq5_no_t(v0, a, dx):.4f} m/s  (should be {v})")`,
          prose: [
            `Each function is named for the variable it **omits** — \`eq3_no_v\` implements $\\Delta x = v_0 t + \\frac{1}{2}at^2$, which does not contain $v$. When you identify the "missing variable" in a problem, you call the function that doesn't need it.`,
            `\`eq5_no_t\` requires a square root because $v^2 = v_0^2 + 2a\\Delta x$ gives $v^2$ — you must take the positive root for an object moving in the +x direction. The sign is important: if the object reversed direction, you'd need the negative root.`,
            `The cross-check line verifies that all five equations agree: starting with $v_0=0$, $a=3$, $t=5$, both the direct calculation and the equation-5 route give the same final velocity. If they don't match, there's an algebra error.`,
          ],
        },
        {
          cellTitle: 'Visualizing x-t and v-t graphs for constant acceleration',
          type: 'code',
          language: 'python',
          code: `import matplotlib.pyplot as plt
import numpy as np

v0, a = 0.0, 3.0
t_arr = np.linspace(0, 5, 200)

# Equation 3 gives x(t); equation 1 gives v(t)
x_arr = v0*t_arr + 0.5*a*t_arr**2   # parabola — constant acceleration signature
v_arr = v0 + a*t_arr                 # straight line — constant acceleration signature

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))

ax1.plot(t_arr, x_arr, 'b-', linewidth=2)
ax1.set(xlabel='Time (s)', ylabel='Position (m)', title='x–t graph (parabola)')
ax1.grid(True, alpha=0.4)

ax2.plot(t_arr, v_arr, 'r-', linewidth=2)
ax2.fill_between(t_arr, 0, v_arr, alpha=0.15, color='red',
                 label=f'area = Δx = {0.5*(v0+v_arr[-1])*t_arr[-1]:.1f} m')
ax2.set(xlabel='Time (s)', ylabel='Velocity (m/s)', title='v–t graph (straight line)')
ax2.legend(); ax2.grid(True, alpha=0.4)

plt.tight_layout()
plt.savefig('suvat_curves.png', dpi=100, bbox_inches='tight')
plt.show()`,
          prose: [
            `\`x_arr = v0*t_arr + 0.5*a*t_arr**2\` is equation 3 evaluated at every time point — it produces a **parabola** (quadratic in $t$). A parabola on the x-t graph is the visual signature of constant acceleration.`,
            `\`v_arr = v0 + a*t_arr\` is equation 1 evaluated at every time point — it produces a **straight line** on the v-t graph. The slope of that line is $a$. A straight v-t line is the other visual signature of constant acceleration.`,
            `The shaded area under the v-t graph equals displacement: $\\Delta x = \\frac{1}{2}(v_0+v)t$ — this is equation 2. The area displayed on the plot should match the value from equation 3. Running this confirms the geometric interpretation: area under v-t = displacement.`,
          ],
        },
        {
          cellTitle: 'Braking distance — equation 5 in action',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Braking problem: v0 = 30 m/s, v = 0, a = -6 m/s²
v0, v_f, a = 30.0, 0.0, -6.0

# Equation 5: v² = v0² + 2aΔx  →  Δx = (v² - v0²) / (2a)
dx_brake = (v_f**2 - v0**2) / (2 * a)
print(f"Braking distance : {dx_brake:.1f} m")

# Verify time using equation 1
t_brake = (v_f - v0) / a
print(f"Time to stop     : {t_brake:.2f} s")
dx_check = v0*t_brake + 0.5*a*t_brake**2
print(f"Cross-check eq3  : {dx_check:.1f} m  (should match)")
print()

# Show how braking distance scales with v0 (QUADRATIC — critical safety insight)
v0_range = np.linspace(0, 40, 200)
dx_range = (0 - v0_range**2) / (2 * a)   # equation 5, v_f = 0

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(v0_range, dx_range, 'r-', linewidth=2.5)
ax.axvline(30, color='gray', linestyle='--', alpha=0.7, label='our example: 30 m/s')
ax.set(xlabel='Initial speed (m/s)', ylabel='Braking distance (m)',
       title='Braking distance vs initial speed (a = −6 m/s²)')
ax.legend(); ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('braking_distance.png', dpi=100, bbox_inches='tight')
plt.show()`,
          prose: [
            `Equation 5 rearranges to $\\Delta x = (v_f^2 - v_0^2)/(2a)$. Since $v_f = 0$, this simplifies to $\\Delta x = -v_0^2/(2a)$. The denominator is $2 \\times (-6) = -12$, so the result is positive (motion was in the +x direction while braking).`,
            `The cross-check using equation 3 confirms both routes agree: if you find $t$ first (equation 1: $t = (0-30)/(-6) = 5$ s), then substitute into equation 3, you get the same 75 m. This redundancy is a powerful error-detection tool.`,
            `The plot shows that braking distance scales **quadratically** with initial speed — doubling from 20 m/s to 40 m/s quadruples the braking distance. This is why highway speed limits have such a large effect on crash severity.`,
          ],
        },
        {
          cellTitle: 'Challenge — general SUVAT solver',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

def suvat_solve(**known):
    """
    Pass any three of: dx, v0, v, a, t (as keyword arguments).
    Returns a dict with all five SUVAT values.

    Examples:
      suvat_solve(v0=0, a=3, t=5)   → {dx: 37.5, v: 15, ...}
      suvat_solve(v0=30, v=0, a=-6) → {dx: 75, t: 5, ...}
    """
    # TODO: Implement using if/elif blocks, one for each 3-known combination.
    # There are C(5,3) = 10 possible combinations, but many are simple.
    # At minimum, handle these four common cases:
    #   known: v0, a, t  →  find v (eq1), dx (eq3)
    #   known: v0, v, t  →  find dx (eq2), a from eq1
    #   known: v0, v, a  →  find t (eq1), dx (eq5)
    #   known: v0, a, dx →  find v (eq5), t (eq1)
    pass

# Test cases — these should pass once your function is correct
r1 = suvat_solve(v0=0, a=3, t=5)
print(f"r1: {r1}")   # expect dx≈37.5, v≈15

r2 = suvat_solve(v0=30, v=0, a=-6)
print(f"r2: {r2}")   # expect dx≈75, t≈5`,
          prose: [
            `There are $\\binom{5}{3} = 10$ possible three-known combinations. Start with the most common four (listed in the docstring), then add others. For each case, solve for the two unknowns using the appropriate equations from the lesson.`,
            `Use Python\'s dictionary unpacking: \`known.get('v0', None)\` returns the value of \`v0\` if it was passed, or \`None\` if it wasn\'t. This lets you identify which three variables are given without hardcoding every combination.`,
            `The test cases mirror the examples from the lesson. Once your function passes those, try \`suvat_solve(v=0, a=-9.8, v0=15)\` to find the max height of a thrown ball — it should return $\\Delta x \\approx 11.5$ m.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'The five SUVAT equations as functions',
          type: 'code',
          language: 'matlab',
          code: `% Each function implements one SUVAT equation.
% Named by the absent variable.

eq1_no_dx = @(v0,a,t)   v0 + a.*t;
eq2_no_a  = @(v0,v,t)   0.5.*(v0+v).*t;
eq3_no_v  = @(v0,a,t)   v0.*t + 0.5.*a.*t.^2;
eq4_no_v0 = @(v,a,t)    v.*t - 0.5.*a.*t.^2;
eq5_no_t  = @(v0,a,dx)  sqrt(v0.^2 + 2.*a.*dx);

% Car from rest: a = 3 m/s², t = 5 s
v0 = 0; a = 3; t = 5;
v  = eq1_no_dx(v0, a, t);
dx = eq3_no_v( v0, a, t);

fprintf('Final velocity : %.1f m/s\\n', v)
fprintf('Displacement  : %.1f m\\n', dx)
fprintf('Cross-check (eq5): v = %.4f m/s (should be %.1f)\\n', ...
        eq5_no_t(v0, a, dx), v)`,
          prose: [
            `MATLAB anonymous functions (\`@(args) body\`) create reusable equation objects without a separate file. Each name encodes which SUVAT variable is absent — \`eq3_no_v\` is $\\Delta x = v_0 t + \\frac{1}{2}at^2$ (no $v$ term).`,
            `The \`.*\` and \`.^\` operators apply element-wise when the inputs are arrays — essential for plotting (cell 2). For scalar inputs they behave identically to \`*\` and \`^\`.`,
            `The cross-check confirms all five equations are consistent: starting from $(v_0=0, a=3, t=5)$, equations 1, 3, and 5 all agree on $v = 15$ m/s and $\\Delta x = 37.5$ m.`,
          ],
        },
        {
          cellTitle: 'x-t and v-t graphs for constant acceleration',
          type: 'code',
          language: 'matlab',
          code: `v0 = 0; a = 3;
t_arr = linspace(0, 5, 200);

x_arr = v0*t_arr + 0.5*a*t_arr.^2;   % parabola (eq 3)
v_arr = v0 + a*t_arr;                  % straight line (eq 1)

figure

subplot(1,2,1)
plot(t_arr, x_arr, 'b-', 'LineWidth', 2)
xlabel('Time (s)'); ylabel('Position (m)')
title('x–t graph (parabola)'); grid on

subplot(1,2,2)
plot(t_arr, v_arr, 'r-', 'LineWidth', 2); hold on
fill([t_arr, fliplr(t_arr)], [v_arr, zeros(1,200)], ...
    'r', 'FaceAlpha', 0.15, 'EdgeColor', 'none')
xlabel('Time (s)'); ylabel('Velocity (m/s)')
title('v–t graph (straight line)'); grid on
legend(sprintf('area = %.1f m', 0.5*(v0+v_arr(end))*t_arr(end)))

sgtitle('Constant acceleration: a = 3 m/s^2')`,
          prose: [
            `\`v0*t_arr + 0.5*a*t_arr.^2\` evaluates equation 3 at 200 time points simultaneously — MATLAB\'s vector operations eliminate the need for a loop. The result is a parabola (quadratic in $t$).`,
            `\`v0 + a*t_arr\` evaluates equation 1 at every time point. Constant acceleration produces a **straight line** on the v-t graph. The slope of that line is exactly $a = 3$ m/s².`,
            `The shaded region under the v-t line is the trapezoid whose area equals displacement (equation 2). The legend confirms the area matches the value from equation 3. This geometric connection between the two graphs is fundamental.`,
          ],
        },
        {
          cellTitle: 'Braking distance and the quadratic scaling law',
          type: 'code',
          language: 'matlab',
          code: `v0 = 30; v_f = 0; a = -6;

% Equation 5 rearranged for Δx
dx_brake = (v_f^2 - v0^2) / (2*a);
fprintf('Braking distance : %.1f m\\n', dx_brake)

% Verify time using equation 1
t_brake = (v_f - v0) / a;
fprintf('Time to stop     : %.2f s\\n', t_brake)
dx_check = v0*t_brake + 0.5*a*t_brake^2;
fprintf('Cross-check eq3  : %.1f m\\n', dx_check)

% Braking distance vs initial speed (quadratic scaling)
v0_range = linspace(0, 40, 200);
dx_range = (0 - v0_range.^2) ./ (2*a);

figure
plot(v0_range, dx_range, 'r-', 'LineWidth', 2.5); hold on
xline(30, '--', 'Color', [0.5 0.5 0.5])
xlabel('Initial speed (m/s)'); ylabel('Braking distance (m)')
title('Braking distance vs initial speed (a = -6 m/s^2)')
grid on`,
          prose: [
            `\`(v_f^2 - v0^2) / (2*a)\` is equation 5 rearranged: $\\Delta x = (v_f^2 - v_0^2)/(2a)$. Both numerator and denominator are negative here (since $v_f < v_0$ and $a < 0$), so the result is positive — consistent with forward motion while braking.`,
            `The cross-check uses equation 3 with the time from equation 1. Both give 75 m. When results match, you\'ve verified your equations are set up correctly — this is worth doing on any high-stakes calculation.`,
            `The parabolic shape of the braking-distance curve explains why doubling speed from 20 to 40 m/s increases braking distance fourfold ($75 \\to 300$ m for this deceleration). This quadratic scaling is why speed limits have such a large effect on crash severity.`,
          ],
        },
        {
          cellTitle: 'Challenge — general SUVAT solver',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `function result = suvat_solve(known_names, known_vals)
% Solves for the remaining SUVAT variables given 3 knowns.
% known_names: cell array of variable names, e.g. {'v0','a','t'}
% known_vals:  corresponding values,         e.g. [0, 3, 5]
%
% Returns a struct with fields: dx, v0, v, a, t
%
% TODO: Build a struct from known_names/known_vals, then add
%       if/elseif blocks for each 3-known combination.
%       Use the SUVAT equations to compute the two unknowns.

result = struct('dx', NaN, 'v0', NaN, 'v', NaN, 'a', NaN, 't', NaN);
end

% Test cases
r1 = suvat_solve({'v0','a','t'}, [0, 3, 5]);
fprintf('dx = %.1f m, v = %.1f m/s\\n', r1.dx, r1.v)   % expect 37.5, 15

r2 = suvat_solve({'v0','v','a'}, [30, 0, -6]);
fprintf('dx = %.1f m, t = %.2f s\\n', r2.dx, r2.t)     % expect 75, 5`,
          prose: [
            `Build the struct first by looping over \`known_names\` and assigning values: \`result.(known_names{i}) = known_vals(i);\`. Then check which fields are still \`NaN\` — those are the unknowns to solve for.`,
            `There are $\\binom{5}{3} = 10$ possible three-known combinations. Handle them with \`if/elseif\` blocks. Identify each case by testing which of the five fields are non-NaN: \`~isnan(result.v0)\`.`,
            `Test all four common cases: $(v_0, a, t)$, $(v_0, v, t)$, $(v_0, v, a)$, $(v_0, a, \\Delta x)$. Each maps to specific SUVAT equations from the lesson. The function is a useful tool for automating the "pick the right equation" step.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch2-002-q1',
      type: 'choice',
      question: `Which kinematic equation eliminates time $t$?`,
      options: [
        `$v = v_0 + at$`,
        `$\\Delta x = v_0 t + \\tfrac{1}{2}at^2$`,
        `$v^2 = v_0^2 + 2a\\Delta x$`,
        `$\\Delta x = \\tfrac{1}{2}(v_0+v)t$`,
      ],
      answer: `$v^2 = v_0^2 + 2a\\Delta x$`,
      hints: [
        `Which equation contains no $t$ on either side?`,
        `It is derived by combining equations 1 and 3 to algebraically eliminate $t$.`,
      ],
      reviewSection: 'intuition',
      explanation: `$v^2 = v_0^2 + 2a\\Delta x$ (equation 5) contains no $t$. It is derived by combining equations 1 and 3 to eliminate time.`,
    },
    {
      id: 'p1-ch2-002-q2',
      type: 'choice',
      question: `A car starts from rest ($v_0 = 0$) with acceleration $a = 4$ m/s². What is its velocity after $t = 3$ s?`,
      options: [
        `18 m/s`,
        `12 m/s`,
        `7 m/s`,
        `36 m/s`,
      ],
      answer: `12 m/s`,
      hints: [
        `Use equation 1: $v = v_0 + at$. What is $v_0$ here?`,
        `"Starts from rest" means $v_0 = 0$.`,
      ],
      reviewSection: 'examples',
      explanation: `$v = v_0 + at = 0 + 4(3) = 12$ m/s. Equation 1 (no $\\Delta x$).`,
    },
    {
      id: 'p1-ch2-002-q3',
      type: 'choice',
      question: `Under what condition are the five kinematic equations valid?`,
      options: [
        `Any type of motion`,
        `Only for objects at rest`,
        `Only for constant acceleration`,
        `Only in free fall`,
      ],
      answer: `Only for constant acceleration`,
      hints: [
        `The derivation assumed $a = \\text{const}$ throughout. What happens if $a$ changes?`,
        `For variable acceleration, you need integration: $v(t) = v_0 + \\int a(t)\\,dt$.`,
      ],
      reviewSection: 'intuition',
      explanation: `The SUVAT equations assume constant acceleration. If acceleration varies with time or position, you must use integration (calculus) instead.`,
    },
    {
      id: 'p1-ch2-002-q4',
      type: 'choice',
      question: `What is the displacement of a car that decelerates from $v_0 = 20$ m/s to $v = 0$ with $a = -4$ m/s²?`,
      options: [
        `100 m`,
        `50 m`,
        `25 m`,
        `80 m`,
      ],
      answer: `50 m`,
      hints: [
        `Time is not given and not needed — which equation avoids $t$?`,
        `Equation 5: $v^2 = v_0^2 + 2a\\Delta x$. Solve for $\\Delta x$.`,
      ],
      reviewSection: 'examples',
      explanation: `Using equation 5: $0 = 400 + 2(-4)\\Delta x \\Rightarrow \\Delta x = 400/8 = 50$ m. Time was not given and not needed.`,
    },
    {
      id: 'p1-ch2-002-q5',
      type: 'choice',
      question: `Equation 3 ($\\Delta x = v_0 t + \\tfrac{1}{2}at^2$) is derived by:`,
      options: [
        `Squaring equation 1`,
        `Integrating $v(t) = v_0 + at$ with respect to $t$`,
        `Differentiating the position function`,
        `Combining equations 4 and 5`,
      ],
      answer: `Integrating $v(t) = v_0 + at$ with respect to $t$`,
      hints: [
        `$\\Delta x = \\int v\\,dt$. What is $\\int (v_0 + at)\\,dt$?`,
        `Integrate term by term: $\\int v_0\\,dt = v_0 t$ and $\\int at\\,dt = \\frac{1}{2}at^2$.`,
      ],
      reviewSection: 'math',
      explanation: `$\\Delta x = \\int_0^t v\\,dt = \\int_0^t (v_0 + at)\\,dt = v_0 t + \\tfrac{1}{2}at^2$. This is a direct integration of the constant-acceleration velocity function.`,
    },
    {
      id: 'p1-ch2-002-q6',
      type: 'choice',
      question: `A ball is thrown upward at $v_0 = 15$ m/s ($a = -9.8$ m/s²). How high does it go?`,
      options: [
        `$\\approx 22.5$ m`,
        `$\\approx 11.5$ m`,
        `$\\approx 30.6$ m`,
        `$\\approx 7.5$ m`,
      ],
      answer: `$\\approx 11.5$ m`,
      hints: [
        `At maximum height, $v = 0$. This gives you three known quantities: $v_0$, $v$, and $a$.`,
        `Use equation 5: $v^2 = v_0^2 + 2a\\Delta x$. Solve for $\\Delta x$.`,
      ],
      reviewSection: 'challenges',
      explanation: `At max height $v = 0$. Equation 5: $0 = 15^2 + 2(-9.8)\\Delta x \\Rightarrow \\Delta x = 225/19.6 \\approx 11.5$ m.`,
    },
    {
      id: 'p1-ch2-002-q7',
      type: 'choice',
      question: `Which equation is useful when you know $v_0$, $v$, and $t$, but NOT $a$ or $\\Delta x$?`,
      options: [
        `$v = v_0 + at$`,
        `$\\Delta x = \\tfrac{1}{2}(v_0 + v)t$`,
        `$v^2 = v_0^2 + 2a\\Delta x$`,
        `$\\Delta x = v_0 t + \\tfrac{1}{2}at^2$`,
      ],
      answer: `$\\Delta x = \\tfrac{1}{2}(v_0 + v)t$`,
      hints: [
        `The "missing variable" is acceleration $a$ — which equation has no $a$?`,
        `Equation 2 uses only $v_0$, $v$, and $t$ — perfect for this situation.`,
      ],
      reviewSection: 'examples',
      explanation: `$\\Delta x = \\tfrac{1}{2}(v_0 + v)t$ (equation 2) uses only $v_0$, $v$, and $t$. It omits $a$ entirely — perfect when acceleration is unknown but the two velocities and time are given.`,
    },
    {
      id: 'p1-ch2-002-q8',
      type: 'choice',
      question: `How many of the five kinematic equations are truly independent (the rest are algebraic combinations)?`,
      options: [
        `Five`,
        `Four`,
        `Three`,
        `Two`,
      ],
      answer: `Two`,
      hints: [
        `Think about which equations were derived first from integrating $a = \\text{const}$, and which were obtained by algebraic manipulation of those.`,
        `Equations 2, 4, and 5 can all be obtained by combining equations 1 and 3.`,
      ],
      reviewSection: 'rigor',
      explanation: `Only two are independent: equation 1 ($v = v_0 + at$) and equation 3 ($\\Delta x = v_0 t + \\tfrac{1}{2}at^2$). Equations 2, 4, and 5 are derived by algebraically combining these two. You only need to memorise two.`,
    },
    {
      id: 'p1-ch2-002-q9',
      type: 'choice',
      question: `An object has $v_0 = 5$ m/s, $a = 2$ m/s², $t = 4$ s. Which equation gives $\\Delta x$ directly WITHOUT finding $v$ first?`,
      options: [
        `$v = v_0 + at$ (equation 1)`,
        `$\\Delta x = \\tfrac{1}{2}(v_0+v)t$ (equation 2)`,
        `$\\Delta x = v_0 t + \\tfrac{1}{2}at^2$ (equation 3)`,
        `$v^2 = v_0^2 + 2a\\Delta x$ (equation 5)`,
      ],
      answer: `$\\Delta x = v_0 t + \\tfrac{1}{2}at^2$ (equation 3)`,
      hints: [
        `The "missing variable" is $v$ — the question asks to avoid computing $v$.`,
        `Which equation does NOT contain $v$?`,
      ],
      reviewSection: 'intuition',
      explanation: `Equation 3 ($\\Delta x = v_0 t + \\tfrac{1}{2}at^2$) contains no $v$. Substituting directly: $\\Delta x = 5(4) + \\frac{1}{2}(2)(16) = 20 + 16 = 36$ m.`,
    },
    {
      id: 'p1-ch2-002-q10',
      type: 'choice',
      question: `What is the geometric interpretation of equation 2: $\\Delta x = \\tfrac{1}{2}(v_0+v)t$?`,
      options: [
        `Area of a triangle under the v-t graph`,
        `Area of a rectangle under the v-t graph`,
        `Area of a trapezoid under the v-t graph`,
        `Slope of the x-t graph`,
      ],
      answer: `Area of a trapezoid under the v-t graph`,
      hints: [
        `For constant acceleration, the v-t graph is a straight line from $v_0$ to $v$.`,
        `What shape does a straight-line v-t curve form with the time axis over the interval $[0, t]$?`,
      ],
      reviewSection: 'rigor',
      explanation: `For constant acceleration, $v(t)$ is a straight line from $v_0$ to $v$. The displacement is the area under this line — a trapezoid with parallel sides $v_0$ and $v$ and height $t$: area = $\\frac{1}{2}(v_0+v)t$. This is equation 2.`,
    },
  ],

  misconceptions: [
    {
      id: 'ch2-002-m1',
      myth: `You can apply SUVAT equations whenever objects are moving — even when acceleration is changing.`,
      reality: `SUVAT requires constant acceleration throughout the interval. A rocket burning fuel has increasing thrust (changing $a$); a car negotiating a turn has changing direction (changing $a$ vector). In both cases, SUVAT gives wrong answers. The correct approach is to integrate $a(t)$ to get $v(t)$, then integrate $v(t)$ to get $x(t)$.`,
      correctionExample: `A car accelerates from 0 to 20 m/s in 4 s, then brakes at −5 m/s² for 3 s. You cannot use a single SUVAT equation across both phases — the acceleration changed. Solve each phase separately: phase 1 gives $\\Delta x_1 = 40$ m; phase 2 gives $\\Delta x_2 = 20(3) + \\frac{1}{2}(-5)(9) = 37.5$ m. Total: 77.5 m.`,
    },
    {
      id: 'ch2-002-m2',
      myth: `Equation 2 ($\\Delta x = \\frac{1}{2}(v_0+v)t$) is the "average velocity" formula and works for any motion.`,
      reality: `$\\Delta x = \\frac{1}{2}(v_0+v)t$ is the area of a trapezoid — it is only valid when $v$ changes linearly with time (i.e., constant acceleration). For non-constant acceleration, $v(t)$ is not a straight line and the average of the two endpoints does not equal the true average velocity. The general formula is $\\Delta x = \\int v(t)\\,dt$.`,
      correctionExample: `A particle has $v(t) = t^2$ m/s (accelerating non-uniformly). From $t=0$ to $t=2$ s: true displacement = $\\int_0^2 t^2\\,dt = 8/3 \\approx 2.67$ m. The trapezoid formula gives $\\frac{1}{2}(0+4)(2) = 4$ m — 50% off because $v(t)$ is a parabola, not a straight line.`,
    },
  ],

  transferPrompts: [
    `SUVAT equation 5 shows that braking distance scales as $v_0^2$ — doubling speed quadruples stopping distance. A typical car has braking deceleration around 8 m/s². How much farther does a car traveling at 30 m/s (highway) take to stop compared to one at 15 m/s (city)? What does this imply for safety margins in traffic?`,
    `The five SUVAT equations were derived from the assumption $a = \\text{const}$. In a real sprint, a runner\'s acceleration is high at the start and decreases as they reach top speed. Sketch what the v-t graph looks like for a 100 m dash, and explain why you cannot use a single SUVAT equation for the whole race. What would you need to do instead?`,
  ],

  debugging: [
    {
      id: 'ch2-002-d1',
      buggyWork: `A student solves "braking distance for $v_0 = 20$ m/s, $a = -5$ m/s²" using equation 3: $\\Delta x = 20t + \\frac{1}{2}(-5)t^2$, and substitutes $t = 4$ s to get $\\Delta x = 80 - 40 = 40$ m.`,
      question: `Identify the error. What should the student have done?`,
      answer: `The student invented $t = 4$ s — it was not given and was not found first. The correct approach: use equation 5 (no $t$) with $v = 0$ (full stop): $0 = 400 + 2(-5)\\Delta x \\Rightarrow \\Delta x = 400/10 = 40$ m. Coincidentally the same number here, but that is accidental. For $v_0 = 30$ m/s: the wrong method gives $\\Delta x = 30(6) + \\frac{1}{2}(-5)(36) = 180-90 = 90$ m; equation 5 gives $\\Delta x = 900/10 = 90$ m — the same only because $t = 6$ s happens to be correct. The student did not check whether $t = 4$ s was the true stopping time.`,
    },
    {
      id: 'ch2-002-d2',
      buggyWork: `A student applies SUVAT to a problem where a rocket burns for 10 s at 5 m/s² acceleration, then coasts for 5 s at 0 acceleration. They use $v_0 = 0$, $a = 5$, $t = 15$ s and compute $\\Delta x = \\frac{1}{2}(5)(225) = 562.5$ m.`,
      question: `What is wrong and what is the correct answer?`,
      answer: `Acceleration is not constant over the full 15 s — it is 5 m/s² for the first 10 s, then 0 m/s² for the last 5 s. A single SUVAT equation cannot span both phases. Phase 1: $v = 0 + 5(10) = 50$ m/s; $\\Delta x_1 = \\frac{1}{2}(5)(100) = 250$ m. Phase 2: $a = 0$, so $v$ stays at 50 m/s; $\\Delta x_2 = 50(5) = 250$ m. Total: $\\Delta x = 500$ m — not 562.5 m.`,
    },
  ],

  mastery: {
    targetLevel: `You can identify the missing SUVAT variable in any problem, select the correct equation, substitute with correct signs, and verify using a second equation.`,
    coreSkill: `Selecting the right kinematic equation based on which variable is absent (not given and not needed) — and applying it with correct sign conventions.`,
    commonSticking: `Using the same equation for every problem instead of selecting based on the missing variable; applying SUVAT across phases with different accelerations.`,
    connections: [
      `Lesson 1 defined the quantities (Δx, v₀, v, a, t) that SUVAT connects.`,
      `Lessons 12–18 apply SUVAT to free fall (constant $a = -g$) — the most common use.`,
      `Lesson 22 (non-constant acceleration) shows what happens when $a$ is not constant: SUVAT fails and integration takes over.`,
    ],
  },

  semantics: {
    core: [
      { symbol: `\\Delta x`, meaning: `Displacement — change in position, final minus initial, signed (metres)` },
      { symbol: `v_0`, meaning: `Initial velocity — velocity at the start of the time interval (m/s)` },
      { symbol: `v`, meaning: `Final velocity — velocity at the end of the time interval (m/s)` },
      { symbol: `a`, meaning: `Acceleration — constant rate of change of velocity; must be constant for SUVAT (m/s²)` },
      { symbol: `t`, meaning: `Elapsed time — duration of the motion interval (seconds)` },
    ],
    rulesOfThumb: [
      `Always list all five SUVAT variables before picking an equation — it takes 10 seconds and prevents most errors.`,
      `The missing variable (the one not given and not needed) points directly to the equation that omits it.`,
      `Equations 1 and 3 are the two independent equations; the other three are their algebraic combinations. Memorize two, derive three.`,
      `SUVAT requires constant acceleration. Any problem with a phase change (braking, coasting, thrust change) must be split into separate constant-acceleration segments.`,
      `Always cross-check with a second equation. If the two routes agree, the algebra is correct.`,
    ],
  },
}

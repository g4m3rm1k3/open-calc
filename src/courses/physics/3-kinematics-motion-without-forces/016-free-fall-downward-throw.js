export default {
  id: 'p1-ch2-016',
  slug: 'free-fall-downward-throw',
  chapter: 'p2',
  order: 16,
  title: "Free Fall: Downward Throw",
  subtitle: "When initial velocity is downward, gravity compounds the speed increase from the very start.",
  tags: ["downward throw", "free fall", "kinematics"],
  aliases: "downward launch vertical throw initial downward speed",
  hook: {
    question: "How does an initial downward speed change the time and speed at impact?",
    realWorldContext:
      "Drop tests and impact estimation often include a nonzero initial downward speed — a crate pushed off a shelf, a stone thrown into a well. The physics is the same as free fall, but with a head start.",
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'free-fall-axes' },
  },
  intuition: {
    prose: [
      `Before reading on, predict: an object is dropped from rest from a 20-m building and hits the ground at some speed $v_1$. Now the same object is thrown downward at 5 m/s from the same height and hits at speed $v_2$. Is $v_2 = v_1 + 5$, or is $v_2 < v_1 + 5$, or is $v_2 > v_1 + 5$? Predict the relationship and reason about it before reading.`,
      `A downward throw is the simplest of the free-fall cases: $v_0 < 0$ (up-positive) or $v_0 > 0$ (down-positive), $a = \\pm g$, and the object never changes direction — it just accelerates toward the ground the entire time. There is no apex, no symmetry, and no phase boundary. It's one clean constant-acceleration interval.`,
      `Compared to dropping from rest, throwing downward does two things: it shortens the time to impact (the object already has downward speed at $t = 0$) and it increases the impact speed. These two effects are related: $v^2 = v_0^2 + 2gh$ shows that impact speed depends on both $v_0^2$ and $h$. The extra initial kinetic energy $\\tfrac{1}{2}mv_0^2$ adds to the gravitational potential energy $mgh$, so $v_{\\text{impact}} > \\sqrt{2gh}$ whenever $v_0 > 0$.`,
      `The prediction question above has a subtle answer: $v_2 < v_1 + 5$ m/s. Impact speed is not additive because of the square-root in $v = \\sqrt{v_0^2 + 2gh}$. For $v_1 = \\sqrt{2(9.8)(20)} \\approx 19.8$ m/s and $v_0 = 5$ m/s: $v_2 = \\sqrt{25 + 392} \\approx 20.4$ m/s. The increase is only 0.6 m/s — not 5 m/s. The square root compresses large initial speeds.`,
      `Choosing down-positive for downward-throw problems is often cleaner: $v_0 = +|v_0|$, $a = +g$, $\\Delta y = +h$. All numbers are positive, and you just use $v^2 = v_0^2 + 2gh$ and $h = v_0 t + \\tfrac{1}{2}gt^2$ without tracking minus signs.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Downward-throw problem setup',
        body: `1. Choose convention. Down-positive is often cleaner: $v_0 = +|v_0|$, $a = +g = +9.8$ m/s².\n2. For impact speed (no time needed): use $v^2 = v_0^2 + 2gh$, take positive root.\n3. For impact time: solve $h = v_0 t + \\tfrac{1}{2}gt^2$ as a quadratic; take the positive root.\n4. Cross-check: verify that $v_0 + g t_{\\text{impact}}$ equals the impact speed from step 2.`,
      },
      {
        type: 'insight',
        title: 'Impact speed is not additive in $v_0$',
        body: `$v_{\\text{impact}} = \\sqrt{v_0^2 + 2gh}$. Adding 5 m/s to $v_0$ does not add 5 m/s to $v_{\\text{impact}}$. For large $v_0$, extra initial speed adds very little to the impact speed because of the square root's diminishing returns.`,
      },
      {
        type: 'warning',
        title: 'No apex in a downward throw',
        body: `Unlike the upward-throw case, a downward throw has no apex, no $v = 0$ moment, and no symmetry shortcut. The object accelerates downward from start to finish. Do not use $t_{\\text{peak}} = v_0/g$ or any apex formula for downward throws.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-fall-axes' },
        title: 'Downward throw: v₀ < 0 (up-positive)',
        caption: 'When throwing downward with +y upward: v₀ is negative, a = −g is negative. Both v and a point the same direction from the start. No apex — the object accelerates continuously to the ground.',
      },
    ],
  },
  math: {
    prose: [
      `For a downward throw from height $h$ with initial downward speed $|v_0|$, using down-positive ($v_0 = +|v_0|$, $a = +g$, displacement to ground $= +h$):`,
      `Impact speed: $v_{\\text{impact}}^2 = v_0^2 + 2gh$, so $v_{\\text{impact}} = \\sqrt{v_0^2 + 2gh}$. This is the same no-time SUVAT equation with positive $a$ and positive $\\Delta y$.`,
      `Impact time: from $h = v_0 t + \\tfrac{1}{2}g t^2$, rearrange to $\\tfrac{1}{2}g t^2 + v_0 t - h = 0$. Apply the quadratic formula and take the positive root. The special case $v_0 = 0$ gives the familiar $t = \\sqrt{2h/g}$.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Downward-throw equations (down-positive)',
        body: `v_{\\text{impact}} = \\sqrt{v_0^2 + 2gh},\\qquad \\tfrac{1}{2}g t^2 + v_0 t - h = 0`,
      },
      {
        type: 'insight',
        title: 'Special case: $v_0 = 0$ recovers the drop-from-rest formulas',
        body: `Setting $v_0 = 0$: $v_{\\text{impact}} = \\sqrt{2gh}$ and the quadratic reduces to $t = \\sqrt{2h/g}$. The downward-throw formulas generalize the drop-from-rest case — they are the same equations with $v_0 \\neq 0$.`,
      },
    ],
  },
  rigor: {
    prose: [
      `A downward throw is the constant-acceleration model with the initial condition $v_0 < 0$ (up-positive) instead of $v_0 > 0$ (upward throw) or $v_0 = 0$ (drop from rest). The differential equation $\\ddot y = -g$ (up-positive) is unchanged; only the boundary condition at $t = 0$ differs. All SUVAT equations hold without modification.`,
      `The energy interpretation clarifies why impact speed is $\\sqrt{v_0^2 + 2gh}$: at launch, the kinetic energy is $\\tfrac{1}{2}mv_0^2$ and the potential energy (relative to the ground) is $mgh$. At impact, all energy converts to kinetic energy $\\tfrac{1}{2}mv_{\\text{impact}}^2$. Energy conservation gives $v_{\\text{impact}}^2 = v_0^2 + 2gh$ — identical to the SUVAT result, confirming that both approaches are equivalent for conservative forces.`,
      `The subadditive behavior $v_{\\text{impact}} < v_0 + \\sqrt{2gh}$ follows from the inequality $\\sqrt{a^2 + b^2} < a + b$ for $a, b > 0$. More precisely, $\\sqrt{v_0^2 + 2gh} = \\sqrt{(v_0 + \\sqrt{2gh})^2 - 2v_0\\sqrt{2gh}} < v_0 + \\sqrt{2gh}$. The "shortfall" $2v_0\\sqrt{2gh}/(v_0 + \\sqrt{2gh})$ increases with $v_0$, so higher initial speeds are increasingly less effective at boosting the impact speed.`,
      `For very large $v_0$ (initial speed much greater than the free-fall contribution), $v_{\\text{impact}} \\approx v_0 + gh/v_0$ — the gravitational boost becomes a small additive correction. Conversely, for small $v_0$, $v_{\\text{impact}} \\approx \\sqrt{2gh} + v_0/\\sqrt{2gh} \\cdot v_0/2$. These asymptotic behaviors are useful for building physical intuition about when initial speed dominates vs. when gravity dominates.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Impact speed from energy conservation',
        body: `\\tfrac{1}{2}mv_0^2 + mgh = \\tfrac{1}{2}mv_{\\text{impact}}^2 \\implies v_{\\text{impact}} = \\sqrt{v_0^2 + 2gh}`,
      },
    ],
  },
  examples: [
    {
      id: 'p1-ch2-016-ex1',
      title: 'Throw from balcony — impact speed and time',
      problem: `From a 20-m balcony, an object is thrown downward at 5 m/s (down-positive, $g = 9.8$ m/s²). Find (a) the impact speed and (b) the time of impact.`,
      steps: [
        {
          expression: `v_0 = +5\\text{ m/s (down+)},\\quad a = +9.8\\text{ m/s}^2,\\quad h = 20\\text{ m}`,
          annotation: `All positive in down-positive convention: initial speed, acceleration, and fall distance.`,
        },
        {
          expression: `v_{\\text{impact}}^2 = v_0^2 + 2gh = 25 + 2(9.8)(20) = 25 + 392 = 417\\text{ m}^2/\\text{s}^2`,
          annotation: `No-time SUVAT equation. Both terms are positive and add together.`,
        },
        {
          expression: `v_{\\text{impact}} = \\sqrt{417} \\approx 20.4\\text{ m/s (downward)}`,
          annotation: `Impact speed. Compare to dropping from rest: $v_{\\text{drop}} = \\sqrt{2 \\times 9.8 \\times 20} = \\sqrt{392} \\approx 19.8$ m/s. The initial 5 m/s adds only 0.6 m/s to the impact speed.`,
        },
        {
          expression: `\\tfrac{1}{2}(9.8)t^2 + 5t - 20 = 0 \\implies 4.9t^2 + 5t - 20 = 0`,
          annotation: `Rearrange $h = v_0 t + \\tfrac{1}{2}g t^2$ to quadratic form.`,
        },
        {
          expression: `t = \\frac{-5 + \\sqrt{25 + 4(4.9)(20)}}{2(4.9)} = \\frac{-5 + \\sqrt{417}}{9.8} \\approx \\frac{-5 + 20.4}{9.8} \\approx 1.57\\text{ s}`,
          annotation: `Positive root gives impact time ≈ 1.57 s. Cross-check: $v_0 + gt = 5 + 9.8(1.57) \\approx 20.4$ m/s ✓`,
        },
      ],
      conclusion: `Impact speed ≈ 20.4 m/s, time ≈ 1.57 s. Dropping from rest gives ≈ 19.8 m/s in 2.02 s — the 5 m/s initial throw provides a 22% time reduction but only a 3% speed increase.`,
    },
    {
      id: 'p1-ch2-016-ex2',
      title: 'Comparison table — drop vs downward throw',
      problem: `From 45 m height, compare: (a) drop from rest, (b) throw downward at 10 m/s, (c) throw downward at 20 m/s. Find impact speed and time for each.`,
      steps: [
        {
          expression: `\\text{(a) Drop: }v_{\\text{impact}} = \\sqrt{2(9.8)(45)} = \\sqrt{882} \\approx 29.7\\text{ m/s},\\quad t = \\sqrt{2h/g} = \\sqrt{9.18} \\approx 3.03\\text{ s}`,
          annotation: `Reference case: $v_0 = 0$.`,
        },
        {
          expression: `\\text{(b) }v_0 = 10\\text{ m/s: }v_{\\text{impact}} = \\sqrt{100 + 882} = \\sqrt{982} \\approx 31.3\\text{ m/s}`,
          annotation: `Extra 10 m/s initial speed adds only 1.6 m/s to impact speed (5% increase).`,
        },
        {
          expression: `\\text{(b) time: }4.9t^2 + 10t - 45 = 0 \\implies t = \\frac{-10 + \\sqrt{982}}{9.8} \\approx \\frac{21.3}{9.8} \\approx 2.17\\text{ s}`,
          annotation: `Impact time reduced from 3.03 s to 2.17 s (28% reduction).`,
        },
        {
          expression: `\\text{(c) }v_0 = 20\\text{ m/s: }v_{\\text{impact}} = \\sqrt{400 + 882} = \\sqrt{1282} \\approx 35.8\\text{ m/s}`,
          annotation: `Extra 20 m/s initial speed adds 6.1 m/s to impact speed. Still subadditive.`,
        },
        {
          expression: `\\text{(c) time: }4.9t^2 + 20t - 45 = 0 \\implies t \\approx 1.57\\text{ s}`,
          annotation: `Impact time further reduced to 1.57 s (48% shorter than drop from rest).`,
        },
      ],
      conclusion: `As initial downward speed increases, impact time decreases substantially (linearly dominated), while impact speed increases modestly (sublinearly, because of the square root). Initial speed is more effective at reducing time than boosting impact speed.`,
    },
    {
      id: 'p1-ch2-016-ex3',
      title: 'Find height from impact data',
      problem: `An object is thrown downward at 4 m/s and hits the ground at 22 m/s. Find the drop height.`,
      steps: [
        {
          expression: `v_{\\text{impact}}^2 = v_0^2 + 2gh \\implies h = \\frac{v_{\\text{impact}}^2 - v_0^2}{2g}`,
          annotation: `Rearrange the no-time equation to solve for $h$.`,
        },
        {
          expression: `h = \\frac{(22)^2 - (4)^2}{2(9.8)} = \\frac{484 - 16}{19.6} = \\frac{468}{19.6} \\approx 23.9\\text{ m}`,
          annotation: `The drop height is approximately 23.9 m.`,
        },
        {
          expression: `\\text{Verify with time: }t = \\frac{v_{\\text{impact}} - v_0}{g} = \\frac{22 - 4}{9.8} \\approx 1.84\\text{ s}`,
          annotation: `Using $v = v_0 + at$: the impact takes 1.84 s.`,
        },
        {
          expression: `h_{\\text{check}} = v_0 t + \\tfrac{1}{2}gt^2 = 4(1.84) + \\tfrac{1}{2}(9.8)(3.38) \\approx 7.36 + 16.56 = 23.9\\text{ m}\\checkmark`,
          annotation: `Cross-check confirms $h \\approx 23.9$ m.`,
        },
      ],
      conclusion: `The drop height is approximately 23.9 m. This inverse problem — finding height from impact data — uses the no-time equation rearranged for $h$.`,
    },
  ],
  challenges: [
    {
      id: 'p1-ch2-016-ch1',
      difficulty: 'medium',
      problem: `An object is dropped from rest from height $h$ and hits the ground at time $t_1$. An identical object is thrown downward at speed $v_0$ from the same height and hits at time $t_2 < t_1$. Derive an expression for $t_2$ in terms of $v_0$, $g$, and $t_1$.`,
      hint: `Use $h = \\tfrac{1}{2}g t_1^2$ (drop from rest) to eliminate $h$, then solve the quadratic for $t_2$.`,
      walkthrough: [
        {
          expression: `h = \\tfrac{1}{2}g t_1^2`,
          annotation: `From the drop-from-rest case: $h$ expressed in terms of $t_1$.`,
        },
        {
          expression: `h = v_0 t_2 + \\tfrac{1}{2}g t_2^2 \\implies \\tfrac{1}{2}g t_1^2 = v_0 t_2 + \\tfrac{1}{2}g t_2^2`,
          annotation: `Substitute the thrown-object equation and replace $h$.`,
        },
        {
          expression: `\\tfrac{1}{2}g t_2^2 + v_0 t_2 - \\tfrac{1}{2}g t_1^2 = 0`,
          annotation: `Quadratic in $t_2$.`,
        },
        {
          expression: `t_2 = \\frac{-v_0 + \\sqrt{v_0^2 + g^2 t_1^2}}{g}`,
          annotation: `Positive root of the quadratic. As $v_0 \\to 0$, this gives $t_2 \\to t_1$, confirming the drop-from-rest limit.`,
        },
      ],
    },
    {
      id: 'p1-ch2-016-ch2',
      difficulty: 'medium',
      problem: `An object is thrown downward at 8 m/s from a building and hits the ground at 30 m/s. (a) Find the building height. (b) How much faster did it hit compared to dropping from rest?`,
      hint: `Use $h = (v_f^2 - v_0^2)/(2g)$ for part (a). For part (b), compute drop-from-rest impact speed from the same height.`,
      walkthrough: [
        {
          expression: `h = \\frac{(30)^2 - (8)^2}{2(9.8)} = \\frac{900 - 64}{19.6} = \\frac{836}{19.6} \\approx 42.7\\text{ m}`,
          annotation: `Height from the inverse no-time equation.`,
        },
        {
          expression: `v_{\\text{drop}} = \\sqrt{2(9.8)(42.7)} = \\sqrt{836.9} \\approx 28.9\\text{ m/s}`,
          annotation: `Drop-from-rest impact speed from the same height.`,
        },
        {
          expression: `\\Delta v = 30 - 28.9 = 1.1\\text{ m/s (about 3.8\\%)}`,
          annotation: `Throwing downward at 8 m/s only adds 1.1 m/s to the 28.9 m/s drop speed. The subadditive effect is clear: a large initial downward speed gives a tiny impact speed boost.`,
        },
      ],
    },
    {
      id: 'p1-ch2-016-ch3',
      difficulty: 'hard',
      problem: `Two objects are thrown downward simultaneously from heights $h_1 = 30$ m and $h_2 = 50$ m with the same initial speed $v_0 = 6$ m/s. How much sooner does the first object hit the ground than the second?`,
      hint: `Find $t_1$ and $t_2$ separately from $\\tfrac{1}{2}gt^2 + v_0 t - h = 0$, then compute $t_2 - t_1$.`,
      walkthrough: [
        {
          expression: `4.9t_1^2 + 6t_1 - 30 = 0 \\implies t_1 = \\frac{-6 + \\sqrt{36 + 588}}{9.8} = \\frac{-6 + \\sqrt{624}}{9.8} \\approx \\frac{-6 + 24.98}{9.8} \\approx 1.94\\text{ s}`,
          annotation: `Impact time for the 30-m throw.`,
        },
        {
          expression: `4.9t_2^2 + 6t_2 - 50 = 0 \\implies t_2 = \\frac{-6 + \\sqrt{36 + 980}}{9.8} = \\frac{-6 + \\sqrt{1016}}{9.8} \\approx \\frac{-6 + 31.87}{9.8} \\approx 2.64\\text{ s}`,
          annotation: `Impact time for the 50-m throw.`,
        },
        {
          expression: `\\Delta t = t_2 - t_1 \\approx 2.64 - 1.94 = 0.70\\text{ s}`,
          annotation: `The first object hits the ground about 0.70 s before the second.`,
        },
      ],
    },
  ],
  checkpoints: [
    {
      id: 'p1-ch2-016-cp1',
      question: `An object is thrown downward at 12 m/s from 25 m. Using down-positive, write the equation for impact speed and find its value.`,
      answer: `$v^2 = v_0^2 + 2gh = (12)^2 + 2(9.8)(25) = 144 + 490 = 634$, so $v = \\sqrt{634} \\approx 25.2$ m/s. Compare to drop from rest: $\\sqrt{490} \\approx 22.1$ m/s. The 12 m/s throw adds only 3.1 m/s.`,
    },
    {
      id: 'p1-ch2-016-cp2',
      question: `Why is $v_{\\text{impact}}$ for a downward throw always less than $v_0 + \\sqrt{2gh}$ (the drop speed plus the initial speed)?`,
      answer: `Because $v_{\\text{impact}} = \\sqrt{v_0^2 + 2gh}$ and $\\sqrt{a^2 + b^2} < a + b$ for positive $a$ and $b$. Algebraically: $(v_0 + \\sqrt{2gh})^2 = v_0^2 + 2v_0\\sqrt{2gh} + 2gh > v_0^2 + 2gh$. The cross term $2v_0\\sqrt{2gh}$ is the "shortfall" — speed is not additive under a square root.`,
    },
  ],
  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Impact speed and time — downward throw',
          type: 'code',
          language: 'python',
          code: `import numpy as np

g  = 9.8     # m/s²
h  = 20.0    # m  (height above ground)
v0 = 5.0     # m/s downward (down-positive convention)

# Impact speed: v² = v0² + 2*g*h
v_sq     = v0**2 + 2*g*h
v_impact = np.sqrt(v_sq)

# Compare to drop from rest
v_drop   = np.sqrt(2*g*h)

# Impact time: solve 0.5*g*t² + v0*t - h = 0
roots    = np.roots([0.5*g, v0, -h])
t_impact = max(r for r in roots if r.real > 0).real

print(f"Downward throw (v0={v0} m/s) from h={h} m:")
print(f"  Impact speed  : {v_impact:.3f} m/s")
print(f"  Drop from rest: {v_drop:.3f} m/s")
print(f"  Extra speed   : {v_impact - v_drop:.3f} m/s  (not {v0:.1f} m/s!)")
print(f"  Impact time   : {t_impact:.3f} s")
print(f"  Cross-check v : {v0 + g*t_impact:.3f} m/s  (should match above)")`,
          prose: [
            `Line 9: \`v_sq = v0**2 + 2*g*h\`. With down-positive, all three quantities ($v_0^2$, $g$, $h$) are positive — the formula is straightforward. Compare this to the upward-throw case where $\\Delta y$ could be negative.`,
            `Lines 15–16: \`np.roots([0.5*g, v0, -h])\` solves $0.5g t^2 + v_0 t - h = 0$. The list comprehension \`max(r for r in roots if r.real > 0)\` filters for the physically meaningful positive root.`,
            `The "extra speed" print (line 21) highlights the subadditive effect: throwing 5 m/s downward adds only 0.6 m/s to the impact speed, not 5 m/s. The cross-check on line 23 verifies the time by computing $v_0 + g t_{\\text{impact}}$ — it should equal \`v_impact\`.`,
          ],
        },
        {
          cellTitle: 'Comparison table — drop vs three downward throws',
          type: 'code',
          language: 'python',
          code: `import numpy as np

g = 9.8
h = 20.0

cases = [
    ('Drop (v₀=0)',   0.0),
    ('Throw v₀=5',    5.0),
    ('Throw v₀=10',  10.0),
    ('Throw v₀=20',  20.0),
]

print(f"{'Case':<18} {'t_impact (s)':>14} {'v_impact (m/s)':>16} {'Δv vs drop':>12}")
print("-" * 65)

v_drop = np.sqrt(2*g*h)

for name, v0 in cases:
    v_sq  = v0**2 + 2*g*h
    v_imp = np.sqrt(v_sq)
    roots = np.roots([0.5*g, v0, -h])
    t_imp = max(r for r in roots if r.real > 0).real
    delta_v = v_imp - v_drop
    print(f"{name:<18} {t_imp:>14.3f} {v_imp:>16.3f} {delta_v:>+12.3f}")`,
          prose: [
            `The table compares drop ($v_0 = 0$) against three downward throws. \`v_sq = v0**2 + 2*g*h\` is the master formula — for $v_0 = 0$ it reduces to $2gh$, recovering the drop-from-rest result.`,
            `The "Δv vs drop" column shows how much each initial speed adds to the impact speed. Doubling $v_0$ from 5 to 10 m/s adds roughly the same Δv as the first 5 m/s — and doubling again from 10 to 20 adds only a bit more. The diminishing returns of the square root are visible in the data.`,
            `Impact time (first numeric column) decreases monotonically with $v_0$. The reduction is approximately linear at first (adding 5 m/s ≈ halving the extra time), but the reduction slows as $v_0$ becomes large relative to $\\sqrt{2gh}$.`,
          ],
        },
        {
          cellTitle: 'Visualize height vs time — drop vs downward throw',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

g = 9.8; h = 20.0
cases = [
    ('Drop (v₀=0)',  0.0,  'steelblue'),
    ('Throw v₀=5',   5.0,  'tomato'),
    ('Throw v₀=10', 10.0,  'seagreen'),
]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

for name, v0, color in cases:
    roots = np.roots([0.5*g, v0, -h])
    t_imp = max(r for r in roots if r.real > 0).real
    t = np.linspace(0, t_imp, 300)

    y = h - v0*t - 0.5*g*t**2    # height above ground (decreasing)
    v = v0 + g*t                   # speed (increasing, down-positive)

    ax1.plot(t, y, lw=2, color=color, label=name)
    ax1.scatter([t_imp], [0], color=color, zorder=5, s=60)

    ax2.plot(t, v, lw=2, color=color, label=name)
    ax2.scatter([t_imp], [v0 + g*t_imp], color=color, zorder=5, s=60)

ax1.axhline(0, color='k', lw=0.8, ls='--', label='ground')
ax1.set(xlabel='Time (s)', ylabel='Height above ground (m)',
        title='Height vs time — drop vs throws')
ax1.legend()

ax2.set(xlabel='Time (s)', ylabel='Speed (m/s, down-positive)',
        title='Speed vs time — larger v₀ → higher speed throughout')
ax2.legend()

plt.tight_layout()
plt.show()`,
          prose: [
            `Line 18: \`y = h - v0*t - 0.5*g*t**2\` computes height above ground in a hybrid view: starting at $h$, subtracting the downward displacement. This makes the "ground" appear at $y = 0$. The scatter points mark impact.`,
            `Line 19: \`v = v0 + g*t\` is the speed in down-positive convention. The three lines start at different $v_0$ values but all increase at the same rate $g$ — parallel lines with the same slope, just offset vertically.`,
            `The left plot shows that the thrown objects hit the ground earlier (their curves reach $y = 0$ sooner). The right plot shows that they always travel faster than the dropped object — the speed curves are vertically shifted upward by their respective $v_0$ values.`,
          ],
        },
        {
          cellTitle: 'Challenge — find height from impact data',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# An object was thrown downward at v0 = 6 m/s.
# It was observed to hit the ground at t_impact = 2.1 s
# with speed v_impact = 26.6 m/s.
# Find the drop height using TWO independent methods and verify they agree.

g        = 9.8
v0       = 6.0     # m/s
t_impact = 2.1     # s
v_impact = 26.6    # m/s

# Method 1: from v_impact² = v0² + 2*g*h  →  solve for h
h_method1 = ???

# Method 2: from h = v0*t + 0.5*g*t²
h_method2 = ???

print(f"Method 1 (v² equation)  : h = {h_method1:.3f} m")
print(f"Method 2 (time equation): h = {h_method2:.3f} m")
print(f"Agreement (±0.1 m)?     : {abs(h_method1 - h_method2) < 0.1}")

# Bonus: find what speed a drop from rest would have from this height
v_drop = ???
print(f"Drop-from-rest speed    : {v_drop:.3f} m/s  (vs thrown: {v_impact} m/s)")`,
          prose: [
            `Fill in three blanks: (1) \`h_method1 = (v_impact**2 - v0**2) / (2*g)\` — rearranging $v^2 = v_0^2 + 2gh$; (2) \`h_method2 = v0*t_impact + 0.5*g*t_impact**2\` — direct substitution; (3) \`v_drop = np.sqrt(2*g*h_method1)\`.`,
            `Both methods should give $h \\approx 33.8$ m. The agreement check (\`abs(h_method1 - h_method2) < 0.1\`) confirms that the given data are self-consistent. In a real measurement, slight disagreement would indicate measurement error.`,
            `The bonus print shows that dropping from rest from 33.8 m gives about 25.7 m/s — compared to the 26.6 m/s thrown impact. The 6 m/s initial throw adds less than 1 m/s to the impact speed from 33.8 m — the subadditive effect at work.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Impact speed and time — downward throw',
          type: 'code',
          language: 'matlab',
          code: `%% Downward throw: impact speed and time
g  = 9.8;     % m/s²
h  = 20.0;    % m (height above ground)
v0 = 5.0;     % m/s downward (down-positive)

% Impact speed
v_sq     = v0^2 + 2*g*h;
v_impact = sqrt(v_sq);

% Compare to drop from rest
v_drop = sqrt(2*g*h);

% Impact time: 0.5*g*t² + v0*t - h = 0
coeffs   = [0.5*g, v0, -h];
t_roots  = roots(coeffs);
t_impact = max(real(t_roots));   % positive root

fprintf('Downward throw (v0=%.0f m/s) from h=%.0f m:\\n', v0, h)
fprintf('  Impact speed  : %.3f m/s\\n', v_impact)
fprintf('  Drop from rest: %.3f m/s\\n', v_drop)
fprintf('  Extra speed   : %+.3f m/s  (not %.1f m/s!)\\n', v_impact-v_drop, v0)
fprintf('  Impact time   : %.3f s\\n', t_impact)
fprintf('  Cross-check v : %.3f m/s\\n', v0 + g*t_impact)`,
          prose: [
            `\`v_sq = v0^2 + 2*g*h\` — all three terms are positive in down-positive convention. MATLAB scalar operations are identical to Python here; only the syntax for \`**\` vs \`^\` differs.`,
            `\`coeffs = [0.5*g, v0, -h]\` sets up the quadratic $0.5gt^2 + v_0 t - h = 0$. The sign of \`-h\` is crucial: rearranging $h = v_0 t + 0.5gt^2$ gives $0.5gt^2 + v_0 t - h = 0$, so the constant term is $-h$.`,
            `\`max(real(t_roots))\` picks the larger real root, which is the positive physical time. The cross-check on the last line verifies: $v_0 + g t_{\\text{impact}}$ must equal the computed impact speed.`,
          ],
        },
        {
          cellTitle: 'Comparison table — drop vs downward throws',
          type: 'code',
          language: 'matlab',
          code: `%% Compare drop from rest vs three downward throws
g = 9.8; h = 20.0;

v0_cases = [0, 5, 10, 20];
names    = {'Drop (v0=0)', 'Throw v0=5', 'Throw v0=10', 'Throw v0=20'};
v_drop   = sqrt(2*g*h);

fprintf('%-18s %14s %16s %12s\\n', 'Case', 't_impact (s)', 'v_impact (m/s)', 'Δv vs drop')
fprintf('%s\\n', repmat('-', 1, 64))

for k = 1:numel(v0_cases)
    v0    = v0_cases(k);
    v_imp = sqrt(v0^2 + 2*g*h);
    roots_k = roots([0.5*g, v0, -h]);
    t_imp   = max(real(roots_k));
    dv    = v_imp - v_drop;
    fprintf('%-18s %14.3f %16.3f %+12.3f\\n', names{k}, t_imp, v_imp, dv)
end`,
          prose: [
            `\`v0_cases = [0, 5, 10, 20]\` creates a row vector of initial speeds. The loop iterates over each, computing impact speed and time via the same two formulas.`,
            `\`names{k}\` uses curly-brace indexing for MATLAB cell arrays (arrays of strings). This is different from numeric indexing with parentheses \`()\`.`,
            `The "Δv vs drop" column shows the diminishing returns: 0 → 5 m/s adds 0.6 m/s, 5 → 10 adds 0.9 m/s, 10 → 20 adds 1.8 m/s more (the relationship is sublinear). Impact time reductions are larger and more evenly spread.`,
          ],
        },
        {
          cellTitle: 'Visualize height vs time and speed vs time',
          type: 'code',
          language: 'matlab',
          code: `%% Height above ground and speed over time for drop vs throws
g = 9.8; h = 20.0;

v0_cases = [0,    5,    10];
colors   = {'b',  'r',  'g'};
labels   = {'Drop (v0=0)', 'Throw v0=5', 'Throw v0=10'};

figure('Position', [100 100 1000 450])

subplot(1,2,1); hold on
subplot(1,2,2); hold on

for k = 1:numel(v0_cases)
    v0 = v0_cases(k);
    roots_k = roots([0.5*g, v0, -h]);
    t_imp   = max(real(roots_k));
    t = linspace(0, t_imp, 300);

    y_height = h - v0*t - 0.5*g*t.^2;   % height above ground
    v_speed  = v0 + g*t;                  % speed (down-positive)

    subplot(1,2,1)
    plot(t, y_height, [colors{k} '-'], 'LineWidth', 2, 'DisplayName', labels{k})
    scatter(t_imp, 0, 60, colors{k}, 'filled')

    subplot(1,2,2)
    plot(t, v_speed, [colors{k} '-'], 'LineWidth', 2, 'DisplayName', labels{k})
end

subplot(1,2,1)
yline(0, 'k--', 'ground', 'LineWidth', 0.8)
xlabel('t (s)'); ylabel('Height (m)'); title('Height vs time')
legend('Location', 'northeast'); grid on

subplot(1,2,2)
xlabel('t (s)'); ylabel('Speed (m/s, down+)'); title('Speed vs time')
legend('Location', 'northwest'); grid on
tight_layout`,
          prose: [
            `\`[colors{k} '-']\` concatenates the color character (e.g., \`'b'\`) with \`'-'\` to form a line-style string like \`'b-'\`. This is MATLAB's shorthand for blue solid line.`,
            `Left plot: height decreases from $h$ to 0. All three curves are downward-opening parabolas (in height-vs-time) — the thrown objects hit the ground sooner. Right plot: speed increases linearly from $v_0$. The three lines are parallel (same slope $g$) but offset vertically by their initial speeds.`,
            `\`tight_layout\` adjusts subplot spacing. In older MATLAB versions, use \`set(gcf, 'Position', [100 100 1000 450])\` to size the figure manually.`,
          ],
        },
        {
          cellTitle: 'Challenge — find height from impact data',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `%% Find drop height from measured impact data
%% An object was thrown downward at v0 = 6 m/s and hit at:
%%   t_impact = 2.1 s,  v_impact = 26.6 m/s

g        = 9.8;
v0       = 6.0;
t_impact = 2.1;
v_impact = 26.6;

% Method 1: from v_impact² = v0² + 2*g*h  →  solve for h
h_method1 = ???;   % (v_impact^2 - v0^2) / (2*g)

% Method 2: from h = v0*t + 0.5*g*t²
h_method2 = ???;

fprintf('Method 1 (v² equation)  : h = %.3f m\\n', h_method1)
fprintf('Method 2 (time equation): h = %.3f m\\n', h_method2)
fprintf('Agreement (within 0.1): %d\\n', abs(h_method1 - h_method2) < 0.1)

% Bonus: what speed would a drop from rest give from this height?
v_drop = ???;   % sqrt(2*g*h_method1)
fprintf('Drop-from-rest speed    : %.3f m/s (vs thrown %.1f m/s)\\n', v_drop, v_impact)`,
          prose: [
            `Fill in three blanks: (1) \`h_method1 = (v_impact^2 - v0^2) / (2*g)\`; (2) \`h_method2 = v0*t_impact + 0.5*g*t_impact^2\`; (3) \`v_drop = sqrt(2*g*h_method1)\`.`,
            `Both height methods should give approximately 33.8 m. The small discrepancy (if any) is due to rounding in the given data. If the agreement check fails, one of the input data values ($v_0$, $t_{\\text{impact}}$, $v_{\\text{impact}}$) is inconsistent — a useful diagnostic.`,
            `The drop-from-rest speed from 33.8 m is about 25.7 m/s vs. the 26.6 m/s thrown speed. The 6 m/s initial throw added less than 1 m/s — the subadditive effect is dramatic at heights where free fall already gives high impact speed.`,
          ],
        },
      ],
    },
  },
  quiz: [
    {
      id: 'p1-ch2-016-q1',
      type: 'choice',
      question: `An object is thrown downward at 5 m/s from a 20-m balcony (down-positive). What is the impact speed?`,
      options: [`14.0 m/s`, `20.4 m/s`, `25.0 m/s`, `19.6 m/s`],
      answer: `20.4 m/s`,
      hints: [
        `Use $v^2 = v_0^2 + 2gh$ with $v_0 = 5$ m/s and $h = 20$ m.`,
        `$v^2 = 25 + 2(9.8)(20) = 25 + 392 = 417$. Take the square root.`,
      ],
      reviewSection: 'examples',
      explanation: `$v^2 = 25 + 392 = 417 \\Rightarrow v = \\sqrt{417} \\approx 20.4$ m/s.`,
    },
    {
      id: 'p1-ch2-016-q2',
      type: 'choice',
      question: `Compared to dropping from rest from the same height, throwing downward:`,
      options: [
        `Increases impact time and increases impact speed`,
        `Decreases impact time and increases impact speed`,
        `Decreases impact time and decreases impact speed`,
        `Has no effect — final speed depends only on height`,
      ],
      answer: `Decreases impact time and increases impact speed`,
      hints: [
        `The object starts with extra downward speed — does it reach the ground faster or slower?`,
        `Extra initial kinetic energy: does it contribute to impact speed?`,
      ],
      reviewSection: 'intuition',
      explanation: `The initial downward speed gives the object a "head start" in velocity, reducing fall time. The extra initial kinetic energy adds to the gravitational PE converted during the fall, increasing impact speed.`,
    },
    {
      id: 'p1-ch2-016-q3',
      type: 'choice',
      question: `For a downward throw with up-positive convention, what is the sign of $v_0$?`,
      options: [
        `Positive (downward = positive)`,
        `Negative (down is negative in up-positive)`,
        `Zero`,
        `Depends on acceleration`,
      ],
      answer: `Negative (down is negative in up-positive)`,
      hints: [
        `In up-positive, which direction is negative?`,
        `A throw in the downward direction gets the negative sign.`,
      ],
      reviewSection: 'intuition',
      explanation: `With up = positive, downward is negative. A downward throw means $v_0 < 0$, e.g. $v_0 = -5$ m/s.`,
    },
    {
      id: 'p1-ch2-016-q4',
      type: 'choice',
      question: `An object thrown downward at 10 m/s from 45 m (down-positive). What equation gives impact speed without finding time first?`,
      options: [
        `$v = v_0 + at$`,
        `$v^2 = v_0^2 + 2g\\Delta y$`,
        `$\\Delta y = v_0 t + \\tfrac{1}{2}gt^2$`,
        `$\\Delta y = \\tfrac{1}{2}(v_0 + v)t$`,
      ],
      answer: `$v^2 = v_0^2 + 2g\\Delta y$`,
      hints: [
        `Which SUVAT equation does not contain $t$?`,
        `It has five quantities: $v_0$, $v_f$, $a$, $t$, $\\Delta y$. Which one is missing?`,
      ],
      reviewSection: 'math',
      explanation: `$v^2 = v_0^2 + 2g\\Delta y$ eliminates time. With $v_0 = 10$, $g = 9.8$, $\\Delta y = 45$: $v^2 = 100 + 882 = 982$, $v \\approx 31.3$ m/s.`,
    },
    {
      id: 'p1-ch2-016-q5',
      type: 'choice',
      question: `An object dropped from rest falls 20 m. Another is thrown downward at 5 m/s from 20 m. How do impact speeds compare?`,
      options: [
        `Both 19.8 m/s — height determines speed`,
        `Thrown object is faster (extra initial kinetic energy)`,
        `Dropped object is faster (no initial KE loss)`,
        `Identical — same acceleration and same height`,
      ],
      answer: `Thrown object is faster (extra initial kinetic energy)`,
      hints: [
        `$v^2 = v_0^2 + 2gh$. If $v_0 > 0$, is $v^2$ larger or the same as when $v_0 = 0$?`,
        `Initial kinetic energy adds to the gravitational PE being converted.`,
      ],
      reviewSection: 'examples',
      explanation: `$v_{\\text{drop}} = \\sqrt{392} \\approx 19.8$ m/s; $v_{\\text{throw}} = \\sqrt{417} \\approx 20.4$ m/s. The thrown object is slightly faster due to its initial KE.`,
    },
    {
      id: 'p1-ch2-016-q6',
      type: 'choice',
      question: `A downward throw of $v_0 = 8$ m/s from 30 m (down-positive). What is the impact speed?`,
      options: [`22.7 m/s`, `25.5 m/s`, `28.0 m/s`, `30.6 m/s`],
      answer: `25.5 m/s`,
      hints: [
        `$v^2 = v_0^2 + 2gh = 8^2 + 2(9.8)(30)$.`,
        `$64 + 588 = 652$. Take the square root.`,
      ],
      reviewSection: 'examples',
      explanation: `$v^2 = 64 + 588 = 652 \\Rightarrow v = \\sqrt{652} \\approx 25.5$ m/s.`,
    },
    {
      id: 'p1-ch2-016-q7',
      type: 'choice',
      question: `For a downward throw, the height-above-ground curve $y(t) = h - v_0 t - \\tfrac{1}{2}gt^2$ is:`,
      options: [
        `A straight line decreasing to zero`,
        `A downward-opening parabola that curves more steeply over time`,
        `A curve that decreases at a constant rate`,
        `An upward-opening parabola`,
      ],
      answer: `A downward-opening parabola that curves more steeply over time`,
      hints: [
        `$y(t) = -\\tfrac{1}{2}gt^2 - v_0 t + h$ is a quadratic in $t$. What is the sign of the $t^2$ coefficient?`,
        `Negative $t^2$ coefficient → downward-opening parabola.`,
      ],
      reviewSection: 'math',
      explanation: `$y(t) = -\\tfrac{1}{2}gt^2 - v_0 t + h$ has a negative $t^2$ coefficient, giving a downward-opening parabola. The height decreases at an ever-increasing rate — the ball is constantly speeding up.`,
    },
    {
      id: 'p1-ch2-016-q8',
      type: 'choice',
      question: `A downward throw: $v_0 = 3$ m/s, $g = 9.8$ m/s², $h = 10$ m. Which equation gives the time of impact?`,
      options: [
        `$t = h/v_0$`,
        `$t = \\sqrt{2h/g}$`,
        `Solve $\\tfrac{1}{2}g t^2 + v_0 t - h = 0$ for $t > 0$`,
        `$t = (v_{\\text{impact}} - v_0)/g$`,
      ],
      answer: `Solve $\\tfrac{1}{2}g t^2 + v_0 t - h = 0$ for $t > 0$`,
      hints: [
        `$t = \\sqrt{2h/g}$ only works when $v_0 = 0$. With $v_0 \\neq 0$, what equation gives $t$?`,
        `Start from $h = v_0 t + \\tfrac{1}{2}gt^2$ and rearrange to standard form.`,
      ],
      reviewSection: 'math',
      explanation: `From $h = v_0 t + \\tfrac{1}{2}gt^2$: $\\tfrac{1}{2}gt^2 + v_0 t - h = 0$. Take the positive root. $\\sqrt{2h/g}$ only applies when $v_0 = 0$.`,
    },
    {
      id: 'p1-ch2-016-q9',
      type: 'choice',
      question: `Is it true that adding 10 m/s to the initial downward speed always adds 10 m/s to the impact speed?`,
      options: [
        `Yes — impact speed is additive in initial speed`,
        `No — impact speed scales as $\\sqrt{v_0^2 + 2gh}$, which is subadditive`,
        `Yes, but only for small heights`,
        `No — adding initial speed actually reduces impact speed`,
      ],
      answer: `No — impact speed scales as $\\sqrt{v_0^2 + 2gh}$, which is subadditive`,
      hints: [
        `Compare $\\sqrt{a^2 + b^2}$ to $a + b$ for $a, b > 0$. Which is larger?`,
        `$(a + b)^2 = a^2 + 2ab + b^2 > a^2 + b^2$.`,
      ],
      reviewSection: 'intuition',
      explanation: `$\\sqrt{v_0^2 + 2gh} < v_0 + \\sqrt{2gh}$ always. Impact speed is subadditive: adding 10 m/s to $v_0$ adds less than 10 m/s to $v_{\\text{impact}}$. The deficit grows with both $v_0$ and $h$.`,
    },
    {
      id: 'p1-ch2-016-q10',
      type: 'choice',
      question: `An object thrown downward at $v_0$ from height $h$ hits the ground after time $t$. Which expression correctly gives the impact speed using the time?`,
      options: [
        `$v_0 - g t$`,
        `$v_0 + g t$`,
        `$g t$`,
        `$\\sqrt{2gh}$`,
      ],
      answer: `$v_0 + g t$`,
      hints: [
        `In down-positive, $a = +g$. Use $v = v_0 + at$.`,
        `$v_0$ and $g$ and $t$ are all positive in down-positive convention.`,
      ],
      reviewSection: 'math',
      explanation: `Down-positive: $v = v_0 + g t$. With $v_0 > 0$ and $g > 0$ and $t > 0$, impact speed is simply their sum plus product. This can be verified against the no-time formula: $v_0 + gt = \\sqrt{v_0^2 + 2gh}$ when $t$ is the correct impact time.`,
    },
  ],
  misconceptions: [
    {
      id: 'p1-ch2-016-m1',
      misconception: `"Throwing downward at 10 m/s adds exactly 10 m/s to the impact speed."`,
      correction: `Impact speed is $\\sqrt{v_0^2 + 2gh}$, not $v_0 + \\sqrt{2gh}$. The increase from adding initial speed is always less than $v_0$ because $\\sqrt{a^2 + b^2} < a + b$. For small $v_0$ relative to $\\sqrt{2gh}$, the boost is tiny.`,
      correctionExample: `From 20 m, drop gives 19.8 m/s. Throw at 10 m/s gives $\\sqrt{100 + 392} = \\sqrt{492} \\approx 22.2$ m/s — only 2.4 m/s more, not 10 m/s more.`,
    },
    {
      id: 'p1-ch2-016-m2',
      misconception: `"For a downward throw with down-positive, the formula should be $v^2 = v_0^2 - 2gh$ (same as upward throw)."`,
      correction: `In down-positive, $a = +g$ and $\\Delta y = +h$ (positive downward). So the no-time equation is $v^2 = v_0^2 + 2a\\Delta y = v_0^2 + 2gh$ (both signs positive). The minus sign in $v^2 = v_0^2 - 2g\\Delta y$ appears only in the up-positive convention.`,
      correctionExample: `Up-positive: $v_0 = -5$ m/s, $a = -9.8$, $\\Delta y = -20$: $v^2 = 25 + 2(9.8)(20) = 417$ ✓. Down-positive: $v_0 = +5$, $a = +9.8$, $\\Delta y = +20$: $v^2 = 25 + 2(9.8)(20) = 417$ ✓. Same result; different signs but consistent within each convention.`,
    },
  ],
  transferPrompts: [
    {
      id: 'p1-ch2-016-tp1',
      prompt: `A pneumatic tube system pushes packages downward at 3 m/s into a 15-m drop shaft. If impact speed must stay below 20 m/s for the packages to survive, does this system meet the spec? What is the maximum allowable initial push speed?`,
    },
    {
      id: 'p1-ch2-016-tp2',
      prompt: `In a bullet drop test, a cartridge is pushed out of a gun barrel pointing straight down with muzzle velocity 900 m/s from a 2-m height. What is the impact speed and time? Compare to dropping the same cartridge from rest — how much does the muzzle velocity dominate?`,
    },
  ],
  debugging: [
    {
      id: 'p1-ch2-016-d1',
      buggyWork: `A student writes: "Downward throw, up-positive. $v_0 = +5$ m/s (I chose positive to make math simpler), $a = -9.8$ m/s². After falling 20 m: $v^2 = 25 - 2(9.8)(20) = 25 - 392 = -367$." They get a negative $v^2$ and conclude the object never reaches the ground.`,
      question: `Identify both errors and find the correct impact speed.`,
      answer: `Error 1: in up-positive, a downward throw has $v_0 < 0$, not $+5$ m/s. Error 2: $\\Delta y = -20$ m (the object moves downward = negative direction), so $v^2 = v_0^2 - 2g\\Delta y = 25 - 2(9.8)(-20) = 25 + 392 = 417$. The student accidentally used $\\Delta y = +20$ when it should be $-20$. Correct: $v = \\sqrt{417} \\approx 20.4$ m/s.`,
    },
    {
      id: 'p1-ch2-016-d2',
      buggyWork: `A student calculates impact time for a downward throw ($v_0 = 6$ m/s, $h = 25$ m, down-positive): "Using $t = \\sqrt{2h/g} = \\sqrt{50/9.8} \\approx 2.26$ s."`,
      question: `What is the error? Find the correct impact time.`,
      answer: `$t = \\sqrt{2h/g}$ is the drop-from-rest formula ($v_0 = 0$). With $v_0 \\neq 0$, you must solve the quadratic $4.9t^2 + 6t - 25 = 0$: $t = (-6 + \\sqrt{36 + 490})/9.8 = (-6 + \\sqrt{526})/9.8 \\approx (-6 + 22.9)/9.8 \\approx 1.73$ s. The throw reaches the ground in 1.73 s, shorter than the 2.26 s drop-from-rest time.`,
    },
  ],
  mastery: {
    targetLevel: `For any downward-throw scenario, correctly compute impact speed using $v^2 = v_0^2 + 2gh$, impact time using the quadratic formula, and understand the subadditive relationship between initial downward speed and impact speed.`,
    coreSkill: `Using the no-time SUVAT equation $v^2 = v_0^2 + 2g\\Delta y$ correctly for both directions, recognizing that $v_0^2$ and $2gh$ always add (not subtract) when both initial velocity and displacement are in the same direction.`,
    commonSticking: `Using $t = \\sqrt{2h/g}$ (drop-from-rest formula) when $v_0 \\neq 0$. This formula only applies to drops from rest. With a nonzero initial downward speed, the quadratic $\\tfrac{1}{2}gt^2 + v_0 t - h = 0$ must be solved.`,
    connections: [
      `ch2-012 (free fall basics) — the same SUVAT equations, just with different initial conditions`,
      `ch2-015 (upward launch) — complementary: upward throw has apex and symmetry; downward throw has neither`,
      `ch2-014 (sign conventions) — choosing down-positive simplifies the signs for downward throw problems`,
      `ch3 (Newton's second law) — $v_0^2 + 2gh$ is the kinematics face of energy conservation ($\\tfrac{1}{2}mv^2 = \\tfrac{1}{2}mv_0^2 + mgh$)`,
    ],
  },
  semantics: {
    core: [
      { symbol: `v_0`, meaning: `Initial downward speed; positive in down-positive, negative in up-positive` },
      { symbol: `v_{\\text{impact}}`, meaning: `Speed at ground level; $\\sqrt{v_0^2 + 2gh}$ — always greater than $\\sqrt{2gh}$ when $v_0 > 0$` },
      { symbol: `h`, meaning: `Drop height (positive); displacement from launch to ground` },
      { symbol: `t_{\\text{impact}}`, meaning: `Time to reach ground; found from quadratic $\\tfrac{1}{2}gt^2 + v_0 t - h = 0$` },
      { symbol: `\\Delta v_{\\text{boost}}`, meaning: `Extra impact speed from initial throw; equals $\\sqrt{v_0^2 + 2gh} - \\sqrt{2gh}$; always less than $v_0$` },
    ],
    rulesOfThumb: [
      `Use $v_{\\text{impact}} = \\sqrt{v_0^2 + 2gh}$ for impact speed — no time needed.`,
      `Use the quadratic $\\tfrac{1}{2}gt^2 + v_0 t - h = 0$ for impact time. Never use $\\sqrt{2h/g}$ when $v_0 \\neq 0$.`,
      `Impact speed boost from $v_0$ is subadditive: throwing at 10 m/s adds much less than 10 m/s to impact speed.`,
      `Down-positive convention simplifies sign tracking for purely downward problems: all three of $v_0$, $a$, and $\\Delta y$ are positive.`,
      `No apex in a downward throw — never apply apex formulas ($t_{\\text{peak}} = v_0/g$, etc.) to downward throws.`,
    ],
  },
};

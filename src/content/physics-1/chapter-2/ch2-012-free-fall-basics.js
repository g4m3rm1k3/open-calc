export default {
  id: 'p1-ch2-012',
  slug: 'free-fall-basics',
  chapter: 'p1',
  order: 12,
  title: "Free Fall — Basics",
  subtitle: "Near Earth's surface, all objects fall with the same acceleration: g ≈ 9.8 m/s².",
  tags: ["free-fall-basics", "kinematics", "1D motion"],
  aliases: "free-fall-basics free fall gravity dropped object",
  hook: {
    question: "A feather and a hammer are dropped on the Moon. Which hits the ground first?",
    realWorldContext:
      "Free fall is the purest application of constant-acceleration kinematics. Galileo established that (without air resistance) all objects fall equally. This underpins every projectile calculation.",
    previewVisualizationId: 'SVGDiagram',
  },
  videos: [
    {
      title: "Physics 2 – Motion in One Dimension (12 of 22) Free Fall: Basics",
      embedCode:
        '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: "intuition",
    },
  ],
  intuition: {
    prose: [
      `Before reading on, predict: you hold a coin and a crumpled piece of paper at the same height and release them simultaneously. Which lands first? Now imagine doing the same experiment in a room with no air — would your prediction change? Write down your reasoning before continuing.`,
      `Free fall means only gravity acts on the object — air resistance is neglected. Near Earth's surface, that gravitational pull gives every object the same downward acceleration, roughly 9.8 m/s², regardless of mass. This surprising result — that a feather and a cannonball fall together with no air — was demonstrated by Galileo and confirmed spectacularly on the Moon by Apollo 15 in 1971.`,
      `The reason mass cancels is that the same property of matter (inertial mass) that resists acceleration is what couples the object to gravity (gravitational mass). Newton's law $F = ma$ with $F = mg$ gives $a = g$ — the mass divides out completely. This equivalence is so fundamental that it became one of Einstein's starting points for general relativity.`,
      `In practice, free-fall kinematics means substituting $a = \\pm g$ into the four SUVAT equations, where the sign depends on your axis convention. Choosing up as positive (the most common convention) gives $a = -9.8$ m/s² because gravity points in the negative direction. Choosing down as positive gives $a = +9.8$ m/s². Either works — you just have to be consistent throughout the problem.`,
      `The most critical bookkeeping step is deciding the convention before writing a single equation. A stone thrown upward with $v_0 = +15$ m/s in the up-positive system has the same motion as one thrown with $v_0 = -15$ m/s in the down-positive system. The physics is identical; only the sign labels differ.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Four-step free-fall setup checklist',
        body: `1. Choose your axis direction (up-positive is standard) and write it at the top of your work.\n2. Assign signs to all known quantities: velocities, positions, and accelerations must all use the same convention.\n3. Write $a = -g = -9.8$ m/s² (up-positive) or $a = +g = +9.8$ m/s² (down-positive).\n4. Select the SUVAT equation that contains your unknown and not the quantity you don't care about. Solve and check the sign of the answer for physical sense.`,
      },
      {
        type: 'definition',
        title: 'Free-fall acceleration',
        body: `a = -g \\approx -9.8\\,\\text{m/s}^2 \\quad (\\text{up-positive convention})`,
      },
      {
        type: 'warning',
        title: 'Convention first — commit and never switch',
        body: `If you choose down-positive, then $a = +g$, a thrown-upward initial velocity is negative, and heights above the launch point are negative. Both conventions give the same physical answer, but mixing them mid-problem gives garbage. Pick one and annotate it at the top of every free-fall problem.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-fall-axes' },
        title: 'Sign convention: upward positive',
        caption: 'g = 9.8 m/s² always points downward. When +y is upward, acceleration a = −g = −9.8 m/s². The trajectory y(t) curves downward because a is negative.',
      },
    ],
  },
  math: {
    prose: [
      `Free fall is constant-acceleration kinematics with one substitution: replace $a$ with $-g$ (up-positive) or $+g$ (down-positive). All four SUVAT equations apply directly.`,
      `A reliable workflow: list the five kinematic quantities $(v_0, v_f, a, t, \\Delta y)$. Mark the ones you know (and their signs), identify the unknown, and note the quantity not mentioned in the problem. Choose the SUVAT equation that omits the unneeded quantity. Always assign $a = \\mp g$ first, before touching the other quantities.`,
      `The most useful equation for problems involving maximum height is $v^2 = v_0^2 - 2g \\Delta y$ (up-positive), because it relates velocity and displacement without requiring time. At the apex, $v = 0$, so $\\Delta y_{\\text{max}} = v_0^2 / (2g)$.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Core free-fall equations (up-positive)',
        body: `v = v_0 - g t,\\quad y = y_0 + v_0 t - \\tfrac{1}{2}g t^2,\\quad v^2 = v_0^2 - 2g(y - y_0)`,
      },
      {
        type: 'insight',
        title: 'Apex shortcut',
        body: `At maximum height, $v = 0$. Substituting into $v = v_0 - gt$ gives $t_{\\text{peak}} = v_0/g$. Substituting into $v^2 = v_0^2 - 2g\\Delta y$ gives $\\Delta y_{\\text{max}} = v_0^2/(2g)$.`,
      },
    ],
  },
  rigor: {
    prose: [
      `Near Earth's surface, the gravitational force on an object of (gravitational) mass $m_g$ is $F = m_g g$. By Newton's second law, $F = m_i a$, where $m_i$ is the inertial mass. The empirical equivalence $m_g = m_i$ (which holds to at least one part in $10^{12}$ in precision experiments) gives $a = g$ independent of mass. Free-fall kinematics is therefore a corollary of Newton's laws plus the equivalence principle.`,
      `The constant-acceleration assumption holds as long as height changes are small compared to Earth's radius ($\\approx 6400$ km). For a fall of 100 m, the fractional change in $g$ is roughly $2(100)/6{,}400{,}000 \\approx 3 \\times 10^{-5}$ — negligible for all introductory-physics purposes. Over kilometer-scale heights, $g$ begins to vary and the constant-$a$ model must be replaced by integrating $F = -GMm/r^2$.`,
      `Geometrically, free-fall trajectories in one dimension are parabolas in the $y$–$t$ plane (since $y = y_0 + v_0 t - \\tfrac{1}{2}g t^2$ is a quadratic in $t$) and straight lines in the $v$–$t$ plane ($v = v_0 - gt$ is linear). The slope of the $v$–$t$ line is $-g$ everywhere — a constant — which is the defining feature of constant acceleration. Curvature of $y(t)$ is $\\ddot y = -g < 0$, meaning the parabola always opens downward regardless of the direction of $v_0$.`,
      `Free fall is the special case $a = -g$ of the general constant-acceleration model. In chapter 3, when Newton's second law introduces $a = F_{\\text{net}}/m$, free fall becomes the example where $F_{\\text{net}} = -mg$ and $m$ cancels. In chapter 4 (projectile motion), free fall governs the vertical component while horizontal motion is inertial ($a_x = 0$). Every projectile problem decomposes into two simultaneous free-fall sub-problems along perpendicular axes.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Free-fall position and velocity (up-positive)',
        body: `y(t) = y_0 + v_0 t - \\tfrac{1}{2}g t^2,\\qquad v(t) = v_0 - g t`,
      },
    ],
  },
  examples: [
    {
      id: 'p1-ch2-012-ex1',
      title: 'Dropped from rest — full walkthrough',
      problem: `An object is dropped from rest at height $y_0 = 44.1$ m above the ground (up-positive, $g = 9.8$ m/s²). Find (a) the time to reach the ground and (b) the impact velocity.`,
      steps: [
        {
          expression: `v_0 = 0,\\quad a = -9.8\\text{ m/s}^2,\\quad y_0 = 44.1\\text{ m},\\quad y_f = 0`,
          annotation: `List knowns with signs. Dropped from rest means $v_0 = 0$; released from 44.1 m means $y_f = 0$ is the ground.`,
        },
        {
          expression: `y_f = y_0 + v_0 t - \\tfrac{1}{2}g t^2 \\implies 0 = 44.1 - \\tfrac{1}{2}(9.8)t^2`,
          annotation: `Choose SUVAT equation 2. $v_0 = 0$ kills the linear term, leaving a simple quadratic.`,
        },
        {
          expression: `t = \\sqrt{\\frac{2 \\times 44.1}{9.8}} = \\sqrt{9} = 3\\text{ s}`,
          annotation: `Solve for $t$. The answer is exactly 3 s because 44.1 was chosen as $\\tfrac{1}{2}(9.8)(9)$.`,
        },
        {
          expression: `v_f = v_0 - g t = 0 - 9.8(3) = -29.4\\text{ m/s}`,
          annotation: `Impact velocity. Negative sign confirms downward direction (up-positive convention).`,
        },
      ],
      conclusion: `Time to ground is 3 s; impact velocity is $-29.4$ m/s (downward). The object accelerates from rest to nearly 30 m/s — about 106 km/h — in just three seconds.`,
    },
    {
      id: 'p1-ch2-012-ex2',
      title: 'Object dropped from a known height — use energy-like equation',
      problem: `A rock is dropped from a cliff of height $h = 80$ m (up-positive). Find its speed just before impact without computing the fall time.`,
      steps: [
        {
          expression: `v_0 = 0,\\quad \\Delta y = -80\\text{ m},\\quad a = -g = -9.8\\text{ m/s}^2`,
          annotation: `$\\Delta y$ is negative because the rock moves downward. We want $v_f$ and do not need $t$, so use the no-time equation.`,
        },
        {
          expression: `v_f^2 = v_0^2 - 2g\\Delta y = 0 - 2(9.8)(-80) = 1568\\text{ m}^2/\\text{s}^2`,
          annotation: `Substituting $\\Delta y = -80$ m and $v_0 = 0$. Two negatives multiply to a positive — the speed squared is positive, as required.`,
        },
        {
          expression: `|v_f| = \\sqrt{1568} \\approx 39.6\\text{ m/s}`,
          annotation: `Take the positive root for speed. The sign of $v_f$ is negative (downward); the speed (magnitude) is 39.6 m/s ≈ 142 km/h.`,
        },
      ],
      conclusion: `Impact speed is approximately 39.6 m/s. Using the no-time equation is faster when the problem doesn't ask for $t$.`,
    },
    {
      id: 'p1-ch2-012-ex3',
      title: 'Object thrown downward from a window',
      problem: `A ball is thrown downward at $v_0 = -8$ m/s from a window 30 m above the ground (up-positive). Find (a) the time to reach the ground and (b) the impact velocity.`,
      steps: [
        {
          expression: `v_0 = -8\\text{ m/s},\\quad y_0 = 30\\text{ m},\\quad y_f = 0,\\quad a = -9.8\\text{ m/s}^2`,
          annotation: `Thrown downward: $v_0$ is negative in the up-positive convention. Ground is $y_f = 0$.`,
        },
        {
          expression: `0 = 30 + (-8)t - \\tfrac{1}{2}(9.8)t^2 \\implies 4.9t^2 + 8t - 30 = 0`,
          annotation: `Substitute into $y_f = y_0 + v_0 t - \\tfrac{1}{2}gt^2$ and rearrange to standard quadratic form.`,
        },
        {
          expression: `t = \\frac{-8 + \\sqrt{64 + 4(4.9)(30)}}{2(4.9)} = \\frac{-8 + \\sqrt{652}}{9.8} \\approx \\frac{-8 + 25.53}{9.8} \\approx 1.79\\text{ s}`,
          annotation: `Quadratic formula; take the positive root because $t > 0$. The ball reaches the ground in about 1.79 s.`,
        },
        {
          expression: `v_f = -8 - 9.8(1.79) \\approx -8 - 17.5 = -25.5\\text{ m/s}`,
          annotation: `Impact velocity is about $-25.5$ m/s (downward). Throwing it down gives a faster impact than dropping from rest.`,
        },
      ],
      conclusion: `Flight time ≈ 1.79 s, impact velocity ≈ −25.5 m/s. Compare to dropping from rest from 30 m: $t = \\sqrt{60/9.8} \\approx 2.47$ s and $v_f \\approx -24.3$ m/s. The initial downward throw shortens fall time by 0.68 s.`,
    },
  ],
  challenges: [
    {
      id: 'p1-ch2-012-ch1',
      difficulty: 'medium',
      problem: `A ball is thrown upward at $v_0 = 19.6$ m/s from ground level (up-positive). Find (a) maximum height, (b) time to reach the peak, and (c) total airtime.`,
      hint: `At maximum height, $v = 0$. Total airtime is twice the rise time by symmetry.`,
      walkthrough: [
        {
          expression: `v_f = 0\\text{ at peak} \\implies 0 = v_0^2 - 2g\\Delta y_{\\text{max}}`,
          annotation: `Use the no-time equation with the apex condition $v_f = 0$.`,
        },
        {
          expression: `\\Delta y_{\\text{max}} = \\frac{v_0^2}{2g} = \\frac{(19.6)^2}{2(9.8)} = \\frac{384.16}{19.6} = 19.6\\text{ m}`,
          annotation: `Maximum height is 19.6 m. Notice $v_0^2 / (2g)$ with $v_0 = 19.6$ m/s and $g = 9.8$ m/s² gives exactly $19.6$ m.`,
        },
        {
          expression: `t_{\\text{peak}} = \\frac{v_0}{g} = \\frac{19.6}{9.8} = 2\\text{ s}`,
          annotation: `Time to peak from $v_f = v_0 - g t$ with $v_f = 0$.`,
        },
        {
          expression: `T_{\\text{total}} = 2 t_{\\text{peak}} = 4\\text{ s}`,
          annotation: `By symmetry (no air resistance), the fall time from peak back to launch height equals the rise time. Total airtime is 4 s.`,
        },
      ],
    },
    {
      id: 'p1-ch2-012-ch2',
      difficulty: 'medium',
      problem: `An object dropped from rest hits the ground after exactly 4 s. Find (a) the height it was dropped from and (b) its impact speed.`,
      hint: `Use $\\Delta y = -\\tfrac{1}{2}g t^2$ for part (a). The negative sign means downward displacement.`,
      walkthrough: [
        {
          expression: `\\Delta y = v_0 t - \\tfrac{1}{2}g t^2 = 0 - \\tfrac{1}{2}(9.8)(16) = -78.4\\text{ m}`,
          annotation: `Displacement is $-78.4$ m, meaning the ground is 78.4 m below the drop point. The drop height is $h = 78.4$ m.`,
        },
        {
          expression: `v_f = v_0 - g t = 0 - 9.8(4) = -39.2\\text{ m/s}`,
          annotation: `Impact velocity is $-39.2$ m/s. Speed (magnitude) is 39.2 m/s ≈ 141 km/h.`,
        },
        {
          expression: `\\text{Cross-check: }v_f^2 = -2g\\Delta y = 2(9.8)(78.4) = 1536.6 \\implies |v_f| = 39.2\\text{ m/s}\\checkmark`,
          annotation: `Verify using the no-time equation. Both methods agree, confirming the answer.`,
        },
      ],
    },
    {
      id: 'p1-ch2-012-ch3',
      difficulty: 'hard',
      problem: `A stone is thrown upward from the edge of a 45-m cliff at $v_0 = 14.7$ m/s (up-positive, $g = 9.8$ m/s²). The stone eventually lands at the base of the cliff. Find (a) the time of flight and (b) the impact velocity.`,
      hint: `The stone starts at $y_0 = 45$ m and lands at $y_f = 0$. Set up $y_f = y_0 + v_0 t - \\tfrac{1}{2}g t^2 = 0$ and solve the quadratic.`,
      walkthrough: [
        {
          expression: `0 = 45 + 14.7 t - \\tfrac{1}{2}(9.8)t^2 \\implies 4.9 t^2 - 14.7 t - 45 = 0`,
          annotation: `Rearrange to standard form $4.9t^2 - 14.7t - 45 = 0$.`,
        },
        {
          expression: `t = \\frac{14.7 + \\sqrt{(14.7)^2 + 4(4.9)(45)}}{2(4.9)} = \\frac{14.7 + \\sqrt{216.09 + 882}}{9.8} = \\frac{14.7 + \\sqrt{1098.09}}{9.8}`,
          annotation: `Quadratic formula; take the positive root. $\\sqrt{1098.09} \\approx 33.1$.`,
        },
        {
          expression: `t \\approx \\frac{14.7 + 33.1}{9.8} = \\frac{47.8}{9.8} \\approx 4.88\\text{ s}`,
          annotation: `The stone is in the air for about 4.88 s — including the upward phase, descent to launch height, and the extra 45 m of fall.`,
        },
        {
          expression: `v_f = 14.7 - 9.8(4.88) \\approx 14.7 - 47.8 = -33.1\\text{ m/s}`,
          annotation: `Impact velocity is $\\approx -33.1$ m/s (downward). Note $|v_f| \\approx \\sqrt{1098} \\approx 33.1$ m/s matches, confirming the quadratic root.`,
        },
      ],
    },
  ],
  checkpoints: [
    {
      id: 'p1-ch2-012-cp1',
      question: `You solve a free-fall problem and get $v_f = -24.5$ m/s. What does the negative sign mean, and is this a valid answer?`,
      answer: `In the up-positive convention, negative velocity means the object is moving downward. This is physically valid for a falling object — the sign is information, not an error. The speed (magnitude) is 24.5 m/s.`,
    },
    {
      id: 'p1-ch2-012-cp2',
      question: `Why does mass not appear in any free-fall kinematics equation?`,
      answer: `Newton's second law gives $a = F/m$. For gravity, $F = mg$, so $a = mg/m = g$. The mass cancels because the same $m$ that resists acceleration (inertial mass) couples to gravity (gravitational mass). Free-fall acceleration is independent of mass — Galileo's insight.`,
    },
  ],
  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Dropped from rest — solve analytically',
          type: 'code',
          language: 'python',
          code: `import numpy as np

g  = 9.8    # m/s²  (magnitude)
v0 = 0.0    # m/s   (dropped from rest)
y0 = 44.1   # m     (initial height above ground)

# y(t) = y0 + v0*t - 0.5*g*t² = 0 at ground
# With v0=0: 0.5*g*t² = y0  →  t = sqrt(2*y0/g)
t_land = np.sqrt(2 * y0 / g)     # free-fall time formula
v_land = v0 - g * t_land          # SUVAT eq 1

print(f"Time to ground  : {t_land:.3f} s")
print(f"Impact velocity : {v_land:.3f} m/s  (negative = downward)")
print(f"Impact speed    : {abs(v_land):.3f} m/s")

# Cross-check using the no-time equation: v² = v0² - 2g*Δy
delta_y = -y0   # displacement is downward (negative)
v_check = -np.sqrt(v0**2 - 2*g*delta_y)  # negative root (downward)
print(f"Cross-check v_f : {v_check:.3f} m/s  ({'matches' if abs(v_check - v_land) < 1e-9 else 'MISMATCH'} ✓)")`,
          prose: [
            `Line 7: when $v_0 = 0$, the SUVAT equation $y = y_0 - \\tfrac{1}{2}gt^2 = 0$ simplifies to $t = \\sqrt{2y_0/g}$. This is the classic dropped-from-rest formula — derived here directly from SUVAT by setting $v_0 = 0$ and $y_f = 0$.`,
            `Line 8: $v_f = v_0 - gt = 0 - g \\cdot t_{\\text{land}}$. The negative result is correct — in the up-positive convention, the velocity is downward (negative) when falling. The physics is right; do not discard the sign.`,
            `Lines 15–16: the cross-check uses $v_f^2 = v_0^2 - 2g\\Delta y$ with $\\Delta y = -y_0$ (displacement is downward). Taking the negative square root gives the downward velocity. Both methods must agree — if they don't, a sign error is lurking somewhere.`,
          ],
        },
        {
          cellTitle: 'Plot y(t) and v(t) for a dropped object',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

g = 9.8; v0 = 0.0; y0 = 44.1
t_land = np.sqrt(2 * y0 / g)
t = np.linspace(0, t_land, 300)

y = y0 + v0*t - 0.5*g*t**2   # parabolic — downward opening
v = v0 - g*t                   # linear — constant slope -g

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 6), sharex=True)

ax1.plot(t, y, lw=2, color='steelblue')
ax1.axhline(0, color='k', lw=0.8, ls='--', label='ground (y=0)')
ax1.set_ylabel('Height y (m)')
ax1.set_title('Free fall from rest: y(t) and v(t)')
ax1.legend()

ax2.plot(t, v, lw=2, color='tomato')
ax2.axhline(0, color='k', lw=0.8)
ax2.fill_between(t, v, alpha=0.15, color='tomato', label=f'Area = Δy = {-y0:.1f} m')
ax2.set_xlabel('Time (s)')
ax2.set_ylabel('Velocity v (m/s)')
ax2.legend()

plt.tight_layout()
plt.show()`,
          prose: [
            `Line 8: $y(t) = y_0 - \\tfrac{1}{2}gt^2$ is a downward-opening parabola. The curvature $\\ddot y = -g < 0$ is constant and negative — the graph bends downward throughout regardless of initial velocity.`,
            `Line 9: $v(t) = -gt$ is a straight line with slope $-g = -9.8$ m/s per second. The v–t graph is always a line for free fall. The slope of this line is the acceleration.`,
            `\`fill_between\` shades the area under the v–t curve. The shaded area equals the displacement: $\\int_0^t v\\,dt = \\Delta y = -44.1$ m. This visually confirms the area-under-v–t-curve interpretation from ch2-009.`,
          ],
        },
        {
          cellTitle: 'Upward throw — peak height and total airtime',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

g  = 9.8    # m/s²
v0 = 19.6   # m/s upward (positive in up-positive convention)
y0 = 0.0    # ground level

# At peak: v = 0  →  t_peak = v0/g
t_peak  = v0 / g
y_peak  = v0*t_peak - 0.5*g*t_peak**2

# Total flight: y(t) = 0 again  →  t_total = 2*t_peak (symmetry)
t_total = 2 * t_peak
v_land  = v0 - g*t_total   # should equal -v0 (by symmetry)

print(f"Time to peak   : {t_peak:.3f} s")
print(f"Peak height    : {y_peak:.3f} m")
print(f"Total airtime  : {t_total:.3f} s")
print(f"Landing speed  : {abs(v_land):.3f} m/s  (= launch speed: {v0} m/s ✓)")

# Plot full parabolic trajectory
t = np.linspace(0, t_total, 400)
y = y0 + v0*t - 0.5*g*t**2
v = v0 - g*t

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].plot(t, y, lw=2, color='steelblue')
axes[0].axhline(0, color='k', lw=0.8, ls='--')
axes[0].scatter([t_peak], [y_peak], color='orange', zorder=5, s=80, label=f'peak {y_peak:.1f} m')
axes[0].set(xlabel='t (s)', ylabel='y (m)', title='y(t) — upward throw')
axes[0].legend()

axes[1].plot(t, v, lw=2, color='tomato')
axes[1].axhline(0, color='k', lw=0.8, ls='--', label='v=0 at peak')
axes[1].scatter([t_peak], [0], color='orange', zorder=5, s=80)
axes[1].set(xlabel='t (s)', ylabel='v (m/s)', title='v(t) — upward throw')
axes[1].legend()
plt.tight_layout(); plt.show()`,
          prose: [
            `Lines 9–10: at the peak, $v = 0$. Substituting into $v = v_0 - gt$ gives $t_{\\text{peak}} = v_0/g$. Plugging back into the position equation gives $y_{\\text{peak}} = v_0^2/(2g)$ — the maximum height formula.`,
            `Line 12: total flight time is twice the rise time. This is the symmetry property of free fall: without air resistance, the descent from the peak to the original height is the mirror image of the ascent. The landing speed equals the launch speed.`,
            `The two plots together illustrate the trajectory: y(t) is a downward-opening parabola peaking at $t_{\\text{peak}}$, and v(t) is a straight line crossing zero at the same moment. The orange dot marks the apex on both graphs simultaneously.`,
          ],
        },
        {
          cellTitle: 'Challenge — compare free fall on four planets',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np
import matplotlib.pyplot as plt

# Gravitational accelerations (m/s²)
planets = {
    'Moon':    1.62,
    'Mars':    3.72,
    'Earth':   9.80,
    'Jupiter': 24.8,
}
h = 50.0   # drop height (m)

print(f"{'Planet':<10} {'g (m/s²)':>10} {'Fall time (s)':>14} {'Impact speed (m/s)':>20}")
print("-" * 58)

for name, g in planets.items():
    # YOUR CODE: compute t_fall (time to fall h from rest) and v_impact (impact speed)
    t_fall   = ???   # hint: use t = sqrt(2h/g)
    v_impact = ???   # hint: use v = sqrt(2gh)  (magnitude only)
    print(f"{name:<10} {g:>10.2f} {t_fall:>14.3f} {v_impact:>20.3f}")

# YOUR CODE: plot fall time vs g
g_range = np.linspace(0.5, 30, 200)
t_range = ???   # fall time as a function of g_range

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(g_range, t_range, lw=2, label='t = sqrt(2h/g)')
for name, g in planets.items():
    ax.scatter(g, ???, zorder=5, s=60)   # y-coordinate = fall time for this planet
    ax.annotate(name, (g, np.sqrt(2*h/g)), textcoords='offset points', xytext=(4, 4))
ax.set(xlabel='g (m/s²)', ylabel=f'Fall time from {h} m (s)', title='Free-fall time vs gravity')
ax.legend(); plt.tight_layout(); plt.show()`,
          prose: [
            `Fill in three blanks: (1) \`t_fall = np.sqrt(2*h/g)\` — derived by setting $y_f = y_0 - \\tfrac{1}{2}gt^2 = 0$ with $v_0 = 0$; (2) \`v_impact = np.sqrt(2*g*h)\` — from $v^2 = 2g\\Delta y$; (3) \`t_range = np.sqrt(2*h/g_range)\` for the curve; (4) \`np.sqrt(2*h/g)\` for the scatter point.`,
            `The fall time scales as $t \\propto 1/\\sqrt{g}$ and the impact speed scales as $v \\propto \\sqrt{g}$. Doubling $g$ halves the fall time and increases the impact speed by $\\sqrt{2}$. The Moon's low gravity means objects fall 2.5× more slowly than on Earth.`,
            `Expected output: Moon ≈ 7.87 s fall time and 12.9 m/s impact; Earth ≈ 3.19 s and 31.3 m/s; Jupiter ≈ 2.01 s and 49.7 m/s. The plot shows a steep inverse-square-root curve.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Dropped from rest — solve analytically',
          type: 'code',
          language: 'matlab',
          code: `%% Free fall from rest
g  = 9.8;    % m/s²
v0 = 0;      % m/s  (dropped from rest)
y0 = 44.1;   % m    (initial height)

% t = sqrt(2*y0/g) — from y = y0 - 0.5*g*t² = 0 with v0=0
t_land = sqrt(2 * y0 / g);
v_land = v0 - g * t_land;    % SUVAT eq 1

fprintf('Time to ground  : %.3f s\\n', t_land)
fprintf('Impact velocity : %.3f m/s  (negative = downward)\\n', v_land)
fprintf('Impact speed    : %.3f m/s\\n', abs(v_land))

%% Cross-check with no-time equation: v² = v0² - 2g*Δy
delta_y  = -y0;    % downward displacement (negative)
v_check  = -sqrt(v0^2 - 2*g*delta_y);   % negative root (downward)
fprintf('Cross-check v_f : %.3f m/s\\n', v_check)`,
          prose: [
            `MATLAB's \`sqrt\` function works identically to Python's \`np.sqrt\`. The formula $t = \\sqrt{2y_0/g}$ comes directly from setting $y_0 - \\tfrac{1}{2}gt^2 = 0$ with $v_0 = 0$ and solving for $t$.`,
            `\`v_land = v0 - g * t_land\` applies SUVAT equation 1. The result is negative, confirming the object moves downward (up-positive convention). In MATLAB, \`abs()\` extracts the magnitude — identical to Python.`,
            `The cross-check uses \`delta_y = -y0\` to represent downward displacement. Taking the negative square root of \`v0^2 - 2*g*delta_y\` selects the downward (negative) velocity. Both methods must print the same number.`,
          ],
        },
        {
          cellTitle: 'Plot y(t) and v(t) for a dropped object',
          type: 'code',
          language: 'matlab',
          code: `%% Parameters
g = 9.8; v0 = 0; y0 = 44.1;
t_land = sqrt(2*y0/g);
t = linspace(0, t_land, 300);

y = y0 + v0*t - 0.5*g*t.^2;   % parabolic — element-wise .^
v = v0 - g*t;                   % linear

%% Plot
figure('Position', [100 100 700 550])

subplot(2,1,1)
plot(t, y, 'b-', 'LineWidth', 2)
yline(0, 'k--', 'ground', 'LineWidth', 0.8)
ylabel('Height y (m)')
title('Free fall from rest: y(t) and v(t)')

subplot(2,1,2)
plot(t, v, 'r-', 'LineWidth', 2)
yline(0, 'k-', 'LineWidth', 0.8)
area(t, v, 'FaceAlpha', 0.15, 'FaceColor', 'r')
xlabel('Time (s)'); ylabel('Velocity v (m/s)')
legend(sprintf('area = Δy = %.1f m', -y0), 'Location', 'southwest')
tight_layout`,
          prose: [
            `\`t.^2\` uses the element-wise exponentiation operator. Without the dot, \`t^2\` would attempt matrix squaring (outer product), which fails for a row vector — a common MATLAB error.`,
            `\`yline(0, 'k--', 'ground')\` draws a horizontal reference line at $y = 0$ (the ground) with a label. This is MATLAB's equivalent of \`plt.axhline\`.`,
            `\`area(t, v, ...)\` shades the region under the v–t curve, visualizing $\\int v\\,dt = \\Delta y$. The shaded area equals the total displacement ($-44.1$ m) — the area-under-curve connection between velocity and displacement.`,
          ],
        },
        {
          cellTitle: 'Upward throw — peak height and total airtime',
          type: 'code',
          language: 'matlab',
          code: `%% Parameters
g  = 9.8;    % m/s²
v0 = 19.6;   % m/s upward
y0 = 0;      % ground level

%% Solve
t_peak  = v0 / g;
y_peak  = v0*t_peak - 0.5*g*t_peak^2;
t_total = 2 * t_peak;
v_land  = v0 - g*t_total;

fprintf('Time to peak   : %.3f s\\n', t_peak)
fprintf('Peak height    : %.3f m\\n', y_peak)
fprintf('Total airtime  : %.3f s\\n', t_total)
fprintf('Landing speed  : %.3f m/s (= launch speed %.1f m/s)\\n', abs(v_land), v0)

%% Plot
t = linspace(0, t_total, 400);
y = y0 + v0*t - 0.5*g*t.^2;
v = v0 - g*t;

figure('Position', [100 100 900 400])
subplot(1,2,1)
plot(t, y, 'b-', 'LineWidth', 2); hold on
scatter(t_peak, y_peak, 80, 'orange', 'filled')
yline(0,'k--'); ylabel('y (m)'); xlabel('t (s)')
title('y(t) — upward throw'); grid on

subplot(1,2,2)
plot(t, v, 'r-', 'LineWidth', 2); hold on
scatter(t_peak, 0, 80, 'orange', 'filled')
yline(0,'k--','v=0 at peak'); ylabel('v (m/s)'); xlabel('t (s)')
title('v(t) — upward throw'); grid on
tight_layout`,
          prose: [
            `\`t_peak = v0/g\` comes from setting $v_f = 0$ in $v_f = v_0 - gt$. MATLAB scalar operations work identically to Python — no dots needed for scalar division.`,
            `\`t_total = 2*t_peak\` encodes the symmetry of free fall. The descent from the peak back to the launch height takes exactly as long as the ascent. This is only true when landing at the same height as the launch point.`,
            `The orange scatter points mark the apex at $(t_{\\text{peak}}, y_{\\text{peak}})$ on the y–t graph and at $(t_{\\text{peak}}, 0)$ on the v–t graph. Both graphs show the same physical moment — maximum height corresponds exactly to zero velocity.`,
          ],
        },
        {
          cellTitle: 'Challenge — free fall on multiple planets',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `%% Free fall from h = 50 m on four planets
h = 50;   % m

planet_names = {'Moon', 'Mars', 'Earth', 'Jupiter'};
g_vals       = [1.62,   3.72,   9.80,   24.8];

fprintf('%-10s %10s %14s %20s\\n', 'Planet', 'g (m/s²)', 'Fall time (s)', 'Impact speed (m/s)')
fprintf('%s\\n', repmat('-', 1, 58))

t_falls = zeros(1, numel(g_vals));
for k = 1:numel(g_vals)
    g = g_vals(k);
    % YOUR CODE: compute t_fall and v_impact
    t_fall   = ???;   % hint: sqrt(2*h/g)
    v_impact = ???;   % hint: sqrt(2*g*h)
    t_falls(k) = t_fall;
    fprintf('%-10s %10.2f %14.3f %20.3f\\n', planet_names{k}, g, t_fall, v_impact)
end

%% YOUR CODE: plot fall time vs g
g_range = linspace(0.5, 30, 200);
t_range = ???;   % vectorized: sqrt(2*h./g_range)

figure
plot(g_range, t_range, 'b-', 'LineWidth', 2); hold on
scatter(g_vals, t_falls, 60, 'red', 'filled')
for k = 1:numel(g_vals)
    text(g_vals(k)+0.3, t_falls(k), planet_names{k})
end
xlabel('g (m/s²)'); ylabel(sprintf('Fall time from %g m (s)', h))
title('Free-fall time vs gravitational acceleration')
grid on`,
          prose: [
            `Fill in three blanks: (1) \`t_fall = sqrt(2*h/g)\`; (2) \`v_impact = sqrt(2*g*h)\`; (3) \`t_range = sqrt(2*h./g_range)\` — note the element-wise \`./\` for dividing an array by each value of \`g_range\`.`,
            `MATLAB's \`cell array\` syntax (\`{}\`) stores strings. Index with \`planet_names{k}\` (curly braces) to retrieve the $k$-th string. \`fprintf('%-10s', ...)\` left-aligns a string in a 10-character field for formatted table output.`,
            `Expected: Moon ≈ 7.87 s, Mars ≈ 5.18 s, Earth ≈ 3.19 s, Jupiter ≈ 2.01 s. The hyperbolic curve $t = \\sqrt{2h/g}$ is steep at low $g$ and flattens at high $g$ — compare it to the four labeled points.`,
          ],
        },
      ],
    },
  },
  quiz: [
    {
      id: 'p1-ch2-012-q1',
      type: 'choice',
      question: `Near Earth's surface (ignoring air resistance), what is the free-fall acceleration?`,
      options: [`9.8 m/s upward`, `9.8 m/s² downward`, `Depends on mass`, `Zero at the apex`],
      answer: `9.8 m/s² downward`,
      hints: [
        `Free fall means only gravity acts. What does gravity always do near Earth's surface?`,
        `Note: the acceleration is never zero during free fall — not even at the apex.`,
      ],
      reviewSection: 'intuition',
      explanation: `$g \\approx 9.8$ m/s² directed downward. It is independent of mass (Galileo's insight) and is constant throughout the fall (for moderate heights).`,
    },
    {
      id: 'p1-ch2-012-q2',
      type: 'choice',
      question: `With up = positive convention, what is $a$ in free fall?`,
      options: [`+9.8 m/s²`, `−9.8 m/s²`, `0`, `Depends on initial velocity`],
      answer: `−9.8 m/s²`,
      hints: [
        `Gravity acts downward. In the up-positive convention, downward is the negative direction.`,
        `$a = -g$. The minus sign is from the convention, not from the physics.`,
      ],
      reviewSection: 'math',
      explanation: `When up is positive, gravity (acting downward) gives $a = -g = -9.8$ m/s². The sign is determined by the convention, not by physics.`,
    },
    {
      id: 'p1-ch2-012-q3',
      type: 'choice',
      question: `An object is dropped from rest. After 3 s, what is its velocity (up = positive, $g = 9.8$ m/s²)?`,
      options: [`+29.4 m/s`, `−29.4 m/s`, `−44.1 m/s`, `0`],
      answer: `−29.4 m/s`,
      hints: [
        `Use $v = v_0 - gt$ with $v_0 = 0$.`,
        `The velocity is downward, so it should be negative in the up-positive convention.`,
      ],
      reviewSection: 'examples',
      explanation: `$v = 0 - 9.8(3) = -29.4$ m/s. Negative confirms downward motion.`,
    },
    {
      id: 'p1-ch2-012-q4',
      type: 'choice',
      question: `An object dropped from rest falls for 3 s. What is its displacement (up = positive, $g = 9.8$ m/s²)?`,
      options: [`−44.1 m`, `+44.1 m`, `−29.4 m`, `−88.2 m`],
      answer: `−44.1 m`,
      hints: [
        `Use $\\Delta y = v_0 t - \\tfrac{1}{2}g t^2$ with $v_0 = 0$.`,
        `$\\tfrac{1}{2}(9.8)(9) = ?$. Is the displacement positive or negative?`,
      ],
      reviewSection: 'examples',
      explanation: `$\\Delta y = 0 - \\tfrac{1}{2}(9.8)(9) = -44.1$ m. The object moved 44.1 m downward.`,
    },
    {
      id: 'p1-ch2-012-q5',
      type: 'choice',
      question: `A ball is thrown upward at 19.6 m/s. What is the maximum height reached above the launch point?`,
      options: [`9.8 m`, `19.6 m`, `39.2 m`, `4.9 m`],
      answer: `19.6 m`,
      hints: [
        `At the peak, $v = 0$. Use $v^2 = v_0^2 - 2g\\Delta y$ with $v = 0$.`,
        `$\\Delta y = v_0^2 / (2g)$. Compute $(19.6)^2 / (2 \\times 9.8)$.`,
      ],
      reviewSection: 'challenges',
      explanation: `$0 = (19.6)^2 - 2(9.8)\\Delta y \\Rightarrow \\Delta y = 384.16/19.6 = 19.6$ m.`,
    },
    {
      id: 'p1-ch2-012-q6',
      type: 'choice',
      question: `A ball is thrown upward at 19.6 m/s. How long does it take to reach the peak?`,
      options: [`1 s`, `2 s`, `3 s`, `4 s`],
      answer: `2 s`,
      hints: [
        `At the peak, $v = 0$. Use $v = v_0 - gt$ and set $v = 0$.`,
        `$t_{\\text{peak}} = v_0 / g = 19.6 / 9.8 = ?$`,
      ],
      reviewSection: 'challenges',
      explanation: `$0 = 19.6 - 9.8t \\Rightarrow t = 19.6/9.8 = 2$ s.`,
    },
    {
      id: 'p1-ch2-012-q7',
      type: 'choice',
      question: `A ball is thrown upward, rises, and lands back at the same height. If it took 2 s to reach the peak, what is the total flight time?`,
      options: [`2 s`, `4 s`, `6 s`, `8 s`],
      answer: `4 s`,
      hints: [
        `By symmetry, the fall from peak back to launch height takes as long as the rise.`,
        `Total time = rise time + fall time = $t_{\\text{peak}} + t_{\\text{peak}}$.`,
      ],
      reviewSection: 'challenges',
      explanation: `Symmetry of free fall: total airtime $= 2 t_{\\text{peak}} = 2 \\times 2 = 4$ s.`,
    },
    {
      id: 'p1-ch2-012-q8',
      type: 'choice',
      question: `A feather and a cannonball are both dropped simultaneously on the Moon (no atmosphere). Which hits the ground first?`,
      options: [
        `The cannonball — it is heavier`,
        `The feather — it has less mass to accelerate`,
        `They land at exactly the same time`,
        `Impossible to say without knowing heights`,
      ],
      answer: `They land at exactly the same time`,
      hints: [
        `With no atmosphere, there is no air resistance. What determines free-fall acceleration?`,
        `Does mass appear in the free-fall acceleration formula $a = g$?`,
      ],
      reviewSection: 'intuition',
      explanation: `In free fall, $a = g$ regardless of mass. With no atmosphere on the Moon, both objects fall with $g_{\\text{Moon}} \\approx 1.62$ m/s² and land simultaneously.`,
    },
    {
      id: 'p1-ch2-012-q9',
      type: 'choice',
      question: `An object is dropped from rest and hits the ground with a speed of 29.4 m/s. From what height was it dropped? ($g = 9.8$ m/s²)`,
      options: [`22.05 m`, `44.1 m`, `88.2 m`, `15 m`],
      answer: `44.1 m`,
      hints: [
        `Use $v^2 = v_0^2 - 2g\\Delta y$ with $v_0 = 0$ and $v_f = 29.4$ m/s (take magnitude).`,
        `$h = v^2 / (2g) = (29.4)^2 / (2 \\times 9.8) = ?$`,
      ],
      reviewSection: 'examples',
      explanation: `$h = v^2/(2g) = (29.4)^2 / (2 \\times 9.8) = 864.36 / 19.6 = 44.1$ m.`,
    },
    {
      id: 'p1-ch2-012-q10',
      type: 'choice',
      question: `At the apex of a ball's flight (thrown upward), which statement is true?`,
      options: [
        `Both velocity and acceleration are zero`,
        `Velocity is zero and acceleration is $-g$ (up-positive)`,
        `Velocity is at its maximum and acceleration is zero`,
        `Velocity is $v_0$ and acceleration is $-g$`,
      ],
      answer: `Velocity is zero and acceleration is $-g$ (up-positive)`,
      hints: [
        `At the peak, the ball stops moving upward. What is the velocity at that instant?`,
        `Has gravity stopped pulling? What is $a$ at every point during free fall?`,
      ],
      reviewSection: 'intuition',
      explanation: `At the apex, $v = 0$ (the ball momentarily stops). But gravity never turns off — $a = -g = -9.8$ m/s² throughout the entire flight, including at the apex. This is a common misconception: zero velocity does not mean zero acceleration.`,
    },
  ],
  misconceptions: [
    {
      id: 'p1-ch2-012-m1',
      misconception: `"At the apex of the throw, the acceleration is zero because the velocity is zero."`,
      correction: `Acceleration is the rate of change of velocity, not its value. At the apex, velocity happens to be zero, but it is changing (from positive to negative) at a rate of $-9.8$ m/s² — so the acceleration is definitely not zero. Gravity never switches off.`,
      correctionExample: `If $a = 0$ at the apex, the ball would stay there forever (Newton's first law: no net force means no change in motion). But the ball always falls back down, proving $a = -g$ even at the apex.`,
    },
    {
      id: 'p1-ch2-012-m2',
      misconception: `"A heavier object falls faster because gravity pulls harder on it."`,
      correction: `Gravity does pull harder on a heavier object ($F = mg$), but Newton's second law says $a = F/m = mg/m = g$. The extra force is exactly offset by the extra inertia. Every object in free fall has the same acceleration regardless of mass.`,
      correctionExample: `A 10 kg ball has 10 times more gravitational force than a 1 kg ball, but also 10 times more inertia. The ratio $a = F/m = 10mg/(10m) = g$ is identical. Drop them simultaneously and they hit the ground at the same time.`,
    },
  ],
  transferPrompts: [
    {
      id: 'p1-ch2-012-tp1',
      prompt: `A skydiver in terminal velocity (constant speed, no net acceleration) is still in "free fall" in the colloquial sense but NOT in the physics sense. What force is balancing gravity, and how does this change the equations of motion?`,
    },
    {
      id: 'p1-ch2-012-tp2',
      prompt: `On Mars ($g = 3.72$ m/s²), an astronaut drops a rock from a 10-m tower. How much longer does the rock take to land compared to Earth? What does this tell you about how mission design would differ on Mars?`,
    },
  ],
  debugging: [
    {
      id: 'p1-ch2-012-d1',
      buggyWork: `A student solves: "Ball thrown upward at 15 m/s. Using up-positive, $a = +9.8$ m/s²." They compute $t_{\\text{peak}} = v_0/a = 15/9.8 \\approx 1.53$ s and $y_{\\text{peak}} = 11.5$ m.`,
      question: `What error did the student make, and what is the correct peak height?`,
      answer: `The student used $a = +9.8$ m/s² (down-positive convention for $a$) but used $v_0 = +15$ m/s (up-positive for initial velocity). The conventions were mixed. In up-positive: $a = -9.8$ m/s². Correct: $t_{\\text{peak}} = 15/9.8 \\approx 1.53$ s (same) but $y_{\\text{peak}} = v_0^2/(2g) = 225/19.6 \\approx 11.5$ m (same result, but only by coincidence here — the formula $v_0^2/(2g)$ uses the magnitude $g$, so the sign of $a$ doesn't affect this particular computation). The real risk is in the displacement equation: with $a = +9.8$, $y = v_0 t + \\tfrac{1}{2}(9.8)t^2$ would predict the ball moves higher forever. The student must use $a = -9.8$ m/s² in $y = v_0 t - \\tfrac{1}{2}gt^2$ for correct time evolution.`,
    },
    {
      id: 'p1-ch2-012-d2',
      buggyWork: `A student writes: "An object dropped from 80 m. Find time to land. $80 = \\tfrac{1}{2}(9.8)t^2$, so $t = \\sqrt{80/4.9} \\approx 4.04$ s." Then for impact speed: "$ v = 9.8 \\times 4.04 \\approx 39.6$ m/s."`,
      question: `Is the student's approach correct? Check both answers.`,
      answer: `The work is correct. $t = \\sqrt{2h/g} = \\sqrt{160/9.8} \\approx 4.04$ s. Impact speed $= gt = 9.8 \\times 4.04 \\approx 39.6$ m/s. The student implicitly used down-positive (treating $y = \\tfrac{1}{2}gt^2 = 80$ with positive $g$ and positive displacement), which is a valid convention applied consistently. The answers are physically correct.`,
    },
  ],
  mastery: {
    targetLevel: `Apply the four free-fall SUVAT equations with correct sign conventions to find time, velocity, height, or initial conditions for objects dropped, thrown upward, or thrown downward — for any combination of known and unknown quantities.`,
    coreSkill: `Assigning signs correctly before writing any equation: $a = -g$ (up-positive) or $a = +g$ (down-positive), applied consistently to all velocities and positions in the problem.`,
    commonSticking: `Forgetting that acceleration is $-g$ even at the apex (when $v = 0$). The sign on $a$ is determined by the axis convention, not by the direction of motion or the value of $v$.`,
    connections: [
      `ch2-008 (SUVAT equations) — free fall uses all four equations with $a$ replaced by $\\pm g$`,
      `ch2-010 (multi-phase worked examples) — upward throw is a two-phase problem: rising phase then falling phase`,
      `ch2-013 (free-fall symmetry) — explores the apex symmetry and why rise time equals fall time`,
      `ch4 (projectile motion) — free fall governs the vertical component; horizontal is inertial`,
    ],
  },
  semantics: {
    core: [
      { symbol: `g`, meaning: `Magnitude of gravitational acceleration near Earth's surface; $g \\approx 9.8$ m/s² (always positive)` },
      { symbol: `a`, meaning: `Signed acceleration in the chosen axis; equals $-g$ (up-positive) or $+g$ (down-positive)` },
      { symbol: `y_0`, meaning: `Initial position; set to launch height above chosen reference (often $y_0 = 0$ for ground-level launch)` },
      { symbol: `v_0`, meaning: `Initial velocity; positive means upward (up-positive convention), negative means downward` },
      { symbol: `t_{\\text{peak}}`, meaning: `Time to reach maximum height from launch; equals $v_0/g$ when thrown upward from any height` },
    ],
    rulesOfThumb: [
      `State your axis convention at the start of every free-fall problem. Never switch conventions mid-solution.`,
      `$a = \\pm g$ throughout the entire flight — even at the apex. Zero velocity never means zero acceleration.`,
      `At the apex: $v = 0$, use $t_{\\text{peak}} = v_0/g$ and $\\Delta y_{\\text{max}} = v_0^2/(2g)$.`,
      `Impact speed when landing at launch height equals launch speed (no energy is lost to gravity alone).`,
      `Negative displacement means the object is below its starting point; negative velocity means it is moving downward (in up-positive).`,
    ],
  },
};

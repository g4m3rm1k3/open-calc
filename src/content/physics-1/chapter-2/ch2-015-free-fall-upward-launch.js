export default {
  id: 'p1-ch2-015',
  slug: 'free-fall-upward-launch',
  chapter: 'p1',
  order: 15,
  title: "Free Fall: Upward Launch",
  subtitle: "Analyze rise, apex, and descent after an upward throw.",
  tags: ["upward throw", "apex", "free fall"],
  aliases: "vertical launch upward throw apex maximum height",
  hook: {
    question: "How high does it go, and how long until it returns?",
    realWorldContext:
      "Projectile prediction in sports and safety engineering starts with this idealized vertical model. A basketball free throw, a fireworks shell, and a safety drop-test all use the same equations.",
    previewVisualizationId: 'SVGDiagram',
  },
  intuition: {
    prose: [
      `Before reading on, predict: a ball is thrown straight up at 20 m/s. At the highest point, what are the velocity and acceleration? Many students say both are zero at the top. Think carefully about whether that makes sense physically — if the acceleration were zero at the apex, what would happen next?`,
      `An upward launch is not two separate problems (going up, then coming down) — it is one continuous trajectory governed by a single, unchanging acceleration $a = -g$ throughout. The object decelerates on the way up, momentarily stops at the apex, then accelerates downward. At no point does acceleration pause or reverse.`,
      `The apex is a velocity event, not an acceleration event. At the top, $v = 0$ (instantaneously at rest) but $a = -9.8$ m/s² (still pulling downward). This non-zero acceleration is precisely what causes the ball to start falling immediately after reaching the top. If $a$ were zero at the apex, the ball would hover indefinitely.`,
      `The two most useful apex results follow directly from substituting $v = 0$ into the standard equations: $t_{\\text{peak}} = v_0/g$ (from $v = v_0 - gt$) and $h_{\\text{max}} = v_0^2/(2g)$ (from $v^2 = v_0^2 - 2g\\Delta y$). Notice that $h_{\\text{max}}$ scales as the square of $v_0$ — doubling the launch speed quadruples the maximum height.`,
      `After the apex, the object is in standard free fall: starts from rest at the peak height and accelerates downward at $g$. The descent phase of the upward-launch problem is exactly the dropped-from-rest problem from ch2-012, just with a different starting height.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Upward-launch problem template',
        body: `1. Assign: $v_0 > 0$ (upward), $a = -g = -9.8$ m/s² (up-positive).\n2. Apex: set $v = 0$ to find $t_{\\text{peak}} = v_0/g$ and $h_{\\text{max}} = v_0^2/(2g)$.\n3. Return to launch height: $T_{\\text{total}} = 2v_0/g$ by symmetry; return speed = $v_0$.\n4. If the ball lands below or above launch height: use the full quadratic $y = y_0 + v_0 t - \\tfrac{1}{2}gt^2 = y_f$ and solve for $t$.`,
      },
      {
        type: 'insight',
        title: 'Apex ≠ equilibrium',
        body: `At the apex, $v = 0$ but $a = -g \\neq 0$. Zero velocity is not the same as equilibrium. Equilibrium requires zero net force, which would mean no gravity — physically impossible near Earth. The apex is a momentary stop, not a rest state.`,
      },
      {
        type: 'warning',
        title: 'Height quadruples when launch speed doubles',
        body: `$h_{\\text{max}} = v_0^2/(2g)$ is quadratic in $v_0$. To reach 4× the height, you need only 2× the launch speed. To reach 9× the height, you need 3× the speed. This non-linear scaling is why slight variations in launch speed have large effects on range in athletics.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-fall-axes' },
        title: 'Upward launch: v₀ > 0, a = −g',
        caption: 'v₀ is positive (upward). a = −9.8 m/s² (downward, always). The object decelerates, reaches apex where v = 0, then accelerates downward. The sign of v changes at the apex; the sign of a never does.',
      },
    ],
  },
  math: {
    prose: [
      `For an upward launch from position $y_0$ with initial speed $v_0$ (up-positive), the three most-used relations are: $v = v_0 - gt$ (velocity at time $t$), $y = y_0 + v_0 t - \\tfrac{1}{2}gt^2$ (position at time $t$), and $v^2 = v_0^2 - 2g(y - y_0)$ (velocity at position $y$, no $t$ needed).`,
      `The apex condition $v = 0$ applied to each equation yields the two key results: $t_{\\text{peak}} = v_0/g$ and $h_{\\text{max}} = v_0^2/(2g)$. These are not separate formulas to memorize — they are what you get when you substitute $v = 0$ into the standard equations. This derivation should be automatic.`,
      `When the ball must land at a height different from $y_0$ (e.g., on a cliff, through a window, or at ground level from an elevated platform), use the quadratic $y_f = y_0 + v_0 t - \\tfrac{1}{2}gt^2$. Rearrange to $\\tfrac{1}{2}gt^2 - v_0 t + (y_f - y_0) = 0$ and apply the quadratic formula; take the positive root.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Apex results (up-positive, launched from $y_0$)',
        body: `t_{\\text{peak}} = \\frac{v_0}{g},\\qquad h_{\\text{max}} = y_0 + \\frac{v_0^2}{2g}`,
      },
      {
        type: 'insight',
        title: 'When to use each equation',
        body: `If a problem does NOT mention time, use $v^2 = v_0^2 - 2g\\Delta y$ — it skips $t$ entirely. If it mentions time, use $v = v_0 - gt$ and/or $y = y_0 + v_0 t - \\tfrac{1}{2}gt^2$.`,
      },
    ],
  },
  rigor: {
    prose: [
      `The upward-launch equations are the same constant-acceleration SUVAT family with $a = -g$. The apex results follow by substitution, not by separate derivation: from $v = v_0 - gt$ with $v = 0$, $t_{\\text{peak}} = v_0/g$. Substituting into $y = v_0 t - \\tfrac{1}{2}gt^2$ gives $y_{\\text{max}} = v_0(v_0/g) - \\tfrac{1}{2}g(v_0/g)^2 = v_0^2/g - v_0^2/(2g) = v_0^2/(2g)$.`,
      `The scaling $h_{\\text{max}} \\propto v_0^2$ is fundamental: it reflects that kinetic energy $\\tfrac{1}{2}mv_0^2$ is completely converted to potential energy $mgh_{\\text{max}}$ at the apex. This energy-based derivation gives the same result and connects kinematics to the energy chapter: $h_{\\text{max}} = v_0^2/(2g)$ is just the work-energy theorem with $mgh = \\tfrac{1}{2}mv^2$.`,
      `The symmetry property from ch2-013 applies fully here: for a ball that returns to its launch height, total flight time is $T = 2v_0/g$ and the return speed equals $v_0$. These are direct consequences of the constant-acceleration, time-symmetric trajectory, not separate facts.`,
      `In a full two-dimensional projectile (chapter 4), the vertical component of motion is exactly this upward-launch analysis: $v_y = v_0 \\sin\\theta - gt$, $y = v_0 \\sin\\theta \\cdot t - \\tfrac{1}{2}gt^2$, with $v_0 \\sin\\theta$ replacing $v_0$ throughout. Mastering the 1D case now means the 2D case is just a notation change.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Apex height derivation',
        body: `v = 0 \\text{ at apex} \\implies t_{\\text{peak}} = \\frac{v_0}{g},\\quad h_{\\text{max}} = v_0 \\cdot \\frac{v_0}{g} - \\frac{1}{2}g\\left(\\frac{v_0}{g}\\right)^2 = \\frac{v_0^2}{2g}`,
      },
    ],
  },
  examples: [
    {
      id: 'p1-ch2-015-ex1',
      title: 'Max height and full trajectory summary',
      problem: `A ball is launched upward at $v_0 = 14$ m/s from ground level (up-positive, $g = 9.8$ m/s²). Find (a) maximum height, (b) time to apex, (c) total airtime, and (d) velocity at $t = 2$ s.`,
      steps: [
        {
          expression: `h_{\\text{max}} = \\frac{v_0^2}{2g} = \\frac{196}{19.6} = 10\\text{ m}`,
          annotation: `Apply the apex height formula. Since $v_0 = 14$ m/s, $v_0^2 = 196$ m²/s².`,
        },
        {
          expression: `t_{\\text{peak}} = \\frac{v_0}{g} = \\frac{14}{9.8} \\approx 1.43\\text{ s}`,
          annotation: `Time to the apex from $v = 0$ in $v = v_0 - gt$.`,
        },
        {
          expression: `T_{\\text{total}} = 2 t_{\\text{peak}} \\approx 2.86\\text{ s}`,
          annotation: `By symmetry (landing at same height as launch), total flight time is double the apex time.`,
        },
        {
          expression: `v(2) = 14 - 9.8(2) = 14 - 19.6 = -5.6\\text{ m/s}`,
          annotation: `At $t = 2$ s (which is after the apex at 1.43 s), the ball is moving downward — consistent with the negative sign.`,
        },
      ],
      conclusion: `Max height 10 m, apex at 1.43 s, lands at 2.86 s with speed 14 m/s. At $t = 2$ s the ball is falling at 5.6 m/s.`,
    },
    {
      id: 'p1-ch2-015-ex2',
      title: 'Ball thrown from an elevated platform',
      problem: `A ball is thrown upward at $v_0 = 10$ m/s from a platform 15 m above the ground. Find when it hits the ground and its impact speed.`,
      steps: [
        {
          expression: `y_0 = 15\\text{ m},\\quad v_0 = +10\\text{ m/s},\\quad a = -9.8\\text{ m/s}^2,\\quad y_f = 0`,
          annotation: `Set up with up-positive: platform is 15 m above ground ($y_f = 0$).`,
        },
        {
          expression: `0 = 15 + 10t - \\tfrac{1}{2}(9.8)t^2 \\implies 4.9t^2 - 10t - 15 = 0`,
          annotation: `Rearrange to standard quadratic form.`,
        },
        {
          expression: `t = \\frac{10 + \\sqrt{100 + 4(4.9)(15)}}{9.8} = \\frac{10 + \\sqrt{394}}{9.8} \\approx \\frac{10 + 19.85}{9.8} \\approx 3.05\\text{ s}`,
          annotation: `Quadratic formula; take positive root. The ball is in the air for about 3.05 s.`,
        },
        {
          expression: `v_f = 10 - 9.8(3.05) \\approx -19.9\\text{ m/s}`,
          annotation: `Impact velocity is about $-19.9$ m/s (downward). Speed ≈ 19.9 m/s — much larger than the 10 m/s launch speed because the ball gained extra speed falling from 15 m above the ground.`,
        },
      ],
      conclusion: `Flight time ≈ 3.05 s; impact speed ≈ 19.9 m/s. The extra height above the ground means the ball falls farther than it rose, gaining more than the launch speed on impact.`,
    },
    {
      id: 'p1-ch2-015-ex3',
      title: 'Find launch speed given maximum height',
      problem: `A safety engineer needs a component to reach exactly 12.5 m above its launch point. What launch speed is required?`,
      steps: [
        {
          expression: `h_{\\text{max}} = \\frac{v_0^2}{2g} = 12.5\\text{ m}`,
          annotation: `Set the apex height formula equal to the required height.`,
        },
        {
          expression: `v_0^2 = 2g \\cdot h_{\\text{max}} = 2(9.8)(12.5) = 245\\text{ m}^2/\\text{s}^2`,
          annotation: `Solve for $v_0^2$.`,
        },
        {
          expression: `v_0 = \\sqrt{245} \\approx 15.65\\text{ m/s}`,
          annotation: `Take the positive square root. A launch speed of about 15.65 m/s will deliver exactly 12.5 m apex height.`,
        },
        {
          expression: `\\text{Check: }h = \\frac{(15.65)^2}{2(9.8)} = \\frac{244.9}{19.6} \\approx 12.5\\text{ m}\\checkmark`,
          annotation: `Verify by substituting back.`,
        },
      ],
      conclusion: `Required launch speed is $\\sqrt{2g \\cdot h} = \\sqrt{245} \\approx 15.65$ m/s. This is the inverse of the apex formula — solving for $v_0$ given $h_{\\text{max}}$.`,
    },
  ],
  challenges: [
    {
      id: 'p1-ch2-015-ch1',
      difficulty: 'medium',
      problem: `A ball is thrown upward from a rooftop 20 m above the ground. The ball reaches a maximum height of 5 m above the rooftop. Find (a) the launch speed, (b) the time to the apex, and (c) the impact speed when it hits the ground.`,
      hint: `The apex height is measured from the launch point (rooftop), not the ground. For part (c), use the no-time equation with $\\Delta y = -(20 + 5) = -25$ m from apex to ground, or track absolute positions.`,
      walkthrough: [
        {
          expression: `h_{\\text{max}} = 5\\text{ m (above rooftop)} \\implies v_0 = \\sqrt{2gh} = \\sqrt{2(9.8)(5)} = \\sqrt{98} \\approx 9.9\\text{ m/s}`,
          annotation: `Invert the apex formula: $v_0 = \\sqrt{2g h_{\\text{max}}}$.`,
        },
        {
          expression: `t_{\\text{peak}} = \\frac{v_0}{g} = \\frac{9.9}{9.8} \\approx 1.01\\text{ s}`,
          annotation: `Time from rooftop to apex.`,
        },
        {
          expression: `y_{\\text{apex}} = 20 + 5 = 25\\text{ m (absolute, above ground)}`,
          annotation: `The apex is 25 m above the ground (20 m of building + 5 m of rise).`,
        },
        {
          expression: `v_f^2 = 0 - 2g(-25) = 2(9.8)(25) = 490 \\implies |v_f| = \\sqrt{490} \\approx 22.1\\text{ m/s}`,
          annotation: `From apex (speed = 0) to ground ($\\Delta y = -25$ m from apex), use the no-time equation.`,
        },
      ],
    },
    {
      id: 'p1-ch2-015-ch2',
      difficulty: 'medium',
      problem: `A ball thrown upward passes a window 6 m above the launch point on the way up. Two seconds later, it passes the same window on the way down. Find the launch speed.`,
      hint: `Set up $y = v_0 t - \\tfrac{1}{2}gt^2 = 6$ m. The two solutions differ by 2 s: $t_2 - t_1 = 2$ s. Use Vieta's formulas on the quadratic roots.`,
      walkthrough: [
        {
          expression: `v_0 t - 4.9 t^2 = 6 \\implies 4.9t^2 - v_0 t + 6 = 0`,
          annotation: `Rearrange to standard form. The two roots $t_1$ and $t_2$ are the times the ball is at 6 m.`,
        },
        {
          expression: `t_1 + t_2 = \\frac{v_0}{4.9},\\quad t_1 \\cdot t_2 = \\frac{6}{4.9}`,
          annotation: `Vieta's formulas: sum of roots = $b/a$ (with sign change), product = $c/a$. Sum gives $t_1 + t_2 = v_0/4.9$.`,
        },
        {
          expression: `t_2 - t_1 = 2\\text{ s (given)} \\implies (t_2 - t_1)^2 = (t_2 + t_1)^2 - 4t_1 t_2`,
          annotation: `Use the algebraic identity to relate sum/difference/product of roots.`,
        },
        {
          expression: `4 = \\left(\\frac{v_0}{4.9}\\right)^2 - 4\\cdot\\frac{6}{4.9} \\implies \\frac{v_0^2}{24.01} = 4 + \\frac{24}{4.9} \\approx 4 + 4.898 = 8.898`,
          annotation: `Substitute and solve for $v_0^2$.`,
        },
        {
          expression: `v_0^2 = 8.898 \\times 24.01 \\approx 213.6 \\implies v_0 \\approx 14.6\\text{ m/s}`,
          annotation: `Launch speed is approximately 14.6 m/s. This is a clever application of Vieta's formulas to avoid solving the full quadratic.`,
        },
      ],
    },
    {
      id: 'p1-ch2-015-ch3',
      difficulty: 'hard',
      problem: `A ball is thrown upward at $v_0 = 20$ m/s. A second ball is dropped from rest at height $H$ at the same instant. The two balls collide at the apex of the first ball's trajectory. Find $H$.`,
      hint: `The first ball's apex is at $h = v_0^2/(2g)$ and occurs at $t_{\\text{peak}} = v_0/g$. At that same time, the second ball has fallen from $H$ to the same height.`,
      walkthrough: [
        {
          expression: `t_{\\text{peak}} = \\frac{v_0}{g} = \\frac{20}{9.8} \\approx 2.04\\text{ s},\\quad h_{\\text{apex}} = \\frac{v_0^2}{2g} = \\frac{400}{19.6} \\approx 20.4\\text{ m}`,
          annotation: `Compute the apex time and height for the first ball.`,
        },
        {
          expression: `\\text{Ball 2: }y_2(t) = H - \\tfrac{1}{2}g t^2`,
          annotation: `Dropped from rest at height $H$. At $t = t_{\\text{peak}}$, ball 2 must be at height $h_{\\text{apex}}$.`,
        },
        {
          expression: `h_{\\text{apex}} = H - \\tfrac{1}{2}g t_{\\text{peak}}^2 \\implies H = h_{\\text{apex}} + \\tfrac{1}{2}g t_{\\text{peak}}^2`,
          annotation: `Solve for $H$.`,
        },
        {
          expression: `H = 20.4 + \\tfrac{1}{2}(9.8)(2.04)^2 \\approx 20.4 + 20.4 = 40.8\\text{ m}`,
          annotation: `The second ball must be dropped from 40.8 m — exactly twice the apex height. The second ball falls $h_{\\text{apex}}$ meters while the first rises $h_{\\text{apex}}$ meters, so $H = 2h_{\\text{apex}}$.`,
        },
      ],
    },
  ],
  checkpoints: [
    {
      id: 'p1-ch2-015-cp1',
      question: `A ball thrown upward reaches a maximum height of 20 m. What was the launch speed?`,
      answer: `From $h = v_0^2/(2g)$, solve $v_0 = \\sqrt{2gh} = \\sqrt{2(9.8)(20)} = \\sqrt{392} \\approx 19.8$ m/s.`,
    },
    {
      id: 'p1-ch2-015-cp2',
      question: `What happens to the acceleration of a thrown ball at the exact instant it reaches the apex?`,
      answer: `Nothing special. Acceleration remains $-g = -9.8$ m/s² (up-positive) at the apex, just as it was throughout the entire flight. The apex is a velocity event ($v = 0$), not an acceleration event. The ball immediately begins accelerating downward from rest at the apex.`,
    },
  ],
  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Max height and apex time from v₀',
          type: 'code',
          language: 'python',
          code: `g  = 9.8    # m/s²
v0 = 14.0   # m/s upward (up-positive)

# Step 1: apex time from v = v0 - g*t = 0
t_apex = v0 / g

# Step 2: max height — two equivalent derivations
h_from_t     = v0*t_apex - 0.5*g*t_apex**2   # substitute t_apex into y(t)
h_from_eqn   = v0**2 / (2*g)                  # compact formula from v²=v0²-2gΔy

t_total = 2 * t_apex   # by symmetry

print(f"Time to apex   : {t_apex:.3f} s")
print(f"Max height (A) : {h_from_t:.3f} m    (from y = v0*t - 0.5g*t²)")
print(f"Max height (B) : {h_from_eqn:.3f} m    (from v0²/(2g))")
print(f"Both agree?    : {abs(h_from_t - h_from_eqn) < 1e-9}")
print(f"Total airtime  : {t_total:.3f} s")`,
          prose: [
            `Line 5: \`t_apex = v0/g\` comes from $v = v_0 - gt = 0$ — setting the velocity to zero and solving. This is the derivation, not a memorized formula.`,
            `Lines 8–9 show two ways to get max height: substituting \`t_apex\` into $y(t)$ (line 8), or applying $v^2 = v_0^2 - 2g\\Delta y$ directly with $v = 0$ (line 9). They must agree — and the \`abs(...) < 1e-9\` check on line 11 confirms this numerically. Two paths to the same answer is a powerful consistency check.`,
            `Line 12: \`t_total = 2 * t_apex\` uses the symmetry result from ch2-013. When the ball returns to its launch height, total flight time is double the apex time — no quadratic needed.`,
          ],
        },
        {
          cellTitle: 'Full trajectory — y(t), v(t), and a(t)',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

g = 9.8; v0 = 14.0
t_land = 2*v0/g
t = np.linspace(0, t_land, 500)
t_apex = v0/g

y = v0*t - 0.5*g*t**2           # parabolic
v = v0 - g*t                     # linear (decreasing)
a = np.full_like(t, -g)          # CONSTANT throughout

fig, axes = plt.subplots(3, 1, figsize=(8, 9), sharex=True)

axes[0].plot(t, y, lw=2, color='steelblue')
axes[0].axvline(t_apex, color='orange', ls='--', lw=1.5, label=f'apex t={t_apex:.2f}s')
axes[0].axhline(0, color='k', lw=0.8, ls='--')
axes[0].set_ylabel('y (m)'); axes[0].legend()
axes[0].set_title('Upward launch: y(t), v(t), a(t)')

axes[1].plot(t, v, lw=2, color='tomato')
axes[1].axhline(0, color='k', lw=0.8, ls='--', label='v=0 at apex')
axes[1].axvline(t_apex, color='orange', ls='--', lw=1.5)
axes[1].set_ylabel('v (m/s)'); axes[1].legend()

axes[2].plot(t, a, lw=2, color='seagreen')
axes[2].set_ylim([-15, 5])
axes[2].axvline(t_apex, color='orange', ls='--', lw=1.5)
axes[2].text(t_apex + 0.05, -g + 0.8, 'a = −g always', color='seagreen', fontsize=10)
axes[2].set_ylabel('a (m/s²)'); axes[2].set_xlabel('t (s)')

plt.tight_layout()
plt.show()`,
          prose: [
            `Line 11: \`a = np.full_like(t, -g)\` creates an array of constant value $-g$. This makes the key point explicit in code: acceleration is identically $-9.8$ m/s² at every time step — including at the apex. The a(t) graph is a flat horizontal line at $-g$, never zero.`,
            `The three plots together tell the complete story: y(t) is a downward-opening parabola with its vertex at the apex; v(t) is a straight line through zero at the apex (confirming the axis of symmetry); a(t) is completely flat, confirming constant gravity.`,
            `The orange dashed vertical line passes through all three subplots at the same $t_{\\text{apex}}$. In y(t), it marks the vertex. In v(t), it marks the zero crossing. In a(t), it is unremarkable — precisely the point: the apex is special for $v$, not for $a$.`,
          ],
        },
        {
          cellTitle: 'Apex height vs launch speed — quadratic scaling',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

g = 9.8
v0_range = np.linspace(0, 40, 300)
h_max = v0_range**2 / (2*g)   # quadratic in v0

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(v0_range, h_max, lw=2, color='steelblue', label='$h_{max} = v_0^2/(2g)$')

# Highlight the doubling effect: v0 = 10 vs v0 = 20
for v_ex in [10, 20, 30]:
    h_ex = v_ex**2 / (2*g)
    ax.scatter(v_ex, h_ex, zorder=5, s=80, color='tomato')
    ax.annotate(f'v₀={v_ex}: h={h_ex:.1f} m',
                (v_ex, h_ex), textcoords='offset points', xytext=(6, 4), fontsize=9)

ax.set_xlabel('Launch speed v₀ (m/s)')
ax.set_ylabel('Maximum height (m)')
ax.set_title('$h_{max} = v_0^2 / (2g)$ — quadratic: double v₀ → quadruple height')
ax.legend()
plt.tight_layout()
plt.show()

# Print the doubling table
print(f"{'v₀ (m/s)':>10} {'h_max (m)':>12} {'ratio to v₀=10':>16}")
for v0 in [10, 20, 30]:
    print(f"{v0:>10} {v0**2/(2*g):>12.2f} {v0**2/100:>16.1f}×")`,
          prose: [
            `Line 5: \`h_max = v0_range**2 / (2*g)\` evaluates the apex formula over a range of launch speeds. The result is a parabola (quadratic in $v_0$) — each doubling of $v_0$ multiplies height by four.`,
            `The three annotated points at $v_0 = 10$, 20, 30 m/s show heights of 5.1, 20.4, and 45.9 m respectively — ratios of 1:4:9. This $v_0^2$ scaling is why small increases in launch speed have large effects at high speeds (e.g., a 10% increase in $v_0$ gives a 21% increase in $h_{\\text{max}}$).`,
            `The table confirms the scaling numerically. This is useful context for any application involving launch optimization — doubling the speed is cheap compared to the fourfold height gain.`,
          ],
        },
        {
          cellTitle: 'Challenge — ball thrown from an elevated platform',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# A ball is thrown upward at v0 = 12 m/s from a platform y0 = 20 m
# above the ground. Find: apex height, time to land, impact speed.
g  = 9.8
v0 = 12.0   # m/s (upward)
y0 = 20.0   # m   (platform height)

# Part 1: apex height ABOVE THE GROUND (not just above platform)
h_above_platform = ???    # h = v0²/(2g)
y_apex           = ???    # y0 + h_above_platform

# Part 2: time to land (y = 0) — solve the quadratic
# 0 = y0 + v0*t - 0.5*g*t²  →  rearrange to  a*t² + b*t + c = 0
a_coeff = ???     # coefficient of t²
b_coeff = ???     # coefficient of t
c_coeff = ???     # constant term

discriminant = b_coeff**2 - 4*a_coeff*c_coeff
t_land = ???      # take the positive root: (-b + sqrt(disc)) / (2a)

# Part 3: impact speed
v_land = ???      # v = v0 - g * t_land   (will be negative)

print(f"Apex height (above ground): {y_apex:.3f} m")
print(f"Time to land               : {t_land:.3f} s")
print(f"Impact speed               : {abs(v_land):.3f} m/s")`,
          prose: [
            `Fill in six blanks: (1) \`h_above_platform = v0**2 / (2*g)\`; (2) \`y_apex = y0 + h_above_platform\`; (3) \`a_coeff = -0.5*g\`; (4) \`b_coeff = v0\`; (5) \`c_coeff = y0\`; (6) \`t_land = (-b_coeff + np.sqrt(discriminant)) / (2*a_coeff)\` — but note \`a_coeff\` is negative, so this gives the larger positive root.`,
            `Alternatively for the quadratic: rearrange $0 = y_0 + v_0 t - \\tfrac{1}{2}gt^2$ to $4.9t^2 - 12t - 20 = 0$ and use \`np.roots([4.9, -12, -20])\` with \`max\`.`,
            `Expected output: apex ≈ 27.35 m above ground (20 + 7.35 m), land time ≈ 3.55 s, impact speed ≈ 22.8 m/s. The impact speed is larger than the launch speed because the ball falls farther than it rose (from 27.35 m down to 0 m).`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Max height and apex time from v₀',
          type: 'code',
          language: 'matlab',
          code: `%% Upward launch — apex quantities
g  = 9.8;    % m/s²
v0 = 14.0;   % m/s upward

% Apex time: v = v0 - g*t = 0  →  t = v0/g
t_apex = v0 / g;

% Max height: two methods
h_from_t   = v0*t_apex - 0.5*g*t_apex^2;   % substitute into y(t)
h_from_eqn = v0^2 / (2*g);                  % compact formula

t_total = 2 * t_apex;   % symmetry: T = 2*t_peak

fprintf('Time to apex   : %.3f s\\n', t_apex)
fprintf('Max height (A) : %.3f m  (from y=v0*t-0.5g*t^2)\\n', h_from_t)
fprintf('Max height (B) : %.3f m  (from v0^2/(2g))\\n', h_from_eqn)
fprintf('Both agree?    : %d\\n', abs(h_from_t - h_from_eqn) < 1e-9)
fprintf('Total airtime  : %.3f s\\n', t_total)`,
          prose: [
            `\`t_apex = v0 / g\` is the derivation in one line: set $v = 0$ in $v = v_0 - gt$ and solve for $t$. MATLAB scalar division works identically to Python.`,
            `Lines 9–10 show both methods for computing $h_{\\text{max}}$: substituting into $y(t)$ and using the compact formula. The \`abs(...) < 1e-9\` check verifies they agree — a useful habit that catches sign errors immediately.`,
            `\`t_total = 2 * t_apex\` assumes the ball returns to the launch height (symmetry). If the ball lands at a different height, this formula does not apply — you must solve the quadratic instead.`,
          ],
        },
        {
          cellTitle: 'Full trajectory — y(t), v(t), and a(t)',
          type: 'code',
          language: 'matlab',
          code: `%% Three-panel trajectory plot
g = 9.8; v0 = 14.0;
t_land = 2*v0/g;
t = linspace(0, t_land, 500);
t_apex = v0/g;

y = v0*t - 0.5*g*t.^2;
v = v0 - g*t;
a = -g * ones(size(t));    % constant: a = -g always

figure('Position', [100 100 700 750])

subplot(3,1,1)
plot(t, y, 'b-', 'LineWidth', 2); hold on
xline(t_apex, '--', 'Color', [1 0.6 0], 'LineWidth', 1.5, 'Label', sprintf('apex t=%.2fs',t_apex))
yline(0, 'k--', 'LineWidth', 0.8)
ylabel('y (m)'); title('Upward launch: y(t), v(t), a(t)')

subplot(3,1,2)
plot(t, v, 'r-', 'LineWidth', 2); hold on
xline(t_apex, '--', 'Color', [1 0.6 0], 'LineWidth', 1.5)
yline(0, 'k--', 'LineWidth', 0.8)
ylabel('v (m/s)')

subplot(3,1,3)
plot(t, a, 'g-', 'LineWidth', 2); hold on
xline(t_apex, '--', 'Color', [1 0.6 0], 'LineWidth', 1.5)
ylim([-15 5])
text(t_apex + 0.05, -g + 0.8, 'a = -g always', 'Color', 'g')
ylabel('a (m/s²)'); xlabel('t (s)')
tight_layout`,
          prose: [
            `\`a = -g * ones(size(t))\` creates a vector of constant $-g$ values. \`ones(size(t))\` produces an array of 1s with the same dimensions as \`t\`. Multiplying by \`-g\` makes every element equal to $-9.8$. The a(t) plot is a flat horizontal line.`,
            `\`xline(t_apex, ...)\` draws a vertical dashed line at the apex time across all three subplots. In the y-plot this marks the vertex; in the v-plot it marks the zero crossing; in the a-plot it is unremarkable — emphasizing that the apex is not special for acceleration.`,
            `\`tight_layout\` adjusts the subplot spacing to prevent overlapping labels. This is the MATLAB equivalent of \`plt.tight_layout()\` in Python.`,
          ],
        },
        {
          cellTitle: 'Apex height vs launch speed — quadratic scaling',
          type: 'code',
          language: 'matlab',
          code: `%% h_max = v0²/(2g) — quadratic in v0
g = 9.8;
v0_range = linspace(0, 40, 300);
h_max    = v0_range.^2 / (2*g);    % element-wise .^

figure('Position', [100 100 700 450])
plot(v0_range, h_max, 'b-', 'LineWidth', 2)
hold on

% Annotate specific points
for v0 = [10, 20, 30]
    h_ex = v0^2 / (2*g);
    scatter(v0, h_ex, 80, 'r', 'filled')
    text(v0 + 0.5, h_ex, sprintf('v_0=%d: h=%.1f m', v0, h_ex), 'FontSize', 9)
end

xlabel('Launch speed v_0 (m/s)')
ylabel('Maximum height (m)')
title('h_{max} = v_0^2/(2g) — quadratic: double v_0 → 4× height')
grid on

% Print scaling table
fprintf('%-10s %-12s %-16s\\n', 'v0 (m/s)', 'h_max (m)', 'ratio to v0=10')
for v0 = [10, 20, 30]
    fprintf('%-10d %-12.2f %-16.1f×\\n', v0, v0^2/(2*g), v0^2/100)
end`,
          prose: [
            `\`h_max = v0_range.^2 / (2*g)\` uses element-wise \`.^\` to square each element of the array. Without the dot, \`v0_range^2\` would attempt matrix squaring (outer product), which fails for a row vector.`,
            `The \`for v0 = [10, 20, 30]\` loop annotates three specific points. \`scatter\` adds the red circle and \`text\` adds the label. \`sprintf\` formats the label string with numerical values — MATLAB's equivalent of Python's f-strings.`,
            `The printed table shows h values of 5.1, 20.4, 45.9 m for $v_0 = 10, 20, 30$ m/s — ratios 1:4:9. This confirms the quadratic scaling law.`,
          ],
        },
        {
          cellTitle: 'Challenge — ball thrown from an elevated platform',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `%% Ball thrown upward from y0 = 20 m at v0 = 12 m/s
%% Find apex height, time to land, and impact speed.
g  = 9.8;
v0 = 12.0;
y0 = 20.0;

% Part 1: apex height
h_above_platform = ???;    % v0^2 / (2*g)
y_apex           = ???;    % y0 + h_above_platform

% Part 2: time to land — solve  0 = y0 + v0*t - 0.5*g*t²
% Rearrange to  (0.5*g)*t² - v0*t - y0 = 0
coeffs   = [???  ???  ???];   % [0.5*g, -v0, -y0]
t_roots  = roots(coeffs);
t_land   = ???;               % max(real(t_roots))

% Part 3: impact speed
v_land = ???;                 % v0 - g*t_land  (will be negative)

fprintf('Apex height (above ground): %.3f m\\n', y_apex)
fprintf('Time to land               : %.3f s\\n', t_land)
fprintf('Impact speed               : %.3f m/s\\n', abs(v_land))`,
          prose: [
            `Fill in: (1) \`h_above_platform = v0^2 / (2*g)\`; (2) \`y_apex = y0 + h_above_platform\`; (3) \`coeffs = [0.5*g, -v0, -y0]\` for $0.5gt^2 - v_0 t - y_0 = 0$; (4) \`t_land = max(real(t_roots))\`; (5) \`v_land = v0 - g*t_land\`.`,
            `\`roots([a, b, c])\` solves $at^2 + bt + c = 0$. The coefficient vector is $[0.5g, -v_0, -y_0]$ because the equation $y_0 + v_0 t - 0.5gt^2 = 0$ rearranges to $0.5gt^2 - v_0 t - y_0 = 0$. \`max(real(...))\` picks the positive physical root.`,
            `Expected: apex ≈ 27.35 m, land time ≈ 3.55 s, impact speed ≈ 22.8 m/s. The impact speed exceeds the launch speed because the ball falls farther (from 27.35 m) than it rose (7.35 m above the platform), gaining extra kinetic energy.`,
          ],
        },
      ],
    },
  },
  quiz: [
    {
      id: 'p1-ch2-015-q1',
      type: 'choice',
      question: `At the apex of an upward throw, what is true about velocity and acceleration?`,
      options: [
        `Both $v = 0$ and $a = 0$`,
        `$v = 0$ but $a = -g$ (downward, unchanged)`,
        `$v = v_0/2$ and $a = -g$`,
        `$v = 0$ and $a$ momentarily reverses to $+g$`,
      ],
      answer: `$v = 0$ but $a = -g$ (downward, unchanged)`,
      hints: [
        `What causes the ball to start falling again after the apex? If $a = 0$, the ball would hover.`,
        `Acceleration depends on the net force. Has gravity stopped acting at the apex?`,
      ],
      reviewSection: 'intuition',
      explanation: `At the apex, $v = 0$ (momentarily at rest) but $a = -g = -9.8$ m/s² unchanged. The non-zero downward acceleration immediately causes the ball to begin falling.`,
    },
    {
      id: 'p1-ch2-015-q2',
      type: 'choice',
      question: `A ball is thrown upward at $v_0 = 14$ m/s. What is the maximum height ($g = 9.8$ m/s²)?`,
      options: [`7 m`, `10 m`, `14 m`, `20 m`],
      answer: `10 m`,
      hints: [
        `Use $h = v_0^2 / (2g)$ with $v_0 = 14$ m/s.`,
        `$14^2 = 196$. Divide by $2 \\times 9.8 = 19.6$.`,
      ],
      reviewSection: 'examples',
      explanation: `$h = 14^2/(2 \\times 9.8) = 196/19.6 = 10$ m.`,
    },
    {
      id: 'p1-ch2-015-q3',
      type: 'choice',
      question: `For the same ball ($v_0 = 14$ m/s), what is the time to reach the apex?`,
      options: [`0.7 s`, `1.0 s`, `1.4 s`, `2.0 s`],
      answer: `1.4 s`,
      hints: [
        `Use $t_{\\text{peak}} = v_0/g$.`,
        `$14 / 9.8 \\approx 1.43$ s — which option is closest?`,
      ],
      reviewSection: 'examples',
      explanation: `$t_{\\text{peak}} = v_0/g = 14/9.8 \\approx 1.43$ s. The nearest option is 1.4 s.`,
    },
    {
      id: 'p1-ch2-015-q4',
      type: 'choice',
      question: `The formula $h_{\\text{max}} = v_0^2/(2g)$ is derived from which condition?`,
      options: [
        `Setting $t = 0$`,
        `Setting $v = 0$ at the apex in $v^2 = v_0^2 - 2g\\Delta y$`,
        `Setting $\\Delta y = 0$`,
        `Setting $a = 0$ at the apex`,
      ],
      answer: `Setting $v = 0$ at the apex in $v^2 = v_0^2 - 2g\\Delta y$`,
      hints: [
        `At the apex, what is the velocity?`,
        `Substitute that value into the no-time SUVAT equation and solve for $\\Delta y$.`,
      ],
      reviewSection: 'math',
      explanation: `At the apex, $v = 0$: $0 = v_0^2 - 2g\\Delta y \\Rightarrow \\Delta y = v_0^2/(2g)$. Setting $a = 0$ is a common mistake — acceleration is never zero.`,
    },
    {
      id: 'p1-ch2-015-q5',
      type: 'choice',
      question: `Doubling the launch speed $v_0$ changes the maximum height by what factor?`,
      options: [`2×`, `4×`, `$\\sqrt{2}\\times$`, `Unchanged`],
      answer: `4×`,
      hints: [
        `$h_{\\text{max}} = v_0^2/(2g)$. How does $h$ change when $v_0$ is replaced by $2v_0$?`,
        `$(2v_0)^2 = 4v_0^2$.`,
      ],
      reviewSection: 'intuition',
      explanation: `$h_{\\text{max}}' = (2v_0)^2/(2g) = 4v_0^2/(2g) = 4h_{\\text{max}}$. The quadratic dependence means doubling the speed quadruples the height.`,
    },
    {
      id: 'p1-ch2-015-q6',
      type: 'choice',
      question: `A ball thrown upward at 9.8 m/s. What is its velocity exactly 1 s after launch?`,
      options: [`0 m/s`, `9.8 m/s upward`, `9.8 m/s downward`, `−19.6 m/s`],
      answer: `0 m/s`,
      hints: [
        `Use $v = v_0 - gt = 9.8 - 9.8(1) = ?$`,
        `This is exactly the apex time: $t_{\\text{peak}} = v_0/g = 9.8/9.8 = 1$ s.`,
      ],
      reviewSection: 'examples',
      explanation: `$v = 9.8 - 9.8(1) = 0$ m/s. At $t = 1$ s, the ball is exactly at the apex.`,
    },
    {
      id: 'p1-ch2-015-q7',
      type: 'choice',
      question: `A ball is thrown upward from a cliff. It rises, passes the launch height going down, and continues to the base of the cliff below. At what point does the ball have the greatest speed?`,
      options: [
        `At the launch point`,
        `Just below the launch height on the way down`,
        `At the apex`,
        `At the base of the cliff (lowest point reached)`,
      ],
      answer: `At the base of the cliff (lowest point reached)`,
      hints: [
        `Speed is $|v|$ and increases as the ball falls. Where does falling stop?`,
        `Use $v^2 = v_0^2 - 2g\\Delta y$. The largest $|v|$ occurs where $\\Delta y$ is most negative.`,
      ],
      reviewSection: 'examples',
      explanation: `$v^2 = v_0^2 - 2g\\Delta y$. Speed is largest where $\\Delta y$ is most negative — the lowest point (base of cliff). The ball accelerates throughout the entire descent from the apex to the cliff base.`,
    },
    {
      id: 'p1-ch2-015-q8',
      type: 'choice',
      question: `A ball is still rising at $t = 0.5$ s but falling at $t = 1.5$ s. What is the approximate launch speed?`,
      options: [`5 m/s`, `10 m/s`, `15 m/s`, `20 m/s`],
      answer: `10 m/s`,
      hints: [
        `The apex occurs between 0.5 s and 1.5 s, so $t_{\\text{peak}} \\approx 1$ s.`,
        `$v_0 = g \\cdot t_{\\text{peak}} \\approx 9.8 \\times 1 \\approx 10$ m/s.`,
      ],
      reviewSection: 'intuition',
      explanation: `Apex is between 0.5 s and 1.5 s, so $t_{\\text{peak}} \\approx 1$ s. $v_0 = g t_{\\text{peak}} \\approx 9.8 \\times 1 \\approx 10$ m/s.`,
    },
    {
      id: 'p1-ch2-015-q9',
      type: 'choice',
      question: `A ball thrown upward at 15 m/s from a 10-m platform. What is its speed when it passes 10 m height on the way down (back at the platform level)?`,
      options: [`7.5 m/s`, `10 m/s`, `15 m/s`, `20 m/s`],
      answer: `15 m/s`,
      hints: [
        `The ball returns to its launch height. Apply the symmetry result: $|v_{\\text{return}}| = v_0$.`,
        `Alternatively: $\\Delta y = 0$ from launch to return, so $v^2 = v_0^2 - 2g(0) = v_0^2$.`,
      ],
      reviewSection: 'math',
      explanation: `At the same height as launch ($\\Delta y = 0$), $v^2 = v_0^2 \\Rightarrow |v| = v_0 = 15$ m/s. Symmetry of free fall: return speed equals launch speed.`,
    },
    {
      id: 'p1-ch2-015-q10',
      type: 'choice',
      question: `A firework is launched upward at 30 m/s. How long after launch does it reach its maximum height?`,
      options: [`1.5 s`, `2.0 s`, `3.1 s`, `6.1 s`],
      answer: `3.1 s`,
      hints: [
        `Use $t_{\\text{peak}} = v_0/g = 30/9.8$.`,
        `$30 / 9.8 \\approx 3.06$ s.`,
      ],
      reviewSection: 'examples',
      explanation: `$t_{\\text{peak}} = v_0/g = 30/9.8 \\approx 3.06$ s. The nearest option is 3.1 s.`,
    },
  ],
  misconceptions: [
    {
      id: 'p1-ch2-015-m1',
      misconception: `"At the apex, both velocity and acceleration are zero — the ball is in momentary equilibrium."`,
      correction: `Only velocity is zero at the apex. Acceleration remains $-g = -9.8$ m/s² throughout the entire flight, including at the apex. If $a = 0$ at the apex, the ball would hover there forever (Newton's first law). The non-zero downward acceleration is what causes the ball to immediately begin falling after the apex.`,
      correctionExample: `At the apex: $v = 0$ m/s (verified by $v = v_0 - g t_{\\text{peak}} = 0$), but $a = -9.8$ m/s². One nanosecond after the apex, $v = a \\cdot (10^{-9}) \\approx -9.8 \\times 10^{-9}$ m/s — negative, confirming the ball is already moving downward.`,
    },
    {
      id: 'p1-ch2-015-m2',
      misconception: `"To double the maximum height, double the launch speed."`,
      correction: `Since $h = v_0^2/(2g)$, height is proportional to $v_0^2$. To double $h$, you need $v_0' = v_0 \\sqrt{2} \\approx 1.41 v_0$ — a 41% increase in launch speed. To quadruple $h$, you need 2× the launch speed.`,
      correctionExample: `$v_0 = 10$ m/s gives $h = 5.1$ m. To get $h = 10.2$ m (double), you need $v_0 = 10\\sqrt{2} \\approx 14.1$ m/s, not 20 m/s. With $v_0 = 20$ m/s, $h = 20.4$ m (four times 5.1 m).`,
    },
  ],
  transferPrompts: [
    {
      id: 'p1-ch2-015-tp1',
      prompt: `A basketball player releases a free throw at 3 m above the floor with an upward component of 5.4 m/s. The basket is at 3.05 m height. Does the ball reach 3.05 m on the way up or the way down? What vertical speed does it have when it passes the basket height?`,
    },
    {
      id: 'p1-ch2-015-tp2',
      prompt: `In spring-loaded safety valves, a disc must be pushed upward 20 mm against gravity. If launched by a spring at 0.63 m/s, does it reach 20 mm? What minimum spring launch speed is needed? How does the quadratic scaling $v_0 = \\sqrt{2gh}$ affect the spring design?`,
    },
  ],
  debugging: [
    {
      id: 'p1-ch2-015-d1',
      buggyWork: `Student: "Ball at $v_0 = 20$ m/s. At apex, $a = 0$. So I use $v^2 = v_0^2 + 2a\\Delta y = v_0^2 + 0 = v_0^2$ to get $\\Delta y = 0$." They conclude the ball never moves.`,
      question: `Find both errors in the student's reasoning.`,
      answer: `Error 1: $a \\neq 0$ at the apex — acceleration is $-g = -9.8$ m/s² throughout. Error 2: Even if $a = 0$ were substituted (hypothetically), $v^2 = v_0^2$ would give $|v| = v_0$, meaning the velocity never changes — not $\\Delta y = 0$. To find $\\Delta y$ from the no-time equation, you must set $v_f = 0$ (apex condition): $0 = v_0^2 - 2g\\Delta y \\Rightarrow \\Delta y = v_0^2/(2g) = 400/19.6 \\approx 20.4$ m.`,
    },
    {
      id: 'p1-ch2-015-d2',
      buggyWork: `Student: "Ball thrown up at 14 m/s. To double the height I need to double the speed to 28 m/s."`,
      question: `What is the error? What launch speed actually doubles the height?`,
      answer: `The error: $h = v_0^2/(2g)$ scales as $v_0^2$, not $v_0$. Doubling $v_0$ to 28 m/s gives $h = 784/19.6 = 40$ m — four times the original 10 m, not double. To double the height to 20 m, you need $v_0 = \\sqrt{2g \\times 20} = \\sqrt{392} \\approx 19.8$ m/s (i.e., multiply by $\\sqrt{2} \\approx 1.41$).`,
    },
  ],
  mastery: {
    targetLevel: `Given any upward-launch scenario (from ground, from an elevated point, or with a specified landing height), correctly set up and solve for apex height, apex time, total flight time, velocity at any time or height, and required launch speed — including using the quadratic formula when landing height differs from launch height.`,
    coreSkill: `Deriving $t_{\\text{peak}} = v_0/g$ and $h_{\\text{max}} = v_0^2/(2g)$ by substituting $v = 0$ into the SUVAT equations rather than memorizing them as standalone formulas.`,
    commonSticking: `Setting $a = 0$ at the apex. The apex is a velocity event — $v = 0$ — not an equilibrium. Acceleration is $-g$ everywhere in free fall, apex included.`,
    connections: [
      `ch2-012 (free fall basics) — the SUVAT equations used throughout this lesson`,
      `ch2-013 (free fall symmetry) — total flight time $T = 2v_0/g$ and return speed symmetry`,
      `ch2-014 (sign conventions) — all equations here use up-positive convention`,
      `ch4 (projectile motion) — the vertical component of any projectile is exactly this analysis with $v_0 \\sin\\theta$ replacing $v_0$`,
    ],
  },
  semantics: {
    core: [
      { symbol: `t_{\\text{peak}}`, meaning: `Time from launch to apex; $v_0/g$ in up-positive convention` },
      { symbol: `h_{\\text{max}}`, meaning: `Maximum height above launch point; $v_0^2/(2g)$` },
      { symbol: `T_{\\text{total}}`, meaning: `Total flight time when landing at launch height; $2v_0/g$` },
      { symbol: `v_{\\text{apex}}`, meaning: `Velocity at the apex; always zero` },
      { symbol: `a_{\\text{apex}}`, meaning: `Acceleration at the apex; always $-g$ (never zero)` },
    ],
    rulesOfThumb: [
      `At the apex: $v = 0$ but $a = -g$. Zero velocity ≠ zero acceleration.`,
      `$h_{\\text{max}} = v_0^2/(2g)$ — memorize the formula but know it comes from setting $v = 0$ in the no-time equation.`,
      `Doubling $v_0$ quadruples $h_{\\text{max}}$; tripling $v_0$ gives $9\\times$ the height.`,
      `When landing at launch height: $T = 2v_0/g$ and return speed $= v_0$.`,
      `When landing at a different height: write the full quadratic $y_f = y_0 + v_0 t - \\tfrac{1}{2}gt^2$ and solve with the quadratic formula.`,
    ],
  },
};

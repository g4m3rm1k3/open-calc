export default {
  id: 'p1-ch2-013',
  slug: 'free-fall-symmetry',
  chapter: 'p2',
  order: 13,
  title: "Free Fall Symmetry",
  subtitle: "In ideal free fall, ascent and descent mirror each other about the apex.",
  tags: ["free fall", "symmetry", "projectile"],
  aliases: "time up equals time down free fall symmetry return speed",
  hook: {
    question: "Why does an object thrown straight up return with the same speed it had at launch?",
    realWorldContext:
      "Ballistics and sports physics rely on this symmetry as a first-order model before adding drag. Understanding which symmetry properties hold (and why they break with air resistance) is essential for any realistic projectile analysis.",
    previewVisualizationId: 'SVGDiagram',
  },
  intuition: {
    prose: [
      `Before reading on, predict: a ball is thrown upward at 20 m/s. After it rises, reaches the apex, and falls back down to the exact height from which it was thrown, what is its speed? More than 20 m/s, exactly 20 m/s, or less than 20 m/s? Write your prediction and the reason for it before continuing.`,
      `Free-fall symmetry has two parts. First, the time to rise from any height to the apex equals the time to fall from the apex back to that same height. Second, the speed at any height on the way up equals the speed at that same height on the way down. Both symmetries follow from a single fact: acceleration is constant throughout the flight.`,
      `The clearest way to see the time symmetry is to look at the v–t graph. With $a = -g$, velocity is $v(t) = v_0 - gt$ — a straight line that crosses zero at $t_{\\text{peak}} = v_0/g$. The line is perfectly symmetric about $t_{\\text{peak}}$: whatever the velocity was at time $t_{\\text{peak}} - \\tau$, the velocity at time $t_{\\text{peak}} + \\tau$ is its exact negative. Same magnitude, opposite direction.`,
      `The speed symmetry follows algebraically from the no-time equation $v^2 = v_0^2 - 2g\\Delta y$. At any specific height $\\Delta y$, the right-hand side is the same regardless of whether the object is on the way up or the way down. So $v^2$ is the same at that height on both passes — which means speed is the same. The direction differs (positive on the way up, negative on the way down), but the magnitude is identical.`,
      `Both symmetries break as soon as you add air resistance. Drag opposes velocity, so on the way up it acts downward (adding to gravity) and on the way down it acts upward (opposing gravity). The upward phase is shortened, the downward phase is slowed, and the ball returns with less speed than it left with. Real balls, shuttlecocks, and artillery shells all land slower than they launched — symmetry is an idealization.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Using symmetry to solve quickly',
        body: `1. Identify if the problem involves return to the same height — if so, return speed equals launch speed instantly.\n2. Identify if you need total flight time — if landing at launch height, $T = 2v_0/g$ without solving a quadratic.\n3. Identify if you need speed at a specific height — use $v^2 = v_0^2 - 2g\\Delta y$; speed is the same on ascent and descent at that height.\n4. Only when the landing height differs from the launch height do you need the full quadratic $y = y_0 + v_0 t - \\tfrac{1}{2}gt^2$.`,
      },
      {
        type: 'insight',
        title: 'The v–t line is the engine of symmetry',
        body: `$v(t) = v_0 - gt$ is a straight line. The apex occurs at the midpoint $t_{\\text{peak}} = v_0/g$. For any time offset $\\tau$ from the apex, $v(t_{\\text{peak}} - \\tau) = g\\tau = -v(t_{\\text{peak}} + \\tau)$. Same magnitude, opposite sign — this is exactly what "symmetric about the apex" means.`,
      },
      {
        type: 'warning',
        title: 'Symmetry only holds when landing at launch height',
        body: `If the ball lands at a different height (e.g., thrown from a cliff), the return speed no longer equals the launch speed — though the no-time equation $v^2 = v_0^2 - 2g\\Delta y$ still tells you the exact impact speed. The time symmetry also breaks: more (or less) time is spent on one side of the apex.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-fall-axes' },
        title: 'Symmetric trajectory about the apex',
        caption: 'The trajectory y(t) = v₀t − ½gt² is a downward-opening parabola. The apex is the axis of symmetry — equal horizontal distances on the t-axis correspond to equal heights on both sides.',
      },
    ],
  },
  math: {
    prose: [
      `The symmetry claims can be proven directly from the SUVAT equations. For time symmetry: setting $y(t) = 0$ in $y = v_0 t - \\tfrac{1}{2}g t^2$ (launch height taken as zero) factors as $t(v_0 - \\tfrac{1}{2}g t) = 0$, giving $t = 0$ (launch) and $t = 2v_0/g$ (landing). The midpoint is $v_0/g = t_{\\text{peak}}$, confirming equal rise and fall times.`,
      `For speed symmetry: at any height $h$ on the way up, $v_{\\text{up}}^2 = v_0^2 - 2gh$. On the way down at the same height, the same equation gives $v_{\\text{down}}^2 = v_0^2 - 2gh$. So $|v_{\\text{up}}| = |v_{\\text{down}}|$ at every common height. At $h = 0$ (launch/landing height), this gives $|v_{\\text{land}}| = |v_0|$ — the quantitative statement that impact speed equals launch speed.`,
      `These two symmetry results together mean that the v–t graph for a full up-and-down flight is a straight line that passes through zero at $t_{\\text{peak}}$ and has equal positive and negative regions. The y–t parabola is symmetric about the vertical line $t = t_{\\text{peak}}$.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Free-fall symmetry (land at launch height)',
        body: `t_{\\text{peak}} = \\frac{v_0}{g},\\quad T_{\\text{total}} = \\frac{2v_0}{g},\\quad |v_{\\text{land}}| = v_0`,
      },
      {
        type: 'definition',
        title: 'Speed at height $h$ on both passes',
        body: `v^2 = v_0^2 - 2gh \\implies |v_{\\text{up}}(h)| = |v_{\\text{down}}(h)|`,
      },
    ],
  },
  rigor: {
    prose: [
      `Formally, the time symmetry is a consequence of the time-reversal symmetry of Newton's second law when only conservative forces act. With $\\ddot y = -g$ (constant), if $y(t)$ is a solution, then $y(T - t)$ (time-reversed trajectory) satisfies the same differential equation with reversed initial conditions. The midpoint $t = T/2 = t_{\\text{peak}}$ is fixed under this reversal.`,
      `The speed symmetry is equivalent to conservation of mechanical energy. With only gravity (a conservative force), total mechanical energy $E = \\tfrac{1}{2}mv^2 + mgy$ is conserved. At any height $y = h$ on either pass, $\\tfrac{1}{2}mv^2 + mgh = \\tfrac{1}{2}mv_0^2 + mg(0)$, giving $v^2 = v_0^2 - 2gh$ on both the ascent and descent. Free-fall symmetry and energy conservation are two sides of the same coin.`,
      `In the y–t plane, the trajectory $y(t) = v_0 t - \\tfrac{1}{2}gt^2$ is a parabola with vertex at $(t_{\\text{peak}}, y_{\\text{max}}) = (v_0/g,\\, v_0^2/(2g))$ and roots at $t = 0$ and $t = 2v_0/g$. The axis of symmetry is the vertical line $t = v_0/g$. The parabola's shape confirms that the two halves are mirror images — the left half (ascent) and right half (descent) are reflections across this axis.`,
      `When air resistance is present, the equation of motion becomes $m\\ddot y = -mg - bv$ (linear drag) or $-mg - b v|v|$ (quadratic drag). Neither is time-reversible in the same way, breaking both symmetries. The ball reaches a lower peak (more work done against drag on the way up) and has a lower impact speed (less potential energy converted to kinetic on the way down). The symmetry of free fall is an idealization valid when drag forces are negligible compared to gravity.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Symmetry from the quadratic roots',
        body: `y = v_0 t - \\tfrac{1}{2}gt^2 = 0 \\implies t = 0 \\text{ or } t = \\frac{2v_0}{g} = 2t_{\\text{peak}}`,
      },
    ],
  },
  examples: [
    {
      id: 'p1-ch2-013-ex1',
      title: 'Apex time and total flight time',
      problem: `A ball is thrown upward at $v_0 = 19.6$ m/s from ground level (up-positive, $g = 9.8$ m/s²). Find (a) time to the apex and (b) total flight time back to the ground.`,
      steps: [
        {
          expression: `t_{\\text{peak}} = \\frac{v_0}{g} = \\frac{19.6}{9.8} = 2\\text{ s}`,
          annotation: `At the apex, $v = 0$. Set $v = v_0 - gt = 0$ and solve for $t$.`,
        },
        {
          expression: `T_{\\text{total}} = 2 t_{\\text{peak}} = 2 \\times 2 = 4\\text{ s}`,
          annotation: `By time symmetry: descent time equals ascent time. Alternatively, set $y = v_0 t - \\tfrac{1}{2}gt^2 = 0$ and factor out $t$ to get $t = 2v_0/g = 4$ s.`,
        },
        {
          expression: `v_{\\text{land}} = v_0 - g T = 19.6 - 9.8(4) = -19.6\\text{ m/s}`,
          annotation: `Landing velocity is $-19.6$ m/s (downward). Magnitude equals launch speed — confirming speed symmetry.`,
        },
      ],
      conclusion: `Apex at $t = 2$ s, lands at $t = 4$ s with speed 19.6 m/s — same as the launch speed. The v–t graph is a straight line from $+19.6$ to $-19.6$ m/s over 4 s.`,
    },
    {
      id: 'p1-ch2-013-ex2',
      title: 'Speed at equal heights on ascent and descent',
      problem: `A ball is thrown upward at $v_0 = 24.5$ m/s. A ledge is located 15 m above the launch point. Find the ball's speed when it passes the ledge height (a) on the way up and (b) on the way down.`,
      steps: [
        {
          expression: `v_{\\text{up}}^2 = v_0^2 - 2g h = (24.5)^2 - 2(9.8)(15) = 600.25 - 294 = 306.25`,
          annotation: `On the way up: substitute $h = +15$ m into the no-time equation.`,
        },
        {
          expression: `|v_{\\text{up}}| = \\sqrt{306.25} \\approx 17.5\\text{ m/s}`,
          annotation: `Speed on the way up at 15 m. The ball is still moving upward ($v > 0$).`,
        },
        {
          expression: `v_{\\text{down}}^2 = v_0^2 - 2g h = 306.25\\text{ (identical)}`,
          annotation: `On the way down at the same height: the right-hand side is identical because $h$ is the same. So $v^2$ is the same.`,
        },
        {
          expression: `|v_{\\text{down}}| = \\sqrt{306.25} \\approx 17.5\\text{ m/s}`,
          annotation: `Speed on the way down at 15 m — exactly the same as on the way up. Only the direction differs: upward (+17.5) vs downward (−17.5).`,
        },
      ],
      conclusion: `The speed is 17.5 m/s at 15 m on both the ascent and descent. This is the speed symmetry: $v^2 = v_0^2 - 2gh$ gives the same value on both passes because height $h$ is the only position-dependent term.`,
    },
    {
      id: 'p1-ch2-013-ex3',
      title: 'Finding launch speed from total flight time',
      problem: `A ball is thrown upward from the ground and returns to the ground after exactly 6 s. Find the launch speed and the maximum height.`,
      steps: [
        {
          expression: `T_{\\text{total}} = \\frac{2v_0}{g} \\implies v_0 = \\frac{g T}{2} = \\frac{9.8 \\times 6}{2} = 29.4\\text{ m/s}`,
          annotation: `Invert the total flight time formula. The flight time determines the launch speed directly — no quadratic needed.`,
        },
        {
          expression: `y_{\\text{max}} = \\frac{v_0^2}{2g} = \\frac{(29.4)^2}{2(9.8)} = \\frac{864.36}{19.6} = 44.1\\text{ m}`,
          annotation: `Maximum height from the apex formula.`,
        },
        {
          expression: `t_{\\text{peak}} = T/2 = 3\\text{ s},\\quad v_{\\text{land}} = -v_0 = -29.4\\text{ m/s}`,
          annotation: `Apex at 3 s, landing speed 29.4 m/s downward — confirming symmetry.`,
        },
      ],
      conclusion: `Launch speed is 29.4 m/s and maximum height is 44.1 m. When total flight time is given, the symmetry formula $T = 2v_0/g$ is the fastest path to the launch speed.`,
    },
  ],
  challenges: [
    {
      id: 'p1-ch2-013-ch1',
      difficulty: 'medium',
      problem: `Prove algebraically that when a ball is thrown upward with speed $v_0$ and lands back at the same height, the landing speed equals the launch speed. Use only the SUVAT equations.`,
      hint: `Use $v^2 = v_0^2 - 2g\\Delta y$ with $\\Delta y = 0$ at the landing height.`,
      walkthrough: [
        {
          expression: `\\Delta y = y_{\\text{land}} - y_0 = 0\\text{ (same height)}`,
          annotation: `The ball returns to the same height, so the net displacement is zero.`,
        },
        {
          expression: `v_{\\text{land}}^2 = v_0^2 - 2g(\\Delta y) = v_0^2 - 2g(0) = v_0^2`,
          annotation: `Substitute $\\Delta y = 0$ into the no-time equation. The $g$ term vanishes.`,
        },
        {
          expression: `|v_{\\text{land}}| = \\sqrt{v_0^2} = v_0\\quad (v_0 > 0)`,
          annotation: `Taking the positive square root gives $|v_{\\text{land}}| = v_0$. The direction is negative (downward), but the magnitude equals the launch speed.`,
        },
      ],
    },
    {
      id: 'p1-ch2-013-ch2',
      difficulty: 'medium',
      problem: `A ball is thrown upward and is observed to pass a window ledge at 12 m above launch on both the way up and the way down. The time between the two passes is 2.4 s. Find the launch speed $v_0$.`,
      hint: `The midpoint between the two passes is the apex. The half-time from one pass to the apex is 1.2 s. Find the velocity at the window height first.`,
      walkthrough: [
        {
          expression: `\\Delta t_{\\text{half}} = 1.2\\text{ s (from window to apex)}`,
          annotation: `By symmetry, the time from the window (12 m) to the apex, and from the apex back to the window, are both 1.2 s. So the ball is at the apex at time $t_{\\text{pass1}} + 1.2$ s.`,
        },
        {
          expression: `v_{\\text{window}} + g \\cdot 1.2 = 0 \\implies v_{\\text{window}} = 9.8 \\times 1.2 = 11.76\\text{ m/s}`,
          annotation: `At the window on the way up, the ball decelerates to zero over 1.2 s. So $v_{\\text{window}} = g \\cdot 1.2 = 11.76$ m/s.`,
        },
        {
          expression: `v_0^2 = v_{\\text{window}}^2 + 2g h = (11.76)^2 + 2(9.8)(12) = 138.3 + 235.2 = 373.5`,
          annotation: `Use $v^2 = v_0^2 - 2gh$ to relate launch speed to window speed.`,
        },
        {
          expression: `v_0 = \\sqrt{373.5} \\approx 19.3\\text{ m/s}`,
          annotation: `Launch speed is about 19.3 m/s. This problem combines time symmetry (equal time on each side of apex) and the no-time equation.`,
        },
      ],
    },
    {
      id: 'p1-ch2-013-ch3',
      difficulty: 'hard',
      problem: `A ball thrown upward at $v_0$ lands on a balcony at height $h > 0$ instead of returning to the ground. Show that the landing speed is $|v_f| = \\sqrt{v_0^2 - 2gh}$, which is less than $v_0$. Find the specific value when $v_0 = 20$ m/s and $h = 10$ m.`,
      hint: `When landing height differs from launch height, $\\Delta y = h \\neq 0$, so the no-time equation no longer simplifies to $v_f = v_0$.`,
      walkthrough: [
        {
          expression: `v_f^2 = v_0^2 - 2g(h - 0) = v_0^2 - 2gh`,
          annotation: `Apply the no-time equation with $y_0 = 0$ (launch) and $y_f = h$ (balcony). Net displacement is $\\Delta y = h$.`,
        },
        {
          expression: `\\text{Since }h > 0:\\quad v_0^2 - 2gh < v_0^2 \\implies |v_f| < v_0`,
          annotation: `Subtracting a positive term $2gh$ makes $v_f^2$ smaller, so $|v_f| < v_0$. The ball loses kinetic energy to potential energy stored at height $h$.`,
        },
        {
          expression: `v_f^2 = (20)^2 - 2(9.8)(10) = 400 - 196 = 204 \\implies |v_f| = \\sqrt{204} \\approx 14.3\\text{ m/s}`,
          annotation: `With $v_0 = 20$ m/s and $h = 10$ m, the landing speed is about 14.3 m/s — notably less than the 20 m/s launch speed.`,
        },
      ],
    },
  ],
  checkpoints: [
    {
      id: 'p1-ch2-013-cp1',
      question: `A ball thrown at 15 m/s returns to the launch height. What is its speed at that moment, and what is the direction of velocity?`,
      answer: `Speed is 15 m/s (same as launch) by the symmetry $|v_{\\text{land}}| = v_0$, which follows from $v^2 = v_0^2 - 2g(0) = v_0^2$. The direction is downward (negative in up-positive convention) — $v_{\\text{land}} = -15$ m/s.`,
    },
    {
      id: 'p1-ch2-013-cp2',
      question: `A ball has total airtime of 5 s when thrown upward from the ground. What is its launch speed?`,
      answer: `From $T = 2v_0/g$, solve for $v_0 = gT/2 = 9.8 \\times 5/2 = 24.5$ m/s.`,
    },
  ],
  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Verify rise time equals fall time numerically',
          type: 'code',
          language: 'python',
          code: `import numpy as np

g  = 9.8    # m/s²
v0 = 19.6   # m/s (upward)

t_apex  = v0 / g                    # time to peak (v=0)
t_total = 2 * t_apex                # symmetry: T = 2*t_peak
t_fall  = t_total - t_apex          # fall phase duration

y_apex  = v0*t_apex - 0.5*g*t_apex**2
v_land  = v0 - g*t_total            # should be -v0

print(f"Time to apex    : {t_apex:.3f} s")
print(f"Fall time       : {t_fall:.3f} s")
print(f"Rise = Fall?    : {np.isclose(t_apex, t_fall)}")
print(f"Peak height     : {y_apex:.3f} m")
print(f"Launch speed    : {v0:.3f} m/s")
print(f"Landing speed   : {abs(v_land):.3f} m/s")
print(f"|v_land| = v0?  : {np.isclose(abs(v_land), v0)}")`,
          prose: [
            `Line 6: $t_{\\text{peak}} = v_0/g$ comes from setting $v = 0$ in $v = v_0 - gt$. Lines 7–8 derive total and fall times from the symmetry claim. The \`np.isclose\` check on lines 15 and 19 verifies numerical equality (not exact equality, since floating-point arithmetic is involved).`,
            `Line 13: \`v_land = v0 - g*t_total\`. Substituting $t_{\\text{total}} = 2v_0/g$ gives $v_{\\text{land}} = v_0 - g(2v_0/g) = v_0 - 2v_0 = -v_0$. The landing velocity is exactly $-v_0$ — same magnitude, opposite sign.`,
            `This cell quantitatively confirms both symmetry properties: equal rise and fall times (line 15), and equal launch/landing speeds (line 18). Both \`np.isclose\` calls should return \`True\`.`,
          ],
        },
        {
          cellTitle: 'Symmetric v(t) and y(t) plots',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

g = 9.8; v0 = 19.6
t_land = 2 * v0 / g
t = np.linspace(0, t_land, 500)
y = v0*t - 0.5*g*t**2
v = v0 - g*t
t_apex = v0 / g

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 6), sharex=True)

ax1.plot(t, y, lw=2, color='steelblue', label='y(t)')
ax1.axvline(t_apex, color='orange', ls='--', lw=1.5, label=f'apex at t={t_apex:.1f} s')
ax1.axhline(0, color='k', lw=0.8)
# highlight symmetric time pairs
for tau in [0.5, 1.0, 1.5]:
    tl, tr = t_apex - tau, t_apex + tau
    yl = v0*tl - 0.5*g*tl**2
    yr = v0*tr - 0.5*g*tr**2
    ax1.annotate('', xy=(tr, yr), xytext=(tl, yl),
                 arrowprops=dict(arrowstyle='<->', color='gray', lw=1))
ax1.set_ylabel('Height y (m)')
ax1.set_title('Free fall symmetry: y(t) parabola and v(t) line')
ax1.legend()

ax2.plot(t, v, lw=2, color='tomato', label='v(t)')
ax2.axvline(t_apex, color='orange', ls='--', lw=1.5)
ax2.axhline(0, color='k', lw=0.8, label='v=0 at apex')
ax2.fill_between(t[t<=t_apex], v[t<=t_apex], alpha=0.15, color='green', label='ascent')
ax2.fill_between(t[t>=t_apex], v[t>=t_apex], alpha=0.15, color='red',   label='descent')
ax2.set_xlabel('Time (s)')
ax2.set_ylabel('Velocity v (m/s)')
ax2.legend()
plt.tight_layout()
plt.show()`,
          prose: [
            `The double-headed arrows on the y–t plot connect symmetric time points $(t_{\\text{peak}} - \\tau,\\; t_{\\text{peak}} + \\tau)$ on the parabola. By the symmetry property, these two points have the same y-value — confirming the parabola's axis of symmetry at $t = t_{\\text{peak}}$.`,
            `The green and red shading on the v–t plot show the ascent (positive velocity) and descent (negative velocity) phases. Because $v(t)$ is linear with slope $-g$, the green area and red area are equal triangles — a visual confirmation that rise and fall times are equal.`,
            `The v–t graph is a straight line crossing zero at $t_{\\text{peak}}$. Its perfect symmetry about this crossing is the algebraic engine of all free-fall symmetry results. When air resistance is present, this line becomes a curve that is steeper on the way up — breaking the symmetry.`,
          ],
        },
        {
          cellTitle: 'Speed at equal heights — ascending vs descending',
          type: 'code',
          language: 'python',
          code: `import numpy as np

g = 9.8; v0 = 19.6
y_max = v0**2 / (2*g)

print(f"Peak height: {y_max:.3f} m")
print(f"\\n{'Height (m)':>12} {'|v| going up':>14} {'|v| going down':>16} {'Match?':>8}")
print("-" * 55)

for frac in [0.2, 0.4, 0.6, 0.8, 0.95]:
    h = frac * y_max
    # v² = v0² - 2g*h  (same equation regardless of direction)
    v_sq = v0**2 - 2*g*h
    speed = np.sqrt(v_sq)

    # Time to pass height h on the way up (find smaller root of y(t) = h)
    # h = v0*t - 0.5*g*t²  →  0.5*g*t² - v0*t + h = 0
    discriminant = v0**2 - 2*g*h   # = v_sq
    t_up   = (v0 - np.sqrt(discriminant)) / g   # earlier root
    t_down = (v0 + np.sqrt(discriminant)) / g   # later root
    v_up   = v0 - g*t_up
    v_down = v0 - g*t_down

    print(f"{h:>12.3f} {abs(v_up):>14.4f} {abs(v_down):>16.4f} {'✓' if np.isclose(abs(v_up), abs(v_down)) else '✗':>8}")`,
          prose: [
            `The key insight is line 13: \`v_sq = v0**2 - 2*g*h\`. This expression is the same regardless of whether the ball is on the way up or down, because it depends only on the height $h$ and not on the direction of travel. The speed is therefore identical at every shared height.`,
            `Lines 17–21 compute the actual times when the ball is at height $h$ on each pass (roots of the quadratic $y(t) = h$). Lines 22–23 compute the signed velocities at those times. The table shows that $|v_{\\text{up}}|$ and $|v_{\\text{down}}|$ match to many decimal places for every sampled height.`,
            `All rows should print ✓. Any mismatch would indicate a floating-point issue or a sign error. This is a complete numerical verification of the speed symmetry property.`,
          ],
        },
        {
          cellTitle: 'Challenge — given flight time and peak height, recover v₀',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# A ball is observed to have:
#   total flight time T = 5.0 s   (returns to launch height)
#   peak height       h = 30.6 m  (measured)
# Recover v0 using BOTH symmetry methods and verify they agree.

g = 9.8
T = 5.0    # total flight time (s)
h = 30.6   # peak height (m)

# Method 1: use T = 2*v0/g  (time symmetry)
v0_from_time = ???

# Method 2: use h = v0²/(2g)  (apex height formula)
v0_from_height = ???

print(f"v0 from flight time  : {v0_from_time:.4f} m/s")
print(f"v0 from peak height  : {v0_from_height:.4f} m/s")
print(f"Methods agree?       : {np.isclose(v0_from_time, v0_from_height, rtol=1e-3)}")

# Verify: simulate the full trajectory and check
t_land = 2 * v0_from_time / g
y_peak = v0_from_time**2 / (2*g)
print(f"Simulated T         : {t_land:.4f} s  (should be {T})")
print(f"Simulated peak h    : {y_peak:.4f} m  (should be {h})")`,
          prose: [
            `Fill in two blanks: (1) \`v0_from_time = g * T / 2\` — rearranging $T = 2v_0/g$; (2) \`v0_from_height = np.sqrt(2*g*h)\` — rearranging $h = v_0^2/(2g)$. Both should give the same numerical result if the physical data are consistent.`,
            `The \`np.isclose(rtol=1e-3)\` call checks for agreement to within 0.1%. In a real experiment, the two methods might disagree slightly due to measurement error — this is why redundant measurements are valuable.`,
            `The verification block simulates forward from the recovered $v_0$ and checks that the resulting flight time and peak height match the observed values. Expected output: $v_0 \\approx 24.5$ m/s, both methods agree, $T = 5.0$ s, $h \\approx 30.6$ m.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Verify rise time equals fall time numerically',
          type: 'code',
          language: 'matlab',
          code: `%% Free fall symmetry check
g  = 9.8;    % m/s²
v0 = 19.6;   % m/s upward

t_apex  = v0 / g;
t_total = 2 * t_apex;
t_fall  = t_total - t_apex;

y_apex = v0*t_apex - 0.5*g*t_apex^2;
v_land = v0 - g*t_total;

fprintf('Time to apex    : %.3f s\\n', t_apex)
fprintf('Fall time       : %.3f s\\n', t_fall)
fprintf('Rise = Fall?    : %d (1=true)\\n', abs(t_apex - t_fall) < 1e-10)
fprintf('Peak height     : %.3f m\\n', y_apex)
fprintf('Landing speed   : %.3f m/s\\n', abs(v_land))
fprintf('|v_land| = v0?  : %d (1=true)\\n', abs(abs(v_land) - v0) < 1e-10)`,
          prose: [
            `\`t_apex = v0 / g\` and \`t_total = 2 * t_apex\` implement the symmetry formulas directly. MATLAB scalar division and multiplication work identically to Python — no special operators needed.`,
            `\`abs(t_apex - t_fall) < 1e-10\` checks floating-point equality to machine precision. MATLAB doesn't have a built-in \`isclose\` like NumPy, so this pattern (absolute difference < tolerance) is the standard approach.`,
            `\`v_land = v0 - g*t_total\` evaluates to $v_0 - g(2v_0/g) = -v_0$, so \`abs(v_land) = v0\`. Both symmetry checks should print \`1\` (true).`,
          ],
        },
        {
          cellTitle: 'Plot symmetric y(t) parabola and v(t) line',
          type: 'code',
          language: 'matlab',
          code: `%% Parameters
g = 9.8; v0 = 19.6;
t_land = 2*v0/g;
t = linspace(0, t_land, 500);
y = v0*t - 0.5*g*t.^2;
v = v0 - g*t;
t_apex = v0/g;

%% Split into ascending and descending
t_asc = t(t <= t_apex);
t_dsc = t(t >= t_apex);
v_asc = v(t <= t_apex);
v_dsc = v(t >= t_apex);

figure('Position',[100 100 700 550])

subplot(2,1,1)
plot(t, y, 'b-', 'LineWidth', 2); hold on
xline(t_apex, '--', 'Color', [1 0.6 0], 'LineWidth', 1.5, 'Label', sprintf('apex t=%.1f s',t_apex))
yline(0, 'k-', 'LineWidth', 0.8)
ylabel('Height y (m)'); title('y(t): downward parabola (symmetric)')

subplot(2,1,2)
fill([t_asc fliplr(t_asc)], [v_asc zeros(size(v_asc))], 'g', 'FaceAlpha', 0.2); hold on
fill([t_dsc fliplr(t_dsc)], [v_dsc zeros(size(v_dsc))], 'r', 'FaceAlpha', 0.2)
plot(t, v, 'r-', 'LineWidth', 2)
xline(t_apex, '--', 'Color', [1 0.6 0], 'LineWidth', 1.5)
yline(0, 'k-', 'LineWidth', 0.8)
xlabel('Time (s)'); ylabel('v (m/s)'); title('v(t): linear (symmetric about apex)')
tight_layout`,
          prose: [
            `\`y = v0*t - 0.5*g*t.^2\` uses the element-wise \`.^\` operator. The result is a vector of y-values, one per time point. Similarly \`v = v0 - g*t\` produces the velocity vector.`,
            `The \`fill\` command shades regions under the v–t curve: green for the ascent (positive velocity) and red for the descent (negative velocity). \`fliplr(t_asc)\` reverses the time array so the fill polygon closes correctly.`,
            `The green and red areas are equal triangles, confirming that rise time equals fall time. The y–t parabola is symmetric about the orange dashed vertical line at $t_{\\text{apex}}$ — the vertex of the downward-opening parabola.`,
          ],
        },
        {
          cellTitle: 'Speed at equal heights — table of ascent vs descent',
          type: 'code',
          language: 'matlab',
          code: `%% Speed symmetry at equal heights
g = 9.8; v0 = 19.6;
y_max = v0^2 / (2*g);

fracs = [0.2, 0.4, 0.6, 0.8, 0.95];
heights = fracs * y_max;

fprintf('%-12s %-16s %-16s %-8s\\n', 'Height (m)', '|v| up (m/s)', '|v| down (m/s)', 'Match?')
fprintf('%s\\n', repmat('-',1,55))

for k = 1:numel(heights)
    h = heights(k);
    v_sq = v0^2 - 2*g*h;     % same formula for both passes
    speed = sqrt(v_sq);

    % Explicit times on each pass (roots of y(t) = h)
    disc = v0^2 - 2*g*h;
    t_up   = (v0 - sqrt(disc)) / g;
    t_down = (v0 + sqrt(disc)) / g;
    v_up_val   = v0 - g*t_up;
    v_down_val = v0 - g*t_down;

    match = abs(abs(v_up_val) - abs(v_down_val)) < 1e-9;
    fprintf('%-12.3f %-16.4f %-16.4f %-8s\\n', h, abs(v_up_val), abs(v_down_val), ...
            char('N' + 2*match))   % prints 'P' if match=1, 'N' if 0
end`,
          prose: [
            `Line 11: \`v_sq = v0^2 - 2*g*h\` is the no-time equation evaluated at height $h$. This is independent of direction — identical for both the ascending and descending passes. The speed \`sqrt(v_sq)\` is therefore the same on both passes.`,
            `Lines 14–17 compute the actual times when the ball is at height $h$ on each pass (quadratic roots). Lines 18–19 use \`v = v0 - g*t\` to find the signed velocities. The \`abs()\` values are compared for equality.`,
            `\`char('N' + 2*match)\` is a compact trick: when \`match=1\`, \`'N' + 2 = 'P'\` (ASCII); when \`match=0\`, it stays \`'N'\`. All rows should print \`P\` — confirming speed symmetry at every sampled height.`,
          ],
        },
        {
          cellTitle: 'Challenge — recover v₀ from flight time and peak height',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `%% Recover launch speed from two independent measurements
% Observed: total flight time T = 5.0 s, peak height h = 30.6 m
g = 9.8;
T = 5.0;    % s (total flight time, returns to launch height)
h = 30.6;   % m (peak height)

% Method 1: T = 2*v0/g  →  solve for v0
v0_time   = ???;

% Method 2: h = v0²/(2g)  →  solve for v0
v0_height = ???;

fprintf('v0 from flight time  : %.4f m/s\\n', v0_time)
fprintf('v0 from peak height  : %.4f m/s\\n', v0_height)
fprintf('Methods agree (0.1%%): %d\\n', abs(v0_time - v0_height)/v0_time < 1e-3)

%% Verify by simulating forward
t_land_check = 2 * v0_time / g;
y_peak_check = v0_time^2 / (2*g);
fprintf('Simulated T         : %.4f s (target %.1f)\\n', t_land_check, T)
fprintf('Simulated h         : %.4f m (target %.1f)\\n', y_peak_check, h)`,
          prose: [
            `Fill in two blanks: (1) \`v0_time = g * T / 2\` — rearranging $T = 2v_0/g$; (2) \`v0_height = sqrt(2*g*h)\` — rearranging $h = v_0^2/(2g)$. Both should produce $v_0 \\approx 24.5$ m/s.`,
            `The agreement check \`abs(v0_time - v0_height)/v0_time < 1e-3\` verifies that both methods give the same answer to within 0.1%. In real experiments, small measurement errors would cause slight disagreement.`,
            `The verification block at the bottom simulates forward from the recovered $v_0$ and checks that the resulting $T$ and $h$ match the observed values. Expected: \`Simulated T: 5.0000 s\`, \`Simulated h: 30.625 m\` (close to 30.6 m, any discrepancy is from rounding).`,
          ],
        },
      ],
    },
  },
  quiz: [
    {
      id: 'p1-ch2-013-q1',
      type: 'choice',
      question: `Why is free-fall motion symmetric about the apex (in the absence of air resistance)?`,
      options: [
        `Gravity reverses direction at the apex`,
        `Constant acceleration makes the velocity change linear, so rise and fall mirror each other`,
        `The speed at the apex is zero, so kinetic energy is conserved`,
        `Mass cancels in all equations`,
      ],
      answer: `Constant acceleration makes the velocity change linear, so rise and fall mirror each other`,
      hints: [
        `What shape is the v–t graph for constant acceleration?`,
        `If $v(t)$ is a straight line crossing zero at $t_{\\text{peak}}$, what does the graph look like on each side of that crossing?`,
      ],
      reviewSection: 'intuition',
      explanation: `$v(t) = v_0 - gt$ is linear. The apex occurs at $t_{\\text{peak}} = v_0/g$ when $v = 0$. By linearity, the same time elapses falling back to the original height. This follows directly from constant $g$.`,
    },
    {
      id: 'p1-ch2-013-q2',
      type: 'choice',
      question: `A ball is thrown upward at 19.6 m/s. How long does it take to reach the apex?`,
      options: [`1 s`, `2 s`, `3 s`, `4 s`],
      answer: `2 s`,
      hints: [
        `At the apex, $v = 0$. Use $v = v_0 - gt$ with $v = 0$.`,
        `$t_{\\text{peak}} = v_0/g = 19.6/9.8 = ?$`,
      ],
      reviewSection: 'examples',
      explanation: `$t_{\\text{peak}} = v_0/g = 19.6/9.8 = 2$ s. At this moment $v = 0$.`,
    },
    {
      id: 'p1-ch2-013-q3',
      type: 'choice',
      question: `For the same ball ($v_0 = 19.6$ m/s), what is the total flight time back to the launch point?`,
      options: [`2 s`, `4 s`, `6 s`, `8 s`],
      answer: `4 s`,
      hints: [
        `Use the symmetry result $T = 2t_{\\text{peak}}$.`,
        `Or set $y = 0$ in $y = v_0 t - \\tfrac{1}{2}gt^2$ and solve the quadratic.`,
      ],
      reviewSection: 'math',
      explanation: `$T = 2v_0/g = 2 \\times 2 = 4$ s. Symmetry: fall time = rise time = 2 s.`,
    },
    {
      id: 'p1-ch2-013-q4',
      type: 'choice',
      question: `A ball is thrown upward at 14.7 m/s. What is its speed when it returns to the launch height?`,
      options: [`0 m/s`, `7.35 m/s`, `14.7 m/s`, `29.4 m/s`],
      answer: `14.7 m/s`,
      hints: [
        `At the launch height, net displacement $\\Delta y = 0$. Use $v^2 = v_0^2 - 2g(0)$.`,
        `$v^2 = v_0^2$ means $|v| = v_0$.`,
      ],
      reviewSection: 'challenges',
      explanation: `$v^2 = v_0^2 - 2g(0) = v_0^2 \\Rightarrow |v_{\\text{land}}| = v_0 = 14.7$ m/s.`,
    },
    {
      id: 'p1-ch2-013-q5',
      type: 'choice',
      question: `At the apex of a vertical throw, which statement is TRUE?`,
      options: [
        `Both velocity and acceleration are zero`,
        `Velocity is zero; acceleration is still $-g$ (up-positive)`,
        `Velocity is zero; acceleration is zero momentarily`,
        `Velocity is $v_0/2$; acceleration is $-g$`,
      ],
      answer: `Velocity is zero; acceleration is still $-g$ (up-positive)`,
      hints: [
        `Velocity is zero at the apex — the ball momentarily stops.`,
        `Has gravity switched off? What is the acceleration due to gravity at every point in free fall?`,
      ],
      reviewSection: 'intuition',
      explanation: `At the apex $v = 0$, but $a = -g \\neq 0$ throughout. Gravity never stops. The object is instantaneously at rest but not in equilibrium — the non-zero acceleration immediately starts the downward fall.`,
    },
    {
      id: 'p1-ch2-013-q6',
      type: 'choice',
      question: `What shape does the y–t graph have for a vertically thrown object?`,
      options: [
        `A triangle (up then down)`,
        `A downward-opening parabola`,
        `An upward-opening parabola`,
        `A straight line`,
      ],
      answer: `A downward-opening parabola`,
      hints: [
        `$y(t) = v_0 t - \\tfrac{1}{2}gt^2$ is a quadratic in $t$. What is the sign of the $t^2$ coefficient?`,
        `Negative leading coefficient means the parabola opens downward.`,
      ],
      reviewSection: 'math',
      explanation: `$y(t) = v_0 t - \\tfrac{1}{2}gt^2$ has a negative $t^2$ coefficient, giving a downward-opening parabola with its vertex (maximum) at the apex.`,
    },
    {
      id: 'p1-ch2-013-q7',
      type: 'choice',
      question: `Using $v^2 = v_0^2 - 2g\\Delta y$, what is the maximum height if $v_0 = 14.7$ m/s?`,
      options: [`5.5 m`, `11.0 m`, `16.5 m`, `22.0 m`],
      answer: `11.0 m`,
      hints: [
        `At the peak, $v = 0$. Substitute into the no-time equation and solve for $\\Delta y$.`,
        `$\\Delta y = v_0^2/(2g) = (14.7)^2 / (2 \\times 9.8)$.`,
      ],
      reviewSection: 'examples',
      explanation: `$0 = (14.7)^2 - 2(9.8)\\Delta y \\Rightarrow \\Delta y = 216.09/19.6 \\approx 11.0$ m.`,
    },
    {
      id: 'p1-ch2-013-q8',
      type: 'choice',
      question: `Air resistance breaks the symmetry of free fall. What effect does it have on the descent compared to ideal free fall?`,
      options: [
        `Descent is faster; impact speed > launch speed`,
        `Descent is slower; impact speed < launch speed`,
        `No effect — air resistance acts equally on both passes`,
        `The object never returns to the launch height`,
      ],
      answer: `Descent is slower; impact speed < launch speed`,
      hints: [
        `Air resistance always opposes the direction of motion. On the way down, which direction does drag act?`,
        `On the way up, both drag and gravity act downward. On the way down, gravity acts downward but drag acts upward — partially cancelling gravity.`,
      ],
      reviewSection: 'rigor',
      explanation: `On the way up, drag and gravity both decelerate the ball (both downward). On the way down, gravity pulls down but drag acts upward — the net downward force is smaller. The descent is slower and the impact speed is less than the launch speed.`,
    },
    {
      id: 'p1-ch2-013-q9',
      type: 'choice',
      question: `A ball is thrown upward and has a total flight time of 3 s (returns to launch height). What was the launch speed?`,
      options: [`9.8 m/s`, `14.7 m/s`, `19.6 m/s`, `29.4 m/s`],
      answer: `14.7 m/s`,
      hints: [
        `Use $T = 2v_0/g$ and solve for $v_0$.`,
        `$v_0 = gT/2 = 9.8 \\times 3/2 = ?$`,
      ],
      reviewSection: 'examples',
      explanation: `$v_0 = gT/2 = 9.8 \\times 3/2 = 14.7$ m/s.`,
    },
    {
      id: 'p1-ch2-013-q10',
      type: 'choice',
      question: `A ball is thrown upward at 20 m/s and lands on a rooftop at 15 m above the launch point. Is the landing speed equal to, greater than, or less than 20 m/s?`,
      options: [
        `Equal to 20 m/s — the symmetry law always holds`,
        `Greater than 20 m/s — it gains speed on the way down`,
        `Less than 20 m/s — it has given up kinetic energy to rise to 15 m`,
        `Zero — the ball stops at the rooftop`,
      ],
      answer: `Less than 20 m/s — it has given up kinetic energy to rise to 15 m`,
      hints: [
        `The ball is NOT landing at the launch height — it lands 15 m higher. Does the symmetry $|v_{\\text{land}}| = v_0$ still apply?`,
        `Use $v_f^2 = v_0^2 - 2g(15)$. Is this less than or greater than $v_0^2$?`,
      ],
      reviewSection: 'challenges',
      explanation: `$v_f^2 = (20)^2 - 2(9.8)(15) = 400 - 294 = 106 \\Rightarrow |v_f| \\approx 10.3$ m/s. The symmetry $|v_{\\text{land}}| = v_0$ only holds when the landing height equals the launch height.`,
    },
  ],
  misconceptions: [
    {
      id: 'p1-ch2-013-m1',
      misconception: `"The return speed equals the launch speed even when landing at a different height."`,
      correction: `The symmetry $|v_{\\text{land}}| = v_0$ only applies when the ball returns to the exact height it was launched from ($\\Delta y = 0$). When landing at a different height, use $v_f^2 = v_0^2 - 2g\\Delta y$ with the actual $\\Delta y$.`,
      correctionExample: `Ball thrown at 20 m/s from the ground, lands on a roof 10 m high: $v_f^2 = 400 - 196 = 204 \\Rightarrow |v_f| \\approx 14.3$ m/s, not 20 m/s.`,
    },
    {
      id: 'p1-ch2-013-m2',
      misconception: `"Symmetry means the ball spends equal time above and below some midpoint height."`,
      correction: `Free-fall time symmetry is about the apex (maximum height), not any other height. The ball spends equal time on both sides of the apex — that is, the time to rise from any height $h$ to the apex equals the time to fall from the apex back to the same height $h$.`,
      correctionExample: `From ground ($h = 0$) to apex takes $t_{\\text{peak}} = v_0/g$. From apex back to ground takes the same time. But from $h = y_{\\text{max}}/2$ to the apex takes much less time than from $h = 0$ to $h = y_{\\text{max}}/2$ (the parabola is steeper at lower heights).`,
    },
  ],
  transferPrompts: [
    {
      id: 'p1-ch2-013-tp1',
      prompt: `In table tennis, a ball is struck upward at a shallow angle. The symmetry argument says it returns with the same speed it was hit with. In reality, players report that smashed balls come back slower when lobbed. What physical effect causes this, and how would you model it quantitatively?`,
    },
    {
      id: 'p1-ch2-013-tp2',
      prompt: `Electron emitters in physics experiments launch electrons "upward" against an electric field (which acts like negative gravity). Does the same symmetry argument apply — will the electron return with the same speed? Under what conditions would this break?`,
    },
  ],
  debugging: [
    {
      id: 'p1-ch2-013-d1',
      buggyWork: `A student claims: "A ball thrown upward at 25 m/s has total flight time $T = v_0/g = 25/9.8 \\approx 2.55$ s." They use this to find impact speed as $v = 25 - 9.8(2.55) \\approx 0$ m/s.`,
      question: `What is the error? Find the correct flight time and impact velocity.`,
      answer: `The student used $T = v_0/g$, which is the time to the apex, not the total flight time. Total flight time is $T = 2v_0/g = 2(25)/9.8 \\approx 5.10$ s. Impact velocity: $v = 25 - 9.8(5.10) = 25 - 49.98 \\approx -25$ m/s (downward, magnitude 25 m/s). The answer $v \\approx 0$ m/s is the velocity at the apex, not at landing.`,
    },
    {
      id: 'p1-ch2-013-d2',
      buggyWork: `A student solves: "Ball thrown upward at 30 m/s, lands on a roof 20 m high. By symmetry, landing speed = 30 m/s." They write no equations.`,
      question: `What is the student's error? Compute the correct landing speed.`,
      answer: `The student applied the symmetry shortcut $|v_{\\text{land}}| = v_0$ without checking that the landing height equals the launch height. It does not — the roof is 20 m above the launch point. Correct: $v_f^2 = v_0^2 - 2gh = 900 - 2(9.8)(20) = 900 - 392 = 508 \\Rightarrow |v_f| = \\sqrt{508} \\approx 22.5$ m/s, not 30 m/s.`,
    },
  ],
  mastery: {
    targetLevel: `Use free-fall symmetry properties (rise time = fall time, $|v_{\\text{land}}| = v_0$, equal speeds at equal heights) as shortcuts when landing at the launch height, and correctly identify when symmetry breaks (different landing height, air resistance).`,
    coreSkill: `Recognizing when the landing height equals the launch height (so symmetry applies) vs. when it differs (so the full no-time equation is needed).`,
    commonSticking: `Applying the return-speed symmetry $|v_{\\text{land}}| = v_0$ to problems where the ball lands at a different height. Fix: always check $\\Delta y$ before using symmetry shortcuts.`,
    connections: [
      `ch2-012 (free fall basics) — the SUVAT equations that underpin the symmetry`,
      `ch2-015 (upward launch) — full treatment of the two-phase upward-then-downward flight`,
      `ch4 (projectile motion) — the vertical component of a projectile is exactly this symmetry argument`,
      `Energy (later chapter) — speed symmetry and energy conservation are equivalent statements`,
    ],
  },
  semantics: {
    core: [
      { symbol: `t_{\\text{peak}}`, meaning: `Time from launch to the apex (where $v = 0$); equals $v_0/g$ when thrown upward` },
      { symbol: `T_{\\text{total}}`, meaning: `Total flight time when landing at launch height; equals $2v_0/g = 2t_{\\text{peak}}$` },
      { symbol: `y_{\\text{max}}`, meaning: `Maximum height above launch point; equals $v_0^2/(2g)$` },
      { symbol: `|v_{\\text{land}}|`, meaning: `Landing speed; equals $v_0$ when landing at launch height, less than $v_0$ when landing higher` },
      { symbol: `\\Delta y`, meaning: `Net displacement from launch to landing; zero when returning to launch height, non-zero when landing elsewhere` },
    ],
    rulesOfThumb: [
      `When landing at the launch height: use $T = 2v_0/g$ and $|v_{\\text{land}}| = v_0$ as instant shortcuts.`,
      `When landing at a different height: use $v_f^2 = v_0^2 - 2g\\Delta y$ with the actual $\\Delta y$. Symmetry does not apply.`,
      `Speed at any height $h$ on the way up equals speed at $h$ on the way down: $v^2 = v_0^2 - 2gh$ is the same expression for both passes.`,
      `Air resistance always reduces the return speed below the launch speed. The symmetry is an ideal-gas idealization.`,
      `Time to rise to any intermediate height is always less than time to fall from the apex to that height (the parabola is flatter near the apex).`,
    ],
  },
};

export default {
  id: 'p1-ch2-014',
  slug: 'free-fall-sign-convention',
  chapter: 'p2',
  order: 14,
  title: "Free Fall Sign Convention",
  subtitle: "Pick one positive direction and keep all quantities consistent.",
  tags: ["sign convention", "free fall", "kinematics"],
  aliases: "up positive down positive free fall signs convention",
  hook: {
    question: "Why do students get different answers from the same equation set?",
    realWorldContext:
      "Most free-fall mistakes are sign mistakes, not algebra mistakes. Building a disciplined sign-assignment habit eliminates an entire class of errors across kinematics, dynamics, and projectile motion.",
    previewVisualizationId: 'SVGDiagram',
  },
  intuition: {
    prose: [
      `Before reading on, predict: a ball is thrown downward at 8 m/s from a window. You choose up as positive. What values do you write for $v_0$ and $a$? Now switch to down as positive. Write the values again. Do you get the same final answers for time and impact speed? Think through it before reading on.`,
      `A sign convention is a choice: which direction gets the positive label. In free-fall problems, the two standard choices are up-positive and down-positive. The physics — how fast the object falls, where it lands, how long it takes — is the same regardless. What changes is only the sign of each number in your equations.`,
      `With up-positive: velocities that point upward are positive, velocities pointing downward are negative, and $a = -9.8$ m/s² (gravity pulls in the negative direction). With down-positive: downward velocities are positive, upward velocities are negative, and $a = +9.8$ m/s² (gravity pulls in the positive direction). The equations look different, but they model the same physics.`,
      `The golden rule: all quantities in a given problem must use the same convention. The moment you write $a = +9.8$ m/s² (down-positive) but then treat a downward throw as $v_0 = -8$ m/s (as if up-positive), the equation becomes a contradiction. Both the numerical values and the signs must be chosen from one consistent framework.`,
      `The best practice is to write your convention explicitly at the top of every free-fall problem — even a single line like "up = positive" — before assigning any numbers. This forced declaration is cheap insurance against the most common category of kinematics error.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Sign-assignment checklist',
        body: `1. Write your convention at the top: "up = positive" or "down = positive."\n2. Assign $a$: $-g$ (up+) or $+g$ (down+). This is always the first number you assign.\n3. Assign $v_0$: positive if the initial velocity points in your positive direction, negative if opposite.\n4. Assign positions and displacements consistently: positive = in your chosen direction.\n5. Solve and check: if displacement is negative in up-positive, the object moved downward — that makes sense.`,
      },
      {
        type: 'warning',
        title: 'Mixing conventions is the #1 free-fall error',
        body: `If you choose down-positive, do NOT write $a = -g$. If you choose up-positive, do NOT write an upward-thrown ball as $v_0 = -v$ (negative). Flip only if you also flip the convention for every other quantity in the problem.`,
      },
      {
        type: 'insight',
        title: 'When to choose each convention',
        body: `Up-positive is the standard in most textbooks and gives negative velocities for falling objects (which feels natural: downward = bad sign). Down-positive is sometimes easier when everything in the problem moves downward (e.g., a rock falling into a well), because you avoid a page full of minus signs. Either works — choose the one that minimizes minus signs in your specific problem.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-fall-axes' },
        title: 'Axis orientation and sign of g',
        caption: 'The physics is axis-independent. Choosing +y upward makes a = −g (negative). Choosing +y downward makes a = +g (positive). Both give the same trajectory — only the sign labels differ.',
      },
    ],
  },
  math: {
    prose: [
      `The two conventions produce equations that look different but are algebraically equivalent. Under up-positive: $v = v_0 - gt$, $y = y_0 + v_0 t - \\tfrac{1}{2}gt^2$, and $v^2 = v_0^2 - 2g\\Delta y$. Under down-positive with $v_0' = -v_0$ (upward throw becomes negative), $a' = +g$, $\\Delta y' = -\\Delta y$: the same equations hold with all signs flipped.`,
      `The cleanest way to verify this is to compute a physical quantity — say, the time for a drop from height $h$ — in both conventions. Up-positive: $0 = h - \\tfrac{1}{2}gt^2 \\Rightarrow t = \\sqrt{2h/g}$. Down-positive: $h = \\tfrac{1}{2}gt^2 \\Rightarrow t = \\sqrt{2h/g}$. Same formula, same result.`,
      `When the initial velocity has components in both the positive and negative directions (e.g., a throw at an angle), the sign convention must be extended consistently to all components. This is the foundation for 2D projectile motion in chapter 4.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'SUVAT under two conventions (same height problem)',
        body: `\\underbrace{v = v_0 - gt,\\; \\Delta y = v_0 t - \\tfrac{1}{2}gt^2}_{\\text{up-positive}} \\equiv \\underbrace{v' = v_0' + gt,\\; \\Delta y' = v_0' t + \\tfrac{1}{2}gt^2}_{\\text{down-positive, primed}}`,
      },
      {
        type: 'warning',
        title: 'Common pitfall',
        body: `Mixing up-positive formula $v = v_0 - gt$ with a down-positive number $a = +9.8$ in the same line. This gives $v = v_0 - (+9.8)t$, which looks like up-positive but the sign of $a$ is wrong.`,
      },
    ],
  },
  rigor: {
    prose: [
      `Formally, switching from up-positive to down-positive is a coordinate transformation $y' = -y$ (flip the axis). Under this transformation, velocity transforms as $v' = dy'/dt = -dy/dt = -v$, and acceleration transforms as $a' = -a$. Starting from $\\ddot y = -g$ (up-positive), the transformed equation is $\\ddot y' = -\\ddot y = -(-g) = +g$. So the equation of motion under down-positive is $\\ddot y' = +g$ — exactly as expected.`,
      `The invariant is the physical trajectory: the path through space that the object actually follows. Two equations $(y(t), \\text{up+})$ and $(y'(t), \\text{down+})$ with $y'(t) = -y(t)$ describe the same worldline — just labeled with opposite signs. Any physical question (time of flight, speed, where it lands) has the same numerical answer regardless of which labeling you use.`,
      `This is a special case of Galilean covariance: the Newtonian equation of motion $F = ma$ is form-invariant under spatial reflections (flipping an axis). Physical laws do not depend on which direction you call positive. Only computational conventions — sign bookkeeping — change.`,
      `In more advanced treatments, this extends to choosing arbitrary positive directions in 3D and to choosing rotating reference frames. The principle is the same: pick a consistent set of basis vectors, assign signs accordingly, and the physics is unchanged. Sign conventions are a human bookkeeping device, not a physical constraint.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Axis-flip invariance',
        body: `y' = -y \\implies \\ddot{y}' = -g \\cdot (-1) = +g \\quad \\text{(down-positive equation of motion)}`,
      },
    ],
  },
  examples: [
    {
      id: 'p1-ch2-014-ex1',
      title: 'Same drop, two conventions — full comparison',
      problem: `An object is dropped from rest and falls for 2 s. Compute displacement and final velocity under both up-positive and down-positive conventions.`,
      steps: [
        {
          expression: `\\text{Up-positive: }v_0 = 0,\\;a = -9.8\\text{ m/s}^2`,
          annotation: `Gravity acts downward, which is negative in up-positive.`,
        },
        {
          expression: `\\Delta y_{\\text{up}+} = 0 + \\tfrac{1}{2}(-9.8)(4) = -19.6\\text{ m},\\quad v_{\\text{up}+} = -9.8(2) = -19.6\\text{ m/s}`,
          annotation: `Negative results: the object moved downward and is moving downward. Physically: fell 19.6 m at 19.6 m/s downward.`,
        },
        {
          expression: `\\text{Down-positive: }v_0 = 0,\\;a = +9.8\\text{ m/s}^2`,
          annotation: `Gravity acts downward, which is positive in down-positive.`,
        },
        {
          expression: `\\Delta y_{\\text{dn}+} = 0 + \\tfrac{1}{2}(+9.8)(4) = +19.6\\text{ m},\\quad v_{\\text{dn}+} = +9.8(2) = +19.6\\text{ m/s}`,
          annotation: `Positive results: the object moved in the positive (downward) direction and is moving in the positive (downward) direction.`,
        },
        {
          expression: `|\\Delta y_{\\text{up}+}| = |\\Delta y_{\\text{dn}+}| = 19.6\\text{ m},\\quad |v_{\\text{up}+}| = |v_{\\text{dn}+}| = 19.6\\text{ m/s}`,
          annotation: `Same physical fall, same physical speed — only the sign differs. Convention changes labels, not physics.`,
        },
      ],
      conclusion: `Displacement magnitude: 19.6 m. Impact speed: 19.6 m/s. Both conventions give the same physics; only the sign of the result differs.`,
    },
    {
      id: 'p1-ch2-014-ex2',
      title: 'Downward throw — sign of v₀ differs by convention',
      problem: `A ball is thrown downward at 5 m/s from a height of 20 m above the ground. Find the time to land using (a) up-positive and (b) down-positive.`,
      steps: [
        {
          expression: `\\text{Up+: }v_0 = -5\\text{ m/s},\\;a = -9.8\\text{ m/s}^2,\\;y_0 = 20\\text{ m},\\;y_f = 0`,
          annotation: `Thrown downward means $v_0$ is negative. Initial height is +20 m (above ground reference).`,
        },
        {
          expression: `0 = 20 + (-5)t + \\tfrac{1}{2}(-9.8)t^2 \\implies 4.9t^2 + 5t - 20 = 0`,
          annotation: `Standard form. Take the positive root.`,
        },
        {
          expression: `t = \\frac{-5 + \\sqrt{25 + 4(4.9)(20)}}{9.8} = \\frac{-5 + \\sqrt{417}}{9.8} \\approx \\frac{-5 + 20.42}{9.8} \\approx 1.57\\text{ s}`,
          annotation: `Up-positive gives $t \\approx 1.57$ s.`,
        },
        {
          expression: `\\text{Down+: }v_0 = +5\\text{ m/s},\\;a = +9.8\\text{ m/s}^2,\\;\\Delta y = +20\\text{ m}`,
          annotation: `Thrown downward is positive. Fall distance is +20 m (in the positive/downward direction).`,
        },
        {
          expression: `20 = 5t + \\tfrac{1}{2}(9.8)t^2 \\implies 4.9t^2 + 5t - 20 = 0`,
          annotation: `Same quadratic equation! Only the interpretation of signs differed.`,
        },
        {
          expression: `t \\approx 1.57\\text{ s (identical)}`,
          annotation: `Same answer. The two conventions are algebraically equivalent when applied consistently.`,
        },
      ],
      conclusion: `Flight time is ≈ 1.57 s under both conventions. The quadratic equation is identical — the sign convention affects how you write the equation, not what the equation is.`,
    },
    {
      id: 'p1-ch2-014-ex3',
      title: 'Upward throw under down-positive convention',
      problem: `A ball is thrown upward at 14.7 m/s. Using the down-positive convention, find the time to the apex and the maximum height.`,
      steps: [
        {
          expression: `v_0 = -14.7\\text{ m/s (upward = negative in down+)},\\quad a = +9.8\\text{ m/s}^2`,
          annotation: `In down-positive, upward motion is in the negative direction, so $v_0 = -14.7$ m/s. Gravity still acts in the positive (downward) direction: $a = +9.8$.`,
        },
        {
          expression: `v = 0\\text{ at apex}: 0 = -14.7 + 9.8 t \\implies t = \\frac{14.7}{9.8} = 1.5\\text{ s}`,
          annotation: `Solve $v = 0$. The negative divided by positive gives a positive time — physically sensible.`,
        },
        {
          expression: `\\Delta y = -14.7(1.5) + \\tfrac{1}{2}(9.8)(2.25) = -22.05 + 11.025 = -11.025\\text{ m}`,
          annotation: `Displacement is $-11.025$ m. In down-positive, negative means upward — so the apex is 11.025 m above the launch point. `,
        },
        {
          expression: `h = |\\Delta y| = 11.025\\text{ m}\\quad (\\text{same as up-positive: }v_0^2/(2g) = (14.7)^2/19.6 = 11.025\\text{ m})`,
          annotation: `Maximum height is 11.025 m regardless of convention. The negative sign in down-positive just means the apex is above the reference point.`,
        },
      ],
      conclusion: `Apex at 1.5 s, height 11.025 m — identical to the up-positive result. The negative $\\Delta y$ in down-positive is expected: it means the ball moved in the upward (negative) direction.`,
    },
  ],
  challenges: [
    {
      id: 'p1-ch2-014-ch1',
      difficulty: 'medium',
      problem: `A ball is thrown upward at 9.8 m/s from ground level. Solve for the total flight time (a) using up-positive and (b) using down-positive. Confirm the answers match.`,
      hint: `In down-positive, the ball starts at $\\Delta y = 0$, moves to a negative maximum, then returns to $\\Delta y = 0$. Set $\\Delta y = 0$ in each convention and factor the quadratic.`,
      walkthrough: [
        {
          expression: `\\text{Up+: }v_0 = +9.8,\\;a = -9.8\\;\\Rightarrow\\; 0 = 9.8t - \\tfrac{1}{2}(9.8)t^2 = t(9.8 - 4.9t)`,
          annotation: `Factor out $t$: the non-zero solution is $t = 9.8/4.9 = 2$ s.`,
        },
        {
          expression: `T_{\\text{up+}} = 2\\text{ s}`,
          annotation: `Total flight time under up-positive convention.`,
        },
        {
          expression: `\\text{Down+: }v_0 = -9.8,\\;a = +9.8\\;\\Rightarrow\\; 0 = -9.8t + \\tfrac{1}{2}(9.8)t^2 = t(-9.8 + 4.9t)`,
          annotation: `Same structure. Factor out $t$: non-zero solution is $t = 9.8/4.9 = 2$ s.`,
        },
        {
          expression: `T_{\\text{dn+}} = 2\\text{ s}\\quad (\\text{identical})`,
          annotation: `Both conventions give 2 s. The flight time is a physical quantity — it cannot depend on the sign convention.`,
        },
      ],
    },
    {
      id: 'p1-ch2-014-ch2',
      difficulty: 'medium',
      problem: `A rock is dropped into a well. Using down-positive (which is natural here), the rock lands at $\\Delta y = +78.4$ m. Find the time of fall and impact speed. Then restate the problem in up-positive and verify the same answers.`,
      hint: `In down-positive, $v_0 = 0$ (dropped from rest) and $a = +g = +9.8$ m/s². In up-positive, $\\Delta y = -78.4$ m.`,
      walkthrough: [
        {
          expression: `\\text{Down+: }v_0 = 0,\\;a = +9.8,\\;\\Delta y = +78.4\\text{ m}`,
          annotation: `All positive — down-positive is natural for a downward-only problem.`,
        },
        {
          expression: `78.4 = \\tfrac{1}{2}(9.8)t^2 \\implies t = \\sqrt{78.4/4.9} = \\sqrt{16} = 4\\text{ s}`,
          annotation: `Clean algebra: $t = 4$ s.`,
        },
        {
          expression: `v_f = 0 + 9.8(4) = 39.2\\text{ m/s (downward, positive)}`,
          annotation: `Impact speed 39.2 m/s in the positive (downward) direction.`,
        },
        {
          expression: `\\text{Up+: }v_0 = 0,\\;a = -9.8,\\;\\Delta y = -78.4\\text{ m}\\;\\Rightarrow\\; -78.4 = -\\tfrac{1}{2}(9.8)t^2 \\implies t = 4\\text{ s}\\checkmark`,
          annotation: `Same answer, but with negative signs throughout. Down-positive was simpler here.`,
        },
        {
          expression: `v_f = -9.8(4) = -39.2\\text{ m/s}\\quad |v_f| = 39.2\\text{ m/s}\\checkmark`,
          annotation: `Same speed magnitude. Negative sign means downward in up-positive — correct.`,
        },
      ],
    },
    {
      id: 'p1-ch2-014-ch3',
      difficulty: 'hard',
      problem: `A student uses up-positive and writes: "Ball thrown upward at 12 m/s. $v_0 = -12$ m/s, $a = -9.8$ m/s²." They then compute $t_{\\text{peak}} = -v_0/a = -(-12)/(-9.8) = -1.22$ s. Identify every error and find the correct answer.`,
      hint: `Identify the sign error on $v_0$. Then check whether the formula $t = -v_0/a$ is correct.`,
      walkthrough: [
        {
          expression: `\\text{Error 1: }v_0 = +12\\text{ m/s (upward = positive in up+, not negative)}`,
          annotation: `Up-positive means upward is positive. A ball thrown upward has $v_0 = +12$ m/s, not $-12$ m/s.`,
        },
        {
          expression: `\\text{Error 2: the formula }t = -v_0/a\\text{ is wrong for reaching the apex}`,
          annotation: `The correct formula comes from $v = v_0 + at = 0$, giving $t = -v_0/a$. But with $v_0 = +12$ and $a = -9.8$: $t = -12/(-9.8) = +1.22$ s — positive and correct.`,
        },
        {
          expression: `\\text{Correct: }v_0 = +12,\\;a = -9.8 \\implies t_{\\text{peak}} = \\frac{12}{9.8} \\approx 1.22\\text{ s}`,
          annotation: `With the correct sign on $v_0$, the formula $t = v_0/g$ gives a positive, physically meaningful time.`,
        },
        {
          expression: `y_{\\text{max}} = \\frac{v_0^2}{2g} = \\frac{144}{19.6} \\approx 7.35\\text{ m}`,
          annotation: `Maximum height is 7.35 m.`,
        },
      ],
    },
  ],
  checkpoints: [
    {
      id: 'p1-ch2-014-cp1',
      question: `You are using down-positive and a ball is thrown upward at 20 m/s. What values do you write for $v_0$ and $a$?`,
      answer: `$v_0 = -20$ m/s (upward is opposite to the positive/downward direction) and $a = +9.8$ m/s² (gravity acts in the positive/downward direction). Both signs follow from committing to down-positive before assigning any numbers.`,
    },
    {
      id: 'p1-ch2-014-cp2',
      question: `A student computes $\\Delta y = -45$ m in the up-positive convention. What does this mean physically?`,
      answer: `The object moved 45 m downward (in the negative direction). The negative sign is information — it tells you the direction of displacement. The magnitude 45 m is the distance traveled downward.`,
    },
  ],
  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Same drop — two conventions compared side by side',
          type: 'code',
          language: 'python',
          code: `g = 9.8    # magnitude of g  (always positive)
t = 2.0    # s

# Convention A: up = positive
v0_A =  0.0     # dropped from rest
a_A  = -g       # gravity downward → negative
dx_A = v0_A*t + 0.5*a_A*t**2
v_A  = v0_A + a_A*t

# Convention B: down = positive
v0_B =  0.0     # dropped from rest
a_B  = +g       # gravity downward → positive
dx_B = v0_B*t + 0.5*a_B*t**2
v_B  = v0_B + a_B*t

print("Up-positive convention:")
print(f"  Δy = {dx_A:.2f} m  (negative = downward ✓)")
print(f"  v  = {v_A:.2f} m/s (negative = downward ✓)")
print()
print("Down-positive convention:")
print(f"  Δy = {dx_B:.2f} m  (positive = downward ✓)")
print(f"  v  = {v_B:.2f} m/s (positive = downward ✓)")
print()
print("Physical agreement:")
print(f"  Distance fallen : |{dx_A:.2f}| = {dx_B:.2f} m  ({'✓' if abs(abs(dx_A)-dx_B)<1e-9 else '✗'})")
print(f"  Impact speed    : |{v_A:.2f}| = {v_B:.2f} m/s  ({'✓' if abs(abs(v_A)-v_B)<1e-9 else '✗'})")`,
          prose: [
            `Lines 4–8 (Convention A): \`a_A = -g\` because gravity pulls downward and up is the positive direction. Lines 11–15 (Convention B): \`a_B = +g\` because gravity pulls in the positive (downward) direction. Both use the same formula \`dx = v0*t + 0.5*a*t²\` — only the sign of \`a\` differs.`,
            `The print statements show that \`dx_A = -19.6\` and \`dx_B = +19.6\`. Different signs, same magnitude. The negative in A means "the object moved in the negative (downward) direction." The positive in B means "the object moved in the positive (downward) direction." Both describe the same physical fall.`,
            `Lines 23–25 compute \`|dx_A| == dx_B\` and \`|v_A| == v_B\`. These checks confirm that magnitudes (physical quantities) are convention-independent. Both should print ✓.`,
          ],
        },
        {
          cellTitle: 'Downward throw — sign of v₀ differs by convention',
          type: 'code',
          language: 'python',
          code: `import numpy as np

g = 9.8
throw_speed = 5.0  # magnitude  (m/s)
h = 20.0           # height above ground  (m)

# Up-positive: thrown downward → v0 is negative
v0_up  = -throw_speed   # downward in up+ convention
a_up   = -g
# y(t) = h + v0*t + 0.5*a*t²  = 0 at ground
# Rearrange: 0.5*|a|*t² + |v0|*t - h = 0  (with correct signs)
roots_up = np.roots([0.5*a_up, v0_up, h])
t_up     = max(roots_up)   # take the positive root
v_land_up = v0_up + a_up * t_up

# Down-positive: thrown downward → v0 is positive
v0_dn  = +throw_speed   # downward in down+ convention
a_dn   = +g
# Object starts h above ground; ground is -h in down+ (below starting point = negative)
# Wait: in down+, ground IS below starting point → Δy = +h (object falls +h in down+ direction)
roots_dn = np.roots([0.5*a_dn, v0_dn, -h])
t_dn     = max(roots_dn)
v_land_dn = v0_dn + a_dn * t_dn

print(f"Up-positive:   t = {t_up:.4f} s   |v_land| = {abs(v_land_up):.4f} m/s")
print(f"Down-positive: t = {t_dn:.4f} s   |v_land| = {abs(v_land_dn):.4f} m/s")
print(f"Times agree?   {np.isclose(t_up, t_dn)}")
print(f"Speeds agree?  {np.isclose(abs(v_land_up), abs(v_land_dn))}")`,
          prose: [
            `The key line is 8: \`v0_up = -throw_speed\`. The ball is thrown downward and up is the positive direction, so $v_0 = -5$ m/s. Contrast with line 17: \`v0_dn = +throw_speed\`. The ball is thrown downward and down is the positive direction, so $v_0 = +5$ m/s. The same physical throw gets opposite signs in the two conventions.`,
            `\`np.roots([a, b, c])\` solves $at^2 + bt + c = 0$. The three coefficients come from rearranging the SUVAT position equation with $y_f = 0$ (ground). \`max(roots_up)\` picks the positive root — the physically meaningful time.`,
            `Both \`np.isclose\` checks should return \`True\`. If they don't, a sign error was made somewhere. This is a powerful debugging technique: if the two conventions give different physical answers, at least one has an inconsistent sign assignment.`,
          ],
        },
        {
          cellTitle: 'Sign error visualization — what happens when you mix conventions',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

g = 9.8; v0 = 0.0; h = 20.0
t = np.linspace(0, 4, 400)

fig, axes = plt.subplots(1, 2, figsize=(10, 4))

# Correct: down-positive with a = +g
# starting position is 0 (top of the well); ground is +h below
y_correct = v0*t + 0.5*g*t**2    # reaches +h at t_land
t_land = np.sqrt(2*h/g)
axes[0].plot(t, y_correct, lw=2, color='steelblue')
axes[0].axhline(h, color='g', ls='--', lw=1.5, label=f'ground y={h}m')
axes[0].set_title('Correct: down+ with a = +g')
axes[0].set_ylabel('y (m, down = positive)')
axes[0].set_xlabel('t (s)')
axes[0].legend()
axes[0].invert_yaxis()   # visually show downward as down on screen

# Wrong: down-positive but used a = -g (mixed convention)
y_wrong = v0*t + 0.5*(-g)*t**2   # object appears to fly upward!
axes[1].plot(t, y_wrong, lw=2, color='tomato')
axes[1].axhline(h, color='g', ls='--', lw=1.5, label=f'ground y={h}m')
axes[1].set_title('WRONG: down+ but a = −g (mixed)')
axes[1].set_xlabel('t (s)')
axes[1].legend()
axes[1].invert_yaxis()

plt.tight_layout()
plt.show()
print("Moral: ALWAYS declare convention first; apply consistently to a.")`,
          prose: [
            `The correct plot (left) shows the object falling downward toward the ground line at $y = 20$ m. The \`invert_yaxis()\` call flips the plot so positive (downward) appears visually downward on screen — matching physical intuition.`,
            `The wrong plot (right) uses \`a = -g\` in a down-positive setup. The object moves in the negative (upward) direction and never reaches the ground line. This is physically nonsensical — the ball appears to accelerate upward away from the Earth. This is exactly what a mixed-convention calculation produces.`,
            `The code comment "object appears to fly upward!" on line 22 is the key observation. When you see a free-fall answer where the object moves away from Earth, check whether you mixed up the sign of $a$.`,
          ],
        },
        {
          cellTitle: 'Challenge — solve upward throw under down-positive convention',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# A ball is thrown UPWARD at 14.7 m/s.
# Solve using the DOWN-POSITIVE convention.
# Then verify by comparing to the up-positive result.

g = 9.8

# ── Down-positive setup ───────────────────────────────
# YOUR CODE: assign v0_dn and a_dn with correct signs
v0_dn = ???    # hint: upward is NEGATIVE in down-positive
a_dn  = ???    # hint: gravity acts in the positive (downward) direction

# Time to apex: solve v = 0  →  0 = v0_dn + a_dn * t  →  t = ???
t_peak_dn = ???

# Apex height: use Δy = v0_dn * t + 0.5 * a_dn * t²
# Note: Δy will be negative (object moved upward = negative in down+)
dy_peak_dn = ???
h_peak_dn  = abs(dy_peak_dn)   # physical height is positive

print(f"Down-positive: t_peak = {t_peak_dn:.3f} s   h = {h_peak_dn:.3f} m")

# ── Up-positive for comparison ───────────────────────
v0_up = +14.7      # upward = positive
a_up  = -g
t_peak_up = v0_up / g
h_peak_up = v0_up**2 / (2*g)

print(f"Up-positive:   t_peak = {t_peak_up:.3f} s   h = {h_peak_up:.3f} m")
print(f"Times agree?   {np.isclose(t_peak_dn, t_peak_up)}")
print(f"Heights agree? {np.isclose(h_peak_dn, h_peak_up)}")`,
          prose: [
            `Fill in four blanks: (1) \`v0_dn = -14.7\` — upward is opposite to the positive (downward) direction; (2) \`a_dn = +g\` — gravity acts downward, which is the positive direction; (3) \`t_peak_dn = -v0_dn / a_dn\` — from $v = v_0 + at = 0$; (4) \`dy_peak_dn = v0_dn*t_peak_dn + 0.5*a_dn*t_peak_dn**2\`.`,
            `Expected: $t_{\\text{peak}} \\approx 1.5$ s and $h \\approx 11.025$ m under both conventions. The down-positive $\\Delta y$ should be about $-11.025$ m (negative because the ball moved upward), so \`abs(dy_peak_dn)\` recovers the positive height.`,
            `Both \`np.isclose\` checks should return \`True\`. If they don't, at least one sign assignment is wrong. Systematic comparison is the best way to catch convention errors before they cascade into wrong final answers.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Same drop — two conventions compared',
          type: 'code',
          language: 'matlab',
          code: `%% Compare up-positive and down-positive for the same free fall
g = 9.8;    % m/s² (always positive)
t = 2.0;    % s

%% Convention A: up = positive
v0_A =  0;    % dropped from rest
a_A  = -g;    % gravity downward → negative
dx_A = v0_A*t + 0.5*a_A*t^2;
v_A  = v0_A + a_A*t;

%% Convention B: down = positive
v0_B =  0;    % dropped from rest
a_B  = +g;    % gravity downward → positive
dx_B = v0_B*t + 0.5*a_B*t^2;
v_B  = v0_B + a_B*t;

fprintf('Up-positive convention:\\n')
fprintf('  dy = %.2f m  (negative = downward)\\n', dx_A)
fprintf('  v  = %.2f m/s (negative = downward)\\n', v_A)
fprintf('\\nDown-positive convention:\\n')
fprintf('  dy = %.2f m  (positive = downward)\\n', dx_B)
fprintf('  v  = %.2f m/s (positive = downward)\\n', v_B)
fprintf('\\nPhysical agreement:\\n')
fprintf('  |dy_A| == dy_B: %d (1=true)\\n', abs(abs(dx_A)-dx_B) < 1e-9)
fprintf('  |v_A| == v_B:   %d (1=true)\\n', abs(abs(v_A)-v_B) < 1e-9)`,
          prose: [
            `\`a_A = -g\` and \`a_B = +g\` are the only differences between the two blocks. Everything else — the SUVAT formulas, the initial condition \`v0 = 0\`, the time \`t\` — is identical. The sign of $g$ in the acceleration is entirely determined by the axis convention.`,
            `\`fprintf('...\\n')\` prints formatted output with a newline. \`%.2f\` formats a float to 2 decimal places. MATLAB's \`fprintf\` is equivalent to Python's \`print(f'...')\` — the syntax is different but the purpose is the same.`,
            `The final two lines check physical agreement: \`abs(abs(dx_A)-dx_B) < 1e-9\` confirms that the two conventions give the same magnitude for displacement. Both should print \`1\` (true).`,
          ],
        },
        {
          cellTitle: 'Downward throw — sign of v₀ differs by convention',
          type: 'code',
          language: 'matlab',
          code: `%% Downward throw: v0 sign depends on convention
g           = 9.8;
throw_speed = 5.0;   % magnitude (m/s)
h           = 20.0;  % height above ground (m)

%% Up-positive: thrown downward → v0 is negative
v0_up = -throw_speed;
a_up  = -g;
% y = h + v0*t + 0.5*a*t² = 0  →  0.5*a*t² + v0*t + h = 0
coeffs_up = [0.5*a_up, v0_up, h];
roots_up  = roots(coeffs_up);
t_up      = max(real(roots_up));    % take positive root
v_land_up = v0_up + a_up*t_up;

%% Down-positive: thrown downward → v0 is positive
v0_dn = +throw_speed;
a_dn  = +g;
coeffs_dn = [0.5*a_dn, v0_dn, -h];
roots_dn  = roots(coeffs_dn);
t_dn      = max(real(roots_dn));
v_land_dn = v0_dn + a_dn*t_dn;

fprintf('Up-positive:   t=%.4f s   |v_land|=%.4f m/s\\n', t_up, abs(v_land_up))
fprintf('Down-positive: t=%.4f s   |v_land|=%.4f m/s\\n', t_dn, abs(v_land_dn))
fprintf('Times agree?   %d\\n', abs(t_up - t_dn) < 1e-6)
fprintf('Speeds agree?  %d\\n', abs(abs(v_land_up) - abs(v_land_dn)) < 1e-6)`,
          prose: [
            `MATLAB's \`roots(coeffs)\` function takes a coefficient vector \`[a, b, c]\` and solves $at^2 + bt + c = 0$, returning both roots. \`max(real(roots))\` picks the larger real root, which corresponds to the positive (physical) time.`,
            `The key difference between the two blocks is the sign of \`v0\`: \`-throw_speed\` for up-positive (downward throw is negative) and \`+throw_speed\` for down-positive (downward throw is positive). This is the line that changes between conventions.`,
            `Both conventions should print the same $t$ and $|v_{\\text{land}}|$. If they agree, both signs were applied consistently. If they disagree, at least one block has a mixed-convention error.`,
          ],
        },
        {
          cellTitle: 'Sign error visualization — mixing conventions breaks the physics',
          type: 'code',
          language: 'matlab',
          code: `%% Visualize what happens when you mix sign conventions
g = 9.8; v0 = 0; h = 20;
t = linspace(0, 4, 400);

figure('Position', [100 100 900 400])

%% Correct: down-positive, a = +g
y_correct = v0*t + 0.5*g*t.^2;   % object falls toward +h
subplot(1,2,1)
plot(t, y_correct, 'b-', 'LineWidth', 2); hold on
yline(h, 'g--', 'ground', 'LineWidth', 1.5)
set(gca, 'YDir', 'reverse')   % visually: down on screen = positive
ylabel('y (m, down = positive)')
xlabel('t (s)'); title('Correct: down+ with a = +g')
grid on

%% Wrong: down-positive but used a = -g (mixed convention)
y_wrong = v0*t + 0.5*(-g)*t.^2;   % ball "falls" upward!
subplot(1,2,2)
plot(t, y_wrong, 'r-', 'LineWidth', 2); hold on
yline(h, 'g--', 'ground', 'LineWidth', 1.5)
set(gca, 'YDir', 'reverse')
ylabel('y (m, down = positive)')
xlabel('t (s)'); title('WRONG: down+ but a = -g (mixed!)')
grid on

tight_layout
disp('Moral: declare convention first; apply it to a before anything else.')`,
          prose: [
            `\`set(gca, 'YDir', 'reverse')\` flips the y-axis so that increasing $y$ (positive = downward) appears going downward on screen. This makes the correct plot look physically natural: the ball falls down toward the ground line.`,
            `\`y_correct = 0.5*g*t.^2\` uses \`.^\` for element-wise squaring of the time array. With $a = +g$ (down-positive), the object moves in the positive (downward) direction and reaches $y = h = 20$ m at $t = \\sqrt{2h/g} \\approx 2$ s.`,
            `The wrong plot (\`a = -g\` in down-positive) produces \`y_wrong = -0.5*g*t.^2\` — negative and growing in magnitude. With the inverted axis, this looks like the object flying upward through the screen. This dramatic visual makes the error impossible to miss.`,
          ],
        },
        {
          cellTitle: 'Challenge — upward throw under down-positive convention',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `%% Solve an upward throw using DOWN-POSITIVE convention
%% then verify against up-positive

g = 9.8;

%% Down-positive setup
% YOUR CODE: assign v0_dn and a_dn with correct signs
v0_dn = ???;   % hint: upward is NEGATIVE in down-positive
a_dn  = ???;   % hint: gravity acts in the positive (downward) direction

% Time to apex: solve v = 0 → t = -v0_dn / a_dn
t_peak_dn  = ???;

% Apex displacement: Δy = v0_dn*t + 0.5*a_dn*t²  (will be negative in down+)
dy_peak_dn = ???;
h_peak_dn  = abs(dy_peak_dn);   % physical height is positive

fprintf('Down-positive: t_peak = %.3f s   h = %.3f m\\n', t_peak_dn, h_peak_dn)

%% Up-positive for comparison
v0_up     = +14.7;
a_up      = -g;
t_peak_up = v0_up / g;
h_peak_up = v0_up^2 / (2*g);

fprintf('Up-positive:   t_peak = %.3f s   h = %.3f m\\n', t_peak_up, h_peak_up)
fprintf('Times agree?   %d\\n', abs(t_peak_dn - t_peak_up) < 1e-6)
fprintf('Heights agree? %d\\n', abs(h_peak_dn - h_peak_up) < 1e-6)`,
          prose: [
            `Fill in four blanks: (1) \`v0_dn = -14.7\` (upward is negative in down-positive); (2) \`a_dn = +g\` (gravity is in the positive/downward direction); (3) \`t_peak_dn = -v0_dn / a_dn\` (from $v = v_0 + at = 0$); (4) \`dy_peak_dn = v0_dn*t_peak_dn + 0.5*a_dn*t_peak_dn^2\`.`,
            `Expected: $t_{\\text{peak}} \\approx 1.5$ s and $h \\approx 11.025$ m under both conventions. The down-positive $\\Delta y$ will be negative (the ball moved upward = in the negative/downward direction reversed), so \`abs(dy_peak_dn)\` recovers the positive height.`,
            `Both agreement checks should print \`1\`. This challenge reinforces the core lesson: sign conventions are bookkeeping — the physics is identical regardless of which direction you call positive.`,
          ],
        },
      ],
    },
  },
  quiz: [
    {
      id: 'p1-ch2-014-q1',
      type: 'choice',
      question: `An object is dropped from rest. Using up-positive, what are the signs of $v_0$, $a$, and $\\Delta y$?`,
      options: [
        `$v_0 = 0$, $a = +g$, $\\Delta y > 0$`,
        `$v_0 = 0$, $a = -g$, $\\Delta y < 0$`,
        `$v_0 = 0$, $a = -g$, $\\Delta y > 0$`,
        `$v_0 > 0$, $a = -g$, $\\Delta y < 0$`,
      ],
      answer: `$v_0 = 0$, $a = -g$, $\\Delta y < 0$`,
      hints: [
        `Dropped from rest: $v_0 = 0$. What is the direction of gravity in up-positive?`,
        `The object falls downward — what sign does a downward displacement get in up-positive?`,
      ],
      reviewSection: 'intuition',
      explanation: `Dropped from rest → $v_0 = 0$. Gravity acts downward, which is negative in up-positive → $a = -g$. The object falls → $\\Delta y < 0$.`,
    },
    {
      id: 'p1-ch2-014-q2',
      type: 'choice',
      question: `Using down-positive convention, what is $a$ for an object in free fall?`,
      options: [`$-9.8$ m/s²`, `$+9.8$ m/s²`, `$0$`, `Depends on direction of motion`],
      answer: `$+9.8$ m/s²`,
      hints: [
        `With down as positive, which direction does gravity point — positive or negative?`,
        `$a = +g$ when gravity points in the positive direction.`,
      ],
      reviewSection: 'examples',
      explanation: `With down as positive, gravity (which acts downward) is $a = +g = +9.8$ m/s². The sign depends only on the axis choice, not on the direction of motion.`,
    },
    {
      id: 'p1-ch2-014-q3',
      type: 'choice',
      question: `A ball is thrown DOWNWARD at 5 m/s. Using up-positive convention, what is $v_0$?`,
      options: [`$+5$ m/s`, `$-5$ m/s`, `$0$`, `$+9.8$ m/s`],
      answer: `$-5$ m/s`,
      hints: [
        `The ball moves downward. In up-positive, downward is the negative direction.`,
        `A velocity in the negative direction gets a negative sign.`,
      ],
      reviewSection: 'intuition',
      explanation: `Thrown downward in up-positive → $v_0 = -5$ m/s. The negative sign encodes "downward" within the up-positive convention.`,
    },
    {
      id: 'p1-ch2-014-q4',
      type: 'choice',
      question: `Under up-positive, an object dropped for 2 s has $\\Delta y = -19.6$ m. Under down-positive, the same fall has displacement:`,
      options: [`$-19.6$ m`, `$+19.6$ m`, `$0$`, `$-9.8$ m`],
      answer: `$+19.6$ m`,
      hints: [
        `The object fell 19.6 m downward. Downward is positive in down-positive convention.`,
        `Same physical distance, opposite sign.`,
      ],
      reviewSection: 'examples',
      explanation: `The same physical fall of 19.6 m downward is positive in down-positive: $\\Delta y_{\\text{dn+}} = +19.6$ m. The magnitude is the same; the sign reflects the convention.`,
    },
    {
      id: 'p1-ch2-014-q5',
      type: 'choice',
      question: `Which statement about sign conventions is correct?`,
      options: [
        `Up-positive is the only correct convention in physics`,
        `Either convention works as long as all quantities use the same convention consistently`,
        `Down-positive gives a different answer for displacement`,
        `The convention must match the direction of initial velocity`,
      ],
      answer: `Either convention works as long as all quantities use the same convention consistently`,
      hints: [
        `Physical outcomes (time, speed, distance) cannot depend on a bookkeeping choice.`,
        `What happens if you apply the convention to all quantities — $v_0$, $a$, $\\Delta y$ — consistently?`,
      ],
      reviewSection: 'intuition',
      explanation: `Any convention is valid as long as applied consistently. Mixing conventions — using up-positive values in a down-positive equation — is the source of most sign errors.`,
    },
    {
      id: 'p1-ch2-014-q6',
      type: 'choice',
      question: `A student uses down-positive but writes $a = -9.8$ m/s². What error did they make?`,
      options: [
        `Used the wrong magnitude for $g$`,
        `Applied the up-positive sign for $a$ while using the down-positive convention`,
        `Forgot to include initial velocity`,
        `Used the wrong SUVAT equation`,
      ],
      answer: `Applied the up-positive sign for $a$ while using the down-positive convention`,
      hints: [
        `In down-positive, which direction is positive? What direction does gravity point?`,
        `$a = -g$ is correct in up-positive; $a = +g$ is correct in down-positive.`,
      ],
      reviewSection: 'examples',
      explanation: `With down-positive, gravity (downward) should give $a = +g = +9.8$ m/s². Writing $-9.8$ m/s² applies the up-positive sign to a down-positive setup — a mixed convention.`,
    },
    {
      id: 'p1-ch2-014-q7',
      type: 'choice',
      question: `Under up-positive, a ball thrown upward has $v_0 > 0$ and $a < 0$. After the apex, $v < 0$. What does $v < 0$ physically mean?`,
      options: [
        `The ball is slowing down`,
        `The ball is moving downward`,
        `The ball is at maximum height`,
        `The ball has stopped`,
      ],
      answer: `The ball is moving downward`,
      hints: [
        `In up-positive, what direction corresponds to negative velocity?`,
        `After the apex, the ball has crossed $v = 0$ and is now falling.`,
      ],
      reviewSection: 'math',
      explanation: `Negative velocity in up-positive means the velocity vector points downward. After the apex, the ball falls and $v$ becomes increasingly negative (larger downward speed).`,
    },
    {
      id: 'p1-ch2-014-q8',
      type: 'choice',
      question: `A ball thrown upward at 9.8 m/s. In down-positive, $v_0 = -9.8$ m/s and $a = +9.8$ m/s². What is the time to the apex?`,
      options: [`$0.5$ s`, `$1$ s`, `$2$ s`, `$9.8$ s`],
      answer: `$1$ s`,
      hints: [
        `At the apex, $v = 0$. Use $v = v_0 + at = 0$ and solve for $t$.`,
        `$t = -v_0/a = -(-9.8)/(+9.8) = ?$`,
      ],
      reviewSection: 'examples',
      explanation: `$0 = v_0 + at \\Rightarrow t = -v_0/a = -(-9.8)/(9.8) = 1$ s. Same as up-positive: $t = v_0/g = 9.8/9.8 = 1$ s.`,
    },
    {
      id: 'p1-ch2-014-q9',
      type: 'choice',
      question: `A student solves a drop problem and gets a negative time ($t < 0$). What most likely caused this?`,
      options: [
        `The object was too light to fall`,
        `A sign error — likely mixing up the convention for $a$ or $v_0$ with the formula`,
        `The object fell faster than the speed of light`,
        `The height was set to zero incorrectly`,
      ],
      answer: `A sign error — likely mixing up the convention for $a$ or $v_0$ with the formula`,
      hints: [
        `Time is always positive in these problems. A negative $t$ usually means the quadratic was set up with wrong signs.`,
        `Which two quantities most commonly get the wrong sign in free-fall problems?`,
      ],
      reviewSection: 'math',
      explanation: `A negative time result in free-fall almost always indicates a mixed sign convention. The most common culprits are $a$ (using $-g$ when down-positive was declared, or vice versa) and $v_0$ (assigning the wrong sign to a directional throw).`,
    },
    {
      id: 'p1-ch2-014-q10',
      type: 'choice',
      question: `Under down-positive, a ball thrown UPWARD at 20 m/s has $v_0 = -20$ m/s. After 1 s of flight, what is its velocity?`,
      options: [`$-29.8$ m/s`, `$-10.2$ m/s`, `$+10.2$ m/s`, `$+29.8$ m/s`],
      answer: `$-10.2$ m/s`,
      hints: [
        `Use $v = v_0 + at$ with $v_0 = -20$ m/s and $a = +9.8$ m/s².`,
        `$v = -20 + 9.8(1) = ?$`,
      ],
      reviewSection: 'examples',
      explanation: `$v = -20 + 9.8(1) = -10.2$ m/s. Negative means still moving upward in down-positive. The ball hasn't reached the apex yet (which is at $t = 20/9.8 \\approx 2.04$ s).`,
    },
  ],
  misconceptions: [
    {
      id: 'p1-ch2-014-m1',
      misconception: `"Down-positive gives wrong answers because physics defines up as positive."`,
      correction: `Physics does not define a preferred direction. The equations of motion are form-invariant under axis flips. Both conventions give exactly the same physical predictions — same time, same speed, same position — when applied consistently. The "correctness" of a convention is purely about consistency within a problem, not about physical truth.`,
      correctionExample: `Drop from 20 m: up-positive gives $t = 2.02$ s and $v_f = -19.8$ m/s. Down-positive gives $t = 2.02$ s and $v_f = +19.8$ m/s. Same time, same speed magnitude. The convention changes the sign of the answer, not the physical content.`,
    },
    {
      id: 'p1-ch2-014-m2',
      misconception: `"Once I pick a convention, a can still be positive or negative depending on which way the object is moving."`,
      correction: `In free fall, $a$ is determined entirely by the choice of convention and by which direction gravity acts. It does not change sign based on the direction of motion. An object moving upward still has $a = -g$ (up-positive) — the velocity is positive but the acceleration is negative. The signs of $v$ and $a$ can disagree.`,
      correctionExample: `Up-positive, ball moving upward: $v > 0$ but $a = -9.8$ m/s² (gravity pulls downward). Confusion arises because students think "the ball is going up, so acceleration should be positive." It isn't — $a$ is always $-g$ in up-positive, regardless of $v$.`,
    },
  ],
  transferPrompts: [
    {
      id: 'p1-ch2-014-tp1',
      prompt: `In electrical circuits, engineers often choose different sign conventions for current direction (conventional current vs. electron flow) and for voltage polarity. How does the choice of sign convention affect the equations, and how do you ensure consistency in a circuit analysis?`,
    },
    {
      id: 'p1-ch2-014-tp2',
      prompt: `In engineering statics, tension and compression in structural members get opposite signs. A bridge designer might choose "tension = positive" while another chooses "compression = positive." If both engineers analyze the same bridge, will they get the same numerical answers for the forces? Explain using the analogy to free-fall sign conventions.`,
    },
  ],
  debugging: [
    {
      id: 'p1-ch2-014-d1',
      buggyWork: `A student solving a downward-throw problem writes: "Down is positive. $v_0 = +8$ m/s (thrown downward), $a = -9.8$ m/s². After 2 s: $v = 8 + (-9.8)(2) = -11.6$ m/s." They then say: "Negative velocity means the object reversed direction — it's now going up."`,
      question: `Find the error in the setup and explain what actually happened.`,
      answer: `With down-positive, gravity acts in the positive direction: $a = +9.8$ m/s², not $-9.8$ m/s². The student mixed up the sign of $a$ (used the up-positive value in a down-positive setup). Correct: $v = 8 + (9.8)(2) = 27.6$ m/s — still moving downward, faster than before. The "negative velocity means reversed direction" reasoning would only be valid if the convention were applied consistently, which it wasn't.`,
    },
    {
      id: 'p1-ch2-014-d2',
      buggyWork: `A student writes: "Upward positive. Ball thrown upward at 10 m/s. $v_0 = 10$ m/s, $a = 9.8$ m/s²." They compute $t_{\\text{peak}} = v_0/a = 10/9.8 \\approx 1.02$ s.`,
      question: `Identify the error. What is the correct time to the apex?`,
      answer: `With up-positive, $a = -g = -9.8$ m/s² (not $+9.8$). The student used the down-positive value for $a$ in an up-positive setup. With the correct $a = -9.8$: $t_{\\text{peak}} = v_0/g = 10/9.8 \\approx 1.02$ s. The numerical answer happens to be the same here because the formula $t = v_0/g$ uses the magnitude $g$ — but the setup was wrong and would cause errors in any equation that uses the sign of $a$ directly (e.g., displacement).`,
    },
  ],
  mastery: {
    targetLevel: `Consistently assign signs to all kinematic quantities ($v_0$, $a$, $\\Delta y$) under either up-positive or down-positive convention, solve free-fall problems correctly under both conventions, and identify sign errors in given work.`,
    coreSkill: `Declaring the convention explicitly before assigning any numbers, and deriving the sign of $a$ from that declaration (not from the direction of motion).`,
    commonSticking: `Using $a = -g$ in a down-positive setup, or using $a = +g$ in an up-positive setup. The fix: write the convention at the top of every problem, and derive $a$'s sign from that declaration.`,
    connections: [
      `ch2-012 (free fall basics) — introduces up-positive as the standard convention`,
      `ch2-015 (upward launch) — applies the sign convention in a two-phase problem`,
      `ch4 (projectile motion) — sign convention extends to both x and y components`,
      `ch3 (Newton's second law) — the same sign discipline applies to net force and acceleration`,
    ],
  },
  semantics: {
    core: [
      { symbol: `a_{\\text{up}+}`, meaning: `Acceleration in up-positive convention; equals $-g \\approx -9.8$ m/s²` },
      { symbol: `a_{\\text{dn}+}`, meaning: `Acceleration in down-positive convention; equals $+g \\approx +9.8$ m/s²` },
      { symbol: `v_0^\\text{sign}`, meaning: `Signed initial velocity; positive if in the chosen positive direction, negative if opposite` },
      { symbol: `\\Delta y^\\text{sign}`, meaning: `Signed displacement; positive if net motion is in the positive direction, negative if opposite` },
      { symbol: `|v|`, meaning: `Speed (magnitude of velocity); always positive, independent of convention` },
    ],
    rulesOfThumb: [
      `Declare your convention at the top of every free-fall problem — even just "up+" or "dn+".`,
      `Derive $a$'s sign from the convention, not from the motion: $a = -g$ (up+) or $a = +g$ (dn+) always.`,
      `$v_0$ gets a positive sign if the initial throw is in the positive direction, negative if opposite.`,
      `If you get $t < 0$, a sign was mixed. Go back and check $a$ and $v_0$ against your declared convention.`,
      `Physical quantities (speed, distance, time) are magnitudes — they are convention-independent. Sign conventions only change the labels.`,
    ],
  },
};

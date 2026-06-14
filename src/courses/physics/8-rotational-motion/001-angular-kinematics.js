export default {
  id: 'p1-ch7-001',
  slug: 'angular-kinematics',
  chapter: 'p7',
  order: 1,
  title: 'Angular Kinematics: Rotation by the Numbers',
  subtitle: 'Every kinematics equation has a rotational twin — and they work exactly the same way.',
  tags: ['angular kinematics', 'angular velocity', 'angular acceleration', 'radian', 'theta', 'omega', 'alpha', 'rotational SUVAT'],

  hook: {
    question:
      'A spinning wheel completes 10 revolutions in 4 seconds and is speeding up at a constant rate. How would you find its angular velocity at t = 4 s? Before reading further: does this problem feel like one you\'ve already solved?',
    realWorldContext:
      'Every rotating object — a car engine, a wind turbine, a gyroscope, a washing machine drum — is described by angular kinematics. Engineers specify motors in RPM (revolutions per minute) and angular acceleration in rad/s². The beautiful surprise: the mathematics is identical to linear kinematics, with angle replacing position and angular velocity replacing linear velocity.',
    previewVisualizationId: 'OscillationViz',
  },

  intuition: {
    prose: [
      '**The answer:** Yes — it is the exact same problem structure as linear kinematics. Replace \\(x \\to \\theta\\), \\(v \\to \\omega\\), \\(a \\to \\alpha\\), and every SUVAT equation still works. This is the rotational-linear analogy — one of the most elegant structural parallels in classical mechanics.',

      '**Angle in radians:** We measure rotation in radians (not degrees) because radians make the math clean. One radian is the angle that subtends an arc length equal to the radius: \\(s = r\\theta\\). A full circle is \\(2\\pi\\) radians (not 360°). The factor \\(r\\) connects every rotational quantity to its linear equivalent.',

      '**The analogy table:** Position \\(x\\) ↔ angle \\(\\theta\\). Velocity \\(v = dx/dt\\) ↔ angular velocity \\(\\omega = d\\theta/dt\\). Acceleration \\(a = dv/dt\\) ↔ angular acceleration \\(\\alpha = d\\omega/dt\\). And linking them to linear motion: \\(s = r\\theta\\), \\(v_t = r\\omega\\), \\(a_t = r\\alpha\\).',

      '**What changes at the rim:** A wheel spinning at \\(\\omega\\) rad/s has every point on the rim moving at linear speed \\(v = r\\omega\\). A point at radius \\(r = 0.5\\) m and \\(\\omega = 10\\) rad/s has \\(v = 5\\) m/s tangential speed. The outer edge moves faster than the inner edge — same \\(\\omega\\), different \\(v\\).',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 4 — Chapter 7: Rotational Motion',
        body:
          '**Chapter 2:** Linear kinematics — x, v, a, the SUVAT equations.\n**This chapter:** The same structure applied to rotation: θ, ω, α, and rotational SUVAT.\n**This lesson:** Definitions and the kinematic equations for constant angular acceleration.\n**Next:** Torque — the rotational equivalent of force.',
      },
      {
        type: 'definition',
        title: 'Angular quantities',
        body:
          '\\theta: \\text{angular displacement (rad)}\\\\\\omega = d\\theta/dt: \\text{angular velocity (rad/s)}\\\\\\alpha = d\\omega/dt: \\text{angular acceleration (rad/s}^2\\text{)}',
      },
      {
        type: 'theorem',
        title: 'Rotational-linear connection',
        body: 's = r\\theta, \\quad v_t = r\\omega, \\quad a_t = r\\alpha',
      },
      {
        type: 'insight',
        title: 'Rotational SUVAT',
        body:
          '\\omega_f = \\omega_0 + \\alpha t\\\\\\theta = \\tfrac{1}{2}(\\omega_0 + \\omega_f)t\\\\\\theta = \\omega_0 t + \\tfrac{1}{2}\\alpha t^2\\\\\\omega_f^2 = \\omega_0^2 + 2\\alpha\\theta',
      },
      {
        type: 'warning',
        title: 'Centripetal acceleration ≠ angular acceleration',
        body:
          'A point on a rotating wheel has two acceleration components: tangential \\(a_t = r\\alpha\\) (changes speed) and centripetal \\(a_c = r\\omega^2 = v^2/r\\) (changes direction). \\(\\alpha = 0\\) (constant rotation) means no tangential acceleration but always centripetal acceleration.',
      },
    ],
    visualizations: [
      {
        id: 'OscillationViz',
        title: 'Rotating wheel — angular quantities in real time',
        mathBridge:
          'Set ω and α. Watch the wheel spin. The angle θ accumulates; the arc length s = rθ grows on the rim. Angular velocity ω is constant rotation speed; α makes it accelerate.',
        caption: 'θ, ω, α are the rotating counterparts of x, v, a.',
      },
      {
        id: 'UnitCircle',
        title: 'Radians vs degrees — and why radians win',
        mathBridge: 'One radian = arc length / radius. 2π rad = one full revolution. Derivatives of sin and cos work cleanly only in radians.',
        caption: '2π ≈ 6.28 rad = 360°. One radian ≈ 57.3°.',
      },
    ],
  },

  math: {
    prose: [
      'All four rotational SUVAT equations follow from integrating \\(\\alpha = \\text{const}\\), exactly as in linear kinematics:',
      '\\(\\omega(t) = \\omega_0 + \\alpha t\\)',
      '\\(\\theta(t) = \\omega_0 t + \\tfrac{1}{2}\\alpha t^2\\)',
      'Centripetal acceleration for a point at radius \\(r\\) on a rotating object:',
      '\\(a_c = \\omega^2 r = v_t^2/r\\) (directed inward, toward axis)',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Centripetal acceleration',
        body: 'a_c = \\omega^2 r = \\frac{v_t^2}{r} \\quad (\\text{directed toward rotation axis})',
      },
      {
        type: 'insight',
        title: 'Total acceleration of a rim point',
        body:
          'Total acceleration has two perpendicular components:\\\\Tangential: \\(a_t = r\\alpha\\) (changes speed — along rim)\\\\Centripetal: \\(a_c = r\\omega^2\\) (changes direction — toward center)\\\\Magnitude: \\(|a| = \\sqrt{a_t^2 + a_c^2}\\)',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'angular-kinematics-chain' },
        title: 'Rotational chain: θ → ω → α',
        caption:
          'Mirror of the linear chain x → v → a. Differentiate to go right; integrate to go left. The analogy is exact: replace every linear symbol with its rotational counterpart.',
      },
    ],
  },

  rigor: {
    title: 'Rotational SUVAT from integration (mirrors linear derivation)',
    proofSteps: [
      {
        expression: '\\alpha = \\text{const} \\Rightarrow \\omega(t) = \\omega_0 + \\alpha t',
        annotation: 'Integrate constant angular acceleration. Mirrors v = v₀ + at.',
      },
      {
        expression: '\\theta(t) = \\int_0^t \\omega\\,dt = \\omega_0 t + \\tfrac{1}{2}\\alpha t^2',
        annotation: 'Integrate angular velocity. Mirrors Δx = v₀t + ½at².',
      },
      {
        expression: '\\omega_f^2 = \\omega_0^2 + 2\\alpha\\theta',
        annotation: 'Eliminate t (square equation 1, substitute equation 2). Mirrors v² = v₀² + 2aΔx.',
      },
      {
        expression: '\\text{Linear} \\leftrightarrow \\text{Rotational: } x\\to\\theta,\\; v\\to\\omega,\\; a\\to\\alpha,\\; m\\to I',
        annotation: 'The full substitution table. Every linear equation has a rotational equivalent.',
      },
    ],
  },

  examples: [
    {
      id: 'ch7-001-ex1',
      title: 'Spinning up a motor',
      problem:
        '\\text{A motor starts from rest and reaches 3000 RPM in 5 seconds at constant acceleration. Find α and the number of revolutions made.}',
      steps: [
        {
          expression: '\\omega_f = 3000\\,\\text{RPM} = 3000 \\times \\frac{2\\pi}{60} = 100\\pi \\approx 314.2\\,\\text{rad/s}',
          annotation: 'Convert RPM to rad/s: multiply by 2π/60.',
        },
        {
          expression: '\\alpha = \\frac{\\omega_f - \\omega_0}{t} = \\frac{314.2 - 0}{5} = 62.8\\,\\text{rad/s}^2',
          annotation: 'Rotational analogue of a = Δv/Δt.',
        },
        {
          expression: '\\theta = \\omega_0 t + \\tfrac{1}{2}\\alpha t^2 = 0 + \\tfrac{1}{2}(62.8)(25) = 785\\,\\text{rad}',
          annotation: 'Angular displacement.',
        },
        {
          expression: '\\text{Revolutions} = \\theta/(2\\pi) = 785/6.28 \\approx 125',
          annotation: '125 revolutions during spin-up.',
        },
      ],
      conclusion: 'α ≈ 62.8 rad/s², 125 revolutions in 5 s.',
    },
    {
      id: 'ch7-001-ex2',
      title: 'Rim speed and centripetal acceleration',
      problem:
        '\\text{A wheel of radius 0.4 m spins at ω = 20 rad/s. Find: (a) rim speed, (b) centripetal acceleration.}',
      steps: [
        {
          expression: 'v_t = r\\omega = 0.4 \\times 20 = 8\\,\\text{m/s}',
          annotation: 'Tangential speed of a rim point.',
        },
        {
          expression: 'a_c = r\\omega^2 = 0.4 \\times 400 = 160\\,\\text{m/s}^2',
          annotation: 'Centripetal acceleration = 160/9.8 ≈ 16g. Significant — this is why wheels can fail at high RPM.',
        },
      ],
      conclusion: 'Rim speed 8 m/s; centripetal acceleration 160 m/s² ≈ 16g.',
    },
  ],

  challenges: [
    {
      id: 'ch7-001-ch1',
      difficulty: 'easy',
      problem: '\\text{Convert 600 RPM to rad/s.}',
      hint: 'Multiply by 2π/60.',
      walkthrough: [
        { expression: '600 \\times \\frac{2\\pi}{60} = 20\\pi \\approx 62.8\\,\\text{rad/s}', annotation: 'Standard conversion.' },
      ],
      answer: '≈ 62.8 rad/s.',
    },
    {
      id: 'ch7-001-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A disc (r = 0.3 m) decelerates from 50 rad/s to 10 rad/s in 8 s. Find α and the angle turned.}',
      hint: 'Use rotational SUVAT: ω_f = ω₀ + αt and θ = ½(ω₀ + ω_f)t.',
      walkthrough: [
        { expression: '\\alpha = (10-50)/8 = -5\\,\\text{rad/s}^2', annotation: 'Negative → decelerating.' },
        { expression: '\\theta = \\tfrac{1}{2}(50+10)(8) = 240\\,\\text{rad} \\approx 38.2\\text{ rev}', annotation: 'Average angular velocity × time.' },
      ],
      answer: 'α = −5 rad/s², θ = 240 rad ≈ 38.2 revolutions.',
    },
    {
      id: 'ch7-001-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A grinding wheel (r = 0.15 m) has ω₀ = 100 rad/s and decelerates at α = −2 rad/s². A point on the rim at t = 5 s: find (a) tangential speed, (b) centripetal acceleration, (c) total acceleration magnitude and angle.}',
      hint: 'Find ω at t = 5 s first. Then v_t = rω, a_c = rω², a_t = rα.',
      walkthrough: [
        { expression: '\\omega(5) = 100 + (-2)(5) = 90\\,\\text{rad/s}', annotation: 'Angular velocity at t = 5 s.' },
        { expression: 'v_t = (0.15)(90) = 13.5\\,\\text{m/s}', annotation: 'Tangential speed.' },
        { expression: 'a_c = (0.15)(90)^2 = 1215\\,\\text{m/s}^2', annotation: 'Centripetal (toward center).' },
        { expression: 'a_t = (0.15)(2) = 0.3\\,\\text{m/s}^2', annotation: 'Tangential (opposing rotation, decelerating).' },
        { expression: '|a| = \\sqrt{1215^2 + 0.3^2} \\approx 1215\\,\\text{m/s}^2', annotation: 'a_c dominates completely.' },
      ],
      answer: 'v_t = 13.5 m/s; a_c ≈ 1215 m/s²; total |a| ≈ 1215 m/s² (dominated by centripetal).',
    },
  ],

  quiz: [
    {
      id: 'p7-001-q1',
      type: 'input',
      text: 'Convert 120° to radians.',
      answer: '2.094',
      hints: ['θ(rad) = θ(deg) × π/180 = 120 × π/180 = 2π/3 ≈ 2.094 rad.'],
      reviewSection: 'Math — angle conversion',
    },
    {
      id: 'p7-001-q2',
      type: 'choice',
      text: 'A wheel starts from rest and reaches 200 rpm in 5 seconds. Its angular acceleration is:',
      options: ['4.19 rad/s²', '40 rad/s²', '200 rad/s²', '0.67 rad/s²'],
      answer: '4.19 rad/s²',
      hints: ['200 rpm × 2π/60 = 20.94 rad/s. α = Δω/t = 20.94/5 = 4.19 rad/s².'],
      reviewSection: 'Math — angular acceleration',
    },
    {
      id: 'p7-001-q3',
      type: 'choice',
      text: 'The rotational analog of linear velocity v is:',
      options: ['α (angular acceleration)', 'ω (angular velocity)', 'θ (angular displacement)', 'τ (torque)'],
      answer: 'ω (angular velocity)',
      hints: ['v → ω, a → α, x → θ. The analogy is exact: ω = dθ/dt, just as v = dx/dt.'],
      reviewSection: 'Math — linear-to-rotational analogy',
    },
    {
      id: 'p7-001-q4',
      type: 'input',
      text: 'A disc starts at rest with α = 3 rad/s². How many radians has it rotated after 4 seconds?',
      answer: '24',
      hints: ['θ = ω₀t + ½αt² = 0 + ½(3)(16) = 24 rad.'],
      reviewSection: 'Math — rotational kinematic equations',
    },
    {
      id: 'p7-001-q5',
      type: 'choice',
      text: 'A wheel (r = 0.5 m) rotates at ω = 8 rad/s. The tangential speed at the rim is:',
      options: ['4 m/s', '8 m/s', '16 m/s', '0.5 m/s'],
      answer: '4 m/s',
      hints: ['v_t = rω = 0.5 × 8 = 4 m/s.'],
      reviewSection: 'Math — v_t = rω',
    },
    {
      id: 'p7-001-q6',
      type: 'input',
      text: 'A motor spins at 1800 rpm. Convert to rad/s.',
      answer: '188.5',
      hints: ['ω = 1800 × 2π/60 = 60π ≈ 188.5 rad/s.'],
      reviewSection: 'Math — rpm to rad/s',
    },
    {
      id: 'p7-001-q7',
      type: 'choice',
      text: 'Two points on a rotating rigid body: one at r = 0.1 m, another at r = 0.4 m. Compared to the inner point, the outer point has:',
      options: [
        'The same angular velocity and the same tangential speed',
        'The same angular velocity but 4× the tangential speed',
        '4× the angular velocity and the same tangential speed',
        '4× the angular velocity and 4× the tangential speed',
      ],
      answer: 'The same angular velocity but 4× the tangential speed',
      hints: ['All points on a rigid body share the same ω. v_t = rω — outer point has 4× r, so 4× v_t.'],
      reviewSection: 'Math — v_t = rω for different radii',
    },
    {
      id: 'p7-001-q8',
      type: 'input',
      text: 'A wheel at ω₀ = 50 rad/s decelerates at 5 rad/s². How many revolutions does it make before stopping?',
      answer: '39.8',
      hints: ['ω² = ω₀² + 2αθ → 0 = 2500 − 10θ → θ = 250 rad. Revolutions = 250/(2π) ≈ 39.8.'],
      reviewSection: 'Math — rotational kinematics (no time)',
    },
    {
      id: 'p7-001-q9',
      type: 'choice',
      text: 'The centripetal acceleration of a rim point at r = 0.2 m with ω = 10 rad/s is:',
      options: ['2 m/s²', '20 m/s²', '50 m/s²', '200 m/s²'],
      answer: '20 m/s²',
      hints: ['a_c = rω² = 0.2 × 100 = 20 m/s². Or: v_t = rω = 2 m/s, a_c = v²/r = 4/0.2 = 20 m/s².'],
      reviewSection: 'Math — centripetal acceleration',
    },
    {
      id: 'p7-001-q10',
      type: 'choice',
      text: 'Why is it convenient to measure angles in radians (not degrees) in rotational kinematics?',
      options: [
        'Radians are always smaller numbers than degrees',
        'The arc length formula s = rθ and v = rω require θ in radians to avoid unit conversion factors',
        'Radians were invented for physics',
        'Degrees lead to negative angles',
      ],
      answer: 'The arc length formula s = rθ and v = rω require θ in radians to avoid unit conversion factors',
      hints: ['s = rθ only works without a conversion factor when θ is in radians. In degrees: s = r × θ × π/180.'],
      reviewSection: 'Math — why radians',
    },
  ],

  misconceptions: [
    {
      id: 'p7-001-m1',
      misconception: 'All points on a rotating wheel have the same speed.',
      correction: 'All points share the same angular velocity ω, but tangential speed v_t = rω increases with radius. The rim moves faster than a point halfway to the center.',
      correctionExample: 'A fan blade at 5 rad/s: at r = 0.1 m, v_t = 0.5 m/s; at r = 0.4 m, v_t = 2 m/s. Same ω, 4× different tangential speed.',
    },
    {
      id: 'p7-001-m2',
      misconception: 'At constant rotation speed (α = 0), there is no acceleration.',
      correction: 'Constant ω means zero tangential acceleration (a_t = 0), but there is always centripetal acceleration a_c = rω² toward the center. Any circular motion requires centripetal acceleration.',
      correctionExample: 'A wheel at constant ω = 10 rad/s, r = 0.3 m: a_t = 0, but a_c = 0.3 × 100 = 30 m/s² pointing inward. The point accelerates even at constant speed.',
    },
  ],

  transferPrompts: [
    {
      id: 'p7-001-tp1',
      prompt: 'A hard drive spins at 7200 rpm. The read head floats 0.003 mm above the platter at r = 40 mm from center. Calculate ω (rad/s), the tangential speed at the head, and the centripetal acceleration. Why does dust on the platter cause catastrophic failure?',
      connection: 'ω = 7200×2π/60 = 754 rad/s. v_t = 0.04×754 = 30.2 m/s. a_c = 0.04×754² = 22,740 m/s² ≈ 2320 g. Any particle larger than the gap (0.003 mm) gets thrown against the head at 30 m/s with enormous centripetal force.',
    },
    {
      id: 'p7-001-tp2',
      prompt: 'The rotational kinematic equations are identical in structure to the linear ones (x → θ, v → ω, a → α). Use this analogy to derive the formula θ = ω₀t + ½αt² from the linear formula x = v₀t + ½at². What does this structural identity tell you about the mathematical underpinning of both?',
      connection: 'Both are derived from double integration of a constant quantity (acceleration or angular acceleration). The structure x = x₀ + v₀t + ½at² comes from integrating a = const twice. The rotational version is identical because the differential equations have the same form: d²θ/dt² = α (constant).',
    },
  ],

  debugging: [
    {
      id: 'p7-001-db1',
      scenario: 'A student calculates arc length as s = r × 45° = 0.3 × 45 = 13.5 m for a 0.3 m radius wheel.',
      error: 'Used degrees in s = rθ. This formula requires θ in radians.',
      fix: 'Convert 45° to radians: 45 × π/180 = π/4 ≈ 0.785 rad. Then s = 0.3 × 0.785 = 0.235 m.',
    },
    {
      id: 'p7-001-db2',
      scenario: 'A student calculates rpm from ω = 50 rad/s as: rpm = 50 × 60 = 3000 rpm.',
      error: 'Forgot to divide by 2π. ω is in radians per second; one revolution = 2π radians.',
      fix: 'rpm = ω × (60 s/min) / (2π rad/rev) = 50 × 60 / (2π) ≈ 477 rpm.',
    },
  ],

  mastery: {
    targetLevel: 'Apply rotational kinematic equations (θ, ω, α analogs of x, v, a); convert between degrees, radians, and rpm; calculate v_t, a_c, a_t from ω and r.',
    checklistItems: [
      'Can convert between degrees, radians, and rpm',
      'Can apply all four rotational kinematic equations by analogy with linear equations',
      'Can calculate v_t = rω, a_c = rω², a_t = rα for any point at radius r',
      'Can distinguish between angular velocity (same for all points) and tangential speed (varies with r)',
    ],
    commonStruggles: [
      'Using degrees instead of radians in s = rθ and v = rω (always use radians)',
      'Confusing tangential acceleration a_t = rα with centripetal acceleration a_c = rω²',
    ],
    nextSteps: 'Lesson 2 introduces torque — the rotational force. Just as F = ma for linear motion, τ = Iα for rotation. Torque depends on both the force magnitude AND where it is applied (the lever arm).',
  },

  semantics: {
    core: [
      { symbol: 'θ, ω, α', meaning: 'angular displacement (rad), velocity (rad/s), acceleration (rad/s²) — rotational analogs of x, v, a' },
      { symbol: 'v_t = rω', meaning: 'tangential speed of a point at radius r — depends on r, unlike ω which is the same for all points on a rigid body' },
      { symbol: 'a_c = rω² = v_t²/r', meaning: 'centripetal acceleration — always present in circular motion, points toward center' },
      { symbol: 'a_t = rα', meaning: 'tangential acceleration — present only when ω is changing (α ≠ 0)' },
    ],
    rulesOfThumb: [
      'Always convert to radians before using s = rθ, v = rω, or rotational kinematics.',
      'All points on a rigid body share the same ω and α, but v_t and a_t scale with r.',
      'Constant ω does NOT mean zero acceleration — a_c = rω² is always present.',
      'rpm to rad/s: multiply by 2π/60.',
      'The four rotational kinematics equations are identical in structure to the linear ones — just swap x→θ, v→ω, a→α.',
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Angular Kinematics — The Rotational Analogy',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Motor: starts from rest, constant angular acceleration
alpha = 4.0  # rad/s²
omega_0 = 0.0
t = np.linspace(0, 10, 300)

omega = omega_0 + alpha * t          # ω = ω₀ + αt
theta = omega_0*t + 0.5*alpha*t**2   # θ = ω₀t + ½αt²

# Compare to linear: same equations with x→θ, v→ω, a→α
a_linear = 4.0  # m/s² same value
v_linear = a_linear * t
x_linear = 0.5 * a_linear * t**2

fig, axes = plt.subplots(2, 2, figsize=(12, 8))
axes[0,0].plot(t, v_linear, 'b-', lw=2)
axes[0,0].set_title('Linear: v = at'); axes[0,0].set_ylabel('v (m/s)'); axes[0,0].grid(True)

axes[0,1].plot(t, omega, 'r-', lw=2)
axes[0,1].set_title('Rotational: ω = αt'); axes[0,1].set_ylabel('ω (rad/s)'); axes[0,1].grid(True)

axes[1,0].plot(t, x_linear, 'b-', lw=2)
axes[1,0].set_title('Linear: x = ½at²'); axes[1,0].set_ylabel('x (m)'); axes[1,0].set_xlabel('t (s)'); axes[1,0].grid(True)

axes[1,1].plot(t, theta, 'r-', lw=2)
axes[1,1].set_title('Rotational: θ = ½αt²'); axes[1,1].set_ylabel('θ (rad)'); axes[1,1].set_xlabel('t (s)'); axes[1,1].grid(True)

plt.tight_layout()
plt.show()`,
          prose: [
            '`omega = omega_0 + alpha * t` is the rotational equivalent of v = v₀ + at. The formulas are structurally identical — only the symbols change (x→θ, v→ω, a→α).',
            'The four plots show linear vs. rotational quantities side by side. The shapes are identical — both angular and linear motions with constant acceleration produce the same parabola/line shapes.',
            'This visual analogy confirms: all linear kinematics formulas have rotational twins. If you know one set, you know both.',
          ],
        },
        {
          cellTitle: 'Tangential vs Centripetal Acceleration',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Wheel with varying angular velocity
alpha = -2.0   # rad/s² (decelerating)
omega_0 = 100  # rad/s initial
r = 0.15       # m radius

t = np.linspace(0, 40, 300)
omega = omega_0 + alpha * t
omega = np.maximum(0, omega)  # can't go below 0

v_t = r * omega
a_t = r * np.abs(alpha) * np.ones_like(t)  # tangential deceleration magnitude
a_c = r * omega**2                          # centripetal

a_total = np.sqrt(a_t**2 + a_c**2)

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(t, a_c, 'b-', lw=2, label='Centripetal a_c = rω²')
ax.plot(t, a_t, 'r--', lw=2, label=f'Tangential a_t = r|α| = {r*np.abs(alpha):.2f} m/s²')
ax.plot(t, a_total, 'g-', lw=2, label='Total |a|')
ax.set_xlabel('Time (s)'); ax.set_ylabel('Acceleration (m/s²)')
ax.set_title('Centripetal vs Tangential Acceleration Over Time')
ax.legend(); ax.grid(True)
plt.tight_layout()
plt.show()`,
          prose: [
            '`a_c = r * omega**2` gives centripetal acceleration — it decreases as the wheel slows down. `a_t = r * abs(alpha)` is constant because α is constant.',
            'The plot shows that a_c (blue) starts huge and decreases while a_t (red dashed) stays constant. Initially, centripetal completely dominates; eventually they become comparable.',
            'This explains why a fast-spinning tire rim experiences enormous centripetal acceleration even when decelerating gently — the ω² factor makes a_c dominate at high rotation rates.',
          ],
        },
        {
          cellTitle: 'Unit Conversions — rad/s, rpm, degrees',
          type: 'code',
          language: 'python',
          code: `import numpy as np

def to_rad(deg): return deg * np.pi / 180
def to_rpm(rad_s): return rad_s * 60 / (2 * np.pi)
def to_rad_s(rpm): return rpm * 2 * np.pi / 60
def to_deg(rad): return rad * 180 / np.pi

speeds_rpm = [60, 120, 300, 1200, 3600, 7200]

print(f"{'RPM':8} | {'rad/s':10} | {'rev/s':8}")
print("-" * 35)
for rpm in speeds_rpm:
    w = to_rad_s(rpm)
    print(f"{rpm:8} | {w:10.3f} | {rpm/60:8.2f}")

print()
print("Angle conversions:")
for deg in [30, 45, 60, 90, 180, 360]:
    r = to_rad(deg)
    print(f"  {deg:3}° = {r:.4f} rad = {r/np.pi:.4f}π rad")`,
          prose: [
            '`to_rad_s(rpm) = rpm * 2π / 60` converts rpm to rad/s. The factor 2π converts revolutions to radians; dividing by 60 converts per minute to per second.',
            'The table shows common RPM values and their rad/s equivalents. A hard drive at 7200 rpm runs at 754 rad/s — the same physical rotation, different units.',
            '`to_rad(deg) = deg * π/180` is the fundamental conversion. The table shows that common fractions of a circle correspond to clean fractions of π radians.',
          ],
        },
        {
          cellTitle: 'Challenge — Grinding Wheel Analysis',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          prompt: 'A grinding wheel (r = 0.2 m) starts at ω₀ = 80 rad/s and decelerates at α = −3 rad/s². (1) How long until it stops? (2) How many revolutions does it make before stopping? (3) At t = 5 s, find: ω, v_t at rim, a_c, a_t, and total |a|. (4) Plot ω vs t from start to stop.',
          starterCode: `import numpy as np
import matplotlib.pyplot as plt

r = 0.2; omega_0 = 80; alpha = -3

# TODO: t_stop = -omega_0 / alpha  (when ω = 0)
# TODO: theta_total = omega_0^2 / (2*abs(alpha)) (from ω²=ω₀²+2αθ with ω=0)
# TODO: revolutions = theta_total / (2*pi)
# TODO: at t=5: omega_5, v_t5, a_c5, a_t5, a_total5
# TODO: print all
# TODO: plot omega vs t from 0 to t_stop`,
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Angular Kinematic Equations',
          type: 'code',
          language: 'matlab',
          code: `% Angular kinematics -- rotational analogy of linear
alpha = 4;   omega_0 = 0;
t = linspace(0, 10, 300);

omega = omega_0 + alpha * t;
theta = omega_0*t + 0.5*alpha*t.^2;

figure;
subplot(2,1,1)
plot(t, omega, 'r-', 'LineWidth', 2)
xlabel('t (s)'); ylabel('\\omega (rad/s)')
title('\\omega = \\omega_0 + \\alphat  (same form as v = v_0 + at)')
grid on

subplot(2,1,2)
plot(t, theta, 'b-', 'LineWidth', 2)
xlabel('t (s)'); ylabel('\\theta (rad)')
title('\\theta = \\omega_0t + ½\\alphat²  (same as x = v_0t + ½at²)')
grid on

fprintf('At t=10s: omega = %.1f rad/s, theta = %.1f rad = %.1f revs\\n', ...
        omega(end), theta(end), theta(end)/(2*pi))`,
          prose: [
            '`omega = omega_0 + alpha * t` directly mirrors the linear v = v₀ + at. MATLAB\'s vector operations apply the formula to all time points simultaneously.',
            '`theta(end)/(2*pi)` converts the total radians rotated into complete revolutions. This is a common practical conversion.',
            'The two subplots show ω and θ side by side — the linear velocity and displacement analogs. The shapes confirm: constant α gives linearly increasing ω and parabolically increasing θ.',
          ],
        },
        {
          cellTitle: 'v_t and Accelerations vs Radius',
          type: 'code',
          language: 'matlab',
          code: `% How tangential speed and accelerations vary with radius
omega = 50;     % rad/s (same for all points on rigid body)
alpha = -2;     % rad/s² (same for all points)
r = linspace(0.01, 0.5, 200);

v_t = r * omega;
a_c = r * omega^2;
a_t = r * abs(alpha);

figure;
subplot(3,1,1)
plot(r, v_t, 'b-', 'LineWidth', 2)
ylabel('v_t (m/s)'); title('Tangential speed = r\\omega (linear in r)'); grid on

subplot(3,1,2)
plot(r, a_c, 'r-', 'LineWidth', 2)
ylabel('a_c (m/s^2)'); title('Centripetal = r\\omega^2 (linear in r)'); grid on

subplot(3,1,3)
plot(r, a_t, 'g-', 'LineWidth', 2)
ylabel('a_t (m/s^2)'); xlabel('Radius r (m)')
title('Tangential a_t = r|\\alpha| (linear in r)'); grid on`,
          prose: [
            '`v_t = r * omega` is the key relationship: tangential speed is proportional to radius. All three quantities (v_t, a_c, a_t) scale linearly with r.',
            'Three separate subplots show each quantity vs radius. All are straight lines — confirming the linear proportionality. Points at larger radius move faster and experience larger accelerations.',
            'Comparing a_c = r×ω² vs a_t = r×|α|: at ω=50 rad/s, a_c = r×2500 is much larger than a_t = r×2 for any r. Centripetal dominates at high rotation speeds.',
          ],
        },
        {
          cellTitle: 'Unit Conversion Reference',
          type: 'code',
          language: 'matlab',
          code: `% Unit conversion functions and table
to_rad = @(deg) deg * pi / 180;
to_deg = @(rad) rad * 180 / pi;
rpm_to_rads = @(rpm) rpm * 2*pi / 60;
rads_to_rpm = @(w) w * 60 / (2*pi);

fprintf('%8s | %10s | %8s\\n', 'RPM', 'rad/s', 'rev/s')
fprintf('%s\\n', repmat('-',1,35))
for rpm = [60, 120, 300, 1200, 3600, 7200]
    fprintf('%8.0f | %10.3f | %8.3f\\n', rpm, rpm_to_rads(rpm), rpm/60)
end

fprintf('\\nAngle conversions:\\n')
for deg = [30, 45, 60, 90, 180, 360]
    fprintf('  %3d deg = %.4f rad\\n', deg, to_rad(deg))
end`,
          prose: [
            '`rpm_to_rads = @(rpm) rpm * 2*pi / 60` defines an anonymous function — a compact way to create a unit conversion tool. The `@(rpm)` syntax makes it callable like a regular function.',
            'The fprintf table shows common RPM values. Note that 1 rpm = 0.1047 rad/s. Many engineering specs use rpm; physics calculations need rad/s.',
            'The angle table confirms that 180° = π rad and 360° = 2π rad — the fundamental conversions from which all others derive.',
          ],
        },
        {
          cellTitle: 'Challenge — Rolling Wheel',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          prompt: 'A bicycle wheel (r = 0.35 m) rolls without slipping at 15 km/h. (1) Convert 15 km/h to m/s. (2) Find ω (for rolling: v_center = rω). (3) Find the speed of the contact point (bottom), center, and top of the wheel. (4) At what rpm does the wheel spin? (5) Plot the speed of a point on the rim as a function of its angular position (0 to 2π).',
          starterCode: `% Rolling wheel analysis
r = 0.35;       % m
v_kmh = 15;     % km/h

% TODO: v_ms = v_kmh / 3.6  (convert to m/s)
% TODO: omega = v_ms / r  (rolling without slip: v = r*omega)
% TODO: rpm = omega * 60 / (2*pi)
% TODO: v_contact_bottom = 0  (instantaneous rest for rolling)
% TODO: v_center = v_ms
% TODO: v_top = 2 * v_ms  (top point has v_forward + v_tangential)
% TODO: fprintf all results
% TODO: plot speed vs angle phi for a point on the rim
% speed = sqrt((v_ms + r*omega*sin(phi)).^2 + (r*omega*cos(phi)).^2) ... or similar`,
        },
      ],
    },
  },
}

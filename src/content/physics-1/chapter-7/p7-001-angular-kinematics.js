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
}

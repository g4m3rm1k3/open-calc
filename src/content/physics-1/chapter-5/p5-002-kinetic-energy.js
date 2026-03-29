export default {
  id: 'p1-ch5-002',
  slug: 'kinetic-energy',
  chapter: 'p5',
  order: 2,
  title: 'Kinetic Energy and the Work-Energy Theorem',
  subtitle: 'Net work done on an object equals its change in kinetic energy — always.',
  tags: ['kinetic energy', 'work-energy theorem', 'KE', 'net work', 'speed', 'mass'],

  hook: {
    question:
      'Two objects have the same kinetic energy. One has mass 4 kg moving at 2 m/s. ' +
      'The other has mass 1 kg. What is the second object\'s speed? ' +
      'Before calculating: which object would be harder to stop?',
    realWorldContext:
      'Kinetic energy is why car crash tests matter so much at highway speeds. ' +
      'Doubling speed does not double crash severity — it quadruples it, because KE grows as the square of speed. ' +
      'A car at 60 mph has four times the kinetic energy of the same car at 30 mph. ' +
      'The Work-Energy Theorem tells us exactly how much braking force and distance are needed to absorb that energy.',
    previewVisualizationId: 'PositionVelocityAcceleration',
  },

  intuition: {
    prose: [
      '**Prediction check:** Object 2 has mass 1 kg. Since \\(KE = \\tfrac{1}{2}mv^2\\), setting \\(\\tfrac{1}{2}(4)(2^2) = \\tfrac{1}{2}(1)v^2\\) gives \\(v = 4\\) m/s. ' +
        'The lighter object moves faster — but which is harder to stop? They have the same kinetic energy, so they need the same amount of work to stop. Same energy, different feel.',

      '**Where does KE come from?** In the previous lesson, you learned that net work transfers energy to an object. ' +
        'But what form does that energy take? When a constant net force accelerates an object from rest, ' +
        'it gains speed. The energy stored in that speed is kinetic energy. ' +
        'The Work-Energy Theorem is the precise connection: the net work done equals the change in kinetic energy.',

      '**The contradiction to build from:** Pushing something twice as hard does NOT give it twice the kinetic energy — ' +
        'because kinetic energy depends on velocity *squared*. ' +
        'Push an object to 10 m/s, then push it again to 20 m/s using the same extra work. ' +
        'You might expect equal energy gains. But \\(KE\\) at 20 m/s is four times \\(KE\\) at 10 m/s. ' +
        'Each metre-per-second of speed costs progressively more work to achieve. ' +
        'That is the \\(v^2\\) factor — and it comes directly from integrating Newton\'s second law.',

      '**Why the formula must have v²:** Acceleration from \\(v_0\\) to \\(v_f\\) covers a displacement that itself depends on speed. ' +
        'When you multiply force × distance, and distance depends on speed, you get a squared term. ' +
        'The \\(\\tfrac{1}{2}\\) is not arbitrary — it is the exact constant that falls out of the integration.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 6 — Work becomes energy',
        body:
          '**Lesson 1 established:** Work = F·d·cos θ. Net work = sum of all works by all forces.\n' +
          '**This lesson:** Net work = change in kinetic energy. This is the Work-Energy Theorem — one of the most useful equations in mechanics.\n' +
          '**Next lesson:** Not all energy is kinetic. Potential energy stores work done against a conservative force (gravity, springs).',
      },
      {
        type: 'definition',
        title: 'Kinetic energy',
        body: 'KE = \\tfrac{1}{2}mv^2 \\qquad [\\text{SI: J = kg·m}^2/\\text{s}^2]',
      },
      {
        type: 'warning',
        title: 'KE scales as v² — not v',
        body:
          'Doubling speed quadruples KE. Tripling speed gives 9× the KE. ' +
          'This is why highway crashes are so much more destructive than parking-lot bumps, ' +
          'and why fuel consumption rises steeply with speed.',
      },
      {
        type: 'connection',
        title: 'Calculus connection: the theorem from first principles',
        body:
          '\\(W_{\\text{net}} = \\int F\\,dx = \\int ma\\,dx = m\\int a\\,dx\\). ' +
          'Using \\(a\\,dx = v\\,dv\\) (from the chain rule): \\(= m\\int_{v_0}^{v_f} v\\,dv = \\tfrac{1}{2}mv_f^2 - \\tfrac{1}{2}mv_0^2 = \\Delta KE\\).',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'work-energy-theorem' },
        title: 'Net work → change in kinetic energy',
        caption:
          'Every arrow (force) that does work either adds to or removes from the KE budget. ' +
          'The Net Work box is the algebraic sum; it equals ΔKE exactly. ' +
          'This is not an approximation — it is exact for any constant or variable force in any direction.',
      },
      {
        id: 'PositionVelocityAcceleration',
        title: 'Watch KE change as force acts',
        mathBridge:
          'Set a constant net force and observe: the velocity curve is linear, ' +
          'but the KE curve (proportional to v²) is a parabola. ' +
          'Equal time intervals produce equal velocity gains but unequal KE gains.',
        caption: 'KE = ½mv² — the parabolic curve shows why speed² matters.',
        props: { showKE: true },
      },
    ],
  },

  math: {
    prose: [
      'Kinetic energy of an object with mass \\(m\\) moving at speed \\(v\\):',
      '\\(KE = \\tfrac{1}{2}mv^2\\)',
      'The **Work-Energy Theorem** states that the net work done on an object equals the change in its kinetic energy:',
      '\\(W_{\\text{net}} = \\Delta KE = \\tfrac{1}{2}mv_f^2 - \\tfrac{1}{2}mv_i^2\\)',
      'This theorem applies regardless of how many forces act, and regardless of the path taken, as long as you use the net work.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Work-Energy Theorem',
        body: 'W_{\\text{net}} = \\Delta KE = \\tfrac{1}{2}mv_f^2 - \\tfrac{1}{2}mv_i^2',
      },
      {
        type: 'insight',
        title: 'Using it: three equivalent setups',
        body:
          'Know \\(W_{\\text{net}}\\) → find final speed.\\\\' +
          'Know final and initial speeds → find net work done.\\\\' +
          'Know net work and initial speed → find final speed.\\\\' +
          'The theorem is bidirectional — read it in either direction.',
      },
      {
        type: 'mnemonic',
        title: 'KE is always non-negative',
        body:
          '\\(v^2 \\geq 0\\) always, so \\(KE \\geq 0\\). ' +
          'Negative work by net force means the object slows down (KE decreases). ' +
          'It does not mean KE goes negative — it means the object lost energy, possibly to friction or another object.',
      },
    ],
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'KE = ½mv² — the parabolic growth with speed',
        mathBridge:
          'Drag the speed slider. KE grows as v². ' +
          'Notice: to double KE you do not double v — you multiply v by \\(\\sqrt{2} \\approx 1.41\\).',
        caption: 'The v² dependence is why fuel economy drops so sharply at highway speeds.',
        props: { expression: '0.5*70*x*x', variable: 'v', xMin: 0, xMax: 30, label: 'KE (J) for 70 kg object' },
      },
    ],
  },

  rigor: {
    title: 'Proving the Work-Energy Theorem from Newton\'s Second Law',
    prose: [
      'The theorem is not an assumption — it is derived. Here is the proof for a variable net force in 1D.',
    ],
    proofSteps: [
      {
        expression: 'W_{\\text{net}} = \\int_{x_i}^{x_f} F_{\\text{net}}\\,dx',
        annotation: 'Work is the integral of force over displacement.',
      },
      {
        expression: 'F_{\\text{net}} = ma = m\\frac{dv}{dt}',
        annotation: 'Newton\'s Second Law. Substitute into the integral.',
      },
      {
        expression: 'W_{\\text{net}} = \\int_{x_i}^{x_f} m\\frac{dv}{dt}\\,dx',
        annotation: 'Replace F with ma.',
      },
      {
        expression: '= m\\int_{x_i}^{x_f} \\frac{dv}{dt}\\cdot\\frac{dx}{dt}\\cdot dt = m\\int_{v_i}^{v_f} v\\,dv',
        annotation:
          'Change variables: dx = (dx/dt) dt = v dt, so (dv/dt) dx = (dv/dt)(v dt) = v dv. ' +
          'Limits change from position to velocity.',
      },
      {
        expression: 'W_{\\text{net}} = m\\left[\\tfrac{1}{2}v^2\\right]_{v_i}^{v_f} = \\tfrac{1}{2}mv_f^2 - \\tfrac{1}{2}mv_i^2',
        annotation: 'Integrate. The result is exactly ΔKE. QED.',
      },
    ],
  },

  examples: [
    {
      id: 'ch5-002-ex1',
      title: 'Braking distance from kinetic energy',
      problem:
        '\\text{A 1200 kg car traveling at 25 m/s brakes to a stop. ' +
        'The braking force is 9000 N. Find the stopping distance.}',
      steps: [
        {
          expression: 'W_{\\text{net}} = \\Delta KE = 0 - \\tfrac{1}{2}(1200)(25)^2 = -375{,}000\\,\\text{J}',
          annotation: 'The car goes from 25 m/s to rest. KE change is negative — the car loses energy.',
        },
        {
          expression: 'W_{\\text{brake}} = -9000 \\times d = -375{,}000',
          annotation: 'Braking force does negative work (opposes motion). Set equal to ΔKE.',
        },
        {
          expression: 'd = \\frac{375{,}000}{9000} = 41.7\\,\\text{m}',
          annotation: 'Solve for stopping distance.',
        },
      ],
      conclusion:
        'Stopping distance ≈ 42 m. If speed were 50 m/s instead, KE would be 4× larger, requiring 4× the stopping distance — the v² effect.',
    },
    {
      id: 'ch5-002-ex2',
      title: 'Finding speed after net work',
      problem:
        '\\text{A 5 kg block starts at rest. A 40 N net force acts over 10 m. Find the final speed.}',
      steps: [
        {
          expression: 'W_{\\text{net}} = 40 \\times 10 = 400\\,\\text{J}',
          annotation: 'Net work = F × d (force aligned with displacement).',
        },
        {
          expression: '400 = \\tfrac{1}{2}(5)v_f^2 - 0',
          annotation: 'Apply Work-Energy Theorem. Initial KE = 0 (starts at rest).',
        },
        {
          expression: 'v_f = \\sqrt{\\frac{2 \\times 400}{5}} = \\sqrt{160} \\approx 12.6\\,\\text{m/s}',
          annotation: 'Solve for final speed.',
        },
      ],
      conclusion: 'Final speed ≈ 12.6 m/s. Note: we never needed to find acceleration or use kinematics equations.',
    },
  ],

  challenges: [
    {
      id: 'ch5-002-ch1',
      difficulty: 'easy',
      problem: '\\text{A 3 kg object moves at 6 m/s. Find its kinetic energy.}',
      hint: 'KE = ½mv².',
      walkthrough: [
        { expression: 'KE = \\tfrac{1}{2}(3)(6)^2 = \\tfrac{1}{2}(3)(36) = 54\\,\\text{J}', annotation: 'Direct substitution.' },
      ],
      answer: 'KE = 54 J.',
    },
    {
      id: 'ch5-002-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A 2 kg toy car starts at 3 m/s. A 10 N friction force acts over 4 m. Find the final speed.}',
      hint: 'Calculate net work (friction does negative work), then apply Work-Energy Theorem.',
      walkthrough: [
        {
          expression: 'W_{\\text{net}} = -10 \\times 4 = -40\\,\\text{J}',
          annotation: 'Friction opposes motion. Net work is negative.',
        },
        {
          expression: '\\Delta KE = -40 \\Rightarrow \\tfrac{1}{2}(2)v_f^2 - \\tfrac{1}{2}(2)(9) = -40',
          annotation: 'Apply the theorem.',
        },
        {
          expression: 'v_f^2 = 9 - 40 = -31',
          annotation: 'Negative v²? This means the car stopped before travelling 4 m — it ran out of KE first.',
        },
      ],
      answer: 'The car stops before covering 4 m. It stops when all initial KE is exhausted: d = ½mv²/F = ½(2)(9)/10 = 0.9 m.',
    },
    {
      id: 'ch5-002-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A variable force } F(x) = 4x - x^2 \\text{ (N) acts on a 2 kg particle from } x=0 \\text{ to } x=3\\text{ m. ' +
        'Starting from rest, find the final speed.}',
      hint: 'W = ∫₀³ (4x − x²) dx, then use Work-Energy Theorem.',
      walkthrough: [
        {
          expression: 'W = \\int_0^3 (4x - x^2)\\,dx = \\left[2x^2 - \\tfrac{x^3}{3}\\right]_0^3',
          annotation: 'Integrate the variable force.',
        },
        {
          expression: 'W = (18 - 9) - 0 = 9\\,\\text{J}',
          annotation: 'Net work done on the particle.',
        },
        {
          expression: '9 = \\tfrac{1}{2}(2)v_f^2 \\Rightarrow v_f = 3\\,\\text{m/s}',
          annotation: 'Apply Work-Energy Theorem. Initial KE = 0.',
        },
      ],
      answer: 'Final speed = 3 m/s.',
    },
  ],
}

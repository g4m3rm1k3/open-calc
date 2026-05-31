export default {
  id: 'p1-ch7-003',
  slug: 'rotational-dynamics',
  chapter: 'p7',
  order: 3,
  title: 'Rotational Dynamics: τ = Iα',
  subtitle: 'Newton\'s Second Law for rotation — same structure, different cast.',
  tags: ['rotational dynamics', 'tau = I alpha', 'Newton second law rotation', 'angular acceleration', 'moment of inertia'],

  hook: {
    question:
      'Two cylinders — one solid, one hollow — have the same mass and radius. Both roll from rest down the same ramp. Which reaches the bottom first? Intuition says: same mass, same gravity, same ramp — they should tie. They don\'t. One wins every time. Which one, and why?',
    realWorldContext:
      'Rotational dynamics governs every spinning system: flywheels in engines, figure skaters pulling in their arms, a diver tucking into a somersault, the wobble of a spinning top, and the torque specs for every bolt in a car engine. The equation τ = Iα is Newton\'s Second Law dressed for rotation — same logic, same structure.',
    previewVisualizationId: 'OscillationViz',
  },

  intuition: {
    prose: [
      '**The answer:** The solid cylinder wins. Both accelerate down the ramp under gravity, but rotating objects have to "share" their energy between translational and rotational kinetic energy. The hollow cylinder has more of its mass concentrated at the rim (larger moment of inertia I), so it needs more energy to spin up — leaving less for translational speed. Same mass, different distribution → different rotational inertia → different acceleration.',

      '**Newton\'s Second Law for rotation:** Just as \\(F = ma\\) relates force to linear acceleration, \\(\\tau = I\\alpha\\) relates torque to angular acceleration. The mass \\(m\\) is replaced by the **moment of inertia** \\(I\\), which measures not just how much mass but WHERE that mass is relative to the rotation axis.',

      '**Why location matters:** A kilogram at the rim of a wheel is much harder to start spinning than a kilogram at the center. The center mass barely moves when the wheel rotates; the rim mass has to travel a full circle. Moment of inertia \\(I = \\sum m_i r_i^2\\) weights each bit of mass by its squared distance from the axis. Double the distance → quadruple the contribution to rotational inertia.',

      '**The full analogy:** Linear: F → a → motion. Rotational: τ → α → rotation. The mass m in linear is replaced by I in rotation. KE = ½mv² in linear becomes ½Iω² in rotation. Everything you know about linear dynamics translates — just swap the symbols.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 4 — The rotational Newton\'s Second Law',
        body:
          '**Lesson 2:** Torque τ = rF sin θ — the cause of rotational change.\n**This lesson:** τ = Iα — torque produces angular acceleration. I is the rotational inertia.\n**Next:** Moment of inertia — how to calculate I for different mass distributions.',
      },
      {
        type: 'theorem',
        title: 'Newton\'s Second Law for Rotation',
        body: '\\tau_{\\text{net}} = I\\alpha \\qquad [\\text{τ in N·m, I in kg·m², α in rad/s²}]',
      },
      {
        type: 'definition',
        title: 'Moment of inertia (point masses)',
        body: 'I = \\sum_i m_i r_i^2 \\qquad [\\text{SI: kg·m}^2]',
      },
      {
        type: 'insight',
        title: 'Rotational kinetic energy',
        body:
          'KE_{\\text{rot}} = \\tfrac{1}{2}I\\omega^2 \\quad \\text{(mirrors } \\tfrac{1}{2}mv^2\\text{)}\n\nFor a rolling object: \\(KE_{\\text{total}} = \\tfrac{1}{2}mv^2 + \\tfrac{1}{2}I\\omega^2\\)',
      },
      {
        type: 'connection',
        title: 'Calculus: L = Iω and τ = dL/dt',
        body:
          'Angular momentum \\(L = I\\omega\\). Newton\'s 2nd for rotation: \\(\\tau = dL/dt\\). For constant I: \\(\\tau = I(d\\omega/dt) = I\\alpha\\). Mirrors the linear \\(F = dp/dt = ma\\) structure exactly.',
      },
    ],
    visualizations: [
      {
        id: 'OscillationViz',
        title: 'Torque accelerates rotation',
        mathBridge:
          'Apply a torque. Watch α = τ/I — larger I means smaller α for the same τ. A hollow cylinder (I = mr²) accelerates slower than a solid cylinder (I = ½mr²) under equal torque.',
        caption: 'τ = Iα: more inertia → less angular acceleration for the same torque.',
        props: { showTorque: true },
      },
    ],
  },

  math: {
    prose: [
      'For a rigid body rotating about a fixed axis, the net torque produces angular acceleration:',
      '\\(\\tau_{\\text{net}} = I\\alpha\\)',
      'For a rolling object (both translating and rotating):',
      '\\(\\vec{a} = \\vec{F}_{\\text{net}}/m\\) (translational)',
      '\\(\\alpha = \\tau_{\\text{net}}/I\\) (rotational)',
      'And the rolling constraint: \\(a = r\\alpha\\) (no slipping).',
      'The rotational kinetic energy: \\(KE_{\\text{rot}} = \\tfrac{1}{2}I\\omega^2\\)',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Rolling without slipping',
        body: 'v_{\\text{cm}} = r\\omega \\quad \\text{and} \\quad a_{\\text{cm}} = r\\alpha',
      },
      {
        type: 'insight',
        title: 'The parallel axis theorem',
        body:
          'I about any axis = I about center of mass + Md²\\\\\\(I = I_{\\text{cm}} + Md^2\\)\\\\where d = distance from cm to the new axis. Rotating about a non-center axis always increases I.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'rolling-cylinder' },
        title: 'Rolling: translational + rotational energy',
        caption:
          'Energy bar splits into translational (½mv²) and rotational (½Iω²) portions. The hollow cylinder allocates more energy to rotation, leaving less for speed at the bottom.',
      },
    ],
  },

  rigor: {
    title: 'Deriving τ = Iα for a rigid body',
    proofSteps: [
      {
        expression: '\\text{Consider particle } i \\text{ at radius } r_i \\text{ with tangential force } F_{t,i}',
        annotation: 'Decompose a rigid body into mass elements.',
      },
      {
        expression: 'F_{t,i} = m_i a_{t,i} = m_i r_i \\alpha',
        annotation: 'Newton\'s second law for each particle tangentially. All share the same α (rigid body).',
      },
      {
        expression: '\\tau_i = r_i F_{t,i} = m_i r_i^2 \\alpha',
        annotation: 'Torque from particle i about the axis.',
      },
      {
        expression: '\\tau_{\\text{net}} = \\sum_i \\tau_i = \\left(\\sum_i m_i r_i^2\\right)\\alpha = I\\alpha',
        annotation: 'Sum over all particles. The bracketed term is the definition of moment of inertia I. QED.',
      },
    ],
  },

  examples: [
    {
      id: 'ch7-003-ex1',
      title: 'Disk accelerated by a torque',
      problem:
        '\\text{A solid disk (m = 5 kg, r = 0.3 m) starts from rest and reaches ω = 40 rad/s in 8 s. Find the net torque required.}',
      steps: [
        {
          expression: 'I = \\tfrac{1}{2}mr^2 = \\tfrac{1}{2}(5)(0.09) = 0.225\\,\\text{kg·m}^2',
          annotation: 'Moment of inertia for a solid disk: I = ½mr².',
        },
        {
          expression: '\\alpha = \\frac{\\Delta\\omega}{\\Delta t} = \\frac{40}{8} = 5\\,\\text{rad/s}^2',
          annotation: 'Angular acceleration.',
        },
        {
          expression: '\\tau = I\\alpha = (0.225)(5) = 1.125\\,\\text{N·m}',
          annotation: 'Net torque needed.',
        },
      ],
      conclusion: 'τ = 1.125 N·m. Small torque because the disk is light and the acceleration isn\'t large.',
    },
    {
      id: 'ch7-003-ex2',
      title: 'Rolling cylinder down a ramp — energy method',
      problem:
        '\\text{A solid cylinder (m = 2 kg, r = 0.1 m) rolls without slipping from rest down a 0.5 m high ramp. Find its speed at the bottom.}',
      steps: [
        {
          expression: 'mgh = \\tfrac{1}{2}mv^2 + \\tfrac{1}{2}I\\omega^2',
          annotation: 'Energy conservation: gravitational PE → translational KE + rotational KE.',
        },
        {
          expression: 'I = \\tfrac{1}{2}mr^2 \\quad \\text{and} \\quad \\omega = v/r \\Rightarrow \\tfrac{1}{2}I\\omega^2 = \\tfrac{1}{4}mv^2',
          annotation: 'Solid cylinder: I = ½mr². Rolling constraint: ω = v/r.',
        },
        {
          expression: 'mgh = \\tfrac{1}{2}mv^2 + \\tfrac{1}{4}mv^2 = \\tfrac{3}{4}mv^2',
          annotation: 'Combine: mass cancels.',
        },
        {
          expression: 'v = \\sqrt{\\frac{4gh}{3}} = \\sqrt{\\frac{4(9.8)(0.5)}{3}} = \\sqrt{6.53} \\approx 2.56\\,\\text{m/s}',
          annotation: 'Speed at bottom. Compare to sliding (no rotation): v = √(2gh) = 3.13 m/s. Rolling is slower.',
        },
      ],
      conclusion: 'v ≈ 2.56 m/s. 18% slower than sliding — energy "tied up" in rotation.',
    },
  ],

  challenges: [
    {
      id: 'ch7-003-ch1',
      difficulty: 'easy',
      problem: '\\text{A flywheel (I = 2 kg·m²) accelerates from rest to 30 rad/s in 6 s. Find the torque.}',
      hint: 'α = Δω/Δt; τ = Iα.',
      walkthrough: [
        { expression: '\\alpha = 30/6 = 5\\,\\text{rad/s}^2; \\quad \\tau = (2)(5) = 10\\,\\text{N·m}', annotation: 'Direct application of τ = Iα.' },
      ],
      answer: 'τ = 10 N·m.',
    },
    {
      id: 'ch7-003-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A hollow sphere (I = ⅔mr²) and solid sphere (I = ⅖mr²) roll from rest down the same ramp. Which is faster at the bottom? Find the ratio of their speeds.}',
      hint: 'Use energy conservation. v² = 2gh / (1 + I/(mr²)). Compare the denominators.',
      walkthrough: [
        {
          expression: 'v^2 = \\frac{2gh}{1 + I/(mr^2)}',
          annotation: 'General rolling result from energy conservation.',
        },
        {
          expression: 'v_{\\text{solid}}^2 = \\frac{2gh}{1 + 2/5} = \\frac{2gh}{7/5} = \\frac{10gh}{7}',
          annotation: 'Solid sphere: I = ⅖mr².',
        },
        {
          expression: 'v_{\\text{hollow}}^2 = \\frac{2gh}{1 + 2/3} = \\frac{2gh}{5/3} = \\frac{6gh}{5}',
          annotation: 'Hollow sphere: I = ⅔mr².',
        },
        {
          expression: '\\frac{v_{\\text{solid}}}{v_{\\text{hollow}}} = \\sqrt{\\frac{10/7}{6/5}} = \\sqrt{\\frac{50}{42}} \\approx 1.09',
          annotation: 'Solid sphere is about 9% faster.',
        },
      ],
      answer: 'Solid sphere wins by ≈ 9%. Less rotational inertia → more translational speed.',
    },
    {
      id: 'ch7-003-ch3',
      difficulty: 'hard',
      problem:
        '\\text{An Atwood machine: two masses } m_1 = 3\\text{ kg and } m_2 = 5\\text{ kg hang over a solid disk pulley (M = 2 kg, R = 0.1 m). Find the acceleration. (Hint: include pulley inertia.)}',
      hint: 'Net force = (m₂ − m₁)g. Total "effective mass" includes pulley: m₁ + m₂ + I/R² = m₁ + m₂ + M/2.',
      walkthrough: [
        {
          expression: 'I_{\\text{disk}} = \\tfrac{1}{2}MR^2 = \\tfrac{1}{2}(2)(0.01) = 0.01\\,\\text{kg·m}^2',
          annotation: 'Pulley moment of inertia.',
        },
        {
          expression: '(m_2 - m_1)g = (m_1 + m_2 + I/R^2)a',
          annotation: 'Net force = total inertia × acceleration. I/R² converts rotational to translational.',
        },
        {
          expression: 'a = \\frac{(5-3)(9.8)}{3+5+0.01/0.01} = \\frac{19.6}{3+5+1} = \\frac{19.6}{9} \\approx 2.18\\,\\text{m/s}^2',
          annotation: 'I/R² = 0.01/0.01 = 1 kg (equivalent translational mass of pulley).',
        },
      ],
      answer: 'a ≈ 2.18 m/s² (less than without pulley mass, which gives 2.45 m/s²).',
    },
  ],

  quiz: [
    {
      id: 'p7-003-q1',
      type: 'choice',
      question: 'A solid disk (I = ½MR² = 0.4 kg·m²) is acted on by a net torque of 2.0 N·m. What is its angular acceleration?',
      options: ['0.8 rad/s²', '2.0 rad/s²', '5.0 rad/s²', '0.2 rad/s²'],
      answer: '5.0 rad/s²',
      hints: ['Use τ = Iα, solve for α = τ/I.', 'α = 2.0 / 0.4 = 5.0 rad/s².'],
      reviewSection: 'intuition',
    },
    {
      id: 'p7-003-q2',
      type: 'choice',
      question: 'A solid cylinder rolls without slipping down a ramp. What fraction of its total kinetic energy is rotational?',
      options: ['1/4', '1/3', '1/2', '2/3'],
      answer: '1/3',
      hints: ['KE_rot = ½Iω² = ½(½mr²)(v/r)² = ¼mv².', 'KE_total = ½mv² + ¼mv² = ¾mv². Fraction = (¼mv²)/(¾mv²) = 1/3.'],
      reviewSection: 'math',
    },
    {
      id: 'p7-003-q3',
      type: 'choice',
      question: 'A hollow cylinder (I = MR²) and a solid cylinder (I = ½MR²) are released from rest at the top of the same ramp. Which reaches the bottom first?',
      options: ['Solid cylinder', 'Hollow cylinder', 'They arrive simultaneously', 'Depends on mass'],
      answer: 'Solid cylinder',
      hints: ['Speed at bottom: v = √(2gh / (1 + I/(mr²))).', 'Solid: denominator = 1 + ½ = 3/2. Hollow: 1 + 1 = 2. Smaller denominator → higher speed.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p7-003-q4',
      type: 'choice',
      question: 'For a rolling object with v_cm = 3 m/s and radius R = 0.1 m, what is its angular velocity?',
      options: ['0.3 rad/s', '3 rad/s', '30 rad/s', '0.033 rad/s'],
      answer: '30 rad/s',
      hints: ['Rolling constraint: v = Rω, so ω = v/R.', 'ω = 3 / 0.1 = 30 rad/s.'],
      reviewSection: 'math',
    },
    {
      id: 'p7-003-q5',
      type: 'choice',
      question: 'The rotational kinetic energy formula KE_rot = ½Iω² corresponds to which linear formula?',
      options: ['KE = ½mv²', 'KE = mv', 'F = ma', 'W = Fd'],
      answer: 'KE = ½mv²',
      hints: ['Every rotational quantity has a linear analogue: I ↔ m, ω ↔ v.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p7-003-q6',
      type: 'choice',
      question: 'A 3 kg·m² flywheel decelerates from 50 rad/s to 20 rad/s in 6 s under a braking torque. What is the braking torque magnitude?',
      options: ['5 N·m', '10 N·m', '15 N·m', '25 N·m'],
      answer: '15 N·m',
      hints: ['α = Δω/Δt = (20 − 50)/6 = −5 rad/s².', 'τ = Iα = 3 × 5 = 15 N·m.'],
      reviewSection: 'intuition',
    },
    {
      id: 'p7-003-q7',
      type: 'choice',
      question: 'Two identical blocks hang from a massless rope over a solid disk pulley (I = ½MR²). If the pulley has the same mass as each block, how does adding pulley inertia change the system acceleration?',
      options: ['Acceleration decreases', 'Acceleration increases', 'Acceleration is unchanged', 'Acceleration doubles'],
      answer: 'Acceleration decreases',
      hints: ['The pulley adds effective translational mass I/R² = ½M to the denominator of (m₂−m₁)g/(m₁+m₂+I/R²).', 'More total inertia → smaller acceleration for the same net force.'],
      reviewSection: 'challenges',
    },
    {
      id: 'p7-003-q8',
      type: 'choice',
      question: 'A solid sphere (I = 2/5 MR²) rolls without slipping. Which speed formula gives v at the bottom of a ramp of height h?',
      options: ['v = √(10gh/7)', 'v = √(2gh)', 'v = √(4gh/3)', 'v = √(6gh/5)'],
      answer: 'v = √(10gh/7)',
      hints: ['Energy: mgh = ½mv² + ½(2/5 MR²)(v/R)² = ½mv² + 1/5 mv² = 7/10 mv².', 'v² = 10gh/7.'],
      reviewSection: 'math',
    },
    {
      id: 'p7-003-q9',
      type: 'choice',
      question: 'The parallel axis theorem states I = I_cm + Md². What does d represent?',
      options: ['Distance between the new axis and the center-of-mass axis', 'Diameter of the object', 'Distance traveled by the center of mass', 'Depth of the rotation axis'],
      answer: 'Distance between the new axis and the center-of-mass axis',
      hints: ['The parallel axis theorem shifts the rotation axis away from the center of mass by distance d.'],
      reviewSection: 'math',
    },
    {
      id: 'p7-003-q10',
      type: 'choice',
      question: 'An object rolls without slipping. Its translational speed is v and rotational speed is ω. Which constraint must hold?',
      options: ['v = Rω', 'v = ω/R', 'v = R²ω', 'v = √(Rω)'],
      answer: 'v = Rω',
      hints: ['The contact point has zero velocity relative to the ground — this gives the rolling constraint v = Rω.'],
      reviewSection: 'math',
    },
  ],

  misconceptions: [
    {
      id: 'p7-003-m1',
      misconception: 'A hollow and solid cylinder of the same mass and radius have the same rotational inertia.',
      correction: 'The hollow cylinder (I = MR²) has twice the rotational inertia of the solid cylinder (I = ½MR²). The hollow cylinder has all its mass at the rim — farther from the axis — so each kilogram contributes R² instead of an average of R²/2. Mass location determines I, not just mass.',
      correctionExample: 'Solid disk: I = ½(2 kg)(0.1 m)² = 0.01 kg·m². Hollow cylinder (same M, R): I = (2)(0.01) = 0.02 kg·m². Double the resistance to angular acceleration.',
    },
    {
      id: 'p7-003-m2',
      misconception: 'A rolling object arrives at the same speed as a sliding object (no friction) because energy is conserved in both cases.',
      correction: 'Both conserve mechanical energy, but the rolling object splits its energy between translational KE and rotational KE. The sliding object puts ALL energy into translational KE. Same height, same total energy — but the roller uses some energy to spin, leaving less for speed. v_slide = √(2gh), v_solid cylinder = √(4gh/3) — about 18% slower.',
      correctionExample: 'h = 1 m: v_slide = √(19.6) = 4.43 m/s. v_solid_cylinder = √(4×9.8×1/3) = √(13.07) = 3.61 m/s.',
    },
    {
      id: 'p7-003-m3',
      misconception: 'The torque equation τ = Iα works the same way as F = ma, so I can just replace F with τ and m with I.',
      correction: 'The analogy is exact for rotation about a fixed axis. But when the axis can move (like a rolling object), you need BOTH F = ma for the center of mass AND τ = Iα about the center of mass, plus the rolling constraint v = Rω. You cannot combine them into a single equation without the constraint.',
      correctionExample: 'Rolling cylinder on a ramp: ΣF = ma gives mg sinθ − f = ma. Στ = Iα gives fR = (½mR²)α. Rolling constraint: a = Rα. Three equations, three unknowns (a, α, f).',
    },
  ],

  transferPrompts: [
    {
      id: 'p7-003-t1',
      prompt: `A flywheel in an engine stores rotational kinetic energy (KE = ½Iω²). Engineers want to store 1 MJ in a flywheel spinning at 3000 rpm. How does this constrain the design choices for I? What tradeoffs exist between making a large-radius, low-mass flywheel versus a small-radius, high-mass one?`,
      connection: 'τ = Iα and KE_rot = ½Iω²: moment of inertia determines both energy storage and how quickly a flywheel can change speed.',
    },
    {
      id: 'p7-003-t2',
      prompt: `A soccer ball (hollow sphere, I = 2/3 MR²) and a bowling ball (solid sphere, I = 2/5 MR²) are the same diameter and total mass. Both are rolled at the same speed. Which one takes longer to stop on a rough surface? What does this tell you about the relationship between moment of inertia and how hard it is to change rotational motion?`,
      connection: 'τ = Iα: more rotational inertia means a given braking torque produces less angular deceleration, so the object rolls farther before stopping.',
    },
  ],

  debugging: [
    {
      id: 'p7-003-d1',
      error: `A student solving "find speed of a rolling solid disk at the bottom of h = 2 m ramp" writes:
mgh = ½mv²
v = √(2gh) = √(2 × 9.8 × 2) = 6.26 m/s`,
      fix: `The student forgot to include rotational kinetic energy. For a rolling object:
mgh = ½mv² + ½Iω² = ½mv² + ½(½mR²)(v/R)² = ½mv² + ¼mv² = ¾mv²
v = √(4gh/3) = √(4 × 9.8 × 2 / 3) = √(26.1) ≈ 5.11 m/s
The sliding formula v = √(2gh) ignores the energy tied up in rotation.`,
    },
    {
      id: 'p7-003-d2',
      error: `A student computing angular acceleration of a solid disk writes:
τ = Iα → α = τ/I = τ/(MR²)
For M = 4 kg, R = 0.2 m, τ = 1.6 N·m: α = 1.6/(4 × 0.04) = 1.6/0.16 = 10 rad/s²`,
      fix: `The moment of inertia for a solid disk is I = ½MR², not MR². MR² is the formula for a hollow ring/cylinder.
I = ½(4)(0.04) = 0.08 kg·m²
α = τ/I = 1.6/0.08 = 20 rad/s²
Always check which shape's I formula applies — solid vs hollow changes the result by a factor of 2.`,
    },
  ],

  mastery: {
    targetLevel: 'Apply τ = Iα to spinning systems; use energy conservation (KE_trans + KE_rot) for rolling objects; analyze Atwood machines with pulley inertia.',
    checklistItems: [
      'Can compute α from τ and I using τ = Iα',
      'Can find speed of a rolling object using energy conservation including rotational KE',
      'Can identify the correct I formula (solid disk ½MR², hollow cylinder MR², sphere 2/5 MR²)',
      'Can apply the rolling constraint a = Rα (or v = Rω) to connect translational and rotational quantities',
      'Can solve Atwood machine problems including pulley rotational inertia',
    ],
    commonStruggles: [
      'Forgetting to include rotational KE in energy conservation for rolling objects — gives answers that are too fast',
      'Using wrong I formula (MR² instead of ½MR² for a solid disk)',
      'Failing to apply the rolling constraint when needed, leaving problems under-constrained',
    ],
    nextSteps: 'Lesson p7-004 (Moment of Inertia) covers how to calculate I for arbitrary shapes using integration and the parallel axis theorem.',
  },

  semantics: {
    core: [
      { symbol: 'τ', meaning: 'Net torque (N·m) — the rotational cause of angular acceleration' },
      { symbol: 'I', meaning: 'Moment of inertia (kg·m²) — rotational analogue of mass; depends on mass distribution' },
      { symbol: 'α', meaning: 'Angular acceleration (rad/s²) — rate of change of angular velocity' },
      { symbol: 'KE_{rot}', meaning: 'Rotational kinetic energy = ½Iω² — energy stored in rotation' },
      { symbol: 'v = Rω', meaning: 'Rolling constraint — translational speed equals radius times angular speed when rolling without slipping' },
      { symbol: 'L = Iω', meaning: 'Angular momentum (kg·m²/s) — conserved when net torque is zero' },
    ],
    rulesOfThumb: [
      'τ = Iα mirrors F = ma exactly — swap τ↔F, I↔m, α↔a.',
      'Rolling objects arrive slower than sliding objects of the same mass from the same height — energy splits between translation and rotation.',
      'Hollow cylinder (I = MR²) resists angular acceleration twice as much as solid disk (I = ½MR²) of same M and R.',
      'A rolling object has (1/(1 + I/mR²)) of the acceleration of a frictionless sliding object — always less than 1.',
      'Energy in rolling: solid disk puts 1/3 into rotation, solid sphere puts 2/7 into rotation, hollow cylinder puts 1/2 into rotation.',
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      title: 'Rotational Dynamics in Python',
      cells: [
        {
          cellTitle: 'τ = Iα: compare solid vs hollow disk',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Same torque applied to two disks: solid (I = ½MR²) vs hollow (I = MR²)
M = 2.0   # kg
R = 0.1   # m
tau = 1.0 # N·m

I_solid  = 0.5 * M * R**2   # ½MR² for solid disk
I_hollow = M * R**2          # MR² for hollow cylinder

alpha_solid  = tau / I_solid   # τ = Iα → α = τ/I
alpha_hollow = tau / I_hollow

t = np.linspace(0, 5, 200)
omega_solid  = alpha_solid  * t   # starting from rest: ω = αt
omega_hollow = alpha_hollow * t

plt.figure(figsize=(8, 5))
plt.plot(t, omega_solid,  label=f'Solid disk (α = {alpha_solid:.1f} rad/s²)',  linewidth=2)
plt.plot(t, omega_hollow, label=f'Hollow cylinder (α = {alpha_hollow:.1f} rad/s²)', linewidth=2, linestyle='--')
plt.xlabel('Time (s)')
plt.ylabel('Angular velocity (rad/s)')
plt.title('Same torque, different I: τ = Iα')
plt.legend()
plt.grid(True)
plt.show()

print(f"Solid disk I = {I_solid:.4f} kg·m²,  α = {alpha_solid:.1f} rad/s²")
print(f"Hollow cyl I = {I_hollow:.4f} kg·m², α = {alpha_hollow:.1f} rad/s²")
print(f"Hollow takes {alpha_solid/alpha_hollow:.1f}× longer to reach the same ω")`,
          prose: [
            'We compute I for two disks with the same mass and radius: solid disk I = ½MR² (mass spread evenly), hollow cylinder I = MR² (all mass at rim). The ½ factor means the solid disk has half the rotational inertia.',
            'α = τ/I is a direct consequence of τ = Iα. With the same torque τ, a smaller I produces a larger α — the solid disk spins up twice as fast. This is the rotational version of "a lighter object accelerates faster under the same force."',
            'The diverging lines show the gap widening over time: at t = 5 s, the solid disk reaches twice the angular velocity of the hollow cylinder, all from having half the moment of inertia.',
          ],
        },
        {
          cellTitle: 'Rolling energy partition: where does the energy go?',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Rolling objects: energy splits between translation and rotation
# KE_total = ½mv² + ½Iω²  with  ω = v/R
# For KE_rot/KE_total: use β = I/(mR²), then fraction = β/(1+β)

shapes = {
    'Hollow cylinder\\n(I = MR²)':       1.0,   # β = I/(mR²) = 1
    'Solid disk\\n(I = ½MR²)':            0.5,   # β = 0.5
    'Hollow sphere\\n(I = ⅔MR²)':         2/3,   # β = 2/3
    'Solid sphere\\n(I = ⅖MR²)':          2/5,   # β = 2/5
}

labels = list(shapes.keys())
betas  = list(shapes.values())

rot_fraction   = [b/(1+b) for b in betas]  # fraction of KE that is rotational
trans_fraction = [1/(1+b) for b in betas]  # fraction that is translational

x = np.arange(len(labels))
width = 0.4

fig, ax = plt.subplots(figsize=(9, 5))
bars1 = ax.bar(x, trans_fraction, width, label='Translational KE', color='steelblue')
bars2 = ax.bar(x, rot_fraction,   width, bottom=trans_fraction, label='Rotational KE', color='salmon')

ax.set_xticks(x)
ax.set_xticklabels(labels, fontsize=9)
ax.set_ylabel('Fraction of total KE')
ax.set_title('Rolling energy partition by shape (mgh = KE_trans + KE_rot)')
ax.legend()
ax.set_ylim(0, 1.05)
plt.tight_layout()
plt.show()

# Speed at bottom of ramp height h = 1 m
h = 1.0; g = 9.8
print("Speed at bottom of h=1m ramp:")
for name, beta in shapes.items():
    v = np.sqrt(2*g*h / (1 + beta))
    print(f"  {name.replace(chr(10),' ')}: v = {v:.3f} m/s (rot fraction = {beta/(1+beta):.1%})")`,
          prose: [
            'The key insight is that β = I/(mR²) tells us the energy split: rotational fraction = β/(1+β). A hollow cylinder (β = 1) gives half its energy to rotation; a solid sphere (β = 2/5) gives only 2/7 to rotation — arriving faster.',
            'Rolling constraint ω = v/R lets us express KE_rot in terms of v alone: ½Iω² = ½I(v/R)² = ½βmv². So KE_total = ½mv²(1 + β), and we can solve for v at the bottom without knowing ω separately.',
            'The bar chart makes the race visual: taller blue bar = more energy as translation = faster arrival. Every rolling object is slower than a frictionless slider (all blue), but shapes with mass near the center (sphere) lose the least to rotation.',
          ],
        },
        {
          cellTitle: 'Atwood machine with pulley inertia',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Atwood machine: m1 and m2 hang over a solid disk pulley (mass M, radius R)
# Pulley's rotational inertia adds M/2 to effective translational mass
# a = (m2 - m1)*g / (m1 + m2 + M/2)

g = 9.8
m1 = 3.0  # kg (lighter side)
m2 = 5.0  # kg (heavier side)
R  = 0.1  # m  (pulley radius)

M_values = np.linspace(0, 10, 200)  # vary pulley mass from massless to heavy

a_values = (m2 - m1) * g / (m1 + m2 + M_values / 2)
# M/2 because for a solid disk: I/R² = (½MR²)/R² = M/2

a_no_pulley = (m2 - m1) * g / (m1 + m2)  # frictionless massless pulley

plt.figure(figsize=(8, 5))
plt.plot(M_values, a_values, label='With pulley inertia', linewidth=2, color='steelblue')
plt.axhline(a_no_pulley, color='salmon', linestyle='--', label=f'Massless pulley: a = {a_no_pulley:.2f} m/s²')
plt.xlabel('Pulley mass M (kg)')
plt.ylabel('System acceleration (m/s²)')
plt.title('Atwood machine: pulley inertia reduces acceleration')
plt.legend()
plt.grid(True)
plt.show()

# Specific case: M = 2 kg
M_case = 2.0
I_case = 0.5 * M_case * R**2
a_case = (m2 - m1) * g / (m1 + m2 + I_case / R**2)
print(f"M_pulley = {M_case} kg:  I = {I_case:.4f} kg·m²,  I/R² = {I_case/R**2:.2f} kg (effective translational mass)")
print(f"a = {a_case:.3f} m/s²  (vs {a_no_pulley:.3f} m/s² with massless pulley)")`,
          prose: [
            'The Atwood machine result shows how to convert pulley rotational inertia into an equivalent translational mass: I/R² = (½MR²)/R² = M/2. This effective mass sits in the denominator with m₁ + m₂, increasing total inertia and reducing acceleration.',
            'The plot reveals a key pattern: as pulley mass grows, acceleration asymptotes toward zero — a very heavy pulley barely moves even with a large mass imbalance, because most of the driving force goes into spinning the pulley.',
            'This is the general principle: every rotating component in a system adds I/R² to the effective translational mass. A drivetrain with many spinning parts (engine, gearbox, wheels) has significantly more inertia than just the vehicle mass alone.',
          ],
        },
        {
          cellTitle: 'Challenge: rolling race simulator',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

g = 9.8
h = 2.0  # ramp height (m)

# Define four rolling objects with their β = I/(mR²) values
shapes = {
    'Hollow cylinder': 1.0,   # β = 1
    'Solid disk':      0.5,   # β = 0.5
    'Hollow sphere':   2/3,   # β = 2/3
    'Solid sphere':    2/5,   # β = 2/5
}

# TODO: For each shape:
# 1. Compute speed at bottom: v = sqrt(2*g*h / (1 + beta))
# 2. Compute time to reach bottom on ramp length L = h/sin(30°) = 2h
# 3. Print a race leaderboard: rank by arrival time

# Hint: acceleration for rolling on incline angle θ:
# a = g*sin(θ) / (1 + beta)
# Use: time = sqrt(2L/a)  (from kinematics starting from rest)

theta = np.radians(30)  # 30° ramp
L = h / np.sin(theta)   # ramp length
`,
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      title: 'Rotational Dynamics in MATLAB/Octave',
      cells: [
        {
          cellTitle: 'τ = Iα: solid vs hollow disk',
          type: 'code',
          language: 'matlab',
          code: `% Same torque on solid disk (I = ½MR²) vs hollow cylinder (I = MR²)
M = 2.0;   % kg
R = 0.1;   % m
tau = 1.0; % N·m

I_solid  = 0.5 * M * R^2;   % solid disk
I_hollow = M * R^2;          % hollow cylinder

alpha_solid  = tau / I_solid;    % α = τ/I
alpha_hollow = tau / I_hollow;

t = linspace(0, 5, 200);
omega_solid  = alpha_solid  * t;  % ω = αt from rest
omega_hollow = alpha_hollow * t;

figure;
plot(t, omega_solid,  'b-',  'LineWidth', 2, 'DisplayName', ...
     sprintf('Solid disk (α = %.1f rad/s²)', alpha_solid));
hold on;
plot(t, omega_hollow, 'r--', 'LineWidth', 2, 'DisplayName', ...
     sprintf('Hollow cyl (α = %.1f rad/s²)', alpha_hollow));
xlabel('Time (s)'); ylabel('Angular velocity (rad/s)');
title('\tau = I\alpha: Same torque, different I');
legend; grid on;

fprintf('Solid disk:    I = %.4f kg·m²,  alpha = %.1f rad/s²\\n', I_solid, alpha_solid);
fprintf('Hollow cylinder: I = %.4f kg·m², alpha = %.1f rad/s²\\n', I_hollow, alpha_hollow);`,
          prose: [
            'I_solid = ½MR² and I_hollow = MR² are entered directly — MATLAB uses ^ for exponentiation. The factor of ½ in the solid disk formula comes from integrating r² dm over a disk where mass density falls toward the center.',
            'alpha = tau / I_solid applies τ = Iα: equal torque on smaller I gives larger angular acceleration. The hollow cylinder needs twice the time to reach any given ω.',
            'The plot shows the same linear divergence as the Python version — MATLAB uses hold on to overlay two plots on the same axes, with DisplayName for the legend entries.',
          ],
        },
        {
          cellTitle: 'Rolling energy fractions by shape',
          type: 'code',
          language: 'matlab',
          code: `% Energy partition for rolling objects: β = I/(mR²)
betas  = [1.0, 0.5, 2/3, 2/5];          % hollow cyl, solid disk, hollow sphere, solid sphere
labels = {'Hollow cyl', 'Solid disk', 'Hollow sph', 'Solid sph'};

rot_frac   = betas ./ (1 + betas);       % rotational fraction
trans_frac = 1 ./ (1 + betas);          % translational fraction

figure;
bar([trans_frac; rot_frac]', 'stacked');
set(gca, 'XTickLabel', labels);
ylabel('Fraction of total KE');
title('Rolling energy split: mgh = KE_{trans} + KE_{rot}');
legend('Translational', 'Rotational');
grid on; ylim([0 1.1]);

% Speed at bottom of h = 1 m ramp
h = 1.0; g = 9.8;
fprintf('Speed at bottom of h=1m ramp:\\n');
shape_names = {'Hollow cylinder', 'Solid disk', 'Hollow sphere', 'Solid sphere'};
for i = 1:length(betas)
    v = sqrt(2*g*h / (1 + betas(i)));
    fprintf('  %s: v = %.3f m/s\\n', shape_names{i}, v);
end`,
          prose: [
            'MATLAB element-wise division ./ and addition work on vectors simultaneously: rot_frac = betas ./ (1 + betas) computes all four fractions at once. This is MATLAB\'s vectorized syntax — no explicit loop needed.',
            'The stacked bar chart uses bar(..., "stacked") with a matrix where each column is one shape and each row is one energy type. The blue region represents useful translational KE; the salmon region is rotational KE that reduces speed.',
            'Comparing the fprintf output to the h=1m results: the solid sphere (β = 2/5) is fastest at 3.74 m/s, while the hollow cylinder (β = 1) is slowest at 3.13 m/s — same as the Python calculation, confirming the formula v = √(2gh/(1+β)).',
          ],
        },
        {
          cellTitle: 'Atwood machine: pulley inertia effect',
          type: 'code',
          language: 'matlab',
          code: `% Atwood machine with solid disk pulley
g = 9.8;
m1 = 3.0;  % kg
m2 = 5.0;  % kg
R  = 0.1;  % m

M_vals = linspace(0, 10, 200);    % vary pulley mass
a_vals = (m2 - m1) * g ./ (m1 + m2 + M_vals / 2);
% M/2 because I/R² = (½MR²)/R² = M/2 for solid disk

a_massless = (m2 - m1) * g / (m1 + m2);  % no pulley inertia

figure;
plot(M_vals, a_vals, 'b-', 'LineWidth', 2, 'DisplayName', 'With pulley inertia');
hold on;
yline(a_massless, 'r--', 'LineWidth', 1.5, 'DisplayName', sprintf('Massless: a=%.2f m/s²', a_massless));
xlabel('Pulley mass M (kg)');
ylabel('Acceleration (m/s²)');
title('Atwood machine: pulley inertia reduces acceleration');
legend; grid on;

% Specific case
M_case = 2.0;
I_case = 0.5 * M_case * R^2;
a_case = (m2 - m1) * g / (m1 + m2 + I_case / R^2);
fprintf('M=%.1f kg: I = %.4f kg·m², effective translational mass = %.2f kg\\n', M_case, I_case, I_case/R^2);
fprintf('a = %.3f m/s² (vs massless: %.3f m/s²)\\n', a_case, a_massless);`,
          prose: [
            'M_vals / 2 converts pulley mass to equivalent translational mass I/R² = M/2 for a solid disk. The element-wise division ./ applies this to all 200 mass values at once, computing the full deceleration curve efficiently.',
            'yline plots a horizontal reference line at a_massless — MATLAB\'s equivalent of axhline in matplotlib. This makes it easy to see how much the pulley reduces acceleration for any given pulley mass.',
            'The output confirms: with M = 2 kg, I/R² = 1 kg is the rotational equivalent mass. The system behaves as if 1 extra kg was added to each side, reducing acceleration from 2.45 to 2.18 m/s².',
          ],
        },
        {
          cellTitle: 'Challenge: rolling race leaderboard',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% Rolling race: find arrival time for each shape on a 30° ramp
g = 9.8;
h = 2.0;           % ramp height
theta = pi/6;      % 30 degrees
L = h / sin(theta); % ramp length

betas  = [1.0, 0.5, 2/3, 2/5];
labels = {'Hollow cylinder', 'Solid disk', 'Hollow sphere', 'Solid sphere'};

% TODO:
% 1. For each shape, compute acceleration: a = g*sin(theta) / (1 + beta)
% 2. Compute time to travel distance L from rest: t = sqrt(2*L/a)
% 3. Compute speed at bottom: v = sqrt(2*g*h / (1 + beta))
% 4. Sort by arrival time and print a leaderboard
`,
        },
      ],
    },
  },
};

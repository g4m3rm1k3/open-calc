export default {
  id: 'p1-ch6-001',
  slug: 'momentum-definition',
  chapter: 'p6',
  order: 1,
  title: 'Momentum: Mass in Motion',
  subtitle: 'Not just how fast — but how much mass is moving, and where.',
  tags: ['momentum', 'p = mv', 'vector', 'Newton\'s second law', 'linear momentum', 'inertia in motion'],

  hook: {
    question:
      'A 5 kg bowling ball rolls at 3 m/s. A 0.05 kg tennis ball flies at 60 m/s. Both have the same kinetic energy (check: ½(5)(9) = 22.5 J; ½(0.05)(3600) = 90 J — actually they don\'t). Revised question: the bowling ball and tennis ball both hit you. Which is harder to stop? What quantity captures "difficulty to stop" better than speed alone?',
    realWorldContext:
      'Momentum is what makes collisions dangerous. A truck at 5 m/s has far more momentum than a bicycle at 5 m/s — the truck is almost impossible to stop quickly, while the bicycle can brake in meters. Air bags, crumple zones, and safety padding all work by extending the time of collision (increasing \\(\\Delta t\\)) to reduce the force — a direct consequence of the impulse-momentum theorem.',
    previewVisualizationId: 'VectorKinematicsLab',
  },

  intuition: {
    prose: [
      '**The answer:** The bowling ball. Even though the tennis ball is faster, the bowling ball has more mass. To stop something, you need to change its velocity — but a massive object resists change more stubbornly. The quantity that captures this "inertia in motion" is **momentum**: \\(\\vec{p} = m\\vec{v}\\).',

      '**Momentum is a vector:** This is crucial. Two cars at the same speed but opposite directions have momenta that add to zero — not 2mv. Two cars moving in the same direction add: total momentum = sum of individual momenta. Direction is encoded by sign in 1D, and by components in 2D/3D.',

      '**Newton\'s Second Law is really about momentum:** Newton didn\'t write \\(F = ma\\). He wrote \\(F = dp/dt\\) — force is the rate of change of momentum. For constant mass, \\(dp/dt = m(dv/dt) = ma\\), so \\(F = ma\\) is a special case. The more fundamental form handles variable-mass systems (rockets, falling chains) and explains how collision forces work.',

      '**Why momentum is conserved in collisions:** When two objects collide, the force one exerts on the other (Newton\'s Third Law) is equal and opposite. So \\(dp_1/dt = -dp_2/dt\\), meaning \\(d(p_1 + p_2)/dt = 0\\) — total momentum is constant. This holds whether the collision is gentle or violent, elastic or inelastic. It is one of the most powerful conservation laws in physics.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 3 — Chapter 6: Momentum',
        body:
          '**Chapter 5 (Energy):** KE = ½mv² — a scalar. Work = force × distance. Conserved only for conservative forces.\n**This chapter (Momentum):** p = mv — a vector. Conserved whenever net external force = 0. Handles impacts and collisions naturally.\n**This lesson:** What momentum is, how it connects to Newton\'s 2nd Law, and why it is conserved.\n**Next:** Impulse — the mechanism by which forces change momentum over time.',
      },
      {
        type: 'definition',
        title: 'Linear momentum',
        body: '\\vec{p} = m\\vec{v} \\qquad [\\text{SI: kg·m/s}]',
      },
      {
        type: 'theorem',
        title: 'Newton\'s Second Law (momentum form)',
        body: '\\vec{F}_{\\text{net}} = \\frac{d\\vec{p}}{dt} \\quad \\text{(general)} \\qquad = m\\vec{a} \\quad \\text{(constant mass)}',
      },
      {
        type: 'theorem',
        title: 'Conservation of momentum',
        body:
          '\\text{If } \\vec{F}_{\\text{net, external}} = 0: \\quad \\vec{p}_{\\text{total}} = \\text{constant}\\\\\\vec{p}_{1,i} + \\vec{p}_{2,i} = \\vec{p}_{1,f} + \\vec{p}_{2,f}',
      },
      {
        type: 'warning',
        title: 'Momentum vs kinetic energy: different quantities',
        body:
          'Both involve mass and velocity, but they behave differently. Momentum is a vector (direction matters); KE is a scalar. Momentum is always conserved in a closed system; KE is conserved only in elastic collisions. Never mix up conservation of momentum with conservation of energy — they apply to different situations.',
      },
      {
        type: 'connection',
        title: 'Calculus connection: F = dp/dt is the derivative definition',
        body:
          '\\(\\vec{F} = \\dfrac{d\\vec{p}}{dt}\\). For constant mass, \\(\\dfrac{d(m\\vec{v})}{dt} = m\\dfrac{d\\vec{v}}{dt} = m\\vec{a}\\). For variable mass (rocket): \\(F = \\dot{m}v + m\\dot{v}\\) — the product rule applied to momentum.',
      },
    ],
    visualizations: [
      {
        id: 'VectorKinematicsLab',
        title: 'Momentum is a vector — direction matters',
        mathBridge:
          'Set two objects with the same speed but different masses. Watch how momentum differs. Then reverse one velocity: momentum adds as vectors, not magnitudes.',
        caption: 'Same speed ≠ same momentum. Momentum encodes mass × direction of motion.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'momentum-vector' },
        title: 'p = mv as an arrow',
        caption:
          'Arrow length = |p| = mv. Arrow direction = direction of motion. Doubling mass doubles the arrow. Doubling speed doubles it again. Reversing velocity reverses the arrow — momentum flips sign.',
      },
    ],
  },

  math: {
    prose: [
      'Momentum: \\(\\vec{p} = m\\vec{v}\\). In 2D: \\(p_x = mv_x\\), \\(p_y = mv_y\\).',
      'Magnitude: \\(|\\vec{p}| = mv\\) (speed, not velocity). Direction: same as velocity.',
      'From the Work-Energy Theorem, KE = ½mv² = p²/(2m). Two objects with the same momentum can have different kinetic energies if they have different masses.',
      '**System momentum:** For a system of N particles: \\(\\vec{P}_{\\text{total}} = \\sum_i m_i\\vec{v}_i\\).',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'KE vs momentum: which is larger for equal masses?',
        body:
          'Equal mass \\(m\\), different speeds \\(v_1 < v_2\\):\\\\\\(p_1/p_2 = v_1/v_2\\) (momentum ratio = speed ratio).\\\\\\(KE_1/KE_2 = v_1^2/v_2^2\\) (energy ratio = speed ratio squared).\\\\Energy is more sensitive to speed. A 2× speed increase doubles momentum but quadruples KE.',
      },
      {
        type: 'theorem',
        title: 'Relating KE and momentum',
        body: 'KE = \\frac{p^2}{2m} \\qquad \\text{or equivalently} \\qquad p = \\sqrt{2m \\cdot KE}',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'momentum-conservation-diagram' },
        title: 'Conservation of momentum in an isolated system',
        caption:
          'Before collision: two arrows (p₁ and p₂). After: two different arrows. The vector sum is identical before and after — that is conservation.',
      },
    ],
  },

  rigor: {
    title: 'Deriving conservation of momentum from Newton\'s Third Law',
    proofSteps: [
      {
        expression: '\\vec{F}_{12} = -\\vec{F}_{21} \\quad (\\text{Newton\'s Third Law})',
        annotation: 'Force of object 1 on object 2 equals and opposes force of object 2 on object 1.',
      },
      {
        expression: '\\vec{F}_{12} = \\frac{d\\vec{p}_2}{dt}, \\quad \\vec{F}_{21} = \\frac{d\\vec{p}_1}{dt}',
        annotation: 'Newton\'s Second Law for each object.',
      },
      {
        expression: '\\frac{d\\vec{p}_1}{dt} + \\frac{d\\vec{p}_2}{dt} = \\vec{F}_{21} + \\vec{F}_{12} = 0',
        annotation: 'Add the two equations. The forces cancel by Newton\'s Third Law.',
      },
      {
        expression: '\\frac{d}{dt}(\\vec{p}_1 + \\vec{p}_2) = 0',
        annotation: 'The derivative of total momentum is zero.',
      },
      {
        expression: '\\therefore\\; \\vec{p}_1 + \\vec{p}_2 = \\text{constant}',
        annotation: 'Total momentum is conserved. QED — derived purely from Newton\'s Laws.',
      },
    ],
  },

  examples: [
    {
      id: 'ch6-001-ex1',
      title: 'Comparing momenta',
      problem:
        '\\text{Find momentum of: (a) 80 kg sprinter at 10 m/s, (b) 0.145 kg baseball at 40 m/s, (c) 60,000 kg train at 0.5 m/s.}',
      steps: [
        { expression: 'p_a = 80 \\times 10 = 800\\,\\text{kg·m/s}', annotation: 'Sprinter.' },
        { expression: 'p_b = 0.145 \\times 40 = 5.8\\,\\text{kg·m/s}', annotation: 'Baseball — fast but light.' },
        { expression: 'p_c = 60000 \\times 0.5 = 30{,}000\\,\\text{kg·m/s}', annotation: 'Train — slow but massive. 37× the sprinter\'s momentum.' },
      ],
      conclusion: 'The train at walking pace has 37× the momentum of a sprinting athlete. Mass dominates.',
    },
    {
      id: 'ch6-001-ex2',
      title: '2D collision — conservation in two components',
      problem:
        '\\text{A 3 kg ball at (4, 0) m/s collides with a stationary 2 kg ball. After: 3 kg ball moves at (2, 1) m/s. Find the 2 kg ball\'s velocity.}',
      steps: [
        {
          expression: 'p_{x,i} = 3(4) + 2(0) = 12 \\quad p_{x,f} = 3(2) + 2v_{2x} \\Rightarrow v_{2x} = 3\\,\\text{m/s}',
          annotation: 'x-component momentum conservation.',
        },
        {
          expression: 'p_{y,i} = 0 \\quad p_{y,f} = 3(1) + 2v_{2y} \\Rightarrow v_{2y} = -1.5\\,\\text{m/s}',
          annotation: 'y-component: y-momentum was zero before, so 2 kg ball must go negative-y.',
        },
        {
          expression: '\\vec{v}_2 = (3\\hat{i} - 1.5\\hat{j})\\,\\text{m/s}',
          annotation: '2D momentum conservation requires two separate equations.',
        },
      ],
      conclusion: 'After collision: 2 kg ball moves at (3, −1.5) m/s. Momentum is conserved in each direction independently.',
    },
  ],

  challenges: [
    {
      id: 'ch6-001-ch1',
      difficulty: 'easy',
      problem: '\\text{A 2 kg object moves at 5 m/s east. Find its momentum.}',
      hint: 'p = mv, include direction.',
      walkthrough: [
        { expression: 'p = 2 \\times 5 = 10\\,\\text{kg·m/s east}', annotation: 'Direction included.' },
      ],
      answer: 'p = 10 kg·m/s east.',
    },
    {
      id: 'ch6-001-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A 1500 kg car moves north at 20 m/s and a 1000 kg car moves south at 15 m/s. Find the total momentum of the system (define north as positive).}',
      hint: 'South = negative direction. Add momenta as signed numbers.',
      walkthrough: [
        { expression: 'p_{\\text{total}} = (1500)(20) + (1000)(-15) = 30000 - 15000 = 15000\\,\\text{kg·m/s north}', annotation: 'Vector addition.' },
      ],
      answer: 'p_total = 15,000 kg·m/s north.',
    },
    {
      id: 'ch6-001-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A 0.1 kg bullet at 400 m/s embeds in a 4.9 kg stationary block (inelastic collision). Find the block+bullet speed. Then calculate the kinetic energy before and after — what fraction is lost?}',
      hint: 'Conservation of momentum for velocity. Then compare KE before and after.',
      walkthrough: [
        {
          expression: '(0.1)(400) + 0 = (0.1 + 4.9)v_f \\Rightarrow v_f = 40/5 = 8\\,\\text{m/s}',
          annotation: 'Momentum conservation.',
        },
        {
          expression: 'KE_i = \\tfrac{1}{2}(0.1)(400)^2 = 8000\\,\\text{J}',
          annotation: 'Initial KE (bullet only).',
        },
        {
          expression: 'KE_f = \\tfrac{1}{2}(5)(64) = 160\\,\\text{J}',
          annotation: 'Final KE (block+bullet).',
        },
        {
          expression: '\\text{Fraction lost} = \\frac{8000-160}{8000} = 98\\%',
          annotation: '98% of kinetic energy is lost — converted to heat, sound, and deformation.',
        },
      ],
      answer: 'v_f = 8 m/s; 98% of initial KE is lost to inelastic deformation.',
    },
  ],
}

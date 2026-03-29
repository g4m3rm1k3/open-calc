export default {
  id: 'p1-ch5-003',
  slug: 'potential-energy',
  chapter: 'p5',
  order: 3,
  title: 'Potential Energy: Stored Work',
  subtitle: 'Gravitational and elastic energy are work done against a force, stored and ready to be released.',
  tags: ['potential energy', 'gravitational PE', 'elastic PE', 'conservative force', 'mgh', 'spring energy'],

  hook: {
    question:
      'A 1 kg ball is thrown upward at 10 m/s and rises 5 m before stopping. ' +
      'At the top, it has zero kinetic energy. The kinetic energy isn\'t gone — it went somewhere. Where did it go? ' +
      'And what determines whether it can come back?',
    realWorldContext:
      'Potential energy is the physics of stored capability. ' +
      'A stretched bowstring, a raised counterweight, a compressed spring, a charged battery — ' +
      'all store energy that was once work done against a force, waiting to be released. ' +
      'Hydroelectric dams convert gravitational PE of water into electrical energy. ' +
      'Springs in watches convert elastic PE into kinetic energy of gears. ' +
      'The concept of potential energy is what allows us to predict motion without tracking every instant of force application.',
    previewVisualizationId: 'WaterTank',
  },

  intuition: {
    prose: [
      '**The answer:** The kinetic energy went into gravitational potential energy — stored in the height of the ball relative to the ground. ' +
        'When the ball falls back down, that stored energy converts back into kinetic energy. ' +
        'The energy is not destroyed; it changes form. This exchange is only possible because gravity is a *conservative force*.',

      '**What makes a force conservative?** A force is conservative if the work it does depends only on the start and end positions, not on the path taken. ' +
        'Gravity is conservative: carry a 1 kg book up a straight staircase or along a winding ramp — gravity does the same work either way (−mgh). ' +
        'Friction is NOT conservative: a longer path means more friction work, so path matters.',

      '**Potential energy is defined only for conservative forces** — precisely because those are the forces for which work can be "stored" and perfectly recovered. ' +
        'Friction converts mechanical energy to heat (irreversible). ' +
        'Gravity converts KE to PE and back (reversible). ' +
        'The potential energy function is defined so that work done by the force = −ΔPE.',

      '**Springs:** A stretched or compressed spring stores elastic PE. The work you do against the spring becomes stored energy, ready to launch an object. ' +
        'The formula \\(PE_{\\text{spring}} = \\tfrac{1}{2}kx^2\\) is not coincidental — it is exactly the area under Hooke\'s Law: \\(\\int_0^x kx\\,dx = \\tfrac{1}{2}kx^2\\).',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 6 — Where does work go when motion stops?',
        body:
          '**Lesson 2 established:** Net work = ΔKE. When net work is positive, the object speeds up.\n' +
          '**The gap:** What about work done against gravity while rising? The object slows — so ΔKE is negative. But the energy must go *somewhere*.\n' +
          '**This lesson:** That energy goes into potential energy — the stored capacity to do work later.\n' +
          '**Next lesson:** Conservation of Energy — KE + PE = constant for systems with only conservative forces.',
      },
      {
        type: 'definition',
        title: 'Conservative force',
        body:
          'A force is conservative if the work it does between two points is path-independent. ' +
          'Equivalently: the work done by the force around any closed loop is zero. ' +
          'Examples: gravity, spring force, electrostatic force. Counter-examples: friction, air resistance.',
      },
      {
        type: 'theorem',
        title: 'Gravitational PE (near Earth\'s surface)',
        body: 'PE_g = mgh \\qquad \\text{where } h = \\text{height above reference level}',
      },
      {
        type: 'theorem',
        title: 'Elastic PE (spring)',
        body: 'PE_s = \\tfrac{1}{2}kx^2 \\qquad \\text{where } x = \\text{displacement from natural length}',
      },
      {
        type: 'warning',
        title: 'PE is relative to a chosen reference level',
        body:
          'Only changes in PE have physical meaning. You can set h = 0 anywhere convenient. ' +
          'A ball on a table has different PE depending on whether you measure from the table surface or the floor — ' +
          'but the change in PE between any two points is always the same.',
      },
      {
        type: 'connection',
        title: 'Calculus connection: W = −ΔPE',
        body:
          'For a conservative force \\(F(x)\\), potential energy is defined as: ' +
          '\\(PE(x) = -\\int_{x_0}^x F(x\')\\,dx\'\\), so \\(F = -\\dfrac{dPE}{dx}\\). ' +
          'Force is the negative gradient of potential energy. This is why PE curves "slope toward" equilibrium.',
      },
    ],
    visualizations: [
      {
        id: 'WaterTank',
        title: 'Height = stored potential energy',
        mathBridge:
          'Raise the water level — gravitational PE increases. Release it — PE converts to kinetic energy of the flow. ' +
          'The PE stored is mgh: mass × gravity × height above the outlet.',
        caption: 'Every metre of added height adds mgh joules of potential energy to the water.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'pe-ke-exchange' },
        title: 'Energy exchange: KE ↔ PE on a roller coaster',
        caption:
          'At the top of a hill: maximum height → maximum PE, minimum speed → minimum KE. ' +
          'At the bottom: maximum speed → maximum KE, minimum height → minimum PE. ' +
          'Total energy KE + PE stays constant (ignoring friction). The exchange is exact.',
      },
    ],
  },

  math: {
    prose: [
      'For an object of mass \\(m\\) at height \\(h\\) above a reference level, gravitational PE is \\(mgh\\).',
      'For a spring with constant \\(k\\) displaced \\(x\\) from equilibrium, elastic PE is \\(\\tfrac{1}{2}kx^2\\).',
      'The fundamental relationship connecting PE to the work done by the conservative force:',
      '\\(W_{\\text{conservative}} = -\\Delta PE\\)',
      'When gravity does positive work (object falls), PE decreases. When you do work against gravity (object rises), PE increases.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Work-PE relation',
        body: 'W_{\\text{conservative}} = -\\Delta PE = PE_i - PE_f',
      },
      {
        type: 'insight',
        title: 'Force from PE: F = −dPE/dx',
        body:
          'Gravity: \\(PE = mgh\\), so \\(F = -d(mgh)/dh = -mg\\) (downward, as expected). ' +
          'Spring: \\(PE = \\tfrac{1}{2}kx^2\\), so \\(F = -d(\\tfrac{1}{2}kx^2)/dx = -kx\\) (Hooke\'s Law!). ' +
          'Potential energy encodes the force — differentiate to recover it.',
      },
      {
        type: 'mnemonic',
        title: 'Reference level: choose for convenience',
        body:
          'For a falling object, set \\(h=0\\) at the lowest point. ' +
          'For a spring problem, set \\(x=0\\) at the natural length. ' +
          'Only \\(\\Delta PE\\) matters — the constant cancels.',
      },
    ],
    visualizations: [
      {
        id: 'SpringOscillation',
        title: 'Spring PE ↔ KE exchange in real time',
        mathBridge:
          'Watch the energy bar: at maximum compression/extension, all energy is elastic PE (KE = 0). ' +
          'At the equilibrium point, all energy is KE (PE = 0). The total bar never changes.',
        caption: 'Energy sloshes between KE and PE in perfect exchange — total stays constant.',
        props: { showEnergyBars: true },
      },
    ],
  },

  rigor: {
    title: 'Deriving elastic PE from Hooke\'s Law via integration',
    prose: [
      'The spring PE formula is not memorized — it is derived as the area under the F-x graph.',
    ],
    proofSteps: [
      {
        expression: 'F_{\\text{spring}} = -kx \\quad (\\text{Hooke\'s Law: restoring force})',
        annotation: 'The spring pushes back opposite to displacement. To stretch it, we apply force +kx.',
      },
      {
        expression: 'W_{\\text{applied}} = \\int_0^x kx\'\\,dx\'',
        annotation: 'Work done TO stretch the spring from 0 to x against the restoring force.',
      },
      {
        expression: 'W_{\\text{applied}} = k\\left[\\tfrac{x\'^2}{2}\\right]_0^x = \\tfrac{1}{2}kx^2',
        annotation: 'The area under the triangular F-x graph. This work is stored as elastic PE.',
      },
      {
        expression: 'PE_s = \\tfrac{1}{2}kx^2',
        annotation: 'The stored elastic potential energy equals the work done to displace the spring by x. QED.',
      },
    ],
  },

  examples: [
    {
      id: 'ch5-003-ex1',
      title: 'Ball thrown upward — energy analysis',
      problem:
        '\\text{A 0.5 kg ball is thrown upward at 14 m/s. Using energy methods, find the maximum height.}',
      steps: [
        {
          expression: 'KE_i = \\tfrac{1}{2}(0.5)(14)^2 = 49\\,\\text{J}',
          annotation: 'Initial kinetic energy at launch.',
        },
        {
          expression: 'PE_{\\text{top}} = mgh_{\\text{max}}',
          annotation: 'At maximum height, all KE has converted to PE (speed = 0 at peak).',
        },
        {
          expression: '49 = (0.5)(9.8)h_{\\text{max}} \\Rightarrow h_{\\text{max}} = \\frac{49}{4.9} = 10\\,\\text{m}',
          annotation: 'Set KE = PE at maximum height and solve.',
        },
      ],
      conclusion: 'Maximum height = 10 m. No kinematics equations needed — energy gives the answer directly.',
    },
    {
      id: 'ch5-003-ex2',
      title: 'Spring launcher — finding launch speed',
      problem:
        '\\text{A spring (k = 800 N/m) is compressed 0.15 m and launches a 0.2 kg ball horizontally. ' +
        'Find the ball\'s speed after leaving the spring.}',
      steps: [
        {
          expression: 'PE_s = \\tfrac{1}{2}(800)(0.15)^2 = \\tfrac{1}{2}(800)(0.0225) = 9\\,\\text{J}',
          annotation: 'Elastic PE stored in the compressed spring.',
        },
        {
          expression: '9 = \\tfrac{1}{2}(0.2)v^2 \\Rightarrow v^2 = 90',
          annotation: 'All spring PE converts to ball\'s KE (ignoring friction and vertical motion).',
        },
        {
          expression: 'v = \\sqrt{90} \\approx 9.49\\,\\text{m/s}',
          annotation: 'Launch speed.',
        },
      ],
      conclusion: 'Launch speed ≈ 9.5 m/s. The spring\'s stored energy completely transfers to kinetic energy.',
    },
  ],

  challenges: [
    {
      id: 'ch5-003-ch1',
      difficulty: 'easy',
      problem: '\\text{Find the gravitational PE of a 3 kg book on a shelf 1.2 m above the floor. Take g = 9.8 m/s².}',
      hint: 'PE = mgh.',
      walkthrough: [
        { expression: 'PE = (3)(9.8)(1.2) = 35.3\\,\\text{J}', annotation: 'Relative to floor level.' },
      ],
      answer: 'PE = 35.3 J.',
    },
    {
      id: 'ch5-003-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A 0.3 kg object slides down a frictionless ramp from height 2 m, ' +
        'then compresses a spring (k = 600 N/m) at the bottom. Find maximum compression.}',
      hint: 'All gravitational PE converts to elastic PE at maximum compression.',
      walkthrough: [
        {
          expression: 'mgh = \\tfrac{1}{2}kx^2',
          annotation: 'Set gravitational PE equal to elastic PE at maximum compression.',
        },
        {
          expression: '(0.3)(9.8)(2) = \\tfrac{1}{2}(600)x^2 \\Rightarrow x^2 = \\frac{5.88}{300} = 0.0196',
          annotation: 'Solve for compression x.',
        },
        {
          expression: 'x = 0.14\\,\\text{m}',
          annotation: 'Maximum compression = 14 cm.',
        },
      ],
      answer: 'Maximum compression x = 0.14 m.',
    },
    {
      id: 'ch5-003-ch3',
      difficulty: 'hard',
      problem:
        '\\text{Verify that } F = -kx \\text{ is recoverable from } PE_s = \\tfrac{1}{2}kx^2 \\text{ using } F = -dPE/dx. ' +
        '\\text{Then show that gravity } F = -mg \\text{ is recoverable from } PE_g = mgy \\text{ where y is height.}',
      hint: 'Differentiate each PE function with respect to the displacement variable, then negate.',
      walkthrough: [
        {
          expression: 'F_s = -\\frac{d}{dx}\\left(\\tfrac{1}{2}kx^2\\right) = -kx',
          annotation: 'Hooke\'s Law recovered from elastic PE. The negative sign means the force restores toward zero.',
        },
        {
          expression: 'F_g = -\\frac{d}{dy}(mgy) = -mg',
          annotation: 'Gravity recovered from gravitational PE. Negative sign means force points downward (−y direction).',
        },
      ],
      answer: 'F = −dPE/dx recovers both Hooke\'s Law and gravity exactly. Force is the negative gradient of potential energy.',
    },
  ],
}

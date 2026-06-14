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
      'A 1 kg ball is thrown upward at 10 m/s and rises 5 m before stopping. At the top, it has zero kinetic energy. The kinetic energy isn\'t gone — it went somewhere. Where did it go? And what determines whether it can come back?',
    realWorldContext:
      'Potential energy is the physics of stored capability. A stretched bowstring, a raised counterweight, a compressed spring, a charged battery — all store energy that was once work done against a force, waiting to be released. Hydroelectric dams convert gravitational PE of water into electrical energy. Springs in watches convert elastic PE into kinetic energy of gears. The concept of potential energy is what allows us to predict motion without tracking every instant of force application.',
    previewVisualizationId: 'WaterTank',
  },

  intuition: {
    prose: [
      '**The answer:** The kinetic energy went into gravitational potential energy — stored in the height of the ball relative to the ground. When the ball falls back down, that stored energy converts back into kinetic energy. The energy is not destroyed; it changes form. This exchange is only possible because gravity is a *conservative force*.',

      '**What makes a force conservative?** A force is conservative if the work it does depends only on the start and end positions, not on the path taken. Gravity is conservative: carry a 1 kg book up a straight staircase or along a winding ramp — gravity does the same work either way (−mgh). Friction is NOT conservative: a longer path means more friction work, so path matters.',

      '**Potential energy is defined only for conservative forces** — precisely because those are the forces for which work can be "stored" and perfectly recovered. Friction converts mechanical energy to heat (irreversible). Gravity converts KE to PE and back (reversible). The potential energy function is defined so that work done by the force = −ΔPE.',

      '**Springs:** A stretched or compressed spring stores elastic PE. The work you do against the spring becomes stored energy, ready to launch an object. The formula \\(PE_{\\text{spring}} = \\tfrac{1}{2}kx^2\\) is not coincidental — it is exactly the area under Hooke\'s Law: \\(\\int_0^x kx\\,dx = \\tfrac{1}{2}kx^2\\).',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 6 — Where does work go when motion stops?',
        body:
          '**Lesson 2 established:** Net work = ΔKE. When net work is positive, the object speeds up.\n**The gap:** What about work done against gravity while rising? The object slows — so ΔKE is negative. But the energy must go *somewhere*.\n**This lesson:** That energy goes into potential energy — the stored capacity to do work later.\n**Next lesson:** Conservation of Energy — KE + PE = constant for systems with only conservative forces.',
      },
      {
        type: 'definition',
        title: 'Conservative force',
        body:
          'A force is conservative if the work it does between two points is path-independent. Equivalently: the work done by the force around any closed loop is zero. Examples: gravity, spring force, electrostatic force. Counter-examples: friction, air resistance.',
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
          'Only changes in PE have physical meaning. You can set h = 0 anywhere convenient. A ball on a table has different PE depending on whether you measure from the table surface or the floor — but the change in PE between any two points is always the same.',
      },
      {
        type: 'connection',
        title: 'Calculus connection: W = −ΔPE',
        body:
          'For a conservative force \\(F(x)\\), potential energy is defined as: \\(PE(x) = -\\int_{x_0}^x F(x\')\\,dx\'\\), so \\(F = -\\dfrac{dPE}{dx}\\). Force is the negative gradient of potential energy. This is why PE curves "slope toward" equilibrium.',
      },
    ],
    visualizations: [
      {
        id: 'WaterTank',
        title: 'Height = stored potential energy',
        mathBridge:
          'Raise the water level — gravitational PE increases. Release it — PE converts to kinetic energy of the flow. The PE stored is mgh: mass × gravity × height above the outlet.',
        caption: 'Every metre of added height adds mgh joules of potential energy to the water.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'pe-ke-exchange' },
        title: 'Energy exchange: KE ↔ PE on a roller coaster',
        caption:
          'At the top of a hill: maximum height → maximum PE, minimum speed → minimum KE. At the bottom: maximum speed → maximum KE, minimum height → minimum PE. Total energy KE + PE stays constant (ignoring friction). The exchange is exact.',
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
          'Gravity: \\(PE = mgh\\), so \\(F = -d(mgh)/dh = -mg\\) (downward, as expected). Spring: \\(PE = \\tfrac{1}{2}kx^2\\), so \\(F = -d(\\tfrac{1}{2}kx^2)/dx = -kx\\) (Hooke\'s Law!). Potential energy encodes the force — differentiate to recover it.',
      },
      {
        type: 'mnemonic',
        title: 'Reference level: choose for convenience',
        body:
          'For a falling object, set \\(h=0\\) at the lowest point. For a spring problem, set \\(x=0\\) at the natural length. Only \\(\\Delta PE\\) matters — the constant cancels.',
      },
    ],
    visualizations: [
      {
        id: 'SpringOscillation',
        title: 'Spring PE ↔ KE exchange in real time',
        mathBridge:
          'Watch the energy bar: at maximum compression/extension, all energy is elastic PE (KE = 0). At the equilibrium point, all energy is KE (PE = 0). The total bar never changes.',
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
        '\\text{A spring (k = 800 N/m) is compressed 0.15 m and launches a 0.2 kg ball horizontally. Find the ball\'s speed after leaving the spring.}',
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
        '\\text{A 0.3 kg object slides down a frictionless ramp from height 2 m, then compresses a spring (k = 600 N/m) at the bottom. Find maximum compression.}',
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
        '\\text{Verify that } F = -kx \\text{ is recoverable from } PE_s = \\tfrac{1}{2}kx^2 \\text{ using } F = -dPE/dx. \\text{Then show that gravity } F = -mg \\text{ is recoverable from } PE_g = mgy \\text{ where y is height.}',
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

  quiz: [
    {
      id: 'p5-003-q1',
      type: 'input',
      text: 'A 3 kg book is lifted 2 m straight up. Calculate its change in gravitational PE in joules. (g = 9.8 m/s²)',
      answer: '58.8',
      hints: ['ΔPE_grav = mgh = 3 × 9.8 × 2.'],
      reviewSection: 'Math — gravitational PE formula',
    },
    {
      id: 'p5-003-q2',
      type: 'choice',
      text: 'A spring with k = 300 N/m is compressed 0.04 m. How much elastic PE is stored?',
      options: ['0.12 J', '0.24 J', '6 J', '12 J'],
      answer: '0.24 J',
      hints: ['PE_spring = ½kx² = ½ × 300 × (0.04)².'],
      reviewSection: 'Math — spring PE formula',
    },
    {
      id: 'p5-003-q3',
      type: 'choice',
      text: 'Gravitational PE is a conservative force because:',
      options: [
        'It always points downward',
        'The work it does depends only on start and end height, not the path taken',
        'It never does negative work',
        'It is constant everywhere',
      ],
      answer: 'The work it does depends only on start and end height, not the path taken',
      hints: ['Conservative = path-independent work. Carry a book up stairs or a ramp — gravity does the same work either way.'],
      reviewSection: 'Intuition — what makes a force conservative',
    },
    {
      id: 'p5-003-q4',
      type: 'choice',
      text: 'Which of these forces is NOT conservative?',
      options: ['Gravity', 'Spring force', 'Kinetic friction', 'Gravitational field in space'],
      answer: 'Kinetic friction',
      hints: ['Friction converts mechanical energy to heat — the work done depends on path length. Longer path → more friction work.'],
      reviewSection: 'Intuition — conservative vs non-conservative',
    },
    {
      id: 'p5-003-q5',
      type: 'input',
      text: 'A 0.5 kg object falls from 10 m to 4 m height. By how many joules did its gravitational PE change? (include sign; g = 9.8)',
      answer: '-29.4',
      hints: ['ΔPE = mgh_f − mgh_i = mg(4 − 10) = 0.5 × 9.8 × (−6).'],
      reviewSection: 'Math — ΔPE calculation',
    },
    {
      id: 'p5-003-q6',
      type: 'choice',
      text: 'The formula PE_spring = ½kx² is derived from:',
      options: [
        'Newton\'s Third Law',
        'Integrating the spring force F = kx over displacement: ∫kx dx = ½kx²',
        'The definition of power P = Fv',
        'The Pythagorean theorem',
      ],
      answer: 'Integrating the spring force F = kx over displacement: ∫kx dx = ½kx²',
      hints: ['W = ∫₀^x kx dx = ½kx². The PE stored equals the work done against the spring.'],
      reviewSection: 'Intuition — Springs: where ½kx² comes from',
    },
    {
      id: 'p5-003-q7',
      type: 'choice',
      text: 'The relationship between force and potential energy is F = −dPE/dx. What does the negative sign mean?',
      options: [
        'The force always opposes motion',
        'Forces point in the direction of decreasing PE — toward lower energy',
        'The force is always negative',
        'PE always decreases',
      ],
      answer: 'Forces point in the direction of decreasing PE — toward lower energy',
      hints: ['A ball rolls downhill — toward lower PE. Springs push toward their natural length — toward lower PE. The negative sign means: force acts to reduce PE.'],
      reviewSection: 'Math — force from PE gradient',
    },
    {
      id: 'p5-003-q8',
      type: 'input',
      text: 'A spring (k = 500 N/m) is at its natural length, then compressed to x = 0.06 m. How much elastic PE in joules is stored?',
      answer: '0.9',
      hints: ['PE = ½kx² = ½ × 500 × (0.06)² = 250 × 0.0036.'],
      reviewSection: 'Math — elastic PE',
    },
    {
      id: 'p5-003-q9',
      type: 'choice',
      text: 'A ball is thrown horizontally from a cliff. As it falls, its gravitational PE:',
      options: [
        'Increases',
        'Decreases',
        'Stays the same since it moves horizontally',
        'First increases then decreases',
      ],
      answer: 'Decreases',
      hints: ['PE_grav = mgh. The ball falls → h decreases → PE decreases. Horizontal motion does not affect gravitational PE.'],
      reviewSection: 'Math — gravitational PE depends on height only',
    },
    {
      id: 'p5-003-q10',
      type: 'choice',
      text: 'Why can\'t we define a potential energy function for kinetic friction?',
      options: [
        'Friction forces are too small',
        'Friction does path-dependent work — the total work depends on distance travelled, not just start and end',
        'Friction is not a real force',
        'Potential energy only works for vertical forces',
      ],
      answer: 'Friction does path-dependent work — the total work depends on distance travelled, not just start and end',
      hints: ['Conservative forces have path-independent work → PE can be defined. Friction work = μmgd — longer path means more work. No unique PE function exists.'],
      reviewSection: 'Intuition — conservative vs non-conservative forces',
    },
  ],

  misconceptions: [
    {
      id: 'p5-003-m1',
      misconception: 'An object at rest on the floor has zero PE, so it has no energy at all.',
      correction: 'Gravitational PE is relative — it depends on the chosen reference height. An object on the floor has PE = 0 relative to the floor, but PE > 0 relative to a basement below, and PE < 0 relative to a shelf above. Absolute PE is not physically meaningful; only changes in PE (ΔPE) matter.',
      correctionExample: 'A book on a table: choose table as reference → PE = 0. Choose floor as reference → PE = mgh_table > 0. Neither is "wrong." Only ΔPE when the book falls to the floor has a unique value: −mgh_table.',
    },
    {
      id: 'p5-003-m2',
      misconception: 'Compressing a spring twice as much stores twice the PE.',
      correction: 'PE_spring = ½kx². Doubling x quadruples PE (x² factor). This is the same v² relationship from kinetic energy — both arise from integrating a linear function.',
      correctionExample: 'k = 100 N/m. At x = 0.1 m: PE = ½(100)(0.01) = 0.5 J. At x = 0.2 m: PE = ½(100)(0.04) = 2 J. Doubling compression quadrupled the stored energy.',
    },
  ],

  transferPrompts: [
    {
      id: 'p5-003-tp1',
      prompt: 'A roller coaster designer wants the loop-the-loop to be safe: the car needs at least v_min at the top to maintain contact with the track. Using energy conservation and the PE formula, derive the minimum height the preceding drop must have.',
      connection: 'At the top of a loop of radius r, the minimum speed satisfies mg = mv²/r → v²_min = gr. Energy conservation: mgh = ½mv² + mg(2r) → h = v²/(2g) + 2r = r/2 + 2r = 5r/2. The drop must be at least 5r/2 above the loop top.',
    },
    {
      id: 'p5-003-tp2',
      prompt: 'The formula PE = mgh was derived assuming g is constant. If you were calculating the PE of a satellite lifted from Earth\'s surface, why would this formula fail? What correction would you need?',
      connection: 'g decreases with altitude: g(r) = GM/r². At large heights, you must integrate: PE = −∫F dr = −∫(−GMm/r²)dr = −GMm/r + C. Near Earth\'s surface (r ≈ R_E), this reduces to mgh (Taylor expansion). At satellite heights, the constant-g assumption introduces significant error.',
    },
  ],

  debugging: [
    {
      id: 'p5-003-db1',
      scenario: 'A student calculates spring PE at x = 0.1 m as PE = k × x = 500 × 0.1 = 50 J.',
      error: 'Used PE = kx (Hooke\'s Law force) instead of PE = ½kx². The force formula and the energy formula are different.',
      fix: 'PE_spring = ½kx² = ½(500)(0.01) = 2.5 J. The ½ comes from integrating F = kx — it is not optional.',
    },
    {
      id: 'p5-003-db2',
      scenario: 'A student says: "A ball launched upward has positive KE and then gains positive PE, so total energy must be increasing."',
      error: 'Confuses "PE increases" with "total energy increases." As the ball rises, KE converts to PE — the total remains constant (no friction). Total energy = KE + PE = constant throughout.',
      fix: 'Total mechanical energy E = KE + PE. As KE decreases (ball slows), PE increases by the same amount. ΔKE = −ΔPE. Total E unchanged.',
    },
  ],

  mastery: {
    targetLevel: 'Calculate gravitational PE = mgh and spring PE = ½kx²; identify conservative vs non-conservative forces; derive force from F = −dPE/dx; use ΔPE in energy accounting.',
    checklistItems: [
      'Can calculate gravitational and spring PE for given values',
      'Can identify whether a force is conservative and explain why',
      'Can derive Hooke\'s Law and gravity from their respective PE functions using F = −dPE/dx',
      'Can choose a reference height for gravitational PE and correctly compute ΔPE for a motion',
    ],
    commonStruggles: [
      'Missing the ½ in PE_spring = ½kx² (confusing with F = kx)',
      'Treating PE as absolute instead of relative — only ΔPE has physical meaning',
    ],
    nextSteps: 'Lesson 4 combines KE and PE into the conservation of energy equation: KE_i + PE_i = KE_f + PE_f (no friction) or KE_i + PE_i = KE_f + PE_f + Q (with friction). This becomes the most powerful single-equation tool in mechanics.',
  },

  semantics: {
    core: [
      { symbol: 'PE_grav = mgh', meaning: 'gravitational potential energy — stored work done lifting against gravity; h measured from chosen reference' },
      { symbol: 'PE_spring = ½kx²', meaning: 'elastic potential energy stored in a spring — derived from ∫kx dx' },
      { symbol: 'Conservative force', meaning: 'a force for which work done is path-independent — only start and end positions matter' },
      { symbol: 'F = −dPE/dx', meaning: 'force is the negative gradient of potential energy — force points toward lower PE' },
      { symbol: 'ΔPE = −W_conservative', meaning: 'change in PE equals the negative work done by the conservative force' },
    ],
    rulesOfThumb: [
      'PE reference height is arbitrary — always choose the reference that makes calculations simplest (usually the lowest point in the problem).',
      'If a problem asks about speed at a different height and no friction — use energy conservation, not kinematics.',
      'F = −dPE/dx: if PE increases as x increases, the force points in the −x direction (toward lower PE).',
      'Spring PE quadruples when compression doubles (½k(2x)² = 4 × ½kx²).',
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Potential Energy Curves',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

m = 1.0  # kg
g = 9.8  # m/s²
k = 50   # N/m spring constant

h = np.linspace(0, 10, 200)
PE_grav = m * g * h

x = np.linspace(-0.3, 0.3, 200)
PE_spring = 0.5 * k * x**2

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

ax1.plot(h, PE_grav, 'b-', linewidth=2)
ax1.set_xlabel('Height h (m)')
ax1.set_ylabel('Gravitational PE (J)')
ax1.set_title('PE_grav = mgh — linear in height')
ax1.grid(True)
ax1.annotate(f'At h=5m: {m*g*5:.1f} J', xy=(5, m*g*5), xytext=(6, m*g*5-5),
             arrowprops=dict(arrowstyle='->'))

ax2.plot(x, PE_spring, 'r-', linewidth=2)
ax2.set_xlabel('Displacement x (m)')
ax2.set_ylabel('Spring PE (J)')
ax2.set_title('PE_spring = ½kx² — quadratic (parabola)')
ax2.grid(True)
plt.tight_layout()
plt.show()

print(f"PE_grav at h=3m: {m*g*3:.2f} J")
print(f"PE_spring at x=0.1m: {0.5*k*0.1**2:.3f} J")
print(f"PE_spring at x=0.2m: {0.5*k*0.2**2:.3f} J  (4x larger, as expected)")`,
          prose: [
            '`PE_grav = m * g * h` implements PE = mgh directly — a linear function. The plot is a straight line because gravitational PE grows proportionally with height.',
            '`PE_spring = 0.5 * k * x**2` implements PE = ½kx² — a parabola. The minimum is at x = 0 (natural length) and it grows quadratically, matching the integral of Hooke\'s Law.',
            'The last three print statements verify that doubling spring compression (x = 0.1 → 0.2 m) quadruples the stored energy — the v² analogy from kinetic energy.',
          ],
        },
        {
          cellTitle: 'Force from PE — The F = −dPE/dx Relationship',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

k = 50   # N/m
x = np.linspace(-0.3, 0.3, 300)

PE_spring = 0.5 * k * x**2
F_from_PE = -np.gradient(PE_spring, x)  # F = -dPE/dx numerically
F_hookes   = -k * x                     # Hooke's Law: F = -kx

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

ax1.plot(x, PE_spring, 'b-', linewidth=2, label='PE = ½kx²')
ax1.set_xlabel('Displacement x (m)')
ax1.set_ylabel('PE (J)')
ax1.set_title('Spring PE')
ax1.legend(); ax1.grid(True)

ax2.plot(x, F_hookes, 'r-', linewidth=2, label="Hooke's Law F = -kx")
ax2.plot(x, F_from_PE, 'g--', linewidth=2, label="F = -dPE/dx (numerical)")
ax2.set_xlabel('Displacement x (m)')
ax2.set_ylabel('Force F (N)')
ax2.set_title('Force recovered from PE curve')
ax2.legend(); ax2.grid(True)
plt.tight_layout()
plt.show()`,
          prose: [
            '`np.gradient(PE_spring, x)` computes the numerical derivative dPE/dx using finite differences. Multiplying by −1 gives F = −dPE/dx — the force recovered from the PE function.',
            'The red (Hooke\'s Law) and green (from PE gradient) curves overlap perfectly, confirming the calculus relationship F = −dPE/dx for springs.',
            'Notice F = 0 at x = 0 (natural length — PE minimum). This is a general rule: equilibrium points are located where dPE/dx = 0, i.e., at minima or maxima of the PE curve.',
          ],
        },
        {
          cellTitle: 'PE Reference Height — It\'s Arbitrary',
          type: 'code',
          language: 'python',
          code: `import numpy as np

m = 2.0  # kg
g = 9.8  # m/s²

# Same ball dropped from 5m to 2m, two reference choices
h_initial = 5.0  # m
h_final   = 2.0  # m

# Reference 1: ground (h=0 is ground)
PE_i_ref1 = m * g * h_initial   # 98 J
PE_f_ref1 = m * g * h_final     # 39.2 J
dPE_ref1  = PE_f_ref1 - PE_i_ref1

# Reference 2: initial position (h=0 is start)
PE_i_ref2 = 0.0
PE_f_ref2 = m * g * (h_final - h_initial)  # negative since ball falls
dPE_ref2  = PE_f_ref2 - PE_i_ref2

print("Reference = ground:")
print(f"  PE_i = {PE_i_ref1:.1f} J,  PE_f = {PE_f_ref1:.1f} J,  ΔPE = {dPE_ref1:.1f} J")
print()
print("Reference = initial height:")
print(f"  PE_i = {PE_i_ref2:.1f} J,  PE_f = {PE_f_ref2:.1f} J,  ΔPE = {dPE_ref2:.1f} J")
print()
print(f"ΔPE is the same ({dPE_ref1:.1f} J) regardless of reference — only changes matter!")`,
          prose: [
            'Two reference frames give different absolute PE values but identical ΔPE = −58.8 J. This confirms that only changes in PE have physical meaning — the reference height is a free choice.',
            'The formula `m * g * (h_final - h_initial)` directly computes ΔPE regardless of reference. For calculations involving energy conservation, always use ΔPE or set up the equation in terms of height differences.',
            'Setting reference at the lowest point in a problem (usually the final position) minimizes the number of non-zero PE terms and simplifies algebra.',
          ],
        },
        {
          cellTitle: 'Challenge — Spring and Gravity PE Together',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          prompt: 'A spring (k = 200 N/m) launches a 0.5 kg ball vertically. The spring is compressed 0.1 m from its natural length. (1) Calculate the initial spring PE stored. (2) How high does the ball rise above the spring\'s natural length? (Use PE_spring = ½mv²_launch then mgh_max = PE_spring) (3) Plot PE_spring vs compression and mark the x = 0.1 m point.',
          starterCode: `import numpy as np
import matplotlib.pyplot as plt

k = 200   # N/m
m = 0.5   # kg
g = 9.8   # m/s²
x_compress = 0.1  # m

# TODO: PE_spring_initial = ?
# TODO: At launch (x=0), all spring PE → KE → as ball rises, KE → gravitational PE
# TODO: max height h_max where mgh = PE_spring_initial → h_max = ?
# TODO: print results

# TODO: plot PE_spring = 0.5*k*x**2 for x from 0 to 0.15 m
# mark x_compress with a vertical line`,
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'PE Curves — Gravity and Spring',
          type: 'code',
          language: 'matlab',
          code: `% Potential energy curves
m = 1.0; g = 9.8; k = 50;

h = linspace(0, 10, 200);
PE_grav = m * g * h;

x = linspace(-0.3, 0.3, 200);
PE_spring = 0.5 * k * x.^2;

figure;
subplot(1,2,1)
plot(h, PE_grav, 'b-', 'LineWidth', 2)
xlabel('Height h (m)'); ylabel('PE (J)')
title('PE_{grav} = mgh — linear')
grid on

subplot(1,2,2)
plot(x, PE_spring, 'r-', 'LineWidth', 2)
xlabel('Displacement x (m)'); ylabel('PE (J)')
title('PE_{spring} = ½kx² — parabola')
grid on

fprintf('PE_grav at h=3m: %.2f J\\n', m*g*3)
fprintf('PE_spring at x=0.1m: %.3f J\\n', 0.5*k*0.1^2)
fprintf('PE_spring at x=0.2m: %.3f J  (4x larger)\\n', 0.5*k*0.2^2)`,
          prose: [
            '`m * g * h` and `0.5 * k * x.^2` implement PE_grav and PE_spring directly. The `.^2` is MATLAB\'s element-wise squaring — needed when x is a vector.',
            '`subplot(1,2,1)` places the two plots side by side. Gravity gives a straight line; the spring gives a parabola. These shapes encode the physical difference: constant force vs. force that grows with displacement.',
            'The fprintf outputs confirm that doubling spring compression (0.1 → 0.2 m) quadruples stored energy — the ½kx² scaling that parallels ½mv².',
          ],
        },
        {
          cellTitle: 'Force from PE Gradient',
          type: 'code',
          language: 'matlab',
          code: `% Recover force from potential energy: F = -dPE/dx
k = 50;
x = linspace(-0.3, 0.3, 300);
PE_spring = 0.5 * k * x.^2;

% Numerical derivative using gradient()
dPE_dx = gradient(PE_spring, x);
F_from_PE = -dPE_dx;  % F = -dPE/dx

F_hookes = -k * x;  % analytical Hooke's Law

figure;
subplot(1,2,1)
plot(x, PE_spring, 'b-', 'LineWidth', 2)
xlabel('x (m)'); ylabel('PE (J)'); title('Spring PE curve'); grid on

subplot(1,2,2)
plot(x, F_hookes, 'r-', 'LineWidth', 2); hold on
plot(x, F_from_PE, 'g--', 'LineWidth', 2)
xlabel('x (m)'); ylabel('Force F (N)')
title('F = -dPE/dx recovers Hooke''s Law')
legend("Hooke's Law", 'From PE gradient')
grid on`,
          prose: [
            '`gradient(PE_spring, x)` computes dPE/dx numerically using MATLAB\'s finite-difference gradient. Negating it gives F = −dPE/dx — recovering the spring force from the PE function.',
            'The two force curves (red = analytic Hooke\'s Law, green = numerical from PE) overlap perfectly, validating the relationship F = −dPE/dx.',
            'At x = 0, the force is zero (equilibrium). This is the PE minimum — force always points toward the PE minimum, pulling the system back to equilibrium.',
          ],
        },
        {
          cellTitle: 'Spring Launch Height',
          type: 'code',
          language: 'matlab',
          code: `% Spring launches a ball upward: how high does it go?
k = 200;    % N/m
m = 0.5;    % kg
g = 9.8;    % m/s^2

x_vals = linspace(0, 0.2, 200);  % range of compressions
PE_spring = 0.5 * k * x_vals.^2;
h_max = PE_spring / (m * g);     % energy conservation: PE_spring = mgh

figure;
yyaxis left
plot(x_vals, PE_spring, 'b-', 'LineWidth', 2)
ylabel('Spring PE (J)')

yyaxis right
plot(x_vals, h_max, 'r-', 'LineWidth', 2)
ylabel('Max Height (m)')

xlabel('Spring Compression x (m)')
title('Spring compression → launch height')
legend('PE spring', 'Max height')
grid on

x_test = 0.1;
fprintf('At x=%.2f m: PE=%.2f J, h_max=%.2f m\\n', ...
        x_test, 0.5*k*x_test^2, 0.5*k*x_test^2/(m*g))`,
          prose: [
            '`h_max = PE_spring / (m * g)` rearranges energy conservation: ½kx² = mgh_max → h_max = kx²/(2mg). All spring PE converts to gravitational PE at the peak.',
            '`yyaxis left/right` creates a dual-axis plot — two quantities with different scales on the same figure. Both curves are parabolas since h_max ∝ x² ∝ PE.',
            'The result shows that doubling compression quadruples the max height — the same quadratic scaling. This is why a compressed spring stores disproportionately more energy than a lightly compressed one.',
          ],
        },
        {
          cellTitle: 'Challenge — Gravitational vs Spring PE Comparison',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          prompt: 'A 0.8 kg object is either: (A) lifted 3 m under gravity, or (B) compressed onto a spring (k = 400 N/m) and released. How much spring compression gives the same stored PE as lifting to 3 m? Solve analytically and verify numerically by plotting both PE functions on the same axis, marking the intersection.',
          starterCode: `% PE comparison: gravity vs spring
m = 0.8; g = 9.8; k = 400;
h_target = 3;  % m

% TODO: PE_grav_target = m * g * h_target
% TODO: solve analytically: 0.5*k*x_eq^2 = PE_grav_target → x_eq = sqrt(2*PE/k)
% TODO: fprintf the solution

% TODO: plot PE_spring vs x (x from 0 to 0.3) and mark x_eq
% TODO: add horizontal line at PE_grav_target`,
        },
      ],
    },
  },
}

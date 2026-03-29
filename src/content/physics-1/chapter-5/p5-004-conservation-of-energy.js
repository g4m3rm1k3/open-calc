export default {
  id: 'p1-ch5-004',
  slug: 'energy-conservation',
  chapter: 'p5',
  order: 4,
  title: 'Conservation of Energy',
  subtitle: 'Energy is never created or destroyed — only transformed.',
  tags: ['conservation of energy', 'mechanical energy', 'total energy', 'energy transformation', 'friction loss'],

  hook: {
    question:
      'A roller coaster car is released from rest at the top of a 40 m hill. ' +
      'Predict its speed at the bottom. You have: g = 9.8 m/s², mass unknown. ' +
      'Here\'s the twist: can you solve it without knowing the mass? What does that tell you?',
    realWorldContext:
      'Conservation of energy is the single most powerful tool in all of physics. ' +
      'Engineers use it to design roller coasters, predict satellite orbits, and size hydraulic systems. ' +
      'It works because energy is a scalar — you never need to track directions, just totals. ' +
      'The mass cancelling out (as you\'ll see) reveals something deep: the speed at the bottom is determined by height alone.',
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      '**Prediction answer:** The mass cancels. \\(mgh = \\tfrac{1}{2}mv^2\\) → \\(v = \\sqrt{2gh} = \\sqrt{2(9.8)(40)} \\approx 28\\) m/s. ' +
        'Every roller coaster car — 1 kg or 10,000 kg — reaches the same speed at the bottom from the same height. ' +
        'Galileo discovered this for free fall; energy conservation explains why.',

      '**The principle:** In any system where only conservative forces do work (gravity, springs — no friction, no air resistance), ' +
        'the total mechanical energy \\(E = KE + PE\\) remains constant. ' +
        'Energy is not created or destroyed — it flows between kinetic and potential forms.',

      '**What friction actually does:** Friction converts mechanical energy into thermal energy (heat). ' +
        'It does NOT violate conservation of energy — total energy (including thermal) is still conserved. ' +
        'But it does mean the mechanical energy decreases: \\(KE_f + PE_f = KE_i + PE_i - Q\\), ' +
        'where \\(Q\\) is the energy lost to friction (heat generated).',

      '**The power of the scalar:** Unlike Newton\'s Second Law (which requires vector components, equations per dimension, kinematics), ' +
        'energy conservation is one equation with one unknown. ' +
        'No directions, no time — just initial and final states. ' +
        'For many problems, it is 10× faster than any other method.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 4 of 6 — The crown of Chapter 5',
        body:
          '**Lessons 1–3 built:** Work transfers energy; KE is energy of motion (W = ΔKE); ' +
          'PE is stored work against conservative forces.\n' +
          '**This lesson:** All three combine into the Conservation of Energy — ' +
          'the most powerful tool in classical mechanics.\n' +
          '**Next lesson:** Power — energy transferred per unit time.',
      },
      {
        type: 'theorem',
        title: 'Conservation of Mechanical Energy (no friction)',
        body: 'KE_i + PE_i = KE_f + PE_f \\qquad (\\text{conservative forces only})',
      },
      {
        type: 'theorem',
        title: 'Energy with friction',
        body: 'KE_i + PE_i = KE_f + PE_f + W_{\\text{friction}}',
      },
      {
        type: 'insight',
        title: 'Why choose a reference level wisely',
        body:
          'Set the reference (h = 0) at the lowest point in the problem. ' +
          'This makes \\(PE = 0\\) there, simplifying the algebra. ' +
          'The choice is always valid — only \\(\\Delta PE\\) matters, and it is the same regardless of reference.',
      },
      {
        type: 'warning',
        title: 'Energy conservation ≠ momentum conservation',
        body:
          'These are separate laws. Momentum is conserved when net external force = 0. ' +
          'Mechanical energy is conserved when only conservative forces do work. ' +
          'In a collision, momentum is always conserved — but kinetic energy may not be (inelastic collisions).',
      },
      {
        type: 'connection',
        title: 'Calculus connection: E = constant means dE/dt = 0',
        body:
          '\\(\\dfrac{dE}{dt} = \\dfrac{d}{dt}(KE + PE) = 0\\). ' +
          'Expanding: \\(mv\\dot{v} + \\dfrac{dPE}{dx}\\dot{x} = 0\\). ' +
          'Since \\(\\dot{x} = v\\) and \\(F = -dPE/dx\\): this reduces to \\(ma = F\\) — Newton\'s Second Law. ' +
          'Energy conservation and Newton\'s Law are equivalent statements.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'pe-ke-exchange' },
        title: 'Total energy stays constant across height changes',
        caption:
          'Track the energy bar as the coaster moves: when PE is high, KE is low; when PE is zero, KE is maximum. ' +
          'The total bar length never changes (frictionless). ' +
          'Add friction: the total bar shrinks, with the lost portion appearing as thermal energy.',
      },
      {
        id: 'ProjectileMotion',
        title: 'Projectile energy: KE + PE = constant throughout flight',
        mathBridge:
          'At every point on the trajectory, compute ½mv² + mgh. ' +
          'The sum is constant — the energy exchanged between forms is exact.',
        caption: 'The parabolic path is the geometric consequence of energy conservation under gravity.',
        props: { showEnergyBars: true },
      },
    ],
  },

  math: {
    prose: [
      'Define mechanical energy \\(E = KE + PE\\). For conservative-only forces:',
      '\\(\\Delta E = 0 \\Rightarrow KE_i + PE_i = KE_f + PE_f\\)',
      'Expand for the most common case (gravity + spring, with friction):',
      '\\(\\tfrac{1}{2}mv_i^2 + mgh_i + \\tfrac{1}{2}kx_i^2 = \\tfrac{1}{2}mv_f^2 + mgh_f + \\tfrac{1}{2}kx_f^2 + W_f\\)',
      'where \\(W_f \\geq 0\\) is energy lost to friction (always positive — friction always removes energy).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Full energy equation',
        body:
          '\\tfrac{1}{2}mv_i^2 + mgh_i + \\tfrac{1}{2}kx_i^2 = \\tfrac{1}{2}mv_f^2 + mgh_f + \\tfrac{1}{2}kx_f^2 + W_{\\text{friction}}',
      },
      {
        type: 'mnemonic',
        title: 'Strategy for energy problems',
        body:
          '1. Identify initial and final states.\\\\' +
          '2. List all energy types present (KE, gravitational PE, spring PE).\\\\' +
          '3. Note any friction (subtract from right-side total).\\\\' +
          '4. Set up: all energies at start = all energies at end.\\\\' +
          '5. Cancel terms that are zero (e.g., v = 0 at rest, h = 0 at reference).',
      },
    ],
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'PE curve → force and equilibrium',
        mathBridge:
          'A PE curve shows stored energy as a function of position. ' +
          'Where PE is minimum, the force is zero (equilibrium). ' +
          'The slope of PE at any point equals the negative force at that point: F = −dPE/dx.',
        caption: 'Valleys in the PE curve are stable equilibria — balls roll toward them and oscillate around them.',
        props: { expression: '(x-2)*(x-2)', variable: 'x', xMin: -1, xMax: 5, label: 'PE (J)' },
      },
    ],
  },

  rigor: {
    title: 'Proof: mechanical energy is conserved for conservative forces',
    prose: [
      'We show that dE/dt = 0 whenever only conservative forces do work.',
    ],
    proofSteps: [
      {
        expression: 'E = KE + PE = \\tfrac{1}{2}mv^2 + PE(x)',
        annotation: 'Total mechanical energy = kinetic + potential.',
      },
      {
        expression: '\\frac{dE}{dt} = mv\\frac{dv}{dt} + \\frac{dPE}{dx}\\frac{dx}{dt}',
        annotation: 'Differentiate using chain rule.',
      },
      {
        expression: '= mva + \\frac{dPE}{dx}\\cdot v',
        annotation: 'Recognize dv/dt = a and dx/dt = v.',
      },
      {
        expression: '= v\\left(ma + \\frac{dPE}{dx}\\right)',
        annotation: 'Factor out v.',
      },
      {
        expression: '\\text{For conservative force: } F = -\\frac{dPE}{dx} \\Rightarrow ma = -\\frac{dPE}{dx}',
        annotation: 'Newton\'s Second Law with F = −dPE/dx.',
      },
      {
        expression: '\\frac{dE}{dt} = v(ma + (-ma)) = v \\cdot 0 = 0',
        annotation: 'The bracket vanishes. dE/dt = 0 → E is constant. QED.',
      },
    ],
  },

  examples: [
    {
      id: 'ch5-004-ex1',
      title: 'Roller coaster — finding speed at the bottom',
      problem:
        '\\text{A 500 kg coaster starts from rest at h = 30 m. ' +
        'Find its speed at h = 5 m (frictionless).}',
      steps: [
        {
          expression: 'E_i = mgh_i = (500)(9.8)(30) = 147{,}000\\,\\text{J}',
          annotation: 'All potential energy at start (v = 0, so KE = 0).',
        },
        {
          expression: 'E_f = \\tfrac{1}{2}mv_f^2 + mgh_f = \\tfrac{1}{2}(500)v_f^2 + (500)(9.8)(5)',
          annotation: 'At h = 5 m: both KE and PE are present.',
        },
        {
          expression: '147{,}000 = 250v_f^2 + 24{,}500 \\Rightarrow v_f^2 = \\frac{122{,}500}{250} = 490',
          annotation: 'Set E_i = E_f and solve.',
        },
        {
          expression: 'v_f = \\sqrt{490} \\approx 22.1\\,\\text{m/s}',
          annotation: 'Speed at h = 5 m.',
        },
      ],
      conclusion: 'Speed ≈ 22.1 m/s. Note: mass cancelled — the speed depends only on the height difference.',
    },
    {
      id: 'ch5-004-ex2',
      title: 'Slide with friction — finding energy loss',
      problem:
        '\\text{A 60 kg person slides down a 5 m slide, dropping 3 m in height. ' +
        'They reach the bottom at 4 m/s. How much energy was lost to friction?}',
      steps: [
        {
          expression: 'E_i = mgh = (60)(9.8)(3) = 1764\\,\\text{J}',
          annotation: 'Initial energy = gravitational PE (starts from rest at top).',
        },
        {
          expression: 'E_f = \\tfrac{1}{2}mv_f^2 = \\tfrac{1}{2}(60)(16) = 480\\,\\text{J}',
          annotation: 'Final energy = KE at bottom (height = 0).',
        },
        {
          expression: 'W_{\\text{friction}} = E_i - E_f = 1764 - 480 = 1284\\,\\text{J}',
          annotation: 'Energy lost to friction = initial mechanical energy minus final mechanical energy.',
        },
      ],
      conclusion: '1284 J became heat (warming the slide and person). Only 480 J remained as kinetic energy.',
    },
  ],

  challenges: [
    {
      id: 'ch5-004-ch1',
      difficulty: 'easy',
      problem:
        '\\text{A 2 kg ball is dropped from rest at h = 10 m. Find its speed just before impact. Use g = 10 m/s².}',
      hint: 'All PE converts to KE at the bottom.',
      walkthrough: [
        {
          expression: 'mgh = \\tfrac{1}{2}mv^2 \\Rightarrow v = \\sqrt{2gh} = \\sqrt{200} \\approx 14.1\\,\\text{m/s}',
          annotation: 'Mass cancels. Speed depends only on height.',
        },
      ],
      answer: 'v ≈ 14.1 m/s.',
    },
    {
      id: 'ch5-004-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A spring (k = 500 N/m) is compressed 0.2 m and launches a 0.1 kg ball vertically. ' +
        'Find the maximum height reached.}',
      hint: 'All spring PE converts to gravitational PE at maximum height.',
      walkthrough: [
        {
          expression: '\\tfrac{1}{2}kx^2 = mgh \\Rightarrow \\tfrac{1}{2}(500)(0.04) = (0.1)(9.8)h',
          annotation: 'Spring PE → gravitational PE.',
        },
        {
          expression: '10 = 0.98h \\Rightarrow h = 10.2\\,\\text{m}',
          annotation: 'Maximum height above launch point.',
        },
      ],
      answer: 'Maximum height ≈ 10.2 m.',
    },
    {
      id: 'ch5-004-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A 4 kg block slides from rest down a 3 m ramp inclined at 30°. ' +
        'The coefficient of kinetic friction is 0.2. Find the speed at the bottom.}',
      hint: 'Height dropped = 3 sin 30° = 1.5 m. Friction force = μₖ N = μₖ mg cos 30°. Friction work = friction force × 3 m.',
      walkthrough: [
        {
          expression: 'h = 3\\sin 30° = 1.5\\,\\text{m} \\Rightarrow PE_i = mgh = (4)(9.8)(1.5) = 58.8\\,\\text{J}',
          annotation: 'Height dropped.',
        },
        {
          expression: 'W_f = \\mu_k mg\\cos 30° \\times d = (0.2)(4)(9.8)(0.866)(3) = 20.4\\,\\text{J}',
          annotation: 'Energy lost to friction over the 3 m ramp length.',
        },
        {
          expression: 'KE_f = PE_i - W_f = 58.8 - 20.4 = 38.4\\,\\text{J}',
          annotation: 'Remaining energy becomes kinetic energy.',
        },
        {
          expression: 'v = \\sqrt{\\frac{2 \\times 38.4}{4}} = \\sqrt{19.2} \\approx 4.38\\,\\text{m/s}',
          annotation: 'Solve for speed.',
        },
      ],
      answer: 'v ≈ 4.38 m/s.',
    },
  ],
}

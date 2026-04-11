export default {
  id: 'p1-ch5-100',
  slug: 'energy-examples',
  chapter: 'p5',
  order: 6,
  title: 'Energy: Synthesis and Worked Examples',
  subtitle: 'Connecting work, kinetic energy, potential energy, conservation, and power in complex problems.',
  tags: ['work-energy synthesis', 'energy problems', 'conservation examples', 'power examples', 'multi-step'],

  hook: {
    question:
      'A ball is launched from a spring, flies through the air, hits an incline, and slides to a stop. How many physics concepts does this single problem connect? Before reading on, list every type of energy transformation you can identify.',
    realWorldContext:
      'Real engineering problems are never isolated. A roller coaster uses springs, gravitational PE, KE, friction losses, and power requirements all in one design. This lesson builds the habit of seeing problems in terms of energy flow — where does it start, where does it end, and what happens in between.',
    previewVisualizationId: 'ProjectileMotion',
  },

  intuition: {
    prose: [
      '**The energy audit approach:** Every problem is an accounting exercise. At the start, inventory all energy forms. At the end, inventory again. What changed? Where did the difference go (heat, sound, deformation)? This framework solves problems that would require multiple kinematics equations — in one step.',

      '**The spiral: everything we\'ve built connects here.** Work (Lesson 1) is how energy enters or leaves a system. KE (Lesson 2) is what motion carries. PE (Lesson 3) is what conservative forces store. Conservation (Lesson 4) is the accounting rule. Power (Lesson 5) is the time rate. This lesson is where you practice moving fluidly between all five.',

      '**When to use energy vs Newton\'s Laws:** If a problem asks about speed or height — use energy (no need for acceleration or time). If a problem asks about force at a specific instant — use Newton\'s Laws. If a problem mixes force and distance with no time specified — the Work-Energy Theorem is the bridge.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 6 of 6 — Synthesis of Chapter 5',
        body:
          '**Chapter 5 complete map:**\n1. Work = F·d·cosθ (energy transferred)\n2. Work-Energy Theorem: W_net = ΔKE\n3. PE = mgh (gravity), ½kx² (spring)\n4. Conservation: KE_i + PE_i = KE_f + PE_f + W_friction\n5. Power: P = W/t = Fv\n**Chapter 6 next:** Momentum — a different conserved quantity that handles collisions and impacts.',
      },
      {
        type: 'insight',
        title: 'Energy method checklist',
        body:
          '□ Define the system (what is included).\n□ Choose the reference level (where PE = 0).\n□ Identify the initial and final states.\n□ List all energy terms at each state.\n□ Apply conservation: E_i = E_f + losses.',
      },
    ],
    visualizations: [
      {
        id: 'ProjectileMotion',
        title: 'Projectile energy throughout the flight',
        mathBridge:
          'Adjust launch speed and angle. At every point of the trajectory, the total energy KE + PE is constant. Watch how PE peaks at maximum height while KE is minimum.',
        caption: 'Launch, rise, peak, fall — one conservation equation covers the entire flight.',
        props: { showEnergyBars: true },
      },
    ],
  },

  math: {
    prose: [
      '**Full energy equation (most general form):**',
      '\\(\\tfrac{1}{2}mv_i^2 + mgh_i + \\tfrac{1}{2}kx_i^2 + W_{\\text{in}} = \\tfrac{1}{2}mv_f^2 + mgh_f + \\tfrac{1}{2}kx_f^2 + W_{\\text{out}}\\)',
      'where \\(W_{\\text{in}}\\) is energy added (by an engine/motor) and \\(W_{\\text{out}}\\) is energy removed (by friction, heat).',
    ],
    callouts: [
      {
        type: 'mnemonic',
        title: 'Decision guide: which tool?',
        body:
          'Asked for speed/height → Conservation of Energy.\nAsked for force at a point → Newton\'s Second Law.\nAsked for work from a graph → W = area under F-x curve.\nAsked for time or acceleration → Kinematics (SUVAT).\nProblem mixes force and displacement → Work-Energy Theorem.',
      },
    ],
  },

  rigor: {
    title: 'The Work-Energy Theorem is the fundamental bridge',
    prose: [
      'All energy equations in this chapter are special cases of W_net = ΔKE:',
    ],
    proofSteps: [
      {
        expression: 'W_{\\text{net}} = \\Delta KE',
        annotation: 'The fundamental theorem, proved in Lesson 2.',
      },
      {
        expression: 'W_{\\text{gravity}} = -\\Delta PE_g = -(mgh_f - mgh_i)',
        annotation: 'Gravity is conservative: W = −ΔPE. Substituting into the theorem:',
      },
      {
        expression: '-\\Delta PE_g + W_{\\text{other}} = \\Delta KE',
        annotation: 'Split net work into conservative and other (friction, engine) contributions.',
      },
      {
        expression: 'W_{\\text{other}} = \\Delta KE + \\Delta PE_g = \\Delta E_{\\text{mech}}',
        annotation: 'Non-conservative work equals the change in total mechanical energy.',
      },
      {
        expression: 'W_{\\text{other}} = 0 \\Rightarrow \\Delta E_{\\text{mech}} = 0 \\Rightarrow E_i = E_f',
        annotation: 'If no friction/engines: mechanical energy is conserved. Special case of the general theorem.',
      },
    ],
  },

  examples: [
    {
      id: 'ch5-100-ex1',
      title: 'Bungee jump — spring PE and gravity',
      problem:
        '\\text{A 70 kg bungee jumper falls 20 m freely, then the bungee cord (k = 40 N/m) stretches another 15 m. Find the jumper\'s speed when the cord is fully stretched. (g = 9.8 m/s²)}',
      steps: [
        {
          expression: 'E_i = mgh_{\\text{total}} = (70)(9.8)(35) = 24{,}010\\,\\text{J}',
          annotation: 'Set reference at lowest point (cord fully stretched). Initial height = 20 + 15 = 35 m.',
        },
        {
          expression: 'E_f = \\tfrac{1}{2}mv_f^2 + \\tfrac{1}{2}kx^2 + 0',
          annotation: 'At cord fully stretched: height = 0 (reference), so PE_g = 0. Spring stores elastic PE.',
        },
        {
          expression: '\\tfrac{1}{2}(40)(225) = 4500\\,\\text{J}\\quad (\\text{spring PE at }x=15\\,\\text{m})',
          annotation: 'Elastic PE = ½kx² = ½(40)(15²) = 4500 J.',
        },
        {
          expression: '24{,}010 = \\tfrac{1}{2}(70)v_f^2 + 4500 \\Rightarrow v_f^2 = \\frac{19{,}510}{35} = 557.4',
          annotation: 'Solve for KE, then velocity.',
        },
        {
          expression: 'v_f \\approx 23.6\\,\\text{m/s}',
          annotation: 'Speed at full extension ≈ 85 km/h — the spring hasn\'t stopped the jumper yet!',
        },
      ],
      conclusion: 'Speed at full cord extension ≈ 23.6 m/s. The cord is still stretching at this point.',
    },
    {
      id: 'ch5-100-ex2',
      title: 'Motor lifting a load — power and time',
      problem:
        '\\text{A 2 kW motor lifts a 200 kg crate to a height of 12 m. Assuming 80% efficiency, find the time required.}',
      steps: [
        {
          expression: 'W_{\\text{useful}} = mgh = (200)(9.8)(12) = 23{,}520\\,\\text{J}',
          annotation: 'Work done against gravity.',
        },
        {
          expression: 'W_{\\text{input}} = \\frac{W_{\\text{useful}}}{\\text{efficiency}} = \\frac{23{,}520}{0.80} = 29{,}400\\,\\text{J}',
          annotation: 'More energy must be input because 20% is lost to friction/heat in the motor.',
        },
        {
          expression: 't = \\frac{W_{\\text{input}}}{P} = \\frac{29{,}400}{2000} = 14.7\\,\\text{s}',
          annotation: 'Time = energy ÷ power.',
        },
      ],
      conclusion: 'The motor takes about 14.7 seconds. Without efficiency losses, it would take 11.76 s.',
    },
    {
      id: 'ch5-100-ex3',
      title: 'Ball on a loop-the-loop — minimum speed at top',
      problem:
        '\\text{A ball must maintain contact with the top of a circular loop of radius R = 2 m. Find the minimum height h from which to release it (frictionless). (g = 9.8 m/s²)}',
      steps: [
        {
          expression: '\\text{At top of loop: minimum speed from } N = 0 \\Rightarrow mg = \\frac{mv_{\\text{top}}^2}{R}',
          annotation: 'At minimum speed, normal force is zero and gravity alone provides centripetal force.',
        },
        {
          expression: 'v_{\\text{top}}^2 = gR = (9.8)(2) = 19.6\\,\\text{m}^2/\\text{s}^2',
          annotation: 'Minimum speed at top.',
        },
        {
          expression: 'mgh = \\tfrac{1}{2}mv_{\\text{top}}^2 + mg(2R)',
          annotation: 'Energy conservation from release (rest) to top of loop (height 2R).',
        },
        {
          expression: 'h = \\frac{v_{\\text{top}}^2}{2g} + 2R = \\frac{19.6}{19.6} + 4 = 1 + 4 = 5\\,\\text{m}',
          annotation: 'Minimum release height = 5 m = 2.5R.',
        },
      ],
      conclusion: 'Minimum release height = 5 m = 2.5R. This is a classic result: h_min = 2.5R for any loop size.',
    },
  ],

  challenges: [
    {
      id: 'ch5-100-ch1',
      difficulty: 'easy',
      problem:
        '\\text{A 5 kg block slides off a 3 m frictionless ramp (height 1.5 m). Find its speed at the bottom.}',
      hint: 'mgh = ½mv².',
      walkthrough: [
        { expression: 'v = \\sqrt{2gh} = \\sqrt{2(9.8)(1.5)} = \\sqrt{29.4} \\approx 5.42\\,\\text{m/s}', annotation: 'Mass cancels.' },
      ],
      answer: 'v ≈ 5.42 m/s.',
    },
    {
      id: 'ch5-100-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A 10 kg block compresses a spring (k = 2000 N/m) by 0.3 m, then is launched up a frictionless 30° ramp. Find how far up the ramp it travels.}',
      hint: 'Spring PE converts to gravitational PE. Height = d sin 30°.',
      walkthrough: [
        {
          expression: '\\tfrac{1}{2}kx^2 = mgh \\Rightarrow \\tfrac{1}{2}(2000)(0.09) = (10)(9.8)h',
          annotation: 'Spring PE → gravitational PE.',
        },
        {
          expression: 'h = 90/98 = 0.918\\,\\text{m} \\Rightarrow d = h/\\sin30° = 1.84\\,\\text{m}',
          annotation: 'Convert height to distance along 30° ramp.',
        },
      ],
      answer: 'd ≈ 1.84 m along the ramp.',
    },
    {
      id: 'ch5-100-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A car engine (P = 80 kW) accelerates a 1200 kg car from 0 to 30 m/s on a level road. The total friction force is 400 N. Find: (a) time to reach 30 m/s, (b) distance covered.}',
      hint:
        'Energy supplied by engine = ΔKE + work against friction. P × t = ½mv² + F_friction × d. Use W-E Theorem and kinematics to find both t and d.',
      walkthrough: [
        {
          expression: '\\Delta KE = \\tfrac{1}{2}(1200)(900) = 540{,}000\\,\\text{J}',
          annotation: 'KE gained.',
        },
        {
          expression: 'W_{\\text{engine}} = \\Delta KE + F_f d',
          annotation: 'Engine must supply KE AND overcome friction over distance d.',
        },
        {
          expression: 'P \\cdot t = 540{,}000 + 400d \\quad \\text{and} \\quad d = \\bar{v} \\cdot t = 15t',
          annotation: 'Average speed during constant-power acceleration ≈ 15 m/s (approximate for this estimate).',
        },
        {
          expression: '80000t = 540000 + 400(15t) = 540000 + 6000t \\Rightarrow t = \\frac{540000}{74000} \\approx 7.3\\,\\text{s}',
          annotation: 'Solve for time.',
        },
        {
          expression: 'd \\approx 15 \\times 7.3 \\approx 109\\,\\text{m}',
          annotation: 'Approximate distance.',
        },
      ],
      answer: 't ≈ 7.3 s, d ≈ 109 m (approximate — exact solution requires ODE for variable acceleration).',
    },
  ],
}

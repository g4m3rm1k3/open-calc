export default {
  id: 'p1-ch6-002',
  slug: 'impulse',
  chapter: 'p6',
  order: 2,
  title: 'Impulse: How Forces Change Momentum',
  subtitle: 'Force × time = change in momentum. This explains why airbags save lives.',
  tags: ['impulse', 'impulse-momentum theorem', 'J = FΔt', 'F-t graph area', 'airbag', 'collision time'],

  hook: {
    question:
      'A car crashes at 60 km/h into a wall of foam and into a solid concrete wall. ' +
      'Same mass, same initial speed. Both stop completely. ' +
      'The momentum change is identical in both crashes. ' +
      'Yet the foam crash is survivable and the concrete crash is fatal. ' +
      'What is the physics difference?',
    realWorldContext:
      'Impulse is the bridge between force and momentum. ' +
      'Understanding it explains every piece of crash safety technology: ' +
      'airbags, crumple zones, helmets, landing mats in gymnastics, and padding in boxing gloves. ' +
      'They all work by one mechanism: extending the time of impact to reduce the peak force.',
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      '**The answer:** The time of impact. ' +
        'Foam takes 200 ms to stop the car; concrete takes 5 ms. Same momentum change (\\(\\Delta p = mv\\)), but spread over very different times. ' +
        'From \\(F = dp/dt\\): the concrete wall exerts 40× more force. ' +
        'That force is what kills — not the speed, not the momentum change, but the force × time relationship.',

      '**Impulse:** The product \\(J = F\\Delta t\\) is called impulse. ' +
        'It equals the change in momentum: \\(J = \\Delta p = m\\Delta v\\). ' +
        'This is the **Impulse-Momentum Theorem**. ' +
        'The same impulse (same Δp) can be delivered by a large force over a short time or a small force over a long time.',

      '**Variable forces:** Real collision forces are not constant — they spike, peak, and decay. ' +
        'The impulse is the area under the F–t graph: \\(J = \\int F\\,dt\\). ' +
        'A force-time graph is therefore the key to understanding any collision — the area tells you the momentum change, regardless of force shape.',

      '**Transfer to design:** Airbags extend collision time from ~5 ms (steering wheel) to ~30–50 ms. ' +
        'Same ΔP, 6–10× longer time, 6–10× smaller peak force. ' +
        'Crumple zones do the same with the car body. ' +
        'Helmets do it with foam between skull and hard shell. ' +
        'The physics is always: larger Δt → smaller F for the same J = Δp.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 3 — The force-momentum mechanism',
        body:
          '**Lesson 1:** Momentum p = mv. Conserved when no net external force.\n' +
          '**This lesson:** How a net external force *changes* momentum: impulse J = FΔt = Δp.\n' +
          '**Next lesson:** Conservation of momentum in collisions — both elastic and inelastic.',
      },
      {
        type: 'theorem',
        title: 'Impulse-Momentum Theorem',
        body:
          '\\vec{J} = \\vec{F}_{\\text{avg}}\\,\\Delta t = \\Delta\\vec{p} = m\\vec{v}_f - m\\vec{v}_i',
      },
      {
        type: 'theorem',
        title: 'Impulse for variable force',
        body: '\\vec{J} = \\int_{t_i}^{t_f} \\vec{F}(t)\\,dt = \\text{area under }F\\text{-}t\\text{ graph}',
      },
      {
        type: 'insight',
        title: 'Trade-off: F × Δt = constant',
        body:
          'For a fixed momentum change, force and time are inversely related: \\(F = \\Delta p / \\Delta t\\). ' +
          'Double the impact time → half the force. ' +
          'This inverse relationship is exploited by every piece of safety equipment ever designed.',
      },
      {
        type: 'connection',
        title: 'Calculus connection: J = ∫F dt is momentum\'s antiderivative',
        body:
          'Since \\(F = dp/dt\\), integrating both sides: \\(\\int_{t_i}^{t_f} F\\,dt = \\int dp = \\Delta p\\). ' +
          'The impulse (area under F-t graph) is exactly what you get by integrating the derivative of momentum. ' +
          'This is the Fundamental Theorem of Calculus applied to mechanics.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'impulse-area' },
        title: 'Area under F-t graph = impulse = Δp',
        caption:
          'Two collision scenarios with the same area under their F-t curves but different peak forces. ' +
          'The tall, narrow spike (concrete wall) and the short, wide hump (foam) deliver identical impulse — but the spike force is lethal.',
      },
      {
        id: 'FunctionPlotter',
        title: 'Spike vs spread: same area, different peaks',
        mathBridge:
          'Plot two F-t curves with equal areas. ' +
          'A spike 10× taller must be 10× narrower for equal impulse. ' +
          'The area = impulse = Δp is the same. The peak force is not.',
        caption: 'Same Δp, very different peak force. This is the physics of safety engineering.',
        props: {
          expression: '400*exp(-50*x*x)',
          variable: 't',
          xMin: -0.1,
          xMax: 0.1,
          showArea: true,
          label: 'F(t) — spike collision',
        },
      },
    ],
  },

  math: {
    prose: [
      'For a constant average force \\(F_{\\text{avg}}\\) over time \\(\\Delta t\\):',
      '\\(J = F_{\\text{avg}}\\,\\Delta t = \\Delta p = mv_f - mv_i\\)',
      'For a variable force:',
      '\\(J = \\int_{t_i}^{t_f} F(t)\\,dt\\)',
      'In 2D, impulse and momentum are vectors: apply the theorem in each component direction separately.',
    ],
    callouts: [
      {
        type: 'mnemonic',
        title: 'Reading a F-t graph',
        body:
          'The **area** under F-t = impulse = Δp.\\\\' +
          'The **slope** of a p-t graph = force.\\\\' +
          'A constant F gives a straight p-t line. A spike gives a sudden jump in p.',
      },
      {
        type: 'warning',
        title: 'Impulse is not the same as work',
        body:
          'Work = \\(\\int F\\,dx\\) — force over displacement. Impulse = \\(\\int F\\,dt\\) — force over time. ' +
          'They are different integrals of force. Work changes KE; impulse changes momentum.',
      },
    ],
    visualizations: [
      {
        id: 'PositionVelocityAcceleration',
        title: 'Momentum changes when force is applied',
        mathBridge:
          'Watch the p-t graph (which is just v-t scaled by mass). ' +
          'The slope of p-t at any instant is the force at that instant. ' +
          'A constant force gives a straight p-t line (constant slope).',
        caption: 'dp/dt = F — the slope of the momentum curve is the applied force.',
        props: { showMomentum: true },
      },
    ],
  },

  rigor: {
    title: 'Deriving the Impulse-Momentum Theorem from Newton\'s Second Law',
    proofSteps: [
      {
        expression: '\\vec{F}_{\\text{net}} = \\frac{d\\vec{p}}{dt}',
        annotation: 'Newton\'s Second Law in momentum form.',
      },
      {
        expression: '\\vec{F}_{\\text{net}}\\,dt = d\\vec{p}',
        annotation: 'Multiply both sides by dt.',
      },
      {
        expression: '\\int_{t_i}^{t_f} \\vec{F}_{\\text{net}}\\,dt = \\int_{p_i}^{p_f} d\\vec{p}',
        annotation: 'Integrate both sides over the time interval.',
      },
      {
        expression: '\\vec{J} = \\vec{p}_f - \\vec{p}_i = \\Delta\\vec{p}',
        annotation: 'Left side is impulse J; right side is change in momentum. QED.',
      },
    ],
  },

  examples: [
    {
      id: 'ch6-002-ex1',
      title: 'Baseball bat impact',
      problem:
        '\\text{A 0.145 kg baseball at −35 m/s (toward batter) is hit and leaves at +48 m/s. ' +
        'Contact time = 1.5 ms. Find (a) impulse, (b) average force.}',
      steps: [
        {
          expression: '\\Delta p = m(v_f - v_i) = 0.145(48 - (-35)) = 0.145(83) = 12.0\\,\\text{N·s}',
          annotation: 'Impulse = change in momentum. Sign of v matters — ball reversed direction.',
        },
        {
          expression: 'F_{\\text{avg}} = \\frac{J}{\\Delta t} = \\frac{12.0}{0.0015} = 8000\\,\\text{N}',
          annotation: 'Average force = impulse ÷ contact time. 8000 N ≈ 1800 lb — brief but enormous.',
        },
      ],
      conclusion: 'Average bat force ≈ 8000 N acting for 1.5 ms. Brief high-force impacts are normal for collisions.',
    },
    {
      id: 'ch6-002-ex2',
      title: 'Variable force — impulse from graph',
      problem:
        '\\text{A force follows } F(t) = 6t - t^2 \\text{ (N) from } t = 0 \\text{ to } t = 6\\text{ s. ' +
        'A 3 kg object starts from rest. Find its final speed.}',
      steps: [
        {
          expression: 'J = \\int_0^6 (6t - t^2)\\,dt = \\left[3t^2 - \\frac{t^3}{3}\\right]_0^6',
          annotation: 'Integrate the variable force to get impulse.',
        },
        {
          expression: 'J = (108 - 72) - 0 = 36\\,\\text{N·s}',
          annotation: 'Total impulse delivered.',
        },
        {
          expression: 'J = m\\Delta v \\Rightarrow 36 = 3(v_f - 0) \\Rightarrow v_f = 12\\,\\text{m/s}',
          annotation: 'Apply impulse-momentum theorem.',
        },
      ],
      conclusion: 'Final speed = 12 m/s.',
    },
  ],

  challenges: [
    {
      id: 'ch6-002-ch1',
      difficulty: 'easy',
      problem: '\\text{A 0.5 kg ball changes velocity from 8 m/s to −4 m/s. Find the impulse.}',
      hint: 'J = m(v_f − v_i). Watch the sign.',
      walkthrough: [
        { expression: 'J = 0.5((-4) - 8) = 0.5(-12) = -6\\,\\text{N·s}', annotation: 'Negative: impulse was in the −x direction (opposite to original motion).' },
      ],
      answer: 'J = −6 N·s.',
    },
    {
      id: 'ch6-002-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A 70 kg person jumps off a 0.5 m ledge. On landing with bent knees, the stopping time is 0.3 s. ' +
        'Find the average force the ground exerts on the person during landing.}',
      hint: 'First find landing speed using energy: v = √(2gh). Then use impulse-momentum for landing force.',
      walkthrough: [
        {
          expression: 'v = \\sqrt{2(9.8)(0.5)} = 3.13\\,\\text{m/s}',
          annotation: 'Speed at landing from free fall.',
        },
        {
          expression: '\\Delta p = m(0 - v) = 70(-3.13) = -219\\,\\text{N·s}',
          annotation: 'Momentum change (person stops).',
        },
        {
          expression: 'F_{\\text{avg}} = \\frac{\\Delta p}{\\Delta t} + mg = \\frac{219}{0.3} + 686 = 730 + 686 = 1416\\,\\text{N}',
          annotation: 'Ground force must stop the person AND support their weight: impulse force + weight.',
        },
      ],
      answer: 'Average ground force ≈ 1416 N ≈ 2× body weight. Stiff landing (0.01 s) → 21× body weight.',
    },
    {
      id: 'ch6-002-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A force } F(t) = F_0\\sin(\\pi t/T) \\text{ acts on a } m = 2\\text{ kg object from } t=0 \\text{ to } t=T. ' +
        '\\text{Find the resulting velocity change in terms of } F_0 \\text{ and } T.',
      hint: 'Integrate F(t) from 0 to T. Use ∫sin(πt/T) dt = −(T/π)cos(πt/T).',
      walkthrough: [
        {
          expression: 'J = \\int_0^T F_0\\sin(\\pi t/T)\\,dt = F_0\\left[-\\frac{T}{\\pi}\\cos(\\pi t/T)\\right]_0^T',
          annotation: 'Integrate the sinusoidal force.',
        },
        {
          expression: '= F_0 \\cdot \\frac{T}{\\pi}[-\\cos\\pi + \\cos 0] = F_0\\frac{T}{\\pi}[1+1] = \\frac{2F_0 T}{\\pi}',
          annotation: 'cos π = −1, cos 0 = 1.',
        },
        {
          expression: '\\Delta v = \\frac{J}{m} = \\frac{2F_0 T}{\\pi m} = \\frac{2F_0 T}{2\\pi} = \\frac{F_0 T}{\\pi}',
          annotation: 'Velocity change.',
        },
      ],
      answer: '\\Delta v = F_0 T / (\\pi m).',
    },
  ],
}

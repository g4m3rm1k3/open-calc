export default {
  id: 'p1-ch5-011',
  slug: 'power',
  chapter: 'p5',
  order: 5,
  title: 'Power: The Rate of Energy Transfer',
  subtitle: 'Same work, different time — power is what separates a sports car from a truck.',
  tags: ['power', 'watt', 'rate of work', 'P = W/t', 'P = Fv', 'horsepower'],

  hook: {
    question:
      'A sports car and a truck both climb a 100 m hill. They have the same mass. They both do exactly the same work against gravity. The sports car does it in 20 seconds; the truck takes 3 minutes. In what way are they physically different? What quantity captures this difference?',
    realWorldContext:
      'Power is what you pay for in an engine. Two engines can do identical total work — but the one with more power gets it done faster. A human climbing stairs does the same work per floor regardless of speed, but sprinting up eight floors is exhausting while walking takes little effort. Electric motors, turbines, and muscles are all rated in watts for this reason.',
    previewVisualizationId: 'FunctionPlotter',
  },

  intuition: {
    prose: [
      '**The answer:** Work is the same — the difference is TIME. The sports car transfers the same energy in 20 s that the truck transfers in 180 s. Power is the rate of energy transfer: P = W/t. The sports car has 9× the power of the truck for this task.',

      '**Why time matters:** You can always do more work if given more time. Power tells you how much work you can do per second — it is the capability, not the total output. A marathon runner and a sprinter both expend enormous energy, but the sprinter\'s peak power output far exceeds the marathoner\'s sustained rate.',

      '**The instant version:** Average power \\(P = W/\\Delta t\\) tells you the rate over a time interval. Instantaneous power is the limit as \\(\\Delta t \\to 0\\): \\(P = dW/dt\\). Since \\(dW = F\\,dx\\): \\(P = F(dx/dt) = F \\cdot v\\). Power equals force times velocity — at every instant.',

      '**The practical form: P = Fv.** A car engine at constant speed produces exactly the power needed to overcome friction and air resistance at that speed. As speed doubles, air drag quadruples (drag ∝ v²), so power required increases as v³. This is why fuel economy drops sharply at highway speeds.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 5 of 6 — Energy per unit time',
        body:
          '**Lessons 1–4:** Work transfers energy; KE and PE are its two mechanical forms; total energy is conserved.\n**This lesson:** Power asks "how fast?" — the rate of energy transfer per second.\n**Next lesson:** Worked examples synthesizing the full chapter — work, energy, power in complex problems.',
      },
      {
        type: 'definition',
        title: 'Average power',
        body: 'P_{\\text{avg}} = \\frac{W}{\\Delta t} \\qquad [\\text{SI: W = J/s}]',
      },
      {
        type: 'definition',
        title: 'Instantaneous power',
        body: 'P = \\frac{dW}{dt} = \\vec{F}\\cdot\\vec{v} = Fv\\cos\\theta',
      },
      {
        type: 'insight',
        title: 'Unit conversions worth knowing',
        body:
          '1 kilowatt (kW) = 1000 W.\\\\1 horsepower (hp) ≈ 746 W.\\\\1 kilowatt-hour (kWh) = 3.6 × 10⁶ J — this is a unit of ENERGY, not power (power × time = energy).',
      },
      {
        type: 'warning',
        title: 'kWh is energy, W is power',
        body:
          'Your electricity bill charges for kilowatt-hours (energy used). Your appliances are rated in watts (power consumed). Confusing these is one of the most common unit errors in physics.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'power-time-work' },
        title: 'Power = slope of the W–t graph',
        caption:
          'Plot cumulative work done vs time. The slope at any point is the instantaneous power. A steep slope = high power (fast energy transfer). A flat slope = low power (slow or no energy transfer). Constant power appears as a straight line with slope = P.',
      },
    ],
  },

  math: {
    prose: [
      'For constant force and constant power:',
      '\\(P = \\dfrac{W}{t} = \\dfrac{F \\cdot d}{t} = F \\cdot v\\)',
      'For variable force and velocity:',
      '\\(P(t) = \\vec{F}(t)\\cdot\\vec{v}(t) = \\dfrac{dW}{dt}\\)',
      'Total work from power: \\(W = \\int_0^T P(t)\\,dt\\) — the area under the P–t graph.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Power-force-velocity',
        body: 'P = \\vec{F}\\cdot\\vec{v} = Fv\\cos\\theta',
      },
      {
        type: 'insight',
        title: 'Why P = Fv matters for engine design',
        body:
          'At low speed, high force with moderate v gives high power. At high speed, even small forces require huge power to maintain. Drag force \\(F_d \\propto v^2\\), so power to overcome drag \\(P = F_d v \\propto v^3\\). This cubic relationship makes high-speed travel extremely power-hungry.',
      },
      {
        type: 'mnemonic',
        title: 'Energy vs Power vs Time',
        body:
          'Energy (J) = Power (W) × Time (s)\\\\Power (W) = Energy (J) ÷ Time (s)\\\\Time (s) = Energy (J) ÷ Power (W)\\\\Triangle rule: cover the unknown, multiply or divide the other two.',
      },
    ],
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'Power to overcome drag ∝ v³',
        mathBridge:
          'Drag force ∝ v². Power = F·v, so P ∝ v³. Move the speed slider: doubling speed requires 8× the power against drag. This is why fuel economy halves between 60 and 120 km/h.',
        caption: 'The cubic growth of power-vs-speed is the physics behind fuel economy curves.',
        props: { expression: '0.5*x*x*x', variable: 'v', xMin: 0, xMax: 30, label: 'P (arbitrary units)' },
      },
    ],
  },

  rigor: {
    title: 'Instantaneous power as derivative of work',
    proofSteps: [
      {
        expression: 'dW = \\vec{F}\\cdot d\\vec{r}',
        annotation: 'Infinitesimal work = force dotted with infinitesimal displacement.',
      },
      {
        expression: 'P = \\frac{dW}{dt} = \\vec{F}\\cdot\\frac{d\\vec{r}}{dt}',
        annotation: 'Divide both sides by dt. The derivative of displacement is velocity.',
      },
      {
        expression: 'P = \\vec{F}\\cdot\\vec{v}',
        annotation: 'Instantaneous power = force · velocity. For aligned force and velocity: P = Fv.',
      },
    ],
  },

  examples: [
    {
      id: 'ch5-005-ex1',
      title: 'Engine power to maintain highway speed',
      problem:
        '\\text{A 1500 kg car travels at 30 m/s on a level road. Air resistance + rolling friction = 600 N. What engine power is required?}',
      steps: [
        {
          expression: 'P = F \\cdot v = 600 \\times 30 = 18{,}000\\,\\text{W} = 18\\,\\text{kW}',
          annotation: 'At constant speed, engine force equals total drag. P = F·v.',
        },
      ],
      conclusion: '18 kW ≈ 24 hp required to maintain 30 m/s (108 km/h). Most car engines produce 100–200 kW.',
    },
    {
      id: 'ch5-005-ex2',
      title: 'Climbing a staircase — human power output',
      problem:
        '\\text{A 70 kg person runs up a staircase (height 10 m) in 8 seconds. Find average power output.}',
      steps: [
        {
          expression: 'W = mgh = (70)(9.8)(10) = 6860\\,\\text{J}',
          annotation: 'Work done against gravity (vertical only).',
        },
        {
          expression: 'P = \\frac{W}{t} = \\frac{6860}{8} = 857.5\\,\\text{W} \\approx 858\\,\\text{W}',
          annotation: 'Average power for the climb.',
        },
      ],
      conclusion: '858 W ≈ 1.15 hp. World-class cyclists sustain ~400 W. Brief sprints can reach 1–2 kW for a few seconds.',
    },
  ],

  challenges: [
    {
      id: 'ch5-005-ch1',
      difficulty: 'easy',
      problem: '\\text{An electric motor does 12,000 J of work in 4 minutes. Find its average power in watts and kW.}',
      hint: 'Convert minutes to seconds first.',
      walkthrough: [
        { expression: 'P = 12000 / 240 = 50\\,\\text{W} = 0.05\\,\\text{kW}', annotation: '4 min = 240 s.' },
      ],
      answer: 'P = 50 W = 0.05 kW.',
    },
    {
      id: 'ch5-005-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A pump lifts 500 kg of water per minute to a height of 8 m. What is the minimum power of the pump? (g = 9.8 m/s²)}',
      hint: 'Work per minute = mgh per minute. Divide by time in seconds.',
      walkthrough: [
        {
          expression: 'W = mgh = (500)(9.8)(8) = 39{,}200\\,\\text{J per minute}',
          annotation: 'Work against gravity each minute.',
        },
        {
          expression: 'P = \\frac{39{,}200}{60} \\approx 653\\,\\text{W}',
          annotation: 'Convert to per second.',
        },
      ],
      answer: 'Minimum power ≈ 653 W.',
    },
    {
      id: 'ch5-005-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A 2000 kg car engine produces constant power } P = 40\\,\\text{kW}. \\text{Starting from rest on a level frictionless road, find the speed at } t = 10\\,\\text{s.}',
      hint:
        'P = Fv = mav. This gives the ODE: m(dv/dt) = P/v. Separate variables and integrate. Or use energy: W = Pt = ΔKE.',
      walkthrough: [
        {
          expression: 'W = Pt = 40000 \\times 10 = 400{,}000\\,\\text{J}',
          annotation: 'Energy delivered by engine in 10 s.',
        },
        {
          expression: 'W = \\tfrac{1}{2}mv^2 - 0 \\Rightarrow v = \\sqrt{\\frac{2W}{m}} = \\sqrt{\\frac{800{,}000}{2000}} = 20\\,\\text{m/s}',
          annotation: 'Apply Work-Energy Theorem (frictionless, so all engine work becomes KE).',
        },
      ],
      answer: 'v = 20 m/s after 10 seconds.',
    },
  ],
}

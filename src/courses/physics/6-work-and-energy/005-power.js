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

  quiz: [
    {
      id: 'p5-005-q1',
      type: 'input',
      text: 'A motor does 6000 J of work in 30 seconds. What is its average power in watts?',
      answer: '200',
      hints: ['P = W/t = 6000/30.'],
      reviewSection: 'Math — P = W/t',
    },
    {
      id: 'p5-005-q2',
      type: 'choice',
      text: 'A 500 W motor runs for 2 minutes. How much work does it do?',
      options: ['250 J', '1000 J', '60000 J', '120000 J'],
      answer: '60000 J',
      hints: ['W = P × t = 500 × 120 s = 60000 J. Convert minutes to seconds first.'],
      reviewSection: 'Math — W = Pt',
    },
    {
      id: 'p5-005-q3',
      type: 'choice',
      text: 'The formula P = Fv gives instantaneous power. What does v represent?',
      options: [
        'The average speed over the interval',
        'The velocity of the object at that instant',
        'The maximum speed ever reached',
        'The speed needed to do the work',
      ],
      answer: 'The velocity of the object at that instant',
      hints: ['P = dW/dt = F(dx/dt) = Fv. v is instantaneous — how fast the object is moving right now.'],
      reviewSection: 'Intuition — the instant version P = Fv',
    },
    {
      id: 'p5-005-q4',
      type: 'input',
      text: 'A car travels at 25 m/s against air resistance of 800 N. What power must the engine produce in watts?',
      answer: '20000',
      hints: ['At constant speed: engine force = resistance = 800 N. P = Fv = 800 × 25.'],
      reviewSection: 'Math — P = Fv at constant speed',
    },
    {
      id: 'p5-005-q5',
      type: 'choice',
      text: 'Two elevators lift identical loads to the same height. Elevator A takes 10 s, Elevator B takes 40 s. Their power ratio P_A/P_B is:',
      options: ['1:1 (same work)', '2:1', '4:1', '1:4'],
      answer: '4:1',
      hints: ['Same work W, different time. P = W/t. P_A/P_B = t_B/t_A = 40/10 = 4.'],
      reviewSection: 'Intuition — same work, different time',
    },
    {
      id: 'p5-005-q6',
      type: 'choice',
      text: 'Units of power are:',
      options: ['J (joules)', 'N·m', 'W = J/s', 'kg·m²/s'],
      answer: 'W = J/s',
      hints: ['Power = energy per time = joules per second = watts.'],
      reviewSection: 'Math — units of power',
    },
    {
      id: 'p5-005-q7',
      type: 'choice',
      text: 'At highway speeds, air drag on a car scales as v². Therefore the power needed to overcome drag scales as:',
      options: ['v', 'v²', 'v³', 'v⁴'],
      answer: 'v³',
      hints: ['P = F × v. If F_drag ∝ v², then P = F_drag × v ∝ v² × v = v³.'],
      reviewSection: 'Intuition — P = Fv and highway drag',
    },
    {
      id: 'p5-005-q8',
      type: 'input',
      text: 'A 70 kg person climbs a 5 m ladder in 4 seconds. What is their average power output against gravity in watts? (g = 9.8)',
      answer: '857.5',
      hints: ['W = mgh = 70×9.8×5 = 3430 J. P = W/t = 3430/4 = 857.5 W.'],
      reviewSection: 'Math — human power output',
    },
    {
      id: 'p5-005-q9',
      type: 'choice',
      text: '1 horsepower (HP) = 746 W. A 200 HP car engine has maximum power of approximately:',
      options: ['200 W', '1492 W', '14920 W', '149200 W'],
      answer: '149200 W',
      hints: ['200 HP × 746 W/HP = 149,200 W ≈ 149 kW.'],
      reviewSection: 'Math — unit conversions',
    },
    {
      id: 'p5-005-q10',
      type: 'choice',
      text: 'A machine does work at constant power P. If it operates for time t, the work done is:',
      options: ['P/t', 'Pt', 'P + t', '2Pt'],
      answer: 'Pt',
      hints: ['P = W/t → W = Pt. At constant power, work accumulates linearly with time.'],
      reviewSection: 'Math — W = Pt',
    },
  ],

  misconceptions: [
    {
      id: 'p5-005-m1',
      misconception: 'A more powerful machine always does more work.',
      correction: 'Power is the RATE of work — not the total. A 100 W motor running for 10 hours does more work than a 10,000 W motor running for 1 second. W = P × t. Total work depends on both power AND time.',
      correctionExample: '100 W × 10 hours = 100 × 36000 = 3,600,000 J. 10,000 W × 1 s = 10,000 J. The "weaker" motor did 360× more total work.',
    },
    {
      id: 'p5-005-m2',
      misconception: 'At constant velocity, no power is needed because acceleration is zero.',
      correction: 'Zero acceleration means ΣF = 0, which means applied force exactly cancels friction/drag. A non-zero force through a non-zero velocity requires P = Fv ≠ 0 power, even at constant speed.',
      correctionExample: 'A car at 30 m/s with 400 N of air drag: P = 400 × 30 = 12,000 W just to maintain constant speed. No net force, but definitely non-zero power output from the engine.',
    },
  ],

  transferPrompts: [
    {
      id: 'p5-005-tp1',
      prompt: 'A cyclist\'s power output is roughly 300 W at their comfortable cruising speed of 8 m/s. Using P = Fv, calculate the drag force they overcome. At 12 m/s (50% faster), if drag scales as v², what power would they need? Why do cyclists stay in tight formation (drafting)?',
      connection: 'At 8 m/s: F_drag = P/v = 300/8 = 37.5 N. At 12 m/s: F_drag = 37.5 × (12/8)² = 84.4 N. P needed = 84.4 × 12 = 1013 W — over 3× more power for 50% more speed. Drafting reduces the drag force a rider faces, dramatically reducing power required.',
    },
    {
      id: 'p5-005-tp2',
      prompt: 'Instantaneous power P = dW/dt = F · v. From calculus, this is a derivative. If you know a force as a function of time F(t) and velocity as a function of time v(t), write the integral for total work done from t₁ to t₂.',
      connection: 'W = ∫P dt = ∫F(t)v(t) dt from t₁ to t₂. This is the general integral form. It reduces to Pt (for constant P) or Fv·Δt (for constant F and v), but the integral handles any time-varying case.',
    },
  ],

  debugging: [
    {
      id: 'p5-005-db1',
      scenario: 'A student calculates the power needed to lift a 500 kg elevator at 2 m/s as P = mgh/t = 500×9.8×2 = 9800 W, treating "2 m/s" as a height.',
      error: 'Confused velocity (m/s) with height (m). P = Fv, not F × (something with units of m/s that isn\'t v).',
      fix: 'Lifting force = mg = 4900 N. Velocity = 2 m/s. P = Fv = 4900 × 2 = 9800 W. (Same numerical answer here by coincidence, but the reasoning must be P = Fv with v as instantaneous speed.)',
    },
    {
      id: 'p5-005-db2',
      scenario: 'A student computes average power as P = W/t = 5000/60 ≈ 83 W but is asked for power in kW and reports 0.083 kW.',
      error: 'Correct calculation, correct kW conversion. This is a unit conversion check — let me give a real error.',
      fix: 'Actually: 83.3 W = 0.0833 kW. The answer 0.083 kW is correct. A real version: student gets P in horsepower (HP) and confuses it with kW. P = 0.111 HP is NOT the same as 0.111 kW — multiply HP × 0.746 to get kW.',
    },
  ],

  mastery: {
    targetLevel: 'Calculate average power P = W/t and instantaneous power P = Fv; convert between watts, kilowatts, and horsepower; explain why drag power scales as v³.',
    checklistItems: [
      'Can calculate average power from work and time, and work from power and time',
      'Can apply P = Fv for constant-force situations (lifting, constant-speed driving)',
      'Can explain the v³ scaling of drag power using P = Fv with F ∝ v²',
      'Can convert between W, kW, and HP',
    ],
    commonStruggles: [
      'Confusing "more power" with "more total work" — total work requires knowing the time',
      'Forgetting to convert minutes/hours to seconds when computing P = W/t',
    ],
    nextSteps: 'Lesson 6 synthesizes all five energy concepts in multi-step problems. You\'ll practice choosing which form of energy is relevant at each stage — the key skill for real engineering analysis.',
  },

  semantics: {
    core: [
      { symbol: 'P = W/t', meaning: 'average power — work done per unit time' },
      { symbol: 'P = Fv', meaning: 'instantaneous power — force times instantaneous velocity (from P = dW/dt = F dx/dt)' },
      { symbol: 'W (watt)', meaning: '1 W = 1 J/s — the SI unit of power' },
      { symbol: 'HP (horsepower)', meaning: '1 HP = 746 W — historical unit still common in engines' },
    ],
    rulesOfThumb: [
      'P = Fv at constant speed: the engine force exactly equals the drag/friction force.',
      'Drag power ∝ v³: doubling highway speed requires 8× the engine power.',
      'Human peak power: ~1000 W for athletes; ~100 W sustained for average adults.',
      'W = Pt only when power is constant — otherwise integrate: W = ∫P dt.',
      'Convert time to seconds before computing P = W/t.',
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Power vs Speed — The v³ Relationship',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Drag force model: F_drag = c_d * v^2
c_d = 0.5   # drag coefficient (N·s²/m²)
v = np.linspace(0, 40, 200)  # m/s up to ~144 km/h

F_drag = c_d * v**2       # force in N (∝ v²)
P_drag = F_drag * v       # power needed (= F*v ∝ v³)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

ax1.plot(v, F_drag, 'b-', linewidth=2)
ax1.set_xlabel('Speed v (m/s)'); ax1.set_ylabel('Drag Force F (N)')
ax1.set_title('Drag Force ∝ v²')
ax1.grid(True)

ax2.plot(v, P_drag/1000, 'r-', linewidth=2)
ax2.set_xlabel('Speed v (m/s)'); ax2.set_ylabel('Power needed (kW)')
ax2.set_title('Drag Power ∝ v³')
ax2.grid(True)
plt.tight_layout()
plt.show()

for speed in [20, 30, 40]:
    print(f"At {speed} m/s: F_drag = {c_d*speed**2:.0f} N, Power = {c_d*speed**3/1000:.1f} kW")`,
          prose: [
            '`F_drag = c_d * v**2` models aerodynamic drag — force proportional to speed squared. `P_drag = F_drag * v` then gives power ∝ v³ since we multiply v² by v.',
            'The left plot shows a parabola (drag force vs speed); the right shows a steeper cubic (power vs speed). The difference between them is a single factor of v — from the P = Fv relationship.',
            'The print statements show that going from 20→40 m/s (doubling speed) increases power by 8× — exactly the v³ cubic scaling, not v² or v.',
          ],
        },
        {
          cellTitle: 'Human Power Output',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Compare power outputs: walking, cycling, sprinting
activities = ['Walking\\n(1.5 m/s)', 'Cycling\\n(8 m/s)', 'Jogging\\n(4 m/s)', 'Elite sprint\\n(12 m/s)']
speeds = [1.5, 8.0, 4.0, 12.0]
forces = [60, 40, 50, 120]  # approximate drag/resistance N

powers = [f * v for f, v in zip(forces, speeds)]

fig, ax = plt.subplots(figsize=(8, 5))
bars = ax.bar(activities, powers, color=['blue', 'green', 'orange', 'red'], alpha=0.7)
ax.set_ylabel('Power (W)')
ax.set_title('Human Power Output — P = Fv at different activities')
for bar, p in zip(bars, powers):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 5,
            f'{p:.0f} W', ha='center', fontsize=10)
ax.grid(True, axis='y')
plt.tight_layout()
plt.show()`,
          prose: [
            '`powers = [f * v for f, v in zip(forces, speeds)]` applies P = Fv to each activity. The force is the resistance each person overcomes — walking slow has less force but also less speed.',
            'The bar chart shows that cycling gives high power not from brute force but from high speed — a cyclist overcomes much less force than a sprinter but sustains higher speed longer.',
            'These numbers show why power is a better measure of athletic performance than force alone: a cyclist generating 320 W is doing meaningful physical work at a sustained rate.',
          ],
        },
        {
          cellTitle: 'Power vs Time — Work Accumulation',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

t = np.linspace(0, 60, 600)  # 0 to 60 seconds

# Constant power
P_const = 500  # W
W_const = P_const * t

# Variable power (e.g., engine spinning up)
P_variable = 200 + 600 * (1 - np.exp(-t/15))  # ramps up
W_variable = np.cumsum(P_variable) * (t[1] - t[0])  # numerical integration

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

ax1.plot(t, P_const * np.ones_like(t), 'b-', linewidth=2, label='Constant 500 W')
ax1.plot(t, P_variable, 'r-', linewidth=2, label='Variable (ramps up)')
ax1.set_xlabel('Time (s)'); ax1.set_ylabel('Power (W)')
ax1.set_title('Power vs Time')
ax1.legend(); ax1.grid(True)

ax2.plot(t, W_const/1000, 'b-', linewidth=2, label='W = Pt (constant P)')
ax2.plot(t, W_variable/1000, 'r-', linewidth=2, label='W = ∫P dt (variable P)')
ax2.set_xlabel('Time (s)'); ax2.set_ylabel('Work (kJ)')
ax2.set_title('Work Accumulation')
ax2.legend(); ax2.grid(True)
plt.tight_layout()
plt.show()`,
          prose: [
            '`W_const = P_const * t` implements W = Pt for constant power — a linear accumulation. `np.cumsum(P_variable) * dt` numerically integrates variable power using the Riemann sum.',
            'The left plot shows power vs time; the right shows total work accumulated. For constant power, work grows linearly. For ramping power, work grows faster as power increases.',
            'This shows the general relationship: W = ∫P dt. The simple W = Pt is just the special case when P is constant.',
          ],
        },
        {
          cellTitle: 'Challenge — Engine Power and Efficiency',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          prompt: 'A 150 HP car engine has 25% thermal efficiency (only 25% of fuel energy becomes useful work). At 100 km/h, air drag force = 500 N. (1) Convert 150 HP to watts. (2) Find the speed at which engine power equals drag power (P = Fv with F_drag = 0.5v²). (3) How much fuel energy (in joules) is burned per hour at 100 km/h?',
          starterCode: `import numpy as np

HP_engine = 150
efficiency = 0.25
speed_kmh = 100
c_d = 0.5  # drag coefficient (N·s²/m²)

# TODO: P_engine_watts = HP_engine * 746  (1 HP = 746 W)
# TODO: speed at which P_engine = drag power: P = c_d * v^3
# solve: c_d * v^3 = P_engine_watts → v = (P/c_d)^(1/3)
# TODO: at 100 km/h, find drag power
# TODO: fuel energy per hour = drag_power * 3600 / efficiency`,
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Power vs Speed — v³ Scaling',
          type: 'code',
          language: 'matlab',
          code: `% Drag power vs speed
c_d = 0.5;  % drag coefficient N·s²/m²
v = linspace(0, 40, 200);

F_drag = c_d * v.^2;
P_drag = F_drag .* v;  % P = F*v ∝ v^3

figure;
subplot(1,2,1)
plot(v, F_drag, 'b-', 'LineWidth', 2)
xlabel('Speed v (m/s)'); ylabel('Drag Force (N)')
title('F_{drag} ∝ v^2'); grid on

subplot(1,2,2)
plot(v, P_drag/1000, 'r-', 'LineWidth', 2)
xlabel('Speed v (m/s)'); ylabel('Power (kW)')
title('P_{drag} ∝ v^3'); grid on

fprintf('v=20 m/s: P=%.1f kW\\n', c_d*20^3/1000)
fprintf('v=40 m/s: P=%.1f kW (%.0fx larger)\\n', c_d*40^3/1000, (40/20)^3)`,
          prose: [
            '`P_drag = F_drag .* v` uses element-wise multiplication to compute P at each speed. The `.` is essential for vector operations in MATLAB.',
            'The fprintf output shows that doubling speed (20→40 m/s) increases power by exactly 8× — the v³ cubic scaling. This explains why fuel economy drops so sharply at highway speeds.',
            'The two plots differ by one power of v: left is v², right is v³. One extra multiplication by v converts the force plot into the power plot.',
          ],
        },
        {
          cellTitle: 'Work from Variable Power',
          type: 'code',
          language: 'matlab',
          code: `% Work from constant vs variable power
t = linspace(0, 60, 600);
dt = t(2) - t(1);

P_const = 500 * ones(size(t));
P_var   = 200 + 600*(1 - exp(-t/15));

W_const = P_const * dt;  % scalar × scalar = scalar per step
W_const_total = cumsum(P_const) * dt;
W_var_total   = cumsum(P_var) * dt;

figure;
subplot(1,2,1)
plot(t, P_const, 'b-', 'LineWidth', 2); hold on
plot(t, P_var, 'r-', 'LineWidth', 2)
xlabel('Time (s)'); ylabel('Power (W)')
legend('Constant 500W', 'Ramping up'); title('Power vs Time'); grid on

subplot(1,2,2)
plot(t, W_const_total/1000, 'b-', 'LineWidth', 2); hold on
plot(t, W_var_total/1000, 'r-', 'LineWidth', 2)
xlabel('Time (s)'); ylabel('Work (kJ)')
legend('W = Pt', 'W = ∫P dt'); title('Work Accumulation'); grid on`,
          prose: [
            '`cumsum(P) * dt` is a Riemann sum approximating W = ∫P dt. At each time step, we add P×dt to the running total.',
            'For constant power, `W_const_total` grows linearly — this is W = Pt. For ramping power, the growth accelerates as more power is delivered per second.',
            'The two plots together show: power drives the rate of work accumulation. The area under a P(t) curve equals the total work done — just like force-displacement for spatial problems.',
          ],
        },
        {
          cellTitle: 'Engine Power and Drag Balance',
          type: 'code',
          language: 'matlab',
          code: `% Find top speed: engine power balances drag power
P_engine = 150 * 746;  % 150 HP in watts
c_d = 0.5;             % N·s²/m²

% At top speed: P_engine = c_d * v^3
% Solve: v = (P_engine / c_d)^(1/3)
v_max = (P_engine / c_d)^(1/3);

v = linspace(0, v_max * 1.2, 300);
P_drag = c_d * v.^3;
P_eng  = P_engine * ones(size(v));

figure;
plot(v * 3.6, P_drag/1000, 'b-', 'LineWidth', 2); hold on
plot(v * 3.6, P_eng/1000, 'r--', 'LineWidth', 2)
xlabel('Speed (km/h)'); ylabel('Power (kW)')
title('Engine vs Drag Power — Intersection is Top Speed')
legend('Drag power', 'Engine power')
grid on
xline(v_max * 3.6, 'g--', sprintf('Top speed: %.0f km/h', v_max*3.6))`,
          prose: [
            '`v_max = (P_engine / c_d)^(1/3)` solves P_engine = c_d × v³ analytically. The top speed occurs where the available engine power exactly equals the power required to overcome drag.',
            '`v * 3.6` converts m/s to km/h for the plot axis — a practical unit conversion for speeds.',
            'The intersection point on the graph is the top speed: engine power = drag power means no net work is available to accelerate further. This is how automotive engineers determine theoretical top speeds.',
          ],
        },
        {
          cellTitle: 'Challenge — Elevator Motor Sizing',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          prompt: 'An elevator carries up to 800 kg of passengers plus 400 kg car weight, rising 50 m at 3 m/s. Counterweights offset 600 kg. (1) What net mass must the motor lift? (2) What is the lifting force? (3) What power is required? (4) Add 30% efficiency loss — what is the motor\'s rated power? Print all results.',
          starterCode: `% Elevator motor power sizing
m_passengers = 800;  % kg
m_car = 400;         % kg
m_counterweight = 600; % kg (reduces net load)
v = 3;               % m/s lift speed
g = 9.8;             % m/s^2
efficiency = 0.70;   % 70% mechanical efficiency

% TODO: m_net = total mass - counterweight
% TODO: F_lift = m_net * g
% TODO: P_mechanical = F_lift * v
% TODO: P_rated = P_mechanical / efficiency
% TODO: fprintf all results and convert to kW`,
        },
      ],
    },
  },
}

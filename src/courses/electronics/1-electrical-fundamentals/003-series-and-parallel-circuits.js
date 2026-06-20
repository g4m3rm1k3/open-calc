export default {
  id: 'elec0-003',
  slug: 'series-and-parallel-circuits',
  chapter: 'elec0',
  order: 3,
  title: 'Series and Parallel Circuits',
  subtitle: 'How loads share voltage (series) vs. share current (parallel) — and why almost every real circuit is a combination of both.',
  tags: ['series circuits', 'parallel circuits', 'voltage divider', 'current divider', 'Kirchhoff', 'industrial wiring'],
  aliases: 'series parallel combination circuits KVL KCL voltage divider current divider',
  timeToComplete: 25,
  coreConcept: 'In a series circuit, same current flows through all components and voltage splits proportionally to resistance. In a parallel circuit, same voltage appears across all branches and current splits inversely to resistance. All real circuits are combinations of these two patterns.',
  prerequisites: ['elec0-001', 'elec0-002'],
  nextLesson: 'ac-vs-dc',

  hook: {
    question: "A PLC output energizes a 24V relay coil, which then closes contacts that power a solenoid valve. Why does the relay click but the solenoid barely moves — and how do you find the fault with a voltmeter?",
    realWorldContext: "This exact scenario repeats on factory floors every day: a circuit has multiple loads wired in ways that interact, and something in the chain is failing. To diagnose it, you need to understand how voltage distributes across loads in series, how current splits through parallel branches, and how to use Kirchhoff's laws to predict what your voltmeter should read at every test point before you even pick it up.",
  },

  mentalModel: [
    "**Series = same current, voltage splits.** Think of water through a single pipe with multiple constrictions (resistances). The same flow rate passes through every constriction, but each one creates a pressure drop proportional to how constricting it is. The pressure drops must add up to the total supply pressure.",
    "**Parallel = same voltage, current splits.** Think of water through multiple parallel pipes from the same source. Every pipe has the same pressure (voltage) applied. The flow through each pipe depends only on that pipe's resistance. Total flow is the sum of all branches.",
    "**Kirchhoff's Laws are conservation laws.** KVL (voltage law): energy around a loop must balance — voltage rises equal voltage drops. KCL (current law): charge doesn't accumulate at a node — current in equals current out. These are just conservation of energy and conservation of charge written as circuit equations.",
  ],

  intuition: {
    prose: [
      "**Series circuits — everything in a single loop.** When you wire two loads in series — say a limit switch and a relay coil — there's only one path for current. The same current flows through both. This means: if either component opens (infinite resistance), current stops everywhere. That's the principle behind series interlocks — wire all safety switches in series with the output coil. Any open switch kills the output. The voltage from the supply splits across the loads proportionally: a component with twice the resistance gets twice the voltage drop.",
      "**Kirchhoff's Voltage Law (KVL).** Travel around any closed loop in a circuit, adding voltage rises and subtracting voltage drops — you always end up at zero. For a series circuit: V_supply = V_1 + V_2 + V_3 + ... This is conservation of energy: the energy put in by the source exactly equals the energy dissipated by all the loads. When diagnosing a circuit with a voltmeter, KVL tells you exactly what to expect at each test point — and what an unexpected reading means.",
      "**Parallel circuits — multiple paths.** When you wire loads in parallel — like multiple solenoids all connected to the same 24V bus — each gets the full 24V regardless of how many others are connected. Adding more parallel loads draws more total current from the supply (lower total resistance) but doesn't affect the voltage. This is how almost all industrial loads are wired: the 24V bus is common, and each device taps into it independently. If one solenoid fails (opens), the others keep working.",
      "**Kirchhoff's Current Law (KCL).** At any junction in a circuit, the sum of currents flowing in equals the sum flowing out. For parallel branches: I_total = I_1 + I_2 + I_3 + ... The supply must deliver enough current for all branches. This is why you calculate total current draw before sizing your power supply and fuse — every parallel branch adds to the total.",
      "**Most real circuits are series-parallel combinations.** A typical PLC output circuit: the PLC output transistor (series), a fuse (series), a relay coil (series) — these form a series string. That relay's contacts then close, powering a parallel bank of solenoids. Understanding how to break complex circuits into series and parallel sub-networks is the core skill for circuit analysis and fault finding.",
      "**Voltage measurement tells you where the problem is.** With KVL in mind, you can diagnose any series circuit by measuring voltage across each component. Measure 0V across a component that should have voltage: it's a short (too little resistance). Measure full supply voltage across a component that should have partial voltage: something upstream is open (broken wire, open contact) — the dead load is showing you full voltage because no current is flowing and there's no drop elsewhere.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Series Circuit Rules',
        body: '**Current:** Same through all components: $I_{total} = I_1 = I_2 = \\ldots$\n\n**Resistance:** Adds directly: $R_{total} = R_1 + R_2 + \\ldots$\n\n**Voltage:** Splits proportionally: $V_n = V_{supply} \\cdot \\dfrac{R_n}{R_{total}}$\n\n**Voltage sum:** $V_{supply} = V_1 + V_2 + \\ldots$ (KVL)',
      },
      {
        type: 'theorem',
        title: 'Parallel Circuit Rules',
        body: '**Voltage:** Same across all branches: $V = V_1 = V_2 = \\ldots$\n\n**Resistance:** Reciprocals add: $\\dfrac{1}{R_{total}} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2} + \\ldots$\n\n**Two resistors:** $R_{total} = \\dfrac{R_1 \\cdot R_2}{R_1 + R_2}$\n\n**Current:** Splits inversely to resistance: $I_n = \\dfrac{V}{R_n}$\n\n**Current sum:** $I_{total} = I_1 + I_2 + \\ldots$ (KCL)',
      },
      {
        type: 'procedure',
        title: 'Voltmeter Fault Diagnosis in a Series Circuit',
        body: 'With power ON, measure voltage across each component in the series loop:\n\n**Expected result (normal):** Voltage split across each component proportional to resistance.\n\n**Component reads 0V (should have voltage):** That component is shorted — resistance near zero, no drop.\n\n**Component reads full supply voltage:** There is an open circuit ELSEWHERE in the loop — the break is between this component and the supply. No current flows, so this component shows full supply voltage by default.\n\n**All components read 0V:** Power supply fault or blown fuse — no voltage anywhere.',
      },
      {
        type: 'insight',
        title: 'Why Safety Interlocks Are Wired in Series',
        body: "Series wiring means ALL contacts must be closed for current to flow. Wire every safety switch — door guard, E-stop, light curtain, pressure switch — in series with the enable coil. Any single open contact kills the output. This is the fundamental principle of safety circuits: failure-safe means the default state (open contact) is SAFE (output off). Adding a new interlock is just adding another contact to the series string — no redesign required.",
      },
      {
        type: 'insight',
        title: 'Why Loads Are Wired in Parallel',
        body: "Parallel wiring means every load gets full supply voltage, and each works independently. If you wired solenoids in series, the voltage would split across them and none would get the full 24V they need. Parallel is the only practical way to run multiple loads from one supply. The tradeoff: each added load increases total current demand from the supply.",
      },
      {
        type: 'warning',
        title: 'The Current Spike When Adding Parallel Loads',
        body: "Every time you add a parallel branch, total current increases and effective resistance decreases. Adding a 240Ω solenoid to a 24V bus draws 100mA more. Add 20 solenoids and you've added 2A. If your power supply or fuse wasn't sized for this, things start to fail — not the new device, but the power supply or the wire feeding it. Always recalculate total current draw before adding loads to an existing panel.",
      },
    ],
    visualizations: [
      {
        id: 'SeriesParallelViz',
        title: 'Series, Parallel & Mixed Circuits',
        mathBridge: 'Switch between Series, Parallel, and Mixed modes. Adjust resistances and voltage. Watch KVL (series: voltages sum to source) and KCL (parallel: currents sum to total) play out in real numbers.',
      },
    ],
  },

  math: {
    prose: [
      "**Kirchhoff's Voltage Law (KVL):** The algebraic sum of all voltages around any closed loop equals zero:\n\n$$\\sum V = 0 \\quad \\Rightarrow \\quad V_s = V_1 + V_2 + \\cdots + V_n$$\n\nThis is conservation of energy expressed as a circuit equation.",
      "**Kirchhoff's Current Law (KCL):** The algebraic sum of all currents at any node equals zero:\n\n$$\\sum I_{\\text{in}} = \\sum I_{\\text{out}}$$\n\nCurrent into a junction equals current out. Charge cannot accumulate.",
      "**Voltage divider formula.** For two series resistors from supply $V_s$:\n\n$$V_2 = V_s \\cdot \\frac{R_2}{R_1 + R_2}$$\n\nThis is how resistive sensor networks, pull-up circuits, and reference voltage dividers work.",
      "**Current divider formula.** For two parallel resistors with total current $I_T$:\n\n$$I_1 = I_T \\cdot \\frac{R_2}{R_1 + R_2}$$\n\nNote the crossover: $I_1$ uses $R_2$ in the numerator. The branch with less resistance carries more current.",
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Equivalent Resistance for N Identical Parallel Resistors',
        body: 'If you have N identical resistors each of value R in parallel:\n\n$$R_{\\text{total}} = \\frac{R}{N}$$\n\nEach added identical load halves the total resistance if you started with one. 10 identical solenoids in parallel = 1/10 the resistance of one solenoid. Used constantly to quickly estimate total current draw in panels with many identical loads.',
      },
    ],
  },

  challenges: [
    {
      problem: 'Two 100Ω resistors are wired in series across a 12V supply. Find the total resistance, the current, and the voltage drop across each resistor.',
      hint: 'In a series circuit, resistances add and the same current flows through all components.',
      walkthrough: [
        'Total resistance: R_total = 100 + 100 = 200Ω',
        'Current: I = V / R_total = 12 / 200 = 0.06A = 60mA',
        'Voltage drop across each resistor: V = I × R = 0.06 × 100 = 6V',
        'Check KVL: 6V + 6V = 12V ✓',
      ],
      answer: 'R_total = 200Ω, I = 60mA, V across each = 6V',
      difficulty: 'easy',
    },
    {
      problem: 'The same two 100Ω resistors are now wired in parallel across 12V. Find the equivalent resistance, total current from the supply, and current through each branch.',
      hint: 'For two equal resistors in parallel, R_eq = R/2. Each branch sees the full supply voltage.',
      walkthrough: [
        'Equivalent resistance: R_eq = (100 × 100) / (100 + 100) = 10000 / 200 = 50Ω',
        'Total current: I_total = V / R_eq = 12 / 50 = 0.24A = 240mA',
        'Current through each branch: I = V / R = 12 / 100 = 0.12A = 120mA',
        'Check KCL: 120mA + 120mA = 240mA ✓',
      ],
      answer: 'R_eq = 50Ω, I_total = 240mA, I per branch = 120mA',
      difficulty: 'medium',
    },
    {
      problem: 'A relay coil (480Ω) has a 24V indicator light (560Ω) wired in parallel with it across a 24V supply. Find the current through the relay coil, the current through the indicator, and the total current drawn from the supply.',
      hint: 'In a parallel circuit, both branches share the same 24V. Calculate each branch current independently, then sum for total.',
      walkthrough: [
        'Both branches are across the same 24V supply',
        'Current through relay coil: I_coil = 24 / 480 = 0.05A = 50mA',
        'Current through indicator: I_indicator = 24 / 560 ≈ 0.0429A ≈ 42.9mA',
        'Total current: I_total = 50mA + 42.9mA = 92.9mA ≈ 93mA',
        'Equivalent parallel resistance: R_eq = (480 × 560) / (480 + 560) = 268,800 / 1040 ≈ 258.5Ω',
      ],
      answer: 'I_coil = 50mA, I_indicator ≈ 42.9mA, I_total ≈ 92.9mA',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Diagnosing the relay-solenoid problem',
      problem: 'A 24V circuit has: PLC output (internal resistance ~50Ω when on), relay coil (200Ω), and then a solenoid (600Ω) powered through the relay contact. The relay clicks but the solenoid barely actuates. What does your voltmeter say?',
      solution: 'Measure across the relay coil: V = 24 × (200/(50+200)) = 24 × 0.8 = 19.2V ✓\n\nNow check the solenoid circuit (relay contact closed, wire going to solenoid): if you read only 18V at the solenoid terminals instead of 24V, there\'s a 6V drop somewhere — likely a corroded relay contact (which adds resistance in series) or undersized wiring.\n\nIf you read 0V at the solenoid: the relay contact isn\'t actually closing — mechanical fault in the relay.',
    },
    {
      title: '24V bus current calculation',
      problem: 'A 24VDC bus powers: 20 proximity sensors (10mA each), 8 relay coils (50mA each), 4 solenoids (120mA each), and a PLC I/O backplane (350mA). Size the power supply and main fuse.',
      solution: 'I = (20×10) + (8×50) + (4×120) + 350\n   = 200 + 400 + 480 + 350 = 1,430mA = 1.43A\n\nPower supply: 1.43A × 1.25 (NEC factor) × 1.25 (headroom) ≈ 2.2A minimum → choose 3A or 5A supply\n\nMain fuse: 3A fast-blow (protects the wiring at the supply output)\n\nNote: supply should be rated ≥ 1.25× continuous load. A 5A supply at 1.43A runs at 29% capacity — ideal.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'In a series circuit with three safety switches and a relay coil, what happens when any single switch opens?',
      options: [
        'Current is reduced by one-third — the remaining two switches carry the load',
        'Current stops everywhere — all switches must be closed for any current to flow',
        'The relay coil gets more voltage since it now shares with fewer components',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'You add a third solenoid in parallel to a 24V bus that already has two. What happens to the voltage each solenoid receives?',
      options: [
        'The voltage across each solenoid drops because the supply must share with more devices',
        'Each solenoid still gets the full 24V — parallel branches all see the same voltage',
        'The voltage increases because the lower total resistance draws more power',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'You measure full supply voltage across a component in a series circuit that should only have a partial voltage drop. What does this tell you?',
      options: [
        'That component has a short circuit — its resistance dropped to near zero',
        'There is an open circuit elsewhere in the loop; no current flows so this component shows full voltage',
        'The power supply voltage has increased — check the supply output first',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Kirchhoff\'s Current Law says the current at any junction sums to zero. What physical principle does this represent?',
      options: [
        'Conservation of energy — the voltage drops around a loop must balance',
        'Conservation of charge — charge cannot accumulate at a node; current in equals current out',
        'Ohm\'s Law — resistance determines how current distributes across branches',
      ],
      correct: 1,
    },
  ],
};

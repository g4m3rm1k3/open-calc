export default {
  id: 'elec0-001',
  slug: 'voltage-current-resistance',
  chapter: 'elec0',
  order: 1,
  title: 'Voltage, Current, and Resistance',
  subtitle: 'The three quantities that govern every electrical circuit — and why getting them wrong destroys components.',
  tags: ['voltage', 'current', 'resistance', 'ohms law', 'DC circuits', 'industrial electrical'],
  aliases: 'volts amps ohms VIR basic electricity what is voltage what is current',
  timeToComplete: 25,
  coreConcept: 'Voltage is electrical pressure. Current is the flow that pressure drives. Resistance is what fights that flow. Ohm\'s Law (V = IR) links all three — change any one and the others must respond.',
  prerequisites: [],
  nextLesson: 'ohms-law-and-power',

  hook: {
    question: "Why does a 24V solenoid valve run cool under normal operation but burn up when a wire shorts to ground — even though it's the same 24V supply?",
    realWorldContext: "Open any CNC control cabinet and you'll find a 24VDC bus running to dozens of sensors, solenoids, relays, and indicator lights. Every single one of those devices depends on three numbers: how much electrical pressure is pushing (voltage), how much charge is actually flowing (current), and how much the device fights that flow (resistance). A solenoid coil is designed for a specific resistance — say 240Ω — which limits current to 100mA at 24V. Short the coil's terminals together and resistance drops toward zero. Current spikes. Power dissipated as heat explodes. The coil burns. Same voltage, completely different outcome. Understanding V, I, and R is not academic — it's how you diagnose every electrical fault you'll ever see.",
  },

  mentalModel: [
    "**The water system analogy.** Voltage is water pressure from a pump. Current is the flow rate through the pipe — gallons per minute. Resistance is the narrowness of the pipe. High pressure (voltage) through a narrow pipe (high resistance) gives low flow (low current). Cut the pipe diameter in half (double resistance) and you roughly halve the flow. This analogy gets you 80% of the way there.",
    "**Where the analogy breaks down.** Water doesn't care which direction it flows; electrons in DC circuits have a specific direction (from negative terminal to positive, though conventional current is drawn the opposite way). Also, water pressure depends on height; voltage depends on potential difference — it's meaningless to say '12V' without saying 12V relative to what. Always think 'voltage across' and 'current through'.",
    "**Potential difference, not absolute level.** A bird can sit on a 10,000V power line and be fine — because both feet are at the same voltage. No potential difference across the bird = no current through the bird. Your 24VDC panel is safe to touch one wire at a time for the same reason. It's the difference that drives current.",
  ],

  intuition: {
    prose: [
      "**Voltage (V) — electrical pressure.** Every electrical source — battery, power supply, generator — creates a difference in electrical potential between two points. We call this difference the *voltage*, measured in **volts** (V), named after Alessandro Volta. A 24V DC power supply maintains exactly 24 volts between its positive and negative terminals. That potential difference is what pushes electrons through any circuit you connect across those terminals. With nothing connected, the full 24V sits there waiting — like water pressure in a sealed pipe.",
      "**Current (I) — the actual flow.** Connect a load (resistor, solenoid, sensor) across those terminals and electrons start moving. The rate of that movement — how many electrons pass a point per second — is the *current*, measured in **amperes** (A), named after André-Marie Ampère. The symbol is I (from the French *intensité du courant*). Small currents are measured in milliamps (mA): 1000 mA = 1 A. Industrial 24V control circuits typically run sensors and solenoids at 10–200mA. Your circuit breaker trips at 10–15A for a 120V household circuit. Current is what actually does the work — heats the element, spins the motor, activates the solenoid.",
      "**Resistance (R) — opposition to flow.** Every material that carries current has some opposition to it, called *resistance*, measured in **ohms** (Ω), named after Georg Simon Ohm. A copper wire has very low resistance — nearly zero — which is why we use it to carry current long distances with minimal loss. The resistive element inside a solenoid coil, a heater, or a control relay has specific resistance by design. That resistance, combined with the supply voltage, determines exactly how much current flows. Change the resistance and you change the current, even with the same voltage.",
      "**Ohm's Law — the relationship.** These three quantities are locked together by a remarkably simple equation discovered by Georg Ohm in 1827: V = IR. Voltage equals current times resistance. Rearrange it: I = V/R (given voltage and resistance, find current), or R = V/I (given voltage and current, find resistance). This equation governs every DC circuit. It tells you that doubling the resistance halves the current for the same voltage. It tells you that if current suddenly doubles (because resistance dropped), something is wrong — maybe a dead short. Every fault you diagnose on a CNC machine, robot, or conveyor eventually comes back to this equation.",
      "**Industrial voltage levels to know.** On the machines you work on: **24VDC** is the universal control circuit voltage — sensors, solenoids, PLC I/O, indicator lights. **120VAC** runs single-phase motors, HMI screens, transformers. **240VAC / 480VAC** runs large motor drives and spindle motors. **4–20mA** is the analog signal range for sensors (pressure, temperature, position) — this is current, not voltage, specifically because current is immune to voltage drops over long cable runs.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Voltage (V)',
        body: '**Voltage** is the electrical potential difference between two points, measured in **volts (V)**. It is the "pressure" that drives current through a circuit. Symbol: **V** (sometimes **E** for EMF in older texts). Always measured *across* two points — you need two test leads to measure it. A 24V supply maintains 24V between its + and − terminals.',
      },
      {
        type: 'definition',
        title: 'Current (I)',
        body: '**Current** is the rate of flow of electric charge, measured in **amperes (A)**. Symbol: **I**. 1 ampere = 1 coulomb of charge per second ≈ 6.24 × 10¹⁸ electrons per second. Always measured *through* a component — your test lead must be in series with the circuit. Small currents: mA (milliamps) = 0.001 A. Dangerous current to the human body: as low as 10mA through the heart.',
      },
      {
        type: 'definition',
        title: 'Resistance (R)',
        body: '**Resistance** is the opposition to current flow, measured in **ohms (Ω)**. Symbol: **R**. A resistor with 100Ω passes 1A when 100V is applied (V = IR → 100 = 1 × 100). Resistance comes from the material\'s atomic structure — copper is ~0.000017 Ω·m; nichrome (heater wire) is ~1.1 Ω·m — 65,000× more resistive. Resistance increases with temperature for most metals.',
      },
      {
        type: 'theorem',
        title: "Ohm's Law",
        body: 'V = I × R\n\nThe voltage across a resistive element equals the current through it multiplied by its resistance. All three forms are equally valid:\n\n• V = IR  (find voltage)\n• I = V/R  (find current)\n• R = V/I  (find resistance)\n\nValid for DC circuits and resistive AC loads. Does not directly apply to capacitors or inductors (they have reactance, not pure resistance).',
      },
      {
        type: 'procedure',
        title: 'Fault Diagnosis with Ohm\'s Law',
        body: 'When a 24V solenoid won\'t energize:\n\n1. Measure voltage across the solenoid terminals — should read ~24V. If 0V, the problem is upstream (blown fuse, open PLC output, broken wire).\n2. If 24V is present but coil is cold and valve won\'t move, measure resistance across coil terminals (with power OFF). A good 24V solenoid typically reads 60–300Ω. Open circuit (∞ Ω) = coil burned out. Near 0 Ω = shorted coil.\n3. If resistance is correct, calculate expected current: I = 24 / R. A 240Ω coil should draw 100mA. If measured current is much higher, something else in the circuit is pulling current.',
      },
      {
        type: 'insight',
        title: 'Why 24VDC for Industrial Control Circuits?',
        body: '24VDC became the global standard for PLC control circuits for several reasons: it\'s low enough that it\'s classified as SELV (Safety Extra Low Voltage) in most electrical codes — meaning it won\'t cause electrocution under normal conditions. It\'s high enough to reliably switch mechanical relays and drive solenoids. Switching-mode power supplies can efficiently produce it from 100–240VAC input. And it\'s just high enough that voltage drops over long cable runs in a factory are manageable.',
      },
      {
        type: 'warning',
        title: 'Voltage vs. Current: What Actually Kills',
        body: 'Electricians say "it\'s the current that kills, not the voltage" — and that\'s technically true. 100mA through the chest for 1 second is lethal. BUT: voltage determines whether current can flow through you. 24VDC generally cannot drive dangerous current through the resistance of dry skin (~100kΩ) — the math gives you ~0.24mA. 120VAC can. 480VAC absolutely can, and it will arc through sweat, gloves, and PPE. The voltage sets up the potential; your body\'s resistance determines the current. Respect both.',
      },
      {
        type: 'insight',
        title: '4–20mA Analog Signals and Why Current Beats Voltage Over Distance',
        body: 'A pressure transmitter 50 meters away in your factory sends a 4–20mA signal (4mA = 0%, 20mA = 100% of range). Why current? Because voltage drops across cable resistance (V = IR — the wire resistance causes a voltage drop). A 100mV drop on a 0–10V signal is a 1% error. But current is the same everywhere in a series circuit — the transmitter maintains 12mA no matter what the cable resistance is. The PLC reads 12mA and knows exactly what the pressure is. This is why every analog sensor in industrial automation uses 4–20mA.',
      },
      {
        type: 'insight',
        title: 'Why 4mA (not 0mA) for "zero"',
        body: 'The 4–20mA standard uses 4mA as the minimum (not 0mA) for a clever reason: if the wire breaks or the transmitter loses power, the signal drops to 0mA. The PLC can detect "I\'m getting 0mA — that\'s not a valid signal, that\'s a fault." If the minimum were 0mA, a broken wire and a true zero-reading would be indistinguishable. This is called a "live zero" — the non-zero minimum lets the system distinguish a valid low reading from a wiring fault.',
      },
    ],
    visualizations: [
      {
        id: 'CircuitLab',
        title: 'Ohm\'s Law — Interactive Circuit',
        mathBridge: 'Drag the voltage and resistance sliders. Watch current (I=V/R) and power (P=IV) update in real time. This is Ohm\'s Law as a live experiment.',
      },
    ],
  },

  math: {
    prose: [
      "Ohm's Law describes the relationship between voltage (V), current (I), and resistance (R) in a resistive circuit:\n\n$$V = I \\cdot R$$\n\nThis equation has three equivalent forms depending on what you're solving for:\n\n$$I = \\frac{V}{R} \\qquad R = \\frac{V}{I}$$",
      "**Power** is the rate of energy dissipation — how many watts (joules per second) a component converts from electrical energy to heat, light, or mechanical work. It combines with Ohm's Law to give three equivalent power formulas:\n\n$$P = IV = \\frac{V^2}{R} = I^2 R$$\n\nFor a 24V solenoid with 240Ω resistance: $I = 24/240 = 0.1\\text{ A}$, $P = 24 \\times 0.1 = 2.4\\text{ W}$.",
      "**Series circuits:** resistances add directly. Two 100Ω resistors in series give 200Ω total. The same current flows through every component, but the voltage splits proportionally:\n\n$$R_{\\text{total}} = R_1 + R_2 + \\cdots + R_n$$\n\n**Parallel circuits:** resistances combine as reciprocals. Two equal resistors in parallel halve the total resistance. The same voltage appears across every component, but current splits:\n\n$$\\frac{1}{R_{\\text{total}}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\cdots$$",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Power Equations',
        body: '$P = IV$ — power (watts) = current (amps) × voltage (volts)\n\n$P = V^2 / R$ — useful when you know voltage and resistance\n\n$P = I^2 R$ — useful when you know current and resistance\n\n1 watt = 1 joule per second of energy converted.',
      },
      {
        type: 'warning',
        title: 'Component Power Ratings',
        body: 'Every resistor, relay coil, and solenoid has a maximum power rating. A resistor rated at 0.25W will overheat and fail if you dissipate 1W through it. Always calculate P = I²R (or V²/R) and verify it\'s below the component\'s rating with some headroom. Industrial rule of thumb: derate to 50% of rated power for continuous use in a panel.',
      },
    ],
  },

  challenges: [
    {
      problem: 'A 24VDC PLC output drives a solenoid with 480Ω coil resistance. What current flows?',
      hint: 'Use I = V/R directly.',
      walkthrough: [
        'Identify knowns: V = 24V, R = 480Ω',
        'Apply Ohm\'s Law: I = V/R',
        'I = 24 / 480 = 0.05A = 50mA',
      ],
      answer: '50mA',
      difficulty: 'easy',
    },
    {
      problem: 'A CNC indicator light runs on 24VDC and draws 22mA. What is its internal resistance, and how much power does it dissipate?',
      hint: 'Use R = V/I to find resistance, then P = V × I for power.',
      walkthrough: [
        'Identify knowns: V = 24V, I = 22mA = 0.022A',
        'Find resistance: R = V/I = 24 / 0.022 ≈ 1,091Ω ≈ 1.1kΩ',
        'Find power: P = V × I = 24 × 0.022 = 0.528W',
      ],
      answer: 'R ≈ 1.1kΩ, P ≈ 0.528W',
      difficulty: 'medium',
    },
    {
      problem: 'A 4–20mA sensor loop operates on a 24V supply. What is the range of equivalent resistance seen by the supply as the signal varies from 4mA to 20mA?',
      hint: 'Use R = V/I at each end of the current range.',
      walkthrough: [
        'At 4mA (minimum signal): R = V/I = 24 / 0.004 = 6,000Ω = 6kΩ',
        'At 20mA (full-scale signal): R = V/I = 24 / 0.020 = 1,200Ω = 1.2kΩ',
        'The equivalent resistance ranges from 1.2kΩ (full scale) to 6kΩ (zero scale)',
        'Note: the loop transmitter actively regulates current, so the "resistance" is the transmitter\'s dynamic impedance, not a fixed resistor',
      ],
      answer: '1.2kΩ at 20mA to 6kΩ at 4mA',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'CNC machine indicator light',
      problem: 'A 24VDC indicator light on a CNC machine has a built-in resistor and is rated for 20mA. What is the internal resistance, and what power does it dissipate?',
      solution: 'R = V/I = 24 / 0.020 = 1,200 Ω (1.2 kΩ)\n\nP = V × I = 24 × 0.020 = 0.48 W\n\nThe internal resistance limits current to exactly 20mA. Power is well under 1W — the light runs cool.',
    },
    {
      title: 'Solenoid valve fault diagnosis',
      problem: 'A 24VDC solenoid normally draws 83mA. A technician measures only 8mA through it while 24V is confirmed at the terminals. What is wrong?',
      solution: 'Expected resistance: R = V/I = 24 / 0.083 ≈ 289 Ω\n\nAt 8mA with 24V: R = 24 / 0.008 = 3,000 Ω\n\nThe measured resistance is 10× higher than spec. This indicates a partially burned coil or a high-resistance connection (corroded terminal, damaged wire). The solenoid may click weakly but lacks enough magnetic force to open the valve.',
    },
    {
      title: 'Wire sizing for a 24V circuit',
      problem: 'You need to run 24VDC to a solenoid 30 meters away. The solenoid draws 200mA. The wire has 0.034 Ω per meter (18 AWG). How much voltage actually reaches the solenoid?',
      solution: 'Total wire resistance (there and back): 2 × 30 × 0.034 = 2.04 Ω\n\nVoltage drop in wire: V = IR = 0.200 × 2.04 = 0.41 V\n\nVoltage at solenoid: 24 − 0.41 = 23.59 V (acceptable)\n\nWith 16 AWG (0.013 Ω/m): drop = 2 × 30 × 0.013 × 0.200 = 0.16 V — even better. Industrial wiring standards typically require the voltage at the load to remain above 90% of nominal.',
    },
  ],
};

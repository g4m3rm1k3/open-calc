export default {
  id: 'elec0-002',
  slug: 'ohms-law-and-power',
  chapter: 'elec0',
  order: 2,
  title: "Ohm's Law and Power",
  subtitle: 'The two equations that predict every voltage, current, heat load, and wire size decision in an industrial panel.',
  tags: ["ohm's law", 'power', 'watts', 'voltage drop', 'heat', 'fusing', 'wire sizing'],
  aliases: 'V=IR P=IV power dissipation wattage heat load fuse sizing',
  timeToComplete: 25,
  coreConcept: "Ohm's Law (V = IR) predicts current from voltage and resistance. Power (P = IV) predicts heat from current and voltage. Together they govern every sizing decision: wire gauge, fuse rating, component power rating, and heat dissipation in a panel.",
  prerequisites: ['elec0-001'],
  nextLesson: 'series-and-parallel-circuits',

  hook: {
    question: "A control panel has 40 solenoids, each drawing 80mA at 24VDC. The 24V supply is 10 meters from the panel with 18 AWG wire. Will the wire get hot? Will the supply voltage drop enough to cause problems?",
    realWorldContext: "Every time an electrical engineer designs a panel or a maintenance tech adds devices to an existing one, they're implicitly doing Ohm's Law and power calculations. Get them wrong and you get nuisance fuse trips, warm wire (a fire hazard), solenoids that don't fully actuate, or sensors that read incorrectly. Get them right and the panel runs cool, the devices work reliably, and the fuses only blow when there's a real fault. These calculations take two minutes and can prevent hours of troubleshooting.",
  },

  mentalModel: [
    "**V = IR is a constraint, not a choice.** If you set the voltage (by choosing a power supply) and the resistance (by choosing a device), the current is not negotiable — it's exactly V/R. You cannot have 24V across a 240Ω coil and get anything other than 100mA. Nature enforces Ohm's Law.",
    "**Power is where electricity becomes physics.** P = IV converts electrical quantities into real-world effects: heat, light, motion. When current flows through resistance, electrical energy converts to heat at a rate of I²R watts. This is why a dead short (R → 0) causes catastrophic current and heat — the power delivered to the fault is enormous.",
    "**The three power formulas are one formula.** P = IV, P = V²/R, and P = I²R are all the same equation — just Ohm's Law substituted in different ways. Use whichever version has two knowns and one unknown. If you know V and R, use P = V²/R and skip calculating I separately.",
  ],

  intuition: {
    prose: [
      "**Ohm's Law — the complete picture.** You know V = IR. But the three arrangements are equally important: I = V/R tells you the current that will flow given a supply voltage and a load resistance. R = V/I tells you what resistance you need to limit current to a safe value. And when you hold two quantities fixed, the third is completely determined — there's no freedom. Set 24V across 480Ω and you get exactly 50mA. Period.",
      "**Where the power goes.** Electrical power (P = IV, measured in watts) is the rate of energy transfer. When current flows through a purely resistive load, all that power converts to heat. An LED rated at 20mA at 24V dissipates P = 0.024 × 24 = 0.576W — less than half a watt, barely warm. A 1kW spindle heater draws P = I, so I = P/V = 1000/240 = 4.17A and everything it touches gets hot. Understanding power tells you whether a component will run warm, cool, or burn.",
      "**The three forms of the power equation.** Substitute Ohm's Law into P = IV: if you replace V with IR, you get P = (IR)I = I²R. If you replace I with V/R, you get P = V(V/R) = V²/R. All three forms — P = IV, P = I²R, P = V²/R — are equivalent. Which one you use depends on which two quantities you know. For a resistor, if you know its resistance and the voltage across it, P = V²/R is fastest. If you know resistance and current, use P = I²R.",
      "**Voltage drop — Ohm's Law applied to wire.** Wire has resistance. Not much, but not zero. 18 AWG copper wire has about 0.021 Ω per meter. A 10-meter cable (20m there and back) has 0.42 Ω. Push 3.2A through it (40 solenoids × 80mA) and the voltage drop is V = IR = 3.2 × 0.42 = 1.34V. Your panel sees 24 − 1.34 = 22.66V instead of 24V. Most 24VDC devices tolerate ±15% (20.4V to 27.6V), so 22.66V is fine — but you need to check, not assume.",
      "**Fuse sizing — protect the wire, not the device.** A fuse's job is to protect the wire from overheating, not to protect the device. Wire ampacity (maximum safe current) depends on gauge: 18 AWG is rated for 2.3A in a conduit (NEC table values). If you run 3.2A through 18 AWG continuously, it will overheat. Upgrade to 16 AWG (rated 3.7A) or split the load. The fuse should be ≤ the wire's ampacity — if the fuse rating is higher than the wire can handle, the wire melts before the fuse blows.",
      "**Heat in a panel.** Add up the power dissipation of every device in a panel: PLC (5W), 24V supply losses (15W), 40 solenoid coils at 1.92W each (76.8W total), indicator lights (negligible). Panel internal dissipation ≈ 97W. That heat has to go somewhere — through the panel walls, or via a cooling fan or heat exchanger. Underestimate it and you get thermal trips on the PLC and drives, which manifest as mysterious intermittent faults on hot summer days.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: "Using Ohm's Law: Pick the Right Form",
        body: "Given voltage (V) and resistance (R): use **I = V/R** and **P = V²/R**\n\nGiven voltage (V) and current (I): use **R = V/I** and **P = IV**\n\nGiven current (I) and resistance (R): use **V = IR** and **P = I²R**\n\nWrite down what you know first, then pick the formula that has only one unknown.",
      },
      {
        type: 'insight',
        title: "Why Fuses Are Sized for Wire, Not Devices",
        body: "A device that fails can tolerate a moment of overcurrent — that's what its internal protection handles. But a wire that overheats from sustained overcurrent can melt insulation, arc, and start a fire before the device fails. The fuse must blow before the wire reaches its temperature limit. Rule: fuse rating ≤ wire ampacity. If a device needs 10A but the wire can only carry 7A safely, you need bigger wire — not a bigger fuse.",
      },
      {
        type: 'definition',
        title: 'Wire Gauge and Ampacity (AWG)',
        body: 'American Wire Gauge (AWG): **lower number = thicker wire = lower resistance = higher ampacity**.\n\nCommon gauges in control panels:\n- 22 AWG: 0.5A — sensor wiring, signal wires\n- 20 AWG: 1.5A — I/O wiring, small solenoids\n- 18 AWG: 2.3A — control wiring, 24VDC loads\n- 16 AWG: 3.7A — power wiring, multiple loads\n- 14 AWG: 15A — branch circuit wiring\n- 12 AWG: 20A — power feeds\n\nResistance (ohms/meter): 22AWG≈0.054, 18AWG≈0.021, 14AWG≈0.0083',
      },
      {
        type: 'warning',
        title: 'Inductive Loads: Current Lags Voltage',
        body: "Solenoids, relay coils, and motor windings are inductive. When you de-energize them, they generate a voltage spike (back-EMF) that can be 10× the supply voltage — enough to destroy PLC transistor outputs. Every inductive load on a DC circuit needs a **flyback diode** wired in reverse across the coil. On AC circuits, use an RC snubber or MOV. Ignoring this is why PLC output modules fail prematurely.",
      },
      {
        type: 'insight',
        title: 'Power Factor — Why AC Watts Aren\'t Just V×I',
        body: "For DC circuits and purely resistive AC loads: P = IV. True. But for inductive AC loads (motors, transformers), current is out of phase with voltage. Apparent power (VA) = V×I, but real power (W) = V×I×cos(φ), where φ is the phase angle. Power factor = cos(φ), typically 0.7–0.9 for motors. A motor drawing 10A at 240V has apparent power 2400VA but real power 2400 × 0.8 = 1920W. This is why motor drives are rated in kVA, not just kW, and why large factories pay a penalty for low power factor.",
      },
    ],
    visualizations: [
      {
        id: 'OhmViz',
        title: 'Power Dissipation — P=IV=I²R=V²/R',
        mathBridge: "Open the Power view. Move the sliders and notice: doubling voltage quadruples power (P = V²/R — the square relationship). Doubling resistance halves power. At 24V and 10Ω, power is 57.6W — a near-short that will melt wire. At 24V and 1kΩ, power is only 0.576W — barely warm.",
      },
    ],
  },

  math: {
    prose: [
      "The power equations are derived directly from Ohm's Law by substitution:\n\n$$P = IV \\quad \\xrightarrow{V = IR} \\quad P = I \\cdot IR = I^2 R$$\n\n$$P = IV \\quad \\xrightarrow{I = V/R} \\quad P = \\frac{V}{R} \\cdot V = \\frac{V^2}{R}$$",
      "**Voltage divider.** Two resistors in series share voltage proportionally to their resistance:\n\n$$V_1 = V_{\\text{supply}} \\cdot \\frac{R_1}{R_1 + R_2}$$\n\nThis is how analog sensors with resistive outputs work, and how pull-up resistors set voltage levels for digital inputs.",
      "**Wire voltage drop.** For a cable of length $L$ meters carrying current $I$ amps, with wire resistivity $\\rho$ ohms/meter:\n\n$$V_{\\text{drop}} = I \\cdot (2L \\cdot \\rho)$$\n\nThe factor of 2 accounts for both conductors (there and back). The voltage at the load is $V_{\\text{supply}} - V_{\\text{drop}}$.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Panel Heat Load Calculation',
        body: '1. List every device inside the panel\n2. For each device, find power dissipation from the datasheet (or calculate I²R for coils)\n3. Sum all power values → total watts dissipated inside the panel\n4. Determine how that heat escapes: natural convection (for sealed panels, ΔT ≈ watts × thermal resistance), fan cooling, or heat exchanger\n5. Verify PLC and drive operating temperature limits are not exceeded at worst-case ambient + internal heat',
      },
    ],
  },

  challenges: [
    {
      problem: 'A motor has a full-load amperage (FLA) of 8.5A. Per NEC, a continuous load fuse must be sized at 125% of FLA. What is the minimum fuse size?',
      hint: 'Multiply FLA by 1.25, then round up to the next standard fuse size.',
      walkthrough: [
        'Identify FLA: 8.5A',
        'Apply NEC 125% factor: 8.5 × 1.25 = 10.625A',
        'Round up to the next standard fuse size: 15A (standard sizes: 10A, 15A, 20A...)',
        'A 15A fuse is the minimum standard size that satisfies the NEC 125% continuous load rule',
      ],
      answer: '15A (next standard size above 10.625A)',
      difficulty: 'easy',
    },
    {
      problem: 'A 24VDC control circuit runs 50 meters of 1.5mm² wire (resistivity 0.012Ω/m) carrying 10A. What is the voltage drop, and what percentage of the 24V supply does it represent?',
      hint: 'Account for both conductors (there and back), then use V = IR. Percentage = (V_drop / 24) × 100.',
      walkthrough: [
        'Total wire length (there and back): 2 × 50m = 100m',
        'Total resistance: 100m × 0.012Ω/m = 1.2Ω',
        'Voltage drop: V = IR = 10A × 1.2Ω = 12V',
        'Percentage of supply: 12 / 24 × 100 = 50%',
        'This is an unacceptably large drop — devices would only see 12V instead of 24V. Upsize the wire significantly.',
      ],
      answer: '12V drop, 50% of 24V supply — unacceptable, upsize the wire',
      difficulty: 'medium',
    },
    {
      problem: 'An industrial panel contains eight 24VDC relays at 2W each and three 120V solenoids at 15W each. What is the total heat load in BTU/hr?',
      hint: 'Sum all watts first, then convert: 1W = 3.412 BTU/hr.',
      walkthrough: [
        'Relay heat: 8 × 2W = 16W',
        'Solenoid heat: 3 × 15W = 45W',
        'Total panel heat load: 16W + 45W = 61W',
        'Convert to BTU/hr: 61W × 3.412 BTU/hr per watt = 208.1 BTU/hr',
        'This value is used to size panel cooling fans or heat exchangers',
      ],
      answer: '61W = approximately 208 BTU/hr',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Fuse sizing for 24VDC panel',
      problem: 'A 24VDC panel powers 12 solenoid valves (each 80mA), 8 proximity sensors (each 15mA), and 1 PLC I/O module (200mA total). What fuse should protect the 24V feed?',
      solution: 'Total current: (12 × 80) + (8 × 15) + 200 = 960 + 120 + 200 = 1,280mA = 1.28A\n\nApply 125% safety factor (NEC continuous load): 1.28 × 1.25 = 1.6A\n\nChoose: 2A fast-blow fuse (next standard size up)\n\nWire: at 1.28A continuous, 20 AWG (rated 1.5A) is borderline — use 18 AWG (rated 2.3A) for the feed. The 2A fuse protects the 18 AWG wire adequately.',
    },
    {
      title: 'Resistor selection for indicator LED',
      problem: 'You need to wire a generic LED (Vf = 2.1V, max 20mA) to a 24VDC supply. What series resistor do you need, and what power rating must it have?',
      solution: 'Voltage across resistor: V = 24 - 2.1 = 21.9V\n\nRequired resistance: R = V/I = 21.9 / 0.020 = 1,095Ω → use 1.1kΩ standard value\n\nPower in resistor: P = I²R = (0.020)² × 1100 = 0.44W\n\nChoose: 1/2W resistor (0.5W). The 0.44W calculated is close to 1/4W (0.25W) limit — always derate by at least 50%, so 1/2W is correct. A 1/4W resistor would overheat and eventually fail.',
    },
    {
      title: 'Voltage drop check for remote panel',
      problem: 'A remote junction box 25m from the main panel needs 24VDC for 6 solenoids at 100mA each. The cable is 16 AWG (0.013 Ω/m). Is the voltage drop acceptable?',
      solution: 'Total current: 6 × 100mA = 600mA = 0.6A\n\nWire resistance (there and back): 2 × 25 × 0.013 = 0.65Ω\n\nVoltage drop: V = IR = 0.6 × 0.65 = 0.39V\n\nVoltage at junction box: 24 - 0.39 = 23.61V\n\nAcceptable: 24V ±15% means 20.4–27.6V allowed. 23.61V is well within spec.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'You set a 24V supply across a 480Ω coil. Can you choose a different current than what Ohm\'s Law gives?',
      options: [
        'Yes — you can adjust the current by changing the power supply\'s current limit setting',
        'No — voltage and resistance together fix the current at exactly 50mA with no wiggle room',
        'Only if the coil is inductive; resistive loads follow Ohm\'s Law but inductors do not',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A relay coil has 240Ω resistance and runs on 24V. What is the fastest way to calculate power dissipated without calculating current first?',
      options: [
        'P = IV — you must find current first, then multiply by voltage',
        'P = V²/R — use voltage and resistance directly to get 2.4W',
        'P = I²R — square the resistance and multiply by voltage',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why does a short circuit (near-zero resistance) cause such extreme heat and current?',
      options: [
        'The voltage source increases its output to compensate for the lower load resistance',
        'With resistance near zero, Ohm\'s Law forces enormous current, and P = I²R means power becomes catastrophic',
        'Short circuits only create heat if the wire insulation is already damaged',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'You need to add 15 more solenoids (80mA each) to an existing 24VDC panel. The feed wire is 18 AWG (rated 2.3A) and currently carries 1.8A. What should you check before adding the load?',
      options: [
        'Nothing — adding devices to an existing 24V bus is always safe up to the supply\'s rated output',
        'Whether 1.8A + 1.2A = 3.0A exceeds the 18 AWG wire\'s 2.3A ampacity, which it does — upgrade the wire',
        'Whether the solenoids\' resistance adds to the wire resistance, which would prevent Ohm\'s Law from applying',
      ],
      correct: 1,
    },
  ],
};

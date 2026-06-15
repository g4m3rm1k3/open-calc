export default {
  id: 'elec0-008',
  slug: 'sourcing-and-sinking',
  chapter: 'elec0',
  order: 8,
  title: 'Sourcing and Sinking I/O',
  subtitle: 'The most consistently misunderstood concept in PLC wiring — and the cause of more commissioning failures than almost anything else.',
  tags: ['sourcing', 'sinking', 'NPN', 'PNP', 'PLC input wiring', 'I/O module', 'common terminal', 'current flow'],
  aliases: 'sourcing sinking PLC input wiring NPN PNP current flow common terminal I/O wiring',
  timeToComplete: 20,
  coreConcept: 'Sourcing means the I/O module provides current (source = current flows out of module terminal). Sinking means the module receives current (sink = current flows into module terminal). The terms describe direction of conventional current flow, not logic levels. A sourcing output pairs with a sinking input, and vice versa.',
  prerequisites: ['elec0-006'],
  nextLesson: 'motor-starters-and-drives',

  hook: {
    question: "You wire a sensor to a PLC input exactly as you've done dozens of times. The sensor LED lights up when detecting, but the PLC input never turns on. You swap the sensor for a new one — same result. What is almost certainly wrong?",
    realWorldContext: "Sourcing/sinking mismatch is responsible for a significant fraction of PLC I/O wiring failures in the field. The sensor works. The PLC card works. The wiring is correct for the wrong type. Understanding this concept once — deeply — prevents hours of troubleshooting on every future commissioning job.",
  },

  mentalModel: [
    "**Conventional current flows from + to −.** This is the agreed convention even though electrons actually flow the other way. Conventional current enters a 'sink' (something that absorbs current) and exits a 'source' (something that provides current). In circuit terms: the + supply terminal is a source; the 0V terminal is a sink.",
    "**For I/O modules, the terms describe the module — not the sensor.** A 'sinking input' module sinks current — current flows INTO the input terminal. To make this happen, the sensor must source current to the input. A PNP sensor sources current → connects to sinking input. An NPN sensor sinks current → connects to sourcing input. They must be opposite types.",
    "**The common terminal is the key.** All I/O modules have a common terminal. For sinking modules, the common is connected to 0V (the module sinks current through its input terminals, which return to the common/0V). For sourcing modules, the common is connected to +24V (the module sources current from +V through each input back to the sensor's 0V).",
  ],

  intuition: {
    prose: [
      "**Sinking output modules (most common with NPN sensors).** A sinking output module's output transistors, when activated, connect the output terminal to 0V. Current path: +24V → load → output terminal → internal transistor → 0V. The module sinks the current through to 0V. The load (relay coil, solenoid, indicator) is connected between +24V and the output terminal. This is the most common type of output in North American and Asian-market PLCs.",
      "**Sourcing output modules (common with PNP sensors).** A sourcing output module's output transistors, when activated, connect the output terminal to +24V. Current path: +V → output terminal → load → 0V. The module sources current from the +V supply through the output terminal and into the load. The load is connected between the output terminal and 0V.",
      "**Sinking input modules (most common in industry).** The input module has a common terminal connected to 0V. When a field device (sensor, switch) applies +24V to the input terminal, current flows from the field device, into the input terminal, through the detection circuitry, to the common (0V). The module sinks this current. To use this module: apply +24V to the input terminal when you want a logic '1'. PNP sensors, which source +24V when active, connect directly to sinking input modules.",
      "**Sourcing input modules.** The common terminal is connected to +24V. When a field device connects the input terminal to 0V, current flows from the common (+24V), through detection circuitry, out the input terminal, to the field device, to 0V. The module sources current. NPN sensors, which sink to 0V when active, connect to sourcing input modules.",
      "**The mismatch scenario.** You have a sinking input module (common = 0V). You wire an NPN sensor (output sinks to 0V when active). When the sensor activates, it tries to pull the input terminal toward 0V — but the input expects to see +24V for a logic 1. Both the sensor and the module are trying to pull the signal to 0V, and neither is providing the +24V the module needs to detect a '1'. The LED on the sensor lights (sensor is working) but the PLC input never activates. Fix: use a PNP sensor, or use a pull-up resistor, or use a sourcing input module.",
      "**The practical rule for Fanuc and most Asian-market machines.** Fanuc CNC and PMC (PLC) inputs are sinking type — the common terminal is 0V. Wire PNP (sourcing) sensors to Fanuc inputs. Fanuc PMC outputs are also sinking (transistor to 0V) — wire loads between +24V and the output terminal, with the common at 0V. This is why Fanuc sensor specifications always call for PNP sensors.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Sourcing and Sinking — Quick Reference',
        body: 'From the perspective of the I/O MODULE:\n\n**Sinking input:** Current flows INTO the input terminal. Common = 0V. Pair with PNP sensors.\n\n**Sourcing input:** Current flows OUT OF the input terminal. Common = +24V. Pair with NPN sensors.\n\n**Sinking output:** Current flows INTO the output terminal. Output transistor connects to 0V. Load between +V and output.\n\n**Sourcing output:** Current flows OUT OF the output terminal. Output transistor connects to +V. Load between output and 0V.\n\n**Key rule: Sinking pairs with sourcing (opposite types connect together).**',
      },
      {
        type: 'procedure',
        title: 'Determining Input Card Type from Wiring Diagram',
        body: '1. Find the PLC input card in the wiring diagram.\n2. Look at the common terminal (COM, C, or 0V/+24V label).\n3. If COM is wired to 0V (DC negative): **sinking input** → use PNP sensors.\n4. If COM is wired to +24V (DC positive): **sourcing input** → use NPN sensors.\n5. If you can\'t find the diagram, power on the PLC and measure COM to +24V and COM to 0V with a multimeter. Low reading (near 0V) to +24V confirms COM is at 0V → sinking.',
      },
      {
        type: 'insight',
        title: 'Two-Wire Sensors — No NPN/PNP Issue',
        body: 'Two-wire sensors (only Brown +V and Blue 0V, no separate Black output wire) are series devices — they insert themselves into the circuit like a switch. When active, they pass current; when inactive, they block it. No NPN/PNP consideration needed. However: two-wire sensors have residual current (leakage) even when "off" — typically 0.5–1.5mA. If this leakage is enough to activate the PLC input (most inputs trigger at 2–5mA), the input never properly turns off. Use three-wire sensors when leakage is a concern.',
      },
      {
        type: 'warning',
        title: 'Mixing AC and DC I/O on the Same Common',
        body: 'Some older PLCs have I/O modules that can use either AC or DC inputs. The modules have a common terminal that connects either to AC neutral or DC 0V. Never mix AC and DC devices on the same common — the AC devices will couple AC voltage into the DC wiring, causing phantom inputs, noise-induced faults, and potentially damaging DC-only sensors and the PLC card. Keep AC and DC I/O on separate modules with separate commons.',
      },
    ],
    visualizations: [],
  },

  math: { prose: [], callouts: [] },

  examples: [
    {
      title: 'Wiring a PNP sensor to a Fanuc PMC input',
      problem: 'Fanuc 18i-MB PMC: Input X3.2 is available. Input cards use sinking-type inputs, common terminal connected to 0VDC. The replacement part-present sensor is PNP, 10–30VDC, output: +24V when active (detecting), sinking current: 100mA max load.',
      solution: 'PNP sensor + sinking input = correct pairing.\n\nWiring:\n- Sensor Brown (+) → +24V terminal on the nearest terminal block\n- Sensor Blue (0V) → 0V common terminal\n- Sensor Black (output) → PMC input terminal X3.2\n\nWhen sensor detects: Black output goes to +24V. Current flows: +24V (sensor output) → X3.2 input terminal → internal detection circuit → common (0V). Module sees current through its terminal → reads "1".\n\nVerify: With target present, sensor LED on, measure X3.2 terminal to 0V = 24V. Check PMC monitor screen: X3.2 = 1. Success.',
    },
  ],

  challenges: [
    {
      problem: 'A PLC output card is labeled "NPN (sinking)." A 24VDC relay coil is connected between the output terminal and L+ (positive supply). When the output activates, does conventional current flow INTO or OUT OF the output terminal? Is this correct wiring?',
      hint: 'A sinking output connects the output terminal to 0V internally when active. Trace the current path.',
      walkthrough: [
        'NPN (sinking) output: when activated, the internal transistor connects the output terminal to 0V (negative supply).',
        'Circuit with relay coil between L+ and output terminal: L+ (+24V) → relay coil → output terminal → internal transistor → 0V.',
        'Conventional current flows from L+ through the coil and INTO the output terminal.',
        'The module sinks this current (absorbs it, pulls it to 0V) — this matches "sinking output."',
        'This IS correct wiring for a sinking (NPN) output: load is connected between +V and the output terminal, current flows into the output.',
      ],
      answer: 'Current flows INTO the output terminal. This is correct wiring — sinking outputs require the load between +V and the output terminal.',
      difficulty: 'easy',
    },
    {
      problem: 'A Fanuc PMC has sinking inputs (common terminal = 0V). You need to replace a failed sensor. Two models are available: NPN (open collector) or PNP (open collector). Which should be ordered? Describe the current path when the sensor detects a target.',
      hint: 'Sinking inputs pair with sourcing field devices.',
      walkthrough: [
        'Fanuc PMC inputs are sinking type: common = 0V. Current must flow INTO the input terminal for a logic 1.',
        'To drive current into the input terminal, the field device must SOURCE current — i.e., provide current from a positive voltage.',
        'PNP (sourcing) sensor: when detecting, the output transistor connects the output to +24V, sourcing current to the input.',
        'NPN (sinking) sensor: when detecting, the output transistor connects the output to 0V — this would pull the input terminal toward 0V, not drive current into it. This does not work with a sinking input directly.',
        'Order the PNP (open collector) model.',
        'Current path when sensor detects: +24V (sensor internal supply) → PNP output transistor → sensor Black output wire → PMC input terminal → internal detection circuit → PMC common (0V). Current flows into the input terminal — module reads logic 1.',
      ],
      answer: 'Order the PNP (open collector) sensor. Current path: +24V → PNP output → input terminal → detection circuit → 0V common. PNP sources current into the sinking input.',
      difficulty: 'medium',
    },
    {
      problem: 'A PNP sensor is wired to a sinking PLC input (this pairing is correct). However, when the target is removed (sensor inactive), the PLC input reads 1 instead of 0. The sensor datasheet states leakage current = 0.8mA when inactive. The PLC input impedance is 3.3kΩ. Calculate the leakage voltage at the PLC input and determine whether this exceeds the logic 1 threshold (15V for 24VDC logic).',
      hint: 'Use Ohm\'s Law: V = I × R, where I is the sensor leakage current and R is the PLC input impedance.',
      walkthrough: [
        'Even when a PNP sensor is inactive, its output transistor has a small leakage current that still flows.',
        'Leakage current: I_leak = 0.8mA = 0.0008A',
        'PLC input impedance: R_input = 3.3kΩ = 3300Ω',
        'Voltage developed at PLC input from leakage: V = I × R = 0.0008A × 3300Ω = 2.64V',
        '2.64V is well below the 15V logic 1 threshold for 24VDC systems. The leakage alone should not cause a false logic 1.',
        'Therefore the leakage current explanation does NOT account for the stuck-ON input in this case.',
        'The actual fault is likely a different cause: a wiring short, an incorrect pull-up in the circuit, or the sensor is not fully switching off (transistor damaged). Check for a short between the sensor output wire and +24V, or verify the sensor itself is switching output to high-impedance (not a partial voltage) when inactive.',
      ],
      answer: 'Leakage voltage = 0.8mA × 3.3kΩ = 2.64V, which is far below the 15V threshold. Sensor leakage is not the cause of the false logic 1. A wiring fault (short to +24V on the signal wire) or damaged sensor transistor should be investigated.',
      difficulty: 'hard',
    },
  ],
};

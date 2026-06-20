export default {
  id: 'elec0-007',
  slug: 'wiring-diagrams',
  chapter: 'elec0',
  order: 7,
  title: 'Reading Wiring Diagrams',
  subtitle: 'Schematics, ladder diagrams, and wiring diagrams — the three visual languages of industrial electrical systems and how to move between them.',
  tags: ['wiring diagram', 'schematic', 'ladder diagram', 'electrical drawing', 'terminal block', 'wire numbers', 'device tagging', 'IEC symbols'],
  aliases: 'wiring schematic ladder diagram electrical drawing symbols wire numbers terminal block',
  timeToComplete: 25,
  coreConcept: 'Industrial electrical drawings come in three types: schematics (how components function), wiring diagrams (where wires physically connect), and ladder diagrams (control logic). All three represent the same circuit; each emphasizes different information. Cross-referencing them is the core skill of electrical troubleshooting.',
  prerequisites: ['elec0-005', 'elec0-006'],
  nextLesson: 'sourcing-and-sinking',

  hook: {
    question: "A machine's electrical cabinet has 400 wires, 60 terminal blocks, 12 relay cards, and 4 PLC I/O modules. The machine stops with a fault. How do you find the bad wire in under 10 minutes?",
    realWorldContext: "The answer is: you follow the drawing. A technician with electrical drawings and a multimeter can systematically eliminate half the circuit with each measurement — binary search on wiring. A technician without drawings or who can't read them spends hours pulling and wiggling wires at random. Learning to read, trace, and interpret wiring diagrams is the single most leveraged skill in industrial electrical maintenance.",
  },

  mentalModel: [
    "**The three diagram types answer three questions.** Schematics answer 'how does this circuit work?' — they show function with standardized symbols but not physical location. Wiring diagrams answer 'where does this wire go?' — they show terminal-to-terminal connections with device locations and wire numbers. Ladder diagrams answer 'what conditions must be true for this output to energize?' — pure control logic, column by column.",
    "**Wire numbers are your GPS.** Every wire in an industrial panel has a number (or alphanumeric code) printed on the insulation shrink sleeve at each end. Wire number = same potential = same connection. If wire 147 appears at relay K3 pin 14 and at PLC output Q0.3, they're connected. The wiring diagram is indexed by wire number — you can find every termination of wire 147 in seconds.",
    "**Terminals are renaming points.** A terminal block doesn't change the electrical connection — it provides a convenient place to break and reconnect the circuit. The wire number stays the same on both sides of a terminal (they're the same electrical node). Terminal numbers are separate from wire numbers: terminal TB3-14 may carry wire 147 on both sides.",
  ],

  intuition: {
    prose: [
      "**Schematic symbols.** Industrial schematics use standardized symbols that cross manufacturer and country boundaries. A circle with an X is a lamp. A rectangle with leads is a resistor. A coil symbol (parentheses or semicircle) is a relay or motor coil. Two parallel lines with a gap are normally-open contacts. Two parallel lines with a diagonal slash are normally-closed contacts. A triangle is a diode. Once you know 20 symbols, you can read any schematic. The IEC (European) and NEMA/ANSI (North American) symbol sets differ slightly — Fanuc and Siemens use IEC; older Allen-Bradley prints often use ANSI.",
      "**Wire numbering conventions.** Most plants use one of two systems: sequential (wires numbered 1, 2, 3... in order of installation) or functional (wire number encodes the circuit — '24V-1' for first 24V positive wire, '0V-1' for first 0V return). Some Siemens prints number wires by the potential they carry. Fanuc machine prints typically use a combination: L1, L2, L3 for AC power phases, +24, 0V for DC power, and sequential numbers for signal wires. The system used will be explained in the drawing's legend.",
      "**How to trace a circuit from a fault.** Start at the output device (the thing that's not working). Find it on the wiring diagram. Follow its supply wire back toward the power source — each junction you cross is a possible fault point. At each component (fuse, contact, terminal), you have a test point. Measure voltage: if present before the component but absent after, that component is open. If absent before the component, the fault is further upstream. This systematic approach reduces 400 wires to a single fault in 4–8 measurements.",
      "**Cross-references between sheets.** Industrial drawings span many pages. A contact on sheet 14 may be the contact of a relay whose coil is on sheet 7. Cross-references link them: next to the coil symbol you'll see a reference like '14/B3' meaning 'a contact of this coil can be found on sheet 14, row B, column 3.' On sheet 14, next to the contact symbol, it says '7/E2' pointing back to the coil. Always follow cross-references before concluding a component is missing or misconnected.",
      "**Terminal block diagrams.** A terminal block diagram shows every terminal strip in the panel: which wire number connects to each terminal, whether jumpers bridge adjacent terminals, and where the field connections enter from. These are essential for commissioning (verifying all field wires land on correct terminals) and troubleshooting (measuring voltage at terminal blocks eliminates the need to probe inside the panel). Every terminal gets a unique address: TB2-7 = Terminal Block 2, position 7.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Reading a New Set of Electrical Drawings',
        body: '1. **Find the drawing list/index.** Understand how many sheets, what each covers (power distribution, PLC I/O, motor circuits, etc.).\n2. **Read the legend.** Every drawing set has a legend page: symbol definitions, wire number scheme, device tag format, revision history.\n3. **Start with the overall architecture sheet** — often called single-line or power distribution. Trace AC power from the main disconnect through transformers to each branch circuit.\n4. **Find the specific subsystem you need** using the drawing index.\n5. **Follow wire numbers**, not physical wire routing. A wire disappears into a conduit and emerges at a terminal block — the number tells you it\'s the same wire.\n6. **Use cross-references** to jump between sheets.',
      },
      {
        type: 'definition',
        title: 'Device Tagging Standards',
        body: 'Industrial components get unique tags that identify type and location:\n\n- **K** = relay (K1, K2, K3...)\n- **M** = motor (M1, M2...)\n- **F** = fuse or circuit breaker (F1, F2...)\n- **Q** = power contactor or motor starter (Q1, Q2...)\n- **S** = switch (S1, S2... ; ES = emergency stop)\n- **B** = sensor/transducer (B1, B2...)\n- **Y** = solenoid valve (Y1, Y2...)\n- **H** = indicator lamp (H1, H2...)\n- **T** = transformer (T1, T2...)\n\nFanuc uses slightly different conventions (see PMC I/O address documentation).',
      },
      {
        type: 'insight',
        title: 'The Difference Between Schematic and Wiring Diagram',
        body: 'A schematic shows how the circuit works — components drawn in logical order regardless of physical location, with standardized symbols. A relay coil and its contacts are drawn near each other even if in physically different parts of the panel.\n\nA wiring diagram shows where things physically are — terminal blocks in panel layout order, actual wire routing, connector pin numbers. The relay coil and contacts may be on different pages because they\'re in different physical sections.\n\nFor troubleshooting logic, use the schematic. For finding the wire and tracing physical connections, use the wiring diagram. Most faults require both.',
      },
      {
        type: 'insight',
        title: 'Wire Ferrules — The Sign of Quality Wiring',
        body: 'Quality panels use wire ferrules (or wire end sleeves): small metal tubes crimped onto stripped wire ends before inserting into terminal blocks. They prevent: strands from spreading and bridging adjacent terminals (causing shorts), strands from breaking off over vibration, and terminal screws from cutting through strands when tightened. If you open a panel and see raw stripped wire ends jammed into terminals, that\'s maintenance-level work and a source of future faults. Ferrulled wires are a sign of professional panel build quality.',
      },
    ],
    visualizations: [],
  },

  math: { prose: [], callouts: [] },

  examples: [
    {
      title: 'Systematic fault diagnosis',
      problem: 'A conveyor motor won\'t run. The operator panel shows "Conveyor enable fault." Working from the wiring diagram: the motor contactor coil is fed from PLC output Q2.1 through fuse F7. What are your measurement steps?',
      solution: 'Step 1: Measure at motor contactor coil terminals (sheet 8, TB4-12 to TB4-13). Result: 0V. Coil isn\'t energized.\n\nStep 2: Measure at PLC output Q2.1 terminal (sheet 4, TB1-35). Result: 24V. PLC is trying to energize the output.\n\nStep 3: Measure at fuse F7 input terminal. Result: 24V. Power enters fuse.\n\nStep 4: Measure at fuse F7 output terminal. Result: 0V. Voltage drops across fuse = fuse is open (blown).\n\nConclusion: Replace F7. The PLC was commanding correctly the entire time. Without the drawing, you might have suspected the PLC, the motor, or anything in between.',
    },
  ],

  challenges: [
    {
      problem: 'On a ladder diagram, a normally-open (NO) contact symbol is drawn with a gap (open symbol). In the de-energized state, is the physical switch open or closed?',
      hint: 'The ladder diagram symbol represents the de-energized (resting) state of the contact directly.',
      walkthrough: [
        'Ladder diagram convention: the symbol drawn represents the contact\'s state when its controlling device (coil or actuator) is de-energized.',
        'A normally-open (NO) contact symbol shows a gap — meaning the contacts are open (circuit is broken) in the de-energized state.',
        'Therefore: in the de-energized state, the physical switch contacts are OPEN — no current flows through this rung branch.',
        'When the coil is energized (or the actuator is activated), the NO contact closes, completing the circuit.',
        'This matches what "normally" means: the normal (de-energized) condition is open.',
      ],
      answer: 'The physical switch is open in the de-energized state. The NO symbol accurately depicts the resting condition.',
      difficulty: 'easy',
    },
    {
      problem: 'A technician measures 24V between L+ and wire W15. The load connected to W15 does not energize. What does this voltage reading tell them about the fault location?',
      hint: 'Apply KVL: if 24V appears across the wire (from supply to the wire), where must the voltage drop be occurring?',
      walkthrough: [
        'In a normally-functioning circuit, current flows: L+ → wire W15 → load → L− (0V). No voltage drop on the wire itself; voltage at W15 would equal L+.',
        'But the tech is measuring between L+ and W15, not between W15 and L−.',
        'If W15 measures 24V relative to L+, that means W15 is at the same potential as L+ — or wait, re-read: 24V between L+ and W15 means V(L+) − V(W15) = 24V, so W15 ≈ 0V.',
        'W15 is at 0V with the supply at +24V. No current flows through the load. By KVL: the 24V must be dropped somewhere between L+ and W15.',
        'This voltage is appearing across an open circuit upstream of W15 — an open contact, blown fuse, or open disconnect between L+ and W15.',
        'The fault is UPSTREAM of W15 (between the supply and the W15 terminal), not in the load itself. The load is fine; it never received voltage.',
      ],
      answer: 'The 24V reading (with W15 near 0V relative to L+) indicates an open circuit upstream of W15 — a blown fuse, open contact, or broken wire between the supply and the W15 terminal. The load is not at fault.',
      difficulty: 'medium',
    },
    {
      problem: 'A wiring diagram shows the series circuit: CB1 → K1 coil → KM1 NO contact → M1 motor. Motor does not run. Tech measures: L+ to W1 = 24V; W1 to W2 (across K1 coil) = 0V; W2 to L− = 24V. Interpret these readings and identify the fault.',
      hint: 'Use KVL: the component with 24V across it is the open one. The component with 0V across it has current passing through it (or is bypassed).',
      walkthrough: [
        'Circuit series path: L+ → (wire W1) → K1 coil → (wire W2) → KM1 NO contact → M1 → L−',
        'Measurement 1: L+ to W1 = 24V. This means W1 is at 0V potential (L+ is +24V, W1 = +24V − 24V = 0V). Wait — re-read: measuring L+ TO W1 gives 24V means the voltage difference is 24V, so W1 = 0V. But that would mean the 24V drops between L+ and W1, implying an open upstream of W1. However, re-examine: if the probe is on L+ and the other on W1, and reads 24V, W1 is at 0V. That means CB1 is open and W1 never received power. But then W2 would also be 0V, not 24V across the coil. Let\'s re-read: L+ to W1 = 24V means W1 is floating near L+ potential with only 24V supply... actually: standard interpretation is these are differential measurements along the loop.',
        'Standard troubleshooting interpretation: Voltage measured ACROSS a component = voltage drop across it. L+ to W1 = 24V means 24V drops between L+ and W1, so W1 ≈ 0V → CB1 is open OR this means W1 is at L+ (24V above L−) and the tech is measuring from L+ to W1 showing 0V... the problem states: "L+ to W1 = 24V". Taking this at face value as voltage from L+ reference to point W1 = 24V means W1 is at 24V (same as L+) — CB1 is closed and conducting.',
        'W1 to W2 (across K1 coil) = 0V: zero voltage drop across the K1 coil means either the coil is a short (unlikely) or W1 and W2 are at the same potential — current is flowing through a path that bypasses the coil, or both nodes are floating together. More likely: K1 coil has zero voltage across it because something else is dropping all the voltage.',
        'W2 to L− = 24V: the full 24V supply voltage appears between W2 and L−. This means W2 is near L+ potential too, and the 24V is being dropped between W2 and L− — across the KM1 NO contact and/or the motor.',
        'Summary: W1 = +24V (CB1 closed), W2 = +24V (coil has 0V across it, so K1 coil is shorted or bypassed — but more likely: KM1 NO contact is OPEN, and the full voltage appears from W2 to L−). The K1 coil shows 0V because both its terminals are at the same high potential — meaning no current flows and the full source voltage is across the open KM1 contact downstream.',
        'Fault: KM1 NO contact is open (failed to close or welded open in the open position). K1 coil cannot be energized because the series circuit is broken at KM1. With 24V appearing from W2 to L−, the open is between W2 and L−, confirming KM1 NO contact did not close.',
      ],
      answer: 'KM1 NO contact is open (failed open). With 0V across K1 coil and 24V from W2 to L−, the full supply voltage is dropped across the open KM1 contact. K1 coil never energizes because the series circuit is broken at KM1. Inspect/replace KM1 contact block.',
      difficulty: 'hard',
    },
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A wiring diagram shows wire number 147 at relay K3 pin 14 and also at PLC output Q0.3. What does this tell you?',
      options: [
        'Wire 147 is connected at two different electrical potentials — one side is signal, the other is power',
        'Both points are the same electrical node — the wire number identifies a single continuous conductor',
        'There are two separate wires numbered 147 which are not connected',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'You measure full supply voltage (24V) across a component in a series circuit that should only drop a few volts. What does this indicate?',
      options: [
        'The component is shorted — it has near-zero resistance and passes all the current',
        'There is an open circuit somewhere else in the series loop — no current flows so this component is showing the full supply voltage',
        'The power supply voltage has increased — check the supply output',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'When troubleshooting, what is the difference between a schematic and a wiring diagram?',
      options: [
        'Schematics show AC circuits; wiring diagrams show DC circuits',
        'A schematic shows how the circuit functions with logical component layout; a wiring diagram shows physical terminal-to-terminal connections and wire routing',
        'Schematics are always more detailed than wiring diagrams',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A cross-reference notation on a relay coil reads "14/B3". What does this mean?',
      options: [
        'The relay requires 14 volts and has 3 contacts on terminal block B',
        'A contact controlled by this coil can be found on drawing sheet 14, at position row B, column 3',
        'The relay coil is located on sheet B3, position 14',
      ],
      correct: 1,
    },
  ],
};

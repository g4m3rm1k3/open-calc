export default {
  id: 'elec1-004',
  slug: 'thevenin-norton',
  chapter: 'elec1',
  order: 4,
  title: 'Thévenin and Norton Equivalents',
  subtitle: 'Any two-terminal network — no matter how complex — can be replaced by one voltage source and one resistor.',
  tags: ['thevenin', 'norton', 'equivalent circuit', 'source transformation', 'maximum power', 'impedance matching'],
  aliases: 'thevenin theorem norton equivalent Vth Rth source transformation two-terminal network',
  timeToComplete: 30,
  coreConcept: "Thévenin's theorem: any linear two-terminal network can be replaced by a single voltage source (Vth) in series with a single resistance (Rth). Norton's theorem: the equivalent is a current source (In) in parallel with Rth. Both representations describe the same network — they're interchangeable. This simplification is essential for analyzing how a complex source behaves when connected to a changing load.",
  prerequisites: ['elec1-003'],
  nextLesson: 'capacitors',

  hook: {
    question: "You're designing a 4–20mA current loop receiver that must work correctly regardless of whether the sensor is a simple two-wire type or a complex powered transmitter with internal circuitry. How do you predict what voltage will appear at the receiver terminals without modeling every possible sensor?",
    realWorldContext: "Every real signal source — a sensor, a PLC analog output, a battery with internal resistance — can be modeled as a Thévenin equivalent: an ideal voltage source Vth in series with source resistance Rth. When you connect a load RL across the terminals, the output voltage is Vth × RL/(Rth + RL) — a voltage divider. The sensor's internal complexity doesn't matter; only Vth and Rth determine its behavior at the terminals. Engineers use this constantly: a 4–20mA transmitter loop powered by 24VDC through a 250Ω sense resistor has a Thévenin equivalent the PLC input sees directly.",
  },

  mentalModel: [
    "**The black box model.** Imagine a complex circuit sealed inside a black box with two output terminals. You can't see inside. But you can measure: (1) the open-circuit voltage Voc between the terminals — this IS Vth. (2) The short-circuit current Isc when you connect a wire between terminals — Isc = Vth/Rth, so Rth = Vth/Isc. The Thévenin equivalent (one source, one resistor) perfectly predicts every measurement you can make on those terminals — because all linear circuits with the same Voc and Rth behave identically at their terminals.",
    "**Source transformation — equivalent views.** A voltage source Vth in series with Rth (Thévenin) can always be converted to a current source In = Vth/Rth in parallel with Rth (Norton), and vice versa. These two representations are mathematically identical at the terminals. Which to use depends on what makes the surrounding circuit analysis simpler — node voltage analysis often prefers Norton (current sources); mesh analysis often prefers Thévenin (voltage sources).",
    "**Why Rth matters — source impedance affects load behavior.** An ideal voltage source has Rth = 0 — its terminal voltage never drops regardless of load current. A real battery has Rth > 0 — terminal voltage drops under load. A sensor output with Rth = 1kΩ feeding a 10kΩ load sees only 10k/(1k+10k) = 91% of its open-circuit voltage at the load. Thévenin analysis makes this loading effect explicit and quantifiable.",
  ],

  intuition: {
    prose: [
      "**Finding Vth.** To find the Thévenin voltage, remove the load resistor from the terminals. The voltage appearing across the open terminals is Vth. You can calculate it using any circuit analysis technique — node voltage, mesh current, superposition, or simple Ohm's Law if the circuit is simple enough. Vth is the open-circuit voltage: the most voltage the source can ever deliver to any load.",
      "**Finding Rth.** To find the Thévenin resistance, deactivate all independent sources (replace voltage sources with short circuits, current sources with open circuits), then calculate the resistance seen looking into the terminals. This is the equivalent resistance of the passive network. Alternatively, Rth = Voc / Isc: measure (or calculate) both open-circuit voltage and short-circuit current, divide.",
      "**Maximum power transfer.** A critical result from Thévenin analysis: maximum power is delivered to a load when RL = Rth. At this condition, half the power is dissipated in Rth and half in RL. The maximum power is P_max = Vth² / (4Rth). This theorem drives loudspeaker impedance matching (8Ω speaker to 8Ω amplifier output), RF antenna matching (50Ω), and signal chain design throughout electronics.",
      "**Norton equivalent and current loops.** The 4–20mA industrial standard is essentially Norton in action. A current transmitter has very high Rth (typically >10MΩ for a good current source) — meaning it forces a specific current regardless of load resistance variations. The load (PLC input) presents 250Ω typically. Since Rth >> RL, the current is constant at the transmitter-set value and the voltage varies as I × RL. This is why 4–20mA signals are immune to voltage drop over long cable runs.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: "Thévenin's Theorem",
        body: "Any linear two-terminal DC circuit can be replaced by:\n- A **Thévenin voltage source** Vth = V_open-circuit\n- In series with **Thévenin resistance** Rth = R_looking-in (sources deactivated)\n\nThe equivalent circuit produces the same voltage, current, and power at the terminals for any load RL.",
      },
      {
        type: 'theorem',
        title: "Norton's Theorem",
        body: "Any linear two-terminal DC circuit can be replaced by:\n- A **Norton current source** In = Isc = Vth / Rth\n- In parallel with **Rth** (same as Thévenin)\n\nConversion between Thévenin and Norton:\n- **Thévenin → Norton**: In = Vth / Rth, same Rth in parallel\n- **Norton → Thévenin**: Vth = In × Rth, same Rth in series",
      },
      {
        type: 'theorem',
        title: 'Maximum Power Transfer',
        body: "Maximum power is delivered to load RL when:\n\n**RL = Rth**\n\nAt maximum power: $P_{max} = \\dfrac{V_{th}^2}{4 R_{th}}$\n\nEfficiency at max power = 50% (half dissipated in source, half in load).\n\nUsed in: audio amplifier-speaker matching, RF circuits, signal generators, battery-powered systems.",
      },
      {
        type: 'procedure',
        title: 'Finding Thévenin Equivalent — Step by Step',
        body: "1. **Identify the two terminals** (where the load connects). Remove the load.\n2. **Find Vth**: calculate the open-circuit voltage across the terminals. Use any analysis method.\n3. **Find Rth**: deactivate all independent sources (V-sources → short circuit; I-sources → open circuit). Calculate resistance seen at the terminals.\n4. **Verify** (optional): calculate Isc = Vth / Rth, then verify by computing the short-circuit current directly.\n5. **Redraw** as Vth in series with Rth. Reconnect load as a voltage divider with Rth.",
      },
      {
        type: 'insight',
        title: 'Battery Internal Resistance is Rth',
        body: "A real battery is a perfect Thévenin equivalent: Vth = EMF (open-circuit voltage, e.g., 12.6V for a full lead-acid cell), and Rth = internal resistance (typically 0.01–0.2Ω for automotive batteries). Under load: V_terminal = Vth − I × Rth. Cranking a starter motor at 200A through 0.05Ω internal resistance: V_terminal = 12.6 − 200×0.05 = 2.6V — not enough for electronics. This is why cars need a charged battery for engine operation even though 12V accessories work fine.",
      },
      {
        type: 'warning',
        title: 'Thévenin Applies Only to Linear Circuits',
        body: "Thévenin's theorem requires the circuit to be **linear** — meaning all elements must obey superposition (Ohm's Law for resistors; linear inductors and capacitors for AC). Circuits with diodes, transistors, or nonlinear loads cannot be Thévenin-reduced at their terminals (except approximately, for small-signal analysis where the nonlinear elements are linearized around an operating point).",
      },
    ],
    visualizations: [
      {
        id: 'OhmViz',
        title: 'Source Resistance Loading Effect',
        mathBridge: "Think of the voltage slider as Vth and the resistance slider as Rth. Lock voltage (V), adjust resistance (R): this represents the Thévenin source resistance. As R increases, the available current decreases — this is Rth loading down the source. The circuit simulator shows you V_load = Vth × RL/(Rth + RL).",
      },
    ],
  },

  math: {
    prose: [
      "**Terminal voltage of a Thévenin source with load RL:**\n\n$$V_{load} = V_{th} \\cdot \\frac{R_L}{R_{th} + R_L}$$\n\n$$I_{load} = \\frac{V_{th}}{R_{th} + R_L}$$\n\nAs RL → ∞ (open circuit): V_load → Vth. As RL → 0 (short circuit): I_load → Vth/Rth = Isc.",
      "**Power delivered to load RL:**\n\n$$P_L = I_{load}^2 R_L = \\frac{V_{th}^2 R_L}{(R_{th} + R_L)^2}$$\n\nTaking dP_L/dR_L = 0 to maximize: solution is RL = Rth. At this condition:\n\n$$P_{max} = \\frac{V_{th}^2}{4 R_{th}}$$",
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Source Transformation in Node Analysis',
        body: "When solving by node voltage method, a voltage source Vs in series with R_s is harder to handle (it constrains a node voltage). Convert it to its Norton equivalent: current source Is = Vs/Rs in parallel with Rs. Now it's just a current source injecting current into a node — trivial for KCL. This transformation is often the fastest way to simplify a node analysis problem.",
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'How do you find the Thévenin voltage (Vth) of a two-terminal network?',
      options: [
        'Deactivate all sources and measure the resistance at the terminals',
        'Remove the load and calculate or measure the open-circuit voltage at the terminals',
        'Short the terminals and measure the resulting current, then multiply by the source resistance',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A Thévenin source has Vth = 12V and Rth = 100Ω. What load resistance extracts maximum power from this source?',
      options: [
        '0Ω — short circuit extracts the most power',
        '100Ω — maximum power transfer occurs when RL = Rth',
        '∞Ω — open circuit has the highest voltage, so it extracts the most power',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A sensor with Rth = 1kΩ is connected to a 10kΩ PLC input. What fraction of the sensor\'s open-circuit voltage reaches the PLC input?',
      options: [
        '50% — voltage always splits equally between source resistance and load',
        'About 91% — the voltage divider gives 10k/(1k+10k) = 0.909',
        '100% — the PLC input has high impedance so it doesn\'t load the sensor',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why does a 4–20mA transmitter\'s signal remain accurate even over long cables that add resistance to the loop?',
      options: [
        'The transmitter adjusts its voltage output to compensate for cable resistance',
        'The transmitter is a Norton current source with very high Rth — it forces the specified current regardless of loop resistance variations',
        '4–20mA signals are immune to resistance because they use frequency modulation rather than amplitude',
      ],
      correct: 1,
    },
  ],
};

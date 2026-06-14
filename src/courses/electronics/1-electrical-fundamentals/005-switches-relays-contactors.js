export default {
  id: 'elec0-005',
  slug: 'switches-relays-contactors',
  chapter: 'elec0',
  order: 5,
  title: 'Switches, Relays, and Contactors',
  subtitle: 'The mechanical and electromechanical devices that turn circuits on and off — and how PLCs control high-power loads through them.',
  tags: ['relay', 'contactor', 'switch', 'normally open', 'normally closed', 'coil', 'contacts', 'interposing relay', 'motor starter'],
  aliases: 'relay coil contact NO NC normally open closed contactor motor starter interposing relay',
  timeToComplete: 22,
  coreConcept: 'A relay is an electromagnetically-controlled switch: a low-power coil creates a magnetic field that moves mechanical contacts. Contactors are high-power relays for motor circuits. PLCs use interposing relays to bridge their low-current outputs to high-power loads.',
  prerequisites: ['elec0-003'],
  nextLesson: 'sensors',

  hook: {
    question: "A PLC output card is rated for 0.5A maximum per output. The conveyor motor starter requires 10A to energize its coil. How does the PLC control the motor — and why can't it connect directly?",
    realWorldContext: "This is the most common interface question in industrial automation: how do low-power digital control signals drive high-power mechanical loads? The answer is always some form of electromechanical or solid-state relay. Understanding the full chain — PLC output → relay coil → relay contact → load — is essential for wiring, commissioning, and troubleshooting every machine you'll work on.",
  },

  mentalModel: [
    "**A relay is a remote-controlled switch.** The coil and contacts are electrically isolated from each other. Low-power signal energizes the coil; the coil's magnetic field mechanically moves the contacts, which switch a completely separate circuit. The isolation is the point — the coil circuit and the contact circuit can have different voltages, polarities, and current levels.",
    "**Normally Open (NO) vs. Normally Closed (NC) refers to the de-energized state.** This trips people up constantly. 'Normally' means 'with no power applied to the coil.' A Normally Open contact is OPEN when the coil is off — current doesn't flow. Energize the coil and it CLOSES. A Normally Closed contact is CLOSED when the coil is off — current flows. Energize the coil and it OPENS.",
    "**Contactors are relays for motors.** The only difference is size: a contactor handles 10A–hundreds of amps versus a relay's 10A–30A maximum. Contactors also have built-in arc suppression (the contacts carry enough current to arc when they open — the arc can weld contacts together if not controlled). Motor starters are contactors with built-in overload protection.",
  ],

  intuition: {
    prose: [
      "**How a relay works mechanically.** A relay has two completely separate circuits: the coil circuit (low power, drives the electromagnet) and the contact circuit (switches the load). When current flows through the coil, it creates a magnetic field that pulls an armature (spring-loaded metal lever) toward the electromagnet core. The armature is mechanically connected to the contacts. Pull the armature and the contacts move — NO contacts close, NC contacts open simultaneously. Remove coil current and the spring returns the armature, reversing all contacts.",
      "**Contact ratings matter.** Every relay datasheet specifies its contact ratings: '10A at 250VAC' or '5A at 30VDC.' These are the maximum the contacts can safely switch. Exceed them and you get: arcing that erodes the contact surface over thousands of operations, contacts that weld shut, or failure to break the circuit under fault conditions. Using a relay to switch a motor directly (which draws 6× rated current at startup) destroys the contacts. That's what contactors with their arc suppression are for.",
      "**Interposing relays — the PLC-to-world interface.** PLC output modules (transistor or triac type) are typically rated 0.1–0.5A per channel. Most real loads — motor starters, solenoid valves, larger indicator lights — draw 0.5–5A. Interposing relays solve this: the PLC output energizes the relay coil (50–100mA), which closes contacts rated for the higher-current load. The relay is a current amplifier: milliamps in, amps out. It also provides isolation — a voltage spike on the load side won't damage the PLC output card.",
      "**Relay contact configurations.** Relays come in configurations described by poles (independent contact sets) and throws (positions): SPDT (Single Pole Double Throw) — one common terminal, one NO, one NC; use as either NO or NC. DPDT (Double Pole Double Throw) — two independent SPDT contact sets switched simultaneously. An 8-pin relay (common in industry) is usually DPDT. A 14-pin relay is usually 4PDT — four contact sets. When a relay coil energizes, ALL contact sets move simultaneously.",
      "**Contactors and motor starters.** A contactor is a relay designed for motor loads. Key differences: heavy contacts rated for 25–800A, arc suppression chambers to quench arcs when switching inductive motor currents, and a design for 10 million operations (relays are rated for 100K). A **motor starter** = contactor + overload relay. The overload relay monitors motor current and trips (opens a contact) if the motor draws sustained overcurrent — protecting the motor from thermal damage caused by mechanical overloads or stalled rotor.",
      "**Solid-state relays (SSR).** SSRs switch loads using a semiconductor (thyristor or triac) instead of mechanical contacts. Advantages: zero-emission sparks, long life, fast switching, silent. Disadvantages: voltage drop when 'on' (causing heat), fail-short rather than fail-open, can't switch DC as easily as AC. SSRs are used where mechanical relays cycle thousands of times per day or where EMI from contact arcing is a problem.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Normally Open (NO) and Normally Closed (NC)',
        body: '**Normally Open (NO):** Contact is OPEN (circuit broken) when coil is de-energized. CLOSES when coil energizes.\n\n**Normally Closed (NC):** Contact is CLOSED (circuit complete) when coil is de-energized. OPENS when coil energizes.\n\n**In PLC ladder logic:** XIC (Examine If Closed) = acts as NO contact. XIO (Examine If Open) = acts as NC contact. This is where the direct connection between electrical contacts and ladder logic comes from.',
      },
      {
        type: 'procedure',
        title: 'Testing a Relay with a Multimeter',
        body: '**With power OFF:**\n1. Resistance across coil terminals: should read 50–500Ω (match datasheet). Open circuit = burned coil. Near 0Ω = shorted coil.\n2. Resistance across NO contacts: should read infinite (open). Any continuity = contacts welded.\n3. Resistance across NC contacts: should read near 0Ω (closed). Open = damaged contacts.\n\n**With power ON (coil energized):**\n4. Voltage across coil: should read rated voltage (12V or 24V). Significantly less = high resistance in coil circuit.\n5. NO contacts should now show continuity (or <1Ω).',
      },
      {
        type: 'insight',
        title: 'The Flyback Diode — Protecting PLC Outputs',
        body: 'When you de-energize a relay coil, the collapsing magnetic field generates a voltage spike (back-EMF) opposite in polarity to the supply voltage. This spike can be 10–100× the supply voltage and lasts microseconds. It destroys transistor outputs on PLC cards. Fix: wire a diode in reverse across the coil (anode to − supply, cathode to + supply). When the coil is energized, the diode is reverse-biased and blocks. When de-energized, the spike forward-biases the diode, which clamps it to ~0.7V. Almost all 24VDC relay bases include this diode. For AC circuits, use an RC snubber instead.',
      },
      {
        type: 'insight',
        title: 'Overload Relay — Protecting Motors from Thermal Death',
        body: 'A motor drawing 200% rated current for 10 seconds overheats. The fuse won\'t blow (fuses protect wires from shorts, not motors from sustained overload). The overload relay sits in series with each motor phase, bimetal strips heat proportionally to I²t (current squared × time), eventually tripping an auxiliary contact that de-energizes the contactor coil. Modern electronic overload relays directly measure current using CTs (current transformers) and trip in milliseconds for protection accuracy fuses can\'t achieve.',
      },
      {
        type: 'warning',
        title: 'Never Wire AC Loads to DC-Rated Relay Contacts',
        body: 'DC is much harder to switch than AC. In AC circuits, the current naturally crosses zero 120 times per second (at 60Hz) — the arc extinguishes at each zero crossing. In DC circuits, the arc is continuous and must be physically stretched until it can no longer sustain itself. Contacts rated for AC may not break DC safely at the same voltage. Always verify the DC rating (usually lower than AC rating) on the relay datasheet before switching DC loads.',
      },
    ],
    visualizations: [
      {
        id: 'RelayContactorViz',
        title: 'Relay & Contactor — Control vs Power Circuit',
        mathBridge: "Hold 'Energize Coil' to close the relay. Watch the 24VDC control circuit energize the coil, which closes the NO contact and connects the 120VAC motor circuit. The Ladder tab shows how this wiring maps directly to PLC ladder logic notation.",
      },
      {
        id: 'RelayLadderSim',
        title: 'Relay Ladder Logic Simulator',
        mathBridge: "Select 'Motor Seal-in'. Press START — the Run Bit latches via the parallel feedback contact. Press STOP to break the circuit. This is the SR latch implemented in ladder logic.",
      },
    ],
  },

  math: {
    prose: [
      "**Relay coil current.** A 24VDC relay with coil resistance 400Ω draws: $I = 24/400 = 60\\text{ mA}$. Power consumed by the coil: $P = I^2R = (0.06)^2 \\times 400 = 1.44\\text{ W}$. A panel with 50 such relays all energized simultaneously dissipates $50 \\times 1.44 = 72\\text{ W}$ just from relay coils.",
      "**Hold-in vs. pick-up current.** Relays require more current to initially pull in the armature (pick-up current) than to hold it in place (hold-in current). Typical ratio: pick-up ≈ 1.5× hold-in. The spring return must be overcome to pick up; only the residual magnetism needs to be countered to hold. This is why relays sometimes fail to 'pick up' on the first attempt when coil voltage is marginal, but hold in reliably once closed.",
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Contactor Size Selection',
        body: 'Contactors are sized by the motor\'s full-load amperage (FLA) and application category:\n\n- **AC-1:** Resistive loads — resistors, heaters\n- **AC-3:** Normal motor starting (DOL) — most common\n- **AC-4:** Plugging/reversing/inching — requires larger size\n\nFor AC-3 at 480V, select contactor rated ≥ motor FLA. Add overload relay heater elements sized to motor FLA ×1.15 (NEC 430.32). The combination creates a proper motor starter.',
      },
    ],
  },

  challenges: [
    {
      problem: 'A relay coil is rated 24VDC and draws 250mA when energized. What is the coil resistance?',
      hint: 'Use R = V/I.',
      walkthrough: [
        'Identify knowns: V = 24V, I = 250mA = 0.25A',
        'Apply Ohm\'s Law: R = V/I',
        'R = 24 / 0.25 = 96Ω',
      ],
      answer: '96Ω',
      difficulty: 'easy',
    },
    {
      problem: 'A normally-closed (NC) safety relay contact is wired in series with the motor contactor coil. If the safety relay coil loses power (de-energized), does the motor start or stop? Explain why this is fail-safe.',
      hint: 'Remember: NC means the contact is CLOSED when the coil is de-energized.',
      walkthrough: [
        'A Normally Closed contact is CLOSED when the relay coil is de-energized (no power)',
        'Wait — re-read the question: if the safety relay coil loses power, the NC contact REMAINS closed... so the motor contactor could still be energized',
        'Correction: an NC contact in this context means the contact OPENS when the safety relay IS energized (normal running), and CLOSES when de-energized',
        'Actually for fail-safe: if the safety relay is de-energized (fault condition), its NC contact opens, breaking the circuit to the motor contactor coil',
        'Motor contactor de-energizes → motor STOPS',
        'This is fail-safe because ANY loss of power to the safety relay (broken wire, blown fuse, relay failure) results in the motor stopping',
        'The default (unpowered) state of the safety relay causes a safe outcome',
      ],
      answer: 'The motor stops. Fail-safe because any loss of power to the safety relay opens the NC contact and de-energizes the motor contactor.',
      difficulty: 'medium',
    },
    {
      problem: 'A 5VDC PLC output (max 100mA) must control a 24VDC solenoid (rated 1.5A). An interposing relay with a 24VDC, 50mA coil is available. Describe the complete wiring and explain why the interposing relay is necessary.',
      hint: 'Think about voltage mismatch and current mismatch between the PLC output and the solenoid.',
      walkthrough: [
        'Problem 1 — Voltage mismatch: PLC output is 5VDC; solenoid requires 24VDC. Cannot connect directly.',
        'Problem 2 — Current mismatch: solenoid draws 1.5A; PLC output is rated only 100mA. Direct connection would damage the PLC output transistor.',
        'Solution — interposing relay:',
        'PLC output (5V, up to 100mA) → relay coil+ on a 5V relay (or use a 24V relay powered from 24V supply with PLC switching the ground/common)',
        'Correct wiring: +24V → relay coil+ ; PLC output sinks current → relay coil− (NPN output) — relay coil draws 50mA, within PLC 100mA limit',
        'Install a flyback diode across the 24V relay coil to protect the PLC output from back-EMF',
        'Relay NO contact: +24V → contact → solenoid+ ; solenoid− → 0V common',
        'The relay contacts are rated for 1.5A at 24VDC — safely switch the solenoid',
        'Result: PLC switches 50mA at its output; relay contacts switch 1.5A at 24V; electrical isolation protects the PLC from solenoid transients',
      ],
      answer: 'PLC output energizes 24V relay coil (50mA draw, within 100mA PLC limit). Relay NO contacts switch +24V to solenoid. Interposing relay is necessary because the PLC cannot supply 24V or 1.5A directly.',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Interposing relay wiring',
      problem: 'A PLC transistor output is rated 24VDC, max 0.5A per point. You need to control a 24VDC pneumatic solenoid rated 1.2A. Design the interface.',
      solution: 'Use an interposing relay with 24VDC coil (draws ~60mA — within PLC output rating) and contacts rated ≥1.5A at 24VDC.\n\nWiring: PLC output → relay coil+ ; 0V common → relay coil−. Install flyback diode across coil.\nRelay NO contact → +24V ; other contact → solenoid+ ; solenoid− → 0V common.\n\nResult: PLC switches 60mA to control relay; relay contacts switch the 1.2A solenoid. PLC is protected from solenoid\'s back-EMF by the relay isolation.',
    },
    {
      title: 'Motor starter sizing',
      problem: 'A 7.5HP, 480V, three-phase motor has a full-load amperage of 11A (from nameplate). Select the contactor and overload relay settings.',
      solution: 'Contactor: Select AC-3 rated ≥ 11A at 480V. A standard size is 12A or 18A — choose 18A for headroom.\n\nOverload relay: Set to 11A × 1.15 = 12.65A (NEC requires overload protection at 115% FLA for continuous-duty motors). Most overloads have a dial range — set to 12.7A.\n\nFuse (motor branch circuit): 11A × 2.5 (NEC 430.52 for inverse-time breaker) = 27.5A → use 30A breaker. This protects wiring from short circuits; the overload protects the motor from running overloads.',
    },
  ],
};

export default {
  id: 'elec1-007',
  slug: 'inductors',
  chapter: 'elec1',
  order: 7,
  title: 'Inductors — Magnetic Energy Storage',
  subtitle: 'How coiled wire stores energy in a magnetic field — and why inductors resist changes in current rather than current itself.',
  tags: ['inductor', 'inductance', 'magnetic field', 'back-EMF', 'energy storage', 'self-inductance', 'Faraday'],
  aliases: 'inductor henry coil winding self inductance back EMF flyback magnetic energy storage choke',
  timeToComplete: 28,
  coreConcept: "An inductor stores energy in a magnetic field. Its defining equation is V = L × dI/dt — voltage appears across an inductor only when current is changing. Steady DC through an inductor produces no voltage drop (it's a short circuit in DC steady state). But when current tries to change suddenly, the inductor generates a back-EMF that opposes the change. This energy storage and opposition to change is both useful (filters, motors) and dangerous (flyback spikes).",
  prerequisites: ['elec0-001', 'elec1-005'],
  nextLesson: 'rl-circuits',

  hook: {
    question: "A technician switches off a 24VDC relay coil — a 400mH inductor at 60mA — without a flyback diode. An oscilloscope shows a −400V spike on the PLC output transistor. The PLC manufacturer rates the output at 30V. Three months later, the PLC output module fails. What caused the spike, and why does coil inductance determine its magnitude?",
    realWorldContext: "This is one of the most common PLC output failure modes in industrial automation. When current through an inductor is interrupted suddenly, the inductor tries to maintain that current by generating whatever voltage is necessary — even kilovolts. The spike voltage is V = −L × dI/dt. With L = 400mH, I = 60mA, switching time t = 1μs: V = −0.4 × 0.06 / 0.000001 = −24,000V theoretical. In reality, limited by breakdown voltage of the circuit, but still far above the rated 30V. The fix: a flyback diode in antiparallel with the coil. Understanding V = L × dI/dt is how you understand the danger — and the protection.",
  },

  mentalModel: [
    "**Inductors resist change in current, not current itself.** A resistor opposes current proportional to current (V = IR). An inductor opposes *change* in current proportional to the rate of change (V = L × dI/dt). Steady DC through an inductor → dI/dt = 0 → zero voltage drop → it looks like a wire. Rapidly changing current → large dI/dt → large voltage. The inductor is the electrical equivalent of mechanical inertia — it keeps things going as they were.",
    "**Magnetic field is the energy store.** When current flows through an inductor, it creates a magnetic field. This field stores energy: E = ½LI². When current is interrupted, the field collapses — and that stored energy has to go somewhere. The inductor generates a voltage spike (back-EMF) to drive the current to continue flowing. If there's no path for that current, voltage spikes to whatever level is needed to force the current through the circuit's parasitic capacitance or to cause avalanche breakdown.",
    "**Dual of capacitors.** Inductors and capacitors are electrical duals. For capacitors: V cannot change instantaneously (I = C × dV/dt). For inductors: I cannot change instantaneously (V = L × dI/dt). For capacitors: DC steady state = open circuit. For inductors: DC steady state = short circuit. For capacitors: stores energy in electric field ½CV². For inductors: stores energy in magnetic field ½LI². This duality runs through all of AC circuit analysis.",
  ],

  intuition: {
    prose: [
      "**Physical construction.** An inductor is made by winding wire into a coil. Each turn of wire carrying current creates a small magnetic field. With many turns, these fields add up through the coil interior. The inductance L depends on the number of turns N, core material (permeability μ), cross-sectional area A, and length l: L = μ₀μ_r N² A / l. Air-core inductors have μ_r = 1. Iron cores have μ_r = hundreds to thousands — dramatically increasing inductance for the same physical size. This is why power transformers, motor windings, and relay coils use laminated iron cores.",
      "**Self-inductance and back-EMF.** When current through a coil changes, the changing magnetic field induces a voltage in the coil itself — Faraday's law of electromagnetic induction. This self-induced voltage is called back-EMF (or counter-EMF): V_L = −L × dI/dt. The negative sign means the induced voltage *opposes* the change (Lenz's law). Increasing current → field increasing → back-EMF opposes increase → slows the current rise. Decreasing current → field collapsing → back-EMF tries to maintain current → generates large positive voltage if interrupted.",
      "**Inductors in DC steady state.** After 5τ (where τ = L/R), an RL circuit reaches steady state: current is constant, dI/dt = 0, V_L = 0. The inductor acts as a short circuit (just its winding resistance, typically small). All source voltage appears across the series resistance. This steady state is why relay coils draw continuous current proportional to coil resistance, and why the current through a motor winding is limited by winding resistance in steady state.",
      "**Types of inductors.** Air-core (RF circuits, low L, no core saturation). Ferrite core (switching power supplies, 1μH–10mH, good up to MHz). Iron-powder core (DC chokes, EMI filters, 10μH–10mH). Laminated silicon steel (power transformers, 60Hz, large L). Powdered metal (VFD output chokes, minimize motor cable ringing). Toroidal cores minimize external field (less EMI than pot-core or rod inductors). Each type optimizes for different tradeoffs of frequency, current, size, and saturation.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Inductance',
        body: "**Inductance (L)** is the opposition to change in current — the ratio of induced voltage to rate of current change:\n\n$$L = \\frac{V}{dI/dt} = \\frac{N \\Phi}{I}$$\n\nUnit: **Henry (H)** — named after Joseph Henry.\n1 Henry = 1 V·s/A (one volt induced when current changes at 1A/s).\n\nPractical values: pH (10⁻¹²H) for PCB traces; nH for RF inductors; μH for switching regulators; mH for audio chokes; H for power transformers.",
      },
      {
        type: 'theorem',
        title: 'Inductor Voltage-Current Relationship',
        body: "$$v_L(t) = L \\frac{di}{dt}$$\n\nThis is the fundamental inductor equation — NOT Ohm's Law.\n\n- Steady DC: dI/dt = 0 → v_L = 0 (short circuit in DC steady state)\n- Sudden switch-off: dI/dt → very large → v_L → very large (flyback spike)\n- AC: continuous dI/dt → continuous voltage",
      },
      {
        type: 'theorem',
        title: 'Energy Stored in an Inductor',
        body: "$$E = \\frac{1}{2}LI^2$$\n\nUnit: Joules.\n\nEnergy is stored in the magnetic field throughout the coil volume.\n\nExample: relay coil L=400mH at I=60mA: E = ½ × 0.4 × (0.06)² = 720μJ — small in absolute terms, but released in microseconds → enormous power spike.",
      },
      {
        type: 'warning',
        title: 'Flyback Voltage — Always Protect Inductive Loads',
        body: "When current through any inductor is interrupted (relay coil, solenoid, motor), the stored energy generates a flyback voltage spike: V = −L × dI/dt.\n\n**Always protect inductive DC loads** with one of:\n1. **Flyback diode** (1N4001 or similar) in antiparallel across the coil — most common, cheap, effective for DC\n2. **MOV (metal oxide varistor)** — clamps to a fixed voltage, works for AC and DC\n3. **RC snubber** — resistor+capacitor across the load, also reduces ringing\n\nWithout protection: PLC output transistors fail, relay contacts arc severely, nearby electronics are damaged by EMI.",
      },
      {
        type: 'insight',
        title: 'Inductors in Series and Parallel',
        body: "Inductors combine like resistors (opposite of capacitors):\n\n**Series**: L_total = L₁ + L₂ + L₃\n**Parallel**: 1/L_total = 1/L₁ + 1/L₂ + 1/L₃\n\nThis assumes no mutual coupling (coils far apart or shielded). Closely coupled coils have mutual inductance M — their fields interact, which is how transformers work.",
      },
      {
        type: 'definition',
        title: 'Winding Resistance (DCR)',
        body: "Real inductors have resistance from the wire used in the winding — called **DCR (DC resistance)**. In DC steady state, DCR limits current: I = V / DCR. In AC analysis, DCR adds a series resistance to the pure inductance model.\n\nFor relay coils: DCR is specified (e.g., 400Ω for a 24VDC relay), limiting coil current to 60mA. For power inductors: DCR must be low to minimize I²R losses in the winding.",
      },
    ],
    visualizations: [
      {
        id: 'MagnetismViz',
        title: 'Solenoid Magnetic Field',
        mathBridge: "Switch to Solenoid mode. Increase current I — the field lines inside intensify (B ∝ nI). Increase turns N — field strength doubles per unit length for the same current. Toggle Iron core: permeability μ_r ≈ 1000 multiplies B by 1000×. This is why transformer and motor cores use iron — it concentrates magnetic flux dramatically.",
      },
    ],
  },

  math: {
    prose: [
      "**Inductance of a solenoid.** For a coil with N turns, length l, cross-sectional area A, and core permeability μ_r:\n\n$$L = \\frac{\\mu_0 \\mu_r N^2 A}{l}$$\n\nQuadrupling turns → 16× inductance (N²). Doubling length → halves inductance. Iron core (μ_r=1000) → 1000× inductance. A coil designed for a specific L can be achieved by trading off N, A, l, and core material.",
      "**Faraday's Law.** The back-EMF induced in N turns of a coil is:\n\n$$v = -N \\frac{d\\Phi}{dt} = -L \\frac{di}{dt}$$\n\nwhere Φ is the magnetic flux (Wb = V·s) through one turn. The negative sign (Lenz's law) states that the induced EMF opposes the change that caused it. This is the underlying physics behind V = L × dI/dt.",
      "**Flyback spike voltage.** When a switch opens in time Δt:\n\n$$V_{spike} = L \\frac{\\Delta I}{\\Delta t}$$\n\nFor L = 1mH, I = 2A, Δt = 100ns: V_spike = 0.001 × 2 / 100×10⁻⁹ = 20,000V. With a flyback diode, the spike is clamped to V_supply + V_diode (≈ 24.7V for a 24V circuit with 1N4001). The energy is then dissipated slowly through the coil resistance, and relay release time increases slightly.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Flyback Diode Selection',
        body: "For a DC inductive load (relay, solenoid, motor):\n\n1. **Voltage rating**: PIV ≥ V_supply (typically 2× for safety: 50V for 24V circuit)\n2. **Current rating**: I_F ≥ load steady-state current (not peak — flyback current = load current)\n3. **Standard choice**: 1N4001 (50V, 1A) works for most 24VDC control loads\n4. **Orientation**: anode to negative supply, cathode to positive supply (reverse bias in normal operation, forward bias during flyback)\n5. For high-speed switching (transistors >10kHz): use Schottky diode (lower forward voltage, faster recovery)",
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'In DC steady state, an inductor carries constant current. What voltage appears across it?',
      options: [
        'V = L × I — the voltage proportional to the current, like a resistor',
        'Zero — V = L × dI/dt and dI/dt = 0 in steady state, so the inductor looks like a short circuit',
        'The full supply voltage — inductors block DC current just as they block rapid changes',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What happens to the energy stored in an inductor\'s magnetic field when its current is suddenly interrupted?',
      options: [
        'The energy dissipates harmlessly as the current falls to zero',
        'The inductor generates a flyback voltage spike to maintain current flow — this spike can be thousands of volts and destroys unprotected transistor outputs',
        'The energy transfers to the capacitor of the nearest parallel circuit',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A flyback diode is placed in antiparallel (reverse) across a relay coil driven by a PLC transistor output. During normal relay operation, what does the diode do?',
      options: [
        'The diode conducts and limits the relay current to a safe level',
        'The diode is reverse-biased and conducts nothing — it only activates during the flyback spike when the transistor switches off',
        'The diode absorbs the extra voltage that the PLC output produces beyond 24V',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'How does an inductor differ from a capacitor in terms of what quantity it resists changing?',
      options: [
        'An inductor resists changes in voltage; a capacitor resists changes in current',
        'An inductor resists changes in current (V = L × dI/dt); a capacitor resists changes in voltage (I = C × dV/dt) — they are electrical duals',
        'Both resist changes in voltage; the difference is only in how much energy they store',
      ],
      correct: 1,
    },
  ],
};

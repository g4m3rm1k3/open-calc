export default {
  id: 'elec1-009',
  slug: 'magnetism-and-electromagnetism',
  chapter: 'elec1',
  order: 9,
  title: 'Magnetism and Electromagnetism',
  subtitle: 'Current creates magnetic fields, changing fields create voltage — the two laws that make motors, generators, and transformers possible.',
  tags: ['magnetism', 'electromagnetism', 'Faraday', 'Ampere', 'magnetic field', 'flux', 'force', 'motor', 'generator', 'transformer'],
  aliases: 'magnetism magnetic field Ampere Faraday induction flux motor force right hand rule solenoid electromagnet',
  timeToComplete: 30,
  coreConcept: "Two laws govern electromagnetism: Ampère's Law (current creates a magnetic field around it) and Faraday's Law (changing magnetic flux through a conductor induces a voltage in it). Together, these explain motors (current + field → force), generators (motion + field → voltage), and transformers (changing field in one coil → voltage in another).",
  prerequisites: ['elec1-007'],
  nextLesson: 'dc-power-sources',

  hook: {
    question: "A 480V, 30kW three-phase induction motor is drawing rated current but producing only 40% of rated torque. The motor frame is hotter than normal. What's happening in the magnetic circuit — and how do you know this from electromagnetic principles rather than just swapping the motor?",
    realWorldContext: "A motor not producing rated torque at rated current almost always means reduced magnetic flux — either low supply voltage (reduces field), high ambient temperature (increases winding resistance, reduces current for same voltage), or partial winding fault (fewer active turns, reduced ampere-turns). Torque is proportional to flux × current: T ∝ Φ × I. If I is correct but T is low, Φ must be reduced. Understanding electromagnetism means understanding why flux determines motor performance — and diagnosing problems rather than just replacing hardware.",
  },

  mentalModel: [
    "**Two separate phenomena, linked.** Magnetism and electricity were thought to be separate phenomena until Oersted (1820) discovered that a compass needle deflected near a current-carrying wire. Then Ampère mathematized the relationship (current → field). Then Faraday (1831) discovered the converse: a changing magnetic field induces a voltage in a conductor. Maxwell unified both into four equations. But for practical engineering, you only need these two: (1) current creates a magnetic field; (2) changing field creates voltage.",
    "**Field lines as a mental model.** Magnetic field lines form closed loops (unlike electric field lines, which start and end on charges). They emerge from north poles, enter south poles, and complete the loop inside the magnet. The density of field lines represents field strength (flux density B, measured in Tesla). More lines per area = stronger field = more force on any current-carrying wire in that field.",
    "**Right-hand rule — navigation in 3D.** For a straight wire: thumb points in current direction, fingers curl in the direction of magnetic field lines (circles around the wire). For a solenoid: curl fingers in the direction of current flow through the coils, thumb points toward the north pole. For force on a wire (F = IL × B): point fingers in current direction I, curl toward field B, thumb points in force direction F. One rule, three applications.",
  ],

  intuition: {
    prose: [
      "**Magnetic field around a wire — Ampère's Law.** A long straight wire carrying current I produces a circular magnetic field. At distance r from the wire, the field strength is B = μ₀I/(2πr). The field circles the wire in the direction given by the right-hand rule. Doubling current doubles field. Moving twice as far halves field. The Earth's magnetic field is about 50μT — a wire carrying 1A at 1cm distance produces B = 4π×10⁻⁷ × 1/(2π × 0.01) = 20μT, similar magnitude.",
      "**Solenoids — multiplying the field.** Coil N turns of wire into a cylinder and the field from each turn adds up inside. Inside a long solenoid: B = μ₀ × n × I where n = N/l (turns per meter). This is linear in both N and I — double either, double the field. Add an iron core (μ_r ≈ 1000–10,000): B multiplies by μ_r. This is how electromagnets, relay coils, and motor stators create strong, controllable fields from modest currents.",
      "**Faraday's Law — the generator principle.** If magnetic flux Φ through a conductor loop changes, a voltage (EMF) is induced: EMF = −dΦ/dt. The negative sign is Lenz's law: the induced current always opposes the change that caused it. A generator converts mechanical rotation into changing flux through its coils. A transformer converts AC voltage in one coil (primary) into a changing flux, which induces voltage in a second coil (secondary) — ratio proportional to turns ratio.",
      "**Force on a current in a magnetic field — the motor principle.** A wire carrying current I in a magnetic field B experiences force F = BIL sin(θ), where L is wire length and θ is the angle between I and B. Maximum force (θ = 90°): F = BIL. Direction: right-hand rule (or cross product F = IL × B). This force is what makes motors spin: current-carrying conductors in the rotor experience force from the stator's magnetic field. Torque = F × radius. Motor torque ∝ B × I — stronger field or more current means more torque.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: "Ampère's Law (Long Straight Wire)",
        body: "Magnetic field at distance r from a long straight wire:\n\n$$B = \\frac{\\mu_0 I}{2\\pi r}$$\n\nwhere μ₀ = 4π × 10⁻⁷ T·m/A (permeability of free space).\n\nFor a solenoid: $B = \\mu_0 \\mu_r n I$ where n = N/l (turns/meter).",
      },
      {
        type: 'theorem',
        title: "Faraday's Law of Induction",
        body: "Induced EMF in a loop:\n\n$$\\mathcal{E} = -N \\frac{d\\Phi}{dt}$$\n\nwhere Φ = BA cos(θ) is magnetic flux (Weber, Wb).\n\nLenz's law (the negative sign): induced current always creates a field opposing the change.\n\n**Applications**: generators (rotating coil changes flux), transformers (AC current changes flux), speedometer pickups (rotating toothed wheel changes flux through sensor coil).",
      },
      {
        type: 'theorem',
        title: 'Lorentz Force — Motor Principle',
        body: "Force on a current-carrying conductor in magnetic field:\n\n$$F = BIL\\sin\\theta$$\n\nMaximum when I ⊥ B (θ = 90°): F = BIL.\n\nDirection: F = IL × B (cross product — right-hand rule).\n\nMotor torque: T = F × r = BILr (where r = radius of rotation).\n\nFor N conductors: T = N × BILr = kΦI (proportional to flux × current).",
      },
      {
        type: 'insight',
        title: 'Transformer Turns Ratio',
        body: "A transformer uses Faraday's law in both directions. AC in primary creates changing flux. Same flux thread through secondary induces voltage:\n\n$$\\frac{V_s}{V_p} = \\frac{N_s}{N_p}$$\n\nIf N_s > N_p: step-up transformer (higher voltage, lower current).\nIf N_s < N_p: step-down transformer (lower voltage, higher current).\n\nPower is conserved (ideal): P_p = P_s, so V_p I_p = V_s I_s. This is how 480VAC is stepped down to 24VAC for control circuits.",
      },
      {
        type: 'definition',
        title: 'Magnetic Flux and Flux Density',
        body: "**Magnetic flux density B** (Tesla): field strength — how many field lines per square meter. A strong permanent magnet: ~1T. Earth's field: ~50μT.\n\n**Magnetic flux Φ** (Weber): total field 'flow' through an area: Φ = BA cos(θ).\n\n**Magnetomotive force (MMF)**: NI (ampere-turns) — drives flux through a magnetic circuit, analogous to EMF driving current in an electric circuit.\n\n**Reluctance**: opposition to flux in a magnetic core — analogous to resistance in an electric circuit.",
      },
      {
        type: 'warning',
        title: 'Magnetic Core Saturation',
        body: "At high currents, iron cores reach **saturation** — the magnetic domains are all aligned and no more flux can be added. Beyond saturation, the core's μ_r drops to nearly 1, inductance collapses dramatically, and current spikes dangerously high. Symptoms: transformer runs hot, abnormal hum, excessive magnetizing current. Protection: never run transformers or inductors beyond rated voltage/current, as this can cause saturation and subsequent overcurrent damage.",
      },
    ],
    visualizations: [
      {
        id: 'MagnetismViz',
        title: 'Magnetic Field Explorer',
        mathBridge: "Wire mode: increase current — field circles intensify (B ∝ I). Negative current reverses field direction. Solenoid mode: increase N (turns) — more field lines inside. Toggle iron core — permeability μ_r ≈ 1000 boosts B dramatically. Motor Force mode: F = BIL — change current or field strength and watch the force arrow change. Reverse current to see force reverse.",
      },
    ],
  },

  math: {
    prose: [
      "**Magnetic flux and Faraday's law.** Flux through area A: $\\Phi = BA\\cos\\theta$. Induced EMF: $\\mathcal{E} = -N d\\Phi/dt$. For a generator with N-turn coil rotating at angular speed ω in field B:\n\n$$\\mathcal{E}(t) = NBA\\omega \\sin(\\omega t)$$\n\nThis is sinusoidal — the origin of AC voltage. The peak EMF = NBAω. Higher N, B, A, or ω → higher peak voltage. This is how generator output is controlled: vary field current (B) to control output voltage.",
      "**Force on a current-carrying conductor.** For a conductor of length L carrying current I at angle θ to field B: F = BIL sin θ. For a rectangular N-turn coil of dimensions a × b in field B:\n\n$$T = NIAB\\sin\\theta$$\n\nThis is the torque equation for a basic DC motor. Maximum torque at θ = 90° (coil plane parallel to field). In a practical motor, commutator or inverter ensures conductors are always near θ = 90° for maximum torque.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Transformer Design (Basic)',
        body: "For a 60Hz transformer, Faraday's law gives:\n\n$$N = \\frac{V_{rms}}{4.44 f B_{max} A_c}$$\n\nwhere V_rms = output voltage, f = frequency, B_max = max flux density (typically 1–1.5T for silicon steel), A_c = core cross-sectional area.\n\nThis gives the minimum turns needed. More turns → less flux density → less core loss, but more copper loss. Transformer design optimizes between core loss and copper loss.",
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'What did Faraday discover about the relationship between magnetism and electricity?',
      options: [
        'A constant magnetic field induces a constant voltage in a nearby conductor',
        'A changing magnetic flux through a conductor induces a voltage — without change there is no induction',
        'A magnetic field directly forces electrons to move, creating current proportional to field strength',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A motor drawing rated current produces only 40% of rated torque. Torque is proportional to flux × current. What does this imply?',
      options: [
        'The motor is overloaded and needs a larger frame size',
        'The magnetic flux must be reduced — likely due to low supply voltage, high winding temperature, or a partial winding fault',
        'The motor is operating correctly — torque and current are never proportional in induction motors',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A transformer has 240 turns on the primary and 24 turns on the secondary, with 480V AC on the primary. What is the secondary voltage?',
      options: [
        '4800V — more primary turns means higher secondary voltage',
        '48V — the turns ratio 240:24 = 10:1 steps voltage down by a factor of 10',
        '480V — transformer output equals input voltage regardless of turns ratio',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What happens to an iron-core inductor or transformer when it reaches magnetic saturation?',
      options: [
        'It becomes more efficient — saturation aligns all domains and reduces energy loss',
        'The core\'s permeability collapses to near 1, inductance drops dramatically, and current can spike to dangerous levels',
        'Saturation causes the core to permanently retain its maximum magnetic field',
      ],
      correct: 1,
    },
  ],
};

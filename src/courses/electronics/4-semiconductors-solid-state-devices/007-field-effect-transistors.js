export default {
  id: 'elec3-007',
  slug: 'field-effect-transistors',
  chapter: 'elec3',
  order: 7,
  title: 'Field-Effect Transistors — JFET, MOSFET, and Gate-Controlled Conduction',
  subtitle: 'How voltage on a gate controls a drain current without base current, why FETs dominate digital logic and power electronics, and the key parameters that determine switching performance.',
  tags: ['MOSFET', 'JFET', 'FET', 'gate', 'drain', 'source', 'enhancement mode', 'depletion mode', 'threshold voltage', 'transconductance', 'NMOS', 'PMOS', 'RDSon', 'power MOSFET'],
  aliases: 'MOSFET JFET field effect transistor gate drain source enhancement mode depletion mode threshold voltage transconductance NMOS PMOS power MOSFET RDS on switching',
  timeToComplete: 25,
  coreConcept: "A field-effect transistor controls drain current by the electric field from the gate voltage — not by gate current. For MOSFETs, the gate is insulated from the channel by SiO₂, so gate current is essentially zero (nanoamperes leakage). This makes MOSFETs voltage-controlled and easy to drive from logic ICs. The power MOSFET's on-resistance RDS(on) determines conduction loss; gate charge Qg determines switching loss. These two parameters govern all tradeoffs in power electronics from motor drives to EV inverters.",
  prerequisites: ['elec3-006'],
  nextLesson: 'thyristors-and-power-devices',

  hook: {
    question: "A 48V BLDC motor controller is running 40A through the output MOSFETs. The design uses IPP110N20N3 MOSFETs (RDS(on) = 11mΩ, each). At full current, the PCB traces between drain and source connections are showing 1.2°C/W thermal resistance. The MOSFET junction temperature is reaching 142°C at 50°C ambient. Calculate conduction losses, and explain why a lower-RDS(on) device is not always the solution.",
    realWorldContext: "Conduction loss P = I² × RDS(on) = 40² × 0.011 = 17.6W per MOSFET. At 142°C junction vs 50°C ambient, the thermal resistance junction-to-ambient is (142-50)/17.6 = 5.2°C/W — which matches the sum of MOSFET Rθjc + PCB copper + heatsink. Lower RDS(on) devices (better silicon) cost more and often have higher gate charge Qg — which increases switching losses at high frequency. The engineer must balance conduction and switching losses, not just minimize RDS(on). SiC MOSFETs offer both lower RDS(on) and lower Qg at 600–1700V ratings, which is why they dominate modern EV inverters despite costing 5–10× more than silicon.",
  },

  mentalModel: [
    "**JFET: depletion-mode, normally ON.** A JFET (Junction FET) has a physical conduction channel between drain and source. Gate is a reverse-biased PN junction. Reverse gate-source voltage (VGS negative for N-channel) widens the depletion region into the channel, narrowing it and reducing drain current. At VGS = VP (pinch-off voltage, negative for N-channel), the channel is fully depleted and ID = 0. JFETs are normally ON — they conduct at VGS = 0. The gate draws no current (reverse-biased junction, picoamps). Used in audio circuits for low-noise, high-input-impedance stages, and in antenna preamplifiers.",
    "**MOSFET: enhancement-mode, normally OFF (most common).** An enhancement-mode NMOS has no conduction channel at VGS = 0. Applying positive VGS above threshold voltage VTH attracts electrons to the surface under the gate oxide, forming an inversion layer (n-channel) connecting source to drain. Drain current increases with (VGS − VTH)². This is the standard logic transistor and power switch. Gate is isolated by SiO₂ — draws no current in steady state (only displacement current during switching). Gate charge Qg determines how much charge must be sourced to charge the gate for switching.",
    "**Power MOSFET as a switch: RDS(on) and SOA.** In full enhancement (VGS >> VTH), the MOSFET operates in the ohmic (triode) region where it behaves like a small resistor RDS(on). Conduction loss = ID² × RDS(on). RDS(on) increases with temperature (positive TC) — unlike BJTs, MOSFETs have natural current sharing in parallel and don't thermally run away. However, at high drain-source voltage and current simultaneously (during switching transitions), the device must operate within the Safe Operating Area (SOA) — an envelope defined by peak current, peak voltage, and transient power.",
  ],

  intuition: {
    prose: [
      "**MOSFET regions of operation.** (1) Cutoff: VGS < VTH, ID = 0. (2) Triode (ohmic): VGS > VTH and VDS < (VGS − VTH). ID ≈ kn × [(VGS − VTH)×VDS − VDS²/2]. Behaves like a resistor. RDS(on) ≈ 1/(kn × (VGS − VTH)). (3) Saturation (pinch-off): VGS > VTH and VDS ≥ (VGS − VTH). ID = (kn/2)(VGS − VTH)² — independent of VDS. This is the amplifier region. Power MOSFETs are operated in triode (as switches); MOSFET amplifiers use the saturation region.",
      "**Gate drive requirements.** The MOSFET gate is a capacitor (Cox × WL). It draws no DC current but requires charge Qg to transition from off to on. Gate current IG = Qg / t_rise — to switch a device with Qg = 100 nC in 100 ns requires peak gate current of 1A. Gate drive ICs provide this current from a low-impedance source. Insufficient gate drive = slow switching transitions = more time in the linear region = more switching losses = overheating. In industrial motor drives, inadequate gate drive is a common cause of IGBT failures — the devices never fully switch, spending excessive time in high-dissipation linear operation.",
      "**MOSFET body diode and synchronous rectification.** Every power MOSFET contains a parasitic body diode (N+ source to P-body to N- drain substrate) that conducts when VDS goes negative (body diode forward biases). In bridge configurations (H-bridge, three-phase inverters), this body diode conducts current during the dead time between complementary MOSFET switches. The body diode is slower and lossier than a Schottky diode — in high-frequency circuits, an external Schottky diode in parallel improves efficiency. Alternatively, synchronous rectification turns the low-side MOSFET on during the body diode conduction period, using RDS(on) instead of VF — reducing losses from ~0.7V × I to I² × RDS(on).",
      "**NMOS vs PMOS: why NMOS is preferred.** Electron mobility in silicon is ~2.5× higher than hole mobility. Same gate geometry → NMOS has 2.5× more current per unit area, or 2.5× lower RDS(on) for same size. NMOS also has lower threshold voltage variation. The tradeoff: N-channel MOSFETs (low-side switches) need the gate above the source, which is grounded — simple. High-side N-channel switches need a bootstrapped gate drive (gate must be driven above the +rail voltage, up to 20V above drain). Bootstrap gate driver ICs handle this. PMOS high-side switches are simpler to drive but larger and slower for the same current rating.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'MOSFET Drain Current Equations',
        body: "**Triode region** (VGS > VTH, VDS < VGS − VTH):\n$$I_D = k_n \\left[(V_{GS}-V_{TH})V_{DS} - \\frac{V_{DS}^2}{2}\\right]$$\n\n**Saturation region** (VGS > VTH, VDS ≥ VGS − VTH):\n$$I_D = \\frac{k_n}{2}(V_{GS} - V_{TH})^2$$\n\nwhere kn = μn × Cox × W/L (process transconductance parameter)\n\n**On-resistance:** $$R_{DS(on)} = \\frac{1}{k_n(V_{GS} - V_{TH})}$$\n\nRDS(on) decreases as VGS increases — drive gate fully for minimum loss.",
      },
      {
        type: 'definition',
        title: 'JFET Drain Current (Shockley Equation)',
        body: "$$I_D = I_{DSS}\\left(1 - \\frac{V_{GS}}{V_P}\\right)^2 \\quad \\text{for } V_P \\leq V_{GS} \\leq 0$$\n\nwhere:\n- IDSS = drain current at VGS = 0 (typically 1–20 mA for signal JFETs)\n- VP = pinch-off voltage (negative for N-channel, typically −1 to −10V)\n\n**Transconductance:** $$g_m = \\frac{-2I_{DSS}}{V_P}\\left(1 - \\frac{V_{GS}}{V_P}\\right) = g_{m0}\\sqrt{\\frac{I_D}{I_{DSS}}}$$",
      },
      {
        type: 'insight',
        title: 'Why Power MOSFETs Don\'t Thermally Run Away',
        body: "In a BJT: IC = β × IB, and β increases with temperature → thermal runaway. In a MOSFET: ID depends on mobility μ, which decreases with temperature (µ ∝ T^−2.3). Higher temperature → lower mobility → lower ID for the same VGS. This negative temperature coefficient of drain current provides inherent thermal stability. Paralleled power MOSFETs naturally share current: if one device runs hotter, its RDS(on) increases, diverting current to cooler devices. This self-balancing makes large parallel MOSFET arrays practical in EV inverters without emitter ballast resistors.",
      },
      {
        type: 'procedure',
        title: 'Testing a Power MOSFET with a Multimeter',
        body: "1. Discharge gate: short gate to source briefly to ensure VGS = 0\n2. **Body diode check**: Red → source, Black → drain. Should read ~0.5–0.7V (body diode forward). Reverse: OL.\n3. **Cutoff check**: Red → drain, Black → source (NMOS). With VGS = 0: should read OL (not conducting). If reads low resistance → failed shorted.\n4. **Turn-on test**: Charge gate by touching gate to drain briefly. Then measure drain-source resistance: should drop to near 0Ω (channel conducting). Short gate to source → channel turns off → drain-source returns to high resistance.\n5. **Gate integrity**: measure gate-to-drain and gate-to-source: both should read OL (oxide intact). Low reading → oxide breakdown.",
      },
      {
        type: 'warning',
        title: 'Gate Oxide Failure and ESD Precautions',
        body: "MOSFET gate oxide is 5–15 nm thick and rated for ~20V max (standard) or 10V (logic-level MOSFETs). Static discharge of 100–300V instantly ruptures the oxide — the MOSFET fails short gate-to-source or gate-to-drain. Signs: device reads shorted everywhere, or VGS_TH = 0 (always on). In industrial installations: MOSFETs in VFD output stages fail from overvoltage transients if gate clamping Zeners are missing or failed. During PCB rework: handle with ESD strap, keep gate shorted to source during storage, never touch pins with bare hands in dry environments.",
      },
      {
        type: 'theorem',
        title: 'MOSFET Switching Losses',
        body: "$$P_{sw} = \\frac{1}{2} V_{DS} \\cdot I_D \\cdot (t_r + t_f) \\cdot f_{sw}$$\n\nwhere tr = rise time, tf = fall time, fsw = switching frequency\n\n**Gate charge relation:** $t_r \\approx Q_g / I_{gate}$\n\n**Total MOSFET losses:**\n$$P_{total} = I_D^2 \\cdot R_{DS(on)} + P_{sw} + Q_{oss} \\cdot V_{DS} \\cdot f_{sw}$$\n\nAt low frequency: conduction loss dominates → minimize RDS(on)\nAt high frequency: switching loss dominates → minimize Qg and Coss",
      },
    ],
    visualizations: [
      {
        id: 'TransistorViz',
        title: 'MOSFET Transfer Curve — ID vs VGS',
        mathBridge: "Select MOSFET mode. The transfer curve (ID vs VGS) shows the threshold voltage VTH where drain current starts — typically 2–4V for standard power MOSFETs, 1–2V for logic-level devices. Below VTH: cutoff (ID ≈ 0). Above VTH: ID rises as (VGS − VTH)². Move the VGS slider above VTH and observe ID increasing quadratically. This is the saturation region used for analog amplification. In power switching: VGS is driven to 10–15V to minimize RDS(on) — operating deep in the ohmic region.",
      },
    ],
  },

  math: {
    prose: [
      "**MOSFET transconductance.** In the saturation region, gm = dID/dVGS = kn(VGS − VTH). At a given operating point: gm = 2ID/(VGS − VTH) = √(2×kn×ID). For an audio MOSFET at ID = 10 mA, kn = 10 mA/V²: gm = √(2 × 0.01 × 0.01) = 0.0141 A/V = 14.1 mA/V. Common-source voltage gain: Av = −gm × RD. For RD = 10 kΩ: Av = −141. MOSFET amplifiers have lower transconductance than BJTs at the same current (gm = IC/VT = 385 mA/V at 10 mA for BJT vs ~14 mA/V for MOSFET) — but the near-infinite input impedance and rail-to-rail swing capability often outweigh the gain disadvantage.",
      "**Small-signal MOSFET model.** The MOSFET small-signal model has: gate-to-source capacitance Cgs (dominant), gate-to-drain capacitance Cgd (Miller effect), current source gm×vgs from drain to source, and output resistance ro = |VA|/ID. The Miller capacitance effect: Cgd appears as Cgs_eff = Cgd × (1 − Av) at the input, multiplied by the voltage gain magnitude. For Av = −100 and Cgd = 5 pF: input Miller capacitance = 505 pF. This dramatically lowers the amplifier's input pole frequency: f_in = 1/(2π×Rsource×Cgs_eff) — a key bandwidth limiter in MOSFET amplifiers.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Gate Resistor Selection for MOSFET Switching',
        body: "Gate resistor RG controls dVGS/dt and thus di/dt and dv/dt:\n\n1. **Maximum dv/dt**: limited by motor insulation, snubber capability\n2. **Switching time**: t_sw ≈ RG × Qg / (VGS_drive − VTH)\n3. **Gate oscillation damping**: Rg_min ≈ 1–10Ω to prevent parasitic LC oscillation (gate inductance + Ciss)\n4. **EMI vs loss tradeoff**: faster switching (lower RG) → higher dv/dt → more EMI; slower switching (higher RG) → less EMI but higher switching losses\n\nTypical range: RG = 5–47Ω for hard-switching; 0–5Ω for soft-switching (ZVS topologies)\n\n**Separate turn-on/turn-off resistors** using steering diode: allows faster turn-off than turn-on to minimize shoot-through.",
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A JFET is described as "normally ON" while an enhancement-mode MOSFET is "normally OFF." What is the key structural difference that causes this?',
      options: [
        'JFETs use P-type material while MOSFETs use N-type material, and P-type naturally conducts at zero bias',
        'A JFET has a physical conduction channel at VGS = 0; an enhancement MOSFET has no channel at VGS = 0 — the gate voltage must create one by attracting carriers to the surface under the gate oxide',
        'MOSFETs have a thicker gate oxide that requires more voltage to turn on',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A power MOSFET has RDS(on) = 10 mΩ and carries 50A. What is its conduction power loss?',
      options: [
        '0.5W — P = V × I = 0.01 × 50',
        '25W — P = I² × RDS(on) = 50² × 0.010 = 25W',
        '250W — P = I × VDS where VDS = I × RDS(on) = 0.5V',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Unlike BJTs, paralleled power MOSFETs naturally share current without emitter ballast resistors. Why?',
      options: [
        'MOSFETs are voltage-controlled so they don\'t draw any current from the gate driver, preventing imbalance',
        'MOSFET RDS(on) has a positive temperature coefficient — if one device runs hotter and tries to take more current, its resistance increases, diverting current to cooler devices and self-balancing the array',
        'All MOSFETs from the same manufacturer are matched to within 1% on RDS(on), ensuring equal current sharing',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A motor drive MOSFET switches at 100 kHz. The engineer considers a new device with half the RDS(on) but twice the gate charge Qg. What tradeoff must they evaluate?',
      options: [
        'Lower RDS(on) always wins — conduction losses are more important than switching losses',
        'At high frequency, switching losses (∝ Qg × fsw) can dominate over conduction losses (∝ RDS(on)) — doubling Qg at 100 kHz may increase total losses despite the halved RDS(on)',
        'Gate charge only matters for the gate driver IC selection, not for total power efficiency',
      ],
      correct: 1,
    },
  ],
};

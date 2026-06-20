export default {
  id: 'elec3-008',
  slug: 'thyristors-and-power-devices',
  chapter: 'elec3',
  order: 8,
  title: 'Thyristors & Power Devices — SCR, TRIAC, DIAC, IGBT, and Phase Control',
  subtitle: 'The latching switch devices that control kilowatts with milliwatts of gate signal — from light dimmers and motor speed controllers to megawatt industrial drives and HVDC transmission.',
  tags: ['SCR', 'thyristor', 'TRIAC', 'DIAC', 'IGBT', 'phase control', 'firing angle', 'latching current', 'holding current', 'commutation', 'power control', 'motor drive'],
  aliases: 'SCR thyristor TRIAC DIAC IGBT phase control firing angle silicon controlled rectifier motor speed control power control industrial drive commutation',
  timeToComplete: 25,
  coreConcept: "A Silicon Controlled Rectifier (SCR) is a four-layer PNPN device that fires (latches on) when gate current is applied and remains on until current falls below the holding current. This latching behavior makes SCRs ideal for high-power AC phase control — by delaying the firing angle α on each half-cycle, average power delivered to a load is varied from 0 to 100%. TRIACs extend this to bidirectional AC control. IGBTs combine the high input impedance of a MOSFET gate with the low saturation voltage of a BJT — they are the dominant switching device in modern motor drives, welders, and EV inverters from 600V to 6500V.",
  prerequisites: ['elec3-007'],
  nextLesson: 'integrated-circuits',

  hook: {
    question: "A 600A, 480VAC AC motor drive using IGBT output stage is failing with intermittent overcurrent faults at startup. The motor is a 200 HP induction motor. Analysis shows the IGBT gate drive signals are clean. The DC bus is 680VDC. During the fault, a current probe shows the phase current reaching 1800A peak before the protection trips. Why might IGBTs in a properly designed drive produce 3× rated current at startup, and what protection mechanism should catch this?",
    realWorldContext: "Induction motor startup draws 6–8× full-load current for 1–3 seconds due to low initial rotor speed and hence low back-EMF. A 200 HP motor rated 240A at full load draws ~1600A at startup with direct-on-line starting. A VFD (Variable Frequency Drive) using IGBTs ramps frequency and voltage from 0 to avoid this inrush — but if the control algorithm applies full voltage too quickly, or if there's a load jam, peak currents can briefly reach 3× rated. The IGBT's SOAS (Safe Operating Area for Switching) specifies maximum collector current during switching; the drive's current limit comparator and IGBT gate driver desaturation detection (VCE monitoring) should trip within 2–4 μs to protect the device. Understanding IGBT device physics tells you exactly how the protection must work.",
  },

  mentalModel: [
    "**SCR: four-layer latch with gate trigger.** The SCR is a PNPN structure (anode P-N-P-N cathode) equivalent to a PNP transistor (Q1) with its collector driving the base of an NPN transistor (Q2), and Q2's collector driving Q1's base — a regenerative feedback loop. When gate current is injected into Q2's base, both transistors turn on and saturate, latching the device in the on state. Current then flows through the device regardless of gate signal. The SCR stays on (latched) until anode current drops below the holding current IH. In AC circuits, the SCR naturally commutates (turns off) at each current zero crossing.",
    "**Phase control: the firing angle.** In a phase-controlled rectifier or AC power controller, the SCR is triggered at a delay angle α (0° to 180°) after the voltage zero crossing. Average DC output voltage: Vdc = (Vm/2π)(1 + cos α) for a half-wave circuit. At α = 0°: full output. At α = 90°: half output. At α = 180°: zero output. This continuously variable power control from 0 to 100% is why phase control SCRs are used in resistance heater controllers, light dimmers (old-style), and DC motor speed controls. The firing angle is set by comparing a ramp voltage (synchronized to line frequency) with a control reference.",
    "**IGBT: MOSFET gate, BJT output.** The Insulated Gate Bipolar Transistor combines a MOSFET input stage (voltage-controlled, high input impedance, easy gate drive) with a bipolar output stage (PNP transistor for conductivity modulation). Conductivity modulation — minority carrier injection into the drift region — greatly reduces the ON voltage compared to a MOSFET of equivalent voltage rating. An equivalent 1200V MOSFET might have RDS(on) = 1Ω and conduct with VDS = 10V at 10A. A 1200V IGBT has VCE(sat) = 2–3V at 10A regardless of current — much lower loss at high current. The tradeoff: IGBTs are slower than MOSFETs (minority carrier storage causes turn-off tail current).",
  ],

  intuition: {
    prose: [
      "**SCR triggering and latching.** Gate trigger current IGT (typically 5–50 mA for medium power SCRs, up to 200 mA for large thyristors) must be applied as a pulse, not DC. After triggering, gate has no control — the SCR is latched on by regenerative feedback regardless of gate signal. Minimum latching current IL > IH (typically 2× holding current) must be established before the gate pulse ends, or the SCR won't latch. In inductive circuits (motor loads), current rises slowly — gate pulse must be wide enough (1–100 ms) to allow current to build past IL. For gate trigger circuits: use an optocoupler or pulse transformer for isolation between control and power circuits.",
      "**TRIAC: bidirectional SCR for AC control.** A TRIAC is two SCRs in anti-parallel sharing a common gate. It can be triggered in either direction of current flow, in any of four quadrant combinations (positive/negative MT2-to-MT1 voltage, positive/negative gate current). For AC load control (light dimmers, heating elements, soft starters): TRIAC is simpler than two back-to-back SCRs. Triggering sensitivity varies by quadrant — the DIAC is often used as a bilateral trigger device to ensure consistent firing in both half-cycles. TRIAC ratings up to 40A, 800V for industrial use. Above 40A, two SCRs back-to-back are preferred (TRIACs don't scale as well for high-power three-phase control).",
      "**IGBT safe operating area and desaturation detection.** An IGBT's collector-emitter voltage in saturation is VCE(sat) = 1.5–3V (rated current, 25°C). Under fault conditions (short circuit), collector current rises rapidly and VCE rises out of saturation to 5–15V — this is detectable by the gate driver circuit monitoring VCE. If VCE exceeds the desaturation threshold (typically 7–9V), the gate driver initiates a 'soft turn-off' — gradually reducing gate voltage to limit di/dt and prevent voltage spikes from the circuit inductance. This soft turn-off within 2–4 μs protects the IGBT from the catastrophic energy of a short-circuit fault. Modern IGBT gate driver ICs (e.g., SCALE-2, CONCEPT) include desaturation detection, soft turn-off, and active Miller clamping as standard features.",
      "**DIAC trigger device.** A DIAC is a two-terminal, symmetrical thyristor that fires (transitions from off to on) when the voltage across it exceeds its breakover voltage VBO (typically 28–36V), in either polarity. Once triggered, it fires like a small SCR and injects a gate pulse into the TRIAC. The DIAC's breakover provides a threshold so the TRIAC only fires at a significant delay angle — preventing triggering on noise. The RC phase-shift network (R adjustable from 0 to ~500kΩ, C = 0.1 μF) delays when the DIAC reaches VBO each half-cycle, setting the firing angle α continuously from ~10° to ~170°. This RC-DIAC-TRIAC circuit is in every consumer light dimmer and many industrial heating controllers.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'SCR Phase Control — Output Voltage',
        body: "**Single-phase half-wave phase control:**\n$$V_{dc} = \\frac{V_m}{2\\pi}(1 + \\cos\\alpha)$$\n\n**Single-phase full-wave (two SCRs, center-tap):**\n$$V_{dc} = \\frac{V_m}{\\pi}(1 + \\cos\\alpha)$$\n\n**Three-phase fully controlled bridge:**\n$$V_{dc} = \\frac{3\\sqrt{3}}{\\pi}V_{m,LL}\\cos\\alpha = 1.35\\,V_{LL}\\cos\\alpha$$\n\nwhere α = firing angle (0° = full output, 90° = zero average, 180° = full reverse for 4-quadrant drives)\n\n**Example:** 480VAC 3-phase at α = 45°: Vdc = 1.35 × 480 × cos(45°) = 457V",
      },
      {
        type: 'definition',
        title: 'IGBT Key Parameters',
        body: "| Parameter | Meaning | Typical Value (1200V/50A) |\n|---|---|---|\n| VCE(sat) | On-state voltage at rated current | 1.7–2.5V |\n| VGE(th) | Gate threshold | 5–6V |\n| VGE(op) | Recommended gate drive | +15V on, −15V off |\n| Qg | Total gate charge | 150–400 nC |\n| td(on) | Turn-on delay | 50–100 ns |\n| tfall | Current fall time | 100–500 ns |\n| BVCES | Collector-emitter breakdown voltage | 1200V |\n| ICnom | Rated continuous collector current | 50A |\n| SC withstand | Short-circuit withstand time | 5–10 μs |",
      },
      {
        type: 'procedure',
        title: 'SCR Circuit Testing and Verification',
        body: "**Bench test for SCR functionality:**\n1. Connect anode to +12V through 100Ω resistor; cathode to ground\n2. Momentarily connect gate to +1.5V through 470Ω: SCR should latch ON (voltage across 100Ω ≈ 12V × duty)\n3. Measure anode voltage: should drop to ~1V (on-state)\n4. Remove gate signal: SCR should remain latched\n5. Momentarily short anode to cathode (or reduce supply below IH): SCR should turn off\n6. Reverse anode-cathode: should read OL (SCR is unidirectional)\n\n**Field test with multimeter (diode mode):**\n- Gate to cathode: 0.6–0.8V forward. No current in reverse.\n- Anode to cathode: OL both ways (no gate current → off state). If reads low resistance in both → failed short.",
      },
      {
        type: 'insight',
        title: 'Why IGBTs Dominate at 600V–6500V',
        body: "Below 200V: MOSFETs win — RDS(on) is low enough to have lower conduction loss than an IGBT's VCE(sat), and switching is faster. Above 600V: a silicon MOSFET's RDS(on) scales as V^2.5 (breakdown voltage requirement forces thicker, higher-resistivity drift region). A 1200V MOSFET would have RDS(on) = tens of ohms — useless for power switching. An IGBT's conductivity modulation keeps VCE(sat) flat at 2–3V regardless of voltage rating. At 3300V and above: IGBTs are the only practical silicon option. SiC MOSFETs are challenging IGBTs in the 600–1700V range due to superior switching characteristics and improving on-resistance, but GTO (Gate Turn-Off Thyristors) and IEGT (Injection Enhanced Gate Transistors) still serve the highest power levels (multi-MW).",
      },
      {
        type: 'warning',
        title: 'SCR Turn-Off and Commutation Failure',
        body: "An SCR in an AC circuit depends on the natural zero crossing of current to turn off (natural commutation). If the load is highly inductive, current lags voltage — the SCR may still be conducting when the next firing angle arrives, preventing the next SCR from firing. This commutation failure causes a DC short-circuit through the converter. For highly inductive DC motor loads: reduce firing angle rate of change, add commutation capacitors, or use forced commutation circuits. IGBTs and MOSFETs can be turned off by removing gate drive at any time — they don't have the natural commutation constraint of SCRs. This is why modern VFDs use IGBTs rather than SCRs for the output inverter stage.",
      },
      {
        type: 'theorem',
        title: 'IGBT Turn-Off Loss and Tail Current',
        body: "IGBT turn-off involves removing the gate charge (fast) but the bipolar output stage has stored minority charge that must recombine before current falls to zero. This creates a 'tail current' that decays exponentially after the rapid initial current drop:\n\n$$E_{off} = \\frac{1}{2}V_{CC}\\,I_C\\,t_{fall} + \\frac{1}{2}V_{CC}\\,I_{tail}\\,t_{tail}$$\n\nTail current increases with temperature and carrier lifetime. 'Fast' IGBTs reduce tail current by lower carrier lifetime (platinum/electron irradiation doping) at the cost of slightly higher VCE(sat). 'Soft-switching' topologies (ZVS, ZCS) eliminate switching losses by ensuring the IGBT only switches at zero voltage or zero current.",
      },
    ],
    visualizations: [
      {
        id: 'OhmViz',
        title: 'Phase Control Load Power vs Firing Angle',
        mathBridge: "Use OhmViz to explore the relationship between firing angle, output voltage, and load power. At α = 0°, the SCR fires at the zero crossing — full-wave rectification, maximum average voltage. At α = 90°, the SCR fires at the peak — half average voltage, 25% average power. Plot V = Vm×cos(α)/π (half-wave approximation) and P = V²/R to see the nonlinear relationship between firing angle (your control knob) and delivered power (what the load sees).",
      },
    ],
  },

  math: {
    prose: [
      "**Power delivered by phase-controlled AC.** For a resistive load (heater) controlled by a TRIAC at firing angle α, RMS voltage: Vrms = Vm × √((1/2π) × (π − α + sin(2α)/2)) = Vm/√2 × √(1 − α/π + sin(2α)/2π). Power P = Vrms²/R. At α = 0°: P = Vm²/(2R) = full power. At α = 90°: P = Vm²/(4R) = 50% power. At α = 120°: P ≈ 25% power. The relationship is nonlinear — proportional to (1 − α/π + sin(2α)/2π), which means equal steps in firing angle give unequal steps in power. Industrial thyristor controllers linearize this relationship in firmware by using a lookup table of α vs power fraction.",
      "**IGBT switching energy and thermal calculations.** From the device datasheet, switching energies Eon and Eoff are specified at reference conditions (VCC_ref, IC_ref, RG_ref). Scale to actual conditions: Eon_actual = Eon_datasheet × (VCC/VCC_ref) × (IC/IC_ref). For a 1200V IGBT with Eon = 5 mJ at 600V/50A, running at 600V/30A: Eon_actual = 5 × (600/600) × (30/50) = 3 mJ. At 10 kHz: switching power loss = (Eon + Eoff) × fsw = 8 mJ × 10,000 = 80W per switch. For a three-phase inverter with 6 switches: Psw_total = 6 × 80W = 480W. Add conduction loss: Pcond = IC_rms² × ... (see IGBT datasheet Ic vs VCE curves).",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Selecting an SCR for AC Phase Control',
        body: "1. **Voltage**: VDRM ≥ 1.5 × √2 × Vrms (repetitive peak forward blocking + 50% margin)\n   For 240VAC: VDRM ≥ 1.5 × 340 = 510V → use 600V SCR\n2. **Current**: IT(AV) from datasheet at the derated junction temperature and heatsink\n   Typical derating: use 50% of IT(AV) at 25°C for industrial applications\n3. **Gate trigger**: IGT ≤ available gate drive current; VGT ≤ available gate drive voltage\n4. **dV/dt and dI/dt ratings**: must exceed worst-case rates in circuit. Add RC snubber across SCR if dV/dt is concern.\n5. **Turn-off time tq**: must exceed commutation time of circuit topology at minimum firing angle",
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'An SCR is triggered with a gate pulse and conducts load current. The gate pulse is then removed. What happens to the SCR?',
      options: [
        'The SCR turns off immediately when gate current is removed — the gate controls the on/off state at all times',
        'The SCR stays latched ON — it can only turn off when anode current falls below the holding current, such as at the next AC zero crossing',
        'The SCR reduces current proportionally to the gate signal and gradually turns off over one cycle',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'An SCR phase controller delays the firing angle α from 0° to 90°. How does this affect average power to a resistive heater?',
      options: [
        'Power is halved — the SCR blocks the first 90° of each half-cycle, cutting average voltage to 50%',
        'Power is unchanged — average voltage depends on peak voltage, not firing angle',
        'Power drops to about 25% — average output voltage is roughly halved by 90° delay, and power varies as V²',
      ],
      correct: 2,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why do modern variable frequency drives use IGBTs rather than SCRs for the output inverter stage?',
      options: [
        'IGBTs cost less than SCRs at industrial current ratings',
        'SCRs require natural commutation (AC zero crossing) to turn off — IGBTs turn off by removing gate voltage at any time, enabling the arbitrary frequency switching that VFDs need to generate variable-frequency AC',
        'SCRs can only handle DC loads, while IGBTs can switch AC loads directly',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'At voltage ratings above 600V, IGBTs outperform power MOSFETs. Why does a 1200V silicon MOSFET have much higher on-resistance than a 1200V IGBT?',
      options: [
        'MOSFETs require thicker gate oxide at high voltage, which limits gate drive voltage and prevents full enhancement',
        'High-voltage silicon MOSFETs need a thick, high-resistivity drift region to support the blocking voltage — RDS(on) scales as V^2.5; IGBTs use minority carrier injection (conductivity modulation) to reduce the drift region resistance regardless of voltage rating',
        'IGBTs use silicon carbide while high-voltage MOSFETs use standard silicon, and SiC has inherently lower resistance',
      ],
      correct: 1,
    },
  ],
};

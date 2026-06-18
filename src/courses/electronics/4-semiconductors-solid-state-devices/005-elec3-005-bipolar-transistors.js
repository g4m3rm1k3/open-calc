export default {
  id: 'elec3-005',
  slug: 'bipolar-transistors',
  chapter: 'elec3',
  order: 5,
  title: 'Bipolar Junction Transistors — NPN, PNP, Regions of Operation, and DC Analysis',
  subtitle: 'How two back-to-back PN junctions create a current-controlled amplifier and switch — the physics, the three operating regions, and the DC circuit analysis every technician needs.',
  tags: ['BJT', 'NPN', 'PNP', 'transistor', 'beta', 'hFE', 'common emitter', 'saturation', 'cutoff', 'active region', 'base current', 'collector current', 'DC analysis'],
  aliases: 'BJT NPN PNP bipolar junction transistor beta hFE current gain common emitter saturation cutoff active region base collector emitter DC bias analysis',
  timeToComplete: 25,
  coreConcept: "A bipolar junction transistor is two PN junctions sharing a thin base region. A small base current controls a much larger collector current: IC = β × IB. In the active region, the device amplifies. In saturation, it acts like a closed switch (~0.2V VCE). In cutoff, it acts like an open switch. These three regions explain all transistor behavior — from audio amplifiers to relay drivers in PLC output cards to the billions of transistors switching inside a microcontroller.",
  prerequisites: ['elec3-004'],
  nextLesson: 'transistor-biasing',

  hook: {
    question: "A PLC digital output card has a transistor output rated at 24VDC, 0.5A. A technician tries to drive a 24V relay coil with it but the relay chatters and won't hold in reliably. The relay coil resistance is 48Ω (0.5A at 24V — right at the rating). What is likely wrong, and what should be checked first?",
    realWorldContext: "A transistor output at its maximum current rating may still be in the active region rather than full saturation, dropping 1–3V across the collector-emitter and leaving insufficient voltage across the relay coil. At 24V supply with 2V VCE sat, the relay sees only 22V — still enough, but the transistor dissipates P = 2V × 0.5A = 1W, causing thermal stress. More critically: the relay coil is inductive — at turn-off, the coil voltage reverses and spikes to hundreds of volts, destroying the transistor without a flyback diode. The fix is a 1N4007 flyback diode across the relay coil (cathode to +24V). Understanding BJT operating regions tells you exactly what the transistor is doing and why.",
  },

  mentalModel: [
    "**Structure: emitter, base, collector.** An NPN transistor has N-type emitter, thin P-type base, and N-type collector. The emitter-base junction is forward biased; the collector-base junction is reverse biased. Electrons from the emitter are injected into the thin base — most diffuse across before recombining and are swept into the collector by the reverse-biased CB junction. The base current is only the small fraction that recombines. β (hFE) = IC/IB, typically 50–500 for silicon NPN, depends heavily on temperature and operating current.",
    "**Three operating regions — the transistor map.** (1) Cutoff: VBE < 0.6V, both junctions reverse-biased, IB ≈ IC ≈ 0, transistor OFF. VCE = supply voltage. (2) Active: VBE ≈ 0.7V, EB forward, CB reverse-biased. IC = β × IB. Used for amplification. VCE can be 1V to supply voltage. (3) Saturation: both junctions forward-biased. IC is limited by external circuit, not base current. VCE(sat) ≈ 0.1–0.3V (transistor fully ON). IB > IC/β — the transistor is 'over-driven' into saturation. For a switch: drive hard into saturation for minimum VCE drop.",
    "**PNP transistor: the complement.** PNP has reversed doping and reversed current directions. The emitter is positive relative to base; IE flows out of emitter (conventional), into base and collector. IC = β × IB for PNP too, but all currents flow opposite to NPN. In schematics: PNP emitters point toward the base (arrow in) vs NPN (arrow out). In industrial practice: NPN transistor outputs (sourcing from +V through load to collector) are more common than PNP for most circuits, but PNP output cards are common in European-spec PLCs connected to sourcing (PNP) proximity sensors.",
  ],

  intuition: {
    prose: [
      "**Current relationships in a BJT.** By Kirchhoff's current law: IE = IB + IC. For a typical BJT with β = 100: if IB = 100 μA, then IC = 10 mA, IE = 10.1 mA. The emitter current carries nearly all the collector current plus the base current. The common-emitter current gain β = IC/IB. The common-base current gain α = IC/IE = β/(β+1) ≈ 0.99. For large-signal (DC) analysis, use β (hFE from datasheet). For small-signal AC analysis, use the transconductance gm = IC/VT = IC/0.026.",
      "**Saturation voltage and switching.** When a BJT is used as a switch (relay driver, LED driver, logic gate output), the goal is minimum VCE(sat) at maximum IC. To guarantee saturation: provide IB ≥ IC/β_min. For safety margin, provide IB = IC/(β_min × 0.1) — use 10:1 overdriving ratio. Example: driving a 100mA LED string, β_min = 50. IB_min = 100/50 = 2mA. Actual IB = 10 mA for reliable saturation. Series base resistor: Rb = (V_logic − VBE) / IB = (5 − 0.7) / 0.010 = 430Ω. Use 390Ω standard value.",
      "**BJT as an amplifier: load line and Q-point.** For a common-emitter amplifier with supply VCC and collector resistor RC: the load line runs from (VCE = VCC, IC = 0) to (VCE = 0, IC = VCC/RC). The quiescent point Q sits on this load line at the DC operating point set by biasing (IB, and hence IC = β×IB, VCE = VCC − IC×RC). AC signal variations in IB cause IC to swing along the load line. Maximum undistorted voltage swing: set Q at the midpoint of the load line (VCE = VCC/2). Distortion occurs if the signal drives into saturation (IC too high) or cutoff (IC too low).",
      "**Early effect and output impedance.** In the active region, IC is not perfectly constant with VCE — it increases slightly due to base-width modulation (Early effect). As VCE increases, the CB depletion region expands, the base gets thinner, and fewer minority carriers recombine before reaching the collector. The output characteristic curves have a slight upward slope, intersecting the negative voltage axis at −VA (Early voltage, typically 50–150V). This gives the BJT a finite output resistance ro = VA/IC. For amplifier design, a BJT with VA = 100V at IC = 1 mA: ro = 100/0.001 = 100 kΩ — significant for precision amplifiers.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'BJT Current Relationships and Gain',
        body: "$$I_E = I_B + I_C$$\n\n$$\\beta = h_{FE} = \\frac{I_C}{I_B}$$ (common-emitter current gain)\n\n$$\\alpha = \\frac{I_C}{I_E} = \\frac{\\beta}{\\beta + 1}$$ (common-base current gain)\n\n**Active region operation:**\n$$I_C = \\beta I_B = \\alpha I_E$$\n\n**Key voltages (silicon NPN):**\n- VBE (forward) ≈ 0.65–0.7V\n- VCE(sat) ≈ 0.1–0.3V (in saturation)\n- VCE(min for active) ≈ 0.3–1.0V",
      },
      {
        type: 'procedure',
        title: 'DC Analysis of a Common-Emitter Circuit',
        body: "Given: VCC, RC, RB, β\n\n1. Assume active region: VBE = 0.7V\n2. Find IB: IB = (VCC − VBE) / RB\n3. Find IC: IC = β × IB\n4. Find VCE: VCE = VCC − IC × RC\n5. **Check assumption**: if VCE > 0.3V → active (correct). If VCE < 0.3V → transistor is saturated, VCE = VCE(sat) ≈ 0.2V, and IC = (VCC − VCE(sat))/RC (limited by circuit, not by β)\n6. For saturation: IB_provided >> IC_sat/β confirms saturation is stable",
      },
      {
        type: 'insight',
        title: 'NPN vs PNP Selection in Industrial Circuits',
        body: "NPN transistors (electrons as majority carriers) are faster than PNP (hole mobility is ~3× lower). NPN output switches to ground (open-collector): load connects from +V to collector. PNP switches to positive rail: load connects from collector to ground. In European industrial practice, PNP proximity sensors source current (connect to +24V through the sensor) — so PLC digital input cards in Europe are often PNP (sourcing) type. US practice uses NPN (sinking) sensors more commonly. Always verify NPN/PNP compatibility between sensor and input card wiring type before installation.",
      },
      {
        type: 'definition',
        title: 'BJT Small-Signal Parameters',
        body: "At quiescent point (IC, VCE):\n\n**Transconductance:** $$g_m = \\frac{I_C}{V_T} = \\frac{I_C}{26\\,\\text{mV}}$$\n\n**Input resistance:** $$r_{\\pi} = \\frac{\\beta}{g_m} = \\frac{\\beta V_T}{I_C}$$\n\n**Output resistance:** $$r_o = \\frac{V_A}{I_C}$$ (VA = Early voltage)\n\n**Voltage gain (CE amplifier, no emitter bypass):**\n$$A_v = -g_m R_C = -\\frac{I_C R_C}{V_T} = -\\frac{V_{RC}}{V_T}$$",
      },
      {
        type: 'warning',
        title: 'Flyback Diode is Mandatory for Inductive Loads',
        body: "When a transistor switches off an inductive load (relay, solenoid, motor), the inductor's stored energy ½LI² must go somewhere. Without a flyback diode, the voltage across the transistor spikes to V = L × dI/dt — easily 100–1000V on a 24V relay coil. This exceeds VCE(max) and destroys the transistor instantly. Always install a flyback diode: cathode to +V, anode to collector (NPN switch). Use 1N4007 for 24VDC relays, faster diode (UF4007 or Schottky) for high-speed solenoids. TVS diodes are faster-responding alternatives that also clamp to a tighter voltage (better for fast solenoids where you want rapid current decay).",
      },
      {
        type: 'theorem',
        title: 'Transistor Power Dissipation',
        body: "$$P_C = V_{CE} \\times I_C$$\n\nIn saturation: P = VCE(sat) × IC ≈ 0.2 × IC — low dissipation, good switch\nIn active region: P = VCE × IC — can be very high near mid-supply\n\n**Maximum power hyperbola:** VCE × IC = Pmax\nThis curve appears on I-V characteristic plots. The transistor must operate below this curve at all times, including transient conditions. For a BJT rated Pmax = 1W: at VCE = 12V, IC_max = 83 mA. The safe operating area (SOA) also includes current limits (IC_max) and voltage limits (BVceo).",
      },
    ],
    visualizations: [
      {
        id: 'TransistorViz',
        title: 'BJT Output Characteristics — IC vs VCE',
        mathBridge: "Select BJT mode. Each curve represents a fixed base current IB. The spacing between curves is IC = β × IB — evenly spaced curves mean constant β. The saturation region is the left edge (VCE < 0.3V) where all curves converge. The active region is the flat portion. The load line (diagonal) from VCC/RC to VCC shows which operating point the circuit establishes. Moving the load line steeper (smaller RC) gives higher current gain but more power dissipation.",
      },
    ],
  },

  math: {
    prose: [
      "**Common-emitter voltage gain.** For a BJT amplifier with collector resistor RC and small-signal model: Av = −gm × (RC || ro). With gm = IC/VT and neglecting ro: Av ≈ −IC×RC/VT = −VRC/VT, where VRC is the DC voltage drop across RC. For VRC = 5V: Av = −5/0.026 = −192. The negative sign indicates phase inversion. To maximize gain: maximize VRC (large IC×RC drop). Practical limit: VRC ≤ VCC/2 for symmetric swing. At VCC = 12V, VRC = 6V → Av = −230. This is why single-stage BJT amplifiers can provide 100–300× voltage gain.",
      "**Transition frequency fT.** As frequency increases, the BJT's current gain β decreases. The gain-bandwidth product fT = gm/(2π×Cπ) is the frequency at which β drops to 1. For a 2N2222A: fT ≈ 300 MHz. For RF transistors: fT > 10 GHz. At any frequency f, the effective β = fT/f. For a switching transistor used in a 100 kHz SMPS, effective β = 300 MHz / 100 kHz = 3000 — plenty. For a 1 GHz RF amplifier, effective β = 300. For a 10 GHz signal, β = 30 — marginal gain, need high-fT RF transistor.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'BJT Transistor Testing with a Multimeter',
        body: "1. **Identify leads**: use datasheet or component tester. For TO-92 package: common orderings are EBC or CBE — always verify.\n2. **Check EB junction**: Red → Base, Black → Emitter. Should read 0.55–0.75V. Reverse: OL.\n3. **Check CB junction**: Red → Base, Black → Collector. Should read 0.55–0.75V. Reverse: OL.\n4. **Failed short**: reads near 0V in both directions → junction shorted\n5. **Failed open**: reads OL in both directions → junction open\n6. **Gain test**: use multimeter's hFE socket (if equipped) or a component tester. Compare to datasheet: typical β = 100–300 for general-purpose NPN.",
      },
    ],
  },
};

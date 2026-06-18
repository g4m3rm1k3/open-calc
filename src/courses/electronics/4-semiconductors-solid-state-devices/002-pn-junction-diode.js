export default {
  id: 'elec3-002',
  slug: 'pn-junction-diode',
  chapter: 'elec3',
  order: 2,
  title: 'The P-N Junction Diode — Depletion Region, Bias, and the Shockley Equation',
  subtitle: 'How joining P-type and N-type silicon creates a one-way valve for current, and the exponential math that governs every diode in industry.',
  tags: ['PN junction', 'depletion region', 'forward bias', 'reverse bias', 'Shockley equation', 'diode', 'built-in voltage', 'breakdown', 'diffusion', 'drift'],
  aliases: 'PN junction diode depletion region forward bias reverse bias Shockley equation built-in potential diffusion current drift current breakdown silicon diode',
  timeToComplete: 25,
  coreConcept: "When P-type and N-type silicon are joined, electrons diffuse across the junction and recombine with holes, leaving a charge-depleted insulating layer. This depletion region creates a built-in electric field (~0.7V for silicon) that opposes further diffusion. Forward biasing reduces this barrier; reverse biasing widens it. The resulting current obeys the Shockley equation: ID = IS(e^(VD/nVT) − 1). The exponential I-V characteristic — not a linear resistor — is what makes diodes so useful for rectification, regulation, and signal processing.",
  prerequisites: ['elec3-001'],
  nextLesson: 'diode-circuits',

  hook: {
    question: "You're commissioning a 480VAC 3-phase to 24VDC power supply for a control panel. The output voltage is 22.8V at full load instead of the specified 24V. The transformer secondary is correct. Where is the 1.2V going, and does it matter for PLC 24V I/O reliability?",
    realWorldContext: "Two silicon diodes in the rectifier bridge each drop ~0.6–0.7V in the forward direction. Full-wave bridge rectification passes current through two diodes in series, dropping 1.2–1.4V total from the peak DC voltage. The transformer is usually wound to compensate, but at heavy load or high temperature (where Vf drops ~2mV/°C), you can see 22–23V. PLC digital inputs typically accept 18–30V DC — so 22.8V is acceptable. But if you swapped standard silicon diodes for Schottky diodes (Vf ≈ 0.3V), the output rises to ~23.4V, and efficiency improves. Understanding junction physics lets you choose the right diode for the application.",
  },

  mentalModel: [
    "**Depletion region: the junction's self-regulating barrier.** At the moment of junction formation, electrons from N-type diffuse into P-type (and holes the other way). They recombine, leaving behind positively charged donor ions on the N-side and negatively charged acceptor ions on the P-side. This space charge creates an electric field pointing N→P (opposing further diffusion). Equilibrium is reached when the drift force (electric field pushing carriers back) exactly cancels the diffusion force. The resulting depletion region is ~0.1–1 μm wide and acts as an insulator.",
    "**Built-in potential: the junction's internal voltage.** The charge separation creates a contact potential V₀ = (kT/q) × ln(NA×ND/ni²). For silicon with typical doping: V₀ ≈ 0.6–0.7V. This is not a voltage you can measure with a voltmeter (it's a contact potential, like a thermocouple EMF — connecting probes creates equal and opposite junctions at the contacts). But it sets the forward voltage threshold: you must supply at least V₀ before significant current flows.",
    "**Exponential I-V: why diodes are nonlinear.** The Shockley equation ID = IS(e^(VD/nVT) − 1) is exponential, not linear. A 60mV increase in forward voltage (about 2×VT) increases current by ~10×. This means diodes share current poorly in parallel — a slightly lower-Vf diode carries much more current than its partner. It also means a small change in voltage causes a large change in current, making diodes excellent voltage references when operated at stable temperature.",
  ],

  intuition: {
    prose: [
      "**Forward bias operation.** Applying positive voltage to P-side reduces the depletion width and lowers the energy barrier. Majority carriers (electrons from N, holes from P) are injected across the junction. Once across, they become minority carriers and recombine — this recombination current is the forward current. For silicon at room temperature: threshold ~0.6–0.7V. The forward current rises exponentially — at 0.7V a small-signal silicon diode might carry 10 mA; at 0.75V it carries 50 mA; at 0.8V it could carry 200 mA. The diode's bulk resistance eventually limits current at high currents (series resistance effect).",
      "**Reverse bias operation.** Applying negative voltage to P-side widens the depletion region — the barrier grows, and majority carrier injection stops. Only thermally generated minority carriers (a tiny population) can cross. This gives the reverse saturation current IS — extremely small (picoamperes for small-signal diodes, microamperes for power diodes). Reverse current is nearly independent of voltage until breakdown. Practically, a silicon diode blocks current until its peak inverse voltage (PIV) rating is exceeded.",
      "**Breakdown: avalanche and Zener.** At high reverse voltage, the electric field in the depletion region accelerates carriers enough that they ionize silicon atoms on collision — each ionization creates a new electron-hole pair, which accelerates and ionizes more atoms. This avalanche breakdown is the mechanism in most power rectifiers and most diodes marked 'reverse voltage Vr.' It is destructive if not current-limited. Zener breakdown (tunneling, occurs at lower voltages, <5V) is exploited for voltage regulation — see lesson elec3-004.",
      "**Temperature effects on forward voltage.** Forward voltage Vf decreases approximately 2 mV/°C for silicon. A diode conducting 1A at 25°C with Vf = 0.7V will have Vf ≈ 0.5V at 125°C junction temperature. This thermal coefficient is why power diode datasheets show Vf vs. temperature curves, and why you cannot assume 0.7V drop in a hot power supply. For paralleled diodes in a rectifier, Vf mismatch causes unequal current sharing — another thermal runaway risk requiring current-balancing resistors.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Shockley Diode Equation',
        body: "$$I_D = I_S \\left( e^{\\frac{V_D}{nV_T}} - 1 \\right)$$\n\nwhere:\n- IS = reverse saturation current (~10⁻¹² A for small-signal Si, ~10⁻⁶ A for power Si)\n- VD = diode forward voltage (V)\n- n = ideality factor (1.0–2.0; n=1 ideal, n=2 recombination dominant)\n- VT = kT/q = 26 mV at 300 K (thermal voltage)\n\n**Approximation for VD >> VT:** ID ≈ IS × e^(VD/nVT)",
      },
      {
        type: 'definition',
        title: 'Built-In Junction Potential',
        body: "$$V_0 = \\frac{kT}{q} \\ln\\!\\left(\\frac{N_A N_D}{n_i^2}\\right)$$\n\nFor silicon at 300 K with NA = ND = 10¹⁶ cm⁻³:\n$$V_0 = 0.026 \\ln\\!\\left(\\frac{10^{32}}{(1.5\\times10^{10})^2}\\right) \\approx 0.026 \\times 27 \\approx 0.70\\text{ V}$$\n\nHigher doping → higher V₀. This is not externally measurable but sets the knee of the I-V curve.",
      },
      {
        type: 'procedure',
        title: 'Testing a Diode with a Multimeter',
        body: "**Diode test mode (most digital meters):**\n1. Red probe → anode (P-side), Black → cathode (N-side): should read 0.50–0.75V (silicon), 0.25–0.45V (Schottky), 1.5–2.2V (LED)\n2. Reverse probes: should read OL (open) for a good diode\n3. Both directions read near 0V: shorted junction (failed)\n4. Both directions read OL: open junction (failed) or MOSFET body diode with gate floating (normal)\n\n**Resistance mode:** Not recommended for diodes — meter current is too small to fully forward-bias silicon. Use diode test mode.",
      },
      {
        type: 'insight',
        title: 'Why 0.7V? (And When It Isn\'t)',
        body: "The '0.7V diode drop' is a room-temperature approximation for a silicon junction at moderate current. It varies:\n- Small-signal Si at 1 mA: ~0.6V\n- Power diode at 10A: 0.8–1.1V (bulk resistance adds to junction voltage)\n- At 125°C junction: subtract ~0.2V → 0.5V typical\n- Schottky diode: 0.2–0.4V (metal-semiconductor junction, no minority storage)\n- GaN Schottky: 0.5–0.7V (but fast recovery)\n\nIn a 5V logic circuit, 0.7V is 14% of supply — significant. In a 480V rectifier, 0.7V is 0.15% — negligible for most calculations.",
      },
      {
        type: 'warning',
        title: 'Peak Inverse Voltage — Selecting Rectifier Diodes',
        body: "The PIV (Peak Inverse Voltage) rating must exceed the peak reverse voltage the diode sees in circuit, with derating. For a full-wave bridge on 240VAC: peak voltage = 240 × √2 = 340V. Add transient margin: use 600V or 800V diodes. Never operate at rated PIV continuously — use 50% derating for industrial reliability. On inductive loads (transformers, motors), voltage spikes can reach 2–3× line voltage. Install MOV or RC snubbers, and select diodes with 2× margin over calculated peak.",
      },
      {
        type: 'theorem',
        title: 'Small-Signal Diode Resistance',
        body: "At a DC operating point ID, the incremental (small-signal) resistance of a diode is:\n$$r_d = \\frac{nV_T}{I_D} = \\frac{n \\times 26\\,\\text{mV}}{I_D}$$\n\nAt ID = 1 mA, n=1: rd = 26 Ω\nAt ID = 10 mA: rd = 2.6 Ω\nAt ID = 100 mA: rd = 0.26 Ω\n\nThis small-signal resistance governs AC ripple voltage across a diode biased at DC — important for peak detector and precision rectifier design.",
      },
    ],
    visualizations: [
      {
        id: 'DiodeViz',
        title: 'Silicon Diode I-V Characteristic',
        mathBridge: "Select Silicon mode. Observe the exponential knee: at 0.5V, current is small; at 0.65V, current rises sharply; at 0.75V, a small-signal diode saturates. The load line (diagonal) shows the operating point where the diode's I-V curve intersects the circuit constraint V = Vsupply − ID×R. Steeper load line = smaller series resistor. Move to Zener mode to see reverse breakdown at a controlled voltage.",
      },
    ],
  },

  math: {
    prose: [
      "**Depletion width and capacitance.** The depletion width W grows with reverse voltage VR: W = √(2ε(V₀ + VR)/q × (NA + ND)/(NA×ND)). For a one-sided abrupt junction (NA >> ND): W ≈ √(2ε(V₀ + VR)/(q×ND)). The depletion region acts as a capacitor with plates separated by W: Cj = ε×A/W ∝ (V₀ + VR)^(-1/2). This voltage-variable capacitance is exploited in varactor diodes for RF tuning. It also limits the switching speed of rectifier diodes — the capacitance must charge/discharge at each half-cycle.",
      "**Diffusion capacitance in forward bias.** In forward bias, minority carrier charge is stored in the neutral regions adjacent to the junction. This diffusion capacitance Cd = ID × τ/(nVT) is proportional to current, where τ is minority carrier lifetime. At high currents, Cd >> Cj and dominates switching time. Fast-recovery diodes are engineered with short τ (gold or platinum doping introduces recombination centers) to minimize stored charge and enable fast turn-off. Standard 60Hz rectifier diodes have τ on the order of microseconds — they cannot switch at 100 kHz.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Rectifier Diode Selection — Step by Step',
        body: "1. **Average current** IF(avg): for a bridge rectifier, IF(avg) per diode = 0.5 × Iload\n2. **Peak current** IFSM: inrush current at startup (capacitor filter); select IFSM >> Icap_inrush\n3. **PIV**: for bridge on Vrms: PIV = √2 × Vrms. Derate to 50%: Vrated ≥ 2 × PIV\n4. **Switching speed**: for line frequency (50/60 Hz), standard rectifier grade OK. For SMPS > 10 kHz, use fast/ultrafast recovery (trr < 50–200 ns) or Schottky.\n5. **Thermal**: Pdiode = IF(avg) × Vf. Check junction temp: Tj = Tambient + Pdiode × (Rθja or Rθjc + heatsink).",
      },
    ],
  },
};

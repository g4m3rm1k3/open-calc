export default {
  id: 'elec3-004',
  slug: 'zener-and-special-diodes',
  chapter: 'elec3',
  order: 4,
  title: 'Zener Diodes & Special Diodes — Regulation, LEDs, Schottky, and Varactors',
  subtitle: 'How reverse breakdown becomes useful: voltage references, LED indicators, fast Schottky rectifiers, and voltage-variable capacitors for RF tuning.',
  tags: ['Zener diode', 'voltage regulator', 'LED', 'Schottky diode', 'varactor', 'photodiode', 'breakdown voltage', 'Zener impedance', 'forward voltage', 'optoelectronics'],
  aliases: 'Zener diode voltage regulator LED light emitting diode Schottky diode varactor photodiode breakdown voltage reference TVS transient voltage suppressor',
  timeToComplete: 25,
  coreConcept: "The Zener diode operates in controlled reverse breakdown to maintain a nearly constant voltage across a wide range of currents — the basis of every discrete voltage reference and the protection device in power supplies. LEDs, Schottky diodes, varactors, and photodiodes are all engineered variations on the basic PN junction, each exploiting a different physical property. Selecting the right specialty diode for a given application — speed, forward voltage, breakdown voltage, or light emission — is a fundamental skill in power electronics and sensor design.",
  prerequisites: ['elec3-003'],
  nextLesson: 'bipolar-transistors',

  hook: {
    question: "A proximity sensor rated for 10–30VDC is connected to a 24V panel supply. One day the supply spikes to 36V for 2 seconds during a power restoration event. The sensor fails. You replace it, add a 24V Zener across the sensor's power terminals, and the next spike doesn't cause a failure. What is the Zener doing, and how did you calculate the value?",
    realWorldContext: "A shunt Zener clamps the voltage across a load by conducting heavily above its Zener voltage, diverting current away from the protected device. A 27V Zener on a 24V supply rail absorbs the 36V transient, clamping the sensor terminals to ~27V and allowing the sensor's internal circuitry (rated to ~32V typical) to survive. For continuous use, you calculate the Zener's worst-case power: Pz = Vz × (Vsupply − Vz)/Rseries. For transient clamping, a TVS (Transient Voltage Suppressor) is preferred — it's optimized for fast response and joule-rated energy absorption, where a standard Zener would fail. This lesson explains all the specialty diode types and when to use each.",
  },

  mentalModel: [
    "**Zener regulation: reverse breakdown as a feature.** In a normal rectifier diode, reverse breakdown is a destructive failure. In a Zener, the doping profile is engineered so breakdown occurs sharply at a specified voltage (Vz), and the device can safely dissipate power in this region. The voltage across the Zener stays nearly constant (Vz ± a few percent) while current varies over a wide range. Add a series resistor from the supply, and the Zener absorbs current variation, holding the output stable — a shunt regulator.",
    "**LEDs: electroluminescence and forward voltage.** A forward-biased PN junction emits photons when electrons recombine with holes — if the junction material has the right band gap, the photon energy falls in the visible range. Band gap determines color: GaAs (0.67 eV) → infrared; GaP (2.26 eV) → red/green; GaN (3.4 eV) → blue/UV. White LEDs use a blue GaN die with phosphor coating. LED forward voltage directly reflects band gap: Vf ≈ Eg/q. This is why blue and white LEDs need ~3.2V, while red LEDs only need ~2.0V.",
    "**Schottky diode: metal-semiconductor junction, no minority storage.** A Schottky diode is formed between metal and N-type silicon — there is no P-type region, so no minority carrier injection and no diffusion capacitance. Turn-off is limited only by junction capacitance — recovery time is in picoseconds. Forward voltage is lower than silicon PN (~0.2–0.4V). Used in high-frequency rectifiers (SMPS), clamp diodes in logic circuits, and wherever low forward drop or fast switching is critical. Cost is higher than standard diodes; reverse leakage is higher; max voltage rating is typically lower (<100V for Si Schottky).",
  ],

  intuition: {
    prose: [
      "**Zener voltage temperature coefficient.** Below ~5V, Zener conduction is by quantum tunneling — temperature coefficient is negative (Vz decreases as temperature rises). Above ~6V, conduction is by avalanche — temperature coefficient is positive. At ~5.1–5.6V, the two mechanisms balance and Vz is nearly temperature-independent. This is why 5.1V and 5.6V Zeners are used as precision voltage references. For low-TC references in temperature-varying environments (control panels, outdoor equipment), choose Vz near 5.6V or use a bandgap reference IC (1.25V, near-zero TC).",
      "**Zener impedance and regulation quality.** An ideal Zener would have zero impedance in breakdown — perfectly flat I-V curve. Real Zeners have dynamic impedance Zz = ΔVz/ΔIz (typically 1–50Ω from the datasheet). Lower Zz = better regulation. At the test current IZT (listed on datasheet), Vz and Zz are specified. At lower currents, Zz rises rapidly — the Zener doesn't regulate well below its minimum current IZmin. For a stable reference: operate the Zener at 10–50% of its maximum rated current.",
      "**Varactor diodes: voltage-controlled capacitance.** Every reverse-biased PN junction is a capacitor (depletion capacitance). Varactors (varicap) are optimized for this behavior — the junction doping profile is engineered for maximum capacitance variation with voltage. Capacitance follows C(V) = C₀/(1 + V/V₀)^γ, where γ is the grading coefficient (0.5 for abrupt, 0.33 for linear, and varactors often achieve 0.5–2). Used in PLL frequency synthesizers, VCOs, cable TV tuners, and cellular phone front-ends to tune resonant circuits electronically without mechanical components.",
      "**TVS diodes vs Zeners for transient protection.** A TVS (Transient Voltage Suppressor) looks like a high-power Zener but is optimized for energy absorption in microsecond-to-millisecond transients, not DC regulation. Key parameters: standoff voltage (must exceed normal operating voltage), clamping voltage at peak pulse current, and peak pulse power Pppm (typically 400–1500W for 10μs transients). For motor drive I/O lines and fieldbus communications (RS-485, Profibus), use bidirectional TVS devices. For DC power rails, use unidirectional. Match standoff voltage to maximum normal operating voltage with 10% margin.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Zener Shunt Regulator Design',
        body: "$$R_s = \\frac{V_{in} - V_z}{I_z + I_L}$$\n\n**Design constraints:**\n- Minimum load: Iz must remain > IZmin even when IL = 0\n- Maximum load: Iz must remain > IZmin when IL is maximum\n- Worst case: Vin_max and IL_min → maximum Iz → check Pz = Vz × Iz < Pzmax\n\n$$R_s = \\frac{V_{in,max} - V_z}{I_{z,max} + I_{L,min}}$$\n\n$$P_{z,max} = V_z \\times \\left(\\frac{V_{in,max} - V_z}{R_s} - I_{L,min}\\right)$$",
      },
      {
        type: 'procedure',
        title: 'Selecting a Zener for a Voltage Reference',
        body: "1. Vz = desired output voltage (choose standard value: 3.3V, 5.1V, 6.2V, 12V, 15V, etc.)\n2. Estimate load current range: IL_min to IL_max\n3. Power supply voltage Vin (known, with min/max range)\n4. Rs_min = (Vin_min − Vz) / (IL_max + IZmin) — must conduct minimum Zener current at worst case\n5. Rs_max = (Vin_max − Vz) / (IZmax + IL_min) — must not exceed Zener power rating\n6. Check Pz = Vz × IZmax < 0.7 × Pzrated (derate 70%)\n7. For better regulation: use an IC voltage reference (LM4040, REF02) instead — Zz < 0.6Ω typical",
      },
      {
        type: 'definition',
        title: 'LED Forward Voltage vs Color',
        body: "| Color | Material | Wavelength | Vf (typical) |\n|---|---|---|---|\n| Infrared | GaAs | 850–940 nm | 1.2–1.5V |\n| Red | GaAsP | 620–680 nm | 1.8–2.2V |\n| Yellow | GaAsP | 585–595 nm | 2.0–2.4V |\n| Green | GaP/InGaN | 520–540 nm | 2.0–3.5V |\n| Blue | InGaN | 450–480 nm | 3.0–3.6V |\n| White | InGaN + phosphor | broadband | 3.0–3.4V |\n\nUV LEDs (InGaN/AlGaN): Vf = 3.5–5V. Efficiency (lm/W) peaks in green — why traffic lights use green for 'go' (maximum visibility per watt).",
      },
      {
        type: 'insight',
        title: 'Why Schottky Diodes Dominate in Switch-Mode Power Supplies',
        body: "In a switching power supply at 100 kHz, the rectifier diode switches on and off 100,000 times per second. A standard silicon PN diode has reverse recovery time trr of 200–3000 ns — during turn-off it briefly conducts in reverse (minority carrier storage). At 100 kHz, the switch period is 10 μs; a 1 μs recovery time loses 10% of every cycle as a short-circuit shoot-through. Schottky diodes have trr < 1 ns — practically instantaneous. This is why every output rectifier in a laptop charger, phone charger, or industrial SMPS uses Schottky diodes (or synchronous rectification with MOSFETs). SiC Schottky diodes extend this to 600–1700V ratings for EV charger and solar inverter applications.",
      },
      {
        type: 'warning',
        title: 'Zener Power Derating — Heat Kills Zeners',
        body: "Zener diodes are thermally sensitive: Pz(max) is specified at 25°C case or lead temperature. Above 25°C, derate linearly — typically 50% at 100°C. A 500 mW Zener running at 75°C ambient can only handle 250 mW safely. In industrial panels with 55°C internal ambient, derate all semiconductor power ratings to 50–60% of their 25°C specs. A common failure mode: Zener protecting a sensor rail dissipates steady-state power while the panel heats up over a shift, eventually overheating the Zener, which shunts more current, heats more, and fails short — taking the sensor supply with it.",
      },
      {
        type: 'theorem',
        title: 'Varactor Capacitance Model',
        body: "$$C_j(V) = \\frac{C_{j0}}{\\left(1 + \\dfrac{V}{V_0}\\right)^\\gamma}$$\n\nwhere:\n- Cj0 = zero-bias junction capacitance\n- V = reverse bias voltage (positive)\n- V₀ = built-in potential (~0.7V for Si)\n- γ = grading coefficient (0.5 abrupt, 0.33 linearly graded, 0.5–2.0 hyperabrupt)\n\nFor a hyperabrupt varactor (γ = 2) biased from 1V to 10V, capacitance varies by 10:1 — enabling VCO tuning range of >10:1 in frequency squared.",
      },
    ],
    visualizations: [
      {
        id: 'DiodeViz',
        title: 'Zener Diode I-V Characteristic',
        mathBridge: "Select Zener mode. Observe the sharp reverse breakdown knee at the Zener voltage. In the breakdown region, large current changes produce small voltage changes — this is the regulation mechanism. The slope in the breakdown region is 1/Zz (Zener dynamic impedance). Compare with Silicon mode: a standard diode does not have a controlled breakdown knee and would simply fail. Switch to Schottky mode to see the lower forward voltage (~0.3V) that enables efficient high-frequency rectification.",
      },
    ],
  },

  math: {
    prose: [
      "**Zener regulation accuracy.** For a shunt regulator with Rs from Vin to the Zener/load node, output voltage change with load current: ΔVout = ΔIL × (Rs || Zz) ≈ ΔIL × Zz (when Zz << Rs, which is typical). For Zz = 10Ω and ΔIL = 50 mA: ΔVout = 0.05 × 10 = 0.5V. That's 4% regulation on a 12V Zener — adequate for indicator lights, not for precision ADC reference. IC regulators (78xx series, LDOs) achieve Zout < 0.1Ω, giving < 0.01% regulation. Use Zener regulators for low-current references and protection circuits, not high-accuracy analog supplies.",
      "**LED efficiency and radiometric-to-photometric conversion.** LED electrical efficiency = optical power out / electrical power in. High-efficiency white LEDs achieve 150–200 lm/W (vs 15 lm/W for incandescent). The luminous flux Φv = V(λ) × 683 lm/W × Φe, where V(λ) is the photopic luminosity function (peaks at 1.0 at 555 nm green) and Φe is radiant flux in watts. For a blue LED (450 nm): V(λ) ≈ 0.038 — most optical power is invisible to photopic vision, which is why blue LEDs need phosphor conversion for white light applications.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'TVS Diode Selection for I/O Protection',
        body: "1. **Standoff voltage** Vwm: must exceed max normal operating voltage by ≥ 10%\n   For 24V I/O: Vwm ≥ 26.4V → use 28V standoff TVS\n2. **Clamping voltage** Vc: voltage at peak pulse current (from datasheet). Must be below device input max rating\n3. **Peak pulse power** Pppm: must exceed the transient energy per unit time\n   For ESD: IEC 61000-4-2 Level 4 = 30A (8/20 μs pulse). Pppm ≥ 30A × Vc\n4. **Bidirectional vs unidirectional**: use bidirectional for AC or differential signals; unidirectional for single-polarity DC rails\n5. **Response time**: TVS responds in < 1 ps — faster than any upstream fuse or circuit breaker",
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A Zener diode rated 12V is used as a shunt voltage regulator. As load current decreases, what happens to the Zener current?',
      options: [
        'Zener current decreases with load — both currents track together',
        'Zener current increases — the series resistor carries the same total current, so when the load takes less, the Zener absorbs more to hold the voltage constant',
        'Zener current stays constant regardless of load current — that\'s what makes it a regulator',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Why do blue and white LEDs have a higher forward voltage (3.0–3.4V) than red LEDs (1.8–2.2V)?',
      options: [
        'Blue LEDs draw more current and the extra voltage drop is due to internal resistance',
        'LED forward voltage reflects the junction\'s band gap — blue photons have more energy than red photons, requiring a wider band gap material (GaN vs GaAsP) and thus a higher forward voltage',
        'Blue LEDs use a different doping technique that raises the built-in junction potential as a manufacturing side effect',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A 100 kHz switching power supply uses Schottky diodes for output rectification instead of standard silicon diodes. Why does reverse recovery time matter at 100 kHz but not at 60 Hz?',
      options: [
        'At 60 Hz the diodes heat up less, so reverse recovery is not needed',
        'At 100 kHz, each switching cycle is 10 μs; a standard silicon diode with 1 μs recovery time wastes ~10% of every cycle in shoot-through current — Schottky diodes recover in nanoseconds, essentially eliminating this loss',
        'Schottky diodes are required only because 100 kHz signals would bypass a standard diode through its junction capacitance',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A 24V sensor rail occasionally spikes to 36V during power restoration. You install a 27V Zener across the sensor terminals. How does it protect the sensor?',
      options: [
        'The Zener blocks the spike entirely, preventing any voltage above 27V from reaching the sensor',
        'When the rail exceeds 27V, the Zener conducts heavily in reverse breakdown, clamping the terminal voltage near 27V and diverting the excess current through the series source impedance rather than through the sensor',
        'The Zener stores the spike energy and releases it slowly after the transient ends',
      ],
      correct: 1,
    },
  ],
};

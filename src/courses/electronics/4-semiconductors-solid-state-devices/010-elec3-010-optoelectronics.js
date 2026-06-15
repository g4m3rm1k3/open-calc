export default {
  id: 'elec3-010',
  slug: 'optoelectronics',
  chapter: 'elec3',
  order: 10,
  title: 'Optoelectronics — Photodiodes, Optocouplers, Solar Cells, and Laser Diodes',
  subtitle: 'Semiconductor devices that convert between light and electricity — from the optocoupler isolating a 24V PLC output from a 480V drive to the photodetectors inside every industrial safety light curtain.',
  tags: ['photodiode', 'phototransistor', 'optocoupler', 'solar cell', 'laser diode', 'LED', 'optical isolation', 'CTR', 'photovoltaic', 'light curtain', 'fiber optic'],
  aliases: 'photodiode phototransistor optocoupler opto isolator solar cell laser diode CTR current transfer ratio photovoltaic optical isolation light curtain fiber optic industrial sensor',
  timeToComplete: 25,
  coreConcept: "Optoelectronic devices use the PN junction to convert light to electricity (photodiodes, solar cells) or electricity to light (LEDs, laser diodes). The optocoupler — LED plus photodetector in one sealed package — provides electrical isolation between circuits while transmitting signals, breaking ground loops and protecting logic circuits from high-voltage transients. Understanding current transfer ratio (CTR), response speed, and isolation voltage ratings allows correct selection of optocouplers for industrial signal isolation, feedback loops, and safety systems.",
  prerequisites: ['elec3-009'],
  nextLesson: null,

  hook: {
    question: "A safety light curtain protecting a press brake is rated at SIL 2 (IEC 62061) and uses 32 pairs of LED transmitters and photodetector receivers. During maintenance, one receiver channel is reading intermittent '0' (beam broken) even though no object is in the field. The LED supply voltage is verified correct. How would you diagnose whether the fault is in the LED transmitter, the photodetector, the optics, or the signal processing circuit?",
    realWorldContext: "Light curtain diagnostics require understanding the optoelectronic signal chain: LED transmitter → optical path → photodetector → transimpedance amplifier → comparator → safety logic. Intermittent failures most commonly come from: LED aging (current degradation → reduced light output → marginal detection), contaminated optics (oil mist in a press environment), photodetector window contamination, or loose fiber connections in fiber-optic curtains. Test sequence: (1) measure LED forward current (should match spec); (2) use a calibrated optical power meter or the curtain's built-in diagnostics to measure received power margin; (3) clean optics; (4) substitute the suspect channel with a known-good channel. The curtain's diagnostic output (if available) may show received intensity per channel — margins below 30% indicate a maintenance replacement is needed before safety reliability degrades.",
  },

  mentalModel: [
    "**Photodiode: reverse-biased junction as a current source.** A reverse-biased PN junction has very small dark current. When photons with energy ≥ Eg strike the depletion region, they generate electron-hole pairs. The built-in field separates them — electrons to N-side, holes to P-side — producing photocurrent IP ∝ optical power. The photodiode is a current source: IP = R × Ee, where R is responsivity (A/W) and Ee is irradiance (W/cm²). In photoconductive mode (reverse biased), response is fast and linear over many decades of light intensity. In photovoltaic mode (no bias), the device generates voltage — the principle of solar cells.",
    "**Optocoupler: isolation via light.** An optocoupler packages an LED (emitter) and a photodetector (receiver — typically a phototransistor or photodiode) in a single sealed package with no electrical connection between them. The isolation barrier may be air gap, glass, or transparent resin. Isolation voltage ratings: 1500–5000 VRMS for standard optocouplers, up to 10 kVrms for reinforced isolation devices. The current transfer ratio (CTR) = IC(output) / IF(LED input) × 100%, typically 50–300%. As LED ages, CTR degrades — the design must accommodate CTR at end-of-life (20–50% of initial).",
    "**Laser diode: stimulated emission for coherent light.** Unlike an LED (spontaneous emission, broad spectrum, wide angle), a laser diode uses stimulated emission inside an optical cavity to produce coherent, narrow-bandwidth, highly directional light. At threshold current Ith, lasing begins abruptly and power rises steeply. Laser diodes achieve much higher optical power density, longer range, and faster modulation than LEDs. Used in industrial: fiber-optic data transmission (factory automation, Profibus, EtherNet/IP over fiber), barcode/QR scanners, laser alignment tools, laser safety curtains, and LiDAR for AGV navigation.",
  ],

  intuition: {
    prose: [
      "**Photodiode modes: photovoltaic vs photoconductive.** In photovoltaic mode (zero bias): the device generates voltage up to Voc (open-circuit voltage) when illuminated — used for light measurement and solar cells. Response is slower (junction capacitance limits bandwidth). In photoconductive mode (reverse bias applied): photocurrent is proportional to light intensity across a wide dynamic range (up to 9 decades). Response time is much faster (depletion region is wider, reducing capacitance and transit time). For high-speed applications (optical communications, fast position sensing): reverse bias 5–15V for maximum speed. For precision DC light measurement (no bias): less noise and no dark current contribution to offset.",
      "**Optocoupler CTR degradation and design margin.** CTR decreases with: (1) LED aging — LED output drops due to GaAs material degradation, especially at high current (I² effect); (2) temperature — CTR drops at high temperature; (3) cumulative IF stress. Design rule: design the driven circuit to work with CTR at minimum spec end-of-life. For safety-critical applications: use optocouplers rated for 25-year life at specified derating. CTR derating curve (from datasheet): if rated CTR = 100% at IF = 10mA, at IF = 50mA CTR may drop to 40%. Run optocouplers at minimum viable LED current (10–15mA typical) for maximum longevity.",
      "**Solar cell physics and the photovoltaic effect.** A solar cell is a large-area PN junction. Photons generate electron-hole pairs in the bulk and depletion region. Minority carriers diffuse to the junction before recombining — the junction field separates them (electrons to N-layer, holes to P-layer), producing photocurrent. Open-circuit voltage Voc ≈ (kT/q) × ln(IL/IS + 1) ≈ 0.5–0.7V per cell for silicon. Cells are series/parallel connected for desired voltage and current. Fill factor FF = Pmax/(Voc × Isc) measures how 'square' the I-V curve is — commercial silicon cells achieve FF = 0.70–0.82. Industrial solar arrays use maximum power point tracking (MPPT) to maximize energy harvest as insolation and temperature vary.",
      "**Fiber optic signal transmission in industrial environments.** Plastic optical fiber (POF) and glass multimode fiber (MMF) are used extensively in industrial automation for noise immunity. A fieldbus running through an EMI-intensive environment (near VFD output cables, high-current bus bars, resistance welders) can use fiber optic cables that are completely immune to electromagnetic interference. LED-based transmitters (850nm or 1300nm) couple into the fiber; photodetector receivers (PIN photodiode or phototransistor) at the other end recover the signal. Bit error rate is determined by optical power budget: transmitter power − cable attenuation − connector losses − receiver sensitivity margin ≥ 3 dB.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Photodiode Responsivity and Photocurrent',
        body: "$$I_P = R_\\lambda \\cdot P_{opt}$$\n\nwhere:\n- IP = photocurrent (A)\n- Rλ = responsivity (A/W) — peak value at optimal wavelength\n- Popt = incident optical power (W)\n\n**Typical responsivity:**\n| Device | Peak wavelength | Responsivity |\n|---|---|---|\n| Silicon PIN | 850 nm | 0.5–0.7 A/W |\n| Silicon photodiode | 700 nm | 0.4–0.6 A/W |\n| InGaAs PIN | 1550 nm | 0.8–1.0 A/W |\n| Phototransistor | 850 nm | 0.1–1.0 mA/mW |\n\n**Quantum efficiency:** η = IP×hf/(q×Popt) = Rλ×hf/q",
      },
      {
        type: 'definition',
        title: 'Optocoupler Current Transfer Ratio',
        body: "$$CTR = \\frac{I_C}{I_F} \\times 100\\%$$\n\nwhere IC = output collector current, IF = input LED forward current\n\n**Design equations:**\n$$I_F = \\frac{V_{in} - V_{F,LED}}{R_{in}}$$\n$$I_C = CTR \\times I_F$$\n$$R_{pull-up} = \\frac{V_{CC} - V_{CE,sat}}{I_C}$$\n\n**Example:** PC817, CTR = 100% at IF = 5mA, Vcc = 5V\n- IF = 5mA → IC = 5mA → R_pull-up = (5 − 0.3)/5mA = 940Ω → use 910Ω\n- For CTR_end-of-life = 50%: IC = 2.5mA → V_out = 5 − 2.5×910 = 2.72V (still logic HIGH for TTL or CMOS if VIH = 2V)",
      },
      {
        type: 'procedure',
        title: 'Selecting an Optocoupler for Industrial Signal Isolation',
        body: "1. **Isolation voltage**: Vrms > 2 × max fault voltage between circuits. For 24V control to 480V power: use 2500V or 5000V isolation.\n2. **CTR at operating conditions**: CTR(min) at max temperature, end-of-life aging. Design for CTR_min to guarantee correct logic output.\n3. **Speed**: for digital signals: check propagation delay (tp,LH and tp,HL). PC817: ~4 μs — OK for industrial I/O (ms-range). For SMPS feedback (100 kHz): use high-speed optocoupler (HCPL-7710, >10 Mbit/s).\n4. **LED current**: 5–20mA typical. Lower current extends life. Use series resistor: Rin = (Vin − VF)/IF.\n5. **Output interface**: phototransistor output (open collector, needs pull-up) vs logic output (built-in comparator + Vcc pin, direct logic drive). Choose based on interfacing requirements.\n6. **Creepage and clearance**: for reinforced isolation (per IEC 60950): use SO-8 wide-body package (2.54mm pin pitch vs 1.27mm for standard SO-8).",
      },
      {
        type: 'insight',
        title: 'Why Safety Light Curtains Use Pulsed LED Modulation',
        body: "A Type 4 safety light curtain (per IEC 61496) cannot use continuous DC LED illumination because ambient light (sunlight, floodlights, other LEDs) would saturate the receiver. Industrial light curtains use pulsed, modulated LEDs: the transmitter pulses each LED in sequence at a specific frequency (e.g., 50–100 kHz), and the receiver uses synchronous detection (lock-in amplifier principle) to respond only to pulses at the correct frequency. This rejects all ambient light and allows operation in bright factory environments. The modulation code also identifies which channel is firing, enabling multiplexed operation of 32–64 beam pairs in a single curtain. Understanding this optoelectronic principle explains why holding a flashlight in front of a light curtain receiver doesn't bypass the safety function.",
      },
      {
        type: 'warning',
        title: 'Optical Aging and Safety System Maintenance',
        body: "LED emitters in safety light curtains, fiber optic transceivers, and proximity sensors age over time: optical output power decreases approximately exponentially. After 50,000 hours (typical industrial rated life) at rated current, LED output may drop by 50%. If the receiver threshold was designed for 3 dB margin at new condition, the system may be operating with negative margin at end of life — it still appears to work but may miss an object under marginal conditions. Safety standards (IEC 61496) require a minimum received signal margin of 3 dB (2×) continuously. Implement preventive maintenance: check optical power margin with the built-in diagnostics every 2 years, and replace emitter assemblies at or before the rated optical life.",
      },
      {
        type: 'theorem',
        title: 'Solar Cell I-V Characteristics',
        body: "$$I = I_L - I_0\\left(e^{\\frac{V + IR_s}{nV_T}} - 1\\right) - \\frac{V + IR_s}{R_{sh}}$$\n\nwhere:\n- IL = light-generated current (∝ irradiance)\n- I0 = dark saturation current\n- Rs = series resistance (contact, wiring losses)\n- Rsh = shunt resistance (junction leakage)\n- n = ideality factor (1–2)\n\n**Key operating points:**\n- Short-circuit: V = 0, I = Isc ≈ IL\n- Open-circuit: I = 0, Voc = (nVT)×ln(IL/I0 + 1)\n- Maximum power point: Imp × Vmp = maximum, tracked by MPPT converter",
      },
    ],
    visualizations: [
      {
        id: 'DiodeViz',
        title: 'LED and Photodiode Characteristics',
        mathBridge: "Select LED mode in DiodeViz. The forward I-V characteristic shows the sharp knee at ~2V (red LED) or ~3.2V (blue/white LED) — the forward voltage directly reflects the band gap of the emitting material. Current above the knee rises steeply (typical of all PN junctions). Compare with Silicon mode: the LED curve is shifted right by the extra band-gap voltage. The inverse of this I-V curve represents the photodiode in reverse bias: a small reverse voltage depletes the junction, and light generates photocurrent proportional to optical power — represented by a downward shift of the I-V curve in the third quadrant.",
      },
    ],
  },

  math: {
    prose: [
      "**Transimpedance amplifier for photodiode signal conditioning.** A photodiode in reverse bias produces IP (amperes) proportional to light power. To convert to a voltage, a transimpedance amplifier (TIA) is used: op-amp with feedback resistor Rf, photodiode current source as input. Vout = −IP × Rf. For IP = 100 nA at minimum detection and Rf = 1 MΩ: Vout = −100 nA × 1 MΩ = −100 mV — enough to detect. For Rf = 10 MΩ: Vout = −1V, more noise margin. The bandwidth of a TIA: f_−3dB = 1/(2π × Rf × Cf) where Cf is the feedback capacitor added for stability (Cf ≈ √(Cdiode/(2π × Rf × GBP))). Transimpedance amplifiers are in every photodetector, barcode scanner, and optical smoke detector.",
      "**Optical power budget for fiber optic links.** Power budget = Tx_power − Rx_sensitivity (both in dBm). Attenuation sources: cable loss (dB/km × km), connector loss (~0.3 dB per mating), splice loss (~0.1 dB), plus component coupling losses. Budget must exceed total attenuation with ≥ 3 dB system margin. For a 100-meter POF link at 850 nm: Tx power = −5 dBm, cable loss = 3 dB/100m × 0.1 km = 0.3 dB, connectors = 4 × 0.3 dB = 1.2 dB, Rx sensitivity = −22 dBm. Budget = −5 − (−22) = 17 dB. Attenuation = 1.5 dB. Margin = 17 − 1.5 = 15.5 dB (exceeds required 3 dB by a large margin — excellent reliability).",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Optocoupler Replacement — Avoiding CTR Mismatch',
        body: "When replacing an optocoupler in a circuit:\n1. Note the original part number and CTR group (e.g., PC817C = CTR 100–300%)\n2. Measure the LED drive current: VF and IF in-circuit\n3. Measure output voltage: Vout with known load (pull-up resistor)\n4. Calculate CTR_required = IC_needed / IF\n5. Replace with same or higher CTR group — do NOT substitute a lower-CTR device (IC will be insufficient to pull output to valid logic level)\n6. If using a different manufacturer equivalent: compare CTR vs IF curve (curves differ even for 'equivalent' part numbers). A higher-CTR replacement may over-drive the output — check that IC does not exceed output transistor maximum.\n7. After replacement: verify logic levels at output under worst-case conditions (minimum IF, maximum temperature)",
      },
    ],
  },
};

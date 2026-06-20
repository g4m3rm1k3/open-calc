export default {
  id: 'elec3-003',
  slug: 'diode-circuits',
  chapter: 'elec3',
  order: 3,
  title: 'Diode Circuits — Rectifiers, Clippers, Clampers, and Current Limiting',
  subtitle: 'The practical circuits every power electronics technician builds from diodes: converting AC to DC, protecting circuits from voltage spikes, and limiting current to LEDs and sensors.',
  tags: ['rectifier', 'half-wave', 'full-wave', 'bridge rectifier', 'clipper', 'clamper', 'peak detector', 'LED current limiting', 'filter capacitor', 'ripple', 'PIV'],
  aliases: 'rectifier half wave full wave bridge rectifier clipper clamper peak detector LED current limit filter capacitor ripple voltage AC to DC conversion',
  timeToComplete: 25,
  coreConcept: "Diode circuits exploit the one-way current property to perform four industrial tasks: rectification (AC→DC), clipping (voltage limiting), clamping (DC level shifting), and current steering. The full-wave bridge rectifier is in every power supply on every machine in a plant. Understanding ripple voltage, PIV requirements, and filter sizing lets you specify replacement power supplies and troubleshoot sagging DC rails without trial and error.",
  prerequisites: ['elec3-002'],
  nextLesson: 'zener-and-special-diodes',

  hook: {
    question: "A 24VDC PLC power supply shows 19V at its output terminals under full load. The incoming 120VAC is confirmed at 118V. The fuse and transformer secondary (measured) are both fine. Capacitors look swollen. What is failing, how would you confirm it, and what is the underlying circuit principle that explains the symptom?",
    realWorldContext: "Electrolytic filter capacitors are the single most common cause of low-output-voltage failure in DC power supplies. The capacitor bank after a bridge rectifier smooths the pulsating DC — when capacitance drops due to age or temperature stress, ripple voltage increases and average output drops. Swollen tops on electrolytics are a visual giveaway of venting due to internal pressure from failed electrolyte. You can confirm with an in-circuit ESR meter (high ESR = failing cap) or by measuring ripple on the DC rail with a scope. Understanding the full-wave bridge circuit — why ripple depends on capacitance, load current, and frequency — lets you specify the correct replacement capacitor.",
  },

  mentalModel: [
    "**Half-wave rectifier: simple but wasteful.** One diode passes only positive half-cycles. Output is a series of positive humps at line frequency. Capacitor averages them into DC with large ripple. Peak inverse voltage on the diode = 2 × Vpeak (the full peak tries to reverse-bias the diode during the negative cycle when the capacitor holds charge). Efficiency is low — only half the AC cycle delivers power. Used in low-power wall adapters and simple reference circuits.",
    "**Full-wave bridge: the industrial standard.** Four diodes arranged so both half-cycles drive current through the load in the same direction. Ripple frequency is 2× line frequency (120 Hz for 60 Hz mains) — easier to filter. Peak inverse voltage per diode = Vpeak (diodes share the reverse voltage in pairs). Output voltage = Vpeak − 1.4V (two diode drops). Filter capacitor is half the size needed for half-wave. Every industrial DC power supply, motor drive front-end, and battery charger uses a full-wave bridge.",
    "**Filter capacitor sizing: the ripple triangle.** Between rectifier pulses, the capacitor discharges into the load. The ripple voltage ΔV ≈ IL / (2f × C) for full-wave. To keep ripple below 10% at 1A load with 120 Hz: C ≥ 1/(2 × 120 × 0.1 × Vout). For 24V output: C ≥ 1/(0.12 × 24) ≈ 1/(2.88) ≈ 347 μF. Standard practice is to use 1000–4700 μF for margin and capacitor aging. Oversizing costs little and dramatically reduces load regulation issues.",
  ],

  intuition: {
    prose: [
      "**Half-wave rectifier waveforms.** Input: Vm sin(ωt). Output: Vm sin(ωt) for 0 < ωt < π (diode conducts), 0 for π < ωt < 2π (diode blocks). Average (no capacitor): Vavg = Vm/π ≈ 0.318 Vm. With capacitor at light load: Vout ≈ Vm − Vf. The capacitor must hold charge for a full half-period (8.3 ms at 60 Hz), so ripple is larger than full-wave for the same capacitance. PIV = Vm + Vc ≈ 2Vm (the capacitor voltage adds to the reverse-biased diode in the negative half-cycle). Always specify half-wave rectifier diodes with PIV ≥ 2 × Vpeak.",
      "**Bridge rectifier current paths.** Positive half-cycle: current flows through D1 (anode to load positive), through load, through D4 (cathode to transformer). D2 and D3 are reverse-biased. Negative half-cycle: current flows through D3, load, D2. D1 and D4 block. At all times, current through the load flows in one direction (top rail positive). Two diodes are always in series with the load — hence two diode voltage drops (1.2–1.4V total). On a 5V supply, this is significant; on 240V, negligible.",
      "**Clipper circuits: voltage limiting.** A series diode and reference voltage clips (limits) the signal at a set level. Shunt clippers use a diode to ground (or reference) — when input exceeds threshold, the diode conducts and clamps the output. Used to protect analog inputs, limit signal swings in comm circuits, and protect CMOS logic inputs from overvoltage. In industrial practice: transient voltage suppressors (TVS diodes) are the high-energy version — they clamp at a rated voltage and absorb energy in joules. Every motor terminal block in a control cabinet should have TVS or MOV protection.",
      "**Clamper circuits: DC level shifting.** A series capacitor + shunt diode shifts the DC level of a waveform without changing its shape. Positive clamper: diode in shunt to ground, capacitor in series — the output waveform is shifted so its negative peaks sit at 0V (or a reference). Output DC component = Vpeak. Used in CRT flyback circuits (historically), voltage multiplier ladders (Cockroft-Walton), and signal conditioning to establish a known DC baseline. The capacitor stores the DC offset — if the load draws too much current, the clamping effect degrades.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Full-Wave Bridge Rectifier Output',
        body: "**DC output voltage (with capacitor filter, light load):**\n$$V_{dc} \\approx V_{peak} - 2V_f = \\sqrt{2}\\,V_{rms} - 1.4\\text{ V}$$\n\n**Ripple voltage (peak-to-peak):**\n$$V_{ripple} \\approx \\frac{I_L}{2f\\,C}$$\n\nwhere: IL = DC load current (A), f = line frequency (Hz), C = filter capacitance (F)\n\n**Example:** IL = 2A, f = 60 Hz, C = 2200 μF:\n$$V_{ripple} = \\frac{2}{2 \\times 60 \\times 0.0022} = \\frac{2}{0.264} \\approx 7.6\\text{ V pp}$$",
      },
      {
        type: 'procedure',
        title: 'Measuring Ripple on a DC Power Supply',
        body: "1. Set oscilloscope to AC coupling (removes DC component, shows only ripple)\n2. Set time/div to capture 2–3 cycles of ripple (at 60 Hz, ripple is 120 Hz → period 8.3 ms; set 5 ms/div)\n3. Measure peak-to-peak ripple amplitude\n4. For a 24V supply: acceptable ripple < 2V pp (< 8%). Above 5V pp → investigate capacitors\n5. Check ripple frequency: should be 2 × line frequency for full-wave (120 Hz on 60 Hz mains). If ripple is at line frequency (60 Hz) → one diode in bridge has failed (half-wave mode)\n6. ESR check: good filter cap ESR < 0.1–0.5Ω at 100 kHz. Measure with LCR meter or ESR meter.",
      },
      {
        type: 'insight',
        title: 'Why Electrolytic Capacitors Fail in Power Supplies',
        body: "Industrial electrolytic capacitors have a rated life of 2000–5000 hours at rated temperature (usually 85°C or 105°C). Every 10°C above rated reduces life by half (Arrhenius law). A capacitor in a 55°C cabinet at 105°C rating runs at 50°C below max — fine. But if the supply runs hotter due to poor ventilation, or if ripple current exceeds the capacitor's rated ripple current (causing internal heating), life drops rapidly. Signs of failure: swollen or cracked vents, elevated ESR, reduced capacitance. Replace electrolytics in industrial equipment every 10 years as preventive maintenance, regardless of visible condition.",
      },
      {
        type: 'definition',
        title: 'LED Current-Limiting Resistor',
        body: "$$R = \\frac{V_{supply} - V_f}{I_{LED}}$$\n\nTypical LED values: Vf = 2.0V (red), 2.2V (green), 3.2V (blue/white), ILED = 10–20 mA\n\n**Example:** 24V supply, red LED (Vf = 2V), ILED = 10 mA:\n$$R = \\frac{24 - 2}{0.010} = \\frac{22}{0.010} = 2200\\,\\Omega \\text{ (2.2 kΩ)}$$\n\nPower dissipated in resistor: P = (Vsupply − Vf) × ILED = 22 × 0.01 = 0.22 W → use ¼W resistor minimum.",
      },
      {
        type: 'warning',
        title: 'Inrush Current Stress on Rectifier Diodes',
        body: "At power-up, the filter capacitor is fully discharged and looks like a short circuit. Inrush current can be 50–200× the steady-state load current for tens of milliseconds. This is why:\n- Bridge diodes must be rated for repetitive surge current (IFSM), not just average current\n- Slow-blow fuses are used on AC inputs to power supplies\n- NTC thermistors or inrush limiters are often added in series with the AC line\n- Large power supplies use soft-start circuits (timed relay bypassing a resistor)\n\nA diode rated 3A average current may need to handle 100A inrush — check the IFSM spec and the I²t rating.",
      },
      {
        type: 'theorem',
        title: 'Cockroft-Walton Voltage Multiplier',
        body: "Cascaded clamper/rectifier stages can multiply AC voltage without a transformer:\n$$V_{out} \\approx 2n \\times V_{peak}$$\nwhere n = number of stages (diode-capacitor pairs per rail)\n\nA 2-stage doubler on 120VAC (Vpeak = 170V) gives ~340V DC. Used in CRT monitors (historically), microwave oven magnetrons, ion pumps, and particle accelerators. Each capacitor must be rated for the full output voltage. Output impedance rises with n — not suitable for high current. In industrial control: voltage multipliers appear in ESD test equipment (generating kV pulses) and in RF bias circuits.",
      },
    ],
    visualizations: [
      {
        id: 'DiodeViz',
        title: 'Diode I-V Curve and Load Line Analysis',
        mathBridge: "The intersection of the diode's exponential I-V curve with the load line (V = Vsupply − I×R) gives the operating point. Move the supply voltage slider to simulate what happens when AC input rises and falls — the diode conducts only during the forward half-cycle. Enable Silicon mode for standard rectifier behavior. The load line rotates as you change R — steeper = smaller resistance = higher current.",
      },
    ],
  },

  math: {
    prose: [
      "**Transformer sizing for a bridge rectifier.** The transformer secondary must supply: (1) the DC output voltage Vdc = Vrms×√2 − 2Vf, so Vrms(secondary) = (Vdc + 2Vf)/√2; (2) the RMS current including ripple and conduction angle effects. For a capacitor-filtered bridge, transformer secondary RMS current = Idc × π/2 × (1/η) where η accounts for transformer efficiency (~0.85 typical). The transformer kVA rating must include both average and reactive (capacitor charging) current. Rule of thumb: transformer VA = 1.75 × Pdc for a capacitor-input filter at full load.",
      "**Voltage doubler for 120V/240V switching.** Many universal power supplies (switch-mode) use a bridge rectifier in voltage-doubler mode for 120VAC input or normal bridge for 240VAC input, configured with a voltage selector switch. At 120VAC: two capacitors in series charge to ~Vpeak each, yielding ~2×170 = 340V DC bus. At 240VAC: single bridge rectifier gives ~320V DC bus. Both configurations produce ~320–340V for the SMPS input stage, allowing one design to serve both markets. The switch disconnects one capacitor from the doubler circuit.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Filter Capacitor Sizing Procedure',
        body: "Given: Vout, Iload, acceptable ripple %\n\n1. Ripple voltage: ΔV = (ripple%) × Vout\n2. For full-wave (f_ripple = 2 × f_line):\n$$C = \\frac{I_{load}}{2 \\times f_{line} \\times \\Delta V}$$\n3. Voltage rating: Vcap ≥ 1.25 × Vout (safety margin)\n4. Ripple current rating: Icap_rms ≈ Iload × 1.2 (rule of thumb; verify from datasheet)\n5. ESR at operating temperature: should be < ΔV / (2 × Iload)\n\n**Example:** 24V @ 3A, 5% ripple:\nΔV = 1.2V, C = 3/(2×60×1.2) = 3/144 = **20.8 mF** → use 22,000 μF/35V cap.",
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A technician measures ripple on a 24V DC power supply with a scope set to AC coupling. The ripple waveform appears at 60 Hz (the mains frequency) rather than 120 Hz. What does this indicate?',
      options: [
        'The filter capacitor has dried out — reduced capacitance always shifts ripple to line frequency',
        'One diode in the full-wave bridge has failed — the circuit is now rectifying only one half-cycle, converting full-wave (120 Hz ripple) to half-wave (60 Hz ripple)',
        'The oscilloscope ground is floating — 60 Hz is always the measured ripple frequency because of AC coupling',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A 24V DC supply has a 2200 μF filter capacitor and supplies 1A of DC load. What is the approximate peak-to-peak ripple voltage?',
      options: [
        'About 0.04V — the large capacitor nearly eliminates ripple',
        'About 3.8V — V_ripple = IL/(2f×C) = 1/(2×60×0.0022)',
        'About 7.6V — because current flows only during one half-cycle of the ripple',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'You connect two silicon diodes in parallel to share current in a rectifier. One diode has a slightly lower forward voltage. What happens?',
      options: [
        'The diodes share current equally — any temperature difference causes self-balancing',
        'The lower-Vf diode carries significantly more current due to the exponential I-V characteristic, potentially overloading while the other diode carries little current',
        'The higher-Vf diode carries more current because it presents less resistance to current flow',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'An LED is connected to a 24V supply. The LED has a forward voltage of 2V and should run at 15 mA. What current-limiting resistor is needed?',
      options: [
        '1600Ω — R = V_supply / I_LED = 24 / 0.015',
        '1333Ω — R = (V_supply − V_f) / I_LED = (24 − 2) / 0.015 = 1466Ω (use 1.5kΩ standard)',
        '133Ω — R = V_f / I_LED = 2 / 0.015',
      ],
      correct: 1,
    },
  ],
};

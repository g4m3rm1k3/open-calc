export default {
  id: 'elec3-009',
  slug: 'integrated-circuits',
  chapter: 'elec3',
  order: 9,
  title: 'Integrated Circuits — Fabrication, Chip Anatomy, Op-Amps, and the 555 Timer',
  subtitle: 'How thousands to billions of transistors are built on a single silicon die, the key categories of analog and digital ICs, and the workhorse devices every field engineer encounters.',
  tags: ['integrated circuit', 'IC fabrication', 'op-amp', '555 timer', 'CMOS', 'photolithography', 'analog IC', 'digital IC', 'operational amplifier', 'comparator', 'voltage regulator'],
  aliases: 'integrated circuit IC fabrication op amp operational amplifier 555 timer CMOS logic photolithography analog IC digital IC comparator voltage regulator chip',
  timeToComplete: 25,
  coreConcept: "An integrated circuit is a complete electronic circuit fabricated on a single semiconductor die using photolithography, doping, and metallization. Modern ICs range from a few transistors (bandgap reference) to 80 billion transistors (GPU). The operational amplifier — a high-gain differential amplifier with feedback — is the fundamental analog building block. The 555 timer is the single most manufactured IC in history, appearing in industrial timing circuits, oscillators, and control systems. Understanding how ICs work lets you use them correctly, identify failure modes, and select the right device for a given application.",
  prerequisites: ['elec3-008'],
  nextLesson: 'optoelectronics',

  hook: {
    question: "A 4–20mA process transmitter sends a signal from a pressure sensor in a tank farm to a control room 800 meters away. The control room DCS shows 'HART communication error' on that loop. The loop resistance measures correctly. What analog IC is at the heart of the 4–20mA current loop transmitter, why is 4mA (not 0mA) used for the live zero, and what IC failure would cause the loop to read exactly 0mA?",
    realWorldContext: "The 4–20mA transmitter uses a voltage-controlled current source built around an op-amp with feedback that forces loop current proportional to the sensor signal. 4mA live zero means a 0% reading consumes 4mA — this distinguishes a 0% measurement from a broken wire (0mA). Most transmitters are loop-powered: the loop current also powers the transmitter electronics, with typically 3.6–4.0mA consumed by the electronics leaving 0.4mA margin at minimum signal. A total failure of the internal op-amp or current driver can cause 0mA output — distinguishable from a 4mA (0% reading). HART protocol (superimposed ±0.5mA FSK over the 4–20mA) requires a 250Ω load resistor in the loop for communication. Understanding the op-amp circuit topology tells you exactly how the transmitter works and what modes of failure are possible.",
  },

  mentalModel: [
    "**IC fabrication: many transistors for free.** Once the photolithographic masks are made, adding transistors to a chip costs essentially nothing — only silicon area. This is why ICs are so much cheaper than equivalent discrete circuits. A 78L05 voltage regulator IC in a TO-92 package contains a bandgap reference, error amplifier, pass transistor, and thermal shutdown — dozens of transistors — for less cost than a single power transistor. The economics of IC fabrication (high fixed cost for masks, near-zero marginal cost per transistor) drive engineers to integrate more and more function on chip.",
    "**Operational amplifier: the universal analog building block.** An op-amp is a high-gain differential voltage amplifier: Vout = A × (V+ − V−), where A (open-loop gain) is typically 10⁵ to 10⁷ (100 dB to 140 dB). With negative feedback, the gain is set by external resistors to any value: Av = −Rf/Rin (inverting), or Av = 1 + Rf/Rin (non-inverting). The op-amp's virtual short principle: with negative feedback, the op-amp drives its output to make V+ = V−. This principle, combined with infinite input impedance assumption (ideal op-amp), allows analysis of any op-amp circuit without knowing the internal gain A.",
    "**555 timer: the universal timing IC.** The 555 contains two comparators (at 1/3 VCC and 2/3 VCC), a flip-flop, a discharge transistor, and an output driver. In astable mode (oscillator): timing capacitor charges through R1+R2 to 2/3 VCC (flip-flop resets), then discharges through R2 to 1/3 VCC (flip-flop sets) — continuously. Frequency: f = 1.44/((R1+2R2)C). In monostable mode (one-shot): a trigger pulse starts one timing cycle, output goes high for t = 1.1×R×C, then returns low regardless of trigger. Used in industrial applications for debouncing, pulse stretching, watchdog timers, and PWM generation.",
  ],

  intuition: {
    prose: [
      "**IC fabrication process flow.** Starting material: P-type silicon wafer (200–300mm diameter). Steps: (1) Thermal oxidation: grow SiO₂ layer for isolation. (2) Photolithography: spin photoresist, expose through mask UV light, develop to expose selected oxide areas. (3) Etching: remove exposed oxide, then photoresist. (4) Ion implantation or diffusion: dope exposed silicon (P or N type). (5) Repeat for each layer (active, poly gate, metal 1, metal 2...). Modern chips have 15–20 metal interconnect layers. Final steps: deposit passivation, open bond pad windows, test each die electrically, cut (dice) the wafer, package the die in plastic or ceramic, final test. Typical cost of a 300mm wafer start: $5,000–$20,000; with 500–5,000 dies per wafer, die cost is $1–$100 before packaging and test.",
      "**Op-amp virtual ground and the inverting amplifier.** In an inverting amplifier: Rin from input to V−, Rf from V− to output, V+ grounded. By virtual short: V− ≈ V+ = 0V (virtual ground). By KCL at V−: (Vin − 0)/Rin = (0 − Vout)/Rf → Vout = −(Rf/Rin) × Vin. The input impedance is Rin (not the op-amp's own input impedance). The output impedance is near zero (op-amp drives the output). This analysis works regardless of the op-amp's internal gain A as long as A is large and negative feedback is present. For a precision 4–20mA transmitter: Rf/Rin is trimmed at calibration to set the exact gain from sensor voltage to loop current.",
      "**Op-amp limitations: gain-bandwidth product and slew rate.** The open-loop gain A decreases with frequency: A(f) = A0/(1 + jf/f1), where f1 (unity-gain bandwidth product) = A0 × f1 (the GBP). For an LM741: GBP ≈ 1 MHz. At closed-loop gain of 100: bandwidth = GBP/gain = 1 MHz/100 = 10 kHz. At gain of 1000: bandwidth = 1 kHz. This explains why low-gain stages have more bandwidth — fundamental to choosing op-amp for a given application. Slew rate (maximum dVout/dt, typically 0.5–1000 V/μs) is the large-signal bandwidth limit — a 741 at 1 V/μs slew rate limits full-swing 10V output to f < 16 kHz, independent of small-signal bandwidth.",
      "**Linear voltage regulators as ICs.** The 78xx series (7805 = +5V, 7812 = +12V, 7824 = +24V) contains: a bandgap reference (~1.25V, temperature-stable), an error amplifier comparing output to reference, a pass transistor (NPN Darlington) driving the output, and thermal shutdown + current limiting. The pass transistor absorbs Vin − Vout voltage drop × IL. For a 7805 at 1A with Vin = 12V: Pdiss = (12−5) × 1 = 7W. This power is why linear regulators need heatsinks at high current — they're fundamentally inefficient. Dropout voltage is the minimum Vin − Vout required for regulation (typically 2–3V for standard regulators, 0.1–0.6V for LDOs). Industrial 24V control circuits often use LDO regulators to maintain 24V output from 26V input with minimum waste heat.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Ideal Op-Amp Rules for Circuit Analysis',
        body: "**Ideal op-amp assumptions** (valid when negative feedback is present):\n1. **Infinite gain**: A → ∞\n2. **Infinite input impedance**: Iin = 0 (no current into + or − inputs)\n3. **Zero output impedance**: Vout can drive any load\n4. **Virtual short**: V+ = V− (op-amp drives output to equalize inputs)\n\n**Common configurations:**\n- Inverting: $$A_v = -\\frac{R_f}{R_{in}}$$\n- Non-inverting: $$A_v = 1 + \\frac{R_f}{R_{in}}$$\n- Voltage follower (buffer): $$A_v = 1$$, Rin = ∞\n- Difference amplifier: $$V_{out} = \\frac{R_f}{R_1}(V_2 - V_1)$$ (with matched R1=R3, Rf=R4)",
      },
      {
        type: 'definition',
        title: '555 Timer — Astable and Monostable Timing',
        body: "**Astable (oscillator) mode:**\n$$f = \\frac{1.44}{(R_1 + 2R_2)C}$$\n$$\\text{Duty cycle} = \\frac{R_1 + R_2}{R_1 + 2R_2}$$\n\n(Duty cycle > 50% always in standard astable; for 50%: set R1 → 0 with diode bypassing R2 on charge)\n\n**Monostable (one-shot) mode:**\n$$t_{on} = 1.1 \\times R \\times C$$\n\n**Examples:**\n- 1-second pulse: R = 910 kΩ, C = 1 μF → t = 1.1 × 910k × 1μ = 1.001s\n- 1 kHz oscillator: R1=1kΩ, R2=680Ω, C=1μF → f = 1.44/(2360×10⁻⁶) = 610 Hz (adjust values)",
      },
      {
        type: 'procedure',
        title: 'Op-Amp Circuit Troubleshooting',
        body: "**Symptom: output stuck at rail (+Vcc or −Vcc)**\n→ Op-amp is saturated (open-loop). Check: feedback resistor Rf — if open, gain → ∞, saturates on any offset\n→ Check: input conditions. Is V+ ≠ V−? Is there a missing supply rail?\n\n**Symptom: output oscillates at high frequency**\n→ Positive feedback or insufficient phase margin. Check: stray capacitance on feedback nodes; cable capacitance on long output runs creates lag\n→ Add small feedback capacitor Cf (10–100 pF) in parallel with Rf to add phase lead\n\n**Symptom: output clips on only one side**\n→ Input offset voltage shift, or asymmetric supply rails. Measure V+ and V− supplies.\n\n**Symptom: gain is half expected**\n→ Check resistor values (Rf or Rin open or wrong value from resistor color code error)",
      },
      {
        type: 'insight',
        title: 'Why the 555 Timer Has Outlasted All Predictions of Obsolescence',
        body: "Designed in 1972 by Hans Camenzind at Signetics, the 555 has been in continuous production for over 50 years. Reasons for longevity: simple external components (just R and C), wide supply range (5V to 15V, up to 18V for CMOS 7555), high output current (200 mA), available in every electronics market worldwide for pennies, and the datasheet application circuits are so well-documented that engineers reach for it instinctively. Modern CMOS version (7555/LMC555) operates at < 50 μA quiescent current vs 555's 6mA — used in battery-powered applications. In industrial control: 555 timers appear in watchdog circuits, pneumatic solenoid timing, sensor debounce, and LED flashers in control panels.",
      },
      {
        type: 'warning',
        title: 'Op-Amp Input Protection and Common-Mode Range',
        body: "Op-amp inputs must stay within the common-mode input voltage range (CMR) — typically ±(Vsupply − 1.5V). For a ±15V supplied op-amp: inputs must stay within ±13.5V. If an input exceeds this, the op-amp inverts or locks up (phase reversal) — a dangerous condition in a control loop that can cause a servo to slam to a hard stop. For industrial signal conditioning: add input clamping diodes or select rail-to-rail input op-amps (CMR extends to the supply rails). Also: differential input voltage limits (typically ±Vsupply for standard op-amps, ±0.6V for some precision types) — violating this destroys the input differential pair.",
      },
      {
        type: 'theorem',
        title: 'Op-Amp Gain-Bandwidth Product',
        body: "$$f_{-3dB} = \\frac{GBP}{|A_{CL}|}$$\n\nwhere GBP = unity-gain bandwidth product (from datasheet), ACL = closed-loop gain\n\n**Examples for LM358 (GBP = 1 MHz):**\n- ACL = 1 (buffer): BW = 1 MHz\n- ACL = 10: BW = 100 kHz  \n- ACL = 100: BW = 10 kHz\n- ACL = 1000: BW = 1 kHz\n\n**For 4–20mA instrumentation (signal BW < 100 Hz):** even a slow op-amp (1 MHz GBP) provides 10,000:1 gain margin — adequate. For audio or control loop compensation above 10 kHz: select op-amp with GBP ≥ 10 × (ACL × fsignal).",
      },
    ],
    visualizations: [
      {
        id: 'OhmViz',
        title: 'Op-Amp Inverting Amplifier — Gain and Current Analysis',
        mathBridge: "Model the inverting op-amp as: Vout = −(Rf/Rin) × Vin. Use OhmViz to trace the current path: Iin = Vin/Rin flows into the virtual ground at V−. The same current flows through Rf (since no current enters the op-amp input): If = Iin. So Vout = −If × Rf = −(Vin/Rin) × Rf. Changing Rf doubles the gain and doubles the output voltage for the same input — while the input current and input resistance remain fixed at Rin. This is why the inverting amplifier stage input impedance is controlled by Rin, not by the op-amp itself.",
      },
    ],
  },

  math: {
    prose: [
      "**Op-amp integrator and differentiator.** Replace Rf with capacitor C in an inverting amplifier: Vout = −(1/RC) ∫ Vin dt — the circuit integrates. Replace Rin with C: Vout = −RC × dVin/dt — the circuit differentiates. In industrial PID controllers: the integral term eliminates steady-state error; the derivative term provides predictive damping. Real op-amp integrators saturate if DC offset is not corrected — a reset switch or leakage resistor in parallel with C prevents this. A leakage resistor R_leakage = 10×Rin limits low-frequency gain to R_leakage/Rin = 10, preventing DC saturation while preserving integration at signal frequencies.",
      "**Comparator vs op-amp.** A comparator is an op-amp without frequency compensation — intentionally unstable for speed. Output switches when V+ crosses V−. Speed comparison: LM741 op-amp response time ~100 μs; LM339 comparator response time ~1.3 μs; LM393 high-speed comparator ~200 ns. For analog triggering (window detector, zero-crossing detector, overcurrent detection): use a dedicated comparator, not a general-purpose op-amp. Comparators often have open-collector outputs (pull-up resistor required) to allow wired-OR logic and level shifting. In power supply protection circuits: a fast comparator monitors output voltage and shuts off the pass transistor within microseconds of an overvoltage event.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: '4-20mA Transmitter Circuit Design',
        body: "Basic voltage-to-current converter (V-to-I or Howland pump):\n\nSimple single-op-amp design (Vin → 4–20mA, loop powered):\n1. Set zero (4mA): Vzero biases the circuit to output 4mA with Vin = 0\n2. Set span (16mA for full-scale): Rf/Rin = 16mA × Rshunt / Vspan\n3. Verification: inject Vin = 0V → measure 4mA; inject Vin = full scale → measure 20mA\n4. Loop power: transmitter supply = Vloop − Vload = 24V − (20mA × 250Ω load) = 24 − 5 = 19V available\n5. Transmitter minimum operating voltage: check datasheet (typically 8–12V minimum terminal voltage)\n6. HART: add 250Ω resistor in series with loop at DCS input for HART communication",
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Why does IC fabrication make it economically beneficial to add more transistors to a design, even when only a few are needed?',
      options: [
        'More transistors lower the chip\'s resistance, which improves power efficiency',
        'Once the photolithographic masks are made, adding transistors costs only silicon area — the marginal cost per transistor is near zero, so integrating more function on-chip is almost free',
        'Additional transistors provide redundancy, which increases reliability and justifies a higher selling price',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'An inverting op-amp circuit has Rin = 10 kΩ and Rf = 100 kΩ. The input is +1V. What is the output voltage, and why?',
      options: [
        '+10V — non-inverting gain = 1 + Rf/Rin = 11, but the output is positive',
        '−10V — inverting gain = −Rf/Rin = −10; the virtual short at V− forces current through Rf opposite to input current, inverting the sign',
        '−1V — the op-amp acts as a unity-gain buffer in the presence of negative feedback',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'An op-amp with GBP = 1 MHz is configured as an inverting amplifier with gain = 200. What is its approximate −3 dB bandwidth?',
      options: [
        '1 MHz — the gain-bandwidth product is the bandwidth at any gain',
        '5 kHz — bandwidth = GBP / |ACL| = 1 MHz / 200 = 5 kHz',
        '200 MHz — higher gain extends bandwidth in a feedback amplifier',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A 4–20mA process transmitter reads 0mA at the DCS instead of the expected 4mA at zero pressure. What does this most likely indicate?',
      options: [
        'The pressure transmitter is reading 0% — a valid measurement; 4mA represents 0% and 0mA is below range',
        'The loop is broken — a severed wire or failed transmitter circuit produces 0mA; the 4mA live zero deliberately distinguishes a 0% measurement from an open circuit',
        'The DCS is displaying the wrong engineering units — divide by 5 to convert raw mA to percentage',
      ],
      correct: 1,
    },
  ],
};

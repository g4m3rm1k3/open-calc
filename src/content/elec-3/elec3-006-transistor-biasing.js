export default {
  id: 'elec3-006',
  slug: 'transistor-biasing',
  chapter: 'elec3',
  order: 6,
  title: 'Transistor Biasing — Q-Point Stability, Voltage Divider Bias, and Thermal Runaway',
  subtitle: 'Why a single base resistor is insufficient for reliable amplifier design, how voltage divider bias stabilizes the operating point, and the thermal runaway mechanism that destroys power transistors.',
  tags: ['transistor biasing', 'Q-point', 'voltage divider bias', 'fixed bias', 'emitter feedback', 'thermal runaway', 'stability factor', 'load line', 'DC operating point', 'quiescent current'],
  aliases: 'transistor biasing Q-point quiescent point voltage divider bias thermal runaway stability factor emitter resistor load line operating point amplifier design',
  timeToComplete: 25,
  coreConcept: "Setting the DC operating point (Q-point) of a BJT amplifier determines where on the load line the transistor sits — and how far it can swing without distortion. Fixed bias with a single base resistor fails because β varies 3:1 between transistors of the same type, and β increases with temperature. Voltage divider bias with an emitter resistor stabilizes the Q-point against β variation and temperature, making amplifier performance predictable regardless of which specific transistor is installed.",
  prerequisites: ['elec3-005'],
  nextLesson: 'field-effect-transistors',

  hook: {
    question: "You repair a servo amplifier board. The original transistor was a 2N3055 with β ≈ 120. The replacement in stock is also a 2N3055 but it tests at β = 280. After reinstallation, the amplifier oscillates and the transistor runs hot. No other components were changed. Why does changing only the transistor cause oscillation, and what does this tell you about the bias circuit design?",
    realWorldContext: "The original amplifier used fixed bias (single base resistor from VCC). With the original β = 120, IC was set correctly and the Q-point was in the middle of the load line. With β = 280, the same base current produces 2.3× more collector current. The Q-point shifts dramatically — possibly into saturation, causing distortion and oscillation. If the designer had used voltage divider bias with an emitter resistor, the emitter resistor's negative feedback would have held IC nearly constant regardless of β variation. This is the foundational reason professional amplifier designs use voltage divider bias: the circuit must work with any transistor within the device family's β spread.",
  },

  mentalModel: [
    "**Fixed bias: simple but β-dependent.** Single resistor RB from VCC to base. IB = (VCC − VBE)/RB = constant. IC = β × IB. Since β varies with device and temperature, IC varies proportionally. If β doubles (temperature rise or part replacement), IC doubles — Q-point shifts to higher current, possibly saturation. The collector-to-emitter voltage drops, gain changes, and distortion increases. Fixed bias is only appropriate for switching circuits where the transistor is driven hard into saturation (β variation doesn't matter as long as you're fully on).",
    "**Voltage divider bias: the stable standard.** Two resistors (R1 from VCC to base, R2 from base to ground) establish a Thevenin base voltage VB = VCC × R2/(R1+R2). If the divider is stiff (R1||R2 << β×RE), VB is nearly independent of transistor current. Emitter voltage: VE = VB − VBE ≈ VB − 0.7V. Emitter current: IE = VE/RE ≈ IC. Now IC = VE/RE ≈ (VB − 0.7V)/RE — determined almost entirely by resistors, not by β. Change β by 3:1 and IC changes by less than 10%. This is the bias topology in virtually all linear amplifier circuits.",
    "**Thermal runaway: the positive feedback death spiral.** In a BJT, β and reverse saturation current ICBO both increase with temperature. Rising temperature → IC increases → more power dissipation → more temperature rise → IC increases further. Without stabilization, this positive feedback loop can destroy a transistor in seconds. The emitter resistor provides negative feedback: if IC increases, VE = IC × RE increases, reducing VBE (VB is held by the divider), reducing IB, which reduces IC. This emitter feedback is the primary thermal stabilization mechanism in discrete BJT circuits.",
  ],

  intuition: {
    prose: [
      "**Thevenin analysis of voltage divider bias.** Replace R1 and R2 with their Thevenin equivalent: VTH = VCC × R2/(R1+R2), RTH = R1||R2. The base loop equation: VTH = IB×RTH + VBE + IE×RE = IB×RTH + VBE + (IB+IC)×RE. Substituting IC = β×IB and solving for IC: IC = (β×(VTH − VBE)) / (RTH + (β+1)×RE). As β → ∞, IC → (VTH − VBE)/RE — completely independent of β. In practice, for a 'stiff' divider where β×RE >> RTH, IC is within a few percent of this ideal value across a wide β range.",
      "**Stability factor S.** The stability factor S = dIC/dICBO measures how much collector current changes per unit change in leakage current (ICBO doubles roughly every 10°C). For fixed bias: S = β + 1 ≈ β — poor. For voltage divider with emitter resistor: S = (1 + RB/RE) / (1 + β/(β + RB/RE)), where RB = RTH. For a well-designed circuit with RE = 1kΩ, RB = 2kΩ, β = 100: S ≈ 3. Fixed bias gives S = 101. The factor of 33× improvement in stability explains why all commercial linear amplifiers use voltage divider bias.",
      "**Bypass capacitor CE across the emitter resistor.** The emitter resistor RE stabilizes DC but also reduces AC voltage gain: Av ≈ −RC/(RE + re'), where re' = VT/IC = 26mV/IC is the intrinsic emitter resistance. For IC = 1mA, re' = 26Ω. Without bypass: Av = −RC/(RE + 26). With RE = 1kΩ: Av = −RC/1026 — gain severely reduced. Adding a bypass capacitor CE in parallel with RE short-circuits RE for AC signals: Av = −RC/re' — full gain restored. The capacitor must present low impedance at the lowest signal frequency: XCE < RE/10 at fmin. For 20 Hz audio with RE = 1kΩ: CE > 1/(2π×20×100) = 80 μF. Use 100 μF.",
      "**Power transistor thermal design.** For a power BJT mounted on a heatsink: Tj = Tambient + Pdevice × (Rθjc + Rθcs + Rθsa), where Rθjc is junction-to-case (from datasheet), Rθcs is case-to-heatsink (depends on mounting: ~0.1°C/W with thermal compound, 0.5°C/W dry), Rθsa is heatsink-to-air (from heatsink datasheet). Maximum junction temperature for silicon BJT: 150°C (absolute max), operate at 125°C or below for reliability. If Tamb = 50°C, Rθjc = 1.5°C/W, Rθcs = 0.2°C/W, and Rθsa must be ≤ (125−50)/P − 1.5 − 0.2 = 75/P − 1.7. For P = 20W: Rθsa ≤ 2.05°C/W.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Voltage Divider Bias Q-Point Equations',
        body: "**Thevenin base circuit:**\n$$V_{TH} = V_{CC} \\frac{R_2}{R_1 + R_2}, \\quad R_{TH} = R_1 \\| R_2$$\n\n**Emitter current (β-independent approximation when β×RE >> RTH):**\n$$I_C \\approx I_E = \\frac{V_{TH} - V_{BE}}{R_E}$$\n\n**Collector voltage:**\n$$V_{CE} = V_{CC} - I_C(R_C + R_E)$$\n\n**For midpoint Q-point (maximum symmetric swing):**\n$$V_{CE} = \\frac{V_{CC}}{2} \\implies I_C(R_C + R_E) = \\frac{V_{CC}}{2}$$",
      },
      {
        type: 'procedure',
        title: 'Voltage Divider Bias Design Procedure',
        body: "Given: VCC, desired IC, VCE, f_min (lowest signal frequency)\n\n1. Choose VE ≈ VCC/10 for good stability: RE = VE / IC\n2. VB = VE + 0.7V; set VRC = VCC − VCE − VE; RC = VRC / IC\n3. For stiff divider: divider current ID ≥ 10 × IB_max = 10 × IC / β_min\n4. R2 = VB / ID; R1 = (VCC − VB) / ID\n5. Bypass cap: CE ≥ 10/(2π × fmin × RE)\n6. Coupling caps (if AC-coupled): CC ≥ 1/(2π × fmin × Rin) where Rin = R1||R2||βRE\n7. Verify: IC and VCE using exact Thevenin analysis (account for loading of divider by IB)",
      },
      {
        type: 'insight',
        title: 'Why β Spread Matters in Production',
        body: "A 2N2222A transistor is characterized with typical β = 100–300 (3:1 spread) within one part number. Production boards must work with any device in this range. With fixed bias biasing for β = 200, the circuit at β = 100 draws half the current (Q-point near cutoff) and at β = 300 draws 1.5× the target (Q-point toward saturation). With voltage divider bias and RE sized for < 10% IC variation over 3:1 β spread, the board works reliably with any 2N2222A. This is why electronics manufacturing specifies designs that work over the full β range, not at 'typical' only.",
      },
      {
        type: 'warning',
        title: 'Thermal Runaway in Power Transistor Arrays',
        body: "When multiple power transistors share load current (paralleled in output stages), VBE mismatch causes unequal current sharing. The transistor with lower VBE carries more current, heats more, VBE drops further (−2mV/°C), draws more current — thermal runaway in that device. Fix: emitter ballast resistors (0.1–0.5Ω per emitter). The voltage drop across each ballast resistor provides local negative feedback: if one transistor tries to take more current, the voltage drop across its emitter resistor increases, reducing its VBE. Rule of thumb: emitter ballast resistor voltage drop ≥ 100mV at full load current ensures balanced sharing.",
      },
      {
        type: 'theorem',
        title: 'Stability Factor for Common Bias Configurations',
        body: "$$S = \\frac{dI_C}{dI_{CBO}} \\approx \\frac{1 + R_B/R_E}{1 + \\beta/(\\beta + R_B/R_E)}$$\n\nLimiting cases:\n- Fixed bias (RE = 0): S = β + 1 (worst — all leakage amplified by β)\n- Emitter resistor only (RB → ∞): S = 1 (ideal — leakage not amplified)\n- Voltage divider with RE: S between 1 and β+1, controlled by ratio RB/RE\n\n**Design target:** S < 10 for stable operation over temperature.",
      },
      {
        type: 'definition',
        title: 'Emitter Bypass Capacitor Selection',
        body: "To bypass emitter resistor RE for AC signals while maintaining DC stability:\n$$C_E \\geq \\frac{10}{2\\pi f_{min} R_E}$$\n\nFor fmin = 20 Hz, RE = 560Ω: CE ≥ 10/(2π × 20 × 560) = **142 μF** → use 220 μF\n\n**AC gain with full bypass:** Av = −RC / re' where re' = VT/IC\n\n**AC gain with partial bypass** (bypass through series RC): allows gain peaking — used in feedback amplifiers to shape frequency response.",
      },
    ],
    visualizations: [
      {
        id: 'TransistorViz',
        title: 'BJT Output Characteristics and Load Line',
        mathBridge: "Plot the load line from (VCE = VCC, IC = 0) to (VCE = 0, IC = VCC/RC). The Q-point where your bias sets IB determines which curve the operating point lands on. Increase IB (via fixed bias with lower RB) and the Q-point moves up the load line — toward saturation if too high. Change β and observe how the Q-point shifts with fixed bias vs how it stays stable with voltage divider bias (emitter feedback holds IC = VE/RE).",
      },
    ],
  },

  math: {
    prose: [
      "**Exact Q-point with Thevenin analysis.** Using KVL in the base-emitter loop of a voltage divider bias circuit: VTH = IB×RTH + VBE + (IB+IC)×RE. With IC = β×IB: IB = (VTH − VBE) / (RTH + (β+1)×RE). Then IC = β×IB. This exact expression shows that IC depends on β through the (β+1)×RE term. When (β+1)×RE >> RTH — the stiffness condition — the β term in numerator and denominator cancel, giving IC ≈ (VTH − 0.7)/RE independent of β. The practical design rule: make RE large enough that RE×β >> RTH, i.e., RE > RTH/(10×β_min).",
      "**AC input resistance and gain reduction.** With bypass capacitor open (below cutoff frequency), the AC gain is Av = −RC/(RE + re'). The AC input resistance is Rin = R1||R2||[β(RE + re')]. At very low frequencies (below CE bypass frequency), RE is not bypassed and reduces gain by factor RE/(RE+re'). This is the high-pass pole of the amplifier: f_CE = 1/(2π×CE×(RE||[VT/IC])) ≈ 1/(2π×CE×RE) since usually RE >> re'. Below this frequency, gain rolls off at −20 dB/decade.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Troubleshooting a Biased BJT Amplifier',
        body: "**Symptom: clipped output, distorted at one peak only**\n→ Q-point shifted toward saturation (top clip) or cutoff (bottom clip)\n→ Measure VCE: if < 1V, saturated; if > VCC/2 + a few volts, near cutoff\n→ Check: R1, R2 values for drift; β of transistor; VCC level\n\n**Symptom: no output, transistor cold**\n→ Check base voltage (~1/10 of VCC). If missing → R1 open\n→ Check emitter voltage (~0.7V below base). If 0 → open emitter or RE\n\n**Symptom: transistor very hot, VCE very low**\n→ Saturated or runaway. Check: β of replacement, CE bypass cap not shorted, feedback path intact",
      },
    ],
  },
};

export default {
  id: 'elec2-006',
  slug: 'rlc-parallel',
  chapter: 'elec2',
  order: 6,
  title: 'Parallel RLC Circuits — Admittance, Susceptance, and Current Division',
  subtitle: 'How to analyze AC parallel circuits using admittance — the reciprocal of impedance.',
  tags: ['parallel RLC', 'admittance', 'susceptance', 'conductance', 'current divider', 'AC parallel'],
  aliases: 'parallel RLC admittance susceptance conductance Y G B current divider AC parallel circuit',
  timeToComplete: 25,
  coreConcept: "In parallel AC circuits, admittance Y = 1/Z is easier than impedance. Y = G + jB where G = conductance (1/R) and B = susceptance (BL = −1/XL, BC = +1/XC). Parallel admittances add: Y_total = Y_R + Y_L + Y_C. Total impedance Z = 1/Y_total. Total current I_total = V × Y_total. The current drawn by each branch: I_R = V/R, I_L = V/XL, I_C = V/XC — each at different phase angles.",
  prerequisites: ['elec2-005'],
  nextLesson: 'resonance',

  hook: {
    question: "A 480V, 60Hz bus supplies three parallel loads: a 10kW heater (purely resistive), a 15kW motor (0.8 PF lagging), and a 50kVAr capacitor bank. What is the total current from the bus? What is the combined power factor?",
    realWorldContext: "Industrial distribution panels have multiple parallel loads. To find total current, work in phasors: Heater: P=10kW, PF=1, I_R = 10000/480 = 20.83A ∠0°. Motor: P=15kW, PF=0.8, S=18.75kVA, I_M = 18750/480 = 39.1A ∠-36.9°. Capacitor bank: Q=50kVAr, I_C = 50000/480 = 104.2A ∠+90°. Total current = phasor sum of these three — you must add real and imaginary parts separately, not the magnitudes. This is why parallel AC analysis requires admittance (or phasor addition): naive scalar addition is completely wrong.",
  },

  mentalModel: [
    "**In parallel circuits, voltage is shared, currents add.** All branches have the same voltage. Each branch draws current according to its own impedance. The total current from the source is the phasor sum of all branch currents. Branch currents at different phase angles partially cancel — this is why the total current can be less than the sum of individual branch magnitudes.",
    "**Admittance Y = 1/Z: the parallel-circuit dual of impedance.** Just as resistance combines simply in series (add) and complicates in parallel (reciprocal sum), impedance complicates in parallel. The reciprocal, admittance Y = G + jB, adds directly in parallel — just like conductances add in DC circuits. This is the exact dual of how impedances add in series.",
    "**B_L and B_C have opposite signs — they cancel like XL and XC.** Inductive susceptance B_L = 1/XL (positive current lags → negative B in convention B = 1/(jX) = −j/X). Capacitive susceptance B_C = 1/XC (current leads). In a parallel circuit, B_L and B_C add with opposite signs. When B_L = B_C, they cancel and the circuit draws purely resistive current — parallel resonance.",
  ],

  intuition: {
    prose: [
      "**Why parallel currents don't just add.** Suppose branch 1 draws 10A at 0° and branch 2 draws 10A at 90°. Total = √(10² + 10²) = 14.14A, not 20A. The 90° phase difference means they peak at different times — they partially 'cancel' in the total current. This is the power of phasor analysis: it correctly accounts for time relationships, not just magnitudes.",
      "**Industrial plant power analysis.** When auditing plant power consumption: Resistive loads (heaters, incandescent lights): current in phase with voltage, PF=1. Inductive loads (motors, transformers): current lags voltage, PF<1 (lagging). Capacitive loads (capacitor banks, long cable runs with light load): current leads voltage, PF<1 (leading). The utility sees the phasor sum of all load currents. A combination of inductive and capacitive loads at the same site can self-correct PF — capacitor banks are installed precisely for this purpose.",
      "**Three-phase balanced parallel loads.** For balanced three-phase: each phase sees the same impedance. Calculate one phase (line-to-neutral voltage, single-phase current), multiply by √3 for three-phase total kVA. Line current = phase current for wye-connected loads. Line current = √3 × phase current for delta-connected loads (different because each delta element sees line-to-line voltage). This is why delta/wye transformer connections must be understood before calculating currents.",
      "**Admittance diagrams.** Just like the impedance triangle (R horizontal, X vertical, Z hypotenuse), admittance has the same structure: G horizontal, B vertical, Y hypotenuse. G = 1/R, B_C = 1/XC (upward, capacitive), B_L = −1/XL (downward, inductive). The total admittance magnitude |Y| = √(G² + B²). Total current I = V × |Y|. Phase angle of current relative to voltage: φ = arctan(B/G).",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Admittance, Conductance, Susceptance',
        body: "$$Y = \\frac{1}{Z} = G + jB$$\n\nwhere:\n- G = conductance = 1/R (siemens, S)\n- B = susceptance (siemens, S)\n  - Inductive: $B_L = -\\dfrac{1}{X_L}$ (negative)\n  - Capacitive: $B_C = +\\dfrac{1}{X_C}$ (positive)\n\n**Parallel combination:**\n$$Y_{total} = Y_1 + Y_2 + Y_3 = \\sum G_i + j\\sum B_i$$\n\n**Total impedance:** $Z_{total} = 1/Y_{total}$\n**Total current:** $I_{total} = V \\cdot Y_{total}$",
      },
      {
        type: 'procedure',
        title: 'Parallel RLC Analysis Steps',
        body: "1. Identify the common voltage V across all branches\n2. Calculate each branch impedance: Z_R = R, Z_L = jXL, Z_C = −jXC\n3. Calculate admittances: Y_R = 1/R, Y_L = −j/XL, Y_C = +j/XC\n4. Sum admittances: Y_total = (1/R) + j(1/XC − 1/XL)\n5. Total current: I_total = V × |Y_total|\n6. Phase angle: φ = arctan(B_total/G) = arctan((1/XC − 1/XL)/(1/R))\n7. Branch currents: IR = V/R, IL = V/XL, IC = V/XC\n8. Verify: phasor sum of IR, IL, IC = I_total",
      },
      {
        type: 'insight',
        title: 'Parallel Resonance — Maximum Impedance',
        body: "In a parallel LC (or RLC) circuit, at resonance B_L = B_C:\n$$\\frac{1}{X_L} = \\frac{1}{X_C} \\Rightarrow X_L = X_C \\Rightarrow f_0 = \\frac{1}{2\\pi\\sqrt{LC}}$$\n\nAt resonance, B_L and B_C cancel. Y_total = G (purely conductive). Impedance Z_total = 1/G = R — maximum impedance. Circulating current in the LC tank can be Q times the source current. This is called a 'tank circuit' — energy circulates between L and C without the source needing to supply it (except resistive losses). Used in radio transmitters, oscillators, and notch filters.",
      },
      {
        type: 'warning',
        title: 'Current Division in AC Parallel Circuits',
        body: "**Scalar rule fails for AC.** In DC: I_branch = I_total × R_other/(R1+R2). In AC, you cannot apply this rule without using phasors.\n\n**Correct AC current divider:**\n$$I_1 = I_{total} \\times \\frac{Z_2}{Z_1 + Z_2}$$\n\nNote Z_2 in numerator (opposite branch impedance, as in DC). For complex Z, this involves complex multiplication — magnitude of I1 ≠ |I_total| × |Z2|/|Z1+Z2| in general.\n\nA common mistake: measuring I1=5A and I2=5A and concluding I_total=10A. If they're 90° apart, I_total=7.07A.",
      },
    ],
    visualizations: [
      {
        id: 'ImpedanceViz',
        title: 'Parallel RLC — Admittance and Impedance',
        mathBridge: "Switch to Parallel mode. Same R, L, C, f sliders but now the triangle shows the admittance diagram. Watch total current I_total = V × |Y|. When BL = BC (resonance): Y collapses to just G, Z reaches maximum, and total drawn current from the source is minimum — most current is circulating inside the LC tank.",
      },
    ],
  },

  math: {
    prose: [
      "**Converting between parallel and series equivalents.** A parallel RL (R_p ∥ jXL_p) can be converted to its series equivalent (R_s + jXL_s). From the admittance:\n\n$$Y_p = \\frac{1}{R_p} - \\frac{j}{X_{L_p}} \\quad \\Rightarrow \\quad Z_p = \\frac{1}{Y_p} = \\frac{R_p(jX_{L_p})}{R_p + jX_{L_p}}$$\n\nMultiplying numerator and denominator by the conjugate gives R_s and X_s expressions. This conversion matters for filter design and transformer modeling where you need to switch between equivalent circuit forms.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Industrial Plant Power Factor Calculation',
        body: "Loads on a 480V 3-phase bus:\n- Load A: 100kW, PF=1.0 → P_A=100kW, Q_A=0\n- Load B: 200kW, PF=0.8 lag → Q_B=200×tan(36.9°)=150kVAr\n- Load C: 50kVAr capacitor bank → Q_C=−50kVAr\n\nTotal P = 100+200+0 = 300kW\nTotal Q = 0+150−50 = 100kVAr (lagging)\nTotal S = √(300²+100²) = 316kVA\nPF = 300/316 = 0.949 lagging\nLine current = 316000/(√3×480) = 380A",
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Two parallel branches draw 10A each, but their currents are 90° apart in phase. What is the total current from the source?',
      options: [
        '20A — currents in parallel branches always add directly',
        'About 14.1A — phasor addition: √(10² + 10²) = 14.14A',
        '5A — currents partially cancel because they are out of phase',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Why is admittance Y = G + jB more convenient than impedance for analyzing parallel AC circuits?',
      options: [
        'Admittance is always a real number, making calculations simpler',
        'Parallel admittances add directly, just as conductances do in DC parallel circuits — no reciprocal sums needed',
        'Admittance eliminates the need to work with complex numbers',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'In a parallel RLC circuit at resonance, what happens to the total current drawn from the source?',
      options: [
        'Total current reaches its maximum — resonance amplifies current in parallel circuits',
        'Total current reaches its minimum — inductive and capacitive currents cancel, leaving only resistive current',
        'Total current becomes zero — the LC tank circuit is self-sustaining',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'An industrial plant has motors drawing inductive reactive power. Installing a capacitor bank reduces the total current from the utility. How?',
      options: [
        'The capacitors reduce the supply voltage, which reduces current proportionally',
        'Capacitive current leads voltage while inductive motor current lags — they partially cancel in the phasor sum, reducing the reactive component of total current',
        'Capacitors increase the system resistance, which limits total current according to Ohm\'s Law',
      ],
      correct: 1,
    },
  ],
};

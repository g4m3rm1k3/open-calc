export default {
  id: 'elec1-005',
  slug: 'capacitors',
  chapter: 'elec1',
  order: 5,
  title: 'Capacitors — Charge, Field, and Energy',
  subtitle: 'How two conducting plates separated by an insulator store energy in an electric field — and why capacitors block DC but pass AC.',
  tags: ['capacitor', 'capacitance', 'electric field', 'charge', 'energy storage', 'dielectric', 'DC blocking'],
  aliases: 'capacitor farad charge storage electric field dielectric energy bypass decoupling',
  timeToComplete: 28,
  coreConcept: "A capacitor stores energy in an electric field between two conducting plates. Capacitance C = Q/V (charge stored per volt). Energy stored = ½CV². Capacitors block steady DC current but pass changing currents — because only changing voltage causes current (I = C × dV/dt). This makes them essential for filtering, signal coupling, energy storage, and noise suppression.",
  prerequisites: ['elec0-001', 'elec0-002'],
  nextLesson: 'rc-circuits',

  hook: {
    question: "A 480VAC motor drive's DC bus capacitor bank is 4700μF at 800V. The drive is disconnected from AC but the BUS CHARGED indicator is still lit. A technician opens the cabinet immediately — is this safe? How much energy is actually stored in those capacitors?",
    realWorldContext: "Variable frequency drives, servo amplifiers, and welding machines all use large DC bus capacitors to smooth rectified AC voltage. These capacitors store significant energy — in this case, E = ½ × 0.0047 × 800² = 1,504 joules. That's enough energy to cause serious injury or death. Industry-standard practice is to wait 5 minutes after power removal (5τ discharge time) before opening any drive. Understanding capacitor energy storage isn't academic — it's a safety requirement.",
  },

  mentalModel: [
    "**Capacitors store charge, not current.** Unlike a resistor (which immediately passes whatever current is driven through it), a capacitor accumulates charge. Apply a voltage across it — positive charge builds up on one plate, negative on the other. The charge builds until the plate voltage equals the applied voltage, at which point current stops. A fully charged capacitor in a DC circuit is effectively an open circuit.",
    "**The electric field is the energy carrier.** The energy isn't in the charges themselves — it's in the electric field between the plates. A stronger field (higher voltage, closer plates) means more stored energy. This is why capacitors can release energy very quickly (unlike batteries, which are limited by chemical reaction rates): the field collapses and releases energy at electronic speeds. Camera flash circuits exploit this for high-power short bursts.",
    "**I = C × dV/dt — current requires changing voltage.** The fundamental capacitor relationship is not I = V/C (that would make it a resistor). It's I = C × dV/dt. Current only flows when voltage is *changing*. DC (constant voltage) → dV/dt = 0 → zero current. AC (oscillating voltage) → dV/dt ≠ 0 → current flows. This is why capacitors are called DC blocking and AC coupling elements.",
  ],

  intuition: {
    prose: [
      "**Physical structure.** A capacitor consists of two conducting plates (or foils) separated by an insulating material called the dielectric. In the simplest case, flat parallel plates of area A separated by distance d. When voltage V is applied, charge Q accumulates: Q = CV. The capacitance C depends entirely on geometry and material: C = ε₀ε_r A/d, where ε₀ = 8.85 × 10⁻¹² F/m is the permittivity of free space and ε_r is the relative permittivity (dielectric constant) of the insulating material.",
      "**The dielectric multiplier.** Air has ε_r = 1. Polyester film: ε_r ≈ 3.2. Ceramic dielectrics (X7R type): ε_r ≈ 3000. Electrolytic aluminum oxide: ε_r ≈ 8.5, but extremely thin (nanometers) giving enormous C/volume. Tantalum oxide: ε_r ≈ 27 with thin oxide. The key insight: small capacitors (ceramic, film) have stable capacitance but low ε_r. Large capacitors (electrolytic, tantalum) use thin high-ε_r dielectrics to pack huge capacitance into small volume — but with tradeoffs: polarity sensitivity, lower voltage ratings, limited frequency response.",
      "**Capacitors in series and parallel.** Capacitors in parallel add directly: C_total = C₁ + C₂ + C₃ (more plate area in parallel). Capacitors in series add as reciprocals: 1/C_total = 1/C₁ + 1/C₂ + 1/C₃ (more separation in series — reduces capacitance). This is the *opposite* of resistors. Remember: for capacitors, parallel = bigger; series = smaller.",
      "**Industrial uses.** Power factor correction banks use large capacitors (kilovar-rated) to offset inductive load reactive power — reducing apparent current demand. DC bus capacitors in drives absorb ripple current from rectifiers and supply peak current to motors during acceleration. Snubber capacitors across relay contacts absorb energy from contact arcing. Bypass capacitors (0.1μF ceramic) decouple power supply noise from IC chips at high frequencies. Every capacitor application exploits the C × dV/dt relationship in some way.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Capacitance',
        body: "**Capacitance (C)** is the ability to store electric charge per volt applied:\n\n$$C = \\frac{Q}{V}$$\n\nUnit: **Farad (F)** — named after Michael Faraday.\n1 Farad = 1 Coulomb per Volt = 1 A·s/V.\n\nPractical units: μF (10⁻⁶F) for power circuits; nF (10⁻⁹F) for signal circuits; pF (10⁻¹²F) for RF circuits. 1 Farad is enormous for a capacitor — supercapacitors go to 1–3000F for energy storage.",
      },
      {
        type: 'theorem',
        title: 'Capacitance of Parallel Plates',
        body: "$$C = \\frac{\\varepsilon_0 \\varepsilon_r A}{d}$$\n\nwhere:\n- ε₀ = 8.854 × 10⁻¹² F/m (permittivity of free space)\n- ε_r = dielectric constant (1 for air, up to 3000+ for ceramics)\n- A = plate area (m²)\n- d = plate separation (m)\n\n**Increase C by**: larger plates, closer spacing, or higher ε_r dielectric.",
      },
      {
        type: 'theorem',
        title: 'Energy Stored in a Capacitor',
        body: "$$E = \\frac{1}{2} C V^2 = \\frac{Q^2}{2C} = \\frac{QV}{2}$$\n\nUnit: Joules.\n\nThe energy is stored in the **electric field** between the plates, not in the charges themselves. Energy density = ½ε₀ε_r E² J/m³.",
      },
      {
        type: 'definition',
        title: 'Capacitor Current Relationship',
        body: "$$i(t) = C \\frac{dv}{dt}$$\n\n**Current flows only when voltage is changing.** This is the fundamental equation of a capacitor — not Ohm's Law.\n\n- DC steady state: dv/dt = 0 → i = 0 → capacitor is an open circuit\n- Sudden voltage step: very large i momentarily\n- AC signal: continuous oscillation → continuous current flow",
      },
      {
        type: 'warning',
        title: 'Electrolytic Capacitors — Polarity and Energy Hazards',
        body: "Electrolytic and tantalum capacitors are **polarized** — they have a + and − terminal marked on the body. Connecting reverse polarity causes the dielectric to break down, generating heat and gas. Electrolytic capacitors can explode violently if reverse-biased or subjected to excessive voltage.\n\nAlways observe markings: the negative lead is marked with a stripe. For DC bus capacitors in drives, stored energy (½CV²) at 700V can exceed 1kJ — enough to cause severe burns or death. Wait for the discharge indicator before servicing.",
      },
      {
        type: 'insight',
        title: 'Capacitor Types and When to Use Each',
        body: "**Ceramic (MLCC)**: 1pF–100μF, excellent high-frequency, stable, non-polar. Use for bypass/decoupling.\n\n**Film (polyester, polypropylene)**: 1nF–100μF, very stable, non-polar, low loss. Use for AC coupling, precision timing.\n\n**Electrolytic (aluminum)**: 1μF–100,000μF, large values, polar, 63°C temperature derating. Use for power supply filtering, bulk storage.\n\n**Tantalum**: 0.1μF–2200μF, polar, low ESR, physically small. Use for portable electronics.\n\n**Supercapacitor**: 0.1F–3000F, polar, 2.7V max per cell. Use for energy buffering (UPS, regenerative braking).",
      },
    ],
    visualizations: [
      {
        id: 'CapacitorViz',
        title: 'Capacitor Structure — Geometry and Energy',
        mathBridge: "Explore the Structure tab: increase plate area A (more area → more C, more charge). Decrease separation d (closer plates → stronger E field → more C for same voltage). Change the dielectric material and watch C jump dramatically — ceramic's ε_r ≈ 3000 gives 3000× more capacitance than air for the same geometry. Switch to the Q=CV tab: the shaded area shows stored energy ½CV².",
      },
    ],
  },

  math: {
    prose: [
      "Capacitance derivation from parallel plates. Electric field between plates: E = V/d = σ/ε₀ε_r, where σ = Q/A (surface charge density). Solving for Q:\n\n$$Q = \\varepsilon_0 \\varepsilon_r \\frac{A}{d} V = CV$$\n\nSo $C = \\varepsilon_0 \\varepsilon_r A/d$. Energy stored equals the work done moving charge from one plate to the other against the growing electric field:\n\n$$E = \\int_0^Q \\frac{q}{C} dq = \\frac{Q^2}{2C} = \\frac{1}{2}CV^2$$",
      "**Series and parallel combinations:**\n\n$$C_{parallel} = C_1 + C_2 + \\cdots + C_n$$\n\n$$\\frac{1}{C_{series}} = \\frac{1}{C_1} + \\frac{1}{C_2} + \\cdots + \\frac{1}{C_n}$$\n\nFor two capacitors in series: $C_{series} = \\dfrac{C_1 C_2}{C_1 + C_2}$ (same as parallel resistors).",
      "**Capacitive reactance (preview for AC circuits).** In AC circuits, a capacitor presents an opposition to current called reactance:\n\n$$X_C = \\frac{1}{2\\pi f C} = \\frac{1}{\\omega C}$$\n\nAt high frequency, X_C → 0 (capacitor looks like a short — passes AC freely). At DC (f=0), X_C → ∞ (open circuit — blocks DC).",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'DC Bus Capacitor Energy Calculation',
        body: "For a drive with bus voltage VDC and capacitance C:\n\n$$E = \\frac{1}{2}CV^2$$\n\nExample: 4700μF at 700VDC:\n$E = \\frac{1}{2} \\times 0.0047 \\times 700^2 = 1152\\text{ J}$\n\nThis equals dropping a 117kg weight from 1 meter. Wait for the discharge indicator (5τ = 5RC) before any cabinet access.",
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A fully charged capacitor is connected in a DC circuit where voltage is no longer changing. What current flows through it?',
      options: [
        'A steady current proportional to V/C',
        'Zero — current only flows when voltage is changing (I = C × dV/dt, and dV/dt = 0 for DC steady state)',
        'A small leakage current equal to the capacitance times the supply voltage',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A 4700μF capacitor is charged to 700V on a VFD DC bus. How much energy is stored?',
      options: [
        'About 33J — multiply capacitance by voltage directly',
        'About 1150J — E = ½CV² = 0.5 × 0.0047 × 700² gives over 1 kilojoule',
        'About 3290J — E = CV² without the half factor',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Two capacitors C1 = 100μF and C2 = 100μF are connected in parallel. What is the total capacitance?',
      options: [
        '50μF — parallel capacitors add as reciprocals like parallel resistors',
        '200μF — capacitors in parallel add directly',
        '100μF — the capacitances are equal so they average out',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why do capacitors block DC but pass AC signals?',
      options: [
        'Capacitors have zero resistance to AC but infinite resistance to DC',
        'Current flows through a capacitor only when voltage is changing — AC oscillates continuously so current flows continuously, while DC has constant voltage so current stops once the capacitor is charged',
        'The dielectric conducts AC but blocks DC because of its molecular structure',
      ],
      correct: 1,
    },
  ],
};

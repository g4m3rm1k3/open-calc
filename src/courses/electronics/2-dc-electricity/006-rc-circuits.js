export default {
  id: 'elec1-006',
  slug: 'rc-circuits',
  chapter: 'elec1',
  order: 6,
  title: 'RC Circuits and Time Constants',
  subtitle: 'How capacitors charge and discharge exponentially — and why τ = RC is the single number that describes it all.',
  tags: ['RC circuit', 'time constant', 'tau', 'charging', 'discharging', 'exponential', 'filter', 'debounce'],
  aliases: 'RC circuit time constant tau charge discharge exponential capacitor resistor filter debounce',
  timeToComplete: 28,
  coreConcept: "When a capacitor charges or discharges through a resistor, the voltage follows an exponential curve governed by the time constant τ = RC. At t = τ, the capacitor has charged to 63.2% (or discharged to 36.8%). After 5τ, the process is essentially complete. This exponential behavior is the foundation of RC filters, timing circuits, debounce networks, and power supply filtering.",
  prerequisites: ['elec1-005'],
  nextLesson: 'inductors',

  hook: {
    question: "A proximity sensor output bounces 15 times in 3ms every time a metal part passes it. The PLC is counting parts and sees 15 counts instead of 1. How do you use a single resistor and capacitor to filter out the bounce and give the PLC a clean single pulse?",
    realWorldContext: "Input debouncing is one of the most common RC circuit applications in industrial control. Connect a 10kΩ resistor and 10μF capacitor from the sensor output to the PLC input. Time constant τ = RC = 10,000 × 10×10⁻⁶ = 100ms. The bounce events last 3ms — much less than τ — so the capacitor smooths over them. The leading edge of the real pulse still gets through (it's sustained). The PLC sees one clean rising edge instead of 15. Without understanding τ = RC, you're guessing at component values. With it, you calculate exactly what you need.",
  },

  mentalModel: [
    "**The water tank analogy.** A capacitor is like a water tank; a resistor is like a narrow pipe. When you connect a full tank (voltage source) through the pipe to an empty tank (uncharged capacitor), water flows fast at first (big pressure difference) then slows as the levels equalize. The rate of equalization is determined by pipe narrowness (R) and tank size (C). The smaller the pipe or the bigger the tank, the longer it takes — τ = RC captures exactly this intuition.",
    "**63.2% in one time constant — and why that number.** The exponential decay law V(t) = V₀(1 − e^{−t/τ}) gives V(τ) = V₀(1 − e^{−1}) = V₀ × 0.632. The number 63.2% comes from (1 − 1/e). After 5τ, V = V₀(1 − e^{−5}) = 0.9933V₀ — within 0.7% of final value. Engineers universally treat 5τ as 'done.' This is not an approximation — it's a convenient practical rule that's accurate enough for all real-world design.",
    "**RC as a frequency filter.** An RC circuit is a low-pass filter: it passes low frequencies (slow changes) and attenuates high frequencies (fast changes). The corner frequency is f_c = 1/(2πRC). Below f_c, signals pass with minimal attenuation. Above f_c, signals are attenuated at 20dB per decade (×10 reduction in gain for ×10 increase in frequency). This is why RC debounce works: bounce is high-frequency noise; the target signal is low-frequency.",
  ],

  intuition: {
    prose: [
      "**Charging an RC circuit.** Connect uncharged capacitor C in series with resistor R to voltage source Vs. At t=0: capacitor is at 0V, all source voltage appears across R, initial current = Vs/R. As capacitor charges, its voltage rises, less voltage appears across R, current decreases. The differential equation KVL gives: Vs = v_R + v_C = RC(dv_C/dt) + v_C. Solution: v_C(t) = Vs(1 − e^{−t/τ}), where τ = RC. Simultaneously, v_R(t) = Vs × e^{−t/τ} and i(t) = (Vs/R) × e^{−t/τ}.",
      "**Discharging an RC circuit.** Now disconnect the source — the charged capacitor discharges through R. At t=0: v_C = V₀, i = V₀/R (discharge current). As charge flows off, v_C drops. Solution: v_C(t) = V₀ × e^{−t/τ}. The capacitor voltage drops exponentially from V₀ to 0, with the same time constant τ = RC. The resistor dissipates all the stored energy ½CV₀² as heat during discharge.",
      "**τ determines the speed.** For R = 10kΩ, C = 100μF: τ = 1 second — you can watch the capacitor charge on a meter. For R = 1kΩ, C = 1nF: τ = 1μs — you need an oscilloscope. For R = 50Ω, C = 1pF: τ = 50ps — you need RF measurement equipment. The same equation works across 13 orders of magnitude of time constant. By choosing R and C appropriately, you choose the time scale for any application.",
      "**RC filter cutoff frequency.** The frequency at which an RC low-pass filter attenuates a signal by −3dB (to 70.7% of its DC value) is f_c = 1/(2πRC). At f_c, the output lags the input by 45°. Below f_c: signal passes largely unchanged. Above f_c: attenuated by 20dB per decade. For the debounce example: τ = 100ms, f_c = 1/(2π × 0.1) = 1.6Hz. The 3ms bounce is at ~333Hz — far above f_c — so it's attenuated by ~46dB (factor of 200). The 1Hz switch actuation rate is below f_c and passes.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'RC Time Constant',
        body: "$$\\tau = RC$$\n\nUnit: seconds (R in ohms × C in farads).\n\n| τ milestones | Charge | Discharge |\n|---|---|---|\n| 1τ | 63.2% | 36.8% |\n| 2τ | 86.5% | 13.5% |\n| 3τ | 95.0% | 5.0% |\n| 4τ | 98.2% | 1.8% |\n| 5τ | 99.3% | 0.7% |\n\nPractical rule: process is complete after **5τ**.",
      },
      {
        type: 'theorem',
        title: 'RC Charging and Discharging Equations',
        body: "**Charging** (v_C(0) = 0, source = Vs):\n$$v_C(t) = V_s(1 - e^{-t/\\tau})$$\n$$i(t) = \\frac{V_s}{R} e^{-t/\\tau}$$\n\n**Discharging** (v_C(0) = V₀, source removed):\n$$v_C(t) = V_0 \\, e^{-t/\\tau}$$\n$$i(t) = -\\frac{V_0}{R} e^{-t/\\tau}$$\n\n(Negative sign: discharge current flows opposite to charging direction.)",
      },
      {
        type: 'procedure',
        title: 'Debounce Circuit Design',
        body: "For a switch or sensor with bounce duration t_bounce:\n\n1. Choose τ >> t_bounce (typically 10–100×): τ = R × C\n2. Choose τ << expected signal period (don't filter the real signal)\n3. Standard choices: R = 10kΩ, C = 0.1μF (τ = 1ms) or R = 10kΩ, C = 10μF (τ = 100ms)\n4. Add a Schmitt trigger (74HC14) after the RC if sharp edges are needed\n5. The RC sets the time constant; the Schmitt trigger cleans up the slow rise/fall",
      },
      {
        type: 'insight',
        title: 'Power Supply Ripple Filtering',
        body: "A bridge rectifier produces 120Hz pulsating DC. The capacitor across the output must hold the voltage between pulses. For 1% ripple at 1A load: C = I/(2f × ΔV) = 1/(2×120×0.012V) ≈ 3500μF. This is why SMPS input stages have large electrolytic capacitors. The RC time constant must be >> 8.3ms (one half-cycle of 60Hz). Larger C = better filtering but larger inrush current at startup.",
      },
      {
        type: 'warning',
        title: 'Capacitor Voltage Cannot Change Instantaneously',
        body: "Because i = C × dv/dt, and current cannot be infinite in a real circuit (limited by R and source impedance), capacitor voltage cannot change instantaneously. This is a fundamental circuit law: **V_C(0⁺) = V_C(0⁻)** — the voltage across a capacitor is continuous at t=0 when a switch is thrown. Use this to find initial conditions when analyzing switching circuits.",
      },
    ],
    visualizations: [
      {
        id: 'RCCircuitViz',
        title: 'RC Time Constant — Animated Charge/Discharge',
        mathBridge: "Press Restart. Watch the dot travel along the exponential curve. Adjust R and C — the time axis rescales automatically. Notice: halving R halves τ (faster). Doubling C doubles τ (slower). The τ milestone markers show 63.2% at 1τ. Switch to Discharge to see the mirror exponential decay.",
      },
    ],
  },

  math: {
    prose: [
      "The RC circuit differential equation follows from KVL:\n\n$$V_s = v_R + v_C = R \\cdot i + v_C = RC \\frac{dv_C}{dt} + v_C$$\n\nThis is a first-order linear ODE. Solution with v_C(0) = 0:\n\n$$v_C(t) = V_s\\left(1 - e^{-t/RC}\\right)$$\n\nVerification: at t=0, v_C = 0 ✓. As t→∞, v_C → Vs ✓. At t=τ=RC: v_C = Vs(1−e⁻¹) = 0.632Vs ✓.",
      "**RC low-pass filter frequency response.** For sinusoidal input V_in = V₀sin(ωt), the capacitor voltage (output) has amplitude:\n\n$$|V_{out}| = \\frac{V_0}{\\sqrt{1 + (\\omega RC)^2}} = \\frac{V_0}{\\sqrt{1 + (f/f_c)^2}}$$\n\nwhere $f_c = \\dfrac{1}{2\\pi RC}$. At f = f_c: output = V₀/√2 = 0.707V₀ = −3dB. Phase lag: θ = arctan(f/f_c).",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'RC Filter Design Formula',
        body: "To set cutoff frequency f_c:\n\n$$R = \\frac{1}{2\\pi f_c C} \\qquad C = \\frac{1}{2\\pi f_c R}$$\n\nExample: f_c = 100Hz, C = 1μF:\n$R = 1/(2π × 100 × 10⁻⁶) = 1591Ω ≈ 1.6kΩ$\n\nUse nearest standard value: 1.5kΩ gives f_c = 106Hz.",
      },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'An RC circuit has R = 10kΩ and C = 100μF. How long does it take to charge to 63.2% of supply voltage?',
      options: [
        '1ms — multiply the values and divide by 1000',
        '1 second — τ = RC = 10,000 × 0.0001 = 1s, and the capacitor reaches 63.2% in exactly one time constant',
        '5 seconds — you need 5τ to reach 63.2%',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'Why does an RC debounce circuit filter out switch bounce but still let the real signal through?',
      options: [
        'The RC circuit detects the number of transitions and rejects anything with more than one',
        'Bounce is brief (high-frequency noise above the RC cutoff frequency) while the real signal is sustained — the capacitor smooths over the short bounce but charges up for the real signal',
        'The resistor blocks the bounce current while the capacitor stores the real signal voltage',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A capacitor is fully charged to 12V and then discharged through a 1kΩ resistor. After one time constant, what voltage remains on the capacitor?',
      options: [
        '0V — one time constant is enough to fully discharge',
        '7.56V — after 1τ, 63.2% has discharged so 36.8% remains: 12 × 0.368 = 4.42V',
        '4.42V — after 1τ, 63.2% has discharged so 36.8% × 12V = 4.42V remains',
      ],
      correct: 2,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What does RC (time constant) control about an RC filter\'s frequency response?',
      options: [
        'The amplitude of AC signals that pass through — larger RC passes larger amplitudes',
        'The corner frequency: f_c = 1/(2πRC). Below f_c signals pass; above f_c they are attenuated at 20dB per decade',
        'The phase shift of AC signals — larger RC shifts the phase by more degrees at all frequencies',
      ],
      correct: 1,
    },
  ],
};

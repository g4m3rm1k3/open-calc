export default {
  id: 'elec4-008',
  slug: 'integrators-and-differentiators',
  chapter: 'elec4',
  order: 8,
  title: 'Integrators & Differentiators',
  subtitle: 'RC Op-Amp Circuits',
  tags: ['integrator', 'differentiator', 'capacitor', 'time constant', 'waveform generation'],
  aliases: ['op-amp integrator', 'op-amp differentiator', 'RC op-amp', 'Miller integrator', 'ramp generator'],
  timeToComplete: 25,
  coreConcept: 'Replacing the feedback resistor with a capacitor creates an integrator (Vout = −1/RC ∫Vin dt); replacing the input resistor with a capacitor creates a differentiator (Vout = −RC dVin/dt).',
  prerequisites: ['elec4-007'],
  nextLesson: 'elec4-009',
  hook: {
    question: 'How does an analog autopilot compute the integral of position error to smoothly command a control surface — without any digital processor?',
    realWorldContext:
      'Before microcontrollers, PID controllers were built entirely from op-amp integrators and differentiators. Integrators accumulate error over time to eliminate steady-state offset; differentiators predict future error to prevent overshoot. These circuits still appear in analog signal conditioning, function generators, and active filter design.',
  },
  mentalModel: [
    'Op-amp integrator: feedback resistor replaced by capacitor C; virtual ground holds V− = 0, current Vin/R flows into C, charging it; Vout = −(1/RC)∫Vin dt',
    'A constant input voltage produces a linearly ramping output — the integrator converts a step into a ramp',
    'Op-amp differentiator: input resistor replaced by capacitor C; capacitor current = C·dVin/dt flows through Rf to virtual ground; Vout = −RF·C·dVin/dt',
    'A ramp input (constant dV/dt) produces a constant output from the differentiator; a step input produces a spike',
    'Practical limitation of integrator: any small offset voltage or bias current integrates over time, causing the output to ramp to the supply rail — a reset switch or large feedback resistor Rf in parallel with C is needed',
  ],
  intuition: {
    prose: [
      'The op-amp integrator replaces the feedback resistor with a capacitor. The virtual ground node still sits at 0V, so a constant input voltage Vin drives a constant current I = Vin/R into the capacitor. Since the capacitor current equals C·dVout/dt, the output voltage ramps linearly with time. A square wave input produces a triangle wave output; a sine wave input produces a cosine wave (shifted 90°). The circuit performs mathematical integration in real time.',
      'The differentiator does the inverse: the input resistor is replaced by a capacitor. The capacitor current (which flows to virtual ground through the feedback resistor) is proportional to the rate of change of the input: I = C·dVin/dt. This current flowing through Rf gives Vout = −Rf·C·dVin/dt. A triangle wave becomes a square wave; a sine wave becomes a cosine wave with 90° phase advance. The circuit computes the derivative in real time.',
      'Both circuits have important practical limitations. The integrator suffers from DC drift: any input offset voltage or bias current is integrated continuously, causing the output to slowly walk toward the supply rail and saturate. A large resistor in parallel with the feedback capacitor limits low-frequency gain and stabilises the DC operating point, at the cost of perfect integration below a corner frequency. The differentiator amplifies high-frequency noise aggressively (gain rises at 20dB/decade), making it susceptible to noise-induced oscillation. Adding a small resistor in series with the input capacitor and a small capacitor in parallel with the feedback resistor limits the high-frequency gain.',
    ],
    callouts: [
      {
        type: 'insight',
        body: 'In the frequency domain, the integrator has a transfer function H(jω) = −1/(jωRC), giving a gain that falls at −20dB/decade with a 90° phase lag. The differentiator has H(jω) = −jωRC, with gain rising at +20dB/decade and 90° phase lead. These are exact mathematical integration and differentiation in the frequency domain.',
      },
      {
        type: 'warning',
        body: 'The ideal differentiator is unstable in practice. Its gain increases without bound at high frequencies, amplifying any noise or parasitic oscillation. Always add a gain-limiting resistor Rs in series with the input capacitor, creating a pole at f = 1/(2π·Rs·C) that caps the maximum gain at Rf/Rs. A rule of thumb: choose Rs so Rf/Rs ≤ 10 (or less in noisy environments).',
      },
    ],
    visualizations: [{ type: 'OpAmpViz', props: {} }],
  },
  math: {
    prose: [
      'Integrator output: Vout(t) = −(1/RC) · ∫₀ᵗ Vin(τ) dτ + Vout(0)',
      'Integrator transfer function (s-domain): H(s) = −1/(sRC);  frequency domain: H(jω) = −1/(jωRC)',
      'Differentiator output: Vout(t) = −R_f · C · dVin(t)/dt',
      'Differentiator transfer function: H(s) = −sR_f·C;  practical (with Rs): H(s) = −sR_f·C / (1 + sR_s·C)',
    ],
    callouts: [
      {
        type: 'formula',
        body: 'Integrator: V_out(t) = −(1/RC) ∫ V_in dt.  Square wave in → triangle wave out.  RC = time constant: larger RC → slower ramp, smaller gain at any given frequency.  Unity-gain crossover at f = 1/(2πRC).',
      },
    ],
  },
};

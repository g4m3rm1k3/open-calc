export default {
  id: 'elec4-009',
  slug: 'comparators',
  chapter: 'elec4',
  order: 9,
  title: 'Comparators & Schmitt Triggers',
  subtitle: 'Open-Loop Switching & Hysteresis',
  tags: ['comparator', 'Schmitt trigger', 'hysteresis', 'threshold', 'zero-crossing', 'LM339'],
  aliases: ['voltage comparator', 'Schmitt trigger', 'window comparator', 'LM339', 'LM393'],
  timeToComplete: 20,
  coreConcept: 'A comparator operates open-loop to produce a binary output; a Schmitt trigger adds positive feedback to create two distinct switching thresholds (hysteresis), preventing noise-triggered false outputs.',
  prerequisites: ['elec4-008'],
  nextLesson: 'elec4-010',
  hook: {
    question: 'Why does a light-switch dimmer sometimes flicker or toggle rapidly near the threshold level — and how does hysteresis fix it?',
    realWorldContext:
      'Any system that switches between two states based on a threshold — thermostats, battery monitors, zero-crossing detectors, digital input buffers — faces the chattering problem when the signal hovers near the threshold with noise. Schmitt triggers are in every logic gate input, microcontroller GPIO, and industrial sensor interface.',
  },
  mentalModel: [
    'Open-loop comparator: no feedback, enormous open-loop gain forces output to +Vsat or −Vsat depending on sign of (V+ − V−)',
    'Zero-crossing detector: V− grounded; Vout flips from +Vsat to −Vsat whenever Vin crosses through zero — simple but noise-sensitive',
    'Schmitt trigger = comparator + positive feedback: a fraction of Vout is fed back to V+, shifting the threshold in the direction of the current output',
    'Upper threshold (UTP) and lower threshold (LTP): UTP > LTP creates a dead band; input must cross UTP to switch high or fall below LTP to switch low — noise within the dead band causes no switching',
    'Hysteresis width = UTP − LTP = 2·Vsat·R1/(R1 + R2) for a basic non-inverting Schmitt trigger',
  ],
  intuition: {
    prose: [
      'The comparator is an op-amp used without feedback. With open-loop gain of 100,000, even a microvolt difference between its inputs is enough to push the output fully to the positive or negative supply rail. The output is therefore digital: high if V+ > V−, low if V+ < V−. This makes the comparator ideal for converting an analog signal into a logic-level digital signal — for example, detecting when a sensor reading exceeds a setpoint.',
      'The problem with a simple threshold comparator appears when the input signal is noisy and hovering near the threshold. The output can chatter — toggling back and forth dozens of times per second as the noisy signal crosses and re-crosses the threshold. Each false transition can trigger unwanted actions downstream: a relay clicking, a counter incrementing, a microcontroller interrupt firing. This is the classic "bouncing" problem.',
      'The Schmitt trigger solves chattering with hysteresis — two different thresholds for switching up and switching down. Positive feedback from the output to the non-inverting input shifts the threshold in the direction of the current output state. When the output is high, the threshold moves up; when the output is low, the threshold moves down. A noisy signal must make a decisive excursion through the full hysteresis band before any switching occurs. Dedicated comparator ICs like the LM339 (quad, open-collector) and LM393 (dual) are faster and optimised for this open-loop switching role, with propagation delays far shorter than general-purpose op-amps like the 741.',
    ],
    callouts: [
      {
        type: 'insight',
        body: 'Op-amps are not ideal comparators: they are designed for linear operation and have internal frequency compensation that slows the output slew rate. Dedicated comparators (LM339, LM393, ADCMP600) switch in nanoseconds vs. microseconds. Use a dedicated comparator whenever switching speed matters, such as in switch-mode power supplies, ADC clocks, or high-speed signal conditioning.',
      },
      {
        type: 'warning',
        body: 'The LM339/LM393 use open-collector outputs — the output transistor can only pull the output low, not high. You must add a pull-up resistor to the positive supply to get a valid logic-high output. Without the pull-up, the output floats when the comparator output is "high" and the circuit will not work.',
      },
    ],
    visualizations: [{ type: 'OpAmpViz', props: { mode: 'comp' } }],
  },
  math: {
    prose: [
      'Non-inverting Schmitt trigger thresholds: UTP = +Vsat · R1/(R1 + R2);  LTP = −Vsat · R1/(R1 + R2)',
      'Hysteresis band: ΔVHYS = UTP − LTP = 2·|Vsat| · R1/(R1 + R2)',
      'Inverting Schmitt trigger (input to V−, feedback to V+): UTP = +Vref·(1 + R1/R2) − Vout(low)·R1/R2 — thresholds depend on reference voltage',
      'Required hysteresis to reject noise: ΔVHYS > 2·Vpk(noise) to guarantee zero false transitions',
    ],
    callouts: [
      {
        type: 'formula',
        body: 'Schmitt UTP = V_sat · R1/(R1+R2);  LTP = −V_sat · R1/(R1+R2).  Example: V_sat = ±13V, R1 = 10kΩ, R2 = 100kΩ → UTP = +1.18V, LTP = −1.18V, hysteresis = 2.36V.',
      },
    ],
  },
};

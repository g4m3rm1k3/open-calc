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
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A comparator has V− connected to a 2.5V reference. The input at V+ is slowly rising from 0V. What happens when it crosses 2.5V?',
      options: [
        'The output rises proportionally, tracking the difference between V+ and V−',
        'The output switches abruptly from its low rail to its high rail — the comparator operates open-loop so any positive difference instantly saturates the output',
        'The output stays low until V+ reaches at least 3V, due to the comparator\'s built-in hysteresis',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A temperature sensor signal hovers near the thermostat setpoint with 50 mV of noise superimposed. A simple comparator switches the heater relay on and off repeatedly. What solves this chattering problem?',
      options: [
        'Replace the comparator with a faster op-amp so it responds before the noise can cause switching',
        'Add a Schmitt trigger with hysteresis wider than the noise — for example, set UTP = setpoint + 100 mV and LTP = setpoint − 100 mV so noise within the 200 mV dead band causes no switching',
        'Add a large capacitor across the relay coil to slow the relay\'s mechanical response to the rapid switching',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A Schmitt trigger with Vsat = ±13V uses R1 = 10 kΩ and R2 = 90 kΩ. What are the upper and lower switching thresholds?',
      options: [
        'UTP = +1.3V, LTP = −1.3V — hysteresis = 2.6V',
        'UTP = +13V, LTP = −13V — thresholds equal the supply rails',
        'UTP = +11.7V, LTP = −11.7V — thresholds are Vsat minus the feedback resistor drop',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'The LM339 comparator has an open-collector output. A designer connects the output directly to a microcontroller input without a pull-up resistor. What will the microcontroller read when the comparator output is "high"?',
      options: [
        'Logic HIGH (+5V or +3.3V) — the open-collector output sources current when the comparator output is high',
        'An undefined floating voltage — the open-collector can only pull the output low; without a pull-up resistor to supply, the output floats and reads unpredictably when the comparator is not pulling it low',
        'Logic LOW (0V) — open-collector outputs are always low because they only sink current',
      ],
      correct: 1,
    },
  ],
};

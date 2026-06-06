export default {
  id: 'elec6-006',
  slug: 'power-electronics',
  chapter: 'elec6',
  order: 6,
  title: 'Power Electronics & Motor Drives',
  subtitle: 'Rectifiers, Inverters & VFD Operation',
  tags: ['VFD', 'variable frequency drive', 'rectifier', 'inverter', 'PWM', 'motor drive'],
  aliases: ['variable speed drive', 'frequency inverter', 'motor controller', 'AC drive'],
  timeToComplete: 28,
  coreConcept: 'A VFD converts fixed-frequency AC to DC, then synthesises variable-frequency AC using IGBT switching. Varying frequency varies motor speed; varying voltage-to-frequency ratio maintains motor flux.',
  prerequisites: ['elec6-005'],
  nextLesson: 'elec6-007',
  hook: {
    question: 'A centrifugal pump is oversized for its application and has run at full speed for years. Engineering proposes adding a VFD. How much energy could be saved, and why?',
    realWorldContext: '60–80% of industrial motors now operate on variable frequency drives. For centrifugal loads (pumps, fans, compressors), the affinity laws mean cutting speed by 20% reduces power consumption by 49%. VFDs have paid back their purchase cost in energy savings in under a year in many installations.',
  },
  mentalModel: [
    'VFD architecture: AC input → diode rectifier → DC bus capacitor bank → IGBT H-bridge inverter → PWM output',
    'DC bus voltage = VAC_peak = VAC_rms × √2; for 480VAC three-phase, DC bus ≈ 679V; capacitors hold this voltage between rectifier pulses',
    'V/Hz control maintains constant motor flux by keeping the ratio of output voltage to frequency constant; vector control adds torque and flux decoupling for dynamic applications',
    'IGBTs switch at 4–16kHz, creating PWM waveforms; the motor inductance integrates these pulses into approximately sinusoidal current — the motor "sees" a sine wave even though voltage is a pulse train',
    'Braking energy must go somewhere: braking resistors dissipate it as heat; regenerative drives return it to the grid — critical for large cranes, elevators, and high-inertia loads',
  ],
  intuition: {
    prose: [
      'The rectifier front-end of a VFD draws current from the AC line in sharp pulses rather than continuously. These pulses contain large amounts of 5th, 7th, 11th, and 13th harmonic current — the same harmonics that overheat neutral conductors and transformers, cause voltage distortion, and trip sensitive equipment sharing the same electrical distribution. This is why large VFD installations include passive harmonic filters or 12-pulse rectifiers, and why IEEE 519 sets limits on allowable harmonic current injection into the utility grid.',
      'Pulse-width modulation is the master technique of power electronics. An IGBT switch can only be fully on or fully off — never linear — so variable voltage is achieved by varying the duty cycle at high frequency. A 50% duty cycle at 679V DC delivers the same average voltage as 340V DC. The motor inductance averages out the switching ripple, so the motor current is smooth even though the voltage is a series of pulses. The switching frequency must be high enough that the motor inductance provides adequate filtering, but not so high that IGBT switching losses become dominant.',
      'The affinity laws describe centrifugal machine behaviour: flow is proportional to speed, head (pressure) is proportional to speed squared, and power is proportional to speed cubed. Running a pump at 80% speed uses only 51% of the power needed at 100% speed. This cubic relationship is why VFDs on centrifugal loads deliver such dramatic energy savings. Fixed-speed pumps that are throttled by a valve waste energy in the restriction; a VFD eliminates that waste by slowing the pump instead.',
    ],
    callouts: [
      { type: 'insight', body: 'Long motor cables (>50m) between VFD and motor cause voltage doubling at the motor terminals due to transmission line reflections. The rising PWM pulse reflects off the motor\'s high-impedance winding and adds to the incident wave. Use output reactors or dV/dt filters for cable runs over 30m.' },
      { type: 'warning', body: 'Never use power factor correction capacitors between a VFD and the motor. The capacitors form a resonant circuit with the motor inductance at a frequency close to a switching harmonic, causing catastrophic oscillations and drive trips. PFC capacitors belong on the input side only, and only after consulting the drive manufacturer.' },
    ],
    visualizations: [{ type: 'ACPowerViz', props: {} }],
  },
  math: {
    prose: [
      'DC bus voltage: V_DC = √2 × V_AC_rms; for 480VAC three-phase input, V_DC ≈ 1.414 × 480 ≈ 679V; six-pulse rectifier ripple frequency = 6 × line frequency = 300Hz (50Hz system) or 360Hz (60Hz system)',
      'Affinity law: P ∝ n³; reducing speed from 100% to 80% reduces power to 0.8³ = 0.512, a 48.8% power saving',
      'IGBT switching loss: E_sw = 0.5 × V_DC × I_collector × (t_rise + t_fall) per switching event; at 10kHz with V_DC=650V, I=10A, t_rise=t_fall=50ns: P_sw = 10000 × 0.5 × 650 × 10 × 100×10⁻⁹ = 32.5W per device',
      'V/Hz ratio: for a 460V, 60Hz motor, the base ratio is 460/60 = 7.67 V/Hz; at 30Hz output the VFD applies 230V; below base speed, current and torque are maintained while speed varies',
    ],
    callouts: [
      { type: 'formula', body: 'Braking resistor power: P_brake = (0.5 × J × ω²) / t_decel, where J is load inertia (kg·m²), ω is initial angular velocity (rad/s). For a 100kg·m² load decelerating from 1500rpm (157rad/s) in 5s: P = 0.5×100×157²/5 = 246kW peak.' },
    ],
  },
};

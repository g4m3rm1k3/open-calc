export default {
  id: 'elec0-009',
  slug: 'motor-starters-and-drives',
  chapter: 'elec0',
  order: 9,
  title: 'Motor Starters and Variable Frequency Drives',
  subtitle: 'From direct-on-line starting to VFD speed control — how industrial motors are powered, protected, and controlled.',
  tags: ['motor starter', 'DOL', 'star-delta', 'VFD', 'variable frequency drive', 'motor protection', 'overload relay', 'soft starter', 'motor control'],
  aliases: 'motor starter DOL direct online star delta VFD drive frequency inverter speed control',
  timeToComplete: 25,
  coreConcept: 'Motors need starting methods (to limit inrush current), running protection (overload relays), and sometimes speed control (VFDs). DOL starting is simple but draws 6× rated current on startup. Star-delta and soft starters reduce this. VFDs vary frequency to control speed with precise energy efficiency.',
  prerequisites: ['elec0-005', 'elec0-004'],
  nextLesson: 'grounding-and-safety',

  hook: {
    question: "A 15HP conveyor motor trips its breaker every time it starts under load, but runs fine once it's up to speed. The breaker is correctly rated for the motor's full-load current. Why does it trip only on startup?",
    realWorldContext: "Inrush current on motor starting is one of the most common causes of nuisance tripping, voltage sag, and mechanical stress in industrial facilities. A motor drawing 600% of rated current for 2–10 seconds at startup can dim lights, reset PLCs, and stress mechanical couplings. Understanding why this happens, how different starting methods address it, and how VFDs change the entire equation is fundamental to maintaining and commissioning any machine with a motor.",
  },

  mentalModel: [
    "**A motor at standstill looks like a short circuit.** At zero speed, the motor's back-EMF is zero, so the only thing limiting current is the winding resistance (typically very low). At startup, current can be 500–800% of rated. As speed increases, back-EMF builds and opposes the supply voltage, reducing current. By full speed, current settles to rated value (100%).",
    "**Starters limit inrush; overloads protect against sustained overcurrent.** A motor starter's contactor doesn't limit startup current — it's just a switch. Inrush current protection during starting uses circuit breakers rated for motor inrush (inverse-time characteristic). Overload relays protect the motor from sustained overcurrent during running (mechanical overload, single-phasing).",
    "**A VFD doesn't just control speed — it controls everything.** By varying frequency and voltage together, a VFD brings the motor up to speed gradually (limiting inrush to ~150% of FLA), can run it at any speed with full torque, regenerates energy during deceleration, and monitors motor health continuously. It's the correct solution for any application needing variable speed or smooth starting.",
  ],

  intuition: {
    prose: [
      "**Direct-On-Line (DOL) starting — the simplest approach.** Close the contactor and connect the motor directly to full voltage. The motor draws 500–700% of rated current for the acceleration period (typically 1–10 seconds depending on load). Simple, cheap, and reliable. The inrush current will: momentarily sag the supply voltage (affects other equipment on the same bus), stress motor windings and shaft coupling mechanically on every start, and require inverse-time breakers sized for starting duty. Used for small motors (< 15HP typically) or where the supply can handle the inrush.",
      "**Star-Delta (Y-Δ) starting — reducing inrush mechanically.** The motor's windings are connected in star (Y) configuration for starting — each winding sees supply voltage ÷ √3 (277V instead of 480V for a 480V motor). Current and torque drop to 1/3 of DOL values. After the motor reaches ~80% speed, a timer switches the windings to delta (Δ) configuration — full voltage, rated operation. The transition causes a brief current surge. Requires a 6-terminal motor and three contactors. Common on compressors and pumps in the 15–100HP range.",
      "**Soft starters — electronic inrush control.** A soft starter uses anti-parallel thyristors (SCRs) in series with each phase to ramp voltage up gradually during starting. At t=0, voltage is reduced (say to 40%) which reduces torque and current. Voltage ramps up over 5–30 seconds until the motor is at full voltage and speed. Less mechanical shock than DOL or star-delta. Can also provide controlled ramp-down for conveyor stopping. No variable frequency control — motor runs at fixed speed after starting.",
      "**Variable Frequency Drives (VFDs) — the full solution.** A VFD rectifies AC to DC (the 'DC bus'), then inverts it back to variable-frequency AC using IGBTs (insulated gate bipolar transistors) that switch at ~10kHz to simulate a sinusoidal output. By simultaneously varying both output frequency and voltage (constant V/Hz ratio to maintain motor flux), the VFD provides: controlled acceleration (typically 150% inrush instead of 600%), any speed from near-zero to above nameplate, constant torque at any speed, energy savings at partial load, and dynamic braking. The CNC axis drives on your machines are VFDs — they accelerate and decelerate the axis motors dozens of times per minute under precise control.",
      "**Motor protection — the overload relay.** Running a motor slightly above rated current continuously overheats it. The insulation degrades exponentially with temperature — the motor's life halves for every 10°C above rated temperature. The overload relay (or electronic motor protection relay) monitors current and accumulates thermal history. It models the motor's thermal state: current overload × time creates a 'thermal memory' that triggers the trip. Reset doesn't clear the thermal model — you must wait for the motor to cool before restarting. This prevents rapid cycling ('star-trip-reset-star-trip' abuse) that destroys motor insulation.",
      "**Reading a VFD parameter list.** VFDs have hundreds of parameters. The critical ones for basic commissioning: motor nameplate data (rated voltage, frequency, current, RPM, power factor), acceleration and deceleration times, minimum and maximum output frequency, reference source (who commands the speed — keypad, 4–20mA analog input, or PLC communication), and run/stop command source. Most VFD commissioning faults come from incorrect motor data or reference source misconfiguration.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Motor Inrush and Starting Current',
        body: '**Locked rotor current (LRC):** Current at startup with rotor not moving. Typically **500–700% of FLA** (full load amps).\n\n**Motor starting time:** Time from start command to rated speed. Short for unloaded motors (< 3 seconds), longer for high-inertia loads like fans and compressors (10–30 seconds).\n\n**Motor circuit breaker sizing (NEC 430.52):** Inverse-time circuit breakers: rated at 250% FLA maximum. Motor short-circuit protection devices: up to 800% FLA.\n\n**Contactor sizing:** Must handle 600% FLA inrush without welding — this is what AC-3 duty rating means.',
      },
      {
        type: 'insight',
        title: 'VFD Output Wiring — Not Standard Cable',
        body: 'VFD output wiring carries high-frequency switching signals (the IGBT switching at 10kHz creates voltage spikes with very fast rise times — nanoseconds). These cause: electromagnetic interference (EMI) in nearby signal wiring, premature bearing failure from high-frequency currents induced in the motor shaft, and insulation stress. Best practices: use shielded cable between VFD and motor, ground the shield at both ends, keep VFD output cables separated from signal wiring, and consider output chokes/filters for long cable runs (> 50 meters). Ignoring this causes mysterious EMI faults in sensors and PLC I/O.',
      },
      {
        type: 'procedure',
        title: 'Basic VFD Commissioning Steps',
        body: '1. Enter motor nameplate data: rated voltage, frequency, FLA, rated RPM, power factor.\n2. Select control mode: V/Hz (simple, robust) or vector control (precise torque control, needs autotune).\n3. Set acceleration time (P_acc): typically 5–30 seconds depending on load inertia.\n4. Set deceleration time (P_dec): similar to acceleration unless braking is needed faster.\n5. Set minimum frequency (typically 3–5Hz) to prevent stall.\n6. Set maximum frequency (typically 50–60Hz nominal, up to 120Hz for higher speeds).\n7. Configure run/stop source: digital input DI1 or comms.\n8. Configure speed reference: analog input AI1 (4–20mA or 0–10V) or comms.\n9. Autotune if vector mode (VFD measures motor resistance and inductance).\n10. Test: jog at low speed, verify rotation direction, ramp to full speed.',
      },
      {
        type: 'warning',
        title: 'Never Use a Contactor to Switch a VFD Output While Running',
        body: 'Connecting or disconnecting the motor from a running VFD output using a contactor causes: immediate overcurrent fault on the VFD (the sudden impedance change looks like a short), voltage spikes that can destroy the VFD output IGBTs, and mechanical stress. If you need a bypass circuit, switch only when the VFD is stopped and the output is de-energized. Some applications use a bypass contactor to run the motor at fixed speed from the line if the VFD fails — this requires careful interlock design to prevent simultaneous VFD and line contactor closure.',
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      "**Motor power and current relationship:**\n\n$$\\text{HP} = \\frac{V_{LL} \\times I_{FL} \\times \\sqrt{3} \\times \\text{PF} \\times \\eta}{746}$$\n\nWhere $V_{LL}$ is line-to-line voltage, $I_{FL}$ is full-load current, PF is power factor, and $\\eta$ is efficiency. Rearranged to find current from HP rating:\n\n$$I_{FL} = \\frac{\\text{HP} \\times 746}{V_{LL} \\times \\sqrt{3} \\times \\text{PF} \\times \\eta}$$",
      "**Energy savings with VFD.** For centrifugal pumps and fans, the **affinity laws** state that power scales as the cube of speed:\n\n$$P_2 = P_1 \\times \\left(\\frac{N_2}{N_1}\\right)^3$$\n\nRunning a fan at 80% speed uses only $(0.8)^3 = 51.2\\%$ of the power at full speed. This is why VFDs on HVAC fans and pump systems have 2–3 year payback periods from energy savings alone.",
    ],
    callouts: [],
  },

  examples: [
    {
      title: 'Solving the breaker trip problem',
      problem: 'A 15HP, 460V, 3-phase motor with FLA = 21A trips its 50A breaker during starting under load. The motor needs to accelerate a high-inertia flywheel taking ~8 seconds to reach speed.',
      solution: 'DOL starting current: 21A × 600% = 126A for 8 seconds.\n\nA 50A inverse-time breaker can withstand 10× rating (500A) for 0.1s and about 400% (200A) for 10s. At 126A = 252% of 50A rating for 8 seconds — the breaker may trip depending on its characteristic curve.\n\nSolutions:\n1. **VFD:** Limits starting current to ~150% FLA = 31.5A. Eliminates tripping entirely. Best solution.\n2. **Soft starter:** Ramps voltage, reduces inrush. Less precise than VFD.\n3. **Star-delta starter:** Reduces inrush to 33% of DOL = 42A. May work but adds complexity.\n4. **Upsize breaker:** Not recommended — defeats the protective purpose.\n\nVFD is the correct engineering solution for this high-inertia application.',
    },
  ],

  challenges: [
    {
      problem: 'A 10HP, 460V three-phase motor has a full-load current (FLA) of 14A. Calculate the maximum DOL starting current using a 600% inrush multiplier.',
      hint: 'Starting current = FLA × inrush multiplier.',
      walkthrough: [
        'Identify knowns: FLA = 14A, inrush multiplier = 600% = 6.0×',
        'DOL starting current = FLA × multiplier',
        'I_start = 14A × 6 = 84A',
        'This 84A inrush lasts for the motor acceleration period (typically 1–5 seconds for a lightly loaded motor).',
        'Circuit breakers and fuses protecting this circuit must tolerate this inrush without nuisance tripping — hence motor circuit breakers are rated at 250% FLA (inverse-time) or up to 800% FLA (motor short-circuit protection device).',
      ],
      answer: '84A',
      difficulty: 'easy',
    },
    {
      problem: 'A centrifugal pump motor running at 1800 RPM draws 45kW. A VFD reduces motor speed to 1350 RPM (75% of rated speed). Using the affinity laws, calculate the new power draw.',
      hint: 'For centrifugal loads, power scales as the cube of the speed ratio.',
      walkthrough: [
        'Identify the speed ratio: N2/N1 = 1350/1800 = 0.75',
        'Affinity law for power: P2 = P1 × (N2/N1)³',
        'Calculate: P2 = 45kW × (0.75)³',
        '(0.75)³ = 0.421875',
        'P2 = 45kW × 0.421875 = 18.98kW ≈ 19kW',
        'The motor draws only ~42% of its full-speed power at 75% speed — a 58% reduction in energy consumption from a 25% speed reduction.',
        'This dramatic energy saving is why VFDs on pumps and fans pay back their capital cost within 1–3 years.',
      ],
      answer: 'Approximately 19kW (18.98kW)',
      difficulty: 'medium',
    },
    {
      problem: 'A star-delta starter is used on a 30HP, 460V motor. (a) What is the starting current in star configuration as a percentage of DOL starting current? (b) What is the starting torque in star as a percentage of DOL torque? (c) Why might star-delta fail to start under full load, and what is the solution?',
      hint: 'In star configuration each winding sees V/√3. Both current and torque scale with the square of voltage; starting current as a fraction of DOL scales by 1/3.',
      walkthrough: [
        'In star configuration, each motor winding receives line voltage divided by √3.',
        'Voltage ratio: V_star / V_delta = 1/√3 ≈ 0.577',
        '(a) Starting current scales with voltage (I ∝ V for a fixed impedance): I_star = I_DOL × (1/√3)² = I_DOL × 1/3 = 33.3% of DOL starting current.',
        'If DOL starting current is 600% FLA, star starting current = 600% × 1/3 = 200% FLA.',
        '(b) Torque is proportional to the square of voltage: T_star = T_DOL × (1/√3)² = T_DOL × 1/3 = 33.3% of DOL torque.',
        '(c) The motor starts with only 1/3 of its normal starting torque. If the load requires more than 33% of the motor\'s full-load torque to break away and accelerate, the motor will not accelerate in star configuration — it stalls at low speed. When the timer switches to delta, the sudden inrush (current spike from low speed to delta) can be severe and may trip protection devices.',
        'Solution: For high-breakaway-torque loads (compressors, loaded conveyors, positive-displacement pumps), star-delta is inappropriate. Use a soft starter (which ramps voltage with current limiting) or a VFD (which provides full torque at controlled current throughout the acceleration). Star-delta is suitable only for lightly loaded or unloaded starting: fans, centrifugal pumps, and unloaded compressors.',
      ],
      answer: '(a) 33.3% of DOL starting current. (b) 33.3% of DOL torque. (c) Insufficient starting torque for high-breakaway-torque loads; solution is a soft starter or VFD.',
      difficulty: 'hard',
    },
  ],
};

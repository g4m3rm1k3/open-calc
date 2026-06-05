export default {
  id: 'elec0-006',
  slug: 'sensors',
  chapter: 'elec0',
  order: 6,
  title: 'Industrial Sensors',
  subtitle: 'Proximity switches, photoelectric sensors, limit switches, and analog transducers — the eyes and ears of every automated machine.',
  tags: ['proximity sensor', 'photoelectric sensor', 'limit switch', 'inductive', 'capacitive', 'analog', '4-20mA', 'NPN', 'PNP', 'sensor wiring'],
  aliases: 'prox sensor proximity switch inductive capacitive photoelectric limit switch NPN PNP 3-wire sensor analog transducer',
  timeToComplete: 25,
  coreConcept: 'Industrial sensors convert physical phenomena (position, presence, distance, temperature, pressure) into electrical signals. Discrete sensors output 0V or supply voltage. Analog sensors output a 4–20mA or 0–10V signal proportional to measurement. NPN vs. PNP determines how the output connects to your PLC input.',
  prerequisites: ['elec0-003', 'elec0-005'],
  nextLesson: 'wiring-diagrams',

  hook: {
    question: "You replace a proximity sensor on a Fanuc machine with an identical-looking unit from a different manufacturer. The machine faults: 'Input X1.3 incorrect state.' The sensor LED is on. What went wrong?",
    realWorldContext: "Sensor compatibility failures are among the most common commissioning and maintenance headaches. The sensor may be physically identical, electrically rated the same, and detecting correctly — but if you swapped NPN output for PNP output, or sourcing for sinking, the PLC input sees the signal inverted. Understanding sensor output types, wiring configurations, and input card requirements is what separates a technician who can solve this in two minutes from one who spends hours chasing it.",
  },

  mentalModel: [
    "**Sensors are the machine's nervous system.** They detect position, presence, temperature, pressure, flow, and force. Without sensors, a machine can't know where its parts are, whether the workpiece is loaded, whether the door is closed, or whether the process is within limits. Every automated action depends on at least one sensor confirming conditions are correct.",
    "**Discrete vs. analog.** A discrete (digital) sensor has only two states: detected or not detected, on or off. Output is either supply voltage or 0V. An analog sensor outputs a continuously variable signal proportional to the physical measurement — 6.4mA might mean 40% of measured range. Discrete sensors are simpler; analog sensors give you the actual value.",
    "**NPN vs. PNP — who completes the circuit.** NPN (sinking) sensor: the output transistor connects the output to 0V (negative) when active. The load is connected between +V and the output pin. PNP (sourcing) sensor: the output transistor connects the output to +V when active. The load is connected between the output pin and 0V. Most Fanuc and Siemens PLCs use NPN inputs (sinking); some Allen-Bradley I/O uses PNP (sourcing). Mismatching type = inverted output.",
  ],

  intuition: {
    prose: [
      "**Inductive proximity sensors — metal detection only.** An inductive prox generates an oscillating electromagnetic field from a coil at its face. When a metal target (ferrous or non-ferrous) enters the sensing field, eddy currents are induced in the metal, loading the oscillator circuit and reducing amplitude. The internal circuit detects this dampening and changes output state. The target must be metal — plastic, wood, and ceramic won't trigger it. Sensing range varies by target material: rated range is for standard steel. For aluminum, sensing range is typically 40–60% of rated; for copper and brass, 35–50%.",
      "**Capacitive proximity sensors — can detect almost anything.** A capacitive sensor forms one plate of a capacitor; the target (or even the air gap to a non-conductive material) forms the other plate. When a target approaches, capacitance increases, which the sensor detects. Useful for: liquid level through plastic containers, granular material presence, plastic parts, glass. Adjust the sensitivity pot to ignore the container wall and detect only the contents inside.",
      "**Photoelectric sensors — light-based detection.** Three types: (1) Through-beam: separate emitter and receiver; object interrupts the beam. Longest range, highest reliability, requires two-piece installation. (2) Retroreflective: emitter and receiver in the same housing, reflects off a retroreflector. Simpler installation, object interrupts the return beam. (3) Diffuse: emitter and receiver in same housing, detects light reflected back from the target itself. Simplest installation, shortest range, most affected by target surface characteristics.",
      "**Limit switches — mechanical contact, absolute reliability.** A limit switch is a mechanically-actuated electrical switch. The actuator (roller, lever, plunger) physically contacts the target and moves the contacts. Advantages: not affected by material type, dust, or EMI; contacts can directly switch 10A loads; no power required to detect. Disadvantages: physical contact means wear over millions of operations, mechanical misalignment can damage the switch or miss the target. Used where absolute position confirmation is critical: machine zero home, safety gate confirmation, chuck open/closed.",
      "**Analog transducers — measuring the actual value.** A 4–20mA pressure transmitter connected to your hydraulic circuit outputs 4mA at 0 bar and 20mA at 250 bar (for a 0–250 bar sensor). The PLC's analog input reads the current and scales it: current = 4 + (16 × pressure/250). If you read 12mA, pressure = (12−4)/16 × 250 = 125 bar. Temperature transmitters (RTD, thermocouple) work similarly. The 4–20mA standard gives you fault detection (0mA = broken wire, above 20mA = sensor fault) and immunity to cable voltage drop.",
      "**Wiring a 3-wire PNP sensor to a PLC NPN input.** This mismatch requires a pull-down resistor or an interposing relay. The PNP sensor's output swings to +24V when active; an NPN PLC input expects the signal to swing to 0V when active. Wire a 4.7kΩ resistor from the sensor output to 0V. When the sensor is off (output floating or low): input sees 0V through resistor = inactive. When sensor is on (output at +24V): input sees +24V = active. The resistor limits current and creates the reference. Alternatively, use a relay with a coil connected to the PNP output.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'NPN (Sinking) vs. PNP (Sourcing) Output',
        body: '**NPN (sinking):**\n- Output transistor connects signal to 0V when active\n- Load connects between +V and sensor output\n- Input card provides current; sensor sinks it to 0V\n- Common with: Fanuc PMC, Siemens PLC inputs, most Japanese PLCs\n\n**PNP (sourcing):**\n- Output transistor connects signal to +V when active\n- Load connects between sensor output and 0V\n- Sensor provides current to the input\n- Common with: many Allen-Bradley I/O modules, European PLCs\n\n**Mnemonic:** NPN = Negative Pull; PNP = Positive Provides',
      },
      {
        type: 'procedure',
        title: 'Identifying an Unknown Sensor with a Multimeter',
        body: '1. Check voltage between Brown (+) and Blue (−) terminals with power on: should read supply voltage (24V). Confirms power is correct.\n2. Actuate the sensor (bring metal close to face, or block beam).\n3. Measure voltage on Black (output) terminal relative to Blue (0V):\n   - Reads near 24V when active → PNP (sourcing)\n   - Reads near 0V when active → NPN (sinking)\n4. For discrete sensors, also confirm: does the indicator LED match the output state?\n5. For NO vs NC: does output change state when target present, or when absent?',
      },
      {
        type: 'insight',
        title: 'Sensor Wiring Color Code (IEC 60947-5-2)',
        body: 'Standard 3-wire DC sensor colors:\n- **Brown** = +V (positive supply, typically +24V)\n- **Blue** = 0V (negative supply / common)\n- **Black** = signal output (NPN or PNP)\n\nFor 4-wire sensors (both NO and NC output):\n- **Brown** = +V\n- **Blue** = 0V\n- **Black** = output 1 (typically NC)\n- **White** = output 2 (typically NO)\n\nUS sensors may use Black/White/Green — always check the datasheet.',
      },
      {
        type: 'warning',
        title: 'Inductive Sensor Sensing Distance Reduction with Non-Steel Targets',
        body: 'Rated sensing distance on an inductive prox is specified for standard (mild) steel. For other metals, multiply by:\n- Stainless steel: 0.6–0.9×\n- Aluminum: 0.4–0.6×\n- Copper/Brass: 0.3–0.5×\n\nIf your sensor is borderline on distance with steel targets, it may completely fail to detect aluminum fixtures. When retrofitting or adding sensors, always verify detection with the actual target material at the actual mounting distance.',
      },
      {
        type: 'insight',
        title: '4-20mA Analog Signal Scaling Formula',
        body: 'To convert a 4–20mA signal to engineering units (0–100% of sensor range):\n\n$$\\text{Value (\\%)} = \\frac{I_{\\text{mA}} - 4}{16} \\times 100$$\n\nFor a 0–250 bar sensor:\n$$\\text{Pressure (bar)} = \\frac{I_{\\text{mA}} - 4}{16} \\times 250$$\n\nPLC analog input modules usually have a scaling register: set span (250) and zero offset (4mA = 0 bar) and the PLC does this calculation automatically in the AI channel configuration.',
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      "**Analog signal scaling.** A 4–20mA transmitter produces a current proportional to its input:\n\n$$I = 4 + 16 \\cdot \\frac{\\text{measured value}}{\\text{full-scale range}}$$\n\nTo recover the measurement from a current reading:\n\n$$\\text{measurement} = \\frac{I - 4}{16} \\times \\text{full-scale range}$$",
      "**Inductive sensor frequency response.** Inductive sensors have a maximum switching frequency (typically 500Hz–5kHz) due to the time needed to detect and release. For a sensor that switches at 1kHz on a gear tooth wheel, the maximum detectable shaft speed is: 1000 teeth/second ÷ teeth count = max shaft speed in rev/second. Exceed this and the sensor misses teeth — you lose counts and accuracy.",
    ],
    callouts: [],
  },

  examples: [
    {
      title: 'Fanuc PMC sensor replacement',
      problem: 'The original proximity sensor on a Fanuc lathe part chute is NPN, 24VDC, 10–30V rated. You have a replacement that is PNP, 24VDC. The Fanuc PMC input card is NPN (sinking) type. Will the PNP sensor work, and if not, how do you fix it?',
      solution: 'Direct connection won\'t work correctly. The PMC NPN input expects the signal line to be pulled to 0V when active. The PNP sensor pushes the signal line to +24V when active — opposite polarity.\n\nFix 1: Find an NPN replacement (correct approach for long-term).\nFix 2: Add a 4.7kΩ pull-down resistor from sensor output to 0V. When PNP sensor activates (+24V output), input sees +24V = "high" — but NPN input logic expects high=inactive, low=active, so the PMC will read it inverted. You\'d then invert the logic in the PMC ladder.\nFix 3: Use a 24VDC NPN relay as adapter: PNP sensor output → relay coil → relay NO contact wired as NPN to PMC input.',
    },
  ],

  challenges: [
    {
      problem: 'An inductive proximity sensor is rated M18 flush-mount with an 8mm sensing distance for mild steel. A technician installs it to detect aluminum brackets. What maximum sensing distance should be expected? (Reduction factor for aluminum: 0.4)',
      hint: 'Multiply the rated sensing distance by the correction factor for the target material.',
      walkthrough: [
        'Identify knowns: rated sensing distance = 8mm (for mild steel), aluminum reduction factor = 0.4',
        'Apply material correction: effective distance = rated distance × reduction factor',
        'Effective distance = 8mm × 0.4 = 3.2mm',
        'The sensor must be mounted within 3.2mm of the aluminum bracket face to reliably detect it — less than half the steel-rated distance.',
        'If the mounting allows 6mm clearance, the sensor will not detect the aluminum target at all.',
      ],
      answer: '3.2mm',
      difficulty: 'easy',
    },
    {
      problem: 'A 4–20mA pressure sensor (range: 0–100 bar) is wired to a PLC analog input with a 250Ω burden resistor. At 0 bar the sensor outputs 4mA; at 100 bar it outputs 20mA. What voltage appears across the burden resistor when pressure is 50 bar?',
      hint: 'First find the output current at 50 bar using the linear 4–20mA relationship, then apply V = I × R.',
      walkthrough: [
        'The 4–20mA output is linear: 4mA at 0 bar, 20mA at 100 bar → span = 16mA over 100 bar.',
        'At 50 bar (50% of range): I = 4 + (16 × 50/100) = 4 + 8 = 12mA',
        'Convert to amps: 12mA = 0.012A',
        'Apply Ohm\'s Law across the burden resistor: V = I × R = 0.012A × 250Ω = 3.0V',
        'The PLC analog input reads 3.0VDC, which its firmware scales back to 50 bar using the configured span and offset.',
      ],
      answer: '3.0V',
      difficulty: 'medium',
    },
    {
      problem: 'A PNP sensor (sourcing output, goes HIGH to +24V when detecting) is wired to a sinking-input PLC card. The PLC shows the input as always-ON even when no target is present. The sensor LED is OFF when no target is near. Is this a wiring error, a sensor fault, or a card type mismatch? What specifically must change?',
      hint: 'Trace the current path when the sensor is inactive. Where does the input terminal see its voltage from?',
      walkthrough: [
        'Sensor behavior: LED off = sensor not detecting = PNP output transistor is open (high-impedance, not driving +24V). The sensor output is floating — not actively driven in either direction.',
        'Sinking PLC input: the card has an internal pull-up resistor from the input terminal to +24V. This is how the card can detect a logic 1 even from NPN sensors — but it also means the input terminal sits at +24V when nothing is connected.',
        'With a PNP sensor output floating (inactive), the PLC internal pull-up holds the input terminal at +24V → PLC reads logic 1 always.',
        'When the PNP sensor activates, it also drives +24V onto the input → still logic 1. The input is stuck ON in both states.',
        'This is a card type mismatch combined with a wiring configuration problem. A sinking PLC input with an internal pull-up requires a device that SINKS the input to 0V for a logic 1 (NPN sensor) or that pulls it to 0V for inactive state.',
        'Solutions: (1) Replace PNP sensor with NPN sensor (NPN sinks input to 0V when active — correct for this sinking-input card). (2) Or add a pull-down resistor (4.7kΩ) from sensor output to 0V to establish a defined inactive state, and invert the input logic in the PLC program. Option 1 is correct engineering practice.',
      ],
      answer: 'Card type mismatch and wiring configuration error. A sinking PLC input requires an NPN (sinking) sensor. The PNP sensor output floats when inactive, and the card\'s internal pull-up holds the input at logic 1. Replace the PNP sensor with an NPN sensor.',
      difficulty: 'hard',
    },
  ],
};

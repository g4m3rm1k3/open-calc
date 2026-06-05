export default {
  id: 'plc0-002',
  slug: 'plc-hardware',
  chapter: 'plc0',
  order: 2,
  title: 'PLC Hardware',
  subtitle: 'CPU, I/O modules, power supply, rack, and image tables — the physical system behind the program.',
  tags: ['PLC hardware', 'CPU', 'I/O module', 'input module', 'output module', 'rack', 'power supply', 'image table', 'DIN rail', 'backplane'],
  aliases: 'PLC hardware CPU module I/O input output rack power supply image table backplane',
  timeToComplete: 20,
  coreConcept: "A PLC system is a rack of modules communicating over a backplane: a CPU module executing the program, input modules that read physical signals into memory, and output modules that drive actuators from memory. The input image table and output image table are the memory maps that bridge the physical world and the program.",
  prerequisites: ['plc0-001'],
  nextLesson: 'scan-cycle',

  hook: {
    question: "You're adding a temperature sensor (4–20mA analog) and three new solenoid valves (24VDC outputs) to an existing PLC system. The current chassis has the CPU in slot 0, two digital input modules in slots 1–2, and one digital output module in slot 3. What hardware do you add and where does it go?",
    realWorldContext: "Understanding PLC hardware is prerequisite to everything else. Before you write a single rung, you need to know where your signals physically connect, what signal types each module accepts, how those signals appear in memory, and what can fail. An experienced automation engineer can look at a panel drawing and immediately understand the entire hardware architecture. They know which module type to spec for a thermocouple vs. a proximity switch vs. an encoder. Hardware knowledge prevents wiring a 120VAC signal into a 24VDC input module — a common and expensive mistake.",
  },

  mentalModel: [
    "**The rack is the backbone.** The chassis (rack) provides the backplane — a shared communication bus and power rail that all modules plug into. The CPU communicates with all I/O modules over this backplane. In small systems, everything fits in one chassis. In large systems, multiple chassis are connected via a backplane extension cable or a fieldbus network (EtherNet/IP, PROFIBUS, DeviceNet).",
    "**Modules are typed by signal.** You cannot mix signal types on a single module — there are digital input modules (24VDC, 120VAC, 240VAC), analog input modules (4–20mA, 0–10V, thermocouple, RTD), digital output modules (relay, transistor, triac), and analog output modules. Selecting the wrong module type means your wiring won't work even if the program is correct.",
    "**Image tables are the interface.** Physical signals don't appear directly in the program. The input scan copies all input module states into the Input Image Table (IIT) in CPU memory. The program reads the IIT — not the physical inputs. At end-of-scan, the Output Image Table (OIT) is copied to the output modules. This two-buffer system makes the program's view of I/O consistent for the entire scan.",
  ],

  intuition: {
    prose: [
      "**CPU module.** The CPU executes the program, manages memory, handles communication, and controls the scan cycle. It contains the program memory (flash EEPROM for the user program, RAM for runtime data), a real-time clock, and communication ports (serial, Ethernet, USB). The CPU module's performance spec is given in scan time per 1K of logic (typically 0.3–1ms per 1K Boolean rungs). ControlLogix uses a 'controller' in one slot; CompactLogix integrates the controller with built-in I/O.",
      "**Digital input modules.** Discrete (on/off) inputs — proximity switches, limit switches, pushbuttons, level sensors. Signal is converted to a binary bit in the IIT. Common signal types: 24VDC sinking/sourcing, 120VAC, 240VAC. Important specs: input filter time (debounce), number of points per module (8, 16, 32), and current sinking/sourcing compatibility with the field sensor type (NPN vs. PNP). A 24VDC input module will not read a 120VAC signal — you need the right module.",
      "**Digital output modules.** Relay outputs use physical relay contacts — can switch AC or DC, rated for the contact current (2A–10A typical). Transistor (FET) outputs switch DC faster with no contact wear, rated typically 0.5–2A. Triac outputs switch AC. Choose relay for high-current or mixed AC/DC loads; transistor for high-speed cycling (more than a few Hz) or DC-only loads where contact life matters.",
      "**Analog I/O modules.** Analog inputs read a continuous signal (4–20mA, 0–10V, thermocouple millivolts) and convert it to a digital number in the IIT, typically a 12-bit or 16-bit integer. 4–20mA is the industrial standard for sensors — it's current loop, immune to wire resistance voltage drop, and detects broken wire (0mA = fault). A 12-bit module gives 4096 counts over the range; for 0–100°C that's 0.024°C resolution. Analog output modules do the reverse: write a number, get an analog voltage or current to drive a VFD or control valve.",
      "**Specialty modules.** Beyond basic I/O: high-speed counter modules (for encoders, up to 1MHz pulse rates), servo/motion modules (closed-loop position control), communication modules (EtherNet/IP, PROFIBUS, DeviceNet, Modbus RTU), temperature input modules with cold-junction compensation for thermocouples. Each specialty module typically has its own configuration software and acts as a self-contained processor for its specialized function.",
      "**Wiring practices.** All field wiring enters the panel through terminal blocks, not directly to module terminals. I/O commons are tied to signal commons — 24VDC COM, not earth ground. Analog signals are wired in shielded twisted-pair cable, shield grounded at ONE end only (typically panel end) to prevent ground loops. Never run signal wiring in the same conduit as power wiring — radiated noise from motor cables induces false triggers on sensitive inputs.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Input Image Table vs. Output Image Table',
        body: '**Input Image Table (IIT):** A region of CPU memory that mirrors the state of all input modules. Updated once at the START of each scan. The program READS this table — it never directly reads the physical input terminal.\n\n**Output Image Table (OIT):** A region of CPU memory that the program WRITES to. Copied to the physical output modules at the END of each scan.\n\n**Why two tables?** Isolation. If a sensor changes mid-scan, the program sees the value it had at scan start — consistent for the entire scan. Without this buffering, rung 1 might see sensor X=0 and rung 500 might see sensor X=1 in the same scan, producing inconsistent logic.',
      },
      {
        type: 'definition',
        title: 'Sinking vs. Sourcing I/O',
        body: '**NPN sensor (current sinking):** The sensor\'s output transistor connects the load to COM (negative). Current flows FROM the PLC input terminal THROUGH the sensor TO common. Use a SINKING input module.\n\n**PNP sensor (current sourcing):** The sensor\'s output transistor connects the load to +24V. Current flows FROM +24V THROUGH the sensor TO the PLC input terminal. Use a SOURCING input module.\n\nMnemonic: "NPN points to Negative" — the NPN transistor switches to the negative supply.\n\nMixing NPN sensors with a sourcing input module (or vice versa) results in the input never switching — a common wiring fault. Always check sensor datasheet for NPN/PNP before ordering the module.',
      },
      {
        type: 'insight',
        title: 'The 4–20mA Loop: Why Not 0–20mA?',
        body: 'The 4–20mA standard starts at 4mA (not 0mA) deliberately:\n\n**Broken wire detection:** A broken signal wire produces 0mA — distinguishable from a valid 4mA minimum-range signal. The PLC can generate a "sensor fault" alarm on < 3.5mA, before the signal reaches minimum range.\n\n**Transmitter power:** The 4mA minimum can be used to power the transmitter (two-wire transmitters). No separate power supply needed for the sensor.\n\n**Noise immunity:** Current signals are less susceptible to induced noise from power wiring than voltage signals. A 0.1V noise spike on a 0–10V signal is 1% error; the same spike on a 4–20mA loop produces negligible error.\n\nScaling: Raw counts (0–32767 for a 15-bit module) must be scaled to engineering units. If 4mA = 0 PSI and 20mA = 100 PSI, scaling formula: PSI = (raw − 4mA_count) × (100 / 16mA_span_counts).',
      },
    ],
    visualizations: [
      {
        id: 'PLCLadderSim',
        title: 'I/O Module Simulation',
        mathBridge: 'This simulation shows how physical I/O maps to program tags. The I/O tab represents the input module (toggle switches) and output module (indicator lights). The Tags tab shows the Input Image Table — notice that toggling an input updates the tag value, and the rung uses that tag value, not the physical switch directly.',
        initialProps: {
          program: [
            [
              { type: 'XIC', tag: 'LIMIT_SW_1', label: 'Limit Sw 1' },
              { type: 'XIC', tag: 'LIMIT_SW_2', label: 'Limit Sw 2' },
              { type: 'OTE', tag: 'CONVEYOR_FWD', label: 'Conveyor Fwd' },
            ],
            [
              { type: 'XIC', tag: 'PHOTO_EYE', label: 'Photo Eye' },
              { type: 'XIO', tag: 'CONVEYOR_FWD', label: 'Conv Fwd' },
              { type: 'OTE', tag: 'PART_PRESENT', label: 'Part Present' },
            ],
          ],
          tags: {
            LIMIT_SW_1: { type: 'BOOL', value: false },
            LIMIT_SW_2: { type: 'BOOL', value: false },
            PHOTO_EYE: { type: 'BOOL', value: false },
            CONVEYOR_FWD: { type: 'BOOL', value: false },
            PART_PRESENT: { type: 'BOOL', value: false },
          },
          inputs: [
            { tag: 'LIMIT_SW_1', label: 'Limit Sw 1' },
            { tag: 'LIMIT_SW_2', label: 'Limit Sw 2' },
            { tag: 'PHOTO_EYE', label: 'Photo Eye' },
          ],
          outputs: [
            { tag: 'CONVEYOR_FWD', label: 'Conveyor Fwd' },
            { tag: 'PART_PRESENT', label: 'Part Present' },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      "**Analog scaling formula.** A 12-bit analog input module produces raw counts 0–4095 over its input range. For a 4–20mA input with a 0–100 PSI transmitter:\n\n$$\\text{PSI} = \\frac{(\\text{raw} - \\text{raw}_{4mA})}{(\\text{raw}_{20mA} - \\text{raw}_{4mA})} \\times 100$$\n\nIf 4mA corresponds to count 0 and 20mA corresponds to count 4095: PSI = (raw / 4095) × 100. If the module has a 4–20mA offset, raw at 4mA = 819 (20% of 4095), raw at 20mA = 4095: PSI = ((raw − 819) / 3276) × 100. Always verify which formula applies by checking the module datasheet — the offset form is most common for 4–20mA modules.",
      "**Module current draw.** Each module draws current from the backplane power supply. The chassis power supply has a rated current output (typically 5A at 5VDC backplane and 2A at 24VDC). Sum all module current draws and verify the total does not exceed the power supply rating. If it does, add a second chassis or use a chassis with higher-rated power supply. This is a routine part of system design that must be done before ordering hardware.",
    ],
    callouts: [],
  },

  challenges: [
    {
      problem: 'A PLC rack has a 5VDC backplane supply rated at 3.0A. Module current draws: CPU = 0.8A, digital input module (×2) = 0.2A each, digital output module = 0.3A, analog input module = 0.4A. Is the power supply adequate?',
      hint: 'Sum all module current draws and compare to the 3.0A supply rating.',
      walkthrough: [
        'List all module current draws:',
        'CPU: 0.8A',
        'Digital input module 1: 0.2A',
        'Digital input module 2: 0.2A',
        'Digital output module: 0.3A',
        'Analog input module: 0.4A',
        'Total: 0.8 + 0.2 + 0.2 + 0.3 + 0.4 = 1.9A',
        '1.9A < 3.0A rated supply — adequate.',
        'Remaining capacity: 3.0 − 1.9 = 1.1A (room for one more typical module).',
        'Best practice: keep total load below 80% of rated capacity for thermal margin: 0.8 × 3.0A = 2.4A max recommended.',
        '1.9A < 2.4A — well within the 80% guideline.',
      ],
      answer: 'Total current draw = 1.9A, well under the 3.0A rated supply. Power supply is adequate.',
      difficulty: 'easy',
    },
    {
      problem: 'A temperature transmitter outputs 4–20mA for a range of 0–500°C. The PLC analog input module converts 4–20mA to raw counts 0–32767. The raw count is currently 10485. What is the temperature in °C?',
      hint: 'First find what count corresponds to 4mA and 20mA. Then scale linearly. 4mA is 0 at the low end, 20mA is the full scale.',
      walkthrough: [
        'Module range: 4mA = count 0, 20mA = count 32767.',
        'Wait — some modules map the full 0–20mA range across 0–32767.',
        'For a 4–20mA signal on a 0–20mA module: 4mA = 4/20 × 32767 = 6553, 20mA = 32767.',
        'Actually, modules designed for 4–20mA typically map 4mA to 0 and 20mA to full scale.',
        'For this problem, assume 4mA = 0 counts, 20mA = 32767 counts (direct 4–20mA module).',
        'Raw = 10485 maps to: temp = (10485 / 32767) × 500°C.',
        'temp = 0.3200 × 500 = 160°C.',
        'Cross-check: 10485/32767 ≈ 32% of range, 32% of 500°C = 160°C. Reasonable.',
      ],
      answer: '160°C (assuming direct 4–20mA scaling where 0 counts = 4mA = 0°C and 32767 counts = 20mA = 500°C).',
      difficulty: 'medium',
    },
    {
      problem: 'A PLC application monitors 48 digital inputs, 32 digital outputs, 8 analog inputs (4–20mA), and 2 analog outputs. Modules available: 32-point DI at 0.25A, 16-point DO at 0.30A, 8-channel AI at 0.45A, 4-channel AO at 0.35A. CPU draws 0.85A. Design the minimum module count and check if a 4.0A supply is sufficient.',
      hint: 'Divide required points by module capacity (round up). Sum all current draws.',
      walkthrough: [
        'Digital inputs: 48 points ÷ 32 points/module = 1.5 → 2 DI modules.',
        'Digital outputs: 32 points ÷ 16 points/module = 2.0 → 2 DO modules.',
        'Analog inputs: 8 channels ÷ 8 channels/module = 1.0 → 1 AI module.',
        'Analog outputs: 2 channels ÷ 4 channels/module = 0.5 → 1 AO module.',
        'Total modules: 2 DI + 2 DO + 1 AI + 1 AO + 1 CPU = 7 modules.',
        'Current totals:',
        'CPU: 0.85A',
        '2 × DI: 2 × 0.25A = 0.50A',
        '2 × DO: 2 × 0.30A = 0.60A',
        '1 × AI: 0.45A',
        '1 × AO: 0.35A',
        'Total: 0.85 + 0.50 + 0.60 + 0.45 + 0.35 = 2.75A',
        '2.75A < 4.0A rated — adequate. 80% of 4.0A = 3.2A. 2.75A < 3.2A — within guideline.',
        'Chassis needed: 7 modules minimum (8-slot or 10-slot chassis recommended).',
      ],
      answer: '7 modules total (CPU + 2 DI + 2 DO + 1 AI + 1 AO). Total current = 2.75A. A 4.0A supply is adequate with 31% headroom.',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'Specifying I/O modules for a machine',
      problem: 'A packaging machine has: 12 proximity switches (24VDC PNP), 1 photoelectric sensor (24VDC NPN), 4 pushbuttons (24VDC NO), 6 solenoid valves (24VDC, 1.5A each), 2 motor contactors (24VDC coil, 3A each), 1 VFD speed reference (0–10V analog). What modules do you specify?',
      solution: 'Digital inputs:\n- 12 proximity switches (PNP = sourcing) + 4 pushbuttons = 16 sourcing inputs → 1 × 16-point 24VDC sourcing DI module\n- 1 photoelectric sensor (NPN = sinking) → needs sinking input, but to avoid two input modules, use a sourcing module with NPN sensors through a pull-up resistor, OR just specify a universal input module that handles both.\n- Practical choice: 1 × 24VDC universal DI module (handles both NPN and PNP)\n\nDigital outputs:\n- 6 solenoids × 1.5A = 9A total, contactors × 3A = 6A\n- Individual solenoid max 1.5A per point — transistor outputs rated 2A are fine\n- Contactor coils at 3A — need relay output module for 3A per point\n- Use: 1 × 16-point transistor DO for solenoids + 1 × relay DO module for contactors\n\nAnalog outputs:\n- 1 × 0–10V output → 1 × 4-channel analog output module (using one channel)\n\nTotal: 1 DI, 1 transistor DO, 1 relay DO, 1 AO = 4 I/O modules + CPU',
    },
  ],
};

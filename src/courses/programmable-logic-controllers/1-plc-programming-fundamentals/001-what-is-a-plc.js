export default {
  id: 'plc0-001',
  slug: 'what-is-a-plc',
  chapter: 'plc0',
  order: 1,
  title: 'What Is a PLC?',
  subtitle: 'The ruggedized computer that runs every factory floor — and why it replaced relays, engineers, and midnight rewiring.',
  tags: ['PLC', 'programmable logic controller', 'industrial automation', 'relay', 'Allen-Bradley', 'Siemens', 'IEC 61131', 'SCADA'],
  aliases: 'PLC programmable logic controller industrial automation relay replacement Allen-Bradley Siemens',
  timeToComplete: 18,
  coreConcept: "A PLC (Programmable Logic Controller) is a ruggedized industrial computer that reads physical inputs, executes a stored program, and writes physical outputs — repeatedly, reliably, in real time. It replaced hardwired relay panels, which required physical rewiring every time production changed.",
  prerequisites: [],
  nextLesson: 'plc-hardware',

  hook: {
    question: "A car assembly plant produces 12 different vehicle models on the same line. Each model needs different welding sequences, different conveyor speeds, and different torque specs on the bolts. In 1968, every model change required electricians to physically rewire the control panel — a two-week shutdown. What invention ended that?",
    realWorldContext: "Dick Morley invented the PLC in 1968 at Bedford Associates specifically to solve this problem for General Motors. Instead of rewiring the panel, engineers changed a program. The PLC became the dominant control technology in manufacturing within a decade. Today there are an estimated 70 million PLCs in service worldwide — in every factory, water treatment plant, oil refinery, building HVAC system, and roller coaster. Learning to program PLCs is the most direct path into industrial automation engineering.",
  },

  mentalModel: [
    "**A PLC is a scan-cycle computer.** Unlike a desktop computer that runs many programs simultaneously, a PLC runs one program in a continuous loop: read all inputs → execute program → write all outputs → repeat. Each pass through the loop is one 'scan.' A typical scan takes 1–20 milliseconds. The program sees a consistent snapshot of inputs — they don't change mid-scan.",
    "**Physical I/O is the point.** The PLC's job is to connect sensors (inputs) to actuators (outputs) through logic. Input modules convert physical signals (24VDC switches, 4–20mA sensors, encoder pulses) into bits the CPU can read. Output modules convert bits into physical signals (relay contacts, transistor outputs, analog voltages) that drive motors, solenoids, and lights.",
    "**The program is the control panel.** Relay logic was physical: wires and contact springs. Ladder logic is the software simulation of relay logic: contacts represent conditions, coils represent outputs. A PLC program in ladder logic looks like the relay diagram it replaced — this was intentional, so the existing relay engineers could transition.",
  ],

  intuition: {
    prose: [
      "**Why not a regular PC?** Industrial environments kill consumer electronics. Temperature swings from -20°C to +70°C, constant vibration from machinery, electrical noise from motors and welding equipment, airborne metal dust and coolant mist. PLCs are built to survive all of this: conformal-coated PCBs, DIN-rail mounting with vibration isolation, filtered power supplies, shielded I/O. A factory PC would fail within weeks; a PLC runs for 10–20 years.",
      "**The relay panel it replaced.** Before PLCs, machine control was hardwired relay logic: physical relays, wired in series and parallel to implement the machine's logic. Change the logic = rewire the panel. A complex machine might have 500 relays in a cabinet the size of a room. Debugging meant following wires with a test light. PLCs made control logic soft — the wiring stays, the program changes.",
      "**IEC 61131-3 — five programming languages.** PLCs can be programmed in five standardized languages: Ladder Diagram (LD), Function Block Diagram (FBD), Structured Text (ST), Instruction List (IL), and Sequential Function Chart (SFC). Most industrial PLCs support all five. Ladder Diagram is the most common in North America and Japan. Structured Text is increasingly popular for complex calculations. SFC is used for machine sequences. This course focuses on Ladder Diagram.",
      "**Major vendors.** Allen-Bradley (now Rockwell Automation) dominates North America with the ControlLogix and CompactLogix families. Siemens dominates Europe with the S7 family. Mitsubishi, Omron, and Schneider are major players globally. The instruction names differ between vendors (Siemens uses SR/SET/RESET instead of OTL/OTU), but the fundamental concepts are identical. This course uses Allen-Bradley naming conventions, the most widely used in industrial training.",
      "**SCADA and the wider system.** PLCs don't operate in isolation. A SCADA (Supervisory Control and Data Acquisition) system sits above the PLCs: a PC-based application that monitors plant-wide data, logs historian values, displays HMI (Human-Machine Interface) screens, and sends setpoints to the PLCs. The PLC controls the machine in real time; the SCADA system provides plant-wide visibility and supervisory control. Understanding PLCs is the foundation for understanding the entire industrial automation stack.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Key PLC Terms',
        body: '**PLC** — Programmable Logic Controller. The industrial control computer.\n**Scan** — One complete pass: input read → program execute → output write.\n**Tag** — A named variable in PLC memory (like a programming variable).\n**Rung** — One line of ladder logic (equivalent to a relay circuit branch).\n**I/O** — Input/Output. Physical connections to sensors and actuators.\n**HMI** — Human-Machine Interface. The touchscreen or panel the operator uses.\n**SCADA** — Supervisory Control and Data Acquisition. Plant-wide monitoring system.',
      },
      {
        type: 'insight',
        title: 'PLC vs. PC vs. Microcontroller',
        body: '| Feature | PLC | PC (Windows) | Microcontroller |\n|---|---|---|---|\n| Purpose | Industrial control | General computing | Embedded product |\n| OS | Real-time OS | Non-real-time | Bare metal or RTOS |\n| Scan determinism | ±1ms | Variable | ±μs |\n| I/O | Modular rack | USB/PCIe | GPIO pins |\n| Environment | Industrial | Office | Product interior |\n| Programming | IEC 61131-3 | C/Python/etc | C/C++ assembly |\n| Cost | $1K–$50K | $500–$5K | $1–$50 |\n| Lifespan | 20+ years | 5 years | Product life |\n\nThe PLC\'s value is the combination of ruggedization, real-time determinism, and standardized industrial protocols — none of the alternatives have all three.',
      },
      {
        type: 'procedure',
        title: 'How to Read a PLC Part Number',
        body: 'Example: **1769-L33ERM** (Allen-Bradley CompactLogix)\n\n- **1769** — Product series (CompactLogix)\n- **L** — Controller (CPU module)\n- **33** — 2MB memory, 16 I/O modules, 30 axes\n- **ERM** — EtherNet/IP with motion\n\nExample: **6ES7 315-2AG10-0AB0** (Siemens S7-300)\n\n- **6ES7** — SIMATIC S7 family\n- **315** — CPU type\n- **2AG10** — Firmware version and variant\n- **0AB0** — Hardware version\n\nReading part numbers correctly is essential for ordering spare parts and specifying replacement hardware.',
      },
    ],
    visualizations: [
      {
        id: 'PLCLadderSim',
        title: 'Your First PLC Rung',
        mathBridge: 'This is the simplest possible PLC program: one input (a pushbutton) connected to one output (a light). Toggle the START_PB input switch on the I/O tab — watch PILOT_LIGHT turn on. This is the PLC scan cycle in action: input read, rung evaluated, output written.',
        initialProps: {
          program: [
            [
              { type: 'XIC', tag: 'START_PB', label: 'Start PB' },
              { type: 'OTE', tag: 'PILOT_LIGHT', label: 'Pilot Light' },
            ],
          ],
          tags: {
            START_PB: { type: 'BOOL', value: false },
            PILOT_LIGHT: { type: 'BOOL', value: false },
          },
          inputs: [{ tag: 'START_PB', label: 'Start PB' }],
          outputs: [{ tag: 'PILOT_LIGHT', label: 'Pilot Light' }],
        },
      },
    ],
  },

  math: {
    prose: [
      "**Scan time and response time.** If a sensor goes high in the middle of a scan, the PLC won't see it until the start of the next scan. If the scan takes 10ms, the maximum input-to-output latency is one full scan: 10ms. For faster events, high-speed input modules with hardware interrupt capability are used (response < 1ms). For most machine control — conveyor motors, pneumatic cylinders, solenoid valves — a 10ms scan is perfectly adequate. Problems occur when engineers try to use PLCs for tasks that require microsecond timing.",
      "**I/O addressing.** Physical I/O points are addressed by rack/slot/bit location. Allen-Bradley ControlLogix uses tag names for all I/O — each physical point gets a tag. Older Allen-Bradley (PLC-5, SLC-500) uses numeric addresses: I:1/3 means input module in slot 1, bit 3. Siemens uses I (input), Q (output), M (memory) addresses: I0.0, Q0.3, MW10. The tag naming system in ControlLogix is more readable but the underlying concept is the same: each physical I/O point has a unique address in the input or output image table.",
    ],
    callouts: [],
  },

  challenges: [
    {
      problem: 'A factory replaces a relay panel with a PLC. The relay panel had 200 relays and took 3 weeks to rewire when the product changed. After the PLC installation, the engineer changes the program in 2 days. The plant runs 50-week cycles. How many product changeovers happen per year, and what is the annual time saved?',
      hint: 'With 50-week cycles and ~2 changeovers per year typically, calculate: time saved = (3 weeks − 2 days) × changeovers per year.',
      walkthrough: [
        'Assume 2 product changeovers per year (common for automotive platforms).',
        'Old method: 3 weeks × 5 working days = 15 days per changeover.',
        'New method: 2 days per changeover.',
        'Time saved per changeover: 15 − 2 = 13 days.',
        'Annual time saved: 13 days × 2 changeovers = 26 days of production time recovered.',
        'At $100,000/day production value (typical automotive): $2.6M annual savings just from changeover reduction.',
        'This is the core economic case for PLCs — not just flexibility, but quantifiable uptime.',
      ],
      answer: '26 working days per year saved. At automotive production rates, this represents millions of dollars in recovered production time.',
      difficulty: 'easy',
    },
    {
      problem: 'A PLC scan time is 8ms. A proximity sensor detects parts passing on a conveyor at 120 parts per minute. What is the minimum time between parts, and is the PLC fast enough to detect each part reliably?',
      hint: 'Convert 120 parts/minute to time between parts. Compare to scan time.',
      walkthrough: [
        '120 parts/minute ÷ 60 seconds = 2 parts per second.',
        'Time between parts: 1 ÷ 2 = 500ms between parts.',
        'A part must be detectable for at least one full scan to be guaranteed to be seen.',
        'Scan time = 8ms. Part detection window = 500ms.',
        '500ms >> 8ms, so the PLC can easily detect every part.',
        'If the parts were moving at 12,000 parts/minute (200/second), the inter-part time would be 5ms — shorter than the scan. Parts would be missed.',
        'Rule of thumb: the detectable event must last at least 2× the scan time to be guaranteed detected.',
      ],
      answer: '500ms between parts, well above the 8ms scan time. The PLC will reliably detect all parts.',
      difficulty: 'medium',
    },
    {
      problem: 'A PLC has a 10ms scan time. During scan N, a sensor goes high at t=3ms into the scan. During scan N+1, another sensor goes high at t=7ms into the scan. From the PLC\'s perspective, in what order did these events occur, and what is the apparent time between them?',
      hint: 'The PLC reads inputs once at the START of each scan. When does it first see each sensor?',
      walkthrough: [
        'Scan N starts at t=0ms. Inputs are read at t=0ms.',
        'Sensor A goes high at t=3ms (during scan N) — the PLC does NOT see this yet. The scan already read inputs at t=0.',
        'Scan N+1 starts at t=10ms. Inputs are read at t=10ms.',
        'Sensor A (high since t=3ms) is first seen by the PLC at the start of scan N+1: t=10ms.',
        'Sensor B goes high at t=17ms (t=7ms into scan N+1) — not seen until scan N+2 starts at t=20ms.',
        'From the PLC perspective: Sensor A seen at t=10ms, Sensor B seen at t=20ms. Apparent gap: 10ms (one full scan).',
        'Actual time between events: 17ms − 3ms = 14ms.',
        'The PLC\'s scan-cycle input sampling has quantized the real-time events: actual 14ms gap appears as 10ms gap.',
        'This is scan aliasing — an important source of timing error in event-sequence diagnosis.',
      ],
      answer: 'Both sensors appear separated by 10ms (one scan) from the PLC\'s view, even though the actual separation was 14ms. Scan-cycle input sampling quantizes real-time events.',
      difficulty: 'hard',
    },
  ],

  examples: [
    {
      title: 'PLC program for a simple conveyor start/stop',
      problem: 'A conveyor belt has a Start button (momentary NO), a Stop button (momentary NC), and a motor contactor output. Write the English-language description of the ladder program before learning the exact instructions.',
      solution: 'Rung 1 — Start/Stop logic:\n  Condition: (Start button is pressed OR motor is already running) AND Stop button is NOT pressed\n  Action: Energize motor output\n\nRung 2 — Status light:\n  Condition: Motor is running\n  Action: Turn on green pilot light\n\nThis is the complete control program for a single-speed conveyor. In ladder diagram, this translates to 2 rungs with about 4 elements each. The "OR motor is already running" part is the seal-in circuit — the topic of a later lesson. The key insight: the program is just IF-THEN logic applied to physical I/O.',
    },
    {
      title: 'Relay panel vs. PLC: the wiring comparison',
      problem: 'A machine has 3 inputs and 2 outputs. In relay logic, each output requires one relay coil. Each relay has 4 contacts available. Describe the physical wiring required vs. the PLC equivalent.',
      solution: 'Relay panel approach:\n- 2 relay coils (one per output)\n- Wire from each input terminal to appropriate relay coil pins\n- Wire from relay contacts to output terminals\n- Total wires: approximately 3 inputs × 2 destinations + 2 coil wires + 2 output wires = 12+ wires\n- Documentation: hand-drawn schematic, updated manually\n- Logic change: cut wires, add wires, re-document\n\nPLC approach:\n- 3 input terminals on input module (2 wires each + common = 7 wires)\n- 2 output terminals on output module (2 wires each + common = 5 wires)\n- Total wires: 12 wires (same)\n- Documentation: software ladder diagram, printable, searchable\n- Logic change: edit software, download program (minutes, not hours)\n\nThe I/O wiring is nearly identical. The advantage is entirely in the program: soft logic vs. hard wires.',
    },
  ],
};

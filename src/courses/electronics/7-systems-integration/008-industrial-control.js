export default {
  id: 'elec6-008',
  slug: 'industrial-control',
  chapter: 'elec6',
  order: 8,
  title: 'Industrial Control Integration',
  subtitle: 'PLC + HMI + VFD + Sensors',
  tags: ['PLC', 'HMI', 'SCADA', 'Modbus', 'EtherNet/IP', 'industrial automation'],
  aliases: ['programmable logic controller', 'industrial automation', 'factory automation', 'SCADA system'],
  timeToComplete: 30,
  coreConcept: 'Industrial control systems layer sensors, PLCs, HMIs, and drives over deterministic fieldbus networks. The 4-20mA loop and open protocols like Modbus and EtherNet/IP are the glue that connects physical world to supervisory software.',
  prerequisites: ['elec6-007'],
  nextLesson: 'elec6-009',
  hook: {
    question: 'A bottling plant runs smoothly but the operator has no idea why the reject rate doubles on Tuesday afternoons. What system gives you the data to find out?',
    realWorldContext: 'Industrial SCADA historians log thousands of tags at one-second resolution continuously. Post-mortem analysis of historian data identifies correlations between process variables and quality outcomes that no amount of real-time monitoring would reveal. Data without context is noise; context without data is guesswork.',
  },
  mentalModel: [
    'PLC scan cycle: read inputs → execute ladder logic → write outputs → repeat at 1–100ms intervals; time-critical tasks need fast scan times',
    '4-20mA: 4mA = 0% (zero live), 20mA = 100% full scale; zero live means a broken wire (0mA) is distinguishable from a legitimate zero signal (4mA)',
    'Modbus RTU: master-slave RS-485 serial protocol; master polls each slave in sequence — latency scales with network size; still dominant in simple sensor networks',
    'EtherNet/IP: industrial Ethernet with CIP application layer; supports implicit (cyclic, real-time) and explicit (on-demand) messaging; basis of Rockwell Automation systems',
    'STO (Safe Torque Off) is a safety function per IEC 61800-5-2: removes power to motor without removing supply to the drive; faster and more reliable than contactor-based stopping for safety circuits',
  ],
  intuition: {
    prose: [
      'A PLC is a ruggedised industrial computer running a scan-based execution model. Unlike a conventional program that runs once, PLC ladder logic runs in an infinite loop: read all physical inputs into an image table, execute the logic against that image, write the result image back to physical outputs, then start again. This deterministic scan model means every output is updated at the scan rate — typically 10ms. Fast processes like encoder counting use interrupt-driven high-speed counters that bypass the main scan entirely.',
      'The 4-20mA current loop was designed for industrial environments where cable runs stretch hundreds of meters through electrically noisy conduit. Encoding the signal as a current rather than a voltage means that conductor resistance — which varies with temperature and cable length — does not affect the reading. The receiver measures current, not voltage. The loop can be powered from the transmitter ("2-wire loop-powered") drawing 4-20mA from the 24VDC loop supply, eliminating the need for a separate power feed to the sensor.',
      'SCADA (Supervisory Control And Data Acquisition) sits above the PLCs in the automation hierarchy. It collects data from all PLCs via OPC-UA or proprietary drivers, stores it in a process historian, provides operator displays with real-time and trend data, and manages alarm annunciation. The historian is the plant\'s black box: when a batch fails or an incident occurs, the historian replay reconstructs the sequence of events across all measured variables simultaneously. Modern systems log to SQL databases, enabling process engineers to run correlations between hundreds of variables to identify quality drivers.',
    ],
    callouts: [
      { type: 'insight', body: 'Modbus register addressing has two conventions: some documentation uses zero-based addressing (register 0–65535) and some uses one-based (register 1–65536). A "register 40001" in a datasheet refers to Modbus holding register 0 in the protocol frame. Mixing up the offset is the most common Modbus commissioning error.' },
      { type: 'warning', body: 'Never rely on a VFD\'s coast-to-stop or DC injection braking as a safety stop. IEC 62061 and ISO 13849 require hardware-rated STO or equivalent safety functions for personnel protection. A software stop can be defeated by a program fault; STO removes power at the gate driver level regardless of software state.' },
    ],
    visualizations: [{ type: 'OhmViz', props: {} }],
  },
  math: {
    prose: [
      '4-20mA scaling: engineering value = EU_min + (I_mA - 4) / 16 × (EU_max - EU_min); for a 0-10 bar transmitter at 12mA: P = 0 + (12-4)/16 × 10 = 5.0 bar',
      'PLC scan time: total_scan = input_scan + program_execution + output_scan + comms_overhead; a 1000-rung program typically executes in 1–5ms on a modern PLC',
      'Modbus network latency: t_response = t_turnaround + (N_devices × t_poll_cycle); at 19200 baud, polling 10 devices for one register each takes ~100ms round-trip',
      'Loop power calculation: V_supply = V_receiver + V_cable + V_transmitter; 24V supply, 250Ω receiver, 100m × 2 × 0.02Ω/m cable: at 20mA, V_cable = 0.08V, V_receiver = 5V, leaving 18.92V for transmitter — verify against transmitter minimum operating voltage',
    ],
    callouts: [
      { type: 'formula', body: '4-20mA full-scale resolution: for a 12-bit ADC reading 4-20mA via a 250Ω resistor (1-5V), resolution = 4096 counts / span = 4096/4000mV ≈ 0.024% full scale — more than adequate for most process control applications.' },
    ],
  },
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'A 4-20 mA current loop reads exactly 0 mA. What does this indicate, and why does this design allow you to distinguish it from a legitimate zero-scale signal?',
      options: [
        'It indicates a 0% process reading — the transmitter outputs 0 mA when the measured variable is at its minimum',
        'It indicates a broken wire or unpowered transmitter — 4 mA is the live-zero representing 0% of the process range; 0 mA is below the live zero and can only occur if the loop is open. This "live zero" design means every valid signal is between 4 mA and 20 mA, and 0 mA is unambiguously a wiring fault',
        'It indicates the transmitter is in fault mode and is signalling a diagnostic error by pulling the loop to zero',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A PLC controls a high-speed conveyor. The scan cycle is 20 ms. An optical sensor detects objects passing at one per 5 ms. What will the PLC miss?',
      options: [
        'Nothing — the PLC\'s input filter averages multiple readings and will detect the objects statistically',
        'Most objects — the PLC only reads inputs once per 20 ms scan; an object present for only 5 ms may be missed entirely if it arrives and departs between scans. Time-critical events like this require a high-speed counter input that operates as a hardware interrupt, bypassing the main scan',
        'Every other object — the PLC scan samples at 20 ms and the object period is 5 ms, so aliasing causes it to detect only objects at 20 ms intervals',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A Modbus RTU network polls 5 sensors and has a 50 ms total cycle time. An engineer adds 15 more sensors to the same RS-485 bus. What happens to the response time?',
      options: [
        'Response time stays the same — Modbus RTU polls all slaves simultaneously in broadcast mode',
        'Response time increases roughly proportionally — Modbus is a master-slave protocol where the master polls each slave sequentially; with 20 slaves instead of 5, the polling cycle takes approximately 4× longer, making the network less suitable for fast control loops',
        'Response time decreases — more slaves share the bus overhead so each individual transaction is faster',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A safety engineer wants to stop a motor when a guard door opens. Why is Safe Torque Off (STO) required by safety standards rather than simply sending a "stop" command from the PLC?',
      options: [
        'STO is faster than a software command — a PLC stop command takes one scan cycle (10–20 ms) while STO acts in under 1 ms',
        'A software stop can be defeated by a PLC program fault, communication failure, or software bug; STO removes the gate-drive signals at the hardware level inside the drive, removing torque regardless of software state — safety standards require hardware-rated functions for personnel protection because software alone cannot provide the required safety integrity level',
        'STO saves energy by removing the DC bus voltage, whereas a software stop leaves the drive energised and consuming standby power',
      ],
      correct: 1,
    },
  ],
};

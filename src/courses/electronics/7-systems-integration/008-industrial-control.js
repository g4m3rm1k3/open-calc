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
};

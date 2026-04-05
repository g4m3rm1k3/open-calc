export default {
  id: 'cnc-what-is-cnc',
  slug: 'what-is-cnc',
  chapter: 'cnc-1',
  order: 0,
  title: 'What Is CNC?',
  subtitle: 'From Blueprint to Chips — The Full Chain',
  tags: ['CNC', 'G-code', 'machine types', 'controller', 'servo', 'CAD', 'CAM', 'post-processor'],

  semantics: {
    core: [
      { symbol: 'CNC', meaning: 'Computer Numerical Control: A machine that executes machining moves from a program of numbered coordinate commands.' },
      { symbol: 'G-Code', meaning: 'The industry-standard programming language for CNC machines. Each line is a "block" of commands that the controller reads and executes.' },
      { symbol: 'Controller', meaning: 'The CNC brain — a dedicated computer that reads G-code, does real-time math, and sends precise signals to the servo drives.' },
      { symbol: 'Servo Drive', meaning: 'A closed-loop motor-and-encoder system. The encoder reports actual position back to the controller, allowing it to correct errors in real time.' },
      { symbol: 'CAD', meaning: 'Computer-Aided Design: Software used to create the 3D model (e.g. Fusion 360, SolidWorks, CATIA).' },
      { symbol: 'CAM', meaning: 'Computer-Aided Manufacturing: Software that converts a 3D model into toolpaths, then outputs G-code (e.g. Fusion 360 CAM, Mastercam, HSMWorks).' },
      { symbol: 'Post-Processor', meaning: 'A translator inside CAM software. It converts generic toolpath data into G-code dialects that a specific controller understands (Fanuc, Siemens, Haas, etc.).' },
    ],
    rulesOfThumb: [
      'CAD = What to make. CAM = How to cut it. G-code = The instructions. Controller = The reader.',
      'Every line of G-code a controller reads is called a "block". A block tells the machine what to do next.',
      'CNC machines are not automatic — they do exactly what the program says, nothing more. Garbage in, garbage out.',
    ]
  },

  hook: {
    question: 'How does a design on a computer screen become a physical metal part — without a human hand guiding the tool?',
    realWorldContext:
      'A CNC machine is, at its core, a robot that follows a list of coordinate commands. ' +
      'An engineer draws a part in **CAD** software. A programmer converts that model into toolpaths in **CAM** software. ' +
      'The CAM software outputs a **G-code file** — a plain text file, thousands of lines long, full of coordinates and codes. ' +
      'That file loads into the machine\'s **Controller** (the CNC brain). The controller reads it line by line, ' +
      'computing real-time math and sending electrical signals to **Servo Drives** that spin motors with micron-level precision. ' +
      'The result: a perfect part, cut at 10,000 RPM, tolerances tighter than a human hair.',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(WELCOME TO CNC MACRO SYSTEMS)\n' +
            '(This is a G-code program. Each line is a "block".)\n' +
            '(The controller reads top-to-bottom, one block at a time.)\n' +
            '\n' +
            'G00 X0 Y0        (Rapid: move to work zero)\n' +
            'G01 X3.0 F30.0   (Cut: move right 3 inches at 30 ipm)\n' +
            'Y2.0             (Modal G01: cut up 2 inches)\n' +
            'X0               (Cut left, back to X=0)\n' +
            'Y0               (Cut down, close the square)\n' +
            'M30              (End of program)'
        },
        title: 'Your First G-Code Program',
        caption: 'Press Run and watch the toolpath draw. Each line of text on the left becomes motion on the right. This is the entire idea of CNC — coordinates become movement.',
      }
    ],
    prose: [
      '**The CAD → CAM → G-Code → Controller Chain**: Think of it as a factory assembly line for instructions. CAD creates the geometry. CAM turns that geometry into a sequence of tool moves and outputs a plain text file. The controller reads that file line by line and makes the machine move. Each step converts information into a more specific form.',

      '**Machine Types**: CNC is not just one machine. The same G-code language (with small variations) runs all of these:\n' +
      '- **Vertical Machining Center (VMC)**: The most common mill. Spindle points down. Used for plates, molds, brackets.\n' +
      '- **Horizontal Machining Center (HMC)**: Spindle is horizontal. Better chip clearing; used for production runs.\n' +
      '- **CNC Lathe / Turning Center**: The part spins, the tool moves. Used for round parts — shafts, flanges, fittings.\n' +
      '- **Multi-Axis (4-axis, 5-axis)**: Adds rotary axes (A/B/C) for complex aerospace and medical parts.\n' +
      '- **CNC Router**: Like a VMC but built for wood, foam, and plastics. Lower forces, higher speeds.\n' +
      '- **Plasma, Waterjet, Laser**: 2.5D cutting — the tool moves in X/Y, cuts through in Z. Same G-code structure.',

      '**Metric vs. Imperial Machines**: The world is split. European and Asian machines use the **metric system** (millimeters, mm/min). Most older American shops still run **imperial** (inches, inches per minute). The G-code language handles both — `G21` switches the controller to metric, `G20` switches it to inches. You must match your program units to the machine\'s active mode or crashes happen. We will cover this fully in the Units lesson.',

      '**Fanuc — The Industry Standard**: Over 70% of the world\'s CNC controllers run a Fanuc system (or a Fanuc-compatible clone like Haas). If you learn Fanuc\'s dialect of G-code, you can work on the majority of machines in any shop in the world. This course teaches **Fanuc Macro B**, the most widely used parametric programming extension. Other controllers (Siemens 840D, Okuma OSP) use different syntax but identical logic — we will point out the differences where they matter.',

      '**The Controller Is Not Smart — It Is Precise**: A CNC controller has no judgment. If your program says to plunge a tool into a vise jaw, it will do it without hesitation. Every crash, every scrapped part, every broken tool is the result of a mistake in the G-code — or a setup mistake that the programmer did not account for. Understanding the full chain from human intent to machine action is the goal of this course.',
    ],
  },

  math: {
    prose: [
      'The controller solves basic but time-critical math in real time. For every axis, it tracks position as a signed number:',
      '$$\\text{Position} = x \\in \\mathbb{R}$$',
      'Positive and negative values give direction. On a mill, moving the table toward the operator is typically $+Y$; moving the spindle up is $+Z$. The controller stores these as floating-point numbers, usually with 4 decimal places of precision (0.0001 inch or 0.001 mm).',
      'The entire G-code program is a sequence of target positions. The controller\'s job is to compute smooth motion from the current position to each next position, coordinating all axes simultaneously — all while running at hundreds of interpolation cycles per second.',
    ],
  },

  rigor: {
    prose: [
      '**Closed-Loop vs Open-Loop**: Servo drives are closed-loop. An encoder on each motor shaft measures actual position hundreds of thousands of times per second and reports it back to the controller. If the tool encounters unexpected resistance and the motor falls behind, the controller detects the "following error" and either compensates or triggers an emergency stop. Stepper motors (common in hobbyist machines and 3D printers) are open-loop — they assume the motor always reaches its target, which can cause "step loss" and position errors.',

      '**Controllers Referenced in This Course**: Fanuc 0i (entry-level, most shops), Fanuc 30i/31i/32i (high-end production), Haas (Fanuc-like, very popular in US job shops), Siemens 840D (dominant in Europe/automotive), Okuma OSP (dominant in turning). We focus on Fanuc but note dialect differences throughout.',

      '**The Post-Processor Problem**: CAM software generates a generic toolpath internally. The post-processor translates this into G-code for a specific controller. A Fanuc post-processor and a Siemens post-processor for the same toolpath will produce very different output files. If you use the wrong post-processor, the G-code will not work — or worse, it will work incorrectly in subtle ways.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-chain',
      title: 'Tracing a Command Through the Full Chain',
      problem: 'A designer draws a 3-inch square pocket in CAD. Trace the journey from design to motion.',
      steps: [
        { expression: 'CAD', annotation: 'Designer draws a 3×3 inch square at Z-depth 0.5 inch. Saved as a STEP or IGES file.' },
        { expression: 'CAM', annotation: 'Programmer selects a 0.5-inch end mill. CAM generates a toolpath: four linear moves around the square at Z−0.5.' },
        { expression: 'Post-Processor', annotation: 'CAM outputs Fanuc-compatible G-code: G01 X3.0 F30.0, G01 Y3.0, G01 X0.0, G01 Y0.0.' },
        { expression: 'Controller', annotation: 'Machine operator loads the file. Controller reads each block, interpolates motion at 2000 cycles/sec.' },
        { expression: 'Servo Drive', annotation: 'Motors move X and Y axes simultaneously at exactly the right ratio to stay on the line. Encoder confirms position every 0.001 mm.' },
        { expression: 'Part', annotation: 'A 3×3×0.5 inch pocket is cut into the material.' },
      ],
      conclusion: 'Every physical feature on a CNC part is the downstream result of a decision made somewhere in this chain. Most errors — crashes, wrong dimensions, bad surface finish — can be traced to one broken link.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-intro-1',
        type: 'choice',
        text: 'What is the role of the Post-Processor in the CAD→CAM→CNC chain?',
        options: [
          'It draws the 3D model',
          'It translates generic toolpaths into G-code for a specific controller',
          'It controls the servo motors directly',
          'It measures the finished part',
        ],
        answer: 'It translates generic toolpaths into G-code for a specific controller',
      },
      {
        id: 'cnc-intro-2',
        type: 'choice',
        text: 'What makes a servo drive "closed-loop"?',
        options: [
          'It uses a program loop (WHILE)',
          'An encoder reports actual motor position back to the controller for real-time correction',
          'The toolpath loops back to the start',
          'The operator checks the position manually after each move',
        ],
        answer: 'An encoder reports actual motor position back to the controller for real-time correction',
      },
      {
        id: 'cnc-intro-3',
        type: 'input',
        text: 'What does "CNC" stand for? ',
        answer: 'Computer Numerical Control',
      },
      {
        id: 'cnc-intro-4',
        type: 'choice',
        text: 'Which controller brand runs the majority of CNC machines worldwide?',
        options: ['Siemens', 'Okuma', 'Fanuc', 'Haas'],
        answer: 'Fanuc',
      },
    ]
  },

  mentalModel: [
    'CAD = What. CAM = How. G-code = Instructions. Controller = Reader.',
    'Every crash is a broken link in the chain.',
    'Servo = closed-loop = self-correcting.',
    'Fanuc dialect = the universal language of machining.',
    'G21 = metric mode. G20 = inch mode. Always match the machine.',
  ],
}

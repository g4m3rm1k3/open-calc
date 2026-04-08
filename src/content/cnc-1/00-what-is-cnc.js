export default {
  id: 'cnc-what-is-cnc',
  slug: 'what-is-cnc',
  chapter: 'cnc-1',
  order: 0,
  title: 'What Is CNC?',
  subtitle: 'From Blueprint to Chips — The Full Chain',
  tags: [
    'CNC', 'G-code', 'machine types', 'controller', 'servo',
    'CAD', 'CAM', 'post-processor', 'history', 'Fanuc', 'Siemens',
    'closed-loop', 'open-loop', 'interpolation', 'EIA RS-274',
  ],

  semantics: {
    core: [
      {
        symbol: 'CNC',
        meaning:
          'Computer Numerical Control: A machine that executes machining moves from a program ' +
          'of numbered coordinate commands. The "numerical" refers to the fact that all motion ' +
          'is expressed as numbers — coordinates, feed rates, spindle speeds — rather than as ' +
          'physical templates or hand guidance.',
      },
      {
        symbol: 'G-Code',
        meaning:
          'The industry-standard programming language for CNC machines, standardized as EIA RS-274 ' +
          'in 1959. Each line is a "block." The G stands for "preparatory function" — it prepares ' +
          'the controller for a specific type of motion or mode. The language has changed remarkably ' +
          'little in 65 years; a program written in 1975 for a Fanuc controller will largely still ' +
          'run on a Fanuc controller today.',
      },
      {
        symbol: 'Controller',
        meaning:
          'The CNC brain — a dedicated real-time computer that reads G-code blocks sequentially, ' +
          'computes interpolated motion paths at 1,000–4,000 cycles per second, and sends precise ' +
          'electrical signals to servo drives. Unlike a general-purpose computer, a CNC controller ' +
          'is hard-real-time: a missed interpolation cycle causes a physical positioning error.',
      },
      {
        symbol: 'Servo Drive',
        meaning:
          'A closed-loop motor-and-encoder system. The drive amplifies controller signals into ' +
          'motor current. The encoder on the motor shaft (or directly on the ballscrew) measures ' +
          'actual position and reports it back to the controller, typically 100,000+ times per second. ' +
          'The controller compares commanded vs. actual position and corrects the difference ' +
          '(following error) in real time. If following error exceeds a threshold, an alarm stops ' +
          'the machine — this is a safety feature, not a failure.',
      },
      {
        symbol: 'CAD',
        meaning:
          'Computer-Aided Design: Software used to create the 3D model of the part. Common tools: ' +
          'Fusion 360, SolidWorks, CATIA, Creo, NX. The output is a geometry file (.STEP, .IGES, ' +
          '.F3D, .SLDPRT). CAD defines WHAT to make — it contains no machining information whatsoever. ' +
          'Tolerances live in the drawing, not the CAD model itself.',
      },
      {
        symbol: 'CAM',
        meaning:
          'Computer-Aided Manufacturing: Software that imports a CAD model and converts it into ' +
          'toolpaths — sequences of tool moves at specific feeds, speeds, and depths. The CAM ' +
          'output is a generic internal toolpath that is then translated by the post-processor ' +
          'into controller-specific G-code. Common tools: Fusion 360 CAM, Mastercam, HSMWorks, ' +
          'hyperMILL, GibbsCAM.',
      },
      {
        symbol: 'Post-Processor',
        meaning:
          'A translator script inside (or alongside) CAM software. It converts the CAM software\'s ' +
          'generic internal toolpath format into the specific G-code dialect a particular controller ' +
          'understands. A Fanuc post and a Siemens 840D post for the same toolpath produce very ' +
          'different output files. Using the wrong post produces G-code that either alarms out ' +
          'immediately or — worse — runs silently with wrong behavior.',
      },
      {
        symbol: 'Interpolation',
        meaning:
          'The real-time mathematical process by which the controller computes smooth motion ' +
          'between programmed points. Linear interpolation (G01) divides a straight-line move ' +
          'into thousands of tiny steps, coordinating all axes simultaneously. Circular interpolation ' +
          '(G02/G03) does the same for arcs. The controller runs this math hundreds to thousands ' +
          'of times per second — this is why a CNC controller is a specialized real-time computer, ' +
          'not a general-purpose PC.',
      },
      {
        symbol: 'Following Error',
        meaning:
          'The difference between commanded position and actual measured position on a servo axis, ' +
          'at any given instant during motion. A small following error is normal and expected — the ' +
          'servo system is always catching up. A following error that exceeds the controller\'s ' +
          'configured threshold (typically 0.5–5mm depending on machine and setup) triggers ' +
          'Alarm 411 (Fanuc) or equivalent and stops all motion. This is the controller detecting ' +
          'that the machine cannot keep up — a sign of overload, mechanical binding, or a tuning problem.',
      },
    ],
    rulesOfThumb: [
      'CAD = What to make. CAM = How to cut it. G-code = The instructions. Controller = The reader. Machine = The hands.',
      'Every line of G-code a controller reads is called a "block." A block tells the machine what to do next.',
      'CNC machines are not automatic — they do exactly what the program says, nothing more. Garbage in, garbage out.',
      'G20 = inches. G21 = millimeters. Always confirm which mode the machine is in before running. A crash from wrong units happens at full rapid speed.',
      'The controller has no judgment. If your program says to plunge into the vise, it will do it without hesitation at full feedrate.',
      'Following error is your friend — a servo alarm means the machine stopped itself before damage could compound.',
      'Learn Fanuc Macro B first. If you can read Fanuc, you can read any dialect with a 15-minute reference lookup.',
    ],
  },

  hook: {
    question:
      'How does a design on a computer screen become a physical metal part — without a human hand guiding the tool?',
    realWorldContext:
      'A CNC machine is, at its core, a robot that follows a list of coordinate commands. ' +
      'An engineer draws a part in **CAD** software. A programmer converts that model into toolpaths ' +
      'in **CAM** software. The CAM software runs those toolpaths through a **post-processor** — a ' +
      'translator that speaks the specific dialect of the target machine — and outputs a **G-code file**: ' +
      'a plain text file, sometimes thousands of lines long, full of coordinates and codes. ' +
      'That file loads into the machine\'s **Controller** — a dedicated real-time computer that reads ' +
      'it block by block, computing smooth motion paths and sending electrical signals to **Servo Drives** ' +
      'that move axes with micron-level precision. Every move is verified by an encoder that reports ' +
      'actual position back to the controller hundreds of thousands of times per second. ' +
      'The result: a perfect part, cut at 10,000 RPM, tolerances tighter than a human hair — ' +
      'produced identically on the first part and the ten-thousandth.',
    historicalContext:
      'This chain didn\'t appear overnight. It took from 1944 (John Parsons punching helicopter ' +
      'rotor coordinates onto IBM cards at a Michigan shop) to 1959 (EIA RS-274, the first G-code ' +
      'standard) to build the foundation. Fanuc\'s founding in 1970 made it affordable. ' +
      'PC-based CAM in the 1990s made it accessible to any shop. The G-code running a 2025 machining ' +
      'center is recognizably the same language as the RS-274 standard — the same G01, the same M30, ' +
      'the same coordinate block format. Understanding why the language looks the way it does ' +
      'requires knowing where it came from.',
  },

  history: {
    prose: [
      '**1944–1947 — The Parsons Problem**: John T. Parsons, a Michigan machinist making helicopter ' +
      'rotor blades for the US Army Air Force, faced a manufacturing problem: compound-curve blade ' +
      'surfaces required dozens of manual setups and were still dimensionally inconsistent. His solution ' +
      'was to compute XY coordinates for points along the blade profile on an IBM 602A punch-card ' +
      'calculator, then feed those cards to a Swiss Jig Borer to position each cut. He called it ' +
      '"close tolerance milling." The Air Force was interested. This is the moment NC was conceived — ' +
      'not in a university lab, but on a production floor trying to solve a real tolerance problem.',

      '**1952 — MIT Builds the First NC Machine**: Under Air Force contract, MIT\'s Servomechanisms Lab ' +
      'retrofitted a Cincinnati Hydrotel milling machine with a vacuum-tube controller that read ' +
      'punched paper tape. The demonstration: a complex aircraft wing rib that would have taken days ' +
      'by hand, cut automatically from tape. The machine filled a room. The controller alone cost ' +
      'what a house costs today. The Air Force classified the results and immediately funded production.',

      '**1956–1958 — APT: The First Programming Language for Machines**: MIT developed APT ' +
      '(Automatically Programmed Tool), letting engineers write English-like geometry commands ' +
      '("GOTO/PT1", "INDIRV/V1") instead of raw coordinates. APT established the conceptual ' +
      'architecture that G-code inherits: a formal language with syntax rules, not just a list ' +
      'of numbers. The Air Force distributed APT to defense contractors.',

      '**1959 — EIA RS-274: G-Code Is Born**: The Electronic Industries Alliance published RS-274, ' +
      'standardizing G-codes, M-codes, and the coordinate block format. This single document defines ' +
      'the language still running 90% of production CNC machines today. The G in G-code stands for ' +
      '"preparatory function." The M stands for "miscellaneous." These somewhat arbitrary names ' +
      'have persisted for 65 years.',

      '**1970 — Fanuc Founded**: Seiuemon Inaba spun Fanuc out of Fujitsu with a specific mission: ' +
      'make NC control affordable through modular, mass-produced electronics. Within a decade, ' +
      'Fanuc held 50%+ of the world CNC market. Today that figure is broadly similar. ' +
      'This is why learning "Fanuc dialect" means learning the language of the majority of machines ' +
      'on any shop floor anywhere in the world.',

      '**1976–1980 — Microprocessors Change Everything**: The Intel 8080 and Zilog Z80 reduced ' +
      'controller cost from the price of a house to the price of a car. Before this, the controller ' +
      'was a separate minicomputer, sometimes in a different room. After this, the controller was ' +
      'embedded in the machine. Closed-loop servo control became standard — with real computing ' +
      'power available, following-error correction could run fast enough to matter.',

      '**1982 — Haas Automation**: Gene Haas started in a garage in Oxnard, California. By 1988, ' +
      'the first Haas VMC shipped at half the price of comparable Japanese machines. Haas\'s ' +
      'Fanuc-compatible controller with proprietary extensions became the most common machine ' +
      'a new US machinist encounters. The Haas UMC-750 5-axis is now one of the most-sold ' +
      'machining centers in North American history.',

      '**1984–1995 — CAD/CAM Arrives on PCs**: Mastercam (1984) was the first PC-based CAM package. ' +
      'SolidWorks (1995) brought parametric CAD to affordable workstations. These two products broke ' +
      'the programming bottleneck — previously, generating G-code required expensive mainframe APT ' +
      'systems or hand calculation. Now any shop could program complex parts. They also created ' +
      'the modern "disconnect": programmers who never touched a machine, and machinists who ' +
      'couldn\'t read the code they were running.',

      '**2012–Present — The Democratization Era**: Autodesk\'s Fusion 360 made professional CAD/CAM ' +
      'free for hobbyists and small shops. Desktop CNC routers (Shapeoko, X-Carve) brought CNC ' +
      'to makerspaces for under $1,000. The population of people who can write and modify G-code ' +
      'has grown by orders of magnitude. This course exists in that context: CNC knowledge that ' +
      'once required a union card and years of apprenticeship is now accessible to anyone willing ' +
      'to learn the fundamentals properly.',
    ],
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCHistoryTimeline',
        props: {},
        title: 'The History of CNC',
        caption:
          'From Parsons\' punch cards in 1944 to Fusion 360 in 2012. Click any event to expand. ' +
          'Understanding where G-code came from explains why it looks the way it does.',
      },
      {
        id: 'CNCChainDiagram',
        props: {},
        title: 'The CAD → CAM → G-Code → Controller Chain',
        caption:
          'Click any stage to understand what it does and where errors enter. ' +
          'Every crash, wrong dimension, and scrapped part can be traced to one broken link in this chain.',
      },
      {
        id: 'CNCMachineTypes',
        props: {},
        title: 'CNC Machine Types',
        caption:
          'Click any machine type for specs, applications, and G-code notes. ' +
          'The same language — with small variations — runs all of them.',
      },
      {
        id: 'CNCClosedLoopSim',
        props: {},
        title: 'Closed-Loop vs Open-Loop: The Servo Simulator',
        caption:
          'Run each system with and without cutting load. Watch what happens when a stepper motor ' +
          'loses steps — and why the controller doesn\'t know. This is the most important mechanical ' +
          'concept in CNC.',
      },
      {
        id: 'CNCDialectTable',
        props: {},
        title: 'Controller Dialect Comparison',
        caption:
          'Fanuc, Siemens 840D, Haas, and Okuma OSP side by side. The logic is identical — ' +
          'only the punctuation and keywords change.',
      },
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(WELCOME TO CNC MACRO SYSTEMS)\n' +
            '(This is a G-code program. Each line is a "block".)\n' +
            '(The controller reads top-to-bottom, one block at a time.)\n' +
            '(Parentheses are comments — the controller ignores them.)\n' +
            '\n' +
            'G20             (Inch mode)\n' +
            'G90             (Absolute positioning)\n' +
            'G00 X0 Y0       (Rapid: move to work zero)\n' +
            'G01 X3.0 F30.0  (Cut: move right 3 inches at 30 ipm)\n' +
            'Y2.0            (Modal G01 still active: cut up 2 inches)\n' +
            'X0              (Cut left, back to X=0)\n' +
            'Y0              (Cut down, close the square)\n' +
            'M30             (End of program — rewind and reset)',
        },
        title: 'Your First G-Code Program',
        caption:
          'Press Run and watch the toolpath draw. Each line of text on the left becomes motion on the right. ' +
          'Notice that G01 on line 8 stays active through lines 9–11 — you don\'t have to repeat it. ' +
          'This is called a "modal" code. This is the entire idea of CNC: coordinates become movement.',
      },
    ],

    prose: [
      '**The CAD → CAM → G-Code → Controller Chain**: Think of it as a factory assembly line for ' +
      'instructions. CAD creates the geometry. CAM turns that geometry into a sequence of tool moves ' +
      'and outputs a plain text file via the post-processor. The controller reads that file line by line ' +
      'and makes the machine move. Each step converts information into a more specific form — and each ' +
      'step is where a different kind of error can enter. A geometry error in CAD becomes a toolpath ' +
      'error in CAM becomes a dimensional error in the part. The chain is only as strong as its weakest link.',

      '**Machine Types — Same Language, Different Geometry**: CNC is not one machine. The same G-code ' +
      'language (with small variations) runs all of these:\n' +
      '- **Vertical Machining Center (VMC)**: The workhorse. Spindle points down at the table. ' +
      'Used for plates, molds, brackets, housings — anything prismatic (flat faces, holes, pockets).\n' +
      '- **Horizontal Machining Center (HMC)**: Spindle horizontal. Chips fall away by gravity — ' +
      'far better for production runs. Usually includes two pallets: one machining while one loads.\n' +
      '- **CNC Lathe / Turning Center**: The part spins, the tool moves. Two axes (X diameter, Z length). ' +
      'For round parts: shafts, flanges, threads, bores. Has its own lathe-specific G-codes (G96, G71, G76).\n' +
      '- **Multi-Axis (4-axis, 5-axis)**: Adds rotary axes (A rotates around X, B around Y, C around Z). ' +
      '5-axis is required for turbine blades, impellers, bone implants — any part with compound curves ' +
      'that a 3-axis machine cannot access without re-fixturing.\n' +
      '- **CNC Router**: Like a VMC but lighter, faster spindle (18,000–60,000 RPM), built for wood, ' +
      'foam, plastics, thin aluminum sheet. Often uses open-loop steppers. Lower accuracy than a VMC.\n' +
      '- **Wire EDM**: No spindle — cuts with electrical sparks through a thin wire. Cuts any conductive ' +
      'material regardless of hardness. Used for hardened dies and punches. Tolerances to ±0.001mm.\n' +
      '- **Plasma, Waterjet, Laser**: 2.5D cutting — X/Y motion, through-cut in Z. Fast sheet processing. ' +
      'Same G-code structure but M-codes control the beam/arc/jet on and off.',

      '**Metric vs. Imperial — A Split World**: European and Asian machines run metric (millimeters, mm/min). ' +
      'Most older American shops still run imperial (inches, inches per minute). The G-code language ' +
      'handles both: **G21** switches to metric, **G20** switches to inches. The critical rule: ' +
      'your program units must match the machine\'s active mode — or every coordinate is wrong by ' +
      'a factor of 25.4. Crashes from unit mismatch happen at full rapid speed (30–50 m/min on a VMC). ' +
      'Always include G20 or G21 explicitly at the top of every program. Never rely on the machine ' +
      'being in the mode you expect. We cover this fully in the Units lesson.',

      '**Fanuc — The Industry Standard**: Over 50–60% of the world\'s CNC controllers run a Fanuc ' +
      'system or a Fanuc-compatible clone (Haas is the largest). If you learn Fanuc\'s dialect, ' +
      'you can operate the majority of machines in any shop in any country. This course teaches ' +
      '**Fanuc Macro B** — the parametric programming extension that adds variables, math, ' +
      'conditionals, and loops to basic G-code. It is the layer that separates a programmer who ' +
      'can run existing programs from one who can create programs that adapt, measure, and decide. ' +
      'Other controllers (Siemens 840D, Okuma OSP) use different syntax for the same concepts — ' +
      'we note differences throughout.',

      '**The Controller Is Not Smart — It Is Precise**: A CNC controller has no judgment, no ' +
      'situational awareness, no sense of "that doesn\'t seem right." If your program commands ' +
      'a rapid move into the vise jaw, the machine will execute it at 30–50 meters per minute ' +
      'without hesitation. A spindle crash at speed can destroy a $20,000–$80,000 spindle and ' +
      'the workpiece simultaneously. Every crash, every scrapped part, every broken tool is the ' +
      'result of a mistake somewhere in the CAD→CAM→G-code→Controller chain — or a setup mistake ' +
      '(wrong offset, wrong tool length) that the programmer didn\'t account for. Understanding ' +
      'the full chain, and where it can break, is the foundational skill this course builds.',
    ],
  },

  math: {
    prose: [
      'The controller solves basic but time-critical mathematics in real time. For every axis, ' +
      'position is tracked as a signed real number:',

      '$\\text{Position} = x \\in \\mathbb{R}$',

      'Positive and negative values encode direction. On a vertical mill: moving the table toward ' +
      'the operator is $+Y$; moving the spindle up (away from the part) is $+Z$; moving the table ' +
      'to the right is $+X$. The controller stores positions as fixed-point numbers, typically with ' +
      '4 decimal places of precision: 0.0001 inch or 0.001 mm (1 micron). This resolution is finer ' +
      'than the machine\'s mechanical accuracy — but having the resolution at the control level ' +
      'prevents rounding errors from accumulating over long programs.',

      'The entire G-code program is a sequence of target positions. For a linear move (G01) from ' +
      'point $P_0$ to point $P_1$, the controller must compute intermediate positions at each ' +
      'interpolation cycle $\\Delta t$ (typically 0.5–1ms):',

      '$P(t) = P_0 + \\frac{t}{T}(P_1 - P_0)$',

      'where $T$ is the total move time, determined by the distance and programmed feedrate $F$:',

      '$T = \\frac{|P_1 - P_0|}{F}$',

      'For each axis, the controller computes the required velocity, converts it to a motor command, ' +
      'and compares the resulting encoder position against the commanded position. This loop runs ' +
      '1,000–4,000 times per second. The "brains" of a CNC controller are not doing complex reasoning — ' +
      'they are doing simple arithmetic, extremely fast and extremely reliably.',

      'For circular interpolation (G02/G03), the controller must maintain constant surface speed ' +
      'around an arc defined by center point $(I, J)$ and radius $R$:',

      '$x(\\theta) = x_c + R\\cos\\theta, \\quad y(\\theta) = y_c + R\\sin\\theta$',

      'The controller steps $\\theta$ in increments small enough to keep the chord error — the ' +
      'deviation between the true arc and the straight-line approximation — below the programmed ' +
      'tolerance. On a typical VMC, this is held to ±0.001mm automatically.',
    ],
  },

  rigor: {
    prose: [
      '**Closed-Loop vs Open-Loop — Why It Matters**: Servo drives are closed-loop. An encoder on ' +
      'each motor shaft (or directly on the ballscrew in high-end machines) measures actual position ' +
      'continuously and reports it to the controller. If the cutting load causes the motor to lag ' +
      'behind, the controller detects the growing following error and either increases motor current ' +
      'to compensate, or — if the error exceeds threshold — triggers an emergency stop (Alarm 411 ' +
      'on Fanuc). This is the servo system working as designed. Stepper motors, common in hobbyist ' +
      'machines and 3D printers, are open-loop: the controller sends pulses and assumes each pulse ' +
      'produced a step. Under cutting load, a stepper can lose steps silently. The controller ' +
      'continues from the wrong assumed position. Dimensional errors accumulate with no alarm. ' +
      'This is why industrial CNC machines exclusively use servo drives.',

      '**The Encoder and the Ballscrew**: Most VMCs use a rotary encoder on the servo motor shaft. ' +
      'Higher-end machines (Makino, DMG Mori high-accuracy lines) use a linear scale directly on ' +
      'the axis — this eliminates any positioning error from ballscrew pitch variation or backlash ' +
      'from the feedback loop entirely, since the scale measures table position directly, not motor ' +
      'rotation. This distinction matters for tolerances under ±0.005mm.',

      '**Controllers Referenced in This Course**: Fanuc 0i (entry-level, the most common in job ' +
      'shops worldwide), Fanuc 30i/31i/32i (high-performance, common in aerospace and automotive ' +
      'tier suppliers), Haas (Fanuc-compatible, dominant in US job shops — the most likely first ' +
      'machine a US machinist touches), Siemens 840D sl (dominant in European automotive, ' +
      'particularly German Tier 1 suppliers), Okuma OSP (dominant in turning, proprietary but ' +
      'widely respected). We focus on Fanuc Macro B but annotate dialect differences throughout.',

      '**The Post-Processor Problem — Subtle Failures Are Worse Than Loud Ones**: CAM software ' +
      'generates a generic internal toolpath. The post-processor translates this into G-code for ' +
      'a specific controller. A Fanuc post and a Siemens post for the same toolpath produce files ' +
      'that look completely different. Using the wrong post typically produces one of three outcomes: ' +
      '(1) immediate alarm on load — best case, easy to diagnose; (2) alarm partway through the ' +
      'program — medium case, machine stops safely; (3) the program runs silently with subtly wrong ' +
      'behavior — worst case, because you may not notice until inspection. Example: a Siemens post ' +
      'on a Fanuc machine may produce semicolons (Siemens comments) that the Fanuc controller ' +
      'interprets as block separators, reinterpreting the following line as a new block number ' +
      'in a completely wrong context.',

      '**Axis Naming Conventions**: The EIA RS-274 standard defines: X (left-right), Y (front-back), ' +
      'Z (up-down, spindle axis). On a vertical mill, +Z is up (away from the part). On a lathe, ' +
      '+X is away from the spindle centerline (increasing diameter), +Z is away from the chuck ' +
      '(toward the tailstock). Rotary axes: A rotates around X, B rotates around Y, C rotates ' +
      'around Z. On a 5-axis trunnion machine, you typically have A (tilt) and C (rotation) axes. ' +
      'On a 5-axis swivel-head machine, you typically have A and B. This affects how the machine ' +
      'responds to G-code and how you think about fixturing.',

      '**Units and the 25.4 Factor**: 1 inch = 25.4mm exactly, by international agreement since 1959. ' +
      'When you switch a program from G20 to G21 without rescaling coordinates, every number becomes ' +
      '25.4× wrong. A 3.0000-inch move becomes a 3.0000mm move — a difference of 73.2mm that the ' +
      'machine executes without hesitation. The controller does not know your intent; it only knows ' +
      'the numbers. Always state units explicitly. Never rely on default state.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-chain',
      title: 'Tracing a Command Through the Full Chain',
      problem:
        'A designer draws a 3-inch square pocket, 0.5 inches deep, in Fusion 360. ' +
        'Trace the exact journey of that geometry from screen to part.',
      steps: [
        {
          expression: 'CAD',
          annotation:
            'Designer models a 3×3 inch square extrude, then shells it to create a pocket 0.5" deep. ' +
            'Exports as .STEP file. The file contains only geometry — no toolpaths, no feeds, no tool selection.',
        },
        {
          expression: 'CAM',
          annotation:
            'Programmer imports the STEP into Fusion 360 CAM. Selects T1: ½" 4-flute carbide end mill. ' +
            'Creates a 2D Pocket toolpath. Sets: Cutting Feedrate 30 ipm, Plunge 15 ipm, Spindle 3500 RPM, ' +
            'Stepdown 0.25" (two passes to full depth). CAM computes the internal toolpath — a series of ' +
            'offset contours with entry and exit moves.',
        },
        {
          expression: 'Post-Processor',
          annotation:
            'Programmer selects the "Fanuc" post-processor. CAM translates the internal toolpath into ' +
            'G-code blocks: G90 G20 G17, T1 M06, S3500 M03, G00 X0.25 Y0.25, G43 H1, G01 Z-0.25 F15, ' +
            'G01 X2.75 F30, … M30. If the wrong post (e.g., Siemens) were selected, the output would ' +
            'look completely different and would alarm on a Fanuc machine.',
        },
        {
          expression: 'Controller',
          annotation:
            'Operator loads the .nc file via USB. Controller parses the file, checks for syntax errors. ' +
            'Operator sets G54 work offset by touching off the part corner. Operator confirms tool length ' +
            'offset H1 is set. Presses CYCLE START. Controller reads each block, interpolates motion at ' +
            '2,000 cycles/sec, sends velocity commands to servo drives.',
        },
        {
          expression: 'Servo Drive',
          annotation:
            'X and Y servo drives receive simultaneous velocity commands for each interpolation step. ' +
            'Encoders on each axis report actual position 100,000 times per second. Controller computes ' +
            'following error on each axis and corrects continuously. At F30 ipm, each interpolation ' +
            'step is approximately 0.00025" of travel. The tool follows the programmed path to ±0.0002".',
        },
        {
          expression: 'Part',
          annotation:
            'A 3×3×0.5-inch pocket is cut into the aluminum. First pass at Z-0.25, second at Z-0.5. ' +
            'The machine does not know it is making a pocket — it knows only target XY coordinates ' +
            'and Z depth. The pocket\'s correctness is entirely a function of the accuracy of each ' +
            'upstream step in the chain.',
        },
      ],
      conclusion:
        'Every physical feature on a CNC part is the downstream result of a decision made somewhere ' +
        'in this chain. Most errors — crashes, wrong dimensions, bad surface finish, wrong depth — ' +
        'can be traced to exactly one broken link. The skilled CNC programmer understands every link ' +
        'well enough to diagnose problems from their symptoms.',
    },
    {
      id: 'ex-units-crash',
      title: 'The Units Mismatch Crash',
      problem:
        'A programmer writes a program in inches (G20) but forgets to include the G20 line. ' +
        'The machine was previously run in metric mode (G21). What happens?',
      steps: [
        {
          expression: 'Machine state',
          annotation:
            'Controller is in G21 (metric) mode from the previous job. ' +
            'No one reset it. This is normal — controllers retain modal state between programs.',
        },
        {
          expression: 'Program loads',
          annotation:
            'The program begins with G00 X0 Y0 (move to work zero) — this is fine in either mode. ' +
            'Then G01 X3.0 F30.0 — the programmer intended 3.0 inches at 30 ipm.',
        },
        {
          expression: 'Controller interprets',
          annotation:
            'Controller is in G21. It reads X3.0 as 3.0mm. It reads F30.0 as 30 mm/min. ' +
            'The machine moves 3mm instead of 76.2mm. The feedrate is 30 mm/min instead of 762 mm/min.',
        },
        {
          expression: 'The pocket',
          annotation:
            'The resulting pocket is 3mm × 3mm × 0.5mm instead of 76.2mm × 76.2mm × 12.7mm. ' +
            'The part is scrapped. In the more dangerous variant: if the work offset is set for metric ' +
            'but the program commands inch coordinates, the tool may rapid into the fixture or table.',
        },
      ],
      conclusion:
        'Always include G20 or G21 at the top of every program. Never rely on the machine being in ' +
        'a known unit state. This single line prevents one of the most common classes of scrap and crash.',
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
        explanation:
          'The post-processor is a translator script. CAM software generates an internal generic toolpath. ' +
          'The post converts that into the specific G-code dialect of the target controller — Fanuc, Siemens, ' +
          'Haas, etc. Using the wrong post produces G-code that will either alarm immediately or, worse, ' +
          'run with subtly wrong behavior.',
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
        answer:
          'An encoder reports actual motor position back to the controller for real-time correction',
        explanation:
          'The encoder (rotary on the motor shaft, or linear on the axis) measures actual position ' +
          'and sends it back to the controller. The controller computes following error (commanded minus actual) ' +
          'and corrects it every interpolation cycle. If following error exceeds threshold, the machine alarms ' +
          'and stops — the safe outcome when the servo cannot keep up with the commanded motion.',
      },
      {
        id: 'cnc-intro-3',
        type: 'input',
        text: 'What does "CNC" stand for?',
        answer: 'Computer Numerical Control',
        explanation:
          '"Numerical" because all motion is expressed as numbers — coordinates, feedrates, spindle speeds. ' +
          'The first NC machines in the 1950s did not have an onboard computer; they used punched paper tape ' +
          'read by a logic circuit. The "C" for Computer was added when microprocessors were embedded in ' +
          'controllers in the mid-1970s.',
      },
      {
        id: 'cnc-intro-4',
        type: 'choice',
        text: 'Which controller brand runs the majority of CNC machines worldwide?',
        options: ['Siemens', 'Okuma', 'Fanuc', 'Haas'],
        answer: 'Fanuc',
        explanation:
          'Fanuc (founded 1970, spun out of Fujitsu) holds roughly 50–60% of the world CNC controller market. ' +
          'Haas uses a Fanuc-compatible dialect. Siemens 840D dominates European automotive. ' +
          'If you learn Fanuc Macro B, you can read and adapt to any dialect.',
      },
      {
        id: 'cnc-intro-5',
        type: 'choice',
        text:
          'A CNC lathe program uses G96 S200. What does G96 do?',
        options: [
          'Sets spindle speed to 200 RPM',
          'Sets constant surface speed — the controller adjusts RPM as diameter changes to maintain 200 SFM/m/min',
          'Limits maximum spindle speed to 200 RPM',
          'Sets feedrate to 200 mm/min',
        ],
        answer:
          'Sets constant surface speed — the controller adjusts RPM as diameter changes to maintain 200 SFM/m/min',
        explanation:
          'G96 is CSS (Constant Surface Speed) mode, specific to turning. As the tool moves toward the ' +
          'spindle centerline (smaller diameter), the RPM automatically increases to maintain a constant ' +
          'surface speed (feet per minute or meters per minute). This keeps chip formation and tool wear ' +
          'consistent across the entire facing or turning pass. G97 cancels CSS and restores direct RPM command.',
      },
      {
        id: 'cnc-intro-6',
        type: 'choice',
        text:
          'A program is loaded onto a Fanuc controller. The previous job left the machine in G21 (metric). ' +
          'The new program was written in inches but has no G20 at the top. What is the most likely outcome?',
        options: [
          'The controller automatically detects inch coordinates and switches modes',
          'The program alarms immediately on load',
          'The machine executes all moves as if the inch values are millimeters — producing a part 25.4× smaller than intended',
          'Nothing — the controller ignores the mismatch',
        ],
        answer:
          'The machine executes all moves as if the inch values are millimeters — producing a part 25.4× smaller than intended',
        explanation:
          'The controller has no way to detect unit mismatch — it only knows the numbers. ' +
          'A coordinate of X3.0 in G21 mode means 3mm, not 3 inches. The part will be machined at ' +
          '1/25.4th of intended size, or — if the work offset is set for a different unit system — ' +
          'the tool may rapid into the fixture.',
      },
      {
        id: 'cnc-intro-7',
        type: 'choice',
        text: 'What is "following error" in a CNC servo system?',
        options: [
          'The difference between the programmed feedrate and the actual feedrate',
          'The difference between commanded position and actual measured position on a servo axis',
          'The number of blocks the controller has queued ahead of the current position',
          'The delay between pressing CYCLE START and the spindle reaching programmed speed',
        ],
        answer:
          'The difference between commanded position and actual measured position on a servo axis',
        explanation:
          'Following error is inherent in any servo system under motion — the axis is always ' +
          'slightly behind the commanded position while accelerating or cutting. A small following ' +
          'error is normal. A growing following error means the servo cannot keep up (overload, binding, ' +
          'or aggressive cutting). When it exceeds the configured threshold, the controller triggers ' +
          'Alarm 411 (Fanuc) and stops all motion — the designed safe behavior.',
      },
      {
        id: 'cnc-intro-8',
        type: 'choice',
        text:
          'What is the key difference between a 5-axis "positioning" (3+2) setup and true simultaneous 5-axis machining?',
        options: [
          'Positioning uses 3 axes; simultaneous uses all 5 at the same time',
          'In positioning, the rotary axes are locked at a fixed angle during cutting; in simultaneous, all 5 axes move at once',
          'Positioning is only for drilling; simultaneous is only for milling',
          'There is no difference — the terms are interchangeable',
        ],
        answer:
          'In positioning, the rotary axes are locked at a fixed angle during cutting; in simultaneous, all 5 axes move at once',
        explanation:
          '3+2 (positioning) means: rotate A and B to a fixed angle, lock them, then cut in 3 linear axes. ' +
          'This gives access to multiple faces without re-fixturing but is much simpler to program. ' +
          'True simultaneous 5-axis moves all five axes at once — required for swept surfaces on turbine ' +
          'blades and impellers, but requires TCPM (Tool Center Point Management, G43.4 on Fanuc) to keep ' +
          'the tool tip on the programmed path as the rotary axes move.',
      },
    ],
  },

  mentalModel: [
    'CAD = What. CAM = How. G-code = Instructions. Controller = Reader. Machine = Hands.',
    'Every crash is a broken link in the chain — diagnose by working backward from symptom to source.',
    'Servo = closed-loop = self-correcting. Following error alarm = the system working as designed.',
    'Fanuc dialect = the universal language of machining. Learn it; everything else is a dialect of it.',
    'G21 = metric. G20 = inch. Always state units explicitly. Never rely on modal state.',
    'The controller has no judgment — only precision. The programmer supplies the judgment.',
    'G-code is 65 years old and still running 90% of production machines. Understanding its history explains its quirks.',
    'Modal codes persist until cancelled. A G83 drill cycle left active will try to drill at the next G00 position.',
    'A stepper motor that loses steps fails silently. A servo that loses following error fails loudly — and safely.',
    '5-axis positioning (3+2): lock the rotary, cut in 3. Simultaneous 5-axis: all axes move at once. TCPM required.',
  ],
}
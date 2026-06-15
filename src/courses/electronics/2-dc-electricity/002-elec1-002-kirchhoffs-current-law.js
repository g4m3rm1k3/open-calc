export default {
  id: 'elec1-002',
  slug: 'kirchhoffs-current-law',
  chapter: 'elec1',
  order: 2,
  title: "Kirchhoff's Current Law",
  subtitle: 'Charge is conserved at every junction — the node equation that makes parallel circuits predictable.',
  tags: ['KCL', 'current law', 'node', 'parallel circuits', 'charge conservation', 'circuit analysis'],
  aliases: 'kirchhoff current law KCL node current junction parallel current branch',
  timeToComplete: 20,
  coreConcept: "KCL states that the sum of all currents entering a node equals the sum of all currents leaving it. Charge cannot accumulate at a junction — whatever flows in must flow out. This is conservation of charge, and it governs every parallel branch and every wire junction in every circuit.",
  prerequisites: ['elec1-001'],
  nextLesson: 'network-analysis',

  hook: {
    question: "A 24VDC distribution block feeds 12 solenoids in parallel. Each solenoid draws 120mA. The supply fuse keeps blowing at 1A, even though 12 × 120mA = 1.44A should be safe on a 2A fuse. What's happening, and how does KCL tell you exactly how much current the supply wire must handle?",
    realWorldContext: "Parallel circuits are everywhere in industrial panels — every device connected to a common 24VDC bus is a parallel branch. KCL tells you that the main supply wire must carry the sum of ALL branch currents. 12 solenoids at 120mA each = 1.44A, plus the PLC itself drawing 400mA, plus 6 indicator lights at 20mA each = 1.44 + 0.4 + 0.12 = 1.96A total. A 2A fuse is right on the edge — add one more device and it trips. KCL at the main node is exactly what you need to size your supply, main fuse, and feeder wire correctly.",
  },

  mentalModel: [
    "**The pipe junction.** Water flowing into a T-junction in a pipe must equal the total water flowing out of both branches. You can't store water in the junction itself — what goes in comes out. Electrical current at a node works identically. The node has no charge storage; whatever current enters through any wire must exit through the remaining wires.",
    "**KCL is conservation of charge.** Electric charge is an absolutely conserved quantity — it can't be created, destroyed, or accumulated at a point in a conductor. KCL is just this conservation law applied to a circuit junction. At any instant, ΣI_in = ΣI_out, or equivalently, the algebraic sum of all currents at a node = 0 (defining inward currents as positive and outward as negative, or vice versa).",
    "**KCL enables current-tracking in parallel systems.** In a series circuit, current is the same everywhere — you only need one current value. In a parallel system, current splits at every node. KCL is the tool that tracks these splits: it tells you exactly how much current flows in each branch, and it guarantees that the sum of all branch currents equals the main supply current.",
  ],

  intuition: {
    prose: [
      "**The formal statement.** Kirchhoff's Current Law: *the algebraic sum of all currents at a node equals zero*. Writing it out: ΣI = 0 at any node. If we define currents flowing into the node as positive: I_in1 + I_in2 + ... − I_out1 − I_out2 − ... = 0. Rearranged: I_in1 + I_in2 = I_out1 + I_out2. Both forms are used; pick the one that's cleaner for your circuit.",
      "**Applying KCL to a parallel circuit.** Three resistors in parallel across a 12V source. KCL at the top node: the source current I_s splits into I₁, I₂, I₃. Each branch current is determined by Ohm's Law independently: I₁ = 12/R₁, I₂ = 12/R₂, I₃ = 12/R₃. KCL then gives I_s = I₁ + I₂ + I₃. This is why parallel circuits increase total current demand — each branch adds to the total.",
      "**Node voltage method preview.** KCL is the basis of the node voltage method for solving complex circuits. Instead of tracing each current separately, you assign a voltage to each node (relative to a reference ground node), express all branch currents in terms of those node voltages using Ohm's Law (I = V/R), then write KCL at each node. The resulting equations are solvable simultaneously. This is far more systematic than writing KVL loop equations for complex networks.",
      "**Current distribution in industrial panels.** Every device on a 24VDC bus is a parallel branch between the + rail and the 0V rail. KCL at the + rail node gives: I_supply = I_PLC + I_solenoids + I_sensors + I_lights + ... The supply fuse must protect the wire between the supply and the bus — so it must be rated for the total KCL sum, not any individual branch. A 24V panel with 30 devices each drawing 80mA needs a minimum 30 × 80mA = 2.4A supply, plus a 3A fuse (next standard size up).",
    ],
    callouts: [
      {
        type: 'theorem',
        title: "Kirchhoff's Current Law (KCL)",
        body: "The algebraic sum of all currents at any node equals zero:\n\n**ΣI_node = 0**\n\nEquivalently: sum of currents entering = sum of currents leaving.\n\nΣI_in = ΣI_out\n\nApplies at every node, at every instant, regardless of what elements are connected.",
      },
      {
        type: 'definition',
        title: 'Node',
        body: "A **node** is any point in a circuit where two or more elements connect. All points electrically connected to the same node are at the same voltage — connected by ideal (zero-resistance) wire.\n\nA **principal node** (or essential node) has three or more branches connected to it. These are the nodes where KCL gives useful equations.\n\nA **reference node** (ground) is the node assigned 0V. All other node voltages are measured relative to it.",
      },
      {
        type: 'insight',
        title: 'Why Parallel Branches Don\'t Affect Each Other\'s Voltage',
        body: "KCL and KVL together explain a key parallel circuit property: adding or removing one parallel branch changes the total current (KCL: I_total changes) but NOT the voltage across any branch (KVL: each branch still has the full source voltage across it). This is why you can unplug one appliance without affecting others on the same circuit — their voltage doesn't change.",
      },
      {
        type: 'procedure',
        title: 'KCL at a Node — Step by Step',
        body: "1. **Identify the node** (junction point).\n2. **Label each branch current** with a direction arrow (assumed, consistent with KVL if doing both).\n3. **Apply KCL**: ΣI_in − ΣI_out = 0.\n4. **Express each current** using Ohm's Law: I = V_node / R (for resistors to ground), or (V_A − V_B) / R (for resistors between nodes A and B).\n5. **Solve** the resulting algebraic equation.",
      },
      {
        type: 'warning',
        title: 'Current Direction Sign Errors',
        body: "The most common KCL mistake is inconsistent sign convention. Pick one: either 'all currents leaving the node are positive' or 'all entering are positive' — and apply it to every term in the equation. Don't mix entering-positive for one term and leaving-positive for another. If you use the node voltage method (all currents leaving = positive), every term is of the form (V_node − V_neighbor) / R, which is automatically consistent.",
      },
      {
        type: 'insight',
        title: "Star and Delta Network Nodes",
        body: "In three-phase power systems, loads are connected in either star (Y) or delta (Δ) configurations. In a Y connection, there's a central neutral node — KCL at that node means the three phase currents sum to zero (for balanced loads). In an unbalanced Y system, the neutral current equals the KCL-required current to balance the node. Understanding this is essential for diagnosing three-phase motor imbalances.",
      },
    ],
    visualizations: [
      {
        id: 'KirchhoffViz',
        title: 'KCL — Node Current Distribution',
        mathBridge: "Switch to KCL mode. The top node splits current into three parallel branches. Change R₁, R₂, R₃ and watch how the current redistributes — lower resistance claims more current. The KCL equation below always shows I_total = I₁ + I₂ + I₃.",
      },
    ],
  },

  math: {
    prose: [
      "For three resistors in parallel across voltage V:\n\n$$I_{total} = I_1 + I_2 + I_3 = \\frac{V}{R_1} + \\frac{V}{R_2} + \\frac{V}{R_3} = V\\left(\\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}\\right)$$\n\nThe equivalent parallel resistance is: $\\dfrac{1}{R_{eq}} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2} + \\dfrac{1}{R_3}$. KCL demands that $I_{total} = V / R_{eq}$.",
      "**Node voltage method (KCL form).** For node A connected to three resistors leading to ground (0V), voltage source Vs at node B:\n\n$$\\frac{V_A - V_s}{R_1} + \\frac{V_A}{R_2} + \\frac{V_A}{R_3} = 0$$\n\nEach term is a current leaving node A: (V_A − V_neighbor) / R. Setting their sum to zero IS KCL. Solve for V_A to find all branch currents.",
      "**Current divider rule.** For two parallel resistors with total current I entering the node:\n\n$$I_1 = I \\cdot \\frac{R_2}{R_1 + R_2} \\qquad I_2 = I \\cdot \\frac{R_1}{R_1 + R_2}$$\n\nNote: the larger resistor gets the *smaller* current (opposite to voltage divider). This makes intuitive sense — current takes the path of least resistance.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Current Divider Rule (Two Parallel Branches)',
        body: "$$I_1 = I_{total} \\cdot \\frac{R_2}{R_1 + R_2}$$\n\nThe current through each branch is proportional to the OTHER branch's resistance. The branch with lower resistance carries more current.",
      },
      {
        type: 'procedure',
        title: 'Panel Current Budget (KCL)',
        body: "Apply KCL at the supply positive terminal node:\n\n1. List every device and its current draw.\n2. Sum all device currents: I_total = ΣI_k\n3. Size supply rating ≥ I_total × 1.25 (25% headroom)\n4. Size main fuse ≤ supply rating, ≥ I_total\n5. Size main feeder wire for I_total (use ampacity table for chosen gauge)\n\nNever size fuses to device ratings when multiple devices share a common feeder.",
      },
    ],
  },
};

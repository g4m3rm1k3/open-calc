export default {
  id: 'elec1-003',
  slug: 'network-analysis',
  chapter: 'elec1',
  order: 3,
  title: 'Network Analysis — Node Voltage and Mesh Current',
  subtitle: 'Systematic methods for solving any DC circuit — no matter how many sources or branches.',
  tags: ['node voltage', 'mesh current', 'network analysis', 'circuit solving', 'KVL', 'KCL', 'systematic'],
  aliases: 'node voltage method mesh analysis branch current superposition circuit equations',
  timeToComplete: 30,
  coreConcept: "The node voltage method (KCL at each node) and mesh current method (KVL around each loop) are systematic algorithms for solving any DC circuit. They convert a circuit into a set of linear equations solvable by algebra or matrices — eliminating the guesswork of simpler approaches.",
  prerequisites: ['elec1-001', 'elec1-002'],
  nextLesson: 'thevenin-norton',

  hook: {
    question: "A robot arm controller has two DC supplies (24V logic, 48V motors), three independent load banks, and feedback resistors forming a bridge circuit. You need to find the current through each branch to verify wire sizing. Applying Ohm's Law directly doesn't work — the sources interact. What's the systematic approach?",
    realWorldContext: "Real industrial circuits have multiple sources (multiple power supplies, batteries in UPS systems), multiple loads, and cross-connections that make simple series/parallel analysis impossible. The node voltage method and mesh current method are the engineering workhorses for these situations. Every circuit simulator (SPICE, LTspice) uses these methods internally. Understanding them means you can analyze any DC circuit by hand, verify simulation results, and understand what the software is actually calculating.",
  },

  mentalModel: [
    "**Node voltage: solve for potentials, get currents for free.** Instead of tracking currents (which split at every junction and are harder to assign), assign an unknown voltage to each node. Then every branch current is automatically (V_A − V_B) / R — derived from voltages, not independently guessed. Write KCL at each unknown-voltage node. You get N−1 equations for N−1 unknown node voltages (one node is the reference at 0V). Solve the equations; compute any branch current afterward.",
    "**Mesh current: solve for loop currents, voltages follow.** Assign a circulating current to each independent loop (mesh). Every branch shared between two loops carries the algebraic sum of both mesh currents. Write KVL for each mesh loop. You get M equations for M mesh currents. Once solved, each branch current is either one mesh current (for non-shared branches) or the sum/difference of two (for shared branches). Branch voltages are then I × R.",
    "**Both methods give the same answer — choose by topology.** Node voltage is usually better for circuits with many parallel branches and few nodes (common in power distribution). Mesh current is often better for circuits with many series loops and few meshes (common in ladder networks and filter circuits). For circuits with ideal voltage sources, node voltage requires a trick (supernode). For circuits with ideal current sources, mesh analysis requires a supermesh. Pick the method that requires fewer special cases.",
  ],

  intuition: {
    prose: [
      "**Node voltage method — the algorithm.** Step 1: identify all nodes and choose a reference (ground) node, usually the most-connected node or the negative supply terminal. Label all other nodes V₁, V₂, ..., Vₙ. Step 2: if a voltage source is connected directly between two nodes, one node voltage is immediately known (or the difference is fixed). Step 3: for each unknown node, write KCL: sum of all branch currents leaving the node = 0. Express each current as (V_node − V_neighbor) / R. Step 4: solve the system of equations. Step 5: calculate any branch current as (V_A − V_B) / R.",
      "**Mesh current method — the algorithm.** Step 1: identify all independent loops (meshes) in the circuit. For a planar circuit with B branches and N nodes, there are B − N + 1 independent meshes. Step 2: assign a mesh current to each loop (all clockwise is conventional). Step 3: for each mesh, write KVL: sum of source voltages = sum of resistive drops. For shared branches, the drop is (I_mesh − I_adjacent_mesh) × R. Step 4: solve. Step 5: actual branch current = algebraic sum of mesh currents in that branch.",
      "**When to use supernode / supermesh.** A voltage source directly between two nodes with unknown voltages creates a supernode: treat both nodes together, writing KCL for the combined supernode while adding the constraint V_A − V_B = Vs. A current source in a branch shared between two meshes creates a supermesh: combine the two mesh equations into one, while adding the constraint I_mesh1 − I_mesh2 = I_source. These are minor extensions, not new methods.",
      "**Matrix form — how simulators do it.** For large circuits, the node voltage equations form a matrix system: GV = I, where G is the conductance matrix (G_ij = sum of conductances connected to node i for diagonal; −conductance between nodes i and j for off-diagonal), V is the node voltage vector, and I is the source current vector. Gaussian elimination (or LU decomposition for large circuits) solves this in milliseconds even for thousands of nodes — this is what SPICE does.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Node Voltage Method — Summary',
        body: '1. Choose reference (ground) node.\n2. Label all other node voltages V₁, V₂, ...\n3. For voltage sources: directly set node voltage or use supernode.\n4. For each unknown node: write KCL as ΣI_out = 0.\n5. Each current term: I = (V_node − V_neighbor) / R.\n6. Solve the system of equations.\n7. Compute branch currents: I_branch = (V_A − V_B) / R.',
      },
      {
        type: 'procedure',
        title: 'Mesh Current Method — Summary',
        body: '1. Identify all independent meshes (loops).\n2. Assign mesh current Iₙ to each mesh (clockwise).\n3. For current sources: directly set mesh current or use supermesh.\n4. For each mesh: write KVL as ΣV_rises − ΣV_drops = 0.\n5. Shared branch drops: (Iₙ − Iₘ) × R.\n6. Solve the system.\n7. Branch current = Iₙ (unshared) or Iₙ ± Iₘ (shared).',
      },
      {
        type: 'insight',
        title: "Why These Methods Always Work",
        body: "Any linear circuit obeys superposition (solutions scale linearly with sources) because Ohm's Law is linear and KVL/KCL are linear constraints. This means the circuit equations always form a system of *linear* equations — and linear systems always have a unique solution when the circuit is properly connected. Nonlinear elements (diodes, transistors) require iterative methods, but the node/mesh framework is still the foundation.",
      },
      {
        type: 'definition',
        title: 'Planar vs. Non-Planar Circuit',
        body: "A **planar circuit** can be drawn on a flat surface without any wires crossing. Mesh analysis applies naturally to planar circuits. Most practical discrete circuits are planar.\n\nA **non-planar circuit** requires wires to cross (like a bridge with a cross-connection plus extra elements). For non-planar circuits, use node voltage method or the general loop current method (which handles any topology).",
      },
      {
        type: 'warning',
        title: 'Choose Independent Loops Only',
        body: "Mesh current analysis requires *independent* loops — loops that include at least one branch not in any other mesh. Writing KVL for dependent loops (combinations of other loops) gives redundant equations with no new information. For a planar circuit, the window-pane meshes (each enclosed region) are always independent. Don't add the outer perimeter as another mesh — it's the sum of all inner meshes.",
      },
    ],
    visualizations: [
      {
        id: 'KirchhoffViz',
        title: 'Node and Loop Analysis — Live Verification',
        mathBridge: "Toggle between KVL and KCL modes. In KVL, adjust resistors and watch how changing one R shifts voltage distribution across all three (the current I changes, so all drops change proportionally). In KCL, watch how changing one parallel resistor changes only its branch current — other branches are unaffected.",
      },
    ],
  },

  math: {
    prose: [
      "**Node voltage equations in matrix form.** For a circuit with nodes V₁ and V₂ (reference at 0V), with conductances G₁₁ = 1/R₁ + 1/R₃ (sum of conductances at node 1), G₂₂ = 1/R₂ + 1/R₃, and G₁₂ = −1/R₃ (mutual conductance between nodes 1 and 2):\n\n$$\\begin{bmatrix} G_{11} & G_{12} \\\\ G_{21} & G_{22} \\end{bmatrix} \\begin{bmatrix} V_1 \\\\ V_2 \\end{bmatrix} = \\begin{bmatrix} I_{s1} \\\\ I_{s2} \\end{bmatrix}$$\n\nwhere I_{s1}, I_{s2} are source currents injected at each node.",
      "**Mesh current equations.** For a two-mesh circuit with mesh currents I₁ (loop 1) and I₂ (loop 2) sharing resistor R₃:\n\n$$\\text{Mesh 1: } V_{s1} = I_1(R_1 + R_3) - I_2 R_3$$\n$$\\text{Mesh 2: } 0 = -I_1 R_3 + I_2(R_2 + R_3)$$\n\nIn matrix form: $\\mathbf{R}\\mathbf{I} = \\mathbf{V}$ where $\\mathbf{R}$ is the resistance matrix.",
    ],
    callouts: [
      {
        type: 'insight',
        title: "Cramer's Rule for 2×2 Systems",
        body: "For the 2×2 system ax + by = e, cx + dy = f:\n\n$$x = \\frac{ed - bf}{ad - bc} \\qquad y = \\frac{af - ec}{ad - bc}$$\n\nPractical for 2-node or 2-mesh circuits. For 3+ unknowns, Gaussian elimination is faster.",
      },
    ],
  },
};

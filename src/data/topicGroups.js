// Curated cross-registry topic groups for the home page's "Explore by Topic"
// section. Only `kind`/`key`/`differentiator` are stored here — cosmetic
// fields (emoji, color, tags, description) are resolved live from
// courseLoader.js / labs/registry.js / games/registry.js at render time
// (see TopicTable.jsx), so this file can never go stale relative to those
// registries. Keyed to match the existing discipline pill labels in
// HomePage.jsx (slugified) so clicking a pill finds its group directly —
// see src/docs/UpSkillOS work/ux-audit-heuristics-linear-algebra.md for the
// diagnosis the linear-algebra entry answers.
export const TOPIC_GROUPS = {
  'linear-algebra': {
    label: 'Linear Algebra',
    items: [
      { kind: 'course', key: 'linear-algebra',
        differentiator: 'Structured, sequential curriculum — start here for the full path from vectors to eigenvalues.' },
      { kind: 'lab', key: 'matrix-lab',
        differentiator: 'Code the algorithms yourself — row ops, elimination, determinants, inverse, Gram-Schmidt in JS, Python, or MATLAB.' },
      { kind: 'lab', key: 'matrix-3d-lab',
        differentiator: 'Visual, geometric 3D intuition — manipulate a live 4×4 transform and watch every entry update.' },
      { kind: 'lab', key: 'openmat',
        differentiator: 'A general computation engine — matrices are one small part of a bigger symbolic + numeric CAS.' },
      { kind: 'game', key: 'matrix-game',
        differentiator: 'Seven gamified interactive lessons — vectors, transforms, determinants, eigenvectors.' },
      { kind: 'game', key: 'asteroids-la',
        differentiator: 'Arcade application — velocity, dot products, and matrix transforms through ten waves of gameplay.' },
      { kind: 'game', key: 'vector-command',
        differentiator: '3D mission campaign — RREF, cross products, and integrals used to intercept targets.' },
    ],
  },
  'physics': {
    label: 'Physics',
    items: [
      { kind: 'course', key: 'physics',
        differentiator: 'Structured curriculum — kinematics, Newtonian mechanics, energy, momentum, and waves, in order.' },
      { kind: 'lab', key: 'sim-lab',
        differentiator: 'Build your own physics simulations from scratch — code it yourself in a Monaco editor with a live 3D sandbox.' },
      { kind: 'game', key: 'reality-runner',
        differentiator: 'Arcade runner — dodge and react to physics simulations in real time.' },
      { kind: 'game', key: 'basketball',
        differentiator: 'Apply trajectory and calculus to perfect your shot arc.' },
      { kind: 'game', key: 'pool',
        differentiator: 'Collision physics and bank angles, played out on the felt.' },
      { kind: 'game', key: 'golf',
        differentiator: 'Geometry and projectile motion, one putt at a time.' },
      { kind: 'game', key: 'football',
        differentiator: 'Integration and optimization applied to real routes and trajectories.' },
    ],
  },
  // Keyed to the existing "Computer Science" pill — Data Structures &
  // Algorithms is the first populated CS example, not the only one planned.
  'computer-science': {
    label: 'Data Structures & Algorithms',
    items: [
      { kind: 'course', key: 'data-structures-and-algorithms',
        differentiator: 'Structured curriculum covering arrays through graphs, in order.' },
      { kind: 'lesson', key: 'dsa-patterns',
        differentiator: 'Data structures and classic design patterns taught together as one guided lesson series.' },
      { kind: 'lab', key: 'dsa-arrays-lab',
        differentiator: 'Implement array operations yourself — get/insert/delete/search — with live memory visualization and a step tracer.' },
      { kind: 'lab', key: 'dsa-linked-lists-lab',
        differentiator: 'Build linked-list operations yourself — nodes, reverse, cycle detection — with animated pointer visualization.' },
    ],
  },
  // Keyed to the existing "Mathematics" pill — Probability/Statistics is
  // the first populated Math example (Linear Algebra already has its own
  // dedicated pill).
  'mathematics': {
    label: 'Probability & Statistics',
    items: [
      { kind: 'course', key: 'applied-statistics',
        differentiator: 'Structured curriculum — statistical thinking, probability, inference, and regression analysis, in order.' },
      { kind: 'lab', key: 'odds-lab',
        differentiator: 'Probability and card-counting practice with cards, dice, and blackjack decisions.' },
      { kind: 'game', key: 'card-quest',
        differentiator: 'Counting, probability, permutations, and stats — through cards and dice.' },
      { kind: 'game', key: 'card-academy',
        differentiator: 'Five card games teaching probability, statistics, and neuroscience through play.' },
    ],
  },
  'cnc-cad': {
    label: 'CNC & CAD',
    items: [
      { kind: 'course', key: 'cnc',
        differentiator: 'Structured curriculum — CNC macro programming, G-code systems, and toolpath math, in order.' },
      { kind: 'course', key: 'gcode-parser',
        differentiator: 'Math and geometry foundations underneath CNC toolpaths — for understanding what the G-code numbers mean, not just running the simulator.' },
      { kind: 'lab', key: 'cad-pro',
        differentiator: 'Design the part first — parametric 3D modelling with constraint-based tools, no machining involved.' },
      { kind: 'lab', key: 'cnc-sim',
        differentiator: 'Program and simulate CNC toolpaths on their own — live 3D backplot and fixture management.' },
      { kind: 'lab', key: 'cad-cnc',
        differentiator: 'CAD and CNC combined — draw geometry and send it straight to the simulator as G-code, both panels live side by side.' },
      { kind: 'lab', key: 'five-axis',
        differentiator: '5-axis kinematics visualizer — homogeneous transforms, surface normals, lead/lag angles on parametric shapes.' },
    ],
  },
  'web-dev': {
    label: 'Web Development',
    items: [
      { kind: 'course', key: 'web',
        differentiator: 'Structured curriculum — HTML and CSS through async JavaScript, ending in a capstone project.' },
      { kind: 'lab', key: 'html-lab',
        differentiator: 'Drag, drop, and style real HTML elements on a live canvas — the code panel syncs both ways as you go.' },
      { kind: 'lab', key: 'html-lessons',
        differentiator: 'Guided step series building one real page — semantic HTML first, then styling, then DOM scripting.' },
      { kind: 'lab', key: 'css-mastery',
        differentiator: "Deep-dive into the browser's layout engine — Box Model, Flexbox, Grid, and Stacking Contexts through interactive challenges." },
      { kind: 'lab', key: 'react-mastery',
        differentiator: '27 narrated lessons — JSX through hooks, context, reducers, and Suspense with live sandboxes.' },
      { kind: 'lab', key: 'ts-lab',
        differentiator: 'Build a real social platform frontend in vanilla TypeScript against a live REST API — no framework.' },
      { kind: 'lab', key: 'vue-studio',
        differentiator: 'Build a real Vue 3 project from scratch — real .vue files, live component tree as you write.' },
      { kind: 'lab', key: 'backend-lab',
        differentiator: 'Build a real backend from scratch — routes, middleware, services, a database — test your own endpoints.' },
    ],
  },
  'plc-automation': {
    label: 'PLC & Automation',
    items: [
      { kind: 'course', key: 'programmable-logic-controllers',
        differentiator: 'Structured curriculum — PLC programming fundamentals and industrial automation systems, in order.' },
      { kind: 'lab', key: 'plc-lab',
        differentiator: 'Hands-on ladder logic simulator — 8 exercises from motor start/stop to full FSM state machines, Allen-Bradley naming.' },
    ],
  },
  'robotics': {
    label: 'Robotics',
    items: [
      { kind: 'lab', key: 'robot-arm-sim',
        differentiator: 'Robot programming from zero — trig, FK/IK, 4×4 transforms, obstacle avoidance, 19 missions on a 2D and 6-DOF 3D arm.' },
      { kind: 'lab', key: 'drone-lab',
        differentiator: 'Program a self-flying drone — 10 missions on displacement vectors, rotation matrices, Bézier paths, and PID control.' },
    ],
  },
  'digital-logic': {
    label: 'Digital Logic',
    items: [
      { kind: 'course', key: 'digital-fundamentals',
        differentiator: 'Structured curriculum — binary, logic gates, boolean algebra, and digital circuits, in order.' },
      { kind: 'course', key: 'logic',
        differentiator: 'Boolean logic and combinational circuit design, applied through problem sets rather than a linear course arc.' },
      { kind: 'lab', key: 'logic-sim',
        differentiator: 'Design and simulate digital logic circuits gate-by-gate with truth tables — build what the courses describe.' },
    ],
  },
}

export function getTopicGroup(topicId) {
  return TOPIC_GROUPS[topicId] ?? null
}

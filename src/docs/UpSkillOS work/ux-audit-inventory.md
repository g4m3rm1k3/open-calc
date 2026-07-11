# UX Audit — Phase 1: Full Inventory

Generated 2026-07-11 directly from the app's own registries
(`src/labs/registry.js`, `src/games/registry.js`, `src/tools/*/meta.js`,
`src/courses/*/meta.json`) — every entry below is real, current data, not
an estimate. Referenced by `ux-audit-plan.md`.

**Totals:** 29 courses, 32 labs, 16 games, 15 tools (12 visible in the tools
menu; 3 — `compass-quick`, `js-playground`, `python-notebook` — are
`group: 'hidden'`, meaning they're invoked contextually rather than
browsed directly, so they don't add to first-visit overwhelm the way the
other 89 do).

---

## Confirmed Redundancy Clusters (Phase 4 targets)

**Linear algebra / matrices — 8 surfaces:**
`linear-algebra` course, `linear-algebra` tool, `matrix-reducer` tool,
`matrix-lab`, `matrix-3d-lab`, `openmat` (labs), `matrix-game`,
`asteroids-la`, `vector-command` (games — 3, pushing this cluster to 9 if
counted individually). No visible differentiation between them for a new
user — nothing says "start with the course, use `matrix-reducer` for quick
row reduction, `matrix-3d-lab` for visual intuition."

**Physics — 6 surfaces:**
`physics` course, `sim-lab` (build-your-own simulations), plus games
`reality-runner`, `basketball`, `pool`, `golf`, `football` (5 games — 7
total if each counted).

**DSA — 5 surfaces:**
`data-structures-and-algorithms` course, `dsa-arrays-lab`,
`dsa-linked-lists-lab`, `dsa-patterns` (labs), plus the `dsa-python` series
inside the Lesson Engine lab.

**Probability / Statistics — 5 surfaces:**
`applied-statistics` course, `discrete-math` course (overlaps on discrete
probability), `odds-lab`, `card-quest`, `card-academy` (labs).

**CNC / CAD — 4 surfaces, more legitimately differentiated:**
`cnc` course, `cnc-sim`, `cad-pro`, `cad-cnc`, `five-axis` (labs) — these
look more like an intentional suite (CAD alone / CNC alone / combined /
kinematics-focused) than accidental overlap, but worth confirming that's
actually communicated to a user rather than assumed.

---

## Courses (29)

| Course | Domain | Description |
|---|---|---|
| ai-engineering | data | Machine learning, LLMs, and AI systems from foundations to deployment |
| applied-statistics | math | Statistical thinking, probability, inference, and regression analysis |
| c-plus-plus | cs | C++ from foundations through the standard library to advanced techniques |
| calculus | math | Limits, derivatives, integrals, and the mathematics of change |
| canvas | creative | 2D graphics programming with the HTML Canvas API |
| chemistry | science | Atomic structure, bonding, reactions, and chemical systems |
| cnc | engineering | CNC macro programming, G-code systems, and toolpath math |
| command-line-interface | creative | Command line fundamentals and terminal mastery |
| data-science | data | Computational methods for data analysis and scientific exploration |
| data-structures-and-algorithms | cs | Data structures and algorithms for efficient computing |
| design | creative | Interface design systems, typography, and visual hierarchy |
| digital-fundamentals | engineering | Binary, logic gates, boolean algebra, and digital circuits |
| discrete-math | math | Logic, sets, graphs, and the mathematics of computing |
| dynamic-programming | cs | Dynamic programming patterns and algorithmic problem solving |
| electronics | engineering | Electrical fundamentals through semiconductors, RF, and systems integration |
| gcode-parser | engineering | Math and geometry foundations for CNC toolpaths |
| geometry | math | Angles, proofs, circles, transformations, and geometric reasoning |
| git | creative | Version control with Git from fundamentals to internals and logic |
| javascript | cs | JavaScript runtime model, async, closures, OOP, and browser APIs |
| linear-algebra | math | Vectors, matrices, eigenvalues, and computational linear algebra |
| logic | cs | Boolean logic, digital fundamentals, and combinational circuit design |
| nosql | data | NoSQL database systems and document-oriented data design |
| physics | science | Kinematics, Newtonian mechanics, energy, momentum, and waves |
| precalculus | math | Algebra, trigonometry, exponentials, and pre-calculus foundations |
| programmable-logic-controllers | engineering | PLC programming fundamentals and industrial automation systems |
| python | cs | Python from core syntax through data science, OOP, and vectorization |
| simulation | engineering | Physics simulations, 3D scenes, and interactive real-time systems |
| sql | data | SQL mastery from zero to advanced queries and Python integration |
| tetris | creative | Build Tetris from scratch — game loop, collision, and polish |
| three-js | creative | 3D graphics from WebGL fundamentals to Three.js scenes and shaders |
| web | cs | Web systems from HTML and CSS through async JavaScript and capstone |

*(Note: `digital-fundamentals` and `logic` both cover boolean logic/digital
circuits — a fourth small cluster worth a quick look during Phase 4.)*

## Labs (32)

| Lab | Subject | Description |
|---|---|---|
| backend-lab | Web Dev | Build a real backend from scratch — routes, middleware, services, database |
| ts-lab | Web Dev | Build a real social platform frontend in vanilla TypeScript |
| vue-studio | Web Dev | Build a real Vue 3 project from scratch |
| abstraction-viz | CS Theory | Step through callbacks, HOFs, closures, DI |
| lesson-engine | CS Theory | Interactive runtime — prediction challenges, concept labs, quizzes |
| visual-code | CS Theory | Block-based visual programming → real JS/Python/C++ |
| music-lab | Creative | Beat machine / DAW — sequencer, synth, FX, piano roll |
| html-lab | Web Dev | Drag/drop/style real HTML elements on a live canvas |
| html-lessons | Web Dev | Guided HTML/CSS/JS series building one real page |
| css-mastery | Web Dev | Box Model, Flexbox, Grid, Stacking Contexts |
| react-mastery | Web Dev | 27 lessons — JSX to hooks, context, reducers, Suspense |
| sim-lab | Science | Build physics simulations — projectiles, orbits, springs |
| drone-lab | Engineering | 10 missions — vectors, rotation matrices, PID control |
| robot-arm-sim | Engineering | Robot programming — FK/IK, 4×4 transforms, Fanuc TP |
| matrix-lab | Math | Row ops, Gaussian elimination, determinants, Gram-Schmidt |
| odds-lab | Math | Probability, statistics, card counting |
| cmm-lab | Engineering | Coordinate measuring machine — GD&T report |
| decomp-lab | Math | SVD, image compression, least squares |
| matrix-3d-lab | Math | Live 3D linear algebra — transforms, eigenvalues, RREF |
| openmat | Math | Full math computation engine — symbolic, 3D graphing, matrices |
| cnc-sim | Engineering | CNC toolpath simulation with live 3D backplot |
| plc-lab | Engineering | PLC ladder logic — XIC, TON, CTU, FSM |
| logic-sim | Engineering | Digital logic circuits, truth tables |
| chemistry (event) | Science | Reactions, periodic table, molecules |
| physics (event) | Science | Rigid body dynamics, forces, waves |
| cad-pro | Engineering | Parametric 3D modelling |
| cad-cnc | Engineering | CAD + CNC combined workspace |
| universal-calc | Math | Unit conversion, constants, numerical methods |
| sicp-js | CS Theory | SICP condensed, interactive |
| dsa-patterns | CS Theory | DSA + design patterns together |
| codelens | CS Theory | Paste JS, watch AST/heap/call stack execute |
| five-axis | Engineering | 5-axis CNC kinematics visualizer |
| notebook-lab | Data Science | Python notebooks in-browser, .ipynb import/export |
| lesson-builder | (tool) | Build/preview interactive lessons |
| viz-builder | (tool) | Build custom visualizations for lessons |
| dsa-arrays-lab | CS Theory | Arrays/memory — get/insert/delete, binary search |
| dsa-linked-lists-lab | CS Theory | Linked lists — reverse, cycle detection |
| svg-studio | Creative | Vector drawing tool |

## Games (16)

| Game | Teaches |
|---|---|
| rubiks-cube | Group theory, permutations, non-commutativity |
| matrix-game | Vectors, transforms, determinants, eigenvectors |
| stem-tetris | Matrix ops, 2×2 transforms, probability |
| card-quest | Counting, probability, permutations, stats, linear algebra |
| card-academy | Probability, statistics, neuroscience |
| asteroids-la | Velocity, dot products, matrix transforms |
| vector-command | RREF, cross products, integrals |
| arkanoid | General math Q&A |
| stem-quest | Multi-subject adventure map |
| open-craft | Physics voxel sandbox |
| reality-runner | Physics simulations |
| basketball | Trajectory, calculus |
| pool | Collision physics, bank angles |
| golf | Geometry, projectile motion |
| football | Integration, optimization |

## Tools (15 — 12 visible, 3 hidden/contextual)

| Tool | Group | Note |
|---|---|---|
| calculator | math | |
| grapher-2d | math | "2D Grapher" |
| grapher-3d | math | "3D Plotter" |
| grapher-jsx | math | "JSXGraph Pro" |
| math-os | math | |
| linear-algebra | math | "Linear Algebra Calculator" — distinct from the `linear-algebra` lab |
| matrix-reducer | math | RREF/REF solver (this series' case study) |
| polynomial | math | Polynomial Solver |
| sigma | math | Sigma Σ |
| scratchpad | engine | |
| terminal-hub | engine | "Terminal" |
| compass-quick | hidden | |
| js-playground | hidden | Full IDE, invoked contextually |
| python-notebook | hidden | |

---

## Next: Phase 2

Run the heuristic evaluation against this real map — specifically, pick
the linear-algebra cluster as the first heuristic-evaluation subject, since
it's the most concrete, most evidenced case of "recognition over recall"
and "consistency and standards" violations (a user has no way to know
which of 8+ surfaces to pick, or that they even relate to each other).

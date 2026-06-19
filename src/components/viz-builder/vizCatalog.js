// Metadata for key vizzes. Auto-discovered vizzes without an entry here
// still appear in the library — they just show name + course, no description.

export const CATEGORIES = {
  notebooks:   { label: 'Notebooks',    color: '#06b6d4', icon: '📓' },
  statistics:  { label: 'Statistics',   color: '#3b82f6', icon: '📊' },
  calculus:    { label: 'Calculus',     color: '#8b5cf6', icon: '∫' },
  physics:     { label: 'Physics',      color: '#f59e0b', icon: '⚡' },
  chemistry:   { label: 'Chemistry',    color: '#10b981', icon: '⚗' },
  engineering: { label: 'Engineering',  color: '#ef4444', icon: '⚙' },
  logic:       { label: 'Logic & CS',   color: '#6366f1', icon: '⊕' },
  geometry:    { label: 'Geometry',     color: '#ec4899', icon: '△' },
  games:       { label: 'Games',        color: '#f97316', icon: '🎮' },
}

export const VIZ_CATALOG = {
  // ── Notebooks ───────────────────────────────────────────────────────────────
  PythonNotebook: {
    title: 'Python Notebook',
    category: 'notebooks',
    description: 'Interactive Python cells powered by Pyodide — write code, add prose explanations, and render matplotlib figures. The learner runs code in the browser with zero setup.',
    concepts: ['Pyodide', 'Interactive Cells', 'Prose + Code'],
    whatYouLearn: 'How to embed a runnable Python environment in any lesson. Add cells with code + prose. Output and figures appear inline.',
    defaultProps: {
      initialCells: [
        { id: 1, cellTitle: 'Hello World', prose: 'Run this cell to see Python in the browser.', code: 'print("Hello, world!")', output: '', status: 'idle', figureJson: null },
      ],
    },
  },
  JSNotebook: {
    title: 'JavaScript Notebook',
    category: 'notebooks',
    description: 'Live JavaScript cells with console output and DOM rendering. Great for teaching web fundamentals or algorithm walkthroughs.',
    concepts: ['JavaScript', 'Live Evaluation', 'Console'],
    whatYouLearn: 'Embed runnable JS examples with live console output directly in a lesson.',
    defaultProps: { cells: [] },
  },
  OpenMatNotebook: {
    title: 'OpenMAT Notebook',
    category: 'notebooks',
    description: 'CAS-powered math notebook using the OpenMAT engine. Supports symbolic algebra, calculus, and matrix operations with LaTeX output.',
    concepts: ['CAS', 'Symbolic Math', 'LaTeX'],
    whatYouLearn: 'Embed live symbolic math computations alongside explanatory prose.',
    defaultProps: { cells: [] },
  },

  // ── Statistics ───────────────────────────────────────────────────────────────
  TDistributionViz: {
    title: 'T-Distribution',
    category: 'statistics',
    description: 'Interactive t-distribution curve. Drag the degrees-of-freedom slider and watch the curve fatten or sharpen toward normal. Shaded region shows the critical area.',
    concepts: ['Probability Distributions', 'SVG rendering', 'Parametric curves'],
    whatYouLearn: 'How sample size (df) changes distribution shape — and why we use t instead of z for small samples.',
    course: 'applied-statistics',
  },
  BinomialDistributionViz: {
    title: 'Binomial Distribution',
    category: 'statistics',
    description: 'Bar chart of binomial probabilities. Adjust n (trials) and p (probability) and see the distribution shift in real time.',
    concepts: ['Discrete distributions', 'PMF', 'Interactive parameters'],
    whatYouLearn: 'How n and p together shape a binomial outcome — and why high n with small p approaches Poisson.',
    course: 'applied-statistics',
  },
  CLTSimulatorViz: {
    title: 'Central Limit Theorem',
    category: 'statistics',
    description: 'Draws samples from any distribution (uniform, skewed, bimodal) and builds the sampling distribution of the mean, revealing its normal shape.',
    concepts: ['Central Limit Theorem', 'Sampling distributions', 'Monte Carlo'],
    whatYouLearn: 'The CLT in action — regardless of the parent distribution, sample means converge to normal.',
    course: 'applied-statistics',
  },
  RegressionScatterViz: {
    title: 'Linear Regression',
    category: 'statistics',
    description: 'Click to add data points and watch the OLS regression line update live. Residuals are drawn, and R² is shown.',
    concepts: ['OLS regression', 'Residuals', 'Least squares'],
    whatYouLearn: 'How the regression line minimises squared residuals and what R² tells you about fit.',
    course: 'applied-statistics',
  },
  HypothesisTestViz: {
    title: 'Hypothesis Test',
    category: 'statistics',
    description: 'Set α, choose a test, and visualise the rejection region, test statistic, and p-value on the distribution curve.',
    concepts: ['Hypothesis testing', 'p-value', 'Critical region'],
    whatYouLearn: 'The visual logic of a hypothesis test — where the test statistic falls relative to the critical region.',
    course: 'applied-statistics',
  },

  // ── Engineering ─────────────────────────────────────────────────────────────
  PLCLadderSim: {
    title: 'PLC Ladder Simulator',
    category: 'engineering',
    description: 'Interactive PLC ladder-logic simulator. Toggle inputs and watch rung logic evaluate in real time, with coil states updating live.',
    concepts: ['PLC', 'Ladder Logic', 'Boolean evaluation'],
    whatYouLearn: 'How ladder rungs evaluate left-to-right, how coil state feeds back as a contact, and why scan cycles matter.',
  },
  LogicSim: {
    title: 'Logic Gate Simulator',
    category: 'logic',
    description: 'Drag-and-drop digital logic circuit builder. Place AND, OR, NOT, NAND, NOR, XOR gates, connect wires, and see live signal propagation.',
    concepts: ['Boolean logic', 'Digital circuits', 'Signal propagation'],
    whatYouLearn: 'How combinational logic circuits work and how to trace signal flow through a gate network.',
  },
  CNCLab: {
    title: 'CNC Simulator',
    category: 'engineering',
    description: 'Full G-code interpreter with real-time 2D/3D toolpath visualisation. Enter G-code programs and see the tool trace the path.',
    concepts: ['G-code', 'CNC machining', 'Toolpath', 'Coordinate systems'],
    whatYouLearn: 'How G00/G01/G02/G03 moves translate to physical toolpaths, and how coordinate systems affect program output.',
  },
  LinearInterpolationViz: {
    title: 'Linear Interpolation',
    category: 'engineering',
    description: 'Animates a CNC tool stepping between two points, showing how the controller breaks linear motion into tiny equal increments.',
    concepts: ['Linear interpolation', 'G01', 'Step resolution'],
    whatYouLearn: 'How CNC controllers achieve straight-line motion by calculating intermediate positions at each control loop iteration.',
    course: 'cnc',
  },

  // ── Chemistry ───────────────────────────────────────────────────────────────
  PeriodicTable: {
    title: 'Periodic Table',
    category: 'chemistry',
    description: 'Interactive periodic table with element cards. Click any element for full property data — atomic mass, electron config, electronegativity, group trends.',
    concepts: ['Periodic trends', 'Electron configuration', 'Element properties'],
    whatYouLearn: 'How elements are organised by atomic number, how period and group determine properties, and trend patterns across the table.',
  },
  MoleculeBuilder: {
    title: 'Molecule Builder',
    category: 'chemistry',
    description: 'Build molecular structures by placing atoms and bonds. Visualises VSEPR geometry and bond angles.',
    concepts: ['Molecular geometry', 'VSEPR', 'Chemical bonds'],
    whatYouLearn: 'How electron pair repulsion determines molecular shape — and why water is bent while CO2 is linear.',
  },

  // ── Games ────────────────────────────────────────────────────────────────────
  MiniGolfGame: {
    title: 'Mini Golf (Physics)',
    category: 'games',
    description: 'Physics-engine mini golf. Each hole is designed around a specific concept — velocity, angle, friction, or momentum.',
    concepts: ['2D physics', 'Projectile motion', 'Friction'],
    whatYouLearn: 'Kinematic relationships between launch angle, velocity, and range — playable instead of just readable.',
  },
  FootballCalculus: {
    title: 'Football & Calculus',
    category: 'games',
    description: 'A passing game where you set the launch angle and power. Underlying physics is driven by parabolic motion equations.',
    concepts: ['Projectile motion', 'Quadratic functions', 'Optimisation'],
    whatYouLearn: 'The connection between the throw angle and the distance function — and which angle maximises range.',
  },

  // ── SVG / Diagrams ───────────────────────────────────────────────────────────
  SVGDiagram: {
    title: 'SVG Diagram',
    category: 'geometry',
    description: 'Renders any SVG — static diagrams, animated infographics, or labelled figures. Accepts inline SVG or a URL.',
    concepts: ['SVG', 'Vector graphics', 'Diagrams'],
    whatYouLearn: 'How to embed precise, scalable diagrams in lessons using SVG.',
    defaultProps: { src: '', alt: '' },
  },
}

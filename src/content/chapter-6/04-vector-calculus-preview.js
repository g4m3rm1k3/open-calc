export default {
  id: 'ch6-vector-preview',
  slug: 'vector-calculus-preview',
  chapter: 6,
  order: 4,
  title: 'Vector-Valued Functions Preview',
  subtitle: 'Motion, geometry, and modeling in 2D/3D before multivariable calculus',
  tags: ['vectors', 'parametric', 'velocity', 'acceleration', 'speed', 'arc length', 'curvature', 'physics', 'robotics'],

  hook: {
    question: 'How do engineers elegantly encapsulate motion through 3D space with one mathematical object instead of juggling three disconnected coordinate functions?',
    realWorldContext:
      'Industrial robotics, orbital satellite mechanics, molecular dynamic simulation, video game animation engines, and autonomous drone navigation protocols all mathematically model complex trajectories directly as continuous vector-valued functions, r(t). ' +
      'This dense encapsulation isolates structural position, instantaneous velocity, navigational direction, and geometric path curvature into a singular grammar that cleanly scales natively into any required spatial dimension.',
    previewVisualizationId: 'ParametricCurve3D',
  },

  intuition: {
    prose: [
      'A true vector-valued function packages independent scalar coordinate equations into one robust geometric object: $\\mathbf{r}(t) = \\langle x(t), y(t), z(t) \\rangle$. Instead of manually synchronizing three separate variables, you globally steer one moving point continuously sweeping through space.',
      'A component operation derivative logically outputs velocity: $\\mathbf{v}(t) = \\mathbf{r}\'(t)$. This is geometrically much more than a raw "rate" scalar; it is a full direction-and-speed vector arrow tangent to the physical curvature.',
      'The second derivative correctly outputs dynamic acceleration: $\\mathbf{a}(t) = \\mathbf{r}\'\'(t)$. Physics conceptually insists acceleration explains mathematically how velocity forces change, which physically happens by altering speed scalar length, redirecting turning alignment, or blending both.',
      'Absolute speed is strictly defined as the strict magnitude of the velocity vector layout: $|\\mathbf{v}(t)|$. Consequently, you can speed steadily on a straight highway with zero real acceleration, or you can cruise continuously at constant speed navigating a sharp hairpin curve demanding high normal acceleration just to rotate the alignment direction.',
      'Arc length traces total integrated path traveled: continuously integrate absolute speed over the duration timeline. This strictly generalizes the classic 1D metric definition: Distance equals the integral of instantaneous Speed.',
      'A massive conceptual win: geometric reality and physical behavior seamlessly synchronize. Mathematically, a pure tangent vector describes raw localized direction; normal-like perpendicular vectors govern lateral turning; intrinsic metric curvature dictates mathematically how violently the driven path forcefully bends.',
      'In data science and Machine Learning, loss parameter trajectory descent paths and weighted network multidimensional optimization bounds are interpreted mathematically using the exact same vector-function gradient-descent flow lens.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Velocity vs Speed',
        body: 'Velocity is a rigid, structural vector that absolutely can dynamically point into negative Cartesian directions or rotate through volumetric space. Geometric speed is a strictly nonnegative scalar equivalent strictly to the absolute calculated magnitude of the local velocity vector.',
      },
      {
        type: 'real-world',
        title: 'Why This Matters Enormously in Engineering',
        body: 'Autonomous path planning for cargo drones and localized robotic actuator arms natively utilizes $\\mathbf{r}(t)$ splines natively, strict operational velocity boundaries $|\\mathbf{r}\'(t)|$, and physical acceleration hardware bounds $|\\mathbf{r}\'\'(t)|$ strictly to keep kinetic motion safe, viable, and structurally feasible.',
      },
    ],
    visualizations: [
      {
        id: 'ParametricCurve3D',
        title: '3D Trajectory Orbit View',
        caption: 'See dynamically how strategically adjusting the base coordinate parametric functions instantly resculpts global trajectory geometry and internal scalar speed profiles.',
      },
      {
        id: 'GradientDescentLoss',
        title: 'AI Loss Surface Trajectory',
        caption: 'In Machine Learning, a neural network "learns" by steering a vector-valued path downward along a 3D loss surface using the negative gradient. This is autonomous vector kinematics.',
      },
    ],
  },

  math: {
    prose: [
      'If $\\mathbf{r}(t) = \\langle x(t), y(t), z(t) \\rangle$, then differentiating mathematically yields $\\mathbf{r}\'(t) = \\langle x\'(t), y\'(t), z\'(t) \\rangle$ and $\\mathbf{r}\'\'(t) = \\langle x\'\'(t), y\'\'(t), z\'\'(t) \\rangle$. Calculus differentiation operates independently and strictly component-wise.',
      'Absolute scalar speed defines as $|\\mathbf{r}\'(t)| = \\sqrt{[x\'(t)]^2 + [y\'(t)]^2 + [z\'(t)]^2}$. Accumulated structural distance physically traveled continuously from $t=a$ right to $t=b$ formally equals the integral $\\int_a^b |\\mathbf{r}\'(t)| \\,dt$.',
      'The essential Unit Tangent Vector form yields: $\\mathbf{T}(t) = \\frac{\\mathbf{r}\'(t)}{|\\mathbf{r}\'(t)|}$ whenever velocity speed is strictly nonzero. Structurally this deliberately isolates absolute path direction entirely independent of dynamic speed scaling.',
      'Curvature metrics (a vital mathematical preview constraint): $\\kappa = \\left| \\frac{d\\mathbf{T}}{ds} \\right|$ precisely where $s$ parameterizes arc length. In standard practical engineering usage, an equivalent efficient 3D evaluation utilizes the dense structural cross product: $\\kappa = \\frac{|\\mathbf{r}\' \\times \\mathbf{r}\'\'|}{|\\mathbf{r}\'|^3}$.',
      'The structural separation/decomposition of active acceleration: $\\mathbf{a} = a_T \\mathbf{T} + a_N \\mathbf{N}$ where parallel alignment $a_T = \\frac{d|\\mathbf{v}|}{dt}$ and perpendicular alignment $a_N = \\kappa |\\mathbf{v}|^2$. Parallel tangential acceleration governs purely numeric speed metrics; perpendicular normal lateral acceleration exclusively governs geometry steering.',
    ],
    callouts: [
      {
        type: 'formula',
        title: 'Core 3D Kinematics Formulas',
        body: '\\mathbf{v}(t) = \\mathbf{r}\'(t), \\quad \\mathbf{a}(t) = \\mathbf{r}\'\'(t), \\quad \\text{speed} = |\\mathbf{v}(t)|, \\quad \\text{distance} = \\int_a^b |\\mathbf{v}(t)| \\,dt',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'Mathematical differentiability rigorously isolated within multi-dimensional $\\mathbb{R}^n$ vector space formally dictates convergence through rigorous normalized vector limits. Formal component-wise scalar differentiability natively implies absolute vector continuity alignment completely and reciprocally.',
      'The exact integral arc length mathematical formula logically derives from localized sequential polygonal approximation series structures: discretely summating segment limits $\\|\\mathbf{r}(t_i) - \\mathbf{r}(t_{i-1})\\|$. As limiting mesh partitions infinitely subdivide smaller, this rigidly collapses safely into the precise explicit exact integral evaluation $\\int |\\mathbf{r}\'(t)| \\,dt$ whenever structural vector components remain continuously differentiable.',
      'The standard analytic acceleration decomposition explicitly formally separates vector quantities precisely by technically explicitly differentiating the composite relationship $\\mathbf{v} = |\\mathbf{v}|\\mathbf{T}$ and explicitly isolating bounded numeric components exactly geometrically parallel and perpendicularly strict to the trajectory $\\mathbf{T}$.',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch6-vector-preview-ex1',
      title: 'Velocity and Absolute Speed Profiles',
      problem: '\\text{Given tracking function } \\mathbf{r}(t) = \\langle t, t^2, t^3 \\rangle, \\text{ evaluate velocity and isolate speed dynamics.}',
      steps: [
        { expression: '\\mathbf{r}\'(t) = \\langle 1, 2t, 3t^2 \\rangle', annotation: 'Formally evaluate derivatives locally isolated to each individual coordinate.' },
        { expression: '|\\mathbf{r}\'(t)| = \\sqrt{1 + 4t^2 + 9t^4}', annotation: 'Determine absolute localized tracking speed magnitude.' },
      ],
      conclusion: 'Velocity dictates geometric direction AND intrinsic speed scalar completely; its isolated magnitude dictates strictly scalar pacing.',
    },
    {
      id: 'ch6-vector-preview-ex2',
      title: 'Distance metrics vs Displacement',
      problem: '\\text{For continuous tracking } \\mathbf{r}(t) = \\langle \\cos(t), \\sin(t), 0 \\rangle \\text{ safely along } 0 \\le t \\le 2\\pi, \\text{ distinctly evaluate spatial displacement alongside literal distance.}',
      steps: [
        { expression: '\\mathbf{r}(0) = \\langle 1, 0, 0 \\rangle, \\quad \\mathbf{r}(2\\pi) = \\langle 1, 0, 0 \\rangle', annotation: 'Determine starting location boundaries alongside ending geographic vector boundary markers.' },
        { expression: '\\text{Displacement} = \\mathbf{r}(2\\pi) - \\mathbf{r}(0) = \\langle 0, 0, 0 \\rangle', annotation: 'Analytically formal overall structural displacement explicitly calculates to geometrically zero.' },
        { expression: '\\mathbf{r}\'(t) = \\langle -\\sin(t), \\cos(t), 0 \\rangle, \\quad |\\mathbf{r}\'(t)| = 1', annotation: 'Tracking calculated navigation geometry speed mathematically stays securely isolated at constant 1.' },
        { expression: '\\text{Distance} = \\int_0^{2\\pi} 1 \\,dt = 2\\pi', annotation: 'Total successfully traveled cumulative metric evaluates to correct unit circle circumference.' },
      ],
      conclusion: 'Zero displacement logically implies absolutely nothing regarding traveled geographic distance metrics. Vector math separates these two concepts safely and fully.',
    },
    {
      id: 'ch6-vector-preview-ex3',
      title: 'Structural Normal Centripetal Accelerations',
      problem: '\\text{For orbiting tracked trajectory } \\mathbf{r}(t) = \\langle R \\cos(\\omega t), R \\sin(\\omega t), 0 \\rangle, \\text{ evaluate total acceleration.}',
      steps: [
        { expression: '\\mathbf{r}\'(t) = \\langle -R \\omega \\sin(\\omega t), R \\omega \\cos(\\omega t), 0 \\rangle', annotation: 'Standard basic mathematical scalar vector calculus sequence operations.' },
        { expression: '|\\mathbf{r}\'(t)| = R \\omega', annotation: 'Evaluate orbital speed dynamically.' },
        { expression: '\\mathbf{r}\'\'(t) = \\langle -R \\omega^2 \\cos(\\omega t), -R \\omega^2 \\sin(\\omega t), 0 \\rangle', annotation: 'Generate acceleration dynamics via 2nd order differentiation arrays.' },
        { expression: '|\\mathbf{r}\'\'(t)| = R \\omega^2', annotation: 'Normal structural exact required isolated scalar magnitude values.' },
      ],
      conclusion: 'Classical physics specifically cleanly dictates identical strict math parameters evaluated efficiently.',
    },
  ],

  challenges: [
    {
      id: 'ch6-vector-preview-ch1',
      difficulty: 'easy',
      problem: '\\text{For continuous } \\mathbf{r}(t) = \\langle \\cos(t), \\sin(t), t \\rangle, \\text{ find strictly isolated vector } \\mathbf{r}\'(t).',
      hint: 'Differentiate each active dynamic vector array spatial parameter technically.',
      walkthrough: [
        { expression: '\\mathbf{r}\'(t) = \\langle -\\sin(t), \\cos(t), 1 \\rangle', annotation: 'Apply correct accurate technical component derivatives.' },
      ],
      answer: '\\langle -\\sin(t), \\cos(t), 1 \\rangle',
    },
    {
      id: 'ch6-vector-preview-ch2',
      difficulty: 'medium',
      problem: '\\text{Given structural navigation } \\mathbf{r}(t) = \\langle t, t^2, 0 \\rangle, \\text{ precisely isolate minimum speed.}',
      hint: 'Compute velocity vector and then minimize its magnitude function.',
      walkthrough: [
        { expression: '\\mathbf{v}(t) = \\langle 1, 2t, 0 \\rangle, \\quad \\mathbf{a}(t) = \\langle 0, 2, 0 \\rangle', annotation: 'Basic calculus differentiation.' },
        { expression: '|\\mathbf{v}(t)| = \\sqrt{1 + 4t^2}', annotation: 'Speed exact function correctly evaluates smoothly.' },
        { expression: '\\text{Minimum isolated value } 1 \\text{ occurs strictly at } t=0', annotation: 'The parabolic speed function physically reaches minimum directly explicitly formally securely at apex successfully.' },
      ],
      answer: '\\text{Minimum speed evaluates precisely to 1 explicitly securely mathematically.}',
    },
  ],

  crossRefs: [
    { lessonSlug: 'parametric-equations', label: 'Parametric Equations', context: 'Vector-valued functions functionally are simply structural parametric arrays explicitly precisely organized reliably cleanly mathematically safely.' },
    { lessonSlug: 'vectors', label: 'Vectors', context: 'Dot products specifically successfully geometrically integrate explicitly perfectly safely rationally explicitly directly.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'completed-example-1', 'solved-challenge'],
}

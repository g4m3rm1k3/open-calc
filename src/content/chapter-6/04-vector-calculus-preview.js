export default {
  id: 'ch6-vector-preview',
  slug: 'vector-calculus-preview',
  chapter: 6,
  order: 4,
  title: 'Vector-Valued Functions Preview',
  subtitle: 'Motion, geometry, and modeling in 2D/3D before multivariable calculus',
  tags: ['vectors', 'parametric', 'velocity', 'acceleration', 'speed', 'arc length', 'curvature', 'physics', 'robotics'],

  hook: {
    question: 'How do we describe motion in space with one object instead of separate x(t), y(t), z(t) equations?',
    realWorldContext:
      'Robotics, orbital mechanics, molecular simulation, animation engines, and autonomous vehicles all model trajectories as vector-valued functions r(t). ' +
      'This format captures position, velocity, direction, and curvature in a single language that scales naturally from 2D to 3D.',
    previewVisualizationId: 'ParametricCurve3D',
  },

  intuition: {
    prose: [
      'A vector-valued function packages coordinate functions into one object: r(t)=<x(t),y(t),z(t)>. Instead of managing three disconnected formulas, you track one moving point in space.',
      'Derivative gives velocity: v(t)=r_dot(t). This is not just a rate number; it is a direction-and-speed vector tangent to the path.',
      'Second derivative gives acceleration: a(t)=r_ddot(t). Acceleration explains how velocity changes, which can happen by changing speed, changing direction, or both.',
      'Speed is the magnitude of velocity: |v(t)|. You can move fast on a straight line with small acceleration, or at constant speed on a tight curve with nonzero acceleration because direction is turning.',
      'Arc length is total path distance: integrate speed over time. This generalizes the one-dimensional idea distance = integral of speed.',
      'A major conceptual win: geometry and physics line up. Tangent vector describes local direction; normal-like behavior reflects turning; curvature quantifies how sharply the path bends.',
      'In data science and ML, trajectories in parameter space and gradient flow can be interpreted with the same vector-function lens. In biology, particle tracking and migration paths are naturally vector-valued.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Velocity vs Speed',
        body: 'Velocity is a vector and can point in negative directions or rotate in space. Speed is a nonnegative scalar equal to the magnitude of velocity.',
      },
      {
        type: 'real-world',
        title: 'Why This Matters in Engineering',
        body: 'Path planning for drones and robot arms uses r(t), velocity constraints |r_dot(t)|, and acceleration limits |r_ddot(t)| to keep motion safe and physically feasible.',
      },
    ],
    visualizations: [
      {
        id: 'ParametricCurve3D',
        title: '3D Trajectory View',
        caption: 'See how changing coordinate functions changes geometry and speed profile.',
      },
    ],
  },

  math: {
    prose: [
      'If r(t)=<x(t),y(t),z(t)>, then r_dot(t)=<x_dot(t),y_dot(t),z_dot(t)> and r_ddot(t)=<x_ddot(t),y_ddot(t),z_ddot(t)>. Differentiation is componentwise.',
      'Speed is |r_dot(t)| = sqrt((x_dot)^2 + (y_dot)^2 + (z_dot)^2). Distance traveled from t=a to t=b is integral from a to b of |r_dot(t)| dt.',
      'Unit tangent vector: T(t)=r_dot(t)/|r_dot(t)| when r_dot(t) is nonzero. This isolates pure direction independent of speed scale.',
      'Curvature (preview form): kappa = |dT/ds| where s is arc length. Equivalent practical formula in 3D uses cross product: kappa = |r_dot x r_ddot| / |r_dot|^3.',
      'Decomposition of acceleration: a = a_T T + a_N N where a_T = d|v|/dt and a_N = kappa |v|^2. Tangential acceleration changes speed; normal acceleration changes direction.',
    ],
    callouts: [
      {
        type: 'formula',
        title: 'Core Kinematics Formulas',
        body: 'v(t)=r_dot(t),  a(t)=r_ddot(t),  speed=|v(t)|,  distance=\\int |v(t)| dt',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'Differentiability in R^n is defined by vector limits. Componentwise differentiability implies vector differentiability and vice versa.',
      'Arc length formula arises from polygonal approximation: sum segment lengths ||r(t_i)-r(t_{i-1})||. In the limit of finer partitions, this converges to integral |r_dot(t)| dt when r is continuously differentiable.',
      'The acceleration decomposition is derived by differentiating v=|v|T and separating components parallel and perpendicular to T. This is the geometric reason circular motion at constant speed still has nonzero acceleration.',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch6-vector-preview-ex1',
      title: 'Velocity and Speed',
      problem: 'Given r(t)=<t, t^2, t^3>, find velocity and speed.',
      steps: [
        { expression: 'r\'(t)=<1, 2t, 3t^2>', annotation: 'Differentiate each component.' },
        { expression: '|r\'(t)|=\\sqrt{1+4t^2+9t^4}', annotation: 'Magnitude gives speed.' },
      ],
      conclusion: 'Velocity gives direction and speed; magnitude gives scalar speed.',
    },
    {
      id: 'ch6-vector-preview-ex2',
      title: 'Distance Traveled vs Displacement',
      problem: 'For r(t)=<cos(t), sin(t), 0> on 0<=t<=2pi, compute displacement and distance traveled.',
      steps: [
        { expression: 'r(0)=<1,0,0>,  r(2pi)=<1,0,0>', annotation: 'Start and end coincide.' },
        { expression: 'displacement = r(2pi)-r(0)=<0,0,0>', annotation: 'Net change is zero.' },
        { expression: 'r\'(t)=<-sin(t), cos(t), 0>,  |r\'(t)|=1', annotation: 'Speed is constant one.' },
        { expression: 'distance=\\int_0^{2pi}1 dt=2pi', annotation: 'Full unit-circle circumference.' },
      ],
      conclusion: 'Zero displacement does not imply zero distance. Vector and scalar perspectives answer different questions.',
    },
    {
      id: 'ch6-vector-preview-ex3',
      title: 'Tangential and Normal Acceleration in Circular Motion',
      problem: 'For r(t)=<R cos(omega t), R sin(omega t),0>, compute speed and acceleration magnitude.',
      steps: [
        { expression: 'r\'(t)=<-R omega sin(omega t), R omega cos(omega t),0>', annotation: 'Differentiate coordinatewise.' },
        { expression: '|r\'(t)|=R omega', annotation: 'Constant speed.' },
        { expression: 'r_ddot(t)=<-R omega^2 cos(omega t), -R omega^2 sin(omega t),0>', annotation: 'Second derivative.' },
        { expression: '|r_ddot(t)|=R omega^2', annotation: 'Pure normal acceleration toward center.' },
      ],
      conclusion: 'Uniform circular motion has constant speed but nonzero acceleration due to direction change.',
    },
  ],

  challenges: [
    {
      id: 'ch6-vector-preview-ch1',
      difficulty: 'easy',
      problem: 'For r(t)=<cos t, sin t, t>, find r\'(t).',
      hint: 'Differentiate componentwise.',
      walkthrough: [
        { expression: 'r\'(t)=<-sin t, cos t, 1>', annotation: 'Component derivatives.' },
      ],
      answer: '<-sin t, cos t, 1>',
    },
    {
      id: 'ch6-vector-preview-ch2',
      difficulty: 'medium',
      problem: 'Given r(t)=<t, t^2, 0>, find acceleration and determine where speed is minimal.',
      hint: 'Compute v(t), then speed |v(t)|, then minimize that scalar function.',
      walkthrough: [
        { expression: 'v(t)=<1,2t,0>, a(t)=<0,2,0>', annotation: 'Differentiate once and twice.' },
        { expression: '|v(t)|=sqrt(1+4t^2)', annotation: 'Speed function.' },
        { expression: 'minimum speed occurs at t=0 with value 1', annotation: 'Quadratic term is minimized at zero.' },
      ],
      answer: 'a(t)=<0,2,0>; minimum speed is 1 at t=0.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'parametric-equations', label: 'Parametric Equations', context: 'Vector-valued functions are the compact form of parametric equations.' },
    { lessonSlug: 'vectors', label: 'Vectors', context: 'Dot products and magnitudes are used in speed and geometry.' },
    { lessonSlug: 'chain-rule', label: 'Chain Rule', context: 'Acceleration decomposition and curvature formulas rely on multistep differentiation.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
}

const PLAYBOOK = [
  {
    keys: ['limit', 'approach', 'epsilon', 'delta'],
    label: 'Limits',
    visualMission: 'In the graph visual, shrink the horizontal window around x=a until the function trace behaves like a single target height. Then write that target as a limit statement.',
    mathMission: 'Translate the picture to symbols: identify a target output band and the input window that guarantees it.',
    realWorldExample: 'Camera autofocus repeatedly narrows distance estimates. Limits model what reading the system approaches as noise and step size shrink.',
    miniGame: 'Window Lock: choose the smallest input interval that keeps outputs inside a chosen tolerance band.',
    puzzle: 'Puzzle: Build a function with a hole at x=2 whose limit is 5 but value at x=2 is -3. Explain how the visual and algebra can both be true.',
  },
  {
    keys: ['continuity', 'discontinuity', 'ivt'],
    label: 'Continuity',
    visualMission: 'Use the continuity visual to trace a curve with your eye from left to right. Mark every point where your pencil would have to lift.',
    mathMission: 'For each suspect point c, check all three continuity conditions and classify exactly which one fails.',
    realWorldExample: 'In CNC cutting and robotics, discontinuities create sudden jumps that can break tools or destabilize motion.',
    miniGame: 'Break Finder: classify each break as removable, jump, or infinite from graph snapshots and symbolic definitions.',
    puzzle: 'Puzzle: Create two different formulas that share the same graph except at one point, then decide which is continuous there.',
  },
  {
    keys: ['derivative', 'tangent', 'rate'],
    label: 'Derivatives',
    visualMission: 'Slide the secant points together until the secant visually becomes the tangent. Estimate slope before revealing the computed value.',
    mathMission: 'Write the difference quotient and identify which part of the algebra corresponds to rise and run on the graph.',
    realWorldExample: 'Sports trackers derive instantaneous speed from position data; derivatives separate acceleration bursts from steady pacing.',
    miniGame: 'Slope Match: match tangent-line snapshots to the correct derivative values without calculation first, then verify algebraically.',
    puzzle: 'Puzzle: Find a function where f\'(a)=0 but a is not a max or min. Explain graphically and with the first derivative test.',
  },
  {
    keys: ['chain', 'composition', 'composite'],
    label: 'Chain Rule',
    visualMission: 'Treat the pipeline visual as connected gears: measure inner speed and outer sensitivity, then predict total speed before multiplying.',
    mathMission: 'Label outer and inner layers explicitly, then apply outside-inside differentiation while preserving inner structure at each peel step.',
    realWorldExample: 'Neural-network backprop multiplies local sensitivities through layers. Chain rule is exactly that product of linked rates.',
    miniGame: 'Layer Scanner: identify outer/middle/inner wrappers under time pressure, then unlock the correct derivative path.',
    puzzle: 'Puzzle: Compare d/dx[(sin x)^2] and d/dx[sin(x^2)] at x=1 and explain why structure, not symbols alone, determines the rule.',
  },
  {
    keys: ['trig', 'sine', 'cosine', 'tangent'],
    label: 'Trigonometric Functions',
    visualMission: 'Use the unit-circle motion to connect horizontal/vertical velocity components with derivative sign and magnitude.',
    mathMission: 'Map the circle motion to identities and derivative formulas, including sign flips for cofunction derivatives.',
    realWorldExample: 'Wave timing in audio, radar, and wireless modulation relies on trig phase and derivative relationships.',
    miniGame: 'Phase Chase: predict the next derivative in the sin/cos cycle and its sign from phase rotation alone.',
    puzzle: 'Puzzle: Explain geometrically why d/dx[cos x] is negative near x=0 while d/dx[sin x] is positive there.',
  },
  {
    keys: ['implicit'],
    label: 'Implicit Differentiation',
    visualMission: 'On an implicit curve, pick a point and estimate tangent direction visually before solving for dy/dx algebraically.',
    mathMission: 'Differentiate every term with respect to x and track hidden y(x) dependencies with chain rule factors.',
    realWorldExample: 'Constraint surfaces in robotics and economics are often implicit; slopes along those constraints drive feasible control.',
    miniGame: 'Hidden y Detector: tap terms that secretly require multiplying by y\'.',
    puzzle: 'Puzzle: For x^2+y^2=25, find where tangent slope is undefined and justify both geometrically and algebraically.',
  },
  {
    keys: ['optimization', 'max', 'min'],
    label: 'Optimization',
    visualMission: 'Use the graph to locate candidate peaks/valleys and boundary checks before calculating exact critical points.',
    mathMission: 'Build objective in one variable, differentiate, solve critical points, and validate with context constraints.',
    realWorldExample: 'Packaging design minimizes material while maintaining volume; optimization converts cost tradeoffs into calculus decisions.',
    miniGame: 'Constraint Builder: choose legal design variables and reject infeasible points before derivative work.',
    puzzle: 'Puzzle: Give a case where the best answer occurs at a boundary, not where f\'(x)=0.',
  },
  {
    keys: ['integral', 'riemann', 'area', 'ftc'],
    label: 'Integrals',
    visualMission: 'Scrub partition width and observe rectangle sums converge to stable area; estimate first, then compare to exact value.',
    mathMission: 'Connect accumulation notation to antiderivatives via FTC and explain why signed area matters.',
    realWorldExample: 'Fluid delivery and battery drain are accumulated over time; integrals convert rate curves into total quantity.',
    miniGame: 'Sum Sprint: choose left/right/midpoint estimates and minimize error with limited rectangle budget.',
    puzzle: 'Puzzle: Construct a function with total integral 0 on [a,b] but nonzero area above and below the axis.',
  },
  {
    keys: ['series', 'sequence', 'taylor', 'maclaurin', 'convergence'],
    label: 'Sequences and Series',
    visualMission: 'Use approximation visuals to see partial sums stabilize (or not). Track error shrink after each added term.',
    mathMission: 'Select the right convergence test and state why its hypothesis matches the series structure.',
    realWorldExample: 'Game engines and scientific calculators approximate transcendental functions with finite series plus error control.',
    miniGame: 'Test Selector: choose comparison, ratio, root, or alternating test under a countdown and justify choice.',
    puzzle: 'Puzzle: Find a series where terms go to 0 but the series diverges, then explain why the nth-term test is only a gatekeeper.',
  },
  {
    keys: ['vector', 'parametric', 'polar'],
    label: 'Vector and Parametric Motion',
    visualMission: 'Trace motion vectors and decompose them into components before computing speed and acceleration formulas.',
    mathMission: 'Convert between coordinate forms and differentiate component-wise to derive velocity and curvature behavior.',
    realWorldExample: 'Drone path planning uses vector decomposition and parametric derivatives for stable tracking and obstacle avoidance.',
    miniGame: 'Component Relay: match geometric arrows to their algebraic component equations.',
    puzzle: 'Puzzle: Give two different parameterizations of the same curve and compare their speed profiles.',
  },
  {
    keys: ['probability', 'counting', 'combinatorics', 'bayes'],
    label: 'Discrete Probability and Counting',
    visualMission: 'Use grid/tree visuals to map sample spaces before writing probability expressions.',
    mathMission: 'Translate counting structure into permutation/combination formulas and simplify with constraints.',
    realWorldExample: 'A/B testing and reliability planning rely on counting outcomes and conditional probabilities.',
    miniGame: 'Outcome Mapper: fill missing branches in a probability tree and compute target event probability.',
    puzzle: 'Puzzle: Design two events with P(A|B) very high but P(B|A) low. Explain with sample-space counts.',
  },
];

const DEFAULT_PACK = {
  label: 'General Math Reasoning',
  visualMission: 'Read the visual first and state what changes, what stays fixed, and what is being measured.',
  mathMission: 'Translate each visual quantity into symbols before applying a rule.',
  realWorldExample: 'Real systems link variables through dependencies; math predicts how local changes propagate through the chain.',
  miniGame: 'Reasoning Match: pair each symbolic step with its geometric or practical meaning.',
  puzzle: 'Puzzle: Create a counterexample that violates one assumption of the current method and explain what breaks.',
};

export function pickTopicMissionPack(lesson) {
  const blob = `${lesson?.title ?? ''} ${lesson?.subtitle ?? ''} ${(lesson?.tags ?? []).join(' ')} ${lesson?.slug ?? ''}`.toLowerCase();
  for (const entry of PLAYBOOK) {
    if (entry.keys.some((k) => blob.includes(k))) {
      return entry;
    }
  }
  return DEFAULT_PACK;
}

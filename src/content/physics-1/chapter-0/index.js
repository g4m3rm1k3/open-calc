export const CH0_LESSONS = [
  {
    id: 'p0-001',
    slug: 'what-is-physics',
    chapter: 'p0',
    order: 0,
    title: 'What is Physics? (Modeling Reality)',
    subtitle: 'How equations model reality, not reality itself.',
    tags: ['modeling', 'assumptions', 'prediction'],
    hook: {
      question: 'How do we predict the future of a system using math?',
      realWorldContext: 'Engineers, athletes, and pilots all use simplified models that ignore some details to make fast and useful predictions.',
      previewVisualizationId: 'ModelVsReality',
    },
    intuition: {
      prose: [
        'Physics is a model-building language. We intentionally simplify the world so we can compute, explain, and predict.',
        'A model keeps dominant causes and temporarily drops weak effects. Ignoring air resistance or treating an object as a point mass are useful simplifications that create solvable first models.',
        'The purpose of a model is not to be perfectly realistic. The purpose is to preserve the key causal structure so predictions are directionally and numerically useful.',
        'Good physics always asks two follow-up questions: what assumptions did we make, and when do those assumptions stop being valid?',
      ],
      callouts: [
        {
          type: 'insight',
          title: 'Pattern First',
          body: 'Model -> Equation -> Prediction -> Check against reality.',
        },
      ],
      visualizations: [
        {
          id: 'SVGDiagram',
          props: { type: 'kinematic-chain' },
          title: 'The model structure: equations link x, v, and a',
          caption: 'A physics model is a system of equations connecting position x(t), velocity v(t), and acceleration a(t). Differentiate to go right (d/dt); integrate to go left (∫dt). Every kinematics problem is a navigation problem on this chain — you know some values and need to find others.',
        },
        {
          id: 'ModelVsReality',
          title: 'Model vs Reality',
          mathBridge: 'Toggling drag changes the governing equation and therefore the predicted trajectory.',
          caption: 'Same initial drop, different assumptions.',
          props: { showAirResistance: false },
        },
      ],
    },
    math: {
      prose: [
        'We define position by the function $x(t)$: input is time $t$ in seconds, output is position $x$ in meters.',
        'If time increases, the model outputs a new position value. The function itself is the rule mapping cause (time) to effect (position).',
        'Variable meaning: $t$ tells when, $x$ tells where. Unit meaning: seconds for $t$, meters for $x$. Behavior meaning: if $x(t)$ grows faster, motion is faster in that interval.',
      ],
      callouts: [
        {
          type: 'definition',
          title: 'Variable Meaning and Units',
          body: '$t$: time (s), $x$: position (m), $x(t)$: predicted position at time $t$.',
        },
      ],
    },
    examples: [
      {
        id: 'p0-001-ex1',
        title: 'Predicting a Fall with an Ideal Model',
        problem: '\\text{Given } x(t)=5t^2, \\text{ find } x(2).',
        steps: [
          {
            expression: 'x(2)=5(2)^2',
            annotation: 'Substitute the input time $t=2$ s.',
          },
          {
            expression: 'x(2)=20',
            annotation: 'The model predicts 20 meters.',
          },
        ],
        conclusion: 'Predictions are only as good as assumptions.',
      },
    ],
    challenges: [
      {
        id: 'p0-001-ch1',
        difficulty: 'easy',
        problem: '\\text{Name one simplification in an ideal free-fall model.}',
        hint: 'Think about effects the model ignores.',
        answer: 'Ignoring air resistance (or treating the object as a point mass).',
      },
      {
        id: 'p0-001-ch2',
        difficulty: 'medium',
        problem: '\\text{If drag is strong, does } x(t)=5t^2 \\text{ overestimate or underestimate fall distance?}',
        hint: 'Drag slows falling speed.',
        answer: 'It overestimates distance because real motion falls less than the vacuum model.',
      },
    ],
  },
  {
    id: 'p0-002',
    slug: 'units-dimensions-scaling',
    chapter: 'p0',
    order: 1,
    title: 'Units, Dimensions, and Scaling',
    subtitle: 'Every valid equation must be dimensionally consistent.',
    tags: ['units', 'dimensions', 'scaling'],
    hook: {
      question: 'Why is $5\\text{ m} + 10\\text{ s}$ meaningless?',
      realWorldContext: 'Unit mistakes have crashed spacecraft and broken engineering systems. Units are safety checks for thought.',
      previewVisualizationId: 'UnitValidator',
    },
    intuition: {
      prose: [
        'Every quantity in physics has a **dimension** — a physical type. The three fundamental ones in mechanics are length $[L]$, mass $[M]$, and time $[T]$.',
        'Units (m, kg, s) are the human-chosen labels for dimensions. The dimension of velocity is always $[L/T]$ whether you measure it in m/s, km/h, or furlongs per fortnight.',
        'The golden rule: **you can only add or equate quantities with the same dimension**. $5\\,\\text{m} + 10\\,\\text{s}$ is as meaningless as adding apples to hours.',
        'Dimensional analysis is a free sanity check. Before solving anything, verify that the equation you are about to use is dimensionally consistent — this catches formula errors instantly.',
      ],
      callouts: [
        {
          type: 'definition',
          title: 'Fundamental dimensions of mechanics',
          body: '[L] = length,\\quad [M] = mass,\\quad [T] = time.',
        },
        {
          type: 'theorem',
          title: 'Homogeneity rule',
          body: '\\text{Every term in a valid equation must have the same dimension: } [\\text{LHS}] = [\\text{RHS}].',
        },
        {
          type: 'insight',
          title: 'Units can change, dimensions cannot',
          body: '$[v] = L/T$ whether you use m/s or mph. Changing units rescales the number but never changes the physical type.',
        },
      ],
      visualizations: [
        {
          id: 'SVGDiagram',
          props: { type: 'dimensions-equation' },
          title: 'Dimensional check of x = v₀t + ½at²',
          caption: 'Every term in the kinematic equation must reduce to [L]. Reading down each column: v₀ has [L/T], multiply by t which is [T], product is [L]. Same for ½at². The equation passes — this is why it can represent position.',
        },
        {
          id: 'UnitValidator',
          title: 'Live Unit Checker',
          mathBridge: 'The visual validates whether dimensions balance in real time.',
          caption: 'Build equations and test dimensional homogeneity.',
        },
      ],
    },
    math: {
      prose: [
        'Derived dimensions are built from the three fundamentals. Velocity: $[v] = L/T$. Acceleration: $[a] = L/T^2$. Force: $[F] = MLT^{-2}$ (from $F=ma$).',
        'Dimensional analysis does not determine numerical constants (the $\\frac{1}{2}$ in $\\frac{1}{2}at^2$ has no dimension), but it tightly constrains which variable combinations are legal.',
        'A powerful technique: if you forget a formula, dimensional analysis often reconstructs it. If something should have units of length and you have $v$ and $t$ available, $vt$ is the only combination that works.',
      ],
      callouts: [
        {
          type: 'theorem',
          title: 'Homogeneity Rule',
          body: '[\\text{LHS}] = [\\text{RHS}]',
        },
        {
          type: 'mnemonic',
          title: 'Quick dimension check for kinematics',
          body: '[x] = [L],\\quad [v] = [L/T],\\quad [a] = [L/T^2],\\quad [t] = [T].',
        },
      ],
    },
    rigor: {
      title: 'Why dimensional homogeneity is necessary',
      prose: [
        'Numbers are not physical quantities — they are dimensionless. A physical quantity is a number paired with a dimension.',
        'When you add two physical quantities, the dimension must be common, just as fractions require common denominators. If dimensions mismatch, the addition is undefined in the physical sense.',
        'This is a theorem about physical models, not arbitrary convention: since dimensions transform independently under unit changes, only equal-dimension quantities can be equal across all unit systems.',
      ],
      proofSteps: [
        {
          expression: '[x] = [L]',
          annotation: 'Position is a length.',
        },
        {
          expression: '[v_0 t] = [L/T]\\cdot[T] = [L]',
          annotation: 'Velocity × time cancels the T, leaving length.',
        },
        {
          expression: '[\\tfrac{1}{2}at^2] = [L/T^2]\\cdot[T^2] = [L]',
          annotation: 'Acceleration × time² cancels T², leaving length.',
        },
        {
          expression: '[L] = [L] + [L]\\;\\checkmark',
          annotation: 'All three terms have the same dimension — the equation is dimensionally valid.',
        },
      ],
      visualizationId: 'UnitValidator',
    },
    examples: [
      {
        id: 'p0-002-ex1',
        title: 'Testing a Suspicious Formula',
        problem: '\\text{Check if } d = vt^2 \\text{ is dimensionally valid.}',
        steps: [
          {
            expression: '[d]=[L]',
            annotation: 'Distance must have length dimension.',
          },
          {
            expression: '[vt^2]=\\frac{L}{T}\\cdot T^2 = LT',
            annotation: 'Right side simplifies to $LT$, not $L$.',
          },
          {
            expression: '[L]\\neq[LT]',
            annotation: 'So the formula fails dimensional consistency.',
          },
        ],
        conclusion: 'A formula can look algebraically clean but still be physically impossible.',
      },
    ],
    challenges: [
      {
        id: 'p0-002-ch1',
        difficulty: 'easy',
        problem: '\\text{What are the dimensions of acceleration?}',
        hint: 'Acceleration is change in velocity over time.',
        answer: '$[a]=L/T^2$.',
      },
      {
        id: 'p0-002-ch2',
        difficulty: 'medium',
        problem: '\\text{Why can } x = vt + \\frac{1}{2}at^2 \\text{ be added term-by-term?}',
        hint: 'Check dimensions of both terms.',
        answer: 'Both $vt$ and $at^2$ reduce to length, so addition is valid.',
      },
    ],
  },
  {
    id: 'p0-003',
    slug: 'variables-and-functions',
    chapter: 'p0',
    order: 2,
    title: 'Variables and Functions in Physics',
    subtitle: 'How physical quantities depend on each other.',
    tags: ['functions', 'variables', 'x(t)', 'v(t)', 'a(t)'],
    hook: {
      question: 'What does it mean to say position depends on time?',
      realWorldContext: 'GPS navigation continuously maps time to location, speed, and acceleration.',
      previewVisualizationId: 'FunctionMachine',
    },
    intuition: {
      prose: [
        'A function is a causal rule: for every allowed input, it outputs exactly one value. In physics, **time $t$ is the input** and everything measurable is an output.',
        'Position $x(t)$, velocity $v(t)$, and acceleration $a(t)$ are all functions of time. When $t$ ticks forward, every one of these values updates according to the model.',
        'The three quantities are not independent — they are linked by calculus. Velocity is the **rate of change** of position; acceleration is the **rate of change** of velocity. Knowing any one function and two initial values lets you reconstruct the other two.',
        'This dependency chain — $x \\to v \\to a$ via differentiation, and $a \\to v \\to x$ via integration — is the backbone of all of mechanics.',
      ],
      callouts: [
        {
          type: 'definition',
          title: 'The kinematic functions',
          body: 'x(t): position\\;[\\text{m}],\\quad v(t): velocity\\;[\\text{m/s}],\\quad a(t): acceleration\\;[\\text{m/s}^2].',
        },
        {
          type: 'insight',
          title: 'The calculus link (preview)',
          body: 'v = dx/dt\\;\\text{(derivative of position)},\\quad x = \\int v\\,dt\\;\\text{(integral of velocity)}.',
        },
        {
          type: 'definition',
          title: 'Independent vs dependent',
          body: '$t$ is independent — we choose it. $x, v, a$ are dependent — the physics determines them.',
        },
      ],
      visualizations: [
        {
          id: 'SVGDiagram',
          props: { type: 'kinematic-chain' },
          title: 'The kinematic chain: x → v → a',
          caption: 'Go right (→) by differentiating: v = dx/dt, a = dv/dt. Go left (←) by integrating: v = ∫a dt, x = ∫v dt. Calculus is what connects the three functions — this chain is the skeleton of all of kinematics.',
        },
        {
          id: 'FunctionMachine',
          title: 'Function Machine',
          mathBridge: 'Input slider controls $t$; outputs update as $x(t)$ changes.',
          caption: 'Cause (time) to effect (position).',
        },
      ],
    },
    math: {
      prose: [
        'Core notation: $x(t)$ for position (m), $v(t)$ for velocity (m/s), and $a(t)$ for acceleration (m/s²).',
        'If $t$ increases, these outputs update according to the model rule, which may be linear, curved, periodic, or piecewise.',
        'Interpretation: when a function output rises with $t$, that physical quantity is increasing. When the function is flat, that quantity is momentarily constant. When it decreases, the quantity is falling.',
      ],
      callouts: [
        {
          type: 'definition',
          title: 'Independent vs Dependent',
          body: '$t$ is independent. $x, v, a$ are dependent variables in basic kinematics models.',
        },
        {
          type: 'insight',
          title: 'Why three functions instead of one',
          body: '$x(t)$ tells where. $v(t)=dx/dt$ tells how fast and which direction. $a(t)=dv/dt$ tells what is causing the velocity to change. Each level of the chain carries different physical information.',
        },
      ],
    },
    rigor: {
      title: 'The three kinematic functions are a dependency chain',
      prose: [
        'In calculus-based mechanics, the fundamental relationship is: $a(t)$ is given (by Newton\'s law $a=F/m$), and $v$ and $x$ are recovered by integration with initial conditions.',
        'This means $x(t)$ is not memorized — it is derived from $a(t)$ in two integration steps.',
      ],
      proofSteps: [
        {
          expression: 'a(t) = \\frac{dv}{dt}',
          annotation: 'Acceleration is defined as the rate of change of velocity. This is the starting point.',
        },
        {
          expression: 'v(t) = v_0 + \\int_0^t a(\\tau)\\,d\\tau',
          annotation: 'Integrate acceleration once, with initial condition v(0) = v₀. This gives velocity.',
        },
        {
          expression: 'v(t) = \\frac{dx}{dt}',
          annotation: 'Velocity is defined as the rate of change of position.',
        },
        {
          expression: 'x(t) = x_0 + \\int_0^t v(\\tau)\\,d\\tau',
          annotation: 'Integrate velocity once, with initial condition x(0) = x₀. This gives position.',
        },
        {
          expression: 'a \\xrightarrow{\\int dt} v \\xrightarrow{\\int dt} x,\\quad x \\xrightarrow{d/dt} v \\xrightarrow{d/dt} a',
          annotation: 'The full dependency chain. Integration and differentiation are inverse operations — that is the Fundamental Theorem of Calculus.',
        },
      ],
      visualizationId: 'FunctionMachine',
    },
    examples: [
      {
        id: 'p0-003-ex1',
        title: 'Reading a Function Value',
        problem: '\\text{If } x(t)=2t+1, \\text{ what is } x(3)?',
        steps: [
          {
            expression: 'x(3)=2(3)+1',
            annotation: 'Insert $t=3$ s into the mapping.',
          },
          {
            expression: 'x(3)=7',
            annotation: 'Output is 7 meters.',
          },
        ],
        conclusion: 'A function is a rule that converts input to physical output.',
      },
    ],
    challenges: [
      {
        id: 'p0-003-ch1',
        difficulty: 'easy',
        problem: '\\text{Which is independent in } x(t): x \\text{ or } t?',
        hint: 'The independent variable is the input.',
        answer: '$t$ is independent.',
      },
      {
        id: 'p0-003-ch2',
        difficulty: 'medium',
        problem: '\\text{If } x(t) \\text{ is in meters and } t \\text{ is in seconds, what are units of slope of } x\\text{-}t \\text{ graph?}',
        hint: 'Slope is output over input.',
        answer: 'm/s, which is velocity.',
      },
    ],
  },
  {
    id: 'p0-004',
    slug: 'average-vs-instantaneous-change',
    chapter: 'p0',
    order: 3,
    title: 'Change: Average vs Instantaneous',
    subtitle: 'From secant slope to tangent slope.',
    tags: ['limits', 'derivative', 'velocity'],
    hook: {
      question: 'Why is average speed not enough for real-time control?',
      realWorldContext: 'Braking systems, autonomous driving, and robotics need instantaneous change, not delayed averages.',
      previewVisualizationId: 'MasterLimitGraph',
    },
    intuition: {
      prose: [
        'Average velocity over an interval blurs detail. It tells what happened across a chunk of time, not at one moment.',
        'For safety systems and control loops, that blur is often too slow. They require local, immediate change information.',
        'When we zoom into a tiny interval, curved motion starts to look linear. This local linearity motivates instantaneous velocity.',
        'Calculus enters exactly here: it formalizes the zoom process instead of treating it as a hand-wave.',
        'Car analogy: your trip average speed can be 60 km/h while your speedometer is reading 15 km/h in traffic or 95 km/h on a clear stretch. Average and instantaneous values answer different questions.',
        'Failure case: two motions can have the same average velocity over 0 to 10 s but one can reverse direction midway. The average hides that sign change unless you inspect local slope.',
        'Flashbulb analogy: average velocity is like a long-exposure blur across a whole interval, while instantaneous velocity is like a high-speed flash frame that freezes one exact moment.',
        'Try-at-home experiment: walk toward a wall slowly for 3 seconds, then speed up in the final second. Your average speed for the full walk is moderate, but your instantaneous speed near the wall is much higher.',
      ],
      callouts: [
        {
          type: 'insight',
          title: 'Pre-Flight Prediction',
          body: 'Before touching any slider: if $\\Delta t$ gets smaller, do you expect average velocity to move closer to or farther from the speedometer-style instantaneous velocity?',
        },
        {
          type: 'insight',
          title: 'Instantaneous = Local Linear Approximation',
          body: 'At sufficiently small time scales, smooth motion behaves like a line segment, and slope becomes locally stable.',
        },
        {
          type: 'warning',
          title: 'Average Velocity Can Hide Direction Changes',
          body: 'A near-zero average over a long interval can still include fast forward and backward motion inside the interval.',
        },
        {
          type: 'definition',
          title: 'Average vs Instantaneous Definitions',
          body: 'Average: $v_{avg}=\\Delta x/\\Delta t$ over a finite interval. Instantaneous: $v=\\lim_{\\Delta t\\to 0}\\Delta x/\\Delta t$ at a point.',
        },
        {
          type: 'proof-map',
          title: 'Limit Process Map',
          body: 'Secant slope on interval -> shrink interval -> limit exists -> tangent slope (derivative).',
        },
        {
          type: 'definition',
          title: 'Symbol Decoder (Plain English)',
          body: '$\\Delta$ means "change in", $x$ means position, and $t$ means time. So $\\Delta x/\\Delta t$ literally means "how much position changed per time changed."',
        },
        {
          type: 'insight',
          title: 'Analogy: Average Mood vs Instant Mood',
          body: 'You can have a good average mood this month but feel frustrated right now after dropping your phone. Same logic: interval average and moment value are different quantities.',
        },
        {
          type: 'warning',
          title: 'Safety Stakes',
          body: 'If a self-driving car brakes using a long average instead of local instantaneous data, it can react late and crash.',
        },
      ],
      visualizations: [
        {
          id: 'SVGDiagram',
          props: { type: 'algebra-avg-velocity' },
          title: 'Average velocity as slope between two points',
          caption: 'v_avg = Δx/Δt = (x₂ − x₁)/(t₂ − t₁). This is the slope of the straight line connecting two points on the x–t graph — a secant line. The question calculus asks: what happens when we slide t₂ toward t₁?',
        },
        {
          id: 'SVGDiagram',
          props: { type: 'slope-triangle' },
          title: 'From secant to tangent: the limit idea',
          caption: 'As Δt → 0, the secant line (two-point average) rotates to become the tangent line at one point. The slope of that tangent is instantaneous velocity — the derivative dx/dt. Algebra gives you the secant; calculus gives you the tangent.',
        },
        {
          id: 'MasterLimitGraph',
          title: 'Master Graph: Algebra -> Limit -> Calculus',
          mathBridge: 'Single evolving graph: finite secant, shrinking interval, then local tangent behavior with snap feedback.',
          caption: 'One visual backbone instead of repeated coordinate planes.',
        },
        {
          id: 'SplitScreenLimitSync',
          title: 'Dual-Track Sync: Algebra -> Calculus',
          mathBridge: 'Left side keeps finite $\\Delta$ brackets, right side shows the same process refining into differential notation via the limit.',
          caption: 'The two tracks are one process at different scales.',
        },
        {
          id: 'SpaceTimeRibbon',
          title: '3D Space-Time Ribbon',
          mathBridge: 'Average velocity is the straight pole between two points on the trajectory; instantaneous velocity is the local direction pointer.',
          caption: 'From 2D slope to 3D motion intuition.',
        },
        {
          id: 'BrakeOrCrashSim',
          title: 'Brake or Crash: Stale vs Instant Data',
          mathBridge: 'Average telemetry is delayed history; instantaneous telemetry is local state needed for control.',
          caption: 'Safety stakes become visceral through interaction.',
        },
      ],
    },
    math: {
      prose: [
        'Plain-English bridge before symbols: we are measuring "steepness of the motion story" on a graph. Average steepness uses a whole chunk; instantaneous steepness uses one location via a limit process.',
        'Average velocity: $v_{avg}=\\frac{\\Delta x}{\\Delta t}$ with units m/s over a finite interval.',
        'Instantaneous velocity: $v=\\lim_{\\Delta t\\to 0}\\frac{\\Delta x}{\\Delta t}$. As the time window shrinks, the estimate approaches local slope.',
        'Interpretation: if instantaneous velocity changes sign, direction changes; if magnitude grows, motion becomes faster at that instant.',
        'Why plugging in a single point fails: slope needs two points. The limit process supplies that by using two nearby points and then collapsing the gap.',
        'Equation depth check: $x$ is position (m), $t$ is time (s), $\\Delta x$ is displacement (m), and $\\Delta t$ is elapsed time (s), so both average and instantaneous velocity have units m/s.',
        'Graph interpretation: secant slope is interval behavior, tangent slope is local behavior. Physical interpretation: secant is trip report, tangent is speedometer reading now.',
      ],
      callouts: [
        {
          type: 'definition',
          title: 'Dual-Track Rigor Toggle',
          body: 'Algebra track: secant slope over a finite gap. Calculus track: the same secant process with gap size driven to zero by a limit.',
        },
        {
          type: 'definition',
          title: 'Interpretation',
          body: '$v>0$ means position increases; larger magnitude means faster position change per second.',
        },
        {
          type: 'warning',
          title: 'Edge Case: Dt = 0 is Undefined',
          body: 'The ratio $\\Delta x/\\Delta t$ is undefined at exactly $\\Delta t=0$. Instantaneous velocity is defined by a limit, not direct substitution.',
        },
        {
          type: 'warning',
          title: 'Edge Case: Non-Smooth Motion',
          body: 'At corners, cusps, or jumps, left and right slopes can disagree, so the derivative may fail to exist.',
        },
        {
          type: 'insight',
          title: 'Misconception Check',
          body: 'Instantaneous velocity is not zero just because the interval is tiny; it is the limiting slope value, which can be nonzero.',
        },
        {
          type: 'warning',
          title: 'Misconception: Average Always Equals Instantaneous',
          body: 'Average approaches instantaneous only as interval width shrinks. For finite intervals they can differ significantly.',
        },
        {
          type: 'proof-map',
          title: 'Algebra-to-Calculus Bridge',
          body: 'Calculus is not a separate idea here; it is repeated algebraic secant estimation with shrinking intervals until a stable local value emerges.',
        },
        {
          type: 'insight',
          title: 'Unity Principle',
          body: 'Calculus is algebra under a magnifying glass: the same ratio, evaluated on smaller and smaller neighborhoods.',
        },
      ],
    },
    rigor: {
      title: 'From Slope Definition to Instantaneous Velocity',
      visualizationId: 'MasterLimitGraph',
      proofSteps: [
        {
          expression: 'm_{sec}=\\frac{x(t+\\Delta t)-x(t)}{\\Delta t}',
          annotation: 'Define secant slope across two nearby times; physically this is finite-interval average velocity.',
        },
        {
          expression: '\\Delta t \\to 0',
          annotation: 'Shrink the time interval so both points collapse to one instant while preserving the slope trend.',
        },
        {
          expression: 'v=\\lim_{\\Delta t\\to 0}\\frac{\\Delta x}{\\Delta t}',
          annotation: 'Introduce limit notation to define local slope rigorously at a single time point.',
        },
        {
          expression: 'v=\\frac{dx}{dt}',
          annotation: 'Name the limiting slope as derivative; physically this is speedometer-like local velocity.',
        },
        {
          expression: '\\text{if }x(t)=t^2,\\ v(t)=2t',
          annotation: 'Concrete check: derivative gives time-varying local velocity that average values only approximate on intervals.',
        },
      ],
    },
    examples: [
      {
        id: 'p0-004-ex1',
        title: 'Average Velocity on an Interval',
        problem: '\\text{If } x(t)=t^2, \\text{ compute } v_{avg} \\text{ from } t=1 \\text{ to } t=3.',
        steps: [
          {
            expression: 'v_{avg}=\\frac{x(3)-x(1)}{3-1}',
            annotation: 'Use endpoint positions.',
          },
          {
            expression: 'v_{avg}=\\frac{9-1}{2}=4',
            annotation: 'Average velocity is 4 m/s.',
          },
        ],
        conclusion: 'Instantaneous velocity at a specific time may differ from the interval average.',
      },
      {
        id: 'p0-004-ex2',
        title: 'Curved Motion and Local Velocity',
        problem: '\\text{For } x(t)=t^2, \\text{ compare } v_{avg} \\text{ on } [2,3] \\text{ with } v(2).',
        steps: [
          {
            expression: 'v_{avg}=\\frac{x(3)-x(2)}{3-2}=\\frac{9-4}{1}=5',
            annotation: 'Finite interval average gives 5 m/s.',
          },
          {
            expression: 'v(t)=\\frac{dx}{dt}=2t \\Rightarrow v(2)=4',
            annotation: 'Instantaneous velocity at t=2 is 4 m/s.',
          },
          {
            expression: '5 \\neq 4',
            annotation: 'Different values confirm average over an interval is not identical to point velocity.',
          },
        ],
        conclusion: 'Curvature causes average and instantaneous values to diverge over finite windows.',
      },
    ],
    challenges: [
      {
        id: 'p0-004-ch1',
        difficulty: 'easy',
        problem: '\\text{Compute } v_{avg} \\text{ for } x(t)=3t+1 \\text{ on } [1,5].',
        hint: 'Find endpoint positions and divide by total time.',
        walkthrough: [
          {
            expression: '\\text{If stuck, revisit: Symbol Decoder and Average Definition}',
            annotation: 'Re-read the Symbol Decoder callout and the first two math paragraphs before computing.',
          },
          {
            expression: 'v_{avg}=\\frac{x(5)-x(1)}{5-1}',
            annotation: 'Use endpoint displacement over total elapsed time.',
          },
          {
            expression: 'x(5)=16,\\ x(1)=4 \\Rightarrow v_{avg}=\\frac{12}{4}=3',
            annotation: 'Compute values and simplify to 3 m/s.',
          },
        ],
        answer: '3 m/s.',
      },
      {
        id: 'p0-004-ch2',
        difficulty: 'medium',
        problem: '\\text{From the graph of } x(t)=t^2, \\text{ estimate } v(2) \\text{ using secant points } t=1.9,2.1.',
        hint: 'Use central secant: $[x(2.1)-x(1.9)]/0.2$.',
        walkthrough: [
          {
            expression: '\\text{If stuck, revisit: Secant-to-Tangent and Local Zoom visuals}',
            annotation: 'Those visuals show why a narrow secant is an estimate for instantaneous slope.',
          },
          {
            expression: 'v(2)\\approx\\frac{x(2.1)-x(1.9)}{0.2}=\\frac{4.41-3.61}{0.2}',
            annotation: 'Apply central secant around t=2.',
          },
          {
            expression: 'v(2)\\approx 4.0',
            annotation: 'Estimated instantaneous velocity is about 4 m/s.',
          },
        ],
        answer: 'Approximately 4.0 m/s.',
      },
      {
        id: 'p0-004-ch3',
        difficulty: 'hard',
        problem: '\\text{Explain why derivative fails for } x(t)=|t| \\text{ at } t=0.',
        hint: 'Compare left-hand and right-hand slope limits.',
        walkthrough: [
          {
            expression: '\\text{If stuck, revisit: Edge Case Non-Smooth Motion}',
            annotation: 'That callout explains derivative failure at corners/cusps.',
          },
          {
            expression: 'm_{left}=\\lim_{h\\to0^-}\\frac{|h|-|0|}{h}=\\lim_{h\\to0^-}\\frac{-h}{h}=-1',
            annotation: 'Compute left-hand slope.',
          },
          {
            expression: 'm_{right}=\\lim_{h\\to0^+}\\frac{|h|-|0|}{h}=\\lim_{h\\to0^+}\\frac{h}{h}=+1',
            annotation: 'Compute right-hand slope.',
          },
          {
            expression: '-1\\neq +1 \\Rightarrow \\frac{dx}{dt}\\text{ does not exist at }t=0',
            annotation: 'Left and right limits disagree, so derivative fails at the corner.',
          },
        ],
        answer: 'Left slope is -1 and right slope is +1, so the limit slopes disagree; derivative does not exist at the corner.',
      },
    ],
  },
  {
    id: 'p0-005',
    slug: 'graphs-as-physical-objects',
    chapter: 'p0',
    order: 4,
    title: 'Graphs as Physical Objects',
    subtitle: 'Slope and area carry physical meaning.',
    tags: ['graphs', 'slope', 'area', 'interpretation'],
    hook: {
      question: 'How can a graph predict motion without seeing the object?',
      realWorldContext: 'Sensor dashboards and telemetry are interpreted through graph shape, slope, and area every second.',
      previewVisualizationId: 'GraphInterpreter',
    },
    intuition: {
      prose: [
        'A graph is a compressed story of motion. Two facts unlock everything:',
        '- **On an x–t graph**: the *slope* at any moment equals velocity. Steeper = faster. Positive slope = moving forward. Negative slope = moving backward. Zero slope = at rest.',
        '- **On a v–t graph**: the *area* between the curve and the time axis equals displacement. Positive area (above axis) = forward motion. Negative area (below axis) = backward motion.',
        'These two facts are not coincidences — they are the same as the calculus definitions: slope is the derivative, area is the integral. Graphs make those abstract operations concrete and visible.',
      ],
      callouts: [
        {
          type: 'definition',
          title: 'Two graph facts to memorize permanently',
          body: '\\text{slope of }x\\text{-}t = v,\\qquad \\text{area under }v\\text{-}t = \\Delta x.',
        },
        {
          type: 'insight',
          title: 'Algebra first: rectangles and trapezoids',
          body: 'Before calculus, estimate area with simple shapes. A rectangle on a v–t graph (constant v) gives Δx = v·Δt exactly. A trapezoid gives Δx = ½(v₀+v)·Δt. Calculus is the limiting case of smaller and smaller shapes.',
        },
      ],
      visualizations: [
        {
          id: 'SVGDiagram',
          props: { type: 'xt-vt-graphs' },
          title: 'Slope = velocity  |  Area = displacement',
          caption: 'Left: the slope triangle on the x–t graph has rise = Δx and run = Δt, so slope = Δx/Δt = velocity. Right: the shaded region under the v–t graph has width Δt and height v, so area = v·Δt = displacement. These are the same relationship — just seen from opposite directions.',
        },
        {
          id: 'GraphInterpreter',
          title: 'Graph Interpreter',
          mathBridge: 'Cursor time changes local slope and accumulated area values in real time.',
          caption: 'Shape to meaning mapping.',
        },
      ],
    },
    math: {
      prose: [
        '$\\frac{dx}{dt}$ gives instantaneous velocity (m/s). Steeper positive slope means larger positive velocity.',
        '$\\int v(t)\\,dt$ accumulates displacement (m). If velocity is zero, area does not grow.',
        'Edge behavior: negative velocity contributes signed negative area — displacement can decrease even while time increases. This is how an object can return to its starting point.',
      ],
      callouts: [
        {
          type: 'insight',
          title: 'Algebra preview: constant-v case',
          body: 'If v is constant, the v–t graph is a flat rectangle. Area = v × Δt = displacement. That is exactly Δx = vt — the simplest kinematic formula.',
        },
        {
          type: 'warning',
          title: 'Speed vs displacement from the graph',
          body: 'Area below the t-axis is negative displacement (motion backward). Speed at any instant is |v|, the magnitude — always positive. Displacement includes direction.',
        },
      ],
    },
    rigor: {
      title: 'Why slope = velocity and area = displacement',
      prose: [
        'These are not graph-reading tricks — they are direct consequences of the definitions.',
      ],
      proofSteps: [
        {
          expression: 'v(t) = \\frac{dx}{dt} = \\lim_{\\Delta t\\to 0}\\frac{\\Delta x}{\\Delta t}',
          annotation: 'Velocity is defined as the derivative of position. The derivative IS the slope of the tangent line on the x–t graph.',
        },
        {
          expression: '\\text{slope of }x\\text{-}t\\text{ at time }t = \\frac{dx}{dt} = v(t)',
          annotation: 'Therefore: slope of x–t graph = velocity. Always, by definition.',
        },
        {
          expression: '\\Delta x = x(t_2)-x(t_1) = \\int_{t_1}^{t_2} v(t)\\,dt',
          annotation: 'The Fundamental Theorem of Calculus: displacement equals the integral of velocity.',
        },
        {
          expression: '\\int_{t_1}^{t_2} v(t)\\,dt = \\text{signed area under }v\\text{-}t\\text{ from }t_1\\text{ to }t_2',
          annotation: 'The geometric meaning of the integral is signed area. Therefore: area under v–t graph = displacement.',
        },
      ],
      visualizationId: 'GraphInterpreter',
    },
    examples: [
      {
        id: 'p0-005-ex1',
        title: 'Flat vs Steep Position Graph',
        problem: '\\text{Interpret two segments: one flat and one steep positive.}',
        steps: [
          {
            expression: '\\text{flat segment} \\Rightarrow \\frac{dx}{dt}=0',
            annotation: 'Object is at rest.',
          },
          {
            expression: '\\text{steep positive segment} \\Rightarrow \\frac{dx}{dt}\\text{ large and positive}',
            annotation: 'Object moves quickly in positive direction.',
          },
        ],
        conclusion: 'Graph steepness directly communicates speed and direction.',
      },
    ],
    challenges: [
      {
        id: 'p0-005-ch1',
        difficulty: 'easy',
        problem: '\\text{If slope on } x\\text{-}t \\text{ graph is negative, what is sign of velocity?}',
        hint: 'Velocity sign follows slope sign.',
        answer: 'Negative velocity.',
      },
      {
        id: 'p0-005-ch2',
        difficulty: 'medium',
        problem: '\\text{Can velocity be zero while acceleration is nonzero?}',
        hint: 'Think of turning points.',
        answer: 'Yes. At a peak, velocity can be 0 while acceleration is still nonzero.',
      },
    ],
  },
  {
    id: 'p0-006',
    slug: 'vectors-vs-scalars',
    chapter: 'p0',
    order: 5,
    title: 'Vectors vs Scalars',
    subtitle: 'Magnitude alone is not enough for motion.',
    tags: ['vectors', 'scalars', 'components'],
    hook: {
      question: 'Can two objects have same speed but different velocity?',
      realWorldContext: 'Air traffic control tracks direction and speed separately because collision risk depends on vector velocity.',
      previewVisualizationId: 'VectorBuilder',
    },
    intuition: {
      prose: [
        'A **scalar** is a single number with a unit: temperature (25°C), mass (70 kg), speed (15 m/s). It tells you *how much*.',
        'A **vector** is a number with a unit *and* a direction: velocity (15 m/s east), force (500 N upward). It tells you *how much and which way*.',
        'The difference is not cosmetic. Two cars can both travel at 60 km/h and still collide head-on, diverge, or travel in parallel — depending entirely on their velocity *directions*. Speed alone cannot predict the outcome.',
        'To make vectors computable, we break them into **components**: the part along $x$ and the part along $y$. Components are ordinary scalars you can add, subtract, and multiply — the vector direction is encoded in their signs.',
      ],
      callouts: [
        {
          type: 'definition',
          title: 'Scalar vs vector',
          body: '\\text{Scalar: magnitude only. Example: } |\\vec{v}| = 20\\,m/s.\\quad \\text{Vector: magnitude + direction. Example: } \\vec{v} = (12, 16)\\,m/s.',
        },
        {
          type: 'insight',
          title: 'Components are the computable form',
          body: 'v_x = |\\vec{v}|\\cos\\theta,\\quad v_y = |\\vec{v}|\\sin\\theta.\\quad\\text{Then: }|\\vec{v}|=\\sqrt{v_x^2+v_y^2}.',
        },
      ],
      visualizations: [
        {
          id: 'SVGDiagram',
          props: { type: 'vector-components' },
          title: 'One vector, two components',
          caption: 'The velocity arrow is the hypotenuse. vₓ = |v|cosθ (horizontal reach) and vy = |v|sinθ (vertical reach) are the legs. The Pythagorean theorem connects them back: |v|² = vₓ² + vy². A scalar only has the hypotenuse — no angle, no components.',
        },
        {
          id: 'VectorBuilder',
          title: 'Vector Builder',
          mathBridge: 'Dragging the tip updates $v_x$, $v_y$, magnitude, and angle.',
          caption: 'Components are coordinates of direction-aware motion.',
        },
      ],
    },
    math: {
      prose: [
        'Write velocity vector as $\\vec{v}=(v_x,v_y)$ with component units m/s.',
        'Increasing $v_x$ shifts motion rightward; increasing $v_y$ shifts motion upward.',
        'Magnitude is $|\\vec{v}|=\\sqrt{v_x^2+v_y^2}$, but magnitude alone cannot distinguish opposite directions.',
      ],
      callouts: [
        {
          type: 'definition',
          title: 'Speed vs Velocity',
          body: 'Speed is scalar magnitude $|\\vec{v}|$. Velocity includes direction and components.',
        },
        {
          type: 'warning',
          title: 'Adding vectors is NOT adding magnitudes',
          body: '|\\vec{A}+\\vec{B}| \\ne |\\vec{A}| + |\\vec{B}|\\text{ in general. You must add components: }(A_x+B_x,\\, A_y+B_y).',
        },
      ],
    },
    rigor: {
      title: 'Why vectors require components for addition',
      prose: [
        'Scalar addition works because scalars are just numbers on a line. Vector addition must account for direction — the only correct way is component-wise.',
      ],
      proofSteps: [
        {
          expression: '\\vec{A} = A_x\\hat{i} + A_y\\hat{j},\\quad \\vec{B} = B_x\\hat{i} + B_y\\hat{j}',
          annotation: 'Expand both vectors in component form using unit vectors î (east) and ĵ (north).',
        },
        {
          expression: '\\vec{A}+\\vec{B} = (A_x+B_x)\\hat{i} + (A_y+B_y)\\hat{j}',
          annotation: 'Group like unit vectors. Each component adds independently — just ordinary scalar addition along each axis.',
        },
        {
          expression: '|\\vec{A}+\\vec{B}| = \\sqrt{(A_x+B_x)^2+(A_y+B_y)^2}',
          annotation: 'The magnitude of the resultant. This is generally NOT equal to |A| + |B|.',
        },
        {
          expression: '|\\vec{A}+\\vec{B}| = |\\vec{A}|+|\\vec{B}|\\text{ only when }\\vec{A}\\parallel\\vec{B}',
          annotation: 'Magnitudes add directly only when both vectors point in the same direction. Any other angle gives a smaller resultant.',
        },
      ],
      visualizationId: 'VectorBuilder',
    },
    examples: [
      {
        id: 'p0-006-ex1',
        title: 'Same Speed, Different Direction',
        problem: '\\text{Compare } \\vec v_1=(3,4) \\text{ and } \\vec v_2=(-3,4).',
        steps: [
          {
            expression: '|\\vec v_1|=|\\vec v_2|=5',
            annotation: 'Same speed by Pythagorean magnitude.',
          },
          {
            expression: '\\vec v_1 \\neq \\vec v_2',
            annotation: 'Different $x$ direction means different velocity vectors.',
          },
        ],
        conclusion: 'Equal speed does not imply equal velocity.',
      },
    ],
    challenges: [
      {
        id: 'p0-006-ch1',
        difficulty: 'easy',
        problem: '\\text{Is temperature a scalar or vector?}',
        hint: 'Does it have direction?',
        answer: 'Scalar.',
      },
      {
        id: 'p0-006-ch2',
        difficulty: 'medium',
        problem: '\\text{If } \\vec v=(0,-6), \\text{ what is direction of motion?}',
        hint: 'Negative $y$ component.',
        answer: 'Straight downward along negative y-axis.',
      },
    ],
  },
  {
    id: 'p0-007',
    slug: 'coordinate-systems-and-frames',
    chapter: 'p0',
    order: 6,
    title: 'Coordinate Systems and Reference Frames',
    subtitle: 'Motion depends on who is observing.',
    tags: ['reference frame', 'relative motion', 'coordinates'],
    hook: {
      question: 'Is an object at rest or moving?',
      realWorldContext: 'A passenger sitting on a train is at rest in train frame and moving in ground frame at the same time.',
      previewVisualizationId: 'FrameSwitcher',
    },
    intuition: {
      prose: [
        'Position is always measured relative to a chosen origin and coordinate axes.',
        'There is no absolute position in classical mechanics; statements about motion need a reference frame.',
        'A passenger can be stationary in the train frame and moving quickly in the ground frame without contradiction.',
        'Frame choice changes coordinate values, not physical events. Physics is in the relations, not a privileged observer.',
      ],
      visualizations: [
        {
          id: 'SVGDiagram',
          props: { type: 'two-objects-line' },
          title: 'Same event, two coordinate systems',
          caption: 'A is the ground observer, B is the train. In the ground frame, both positions are measured from the fixed origin (A). In the train frame, everything is measured relative to B. Switching the origin changes all coordinates — but the physical distance between objects stays the same.',
        },
        {
          id: 'FrameSwitcher',
          title: 'Train and Ground Frames',
          mathBridge: 'Switching frame changes coordinate values while physical event stays the same.',
          caption: 'Same event, different coordinate descriptions.',
        },
      ],
    },
    math: {
      prose: [
        'Relative velocity in 1D is $v_{A/B}=v_A-v_B$ (all in m/s).',
        'If observer speed increases in the same direction, measured relative speed decreases.',
        'Sign convention matters: swapping observer and object reverses sign, clarifying who is moving relative to whom.',
      ],
      callouts: [
        {
          type: 'insight',
          title: 'No Absolute Rest',
          body: 'Rest and motion are frame-dependent descriptions.',
        },
      ],
    },
    examples: [
      {
        id: 'p0-007-ex1',
        title: 'Walking in a Moving Train',
        problem: '\\text{Train speed is } 20\\,m/s \\text{ right. Passenger walks } 2\\,m/s \\text{ right relative to train. Find passenger speed relative to ground.}',
        steps: [
          {
            expression: 'v_{passenger/ground}=v_{passenger/train}+v_{train/ground}',
            annotation: 'Use frame composition in same direction.',
          },
          {
            expression: 'v_{passenger/ground}=2+20=22\\,m/s',
            annotation: 'Ground observer sees 22 m/s to the right.',
          },
        ],
        conclusion: 'Frame choice changes measured velocity values.',
      },
    ],
    challenges: [
      {
        id: 'p0-007-ch1',
        difficulty: 'easy',
        problem: '\\text{A bag sits on train floor. Is it moving in train frame?}',
        hint: 'Compare bag to train interior.',
        answer: 'No, it is at rest in train frame.',
      },
      {
        id: 'p0-007-ch2',
        difficulty: 'medium',
        problem: '\\text{Can the same object be at rest and moving at once?}',
        hint: 'Different observers.',
        answer: 'Yes, depending on reference frame.',
      },
    ],
  },
  {
    id: 'p0-008',
    slug: 'algebra-vs-calculus-physics',
    chapter: 'p0',
    order: 7,
    title: 'Algebra vs Calculus in Physics',
    subtitle: 'Finite-step reasoning versus local predictive modeling.',
    tags: ['algebra', 'calculus', 'limits', 'derivative'],
    hook: {
      question: 'Why does physics move from average values to derivatives?',
      realWorldContext: 'Real control systems need local predictions each instant, not only block averages over long intervals.',
      previewVisualizationId: 'DiscreteVsContinuous',
    },
    intuition: {
      prose: [
        'Algebra-based physics works with finite chunks: average speed across intervals and piecewise updates.',
        'Those finite chunks are often enough for rough estimates but can hide fast local changes.',
        'Calculus-based physics takes interval size toward zero and models local change continuously, improving prediction and control.',
        'In practice, calculus is the limit of repeated algebraic refinement, not a separate universe.',
      ],
      visualizations: [
        {
          id: 'SVGDiagram',
          props: { type: 'slope-triangle' },
          title: 'Algebra (secant) → Calculus (tangent)',
          caption: 'The algebra approach: pick two points, compute Δx/Δt. The calculus approach: shrink Δt to zero, getting dx/dt. Both use the same ratio — calculus just takes it to its limiting value. The tangent line IS the limit of the secant as the two points collapse into one.',
        },
        {
          id: 'DiscreteVsContinuous',
          title: 'Stepwise vs Continuous Motion',
          mathBridge: 'Smaller step size makes discrete updates approach continuous curve behavior.',
          caption: 'Finite approximation converges toward calculus model.',
        },
      ],
    },
    math: {
      prose: [
        'Average velocity over interval: $v_{avg}=\\frac{\\Delta x}{\\Delta t}$ (m/s).',
        'Derivative velocity at an instant: $v=\\lim_{\\Delta t\\to 0}\\frac{\\Delta x}{\\Delta t}=\\frac{dx}{dt}$.',
        'As $\\Delta t$ gets smaller, approximation error decreases and local predictions become more reliable.',
      ],
      callouts: [
        {
          type: 'proof-map',
          title: 'Derivation Flow',
          body: 'Average ratio -> shrink interval -> limit -> derivative.',
        },
      ],
    },
    rigor: {
      title: 'Average to Instantaneous as a Limit Process',
      visualizationId: 'DiscreteVsContinuous',
      proofSteps: [
        {
          expression: 'v_{avg}=\\frac{\\Delta x}{\\Delta t}',
          annotation: 'Start with finite interval ratio.',
        },
        {
          expression: '\\Delta t \\to 0',
          annotation: 'Refine interval to local neighborhood.',
        },
        {
          expression: 'v=\\lim_{\\Delta t\\to 0}\\frac{\\Delta x}{\\Delta t}',
          annotation: 'Define instantaneous velocity through limit.',
        },
        {
          expression: 'v=\\frac{dx}{dt}',
          annotation: 'Compact derivative notation used throughout physics.',
        },
      ],
    },
    examples: [
      {
        id: 'p0-008-ex1',
        title: 'Discrete Approximation Improves with Smaller Step',
        problem: '\\text{For } x(t)=t^2, \\text{ compare average velocity near } t=2 \\text{ using } \\Delta t=1 \\text{ and } 0.01.',
        steps: [
          {
            expression: '\\Delta t=1: \\frac{x(3)-x(2)}{1}=5',
            annotation: 'Coarse interval gives rough estimate.',
          },
          {
            expression: '\\Delta t=0.01: \\frac{x(2.01)-x(2)}{0.01}=4.01',
            annotation: 'Smaller interval approaches exact instantaneous value 4.',
          },
        ],
        conclusion: 'Calculus emerges as the limit of increasingly fine algebraic approximations.',
      },
    ],
    challenges: [
      {
        id: 'p0-008-ch1',
        difficulty: 'easy',
        problem: '\\text{Which framework is local: algebra averages or calculus derivatives?}',
        hint: 'Local means at an instant.',
        answer: 'Calculus derivatives are local.',
      },
      {
        id: 'p0-008-ch2',
        difficulty: 'medium',
        problem: '\\text{Why does reducing } \\Delta t \\text{ improve predictive accuracy?}',
        hint: 'Think about how quickly slopes can change.',
        answer: 'Smaller intervals better capture local behavior and reduce averaging error.',
      },
    ],
  },
]

const CH0 = {
  title: 'Orientation: Physics Interface',
  number: 'p0',
  slug: 'orientation',
  description: 'Bridge the gap between math syntax and physical reality.',
  lessons: CH0_LESSONS
}

export default CH0

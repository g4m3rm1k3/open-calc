export default {
  id: 'p1-ch2-001',
  slug: 'kinematics-definition',
  chapter: 'p2',
  order: 1,
  title: 'Motion in One Dimension — Definitions',
  subtitle: 'Position, displacement, velocity, and acceleration: the four quantities that describe all motion.',
  tags: ['kinematics','position','displacement','velocity','acceleration','1D motion'],
  aliases: 'motion definition kinematics one dimension scalar vector position displacement',

  hook: {
    question: 'A car drives 10 km east, then 4 km west. It travelled 14 km — but its displacement is only 6 km. Why does the difference matter?',
    realWorldContext:
      'GPS navigation, rocket guidance, and sports biomechanics all depend on tracking displacement — not distance. Kinematics is the language physicists use to describe motion precisely, without asking why the motion happens.',
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'kinematic-chain' },
  },

  videos: [
    {
      title: 'Physics 2 – Motion in One Dimension (1 of 22) Definition',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
  ],

  intuition: {
    prose: [
      '**Where you are in the story.** Chapter 0 showed you the physicist\'s habit: build a model, make a prediction, test it. Chapter 2 starts that process for motion. Before you can write a single equation of motion, you need a precise language — four quantities that together describe everything an object is doing at every moment: where it is, how much it moved, how fast it moved, and whether its speed is changing. This lesson defines those four quantities carefully. Every kinematics calculation you ever do will use them.',

      '**Position: putting an object on a number line.** To locate an object, you need three things: a reference point (the origin), a direction for positive, and a number that says how far the object is from the origin in that direction. On a straight road, you might say a car is at $x = 12$ m (12 metres east of your starting point). Position is just a coordinate — a signed number. Negative position means the object is on the other side of the origin. The choice of origin and positive direction is yours to make; physics works the same regardless. But once you choose, you must be consistent throughout the problem.',

      '**Displacement vs distance: the most important distinction in kinematics.** Displacement $\\Delta x = x_f - x_i$ is the net change in position — a signed vector quantity that tells you how far from where you started you ended up, and in which direction. Distance is the total length of the path you actually travelled, always positive, always $\\geq |\\Delta x|$. The car in the hook drives 14 km but ends up only 6 km east of start: distance = 14 km, displacement = +6 km east. These are different numbers because the car reversed direction. They are equal only when an object moves in a straight line without turning back. The distinction matters because physics equations use displacement — forces cause changes in displacement, not in distance.',

      '**Average velocity and average speed.** Average velocity $\\bar{v} = \\Delta x / \\Delta t$ is displacement per unit time — a signed scalar. Average speed is distance per unit time — always positive. In the car example, if the trip took 30 minutes (0.5 h): average velocity = 6 km / 0.5 h = 12 km/h east; average speed = 14 km / 0.5 h = 28 km/h. Same trip, very different numbers. A car that drives in a perfect circle for one hour has enormous average speed but zero average velocity — it returned to its starting position, so $\\Delta x = 0$. Velocity is what tells you where the object went. Speed only tells you how hard the odometer worked.',

      '**Acceleration: the rate of change of velocity.** Acceleration $a = \\Delta v / \\Delta t$ measures how quickly velocity is changing. It is also a signed quantity: positive acceleration in the positive-$x$ direction, negative acceleration (deceleration or reversal) in the negative direction. An object can have positive velocity and negative acceleration at the same time — a braking car moving forward is a perfect example. Acceleration and velocity are independent quantities. You cannot tell the acceleration from the velocity alone; you need to see how the velocity is changing.',

      '**The kinematic chain: the backbone of the course.** Position, velocity, and acceleration are not three separate ideas — they form a chain. Velocity is the rate of change of position. Acceleration is the rate of change of velocity. Algebraically: $\\bar{v} = \\Delta x / \\Delta t$ and $\\bar{a} = \\Delta v / \\Delta t$. With calculus: $v = dx/dt$ and $a = dv/dt = d^2x/dt^2$. Every kinematics problem you encounter is some version of navigating this chain — given information about one quantity, find another. Lesson 2 gives you the equations that connect all five variables when acceleration is constant.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 22 — Chapter 2: Kinematics',
        body: '**Chapter 0 (done):** The physicist\'s toolkit — models, units, graphs, vectors.\n**This lesson:** The four definitions — position, displacement, velocity, acceleration.\n**Lesson 2:** The five SUVAT equations for constant acceleration.\n**Lessons 3–6:** Reading motion graphs (x-t, v-t, a-t).\n**Lessons 12–18:** Free fall — applying everything to gravity.',
      },
      {
        type: 'definition',
        title: 'Displacement (vector)',
        body: '\\Delta x = x_f - x_i \\qquad \\text{units: m} \\qquad \\text{(signed — encodes direction)}',
      },
      {
        type: 'definition',
        title: 'Average velocity (vector)',
        body: '\\bar{v} = \\frac{\\Delta x}{\\Delta t} = \\frac{x_f - x_i}{t_f - t_i} \\qquad \\text{units: m/s}',
      },
      {
        type: 'definition',
        title: 'Average acceleration (vector)',
        body: '\\bar{a} = \\frac{\\Delta v}{\\Delta t} = \\frac{v_f - v_i}{t_f - t_i} \\qquad \\text{units: m/s}^2',
      },
      {
        type: 'warning',
        title: 'Distance ≠ |Displacement|',
        body: 'Distance counts every metre travelled — always positive. Displacement counts only the net change in position — signed. They are equal only if the object never reverses direction. Using one when the other is needed causes wrong answers. Physics equations always use displacement.',
      },
      {
        type: 'connection',
        title: 'Calculus connection: average → instantaneous',
        body: '\\text{Average velocity over } \\Delta t: \\quad \\bar{v} = \\dfrac{\\Delta x}{\\Delta t}\\\\\\text{Instantaneous velocity (shrink } \\Delta t \\to 0\\text{)}: \\quad v(t) = \\lim_{\\Delta t \\to 0}\\frac{\\Delta x}{\\Delta t} = \\frac{dx}{dt}\\\\\\text{The derivative is not a new idea — it\'s the same ratio, taken to its logical limit.}',
      },
    ],
    visualizations: [
      {
        id: 'MotionTracer',
        title: 'Position, displacement, and distance — live on the x-t graph',
        mathBridge: 'Select "Stop & Reverse" and press Play. Watch the object move right, slow to a stop, then reverse. The x-t graph traces the position in real time. When the curve rises: moving right (positive velocity). When it falls: moving left. Displacement = where you end up minus where you started — read the net change on the vertical axis. Distance = total arc length of the curve, which keeps growing even when the object reverses. Try each preset and identify the displacement, distance, and average velocity for the full trip.',
        caption: 'Interactive x-t graph. Use the presets to explore constant speed, constant acceleration, and stop-and-reverse motion. The slope at any instant is the instantaneous velocity.',
      },
      {
        id: 'PositionVelocityAcceleration',
        title: 'The kinematic chain: position, velocity, and acceleration linked',
        mathBridge: 'Switch between "Braking" and "Rocket launch" presets. In Braking: position grows then flattens (car slowing), velocity is positive but decreasing toward zero, acceleration is constant and negative. In Rocket launch: position curves upward (parabola), velocity grows linearly, acceleration is constant and positive. The three graphs are not independent — each one is the slope (derivative) of the one above it. This is what the kinematic chain looks like in motion.',
        caption: 'All three kinematic quantities simultaneously. The slope of x(t) gives v(t). The slope of v(t) gives a(t). Change the preset to see how all three respond together.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'The kinematic chain: reference diagram',
        mathBridge: 'Use this as a reference alongside the interactive above. The arrows show the mathematical operations: differentiation (d/dt) going right gives you the rate of change, integration (∫ dt) going left recovers the original quantity.',
        caption: 'Position → velocity → acceleration via d/dt. Reversed by integration. Every kinematics problem navigates this chain.',
      },
    ],
  },

  math: {
    prose: [
      'In 1D kinematics, direction is encoded entirely by sign. Choosing "positive = right" means moving right gives positive velocity, moving left gives negative velocity. An object can have positive position and negative velocity simultaneously — it is to the right of the origin but moving left. An object can have negative velocity and positive acceleration simultaneously — it is moving left but slowing down (or about to reverse). These combinations are not contradictions; they are everyday physics.',
      'The five kinematic quantities and their SI units sit at the foundation of every mechanics calculation you will ever do. Treat each one as carrying a physical type — not just a number, but a number with a meaning.',
    ],
    keyFormulas: [
      {
        label: 'Displacement',
        formula: '\\Delta x = x_f - x_i',
        note: 'Always final minus initial. Sign encodes direction.',
      },
      {
        label: 'Average velocity',
        formula: '\\bar{v} = \\frac{\\Delta x}{\\Delta t}',
        note: 'Signed — uses displacement, not distance.',
      },
      {
        label: 'Average acceleration',
        formula: '\\bar{a} = \\frac{\\Delta v}{\\Delta t} = \\frac{v_f - v_i}{t_f - t_i}',
        note: 'Rate of change of velocity. Independent of position.',
      },
      {
        label: 'Instantaneous velocity (calculus)',
        formula: 'v(t) = \\frac{dx}{dt}',
        note: 'Slope of the x-t graph at a specific instant.',
      },
      {
        label: 'Instantaneous acceleration (calculus)',
        formula: 'a(t) = \\frac{dv}{dt} = \\frac{d^2x}{dt^2}',
        note: 'Second derivative of position. Slope of the v-t graph.',
      },
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Five kinematic quantities and SI units',
        body: 'x\\;[\\text{m}],\\quad \\Delta x\\;[\\text{m}],\\quad v\\;[\\text{m/s}],\\quad a\\;[\\text{m/s}^2],\\quad t\\;[\\text{s}]',
      },
      {
        type: 'insight',
        title: 'Instantaneous vs average',
        body: 'Average velocity = slope of the secant line on an x–t graph over an interval. Instantaneous velocity = slope of the tangent line = dx/dt. The secant shrinks to the tangent as Δt → 0. This is what the derivative *means* geometrically.',
      },
      {
        type: 'mnemonic',
        title: 'Signs encode direction — never forget this',
        body: '+x: right, up, or forward (your choice of convention).\\n−x: left, down, or backward.\\nState your positive direction at the start of every problem. Physics gives you the same answer regardless of which direction you call positive — as long as you are consistent.',
      },
    ],
    visualizations: [
      {
        id: 'MotionTracer',
        title: 'Reading all five kinematic quantities from the x-t graph',
        mathBridge: 'Select "Acceleration" preset. The x-t curve is a parabola (x = t² − 4). Pick any two points on the curve and read off Δx/Δt — that is the average velocity for that interval. Now pick a shorter interval around the same point — the slope changes less and less. In the limit, the secant becomes the tangent and you have the instantaneous velocity. The bending of the curve (concave up vs. concave down) tells you the sign of acceleration. Five quantities — x, Δx, v_avg, v_inst, a — all readable from one graph.',
        caption: 'Use the Acceleration preset. Identify: (1) the position at t = 1 s, (2) the average velocity from t = 0 to t = 2 s, (3) whether acceleration is positive or negative from the direction the curve bends.',
      },
    ],
  },

  rigor: {
    title: 'Instantaneous velocity from the limit definition',
    content: [
      {
        type: 'paragraph',
        text: 'Formally, position is a function $x(t): \\mathbb{R} \\to \\mathbb{R}$. Displacement over $[t_1, t_2]$ is $\\Delta x = x(t_2) - x(t_1)$. Distance is $\\int_{t_1}^{t_2} |\\dot{x}(t)|\\,dt$ — the arc length of the trajectory. These are equal only when $\\dot{x}(t)$ does not change sign on the interval. The calculus definitions make precise what the algebraic definitions approximate.',
      },
      {
        type: 'derivation',
        steps: [
          {
            expression: '\\bar{v} = \\frac{x(t+\\Delta t) - x(t)}{\\Delta t}',
            annotation: 'Average velocity over a small interval Δt starting at time t. This is the slope of the secant line on the x–t graph.',
          },
          {
            expression: 'v(t) = \\lim_{\\Delta t \\to 0} \\frac{x(t+\\Delta t) - x(t)}{\\Delta t}',
            annotation: 'Take the limit as Δt → 0. The secant rotates and converges to the tangent line at the point (t, x(t)).',
          },
          {
            expression: 'v(t) = \\frac{dx}{dt}',
            annotation: 'This is the derivative of position — the definition of instantaneous velocity. It is the slope of x(t) at a specific instant.',
          },
          {
            expression: 'a(t) = \\frac{dv}{dt} = \\frac{d^2x}{dt^2}',
            annotation: 'Apply the same limit to velocity to get acceleration — the second derivative of position. Slope of the v-t graph.',
          },
        ],
        answer: 'The derivative is not a separate concept — it is the same average ratio taken to its logical limit. Every time you see dx/dt, think: "slope of the tangent on the x-t graph at this instant."',
      },
    ],
    visualizationId: 'SVGDiagram',
    visualizationProps: { type: 'slope-triangle' },
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'slope-triangle' },
        title: 'Secant → tangent: the geometric meaning of the derivative',
        mathBridge: 'The secant connects two points on x(t) separated by Δt. Its slope = Δx/Δt = average velocity. As Δt → 0, the secant rotates toward the tangent. The tangent slope = dx/dt = instantaneous velocity. This diagram shows a single instant of that collapse.',
        caption: 'Secant slope = average velocity. Tangent slope = instantaneous velocity = dx/dt.',
      },
      {
        id: 'MotionTracer',
        title: 'See the derivative happen: shrink the interval yourself',
        mathBridge: 'Select the "Acceleration" preset. Pause the animation at any moment. The slope of the curve at that point is the instantaneous velocity. Now imagine drawing a line between that point and one a little later — that is the secant with slope = average velocity over that interval. The shorter you make the interval, the closer the secant slope gets to the tangent slope. This is the limit definition of the derivative — not as an abstract formula, but as something you can see.',
        caption: 'Interact with the x-t graph. The curve shape reveals instantaneous velocity (slope at a point) and acceleration (whether the curve bends up or down).',
      },
    ],
  },

  checkpoints: [
    {
      id: 'ch2-001-cp1',
      question: 'A runner goes 400 m east then 100 m west. What is the displacement? What is the distance?',
      answer: 'Displacement = +300 m east ($\\Delta x = 400 - 100 = 300$ m). Distance = 500 m (total path). They differ because the runner reversed direction.',
    },
    {
      id: 'ch2-001-cp2',
      question: 'An object moves from $x = 20$ m to $x = -5$ m in 5 s. What is the average velocity?',
      answer: '$\\bar{v} = \\Delta x / \\Delta t = (-5 - 20)/5 = -25/5 = -5$ m/s. Negative means it moved in the negative-x direction.',
    },
    {
      id: 'ch2-001-cp3',
      question: 'Can an object have a negative velocity and a positive acceleration at the same time? Give an example.',
      answer: 'Yes. A ball thrown downward (negative velocity) but slowing because of air resistance (positive acceleration, opposing motion). Also: a car moving left (negative velocity) that is decelerating — the deceleration is in the positive (rightward) direction.',
    },
  ],

  examples: [
    {
      id: 'ch2-001-ex1',
      title: 'Displacement vs distance',
      problem: '\\text{A runner goes 400 m east then 150 m west. Find (a) distance, (b) displacement.}',
      steps: [
        { expression: '\\text{Distance} = 400 + 150 = 550\\,\\text{m}', annotation: 'Total path length — add all segments regardless of direction.' },
        { expression: '\\Delta x = +400 + (-150) = +250\\,\\text{m east}', annotation: 'Displacement — net change, east = positive.' },
      ],
      conclusion: 'Distance 550 m; displacement 250 m east. The runner\'s final position is 250 m east of start — the 150 m westward leg subtracted from the net position.',
    },
    {
      id: 'ch2-001-ex2',
      title: 'Average velocity',
      problem: '\\text{A car moves from } x_i=20\\,\\text{m to }x_f=80\\,\\text{m in }\\Delta t=4\\,\\text{s. Find }\\bar{v}.}',
      steps: [
        { expression: '\\Delta x = 80 - 20 = 60\\,\\text{m}', annotation: 'Displacement — final minus initial.' },
        { expression: '\\bar{v} = \\frac{60}{4} = 15\\,\\text{m/s}', annotation: 'Average velocity = displacement ÷ time. Positive: moving in the +x direction.' },
      ],
      conclusion: '$\\bar{v} = 15$ m/s in the positive direction.',
    },
    {
      id: 'ch2-001-ex3',
      title: 'Average acceleration from two velocity readings',
      problem: '\\text{A car slows from } v_i = 30\\,\\text{m/s to } v_f = 10\\,\\text{m/s in } \\Delta t = 4\\,\\text{s. Find average acceleration.}',
      steps: [
        { expression: '\\Delta v = v_f - v_i = 10 - 30 = -20\\,\\text{m/s}', annotation: 'Change in velocity. Negative because it slowed down (assuming +x = forward).' },
        { expression: '\\bar{a} = \\frac{-20}{4} = -5\\,\\text{m/s}^2', annotation: 'Negative acceleration — pointing opposite to motion. The car decelerates.' },
      ],
      conclusion: '$\\bar{a} = -5$ m/s². The car is moving forward but accelerating backward — slowing to a stop.',
    },
  ],

  challenges: [
    {
      id: 'ch2-001-ch1',
      difficulty: 'easy',
      problem: '\\text{Object moves: +8 m, −3 m, +1 m. Find distance and displacement.}',
      hint: 'Distance sums absolute values. Displacement sums signed values.',
      walkthrough: [
        { expression: '\\text{Distance} = 8+3+1 = 12\\,\\text{m}', annotation: 'Always positive — add magnitudes.' },
        { expression: '\\Delta x = 8-3+1 = +6\\,\\text{m}', annotation: 'Signs kept — net position change.' },
      ],
      answer: '\\text{Distance}=12\\,\\text{m},\\quad \\Delta x = +6\\,\\text{m}',
    },
    {
      id: 'ch2-001-ch2',
      difficulty: 'medium',
      problem: '\\text{A ball moves from }x=5\\,\\text{m to }x=-3\\,\\text{m in 2 s. Find }\\bar{v}\\text{ and average speed if path length = 10 m.}',
      hint: 'Displacement can be negative; speed cannot.',
      walkthrough: [
        { expression: '\\Delta x = -3 - 5 = -8\\,\\text{m}', annotation: 'Displacement is negative (moved in −x direction).' },
        { expression: '\\bar{v} = -8/2 = -4\\,\\text{m/s}', annotation: 'Negative velocity means moving in −x direction.' },
        { expression: '\\text{avg speed} = 10/2 = 5\\,\\text{m/s}', annotation: 'Speed uses total path length — always positive.' },
      ],
      answer: '\\bar{v} = -4\\,\\text{m/s},\\quad \\text{avg speed} = 5\\,\\text{m/s}',
    },
  ],

  // ── Python Lab ────────────────────────────────────────────────────────────
  python: {
    title: `Python Lab — Kinematics Definitions`,
    description: `Use Python to compute displacement, distance, average velocity, and acceleration from raw position data. We'll also plot x–t graphs and measure slopes.`,
    placement: 'after-examples',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Kinematics quantities from data',
        props: {
          initialCells: [
            {
              id: 'cell-01',
              type: 'code',
              cellTitle: 'Displacement vs distance',
              prose: `Compute displacement and distance for a runner who goes 400 m east then 150 m west. Displacement is signed; distance counts every metre.`,
              code: [
                `import numpy as np`,
                ``,
                `# Position snapshots along +x axis (east = positive)`,
                `positions = [0, 400, 250]   # start, turn-around, finish  (metres)`,
                ``,
                `# Displacement = final - initial`,
                `displacement = positions[-1] - positions[0]`,
                ``,
                `# Distance = sum of absolute leg lengths`,
                `legs = [abs(positions[i+1] - positions[i]) for i in range(len(positions)-1)]`,
                `distance = sum(legs)`,
                ``,
                `print(f"Displacement : {displacement} m")`,
                `print(f"Distance     : {distance} m")`,
                `print(f"Distance >= |displacement|: {distance >= abs(displacement)}")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-02',
              type: 'code',
              cellTitle: 'Average velocity and average speed',
              prose: `Average velocity = displacement ÷ elapsed time. Average speed = distance ÷ elapsed time. Notice that average speed ≥ |average velocity| always holds.`,
              code: [
                `# Continuing from previous cell`,
                `dt = 60   # total elapsed time in seconds`,
                ``,
                `avg_velocity = displacement / dt   # signed`,
                `avg_speed    = distance    / dt   # always positive`,
                ``,
                `print(f"Average velocity : {avg_velocity:.2f} m/s")`,
                `print(f"Average speed    : {avg_speed:.2f} m/s")`,
                `print(f"|avg_velocity| <= avg_speed: {abs(avg_velocity) <= avg_speed}")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-03',
              type: 'code',
              cellTitle: 'Plotting a position–time graph and reading slope',
              prose: `Visualise position vs time. The slope of each segment is the average velocity over that interval — positive slope means moving right, negative slope means moving left.`,
              code: [
                `import matplotlib.pyplot as plt`,
                ``,
                `# Piecewise linear motion: 400 m east in 40 s, then 150 m west in 20 s`,
                `t = np.array([0, 40, 60])`,
                `x = np.array([0, 400, 250])`,
                ``,
                `plt.figure(figsize=(7, 4))`,
                `plt.plot(t, x, 'b-o', linewidth=2)`,
                `plt.xlabel('Time (s)')`,
                `plt.ylabel('Position (m)')`,
                `plt.title('Position–time graph')`,
                `plt.grid(True, alpha=0.4)`,
                ``,
                `# Annotate slopes (= average velocity for each segment)`,
                `v1 = (x[1]-x[0])/(t[1]-t[0])`,
                `v2 = (x[2]-x[1])/(t[2]-t[1])`,
                `plt.text(20, 210, f'slope = {v1} m/s', color='green', fontsize=10)`,
                `plt.text(50, 330, f'slope = {v2} m/s', color='red',   fontsize=10)`,
                `plt.savefig('xt_graph.png', dpi=100, bbox_inches='tight')`,
                `plt.show()`,
                `print(f"Segment 1 avg velocity: {v1} m/s (eastward)")`,
                `print(f"Segment 2 avg velocity: {v2} m/s (westward — negative)")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-04',
              type: 'code',
              cellTitle: 'Average acceleration from velocity data',
              prose: `Acceleration is the rate of change of velocity. Compute it from two velocity readings, including the case where the sign of velocity changes (the object reverses direction).`,
              code: [
                `# Two velocity readings`,
                `v_i = 10.0   # m/s  initial`,
                `v_f = -5.0   # m/s  final (braking, reversed direction)`,
                `delta_t = 3.0  # s`,
                ``,
                `avg_acceleration = (v_f - v_i) / delta_t`,
                `print(f"Δv = {v_f - v_i} m/s")`,
                `print(f"Δt = {delta_t} s")`,
                `print(f"Average acceleration = {avg_acceleration:.2f} m/s²")`,
                `print()`,
                `print("Negative sign → acceleration opposes initial motion.")`,
                `print("Object decelerated AND reversed direction — both encoded in the sign.")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-05',
              type: 'code',
              cellTitle: 'Challenge — analyse a real motion dataset',
              prose: `A sensor records position every 0.5 s. Compute: displacement, distance, average velocity over the full interval, velocity at each step, and average acceleration.`,
              code: [
                `# Sensor data: time (s) and position (m)`,
                `t_data = np.array([0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0])`,
                `x_data = np.array([0.0, 1.2, 2.1, 2.5, 2.2, 1.6, 2.8])`,
                ``,
                `# TODO: Compute and print:`,
                `#   1. total displacement  (x_final - x_initial)`,
                `#   2. total distance      (sum of |Δx| for each step)`,
                `#   3. average velocity    (displacement / total time)`,
                `#   4. velocity at each step (Δx/Δt for each pair)`,
                `#   5. average acceleration (Δv over full interval / total time)`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Sensor data analysis',
              difficulty: 'medium',
              prompt: `Fill in the TODO block to compute all five quantities from the sensor data.`,
              starterBlock: ``,
              testCode: [
                `disp = x_data[-1] - x_data[0]`,
                `assert abs(disp - 2.8) < 0.01, f"Displacement should be 2.8 m, got {disp}"`,
                `steps = np.abs(np.diff(x_data))`,
                `dist = steps.sum()`,
                `assert abs(dist - 5.4) < 0.01, f"Distance should be 5.4 m, got {dist}"`,
                `print("Challenge passed ✓")`,
              ].join('\n'),
              hint: `np.diff(x_data) gives the step-by-step Δx array. Distance = np.abs(np.diff(x_data)).sum(). Velocity at each step = np.diff(x_data) / np.diff(t_data).`,
            },
          ],
        },
      },
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch2-001-q1',
      question: `A cyclist rides 6 km north, then 2 km south. What is the displacement?`,
      options: [
        `8 km north`,
        `4 km north`,
        `4 km south`,
        `8 km (no direction)`,
      ],
      answer: 1,
      explanation: `Displacement = final position − initial position = 6 − 2 = 4 km north. Distance (total path length) is 8 km. Displacement is a vector (signed); distance is a scalar (always positive).`,
    },
    {
      id: 'p1-ch2-001-q2',
      question: `Which statement about distance and displacement is always true?`,
      options: [
        `Distance = |displacement|`,
        `Distance ≥ |displacement|`,
        `Distance < displacement`,
        `They are always equal`,
      ],
      answer: 1,
      explanation: `Distance ≥ |displacement| always. They are equal only when the object moves in one direction without reversing. When the object reverses, distance grows while displacement can shrink.`,
    },
    {
      id: 'p1-ch2-001-q3',
      question: `An object moves from $x = 20$ m to $x = 5$ m in 3 s. What is its average velocity?`,
      options: [
        `$+5$ m/s`,
        `$-5$ m/s`,
        `$+8.3$ m/s`,
        `$-8.3$ m/s`,
      ],
      answer: 1,
      explanation: `$\\bar{v} = \\Delta x / \\Delta t = (5 - 20)/3 = -15/3 = -5$ m/s. Negative means moving in the negative-$x$ direction.`,
    },
    {
      id: 'p1-ch2-001-q4',
      question: `What is the difference between average velocity and average speed?`,
      options: [
        `They are the same thing with different names`,
        `Average velocity uses displacement (signed); average speed uses total distance (positive)`,
        `Average speed uses displacement; average velocity uses total distance`,
        `Average velocity is always larger`,
      ],
      answer: 1,
      explanation: `Average velocity = displacement ÷ time (signed, can be negative). Average speed = distance ÷ time (always positive). Average speed ≥ |average velocity| always.`,
    },
    {
      id: 'p1-ch2-001-q5',
      question: `What does the slope of a position–time ($x$–$t$) graph represent?`,
      options: [
        `Acceleration`,
        `Distance`,
        `Velocity`,
        `Displacement`,
      ],
      answer: 2,
      explanation: `Slope = rise/run = Δx/Δt = average velocity over an interval. The slope of the tangent at any point equals the instantaneous velocity dx/dt.`,
    },
    {
      id: 'p1-ch2-001-q6',
      question: `An object starts at rest and reaches $v = 12$ m/s in 4 s. What is the average acceleration?`,
      options: [
        `48 m/s²`,
        `$0.33$ m/s²`,
        `$3$ m/s²`,
        `$16$ m/s²`,
      ],
      answer: 2,
      explanation: `$\\bar{a} = \\Delta v / \\Delta t = (12 - 0)/4 = 3$ m/s².`,
    },
    {
      id: 'p1-ch2-001-q7',
      question: `Instantaneous velocity is defined as:`,
      options: [
        `$\\Delta x / \\Delta t$ for a large time interval`,
        `$\\lim_{\\Delta t \\to 0} \\Delta x / \\Delta t = dx/dt$`,
        `The average velocity over the whole trip`,
        `Speed in the positive direction`,
      ],
      answer: 1,
      explanation: `Instantaneous velocity is the derivative of position: $v(t) = \\lim_{\\Delta t \\to 0} \\frac{\\Delta x}{\\Delta t} = \\frac{dx}{dt}$. It is the slope of the tangent to the $x(t)$ curve at a specific instant.`,
    },
    {
      id: 'p1-ch2-001-q8',
      question: `In the kinematic chain, what operation takes you from position to velocity?`,
      options: [
        `Integration with respect to time`,
        `Differentiation with respect to time`,
        `Multiplication by time`,
        `Division by acceleration`,
      ],
      answer: 1,
      explanation: `Differentiation: $v = dx/dt$. Going the other direction (velocity → position) requires integration: $x = \\int v\\,dt$.`,
    },
    {
      id: 'p1-ch2-001-q9',
      question: `A car moves east at 20 m/s and decelerates at 4 m/s². After 3 s, which is correct?`,
      options: [
        `Velocity = +8 m/s, still moving east`,
        `Velocity = −12 m/s, now moving west`,
        `Velocity = +20 m/s, unchanged`,
        `Velocity = −8 m/s, now moving west`,
      ],
      answer: 0,
      explanation: `$v = v_0 + at = 20 + (-4)(3) = 20 - 12 = 8$ m/s. Still positive — still moving east. The deceleration hasn't reversed the direction yet.`,
    },
    {
      id: 'p1-ch2-001-q10',
      question: `Which kinematic quantity is always non-negative?`,
      options: [
        `Displacement`,
        `Average velocity`,
        `Distance`,
        `Acceleration`,
      ],
      answer: 2,
      explanation: `Distance is the total path length — always positive. Displacement, velocity, and acceleration are all signed quantities that can be negative.`,
    },
  ],
}

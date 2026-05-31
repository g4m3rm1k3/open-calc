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
      `Before reading on, predict: the car from the hook drives 10 km east, then 4 km west, completing the trip in 30 minutes. Without calculating, estimate the average velocity — is it closer to 2 km/h, 12 km/h, or 28 km/h east? Think about displacement (6 km east) and time (0.5 h) before reading further.`,

      `**Where you are in the story.** Chapter 0 showed you the physicist\'s habit: build a model, make a prediction, test it. Chapter 2 starts that process for motion. Before you can write a single equation of motion, you need a precise language — four quantities that together describe everything an object is doing at every moment: where it is, how much it moved, how fast it moved, and whether its speed is changing. This lesson defines those four quantities carefully. Every kinematics calculation you ever do will use them.`,

      `**Position: putting an object on a number line.** To locate an object, you need three things: a reference point (the origin), a direction for positive, and a number that says how far the object is from the origin in that direction. On a straight road, you might say a car is at $x = 12$ m (12 metres east of your starting point). Position is just a coordinate — a signed number. Negative position means the object is on the other side of the origin. The choice of origin and positive direction is yours to make; physics works the same regardless. But once you choose, you must be consistent throughout the problem.`,

      `**Displacement vs distance: the most important distinction in kinematics.** Displacement $\\Delta x = x_f - x_i$ is the net change in position — a signed vector quantity that tells you how far from where you started you ended up, and in which direction. Distance is the total length of the path you actually travelled, always positive, always $\\geq |\\Delta x|$. The car in the hook drives 14 km but ends up only 6 km east of start: distance = 14 km, displacement = +6 km east. These are different numbers because the car reversed direction. They are equal only when an object moves in a straight line without turning back. The distinction matters because physics equations use displacement — forces cause changes in displacement, not in distance.`,

      `**Average velocity and average speed.** Average velocity $\\bar{v} = \\Delta x / \\Delta t$ is displacement per unit time — a signed scalar. Average speed is distance per unit time — always positive. For the car: average velocity = 6 km / 0.5 h = 12 km/h east; average speed = 14 km / 0.5 h = 28 km/h. Same trip, very different numbers. A car that drives in a perfect circle for one hour has enormous average speed but zero average velocity — it returned to its starting position, so $\\Delta x = 0$. Velocity is what tells you where the object went. Speed only tells you how hard the odometer worked.`,

      `**Acceleration: the rate of change of velocity.** Acceleration $a = \\Delta v / \\Delta t$ measures how quickly velocity is changing. It is also a signed quantity: positive acceleration in the positive-$x$ direction, negative acceleration (deceleration or reversal) in the negative direction. An object can have positive velocity and negative acceleration at the same time — a braking car moving forward is a perfect example. Acceleration and velocity are independent quantities. You cannot tell the acceleration from the velocity alone; you need to see how the velocity is changing.`,

      `**The kinematic chain: the backbone of the course.** Position, velocity, and acceleration are not three separate ideas — they form a chain. Velocity is the rate of change of position. Acceleration is the rate of change of velocity. Algebraically: $\\bar{v} = \\Delta x / \\Delta t$ and $\\bar{a} = \\Delta v / \\Delta t$. With calculus: $v = dx/dt$ and $a = dv/dt = d^2x/dt^2$. Every kinematics problem you encounter is some version of navigating this chain — given information about one quantity, find another.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Three steps to any kinematics problem',
        body: `**Step 1 — Set convention:** Define positive direction and origin before writing a single number. State it explicitly: "positive = east" or "positive = up."\n**Step 2 — List knowns:** Identify which of the five quantities you have (x, Δx, v, a, t) and which you need.\n**Step 3 — Apply the right definition:** Use Δx = x_f − x_i for displacement; v̄ = Δx/Δt for average velocity; ā = Δv/Δt for average acceleration. Check that your answer\'s sign is consistent with your convention.`,
      },
      {
        type: 'sequencing',
        title: 'Lesson 1 of 22 — Chapter 2: Kinematics',
        body: `**Chapter 0 (done):** The physicist\'s toolkit — models, units, graphs, vectors.\n**This lesson:** The four definitions — position, displacement, velocity, acceleration.\n**Lesson 2:** The five SUVAT equations for constant acceleration.\n**Lessons 3–6:** Reading motion graphs (x-t, v-t, a-t).\n**Lessons 12–18:** Free fall — applying everything to gravity.`,
      },
      {
        type: 'definition',
        title: 'Displacement (vector)',
        body: `\\Delta x = x_f - x_i \\qquad \\text{units: m} \\qquad \\text{(signed — encodes direction)}`,
      },
      {
        type: 'definition',
        title: 'Average velocity (vector)',
        body: `\\bar{v} = \\frac{\\Delta x}{\\Delta t} = \\frac{x_f - x_i}{t_f - t_i} \\qquad \\text{units: m/s}`,
      },
      {
        type: 'definition',
        title: 'Average acceleration (vector)',
        body: `\\bar{a} = \\frac{\\Delta v}{\\Delta t} = \\frac{v_f - v_i}{t_f - t_i} \\qquad \\text{units: m/s}^2`,
      },
      {
        type: 'warning',
        title: 'Distance ≠ |Displacement|',
        body: `Distance counts every metre travelled — always positive. Displacement counts only the net change in position — signed. They are equal only if the object never reverses direction. Using one when the other is needed causes wrong answers. Physics equations always use displacement.`,
      },
      {
        type: 'insight',
        title: 'Calculus connection: average → instantaneous',
        body: `Average velocity over $\\Delta t$: $\\bar{v} = \\Delta x / \\Delta t$ — the slope of the secant on the x–t graph. Instantaneous velocity (shrink $\\Delta t \\to 0$): $v(t) = \\lim_{\\Delta t \\to 0}\\frac{\\Delta x}{\\Delta t} = \\frac{dx}{dt}$ — the slope of the tangent. The derivative is not a new idea; it\'s the same ratio taken to its logical limit.`,
      },
    ],
    visualizations: [
      {
        id: 'DisplacementVsDistance',
        title: 'Displacement vs distance — watch the formulas compute live',
        mathBridge: `Start with "One direction" — notice displacement equals distance when the object never reverses. Switch to "Back and forth": the object moves right 9 m, then left 4 m. Distance keeps climbing (adds both legs). Displacement is just x_final − x_0 — it shrinks when the object comes back. Try "Full reversal": the object returns exactly to start, so displacement = 0 even though the distance is 14 m.`,
        caption: `Displacement = x_final − x_initial (one subtraction, signed). Distance = |Δx₁| + |Δx₂| + … (sum of all legs). They are equal only when the object never reverses direction.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'The kinematic chain: position → velocity → acceleration',
        mathBridge: `This diagram shows the mathematical relationships between the four kinematic quantities. Reading left to right: each quantity is the rate of change of the one before it (differentiate = divide by Δt, then shrink Δt to zero). Reading right to left: each quantity is the accumulated sum of the one after it (integrate = multiply by Δt and add up). Every kinematics problem is a navigation of this chain.`,
        caption: `v = dx/dt (slope of x-t graph). a = dv/dt (slope of v-t graph). Reversed by integration: x = ∫v dt.`,
      },
    ],
  },

  math: {
    prose: [
      `In 1D kinematics, direction is encoded entirely by sign. Choosing "positive = right" means moving right gives positive velocity, moving left gives negative velocity. An object can have positive position and negative velocity simultaneously — it is to the right of the origin but moving left. An object can have negative velocity and positive acceleration simultaneously — it is moving left but slowing down (or about to reverse). These combinations are not contradictions; they are everyday physics.`,
      `The five kinematic quantities and their SI units sit at the foundation of every mechanics calculation you will ever do. Treat each one as carrying a physical type — not just a number, but a number with a meaning. Every time you write a kinematic number, ask: is it signed (displacement, velocity, acceleration) or unsigned (distance, speed)?`,
    ],
    keyFormulas: [
      {
        label: 'Displacement',
        formula: `\\Delta x = x_f - x_i`,
        note: `Always final minus initial. Sign encodes direction.`,
      },
      {
        label: 'Average velocity',
        formula: `\\bar{v} = \\frac{\\Delta x}{\\Delta t}`,
        note: `Signed — uses displacement, not distance.`,
      },
      {
        label: 'Average acceleration',
        formula: `\\bar{a} = \\frac{\\Delta v}{\\Delta t} = \\frac{v_f - v_i}{t_f - t_i}`,
        note: `Rate of change of velocity. Independent of position.`,
      },
      {
        label: 'Instantaneous velocity (calculus)',
        formula: `v(t) = \\frac{dx}{dt}`,
        note: `Slope of the x-t graph at a specific instant.`,
      },
      {
        label: 'Instantaneous acceleration (calculus)',
        formula: `a(t) = \\frac{dv}{dt} = \\frac{d^2x}{dt^2}`,
        note: `Second derivative of position. Slope of the v-t graph.`,
      },
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Five kinematic quantities and SI units',
        body: `x\\;[\\text{m}],\\quad \\Delta x\\;[\\text{m}],\\quad v\\;[\\text{m/s}],\\quad a\\;[\\text{m/s}^2],\\quad t\\;[\\text{s}]`,
      },
      {
        type: 'insight',
        title: 'Instantaneous vs average',
        body: `Average velocity = slope of the secant line on an x–t graph over an interval. Instantaneous velocity = slope of the tangent line = $dx/dt$. The secant shrinks to the tangent as $\\Delta t \\to 0$. This is what the derivative *means* geometrically — not a formula to memorize, but a picture of what "instantaneous" means.`,
      },
      {
        type: 'mnemonic',
        title: 'Signs encode direction — never forget this',
        body: `+x: right, up, or forward (your choice of convention). −x: left, down, or backward. State your positive direction at the start of every problem. Physics gives you the same answer regardless of which direction you call positive — as long as you are consistent.`,
      },
    ],
    visualizations: [
      {
        id: 'MotionTracer',
        title: 'Average velocity as slope — reading the x-t graph',
        mathBridge: `Select the "Acceleration" preset (x = t² − 4). The curve bends upward — that curvature IS the acceleration. Now read two points off the curve and compute Δx/Δt — that ratio is the average velocity over that interval. A steeper segment means faster average velocity. A horizontal tangent means velocity = 0 at that instant. A downward-curving segment means negative acceleration.`,
        caption: `Slope of a secant = average velocity. Slope of the tangent = instantaneous velocity = dx/dt. Concavity (which way the curve bends) = sign of acceleration.`,
      },
    ],
  },

  rigor: {
    prose: [
      `Formally, position is a function $x(t): \\mathbb{R} \\to \\mathbb{R}$. Displacement over $[t_1, t_2]$ is $\\Delta x = x(t_2) - x(t_1)$. Distance is $\\int_{t_1}^{t_2} |\\dot{x}(t)|\\,dt$ — the arc length of the trajectory. These are equal only when $\\dot{x}(t)$ does not change sign on the interval, i.e., the object never reverses direction. Average velocity is then $\\bar{v} = \\Delta x / \\Delta t$ and average acceleration is $\\bar{a} = \\Delta v / \\Delta t$, with the instantaneous versions defined by taking the limit as $\\Delta t \\to 0$.`,

      `The kinematic definitions are invariant under choice of origin and positive direction. A change of origin shifts every $x$ by the same constant $c$, so $\\Delta x = x(t_2) - x(t_1)$ is unchanged. Reversing the positive direction flips the sign of every position, velocity, and acceleration simultaneously — but the physical relationships between them (e.g., $v = dx/dt$) remain intact. This invariance is why the choice of convention is free: use whatever makes the algebra simplest, but declare it explicitly at the start. The formal chain $x(t) \\xrightarrow{d/dt} v(t) \\xrightarrow{d/dt} a(t)$ is independent of convention.`,

      `Geometrically, $v(t) = dx/dt$ is the slope of the tangent to the $x(t)$ curve at time $t$, and $a(t) = d^2x/dt^2$ is the signed curvature (concavity). When the x-t curve bends upward, $a > 0$; downward, $a < 0$. A horizontal tangent ($v = 0$) marks the instant the object is momentarily at rest — possibly about to reverse. This geometric reading turns the calculus definitions into something you can see: every kink, slope, and curve on the x-t graph carries a kinematic meaning. A straight line segment (constant slope) means constant velocity and zero acceleration. A parabola means constant acceleration.`,

      `The limit definition $v(t) = \\lim_{\\Delta t \\to 0} \\Delta x / \\Delta t$ is the definition of the derivative applied to position. This connects to three future ideas: (1) SUVAT (lesson 2) — for constant acceleration $a$, integrating $a = dv/dt$ twice with initial conditions gives $x(t) = x_0 + v_0 t + \\frac{1}{2}at^2$. (2) Numerical differentiation — real sensors sample position at discrete times; $\\Delta x / \\Delta t$ with finite $\\Delta t$ is an approximation to $v$ that underlies all digital motion tracking. (3) Euler's method — the reverse chain (given $a(t)$, recover $x(t)$ step by step) is the foundation of computational physics and the orbit integrators used in space mission planning.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Limit definition of instantaneous velocity',
        body: `v(t) = \\lim_{\\Delta t \\to 0} \\frac{x(t+\\Delta t) - x(t)}{\\Delta t} = \\frac{dx}{dt}`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'slope-triangle' },
        title: 'The limit definition: secant collapses to tangent as Δt → 0',
        mathBridge: `The diagram shows a secant (slope = Δx/Δt = average velocity over the interval) alongside the tangent at one point (slope = dx/dt = instantaneous velocity). As you mentally shrink the interval, the secant rotates to match the tangent exactly. This is what the limit definition means geometrically — not a formula to memorize, but a picture of what "instantaneous" means.`,
        caption: `Average velocity → instantaneous velocity as the time interval shrinks to zero. This is the derivative.`,
      },
    ],
  },

  checkpoints: [
    {
      id: 'ch2-001-cp1',
      question: `A runner goes 400 m east then 100 m west. What is the displacement? What is the distance?`,
      answer: `Displacement = +300 m east ($\\Delta x = 400 - 100 = 300$ m). Distance = 500 m (total path). They differ because the runner reversed direction.`,
    },
    {
      id: 'ch2-001-cp2',
      question: `An object moves from $x = 20$ m to $x = -5$ m in 5 s. What is the average velocity?`,
      answer: `$\\bar{v} = \\Delta x / \\Delta t = (-5 - 20)/5 = -25/5 = -5$ m/s. Negative means it moved in the negative-x direction.`,
    },
    {
      id: 'ch2-001-cp3',
      question: `Can an object have a negative velocity and a positive acceleration at the same time? Give an example.`,
      answer: `Yes. A ball thrown downward (negative velocity) but slowing because of air resistance (positive acceleration, opposing motion). Also: a car moving left (negative velocity) that is decelerating — the deceleration is in the positive (rightward) direction.`,
    },
  ],

  examples: [
    {
      id: 'ch2-001-ex1',
      title: 'Displacement vs distance',
      problem: `\\text{A runner goes 400 m east then 150 m west. Find (a) distance, (b) displacement.}`,
      steps: [
        { expression: `\\text{Distance} = 400 + 150 = 550\\,\\text{m}`, annotation: `Total path length — add all segments regardless of direction.` },
        { expression: `\\Delta x = +400 + (-150) = +250\\,\\text{m east}`, annotation: `Displacement — net change, east = positive. Subtract the westward leg.` },
      ],
      conclusion: `Distance 550 m; displacement 250 m east. The runner\'s final position is 250 m east of start — the 150 m westward leg subtracted from the net position.`,
    },
    {
      id: 'ch2-001-ex2',
      title: 'Average velocity',
      problem: `\\text{A car moves from } x_i=20\\,\\text{m to }x_f=80\\,\\text{m in }\\Delta t=4\\,\\text{s. Find }\\bar{v}.`,
      steps: [
        { expression: `\\Delta x = 80 - 20 = 60\\,\\text{m}`, annotation: `Displacement — final minus initial.` },
        { expression: `\\bar{v} = \\frac{60}{4} = 15\\,\\text{m/s}`, annotation: `Average velocity = displacement ÷ time. Positive: moving in the +x direction.` },
      ],
      conclusion: `$\\bar{v} = 15$ m/s in the positive direction.`,
    },
    {
      id: 'ch2-001-ex3',
      title: 'Average acceleration from two velocity readings',
      problem: `\\text{A car slows from } v_i = 30\\,\\text{m/s to } v_f = 10\\,\\text{m/s in } \\Delta t = 4\\,\\text{s. Find average acceleration.}`,
      steps: [
        { expression: `\\Delta v = v_f - v_i = 10 - 30 = -20\\,\\text{m/s}`, annotation: `Change in velocity — always final minus initial. Negative because speed decreased (assuming +x = forward).` },
        { expression: `\\bar{a} = \\frac{-20}{4} = -5\\,\\text{m/s}^2`, annotation: `Negative acceleration — pointing opposite to motion. The car decelerates.` },
      ],
      conclusion: `$\\bar{a} = -5$ m/s². The car is moving forward but accelerating backward — slowing to a stop.`,
    },
  ],

  challenges: [
    {
      id: 'ch2-001-ch1',
      difficulty: 'easy',
      problem: `\\text{Object moves: +8 m, −3 m, +1 m. Find distance and displacement.}`,
      hint: `Distance sums absolute values. Displacement sums signed values.`,
      walkthrough: [
        { expression: `\\text{Distance} = 8+3+1 = 12\\,\\text{m}`, annotation: `Always positive — add magnitudes of each leg.` },
        { expression: `\\Delta x = 8-3+1 = +6\\,\\text{m}`, annotation: `Signs kept — net position change.` },
      ],
      answer: `\\text{Distance}=12\\,\\text{m},\\quad \\Delta x = +6\\,\\text{m}`,
    },
    {
      id: 'ch2-001-ch2',
      difficulty: 'medium',
      problem: `\\text{A ball moves from }x=5\\,\\text{m to }x=-3\\,\\text{m in 2 s. Find }\\bar{v}\\text{ and average speed if path length = 10 m.}`,
      hint: `Displacement can be negative; speed cannot.`,
      walkthrough: [
        { expression: `\\Delta x = -3 - 5 = -8\\,\\text{m}`, annotation: `Displacement is negative (moved in −x direction).` },
        { expression: `\\bar{v} = -8/2 = -4\\,\\text{m/s}`, annotation: `Negative velocity means moving in −x direction.` },
        { expression: `\\text{avg speed} = 10/2 = 5\\,\\text{m/s}`, annotation: `Speed uses total path length — always positive.` },
      ],
      answer: `\\bar{v} = -4\\,\\text{m/s},\\quad \\text{avg speed} = 5\\,\\text{m/s}`,
    },
    {
      id: 'ch2-001-ch3',
      difficulty: 'hard',
      problem: `\\text{An object\'s position is } x(t) = t^2 - 6t + 5\\text{ m (}t\\text{ in seconds). Find: (a) instantaneous velocity at }t=1\\text{ s and }t=4\\text{ s; (b) the time when velocity is zero; (c) displacement from }t=0\\text{ to }t=6\\text{ s.}`,
      hint: `Differentiate x(t) to get v(t). Set v = 0 to find when the object reverses direction.`,
      walkthrough: [
        { expression: `v(t) = \\frac{dx}{dt} = 2t - 6`, annotation: `Differentiate: power rule on each term. This is the instantaneous velocity function.` },
        { expression: `v(1) = 2(1)-6 = -4\\,\\text{m/s};\\quad v(4) = 2(4)-6 = +2\\,\\text{m/s}`, annotation: `Negative at t=1 s (moving in −x direction); positive at t=4 s (reversed). The object reversed direction somewhere between t=1 s and t=4 s.` },
        { expression: `v(t)=0: \\quad 2t-6=0 \\implies t=3\\,\\text{s}`, annotation: `Object is momentarily at rest at t = 3 s — the turning point.` },
        { expression: `x(0) = 0-0+5 = 5\\,\\text{m};\\quad x(6) = 36-36+5 = 5\\,\\text{m}`, annotation: `Evaluate position at both endpoints.` },
        { expression: `\\Delta x = x(6)-x(0) = 5-5 = 0\\,\\text{m}`, annotation: `Displacement is zero — the object returns exactly to its starting position! Distance is not zero; it reversed direction at t=3 s.` },
      ],
      answer: `v(1)=-4\\,\\text{m/s},\\;v(4)=+2\\,\\text{m/s};\\;t=3\\,\\text{s (reversal)};\\;\\Delta x=0\\,\\text{m}`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Displacement vs distance',
          type: 'code',
          language: 'python',
          code: `import numpy as np

# Runner: 400 m east, 150 m west
# Convention: east = positive x direction
positions = np.array([0, 400, 250])  # [start, turnaround, finish] in metres
times     = np.array([0,  40,  60])  # corresponding times in seconds

# Displacement = x_final - x_initial (one subtraction, signed)
displacement = positions[-1] - positions[0]

# Distance = sum of absolute leg lengths (always positive)
legs     = np.abs(np.diff(positions))
distance = legs.sum()

# Average velocity and average speed
total_time   = times[-1] - times[0]
avg_velocity = displacement / total_time   # signed: encodes direction
avg_speed    = distance    / total_time   # always positive

print(f"Displacement     : {displacement} m")
print(f"Distance         : {distance} m")
print(f"Avg velocity     : {avg_velocity:.2f} m/s")
print(f"Avg speed        : {avg_speed:.2f} m/s")
print(f"dist >= |displ|  : {distance >= abs(displacement)}")`,
          prose: [
            `\`positions[-1] - positions[0]\` implements $\\Delta x = x_f - x_i$ — one subtraction gives a signed result. East = positive, so the westward leg makes displacement smaller than distance.`,
            `\`np.diff(positions)\` computes each step; \`np.abs(...)\` removes direction; \`.sum()\` adds every metre of path regardless of direction. That sum is *distance*, always positive.`,
            `Average velocity divides the *signed* displacement by time ($\\bar{v} = \\Delta x / \\Delta t$); average speed divides the *total path* by time. A car that circles back has zero average velocity but large average speed — these two lines show that distinction numerically.`,
          ],
        },
        {
          cellTitle: 'Visualizing the x-t graph and reading slopes',
          type: 'code',
          language: 'python',
          code: `import matplotlib.pyplot as plt
import numpy as np

t = np.array([0, 40, 60])
x = np.array([0, 400, 250])

# Slope of each segment = average velocity over that interval
v1 = (x[1]-x[0]) / (t[1]-t[0])   # eastward leg
v2 = (x[2]-x[1]) / (t[2]-t[1])   # westward leg

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(t, x, 'b-o', linewidth=2, markersize=8)
ax.annotate(f'slope = {v1} m/s\\n(eastward)', xy=(20, 200),
            fontsize=10, color='green')
ax.annotate(f'slope = {v2} m/s\\n(westward)', xy=(50, 320),
            fontsize=10, color='red')
ax.axhline(0, color='gray', linewidth=0.5)
ax.set(xlabel='Time (s)', ylabel='Position (m)',
       title='Position–Time Graph')
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('xt_graph.png', dpi=100, bbox_inches='tight')
plt.show()

print(f"Segment 1 avg velocity: {v1} m/s  (positive = eastward)")
print(f"Segment 2 avg velocity: {v2} m/s  (negative = westward)")`,
          prose: [
            `The slope formula $\\Delta x / \\Delta t$ is applied to each line segment: rise (change in position) divided by run (change in time). Positive slope = moving in the +x direction; negative slope = moving in the −x direction. This is what "slope = velocity" means on an x-t graph.`,
            `The x-coordinate at $t = 60$ s (250 m) is the *final position*, not the peak. The peak at $t = 40$ s is where direction reversed — the slope changes sign there.`,
            `This graph embeds all five kinematic quantities: $x$ (y-axis value), $\\Delta x$ (vertical change), $\\Delta t$ (horizontal span), $\\bar{v}$ (slope of each segment), and $a$ (curvature — zero here since each segment is linear). A parabola on this graph would mean constant non-zero acceleration.`,
          ],
        },
        {
          cellTitle: 'Average acceleration and the v-t graph',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

v_i = 30.0   # m/s  initial velocity
v_f = 10.0   # m/s  final velocity (car slowing down)
dt  = 4.0    # s    time interval

delta_v = v_f - v_i               # always final minus initial
avg_acc  = delta_v / dt

print(f"Delta v           = {delta_v} m/s  (negative = velocity decreased)")
print(f"Average accel     = {avg_acc:.2f} m/s²")
print()

# v-t graph for constant deceleration
t_range = np.linspace(0, dt, 100)
v_range = v_i + avg_acc * t_range   # v(t) = v_i + a*t

fig, ax = plt.subplots(figsize=(7, 3))
ax.plot(t_range, v_range, 'r-', linewidth=2.5)
ax.fill_between(t_range, 0, v_range, alpha=0.15, color='red',
                label='area = displacement')
ax.axhline(0, color='gray', linewidth=0.8)
ax.annotate(f'slope = {avg_acc:.1f} m/s²', xy=(1.5, 18),
            fontsize=10, color='darkred')
ax.set(xlabel='Time (s)', ylabel='Velocity (m/s)',
       title='Velocity–Time Graph (constant deceleration)')
ax.legend(); ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('vt_decel.png', dpi=100, bbox_inches='tight')
plt.show()

# Area under v-t = displacement
disp_val = 0.5 * (v_i + v_f) * dt
print(f"Displacement (area under v-t) = {disp_val} m")`,
          prose: [
            `\`delta_v = v_f - v_i\` mirrors the displacement formula — always final minus initial, same sign convention. Negative means velocity decreased: the car is slowing while moving in the +x direction.`,
            `The slope of the v-t graph is average acceleration: $\\bar{a} = \\Delta v / \\Delta t$. On this graph that slope is −5 m/s² — the same value we computed. Every 1 second, velocity drops by 5 m/s.`,
            `The shaded area under the v-t curve equals displacement: $\\Delta x = \\frac{1}{2}(v_i + v_f)\\Delta t = 80$ m. This bridges to the SUVAT equations in lesson 2 — the area interpretation turns the v-t graph into a displacement calculator.`,
          ],
        },
        {
          cellTitle: 'Challenge — analyze a sensor motion dataset',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np
import matplotlib.pyplot as plt

# Sensor records position every 0.5 s
t_data = np.array([0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0])
x_data = np.array([0.0, 1.2, 2.1, 2.5, 2.2, 1.6, 2.8])

# TODO: Compute and print:
#   1. total displacement  (x_final - x_initial)
#   2. total distance      (sum of |Δx| for each step)
#   3. average velocity    (displacement / total time)
#   4. velocity at each step  (Δx/Δt for each adjacent pair)
#   5. average acceleration   (Δv over full interval / total time)
#
# BONUS: plot x vs t and v vs t side by side`,
          prose: [
            `\`np.diff(x_data)\` gives the array $[x_1-x_0,\\; x_2-x_1,\\; \\ldots]$ — all the $\\Delta x$ steps at once. Distance takes absolute values before summing: \`np.abs(np.diff(x_data)).sum()\`. This is the programmatic version of $d = \\sum |\\Delta x_i|$.`,
            `The velocity at each step is \`np.diff(x_data) / np.diff(t_data)\` — element-wise division gives the average velocity over each 0.5 s interval. Note the result has one fewer element than the original arrays: this is a fundamental limit of discrete sampling.`,
            `For part 5, average acceleration = change in velocity over the full interval / total time: $\\bar{a} = (v_{last} - v_{first}) / (t_{last} - t_{first})$. The velocity array from step 4 gives you $v_{first}$ and $v_{last}$.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Displacement vs distance',
          type: 'code',
          language: 'matlab',
          code: `% Runner: 400 m east, 150 m west
% Convention: east = positive x direction
positions = [0, 400, 250];   % [start, turnaround, finish] metres
times     = [0, 40,  60 ];   % corresponding times in seconds

% Displacement = x_final - x_initial (signed)
displacement = positions(end) - positions(1);

% Distance = sum of absolute leg lengths
legs     = abs(diff(positions));
distance = sum(legs);

% Average velocity and average speed
total_time   = times(end) - times(1);
avg_velocity = displacement / total_time;   % signed
avg_speed    = distance    / total_time;   % always positive

fprintf('Displacement     : %.1f m\\n', displacement)
fprintf('Distance         : %.1f m\\n', distance)
fprintf('Avg velocity     : %.2f m/s\\n', avg_velocity)
fprintf('Avg speed        : %.2f m/s\\n', avg_speed)
fprintf('dist >= |displ|  : %d\\n', distance >= abs(displacement))`,
          prose: [
            `\`positions(end) - positions(1)\` is MATLAB\'s version of $\\Delta x = x_f - x_i$. Note MATLAB uses 1-based indexing: \`positions(1)\` is the first element, \`positions(end)\` is the last.`,
            `\`diff(positions)\` computes element-wise differences (same as NumPy\'s \`np.diff\`); \`abs(...)\` removes sign; \`sum(...)\` adds all legs. The distance inequality $d \\geq |\\Delta x|$ prints as 1 (true) regardless of the path.`,
            `The variables \`avg_velocity\` and \`avg_speed\` implement the two formulas from the lesson: $\\bar{v} = \\Delta x / \\Delta t$ and $\\bar{s} = d / \\Delta t$. The numerical difference between them reflects how far the object deviated from a straight-line path.`,
          ],
        },
        {
          cellTitle: 'Plotting the x-t graph and reading slopes',
          type: 'code',
          language: 'matlab',
          code: `t = [0, 40, 60];
x = [0, 400, 250];

% Slope of each segment = average velocity
v1 = (x(2)-x(1)) / (t(2)-t(1));
v2 = (x(3)-x(2)) / (t(3)-t(2));

figure; hold on
plot(t, x, 'b-o', 'LineWidth', 2, 'MarkerSize', 8)
text(20, 200, sprintf('slope = %.0f m/s', v1), ...
    'Color', [0 0.6 0], 'FontSize', 10)
text(50, 320, sprintf('slope = %.0f m/s', v2), ...
    'Color', [0.8 0 0], 'FontSize', 10)
yline(0, 'Color', [0.7 0.7 0.7])
xlabel('Time (s)'); ylabel('Position (m)')
title('Position–Time Graph')
grid on

fprintf('Segment 1 avg velocity: %.0f m/s\\n', v1)
fprintf('Segment 2 avg velocity: %.0f m/s\\n', v2)`,
          prose: [
            `\`(x(2)-x(1))/(t(2)-t(1))\` is the slope formula $\\Delta x / \\Delta t$ applied manually to each segment. Segment 1 has slope +10 m/s (eastward); segment 2 has slope −7.5 m/s (westward). The sign of the slope directly encodes direction.`,
            `MATLAB\'s \`text()\` places annotations at specific (t, x) coordinates. Reading slope annotations alongside the graph reinforces the connection: "slope of x-t" is not an abstract concept — it is the number you can compute from any two points on the line.`,
            `The direction reversal is visible as the "peak" in the graph where the slope changes sign. This is the point $t = 40$ s where the runner turned around — velocity went from +10 to −7.5 m/s instantly (an idealization of the actual smooth turn).`,
          ],
        },
        {
          cellTitle: 'Average acceleration and displacement from v-t area',
          type: 'code',
          language: 'matlab',
          code: `v_i = 30.0;   % m/s initial velocity
v_f = 10.0;   % m/s final velocity
dt  = 4.0;    % s   time interval

delta_v  = v_f - v_i;            % always final minus initial
avg_acc  = delta_v / dt;

fprintf('Delta v          = %.1f m/s\\n', delta_v)
fprintf('Average accel    = %.2f m/s^2\\n', avg_acc)

% v-t graph for constant deceleration
t_range = linspace(0, dt, 100);
v_range = v_i + avg_acc * t_range;

figure; hold on
plot(t_range, v_range, 'r-', 'LineWidth', 2.5)
fill([t_range, fliplr(t_range)], [v_range, zeros(1,100)], ...
    'r', 'FaceAlpha', 0.15, 'EdgeColor', 'none')
yline(0, 'Color', [0.5 0.5 0.5])
text(1.5, 18, sprintf('slope = %.1f m/s^2', avg_acc), ...
    'Color', [0.7 0 0], 'FontSize', 10)
xlabel('Time (s)'); ylabel('Velocity (m/s)')
title('Velocity–Time Graph (constant deceleration)')
grid on

disp_val = 0.5 * (v_i + v_f) * dt;
fprintf('Displacement (area under v-t) = %.1f m\\n', disp_val)`,
          prose: [
            `\`delta_v = v_f - v_i\` uses the same pattern as displacement: always final minus initial. Here $\\Delta v = -20$ m/s — the velocity decreased by 20 m/s. Average acceleration $= \\Delta v / \\Delta t = -5$ m/s².`,
            `\`v_range = v_i + avg_acc * t_range\` generates points on the line $v(t) = v_i + at$. This is the first SUVAT equation — you\'re already using it before lesson 2 formally introduces it.`,
            `The \`fill\` command shades the area under the v-t curve. That area = $\\frac{1}{2}(v_i + v_f)\\Delta t = 80$ m — the displacement. The v-t graph is a displacement calculator: every geometry problem on the graph has a kinematic meaning.`,
          ],
        },
        {
          cellTitle: 'Challenge — analyze sensor motion data',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% Sensor records position every 0.5 s
t_data = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
x_data = [0.0, 1.2, 2.1, 2.5, 2.2, 1.6, 2.8];

% TODO: Compute and print:
%   1. total displacement  (x_data(end) - x_data(1))
%   2. total distance      (sum(abs(diff(x_data))))
%   3. average velocity    (displacement / total time)
%   4. velocity at each step  (diff(x_data) ./ diff(t_data))
%   5. average acceleration   (delta_v_total / total_time)
%
% BONUS: subplot(1,2,1) for x vs t, subplot(1,2,2) for v vs t`,
          prose: [
            `\`diff(x_data)\` in MATLAB works identically to Python\'s \`np.diff\` — it returns an array of consecutive differences. Use element-wise division \`./\` (not \`/\`) when dividing two arrays: \`diff(x_data) ./ diff(t_data)\`.`,
            `The result of step 4 (velocity array) has 6 elements for 7 position readings — one fewer, because each velocity is defined between two position samples. This is a property of discrete sampling: you can\'t know velocity at a single instant, only over an interval.`,
            `For the average acceleration, take the first and last elements of the velocity array: \`v_arr(end) - v_arr(1)\`, then divide by total time. Compare this to computing $\\bar{a} = \\Delta v / \\Delta t$ directly from the definition.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch2-001-q1',
      type: 'choice',
      question: `A cyclist rides 6 km north, then 2 km south. What is the displacement?`,
      options: [
        `8 km north`,
        `4 km north`,
        `4 km south`,
        `8 km (no direction)`,
      ],
      answer: `4 km north`,
      hints: [
        `Displacement is final position minus initial position, with direction.`,
        `North = positive; the 2 km southward leg subtracts from the net position.`,
      ],
      reviewSection: `intuition`,
      explanation: `Displacement = final position − initial position = 6 − 2 = 4 km north. Distance (total path length) is 8 km. Displacement is a vector (signed); distance is a scalar (always positive).`,
    },
    {
      id: 'p1-ch2-001-q2',
      type: 'choice',
      question: `Which statement about distance and displacement is always true?`,
      options: [
        `Distance = |displacement|`,
        `Distance ≥ |displacement|`,
        `Distance < displacement`,
        `They are always equal`,
      ],
      answer: `Distance ≥ |displacement|`,
      hints: [
        `Think about what happens to each quantity when the object reverses direction.`,
        `They are equal only when the object never turns back.`,
      ],
      reviewSection: `intuition`,
      explanation: `Distance ≥ |displacement| always. They are equal only when the object moves in one direction without reversing. When the object reverses, distance grows while displacement can shrink.`,
    },
    {
      id: 'p1-ch2-001-q3',
      type: 'choice',
      question: `An object moves from $x = 20$ m to $x = 5$ m in 3 s. What is its average velocity?`,
      options: [
        `$+5$ m/s`,
        `$-5$ m/s`,
        `$+8.3$ m/s`,
        `$-8.3$ m/s`,
      ],
      answer: `$-5$ m/s`,
      hints: [
        `Displacement = final minus initial: $x_f - x_i = 5 - 20 = ?$`,
        `A smaller final position means the object moved in the negative direction.`,
      ],
      reviewSection: `intuition`,
      explanation: `$\\bar{v} = \\Delta x / \\Delta t = (5 - 20)/3 = -15/3 = -5$ m/s. Negative means moving in the negative-$x$ direction.`,
    },
    {
      id: 'p1-ch2-001-q4',
      type: 'choice',
      question: `What is the difference between average velocity and average speed?`,
      options: [
        `They are the same thing with different names`,
        `Average velocity uses displacement (signed); average speed uses total distance (positive)`,
        `Average speed uses displacement; average velocity uses total distance`,
        `Average velocity is always larger`,
      ],
      answer: `Average velocity uses displacement (signed); average speed uses total distance (positive)`,
      hints: [
        `Think of a round trip: you return to the start. What is the displacement? What is the distance?`,
        `Average velocity can be negative; average speed cannot.`,
      ],
      reviewSection: `intuition`,
      explanation: `Average velocity = displacement ÷ time (signed, can be negative). Average speed = distance ÷ time (always positive). Average speed ≥ |average velocity| always.`,
    },
    {
      id: 'p1-ch2-001-q5',
      type: 'choice',
      question: `What does the slope of a position–time ($x$–$t$) graph represent?`,
      options: [
        `Acceleration`,
        `Distance`,
        `Velocity`,
        `Displacement`,
      ],
      answer: `Velocity`,
      hints: [
        `Slope = rise / run. On an x-t graph, rise is $\\Delta x$ and run is $\\Delta t$.`,
        `$\\Delta x / \\Delta t$ is the definition of which kinematic quantity?`,
      ],
      reviewSection: `math`,
      explanation: `Slope = rise/run = Δx/Δt = average velocity over an interval. The slope of the tangent at any point equals the instantaneous velocity dx/dt.`,
    },
    {
      id: 'p1-ch2-001-q6',
      type: 'choice',
      question: `An object starts at rest and reaches $v = 12$ m/s in 4 s. What is the average acceleration?`,
      options: [
        `48 m/s²`,
        `$0.33$ m/s²`,
        `$3$ m/s²`,
        `$16$ m/s²`,
      ],
      answer: `$3$ m/s²`,
      hints: [
        `Average acceleration = $\\Delta v / \\Delta t$. What is $\\Delta v$ here?`,
        `"Starts at rest" means $v_i = 0$.`,
      ],
      reviewSection: `math`,
      explanation: `$\\bar{a} = \\Delta v / \\Delta t = (12 - 0)/4 = 3$ m/s².`,
    },
    {
      id: 'p1-ch2-001-q7',
      type: 'choice',
      question: `Instantaneous velocity is defined as:`,
      options: [
        `$\\Delta x / \\Delta t$ for a large time interval`,
        `$\\lim_{\\Delta t \\to 0} \\Delta x / \\Delta t = dx/dt$`,
        `The average velocity over the whole trip`,
        `Speed in the positive direction`,
      ],
      answer: `$\\lim_{\\Delta t \\to 0} \\Delta x / \\Delta t = dx/dt$`,
      hints: [
        `Think about what happens to the average velocity as the time interval becomes infinitesimally small.`,
        `The secant line on an x-t graph becomes the tangent as the interval shrinks to zero.`,
      ],
      reviewSection: `rigor`,
      explanation: `Instantaneous velocity is the derivative of position: $v(t) = \\lim_{\\Delta t \\to 0} \\frac{\\Delta x}{\\Delta t} = \\frac{dx}{dt}$. It is the slope of the tangent to the $x(t)$ curve at a specific instant.`,
    },
    {
      id: 'p1-ch2-001-q8',
      type: 'choice',
      question: `In the kinematic chain, what operation takes you from position to velocity?`,
      options: [
        `Integration with respect to time`,
        `Differentiation with respect to time`,
        `Multiplication by time`,
        `Division by acceleration`,
      ],
      answer: `Differentiation with respect to time`,
      hints: [
        `$v = dx/dt$ — what mathematical operation is $d/dt$?`,
        `Going the reverse direction (velocity → position) would use the opposite operation.`,
      ],
      reviewSection: `rigor`,
      explanation: `Differentiation: $v = dx/dt$. Going the other direction (velocity → position) requires integration: $x = \\int v\\,dt$.`,
    },
    {
      id: 'p1-ch2-001-q9',
      type: 'choice',
      question: `A car moves east at 20 m/s and decelerates at 4 m/s². After 3 s, which is correct?`,
      options: [
        `Velocity = +8 m/s, still moving east`,
        `Velocity = −12 m/s, now moving west`,
        `Velocity = +20 m/s, unchanged`,
        `Velocity = −8 m/s, now moving west`,
      ],
      answer: `Velocity = +8 m/s, still moving east`,
      hints: [
        `Deceleration means acceleration opposes motion. East = positive, so $a = -4$ m/s².`,
        `Compute $v = v_0 + at = 20 + (-4)(3)$. Is the result positive or negative?`,
      ],
      reviewSection: `examples`,
      explanation: `$v = v_0 + at = 20 + (-4)(3) = 20 - 12 = 8$ m/s. Still positive — still moving east. The deceleration hasn\'t reversed the direction yet.`,
    },
    {
      id: 'p1-ch2-001-q10',
      type: 'choice',
      question: `Which kinematic quantity is always non-negative?`,
      options: [
        `Displacement`,
        `Average velocity`,
        `Distance`,
        `Acceleration`,
      ],
      answer: `Distance`,
      hints: [
        `Which quantity counts every metre of the path, regardless of direction?`,
        `Signed quantities (displacement, velocity, acceleration) can all be negative.`,
      ],
      reviewSection: `intuition`,
      explanation: `Distance is the total path length — always positive. Displacement, velocity, and acceleration are all signed quantities that can be negative.`,
    },
  ],

  misconceptions: [
    {
      id: 'ch2-001-m1',
      myth: `Negative velocity means the object is decelerating.`,
      reality: `Negative velocity means the object is moving in the negative direction. Deceleration means speed (magnitude of velocity) is decreasing. These are independent. An object can have negative velocity and positive acceleration simultaneously — it\'s moving in the −x direction but slowing down, meaning the acceleration points in the +x direction.`,
      correctionExample: `$v_0 = -10$ m/s, $a = +2$ m/s²: the object moves left but decelerates. After 5 s: $v = -10 + 2(5) = 0$ m/s. It stops. After 6 s: $v = +2$ m/s — it reverses and moves right. Negative velocity + positive acceleration = slowing down in the −x direction, not speeding up.`,
    },
    {
      id: 'ch2-001-m2',
      myth: `Displacement and distance are the same quantity — both measure "how far" the object moved.`,
      reality: `Distance counts every metre of path traversed, always positive. Displacement is the net change in position, signed. A runner who completes one full lap of a 400 m track has distance = 400 m but displacement = 0 m. Physics equations use displacement, not distance — Newton\'s second law, SUVAT, and kinetic energy all involve displacement or velocity (which is based on displacement).`,
      correctionExample: `Car drives 10 km east, 10 km west: distance = 20 km, displacement = 0 km. Average speed = 20 km / time; average velocity = 0 km / time = 0. These are not rounding errors — they are genuinely different quantities describing different aspects of the same trip.`,
    },
  ],

  transferPrompts: [
    `A GPS app shows your phone has recorded 15.2 km of travel. Can you tell from this number alone whether you\'ve returned to where you started? What additional information would you need, and which kinematic quantity would answer that question?`,
    `The derivative $v = dx/dt$ requires $x(t)$ to be differentiable. What would it mean physically for position to be non-differentiable at a point? Sketch an x-t graph with a corner (a sharp kink). What happens to instantaneous velocity at that corner, and what kind of physical event would create it?`,
  ],

  debugging: [
    {
      id: 'ch2-001-d1',
      buggyWork: `A student writes: "The car went 10 km east and 10 km west, so displacement = 20 km."`,
      question: `What is wrong? Fix the calculation.`,
      answer: `The student added the magnitudes (distances) instead of computing the signed change in position. Displacement = $x_f - x_i = 0 - 0 = 0$ km — the car returned to its starting point, so the net change is zero. Distance = 20 km (total path length). The error is using distance arithmetic ($10 + 10$) instead of displacement arithmetic ($\\Delta x = x_f - x_i$).`,
    },
    {
      id: 'ch2-001-d2',
      buggyWork: `A student has position readings $x_1 = 80$ m at $t_1 = 0$ s and $x_2 = 60$ m at $t_2 = 1$ s, and computes average velocity as $(80 + 60)/2 = 70$ m/s.`,
      question: `Identify all errors.`,
      answer: `Two errors: (1) The student averaged the positions instead of computing displacement: correct is $\\Delta x = x_2 - x_1 = 60 - 80 = -20$ m, then $\\bar{v} = -20 / 1 = -20$ m/s (negative — moving in the −x direction). (2) Averaging positions makes no physical sense — if the object had been at 80 m and 60 m, any intermediate value between them is possible depending on the path. Average velocity is displacement divided by time, not the midpoint of two positions.`,
    },
  ],

  mastery: {
    targetLevel: `You can correctly identify and compute all five kinematic quantities from any problem description, and explain the distinction between distance/displacement and speed/velocity with a concrete example.`,
    coreSkill: `Computing displacement ($\\Delta x = x_f - x_i$), average velocity ($\\bar{v} = \\Delta x / \\Delta t$), and average acceleration ($\\bar{a} = \\Delta v / \\Delta t$) with correct signs — and interpreting what each sign means physically.`,
    commonSticking: `Confusing distance with displacement (adding magnitudes instead of computing $x_f - x_i$), or assuming negative velocity means decelerating.`,
    connections: [
      `Lesson 2 (SUVAT equations) builds directly on these definitions for the constant-acceleration case.`,
      `Lessons 3–6 translate all five quantities to slopes and areas on x-t, v-t, and a-t graphs.`,
      `Calculus 1: the derivative $dx/dt$ formalizes instantaneous velocity; integration $\\int a\\,dt$ recovers velocity from acceleration.`,
    ],
  },

  semantics: {
    core: [
      { symbol: `x`, meaning: `Position — signed coordinate measured from the chosen origin, in metres` },
      { symbol: `\\Delta x`, meaning: `Displacement — signed change in position, $x_f - x_i$; encodes direction` },
      { symbol: `\\bar{v}`, meaning: `Average velocity — displacement divided by elapsed time, m/s; can be negative` },
      { symbol: `\\bar{a}`, meaning: `Average acceleration — change in velocity divided by elapsed time, m/s²; independent of position` },
      { symbol: `dx/dt`, meaning: `Instantaneous velocity — limit of $\\Delta x / \\Delta t$ as $\\Delta t \\to 0$; slope of the tangent on the x-t graph` },
    ],
    rulesOfThumb: [
      `Always declare the positive direction before writing any numbers. Physics gives the same answer regardless of choice — inconsistency gives the wrong answer.`,
      `Distance ≥ |displacement| always. Equality holds only when the object never reverses direction.`,
      `Negative velocity means moving in the negative direction. It does not mean decelerating.`,
      `Slope of the x-t graph = velocity. Slope of the v-t graph = acceleration. Curvature of x-t = sign of acceleration.`,
      `The kinematic chain runs position → differentiate → velocity → differentiate → acceleration. Reverse it with integration.`,
    ],
  },
}

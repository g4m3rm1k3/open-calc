export default {
  id: 'p0-007',
  slug: 'coordinate-systems',
  chapter: 'p0',
  order: 6,
  title: 'Coordinate Systems and Sign Conventions',
  subtitle: 'Choosing your reference frame — and why the choice matters for every equation you write.',
  tags: ['coordinate system', 'reference frame', 'sign convention', 'origin', 'positive direction', 'free fall', '1D', '2D', 'x-y axes'],

  hook: {
    question:
      'You throw a ball straight up. Textbook A defines "up" as positive. The ball rises: position increases. Textbook B defines "down" as positive. The ball rises: position decreases. Both descriptions are correct. Both give the same physical prediction. But the equations look completely different. How can two contradictory sets of equations both be right?And why does it matter — if both are right — which one you choose?',
    realWorldContext:
      'GPS uses a coordinate system where (0,0,0) is the Earth\'s center. Aviation uses a system where altitude is measured up from sea level. Video game physics engines use y-down coordinates (screen coordinates). Structural engineers use a coordinate system aligned with the beam. The coordinate system is a choice — but once chosen, every equation in the problem must use it consistently. Most physics errors in beginning students come not from the wrong equationbut from inconsistent sign conventions within the same problem.',
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'free-fall-axes' },
  },

  intuition: {
    prose: [
      '**A coordinate system is an agreement, not a fact. **A coordinate system specifies:(1) An **origin** — the reference point (where x = 0).(2) A **positive direction** for each axis. The physics does not care which choice you make. The ball will follow the same trajectory whether you measure up from the flooror down from the ceiling. But *you* must be consistent: once you choose, every quantity in the problemmust be measured in the same system.',

      '**The standard 1D sign convention for free fall. **Most physics problems use:origin = initial position of the object,positive = upward. Under this convention:initial position \\(x_0 = 0\\),gravity gives acceleration \\(a = -9.8\\) m/s² (negative because it acts downward). If you throw a ball up with \\(v_0 = +15\\) m/s, it rises (positive \\(x\\))then falls (negative going below the origin). The minus sign in front of 9.8 is the sign convention doing its job.',

      '**What changes when you flip the convention. **Flip to positive-downward:now \\(a = +9.8\\) m/s² (positive, because gravity and positive direction agree). A ball thrown upward has \\(v_0 = -15\\) m/s (negative, opposing positive direction). The equations look different. The numbers are different. But if you solve them correctly, the answer (time to land, max height) is identical. Sign convention is a coordinate choice, not a physical fact.',

      '**2D coordinate systems — the x-y plane. **In 2D, you have two axes. Standard physics convention:x = horizontal (rightward positive), y = vertical (upward positive). But problems involving inclined planes often align one axis with the incline — this reduces a 2D problem to 1D along the slope and 1D perpendicular to it. The ability to choose the coordinate system that makes the problem easiest is a skill. The right choice can turn a messy problem into a clean one.',

      '**The golden rule: state your convention, then enforce it everywhere. **At the start of every problem: draw a diagram, mark the origin, mark the positive direction. Every velocity, every displacement, every acceleration must be assigned a signconsistent with that diagram. Read the final answer\'s sign carefully: if you get negative position,it means the object is below/behind/to-the-left of your origin — not that something went wrong.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 7 of 8 — Chapter 0: Orientation',
        body:
          '**Previous (Lesson 6):** Vectors vs scalars — direction, components, adding vectors.\\n**This lesson:** Coordinate systems — origin, positive direction, sign conventions.\\n**Next (Lesson 8):** Algebra vs calculus — when to use each, how they connect.\\n**Why it matters:** Every kinematics problem starts with a coordinate system. Getting this wrong breaks every equation.',
      },
      {
        type: 'definition',
        title: 'A coordinate system requires',
        body:
          '\\text{1. Origin: the reference point (where } x = 0, y = 0\\text{).}\\\\\\text{2. Positive direction for each axis.}\\\\\\text{3. Consistent sign assignment for all quantities in the problem.}',
      },
      {
        type: 'insight',
        title: 'Standard sign convention for vertical 1D problems',
        body:
          '\\text{Positive = upward (most common in textbooks).}\\\\a = -g = -9.8\\,\\text{m/s}^2 \\quad (\\text{gravity acts downward})\\\\\\text{A thrown-up ball: } v_0 > 0, \\text{ decelerates to 0, then } v < 0 \\text{ on the way down.}',
      },
      {
        type: 'warning',
        title: 'The most common sign error',
        body:
          '\\text{Writing } a = +9.8 \\text{ m/s}^2 \\text{ when you\'ve defined upward as positive.}\\\\\\text{Gravity acts downward — if upward is positive, gravity is negative.}\\\\\\text{The sign of g is part of the sign convention, not a physical absolute.}',
      },
      {
        type: 'insight',
        title: 'When to use non-standard coordinates',
        body:
          '\\text{Inclined plane: align one axis with the incline (along the slope).}\\\\\\text{This makes the normal force perpendicular to the axis (no component along the slope).}\\\\\\text{It simplifies: one component of gravity is }-mg\\sin\\theta\\text{ (along slope); one is }-mg\\cos\\theta\\text{ (normal).}\\\\\\text{The right coordinate system can eliminate an entire component of a vector.}',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-fall-axes' },
        title: 'Vertical axis with sign convention for free fall',
        mathBridge:
          'The diagram shows both conventions side by side. Left: upward positive (standard). Right: downward positive (alternative). Notice: the value of g changes sign between them. Cover one side and solve a problem. Then solve with the other convention. Compare: the physical answers (time, height) are identical.',
        caption: 'Two conventions, one physics. The sign of g flips when you flip the positive direction.',
      },
      {
        id: 'SignConventionExplorer',
        title: 'Interactive sign convention — flip the axis, move the origin, watch the equations change',
        mathBridge:
          'A ball is thrown upward at 15 m/s. Toggle between "Upward +" and "Downward +" using the buttons. Watch: a flips from −9.8 to +9.8. v₀ flips sign. x₀ and x(t) change when you move the origin. But the blue ball\'s arc never changes — it follows the same physical path regardless of your labels. Drag the origin up to the peak: x₀ becomes negative (you are below the peak), and x(t) at the peak is zero. This is exactly what "the coordinate system is arbitrary" means.',
        caption: 'Two conventions, one trajectory. Every number changes when you change the convention — the physics does not.',
      },
    ],
  },

  math: {
    prose: [
      '**Applying sign conventions in SUVAT problems. **A ball thrown upward from ground level (\\(x_0 = 0\\)) at \\(v_0 = 20\\) m/s,with upward positive (\\(a = -9.8\\) m/s²):\\(x(t) = 20t - 4.9t^2\\). At \\(t = 3\\) s: \\(x = 60 - 44.1 = 15.9\\) m. Positive — still above origin. At \\(t = 5\\) s: \\(x = 100 - 122.5 = -22.5\\) m. Negative — below origin (underground, i.e., the ball has already hit the ground). The sign tells you everything.',
      '**Finding max height — when v = 0. **Maximum height occurs when \\(v = 0\\):\\(v(t) = v_0 + at = 0 \\Rightarrow t_{\\text{max}} = -v_0/a = -20/(-9.8) \\approx 2.04\\) s. Notice: the formula \\(t = -v_0/a\\) has a negative sign specifically because of the negative \\(a\\). If you had used \\(a = +9.8\\) (positive downward convention),you would get \\(t = +20/9.8\\) — same number, different sign convention.',
      '**The inclined plane — a 2D problem made 1D by clever axis choice. **A block on a slope at angle \\(\\theta\\). Standard axes (x horizontal, y vertical): both gravity components involve \\(\\theta\\). Hard. Rotated axes (x along slope, y perpendicular to slope):gravity component along slope = \\(-mg\\sin\\theta\\);gravity component perpendicular to slope = \\(-mg\\cos\\theta\\) (cancelled by normal force). The block moves only along the slope — one equation, one unknown.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Sign convention for vertical free fall',
        body:
          '\\text{Upward positive:}\\quad a = -g = -9.8\\,\\text{m/s}^2\\\\x(t) = x_0 + v_0 t - \\tfrac{1}{2}gt^2\\\\v(t) = v_0 - gt\\\\\\text{(Most common in textbooks — memorize this form.)}',
      },
      {
        type: 'theorem',
        title: 'Sign convention for vertical free fall — alternative',
        body:
          '\\text{Downward positive:}\\quad a = +g = +9.8\\,\\text{m/s}^2\\\\x(t) = x_0 - v_0 t + \\tfrac{1}{2}gt^2 \\quad \\text{(if thrown up)}\\\\\\text{Same physics, different signs. Less common — use with caution.}',
      },
      {
        type: 'insight',
        title: 'Rotated axes for inclined planes',
        body:
          '\\text{Rotate axes: x along incline, y perpendicular to incline.}\\\\a_x = -g\\sin\\theta \\quad (\\text{along slope — causes sliding})\\\\a_y = g\\cos\\theta - N/m = 0 \\quad (\\text{normal direction — no motion})\\\\\\text{Result: 2D problem becomes 1D. The incline blocks off one dimension.}',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Sign convention in action — same problem, two conventions',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Stage 1 — Same Free Fall, Two Sign Conventions',
              prose: 'Solve "how long to hit the ground?" using two different sign conventions. Verify same answer.',
              instructions: 'Run. Both conventions give t ≈ 3.19 s. The intermediate values differ, but the physics is the same.',
              code:
                '# A ball thrown upward at 15 m/s from ground level.\n# Find time to hit the ground.\n\nimport numpy as np\n\nv0 = 15  # m/s\ng = 9.8  # m/s²\n\n# Convention 1: UPWARD POSITIVE (standard)\n# x(t) = v0*t - ½*g*t². Hit ground when x = 0.\n# t(v0 - ½*g*t) = 0 → t = 0 or t = 2*v0/g\na1 = -g  # gravity is NEGATIVE\nt_land_1 = 2 * v0 / g  # t = 2v0/g when upward positive\n\n# Convention 2: DOWNWARD POSITIVE (alternative)\n# Ball thrown UP means v0 = -15 m/s (opposing positive direction)\n# x(t) = -v0*t + ½*g*t². Hit ground when x = 0.\nv0_2 = -v0  # throw is negative (upward = negative)\na2 = +g    # gravity is POSITIVE\nt_land_2 = 2 * v0 / g  # same formula, same result\n\nprint("Convention 1 (upward positive):")\nprint(f"  a = {a1} m/s²  (gravity negative)")\nprint(f"  t_land = {t_land_1:.4f} s")\n\nprint("\\nConvention 2 (downward positive):")\nprint(f"  a = {a2} m/s²  (gravity positive)")\nprint(f"  t_land = {t_land_2:.4f} s")\n\nprint(f"\\nBoth give the same physical answer: {t_land_1:.4f} s ✓")',
              output: '',
              status: 'idle',
            },
            {
              id: 2,
              cellTitle: 'Stage 2 — Plot Both Sign Conventions',
              prose: 'Plot x(t) under both conventions. The curves are mirror images — but both describe the same trajectory.',
              instructions: 'Run. Convention 1: curve goes up then down. Convention 2: curve goes down then up. Same shape, flipped.',
              code:
                'import numpy as np\nfrom opencalc import Figure\n\nv0 = 15; g = 9.8\nt = np.linspace(0, 2*v0/g, 200)\n\n# Convention 1: upward positive\nx1 = v0*t - 0.5*g*t**2\n\n# Convention 2: downward positive (same trajectory, flipped)\nx2 = -v0*t + 0.5*g*t**2\n\nfig = Figure(xmin=0, xmax=3.3, ymin=-12, ymax=12)\nfig.plot(t.tolist(), x1.tolist(), color="blue", label="Convention 1 (up+)")\nfig.plot(t.tolist(), x2.tolist(), color="red", label="Convention 2 (down+)")\nfig.hline(0, color="gray")\nfig.xlabel("t (s)").ylabel("x (m)").title("Same physics, different sign conventions")\nfig.show()',
              output: '',
              status: 'idle',
            },
            {
              id: 11,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Challenge — Apply upward-positive convention correctly',
              difficulty: 'medium',
              prompt:
                'A ball is dropped from rest at height h = 20 m above the ground. Using upward positive (x₀ = 20, v₀ = 0, a = −9.8):Find the time to hit the ground (x = 0). Store it in t_land.',
              instructions:
                '1. Set up x(t) = x0 + v0*t + 0.5*a*t² = 0.\n2. Solve for t. Use np.sqrt().',
              code:
                'import numpy as np\n\nx0 = 20  # m (above ground)\nv0 = 0   # m/s (dropped from rest)\na = -9.8 # m/s² (upward positive → gravity negative)\n\n# x(t) = x0 + v0*t + 0.5*a*t² = 0\n# Solve for t:\nt_land = \n\nprint(f"t_land = {t_land:.4f} s")',
              output: '',
              status: 'idle',
              testCode:
                '\nimport numpy as np\nexpected = np.sqrt(2*20/9.8)\nif abs(t_land - expected) > 0.01:\n    raise ValueError(f"Expected {expected:.4f} s, got {t_land}")\nres = f"SUCCESS: t_land = {t_land:.4f} s. From 0=20-4.9t², t=√(20/4.9)≈{expected:.4f} s."\nres\n',
              hint: '0 = 20 + 0 - 4.9*t² → t² = 20/4.9 → t = np.sqrt(20/4.9)',
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Coordinate transformations — the formal picture. **Switching from convention 1 (upward positive, origin at ground)to convention 2 (downward positive, origin at ceiling height \\(H\\))is a **coordinate transformation**:\\(x_2 = H - x_1\\). Every position, velocity, and acceleration transforms accordingly:\\(v_2 = -v_1\\), \\(a_2 = -a_1\\). The physics (forces, trajectories, timing) is invariant under this transformation. This invariance principle — that physical laws do not depend on coordinate choice — is one of the deepest ideas in physics (it underlies Einstein\'s Special Relativity).',
      '**Reference frames in mechanics. **A reference frame includes a coordinate system AND the state of the observer. An inertial reference frame is one that is not accelerating. Newton\'s laws hold exactly in inertial frames. In an accelerating frame (like a car braking),pseudo-forces appear (like the feeling of being pushed forward). This is why a coordinate system alone is not enough for full generality — but for all problems in this course, we work in inertial (non-accelerating) frames.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Coordinate transformation',
        body:
          '\\text{If } x_2 = H - x_1 \\text{ (flip and shift):}\\\\v_2 = \\frac{dx_2}{dt} = -\\frac{dx_1}{dt} = -v_1\\\\a_2 = \\frac{dv_2}{dt} = -\\frac{dv_1}{dt} = -a_1\\\\\\text{Position, velocity, acceleration all flip sign under coordinate inversion.}',
      },
      {
        type: 'insight',
        title: 'Principle of coordinate invariance',
        body:
          '\\text{Physical predictions (time of landing, max height, final speed)}\\\\\\text{are independent of coordinate system.}\\\\\\text{The equations change. The physics does not.}\\\\\\text{This is why both conventions give the same answer.}',
      },
    ],
    proofSteps: [
      {
        expression: '\\text{Convention 1 (up positive): } x = v_0 t - \\tfrac{1}{2}gt^2 = 0',
        annotation: 'Find when ball returns to origin (ground level).',
      },
      {
        expression: 't(v_0 - \\tfrac{1}{2}gt) = 0 \\Rightarrow t = 0 \\text{ or } t = \\frac{2v_0}{g}',
        annotation: 'Factor out t. The physical solution is t = 2v₀/g.',
      },
      {
        expression: '\\text{Convention 2 (down positive): } x_2 = -v_0 t + \\tfrac{1}{2}gt^2 = 0',
        annotation: 'Same condition: ball returns to ground. (−v₀ because "up" is negative.)',
      },
      {
        expression: 't(-v_0 + \\tfrac{1}{2}gt) = 0 \\Rightarrow t = \\frac{2v_0}{g} \\quad \\checkmark',
        annotation: 'Same answer. The flight time is invariant under the sign convention change.',
      },
    ],
    title: 'Both sign conventions give the same flight time — proof',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-fall-axes' },
        title: 'Side-by-side: both conventions for free fall',
        mathBridge:
          'Use the proof steps above while reading this diagram. Each convention has its own equation, but both conditions (x = 0 when landing)give t = 2v₀/g. The diagram shows this geometrically.',
        caption: 'Two coordinate systems, one physical reality.',
      },
    ],
  },

  examples: [
    {
      id: 'p0-007-ex1',
      title: 'Setting up sign convention for a thrown ball',
      problem:
        '\\text{A ball is thrown upward at } v_0 = 20\\,\\text{m/s from height } x_0 = 1.5\\,\\text{m above the ground. Choose upward positive. Write } x(t) \\text{ and find max height.}',
      steps: [
        {
          expression: '\\text{Convention: upward +, origin at ground. } a = -9.8\\,\\text{m/s}^2, x_0 = 1.5\\,\\text{m, } v_0 = +20\\,\\text{m/s}',
          annotation: 'State the convention first.',
        },
        {
          expression: 'x(t) = 1.5 + 20t - 4.9t^2',
          annotation: 'Write the full position function.',
        },
        {
          expression: 'v(t) = 20 - 9.8t = 0 \\Rightarrow t_{\\text{max}} = 20/9.8 \\approx 2.04\\,\\text{s}',
          annotation: 'Max height when v = 0.',
        },
        {
          expression: 'x_{\\text{max}} = 1.5 + 20(2.04) - 4.9(2.04)^2 = 1.5 + 40.8 - 20.4 = 21.9\\,\\text{m}',
          annotation: 'Substitute t = 2.04 into x(t).',
        },
      ],
      conclusion: 'Maximum height = 21.9 m above the ground, reached at t ≈ 2.04 s.',
    },
    {
      id: 'p0-007-ex2',
      title: 'Choosing the best coordinate system for an inclined plane',
      problem:
        '\\text{A block slides down a frictionless incline at angle } \\theta = 30°.\\text{Choose the tilted coordinate system and find the acceleration along the slope.}',
      steps: [
        {
          expression: '\\text{Choose: x-axis along the incline (positive down the slope), y-axis perpendicular.}',
          annotation: 'Tilted axes: one axis along the motion of interest.',
        },
        {
          expression: '\\text{Gravity component along x: } F_x = mg\\sin30° = m(9.8)(0.5) = 4.9m\\,\\text{N}',
          annotation: 'The component of gravity along the incline.',
        },
        {
          expression: '\\text{Gravity component along y: } F_y = -mg\\cos30° + N = 0 \\Rightarrow N = mg\\cos30°',
          annotation: 'No acceleration perpendicular to slope. Normal force balances the y-component.',
        },
        {
          expression: 'a = F_x/m = g\\sin30° = 9.8(0.5) = 4.9\\,\\text{m/s}^2 \\text{ (down the slope)}',
          annotation: 'Newton\'s second law along x.',
        },
      ],
      conclusion:
        'Acceleration = g·sin30° = 4.9 m/s² down the slope. The tilted axes reduced a 2D problem to a single 1D equation. In standard (horizontal/vertical) axes, this would require two coupled equations.',
    },
    {
      id: 'p0-007-ex3',
      title: 'Interpreting a negative position value',
      problem:
        '\\text{Using upward positive with origin at launch point:a ball\'s position at time } t = 5\\,\\text{s is } x = -3.75\\,\\text{m. What does this mean physically?}',
      steps: [
        {
          expression: 'x = -3.75\\,\\text{m} < 0',
          annotation: 'Negative x means below the origin.',
        },
        {
          expression: '\\text{Origin = launch point. Negative x = below launch point.}',
          annotation: 'The ball has passed below where it was launched.',
        },
        {
          expression: '\\text{Physical meaning: the ball hit the ground (or went underground) before } t = 5\\,\\text{s}',
          annotation: 'If the ground is at x = 0 (launch on ground level), the ball already hit the ground.',
        },
      ],
      conclusion:
        'x = −3.75 m means 3.75 m below the launch point — the ball already hit the ground. A negative position is not an error; it is a statement about location relative to the origin.',
    },
  ],

  challenges: [
    {
      id: 'p0-007-ch1',
      difficulty: 'easy',
      problem:
        '\\text{A ball is dropped from a building 45 m tall. Choose origin at the top (positive upward). Write } x(t) \\text{ and find the time to hit the ground (} x = -45\\,\\text{m).}',
      hint: 'x₀ = 0 (at top), v₀ = 0 (dropped). Set x(t) = -45 and solve.',
      walkthrough: [
        {
          expression: 'x(t) = 0 + 0 - \\tfrac{1}{2}(9.8)t^2 = -4.9t^2',
          annotation: 'x₀ = 0, v₀ = 0, a = −9.8.',
        },
        {
          expression: '-4.9t^2 = -45 \\Rightarrow t^2 = 45/4.9 \\approx 9.18 \\Rightarrow t \\approx 3.03\\,\\text{s}',
          annotation: 'Solve for t.',
        },
      ],
      answer: 't ≈ 3.03 s',
    },
    {
      id: 'p0-007-ch2',
      difficulty: 'medium',
      problem:
        '\\text{Solve the same problem (45 m drop) using origin at the bottom (positive upward). Show you get the same landing time.}',
      hint: 'Now x₀ = 45 m (starts at top, 45 m above ground). Land when x = 0.',
      walkthrough: [
        {
          expression: 'x(t) = 45 - 4.9t^2',
          annotation: 'x₀ = 45 m (height above ground), v₀ = 0, a = −9.8.',
        },
        {
          expression: '0 = 45 - 4.9t^2 \\Rightarrow t^2 = 45/4.9 \\Rightarrow t \\approx 3.03\\,\\text{s}',
          annotation: 'Same answer — different equation, same physics.',
        },
      ],
      answer: 't ≈ 3.03 s (same as before — coordinate choice doesn\'t change physics).',
    },
    {
      id: 'p0-007-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A block on a 40° incline accelerates from rest. Using incline-aligned axes,find: (a) the acceleration, (b) velocity after 3 s, (c) distance traveled after 3 s.}',
      hint:
        'a = g·sin40°. Then v(t) = at and x(t) = ½at².(sin40° ≈ 0.643)',
      walkthrough: [
        {
          expression: '\\text{(a) } a = g\\sin40° = 9.8(0.643) \\approx 6.3\\,\\text{m/s}^2 \\text{ (down the slope)}',
          annotation: 'Acceleration along the incline.',
        },
        {
          expression: '\\text{(b) } v(3) = 0 + 6.3(3) = 18.9\\,\\text{m/s}',
          annotation: 'v₀ = 0 (from rest).',
        },
        {
          expression: '\\text{(c) } x(3) = \\tfrac{1}{2}(6.3)(9) = 28.35\\,\\text{m along the slope}',
          annotation: '½at².',
        },
      ],
      answer: '(a) a ≈ 6.3 m/s². (b) v(3) = 18.9 m/s. (c) x(3) ≈ 28.4 m along the incline.',
    },
  ],

  semantics: {
    core: [
      { symbol: 'x_0', meaning: 'initial position — where the object starts in your coordinate system (often set to 0)' },
      { symbol: 'a = -g', meaning: 'acceleration with upward-positive convention — negative because gravity acts downward' },
      { symbol: 'a = +g', meaning: 'acceleration with downward-positive convention — positive because gravity and + direction agree' },
      { symbol: 'x < 0', meaning: 'object is below the origin (upward positive) or behind the reference point' },
      { symbol: '\\text{origin}', meaning: 'the reference point — where measurements start (x = 0, y = 0)' },
      { symbol: '\\text{sign convention}', meaning: 'the agreement about which direction is positive — must be consistent throughout the problem' },
    ],
    rulesOfThumb: [
      'Always draw a diagram with the origin and positive direction marked BEFORE writing any equations.',
      'Upward positive is standard — use it unless there\'s a good reason not to.',
      'On inclined planes, align one axis with the slope to reduce a 2D problem to 1D.',
      'A negative position is not an error — it means "below/behind/left of the origin."',
      'Check that every quantity (v₀, a, Δx) has the correct sign before substituting.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'p0-003',
        label: 'Lesson 3 — Variables and Functions',
        note: 'The sign convention changes the values of variables (v₀, a) in x(t). If evaluating x(t) feels unclear, review Lesson 3.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'p1-ch2-014',
        label: 'Ch. 2, Lesson 14 — Free Fall Sign Convention',
        note:
          'Ch. 2 Lesson 14 is entirely devoted to the free-fall sign convention — it formalizes everything from this lesson.',
      },
      {
        lessonId: 'p1-ch4-007',
        label: 'Ch. 4 — Inclined Planes',
        note:
          'Chapter 4 uses the rotated-axis trick from this lesson extensively. The coordinate transformation from horizontal/vertical to along/perpendicular-to-incline is the key technique.',
      },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'p0-007-assess-1',
        type: 'choice',
        text: 'Using upward-positive convention, what is the sign of gravitational acceleration?',
        options: ['Positive (+9.8)', 'Negative (−9.8)', 'Zero', 'It depends on the speed'],
        answer: 'Negative (−9.8)',
        hint: 'Gravity acts downward. Downward is negative in upward-positive convention. So g = −9.8 m/s².',
      },
      {
        id: 'p0-007-assess-2',
        type: 'choice',
        text: 'A student gets x = −12 m for the position of a falling ball. This means:',
        options: [
          'An error was made — position cannot be negative',
          'The ball is 12 m below the chosen origin',
          'The ball is moving at 12 m/s',
          'The ball has not started moving yet',
        ],
        answer: 'The ball is 12 m below the chosen origin',
        hint: 'Negative position = below the origin (in upward-positive convention). This is physically meaningful.',
      },
    ],
  },

  mentalModel: [
    'Coordinate system = origin + positive direction. Physics is invariant; equations change.',
    'Standard convention: upward positive → a = −g = −9.8 m/s²',
    'Negative position = below origin. Negative velocity = moving in −x direction. Both are fine.',
    'Inclined plane: rotate axes to align with slope → one equation instead of two',
    'State your convention at the start of every problem — then enforce it for every quantity',
    'Both sign conventions give identical physical answers — proof: flight time = 2v₀/g always',
  ],

  quiz: [
    {
      id: 'coord-q1',
      type: 'choice',
      text: 'Using upward-positive convention, a ball is thrown DOWN at 10 m/s. What is v₀?',
      options: ['+10 m/s', '−10 m/s', '+9.8 m/s', '0 m/s'],
      answer: '−10 m/s',
      hints: ['Thrown downward = moving in the negative direction. v₀ = −10 m/s.'],
      reviewSection: 'Math — sign convention for vertical free fall',
    },
    {
      id: 'coord-q2',
      type: 'input',
      text: 'A ball is dropped (v₀=0) from 80 m using upward positive, x₀=0 at drop point. Time to reach x=−80 m? (Use g=10 for simplicity.)',
      answer: '4',
      hints: [
        'x(t) = −5t² = −80 → t² = 16 → t = 4 s.',
      ],
      reviewSection: 'Examples — setting up sign convention',
    },
    {
      id: 'coord-q3',
      type: 'choice',
      text: 'What is the purpose of an "origin" in a coordinate system?',
      options: [
        'It marks where the object starts moving',
        'It is the reference point where position = 0',
        'It must be at the ground',
        'It defines the positive direction',
      ],
      answer: 'It is the reference point where position = 0',
      hints: ['The origin is where you decide x = 0. You can put it anywhere — it\'s your choice.'],
      reviewSection: 'Intuition — coordinate system definition',
    },
    {
      id: 'coord-q4',
      type: 'choice',
      text: 'Why is the tilted coordinate system preferred for inclined plane problems?',
      options: [
        'It makes gravity zero',
        'It aligns one axis with the motion, so one component of gravity is zero (balanced by normal force)',
        'It makes the problem three-dimensional',
        'It is required by Newton\'s laws',
      ],
      answer: 'It aligns one axis with the motion, so one component of gravity is zero (balanced by normal force)',
      hints: ['With the tilted axis, all motion is along one direction — a 2D problem becomes 1D.'],
      reviewSection: 'Examples — inclined plane axes',
    },
    {
      id: 'coord-q5',
      type: 'choice',
      text: 'Two students solve the same free-fall problem with opposite sign conventions. They will get:',
      options: [
        'Different answers for everything',
        'The same physical answers (time, height) but different intermediate signs',
        'The same equations',
        'Different times but the same heights',
      ],
      answer: 'The same physical answers (time, height) but different intermediate signs',
      hints: ['Coordinate convention changes signs, not physics. Both students correctly solve the same problem.'],
      reviewSection: 'Rigor — coordinate invariance proof',
    },
    {
      id: 'coord-q6',
      type: 'input',
      text: 'A block on a 30° frictionless incline starts from rest. Using incline-aligned axes, what is the acceleration in m/s²? (Use g=9.8, sin30°=0.5.)',
      answer: '4.9',
      hints: ['a = g·sin30° = 9.8 × 0.5 = 4.9 m/s².'],
      reviewSection: 'Examples — inclined plane coordinate system',
    },
    {
      id: 'coord-q7',
      type: 'choice',
      text: 'What does x = +35 m mean if upward is positive and the origin is at the ground?',
      options: [
        'The object is 35 m underground',
        'The object is 35 m above the ground',
        'The object has traveled 35 m in total',
        'The object is at the origin',
      ],
      answer: 'The object is 35 m above the ground',
      hints: ['Positive x with upward positive = above the origin = above the ground.'],
      reviewSection: 'Intuition — standard sign convention',
    },
    {
      id: 'coord-q8',
      type: 'choice',
      text: 'What is the single most common sign-convention error in physics problems?',
      options: [
        'Forgetting to square t in x = ½at²',
        'Writing a = +9.8 m/s² when upward is defined as positive',
        'Putting the origin at the ground instead of the object',
        'Using the wrong trigonometric function',
      ],
      answer: 'Writing a = +9.8 m/s² when upward is defined as positive',
      hints: ['With upward positive, gravity is downward = negative. a = −9.8 m/s². This is the most common mistake.'],
      reviewSection: 'Intuition — standard sign convention warning',
    },
  ],
}

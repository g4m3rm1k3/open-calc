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
        props: { type: 'sign-convention-comparison' },
        title: 'Same throw, two sign conventions — identical physical result',
        mathBridge:
          'The left panel shows the "up positive" convention: v₀ is positive, g is negative (−9.8), and x increases upward. The right panel shows "down positive": v₀ is negative (going up is negative direction), g is positive (+9.8), x increases downward. Both panels show the ball following the same parabolic path. The numbers in the equations look different, but the peak height (v₀²/2g) and flight time (2v₀/g) are identical. Moral: physics is invariant under coordinate relabelling.',
        caption: 'Two conventions, one physical event. The answer for any physical observable (height, time, speed) is the same regardless of which sign convention you choose.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'coordinate-origin-choice' },
        title: 'Shifting the origin — x₀ changes, but Δx stays the same',
        mathBridge:
          'Drag the origin marker. As you move the reference point, all the x-coordinates change. But the displacement Δx = x_f − x_i stays constant — it is independent of where you put zero. Physical distances (how far the ball fell) are differences, not absolute positions. The coordinate system is a measuring tool, not physical reality.',
        caption: 'Absolute position depends on where you put the origin. Displacement is a physical difference — it does not depend on the origin.',
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

  notebooks: {
    python: {
      type: 'python',
      cells: [
        {
          cellTitle: 'Sign Convention — Two Ways to Model Free Fall',
          type: 'code',
          language: 'python',
          prose: [
            `The choice of sign convention changes the equations but not the physical answer. This cell models the same thrown ball with both conventions and confirms identical flight times and maximum heights.`,
          ],
          code: `import numpy as np
import matplotlib.pyplot as plt

g = 9.8
v0 = 20.0    # initial speed [m/s]
x0 = 0.0

# Convention 1: upward = positive
# x(t) = x0 + v0*t - ½g*t²,  a = -g
def x_up_pos(t):
    return x0 + v0*t - 0.5*g*t**2

def v_up_pos(t):
    return v0 - g*t

# Convention 2: downward = positive  (initial v is negative since thrown up)
# x(t) = x0 - v0*t + ½g*t²,  a = +g
def x_down_pos(t):
    return x0 - v0*t + 0.5*g*t**2

def v_down_pos(t):
    return -v0 + g*t

# Find landing time for each (when x = x0)
# Upward+: x0 + v0*t - ½g*t² = 0 → t = 2v0/g
t_land = 2 * v0 / g
print(f"Flight time (both conventions): {t_land:.4f} s")

t = np.linspace(0, t_land, 300)

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Position
axes[0].plot(t, x_up_pos(t), 'b-', linewidth=2, label='Upward+ (x rises then falls)')
axes[0].plot(t, x_down_pos(t), 'r--', linewidth=2, label='Downward+ (x falls then rises)')
axes[0].axhline(0, color='brown', linewidth=1)
axes[0].set_xlabel('t [s]');  axes[0].set_ylabel('x [m]')
axes[0].set_title('Position vs time — two conventions')
axes[0].legend();  axes[0].grid(True, alpha=0.3)

# Velocity
axes[1].plot(t, v_up_pos(t), 'b-', linewidth=2, label='v(t) upward+')
axes[1].plot(t, v_down_pos(t), 'r--', linewidth=2, label='v(t) downward+')
axes[1].axhline(0, color='brown', linewidth=1)
axes[1].set_xlabel('t [s]');  axes[1].set_ylabel('v [m/s]')
axes[1].set_title('Velocity vs time — two conventions')
axes[1].legend();  axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

t_peak_up = v0 / g
print(f"Max height (upward+): {x_up_pos(t_peak_up):.2f} m")
print(f"Min x (downward+) at same time: {x_down_pos(t_peak_up):.2f} m (most negative = highest)")`,
        },
        {
          cellTitle: '2D Coordinate Systems — Free Fall Under Different Frames',
          type: 'code',
          language: 'python',
          prose: [
            `In 2D we choose both a horizontal and vertical axis. For projectile motion, the x-axis is always horizontal (no gravity) and the y-axis is vertical (gravity acts). The coordinate system defines which way "positive" points — but the trajectory is the same.`,
          ],
          code: `import numpy as np
import matplotlib.pyplot as plt

g = 9.8
v0 = 20.0;  theta = 40.0   # degrees

vx = v0 * np.cos(np.radians(theta))
vy = v0 * np.sin(np.radians(theta))

t_land = 2 * vy / g
t = np.linspace(0, t_land, 300)

# Standard convention: x right+, y up+
x1 = vx * t
y1 = vy * t - 0.5 * g * t**2

# Alternative: x left+, y up+  (negate x component, same y)
x2 = -vx * t   # same trajectory, mirrored left-right
y2 = y1

# Alternative: x right+, y down+  (negate y, negate vy, use +g)
x3 = vx * t
y3 = -vy * t + 0.5 * g * t**2   # downward positive

fig, axes = plt.subplots(1, 3, figsize=(15, 5))

axes[0].plot(x1, y1, 'b-', linewidth=2)
axes[0].set_title('Standard: x right+, y up+')
axes[0].set_xlabel('x [m]');  axes[0].set_ylabel('y [m]')
axes[0].axhline(0, color='brown');  axes[0].grid(True, alpha=0.3)
axes[0].set_aspect('equal')

axes[1].plot(x2, y2, 'r-', linewidth=2)
axes[1].set_title('Mirrored: x left+, y up+')
axes[1].set_xlabel('x [m]');  axes[1].set_ylabel('y [m]')
axes[1].axhline(0, color='brown');  axes[1].grid(True, alpha=0.3)
axes[1].set_aspect('equal')

axes[2].plot(x3, y3, 'g-', linewidth=2)
axes[2].set_title('Flipped: x right+, y down+')
axes[2].set_xlabel('x [m]');  axes[2].set_ylabel('y [m]')
axes[2].axhline(0, color='brown');  axes[2].grid(True, alpha=0.3)
axes[2].set_aspect('equal')

plt.suptitle('Same physical trajectory — three coordinate systems', fontsize=12)
plt.tight_layout()
plt.show()
print("Flight time unchanged across all conventions:", f"{t_land:.2f} s")`,
        },
        {
          cellTitle: 'Reference Frame — Relative Motion',
          type: 'code',
          language: 'python',
          prose: [
            `The origin is arbitrary — you can place it wherever makes the algebra simplest. For relative motion, measuring position from a moving frame changes velocities but not accelerations (in classical mechanics).`,
          ],
          code: `import numpy as np
import matplotlib.pyplot as plt

# Two cars on a highway:
# Car A: starts at origin, moves at 30 m/s east
# Car B: starts 200 m east, moves at 20 m/s east

v_A = 30.0   # m/s
v_B = 20.0   # m/s
x_A0 = 0.0
x_B0 = 200.0

t = np.linspace(0, 30, 300)

x_A = x_A0 + v_A * t
x_B = x_B0 + v_B * t

# Relative position: how far ahead is B from A's perspective?
x_rel = x_B - x_A   # B's position in A's reference frame

# In A's frame, A is stationary at 0, B approaches at v_rel = v_B - v_A
v_rel = v_B - v_A

t_catch = x_B0 / (v_A - v_B)   # when A catches B (x_A = x_B)

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

axes[0].plot(t, x_A, 'b-', linewidth=2, label='Car A (30 m/s)')
axes[0].plot(t, x_B, 'r-', linewidth=2, label='Car B (20 m/s)')
axes[0].axvline(t_catch, color='gray', linestyle='--', alpha=0.7)
axes[0].set_xlabel('t [s]');  axes[0].set_ylabel('position [m]')
axes[0].set_title('Ground frame: both cars moving east')
axes[0].legend();  axes[0].grid(True, alpha=0.3)

axes[1].plot(t, x_rel, 'g-', linewidth=2, label='B relative to A')
axes[1].axhline(0, color='gray', linestyle='--')
axes[1].set_xlabel('t [s]');  axes[1].set_ylabel('x_B − x_A [m]')
axes[1].set_title("A's reference frame: B approaches at 10 m/s")
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

print(f"Relative velocity: v_B - v_A = {v_rel:.1f} m/s (B recedes from A's view)")
print(f"A overtakes B at t = {t_catch:.1f} s")`,
        },
        {
          cellTitle: 'Challenge — Same Problem, Two Sign Conventions',
          type: 'code',
          language: 'python',
          code: `# Challenge: model a ball drop with both sign conventions
# ─────────────────────────────────────────────────────────
# A ball is dropped from rest (v0=0) from a height H = 45 m.
# The ground is at x = 0 in both conventions.

g = 9.8
H = 45.0

# Convention 1: upward positive, x0 = H, v0 = 0, a = -g
# Task 1a: Write position function x1(t) and velocity v1(t).
def x1(t):
    return # YOUR CODE HERE

def v1(t):
    return # YOUR CODE HERE

# Task 1b: Find t when x1(t) = 0 (ball hits ground). Store in t_land1.
# Hint: H - ½g*t² = 0 → t = sqrt(2H/g)
import numpy as np
t_land1 = # YOUR CODE HERE

# Convention 2: downward positive, x0 = 0, v0 = 0, a = +g
# (ground is now at x = H = 45 m)
def x2(t):
    return # YOUR CODE HERE

def v2(t):
    return # YOUR CODE HERE

# Task 2b: Find t when x2(t) = H. Store in t_land2.
t_land2 = # YOUR CODE HERE

print(f"Convention 1 (up+): lands at t={t_land1:.3f}s, v={v1(t_land1):.2f} m/s")
print(f"Convention 2 (down+): lands at t={t_land2:.3f}s, v={v2(t_land2):.2f} m/s")
print(f"Same time? {abs(t_land1 - t_land2) < 0.001}")
print(f"Same speed? {abs(abs(v1(t_land1)) - abs(v2(t_land2))) < 0.001}")`,
          prose: [],
        },
      ],
    },
    matlab: {
      type: 'matlab',
      cells: [
        {
          cellTitle: 'Sign Conventions in MATLAB',
          type: 'code',
          language: 'matlab',
          prose: [
            `MATLAB lets you define the kinematic functions symbolically or as anonymous functions. Here we model the same free-fall problem under both sign conventions and plot the results to confirm identical physical outcomes.`,
          ],
          code: `%% Two sign conventions — same physics, different equations
g  = 9.8;
v0 = 20.0;   % m/s initial upward speed
x0 = 0.0;

% Convention 1: upward positive
% x(t) = x0 + v0*t - 0.5*g*t^2,  a = -g
x_up  = @(t) x0 + v0.*t - 0.5.*g.*t.^2;
v_up  = @(t) v0 - g.*t;

% Convention 2: downward positive (invert signs)
% x(t) = x0 - v0*t + 0.5*g*t^2,  a = +g
x_dn  = @(t) x0 - v0.*t + 0.5.*g.*t.^2;
v_dn  = @(t) -v0 + g.*t;

t_land = 2*v0/g;
t = linspace(0, t_land, 300);

figure;
subplot(2,1,1);
plot(t, x_up(t), 'b-', 'LineWidth',2, 'DisplayName', 'Upward+');
hold on;
plot(t, x_dn(t), 'r--', 'LineWidth',2, 'DisplayName', 'Downward+');
yline(0, 'k-');
xlabel('t [s]');  ylabel('x [m]');
title('Position (two sign conventions)');  legend;  grid on;

subplot(2,1,2);
plot(t, v_up(t), 'b-', 'LineWidth',2, 'DisplayName', 'v upward+');
hold on;
plot(t, v_dn(t), 'r--', 'LineWidth',2, 'DisplayName', 'v downward+');
yline(0, 'k-');
xlabel('t [s]');  ylabel('v [m/s]');
title('Velocity (two sign conventions)');  legend;  grid on;

fprintf('Flight time: %.4f s (both conventions)\\n', t_land);
fprintf('Max height: %.2f m\\n', v0^2/(2*g));`,
        },
        {
          cellTitle: 'Challenge — Projectile with Chosen Origin',
          type: 'code',
          language: 'matlab',
          code: `%% Challenge: set up a projectile problem with your own coordinate origin
% ─────────────────────────────────────────────────────────
% A ball is thrown from the TOP of a 30 m cliff at 15 m/s
% at 25° above horizontal. Use upward-positive and the
% base of the cliff as the origin (y=0 at ground level).
%
% Task 1: Set up initial conditions (x0, y0, vx, vy).
% Task 2: Write anonymous functions x_fun and y_fun.
% Task 3: Find the time when y = 0 (ball hits ground).
%         Use roots() on the quadratic 0 = y0 + vy*t - 0.5*g*t^2
% Task 4: Find the horizontal range (x at landing time).
% Task 5: Plot the trajectory.

g  = 9.8;
H  = 30;    % cliff height [m]
v0 = 15;    % m/s
th = 25;    % degrees

% Task 1
x0 = 0;
y0 = H;     % base of cliff is y=0
vx = v0 * cosd(th);
vy = v0 * sind(th);   % positive: thrown upward

% Task 2
x_fun = @(t) % YOUR CODE
y_fun = @(t) % YOUR CODE

% Task 3
coeffs = [−0.5*g, vy, y0];  % at² + bt + c for 0 = y(t)
r = roots(coeffs);
t_land = max(r);   % take positive root

% Task 4
range = x_fun(t_land);

% Task 5
t_range = linspace(0, t_land, 300);
figure;
plot(x_fun(t_range), y_fun(t_range), 'b-', 'LineWidth',2);
hold on;  yline(0,'k-');  xline(0,'k-');
xlabel('x [m]');  ylabel('y [m]');
title(sprintf('Range = %.2f m, t_{land} = %.2f s', range, t_land));
grid on;

fprintf('Range: %.2f m\\n', range);
fprintf('Landing time: %.2f s\\n', t_land);`,
          prose: [],
        },
      ],
    },
  },

  misconceptions: [
    {
      id: 'p0-007-misc1',
      misconception: `"There is a 'correct' coordinate system for every problem — using the wrong one gives the wrong answer."`,
      reality: `Any consistent coordinate system gives the correct answer. The choice of sign convention changes the form of the equations but not the physical result. Flight time, maximum height, and landing position are unchanged by convention. The goal is to choose the convention that makes the algebra easiest (usually upward positive for vertical problems).`,
      whyItHappens: `Students see different textbooks using different conventions and think one must be right. Both are right — they just describe the same physics in different languages.`,
    },
    {
      id: 'p0-007-misc2',
      misconception: `"If I choose downward positive, gravity has a positive sign but that means it pushes objects upward."`,
      reality: `In a downward-positive frame, positive direction IS downward. Gravity causes downward acceleration, which is positive in this frame. An object dropped falls in the positive direction — its position increases over time. The sign of a acceleration simply tells you which direction on your axis the acceleration points.`,
      whyItHappens: `Students associate "positive = up" universally and get confused when the convention is reversed.`,
    },
    {
      id: 'p0-007-misc3',
      misconception: `"The origin must be at the starting position of the object."`,
      reality: `The origin can be anywhere. Placing it at the floor of a building, the launch point, the landing point, or anywhere else is equally valid. Often placing the origin somewhere other than the starting position makes the algebra simpler — for example, placing y = 0 at the floor makes finding landing time straightforward (solve x(t) = 0).`,
      whyItHappens: `Most introductory examples happen to use the launch point as origin, so students assume it must be placed there.`,
    },
  ],

  transferPrompts: [
    {
      id: 'p0-007-tp1',
      prompt: `A submarine navigates with depth measured as positive downward (surface = 0, seafloor = +800 m). (a) A torpedo is fired horizontally at depth 200 m. Set up the coordinate system and write the equations of motion. (b) If the torpedo has slight negative buoyancy (sinks slowly at 0.1 m/s²), what sign does this acceleration have in this convention? (c) Rewrite the problem with depth measured upward — which convention makes the algebra simpler here?`,
      targetConcept: 'Choosing coordinate systems, adapting sign conventions to the problem geometry',
      hint: `With depth positive down: torpedo starts at x=200 m, sinks (positive direction), a = +0.1 m/s². With depth positive up: start at x=−200 m, a = −0.1 m/s².`,
    },
    {
      id: 'p0-007-tp2',
      prompt: `Two cars approach each other head-on. Car A travels east at 25 m/s; Car B travels west at 30 m/s. They are 500 m apart. (a) Choose a coordinate system (define origin and positive direction). (b) Write position functions for each. (c) Find when and where they meet.`,
      targetConcept: 'Setting up relative motion problems with explicit coordinate choice',
      hint: `One natural choice: origin between them, positive east. Car A at x = −250 m with v = +25, Car B at x = +250 m with v = −30. Solve for when positions are equal.`,
    },
  ],

  debugging: [
    {
      id: 'p0-007-dbg1',
      title: 'Inconsistent sign convention within a single problem',
      scenario: `A student uses upward-positive throughout but writes F_gravity = +mg (positive). Newton's second law gives a = +g, so the ball accelerates upward. Their trajectory curves the wrong way.`,
      error: `Gravity always pulls downward. In upward-positive convention, "downward" is negative, so F_gravity = −mg and a = −g. Mixing conventions (upward positive for position, positive for gravitational force) breaks the algebra.`,
      fix: `Choose upward positive: x is upward, v is upward, a = −g = −9.8 m/s². Then x(t) = x₀ + v₀t − ½gt² has the ball curving downward correctly.`,
      prevention: `Write "Convention: upward = positive" at the top of every problem. Then check every signed quantity against that convention before writing any equation.`,
    },
    {
      id: 'p0-007-dbg2',
      title: 'Taking the negative root of the quadratic formula',
      scenario: `A student solving x(t) = 0 for landing time gets t = −0.3 s and t = 4.1 s, and picks t = −0.3 s "because it's the first one."`,
      error: `t = −0.3 s is before the throw (in the past) — it has no physical meaning. Always take the positive root. The negative root arises from extending the parabola backward in time, outside the problem's domain.`,
      fix: `Always select t > 0. Landing at t = 4.1 s is the physical answer. The negative root corresponds to where the parabola would pass through x=0 if extended backward — unphysical.`,
      prevention: `State the domain at the start: t ≥ 0. Immediately discard any negative time roots from the quadratic formula.`,
    },
  ],

  mastery: {
    targetLevel: `You can set up a coordinate system for any 1D or 2D problem, assign correct signs to all quantities (position, velocity, acceleration), and verify that the physical result is independent of the convention chosen.`,
    checklistItems: [
      `State your sign convention explicitly at the start of every problem ("upward = positive")`,
      `Assign the correct sign to gravitational acceleration for both conventions`,
      `Place the origin wherever makes the algebra simplest — not necessarily at the launch point`,
      `Solve the quadratic for landing time and select only the physically meaningful (positive) root`,
      `Verify that two different conventions give the same physical answer (flight time, max height)`,
      `Set up relative motion: identify which object is the origin, subtract positions correctly`,
    ],
    commonStruggles: [
      `Mixing sign conventions within a single problem — always write the convention at the top`,
      `Choosing the negative quadratic root — always select t > 0`,
      `Thinking the origin must be at the launch point — it can be anywhere`,
      `Forgetting to negate velocity or acceleration when switching conventions`,
    ],
    nextSteps: [
      `Chapter 2 (Kinematics): every problem in Ch.2 requires an explicit sign convention`,
      `Chapter 4 (Forces): Newton's Second Law is ΣF = ma where signs encode direction`,
      `Chapter 1 (Vectors): choosing coordinate directions becomes critical in 2D/3D`,
    ],
  },

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

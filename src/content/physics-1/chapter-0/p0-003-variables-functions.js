export default {
  id: 'p0-003',
  slug: 'variables-and-functions',
  chapter: 'p0',
  order: 2,
  title: 'Variables and Functions in Physics',
  subtitle: 'What x(t) really means — and why functions are the engine of every physics model.',
  tags: ['variables', 'functions', 'x(t)', 'input-output', 'domain', 'dependent variable', 'independent variable', 'notation'],

  hook: {
    question:
      'You drop a ball from a window. Someone asks: "Where is the ball?"You answer: "It depends."Depends on *what*? On time. At t = 0 it is at the window. At t = 1 s it is 4.9 m lower. At t = 2 s it is 19.6 m lower. The position is not a single number — it is a *rule* that takes a time and gives a position. That rule is a function. Functions are the basic unit of every physics model. What exactly is a function, and why does every physics equation use one?',
    realWorldContext:
      'GPS systems track your position as a function of time. Heart monitors track voltage as a function of time. Weather models predict temperature as a function of location and time. The stock market is price as a function of time. Every time something *changes*, physics describes it with a function. Understanding what x(t) means is not algebra for its own sake — it is the key to reading every physics equation you will ever encounter.',
    previewVisualizationId: 'FunctionPlotter',
    previewVisualizationProps: { expression: '0.5*9.8*x*x', xMin: 0, xMax: 3, label: 'x(t) = ½·9.8·t²' },
  },

  intuition: {
    prose: [
      '**A variable is a named placeholder for a measurable quantity. **In physics, the variable is always a physical quantity with a unit.\\(x\\) is not just "some number" — it is position, measured in meters.\\(t\\) is time in seconds. \\(v\\) is velocity in m/s. \\(m\\) is mass in kg. The letter is a label for a physical thing. When you write \\(x = 5\\),you are saying: "the position is 5 meters from the reference point."The variable and its unit are inseparable.',

      '**A function is a rule — one input, one output. **When physicists write \\(x(t)\\), they are describing a rule:"give me a time \\(t\\), and I will give you a position \\(x\\)."For free fall: \\(x(t) = \\frac{1}{2}(9.8)t^2\\). Plug in \\(t = 2\\): you get \\(x(2) = \\frac{1}{2}(9.8)(4) = 19.6\\) m. Plug in \\(t = 3\\): \\(x(3) = \\frac{1}{2}(9.8)(9) = 44.1\\) m. The function \\(x(t)\\) is the complete description of where the ball is at every moment. It replaces infinitely many individual measurements with one compact rule.',

      '**Dependent and independent variables. **The input to a function is the **independent variable** — you get to choose it freely. The output is the **dependent variable** — it is determined by the rule. In \\(x(t)\\): \\(t\\) is independent (you ask "what happens at t = 3 s?"),\\(x\\) is dependent (the answer is determined by the function). In physics, the independent variable is almost always time \\(t\\). Position, velocity, and acceleration all *depend* on when you measure them.',

      '**Evaluating a function — the core mechanical skill. **To evaluate \\(x(t) = \\frac{1}{2}at^2\\) at \\(t = 4\\) s with \\(a = 9.8\\) m/s²:(1) Write the function: \\(x(4) = \\frac{1}{2}(9.8)(4)^2\\).(2) Compute the power first: \\(4^2 = 16\\).(3) Multiply: \\(\\frac{1}{2} \\times 9.8 \\times 16 = \\frac{1}{2} \\times 156.8 = 78.4\\).(4) Answer: \\(x(4) = 78.4\\) m. The order of operations matters: exponents before multiplication.',

      '**Multiple functions in one problem — the kinematic triple. **A moving object requires three functions of time, all linked:\\(x(t)\\) (position), \\(v(t)\\) (velocity), \\(a(t)\\) (acceleration). For constant acceleration \\(a\\) from rest:\\(a(t) = a\\) (constant),\\(v(t) = at\\) (grows linearly),\\(x(t) = \\frac{1}{2}at^2\\) (grows as t²). These three functions live together. Change the acceleration and all three change. This is what it means for a model to be a system of equations — not one isolated formula,but a family of linked functions that update together.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 8 — Chapter 0: Orientation',
        body:
          '**Previous (Lesson 2):** Units and dimensions — SI units, dimensional analysis.\\n**This lesson:** Functions — what x(t) means, evaluating functions, the kinematic triple.\\n**Next (Lesson 4):** Average vs. instantaneous — what happens as Δt → 0.\\n**Why it matters:** Every physics equation is a function. Reading them correctly is the foundation of the course.',
      },
      {
        type: 'definition',
        title: 'Function',
        body:
          '\\text{A rule that assigns exactly one output to each valid input.}\\\\\\text{Notation: } f(x) \\text{ means "f evaluated at input } x\\text{."}\\\\\\text{In physics: } x(t) \\text{ maps time } t \\text{ to position } x\\text{.}',
      },
      {
        type: 'definition',
        title: 'Independent vs Dependent Variable',
        body:
          '\\text{Independent variable: the input (you choose it freely). In physics: usually } t\\text{.}\\\\\\text{Dependent variable: the output (determined by the function). In physics: } x, v, a, \\ldots\\\\\\text{Reading } x(t)\\text{: "position depends on time."}',
      },
      {
        type: 'insight',
        title: 'The kinematic triple — three functions linked',
        body:
          'a(t) = a \\quad\\text{(constant acceleration)}\\\\v(t) = v_0 + at \\quad\\text{(velocity: linear in } t\\text{)}\\\\x(t) = x_0 + v_0 t + \\tfrac{1}{2}at^2 \\quad\\text{(position: quadratic in } t\\text{)}',
      },
      {
        type: 'warning',
        title: 'The most common confusion: x(t) vs x × t',
        body:
          '\\text{In math, } f(x) \\text{ always means "function } f \\text{ evaluated at } x\\text{" — NOT } f \\times x\\text{.}\\\\\\text{So } x(t) \\text{ is "position as a function of time" — not "x times t."}\\\\\\text{Context makes this unambiguous: if } x \\text{ is defined as a function, then } x(t) \\text{ is evaluation.}',
      },
    ],
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'Position as a function of time — free fall',
        mathBridge:
          'The graph shows x(t) = ½ × 9.8 × t². Notice it curves upward — this is the t² behavior: every second, the ball has fallen much more than the second before. Hover over any point on the curve and read off the (t, x) pair. That\'s exactly what "evaluating the function at t" means.',
        caption: 'x(t) = ½gt² — the complete story of free fall in one curve.',
        props: { fn: '0.5 * 9.8 * x^2', xMin: 0, xMax: 5, yMin: 0, yMax: 130, xLabel: 't (s)', yLabel: 'x (m)' },
      },
      {
        id: 'PositionVelocityAcceleration',
        title: 'All three functions at once — position, velocity, acceleration',
        mathBridge:
          'This shows x(t), v(t), and a(t) for the same motion. Notice: a(t) is flat (constant). v(t) is a straight line (linear). x(t) is a curve (quadratic). As you drag the time slider, a vertical line moves through all three graphs simultaneously — showing the values at that exact moment.',
        caption: 'Three functions, one object, one moment. The kinematic triple in action.',
      },
      {
        id: 'PythonNotebook',
        title: 'Evaluating and graphing functions in Python',
        mathBridge:
          'Stage 1: Evaluate x(t) at specific times. Stage 2: Build the full function and plot it. Stage 3: Graph all three kinematic functions together.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Stage 1 — Evaluating x(t) at Specific Times',
              prose: 'A function is a rule: give it an input, get an output. Here we evaluate x(t) = ½gt² at several times.',
              instructions: 'Run. Then change some t values and see how x changes.',
              code:
                'g = 9.8  # m/s²\n\ndef x(t):\n    return 0.5 * g * t**2\n\n# Evaluate at several times\ntimes = [0, 1, 2, 3, 4, 5]\nprint(f"{\'t (s)\':>8}  {\'x (m)\':>10}")\nprint("-" * 22)\nfor t in times:\n    print(f"{t:>8.1f}  {x(t):>10.3f}")',
              output: '',
              status: 'idle',
            },
            {
              id: 2,
              cellTitle: 'Stage 2 — Plotting x(t)',
              prose: 'A function\'s graph shows its behavior at a glance. The curve x(t) = ½gt² is a parabola — it curves up, meaning the ball falls faster and faster.',
              instructions: 'Run. Notice the shape: every second adds more distance than the last.',
              code:
                'import numpy as np\nfrom opencalc import Figure\n\ng = 9.8\nt = np.linspace(0, 4, 200)  # 200 points from t=0 to t=4\nx = 0.5 * g * t**2\n\nfig = Figure(xmin=0, xmax=4.2, ymin=0, ymax=85)\nfig.plot(t.tolist(), x.tolist(), color="blue", label="x(t) = ½gt²")\nfig.xlabel("t (s)").ylabel("x (m)").title("Free Fall: Position vs Time")\nfig.show()',
              output: '',
              status: 'idle',
            },
            {
              id: 3,
              cellTitle: 'Stage 3 — All Three Kinematic Functions',
              prose: 'For constant acceleration a from rest: x(t)=½at², v(t)=at, a(t)=a. Three different shapes — quadratic, linear, constant.',
              instructions: 'Run. Notice how the three functions look completely different even though they describe the same motion.',
              code:
                'import numpy as np\nfrom opencalc import Figure\n\na_val = 9.8\nt = np.linspace(0, 3, 150)\n\nx_vals = 0.5 * a_val * t**2\nv_vals = a_val * t\na_vals = np.full_like(t, a_val)\n\n# Plot position\nfig1 = Figure(xmin=0, xmax=3.2, ymin=0, ymax=50)\nfig1.plot(t.tolist(), x_vals.tolist(), color="blue", label="x(t) = ½at²")\nfig1.xlabel("t (s)").ylabel("x (m)").title("Position")\nfig1.show()\n\n# Plot velocity\nfig2 = Figure(xmin=0, xmax=3.2, ymin=0, ymax=32)\nfig2.plot(t.tolist(), v_vals.tolist(), color="green", label="v(t) = at")\nfig2.xlabel("t (s)").ylabel("v (m/s)").title("Velocity")\nfig2.show()',
              output: '',
              status: 'idle',
            },
            {
              id: 11,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Challenge — Evaluate v(t) = v₀ + at',
              difficulty: 'easy',
              prompt:
                'A car starts at v₀ = 10 m/s and accelerates at a = 3 m/s².Compute velocity at t = 0, 2, 4, 6, 8, 10 s and store results in a list called velocities.',
              instructions:
                '1. Define v₀ = 10 and a = 3.\n2. Loop over times [0, 2, 4, 6, 8, 10].\n3. Compute v(t) = v₀ + a*t for each time.\n4. Append to velocities list.',
              code:
                'v0 = 10  # m/s\na = 3    # m/s²\ntimes = [0, 2, 4, 6, 8, 10]\nvelocities = []\n\n# Your loop here:\n\nprint(velocities)',
              output: '',
              status: 'idle',
              testCode:
                '\nexpected = [10+3*t for t in [0,2,4,6,8,10]]\nif velocities != expected:\n    raise ValueError(f"Expected {expected}, got {velocities}")\nres = f"SUCCESS: velocities = {velocities}"\nres\n',
              hint: 'for t in times:\n    velocities.append(v0 + a*t)',
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Evaluating a function — the step-by-step method. **When you see \\(x(t) = x_0 + v_0 t + \\frac{1}{2}at^2\\),you are looking at a formula for evaluating the function. To use it at a specific time:(1) Write the formula.(2) Replace \\(t\\) with the specific number.(3) Replace parameters (\\(x_0, v_0, a\\)) with their known values.(4) Compute, following order of operations (exponents first, then multiply, then add).',
      '**Composition — functions of functions. **Sometimes the input to one function is the output of another. If velocity depends on time, and kinetic energy depends on velocity,then KE depends on time: \\(\\text{KE}(v(t)) = \\frac{1}{2}m(v_0 + at)^2\\). This is composition: \\((\\text{KE} \\circ v)(t)\\). You will see this in every application of energy in Chapter 5.',
      '**Domain — where the function makes physical sense. **The domain is the set of valid inputs. In free fall from height \\(H\\): \\(x(t) = H - \\frac{1}{2}gt^2\\). But the ball hits the ground at \\(t = \\sqrt{2H/g}\\). After that, the formula gives negative position — the ball is underground. The domain is \\(0 \\le t \\le \\sqrt{2H/g}\\). Always state the domain of a physics function explicitly.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The general kinematic position function',
        body:
          'x(t) = x_0 + v_0 t + \\tfrac{1}{2}at^2\\\\\\text{Where: } x_0 = \\text{initial position, } v_0 = \\text{initial velocity, } a = \\text{acceleration (constant).}\\\\\\text{Valid for: constant acceleration only. Domain: } t \\ge 0.',
      },
      {
        type: 'insight',
        title: 'Three ways to describe the same function',
        body:
          '\\text{Formula: } x(t) = \\tfrac{1}{2}at^2\\\\\\text{Table: list of (t, x) pairs}\\\\\\text{Graph: parabola opening upward on } x\\text{-vs-}t \\text{ axes}\\\\\\text{All three describe the same rule. Physics uses all three.}',
      },
      {
        type: 'definition',
        title: 'Piecewise functions — when physics changes behavior',
        body:
          '\\text{A ball thrown up then caught:}\\\\x(t) = \\begin{cases} v_0 t - \\frac{1}{2}gt^2 & 0 \\le t \\le t_{\\text{catch}} \\\\ x_{\\text{catch}} & t > t_{\\text{catch}} \\end{cases}\\\\\\text{Different rules for different time intervals.}',
      },
    ],
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'Explore x(t) = x₀ + v₀t + ½at² — change parameters',
        mathBridge:
          'This is the general kinematic function. Notice: when a = 0, the curve is a straight line (constant velocity). When a > 0, the curve bends upward. When a < 0, it bends downward. The shape of the curve encodes all the physics.',
        caption: 'Every change in initial conditions changes the shape of the curve — and vice versa.',
        props: { fn: '0 + 5*x + 0.5*(-9.8)*x^2', xMin: 0, xMax: 1.1, yMin: 0, yMax: 3, xLabel: 't (s)', yLabel: 'x (m)' },
      },
    ],
  },

  rigor: {
    prose: [
      '**The formal definition of a function. **A function \\(f: A \\to B\\) is a relation that assigns to each element \\(x \\in A\\)exactly one element \\(f(x) \\in B\\).\\(A\\) is the domain, \\(B\\) is the codomain. In kinematics: \\(x: [0, T] \\to \\mathbb{R}\\) maps time to position. The key word is *exactly one* — a physical quantity has one value at each instant.',
      '**Continuous vs discrete functions. **Physically, position varies *continuously* in time — there is no gap, no jump. A continuous function has no breaks or holes in its graph. In practice, sensors sample at discrete times. The underlying physics is continuous; measurement is discrete. The calculus of Chapter 1 is built on continuous functions.',
      '**Linear functions — the most important special case. **When acceleration is constant, velocity is a *linear* function of time:\\(v(t) = v_0 + at\\). Linear means: equal increments of input produce equal increments of output. Every second, velocity increases by \\(a\\) m/s. The graph is a straight line with slope \\(a\\) and y-intercept \\(v_0\\).',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Formal definition of a function',
        body:
          'f: A \\to B \\text{ assigns exactly one output } f(x) \\in B \\text{ to each input } x \\in A.\\\\A \\text{ = domain (valid inputs), } B \\text{ = codomain (possible outputs).}\\\\\\text{In physics: } x(t), v(t), a(t) \\text{ are all functions with domain } [0,\\infty).',
      },
      {
        type: 'insight',
        title: 'Why "one output per input" matters',
        body:
          '\\text{A physical quantity must be well-defined at each instant.}\\\\\\text{If } x(t) \\text{ had two values at } t = 2 \\text{ s, the object would be in two places at once.}\\\\\\text{Physics requires functions — not multi-valued relations.}',
      },
    ],
    proofSteps: [
      {
        expression: '\\text{Claim: } v(t) = at \\text{ is linear in } t \\text{ when } a = \\text{const}',
        annotation: 'We want to show that equal time increments produce equal velocity increments.',
      },
      {
        expression: 'v(t + \\Delta t) - v(t) = a(t + \\Delta t) - at = a \\cdot \\Delta t',
        annotation: 'Compute the change in v over time interval Δt.',
      },
      {
        expression: '\\Delta v = a \\cdot \\Delta t \\quad \\text{(independent of } t \\text{)}',
        annotation: 'The change in v depends only on Δt and a — not on the starting time t.',
      },
      {
        expression: '\\text{This is the definition of linearity: equal inputs produce equal outputs.}',
        annotation: 'v(t) = at is a linear function of t. Its graph is a straight line with slope a.',
      },
    ],
    title: 'Why v(t) = at is linear — and what that means physically',
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'Linear vs quadratic — velocity vs position',
        mathBridge:
          'Plot v(t) = 9.8t (linear) and x(t) = ½(9.8)t² (quadratic) on the same screen. The linear function grows at a steady rate. The quadratic starts slow and accelerates — but with the same slope as v at every point.',
        caption: 'Constant acceleration → linear velocity → quadratic position. Each step is an integration.',
        props: { fn: '9.8*x', xMin: 0, xMax: 5, yMin: 0, yMax: 50 },
      },
    ],
  },

  examples: [
    {
      id: 'p0-003-ex1',
      title: 'Evaluating x(t) = x₀ + v₀t + ½at²',
      problem:
        '\\text{A ball is thrown upward from } x_0 = 1.5\\,\\text{m with } v_0 = 12\\,\\text{m/s, } a = -9.8\\,\\text{m/s}^2.\\text{Find position at } t = 1\\,\\text{s and } t = 2\\,\\text{s.}',
      steps: [
        {
          expression: 'x(t) = 1.5 + 12t + \\tfrac{1}{2}(-9.8)t^2 = 1.5 + 12t - 4.9t^2',
          annotation: 'Write the function with all constants filled in.',
        },
        {
          expression: 'x(1) = 1.5 + 12(1) - 4.9(1)^2 = 1.5 + 12 - 4.9 = 8.6\\,\\text{m}',
          annotation: 'At t = 1 s: 1² = 1.',
        },
        {
          expression: 'x(2) = 1.5 + 12(2) - 4.9(2)^2 = 1.5 + 24 - 4.9(4) = 1.5 + 24 - 19.6 = 5.9\\,\\text{m}',
          annotation: 'At t = 2 s: 2² = 4. The ball is on its way back down — still above start.',
        },
      ],
      conclusion:
        'x(1) = 8.6 m, x(2) = 5.9 m. The ball went up, peaked somewhere between t=1 and t=2, and is now descending.',
    },
    {
      id: 'p0-003-ex2',
      title: 'Finding the domain — when does the ball hit the ground?',
      problem:
        '\\text{For the ball in Ex. 1 (} x(t) = 1.5 + 12t - 4.9t^2\\text{),find the time it hits the ground (} x = 0\\text{). This gives the domain of } x(t)\\text{.}',
      steps: [
        {
          expression: '0 = 1.5 + 12t - 4.9t^2',
          annotation: 'Set x(t) = 0 and solve for t.',
        },
        {
          expression: '4.9t^2 - 12t - 1.5 = 0',
          annotation: 'Rearrange to standard quadratic form at² + bt + c = 0.',
        },
        {
          expression: 't = \\frac{12 \\pm \\sqrt{144 + 4(4.9)(1.5)}}{2(4.9)} = \\frac{12 \\pm \\sqrt{144 + 29.4}}{9.8}',
          annotation: 'Apply the quadratic formula: t = (−b ± √(b²−4ac)) / 2a.',
        },
        {
          expression: 't = \\frac{12 \\pm \\sqrt{173.4}}{9.8} = \\frac{12 \\pm 13.17}{9.8}',
          annotation: '√173.4 ≈ 13.17.',
        },
        {
          expression: 't = \\frac{12 + 13.17}{9.8} \\approx 2.57\\,\\text{s} \\quad (\\text{take positive root})',
          annotation: 'The negative root gives t < 0 — before the throw. Discard it.',
        },
      ],
      conclusion:
        'The ball hits the ground at t ≈ 2.57 s. Domain of x(t): 0 ≤ t ≤ 2.57 s. Using the formula outside this range gives unphysical (underground) results.',
    },
    {
      id: 'p0-003-ex3',
      title: 'Evaluating v(t) and reading the kinematic triple',
      problem:
        '\\text{For the same ball (} v_0 = 12\\,\\text{m/s, } a = -9.8\\,\\text{m/s}^2\\text{):(a) Find v(t). (b) When does the ball reach maximum height?(c) What is the maximum height?}',
      steps: [
        {
          expression: 'v(t) = v_0 + at = 12 - 9.8t',
          annotation: '(a) Velocity function — linear in t.',
        },
        {
          expression: 'v(t) = 0 \\Rightarrow 12 - 9.8t = 0 \\Rightarrow t = 12/9.8 \\approx 1.22\\,\\text{s}',
          annotation: '(b) Max height occurs when v = 0 — the ball momentarily stops.',
        },
        {
          expression: 'x(1.22) = 1.5 + 12(1.22) - 4.9(1.22)^2 = 1.5 + 14.64 - 7.28 \\approx 8.86\\,\\text{m}',
          annotation: '(c) Substitute t = 1.22 into x(t).',
        },
      ],
      conclusion:
        'Max height ≈ 8.86 m, reached at t ≈ 1.22 s. The velocity function told us when — the position function told us where.',
    },
  ],

  challenges: [
    {
      id: 'p0-003-ch1',
      difficulty: 'easy',
      problem:
        '\\text{A particle has position } x(t) = 3t^2 - 2t + 5\\text{ (meters, seconds). Find } x(0), x(1), x(3)\\text{.}',
      hint: 'Substitute t = 0, 1, 3 and compute. Start with t² before multiplying.',
      walkthrough: [
        { expression: 'x(0) = 0 - 0 + 5 = 5\\,\\text{m}', annotation: 'All t terms vanish.' },
        { expression: 'x(1) = 3 - 2 + 5 = 6\\,\\text{m}', annotation: 'Straightforward substitution.' },
        { expression: 'x(3) = 3(9) - 2(3) + 5 = 27 - 6 + 5 = 26\\,\\text{m}', annotation: '3² = 9.' },
      ],
      answer: 'x(0) = 5 m, x(1) = 6 m, x(3) = 26 m',
    },
    {
      id: 'p0-003-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A rocket fires with } a = 20\\,\\text{m/s}^2 \\text{ from rest on the ground. Write } x(t) \\text{ and } v(t)\\text{.Find when } v = 100\\,\\text{m/s. Find } x \\text{ at that moment.}',
      hint: 'x₀ = 0, v₀ = 0 for launch from rest. Solve v(t) = 100 for t, then substitute into x(t).',
      walkthrough: [
        {
          expression: 'x(t) = \\tfrac{1}{2}(20)t^2 = 10t^2, \\quad v(t) = 20t',
          annotation: 'x₀ = 0, v₀ = 0. Kinematic triple from rest.',
        },
        {
          expression: 'v(t) = 100 \\Rightarrow 20t = 100 \\Rightarrow t = 5\\,\\text{s}',
          annotation: 'Solve for time when v = 100 m/s.',
        },
        {
          expression: 'x(5) = 10(25) = 250\\,\\text{m}',
          annotation: 'Substitute t = 5 into x(t).',
        },
      ],
      answer: 'v = 100 m/s at t = 5 s. At that moment, x = 250 m.',
    },
    {
      id: 'p0-003-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A car decelerates from 30 m/s at } a = -5\\,\\text{m/s}^2.\\text{(a) Write } x(t) \\text{ and } v(t).\\text{(b) When does the car stop?}\\text{(c) What is the domain of } x(t)\\text{ as a motion model?}\\text{(d) How far does it travel before stopping?}',
      hint:
        'The car stops when v(t) = 0. After that, the deceleration model is no longer valid (the car just stays stopped).',
      walkthrough: [
        {
          expression: 'v(t) = 30 - 5t, \\quad x(t) = 30t - \\tfrac{1}{2}(5)t^2 = 30t - 2.5t^2',
          annotation: '(a) Using v₀ = 30 m/s, a = −5 m/s², x₀ = 0.',
        },
        {
          expression: 'v(t) = 0 \\Rightarrow 30 - 5t = 0 \\Rightarrow t = 6\\,\\text{s}',
          annotation: '(b) Car stops at t = 6 s.',
        },
        {
          expression: '\\text{Domain: } 0 \\le t \\le 6\\,\\text{s}',
          annotation: '(c) After t = 6 s the car is stationary — the deceleration model breaks down.',
        },
        {
          expression: 'x(6) = 30(6) - 2.5(36) = 180 - 90 = 90\\,\\text{m}',
          annotation: '(d) Stopping distance = 90 m.',
        },
      ],
      answer: '(a) v=30−5t, x=30t−2.5t². (b) Stops at t=6 s. (c) Domain: 0≤t≤6 s. (d) Stopping distance: 90 m.',
    },
  ],

  semantics: {
    core: [
      { symbol: 'x(t)', meaning: 'position as a function of time — the rule that gives position from time input' },
      { symbol: 'v(t)', meaning: 'velocity as a function of time — always v(t) = v₀ + at for constant a' },
      { symbol: 'a(t)', meaning: 'acceleration as a function of time — constant value a for SUVAT problems' },
      { symbol: 'x_0', meaning: 'initial position — the value of x(t) when t = 0' },
      { symbol: 'v_0', meaning: 'initial velocity — the value of v(t) when t = 0' },
      { symbol: 'f(x)', meaning: 'function f evaluated at input x — NOT f multiplied by x' },
      { symbol: '\\text{domain}', meaning: 'the set of valid inputs; for a falling ball, the time until it hits the ground' },
    ],
    rulesOfThumb: [
      'Always write the function first, then substitute — never substitute mentally while writing.',
      'Compute exponents before multiplying: in ½at², compute t² first.',
      'State the domain of any physics function — a position function for a falling ball ends when the ball hits the ground.',
      'When a(t) = constant, v(t) is linear and x(t) is quadratic — recognize these shapes.',
      'If a problem asks "when does X happen?", set the function equal to that value and solve for t.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'p0-002',
        label: 'Lesson 2 — Units and Dimensions',
        note:
          'If the variables feel abstract, remember: every variable has a physical type (dimension) and a unit.x has unit meters. t has unit seconds. The function x(t) maps seconds to meters.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'p0-004',
        label: 'Lesson 4 — Average vs Instantaneous',
        note:
          'Average velocity is Δx/Δt — a function of two times. Instantaneous velocity is what happens as Δt → 0.This is the first hint of calculus, and it depends entirely on understanding x(t) as a function.',
      },
      {
        lessonId: 'p1-ch2-007',
        label: 'Ch. 2, Lesson 7 — The Derivative dx/dt',
        note:
          'The derivative is the slope of x(t) at a point — the instantaneous rate of change. Everything in this lesson about functions is the prerequisite for understanding derivatives.',
      },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'p0-003-assess-1',
        type: 'input',
        text: 'Evaluate x(t) = ½(9.8)t² at t = 4 s. Give the answer in meters.',
        answer: '78.4',
        hint: '4² = 16. Then ½ × 9.8 × 16 = ½ × 156.8 = 78.4.',
      },
      {
        id: 'p0-003-assess-2',
        type: 'choice',
        text: 'In x(t), which is the independent variable?',
        options: ['x', 't', 'v', 'a'],
        answer: 't',
        hint: 'The independent variable is the input — the thing you choose. Time is the input; position is the output.',
      },
    ],
  },

  mentalModel: [
    'A function is a rule: one input → one output. x(t) maps time to position',
    'Independent variable = input (time t). Dependent variable = output (position x)',
    'Three kinematic functions: a(t)=constant, v(t)=v₀+at (linear), x(t)=x₀+v₀t+½at² (quadratic)',
    'Evaluating a function: write it out, substitute, compute exponents first, then multiply',
    'Domain: the range of valid inputs. A falling ball has domain 0 ≤ t ≤ t_ground',
    'x(t) is NOT x times t — it is position evaluated at time t',
  ],

  quiz: [
    {
      id: 'vars-q1',
      type: 'input',
      text: 'Evaluate x(t) = 5t² + 3t + 1 at t = 2. Give the integer answer.',
      answer: '27',
      hints: ['2² = 4. Then 5×4 = 20, 3×2 = 6. Sum: 20 + 6 + 1 = 27.'],
      reviewSection: 'Examples — evaluating x(t)',
    },
    {
      id: 'vars-q2',
      type: 'choice',
      text: 'A ball is thrown upward with v₀ = 15 m/s and a = −9.8 m/s². What is v(t)?',
      options: ['v(t) = 15t − 9.8', 'v(t) = 15 + 9.8t', 'v(t) = 15 − 9.8t', 'v(t) = 15 − ½(9.8)t²'],
      answer: 'v(t) = 15 − 9.8t',
      hints: ['v(t) = v₀ + at = 15 + (−9.8)t = 15 − 9.8t.'],
      reviewSection: 'Examples — kinematic functions',
    },
    {
      id: 'vars-q3',
      type: 'input',
      text: 'A car starts from rest (v₀=0) with a=6 m/s². Using v(t)=v₀+at, find v at t=5 s.',
      answer: '30',
      hints: ['v(5) = 0 + 6×5 = 30 m/s.'],
      reviewSection: 'Math — evaluating v(t)',
    },
    {
      id: 'vars-q4',
      type: 'choice',
      text: 'Which statement about x(t) = ½at² is correct?',
      options: [
        'x and t are multiplied — it means x times t',
        'The parentheses indicate function evaluation: position at time t',
        'The function equals ½ × a × t, then squared',
        'This notation is only valid when a = 9.8',
      ],
      answer: 'The parentheses indicate function evaluation: position at time t',
      hints: ['f(x) always means "evaluate f at x" — never f times x.'],
      reviewSection: 'Intuition — function notation',
    },
    {
      id: 'vars-q5',
      type: 'input',
      text: 'For x(t) = 20t − 5t², at what time t (in seconds) does x reach its maximum? (Hint: set v(t) = 0 where v(t) = dx/dt = 20 − 10t.)',
      answer: '2',
      hints: ['v(t) = 20 − 10t = 0 ⟹ t = 2 s.'],
      reviewSection: 'Examples — when does ball reach max height?',
    },
    {
      id: 'vars-q6',
      type: 'choice',
      text: 'For x(t) = 30t − 2.5t², what is the domain if the object starts at x=0 and returns to x=0?',
      options: ['0 ≤ t ≤ 6', '0 ≤ t ≤ 12', 'All real t', '0 ≤ t ≤ 2.5'],
      answer: '0 ≤ t ≤ 12',
      hints: ['Set 30t − 2.5t² = 0 ⟹ t(30 − 2.5t) = 0 ⟹ t = 0 or t = 12.'],
      reviewSection: 'Examples — domain of a physics function',
    },
    {
      id: 'vars-q7',
      type: 'choice',
      text: 'Which kinematic function is linear in t (for constant acceleration)?',
      options: ['x(t) = ½at²', 'v(t) = v₀ + at', 'x(t) = x₀ + v₀t + ½at²', 'a(t) = 0'],
      answer: 'v(t) = v₀ + at',
      hints: ['Linear means degree 1 in t — the graph is a straight line. v = v₀ + at has t to the first power.'],
      reviewSection: 'Rigor — linear functions',
    },
    {
      id: 'vars-q8',
      type: 'input',
      text: 'A car brakes from 24 m/s with a = −4 m/s². How far (in meters) does it travel before stopping?',
      answer: '72',
      hints: [
        'v(t) = 24 − 4t. Set v = 0: t = 6 s.',
        'x(6) = 24(6) − ½(4)(36) = 144 − 72 = 72 m.',
      ],
      reviewSection: 'Challenges — deceleration domain',
    },
  ],
}

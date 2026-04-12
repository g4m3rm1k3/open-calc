export default {
  id: 'p0-008',
  slug: 'algebra-vs-calculus',
  chapter: 'p0',
  order: 7,
  title: 'Algebra vs Calculus — When to Use Each',
  subtitle: 'The last bridge before Chapter 1: two mathematical languages, one physical reality.',
  tags: ['algebra', 'calculus', 'derivative', 'integral', 'constant acceleration', 'variable acceleration', 'SUVAT', 'limit', 'antiderivative'],

  hook: {
    question:
      'You know the five SUVAT equations from Lesson 3.They let you solve any constant-acceleration problem in a few steps. So why does Chapter 1 spend four lessons on derivatives and integrals?Why would you need calculus when algebra already works?Here is the answer: algebra works for constant acceleration. But in the real world, almost nothing has constant acceleration. A rocket burns fuel and gets lighter — its acceleration changes every second. A car engine provides varying force. A planet has gravitational acceleration that weakens with distance. For all of these, SUVAT fails completely. Calculus is the algebra of changing things — and the physical world never stops changing.',
    realWorldContext:
      'Orbital mechanics, electromagnetic fields, fluid dynamics, thermodynamics, quantum mechanics — none of these use constant acceleration. All of them use differential equations. The transition from algebra to calculus is the transition from toy problemsto the full power of physics. But here is the key insight: calculus is not a replacement for algebra. It is algebra extended — the same rules, applied to infinitely small changes. If you understand algebra deeply, calculus will feel natural.',
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'kinematic-chain' },
  },

  intuition: {
    prose: [
      '**What algebra can do — and where it stops. **Algebra is the language of fixed relationships: given \\(v_0, a, t\\), find \\(\\Delta x\\). The five SUVAT equations are algebraic formulas — they hold when \\(a\\) is constant. You can solve for any variable given the other four. This covers a surprisingly wide range of problems: anything with constant acceleration(free fall, constant engine thrust, uniform electric field). But the moment acceleration changes — even once — SUVAT breaks down.',

      '**What calculus adds — the language of change. **Calculus extends algebra to handle quantities that change continuously. The key operations:The **derivative** (Lesson 4 preview) — instantaneous rate of change. The **integral** — accumulation of a varying quantity over time. With these two tools:If you know \\(a(t)\\) (any function), integrate to get \\(v(t)\\). Integrate \\(v(t)\\) to get \\(x(t)\\). Differentiate \\(x(t)\\) to get \\(v(t)\\). Differentiate \\(v(t)\\) to get \\(a(t)\\). The kinematic chain works in both directions, for ANY acceleration.',

      '**The connection: calculus is the formal version of what you\'ve been doing informally. **Every concept in the last 7 lessons is a preview of a calculus concept:Instantaneous velocity (Lesson 4) → the derivative \\(dx/dt\\). Area under the v–t graph (Lesson 5) → the integral \\(\\int v\\,dt\\). The slope of the tangent → \\(d/dt\\). The secant line → difference quotient \\(\\Delta x/\\Delta t\\). The limit as \\(\\Delta t \\to 0\\) → the formal derivative. You already understand what these mean. Chapter 1 gives you the formal machinery to compute them.',

      '**When to use algebra, when to use calculus. ****Use algebra (SUVAT)** when: acceleration is constant, you have three known quantities, you want a quick answer. **Use calculus** when: acceleration varies with time (or position or velocity),you need to work with arbitrary motion, or you want to derive an equation from first principles. The good news: the SUVAT equations ARE derivable from calculus — they are special cases where \\(a\\) happens to be constant. Knowing this, you never need to memorize SUVAT as isolated formulas — you can always re-derive them.',

      '**A preview of Chapter 1. **Chapter 1 will formally introduce:(1) The derivative — with the limit definition and the power rule.(2) The kinematic derivative chain: \\(a = dv/dt\\), \\(v = dx/dt\\).(3) Antiderivatives and the kinematic integral chain: given \\(a(t)\\), integrate to find \\(v(t)\\), then \\(x(t)\\).(4) The connection between the area under a graph (Lesson 5) and the integral. Everything from Chapter 0 feeds directly into Chapter 1.You are ready.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 8 of 8 — Chapter 0: Complete',
        body:
          '**This lesson:** Algebra vs calculus — what each does, when to use each, the bridge.\\n**After this lesson:** Chapter 1 begins — kinematics with calculus.\\n**The payoff:** Every tool from Lessons 1–7 reappears in Chapter 1 with full power.\\n**You are ready. **',
      },
      {
        type: 'definition',
        title: 'Algebra: works for constant acceleration',
        body:
          '\\text{SUVAT: valid when } a = \\text{const.}\\\\\\text{v = v}_0 + at, \\quad \\Delta x = v_0 t + \\tfrac{1}{2}at^2, \\quad v^2 = v_0^2 + 2a\\Delta x\\\\\\text{Fast, powerful for constant-a problems — breaks for variable acceleration.}',
      },
      {
        type: 'definition',
        title: 'Calculus: works for any acceleration',
        body:
          'v(t) = v_0 + \\int_0^t a(\\tau)\\,d\\tau \\quad \\text{(integrate any } a(t)\\text{)}\\\\x(t) = x_0 + \\int_0^t v(\\tau)\\,d\\tau \\quad \\text{(integrate any } v(t)\\text{)}\\\\a(t) = \\frac{dv}{dt} = \\frac{d^2x}{dt^2} \\quad \\text{(differentiate once or twice)}',
      },
      {
        type: 'insight',
        title: 'SUVAT is a special case of calculus',
        body:
          '\\text{If } a(t) = a = \\text{const:}\\\\v(t) = v_0 + \\int_0^t a\\,d\\tau = v_0 + at\\\\x(t) = x_0 + \\int_0^t (v_0+a\\tau)\\,d\\tau = x_0 + v_0 t + \\tfrac{1}{2}at^2\\\\\\text{SUVAT falls out of calculus as a special case. You never need to memorize them separately.}',
      },
      {
        type: 'insight',
        title: 'The kinematic chain — going both directions',
        body:
          'x(t) \\xrightarrow{d/dt} v(t) \\xrightarrow{d/dt} a(t)\\\\a(t) \\xrightarrow{\\int dt} v(t) \\xrightarrow{\\int dt} x(t)\\\\\\text{Differentiate to go right (position → velocity → acceleration).}\\\\\\text{Integrate to go left (acceleration → velocity → position).}',
      },
      {
        type: 'warning',
        title: 'Never use SUVAT when acceleration is not constant',
        body:
          '\\text{SUVAT requires } a = \\text{const. If } a \\text{ depends on } t, v, \\text{ or } x: \\text{ use calculus.}\\\\\\text{Example: a car engine providing constant force on a slope where the normal force changes}\\\\\\text{is NOT constant acceleration. Always check the assumption before using SUVAT.}',
      },
    ],
    visualizations: [
      {
        id: 'PositionVelocityAcceleration',
        title: 'Constant vs variable acceleration — see why SUVAT fails',
        mathBridge: 'Use the "Braking" preset: the acceleration graph is a flat horizontal line (constant a = −2 m/s²). This is exactly when SUVAT works — constant a means v(t) is linear and x(t) is a parabola, matching SUVAT equations 1 and 3 exactly. Now switch to "Smooth cruise": the acceleration is a sine wave, constantly changing. The x-t and v-t curves are no longer simple shapes. SUVAT cannot describe this — you need to integrate a(t) directly. That is calculus. This is the dividing line: constant a → algebra (SUVAT). Variable a → calculus.',
        caption: 'Braking: flat a(t) → SUVAT works. Smooth cruise: wavy a(t) → must use ∫a dt. The shape of the bottom graph tells you which tool to reach for.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'The kinematic chain — algebra vs calculus on the same diagram',
        mathBridge: 'The arrows tell the full story. Going right (d/dt): this is calculus — differentiate x(t) to get v(t), differentiate v(t) to get a(t). These always work, for any motion. Going left (∫ dt): integrate a(t) to get v(t), integrate v(t) to get x(t). When a is constant, these integrals give the SUVAT equations. When a varies, the integrals still work — but they give different, more complex functions. Same chain, same operations, different difficulty.',
        caption: 'SUVAT is the special case of this chain where a = constant. Calculus is the general case.',
      },
    ],
  },

  math: {
    prose: [
      '**Deriving SUVAT from calculus — the complete derivation. **Start with \\(a = \\text{constant}\\). Integrate once: \\(v(t) = v_0 + \\int_0^t a\\,d\\tau = v_0 + at\\). This is equation (1). Integrate again: \\(x(t) = x_0 + \\int_0^t (v_0 + a\\tau)\\,d\\tau = x_0 + v_0 t + \\frac{1}{2}at^2\\). This is equation (3). Eliminate \\(t\\) between (1) and (3): \\(v^2 = v_0^2 + 2a\\Delta x\\). This is equation (5). The other two are just algebraic combinations. You have now derived all five SUVAT equations from two integrals.',
      '**What to do when acceleration varies. **Say \\(a(t) = 3t^2\\) (increasing with time). Integrate: \\(v(t) = v_0 + \\int_0^t 3\\tau^2\\,d\\tau = v_0 + t^3\\). Integrate again: \\(x(t) = x_0 + \\int_0^t (v_0 + \\tau^3)\\,d\\tau = x_0 + v_0 t + \\frac{t^4}{4}\\). SUVAT would give the wrong answer here. Calculus gives the right one.',
      '**The power rule preview — the key to computing derivatives. **For \\(x(t) = t^n\\): the derivative is \\(\\frac{dx}{dt} = nt^{n-1}\\). This is the Power Rule — the most important single result in differential calculus. Examples:\\(d/dt(t^2) = 2t\\),\\(d/dt(t^3) = 3t^2\\),\\(d/dt(t^4) = 4t^3\\),\\(d/dt(c) = 0\\) (constant). With this rule and linearity (derivative of a sum = sum of derivatives),you can differentiate any polynomial.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Deriving all of SUVAT from two integrals',
        body:
          '\\text{Start: } a = \\text{const}\\\\\\text{Integrate once: } v = v_0 + at \\quad\\text{(eq. 1)}\\\\\\text{Integrate again: } x = x_0 + v_0 t + \\tfrac{1}{2}at^2 \\quad\\text{(eq. 3)}\\\\\\text{Eliminate } t\\text{: } v^2 = v_0^2 + 2a\\Delta x \\quad\\text{(eq. 5)}\\\\\\text{Equations 2 and 4 follow by algebra. All five derived.}',
      },
      {
        type: 'theorem',
        title: 'The Power Rule (preview)',
        body:
          '\\frac{d}{dt}(t^n) = n t^{n-1}\\\\\\text{Examples: }\\\\\\frac{d}{dt}(t^2) = 2t, \\quad \\frac{d}{dt}(t^3) = 3t^2, \\quad \\frac{d}{dt}(c) = 0\\\\\\text{With linearity: } \\frac{d}{dt}(v_0 + at) = a \\quad \\checkmark',
      },
      {
        type: 'insight',
        title: 'The antiderivative (reverse of differentiation)',
        body:
          '\\text{If } \\frac{d}{dt}f(t) = g(t)\\text{, then } \\int g(t)\\,dt = f(t) + C\\\\\\text{Antiderivative of } at: \\tfrac{1}{2}at^2 + C\\\\\\text{Antiderivative of } v_0 + at: v_0 t + \\tfrac{1}{2}at^2 + C = x(t)\\\\\\text{The constant } C \\text{ is determined by initial conditions.}',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'riemann-rect' },
        title: 'Integration as area: Riemann sum → antiderivative',
        mathBridge:
          'Earlier (Lesson 5) we said "area under v–t = displacement."Now we give it a name: the integral ∫v dt = displacement = x(t) − x₀.The Riemann rectangles are an approximation. The antiderivative gives the exact area — no approximation needed.',
        caption: 'The integral = exact area = the reverse of differentiation. This is the Fundamental Theorem.',
      },
      {
        id: 'PythonNotebook',
        title: 'Algebra vs Calculus — solve the same problem two ways',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Stage 1 — SUVAT (Algebra) for Constant Acceleration',
              prose: 'Use the SUVAT equations to solve a constant-acceleration problem.',
              instructions: 'Run. These are the algebraic equations — valid ONLY for constant a.',
              code:
                '# Problem: v0=0, a=5 m/s² (constant). Find x(t) and v(t).\nv0 = 0; a = 5  # constant acceleration\n\nprint("SUVAT (algebra) solution:")\nprint(f"{\'t (s)\':>8}  {\'v = v0+at\':>12}  {\'x = ½at²\':>12}")\nprint("-" * 36)\nfor t in range(6):\n    v = v0 + a*t\n    x = v0*t + 0.5*a*t**2\n    print(f"{t:>8.1f}  {v:>12.2f}  {x:>12.2f}")',
              output: '',
              status: 'idle',
            },
            {
              id: 2,
              cellTitle: 'Stage 2 — Calculus for Variable Acceleration',
              prose: 'Now a(t) = 2t (doubles every second). SUVAT fails. We integrate numerically.',
              instructions: 'Run. Compare to Stage 1 — completely different motion with variable a.',
              code:
                'import numpy as np\n\n# Variable acceleration: a(t) = 2t m/s²\n# SUVAT would be wrong here. Use numerical integration.\n\ndt = 0.01  # small time step\nT = 5.0    # simulate for 5 seconds\n\ntimes = np.arange(0, T+dt, dt)\nv = np.zeros_like(times)\nx = np.zeros_like(times)\n\nfor i in range(1, len(times)):\n    t_prev = times[i-1]\n    a = 2 * t_prev  # a(t) = 2t — variable!\n    v[i] = v[i-1] + a * dt  # v(t) = ∫a dt\n    x[i] = x[i-1] + v[i-1] * dt  # x(t) = ∫v dt\n\nprint("Variable acceleration a(t) = 2t — integrated numerically:")\nprint(f"{\'t\':>6}  {\'v\':>10}  {\'x\':>10}")\nfor t, vi, xi in zip(times[::100], v[::100], x[::100]):\n    print(f"{t:>6.1f}  {vi:>10.4f}  {xi:>10.4f}")\n\nprint(f"\\nExact (from calculus): v(5)=∫₀⁵2t dt=[t²]₀⁵=25 m/s")',
              output: '',
              status: 'idle',
            },
            {
              id: 3,
              cellTitle: 'Stage 3 — Derive SUVAT from Calculus Symbolically',
              prose: 'Using sympy, integrate a=constant to recover v(t) and x(t).',
              instructions: 'Run. Watch the SUVAT equations emerge from two integrations.',
              code:
                'try:\n    from sympy import symbols, integrate, simplify\n    t, a_sym, v0_sym, x0_sym = symbols("t a v_0 x_0")\n\n    # Integrate constant a to get v(t)\n    v_t = v0_sym + integrate(a_sym, t)\n    print(f"v(t) = {v_t}   ← This is SUVAT equation 1")\n\n    # Integrate v(t) to get x(t)\n    x_t = x0_sym + integrate(v_t, t)\n    print(f"x(t) = {x_t}   ← This is SUVAT equation 3")\n\n    print("\\nSUVAT derived from two integrals!")\nexcept ImportError:\n    print("sympy not available. The derivation:")\n    print("∫a dt = at + C = at + v₀  (set C=v₀ using v(0)=v₀)")\n    print("∫(v₀+at) dt = v₀t + ½at² + C = x₀ + v₀t + ½at²  (set C=x₀)")',
              output: '',
              status: 'idle',
            },
            {
              id: 11,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Challenge — Integrate a(t) = 6t numerically to find v(3)',
              difficulty: 'medium',
              prompt:
                'Given a(t) = 6t, v₀ = 0. Use numerical integration (dt=0.001) to find v(3). Store the final velocity in v_final. Exact answer: ∫₀³ 6t dt = [3t²]₀³ = 27 m/s.',
              instructions:
                '1. dt = 0.001\n2. Loop from t=0 to t=3 in steps of dt.\n3. v += a(t)*dt at each step.',
              code:
                'dt = 0.001\nv_final = 0.0  # start from rest\nT = 3.0\n\n# Your integration loop here:\n\nprint(f"v(3) ≈ {v_final:.4f} m/s")\nprint(f"Exact: 27.0 m/s")',
              output: '',
              status: 'idle',
              testCode:
                '\nif abs(v_final - 27.0) > 0.1:\n    raise ValueError(f"Expected ≈27.0 m/s, got {v_final:.4f}")\nres = f"SUCCESS: v(3) ≈ {v_final:.4f} m/s. Exact: 27.0 m/s."\nres\n',
              hint:
                'import numpy as np\nfor t in np.arange(0, T, dt):\n    a_t = 6 * t\n    v_final += a_t * dt',
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**The Fundamental Theorem of Calculus — stated for kinematics. **If \\(v(t) = dx/dt\\), then \\(\\int_a^b v(t)\\,dt = x(b) - x(a)\\). In words: the net displacement equals the definite integral of velocity. Differentiation and integration are inverse operations. This is not a definition — it is a theorem, proved from the limit definitions of both operations. You will prove it formally in Chapter 4.Here: note that kinematics is its first physical application.',
      '**Differential equations — the full power of calculus in physics. **Newton\'s Second Law is \\(F = ma = m\\frac{d^2x}{dt^2}\\). This is a **differential equation** ��� an equation involving \\(x\\) and its derivatives. Solving it means finding \\(x(t)\\) given the force \\(F\\). For \\(F = \\text{const}\\): algebra (SUVAT) suffices. For \\(F = F(t)\\): integrate. For \\(F = F(v)\\) (drag): separation of variables. For \\(F = F(x)\\) (spring): second-order differential equation, solutions are sinusoids. This is the program for all of Chapter 4 through 8.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Fundamental Theorem of Calculus (kinematic version)',
        body:
          'x(b) - x(a) = \\int_a^b v(t)\\,dt\\\\v(b) - v(a) = \\int_a^b a(t)\\,dt\\\\\\text{Differentiation and integration are inverses.}\\\\\\text{This is the deepest result in all of calculus.}',
      },
      {
        type: 'definition',
        title: 'Differential equation',
        body:
          '\\text{An equation relating a function to its own derivatives.}\\\\\\text{Example: Newton\'s second law: } m\\frac{d^2x}{dt^2} = F(t)\\\\\\text{Solving it means finding } x(t) \\text{ that satisfies the equation.}\\\\\\text{SUVAT is the solution when } F = \\text{const.}',
      },
      {
        type: 'insight',
        title: 'The program of this entire course',
        body:
          '\\text{Ch. 0 (now): preview of all tools — algebra, functions, graphs, limits.}\\\\\\text{Ch. 1-2: derivatives and integrals — the kinematic chain formally.}\\\\\\text{Ch. 3: Newton\'s laws — } F = ma \\text{ as a differential equation.}\\\\\\text{Ch. 4+: energy, momentum, rotation — all via calculus.}\\\\\\text{Each chapter adds one layer. The foundation is here.}',
      },
    ],
    proofSteps: [
      {
        expression: '\\text{Claim: } v^2 = v_0^2 + 2a\\Delta x \\text{ (SUVAT eq. 5) follows from calculus}',
        annotation: 'Derive SUVAT equation 5 without using time.',
      },
      {
        expression: 'a = \\frac{dv}{dt} = \\frac{dv}{dx} \\cdot \\frac{dx}{dt} = v\\frac{dv}{dx}',
        annotation: 'Chain rule: a = v (dv/dx). This eliminates t from Newton\'s second law.',
      },
      {
        expression: 'v\\,dv = a\\,dx',
        annotation: 'Separate variables.',
      },
      {
        expression: '\\int_{v_0}^{v} v\'\\,dv\' = \\int_0^{\\Delta x} a\\,dx\'',
        annotation: 'Integrate both sides.',
      },
      {
        expression: '\\tfrac{1}{2}v^2 - \\tfrac{1}{2}v_0^2 = a\\Delta x',
        annotation: 'Evaluate integrals (a is constant).',
      },
      {
        expression: 'v^2 = v_0^2 + 2a\\Delta x \\quad \\checkmark',
        annotation: 'SUVAT equation 5 — derived using the chain rule and integration. No time needed.',
      },
    ],
    title: 'Deriving v² = v₀² + 2aΔx using the chain rule',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'The complete kinematic chain — everything connects',
        mathBridge:
          'Look at this diagram one final time, with the entire Chapter 0 behind you. The left-pointing arrows are integrals. The right-pointing arrows are derivatives. Position, velocity, and acceleration are three views of the same object in motion. Calculus lets you move between any two of them, for any motion whatsoever.',
        caption: 'This diagram is the skeleton of all of mechanics. Chapter 1 fills in the flesh.',
      },
    ],
  },

  examples: [
    {
      id: 'p0-008-ex1',
      title: 'When to use SUVAT vs calculus — identifying the right tool',
      problem:
        '\\text{For each scenario, state whether SUVAT (algebra) or calculus is needed:}\\\\\\text{(a) Ball dropped from rest, no air resistance.}\\\\\\text{(b) Rocket with thrust decreasing as fuel burns.}\\\\\\text{(c) Car accelerating uniformly from a stop sign.}\\\\\\text{(d) Satellite orbiting Earth (gravity varies with distance).}',
      steps: [
        { expression: '\\text{(a) SUVAT — acceleration = } g = \\text{const. No air resistance.}', annotation: 'Constant acceleration. SUVAT works perfectly.' },
        { expression: '\\text{(b) Calculus — thrust changes as fuel mass decreases. } a = a(t)\\text{.}', annotation: 'Variable acceleration. SUVAT fails.' },
        { expression: '\\text{(c) SUVAT — "uniformly" means constant acceleration.}', annotation: 'The word "uniform" signals SUVAT is valid.' },
        { expression: '\\text{(d) Calculus — gravity } F = GMm/r^2 \\text{ depends on position. } a = a(x)\\text{.}', annotation: 'Acceleration depends on position — differential equation needed.' },
      ],
      conclusion:
        'SUVAT works for (a) and (c). Calculus required for (b) and (d). The keyword is "constant" — if anything about the acceleration changes, use calculus.',
    },
    {
      id: 'p0-008-ex2',
      title: 'Deriving SUVAT from integrals — the complete derivation',
      problem:
        '\\text{Starting from } a = \\text{const}, \\text{ derive } v(t) \\text{ and } x(t) \\text{ by integration.}',
      steps: [
        {
          expression: 'v(t) = v_0 + \\int_0^t a\\,d\\tau = v_0 + [a\\tau]_0^t = v_0 + at',
          annotation: 'Integrate a = const. The integral of a constant is a·t. Add initial condition v₀.',
        },
        {
          expression: 'x(t) = x_0 + \\int_0^t v(\\tau)\\,d\\tau = x_0 + \\int_0^t (v_0 + a\\tau)\\,d\\tau',
          annotation: 'Integrate v(t) = v₀ + at. Add initial condition x₀.',
        },
        {
          expression: '= x_0 + \\left[v_0 \\tau + \\frac{1}{2}a\\tau^2\\right]_0^t = x_0 + v_0 t + \\frac{1}{2}at^2',
          annotation: 'Evaluate the integral at τ=t and τ=0. SUVAT equation 3 derived.',
        },
      ],
      conclusion:
        'v = v₀ + at (eq.1) and x = x₀ + v₀t + ½at² (eq.3) are derived from two integrations. The five SUVAT equations are just these two, with algebraic combinations.',
    },
    {
      id: 'p0-008-ex3',
      title: 'Variable acceleration: a(t) = 6t',
      problem:
        '\\text{A particle starts from rest (} v_0 = 0, x_0 = 0\\text{) with acceleration } a(t) = 6t\\,\\text{m/s}^2.\\text{Find } v(t) \\text{ and } x(t).}',
      steps: [
        {
          expression: 'v(t) = v_0 + \\int_0^t 6\\tau\\,d\\tau = 0 + \\left[3\\tau^2\\right]_0^t = 3t^2',
          annotation: 'Integrate a(t) = 6t. The antiderivative of 6τ is 3τ². Apply v₀ = 0.',
        },
        {
          expression: 'x(t) = x_0 + \\int_0^t 3\\tau^2\\,d\\tau = 0 + \\left[\\tau^3\\right]_0^t = t^3',
          annotation: 'Integrate v(t) = 3t². The antiderivative of 3τ² is τ³. Apply x₀ = 0.',
        },
        {
          expression: '\\text{Check: } \\frac{d}{dt}(t^3) = 3t^2 \\checkmark \\quad \\frac{d}{dt}(3t^2) = 6t \\checkmark',
          annotation: 'Differentiate x to get v, differentiate v to get a. Both check out.',
        },
      ],
      conclusion: 'v(t) = 3t² m/s, x(t) = t³ m. SUVAT would give wrong answers — this motion is cubic, not quadratic.',
    },
  ],

  challenges: [
    {
      id: 'p0-008-ch1',
      difficulty: 'easy',
      problem:
        '\\text{Using the Power Rule, differentiate: (a) } x = 5t^3, \\text{ (b) } x = 2t^4 + 3t^2, \\text{ (c) } x = 7t.}',
      hint: 'Power rule: d/dt(t^n) = n·t^(n-1). For a sum, differentiate each term.',
      walkthrough: [
        { expression: '\\text{(a) } \\frac{d}{dt}(5t^3) = 15t^2', annotation: 'Bring down the 3, reduce exponent by 1.' },
        { expression: '\\text{(b) } \\frac{d}{dt}(2t^4 + 3t^2) = 8t^3 + 6t', annotation: 'Differentiate each term separately.' },
        { expression: '\\text{(c) } \\frac{d}{dt}(7t) = 7', annotation: 'd/dt(t^1) = 1·t^0 = 1. So d/dt(7t) = 7.' },
      ],
      answer: '(a) 15t². (b) 8t³ + 6t. (c) 7.',
    },
    {
      id: 'p0-008-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A particle has } a(t) = 12t^2\\,\\text{m/s}^2, \\text{ } v_0 = 5\\,\\text{m/s, } x_0 = 0.\\text{Find } v(t) \\text{ and } x(t).}',
      hint: 'Integrate 12t² to get v(t). Add v₀ = 5. Integrate v(t) to get x(t). Add x₀ = 0.',
      walkthrough: [
        {
          expression: 'v(t) = 5 + \\int_0^t 12\\tau^2\\,d\\tau = 5 + 4t^3',
          annotation: 'Antiderivative of 12τ² is 4τ³.',
        },
        {
          expression: 'x(t) = 0 + \\int_0^t (5 + 4\\tau^3)\\,d\\tau = 5t + t^4',
          annotation: 'Antiderivative of 5 is 5τ; antiderivative of 4τ³ is τ⁴.',
        },
      ],
      answer: 'v(t) = 5 + 4t³ m/s. x(t) = 5t + t⁴ m.',
    },
    {
      id: 'p0-008-ch3',
      difficulty: 'hard',
      problem:
        '\\text{Derive SUVAT equation 2 (} \\Delta x = \\frac{1}{2}(v_0+v)\\Delta t\\text{) algebraically from equations 1 and 3.Then verify that this is also the area of a trapezoid under the v–t graph.}',
      hint:
        'From eq.1: t = (v−v₀)/a. Substitute into eq.3.For the trapezoid: area = ½(top+bottom)×height = ½(v₀+v)×t.',
      walkthrough: [
        {
          expression: '\\text{From eq.1: } t = \\frac{v-v_0}{a}',
          annotation: 'Solve eq.1 for t.',
        },
        {
          expression: '\\Delta x = v_0 \\cdot \\frac{v-v_0}{a} + \\tfrac{1}{2}a \\cdot \\left(\\frac{v-v_0}{a}\\right)^2',
          annotation: 'Substitute into eq.3.',
        },
        {
          expression: '= \\frac{v_0(v-v_0)}{a} + \\frac{(v-v_0)^2}{2a} = \\frac{2v_0(v-v_0) + (v-v_0)^2}{2a}',
          annotation: 'Common denominator.',
        },
        {
          expression: '= \\frac{(v-v_0)(2v_0 + v - v_0)}{2a} = \\frac{(v-v_0)(v+v_0)}{2a} = \\frac{v^2-v_0^2}{2a}',
          annotation: 'Factor.',
        },
        {
          expression: '\\text{Also: } \\Delta x = \\tfrac{1}{2}(v_0+v)t = \\tfrac{1}{2}(v_0+v)\\cdot\\frac{v-v_0}{a} = \\frac{v^2-v_0^2}{2a} \\quad \\checkmark',
          annotation: 'Confirmed — both paths lead to the same result.',
        },
        {
          expression: '\\text{Trapezoid: height = } t\\text{, parallel sides = } v_0, v\\text{. Area = } \\tfrac{1}{2}(v_0+v)t = \\Delta x \\quad \\checkmark',
          annotation: 'This is exactly the area of the trapezoid under the v–t line. Geometry confirms algebra.',
        },
      ],
      answer: 'Δx = ½(v₀+v)t. Derived from eqs.1 and 3 by algebra. Also the trapezoid area under the v–t graph.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\frac{d}{dt}', meaning: 'differentiate with respect to t — instantaneous rate of change' },
      { symbol: '\\int_a^b f(t)\\,dt', meaning: 'definite integral — net accumulation of f from t=a to t=b' },
      { symbol: '\\frac{d}{dt}(t^n) = nt^{n-1}', meaning: 'Power Rule — the key to differentiating all polynomials' },
      { symbol: '\\int t^n\\,dt = \\frac{t^{n+1}}{n+1} + C', meaning: 'Power Rule for integration — raises exponent, divides by new exponent' },
      { symbol: 'a = \\text{const} \\Rightarrow \\text{SUVAT}', meaning: 'constant acceleration is the only condition when SUVAT applies' },
      { symbol: 'a = a(t) \\Rightarrow \\text{calculus}', meaning: 'variable acceleration always requires integration' },
    ],
    rulesOfThumb: [
      'If acceleration is constant — SUVAT. If it changes — integrate.',
      'The Power Rule: bring down the exponent, reduce it by 1. d/dt(t^n) = nt^{n-1}.',
      'The integral undoes the derivative and vice versa — they are inverses.',
      'Always add the initial condition after integrating: v₀ after the first integral, x₀ after the second.',
      'Check your answer by differentiating: if d/dt(x(t)) = v(t) and d/dt(v(t)) = a(t), you\'re correct.',
    ],
  },

  spiral: {
    recoveryPoints: [
      {
        lessonId: 'p0-004',
        label: 'Lesson 4 — Average vs Instantaneous',
        note: 'The derivative was previewed in Lesson 4 as the limit of Δx/Δt. If the formal definition feels abstract, re-read Lesson 4.',
      },
      {
        lessonId: 'p0-005',
        label: 'Lesson 5 — Graphs as Physics',
        note: 'The integral as area under the v–t curve was introduced in Lesson 5. Lesson 5 is the geometric foundation of the integral.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'p1-ch2-007',
        label: 'Ch. 2, Lesson 7 — Definition of dx/dt',
        note: 'Chapter 2 formalizes the derivative: limit definition, power rule, chain rule.',
      },
      {
        lessonId: 'p1-ch2-009',
        label: 'Ch. 2, Lesson 9 — Displacement from Velocity Area',
        note: 'Chapter 2 formalizes the integral as area under the v–t curve.',
      },
      {
        lessonId: 'p1-ch4-001',
        label: 'Ch. 4 — Newton\'s First Law',
        note: 'F = ma is m(d²x/dt²) = F — a differential equation. Everything in Ch.4 uses the calculus from Ch.2.',
      },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'p0-008-assess-1',
        type: 'choice',
        text: 'Which scenario requires calculus rather than SUVAT?',
        options: [
          'Ball dropped from rest with no air resistance',
          'Car accelerating uniformly from 0 to 30 m/s',
          'Rocket burning fuel — thrust and mass both change over time',
          'Projectile launched at constant angle',
        ],
        answer: 'Rocket burning fuel — thrust and mass both change over time',
        hint: 'Variable acceleration means SUVAT fails. Need calculus.',
      },
      {
        id: 'p0-008-assess-2',
        type: 'input',
        text: 'Using the Power Rule, what is d/dt(4t³)?',
        answer: '12t^2',
        hint: 'd/dt(4t³) = 4·3·t^(3-1) = 12t².',
      },
    ],
  },

  mentalModel: [
    'SUVAT = algebra for constant acceleration only. If a changes, use calculus.',
    'Derivative: d/dt is the instantaneous rate of change — slope of the function at a point',
    'Integral: ∫ is accumulation — area under the curve — the reverse of differentiation',
    'Power Rule: d/dt(t^n) = nt^{n-1}. Power Rule for integration: ∫t^n dt = t^{n+1}/(n+1) + C',
    'Kinematic chain: x → v → a by differentiation; a → v → x by integration',
    'SUVAT is derived by integrating a=const twice — every SUVAT equation has a calculus proof',
    'Chapter 1 formalizes what Chapter 0 previewed. You already know the concepts.',
  ],

  quiz: [
    {
      id: 'calc-q1',
      type: 'choice',
      text: 'Which operation recovers position from velocity?',
      options: ['Differentiation', 'Integration', 'Multiplication by t', 'Division by t'],
      answer: 'Integration',
      hints: ['v = dx/dt → integrate both sides → x = ∫v dt.'],
      reviewSection: 'Intuition — kinematic chain',
    },
    {
      id: 'calc-q2',
      type: 'input',
      text: 'Using the Power Rule, find d/dt(6t²). The answer is at (give as number times t).',
      answer: '12t',
      hints: ['d/dt(6t²) = 6·2·t^(2-1) = 12t.'],
      reviewSection: 'Math — Power Rule',
    },
    {
      id: 'calc-q3',
      type: 'choice',
      text: 'SUVAT equations are valid ONLY when:',
      options: [
        'The object starts from rest',
        'Acceleration is constant',
        'The object moves in a straight line',
        'Time is measured in seconds',
      ],
      answer: 'Acceleration is constant',
      hints: ['SUVAT assumes a = const throughout the motion. If a changes at all, SUVAT fails.'],
      reviewSection: 'Intuition — algebra vs calculus',
    },
    {
      id: 'calc-q4',
      type: 'choice',
      text: 'For a(t) = 4t, what is v(t) starting from v₀=0?',
      options: ['v = 4', 'v = 2t²', 'v = 4t²', 'v = t²/2'],
      answer: 'v = 2t²',
      hints: ['∫4t dt = 4·t²/2 = 2t². Add v₀=0: v(t) = 2t².'],
      reviewSection: 'Examples — variable acceleration integration',
    },
    {
      id: 'calc-q5',
      type: 'choice',
      text: 'What does the Fundamental Theorem of Calculus say about differentiation and integration?',
      options: [
        'Differentiation is always harder than integration',
        'They are inverse operations — one undoes the other',
        'They give the same result for constant functions',
        'Integration requires the Power Rule',
      ],
      answer: 'They are inverse operations — one undoes the other',
      hints: ['d/dt∫f dt = f. And ∫(d/dt f) dt = f + C. They undo each other.'],
      reviewSection: 'Rigor — Fundamental Theorem',
    },
    {
      id: 'calc-q6',
      type: 'input',
      text: 'The antiderivative of 9t² (with +C=0 and initial condition giving constant=0) is:',
      answer: '3t^3',
      hints: ['∫9t² dt = 9·t³/3 = 3t³. The exponent increases by 1; divide by the new exponent.'],
      reviewSection: 'Math — Power Rule for integration',
    },
    {
      id: 'calc-q7',
      type: 'choice',
      text: 'SUVAT equation v² = v₀² + 2aΔx was derived in the Rigor section using:',
      options: [
        'Pure algebra from the first two equations',
        'The chain rule: a = v(dv/dx), then integration',
        'The Power Rule applied to x(t)',
        'A graph of v vs t',
      ],
      answer: 'The chain rule: a = v(dv/dx), then integration',
      hints: ['The chain rule rewrites a = dv/dt as a = v·dv/dx, eliminating time. Then integrate.'],
      reviewSection: 'Rigor — deriving v²=v₀²+2aΔx using chain rule',
    },
    {
      id: 'calc-q8',
      type: 'choice',
      text: 'Why does calculus extend algebra rather than replacing it?',
      options: [
        'Algebra is faster for all problems',
        'Calculus only works on computer',
        'For constant acceleration, both give identical results — algebra is simpler then; calculus is needed when acceleration varies',
        'Algebra cannot solve any physics problems',
      ],
      answer: 'For constant acceleration, both give identical results — algebra is simpler then; calculus is needed when acceleration varies',
      hints: ['SUVAT = calculus with a=constant. Calculus is the more general tool; algebra is the special case.'],
      reviewSection: 'Intuition — when to use each',
    },
  ],
}

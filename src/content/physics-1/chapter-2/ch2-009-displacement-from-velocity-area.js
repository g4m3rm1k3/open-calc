export default {
  id: 'p1-ch2-009',
  slug: 'displacement-from-velocity-area',
  chapter: 'p2',
  order: 9,
  title: "Displacement from Velocity Area",
  subtitle:
    "Why the area under a v–t curve gives exact displacement — the Fundamental Theorem of Calculus in physics.",
  tags: ["integration", "velocity", "area", "Riemann sum", "FTC", "fundamental theorem", "displacement"],
  aliases: "area under velocity graph integration displacement riemann sums fundamental theorem",

  hook: {
    question:
      "A car's velocity sensor records v(t) = 10 + 2t m/s (speeding up steadily). After 5 seconds, how far has the car traveled? You cannot use Δx = v·Δt directly because v is changing. What do you do?",
    realWorldContext:
      "Inertial navigation systems (INS) in aircraft, submarines, and spacecraft have no GPS signal — they rely entirely on onboard accelerometers. The accelerometers measure acceleration, which is integrated to get velocity, which is integrated again to get position. This double integration has been computing aircraft positions since before GPS existed. The accuracy of long-range flight depends on how precisely you can integrate a noisy sensor signal — the mathematical foundation is the definite integral, derived from the area-under-the-curve principle in this lesson.",
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      `Before reading on, predict: a car's velocity increases linearly from $v = 10$ m/s to $v = 20$ m/s over 5 seconds. The average velocity is 15 m/s. Without any calculus, can you find the displacement? What shape is the region under the v–t line? What is its area? Write your prediction before continuing.`,
      "When velocity is constant, displacement is trivial: Δx = v·Δt. On a v–t graph, this is the area of a rectangle (width = Δt, height = v). This works perfectly for constant velocity — but what about varying velocity?",
      "The key idea: divide the time interval into many small pieces, so small that velocity barely changes within each piece. Treat velocity as approximately constant on each piece, compute Δx ≈ v(tᵢ)·Δt for each, and add them all up. This gives an approximation to total displacement as a sum of rectangle areas. The more pieces you use, the better the approximation. In the limit of infinitely many, infinitely thin pieces, the approximation becomes exact — and the exact value is the definite integral.",
      "This is a Riemann sum: Δx ≈ Σᵢ v(tᵢ)·Δt. As the number of pieces n → ∞ (and Δt → 0), the Riemann sum converges to ∫v(t) dt. The area under the v–t curve IS the displacement, not approximately but exactly, because that area is defined as the limit of Riemann sums.",
      `The sign of area matters: when v > 0 (curve above t-axis), the object moves in the positive direction and area adds to displacement. When v < 0 (curve below t-axis), the object moves backward and area subtracts from displacement. Net displacement is the signed area ($\\int v\\,dt$ evaluated normally). Total distance is the unsigned area ($\\int |v|\\,dt$). Always identify which the problem asks for.`,
      "This lesson is where integration meets physics. If you are taking calculus simultaneously, you are learning the definite integral as an abstract area-under-a-curve. This lesson shows you the physical content of that integral: it is displacement. Every integral you compute in calculus has a potential physical meaning as area, displacement, volume, or accumulated quantity — velocity integration is just the clearest, most visceral example.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Three approaches to computing displacement from v(t)',
        body: `1. Algebra (constant $v$ or piece-wise linear $v$): use rectangle ($v \\cdot \\Delta t$) or trapezoid ($\\tfrac{1}{2}(v_0+v)\\Delta t$) area formulas — no calculus needed. 2. Antiderivative: find $V(t)$ with $V'(t) = v(t)$, then $\\Delta x = V(t_2) - V(t_1)$ (FTC). 3. Numerical integration (e.g., scipy.integrate.quad): for any $v(t)$ given as code or tabulated data.`,
      },
      {
        type: 'insight',
        title: 'From constant to varying: the Riemann sum idea',
        body: `Constant $v$ → $\\Delta x = v \\cdot \\Delta t$ (rectangle area). Varying $v$ → divide into $n$ pieces → $v \\approx$ constant on each → $\\Delta x_i \\approx v(t_i)\\Delta t$ → sum: $\\Delta x \\approx \\sum v(t_i)\\Delta t$. As $n \\to \\infty$ ($\\Delta t \\to 0$): sum $\\to \\int v(t)\\,dt$ = exact displacement. The rectangle sum IS the integral — in the limit.`,
      },
      {
        type: 'insight',
        title: 'Calculus connection: this IS the definite integral',
        body: `The Riemann sum $\\sum v(t_i)\\Delta t$ converging to $\\int v(t)\\,dt$ is exactly how the definite integral is defined in Calculus Chapter 4. The area-under-a-curve interpretation in calculus IS displacement in kinematics. The FTC then says: since $v = dx/dt$, we have $\\int v\\,dt = x(t_2) - x(t_1) = \\Delta x$ — the area equals the change in position.`,
      },
      {
        type: 'insight',
        title: 'Triangle and trapezoid areas (algebra-only case)',
        body: `For piece-wise linear v–t graphs (constant acceleration), compute exact displacement using geometry alone: rectangle area $= $ base $\\times$ height; triangle area $= \\tfrac{1}{2} \\times$ base $\\times$ height; trapezoid area $= \\tfrac{1}{2}(v_0+v) \\times t$. Calculus is necessary only when $v(t)$ is nonlinear and the area cannot be computed by simple geometry.`,
      },
      {
        type: 'warning',
        title: 'Displacement ≠ total distance',
        body: `Signed area (above axis $+$, below axis $-$) gives net displacement. Unsigned area (all positive) gives total distance traveled. If a car goes 30 m forward then 10 m backward, displacement $= +20$ m but distance $= 40$ m. Split the integral at zero-crossings of $v$ to compute distance separately for each phase.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-trapezoid' },
        title: 'Algebra works for constant acceleration',
        caption: 'When v(t) is a straight line, the area under it is exactly a trapezoid: ½(v₀+v)t. No calculus needed. Calculus becomes necessary only when v(t) is curved.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'riemann-rect' },
        title: 'Riemann sum converges to exact integral',
        caption: `Increase the number of rectangles: each has height v(tᵢ) and width Δt. As n → ∞ (Δt → 0), the sum Σ v(tᵢ)Δt converges to the exact ∫v dt = displacement. Error ∝ 1/n for left/right Riemann sums.`,
      },
    ],
  },

  math: {
    prose: [
      `For constant velocity: $\\Delta x = v \\cdot \\Delta t$ (rectangle area — algebra only). For constant acceleration (linear v–t): use the trapezoid area $\\Delta x = \\tfrac{1}{2}(v_0 + v) \\cdot \\Delta t$. This gives the SUVAT formula $\\Delta x = \\tfrac{1}{2}(v_0+v)t$. Both are exact for constant acceleration — derived by geometry, no calculus needed.`,
      `For arbitrary $v(t)$: $\\Delta x = \\int_{t_1}^{t_2} v(t)\\,dt$. Evaluate by finding an antiderivative $V(t)$ (a function with $V'(t) = v(t)$) and computing $V(t_2) - V(t_1)$. This is the FTC. For $v(t) = 10 + 2t$: antiderivative is $V(t) = 10t + t^2$. Displacement from 0 to 5 s: $V(5) - V(0) = (50+25) - 0 = 75$ m.`,
      `For $v(t)$ with a direction reversal, split the integral at the zero-crossing. If $v$ changes sign at $t = t_s$, compute $\\int_{t_1}^{t_s} v\\,dt + \\int_{t_s}^{t_2} v\\,dt$ for net displacement. Their sum of absolute values gives total distance: $\\left|\\int_{t_1}^{t_s} v\\,dt\\right| + \\left|\\int_{t_s}^{t_2} v\\,dt\\right|$. Taking $|\\int_{t_1}^{t_2} v\\,dt|$ is wrong (the phases cancel).`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Displacement integral',
        body: `\\Delta x = \\int_{t_1}^{t_2} v(t)\\,dt = V(t_2) - V(t_1) \\quad \\text{where } V'(t) = v(t)`,
      },
      {
        type: 'definition',
        title: 'Constant-acceleration trapezoid rule (algebra)',
        body: `\\Delta x = \\frac{1}{2}(v_0 + v)\\,\\Delta t = v_0 t + \\frac{1}{2}at^2`,
      },
      {
        type: 'definition',
        title: 'Total distance vs displacement',
        body: `\\text{Distance} = \\int_{t_1}^{t_2} |v(t)|\\,dt \\geq |\\Delta x|`,
      },
      {
        type: 'insight',
        title: 'Finding antiderivatives for common v(t)',
        body: `$\\int t^n\\,dt = \\frac{t^{n+1}}{n+1} + C$, $\\quad \\int \\sin(t)\\,dt = -\\cos(t)+C$, $\\quad \\int e^t\\,dt = e^t + C$. These power-rule and standard results cover most kinematic scenarios.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'xt-vt-graphs' },
        title: 'Signed area: displacement vs distance',
        caption: `Areas above the t-axis (v > 0) add to displacement. Areas below (v < 0) subtract. Net displacement = signed sum. Total distance = unsigned sum. When velocity reverses sign, the two diverge. Split the integral at zero-crossings of v to compute total distance.`,
      },
    ],
  },

  rigor: {
    title: "Area = displacement: the FTC in kinematic language",
    prose: [
      `The statement "area under v–t gives displacement" is not a physical observation — it is a mathematical theorem. It follows directly from the Fundamental Theorem of Calculus (FTC Part 2): if $v(t)$ is continuous on $[t_1, t_2]$ and $x(t)$ is any antiderivative of $v(t)$ (meaning $dx/dt = v(t)$), then $\\int_{t_1}^{t_2} v(t)\\,dt = x(t_2) - x(t_1)$.`,
      `Proof: $v = dx/dt$ by definition of velocity. So $x$ IS an antiderivative of $v$. By FTC Part 2, the definite integral of $v$ over $[t_1, t_2]$ equals [antiderivative at $t_2$] $-$ [antiderivative at $t_1$] $= x(t_2) - x(t_1) = \\Delta x$. The area equals the displacement because velocity is the derivative of position — that is the entire proof.`,
      `FTC Part 1 gives the inverse direction: if $A(t) = \\int_{t_0}^{t} v(\\tau)\\,d\\tau$ (accumulated area from $t_0$ to $t$), then $dA/dt = v(t)$. The rate of change of the accumulated displacement equals velocity — obvious physically but profound mathematically: it says differentiation and integration are inverse operations.`,
      `Extending to distance: the formula $\\text{Distance} = \\int |v|\\,dt$ follows from the same logic but applied to speed $|v|$ rather than velocity $v$. When $v$ does not change sign, distance and displacement coincide. When $v$ reverses sign, $|v| > v$ over the reversed interval, so $\\int |v| > |\\int v|$. This inequality generalizes to the triangle inequality for integrals, a cornerstone of real analysis.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'FTC Part 2 applied to kinematics',
        body: `\\int_{t_1}^{t_2} v(t)\\,dt = x(t_2) - x(t_1) = \\Delta x \\qquad \\text{since } \\frac{dx}{dt} = v`,
      },
    ],
  },

  examples: [
    {
      id: 'p1-ch2-009-ex1',
      title: "Piecewise constant velocity — algebra only",
      problem:
        "An object moves: $v = +4$ m/s for 3 s, then $v = -2$ m/s for 2 s. Find (a) net displacement, (b) total distance.",
      steps: [
        {
          expression: `\\Delta x_1 = v_1 \\cdot \\Delta t_1 = (+4)(3) = +12 \\text{ m}`,
          annotation: "Rectangle area above axis: forward motion adds to displacement.",
        },
        {
          expression: `\\Delta x_2 = v_2 \\cdot \\Delta t_2 = (-2)(2) = -4 \\text{ m}`,
          annotation: "Rectangle area below axis: backward motion subtracts from displacement.",
        },
        {
          expression: `\\Delta x_{\\text{net}} = +12 + (-4) = +8 \\text{ m}`,
          annotation: "Signed areas sum to net displacement.",
        },
        {
          expression: `d = |+12| + |-4| = 16 \\text{ m}`,
          annotation: "Unsigned areas sum to total distance — the two signed pieces do not cancel.",
        },
      ],
      conclusion:
        "Net displacement: +8 m. Total distance: 16 m. The object ends up 8 m from start but traveled a total path of 16 m.",
    },
    {
      id: 'p1-ch2-009-ex2',
      title: "Nonlinear velocity — antiderivative method",
      problem:
        "$v(t) = 10 + 2t$ m/s. Find displacement from $t = 0$ to $t = 5$ s.",
      steps: [
        {
          expression: `\\Delta x = \\int_0^5 (10 + 2t)\\,dt`,
          annotation: "Set up the definite integral. The v–t graph is linear but not horizontal, so geometry gives a trapezoid — or use the FTC.",
        },
        {
          expression: `= \\left[10t + t^2\\right]_0^5`,
          annotation: "Antiderivative: $\\int(10 + 2t)\\,dt = 10t + t^2$. Apply FTC: evaluate at both limits.",
        },
        {
          expression: `= (10(5) + 5^2) - (0) = 50 + 25 = 75 \\text{ m}`,
          annotation: "Substitute $t = 5$ and $t = 0$, subtract.",
        },
        {
          expression: `\\text{Check (trapezoid): } \\tfrac{1}{2}(v(0)+v(5)) \\cdot 5 = \\tfrac{1}{2}(10+20)(5) = 75 \\text{ m} \\checkmark`,
          annotation: "Since v(t) is linear, the area is exactly a trapezoid — confirming the calculus result.",
        },
      ],
      conclusion:
        "Displacement: 75 m. The car's velocity increases from 10 m/s to 20 m/s over 5 s — average 15 m/s — so $15 \\times 5 = 75$ m, matching both the integral and the trapezoid area.",
    },
    {
      id: 'p1-ch2-009-ex3',
      title: "Direction reversal — displacement vs distance",
      problem:
        "$v(t) = 3t - 6$ m/s. Find (a) when the object stops, (b) net displacement from $t = 0$ to $t = 4$ s, (c) total distance from $t = 0$ to $t = 4$ s.",
      steps: [
        {
          expression: `v = 0:\\quad 3t - 6 = 0 \\Rightarrow t = 2 \\text{ s}`,
          annotation: "Object stops at t = 2 s and reverses direction. This is the zero-crossing that splits the integral.",
        },
        {
          expression: `\\Delta x_{\\text{net}} = \\int_0^4 (3t-6)\\,dt = \\left[\\frac{3t^2}{2} - 6t\\right]_0^4 = (24-24) - 0 = 0 \\text{ m}`,
          annotation: "Net displacement is zero — the object returns to its starting point after 4 s.",
        },
        {
          expression: `\\int_0^2 (3t-6)\\,dt = \\left[\\frac{3t^2}{2}-6t\\right]_0^2 = (6-12) = -6 \\text{ m}`,
          annotation: "Phase 1 (t = 0 to 2): v < 0 (starts at −6 m/s, increases to 0). Object moves backward 6 m.",
        },
        {
          expression: `\\int_2^4 (3t-6)\\,dt = \\left[\\frac{3t^2}{2}-6t\\right]_2^4 = (24-24)-(6-12) = 0-(-6) = +6 \\text{ m}`,
          annotation: "Phase 2 (t = 2 to 4): v > 0. Object moves forward 6 m — exactly canceling phase 1.",
        },
        {
          expression: `d = |-6| + |+6| = 12 \\text{ m}`,
          annotation: "Total distance = sum of unsigned areas = 6 + 6 = 12 m.",
        },
      ],
      conclusion:
        "Object stops at $t = 2$ s. Net displacement = 0 m (returns to start). Total distance = 12 m. Splitting the integral at $t = 2$ is essential: taking $|\\int_0^4 v\\,dt| = |0| = 0$ gives the wrong distance.",
    },
  ],

  challenges: [
    {
      id: 'p1-ch2-009-ch1',
      difficulty: 'medium',
      problem: `An object has $v = +5$ m/s for 2 s, then $v = -5$ m/s for 2 s. (a) Find the net displacement. (b) Find the total distance. (c) What would be wrong with computing $|\\int_0^4 v\\,dt|$ for distance?`,
      hint: "Compute signed and unsigned areas separately from the two rectangular phases.",
      walkthrough: [
        {
          step: "Compute signed area for phase 1 (t = 0 to 2).",
          expression: `\\Delta x_1 = (+5)(2) = +10 \\text{ m}`,
          annotation: "Rectangle above axis, area = 10 m.",
        },
        {
          step: "Compute signed area for phase 2 (t = 2 to 4).",
          expression: `\\Delta x_2 = (-5)(2) = -10 \\text{ m}`,
          annotation: "Rectangle below axis, area = −10 m.",
        },
        {
          step: "Net displacement = sum of signed areas.",
          expression: `\\Delta x_{\\text{net}} = 10 + (-10) = 0 \\text{ m}`,
          annotation: "The object returns exactly to its starting position.",
        },
        {
          step: "Total distance = sum of unsigned areas.",
          expression: `d = |+10| + |-10| = 20 \\text{ m}`,
          annotation: "Even though net displacement is zero, the object traveled 20 m total.",
        },
        {
          step: "Explain the error of using |∫v dt|.",
          expression: `\\left|\\int_0^4 v\\,dt\\right| = |0| = 0 \\neq 20 \\text{ m}`,
          annotation: "Taking |∫v dt| gives |net displacement|, not distance. The negative phase cancels the positive phase inside the integral before the absolute value is applied.",
        },
      ],
      conclusion:
        "Net displacement: 0 m. Total distance: 20 m. The correct distance formula is $\\int |v|\\,dt$, not $|\\int v\\,dt|$. The two are equal only when $v$ does not change sign.",
    },
    {
      id: 'p1-ch2-009-ch2',
      difficulty: 'hard',
      problem: `$v(t) = t^2 - 4t + 3$ m/s. Find (a) when the object stops on $[0, 3]$, (b) net displacement from $t = 0$ to $t = 3$, (c) total distance from $t = 0$ to $t = 3$.`,
      hint: "Factor v(t) to find zero crossings. The object reverses at those points — split the integral there for distance.",
      walkthrough: [
        {
          step: "Factor v(t) to find stops.",
          expression: `v(t) = (t-1)(t-3) = 0 \\Rightarrow t = 1 \\text{ s and } t = 3 \\text{ s}`,
          annotation: "Object stops twice on [0, 3]. Sign check: v(0) = 3 > 0, v(2) = 4 - 8 + 3 = -1 < 0.",
        },
        {
          step: "Compute net displacement via definite integral.",
          expression: `\\int_0^3 (t^2-4t+3)\\,dt = \\left[\\frac{t^3}{3}-2t^2+3t\\right]_0^3 = (9-18+9) - 0 = 0 \\text{ m}`,
          annotation: "Net displacement is zero — the object returns to start after 3 s.",
        },
        {
          step: "Phase 1: v > 0 on [0, 1].",
          expression: `\\int_0^1 (t^2-4t+3)\\,dt = \\left[\\frac{t^3}{3}-2t^2+3t\\right]_0^1 = \\frac{1}{3}-2+3 = \\frac{4}{3} \\text{ m}`,
          annotation: "Forward displacement: 4/3 m ≈ 1.33 m.",
        },
        {
          step: "Phase 2: v < 0 on [1, 3].",
          expression: `\\int_1^3 (t^2-4t+3)\\,dt = \\left[\\frac{t^3}{3}-2t^2+3t\\right]_1^3 = 0 - \\frac{4}{3} = -\\frac{4}{3} \\text{ m}`,
          annotation: "Backward displacement: −4/3 m (object moves backward 4/3 m, returning to start).",
        },
        {
          step: "Total distance = sum of absolute areas.",
          expression: `d = \\left|\\frac{4}{3}\\right| + \\left|-\\frac{4}{3}\\right| = \\frac{8}{3} \\approx 2.67 \\text{ m}`,
          annotation: "Total path length is 8/3 m even though net displacement is zero.",
        },
      ],
      conclusion:
        "Object stops at $t = 1$ s and $t = 3$ s. Net displacement: 0 m. Total distance: $8/3 \\approx 2.67$ m. Splitting at $t = 1$ (the interior zero crossing) is essential for the correct distance calculation.",
    },
    {
      id: 'p1-ch2-009-ch3',
      difficulty: 'hard',
      problem: `An object's velocity is $v(t) = \\sin(\\pi t / 2)$ m/s. Find (a) net displacement from $t = 0$ to $t = 4$ s, (b) total distance from $t = 0$ to $t = 4$ s. The antiderivative of $\\sin(\\pi t/2)$ is $V(t) = -\\frac{2}{\\pi}\\cos(\\pi t/2)$.`,
      hint: "Find zero crossings of sin(πt/2) on [0, 4] — these split the integral for distance. Use the given antiderivative.",
      walkthrough: [
        {
          step: "Find zero crossings of v(t) = sin(πt/2) on [0, 4].",
          expression: `\\sin(\\pi t/2) = 0 \\Rightarrow \\pi t/2 = 0, \\pi, 2\\pi \\Rightarrow t = 0, 2, 4`,
          annotation: "Velocity is zero at t = 0, 2, 4. Direction reversal at t = 2.",
        },
        {
          step: "Net displacement via antiderivative.",
          expression: `\\Delta x = V(4) - V(0) = -\\frac{2}{\\pi}\\cos(2\\pi) - \\left(-\\frac{2}{\\pi}\\cos(0)\\right) = -\\frac{2}{\\pi}(1) + \\frac{2}{\\pi}(1) = 0 \\text{ m}`,
          annotation: "Net displacement is zero — the object completes a full cycle and returns to start.",
        },
        {
          step: "Phase 1 (t = 0 to 2): v > 0 (sin(πt/2) ≥ 0).",
          expression: `V(2) - V(0) = -\\frac{2}{\\pi}\\cos(\\pi) + \\frac{2}{\\pi}\\cos(0) = \\frac{2}{\\pi} + \\frac{2}{\\pi} = \\frac{4}{\\pi} \\text{ m}`,
          annotation: "Forward: 4/π ≈ 1.27 m.",
        },
        {
          step: "Phase 2 (t = 2 to 4): v < 0 (sin(πt/2) ≤ 0).",
          expression: `V(4) - V(2) = -\\frac{2}{\\pi}\\cos(2\\pi) + \\frac{2}{\\pi}\\cos(\\pi) = -\\frac{2}{\\pi} - \\frac{2}{\\pi} = -\\frac{4}{\\pi} \\text{ m}`,
          annotation: "Backward: −4/π ≈ −1.27 m.",
        },
        {
          step: "Total distance.",
          expression: `d = \\frac{4}{\\pi} + \\frac{4}{\\pi} = \\frac{8}{\\pi} \\approx 2.55 \\text{ m}`,
          annotation: "Sum of absolute values of both phases.",
        },
      ],
      conclusion:
        "Net displacement: 0 m (full oscillation cycle). Total distance: $8/\\pi \\approx 2.55$ m. For sinusoidal velocity, the object oscillates back and forth — net displacement is zero over a full period, but total distance accumulates with each half-cycle.",
    },
  ],

  checkpoints: [
    {
      id: 'p1-ch2-009-cp1',
      question: `For $v(t) = 6t$ (starts from rest, constant acceleration), find displacement from $t = 0$ to $t = 3$ s using both the triangle area formula and the antiderivative. Do they agree?`,
      answer: `Triangle area: $\\tfrac{1}{2} \\times 3 \\times 18 = 27$ m (base = 3, height = $v(3) = 18$). Antiderivative: $\\int_0^3 6t\\,dt = [3t^2]_0^3 = 27 - 0 = 27$ m. Both give 27 m — confirming that the triangle formula and the FTC are equivalent for linear $v(t)$.`,
    },
    {
      id: 'p1-ch2-009-cp2',
      question: `An object has $v(t) = t^2 - 1$. At $t = 0$, where is the object stopped vs moving? What is the net displacement from $t = 0$ to $t = 2$?`,
      answer: `$v(0) = -1$ m/s — object is moving (backward). $v(1) = 0$ — stops at $t = 1$. $\\Delta x = \\int_0^2 (t^2-1)\\,dt = [t^3/3 - t]_0^2 = (8/3 - 2) - 0 = 2/3$ m forward. (Even though the object starts moving backward, the forward phase from $t=1$ to $t=2$ outweighs it.)`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Exact integral: v(t) = 10 + 2t, verify with antiderivative',
          type: 'code',
          language: 'python',
          code: `from scipy.integrate import quad
import numpy as np
import matplotlib.pyplot as plt

def v(t): return 10 + 2*t

# Exact integral using scipy
dx, err = quad(v, 0, 5)
print(f"scipy.integrate.quad: Δx = {dx:.4f} m  (error < {err:.2e})")

# Verify with antiderivative: V(t) = 10t + t²
V = lambda t: 10*t + t**2
dx_antideriv = V(5) - V(0)
print(f"Antiderivative: V(5) - V(0) = {dx_antideriv:.4f} m")
print(f"Results agree: {np.isclose(dx, dx_antideriv)}")

# Visualize: shade the area under v(t) from 0 to 5
t_plot = np.linspace(0, 5, 300)
fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(t_plot, v(t_plot), 'b-', linewidth=2, label='v(t) = 10 + 2t')
ax.fill_between(t_plot, 0, v(t_plot), alpha=0.3, color='blue', label=f'Area = Δx = {dx:.0f} m')
ax.axhline(0, color='k', linewidth=0.8)
ax.set_xlabel('t (s)'); ax.set_ylabel('v (m/s)')
ax.set_title('Area under v(t) = displacement')
ax.legend(); ax.grid(True, alpha=0.4)
plt.savefig('area_under_v.png', dpi=100, bbox_inches='tight')
plt.show()`,
          prose: [
            `\`scipy.integrate.quad(v, 0, 5)\` computes $\\int_0^5 v(t)\\,dt$ numerically using adaptive quadrature — a highly accurate method that reports an error estimate alongside the result. The second return value \`err\` is a bound on the absolute error, typically $< 10^{-12}$ for smooth functions. This is how numerical integration is done in practice when the antiderivative is not known analytically.`,
            `\`V = lambda t: 10*t + t**2\` defines the antiderivative $V(t) = 10t + t^2$, found by applying the power rule to each term: $\\int 10\\,dt = 10t$ and $\\int 2t\\,dt = t^2$. Then $V(5) - V(0) = 75 - 0 = 75$ m. The \`np.isclose\` comparison confirms that the numerical integral matches the analytical result to machine precision.`,
            `\`ax.fill_between(t_plot, 0, v(t_plot), ...)\` shades the region between the x-axis and the velocity curve — making the "area = displacement" interpretation visually explicit. The shaded region is a trapezoid (since $v(t)$ is linear), and its area $\\tfrac{1}{2}(10+20)(5) = 75$ m matches both calculation methods.`,
          ],
        },
        {
          cellTitle: 'Riemann sum convergence to exact integral',
          type: 'code',
          language: 'python',
          code: `import matplotlib.pyplot as plt
import numpy as np

exact = 75.0   # ∫₀⁵ (10+2t) dt

ns = [2, 5, 10, 50, 100, 500, 1000]
errors = []
for n in ns:
    t_arr = np.linspace(0, 5, n+1)
    dt = t_arr[1] - t_arr[0]
    riemann_left = np.sum(v(t_arr[:-1]) * dt)   # left Riemann sum
    errors.append(abs(riemann_left - exact))

plt.figure(figsize=(7, 5))
plt.loglog(ns, errors, 'bo-', linewidth=2, markersize=6)
plt.xlabel('Number of rectangles (n)')
plt.ylabel('|Error| (m)')
plt.title('Riemann sum convergence: error ∝ 1/n')
plt.grid(True, which='both', alpha=0.4)
plt.savefig('riemann_convergence.png', dpi=100, bbox_inches='tight')
plt.show()
print(f"Error at n=2:    {errors[0]:.4f} m")
print(f"Error at n=500:  {errors[-2]:.6f} m")`,
          prose: [
            `\`t_arr[:-1]\` selects all time points except the last — these are the left endpoints of each rectangle. \`v(t_arr[:-1]) * dt\` computes the height of each rectangle times its width, giving the area of each. \`np.sum\` adds all rectangle areas to get the left Riemann sum for displacement.`,
            `The log-log plot reveals the convergence rate. For the left Riemann sum, error $\\sim 1/n$: doubling $n$ halves the error. The plot should show a straight line with slope $-1$ on the log-log axes. This is O(n) or equivalently O(h) where $h = \\Delta t = 5/n$.`,
            `At $n = 2$ (just two rectangles), the error is several meters. At $n = 500$, it is less than 0.02 m. This demonstrates why numerical integration uses many subdivisions for accuracy. The midpoint and trapezoid rules converge faster (slope $-2$) — they are available as \`scipy.integrate.quad\` internally uses similar ideas.`,
          ],
        },
        {
          cellTitle: 'Direction reversal: displacement vs distance for v(t) = t² − 4t + 3',
          type: 'code',
          language: 'python',
          code: `from scipy.integrate import quad

def v2(t): return t**2 - 4*t + 3  # = (t-1)(t-3)

# Net displacement (signed integral, no splitting)
dx_net, _ = quad(v2, 0, 3)
print(f"Net displacement: {dx_net:.6f} m  (expected: 0)")

# Total distance: split at zero crossing t = 1
d_phase1, _ = quad(v2, 0, 1)   # v > 0 here
d_phase2, _ = quad(v2, 1, 3)   # v < 0 here
total_dist = abs(d_phase1) + abs(d_phase2)
print(f"Phase 1 displacement (0→1): {d_phase1:.4f} m")
print(f"Phase 2 displacement (1→3): {d_phase2:.4f} m")
print(f"Total distance: {total_dist:.4f} m  (expected: {8/3:.4f} m)")

# Visualize
import numpy as np, matplotlib.pyplot as plt
t_v = np.linspace(0, 3, 300)
v_vals = v2(t_v)
fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(t_v, v_vals, 'b-', linewidth=2)
ax.fill_between(t_v, 0, v_vals, where=(v_vals >= 0), alpha=0.3, color='blue', label='Forward (+ area)')
ax.fill_between(t_v, 0, v_vals, where=(v_vals < 0), alpha=0.3, color='red', label='Backward (− area)')
ax.axhline(0, color='k'); ax.axvline(1, color='g', linestyle='--', label='Stop at t=1')
ax.set_xlabel('t (s)'); ax.set_ylabel('v (m/s)')
ax.set_title('Displacement vs distance for v = t² − 4t + 3')
ax.legend(); ax.grid(True, alpha=0.4)
plt.savefig('displacement_vs_distance.png', dpi=100, bbox_inches='tight')
plt.show()`,
          prose: [
            `\`quad(v2, 0, 3)\` computes the full signed integral $\\int_0^3 v\\,dt = 0$ — the net displacement is zero. Then splitting at $t = 1$ (the zero crossing): \`quad(v2, 0, 1)\` gives the forward displacement (positive area, Phase 1), and \`quad(v2, 1, 3)\` gives the backward displacement (negative area, Phase 2). Their absolute values are both $4/3$, summing to $8/3 \\approx 2.67$ m total distance.`,
            `\`ax.fill_between(..., where=(v_vals >= 0), color='blue')\` shades only the parts of the curve where $v > 0$ (above the axis). The second \`fill_between\` shades the parts where $v < 0$ (below the axis) in red. This visual makes it immediately clear that the red area equals the blue area (both $4/3$ m), so they cancel for displacement but add for distance.`,
            `Key observation from the code: \`abs(d_phase1) + abs(d_phase2) = 8/3\` is NOT the same as \`abs(d_phase1 + d_phase2) = abs(0) = 0\`. The sum of absolute values gives distance; the absolute value of the sum gives $|$displacement$|$. This is the core distinction between distance and displacement in integral form.`,
          ],
        },
        {
          cellTitle: 'Challenge: total distance for sinusoidal velocity v(t) = sin(2t)',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `from scipy.integrate import quad
import numpy as np

def v3(t): return np.sin(2*t)

# TODO: find all zero crossings of sin(2t) on [0, 2π]
# They occur at t = 0, π/2, π, 3π/2, 2π
# Then: for each sub-interval, compute |∫ v3 dt|
# Sum the results to get total distance
# Expected: total distance = 4 m
`,
          prose: [
            `$\\sin(2t) = 0$ when $2t = k\\pi$, i.e., $t = k\\pi/2$. On $[0, 2\\pi]$: crossings at $t = 0, \\pi/2, \\pi, 3\\pi/2, 2\\pi$. Store these as \`crossings = [0, np.pi/2, np.pi, 3*np.pi/2, 2*np.pi]\`. Loop over consecutive pairs and call \`quad(v3, crossings[i], crossings[i+1])\` for each sub-interval.`,
            `Each sub-interval is a half-period of $\\sin(2t)$ with amplitude 1. The integral $|\\int_{k\\pi/2}^{(k+1)\\pi/2} |\\sin(2t)|\\,dt| = 1$ for each piece. Four half-periods × 1 = 4 m total distance. Build a list comprehension like \`[abs(quad(v3, crossings[i], crossings[i+1])[0]) for i in range(4)]\` and sum it.`,
            `After finding total distance = 4 m, plot $v(t) = \\sin(2t)$ on $[0, 2\\pi]$ and shade the positive and negative regions in different colors. Count the shaded regions and verify there are 4 (two above, two below), each with area $= 1$ m.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Exact integral: v(t) = 10 + 2t, verify with antiderivative',
          type: 'code',
          language: 'matlab',
          code: `% Define velocity function
v_func = @(t) 10 + 2*t;

% Exact integral using MATLAB's integral
dx = integral(v_func, 0, 5);
fprintf('integral(): Δx = %.4f m\\n', dx);

% Antiderivative: V(t) = 10t + t²
V = @(t) 10*t + t.^2;
dx_antideriv = V(5) - V(0);
fprintf('Antiderivative: V(5) - V(0) = %.4f m\\n', dx_antideriv);
fprintf('Results agree: %d\\n', abs(dx - dx_antideriv) < 1e-10);

% Visualize: shade area under v(t)
t_plot = linspace(0, 5, 300);
figure;
area(t_plot, v_func(t_plot), 'FaceColor', [0.2 0.4 0.8], 'FaceAlpha', 0.3);
hold on;
plot(t_plot, v_func(t_plot), 'b-', 'LineWidth', 2);
xlabel('t (s)'); ylabel('v (m/s)');
title(sprintf('Area under v(t) = displacement = %.0f m', dx));
grid on; yline(0, 'k');`,
          prose: [
            `\`integral(v_func, 0, 5)\` is MATLAB's equivalent of \`scipy.integrate.quad\` — it computes the definite integral using adaptive quadrature and returns a highly accurate result. The function handle \`@(t) 10 + 2*t\` defines $v(t)$ as an anonymous function, which \`integral\` evaluates at many points internally.`,
            `\`area(t_plot, v_func(t_plot), ...)\` shades the region between zero and the curve, visualizing the area = displacement concept. The \`FaceAlpha\` property controls transparency (0 = transparent, 1 = opaque). This is MATLAB's built-in area-filling function — equivalent to \`fill_between\` in matplotlib.`,
            `Comparing the \`integral\` result to the antiderivative $V(5) - V(0)$ via \`abs(dx - dx_antideriv) < 1e-10\` performs the machine-precision agreement check. The result is \`1\` (true) — confirming the FTC: numerical integration and the antiderivative formula give identical answers.`,
          ],
        },
        {
          cellTitle: 'Riemann sum convergence',
          type: 'code',
          language: 'matlab',
          code: `v_func = @(t) 10 + 2*t;
exact = 75.0;

ns = [2, 5, 10, 50, 100, 500, 1000];
errors = zeros(size(ns));

for k = 1:length(ns)
    n = ns(k);
    t_arr = linspace(0, 5, n+1);
    dt = t_arr(2) - t_arr(1);
    riemann_left = sum(v_func(t_arr(1:end-1)) * dt);   % left Riemann sum
    errors(k) = abs(riemann_left - exact);
end

figure;
loglog(ns, errors, 'bo-', 'LineWidth', 2, 'MarkerSize', 6);
xlabel('Number of rectangles (n)');
ylabel('|Error| (m)');
title('Riemann sum convergence: error ∝ 1/n');
grid on;
fprintf('Error at n=2:    %.4f m\\n', errors(1));
fprintf('Error at n=1000: %.6f m\\n', errors(end));`,
          prose: [
            `\`t_arr(1:end-1)\` selects all left endpoints — MATLAB uses 1-based indexing, so the first element is \`t_arr(1)\` and the last is \`t_arr(end)\`. Selecting \`1:end-1\` gives all elements except the last, i.e., all left endpoints of the $n$ rectangles.`,
            `\`v_func(t_arr(1:end-1)) * dt\` computes height × width for each rectangle (vectorized — MATLAB applies \`v_func\` element-wise). \`sum(...)\` then adds all $n$ rectangle areas. This is the left Riemann sum in two vectorized lines.`,
            `\`loglog\` plots both axes on a log scale. The slope of the resulting line is $-1$ (error decreases proportionally to $1/n$) — confirming O(h) convergence for the left Riemann sum. Midpoint and trapezoid rules give a slope of $-2$ (O(h²)), which is why they are preferred in numerical integration.`,
          ],
        },
        {
          cellTitle: 'Direction reversal: displacement vs distance',
          type: 'code',
          language: 'matlab',
          code: `v2_func = @(t) t.^2 - 4*t + 3;   % = (t-1)(t-3)

% Net displacement (full interval)
dx_net = integral(v2_func, 0, 3);
fprintf('Net displacement: %.6f m  (expected: 0)\\n', dx_net);

% Total distance: split at t = 1 (zero crossing)
d1 = integral(v2_func, 0, 1);
d2 = integral(v2_func, 1, 3);
total_dist = abs(d1) + abs(d2);
fprintf('Phase 1 (0→1): %.4f m\\n', d1);
fprintf('Phase 2 (1→3): %.4f m\\n', d2);
fprintf('Total distance: %.4f m  (expected: %.4f m)\\n', total_dist, 8/3);

% Visualize
t_v = linspace(0, 3, 300);
v_vals = v2_func(t_v);
figure; hold on;
% shade positive and negative areas
area(t_v(v_vals >= 0), v_vals(v_vals >= 0), ...
    'FaceColor', 'blue', 'FaceAlpha', 0.3, 'DisplayName', 'Forward');
area(t_v(v_vals < 0), v_vals(v_vals < 0), ...
    'FaceColor', 'red', 'FaceAlpha', 0.3, 'DisplayName', 'Backward');
plot(t_v, v_vals, 'b-', 'LineWidth', 2);
yline(0, 'k'); xline(1, 'g--', 'Stop at t=1');
xlabel('t (s)'); ylabel('v (m/s)');
title('v = t² − 4t + 3: displacement vs distance');
legend; grid on;`,
          prose: [
            `\`integral(v2_func, 0, 3)\` computes the full signed integral, returning approximately 0 — confirming zero net displacement. Then splitting at $t = 1$ (the interior zero crossing): \`integral(v2_func, 0, 1)\` gives $+4/3$ m and \`integral(v2_func, 1, 3)\` gives $-4/3$ m. Their absolute values sum to $8/3$ m total distance.`,
            `The shading uses \`area\` with Boolean indexing. \`v_vals >= 0\` is a logical array; \`t_v(v_vals >= 0)\` and \`v_vals(v_vals >= 0)\` select only the positive segments. This approach may leave gaps at the crossing point; for a smoother plot, use \`fill_between\`-style commands or plot the full curve and shade with \`patch\`.`,
            `The key visual lesson: the blue (positive) area and red (negative) area appear equal — confirming that net displacement is zero. But for distance, both areas count positively: $4/3 + 4/3 = 8/3$ m. The plot makes the distinction between $\\int v\\,dt$ (signed) and $\\int |v|\\,dt$ (unsigned) tangible.`,
          ],
        },
        {
          cellTitle: 'Challenge: total distance for sinusoidal velocity',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `v3_func = @(t) sin(2*t);

% TODO: define the zero crossings of sin(2t) on [0, 2*pi]
% They are at t = 0, pi/2, pi, 3*pi/2, 2*pi
% Loop over consecutive pairs and sum |integral(v3_func, t_k, t_k+1)|
% Expected total distance: 4 m
crossings = [0, pi/2, pi, 3*pi/2, 2*pi];
% total_dist = ... (compute here)
`,
          prose: [
            `\`sin(2t) = 0\` when $2t = k\\pi$, giving crossings at $t = 0, \\pi/2, \\pi, 3\\pi/2, 2\\pi$ on $[0, 2\\pi]$. Store these in \`crossings\`. Then use a for loop over $k = 1:4$ to compute \`abs(integral(v3_func, crossings(k), crossings(k+1)))\` for each pair and accumulate the sum.`,
            `Each sub-interval $[k\\pi/2, (k+1)\\pi/2]$ is a half-period of $\\sin(2t)$ with amplitude 1. The integral over each half-period equals $\\pm 1$ m in magnitude. Sum all four to get 4 m total distance. Verify using \`fprintf('Total distance: %.4f m\\n', total_dist)\`.`,
            `For visualization, plot $\\sin(2t)$ on $[0, 2\\pi]$ using \`fplot\`, add shading using \`area\` for positive and negative regions, and draw vertical lines at each zero crossing using \`xline\`. The four shaded regions should have equal areas, confirming the 4 m result.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch2-009-q1',
      type: 'choice',
      question: `A Riemann sum $\\sum_i v(t_i)\\Delta t$ represents:`,
      options: [
        `The exact derivative of v(t)`,
        `An approximation to displacement that improves as $\\Delta t \\to 0$`,
        `The average velocity`,
        `The acceleration`,
      ],
      answer: `An approximation to displacement that improves as $\\Delta t \\to 0$`,
      hints: [
        `Each term $v(t_i)\\Delta t$ is the area of one rectangle. What does summing many rectangle areas approximate?`,
        `As $n \\to \\infty$ (more rectangles), the sum converges to what exact quantity?`,
      ],
      reviewSection: 'intuition',
      explanation: `Each $v(t_i)\\Delta t$ is the area of one rectangle. Their sum approximates total area under v–t = displacement. As $\\Delta t \\to 0$, the sum converges to $\\int v\\,dt$.`,
    },
    {
      id: 'p1-ch2-009-q2',
      type: 'choice',
      question: `For $v(t) = 10 + 2t$, displacement from $t = 0$ to $t = 5$ s is:`,
      options: [`50 m`, `75 m`, `100 m`, `25 m`],
      answer: `75 m`,
      hints: [
        `Find the antiderivative $V(t)$ of $v(t) = 10 + 2t$ using the power rule.`,
        `Compute $V(5) - V(0)$.`,
      ],
      reviewSection: 'examples',
      explanation: `$\\Delta x = \\int_0^5 (10+2t)\\,dt = [10t+t^2]_0^5 = (50+25) - 0 = 75$ m.`,
    },
    {
      id: 'p1-ch2-009-q3',
      type: 'choice',
      question: `For $v(t) = +5$ m/s for 2 s, then $-5$ m/s for 2 s, the net displacement is:`,
      options: [`20 m`, `0 m`, `10 m`, `$-10$ m`],
      answer: `0 m`,
      hints: [
        `Net displacement = sum of signed areas. First phase: area = +10 m. Second phase: area = ?`,
        `The areas above and below the axis are equal.`,
      ],
      reviewSection: 'examples',
      explanation: `Signed areas: $+5(2) + (-5)(2) = 10 - 10 = 0$ m. The object returns to its start position.`,
    },
    {
      id: 'p1-ch2-009-q4',
      type: 'choice',
      question: `For the same motion ($v = +5$ for 2 s, then $-5$ for 2 s), what is the total distance traveled?`,
      options: [`0 m`, `10 m`, `20 m`, `5 m`],
      answer: `20 m`,
      hints: [
        `Total distance = sum of absolute (unsigned) areas.`,
        `$|{+10}| + |{-10}| = ?$`,
      ],
      reviewSection: 'challenges',
      explanation: `Total distance = $|10| + |-10| = 20$ m. The object moved 10 m forward then 10 m backward.`,
    },
    {
      id: 'p1-ch2-009-q5',
      type: 'choice',
      question: `The formula $\\Delta x = \\int_{t_1}^{t_2} v\\,dt = V(t_2) - V(t_1)$ (where $V'=v$) is a statement of:`,
      options: [
        `Newton's second law`,
        `The SUVAT equations`,
        `The Fundamental Theorem of Calculus`,
        `The work–energy theorem`,
      ],
      answer: `The Fundamental Theorem of Calculus`,
      hints: [
        `This formula connects a definite integral to the evaluation of an antiderivative.`,
        `Which theorem in calculus states: $\\int_a^b f\\,dx = F(b) - F(a)$ where $F' = f$?`,
      ],
      reviewSection: 'rigor',
      explanation: `This is FTC Part 2: the definite integral of $v$ equals the antiderivative $x$ evaluated at the limits. Since $v = dx/dt$, position $x$ is the antiderivative of $v$.`,
    },
    {
      id: 'p1-ch2-009-q6',
      type: 'choice',
      question: `To find total distance (not displacement) when $v$ changes sign, you should:`,
      options: [
        `Integrate $v$ normally over the whole interval`,
        `Split the integral at each zero crossing and sum the absolute values of each piece`,
        `Take the absolute value of the whole integral $|\\int v\\,dt|$`,
        `Multiply displacement by 2`,
      ],
      answer: `Split the integral at each zero crossing and sum the absolute values of each piece`,
      hints: [
        `Taking $|\\int v\\,dt|$ gives $|$displacement$|$, not distance — the phases cancel inside the integral first.`,
        `Splitting at zero crossings separates the forward and backward phases before taking absolute values.`,
      ],
      reviewSection: 'examples',
      explanation: `Split at zero crossings to separate forward/backward phases. Take $|\\text{each piece}|$ and sum. $|\\int_{t_1}^{t_2} v\\,dt|$ is wrong when $v$ changes sign.`,
    },
    {
      id: 'p1-ch2-009-q7',
      type: 'choice',
      question: `For constant velocity $v_0$, displacement over time $t$ is:`,
      options: [
        `$v_0^2 t$`,
        `$v_0 t$ (rectangle area on v–t graph)`,
        `$\\tfrac{1}{2}v_0 t$`,
        `$v_0 / t$`,
      ],
      answer: `$v_0 t$ (rectangle area on v–t graph)`,
      hints: [
        `The v–t graph is a horizontal line at height $v_0$. What is the area of the resulting rectangle?`,
        `Area = base × height = $t \\times v_0$.`,
      ],
      reviewSection: 'intuition',
      explanation: `Area of rectangle = $t \\times v_0 = v_0 t$. Both geometry and the integral give the same result: $\\int_0^t v_0\\,dt' = v_0 t$.`,
    },
    {
      id: 'p1-ch2-009-q8',
      type: 'choice',
      question: `For piece-wise linear $v(t)$ (constant acceleration), displacement can be computed:`,
      options: [
        `Only with calculus`,
        `Using geometry alone (trapezoid/triangle areas)`,
        `Only using SUVAT equations`,
        `It cannot be computed exactly`,
      ],
      answer: `Using geometry alone (trapezoid/triangle areas)`,
      hints: [
        `When $v(t)$ is linear (straight line), what geometric shape does the area under it form?`,
        `Can you compute a trapezoid area without calculus?`,
      ],
      reviewSection: 'intuition',
      explanation: `Linear $v(t)$ gives a trapezoidal area: $\\Delta x = \\tfrac{1}{2}(v_0+v)t$. Pure geometry suffices. Calculus gives the same answer but is not required.`,
    },
    {
      id: 'p1-ch2-009-q9',
      type: 'choice',
      question: `For $v(t) = 3t - 6$ m/s on $[0, 4]$, what is the net displacement?`,
      options: [`0 m`, `6 m`, `12 m`, `$-6$ m`],
      answer: `0 m`,
      hints: [
        `Find the antiderivative $V(t) = \\tfrac{3}{2}t^2 - 6t$, then compute $V(4) - V(0)$.`,
        `$V(4) = 3(16)/2 - 24 = 24 - 24 = 0$.`,
      ],
      reviewSection: 'examples',
      explanation: `$\\int_0^4 (3t-6)\\,dt = [3t^2/2 - 6t]_0^4 = (24-24) - 0 = 0$ m. The object returns to its starting point.`,
    },
    {
      id: 'p1-ch2-009-q10',
      type: 'choice',
      question: `For the same $v(t) = 3t - 6$ on $[0, 4]$, what is the total distance traveled?`,
      options: [`0 m`, `6 m`, `12 m`, `24 m`],
      answer: `12 m`,
      hints: [
        `Find where $v = 0$ on $[0, 4]$: $3t - 6 = 0 \\Rightarrow t = 2$.`,
        `Split the integral at $t = 2$: compute $|\\int_0^2 v\\,dt|$ and $|\\int_2^4 v\\,dt|$ separately.`,
      ],
      reviewSection: 'examples',
      explanation: `$v = 0$ at $t = 2$. Phase 1 (0→2): $V(2) - V(0) = (6-12) - 0 = -6$ m. Phase 2 (2→4): $V(4) - V(2) = 0 - (-6) = +6$ m. Total distance = $|-6| + |6| = 12$ m.`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch2-009-m1',
      misconception: `"Total distance equals $|$net displacement$|$."`,
      correction: `$|\\text{displacement}|$ and total distance are equal only if the object never reverses direction. If $v$ changes sign, the forward and backward phases partially cancel for displacement but both add for distance. For $v = +5$ for 2 s then $-5$ for 2 s: $|\\text{displacement}| = 0$ but distance $= 20$ m.`,
      correctionExample: `$|\\int_0^4 v\\,dt| = |0| = 0$ m $\\neq 20$ m = $\\int_0^4 |v|\\,dt$. The absolute value must go inside the integral, not outside.`,
    },
    {
      id: 'p1-ch2-009-m2',
      misconception: `"The area under a v–t graph is always positive displacement."`,
      correction: `Area above the t-axis (v > 0) corresponds to forward displacement and is positive. Area below the t-axis (v < 0) corresponds to backward displacement and is negative — it subtracts from net displacement. The signed area gives net displacement; only the unsigned (absolute) area of all pieces gives total distance.`,
      correctionExample: `For a ball thrown upward and caught at the same height: $v$ starts positive (going up), crosses zero at the peak, becomes negative (coming down). Net displacement $= 0$ (starts and ends at same height), but total distance $= 2 \\times$ maximum height.`,
    },
  ],

  transferPrompts: [
    `In economics, the rate of spending $r(t)$ (dollars per hour) plays the role of velocity. The "displacement" is the total money spent: $M = \\int_0^T r(t)\\,dt$. If spending is high in the morning and low in the afternoon, compute total spending over a day. What does "negative spending" (r < 0) represent? Can total "distance" (total transactions) differ from net "displacement" (net spending)?`,
    `A water pipe has flow rate $Q(t) = 5 + 2\\sin(\\pi t/12)$ liters/minute, where $t$ is in minutes after midnight. The "displacement" equivalent is the total water volume delivered: $V = \\int_0^{24 \\times 60} Q(t)\\,dt$. Find the total liters delivered in one 24-hour period. Can the flow rate ever go negative (reverse flow)? What would that mean physically?`,
  ],

  debugging: [
    {
      id: 'p1-ch2-009-d1',
      buggyWork: `Student computes total distance for $v(t) = t - 2$ on $[0, 4]$: "$\\int_0^4 (t-2)\\,dt = [t^2/2 - 2t]_0^4 = (8-8) - 0 = 0$. Total distance = $|0| = 0$ m."`,
      question: `What went wrong? What is the correct total distance?`,
      answer: `The student computed net displacement (0 m), then took its absolute value — getting 0. But total distance requires splitting at the zero crossing $v = 0$: $t - 2 = 0 \\Rightarrow t = 2$. Phase 1 (0 to 2): $\\int_0^2 (t-2)\\,dt = [t^2/2-2t]_0^2 = (2-4) = -2$ m. Phase 2 (2 to 4): $\\int_2^4 (t-2)\\,dt = (8-8)-(2-4) = 2$ m. Total distance $= |-2| + |2| = 4$ m.`,
    },
    {
      id: 'p1-ch2-009-d2',
      buggyWork: `Student computes $\\Delta x$ for $v(t) = 3t^2 + 1$ from $t=1$ to $t=3$: "Antiderivative is $t^3$. Δx = $3^3 - 1^3 = 27 - 1 = 26$ m."`,
      question: `Find the error.`,
      answer: `The student forgot to include the $+1$ term in the antiderivative. The correct antiderivative of $3t^2 + 1$ is $t^3 + t$ (since $d/dt[t^3 + t] = 3t^2 + 1$). Correct: $\\Delta x = [t^3 + t]_1^3 = (27 + 3) - (1 + 1) = 30 - 2 = 28$ m.`,
    },
  ],

  mastery: {
    targetLevel: `Compute displacement and total distance for any piecewise or smooth velocity function using (1) geometry for linear segments, (2) antiderivatives for smooth functions, and (3) splitting at zero-crossings for direction reversals.`,
    coreSkill: `Evaluating $\\Delta x = \\int_{t_1}^{t_2} v(t)\\,dt = V(t_2) - V(t_1)$ using the FTC; distinguishing signed area (displacement) from unsigned area (distance); splitting at zero crossings.`,
    commonSticking: `Students confuse $|\\int v\\,dt|$ (absolute value of net displacement) with $\\int |v|\\,dt$ (total distance). They must split the integral at zero crossings before taking absolute values.`,
    connections: `Directly builds on the FTC (Calculus Ch4), SUVAT (ch2-002), and the three-graph chain (ch2-006). The same area-under-curve idea applies to computing work from force (Ch5), impulse from force (Ch7), and accumulated probability in statistics.`,
  },

  semantics: {
    core: [
      { symbol: `\\int_{t_1}^{t_2} v\\,dt`, meaning: `Definite integral of velocity — equals the signed area under the v–t graph = net displacement.` },
      { symbol: `\\int_{t_1}^{t_2} |v|\\,dt`, meaning: `Integral of speed — equals total distance traveled (unsigned, always ≥ 0).` },
      { symbol: `V(t)`, meaning: `Antiderivative of $v$: a function satisfying $V'(t) = v(t)$; used to evaluate the definite integral via $V(t_2) - V(t_1)$.` },
      { symbol: `\\sum_i v(t_i)\\Delta t`, meaning: `Riemann sum — an approximation to displacement computed as the sum of rectangle areas under the v–t curve.` },
      { symbol: `\\Delta x = V(t_2) - V(t_1)`, meaning: `FTC applied to kinematics: evaluate the antiderivative of $v$ at the endpoints to get exact displacement.` },
    ],
    rulesOfThumb: [
      `Signed area (above axis $+$, below $-$) gives displacement; unsigned area (all positive) gives distance.`,
      `For piece-wise linear $v(t)$, use trapezoid/triangle areas — no calculus needed.`,
      `For smooth $v(t)$, find the antiderivative $V$ and compute $V(t_2) - V(t_1)$.`,
      `When $v$ changes sign, split the integral at each zero crossing before summing absolute values for distance.`,
      `$|\\int v\\,dt|$ is the absolute displacement — NOT total distance. Always split first.`,
    ],
  },
};

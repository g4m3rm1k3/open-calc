export default {
  id: 'p1-ch2-008',
  slug: 'kinematics-worked-example-i',
  chapter: 'p2',
  order: 8,
  title: "Kinematics Worked Example I",
  subtitle: "Solve a full constant-acceleration problem from setup to check.",
  tags: ["worked example", "SUVAT", "problem solving", "equation selection", "kinematics"],
  aliases: "kinematics example suvat setup constant acceleration problem solving",

  hook: {
    question: "What is the fastest way to choose the right kinematic equation — and how do you avoid picking the wrong one?",
    realWorldContext:
      "Exam and engineering workflows reward systematic setup before algebra. A traffic safety engineer calculating stopping distances, an aerospace guidance system computing burn durations, and a student taking a 90-minute exam all use the same five-step protocol: list knowns, identify the unknown, find the 'missing' variable, choose the equation that excludes it, then solve. The protocol does not require memorizing which equation is which — it forces the correct equation to emerge from the structure of the problem.",
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      `Before reading on, predict: a car is traveling at 25 m/s and brakes to a stop after 50 m. List the five SUVAT quantities: $\\Delta x$, $v_0$, $v$, $a$, $t$. Which are given? Which is unknown? Which is the "missing" one (not mentioned and not needed)? Write your answers before continuing.`,
      "Every constant-acceleration problem has five quantities: displacement Δx, initial velocity v₀, final velocity v, acceleration a, and time t. Any given problem mentions three of them and asks for a fourth. The fifth is never mentioned — it is the 'missing' variable. The key insight: each of the five SUVAT equations excludes exactly one quantity. So the equation you want is the one that excludes your missing variable.",
      "Start by listing all five quantities. Mark each as 'given,' 'unknown,' or 'missing.' Given quantities come from the problem statement. The unknown is what the problem asks for. The missing is the one that neither appears nor is needed. You now know which equation to use — it's the one that contains only the given quantities and the unknown (and not the missing one).",
      "After solving, always check: (1) Are the units correct? (2) Does the sign make physical sense? (3) Is the magnitude reasonable? If the problem says a car brakes to rest over 50 m from 25 m/s and you find a = +10 m/s² (positive, meaning acceleration), something is wrong — a car braking has negative acceleration. Sign errors are the most common mistake in kinematic problems.",
      "The five-step protocol also doubles as an error-detection system. If you correctly list all five quantities, identify the missing variable, and pick the excluding equation — but get a nonsensical answer — then the error is in the algebra or sign conventions, not the equation selection. This separation of concerns (equation selection vs algebra) makes debugging faster.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Five-step SUVAT protocol',
        body: `1. List all five quantities: $\\Delta x$, $v_0$, $v$, $a$, $t$ — with signs and units. 2. Mark each as given, unknown, or missing (not needed). 3. Find which equation excludes the missing variable. 4. Substitute known values and solve for the unknown. 5. Check: units correct? Sign physically sensible? Magnitude plausible?`,
      },
      {
        type: 'insight',
        title: 'The five equations and what each excludes',
        body: `Eq 1: $v = v_0 + at$ — excludes $\\Delta x$. Eq 2: $\\Delta x = \\tfrac{1}{2}(v_0+v)t$ — excludes $a$. Eq 3: $\\Delta x = v_0 t + \\tfrac{1}{2}at^2$ — excludes $v$. Eq 4: $\\Delta x = vt - \\tfrac{1}{2}at^2$ — excludes $v_0$. Eq 5: $v^2 = v_0^2 + 2a\\Delta x$ — excludes $t$. Identify your missing variable, then pick the equation that excludes it.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'suvat-map' },
        title: 'Choose your equation',
        caption: `Before computing anything: identify the 3 knowns and 1 unknown. The SUVAT map shows which equation connects those 4 quantities and omits the one you don't need.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'Full solution walkthrough — from knowns to answer',
        caption: `Step 1: List all five SUVAT quantities. Mark given, unknown, missing. Step 2: the missing quantity points to the right equation. Step 3: substitute and solve. Step 4: check units and sign.`,
      },
    ],
  },

  math: {
    prose: [
      `The five SUVAT equations are the complete algebraic toolkit for constant-acceleration motion. They are not independent: Eq 1 and 3 together imply Eq 5 (eliminate $t$); Eq 1 and 3 together imply Eq 2 (average velocity); Eq 3 and 1 imply Eq 4. In practice, memorize Eq 1, 3, and 5 — you can derive the other two from them if needed.`,
      `Sign conventions are the most frequent source of errors. You must choose a positive direction before listing any numbers. Displacement in the positive direction is positive; in the negative direction, negative. Acceleration is positive if it acts in the positive direction, negative if it opposes it. A decelerating car (moving positive, braking) has positive $v_0$, positive $\\Delta x$ (it moves forward), and negative $a$. Mix up any sign and your equation gives wrong results.`,
      `After solving, use substitution to verify: plug your computed unknowns back into a different SUVAT equation that you didn't use. If both equations give the same physical picture, the answer is correct. If a different equation is violated, you made an algebra or sign error somewhere. This cross-check takes 30 seconds and can save 10 minutes of re-doing the problem.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The five SUVAT equations',
        body: `v = v_0 + at \\qquad \\Delta x = \\tfrac{1}{2}(v_0+v)t \\qquad \\Delta x = v_0 t + \\tfrac{1}{2}at^2`,
      },
      {
        type: 'definition',
        title: 'Equations 4 and 5',
        body: `\\Delta x = vt - \\tfrac{1}{2}at^2 \\qquad v^2 = v_0^2 + 2a\\Delta x`,
      },
      {
        type: 'warning',
        title: 'Sign convention — commit before you compute',
        body: `Choose your positive direction before writing any numbers. For a braking car moving to the right: $v_0 > 0$, $\\Delta x > 0$, $a < 0$ (opposing motion). If you flip any sign halfway through, your answer will be wrong even if the algebra is correct.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'Solve by knowns — systematic setup',
        caption: `Write the SUVAT table: Δx = ?, v₀ = given, v = ?, a = given, t = given. With three knowns, identify the missing variable to select the right equation. Dimension check: [m/s²]×[s] = [m/s] ✓. Sign check: positive a with positive v₀ → v > v₀ ✓.`,
      },
    ],
  },

  rigor: {
    title: "Equation provenance — where the five equations come from",
    prose: [
      `All five SUVAT equations follow from two definitions and one assumption: $v = dx/dt$ (velocity is the derivative of position), $a = dv/dt$ (acceleration is the derivative of velocity), and $a = \\text{const}$. With $a$ constant, integrating $a$ once gives $v(t) = v_0 + at$ (Eq 1). Integrating again gives $x(t) = x_0 + v_0 t + \\tfrac{1}{2}at^2$ (Eq 3, in terms of $\\Delta x = x - x_0$).`,
      `Equations 2, 4, and 5 are algebraic consequences of 1 and 3. Eq 2: average of $v_0$ and $v_0 + at$ equals $(v_0 + v)/2$; multiplying by $t$ gives $\\Delta x = \\tfrac{1}{2}(v_0+v)t$. Eq 5: from Eq 1, $t = (v-v_0)/a$; substitute into Eq 3 to eliminate $t$ and simplify — this gives $v^2 = v_0^2 + 2a\\Delta x$. The five equations are not five separate facts — they are five rearrangements of the same underlying calculus.`,
      `The constant-acceleration assumption is what allows the integrals to close in algebra. If $a$ is not constant, $\\int a(t)\\,dt$ is not simply $at$ — it depends on the functional form of $a(t)$. SUVAT only applies when acceleration is truly constant over the entire interval. Using SUVAT on a variable-acceleration problem (like a rocket burning fuel) gives wrong answers; such problems require the integral chain from Lesson ch2-006.`,
      `Applying SUVAT in 2D and 3D: in two dimensions, constant acceleration is treated component-wise. The $x$-components and $y$-components each satisfy independent SUVAT equations. This works because the kinematic equations are derived from calculus separately for each axis. Projectile motion (Lesson ch3) is the first application of this idea: horizontal and vertical motions are independent, each governed by its own set of SUVAT equations.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'SUVAT from calculus (constant a)',
        body: `v(t) = v_0 + at, \\quad \\Delta x = v_0 t + \\tfrac{1}{2}at^2, \\quad v^2 = v_0^2 + 2a\\Delta x`,
      },
    ],
  },

  examples: [
    {
      id: 'p1-ch2-008-ex1',
      title: "Accelerating bike — knowns: v₀, a, t",
      problem:
        "A bike starts at $v_0 = 2$ m/s and accelerates at $a = 1.5$ m/s² for $t = 6$ s. Find the final velocity $v$ and displacement $\\Delta x$.",
      steps: [
        {
          expression: `\\text{Known: } v_0 = 2 \\text{ m/s},\\; a = 1.5 \\text{ m/s}^2,\\; t = 6 \\text{ s}. \\quad \\text{Missing: none (two unknowns)}`,
          annotation: "Step 1: list all five quantities. Both v and Δx are unknown — use two equations.",
        },
        {
          expression: `v = v_0 + at = 2 + 1.5(6) = 11 \\text{ m/s}`,
          annotation: "Eq 1 (excludes Δx): gives final velocity directly.",
        },
        {
          expression: `\\Delta x = v_0 t + \\tfrac{1}{2}at^2 = 2(6) + \\tfrac{1}{2}(1.5)(36) = 12 + 27 = 39 \\text{ m}`,
          annotation: "Eq 3 (excludes v): gives displacement. Two separate applications of the protocol.",
        },
        {
          expression: `\\text{Check: } v^2 = 11^2 = 121,\\quad v_0^2 + 2a\\Delta x = 4 + 2(1.5)(39) = 4 + 117 = 121 \\checkmark`,
          annotation: "Cross-check with Eq 5 — both sides equal 121. Answer confirmed.",
        },
      ],
      conclusion:
        "Final velocity: 11 m/s. Displacement: 39 m. Cross-check via Eq 5 confirms the answers are consistent.",
    },
    {
      id: 'p1-ch2-008-ex2',
      title: "Braking car — knowns: v₀, v, Δx",
      problem:
        "A car traveling at $v_0 = 30$ m/s brakes to rest ($v = 0$) over $\\Delta x = 90$ m. Find the deceleration $a$ and the stopping time $t$.",
      steps: [
        {
          expression: `\\text{Known: } v_0 = 30 \\text{ m/s},\\; v = 0,\\; \\Delta x = 90 \\text{ m}. \\quad \\text{Missing: } t`,
          annotation: "List all five quantities. $t$ is missing — use Eq 5 (excludes $t$).",
        },
        {
          expression: `v^2 = v_0^2 + 2a\\Delta x \\Rightarrow 0 = 900 + 2a(90) \\Rightarrow a = \\frac{-900}{180} = -5 \\text{ m/s}^2`,
          annotation: "Eq 5 gives acceleration directly. Negative sign confirms deceleration (opposing forward motion).",
        },
        {
          expression: `v = v_0 + at \\Rightarrow 0 = 30 + (-5)t \\Rightarrow t = 6 \\text{ s}`,
          annotation: "Now use Eq 1 to find $t$. The sign of $a$ is already negative.",
        },
        {
          expression: `\\text{Check: } \\Delta x = v_0 t + \\tfrac{1}{2}at^2 = 30(6) + \\tfrac{1}{2}(-5)(36) = 180 - 90 = 90 \\text{ m} \\checkmark`,
          annotation: "Cross-check with Eq 3 — displacement 90 m matches. Confirmed.",
        },
      ],
      conclusion:
        "Deceleration: $a = -5$ m/s². Stopping time: $t = 6$ s. The systematic protocol (list → identify missing → pick equation) removes guesswork even for a two-step problem.",
    },
    {
      id: 'p1-ch2-008-ex3',
      title: "Train from rest — knowns: v₀, a, Δx",
      problem:
        "A train starts from rest ($v_0 = 0$) and accelerates at $a = 0.5$ m/s² until it has traveled $\\Delta x = 500$ m. Find the final speed $v$ and the time $t$ taken.",
      steps: [
        {
          expression: `\\text{Known: } v_0 = 0,\\; a = 0.5 \\text{ m/s}^2,\\; \\Delta x = 500 \\text{ m}. \\quad \\text{Missing: none initially — find } v \\text{ first}`,
          annotation: "Two unknowns: $v$ and $t$. Find $v$ first using Eq 5 (excludes $t$).",
        },
        {
          expression: `v^2 = v_0^2 + 2a\\Delta x = 0 + 2(0.5)(500) = 500 \\Rightarrow v = \\sqrt{500} = 10\\sqrt{5} \\approx 22.4 \\text{ m/s}`,
          annotation: "Eq 5: the missing variable is $t$. With $v_0 = 0$, it simplifies to $v = \\sqrt{2a\\Delta x}$.",
        },
        {
          expression: `v = v_0 + at \\Rightarrow 22.36 = 0 + 0.5t \\Rightarrow t = \\frac{22.36}{0.5} \\approx 44.7 \\text{ s}`,
          annotation: "Now find $t$ using Eq 1. The missing variable is now $\\Delta x$ (already used).",
        },
        {
          expression: `\\text{Check: } \\Delta x = v_0 t + \\tfrac{1}{2}at^2 = 0 + \\tfrac{1}{2}(0.5)(44.7)^2 \\approx 0.25 \\times 1998 \\approx 500 \\text{ m} \\checkmark`,
          annotation: "Cross-check with Eq 3. Small rounding differences are expected due to $\\sqrt{500}$ approximation.",
        },
      ],
      conclusion:
        "Final speed: $v = \\sqrt{500} \\approx 22.4$ m/s. Time: $t \\approx 44.7$ s. Starting from rest, the train needs nearly 45 seconds to cover 500 m at modest acceleration.",
    },
  ],

  challenges: [
    {
      id: 'p1-ch2-008-ch1',
      difficulty: 'medium',
      problem: `A car starts at $v_0 = 20$ m/s and decelerates at $a = 4$ m/s² (negative acceleration). How far does it travel before stopping? How long does it take?`,
      hint: "Choose: $v = 0$ (stopped), missing quantity is $t$ (use Eq 5 for distance) or missing is $\\Delta x$ (use Eq 1 for time). Do both in order.",
      walkthrough: [
        {
          step: "List all five quantities and identify missing.",
          expression: `v_0 = 20 \\text{ m/s},\\quad v = 0,\\quad a = -4 \\text{ m/s}^2,\\quad \\Delta x = ?,\\quad t = ?`,
          annotation: "Two unknowns (Δx and t), so we need two equations. Find Δx first (missing variable: t).",
        },
        {
          step: "Find displacement using Eq 5 (no t).",
          expression: `v^2 = v_0^2 + 2a\\Delta x \\Rightarrow 0 = 400 + 2(-4)\\Delta x \\Rightarrow \\Delta x = \\frac{400}{8} = 50 \\text{ m}`,
          annotation: "Eq 5 excludes $t$. The car stops after 50 m.",
        },
        {
          step: "Find time using Eq 1 (no Δx).",
          expression: `v = v_0 + at \\Rightarrow 0 = 20 - 4t \\Rightarrow t = 5 \\text{ s}`,
          annotation: "Eq 1 excludes Δx. The car stops after 5 s.",
        },
        {
          step: "Cross-check with Eq 3.",
          expression: `\\Delta x = v_0 t + \\tfrac{1}{2}at^2 = 20(5) + \\tfrac{1}{2}(-4)(25) = 100 - 50 = 50 \\text{ m} \\checkmark`,
          annotation: "Confirmed: both methods give 50 m.",
        },
      ],
      conclusion:
        "The car travels 50 m in 5 s before stopping. The protocol (list → missing → equation) handles both unknowns cleanly: Eq 5 for Δx, Eq 1 for t, cross-check with Eq 3.",
    },
    {
      id: 'p1-ch2-008-ch2',
      difficulty: 'hard',
      problem: `A spacecraft decelerates uniformly from $v_0 = 2400$ m/s to $v = 600$ m/s over $t = 15$ min (900 s). Find (a) the deceleration magnitude, (b) the distance covered during this burn, (c) the total time from $v_0 = 2400$ m/s to complete stop.`,
      hint: "Part (a): use Eq 1. Part (b): Eq 2 or 3. Part (c): use the same $a$ and set $v = 0$ in Eq 1.",
      walkthrough: [
        {
          step: "List quantities for the deceleration burn.",
          expression: `v_0 = 2400 \\text{ m/s},\\quad v = 600 \\text{ m/s},\\quad t = 900 \\text{ s},\\quad \\Delta x = ?,\\quad a = ?`,
          annotation: "Two unknowns: find $a$ first (missing: Δx → use Eq 1).",
        },
        {
          step: "(a) Find deceleration using Eq 1.",
          expression: `v = v_0 + at \\Rightarrow 600 = 2400 + 900a \\Rightarrow a = \\frac{-1800}{900} = -2 \\text{ m/s}^2`,
          annotation: "Deceleration magnitude is 2 m/s². Negative sign means opposing forward motion.",
        },
        {
          step: "(b) Find distance using Eq 2 (no a).",
          expression: `\\Delta x = \\tfrac{1}{2}(v_0+v)t = \\tfrac{1}{2}(2400+600)(900) = \\tfrac{1}{2}(3000)(900) = 1{,}350{,}000 \\text{ m} = 1350 \\text{ km}`,
          annotation: "Use Eq 2 (average velocity × time). Cross-check: Eq 3 should agree.",
        },
        {
          step: "(c) Find total stopping time from 2400 m/s to 0.",
          expression: `v = v_0 + at \\Rightarrow 0 = 2400 + (-2)t_\\text{stop} \\Rightarrow t_\\text{stop} = 1200 \\text{ s} = 20 \\text{ min}`,
          annotation: "Use $a = -2$ m/s² (same deceleration) and $v = 0$.",
        },
      ],
      conclusion:
        "Deceleration: 2 m/s². Distance over the burn: 1350 km. Total stopping time from $v_0 = 2400$ m/s: 1200 s (20 min). Large distances and long times are expected for spacecraft maneuvers.",
    },
    {
      id: 'p1-ch2-008-ch3',
      difficulty: 'hard',
      problem: `A police cruiser is parked at $x = 0$ and begins accelerating at $a_p = 3$ m/s² the instant a speeding car passes at $v_s = 25$ m/s (constant speed, $a_s = 0$). How long before the cruiser catches the speeder? How far does the cruiser travel?`,
      hint: "Set positions equal: $x_p(t) = x_s(t)$. The cruiser starts from rest; the speeder has no acceleration. Solve the resulting quadratic.",
      walkthrough: [
        {
          step: "Write x(t) for both vehicles.",
          expression: `x_p(t) = \\tfrac{1}{2}(3)t^2 = 1.5t^2 \\qquad x_s(t) = 25t`,
          annotation: "Cruiser: $v_0=0$, $a=3$ m/s², starts at $x=0$. Speeder: constant $v=25$ m/s, same start point.",
        },
        {
          step: "Set positions equal (cruiser catches speeder).",
          expression: `1.5t^2 = 25t \\Rightarrow 1.5t^2 - 25t = 0 \\Rightarrow t(1.5t - 25) = 0`,
          annotation: "Two solutions: $t = 0$ (start, both at same place) and $t = 25/1.5$.",
        },
        {
          step: "Find the catch-up time.",
          expression: `t = \\frac{25}{1.5} = \\frac{50}{3} \\approx 16.7 \\text{ s}`,
          annotation: "The cruiser catches the speeder after about 16.7 seconds.",
        },
        {
          step: "Find the distance.",
          expression: `x = 25t = 25 \\times \\frac{50}{3} = \\frac{1250}{3} \\approx 416.7 \\text{ m}`,
          annotation: "Distance traveled by both vehicles when the cruiser catches up.",
        },
        {
          step: "Check: cruiser's velocity at catch-up.",
          expression: `v_p = 3 \\times \\frac{50}{3} = 50 \\text{ m/s} > 25 \\text{ m/s}`,
          annotation: "At the catch-up point, the cruiser is going 50 m/s — twice the speeder's speed. Makes sense: the cruiser must be faster than the speeder to have caught up.",
        },
      ],
      conclusion:
        "The cruiser catches the speeder after approximately 16.7 s at a distance of 416.7 m. At that moment the cruiser's speed (50 m/s) is double the speeder's (25 m/s) — confirming it passed the speeder's position during the catch-up.",
    },
  ],

  checkpoints: [
    {
      id: 'p1-ch2-008-cp1',
      question: `A ball rolls at $v_0 = 4$ m/s and decelerates at $a = -0.5$ m/s². Which SUVAT equation should you use to find how far it travels before stopping? Set it up but do not solve.`,
      answer: `The "missing" variable is $t$ (not mentioned). Use Eq 5: $v^2 = v_0^2 + 2a\\Delta x$. With $v=0$: $0 = 16 + 2(-0.5)\\Delta x$, ready to solve for $\\Delta x$.`,
    },
    {
      id: 'p1-ch2-008-cp2',
      question: `After solving a SUVAT problem, you find $t = -3$ s. What does this likely mean, and what should you do?`,
      answer: `Negative time usually indicates a sign error in the setup — most likely an incorrect sign for $v_0$, $v$, or $a$. Recheck the positive direction choice and re-examine whether each vector quantity should be positive or negative in that coordinate system.`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Accelerating bike — step by step with cross-check',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Step 1: list all five quantities
v0 = 2.0    # m/s — GIVEN
a  = 1.5    # m/s² — GIVEN
t_end = 6.0    # s — GIVEN
# Unknown: v and dx. Missing: (none — two unknowns here)

# Step 2: apply the five-step protocol
v  = v0 + a * t_end                   # Eq 1 (excludes dx)
dx = v0*t_end + 0.5*a*t_end**2        # Eq 3 (excludes v)
print(f"Final velocity : {v:.2f} m/s")
print(f"Displacement  : {dx:.2f} m")

# Step 5: cross-check via Eq 5
check = v**2 - (v0**2 + 2*a*dx)
print(f"Cross-check (should be 0): {check:.4f}")

# Plot the motion
t = np.linspace(0, t_end, 200)
x_t = v0*t + 0.5*a*t**2
v_t = v0 + a*t

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
ax1.plot(t, x_t, 'b-', linewidth=2)
ax1.set_xlabel('t (s)'); ax1.set_ylabel('x (m)'); ax1.set_title('x(t) — bike')
ax1.grid(True, alpha=0.4)

ax2.plot(t, v_t, 'r-', linewidth=2)
ax2.set_xlabel('t (s)'); ax2.set_ylabel('v (m/s)'); ax2.set_title('v(t) — bike')
ax2.grid(True, alpha=0.4)
plt.tight_layout()
plt.savefig('bike_motion.png', dpi=100, bbox_inches='tight')
plt.show()`,
          prose: [
            `Lines 4–6 encode the five-step protocol: label each known with its SUVAT symbol. \`v0\`, \`a\`, and \`t_end\` are the three givens. Both \`v\` and \`dx\` are unknown — in problems with two unknowns, apply the protocol twice, using two different equations.`,
            `\`v = v0 + a*t_end\` implements Eq 1 ($v = v_0 + at$). \`dx = v0*t_end + 0.5*a*t_end**2\` implements Eq 3 ($\\Delta x = v_0 t + \\tfrac{1}{2}at^2$). The cross-check line evaluates $v^2 - (v_0^2 + 2a\\Delta x)$: this should be zero by Eq 5 if both previous answers are correct.`,
            `The two plots show $x(t)$ (parabola — constant acceleration) and $v(t)$ (straight line). Visually: the slope of $x(t)$ at any point equals the value of $v(t)$ at that point — the kinematic chain from Lesson ch2-006. The final point on $v(t)$ (at $t = 6$) should read 11 m/s, confirming the computation.`,
          ],
        },
        {
          cellTitle: 'Braking car — visualizing deceleration',
          type: 'code',
          language: 'python',
          code: `# Braking car: v0=30, v=0, dx=90
v0_car = 30.0   # m/s
v_car  = 0.0    # m/s (stopped)
dx_car = 90.0   # m

# Missing: t  →  use Eq 5
a_car = (v_car**2 - v0_car**2) / (2 * dx_car)
print(f"Deceleration: {a_car:.2f} m/s² (negative = opposing motion)")

# Find t using Eq 1
t_car = (v_car - v0_car) / a_car
print(f"Stopping time: {t_car:.2f} s")

# Plot
t2 = np.linspace(0, t_car, 200)
x2 = v0_car*t2 + 0.5*a_car*t2**2
v2 = v0_car + a_car*t2

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))
ax1.plot(t2, x2, 'b-', linewidth=2)
ax1.axhline(dx_car, color='k', linestyle='--', label=f'Δx = {dx_car} m')
ax1.set_xlabel('t (s)'); ax1.set_ylabel('x (m)'); ax1.set_title('x(t) — braking car')
ax1.legend(); ax1.grid(True, alpha=0.4)

ax2.plot(t2, v2, 'r-', linewidth=2)
ax2.axhline(0, color='k', linestyle='--')
ax2.set_xlabel('t (s)'); ax2.set_ylabel('v (m/s)'); ax2.set_title('v(t) — braking car')
ax2.grid(True, alpha=0.4)
plt.tight_layout()
plt.savefig('braking_car.png', dpi=100, bbox_inches='tight')
plt.show()`,
          prose: [
            `\`a_car = (v**2 - v0**2) / (2*dx)\` implements Eq 5 rearranged for $a$: $(v^2 - v_0^2) / (2\\Delta x)$. With $v = 0$ and positive $v_0$ and $\\Delta x$, the result is negative — correctly encoding deceleration in the forward-positive convention.`,
            `The $x(t)$ plot is a downward-curving parabola: the car moves forward but progressively slower, stopping at $t = 6$ s exactly at $x = 90$ m. The dashed line at 90 m shows where the car stops. The $v(t)$ plot is a straight line going from 30 m/s down to 0 — uniform deceleration.`,
            `Notice that $v(t)$ reaches exactly zero at the right endpoint of the time axis. If your computed $a$ had been wrong (e.g., positive instead of negative), $v(t)$ would be increasing and $x(t)$ would curve upward — the plots provide an instant visual sanity check that the sign is correct.`,
          ],
        },
        {
          cellTitle: 'SUVAT solver function',
          type: 'code',
          language: 'python',
          code: `def suvat(v0=None, v=None, a=None, t=None, dx=None):
    """Return all five SUVAT quantities given any three non-None inputs."""
    # Case: know v0, a, t
    if v0 is not None and a is not None and t is not None:
        v  = v0 + a*t
        dx = v0*t + 0.5*a*t**2
    # Case: know v0, v, a
    elif v0 is not None and v is not None and a is not None:
        t  = (v - v0) / a
        dx = (v**2 - v0**2) / (2*a)
    # Case: know v0, v, t
    elif v0 is not None and v is not None and t is not None:
        a  = (v - v0) / t
        dx = 0.5*(v0 + v)*t
    # Case: know v0, a, dx
    elif v0 is not None and a is not None and dx is not None:
        v  = np.sqrt(v0**2 + 2*a*dx)   # positive root
        t  = (v - v0) / a
    return {'v0': v0, 'v': v, 'a': a, 't': t, 'dx': dx}

# Test all four cases
cases = [
    dict(v0=2, a=1.5, t=6),       # bike
    dict(v0=30, v=0, a=-5),        # braking car
    dict(v0=0, v=22.36, t=44.7),  # train
    dict(v0=0, a=0.5, dx=500),    # train (alternate)
]
for c in cases:
    r = suvat(**c)
    print(r)`,
          prose: [
            `The \`suvat\` function implements the five-step protocol in code: for each combination of three knowns, it picks the correct two equations and solves. Each \`if/elif\` branch corresponds to one "missing variable" case — the branch chosen is determined by which three arguments are not \`None\`.`,
            `The four test cases at the bottom verify all implemented branches against the worked examples. The bike (v0, a, t) gives v=11, dx=39. The braking car (v0, v, a) gives t=6, dx=90. The train (v0, v, t) computes acceleration and displacement. The last case (v0, a, dx) finds v from Eq 5 — using the positive square root.`,
            `Notice the \`v0, a, dx\` case uses \`np.sqrt\` and takes the positive root only. In general, Eq 5 gives $v = \\pm\\sqrt{v_0^2 + 2a\\Delta x}$; the correct sign depends on the physical direction of motion. A complete SUVAT solver would need additional logic to determine the sign — this is left as a learning exercise.`,
          ],
        },
        {
          cellTitle: 'Challenge: complete the SUVAT solver for two missing cases',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `def suvat_complete(v0=None, v=None, a=None, t=None, dx=None):
    """Handle all five common 3-known cases."""
    if v0 is not None and a is not None and t is not None:
        v  = v0 + a*t
        dx = v0*t + 0.5*a*t**2
    elif v0 is not None and v is not None and a is not None:
        t  = (v - v0) / a
        dx = (v**2 - v0**2) / (2*a)
    elif v0 is not None and v is not None and t is not None:
        a  = (v - v0) / t
        dx = 0.5*(v0 + v)*t
    elif v0 is not None and a is not None and dx is not None:
        v  = np.sqrt(v0**2 + 2*a*dx)
        t  = (v - v0) / a
    # TODO: add the case where v, a, t are known (v0 and dx are unknown)
    # TODO: add the case where v0, v, dx are known (a and t are unknown)
    return {'v0': v0, 'v': v, 'a': a, 't': t, 'dx': dx}
`,
          prose: [
            `There are ${5} SUVAT quantities and we always know 3 and find 2. That means $\\binom{5}{3} = 10$ possible cases. The starter code handles 4 of them. Your task: add the two missing cases (v, a, t known; and v0, v, dx known).`,
            `For the (v, a, t) case: $v_0 = v - at$ (rearrange Eq 1); $\\Delta x = vt - \\tfrac{1}{2}at^2$ (Eq 4). For the (v0, v, dx) case: $a = (v^2 - v_0^2)/(2\\Delta x)$ (Eq 5 rearranged); $t = 2\\Delta x/(v_0 + v)$ (Eq 2 rearranged).`,
            `The test code below checks both new cases. After adding both branches, verify that all six test cases pass. A complete solver is useful for quickly checking homework answers or generating multiple related problems.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Accelerating bike — step by step with cross-check',
          type: 'code',
          language: 'matlab',
          code: `% Step 1: list all five SUVAT quantities
v0    = 2.0;    % m/s
a_acc = 1.5;    % m/s²
t_end = 6.0;    % s

% Step 2: apply the protocol
v_fin = v0 + a_acc * t_end;              % Eq 1 (excludes dx)
dx    = v0*t_end + 0.5*a_acc*t_end^2;   % Eq 3 (excludes v)
fprintf('Final velocity : %.2f m/s\\n', v_fin);
fprintf('Displacement  : %.2f m\\n', dx);

% Step 5: cross-check via Eq 5
check = v_fin^2 - (v0^2 + 2*a_acc*dx);
fprintf('Cross-check (should be 0): %.4f\\n', check);

% Plot the motion
t = linspace(0, t_end, 200);
x_t = v0*t + 0.5*a_acc*t.^2;
v_t = v0 + a_acc*t;

figure;
subplot(1,2,1); plot(t, x_t, 'b-', 'LineWidth', 2);
xlabel('t (s)'); ylabel('x (m)'); title('x(t) — bike'); grid on;

subplot(1,2,2); plot(t, v_t, 'r-', 'LineWidth', 2);
xlabel('t (s)'); ylabel('v (m/s)'); title('v(t) — bike'); grid on;`,
          prose: [
            `In MATLAB, scalar operations do not need the dot operator — \`a_acc * t_end\` and \`t_end^2\` are scalar operations. However, when \`t\` is an array (line using \`linspace\`), element-wise operations require the dot: \`t.^2\` and \`0.5*a_acc*t.^2\`. This distinction is MATLAB-specific and a frequent source of errors.`,
            `The variable is named \`a_acc\` rather than \`a\` because \`a\` is MATLAB's reserved symbol for the second return argument of some built-in functions. Avoiding single-letter variable names like \`a\`, \`e\`, \`i\`, \`j\` prevents subtle conflicts with MATLAB built-ins.`,
            `The cross-check \`check = v_fin^2 - (v0^2 + 2*a_acc*dx)\` evaluates Eq 5's left side minus right side. If both earlier answers are correct, this is identically zero. A nonzero result signals a computation error. This is the MATLAB version of the "substitute back" check from the worked example.`,
          ],
        },
        {
          cellTitle: 'Braking car — visualizing deceleration',
          type: 'code',
          language: 'matlab',
          code: `% Braking car: v0=30, v=0, dx=90
v0_car = 30.0;
v_car  = 0.0;
dx_car = 90.0;

% Missing: t  →  use Eq 5 for a
a_car = (v_car^2 - v0_car^2) / (2 * dx_car);
fprintf('Deceleration: %.2f m/s²\\n', a_car);

% Find t using Eq 1
t_car = (v_car - v0_car) / a_car;
fprintf('Stopping time: %.2f s\\n', t_car);

% Plot
t2 = linspace(0, t_car, 200);
x2 = v0_car*t2 + 0.5*a_car*t2.^2;
v2 = v0_car + a_car*t2;

figure;
subplot(1,2,1);
plot(t2, x2, 'b-', 'LineWidth', 2); hold on;
yline(dx_car, 'k--', sprintf('Δx = %g m', dx_car));
xlabel('t (s)'); ylabel('x (m)'); title('x(t) — braking car'); grid on;

subplot(1,2,2);
plot(t2, v2, 'r-', 'LineWidth', 2); hold on; yline(0, 'k--');
xlabel('t (s)'); ylabel('v (m/s)'); title('v(t) — braking car'); grid on;`,
          prose: [
            `\`a_car = (v_car^2 - v0_car^2) / (2*dx_car)\` directly implements Eq 5 rearranged for $a$. With $v = 0$, the numerator is $-v_0^2 < 0$ and the denominator is positive, so $a < 0$ — correctly representing deceleration without any manual sign insertion.`,
            `\`yline(dx_car, ...)\` draws a horizontal dashed reference line at the stopping displacement. This requires MATLAB R2018b or later. In older MATLAB or Octave, use \`plot([0 t_car], [dx_car dx_car], 'k--')\` instead. The line helps verify visually that the position curve ends exactly at the expected value.`,
            `Both plots should have a physically sensible shape: $x(t)$ is a downward-curving parabola (slowing down → slope decreasing) that reaches 90 m at $t = 6$ s; $v(t)$ is a straight line from 30 down to 0. If the signs were wrong, $x(t)$ would curve upward and $v(t)$ would be increasing — an immediate visual red flag.`,
          ],
        },
        {
          cellTitle: 'SUVAT solver function in MATLAB',
          type: 'code',
          language: 'matlab',
          code: `% SUVAT solver — returns a struct with all five quantities
function result = suvat(v0, v, a, t, dx)
    % Pass NaN for unknown quantities
    if ~isnan(v0) && ~isnan(a) && ~isnan(t)
        v  = v0 + a*t;
        dx = v0*t + 0.5*a*t^2;
    elseif ~isnan(v0) && ~isnan(v) && ~isnan(a)
        t  = (v - v0) / a;
        dx = (v^2 - v0^2) / (2*a);
    elseif ~isnan(v0) && ~isnan(v) && ~isnan(t)
        a  = (v - v0) / t;
        dx = 0.5*(v0 + v)*t;
    elseif ~isnan(v0) && ~isnan(a) && ~isnan(dx)
        v  = sqrt(v0^2 + 2*a*dx);
        t  = (v - v0) / a;
    end
    result = struct('v0',v0,'v',v,'a',a,'t',t,'dx',dx);
end

% Test cases (call from Command Window or script)
r1 = suvat(2, NaN, 1.5, 6, NaN);   % bike
disp(r1)
r2 = suvat(30, 0, -5, NaN, NaN);   % braking car
disp(r2)`,
          prose: [
            `MATLAB uses \`NaN\` (Not a Number) as the "missing" marker instead of Python's \`None\`. The condition \`~isnan(v0)\` checks that \`v0\` is not NaN — i.e., it was provided. Pass \`NaN\` for any quantity you do not know. This mirrors the protocol: you explicitly tell the function which three quantities are given.`,
            `The function is placed at the bottom of the script file in MATLAB (local functions must come after the main script body). In Octave, you can also define functions in separate \`.m\` files. Each \`if/elseif\` branch corresponds to one "missing variable" case — the same structure as the Python version, translated to MATLAB syntax.`,
            `\`struct('v0',v0,'v',v,...)\` creates a MATLAB struct, similar to Python's dictionary return. Access fields with dot notation: \`r1.v\`, \`r1.dx\`. The \`disp\` function prints the struct contents in a readable format for quick verification.`,
          ],
        },
        {
          cellTitle: 'Challenge: complete the SUVAT solver',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `function result = suvat_complete(v0, v, a, t, dx)
    % Handles all five 3-known combinations
    if ~isnan(v0) && ~isnan(a) && ~isnan(t)
        v = v0 + a*t; dx = v0*t + 0.5*a*t^2;
    elseif ~isnan(v0) && ~isnan(v) && ~isnan(a)
        t = (v - v0)/a; dx = (v^2 - v0^2)/(2*a);
    elseif ~isnan(v0) && ~isnan(v) && ~isnan(t)
        a = (v - v0)/t; dx = 0.5*(v0+v)*t;
    elseif ~isnan(v0) && ~isnan(a) && ~isnan(dx)
        v = sqrt(v0^2 + 2*a*dx); t = (v-v0)/a;
    % TODO: add case: v, a, t known → find v0 and dx
    % TODO: add case: v0, v, dx known → find a and t
    end
    result = struct('v0',v0,'v',v,'a',a,'t',t,'dx',dx);
end
`,
          prose: [
            `Your task is to add two missing branches. For the (v, a, t known) case: $v_0 = v - at$ (rearrange Eq 1) and $\\Delta x = vt - \\tfrac{1}{2}at^2$ (Eq 4). For the (v0, v, dx known) case: $a = (v^2 - v_0^2)/(2\\Delta x)$ (Eq 5) and $t = 2\\Delta x/(v_0 + v)$ (Eq 2).`,
            `After adding the two branches, test with: \`suvat_complete(NaN, 15, -3, 5, NaN)\` (should give v0=30, dx=112.5) and \`suvat_complete(0, NaN, NaN, NaN, 50)\` — wait, that's only two knowns. Use \`suvat_complete(0, 20, NaN, NaN, 50)\` (should give a=4, t=5).`,
            `With all six branches working, the function handles every constant-acceleration scenario solvable with SUVAT. Cross-checking using a different branch is straightforward: call \`suvat_complete\` with three of your computed answers as knowns and verify the function reproduces the other two.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch2-008-q1',
      type: 'choice',
      question: `A bike starts at $v_0 = 2$ m/s and accelerates at $a = 1.5$ m/s² for 6 s. What is the final velocity?`,
      options: [`9 m/s`, `11 m/s`, `13 m/s`, `15 m/s`],
      answer: `11 m/s`,
      hints: [
        `Use Eq 1: $v = v_0 + at$. The missing variable (not needed) is $\\Delta x$.`,
        `Substitute: $v = 2 + 1.5 \\times 6$.`,
      ],
      reviewSection: 'examples',
      explanation: `$v = v_0 + at = 2 + 1.5(6) = 11$ m/s. Use Eq 1 (excludes $\\Delta x$, which is the missing variable here).`,
    },
    {
      id: 'p1-ch2-008-q2',
      type: 'choice',
      question: `For the same bike ($v_0 = 2$ m/s, $a = 1.5$ m/s², $t = 6$ s), what is the displacement?`,
      options: [`27 m`, `39 m`, `66 m`, `11 m`],
      answer: `39 m`,
      hints: [
        `Use Eq 3: $\\Delta x = v_0 t + \\tfrac{1}{2}at^2$. The missing variable here is $v$ (already found but you don't need it for this equation).`,
        `$\\Delta x = 2(6) + \\tfrac{1}{2}(1.5)(36)$.`,
      ],
      reviewSection: 'examples',
      explanation: `$\\Delta x = v_0 t + \\tfrac{1}{2}at^2 = 2(6) + \\tfrac{1}{2}(1.5)(36) = 12 + 27 = 39$ m.`,
    },
    {
      id: 'p1-ch2-008-q3',
      type: 'choice',
      question: `You know $v_0$, $v$, and $a$ but not $t$. Which equation gives displacement?`,
      options: [
        `$v = v_0 + at$`,
        `$\\Delta x = v_0 t + \\tfrac{1}{2}at^2$`,
        `$v^2 = v_0^2 + 2a\\Delta x$`,
        `$\\Delta x = \\tfrac{1}{2}(v_0+v)t$`,
      ],
      answer: `$v^2 = v_0^2 + 2a\\Delta x$`,
      hints: [
        `The missing variable (not needed) is $t$. Which equation excludes $t$?`,
        `Eq 5 contains $\\Delta x$, $v_0$, $v$, and $a$ — but NOT $t$.`,
      ],
      reviewSection: 'intuition',
      explanation: `$v^2 = v_0^2 + 2a\\Delta x$ (Eq 5) contains no $t$. Rearrange: $\\Delta x = (v^2 - v_0^2) / (2a)$.`,
    },
    {
      id: 'p1-ch2-008-q4',
      type: 'choice',
      question: `What is the first step in any SUVAT problem?`,
      options: [
        `Write the biggest equation`,
        `List all five quantities ($\\Delta x$, $v_0$, $v$, $a$, $t$) and mark knowns, unknowns, and missing`,
        `Convert all units to CGS`,
        `Draw the trajectory`,
      ],
      answer: `List all five quantities ($\\Delta x$, $v_0$, $v$, $a$, $t$) and mark knowns, unknowns, and missing`,
      hints: [
        `The systematic protocol prevents equation-guessing errors.`,
        `The "missing" variable (not given, not needed) is what points you to the correct equation.`,
      ],
      reviewSection: 'intuition',
      explanation: `Always list all five quantities first. The missing variable reveals which equation to use — the one that excludes it.`,
    },
    {
      id: 'p1-ch2-008-q5',
      type: 'choice',
      question: `A car starts from rest ($v_0 = 0$) and reaches $v = 24$ m/s over $\\Delta x = 72$ m. What is $a$?`,
      options: [`2 m/s²`, `4 m/s²`, `6 m/s²`, `8 m/s²`],
      answer: `4 m/s²`,
      hints: [
        `Missing variable: $t$. Use Eq 5: $v^2 = v_0^2 + 2a\\Delta x$.`,
        `$576 = 0 + 2a(72)$. Solve for $a$.`,
      ],
      reviewSection: 'examples',
      explanation: `$v^2 = v_0^2 + 2a\\Delta x \\Rightarrow 576 = 0 + 144a \\Rightarrow a = 4$ m/s².`,
    },
    {
      id: 'p1-ch2-008-q6',
      type: 'choice',
      question: `After solving, you find $t = -2$ s. What does this most likely mean?`,
      options: [
        `The answer is correct — negative time is valid`,
        `There is a sign error — recheck positive direction and signs of $v_0$, $v$, $a$`,
        `The object moved backward`,
        `The problem has no solution`,
      ],
      answer: `There is a sign error — recheck positive direction and signs of $v_0$, $v$, $a$`,
      hints: [
        `Physical time in most kinematics problems must be positive (the event happens after $t = 0$).`,
        `The most common cause is assigning the wrong sign to deceleration or final velocity.`,
      ],
      reviewSection: 'math',
      explanation: `Negative time usually signals a sign error in setup. Recheck the positive direction convention and the sign of each vector quantity.`,
    },
    {
      id: 'p1-ch2-008-q7',
      type: 'choice',
      question: `Equation 2, $\\Delta x = \\tfrac{1}{2}(v_0 + v)t$, excludes which variable?`,
      options: [`$t$`, `$v$`, `$a$`, `$\\Delta x$`],
      answer: `$a$`,
      hints: [
        `Scan the equation: which of the five SUVAT quantities does NOT appear?`,
        `The equation contains $\\Delta x$, $v_0$, $v$, and $t$ — but not one of them.`,
      ],
      reviewSection: 'intuition',
      explanation: `Eq 2 contains $\\Delta x$, $v_0$, $v$, and $t$ — but not $a$. Use it when acceleration is unknown but you know both velocities and time.`,
    },
    {
      id: 'p1-ch2-008-q8',
      type: 'choice',
      question: `Which check best confirms a SUVAT answer is correct?`,
      options: [
        `Verify the units are in SI`,
        `Substitute your computed values into a second, different SUVAT equation and confirm it is satisfied`,
        `Check that the answer is positive`,
        `Draw the x–t graph`,
      ],
      answer: `Substitute your computed values into a second, different SUVAT equation and confirm it is satisfied`,
      hints: [
        `Using one equation to solve and then verifying with a different equation is an algebraically independent check.`,
        `If the second equation is also satisfied, the answer is almost certainly correct.`,
      ],
      reviewSection: 'math',
      explanation: `Substitute computed values into a different equation. If all five SUVAT quantities satisfy multiple equations simultaneously, the answer is correct.`,
    },
    {
      id: 'p1-ch2-008-q9',
      type: 'choice',
      question: `A braking car decelerates from 30 m/s to rest in 90 m. What is the deceleration?`,
      options: [`-3 m/s²`, `-5 m/s²`, `-10 m/s²`, `-15 m/s²`],
      answer: `-5 m/s²`,
      hints: [
        `Missing variable: $t$. Use Eq 5: $v^2 = v_0^2 + 2a\\Delta x$.`,
        `$0 = 900 + 2a(90)$. Solve for $a$.`,
      ],
      reviewSection: 'examples',
      explanation: `$0 = 900 + 180a \\Rightarrow a = -900/180 = -5$ m/s². Negative because the car is decelerating in the forward-positive direction.`,
    },
    {
      id: 'p1-ch2-008-q10',
      type: 'choice',
      question: `A train starts from rest and accelerates at $0.5$ m/s² for 500 m. What is its final speed?`,
      options: [`15.8 m/s`, `22.4 m/s`, `25.0 m/s`, `31.6 m/s`],
      answer: `22.4 m/s`,
      hints: [
        `Missing variable: $t$. Use Eq 5: $v^2 = v_0^2 + 2a\\Delta x$.`,
        `$v^2 = 0 + 2(0.5)(500) = 500$. Take the square root.`,
      ],
      reviewSection: 'examples',
      explanation: `$v^2 = 2(0.5)(500) = 500 \\Rightarrow v = \\sqrt{500} = 10\\sqrt{5} \\approx 22.4$ m/s.`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch2-008-m1',
      misconception: `"I can pick any SUVAT equation and solve; if I have three knowns, any equation will work."`,
      correction: `Only the equation that contains your three knowns (plus the unknown) will work. If you pick an equation that contains the "missing" variable, you have four unknowns and cannot solve it. The protocol (identify missing → pick the excluding equation) guarantees you always pick the right one.`,
      correctionExample: `Knowns: $v_0$, $v$, $a$. Missing: $t$. If you try Eq 3 ($\\Delta x = v_0 t + \\tfrac{1}{2}at^2$), you have both $t$ and $\\Delta x$ unknown — unsolvable. Use Eq 5 (no $t$) instead.`,
    },
    {
      id: 'p1-ch2-008-m2',
      misconception: `"Deceleration means the acceleration value is always negative."`,
      correction: `Deceleration means the object is slowing down — the acceleration opposes the velocity direction. If the object is moving in the negative direction and slowing down, the acceleration is positive (opposing a negative velocity). The sign of $a$ depends on the coordinate system, not on whether the object is "accelerating" or "decelerating" in common English.`,
      correctionExample: `Ball thrown upward (positive direction): $v > 0$, $a = -g = -10$ m/s² (deceleration). Ball falling back down: $v < 0$, $a = -10$ m/s² (acceleration in the direction of motion). Same $a$, different physical situation.`,
    },
  ],

  transferPrompts: [
    `A driver reaction time of 0.7 s elapses before braking. At 30 m/s, how far does the car travel during reaction time? Then during braking at $a = -6$ m/s², how much additional distance is needed? What is the total stopping distance? How does total stopping distance change if speed increases to 40 m/s?`,
    `SUVAT applies to any uniformly accelerating system. In finance, if an investment grows at a constant rate $r$ per year (analogous to $a$), starting at value $V_0$, write the "financial SUVAT" for value after $t$ years. Where does the analogy break down (hint: financial growth is exponential, not linear)?`,
  ],

  debugging: [
    {
      id: 'p1-ch2-008-d1',
      buggyWork: `Student solves: "Car brakes from 20 m/s to rest over 5 s. Knowns: $v_0 = 20$, $v = 0$, $t = 5$. Use Eq 5: $0 = 400 + 2a\\Delta x$. Get $a = -200/\\Delta x$." Student is stuck.`,
      question: `What went wrong with the equation selection?`,
      answer: `The student used Eq 5 ($v^2 = v_0^2 + 2a\\Delta x$), which contains both $a$ and $\\Delta x$ as unknowns — two unknowns, one equation, unsolvable. The "missing" variable here is $\\Delta x$ (not stated in the problem), so they should have used Eq 1 ($v = v_0 + at$, excludes $\\Delta x$) to find $a = (v-v_0)/t = (0-20)/5 = -4$ m/s² first.`,
    },
    {
      id: 'p1-ch2-008-d2',
      buggyWork: `Student writes: "Car at $v_0 = 10$ m/s, $a = -2$ m/s². Displacement after 4 s: $\\Delta x = v_0 t + \\tfrac{1}{2}at^2 = 10(4) + \\tfrac{1}{2}(-2)(4) = 40 - 4 = 36$ m."`,
      question: `Find the arithmetic error.`,
      answer: `The student computed $\\tfrac{1}{2}(-2)(4)$ instead of $\\tfrac{1}{2}(-2)(4^2)$. The correct calculation is: $\\tfrac{1}{2}(-2)(16) = -16$, so $\\Delta x = 40 - 16 = 24$ m. Forgetting to square $t$ in the $\\tfrac{1}{2}at^2$ term is one of the most common arithmetic mistakes in SUVAT problems.`,
    },
  ],

  mastery: {
    targetLevel: `Solve any constant-acceleration problem in three or fewer steps by applying the systematic five-step SUVAT protocol: list quantities, identify missing variable, select excluding equation, compute, cross-check.`,
    coreSkill: `Equation selection: given any three of the five SUVAT quantities, immediately identify the correct equation (the one that excludes the missing fourth quantity) without guessing.`,
    commonSticking: `Students often skip listing all five quantities and jump to an equation, leading to selecting a two-unknown equation. The protocol requires writing all five explicitly before touching algebra.`,
    connections: `SUVAT equations are the algebraic result of integrating constant acceleration twice (Ch2-006). They generalize to 2D projectile motion (Ch3) by applying each equation component-wise. All future kinematics problems — free fall, projectiles, orbital mechanics — use this exact same five-step protocol.`,
  },

  semantics: {
    core: [
      { symbol: `v_0`, meaning: `Initial velocity — the velocity at the start of the time interval being analyzed.` },
      { symbol: `v`, meaning: `Final velocity — the velocity at the end of the time interval.` },
      { symbol: `a`, meaning: `Constant acceleration — must be truly constant for SUVAT to apply; positive or negative depending on direction.` },
      { symbol: `t`, meaning: `Time elapsed — the duration of the interval; always positive in forward-time problems.` },
      { symbol: `\\Delta x`, meaning: `Displacement — the net change in position; positive if motion is in the positive direction, negative if not.` },
    ],
    rulesOfThumb: [
      `Choose your positive direction before writing any numbers — commit to it and never switch.`,
      `The "missing" variable (not needed) points to the correct equation: use the equation that excludes it.`,
      `After solving, cross-check by substituting all five values into a different equation — if it holds, the answer is correct.`,
      `$t < 0$ almost always means a sign error in $v_0$, $v$, or $a$ — recheck before trusting the answer.`,
      `SUVAT only applies to constant acceleration; variable $a(t)$ requires integration (Eq ch2-006).`,
    ],
  },
};

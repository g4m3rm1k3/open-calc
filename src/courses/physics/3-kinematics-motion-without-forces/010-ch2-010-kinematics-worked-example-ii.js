export default {
  id: 'p1-ch2-010',
  slug: 'kinematics-worked-example-ii',
  chapter: 'p2',
  order: 10,
  title: "Kinematics Worked Example II",
  subtitle: "Multi-step SUVAT solving with sign discipline and cross-checks.",
  tags: ["worked example", "sign convention", "SUVAT", "multi-step", "direction reversal"],
  aliases: "kinematics example 2 sign convention multi-step",

  hook: {
    question:
      "Why do correct numbers still give wrong answers when signs are inconsistent — and how do you prevent it?",
    realWorldContext:
      "Direction errors are the most common failure mode in motion analysis, simulation code, and exam work. A spacecraft guidance system must track whether each engine fires in the +x or −x direction; a robotics controller must know whether a joint moves clockwise or counterclockwise. In every case, the root of a sign error is the same: the positive direction was not declared before numbers were assigned. This lesson gives you a protocol that makes sign errors nearly impossible.",
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      `Before reading on, predict: a ball is thrown upward at 15 m/s from the top of a 20-m building. You define "up" as positive. What is the sign of $v_0$? What is the sign of $a$? What is the sign of the displacement $\\Delta y$ when the ball hits the ground? Write your three signs before continuing.`,
      "Sign discipline is not about memorizing which sign to use — it is about committing to a convention before you write a single number and then following it mechanically. Choose a positive direction. Positive direction means positive velocity (moving that way), positive acceleration (pushing that way), and positive displacement (ending up that way). Negative means opposite. That is the entire rule.",
      "The most common sign error is picking a positive direction but then adding 'braking means a = 9.8 m/s²' or 'falling means a = 9.8 m/s²' as separate facts, overriding the convention. There is only one rule: does this vector point in the positive direction? If yes, assign it positive. If no, assign it negative. Apply this to every single quantity.",
      "Multi-step problems have a second pitfall: forgetting to reset initial conditions when the object enters a new phase. For example, if an object brakes to a stop and then is given a new acceleration, the second phase starts with $v_0 = 0$ and a fresh $x_0$. The positive direction from phase 1 must remain the positive direction for phase 2 — but the initial values change.",
      "For direction reversal within a single SUVAT calculation: the equations handle it automatically. If you fire a ball upward with positive velocity and constant negative acceleration (gravity), the SUVAT equations give negative $\\Delta y$ (downward final position) and positive stopping time. No special handling is needed — just trust the algebra and the sign convention.",
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Sign-discipline checklist — do this before touching the equations',
        body: `1. Declare the positive direction (word + arrow on diagram). 2. Assign signs to every given quantity: $v_0$, $v$, $a$, $\\Delta x$. If it points positive → positive; if it points opposite → negative. 3. Write the equations — do not change signs mid-problem. 4. After solving, check: does the sign of the answer make physical sense? 5. Cross-check with a different SUVAT equation.`,
      },
      {
        type: 'insight',
        title: 'The sign rule is universal — it works for any choice of positive direction',
        body: `You can choose up, down, left, right, or any direction as positive and get a physically correct answer — as long as you are consistent. Using "down = positive" for a falling object is unusual but valid: then $v_0 > 0$ for a downward throw, $a = +g$, and $\\Delta y > 0$. Different conventions give differently signed answers, but the physical magnitudes (speed, distance) are the same.`,
      },
      {
        type: 'warning',
        title: 'Resetting initial conditions in multi-phase problems',
        body: `When a problem has two phases (e.g., accelerate then brake), each phase is a separate SUVAT calculation. Phase 2 starts with $v_0 = v_{\\text{end of phase 1}}$ and $x_0 = x_{\\text{end of phase 1}}$. The positive direction stays the same, but the initial values reset. Forgetting this is the second most common multi-step error after sign errors.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'suvat-map' },
        title: 'SUVAT equation selector',
        caption: 'Sign discipline starts before you write any equation. Identify knowns with their signs, then pick the equation that connects them.',
      },
    ],
  },

  math: {
    prose: [
      `The key algebraic operation for multi-step problems is identifying the "phase boundary" — the moment that connects one phase to the next. At the boundary, you have at least three known quantities (the end state of phase 1, which is the start state of phase 2 plus any given quantities for phase 2). Apply the five-step SUVAT protocol to each phase independently.`,
      `For problems involving a direction reversal (like throwing a ball upward and catching it as it comes back down), you have two choices: (1) solve each phase (up and down) separately with the same sign convention, or (2) use a single SUVAT calculation with the constant negative acceleration throughout. The single-calculation approach is usually simpler, but requires trusting that SUVAT handles negative velocities correctly (it does).`,
      `Cross-checking is essential in multi-step problems because errors in phase 1 propagate to phase 2. After completing all phases, verify: (a) every computed value has a sensible sign, (b) at least one inter-phase boundary value can be checked with a different equation, and (c) the final answer is physically plausible (order of magnitude, direction).`,
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Multi-phase template',
        body: `Phase 1: knowns $\\{v_{0,1}, a_1, t_1\\}$ → find $v_1$ and $\\Delta x_1$ using Eq 1 and 3. Phase 2: $v_{0,2} = v_1$, $x_{0,2} = x_{0,1} + \\Delta x_1$, new knowns → apply protocol. Continue for each phase. At each boundary, ask: does the final state of phase 1 match the initial state of phase 2?`,
      },
      {
        type: 'warning',
        title: 'Free fall sign convention',
        body: `"Up = positive" (most common): $a = -g = -9.8$ m/s². "Down = positive" (less common but valid): $a = +g = +9.8$ m/s². NEVER use $a = +g$ with "up = positive" — it implies gravity pulls upward.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'suvat-map' },
        title: 'Systematic multi-phase setup',
        caption: `Two-phase motion: phase 1 ends where phase 2 begins. The final velocity of phase 1 becomes the initial velocity of phase 2. Both phases use the same positive direction.`,
      },
    ],
  },

  rigor: {
    title: "Why setup assumptions matter",
    prose: [
      `Every SUVAT equation carries an implicit assumption: $a = \\text{const}$ throughout the interval $[t_1, t_2]$. This assumption is satisfied in most introductory problems, but breaks in two ways: (1) acceleration changes magnitude (e.g., a rocket burning fuel), requiring different $a$ values for different phases; (2) acceleration changes direction (e.g., magnetic braking that depends on velocity), requiring the integral chain instead of SUVAT.`,
      `Sign conventions are not physics — they are coordinate choices. Physics is coordinate-free: the stopping distance of a car does not depend on which direction you call positive. The SUVAT equations are valid for any internally consistent sign assignment. This means there is no "correct" sign convention — only consistent and inconsistent ones. Inconsistency gives wrong answers; consistency always gives the right physical result.`,
      `Mathematically, SUVAT is a consequence of the constant-acceleration assumption: $a(t) = a_0$ (constant) $\\Rightarrow v(t) = v_0 + a_0 t$ (by integration) $\\Rightarrow x(t) = x_0 + v_0 t + \\tfrac{1}{2}a_0 t^2$ (by integration again). The five SUVAT equations are just algebraic rearrangements of these two integrated forms. They are not separate physical laws — they are the same two equations viewed from different perspectives.`,
      `Multi-step kinematics is the first context in physics where students must chain calculations, each dependent on the previous. The formal structure is: solve system 1 → extract terminal conditions → use as initial conditions for system 2 → repeat. This chaining structure appears throughout physics (projectile motion, electrical circuits, quantum measurement sequences) and engineering (control systems, signal processing). Mastering the technique here pays dividends in every subsequent course.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'SUVAT from constant acceleration (recap)',
        body: `v(t) = v_0 + at, \quad \Delta x = v_0 t + \tfrac{1}{2}at^2, \quad v^2 = v_0^2 + 2a\Delta x`,
      },
    ],
  },

  examples: [
    {
      id: 'p1-ch2-010-ex1',
      title: "Braking car — sign discipline from setup to cross-check",
      problem:
        "A car moves at $v_0 = 18$ m/s and brakes with $a = -3$ m/s² (forward = positive). Find the stop time and stopping distance.",
      steps: [
        {
          expression: `\\text{Sign check: } v_0 = +18 \\text{ m/s (forward = +)}, \\; a = -3 \\text{ m/s}^2 \\text{ (braking = opposite = -)}, \\; v = 0`,
          annotation: "Step 1 of protocol: assign signs to all givens. Stop velocity is zero — unsigned.",
        },
        {
          expression: `t = \\frac{v - v_0}{a} = \\frac{0 - 18}{-3} = 6 \\text{ s}`,
          annotation: "Eq 1 gives stop time. Both the numerator and denominator are negative, so $t > 0$ ✓.",
        },
        {
          expression: `\\Delta x = v_0 t + \\tfrac{1}{2}at^2 = 18(6) + \\tfrac{1}{2}(-3)(36) = 108 - 54 = 54 \\text{ m}`,
          annotation: "Eq 3 gives stopping distance. The result is positive — forward displacement ✓.",
        },
        {
          expression: `\\text{Cross-check (Eq 5): } v^2 = 18^2 + 2(-3)(54) = 324 - 324 = 0 \\checkmark`,
          annotation: "Both sides equal zero. All three computed values are consistent.",
        },
      ],
      conclusion:
        "Stop time: 6 s. Stopping distance: 54 m. Sign discipline made the sign of $a$ explicit from the start — no guessing, no 'but wait, should this be negative?' mid-calculation.",
    },
    {
      id: 'p1-ch2-010-ex2',
      title: "Ball thrown upward — direction reversal in a single calculation",
      problem:
        "A ball is thrown upward at $v_0 = 20$ m/s from ground level. Using up = positive and $g = 9.8$ m/s², find (a) the time to peak, (b) the peak height, and (c) the time to return to ground.",
      steps: [
        {
          expression: `\\text{Sign check: } v_0 = +20 \\text{ m/s (up = +)}, \\; a = -9.8 \\text{ m/s}^2 \\text{ (gravity = down = -)}, \\; x_0 = 0`,
          annotation: "Commit to convention: up is positive, gravity is negative.",
        },
        {
          expression: `\\text{(a) Peak: } v = 0 \\Rightarrow t_{\\text{peak}} = \\frac{0 - 20}{-9.8} \\approx 2.04 \\text{ s}`,
          annotation: "Eq 1: at the peak, velocity is zero. Result is positive (peak is in the future) ✓.",
        },
        {
          expression: `\\text{(b) Peak height: } \\Delta y = 20(2.04) + \\tfrac{1}{2}(-9.8)(2.04)^2 \\approx 40.8 - 20.4 = 20.4 \\text{ m}`,
          annotation: "Eq 3: positive result = above the starting point ✓.",
        },
        {
          expression: `\\text{(c) Return: } 0 = 20t + \\tfrac{1}{2}(-9.8)t^2 = t(20 - 4.9t) \\Rightarrow t = 0 \\text{ or } t = 4.08 \\text{ s}`,
          annotation: "Eq 3 with $\\Delta y = 0$. Factor out $t$: two roots — $t = 0$ is the launch, $t = 4.08$ s is the landing.",
        },
      ],
      conclusion:
        "Peak at $t \\approx 2.04$ s, height $\\approx 20.4$ m. Returns to ground at $t \\approx 4.08$ s. The direction reversal (ball going up then down) is handled automatically by the negative $a$ — no phase splitting needed.",
    },
    {
      id: 'p1-ch2-010-ex3',
      title: "Two-phase car: accelerate then brake",
      problem:
        "A car starts from rest and accelerates at $a_1 = 4$ m/s² for 5 s, then brakes to a stop with $a_2 = -8$ m/s². Find (a) the speed after phase 1, (b) the braking distance, (c) the total distance.",
      steps: [
        {
          expression: `\\text{Phase 1: } v_{0,1} = 0, \\; a_1 = +4 \\text{ m/s}^2, \\; t_1 = 5 \\text{ s}`,
          annotation: "List phase 1 knowns with signs. Forward = positive throughout.",
        },
        {
          expression: `\\text{(a) } v_1 = 0 + 4(5) = 20 \\text{ m/s}`,
          annotation: "Speed at the end of phase 1 = start of phase 2.",
        },
        {
          expression: `\\Delta x_1 = 0 + \\tfrac{1}{2}(4)(25) = 50 \\text{ m}`,
          annotation: "Phase 1 displacement.",
        },
        {
          expression: `\\text{Phase 2: } v_{0,2} = +20 \\text{ m/s}, \\; a_2 = -8 \\text{ m/s}^2, \\; v_2 = 0`,
          annotation: "Reset initial conditions: new $v_0$ from phase 1 result. Same positive direction.",
        },
        {
          expression: `\\text{(b) } \\Delta x_2 = \\frac{0^2 - 20^2}{2(-8)} = \\frac{-400}{-16} = 25 \\text{ m}`,
          annotation: "Eq 5 (no $t$): gives braking distance directly.",
        },
        {
          expression: `\\text{(c) Total distance} = \\Delta x_1 + \\Delta x_2 = 50 + 25 = 75 \\text{ m}`,
          annotation: "Both displacements are positive (forward throughout), so total distance = sum.",
        },
      ],
      conclusion:
        "Phase 1 exit speed: 20 m/s. Braking distance: 25 m. Total distance: 75 m. The key technique is treating each phase as an independent SUVAT problem, chaining the phase 1 output into the phase 2 input.",
    },
  ],

  challenges: [
    {
      id: 'p1-ch2-010-ch1',
      difficulty: 'medium',
      problem: `In free fall, a student defines "down" as positive. Write the sign of $v$ when a ball is falling, the sign of $a$ due to gravity, and the sign of displacement $\\Delta y$ after the ball has fallen 10 m from rest. Then solve: starting from rest, how long does the ball take to fall 10 m?`,
      hint: "With down = positive: gravity pulls downward, so $a = +g = +9.8$ m/s².",
      walkthrough: [
        {
          step: "Assign signs with down = positive.",
          expression: `v \\text{ (falling)} > 0, \\quad a = +9.8 \\text{ m/s}^2, \\quad \\Delta y = +10 \\text{ m (downward)}`,
          annotation: "All three quantities are positive because all point downward, which is our positive direction.",
        },
        {
          step: "List SUVAT quantities for the fall.",
          expression: `v_0 = 0 \\text{ (starts from rest)}, \\; a = +9.8 \\text{ m/s}^2, \\; \\Delta y = +10 \\text{ m}. \\quad \\text{Missing: } v`,
          annotation: "Missing variable is $v$ → use Eq 3 (excludes $v$).",
        },
        {
          step: "Solve for time using Eq 3.",
          expression: `10 = 0 + \\tfrac{1}{2}(9.8)t^2 \\Rightarrow t^2 = \\frac{20}{9.8} \\approx 2.04 \\Rightarrow t \\approx 1.43 \\text{ s}`,
          annotation: "Time is positive — consistent with the event happening in the future ✓.",
        },
        {
          step: "Verify: try 'up = positive' convention for the same problem.",
          expression: `v_0 = 0, \\; a = -9.8 \\text{ m/s}^2, \\; \\Delta y = -10 \\text{ m (downward = negative)} \\Rightarrow t \\approx 1.43 \\text{ s} \\checkmark`,
          annotation: "Different signs, same answer. Physics is convention-independent.",
        },
      ],
      conclusion:
        "Fall time $\\approx 1.43$ s. With down = positive: $a = +9.8$, $\\Delta y = +10$ (both positive). With up = positive: $a = -9.8$, $\\Delta y = -10$ (both negative). Same $t$ either way — the choice of positive direction doesn't affect the magnitude of the answer.",
    },
    {
      id: 'p1-ch2-010-ch2',
      difficulty: 'hard',
      problem: `A ball is thrown upward at $v_0 = 15$ m/s from a 30-m-tall building (up = positive, $g = 9.8$ m/s²). Find (a) the time to reach the peak, (b) the maximum height above the ground, (c) the time for the ball to hit the ground, and (d) the speed at impact.`,
      hint: "Set y = 0 at the top of the building. The ball hits the ground at $\\Delta y = -30$ m. For part (c), solve the quadratic $0 = 15t - 4.9t^2 - 30$.",
      walkthrough: [
        {
          step: "Set up coordinates: $y_0 = 0$ at building top, up = positive.",
          expression: `v_0 = +15 \\text{ m/s}, \\; a = -9.8 \\text{ m/s}^2, \\; \\text{Ground at } y = -30 \\text{ m}`,
          annotation: "The building top is the origin. The ground is 30 m below = negative.",
        },
        {
          step: "(a) Time to peak: v = 0.",
          expression: `t_{\\text{peak}} = \\frac{0 - 15}{-9.8} \\approx 1.53 \\text{ s}`,
          annotation: "Eq 1 with $v = 0$.",
        },
        {
          step: "(b) Peak height above ground.",
          expression: `\\Delta y = 15(1.53) + \\tfrac{1}{2}(-9.8)(1.53)^2 \\approx 22.96 - 11.48 = 11.48 \\text{ m above the building top}`,
          annotation: "Peak is 11.48 m above building top = $11.48 + 30 = 41.48$ m above ground.",
        },
        {
          step: "(c) Time to ground: $\\Delta y = -30$ m.",
          expression: `-30 = 15t - 4.9t^2 \\Rightarrow 4.9t^2 - 15t - 30 = 0`,
          annotation: "Rearrange to standard quadratic form.",
        },
        {
          step: "Solve the quadratic.",
          expression: `t = \\frac{15 \\pm \\sqrt{225 + 4(4.9)(30)}}{2(4.9)} = \\frac{15 \\pm \\sqrt{225 + 588}}{9.8} = \\frac{15 \\pm 28.5}{9.8}`,
          annotation: "Take the positive root: $t = (15 + 28.5)/9.8 \\approx 4.44$ s.",
        },
        {
          step: "(d) Speed at impact.",
          expression: `v = 15 + (-9.8)(4.44) \\approx 15 - 43.5 = -28.5 \\text{ m/s}`,
          annotation: "Negative sign = downward direction (correct for impact). Speed = $|v| = 28.5$ m/s.",
        },
      ],
      conclusion:
        "Peak time: 1.53 s. Max height: 41.48 m above ground. Impact time: 4.44 s. Impact speed: 28.5 m/s. The negative sign on the final velocity correctly indicates downward motion — exactly what you'd expect for a ball hitting the ground.",
    },
    {
      id: 'p1-ch2-010-ch3',
      difficulty: 'hard',
      problem: `A train decelerates from 30 m/s at $a = -1.5$ m/s² for 8 s, then continues at constant velocity for 20 s, then decelerates at $a = -2$ m/s² to a stop. Find (a) the speed after phase 1, (b) the distance covered in each phase, and (c) the total distance.`,
      hint: "Phase 1: constant deceleration for 8 s. Phase 2: constant v (a = 0). Phase 3: decelerate to v = 0.",
      walkthrough: [
        {
          step: "Phase 1: decelerate for 8 s.",
          expression: `v_1 = 30 + (-1.5)(8) = 30 - 12 = 18 \\text{ m/s}`,
          annotation: "Eq 1. Speed drops from 30 to 18 m/s.",
        },
        {
          step: "Phase 1 distance.",
          expression: `\\Delta x_1 = 30(8) + \\tfrac{1}{2}(-1.5)(64) = 240 - 48 = 192 \\text{ m}`,
          annotation: "Eq 3.",
        },
        {
          step: "Phase 2: constant velocity ($a = 0$) for 20 s.",
          expression: `\\Delta x_2 = v_1 \\cdot t_2 = 18 \\times 20 = 360 \\text{ m}`,
          annotation: "Eq 1 with $a = 0$: $v$ stays at 18 m/s throughout.",
        },
        {
          step: "Phase 3: decelerate from 18 m/s to rest.",
          expression: `\\Delta x_3 = \\frac{0^2 - 18^2}{2(-2)} = \\frac{-324}{-4} = 81 \\text{ m}`,
          annotation: "Eq 5 (no $t$ needed): gives braking distance directly.",
        },
        {
          step: "Total distance.",
          expression: `\\Delta x_{\\text{total}} = 192 + 360 + 81 = 633 \\text{ m}`,
          annotation: "Sum all three phases. All displacements are positive (forward throughout).",
        },
      ],
      conclusion:
        "Phase 1 exit speed: 18 m/s. Phase distances: 192 m, 360 m, 81 m. Total: 633 m. Multi-phase problems reduce to repeated single-phase SUVAT applications, chaining phase outputs into phase inputs.",
    },
  ],

  checkpoints: [
    {
      id: 'p1-ch2-010-cp1',
      question: `A car decelerates from 25 m/s to 10 m/s over 6 s. What is the acceleration? List the sign explicitly (forward = positive).`,
      answer: `$a = (v - v_0)/t = (10 - 25)/6 = -15/6 = -2.5$ m/s². Negative because the car is slowing — the acceleration opposes the forward (positive) direction.`,
    },
    {
      id: 'p1-ch2-010-cp2',
      question: `A ball is thrown downward at 5 m/s (down = positive). What are the signs of $v_0$ and $a$ (due to gravity)?`,
      answer: `$v_0 = +5$ m/s (thrown downward, which is the positive direction). $a = +9.8$ m/s² (gravity also acts downward = positive direction). Both are positive when down is positive — the ball accelerates in the same direction it's thrown.`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Braking car — sign discipline with cross-check',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Step 1: declare and label all signs
v0 =  18.0   # m/s  (forward = +)
a  =  -3.0   # m/s² (braking = opposes forward = -)
v  =   0.0   # m/s  (stopped)

# Step 2: equations
t  = (v - v0) / a
dx = v0*t + 0.5*a*t**2
print(f"Stop time        : {t:.2f} s")
print(f"Stopping distance: {dx:.2f} m  (positive = forward ✓)")

# Step 3: cross-check with Eq 5
check = v**2 - (v0**2 + 2*a*dx)
print(f"Cross-check (Eq 5, should = 0): {check:.4f} ✓")

# Plot v(t)
t_arr = np.linspace(0, t, 100)
v_arr = v0 + a*t_arr
fig, ax = plt.subplots(figsize=(7, 4))
ax.fill_between(t_arr, v_arr, alpha=0.25, color='steelblue',
                label=f'Area = Δx = {dx:.0f} m')
ax.plot(t_arr, v_arr, lw=2, color='steelblue', label=f'v(t) = {v0} + ({a})t')
ax.axhline(0, color='k', lw=0.8)
ax.set_xlabel('Time (s)'); ax.set_ylabel('v (m/s)')
ax.set_title('Braking car — v–t graph')
ax.legend(); ax.grid(True, alpha=0.4)
plt.tight_layout()
plt.savefig('braking_car_signs.png', dpi=100, bbox_inches='tight')
plt.show()`,
          prose: [
            `Every variable is labeled with a sign comment: \`v0 = +18\` (forward), \`a = -3\` (opposing forward). This is the programmatic version of the sign-discipline checklist: before any equation, every quantity has an explicit sign assigned based on the chosen positive direction.`,
            `The cross-check \`v**2 - (v0**2 + 2*a*dx)\` evaluates Eq 5 with all computed values substituted. If the sign discipline was consistent throughout, this evaluates to exactly zero. A nonzero result (besides floating-point noise) means a sign error somewhere in the calculation.`,
            `The shaded area under the v–t graph equals the stopping distance — visualizing the area-under-curve connection from Lesson ch2-009. The triangle area $\\tfrac{1}{2} \\times 6 \\times 18 = 54$ m matches the SUVAT result, confirming consistency between the geometric and algebraic approaches.`,
          ],
        },
        {
          cellTitle: 'Sign convention comparison — same physics, two conventions',
          type: 'code',
          language: 'python',
          code: `print("Sign convention comparison — braking car")
print(f"{'Quantity':<12} {'Forward=+ (A)':>16} {'Forward=- (B)':>16}")
print("-" * 46)

# Convention A: forward = positive (standard)
v0_A, a_A, v_A = 18.0, -3.0, 0.0
t_A  = (v_A - v0_A) / a_A
dx_A = v0_A*t_A + 0.5*a_A*t_A**2

# Convention B: forward = negative (unusual but valid)
v0_B, a_B, v_B = -18.0, 3.0, 0.0
t_B  = (v_B - v0_B) / a_B
dx_B = v0_B*t_B + 0.5*a_B*t_B**2

for name, A, B in [("v₀", v0_A, v0_B), ("a", a_A, a_B), ("v", v_A, v_B),
                   ("t", t_A, t_B), ("Δx", dx_A, dx_B)]:
    print(f"{name:<12} {A:>16.2f} {B:>16.2f}")

print(f"\\n|Δx| same? {abs(dx_A):.2f} m == {abs(dx_B):.2f} m  "
      f"{'✓' if abs(abs(dx_A) - abs(dx_B)) < 0.001 else '✗'}")`,
          prose: [
            `Convention A uses the standard "forward = positive" assignment: $v_0 = +18$, $a = -3$, and the result $\\Delta x = +54$ (forward). Convention B uses the unusual "forward = negative" assignment: $v_0 = -18$, $a = +3$, and the result $\\Delta x = -54$ (still forward, but now negative). Different signs, but the same physical magnitude.`,
            `The \`abs(abs(dx_A) - abs(dx_B)) < 0.001\` check confirms that $|\\Delta x|$ is identical under both conventions. This proves the core principle: sign conventions don't affect the physics — only the signs of intermediate variables. The stopping distance is always 54 m regardless of your sign choice.`,
            `Notice that $t$ is positive under both conventions ($t_A = t_B = 6$ s). Time is a scalar, not a vector — it does not change sign under a coordinate flip. If $t$ had come out negative under either convention, that would signal a setup error, not just a sign choice.`,
          ],
        },
        {
          cellTitle: 'Ball thrown from building — full multi-step solution',
          type: 'code',
          language: 'python',
          code: `import numpy as np

v0 = 15.0    # m/s upward  → positive
a  = -9.8    # m/s² downward → negative
y0 = 0.0     # origin at building top

# (a) Time to peak: v = 0
t_peak = -v0 / a
print(f"(a) Time to peak  : {t_peak:.3f} s")

# (b) Peak height above building top + above ground
y_peak = v0*t_peak + 0.5*a*t_peak**2
print(f"(b) Peak above building top : {y_peak:.2f} m")
print(f"    Peak above ground       : {y_peak + 30:.2f} m  (building height = 30 m)")

# (c) Time to ground: y = -30 m (30 m below building top)
# 0.5*a*t² + v0*t + 30 = 0  (rearranged so y = -30 gives 0)
coeffs = [0.5*a, v0, 30.0]
roots  = np.roots(coeffs)
t_land = roots[roots > 0].max()   # take the physically meaningful root
print(f"(c) Time to ground: {t_land:.3f} s")

# (d) Speed at impact
v_impact = v0 + a*t_land
print(f"(d) Impact velocity: {v_impact:.2f} m/s  (negative = downward ✓)")
print(f"    Impact speed   : {abs(v_impact):.2f} m/s")`,
          prose: [
            `\`t_peak = -v0 / a = -15 / (-9.8) ≈ 1.53 s\` comes from Eq 1 with $v = 0$: rearranged to $t = -v_0 / a$. The negative of a negative divided by a negative gives a positive — correctly indicating the peak occurs in the future.`,
            `\`np.roots(coeffs)\` solves the quadratic $4.9t^2 - 15t - 30 = 0$ (from $\\Delta y = -30$). It returns two roots — one positive (the landing time) and one negative (a mathematical solution corresponding to a time before launch). \`roots[roots > 0].max()\` selects the physically meaningful positive root.`,
            `The impact velocity \`v_impact ≈ -28.5 m/s\` is negative (downward), consistent with the "up = positive" convention. Reporting \`abs(v_impact)\` gives the speed at impact. This sign convention consistency — negative velocity for downward motion — is exactly what the discipline requires.`,
          ],
        },
        {
          cellTitle: 'Challenge: two-phase car (accelerate then brake)',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `# Two-phase car: from rest, accelerate at 4 m/s² for 5 s,
# then brake at -8 m/s² to a stop.
# Forward = positive throughout.

a1 = 4.0    # m/s² (phase 1)
t1 = 5.0    # s    (phase 1 duration)
a2 = -8.0   # m/s² (phase 2)

# TODO:
# Phase 1: find v1 (exit velocity) and dx1 (phase 1 distance)
# Phase 2: v0_2 = v1, final v = 0; find dx2 (braking distance)
# Print total distance = dx1 + dx2
# Cross-check: verify v2² = v1² + 2*a2*dx2 ≈ 0
`,
          prose: [
            `Phase 1 uses Eq 1 and 3: \`v1 = 0 + a1*t1\` and \`dx1 = 0 + 0.5*a1*t1**2\`. Phase 2 uses Eq 5: \`dx2 = (0**2 - v1**2) / (2*a2)\`. Note: with \`a2 = -8\`, the denominator is negative, and \`-v1**2\` is negative, so \`dx2\` is positive — forward displacement during braking.`,
            `The cross-check for phase 2: \`v2**2 - (v1**2 + 2*a2*dx2)\` should equal zero. Substitute your computed \`dx2\` and verify. If the braking distance is correct, Eq 5 is satisfied exactly.`,
            `Expected answers: $v_1 = 20$ m/s, $\\Delta x_1 = 50$ m, $\\Delta x_2 = 25$ m, total = 75 m. The braking phase is shorter (25 m) than the acceleration phase (50 m) despite starting from the same speed, because the braking rate ($|a_2| = 8$ m/s²) is twice the acceleration rate ($a_1 = 4$ m/s²).`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Braking car — sign discipline with cross-check',
          type: 'code',
          language: 'matlab',
          code: `% Sign labels: forward = positive
v0 =  18.0;   % m/s  (forward = +)
a_br = -3.0;  % m/s² (braking = -)
v  =   0.0;   % m/s  (stopped)

% Solve
t  = (v - v0) / a_br;
dx = v0*t + 0.5*a_br*t^2;
fprintf('Stop time        : %.2f s\\n', t);
fprintf('Stopping distance: %.2f m (positive = forward ✓)\\n', dx);

% Cross-check with Eq 5
check = v^2 - (v0^2 + 2*a_br*dx);
fprintf('Cross-check (should = 0): %.4f ✓\\n', check);

% Plot
t_arr = linspace(0, t, 100);
v_arr = v0 + a_br*t_arr;
figure;
area(t_arr, v_arr, 'FaceColor', 'steelblue', 'FaceAlpha', 0.25, ...
    'DisplayName', sprintf('Area = Δx = %.0f m', dx));
hold on; plot(t_arr, v_arr, 'b-', 'LineWidth', 2);
yline(0, 'k'); xlabel('t (s)'); ylabel('v (m/s)');
title('Braking car — v–t graph'); legend; grid on;`,
          prose: [
            `Variable names with explicit sign comments (\`% forward = +\`, \`% braking = -\`) are the MATLAB equivalent of the sign-discipline checklist. This is not cosmetic — it forces the programmer to state the convention before writing the formula, preventing "oops I forgot the sign" errors.`,
            `\`a_br\` is used instead of the one-letter \`a\` because MATLAB has no built-in conflict for \`a\`, but using descriptive names (\`a_br\` = "braking acceleration") makes the code self-documenting. When solving multi-phase problems, descriptive names prevent accidentally reusing a phase-1 variable in phase 2.`,
            `\`area(t_arr, v_arr, ...)\` creates a filled area plot — the MATLAB version of \`fill_between\`. The shaded region visually represents the stopping distance as an area under the v–t graph, connecting the algebraic SUVAT result to the integration interpretation from Lesson ch2-009.`,
          ],
        },
        {
          cellTitle: 'Sign convention comparison',
          type: 'code',
          language: 'matlab',
          code: `fprintf('%-12s | %-16s | %-16s\\n', 'Quantity', 'Forward=+ (A)', 'Forward=- (B)');
fprintf('%s\\n', repmat('-', 1, 48));

% Convention A: forward = positive
v0_A =  18.0; a_A = -3.0; v_A = 0.0;
t_A  = (v_A - v0_A) / a_A;
dx_A = v0_A*t_A + 0.5*a_A*t_A^2;

% Convention B: forward = negative (unusual but valid)
v0_B = -18.0; a_B = 3.0; v_B = 0.0;
t_B  = (v_B - v0_B) / a_B;
dx_B = v0_B*t_B + 0.5*a_B*t_B^2;

names = {'v0', 'a', 'v', 't', 'dx'};
A_vals = [v0_A, a_A, v_A, t_A, dx_A];
B_vals = [v0_B, a_B, v_B, t_B, dx_B];
for k = 1:5
    fprintf('%-12s | %16.2f | %16.2f\\n', names{k}, A_vals(k), B_vals(k));
end
fprintf('\\n|dx| same? %.2f == %.2f  ');
if abs(abs(dx_A) - abs(dx_B)) < 0.001
    fprintf('✓\\n');
else
    fprintf('✗\\n');
end`,
          prose: [
            `The two conventions (A: forward = positive, B: forward = negative) produce the same $|t|$ and $|\\Delta x|$ but opposite-signed intermediate values. This confirms that the magnitude of the answer is physical — it doesn't depend on the coordinate convention — while the sign of each quantity does.`,
            `A cell array \`names = {'v0', 'a', ...}\` stores the quantity labels as strings in MATLAB. Paired arrays \`A_vals\` and \`B_vals\` hold the numerical values. Iterating with a \`for\` loop over index \`k\` prints each row of the comparison table.`,
            `The \`if/else\` block for the cross-check uses \`abs(abs(dx_A) - abs(dx_B)) < 0.001\` to handle floating-point comparison robustly. Direct \`== 0\` comparison between floats would fail due to rounding — always use a small tolerance when checking floating-point equality.`,
          ],
        },
        {
          cellTitle: 'Ball thrown from building — full multi-step',
          type: 'code',
          language: 'matlab',
          code: `v0   = 15.0;    % m/s upward → positive
a_g  = -9.8;    % m/s² downward → negative
bldg = 30.0;    % m (building height above ground)

% (a) Time to peak
t_peak = -v0 / a_g;
fprintf('(a) Time to peak  : %.3f s\\n', t_peak);

% (b) Peak height
y_peak = v0*t_peak + 0.5*a_g*t_peak^2;
fprintf('(b) Peak above top  : %.2f m\\n', y_peak);
fprintf('    Peak above ground: %.2f m\\n', y_peak + bldg);

% (c) Time to ground: 0 = v0*t + 0.5*a_g*t^2 - bldg
% → 0.5*a_g*t^2 + v0*t + bldg = 0
coeffs = [0.5*a_g, v0, bldg];
roots_t = roots(coeffs);
t_land  = max(roots_t(roots_t > 0));
fprintf('(c) Time to ground: %.3f s\\n', t_land);

% (d) Speed at impact
v_impact = v0 + a_g*t_land;
fprintf('(d) Impact velocity: %.2f m/s (negative = downward ✓)\\n', v_impact);
fprintf('    Impact speed   : %.2f m/s\\n', abs(v_impact));`,
          prose: [
            `\`t_peak = -v0 / a_g\` computes the time when $v = 0$ from Eq 1 rearranged. The double negative ($-v_0 / a_g = -15 / -9.8$) gives a positive result — the peak is in the future, as expected.`,
            `\`roots([0.5*a_g, v0, bldg])\` calls MATLAB's polynomial root finder on the quadratic $0.5 a_g t^2 + v_0 t + h = 0$ (where $h = 30$ m is the building height, representing the condition $y = -30$ m from the building top). The two roots are the landing time and the meaningless negative time. \`max(roots_t(roots_t > 0))\` selects the positive root.`,
            `The impact velocity \`v_impact ≈ -28.5\` m/s is negative (downward), consistent with "up = positive." Reporting \`abs(v_impact)\` gives the impact speed. Always report speed (magnitude) when the problem asks "how fast," and velocity (with sign) when the problem asks "what is the velocity."`,
          ],
        },
        {
          cellTitle: 'Challenge: two-phase car',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% Two-phase car: from rest, accelerate at 4 m/s² for 5 s,
% then brake at -8 m/s² to a stop. Forward = positive.
a1 = 4.0;    % m/s² (phase 1)
t1 = 5.0;    % s    (duration of phase 1)
a2 = -8.0;   % m/s² (phase 2)

% TODO:
% Phase 1: find v1 = exit velocity, dx1 = phase 1 distance (Eq 1, 3)
% Phase 2: v0_2 = v1, final v = 0; find dx2 (Eq 5)
% Print: v1, dx1, dx2, total = dx1 + dx2
% Cross-check: v_final^2 = v1^2 + 2*a2*dx2  (should ≈ 0)
`,
          prose: [
            `Phase 1: \`v1 = 0 + a1*t1\` and \`dx1 = 0 + 0.5*a1*t1^2\`. Phase 2: \`dx2 = (0^2 - v1^2) / (2*a2)\`. With \`a2 = -8\`, the denominator is negative and \`-v1^2\` is negative, so \`dx2 > 0\` — correct forward displacement during braking.`,
            `Cross-check: \`v_final^2 - (v1^2 + 2*a2*dx2)\` should equal zero (within floating-point tolerance). Use \`abs(check) < 1e-8\` for the verification. If the check fails, re-examine whether you used the correct $a$ and whether you set $v_{\\text{final}} = 0$ correctly.`,
            `Expected results: $v_1 = 20$ m/s, $\\Delta x_1 = 50$ m, $\\Delta x_2 = 25$ m, total = 75 m. The braking is twice as fast ($|a_2| = 8$ vs $a_1 = 4$), so the braking distance is half the acceleration distance for the same speed change.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch2-010-q1',
      type: 'choice',
      question: `A car has $v_0 = 18$ m/s and $a = -3$ m/s² (forward = positive). What is the stop time?`,
      options: [`3 s`, `6 s`, `9 s`, `12 s`],
      answer: `6 s`,
      hints: [
        `Use $t = (v - v_0)/a$ with $v = 0$.`,
        `$(0 - 18)/(-3) = ?$`,
      ],
      reviewSection: 'examples',
      explanation: `$t = (v - v_0)/a = (0 - 18)/(-3) = 6$ s.`,
    },
    {
      id: 'p1-ch2-010-q2',
      type: 'choice',
      question: `For the same braking car ($v_0 = 18$ m/s, $a = -3$ m/s², $t = 6$ s), what is the stopping distance?`,
      options: [`27 m`, `54 m`, `108 m`, `36 m`],
      answer: `54 m`,
      hints: [
        `Use $\\Delta x = v_0 t + \\tfrac{1}{2}at^2$.`,
        `$18(6) + \\tfrac{1}{2}(-3)(36) = 108 - 54$.`,
      ],
      reviewSection: 'examples',
      explanation: `$\\Delta x = 18(6) + \\tfrac{1}{2}(-3)(36) = 108 - 54 = 54$ m.`,
    },
    {
      id: 'p1-ch2-010-q3',
      type: 'choice',
      question: `You choose forward as positive. A car decelerating to a stop will have:`,
      options: [
        `$v_0 > 0$, $a > 0$, $\\Delta x > 0$`,
        `$v_0 > 0$, $a < 0$, $\\Delta x > 0$`,
        `$v_0 < 0$, $a < 0$, $\\Delta x < 0$`,
        `$v_0 > 0$, $a < 0$, $\\Delta x < 0$`,
      ],
      answer: `$v_0 > 0$, $a < 0$, $\\Delta x > 0$`,
      hints: [
        `$v_0 > 0$: the car is moving forward. $a$: which direction does braking push the car?`,
        `$\\Delta x$: the car moves forward before stopping, so displacement is still forward.`,
      ],
      reviewSection: 'intuition',
      explanation: `Forward motion → $v_0 > 0$. Braking opposes forward motion → $a < 0$. Net displacement is forward (car didn't reverse) → $\\Delta x > 0$.`,
    },
    {
      id: 'p1-ch2-010-q4',
      type: 'choice',
      question: `Which cross-check best confirms a SUVAT answer is self-consistent?`,
      options: [
        `Substitute computed $\\Delta x$ into $v^2 = v_0^2 + 2a\\Delta x$ and verify it returns the correct $v$`,
        `The answer is a round number`,
        `$a > 0$`,
        `$t < 10$ s`,
      ],
      answer: `Substitute computed $\\Delta x$ into $v^2 = v_0^2 + 2a\\Delta x$ and verify it returns the correct $v$`,
      hints: [
        `Using a different equation from the one you solved with gives an independent check.`,
        `If two different equations both hold, all five quantities are mutually consistent.`,
      ],
      reviewSection: 'examples',
      explanation: `Substituting the computed $\\Delta x$ into a second equation checks that all five values satisfy both equations simultaneously — an algebraically independent verification.`,
    },
    {
      id: 'p1-ch2-010-q5',
      type: 'choice',
      question: `A student uses "up = positive" and writes $a = +9.8$ m/s² for free fall. What is wrong?`,
      options: [
        `Nothing — both signs for $g$ are valid`,
        `With up = positive, gravity acts downward so $a = -9.8$ m/s²`,
        `The magnitude of $g$ is wrong`,
        `$g$ should be zero in free fall`,
      ],
      answer: `With up = positive, gravity acts downward so $a = -9.8$ m/s²`,
      hints: [
        `With up = positive, which direction does gravity point? Is that positive or negative?`,
        `Gravity pulls downward. Downward is the negative direction when up = positive.`,
      ],
      reviewSection: 'intuition',
      explanation: `When up = positive, downward = negative. Gravity acts downward, so $a = -g = -9.8$ m/s². Using $+9.8$ with "up = positive" would imply gravity accelerates objects upward.`,
    },
    {
      id: 'p1-ch2-010-q6',
      type: 'choice',
      question: `A problem gives $v_0$, $a$, and $\\Delta x$. Which SUVAT equation avoids needing $t$?`,
      options: [
        `$v = v_0 + at$`,
        `$\\Delta x = v_0 t + \\tfrac{1}{2}at^2$`,
        `$v^2 = v_0^2 + 2a\\Delta x$`,
        `$\\Delta x = \\tfrac{1}{2}(v_0+v)t$`,
      ],
      answer: `$v^2 = v_0^2 + 2a\\Delta x$`,
      hints: [
        `The "missing" variable here is $t$ (not needed). Which equation excludes $t$?`,
        `Eq 5 contains $v$, $v_0$, $a$, and $\\Delta x$ — and nothing else.`,
      ],
      reviewSection: 'math',
      explanation: `$v^2 = v_0^2 + 2a\\Delta x$ (Eq 5) excludes $t$. With $v_0$, $a$, $\\Delta x$ known, solve for $v$.`,
    },
    {
      id: 'p1-ch2-010-q7',
      type: 'choice',
      question: `After solving, $t = -4$ s. The most likely cause is:`,
      options: [
        `The object moved backwards`,
        `A sign error in $v_0$, $a$, or the setup`,
        `$g$ should be in cm/s²`,
        `The quadratic has no real roots`,
      ],
      answer: `A sign error in $v_0$, $a$, or the setup`,
      hints: [
        `Physical time in forward-running problems is positive. When is $t < 0$ physically meaningful?`,
        `A sign inconsistency in the givens almost always produces a negative time.`,
      ],
      reviewSection: 'intuition',
      explanation: `Negative time almost always signals a sign inconsistency in the given quantities. Check whether $v_0$, $a$, and $\\Delta x$ carry signs consistent with the chosen positive direction.`,
    },
    {
      id: 'p1-ch2-010-q8',
      type: 'choice',
      question: `A car brakes from 30 m/s to rest with $a = -6$ m/s². What is the stopping distance?`,
      options: [`45 m`, `75 m`, `90 m`, `150 m`],
      answer: `75 m`,
      hints: [
        `Missing variable: $t$. Use Eq 5: $v^2 = v_0^2 + 2a\\Delta x$.`,
        `$0 = 900 + 2(-6)\\Delta x$. Solve for $\\Delta x$.`,
      ],
      reviewSection: 'examples',
      explanation: `$0 = 900 + 2(-6)\\Delta x \\Rightarrow \\Delta x = 900/12 = 75$ m.`,
    },
    {
      id: 'p1-ch2-010-q9',
      type: 'choice',
      question: `A ball is thrown upward at 20 m/s (up = positive, $g = 9.8$ m/s²). What is the peak height?`,
      options: [`10.2 m`, `15.6 m`, `20.4 m`, `25.0 m`],
      answer: `20.4 m`,
      hints: [
        `At the peak, $v = 0$. Find $t_{\\text{peak}}$ from Eq 1, then use Eq 3 for height.`,
        `$t_{\\text{peak}} = 20/9.8 \\approx 2.04$ s. Then $\\Delta y = 20(2.04) - 4.9(2.04)^2$.`,
      ],
      reviewSection: 'examples',
      explanation: `$t_{\\text{peak}} = 20/9.8 \\approx 2.04$ s. $\\Delta y = 20(2.04) + \\tfrac{1}{2}(-9.8)(2.04)^2 = 40.8 - 20.4 = 20.4$ m.`,
    },
    {
      id: 'p1-ch2-010-q10',
      type: 'choice',
      question: `In a two-phase problem (accelerate then brake), what must you reset at the start of phase 2?`,
      options: [
        `The positive direction`,
        `The initial velocity and position (using phase 1 end values)`,
        `The value of $g$`,
        `The time to start from zero again`,
      ],
      answer: `The initial velocity and position (using phase 1 end values)`,
      hints: [
        `Each phase is a fresh SUVAT calculation. What are the "given" quantities at the start of phase 2?`,
        `The positive direction stays the same throughout. What changes?`,
      ],
      reviewSection: 'math',
      explanation: `The positive direction is fixed throughout. At the phase 2 start, $v_{0,2}$ = final velocity of phase 1, and $x_{0,2}$ = final position of phase 1. The acceleration $a_2$ is new (given for phase 2). This chaining is the key technique for multi-phase problems.`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch2-010-m1',
      misconception: `"Deceleration always means negative acceleration."`,
      correction: `Deceleration means the object is slowing down. Whether the acceleration is positive or negative depends entirely on the sign convention and the direction of motion. If an object moves in the negative direction and slows down, its acceleration is positive (opposing the negative velocity). The sign of $a$ encodes its direction, not whether the object is speeding up or slowing down.`,
      correctionExample: `Ball falling downward (down = negative): $v < 0$ (downward), $a = -9.8$ m/s² (gravity also negative). Object is speeding up (both $v$ and $a$ are negative), not decelerating. Deceleration would require $a = +9.8$ m/s² with down = negative — which would mean an upward force.`,
    },
    {
      id: 'p1-ch2-010-m2',
      misconception: `"In multi-phase problems, the second phase starts at $t = 0$ and $x = 0$."`,
      correction: `The second phase starts with the initial conditions inherited from the end of phase 1. The time may be reset to $t' = 0$ for the phase 2 calculation (just measuring time from the start of phase 2), but the position $x_{0,2}$ is the final position from phase 1, not zero. Forgetting this leads to position errors when computing total displacement.`,
      correctionExample: `Car accelerates for 5 s, then brakes. After phase 1: $v_1 = 20$ m/s, $x_1 = 50$ m. Phase 2 starts with $v_{0,2} = 20$ m/s, $x_{0,2} = 50$ m (not 0). If you set $x_{0,2} = 0$, your total distance ($\\Delta x_1 + \\Delta x_2 = 50 + 25 = 75$ m) is still correct, but the absolute position of the stop point would be wrong.`,
    },
  ],

  transferPrompts: [
    `A rocket has a two-phase burn: Phase 1 lasts 30 s with $a_1 = 20$ m/s² (starting from rest). Phase 2 lasts 60 s with $a_2 = 10$ m/s² (continuing from phase 1 exit). Find the final speed, the total distance traveled, and the time to reach 1000 m/s (assuming the same two-phase acceleration profile repeats).`,
    `In economics, "price acceleration" is the rate of change of the rate of change of prices ($\\ddot{P}$). A central bank may reduce the inflation rate (making $\\dot{P}$ smaller) but keep prices rising ($P$ still increasing). Translate: this is like a decelerating car — $v > 0$ but $a < 0$. What would "price velocity reversal" mean? What sign convention would you choose for "up = positive prices"?`,
  ],

  debugging: [
    {
      id: 'p1-ch2-010-d1',
      buggyWork: `Student writes: "Ball thrown upward at 15 m/s. $v_0 = 15$, $a = +9.8$ (up = positive, gravity = $+g$). Peak time: $t = -15/9.8 = -1.53$ s."`,
      question: `What is the sign error? What is the correct answer?`,
      answer: `With up = positive, gravity acts downward = negative direction. So $a = -9.8$ m/s², not $+9.8$. The correct peak time: $v = v_0 + at = 0 \\Rightarrow t = -v_0/a = -15/(-9.8) = +1.53$ s. The student used a sign for $a$ that points upward — meaning they assumed gravity accelerates objects upward, which is physically wrong.`,
    },
    {
      id: 'p1-ch2-010-d2',
      buggyWork: `In a two-phase problem (phase 1: accelerate at 3 m/s² for 10 s from rest; phase 2: brake at $-2$ m/s²), a student sets phase 2 initial velocity = 0 and gets $\\Delta x_2 = 0$, then says total distance = $\\Delta x_1 = 150$ m.`,
      question: `What went wrong in phase 2?`,
      answer: `The student reset $v_{0,2} = 0$ at the start of phase 2, ignoring that the car is still moving at the end of phase 1. Correct phase 2 initial velocity: $v_{0,2} = v_1 = 0 + 3(10) = 30$ m/s. Then $\\Delta x_2 = (0^2 - 30^2)/(2(-2)) = -900/(-4) = 225$ m. Total distance = $150 + 225 = 375$ m. Always chain phase outputs to phase inputs.`,
    },
  ],

  mastery: {
    targetLevel: `Solve any multi-phase SUVAT problem with correct sign discipline: assign signs from a declared positive direction, chain phase outputs to phase inputs, and cross-check each result.`,
    coreSkill: `Sign-discipline protocol: declare positive direction → assign signs to all givens → solve → verify sign of result → cross-check with a different equation. Applied to multi-phase problems by chaining phase boundaries.`,
    commonSticking: `The two most common errors: (1) using $+g$ with "up = positive" (should be $-g$); (2) resetting $v_0 = 0$ at the start of a subsequent phase rather than using the exit velocity from the previous phase.`,
    connections: `Multi-phase SUVAT is the foundation for projectile motion (Ch3, horizontal + vertical phases), rocket burn calculations, and any control system where the plant switches modes. Sign discipline generalizes to all of physics where vector signs encode direction.`,
  },

  semantics: {
    core: [
      { symbol: `\\text{positive direction}`, meaning: `The declared reference direction: all vectors pointing this way are positive; all vectors opposing it are negative.` },
      { symbol: `a < 0`, meaning: `Acceleration in the negative direction — could be braking (opposing forward motion) or gravity (if up = positive).` },
      { symbol: `t > 0`, meaning: `Time is positive in forward-running problems. Negative $t$ almost always indicates a sign error in the setup.` },
      { symbol: `v_{0,2} = v_1`, meaning: `Phase chaining: the initial velocity of phase 2 equals the final velocity of phase 1.` },
      { symbol: `\\Delta x_{\\text{total}}`, meaning: `Sum of displacements from all phases, each computed with the same positive direction.` },
    ],
    rulesOfThumb: [
      `Declare the positive direction before writing any numbers — never mid-calculation.`,
      `With up = positive: $a = -g = -9.8$ m/s². With down = positive: $a = +g = +9.8$ m/s².`,
      `Negative $t$ almost always means a sign error — recheck, don't accept it.`,
      `In multi-phase problems, the final state of phase $k$ is the initial state of phase $k+1$.`,
      `Cross-check by substituting all computed values into a second SUVAT equation — both should hold.`,
    ],
  },
};

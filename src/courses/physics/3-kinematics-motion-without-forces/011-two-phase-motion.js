export default {
  id: 'p1-ch2-011',
  slug: 'two-phase-motion',
  chapter: 'p2',
  order: 11,
  title: "Two-Phase Motion Problems",
  subtitle: "Carry the final state of phase 1 into the initial state of phase 2.",
  tags: ["piecewise motion", "state handoff", "kinematics"],
  aliases: "two phase motion piecewise kinematics SUVAT multi-phase",
  hook: {
    question: "How do you solve motion where the acceleration changes mid-journey?",
    realWorldContext:
      "Vehicles have acceleration, cruise, and braking phases. Each phase obeys its own SUVAT equations, but the final speed and position of one phase must feed seamlessly into the next.",
    previewVisualizationId: 'SVGDiagram',
  },
  intuition: {
    prose: [
      `Before reading on, predict: a car starts from rest and accelerates at 3 m/s² for 6 seconds, then immediately applies the brakes at −2 m/s² until it stops. Sketch the v–t graph in your head. Where does velocity peak? What shape is the x–t curve? Write a rough answer before continuing.`,
      `Real motion is rarely a single constant-acceleration episode. A subway train accelerates away from one station, coasts on flat track, then decelerates into the next platform. A ball thrown upward has one phase going up (a = −9.8 m/s²) and another coming back down (same a, but the velocity direction has flipped). Each phase obeys the same four SUVAT equations — the challenge is connecting the phases correctly.`,
      `The connection rule is called state continuity: at the moment one phase ends and the next begins, the position and velocity must match from both sides. Mathematically, $x_{1,f} = x_{2,0}$ and $v_{1,f} = v_{2,0}$. There is no teleportation (position is continuous) and no impulse without force (velocity is continuous). Acceleration, however, can jump instantly — that is precisely what separates the phases.`,
      `The practical strategy is to restart the clock for each phase. Call the start of phase 2 its own $t = 0$. Then $v_2(t) = v_{0,2} + a_2 t$ with $v_{0,2}$ inherited from phase 1. This avoids messy time offsets and makes each phase look like a fresh constant-acceleration problem.`,
      `A common trap: students add displacements but forget to add the position where phase 1 ended. If phase 1 starts at $x = 50$ m, phase 2 must start at $x = 50 + \Delta x_1$, not at $x = 0$. Always track absolute position if the problem asks for a final location rather than just total displacement.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Five-step phase handoff procedure',
        body: `1. Identify all phases — wherever acceleration changes, draw a phase boundary.\n2. Solve phase 1 completely: find its final velocity $v_{1,f}$ and displacement $\\Delta x_1$.\n3. Hand off: set $v_{0,2} = v_{1,f}$ and (if needed) $x_{0,2} = x_{0,1} + \\Delta x_1$.\n4. Restart the local clock ($t = 0$ at the phase boundary) and solve phase 2.\n5. Add displacements (or track absolute positions) to answer the question.`,
      },
      {
        type: 'insight',
        title: 'What is continuous vs. what can jump',
        body: `Position $x$ and velocity $v$ are always continuous at a phase boundary — they cannot teleport or spike. Acceleration $a$ can (and usually does) change abruptly at the boundary. That discontinuity in $a$ is what defines the boundary in the first place.`,
      },
      {
        type: 'warning',
        title: 'Restart the clock for each phase',
        body: `Each phase has its own local time variable starting at $t = 0$. Do not use the global elapsed time in phase-2 equations — it will give wrong answers. The handoff gives you $v_{0,2}$ and $x_{0,2}$; treat everything else as a fresh problem.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-rectangle' },
        title: 'Each phase is its own SUVAT interval',
        caption: 'Two-phase problems are two separate constant-acceleration intervals joined at a single boundary. Solve each algebraically; the only bridge is the state handoff.',
      },
    ],
  },
  math: {
    prose: [
      `Treat each phase as an independent constant-acceleration model, solved with the standard SUVAT equations. The only constraint linking the phases is the state-continuity condition at the boundary.`,
      `For a two-phase problem on intervals $[0, T_1]$ and $[0, T_2]$ (local clocks), phase 1 yields $v_{1,f} = v_{0,1} + a_1 T_1$ and $\\Delta x_1 = v_{0,1} T_1 + \\tfrac{1}{2} a_1 T_1^2$. Phase 2 begins with $v_{0,2} = v_{1,f}$ and uses the same SUVAT family with $a_2$ and its own duration.`,
      `For three or more phases, repeat the handoff at each boundary. Total displacement is the scalar sum $\\Delta x_{\\text{total}} = \\Delta x_1 + \\Delta x_2 + \\cdots$. Total time is $T_{\\text{total}} = T_1 + T_2 + \\cdots$. No single equation spans multiple phases — that is the whole point of breaking the problem into phases.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Phase boundary conditions',
        body: `x_{1,f} = x_{2,0},\\qquad v_{1,f} = v_{2,0}`,
      },
      {
        type: 'insight',
        title: 'Which SUVAT equation to pick each phase',
        body: `List the five quantities $(v_0, v_f, a, t, \\Delta x)$ for the phase. Identify the one unknown and the one quantity not mentioned in the problem. Choose the SUVAT equation that does not contain the unneeded quantity.`,
      },
    ],
  },
  rigor: {
    prose: [
      `Formally, piecewise constant-acceleration motion is defined by a partition of the time axis $[0, T]$ into $n$ subintervals $[T_{k-1}, T_k]$ with $T_0 = 0$. On each subinterval, the acceleration $a_k$ is constant. The position and velocity functions are then $C^1$ on $(0, T)$ — continuously differentiable — even though the acceleration is only piecewise constant (i.e., it has jump discontinuities at the boundaries).`,
      `The invariant that makes the connection well-posed is the requirement that $x$ and $v$ are determined uniquely at each boundary by a single value, not a left-hand and right-hand limit. If both sides agree — which they must, because the ODE $\\ddot x = a$ has unique solutions given initial conditions — then the global trajectory is uniquely determined by specifying $(x_0, v_0)$ once at $t = 0$.`,
      `Geometrically, the x–t curve is a piecewise parabola (or line, when $a = 0$). At each phase boundary, the parabolic arcs share a common point (position continuity) and a common tangent slope (velocity continuity). The curvature, however, jumps — which is why the x–t graph develops a visible kink in its second-derivative character even though the first derivative (slope) is smooth.`,
      `In more advanced mechanics, this piecewise structure is replaced by integrating the equation of motion when $a(t)$ is a given continuous function. The result is the same handoff logic, but expressed as a single integral: $v(t) = v_0 + \\int_0^t a(\\tau)\\,d\\tau$. Two-phase motion is the special case where $a(\\tau)$ is a step function — making the integral piecewise linear and the position piecewise quadratic.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Piecewise SUVAT — state evolution',
        body: `v_k(t) = v_{0,k} + a_k t,\\quad x_k(t) = x_{0,k} + v_{0,k}t + \\tfrac{1}{2}a_k t^2,\\quad t \\in [0, T_k]`,
      },
    ],
  },
  examples: [
    {
      id: 'p1-ch2-011-ex1',
      title: 'Accelerate then brake — full walkthrough',
      problem: `A car starts from rest. Phase 1: accelerates at $a_1 = 2$ m/s² for $t_1 = 4$ s. Phase 2: decelerates at $a_2 = -1$ m/s² until it stops. Find total time and total displacement.`,
      steps: [
        {
          expression: `v_{1,f} = v_{0,1} + a_1 t_1 = 0 + 2(4) = 8\\text{ m/s}`,
          annotation: `Apply SUVAT equation 1 for phase 1. The car reaches 8 m/s at the boundary.`,
        },
        {
          expression: `\\Delta x_1 = v_{0,1} t_1 + \\tfrac{1}{2} a_1 t_1^2 = 0 + \\tfrac{1}{2}(2)(16) = 16\\text{ m}`,
          annotation: `Phase 1 displacement using SUVAT equation 2. The car has moved 16 m from the start.`,
        },
        {
          expression: `v_{0,2} = 8\\text{ m/s},\\quad a_2 = -1\\text{ m/s}^2,\\quad v_{2,f} = 0`,
          annotation: `Hand off: phase 2 starts at the phase-1 final state. Reset local clock to $t = 0$.`,
        },
        {
          expression: `t_2 = \\frac{v_{2,f} - v_{0,2}}{a_2} = \\frac{0 - 8}{-1} = 8\\text{ s}`,
          annotation: `Time for phase 2 to decelerate to rest.`,
        },
        {
          expression: `\\Delta x_2 = v_{0,2} t_2 + \\tfrac{1}{2} a_2 t_2^2 = 8(8) + \\tfrac{1}{2}(-1)(64) = 64 - 32 = 32\\text{ m}`,
          annotation: `Phase 2 displacement.`,
        },
        {
          expression: `T_{\\text{total}} = 4 + 8 = 12\\text{ s},\\quad \\Delta x_{\\text{total}} = 16 + 32 = 48\\text{ m}`,
          annotation: `Sum times and displacements. The five-step procedure yields the complete answer.`,
        },
      ],
      conclusion: `Total time is 12 s and total displacement is 48 m. The phase-2 deceleration lasts twice as long as the acceleration phase because the deceleration magnitude is only half as large.`,
    },
    {
      id: 'p1-ch2-011-ex2',
      title: 'Three-phase journey — accelerate, cruise, brake',
      problem: `A subway train starts from rest. Phase 1: accelerates at 1.5 m/s² for 8 s. Phase 2: cruises at constant velocity for 20 s. Phase 3: decelerates at −2 m/s² to a stop. Find total displacement and total time.`,
      steps: [
        {
          expression: `v_{1,f} = 0 + 1.5(8) = 12\\text{ m/s},\\quad \\Delta x_1 = 0 + \\tfrac{1}{2}(1.5)(64) = 48\\text{ m}`,
          annotation: `Phase 1 ends at 12 m/s and 48 m.`,
        },
        {
          expression: `v_{0,2} = 12\\text{ m/s},\\quad a_2 = 0,\\quad t_2 = 20\\text{ s}`,
          annotation: `Cruise phase: $a = 0$, so SUVAT gives $\\Delta x_2 = 12(20) = 240$ m.`,
        },
        {
          expression: `\\Delta x_2 = 12(20) = 240\\text{ m}`,
          annotation: `Cruise displacement.`,
        },
        {
          expression: `v_{0,3} = 12\\text{ m/s},\\quad a_3 = -2\\text{ m/s}^2,\\quad v_{3,f} = 0`,
          annotation: `Hand off phase-2 final state to phase 3.`,
        },
        {
          expression: `t_3 = \\frac{0 - 12}{-2} = 6\\text{ s},\\quad \\Delta x_3 = 12(6) + \\tfrac{1}{2}(-2)(36) = 72 - 36 = 36\\text{ m}`,
          annotation: `Phase 3 takes 6 s to stop and covers 36 m.`,
        },
        {
          expression: `T = 8 + 20 + 6 = 34\\text{ s},\\quad \\Delta x = 48 + 240 + 36 = 324\\text{ m}`,
          annotation: `Total trip: 34 s and 324 m.`,
        },
      ],
      conclusion: `The train travels 324 m in 34 s. The cruise phase dominates the distance budget (240 of 324 m) because it lasts far longer than the acceleration and braking phases.`,
    },
    {
      id: 'p1-ch2-011-ex3',
      title: 'Find an unknown phase duration given total distance',
      problem: `A car accelerates from rest at 4 m/s² for 5 s, then cruises at constant velocity. The total journey is 320 m. How long is the cruise phase?`,
      steps: [
        {
          expression: `v_{1,f} = 0 + 4(5) = 20\\text{ m/s}`,
          annotation: `Phase 1 final velocity — this becomes the cruise speed.`,
        },
        {
          expression: `\\Delta x_1 = \\tfrac{1}{2}(4)(25) = 50\\text{ m}`,
          annotation: `Displacement during acceleration phase.`,
        },
        {
          expression: `\\Delta x_{\\text{cruise}} = 320 - 50 = 270\\text{ m}`,
          annotation: `Remaining distance must be covered during the cruise phase.`,
        },
        {
          expression: `t_{\\text{cruise}} = \\frac{\\Delta x_{\\text{cruise}}}{v_{\\text{cruise}}} = \\frac{270}{20} = 13.5\\text{ s}`,
          annotation: `At constant speed, $\\Delta x = v t$, so solve for $t$.`,
        },
      ],
      conclusion: `The cruise phase lasts 13.5 s. This shows how to work backwards from a total-distance constraint to find an unknown phase duration.`,
    },
  ],
  challenges: [
    {
      id: 'p1-ch2-011-ch1',
      difficulty: 'medium',
      problem: `A motorcycle starts from rest, accelerates at 3 m/s² for 6 s, then decelerates at −2 m/s² to rest. Find (a) peak speed, (b) total displacement, (c) total time.`,
      hint: 'Solve phase 1 fully first, then hand off $v_{1,f}$ to phase 2 as its $v_{0,2}$.',
      walkthrough: [
        {
          expression: `v_{1,f} = 0 + 3(6) = 18\\text{ m/s}`,
          annotation: `Peak speed reached at the end of phase 1.`,
        },
        {
          expression: `\\Delta x_1 = \\tfrac{1}{2}(3)(36) = 54\\text{ m}`,
          annotation: `Phase 1 displacement.`,
        },
        {
          expression: `t_2 = \\frac{0 - 18}{-2} = 9\\text{ s}`,
          annotation: `Phase 2 duration to decelerate to rest.`,
        },
        {
          expression: `\\Delta x_2 = 18(9) + \\tfrac{1}{2}(-2)(81) = 162 - 81 = 81\\text{ m}`,
          annotation: `Phase 2 displacement.`,
        },
        {
          expression: `T = 6 + 9 = 15\\text{ s},\\quad \\Delta x = 54 + 81 = 135\\text{ m}`,
          annotation: `Total time 15 s, total displacement 135 m.`,
        },
      ],
    },
    {
      id: 'p1-ch2-011-ch2',
      difficulty: 'hard',
      problem: `A train starts at position $x_0 = 100$ m and accelerates from rest at 2 m/s² for 10 s, then decelerates at −1 m/s² until its position is exactly $x = 400$ m. What is its final speed at $x = 400$ m?`,
      hint: 'Track absolute position, not just displacement. Compute final position after phase 1, then find how far phase 2 travels, and use $v_f^2 = v_0^2 + 2a\\Delta x$.',
      walkthrough: [
        {
          expression: `v_{1,f} = 0 + 2(10) = 20\\text{ m/s}`,
          annotation: `Phase 1 final velocity.`,
        },
        {
          expression: `\\Delta x_1 = \\tfrac{1}{2}(2)(100) = 100\\text{ m}`,
          annotation: `Phase 1 displacement.`,
        },
        {
          expression: `x_{\\text{after phase 1}} = 100 + 100 = 200\\text{ m}`,
          annotation: `Absolute position after phase 1 — the starting point for phase 2.`,
        },
        {
          expression: `\\Delta x_2 = 400 - 200 = 200\\text{ m}`,
          annotation: `Phase 2 must cover exactly 200 m.`,
        },
        {
          expression: `v_f^2 = v_{0,2}^2 + 2 a_2 \\Delta x_2 = 400 + 2(-1)(200) = 0`,
          annotation: `$v_f^2 = 0$, so the train arrives at $x = 400$ m exactly at rest. The numbers work out perfectly.`,
        },
      ],
    },
    {
      id: 'p1-ch2-011-ch3',
      difficulty: 'hard',
      problem: `A car accelerates from rest at $a_1$ for time $T_1$, reaching speed $V$. It then brakes at $a_2 = -V / T_1$ for time $T_2$ until it stops. Show that $T_2 = T_1$ and that the total displacement is $V T_1$ (i.e., the area of the triangle under the v–t graph).`,
      hint: 'Express $T_2$ in terms of $V$ and $a_2$, then substitute $a_2 = -V/T_1$.',
      walkthrough: [
        {
          expression: `a_1 = V/T_1`,
          annotation: `Phase 1: starting from rest, $V = a_1 T_1$ gives the acceleration magnitude.`,
        },
        {
          expression: `T_2 = \\frac{0 - V}{a_2} = \\frac{-V}{-V/T_1} = T_1`,
          annotation: `Substituting $a_2 = -V/T_1$ shows $T_2 = T_1$. The braking phase lasts as long as the acceleration phase.`,
        },
        {
          expression: `\\Delta x_1 = \\tfrac{1}{2} V T_1`,
          annotation: `Phase 1 displacement: triangle with base $T_1$ and height $V$.`,
        },
        {
          expression: `\\Delta x_2 = V T_2 + \\tfrac{1}{2} a_2 T_2^2 = V T_1 - \\tfrac{1}{2} V T_1 = \\tfrac{1}{2} V T_1`,
          annotation: `Phase 2 displacement is also $\\tfrac{1}{2}VT_1$ (another triangle, mirrored).`,
        },
        {
          expression: `\\Delta x_{\\text{total}} = \\tfrac{1}{2}VT_1 + \\tfrac{1}{2}VT_1 = V T_1`,
          annotation: `The total displacement equals $V T_1$ — exactly the area of the symmetrical triangle formed by the v–t graph. This confirms the area-under-the-curve interpretation of displacement.`,
        },
      ],
    },
  ],
  checkpoints: [
    {
      id: 'p1-ch2-011-cp1',
      question: `A car reaches 20 m/s after accelerating from rest for 5 s, then brakes to rest. Which quantities must you carry from phase 1 into phase 2?`,
      answer: `The final velocity ($v_{1,f} = 20$ m/s) becomes $v_{0,2}$. The final position (or accumulated displacement) becomes $x_{0,2}$. These two scalar values are the complete state — nothing else transfers.`,
    },
    {
      id: 'p1-ch2-011-cp2',
      question: `Why can you set $t = 0$ at the start of each phase rather than using global time?`,
      answer: `SUVAT equations only use time elapsed within a phase ($\\Delta t$), not absolute time. Resetting $t = 0$ at each phase boundary keeps the algebra clean and prevents errors from adding a time offset to the $\\tfrac{1}{2}at^2$ term.`,
    },
  ],
  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Phase handoff — compute and print both phases',
          type: 'code',
          language: 'python',
          code: `# ── Phase 1 ──────────────────────────────────────────────
v0_1 = 0.0    # m/s  (starts from rest)
a_1  = 2.0    # m/s²
t_1  = 4.0    # s

v_end1 = v0_1 + a_1 * t_1            # SUVAT eq 1
dx_1   = v0_1 * t_1 + 0.5*a_1*t_1**2 # SUVAT eq 2

print("Phase 1 end state:")
print(f"  v = {v_end1:.2f} m/s   Δx = {dx_1:.2f} m")

# ── Phase 2 — state handoff ───────────────────────────────
v0_2 = v_end1   # <-- THIS is the handoff: phase 1 final → phase 2 initial
a_2  = -1.0     # m/s²  (decelerating)
v_f2 = 0.0      # final velocity (stopped)

t_2  = (v_f2 - v0_2) / a_2
dx_2 = v0_2*t_2 + 0.5*a_2*t_2**2

print("Phase 2:")
print(f"  duration {t_2:.2f} s   Δx = {dx_2:.2f} m")
print(f"Total: time={t_1+t_2:.1f} s  displacement={dx_1+dx_2:.1f} m")`,
          prose: [
            `Lines 2–4 define phase-1 parameters. Line 6 applies $v_f = v_0 + at$ and line 7 applies $\\Delta x = v_0 t + \\tfrac{1}{2}at^2$. These are pure SUVAT — no calculus needed when $a$ is constant.`,
            `Line 13 is the state handoff: \`v0_2 = v_end1\`. This single assignment encodes the continuity condition $v_{1,f} = v_{0,2}$. Everything else in phase 2 is a fresh constant-acceleration problem starting from rest (of the clock).`,
            `Lines 18–19 solve phase 2 using the same SUVAT equations. Lines 21–23 print results. Notice how cleanly each phase is isolated — no global time variable, no complicated offset arithmetic.`,
          ],
        },
        {
          cellTitle: 'Visualize x–t and v–t across both phases',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Phase parameters
v0_1, a_1, t1_end = 0.0, 2.0, 4.0
v1_end = v0_1 + a_1 * t1_end
x1_end = v0_1*t1_end + 0.5*a_1*t1_end**2

v0_2, a_2 = v1_end, -1.0
t2_dur = -v0_2 / a_2        # time for phase 2 to reach v=0
T_total = t1_end + t2_dur

t = np.linspace(0, T_total, 500)

# piecewise x(t) and v(t) using np.where
x = np.where(
    t <= t1_end,
    v0_1*t + 0.5*a_1*t**2,
    x1_end + v0_2*(t - t1_end) + 0.5*a_2*(t - t1_end)**2
)
v = np.where(
    t <= t1_end,
    v0_1 + a_1*t,
    v0_2 + a_2*(t - t1_end)
)

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 6), sharex=True)
ax1.plot(t, x, lw=2, color='steelblue', label='x(t)')
ax1.axvline(t1_end, color='orange', ls='--', lw=1.5, label=f'boundary t={t1_end}s')
ax1.set_ylabel('Position x (m)')
ax1.set_title('Two-phase motion: accelerate then brake')
ax1.legend()

ax2.plot(t, v, lw=2, color='tomato', label='v(t)')
ax2.axvline(t1_end, color='orange', ls='--', lw=1.5)
ax2.axhline(0, color='k', lw=0.8)
ax2.set_xlabel('Time (s)')
ax2.set_ylabel('Velocity v (m/s)')
ax2.legend()
plt.tight_layout()
plt.show()`,
          prose: [
            `\`np.where(condition, phase1_expr, phase2_expr)\` is how piecewise functions are computed over a NumPy array. For $t \\le t_{1,\\text{end}}$ it applies phase-1 SUVAT; for $t > t_{1,\\text{end}}$ it applies phase-2 SUVAT with local time \`t - t1_end\`. That subtraction is the clock reset in code form.`,
            `The orange dashed vertical line marks the phase boundary. On the x–t plot, you should see two parabolic arcs with a smooth join — same value, same slope (velocity), but different curvature (acceleration) on each side. On the v–t plot you see two straight lines with a kink at the boundary.`,
            `The v–t graph is a triangle: rise then fall, area = $\\tfrac{1}{2}(4)(8) + \\tfrac{1}{2}(8)(8) = 48$ m. Compare that to the code-computed total displacement to verify the area-under-curve interpretation.`,
          ],
        },
        {
          cellTitle: 'Three-phase motion — accelerate, cruise, brake',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Phase 1: accelerate from rest at 1.5 m/s² for 8 s
v0_1, a_1, t1 = 0.0, 1.5, 8.0
v1 = v0_1 + a_1*t1
x1 = v0_1*t1 + 0.5*a_1*t1**2

# Phase 2: cruise at constant velocity for 20 s
v0_2, a_2, t2 = v1, 0.0, 20.0
x2 = v0_2*t2          # a=0, so Δx = v*t

# Phase 3: brake at -2 m/s² to rest
v0_3, a_3, vf3 = v1, -2.0, 0.0
t3 = (vf3 - v0_3) / a_3
x3 = v0_3*t3 + 0.5*a_3*t3**2

print(f"Phase 1: {t1:.1f} s   Δx = {x1:.2f} m   v_end = {v1:.2f} m/s")
print(f"Phase 2: {t2:.1f} s   Δx = {x2:.2f} m   v_end = {v0_2:.2f} m/s")
print(f"Phase 3: {t3:.2f} s   Δx = {x3:.2f} m   v_end = {vf3:.2f} m/s")
print(f"Total:   {t1+t2+t3:.2f} s   Δx = {x1+x2+x3:.2f} m")

# Plot the v–t graph (trapezoid shape for three phases)
T = [0, t1, t1+t2, t1+t2+t3]
V = [v0_1, v1, v1, vf3]
plt.figure(figsize=(8, 4))
plt.plot(T, V, 'o-', lw=2, color='steelblue', ms=8)
plt.fill_between(T, V, alpha=0.2, color='steelblue', label=f'Area = {x1+x2+x3:.1f} m')
plt.axvline(t1, color='orange', ls='--', lw=1)
plt.axvline(t1+t2, color='green', ls='--', lw=1)
plt.xlabel('Time (s)')
plt.ylabel('Velocity (m/s)')
plt.title('v–t trapezoid for three-phase motion')
plt.legend()
plt.tight_layout()
plt.show()`,
          prose: [
            `Three separate phase blocks, each with its own $(v_0, a, t)$ triple. Notice the pattern: phase-$k$ inherits $v_{0,k}$ from the previous phase's final velocity. The cruise phase has $a = 0$, so $\\Delta x = v \\cdot t$ — the $\\tfrac{1}{2}at^2$ term vanishes.`,
            `The v–t graph is a trapezoid: rise (acceleration), flat top (cruise), fall (braking). The filled area equals total displacement. This is the geometric meaning of the area-under-v–t-curve rule extended to multi-phase motion.`,
            `\`plt.fill_between\` shades the area under the curve. The label shows the computed area numerically. Visually verify that the shaded trapezoid area matches the printed total displacement — this is a powerful cross-check.`,
          ],
        },
        {
          cellTitle: 'Challenge — write a general multi-phase solver',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `def solve_phases(phases, x0=0.0, v0=0.0):
    """
    phases: list of dicts, each with keys:
        'a'  : acceleration (m/s²)
        't'  : duration (s)  -- or None if braking to rest
    Returns: list of dicts with 'v_end', 'x_end', 'dt' for each phase.
    """
    results = []
    x, v = x0, v0

    for phase in phases:
        a = phase['a']
        t = phase['t']

        if t is None:
            # ── YOUR CODE: compute t so the phase ends at v=0 ──
            t = ???

        # ── YOUR CODE: compute v_end and delta_x for this phase ──
        v_end = ???
        dx    = ???

        x += dx
        v = v_end
        results.append({'v_end': round(v_end, 4), 'x_end': round(x, 4), 'dt': round(t, 4)})

    return results

# Test: phase 1 accelerate, phase 2 cruise, phase 3 brake to rest
test_phases = [
    {'a': 2.0, 't': 5.0},
    {'a': 0.0, 't': 10.0},
    {'a': -1.5, 't': None},
]
for i, res in enumerate(solve_phases(test_phases), 1):
    print(f"Phase {i}: v_end={res['v_end']} m/s  x={res['x_end']} m  dt={res['dt']} s")`,
          prose: [
            `This challenge asks you to build a general solver for any number of phases. Fill in three blanks: (1) when \`t\` is \`None\`, compute how long it takes to decelerate to zero using $t = (0 - v) / a$; (2) compute \`v_end\` using SUVAT eq 1; (3) compute \`dx\` using SUVAT eq 2.`,
            `The solver accumulates position by adding $\\Delta x$ to a running total \`x\`. This correctly tracks absolute position from the starting \`x0\` — contrast this with just summing displacements, which would fail if you need intermediate absolute positions.`,
            `Test output: Phase 1 ends at 10 m/s, Phase 2 ends at 10 m/s (cruise), Phase 3 decelerates to 0. Verify total displacement matches what you would compute by hand.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Phase handoff — compute and display both phases',
          type: 'code',
          language: 'matlab',
          code: `%% Phase 1
v0_1 = 0;    % m/s  (starts from rest)
a_1  = 2;    % m/s²
t_1  = 4;    % s

v_end1 = v0_1 + a_1 * t_1;
dx_1   = v0_1*t_1 + 0.5*a_1*t_1^2;

fprintf('Phase 1 end state:\\n')
fprintf('  v = %.2f m/s   dx = %.2f m\\n', v_end1, dx_1)

%% Phase 2 — state handoff
v0_2 = v_end1;    % <-- continuity: phase-1 final becomes phase-2 initial
a_2  = -1;        % m/s²  (decelerating)
v_f2 = 0;         % stopped

t_2  = (v_f2 - v0_2) / a_2;
dx_2 = v0_2*t_2 + 0.5*a_2*t_2^2;

fprintf('Phase 2:\\n')
fprintf('  duration %.2f s   dx = %.2f m\\n', t_2, dx_2)
fprintf('Total: time=%.1f s  displacement=%.1f m\\n', t_1+t_2, dx_1+dx_2)`,
          prose: [
            `MATLAB/Octave uses \`^\` for exponentiation (vs Python's \`**\`). Otherwise the SUVAT equations are identical: \`v0 + a*t\` for velocity and \`v0*t + 0.5*a*t^2\` for displacement.`,
            `The state handoff is on line 14: \`v0_2 = v_end1\`. This is the only coupling between phases — a single scalar assignment that encodes the continuity condition $v_{1,f} = v_{0,2}$.`,
            `\`fprintf\` works like Python's \`f-string\` but uses C-style format specifiers (\`%.2f\`). The \`\\n\` is a newline character. Output should print Phase 1 ending at 8 m/s and 16 m, Phase 2 lasting 8 s and covering 32 m.`,
          ],
        },
        {
          cellTitle: 'Visualize x–t and v–t across both phases',
          type: 'code',
          language: 'matlab',
          code: `%% Phase parameters
v0_1 = 0; a_1 = 2; t1_end = 4;
v1_end = v0_1 + a_1*t1_end;
x1_end = v0_1*t1_end + 0.5*a_1*t1_end^2;

v0_2 = v1_end; a_2 = -1;
t2_dur = -v0_2 / a_2;
T_total = t1_end + t2_dur;

t = linspace(0, T_total, 500);

%% Piecewise x(t) and v(t)
phase1 = t <= t1_end;
tau2   = t - t1_end;   % local time for phase 2

x = zeros(size(t));
x(phase1)  = v0_1*t(phase1) + 0.5*a_1*t(phase1).^2;
x(~phase1) = x1_end + v0_2*tau2(~phase1) + 0.5*a_2*tau2(~phase1).^2;

v = zeros(size(t));
v(phase1)  = v0_1 + a_1*t(phase1);
v(~phase1) = v0_2 + a_2*tau2(~phase1);

%% Plot
figure('Position',[100 100 700 500])
subplot(2,1,1)
plot(t, x, 'b-', 'LineWidth', 2); hold on
xline(t1_end, '--', 'Color', [1 0.6 0], 'LineWidth', 1.5, 'Label', 'boundary')
ylabel('Position x (m)')
title('Two-phase motion: x(t) and v(t)')

subplot(2,1,2)
plot(t, v, 'r-', 'LineWidth', 2); hold on
xline(t1_end, '--', 'Color', [1 0.6 0], 'LineWidth', 1.5)
yline(0, 'k-', 'LineWidth', 0.8)
xlabel('Time (s)'); ylabel('Velocity v (m/s)')
tight_layout`,
          prose: [
            `MATLAB uses logical indexing: \`phase1 = t <= t1_end\` creates a logical array, and \`x(phase1)\` applies phase-1 SUVAT only to those indices. \`~phase1\` selects the complement. The local time variable \`tau2 = t - t1_end\` implements the clock reset.`,
            `The element-wise operators \`.*\` and \`.^\` are needed when multiplying or exponentiating arrays. Using \`*\` would attempt matrix multiplication, which fails for non-square arrays — a common MATLAB beginner error.`,
            `\`xline\` draws a vertical reference line at \`t1_end\`. Observe the x–t graph: two parabolic arcs joined smoothly at the orange dashed line. The v–t graph shows a kink (slope change) at the same boundary, confirming that position and velocity are continuous but acceleration is not.`,
          ],
        },
        {
          cellTitle: 'Three-phase motion — accelerate, cruise, brake',
          type: 'code',
          language: 'matlab',
          code: `%% Phase 1: accelerate from rest at 1.5 m/s² for 8 s
v0_1=0; a_1=1.5; t1=8;
v1 = v0_1 + a_1*t1;
x1 = v0_1*t1 + 0.5*a_1*t1^2;

%% Phase 2: cruise at constant velocity for 20 s
v0_2=v1; a_2=0; t2=20;
x2 = v0_2*t2;    % a=0 → Δx = v·t

%% Phase 3: brake at -2 m/s² to rest
v0_3=v1; a_3=-2; vf3=0;
t3 = (vf3 - v0_3) / a_3;
x3 = v0_3*t3 + 0.5*a_3*t3^2;

fprintf('Phase 1: %.1f s   Δx=%.2f m\\n', t1, x1)
fprintf('Phase 2: %.1f s   Δx=%.2f m\\n', t2, x2)
fprintf('Phase 3: %.2f s   Δx=%.2f m\\n', t3, x3)
fprintf('Total:   %.2f s   Δx=%.2f m\\n', t1+t2+t3, x1+x2+x3)

%% v–t trapezoid plot
T_pts = [0, t1, t1+t2, t1+t2+t3];
V_pts = [v0_1, v1, v1, vf3];
figure
area(T_pts, V_pts, 'FaceAlpha', 0.2, 'FaceColor', 'b')
hold on
plot(T_pts, V_pts, 'bo-', 'LineWidth', 2, 'MarkerSize', 8)
xlabel('Time (s)'); ylabel('Velocity (m/s)')
title(sprintf('v–t trapezoid  (area = %.2f m)', x1+x2+x3))
grid on`,
          prose: [
            `Three phase blocks mirror the Python version exactly. The cruise phase uses \`x2 = v0_2*t2\` — when $a = 0$, the SUVAT displacement formula reduces to simple $v \\cdot t$, which is the area of the rectangle under the flat portion of the v–t graph.`,
            `\`area(T_pts, V_pts, ...)\` fills the polygon under the piecewise-linear v–t curve. The shaded area equals total displacement — confirming the $\\int v\\,dt = \\Delta x$ relationship visually. \`FaceAlpha\` controls transparency (0 = invisible, 1 = solid).`,
            `\`sprintf\` inside a plot title embeds a computed number into a string — useful for annotating plots with numerical results. This pattern appears frequently in scientific MATLAB code.`,
          ],
        },
        {
          cellTitle: 'Challenge — find cruise duration from total distance',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `%% Given: accelerate → cruise → brake to rest
%% Total journey = 320 m. Find cruise duration.

a_acc   =  4;    % m/s²  (acceleration phase)
t_acc   =  5;    % s
a_brake = -2;    % m/s²  (braking phase)
total_x = 320;   % m

%% Step 1: solve phase 1 (acceleration)
% YOUR CODE: compute v_cruise and dx_acc
v_cruise = ???;
dx_acc   = ???;

%% Step 2: solve phase 3 (braking to rest)
% YOUR CODE: compute t_brake and dx_brake using v_cruise and a_brake
t_brake  = ???;
dx_brake = ???;

%% Step 3: remaining distance goes to cruise
% YOUR CODE: compute dx_cruise and t_cruise
dx_cruise = ???;
t_cruise  = ???;

fprintf('Cruise speed : %.2f m/s\\n', v_cruise)
fprintf('Phase 1 dist : %.2f m\\n', dx_acc)
fprintf('Brake dist   : %.2f m\\n', dx_brake)
fprintf('Cruise dist  : %.2f m\\n', dx_cruise)
fprintf('Cruise time  : %.2f s\\n', t_cruise)
fprintf('Total check  : %.2f m (should be %.1f)\\n', dx_acc+dx_cruise+dx_brake, total_x)`,
          prose: [
            `Fill in six blanks following the five-step procedure: (1) \`v_cruise = a_acc * t_acc\`; (2) \`dx_acc = 0.5*a_acc*t_acc^2\`; (3) \`t_brake = -v_cruise/a_brake\`; (4) \`dx_brake = v_cruise*t_brake + 0.5*a_brake*t_brake^2\`; (5) \`dx_cruise = total_x - dx_acc - dx_brake\`; (6) \`t_cruise = dx_cruise/v_cruise\`.`,
            `This is an inverse problem: instead of computing total distance from phase durations, you compute a phase duration from a total-distance constraint. Algebra is the same — just solve for the unknown last.`,
            `Expected output: cruise speed = 20 m/s, phase-1 distance = 50 m, brake distance = 100 m, cruise distance = 170 m, cruise time = 8.5 s. Total check should print 320.00 m.`,
          ],
        },
      ],
    },
  },
  quiz: [
    {
      id: 'p1-ch2-011-q1',
      type: 'choice',
      question: `In two-phase motion, what condition must hold at the phase boundary?`,
      options: [
        `Acceleration is the same in both phases`,
        `Position and velocity are continuous (same value from both sides)`,
        `Total time is evenly split between phases`,
        `Displacement in each phase is equal`,
      ],
      answer: `Position and velocity are continuous (same value from both sides)`,
      hints: [
        `Think about what "state" means for a moving object — position tells you where it is, velocity tells you how fast it is moving.`,
        `Acceleration can change abruptly — that is what defines the phase boundary. But what cannot teleport or spike?`,
      ],
      reviewSection: 'intuition',
      explanation: `At the boundary, final position and velocity of phase 1 become initial position and velocity of phase 2. Acceleration can (and usually does) change abruptly — that is precisely what separates the phases.`,
    },
    {
      id: 'p1-ch2-011-q2',
      type: 'choice',
      question: `Phase 1: $v_0 = 0$, $a = 2$ m/s², duration $t = 4$ s. What is the velocity at the end of phase 1?`,
      options: [`4 m/s`, `8 m/s`, `16 m/s`, `2 m/s`],
      answer: `8 m/s`,
      hints: [
        `Use $v_f = v_0 + at$.`,
        `$a \\cdot t = 2 \\times 4 = ?$`,
      ],
      reviewSection: 'examples',
      explanation: `$v = v_0 + at = 0 + 2(4) = 8$ m/s. This velocity becomes $v_0$ for phase 2.`,
    },
    {
      id: 'p1-ch2-011-q3',
      type: 'choice',
      question: `Using the same Phase 1 ($v_0=0$, $a=2$ m/s², $t=4$ s), what is the displacement during phase 1?`,
      options: [`8 m`, `16 m`, `32 m`, `4 m`],
      answer: `16 m`,
      hints: [
        `Use $\\Delta x = v_0 t + \\tfrac{1}{2}at^2$.`,
        `$\\tfrac{1}{2} \\times 2 \\times 4^2 = ?$`,
      ],
      reviewSection: 'examples',
      explanation: `$\\Delta x_1 = 0 + \\tfrac{1}{2}(2)(16) = 16$ m.`,
    },
    {
      id: 'p1-ch2-011-q4',
      type: 'choice',
      question: `Phase 2 begins at $v_0 = 8$ m/s and decelerates at $a = -1$ m/s² to rest. How long does phase 2 last?`,
      options: [`4 s`, `8 s`, `16 s`, `1 s`],
      answer: `8 s`,
      hints: [
        `Use $t = (v_f - v_0)/a$ with $v_f = 0$.`,
        `$(0 - 8) / (-1) = ?$`,
      ],
      reviewSection: 'examples',
      explanation: `$t = (0 - 8)/(-1) = 8$ s.`,
    },
    {
      id: 'p1-ch2-011-q5',
      type: 'choice',
      question: `What is the displacement during phase 2 ($v_0=8$ m/s, $a=-1$ m/s², $t=8$ s)?`,
      options: [`16 m`, `32 m`, `64 m`, `8 m`],
      answer: `32 m`,
      hints: [
        `Use $\\Delta x = v_0 t + \\tfrac{1}{2}at^2$.`,
        `$8(8) + \\tfrac{1}{2}(-1)(64) = 64 - 32 = ?$`,
      ],
      reviewSection: 'examples',
      explanation: `$\\Delta x_2 = 8(8) + \\tfrac{1}{2}(-1)(64) = 64 - 32 = 32$ m.`,
    },
    {
      id: 'p1-ch2-011-q6',
      type: 'choice',
      question: `What is the total displacement for the two-phase problem ($\\Delta x_1 = 16$ m, $\\Delta x_2 = 32$ m)?`,
      options: [`32 m`, `48 m`, `64 m`, `16 m`],
      answer: `48 m`,
      hints: [
        `Total displacement = sum of phase displacements.`,
        `$16 + 32 = ?$`,
      ],
      reviewSection: 'examples',
      explanation: `$\\Delta x_{\\text{total}} = 16 + 32 = 48$ m.`,
    },
    {
      id: 'p1-ch2-011-q7',
      type: 'choice',
      question: `On the x–t graph for two-phase motion (accelerate then decelerate), what shape does the combined curve have?`,
      options: [
        `Two straight lines with different slopes`,
        `A single parabola opening upward throughout`,
        `Two parabolic arcs joined at the phase boundary`,
        `A straight line then a parabola`,
      ],
      answer: `Two parabolic arcs joined at the phase boundary`,
      hints: [
        `What shape does constant-acceleration motion produce on an x–t graph?`,
        `Both phases have non-zero (but different) accelerations.`,
      ],
      reviewSection: 'rigor',
      explanation: `Each constant-acceleration phase produces a parabolic arc. The arcs share a common point and slope at the boundary (position and velocity match), but the curvature differs (acceleration jumps).`,
    },
    {
      id: 'p1-ch2-011-q8',
      type: 'choice',
      question: `A car cruises at constant velocity. What is its acceleration during this phase?`,
      options: [
        `$a > 0$`,
        `$a = 0$`,
        `$a < 0$`,
        `Cannot be modelled with SUVAT`,
      ],
      answer: `$a = 0$`,
      hints: [
        `Constant velocity means the velocity is not changing.`,
        `How does acceleration relate to the change in velocity?`,
      ],
      reviewSection: 'math',
      explanation: `Constant velocity means $a = 0$. SUVAT still applies: $\\Delta x = v_0 t$ since the $\\tfrac{1}{2}at^2$ term vanishes.`,
    },
    {
      id: 'p1-ch2-011-q9',
      type: 'choice',
      question: `A car accelerates from rest at 3 m/s² for 5 s, then brakes at −2 m/s² to rest. What is the total distance traveled?`,
      options: [`37.5 m`, `56.25 m`, `93.75 m`, `75 m`],
      answer: `93.75 m`,
      hints: [
        `Find phase-1 displacement and final speed first, then solve phase 2.`,
        `Phase 1 ends at $v = 15$ m/s. Use that as $v_0$ for phase 2.`,
      ],
      reviewSection: 'examples',
      explanation: `Phase 1: $v_{1,f} = 15$ m/s, $\\Delta x_1 = \\tfrac{1}{2}(3)(25) = 37.5$ m. Phase 2: $t_2 = 15/2 = 7.5$ s, $\\Delta x_2 = 15(7.5) - \\tfrac{1}{2}(2)(56.25) = 112.5 - 56.25 = 56.25$ m. Total: $37.5 + 56.25 = 93.75$ m.`,
    },
    {
      id: 'p1-ch2-011-q10',
      type: 'choice',
      question: `Why should you reset the clock ($t = 0$) at the start of each phase rather than using the global elapsed time?`,
      options: [
        `Because SUVAT equations require the absolute time from the beginning of the universe`,
        `Because SUVAT equations use elapsed time within a phase, and adding a time offset to $t$ in $\\tfrac{1}{2}at^2$ gives wrong values`,
        `Because phase durations cannot exceed 10 seconds`,
        `Because position is not defined before $t = 0$`,
      ],
      answer: `Because SUVAT equations use elapsed time within a phase, and adding a time offset to $t$ in $\\tfrac{1}{2}at^2$ gives wrong values`,
      hints: [
        `What does $t$ mean in $\\Delta x = v_0 t + \\tfrac{1}{2}at^2$?`,
        `If phase 2 starts at global time $T_1 = 4$ s and you use $t = 6$ s (global) instead of local $t = 2$ s, how does $\\tfrac{1}{2}at^2$ change?`,
      ],
      reviewSection: 'intuition',
      explanation: `$t$ in SUVAT is elapsed time since the start of that equation's interval. If phase 2 begins at $T_1 = 4$ s globally, using $t = 6$ s (global) in $\\tfrac{1}{2}at^2$ gives $\\tfrac{1}{2}a(36)$ instead of the correct $\\tfrac{1}{2}a(2^2) = \\tfrac{1}{2}a(4)$. Always use local elapsed time.`,
    },
  ],
  misconceptions: [
    {
      id: 'p1-ch2-011-m1',
      misconception: `"I can use a single SUVAT equation across all phases by plugging in the total time."`,
      correction: `SUVAT requires constant acceleration throughout the entire interval. As soon as $a$ changes, you must split into separate phases. Using total time with an average acceleration gives a wrong answer.`,
      correctionExample: `Two-phase problem: $a_1 = 2$ m/s² for 4 s, then $a_2 = -1$ m/s² for 8 s. Total time = 12 s. "Average" $a \\approx 0$, giving $\\Delta x \\approx 0$. Actual answer: 48 m. The single-equation shortcut is completely wrong here.`,
    },
    {
      id: 'p1-ch2-011-m2',
      misconception: `"The position at the start of phase 2 is always $x = 0$."`,
      correction: `Phase 2 begins wherever phase 1 ended. If the problem asks for a final absolute position, you must track $x_{0,2} = x_{0,1} + \\Delta x_1$, not reset to zero.`,
      correctionExample: `A train starts at $x_0 = 500$ m, accelerates to cover $\\Delta x_1 = 200$ m, then brakes. The braking phase starts at $x = 700$ m. Using $x_0 = 0$ for phase 2 would give a final position of only $\\Delta x_2$ instead of $700 + \\Delta x_2$.`,
    },
  ],
  transferPrompts: [
    {
      id: 'p1-ch2-011-tp1',
      prompt: `A charging phone draws 2 A for 30 minutes, then 0.5 A for the next 90 minutes. If charge is the integral of current, what is the total charge delivered? How does this map to two-phase kinematics?`,
    },
    {
      id: 'p1-ch2-011-tp2',
      prompt: `A rocket fires its first-stage engine for 120 s at 50 m/s² (starting from rest), then coasts (a = 0) for 300 s, then fires a second stage at 30 m/s² for 60 s. Estimate the final speed and distance from launch.`,
    },
  ],
  debugging: [
    {
      id: 'p1-ch2-011-d1',
      buggyWork: `Phase 1: $v_0 = 0$, $a = 3$ m/s², $t_1 = 4$ s → $v_f = 12$ m/s, $\\Delta x_1 = 24$ m. Phase 2 starts at $v_0 = 12$ m/s, $a = -2$ m/s², runs for $t_2 = 3$ s. Student writes $\\Delta x_2 = 12(3) + \\tfrac{1}{2}(-2)(3)^2 = 36 - 9 = 27$ m. Total displacement = $24 + 27 = 51$ m.`,
      question: `Verify the student's phase-2 displacement calculation. Is the arithmetic correct? Is 51 m the right total?`,
      answer: `Phase-2 arithmetic is correct: $12(3) = 36$, $\\tfrac{1}{2}(2)(9) = 9$, $36 - 9 = 27$ m. Total = $24 + 27 = 51$ m is correct. The student's work has no error — this is a "debugging" exercise where the answer is right and the task is to verify it step-by-step.`,
    },
    {
      id: 'p1-ch2-011-d2',
      buggyWork: `A student solves a two-phase problem: phase 1 ends at $t = 5$ s with $v = 10$ m/s and $x = 25$ m. For phase 2 ($a = -2$ m/s²), they write $\\Delta x_2 = 10(t) + \\tfrac{1}{2}(-2)(t)^2$ and plug in $t = 9$ s (global elapsed time at end of phase 2) to get $\\Delta x_2 = 90 - 81 = 9$ m.`,
      question: `What is the student's error, and what is the correct displacement for phase 2?`,
      answer: `The student used global time ($t = 9$ s) instead of local phase-2 time ($t_{\\text{local}} = 9 - 5 = 4$ s). Phase 2 lasts $t_2 = (0 - 10)/(-2) = 5$ s, so local duration is 5 s, not 4. Correct: $\\Delta x_2 = 10(5) + \\tfrac{1}{2}(-2)(25) = 50 - 25 = 25$ m. Total displacement = $25 + 25 = 50$ m, not 34.`,
    },
  ],
  mastery: {
    targetLevel: `Solve any two-or-three-phase constant-acceleration problem by identifying phase boundaries, computing state at each boundary, and accumulating position and time — without using any single equation across phase boundaries.`,
    coreSkill: `State handoff: correctly transferring $v_f$ and $x_f$ from one phase as the $v_0$ and $x_0$ of the next, and resetting the local clock.`,
    commonSticking: `Using global elapsed time in SUVAT equations for later phases. The fix: always define $t = 0$ at the start of each phase and use only local elapsed time in that phase's equations.`,
    connections: [
      `ch2-008 (SUVAT equations) — each phase uses these directly`,
      `ch2-010 (multi-phase worked example) — the ball-upward/free-fall problem is a two-phase case`,
      `ch2-009 (displacement from velocity) — phase handoff is a piecewise form of $\\Delta x = \\int v\\,dt$`,
      `ch3 (Newton's second law) — phase boundaries correspond to moments when the net force changes`,
    ],
  },
  semantics: {
    core: [
      { symbol: `v_{k,f}`, meaning: `Final velocity of phase $k$` },
      { symbol: `v_{k+1,0}`, meaning: `Initial velocity of phase $k+1$ — equals $v_{k,f}$ by state continuity` },
      { symbol: `\\Delta x_k`, meaning: `Displacement during phase $k$ (local to that phase)` },
      { symbol: `T_k`, meaning: `Duration of phase $k$ (local elapsed time, starts at 0)` },
      { symbol: `x_{k,0}`, meaning: `Absolute starting position of phase $k$ — includes all prior phase displacements` },
    ],
    rulesOfThumb: [
      `Wherever the acceleration changes, draw a phase boundary and start a new set of SUVAT variables.`,
      `Always restart the clock: $t = 0$ at the beginning of each phase. Never plug global time into SUVAT.`,
      `The only numbers that cross the phase boundary are $v_f \\to v_0$ and $x_f \\to x_0$. Everything else (acceleration, duration, local displacement) stays local to its phase.`,
      `Total displacement = sum of all phase displacements. Total time = sum of all phase durations. No formula spans multiple phases.`,
      `If a problem asks for final absolute position, track it: $x_f = x_0 + \\Delta x_1 + \\Delta x_2 + \\cdots$. If it asks only for total displacement, just sum the $\\Delta x_k$ values.`,
    ],
  },
};

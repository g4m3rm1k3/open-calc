export default {
  id: 'p1-ch7-002',
  slug: 'torque',
  chapter: 'p7',
  order: 2,
  title: 'Torque: The Rotational Force',
  subtitle: 'Force applied at a distance — the lever arm is everything.',
  tags: ['torque', 'lever arm', 'moment', 'cross product', 'tau = rF sin theta', 'wrench', 'rotation'],

  hook: {
    question:
      'You need to loosen a very tight bolt. You have two wrenches: one with a 10 cm handle, one with a 40 cm handle. You apply the same 50 N force to each. Which wrench is more effective — and by exactly how much? What physical quantity are you actually controlling?',
    realWorldContext:
      'Torque is why door handles are on the far edge from the hinge, why steering wheels are large, and why a longer wrench makes a mechanic\'s job easier. It is also why the human forearm works the way it does: the bicep attaches close to the elbow joint (short lever arm) but must support loads far from the joint. Torque governs everything from opening a jar to the orbital mechanics of a spacecraft.',
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      '**The answer:** The 40 cm wrench produces 4× more torque: \\(\\tau = r F = (0.40)(50) = 20\\) N·m vs \\((0.10)(50) = 5\\) N·m. The quantity you\'re controlling is **torque** — the rotational effectiveness of a force.',

      '**Why distance matters:** A force applied at the rotation axis produces zero rotation — no lever arm means no torque. Push on a door right at the hinge: nothing moves. Push at the far edge: easy rotation. Same force, completely different effect. The perpendicular distance from the axis to the line of force — the **lever arm** — is what multiplies the force.',

      '**The angle matters too:** If you push perpendicular to the wrench, all your force contributes to rotation. If you push along the wrench (parallel to the handle), zero rotation — you\'re just pushing toward or away from the axis. The effective component is \\(F\\sin\\theta\\), where \\(\\theta\\) is the angle between the force and the lever arm. So the full formula is \\(\\tau = rF\\sin\\theta\\).',

      '**Torque is a vector (cross product):** \\(\\vec{\\tau} = \\vec{r} \\times \\vec{F}\\). The direction is given by the right-hand rule: curl fingers from \\(\\vec{r}\\) toward \\(\\vec{F}\\), thumb points along the torque vector. Counterclockwise torques are positive; clockwise are negative (by convention).',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 4 — Torque: the cause of angular acceleration',
        body:
          '**Lesson 1:** Angular kinematics describes HOW rotation happens (θ, ω, α).\n**This lesson:** Torque is WHY rotation happens — the rotational analogue of force.\n**Next:** Rotational dynamics: τ = Iα (Newton\'s Second Law for rotation).',
      },
      {
        type: 'definition',
        title: 'Torque',
        body: '\\tau = rF\\sin\\theta = r_{\\perp}F = rF_{\\perp} \\qquad [\\text{SI: N·m}]',
      },
      {
        type: 'theorem',
        title: 'Torque as cross product',
        body: '\\vec{\\tau} = \\vec{r} \\times \\vec{F} \\qquad |\\vec{\\tau}| = rF\\sin\\theta',
      },
      {
        type: 'insight',
        title: 'Three equivalent interpretations of τ = rF sin θ',
        body:
          '1. \\(\\tau = r \\cdot (F\\sin\\theta)\\) — full radius × perpendicular component of force.\n2. \\(\\tau = (r\\sin\\theta) \\cdot F\\) — perpendicular distance (lever arm) × full force.\n3. \\(\\tau = \\vec{r} \\times \\vec{F}\\) — cross product magnitude. All three are the same.',
      },
      {
        type: 'warning',
        title: 'Torque units look like energy — they are not the same',
        body:
          'Work W = F·d has units N·m = J. Torque τ = rF has units N·m. Numerically identical units, physically completely different. Work is a dot product (scalar). Torque is a cross product (vector). To avoid confusion, some texts write torque in N·m and energy in J.',
      },
      {
        type: 'connection',
        title: 'Calculus connection: work done by a torque',
        body:
          'When a torque \\(\\tau\\) rotates an object by angle \\(d\\theta\\): \\(dW = \\tau\\,d\\theta\\). For constant torque: \\(W = \\tau\\theta\\). For variable torque: \\(W = \\int\\tau\\,d\\theta\\). This mirrors \\(W = \\int F\\,dx\\) — the rotational version of work.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'torque-lever' },
        title: 'Lever arm and torque — drag the force position',
        caption:
          'Drag the point where force is applied. Watch torque = r × F sin θ update. At the hinge (r = 0): τ = 0. At the far edge (maximum r): maximum τ. Change the angle θ: perpendicular gives maximum torque; parallel gives zero.',
      },
    ],
  },

  math: {
    prose: [
      'Torque about an axis: \\(\\tau = rF\\sin\\theta\\), where \\(r\\) is the distance from axis to point of force application, \\(F\\) is the force magnitude, and \\(\\theta\\) is the angle between \\(\\vec{r}\\) and \\(\\vec{F}\\).',
      'For a system in **rotational equilibrium**, the net torque about any axis must be zero:',
      '\\(\\sum \\tau = 0 \\quad \\Leftrightarrow \\quad \\alpha = 0\\)',
      'This extends statics (Chapter 4) to rotating systems: a balanced seesaw or a horizontal beam has zero net torque.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Rotational equilibrium',
        body: '\\sum \\tau = 0 \\quad (\\text{and } \\sum \\vec{F} = 0 \\text{ for full static equilibrium})',
      },
      {
        type: 'mnemonic',
        title: 'Sign convention',
        body:
          'Counterclockwise torques: positive (+τ).\nClockwise torques: negative (−τ).\nSet this convention at the start of every statics problem and never switch mid-problem.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'balanced-seesaw' },
        title: 'Seesaw balance — torque equilibrium',
        caption:
          'Move the masses and their positions. The seesaw balances when the clockwise and counterclockwise torques about the pivot are equal. A heavy child close to the pivot can be balanced by a lighter child far from it — the lever arm compensates for the mass difference.',
      },
    ],
  },

  rigor: {
    title: 'Why τ = r × F (cross product definition)',
    proofSteps: [
      {
        expression: 'W = \\vec{F}\\cdot d\\vec{s} = F\\,ds\\cos\\phi',
        annotation: 'Work done by force F through arc displacement ds = r dθ.',
      },
      {
        expression: 'dW = F\\,r\\,d\\theta\\,\\cos\\phi = F\\sin\\theta\\,r\\,d\\theta',
        annotation: 'Here φ is angle between F and ds (tangential direction). The tangential component of F is F sin θ, where θ is angle between r and F.',
      },
      {
        expression: 'dW = \\tau\\,d\\theta \\quad \\Rightarrow \\quad \\tau = rF\\sin\\theta',
        annotation: 'Defining torque as τ = rF sin θ makes the rotational work equation W = ∫τ dθ exactly mirror W = ∫F dx.',
      },
      {
        expression: '\\vec{\\tau} = \\vec{r}\\times\\vec{F}: \\;|\\vec{\\tau}| = rF\\sin\\theta, \\; \\text{direction by right-hand rule}',
        annotation: 'The cross product packages magnitude and direction into one vector. For 2D problems, we only need the magnitude.',
      },
    ],
  },

  examples: [
    {
      id: 'ch7-002-ex1',
      title: 'Opening a door — torque at different positions',
      problem:
        '\\text{A door is 0.9 m wide. A force of 30 N is applied perpendicular to the door at: (a) 0.9 m from hinge, (b) 0.3 m from hinge, (c) 0.9 m at 60° to the door plane.}',
      steps: [
        { expression: '\\tau_a = (0.9)(30)\\sin 90° = 27\\,\\text{N·m}', annotation: 'Maximum torque at far edge.' },
        { expression: '\\tau_b = (0.3)(30)\\sin 90° = 9\\,\\text{N·m}', annotation: '3× less torque — 3× harder to open.' },
        { expression: '\\tau_c = (0.9)(30)\\sin 60° = (0.9)(30)(0.866) = 23.4\\,\\text{N·m}', annotation: 'Angled force is less effective than perpendicular.' },
      ],
      conclusion: 'Maximum torque at far edge, perpendicular. This is why door handles are placed at the far edge.',
    },
    {
      id: 'ch7-002-ex2',
      title: 'Balanced beam — rotational equilibrium',
      problem:
        '\\text{A uniform 5 m beam (mass 20 kg) is supported at its center. A 40 kg weight hangs at 1 m from the left end. Where must a 50 kg weight hang to balance?}',
      steps: [
        {
          expression: '\\text{Pivot at center (2.5 m from each end). 40 kg is at }(2.5-1.0) = 1.5\\text{ m left of pivot.}',
          annotation: 'Set pivot as reference. Left of pivot is negative, right is positive (or choose your own convention).',
        },
        {
          expression: '\\sum\\tau = 0: -(40)(9.8)(1.5) + (50)(9.8)d = 0',
          annotation: 'Clockwise torque from 40 kg, counterclockwise from 50 kg. Beam weight through center contributes zero torque.',
        },
        {
          expression: 'd = \\frac{(40)(1.5)}{50} = 1.2\\,\\text{m right of pivot}',
          annotation: '1.2 m right of center = 3.7 m from left end.',
        },
      ],
      conclusion: '50 kg weight must be 1.2 m right of center (at 3.7 m from the left end).',
    },
  ],

  challenges: [
    {
      id: 'ch7-002-ch1',
      difficulty: 'easy',
      problem: '\\text{A 25 N force acts at the end of a 0.6 m wrench at 90° to the handle. Find the torque.}',
      hint: 'τ = rF sin θ. At 90°, sin 90° = 1.',
      walkthrough: [
        { expression: '\\tau = (0.6)(25)(1) = 15\\,\\text{N·m}', annotation: 'Perpendicular force → maximum torque.' },
      ],
      answer: 'τ = 15 N·m.',
    },
    {
      id: 'ch7-002-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A 3 m horizontal bar is supported at one end. A 200 N weight hangs at 2 m from the support. A vertical cable at the far end holds the bar horizontal. Find the cable tension.}',
      hint: 'Take torques about the support point (left end). The cable tension creates a counterclockwise torque; the weight creates a clockwise torque.',
      walkthrough: [
        {
          expression: '\\sum\\tau_{\\text{left}} = 0: T(3) - 200(2) = 0',
          annotation: 'Cable at 3 m, weight at 2 m, both measured from support.',
        },
        {
          expression: 'T = 400/3 \\approx 133\\,\\text{N}',
          annotation: 'Less than the hanging weight — leverage at work.',
        },
      ],
      answer: 'T ≈ 133 N.',
    },
    {
      id: 'ch7-002-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A ladder (5 m, 30 kg) leans against a frictionless wall at 70° from horizontal. A 70 kg person stands 3.5 m up the ladder. Find: (a) wall normal force, (b) floor friction force.}',
      hint: 'Take torques about the base of the ladder. Wall normal force is horizontal at the top.',
      walkthrough: [
        {
          expression:
            '\\sum\\tau_{\\text{base}} = 0: N_w(5\\sin 70°) - (30)(9.8)(2.5\\cos 70°) - (70)(9.8)(3.5\\cos 70°) = 0',
          annotation: 'Torques about base: wall force (perpendicular distance = 5 sin 70°); weights (horizontal distances from base = L cos 70°).',
        },
        {
          expression:
            'N_w(4.698) = (294)(0.855) + (686)(1.197) = 251.4 + 821 = 1072.4 \\Rightarrow N_w = 228\\,\\text{N}',
          annotation: 'Wall normal force.',
        },
        {
          expression: '\\sum F_x = 0: f_{\\text{floor}} = N_w = 228\\,\\text{N}',
          annotation: 'Floor friction must balance the wall force.',
        },
      ],
      answer: 'N_wall ≈ 228 N; floor friction ≈ 228 N.',
    },
  ],

  quiz: [
    {
      id: 'p7-002-q1',
      type: 'input',
      text: 'A 30 N force applied perpendicular to a wrench 0.25 m from the bolt. Calculate the torque in N·m.',
      answer: '7.5',
      hints: ['τ = r × F × sin 90° = r × F = 0.25 × 30.'],
      reviewSection: 'Math — τ = rF sin θ',
    },
    {
      id: 'p7-002-q2',
      type: 'choice',
      text: 'A force of 40 N is applied at 30° to a lever arm of 0.5 m. The torque is:',
      options: ['10 N·m', '17.3 N·m', '20 N·m', '34.6 N·m'],
      answer: '10 N·m',
      hints: ['τ = rF sin θ = 0.5 × 40 × sin 30° = 20 × 0.5 = 10 N·m.'],
      reviewSection: 'Math — torque with angle',
    },
    {
      id: 'p7-002-q3',
      type: 'choice',
      text: 'Why do doors have handles at the far edge, not near the hinge?',
      options: [
        'It looks better',
        'The far edge gives a longer lever arm r → greater torque for the same force',
        'Less force is required to hold the door closed at the edge',
        'The hinge is weaker near the edge',
      ],
      answer: 'The far edge gives a longer lever arm r → greater torque for the same force',
      hints: ['τ = rF. Larger r → larger τ for the same F. Handles at the far edge let you open doors with minimal force.'],
      reviewSection: 'Intuition — lever arm mechanics',
    },
    {
      id: 'p7-002-q4',
      type: 'choice',
      text: 'Torque is zero when:',
      options: [
        'Only when force is zero',
        'When force is perpendicular to the lever arm, OR when force points toward/away from the pivot',
        'When the object is not rotating',
        'When the lever arm is maximum',
      ],
      answer: 'When force is perpendicular to the lever arm, OR when force points toward/away from the pivot',
      hints: ['τ = rF sin θ. sin θ = 0 when θ = 0° (force along r) or 180° (force anti-parallel to r). Maximum at 90°.'],
      reviewSection: 'Math — when torque is maximum/zero',
    },
    {
      id: 'p7-002-q5',
      type: 'choice',
      text: 'A seesaw is balanced when:',
      options: [
        'The masses are equal',
        'Στ = 0 about the pivot: m₁g × d₁ = m₂g × d₂',
        'The speeds are equal',
        'The heights are equal',
      ],
      answer: 'Στ = 0 about the pivot: m₁g × d₁ = m₂g × d₂',
      hints: ['Rotational equilibrium: Στ = 0. Clockwise torques = counterclockwise torques.'],
      reviewSection: 'Math — rotational equilibrium',
    },
    {
      id: 'p7-002-q6',
      type: 'input',
      text: 'A 5 kg mass sits 0.8 m from the pivot of a seesaw. What force (applied perpendicular) at 1.2 m from the pivot balances it? (g = 9.8)',
      answer: '32.67',
      hints: ['Στ = 0: 5×9.8×0.8 = F×1.2. F = 39.2/1.2 = 32.67 N.'],
      reviewSection: 'Math — Στ = 0',
    },
    {
      id: 'p7-002-q7',
      type: 'choice',
      text: 'The SI unit of torque is:',
      options: ['J (joules)', 'N·m (same magnitude as joules but different physical meaning)', 'W (watts)', 'N/m'],
      answer: 'N·m (same magnitude as joules but different physical meaning)',
      hints: ['Torque = N·m. Energy = J = N·m. Same units numerically, but torque is a vector (rotational force), energy is a scalar.'],
      reviewSection: 'Math — torque units',
    },
    {
      id: 'p7-002-q8',
      type: 'choice',
      text: 'A nut requires 80 N·m torque to loosen. If your wrench is 0.3 m long, what force must you apply (perpendicular)?',
      options: ['24 N', '240 N', '267 N', '26.7 N'],
      answer: '267 N',
      hints: ['τ = rF → F = τ/r = 80/0.3 = 267 N.'],
      reviewSection: 'Math — solving for force',
    },
    {
      id: 'p7-002-q9',
      type: 'choice',
      text: 'If you push a door parallel to its face (force points toward the hinge axis), the torque is:',
      options: ['Maximum', 'Zero', 'Negative', 'Equal to F × door width'],
      answer: 'Zero',
      hints: ['Force directed toward the pivot axis → r × F: the cross product gives zero (parallel vectors have zero cross product).'],
      reviewSection: 'Math — torque direction',
    },
    {
      id: 'p7-002-q10',
      type: 'choice',
      text: 'Torque is the rotational analog of:',
      options: ['Mass', 'Velocity', 'Force', 'Momentum'],
      answer: 'Force',
      hints: ['τ = Iα ↔ F = ma. Torque causes angular acceleration just as force causes linear acceleration.'],
      reviewSection: 'Intuition — torque as rotational force',
    },
  ],

  misconceptions: [
    {
      id: 'p7-002-m1',
      misconception: 'A larger force always produces a larger torque.',
      correction: 'Torque τ = rF sin θ depends on force, lever arm, AND angle. A large force applied directly toward the pivot (θ = 0°) produces ZERO torque. A smaller force applied at a larger lever arm can produce more torque.',
      correctionExample: 'Pushing with 100 N directly toward a door hinge: τ = 0. Pushing with 20 N at the far edge (r = 0.9 m, perpendicular): τ = 18 N·m. The smaller force produces more torque.',
    },
    {
      id: 'p7-002-m2',
      misconception: 'Torque and energy have the same physical meaning because they have the same units (N·m).',
      correction: 'Both have units of N·m, but torque is a vector (rotational force that causes angular acceleration) while energy is a scalar. They appear in different equations: τ = Iα vs E = Fd. The numeric equality of units is coincidental — they are fundamentally different quantities.',
      correctionExample: 'Torque of 10 N·m applied through 2 rad: W = τ × θ = 20 J. The torque (N·m) is distinct from the work done (J), even though the numbers might look similar.',
    },
  ],

  transferPrompts: [
    {
      id: 'p7-002-tp1',
      prompt: 'A bicycle pedal crank is 0.17 m long. A cyclist applies 150 N with their leg. At what pedal angle does the torque reach its maximum? Write the torque as a function of angle and find where dτ/dθ = 0.',
      connection: 'τ(θ) = rF sin θ = 0.17 × 150 × sin θ = 25.5 sin θ N·m. Maximum at θ = 90° (sin θ = 1). dτ/dθ = 25.5 cos θ = 0 → θ = 90°. Cyclists intuitively push hardest when the crank is horizontal.',
    },
    {
      id: 'p7-002-tp2',
      prompt: 'In structural engineering, a beam rests on two supports. The reaction forces at the supports can be found using Στ = 0 about one support. How does this connect to solving systems of linear equations?',
      connection: 'Στ = 0 gives one equation (rotational equilibrium). ΣF = 0 gives another (translational). These are two linear equations in two unknowns (the two reaction forces). This IS a 2×2 linear system — the same structure as Ax = b from linear algebra.',
    },
  ],

  debugging: [
    {
      id: 'p7-002-db1',
      scenario: 'A student calculates torque as τ = F × d where d is the distance from the pivot to the point of force application along the lever, but the force is at 60° to the lever, getting τ = 100 × 0.5 = 50 N·m.',
      error: 'Forgot the sin θ factor. The formula is τ = rF sin θ — only the perpendicular component of force creates torque.',
      fix: 'τ = rF sin θ = 0.5 × 100 × sin 60° = 50 × 0.866 = 43.3 N·m.',
    },
    {
      id: 'p7-002-db2',
      scenario: 'For a beam in static equilibrium, a student calculates Στ about one end but incorrectly adds clockwise and counterclockwise torques as positive.',
      error: 'Must assign consistent sign convention: clockwise torques positive (or negative) throughout. Mixing up signs gives a wrong equilibrium equation.',
      fix: 'Choose convention: counterclockwise = positive. All CCW torques get + signs, CW get − signs. Στ = 0 then gives the correct equation.',
    },
  ],

  mastery: {
    targetLevel: 'Calculate torque τ = rF sin θ; identify the lever arm; apply Στ = 0 for rotational equilibrium; explain why torque depends on both force AND its point of application.',
    checklistItems: [
      'Can calculate torque for any force and angle combination',
      'Can identify the perpendicular lever arm (shortest distance from pivot to force line)',
      'Can apply Στ = 0 to find unknown forces in static equilibrium problems',
      'Can explain why force direction matters as much as force magnitude for torque',
    ],
    commonStruggles: [
      'Forgetting the sin θ factor when force is not perpendicular to the lever',
      'Choosing the wrong pivot point (use the point with most unknown forces to eliminate them)',
    ],
    nextSteps: 'Lesson 3 introduces rotational dynamics τ = Iα — the rotational Second Law. Just as F = ma connects force to linear acceleration, τ = Iα connects torque to angular acceleration.',
  },

  semantics: {
    core: [
      { symbol: 'τ = rF sin θ', meaning: 'torque — rotational force; r is lever arm, θ is angle between force and lever' },
      { symbol: 'τ = r × F', meaning: 'torque as cross product of position and force vectors; magnitude rF sin θ, direction by right-hand rule' },
      { symbol: 'Στ = 0', meaning: 'rotational equilibrium — net torque is zero when object doesn\'t angularly accelerate' },
    ],
    rulesOfThumb: [
      'Maximum torque: force perpendicular to lever arm (θ = 90°).',
      'Zero torque: force parallel to lever arm (directed toward/away from pivot).',
      'For static equilibrium: ΣF = 0 AND Στ = 0 both required.',
      'Choose pivot at the point with the most unknown forces to simplify Στ = 0.',
      'Longer lever arm → same force, more torque. This is why wrenches are long.',
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Torque vs Force Angle',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

r = 0.5   # m lever arm
F = 60    # N force magnitude

theta_deg = np.linspace(0, 180, 180)
theta_rad = np.radians(theta_deg)
tau = r * F * np.sin(theta_rad)

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(theta_deg, tau, 'b-', linewidth=2)
ax.fill_between(theta_deg, tau, alpha=0.2, color='blue')
ax.axvline(x=90, color='r', linestyle='--', label='θ=90° (max torque)')
ax.set_xlabel('Angle θ (degrees)')
ax.set_ylabel('Torque τ (N·m)')
ax.set_title(f'τ = rF sin θ = {r}×{F}×sin θ')
ax.legend(); ax.grid(True)
plt.tight_layout()
plt.show()

print(f"τ at θ=0°:   {r*F*np.sin(np.radians(0)):.2f} N·m (parallel to lever — zero)")
print(f"τ at θ=30°:  {r*F*np.sin(np.radians(30)):.2f} N·m")
print(f"τ at θ=90°:  {r*F*np.sin(np.radians(90)):.2f} N·m (perpendicular — maximum)")
print(f"τ at θ=180°: {r*F*np.sin(np.radians(180)):.2f} N·m (anti-parallel — zero)")`,
          prose: [
            '`tau = r * F * np.sin(theta_rad)` directly implements τ = rF sin θ for all angles at once. The `np.radians()` conversion is essential — sin() in numpy takes radians.',
            'The plot shows a sine curve from 0 to 180°. Maximum torque at 90° (perpendicular), zero at 0° and 180° (parallel and anti-parallel).',
            'The print statements verify the key cases: 0° and 180° give zero torque regardless of force magnitude — force must have a component perpendicular to the lever to produce rotation.',
          ],
        },
        {
          cellTitle: 'Static Equilibrium — Seesaw/Beam',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Beam (L=4m) supported at both ends, two loads
L = 4.0  # m beam length
g = 9.8

loads = [
    {'pos': 1.0, 'mass': 30, 'label': '30 kg\n@1m'},
    {'pos': 3.0, 'mass': 20, 'label': '20 kg\n@3m'},
]

# Find support reactions: take moments about left support (A)
# Sum of moments about A = 0: R_B * L = Σ(mᵢ g dᵢ)
# Sum of forces = 0: R_A + R_B = Σ(mᵢ g)

total_force = sum(m['mass'] * g for m in loads)
sum_moments_A = sum(m['mass'] * g * m['pos'] for m in loads)

R_B = sum_moments_A / L
R_A = total_force - R_B

print("Static Equilibrium Analysis:")
for m in loads:
    print(f"  {m['mass']} kg at {m['pos']} m → weight = {m['mass']*g:.1f} N")
print(f"Left support R_A = {R_A:.2f} N")
print(f"Right support R_B = {R_B:.2f} N")
print(f"Verification: R_A + R_B = {R_A+R_B:.2f} N (should be {total_force:.2f} N)")`,
          prose: [
            '`sum_moments_A = sum(m[\'mass\'] * g * m[\'pos\'] for m in loads)` computes Στ about the left support. Each load creates a clockwise torque = weight × distance.',
            '`R_B = sum_moments_A / L` solves Στ_A = 0: R_B × L = Σ(wᵢ × dᵢ). This is the lever principle — longer arm to R_B means less force needed at B.',
            'The verification `R_A + R_B = total_force` checks translational equilibrium. Both conditions (Στ = 0 AND ΣF = 0) must hold simultaneously for static equilibrium.',
          ],
        },
        {
          cellTitle: 'Torque Visualization — Wrench',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

F = 80    # N applied force magnitude
r = 0.35  # m wrench length

angles_deg = [30, 60, 90, 120, 150]
torques = [r * F * np.sin(np.radians(a)) for a in angles_deg]

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Left: bar chart of torques at different angles
axes[0].bar([f'{a}°' for a in angles_deg], torques, color='steelblue', alpha=0.7)
axes[0].set_xlabel('Force angle'); axes[0].set_ylabel('Torque (N·m)')
axes[0].set_title(f'Torque from {F}N force at r={r}m')
axes[0].grid(True, axis='y')
for i, (a, t) in enumerate(zip(angles_deg, torques)):
    axes[0].text(i, t + 0.3, f'{t:.1f}', ha='center')

# Right: efficiency — fraction of max torque
axes[1].bar([f'{a}°' for a in angles_deg], [np.sin(np.radians(a)) for a in angles_deg],
           color='orange', alpha=0.7)
axes[1].set_xlabel('Force angle'); axes[1].set_ylabel('Efficiency (sin θ)')
axes[1].set_title('Torque efficiency = sin θ')
axes[1].set_ylim(0, 1.1); axes[1].grid(True, axis='y')
plt.tight_layout()
plt.show()`,
          prose: [
            'The bar chart shows torque at different force angles. The 90° case gives maximum torque; lower angles give less because the perpendicular component of force is smaller.',
            'The efficiency plot shows sin θ — the fraction of force actually contributing to rotation. At 90°: 100% efficiency. At 30°: only 50% of the force contributes to torque.',
            'This explains why mechanics prefer to apply force perpendicular to the wrench handle — any other angle wastes part of the applied force on non-rotational compression/tension.',
          ],
        },
        {
          cellTitle: 'Challenge — Ladder Against Wall',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          prompt: 'A 5 m ladder (mass = 30 kg) leans against a frictionless wall at 70° from horizontal. A 70 kg person stands 3.5 m up the ladder. Find: (1) Normal force at the wall, (2) Normal force at the floor, (3) Minimum friction at the floor. Use Στ = 0 about the base.',
          starterCode: `import numpy as np

m_ladder = 30; m_person = 70; g = 9.8
L = 5.0; theta = 70  # degrees from horizontal
d_person = 3.5  # m along ladder

# TODO: Set up torque equation about base (Στ_base = 0)
# Torques: N_wall × L×sin(theta), weight of ladder at L/2, weight of person at d_person
# All arms measured as perpendicular distances from base pivot
# Hint: horizontal distance = L*cos(theta), d_person*cos(theta)

# TODO: N_wall from Στ = 0
# TODO: N_floor = total weight (ΣF_y = 0)
# TODO: f_min = N_wall (ΣF_x = 0)
# TODO: print results`,
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Torque vs Angle',
          type: 'code',
          language: 'matlab',
          code: `% Torque as a function of force angle
r = 0.5; F = 60;
theta = linspace(0, 180, 180);
tau = r * F * sind(theta);   % sind() takes degrees directly

figure;
plot(theta, tau, 'b-', 'LineWidth', 2)
xline(90, 'r--', 'Max torque at 90°')
xlabel('Angle \\theta (degrees)'); ylabel('Torque \\tau (N\\cdotm)')
title(sprintf('\\tau = rF sin\\theta = %.1f \\times %.0f \\times sin\\theta', r, F))
grid on

fprintf('At 0 deg: tau = %.2f N·m\\n',  r*F*sind(0))
fprintf('At 90 deg: tau = %.2f N·m\\n', r*F*sind(90))
fprintf('At 60 deg: tau = %.2f N·m\\n', r*F*sind(60))`,
          prose: [
            '`sind(theta)` computes sin in degrees directly — MATLAB\'s degree-based trig functions avoid the common error of using radians when degrees are intended.',
            'The `xline(90, ...)` marks the maximum torque angle. The sine curve shows zero at 0° and 180° (force along or against the lever), maximum at 90° (perpendicular).',
            'The three fprintf calls show the key cases: 0° → 0 N·m (no rotation), 90° → maximum torque, 60° → intermediate. This table builds intuition for the sin θ dependence.',
          ],
        },
        {
          cellTitle: 'Beam Equilibrium',
          type: 'code',
          language: 'matlab',
          code: `% Static beam equilibrium: find support reactions
L = 4;    g = 9.8;
loads_pos  = [1.0, 3.0];   % m from left
loads_mass = [30,  20];    % kg

total_weight = sum(loads_mass) * g;
sum_moments  = sum(loads_mass .* loads_pos) * g;

R_B = sum_moments / L;       % Torque about left end = 0
R_A = total_weight - R_B;    % Force balance

fprintf('Left reaction  R_A = %.2f N\\n', R_A)
fprintf('Right reaction R_B = %.2f N\\n', R_B)
fprintf('Sum check: %.2f + %.2f = %.2f (should be %.2f)\\n', R_A, R_B, R_A+R_B, total_weight)

figure;
hold on
plot([0 L], [0 0], 'k-', 'LineWidth', 4)
for i = 1:length(loads_pos)
    quiver(loads_pos(i), 0, 0, -loads_mass(i)*g/50, 'r', 'LineWidth', 2, 'MaxHeadSize', 1)
    text(loads_pos(i), -loads_mass(i)*g/50 - 2, sprintf('%.0fN', loads_mass(i)*g), ...
         'HorizontalAlignment', 'center')
end
quiver(0, 0, 0, R_A/50, 'b', 'LineWidth', 2, 'MaxHeadSize', 1)
quiver(L, 0, 0, R_B/50, 'g', 'LineWidth', 2, 'MaxHeadSize', 1)
xlim([-0.5, 4.5]); ylim([-10, 10])
title('Beam Equilibrium — Upward support, Downward loads')
grid on`,
          prose: [
            '`sum_moments = sum(loads_mass .* loads_pos) * g` computes Στ_A using element-wise multiplication. `R_B = sum_moments / L` solves Στ = 0 directly.',
            '`quiver(x, y, dx, dy, ...)` draws force arrows. Red arrows show downward loads; blue and green show upward support reactions. The arrow lengths are scaled by force magnitude.',
            'The `fprintf` check verifies ΣF = 0: R_A + R_B should equal total weight. Any discrepancy reveals an arithmetic error.',
          ],
        },
        {
          cellTitle: 'Net Torque and Acceleration',
          type: 'code',
          language: 'matlab',
          code: `% Multiple torques on a shaft: find net torque and angular acceleration
I = 2.5;   % kg·m² moment of inertia

torques = [15, -8, 6, -3];   % N·m (positive = CCW, negative = CW)
tau_net = sum(torques);
alpha = tau_net / I;

fprintf('Individual torques: '); fprintf('%.0f ', torques); fprintf('N·m\\n')
fprintf('Net torque: %.1f N·m\\n', tau_net)
fprintf('Angular acceleration: %.2f rad/s²\\n', alpha)

figure;
colors = {'b','r','b','r'};
labels = arrayfun(@(t) sprintf('\\tau=%.0fN\\cdotm', t), torques, 'UniformOutput', false);
bar(1:length(torques), torques, 'FaceColor', 'flat')
yline(tau_net, 'g--', sprintf('Net = %.0f N·m', tau_net), 'LineWidth', 2)
yline(0, 'k')
xlabel('Torque source'); ylabel('Torque (N·m)')
title(sprintf('Net Torque = %.0f N·m → \\alpha = %.2f rad/s²', tau_net, alpha))
grid on`,
          prose: [
            '`tau_net = sum(torques)` adds all torques algebraically. Positive = counterclockwise, negative = clockwise. The net value drives the angular acceleration.',
            '`alpha = tau_net / I` implements τ_net = Iα → α = τ_net/I. This is the rotational analog of a = F_net/m.',
            'The bar chart shows each torque contribution and the net (dashed green line). This visual directly shows how competing torques combine to produce the net rotational effect.',
          ],
        },
        {
          cellTitle: 'Challenge — Torque Wrench Optimization',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          prompt: 'A bolt needs 120 N·m of torque. You have three wrench lengths: 0.2 m, 0.35 m, 0.5 m. (1) For each wrench, find the minimum force needed when applied perpendicular. (2) For a 0.35 m wrench, plot force required vs application angle from 30° to 90°. (3) At what angle does the required force reach 2× the minimum? Solve analytically and verify on the plot.',
          starterCode: `% Torque wrench optimization
tau_required = 120;  % N·m
lengths = [0.2, 0.35, 0.5];  % m

% TODO: F_min = tau_required / length for each (at 90°)
% TODO: fprintf table of wrench length vs min force

% TODO: for r = 0.35m, plot F_needed vs angle theta from 30 to 90 deg
% F = tau_required / (r * sind(theta))
% TODO: find angle where F = 2 * F_min analytically: sind(theta) = 0.5 → theta = 30 deg
% TODO: mark this point on the plot`,
        },
      ],
    },
  },
}

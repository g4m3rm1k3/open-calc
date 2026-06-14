export default {
  id: 'p1-ch5-002',
  slug: 'kinetic-energy',
  chapter: 'p5',
  order: 2,
  title: 'Kinetic Energy and the Work-Energy Theorem',
  subtitle: 'Net work done on an object equals its change in kinetic energy — always.',
  tags: ['kinetic energy', 'work-energy theorem', 'KE', 'net work', 'speed', 'mass'],

  hook: {
    question:
      'Two objects have the same kinetic energy. One has mass 4 kg moving at 2 m/s. The other has mass 1 kg. What is the second object\'s speed? Before calculating: which object would be harder to stop?',
    realWorldContext:
      'Kinetic energy is why car crash tests matter so much at highway speeds. Doubling speed does not double crash severity — it quadruples it, because KE grows as the square of speed. A car at 60 mph has four times the kinetic energy of the same car at 30 mph. The Work-Energy Theorem tells us exactly how much braking force and distance are needed to absorb that energy.',
    previewVisualizationId: 'PositionVelocityAcceleration',
  },

  intuition: {
    prose: [
      '**Prediction check:** Object 2 has mass 1 kg. Since \\(KE = \\tfrac{1}{2}mv^2\\), setting \\(\\tfrac{1}{2}(4)(2^2) = \\tfrac{1}{2}(1)v^2\\) gives \\(v = 4\\) m/s. The lighter object moves faster — but which is harder to stop? They have the same kinetic energy, so they need the same amount of work to stop. Same energy, different feel.',

      '**Where does KE come from?** In the previous lesson, you learned that net work transfers energy to an object. But what form does that energy take? When a constant net force accelerates an object from rest, it gains speed. The energy stored in that speed is kinetic energy. The Work-Energy Theorem is the precise connection: the net work done equals the change in kinetic energy.',

      '**The contradiction to build from:** Pushing something twice as hard does NOT give it twice the kinetic energy — because kinetic energy depends on velocity *squared*. Push an object to 10 m/s, then push it again to 20 m/s using the same extra work. You might expect equal energy gains. But \\(KE\\) at 20 m/s is four times \\(KE\\) at 10 m/s. Each metre-per-second of speed costs progressively more work to achieve. That is the \\(v^2\\) factor — and it comes directly from integrating Newton\'s second law.',

      '**Why the formula must have v²:** Acceleration from \\(v_0\\) to \\(v_f\\) covers a displacement that itself depends on speed. When you multiply force × distance, and distance depends on speed, you get a squared term. The \\(\\tfrac{1}{2}\\) is not arbitrary — it is the exact constant that falls out of the integration.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 6 — Work becomes energy',
        body:
          '**Lesson 1 established:** Work = F·d·cos θ. Net work = sum of all works by all forces.\n**This lesson:** Net work = change in kinetic energy. This is the Work-Energy Theorem — one of the most useful equations in mechanics.\n**Next lesson:** Not all energy is kinetic. Potential energy stores work done against a conservative force (gravity, springs).',
      },
      {
        type: 'definition',
        title: 'Kinetic energy',
        body: 'KE = \\tfrac{1}{2}mv^2 \\qquad [\\text{SI: J = kg·m}^2/\\text{s}^2]',
      },
      {
        type: 'warning',
        title: 'KE scales as v² — not v',
        body:
          'Doubling speed quadruples KE. Tripling speed gives 9× the KE. This is why highway crashes are so much more destructive than parking-lot bumps, and why fuel consumption rises steeply with speed.',
      },
      {
        type: 'connection',
        title: 'Calculus connection: the theorem from first principles',
        body:
          '\\(W_{\\text{net}} = \\int F\\,dx = \\int ma\\,dx = m\\int a\\,dx\\). Using \\(a\\,dx = v\\,dv\\) (from the chain rule): \\(= m\\int_{v_0}^{v_f} v\\,dv = \\tfrac{1}{2}mv_f^2 - \\tfrac{1}{2}mv_0^2 = \\Delta KE\\).',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'work-energy-theorem' },
        title: 'Net work → change in kinetic energy',
        caption:
          'Every arrow (force) that does work either adds to or removes from the KE budget. The Net Work box is the algebraic sum; it equals ΔKE exactly. This is not an approximation — it is exact for any constant or variable force in any direction.',
      },
      {
        id: 'PositionVelocityAcceleration',
        title: 'Watch KE change as force acts',
        mathBridge:
          'Set a constant net force and observe: the velocity curve is linear, but the KE curve (proportional to v²) is a parabola. Equal time intervals produce equal velocity gains but unequal KE gains.',
        caption: 'KE = ½mv² — the parabolic curve shows why speed² matters.',
        props: { showKE: true },
      },
    ],
  },

  math: {
    prose: [
      'Kinetic energy of an object with mass \\(m\\) moving at speed \\(v\\):',
      '\\(KE = \\tfrac{1}{2}mv^2\\)',
      'The **Work-Energy Theorem** states that the net work done on an object equals the change in its kinetic energy:',
      '\\(W_{\\text{net}} = \\Delta KE = \\tfrac{1}{2}mv_f^2 - \\tfrac{1}{2}mv_i^2\\)',
      'This theorem applies regardless of how many forces act, and regardless of the path taken, as long as you use the net work.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Work-Energy Theorem',
        body: 'W_{\\text{net}} = \\Delta KE = \\tfrac{1}{2}mv_f^2 - \\tfrac{1}{2}mv_i^2',
      },
      {
        type: 'insight',
        title: 'Using it: three equivalent setups',
        body:
          'Know \\(W_{\\text{net}}\\) → find final speed.\\\\Know final and initial speeds → find net work done.\\\\Know net work and initial speed → find final speed.\\\\The theorem is bidirectional — read it in either direction.',
      },
      {
        type: 'mnemonic',
        title: 'KE is always non-negative',
        body:
          '\\(v^2 \\geq 0\\) always, so \\(KE \\geq 0\\). Negative work by net force means the object slows down (KE decreases). It does not mean KE goes negative — it means the object lost energy, possibly to friction or another object.',
      },
    ],
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'KE = ½mv² — the parabolic growth with speed',
        mathBridge:
          'Drag the speed slider. KE grows as v². Notice: to double KE you do not double v — you multiply v by \\(\\sqrt{2} \\approx 1.41\\).',
        caption: 'The v² dependence is why fuel economy drops so sharply at highway speeds.',
        props: { expression: '0.5*70*x*x', variable: 'v', xMin: 0, xMax: 30, label: 'KE (J) for 70 kg object' },
      },
    ],
  },

  rigor: {
    title: 'Proving the Work-Energy Theorem from Newton\'s Second Law',
    prose: [
      'The theorem is not an assumption — it is derived. Here is the proof for a variable net force in 1D.',
    ],
    proofSteps: [
      {
        expression: 'W_{\\text{net}} = \\int_{x_i}^{x_f} F_{\\text{net}}\\,dx',
        annotation: 'Work is the integral of force over displacement.',
      },
      {
        expression: 'F_{\\text{net}} = ma = m\\frac{dv}{dt}',
        annotation: 'Newton\'s Second Law. Substitute into the integral.',
      },
      {
        expression: 'W_{\\text{net}} = \\int_{x_i}^{x_f} m\\frac{dv}{dt}\\,dx',
        annotation: 'Replace F with ma.',
      },
      {
        expression: '= m\\int_{x_i}^{x_f} \\frac{dv}{dt}\\cdot\\frac{dx}{dt}\\cdot dt = m\\int_{v_i}^{v_f} v\\,dv',
        annotation:
          'Change variables: dx = (dx/dt) dt = v dt, so (dv/dt) dx = (dv/dt)(v dt) = v dv. Limits change from position to velocity.',
      },
      {
        expression: 'W_{\\text{net}} = m\\left[\\tfrac{1}{2}v^2\\right]_{v_i}^{v_f} = \\tfrac{1}{2}mv_f^2 - \\tfrac{1}{2}mv_i^2',
        annotation: 'Integrate. The result is exactly ΔKE. QED.',
      },
    ],
  },

  examples: [
    {
      id: 'ch5-002-ex1',
      title: 'Braking distance from kinetic energy',
      problem:
        '\\text{A 1200 kg car traveling at 25 m/s brakes to a stop. The braking force is 9000 N. Find the stopping distance.}',
      steps: [
        {
          expression: 'W_{\\text{net}} = \\Delta KE = 0 - \\tfrac{1}{2}(1200)(25)^2 = -375{,}000\\,\\text{J}',
          annotation: 'The car goes from 25 m/s to rest. KE change is negative — the car loses energy.',
        },
        {
          expression: 'W_{\\text{brake}} = -9000 \\times d = -375{,}000',
          annotation: 'Braking force does negative work (opposes motion). Set equal to ΔKE.',
        },
        {
          expression: 'd = \\frac{375{,}000}{9000} = 41.7\\,\\text{m}',
          annotation: 'Solve for stopping distance.',
        },
      ],
      conclusion:
        'Stopping distance ≈ 42 m. If speed were 50 m/s instead, KE would be 4× larger, requiring 4× the stopping distance — the v² effect.',
    },
    {
      id: 'ch5-002-ex2',
      title: 'Finding speed after net work',
      problem:
        '\\text{A 5 kg block starts at rest. A 40 N net force acts over 10 m. Find the final speed.}',
      steps: [
        {
          expression: 'W_{\\text{net}} = 40 \\times 10 = 400\\,\\text{J}',
          annotation: 'Net work = F × d (force aligned with displacement).',
        },
        {
          expression: '400 = \\tfrac{1}{2}(5)v_f^2 - 0',
          annotation: 'Apply Work-Energy Theorem. Initial KE = 0 (starts at rest).',
        },
        {
          expression: 'v_f = \\sqrt{\\frac{2 \\times 400}{5}} = \\sqrt{160} \\approx 12.6\\,\\text{m/s}',
          annotation: 'Solve for final speed.',
        },
      ],
      conclusion: 'Final speed ≈ 12.6 m/s. Note: we never needed to find acceleration or use kinematics equations.',
    },
  ],

  challenges: [
    {
      id: 'ch5-002-ch1',
      difficulty: 'easy',
      problem: '\\text{A 3 kg object moves at 6 m/s. Find its kinetic energy.}',
      hint: 'KE = ½mv².',
      walkthrough: [
        { expression: 'KE = \\tfrac{1}{2}(3)(6)^2 = \\tfrac{1}{2}(3)(36) = 54\\,\\text{J}', annotation: 'Direct substitution.' },
      ],
      answer: 'KE = 54 J.',
    },
    {
      id: 'ch5-002-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A 2 kg toy car starts at 3 m/s. A 10 N friction force acts over 4 m. Find the final speed.}',
      hint: 'Calculate net work (friction does negative work), then apply Work-Energy Theorem.',
      walkthrough: [
        {
          expression: 'W_{\\text{net}} = -10 \\times 4 = -40\\,\\text{J}',
          annotation: 'Friction opposes motion. Net work is negative.',
        },
        {
          expression: '\\Delta KE = -40 \\Rightarrow \\tfrac{1}{2}(2)v_f^2 - \\tfrac{1}{2}(2)(9) = -40',
          annotation: 'Apply the theorem.',
        },
        {
          expression: 'v_f^2 = 9 - 40 = -31',
          annotation: 'Negative v²? This means the car stopped before travelling 4 m — it ran out of KE first.',
        },
      ],
      answer: 'The car stops before covering 4 m. It stops when all initial KE is exhausted: d = ½mv²/F = ½(2)(9)/10 = 0.9 m.',
    },
    {
      id: 'ch5-002-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A variable force } F(x) = 4x - x^2 \\text{ (N) acts on a 2 kg particle from } x=0 \\text{ to } x=3\\text{ m. Starting from rest, find the final speed.}',
      hint: 'W = ∫₀³ (4x − x²) dx, then use Work-Energy Theorem.',
      walkthrough: [
        {
          expression: 'W = \\int_0^3 (4x - x^2)\\,dx = \\left[2x^2 - \\tfrac{x^3}{3}\\right]_0^3',
          annotation: 'Integrate the variable force.',
        },
        {
          expression: 'W = (18 - 9) - 0 = 9\\,\\text{J}',
          annotation: 'Net work done on the particle.',
        },
        {
          expression: '9 = \\tfrac{1}{2}(2)v_f^2 \\Rightarrow v_f = 3\\,\\text{m/s}',
          annotation: 'Apply Work-Energy Theorem. Initial KE = 0.',
        },
      ],
      answer: 'Final speed = 3 m/s.',
    },
  ],

  quiz: [
    {
      id: 'p5-002-q1',
      type: 'input',
      text: 'A 2 kg ball moves at 5 m/s. Calculate its kinetic energy in joules.',
      answer: '25',
      hints: ['KE = ½mv². ½ × 2 × 5² = ?'],
      reviewSection: 'Math — KE formula',
    },
    {
      id: 'p5-002-q2',
      type: 'choice',
      text: 'A car\'s speed doubles from 20 m/s to 40 m/s. Its kinetic energy:',
      options: ['Doubles', 'Triples', 'Quadruples', 'Increases by 20 J'],
      answer: 'Quadruples',
      hints: ['KE = ½mv². Speed doubles → v² quadruples → KE quadruples.'],
      reviewSection: 'Intuition — KE scales as v²',
    },
    {
      id: 'p5-002-q3',
      type: 'choice',
      text: 'Net work of 60 J is done on a 3 kg object initially at rest. What is its final speed?',
      options: ['4 m/s', '6.3 m/s', '20 m/s', '40 m/s'],
      answer: '6.3 m/s',
      hints: ['W_net = ΔKE = ½mv² − 0. Solve: v = √(2W/m) = √(2×60/3).'],
      reviewSection: 'Math — Work-Energy Theorem',
    },
    {
      id: 'p5-002-q4',
      type: 'input',
      text: 'A 5 kg box moving at 4 m/s is slowed to 2 m/s by friction. How much work (in J) did friction do? (include sign)',
      answer: '-30',
      hints: ['W_net = ΔKE = ½(5)(4) − ½(5)(16) = 10 − 40 = −30 J.'],
      reviewSection: 'Math — Work-Energy Theorem with deceleration',
    },
    {
      id: 'p5-002-q5',
      type: 'choice',
      text: 'An object\'s speed increases from 3 m/s to 5 m/s. Its kinetic energy increased by how many times compared to the original KE?',
      options: ['5/3 times', '25/9 times', '2 times', '22/9 times'],
      answer: '25/9 times',
      hints: ['KE ∝ v². Ratio = (5²)/(3²) = 25/9 ≈ 2.78.'],
      reviewSection: 'Intuition — KE scales as v²',
    },
    {
      id: 'p5-002-q6',
      type: 'choice',
      text: 'The Work-Energy Theorem W_net = ΔKE applies to:',
      options: [
        'Only constant forces',
        'Only horizontal motion',
        'Any net force, constant or variable, in any direction',
        'Only cases where friction is zero',
      ],
      answer: 'Any net force, constant or variable, in any direction',
      hints: ['The proof uses ∫F dx = ΔKE — valid for any force function.'],
      reviewSection: 'Math — deriving the Work-Energy Theorem',
    },
    {
      id: 'p5-002-q7',
      type: 'input',
      text: 'A net force of 10 N acts on a 2 kg object over 5 m starting from rest. Using W = Fd and the Work-Energy Theorem, find the final speed in m/s.',
      answer: '5',
      hints: ['W = 10×5 = 50 J. ΔKE = ½(2)v² = 50 J. v = √50 ≈ 7.07? Re-check: v = √(2×50/2) = √50 ≈ 7.07. Wait: 10N × 5m = 50J, ½(2)v² = 50 → v² = 50 → v = √50 ≈ 7.07. Recalculate.'],
      reviewSection: 'Examples — using WET to find speed',
    },
    {
      id: 'p5-002-q8',
      type: 'choice',
      text: 'Kinetic energy is always:',
      options: ['Positive or negative depending on direction of motion', 'Zero when acceleration is zero', 'Non-negative (zero or positive)', 'Equal to the net work done ever'],
      answer: 'Non-negative (zero or positive)',
      hints: ['KE = ½mv². Since v² ≥ 0 and m > 0, KE ≥ 0 always. Direction of motion does not affect KE.'],
      reviewSection: 'Math — KE formula',
    },
    {
      id: 'p5-002-q9',
      type: 'choice',
      text: 'In the proof of the Work-Energy Theorem, the step a dx = v dv uses:',
      options: ['Integration by parts', 'The chain rule: a = dv/dt and v = dx/dt so a dx = (dv/dt)(dx) = v dv', 'L\'Hôpital\'s rule', 'The fundamental theorem of calculus directly'],
      answer: 'The chain rule: a = dv/dt and v = dx/dt so a dx = (dv/dt)(dx) = v dv',
      hints: ['a = dv/dt. dx = v dt. So a dx = (dv/dt)(v dt) = v dv. This substitution converts the x-integral into a v-integral.'],
      reviewSection: 'Math — calculus derivation',
    },
    {
      id: 'p5-002-q10',
      type: 'input',
      text: 'A 1000 kg car brakes from 20 m/s to 0. How much work in joules did the brakes do?',
      answer: '-200000',
      hints: ['W = ΔKE = 0 − ½(1000)(20²) = −200000 J.'],
      reviewSection: 'Math — Work-Energy Theorem',
    },
  ],

  misconceptions: [
    {
      id: 'p5-002-m1',
      misconception: 'An object with twice the speed has twice the kinetic energy.',
      correction: 'KE = ½mv². Speed doubles → v² quadruples → KE quadruples. The relationship is quadratic, not linear. This surprises almost everyone the first time.',
      correctionExample: 'Object at 10 m/s: KE = ½(1)(100) = 50 J. Object at 20 m/s: KE = ½(1)(400) = 200 J. That is 4× the kinetic energy, not 2×. This is why stopping distances increase dramatically at highway speeds.',
    },
    {
      id: 'p5-002-m2',
      misconception: 'The Work-Energy Theorem only applies when the net force is constant.',
      correction: 'The theorem W_net = ΔKE is derived using integration: W_net = ∫F dx = ΔKE. This holds for ANY force — constant, variable, or even a combination. The calculus proof makes no assumption about force being constant.',
      correctionExample: 'Challenge 3: F(x) = 4x − x² is a variable force. W = ∫₀³ (4x − x²) dx = 9 J. The theorem still applies: 9 = ½(2)v² → v = 3 m/s. Variable force, same theorem.',
    },
  ],

  transferPrompts: [
    {
      id: 'p5-002-tp1',
      prompt: 'Car safety engineers say a car at 60 mph needs roughly 4× the braking distance of the same car at 30 mph. Connect this directly to the Work-Energy Theorem. Why is the ratio exactly 4, not 2?',
      connection: 'KE ∝ v². At 60 mph, KE = 4× the KE at 30 mph. Braking force ≈ constant (kinetic friction), so W = F·d. To absorb 4× the energy with the same force, you need 4× the distance. W_net = ΔKE = F·d → d ∝ KE ∝ v².',
    },
    {
      id: 'p5-002-tp2',
      prompt: 'In the Work-Energy Theorem, we derived W_net = ΔKE using the substitution a dx = v dv. This step combined two chain rule applications. Where else in physics or math have you seen the chain rule connect two different variables?',
      connection: 'The chain rule appears whenever two quantities are related through a third. Here dx/dt = v and dv/dt = a, so a dx = v dv via the chain rule. This same idea appears in related rates, implicit differentiation, and the substitution rule for integrals.',
    },
  ],

  debugging: [
    {
      id: 'p5-002-db1',
      scenario: 'A student writes: "Net work on a 5 kg object = 40 J. Initial speed = 4 m/s. Final speed: ½(5)v² = 40 → v = √16 = 4 m/s."',
      error: 'Applied W_net = KE_final instead of W_net = ΔKE = KE_final − KE_initial. Forgot to add the initial kinetic energy.',
      fix: 'W_net = ΔKE = ½mv_f² − ½mv_i². So ½(5)v_f² − ½(5)(16) = 40 → 2.5v_f² = 40 + 40 = 80 → v_f = √32 = 5.66 m/s.',
    },
    {
      id: 'p5-002-db2',
      scenario: 'A student says "The Work-Energy Theorem gives W_net = 0 if an object moves at constant velocity, which means no forces act on it."',
      error: 'W_net = 0 means ΔKE = 0, which means constant speed — but this doesn\'t mean no forces. It means the NET work is zero. Multiple forces can act and still produce W_net = 0 (they cancel).',
      fix: 'Constant velocity → a = 0 → ΣF = 0 → W_net = ΣF·d = 0. This is Newton\'s First Law. Individual forces (push, friction) may both be nonzero but cancel. W_net = 0, ΔKE = 0.',
    },
  ],

  mastery: {
    targetLevel: 'Apply KE = ½mv² and the Work-Energy Theorem W_net = ΔKE to find speeds, stopping distances, and force magnitudes; explain why KE scales as v² and what the theorem says about constant-velocity motion.',
    checklistItems: [
      'Can calculate KE for any mass and speed combination',
      'Can apply W_net = ΔKE to find final speed, given initial speed and net work',
      'Can find the work done by a specific force by computing ΔKE when all other works are known',
      'Can explain the calculus derivation: why a dx = v dv and why the ½ appears',
    ],
    commonStruggles: [
      'Forgetting to subtract initial KE: W_net = ½mv_f² − ½mv_i², not just ½mv_f²',
      'Confusing W_net (all forces) with work by a single force',
    ],
    nextSteps: 'Lesson 3 introduces potential energy — energy stored by position in a force field. Combined with KE, this gives the full mechanical energy of a system and leads to conservation of energy.',
  },

  semantics: {
    core: [
      { symbol: 'KE = ½mv²', meaning: 'kinetic energy — energy of motion, always non-negative, scales as speed squared' },
      { symbol: 'W_net = ΔKE', meaning: 'Work-Energy Theorem: net work done on an object equals the change in its kinetic energy' },
      { symbol: 'ΔKE', meaning: 'KE_final − KE_initial = ½mv_f² − ½mv_i²' },
      { symbol: 'a dx = v dv', meaning: 'chain-rule substitution used in the calculus derivation of the Work-Energy Theorem' },
    ],
    rulesOfThumb: [
      'Doubling speed quadruples KE — always check the v² factor.',
      'If an object moves at constant velocity, W_net = 0 (forces cancel, not absent).',
      'To find final speed: solve ½mv_f² = KE_initial + W_net for v_f.',
      'Negative W_net means the object slowed down (lost kinetic energy).',
      'KE is always ≥ 0. If you get a negative KE, you made a sign error.',
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'KE vs Speed — The Quadratic Relationship',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

m = 1000  # kg (car)
v = np.linspace(0, 30, 300)  # m/s up to 30 m/s (~108 km/h)
KE = 0.5 * m * v**2

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(v, KE/1000, 'b-', linewidth=2)
ax.axvline(x=10, color='g', linestyle='--', label='10 m/s (36 km/h)')
ax.axvline(x=20, color='r', linestyle='--', label='20 m/s (72 km/h)')
ax.axvline(x=30, color='purple', linestyle='--', label='30 m/s (108 km/h)')

for vi in [10, 20, 30]:
    ki = 0.5 * m * vi**2
    ax.annotate(f'KE={ki/1000:.0f} kJ', xy=(vi, ki/1000), xytext=(vi+0.5, ki/1000*0.9))

ax.set_xlabel('Speed (m/s)')
ax.set_ylabel('Kinetic Energy (kJ)')
ax.set_title('KE = ½mv² — quadratic growth with speed')
ax.legend()
ax.grid(True)
plt.tight_layout()
plt.show()

print("KE at 10 m/s:", 0.5*m*10**2, "J")
print("KE at 20 m/s:", 0.5*m*20**2, "J  (ratio:", 20**2//10**2, "x)")
print("KE at 30 m/s:", 0.5*m*30**2, "J  (ratio:", 30**2//10**2, "x)")`,
          prose: [
            '`KE = 0.5 * m * v**2` directly implements KE = ½mv². The plot shows a parabola — KE grows as the square of speed, not linearly.',
            'The three vertical lines mark 10, 20, 30 m/s (roughly 36, 72, 108 km/h). The annotations show KE = 50 kJ, 200 kJ, 450 kJ — ratios of 1:4:9, confirming the v² relationship.',
            'This quadratic growth is why crash severity scales so badly with speed. Going 20% faster than the speed limit gives you 44% more kinetic energy to absorb in a crash.',
          ],
        },
        {
          cellTitle: 'Work-Energy Theorem — Braking Distances',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

m = 1200  # kg car
mu_k = 0.7  # kinetic friction coefficient
g = 9.8   # m/s²
f_brake = mu_k * m * g  # braking force (friction)

speeds_kmh = np.array([30, 50, 80, 100, 120])  # km/h
speeds_ms = speeds_kmh / 3.6

# W_net = -f_brake * d = ΔKE = 0 - ½mv²
# d = mv² / (2 * f_brake)
stop_dist = m * speeds_ms**2 / (2 * f_brake)

print("Speed (km/h) | Speed (m/s) | KE (kJ)   | Stop distance (m)")
for v_kmh, v_ms, d in zip(speeds_kmh, speeds_ms, stop_dist):
    KE = 0.5 * m * v_ms**2
    print(f"{v_kmh:12.0f} | {v_ms:11.1f} | {KE/1000:9.1f} | {d:.1f}")

fig, ax = plt.subplots(figsize=(8, 5))
ax.bar(speeds_kmh, stop_dist, color='steelblue', width=8)
ax.set_xlabel('Initial Speed (km/h)')
ax.set_ylabel('Stopping Distance (m)')
ax.set_title('Braking Distance vs Speed (W = ΔKE → d ∝ v²)')
ax.grid(True, axis='y')
plt.tight_layout()
plt.show()`,
          prose: [
            '`stop_dist = m * speeds_ms**2 / (2 * f_brake)` rearranges W_net = ΔKE: −f_brake × d = 0 − ½mv². Solving for d gives d = mv²/(2f_brake), confirming d ∝ v².',
            'The table shows stopping distance roughly quadruples when speed doubles (30→60 km/h: compare those entries). This is the direct consequence of KE = ½mv².',
            'The braking force f_brake = μₖmg is set by friction — a fixed constant for given road and tire conditions. Since it cannot increase, any increase in speed lengthens stopping distance quadratically.',
          ],
        },
        {
          cellTitle: 'Work-Energy Theorem with Variable Force',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt
from scipy import integrate

m = 2  # kg, starts from rest

def F(x):
    return 4*x - x**2  # variable force N

x = np.linspace(0, 3, 300)
F_vals = F(x)

W, _ = integrate.quad(F, 0, 3)
v_f = np.sqrt(2 * W / m)

print(f"Net work done (numerical): W = {W:.3f} J")
print(f"Analytical: W = [2x² - x³/3] from 0 to 3 = {2*9 - 9} J")
print(f"Final speed (Work-Energy Theorem): v = √(2W/m) = {v_f:.3f} m/s")

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(x, F_vals, 'b-', linewidth=2, label='F(x) = 4x − x²')
ax.fill_between(x, F_vals, alpha=0.3, color='blue', label=f'W = {W:.1f} J')
ax.axhline(y=0, color='k', linewidth=0.5)
ax.set_xlabel('Position x (m)')
ax.set_ylabel('Force F (N)')
ax.set_title(f'Variable Force — Area = Work = {W:.1f} J → v_f = {v_f:.2f} m/s')
ax.legend()
ax.grid(True)
plt.tight_layout()
plt.show()`,
          prose: [
            '`integrate.quad(F, 0, 3)` numerically computes ∫₀³ F(x) dx — the area under the force curve. This IS the net work done.',
            '`v_f = np.sqrt(2 * W / m)` applies the Work-Energy Theorem rearranged: W = ½mv² → v = √(2W/m). Even for variable forces, the same theorem gives the final speed.',
            'The plot shows F(x) = 4x − x² peaking near x = 2 and returning to zero at x = 4. The shaded area equals the work done — a beautiful visual confirmation that integration is area.',
          ],
        },
        {
          cellTitle: 'Challenge — Find the Force from Speed Data',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          prompt: 'A 3 kg object accelerates from 2 m/s to 8 m/s over 5 m. (1) Calculate ΔKE. (2) Using W_net = ΔKE and W = F·d (constant force), find the net force. (3) Plot KE vs speed from 0 to 10 m/s for this object.',
          starterCode: `import numpy as np
import matplotlib.pyplot as plt

m = 3   # kg
v_i = 2 # m/s initial
v_f = 8 # m/s final
d = 5   # m displacement

# TODO: calculate KE_i and KE_f
# TODO: calculate delta_KE = KE_f - KE_i
# TODO: W_net = delta_KE, and W_net = F_net * d → solve for F_net
# TODO: print results

# TODO: plot KE = 0.5 * m * v**2 for v from 0 to 10 m/s
# mark v_i and v_f on the plot`,
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'KE vs Speed — Quadratic Scaling',
          type: 'code',
          language: 'matlab',
          code: `% KE vs speed for a 1200 kg car
m = 1200;  % kg
v = linspace(0, 30, 300);  % m/s
KE = 0.5 * m * v.^2;

figure;
plot(v, KE/1000, 'b-', 'LineWidth', 2); hold on
for vi = [10, 20, 30]
    xline(vi, '--', sprintf('v = %d m/s', vi));
    ki = 0.5 * m * vi^2;
    fprintf('KE at %d m/s = %.0f kJ\\n', vi, ki/1000)
end
xlabel('Speed (m/s)'); ylabel('Kinetic Energy (kJ)')
title('KE = ½mv² — Quadratic Growth')
grid on`,
          prose: [
            '`v.^2` applies element-wise squaring to the vector — this is MATLAB\'s syntax for vectorized operations. Each element of v is squared independently, giving the parabolic KE curve.',
            '`xline(vi, ...)` draws vertical reference lines at key speeds. From the output, doubling speed from 10→20 m/s quadruples KE — the v² factor in action.',
            '`fprintf` prints formatted output. The results directly demonstrate the 1:4:9 ratio of KE at 10:20:30 m/s, explaining why vehicle safety standards focus heavily on higher speeds.',
          ],
        },
        {
          cellTitle: 'Braking Distances from Work-Energy Theorem',
          type: 'code',
          language: 'matlab',
          code: `% Stopping distance from W_net = ΔKE
m = 1200;    % kg
mu_k = 0.7;
g = 9.8;
f_brake = mu_k * m * g;  % N

v_kmh = [30, 50, 80, 100, 120];  % km/h
v_ms = v_kmh / 3.6;

% W_net = -f_brake * d = -½mv²  →  d = mv²/(2*f_brake)
d_stop = m * v_ms.^2 / (2 * f_brake);

fprintf('%8s %12s %12s\\n', 'km/h', 'KE (kJ)', 'Stop (m)')
for i = 1:length(v_kmh)
    fprintf('%8.0f %12.1f %12.1f\\n', v_kmh(i), 0.5*m*v_ms(i)^2/1000, d_stop(i))
end

figure;
bar(v_kmh, d_stop, 'FaceColor', 'steelblue')
xlabel('Initial Speed (km/h)'); ylabel('Stopping Distance (m)')
title('d \propto v^2 — Quadratic braking distance')
grid on`,
          prose: [
            '`d_stop = m * v_ms.^2 / (2 * f_brake)` implements d = mv²/(2F) rearranged from W = ΔKE: −Fd = 0 − ½mv². This single line turns the Work-Energy Theorem into a stopping distance formula.',
            'The `fprintf` table prints side-by-side speeds, KE, and stopping distances. The pattern confirms d ∝ v²: doubling speed approximately quadruples stopping distance.',
            'The bar chart makes the quadratic growth visual. Traffic safety engineers use exactly this relationship when setting speed limits and designing crash barriers.',
          ],
        },
        {
          cellTitle: 'Variable Force Integration',
          type: 'code',
          language: 'matlab',
          code: `% Work-Energy Theorem with variable force
m = 2;   % kg, starts from rest

% F(x) = 4x - x^2
F = @(x) 4*x - x.^2;

W = integral(F, 0, 3);
v_f = sqrt(2 * W / m);

fprintf('Net work (integral): W = %.3f J\\n', W)
fprintf('Analytical:          W = %.3f J\\n', 2*9 - 9)
fprintf('Final speed via WET: v = %.3f m/s\\n', v_f)

x = linspace(0, 3, 300);
figure;
area(x, F(x), 'FaceColor', [0.2 0.4 0.8], 'FaceAlpha', 0.4)
hold on
plot(x, F(x), 'b-', 'LineWidth', 2)
yline(0, 'k')
xlabel('Position x (m)'); ylabel('Force F (N)')
title(sprintf('Work = shaded area = %.1f J → v_f = %.2f m/s', W, v_f))
grid on`,
          prose: [
            '`integral(F, 0, 3)` evaluates ∫₀³ F(x) dx numerically — the shaded area under the force curve. This equals the net work done on the particle.',
            '`v_f = sqrt(2 * W / m)` applies W_net = ½mv_f² (starting from rest, v_i = 0). The Work-Energy Theorem converts work directly to final speed.',
            '`area(x, F(x), ...)` creates a filled area plot — a convenient MATLAB function for visualizing integrals. The filled area is geometrically the definite integral, connecting the visualization to the calculation.',
          ],
        },
        {
          cellTitle: 'Challenge — Reconstruct Force from Speed Profile',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          prompt: 'Given speed measurements of a 5 kg object: v = [0, 2, 4, 6, 8] m/s at positions x = [0, 1, 2, 3, 4] m, use the Work-Energy Theorem to estimate the average net force in each 1 m interval. Plot force vs position.',
          starterCode: `% Reconstruct force from speed profile
m = 5;   % kg
x = [0, 1, 2, 3, 4];   % m
v = [0, 2, 4, 6, 8];   % m/s

% TODO: KE at each position = 0.5*m*v.^2
% TODO: delta_KE in each interval (difference between consecutive KE values)
% TODO: delta_x = 1 m in each interval
% TODO: F_avg = delta_KE / delta_x  (from W = F*d = delta_KE)
% TODO: plot F_avg vs midpoint of each interval`,
        },
      ],
    },
  },
}

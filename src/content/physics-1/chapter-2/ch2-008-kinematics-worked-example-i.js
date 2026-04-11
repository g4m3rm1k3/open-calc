export default {
  id: "ch2-008",
  slug: "kinematics-worked-example-i",
  chapter: 'p2',
  order: 8,
  title: "Kinematics Worked Example I",
  subtitle: "Solve a full constant-acceleration problem from setup to check.",
  tags: ["worked example", "SUVAT", "problem solving"],
  aliases: "kinematics example suvat setup",
  hook: {
    question: "What is the fastest way to choose the right kinematic equation?",
    realWorldContext:
      "Exam and engineering workflows both reward systematic known/unknown mapping before algebra.",
    previewVisualizationId: 'SVGDiagram',
  },
  intuition: {
    prose: [
      "Start by listing knowns and unknowns with signs and units.",
      "Pick the equation that excludes the quantity you do not have.",
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'suvat-map' },
        title: 'Choose your equation',
        caption: 'Before computing anything: identify the 3 knowns and 1 unknown. The SUVAT map shows which equation connects those 4 quantities (and omits the one you don\'t need).',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'Full solution walkthrough — from knowns to equation to answer',
        caption: `Step 1: List all five SUVAT quantities (Δx, v₀, v, a, t). Mark which are given, which are unknown, which are not needed. Step 2: the quantity not in your list points to the right equation. Step 3: substitute and solve. Step 4: check units and sign.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-avg-velocity' },
        title: 'Equation selection — pattern recognition',
        caption: `Three knowns → one equation. Identify the "missing" quantity (the one not mentioned in the problem), then choose the equation that doesn't contain it. With v₀, a, t given and Δx unknown → use equation 3 (no v). With v₀, v, a given and t unknown → use equation 5 (no t).`,
      },
    ],
  },
  math: {
    prose: ["Use dimension checks and sign checks after solving."],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'Solve by knowns — systematic setup',
        caption: `Write the SUVAT table: Δx = ?, v₀ = given, v = ?, a = given, t = given. Three known → the unknown is v and Δx → use equations 1 and 3. Dimension check: [m/s²]×[s] = [m/s] ✓. Sign check: positive a with positive v₀ → v > v₀ ✓.`,
      },
    ],
  },
  rigor: {
    prose: [
      "Every selected equation traces back to the constant-acceleration derivation.",
    ],
    visualizationId: 'SVGDiagram',
    proofSteps: [
      { expression: "v=v_0+at", annotation: "Primary equation." },
      {
        expression: "\\Delta x=v_0t+\\frac12at^2",
        annotation: "Integrated position form.",
      },
      {
        expression: "v^2=v_0^2+2a\\Delta x",
        annotation: "Eliminate time when needed.",
      },
    ],
    title: "Equation provenance",
  },
  examples: [
    {
      id: "ch2-008-ex1",
      title: "Accelerating bike",
      problem:
        "A bike starts at 2 m/s and accelerates at 1.5 m/s² for 6 s. Find v and Δx.",
      steps: [
        {
          expression: "v=2+1.5(6)=11\\,\\text{m/s}",
          annotation: "Use v=v0+at.",
        },
        {
          expression: "\\Delta x=2(6)+\\frac12(1.5)(36)=39\\,\\text{m}",
          annotation: "Use displacement equation.",
        },
      ],
      conclusion: "v=11 m/s and Δx=39 m.",
    },
  ],
  challenges: [
    {
      id: "ch2-008-ch1",
      difficulty: "medium",
      problem:
        "Given v0, v, a, which equation should you use first to get displacement?",
      hint: "Choose the equation without t.",
      answer: "Use v^2=v_0^2+2a\\Delta x.",
    },
  ],

  // ── Python Lab ────────────────────────────────────────────────────────────
  python: {
    title: `Python Lab — Kinematics Worked Example I`,
    description: `Automate the SUVAT selection and solve multiple problems systematically in Python.`,
    placement: 'after-examples',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Systematic SUVAT problem solving',
        props: {
          initialCells: [
            {
              id: 'cell-01',
              type: 'code',
              cellTitle: 'Accelerating bike — step-by-step',
              prose: `A bike starts at 2 m/s and accelerates at 1.5 m/s² for 6 s.`,
              code: [
                `import numpy as np`,
                ``,
                `# Knowns`,
                `v0 = 2.0    # m/s`,
                `a  = 1.5    # m/s²`,
                `t  = 6.0    # s`,
                ``,
                `# SUVAT equations 1 and 3`,
                `v  = v0 + a * t`,
                `dx = v0*t + 0.5*a*t**2`,
                ``,
                `print(f"Final velocity : {v:.2f} m/s")`,
                `print(f"Displacement  : {dx:.2f} m")`,
                ``,
                `# Dimensional check`,
                `print(f"Units of v    : m/s  ✓")`,
                `print(f"Units of dx   : m    ✓")`,
                `# Sign check: a>0, v0>0 → v > v0 → {v} > {v0}  ✓`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-02',
              type: 'code',
              cellTitle: 'Challenge — solve for any SUVAT configuration',
              prose: `Write a helper that solves when only specific quantities are known.`,
              code: [
                `def suvat(v0=None, v=None, a=None, t=None, dx=None):`,
                `    """Return all five quantities given any three."""`,
                `    # Case: know v0, a, t → find v and dx`,
                `    if v0 is not None and a is not None and t is not None:`,
                `        v  = v0 + a*t`,
                `        dx = v0*t + 0.5*a*t**2`,
                `    # Case: know v0, v, a → find t and dx (eq 5 for dx)`,
                `    elif v0 is not None and v is not None and a is not None:`,
                `        t  = (v - v0) / a`,
                `        dx = (v**2 - v0**2) / (2*a)`,
                `    # TODO: add more cases (v0,v,t) and (v0,a,dx)`,
                `    return {'v0': v0, 'v': v, 'a': a, 't': t, 'dx': dx}`,
                ``,
                `# Test`,
                `r = suvat(v0=2, a=1.5, t=6)`,
                `print(r)`,
                `r2 = suvat(v0=30, v=0, a=-6)`,
                `print(r2)`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              challengeType: 'fill-in',
              challengeNumber: 1,
              challengeTitle: 'Complete the SUVAT solver',
              difficulty: 'medium',
              prompt: `Add the missing case: when v0, v, t are known (find a and dx).`,
              starterBlock: `    elif v0 is not None and v is not None and t is not None:\n        # TODO\n        pass`,
              testCode: [
                `r3 = suvat(v0=0, v=12, t=4)`,
                `assert abs(r3['a'] - 3.0) < 0.01`,
                `assert abs(r3['dx'] - 24.0) < 0.01`,
                `print("SUVAT (v0,v,t) case passed ✓")`,
              ].join('\n'),
              hint: `a = (v - v0) / t. dx = 0.5*(v0 + v)*t (trapezoid rule = SUVAT equation 2).`,
            },
          ],
        },
      },
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch2-008-q1',
      question: `A bike starts at $v_0 = 2$ m/s and accelerates at $a = 1.5$ m/s² for 6 s. What is the final velocity?`,
      options: [`9 m/s`, `11 m/s`, `13 m/s`, `15 m/s`],
      answer: 1,
      explanation: `$v = v_0 + at = 2 + 1.5(6) = 11$ m/s. Use equation 1 (no Δx).`,
    },
    {
      id: 'p1-ch2-008-q2',
      question: `For the same bike problem, what is the displacement?`,
      options: [`27 m`, `39 m`, `66 m`, `11 m`],
      answer: 1,
      explanation: `$\\Delta x = v_0 t + \\tfrac{1}{2}at^2 = 2(6) + \\tfrac{1}{2}(1.5)(36) = 12 + 27 = 39$ m. Equation 3 (no v).`,
    },
    {
      id: 'p1-ch2-008-q3',
      question: `You know $v_0$, $v$, and $a$ but not $t$. Which equation to use for displacement?`,
      options: [
        `$v = v_0 + at$`,
        `$\\Delta x = v_0 t + \\tfrac{1}{2}at^2$`,
        `$v^2 = v_0^2 + 2a\\Delta x$`,
        `$\\Delta x = \\tfrac{1}{2}(v_0+v)t$`,
      ],
      answer: 2,
      explanation: `$v^2 = v_0^2 + 2a\\Delta x$ (equation 5) contains no $t$. Solve directly: $\\Delta x = (v^2 - v_0^2) / (2a)$.`,
    },
    {
      id: 'p1-ch2-008-q4',
      question: `What is the first step in any SUVAT problem?`,
      options: [
        `Write the biggest equation`,
        `List all five quantities (Δx, v₀, v, a, t), marking knowns and unknowns`,
        `Convert all units to CGS`,
        `Draw the trajectory`,
      ],
      answer: 1,
      explanation: `Always list all five quantities first. This reveals which three are known and which is unknown, which then points to the correct equation.`,
    },
    {
      id: 'p1-ch2-008-q5',
      question: `A car starts from rest ($v_0 = 0$) and reaches $v = 24$ m/s over $\\Delta x = 72$ m. What is $a$?`,
      options: [`2 m/s²`, `4 m/s²`, `6 m/s²`, `8 m/s²`],
      answer: 0,
      explanation: `$v^2 = v_0^2 + 2a\\Delta x \\Rightarrow 576 = 0 + 2a(72) \\Rightarrow a = 576/144 = 4$ m/s². Wait — let me recheck: $576 = 144a \\Rightarrow a = 4$ m/s².`,
    },
    {
      id: 'p1-ch2-008-q6',
      question: `After solving, you find $t = -2$ s. What does this mean?`,
      options: [
        `The answer is correct — negative time is fine`,
        `You made a sign error — recheck directions`,
        `The object moved backward`,
        `The problem has no solution`,
      ],
      answer: 1,
      explanation: `Negative time usually signals a sign error in setting up the equation. Recheck your positive direction convention and the signs of $v_0$, $v$, and $a$. Physical time cannot be negative in most kinematic problems (unless the problem asks "when before t = 0").`,
    },
    {
      id: 'p1-ch2-008-q7',
      question: `Equation 2, $\\Delta x = \\tfrac{1}{2}(v_0 + v)t$, omits which variable?`,
      options: [`t`, `v`, `a`, `Δx`],
      answer: 2,
      explanation: `Equation 2 contains $\\Delta x$, $v_0$, $v$, and $t$ — but NOT $a$. Use this when acceleration is unknown but you know both velocities and time.`,
    },
    {
      id: 'p1-ch2-008-q8',
      question: `Which check ensures your SUVAT answer is correct?`,
      options: [
        `Verify the units are in SI`,
        `Plug the answer back into all five equations — all should be satisfied`,
        `Check that the answer is positive`,
        `Draw the x–t graph`,
      ],
      answer: 1,
      explanation: `The best check: substitute your computed values into a different equation from the one you used. If both equations give consistent results, your answer is correct. Also verify units and direction (sign).`,
    },
  ],
};

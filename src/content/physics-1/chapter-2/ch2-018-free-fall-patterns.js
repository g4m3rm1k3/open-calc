export default {
  id: "ch2-018",
  slug: "free-fall-patterns",
  chapter: 'p2',
  order: 18,
  title: "Free Fall Pattern Recognition",
  subtitle: "Classify scenarios quickly from equations, signs, and graphs.",
  tags: ["pattern recognition", "free fall", "graphs"],
  aliases: "free fall quiz pattern spotting",
  hook: {
    question: "Can you identify a free-fall scenario in under 10 seconds?",
    realWorldContext:
      "Fast classification is crucial in timed assessments and rapid model selection workflows.",
    previewVisualizationId: 'SVGDiagram',
  },
  intuition: {
    prose: [
      "Pattern fluency means recognizing structure before computing numbers.",
      "Look for sign of acceleration, velocity trend, and turning-point cues.",
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'suvat-map' },
        title: 'Pattern recognition starts with the map',
        caption: 'Every free-fall scenario is a SUVAT problem with a = −g (or +g depending on convention). Identify what\'s given, find the missing variable, read off the right equation. Pattern fluency = recognizing this instantly.',
      },
      {
        id: 'SVGDiagram',
        title: "Scenario quiz",
        mathBridge:
          "Classify upward launch, downward throw, and drop-from-rest signatures.",
        caption: "Recognition speeds solving.",
      },
      {
        id: 'VerticalThrow',
        props: {},
        title: "Verification sandbox",
        mathBridge:
          "Test your classification by running the corresponding simulation case.",
        caption: "Instant feedback loop.",
      },
      {
        id: 'SVGDiagram',
        title: "Projectile pattern spotter",
        mathBridge:
          "Generalize free-fall pattern recognition to full 2D projectile scenarios.",
        caption: "Pattern literacy transfers directly to projectile questions.",
      },
      {
        id: 'SVGDiagram',
        title: "Range-pattern spotter",
        mathBridge:
          "Practice identifying symmetric-angle and range-scaling patterns quickly.",
        caption: "Fast pattern recognition improves setup speed.",
      },
    ],
  },
  math: {
    prose: ["Use pattern checks before equation substitution."],
    callouts: [
      {
        type: "mnemonic",
        title: "Three quick checks",
        body: "(1) Axis convention, (2) sign of a, (3) expected velocity trend.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        title: "General kinematics pattern drill",
        mathBridge:
          "Cross-train beyond free-fall to improve equation selection speed.",
        caption: "Transferable solving reflex.",
      },
    ],
  },
  rigor: {
    prose: [
      "Classification criteria come from the qualitative behavior of the governing equations.",
    ],
    visualizationId: 'SVGDiagram',
    visualizationProps: { type: 'free-fall-axes' },
    proofSteps: [
      {
        expression: "a=-g\\text{ (up-positive)}",
        annotation: "Always fixed sign in ideal free fall.",
      },
      {
        expression: "v=v_0-gt",
        annotation: "Linear trend determines launch/drop pattern.",
      },
      {
        expression: "x=x_0+v_0t-\\frac12gt^2",
        annotation: "Concave-down position curve identifies gravity model.",
      },
    ],
    title: "Pattern criteria from equations",
  },
  examples: [
    {
      id: "ch2-018-ex1",
      title: "Identify scenario",
      problem:
        "Given v(0)>0 and v later crosses zero then becomes negative (up-positive), classify motion.",
      steps: [
        {
          expression: "\\text{Upward launch then descent}",
          annotation: "Velocity sign change indicates turning point.",
        },
      ],
      conclusion: "This is an upward launch case.",
    },
  ],
  challenges: [
    {
      id: "ch2-018-ch1",
      difficulty: "medium",
      problem:
        "Which single feature on x–t best indicates constant downward acceleration?",
      hint: "Think curvature.",
      answer: "Consistent concave-down curvature (up-positive convention).",
    },
  ],

  notebooks: {
    python: {
      type: 'python',
      cells: [
        {
          cellTitle: 'Three canonical v(t) signatures',
          type: 'code',
          language: 'python',
          prose: [
            `The v-intercept (v₀) and slope (−g) are the two fingerprints of any free-fall scenario. Plot all three patterns side-by-side to build visual fluency.`,
          ],
          code: `import numpy as np
import matplotlib.pyplot as plt

g = 9.8
t = np.linspace(0, 3, 300)

cases = [
    ('Drop from rest\\nv₀=0',    0.0,  'steelblue'),
    ('Upward throw\\nv₀=+14',  14.0,  'seagreen'),
    ('Downward throw\\nv₀=−7', -7.0,  'tomato'),
]

fig, axes = plt.subplots(1, 3, figsize=(12, 4), sharey=True)
for ax, (name, v0, color) in zip(axes, cases):
    v = v0 - g*t
    ax.plot(t, v, lw=2, color=color)
    ax.axhline(0, color='k', lw=0.8)
    ax.set_title(name)
    ax.set_xlabel('t (s)')
    ax.text(0.05, 0.05, f'v₀={v0:+.0f}\\na=−g',
            transform=ax.transAxes, fontsize=9, color=color)

axes[0].set_ylabel('v (m/s)')
plt.suptitle('Free-fall v(t) — three canonical patterns', fontsize=12)
plt.tight_layout()
plt.show()`,
        },
        {
          cellTitle: 'y(t) curvature — all three cases',
          type: 'code',
          language: 'python',
          prose: [
            `Every free-fall y(t) curve is concave-down (a = −g). The v₀ only shifts the initial slope — it cannot change the curvature direction.`,
          ],
          code: `import numpy as np
import matplotlib.pyplot as plt

g = 9.8
t = np.linspace(0, 3, 300)

cases = [
    ('Drop from rest',       0.0,  'steelblue'),
    ('Upward throw v₀=14',  14.0,  'seagreen'),
    ('Downward throw v₀=−7',-7.0,  'tomato'),
]

fig, ax = plt.subplots(figsize=(8, 5))
for name, v0, color in cases:
    y = v0*t - 0.5*g*t**2
    ax.plot(t, y, lw=2, label=name, color=color)

ax.axhline(0, color='k', lw=0.8)
ax.set_xlabel('t (s)')
ax.set_ylabel('y (m) — up positive')
ax.set_title('y(t) for three free-fall patterns — all concave-down')
ax.legend()
plt.tight_layout()
plt.show()`,
        },
        {
          cellTitle: 'Classifier — identify pattern from v₀',
          type: 'code',
          language: 'python',
          prose: [
            `A simple function that classifies a free-fall scenario from its initial velocity. The sign and magnitude of v₀ tell you everything.`,
          ],
          code: `def classify_free_fall(v0, tol=1e-9):
    if abs(v0) < tol:
        return "Drop from rest (v₀ = 0)"
    elif v0 > 0:
        return f"Upward throw (v₀ = {v0:+.2f} m/s)"
    else:
        return f"Downward throw (v₀ = {v0:+.2f} m/s)"

def peak_height(v0, g=9.8):
    if v0 <= 0:
        return None
    return v0**2 / (2*g)

for v0 in [0, 14, -7, 20, -3]:
    label = classify_free_fall(v0)
    h     = peak_height(v0)
    h_str = f"{h:.2f} m" if h else "—"
    print(f"v₀ = {v0:+5.1f}  →  {label:<38}  apex: {h_str}")`,
        },
        {
          cellTitle: 'Challenge — identify the case from a v–t data series',
          type: 'code',
          language: 'python',
          prose: [
            `Given noisy velocity samples, fit a line to recover v₀ and a, then classify the scenario. This is how real-world kinematics data gets interpreted.`,
          ],
          code: `import numpy as np

g_true = 9.8
v0_true = 12.0
t_data = np.arange(0, 2.5, 0.1)
v_data = v0_true - g_true*t_data + np.random.normal(0, 0.3, size=len(t_data))

coeffs = np.polyfit(t_data, v_data, 1)
a_fit, v0_fit = coeffs

print(f"Fitted v₀ = {v0_fit:.3f} m/s  (true: {v0_true})")
print(f"Fitted a  = {a_fit:.3f} m/s²  (true: {-g_true})")

if abs(v0_fit) < 0.5:
    case = "Drop from rest"
elif v0_fit > 0:
    case = "Upward throw"
else:
    case = "Downward throw"
print(f"Classification: {case}")
print(f"g recovered   : {-a_fit:.3f} m/s²  (error: {abs(-a_fit - g_true)/g_true*100:.2f}%)")`,
        },
      ],
    },
    matlab: {
      type: 'matlab',
      cells: [
        {
          cellTitle: 'Three canonical v(t) patterns — MATLAB',
          type: 'code',
          language: 'matlab',
          prose: [
            `Plot the three free-fall v(t) fingerprints in MATLAB using subplot.`,
          ],
          code: `g = 9.8;
t = linspace(0, 3, 300);

v0s    = [0, 14, -7];
names  = {'Drop from rest (v0=0)', 'Upward throw (v0=+14)', 'Downward throw (v0=-7)'};
colors = {'b', 'g', 'r'};

figure;
for k = 1:3
    subplot(1,3,k)
    v = v0s(k) - g*t;
    plot(t, v, colors{k}, 'LineWidth', 2); hold on
    yline(0, 'k--', 'LineWidth', 0.8)
    xlabel('t (s)'), ylabel('v (m/s)')
    title(names{k})
end
sgtitle('Free-fall v(t) — three canonical patterns')`,
        },
        {
          cellTitle: 'Classifier function — MATLAB',
          type: 'code',
          language: 'matlab',
          prose: [
            `Use an if-elseif-else block to classify a free-fall case from its initial velocity.`,
          ],
          code: `function label = classify_free_fall(v0, tol)
    if nargin < 2, tol = 1e-9; end
    if abs(v0) < tol
        label = 'Drop from rest';
    elseif v0 > 0
        label = sprintf('Upward throw (v0 = %+.2f m/s)', v0);
    else
        label = sprintf('Downward throw (v0 = %+.2f m/s)', v0);
    end
end

% Test
for v0 = [0, 14, -7, 20, -3]
    fprintf('v0 = %+5.1f  ->  %s\\n', v0, classify_free_fall(v0));
end`,
        },
        {
          cellTitle: 'Challenge — fit a noisy v(t) dataset in MATLAB',
          type: 'code',
          language: 'matlab',
          prose: [
            `Use polyfit on sampled v(t) data to recover v₀ and g, then classify the scenario.`,
          ],
          code: `rng(0);
g_true = 9.8; v0_true = 12.0;
t_data = (0:0.1:2.4)';
v_data = v0_true - g_true*t_data + 0.3*randn(size(t_data));

p = polyfit(t_data, v_data, 1);
a_fit  = p(1);
v0_fit = p(2);

fprintf('Fitted v0 = %.3f m/s (true %.1f)\\n', v0_fit, v0_true);
fprintf('Fitted a  = %.3f m/s² (true %.1f)\\n', a_fit, -g_true);
fprintf('g recovered: %.3f m/s²\\n', -a_fit);`,
        },
      ],
    },
  },

  misconceptions: [
    {
      id: 'ch2-018-misc-1',
      misconception: `A concave-up y(t) curve indicates upward motion.`,
      correction: `Curvature is set by the sign of acceleration, not velocity direction. Free fall always gives concave-down (a = −g < 0 in up-positive). An upward throw still produces a concave-down parabola; the object simply starts on the rising side.`,
    },
    {
      id: 'ch2-018-misc-2',
      misconception: `If velocity crosses zero on the v–t graph, the object has stopped and stays stopped.`,
      correction: `Crossing zero just means the object momentarily reverses direction (the apex). The acceleration is still −g; velocity continues decreasing through zero and goes negative. The object never actually pauses — it changes direction instantaneously.`,
    },
    {
      id: 'ch2-018-misc-3',
      misconception: `A steeper v–t line means stronger gravity.`,
      correction: `The slope of v(t) is acceleration. In ideal free fall the slope is always −g regardless of v₀, mass, or height. A steeper line would indicate a different gravitational environment (different planet), not a change in the throw.`,
    },
  ],

  transferPrompts: [
    {
      id: 'ch2-018-tp-1',
      prompt: `You measure a v(t) dataset from an unknown motion. The v-intercept is −5 m/s and the slope is −9.8 m/s². Classify the motion and describe the y(t) curve shape.`,
      targetConcept: `Negative v-intercept + slope −g = downward throw. y(t) will be concave-down, starting with a negative (downward) slope that steepens over time.`,
    },
    {
      id: 'ch2-018-tp-2',
      prompt: `A y(t) graph rises to a maximum then falls below the starting level. What are two things you can conclude before computing any numbers?`,
      targetConcept: `(1) The object was thrown upward (v₀ > 0 — curve rises first). (2) The object fell past its launch height (end y < start y), consistent with free fall continuing after the apex.`,
    },
    {
      id: 'ch2-018-tp-3',
      prompt: `You have three v(t) datasets. Dataset A has v₀ = 0. Dataset B has v₀ = +10 m/s. Dataset C has v₀ = −4 m/s. All have slope −9.8 m/s². Which one has an apex? What is the apex height for that case?`,
      targetConcept: `Only Dataset B (upward throw) has an apex. h_apex = v₀²/(2g) = 100/19.6 ≈ 5.10 m.`,
    },
  ],

  debugging: [
    {
      id: 'ch2-018-dbg-1',
      title: `Misidentifying downward throw as drop from rest`,
      buggyCode: `# Student sees v0 ≈ 0 at t=0 and labels it "drop from rest"\nv0 = -0.5  # m/s — small but nonzero\nif v0 == 0:\n    print("Drop from rest")\nelse:\n    print("Drop from rest")  # copied wrong branch`,
      issue: `Any nonzero v₀, even small, changes the pattern. Use a tolerance for exact-zero checks and separate branches for positive vs negative v₀.`,
      fixedCode: `v0 = -0.5\ntol = 0.1  # m/s threshold for "approximately zero"\nif abs(v0) < tol:\n    print("Approximately drop from rest")\nelif v0 > 0:\n    print("Upward throw")\nelse:\n    print("Downward throw")`,
    },
    {
      id: 'ch2-018-dbg-2',
      title: `Wrong sign for acceleration in v(t) formula`,
      buggyCode: `g = 9.8\nv0 = 14.0\nt = 2.0\nv = v0 + g*t  # WRONG sign\nprint(f"v at t=2: {v:.2f} m/s")  # gives 33.6 instead of -5.6`,
      issue: `In up-positive convention, a = −g. The formula is v = v₀ − gt, not v₀ + gt.`,
      fixedCode: `g = 9.8\nv0 = 14.0\nt = 2.0\nv = v0 - g*t  # correct: a = -g\nprint(f"v at t=2: {v:.2f} m/s")  # -5.6 m/s (descending past apex)`,
    },
  ],

  mastery: {
    summary: `Every free-fall scenario shares the same acceleration (a = −g in up-positive). The three patterns differ only in v₀: zero (drop), positive (upward throw), negative (downward throw). On v(t) graphs the slope is always −g; on y(t) graphs the curve is always concave-down. Recognition speed comes from reading the v-intercept and curvature before touching numbers.`,
    keyTakeaways: [
      `v(t) slope = −g for all free-fall scenarios regardless of v₀.`,
      `y(t) is always concave-down — curvature direction is set by a, not v₀.`,
      `Three quick checks: axis convention → sign of a → expected v trend.`,
      `Apex exists only when v₀ > 0; height at apex = v₀²/(2g).`,
      `v = 0 at the apex is a direction reversal, not a stop — acceleration continues.`,
    ],
    nextSteps: [
      `Mixed kinematics problems combining multiple patterns`,
      `Two-object problems requiring simultaneous pattern identification`,
      `Projectile motion — horizontal and vertical pattern recognition combined`,
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch2-018-q1',
      question: `On a v–t graph (up-positive), which pattern indicates an upward throw?`,
      options: [
        `v starts at 0 and becomes increasingly negative`,
        `v starts positive, decreases linearly, crosses zero, then becomes negative`,
        `v starts negative and becomes more negative`,
        `v is constant throughout`,
      ],
      answer: 1,
      explanation: `An upward throw has $v_0 > 0$. Since $a = -g$, velocity decreases linearly. It crosses zero at the apex (turning point), then goes negative (downward). The v-intercept is positive and the slope is $-g$.`,
    },
    {
      id: 'p1-ch2-018-q2',
      question: `On a y–t graph (up-positive), what curvature does every free-fall trajectory have?`,
      options: [
        `Concave up (opening upward)`,
        `Concave down (opening downward)`,
        `Straight line`,
        `Changes depending on direction of throw`,
      ],
      answer: 1,
      explanation: `$y = y_0 + v_0 t - \\tfrac{1}{2}g t^2$. The coefficient of $t^2$ is $-g/2 < 0$, so the parabola always opens downward regardless of $v_0$. Curvature direction is set by $a$, not $v_0$.`,
    },
    {
      id: 'p1-ch2-018-q3',
      question: `A v–t graph shows velocity starting at $v_0 = 0$ and becoming more negative. What is this scenario?`,
      options: [
        `Upward throw`,
        `Drop from rest (up-positive convention)`,
        `Downward throw`,
        `Object moving at constant velocity`,
      ],
      answer: 1,
      explanation: `$v_0 = 0$ (dropped from rest) and $a = -g$ (downward). Velocity goes from 0 to increasingly negative values: $v = -gt$. The v-intercept at zero with negative slope is the "drop from rest" fingerprint.`,
    },
    {
      id: 'p1-ch2-018-q4',
      question: `Which of these is the "three quick checks" pattern for free-fall identification?`,
      options: [
        `(1) Object mass, (2) height, (3) time`,
        `(1) Axis convention, (2) sign of $a$, (3) expected velocity trend`,
        `(1) Equation form, (2) units, (3) significant figures`,
        `(1) Initial position, (2) final position, (3) time`,
      ],
      answer: 1,
      explanation: `Before computing anything: (1) declare axis convention (up+ or down+), (2) assign sign to $a$ based on convention, (3) predict whether $v$ should increase or decrease. These three checks prevent sign errors before algebra begins.`,
    },
    {
      id: 'p1-ch2-018-q5',
      question: `A velocity graph shows $v_0 < 0$ and $v$ becoming more negative (up-positive convention). What type of motion is this?`,
      options: [
        `Upward throw — still going up`,
        `Downward throw — accelerating downward`,
        `Object decelerating while going up`,
        `Object in circular motion`,
      ],
      answer: 1,
      explanation: `$v_0 < 0$ means initial velocity is downward (negative in up-positive). $a = -g$ makes $v$ more negative over time. The object moves downward and accelerates, consistent with a downward throw (or a drop that started below rest).`,
    },
    {
      id: 'p1-ch2-018-q6',
      question: `What feature of the y–t graph tells you there IS an apex (turning point)?`,
      options: [
        `The curve has a local maximum (y increases then decreases)`,
        `The curve is a straight line`,
        `The curve starts at y = 0`,
        `The curve has negative curvature`,
      ],
      answer: 0,
      explanation: `An apex exists when $v = 0$ at some time — the turning point where $y$ reaches its local maximum. On the y-t graph, this appears as the vertex of the downward-opening parabola.`,
    },
    {
      id: 'p1-ch2-018-q7',
      question: `On a v–t graph, a straight line with slope $-9.8$ m/s² indicates:`,
      options: [
        `Projectile motion with air resistance`,
        `Ideal free fall (constant $g$ downward, up-positive)`,
        `Variable acceleration`,
        `The object is moving at terminal velocity`,
      ],
      answer: 1,
      explanation: `$v = v_0 - gt$ is a linear function of $t$ with slope $-g = -9.8$ m/s². Any straight line with this slope on a v–t graph confirms ideal free fall with constant acceleration.`,
    },
    {
      id: 'p1-ch2-018-q8',
      question: `You see a y–t graph where y increases initially then decreases and goes below the start. What free-fall pattern does this match?`,
      options: [
        `Drop from rest`,
        `Downward throw`,
        `Upward throw from a height, falling past the launch level`,
        `Constant velocity`,
      ],
      answer: 2,
      explanation: `$y$ increasing then decreasing: the object rises to an apex (upward throw). Going below the initial y (below launch level) means it continues falling past the launch height — typical when launched from a cliff or elevated position.`,
    },
  ],
};

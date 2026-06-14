export default {
  id: "ch2-017",
  slug: "free-fall-from-rest",
  chapter: 'p2',
  order: 17,
  title: "Free Fall from Rest",
  subtitle: "The simplest gravity model: v0=0 and constant acceleration.",
  tags: ["free fall", "drop", "from rest"],
  aliases: "dropped object from rest",
  hook: {
    question:
      "How far does an object fall in a given time if released from rest?",
    realWorldContext:
      "Drop-time estimates appear in safety checks, sports analysis, and instrument calibration.",
    previewVisualizationId: 'SVGDiagram',
  },
  intuition: {
    prose: [
      "With v0=0, displacement scales like t² under constant gravity.",
      "Doubling time quadruples fall distance in this ideal model.",
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-trapezoid' },
        title: 'Drop from rest: v₀ = 0, so the trapezoid becomes a triangle',
        caption: 'When v₀ = 0, the trapezoid ½(v₀+v)t collapses to a triangle: ½vt = ½(gt)t = ½gt². That\'s the SUVAT equation Δy = ½gt² — pure algebra from a triangle\'s area formula.',
      },
      {
        id: 'VerticalThrow',
        props: {},
        title: "Drop from rest calculator",
        mathBridge: "Slide time and observe quadratic growth in displacement.",
        caption: "A classic t² law in action.",
      },
      {
        id: 'SVGDiagram',
        title: "Free-fall pattern quiz",
        mathBridge:
          "Identify which graph/equation matches drop-from-rest behavior.",
        caption: "Reinforce qualitative recognition.",
      },
      {
        id: 'VerticalThrow',
        title: "Horizontal launch from rest vertically",
        mathBridge:
          "Compare pure drop and horizontal launch to isolate unchanged vertical free-fall dynamics.",
        caption:
          "Horizontal speed changes range, not fall-time under ideal assumptions.",
      },
    ],
  },
  math: {
    prose: ["For up-positive convention, use Δx = -1/2 g t² and v = -gt."],
    visualizations: [
      {
        id: 'SVGDiagram',
        title: "Equation recall",
        mathBridge: "Spot the v0=0 special-case forms quickly.",
        caption: "Special cases reduce cognitive load.",
      },
    ],
  },
  rigor: {
    prose: ["Set v0=0 in the constant-acceleration formulas."],
    visualizationId: 'SVGDiagram',
    visualizationProps: { type: 'free-fall-axes' },
    proofSteps: [
      {
        expression: "\\Delta x=v_0t+\\frac12at^2",
        annotation: "General form.",
      },
      {
        expression: "v_0=0,\\,a=-g",
        annotation: "Drop-from-rest substitutions.",
      },
      {
        expression: "\\Delta x=-\\frac12gt^2",
        annotation: "Result under up-positive axis.",
      },
    ],
    title: "Derivation for v0=0",
  },
  examples: [
    {
      id: "ch2-017-ex1",
      title: "3-second drop",
      problem: "Find displacement after 3 s from rest (up-positive).",
      steps: [
        {
          expression: "\\Delta x=-\\frac12(9.8)(3^2)=-44.1\\,\\text{m}",
          annotation: "Direct substitution.",
        },
      ],
      conclusion: "Object is 44.1 m below release point.",
    },
  ],
  challenges: [
    {
      id: "ch2-017-ch1",
      difficulty: "easy",
      problem: "If drop time doubles, by what factor does distance change?",
      hint: "Distance is proportional to t².",
      answer: "By a factor of 4.",
    },
  ],

  notebooks: {
    python: {
      type: 'python',
      cells: [
        {
          cellTitle: 'Drop table — distance and speed vs time',
          type: 'code',
          language: 'python',
          prose: [
            `Build a table showing fall distance and impact speed at 1–5 s for an object dropped from rest. Notice that h/t² stays constant at ½g — that's the quadratic signature.`,
          ],
          code: `g = 9.8   # m/s²

print(f"{'t (s)':>6} {'h = ½gt² (m)':>14} {'v = gt (m/s)':>14} {'h/t² (= ½g)':>12}")
print("-" * 50)
for t in range(1, 6):
    h = 0.5 * g * t**2
    v = g * t
    print(f"{t:>6} {h:>14.3f} {v:>14.3f} {h/t**2:>12.4f}")

print(f"\\nNote: h/t² = ½g = {0.5*g:.4f} — constant for all t ✓")`,
        },
        {
          cellTitle: 'Plot h vs t² — the linear relationship',
          type: 'code',
          language: 'python',
          prose: [
            `Plot fall distance h against t² (not t). The result should be a straight line with slope ½g. This linearisation is how Galileo originally measured g with inclined planes.`,
          ],
          code: `import numpy as np
import matplotlib.pyplot as plt

g = 9.8
t = np.linspace(0, 5, 200)
h = 0.5 * g * t**2
t_sq = t**2

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4))

ax1.plot(t, h, lw=2, color='steelblue')
ax1.set_xlabel('Time t (s)')
ax1.set_ylabel('Fall distance h (m)')
ax1.set_title('h vs t — parabolic (t² growth)')

ax2.plot(t_sq, h, lw=2, color='tomato')
ax2.text(10, h[100]-3, f'slope = ½g = {0.5*g:.2f} m/s²', color='tomato', fontsize=10)
ax2.set_xlabel('t² (s²)')
ax2.set_ylabel('Fall distance h (m)')
ax2.set_title('h vs t² — linear (straight line)')

plt.tight_layout()
plt.show()`,
        },
        {
          cellTitle: 'Measure g from experimental drop data',
          type: 'code',
          language: 'python',
          prose: [
            `Drop-time measurements at known heights let you extract g from the slope of a h vs t² plot. This is exactly how Galileo measured g — and how you'd do it in a lab.`,
          ],
          code: `import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
heights_true = np.array([0.5, 1.0, 1.5, 2.0, 2.5, 3.0])  # m
g_true = 9.8
t_true = np.sqrt(2 * heights_true / g_true)
t_measured = t_true + np.random.normal(0, 0.015, size=len(t_true))

t_sq = t_measured**2
slope, intercept = np.polyfit(t_sq, heights_true, 1)
g_measured = 2 * slope

print(f"Fitted slope (½g) : {slope:.4f} m/s²")
print(f"Measured g         : {g_measured:.4f} m/s²")
print(f"True g             : {g_true:.4f} m/s²")
print(f"Error              : {abs(g_measured - g_true)/g_true*100:.2f}%")

fig, ax = plt.subplots(figsize=(7, 4))
ax.scatter(t_sq, heights_true, label='Data', zorder=5)
ax.plot(t_sq, slope*t_sq + intercept, color='tomato', label=f'Fit: g={g_measured:.2f} m/s²')
ax.set_xlabel('t² (s²)')
ax.set_ylabel('Height h (m)')
ax.set_title('Measuring g from drop data — linear fit of h vs t²')
ax.legend()
plt.tight_layout()
plt.show()`,
        },
        {
          cellTitle: 'Challenge — free fall on other worlds',
          type: 'code',
          language: 'python',
          prose: [
            `How far does an object dropped from rest fall in 3 s on Earth, Moon, Mars, and the Sun? Use h = ½gt² and compute impact speed too.`,
          ],
          code: `bodies = {
    'Earth':  9.80,
    'Moon':   1.62,
    'Mars':   3.72,
    'Sun':  274.0,
}
t = 3.0  # s

print(f"Drop from rest for {t} s:")
print(f"{'Body':<8} {'g (m/s²)':>10} {'h (m)':>12} {'v_impact (m/s)':>16}")
print("-" * 50)
for name, g in bodies.items():
    h = 0.5 * g * t**2
    v = g * t
    print(f"{name:<8} {g:>10.2f} {h:>12.2f} {v:>16.2f}")`,
        },
      ],
    },
    matlab: {
      type: 'matlab',
      cells: [
        {
          cellTitle: 'Drop table — MATLAB',
          type: 'code',
          language: 'matlab',
          prose: [
            `Reproduce the drop table in MATLAB using a for-loop. MATLAB's fprintf handles printf-style formatting.`,
          ],
          code: `g = 9.8;   % m/s²

fprintf('%6s %14s %14s %12s\\n', 't (s)', 'h = ½gt² (m)', 'v = gt (m/s)', 'h/t²');
fprintf('%s\\n', repmat('-', 1, 50));
for t = 1:5
    h = 0.5 * g * t^2;
    v = g * t;
    fprintf('%6d %14.3f %14.3f %12.4f\\n', t, h, v, h/t^2);
end
fprintf('\\nNote: h/t² = ½g = %.4f — constant for all t\\n', 0.5*g);`,
        },
        {
          cellTitle: 'Plot h vs t and h vs t² — MATLAB',
          type: 'code',
          language: 'matlab',
          prose: [
            `Side-by-side plots showing the parabolic h-vs-t curve and the linear h-vs-t² relationship.`,
          ],
          code: `g = 9.8;
t = linspace(0, 5, 200);
h = 0.5 * g * t.^2;
t_sq = t.^2;

figure;
subplot(1,2,1)
plot(t, h, 'b-', 'LineWidth', 2)
xlabel('Time t (s)'), ylabel('h (m)')
title('h vs t — parabolic')

subplot(1,2,2)
plot(t_sq, h, 'r-', 'LineWidth', 2)
xlabel('t² (s²)'), ylabel('h (m)')
title('h vs t² — linear')
text(10, h(101)-3, sprintf('slope = ½g = %.2f', 0.5*g), 'Color', 'r')

sgtitle('Free fall from rest')`,
        },
        {
          cellTitle: 'Measure g with polyfit — MATLAB',
          type: 'code',
          language: 'matlab',
          prose: [
            `Fit h vs t² with polyfit to extract g from the slope — the same technique used in real lab experiments.`,
          ],
          code: `rng(42);
heights_true = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];  % m
g_true = 9.8;
t_true = sqrt(2 * heights_true / g_true);
t_measured = t_true + 0.015 * randn(size(t_true));

t_sq = t_measured.^2;
p = polyfit(t_sq, heights_true, 1);
slope = p(1);
g_measured = 2 * slope;

fprintf('Fitted slope (½g) : %.4f m/s²\\n', slope);
fprintf('Measured g         : %.4f m/s²\\n', g_measured);
fprintf('True g             : %.4f m/s²\\n', g_true);
fprintf('Error              : %.2f%%\\n', abs(g_measured-g_true)/g_true*100);

figure;
scatter(t_sq, heights_true, 50, 'filled'); hold on
plot(t_sq, polyval(p, t_sq), 'r-', 'LineWidth', 2, ...
     'DisplayName', sprintf('Fit: g=%.2f m/s²', g_measured))
xlabel('t² (s²)'), ylabel('h (m)')
title('Measuring g from drop data')
legend show`,
        },
        {
          cellTitle: 'Challenge — other worlds in MATLAB',
          type: 'code',
          language: 'matlab',
          prose: [
            `Compute drop distance and impact speed for 3 s on Earth, Moon, Mars, and the Sun using a struct array.`,
          ],
          code: `bodies = struct( ...
    'name', {'Earth','Moon','Mars','Sun'}, ...
    'g',    {9.80,   1.62,  3.72,  274.0} ...
);
t = 3.0;

fprintf('Drop from rest for %.1f s:\\n', t);
fprintf('%-8s %10s %12s %16s\\n', 'Body','g (m/s²)','h (m)','v_impact (m/s)');
fprintf('%s\\n', repmat('-',1,50));
for k = 1:numel(bodies)
    g = bodies(k).g;
    h = 0.5 * g * t^2;
    v = g * t;
    fprintf('%-8s %10.2f %12.2f %16.2f\\n', bodies(k).name, g, h, v);
end`,
        },
      ],
    },
  },

  misconceptions: [
    {
      id: 'ch2-017-misc-1',
      misconception: `h vs t is a straight line — speed is constant during free fall.`,
      correction: `Speed increases linearly (v = gt), so distance grows as t². A parabola, not a line. Only on a h-vs-t² plot does the relationship become linear.`,
    },
    {
      id: 'ch2-017-misc-2',
      misconception: `Heavier objects fall faster because gravity pulls them harder.`,
      correction: `A heavier object does experience a larger gravitational force, but it also has more inertia (F = ma). The two effects cancel exactly: a = F/m = mg/m = g, independent of mass. All objects in free fall share the same g.`,
    },
    {
      id: 'ch2-017-misc-3',
      misconception: `"Free fall" means the object is falling freely through air.`,
      correction: `Free fall is an idealisation: gravity only, zero air resistance. Real dropped objects experience drag. The model is accurate for short falls or dense heavy objects where drag is negligible, but breaks down for lightweight or high-speed scenarios.`,
    },
    {
      id: 'ch2-017-misc-4',
      misconception: `Doubling height doubles fall time.`,
      correction: `t = √(2h/g), so time grows as √h. Quadrupling height doubles the time; doubling height only multiplies time by √2 ≈ 1.41.`,
    },
  ],

  transferPrompts: [
    {
      id: 'ch2-017-tp-1',
      prompt: `A ball is dropped from a building and hits the ground after 4 s. How tall is the building? How fast is the ball moving at impact?`,
      targetConcept: `Applying h = ½gt² and v = gt simultaneously to extract building height and impact speed from a single measured drop time.`,
    },
    {
      id: 'ch2-017-tp-2',
      prompt: `You want to measure g using only a stopwatch and a known drop height. Describe the experiment and explain why plotting h vs t² gives a cleaner result than plotting h vs t.`,
      targetConcept: `Linearising a quadratic relationship — fitting a line to h-vs-t² eliminates curve-fitting error and yields the slope ½g directly.`,
    },
    {
      id: 'ch2-017-tp-3',
      prompt: `On the Moon (g = 1.62 m/s²), how much longer does it take an object to fall the same height compared to Earth?`,
      targetConcept: `t = √(2h/g) — fall time scales as 1/√g, so the Moon factor is √(9.8/1.62) ≈ 2.46 times longer.`,
    },
  ],

  debugging: [
    {
      id: 'ch2-017-dbg-1',
      title: `Wrong formula used for h`,
      buggyCode: `g = 9.8\nt = 3\nh = g * t**2\nprint(h)`,
      issue: `Missing the ½ factor. The correct formula is h = ½gt², not h = gt².`,
      fixedCode: `g = 9.8\nt = 3\nh = 0.5 * g * t**2\nprint(h)  # 44.1 m`,
    },
    {
      id: 'ch2-017-dbg-2',
      title: `Using linear polyfit on h vs t instead of h vs t²`,
      buggyCode: `import numpy as np\nt = np.array([0.45, 0.64, 0.78, 0.90, 1.01])\nh = np.array([1.0, 2.0, 3.0, 4.0, 5.0])\nslope, _ = np.polyfit(t, h, 1)  # linear fit on h vs t\ng = slope  # WRONG`,
      issue: `h ∝ t², not t. Fitting h vs t gives a meaningless slope. Fit h vs t² and multiply slope by 2 to get g.`,
      fixedCode: `import numpy as np\nt = np.array([0.45, 0.64, 0.78, 0.90, 1.01])\nh = np.array([1.0, 2.0, 3.0, 4.0, 5.0])\nslope, _ = np.polyfit(t**2, h, 1)  # linear fit on h vs t²\ng = 2 * slope\nprint(f"g ≈ {g:.2f} m/s²")`,
    },
  ],

  mastery: {
    summary: `Free fall from rest is the simplest constant-acceleration scenario: v₀ = 0, a = −g. All kinematics simplify — v = gt, h = ½gt², v² = 2gh. Distance scales quadratically with time; fall time scales as √h. Plotting h vs t² linearises the relationship with slope ½g, enabling a direct experimental measurement of g.`,
    keyTakeaways: [
      `h = ½gt² — distance grows quadratically; doubling time quadruples height.`,
      `v = gt — speed grows linearly; time and speed are simply proportional.`,
      `v² = 2gh — the time-independent formula connecting speed and height.`,
      `t = √(2h/g) — fall time grows as √h, not linearly with h.`,
      `Plotting h vs t² produces a straight line with slope ½g — the classic Galileo linearisation.`,
    ],
    nextSteps: [
      `Free fall with initial downward velocity (v₀ ≠ 0)`,
      `Vertical throw upward — same equations, negative initial velocity`,
      `Air resistance and terminal velocity`,
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch2-017-q1',
      question: `An object is dropped from rest. After 3 s, what is its speed (using $g = 9.8$ m/s²)?`,
      options: [`9.8 m/s`, `19.6 m/s`, `29.4 m/s`, `44.1 m/s`],
      answer: 2,
      explanation: `$v = gt = 9.8 \\times 3 = 29.4$ m/s. With $v_0 = 0$, speed grows linearly: $v = gt$.`,
    },
    {
      id: 'p1-ch2-017-q2',
      question: `An object dropped from rest falls for 3 s. How far has it fallen?`,
      options: [`29.4 m`, `44.1 m`, `88.2 m`, `14.7 m`],
      answer: 1,
      explanation: `$h = \\tfrac{1}{2}gt^2 = \\tfrac{1}{2}(9.8)(9) = 44.1$ m. With $v_0 = 0$, displacement is $\\tfrac{1}{2}gt^2$.`,
    },
    {
      id: 'p1-ch2-017-q3',
      question: `If drop time doubles from 2 s to 4 s, by what factor does the fall distance increase?`,
      options: [`2×`, `4×`, `8×`, `$\\sqrt{2}$×`],
      answer: 1,
      explanation: `$h = \\tfrac{1}{2}gt^2 \\propto t^2$. Doubling $t$: $h' = \\tfrac{1}{2}g(2t)^2 = 4 \\cdot \\tfrac{1}{2}gt^2 = 4h$. Distance quadruples.`,
    },
    {
      id: 'p1-ch2-017-q4',
      question: `An object falls 19.6 m from rest. How long did it take?`,
      options: [`1 s`, `2 s`, `3 s`, `4 s`],
      answer: 1,
      explanation: `$h = \\tfrac{1}{2}gt^2 \\Rightarrow t = \\sqrt{2h/g} = \\sqrt{2(19.6)/9.8} = \\sqrt{4} = 2$ s.`,
    },
    {
      id: 'p1-ch2-017-q5',
      question: `An object dropped from rest reaches speed $v$ after falling height $h$. What formula connects $v$, $h$, and $g$ (without $t$)?`,
      options: [
        `$v = gh$`,
        `$v = \\sqrt{2gh}$`,
        `$v = \\sqrt{gh}$`,
        `$v = 2gh$`,
      ],
      answer: 1,
      explanation: `$v^2 = v_0^2 + 2g\\Delta y = 0 + 2gh$, so $v = \\sqrt{2gh}$. This comes from SUVAT with $v_0 = 0$ and is equivalent to conservation of energy: $mgh = \\tfrac{1}{2}mv^2$.`,
    },
    {
      id: 'p1-ch2-017-q6',
      question: `A plot of fall distance $h$ versus time $t$ for a dropped object has what shape?`,
      options: [
        `A straight line through the origin`,
        `An upward-opening parabola`,
        `A downward-opening parabola`,
        `An exponential curve`,
      ],
      answer: 1,
      explanation: `$h = \\tfrac{1}{2}gt^2$. This is quadratic in $t$ with positive coefficient, giving an upward-opening parabola. The slope (speed) increases over time.`,
    },
    {
      id: 'p1-ch2-017-q7',
      question: `A plot of $h$ versus $t^2$ for a dropped object from rest has what shape?`,
      options: [
        `A parabola`,
        `A straight line through the origin with slope $\\tfrac{1}{2}g$`,
        `A curve that levels off`,
        `An exponential`,
      ],
      answer: 1,
      explanation: `$h = \\tfrac{1}{2}g \\cdot t^2$. Plotting $h$ against $t^2$ gives a straight line through the origin with slope $\\tfrac{1}{2}g$. This linearisation is how Galileo measured $g$ using inclined planes.`,
    },
    {
      id: 'p1-ch2-017-q8',
      question: `Two identical balls are dropped from rest from the same height — one on Earth ($g = 9.8$ m/s²) and one on Mars ($g = 3.72$ m/s²). How do their fall times compare?`,
      options: [
        `Same time — same height, same equations`,
        `Earth ball lands first (larger $g$ → faster fall)`,
        `Mars ball lands first (weaker gravity → less resistance)`,
        `Cannot determine without knowing the height`,
      ],
      answer: 1,
      explanation: `$t = \\sqrt{2h/g}$. Larger $g$ gives smaller $t$. Earth's $g = 9.8$ m/s² > Mars's $g = 3.72$ m/s², so the Earth ball hits first. The Mars ball takes $\\sqrt{9.8/3.72} \\approx 1.62$ times longer.`,
    },
  ],
};

export default {
  id: "ch2-020",
  slug: "two-objects-1",
  chapter: 'p2',
  order: 20,
  title: "Two Objects — Meeting Problems (Part 1)",
  subtitle:
    "When do two objects at different positions with different velocities meet?",
  tags: ["two-objects-1", "kinematics", "1D motion"],
  aliases: "two-objects-1",
  hook: {
    question:
      "Car A is at x = 0 moving at 20 m/s. Car B is 100 m ahead moving at 15 m/s. When does A catch B?",
    realWorldContext:
      "Two-object problems appear in every physics exam. The trick: write x(t) for each object and set them equal.",
    previewVisualizationId: 'SVGDiagram',
  },
  videos: [
    {
      title: "Physics 2 – Motion in One Dimension (20 of 22) Two Objects",
      embedCode:
        '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: "intuition",
    },
  ],
  intuition: {
    prose: [
      "**The key insight: meeting = same place at same time.** Two objects meet when they occupy the same position at the same moment. In math: x_A(t) = x_B(t). That single equation — set the two position functions equal and solve for t — is the entire technique. Everything else is bookkeeping.",
      "**Why you need a common coordinate system.** Both objects must be measured from the same origin in the same direction. If Car A uses 'distance from city hall going east' and Car B uses 'distance from the station going west', you cannot directly set x_A = x_B. Convert everything to one consistent frame first.",
      "**Write the position model for each object separately.** For constant velocity: x(t) = x₀ + v·t. This is the most common case. For constant acceleration: x(t) = x₀ + v₀t + ½at². Write both models before trying to solve anything.",
      "**Relative motion shortcut.** The separation between the objects is x_A(t) − x_B(t). This starts at (x_A0 − x_B0) and changes at rate (v_A − v_B). The gap reaches zero at t = (x_B0 − x_A0)/(v_A − v_B). This is the catch-up formula. It says: initial gap divided by closing speed.",
      "**Check the physical validity of your answer.** t must be ≥ 0. A negative time means the meeting already happened before t = 0 (i.e., before the scenario started). Also verify by substituting t back into both position formulas — you should get the same x.",
    ],
    callouts: [
      { type: "definition", title: "Meeting condition", body: "x_A(t)=x_B(t)" },
      {
        type: "warning",
        title: "Common mistake",
        body: "Using different time origins for each object without converting them first.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'two-objects-line' },
        title: 'Meeting on a number line',
        caption: 'Two objects start at different positions moving toward each other. They meet when xₐ(t) = x_b(t). Solve that equation for t.',
      },
      {
        id: 'SVGDiagram',
        title: "Dual-position meeting view",
        mathBridge:
          "Observe both x(t) curves and identify the intersection as the meeting event.",
        caption: "Intersection in x–t space equals same place at same time.",
      },
      {
        id: 'SVGDiagram',
        title: "Trajectory-wall intersection",
        mathBridge:
          "Treat clearance as a position-matching event at a fixed x-location, then compare y-positions.",
        caption: "Meeting logic extends to obstacle-clearance constraints.",
      },
    ],
  },
  math: {
    prose: [
      "For constant velocity motion, use linear models: x_A=x_{A0}+v_A t and x_B=x_{B0}+v_B t.",
      "Equivalent relative-motion form: x_{rel}(t)=x_A-x_B=(x_{A0}-x_{B0})+(v_A-v_B)t. Meeting occurs when x_{rel}=0.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Catch-up time (constant velocities)",
        body: "t=\\frac{x_{B0}-x_{A0}}{v_A-v_B}\\quad (v_A>v_B)",
      },
      {
        type: "insight",
        title: "No meeting case",
        body: "If relative velocity is zero and initial separation is nonzero, they never meet.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        title: "Chase/head-on scenario explorer",
        mathBridge:
          "Test chase, head-on, and opposite-direction cases with algebra shown beside graphs.",
        caption: "One equation frame handles many story problems.",
      },
    ],
  },
  rigor: {
    prose: [
      "Define f(t)=x_A(t)-x_B(t). A meeting occurs exactly when f(t)=0.",
      "For linear x_A and x_B, f(t) is linear, so there is at most one meeting time unless the functions are identical.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Root-finding view",
        body: "f(t)=x_A(t)-x_B(t);\\;\\text{meeting}\\iff f(t)=0",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'relative-motion-gap' },
        title: 'Relative position f(t) = xA − xB: meeting when f = 0',
        mathBridge:
          'Define f(t) = x_A(t) − x_B(t). For constant-velocity objects, f(t) is a linear function of t: f(t) = (x_A0 − x_B0) + (v_A − v_B)t. The meeting time is the root of this linear function: t_meet = (x_B0 − x_A0)/(v_A − v_B). The diagram shows f(t) as a straight line crossing zero at t_meet. If the slope (v_A − v_B) is zero, the line is horizontal — no crossing, no meeting.',
        caption: 'Reducing two-object meeting to one root-finding problem: f(t) = x_A − x_B = 0.',
      },
    ],
    proofSteps: [
      {
        expression: "x_A(t)=x_{A0}+v_A t,\\quad x_B(t)=x_{B0}+v_B t",
        annotation: "Model each trajectory.",
      },
      { expression: "x_A(t)=x_B(t)", annotation: "Impose meeting condition." },
      {
        expression: "t=\\frac{x_{B0}-x_{A0}}{v_A-v_B}",
        annotation: "Solve and enforce t\\ge 0 for physical validity.",
      },
    ],
    title: "Deriving the two-object meeting equation",
  },
  examples: [
    {
      id: "ch2-020-ex1",
      title: "Catch-up example",
      problem:
        "\\text{A starts at }x=0\\text{ with }v_A=20\\,\\text{m/s}.\\text{ B starts at }x=100\\text{ with }v_B=15\\,\\text{m/s}.\\text{ Find meeting time and position.}",
      steps: [
        {
          expression: "x_A=20t,\\quad x_B=100+15t",
          annotation: "Write position models.",
        },
        {
          expression:
            "20t=100+15t\\Rightarrow 5t=100\\Rightarrow t=20\\,\\text{s}",
          annotation: "Apply meeting condition.",
        },
        {
          expression: "x=20(20)=400\\,\\text{m}",
          annotation: "Substitute back to get location.",
        },
      ],
      conclusion: "They meet after 20 s at x=400 m.",
    },
  ],
  challenges: [
    {
      id: "ch2-020-ch1",
      difficulty: "medium",
      problem:
        "\\text{A starts at }x=0\\text{ with }v_A=12\\,\\text{m/s},\\text{ B at }x=30\\text{ with }v_B=12\\,\\text{m/s}.\\text{ Do they meet?}",
      hint: "Check relative velocity first.",
      walkthrough: [
        { expression: "v_A-v_B=0", annotation: "No relative closing speed." },
        {
          expression: "x_{B0}-x_{A0}=30\\neq 0",
          annotation: "Initial separation persists forever.",
        },
      ],
      answer: "No, they never meet.",
    },
  ],

  // ── Python Lab ────────────────────────────────────────────────────────────
  python: {
    title: `Python Lab — Two Objects: Meeting Problems`,
    description: `Model two-object kinematics in Python: write x(t) for each object, find the meeting time algebraically and graphically, and handle the "never meet" case.`,
    placement: 'after-examples',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Two-object meeting — algebraic and graphical',
        props: {
          initialCells: [
            {
              id: 'cell-01',
              type: 'code',
              cellTitle: 'Catch-up problem — algebraic solution',
              prose: `Car A starts at x = 0 with v_A = 20 m/s. Car B starts at x = 100 m with v_B = 15 m/s. Find the meeting time and position.`,
              code: [
                `# Object A: x_A(t) = x_A0 + v_A * t`,
                `# Object B: x_B(t) = x_B0 + v_B * t`,
                `# Meeting: x_A(t) = x_B(t)  →  t = (x_B0 - x_A0) / (v_A - v_B)`,
                ``,
                `x_A0 =   0.0   # m`,
                `v_A  =  20.0   # m/s`,
                `x_B0 = 100.0   # m`,
                `v_B  =  15.0   # m/s`,
                ``,
                `dv = v_A - v_B   # relative (closing) velocity`,
                `dx = x_B0 - x_A0  # initial separation`,
                ``,
                `if abs(dv) < 1e-9:`,
                `    if abs(dx) < 1e-9:`,
                `        print("Objects start at the same position — already meeting.")`,
                `    else:`,
                `        print("Same velocity, different positions — they never meet.")`,
                `else:`,
                `    t_meet = dx / dv`,
                `    x_meet = x_A0 + v_A * t_meet`,
                `    if t_meet < 0:`,
                `        print(f"Meeting time t = {t_meet:.2f} s is in the past — no future meeting.")`,
                `    else:`,
                `        print(f"Meeting time    : t = {t_meet:.2f} s")`,
                `        print(f"Meeting position: x = {x_meet:.2f} m")`,
                `        print(f"Cross-check x_B : {x_B0 + v_B * t_meet:.2f} m ✓")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-02',
              type: 'code',
              cellTitle: 'Graphical solution — x(t) curves for both objects',
              prose: `Plot x_A(t) and x_B(t) on the same graph. The intersection is the meeting point. The x-coordinate of the intersection gives position; the t-coordinate gives time.`,
              code: [
                `import numpy as np`,
                `import matplotlib.pyplot as plt`,
                ``,
                `x_A0, v_A = 0.0, 20.0`,
                `x_B0, v_B = 100.0, 15.0`,
                `t_meet = (x_B0 - x_A0) / (v_A - v_B)`,
                `x_meet = x_A0 + v_A * t_meet`,
                ``,
                `t = np.linspace(0, t_meet * 1.3, 300)`,
                `x_A = x_A0 + v_A * t`,
                `x_B = x_B0 + v_B * t`,
                ``,
                `fig, ax = plt.subplots(figsize=(8, 5))`,
                `ax.plot(t, x_A, lw=2, label=f'Car A: x = {x_A0} + {v_A}t', color='steelblue')`,
                `ax.plot(t, x_B, lw=2, label=f'Car B: x = {x_B0} + {v_B}t', color='tomato')`,
                `ax.scatter([t_meet], [x_meet], s=100, zorder=5, color='orange',`,
                `           label=f'Meeting: t={t_meet:.1f}s, x={x_meet:.0f}m')`,
                `ax.axvline(t_meet, color='orange', ls='--', lw=0.8)`,
                `ax.set_xlabel('Time (s)')`,
                `ax.set_ylabel('Position x (m)')`,
                `ax.set_title('Two-object meeting — x(t) graph')`,
                `ax.legend()`,
                `plt.tight_layout()`,
                `plt.show()`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-03',
              type: 'code',
              cellTitle: 'Head-on collision — two objects moving toward each other',
              prose: `Object A starts at x = 0 moving right at 8 m/s. Object B starts at x = 120 m moving left at −12 m/s. Find when and where they meet.`,
              code: [
                `import numpy as np`,
                `import matplotlib.pyplot as plt`,
                ``,
                `x_A0, v_A =   0.0,   8.0`,
                `x_B0, v_B = 120.0, -12.0   # moving left → negative`,
                ``,
                `dv = v_A - v_B`,
                `t_meet = (x_B0 - x_A0) / dv`,
                `x_meet = x_A0 + v_A * t_meet`,
                ``,
                `print(f"Meeting time    : {t_meet:.2f} s")`,
                `print(f"Meeting position: {x_meet:.2f} m")`,
                ``,
                `t = np.linspace(0, t_meet * 1.2, 300)`,
                `fig, ax = plt.subplots(figsize=(8, 4))`,
                `ax.plot(t, x_A0 + v_A*t, lw=2, label='Object A (rightward)', color='steelblue')`,
                `ax.plot(t, x_B0 + v_B*t, lw=2, label='Object B (leftward)',  color='tomato')`,
                `ax.scatter([t_meet], [x_meet], s=80, color='orange', zorder=5,`,
                `           label=f'Meet at x={x_meet:.1f} m, t={t_meet:.1f} s')`,
                `ax.set_xlabel('t (s)'); ax.set_ylabel('x (m)')`,
                `ax.set_title('Head-on meeting')`,
                `ax.legend()`,
                `plt.tight_layout()`,
                `plt.show()`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-04',
              type: 'code',
              cellTitle: 'Challenge — general two-object solver with edge cases',
              prose: `Write a function that handles all two-object constant-velocity cases: catch-up, head-on, parallel same speed (never meet), and already at same position.`,
              code: [
                `def two_object_meeting(x_A0, v_A, x_B0, v_B, tol=1e-9):`,
                `    """`,
                `    Returns (t_meet, x_meet) or a string describing the case.`,
                `    """`,
                `    dv = v_A - v_B`,
                `    dx = x_B0 - x_A0`,
                `    if abs(dv) < tol:`,
                `        if abs(dx) < tol:`,
                `            return "Already at same position (t=0)"`,
                `        return "Parallel motion — never meet"`,
                `    t = dx / dv`,
                `    if t < -tol:`,
                `        return f"Meeting was in the past (t={t:.2f} s)"`,
                `    x = x_A0 + v_A * t`,
                `    return (round(t, 4), round(x, 4))`,
                ``,
                `# Test suite`,
                `cases = [`,
                `    ("Catch-up",          0,  20, 100,  15),`,
                `    ("Head-on",           0,   8, 120, -12),`,
                `    ("Same speed, gap",   0,  12,  30,  12),`,
                `    ("Same position",     0,  10,   0,   5),`,
                `    ("Past meeting",    100,  -5,   0,  -2),`,
                `]`,
                `for name, xA0, vA, xB0, vB in cases:`,
                `    result = two_object_meeting(xA0, vA, xB0, vB)`,
                `    print(f"{name:<22}: {result}")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
          ],
        },
      },
    ],
  },

  misconceptions: [
    {
      id: 'ch2-020-m1',
      misconception: 'Two objects meet when they have the same velocity.',
      correction: 'They meet when they have the same *position* at the same time: x_A(t) = x_B(t). Velocity equality is irrelevant to meeting — two objects can meet while moving at completely different speeds. In fact, at the instant they meet, their velocities are generally different.',
      correctionExample: 'Car A at x=0, v=20 m/s meets Car B at x=100, v=15 m/s at t=20 s (x=400 m). At the meeting instant, A is still going 20 m/s and B is still going 15 m/s — different velocities, but same position.',
    },
    {
      id: 'ch2-020-m2',
      misconception: 'You can use different coordinate origins for each object.',
      correction: 'Both objects must be measured in the same coordinate system. If you set x=0 at Car A\'s starting position, then Car B\'s position must be measured from that same origin (e.g., x_B0 = 100 m from A\'s starting position). Mixing origins makes x_A(t) = x_B(t) meaningless.',
      correctionExample: 'If A measures from "City Hall" and B measures from "the station 5 km away", x_A = x_B does not mean they are at the same location. Convert both to one reference point first.',
    },
    {
      id: 'ch2-020-m3',
      misconception: 'A negative meeting time t < 0 means something went wrong in the algebra.',
      correction: 'A negative meeting time is a valid algebraic result — it just means that given the initial conditions at t = 0, the objects would have met in the *past*. Under these conditions, the objects are diverging at t = 0 and will never meet in the future. This is a physically meaningful answer: no future meeting.',
      correctionExample: 'A at x=100 moving right at 5 m/s; B at x=0 moving right at 15 m/s. t_meet = (0 − 100)/(5 − 15) = −100/−10 = −10 s. The faster B has already passed A before t = 0. No future meeting.',
    },
    {
      id: 'ch2-020-m4',
      misconception: 'The meeting position must be between the two starting positions.',
      correction: 'Not necessarily. If both objects move in the same direction and A is behind B but faster, they meet ahead of B\'s starting position — both will have traveled past B\'s initial x by the time they meet. If A and B move toward each other (head-on), the meeting is between them. The formula x = x_A0 + v_A · t_meet gives the correct meeting position regardless.',
      correctionExample: 'In the catch-up example: A starts at 0, B starts at 100. They meet at x = 400 m — well past both starting positions. A traveled 400 m; B traveled 300 m.',
    },
  ],

  transferPrompts: [
    {
      id: 'ch2-020-tp1',
      prompt: 'Two trains are on parallel tracks. Train A departs Station 1 at 9:00 AM heading east at 80 km/h. Train B departs Station 2 (200 km east of Station 1) at 9:00 AM heading west at 120 km/h. At what time and location do they pass each other?',
      connection: 'Head-on meeting problem. Set x_A(t) = 200 − 120t, x_B(t) = 80t. (Or measure from A\'s starting point: A starts at 0 going right, B starts at 200 going left.) Meeting at t = 200/200 = 1 hour. Answer: 10:00 AM, 80 km east of Station 1.',
    },
    {
      id: 'ch2-020-tp2',
      prompt: 'In a relay race, Runner A passes the baton at position x = 0 and runs at 8 m/s. Runner B starts at x = −10 m (10 m behind the exchange zone) and begins running at t = 0 at 9.5 m/s. When does B catch A? Does this represent a successful relay exchange?',
      connection: 'Catch-up problem with one object starting behind. t_meet = (0 − (−10))/(9.5 − 8) = 10/1.5 ≈ 6.7 s. Position = 0 + 8(6.7) ≈ 53 m. B catches A 53 m after the exchange zone — a slow handoff but valid if the exchange zone is more than 53 m long.',
    },
    {
      id: 'ch2-020-tp3',
      prompt: 'A police officer is parked at x = 0. A speeding car passes at x = 0 moving at v = 30 m/s. The officer waits 2 seconds, then accelerates from rest at a = 4 m/s². Write x_car(t) and x_officer(t) (with t = 0 at the moment the car passes). When does the officer catch the car?',
      connection: 'Mixed: constant velocity (car) vs constant acceleration (officer, but starting at t=2 s). x_car = 30t. x_officer = 0 + 0·t + ½(4)(t−2)² for t ≥ 2. Set equal: 30t = 2(t−2)² → 2t²−8t−30t+8=0 → 2t²−38t+8=0 → t = (38±√(1444−64))/4 ≈ (38±37.1)/4. Take larger root: t ≈ 18.8 s.',
    },
  ],

  debugging: [
    {
      id: 'ch2-020-db1',
      scenario: 'A student solves: x_A0=0, v_A=20; x_B0=100, v_B=15. Sets 20t = 100 + 15t. Gets 5t = 100, t = 20 s. Then computes x_meet = x_A(20) = 20×20 = 400. Then "checks": x_B(20) = 15×20 = 300. Concludes the check fails.',
      error: 'The student forgot the initial position x_B0 = 100 in the check. x_B(t) = x_B0 + v_B · t = 100 + 15 × 20 = 100 + 300 = 400. The check passes — both give x = 400 m.',
      fix: 'Always include the initial position in the check: x_B(20) = 100 + 15(20) = 400 m = x_A(20). The cross-check confirms the answer. Leaving out x_B0 is the error.',
    },
    {
      id: 'ch2-020-db2',
      scenario: 'A student writes: "Object A is at x = 50 m, moving left at 3 m/s. Object B is at x = 0, moving right at 7 m/s." The student sets x_A = 50 − 3t and x_B = 7t, gets t = 5 s. But then worries: "Moving left is negative, so shouldn\'t x_A = 50 + 3t?"',
      error: 'Confusion about sign convention. If positive is to the right and A is moving left, then A\'s velocity is −3 m/s. x_A = 50 + (−3)t = 50 − 3t. The student\'s formula was correct. The mistake was second-guessing a correct sign.',
      fix: 'Before writing any formula, explicitly state: "Positive = rightward." Then apply this consistently: leftward motion → negative velocity. Once the sign convention is stated, never second-guess it mid-problem.',
    },
  ],

  mastery: {
    targetLevel: 'Given two objects with known initial positions and velocities (constant), you can set up x(t) for each, solve for meeting time and position, verify the answer, and correctly handle edge cases (no meeting, past meeting).',
    checklistItems: [
      'Write x(t) = x₀ + v·t for each object in the same coordinate system',
      'Set x_A(t) = x_B(t) and solve for t algebraically',
      'Check physical validity: t ≥ 0',
      'Find meeting position by substituting t_meet back into either position function',
      'Cross-check: x_A(t_meet) = x_B(t_meet) numerically',
      'Correctly identify "never meet" case (v_A = v_B with nonzero gap)',
      'Correctly interpret t < 0 (meeting in the past, no future meeting)',
    ],
    commonStruggles: [
      'Confusing meeting condition (same position) with velocity equality',
      'Forgetting initial positions in the check: x_B(t) = x_B0 + v_B·t, not just v_B·t',
      'Sign convention errors when one object moves in the negative direction',
      'Applying the formula without checking if the result is physically meaningful (t ≥ 0)',
    ],
    nextSteps: 'Lesson ch2-021 extends to accelerated objects (one or both moving with acceleration). The same technique applies — write x(t) for each, set equal, but now you solve a quadratic instead of a linear equation.',
  },

  notebooks: {
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Two-Object Meeting — Algebraic Solution in MATLAB',
          type: 'code',
          language: 'matlab',
          prose: [
            'MATLAB handles the two-object meeting formula directly. The key is vectorizing the edge-case logic and using MATLAB\'s `roots()` for the accelerated case.',
          ],
          code: `%% Two-object meeting — constant velocity case
% Car A: x0=0, v=20 m/s | Car B: x0=100, v=15 m/s

x_A0 = 0;   v_A = 20;   % m, m/s
x_B0 = 100; v_B = 15;   % m, m/s

dv = v_A - v_B;           % relative (closing) velocity
dx = x_B0 - x_A0;         % initial separation

if abs(dv) < 1e-9
    if abs(dx) < 1e-9
        fprintf('Objects start at same position (already meeting).\\n');
    else
        fprintf('Same velocity, different positions — they never meet.\\n');
    end
else
    t_meet = dx / dv;
    if t_meet < 0
        fprintf('Meeting time t = %.2f s (in the past — no future meeting).\\n', t_meet);
    else
        x_meet = x_A0 + v_A * t_meet;
        fprintf('Meeting time    : t = %.2f s\\n', t_meet);
        fprintf('Meeting position: x = %.2f m\\n', x_meet);
        fprintf('Cross-check x_B : %.2f m\\n', x_B0 + v_B * t_meet);
    end
end`,
        },
        {
          cellTitle: 'Graphical Solution — x(t) Curves for Both Objects',
          type: 'code',
          language: 'matlab',
          prose: [
            'Plotting both position curves on one graph makes the meeting visually obvious: the intersection of the two lines is the meeting event.',
          ],
          code: `%% Graphical meeting — plot x(t) for both objects
x_A0 = 0;   v_A = 20;
x_B0 = 100; v_B = 15;

t_meet = (x_B0 - x_A0) / (v_A - v_B);
x_meet = x_A0 + v_A * t_meet;

t = linspace(0, t_meet*1.3, 300);
x_A = x_A0 + v_A.*t;
x_B = x_B0 + v_B.*t;

figure;
plot(t, x_A, 'b-', 'LineWidth', 2, 'DisplayName', sprintf('Car A: x = %g + %gt', x_A0, v_A));
hold on;
plot(t, x_B, 'r-', 'LineWidth', 2, 'DisplayName', sprintf('Car B: x = %g + %gt', x_B0, v_B));
plot(t_meet, x_meet, 'ko', 'MarkerSize', 10, 'MarkerFaceColor', 'orange', ...
     'DisplayName', sprintf('Meet: t=%.1fs, x=%.0fm', t_meet, x_meet));
xline(t_meet, '--k', 'LineWidth', 0.8, 'HandleVisibility', 'off');
xlabel('Time (s)'); ylabel('Position x (m)');
title('Two-object meeting — x(t) curves');
legend('Location', 'northwest'); grid on;`,
        },
        {
          cellTitle: 'Challenge — Head-On Collision Timing',
          type: 'code',
          language: 'matlab',
          code: `%% Challenge: head-on meeting
% Object A: starts at x=0, moves right at 8 m/s
% Object B: starts at x=120, moves LEFT at 12 m/s
%
% Task 1: Write x_A and x_B as MATLAB anonymous functions.
%         Remember: moving left means NEGATIVE velocity.
%
% Task 2: Compute meeting time t_meet algebraically.
%
% Task 3: Find meeting position x_meet.
%
% Task 4: Plot both x(t) curves from t=0 to 1.2*t_meet.
%         Mark the meeting point.

x_A0 = 0;   v_A = 8;
x_B0 = 120; v_B = -12;   % negative: moving left

% Task 1
x_A_fun = @(t) % YOUR CODE HERE
x_B_fun = @(t) % YOUR CODE HERE

% Task 2
t_meet = % YOUR CODE HERE

% Task 3
x_meet = % YOUR CODE HERE

fprintf('Meeting at t = %.2f s, x = %.2f m\\n', t_meet, x_meet);

% Task 4 (plotting)
t = linspace(0, t_meet*1.2, 300);
figure; hold on;
% YOUR PLOT CODE HERE`,
          prose: [],
        },
      ],
    },
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch2-020-q1',
      question: `Car A is at $x = 0$ with $v_A = 20$ m/s. Car B is at $x = 100$ m with $v_B = 15$ m/s. When do they meet?`,
      options: [`10 s`, `20 s`, `25 s`, `5 s`],
      answer: 1,
      explanation: `$x_A = 20t$ and $x_B = 100 + 15t$. Set equal: $20t = 100 + 15t \\Rightarrow 5t = 100 \\Rightarrow t = 20$ s.`,
    },
    {
      id: 'p1-ch2-020-q2',
      question: `For the same problem, where do the cars meet?`,
      options: [`200 m`, `300 m`, `400 m`, `500 m`],
      answer: 2,
      explanation: `$x_{meet} = x_A(20) = 20 \\times 20 = 400$ m. Cross-check: $x_B(20) = 100 + 15(20) = 400$ m ✓.`,
    },
    {
      id: 'p1-ch2-020-q3',
      question: `Object A is at $x = 0$ moving right at 8 m/s. Object B is at $x = 120$ m moving left at 12 m/s. When do they meet?`,
      options: [`6 s`, `8 s`, `10 s`, `12 s`],
      answer: 0,
      explanation: `$x_A = 8t$, $x_B = 120 - 12t$. Set equal: $8t = 120 - 12t \\Rightarrow 20t = 120 \\Rightarrow t = 6$ s.`,
    },
    {
      id: 'p1-ch2-020-q4',
      question: `Two objects have the same velocity but different initial positions. What happens?`,
      options: [
        `They meet eventually because they have the same speed`,
        `They never meet — the separation remains constant`,
        `They meet instantly`,
        `The faster one catches up`,
      ],
      answer: 1,
      explanation: `Relative velocity = $v_A - v_B = 0$. With zero closing speed, the gap $|x_B - x_A|$ never changes. They never meet (unless they start at the same position).`,
    },
    {
      id: 'p1-ch2-020-q5',
      question: `The meeting condition for two objects is:`,
      options: [
        `$v_A = v_B$`,
        `$x_A(t) = x_B(t)$`,
        `$a_A = a_B$`,
        `$x_A(0) = x_B(0)$`,
      ],
      answer: 1,
      explanation: `Two objects meet when they are at the same position at the same time: $x_A(t) = x_B(t)$. Equal velocities, accelerations, or initial positions are NOT required.`,
    },
    {
      id: 'p1-ch2-020-q6',
      question: `The "relative-motion" form of a two-object meeting problem uses:`,
      options: [
        `$x_{rel} = x_A + x_B$ — sum of positions`,
        `$x_{rel} = x_A - x_B$ — difference of positions; meeting when $x_{rel} = 0$`,
        `$v_{rel} = v_A + v_B$ — sum of velocities`,
        `$v_{rel} = v_A - v_B$ only if they move in the same direction`,
      ],
      answer: 1,
      explanation: `Define relative position $x_{rel}(t) = x_A(t) - x_B(t)$. Meeting occurs exactly when $x_{rel} = 0$. The relative-velocity formula is $t = -(x_{A0} - x_{B0})/(v_A - v_B) = (x_{B0} - x_{A0})/(v_A - v_B)$.`,
    },
    {
      id: 'p1-ch2-020-q7',
      question: `On an x–t graph, what does the meeting of two objects look like?`,
      options: [
        `Their velocity lines cross`,
        `Their position curves intersect at one point`,
        `One curve has a steeper slope`,
        `Both curves reach the same slope simultaneously`,
      ],
      answer: 1,
      explanation: `Each object traces a curve (or line) of position vs time. They meet when the two curves share a point — same $x$ value at the same $t$ value. That intersection point is the meeting event.`,
    },
    {
      id: 'p1-ch2-020-q8',
      question: `A solver returns a meeting time of $t = -5$ s. What does this mean physically?`,
      options: [
        `The objects met 5 s ago — no future meeting with these initial conditions`,
        `The objects will meet in 5 s`,
        `The calculation is wrong — time can't be negative`,
        `The objects are moving apart`,
      ],
      answer: 0,
      explanation: `$t < 0$ means the equations say the meeting happened before $t = 0$ (before the scenario began). In the future ($t > 0$), the objects are diverging. No physical meeting will occur under these initial conditions.`,
    },
  ],
};

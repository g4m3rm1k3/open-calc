// FILE: src/content/chapter-4/04b-initial-value-problems.js
export default {
  id: 'ch4-004b',
  slug: 'initial-value-problems',
  chapter: 4,
  order: 4.5,
  title: 'Initial Value Problems',
  subtitle: 'From a family of functions to the one that fits — differential equations, integration, and uniqueness',
  tags: [
    'initial value problems', 'IVP', 'differential equations', 'ODE', 'general solution',
    'particular solution', 'separation of variables', 'integrating factor', 'exponential decay',
    'population growth', 'radioactive decay', 'second-order ODE', 'characteristic equation',
    'Euler method', 'Picard-Lindelöf', 'existence uniqueness', 'Newton cooling', 'constant of integration',
  ],

  learningObjectives: [
    'Explain what a differential equation is and why its solution is a function, not a number.',
    'Define a general solution (family of functions) and a particular solution, and explain what the constant of integration represents geometrically.',
    'State what an initial condition does: it selects exactly one curve from the family that passes through a given point.',
    'Solve first-order separable ODEs by separating variables and integrating both sides — with full algebraic justification.',
    'Solve first-order linear ODEs using the integrating factor method — deriving the integrating factor from scratch, not memorizing it.',
    'Apply the characteristic equation to solve second-order linear homogeneous ODEs with constant coefficients (distinct real roots, repeated root, complex roots).',
    'Use Euler\'s method to numerically approximate the solution of an IVP and explain what it is doing geometrically.',
    'Verify any proposed solution by substituting back into the differential equation and confirming the initial condition.',
  ],

  warmup: {
    title: 'Warm-Up: Prerequisites Check',
    instructions: 'Initial value problems require fluency with three skills: differentiation, integration, and algebra. Confirm each before starting.',
    problems: [
      {
        prompt: 'Differentiate $y = 5e^{-2x}$.',
        answer: '$y\' = -10e^{-2x}$. (Chain rule: derivative of $e^{kx}$ is $ke^{kx}$.)',
        hint: 'The chain rule says $\\frac{d}{dx}[e^{g(x)}] = g\'(x) e^{g(x)}$. Here $g(x) = -2x$.',
      },
      {
        prompt: 'Evaluate $\\int \\frac{1}{y}\\,dy$.',
        answer: '$\\ln|y| + C$. This is one of the fundamental antiderivative rules.',
        hint: '$\\frac{d}{dx}[\\ln|x|] = \\frac{1}{x}$, so read it backwards.',
      },
      {
        prompt: 'Solve for $C$: $3 = 2(0)^2 + C$.',
        answer: '$C = 3$. Substituting $x = 0$ into $y = 2x^2 + C$ with $y(0) = 3$ gives $3 = 0 + C$.',
        hint: 'Plug $x = 0$ into the equation and solve.',
      },
    ],
  },

  hook: {
    question: 'You know how to find the derivative of any function. Now consider the reverse question: given a rule about HOW a function changes, can you find the function itself? A stretched spring pushes back proportional to its stretch. A cooling cup of coffee loses heat proportional to the temperature gap with the room. Bacteria multiply at a rate proportional to how many already exist. These are all the same mathematical question — and it is not "what is the value at x?" It is "what IS the function?" That question is called an initial value problem, and answering it is what integration is actually for.',
    realWorldContext: 'Initial value problems are the mathematical engine behind virtually every scientific model that involves change over time. The trajectory of a satellite (Newton\'s second law gives acceleration, integrate twice to get position). The spread of an epidemic (the SIR model is a system of IVPs). Drug dosage schedules (drug concentration decays at a rate proportional to current concentration — solve the IVP to find when to administer the next dose). RC circuit charging (current and voltage evolve according to a first-order IVP). Population dynamics, predator-prey models, climate models — all IVPs. Every time you see "solve the differential equation with initial condition," you are doing applied mathematics at its most direct.',
    previewVisualizationId: 'SlopeField',
    previewVisualizationProps: {},
  },

  intuition: {
    prose: [
      '**The most important conceptual shift in this lesson.** In algebra, you solve for a **number**. The equation $x^2 + 3 = 7$ has the solution $x = 2$. You found a point. In a differential equation, you solve for a **function**. The equation $\\frac{dy}{dx} = 2x$ has the solution $y = x^2 + C$. You found a curve — or rather, a whole family of curves. This is not a small difference. It changes what "solving" means, what "checking" means, and what the constant of integration means. Keep this distinction sharp throughout this lesson.',

      '**Why integration is the tool.** A differential equation like $\\frac{dy}{dx} = 2x$ is saying: "I know the slope of the function at every point. What is the function?" You are being given the derivative and asked for the original. That is exactly the definition of antidifferentiation — inverting the derivative. So you integrate both sides with respect to $x$: $\\int \\frac{dy}{dx}\\,dx = \\int 2x\\,dx$, which gives $y = x^2 + C$. The integration step is not a trick — it is the direct logical inversion of differentiation. You are un-doing the derivative.',

      '**The family of curves — what $+C$ really means geometrically.** The general solution $y = x^2 + C$ is not one curve; it is infinitely many. Every different value of $C$ shifts the parabola up or down. $C = 0$ gives $y = x^2$; $C = 5$ gives $y = x^2 + 5$; $C = -3$ gives $y = x^2 - 3$. All of these curves have the same slope at every $x$-value (they are all identical except for vertical position), so they all satisfy $y\' = 2x$ equally well. You cannot distinguish them from the derivative alone — the constant was lost when you differentiated.',

      '**What the initial condition does — picking the one curve.** An initial condition $y(0) = 5$ is a geometric instruction: "select the member of the family that passes through the point $(0, 5)$." Substitute: $5 = 0^2 + C$, so $C = 5$. The unique solution is $y = x^2 + 5$. Every other curve in the family is excluded. This is why IVPs have exactly one answer (when the right smoothness conditions hold): the initial condition is precisely the extra piece of information that determines $C$. Without it, there is no particular solution — only the family.',

      '**Exponentials and differential equations — why they are inseparable.** The exponential function $e^x$ has a remarkable property: $\\frac{d}{dx}[e^x] = e^x$. It is the only elementary function whose rate of change equals itself. This means: whenever a quantity\'s rate of change is proportional to itself — radioactive decay, population growth, drug clearance, compound interest — the solution involves $e^x$. The DE $\\frac{dy}{dx} = ky$ says "the function grows (or shrinks) at rate proportional to its current value." The solution is always $y = Ce^{kx}$. Exponentials are not a coincidence in these models; they are the inevitable consequence of "rate proportional to amount."',

      '**The slope field: seeing the DE without solving it.** A slope field is a grid of tiny arrows. At each point $(x, y)$, the arrow\'s slope is the value that $y\'$ takes there, as given by the DE. The slope field for $y\' = 2x$ has arrows sloping up on the right (slope = $2x > 0$ for $x > 0$), flat at $x = 0$, and sloping down on the left. Every solution curve must be tangent to the arrows it passes through — the arrows are the "instructions" and the solution is a curve that follows all of them simultaneously. The initial condition places your starting point; from there you follow the arrows. This is the geometric meaning of the IVP.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Where IVPs Fit in Chapter 4',
        body: '**Previous (Lesson 4):** Indefinite integrals — antiderivatives, $+C$, the power rule, and the basic integration table.\\n**This lesson (Lesson 4b):** Initial value problems — using integration to solve DEs, fixing $C$ with initial conditions.\\n**Next (Lesson 5):** Applications of integration — area between curves, average value, net change.\\n**Why it matters:** IVPs are where integration meets physics, biology, economics, and engineering. Nearly every applied problem reduces to an IVP.',
      },
      {
        type: 'definition',
        title: 'Differential Equation',
        body: `A **differential equation** is an equation relating an unknown function to its own derivatives.\\n\\n\\\\[\\\\frac{dy}{dx} = 2x \\\\quad \\\\text{(first-order)}\\\\]\\n\\\\[y'' - 3y' + 2y = 0 \\\\quad \\\\text{(second-order)}\\\\]\\n\\nThe **order** = highest derivative present. The **solution** is a function (not a number).`,
      },
      {
        type: 'definition',
        title: 'Initial Value Problem (IVP)',
        body: `An IVP is a differential equation paired with enough conditions at a single starting point to determine all constants:\\n\\n\\\\[\\\\frac{dy}{dx} = f(x, y), \\\\quad y(x_0) = y_0\\\\]\\n\\nThe point $(x_0, y_0)$ is the **initial condition** — it selects the unique solution curve passing through that point.`,
      },
      {
        type: 'insight',
        title: 'Algebra vs Differential Equations — What You Are Solving For',
        body: `**Algebra:** $x^2 + 3 = 7$ → solve for a **number**: $x = 2$\\n\\n**DE:** $y' = 2x$ → solve for a **function**: $y = x^2 + C$\\n\\n**IVP:** $y' = 2x$, $y(0) = 5$ → solve for the **specific function**: $y = x^2 + 5$\\n\\nThe solution to a DE is a curve. The initial condition picks which curve.`,
      },
      {
        type: 'theorem',
        title: 'Existence and Uniqueness (Picard–Lindelöf, informal)',
        body: `For the IVP $y' = f(x,y)$, $y(x_0) = y_0$:\\nIf $f$ and $\\\\frac{\\\\partial f}{\\\\partial y}$ are **continuous** in a rectangle around $(x_0, y_0)$,\\nthen there exists a **unique** solution in some interval around $x_0$.\\n\\nTranslation: if the rate-of-change rule is smooth near the starting point, the IVP has exactly one answer.`,
      },
    ],
    visualizations: [
      {
        id: 'SlopeField',
        title: 'Slope fields — the DE as a map of directions',
        mathBridge: 'Switch between functions using the dropdown. Each arrow at $(x, y)$ shows the slope that a solution curve must have there. The red curve is one actual solution. Try the quadratic: $f(x) = x^2$. The slope field for $y\' = 2x$ would have flat arrows at $x = 0$, rising arrows to the right, and falling arrows to the left — and the family $y = x^2 + C$ gives all the solution curves. Toggle "Show Curve" to see how one curve rides the arrows. This is what the initial condition does: it puts your starting point on exactly one of those curves.',
        caption: 'A slope field makes the DE visible before solving it. Every solution curve must be tangent to every arrow it crosses.',
      },
      {
        id: 'IVPFamilyCurves',
        title: 'The family of curves — click to place the initial condition',
        mathBridge: 'This visualization (to be built) will show $y = x^2 + C$ for many values of $C$ simultaneously. Click anywhere on the graph to set an initial condition $y(x_0) = y_0$. The one curve that passes through your clicked point lights up — that is the particular solution for that IC. Change the IC and a different curve activates. This is the geometric heart of IVPs.',
        caption: 'The family $y = x^2 + C$ fills the plane. The initial condition picks exactly one.',
        props: { equation: 'y = x^2 + C', placeholder: true },
      },
    ],
  },

  math: {
    prose: [
      '**Solving separable first-order IVPs — the algorithm.** Many first-order DEs can be written as $\\frac{dy}{dx} = g(x)\\,h(y)$, where the $x$-terms and $y$-terms factor completely apart. The strategy: rearrange so all $y$-terms are on one side and all $x$-terms on the other, then integrate. Formally, $\\frac{dy}{h(y)} = g(x)\\,dx$ (moving $h(y)$ to denominate $dy$, treating $\\frac{dy}{dx}$ like a fraction — this is justified by differential notation from limits). Integrate both sides: $\\int \\frac{1}{h(y)}\\,dy = \\int g(x)\\,dx + C$. Solve for $y$, apply IC.',

      '**Canonical separable example, step by step.** Solve $\\frac{dy}{dx} = y$, $y(0) = 1$. Separate: $\\frac{dy}{y} = dx$ (valid for $y \\neq 0$). Integrate: $\\int \\frac{1}{y}\\,dy = \\int 1\\,dx$ → $\\ln|y| = x + C$. Exponentiate both sides: $|y| = e^{x+C} = e^C \\cdot e^x$. Let $A = \\pm e^C$ (new constant absorbing the sign): $y = Ae^x$. Apply IC: $y(0) = A = 1$ → $A = 1$. **Particular solution: $y = e^x$.**',

      '**Integrating factor for first-order linear DEs.** Not all first-order DEs are separable. The general first-order linear form is $y\' + P(x)\\,y = Q(x)$. The integrating factor method finds a multiplier $\\mu(x)$ such that the left side becomes an exact derivative. Start from the question: "What function $\\mu$ would make $\\mu y\' + \\mu P y$ equal to $\\frac{d}{dx}[\\mu y]$?" By the product rule, $\\frac{d}{dx}[\\mu y] = \\mu y\' + \\mu\' y$. Matching: we need $\\mu\' = \\mu P$. This is itself a separable DE: $\\frac{d\\mu}{\\mu} = P(x)\\,dx$ → $\\ln|\\mu| = \\int P\\,dx$ → $\\mu = e^{\\int P\\,dx}$. The integrating factor is not magic — it solves a small auxiliary DE.',

      '**Integrating factor algorithm, step by step.** (1) Write in standard form: $y\' + P(x)y = Q(x)$. Identify $P$ and $Q$. (2) Compute $\\mu = e^{\\int P\\,dx}$ (no $+C$ needed here — any antiderivative of $P$ works). (3) Multiply the entire equation by $\\mu$: $\\mu y\' + \\mu P y = \\mu Q$. (4) Left side collapses: $\\frac{d}{dx}[\\mu y] = \\mu Q$. (5) Integrate both sides: $\\mu y = \\int \\mu Q\\,dx + C$. (6) Solve for $y$: $y = \\frac{1}{\\mu}\\left(\\int \\mu Q\\,dx + C\\right)$. (7) Apply IC. (8) Verify by substituting back.',

      '**Canonical integrating factor example.** Solve $y\' + 2y = 0$, $y(0) = 5$. (1) Standard form: $P = 2$, $Q = 0$. (2) $\\mu = e^{\\int 2\\,dx} = e^{2x}$. (3) Multiply: $e^{2x}y\' + 2e^{2x}y = 0$. (4) Left side $= \\frac{d}{dx}[e^{2x}y]$. (5) Integrate: $e^{2x}y = C$. (6) Solve: $y = Ce^{-2x}$. (7) Apply IC: $y(0) = Ce^0 = C = 5$ → $C = 5$. **Solution: $y = 5e^{-2x}$.** (8) Verify: $y\' = -10e^{-2x}$; left side $= -10e^{-2x} + 2(5e^{-2x}) = 0$. ✓',

      '**Second-order linear homogeneous DEs with constant coefficients.** Form: $ay\'\' + by\' + cy = 0$. The approach: guess $y = e^{rx}$ (this guess works because exponentials reproduce themselves under differentiation). Substituting: $ar^2e^{rx} + bre^{rx} + ce^{rx} = 0$. Factor out $e^{rx} \\neq 0$: $ar^2 + br + c = 0$. This is the **characteristic equation** — a quadratic in $r$, solved by the quadratic formula. Three cases: (1) Distinct real roots $r_1 \\neq r_2$: general solution $y = C_1e^{r_1 x} + C_2e^{r_2 x}$. (2) Repeated root $r$: general solution $y = (C_1 + C_2 x)e^{rx}$. (3) Complex roots $\\alpha \\pm i\\beta$: general solution $y = e^{\\alpha x}(C_1\\cos(\\beta x) + C_2\\sin(\\beta x))$.',

      '**Why the guess $y = e^{rx}$ works.** The derivative of $e^{rx}$ is $re^{rx}$ — differentiating just multiplies by $r$. So $y\'\' + by\' + cy = r^2 e^{rx} + br e^{rx} + ce^{rx} = (r^2 + br + c)e^{rx}$. For this to equal zero, we need $r^2 + br + c = 0$ (since $e^{rx} \\neq 0$). The exponential turns a differential equation into a polynomial equation. This is the reason the guess works — and it is not a lucky trick, it is the algebraic consequence of how differentiation acts on exponentials.',
    ],
    keyFormulas: [
      {
        label: 'Separable ODE — General Form',
        expression: '\\frac{dy}{dx} = g(x)\\,h(y) \\quad \\Rightarrow \\quad \\int \\frac{1}{h(y)}\\,dy = \\int g(x)\\,dx + C',
        note: 'Separate variables, integrate each side independently.',
      },
      {
        label: 'Integrating Factor',
        expression: '\\mu(x) = e^{\\int P(x)\\,dx}',
        note: 'Derived by solving the auxiliary DE $\\mu\' = \\mu P$, not pulled from thin air.',
      },
      {
        label: 'General Solution (1st-order linear IVP)',
        expression: 'y = \\frac{1}{\\mu(x)}\\left(\\int \\mu(x)\\,Q(x)\\,dx + C\\right)',
        note: 'Apply the IC after integrating to find the unique value of $C$.',
      },
      {
        label: 'Characteristic Equation (2nd-order constant-coefficient)',
        expression: 'ay\'\' + by\' + cy = 0 \\quad \\Rightarrow \\quad ar^2 + br + c = 0',
        note: 'Substitute the trial solution $y = e^{rx}$ and factor out $e^{rx}$.',
      },
      {
        label: 'Exponential Growth/Decay',
        expression: '\\frac{dy}{dx} = ky \\quad \\Rightarrow \\quad y = Ce^{kx}',
        note: '$k > 0$: growth. $k < 0$: decay. This model appears in radioactivity, pharmacology, population dynamics.',
      },
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Always Verify Your Solution',
        body: 'Never submit an IVP solution without plugging it back in. Take your proposed $y$, differentiate it to find $y\'$, and substitute both into the original DE. Both sides must be identical. Then check the initial condition separately. If either check fails, there is an algebra error somewhere. The verification step is not optional — it is the only way to know your answer is correct.',
      },
      {
        type: 'insight',
        title: 'Why the Integrating Factor Comes From a DE, Not a Formula',
        body: `We want $\\mu$ such that $\\frac{d}{dx}[\\mu y] = \\mu(y' + Py)$. Expanding by the product rule: $\\mu y' + \\mu' y = \\mu y' + \\mu P y$. This forces $\\mu' = \\mu P$ — a separable DE for $\\mu$. Solving it: $\\frac{d\\mu}{\\mu} = P\\,dx$ → $\\ln\\mu = \\int P\\,dx$ → $\\mu = e^{\\int P\\,dx}$.\\n\\nThe integrating factor is the solution to an auxiliary IVP. It is derived, not memorized.`,
      },
      {
        type: 'real-world',
        title: 'Newton\'s Law of Cooling',
        body: `$\\frac{dT}{dt} = -k(T - T_\\text{room})$, $T(0) = T_0$.\\n\\nSubstitute $u = T - T_\\text{room}$: $\\frac{du}{dt} = -ku$, which is separable.\\nSolution: $T(t) = T_\\text{room} + (T_0 - T_\\text{room})e^{-kt}$.\\n\\nThe temperature gap decays exponentially toward zero. The rate constant $k$ depends on the object\'s heat capacity and surface area. This is exactly how forensics estimates time of death from body temperature.`,
      },
      {
        type: 'real-world',
        title: 'Radioactive Decay and Carbon Dating',
        body: `$\\frac{dN}{dt} = -\\lambda N$, $N(0) = N_0$.\\nSolution: $N(t) = N_0 e^{-\\lambda t}$.\\n\\nHalf-life $t_{1/2}$: solve $N_0/2 = N_0 e^{-\\lambda t_{1/2}}$ → $t_{1/2} = \\ln 2 / \\lambda$.\\nFor carbon-14: $\\lambda \\approx 1.21 \\times 10^{-4}$ per year, giving $t_{1/2} \\approx 5730$ years.\\nThis IVP solution is the foundation of radiometric dating in archaeology and geology.`,
      },
      {
        type: 'misconception',
        title: 'Solving for y When It Appears on Both Sides of the Separation',
        body: `When you exponentiate $\\ln|y| = x + C$, you get $|y| = e^{x+C} = e^C \\cdot e^x$. Students often write $y = e^C e^x$ and forget the absolute value. The correct step: $|y| = e^C e^x$, so $y = \\pm e^C e^x$. Let $A = \\pm e^C$ — a new constant that absorbs both sign choices. Write $y = Ae^x$ where $A$ can be any nonzero real number. (Technically $A = 0$ gives $y = 0$, a separate equilibrium solution — always check this.)`,
      },
      {
        type: 'prior-knowledge',
        title: 'Why $e^{rx}$ Derivatives Reproduce Themselves',
        body: `$\\frac{d}{dx}[e^{rx}] = re^{rx}$ (chain rule). Differentiating twice: $\\frac{d^2}{dx^2}[e^{rx}] = r^2 e^{rx}$.\\n\\nSo substituting $y = e^{rx}$ into $ay'' + by' + cy$:\\n$= ar^2e^{rx} + bre^{rx} + ce^{rx} = (ar^2 + br + c)e^{rx}$\\n\\nSince $e^{rx} \\neq 0$, this is zero iff $ar^2 + br + c = 0$. The DE becomes a polynomial.`,
      },
    ],
    visualizations: [
      {
        id: 'EulerMethodStepper',
        title: 'Euler\'s method — approximate the solution one step at a time',
        mathBridge: 'This visualization (to be built) will show a DE\'s slope field and let you step through Euler\'s method interactively. Starting at the IC $(x_0, y_0)$, each step: (1) read the slope from $f(x_n, y_n)$, (2) take one step of size $h$ in that direction: $y_{n+1} = y_n + h\\,f(x_n, y_n)$. Compare the approximate path (red dots connected by segments) to the exact solution (blue curve). Shrink $h$ and watch the approximation improve — at $h \\to 0$, Euler\'s method becomes exact integration.',
        caption: 'Euler\'s method: follow the tangent line direction for a tiny step, then recompute the slope and repeat.',
        props: { placeholder: true },
      },
    ],
  },

  rigor: {
    title: 'Full Derivation: Why the Integrating Factor Works',
    content: [
      {
        type: 'paragraph',
        content: 'We want to solve the general first-order linear ODE: $\\frac{dy}{dx} + P(x)\\,y = Q(x)$. The core challenge is that $y$ and $y\'$ appear together — we cannot directly integrate. The integrating factor technique transforms the left side into an exact derivative, which we can integrate immediately.',
      },
      {
        type: 'derivation',
        steps: [
          {
            expression: '\\text{Goal: find }\\mu(x)\\text{ such that }\\frac{d}{dx}[\\mu(x)\\,y] = \\mu(x)\\,y\' + \\mu\'(x)\\,y',
            annotation: 'Apply the product rule to $\\mu y$. We want this to equal $\\mu(y\' + Py)$.',
          },
          {
            expression: '\\mu y\' + \\mu\' y = \\mu y\' + \\mu P y',
            annotation: 'Expanding both sides and comparing, we need $\\mu\' y = \\mu P y$ at every $y$ — so $\\mu\' = \\mu P$.',
          },
          {
            expression: '\\frac{d\\mu}{\\mu} = P(x)\\,dx',
            annotation: 'Separate variables. This is itself a separable ODE for the unknown $\\mu$.',
          },
          {
            expression: '\\int \\frac{d\\mu}{\\mu} = \\int P(x)\\,dx \\quad \\Rightarrow \\quad \\ln|\\mu| = \\int P(x)\\,dx',
            annotation: 'Integrate both sides. Use $\\int \\frac{1}{\\mu}\\,d\\mu = \\ln|\\mu|$.',
          },
          {
            expression: '\\mu(x) = e^{\\int P(x)\\,dx}',
            annotation: 'Exponentiate. We take the positive root and drop the $\\pm$ since any nonzero $\\mu$ works.',
          },
          {
            expression: '\\text{Multiply DE by }\\mu:\\quad \\mu y\' + \\mu P y = \\mu Q \\quad \\Rightarrow \\quad \\frac{d}{dx}[\\mu y] = \\mu Q',
            annotation: 'Left side is now $\\frac{d}{dx}[\\mu y]$ by design — this is why we constructed $\\mu$.',
          },
          {
            expression: '\\mu y = \\int \\mu(x)\\,Q(x)\\,dx + C',
            annotation: 'Integrate both sides. Right side may require a specific technique (u-substitution, parts, etc.).',
          },
          {
            expression: 'y = \\frac{1}{\\mu(x)}\\left(\\int \\mu(x)\\,Q(x)\\,dx + C\\right)',
            annotation: 'Divide by $\\mu(x)$ to get the general solution. Apply IC to find $C$.',
          },
        ],
      },
      {
        type: 'paragraph',
        content: 'The integrating factor is not a formula you apply blindly — it is the solution to an auxiliary problem. Every step is justified: the product rule tells you what $\\mu$ must satisfy, and separation of variables tells you what $\\mu$ is. The method works because we engineered $\\mu$ precisely to make the left side collapsible.',
      },
    ],
    visualizations: [
      {
        id: 'IntegratingFactorViz',
        title: 'Before and after the integrating factor — left side before is not a derivative, after it is',
        mathBridge: 'This visualization (to be built) will show the DE before multiplying by $\\mu$ (left side: two separate terms that are not a combined derivative) versus after multiplying (left side: one derivative of a product). Animate the algebraic transformation step by step.',
        caption: 'The integrating factor reorganizes the equation so the left side becomes something you can integrate directly.',
        props: { placeholder: true },
      },
    ],
  },

  examples: [
    {
      id: 'ch4-004b-ex1',
      title: 'Separable — exponential growth',
      problem: 'Solve the IVP: $\\frac{dy}{dx} = 3y$, $y(0) = 2$.',
      steps: [
        {
          expression: '\\frac{dy}{y} = 3\\,dx',
          annotation: 'Separate: divide both sides by $y$ (valid for $y \\neq 0$), multiply both sides by $dx$.',
        },
        {
          expression: '\\int \\frac{1}{y}\\,dy = \\int 3\\,dx',
          annotation: 'Integrate both sides independently.',
        },
        {
          expression: '\\ln|y| = 3x + C',
          annotation: '$\\int \\frac{1}{y}\\,dy = \\ln|y|$; $\\int 3\\,dx = 3x$. Include one $+C$ on one side.',
        },
        {
          expression: '|y| = e^{3x + C} = e^C \\cdot e^{3x}',
          annotation: 'Exponentiate both sides. Use $e^{a+b} = e^a e^b$.',
        },
        {
          expression: 'y = Ae^{3x} \\quad (A = \\pm e^C)',
          annotation: 'Let $A$ absorb the $\\pm$ and $e^C$. $A$ is any nonzero real number.',
        },
        {
          expression: 'y(0) = A = 2 \\quad \\Rightarrow \\quad y = 2e^{3x}',
          annotation: 'Apply IC: substitute $x = 0$, $y = 2$. Solve: $A = 2$.',
        },
        {
          expression: '\\text{Verify: } y\' = 6e^{3x} = 3(2e^{3x}) = 3y \\checkmark \\quad y(0) = 2 \\checkmark',
          annotation: 'Differentiate the solution, confirm it satisfies the DE. Check the IC separately.',
        },
      ],
    },
    {
      id: 'ch4-004b-ex2',
      title: 'Integrating factor — non-homogeneous',
      problem: 'Solve $y\' + \\frac{y}{x} = x$, $y(1) = 0$.',
      steps: [
        {
          expression: 'P(x) = \\frac{1}{x}, \\quad Q(x) = x',
          annotation: 'Already in standard form $y\' + Py = Q$. Identify $P$ and $Q$.',
        },
        {
          expression: '\\mu = e^{\\int \\frac{1}{x}\\,dx} = e^{\\ln x} = x',
          annotation: '$\\int \\frac{1}{x}\\,dx = \\ln x$ (for $x > 0$). Then $e^{\\ln x} = x$. The integrating factor is simply $x$.',
        },
        {
          expression: 'x y\' + y = x^2 \\quad \\Rightarrow \\quad \\frac{d}{dx}[xy] = x^2',
          annotation: 'Multiply through by $\\mu = x$. Left side collapses to $\\frac{d}{dx}[xy]$ by product rule.',
        },
        {
          expression: 'xy = \\int x^2\\,dx = \\frac{x^3}{3} + C',
          annotation: 'Integrate both sides. Right side: power rule.',
        },
        {
          expression: 'y = \\frac{x^2}{3} + \\frac{C}{x}',
          annotation: 'Divide by $x$.',
        },
        {
          expression: 'y(1) = \\frac{1}{3} + C = 0 \\quad \\Rightarrow \\quad C = -\\frac{1}{3}',
          annotation: 'Apply IC: $x = 1$, $y = 0$. Solve for $C$.',
        },
        {
          expression: 'y = \\frac{x^2}{3} - \\frac{1}{3x} = \\frac{x^3 - 1}{3x}',
          annotation: 'Particular solution. Simplify by combining over a common denominator.',
        },
        {
          expression: '\\text{Verify: } y\' = \\frac{2x}{3} + \\frac{1}{3x^2}. \\quad y\' + \\frac{y}{x} = \\frac{2x}{3} + \\frac{1}{3x^2} + \\frac{x}{3} - \\frac{1}{3x^2} = x \\checkmark',
          annotation: 'Differentiate and substitute into the original DE.',
        },
      ],
    },
    {
      id: 'ch4-004b-ex3',
      title: 'Second-order — distinct real roots',
      problem: 'Solve $y\'\' - 3y\' + 2y = 0$, $y(0) = 1$, $y\'(0) = 0$.',
      steps: [
        {
          expression: 'r^2 - 3r + 2 = 0',
          annotation: 'Write the characteristic equation by substituting $y = e^{rx}$ and factoring out $e^{rx}$.',
        },
        {
          expression: '(r-1)(r-2) = 0 \\quad \\Rightarrow \\quad r_1 = 1,\\; r_2 = 2',
          annotation: 'Factor the quadratic. Two distinct real roots.',
        },
        {
          expression: 'y = C_1 e^x + C_2 e^{2x}',
          annotation: 'General solution for distinct real roots: sum of two exponentials.',
        },
        {
          expression: 'y\' = C_1 e^x + 2C_2 e^{2x}',
          annotation: 'Differentiate the general solution to find $y\'$. Needed for the second IC.',
        },
        {
          expression: 'y(0) = C_1 + C_2 = 1 \\quad \\text{and} \\quad y\'(0) = C_1 + 2C_2 = 0',
          annotation: 'Apply both ICs at $x = 0$. This gives a $2 \\times 2$ linear system.',
        },
        {
          expression: 'C_2 = -1, \\quad C_1 = 2',
          annotation: 'Subtract the first equation from the second: $C_2 = -1$. Then $C_1 = 1 - C_2 = 2$.',
        },
        {
          expression: 'y = 2e^x - e^{2x}',
          annotation: 'Particular solution. Verify: $y\'\' - 3y\' + 2y = (2e^x - 4e^{2x}) - 3(2e^x - 2e^{2x}) + 2(2e^x - e^{2x}) = 0$ ✓',
        },
      ],
    },
    {
      id: 'ch4-004b-ex4',
      title: 'Real world — Newton\'s law of cooling',
      problem: 'A cup of coffee cools from 90°C to 70°C in 5 minutes in a 20°C room. When does the temperature reach 40°C?',
      steps: [
        {
          expression: '\\frac{dT}{dt} = -k(T - 20), \\quad T(0) = 90',
          annotation: 'Newton\'s law of cooling: rate of change proportional to difference from ambient. Room temp = 20°C.',
        },
        {
          expression: 'u = T - 20 \\quad \\Rightarrow \\quad \\frac{du}{dt} = -ku, \\quad u(0) = 70',
          annotation: 'Substitution: let $u$ = excess temperature above room. Converts to standard exponential decay.',
        },
        {
          expression: 'u(t) = 70e^{-kt}',
          annotation: 'Separable DE $u\' = -ku$ with $u(0) = 70$ → exponential solution.',
        },
        {
          expression: 'u(5) = 70 - 20 = 50 \\quad \\Rightarrow \\quad 50 = 70e^{-5k}',
          annotation: 'At $t = 5$ min, $T = 70°C$, so $u = 50$. Solve for $k$.',
        },
        {
          expression: 'e^{-5k} = \\frac{5}{7} \\quad \\Rightarrow \\quad k = \\frac{\\ln(7/5)}{5} \\approx 0.0673',
          annotation: 'Take $\\ln$ of both sides. $k \\approx 0.0673$ min$^{-1}$.',
        },
        {
          expression: 'T = 40 \\Rightarrow u = 20 = 70e^{-kt} \\Rightarrow t = \\frac{\\ln(70/20)}{k} = \\frac{\\ln(3.5)}{0.0673} \\approx 18.6\\text{ min}',
          annotation: 'Solve for $t$ when $u = 20$. Coffee reaches 40°C after about 18.6 minutes.',
        },
      ],
    },
  ],

  checkpoints: [
    {
      id: 'cp-ivp-1',
      question: 'What is the difference between a general solution and a particular solution of a first-order ODE? What does the graph of the general solution look like, and what does the initial condition do to it?',
      answer: 'The **general solution** is the family $y = F(x) + C$ — infinitely many curves, one for each value of $C$. On a graph, these are vertically shifted copies of one another (for a first-order DE). Each curve satisfies the DE. The **particular solution** is the specific member of the family that also passes through the initial point $(x_0, y_0)$. The initial condition $y(x_0) = y_0$ gives one equation in one unknown ($C$), selecting a unique curve from the family.',
    },
    {
      id: 'cp-ivp-2',
      question: 'Where does the integrating factor $\\mu = e^{\\int P\\,dx}$ come from? Why is no $+C$ needed when computing $\\int P\\,dx$ to find $\\mu$?',
      answer: 'The integrating factor solves the auxiliary DE $\\mu\' = \\mu P(x)$. Separating: $d\\mu/\\mu = P\\,dx$ → $\\ln|\\mu| = \\int P\\,dx$ → $\\mu = e^{\\int P\\,dx}$. No $+C$ is needed because we only need **any** particular $\\mu$ that makes the left side collapse — adding a constant to $\\int P\\,dx$ would multiply $\\mu$ by an extra constant $e^C$, which would just cancel when we divide by $\\mu$ at the end. Any nonzero choice works; the simplest is $C = 0$.',
    },
    {
      id: 'cp-ivp-3',
      question: 'Explain in two sentences why the trial solution $y = e^{rx}$ converts a second-order linear ODE with constant coefficients into a polynomial equation in $r$.',
      answer: `Differentiating $e^{rx}$ repeatedly gives $r e^{rx}$, $r^2 e^{rx}$, etc. — each derivative is just a multiple of $e^{rx}$ itself. So substituting into $ay'' + by' + cy = 0$ gives $(ar^2 + br + c)e^{rx} = 0$, and since $e^{rx} \\neq 0$, the problem reduces to the polynomial equation $ar^2 + br + c = 0$.`,
    },
  ],

  challenges: [
    {
      id: 'chal-ivp-1',
      difficulty: 'medium',
      title: 'Logistic growth — nonlinear but separable',
      problem: 'Solve $\\frac{dP}{dt} = rP\\left(1 - \\frac{P}{K}\\right)$, $P(0) = P_0$, where $r$ and $K$ are positive constants. This is the **logistic equation** — the Malthus model corrected for limited resources.',
      hint: 'Use partial fractions on $\\frac{1}{P(1 - P/K)}$ before integrating. Write $\\frac{1}{P(K-P)/K} = \\frac{1}{P} + \\frac{1}{K-P}$ (verify this algebraically first).',
      answer: '$P(t) = \\frac{K P_0 e^{rt}}{K - P_0 + P_0 e^{rt}}$. As $t \\to \\infty$: $P \\to K$ (carrying capacity). When $P \\ll K$: $P \\approx P_0 e^{rt}$ (Malthus model as a limiting case).',
    },
    {
      id: 'chal-ivp-2',
      difficulty: 'medium',
      title: 'Spring-mass — complex roots',
      problem: 'Solve $y\'\' + 4y = 0$, $y(0) = 3$, $y\'(0) = -2$.',
      hint: 'Characteristic equation: $r^2 + 4 = 0$ → $r = \\pm 2i$. Use the complex roots case: $\\alpha = 0$, $\\beta = 2$.',
      answer: '$y = 3\\cos(2x) - \\sin(2x)$. This represents undamped oscillation with angular frequency $\\omega = 2$.',
    },
    {
      id: 'chal-ivp-3',
      difficulty: 'hard',
      title: 'Derive the half-life formula from the decay IVP',
      problem: 'Starting from $\\frac{dN}{dt} = -\\lambda N$, $N(0) = N_0$: (a) solve the IVP, (b) define the half-life $t_{1/2}$ as the time when $N = N_0/2$, (c) derive the formula $t_{1/2} = \\frac{\\ln 2}{\\lambda}$, (d) show that after $n$ half-lives, $N = N_0 / 2^n$.',
      hint: 'For part (d), substitute $t = n \\cdot t_{1/2}$ into your solution from part (a).',
      answer: '(a) $N = N_0 e^{-\\lambda t}$. (b-c) $N_0/2 = N_0 e^{-\\lambda t_{1/2}}$ → $1/2 = e^{-\\lambda t_{1/2}}$ → $\\ln(1/2) = -\\lambda t_{1/2}$ → $t_{1/2} = \\ln 2 / \\lambda$. (d) $N(n t_{1/2}) = N_0 e^{-\\lambda n (\\ln 2/\\lambda)} = N_0 e^{-n \\ln 2} = N_0 (e^{\\ln 2})^{-n} = N_0 / 2^n$.',
    },
  ],

  python: {
    title: 'Solving IVPs Numerically and Symbolically in Python',
    intro: 'Python can solve IVPs three ways: (1) numerically with `scipy.integrate.solve_ivp`, (2) symbolically with `sympy.dsolve`, and (3) manually implementing Euler\'s method. All three approaches appear below — compare their outputs.',
    cells: [
      {
        id: 1,
        cellTitle: 'Stage 1 — Symbolic Solution with SymPy',
        prose: 'SymPy can solve IVPs symbolically. It will find the exact closed-form solution and apply the initial condition for you.',
        instructions: 'Run the cell. Then change the IC from y(0)=1 to y(0)=3 and observe how the solution changes.',
        code:
`from sympy import *

x = symbols('x')
y = Function('y')

# Define the ODE: y' = 3y
ode = Eq(y(x).diff(x), 3 * y(x))

# Solve with initial condition y(0) = 1
solution = dsolve(ode, y(x), ics={y(0): 1})
print("Solution:", solution)
print("\\nExpanded:", simplify(solution.rhs))

# Verify: differentiate the RHS and check it equals 3 * RHS
rhs = solution.rhs
lhs_check = diff(rhs, x)
print(f"\\nVerification: dy/dx = {lhs_check}, 3y = {3*rhs}")
print("Match:", simplify(lhs_check - 3*rhs) == 0)`,
        output: '',
        status: 'idle',
      },
      {
        id: 2,
        cellTitle: 'Stage 2 — Numerical Solution with SciPy',
        prose: 'scipy.integrate.solve_ivp uses sophisticated numerical algorithms (Runge-Kutta by default) to approximate solutions. This works even when no closed form exists.',
        instructions: 'Run, then change the ODE to a nonlinear one like `return y**2` and watch it still work.',
        code:
`import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp

# IVP: dy/dx = 3y, y(0) = 1
def f(x, y):
    return 3 * y  # dy/dx = 3y

y0 = [1.0]
x_span = (0, 2)
x_eval = np.linspace(0, 2, 200)

sol = solve_ivp(f, x_span, y0, t_eval=x_eval, dense_output=True)

# Exact solution for comparison
x_vals = sol.t
y_exact = np.exp(3 * x_vals)

plt.figure(figsize=(8, 4))
plt.plot(x_vals, sol.y[0], 'b-', linewidth=2, label='SciPy numerical')
plt.plot(x_vals, y_exact, 'r--', linewidth=1.5, label='Exact: y = e^{3x}')
plt.xlabel('x'), plt.ylabel('y'), plt.title("IVP: y' = 3y, y(0) = 1")
plt.legend(), plt.grid(alpha=0.3), plt.tight_layout(), plt.show()

max_error = np.max(np.abs(sol.y[0] - y_exact))
print(f"Max error vs exact: {max_error:.2e}")`,
        output: '',
        status: 'idle',
      },
      {
        id: 3,
        cellTitle: "Stage 3 — Euler's Method From Scratch",
        prose: "Euler's method: at each step, use the current slope to predict the next y-value. It's the simplest numerical ODE solver, and building it from scratch makes the idea completely transparent.",
        instructions: "Run with h=0.5, then change to h=0.1, h=0.05. Observe how accuracy improves as step size shrinks.",
        code:
`import numpy as np
import matplotlib.pyplot as plt

def euler_method(f, x0, y0, x_end, h):
    """
    Euler's method for IVP y' = f(x,y), y(x0) = y0
    h = step size
    Returns arrays of x and y values.
    """
    xs = [x0]
    ys = [y0]
    x, y = x0, y0
    while x < x_end - 1e-10:
        slope = f(x, y)          # slope at current point
        y = y + h * slope        # step forward
        x = x + h
        xs.append(x)
        ys.append(y)
    return np.array(xs), np.array(ys)

# IVP: y' = 3y, y(0) = 1, exact solution y = e^(3x)
def f(x, y):
    return 3 * y

h_values = [0.5, 0.1, 0.05]
x_exact = np.linspace(0, 2, 500)
y_exact = np.exp(3 * x_exact)

plt.figure(figsize=(10, 5))
plt.plot(x_exact, y_exact, 'k-', linewidth=2, label='Exact: y = e^{3x}', zorder=5)

colors = ['red', 'orange', 'green']
for h, color in zip(h_values, colors):
    xs, ys = euler_method(f, 0, 1, 2, h)
    plt.plot(xs, ys, 'o-', color=color, markersize=3, linewidth=1.5, label=f"Euler h={h}")

plt.xlabel('x'), plt.ylabel('y')
plt.title("Euler's Method vs Exact Solution")
plt.legend(), plt.grid(alpha=0.3), plt.ylim(0, 500), plt.tight_layout(), plt.show()

# Print error at x = 2
for h in h_values:
    xs, ys = euler_method(f, 0, 1, 2, h)
    error = abs(ys[-1] - np.exp(6))
    print(f"h = {h}: y(2) ≈ {ys[-1]:.4f}, exact = {np.exp(6):.4f}, error = {error:.4f}")`,
        output: '',
        status: 'idle',
      },
      {
        id: 4,
        cellTitle: 'Stage 4 — Newton\'s Law of Cooling (Real-World IVP)',
        prose: 'Use the analytical solution to the cooling IVP and compare against numerical simulation. Estimate when coffee becomes unpleasantly cold.',
        instructions: 'Change room_temp or the initial temperature and observe how the cooling curve shifts.',
        code:
`import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp

# Parameters
room_temp = 20    # °C
T0 = 90           # Initial coffee temperature
T_at_5min = 70    # Temperature after 5 minutes

# Find k from the measurement at t=5: T(5) = 70
# T(t) - room = (T0 - room) * e^(-kt)
# 70 - 20 = (90 - 20) * e^(-5k) => 50/70 = e^(-5k)
k = -np.log(50/70) / 5
print(f"Cooling constant k = {k:.4f} per minute")
print(f"Half-life of temperature gap: {np.log(2)/k:.1f} minutes")

# Exact solution
t = np.linspace(0, 60, 300)
T_exact = room_temp + (T0 - room_temp) * np.exp(-k * t)

# Find when T = 40°C (barely drinkable)
t_40 = -np.log((40 - room_temp) / (T0 - room_temp)) / k
print(f"\\nReaches 40°C at t = {t_40:.1f} minutes")

# Numerical check
def cooling(t, T):
    return [-k * (T[0] - room_temp)]

sol = solve_ivp(cooling, [0, 60], [T0], t_eval=t, rtol=1e-8)

plt.figure(figsize=(9, 4))
plt.plot(t, T_exact, 'b-', linewidth=2, label='Analytical solution')
plt.plot(sol.t, sol.y[0], 'r--', linewidth=1.5, label='SciPy (should match)')
plt.axhline(40, color='orange', linestyle=':', label='40°C threshold')
plt.axhline(room_temp, color='gray', linestyle=':', label=f'Room temp {room_temp}°C')
plt.axvline(t_40, color='orange', linestyle=':', alpha=0.6)
plt.xlabel('Time (min)'), plt.ylabel('Temperature (°C)')
plt.title("Newton's Law of Cooling: Coffee IVP")
plt.legend(), plt.grid(alpha=0.3), plt.tight_layout(), plt.show()`,
        output: '',
        status: 'idle',
      },
    ],
  },

  quiz: [
    {
      id: 'q-ivp-1',
      text: 'Which of the following is a differential equation?',
      type: 'multiple-choice',
      options: [
        '$x^2 + 3x - 4 = 0$',
        '$\\frac{dy}{dx} = x^2 + y$',
        '$y = x^2 + C$',
        '$\\int_0^1 x^2\\,dx = \\frac{1}{3}$',
      ],
      answer: 1,
      explanation: 'A differential equation contains a derivative of an unknown function. Option B has $\\frac{dy}{dx}$, the derivative of the unknown $y$. Option A is an algebraic equation (solved for a number). Option C is a function (the general solution to a DE, but not itself a DE). Option D is a definite integral, not a DE.',
      reviewSection: 'Intuition — Definition of a DE',
    },
    {
      id: 'q-ivp-2',
      text: 'The general solution to $y\' = 4x^3$ is $y = x^4 + C$. If $y(0) = 7$, what is the particular solution?',
      type: 'multiple-choice',
      options: [
        '$y = x^4$',
        '$y = x^4 + 7$',
        '$y = 7x^4$',
        '$y = x^4 - 7$',
      ],
      answer: 1,
      explanation: 'Substitute the IC into the general solution: $7 = (0)^4 + C = C$, so $C = 7$. The particular solution is $y = x^4 + 7$.',
      reviewSection: 'Intuition — Initial Conditions',
    },
    {
      id: 'q-ivp-3',
      text: 'For the IVP $y\' = 2y$, $y(0) = 3$: which solution is correct?',
      type: 'multiple-choice',
      options: [
        '$y = 2e^{3x}$',
        '$y = 3e^x$',
        '$y = 3e^{2x}$',
        '$y = 6e^x$',
      ],
      answer: 2,
      explanation: 'Separate: $dy/y = 2\\,dx$ → $\\ln|y| = 2x + C$ → $y = Ae^{2x}$. Apply IC: $y(0) = A = 3$. So $y = 3e^{2x}$. Verify: $y\' = 6e^{2x} = 2(3e^{2x}) = 2y$ ✓',
      reviewSection: 'Math — Separable IVPs',
    },
    {
      id: 'q-ivp-4',
      text: 'The integrating factor for $y\' + 3x^2 y = 1$ is:',
      type: 'multiple-choice',
      options: [
        '$e^{3x}$',
        '$e^{x^3}$',
        '$3x^2$',
        '$e^{3x^2}$',
      ],
      answer: 1,
      explanation: '$P(x) = 3x^2$. $\\mu = e^{\\int 3x^2\\,dx} = e^{x^3}$. (Not $e^{3x}$ — you must actually integrate $P(x)$, not just exponentiate it.)',
      reviewSection: 'Math — Integrating Factor',
    },
    {
      id: 'q-ivp-5',
      text: 'For $y\'\' - 5y\' + 6y = 0$, the characteristic equation is:',
      type: 'multiple-choice',
      options: [
        '$r^2 - 5r + 6 = 0$',
        '$r^2 + 5r + 6 = 0$',
        '$r - 5 + 6r^2 = 0$',
        '$5r^2 - r + 6 = 0$',
      ],
      answer: 0,
      explanation: 'Substitute $y = e^{rx}$: $r^2 e^{rx} - 5r e^{rx} + 6 e^{rx} = 0$. Factor out $e^{rx}$: $r^2 - 5r + 6 = 0$. The coefficients of the characteristic equation match the DE coefficients exactly.',
      reviewSection: 'Math — Second-Order ODEs',
    },
    {
      id: 'q-ivp-6',
      text: 'The roots of $r^2 - 5r + 6 = 0$ are $r = 2$ and $r = 3$. The general solution is:',
      type: 'multiple-choice',
      options: [
        '$y = C_1 e^{2x} + C_2 x e^{3x}$',
        '$y = (C_1 + C_2 x)e^{2x}$',
        '$y = C_1 e^{2x} + C_2 e^{3x}$',
        '$y = e^{2x}(C_1 \\cos 3x + C_2 \\sin 3x)$',
      ],
      answer: 2,
      explanation: 'Two distinct real roots $r_1 = 2$, $r_2 = 3$: the general solution is $y = C_1 e^{r_1 x} + C_2 e^{r_2 x} = C_1 e^{2x} + C_2 e^{3x}$. The repeated-root form $(C_1 + C_2 x)e^{rx}$ applies only when $r_1 = r_2$. The cosine/sine form applies only for complex roots.',
      reviewSection: 'Math — Second-Order, Three Cases',
    },
    {
      id: 'q-ivp-7',
      text: 'In Euler\'s method $y_{n+1} = y_n + h\\,f(x_n, y_n)$, what does $h$ represent?',
      type: 'multiple-choice',
      options: [
        'The Planck constant from quantum mechanics',
        'The step size — how far forward in $x$ you move each iteration',
        'The error in the approximation',
        'The integrating factor for the ODE',
      ],
      answer: 1,
      explanation: '$h$ is the step size: the horizontal distance between consecutive $x$-values in the numerical approximation. Smaller $h$ gives more steps but better accuracy. Larger $h$ is faster but less accurate (and can become unstable for some DEs).',
      reviewSection: 'Math — Euler\'s Method',
    },
    {
      id: 'q-ivp-8',
      text: 'A population satisfies $\\frac{dP}{dt} = 0.02P$, $P(0) = 1000$. What is $P(50)$?',
      type: 'multiple-choice',
      options: [
        '$1000 + 0.02(50) = 2000$',
        '$1000 e^{0.02 \\cdot 50} = 1000 e \\approx 2718$',
        '$1000 \\cdot (1.02)^{50} \\approx 2692$',
        '$1000 e^{50} \\approx 5.1 \\times 10^{23}$',
      ],
      answer: 1,
      explanation: 'Solving $dP/dt = 0.02P$: $P(t) = 1000 e^{0.02t}$. At $t = 50$: $P(50) = 1000 e^{1} = 1000e \\approx 2718$. Option C would apply for discrete compounding; option A is linear growth (wrong model); option D uses the wrong exponent.',
      reviewSection: 'Math — Exponential Growth IVP',
    },
    {
      id: 'q-ivp-9',
      text: 'After solving an IVP you get $y = 2e^{-x} + 3$. The fastest way to confirm it is correct is:',
      type: 'multiple-choice',
      options: [
        'Graph it and see if it looks reasonable',
        'Differentiate $y$, substitute $y$ and $y\'$ into the original DE, and also check the IC',
        'Ask if the constants seem plausible',
        'Check that the answer has the right form (e.g., it is an exponential)',
      ],
      answer: 1,
      explanation: 'The only rigorous verification is substitution: differentiate your proposed solution to find $y\'$, then plug both $y$ and $y\'$ back into the original DE and confirm it is satisfied identically. Then separately check the IC by substituting $x = x_0$ and confirming $y = y_0$. No other check is conclusive.',
      reviewSection: 'Verification',
    },
    {
      id: 'q-ivp-10',
      text: 'The IVP $y\' = \\sqrt{y}$, $y(0) = 0$ has the solution $y = 0$ (identically). Yet the Picard-Lindelöf theorem does NOT guarantee uniqueness here. Why?',
      type: 'multiple-choice',
      options: [
        'Because $f(x,y) = \\sqrt{y}$ is not defined at $y = 0$',
        'Because $\\partial f/\\partial y = \\frac{1}{2\\sqrt{y}}$ blows up at $y = 0$, violating continuity',
        'Because the initial condition is zero',
        'Because square root functions are always non-unique',
      ],
      answer: 1,
      explanation: 'Picard-Lindelöf requires both $f$ and $\\partial f/\\partial y$ to be continuous. Here $\\partial f / \\partial y = \\frac{1}{2\\sqrt{y}}$, which is undefined (blows up) at $y = 0$. The theorem\'s hypothesis fails, so uniqueness is not guaranteed — and in fact there is a second solution: $y = \\frac{(x - c)^2}{4}$ for any $c \\geq 0$. The zero solution is one of infinitely many.',
      reviewSection: 'Intuition — Existence and Uniqueness',
    },
  ],
}

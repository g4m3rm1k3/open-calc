export default {
  id: 'ch2-002b',
  slug: 'derivatives-of-inverse-functions',
  chapter: 2,
  order: 7,
  title: 'Derivatives of Inverse Functions',
  subtitle: 'General inverse-derivative rule, formal proof, and inverse trig formulas',
  tags: ['inverse functions', 'derivative of inverse', 'arcsin', 'arccos', 'arctan', 'implicit differentiation', 'domain restriction', 'monotone', 'one-to-one', 'horizontal line test'],
  aliases: 'section 3.7 derivative of inverse function formal proof inverse trig derivatives arcsin arccos arctan inverse trig derivatives, finding inverse, f inverse prime, 1 over f prime',

  spiral: {
    recoveryPoints: [
      { label: 'Exp/Log Derivatives (previous lesson)', note: 'ln(x) is the inverse of e^x, and its derivative 1/x was derived here by implicit differentiation of e^y = x. That argument is exactly the general inverse-derivative theorem applied to one specific function.' },
      { label: 'Domain Restrictions (Chapter 0)', note: 'sin(x) is not one-to-one on all of ℝ, so arcsin only exists on a restricted domain [−π/2, π/2]. The choice of principal branch is a domain-restriction decision from precalculus that must be in place before calculus can proceed.' },
    ],
    futureLinks: [
      { label: 'Implicit Differentiation (Lesson 9)', note: 'The derivation of every inverse trig derivative uses implicit differentiation — differentiating both sides of an equation like tan(y)=x. Implicit differentiation is the same chain-rule logic applied to equations rather than explicit formulas.' },
      { label: 'Integration (Chapter 4)', note: 'arctan(x) and arcsin(x) appear constantly as antiderivatives: ∫1/(1+x²) dx = arctan(x)+C and ∫1/√(1−x²) dx = arcsin(x)+C. Knowing their derivatives from this chapter makes recognizing those integral patterns automatic.' },
    ],
  },

  hook: {
    question: 'If a function maps x to y, how do slopes transform when we reverse that mapping and view x as a function of y?',
    realWorldContext:
      'Sensor calibration, coordinate transforms, control systems, and inverse kinematics all rely on inverse mappings. ' +
      'When you reverse a relationship, rates invert too - but at the correct corresponding point. ' +
      'This rule is also the engine behind derivatives of arcsin, arccos, and arctan.',
    previewVisualizationId:  'InverseDerivativeTriangle',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** In the last lesson, you saw an inverse-function argument in action: the derivative of ln(x) was found by treating ln as the inverse of e^x, differentiating both sides of e^y = x, and solving. That approach was not a trick — it was a general theorem in disguise. This lesson makes that theorem explicit, proves it geometrically, and then applies it to derive all six inverse trig derivatives.',

      '**The central insight:** If f maps x to y, then f⁻¹ maps y back to x. On a graph, f⁻¹ is the reflection of f across the line y = x. Reflection swaps the x and y axes — which means it swaps "rise" and "run" in every slope calculation. So the slope of f⁻¹ at y is the *reciprocal* of the slope of f at x. That is the whole theorem. The rest is applying it carefully.',

      'If y = f(x), then the inverse relation is x = f^(-1)(y). Intuitively, moving forward through f and then backward through f^(-1) cancels out.',
      'On a graph, f and f^(-1) are reflections across y = x. Reflection swaps x and y coordinates, so tangent rise/run becomes run/rise. That is why inverse slopes are reciprocals.',
      'The most common mistake is evaluating at the wrong point. If f(a) = b, then the reciprocal slope relation is between f\'(a) and (f^(-1))\'(b), not at the same x-value.',
      'This general rule plus implicit differentiation gives the inverse trig derivatives cleanly, with domain restrictions built in.',
      'Think of a function as a machine. You put in $x$, it produces $y = f(x)$. An inverse function is a second machine that takes the output $y$ and hands back the original input $x$. We write it $f^{-1}(y) = x$, or equivalently $f^{-1}(f(x)) = x$ for every $x$ in the domain.',
      'Here is the single most important visual fact: the graph of $f^{-1}$ is the graph of $f$ reflected across the line $y = x$. Every point $(a, b)$ on $f$ becomes the point $(b, a)$ on $f^{-1}$. That reflection is not a trick — it is the geometric meaning of swapping input and output.',
      'But there is an immediate problem. If $f$ ever produces the same output from two different inputs — say $f(2) = 9$ and $f(-2) = 9$ — then the "undo" machine is confused: given output $9$, does it return $2$ or $-2$? It cannot do both and still be a function. This is why we need the function to be one-to-one: each output must come from exactly one input.',
      'The quick visual check is the horizontal line test. Draw any horizontal line across the graph of $f$. If any horizontal line hits the graph more than once, $f$ is not one-to-one and has no inverse on that full domain.',

      '**Deriving d/dx[arctan(x)] step by step:** This derivation uses the same implicit-differentiation move that produced d/dx[ln(x)], but now applied to the arctangent. Step 1: let y = arctan(x). By the definition of arctan, this means tan(y) = x, with y restricted to (−π/2, π/2). Step 2: differentiate both sides of tan(y) = x with respect to x. The right side gives 1. The left side requires the chain rule on tan(y) — its derivative is sec²(y)·(dy/dx). So: sec²(y)·(dy/dx) = 1. Step 3: solve for dy/dx: dy/dx = 1/sec²(y) = cos²(y). Step 4: convert cos²(y) back to an expression in x. Since tan(y) = x, draw a right triangle with opposite side x and adjacent side 1, giving hypotenuse √(1+x²). Then cos(y) = 1/√(1+x²), so cos²(y) = 1/(1+x²). Therefore d/dx[arctan(x)] = 1/(1+x²). This formula is valid for all real x, because arctan is defined and differentiable everywhere.',

      '**A practical note: why arcsin and arctan matter for integration:** Knowing the derivatives d/dx[arcsin(x)] = 1/√(1−x²) and d/dx[arctan(x)] = 1/(1+x²) is not just an endpoint — it is a starting point for Chapter 4. Integration reverses differentiation: since d/dx[arctan(x)] = 1/(1+x²), the antiderivative of 1/(1+x²) is arctan(x)+C. Similarly, since d/dx[arcsin(x)] = 1/√(1−x²), the antiderivative of 1/√(1−x²) is arcsin(x)+C. These two integral formulas — ∫1/(1+x²)dx = arctan(x)+C and ∫1/√(1−x²)dx = arcsin(x)+C — appear constantly in calculus applications. Students who memorize the derivative formulas from this chapter recognize these integral patterns immediately in Chapter 4, while students who do not have to re-derive them each time.',

      '**Where this is heading:** You have now differentiated polynomials, trig, exponential/log, and inverse functions — a complete toolkit for every fundamental function type. The next lesson takes one final step: what if y is not even written explicitly as a function of x? That is implicit differentiation, and it is simply the chain rule applied to both sides of any equation.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 8 of 10 — Act 3: Inverse Functions',
        body: '**Previous:** Exponential and log derivatives — e^x = its own derivative, ln(x) = 1/x.\n**This lesson:** The general inverse derivative theorem + arcsin, arccos, arctan formulas.\n**Next:** Implicit differentiation — differentiating curves defined by equations F(x,y)=0, not explicit formulas y=f(x).',
      },
      {
        type: 'definition',
        title: 'Inverse Function',
        body:
          'If $f$ is one-to-one on its domain, the inverse function $f^{-1}$ satisfies \\[ f^{-1}(f(x)) = x \\quad \\text{for all } x \\in \\text{dom}(f) \\] \\[ f(f^{-1}(y)) = y \\quad \\text{for all } y \\in \\text{range}(f) \\] Note: $f^{-1}(x)$ is not $\\frac{1}{f(x)}$. The $-1$ is a label, not an exponent.',
      },
      {
        type: 'insight',
        title: 'What swapping input and output does to the graph',
        body:
          'Domain and range swap. If $f$ has domain $[a, b]$ and range $[c, d]$, then $f^{-1}$ has domain $[c, d]$ and range $[a, b]$. The graph reflects across $y = x$.',
      },
      {
        type: 'warning',
        title: '$f^{-1}$ is not $1/f$',
        body:
          '$f^{-1}(x)$ means the inverse function. $[f(x)]^{-1} = \\frac{1}{f(x)}$ means the reciprocal. These are completely different. Example: if $f(x) = x^2$ restricted to $x \\geq 0$, then $f^{-1}(x) = \\sqrt{x}$, not $\\frac{1}{x^2}$.',
      },
      {
        type: 'warning',
        title: 'Evaluation Point Matters',
        body: '(f^(-1))\'(x) = 1 / f\'(f^(-1)(x)). You must evaluate f\' at f^(-1)(x), not at x itself.',
      },
      {
        type: 'intuition',
        title: 'Slope Reciprocity',
        body: 'At corresponding points (a, b) and (b, a), slopes multiply to 1: f\'(a) * (f^(-1))\'(b) = 1, provided f\'(a) != 0.',
      },
    ],
    visualizations: [
      {
        id: 'InverseFunctionExplainer',
        title: 'Step-by-Step Inverse Function Explainer',
        caption: 'Walk through the logic of inverse functions, mirror geometry, and slope reciprocity.',
      },
      {
        id: 'InverseSlopeReflectionLab',
        title: 'Slope Reciprocity via Reflection',
        mathBridge: 'Reflection across $y = x$ swaps every $(a, b)$ to $(b, a)$. Because the axes are swapped, every rise becomes a run and vice versa — so the slope $\\frac{\\Delta y}{\\Delta x}$ at $(a, b)$ becomes $\\frac{\\Delta x}{\\Delta y} = \\frac{1}{\\text{slope}}$ at $(b, a)$. That is the entire geometric content of $(f^{-1})\'(b) = 1/f\'(a)$. Drag the point to verify the product of slopes is always 1.',
        caption: 'Drag the point on f(x) = x². The mirrored green point on f⁻¹(x) = √x always carries the reciprocal slope. Their product is always 1.',
      },
      {
        id: 'UniversalInverseLab',
        title: 'Universal Inverse Lab: Try More Than x²',
        mathBridge: 'The reciprocal-slope rule is not specific to one function. Pick linear, cubic, or exponential presets and track corresponding points on $f$ and $f^{-1}$. At each matched pair, the tangent slopes still multiply to 1 as long as $f\'(a) \neq 0$.',
        caption: 'Switch families and move the point. The geometry changes, but slope reciprocity at reflected points does not.',
      },
      {
        id: 'DualGraphSync',
        title: 'Reflection and Reciprocal Slopes (Symbolic View)',
        mathBridge: 'Set f(x) = e^x. Find the point (1, e) on f. The inverse function ln(x) has the point (e, 1) — swapped coordinates. The slope of e^x at x=1 is e¹=e≈2.718. The slope of ln(x) at x=e is 1/e≈0.368. They are reciprocals: e × (1/e) = 1. This is the Inverse Function Theorem in action. Try other functions and verify: slope of f at (a,b) × slope of f⁻¹ at (b,a) = 1 always. Try f(x)=x³: the slope at (2,8) is 3(2²)=12, so the slope of f⁻¹ at (8,2) must be 1/12. Check it.',
        caption: 'As a point moves on f, the reflected point on f^(-1) shows reciprocal tangent slope at matching coordinates.',
      },
                  {
        id: 'InverseFunctionReflection',
        title: 'Geometric Reflection Lab',
        caption: 'Watch points swap as they reflect across y=x. See why domain and range must swap too.',
      },
      {
        id: 'SlopeReciprocalViz',
        title: 'Slope Reciprocity Calculator',
        caption: 'Directly compare the slope of f at (a,b) with the slope of f⁻¹ at (b,a).',
      },
    ],
  },

  math: {
    prose: [
      'Before we can talk about the derivative, we need to be precise about when an inverse exists. The key word is monotone.',
      'A function is monotonically increasing on an interval if, whenever $x_1 < x_2$ in that interval, $f(x_1) < f(x_2)$. It is monotonically decreasing if $x_1 < x_2$ implies $f(x_1) > f(x_2)$. Either way — strictly increasing or strictly decreasing — the function is one-to-one on that interval, so an inverse exists.',
      'How do you check monotonicity using the derivative? On an interval where $f\'(x) > 0$ throughout, $f$ is strictly increasing. Where $f\'(x) < 0$ throughout, $f$ is strictly decreasing. A single sign throughout means one-to-one. This is the calculus-powered version of the horizontal line test.',
      'Domain restriction is how we rescue functions that are not globally one-to-one. The classic example is $f(x) = x^2$. On all of $\\mathbb{R}$ it fails the horizontal line test. But on $[0, \\infty)$ it is strictly increasing and invertible, giving $f^{-1}(x) = \\sqrt{x}$. On $(-\\infty, 0]$ it is strictly decreasing and also invertible, giving $f^{-1}(x) = -\\sqrt{x}$. The choice of restriction is a convention — we pick the piece that is most useful.',
      'The inverse trig functions arise exactly this way. $\\sin(x)$ is not one-to-one globally — it repeats forever. We restrict to $[-\\pi/2, \\pi/2]$, where it is strictly increasing (derivative $\\cos x > 0$ on the open interval). That gives us $\\arcsin(x)$ with domain $[-1, 1]$ and range $[-\\pi/2, \\pi/2]$. Similarly for $\\arccos$ (restricted to $[0, \\pi]$) and $\\arctan$ (restricted to $(-\\pi/2, \\pi/2)$, and because $\\tan$ is already one-to-one on that open interval, the range is all of $\\mathbb{R}$).',
      'General inverse derivative rule: if f is differentiable and one-to-one near a, with f(a) = b and f\'(a) != 0, then f^(-1) is differentiable near b and',
      '(f^(-1))\'(b) = 1/f\'(a).',
      'Equivalent formula in x-form:',
      '(f^(-1))\'(x) = 1 / f\'(f^(-1)(x)).',
      'Inverse trig derivatives (principal branches):',
      'd/dx[arcsin x] = 1/sqrt(1-x^2),   |x| < 1',
      'd/dx[arccos x] = -1/sqrt(1-x^2),  |x| < 1',
      'd/dx[arctan x] = 1/(1+x^2),       all x',
      'These follow from implicit differentiation plus right-triangle identities.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Inverse Derivative Rule',
        body: "\\frac{d}{dx}[f^{-1}(x)] = \\frac{1}{f'(f^{-1}(x))}",
      },
      {
        type: 'theorem',
        title: 'Inverse Trig Derivatives',
        body: "\\frac{d}{dx}[\\arcsin x]=\\frac{1}{\\sqrt{1-x^2}},\\;\\frac{d}{dx}[\\arccos x]=-\\frac{1}{\\sqrt{1-x^2}},\\;\\frac{d}{dx}[\\arctan x]=\\frac{1}{1+x^2}",
      },
      {
        type: 'theorem',
        title: 'Monotone Inverse Theorem',
        body:
          'If $f$ is continuous on $[a, b]$ and strictly monotone (increasing or decreasing) on $(a, b)$, then $f$ has an inverse $f^{-1}$ defined on $[f(a), f(b)]$ (or $[f(b), f(a)]$ if decreasing), and $f^{-1}$ is also continuous and strictly monotone.',
      },
      {
        type: 'insight',
        title: 'What to look for: the monotone checklist',
        body:
          '(1) Find $f\'(x)$. (2) Determine where $f\'(x) > 0$ (increasing) or $f\'(x) < 0$ (decreasing). (3) Each maximal interval of constant sign is a domain on which $f$ is one-to-one and invertible. (4) Choose the restriction that includes the output range you care about.',
      },
      {
        type: 'definition',
        title: 'Standard Inverse Trig Domain Restrictions',
        body:
          '\\begin{aligned} \\arcsin &: [-1,1] \\to [-\\tfrac{\\pi}{2}, \\tfrac{\\pi}{2}] \\\\[4pt] \\arccos &: [-1,1] \\to [0, \\pi] \\\\[4pt] \\arctan &: (-\\infty,\\infty) \\to (-\\tfrac{\\pi}{2}, \\tfrac{\\pi}{2}) \\end{aligned}',
      },
    ],
    visualizations: [
      {
        id: 'InverseSlopeReflectionLab',
        title: 'The Rule in Action: f(x) = x²',
        mathBridge: 'The theorem says $(f^{-1})\'(x) = 1/f\'(f^{-1}(x))$. Here $f(x) = x^2$, so $f^{-1}(x) = \\sqrt{x}$ and $f\'(x) = 2x$. Therefore $(f^{-1})\'(x) = 1/(2\\sqrt{x})$ — exactly the derivative of $\\sqrt{x}$ by the power rule. The graph makes this formula geometric: reflection swaps axes, and swapping axes flips the fraction $\\Delta y / \\Delta x$ to $\\Delta x / \\Delta y$.',
        caption: 'Verify the formula numerically: move to any a, read f\'(a) = 2a, then check that (f⁻¹)\'(a²) = 1/(2a). Product is always 1.',
      },
      {
        id: 'PythagoreanSlopeEngine',
        title: 'Inverse Trig Denominators from Geometry',
        mathBridge: 'For inverse trig, implicit differentiation creates triangle-based denominators: $\\sqrt{1-x^2}$ for $\\arcsin x$ and $1+x^2$ for $\\arctan x$. This engine visualizes exactly where those terms come from instead of treating them as memorized formulas.',
        caption: 'Toggle arcsin/arctan mode and watch the geometric denominator update live with x.',
      },
      {
        id: 'InverseTrigDomainViz',
        title: 'Trig Domain Restriction Map',
        caption: 'Visualize why we must cut the trig functions to make them one-to-one.',
      },
      {
        id: 'MonotoneSignChart',
        title: 'Monotonicity & Inverses',
        caption: 'Check the sign of f\' to see where the inverse legally exists.',
      },
    ],
  },

  rigor: {
    prose: [
      'Formal proof of inverse derivative rule: start from identity f(f^(-1)(x)) = x.',
      'Differentiate both sides with respect to x:',
      'f\'(f^(-1)(x)) * (f^(-1))\'(x) = 1.',
      'Solve for (f^(-1))\'(x):',
      '(f^(-1))\'(x) = 1 / f\'(f^(-1)(x)).',
      'This requires f\'(f^(-1)(x)) != 0.',
      'Now for the main event of Calc 1: differentiating an inverse function. The key formula is simple once you see where it comes from.',
      'Start from the defining equation $f(f^{-1}(x)) = x$. Differentiate both sides with respect to $x$ using the chain rule on the left: \\[ f\'(f^{-1}(x)) \\cdot (f^{-1})\'(x) = 1 \\] Divide both sides by $f\'(f^{-1}(x))$ (assuming it is nonzero): \\[ (f^{-1})\'(x) = \\frac{1}{f\'(f^{-1}(x))} \\] That is the formula. In words: the derivative of the inverse at $x$ equals one over the derivative of the original function evaluated at $f^{-1}(x)$.',
      'The geometry makes this obvious. Recall that the graph of $f^{-1}$ is the graph of $f$ reflected across $y = x$. A slope of $m$ on $f$ becomes a slope of $1/m$ on $f^{-1}$. Reflection across $y = x$ swaps rise and run, turning rise/run into run/rise $= 1/(\\text{rise/run})$.',
      'The formula requires $f\'(f^{-1}(x)) \\neq 0$. If $f$ has a horizontal tangent at the point being reflected, $f^{-1}$ would need a vertical tangent there — undefined slope. This is why we can only apply the formula at points where $f$ is not flat.',
      'Practical note: you rarely need an explicit formula for $f^{-1}(x)$ to compute $(f^{-1})\'(a)$. Solve $f(c)=a$ for the input $c$, compute $f\'(c)$, and take the reciprocal: $(f^{-1})\'(a)=1/f\'(c)$. This saves algebra and is especially useful when $f^{-1}$ has no simple closed form.',
      'Edge cases: the formula fails if $f$ is not differentiable at $c$ or if $f\'(c)=0$ (vertical tangent for the inverse). Also ensure $f$ is one-to-one on a neighborhood of $c$ so a local inverse exists. If any of these fail, the inverse may exist but not be differentiable there.',
      'Common student mistakes: (1) evaluating $f\'$ at the wrong point (plug into $f\'$ the input $c$, not the output $a$), (2) confusing $f^{-1}(x)$ with $1/f(x)$, and (3) forgetting to check that $f$ is one-to-one near the point of interest.',
      'Quick checklist before applying the inverse-derivative formula: (i) find $c$ with $f(c)=a$, (ii) verify $f$ is one-to-one near $c$, (iii) check $f\'(c)$ exists and $\\neq 0$, (iv) compute $(f^{-1})\'(a)=1/f\'(c)$.',
      'Formal derivation of arcsin: let y = arcsin x so sin y = x. Differentiate: cos y * dy/dx = 1, hence dy/dx = 1/cos y. From sin y = x and principal range y in [-pi/2, pi/2], cos y = sqrt(1-x^2), giving dy/dx = 1/sqrt(1-x^2).',
      'For arccos: let y = arccos x so cos y = x. Differentiate: -sin y * dy/dx = 1, so dy/dx = -1/sin y = -1/sqrt(1-x^2).',
      'For arctan: let y = arctan x so tan y = x. Differentiate: sec^2 y * dy/dx = 1, so dy/dx = 1/sec^2 y = 1/(1+tan^2 y) = 1/(1+x^2).',
    ],
    callouts: [
      {
        type: 'proof',
        title: 'Formal Proof (General Rule)',
        body: 'f(f^(-1)(x))=x => f\'(f^(-1)(x))*(f^(-1))\'(x)=1 => (f^(-1))\'(x)=1/f\'(f^(-1)(x)).',
      },
    ],
    visualizations: [
      {
        id: 'ArcTanDerivationLab',
        title: 'arctan Derivative: Full Geometric Proof',
        mathBridge: 'The proof has three moves: (1) rewrite $y = \\arctan x$ as $\\tan y = x$; (2) differentiate implicitly to get $\\sec^2(y)\\cdot dy/dx = 1$; (3) read $\\sec^2(y) = 1 + \\tan^2(y) = 1 + x^2$ from the right triangle. The triangle in the visualization makes step (3) concrete — you can see the hypotenuse $\\sqrt{1+x^2}$ growing as $x$ grows, and $\\cos^2(y) = 1/(1+x^2)$ directly from the adjacent/hypotenuse ratio.',
        caption: 'Drag x and watch the triangle update. Each proof step stays fixed — only the live numerical values change. This is implicit differentiation made visual.',
      },
      {
        id: 'RationalExponentProof',
        title: 'Proof: The Power Rule for Rational Exponents',
        caption: 'Step through the formal derivation of d/dx[x^(m/n)] = (m/n)x^(m/n-1) using the inverse rule.',
      },
      {
        id: 'InverseDerivativeProof',
        title: 'The Implicit Proof Machine',
        caption: 'Step through the formal derivation of the inverse rule using implicit differentiation.',
      },
    ],
  },

  examples: [

    {
      id: 'ch2-002-ex1',
      title: 'Finding the Derivative of an Inverse from a Table',
      problem: '\\text{Given } f(5) = 2 \\text{ and } f\'(5) = 4 \\text{, find } (f^{-1})\'(2).',
      steps: [
        {
          expression: '(f^{-1})\'(x) = \\frac{1}{f\'(f^{-1}(x))}',
          annotation: 'Write the theorem for the derivative of an inverse function.',
          strategyTitle: 'State the inverse function derivative theorem',
          checkpoint: 'Before substituting, can you name the two things you need to evaluate this formula — what input to look up, and in which function?',
          hints: [
            'Write down the general formula (f⁻¹)\'(x) = 1 / f\'(f⁻¹(x)) as the starting template.',
            'The Inverse Function Derivative Theorem states: (f⁻¹)\'(b) = 1 / f\'(a) whenever f(a) = b.',
            'Think of the graph of f⁻¹ as the reflection of f across y = x. Reflection swaps rise and run, turning slope m into slope 1/m — that geometric swap is exactly this formula.',
          ],
        },
        {
          expression: '(f^{-1})\'(2) = \\frac{1}{f\'(f^{-1}(2))}',
          annotation: 'Substitute x = 2.',
          strategyTitle: 'Plug in the target output value',
          checkpoint: 'You\'ve replaced x with 2. What still needs to be resolved inside the formula before you can get a number?',
          hints: [
            'Replace every x in the general formula with 2 to get a specific expression.',
            'The formula now reads (f⁻¹)\'(2) = 1 / f\'(f⁻¹(2)). You still need to evaluate f⁻¹(2).',
            'The output 2 sits on the inverse function\'s graph at the point (2, ?). Finding that ? is exactly reading the reflected point on f.',
          ],
        },
        {
          expression: 'f^{-1}(2) = 5',
          annotation: 'Since f(5) = 2, it implies f^{-1}(2) = 5.',
          strategyTitle: 'Decode f⁻¹(2) from the given table data',
          checkpoint: 'Why does f(5) = 2 tell you that f⁻¹(2) = 5? State this in your own words before moving on.',
          hints: [
            'Scan the given information for f(a) = 2. Once you find a, that value is f⁻¹(2) by definition.',
            'By the definition of inverse functions: f(a) = b ⟺ f⁻¹(b) = a. Here b = 2 and a = 5.',
            'On the graph, the point (5, 2) lies on f, so (2, 5) lies on f⁻¹ — coordinates swapped by reflection. Reading off the y-value at x = 2 on f⁻¹ gives 5.',
          ],
        },
        {
          expression: '(f^{-1})\'(2) = \\frac{1}{f\'(5)}',
          annotation: 'Substitute 5 for f^{-1}(2).',
          strategyTitle: 'Evaluate the inner composition to reach a known input',
          checkpoint: 'You now have 1 / f\'(5). What piece of given information will you use next, and do you already have it?',
          hints: [
            'Replace f⁻¹(2) in the denominator with 5, leaving you with 1 / f\'(5).',
            'Applying the theorem at the correct point: (f⁻¹)\'(b) = 1 / f\'(a), with b = 2 and a = f⁻¹(2) = 5, so you need f\'(5).',
            'Common mistake: students try to use f\'(2) instead. The formula requires f\' evaluated at the *input* a = 5, not at the *output* b = 2.',
          ],
        },
        {
          expression: '(f^{-1})\'(2) = \\frac{1}{4}',
          annotation: 'Substitute the given slope f\'(5) = 4.',
          strategyTitle: 'Take the reciprocal to complete the theorem',
          checkpoint: 'The answer is 1/4. What does this number mean geometrically — what does it describe about the graph of f⁻¹ at x = 2?',
          hints: [
            'Substitute f\'(5) = 4 into the denominator: (f⁻¹)\'(2) = 1/4.',
            'The Inverse Function Derivative Theorem: (f⁻¹)\'(b) = 1 / f\'(a). With f\'(5) = 4, the result is 1/4.',
            'Geometrically: the tangent to f at (5, 2) has slope 4 (steep rise). After reflection across y = x, the tangent to f⁻¹ at (2, 5) has slope 1/4 (gentle rise). Steepness and shallowness are exchanged by the mirror.',
          ],
        },
      ],
      conclusion: 'The slope at y=2 on the original function translates to 1/4 at x=2 on the inverse.',

    },
    {
      id: 'ch2-002-ex2',
      title: 'Differentiating an Inverse Trig Function with the Chain Rule',
      problem: '\\text{Find } y\' \\text{ for } y = \\arctan(e^x).',
      steps: [
        {
          expression: "\\frac{d}{dx}[\\arctan(u)] = \\frac{1}{1+u^2} \\cdot u'",
          annotation: 'Write the derivative rule for arctan combined with the Chain Rule.',
          strategyTitle: 'Apply the arctan derivative formula via the Chain Rule',
          checkpoint: 'What is the "outer" function and what is the "inner" function here? Identify both before differentiating.',
          hints: [
            'Recognise y = arctan(eˣ) as a composition: outer function is arctan(·), inner function is eˣ. Write the Chain Rule template d/dx[arctan(u)] = (1/(1+u²))·u\'.',
            'The arctan derivative d/dx[arctan u] = 1/(1+u²) comes from implicit differentiation of tan y = u: sec²y · dy/dx = 1, then sec²y = 1 + tan²y = 1 + u².',
            'Arctan is the reflection of tan across y = x, restricted to (−π/2, π/2). Reflection makes the slope formula 1/f\'(u) where f\'(u) = sec²u = 1+u² — so the Chain Rule coefficient 1/(1+u²) is slope reciprocity built into the formula.',
          ],
        },
        {
          expression: "u = e^x \\implies u' = e^x",
          annotation: 'Identify the inside function as e^x and its derivative.',
          strategyTitle: 'Differentiate the inner function',
          checkpoint: 'What is the derivative of eˣ, and why is it also eˣ? State the rule you are using.',
          hints: [
            'Set u = eˣ and differentiate: u\' = d/dx[eˣ] = eˣ.',
            'The exponential derivative rule: d/dx[eˣ] = eˣ. This is the unique property of base e — it is its own derivative.',
            'Spiral connection: d/dx[eˣ] = eˣ was established in the previous lesson. The chain rule multiplier here — eˣ — comes from that same rule, now feeding into an arctan inverse.',
          ],
        },
        {
          expression: "y' = \\frac{1}{1+(e^x)^2} \\cdot e^x",
          annotation: 'Substitute into the Chain Rule formula.',
          strategyTitle: 'Substitute u and u\' into the Chain Rule expression',
          checkpoint: 'After substitution, you have two factors. What does each factor represent in the Chain Rule structure?',
          hints: [
            'Replace u with eˣ in the 1/(1+u²) outer-derivative factor, then multiply by u\' = eˣ.',
            'The Chain Rule: d/dx[f(g(x))] = f\'(g(x))·g\'(x). Here f\'(u) = 1/(1+u²) and g\'(x) = eˣ, giving 1/(1+(eˣ)²)·eˣ.',
            'The factor 1/(1+(eˣ)²) captures how arctan slopes shrink as the argument grows large — arctan flattens toward ±π/2, so its derivative approaches 0. The eˣ factor accelerates the input, but arctan\'s flatness dominates for large x.',
          ],
        },
        {
          expression: "y' = \\frac{e^x}{1+e^{2x}}",
          annotation: 'Simplify the power using (e^x)^2 = e^{2x}.',
          strategyTitle: 'Simplify using the power-of-exponential identity',
          checkpoint: 'Is this answer fully simplified? Could you factor or cancel anything further?',
          hints: [
            'Use the exponent rule (eˣ)² = e^(2x) to rewrite the denominator, then move the numerator eˣ into a single fraction.',
            'Identity used: (eˣ)² = e^(2x). This gives y\' = eˣ / (1 + e^(2x)), which is in simplest form.',
            'Notice the shape of the answer: for large x, e^(2x) dominates the denominator, so y\' ≈ eˣ/e^(2x) = e^(−x) → 0. The derivative dying off for large x reflects that arctan saturates at π/2 — the composed function stops changing quickly.',
          ],
        },
      ],
      conclusion: 'The Chain Rule works seamlessly with inverse trig functions.',
    },
    {
      id: 'ch2-002-ex3',
      title: 'Derivative of arcsin(sqrt(x))',
      problem: '\\text{Find } y\' \\text{ for } y = \\arcsin(\\sqrt{x}).',
      steps: [
        {
          expression: "\\frac{d}{dx}[\\arcsin(u)] = \\frac{u'}{\\sqrt{1-u^2}}",
          annotation: 'Use inverse trig derivative with chain rule.',
          strategyTitle: 'Apply the arcsin derivative formula via the Chain Rule',
          checkpoint: 'What condition on u is required for the arcsin derivative to be valid? Will that condition be satisfied here?',
          hints: [
            'Recognise y = arcsin(√x) as a composition. Write the Chain Rule template: d/dx[arcsin(u)] = u\' / √(1−u²).',
            'The arcsin derivative d/dx[arcsin u] = 1/√(1−u²) comes from implicit differentiation of sin y = u: cos y · dy/du = 1, then cos y = √(1−u²) on the principal branch [−π/2, π/2].',
            'Arcsin is the reflection of sin (restricted to [−π/2, π/2]) across y = x. The slope of sin at angle y is cos y; after reflection, the slope of arcsin at u is 1/cos y = 1/√(1−u²). The √(1−u²) denominator literally is the adjacent leg of the unit-circle right triangle.',
          ],
        },
        {
          expression: "u = \\sqrt{x} = x^{1/2},\\; u' = 1/(2\\sqrt{x})",
          annotation: 'Differentiate inner function.',
          strategyTitle: 'Differentiate the inner function using the power rule',
          checkpoint: 'Write √x as x^(1/2) and apply the power rule. What do you get?',
          hints: [
            'Rewrite √x = x^(1/2), then differentiate using the power rule: d/dx[x^(1/2)] = (1/2)x^(−1/2) = 1/(2√x).',
            'Power rule: d/dx[xⁿ] = nxⁿ⁻¹. With n = 1/2: (1/2)x^(−1/2) = 1/(2√x).',
            'The 1/(2√x) factor comes from the "rate of change of the inner zoom" in the Chain Rule. As x grows, √x grows more slowly (concave down), so this multiplier is less than 1 for x > 1 — the composition compresses the input change.',
          ],
        },
        {
          expression: "y' = \\frac{1}{2\\sqrt{x}} \\cdot \\frac{1}{\\sqrt{1-(\\sqrt{x})^2}}",
          annotation: 'Substitute u and u\'.',
          strategyTitle: 'Substitute u and u\' into the Chain Rule template',
          checkpoint: 'Before simplifying, confirm that the two factors match the Chain Rule structure: one from the outer derivative, one from the inner derivative.',
          hints: [
            'Plug u = √x into √(1−u²) to get √(1−(√x)²), and place u\' = 1/(2√x) as the numerator.',
            'Chain Rule structure: outer derivative 1/√(1−u²) evaluated at u = √x, times inner derivative u\' = 1/(2√x). This gives (1/(2√x)) · 1/√(1−(√x)²).',
            'Notice (√x)² = x inside the square root — that simplification is the next step. Anticipating it here helps you see that the two separate square roots will combine into a product of simpler radicals.',
          ],
        },
        {
          expression: "y' = \\frac{1}{2\\sqrt{x}\\sqrt{1-x}}",
          annotation: 'Simplify (sqrt(x))^2 = x.',
          strategyTitle: 'Simplify the radical using (√x)² = x',
          checkpoint: 'State the domain of the final answer. What constraints come from √x and from √(1−x)?',
          hints: [
            'Replace (√x)² with x inside the radical: √(1−(√x)²) = √(1−x). The answer is 1 / (2√x · √(1−x)).',
            'Identity used: (√x)² = x (for x ≥ 0). This collapses the nested radical and gives the clean product form.',
            'Domain check: √x requires x > 0; √(1−x) requires x < 1; arcsin requires |√x| ≤ 1, i.e., 0 ≤ x ≤ 1. Together: 0 < x < 1. This is also visible from the arcsin graph — it has vertical asymptotic tangents at ±1, meaning the derivative blows up at the endpoints.',
          ],
        },
      ],
      conclusion: "y' = 1/(2sqrt(x)sqrt(1-x)), valid for 0 < x < 1.",

    },
    {
      id: 'ch2-002-ex4',
      title: 'Derivative of arccos(3x)',
      problem: '\\text{Find } y\' \\text{ for } y = \\arccos(3x).',
      steps: [
        { expression: "\\frac{d}{dx}[\\arccos(u)] = -\\frac{u'}{\\sqrt{1-u^2}}", annotation: 'Use arccos derivative rule.' },
        { expression: "u = 3x,\\; u' = 3", annotation: 'Inner derivative.' },
        { expression: "y' = -\\frac{3}{\\sqrt{1-9x^2}}", annotation: 'Substitute and simplify.' },
      ],
      conclusion: "y' = -3/sqrt(1-9x^2), valid for |x| < 1/3.",

    },
    {
      id: 'ch3-008-ex1',
      title: 'Finding an Inverse Algebraically',
      problem:
        '\\text{Find } f^{-1}(x) \\text{ for } f(x) = 3x - 7.',
      steps: [
        {
          expression: 'y = 3x - 7',
          annotation:
            'Step 1: Write $y = f(x)$. This just renames the output to give us something concrete to work with.',
        },
        {
          expression: 'x = 3y - 7',
          annotation:
            'Step 2: Swap $x$ and $y$. This is the algebraic version of reflecting across $y = x$. Now $x$ is the input to the inverse and $y$ is the output.',
        },
        {
          expression: 'x + 7 = 3y',
          annotation: 'Step 3: Solve for $y$. Add 7 to both sides.',
        },
        {
          expression: 'y = \\dfrac{x + 7}{3}',
          annotation: 'Divide both sides by 3.',
        },
        {
          expression: 'f^{-1}(x) = \\dfrac{x + 7}{3}',
          annotation:
            'Step 4: Rename $y$ as $f^{-1}(x)$. Done. Quick check: $f(f^{-1}(x)) = 3 \\cdot \\frac{x+7}{3} - 7 = x + 7 - 7 = x$. ✓',
        },
      ],
      conclusion:
        'The algebraic method: write $y = f(x)$, swap $x$ and $y$, solve for $y$, rename it $f^{-1}(x)$.',
    },
    {
      id: 'ch3-008-ex2',
      title: 'When You Must Restrict the Domain',
      problem:
        '\\text{Find an inverse for } f(x) = x^2 - 4x + 5 \\text{ on an appropriate domain.}',
      steps: [
        {
          expression: "f'(x) = 2x - 4",
          annotation:
            'Step 1: Find $f\'(x)$ to locate where $f$ is monotone. $f\'(x) = 0$ at $x = 2$, which is the vertex of this upward parabola.',
        },
        {
          expression: "f'(x) > 0 \\text{ for } x > 2, \\quad f'(x) < 0 \\text{ for } x < 2",
          annotation:
            'Step 2: Read the sign of $f\'$. To the right of $x = 2$ the function increases; to the left it decreases. Either piece is one-to-one.',
        },
        {
          expression: '\\text{Restrict to } [2, \\infty)',
          annotation:
            'Step 3: Choose a restriction. We pick $[2, \\infty)$ — the increasing branch — because it includes the output range $[1, \\infty)$ that starts at the minimum value $f(2) = 1$.',
        },
        {
          expression: 'y = x^2 - 4x + 5 = (x-2)^2 + 1',
          annotation:
            'Step 4: Complete the square to make solving easier. Write $y = (x-2)^2 + 1$.',
        },
        {
          expression: 'x = (y - 2)^2 + 1',
          annotation: 'Swap $x$ and $y$.',
        },
        {
          expression: '(y-2)^2 = x - 1',
          annotation: 'Isolate the squared term.',
        },
        {
          expression: 'y - 2 = \\sqrt{x - 1}',
          annotation:
            'Take the positive square root because we restricted to $y \\geq 2$ (the increasing branch). This is where the domain restriction earns its keep — without it, $\\pm\\sqrt{x-1}$ would give two answers.',
        },
        {
          expression: 'f^{-1}(x) = 2 + \\sqrt{x - 1}, \\quad x \\geq 1',
          annotation:
            'Final answer. Domain of $f^{-1}$ is $[1, \\infty)$, which equals the range of $f$ on $[2, \\infty)$.',
        },
      ],
      conclusion:
        'For non-monotone functions: find the vertex/turning point using $f\'$, pick a monotone branch, apply the $\\pm$ rule using your restriction.',

    },
    {
      id: 'ch3-008-ex3',
      title: 'Using the Derivative Formula at a Point',
      problem:
        "\\text{Let } f(x) = x^5 + x. \\text{ Find } (f^{-1})'(2).",
      steps: [
        {
          expression: "f(1) = 1^5 + 1 = 2",
          annotation:
            'Step 1: Find $a$ such that $f(a) = 2$ — this tells us which input to $f$ maps to the output $2$, i.e., $f^{-1}(2) = 1$. Try small integers.',
        },
        {
          expression: "f^{-1}(2) = 1",
          annotation:
            'We just found that $f^{-1}(2) = 1$. This is the value we will plug into $f\'$.',
        },
        {
          expression: "f'(x) = 5x^4 + 1",
          annotation: 'Step 2: Differentiate $f$.',
        },
        {
          expression: "f'(1) = 5(1)^4 + 1 = 6",
          annotation:
            'Step 3: Evaluate $f\'$ at $f^{-1}(2) = 1$.',
        },
        {
          expression: "(f^{-1})'(2) = \\frac{1}{f'(f^{-1}(2))} = \\frac{1}{f'(1)} = \\frac{1}{6}",
          annotation:
            'Step 4: Apply the formula. The derivative of the inverse at $x = 2$ is $1/6$. Note: we never had to find a formula for $f^{-1}(x)$ — just one specific value.',
        },
      ],
      conclusion:
        'To use the formula at a point: (1) solve $f(a) = x$ to find $f^{-1}(x) = a$, (2) compute $f\'(a)$, (3) take the reciprocal. You never need an explicit formula for $f^{-1}$.',
    },
    {
      id: 'ch3-008-ex4',
      title: 'Derivative of $\\arcsin(x)$',
      problem:
        "\\text{Derive the formula } \\frac{d}{dx}\\arcsin(x) = \\frac{1}{\\sqrt{1-x^2}}.",
      steps: [
        {
          expression: 'y = \\arcsin(x) \\implies \\sin(y) = x, \\quad y \\in \\bigl[-\\tfrac{\\pi}{2}, \\tfrac{\\pi}{2}\\bigr]',
          annotation:
            'Let $y = \\arcsin(x)$. By definition this means $\\sin(y) = x$ and $y$ lives in the restricted domain where $\\sin$ is one-to-one.',
        },
        {
          expression: '\\frac{d}{dx}[\\sin(y)] = \\frac{d}{dx}[x]',
          annotation: 'Differentiate both sides with respect to $x$ (implicit differentiation).',
        },
        {
          expression: '\\cos(y) \\cdot \\frac{dy}{dx} = 1',
          annotation: 'Chain rule on the left: $\\frac{d}{dx}\\sin(y) = \\cos(y) \\cdot \\frac{dy}{dx}$.',
        },
        {
          expression: '\\frac{dy}{dx} = \\frac{1}{\\cos(y)}',
          annotation: 'Solve for $dy/dx$.',
        },
        {
          expression: '\\sin^2(y) + \\cos^2(y) = 1 \\implies \\cos(y) = \\sqrt{1 - \\sin^2(y)} = \\sqrt{1 - x^2}',
          annotation:
            'Rewrite $\\cos(y)$ in terms of $x$ using the Pythagorean identity and $\\sin(y) = x$. The positive square root is correct because $y \\in [-\\pi/2, \\pi/2]$ keeps $\\cos(y) \\geq 0$.',
        },
        {
          expression: '\\frac{d}{dx}\\arcsin(x) = \\frac{1}{\\sqrt{1-x^2}}, \\quad -1 < x < 1',
          annotation:
            'Substitute $\\cos(y) = \\sqrt{1-x^2}$. Domain excludes $\\pm 1$ because $\\cos(y) = 0$ there — the tangent to $\\arcsin$ is vertical at the endpoints.',
        },
      ],
      conclusion:
        'The derivation pattern — let $y = \\arcsin(x)$, write $\\sin(y) = x$, differentiate implicitly, use a trig identity to eliminate $y$ — applies to all inverse trig functions.',
     
    },
    {
      id: 'ch3-008-ex5',
      title: 'Derivative of $\\arctan(x)$',
      problem:
        "\\text{Derive } \\frac{d}{dx}\\arctan(x) = \\frac{1}{1+x^2}.",
      steps: [
        {
          expression: 'y = \\arctan(x) \\implies \\tan(y) = x, \\quad y \\in \\bigl(-\\tfrac{\\pi}{2}, \\tfrac{\\pi}{2}\\bigr)',
          annotation: 'Set up: $\\tan(y) = x$ with the standard restriction.',
        },
        {
          expression: '\\sec^2(y) \\cdot \\frac{dy}{dx} = 1',
          annotation:
            'Differentiate both sides with respect to $x$. Left side: $\\frac{d}{dx}\\tan(y) = \\sec^2(y) \\cdot \\frac{dy}{dx}$ by chain rule.',
        },
        {
          expression: '\\frac{dy}{dx} = \\frac{1}{\\sec^2(y)} = \\cos^2(y)',
          annotation: 'Isolate $dy/dx$.',
        },
        {
          expression: '\\sec^2(y) = 1 + \\tan^2(y) = 1 + x^2',
          annotation:
            'Use the Pythagorean identity $\\sec^2(y) = 1 + \\tan^2(y)$ and substitute $\\tan(y) = x$.',
        },
        {
          expression: '\\frac{d}{dx}\\arctan(x) = \\frac{1}{1+x^2}',
          annotation:
            'Therefore $dy/dx = 1/(1+x^2)$. This is defined for all real $x$ — $\\arctan$ has no domain restriction issues in its derivative.',
        },
      ],
      conclusion:
        'Key move: eliminate the trig function of $y$ by applying the right Pythagorean identity and substituting the original equation. For $\\arctan$ that is $\\sec^2 = 1 + \\tan^2$; for $\\arcsin$ it is $\\sin^2 + \\cos^2 = 1$.',
    },
    {
      id: 'ch3-008-ex6',
      title: 'Chain Rule with Inverse Trig',
      problem:
        "\\text{Find } \\frac{d}{dx}\\arctan(3x^2).",
      steps: [
        {
          expression: '\\frac{d}{dx}\\arctan(u) = \\frac{1}{1+u^2} \\cdot \\frac{du}{dx}, \\quad u = 3x^2',
          annotation:
            'This is a composition: $\\arctan$ of $(3x^2)$. Set up the chain rule: derivative of outer times derivative of inner.',
        },
        {
          expression: '\\frac{du}{dx} = 6x',
          annotation: 'Differentiate the inside: $u = 3x^2$, so $du/dx = 6x$.',
        },
        {
          expression: '\\frac{d}{dx}\\arctan(3x^2) = \\frac{1}{1+(3x^2)^2} \\cdot 6x',
          annotation: 'Substitute $u = 3x^2$ and $du/dx = 6x$ into the chain rule expression.',
        },
        {
          expression: '= \\frac{6x}{1 + 9x^4}',
          annotation: 'Simplify $(3x^2)^2 = 9x^4$. Final answer.',
        },
      ],
      conclusion:
        'Inverse trig derivatives combined with the chain rule always follow the same pattern: apply the standard formula with $u$ replacing $x$, then multiply by $du/dx$.',
    },
  ],

  challenges: [
    {
      id: 'ch2-002-ch1',
      difficulty: 'easy',
      problem: '\\text{Find } \\frac{d}{dx}[\\arcsin(2x)].',
      hint: 'Use arcsin chain rule with u=2x.',
      walkthrough: [
        { expression: "\\frac{d}{dx}[\\arcsin(u)] = \\frac{u'}{\\sqrt{1-u^2}}", annotation: '' },
        { expression: "u=2x,\\;u'=2", annotation: '' },
        { expression: "y'=\\frac{2}{\\sqrt{1-4x^2}}", annotation: '' },
      ],
      answer: '2/sqrt(1-4x^2)',
    },
    {
      id: 'ch2-002-ch2',
      difficulty: 'medium',
      problem: '\\text{Given } f(2)=5, f\'(2)=-3, \\text{ find } (f^{-1})\'(5).',
      hint: 'Use reciprocal slope at corresponding points.',
      walkthrough: [
        { expression: '(f^(-1))\'(x)=1/f\'(f^(-1)(x))', annotation: '' },
        { expression: 'f^(-1)(5)=2', annotation: 'Because f(2)=5.' },
        { expression: '(f^(-1))\'(5)=1/f\'(2)=1/(-3)=-1/3', annotation: '' },
      ],
      answer: '-1/3',
    },
    {
      id: 'ch3-008-ch1',
      difficulty: 'easy',
      problem: "\\text{Find } f^{-1}(x) \\text{ for } f(x) = \\frac{x+1}{2}.",
      hint: 'Write $y = (x+1)/2$, swap $x$ and $y$, solve for $y$.',
      walkthrough: [
        {
          expression: 'x = \\dfrac{y+1}{2}',
          annotation: 'Swap $x$ and $y$.',
        },
        {
          expression: '2x = y + 1',
          annotation: 'Multiply both sides by 2.',
        },
        {
          expression: 'f^{-1}(x) = 2x - 1',
          annotation: 'Solve for $y$ and rename.',
        },
      ],
      answer: 'f^{-1}(x) = 2x - 1',
    },
    {
      id: 'ch3-008-ch2',
      difficulty: 'easy',
      problem:
        "\\text{Let } g(x) = x^3 + 2. \\text{ Find } (g^{-1})'(10).",
      hint:
        'Find $a$ such that $g(a) = 10$. Then use the formula $(g^{-1})\'(10) = 1/g\'(a)$.',
      walkthrough: [
        {
          expression: 'g(2) = 8 + 2 = 10 \\implies g^{-1}(10) = 2',
          annotation: 'Identify which input to $g$ gives output 10.',
        },
        {
          expression: "g'(x) = 3x^2 \\implies g'(2) = 12",
          annotation: 'Differentiate $g$ and evaluate at $x = 2$.',
        },
        {
          expression: "(g^{-1})'(10) = \\frac{1}{g'(2)} = \\frac{1}{12}",
          annotation: 'Apply the inverse derivative formula.',
        },
      ],
      answer: "(g^{-1})'(10) = \\dfrac{1}{12}",
    },
    {
      id: 'ch3-008-ch3',
      difficulty: 'medium',
      problem:
        "\\text{Differentiate } h(x) = \\arcsin(\\sqrt{x}).",
      hint:
        'Use chain rule. The outer function is $\\arcsin(u)$ where $u = \\sqrt{x} = x^{1/2}$.',
      walkthrough: [
        {
          expression: "h'(x) = \\frac{1}{\\sqrt{1 - (\\sqrt{x})^2}} \\cdot \\frac{d}{dx}(\\sqrt{x})",
          annotation: 'Chain rule: derivative of $\\arcsin(u)$ times derivative of the inside.',
        },
        {
          expression: '\\frac{d}{dx}(\\sqrt{x}) = \\frac{1}{2\\sqrt{x}}',
          annotation: 'Power rule on the inside.',
        },
        {
          expression: "h'(x) = \\frac{1}{\\sqrt{1 - x}} \\cdot \\frac{1}{2\\sqrt{x}}",
          annotation: 'Substitute and simplify $(\\sqrt{x})^2 = x$.',
        },
        {
          expression: "h'(x) = \\frac{1}{2\\sqrt{x(1-x)}}",
          annotation: 'Combine denominators. Valid for $0 < x < 1$.',
        },
      ],
      answer: "h'(x) = \\dfrac{1}{2\\sqrt{x(1-x)}}",
    },
    {
      id: 'ch3-008-ch4',
      difficulty: 'medium',
      problem:
        '\\text{Show that } f(x) = x + e^x \\text{ is one-to-one on } \\mathbb{R}, \\text{ then find } (f^{-1})\'(1).',
      hint:
        "Check the sign of $f'(x)$ to confirm monotonicity. To find $(f^{-1})'(1)$, first solve $f(a) = 1$.",
      walkthrough: [
        {
          expression: "f'(x) = 1 + e^x > 0 \\text{ for all } x \\in \\mathbb{R}",
          annotation:
            'Since $e^x > 0$ always, $f\'(x) > 0$ everywhere. So $f$ is strictly increasing and one-to-one on all of $\\mathbb{R}$.',
        },
        {
          expression: 'f(0) = 0 + e^0 = 1 \\implies f^{-1}(1) = 0',
          annotation: 'Solve $f(a) = 1$: $a + e^a = 1$ is satisfied by $a = 0$.',
        },
        {
          expression: "f'(0) = 1 + e^0 = 2",
          annotation: 'Evaluate the derivative at the identified input.',
        },
        {
          expression: "(f^{-1})'(1) = \\frac{1}{f'(0)} = \\frac{1}{2}",
          annotation: 'Apply the formula.',
        },
      ],
      answer: "(f^{-1})'(1) = \\dfrac{1}{2}",
    },
    {
      id: 'ch3-008-ch5',
      difficulty: 'hard',
      problem:
        "\\text{Derive } \\frac{d}{dx}\\arccos(x) = -\\frac{1}{\\sqrt{1-x^2}} \\text{ from scratch using implicit differentiation.}",
      hint:
        'Let $y = \\arccos(x)$, write $\\cos(y) = x$, differentiate implicitly, and use the identity $\\sin^2(y) + \\cos^2(y) = 1$. Watch the sign — $\\sin(y) \\geq 0$ on $[0, \\pi]$.',
      walkthrough: [
        {
          expression: 'y = \\arccos(x) \\implies \\cos(y) = x, \\quad y \\in [0, \\pi]',
          annotation: 'Set up with the standard restriction.',
        },
        {
          expression: '-\\sin(y) \\cdot \\frac{dy}{dx} = 1',
          annotation:
            'Differentiate both sides: $\\frac{d}{dx}\\cos(y) = -\\sin(y) \\cdot \\frac{dy}{dx}$.',
        },
        {
          expression: '\\frac{dy}{dx} = \\frac{-1}{\\sin(y)}',
          annotation: 'Solve for $dy/dx$.',
        },
        {
          expression: '\\sin(y) = \\sqrt{1 - \\cos^2(y)} = \\sqrt{1-x^2}',
          annotation:
            'Since $y \\in [0, \\pi]$, $\\sin(y) \\geq 0$, so we take the positive root. Substitute $\\cos(y) = x$.',
        },
        {
          expression: '\\frac{d}{dx}\\arccos(x) = -\\frac{1}{\\sqrt{1-x^2}}',
          annotation:
            'Substitute. The negative sign comes from differentiating $\\cos$, not from the square root choice. This is why $\\frac{d}{dx}\\arccos(x)$ and $\\frac{d}{dx}\\arcsin(x)$ are negatives of each other — they sum to a constant: $\\arcsin(x) + \\arccos(x) = \\pi/2$.',
        },
      ],
      answer: "\\frac{d}{dx}\\arccos(x) = -\\dfrac{1}{\\sqrt{1-x^2}}",
    },
  ],

  story: {
    title: "The Mirror Rule",
    subtitle: 'How reversing a relationship turns every slope upside down — and why that single fact unlocks arcsin, arctan, and every inverse calculus tool.',
    acts: [
      {
        label: 'The Scene',
        title: 'A Lead Screw Running Backwards',
        content: `Picture the lead screw on a manual lathe.

Turn the handwheel one full revolution. The tool post advances exactly 2 mm toward the part. That is the **forward machine**: one revolution of input gives 2 mm of output. The "rate" of the forward machine is 2 mm/rev — what machinists call the **lead** of the screw.

Now the question flips. The engineer gives you a print that says "move the tool 2 mm." How many turns of the handwheel do you need?

$$\\text{turns needed} = \\frac{2 \\text{ mm}}{2 \\text{ mm/rev}} = 1 \\text{ turn}$$

But what if you need to move only 1 mm?

$$\\text{turns needed} = \\frac{1 \\text{ mm}}{2 \\text{ mm/rev}} = 0.5 \\text{ turns}$$

The rate of the **reverse machine** — how many turns per mm of travel — is $\\frac{1}{2}$ rev/mm. It is the **reciprocal** of the forward rate.

This is not a coincidence. It is a universal law of inverse relationships:

> **If the forward machine has rate $m$ (output per input), the reverse machine has rate $\\frac{1}{m}$ (input per output).**

The same principle applies to gear ratios, voltage dividers, gearing in a mill, and — this is the calculus lesson — to **any differentiable function and its inverse**. If $f$ converts input change $\\Delta x$ into output change $\\Delta y = f'(a) \\cdot \\Delta x$, then the inverse converts that output change back: $\\Delta x = \\frac{1}{f'(a)} \\cdot \\Delta y$.

The derivative of the inverse is the reciprocal of the derivative of the original — at the **corresponding point**. That is the whole theorem. The rest of this lesson is making it precise and applying it to the inverse trig functions.`,
      },
      {
        label: 'Act I',
        title: 'What Makes a Function Reversible',
        content: `Not every machine can run backwards. To see why, think about the squaring machine:

$$f(x) = x^2$$

Feed it $3$: output $9$. Feed it $-3$: also output $9$.

Now run it backwards: feed in $9$. Which output do you produce — $3$ or $-3$? The machine is confused. Two inputs produced the same output, so the reverse machine cannot give a unique answer. **This machine is not reversible on all of $\\mathbb{R}$.**

The precise requirement for a machine to be reversible is called **one-to-one** (or injective): every output must come from exactly one input. Equivalently, different inputs always produce different outputs.

**The visual test:** draw your graph and run a horizontal line through it. If any horizontal line hits the curve more than once, the function is not one-to-one — two inputs give the same height, so the reverse is undefined.

$f(x) = x^2$ fails this test: the horizontal line $y = 9$ hits the parabola at both $x = 3$ and $x = -3$.

$f(x) = x^3$ passes: no horizontal line hits a cubic more than once (it is always increasing or always decreasing).

**Monotonicity is the key.** If a function is either strictly increasing everywhere or strictly decreasing everywhere — never turning around — it is one-to-one. And you can check this with the derivative:

- If $f'(x) > 0$ throughout an interval $\Rightarrow$ $f$ is strictly increasing $\Rightarrow$ one-to-one $\Rightarrow$ **invertible there**.
- If $f'(x) < 0$ throughout an interval $\Rightarrow$ strictly decreasing $\Rightarrow$ one-to-one $\Rightarrow$ **invertible there**.

For $x^2$: $f'(x) = 2x$, which is negative for $x < 0$ and positive for $x > 0$. On all of $\\mathbb{R}$ it changes sign — not monotone. But if we restrict to $[0, \\infty)$, the derivative is $\\geq 0$ throughout, so the machine is reversible on that piece. That piece gives us $f^{-1}(x) = \\sqrt{x}$.

**Restricting the domain** is how we rescue functions that are not globally one-to-one. We cut the domain to a piece where the function is monotone, and on that piece we get an invertible machine.`,
      },
      {
        label: 'Act II',
        title: 'The Mirror — Graphs of a Function and Its Inverse',
        content: `Here is the geometric heart of the whole lesson.

Take any point $(a, b)$ on the graph of $f$. It says: "input $a$ gives output $b$." The inverse function reverses that: "input $b$ gives output $a$." So $(b, a)$ is the corresponding point on the graph of $f^{-1}$.

Every point on $f$ becomes a point on $f^{-1}$ with the two coordinates **swapped**.

What does swapping coordinates do to a graph? It is exactly a **reflection across the line $y = x$** — the diagonal line through the origin at 45°.

**Make it concrete.** Take a piece of graph paper and draw the curve $y = x^2$ (for $x \\geq 0$). Now take a small mirror and stand it on edge, tilted at 45°, along the line $y = x$. Look at the reflection. That curved ghost you see in the mirror — rising steeply at first, then flattening out — *is* $y = \\sqrt{x}$, the inverse of $x^2$.

Notice two things in the mirror:

1. **Where the real curve lies nearly flat** (near the vertex of the parabola, slope close to zero), **the mirror image stands nearly vertical** (slope close to infinity). A shallow curve reflects into a steep one.
2. **Where the real curve climbs steeply**, **the mirror image lies nearly flat**. A steep curve reflects into a shallow one.

Flat becomes vertical. Vertical becomes flat. In between, slopes exchange reciprocals. This is not a visual trick — it is the algebra of swapped axes made visible.

**Now the algebra:** on the graph of $f$, the slope at $(a, b)$ is:
$$\\text{slope of } f = \\frac{\\text{rise}}{\\text{run}} = \\frac{\\Delta y}{\\Delta x}$$

When we stand the mirror along $y = x$, every point $(x, y)$ becomes $(y, x)$ — the axes swap. What was the $y$-axis (vertical) becomes the $x$-axis (horizontal), and vice versa. Rise becomes run, and run becomes rise.

The slope at the reflected point $(b, a)$ on $f^{-1}$ is therefore:
$$\\text{slope of } f^{-1} = \\frac{\\text{new rise}}{\\text{new run}} = \\frac{\\Delta x}{\\Delta y} = \\frac{1}{\\Delta y / \\Delta x} = \\frac{1}{\\text{slope of } f}$$

**The slope of the inverse is the reciprocal of the slope of the original.** This is the Mirror Rule. Back to the lead screw: the forward rate was 2 mm/rev; the reverse rate is 1/2 rev/mm. Same principle.

Written precisely: if $f(a) = b$ and $f'(a)$ exists and is nonzero, then:
$$\\boxed{(f^{-1})'(b) = \\frac{1}{f'(a)}}$$

**The wall warning:** notice the requirement $f'(a) \\neq 0$. If the original curve has a flat tangent (slope = 0), the mirror image has a *vertical* tangent — no slope at all. The mirror of a lying-flat line is a vertical wall — perfectly upright, infinite slope, undefined derivative. At those points the inverse simply is not differentiable.`,
      },
      {
        label: 'Act III',
        title: 'The Proof — Deriving the Mirror Rule from the Chain Rule',
        content: `The geometric argument is convincing, but calculus demands a proof. Here it is, step by step.

**Starting point:** the defining equation of an inverse function.

If $f$ and $f^{-1}$ are true inverses, then applying $f$ and then $f^{-1}$ gets you back to where you started:
$$f^{-1}(f(x)) = x \\quad \\text{for every } x \\text{ in the domain of } f$$

This equation is just a statement of fact about what "inverse" means. Now we differentiate both sides with respect to $x$.

**Right side:** $\\dfrac{d}{dx}[x] = 1$.

**Left side:** $f^{-1}(f(x))$ is a composition — $f^{-1}$ applied to $f(x)$. We need the **Chain Rule**.

The Chain Rule says: to differentiate a composition $g(h(x))$, multiply the derivative of the outer function (evaluated at the inner function) by the derivative of the inner function:
$$\\frac{d}{dx}[g(h(x))] = g'(h(x)) \\cdot h'(x)$$

Here the outer function is $f^{-1}$ and the inner function is $f(x)$:
$$\\frac{d}{dx}[f^{-1}(f(x))] = (f^{-1})'(f(x)) \\cdot f'(x)$$

Setting left side equal to right side:
$$(f^{-1})'(f(x)) \\cdot f'(x) = 1$$

Divide both sides by $f'(x)$ — this is legal as long as $f'(x) \\neq 0$:
$$(f^{-1})'(f(x)) = \\frac{1}{f'(x)}$$

Now substitute $b = f(x)$ (so $x = f^{-1}(b)$):
$$(f^{-1})'(b) = \\frac{1}{f'(f^{-1}(b))}$$

Or written with $x$ as the input variable:
$$\\boxed{\\frac{d}{dx}[f^{-1}(x)] = \\frac{1}{f'(f^{-1}(x))}}$$

**Reading the formula:** to find the derivative of the inverse at a point $x = b$, first find which input $a = f^{-1}(b)$ maps to $b$ under $f$. Then evaluate $f'$ at that input $a$. Take the reciprocal.

**The Shop Floor Rule (read this before every problem):**

> *"Find the slope of the original guy at the original spot — then flip it."*

Here is how to apply it without getting confused:
1. You are asked for $(f^{-1})'(b)$ — the rate of the reverse machine at output value $b$.
2. Ask: *which spot on the forward machine produced output $b$?* That spot is $a = f^{-1}(b)$.
3. Evaluate the forward machine's rate there: $f'(a)$.
4. Flip it: $(f^{-1})'(b) = 1/f'(a)$.

Do not try to find the slope of the inverse directly if you do not have its formula. The forward machine already knows everything you need — you just have to ask it at the right spot and take the reciprocal. Think of it like the lead screw: you do not need to study the reverse mechanism separately. You already know the thread pitch of the forward screw. Just invert the units.

The common mistake — evaluating $f'$ at $b$ instead of $a$ — is like reading the gear ratio of the wrong gear. The formula is $f'(a)$ where $a$ is the **input** on the forward side. Never $b$.`,

      },
      {
        label: 'Act IV',
        title: 'Arctan — Deriving a Famous Formula from Scratch',
        content: `The most important application of the Mirror Rule is deriving the derivatives of the inverse trig functions. We will do $\\arctan$ in full detail — every prerequisite made explicit.

**Prerequisites you need to know:**
- $\\tan(y) = \\sin(y)/\\cos(y)$ — the definition of tangent.
- The derivative of tangent: $\\dfrac{d}{dy}[\\tan(y)] = \\sec^2(y) = \\dfrac{1}{\\cos^2(y)}$. (This is derived from the quotient rule on $\\sin/\\cos$, or accepted as a standard formula.)
- The Pythagorean identity: $\\sin^2(y) + \\cos^2(y) = 1$.
- Dividing by $\\cos^2(y)$: $\\tan^2(y) + 1 = \\sec^2(y)$. (This is just the Pythagorean identity rearranged.)

**Setting up:**

The function $\\tan(y)$ is not one-to-one on all of $\\mathbb{R}$ — it has period $\\pi$ and repeats forever. We restrict to $y \\in (-\\pi/2, +\\pi/2)$, on which $\\tan$ is strictly increasing (its derivative $\\sec^2(y) > 0$ there). On this interval, $\\tan$ is one-to-one and invertible.

The inverse is $\\arctan$: the function that takes a number $x$ and returns the angle $y \\in (-\\pi/2, +\\pi/2)$ whose tangent equals $x$.

$$y = \\arctan(x) \\iff \\tan(y) = x, \\quad y \\in \\left(-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right)$$

**Step 1:** Differentiate both sides of $\\tan(y) = x$ with respect to $x$.

The right side: $\\dfrac{d}{dx}[x] = 1$.

The left side: $\\tan(y)$ is a function of $y$, and $y$ is a function of $x$ (it equals $\\arctan(x)$). This is another composition, so we use the Chain Rule:
$$\\frac{d}{dx}[\\tan(y)] = \\frac{d}{dy}[\\tan(y)] \\cdot \\frac{dy}{dx} = \\sec^2(y) \\cdot \\frac{dy}{dx}$$

Setting equal:
$$\\sec^2(y) \\cdot \\frac{dy}{dx} = 1$$

**Step 2:** Solve for $dy/dx$.

$$\\frac{dy}{dx} = \\frac{1}{\\sec^2(y)}$$

**Step 3:** Express this in terms of $x$, not $y$.

We know $\\tan(y) = x$ (that was our starting equation). Now use $\\sec^2(y) = 1 + \\tan^2(y)$:
$$\\sec^2(y) = 1 + \\tan^2(y) = 1 + x^2$$

**Machinist's Note — Where This Identity Comes From:**

The step $\\sec^2(y) = 1 + \\tan^2(y)$ looks like memorized magic. It is not — it is the **Pythagorean theorem in disguise**.

Draw a right triangle with angle $y$ at the base corner. Label the opposite side $x$ (because $\\tan(y) = x$) and the adjacent side $1$. The hypotenuse is then $\\sqrt{1 + x^2}$ by the Pythagorean theorem: $1^2 + x^2 = h^2$.

Now read off the trig ratios directly from the triangle:
- $\\tan(y) = \\text{opposite}/\\text{adjacent} = x/1 = x$ ✓
- $\\sec(y) = \\text{hypotenuse}/\\text{adjacent} = \\sqrt{1+x^2}/1 = \\sqrt{1+x^2}$
- $\\sec^2(y) = 1 + x^2$ ✓

The identity is not a trig formula you memorize separately — it is just geometry reading from the correct triangle. Once you draw that triangle, $\\sec^2 = 1 + \\tan^2$ is as obvious as the Pythagorean theorem itself. This same triangle-reading technique appears in the arcsin derivation (Act V), where the triangle is slightly different but the logic is identical.

This is why the final answer, $1/(1+x^2)$, looks so clean: the messy trig has been replaced by pure algebra, because the trig was always just hiding a triangle.

**Step 4:** Substitute.

$$\\frac{dy}{dx} = \\frac{1}{1 + x^2}$$

Since $y = \\arctan(x)$, this says:
$$\\boxed{\\frac{d}{dx}[\\arctan(x)] = \\frac{1}{1 + x^2}}$$

**Why this formula is remarkable:** the right side, $\\dfrac{1}{1+x^2}$, involves no trigonometry at all. A pure algebraic fraction is the derivative of this transcendental inverse trig function. The triangle absorbed all the trig and handed back clean algebra. And as $x \\to \\pm\\infty$, the denominator blows up, so the derivative approaches 0 — reflecting the fact that $\\arctan$ flattens out and saturates at $\\pm\\pi/2$ like a machine hitting its hard stop.`,

      },
      {
        label: 'Act V',
        title: 'Arcsin — A Triangle Tells the Story',
        content: `Now we derive the derivative of $\\arcsin$ using the same implicit differentiation technique. The new ingredient is a unit-circle triangle that converts $\\cos(y)$ into an expression involving $x$.

**Setup:** $\\sin$ restricted to $y \\in [-\\pi/2, +\\pi/2]$ is strictly increasing (derivative $\\cos(y) \\geq 0$ there — actually $> 0$ on the open interval). So on that interval $\\sin$ is invertible.

$$y = \\arcsin(x) \\iff \\sin(y) = x, \\quad y \\in \\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right]$$

**Step 1:** Differentiate both sides of $\\sin(y) = x$ with respect to $x$, using the Chain Rule on the left:
$$\\cos(y) \\cdot \\frac{dy}{dx} = 1$$

**Step 2:** Solve for $dy/dx$:
$$\\frac{dy}{dx} = \\frac{1}{\\cos(y)}$$

**Step 3:** Convert $\\cos(y)$ into an expression in $x$.

From the Pythagorean identity $\\sin^2(y) + \\cos^2(y) = 1$, and since $\\sin(y) = x$:
$$x^2 + \\cos^2(y) = 1 \\implies \\cos^2(y) = 1 - x^2 \\implies \\cos(y) = \\pm\\sqrt{1 - x^2}$$

Which sign? Since $y \\in [-\\pi/2, +\\pi/2]$, the cosine is **non-negative** on this interval (both endpoints give $\\cos(\\pm\\pi/2) = 0$, and the interior gives positive cosine). So we take the **positive** square root:
$$\\cos(y) = \\sqrt{1 - x^2}$$

**Step 4:** Substitute:
$$\\frac{dy}{dx} = \\frac{1}{\\sqrt{1 - x^2}}$$

$$\\boxed{\\frac{d}{dx}[\\arcsin(x)] = \\frac{1}{\\sqrt{1-x^2}}, \\quad -1 < x < 1}$$

**Domain:** the formula requires $x^2 < 1$, i.e., $|x| < 1$. At $x = \\pm 1$ the denominator is zero — the tangent to $\\arcsin$ is vertical at the endpoints. This makes geometric sense: $\\arcsin$ climbs steeply and then shoots straight up at its domain boundary.

**The triangle trick (a different way to see Step 3):**

Draw a right triangle with angle $y$ at the base. Since $\\sin(y) = x$, label the opposite side $x$ and the hypotenuse $1$ (a unit-circle triangle). Then the adjacent side is $\\sqrt{1 - x^2}$ by the Pythagorean theorem. And $\\cos(y) = \\text{adjacent}/\\text{hypotenuse} = \\sqrt{1-x^2}/1 = \\sqrt{1-x^2}$.

This triangle trick appears in every inverse trig derivation. It turns abstract identities into a picture you can draw.`,
      },
    ],
    resolution: `**The complete procedure — three situations, one underlying idea:**

**Situation 1: You have f(a) = b and f'(a), and want (f⁻¹)'(b).**
1. Identify which input $a$ maps to the output $b$: find $a$ such that $f(a) = b$.
2. Evaluate $f'$ at that input: compute $f'(a)$.
3. Take the reciprocal: $(f^{-1})'(b) = 1/f'(a)$.
You never need an explicit formula for $f^{-1}$.

**Situation 2: You have an explicit formula for f⁻¹ and want its derivative.**
Use the theorem: $(f^{-1})'(x) = 1/f'(f^{-1}(x))$. Plug in $f^{-1}(x)$ for the argument of $f'$.

**Situation 3: f⁻¹ is an inverse trig function — derive its derivative from scratch.**
1. Write $y = f^{-1}(x)$ and rewrite as $f(y) = x$ (e.g., $\\arctan(x) \\to \\tan(y) = x$).
2. Differentiate both sides with respect to $x$ — Chain Rule on the left gives $f'(y) \\cdot dy/dx = 1$.
3. Solve: $dy/dx = 1/f'(y)$.
4. Convert $f'(y)$ to an expression in $x$ using the original equation $f(y) = x$ and a Pythagorean identity.
5. The result is the derivative formula, always written purely in terms of $x$.

**The results to commit to memory:**

| Inverse function | Derivative | Domain |
|---|---|---|
| $\\arcsin(x)$ | $\\dfrac{1}{\\sqrt{1-x^2}}$ | $(-1, 1)$ |
| $\\arccos(x)$ | $-\\dfrac{1}{\\sqrt{1-x^2}}$ | $(-1, 1)$ |
| $\\arctan(x)$ | $\\dfrac{1}{1+x^2}$ | $(-\\infty, \\infty)$ |

**The deeper truth:** inverting a function is like running time backwards. The forward machine converts a small change $\\Delta x$ into a change $\\Delta y = f'(a) \\cdot \\Delta x$. The reverse machine converts a small change $\\Delta y$ back into $\\Delta x = (1/f'(a)) \\cdot \\Delta y$. Rates invert when you flip direction. That single geometric fact — slopes are reciprocals across the mirror $y = x$ — is all you need to remember. Everything else follows.`,
  },

  crossRefs: [
    { lessonSlug: 'chain-rule', label: 'Chain Rule', context: 'Used in both the formal proof and inverse trig compositions.' },
    { lessonSlug: 'implicit-differentiation', label: 'Implicit Differentiation', context: 'Primary method to derive arcsin/arccos/arctan formulas.' },
    { lessonSlug: 'trig-derivatives', label: 'Trig Derivatives', context: 'Inverse trig results rely on base trig derivative identities.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'solved-challenge',
  ],

  quiz: [
    {
      id: 'inv-func-q1',
      type: 'choice',
      text: 'If $f(a) = b$ and $f$ is differentiable and one-to-one near $a$, then $(f^{-1})\'(b)$ equals:',
      options: [
        "$f'(a)$",
        "$\\dfrac{1}{f'(b)}$",
        "$\\dfrac{1}{f'(a)}$",
        "$-f'(a)$",
      ],
      answer: "$\\dfrac{1}{f'(a)}$",
      hints: ['The inverse derivative rule: evaluate at the matching input $a$ (not at $b$), then take the reciprocal of $f\'(a)$.'],
      reviewSection: 'Math tab — inverse function derivative formula',
    },
    {
      id: 'inv-func-q2',
      type: 'choice',
      text: 'Geometrically, why is the slope of $f^{-1}$ the reciprocal of the slope of $f$ at the corresponding point?',
      options: [
        'Because the graphs are reflections across $y = x$, which swaps the roles of rise and run',
        'Because $f$ and $f^{-1}$ are perpendicular',
        'Because differentiation is a linear operation',
        'Because the product rule forces the derivative to be reciprocal',
      ],
      answer: 'Because the graphs are reflections across $y = x$, which swaps the roles of rise and run',
      hints: ['Reflecting across $y=x$ swaps $x$ and $y$ coordinates, turning $\\Delta y / \\Delta x$ into $\\Delta x / \\Delta y$.'],
      reviewSection: 'Intuition tab — reflection across y = x swaps rise and run',
    },
    {
      id: 'inv-func-q3',
      type: 'input',
      text: 'Given $f(x) = x^3$ so $f\'(x) = 3x^2$, find $(f^{-1})\'(8)$. (Note: $f(2) = 8$.)',
      answer: '1/12',
      hints: ['$(f^{-1})\'(8) = 1/f\'(2) = 1/(3 \\cdot 2^2) = 1/12$.'],
      reviewSection: 'Math tab — applying the inverse derivative rule',
    },
    {
      id: 'inv-func-q4',
      type: 'input',
      text: 'Find $\\dfrac{d}{dx}[\\arcsin(x)]$.',
      answer: '1/sqrt(1-x^2)',
      hints: ['Use implicit differentiation on $\\sin(y) = x$: $\\cos(y)\\,dy/dx = 1$. Replace $\\cos(y) = \\sqrt{1-x^2}$.'],
      reviewSection: 'Math tab — derivative of arcsin',
    },
    {
      id: 'inv-func-q5',
      type: 'input',
      text: 'Find $\\dfrac{d}{dx}[\\arctan(x)]$.',
      answer: '1/(1+x^2)',
      hints: ['Implicit differentiation on $\\tan(y) = x$: $\\sec^2(y)\\,dy/dx = 1$. Use $\\sec^2(y) = 1+\\tan^2(y) = 1+x^2$.'],
      reviewSection: 'Math tab — derivative of arctan',
    },
    {
      id: 'inv-func-q6',
      type: 'input',
      text: 'Find $\\dfrac{d}{dx}[\\arcsin(3x)]$ using the chain rule.',
      answer: '3/sqrt(1-(3*x)^2)',
      hints: ['Chain rule: $\\dfrac{1}{\\sqrt{1-(3x)^2}} \\cdot 3$.'],
      reviewSection: 'Math tab — chain rule with arcsin',
    },
    {
      id: 'inv-func-q7',
      type: 'input',
      text: 'Find $\\dfrac{d}{dx}[\\arctan(x^2)]$ using the chain rule.',
      answer: '2*x / (1+x^4)',
      hints: ['Chain rule: $\\dfrac{1}{1+(x^2)^2} \\cdot 2x = \\dfrac{2x}{1+x^4}$.'],
      reviewSection: 'Math tab — chain rule with arctan',
    },
    {
      id: 'inv-func-q8',
      type: 'input',
      text: 'Find $\\dfrac{d}{dx}[\\arccos(x)]$.',
      answer: '-1/sqrt(1-x^2)',
      hints: ['The formula is $-\\dfrac{1}{\\sqrt{1-x^2}}$ — note the negative sign, opposite to arcsin.'],
      reviewSection: 'Math tab — derivative of arccos',
    },
    {
      id: 'inv-func-q9',
      type: 'input',
      text: 'Given $f(x) = e^x$ (so $f^{-1}(x) = \\ln x$), use the inverse derivative rule to compute $(f^{-1})\'(x)$ directly. ($f\'(x) = e^x$ and $f^{-1}(x) = \\ln x$, so $a = \\ln x$ and $b = x$.)',
      answer: '1/x',
      hints: ['$(f^{-1})\'(x) = 1/f\'(\\ln x) = 1/e^{\\ln x} = 1/x$. This recovers the known formula $\\dfrac{d}{dx}[\\ln x] = 1/x$.'],
      reviewSection: 'Math tab — inverse rule recovering d/dx[ln x]',
    },
    {
      id: 'inv-func-q10',
      type: 'choice',
      text: 'Why must a function be one-to-one (pass the horizontal line test) to have an inverse that is a function?',
      options: [
        'Because otherwise the inverse would not be continuous',
        'Because if two inputs give the same output, the inverse cannot assign a unique output to that value',
        'Because one-to-one functions always have positive derivatives',
        'Because the chain rule requires the function to be one-to-one',
      ],
      answer: 'Because if two inputs give the same output, the inverse cannot assign a unique output to that value',
      hints: ['If $f(2) = f(-2) = 9$, the "inverse" at input 9 would need to output both 2 and $-2$ — not a function.'],
      reviewSection: 'Intuition tab — why one-to-one is required for an inverse',
    },
  ],
  walkthroughs: [
  {
    id: 'wt-deriv-inverse-basic',
    title: 'Derivative of an Inverse Function (Direct Formula)',
    prereqs: ['Chain rule', 'Implicit differentiation', 'Inverse functions'],
    problem: 'Given $f(x) = x^3 + x$, find $(f^{-1})\'(2)$.',
    steps: [
      {
        label: 'Recognize the structure — inverse derivative',
        visualNote: 'Imagine the graph of $f$ and its inverse reflected across $y=x$. The slope at corresponding points is reciprocal.',
        strategy: 'We do NOT invert the function explicitly. Use the inverse derivative formula directly.',
        explanation: 'At first glance, this problem looks like it wants you to find $f^{-1}(x)$ explicitly—but that is a trap. The function $f(x) = x^3 + x$ does not have a simple closed-form inverse. The key observation is this: we are not being asked for the inverse itself, only its derivative at a specific point. That changes everything. Instead of solving for $f^{-1}$, we use the relationship between a function and its inverse: their slopes at corresponding points are reciprocals. So rather than going backwards explicitly, we evaluate the forward derivative and flip it.',
        math: '(f^{-1})\'(a) = \\frac{1}{f\'(f^{-1}(a))}',
        conceptRef: 'Derivative of inverse function formula',
      },
      {
        label: 'Find the corresponding input value',
        visualNote: 'We locate the point on $f$ whose output is 2 — this maps to the inverse input.',
        strategy: 'We need $x$ such that $f(x) = 2$. This gives the input where we evaluate $f\'$.',
        explanation: 'Here is the subtle but critical move: the formula requires $f^{-1}(2)$, which is the input value that produces output 2 under $f$. So instead of thinking about the inverse directly, we solve the equation $f(x) = 2$. This is just a root-finding step. Trying small values, we see that $x=1$ works because $1^3 + 1 = 2$. That means $f^{-1}(2) = 1$. This is the bridge between the inverse world and the original function—we have translated the problem entirely into the domain of $f$.',
        math: 'f(x) = 2 \\Rightarrow x^3 + x = 2 \\Rightarrow x = 1',
        gotcha: 'Do NOT attempt to algebraically invert $f(x)$ — it is unnecessary and often impossible in closed form.',
      },
      {
        label: 'Differentiate $f(x)$',
        visualNote: 'The slope of $f$ at $x=1$ is highlighted on the graph.',
        strategy: 'Compute $f\'(x)$ normally, then evaluate at the point found.',
        explanation: 'Now we return to familiar territory: differentiation. The function $f(x) = x^3 + x$ is straightforward to differentiate using the power rule. This gives $f\'(x) = 3x^2 + 1$. The important thing is not just computing this derivative, but understanding what it represents: it is the slope of the original function at any point $x$. Since we found that $f^{-1}(2) = 1$, we evaluate this slope at $x=1$.',
        math: 'f\'(x) = 3x^2 + 1',
      },
      {
        label: 'Apply the inverse derivative formula',
        explanation: 'Now everything comes together. The derivative of the inverse at 2 is the reciprocal of the derivative of the original function at the corresponding input. We already found that input to be 1, and the derivative there is $3(1)^2 + 1 = 4$. Taking the reciprocal gives the final answer. This reciprocal relationship reflects the geometric symmetry: inverse functions reflect across $y=x$, which flips slopes.',
        math: '(f^{-1})\'(2) = \\frac{1}{f\'(1)} = \\frac{1}{4}',
        sandbox: {
          value: 'x=1',
          rows: [
            { label: '$f(1)$', expr: '1^3 + 1 = 2' },
            { label: '$f\'(1)$', expr: '3(1)^2 + 1 = 4' },
            { label: 'Inverse slope', expr: '1/4' },
          ],
          conclusion: 'The slope of the inverse at output 2 is the reciprocal of the slope of $f$ at input 1.',
        },
        conceptRef: 'Reciprocal slope relationship of inverse functions',
      },
    ],
    variations: [
      {
        question: 'Find $(f^{-1})\'(0)$ for $f(x) = x^3 + x$.',
        hint: 'Solve $x^3 + x = 0$ → $x=0$, then compute $1/f\'(0)$.',
      },
    ],
  },

  {
    id: 'wt-deriv-inverse-implicit',
    title: 'Derivative of Inverse via Implicit Differentiation',
    prereqs: ['Implicit differentiation', 'Chain rule'],
    problem: 'Find $\\dfrac{d}{dx}(\\arcsin x)$.',
    steps: [
      {
        label: 'Rewrite using inverse relationship',
        visualNote: 'We reinterpret $y = \\arcsin x$ as $x = \\sin y$.',
        strategy: 'Convert inverse trig into an implicit equation we can differentiate.',
        explanation: 'Inverse trig functions are often easier to differentiate indirectly. Instead of trying to differentiate $\\arcsin x$ directly, we rewrite the relationship in its original form: if $y = \\arcsin x$, then by definition $\\sin y = x$. This reframing is powerful—it converts an unfamiliar derivative into one involving a basic trig function we already know how to differentiate. This is the essence of implicit differentiation: trade a difficult expression for a familiar relationship.',
        math: 'y = \\arcsin x \\quad \\Rightarrow \\quad \\sin y = x',
        conceptRef: 'Definition of inverse functions',
      },
      {
        label: 'Differentiate both sides implicitly',
        visualNote: 'The derivative propagates through $\\sin y$ using chain rule.',
        strategy: 'Differentiate with respect to $x$, treating $y$ as a function of $x$.',
        explanation: 'Now we differentiate both sides with respect to $x$. The right side is simple: derivative of $x$ is 1. The left side requires the chain rule because $y$ depends on $x$. The derivative of $\\sin y$ is $\\cos y \\cdot \\frac{dy}{dx}$. This is where many students hesitate—the key is to remember that $y$ is not independent; it is a function of $x$. So every time we differentiate a function of $y$, we multiply by $dy/dx$.',
        math: '\\cos y \\cdot \\frac{dy}{dx} = 1',
        gotcha: 'Forgetting the chain rule factor $dy/dx$ is the most common mistake here.',
      },
      {
        label: 'Solve for $dy/dx$',
        visualNote: 'We isolate the slope of the inverse function.',
        strategy: 'Algebraically isolate the derivative term.',
        explanation: 'We now solve for $\\frac{dy}{dx}$ by dividing both sides by $\\cos y$. This gives $\\frac{dy}{dx} = \\frac{1}{\\cos y}$. But we are not done—this answer is still in terms of $y$, and we need everything in terms of $x$. This is the second subtle step in implicit differentiation: after differentiating, we must translate back to the original variable.',
        math: '\\frac{dy}{dx} = \\frac{1}{\\cos y}',
      },
      {
        label: 'Rewrite in terms of $x$',
        explanation: 'To convert $\\cos y$ into an expression involving $x$, we use the identity $\\sin^2 y + \\cos^2 y = 1$. Since $\\sin y = x$, we substitute and get $\\cos^2 y = 1 - x^2$. Taking the positive square root (because $\\arcsin x$ is defined on $[-\\pi/2, \\pi/2]$ where cosine is positive), we get $\\cos y = \\sqrt{1 - x^2}$. Substituting back gives the final derivative entirely in terms of $x$.',
        math: '\\frac{d}{dx}(\\arcsin x) = \\frac{1}{\\sqrt{1 - x^2}}',
        sandbox: {
          value: 'x = 0',
          rows: [
            { label: '$\\arcsin(0)$', expr: '0' },
            { label: 'Derivative', expr: '1/\\sqrt{1-0} = 1' },
          ],
          conclusion: 'At $x=0$, the slope is 1 — consistent with the graph of $\\arcsin x$.',
        },
        conceptRef: 'Pythagorean identity and inverse trig domains',
      },
    ],
    variations: [
      {
        question: 'Find $\\dfrac{d}{dx}(\\arccos x)$.',
        hint: 'Start with $y = \\arccos x \\Rightarrow \\cos y = x$, then differentiate.',
      },
    ],
  },
],
}

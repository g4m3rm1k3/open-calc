export default {
  id: 'ch2-002b',
  slug: 'derivatives-of-inverse-functions',
  chapter: 2,
  order: 2,
  title: 'Derivatives of Inverse Functions',
  subtitle: 'General inverse-derivative rule, formal proof, and inverse trig formulas',
  tags: ['inverse functions', 'derivative of inverse', 'arcsin', 'arccos', 'arctan', 'implicit differentiation', 'inverse functions',
    'domain restriction',
    'monotone',
    'one-to-one',
    'horizontal line test',
    'derivative of inverse',
    'arcsin',
    'arctan',
    'arccos',
    'implicit differentiation',],
  aliases: 'section 3.7 derivative of inverse function formal proof inverse trig derivatives arcsin arccos arctan inverse trig derivatives, finding inverse, f inverse prime, 1 over f prime',

  hook: {
    question: 'If a function maps x to y, how do slopes transform when we reverse that mapping and view x as a function of y?',
    realWorldContext:
      'Sensor calibration, coordinate transforms, control systems, and inverse kinematics all rely on inverse mappings. ' +
      'When you reverse a relationship, rates invert too - but at the correct corresponding point. ' +
      'This rule is also the engine behind derivatives of arcsin, arccos, and arctan.',
    previewVisualizationId: 'DualGraphSync',
  },

  intuition: {
    prose: [
      'If y = f(x), then the inverse relation is x = f^(-1)(y). Intuitively, moving forward through f and then backward through f^(-1) cancels out.',
      'On a graph, f and f^(-1) are reflections across y = x. Reflection swaps x and y coordinates, so tangent rise/run becomes run/rise. That is why inverse slopes are reciprocals.',
      'The most common mistake is evaluating at the wrong point. If f(a) = b, then the reciprocal slope relation is between f\'(a) and (f^(-1))\'(b), not at the same x-value.',
      'This general rule plus implicit differentiation gives the inverse trig derivatives cleanly, with domain restrictions built in.',
      'Think of a function as a machine. You put in $x$, it produces $y = f(x)$. An inverse function is a second machine that takes the output $y$ and hands back the original input $x$. We write it $f^{-1}(y) = x$, or equivalently $f^{-1}(f(x)) = x$ for every $x$ in the domain.',
      'Here is the single most important visual fact: the graph of $f^{-1}$ is the graph of $f$ reflected across the line $y = x$. Every point $(a, b)$ on $f$ becomes the point $(b, a)$ on $f^{-1}$. That reflection is not a trick — it is the geometric meaning of swapping input and output.',
      'But there is an immediate problem. If $f$ ever produces the same output from two different inputs — say $f(2) = 9$ and $f(-2) = 9$ — then the "undo" machine is confused: given output $9$, does it return $2$ or $-2$? It cannot do both and still be a function. This is why we need the function to be one-to-one: each output must come from exactly one input.',
      'The quick visual check is the horizontal line test. Draw any horizontal line across the graph of $f$. If any horizontal line hits the graph more than once, $f$ is not one-to-one and has no inverse on that full domain.',
    ],
    callouts: [
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
        caption: 'As a point moves on f, the reflected point on f^(-1) shows reciprocal tangent slope at matching coordinates.',
      },
      {
        id: 'VideoEmbed',
        title: 'Evaluating Inverse Trigonometric Functions',
        props: { url: "" },
      },
      {
        id: 'VideoEmbed',
        title: 'Evaluating Inverse Trigonometric Functions Full Length',
        props: { url: "" },
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
        { expression: '(f^{-1})\'(x) = \\frac{1}{f\'(f^{-1}(x))}', annotation: 'Write the theorem for the derivative of an inverse function.' },
        { expression: '(f^{-1})\'(2) = \\frac{1}{f\'(f^{-1}(2))}', annotation: 'Substitute x = 2.' },
        { expression: 'f^{-1}(2) = 5', annotation: 'Since f(5) = 2, it implies f^{-1}(2) = 5.' },
        { expression: '(f^{-1})\'(2) = \\frac{1}{f\'(5)}', annotation: 'Substitute 5 for f^{-1}(2).' },
        { expression: '(f^{-1})\'(2) = \\frac{1}{4}', annotation: 'Substitute the given slope f\'(5) = 4.' },
      ],
      conclusion: 'The slope at y=2 on the original function translates to 1/4 at x=2 on the inverse.',
      visualizations: [
        {
          id: 'InverseSlopeReflectionLab',
          title: 'Why the Slope Becomes 1/4',
          mathBridge: 'In the example, $f\'(5) = 4$ and we need $(f^{-1})\'(2)$. The point $(5, 2)$ on $f$ maps to $(2, 5)$ on $f^{-1}$ by reflection across $y = x$. At $(5, 2)$ the slope is 4 (rise 1 per run 0.25). At the reflected point $(2, 5)$ the axes are swapped, so slope = $1/4$. The lab shows the same thing for $f(x) = x^2$: move to $a = \\sqrt{5} \\approx 2.24$ to see slopes 4 and 0.25.',
          caption: 'Set a ≈ 2.24. The blue slope will be ≈ 4.47 (= 2a) and the green slope will be ≈ 0.224 (= 1/(2a)). This is the same reciprocal relationship as in the example.',
        },
      ],
    },
    {
      id: 'ch2-002-ex2',
      title: 'Differentiating an Inverse Trig Function with the Chain Rule',
      problem: '\\text{Find } y\' \\text{ for } y = \\arctan(e^x).',
      steps: [
        { expression: "\\frac{d}{dx}[\\arctan(u)] = \\frac{1}{1+u^2} \\cdot u'", annotation: 'Write the derivative rule for arctan combined with the Chain Rule.' },
        { expression: "u = e^x \\implies u' = e^x", annotation: 'Identify the inside function as e^x and its derivative.' },
        { expression: "y' = \\frac{1}{1+(e^x)^2} \\cdot e^x", annotation: 'Substitute into the Chain Rule formula.' },
        { expression: "y' = \\frac{e^x}{1+e^{2x}}", annotation: 'Simplify the power using (e^x)^2 = e^{2x}.' },
      ],
      conclusion: 'The Chain Rule works seamlessly with inverse trig functions.',
      visualizations: [
        {
          id: 'ArcTanDerivationLab',
          title: 'Where 1/(1+u²) Comes From',
          mathBridge: 'The formula $\\frac{d}{dx}[\\arctan u] = \\frac{1}{1+u^2}$ is proved in the lab: implicit differentiation of $\\tan y = u$ gives $\\sec^2(y)\\cdot dy/du = 1$, then the triangle shows $\\sec^2 y = 1 + u^2$. In this example $u = e^x$, so the $1+u^2$ term becomes $1 + e^{2x}$. Set $x \\approx 0$ in the lab (so $u = e^0 = 1$, $x_{\\text{lab}} = 1$) to verify $1/(1+1^2) = 0.5$ for the base arctan derivative before the chain rule multiplies by $u\' = e^x$.',
          caption: 'Drag x in the lab to see how the triangle and the result 1/(1+x²) vary. For ex. 2, substitute u = eˣ into this result and multiply by (eˣ)\'.',
        },
      ],
    },
    {
      id: 'ch2-002-ex3',
      title: 'Derivative of arcsin(sqrt(x))',
      problem: '\\text{Find } y\' \\text{ for } y = \\arcsin(\\sqrt{x}).',
      steps: [
        { expression: "\\frac{d}{dx}[\\arcsin(u)] = \\frac{u'}{\\sqrt{1-u^2}}", annotation: 'Use inverse trig derivative with chain rule.' },
        { expression: "u = \\sqrt{x} = x^{1/2},\\; u' = 1/(2\\sqrt{x})", annotation: 'Differentiate inner function.' },
        { expression: "y' = \\frac{1}{2\\sqrt{x}} \\cdot \\frac{1}{\\sqrt{1-(\\sqrt{x})^2}}", annotation: 'Substitute u and u\'.' },
        { expression: "y' = \\frac{1}{2\\sqrt{x}\\sqrt{1-x}}", annotation: 'Simplify (sqrt(x))^2 = x.' },
      ],
      conclusion: "y' = 1/(2sqrt(x)sqrt(1-x)), valid for 0 < x < 1.",
      visualizations: [
        {
          id: 'ArcTanDerivationLab',
          title: 'The arcsin Triangle (same proof structure)',
          mathBridge: 'The arcsin proof is structurally identical to arctan: let $y = \\arcsin x$, so $\\sin y = x$. Implicit differentiation gives $\\cos y \\cdot dy/dx = 1$, hence $dy/dx = 1/\\cos y$. From a unit-circle right triangle with $\\sin y = x$: $\\cos y = \\sqrt{1-x^2}$, giving $dy/dx = 1/\\sqrt{1-x^2}$. The ArcTan lab uses $\\tan y = x$, so the hypotenuse is $\\sqrt{1+x^2}$; for arcsin, the hypotenuse is 1 (unit circle) and the adjacent is $\\sqrt{1-x^2}$ — same two-step logic, different triangle.',
          caption: 'Compare the arctan triangle here with the arcsin triangle: the role of hypotenuse and adjacent swap. Both proofs use the same implicit differentiation + triangle reading strategy.',
        },
      ],
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
      visualizations: [
        {
          id: 'ArcTanDerivationLab',
          title: 'Why the Chain Rule Multiplies in a Factor of 3',
          mathBridge: 'The base formula $\\frac{d}{dx}[\\arccos u] = -1/\\sqrt{1-u^2}$ has $u\' = 3$ here (since $u = 3x$). The chain rule says multiply the outer derivative by $u\'$: $-1/\\sqrt{1-9x^2} \\cdot 3 = -3/\\sqrt{1-9x^2}$. The ArcTan lab shows the same chain-rule structure for arctan — the inner function derivative multiplies the outer. Note also the minus sign: arccos and arcsin are complementary ($\\arcsin x + \\arccos x = \\pi/2$), so their derivatives are negatives of each other.',
          caption: 'The proof structure (implicit diff → triangle reading) is the same for arccos as for arctan. The only differences are which leg is which in the triangle and the sign.',
        },
      ],
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
      visualizationId: 'InverseFunctionReflection',
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
      visualizationId: 'InverseDerivativeTriangle',
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
}

// FILE: src/content/chapter-2/05-implicit-differentiation.js
export default {
  id: 'ch2-005',
  slug: 'implicit-differentiation',
  chapter: 2,
  order: 5,
  title: 'Implicit Differentiation',
  subtitle: 'Finding dy/dx when y cannot be (or is not) solved for explicitly — the chain rule in disguise',
  tags: ['implicit differentiation', 'implicit function', 'dy/dx', 'circle', 'folium of Descartes', 'chain rule', 'tangent line to curve'],
  aliases: 'section 3.8 implicit differentiation techniques tangent lines implicitly implicit slope',

  hook: {
    question: 'The equation x\u00b2 + y\u00b2 = 25 describes a circle of radius 5. If you try to solve for y, you get y = \u00b1\u221a(25 - x\u00b2) — two separate functions, neither of which describes the whole circle. Now suppose you want the slope of the circle at the point (3, 4). Can you find dy/dx without splitting the circle into two halves?',
    realWorldContext: 'Most interesting curves in mathematics and applications are defined implicitly — the relationship between x and y is given by an equation F(x, y) = 0, not by a formula y = f(x). The unit circle, ellipses, hyperbolas, the folium of Descartes (x\u00b3+y\u00b3=6xy), level curves in economics and thermodynamics, and constraint curves in optimization are all defined implicitly. In machine learning and control, many feasible sets and level sets are implicit surfaces; local sensitivities on those sets are computed with the same derivative logic. Explicit formulas y = f(x) are the exception, not the rule. Implicit differentiation gives us a systematic method to find slopes and rates of change on any such curve, even when an explicit formula cannot be found.',
    previewVisualizationId: 'ImplicitCurveExplorer',
  },

  intuition: {
    prose: [
      'The key insight of implicit differentiation is deceptively simple: y is a function of x. Even if we have not solved for y explicitly — even if solving for y is impossible — we can still treat y as if it is some function y(x). We just do not know which function it is. That is fine, because the chain rule tells us how to differentiate any expression involving y with respect to x, regardless of what y\'s explicit formula might be.',
      'The chain rule says: to differentiate a function of y with respect to x, differentiate with respect to y first, then multiply by dy/dx. This is because y is the inner function and x is the outer variable. So d/dx[y\u00b2] = 2y\u00b7(dy/dx), not just 2y. And d/dx[sin(y)] = cos(y)\u00b7(dy/dx). And d/dx[e^y] = e^y\u00b7(dy/dx). In each case, we treat y as a function of x and apply the chain rule.',
      'The procedure is clean and algorithmic. Step 1: Write down the equation. Step 2: Differentiate both sides with respect to x, applying the chain rule to every y-expression. Step 3: Gather all terms containing dy/dx on one side of the equation. Step 4: Factor out dy/dx. Step 5: Divide to isolate dy/dx. The result expresses dy/dx in terms of both x and y — which is perfectly fine, since dy/dx is the slope of the curve at a specific point (x, y).',
      'Why does dy/dx involve both x and y? Because the slope of an implicit curve at a point depends on where you are on the curve, and to specify a location on a curve like a circle you need both coordinates. At the point (3, 4) on x\u00b2+y\u00b2=25, the slope is different from the slope at (4, 3), even though both x and y values are the same set of numbers.',
      'The tangent line to an implicit curve at a point (x\u2080, y\u2080) is found the same way as always: evaluate dy/dx at (x\u2080, y\u2080) to get the slope m, then use the point-slope formula y - y\u2080 = m(x - x\u2080). The only new subtlety is that dy/dx may involve both x and y, so we must substitute both coordinates to get a number.',
      'The normal line to a curve at a point is perpendicular to the tangent line. If the tangent has slope m, the normal has slope -1/m. Normal lines appear in optics (reflections) and in differential geometry (evolutes and involutes).',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The Chain Rule in Disguise',
        body: "\\frac{d}{dx}[f(y)] = f'(y) \\cdot \\frac{dy}{dx} \\quad \\text{(because } y \\text{ is a function of } x\\text{)}",
      },
      {
        type: 'procedure',
        title: 'Implicit Differentiation Procedure',
        body: "\\text{(1) Differentiate both sides w.r.t. } x \\text{, chain rule on every } y\\text{-term} \\\\ \\text{(2) Gather all } \\frac{dy}{dx} \\text{ terms on one side} \\\\ \\text{(3) Factor and solve for } \\frac{dy}{dx}",
      },
      {
        type: 'example',
        title: 'Quick Example: d/dx[y\u00b3]',
        body: "\\frac{d}{dx}[y^3] = 3y^2 \\cdot \\frac{dy}{dx} \\quad \\text{(chain rule: outer } u^3 \\text{, inner } y(x)\\text{)}",
      },
      {
        type: 'real-world',
        title: 'Constraint Sensitivity Formula',
        body: 'For F(x,y)=0, implicit differentiation gives dy/dx = -F_x/F_y. This local slope is the sensitivity relation used in constrained optimization and gradient-based modeling.',
      },
    ],
    visualizations: [
      {
        id: 'ImplicitDiffReal',
        title: 'Implicit Differentiation in the Real World',
        caption: 'A deep dive into why implicit differentiation exists, how to read formulas like PV=nRT, and core gotchas.',
      },
      {
        id: 'ImplicitDifferentiation',
        title: 'Step-by-Step Implicit Differentiation',
        caption: 'Walk through the machine-logic of differentiating both sides, applying the chain rule, and solving for dy/dx.',
      },
      {
        id: 'ImplicitTangentPlayground',
        title: 'Implicit Tangent Playground',
        caption: 'Move along the circle and watch dy/dx = -x/y drive the tangent line in real time.',
      },
      {
        id: 'ImplicitCurveExplorer',
        props: { showCircle: true, showFolium: true, showTangentAtPoint: true },
        title: 'Implicit Curves and Their Tangent Lines',
        caption: 'Drag the point around the curve to see the tangent computed by implicit differentiation.',
      },
      {
        id: 'ImplicitDiffProof',
        title: 'Proof: x² + y² = r²  →  dy/dx = −x/y',
        caption: 'Step through the complete proof from first principles. Every algebra step goes back to a numerical example, and every rule links to its own proof.',
      },
    ],
  },

  math: {
    prose: [
      'The formal basis for implicit differentiation is the Implicit Function Theorem (IFT), one of the fundamental theorems of multivariable calculus. We state it here without proof, as its full proof requires techniques from several variables calculus.',
      'The Implicit Function Theorem says: suppose F(x, y) = 0 defines a curve near a point (a, b) where F_y(a, b) \u2260 0 (the partial derivative of F with respect to y is nonzero). Then near (a, b), this equation implicitly defines y as a differentiable function of x, and dy/dx = -F_x(a, b) / F_y(a, b).',
      'The condition F_y \u2260 0 is exactly what prevents the tangent line from being vertical — if F_y = 0, the tangent would be vertical (infinite slope), and the equation would not define y as a function of x near that point.',
      'For second-order implicit derivatives, we differentiate the first implicit derivative dy/dx (which is an expression in x and y) with respect to x again, using the quotient rule and chain rule, and substituting the first derivative result wherever dy/dx appears.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Implicit Function Theorem (Statement)',
        body: "\\text{If } F(x,y)=0 \\text{ and } F_y(a,b) \\neq 0, \\text{ then near } (a,b): \\frac{dy}{dx} = -\\frac{F_x(x,y)}{F_y(x,y)}",
      },
      {
        type: 'theorem',
        title: 'Second Implicit Derivative Formula',
        body: "\\text{For }F(x,y)=0,\\; y'=-\\frac{F_x}{F_y},\\; y''=-\\frac{F_{xx}+2F_{xy}y'+F_{yy}(y')^2}{F_y}\\quad(F_y\\neq 0)",
      },
      {
        type: 'definition',
        title: 'Tangent and Normal Lines at (x\u2080, y\u2080)',
        body: "\\text{Tangent: } y - y_0 = \\left.\\frac{dy}{dx}\\right|_{(x_0,y_0)}(x - x_0) \\qquad \\text{Normal: slope} = -\\left(\\left.\\frac{dy}{dx}\\right|_{(x_0,y_0)}\\right)^{-1}",
      },
    ],
    visualizationId: 'TangentToImplicitCurve',
    visualizationProps: {
      showNormalLine: true,
      showImplicitFunctionTheoremCondition: true,
    },
  },

  rigor: {
    prose: [
      'The full Implicit Function Theorem in two variables states: Let F(x, y) be a function with continuous partial derivatives near a point (a, b). If F(a, b) = 0 and the partial derivative F_y(a, b) \u2260 0, then there exists an open interval I containing a and a unique differentiable function y = g(x) defined on I such that g(a) = b and F(x, g(x)) = 0 for all x in I. Moreover, g\'(x) = -F_x(x, g(x)) / F_y(x, g(x)).',
      'The condition F_y(a, b) \u2260 0 is essential. It rules out points where the tangent line would be vertical. At such a point, y is NOT a function of x near (a, b) — the curve doubles back on itself. However, at such points, x IS a function of y, and we could differentiate implicitly in the other direction to find dx/dy.',
      'The proof uses the Contraction Mapping Theorem (or Banach Fixed Point Theorem) to construct the implicit function g, and then uses the chain rule to derive the formula for g\'. The proof is usually covered in a course on real analysis or advanced calculus.',
      'For our purposes, the practical consequence is: implicit differentiation as a procedure is rigorously justified at every point (x\u2080, y\u2080) on the curve where dy/dx is finite (i.e., where the tangent is not vertical). Whenever we carry out implicit differentiation and the algebra produces a well-defined dy/dx, we are on solid theoretical ground.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Implicit Function Theorem (Precise)',
        body: "F(x,y)=0,\\; F_y(a,b)\\neq 0 \\implies \\exists! \\text{ differentiable } y=g(x) \\text{ near } a \\text{ with } g(a)=b \\text{ and } g'(x)=-\\frac{F_x(x,g(x))}{F_y(x,g(x))}",
      },
      {
        type: 'warning',
        title: 'When the Theorem Does Not Apply',
        body: "\\text{If } F_y(a,b) = 0 \\text{, the tangent is vertical and } y \\text{ may not be a function of } x \\text{ near } (a,b).",
      },
    ],
    visualizations: [
      {
        id: 'ImplicitTangentPlayground',
        title: 'Implicit Function Theorem — Live Verification',
        mathBridge: 'The Implicit Function Theorem guarantees that $y$ is locally a function of $x$ whenever $F_y \\neq 0$. On the circle $x^2+y^2=r^2$, we have $F_y=2y$, so the theorem fails only at $(\\pm r, 0)$ — the two points where the tangent is vertical and the circle folds back on itself. Drag around the circle: $dy/dx=-x/y$ is well-defined everywhere except those two points.',
        caption: 'Drag the point to the left/right extremes and watch dy/dx blow up — confirming the theorem\'s condition F_y≠0.',
      },
    ],
  },

  examples: [
    {
      id: 'ch2-005-ex1',
      title: 'Circle: dy/dx and Tangent Line',
      visualizations: [
        {
          id: 'ImplicitTangentPlayground',
          title: 'Circle Tangent — dy/dx = −x/y',
          caption: 'Drag the point to (3, 4): the tangent has slope −3/4. The radius to that point has slope +4/3 — negative reciprocals, confirming the tangent is perpendicular to the radius.',
        },
      ],
      problem: "\\text{Find } dy/dx \\text{ for } x^2+y^2=25. \\text{ Then find the tangent line at } (3,4).",
      steps: [
        {
          expression: "\\frac{d}{dx}[x^2 + y^2] = \\frac{d}{dx}[25]",
          annotation: 'Differentiate both sides of the equation with respect to x. The right side, a constant, gives 0.',
        },
        {
          expression: "2x + 2y\\frac{dy}{dx} = 0",
          annotation: 'Differentiate term by term on the left: d/dx[x\u00b2] = 2x. For d/dx[y\u00b2], apply the chain rule: the outer is u\u00b2 (giving 2u = 2y), and the inner is y(x) (giving dy/dx). So d/dx[y\u00b2] = 2y\u00b7(dy/dx).',
        },
        {
          expression: "2y\\frac{dy}{dx} = -2x",
          annotation: 'Move the 2x term to the right side by subtracting it from both sides.',
        },
        {
          expression: "\\frac{dy}{dx} = \\frac{-2x}{2y} = -\\frac{x}{y}",
          annotation: 'Divide both sides by 2y to isolate dy/dx.',
        },
        {
          expression: "\\left.\\frac{dy}{dx}\\right|_{(3,4)} = -\\frac{3}{4}",
          annotation: 'Substitute the point (3, 4) into dy/dx = -x/y to get the slope at that specific point.',
        },
        {
          expression: "y - 4 = -\\frac{3}{4}(x - 3)",
          annotation: 'Use point-slope form with point (3, 4) and slope -3/4.',
        },
        {
          expression: "y = -\\frac{3}{4}x + \\frac{9}{4} + 4 = -\\frac{3}{4}x + \\frac{25}{4}",
          annotation: 'Simplify: 9/4 + 4 = 9/4 + 16/4 = 25/4.',
        },
      ],
      conclusion: 'dy/dx = -x/y. At (3, 4), the tangent line is y = -(3/4)x + 25/4. Notice that the radius to (3, 4) has slope 4/3, and the tangent has slope -3/4 — these are negative reciprocals, confirming that the tangent is perpendicular to the radius (as expected for a circle).',
    },
    {
      id: 'ch2-005-ex2',
      title: 'Folium of Descartes',
      visualizations: [
        {
          id: 'ImplicitCurveExplorer',
          title: 'Implicit Curves and Tangents',
          caption: 'The folium x³+y³=6xy has a double point at the origin where the curve crosses itself — the Implicit Function Theorem breaks down there (both F_x and F_y are 0). Drag along the rest of the curve to see well-defined tangents.',
        },
      ],
      problem: "\\text{Find } dy/dx \\text{ for the folium of Descartes: } x^3 + y^3 = 6xy.",
      steps: [
        {
          expression: "\\frac{d}{dx}[x^3 + y^3] = \\frac{d}{dx}[6xy]",
          annotation: 'Differentiate both sides with respect to x. The right side is a product: 6 times x times y.',
        },
        {
          expression: "3x^2 + 3y^2\\frac{dy}{dx} = 6\\frac{d}{dx}[xy]",
          annotation: 'Left side: d/dx[x\u00b3] = 3x\u00b2, d/dx[y\u00b3] = 3y\u00b2(dy/dx) by chain rule. Right side needs the product rule.',
        },
        {
          expression: "\\frac{d}{dx}[xy] = 1\\cdot y + x\\cdot\\frac{dy}{dx} = y + x\\frac{dy}{dx}",
          annotation: 'Apply the product rule to xy: (x)\'(y) + (x)(y)\'= 1\u00b7y + x\u00b7(dy/dx). Remember y is a function of x.',
        },
        {
          expression: "3x^2 + 3y^2\\frac{dy}{dx} = 6y + 6x\\frac{dy}{dx}",
          annotation: 'Substitute the product rule result into the equation.',
        },
        {
          expression: "3y^2\\frac{dy}{dx} - 6x\\frac{dy}{dx} = 6y - 3x^2",
          annotation: 'Gather all dy/dx terms on the left: subtract 6x(dy/dx) from both sides, and move 6y to the right.',
        },
        {
          expression: "(3y^2 - 6x)\\frac{dy}{dx} = 6y - 3x^2",
          annotation: 'Factor dy/dx from the left side.',
        },
        {
          expression: "\\frac{dy}{dx} = \\frac{6y - 3x^2}{3y^2 - 6x} = \\frac{2y - x^2}{y^2 - 2x}",
          annotation: 'Divide both sides by (3y\u00b2 - 6x), then simplify by dividing numerator and denominator by 3.',
        },
      ],
      conclusion: 'dy/dx = (2y - x\u00b2)/(y\u00b2 - 2x). This equals 0 when 2y = x\u00b2, giving horizontal tangents, and is undefined when y\u00b2 = 2x, giving vertical tangents. The folium is a beautiful curve with a double point at the origin.',
    },
    {
      id: 'ch2-005-ex3',
      title: 'Implicit Differentiation with Sine and Product',
      visualizations: [
        {
          id: 'TangentToImplicitCurve',
          title: 'Tangent to an Implicit Curve',
          caption: 'The curve sin(xy)=x is defined implicitly. The tangent slope dy/dx=(1−y·cos(xy))/(x·cos(xy)) involves both x and y — because you need both coordinates to know where you are on the curve.',
        },
      ],
      problem: "\\text{Find } dy/dx \\text{ for } \\sin(xy) = x.",
      steps: [
        {
          expression: "\\frac{d}{dx}[\\sin(xy)] = \\frac{d}{dx}[x]",
          annotation: 'Differentiate both sides with respect to x.',
        },
        {
          expression: "\\cos(xy) \\cdot \\frac{d}{dx}[xy] = 1",
          annotation: 'Left side: chain rule on sin(u) where u = xy gives cos(xy)\u00b7d/dx[xy]. Right side: d/dx[x] = 1.',
        },
        {
          expression: "\\frac{d}{dx}[xy] = y + x\\frac{dy}{dx}",
          annotation: 'Apply the product rule to xy: (x)\'y + x(y)\' = y + x(dy/dx).',
        },
        {
          expression: "\\cos(xy)\\left(y + x\\frac{dy}{dx}\\right) = 1",
          annotation: 'Substitute the product rule result.',
        },
        {
          expression: "y\\cos(xy) + x\\cos(xy)\\frac{dy}{dx} = 1",
          annotation: 'Distribute cos(xy) to both terms.',
        },
        {
          expression: "x\\cos(xy)\\frac{dy}{dx} = 1 - y\\cos(xy)",
          annotation: 'Move the y cos(xy) term to the right side.',
        },
        {
          expression: "\\frac{dy}{dx} = \\frac{1 - y\\cos(xy)}{x\\cos(xy)}",
          annotation: 'Divide both sides by x cos(xy) to isolate dy/dx.',
        },
      ],
      conclusion: 'dy/dx = (1 - y cos(xy)) / (x cos(xy)). This is valid wherever x cos(xy) \u2260 0.',
    },
    {
      id: 'ch2-005-ex4',
      title: 'Implicit Differentiation with Exponential',
      visualizations: [
        {
          id: 'TangentToImplicitCurve',
          title: 'Implicit Curve with Exponential',
          caption: 'The chain rule on eʸ gives eʸ·(dy/dx) because y is a function of x. The presence of eʸ in the denominator of dy/dx=−y/(eʸ+x) reflects how rapidly eʸ bends the curve.',
        },
      ],
      problem: "\\text{Find } dy/dx \\text{ for } e^y + xy = 3.",
      steps: [
        {
          expression: "\\frac{d}{dx}[e^y + xy] = \\frac{d}{dx}[3]",
          annotation: 'Differentiate both sides.',
        },
        {
          expression: "e^y\\frac{dy}{dx} + \\frac{d}{dx}[xy] = 0",
          annotation: 'd/dx[e^y]: chain rule gives e^y \u00b7 (dy/dx). d/dx[3] = 0.',
        },
        {
          expression: "e^y\\frac{dy}{dx} + y + x\\frac{dy}{dx} = 0",
          annotation: 'Apply the product rule to xy: y + x(dy/dx).',
        },
        {
          expression: "(e^y + x)\\frac{dy}{dx} = -y",
          annotation: 'Factor dy/dx from the first and third terms: (e^y + x)(dy/dx). Move y to the right.',
        },
        {
          expression: "\\frac{dy}{dx} = \\frac{-y}{e^y + x}",
          annotation: 'Divide both sides by (e^y + x).',
        },
      ],
      conclusion: 'dy/dx = -y/(e^y + x). This is valid wherever e^y + x \u2260 0.',
    },
    {
      id: 'ch2-005-ex5',
      title: 'Second Implicit Derivative',
      visualizations: [
        {
          id: 'ImplicitTangentPlayground',
          title: 'Concavity on the Circle',
          caption: 'The second derivative d²y/dx²=−r²/y³ is negative in the upper half (y>0, concave down) and positive in the lower half (y<0, concave up) — the circle always curves toward the center.',
        },
      ],
      problem: "\\text{Find } d^2y/dx^2 \\text{ for } x^2+y^2=r^2.",
      steps: [
        {
          expression: "\\frac{dy}{dx} = -\\frac{x}{y}",
          annotation: 'We already computed the first derivative in Example 1 (with r replacing 5): dy/dx = -x/y.',
        },
        {
          expression: "\\frac{d^2y}{dx^2} = \\frac{d}{dx}\\left[-\\frac{x}{y}\\right]",
          annotation: 'The second derivative is the derivative of the first derivative with respect to x.',
        },
        {
          expression: "= -\\frac{\\frac{d}{dx}[x]\\cdot y - x\\cdot\\frac{d}{dx}[y]}{y^2}",
          annotation: 'Apply the quotient rule to x/y: (numerator derivative \u00b7 denominator - numerator \u00b7 denominator derivative) / denominator\u00b2. (Then apply the negative sign.)',
        },
        {
          expression: "= -\\frac{1 \\cdot y - x \\cdot \\frac{dy}{dx}}{y^2}",
          annotation: 'd/dx[x] = 1 and d/dx[y] = dy/dx.',
        },
        {
          expression: "= -\\frac{y - x\\cdot\\left(-\\frac{x}{y}\\right)}{y^2}",
          annotation: 'Substitute dy/dx = -x/y (the first derivative we already know).',
        },
        {
          expression: "= -\\frac{y + \\frac{x^2}{y}}{y^2}",
          annotation: 'Simplify: -x \u00b7 (-x/y) = x\u00b2/y.',
        },
        {
          expression: "= -\\frac{\\frac{y^2 + x^2}{y}}{y^2} = -\\frac{y^2+x^2}{y^3}",
          annotation: 'Combine the numerator into a single fraction: y + x\u00b2/y = (y\u00b2+x\u00b2)/y. Divide by y\u00b2.',
        },
        {
          expression: "= -\\frac{r^2}{y^3}",
          annotation: 'Use x\u00b2 + y\u00b2 = r\u00b2 (the original equation) to replace x\u00b2+y\u00b2 with r\u00b2.',
        },
      ],
      conclusion: 'd\u00b2y/dx\u00b2 = -r\u00b2/y\u00b3. The negative sign indicates the circle is concave down in the upper half (y > 0) and concave up in the lower half (y < 0).',
    },
    {
      id: 'ch2-005-ex6',
      title: 'y = x^x via Implicit Differentiation',
      visualizations: [
        {
          id: 'ExpLogBridgeLab',
          title: 'ln Converts the Problem',
          caption: 'Taking ln of y=x^x gives ln(y)=x·ln(x). The implicit differentiation chain rule on ln(y) gives (1/y)·(dy/dx) — solving for dy/dx then just requires multiplying back by y=x^x.',
        },
      ],
      problem: "\\text{Use implicit differentiation (logarithmic differentiation) to find } dy/dx \\text{ for } y = x^x, \\text{ and verify it agrees with Example 7 in the previous lesson.}",
      steps: [
        {
          expression: "y = x^x",
          annotation: 'We take ln of both sides to make the exponent algebraically accessible.',
        },
        {
          expression: "\\ln y = x\\ln x",
          annotation: 'Apply ln: ln(x^x) = x\u00b7ln(x) by the logarithm power rule.',
        },
        {
          expression: "\\frac{d}{dx}[\\ln y] = \\frac{d}{dx}[x \\ln x]",
          annotation: 'Differentiate both sides with respect to x.',
        },
        {
          expression: "\\frac{1}{y}\\frac{dy}{dx} = \\frac{d}{dx}[x \\ln x]",
          annotation: 'Left side: chain rule on ln(y) gives (1/y)(dy/dx), because y is the inner function.',
        },
        {
          expression: "\\frac{d}{dx}[x\\ln x] = 1 \\cdot \\ln x + x \\cdot \\frac{1}{x} = \\ln x + 1",
          annotation: 'Product rule on the right side: (x)\u2019(ln x) + (x)(ln x)\u2019 = ln x + x\u00b7(1/x) = ln x + 1.',
        },
        {
          expression: "\\frac{1}{y}\\frac{dy}{dx} = \\ln x + 1",
          annotation: 'Equate.',
        },
        {
          expression: "\\frac{dy}{dx} = y(\\ln x + 1) = x^x(1 + \\ln x)",
          annotation: 'Multiply by y and substitute y = x^x.',
        },
      ],
      conclusion: 'dy/dx = x^x(1 + ln x), confirming the result from logarithmic differentiation in the previous lesson. This is implicit differentiation applied after taking ln of both sides — these two techniques are really the same method.',
    },
    {
      id: 'ch2-005-ex7',
      title: 'Tangent and Normal to an Implicit Curve',
      visualizations: [
        {
          id: 'TangentToImplicitCurve',
          title: 'Tangent and Normal Lines',
          caption: 'At (2,1) on x²y+y³=5: tangent slope is −4/7, normal slope is +7/4 (negative reciprocal). The normal line points directly toward the curve\'s center of curvature.',
        },
      ],
      problem: "\\text{Find the tangent and normal lines to } x^2 y + y^3 = 5 \\text{ at the point } (2, 1).",
      steps: [
        {
          expression: "\\text{Verify } (2,1) \\text{ is on the curve: } (2)^2(1) + (1)^3 = 4 + 1 = 5 \\checkmark",
          annotation: 'Always check that the given point satisfies the equation before proceeding.',
        },
        {
          expression: "\\frac{d}{dx}[x^2 y + y^3] = \\frac{d}{dx}[5]",
          annotation: 'Differentiate both sides with respect to x.',
        },
        {
          expression: "\\frac{d}{dx}[x^2 y] + \\frac{d}{dx}[y^3] = 0",
          annotation: 'Differentiate term by term on the left; right side gives 0.',
        },
        {
          expression: "\\left(2x \\cdot y + x^2 \\cdot \\frac{dy}{dx}\\right) + 3y^2\\frac{dy}{dx} = 0",
          annotation: 'Apply the product rule to x\u00b2y: (x\u00b2)\u2019y + x\u00b2(y)\u2019 = 2xy + x\u00b2(dy/dx). Apply the chain rule to y\u00b3: 3y\u00b2(dy/dx).',
        },
        {
          expression: "x^2\\frac{dy}{dx} + 3y^2\\frac{dy}{dx} = -2xy",
          annotation: 'Move the 2xy term to the right side.',
        },
        {
          expression: "(x^2 + 3y^2)\\frac{dy}{dx} = -2xy",
          annotation: 'Factor dy/dx from the left side.',
        },
        {
          expression: "\\frac{dy}{dx} = \\frac{-2xy}{x^2 + 3y^2}",
          annotation: 'Isolate dy/dx.',
        },
        {
          expression: "\\left.\\frac{dy}{dx}\\right|_{(2,1)} = \\frac{-2(2)(1)}{(2)^2 + 3(1)^2} = \\frac{-4}{4+3} = -\\frac{4}{7}",
          annotation: 'Substitute x = 2, y = 1 to find the slope at our point.',
        },
        {
          expression: "\\text{Tangent: } y - 1 = -\\frac{4}{7}(x-2) \\implies y = -\\frac{4}{7}x + \\frac{8}{7} + 1 = -\\frac{4}{7}x + \\frac{15}{7}",
          annotation: 'Tangent line in point-slope form, then slope-intercept.',
        },
        {
          expression: "\\text{Normal slope} = -\\frac{1}{-4/7} = \\frac{7}{4}",
          annotation: 'The normal line is perpendicular to the tangent, so its slope is the negative reciprocal of -4/7.',
        },
        {
          expression: "\\text{Normal: } y - 1 = \\frac{7}{4}(x-2) \\implies y = \\frac{7}{4}x - \\frac{14}{4} + 1 = \\frac{7}{4}x - \\frac{10}{4} = \\frac{7}{4}x - \\frac{5}{2}",
          annotation: 'Normal line in point-slope form, then slope-intercept.',
        },
      ],
      conclusion: 'Tangent line: y = -(4/7)x + 15/7. Normal line: y = (7/4)x - 5/2. The two lines are perpendicular at (2, 1), as required.',
    },
    {
      id: 'ch2-005-ex8',
      title: 'Implicit Related Rates on a Circle',
      visualizations: [
        {
          id: 'ImplicitTangentPlayground',
          title: 'Circle — Related Rates',
          caption: 'A point on x²+y²=25 moving with dx/dt=2: differentiating the constraint gives 2x(dx/dt)+2y(dy/dt)=0, so dy/dt=−(x/y)·(dx/dt). At (3,4) that is −(3/4)·2=−3/2.',
        },
      ],
      problem: 'A point moves on x^2+y^2=25 with dx/dt=2 at the instant (x,y)=(3,4). Find dy/dt.',
      steps: [
        {
          expression: "x^2+y^2=25",
          annotation: 'Differentiate the geometric constraint with respect to time t.',
        },
        {
          expression: "2x\\frac{dx}{dt}+2y\\frac{dy}{dt}=0",
          annotation: 'Chain rule on each squared term.',
        },
        {
          expression: "\\frac{dy}{dt}=-\\frac{x}{y}\\frac{dx}{dt}",
          annotation: 'Solve algebraically for dy/dt.',
        },
        {
          expression: "\\left.\\frac{dy}{dt}\\right|_{(3,4)}=-\\frac{3}{4}(2)=-\\frac{3}{2}",
          annotation: 'Substitute x=3, y=4, and dx/dt=2.',
        },
      ],
      conclusion: 'At that instant the y-coordinate is decreasing at 3/2 units per unit time.',
    },
  ],

  challenges: [
    {
      id: 'ch2-005-ch1',
      difficulty: 'easy',
      problem: '\\text{Find } dy/dx \\text{ for } 3x^2 + 2xy + y^2 = 7.',
      hint: 'Differentiate term by term. The middle term 2xy requires the product rule. Collect all dy/dx terms and solve.',
      walkthrough: [
        {
          expression: "\\frac{d}{dx}[3x^2 + 2xy + y^2] = \\frac{d}{dx}[7]",
          annotation: 'Differentiate both sides.',
        },
        {
          expression: "6x + 2\\frac{d}{dx}[xy] + 2y\\frac{dy}{dx} = 0",
          annotation: 'd/dx[3x\u00b2]=6x, d/dx[y\u00b2]=2y(dy/dx).',
        },
        {
          expression: "6x + 2\\left(y + x\\frac{dy}{dx}\\right) + 2y\\frac{dy}{dx} = 0",
          annotation: 'Product rule on xy: y + x(dy/dx).',
        },
        {
          expression: "6x + 2y + 2x\\frac{dy}{dx} + 2y\\frac{dy}{dx} = 0",
          annotation: 'Distribute the 2.',
        },
        {
          expression: "(2x + 2y)\\frac{dy}{dx} = -6x - 2y",
          annotation: 'Gather dy/dx terms on left, constant terms on right.',
        },
        {
          expression: "\\frac{dy}{dx} = \\frac{-6x-2y}{2x+2y} = \\frac{-(3x+y)}{x+y}",
          annotation: 'Factor and simplify.',
        },
      ],
      answer: "\\dfrac{dy}{dx} = -\\dfrac{3x+y}{x+y}",
    },
    {
      id: 'ch2-005-ch2',
      difficulty: 'medium',
      problem: '\\text{Find all points on } x^2 + xy + y^2 = 3 \\text{ where the tangent line is horizontal.}',
      hint: 'Find dy/dx implicitly, then set dy/dx = 0. Solve the system: dy/dx = 0 and x\u00b2 + xy + y\u00b2 = 3.',
      walkthrough: [
        {
          expression: "\\frac{d}{dx}[x^2+xy+y^2] = 0",
          annotation: 'Differentiate both sides (right side is constant).',
        },
        {
          expression: "2x + \\left(y + x\\frac{dy}{dx}\\right) + 2y\\frac{dy}{dx} = 0",
          annotation: 'd/dx[x\u00b2]=2x, product rule on xy gives y+x(dy/dx), d/dx[y\u00b2]=2y(dy/dx).',
        },
        {
          expression: "(x+2y)\\frac{dy}{dx} = -(2x+y)",
          annotation: 'Collect: (x+2y)(dy/dx) = -(2x+y).',
        },
        {
          expression: "\\frac{dy}{dx} = -\\frac{2x+y}{x+2y}",
          annotation: 'Solve for dy/dx.',
        },
        {
          expression: "\\frac{dy}{dx} = 0 \\implies 2x + y = 0 \\implies y = -2x",
          annotation: 'Horizontal tangent means numerator is zero: 2x+y = 0.',
        },
        {
          expression: "\\text{Substitute } y = -2x \\text{ into } x^2+xy+y^2=3:",
          annotation: 'Use the curve equation to find x.',
        },
        {
          expression: "x^2 + x(-2x) + (-2x)^2 = 3 \\implies x^2 - 2x^2 + 4x^2 = 3 \\implies 3x^2 = 3 \\implies x = \\pm 1",
          annotation: 'Substitute and simplify.',
        },
        {
          expression: "x=1: y=-2; \\quad x=-1: y=2",
          annotation: 'Find y from y = -2x.',
        },
      ],
      answer: '\\text{Horizontal tangents at } (1,-2) \\text{ and } (-1, 2).',
    },
    {
      id: 'ch2-005-ch3',
      difficulty: 'hard',
      problem: "\\text{For the astroid } x^{2/3} + y^{2/3} = 4, \\text{ find } dy/dx \\text{ and find the equation of the tangent line at the point } (2\\sqrt{2},\\, 2\\sqrt{2}).",
      hint: 'Differentiate implicitly. d/dx[x^(2/3)] = (2/3)x^(-1/3). Check that (2\u221a2, 2\u221a2) is on the curve by substituting.',
      walkthrough: [
        {
          expression: "\\text{Check point: } (2\\sqrt{2})^{2/3} + (2\\sqrt{2})^{2/3} = 2(2\\sqrt{2})^{2/3}",
          annotation: 'Verify the point is on the curve.',
        },
        {
          expression: "(2\\sqrt{2})^{2/3} = (2^{3/2})^{2/3} = 2^{(3/2)(2/3)} = 2^1 = 2",
          annotation: 'Simplify: 2\u221a2 = 2\u00b7\u221a2 = 2^(3/2), so (2^(3/2))^(2/3) = 2^1 = 2.',
        },
        {
          expression: "\\text{So: } 2 + 2 = 4 \\checkmark",
          annotation: 'The point is confirmed to be on the astroid.',
        },
        {
          expression: "\\frac{d}{dx}[x^{2/3} + y^{2/3}] = \\frac{d}{dx}[4]",
          annotation: 'Differentiate both sides.',
        },
        {
          expression: "\\frac{2}{3}x^{-1/3} + \\frac{2}{3}y^{-1/3}\\frac{dy}{dx} = 0",
          annotation: 'd/dx[x^(2/3)] = (2/3)x^(-1/3). For y^(2/3), chain rule: (2/3)y^(-1/3)\u00b7(dy/dx).',
        },
        {
          expression: "\\frac{2}{3}y^{-1/3}\\frac{dy}{dx} = -\\frac{2}{3}x^{-1/3}",
          annotation: 'Move the x term to the right.',
        },
        {
          expression: "\\frac{dy}{dx} = -\\frac{x^{-1/3}}{y^{-1/3}} = -\\frac{y^{1/3}}{x^{1/3}} = -\\left(\\frac{y}{x}\\right)^{1/3}",
          annotation: 'Divide both sides by (2/3)y^(-1/3). Dividing x^(-1/3) by y^(-1/3) = multiplying x^(-1/3) by y^(1/3) = y^(1/3)/x^(1/3).',
        },
        {
          expression: "\\left.\\frac{dy}{dx}\\right|_{(2\\sqrt{2}, 2\\sqrt{2})} = -\\left(\\frac{2\\sqrt{2}}{2\\sqrt{2}}\\right)^{1/3} = -(1)^{1/3} = -1",
          annotation: 'Substitute: both x and y equal 2\u221a2, so their ratio is 1, and the cube root of 1 is 1.',
        },
        {
          expression: "y - 2\\sqrt{2} = -1 \\cdot (x - 2\\sqrt{2})",
          annotation: 'Point-slope form with point (2\u221a2, 2\u221a2) and slope -1.',
        },
        {
          expression: "y = -x + 2\\sqrt{2} + 2\\sqrt{2} = -x + 4\\sqrt{2}",
          annotation: 'Simplify.',
        },
      ],
      answer: '\\dfrac{dy}{dx} = -\\!\\left(\\dfrac{y}{x}\\right)^{1/3}; \\quad \\text{Tangent at } (2\\sqrt{2},2\\sqrt{2})\\text{: } y = -x + 4\\sqrt{2}',
    },
  ],

  crossRefs: [
    { lessonSlug: 'chain-rule', label: 'The Chain Rule', context: 'Implicit differentiation is the chain rule applied to y(x). Every d/dx[f(y)] requires the chain rule.' },
    { lessonSlug: 'exp-log-derivatives', label: 'Logarithmic Differentiation', context: 'Logarithmic differentiation is a special case of implicit differentiation — taking ln of both sides and differentiating implicitly.' },
    { lessonSlug: 'related-rates', label: 'Related Rates', context: 'Related rates problems use implicit differentiation with respect to time t rather than x.' },
  ],


  // ─── Semantic Layer ───────────────────────────────────────────────────────
  semantics: {
    "core": [
        {
            "symbol": "d/dx[y]",
            "meaning": "dy/dx — the derivative of y with respect to x, generated by the chain rule since y depends on x"
        },
        {
            "symbol": "d/dx[y²]",
            "meaning": "2y·(dy/dx) — chain rule: outer derivative 2y, inner derivative dy/dx"
        },
        {
            "symbol": "implicit equation",
            "meaning": "an equation relating x and y that is not solved for y explicitly — y is implicit in x"
        }
    ],
    "rulesOfThumb": [
        "Differentiate both sides of the equation with respect to x.",
        "Every y term gets a dy/dx factor (chain rule). Every x term differentiates normally.",
        "Collect all dy/dx terms on one side, factor out dy/dx, then divide.",
        "The result dy/dx will usually contain both x and y — that is normal and correct."
    ]
},

  // ─── Spiral Learning ─────────────────────────────────────────────────────
  spiral: {
    "recoveryPoints": [
        {
            "lessonId": "ch2-chain-rule",
            "label": "Previous: Chain Rule",
            "note": "Implicit differentiation IS the chain rule applied to y as a function of x. When you write d/dx[y²] = 2y·dy/dx, that is just the chain rule with u=y(x). Without the chain rule, implicit differentiation is impossible."
        }
    ],
    "futureLinks": [
        {
            "lessonId": "ch3-related-rates",
            "label": "Ch. 3: Related Rates",
            "note": "Related rates is implicit differentiation with time t as the independent variable instead of x. The technique — differentiate both sides, collect rates — is identical. You just replace dy/dx with dy/dt."
        },
        {
            "lessonId": "ch2-inverse-derivatives",
            "label": "Derivatives of Inverse Functions",
            "note": "The derivative of arcsin, arctan, etc. are derived using implicit differentiation on the identity sin(arcsin x) = x."
        }
    ]
},

  // ─── Assessment ──────────────────────────────────────────────────────────
  assessment: {
    "questions": [
        {
            "id": "id-assess-1",
            "type": "input",
            "text": "For x² + y² = 25, find dy/dx.",
            "answer": "-x/y",
            "hint": "Differentiate: 2x + 2y(dy/dx) = 0. Solve: dy/dx = -x/y."
        },
        {
            "id": "id-assess-2",
            "type": "input",
            "text": "For sin(xy) = x, find dy/dx at the point (1, π/2).",
            "answer": "(1 - π/2·cos(π/2)) / cos(π/2)... simplify via product rule on xy",
            "hint": "Differentiate both sides: cos(xy)·(y + x·dy/dx) = 1. Solve for dy/dx."
        }
    ]
},

  // ─── Mental Model Compression ────────────────────────────────────────────
  mentalModel: [
    "d/dx[y] = dy/dx (chain rule)",
    "d/dx[y²] = 2y·dy/dx",
    "Algorithm: differentiate both sides → collect dy/dx → factor → divide",
    "Result typically contains both x and y — that is expected"
],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'completed-example-5',
    'completed-example-6',
    'completed-example-7',
    'completed-example-8',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],

  quiz: [
    {
      id: 'implicit-q1',
      type: 'choice',
      text: 'When differentiating $y^2$ implicitly with respect to $x$, the result is:',
      options: ['$2y$', '$2y \\cdot y$', '$2y \\cdot \\dfrac{dy}{dx}$', '$\\dfrac{2y}{dx}$'],
      answer: '$2y \\cdot \\dfrac{dy}{dx}$',
      hints: ['Chain rule: $y$ is a function of $x$, so $\\dfrac{d}{dx}[y^2] = 2y \\cdot \\dfrac{dy}{dx}$.'],
      reviewSection: 'Intuition tab — treating y as a function of x',
    },
    {
      id: 'implicit-q2',
      type: 'choice',
      text: 'For the circle $x^2 + y^2 = 25$, what is $\\dfrac{dy}{dx}$ after implicit differentiation?',
      options: [
        '$\\dfrac{x}{y}$',
        '$-\\dfrac{x}{y}$',
        '$-\\dfrac{y}{x}$',
        '$\\dfrac{2x}{2y}$',
      ],
      answer: '$-\\dfrac{x}{y}$',
      hints: ['Differentiate: $2x + 2y\\,dy/dx = 0$. Solve for $dy/dx$.'],
      reviewSection: 'Math tab — implicit differentiation of the circle',
    },
    {
      id: 'implicit-q3',
      type: 'input',
      text: 'For $x^3 + y^3 = 6xy$, find $\\dfrac{dy}{dx}$ in terms of $x$ and $y$. Enter just the numerator and denominator as a fraction: write it as $(2y - x^2) / (y^2 - 2x)$.',
      answer: '(2*y - x^2) / (y^2 - 2*x)',
      hints: ['Differentiate both sides: $3x^2 + 3y^2 dy/dx = 6y + 6x\\,dy/dx$. Collect $dy/dx$ terms and solve.'],
      reviewSection: 'Math tab — Folium of Descartes example',
    },
    {
      id: 'implicit-q4',
      type: 'input',
      text: 'Differentiate $y^3 = x$ implicitly to find $\\dfrac{dy}{dx}$. Write in terms of $y$.',
      answer: '1 / (3*y^2)',
      hints: ['$3y^2 dy/dx = 1$, so $dy/dx = 1/(3y^2)$.'],
      reviewSection: 'Math tab — implicit differentiation examples',
    },
    {
      id: 'implicit-q5',
      type: 'input',
      text: 'For $x^2 + xy + y^2 = 7$, find $\\dfrac{dy}{dx}$ in terms of $x$ and $y$.',
      answer: '(-2*x - y) / (x + 2*y)',
      hints: ['Differentiate: $2x + y + x\\,dy/dx + 2y\\,dy/dx = 0$. Factor out $dy/dx$ and solve.'],
      reviewSection: 'Math tab — implicit differentiation with product term',
    },
    {
      id: 'implicit-q6',
      type: 'input',
      text: 'Use implicit differentiation on $\\sin(y) = x$ to find $\\dfrac{dy}{dx}$. Write in terms of $y$.',
      answer: '1 / cos(y)',
      hints: ['$\\cos(y) \\cdot dy/dx = 1$. Solve for $dy/dx$.'],
      reviewSection: 'Math tab — implicit differentiation with trig',
    },
    {
      id: 'implicit-q7',
      type: 'input',
      text: 'For $e^y = x^2 + 1$, find $\\dfrac{dy}{dx}$ in terms of $x$ and $y$.',
      answer: '2*x / e^y',
      hints: ['Differentiate: $e^y \\cdot dy/dx = 2x$. Solve for $dy/dx$.'],
      reviewSection: 'Math tab — implicit differentiation with exponentials',
    },
    {
      id: 'implicit-q8',
      type: 'input',
      text: 'Find the slope of the tangent to $x^2 + y^2 = 25$ at the point $(3, 4)$.',
      answer: '-3/4',
      hints: ['From implicit differentiation: $dy/dx = -x/y$. Substitute $x=3$, $y=4$.'],
      reviewSection: 'Math tab — evaluating implicit derivative at a point',
    },
    {
      id: 'implicit-q9',
      type: 'choice',
      text: 'Why does $\\dfrac{dy}{dx}$ found by implicit differentiation typically contain both $x$ and $y$?',
      options: [
        'Because we made an error — it should only contain $x$',
        'Because $y$ is not actually a function of $x$',
        'Because the slope of the curve at a point depends on both coordinates, not just $x$',
        'Because of the chain rule producing extra terms',
      ],
      answer: 'Because the slope of the curve at a point depends on both coordinates, not just $x$',
      hints: ['A vertical ellipse at the same $x$-value can have two different slopes at two different $y$-values.'],
      reviewSection: 'Intuition tab — why dy/dx contains both x and y',
    },
    {
      id: 'implicit-q10',
      type: 'input',
      text: 'Differentiate $x \\ln(y) = x^2 - 1$ implicitly to find $\\dfrac{dy}{dx}$ in terms of $x$ and $y$.',
      answer: 'y*(2*x - ln(y))',
      hints: ['Left side: product rule gives $\\ln(y) + x \\cdot \\frac{1}{y} dy/dx$. Right side: $2x$. Solve for $dy/dx$.'],
      reviewSection: 'Math tab — implicit differentiation with ln and product rule',
    },
  ],
};

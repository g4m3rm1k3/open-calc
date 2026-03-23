// FILE: src/content/chapter-2/02-chain-rule.js
export default {
  id: 'ch2-002',
  slug: 'chain-rule',
  chapter: 2,
  order: 2,
  title: 'The Chain Rule — Differentiating Compositions',
  subtitle: 'How to differentiate a function inside another function — the most widely used rule in all of calculus',
  tags: ['chain rule', 'composite functions', 'composition', 'outside-inside', 'Leibniz form', 'triple composition'],
  aliases: 'section 3.6 chain rule derivation formal proof leibniz notation dy du times du dx chain and power product quotient composite three layers',

  hook: {
          annotation: 'Structural view: rewrite first so the power is visibly the outer skin. This makes the onion explicit before any derivative work.',
    realWorldContext: 'This is the fundamental challenge of all real-world calculus: quantities rarely depend directly on the variable we care about. Temperature depends on altitude, and altitude depends on time as an airplane climbs. A company\'s profit depends on price, and optimal price depends on consumer demand, which depends on the economy. Stress in a beam depends on deflection, which depends on load. In modern AI, a loss function depends on output, output depends on hidden layers, and hidden layers depend on millions of weights; computing each gradient is repeated chain rule (backpropagation). In every case, we have a chain of dependencies, and computing the overall rate of change requires the chain rule. It is not an exaggeration to say the chain rule is used more than any other single rule in applied calculus.',
    previewVisualizationId: 'LeibnizUnitTrackerLab',
  },

  intuition: {
    prose: [
      'Sequencing map: first derivatives are built from limits, then power/product/quotient rules are proved, and only then does the chain rule appear. The chain rule is layered on those earlier results.',
      'Let\'s build intuition for composition before worrying about differentiation. The expression f(g(x)) means: first apply g to x, get an intermediate result, then apply f to that intermediate result. For example, if g(x) = x\u00b2 + 1 and f(u) = \u221au, then f(g(x)) = \u221a(x\u00b2+1). The function g acts "on the inside" and f acts "on the outside." To evaluate at x = 3: first g(3) = 10, then f(10) = \u221a10. This two-step process is composition.',
      'Now think about rates. If u = g(x) changes by a certain rate as x changes, and y = f(u) changes at a certain rate as u changes, then what is the rate of change of y with respect to x? The answer is found by multiplying the rates: if u increases 3 times as fast as x, and y increases 4 times as fast as u, then y increases 12 times as fast as x. Rates along a chain multiply.',
      'The gear analogy makes this precise. Suppose gear A meshes with gear B, and gear B meshes with gear C. If gear A turns 3 times for every revolution of gear B (dA/dB = 3), and gear B turns 2 times for every revolution of gear C (dB/dC = 2), then gear A turns 6 times for every revolution of gear C: dA/dC = (dA/dB)\u00b7(dB/dC) = 3\u00b72 = 6. The rates multiply along the chain. This is the chain rule in its essence.',
      'In Leibniz notation, the chain rule is dy/dx = (dy/du)\u00b7(du/dx). If you squint, it looks like the du terms "cancel" — and while this is not literally true (dy/du and du/dx are limits, not fractions), it serves as a perfect mnemonic and is essentially justified by the fact that in the limit, these ratio quantities do behave multiplicatively.',
      'There is a beautifully practical way to execute the chain rule called the "outside-inside" method. To differentiate f(g(x)): (1) Differentiate the outside function f, evaluated at the inside g(x), leaving the inside completely unchanged. (2) Multiply by the derivative of the inside g\'(x). In symbols: d/dx[f(g(x))] = f\'(g(x)) \u00b7 g\'(x). The key is to NOT differentiate the inside first — leave it intact and only differentiate the outer wrapper.',
      'Let\'s see this with a concrete example: d/dx[(3x\u00b2-1)\u2075]. The outside function is u\u2075 (raise to the fifth), and the inside is u = 3x\u00b2-1. Differentiate the outside: the derivative of u\u2075 is 5u\u2074, evaluated at u = 3x\u00b2-1, giving 5(3x\u00b2-1)\u2074. Multiply by the derivative of the inside: d/dx[3x\u00b2-1] = 6x. Final answer: 5(3x\u00b2-1)\u2074 \u00b7 6x = 30x(3x\u00b2-1)\u2074. This two-step process — differentiate outer (keep inner), multiply by derivative of inner — is all there is to the chain rule.',
      'A note on identifying the outer and inner functions: look for the "last operation" that would be performed if you were evaluating the function at a specific number. For \u221a(x\u00b2+1), the last operation is taking a square root, so the outer function is u^(1/2) and the inner is x\u00b2+1. For sin(5x\u00b3), the last operation is taking the sine, so outer is sin(u) and inner is 5x\u00b3.',
      'Beginner survival skill: before differentiating, run a layer scan. For tan^3(4x), the outermost skin is (... )^3, the middle layer is tan(...), and the inner core is 4x. If you can label layers correctly, peeling becomes automatic.',
      'Pipeline view: composition is a relay race, not one giant jump. x flows through g to become u, then u flows through f to become y. If the first machine doubles speed and the second triples speed, output speed is six times faster. This is exactly dy/dx = (dy/du)(du/dx).',
      'The chain rule extends to triple and longer compositions. For y = f(g(h(x))), the derivative is f\'(g(h(x))) \u00b7 g\'(h(x)) \u00b7 h\'(x). Differentiate the outermost layer first, then the next, and so on, each time multiplying by the derivative of the layer below. This is like peeling an onion, one layer at a time.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Prerequisite Reminder',
        body: 'Product and quotient rules are proved in the previous lesson. This lesson builds on those results and shows how composition adds the extra inner-derivative factor.',
      },
      {
        type: 'insight',
        title: 'The Outside-Inside Method',
        body: "\\frac{d}{dx}[f(g(x))] = \\underbrace{f'(g(x))}_{\\text{differentiate outside, keep inside}} \\cdot \\underbrace{g'(x)}_{\\text{times derivative of inside}}",
      },
      {
        type: 'insight',
        title: 'Rates Multiply Along a Chain',
        body: "\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}",
      },
      {
        type: 'insight',
        title: 'Physics Hover: Unit Pipeline',
        body: "\\frac{\\text{cm}^3}{\\text{cm}}\\cdot\\frac{\\text{cm}}{\\text{s}}=\\frac{\\text{cm}^3}{\\text{s}}",
      },
      {
        type: 'example',
        title: 'Balloon Volume Example',
        body: 'V = \\tfrac{4}{3}\\pi r^3,\\; r = 2t \\implies \\frac{dV}{dt} = \\frac{dV}{dr}\\cdot\\frac{dr}{dt} = 4\\pi r^2 \\cdot 2 = 8\\pi r^2 = 8\\pi(2t)^2 = 32\\pi t^2',
      },
      {
        type: 'real-world',
        title: 'Backpropagation Is Chain Rule at Scale',
        body: '\\frac{\\partial L}{\\partial w_1} = \\frac{\\partial L}{\\partial a_2}\\cdot\\frac{\\partial a_2}{\\partial z_2}\\cdot\\frac{\\partial z_2}{\\partial a_1}\\cdot\\frac{\\partial a_1}{\\partial z_1}\\cdot\\frac{\\partial z_1}{\\partial w_1}\\;\\;\\text{(one weight in a deep net)}',
      },
      {
        type: 'warning',
        title: 'Identify the Outermost Operation First',
        body: '\\text{Before applying any rule, ask: "What is the LAST operation done?"} \\\\ f(x) = x^3\\sqrt{4x-1}: \\text{ last op is } \\times \\;\\Rightarrow\\; \\text{Product Rule is the outer rule.} \\\\ \\text{Chain Rule only fires inside } \\sqrt{4x-1}. \\text{ Skipping this check is the \\#1 exam error.}',
      },
      {
        type: 'strategy',
        title: 'Abstract Function Trap — Tables and Graphs',
        body: "h'(a) = f'\\!\\left(\\underbrace{g(a)}_{\\text{Step 1: look up}}\\right) \\cdot g'(a) \\\\ \\text{Step 1: find } g(a) \\text{ from the table or graph.} \\\\ \\text{Step 2: evaluate } f' \\text{ at } g(a) \\text{, NOT at } a. \\\\ \\text{Writing } f'(a)\\cdot g'(a) \\text{ is the classic exam mistake.}",
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "Calculus I - 5.3.2 The Derivative of The Inverse of a Function",
        props: { url: "https://www.youtube.com/embed/xZ6YgEZufLQ" }
      },
      {
        id: 'VideoEmbed',
        title: "Calculus I - 2.4.2 Differentiation Strategies and Practice",
        props: { url: "https://www.youtube.com/embed/IOOuXYCoQ4I" }
      },
      {
        id: 'VideoEmbed',
        title: "Calculus I - 2.4.1 The Chain Rule and General Power Rule",
        props: { url: "https://www.youtube.com/embed/Ptz1fa8lLyg" }
      },
      {
        id: 'VideoEmbed',
        title: "Essence of Calculus, Chapter 3: Visualizing the chain rule and product rule",
        props: { url: "https://www.youtube.com/embed/YG15m2VwSjA" }
      },
    {
        id: 'VideoEmbed',
        title: "Derivative of Natural Exponential Function e^x Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/-oLrRuZ9zgM" }
      },
    {
        id: 'VideoEmbed',
        title: "Derivative of Natural Exponential Function (5 Examples)",
        props: { url: "https://www.youtube.com/embed/0cwDYHep0AQ" }
      },
    {
        id: 'VideoEmbed',
        title: "Chain Rule with Trig Functions Harder Examples Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/gLYNlCarAmU" }
      },
    {
        id: 'VideoEmbed',
        title: "Chain Rule Harder Algebraic Examples Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/MvQkDW7aHV0" }
      },
    {
        id: 'VideoEmbed',
        title: "Chain Rule Part 2 Trig Derivatives 3 Examples  4K",
        props: { url: "https://www.youtube.com/embed/P4e-DWNxZMM" }
      },
    {
        id: 'VideoEmbed',
        title: "Derivative using Chain Rule 3 Algebraic Examples 4K",
        props: { url: "https://www.youtube.com/embed/WygqeCwjn_s" }
      },
    {
        id: 'VideoEmbed',
        title: "Derivatives with Sine and Cosine Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/SRj8DGWo_ik" }
      },
      {
        id: 'VideoEmbed',
        title: "Chain Rule: the Derivative of a Composition",
        props: { url: "https://www.youtube.com/embed/CPnrs2Yl-rY" }
      },
      {
        id: 'ChainRuleAssemblerGame',
        title: 'Chain Rule Assembler Game',
        mathBridge: 'The chain rule formula is $\\frac{d}{dx}[f(g(x))] = f\'(g(x))\\cdot g\'(x)$. "Assembling" means: identify the outer function $f$ and inner function $g$, differentiate $f$ (evaluated at $g(x)$, not at $x$), then multiply by $g\'(x)$. This game makes the two-part structure explicit — outer derivative times inner derivative — before you try to execute it on paper.',
        caption: 'Build derivatives by selecting outside and inside gears, then verify the full assembled result.',
      },
      {
        id: 'LayerScanGame',
        title: 'Layer Identification Mini-Game',
        mathBridge: 'Before computing a chain-rule derivative, you must correctly identify the composition structure. For $\\tan^3(4x)$: outermost layer is $(\\cdot)^3$, middle layer is $\\tan(\\cdot)$, innermost is $4x$. The derivative peels these in order: $3\\tan^2(4x)\\cdot\\sec^2(4x)\\cdot 4$. If you mislabel the layers, you get the wrong derivative. This game trains the pattern recognition that makes execution automatic.',
        caption: 'Label outer, middle, and inner layers correctly before computing — the prerequisite for any chain-rule problem.',
      },
      {
        id: 'ChainRulePipelineLab',
        title: 'Function Pipeline Relay',
        mathBridge: 'In Leibniz notation: $\\frac{dy}{dx} = \\frac{dy}{du}\\cdot\\frac{du}{dx}$. Think of it as a relay race: $x$ flows into the first machine (inner function $g$), producing $u = g(x)$ at rate $\\frac{du}{dx}$. Then $u$ flows into the second machine (outer function $f$), producing $y$ at rate $\\frac{dy}{du}$. The overall rate from $x$ to $y$ is the product of both stage rates. This is why "rates multiply along a chain."',
        caption: 'Watch stage speeds multiply in real time: inner rate times outer rate equals the total output rate.',
      },
      {
        id: 'ChainRulePeeler',
        title: 'Peel the Onion',
        mathBridge: 'For nested compositions like $f(g(h(x)))$, the extended chain rule gives $f\'(g(h(x)))\\cdot g\'(h(x))\\cdot h\'(x)$ — one derivative factor per layer. Each click peels one layer: differentiate the current outer function (keeping everything inside intact), then multiply by the derivative of the remaining inside. Stopping early or differentiating the inside prematurely are the two most common mistakes the peeler prevents.',
        caption: 'Differentiate from the outside in. Each peel produces one factor in the chain-rule product.',
      },
      {
        id: 'BlindChainRuleLab',
        title: 'Blindfolded Chain Rule — Table Version',
        mathBridge: "When $h(x) = f(g(x))$, the formula $h'(a) = f'(g(a))\\cdot g'(a)$ is a two-step table lookup: (1) find $g(a)$ — your intermediate value; (2) look up $f'$ evaluated at $g(a)$, not at $a$. The most common exam error is reading $f'(a)$ directly, skipping the inner function evaluation entirely. This lab strips away all algebra to train pure Chain Rule grammar.",
        caption: "Select the correct table cells to assemble h'(a). The grammar doesn't change when the functions have no formulas.",
      },
      {
        id: 'NestedTrigMachine',
        title: 'Trig Trap: sin(x²) vs sin²(x)',
        mathBridge: 'Two expressions that look similar but are completely different compositions: $\\sin(x^2)$ has outer $\\sin$ and inner $x^2$ — derivative is $\\cos(x^2)\\cdot 2x$. But $\\sin^2(x)$ has outer $u^2$ and inner $\\sin x$ — derivative is $2\\sin(x)\\cos(x)$. The position of the exponent changes which function is outer and which is inner. This is the most common Chain Rule mistake on trig exams.',
        caption: 'Toggle between sin(x²) and sin²(x) to see how the layer swap changes the derivative completely.',
      },
    ],
  },

  math: {
    prose: [
      'There are two equivalent forms of the chain rule. The Lagrange/function-composition form names the outer and inner functions explicitly and is cleaner for algebraic manipulation. The Leibniz form uses dy/du and du/dx and is more intuitive for applied problems involving rates.',
      'An approachable derivation idea: if \u0394u \approx g\'(x)\u0394x and \u0394y \approx f\'(u)\u0394u, then \u0394y \approx f\'(u)g\'(x)\u0394x. Dividing by \u0394x and taking the limiting view gives dy/dx = f\'(g(x))g\'(x).',
      'The chain rule combined with the power rule gives one of the most common differentiation formulas in all of calculus: d/dx[u\u207f] = nu\u207f\u207b\u00b9\u00b7u\', where u = g(x) is any differentiable function. This formula applies whenever you have "something to a power" — the power rule applies to the outer function, and the chain rule contributes the u\' factor.',
      'The extended chain rule for triple compositions states that for y = f(g(h(x))), the derivative is f\'(g(h(x))) \u00b7 g\'(h(x)) \u00b7 h\'(x). The pattern is clear: differentiate each layer from outside to inside, evaluate each outer derivative at everything inside it, and multiply all the factors together.',
      'Identifying the outer and inner functions correctly is a skill that develops with practice. The best approach is to always ask: "What is the last thing done to x if I evaluate this at a number?" That last operation is the outer function. Everything that comes before is the inner function.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Chain Rule (Composition Form)',
        body: "(f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)",
      },
      {
        type: 'theorem',
        title: 'Chain Rule (Leibniz Form)',
        body: '\\text{If } y = f(u) \\text{ and } u = g(x), \\text{ then } \\dfrac{dy}{dx} = \\dfrac{dy}{du} \\cdot \\dfrac{du}{dx}',
      },
      {
        type: 'theorem',
        title: 'Generalized Power Rule',
        body: "\\frac{d}{dx}[u^n] = n\\,u^{n-1}\\cdot u', \\quad u = g(x)",
      },
      {
        type: 'theorem',
        title: 'Triple Composition (Extended Chain Rule)',
        body: "\\frac{d}{dx}[f(g(h(x)))] = f'(g(h(x))) \\cdot g'(h(x)) \\cdot h'(x)",
      },
      {
        type: 'strategy',
        title: 'Combo Rule Decision Tree',
        body: '\\text{Identify the outermost operation before choosing a rule:} \\\\ \\text{1. Outermost is } {\\times} \\text{ or } {\\div} \\;\\Rightarrow\\; \\text{Product / Quotient Rule. Chain Rule fires inside.} \\\\ \\text{2. Outermost is composition } f(g(x)) \\;\\Rightarrow\\; \\text{Chain Rule.} \\\\ \\text{3. Outermost is } {+} \\text{ or } {-} \\;\\Rightarrow\\; \\text{Split and differentiate term-by-term.}',
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "Interpreting the Chain Rule Graphically",
        props: { url: "https://www.youtube.com/embed/o-6GzqChpJs" }
      },
      {
        id: 'InterlockingGearsViz',
        title: 'Interlocking Gears — Rates Multiply',
        mathBridge: 'Set gear ratios dA/dB and dB/dC with the sliders, then spin. Gear A\'s speed is exactly dA/dB × dB/dC times the base speed — the intermediate Gear B cancels out, just like du cancels in dy/dx = (dy/du)·(du/dx).',
        caption: 'The chain rule is not symbolic manipulation — it is rates multiplying through a mechanical chain.',
      },
      {
        id: 'ChainRuleMicroscope',
        title: 'Microscope Mode: The Visual Derivation',
        mathBridge: 'Every differentiable function looks linear when you zoom in far enough — its graph becomes indistinguishable from its tangent line. If the inner function $g$ has local slope $m_1$ and the outer function $f$ has local slope $m_2$, then feeding a line of slope $m_1$ into a line of slope $m_2$ gives a composed line of slope $m_1\\cdot m_2$. The chain rule $(f\\circ g)\'(x) = f\'(g(x))\\cdot g\'(x)$ is just this slope-multiplication fact, made rigorous via limits.',
        caption: 'Zoom in to see both curves linearize, then watch the composed slope = m₁ × m₂.',
      },
      {
        id: 'LeibnizUnitTrackerLab',
        title: 'Leibniz Unit Tracker',
        mathBridge: 'Leibniz notation $\\frac{dy}{dx} = \\frac{dy}{du}\\cdot\\frac{du}{dx}$ behaves like unit cancellation: $\\frac{\\text{cm}^3}{\\text{cm}}\\cdot\\frac{\\text{cm}}{\\text{s}} = \\frac{\\text{cm}^3}{\\text{s}}$. This is not a coincidence — the chain rule ensures that physical rates compose correctly. If volume $V$ depends on radius $r$ (in cm) and radius depends on time $t$ (in seconds), then $\\frac{dV}{dt}$ automatically has units cm³/s. Without the chain rule, unit consistency would fail.',
        caption: 'Verify that Leibniz notation forces units to cancel correctly along the dependency chain.',
      },
    ],
  },

  rigor: {
    prose: [
      'The most natural "proof" of the chain rule goes like this: form the difference quotient for (f\u2218g) at x, multiply top and bottom by g(x+h) - g(x), and "cancel" to get [f(g(x+h)) - f(g(x))] / [g(x+h)-g(x)] times [g(x+h)-g(x)] / h. As h \u2192 0, the first factor approaches f\'(g(x)) and the second approaches g\'(x), giving the product f\'(g(x))\u00b7g\'(x). This argument has a fatal flaw: we divided by g(x+h) - g(x), but this quantity might equal zero for infinitely many values of h near 0 (even if g\'(x) \u2260 0), making the division illegal.',
      'A simple example of this flaw: take g(x) = x\u00b2sin(1/x) for x \u2260 0 and g(0) = 0. Then g\'(0) = 0, but g(h) = 0 for h = 1/(n\u03c0) for any integer n \u2260 0, which are values of h arbitrarily close to 0 where g(h) - g(0) = 0. If we divide by g(x+h) - g(x) in the naive proof at x = 0, we are dividing by zero for these special values of h.',
      'The correct proof uses the following approach. Define an auxiliary function \u03a6(k) = [f(g(x)+k) - f(g(x))] / k for k \u2260 0, and \u03a6(0) = f\'(g(x)). Because f is differentiable at g(x), we have lim(k\u21920) \u03a6(k) = f\'(g(x)) = \u03a6(0), so \u03a6 is continuous at 0. Now write: f(g(x+h)) - f(g(x)) = \u03a6(g(x+h)-g(x)) \u00b7 [g(x+h)-g(x)]. This is valid because when g(x+h)-g(x) \u2260 0, it follows the definition of \u03a6 with k = g(x+h)-g(x), and when g(x+h)-g(x) = 0, both sides are 0. Dividing by h: [f(g(x+h))-f(g(x))]/h = \u03a6(g(x+h)-g(x)) \u00b7 [g(x+h)-g(x)]/h. As h\u21920: \u03a6(g(x+h)-g(x)) \u2192 \u03a6(0) = f\'(g(x)) (because g is continuous, g(x+h)-g(x)\u21920, and \u03a6 is continuous at 0); [g(x+h)-g(x)]/h \u2192 g\'(x). The product of the limits is f\'(g(x))\u00b7g\'(x). This completes the rigorous proof.',
      'Safety-slope bridge to microscope mode: zooming says the curve locally looks linear with a local slope. \u03a6(k) is the rigorous patch that keeps this local-slope story valid even when the inner change g(x+h)-g(x) is exactly zero, so no illegal division occurs.',
      'Use the annotated proof map as a translation layer: hover the algebra term \u03a6(g(x+h)-g(x)) and watch microscope mode light up. This is where symbol and geometry become the same idea.',
      'Expert trap: if one link is not differentiable at the evaluation point, chain rule cannot be applied there. Example y=|sin x| at x=0: inner sin x is smooth, but outer |u| has a corner at u=0, so the chain snaps at that point.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'The Naive Proof Has a Flaw',
        body: "\\text{Multiplying and dividing by } g(x+h)-g(x) \\text{ is invalid} \\\\ \\text{when } g(x+h) - g(x) = 0, \\text{ which can happen for } h \\neq 0.",
      },
      {
        type: 'proof',
        title: 'Correct Proof Sketch',
        body: "\\Phi(k) = \\begin{cases} \\dfrac{f(g(x)+k)-f(g(x))}{k} & k\\neq 0 \\\\ f'(g(x)) & k=0 \\end{cases} \\implies (f\\circ g)'(x) = \\lim_{h\\to 0} \\Phi(g(x+h)-g(x))\\cdot\\frac{g(x+h)-g(x)}{h} = f'(g(x))\\cdot g'(x)",
      },
      {
        type: 'insight',
        title: 'Annotated Proof Hover',
        body: "\\text{Hover } \\Phi(g(x+h)-g(x)) \\text{ in the proof map to see microscope mode highlight the safety patch idea.}",
      },
      {
        type: 'insight',
        title: 'Leibniz Form in Related Rates',
        body: "\\frac{dV}{dt} = \\frac{dV}{dr}\\cdot\\frac{dr}{dt}, \\quad \\frac{dA}{dt} = \\frac{dA}{d\\theta}\\cdot\\frac{d\\theta}{dt}. \\text{ Intermediate-rate factors multiply along dependency chains.}",
      },
      {
        type: 'warning',
        title: 'Broken Chain Condition',
        body: "\\text{Chain rule needs every link differentiable at the point. } y=|\\sin x| \\text{ fails at } x=0 \\text{ because } |u| \\text{ is not differentiable at } u=0.",
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "The Chain Rule using Leibniz notation",
        props: { url: "https://www.youtube.com/embed/NA-Ri4LJPaY" }
      },
      {
        id: 'ChainRuleProofMapLab',
        title: 'Annotated Proof Map',
        mathBridge: 'The naive proof divides by $g(x+h)-g(x)$, which can equal zero even for $h\\neq 0$ (e.g. $g(x)=x^2\\sin(1/x)$). The rigorous fix defines $\\Phi(k) = \\frac{f(g(x)+k)-f(g(x))}{k}$ for $k\\neq 0$ and $\\Phi(0)=f\'(g(x))$. This makes $\\Phi$ continuous at 0, so the proof works even when $g(x+h)-g(x)=0$. Each labeled term in the proof map corresponds to one of: the definition of $\\Phi$, continuity of $g$, or the limit product rule.',
        caption: 'Hover proof terms to sync algebra with microscope intuition — every symbol has a geometric meaning.',
      },
      {
        id: 'ChainRuleMicroscope',
        title: 'Microscope and Safety Slope',
        mathBridge: 'The $\\Phi(k)$ function is the "safety slope": when $k\\neq 0$ it equals the actual difference quotient of $f$; when $k=0$ it is defined to be $f\'(g(x))$. This continuity at 0 is the key — it means $\\Phi(g(x+h)-g(x))\\to f\'(g(x))$ as $h\\to 0$, regardless of whether $g(x+h)-g(x)$ hits zero along the way. The microscope shows the local linearization; $\\Phi$ is the algebraic guarantee that linearization is valid.',
      },
      {
        id: 'BrokenChainTrapLab',
        title: 'Non-Differentiable Trap',
        mathBridge: 'The chain rule requires every function in the chain to be differentiable at the relevant point. For $y = |\\sin x|$ at $x=0$: the inner function $\\sin x$ is differentiable there, but the outer function $|u|$ has a corner at $u=0$ — its left derivative is $-1$ and right derivative is $+1$. Since $\\sin(0)=0$ puts us exactly at that corner, the chain snaps. The one-sided slopes of $|\\sin x|$ at $x=0$ are $\\pm 1$, confirming no derivative exists.',
        caption: 'Test y = |sin x| near 0 — a single non-differentiable link breaks the entire chain.',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ch2-002-ex0',
      title: 'Why Chain Rule Works (Check by Expansion)',
      problem: 'Differentiate f(x) = (x^2+1)^3 two ways: (1) expand first, (2) use chain rule. Verify both match.',
      steps: [
        {
          expression: '(x^2+1)^3 = x^6 + 3x^4 + 3x^2 + 1',
          annotation: 'Method 1: expand using the binomial identity.',
        },
        {
          expression: 'f\'(x)=6x^5+12x^3+6x',
          annotation: 'Differentiate the expanded polynomial term by term.',
        },
        {
          expression: '\\text{Method 2: let } u=x^2+1,\\;f=u^3',
          annotation: 'Set up outer and inner layers for chain rule.',
        },
        {
          expression: 'f\'(x)=3u^2\\cdot u\'=3(x^2+1)^2\\cdot2x=6x(x^2+1)^2',
          annotation: 'Apply outer derivative times inner derivative.',
        },
        {
          expression: '6x(x^2+1)^2=6x(x^4+2x^2+1)=6x^5+12x^3+6x',
          annotation: 'Expand to confirm exact agreement with Method 1.',
        },
      ],
      conclusion: 'Both methods agree exactly. Chain rule is the compact form of algebra you would otherwise repeatedly expand.',
    },
    {
      id: 'ch2-002-ex1',
      title: 'Chain Rule with Power Function',
      problem: 'f(x) = (3x^2 - 1)^5. \\text{ Find } f\'(x).',
      steps: [
        {
          expression: "\\text{Outer function: } F(u) = u^5 \\quad \\text{Inner function: } u = g(x) = 3x^2 - 1",
          annotation: 'Identify the outer and inner functions. The outer function is "raise to the fifth power" and the inner is 3x\u00b2-1.',
        },
        {
          expression: "F'(u) = 5u^4, \\quad g'(x) = 6x",
          annotation: 'Differentiate the outer function (power rule: bring down 5, reduce exponent to 4) and differentiate the inner function separately.',
        },
        {
          expression: "f'(x) = F'(g(x)) \\cdot g'(x) = 5(3x^2-1)^4 \\cdot 6x",
          annotation: 'Apply the chain rule: differentiate the outer function (giving 5u\u2074) evaluated at the inner function (replacing u with 3x\u00b2-1), then multiply by the derivative of the inner function.',
        },
        {
          expression: "= 30x(3x^2-1)^4",
          annotation: 'Multiply the constants 5 and 6 together: 5\u00b76 = 30. The (3x\u00b2-1)\u2074 factor remains as is.',
        },
      ],
      conclusion: 'f\'(x) = 30x(3x\u00b2-1)\u2074. The chain rule contributed the factor of 6x (the derivative of the inner function), which is what distinguishes this from just differentiating u\u2075.',
    },
    {
      id: 'ch2-002-ex2',
      title: 'Chain Rule with Square Root',
      problem: 'f(x) = \\sqrt{x^2+1}. \\text{ Find } f\'(x).',
      steps: [
        {
          expression: "f(x) = (x^2+1)^{1/2}",
          annotation: 'Rewrite the square root as a power of 1/2 to clearly see the power function structure.',
        },
        {
          expression: "\\text{Outer: } F(u) = u^{1/2}, \\quad \\text{Inner: } u = x^2 + 1",
          annotation: 'Identify the outer function as the square root (or equivalently the 1/2 power) and the inner function as x\u00b2+1.',
        },
        {
          expression: "F'(u) = \\frac{1}{2}u^{-1/2} = \\frac{1}{2\\sqrt{u}}, \\quad g'(x) = 2x",
          annotation: 'Differentiate outer (power rule with n=1/2) and inner separately.',
        },
        {
          expression: "f'(x) = \\frac{1}{2}(x^2+1)^{-1/2} \\cdot 2x",
          annotation: 'Chain rule: F\'(g(x)) \u00b7 g\'(x). Replace u with x\u00b2+1 in the outer derivative, then multiply by 2x.',
        },
        {
          expression: "= \\frac{2x}{2(x^2+1)^{1/2}} = \\frac{x}{\\sqrt{x^2+1}}",
          annotation: 'Simplify: the factor of 2 in the numerator cancels with the 2 from the power rule denominator. Rewrite the negative power as a square root.',
        },
      ],
      conclusion: 'f\'(x) = x/\u221a(x\u00b2+1). Note that the derivative is 0 at x = 0 (horizontal tangent at the bottom of the U-shaped curve) and grows toward \u00b11 as x \u2192 \u00b1\u221e.',
    },
    {
      id: 'ch2-002-ex3',
      title: 'Chain Rule with Sine',
      problem: 'f(x) = \\sin(5x^3). \\text{ Find } f\'(x).',
      steps: [
        {
          expression: "\\text{Outer: } F(u) = \\sin(u), \\quad \\text{Inner: } u = 5x^3",
          annotation: 'The outer function is the sine function and the inner function is 5x\u00b3.',
        },
        {
          expression: "F'(u) = \\cos(u), \\quad g'(x) = 15x^2",
          annotation: 'The derivative of sine is cosine (covered in the trig derivatives lesson). The derivative of the inner function 5x\u00b3 is 15x\u00b2 by the power and constant multiple rules.',
        },
        {
          expression: "f'(x) = \\cos(5x^3) \\cdot 15x^2",
          annotation: 'Apply the chain rule: differentiate the outer function (giving cos(u)), evaluated at the inner (replacing u with 5x\u00b3), then multiply by the inner derivative 15x\u00b2.',
        },
        {
          expression: "= 15x^2 \\cos(5x^3)",
          annotation: 'Rewrite with the constant factor first for standard form.',
        },
      ],
      conclusion: 'f\'(x) = 15x\u00b2 cos(5x\u00b3). This illustrates the general pattern: d/dx[sin(g(x))] = cos(g(x))\u00b7g\'(x). The argument of cosine is the same as the argument of sine was.',
    },
    {
      id: 'ch2-002-ex4',
      title: 'Chain Rule with Exponential (Preview)',
      problem: "f(x) = e^{x^2}. \\text{ Find } f'(x). \\text{ (Use the fact that } \\frac{d}{du}[e^u] = e^u.)",
      steps: [
        {
          expression: "\\text{Outer: } F(u) = e^u, \\quad \\text{Inner: } u = x^2",
          annotation: 'The outer function is e to the power u, and the inner function is x\u00b2.',
        },
        {
          expression: "F'(u) = e^u, \\quad g'(x) = 2x",
          annotation: 'The key property of e^u is that it equals its own derivative (proved in the exponential derivatives lesson). The inner derivative is 2x.',
        },
        {
          expression: "f'(x) = e^{x^2} \\cdot 2x",
          annotation: 'Apply the chain rule: the outer derivative e^u evaluated at u = x\u00b2 gives e^(x\u00b2), times the inner derivative 2x.',
        },
        {
          expression: "= 2x\\,e^{x^2}",
          annotation: 'Rewrite with the constant factor first.',
        },
      ],
      conclusion: 'f\'(x) = 2xe^(x\u00b2). The function e^(x\u00b2) grows enormously fast but its derivative is not just itself — the chain rule contributes the factor of 2x from the exponent.',
    },
    {
      id: 'ch2-002-ex5',
      title: 'Chain Rule: Do Not Confuse (sin x)\u2074 with sin(x\u2074)',
      problem: 'f(x) = (\\sin x)^4. \\text{ Find } f\'(x). \\text{ Also note why this is different from } \\sin(x^4).',
      steps: [
        {
          expression: "\\text{Outer: } F(u) = u^4, \\quad \\text{Inner: } u = \\sin x",
          annotation: 'In (sin x)\u2074, the outer function is "raise to the fourth power" and the inner function is sin x. The entire sine is being raised to a power.',
        },
        {
          expression: "F'(u) = 4u^3, \\quad g'(x) = \\cos x",
          annotation: 'Differentiate outer: 4u\u00b3. Differentiate inner: d/dx[sin x] = cos x.',
        },
        {
          expression: "f'(x) = 4(\\sin x)^3 \\cdot \\cos x",
          annotation: 'Chain rule result. This is often written as 4 sin\u00b3(x) cos(x).',
        },
        {
          expression: "\\text{Compare: } \\frac{d}{dx}[\\sin(x^4)] = \\cos(x^4) \\cdot 4x^3",
          annotation: 'For sin(x\u2074), the outer function is sine and the inner is x\u2074. The derivative of sine is cosine evaluated at x\u2074, times the inner derivative 4x\u00b3. These are completely different functions.',
        },
      ],
      conclusion: 'f\'(x) = 4(sin x)\u00b3 cos x = 4 sin\u00b3(x) cos(x). The position of the exponent completely changes the meaning: (sin x)\u2074 means sin^4(x) [sine, then power], while sin(x\u2074) means the sine of x\u2074 [power, then sine].',
    },
    {
      id: 'ch2-002-ex6',
      title: 'Triple Composition',
      problem: 'f(x) = \\sin^4(x^2). \\text{ Find } f\'(x). \\text{ (This is } (\\sin(x^2))^4.)',
      steps: [
        {
          expression: "f(x) = [\\sin(x^2)]^4",
          strategyTitle: 'Scan the Layers',
          strategy: 'Before any derivative, identify outside -> middle -> inside. This prevents mixing sin(x^2) with (sin x)^2.',
          checkpoint: 'Which operation is performed last when evaluating this function?',
          annotation: 'Rewrite explicitly to show the structure: we are raising sin(x\u00b2) to the fourth power. This is a triple composition: the outermost is u\u2074, the middle is sin, the innermost is x\u00b2.',
        },
        {
          expression: "\\text{Layer 1 (outermost): } F(u) = u^4",
          strategyTitle: 'Peel Layer 1',
          strategy: 'Differentiate only the shell and keep the inside block frozen.',
          checkpoint: 'What exact expression is being protected unchanged here?',
          annotation: 'Peel layer 1: apply the power rule outside and keep sin(x²) completely untouched inside the brackets.',
        },
        {
          expression: "\\text{Layer 2 (middle): } G(v) = \\sin(v)",
          strategyTitle: 'Peel Layer 2',
          strategy: 'Now differentiate the trig wrapper while still preserving the innermost polynomial.',
          checkpoint: 'What still remains un-differentiated after this layer?',
          annotation: 'Peel layer 2: now derive sine, again keeping its inner argument x² exactly as-is.',
        },
        {
          expression: "\\text{Layer 3 (innermost): } H(x) = x^2",
          strategyTitle: 'Core Layer',
          strategy: 'Only after outer wrappers are handled do we differentiate the core x^2.',
          checkpoint: 'Why is this derivative intentionally delayed until now?',
          annotation: 'The innermost function is x\u00b2.',
        },
        {
          expression: "F'(u) = 4u^3, \\quad G'(v) = \\cos(v), \\quad H'(x) = 2x",
          annotation: 'Core layer: derive x² last to get 2x, then multiply by everything collected from outer and middle layers.',
        },
        {
          expression: "f'(x) = F'(G(H(x))) \\cdot G'(H(x)) \\cdot H'(x)",
          annotation: 'Apply the extended chain rule: outer derivative (evaluated all the way at the inside) times middle derivative (evaluated at innermost) times innermost derivative.',
        },
        {
          expression: "= 4[\\sin(x^2)]^3 \\cdot \\cos(x^2) \\cdot 2x",
          annotation: 'Substitute: F\'(G(H(x))) = 4[sin(x\u00b2)]\u00b3, G\'(H(x)) = cos(x\u00b2), H\'(x) = 2x.',
        },
        {
          expression: "= 8x\\sin^3(x^2)\\cos(x^2)",
          annotation: 'Collect constants: 4\u00b72x = 8x. Write in standard form.',
        },
      ],
      conclusion: 'f\'(x) = 8x sin\u00b3(x\u00b2) cos(x\u00b2). Triple compositions peel away one layer at a time, each contributing its own derivative as a multiplicative factor.',
    },
    {
      id: 'ch2-002-ex7',
      title: 'Leibniz Form of Chain Rule',
      problem: 'If y = u^5 \\text{ and } u = 3x^2 - 1, \\text{ find } dy/dx \\text{ using Leibniz form.}',
      steps: [
        {
          expression: "\\frac{dy}{du} = 5u^4",
          strategyTitle: 'Scan the Chain',
          strategy: 'Name the current variable first: y depends on u here, so take the derivative with respect to u before touching x.',
          checkpoint: 'Which variable are you differentiating with respect to in this line?',
          annotation: 'Differentiate y = u\u2075 with respect to u, treating u as the independent variable.',
        },
        {
          expression: "\\frac{du}{dx} = 6x",
          strategyTitle: 'Differentiate the Inner Link',
          strategy: 'Now move one layer inward and compute how u changes when x changes.',
          checkpoint: 'What role does this factor play in the final rate multiplication?',
          annotation: 'Differentiate u = 3x\u00b2 - 1 with respect to x.',
        },
        {
          expression: "\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx} = 5u^4 \\cdot 6x",
          strategyTitle: 'Multiply Local Rates',
          strategy: 'Connect the gears: output-per-u times u-per-x gives output-per-x.',
          checkpoint: 'What units or variables cancel conceptually in this product?',
          annotation: 'Multiply the two rates together per the chain rule in Leibniz form. The du "terms" appear to cancel like fractions, though this is a notational convenience, not literal cancellation.',
        },
        {
          expression: "= 30x \\cdot u^4 = 30x(3x^2-1)^4",
          strategyTitle: 'Return to Original Variable',
          strategy: 'Always finish in x unless the problem explicitly asks for u-form. Replace intermediate variables at the end.',
          checkpoint: 'Why must the final answer be expressed in x?',
          annotation: 'Substitute back u = 3x\u00b2-1 to express everything in terms of x. The final answer must be in terms of the original variable x.',
        },
      ],
      conclusion: 'This gives the same answer as the composition form: dy/dx = 30x(3x\u00b2-1)\u2074. The Leibniz form is particularly clear for related rates problems where the intermediate variable u has physical meaning.',
    },
    {
      id: 'ch2-002-ex8',
      title: 'Chain Rule Combined with Quotient Rule',
      problem: 'f(x) = \\dfrac{(x^2+1)^{3/2}}{x+1}. \\text{ Find } f\'(x).',
      steps: [
        {
          expression: "f(x) = \\frac{N(x)}{D(x)} \\text{ where } N(x) = (x^2+1)^{3/2}, \\; D(x) = x+1",
          annotation: 'Identify the numerator and denominator. The numerator requires the chain rule; the denominator is simple.',
        },
        {
          expression: "N'(x) = \\frac{3}{2}(x^2+1)^{1/2} \\cdot 2x = 3x(x^2+1)^{1/2} = \\frac{3x}{\\sqrt{x^2+1}} \\cdot (x^2+1)",
          annotation: 'Differentiate the numerator using the chain rule: outer is u^(3/2) giving (3/2)u^(1/2), inner is x\u00b2+1 giving 2x. Simplify: (3/2)\u00b72x = 3x.',
        },
        {
          expression: "N'(x) = 3x(x^2+1)^{1/2}",
          annotation: 'The derivative of the numerator is 3x\u221a(x\u00b2+1).',
        },
        {
          expression: "D'(x) = 1",
          annotation: 'The derivative of the denominator x+1 is simply 1.',
        },
        {
          expression: "f'(x) = \\frac{N'(x)D(x) - N(x)D'(x)}{[D(x)]^2}",
          annotation: 'Apply the quotient rule formula.',
        },
        {
          expression: "= \\frac{3x(x^2+1)^{1/2}(x+1) - (x^2+1)^{3/2}(1)}{(x+1)^2}",
          annotation: 'Substitute N, N\', D, D\' into the quotient rule.',
        },
        {
          expression: "= \\frac{(x^2+1)^{1/2}\\left[3x(x+1) - (x^2+1)\\right]}{(x+1)^2}",
          annotation: '{{algebra:factoring-fractional-powers|Factor out the lowest exponent (1/2)}} from both terms in the numerator.',
        },
        {
          expression: "= \\frac{(x^2+1)^{1/2}(3x^2 + 3x - x^2 - 1)}{(x+1)^2}",
          annotation: 'Expand inside the brackets: 3x(x+1) = 3x\u00b2+3x, then subtract x\u00b2+1.',
        },
        {
          expression: "= \\frac{\\sqrt{x^2+1}\\,(2x^2 + 3x - 1)}{(x+1)^2}",
          annotation: 'Combine like terms in the numerator: 3x\u00b2-x\u00b2=2x\u00b2. Rewrite (x\u00b2+1)^(1/2) as \u221a(x\u00b2+1).',
        },
      ],
      conclusion: 'f\'(x) = \u221a(x\u00b2+1) \u00b7 (2x\u00b2+3x-1) / (x+1)\u00b2. Factoring out the common (x\u00b2+1)^(1/2) factor from the quotient rule numerator is a key simplification technique.',
    },
    {
      id: 'ch2-002-ex9',
      title: 'Mini Backprop Chain (Single Neuron)',
      problem: 'Let y = \\sigma(z), z = wx+b, L = \\tfrac12(y-t)^2. Find dL/dw.',
      steps: [
        {
          expression: '\\frac{dL}{dy} = y-t',
          annotation: 'Differentiate the squared loss with respect to output y.',
        },
        {
          expression: '\\frac{dy}{dz} = \\sigma(z)(1-\\sigma(z)) = y(1-y)',
          annotation: 'Derivative of sigmoid activation.',
        },
        {
          expression: '\\frac{dz}{dw} = x',
          annotation: 'For z = wx+b, derivative with respect to w is x.',
        },
        {
          expression: '\\frac{dL}{dw} = \\frac{dL}{dy}\\cdot\\frac{dy}{dz}\\cdot\\frac{dz}{dw} = (y-t)\\,y(1-y)\\,x',
          annotation: 'Multiply local derivatives along the computation graph.',
        },
      ],
      conclusion: 'This local product is exactly the pattern repeated layer-by-layer in deep learning backpropagation.',
    },
    {
      id: 'ch2-002-ex10',
      title: 'Hook Problem: Balloon Volume Rate',
      problem: 'A sphere has radius r(t)=2t. With V=\\frac{4}{3}\\pi r^3, find dV/dt at t=3.',
      steps: [
        {
          expression: "V=\\frac{4}{3}\\pi r^3,\\quad r=2t",
          annotation: 'Volume depends on radius, and radius depends on time.',
        },
        {
          expression: "\\frac{dV}{dr}=4\\pi r^2,\\quad \\frac{dr}{dt}=2",
          annotation: 'Differentiate each stage with respect to its own variable.',
        },
        {
          expression: "\\frac{dV}{dt}=\\frac{dV}{dr}\\cdot\\frac{dr}{dt}=4\\pi r^2\\cdot 2=8\\pi r^2",
          annotation: 'Apply Leibniz chain form for related rates. Unit tracker: (cm^3/cm)*(cm/s)=cm^3/s, so multiplication is physically required.',
        },
        {
          expression: "t=3 \\Rightarrow r=2(3)=6",
          annotation: 'Evaluate the intermediate quantity first.',
        },
        {
          expression: "\\left.\\frac{dV}{dt}\\right|_{t=3}=8\\pi(6)^2=288\\pi",
          annotation: 'Substitute r=6 into the rate formula.',
        },
      ],
      conclusion: 'At t=3, volume is increasing at 288\\pi cubic units per time unit.',
    },
    {
      id: 'ch2-002-ex11',
      title: 'Abstract Function Trap — Reading a Table',
      problem: '\\begin{array}{l} \\text{Let } h(x) = f(g(x)). \\text{ The table gives values at selected points:} \\\\[6pt] \\begin{array}{c|cccc} x & f(x) & g(x) & f\'(x) & g\'(x) \\\\\\hline 1 & 4 & 3 & 2 & -1 \\\\ 2 & 1 & 1 & 5 & 3 \\\\ 3 & 7 & 2 & -2 & 4 \\end{array} \\\\[6pt] \\text{Find } h\'(2) \\text{ and } h\'(3). \\end{array}',
      steps: [
        {
          expression: "h'(x) = f'(g(x)) \\cdot g'(x)",
          annotation: 'Write the Chain Rule formula. This holds for any differentiable f and g — no explicit formula needed.',
        },
        {
          expression: "h'(2) = f'\\!\\left(\\underbrace{g(2)}_{?}\\right) \\cdot g'(2)",
          annotation: "To compute h'(2): we need f' evaluated at g(2), not at 2. Look up g(2) from the table first.",
          strategyTitle: 'Two-Step Table Lookup',
          strategy: 'Step 1: find the inner value g(a). Step 2: look up f\' at that result — never at a itself.',
          checkpoint: "Why is f'(g(2)) different from f'(2)? What table row do you look at for each?",
        },
        {
          expression: "g(2) = 1, \\quad g'(2) = 3 \\quad \\text{(row } x=2\\text{)}",
          annotation: "From the x=2 row: g(2)=1 and g'(2)=3.",
        },
        {
          expression: "h'(2) = f'(\\underbrace{1}_{g(2)}) \\cdot 3",
          annotation: "Substitute g(2)=1. We now need f'(1) — read from the x=1 row, not the x=2 row.",
        },
        {
          expression: "f'(1) = 2 \\implies h'(2) = 2 \\cdot 3 = 6",
          annotation: "From the x=1 row: f'(1)=2. Final answer: 2·3=6.",
        },
        {
          expression: "h'(3) = f'(g(3)) \\cdot g'(3) = f'(2) \\cdot 4 = 5 \\cdot 4 = 20",
          annotation: "For h'(3): g(3)=2 (row x=3), g'(3)=4 (row x=3). Then f'(g(3))=f'(2)=5 (row x=2). Result: 5·4=20.",
        },
      ],
      conclusion: "h'(2)=6 and h'(3)=20. The two-step rule: evaluate the inner function first, then look up the outer derivative at that value. On exams, reading f'(a) instead of f'(g(a)) is by far the most common Chain Rule error with tables.",
    },
    {
      id: 'ch2-002-ex12',
      title: 'Combo Rule Boss Fight — Product Rule + Chain Rule',
      problem: "f(x) = x^3\\sqrt{4x-1}. \\text{ Find } f'(x).",
      steps: [
        {
          expression: "f(x) = \\underbrace{x^3}_{A(x)} \\cdot \\underbrace{\\sqrt{4x-1}}_{B(x)}",
          strategyTitle: 'Find the Outermost Operation',
          strategy: 'Ask: what is the LAST operation when evaluating at a number? Multiply two results together — so Product Rule is the outer rule.',
          checkpoint: 'What would the very last step be if you plugged in x=5 and evaluated by hand?',
          annotation: "The outermost operation is multiplication of x³ and √(4x-1). Product Rule is the outer rule. Chain Rule will appear only when differentiating B(x).",
        },
        {
          expression: "A(x) = x^3 \\implies A'(x) = 3x^2",
          annotation: 'Differentiate A = x³ by the power rule.',
        },
        {
          expression: "B(x) = (4x-1)^{1/2} \\implies B'(x) = \\tfrac{1}{2}(4x-1)^{-1/2}\\cdot 4 = \\frac{2}{\\sqrt{4x-1}}",
          annotation: 'Differentiate B = (4x-1)^(1/2) by Chain Rule: outer gives (1/2)u^(-1/2), inner gives 4. Simplify: (1/2)·4 = 2.',
        },
        {
          expression: "f'(x) = A'B + AB' = 3x^2\\sqrt{4x-1} + x^3 \\cdot \\frac{2}{\\sqrt{4x-1}}",
          annotation: 'Apply Product Rule: d/dx[AB] = A\'B + AB\'.',
        },
        {
          expression: "= \\frac{3x^2(4x-1) + 2x^3}{\\sqrt{4x-1}}",
          annotation: 'Write over common denominator √(4x-1). Multiply the first term top and bottom by √(4x-1).',
        },
        {
          expression: "= \\frac{x^2(12x - 3 + 2x)}{\\sqrt{4x-1}} = \\frac{x^2(14x-3)}{\\sqrt{4x-1}}",
          annotation: 'Factor out x² from the numerator: 3x²(4x-1)+2x³ = 12x³-3x²+2x³ = 14x³-3x² = x²(14x-3).',
        },
      ],
      conclusion: "f'(x) = x²(14x-3)/√(4x-1). The outer rule was Product Rule; Chain Rule fired inside √(4x-1). The #1 mistake is reaching for Chain Rule first on a product — always identify the outermost operation before picking a rule.",
    },
  ],

  challenges: [
    {
      id: 'ch2-002-ch1',
      difficulty: 'easy',
      problem: '\\text{Differentiate } f(x) = (2x+1)^{10}.',
      hint: 'Treat (2x+1)^10 as a composition: outer function u^10, inner function 2x+1, and inner derivative 2.',
      walkthrough: [
        {
          expression: "\\text{Outer: } F(u) = u^{10},\\quad \\text{Inner: } u = 2x+1",
          annotation: 'Identify the composition structure.',
        },
        {
          expression: "F'(u) = 10u^9, \\quad u' = 2",
          annotation: 'Differentiate each piece.',
        },
        {
          expression: "f'(x) = 10(2x+1)^9 \\cdot 2 = 20(2x+1)^9",
          annotation: 'Apply the chain rule and simplify.',
        },
      ],
      answer: "f'(x) = 20(2x+1)^9",
    },
    {
      id: 'ch2-002-ch2',
      difficulty: 'medium',
      problem: '\\text{Differentiate } f(x) = \\sqrt{\\dfrac{x^2+1}{x-1}}.',
      hint: 'Write as ((x\u00b2+1)/(x-1))^(1/2). The outer function is u^(1/2) and the inner function is the quotient (x\u00b2+1)/(x-1), which requires the quotient rule to differentiate.',
      walkthrough: [
        {
          expression: "f(x) = \\left(\\frac{x^2+1}{x-1}\\right)^{1/2}",
          annotation: 'Rewrite the square root as a power.',
        },
        {
          expression: "\\text{Let } u = \\frac{x^2+1}{x-1}, \\text{ so } f = u^{1/2}",
          annotation: 'Define the inner function as the quotient.',
        },
        {
          expression: "\\frac{df}{du} = \\frac{1}{2}u^{-1/2} = \\frac{1}{2\\sqrt{u}}",
          annotation: 'Differentiate the outer square root.',
        },
        {
          expression: "\\frac{du}{dx} = \\frac{2x(x-1) - (x^2+1)(1)}{(x-1)^2} = \\frac{2x^2-2x-x^2-1}{(x-1)^2} = \\frac{x^2-2x-1}{(x-1)^2}",
          annotation: 'Apply the quotient rule to u = (x\u00b2+1)/(x-1).',
        },
        {
          expression: "f'(x) = \\frac{1}{2} \\cdot \\left(\\frac{x^2+1}{x-1}\\right)^{-1/2} \\cdot \\frac{x^2-2x-1}{(x-1)^2}",
          annotation: 'Combine via chain rule.',
        },
        {
          expression: "= \\frac{x^2-2x-1}{2(x-1)^2} \\cdot \\sqrt{\\frac{x-1}{x^2+1}} = \\frac{x^2-2x-1}{2(x-1)^{3/2}\\sqrt{x^2+1}}",
          annotation: 'Simplify u^(-1/2) = \u221a((x-1)/(x\u00b2+1)) and combine with the denominator.',
        },
      ],
      answer: "f'(x) = \\dfrac{x^2-2x-1}{2(x-1)^{3/2}\\sqrt{x^2+1}}",
    },
    {
      id: 'ch2-002-ch3',
      difficulty: 'hard',
      problem: "\\text{If } f \\text{ is differentiable and } g(x) = [f(x^2+1)]^2, \\text{ find } g'(x) \\text{ in terms of } f \\text{ and } f'.",
      hint: 'This is a triple composition: the outermost is squaring, the middle is f, the innermost is x\u00b2+1. Apply the extended chain rule.',
      walkthrough: [
        {
          expression: "g(x) = [f(x^2+1)]^2",
          annotation: 'Recognize this as a composition of three layers: outermost is u\u00b2, middle is f, innermost is x\u00b2+1.',
        },
        {
          expression: "\\text{Outer: } H(u) = u^2, \\quad \\text{Middle: } f(v) \\text{ (given)}, \\quad \\text{Inner: } v = x^2+1",
          annotation: 'Name each layer.',
        },
        {
          expression: "H'(u) = 2u, \\quad f'(v) \\text{ (given)}, \\quad v' = 2x",
          annotation: 'Differentiate each layer.',
        },
        {
          expression: "g'(x) = H'(f(x^2+1)) \\cdot f'(x^2+1) \\cdot (x^2+1)'",
          annotation: 'Apply the extended chain rule: outer derivative evaluated at middle-of-inner, times middle derivative evaluated at inner, times inner derivative.',
        },
        {
          expression: "= 2[f(x^2+1)] \\cdot f'(x^2+1) \\cdot 2x",
          annotation: 'Substitute: H\'(f(x\u00b2+1)) = 2f(x\u00b2+1), the middle derivative at x\u00b2+1 is f\'(x\u00b2+1), inner derivative is 2x.',
        },
        {
          expression: "= 4x\\,f(x^2+1)\\,f'(x^2+1)",
          annotation: 'Collect constants: 2\u00b72x = 4x.',
        },
      ],
      answer: "g'(x) = 4x\\,f(x^2+1)\\,f'(x^2+1)",
    },
    {
      id: 'ch2-002-ch4',
      difficulty: 'medium',
      problem: "\\text{Given: } g(4)=2,\\; g'(4)=-3,\\; f(2)=7,\\; f'(2)=5. \\text{ Let } h(x)=f(g(x)). \\text{ Find } h'(4).",
      hint: "Apply h'(a) = f'(g(a))·g'(a). Read g(4) first, then look up f' at that value — not at 4.",
      walkthrough: [
        {
          expression: "h'(4) = f'(g(4)) \\cdot g'(4)",
          annotation: 'Write the Chain Rule formula for h = f∘g.',
        },
        {
          expression: "g(4) = 2, \\quad g'(4) = -3",
          annotation: 'Read the given values: the inner function value is 2 and its rate of change is −3.',
        },
        {
          expression: "f'(g(4)) = f'(2) = 5",
          annotation: "Evaluate f' at g(4)=2, not at 4. The given data says f'(2)=5.",
        },
        {
          expression: "h'(4) = 5 \\cdot (-3) = -15",
          annotation: "Multiply the two factors: f'(g(4))·g'(4) = 5·(−3) = −15.",
        },
      ],
      answer: "h'(4) = -15",
    },
    {
      id: 'ch2-002-ch5',
      difficulty: 'hard',
      problem: "\\text{Differentiate } f(x) = \\sin^2(x) \\cdot e^{3x}.",
      hint: 'Outermost operation is multiplication (two factors) — Product Rule is outer. Each factor requires its own Chain Rule: d/dx[sin²x] and d/dx[e^(3x)].',
      walkthrough: [
        {
          expression: "f(x) = \\underbrace{\\sin^2(x)}_{A} \\cdot \\underbrace{e^{3x}}_{B}",
          annotation: 'Outermost operation is multiplication — Product Rule governs the structure.',
        },
        {
          expression: "A'(x) = 2\\sin(x)\\cos(x)",
          annotation: 'Differentiate A = (sin x)² by Chain Rule: outer is u², inner is sin x. Result: 2sin(x)·cos(x).',
        },
        {
          expression: "B'(x) = 3e^{3x}",
          annotation: 'Differentiate B = e^(3x) by Chain Rule: outer is e^u, inner is 3x. Result: e^(3x)·3.',
        },
        {
          expression: "f'(x) = 2\\sin(x)\\cos(x)\\cdot e^{3x} + \\sin^2(x)\\cdot 3e^{3x}",
          annotation: "Apply Product Rule: A'B + AB'.",
        },
        {
          expression: "= e^{3x}\\sin(x)\\bigl[2\\cos(x) + 3\\sin(x)\\bigr]",
          annotation: 'Factor out e^(3x) and sin(x) from both terms to reach the fully simplified form.',
        },
      ],
      answer: "f'(x) = e^{3x}\\sin(x)\\bigl[2\\cos(x) + 3\\sin(x)\\bigr]",
    },
  ],

  crossRefs: [
    { lessonSlug: 'differentiation-rules', label: 'Power, Product, Quotient Rules', context: 'The chain rule is combined with these rules constantly. The generalized power rule is chain rule plus power rule. The Combo Rule Boss Fight (Example 12) shows how to identify which outer rule applies.' },
    { lessonSlug: 'trig-derivatives', label: 'Trig Derivatives — sin(x²) vs sin²(x)', context: 'The most common Chain Rule mistake in trig: sin²(x) has outer u² and inner sin x, while sin(x²) has outer sin and inner x². The NestedTrigMachine visualization on the Trig Derivatives page shows this side-by-side.' },
    { lessonSlug: 'implicit-differentiation', label: 'Implicit Differentiation', context: 'Implicit differentiation is the chain rule applied to expressions in y where y = y(x).' },
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
    'completed-example-9',
    'completed-example-10',
    'completed-example-11',
    'completed-example-12',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
    'attempted-challenge-table',
    'attempted-challenge-combo',
  ],
};

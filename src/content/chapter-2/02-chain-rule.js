// FILE: src/content/chapter-2/02-chain-rule.js
export default {
  id: 'ch2-002',
  slug: 'chain-rule',
  chapter: 2,
  order: 3,
  title: 'The Chain Rule — Differentiating Compositions',
  subtitle: 'How to differentiate a function inside another function — the most widely used rule in all of calculus',
  tags: ['chain rule', 'composite functions', 'composition', 'outside-inside', 'Leibniz form', 'triple composition'],
  aliases: 'section 3.6 chain rule derivation formal proof leibniz notation dy du times du dx chain and power product quotient composite three layers',

  hook: {
    question: 'Here is a real puzzle: the volume of a balloon depends on its radius, and the radius depends on time as you inflate it. If you know how fast you are pumping air (dV/dt) and how volume relates to radius (V = (4/3)\u03c0r\u00b3), can you figure out how fast the radius is growing at any instant? This is a chain of dependencies — and the chain rule is precisely the tool that breaks it open.',
    realWorldContext: 'This is the fundamental challenge of all real-world calculus: quantities rarely depend directly on the variable we care about. Temperature depends on altitude, and altitude depends on time as an airplane climbs. A company\'s profit depends on price, and optimal price depends on consumer demand, which depends on the economy. In modern AI, a loss function depends on output, output depends on hidden layers, and hidden layers depend on millions of weights; computing each gradient is repeated chain rule (backpropagation). In every case, we have a chain of dependencies, and computing the overall rate of change requires the chain rule. It is not an exaggeration to say the chain rule is used more than any other single rule in applied calculus.',
    previewVisualizationId: 'ChainRulePipelineLab',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You have all the basic differentiation rules — power, product, and quotient. Those rules handle functions that are *combined* (added, multiplied, divided). But what about functions that are *nested* — one function applied inside another? sin(x²) is not a product; it is sine *applied to* x². The rules from the last lesson cannot reach inside that parenthesis. This lesson closes that gap.',

      '**Why this matters:** The chain rule is the single most-used rule in all of applied calculus. It appears every time you differentiate any non-trivial function. In machine learning, every gradient computed through a deep neural network is chain rule applied millions of times (backpropagation). In physics, any coordinate transform or changing variable requires it. In the rest of this chapter alone, you will use it in every single subsequent lesson.',

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

      '**Where this is heading:** The chain rule is now yours. But knowing a rule and applying it without error are two different things. The very next lesson deliberately shows you the most common mistake students make the first week after learning the chain rule — forgetting to fully differentiate the inner piece inside a product rule. Seeing the mistake made explicitly (and numerically confirmed wrong) is the fastest way to make sure you never make it.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 4 of 10 — Act 2: The Chain Rule',
        body: '**Previous:** Power, product, and quotient rules — shortcuts for combining functions.\n**This lesson:** The chain rule — how to differentiate any composition f(g(x)).\n**Next:** The most common chain rule mistake (product + chain trap) — we drill it immediately so bad habits never form.',
      },
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
        id: 'ChainRulePipelineLab',
        title: 'Function Pipeline Relay',
        mathBridge: 'Before pressing play, identify the two boxes on screen: the left box is the inner function $g$ (it turns $x$ into $u$), and the right box is the outer function $f$ (it turns $u$ into $y$). Each box displays its own local rate — $du/dx$ for the inner machine and $dy/du$ for the outer. Step 1: Set both rates to 1 and verify the output rate is also 1. Step 2: Set the inner rate to 3 and outer rate to 2 — watch the output rate snap to 6. This is $dy/dx = (dy/du)(du/dx) = 2 \\cdot 3 = 6$. Step 3: Change the inner function to something nonlinear. Notice the local rate now depends on the current value of $x$ — that is because $g\'(x)$ is not constant. The chain rule must be evaluated at the current $x$, not at a fixed rate. The key lesson: the chain rule is rate multiplication along a dependency chain, not just symbol manipulation.',
        caption: 'Set inner and outer rates separately. Verify the output rate is always their product. Then switch to a nonlinear inner function and watch the output rate change with x — that is the chain rule evaluated at a point.',
      },
      {
        id: 'InterlockingGearsViz',
        title: 'Interlocking Gears — Rates Multiply',
        mathBridge: 'Here is the specific experiment to run. Set Gear A-to-B ratio to 3 (Gear A turns 3 times per revolution of B). Set Gear B-to-C ratio to 4 (Gear B turns 4 times per revolution of C). Ask: how many times does Gear A turn per revolution of Gear C? Your intuition says 12 — and the display confirms it. This is $3 \\times 4 = 12$, or in calculus notation, $dA/dC = (dA/dB)(dB/dC)$. Now notice that Gear B appears in BOTH ratios as the intermediate: it is both a "fast" gear relative to C and a "slow" gear relative to A. When you write the product $(dA/dB)(dB/dC)$, the $dB$ terms cancel just like they would if these were fractions. That cancellation is exactly the structure of the Leibniz form of the chain rule: $dy/dx = (dy/du)(du/dx)$. The intermediate variable $u$ cancels out.',
        caption: 'Set A-to-B and B-to-C gear ratios. Compute A-to-C by multiplying — verify the display agrees. Notice that B is the intermediate that cancels, just like du in dy/dx = (dy/du)(du/dx).',
      },
      {
        id: 'ChainRuleOnionLab',
        title: 'Composition is an Onion: Layers to Peel',
        mathBridge: 'For each function shown, practice the layer-scan before touching any derivative. Ask yourself: "If I evaluated this at $x = 2$, what would I do LAST?" That last step is the outermost layer. For $\\sin(x^2 + 1)$: the last step is taking the sine, so outer = $\\sin(\\cdot)$, inner = $x^2 + 1$. For $(3x-1)^5$: the last step is raising to the fifth power, so outer = $(\\cdot)^5$, inner = $3x - 1$. For $\\sqrt{\\cos x}$: the last step is square root, so outer = $\\sqrt{\\cdot}$, inner = $\\cos x$. Now click on each layer in the visualizer to label it. The chain rule fires once per layer boundary. When you have correctly labeled outer and inner, the derivative assembles itself: differentiate the outer (keeping inner intact), multiply by the derivative of the inner.',
        caption: 'Click to label each layer before the derivative appears. Getting the layer structure right is 80 percent of the chain rule — the actual differentiation is mechanical once you know the structure.',
      },

      {
        id: 'ChainRuleAssemblerGame',
        title: 'Chain Rule Assembler Game',
        mathBridge: 'This game has two steps that you must not blur together. Step 1: Identify $f$ (outer) and $g$ (inner) and drag them into the correct slots. Step 2: Assemble the derivative. The derivative of $f(g(x))$ has two factors: the first factor is $f\'$ evaluated at $g(x)$ — NOT at $x$ itself. This is the most common mistake: students write $f\'(x) \\cdot g\'(x)$ instead of $f\'(g(x)) \\cdot g\'(x)$. The game will mark you wrong if you evaluate the outer derivative at $x$ instead of at $g(x)$. For example, for $h(x) = (x^2+1)^5$: $f(u) = u^5$, so $f\'(u) = 5u^4$, and you evaluate it at $u = g(x) = x^2 + 1$, giving $5(x^2+1)^4$. THEN multiply by $g\'(x) = 2x$. Final: $10x(x^2+1)^4$.',
        caption: 'Drag outer and inner functions to their slots, then assemble the derivative in the correct order. Watch for the evaluation point: f\' must be evaluated at g(x), not at x.',
      },
      {
        id: 'LayerScanGame',
        title: 'Layer Identification Mini-Game',
        mathBridge: 'The fastest way to master layer scanning is the "last operation" rule: work backward from evaluation order. For $\\tan^3(4x)$, evaluate mentally at $x = 1$: first compute $4(1) = 4$ (innermost layer: multiply by 4), then compute $\\tan(4)$ (middle layer: apply tangent), then cube the result (outermost layer: raise to power 3). So the layers from outside in are: $(\\cdot)^3$, $\\tan(\\cdot)$, $4x$. When you differentiate, you peel from outside in: $3[\\tan(4x)]^2 \\cdot \\sec^2(4x) \\cdot 4$. Each factor comes from one layer. In this game, practice labeling at least 10 functions before moving on — once layer scanning is automatic, the chain rule mechanics become trivial.',
        caption: 'For each function, identify all layers from outside in using the "last operation" rule. You must correctly label before the derivative is revealed. Aim for 10 in a row without mistakes.',
      },
      {
        id: 'NestedTrigMachine',
        title: 'Trig Trap: sin(x\u00b2) vs sin\u00b2(x)',
        mathBridge: 'Work out both derivatives by hand BEFORE toggling, then use the visualizer to check. For $\\sin(x^2)$: outer = $\\sin(\\cdot)$, inner = $x^2$. Derivative: $\\cos(x^2) \\cdot 2x$. For $\\sin^2(x)$: outer = $(\\cdot)^2$, inner = $\\sin(x)$. Derivative: $2\\sin(x) \\cdot \\cos(x)$ (which equals $\\sin(2x)$ by a trig identity). These are completely different functions with completely different derivatives. Now toggle in the visualizer and verify the graphs match what you computed. The important takeaway: reading the layer structure correctly is not optional — misreading $\\sin^2(x)$ as $\\sin(x^2)$ will give you a completely wrong derivative with no error message. Only careful attention to parentheses and exponent placement prevents this mistake.',
        caption: 'Compute both derivatives by hand first, then toggle to verify. The two functions look similar but have opposite layer structures — one has sine as outer, the other as inner.',
      },
      {
        id: 'ChainRulePracticeViz',
        title: 'Chain Rule Category Drill (Standard)',
        mathBridge: 'Apply the "Outside-Inside" method to 10 distinct composition forms, from trig-of-polynomial to log-of-linear. For each problem: (1) identify the outer and inner functions, (2) differentiate the outer at the inner, (3) multiply by the inner derivative. The drill reveals each step and confirms numerically.',
        caption: 'Master the 10 most common composition forms found in calculus exams.',
      },
      {
        id: 'ChainRulePracticeViz2',
        title: 'Chain Rule Category Drill (Interactive)',
        mathBridge: 'This version of the Drill features a different UI with color-coded containers and interactive step reveals.',
        caption: 'An alternative view of the 10 most common composition forms.',
      },
      {
        id: 'ChainRulePeeler',
        title: 'Peel the Onion \u2014 Layer-by-Layer Differentiation',
        mathBridge: 'For nested compositions like $f(g(h(x)))$, the extended chain rule gives $f\'(g(h(x)))\\cdot g\'(h(x))\\cdot h\'(x)$ \u2014 one derivative factor per layer, peeled outside-in. Each click removes one layer: differentiate the current outermost function (keeping everything inside intact), then multiply by the derivative of the remaining inside. Stopping early or differentiating the inside prematurely are the two most common mistakes this tool trains you to avoid.',
        caption: 'Differentiate from the outside in. Each peel produces exactly one factor in the chain-rule product.',
      },
      {
        id: 'BlindChainRuleLab',
        title: 'Blindfolded Chain Rule \u2014 Table Version',
        mathBridge: "When $h(x) = f(g(x))$, computing $h'(a) = f'(g(a))\\cdot g'(a)$ is a two-step table lookup: (1) find $g(a)$ first \u2014 your intermediate value; (2) look up $f'$ evaluated at $g(a)$, NOT at $a$. The most common exam error is reading $f'(a)$ directly, skipping the inner evaluation entirely. This lab strips away all algebra so the only skill tested is Chain Rule grammar.",
        caption: "Select the correct table cells to assemble h'(a). The grammar doesn't change when the functions have no formulas.",
      },
    ],
  },

  math: {
    prose: [
      'There are two equivalent forms of the chain rule. The Lagrange/function-composition form names the outer and inner functions explicitly and is cleaner for algebraic manipulation. The Leibniz form uses dy/du and du/dx and is more intuitive for applied problems involving rates.',
      'An approachable derivation idea: if \u0394u \u2248 g\'(x)\u0394x and \u0394y \u2248 f\'(u)\u0394u, then \u0394y \u2248 f\'(u)g\'(x)\u0394x. Dividing by \u0394x and taking the limiting view gives dy/dx = f\'(g(x))g\'(x).',
      'The chain rule combined with the power rule gives one of the most common differentiation formulas in all of calculus: d/dx[u\u207f] = nu\u207f\u207b\u00b9\u00b7u\', where u = g(x) is any differentiable function. This formula applies whenever you have "something to a power" — the power rule applies to the outer function, and the chain rule contributes the u\' factor.',
      'The extended chain rule for triple compositions states that for y = f(g(h(x))), the derivative is f\'(g(h(x))) \u00b7 g\'(h(x)) \u00b7 h\'(x). The pattern is clear: differentiate each layer from outside to inside, evaluate each outer derivative at everything inside it, and multiply all the factors together.',
      'Identifying the outer and inner functions correctly is a skill that develops with practice. The best approach is to always ask: "What is the last thing done to x if I evaluate this at a number?" That last operation is the outer function. Everything that comes before is the inner function.',

      'Here is a complete worked example of triple composition, done layer by layer. Find $\\frac{d}{dx}[\\sin^3(4x)]$. Before writing a single derivative, run the layer scan: what is the last thing done to x? Cube the result. So the outermost layer is $(\\cdot)^3$. What is the second-to-last step? Take the sine. Middle layer: $\\sin(\\cdot)$. What is the innermost operation? Multiply by 4. Inner core: $4x$. Now peel outside-in. Outer layer: differentiate $(\\cdot)^3$ to get $3(\\cdot)^2$, evaluated at $\\sin(4x)$, giving $3\\sin^2(4x)$. Middle layer: differentiate $\\sin(\\cdot)$ to get $\\cos(\\cdot)$, evaluated at $4x$, giving $\\cos(4x)$. Inner layer: differentiate $4x$ to get $4$. Multiply all three factors: $3\\sin^2(4x) \\cdot \\cos(4x) \\cdot 4 = 12\\sin^2(4x)\\cos(4x)$. The pattern is clear: one multiplicative factor per layer, each factor from differentiating that layer, evaluated at everything inside it. Do NOT skip the inner derivative — that is the most common error in triple compositions.',

      'A powerful way to verify any chain-rule answer is the numerical derivative check. For any function $F(x)$, the numerical derivative at $x = a$ is approximated by $[F(a + 0.001) - F(a)] / 0.001$. For example, to check $d/dx[\\sin^3(4x)]$ at $x = 0.5$: compute $[\\sin^3(4 \\cdot 0.501) - \\sin^3(4 \\cdot 0.5)] / 0.001$ using a calculator, and compare to $12\\sin^2(2)\\cos(2)$ evaluated at $x = 0.5$. If your symbolic answer matches the numerical approximation to 3 decimal places, it is almost certainly correct. This check works because the numerical difference quotient is an approximation of the limit definition, and the limit definition is exactly what the chain rule computes. Whenever you are uncertain about a chain-rule answer on a homework problem, run this 30-second numerical check before moving on.',
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
        id: 'ChainRuleMicroscope',
        title: 'Microscope Mode: The Visual Derivation',
        mathBridge: 'Zoom in on the graph of a composition f(g(x)) at a point. At fine enough scale, every differentiable function looks like a straight line — its local slope. If the inner function g has local slope m₁ and the outer function f has local slope m₂ at g(x), then the composition has local slope m₁·m₂. The chain rule (f∘g)\' = f\'(g(x))·g\'(x) is mathematically encoding exactly this: slope of composition = product of slopes.',
        caption: 'Zoom in to see both curves linearize, then watch the composed slope = m₁ × m₂.',
      },
      {
        id: 'LeibnizUnitTrackerLab',
        title: 'Leibniz Unit Tracker',
        mathBridge: 'Here is something remarkable about Leibniz notation: $\\frac{dy}{dx} = \\frac{dy}{du}\\cdot\\frac{du}{dx}$ looks like the du terms cancel like fractions. This is NOT a coincidence — the chain rule was designed to make this true. This visualization tracks physical units through the chain: if V is in cm³ and r is in cm and t is in seconds, then dV/dt ends up in cm³/s automatically. The unit cancellation is the chain rule doing its job.',
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
      {
        id: 'ChainRuleLimitBridgeViz',
        title: 'Annotated Proof: d/dx[sin(x³)] (Basic)',
        mathBridge: 'How do you prove the chain rule rigorously from the limit definition? The key is multiplying by $(x^3-a^3)/(x^3-a^3)$ which splits the hard limit into two separate, recognisable derivatives. Every abstract algebraic move is verified numerically before you are asked to believe it.',
        caption: 'Step through every algebraic reduction in the rigorous limit-based proof.',
      },
      {
        id: 'ChainRuleLimitBridgeViz2',
        title: 'Annotated Proof: d/dx[sin(x³)] (Detailed)',
        mathBridge: 'This version of the proof features the "Infinite Nesting" WhyPanel system, allowing you to dive deeper into every sub-axiom of the proof.',
        caption: 'A more detailed version of the rigorous limit-based proof.',
      },
      {
        id: 'DeepProofSolver',
        title: 'Dependency Hierarchy Solver: H(x) = sin(x³)',
        mathBridge: 'This tool builds the full dependency graph for H(x) = sin(x³) before differentiating. At the top is the output H; below it are the intermediate nodes (the composition layers); at the bottom are the input x dependencies. Each edge in the graph carries a local derivative. The chain rule says the total derivative from root to leaf is the product of all edge derivatives along any path \u2014 exactly what the visual shows. Use it to see WHY the "multiply down the chain" instruction works.',
        caption: 'Visualize the full dependency graph of a composition and read off the chain rule product from the graph edges.',
      },
      {
        id: 'RecursiveProofStepper',
        title: 'Recursive Proof Stepper: d/dx[sin(x³)]',
        mathBridge: 'While DeepProofSolver shows the full graph at once, this stepper takes you through the proof recursively \u2014 one sub-problem at a time. Each step exposes one layer: "To differentiate sin(x³), I first need d/dx[x³], so I recurse..." This models exactly how a skilled mathematician thinks: break the problem into smaller problems, solve them in order, then combine. If recursive thinking feels hard, step through this slowly \u2014 it will become your natural approach.',
        caption: 'Step through the chain rule proof one sub-problem at a time, deepening the recursive structure of the argument.',
      },
    ],
    visualizationId: 'DerivativeMotionLabPro',
    proofSteps: [
      { expression: 's(t)=\\sin(kt)', annotation: 'Start with position as a sinusoidal motion model.' },
      { expression: 'v(t)=\\frac{ds}{dt}', annotation: 'Velocity is the slope of the position curve at each time.' },
      { expression: 'v(t)=k\\cos(kt)', annotation: 'Apply chain rule: derivative of sin(kt) is cos(kt) times k.' },
      { expression: 'a(t)=\\frac{d^2s}{dt^2}=\\frac{dv}{dt}', annotation: 'Acceleration is the derivative of velocity, i.e., second derivative of position.' },
      { expression: 'a(t)=-k^2\\sin(kt)', annotation: 'Differentiate again: another chain-rule factor k appears, giving k^2.' },
      { expression: 'j(t)=\\frac{d^3s}{dt^3}=\\frac{da}{dt}=-k^3\\cos(kt)', annotation: 'Third derivative (jerk) adds one more chain factor, so magnitude scales with k^3.' },
      { expression: '\\text{Complete motion chain: } s \\to v \\to a \\to j', annotation: 'Position, velocity, acceleration, and jerk now appear as one linked derivative pipeline.' },
    ],
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
          strategyTitle: 'Method 1: Expand algebraically',
          checkpoint: 'What is (x²+1)³ expanded? Can you predict it using (a+b)³ = a³+3a²b+3ab²+b³?',
          hints: ['Level 1: Use the binomial identity (a+b)³ = a³+3a²b+3ab²+b³ with a=x² and b=1.', 'Level 2: (x²)³ = x⁶, 3(x²)²(1) = 3x⁴, 3(x²)(1)² = 3x², (1)³ = 1.', 'Level 3: This method works for cubics and quartics but becomes impractical for (x²+1)^{10} — chain rule is the scalable alternative.'],
        },
        {
          expression: 'f\'(x)=6x^5+12x^3+6x',
          annotation: 'Differentiate the expanded polynomial term by term.',
          strategyTitle: 'Differentiate term-by-term (power rule)',
          checkpoint: 'Differentiate x⁶+3x⁴+3x²+1. What does each term become?',
          hints: ['Level 1: Power rule: d/dx[xⁿ] = n·x^{n-1}. Apply to each term.', 'Level 2: x⁶→6x⁵, 3x⁴→12x³, 3x²→6x, 1→0. Sum: 6x⁵+12x³+6x.', 'Level 3: This is the long way. Notice it already factors as 6x(x⁴+2x²+1) = 6x(x²+1)².'],
        },
        {
          expression: '\\text{Method 2: let } u=x^2+1,\\;f=u^3',
          annotation: 'Set up outer and inner layers for chain rule.',
          strategyTitle: 'Method 2: Identify the composition',
          checkpoint: 'For f(x) = (x²+1)³, what acts "last" — raising to the 3rd power, or adding 1? The one that acts last is outer.',
          hints: ['Level 1: Ask: what is the last operation performed when evaluating f(x)? That is the outer function.', 'Level 2: To evaluate (x²+1)³: first compute x²+1 (inner), then cube it (outer). So outer is u³, inner is x²+1.', 'Level 3: This decomposition F(g(x)) = F(u) with u=g(x) is the prerequisite for every chain rule application. Practice naming outer and inner before computing any derivative.'],
        },
        {
          expression: 'f\'(x)=3u^2\\cdot u\'=3(x^2+1)^2\\cdot2x=6x(x^2+1)^2',
          annotation: 'Apply outer derivative times inner derivative.',
          strategyTitle: 'Apply chain rule: f\'(x) = F\'(g(x))·g\'(x)',
          checkpoint: 'Chain rule formula: derivative of outer (evaluated at inner) times derivative of inner. What is F\'(u) for F(u)=u³?',
          hints: ['Level 1: F\'(u) = 3u². Evaluate at u=g(x): F\'(g(x)) = 3(x²+1)². Then multiply by g\'(x) = 2x.', 'Level 2: The chain rule gives 3(x²+1)²·2x = 6x(x²+1)². Compare to Method 1: the answer is the same but you never had to expand.', 'Level 3: Chain rule scales — for (x²+1)^{100}, direct expansion is impossible. Chain rule gives 100(x²+1)^{99}·2x immediately.'],
        },
        {
          expression: '6x(x^2+1)^2=6x(x^4+2x^2+1)=6x^5+12x^3+6x',
          annotation: 'Expand to confirm exact agreement with Method 1.',
          strategyTitle: 'Verify: expand chain-rule result and compare',
          checkpoint: 'Expand 6x(x²+1)². Predict the result before computing — does it match 6x⁵+12x³+6x?',
          hints: ['Level 1: 6x·(x²+1)² = 6x·(x⁴+2x²+1) = 6x⁵+12x³+6x. Exact match.', 'Level 2: The agreement is guaranteed — chain rule is a theorem, not an approximation. Both methods produce the exact same derivative.', 'Level 3: This verification strategy (expand and compare) is useful whenever you need to check a chain-rule computation on an exam.'],
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
          strategyTitle: 'Decompose the composition',
          checkpoint: 'What operation acts last on input x in (3x\u00b2\u22121)\u2075? Is it "subtract 1" or "raise to the 5th"?',
          hints: ['Level 1: The last operation is raising to the 5th power. So outer = u\u2075, inner = 3x\u00b2\u22121.', 'Level 2: Formal notation: let u = g(x) = 3x\u00b2\u22121. Then f(x) = F(u) = u\u2075. This substitution makes the chain rule structure explicit.', 'Level 3: For nested compositions like sin((x\u00b2+1)\u2075), you would need to apply chain rule twice. Always start by identifying the outermost function.'],
        },
        {
          expression: "F'(u) = 5u^4, \\quad g'(x) = 6x",
          annotation: 'Differentiate the outer function (power rule: bring down 5, reduce exponent to 4) and differentiate the inner function separately.',
          strategyTitle: 'Differentiate outer and inner separately',
          checkpoint: 'What is F\u2019(u) for F(u)=u\u2075? What is g\u2019(x) for g(x)=3x\u00b2\u22121? Compute both before combining.',
          hints: ['Level 1: Power rule: d/du[u\u2075] = 5u\u2074. Power rule + linearity: d/dx[3x\u00b2\u22121] = 6x.', 'Level 2: Keep them separate for now: F\u2019(u) = 5u\u2074 and g\u2019(x) = 6x. They combine in the next step.', 'Level 3: Do NOT substitute g(x) back into F\u2019(u) yet. Keep F\u2019(u) = 5u\u2074 until you combine, then replace u with g(x).'],
        },
        {
          expression: "f'(x) = F'(g(x)) \\cdot g'(x) = 5(3x^2-1)^4 \\cdot 6x",
          annotation: 'Apply the chain rule: differentiate the outer function (giving 5u\u2074) evaluated at the inner function (replacing u with 3x\u00b2-1), then multiply by the derivative of the inner function.',
          strategyTitle: 'Assemble: F\u2019(g(x))\u00b7g\u2019(x)',
          checkpoint: 'Replace u with g(x) = 3x\u00b2\u22121 in F\u2019(u) = 5u\u2074. Then multiply by g\u2019(x) = 6x.',
          hints: ['Level 1: F\u2019(g(x)) = 5(3x\u00b2\u22121)\u2074. Times g\u2019(x) = 6x gives 5(3x\u00b2\u22121)\u2074\u00b76x.', 'Level 2: The chain rule: f\u2019(x) = F\u2019(g(x))\u00b7g\u2019(x) = 5(3x\u00b2\u22121)\u2074\u00b76x.', 'Level 3: The (3x\u00b2\u22121)\u2074 factor comes from differentiating the outer function. The \u00b76x comes from the inner function. Without the inner derivative, the answer would be wrong.'],
        },
        {
          expression: "= 30x(3x^2-1)^4",
          annotation: 'Multiply the constants 5 and 6 together: 5\u00b76 = 30. The (3x\u00b2-1)\u2074 factor remains as is.',
          strategyTitle: 'Multiply constants to get final form',
          checkpoint: 'What is 5\u00d76? Why keep the (3x\u00b2\u22121)\u2074 factor unexpanded?',
          hints: ['Level 1: 5\u00b76 = 30. Result: 30x(3x\u00b2\u22121)\u2074.', 'Level 2: Leave (3x\u00b2\u22121)\u2074 unexpanded \u2014 expanding it serves no purpose and makes the expression harder to read. Factored form is the standard convention.', 'Level 3: The factored form 30x(3x\u00b2\u22121)\u2074 immediately shows zeros: x=0 makes f\u2019=0. The inner expression 3x\u00b2\u22121=0 gives x=\u00b11/\u221a3. These are critical points.'],
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
          strategyTitle: 'Rewrite radical as fractional exponent',
          checkpoint: '\u221a(x\u00b2+1) = (x\u00b2+1)^? \u2014 what is the exponent?',
          hints: ['Level 1: \u221au = u^{1/2}. So \u221a(x\u00b2+1) = (x\u00b2+1)^{1/2}.', 'Level 2: This rewrite converts a radical into a form where the power rule applies. Always rewrite radicals as fractional exponents before differentiating.', 'Level 3: \u221bu = u^{1/3}, u^{2/3} = (\u221bu)\u00b2, etc. The same pattern extends to any root.'],
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
    {
      id: 'ch2-002-ex13',
      title: 'The Ultimate Chain Rule Boss Fight',
      problem: "h(x) = (2x + 1)^5 (3x - 2)^7. \\; \\text{Find } h'(x).",
      steps: [
        {
          expression: "h(x) = f(x)g(x) \\implies h'(x) = f'(x)g(x) + f(x)g'(x)",
          annotation: 'This is first and foremost a Product Rule problem because two distinct blocks are being multiplied.',
        },
        {
          expression: "f(x) = (2x+1)^5 \\implies f'(x) = 10(2x+1)^4",
          annotation: 'Differentiate the first factor using the Chain Rule (outer power 5, inner deriv 2).',
        },
        {
          expression: "g(x) = (3x-2)^7 \\implies g'(x) = 21(3x-2)^6",
          annotation: 'Differentiate the second factor using the Chain Rule (outer power 7, inner deriv 3).',
        },
        {
          expression: "h'(x) = 10(2x+1)^4(3x-2)^7 + 21(2x+1)^5(3x-2)^6",
          annotation: 'Substitute derivatives into the Product Rule formula.',
        },
        {
          expression: "h'(x) = (2x+1)^4(3x-2)^6 \\left[ 10(3x-2) + 21(2x+1) \\right]",
          annotation: 'Factor out the common terms: the lowest powers (4 and 6) of each block.',
        },
        {
          expression: "= (2x+1)^4(3x-2)^6 (72x + 1)",
          annotation: 'Expand and simplify inside the square brackets: 30x - 20 + 42x + 21 = 72x + 1.',
        },
      ],
      conclusion: "h'(x) = (2x + 1)\u2074(3x - 2)\u2076(72x + 1). This is the 'Ultimate Boss' check: Product Rule on the outside, two Chain Rules on the inside, and a sophisticated factoring finale.",
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


  // ─── Semantic Layer ───────────────────────────────────────────────────────
  semantics: {
    "core": [
      {
        "symbol": "f(g(x))",
        "meaning": "a composition — g is the inner function, f is the outer function"
      },
      {
        "symbol": "dy/dx = (dy/du)(du/dx)",
        "meaning": "Leibniz form of the chain rule: the rates multiply"
      },
      {
        "symbol": "outer × inner'",
        "meaning": "evaluate the outer derivative at the inner function, then multiply by the inner's derivative"
      }
    ],
    "rulesOfThumb": [
      "Identify the innermost function first. Differentiate from outside in.",
      "Never forget to multiply by the inner derivative (du/dx). Forgetting it is the chain rule error.",
      "If you see a function raised to a power: d/dx[f(x)ⁿ] = n·f(x)ⁿ⁻¹·f'(x).",
      "Multiple compositions: peel layers from outside in, multiplying a new derivative at each layer."
    ]
  },

  // ─── Spiral Learning ─────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'ch0-composition',
        label: 'Composition of functions (Chapter 0)',
        note: 'The chain rule differentiates f(g(x)). If writing f(g(x)) and identifying the outer and inner functions still feels awkward, review function composition before this lesson — the chain rule is built entirely on that idea.'
      },
      {
        lessonId: 'ch2-differentiation-rules',
        label: 'Differentiation rules (previous lesson)',
        note: 'The chain rule multiplies the derivative of the outer function by the derivative of the inner. Every outer and inner derivative you compute uses the power, product, or quotient rules from the last lesson. The power, product and quotient rules handle non-composed functions; the chain rule is the single missing piece that handles everything else.'
      }
    ],
    futureLinks: [
      {
        lessonId: 'ch2-implicit-differentiation',
        label: 'Implicit differentiation',
        note: 'Implicit differentiation treats y as a function of x and differentiates both sides. Every d/dx[y\u207f] step is chain rule with u = y(x). The chain rule proof you learn here is the backbone of implicit differentiation, and every related-rates equation is a chain rule application in t.'
      },
      {
        lessonId: 'ch2-trig-derivatives',
        label: 'Trig derivatives',
        note: 'Every trig derivative involving a non-trivial argument — like sin(3x) or cos(x\u00b2) — requires the chain rule. The trig derivatives lesson applies chain rule from the very first problem.'
      },
      {
        lessonId: 'ch4-u-substitution',
        label: 'Ch. 4: U-Substitution',
        note: 'U-substitution is the chain rule run in reverse for integration. Recognizing the inner derivative factor in the integrand is the key skill — and it comes from deeply understanding the chain rule here.'
      }
    ]
  },

  // ─── Assessment ──────────────────────────────────────────────────────────
  assessment: {
    "questions": [
      {
        "id": "cr-assess-1",
        "type": "input",
        "text": "d/dx[sin(x²)] = ?",
        "answer": "cos(x²)·2x",
        "hint": "Outer: sin → cos, evaluated at inner x². Inner: x² → 2x. Multiply."
      },
      {
        "id": "cr-assess-2",
        "type": "input",
        "text": "d/dx[(3x+1)⁵] = ?",
        "answer": "5(3x+1)^4 · 3",
        "hint": "Outer: power rule → 5(3x+1)⁴. Inner: 3x+1 → 3. Multiply: 15(3x+1)⁴."
      },
      {
        "id": "cr-assess-3",
        "type": "input",
        "text": "d/dx[e^(cos x)] = ?",
        "answer": "e^(cos x)·(-sin x)",
        "hint": "Outer: eᵘ → eᵘ at u=cos x. Inner: cos x → -sin x. Multiply."
      }
    ]
  },

  // ─── Mental Model Compression ────────────────────────────────────────────
  mentalModel: [
    "Chain Rule = outer'(inner) × inner'",
    "Leibniz: dy/dx = (dy/du)(du/dx)",
    "Peel layers outside→in, multiply a derivative at each layer",
    "Forgetting the inner derivative is the #1 chain rule error"
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
    'completed-example-13',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
    'attempted-challenge-table',
    'attempted-challenge-combo',
  ],
  supplementalVisualizations: [
    {
      id: 'ProductPowerChainRuleViz',
      title: 'Problem 3 Solution Walkthrough',
      mathBridge: 'Most textbooks skip the intermediate algebra for this problem. This interactive peeler reveals every "hidden" factoring step and provides live numeric proof for every deduction.',
      caption: 'Detailed step-by-step solution for h(x) = (2x + 1)⁵(3x - 2)⁷',
    }
  ],

  quiz: [
    {
      id: 'chain-q1',
      type: 'choice',
      text: 'For a composite function $y = f(g(x))$, the chain rule states that $\\dfrac{dy}{dx}$ equals:',
      options: [
        "$f'(x) \\cdot g'(x)$",
        "$f'(g(x)) \\cdot g'(x)$",
        "$f'(g'(x))$",
        "$f(g'(x)) \\cdot g(x)$",
      ],
      answer: "$f'(g(x)) \\cdot g'(x)$",
      hints: ['Differentiate the outside at the inside, then multiply by the derivative of the inside.'],
      reviewSection: 'Intuition tab — outside-inside method',
    },
    {
      id: 'chain-q2',
      type: 'input',
      text: 'Find $\\dfrac{d}{dx}[(3x+1)^5]$.',
      answer: '5*(3*x+1)^4 * 3',
      hints: ['Outside function: $u^5$; inside: $3x+1$. Derivative of outside at inside is $5(3x+1)^4$; multiply by derivative of inside (3).'],
      reviewSection: 'Math tab — chain rule with power functions',
    },
    {
      id: 'chain-q3',
      type: 'input',
      text: 'Find $\\dfrac{d}{dx}[\\sqrt{x^2+9}]$.',
      answer: 'x / sqrt(x^2+9)',
      hints: ['Write as $(x^2+9)^{1/2}$. Outside: $u^{1/2}$; inside: $x^2+9$. Derivative: $\\frac{1}{2}(x^2+9)^{-1/2} \\cdot 2x$.'],
      reviewSection: 'Math tab — chain rule with radical',
    },
    {
      id: 'chain-q4',
      type: 'input',
      text: 'Find $\\dfrac{d}{dx}[(x^3 - 2x)^4]$.',
      answer: '4*(x^3 - 2*x)^3 * (3*x^2 - 2)',
      hints: ['Outside: $u^4$; inside: $x^3-2x$. Result: $4(x^3-2x)^3 \\cdot (3x^2-2)$.'],
      reviewSection: 'Math tab — chain rule examples',
    },
    {
      id: 'chain-q5',
      type: 'input',
      text: 'Find $\\dfrac{d}{dx}\\left[\\dfrac{1}{(2x-5)^3}\\right]$.',
      answer: '-6 / (2*x-5)^4',
      hints: ['Rewrite as $(2x-5)^{-3}$. Chain rule: $-3(2x-5)^{-4} \\cdot 2$.'],
      reviewSection: 'Math tab — chain rule with negative exponent',
    },
    {
      id: 'chain-q6',
      type: 'input',
      text: 'Use the chain rule and product rule together to differentiate $h(x) = x^2 (x+1)^3$. Simplify by factoring.',
      answer: 'x*(x+1)^2 * (5*x+2)',
      hints: ['Product rule first: $(x^2)\'(x+1)^3 + x^2 \\cdot 3(x+1)^2 \\cdot 1$. Factor out $x(x+1)^2$.'],
      reviewSection: 'Math tab — combining product and chain rules',
    },
    {
      id: 'chain-q7',
      type: 'input',
      text: 'Differentiate $y = (4x^2 + 1)^{1/2}$ and evaluate $y\'$ at $x = 2$.',
      answer: '8 / sqrt(17)',
      hints: ['$y\' = \\frac{1}{2}(4x^2+1)^{-1/2} \\cdot 8x$. At $x=2$: $4x^2+1=17$, so $y\'=8/\\sqrt{17}$.'],
      reviewSection: 'Math tab — evaluating chain rule derivative at a point',
    },
    {
      id: 'chain-q8',
      type: 'choice',
      text: 'For $y = f(g(h(x)))$ (a triple composition), the chain rule gives:',
      options: [
        "$f'(g(h(x))) \\cdot g'(h(x))$",
        "$f'(x) \\cdot g'(x) \\cdot h'(x)$",
        "$f'(g(h(x))) \\cdot g'(h(x)) \\cdot h'(x)$",
        "$f'(g'(h'(x)))$",
      ],
      answer: "$f'(g(h(x))) \\cdot g'(h(x)) \\cdot h'(x)$",
      hints: ['Peel one layer at a time from the outside in, multiplying derivatives as you go.'],
      reviewSection: 'Intuition tab — triple composition and layer peeling',
    },
    {
      id: 'chain-q9',
      type: 'input',
      text: 'Differentiate $y = (1 - x^2)^{10}$ and simplify.',
      answer: '-20*x*(1-x^2)^9',
      hints: ['Outside: $u^{10}$; inside: $1-x^2$. Derivative: $10(1-x^2)^9 \\cdot (-2x)$.'],
      reviewSection: 'Math tab — chain rule examples',
    },
    {
      id: 'chain-q10',
      type: 'input',
      text: 'Given that $\\dfrac{dy}{du} = 5$ and $\\dfrac{du}{dx} = 3$, what is $\\dfrac{dy}{dx}$?',
      answer: '15',
      hints: ['Leibniz chain rule: $dy/dx = (dy/du) \\cdot (du/dx)$. Rates multiply along a chain.'],
      reviewSection: 'Intuition tab — rates multiply along a chain (gear analogy)',
    },
  ],
};

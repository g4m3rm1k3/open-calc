export default {
  id: 'ch2-004b',
  slug: 'product-rule-chain-trap',
  chapter: 2,
  order: 4,
  title: 'Product Rule + Chain Rule Trap',
  subtitle: 'Why v\' must be fully differentiated before assembling u\'v + uv\'',
  tags: ['product rule', 'chain rule', 'common mistakes', 'composite functions', 'derivative traps'],
  aliases: 'product chain trap missing inner derivative uv prime inline chain rule mistake',

  spiral: {
    recoveryPoints: [
      { label: 'Product Rule (Lesson 3)', note: 'The assembly template h\'=u\'v+uv\' is only valid after u\' and v\' are fully computed — this lesson shows what happens when that precondition is violated.' },
      { label: 'Chain Rule (Lesson 4)', note: 'Composite-function differentiation is exactly what v\' requires when v(x) is itself a composition — the trap lives at this interface.' },
    ],
    futureLinks: [
      { label: 'Trig Derivatives (Lesson 6)', note: 'Every product involving sin(g(x)) or cos(g(x)) triggers this exact trap — v\' = cos(g(x))·g\'(x) not just cos(g(x)).' },
      { label: 'Exponential/Log Derivatives (Lesson 7)', note: 'Products with e^(g(x)) require v\' = e^(g(x))·g\'(x) — the same incomplete-inner-derivative mistake applies.' },
      { label: 'Inverse Function Derivatives (Lesson 8)', note: 'Inverse trig in products must be differentiated fully before assembly; arctan(g(x)) gives v\' = g\'(x)/(1+g(x)²).' },
      { label: 'Implicit Differentiation (Lesson 9)', note: 'Every implicit term is effectively a composition, so the trap reappears in a new form — forgetting dy/dx when differentiating a function of y.' },
      { label: 'Optimization and Related Rates (Lesson 10)', note: 'Applied problems routinely combine products and compositions; an incomplete inner derivative silently corrupts the critical-point analysis.' },
    ],
  },

  hook: {
    question:
      'Why does this very common workflow fail: write u\'v + uv\', then partially differentiate v\' and move on?',
    realWorldContext:
      'In every applied derivative model with layered dependencies, one incomplete inner derivative quietly corrupts the entire final result. This lesson isolates that exact failure mode and gives a repeatable anti-trap workflow.',
    previewVisualizationId: 'ProductRuleChainTrap',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You just learned both the product rule and the chain rule. They are separate tools, each correct on its own. This lesson exists for one reason only: to show you what happens when you combine them carelessly — and to give you a workflow that prevents the mistake permanently. The trap is not about forgetting a formula; it is about the order in which you complete steps.',

      '**The trap, stated precisely:** When you apply the product rule h\'(x) = u\'v + uv\' to a function h(x) = u(x)·v(x), every term is a multiplication of already-completed derivatives. If v(x) is itself a composite function — meaning v(x) = f(g(x)) for some inner function g — then v\'(x) REQUIRES the chain rule: v\'(x) = f\'(g(x))·g\'(x). Stopping at just the outer derivative f\'(g(x)) and skipping the multiplication by g\'(x) is the trap. The algebra looks plausible, the answer has the right shape, but it is numerically wrong at every single point.',

      '**Worked wrong example — so you can recognize it:** Let h(x) = x² · sin(3x). Choose u = x² and v = sin(3x). The product rule gives h\'(x) = u\'v + uv\'. Now: u\' = 2x (correct). For v = sin(3x), the outer function is sin and the inner function is 3x. The WRONG move is to write v\' = cos(3x), keeping only the outer derivative of the sine. This gives the wrong answer: h\'(x) = 2x·sin(3x) + x²·cos(3x). This expression looks clean and reasonable. It is completely wrong.',

      '**Worked correct example — the same function done right:** h(x) = x² · sin(3x), u = x², v = sin(3x). Correctly: u\' = 2x. For v\' we must apply the chain rule to sin(3x): the outer derivative is cos(3x), and the inner derivative of 3x is 3. So v\' = cos(3x)·3 = 3cos(3x). Now assemble: h\'(x) = 2x·sin(3x) + x²·3cos(3x) = 2x·sin(3x) + 3x²cos(3x). The only difference is that factor of 3 in the second term — but it changes the numerical value at every point.',

      '**Numerical verification that the wrong answer is wrong:** Plug in x = 1. First evaluate the original function: h(1) = 1²·sin(3) ≈ 1·(0.1411) ≈ 0.1411. Now estimate h\'(1) numerically using a small step: compute (h(1.001) − h(1))/0.001. We have h(1.001) = (1.001)²·sin(3.003) ≈ (1.002001)·(0.1382) ≈ 0.1385. So (0.1385 − 0.1411)/0.001 ≈ −2.6. Now compare: the WRONG formula gives h\'(1) = 2(1)·sin(3) + (1)²·cos(3) ≈ 2(0.1411) + (−0.9900) ≈ 0.282 − 0.990 ≈ −0.708. The CORRECT formula gives h\'(1) = 2sin(3) + 3cos(3) ≈ 0.282 + 3(−0.990) ≈ 0.282 − 2.970 ≈ −2.688. The numerical estimate is approximately −2.6, which matches the correct answer (≈−2.69), not the wrong one (≈−0.71). The discrepancy is a factor of roughly 3.8 — not a rounding issue, a structural error.',

      '**The fix — the Assembly Rule:** Treat product-rule assembly as a shopping list with exactly four ingredients: u, v, u\', and full-v\'. You are not allowed to proceed to step 3 (assembly) until all four ingredients are completely finished. Step 1: identify u and v. Step 2: compute u\' fully — if u is a composition, use chain rule. Step 3: compute v\' fully — if v is a composition, use chain rule all the way through. Step 4: ONLY NOW, assemble h\' = u\'v + uv\'. This sequencing removes the trap structurally: there is no moment when partial v\' is in your hand and you are tempted to assemble.',

      '**Second worked example — h(x) = e^(2x) · (x³ − 1)²:** Step 1 — choose u = e^(2x) and v = (x³ − 1)². Step 2 — compute u\' fully: u = e^(2x) is a composition with outer e^(·) and inner 2x, so u\' = e^(2x)·2 = 2e^(2x). Step 3 — compute v\' fully: v = (x³ − 1)² is a composition with outer (·)² and inner (x³ − 1), so v\' = 2(x³ − 1)·3x² = 6x²(x³ − 1). Step 4 — assemble: h\'(x) = [2e^(2x)]·(x³ − 1)² + e^(2x)·[6x²(x³ − 1)]. Factor out the common e^(2x)(x³ − 1) to simplify: h\'(x) = e^(2x)(x³ − 1)[2(x³ − 1) + 6x²] = e^(2x)(x³ − 1)(2x³ + 6x² − 2). Both u\' and v\' required chain rule, and both were completed before assembly.',

      '**Pattern recognition — how to know when v\' needs chain rule:** Ask one question about v before you differentiate it: "Is the thing I am differentiating a simple power xⁿ, or does it contain a sub-expression inside?" If v is simply xⁿ, power rule alone suffices. If v is ANYTHING composed with something other than x — like sin(3x), e^(2x), (x³−1)², ln(x²+1), arctan(5x) — then the chain rule is mandatory. The tell-tale sign is: do I see a function applied to something that is not just plain x? If yes, chain rule is required for v\'.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 5 of 10 — Act 2: Trap Drill',
        body: '**Previous:** The chain rule — differentiating composed functions by multiplying outer and inner derivatives.\n**This lesson:** The #1 mistake when combining product and chain rules — recognize it, confirm it\'s wrong numerically, replace it with the correct workflow.\n**Next:** Trig derivatives — applying your full toolkit to sin, cos, tan and friends.',
      },
      {
        type: 'warning',
        title: 'Wrong vs Correct: side by side',
        body: '\\textbf{Example: } h(x) = x^2 \\sin(3x), \\quad u=x^2,\\; v=\\sin(3x)\\\\ \\textbf{Wrong:}\\quad v\'=\\cos(3x) \\;\\Rightarrow\\; h\'=2x\\sin(3x)+x^2\\cos(3x) \\\\ \\textbf{Correct:}\\quad v\'=\\cos(3x)\\cdot 3=3\\cos(3x) \\;\\Rightarrow\\; h\'=2x\\sin(3x)+3x^2\\cos(3x)',
      },
      {
        type: 'strategy',
        title: '4-Step Assembly Checklist',
        body: '\\text{1) Label } u \\text{ and } v.\\\\ \\text{2) Compute } u\' \\text{ fully (apply chain rule if } u \\text{ is composite).}\\\\ \\text{3) Compute } v\' \\text{ fully (apply chain rule if } v \\text{ is composite).}\\\\ \\text{4) Only now assemble: } h\'=u\'v+uv\'.',
      },
      {
        type: 'example',
        title: 'Quick Drill: Does This v\' Need Chain Rule?',
        body: '\\text{1) } v=x^5 \\;\\to\\; \\textbf{No} \\text{ (plain power)}\\\\ \\text{2) } v=\\sin(3x) \\;\\to\\; \\textbf{Yes} \\text{ (trig of } 3x \\text{)}\\\\ \\text{3) } v=(x^2+1)^4 \\;\\to\\; \\textbf{Yes} \\text{ (power of expression)}\\\\ \\text{4) } v=e^{x^2} \\;\\to\\; \\textbf{Yes} \\text{ (exponential of } x^2 \\text{)}\\\\ \\text{5) } v=\\ln(5x) \\;\\to\\; \\textbf{Yes} \\text{ (log of } 5x \\text{)}',
      },
      {
        type: 'insight',
        title: 'Assembly rule',
        body: 'h\'(x)=u\'v+uv\' \\text{ is valid only after } u\' \\text{ and } v\' \\text{ are fully complete.}',
      },
    ],
    visualizations: [
      {
        id: 'ProductRuleChainTrap',
        title: 'Product Rule Chain Trap Lab',
        mathBridge:
          'Before using the lab, work through the Assembly Checklist mentally for each expression shown. For each one, identify u and v, then ask: is v a composition? If so, what is the outer function and what is the inner function? Write down v\' before the lab reveals the answer. The lab then shows where incomplete v\' appears, why it feels correct, and how full inline chain-rule expansion fixes it. Pay special attention to the numerical error panel — it quantifies exactly how wrong the incomplete answer is at each x.',
        caption:
          'Dedicated anti-pattern lesson: identify the trap, apply the shopping-list workflow, and verify correctness numerically.',
      },
    ],
  },

  math: {
    prose: [
      'For h(x)=u(x)v(x), the product rule is h\'=u\'v+uv\'. This formula is a final assembly template, not a substitute for computing derivatives inside u\' and v\'.',
      'If v is composite, v\' must be computed by chain rule inline: v\' = f\'(g(x))g\'(x). Missing g\'(x) is the exact mechanism behind the trap.',
      'A fast quality check is numeric verification at one or two points. Wrong and correct derivatives often diverge sharply away from special cancellation points.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Combined-rule workflow',
        body: '\\text{1) Choose }u,v.\\; \\text{2) Compute complete }u\',v\'.\\; \\text{3) Assemble }u\'v+uv\'.\\; \\text{4) Simplify and check numerically.}',
      },
    ],
  },

  rigor: {
    title: 'Structure-First Proof Habit',
    proofSteps: [
      {
        expression: 'h(x)=u(x)v(x),\\quad h\'(x)=u\'(x)v(x)+u(x)v\'(x)',
        annotation: 'Assembly template from product rule.',
      },
      {
        expression: 'v(x)=f(g(x)) \\Rightarrow v\'(x)=f\'(g(x))g\'(x)',
        annotation: 'Complete v\' by chain rule before substitution.',
      },
      {
        expression: 'h\'(x)=u\'v+u\\bigl(f\'(g(x))g\'(x)\\bigr)',
        annotation: 'Only now is product-rule assembly complete.',
      },
    ],
    visualizationId: 'ProductRuleChainTrap',
  },

  examples: [
    {
      id: 'ch2-004b-ex1',
      title: 'Classic trap expression',
      problem: 'h(x)=x(6x+6)^{-3}.',
      steps: [
        {
          expression: 'u=x,\\;v=(6x+6)^{-3},\\;u\'=1',
          annotation: 'Choose factors for product rule.',
          strategyTitle: 'Product rule setup: identify u and v',
          checkpoint: 'Before computing any derivatives, predict: what rule will u = x need? What rule will v = (6x+6)^{-3} need? Write down your answers before moving on.',
          hints: [
            'Level 1: You are setting up the product rule template h\' = u\'v + uv\'. The first step is always to label the two factors.',
            'Level 2: Notice that v = (6x+6)^{-3} has a linear expression inside a power — that inner expression means the chain rule will be required when computing v\'.',
            'Level 3: This setup mirrors the 4-step Assembly Checklist from Ch2 Lesson 2 (Chain Rule). You must fully compute v\' before assembly — the inner derivative of (6x+6) is the factor this trap targets.',
          ],
        },
        {
          expression: 'v\'=-3(6x+6)^{-4}\\cdot 6=-18(6x+6)^{-4}',
          annotation: 'Chain rule completes v\': outer power gives -3(·)^{-4}, inner derivative of (6x+6) is 6.',
          strategyTitle: 'Correct: v\' = -18(6x+6)^{-4} by chain rule — the inner factor 6 is mandatory',
          checkpoint: 'What is the outer function of v = (6x+6)^{-3}? What is the inner function? Predict v\' before reading the expression — then check whether you included the inner derivative.',
          hints: [
            'Level 1: v is a composite function — outer is (·)^{-3}, inner is (6x+6). The chain rule requires multiplying the outer derivative by the inner derivative.',
            'Level 2: The outer derivative of (·)^{-3} is -3(·)^{-4}. The inner function is 6x+6, whose derivative is 6. The trap is writing v\' = -3(6x+6)^{-4} and stopping — that omits the ×6.',
            'Level 3: Review Ch2 Lesson 2 (Chain Rule): d/dx[f(g(x))] = f\'(g(x))·g\'(x). Here f(u) = u^{-3} and g(x) = 6x+6, so g\'(x) = 6 must appear as a factor.',
          ],
        },
        {
          expression: 'h\'=(1)\\cdot(6x+6)^{-3}+x\\cdot\\bigl(-18(6x+6)^{-4}\\bigr)',
          annotation: 'Assemble only after full v\'.',
          strategyTitle: 'Product rule assembly: u\'v + uv\' with fully computed v\'',
          checkpoint: 'Both u\' and v\' are now complete. Predict the two terms of h\' using the template h\' = u\'v + uv\' before reading the assembled expression.',
          hints: [
            'Level 1: This is Step 4 of the Assembly Checklist — substituting the completed u\', u, v, and v\' into the product rule template.',
            'Level 2: The key distinction from the trap: the v\' used here is -18(6x+6)^{-4}, not -3(6x+6)^{-4}. The factor of 6 from the inner derivative is already baked in.',
            'Level 3: Assembly is only valid when both derivatives are fully complete. If you had used the incomplete v\' = -3(6x+6)^{-4}, the second term would be off by a factor of 6 — this is precisely the trap described in Ch2 Lesson 2.',
          ],
        },
      ],
      conclusion: 'The missing inner factor 6 is the trap. Inline chain completion prevents it.',
    },
    {
      id: 'ch2-004b-ex2',
      title: 'The canonical sin(3x) trap',
      problem: 'h(x)=x^2\\sin(3x). Find h\'(x).',
      steps: [
        {
          expression: 'u=x^2,\\quad v=\\sin(3x)',
          annotation: 'Step 1: label u and v.',
          strategyTitle: 'Product rule setup: identify u and v',
          checkpoint: 'Look at each factor. Does u = x² need only the power rule? Does v = sin(3x) need only a trig rule, or is a second rule also required? State your prediction.',
          hints: [
            'Level 1: The product rule template is h\' = u\'v + uv\'. Your first job is to assign u and v — pick the two factors of h(x).',
            'Level 2: u = x² is a simple power — no composition. v = sin(3x) has 3x as the argument of sine, not plain x. That difference is what triggers the chain rule requirement on v.',
            'Level 3: From Ch2 Lesson 2 (Chain Rule): any time a trig function\'s argument is not plain x, the chain rule must supply the inner derivative as a multiplying factor.',
          ],
        },
        {
          expression: 'u\'=2x',
          annotation: 'Step 2: differentiate u. Plain power rule suffices — no composition.',
          strategyTitle: 'Differentiate u = x²: power rule only, no chain rule needed',
          checkpoint: 'Confirm that u = x² is NOT a composite function. What makes it safe to use the power rule alone here?',
          hints: [
            'Level 1: The power rule d/dx[x^n] = n·x^{n-1} applies directly when the base is plain x — no inner function is involved.',
            'Level 2: A composition would look like (something other than x)^n — for example (3x)^2 or (x+1)^2. Since u = x^2 has plain x as the base, no chain rule is triggered.',
            'Level 3: Contrasting with v: u\' is the easy case. The trap lives entirely in v\' — this step exists to emphasize that the product rule itself is not wrong, only a missing inner derivative on v would be.',
          ],
        },
        {
          expression: 'v=\\sin(\\underbrace{3x}_{\\text{inner}}),\\quad v\'=\\cos(3x)\\cdot 3=3\\cos(3x)',
          annotation: 'Step 3: differentiate v FULLY. Outer is sin (derivative cos), inner is 3x (derivative 3). Both factors required.',
          strategyTitle: 'Correct: v\' = 3cos(3x) by chain rule — v\' = cos(3x) is WRONG',
          checkpoint: 'Before reading the expression, write down your own v\'. Did you get cos(3x) or 3cos(3x)? If you wrote cos(3x), you fell into the trap — why is that incomplete?',
          hints: [
            'Level 1: v = sin(3x) is a composition: outer function is sin(·), inner function is 3x. The chain rule requires multiplying by the inner derivative.',
            'Level 2: Outer derivative: d/du[sin u] = cos u, evaluated at u = 3x gives cos(3x). Inner derivative: d/dx[3x] = 3. Both factors are mandatory — the trap is stopping at cos(3x) without the ×3.',
            'Level 3: Ch2 Lesson 2 states d/dx[f(g(x))] = f\'(g(x))·g\'(x). Here f = sin, g = 3x, so g\'(x) = 3 must appear. The wrong answer v\' = cos(3x) omits g\'(x) = 3 — that is the entire mechanism of the trap.',
          ],
        },
        {
          expression: 'h\'(x)=u\'v+uv\'=2x\\cdot\\sin(3x)+x^2\\cdot 3\\cos(3x)',
          annotation: 'Step 4: assemble. Both ingredients are complete.',
          strategyTitle: 'Product rule assembly: all four ingredients u, v, u\', v\' are complete',
          checkpoint: 'Check the two terms before simplifying: does the first term contain u\' and v? Does the second term contain u and v\'? Verify that both v\' factors show 3cos(3x), not cos(3x).',
          hints: [
            'Level 1: Assembly just substitutes the four completed values into h\' = u\'v + uv\'. Term 1 = u\'·v = 2x·sin(3x). Term 2 = u·v\' = x²·3cos(3x).',
            'Level 2: The factor of 3 inside v\' = 3cos(3x) is what separates the correct answer from the trap. If you wrote x²·cos(3x) for the second term, you used the incomplete v\'.',
            'Level 3: Numerically at x = 1: correct gives 2sin3 + 3cos3 ≈ -2.69; wrong gives 2sin3 + cos3 ≈ -0.71. The discrepancy (≈ factor of 3.8) is entirely due to the missing inner derivative 3.',
          ],
        },
        {
          expression: 'h\'(x)=2x\\sin(3x)+3x^2\\cos(3x)',
          annotation: 'Simplified final answer. At x=1: 2\\sin 3+3\\cos 3\\approx 0.282-2.970\\approx -2.688, matching the numerical estimate.',
          strategyTitle: 'Simplified result: factor of 3 in second term is the entire difference from the wrong answer',
          checkpoint: 'Compare the correct answer 2x·sin(3x) + 3x²·cos(3x) with the trap answer 2x·sin(3x) + x²·cos(3x). Identify the single factor that differs and state where it came from.',
          hints: [
            'Level 1: The final simplified form has two terms. Both are correct only when v\' = 3cos(3x) was used. The trap answer is missing the coefficient 3 in the second term.',
            'Level 2: The coefficient 3 is the inner derivative of 3x. It entered via the chain rule in Step 3. Every subsequent step that uses v\' inherits this factor — or loses it if the trap was taken.',
            'Level 3: Use numerical verification as a habit (Ch2 Lesson 2 insight): plug in x = 1 to both answers. The correct answer matches the numerical difference quotient (≈ -2.69); the trap answer does not (≈ -0.71). Numeric checks catch inner-derivative errors immediately.',
          ],
        },
      ],
      conclusion: 'The factor of 3 in v\'=3cos(3x) is what the trap omits. Without it the answer is off by that factor everywhere.',
    },
    {
      id: 'ch2-004b-ex3',
      title: 'Both factors composite',
      problem: 'h(x)=e^{2x}\\cdot(x^3-1)^2. Find h\'(x).',
      steps: [
        {
          expression: 'u=e^{2x},\\quad v=(x^3-1)^2',
          annotation: 'Step 1: label. Both u and v are composites.',
        },
        {
          expression: 'u\'=e^{2x}\\cdot 2=2e^{2x}',
          annotation: 'Step 2: u\' by chain rule. Outer is e^{(\\cdot)}, inner is 2x with derivative 2.',
        },
        {
          expression: 'v\'=2(x^3-1)^1\\cdot 3x^2=6x^2(x^3-1)',
          annotation: 'Step 3: v\' by chain rule. Outer is (\\cdot)^2, inner is (x^3-1) with derivative 3x^2.',
        },
        {
          expression: 'h\'=2e^{2x}(x^3-1)^2+e^{2x}\\cdot 6x^2(x^3-1)',
          annotation: 'Step 4: assemble. Factor out e^{2x}(x^3-1).',
        },
        {
          expression: 'h\'(x)=e^{2x}(x^3-1)\\bigl[2(x^3-1)+6x^2\\bigr]=e^{2x}(x^3-1)(2x^3+6x^2-2)',
          annotation: 'Fully simplified. Both chain rules were required before assembly.',
        },
      ],
      conclusion: 'When both factors are composite, both require chain rule before assembly. The 4-step checklist handles this without extra thought.',
    },
  ],

  challenges: [
    {
      id: 'ch2-004b-ch1',
      title: 'Find and fix the error',
      problem: 'A student differentiates h(x) = x^3 \\cdot \\cos(x^2) and writes h\'(x) = 3x^2\\cos(x^2) + x^3(-\\sin(x^2)). Is this correct? If not, find the error and give the correct derivative.',
      hint: 'Check whether v\'=−sin(x²) is the complete derivative of cos(x²).',
      solution: 'Incorrect. v=\\cos(x^2) is a composition with inner x^2, so v\'=-\\sin(x^2)\\cdot 2x=-2x\\sin(x^2). The student omitted the inner derivative 2x. Correct answer: h\'(x)=3x^2\\cos(x^2)+x^3(-2x\\sin(x^2))=3x^2\\cos(x^2)-2x^4\\sin(x^2).',
    },
    {
      id: 'ch2-004b-ch2',
      title: 'Numerical verification challenge',
      problem: 'Differentiate h(x) = \\sqrt{x} \\cdot e^{x^2}. Then verify numerically at x = 1: compute (h(1.001)-h(1))/0.001 to 3 decimal places and confirm it matches your formula.',
      hint: 'u=\\sqrt{x}=x^{1/2}, u\'=\\tfrac{1}{2}x^{-1/2}. v=e^{x^2} requires chain rule for v\'.',
      solution: 'u\'=\\frac{1}{2\\sqrt{x}}, v\'=e^{x^2}\\cdot 2x. Assembly: h\'=\\frac{e^{x^2}}{2\\sqrt{x}}+2x^{3/2}e^{x^2}=e^{x^2}\\!\\left(\\frac{1}{2\\sqrt{x}}+2\\sqrt{x}\\cdot x\\right). At x=1: e^1(0.5+2)=2.5e\\approx 6.796. Numerical check: h(1)=e, h(1.001)=\\sqrt{1.001}\\cdot e^{1.002001}\\approx 1.0005\\cdot 2.7247\\approx 2.726. Difference quotient: (2.726-2.718)/0.001\\approx 6.79. Matches.',
    },
  ],
}

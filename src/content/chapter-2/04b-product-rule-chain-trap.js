export default {
  id: 'ch2-004b',
  slug: 'product-rule-chain-trap',
  chapter: 2,
  order: 4.5,
  title: 'Product Rule + Chain Rule Trap',
  subtitle: 'Why v\' must be fully differentiated before assembling u\'v + uv\'',
  tags: ['product rule', 'chain rule', 'common mistakes', 'composite functions', 'derivative traps'],
  aliases: 'product chain trap missing inner derivative uv prime inline chain rule mistake',

  hook: {
    question:
      'Why does this very common workflow fail: write u\'v + uv\', then partially differentiate v\' and move on?',
    realWorldContext:
      'In every applied derivative model with layered dependencies, one incomplete inner derivative quietly corrupts the entire final result. This lesson isolates that exact failure mode and gives a repeatable anti-trap workflow.',
    previewVisualizationId: 'ProductRuleChainTrap',
  },

  intuition: {
    prose: [
      'The trap is sequencing, not memorization. Students know product rule and chain rule separately, but apply chain rule too late or only partially inside v\'.',
      'The fix is to treat product-rule assembly as a shopping list with four completed ingredients: u, v, u\', and full v\'. If v\' requires chain rule, finish it first before plugging into u\'v + uv\'.',
      'This lesson uses side-by-side wrong vs right derivations plus numeric checks to prove that incomplete v\' creates measurable error, even when the algebra looks superficially reasonable.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Core anti-pattern',
        body: '\\text{Wrong: } v\' = \\text{outer derivative only} \\quad \\text{Correct: } v\' = \\text{outer derivative} \\cdot \\text{inner derivative',
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
          'Track three canonical traps: x(6x+6)^-3, x^2 sin(x^3), and e^x sqrt(x^2+1). The lab shows where incomplete v\' appears, why it feels correct, and how full inline chain-rule expansion fixes it.',
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
        },
        {
          expression: 'v\'=-3(6x+6)^{-4}\\cdot 6=-18(6x+6)^{-4}',
          annotation: 'Chain rule completes v\'.',
        },
        {
          expression: 'h\'=(1)\\cdot(6x+6)^{-3}+x\\cdot\\bigl(-18(6x+6)^{-4}\\bigr)',
          annotation: 'Assemble only after full v\'.',
        },
      ],
      conclusion: 'The missing inner factor 6 is the trap. Inline chain completion prevents it.',
    },
  ],
}

export default {
  id: 'w6-001',
  slug: 'performance',
  chapter: 'w6',
  order: 1,
  title: 'Performance',
  subtitle: 'Not all code updates are executed equally by the graphics engine',
  tags: ['performance', 'engine', 'reflow', 'repaint', 'optimization'],
  aliases: 'fast rendering lag jank frame rate fps',

  hook: {
    question: 'Why does animating CSS "margin-left" cause your laptop fan to spin, while animating CSS "transform" is buttery smooth?',
    realWorldContext: 'If a frame takes longer than 16 milliseconds to compute, human eyes detect visual "jank". Heavy UI systems demand extreme synchronization with the physical GPU refresh threshold.',
    previewVisualizationId: 'ReflowRepaintViz',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** We have fully functional systems executing logic. But when scaling to massive dimensions, unoptimized code physically brings the browser Graphics Engine to a crawl.',
      'The browser rendering pipeline fundamentally executes sequentially: Javascript Logic → Structure Calculation (Reflow) → Pixel Colors (Repaint) → Graphics Card Layering (Composite).',
      'If you manipulate width or position, you computationally force every other element on the screen to recalculate its specific geometry (Reflow). If you just manipulate opacity, you bypass geometry entirely and push the load cheaply to the GPU.',
      '**Where this is heading:** Once we comprehend engine constraints, we realize why scaling applications physically demands generalized Framework Architectures.'
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 3 — Advanced Engineering',
        body: '**Previous:** Completing the full State and Async data loop.\n**This lesson:** The actual physics of browser mechanics.\n**Next:** Leveraging mathematical layer Abstractions.',
      }
    ],
    visualizations: [
      {
        id: 'WebLesson16_Performance',
        title: 'The Rendering Pipeline',
        caption: 'Compare the processor execution paths of unoptimized property changes vs GPU offloading.',
        mathBridge: 'Step 1: Actuate the "Margin" transition. Notice the CPU spike diagram correctly track the math-heavy layout recalculation cycle. Step 2: Actuate the "Transform" transition. Notice exactly how the Reflow stage is entirely bypassed.'
      }
    ]
  },

  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },

  examples: [],
  challenges: [],

  semantics: {
    core: [
      { symbol: 'Reflow', meaning: 'The computationally expensive cascade math calculating physical 2D element positionings' },
      { symbol: 'Composite', meaning: 'The purely graphical operation mechanically handled rapidly on the hardware GPU core' }
    ]
  },
  spiral: { recoveryPoints: [], futureLinks: [] },
  assessment: { questions: [] },
  mentalModel: [
    'Frames demand 16ms render ceilings.',
    'Geometry math is highly expensive.',
    'Graphics logic belongs strictly on GPUs.'
  ],
  checkpoints: ['read-intuition', 'read-math'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Frames demand 16ms render ceilings." Why is 16ms the critical threshold for smooth animation?',
      options: [
        'Browsers can only process one frame every 16ms due to hardware limits',
        '60 frames per second means each frame has ~16ms to complete — miss it and the animation stutters visibly',
        'JavaScript timers have a minimum resolution of 16ms',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Geometry math is highly expensive." Why does triggering layout recalculation ("reflow") hurt performance?',
      options: [
        'It forces the browser to recalculate position and size for every affected element, which is CPU-intensive',
        'It reloads the CSS from the server',
        'It only affects elements inside iframes',
      ],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Graphics logic belongs strictly on GPUs." Which CSS properties let the browser offload work to the GPU?',
      options: [
        'margin and padding — they are hardware-accelerated in all modern browsers',
        'transform and opacity — compositing these does not trigger layout or paint, so the GPU handles them cheaply',
        'background-color and font-size — they are the simplest properties to accelerate',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'You want to animate a card sliding across the screen smoothly. Which approach is most performant?',
      options: [
        'Change the left CSS property on every animation frame using setInterval',
        'Use CSS transform: translateX() with a transition — this runs on the GPU and avoids triggering layout',
        'Use JavaScript to update the margin-left value in a requestAnimationFrame loop',
      ],
      correct: 1,
    },
  ],
};

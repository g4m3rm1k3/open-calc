export default {
  id: 'precalc3-trig-graphs',
  slug: 'trig-graphs',
  chapter: 'precalc-3',
  order: 4,
  title: "Graphing Trigonometric Functions",
  subtitle: "Visualizing the wave-like periodic nature of trigonometric functions.",
  tags: ["graphs","sine wave","period","amplitude"],
  hook: {
    question: "How do we graph waves mapping to circles?",
    realWorldContext: 'Watch the following videos step-by-step to master this concept.'
  },
  intuition: {
    blocks: [
      { type: 'prose', paragraphs: ['Using a calculator for trig functions: make sure the calculator is in the correct mode (degrees or radians) before evaluating. Common mistake: computing sin(30) in radian mode and getting a wrong answer.'] },
      { type: 'viz', id: 'VideoCarousel', title: 'Using Trig Functions Practically',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/-kXIfRLNlUw', title: 'TR-16 — Trig Functions on a Calculator' },
          { url: 'https://www.youtube.com/embed/Z3PB_l2PRjc', title: 'TR-17 — Most Common Use of Trigonometry' },
        ]},
      },
      { type: 'prose', paragraphs: ['The graphs of **sine and cosine** are smooth periodic waves. Both have period 2π and range [−1, 1]. sin(x) starts at 0, cos(x) starts at 1. They are horizontal shifts of each other: cos(x) = sin(x + π/2).'] },
      { type: 'viz', id: 'VideoEmbed', title: 'TR-18: Graphing Sine and Cosine', props: { url: 'https://www.youtube.com/embed/f99P31SAsek' } },
      { type: 'prose', paragraphs: ['**Tangent and cotangent** have period π and vertical asymptotes where cosine (or sine) equals zero. Tangent grows without bound as x approaches π/2. **Secant and cosecant** are the reciprocals of cosine and sine — they have the same asymptotes and period 2π.'] },
      { type: 'viz', id: 'VideoCarousel', title: 'Graphing Tan, Cot, Sec, Csc',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/p14y-9xPVgk', title: 'TR-19 — Graphing Tangent & Cotangent' },
          { url: 'https://www.youtube.com/embed/UZA34UL_mUE', title: 'TR-20 — Graphing Secant & Cosecant' },
        ]},
      },
      { type: 'prose', paragraphs: ['The **domain and range** of each trig function: sin and cos are defined for all real numbers with range [−1, 1]. Tan and cot are undefined at multiples of π/2; sec and csc are undefined where their base functions are zero.'] },
      { type: 'viz', id: 'VideoEmbed', title: 'TR-21: Domain and Range of Trig Functions', props: { url: 'https://www.youtube.com/embed/NEoG0esRWFo' } },
      { type: 'prose', paragraphs: ['**Graph transformations** of trig functions follow the general form y = A·sin(Bx + C) + D. Amplitude = |A|, period = 2π/|B|, phase shift = −C/B, vertical shift = D. The same applies to cosine and tangent.'] },
      { type: 'viz', id: 'VideoCarousel', title: 'Trig Graph Variations',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/mFmPAL_5I4E', title: 'TR-42 — Trig Graph Variations 1' },
          { url: 'https://www.youtube.com/embed/RdIiaGH-KtQ', title: 'TR-43 — Trig Graph Variations 2' },
          { url: 'https://www.youtube.com/embed/LESdCLdTHVg', title: 'TR-44 — Trig Graph Variations 3' },
        ]},
      },
    ],
  },
  math: {
    prose: ['Review the mathematical derivations covered in the video series.'],
  }
}

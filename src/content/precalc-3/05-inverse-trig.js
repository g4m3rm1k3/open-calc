export default {
  id: 'precalc3-inverse-trig',
  slug: 'inverse-trig',
  chapter: 'precalc-3',
  order: 5,
  title: "Inverse Trigonometric Functions",
  subtitle: "Finding angles when you already know the ratio.",
  tags: ["inverse functions","arcsin","arccos","arctan"],
  hook: {
    question: "If you know the ratio of sides of a right triangle, how do you find the exact angle?",
    realWorldContext: 'Inverse trig functions appear constantly in calculus — in antiderivatives, arc length, and physics applications.',
  },
  intuition: {
    blocks: [
      { type: 'prose', paragraphs: ['To invert a trig function, we must restrict its domain so it becomes one-to-one. arcsin is the inverse of sin restricted to [−π/2, π/2]. arccos uses [0, π]. arctan uses (−π/2, π/2).'] },
      { type: 'viz', id: 'VideoEmbed', title: 'TR-22: Algebra Review of Inverse Functions', props: { url: 'https://www.youtube.com/embed/0xFUn0Dpu9M' } },
      { type: 'prose', paragraphs: ['arcsin and arccos are reflections of sin and cos across the line y = x, restricted to their principal domains.'] },
      // TR-23 and TR-23X cover the same topic (inverse sine & cosine) — carousel
      { type: 'viz', id: 'VideoCarousel', title: 'Inverse Sine & Cosine Functions',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/qNhoMj8DYaU', title: 'TR-23 — Dennis F. Davis' },
          { url: 'https://www.youtube.com/embed/GzfoE-u5BsU', title: 'TR-23X — Extended version' },
        ]},
      },
      { type: 'prose', paragraphs: ['arctan, arccot, arcsec, arccsc — each has its own restricted domain. arctan is the most common in calculus.'] },
      { type: 'viz', id: 'VideoEmbed', title: 'TR-24: Other Inverse Trig Functions', props: { url: 'https://www.youtube.com/embed/h8QTK6u86EQ' } },
      { type: 'prose', paragraphs: ['Evaluating inverse trig: find the angle in the principal domain whose trig value equals the input. e.g. arcsin(1/2) = π/6 because sin(π/6) = 1/2 and π/6 ∈ [−π/2, π/2].'] },
      // TR-25 + Kim evaluating inverse trig — same topic, two instructors
      { type: 'viz', id: 'VideoCarousel', title: 'Evaluating Inverse Trig Functions',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/em9vMyfBMzU', title: 'TR-25 — Calculator Methods' },
          { url: 'https://www.youtube.com/embed/7t_pZGGxMdE', title: 'Evaluating Inverse Trig — Kim' },
          { url: 'https://www.youtube.com/embed/hxjmtDXXCzU', title: 'Evaluating Inverse Trig — Kim (Extended)' },
        ]},
      },
    ],
  },
  math: {
    prose: ['Review the mathematical derivations covered in the video series.'],
  },
}

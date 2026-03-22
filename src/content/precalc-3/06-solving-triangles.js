export default {
  id: 'precalc3-solving-triangles',
  slug: 'solving-triangles-series',
  chapter: 'precalc-3',
  order: 6,
  title: "Solving Triangles",
  subtitle: "Applications of the Law of Sines and the Law of Cosines",
  tags: ["law of sines","law of cosines","ssa triangles","solving equations"],
  hook: {
    question: "How do you solve non-right triangles?",
    realWorldContext: 'The law of sines and cosines appear in navigation, physics, and engineering. Trig equations and solving triangles form a core skill before calculus.',
  },
  intuition: {
    blocks: [
      { type: 'prose', paragraphs: ['Right triangle trig (SOH-CAH-TOA) only works when one angle is 90°. For oblique triangles, we need the Law of Sines and the Law of Cosines.'] },
      { type: 'viz', id: 'VideoEmbed', title: 'TR-26: Solving Right Triangles', props: { url: 'https://www.youtube.com/embed/CE_7EZNcG2s' } },
      { type: 'viz', id: 'VideoEmbed', title: 'TR-27: Triangle Types to Solve', props: { url: 'https://www.youtube.com/embed/kuEr6xq7c1A' } },
      { type: 'prose', paragraphs: ['The Law of Sines: a/sin A = b/sin B = c/sin C. Use when you know AAS, ASA, or SSA (watch for the ambiguous case).'] },
      // TR-28 + Kim law of sines — same topic
      { type: 'viz', id: 'VideoCarousel', title: 'The Law of Sines',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/TzsKsxLuwgo', title: 'TR-28 — Dennis F. Davis' },
          { url: 'https://www.youtube.com/embed/FtYbQ8X7U_w', title: 'Oblique Triangles — Kim' },
        ]},
      },
      { type: 'prose', paragraphs: ['The Law of Cosines: c² = a² + b² − 2ab cos C. Use when you know SAS or SSS.'] },
      // TR-29 + TR-29Z + Kim law of cosines — same topic, three takes
      { type: 'viz', id: 'VideoCarousel', title: 'The Law of Cosines',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/4yo5nlTtjB8', title: 'TR-29 — Dennis F. Davis' },
          { url: 'https://www.youtube.com/embed/tlmH_kY9DHg', title: 'TR-29Z — Proof of Law of Cosines' },
          { url: 'https://www.youtube.com/embed/07w-wk8kRRE', title: 'Law of Cosines — Kim' },
        ]},
      },
      { type: 'prose', paragraphs: ['The SSA ambiguous case: given two sides and a non-included angle, there may be 0, 1, or 2 valid triangles. Careful geometric reasoning is required.'] },
      { type: 'viz', id: 'VideoEmbed', title: 'TR-30: SSA Triangles Overview', props: { url: 'https://www.youtube.com/embed/o_t0qqzqqZ4' } },
      { type: 'viz', id: 'VideoEmbed', title: 'TR-31: Solving SSA Triangles', props: { url: 'https://www.youtube.com/embed/NQSPgObl80M' } },
      { type: 'prose', paragraphs: ['Solving trig equations: isolate the trig function, find the reference angle, then list all solutions in the given interval using the unit circle.'] },
      { type: 'viz', id: 'VideoEmbed', title: 'Solving Trigonometric Equations (5 Examples)', props: { url: 'https://www.youtube.com/embed/9206OVkXH50' } },
    ],
  },
  math: {
    prose: ['Review the mathematical derivations covered in the video series.'],
  },
}

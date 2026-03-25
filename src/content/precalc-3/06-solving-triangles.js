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
      { type: 'viz', id: 'VideoEmbed', title: 'TR-26: Solving Right Triangles', props: { url: "" } },
      { type: 'viz', id: 'VideoEmbed', title: 'TR-27: Triangle Types to Solve', props: { url: "" } },
      { type: 'prose', paragraphs: ['The Law of Sines: a/sin A = b/sin B = c/sin C. Use when you know AAS, ASA, or SSA (watch for the ambiguous case).'] },
      {
        type: 'viz',
        id: 'LawOfSinesViz',
        title: 'Law of Sines - Draggable Triangle',
        caption: 'Drag any vertex: the three ratios stay equal, and each equals the circumcircle diameter 2R.',
      },
      // TR-28 + Kim law of sines — same topic
      { type: 'viz', id: 'VideoCarousel', title: 'The Law of Sines',
        props: { videos: [
          { url: "", title: 'TR-28 — Dennis F. Davis' },
          { url: "", title: 'Oblique Triangles — Kim' },
        ]},
      },
      { type: 'prose', paragraphs: ['The Law of Cosines: c² = a² + b² − 2ab cos C. Use when you know SAS or SSS.'] },
      // TR-29 + TR-29Z + Kim law of cosines — same topic, three takes
      { type: 'viz', id: 'VideoCarousel', title: 'The Law of Cosines',
        props: { videos: [
          { url: "", title: 'TR-29 — Dennis F. Davis' },
          { url: "", title: 'TR-29Z — Proof of Law of Cosines' },
          { url: "", title: 'Law of Cosines — Kim' },
        ]},
      },
      { type: 'prose', paragraphs: ['The SSA ambiguous case: given two sides and a non-included angle, there may be 0, 1, or 2 valid triangles. Careful geometric reasoning is required.'] },
      { type: 'viz', id: 'VideoEmbed', title: 'TR-30: SSA Triangles Overview', props: { url: "" } },
      { type: 'viz', id: 'VideoEmbed', title: 'TR-31: Solving SSA Triangles', props: { url: "" } },
      { type: 'prose', paragraphs: ['Solving trig equations: isolate the trig function, find the reference angle, then list all solutions in the given interval using the unit circle.'] },
      { type: 'viz', id: 'VideoEmbed', title: 'Solving Trigonometric Equations (5 Examples)', props: { url: "" } },
    ],
  },
  math: {
    prose: ['Review the mathematical derivations covered in the video series.'],
  },

  rigor: {
    title: 'Proof of the Law of Cosines',
    visualizationId: 'LawOfSinesViz',
    proofSteps: [
      {
        expression: '\\text{Place triangle with } C \\text{ at origin, } B \\text{ at } (a, 0), \\text{ and } A \\text{ at } (b\\cos C, b\\sin C).',
        annotation: 'Coordinate setup: side a = BC, side b = CA, and angle C at the origin.',
      },
      {
        expression: 'c^2 = |AB|^2 = (b\\cos C - a)^2 + (b\\sin C)^2',
        annotation: 'Distance formula for side c = AB.',
      },
      {
        expression: '= b^2\\cos^2 C - 2ab\\cos C + a^2 + b^2\\sin^2 C',
        annotation: 'Expand both squares.',
      },
      {
        expression: '= b^2(\\cos^2 C + \\sin^2 C) + a^2 - 2ab\\cos C',
        annotation: 'Group the b^2 terms and apply the Pythagorean identity.',
      },
      {
        expression: 'c^2 = a^2 + b^2 - 2ab\\cos C \\qquad \\blacksquare',
        annotation: 'This is the Law of Cosines. If C = 90 degrees, cos C = 0 and it reduces to the Pythagorean theorem.',
      },
    ],
  },
}

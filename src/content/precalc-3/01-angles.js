export default {
  id: 'precalc3-angles',
  slug: 'angles',
  chapter: 'precalc-3',
  order: 1,
  title: "Introduction to Angles",
  subtitle: "Understanding angle measurement in Degrees and Radians",
  tags: ["angles","radians","degrees"],
  hook: {
    question: "How do we measure rotation mathematically?",
    realWorldContext: 'Watch the following videos step-by-step to master this concept.'
  },
  intuition: {
    blocks: [
      { type: 'prose', paragraphs: ['An **angle** is a measure of rotation — how far one ray has turned from another around a common endpoint. Angles are the foundation of all trigonometry.'] },
      { type: 'viz', id: 'VideoEmbed', title: 'TR-00: Introduction to the Trigonometry Series', props: { url: 'https://www.youtube.com/embed/U23JMdBIJ0M' } },
      { type: 'prose', paragraphs: ['Angles are classified by size: acute (0°–90°), right (90°), obtuse (90°–180°), straight (180°), and reflex (>180°). Complementary angles sum to 90°; supplementary angles sum to 180°.'] },
      { type: 'viz', id: 'VideoCarousel', title: 'Introduction to Angles',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/OFK1SRVbkaA', title: 'TR-01 — Introduction to Angles' },
          { url: 'https://www.youtube.com/embed/fqm95DcmJaQ', title: 'TR-02 — Types of Angles' },
          { url: 'https://www.youtube.com/embed/ZjAWq2AnZkQ', title: 'TR-03 — Angle Relationships' },
        ]},
      },
      { type: 'prose', paragraphs: ['**Degrees** are the familiar unit: one full rotation is 360°. Minutes (′) and seconds (″) subdivide degrees for precision: 1° = 60′ = 3600″.'] },
      { type: 'viz', id: 'VideoCarousel', title: 'Angle Measurement in Degrees',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/gYKig6D3_Ck', title: 'TR-04 — Angle Measurement in Degrees' },
          { url: 'https://www.youtube.com/embed/eR_KZQtMvx0', title: 'TR-04Z — Degrees, Minutes & Seconds' },
        ]},
      },
      { type: 'prose', paragraphs: ['**Radians** are the mathematician\'s preferred unit. One radian is the angle that subtends an arc equal in length to the radius. A full circle = 2π radians. The conversion: 180° = π radians, so 1° = π/180 rad and 1 rad = 180°/π.'] },
      { type: 'viz', id: 'VideoCarousel', title: 'Introduction to Radians',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/oJ-BbwvwQg0', title: 'TR-05 — Introduction to Radians' },
          { url: 'https://www.youtube.com/embed/pQya8y6YC0U', title: 'TR-06 — Angle Measurement in Radians' },
        ]},
      },
    ],
  },
  math: {
    prose: ['Review the mathematical derivations covered in the video series.'],
  }
}

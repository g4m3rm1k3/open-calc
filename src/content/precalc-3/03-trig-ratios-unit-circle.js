export default {
  id: 'precalc3-trig-ratios-unit-circle',
  slug: 'trig-ratios-unit-circle',
  chapter: 'precalc-3',
  order: 3,
  title: "Trig Ratios & The Unit Circle",
  subtitle: "Defining sine, cosine, tangent and exploring their relationship on the unit circle.",
  tags: ["unit circle","sine","cosine","tangent"],
  hook: {
    question: "What do the trigonometric functions actually represent?",
    realWorldContext: 'Watch the following videos step-by-step to master this concept.'
  },
  intuition: {
    blocks: [
      { type: 'prose', paragraphs: ['In a right triangle, the **six trig ratios** are defined relative to an angle θ: sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, tan θ = opposite/adjacent, and their reciprocals (csc, sec, cot). The "co-" prefix comes from complementary angles — sin of an angle equals cos of its complement.'] },
      { type: 'viz', id: 'VideoCarousel', title: 'Trigonometric Ratios',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/LvMScE93T6I', title: 'TR-13 — The Trigonometric Ratios' },
          { url: 'https://www.youtube.com/embed/J5KWXgKx0MM', title: 'TR-13Z — How the Co- Functions Got Their Names' },
        ]},
      },
      { type: 'prose', paragraphs: ['The **unit circle** is a circle of radius 1 centered at the origin. For any angle θ, the point on the unit circle is (cos θ, sin θ). This extends trig beyond right triangles to any angle — including obtuse, negative, and angles greater than 360°.'] },
      { type: 'viz', id: 'VideoEmbed', title: 'TR-14: The Unit Circle', props: { url: 'https://www.youtube.com/embed/oJgBJfstOOU' } },
      { type: 'prose', paragraphs: ['The **common angles** (30°, 45°, 60° — or π/6, π/4, π/3) appear constantly. Their exact values come from the 30-60-90 and 45-45-90 triangles. Memorize the unit circle values — they are required for calculus derivatives and integrals.'] },
      { type: 'viz', id: 'VideoCarousel', title: 'Sine & Cosine of Common Angles',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/4TFLcKKmfao', title: 'TR-15 — Sine & Cosine of Common Angles' },
          { url: 'https://www.youtube.com/embed/i9ahDcV-bVg', title: 'TR-15Z — Proof of Common Values' },
        ]},
      },
    ],
  },
  math: {
    prose: ['Review the mathematical derivations covered in the video series.'],
  }
}

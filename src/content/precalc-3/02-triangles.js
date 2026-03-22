export default {
  id: 'precalc3-triangles',
  slug: 'triangles',
  chapter: 'precalc-3',
  order: 2,
  title: "Triangles & Geometry",
  subtitle: "A review of triangular geometry, the Pythagorean Theorem, and distance.",
  tags: ["geometry","triangles","pythagorean"],
  hook: {
    question: "How does the geometry of triangles build the foundation for trigonometry?",
    realWorldContext: 'Watch the following videos step-by-step to master this concept.'
  },
  intuition: {
    blocks: [
      { type: 'prose', paragraphs: ['A **triangle** has three sides and three angles that sum to 180°. Triangles are classified by angles (acute, right, obtuse) and by sides (equilateral, isosceles, scalene). Thales\' theorem: any angle inscribed in a semicircle is a right angle.'] },
      { type: 'viz', id: 'VideoCarousel', title: 'Triangle Geometry & Thales\' Theorem',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/mRqMtR1D4KE', title: 'TR-07 — Geometry Review of Triangles' },
          { url: 'https://www.youtube.com/embed/hfr2Sp8W1uU', title: "TR-07Z — Thales' Theorem Proof" },
        ]},
      },
      { type: 'prose', paragraphs: ['**Similar triangles** have equal angles and proportional sides. **Congruent triangles** are identical in shape and size. Similarity criteria: AA, SAS, SSS. Congruence criteria: ASA, SAS, SSS, AAS.'] },
      { type: 'viz', id: 'VideoEmbed', title: 'TR-08: Similar and Congruent Triangles', props: { url: 'https://www.youtube.com/embed/lNd-ubyTkg4' } },
      { type: 'prose', paragraphs: ['The **Pythagorean Theorem**: in a right triangle with legs $a, b$ and hypotenuse $c$, $a^2 + b^2 = c^2$. This is one of the most fundamental results in all of mathematics.'] },
      { type: 'viz', id: 'VideoCarousel', title: 'The Pythagorean Theorem',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/4A9iNamXuZk', title: 'TR-09 — The Pythagorean Theorem' },
          { url: 'https://www.youtube.com/embed/0M2aTzmhjXM', title: 'TR-09Z — Proof of Pythagorean Theorem' },
        ]},
      },
      { type: 'prose', paragraphs: ['**Pythagorean triples** are integer solutions to $a^2 + b^2 = c^2$. The most common: 3-4-5, 5-12-13, 8-15-17. Multiples of these (6-8-10, etc.) are also triples.'] },
      { type: 'viz', id: 'VideoEmbed', title: 'TR-10: Pythagorean Triples', props: { url: 'https://www.youtube.com/embed/ZG2p4jx-i-Q' } },
      { type: 'prose', paragraphs: ['The **distance formula** between two points in the plane is derived directly from the Pythagorean theorem. In 3D space, the same idea extends to three coordinates.'] },
      { type: 'viz', id: 'VideoCarousel', title: 'Distance Between Points',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/Cy90jWCrPfo', title: 'TR-11 — Distance in a Plane' },
          { url: 'https://www.youtube.com/embed/7br1PvhFedQ', title: 'TR-12 — Distance in Space' },
        ]},
      },
    ],
  },
  math: {
    prose: ['Review the mathematical derivations covered in the video series.'],
  }
}

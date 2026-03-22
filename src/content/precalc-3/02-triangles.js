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
    prose: ['Explore the definitions and visual concepts behind this topic.'],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "TR-07: Geometry Review of Triangles",
        props: { url: "https://www.youtube.com/embed/mRqMtR1D4KE" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-07Z: First Proof Thales' Theorem",
        props: { url: "https://www.youtube.com/embed/hfr2Sp8W1uU" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-08: Similar and Congruent Triangles",
        props: { url: "https://www.youtube.com/embed/lNd-ubyTkg4" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-09: The Pythagorean Theorem",
        props: { url: "https://www.youtube.com/embed/4A9iNamXuZk" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-09Z: Proof of Pythagorean Theorem",
        props: { url: "https://www.youtube.com/embed/0M2aTzmhjXM" }
      },
      {
        id: 'VideoEmbed',
        title: "TR 10: Pythagorean Triples",
        props: { url: "https://www.youtube.com/embed/ZG2p4jx-i-Q" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-11: Distance Between Points in a Plane",
        props: { url: "https://www.youtube.com/embed/Cy90jWCrPfo" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-12: Distance Between Points in Space",
        props: { url: "https://www.youtube.com/embed/7br1PvhFedQ" }
      }
    ]
  },
  math: {
    prose: ['Review the mathematical derivations covered in the video series.']
  }
}

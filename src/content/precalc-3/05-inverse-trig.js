export default {
  id: 'precalc3-inverse-trig',
  slug: 'inverse-trig',
  chapter: 'precalc-3',
  order: 5,
  title: "Inverse Trigonometric Functions",
  subtitle: "Finding angles when you already know the ratio.",
  tags: ["inverse functions","arcsin","arccos","arctan"],
  hook: {
    question: "If you know the ratio sides of a right triangle, how do you find the exact angle?",
    realWorldContext: 'Watch the following videos step-by-step to master this concept.'
  },
  intuition: {
    prose: ['Explore the definitions and visual concepts behind this topic.'],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "TR-22: Algebra Review of Inverse Functions",
        props: { url: "https://www.youtube.com/embed/0xFUn0Dpu9M" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-23: Inverse Sine and Cosine Functions",
        props: { url: "https://www.youtube.com/embed/qNhoMj8DYaU" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-23X: Inverse Sine and Cosine Functions",
        props: { url: "https://www.youtube.com/embed/GzfoE-u5BsU" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-24: Other Inverse Trig Functions",
        props: { url: "https://www.youtube.com/embed/h8QTK6u86EQ" }
      },
      {
        id: 'VideoEmbed',
        title: "TR-25: Inverse Trig Functions on a Calculator",
        props: { url: "https://www.youtube.com/embed/em9vMyfBMzU" }
      }
    ]
  },
  math: {
    prose: ['Review the mathematical derivations covered in the video series.']
  }
}

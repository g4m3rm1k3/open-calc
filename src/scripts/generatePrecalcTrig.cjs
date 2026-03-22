const fs = require('fs');

const videos = [
  {"id":"TR-00","title":"TR-00: Introduction to Trigonometry Series by Dennis F. Davis","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/U23JMdBIJ0M\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-01","title":"TR-01: Introduction to Angles (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/OFK1SRVbkaA\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-02","title":"TR-02: Types of Angles (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/fqm95DcmJaQ\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-03","title":"TR-03: Angle Relationships (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/ZjAWq2AnZkQ\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-04","title":"TR-04: Angle Measurement in Degrees (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/gYKig6D3_Ck\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-04Z","title":"TR-04Z: Degrees Minutes and Seconds (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/eR_KZQtMvx0\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-05","title":"TR-05: Introduction to Radians (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/oJ-BbwvwQg0\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-06","title":"TR-06: Angle Measurement in Radians (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/pQya8y6YC0U\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-07","title":"TR-07: Geometry Review of Triangles (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/mRqMtR1D4KE\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-07Z","title":"TR-07Z: First Proof Thales' Theorem (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/hfr2Sp8W1uU\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-08","title":"TR-08: Similar and Congruent Triangles (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/lNd-ubyTkg4\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-09","title":"TR-09: The Pythagorean Theorem (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/4A9iNamXuZk\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-09Z","title":"TR-09Z: Proof of Pythagorean Theorem (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/0M2aTzmhjXM\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-10","title":"TR 10: Pythagorean Triples (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/ZG2p4jx-i-Q\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-11","title":"TR-11: Distance Between Points in a Plane (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/Cy90jWCrPfo\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-12","title":"TR-12: Distance Between Points in Space (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/7br1PvhFedQ\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-13","title":"TR-13: The Trigonometric Ratios (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/LvMScE93T6I\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-13Z","title":"TR-13Z: How the Co- Trig Functions got their Names","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/J5KWXgKx0MM\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-14","title":"TR-14: The Unit Circle (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/oJgBJfstOOU\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-15","title":"TR-15: Sine and Cosine of Common Angles (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/4TFLcKKmfao\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-15Z","title":"TR-15Z: Proof of the Common Sine and Cosine Values","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/i9ahDcV-bVg\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-16","title":"TR-16: Trig Functions on a Calculator (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/-kXIfRLNlUw\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-17","title":"TR-17: Most Common Use of Trigonometry (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/Z3PB_l2PRjc\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-18","title":"TR-18: Graphing Sine and Cosine (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/f99P31SAsek\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-19","title":"TR-19: Graphing Tangent and Cotangent (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/p14y-9xPVgk\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-20","title":"TR-20: Graphing Secant and Cosecant (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/UZA34UL_mUE\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-21","title":"TR-21: Domain and Range of Trig Functions (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/NEoG0esRWFo\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-22","title":"TR-22: Algebra Review of Inverse Functions (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/0xFUn0Dpu9M\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-23","title":"TR-23: Inverse Sine and Cosine Functions (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/qNhoMj8DYaU\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-23X","title":"TR-23X: Inverse Sine and Cosine Functions (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/GzfoE-u5BsU\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-24","title":"TR-24: Other Inverse Trig Functions (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/h8QTK6u86EQ\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-25","title":"TR-25: Inverse Trig Functions on a Calculator (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/em9vMyfBMzU\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-26","title":"TR-26: Solving Right Triangles (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/CE_7EZNcG2s\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-27","title":"TR-27: Triangle Types to Solve (Trigonometry Series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/kuEr6xq7c1A\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-28","title":"TR-28: The Law of Sines (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/TzsKsxLuwgo\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-29","title":"TR-29: The Law of Cosines (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/4yo5nlTtjB8\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-29Z","title":"TR-29Z: Proof of the Law of Cosines","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/tlmH_kY9DHg\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-30","title":"TR-30: SSA Triangles Overview (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/o_t0qqzqqZ4\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-31","title":"TR-31: Solving SSA Triangles (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/NQSPgObl80M\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-32","title":"TR-32: Intro to Identities and Proofs (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/8F3zdi_a-PM\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-33","title":"TR-33: Pythagorean Trig Identities (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/N-LP9O81yn4\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-33Z","title":"TR-33Z: All Trig Functions on the Unit Circle (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/LNBZ0bP4SHk\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-34","title":"TR-34:  Using Pythagorean Identities (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/B3JOQxj_MGs\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-35","title":"TR-35: Using Conjugate Identities in Trig Proofs (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/db0GxUtyqjA\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-36","title":"TR-36 - Even and Odd Trig Functions (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/q5tuzPASVaY\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-37","title":"TR-37: More Trig Reflections (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/RgusdNG5Luo\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-38","title":"TR-38: Angle Sum and Difference Identities (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/lw7UJRNJIzc\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-39","title":"TR-39: Using Sum and Diff Identities (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/Xoen_m4KUgs\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-40","title":"TR-40: Double Angle Identities (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/DCr6yqJfYiY\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-41","title":"TR-41: Half Angle Identities (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/Hxox4DpW4wc\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-42","title":"TR-42: Trig Graph Variations (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/mFmPAL_5I4E\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-43","title":"TR-43: Trig Graph Variations 2 (Trigonometry series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/RdIiaGH-KtQ\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-44","title":"TR-44: Trig Graph Variations 3","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/LESdCLdTHVg\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-45","title":"TR-45: Polar Coordinates (Trigonometry Series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/KecTlKRK0HQ\" frameborder=\"0\" allowfullscreen></iframe>"},
  {"id":"TR-46","title":"TR-46: Polar Equations (Trigonometry Series by Dennis F. Davis)","embedCode":"<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/B1z8pcyGkIQ\" frameborder=\"0\" allowfullscreen></iframe>"}
];

const lessonsInfo = [
  {
    fileName: '01-angles.js',
    slug: 'angles',
    title: 'Introduction to Angles',
    subtitle: 'Understanding angle measurement in Degrees and Radians',
    tags: ['angles', 'radians', 'degrees'],
    hook: 'How do we measure rotation mathematically?',
    vids: ['TR-00', 'TR-01', 'TR-02', 'TR-03', 'TR-04', 'TR-04Z', 'TR-05', 'TR-06']
  },
  {
    fileName: '02-triangles.js',
    slug: 'triangles',
    title: 'Triangles & Geometry',
    subtitle: 'A review of triangular geometry, the Pythagorean Theorem, and distance.',
    tags: ['geometry', 'triangles', 'pythagorean'],
    hook: 'How does the geometry of triangles build the foundation for trigonometry?',
    vids: ['TR-07', 'TR-07Z', 'TR-08', 'TR-09', 'TR-09Z', 'TR-10', 'TR-11', 'TR-12']
  },
  {
    fileName: '03-trig-ratios-unit-circle.js',
    slug: 'trig-ratios-unit-circle',
    title: 'Trig Ratios & The Unit Circle',
    subtitle: 'Defining sine, cosine, tangent and exploring their relationship on the unit circle.',
    tags: ['unit circle', 'sine', 'cosine', 'tangent'],
    hook: 'What do the trigonometric functions actually represent?',
    vids: ['TR-13', 'TR-13Z', 'TR-14', 'TR-15', 'TR-15Z']
  },
  {
    fileName: '04-trig-graphs.js',
    slug: 'trig-graphs',
    title: 'Graphing Trigonometric Functions',
    subtitle: 'Visualizing the wave-like periodic nature of trigonometric functions.',
    tags: ['graphs', 'sine wave', 'period', 'amplitude'],
    hook: 'How do we graph waves mapping to circles?',
    vids: ['TR-16', 'TR-17', 'TR-18', 'TR-19', 'TR-20', 'TR-21', 'TR-42', 'TR-43', 'TR-44']
  },
  {
    fileName: '05-inverse-trig.js',
    slug: 'inverse-trig',
    title: 'Inverse Trigonometric Functions',
    subtitle: 'Finding angles when you already know the ratio.',
    tags: ['inverse functions', 'arcsin', 'arccos', 'arctan'],
    hook: 'If you know the ratio sides of a right triangle, how do you find the exact angle?',
    vids: ['TR-22', 'TR-23', 'TR-23X', 'TR-24', 'TR-25']
  },
  {
    fileName: '06-solving-triangles.js',
    slug: 'solving-triangles',
    title: 'Solving Triangles',
    subtitle: 'Applications of the Law of Sines and the Law of Cosines',
    tags: ['law of sines', 'law of cosines', 'ssa triangles'],
    hook: 'How do you solve non-right triangles?',
    vids: ['TR-26', 'TR-27', 'TR-28', 'TR-29', 'TR-29Z', 'TR-30', 'TR-31']
  },
  {
    fileName: '07-identities-proofs.js',
    slug: 'identities-proofs',
    title: 'Trigonometric Identities & Proofs',
    subtitle: 'Manipulating identities to simplify expressions and prove trigonometric properties.',
    tags: ['identities', 'proofs', 'pythagorean identity', 'double angle'],
    hook: 'How can we rewrite complex trigonometric expressions into simpler ones?',
    vids: ['TR-32', 'TR-33', 'TR-33Z', 'TR-34', 'TR-35', 'TR-36', 'TR-37', 'TR-38', 'TR-39', 'TR-40', 'TR-41']
  },
  {
    fileName: '08-polar-coordinates.js',
    slug: 'polar-coordinates',
    title: 'Polar Coordinates',
    subtitle: 'Navigating the 2D plane through angle and radius.',
    tags: ['polar coordinates', 'graphs'],
    hook: 'What if we locate positions using angles instead of XY grids?',
    vids: ['TR-45', 'TR-46']
  }
];

let indexImports = '';
let indexArray = '';

lessonsInfo.forEach((lesson, idx) => {
  const fileContent = `export default {
  id: 'precalc3-${lesson.slug}',
  slug: '${lesson.slug}',
  chapter: 'precalc-3',
  order: ${idx + 1},
  title: ${JSON.stringify(lesson.title)},
  subtitle: ${JSON.stringify(lesson.subtitle)},
  tags: ${JSON.stringify(lesson.tags)},
  hook: {
    question: ${JSON.stringify(lesson.hook)},
    realWorldContext: 'Watch the following videos step-by-step to master this concept.'
  },
  intuition: {
    prose: ['Explore the definitions and visual concepts behind this topic.'],
    visualizations: [
${lesson.vids.map((vidId, i) => {
  const v = videos.find(x => x.id === vidId);
  let src = '';
  if(v) {
    const match = v.embedCode.match(/src="([^"]+)"/);
    if(match) src = match[1];
  }
  const cleanTitle = (v ? v.title : '').replace(/\s*\(?Trigonometry [Ss]eries by Dennis F\. Davis\)?\s*/g, '').trim();
  return `      {
        id: 'VideoEmbed',
        title: ${JSON.stringify(cleanTitle)},
        props: { url: ${JSON.stringify(src)} }
      }`;
}).join(',\\n')}
    ]
  },
  math: {
    prose: ['Review the mathematical derivations covered in the video series.']
  }
}
`;

  fs.writeFileSync(`src/content/precalc-3/${lesson.fileName}`, fileContent);
  const varName = lesson.slug.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('');
  indexImports += `import ${varName} from './${lesson.fileName}'\n`;
  indexArray += `    ${varName},\n`;
});

const indexContent = `${indexImports}
export default {
  id: 'precalc-3',
  number: 'precalc-3',
  title: 'Trigonometry',
  slug: 'trigonometry',
  description: 'A comprehensive journey through Trigonometry, from basic angles and geometry to the Unit Circle, graphing, identities, and polar coordinates. This directly powers the tools needed for Calculus.',
  color: 'sky',
  lessons: [
${indexArray}
  ],
}
`;

fs.writeFileSync('src/content/precalc-3/index.js', indexContent);

console.log('Precalc 3 Trig structural files generated.');

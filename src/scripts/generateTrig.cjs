const fs = require('fs');

const videos = [
  {
    "title": "TR-00: Introduction to Trigonometry Series by Dennis F. Davis",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/U23JMdBIJ0M\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-01: Introduction to Angles (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/OFK1SRVbkaA\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-02: Types of Angles (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/fqm95DcmJaQ\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-03: Angle Relationships (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/ZjAWq2AnZkQ\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-04: Angle Measurement in Degrees (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/gYKig6D3_Ck\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-04Z: Degrees Minutes and Seconds (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/eR_KZQtMvx0\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-05: Introduction to Radians (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/oJ-BbwvwQg0\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-06: Angle Measurement in Radians (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/pQya8y6YC0U\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-07: Geometry Review of Triangles (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/mRqMtR1D4KE\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-07Z: First Proof Thales' Theorem (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/hfr2Sp8W1uU\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-08: Similar and Congruent Triangles (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/lNd-ubyTkg4\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-09: The Pythagorean Theorem (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/4A9iNamXuZk\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-09Z: Proof of Pythagorean Theorem (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/0M2aTzmhjXM\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR 10: Pythagorean Triples (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/ZG2p4jx-i-Q\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-11: Distance Between Points in a Plane (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/Cy90jWCrPfo\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-12: Distance Between Points in Space (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/7br1PvhFedQ\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-13: The Trigonometric Ratios (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/LvMScE93T6I\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-13Z: How the Co- Trig Functions got their Names",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/J5KWXgKx0MM\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-14: The Unit Circle (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/oJgBJfstOOU\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-15: Sine and Cosine of Common Angles (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/4TFLcKKmfao\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-15Z: Proof of the Common Sine and Cosine Values",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/i9ahDcV-bVg\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-16: Trig Functions on a Calculator (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/-kXIfRLNlUw\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-17: Most Common Use of Trigonometry (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/Z3PB_l2PRjc\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-18: Graphing Sine and Cosine (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/f99P31SAsek\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-19: Graphing Tangent and Cotangent (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/p14y-9xPVgk\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-20: Graphing Secant and Cosecant (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/UZA34UL_mUE\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-21: Domain and Range of Trig Functions (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/NEoG0esRWFo\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-22: Algebra Review of Inverse Functions (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/0xFUn0Dpu9M\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-23: Inverse Sine and Cosine Functions (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/qNhoMj8DYaU\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-23X: Inverse Sine and Cosine Functions (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/GzfoE-u5BsU\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-24: Other Inverse Trig Functions (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/h8QTK6u86EQ\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-25: Inverse Trig Functions on a Calculator (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/em9vMyfBMzU\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-26: Solving Right Triangles (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/CE_7EZNcG2s\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-27: Triangle Types to Solve (Trigonometry Series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/kuEr6xq7c1A\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-28: The Law of Sines (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/TzsKsxLuwgo\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-29: The Law of Cosines (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/4yo5nlTtjB8\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-29Z: Proof of the Law of Cosines",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/tlmH_kY9DHg\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-30: SSA Triangles Overview (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/o_t0qqzqqZ4\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-31: Solving SSA Triangles (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/NQSPgObl80M\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-32: Intro to Identities and Proofs (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/8F3zdi_a-PM\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-33: Pythagorean Trig Identities (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/N-LP9O81yn4\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-33Z: All Trig Functions on the Unit Circle (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/LNBZ0bP4SHk\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-34:  Using Pythagorean Identities (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/B3JOQxj_MGs\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-35: Using Conjugate Identities in Trig Proofs (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/db0GxUtyqjA\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-36 - Even and Odd Trig Functions (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/q5tuzPASVaY\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-37: More Trig Reflections (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/RgusdNG5Luo\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-38: Angle Sum and Difference Identities (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/lw7UJRNJIzc\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-39: Using Sum and Diff Identities (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/Xoen_m4KUgs\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-40: Double Angle Identities (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/DCr6yqJfYiY\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-41: Half Angle Identities (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/Hxox4DpW4wc\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-42: Trig Graph Variations (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/mFmPAL_5I4E\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-43: Trig Graph Variations 2 (Trigonometry series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/RdIiaGH-KtQ\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-44: Trig Graph Variations 3",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/LESdCLdTHVg\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-45: Polar Coordinates (Trigonometry Series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/KecTlKRK0HQ\" frameborder=\"0\" allowfullscreen></iframe>"
  },
  {
    "title": "TR-46: Polar Equations (Trigonometry Series by Dennis F. Davis)",
    "embedCode": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/B1z8pcyGkIQ\" frameborder=\"0\" allowfullscreen></iframe>"
  }
];

let output = `export default {
  id: 'ch0-complete-trig',
  slug: 'complete-trigonometry',
  chapter: 0,
  order: 9,
  title: 'Complete Trigonometry Course',
  subtitle: 'A full video series covering all trigonometry concepts from angles to polar coordinates.',
  tags: ['trigonometry', 'angles', 'triangles', 'unit circle', 'identities', 'polar coordinates'],
  hook: {
    question: 'Need a full walkthrough of Trigonometry?',
    realWorldContext: 'This module contains a comprehensive video series that will take you through every aspect of Trigonometry you will need for Calculus and beyond. Use it as a complete course or reference it whenever you get stuck later on.'
  },
  intuition: {
    prose: [
      "Trigonometry is the study of relationships between angles and lengths of triangles, beautifully expanding into the general study of periodic functions and circles.",
      "The following video series covers everything from basic angle definitions to complex trigonometric identities and polar coordinates."
    ],
    visualizations: [
`;

for (let i = 0; i < videos.length; i++) {
  const v = videos[i];
  let src = '';
  const match = v.embedCode.match(/src="([^"]+)"/);
  if (match) src = match[1];
  
  output += `      {
        id: 'VideoEmbed',
        title: ${JSON.stringify(v.title.replace(' (Trigonometry series by Dennis F. Davis)', '').replace(' (Trigonometry Series by Dennis F. Davis)', ''))},
        props: { url: ${JSON.stringify(src)} }
      }${i === videos.length - 1 ? '' : ','}\n`;
}

output += `    ]
  },
  math: {
    prose: [
      "The formal mathematics of trigonometry underpins so much of calculus, from taking derivatives of sine and cosine, to using trigonometric substitution for complex integrals."
    ]
  },
  rigor: {
    prose: [
      "If you want to read formal proofs for multiple trigonometric properties, this video series includes many dedicated proofs—like the Law of Cosines, sum and difference identities, and Pythagorean properties."
    ]
  }
}
`;

fs.writeFileSync('src/content/chapter-0/09-complete-trigonometry.js', output, 'utf8');
console.log('File created: src/content/chapter-0/09-complete-trigonometry.js');

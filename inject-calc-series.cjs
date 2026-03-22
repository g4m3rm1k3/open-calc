const fs = require('fs');
const path = require('path');

const newVideos = [
  { "title": "Calculus I - 0.0 Review of Factoring", "embedCode": "https://www.youtube.com/embed/LmFz8H6FrD0" },
  { "title": "Calculus I - 0.1 Graphs", "embedCode": "https://www.youtube.com/embed/LWuN4IX9dEE" },
  { "title": "Calculus I - 0.2 Linear Models and Rates of Change", "embedCode": "https://www.youtube.com/embed/AnJlHSVOXTk" },
  { "title": "Calculus I - 0.3 Functions and Their Graphs", "embedCode": "https://www.youtube.com/embed/DKLYIiqjKEc" },
  { "title": "Calculus I - 0.4.1 Review of Trigonometric Functions", "embedCode": "https://www.youtube.com/embed/wwykal6Ms_g" },
  { "title": "Calculus I - 0.4.2 Solving Trigonometric Equations", "embedCode": "https://www.youtube.com/embed/SSsu_24dss4" },
  { "title": "Calculus I - 0.4.3 Graphs of Trigonometric Functions", "embedCode": "https://www.youtube.com/embed/dJ2dl9KQ-B0" },
  { "title": "Calculus I - 1.1.1 A Preview of Calculus", "embedCode": "https://www.youtube.com/embed/2-eZ6wkZrh8" },
  { "title": "Calculus I - 1.2.1 Finding Limits Numerically and Graphically", "embedCode": "https://www.youtube.com/embed/tQCtDc3D0Ls" },
  { "title": "Calculus I - 1.2.2 Limits That Fail to Exist", "embedCode": "https://www.youtube.com/embed/HVHDuFSy7TQ" },
  { "title": "Calculus I - 1.2.3 The Epsilon-Delta Limit Definition", "embedCode": "https://www.youtube.com/embed/x0Jx5IC-IRI" },
  { "title": "Calculus I - 1.3.1 Properties of Limits", "embedCode": "https://www.youtube.com/embed/98gn6FBSHAk" },
  { "title": "Calculus I - 1.3.2 Finding Limits of Indeterminant Form Functions", "embedCode": "https://www.youtube.com/embed/gaSwzp7qp5k" },
  { "title": "Calculus I - 1.4.1 Continuity", "embedCode": "https://www.youtube.com/embed/j8bdlwYNwe8" },
  { "title": "Calculus I - 1.4.2 Properties of Continuity", "embedCode": "https://www.youtube.com/embed/3j3439F_yIY" },
  { "title": "Calculus I - 1.4.3 The Intermediate Value Theorem", "embedCode": "https://www.youtube.com/embed/U4ybtvvZKS0" },
  { "title": "Calculus I - 1.5.1 Infinite Limits and Their Properties", "embedCode": "https://www.youtube.com/embed/tcgRbvChHPw" },
  { "title": "Calculus I - 1.5.2 Vertical Asymptotes", "embedCode": "https://www.youtube.com/embed/btWKhXFTcPQ" },
  { "title": "Calculus I - 2.1.1 The Slope of the Tangent Line Using the Definition of Slope", "embedCode": "https://www.youtube.com/embed/foJyD3g8mLw" },
  { "title": "Calculus I - 2.1.2 The Derivative Using the Definition of a Derivative", "embedCode": "https://www.youtube.com/embed/tyoukQr2_ck" },
  { "title": "Calculus I - 2.2.1 Basic Differentiation Rules", "embedCode": "https://www.youtube.com/embed/Vx_81lSo6Pk" },
  { "title": "Calculus I - 2.2.2 Applying the Derivative to the Position Function", "embedCode": "https://www.youtube.com/embed/fZj7VhywNmE" },
  { "title": "Calculus I -2.3.1 The Product and Quotient Rules for Derivatives", "embedCode": "https://www.youtube.com/embed/L66FBwEF8vc" },
  { "title": "Calculus I - 2.3.2 Trigonometric and Higher-Order Derivatives", "embedCode": "https://www.youtube.com/embed/cHaZmLIyWjg" },
  { "title": "Calculus I - 2.4.1 The Chain Rule and General Power Rule", "embedCode": "https://www.youtube.com/embed/Ptz1fa8lLyg" },
  { "title": "Calculus I - 2.4.2 Differentiation Strategies and Practice", "embedCode": "https://www.youtube.com/embed/IOOuXYCoQ4I" },
  { "title": "Calculus I - 2.5.1 Implicit Differentiation", "embedCode": "https://www.youtube.com/embed/0BmSo_M3iKo" },
  { "title": "Calculus I - 2.6.1 Related Rates - Modeling with Circles", "embedCode": "https://www.youtube.com/embed/2s7SOe3tSKI" },
  { "title": "Calculus I - 2.6.2 Related Rates - Modeling with Triangles", "embedCode": "https://www.youtube.com/embed/EqVOHGAXnpY" },
  { "title": "Calculus I - 3.1.1 Relative and Absolute Extrema", "embedCode": "https://www.youtube.com/embed/BfJauiDEc_M" },
  { "title": "Calculus I - 3.1.2 Critical Numbers and Extrema", "embedCode": "https://www.youtube.com/embed/kjunIwj2sv0" },
  { "title": "Calculus I - 3.2.1 Rolle's Theorem", "embedCode": "https://www.youtube.com/embed/xG7V6x8HSXg" },
  { "title": "Calculus I - 3.2.2 The Mean Value Theorem", "embedCode": "https://www.youtube.com/embed/dg4SuoKxk3g" },
  { "title": "Calculus I - 3.3.1 Increasing and Decreasing Functions", "embedCode": "https://www.youtube.com/embed/0JlO_zHCajM" },
  { "title": "Calculus I - 3.3.2 The First Derivative Test", "embedCode": "https://www.youtube.com/embed/ySpumpFbVlU" },
  { "title": "Calculus I - 3.4.1 Intervals of Concavity and Points of Inflection", "embedCode": "https://www.youtube.com/embed/B9xZ8len2gQ" },
  { "title": "Calculus I - 3.4.2 The Second Derivative Test", "embedCode": "https://www.youtube.com/embed/q5DlN-7dppY" },
  { "title": "Calculus I - 3.5.1 Limits at Infinity", "embedCode": "https://www.youtube.com/embed/NLYMsgDykOk" },
  { "title": "Calculus I - 3.5.2 Horizontal Asymptotes and Computational Techniques", "embedCode": "https://www.youtube.com/embed/km6-zDe0zJY" },
  { "title": "Calculus I - 3.6.1 Curve Sketching Using Graph Attributes", "embedCode": "https://www.youtube.com/embed/F8aXjLq4nuA" },
  { "title": "Calculus I - 3.6.2 Curve Sketching Using Derivatives", "embedCode": "https://www.youtube.com/embed/uMdP-VTEC38" },
  { "title": "Calculus I - 3.7.1 Optimization", "embedCode": "https://www.youtube.com/embed/W6FYEfsShm0" },
  { "title": "Calculus I - 3.7.2 Optimization Practice", "embedCode": "https://www.youtube.com/embed/bwLD4nEPN_8" },
  { "title": "Calculus - 3.9.1 Tangent Line Approximation and Differentials", "embedCode": "https://www.youtube.com/embed/lUs7DlfTpgM" },
  { "title": "Calculus - 3.9.2 Propagated and Relative Error in Differentials", "embedCode": "https://www.youtube.com/embed/FuX0i5dGmzI" },
  { "title": "Calculus I - 4.1.1 Antiderivatives and the General Solution to a Differential Equation", "embedCode": "https://www.youtube.com/embed/1e4KTBlQ-Yc" },
  { "title": "Calculus I - 4.1.2 Initial Conditions and the Particular Solution to a Differential Equation", "embedCode": "https://www.youtube.com/embed/HHYVGhHiiu0" },
  { "title": "Calculus I - 4.2.1 Sigma Notation and Summation Formulas", "embedCode": "https://www.youtube.com/embed/hWZp1ld9184" },
  { "title": "Calculus I - 4.2.2 Approximating the Area Under a Curve", "embedCode": "https://www.youtube.com/embed/yaSOGR0xb90" },
  { "title": "Calculus I - 4.2.3 Find the Area Under a Curve Using the Limit Definition", "embedCode": "https://www.youtube.com/embed/m-6psP0zwzw" },
  { "title": "Calculus I - 4.3.1 Riemann Sums and Definite Integrals Defined", "embedCode": "https://www.youtube.com/embed/8W3gEuaj_0s" },
  { "title": "Calculus I - 4.3.2 Evaluating Definite Integrals Without the FTC", "embedCode": "https://www.youtube.com/embed/yx0xTkdrYK8" },
  { "title": "Calculus I - 4.4.1 The Fundamental Theorem of Calculus", "embedCode": "https://www.youtube.com/embed/yfi5HUf9154" },
  { "title": "Calculus I - 4.4.2 The Mean Value Theorem for Integrals and the Average Value of a Function", "embedCode": "https://www.youtube.com/embed/PqLgoyzgi40" },
  { "title": "Calculus I - 4.4.3 The Second Fundamental Theorem of Calculus", "embedCode": "https://www.youtube.com/embed/ovAzNQs-GEE" },
  { "title": "Calculus I - 4.5.1 Integration by Substitution: Indefinite Integrals", "embedCode": "https://www.youtube.com/embed/4bflZuXoQ0s" },
  { "title": "Calculus I - 4.5.2 Integration by Substitution: Definite Integrals", "embedCode": "https://www.youtube.com/embed/lBMJdzRMgu4" },
  { "title": "Calculus I - 5.1.1 Review: Logarithmic and Exponential Functions", "embedCode": "https://www.youtube.com/embed/rFhfPzdo_2A" },
  { "title": "Calculus I - 5.1.2 The Natural Logarithmic Function: Differentiation", "embedCode": "https://www.youtube.com/embed/A0fzikOCTi8" },
  { "title": "Calculus I - 5.2.1 The Natural Logarithmic Function: Integration", "embedCode": "https://www.youtube.com/embed/Bh1nhf4a04o" },
  { "title": "Calculus I - 5.2.2 Natural Logarithmic Integration: Difficult Examples", "embedCode": "https://www.youtube.com/embed/6ctiDVmcEWo" },
  { "title": "Calculus I - 5.3.1 The Inverse of a Function", "embedCode": "https://www.youtube.com/embed/YN8WzBCFLgQ" },
  { "title": "Calculus I - 5.3.2 The Derivative of The Inverse of a Function", "embedCode": "https://www.youtube.com/embed/xZ6YgEZufLQ" },
  { "title": "Calculus I - 5.4.1 Derivatives and Integrals of the Natural Exponential Function", "embedCode": "https://www.youtube.com/embed/ZeG2pTnj06M" },
  { "title": "Calculus I - 5.5.1 Logarithmic and Exponential Functions: Derivatives and Integrals (Base not e)", "embedCode": "https://www.youtube.com/embed/j5Y8b-f9B28" },
  { "title": "Calculus I - 5.6.1 Indeterminant Forms and L’Hopital’s Rule", "embedCode": "https://www.youtube.com/embed/nspCbwCFZaI" },
  { "title": "Calculus I - 5.7.1 Review: Inverse Trigonometric Functions", "embedCode": "https://www.youtube.com/embed/OMOBHc7Ct_Y" },
  { "title": "Calculus I - 5.7.2 Inverse Trigonometric Functions: Differentiation", "embedCode": "https://www.youtube.com/embed/xoBwEFKVHKE" },
  { "title": "Calculus I - 5.8.1 Inverse Trigonometric Functions: Integration", "embedCode": "https://www.youtube.com/embed/Fd7incsGR74" },
  { "title": "Calculus I Final Exam Review", "embedCode": "https://www.youtube.com/embed/5Z7uZ4t_5dQ" }
];

const mappings = {
  "Calculus I - 0.0 Review of Factoring": ["src/content/chapter-0/01b-algebraic-techniques.js", "src/content/chapter-0/01-functions.js"],
  "Calculus I - 0.1 Graphs": ["src/content/chapter-0/01-functions.js"],
  "Calculus I - 0.2 Linear Models and Rates of Change": ["src/content/chapter-0/01-functions.js"],
  "Calculus I - 0.3 Functions and Their Graphs": ["src/content/chapter-0/01-functions.js"],
  "Calculus I - 0.4.1 Review of Trigonometric Functions": ["src/content/chapter-0/02-trig-review.js"],
  "Calculus I - 0.4.2 Solving Trigonometric Equations": ["src/content/chapter-0/02-trig-review.js"],
  "Calculus I - 0.4.3 Graphs of Trigonometric Functions": ["src/content/chapter-0/02-trig-review.js"],
  "Calculus I - 1.1.1 A Preview of Calculus": ["src/content/chapter-1/00-intro-limits.js"],
  "Calculus I - 1.2.1 Finding Limits Numerically and Graphically": ["src/content/chapter-1/00-intro-limits.js", "src/content/chapter-1/01-limit-laws.js"],
  "Calculus I - 1.2.2 Limits That Fail to Exist": ["src/content/chapter-1/00-intro-limits.js", "src/content/chapter-1/02-continuity.js"],
  "Calculus I - 1.2.3 The Epsilon-Delta Limit Definition": ["src/content/chapter-1/03-epsilon-delta.js"],
  "Calculus I - 1.3.1 Properties of Limits": ["src/content/chapter-1/01-limit-laws.js"],
  "Calculus I - 1.3.2 Finding Limits of Indeterminant Form Functions": ["src/content/chapter-1/01-limit-laws.js"],
  "Calculus I - 1.4.1 Continuity": ["src/content/chapter-1/02-continuity.js"],
  "Calculus I - 1.4.2 Properties of Continuity": ["src/content/chapter-1/02-continuity.js"],
  "Calculus I - 1.4.3 The Intermediate Value Theorem": ["src/content/chapter-1/02a-intermediate-value-theorem.js", "src/content/chapter-1/02-continuity.js"],
  "Calculus I - 1.5.1 Infinite Limits and Their Properties": ["src/content/chapter-1/05-limits-at-infinity.js"],
  "Calculus I - 1.5.2 Vertical Asymptotes": ["src/content/chapter-1/05-limits-at-infinity.js"],
  "Calculus I - 2.1.1 The Slope of the Tangent Line Using the Definition of Slope": ["src/content/chapter-2/00-tangent-problem.js"],
  "Calculus I - 2.1.2 The Derivative Using the Definition of a Derivative": ["src/content/chapter-2/00-tangent-problem.js"],
  "Calculus I - 2.2.1 Basic Differentiation Rules": ["src/content/chapter-2/01-differentiation-rules.js"],
  "Calculus I - 2.2.2 Applying the Derivative to the Position Function": ["src/content/chapter-2/01-differentiation-rules.js"],
  "Calculus I -2.3.1 The Product and Quotient Rules for Derivatives": ["src/content/chapter-2/01-differentiation-rules.js"],
  "Calculus I - 2.3.2 Trigonometric and Higher-Order Derivatives": ["src/content/chapter-2/03-trig-derivatives.js"],
  "Calculus I - 2.4.1 The Chain Rule and General Power Rule": ["src/content/chapter-2/02-chain-rule.js"],
  "Calculus I - 2.4.2 Differentiation Strategies and Practice": ["src/content/chapter-2/02-chain-rule.js"],
  "Calculus I - 2.5.1 Implicit Differentiation": ["src/content/chapter-2/05-implicit-differentiation.js"],
  "Calculus I - 2.6.1 Related Rates - Modeling with Circles": ["src/content/chapter-3/00-related-rates.js"],
  "Calculus I - 2.6.2 Related Rates - Modeling with Triangles": ["src/content/chapter-3/00-related-rates.js"],
  "Calculus I - 3.1.1 Relative and Absolute Extrema": ["src/content/chapter-3/04-optimization.js", "src/content/chapter-3/03-curve-sketching.js"],
  "Calculus I - 3.1.2 Critical Numbers and Extrema": ["src/content/chapter-3/03-curve-sketching.js", "src/content/chapter-3/04-optimization.js"],
  "Calculus I - 3.2.1 Rolle's Theorem": ["src/content/chapter-3/02a-rolles-theorem.js", "src/content/chapter-3/02-mean-value-theorem.js"],
  "Calculus I - 3.2.2 The Mean Value Theorem": ["src/content/chapter-3/02-mean-value-theorem.js"],
  "Calculus I - 3.3.1 Increasing and Decreasing Functions": ["src/content/chapter-3/03-curve-sketching.js"],
  "Calculus I - 3.3.2 The First Derivative Test": ["src/content/chapter-3/03-curve-sketching.js"],
  "Calculus I - 3.4.1 Intervals of Concavity and Points of Inflection": ["src/content/chapter-3/03-curve-sketching.js"],
  "Calculus I - 3.4.2 The Second Derivative Test": ["src/content/chapter-3/03-curve-sketching.js"],
  "Calculus I - 3.5.1 Limits at Infinity": ["src/content/chapter-1/05-limits-at-infinity.js"],
  "Calculus I - 3.5.2 Horizontal Asymptotes and Computational Techniques": ["src/content/chapter-1/05-limits-at-infinity.js"],
  "Calculus I - 3.6.1 Curve Sketching Using Graph Attributes": ["src/content/chapter-3/03-curve-sketching.js"],
  "Calculus I - 3.6.2 Curve Sketching Using Derivatives": ["src/content/chapter-3/03-curve-sketching.js"],
  "Calculus I - 3.7.1 Optimization": ["src/content/chapter-3/04-optimization.js"],
  "Calculus I - 3.7.2 Optimization Practice": ["src/content/chapter-3/04-optimization.js"],
  "Calculus - 3.9.1 Tangent Line Approximation and Differentials": ["src/content/chapter-3/01-linear-approximation.js"],
  "Calculus - 3.9.2 Propagated and Relative Error in Differentials": ["src/content/chapter-3/07-differentials.js", "src/content/chapter-3/01-linear-approximation.js"],
  "Calculus I - 4.1.1 Antiderivatives and the General Solution to a Differential Equation": ["src/content/chapter-4/04-indefinite-integrals.js"],
  "Calculus I - 4.1.2 Initial Conditions and the Particular Solution to a Differential Equation": ["src/content/chapter-4/04-indefinite-integrals.js"],
  "Calculus I - 4.2.1 Sigma Notation and Summation Formulas": ["src/content/chapter-4/01-riemann-sums.js"],
  "Calculus I - 4.2.2 Approximating the Area Under a Curve": ["src/content/chapter-4/01-riemann-sums.js"],
  "Calculus I - 4.2.3 Find the Area Under a Curve Using the Limit Definition": ["src/content/chapter-4/01-riemann-sums.js"],
  "Calculus I - 4.3.1 Riemann Sums and Definite Integrals Defined": ["src/content/chapter-4/02-definite-integral.js"],
  "Calculus I - 4.3.2 Evaluating Definite Integrals Without the FTC": ["src/content/chapter-4/02-definite-integral.js"],
  "Calculus I - 4.4.1 The Fundamental Theorem of Calculus": ["src/content/chapter-4/03-fundamental-theorem.js"],
  "Calculus I - 4.4.2 The Mean Value Theorem for Integrals and the Average Value of a Function": ["src/content/chapter-4/05-applications.js", "src/content/chapter-4/03-fundamental-theorem.js"],
  "Calculus I - 4.4.3 The Second Fundamental Theorem of Calculus": ["src/content/chapter-4/03-fundamental-theorem.js"],
  "Calculus I - 4.5.1 Integration by Substitution: Indefinite Integrals": ["src/content/chapter-4/06-u-substitution.js"],
  "Calculus I - 4.5.2 Integration by Substitution: Definite Integrals": ["src/content/chapter-4/06-u-substitution.js"],
  "Calculus I - 5.1.1 Review: Logarithmic and Exponential Functions": ["src/content/chapter-0/03-exponentials.js"],
  "Calculus I - 5.1.2 The Natural Logarithmic Function: Differentiation": ["src/content/chapter-2/04-exp-log-derivatives.js"],
  "Calculus I - 5.2.1 The Natural Logarithmic Function: Integration": ["src/content/chapter-4/04-indefinite-integrals.js", "src/content/chapter-4/06-u-substitution.js"],
  "Calculus I - 5.2.2 Natural Logarithmic Integration: Difficult Examples": ["src/content/chapter-4/06-u-substitution.js"],
  "Calculus I - 5.3.1 The Inverse of a Function": ["src/content/chapter-0/01-functions.js"],
  "Calculus I - 5.3.2 The Derivative of The Inverse of a Function": ["src/content/chapter-2/02-derivatives-of-inverse-functions.js", "src/content/chapter-2/02-chain-rule.js"],
  "Calculus I - 5.4.1 Derivatives and Integrals of the Natural Exponential Function": ["src/content/chapter-2/04-exp-log-derivatives.js", "src/content/chapter-4/04-indefinite-integrals.js"],
  "Calculus I - 5.5.1 Logarithmic and Exponential Functions: Derivatives and Integrals (Base not e)": ["src/content/chapter-2/04-exp-log-derivatives.js"],
  "Calculus I - 5.6.1 Indeterminant Forms and L’Hopital’s Rule": ["src/content/chapter-3/05-lhopital.js"],
  "Calculus I - 5.7.1 Review: Inverse Trigonometric Functions": ["src/content/chapter-0/02-trig-review.js"],
  "Calculus I - 5.7.2 Inverse Trigonometric Functions: Differentiation": ["src/content/chapter-2/03-trig-derivatives.js"],
  "Calculus I - 5.8.1 Inverse Trigonometric Functions: Integration": ["src/content/chapter-4/09-trig-substitution.js", "src/content/chapter-4/08-trig-integrals.js"],
  "Calculus I Final Exam Review": ["src/content/chapter-4/05-applications.js", "src/content/chapter-3/04-optimization.js"]
};

function injectVideo(targetPath, videoObj) {
    if (!fs.existsSync(targetPath)) return;
    let content = fs.readFileSync(targetPath, 'utf8');

    // Make sure we have a clean embed code, stripping any iframe tags if they existed
    let url = videoObj.embedCode;
    const match = url.match(/src="([^"]+)"/);
    if (match) url = match[1];

    const injectStr = `{\n        id: 'VideoEmbed',\n        title: "${videoObj.title.replace(/"/g, '\\"')}",\n        props: { url: "${url}" }\n      },`;

    // Only inject if not already there
    if (content.includes(videoObj.title)) {
       return; 
    }

    if (content.includes('visualizations: [')) {
        content = content.replace(/visualizations:\s*\[/, `visualizations: [\n      ${injectStr}`);
    } else if (content.includes('intuition: {')) {
        content = content.replace(/intuition:\s*\{/, `intuition: {\n    visualizations: [\n      ${injectStr}\n    ],`);
    }

    fs.writeFileSync(targetPath, content, 'utf8');
    console.log("Injected:", videoObj.title, "into", targetPath);
}

newVideos.forEach(v => {
    const targets = mappings[v.title] || [];
    targets.forEach(t => injectVideo(t, v));
});

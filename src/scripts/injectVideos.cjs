const fs = require('fs');
const path = require('path');

const videos = [
  {"title": "The Velocity Problem | Part I: Numerically", "file": "src/content/chapter-1/00-intro-limits.js", "section": "intuition"},
  {"title": "The Velocity Problem | Part II: Graphically", "file": "src/content/chapter-1/00-intro-limits.js", "section": "intuition"},
  {"title": "A Tale of Three Functions | Intro to Limits Part I", "file": "src/content/chapter-1/00-intro-limits.js", "section": "math"},
  {"title": "A Tale of Three Functions | Intro to Limits Part II", "file": "src/content/chapter-1/00-intro-limits.js", "section": "math"},
  {"title": "What is an infinite limit?", "file": "src/content/chapter-1/02b-types-of-discontinuities.js", "section": "intuition"},
  {"title": "Limit Laws | Breaking Up Complicated Limits Into Simpler Ones", "file": "src/content/chapter-1/01-limit-laws.js", "section": "intuition"},
  {"title": "Building up to computing limits of rational functions", "file": "src/content/chapter-1/01-limit-laws.js", "section": "math"},
  {"title": "Limits of Oscillating Functions and the Squeeze Theorem", "file": "src/content/chapter-1/04-squeeze-theorem.js", "section": "intuition"},
  {"title": "Top 4 Algebraic Tricks for Computing Limits", "file": "src/content/chapter-1/00-intro-limits.js", "section": "rigor"},
  {"title": "A Limit Example Combining Multiple Algebraic Tricks", "file": "src/content/chapter-1/00-intro-limits.js", "section": "rigor"},
  {"title": "Limits are simple for continuous functions", "file": "src/content/chapter-1/02-continuity.js", "section": "intuition"},
  {"title": "Were you ever exactly 3 feet tall? The Intermediate Value Theorem", "file": "src/content/chapter-1/02a-intermediate-value-theorem.js", "section": "intuition"},
  {"title": "Example: When is a Piecewise Function Continuous?", "file": "src/content/chapter-1/02-continuity.js", "section": "math"},
  {"title": "Limits \"at\" infinity", "file": "src/content/chapter-1/05-limits-at-infinity.js", "section": "intuition"},
  {"title": "Computing Limits at Infinity for Rational Functions", "file": "src/content/chapter-1/05-limits-at-infinity.js", "section": "math"},
  {"title": "Infinite Limit vs Limits at Infinity of a Composite Function", "file": "src/content/chapter-1/05-limits-at-infinity.js", "section": "rigor"},
  {"title": "The most important limit in Calculus // Geometric Proof & Applications", "file": "src/content/chapter-1/04b-fundamental-trig-limits.js", "section": "intuition"},
  {"title": "Definition of the Derivative  | Part I", "file": "src/content/chapter-2/00-tangent-problem.js", "section": "intuition"},
  {"title": "Applying the Definition of the Derivative to 1/x", "file": "src/content/chapter-2/00-tangent-problem.js", "section": "math"},
  {"title": "Definition of Derivative Example: f(x) = x + 1/(x+1)", "file": "src/content/chapter-2/00-tangent-problem.js", "section": "rigor"},
  {"title": "The derivative of a constant and of x^2  from the definition", "file": "src/content/chapter-2/00-tangent-problem.js", "section": "rigor"},
  {"title": "Derivative Rules:  Power Rule, Additivity, and Scalar Multiplication", "file": "src/content/chapter-2/01-differentiation-rules.js", "section": "intuition"},
  {"title": "How to Find the Equation of a Tangent Line", "file": "src/content/chapter-2/01-differentiation-rules.js", "section": "math"},
  {"title": "The derivative of e^x.", "file": "src/content/chapter-2/04-exp-log-derivatives.js", "section": "intuition"},
  {"title": "The product and quotient rules", "file": "src/content/chapter-2/01-differentiation-rules.js", "section": "rigor"},
  {"title": "The derivative of Trigonometric Functions", "file": "src/content/chapter-2/03-trig-derivatives.js", "section": "intuition"},
  {"title": "Chain Rule: the Derivative of a Composition", "file": "src/content/chapter-2/02-chain-rule.js", "section": "intuition"},
  {"title": "Interpreting the Chain Rule Graphically", "file": "src/content/chapter-2/02-chain-rule.js", "section": "math"},
  {"title": "The Chain Rule using Leibniz notation", "file": "src/content/chapter-2/02-chain-rule.js", "section": "rigor"},
  {"title": "Implicit Differentiation |  Differentiation when you only have an equation, not an explicit function", "file": "src/content/chapter-2/05-implicit-differentiation.js", "section": "intuition"},
  {"title": "Derivative of Inverse Trig Functions via Implicit Differentiation", "file": "src/content/chapter-2/02-derivatives-of-inverse-functions.js", "section": "intuition"},
  {"title": "The Derivative of ln(x) via Implicit Differentiation", "file": "src/content/chapter-2/04-exp-log-derivatives.js", "section": "math"},
  {"title": "Logarithmic Differentiation |  Example: x^sinx", "file": "src/content/chapter-2/04-exp-log-derivatives.js", "section": "rigor"},
  {"title": "Intro to Related Rates", "file": "src/content/chapter-3/00-related-rates.js", "section": "intuition"},
  {"title": "Linear Approximations | Using Tangent Lines to Approximate Functions", "file": "src/content/chapter-3/01-linear-approximation.js", "section": "intuition"},
  {"title": "The MEAN Value Theorem is Actually Very Nice", "file": "src/content/chapter-3/02-mean-value-theorem.js", "section": "intuition"},
  {"title": "Relative and Absolute Maximums and Minimums | Part I", "file": "src/content/chapter-3/03-curve-sketching.js", "section": "intuition"},
  {"title": "Relative and Absolute Maximums and Minimums | Part II", "file": "src/content/chapter-3/03-curve-sketching.js", "section": "math"},
  {"title": "Concavity and the 2nd Derivative Test", "file": "src/content/chapter-3/03-curve-sketching.js", "section": "rigor"},
  {"title": "Using L'Hopital's Rule to show that exponentials dominate polynomials", "file": "src/content/chapter-3/05-lhopital.js", "section": "intuition"},
  {"title": "Applying L'Hopital's Rule to Exponential Indeterminate Forms", "file": "src/content/chapter-3/05-lhopital.js", "section": "math"},
  {"title": "Ex: Optimizing the Volume of a Box With  Fixed Surface Area", "file": "src/content/chapter-3/04-optimization.js", "section": "intuition"},
  {"title": "Folding a wire into the largest rectangle | Optimization example", "file": "src/content/chapter-3/04-optimization.js", "section": "math"},
  {"title": "Optimization Example: Minimizing Surface Area Given a Fixed Volume", "file": "src/content/chapter-3/04-optimization.js", "section": "rigor"},
  {"title": "Tips for Success in Flipped Classrooms + OMG BABY!!!", "file": "src/content/chapter-0/05-assignment-playbook.js", "section": "intuition"},
  {"title": "What's an anti-derivative?", "file": "src/content/chapter-4/04-indefinite-integrals.js", "section": "intuition"},
  {"title": "Solving for the constant in the general anti-derivative", "file": "src/content/chapter-4/04-indefinite-integrals.js", "section": "math"},
  {"title": "The Definite Integral Part I: Approximating Areas with rectangles", "file": "src/content/chapter-4/01-riemann-sums.js", "section": "intuition"},
  {"title": "The Definite Integral Part II: Using Summation Notation to Define the Definite Integral", "file": "src/content/chapter-4/01-riemann-sums.js", "section": "math"},
  {"title": "The Definite Integral Part III: Evaluating From The Definition", "file": "src/content/chapter-4/02-definite-integral.js", "section": "intuition"},
  {"title": "\"Reverse\" Riemann Sums | Finding the Definite Integral Given a Sum", "file": "src/content/chapter-4/02-definite-integral.js", "section": "math"},
  {"title": "Fundamental Theorem of Calculus 1  |  Geometric Idea + Chain Rule Example", "file": "src/content/chapter-4/03-fundamental-theorem.js", "section": "intuition"},
  {"title": "Fundamental Theorem of Calculus II", "file": "src/content/chapter-4/03-fundamental-theorem.js", "section": "math"},
  {"title": "Intro to Substitution - Undoing the Chain Rule", "file": "src/content/chapter-4/06-u-substitution.js", "section": "intuition"},
  {"title": "Adjusting the Constant in Integration by Substitution", "file": "src/content/chapter-4/06-u-substitution.js", "section": "math"},
  {"title": "Substitution Method for Definite Integrals **careful!**", "file": "src/content/chapter-4/06-u-substitution.js", "section": "rigor"},
  {"title": "Back Substitution - When a u-sub doesn't match cleanly!", "file": "src/content/chapter-4/06-u-substitution.js", "section": "rigor"},
  {"title": "Average Value of a Continuous Function on an Interval", "file": "src/content/chapter-4/05-applications.js", "section": "intuition"},
  {"title": "Exam Walkthrough | Calc 1, Test 3 | Integration, FTC I/II, Optimization, u-subs, Graphing", "file": "src/content/chapter-4/05-applications.js", "section": "rigor"},
  {"title": "♥♥♥ Thank you Calc Students♥♥♥   Some final thoughts.", "file": "src/content/chapter-4/17-centers-of-mass.js", "section": "intuition"},
  {"title": "CALCULUS SPEEDRUN || Limits || Episode 1", "file": "src/content/chapter-1/10-limits-and-continuity.js", "section": "intuition"},
  {"title": "5 counterexamples every calculus student should know", "file": "src/content/chapter-2/10-derivatives-introduction.js", "section": "intuition"}
];

const embedCodes = {
  "The Velocity Problem | Part I: Numerically": "https://www.youtube.com/embed/LWPzHlSBlxI",
  "The Velocity Problem | Part II: Graphically": "https://www.youtube.com/embed/fzh-jmeDOvw",
  "A Tale of Three Functions | Intro to Limits Part I": "https://www.youtube.com/embed/Qspc6uBMdEY",
  "A Tale of Three Functions | Intro to Limits Part II": "https://www.youtube.com/embed/PllF7oQg8Og",
  "What is an infinite limit?": "https://www.youtube.com/embed/5hfHbOCeFoU",
  "Limit Laws | Breaking Up Complicated Limits Into Simpler Ones": "https://www.youtube.com/embed/dY5T7BcQ2Nc",
  "Building up to computing limits of rational functions": "https://www.youtube.com/embed/XDcy_wqWQVs",
  "Limits of Oscillating Functions and the Squeeze Theorem": "https://www.youtube.com/embed/vIRvEvjKM58",
  "Top 4 Algebraic Tricks for Computing Limits": "https://www.youtube.com/embed/zswMgrZqj4E",
  "A Limit Example Combining Multiple Algebraic Tricks": "https://www.youtube.com/embed/tWoYGRy8eQg",
  "Limits are simple for continuous functions": "https://www.youtube.com/embed/0S01H4S8djs",
  "Were you ever exactly 3 feet tall? The Intermediate Value Theorem": "https://www.youtube.com/embed/n3G1L3yqPI0",
  "Example: When is a Piecewise Function Continuous?": "https://www.youtube.com/embed/nzYxGpnllHA",
  "Limits \"at\" infinity": "https://www.youtube.com/embed/yHtIxYKVKUs",
  "Computing Limits at Infinity for Rational Functions": "https://www.youtube.com/embed/QkfT-VSy5t8",
  "Infinite Limit vs Limits at Infinity of a Composite Function": "https://www.youtube.com/embed/1b6CrN5U6Mc",
  "The most important limit in Calculus // Geometric Proof & Applications": "https://www.youtube.com/embed/f2PRu5QPa3o",
  "Definition of the Derivative  | Part I": "https://www.youtube.com/embed/hp046sLvQpM",
  "Applying the Definition of the Derivative to 1/x": "https://www.youtube.com/embed/JgVUjIt5Fa0",
  "Definition of Derivative Example: f(x) = x + 1/(x+1)": "https://www.youtube.com/embed/pi5VtjU0B3s",
  "The derivative of a constant and of x^2  from the definition": "https://www.youtube.com/embed/cvP_t27nUMY",
  "Derivative Rules:  Power Rule, Additivity, and Scalar Multiplication": "https://www.youtube.com/embed/0y9ZAS5_U68",
  "How to Find the Equation of a Tangent Line": "https://www.youtube.com/embed/KL3oJjkFsqQ",
  "The derivative of e^x.": "https://www.youtube.com/embed/ZMP6xIdim24",
  "The product and quotient rules": "https://www.youtube.com/embed/O6m9rtIGxUM",
  "The derivative of Trigonometric Functions": "https://www.youtube.com/embed/QDKj-E-ICPo",
  "Chain Rule: the Derivative of a Composition": "https://www.youtube.com/embed/CPnrs2Yl-rY",
  "Interpreting the Chain Rule Graphically": "https://www.youtube.com/embed/o-6GzqChpJs",
  "The Chain Rule using Leibniz notation": "https://www.youtube.com/embed/NA-Ri4LJPaY",
  "Implicit Differentiation |  Differentiation when you only have an equation, not an explicit function": "https://www.youtube.com/embed/sjcoTb3cMRY",
  "Derivative of Inverse Trig Functions via Implicit Differentiation": "https://www.youtube.com/embed/fnVMT08u6fU",
  "The Derivative of ln(x) via Implicit Differentiation": "https://www.youtube.com/embed/DTOefLm7zfU",
  "Logarithmic Differentiation |  Example: x^sinx": "https://www.youtube.com/embed/VgurXuuIBbQ",
  "Intro to Related Rates": "https://www.youtube.com/embed/3e27UqwPtMw",
  "Linear Approximations | Using Tangent Lines to Approximate Functions": "https://www.youtube.com/embed/AorDyDOZNMA",
  "The MEAN Value Theorem is Actually Very Nice": "https://www.youtube.com/embed/a2GpXyPWx68",
  "Relative and Absolute Maximums and Minimums | Part I": "https://www.youtube.com/embed/wHDxo5hPA-k",
  "Relative and Absolute Maximums and Minimums | Part II": "https://www.youtube.com/embed/Q1raJeFtF_U",
  "Concavity and the 2nd Derivative Test": "https://www.youtube.com/embed/FAj9w06OhH0",
  "Using L'Hopital's Rule to show that exponentials dominate polynomials": "https://www.youtube.com/embed/INoXqqmNRJQ",
  "Applying L'Hopital's Rule to Exponential Indeterminate Forms": "https://www.youtube.com/embed/jzhn9Xg5iAQ",
  "Ex: Optimizing the Volume of a Box With  Fixed Surface Area": "https://www.youtube.com/embed/Hk5sXplIBqU",
  "Folding a wire into the largest rectangle | Optimization example": "https://www.youtube.com/embed/7lCm84AnfEw",
  "Optimization Example: Minimizing Surface Area Given a Fixed Volume": "https://www.youtube.com/embed/6zqrFILyVbI",
  "Tips for Success in Flipped Classrooms + OMG BABY!!!": "https://www.youtube.com/embed/AlYlAUdvqic",
  "What's an anti-derivative?": "https://www.youtube.com/embed/ksCcKnHNJPM",
  "Solving for the constant in the general anti-derivative": "https://www.youtube.com/embed/0oOQOQSZMKk",
  "The Definite Integral Part I: Approximating Areas with rectangles": "https://www.youtube.com/embed/kS4DSZqH9Fk",
  "The Definite Integral Part II: Using Summation Notation to Define the Definite Integral": "https://www.youtube.com/embed/_q7Rx_Xa0ig",
  "The Definite Integral Part III: Evaluating From The Definition": "https://www.youtube.com/embed/3FmnyO28XXw",
  "\"Reverse\" Riemann Sums | Finding the Definite Integral Given a Sum": "https://www.youtube.com/embed/4vMJwKHMRx0",
  "Fundamental Theorem of Calculus 1  |  Geometric Idea + Chain Rule Example": "https://www.youtube.com/embed/hAfpl8jLFOs",
  "Fundamental Theorem of Calculus II": "https://www.youtube.com/embed/sRDf3WozXHc",
  "Intro to Substitution - Undoing the Chain Rule": "https://www.youtube.com/embed/QcgacM1LSpA",
  "Adjusting the Constant in Integration by Substitution": "https://www.youtube.com/embed/RdeTrQKz3fk",
  "Substitution Method for Definite Integrals **careful!**": "https://www.youtube.com/embed/iLh6cYGCogk",
  "Back Substitution - When a u-sub doesn't match cleanly!": "https://www.youtube.com/embed/k08ce4fEA3k",
  "Average Value of a Continuous Function on an Interval": "https://www.youtube.com/embed/NKf2waIGl7I",
  "Exam Walkthrough | Calc 1, Test 3 | Integration, FTC I/II, Optimization, u-subs, Graphing": "https://www.youtube.com/embed/6hacyAipdEA",
  "♥♥♥ Thank you Calc Students♥♥♥   Some final thoughts.": "https://www.youtube.com/embed/STVJ_-T_YDY",
  "CALCULUS SPEEDRUN || Limits || Episode 1": "https://www.youtube.com/embed/nVU9Lgq_nho",
  "5 counterexamples every calculus student should know": "https://www.youtube.com/embed/4-M3Yc5NYMA"
};

const modifications = {};

videos.forEach(v => {
  if (!fs.existsSync(v.file)) {
    console.log("File not found: " + v.file);
    return;
  }
  const url = embedCodes[v.title];
  if (!url) return;
  
  if (!modifications[v.file]) {
    modifications[v.file] = fs.readFileSync(v.file, 'utf8');
  }
  
  let content = modifications[v.file];
  
  const sectionRegex = new RegExp(`\\b${v.section}\\s*:\\s*\\{`, 'g');
  const match = sectionRegex.exec(content);
  if (match) {
    const sectionStart = match.index;
    
    // Find the end of the section by counting braces
    let braceCount = 0;
    let inString = false;
    let stringChar = '';
    let sectionEnd = -1;
    for (let i = sectionStart + v.section.length + 1; i < content.length; i++) {
        const char = content[i];
        if (inString) {
            if (char === stringChar && content[i-1] !== '\\') {
                inString = false;
            }
        } else {
            if (char === '"' || char === "'") {
                inString = true;
                stringChar = char;
            } else if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                    sectionEnd = i;
                    break;
                }
            }
        }
    }

    if (sectionEnd === -1) {
        console.log("Could not find end of section for " + v.title);
        return;
    }

    const sectionContent = content.substring(sectionStart, sectionEnd + 1);
    
    // Check if visualizations array exists in this specific section
    const visRegex = /visualizations\s*:\s*\[/g;
    const visMatch = visRegex.exec(sectionContent);
    
    const strToInject = `
      {
        id: 'VideoEmbed',
        title: ${JSON.stringify(v.title)},
        props: { url: ${JSON.stringify(url)} }
      },`;
      
    if (visMatch) {
      const globalArrayStart = sectionStart + visMatch.index + visMatch[0].length - 1;
      content = content.slice(0, globalArrayStart + 1) + strToInject + content.slice(globalArrayStart + 1);
    } else {
      // Find where to insert visualizations: [...]
      // Best place is right before the closing brace of the section
      content = content.slice(0, sectionEnd) + `\n      visualizations: [${strToInject}\n      ],\n    ` + content.slice(sectionEnd);
    }
    
    modifications[v.file] = content;
  }
});

for (let file in modifications) {
  fs.writeFileSync(file, modifications[file]);
  console.log("Updated " + file);
}

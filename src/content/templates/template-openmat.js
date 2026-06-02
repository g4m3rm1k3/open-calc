// ═══════════════════════════════════════════════════════════════════════════
// MATLAB / OPENMAT LESSON TEMPLATE — UpSkillOS
// Use for: lessons where the student writes and runs MATLAB/Octave code.
// Works for any math or engineering course: linear algebra, physics, calculus.
//
// HOW TO FILL THIS IN:
//   1. Replace every value in UPPER_CASE with your content
//   2. 4 cells required: concept → visualization → application → challenge
//   3. prose[] teaches the math/MATLAB syntax; code is what students run
//   4. MATLAB syntax: semicolons suppress output, % is comment, fprintf prints
//
// SUBMIT: email your completed file to m1k3ymcl34n@gmail.com
//         subject: [Lesson Submission] YOUR TITLE
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // ── Identity ──────────────────────────────────────────────────────────────
  // id format: COURSE-CHAPTER-ORDER-SLUG  (all lowercase, hyphens)
  // Examples: 'la1-003-dot-product'  |  'phys-1-005-work'
  id: 'COURSE-CHAPTER-ORDER-SLUG',
  slug: 'url-friendly-slug',
  chapter: '1.1',          // matches chapter group in index.js
  order: 1,                // integer, position within chapter
  title: 'YOUR LESSON TITLE',
  subtitle: 'One sentence: what students will be able to do after this lesson.',
  tags: ['matlab', 'SUBJECT', 'KEYWORD1', 'KEYWORD2'],

  hook: {
    question: `What problem does CONCEPT solve in MATLAB/Octave?`,
    realWorldContext: `In REAL SYSTEM, CONCEPT is computed in MATLAB by TASK. Engineers use it to OUTCOME.`,
  },

  intuition: {
    prose: [
      `**The math.** EXPLAIN THE CONCEPT WITHOUT CODE FIRST. Give the mental model and the formula.`,
      `**What you will build.** By the end of this lesson you will be able to CONCRETE MATLAB SKILL.`,
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter X, Lesson Y',
        body: `**Previous:** PREVIOUS LESSON TITLE\n**This lesson:** THIS LESSON\n**Next:** NEXT LESSON`,
      },
      {
        type: 'procedure',
        title: 'MATLAB syntax reminder',
        body: `- Semicolon ; suppresses output\n- % is the comment character\n- [3; 4] creates a column vector, [3, 4] a row vector\n- fprintf('Value: %f\\n', x) prints formatted output`,
      },
    ],

    // ── MATLAB / OpenMat Notebook ────────────────────────────────────────────
    // Rendered in the interactive "MATLAB Lab" panel of this lesson.
    // 4 cells: concept → visualization → application → challenge
    // Each cell: id (integer), cellTitle (string), prose (string[]), code (string)
    // prose[] teaches the math and explains how the MATLAB code connects to it.
    // NOTE: Uses initialProps (not props) — the OpenMat notebook format.
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'MATLAB Lab',
        caption: `Work through each cell. The challenge cell has no starter code — write it from scratch.`,
        initialProps: {
          initialCells: [

            // ── Cell 1 — Concept ──────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'CELL TITLE: concept in MATLAB syntax',
              prose: [
                `MATLAB SYNTAX NOTE: explain the key MATLAB syntax for this concept. E.g. semicolons create column vectors, % is the comment character, fprintf prints.`,
                `CONNECT TO FORMULA: explain how each line of code directly computes the formula from this lesson. What should the student observe when they run it?`,
              ],
              code: `% COMMENT EXPLAINING WHAT THIS COMPUTES
% MATLAB/Octave syntax

x = ...; % WHAT TO FILL IN

result = ...;

fprintf('Result: %f\\n', result);`,
            },

            // ── Cell 2 — Visualization ─────────────────────────────────────────
            {
              id: 2,
              cellTitle: 'Visualize: WHAT THIS PLOTS',
              prose: [
                `MATLAB PLOT EXPLANATION: describe what the figure() / plot() commands produce. What shape or pattern will appear and how does it confirm the formula?`,
                `OBSERVATION PROMPT: run this cell and notice HOW THE PLOT SHOWS THE CONCEPT visually.`,
              ],
              code: `% Visualization
x = linspace(-3, 3, 300);
y = ...;  % compute using the formula from this lesson

figure;
plot(x, y, 'b-', 'LineWidth', 2);
hold on;
plot(0, 0, 'ro', 'MarkerSize', 8);   % mark the origin
xlabel('x');
ylabel('y');
title('CHART TITLE');
grid on;`,
            },

            // ── Cell 3 — Application ───────────────────────────────────────────
            {
              id: 3,
              cellTitle: 'Application: REAL-WORLD SCENARIO',
              prose: [
                `REALISTIC PROBLEM: DESCRIBE THE SCENARIO. Show how this lesson's MATLAB code solves it.`,
                `EXPECTED OUTPUT: tell students what the answer should be so they can verify.`,
              ],
              code: `% Problem: REAL-WORLD SCENARIO
% Given:
given = ...;

% Compute RESULT using FORMULA FROM THIS LESSON
answer = ...;

fprintf('Answer: %.4f\\n', answer);`,
            },

            // ── Cell 4 — Challenge ─────────────────────────────────────────────
            {
              id: 4,
              cellTitle: 'Challenge: PROBLEM TITLE',
              prose: [
                `HARDER PROBLEM — combine this lesson's concept with something from a previous lesson. No starter code — write it from scratch in MATLAB syntax.`,
                `Hint: ONE SMALL HINT`,
              ],
              code: `% Your solution here
`,
            },

          ],
        },
      },
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  // Minimum 6 questions. CRITICAL: answer must match an option string exactly.
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      question: `QUESTION TEXT`,
      options: ['Option A text', 'Option B text', 'Option C text', 'Option D text'],
      answer: 'Option A text',   // ← copy-paste from options, character for character
      hints: [`HINT 1`, `HINT 2`],
      reviewSection: 'intuition',
    },
    {
      id: 'q2',
      type: 'choice',
      question: `QUESTION TEXT`,
      options: ['Option A text', 'Option B text', 'Option C text', 'Option D text'],
      answer: 'Option B text',
      hints: [`HINT`],
      reviewSection: 'intuition',
    },
    {
      id: 'q3',
      type: 'choice',
      question: `QUESTION TEXT`,
      options: ['Option A text', 'Option B text', 'Option C text', 'Option D text'],
      answer: 'Option C text',
      hints: [`HINT`],
      reviewSection: 'intuition',
    },
    // Add 3 more questions to reach the minimum of 6
  ],
}

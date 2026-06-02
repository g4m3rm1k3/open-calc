// ═══════════════════════════════════════════════════════════════════════════
// CONCEPT LESSON TEMPLATE
// Use for: calculus, physics, linear algebra, discrete math, geometry
//
// HOW TO FILL THIS IN:
//   1. Replace every value in UPPER_CASE with your content
//   2. Delete sections you do not need (rigor, challenges, etc. are optional)
//   3. Quiz: answer must be copied exactly from the options array
//   4. Notebook: 4 cells — concept → visualization → application → challenge
//
// SUBMIT: email your completed file to m1k3ymcl34n@gmail.com
//         subject: [Lesson Submission] YOUR TITLE
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // ── Identity ──────────────────────────────────────────────────────────────
  // id format: course-chapter-order-slug  (all lowercase, hyphens)
  // Examples: 'calc-2-001-power-rule'  |  'la1-003-dot-product'  |  'phys-1-005-work'
  id: 'COURSE-CHAPTER-ORDER-SLUG',
  slug: 'url-friendly-slug',         // lowercase, hyphens, no spaces
  chapter: '1.1',                    // matches your chapter group in index.js
  order: 1,                          // integer, position within chapter
  title: 'YOUR LESSON TITLE',
  subtitle: 'One sentence: what students will be able to do after this lesson.',
  tags: ['subject', 'keyword1', 'keyword2'],  // subject first, then specific topics

  // ── Hook ──────────────────────────────────────────────────────────────────
  hook: {
    question: `Why does CONCEPT matter when solving real problems?`,
    realWorldContext: `In REAL SYSTEM, CONCEPT explains PHENOMENON. Engineers/scientists use it to TASK.`,
  },

  // ── Intuition ─────────────────────────────────────────────────────────────
  // Start with a concrete example. Walk to the pattern. State the formula last.
  // The student should feel they could have discovered it themselves.
  intuition: {
    prose: [
      `**Start concrete.** Take SPECIFIC NUMBERS OR SITUATION. Notice that OBSERVATION. This is the seed of the idea.`,

      `**Find the pattern.** When INPUT changes by AMOUNT, OUTPUT changes by RELATED AMOUNT. The ratio FORMULA FRAGMENT appears every time. That ratio is CONCEPT NAME.`,

      `**State it.** CONCEPT is defined as: FORMULA. Each term connects to the example: TERM means MEANING, TERM means MEANING.`,

      `**Before reading on, predict:** if SCENARIO, what would CONCEPT equal? Write your guess, then check in the Math section.`,
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter X, Lesson Y',
        body: `**Previous:** PREVIOUS LESSON TITLE\n**This lesson:** WHAT THIS LESSON COVERS\n**Next:** NEXT LESSON TITLE`,
      },
      {
        type: 'procedure',
        title: 'How to compute CONCEPT',
        body: `1. Identify WHAT TO LOOK FOR\n2. Compute INTERMEDIATE STEP\n3. Apply FORMULA\n4. Check: SANITY CHECK`,
      },
      {
        type: 'insight',
        title: 'The key geometric interpretation',
        body: `CONCEPT has a visual meaning: DESCRIBE WHAT IT LOOKS LIKE.`,
      },
    ],
    // Remove this if you are not using a built-in visualization component.
    // See the Visualizations guide (07) for the full list of available IDs.
    visualizations: [
      {
        id: 'VIZ_COMPONENT_ID',      // e.g. 'FunctionPlotter', 'LimitApproach'
        title: 'Interactive: WHAT IT SHOWS',
        caption: `One sentence describing what to do and what to observe.`,
      },
    ],
  },

  // ── Math ──────────────────────────────────────────────────────────────────
  // Derive or prove the main result using only ideas from Intuition.
  math: {
    prose: [
      `**Setup.** Let VARIABLES represent QUANTITIES. We want to show GOAL.`,

      `**Step 1.** Starting from DEFINITION OR KNOWN RESULT: $EQUATION$. This is valid because REASON.`,

      `**Step 2.** Applying OPERATION: $EQUATION$.`,

      `**Result.** We arrive at $FORMULA$. This matches our intuition because CONNECTION TO EXAMPLE.`,
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Common mistake: WHAT STUDENTS GET WRONG',
        body: `DESCRIBE THE MISTAKE. Wrong: WRONG VERSION. Right: CORRECT VERSION.`,
      },
    ],
  },

  // ── Rigor (optional) ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      `**Formal definition.** FORMAL DEFINITION.`,
      `**What the definition requires.** The key condition is CONDITION. Without it, COUNTEREXAMPLE would violate PROPERTY.`,
      `**Geometric interpretation.** In N-dimensional space, CONCEPT corresponds to GEOMETRIC OBJECT.`,
      `**Where this leads.** This result is the foundation for NEXT TOPIC.`,
    ],
  },

  // ── Examples ──────────────────────────────────────────────────────────────
  // Minimum 3: easy, medium, hard. Example 1 should walk every step.
  examples: [
    {
      title: 'Example 1 (Easy): SPECIFIC PROBLEM STATEMENT',
      steps: [
        {
          expression: `STARTING EXPRESSION`,
          annotation: `We are given INPUT. Our goal is OUTPUT. We start by FIRST ACTION.`,
        },
        {
          expression: `AFTER STEP 1`,
          annotation: `Apply RULE. This works because REASON FROM INTUITION SECTION.`,
        },
        {
          expression: `FINAL ANSWER`,
          annotation: `Sanity check: VERIFY WITH UNITS OR BACK-SUBSTITUTION.`,
        },
      ],
    },
    {
      title: 'Example 2 (Medium): SPECIFIC PROBLEM STATEMENT',
      steps: [
        { expression: `EXPRESSION`, annotation: `ANNOTATION` },
        { expression: `EXPRESSION`, annotation: `ANNOTATION` },
        { expression: `ANSWER`, annotation: `ANNOTATION` },
      ],
    },
    {
      title: 'Example 3 (Hard): SPECIFIC PROBLEM STATEMENT',
      steps: [
        { expression: `EXPRESSION`, annotation: `ANNOTATION` },
        { expression: `EXPRESSION`, annotation: `ANNOTATION` },
        { expression: `ANSWER`, annotation: `ANNOTATION` },
      ],
    },
  ],

  // ── Quiz ──────────────────────────────────────────────────────────────────
  // Minimum 6 questions. CRITICAL: answer must match an option string exactly.
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      question: `QUESTION TEXT`,
      options: ['Option A text', 'Option B text', 'Option C text', 'Option D text'],
      answer: 'Option A text',   // ← copy-paste from options above, character for character
      hints: [`HINT 1`, `HINT 2`],
      reviewSection: 'intuition',  // 'intuition' | 'math' | 'rigor' | 'examples'
    },
    {
      id: 'q2',
      type: 'choice',
      question: `QUESTION TEXT`,
      options: ['Option A text', 'Option B text', 'Option C text', 'Option D text'],
      answer: 'Option B text',
      hints: [`HINT`],
      reviewSection: 'math',
    },
    {
      id: 'q3',
      type: 'choice',
      question: `QUESTION TEXT`,
      options: ['Option A text', 'Option B text', 'Option C text', 'Option D text'],
      answer: 'Option C text',
      hints: [`HINT`],
      reviewSection: 'examples',
    },
    // Add 3 more questions to reach the minimum of 6
  ],

  // ── Challenges (optional, but encouraged) ─────────────────────────────────
  challenges: [
    {
      title: 'CHALLENGE PROBLEM STATEMENT',
      difficulty: 'medium',   // 'easy' | 'medium' | 'hard'
      walkthrough: [
        `Step 1: WHAT TO DO AND WHY`,
        `Step 2: NEXT STEP`,
        `Answer: FINAL RESULT`,
      ],
    },
  ],

  // ── Misconceptions (optional) ─────────────────────────────────────────────
  misconceptions: [
    {
      wrong: `COMMON WRONG BELIEF`,
      correction: `WHY IT IS WRONG AND WHAT IS CORRECT`,
      correctionExample: `SPECIFIC EXAMPLE SHOWING CORRECT REASONING`,
    },
  ],

  // ── Transfer prompts (optional) ───────────────────────────────────────────
  transferPrompts: [
    `QUESTION applying this concept to a new domain`,
    `QUESTION connecting this to a concept from an earlier lesson`,
  ],

  // ── Python Notebook ───────────────────────────────────────────────────────
  // Rendered in a separate "Python Lab" tab in the lesson.
  // 4 cells: concept → visualization (matplotlib) → application → challenge
  // Cell format: { id, cellTitle, prose[], code, testCode? }
  python: {
    title: `YOUR LESSON TITLE — Python Lab`,
    cells: [

      // ── Cell 1 — Concept ─────────────────────────────────────────────────
      {
        id: 1,
        cellTitle: 'CELL TITLE: concept or formula name',
        prose: [
          `EXPLAIN THE MATH CONNECTION: what does each line of code do and WHY — connect it directly to the formula just learned.`,
          `SECOND EXPLANATION PARAGRAPH if needed. What should the student observe when they run this?`,
        ],
        code: `# COMMENT EXPLAINING WHAT STUDENTS COMPUTE
import numpy as np

# Define the input
x = ...   # WHAT TO FILL IN

# Compute the result using FORMULA FROM THIS LESSON
result = ...

print(f"Result: {result}")`,
        testCode: `assert abs(result - EXPECTED_VALUE) < 1e-6, "Check your formula"`,
      },

      // ── Cell 2 — Visualization ────────────────────────────────────────────
      {
        id: 2,
        cellTitle: 'Visualize: WHAT THIS PLOTS',
        prose: [
          `EXPLAIN THE PLOT: what shape will appear, why it looks that way, and how it connects to the math.`,
          `OBSERVATION PROMPT: run this cell and notice HOW THE PLOT CONFIRMS THE FORMULA.`,
        ],
        code: `import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-3, 3, 300)
y = ...   # compute using the formula from this lesson

plt.figure(figsize=(8, 4))
plt.plot(x, y, 'b-', linewidth=2, label='LABEL')
plt.axhline(0, color='k', linewidth=0.5)
plt.axvline(0, color='k', linewidth=0.5)
plt.xlabel('x')
plt.ylabel('y')
plt.title('CHART TITLE')
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()`,
      },

      // ── Cell 3 — Application ─────────────────────────────────────────────
      {
        id: 3,
        cellTitle: 'Application: REAL-WORLD SCENARIO',
        prose: [
          `REALISTIC PROBLEM: DESCRIBE THE SCENARIO. Show how the formula from this lesson solves it.`,
          `EXPECTED OUTPUT: tell students what the answer should be so they can verify.`,
        ],
        code: `import numpy as np

# Problem: REAL-WORLD SCENARIO
# Given:
given = ...

# Compute RESULT using FORMULA FROM THIS LESSON
answer = ...

print(f"Answer: {answer:.4f}")`,
      },

      // ── Cell 4 — Challenge ────────────────────────────────────────────────
      {
        id: 4,
        cellTitle: 'Challenge: PROBLEM TITLE',
        prose: [
          `HARDER PROBLEM that requires combining this lesson's concept with something from a previous lesson. No starter code — write it from scratch.`,
          `Hint: ONE SMALL HINT`,
        ],
        code: `# Your solution here
`,
      },

    ],
  },

  // ── MATLAB / OpenMat Notebook ─────────────────────────────────────────────
  // Rendered in a separate "MATLAB Lab" tab.
  // Same 4-cell structure — teaches the same math in MATLAB/Octave syntax.
  // Remove this entire section if you do not want a MATLAB notebook.
  openmat: {
    title: `YOUR LESSON TITLE — MATLAB Lab`,
    cells: [

      {
        id: 1,
        cellTitle: 'CELL TITLE: concept in MATLAB syntax',
        prose: [
          `MATLAB SYNTAX NOTE: explain the key difference between NumPy and MATLAB for this concept. E.g. semicolons create column vectors, % is the comment character.`,
          `CONNECT TO FORMULA: how does this line of code directly compute the formula?`,
        ],
        code: `% COMMENT EXPLAINING WHAT THIS COMPUTES
% MATLAB/Octave syntax

x = ...; % WHAT TO FILL IN

result = ...;

fprintf('Result: %f\\n', result);`,
      },

      {
        id: 2,
        cellTitle: 'Visualize: WHAT THIS PLOTS',
        prose: [
          `MATLAB PLOT EXPLANATION: how does figure/plot differ from matplotlib?`,
        ],
        code: `% Visualization
x = linspace(-3, 3, 300);
y = ...;  % compute using the formula

figure;
plot(x, y, 'b-', 'LineWidth', 2);
xlabel('x'); ylabel('y');
title('CHART TITLE');
grid on;`,
      },

      {
        id: 3,
        cellTitle: 'Application: REAL-WORLD SCENARIO',
        prose: [
          `SAME APPLICATION as the Python cell, but in MATLAB syntax.`,
        ],
        code: `% Problem: REAL-WORLD SCENARIO
given = ...;
answer = ...;

fprintf('Answer: %.4f\\n', answer);`,
      },

      {
        id: 4,
        cellTitle: 'Challenge: PROBLEM TITLE',
        prose: [
          `HARDER PROBLEM. Write from scratch in MATLAB syntax.`,
          `Hint: ONE SMALL HINT`,
        ],
        code: `% Your solution here
`,
      },

    ],
  },
}

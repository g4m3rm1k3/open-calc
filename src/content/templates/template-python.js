// ═══════════════════════════════════════════════════════════════════════════
// PYTHON CODING LESSON TEMPLATE — UpSkillOS
// Use for: Python-1, Data Science, AI Engineering — lessons where
//          the student writes and runs Python code in a notebook.
//
// HOW TO FILL THIS IN:
//   1. Replace every value in UPPER_CASE with your content
//   2. 4 cells required: concept → visualization → application → challenge
//   3. prose[] teaches the math/concept; code is what students run
//   4. testCode is optional — use assert to auto-check student answers
//
// SUBMIT: email your completed file to m1k3ymcl34n@gmail.com
//         subject: [Lesson Submission] YOUR TITLE
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // ── Identity ──────────────────────────────────────────────────────────────
  // id format: py-CHAPTER-ORDER-SLUG
  // Examples: 'py-1-3-for-loops'  |  'py-2-1-list-comprehensions'
  id: 'py-CHAPTER-ORDER-SLUG',
  slug: 'url-friendly-slug',
  chapter: 1.1,          // matches the chapter group in python-1/index.js
  order: 1,              // integer, position within chapter
  title: 'YOUR LESSON TITLE',
  subtitle: 'One sentence: what students will be able to do.',
  tags: ['python', 'KEYWORD1', 'KEYWORD2'],  // always start with 'python'

  hook: {
    question: `What problem does CONCEPT solve in real Python programs?`,
    realWorldContext: `DESCRIBE WHERE THIS CONCEPT APPEARS IN REAL CODE OR DATA SCIENCE.`,
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      `**The idea.** EXPLAIN THE CONCEPT WITHOUT CODE FIRST. One clear paragraph that gives the mental model.`,
      `**What you will build.** By the end of this lesson you will be able to CONCRETE SKILL.`,
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter X, Lesson Y',
        body: `**Previous:** PREVIOUS LESSON TITLE\n**This lesson:** THIS LESSON\n**Next:** NEXT LESSON`,
      },
    ],

    // ── Python Notebook ──────────────────────────────────────────────────────
    // Rendered in the interactive "Python Lab" panel of this lesson.
    // 4 cells: concept → visualization → application → challenge
    // Each cell: id (integer), cellTitle (string), prose (string[]), code (string), testCode? (string)
    // prose[] teaches the math; code is what students run and edit.
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Python Lab',
        caption: `Work through each cell. The challenge cell has no starter code — write it from scratch.`,
        props: {
          initialCells: [

            // ── Cell 1 — Concept ──────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'CELL TITLE: concept or formula name',
              prose: [
                `EXPLAIN WHAT THIS CELL DEMONSTRATES. Connect every line of code to the concept just introduced. What should the student observe when they run it?`,
                `SECOND PARAGRAPH if needed. What does the printed output mean in terms of the concept?`,
              ],
              code: `# WHAT THIS CELL INTRODUCES

# Example: show CONCEPT in its simplest form
example = [1, 2, 3, 4, 5]

for item in example:
    print(item)

# Try changing the list above and re-running.`,
            },

            // ── Cell 2 — Visualization ─────────────────────────────────────────
            {
              id: 2,
              cellTitle: 'Visualize: WHAT THIS PLOTS',
              prose: [
                `EXPLAIN WHAT THE PLOT SHOWS and how it connects to the math. What shape or pattern will appear?`,
                `OBSERVATION PROMPT: run this cell and notice HOW THE PLOT CONFIRMS THE CONCEPT.`,
              ],
              code: `import matplotlib.pyplot as plt

# Build data that demonstrates CONCEPT
x = list(range(10))
y = [i**2 for i in x]   # EXPLAIN WHAT THIS COMPUTES

plt.figure(figsize=(7, 4))
plt.plot(x, y, 'o-', color='steelblue', linewidth=2, markersize=6)
plt.xlabel('X AXIS LABEL')
plt.ylabel('Y AXIS LABEL')
plt.title('CHART TITLE')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

print(f"Values: {y}")`,
            },

            // ── Cell 3 — Application ───────────────────────────────────────────
            {
              id: 3,
              cellTitle: 'Application: REAL-WORLD SCENARIO',
              prose: [
                `REALISTIC PROBLEM: DESCRIBE THE SCENARIO. Show how this lesson's concept solves it.`,
                `EXPECTED OUTPUT: tell students what the answer should be so they can verify.`,
              ],
              code: `# Task: PROBLEM STATEMENT
#
# Given:
data = [23, 45, 12, 67, 34, 89, 11, 56]
#
# Compute RESULT using CONCEPT FROM THIS LESSON
result = ...   # write your solution here

print(f"Result: {result}")`,
              testCode: `assert result == EXPECTED_VALUE, f"Expected {EXPECTED_VALUE}, got {result}"`,
            },

            // ── Cell 4 — Challenge ─────────────────────────────────────────────
            {
              id: 4,
              cellTitle: 'Challenge: PROBLEM TITLE',
              prose: [
                `HARDER PROBLEM — combine this lesson's concept with something from a previous lesson. No starter code — write it from scratch.`,
                `Hint: ONE SMALL HINT`,
              ],
              code: `# Your solution here
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

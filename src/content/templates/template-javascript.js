// ═══════════════════════════════════════════════════════════════════════════
// JAVASCRIPT / WEB LESSON TEMPLATE
// Use for: Web-1, JavaScript-1, CS-1 — lessons where the student writes
//          live HTML/CSS/JS in a notebook that renders in an iframe.
//
// HOW TO FILL THIS IN:
//   1. Replace every value in UPPER_CASE with your content
//   2. Each cell has html, css, and startCode (JavaScript)
//   3. The output panel renders a live webpage — keep CSS clean
//   4. type: 'markdown' cells have no code output — just instructions
//
// SUBMIT: email your completed file to m1k3ymcl34n@gmail.com
//         subject: [Lesson Submission] YOUR TITLE
// ═══════════════════════════════════════════════════════════════════════════

export default {
  // ── Identity ──────────────────────────────────────────────────────────────
  // id format: w1-CHAPTER-ORDER-SLUG
  // Examples: 'w1-005-flexbox-layout'  |  'js-1-003-event-listeners'
  id: 'w1-CHAPTER-ORDER-SLUG',
  slug: 'url-friendly-slug',
  chapter: 'w1',        // matches the chapter group in index.js
  order: 1,
  title: 'YOUR LESSON TITLE',
  subtitle: 'One sentence description.',
  tags: ['web', 'javascript', 'KEYWORD'],   // or 'html', 'css', etc.

  hook: {
    question: `MOTIVATING QUESTION`,
    realWorldContext: `WHERE THIS APPEARS IN REAL WEB DEVELOPMENT.`,
    previewVisualizationId: 'JSNotebook',
  },

  intuition: {
    prose: [
      `CONTEXT PARAGRAPH — explain the concept before showing any code.`,
      `WHERE THIS IS HEADING — what the student will build and why it matters.`,
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson X',
        body: `**Previous:** PREVIOUS LESSON\n**This:** THIS LESSON\n**Next:** NEXT LESSON`,
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Live Code Lab',
        caption: `WHAT STUDENTS WILL BUILD IN THIS LAB`,
        props: {
          lesson: {
            title: 'LAB TITLE',
            subtitle: 'LAB SUBTITLE',
            sequential: true,
            cells: [

              // ── Cell 1 — Markdown intro ──────────────────────────────────
              {
                type: 'markdown',
                instruction: `### SECTION TITLE

EXPLANATION OF THE CONCEPT. Use full Markdown here — this cell has no code output, just text.

Use \`code\` for inline code, and code blocks for longer examples:

\`\`\`js
const example = "show the pattern here";
\`\`\`

Explain what the student will do in the next cell.`,
              },

              // ── Cell 2 — First exercise ──────────────────────────────────
              {
                type: 'js',
                instruction: `WHAT THE STUDENT IS ABOUT TO DO. What to change. What to observe.`,
                html: `<div id="container">
  <h2>HEADING TEXT</h2>
  <p>PARAGRAPH TEXT</p>
  <button id="btn">BUTTON LABEL</button>
  <div id="output"></div>
</div>`,
                css: `body {
  background: #0f172a;
  color: #e2e8f0;
  font-family: 'Segoe UI', sans-serif;
  padding: 20px;
}
h2 { color: #38bdf8; margin: 0 0 12px; }
p  { color: #94a3b8; margin: 0 0 12px; font-size: 14px; }
button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
button:hover { background: #1d4ed8; }
#output { margin-top: 12px; font-size: 14px; color: #86efac; }`,
                startCode: `// COMMENT: WHAT THIS CODE DOES

const btn = document.getElementById('btn');
const output = document.getElementById('output');

btn.addEventListener('click', () => {
  // TODO: write the event handler
  output.textContent = 'EXPECTED OUTPUT TEXT';
});`,
                outputHeight: 200,
              },

              // ── Cell 3 — Second exercise ─────────────────────────────────
              {
                type: 'js',
                instruction: `BUILD ON THE FIRST CELL. This exercise adds NEXT CONCEPT.`,
                html: `<!-- HTML FOR SECOND EXERCISE -->
<div id="app">
  <p>STARTER CONTENT</p>
</div>`,
                css: `body {
  background: #0f172a;
  color: #e2e8f0;
  font-family: sans-serif;
  padding: 20px;
}`,
                startCode: `// SECOND EXERCISE CODE
const app = document.getElementById('app');

// Your code here`,
                outputHeight: 200,
              },

              // ── Cell 4 — Challenge ───────────────────────────────────────
              {
                type: 'js',
                instruction: `**Challenge: BUILD SOMETHING HARDER.** DESCRIBE THE REQUIREMENTS.\n\n- Requirement 1\n- Requirement 2\n- Requirement 3`,
                html: `<!-- Start from scratch or copy from the cells above -->`,
                css: `body { background: #0f172a; color: #e2e8f0; font-family: sans-serif; padding: 20px; }`,
                startCode: `// Your solution here\n`,
                outputHeight: 250,
              },

            ],
          },
        },
      },
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      question: `QUESTION TEXT`,
      options: ['Option A text', 'Option B text', 'Option C text', 'Option D text'],
      answer: 'Option A text',   // ← copy-paste from options exactly
      hints: [`HINT`],
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
  ],
}

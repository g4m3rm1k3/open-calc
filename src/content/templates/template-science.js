// ═══════════════════════════════════════════════════════════════════════════
// SCIENCE LESSON TEMPLATE
// Use for: Chemistry, Biology, Earth Science, Physics conceptual
//          Mixes narrative, interactive demos, and concept checks.
//
// CELL TYPES:
//   'markdown'  — narrative text, no code output (use full Markdown)
//   'js'        — HTML/CSS/JS demo with a live rendered preview panel
//   'choice'    — multiple-choice question with instant feedback
//
// WRITING TIPS:
//   - markdown cells: tell the story — start surprising, explain why
//   - js cells: one slider, one canvas, one insight text — keep it focused
//   - Use CSS variables for theme support: var(--color-background-primary)
//
// SUBMIT: email your completed file to m1k3ymcl34n@gmail.com
//         subject: [Lesson Submission] YOUR TITLE
// ═══════════════════════════════════════════════════════════════════════════

// Store lesson content separately so it stays tidy
const LESSON = {
  title: 'YOUR LESSON TITLE',
  subtitle: 'One sentence: what phenomenon this lesson explains.',
  sequential: true,

  cells: [

    // ── Cell 1 — Opening story ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### OPENING HOOK — A SURPRISING OBSERVATION

TELL THE STORY. Start with something concrete and surprising. Do not list facts — write in prose like a good science book.

For example: "Take two grams of hydrogen and sixteen grams of oxygen. Ignite them. You always get exactly eighteen grams of water. Why should they combine in exactly those proportions — and not a little more or less of either?"

Then explain **why** the observation happens. Introduce the key concept after the student has seen it in action.

Use **bold** for key terms on their first appearance.

Aim for 3–4 paragraphs before the first interactive cell.`,
    },

    // ── Cell 2 — First interactive demo ──────────────────────────────────
    {
      type: 'js',
      instruction: `TELL THE STUDENT WHAT TO DO: drag the slider, observe what changes. Ask them to predict before interacting.`,
      html: `<div class="scene">
  <div class="controls">
    <label class="ctrl">
      <span class="label">PARAMETER NAME: <span id="val">5</span></span>
      <input type="range" id="slider" min="1" max="10" value="5" step="0.1">
    </label>
  </div>
  <canvas id="cv" width="500" height="180"></canvas>
  <div class="insight" id="insight">INITIAL INSIGHT TEXT — what to look for.</div>
</div>`,
      css: `body { margin: 0; padding: 14px; font-family: sans-serif; background: var(--color-background-primary, #fff); }
.scene  { display: flex; flex-direction: column; gap: 10px; }
.controls { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.ctrl   { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-primary, #333); }
.label  { white-space: nowrap; min-width: 160px; }
canvas  { border-radius: 8px; background: var(--color-background-secondary, #f8fafc); border: 1px solid var(--color-border-tertiary, #e2e8f0); display: block; width: 100%; }
.insight { font-size: 12px; color: var(--color-text-secondary, #64748b); line-height: 1.6; padding: 8px 12px; border-left: 2px solid var(--color-border-secondary, #cbd5e1); border-radius: 0 6px 6px 0; }`,
      startCode: `const cv      = document.getElementById('cv');
const ctx     = cv.getContext('2d');
const slider  = document.getElementById('slider');
const valEl   = document.getElementById('val');
const insight = document.getElementById('insight');

function draw(value) {
  ctx.clearRect(0, 0, cv.width, cv.height);
  valEl.textContent = value.toFixed(1);

  // ── YOUR VISUALIZATION HERE ──────────────────────────────────────
  // Example: draw something that changes with value
  const r = value * 12;
  ctx.beginPath();
  ctx.arc(cv.width / 2, cv.height / 2, r, 0, Math.PI * 2);
  ctx.fillStyle = '#60a5fa';
  ctx.fill();
  // ─────────────────────────────────────────────────────────────────

  // Update the insight text based on value
  if (value < 4) {
    insight.textContent = 'LOW VALUE OBSERVATION — explain what this means.';
  } else if (value < 7) {
    insight.textContent = 'MID VALUE OBSERVATION — explain what this means.';
  } else {
    insight.textContent = 'HIGH VALUE OBSERVATION — explain what this means.';
  }
}

slider.oninput = () => draw(parseFloat(slider.value));
draw(parseFloat(slider.value));`,
    },

    // ── Cell 3 — Continue the story ───────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### NEXT PART OF THE STORY

CONTINUE THE NARRATIVE. Connect what the student just observed to the underlying mechanism.

Introduce the key concept more formally here — after they have seen it in action.

Optional: include a formula if relevant. Math is rendered automatically:

Inline: $E = mc^2$

Block:
$$
F = ma
$$

Then bridge to the next demo or concept check.`,
    },

    // ── Cell 4 — Second interactive demo ─────────────────────────────────
    {
      type: 'js',
      instruction: `INSTRUCTIONS FOR SECOND DEMO. Slightly more complex than the first.`,
      html: `<!-- Your HTML here -->
<div class="scene">
  <canvas id="cv2" width="500" height="200"></canvas>
  <p id="info" style="text-align:center;font-size:13px;margin-top:8px;color:#94a3b8;">
    INFO TEXT
  </p>
</div>`,
      css: `body { margin: 0; padding: 14px; font-family: sans-serif; background: var(--color-background-primary, #fff); }
canvas { border-radius: 8px; display: block; width: 100%; border: 1px solid var(--color-border-tertiary, #e2e8f0); }`,
      startCode: `const cv2 = document.getElementById('cv2');
const ctx2 = cv2.getContext('2d');
const info = document.getElementById('info');

// YOUR VISUALIZATION CODE HERE
ctx2.fillStyle = '#334155';
ctx2.font = '14px sans-serif';
ctx2.textAlign = 'center';
ctx2.fillText('Replace this with your visualization', cv2.width / 2, cv2.height / 2);`,
    },

    // ── Cell 5 — Concept check ────────────────────────────────────────────
    {
      type: 'choice',
      instruction: `**Check your understanding.** QUESTION ABOUT THE CONCEPT JUST DEMONSTRATED.`,
      options: [
        { label: 'OPTION A TEXT', correct: false, explanation: `WHY A IS WRONG.` },
        { label: 'OPTION B TEXT', correct: true,  explanation: `WHY B IS CORRECT — connect back to the demo.` },
        { label: 'OPTION C TEXT', correct: false, explanation: `WHY C IS WRONG.` },
        { label: 'OPTION D TEXT', correct: false, explanation: `WHY D IS WRONG.` },
      ],
    },

    // ── Cell 6 — Summary ─────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### What you have learned

SUMMARIZE IN 2–3 SENTENCES. Then bridge to the next lesson.

**Key takeaways:**
- TAKEAWAY 1
- TAKEAWAY 2
- TAKEAWAY 3

**Next lesson:** DESCRIBE WHAT COMES NEXT AND HOW IT CONNECTS.`,
    },

    // ── Cell 7 — Final concept check ─────────────────────────────────────
    {
      type: 'choice',
      instruction: `**Final check.** A harder question combining two ideas from this lesson.`,
      options: [
        { label: 'OPTION A TEXT', correct: false, explanation: `EXPLANATION.` },
        { label: 'OPTION B TEXT', correct: false, explanation: `EXPLANATION.` },
        { label: 'OPTION C TEXT', correct: true,  explanation: `WHY THIS IS CORRECT.` },
        { label: 'OPTION D TEXT', correct: false, explanation: `EXPLANATION.` },
      ],
    },

  ],
}

// ── Lesson export ──────────────────────────────────────────────────────────
export default {
  // id format: chem-CHAPTER-ORDER-SLUG
  // Examples: 'chem-1-002-periodic-table'  |  'bio-1-003-cell-division'
  id: 'chem-CHAPTER-ORDER-SLUG',
  slug: 'url-friendly-slug',
  chapter: 'chem-1',
  order: 1,
  title: LESSON.title,
  subtitle: LESSON.subtitle,
  tags: ['chemistry', 'KEYWORD1', 'KEYWORD2'],

  hook: {
    question: `MOTIVATING QUESTION`,
    realWorldContext: `REAL-WORLD APPLICATION OF THIS CONCEPT`,
  },

  intuition: {
    prose: [`BRIEF SUMMARY PARAGRAPH`],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter X, Lesson Y',
        body: `**Previous:** PREVIOUS LESSON\n**This:** THIS LESSON\n**Next:** NEXT LESSON`,
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: LESSON.title,
        props: { lesson: LESSON },
      },
    ],
  },
}

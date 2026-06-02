# Science Lesson Template

Use this for Chemistry, Biology, Earth Science, or Physics conceptual lessons — subjects that mix narrative, interactive demos, and concept checks.

> **Download the template:** Go to the **Templates** tab and click Download next to **Science Lesson**.

The science notebook is **story-driven**: markdown cells tell the story, interactive JS cells show the phenomenon, and challenge cells test understanding.

---

## Cell types

| type | What it does |
|------|-------------|
| `markdown` | Narrative text using full Markdown. No code output. |
| `js` | A live HTML/CSS/JS demo with a rendered preview panel. Use for interactive sliders, animations, and diagrams. |
| `choice` | A multiple-choice question with instant feedback. |

---

## Template

```js
// Store the lesson as a constant and export separately
// so it can be referenced in the module export below.
const LESSON_CONTENT = {
  title: 'Lesson Title',
  subtitle: 'One sentence: what phenomenon this lesson explains.',
  sequential: true,

  cells: [

    // ── Cell 1 — Opening narrative ────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### [Opening hook — a surprising observation or question]

[Tell the story of the phenomenon. Write like a good popular science book: start with something concrete and surprising, then explain why it happens.

Use **bold** for key terms on their first appearance. Use mathematical notation sparingly and only after the concept is clear in words.

Aim for 3–5 paragraphs. Do not use bullet points here — tell the story in prose.]`,
    },

    // ── Cell 2 — First interactive demo ──────────────────────────────────
    {
      type: 'js',
      instruction: `[Explain what the student is about to interact with. What should they look for? What prediction should they make before dragging the slider?]`,
      html: `<div class="scene">
  <div class="controls">
    <label class="ctrl">
      <span class="label">[Parameter name]: <span id="val">5</span></span>
      <input type="range" id="slider" min="1" max="10" value="5" step="0.1">
    </label>
  </div>
  <canvas id="cv" width="500" height="200"></canvas>
  <div class="insight" id="insight">
    [Initial insight text]
  </div>
</div>`,
      css: `body { margin: 0; padding: 14px; font-family: sans-serif; background: var(--color-background-primary, #fff); }
.scene { display: flex; flex-direction: column; gap: 10px; }
.controls { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.ctrl { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-primary, #333); }
.label { white-space: nowrap; min-width: 140px; }
canvas { border-radius: 8px; background: var(--color-background-secondary, #f8fafc); border: 1px solid var(--color-border-tertiary, #e2e8f0); display: block; width: 100%; }
.insight { font-size: 12px; color: var(--color-text-secondary, #64748b); line-height: 1.6; padding: 8px 12px; border-left: 2px solid var(--color-border-secondary, #cbd5e1); border-radius: 0 6px 6px 0; }`,
      startCode: `const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const slider = document.getElementById('slider');
const valEl = document.getElementById('val');
const insightEl = document.getElementById('insight');

function draw(value) {
  ctx.clearRect(0, 0, cv.width, cv.height);
  valEl.textContent = value;

  // --- Draw your visualization here ---
  // Example: draw circles proportional to value
  const r = value * 10;
  ctx.beginPath();
  ctx.arc(cv.width / 2, cv.height / 2, r, 0, Math.PI * 2);
  ctx.fillStyle = '#60a5fa';
  ctx.fill();

  // Update insight text based on value
  if (value < 4) {
    insightEl.textContent = '[Observation for low values]';
  } else if (value < 7) {
    insightEl.textContent = '[Observation for mid values]';
  } else {
    insightEl.textContent = '[Observation for high values]';
  }
}

slider.oninput = () => draw(parseFloat(slider.value));
draw(parseFloat(slider.value));`,
    },

    // ── Cell 3 — Second narrative ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### [Next part of the story]

[Continue the narrative. Connect what the student just observed in the demo to the underlying mechanism. Introduce the key concept formally here, after they have seen it in action.

$[Optional formula if relevant — rendered by KaTeX]$

[Continue the explanation. Build toward the next demo or concept check.]`,
    },

    // ── Cell 4 — Second interactive demo ─────────────────────────────────
    {
      type: 'js',
      instruction: `[Instructions for the second demo. This one should be slightly more complex than the first.]`,
      html: `<!-- Your HTML -->`,
      css: `/* Your CSS */`,
      startCode: `// Your JavaScript`,
    },

    // ── Cell 5 — Concept check ────────────────────────────────────────────
    {
      type: 'choice',
      instruction: `**Check your understanding.** [Question about the concept just demonstrated.]`,
      options: [
        { label: 'Option A', correct: false, explanation: `[Why A is wrong]` },
        { label: 'Option B', correct: true,  explanation: `[Why B is correct — connect back to the demo or narrative]` },
        { label: 'Option C', correct: false, explanation: `[Why C is wrong]` },
        { label: 'Option D', correct: false, explanation: `[Why D is wrong]` },
      ],
    },

    // ── Cell 6 — Closing narrative ────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### What you have learned

[Summarize the key idea in 2–3 sentences. Then bridge to the next lesson: "In the next lesson, we will see how [this concept] connects to [next concept]."]

**Key takeaways:**
- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]`,
    },

    // ── Cell 7 — Final concept check ─────────────────────────────────────
    {
      type: 'choice',
      instruction: `**Final check.** [A harder question that requires combining two ideas from the lesson.]`,
      options: [
        { label: 'Option A', correct: false, explanation: `[Explanation]` },
        { label: 'Option B', correct: false, explanation: `[Explanation]` },
        { label: 'Option C', correct: true,  explanation: `[Why this is correct]` },
        { label: 'Option D', correct: false, explanation: `[Explanation]` },
      ],
    },

  ],
}

export default {
  id: 'chem-chapter-order-slug',   // e.g. 'chem-1-002-periodic-table'
  slug: 'descriptive-slug',
  chapter: 'chem-1',
  order: 2,
  title: LESSON_CONTENT.title,
  subtitle: LESSON_CONTENT.subtitle,
  tags: ['chemistry', 'keyword1', 'keyword2'],

  hook: {
    question: `[Motivating question]`,
    realWorldContext: `[Real-world application of this concept]`,
  },

  intuition: {
    prose: [`[Brief summary paragraph]`],
    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter X, Lesson Y',
        body: `**Previous:** [previous]\n**This:** [this]\n**Next:** [next]`,
      },
    ],
    visualizations: [
      {
        id: 'ScienceNotebook',
        title: LESSON_CONTENT.title,
        props: { lesson: LESSON_CONTENT },
      },
    ],
  },
}
```

---

## Writing good JS cells for science lessons

The built-in CSS variables match the app's light and dark themes:

```css
var(--color-background-primary)    /* page background */
var(--color-background-secondary)  /* card background */
var(--color-text-primary)          /* main text */
var(--color-text-secondary)        /* muted text */
var(--color-border-tertiary)       /* light border */
```

Using these ensures your demo looks correct in both light and dark mode.

**Keep demos focused:** one slider, one canvas, one insight. The goal is to isolate the variable the student is changing so the cause-and-effect is clear.

**Write insight text:** after a student drags a slider, the `insight` div should update with a plain-English explanation of what changed and why. This is the most important learning moment in the cell.

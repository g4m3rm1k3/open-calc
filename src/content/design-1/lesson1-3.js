// LESSON_DESIGN_03.js
// Lesson 3 — Typography Systems
// The problem: type decisions made by feel produce inconsistent sizes,
// broken rhythm, unreadable line lengths, and hierarchy that collapses
// under real content. Typography is the most-used element in any UI and
// the most commonly broken.
// Concepts: modular type scale, line-height, measure, weight as signal,
//           fluid type, optical sizing, the readability triad.

const LESSON_DESIGN_03 = {
  title: 'Typography Systems',
  subtitle: 'Turn font-size, line-height, and measure into a deterministic system that produces readable type at every scale.',
  sequential: true,
  cells: [

    // ─── PART 0: RECAP ────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Recap: What Lessons 1 & 2 Established

You now have two interlocking systems:

**From Lesson 1:** Every element belongs to one of four visual levels. Size, weight, and colour encode that level. The 1.5× ratio is the minimum distinguishable size difference between levels.

**From Lesson 2:** Every spacing value comes from an 8-token scale derived from a 4px base unit. The \`auditSpacing()\` function verifies compliance. Proximity expresses relationship.

But there's a gap. Lesson 1 said "Level 1 should be ≥32px and weight 700." It didn't explain *where* 32px comes from, or what the exact size should be for a 14px body copy context, or how line-height should change as font-size changes. Those decisions were still arbitrary.

---

## The Question This Lesson Answers

> Given a body text size of 16px, what should every other size in the system be? And how do you choose line-height, line length, and font weight so that reading the text is effortless rather than fatiguing?

Typography in UI isn't about choosing nice fonts. It's about **three measurable properties of readable text**:

1. **Size contrast** — the ratio between type levels (covered in Lesson 1, now formalised)
2. **Line-height** — vertical breathing room per level
3. **Measure** — the horizontal line length that maximises comprehension

Every decision in this lesson is derived, not chosen. By the end you'll have a complete type system that generates the right values for any base size.`,
    },

    // ─── PART 1: THE BROKEN BASELINE ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `## The Problem: Typography by Feel

This article card was built by choosing type values that "looked right" — a common workflow that produces common failures.

Run the audit. Before looking at the output, note your observations:
- Does the heading feel appropriately dominant?
- Can you comfortably read a full line of the body text?
- Does the spacing between lines feel tight, right, or airy?
- Does the metadata at the bottom feel receded or competing?

The audit measures three things: size ratios between levels, line-height per level, and estimated characters-per-line (measure). You'll see how many values fall outside the readable range.`,
      html: `<div class="article-card">
  <span class="category">PRODUCT</span>
  <h2 class="headline">How we rebuilt our data pipeline from scratch in 6 weeks</h2>
  <p class="byline">Sarah Chen · March 14, 2025 · 8 min read</p>
  <p class="body">When our data pipeline started failing under load, we had two choices: patch it or rebuild it. We chose to rebuild. Here's what we learned about designing systems that scale — and why the conventional wisdom about incremental migration doesn't always apply to data infrastructure.</p>
  <div class="article-footer">
    <span class="tag">Engineering</span>
    <span class="tag">Data</span>
    <span class="read-more">Read full article →</span>
  </div>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
.article-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px;
  padding: 28px; width: 520px; }

/* BROKEN TYPE — no system */
.category  { font-size: 10px; font-weight: 700; color: #3b82f6;
  letter-spacing: 0.12em; text-transform: uppercase; }
.headline  { font-size: 19px; font-weight: 700; color: #f1f5f9;
  line-height: 1.2; margin: 6px 0 4px; }
.byline    { font-size: 12px; color: #64748b; margin: 0 0 10px; line-height: 1.4; }
.body      { font-size: 15px; color: #94a3b8; line-height: 1.5;  /* ← too tight for body */
  margin: 0 0 16px; }
.article-footer { display: flex; align-items: center; gap: 8px; }
.tag       { font-size: 11px; font-weight: 500; color: #64748b;
  background: #0f172a; border: 1px solid #334155;
  padding: 3px 8px; border-radius: 100px; }
.read-more { font-size: 14px; font-weight: 600; color: #60a5fa;
  margin-left: auto; }`,
      startCode: `// Audit: measure type ratios, line-heights, and estimated measure

function auditType(selectors) {
  console.log('=== TYPOGRAPHY AUDIT ===\\n');

  const results = selectors.map(({ sel, label }) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const s   = window.getComputedStyle(el);
    const fs  = parseFloat(s.fontSize);
    const lh  = parseFloat(s.lineHeight);
    const lhRatio = (lh / fs).toFixed(2);
    // Estimate characters per line from element width and font size
    const w   = el.clientWidth;
    const cpl = Math.round(w / (fs * 0.52)); // ~0.52 avg char width ratio
    return { label, fs, lh, lhRatio, cpl };
  });

  results.filter(Boolean).forEach((r, i) => {
    const lhOk  = r.lhRatio >= 1.3 && r.lhRatio <= 1.8;
    const cplOk = r.cpl >= 45 && r.cpl <= 75;
    console.log(r.label);
    console.log('  font-size:   ' + r.fs + 'px');
    console.log('  line-height: ' + r.lh + 'px (' + r.lhRatio + '×) ' +
      (lhOk ? '✓' : '✗ ideal: 1.3–1.8×'));
    console.log('  ~chars/line: ' + r.cpl + ' ' +
      (r.fs < 13 ? '(label — no measure constraint)' : cplOk ? '✓' : '✗ ideal: 45–75'));
    console.log('');
  });

  // Size ratios between levels
  const vals = results.filter(Boolean).map(r => r.fs);
  console.log('SIZE RATIOS (each level vs next):');
  for (let i = 0; i < vals.length - 1; i++) {
    const ratio = (vals[i] / vals[i+1]).toFixed(2);
    console.log('  L' + (i+1) + '→L' + (i+2) + ': ' + ratio + '× ' +
      (ratio >= 1.2 ? '✓' : '✗ too close — levels will merge'));
  }
}

auditType([
  { sel: '.headline', label: 'HEADLINE (L1)' },
  { sel: '.byline',   label: 'BYLINE (L3)'   },
  { sel: '.body',     label: 'BODY (L2)'     },
  { sel: '.tag',      label: 'TAG (L4)'      },
]);`,
      outputHeight: 460,
    },

    // ─── PART 2: THE MODULAR SCALE ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The Modular Type Scale

The modular scale is a sequence of sizes where each value is the previous value multiplied by a fixed ratio. You choose a base size and a ratio — the scale generates every other size.

### Why a Ratio and Not a List?

Arbitrary size lists (12, 14, 16, 20, 24, 32) look like they have a system but don't — the gaps between steps are irregular (2, 2, 4, 4, 8), which produces uneven visual rhythm.

A ratio-based scale produces sizes where the *perceptual distance* between every adjacent pair is equal. This is why it creates visual harmony — the same way a musical scale creates harmonic intervals.

### Common Ratios

| Ratio | Name | Use case |
|---|---|---|
| 1.067 | Minor Second | Very dense data UIs — small steps |
| 1.125 | Major Second | Dashboard, admin panels |
| 1.250 | Major Third | Standard web app |
| 1.333 | Perfect Fourth | Marketing + editorial |
| 1.500 | Perfect Fifth | Large-format editorial |
| 1.618 | Golden Ratio | Maximum contrast — display type |

For most UI: **1.25 (Major Third)** or **1.333 (Perfect Fourth)**.

### The Formula

\`\`\`
scale[n] = base × ratio^n

With base = 16px, ratio = 1.25:
  scale[0]  = 16 × 1.25⁰ = 16.00px  (base — body copy)
  scale[1]  = 16 × 1.25¹ = 20.00px  (L3 subheading)
  scale[2]  = 16 × 1.25² = 25.00px  (L2 section heading)
  scale[3]  = 16 × 1.25³ = 31.25px  (L1 page title)
  scale[-1] = 16 × 1.25⁻¹ = 12.80px (L4 caption)
  scale[-2] = 16 × 1.25⁻² = 10.24px (L4 label)
\`\`\`

In practice, round to the nearest whole pixel. The human eye cannot detect a 0.25px difference, but the rounding to a clean integer prevents sub-pixel rendering artefacts.

### The Connection to Lesson 1

Lesson 1's rule was "size ratio must be ≥ 1.3× between levels." The modular scale makes this automatic: every step in the scale is exactly the ratio apart. A 1.25 ratio gives you 1.25× — barely sufficient. A 1.333 ratio is ideal for most app UI.`,
    },

    // ─── PART 3: BUILDING THE SCALE IN CODE ──────────────────────────────────
    {
      type: 'js',
      instruction: `## The Scale as Code: CSS Custom Properties

The same pattern from the spacing system: define the scale once as custom properties, reference tokens everywhere. The base and ratio are single values — change them and the entire type system updates.

The cell below generates a complete type scale and renders it visually. You can see the perceptual stepping — each size feels a consistent "distance" from the next.

Experiment: change \`--ratio\` from \`1.333\` to \`1.5\` and to \`1.125\`. Notice how the scale becomes either dramatically contrasted or nearly flat. This is where you tune the system to your content density.`,
      html: `<div class="scale-demo">
  <div class="scale-row">
    <div class="scale-size" id="s6"></div>
    <div class="scale-text" id="t6" style="font-size:var(--fs-6)">Display — fs-6</div>
  </div>
  <div class="scale-row">
    <div class="scale-size" id="s5"></div>
    <div class="scale-text" id="t5" style="font-size:var(--fs-5)">Heading 1 — fs-5</div>
  </div>
  <div class="scale-row">
    <div class="scale-size" id="s4"></div>
    <div class="scale-text" id="t4" style="font-size:var(--fs-4)">Heading 2 — fs-4</div>
  </div>
  <div class="scale-row">
    <div class="scale-size" id="s3"></div>
    <div class="scale-text" id="t3" style="font-size:var(--fs-3)">Subheading — fs-3</div>
  </div>
  <div class="scale-row">
    <div class="scale-size" id="s2"></div>
    <div class="scale-text" id="t2" style="font-size:var(--fs-2)">Body — fs-2 (base)</div>
  </div>
  <div class="scale-row">
    <div class="scale-size" id="s1"></div>
    <div class="scale-text" id="t1" style="font-size:var(--fs-1)">Caption — fs-1</div>
  </div>
  <div class="scale-row">
    <div class="scale-size" id="s0"></div>
    <div class="scale-text" id="t0" style="font-size:var(--fs-0)">Label — fs-0</div>
  </div>
</div>`,
      css: `body { background: #0f172a; padding: 28px; margin: 0; font-family: system-ui, sans-serif; }
:root {
  --base:  16;
  --ratio: 1.333;
}
.scale-demo { max-width: 560px; }
.scale-row  { display: flex; align-items: baseline; gap: 16px;
  padding: 6px 0; border-bottom: 1px solid #1e293b; }
.scale-size { font-family: monospace; font-size: 11px; color: #334155;
  width: 80px; flex-shrink: 0; text-align: right; }
.scale-text { color: #f1f5f9; font-weight: 500; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; }`,
      startCode: `// Generate the type scale from base and ratio
const base  = 16;
const ratio = 1.333; // Perfect Fourth — change to 1.25, 1.5, 1.618 to compare

const root  = document.documentElement;
const steps = [-2, -1, 0, 1, 2, 3, 4]; // exponents

// Assign CSS custom properties
steps.forEach((exp, i) => {
  const raw    = base * Math.pow(ratio, exp);
  const px     = Math.round(raw);
  const token  = '--fs-' + i;
  root.style.setProperty(token, px + 'px');

  // Update the size label
  const sizeEl = document.getElementById('s' + i);
  const textEl = document.getElementById('t' + i);
  if (sizeEl) sizeEl.textContent = px + 'px';
  // Apply the computed font-size (CSS var is already set via inline style)
});

console.log('=== TYPE SCALE (base=' + base + 'px, ratio=' + ratio + ') ===\\n');
steps.forEach((exp, i) => {
  const px    = Math.round(base * Math.pow(ratio, exp));
  const label = ['Label', 'Caption', 'Body (base)', 'Subheading', 'H2', 'H1', 'Display'][i];
  const ratio_to_prev = i > 0
    ? (px / Math.round(base * Math.pow(ratio, steps[i-1]))).toFixed(3) + '× prev'
    : '(base)';
  console.log('fs-' + i + ': ' + px + 'px  (' + label + ')  ' + ratio_to_prev);
});

console.log('\\nTry these ratios to feel the difference:');
console.log('  1.125 — dense (admin/dashboard)');
console.log('  1.250 — standard app');
console.log('  1.333 — editorial (current)');
console.log('  1.500 — high-contrast display');`,
      outputHeight: 340,
    },

    // ─── PART 4: LINE-HEIGHT AS A FUNCTION ────────────────────────────────────
    {
      type: 'js',
      instruction: `## Line-Height: Not a Constant, a Function

The single most common typography mistake is using a fixed \`line-height\` across all type sizes. Line-height should be **inversely proportional to font-size** — larger text needs less relative breathing room, smaller text needs more.

Why? Because line-height determines how easily the eye tracks from the end of one line to the beginning of the next. For large text (headings), the large x-height of each letter already provides visual separation. For small text (body, captions), the letters are close together vertically and the eye needs more space to find the next line.

**The function:**
\`\`\`
line-height = base-lh - (size - base-size) × k
\`\`\`

Where:
- \`base-lh\` = line-height ratio for body text (1.6 for reading, 1.4 for UI)
- \`base-size\` = your base font-size (16px)
- \`k\` = the rate of decrease (0.01 per px is a good starting point)

**Practical values for UI:**

| Role | Size | Line-height ratio |
|---|---|---|
| Display / Hero | 40–64px | 1.0–1.1 |
| H1 | 28–40px | 1.1–1.2 |
| H2 / Subheading | 20–28px | 1.25–1.3 |
| Body / UI text | 14–18px | 1.5–1.65 |
| Caption / Label | 10–13px | 1.3–1.4 |

Notice captions get *less* line-height than body — they're short, multi-word labels read as chunks, not as continuous prose.`,
      html: `<div id="lh-demo">
  <div class="lh-row" id="lh-display">
    <div class="lh-label">Display · 48px</div>
    <div class="lh-sample display-text">
      How we rebuilt our data pipeline
    </div>
  </div>
  <div class="lh-row" id="lh-h1">
    <div class="lh-label">H1 · 32px</div>
    <div class="lh-sample h1-text">
      How we rebuilt our data pipeline from scratch
    </div>
  </div>
  <div class="lh-row" id="lh-body">
    <div class="lh-label">Body · 16px</div>
    <div class="lh-sample body-text">
      When our data pipeline started failing under load, we had two choices:
      patch it or rebuild it. We chose to rebuild. Here's what we learned about
      designing systems that scale.
    </div>
  </div>
  <div class="lh-row" id="lh-caption">
    <div class="lh-label">Caption · 12px</div>
    <div class="lh-sample caption-text">
      Sarah Chen · March 14 · 8 min read · Engineering · Data Infrastructure
    </div>
  </div>
</div>`,
      css: `body { background: #0f172a; padding: 24px; margin: 0; font-family: system-ui, sans-serif; }
#lh-demo { max-width: 580px; display: flex; flex-direction: column; gap: 24px; }
.lh-row   { display: flex; flex-direction: column; gap: 6px; }
.lh-label { font-size: 10px; font-weight: 600; color: #334155;
  letter-spacing: 0.1em; text-transform: uppercase; font-family: monospace; }
.display-text { font-size: 48px; font-weight: 700; color: #f1f5f9; }
.h1-text      { font-size: 32px; font-weight: 700; color: #f1f5f9; }
.body-text    { font-size: 16px; color: #94a3b8; max-width: 54ch; }
.caption-text { font-size: 12px; color: #64748b; }`,
      startCode: `// Apply the line-height function to each text level
// line-height-ratio = base_lh - (size - base_size) * k

const BASE_SIZE = 16;
const BASE_LH   = 1.6;  // body text starting point
const K         = 0.012; // rate of decrease per px above base

function lhForSize(sizePx) {
  const raw = BASE_LH - (sizePx - BASE_SIZE) * K;
  // Clamp: minimum 1.0 (display), maximum 1.7 (very small)
  return Math.max(1.0, Math.min(1.7, raw)).toFixed(2);
}

const levels = [
  { sel: '.display-text', size: 48 },
  { sel: '.h1-text',      size: 32 },
  { sel: '.body-text',    size: 16 },
  { sel: '.caption-text', size: 12 },
];

console.log('=== LINE-HEIGHT FUNCTION ===\\n');
console.log('Formula: base_lh(' + BASE_LH + ') - (size - ' + BASE_SIZE + ') × ' + K);
console.log('');

levels.forEach(({ sel, size }) => {
  const lhRatio = lhForSize(size);
  const lhPx    = Math.round(size * lhRatio);
  const el      = document.querySelector(sel);
  if (el) el.style.lineHeight = lhRatio;

  console.log(sel + ' · ' + size + 'px');
  console.log('  ratio: ' + lhRatio + ' · absolute: ' + lhPx + 'px');
  console.log('');
});

console.log('Observe: display text (48px) is tight (lhRatio ≈ 1.0–1.1).');
console.log('Body text (16px) is airy (lhRatio = ' + lhForSize(16) + ').');
console.log('Both are correct for their role.');`,
      outputHeight: 420,
    },

    // ─── PART 5: MEASURE — LINE LENGTH ────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Measure: The Line Length Problem

**Measure** is the typographic term for line length — the number of characters that fit on a single line. It's one of the most directly measurable readability factors, and one of the most frequently ignored in UI.

**The research finding** (Bringhurst, *The Elements of Typographic Style*; confirmed by multiple eye-tracking studies):

> The optimal line length for body text is **45–75 characters per line** (including spaces). Below 45: too many line breaks, eye movement disrupts flow. Above 75: the eye struggles to find the next line, reading slows and errors increase.

In CSS, measure is controlled with \`max-width\` using the \`ch\` unit — where \`1ch\` equals the width of the "0" character in the current font. \`max-width: 65ch\` gives approximately 65 characters per line.

**The rule by context:**

| Context | Ideal measure |
|---|---|
| Long-form reading (articles, docs) | 60–75ch |
| UI body text (cards, descriptions) | 45–65ch |
| Captions, hints | 40–55ch |
| Headings | No max-width — they're short |
| Labels | No max-width — they're single lines |

The cell below demonstrates what happens at different line lengths. Drag the slider and feel the reading experience change.`,
      html: `<div id="measure-demo">
  <div id="measure-controls">
    <label>
      max-width: <span id="measure-val">65ch</span>
      <input type="range" id="measure-slider" min="20" max="120" value="65">
    </label>
    <div id="measure-verdict">✓ Good measure for body text</div>
  </div>
  <article id="measure-text">
    <h2 class="article-h">How we rebuilt our data pipeline from scratch in 6 weeks</h2>
    <p class="article-p">When our data pipeline started failing under load, we had two choices: patch it or rebuild it. We chose to rebuild. Here's what we learned about designing systems that scale — and why the conventional wisdom about incremental migration doesn't always apply to data infrastructure at this scale.</p>
    <p class="article-p">The most important lesson was that a failed system tells you exactly what it needs. Every failure mode is a specification. The pipeline was failing because it was designed for batch processing but being asked to handle streaming data — a fundamental mismatch that no amount of patching would fix.</p>
  </article>
</div>`,
      css: `body { background: #0f172a; padding: 28px; margin: 0;
  font-family: system-ui, sans-serif; }
#measure-demo { max-width: 720px; }
#measure-controls { margin-bottom: 20px; display: flex; align-items: center; gap: 16px; }
#measure-controls label { font-size: 12px; color: #64748b; display: flex;
  align-items: center; gap: 8px; }
#measure-controls label span { color: #f1f5f9; font-weight: 600;
  font-family: monospace; min-width: 44px; }
#measure-controls input { width: 160px; accent-color: #2563eb; }
#measure-verdict { font-size: 12px; font-family: monospace; }
#measure-text { transition: max-width 0.1s; }
.article-h { font-size: 24px; font-weight: 700; color: #f1f5f9;
  line-height: 1.25; margin: 0 0 16px; }
.article-p { font-size: 16px; color: #94a3b8; line-height: 1.65;
  margin: 0 0 16px; }
.article-p:last-child { margin: 0; }`,
      startCode: `const slider  = document.getElementById('measure-slider');
const valEl   = document.getElementById('measure-val');
const verdict = document.getElementById('measure-verdict');
const text    = document.getElementById('measure-text');

function updateMeasure(ch) {
  text.style.maxWidth = ch + 'ch';
  valEl.textContent   = ch + 'ch';

  if (ch < 35) {
    verdict.textContent = '✗ Too narrow — excessive line breaks disrupt reading';
    verdict.style.color = '#f87171';
  } else if (ch < 45) {
    verdict.textContent = '⚠ Short — acceptable for UI snippets, not body text';
    verdict.style.color = '#fbbf24';
  } else if (ch <= 75) {
    verdict.textContent = '✓ Optimal — 45–75ch is the readable sweet spot';
    verdict.style.color = '#4ade80';
  } else if (ch <= 90) {
    verdict.textContent = '⚠ Wide — noticeable return-sweep effort';
    verdict.style.color = '#fbbf24';
  } else {
    verdict.textContent = '✗ Too wide — reading slows, errors increase';
    verdict.style.color = '#f87171';
  }

  console.log('measure: ' + ch + 'ch | ' + verdict.textContent);
}

slider.oninput = () => updateMeasure(parseInt(slider.value));
updateMeasure(65);

console.log('Drag the slider from 20 to 120. Feel when reading becomes comfortable.');
console.log('The 45–75ch range is a biological constraint, not a style choice.');
console.log('');
console.log('In CSS: max-width: 65ch on body text containers.');
console.log('1ch ≈ 0.5× the font-size in px for most proportional fonts.');
console.log('At 16px body text: 65ch ≈ 520px max-width.');`,
      outputHeight: 420,
    },

    // ─── PART 6: PRACTICE 1 — BUILD YOUR TYPE SCALE ──────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 1: Build Your Own Type Scale

You've seen the modular scale in theory. Now build one from scratch and apply it to a real component.

**The starter code gives you:**
- A working card with unstyled text elements
- The scale formula
- The CSS custom property pattern

**Your task:**
1. Choose a ratio between 1.2 and 1.5 (try 1.25 or 1.333)
2. Generate at least 5 scale steps from a 14px base
3. Apply the correct scale step to each element in the card
4. Set appropriate line-heights for each level using the function from Part 4

There's no single right answer — but the test checks that your scale is mathematically consistent (each step within 5% of base × ratio^n) and that you've applied at least 4 distinct sizes.

**Explore:** What ratio makes the card feel most balanced for this content density? At what ratio does the hierarchy feel too extreme?`,
      html: `<div class="practice-card">
  <div class="pc-eyebrow">ENGINEERING BLOG</div>
  <h1 class="pc-title">Six lessons from rebuilding at scale</h1>
  <p class="pc-subtitle">What a failed pipeline taught us about system design</p>
  <p class="pc-body">We spent six weeks doing what everyone said was impossible: a full rebuild while keeping the system live. The trick wasn't technical — it was understanding which constraints were real and which were inherited assumptions.</p>
  <div class="pc-footer">
    <span class="pc-author">Sarah Chen</span>
    <span class="pc-meta">March 14 · 8 min read</span>
  </div>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
.practice-card { background: #1e293b; border: 1px solid #334155;
  border-radius: 14px; padding: 32px; width: 520px; }
/* Colours are set — you only touch font-size and line-height */
.pc-eyebrow  { color: #3b82f6; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; margin-bottom: 8px; display: block; }
.pc-title    { color: #f1f5f9; font-weight: 700; margin: 0 0 8px;
  max-width: 20ch; }
.pc-subtitle { color: #94a3b8; font-weight: 500; margin: 0 0 16px; }
.pc-body     { color: #64748b; margin: 0 0 20px; max-width: 58ch; }
.pc-footer   { display: flex; align-items: center; gap: 12px;
  padding-top: 16px; border-top: 1px solid #334155; }
.pc-author   { color: #e2e8f0; font-weight: 500; }
.pc-meta     { color: #475569; }`,
      startCode: `// ── STEP 1: Define your scale ────────────────────────────────────────────────
const BASE  = 14;    // body text base — try 14px or 16px
const RATIO = 1.333; // try: 1.2, 1.25, 1.333, 1.5

// Generate scale steps: exponent 0 = base, positive = larger, negative = smaller
function scaleStep(n) {
  return Math.round(BASE * Math.pow(RATIO, n));
}

console.log('Your scale:');
[-2, -1, 0, 1, 2, 3, 4].forEach(n => {
  console.log('  step(' + n + ') = ' + scaleStep(n) + 'px');
});

// ── STEP 2: Line-height function ──────────────────────────────────────────────
function lineHeight(sizePx) {
  // Inverse relationship: larger text → tighter line-height
  const lh = 1.65 - (sizePx - BASE) * 0.012;
  return Math.max(1.0, Math.min(1.75, lh)).toFixed(2);
}

// ── STEP 3: Apply to the card ─────────────────────────────────────────────────
// Assign each element to a scale step
// eyebrow → step(-1) or step(-2)  (small label)
// title   → step(3) or step(4)    (dominant heading — Level 1)
// subtitle→ step(1) or step(2)    (Level 2)
// body    → step(0)               (Level 3 — base)
// author  → step(0)               (Level 3)
// meta    → step(-1)              (Level 4)

const assignments = [
  { sel: '.pc-eyebrow', step: -1 },  // YOUR CHOICE — change these
  { sel: '.pc-title',   step: 3  },
  { sel: '.pc-subtitle',step: 1  },
  { sel: '.pc-body',    step: 0  },
  { sel: '.pc-author',  step: 0  },
  { sel: '.pc-meta',    step: -1 },
];

assignments.forEach(({ sel, step }) => {
  const el = document.querySelector(sel);
  if (!el) return;
  const px = scaleStep(step);
  const lh = lineHeight(px);
  el.style.fontSize   = px + 'px';
  el.style.lineHeight = lh;
  console.log(sel + ' → step(' + step + ') = ' + px + 'px, lh=' + lh);
});

// ── EXPERIMENT: try different ratios ──────────────────────────────────────────
// Change RATIO at the top to 1.25 — how does the card change?
// Change RATIO to 1.5  — is it too dramatic for this content?
// What's your preferred ratio for this card?`,
      solutionCode: `const BASE  = 14;
const RATIO = 1.333;

function scaleStep(n) { return Math.round(BASE * Math.pow(RATIO, n)); }
function lineHeight(px) {
  return Math.max(1.0, Math.min(1.75, 1.65 - (px - BASE) * 0.012)).toFixed(2);
}

const assignments = [
  { sel: '.pc-eyebrow', step: -1 },
  { sel: '.pc-title',   step: 4  },
  { sel: '.pc-subtitle',step: 1  },
  { sel: '.pc-body',    step: 0  },
  { sel: '.pc-author',  step: 0  },
  { sel: '.pc-meta',    step: -1 },
];

assignments.forEach(({ sel, step }) => {
  const el = document.querySelector(sel);
  if (!el) return;
  const px = scaleStep(step);
  el.style.fontSize   = px + 'px';
  el.style.lineHeight = lineHeight(px);
});

console.log('Scale applied. Title:', scaleStep(4) + 'px, body:', scaleStep(0) + 'px');
console.log('Ratio between title and body:', (scaleStep(4)/scaleStep(0)).toFixed(2) + '×');`,
      check: (code) => {
        // Check: uses scaleStep or similar function, applies to at least 4 elements, has lineHeight logic
        const hasScale    = /scaleStep|Math\.pow|RATIO/.test(code);
        const applies4    = (code.match(/\.style\.fontSize/g) || []).length >= 4;
        const hasLH       = /lineHeight|line-height|\.style\.lineHeight/.test(code);
        return hasScale && applies4 && hasLH;
      },
      successMessage: `Scale built and applied. You've just done what every serious design system does: derive all sizes mathematically from one base and one ratio. The card now has a consistent typographic rhythm regardless of what content fills it.`,
      failMessage: `Three things to check: (1) Is the scale formula using Math.pow(RATIO, n)? (2) Are you applying fontSize to at least 4 different elements? (3) Are you setting lineHeight on each element? The practice doesn't need a "perfect" ratio — any mathematically consistent scale passes.`,
      outputHeight: 480,
    },

    // ─── PART 7: WEIGHT AS SIGNAL ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Weight as Signal, Not Decoration

From Lesson 1, you know weight is one of the four hierarchy levers. Typography systems formalise this into a two-weight rule.

### The Two-Weight Rule

Every component should use **at most two font weights**. Not three, not five — two.

Why? Because weight is a binary signal: **this matters / this supports**. Adding a third weight creates ambiguity — the eye must decode "is this medium-emphasis or something else?" In the time it takes to answer that question, the user's attention drifts.

**The two weights for UI:**
- **600 (Semibold)** — headings, labels, interactive elements, anything a user acts on or reads first
- **400 (Regular)** — body copy, descriptions, secondary information

**When to use 700:**
Only when a component needs extreme dominance — a large number ($48,290), a hero headline, an alarm state. Not for every heading.

**When to use 500:**
Only for one specific case: UI text that isn't quite a heading but isn't body copy either — nav items, section labels in a settings panel. This is the "structural" weight.

**What to never do:**
- Use 300 (thin) for primary headings. Thin text looks sophisticated in Figma at retina resolution. It is illegible on a 1× screen or at small sizes.
- Use 700 on body text. It signals "everything is important" which signals nothing.
- Use more than two weights in a single component.

### The Weight-Size Relationship

Weight and size must work together. As size increases, you can reduce weight and maintain the same visual presence. As size decreases, you need more weight to maintain legibility.

Rule of thumb: below 13px, minimum weight is 500. Above 32px, maximum weight is 600 for normal reading text.`,
    },

    // ─── PART 8: THE ANTI-PATTERNS ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Typography Anti-Patterns Reference

Eight typography failures found in nearly every production codebase.

---

### TY-1: The Thin Heading Trap
**Symptom:** Large headings use font-weight: 200 or 300. Looks elegant in a high-fidelity mockup at 2×, unreadable in production at 1×.
**Fix:** Minimum weight for headings is 500. For sizes below 24px, minimum 600.

---

### TY-2: The Flat Scale
**Symptom:** Body text is 14px, headings are 16px and 18px. All levels feel roughly the same size.
**Cause:** Sizes chosen by feel, incremental rather than multiplicative.
**Fix:** Apply a ratio. If body is 14px and ratio is 1.333, L2 is 19px, L1 is 25px. Not 16 and 18.

---

### TY-3: Uniform Line-Height
**Symptom:** \`line-height: 1.5\` on everything from 12px labels to 48px headlines.
**Cause:** A single global \`line-height\` declaration.
**Fix:** Apply the line-height function. Large text needs 1.0–1.2. Body needs 1.5–1.65. Captions need 1.3–1.4.

---

### TY-4: The Runaway Line
**Symptom:** Body text spans the full container width — 900px or more. Reading slows, eye loses its place returning to the next line.
**Fix:** \`max-width: 65ch\` on all body text containers.

---

### TY-5: Weight Soup
**Symptom:** A single component uses weights 300, 400, 500, 600, and 700. Every element has a slightly different weight.
**Cause:** Incremental emphasis decisions without a system.
**Fix:** Two weights per component. Period.

---

### TY-6: The Colour Muddle
**Symptom:** Body text is #333333 on a #ffffff background — readable. But captions are #999999 — which fails WCAG AA contrast at small sizes. And links are blue (#3b82f6) on dark grey — also fails.
**Fix:** Every text colour must be verified against its background. Minimum contrast ratio: 4.5:1 for body text (WCAG AA), 3:1 for large text (18px+, bold).

---

### TY-7: The Missing Rhythm
**Symptom:** Line-heights are set, but headings have margin-bottom: 0 and adjacent text has margin-top: 0. Blocks of text crash together.
**Fix:** Heading margin-bottom = space-2 to space-3. Paragraph margin-bottom = space-4 for long-form reading.

---

### TY-8: The Orphan Title
**Symptom:** A heading's \`max-width\` is not set. A 4-word title wraps to produce a single orphaned word on the last line ("How we rebuilt our data \\npipeline").
**Fix:** Set \`max-width\` on headings proportional to average content length. 20–24ch for article titles, none for component headings.`,
    },

    // ─── PART 9: ENGINEERING REALITY ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Engineering Reality: The Readability Triad

Typography readability is determined by three measurable properties that must be tuned together. These aren't conventions — they're derived from how the human reading system works.

### 1. The Saccade and the Line Length

Reading is not smooth. The eye makes discrete jumps called **saccades** — typically 7–9 characters in length. At the end of a line, the eye must perform a **return sweep** back to the left edge of the next line. This return sweep is where reading errors happen.

If the line is too long (>75ch), the return sweep has too far to travel. The eye occasionally lands on the wrong line, losing place. The reader must re-fixate. Measured as a ~10–15% reduction in reading speed on lines > 80ch (Rayner et al., 1998).

If the line is too short (<35ch), the eye makes the return sweep too frequently. The constant interruption prevents chunking — the cognitive process that converts words into meaning. Reading speed drops because comprehension requires accumulating 2–3 clauses at a time.

### 2. The Foveal Field and Font Size

The **fovea** — the high-acuity centre of the retina — subtends approximately 2° of visual arc. At a typical reading distance of 40–60cm, this covers about 6–8 characters at 14px. Below 11px, the fovea can no longer distinguish letterforms reliably. Users slow to decode individual characters rather than reading words as shapes.

This is why 11px is the minimum useful text size for body content (not labels). For labels with short content (2–3 characters), 9–10px is legible because the entire word falls within foveal range.

### 3. Line-Height and the Return Sweep

Line-height provides the vertical separation that allows the eye to accurately locate the start of the next line. The optimal range (1.5–1.65 for body text) was established empirically by compositors over 500+ years of type design and confirmed by 20th-century readability research (Spencer, 1968; Dyson & Haselgrove, 2001).

At less than 1.3× line-height, adjacent lines produce visual interference — the ascenders of line N+1 visually merge with descenders of line N. The eye loses the horizontal stripe structure that makes skimming possible.

### The Combined Rule

> Body text is optimal at: **14–18px, 1.5–1.65× line-height, 45–75ch measure**. Any parameter outside these ranges measurably degrades reading performance. Together, these three constraints define your container widths, minimum font sizes, and line-height values — not aesthetic preferences.`,
    },

    // ─── PART 10: PRACTICE 2 — FIX THE READABLE LINE ─────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 2: Apply the Readability Triad

This article layout has all three readability problems:
1. Line length too long (no measure constraint)
2. Line-height too tight on body text
3. Heading line-height too generous (should compress at large sizes)

Your job: fix all three using what you know.

**Constraints:**
- Body text max-width must land in the 45–75ch range
- Body line-height must be between 1.5 and 1.65
- Heading line-height must be between 1.0 and 1.3
- Caption line-height must be between 1.3 and 1.45

There's no starter scaffolding to fill in — you write the JavaScript corrections yourself, applying what you've learned. The test reads computed styles and verifies each constraint.

**Bonus:** after fixing the readability issues, adjust the font sizes to use a proper scale. What base and ratio best suits this reading context?`,
      html: `<div class="article-layout">
  <div class="al-meta">Engineering · March 14, 2025</div>
  <h1 class="al-title">How we rebuilt our data pipeline from scratch in 6 weeks while keeping everything live</h1>
  <p class="al-lead">The conventional wisdom says you can't rebuild a live system. You migrate incrementally, layer by layer, until the old thing is replaced. We ignored that advice. Here's what happened.</p>
  <p class="al-body">When the alerts started firing at 3am on a Tuesday, we had a choice. The pipeline was dropping roughly 12% of events under peak load — not catastrophic, but trending worse. The architecture had been designed for 10,000 events per day and was now handling 2.3 million. No amount of caching or horizontal scaling was going to fix a fundamental design mismatch.</p>
  <p class="al-body">So we rebuilt. Not migrated — rebuilt. From the event schema up. This is what we learned about system design, team coordination, and what it actually means to design for scale from the first line of code.</p>
  <div class="al-caption">Filed by Sarah Chen, Staff Engineer · Last edited 4 days ago</div>
</div>`,
      css: `body { background: #0f172a; padding: 48px; margin: 0;
  font-family: system-ui, sans-serif; }
.article-layout { /* No max-width — PROBLEM 1 */ }

/* BROKEN — all three readability problems present */
.al-meta    { font-size: 12px; color: #475569; margin-bottom: 12px;
  text-transform: uppercase; letter-spacing: 0.08em; }
.al-title   { font-size: 36px; font-weight: 700; color: #f1f5f9;
  line-height: 1.7;  /* PROBLEM 3: way too loose for heading */
  margin: 0 0 16px; }
.al-lead    { font-size: 18px; color: #cbd5e1;
  line-height: 1.3;  /* PROBLEM 2: too tight for body */
  margin: 0 0 16px; }
.al-body    { font-size: 16px; color: #94a3b8;
  line-height: 1.3;  /* PROBLEM 2: too tight for body */
  margin: 0 0 12px; }
.al-caption { font-size: 12px; color: #475569;
  line-height: 1.9;  /* PROBLEM 3: too loose for caption */
  margin-top: 20px; }`,
      startCode: `// Fix the three readability problems:
// 1. Measure: add max-width to body text containers
// 2. Line-height: body/lead text needs 1.5–1.65
// 3. Line-height: heading needs 1.0–1.3, caption needs 1.3–1.45

// Write your own fixes below — no scaffold, just apply what you know.
// Target: every check passes when you run the audit at the bottom.

// YOUR FIXES HERE:


// ── AUDIT — run this to check your work ──────────────────────────────────────
function auditReadability() {
  const checks = [
    {
      label: 'body max-width in 45–75ch range',
      test: () => {
        const body = document.querySelector('.al-body');
        if (!body) return false;
        const mw = window.getComputedStyle(body).maxWidth;
        if (mw === 'none') return false;
        const px   = parseFloat(mw);
        const fs   = parseFloat(window.getComputedStyle(body).fontSize);
        const chs  = px / (fs * 0.52);
        return chs >= 44 && chs <= 76;
      },
    },
    {
      label: 'body line-height 1.5–1.65',
      test: () => {
        const body = document.querySelector('.al-body');
        const s    = window.getComputedStyle(body);
        const lhR  = parseFloat(s.lineHeight) / parseFloat(s.fontSize);
        return lhR >= 1.45 && lhR <= 1.70;
      },
    },
    {
      label: 'heading line-height 1.0–1.3',
      test: () => {
        const h = document.querySelector('.al-title');
        const s = window.getComputedStyle(h);
        const r = parseFloat(s.lineHeight) / parseFloat(s.fontSize);
        return r >= 1.0 && r <= 1.32;
      },
    },
    {
      label: 'caption line-height 1.3–1.45',
      test: () => {
        const c = document.querySelector('.al-caption');
        const s = window.getComputedStyle(c);
        const r = parseFloat(s.lineHeight) / parseFloat(s.fontSize);
        return r >= 1.28 && r <= 1.50;
      },
    },
  ];

  console.log('=== READABILITY AUDIT ===\\n');
  let pass = 0;
  checks.forEach(({ label, test }) => {
    const ok = (() => { try { return test(); } catch { return false; } })();
    if (ok) pass++;
    console.log((ok ? '✓' : '✗') + ' ' + label);
  });
  console.log('\\n' + pass + '/' + checks.length + ' checks pass');
  return pass === checks.length;
}

auditReadability();`,
      solutionCode: `// FIX 1: Measure — add max-width to body text
document.querySelector('.article-layout').style.maxWidth = '720px';

document.querySelectorAll('.al-body, .al-lead').forEach(el => {
  el.style.maxWidth = '65ch';
});

// FIX 2: Line-height — body/lead need space to breathe
document.querySelector('.al-lead').style.lineHeight = '1.6';
document.querySelectorAll('.al-body').forEach(el => {
  el.style.lineHeight = '1.65';
});

// FIX 3: Line-height — heading too loose, caption too loose
document.querySelector('.al-title').style.lineHeight   = '1.15';
document.querySelector('.al-caption').style.lineHeight = '1.4';

auditReadability();`,
      check: (code) => {
        const fixesMeasure = /max-?width.*(?:ch|px)/.test(code) && !/maxWidth.*none/i.test(code);
        const fixesBodyLH  = /al-body[\s\S]*?lineHeight.*(?:1\.[5-9])|lineHeight.*['"]1\.(?:5|6|7)['"]/i.test(code);
        const fixesTitleLH = /al-title[\s\S]*?lineHeight.*(?:1\.[012])|lineHeight.*['"]1\.(?:0|1|2|3)['"]/i.test(code);
        return fixesMeasure && fixesBodyLH && fixesTitleLH;
      },
      successMessage: `All three readability problems fixed. You applied the triad: measure (max-width), body line-height (1.5–1.65), heading line-height (1.0–1.3). These three numbers are always derivable from the content type — you don't guess them.`,
      failMessage: `Three targets: (1) Body text needs max-width: 65ch (or equivalent px). (2) .al-body and .al-lead need line-height between 1.5 and 1.65. (3) .al-title needs line-height between 1.0 and 1.3. Run auditReadability() in the console to see which checks are failing.`,
      outputHeight: 500,
    },

    // ─── PART 11: CONTRAST — WCAG IN PRACTICE ─────────────────────────────────
    {
      type: 'js',
      instruction: `## Colour Contrast: The Measurable Floor

Type colour is not a hierarchy decision — it's a **compliance floor**. The WCAG contrast ratios are minimums, not targets. Failing them means a portion of your users cannot read your interface.

**WCAG 2.1 AA (the standard for most products):**
- Body text (< 18px regular, < 14px bold): **4.5:1 minimum**
- Large text (≥ 18px regular or ≥ 14px bold): **3:1 minimum**
- UI components and graphical elements: **3:1 minimum**

**The contrast ratio formula:**
\`contrast = (L1 + 0.05) / (L2 + 0.05)\`

Where L1 is the lighter colour's relative luminance and L2 is the darker. Luminance is computed from the RGB values via a non-linear transformation.

This cell implements the full WCAG contrast calculation and audits the article card from Part 1. Run it, then try changing text colours and watching the ratio update. The goal: every text element passes its required ratio.`,
      html: `<div id="contrast-demo">
  <div id="contrast-pairs"></div>
  <div id="contrast-log"></div>
</div>`,
      css: `body { background: #0f172a; padding: 20px; margin: 0;
  font-family: system-ui, sans-serif; }
#contrast-demo { max-width: 560px; }
#contrast-pairs { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.cp-row { background: #1e293b; border: 1px solid #334155; border-radius: 8px;
  padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; }
.cp-sample { font-size: 14px; }
.cp-ratio  { font-family: monospace; font-size: 12px; font-weight: 600; }
.cp-ratio.pass { color: #4ade80; }
.cp-ratio.warn { color: #fbbf24; }
.cp-ratio.fail { color: #f87171; }
#contrast-log { font-family: monospace; font-size: 11px; color: #475569;
  line-height: 1.7; }`,
      startCode: `// Full WCAG contrast implementation

function relativeLuminance(hex) {
  const r = parseInt(hex.slice(1,3), 16) / 255;
  const g = parseInt(hex.slice(3,5), 16) / 255;
  const b = parseInt(hex.slice(5,7), 16) / 255;
  const toLinear = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const light = Math.max(l1, l2), dark = Math.min(l1, l2);
  return ((light + 0.05) / (dark + 0.05)).toFixed(2);
}

function wcagLevel(ratio, isLargeText) {
  const r = parseFloat(ratio);
  if (isLargeText) {
    if (r >= 4.5) return { level: 'AAA', cls: 'pass' };
    if (r >= 3.0) return { level: 'AA',  cls: 'pass' };
    return { level: 'FAIL', cls: 'fail' };
  } else {
    if (r >= 7.0) return { level: 'AAA', cls: 'pass' };
    if (r >= 4.5) return { level: 'AA',  cls: 'pass' };
    if (r >= 3.0) return { level: 'A',   cls: 'warn' };
    return { level: 'FAIL', cls: 'fail' };
  }
}

const BG = '#1e293b'; // card background

const pairs = [
  { label: 'Heading (#f1f5f9)',   fg: '#f1f5f9', bg: BG, large: true  },
  { label: 'Body (#94a3b8)',      fg: '#94a3b8', bg: BG, large: false },
  { label: 'Secondary (#64748b)', fg: '#64748b', bg: BG, large: false },
  { label: 'Muted (#475569)',     fg: '#475569', bg: BG, large: false },
  { label: 'Hint (#334155)',      fg: '#334155', bg: BG, large: false },
  { label: 'Link (#60a5fa)',      fg: '#60a5fa', bg: BG, large: false },
];

const container = document.getElementById('contrast-pairs');
const log       = document.getElementById('contrast-log');
const logLines  = [];

pairs.forEach(({ label, fg, bg, large }) => {
  const ratio  = contrastRatio(fg, bg);
  const { level, cls } = wcagLevel(ratio, large);

  const row = document.createElement('div');
  row.className = 'cp-row';
  row.innerHTML = \`
    <span class="cp-sample" style="color:\${fg};\${large ? 'font-size:18px;font-weight:700' : ''}">
      \${label}
    </span>
    <span class="cp-ratio \${cls}">\${ratio}:1 · \${level}</span>
  \`;
  container.appendChild(row);

  logLines.push((cls === 'fail' ? '✗' : cls === 'warn' ? '⚠' : '✓') +
    ' ' + label.padEnd(28) + ratio + ':1 · ' + level +
    (large ? ' (large text)' : ''));
});

log.textContent = logLines.join('\\n');
console.log('Note: #475569 and #334155 on dark backgrounds commonly fail AA.');
console.log('These should only be used for non-essential decorative text,');
console.log('or the background must be lightened.');`,
      outputHeight: 440,
    },

    // ─── PART 12: SABOTAGE SANDBOX ────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `## Sabotage Sandbox: The Broken Article Page

This article page has **seven deliberate typography violations**. They render without errors — the page looks "almost right." Your job is to identify and fix each one.

**The seven violations:**
1. TY-3: Uniform line-height (1.5 on everything)
2. TY-4: No measure constraint (body spans full width)
3. TY-2: Flat scale — heading is only 1.15× body (barely distinguishable)
4. TY-1: Thin heading — font-weight: 300 on main title
5. TY-5: Weight soup — 4 different weights in one component
6. TY-7: Missing rhythm — heading has no margin-bottom, blocks crash
7. TY-8: Orphan title — heading has no max-width for line control

Use the anti-pattern names when you comment your fixes. The test checks the measurable properties.`,
      html: `<div class="broken-article">
  <div class="ba-section-label">CASE STUDY</div>
  <h1 class="ba-title">The complete guide to rebuilding a live data pipeline without downtime or disaster in six weeks</h1>
  <div class="ba-byline">
    <span class="ba-author">Sarah Chen</span>
    <span class="ba-date">March 14, 2025</span>
    <span class="ba-read">8 min read</span>
  </div>
  <p class="ba-lead">When the alerts started firing at 3am, we had a choice: patch or rebuild. Here's what happened when we chose rebuild.</p>
  <h2 class="ba-h2">The constraint we ignored</h2>
  <p class="ba-body">Conventional wisdom says you can't rebuild a live system without downtime. You migrate incrementally, layer by layer, until the old thing is gone. We ignored that advice — not recklessly, but because the specific nature of our failure made incremental migration impossible.</p>
  <p class="ba-body">The pipeline was dropping 12% of events under peak load because it was architecturally wrong, not just slow. Patching an architecturally wrong system produces a patched architecturally wrong system.</p>
  <div class="ba-callout">Every failure mode is a specification for the correct system.</div>
  <p class="ba-caption">Filed by Sarah Chen, Staff Engineer. Last reviewed March 18, 2025.</p>
</div>`,
      css: `body { background: #0f172a; padding: 48px; margin: 0;
  font-family: system-ui, sans-serif; }

/* VIOLATIONS — all intentional */
.broken-article {
  /* NO max-width on article — VIOLATION 2 (TY-4) */
}
.ba-section-label { font-size: 11px; font-weight: 600; color: #3b82f6;
  letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }

.ba-title {
  font-size: 22px;          /* VIOLATION 3 (TY-2): body is 16px — ratio is only 1.375× barely */
  font-weight: 300;          /* VIOLATION 4 (TY-1): thin heading — illegible at scale */
  color: #f1f5f9;
  line-height: 1.5;          /* VIOLATION 1 (TY-3): same as body — should be 1.1–1.2 for heading */
  /* NO margin-bottom — VIOLATION 6 (TY-7) */
  /* NO max-width — VIOLATION 7 (TY-8) */
}
.ba-byline { display: flex; gap: 12px; margin: 12px 0 16px; }
.ba-author { font-size: 14px; font-weight: 700; color: #e2e8f0; }   /* weight 700 */
.ba-date   { font-size: 14px; font-weight: 400; color: #64748b; }   /* weight 400 */
.ba-read   { font-size: 14px; font-weight: 500; color: #64748b; }   /* weight 500 — VIOLATION 5 (TY-5) */
.ba-lead   { font-size: 17px; font-weight: 600; color: #cbd5e1;     /* weight 600 — 4 weights total */
  line-height: 1.5; margin: 0 0 20px; }
.ba-h2     { font-size: 18px; font-weight: 600; color: #f1f5f9;
  line-height: 1.5;          /* VIOLATION 1 (TY-3): should compress for subheading */
  margin-top: 24px; }
.ba-body   { font-size: 16px; font-weight: 400; color: #94a3b8;
  line-height: 1.5;          /* VIOLATION 1 (TY-3): should be 1.6–1.65 */
  margin: 0 0 14px; }
.ba-callout { font-size: 20px; font-weight: 500; color: #60a5fa;
  border-left: 3px solid #2563eb; padding-left: 20px; margin: 24px 0; line-height: 1.5; }
.ba-caption { font-size: 12px; color: #475569; line-height: 1.5;   /* should be 1.35–1.4 */
  margin-top: 24px; }`,
      startCode: `// FIX EACH VIOLATION — use anti-pattern names in comments

// ── FIX VIOLATION 2: TY-4 Runaway Line ───────────────────────────────────────
// Add max-width to the article and/or body text paragraphs
// Body text max-width: 65ch (approximately 50–55ch for 16px text in most fonts)


// ── FIX VIOLATION 3: TY-2 Flat Scale ─────────────────────────────────────────
// ba-title at 22px vs ba-body at 16px = 1.375× — too close, levels merge
// Title should be at least 1.25² × 16 = ~25px, ideally 1.333² × 16 = ~28px


// ── FIX VIOLATION 4: TY-1 Thin Heading ───────────────────────────────────────
// font-weight: 300 on the main title — must be minimum 600 for headings


// ── FIX VIOLATION 1: TY-3 Uniform Line-Height ────────────────────────────────
// Title: should be 1.1–1.2 (large text compresses)
// ba-h2: should be 1.25–1.3
// ba-body: should be 1.6–1.65 (needs space to breathe)
// ba-caption: should be 1.35–1.4


// ── FIX VIOLATION 5: TY-5 Weight Soup ───────────────────────────────────────
// Byline uses weights 700, 400, 500, 600 — 4 weights in one component
// Choose TWO weights: 600 for author, 400 for date and read-time


// ── FIX VIOLATION 6: TY-7 Missing Rhythm ─────────────────────────────────────
// ba-title has no margin-bottom — the heading crashes into the byline


// ── FIX VIOLATION 7: TY-8 Orphan Title ───────────────────────────────────────
// ba-title has no max-width — long title wraps unpredictably
// Aim for ~18–22ch for this heading length


// ── AUDIT ─────────────────────────────────────────────────────────────────────
const title  = document.querySelector('.ba-title');
const body   = document.querySelector('.ba-body');
const ts     = window.getComputedStyle(title);
const bs     = window.getComputedStyle(body);
const titleLH = parseFloat(ts.lineHeight) / parseFloat(ts.fontSize);
const bodyLH  = parseFloat(bs.lineHeight) / parseFloat(bs.fontSize);
const titleW  = parseFloat(ts.fontWeight);
const titleFS = parseFloat(ts.fontSize);
const bodyFS  = parseFloat(bs.fontSize);

const checks = {
  'TY-4 measure': bs.maxWidth !== 'none',
  'TY-2 scale':   titleFS / bodyFS >= 1.5,
  'TY-1 weight':  titleW >= 600,
  'TY-3 body LH': bodyLH >= 1.5 && bodyLH <= 1.7,
  'TY-3 title LH':titleLH >= 1.0 && titleLH <= 1.3,
  'TY-7 margin':  parseFloat(ts.marginBottom) >= 8,
};

console.log('\\n=== VIOLATION FIXES AUDIT ===');
Object.entries(checks).forEach(([k, v]) => console.log((v ? '✓' : '✗') + ' ' + k));`,
      solutionCode: `// FIX VIOLATION 2: TY-4 Runaway Line
document.querySelector('.broken-article').style.maxWidth = '720px';
document.querySelectorAll('.ba-body, .ba-lead').forEach(el => {
  el.style.maxWidth = '65ch';
});

// FIX VIOLATION 3: TY-2 Flat Scale
document.querySelector('.ba-title').style.fontSize = '32px';

// FIX VIOLATION 4: TY-1 Thin Heading
document.querySelector('.ba-title').style.fontWeight = '700';

// FIX VIOLATION 1: TY-3 Uniform Line-Height
document.querySelector('.ba-title').style.lineHeight   = '1.15';
document.querySelector('.ba-h2').style.lineHeight      = '1.28';
document.querySelectorAll('.ba-body').forEach(el => el.style.lineHeight = '1.65');
document.querySelector('.ba-caption').style.lineHeight = '1.4';
document.querySelector('.ba-lead').style.lineHeight    = '1.55';

// FIX VIOLATION 5: TY-5 Weight Soup — two weights only
document.querySelector('.ba-author').style.fontWeight = '600';
document.querySelector('.ba-date').style.fontWeight   = '400';
document.querySelector('.ba-read').style.fontWeight   = '400';

// FIX VIOLATION 6: TY-7 Missing Rhythm
document.querySelector('.ba-title').style.marginBottom = '12px';

// FIX VIOLATION 7: TY-8 Orphan Title
document.querySelector('.ba-title').style.maxWidth = '22ch';`,
      check: (code) => {
        const fixesWeight  = /ba-title[\s\S]*?fontWeight.*(?:600|700|800)|fontWeight.*['"](?:600|700|800)['"]/i.test(code);
        const fixesBodyLH  = /ba-body[\s\S]*?lineHeight.*(?:1\.[5-9])|lineHeight.*['"]1\.[6-9]['"]/i.test(code);
        const fixesTitleLH = /ba-title[\s\S]*?lineHeight.*(?:1\.[012])|lineHeight.*['"]1\.[0-2]['"]/i.test(code);
        const fixesMeasure = /max-?width.*(?:ch|px)/.test(code);
        return fixesWeight && fixesMeasure && fixesBodyLH;
      },
      successMessage: `Seven violations identified and fixed. You can now diagnose typography failures by name — TY-1 through TY-8 — and apply precise corrections. The audit function gives you a pass/fail result you can defend: "heading line-height 1.15, body line-height 1.65, 65ch measure — all three readability constraints satisfied."`,
      failMessage: `Three required fixes: (1) .ba-title font-weight must be ≥600 (TY-1 fix). (2) Body text elements must have max-width set in ch or px (TY-4 fix). (3) .ba-body line-height must be 1.5–1.65 (TY-3 fix). Check the audit output — it reports each check individually.`,
      outputHeight: 560,
    },

    // ─── PART 13: STRESS CONDITION ───────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Stress Condition: The Type System Under Real Content

A type system must survive three classes of real-world content variation:
1. **Title length** — 3 words vs 30 words
2. **Body length** — one sentence vs 800 words
3. **Language** — CJK characters, RTL scripts, character-rich European languages (Ü, ê, ø)

This cell injects each variant into the article component and reports whether the type system holds: does the heading stay dominant? Does body text stay readable? Do long titles wrap gracefully?

Notice which properties fail under stress and which hold. A system that only works for ideal data is a mockup. A system that works for all of these is an engineering deliverable.`,
      html: `<div id="stress-controls">
  <button class="s-btn active" data-mode="normal">Normal</button>
  <button class="s-btn" data-mode="short-title">Short title</button>
  <button class="s-btn" data-mode="long-title">Long title</button>
  <button class="s-btn" data-mode="short-body">Short body</button>
  <button class="s-btn" data-mode="long-body">Long body</button>
  <button class="s-btn" data-mode="unicode">Unicode</button>
</div>
<div class="stress-card">
  <div class="st-eyebrow" id="st-eyebrow">ENGINEERING</div>
  <h1 class="st-title" id="st-title">How we rebuilt our pipeline</h1>
  <p class="st-body" id="st-body">The body copy goes here.</p>
  <div class="st-footer" id="st-footer">Sarah Chen · March 14</div>
</div>`,
      css: `body { background: #0f172a; padding: 24px; margin: 0;
  font-family: system-ui, sans-serif; }
#stress-controls { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
.s-btn { font-size: 11px; font-weight: 500; padding: 5px 12px;
  border-radius: 6px; border: 1px solid #334155; background: #1e293b;
  color: #64748b; cursor: pointer; }
.s-btn.active { background: #2563eb; color: white; border-color: #2563eb; }
.stress-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px;
  padding: 28px; max-width: 580px; }
.st-eyebrow { font-size: 10px; font-weight: 700; color: #3b82f6;
  letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
.st-title { font-size: 28px; font-weight: 700; color: #f1f5f9; line-height: 1.2;
  margin: 0 0 12px; max-width: 22ch; }
.st-body  { font-size: 15px; color: #94a3b8; line-height: 1.65;
  margin: 0 0 20px; max-width: 60ch; }
.st-footer{ font-size: 12px; color: #475569; }`,
      startCode: `const scenarios = {
  normal: {
    eyebrow: 'ENGINEERING',
    title:   'How we rebuilt our data pipeline',
    body:    'When the alerts started firing at 3am, we had a choice: patch or rebuild. Here\\'s what happened when we chose to rebuild from scratch.',
    footer:  'Sarah Chen · March 14, 2025',
  },
  'short-title': {
    eyebrow: 'PRODUCT',
    title:   'Launched',
    body:    'Version 3.0 is live. Here\\'s what changed.',
    footer:  'Product team · Today',
  },
  'long-title': {
    eyebrow: 'INFRASTRUCTURE',
    title:   'The complete and definitive guide to rebuilding a live data pipeline without downtime, data loss, or the kind of disaster that ends careers',
    body:    'Short body copy with a very long title above it. The max-width on the title should prevent the most extreme wrapping.',
    footer:  'Engineering · 20 min read',
  },
  'short-body': {
    eyebrow: 'UPDATE',
    title:   'Maintenance complete',
    body:    'All systems operational.',
    footer:  'Status page · Now',
  },
  'long-body': {
    eyebrow: 'DEEP DIVE',
    title:   'Architecture decisions we regret',
    body:    'This is a long passage of body text that tests whether the line-height and max-width hold under sustained reading load. The measure should cap at 60ch so lines stay in the readable 45–75 character range. The line-height should feel comfortable — not too tight, not too airy. If you\\'ve set max-width: 60ch correctly, this paragraph will wrap at roughly 10–12 lines in a normal viewport. Each line should have clear visual separation from the next. If the text feels cramped, line-height is below 1.5. If lines feel like they have too much air, line-height is above 1.75. The system should produce comfortable reading without any per-content adjustments.',
    footer:  'Sarah Chen · 24 min read',
  },
  unicode: {
    eyebrow: 'INTERNATIONAL',
    title:   'Über die Neugestaltung unserer Datenpipeline',
    body:    'Internationalization (i18n) testing: Ünïcödé characters with diacritics — À, ê, ñ, ø, ü — test whether your font renders consistently. CJK: 数据管道重建。 RTL mix: English with some العربية text mixed in.',
    footer:  'Équipe Engineering · März 2025',
  },
};

function inject(mode) {
  const s = scenarios[mode];
  document.getElementById('st-eyebrow').textContent = s.eyebrow;
  document.getElementById('st-title').textContent   = s.title;
  document.getElementById('st-body').textContent    = s.body;
  document.getElementById('st-footer').textContent  = s.footer;
  document.querySelectorAll('.s-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === mode));
  console.log('Mode:', mode);
  console.log('Check: does the heading remain dominant? Does body remain readable?');
  console.log('Does the title wrap gracefully with max-width: 22ch?');
}

inject('normal');
document.querySelectorAll('.s-btn').forEach(b =>
  b.addEventListener('click', () => inject(b.dataset.mode)));`,
      outputHeight: 380,
    },

    // ─── PART 14: PRACTICE 3 — DARK MODE TYPOGRAPHY ──────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 3: Dark Mode Typography

The card below is built for a light background. Your job is to adapt all the type colours for a dark background — without breaking the hierarchy, contrast requirements, or the visual relationships between levels.

This is harder than it sounds. On a light background, you create hierarchy by darkening towards Level 1. On a dark background, you lighten towards Level 1. The *direction* reverses; the *relationships* stay the same.

**The dark mode colour vocabulary for this system:**
\`\`\`
Level 1 (dominant):     #f1f5f9  (near-white)
Level 2 (structural):   #cbd5e1  (light grey)
Level 3 (detail):       #64748b  (mid grey)
Level 4 (receded):      #334155  (dark grey — barely visible on dark bg)
Background:             #0f172a  (deep navy)
Surface:                #1e293b  (card surface)
Border:                 #334155
Primary action:         #3b82f6  (stays blue — action colour is semantic)
\`\`\`

**Your task:**
1. Change the card background from white to \`#1e293b\`
2. Apply the dark mode colour vocabulary to each type level
3. Verify every text colour passes its WCAG contrast requirement (from Part 11)
4. Keep the hierarchy: L1 must be most prominent, L4 must recede

The test checks that all text elements pass WCAG AA against the dark background.`,
      html: `<div class="dm-card" id="dm-card">
  <div class="dm-meta" id="dm-meta">INVOICE #4821</div>
  <div class="dm-amount" id="dm-amount">$1,240.00</div>
  <div class="dm-plan" id="dm-plan">Annual Pro Plan</div>
  <div class="dm-detail" id="dm-detail">Visa •••• 4242 · March 14, 2025</div>
  <hr class="dm-divider">
  <button class="dm-cta" id="dm-cta">Download Receipt</button>
  <div class="dm-footnote" id="dm-footnote">Questions? Contact support@company.com</div>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: center; min-height: 100vh; margin: 0;
  font-family: system-ui, sans-serif; }

/* LIGHT MODE — needs converting to dark */
.dm-card {
  background: white;          /* ← CHANGE to dark surface */
  padding: 32px; border-radius: 14px; width: 300px;
  border: 1px solid #e2e8f0;  /* ← CHANGE to dark border */
}
.dm-meta     { font-size: 10px; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
.dm-amount   { font-size: 40px; font-weight: 700; color: #0f172a; /* ← L1 */
  line-height: 1.0; margin-bottom: 8px; }
.dm-plan     { font-size: 16px; font-weight: 500; color: #1e293b; /* ← L2 */
  margin-bottom: 4px; }
.dm-detail   { font-size: 13px; color: #64748b;                   /* ← L3 */
  margin-bottom: 0; }
.dm-divider  { border: none; border-top: 1px solid #e2e8f0; /* ← CHANGE */
  margin: 20px 0; }
.dm-cta      { display: block; width: 100%; padding: 12px;
  background: #2563eb; color: white; border: none; border-radius: 9px;
  font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 12px; }
.dm-footnote { font-size: 12px; color: #94a3b8; /* ← L4 */ text-align: center; }`,
      startCode: `// TASK: Convert this light-mode card to dark mode
// Rules:
// - Background: #1e293b
// - Border: #334155
// - L1 text (#dm-amount): #f1f5f9
// - L2 text (#dm-plan):   #cbd5e1
// - L3 text (#dm-detail + #dm-meta): #64748b
// - L4 text (#dm-footnote): #334155 (barely visible — receded)
// - Divider: #334155
// - CTA stays #2563eb (semantic — don't change action colours)

// YOUR COLOUR CHANGES:

document.getElementById('dm-card').style.background   = '???';
document.getElementById('dm-card').style.borderColor  = '???';

document.getElementById('dm-amount').style.color   = '???';  // L1: most prominent
document.getElementById('dm-plan').style.color     = '???';  // L2
document.getElementById('dm-detail').style.color   = '???';  // L3
document.getElementById('dm-meta').style.color     = '???';  // L3 (label)
document.getElementById('dm-footnote').style.color = '???';  // L4: most receded
document.querySelector('.dm-divider').style.borderColor = '???';

// ── CONTRAST AUDIT ────────────────────────────────────────────────────────────
function lum(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  const lin = c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
  return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
}
function contrast(h1, h2) {
  const l1=lum(h1), l2=lum(h2);
  return ((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)).toFixed(2);
}

const BG = '#1e293b';
const els = [
  { id:'dm-amount',   req:3.0,  label:'Amount (large, bold)' },
  { id:'dm-plan',     req:4.5,  label:'Plan (body)'          },
  { id:'dm-detail',   req:4.5,  label:'Detail (body)'        },
  { id:'dm-meta',     req:4.5,  label:'Meta label (body)'    },
  { id:'dm-footnote', req:3.0,  label:'Footnote (small)'     },
];

console.log('=== DARK MODE CONTRAST AUDIT ===\\n');
let pass = 0;
els.forEach(({ id, req, label }) => {
  const el    = document.getElementById(id);
  const color = window.getComputedStyle(el).color;
  const hex   = '#' + color.match(/\\d+/g).slice(0,3).map(n => parseInt(n).toString(16).padStart(2,'0')).join('');
  const ratio = parseFloat(contrast(hex, BG));
  const ok    = ratio >= req;
  if (ok) pass++;
  console.log((ok ? '✓' : '✗') + ' ' + label + ': ' + ratio + ':1 (need ' + req + ':1)');
});
console.log('\\n' + pass + '/' + els.length + ' pass');`,
      solutionCode: `document.getElementById('dm-card').style.background   = '#1e293b';
document.getElementById('dm-card').style.borderColor  = '#334155';

document.getElementById('dm-amount').style.color   = '#f1f5f9';
document.getElementById('dm-plan').style.color     = '#cbd5e1';
document.getElementById('dm-detail').style.color   = '#64748b';
document.getElementById('dm-meta').style.color     = '#64748b';
document.getElementById('dm-footnote').style.color = '#475569';
document.querySelector('.dm-divider').style.borderColor = '#334155';`,
      check: (code) => {
        const setsDarkBg  = /dm-card[\s\S]*?(?:1e293b|0f172a)/i.test(code) || /background.*(?:#1e293b|#0f172a)/i.test(code);
        const setsL1      = /dm-amount[\s\S]*?(?:f1f5f9|e2e8f0|fff|white)/i.test(code) || /f1f5f9|eef2f8/.test(code);
        const setsFootnote= /dm-footnote[\s\S]*?(?:475569|334155|4a5a72)/i.test(code);
        return setsDarkBg && setsL1;
      },
      successMessage: `Dark mode type conversion complete. You've applied the core insight: dark mode doesn't invert the hierarchy — it inverts the colour direction. L1 is still the most visually prominent; it's just light instead of dark. The WCAG requirements are identical. The vocabulary changes; the system doesn't.`,
      failMessage: `Two required changes: (1) The card background must be set to a dark value (#1e293b or similar). (2) The .dm-amount (Level 1) colour must be near-white (#f1f5f9 or #e2e8f0) to be the most visually prominent on the dark surface. Run the contrast audit at the bottom — it reports each element's pass/fail.`,
      outputHeight: 440,
    },

    // ─── PART 15: CROSS-PLATFORM + SEED ──────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Cross-Platform: Typography Everywhere

The type system maps to every UI environment. The ratios and constraints are identical — only the property names differ.

| Concept | CSS | Qt (QSS) | Unity (TextMeshPro) | Figma |
|---|---|---|---|---|
| Font size | \`font-size: 28px\` | \`font-size: 28px\` | \`fontSize = 28\` | Text style: H1 |
| Line height | \`line-height: 1.15\` | \`line-height: 115%\` | \`lineSpacing = 15\` | Line height: 115% |
| Measure | \`max-width: 65ch\` | \`maximumWidth: 520\` | Content width constraint | Frame width: auto |
| Font weight | \`font-weight: 700\` | \`font-weight: bold\` | \`fontStyle = Bold\` | Weight: Bold |
| Scale step | CSS custom property | C++ const int | ScriptableObject float | Token: fs/h1 |
| Type scale | \`--fs-4: calc()\` | \`QFont::setPointSize\` | \`TMP_FontAsset\` | Paragraph styles |

### What Never Changes

1. **Scale ratio**: every step is base × ratio^n. The ratio choice (1.25–1.333 for UI) is the same regardless of platform.
2. **Line-height function**: large text compresses, body text expands. This is a perceptual constant, not a CSS quirk.
3. **Measure**: 45–75ch for body text in any renderer. In non-ch units: approximately 500–700px at 16px equivalent.
4. **Two-weight rule**: any platform, any component. Two weights maximum.
5. **WCAG minimums**: 4.5:1 for body, 3:1 for large text. These are human vision constraints, not web standards.

---

## What You Now Know

After Lesson 3, you can:
- Generate a complete modular type scale from a base size and ratio
- Apply the line-height function to every type level
- Set measure constraints that keep body text in the readable range
- Audit every text element against WCAG contrast requirements
- Adapt a type system from light to dark mode without breaking hierarchy
- Name and fix all eight typography anti-patterns
- Combine the type system with the spacing system from Lesson 2

**Next lesson: Layout Systems** — Flexbox and Grid as constraint engines, responsive layout without breakpoints, and the component composition model that makes layouts survive real content.`,
    },

    // ─── PART 16: SEED ────────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Lesson 3 Complete — The Reference Type System

The canonical type system for the rest of this course. Read the token definitions once, then run the audit. This system combines Lessons 1, 2, and 3: the hierarchy levels from Lesson 1 are now implemented with a mathematical scale; the spacing from Lesson 2 is applied between type elements; the line-height and measure constraints are set per level.

The \`auditType()\` function is your tool for every text component going forward. Zero failures = pass condition.`,
      html: `<article class="ref-article">
  <span class="ra-eyebrow">DESIGN SYSTEMS · LESSON 3</span>
  <h1 class="ra-h1">The Typography Reference</h1>
  <p class="ra-lead">Three measurable properties define readable type: size ratio, line-height, and measure. This card implements all three as a verifiable system.</p>
  <h2 class="ra-h2">Scale tokens</h2>
  <p class="ra-body">The type scale uses a base of 16px and a Perfect Fourth ratio (1.333). Every size is derived: fs-0 = 10px, fs-1 = 12px, fs-2 = 16px, fs-3 = 21px, fs-4 = 28px, fs-5 = 37px. Line-heights decrease as sizes increase. Body measure is capped at 65ch.</p>
  <p class="ra-caption">Lesson 3 complete. Build on this in Lesson 4: Layout Systems.</p>
</article>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  padding: 48px 24px; margin: 0; font-family: system-ui, sans-serif; }

/* ── THE COMPLETE TYPE SYSTEM ─────────────────────────── */
:root {
  /* Scale: base=16, ratio=1.333 (Perfect Fourth) */
  --fs-0: 10px;   /* L4 label   — scale step -2 */
  --fs-1: 12px;   /* L4 caption — scale step -1 */
  --fs-2: 16px;   /* L3 body    — scale step  0 (base) */
  --fs-3: 21px;   /* L2 sub     — scale step  1 */
  --fs-4: 28px;   /* L1 heading — scale step  2 */
  --fs-5: 37px;   /* L1 display — scale step  3 */

  /* Line-heights: compressed at large sizes, expanded at small */
  --lh-display: 1.05;
  --lh-h1:      1.15;
  --lh-h2:      1.28;
  --lh-body:    1.65;
  --lh-caption: 1.40;
  --lh-label:   1.30;

  /* Measure */
  --measure-body:    65ch;
  --measure-heading: 22ch;
}

.ref-article { max-width: 680px; }

/* ── LEVEL 4: Eyebrow ── */
.ra-eyebrow {
  display: block;
  font-size: var(--fs-0); font-weight: 700; color: #3b82f6;
  letter-spacing: 0.14em; text-transform: uppercase;
  line-height: var(--lh-label);
  margin-bottom: 8px;   /* space-2 */
}
/* ── LEVEL 1: H1 ── */
.ra-h1 {
  font-size: var(--fs-4); font-weight: 700; color: #f1f5f9;
  line-height: var(--lh-h1); max-width: var(--measure-heading);
  margin: 0 0 16px;  /* space-4 */
}
/* ── LEVEL 2: Lead ── */
.ra-lead {
  font-size: var(--fs-3); font-weight: 400; color: #cbd5e1;
  line-height: var(--lh-h2); max-width: var(--measure-body);
  margin: 0 0 24px;  /* space-5 */
}
/* ── LEVEL 2: H2 ── */
.ra-h2 {
  font-size: var(--fs-3); font-weight: 600; color: #f1f5f9;
  line-height: var(--lh-h2);
  margin: 0 0 8px;   /* space-2 */
}
/* ── LEVEL 3: Body ── */
.ra-body {
  font-size: var(--fs-2); font-weight: 400; color: #94a3b8;
  line-height: var(--lh-body); max-width: var(--measure-body);
  margin: 0 0 24px;  /* space-5 */
}
/* ── LEVEL 4: Caption ── */
.ra-caption {
  font-size: var(--fs-1); font-weight: 400; color: #475569;
  line-height: var(--lh-caption);
  margin: 0;
}`,
      startCode: `// Final audit: type scale ratios, line-heights, and measure

const root = document.documentElement;

function getToken(name) {
  const raw = getComputedStyle(root).getPropertyValue(name).trim();
  // Resolve to a number via a test element
  const el = document.createElement('div');
  el.style.fontSize = 'var(' + name + ')';
  document.body.appendChild(el);
  const px = parseFloat(window.getComputedStyle(el).fontSize);
  document.body.removeChild(el);
  return isNaN(px) ? parseFloat(raw) : px;
}

const scale = ['--fs-0','--fs-1','--fs-2','--fs-3','--fs-4','--fs-5'].map(t => getToken(t));
const lhs   = {
  display: getToken('--lh-display'),
  h1:      getToken('--lh-h1'),
  h2:      getToken('--lh-h2'),
  body:    getToken('--lh-body'),
  caption: getToken('--lh-caption'),
};

console.log('=== LESSON 3 — FINAL TYPE SYSTEM AUDIT ===\\n');

console.log('SCALE (base 16px, ratio ~1.333):');
scale.forEach((px, i) => {
  const prev   = i > 0 ? scale[i-1] : null;
  const ratio  = prev ? (px / prev).toFixed(3) : '(base)';
  const label  = ['label','caption','body','subhead','h1','display'][i];
  console.log('  fs-' + i + ': ' + Math.round(px) + 'px  (' + label + ')  ' + ratio);
});

console.log('\\nLINE-HEIGHTS:');
Object.entries(lhs).forEach(([k, v]) => {
  const ok = {
    display: v >= 1.0 && v <= 1.15,
    h1:      v >= 1.1 && v <= 1.25,
    h2:      v >= 1.2 && v <= 1.35,
    body:    v >= 1.5 && v <= 1.7,
    caption: v >= 1.3 && v <= 1.5,
  }[k];
  console.log('  lh-' + k + ': ' + v + (ok ? ' ✓' : ' ✗'));
});

console.log('\\nLesson 4 → Layout Systems');
console.log('Flexbox and Grid as constraint engines.');
console.log('The type and spacing system slots into layout automatically.');`,
      outputHeight: 480,
    },
  ],
};

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export default {
  id: 'design-03-typography-systems',
  slug: 'typography-systems',
  chapter: 'design.1',
  order: 3,
  title: 'Typography Systems',
  subtitle: 'Derive font-size, line-height, and measure from first principles. Make readable type a specification, not a feeling.',
  tags: [
    'css', 'typography', 'type-scale', 'line-height', 'measure',
    'readability', 'modular-scale', 'font-weight', 'wcag', 'contrast',
    'design-systems', 'anti-patterns', 'dark-mode',
  ],
  hook: {
    question: 'Where does 32px come from? Why 1.65 line-height? Why 65 characters per line? Every number in a type system is derivable — none of them should be guessed.',
    realWorldContext:
      'Typography is the most-used element in any interface. When it\'s broken — wrong ratios, cramped line-height, runaway line length — the interface feels hard to read without users knowing why. ' +
      'A type system replaces 50 individual feel-based decisions with 3 parameters: base size, ratio, and line-height function. ' +
      'Every size, every line-height, every measure constraint follows from those three numbers.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'The modular scale: every font-size = base × ratio^n. One ratio, all sizes. Change the ratio to update everything.',
      'Line-height is a function of font-size: large text compresses (1.0–1.2), body text expands (1.5–1.65). Never a single global value.',
      'Measure (line length) is a biological constraint: 45–75 characters per line. Use max-width: 65ch on all body text.',
      'Two weights per component: 600 for primary, 400 for secondary. Never more than two.',
      'Dark mode inverts the colour direction, not the hierarchy. L1 is still most prominent — just light instead of dark.',
      'WCAG contrast floors: 4.5:1 for body text, 3:1 for large text. These are human vision constraints, not conventions.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The Three Parameters',
        body: 'A complete type system is derived from: (1) base size, (2) scale ratio, (3) line-height function. Everything else follows. If you find yourself choosing a font-size by feel, you haven\'t defined your base and ratio yet.',
      },
      {
        type: 'important',
        title: 'Measure is Not Optional',
        body: 'max-width: 65ch on all body text containers is not a style choice — it is a readability requirement. Lines longer than 75ch measurably reduce reading speed and increase eye-tracking errors.',
      },
      {
        type: 'tip',
        title: 'The Ratio for UI',
        body: 'For application UI, use 1.25 (Major Third) or 1.333 (Perfect Fourth). 1.25 for dense/data-heavy UIs. 1.333 for standard app interfaces. Save 1.5 and above for editorial or marketing contexts.',
      },
      {
        type: 'warning',
        title: 'TY-1: The Thin Heading Trap',
        body: 'font-weight: 200 or 300 on headings looks elegant in high-fidelity mockups at retina resolution. It is frequently illegible in production at 1×. Minimum weight for any heading: 500. For headings below 24px: 600.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Design Systems — Lesson 3: Typography Systems',
        props: { lesson: LESSON_DESIGN_03 },
      },
    ],
  },
  math: {
    prose: [
      'The modular scale formula: size(n) = base × ratio^n. At base=16, ratio=1.333: size(2) = 16 × 1.333² = 28.4px ≈ 28px.',
      'The line-height function: lh(size) = base_lh − (size − base_size) × k. At base_lh=1.65, base_size=16, k=0.012: lh(32) = 1.65 − 16×0.012 = 1.45.',
      'WCAG contrast ratio: (L1 + 0.05) / (L2 + 0.05) where L = 0.2126R + 0.7152G + 0.0722B (linearised). #f1f5f9 on #1e293b ≈ 11.2:1 — comfortably passes AAA.',
    ],
    callouts: [],
    visualizations: [],
  },
  rigor: {
    prose: [
      'The 45–75 character optimal measure was established by compositors over centuries and confirmed by Rayner et al. (1998): lines above 80 characters produce measurable increases in return-sweep errors and a 10–15% reduction in reading speed.',
      'The inverse line-height relationship is explained by foveal acuity: at large font sizes, the tall x-height provides inherent vertical separation; at small sizes, the reduced x-height requires additional interline space to prevent visual interference between ascenders and descenders.',
      'The WCAG 4.5:1 body text requirement corresponds to the contrast sensitivity of approximately the 90th percentile of adult vision — including age-related contrast sensitivity loss. Designing to 4.5:1 ensures legibility for the largest possible audience at normal screen viewing distances.',
    ],
    callouts: [],
    visualizations: [],
  },
  examples: [],
  challenges: [],
  mentalModel: [
    'Type scale: base × ratio^n. One ratio produces all sizes. Change ratio to rebalance the entire system.',
    'Line-height is a function: large text (1.0–1.2), body text (1.5–1.65), captions (1.3–1.4). Never a flat value.',
    'Measure: max-width 65ch on all body text. 45–75ch is a biological constraint, not a convention.',
    'Two weights per component: 600 structural, 400 body. Never more.',
    'Eight anti-patterns: TY-1 through TY-8. Thin heading, flat scale, uniform LH, runaway line, weight soup, colour muddle, missing rhythm, orphan title.',
    'Dark mode reverses colour direction; hierarchy relationships stay identical.',
    'WCAG floors: 4.5:1 body, 3:1 large text. Measure with the contrast ratio formula, not by eye.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
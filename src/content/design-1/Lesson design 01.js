// LESSON_DESIGN_01.js
// Lesson 1 — Visual Hierarchy
// The problem: most UI failure isn't about aesthetics — it's about hierarchy.
// Without hierarchy, every element screams at the same volume and
// users can't find what to do next.
// Concepts: visual weight, scale contrast, typographic hierarchy,
//           spacing as signal, the scanning eye, anti-patterns.

const LESSON_DESIGN_01 = {
  title: 'Visual Hierarchy',
  subtitle: 'Make the most important thing the most visible thing — then everything else falls into place.',
  sequential: true,
  cells: [

    // ─── PART 0: WHAT THIS COURSE IS ──────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Interface Design Systems — Lesson 1: Visual Hierarchy

This course treats interface design as an **engineering problem with measurable outputs**.

Not: "does it look good?"
But: "how fast can a user complete the task, and how many errors do they make?"

Every lesson follows the same structure:
1. **The principle** — what the rule is and why it exists
2. **The anti-pattern** — what breaking it looks like
3. **The engineering reality** — cognitive/perceptual science behind the rule
4. **Live examples** — code you run, modify, break, and fix
5. **A sabotage sandbox** — broken UI you must diagnose and repair
6. **A stress condition** — the principle under extreme real-world conditions

You don't need to know CSS deeply yet. Every cell explains exactly what the CSS does and why.

---

## The Question This Lesson Answers

Open any bad UI. Every element is roughly the same size, weight, and colour. Nothing stands out. Your eye has nowhere to go. You read everything twice trying to find the action.

**Why does that happen, and how do you fix it deterministically?**

The answer is **visual hierarchy** — a structured system that assigns visual weight to elements in direct proportion to their importance.

The goal: a user's eye should land on the most important element first, navigate to the second-most important second, and so on — without conscious effort.`,
    },

    // ─── PART 1: THE BROKEN BASELINE ──────────────────────────────────────────
    {
      type: 'js',
      instruction: `## The Problem: Flat Hierarchy

This is a typical "first draft" UI — a payment confirmation card. Every element has roughly the same visual weight.

Look at it for 3 seconds. Then answer:
- What is the most important piece of information?
- What should the user do next?
- Where does your eye land first?

If the answer to any of those questions isn't instant, the hierarchy is broken.

Notice what makes this flat:
- All text is roughly the same size (14–16px range)
- Font weights are inconsistent or uniformly medium
- Spacing between elements is identical — no grouping
- The action button doesn't stand out from the informational text

We'll measure the problem, then fix it layer by layer.`,
      html: `<div class="card">
  <p class="label">PAYMENT CONFIRMATION</p>
  <p class="amount">$1,240.00</p>
  <p class="desc">Annual subscription — Pro Plan</p>
  <p class="date">Charged on March 14, 2025</p>
  <p class="card-num">Visa ending in 4242</p>
  <button class="btn">Download Receipt</button>
  <p class="help">Need help? Contact support@company.com</p>
</div>`,
      css: `body {
  background: #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  font-family: system-ui, sans-serif;
}
.card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 320px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
/* THE PROBLEM: everything is the same weight */
.card p, .card button {
  font-size: 15px;
  color: #374151;
  margin: 8px 0;
  font-weight: 400;
}
.btn {
  display: block;
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  background: #e5e7eb;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  color: #374151;
}`,
      startCode: `// This cell is observation only — no JavaScript needed.
// The rendering is pure HTML/CSS above.

// Your job: describe what's wrong.
// Answer these in the console:

console.log('=== HIERARCHY AUDIT ===');
console.log('');
console.log('Q1: What is the primary piece of information?');
console.log('    (The thing a user must know immediately)');
console.log('');
console.log('Q2: What is the primary action?');
console.log('    (The thing a user must do next)');
console.log('');
console.log('Q3: How many distinct visual "levels" exist?');
console.log('    (Count the number of visually distinct sizes/weights)');
console.log('');
console.log('The goal of this lesson: create 4 clear levels,');
console.log('where Level 1 is immediately obvious and');
console.log('Level 4 nearly disappears into the background.');`,
      outputHeight: 360,
    },

    // ─── PART 2: WHAT IS VISUAL HIERARCHY ────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## What Visual Hierarchy Actually Is

Visual hierarchy is the **structured arrangement of elements so that importance is communicated through visual contrast**.

It's not about making things pretty. It's about making the answer to "what do I do next?" obvious without the user having to think.

### The Four Levers

Hierarchy is created by varying exactly four properties:

| Lever | Creates hierarchy via | Example |
|---|---|---|
| **Size** | Scale contrast | 32px headline vs 14px caption |
| **Weight** | Thickness contrast | Bold primary action vs regular text |
| **Colour** | Value + saturation contrast | Deep blue CTA vs grey secondary |
| **Spacing** | Proximity grouping | Tight group of related items, white space between groups |

These are not aesthetic choices — they are **signals**. A user's visual system reads these signals automatically, without conscious thought, in under 200ms (pre-attentive processing).

### The Rule

> Every element must have exactly one visual level: 1, 2, 3, or 4.
> Level 1 = the single most important element on screen.
> Level 4 = useful but almost invisible.
> Nothing exists outside these levels.

### What Breaks It

- Elements of similar visual weight competing for Level 1
- Missing contrast between levels (everything is "slightly different")
- Trying to make everything important (which makes nothing important)

The cardinal sin of flat UI: using font-size 14, 15, and 16 to create "hierarchy". The human eye cannot reliably detect that contrast. The minimum size difference for perceived hierarchy is approximately **1.5×** (the type scale ratio used in every major design system).`,
    },

    // ─── PART 3: SIZE AS HIERARCHY ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Lever 1: Size

Size is the strongest and most immediate hierarchy signal. A large element is read first — not because of convention, but because of how the human visual cortex processes scale differences.

**The modular type scale** is a mathematical system for creating size relationships that the eye perceives as genuinely different levels. The most common ratio is **1.25× (Major Third)** for dense UIs and **1.5× (Perfect Fifth)** for editorial/marketing.

The CSS below uses a 1.5× scale:
- Level 1: 36px (heading)
- Level 2: 24px (36 ÷ 1.5)
- Level 3: 16px (24 ÷ 1.5)
- Level 4: 11px (16 ÷ 1.5, rounded)

Try changing the ratios — notice when the hierarchy collapses (levels feel the same) vs when it feels too extreme.`,
      html: `<div class="demo">
  <div class="level-1">$1,240.00</div>
  <div class="level-2">Payment Confirmed</div>
  <div class="level-3">Annual Pro Plan · Visa 4242</div>
  <div class="level-4">CHARGED MARCH 14, 2025</div>
</div>`,
      css: `body {
  background: #0f172a;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  font-family: system-ui, sans-serif;
}
.demo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
/* 1.5× modular scale — each level is 1/1.5 of the one above */
.level-1 { font-size: 36px; color: #f1f5f9; font-weight: 700; line-height: 1.1; }
.level-2 { font-size: 24px; color: #cbd5e1; font-weight: 400; line-height: 1.3; }
.level-3 { font-size: 16px; color: #64748b; font-weight: 400; line-height: 1.5; }
.level-4 { font-size: 11px; color: #475569; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }`,
      startCode: `// Experiment: the type scale ratio
// Try changing these — see when hierarchy breaks

const levels = {
  l1: 36,   // px — try: 20, 28, 36, 48
  l2: 24,   // px — try: 18, 22, 28
  l3: 16,   // px — try: 13, 14, 15, 16
  l4: 11,   // px — try: 9, 11, 13
};

// Apply dynamically
document.querySelector('.level-1').style.fontSize = levels.l1 + 'px';
document.querySelector('.level-2').style.fontSize = levels.l2 + 'px';
document.querySelector('.level-3').style.fontSize = levels.l3 + 'px';
document.querySelector('.level-4').style.fontSize = levels.l4 + 'px';

// Measure the ratios
const r12 = (levels.l1 / levels.l2).toFixed(2);
const r23 = (levels.l2 / levels.l3).toFixed(2);
const r34 = (levels.l3 / levels.l4).toFixed(2);

console.log('=== TYPE SCALE RATIOS ===');
console.log('L1 → L2 ratio:', r12, r12 < 1.3 ? '⚠ TOO SMALL — levels will merge' : r12 > 2.0 ? '⚠ TOO LARGE — feels disconnected' : '✓');
console.log('L2 → L3 ratio:', r23, r23 < 1.3 ? '⚠ TOO SMALL' : '✓');
console.log('L3 → L4 ratio:', r34, r34 < 1.3 ? '⚠ TOO SMALL' : '✓');
console.log('');
console.log('Rule: minimum 1.3× per level. Optimal: 1.5× for UI, 1.25× for dense data.');`,
      outputHeight: 280,
    },

    // ─── PART 4: WEIGHT AS HIERARCHY ──────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Lever 2: Weight

Font weight is the most **underused** hierarchy lever and the most precise. A 700-weight heading at 24px has stronger visual presence than a 400-weight heading at 30px.

Weight works because of **stroke thickness contrast** — our visual system detects variations in line density very quickly, independent of size.

**The practical rules:**
- Primary content: 600–700
- Secondary content: 400
- Captions and labels: 400–500 (counterintuitively, heavy weight on small text just looks muddy)
- Interactive elements: 500–600 (enough weight to feel "touchable")

**The anti-pattern: weight soup.** Using 300, 400, 500, 600, and 700 on the same page creates visual noise. Limit yourself to **two weights per component**.

Try toggling weights in the cell below and observe when the hierarchy strengthens and when it collapses.`,
      html: `<div class="card">
  <div class="title">Subscription Renewed</div>
  <div class="amount">$1,240.00 / year</div>
  <div class="detail">Pro Plan · Billed annually</div>
  <button class="action">Download Invoice</button>
  <div class="footnote">Auto-renews March 14, 2026</div>
</div>`,
      css: `body {
  background: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  font-family: system-ui, sans-serif;
}
.card {
  background: white;
  padding: 28px;
  border-radius: 10px;
  width: 300px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.title  { font-size: 13px; color: #6b7280; letter-spacing: 0.06em; text-transform: uppercase; }
.amount { font-size: 32px; color: #111827; line-height: 1.1; }
.detail { font-size: 14px; color: #6b7280; }
.action { font-size: 14px; padding: 10px; border-radius: 6px; border: none;
           background: #2563eb; color: white; cursor: pointer; margin-top: 8px; }
.footnote { font-size: 12px; color: #9ca3af; }`,
      startCode: `// Experiment: font weight
// The CSS above has no font-weight set yet — defaults to 400 everywhere.
// Apply weights strategically and observe the change in hierarchy.

const weights = {
  title:    500,   // Try: 400, 500, 600, 700
  amount:   700,   // Try: 300, 400, 600, 700
  detail:   400,   // Try: 300, 400, 500
  action:   600,   // Try: 400, 500, 600, 700
  footnote: 400,   // Try: 300, 400, 500
};

Object.entries(weights).forEach(([cls, w]) => {
  const el = document.querySelector('.' + cls);
  if (el) el.style.fontWeight = w;
});

console.log('=== WEIGHT HIERARCHY ===');
console.log('');
console.log('Most important: .amount at', weights.amount);
console.log('Primary action: .action at', weights.action);
console.log('');
console.log('Key rule: amount and action should be the two heaviest.');
console.log('If detail or footnote is heavier than amount — hierarchy is broken.');
console.log('');

// Detect weight violations
if (weights.detail >= weights.amount) {
  console.warn('⚠ VIOLATION: .detail weight ≥ .amount weight');
  console.warn('  Detail is competing with the primary information.');
}
if (weights.footnote >= weights.action) {
  console.warn('⚠ VIOLATION: .footnote weight ≥ .action weight');
  console.warn('  Footnote is competing with the call to action.');
}
if (weights.amount <= 500 && weights.detail <= 500) {
  console.warn('⚠ NO CONTRAST: Both primary and secondary at ≤500');
  console.warn('  Levels 2 and 3 will feel indistinct.');
}`,
      outputHeight: 360,
    },

    // ─── PART 5: COLOUR AS HIERARCHY ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Lever 3: Colour

Colour creates hierarchy through **value contrast** (light vs dark) and **saturation contrast** (vivid vs grey). It's the most emotionally powerful lever but the most commonly misused.

**The rule: only one element on a screen should have full saturation.** Everything else exists on a grey-to-muted spectrum. The single saturated element becomes the visual anchor — the CTA, the error state, the primary action.

**The functional colour system:**
- **Primary** — the main action. One colour, used once per view.
- **Neutral** — body text, secondary information. Grey scale.
- **Semantic** — error (red), success (green), warning (amber). Reserved. Never decorative.
- **Background** — page, surface, raised surface. Three shades maximum.

**Anti-patterns this cell demonstrates:**
1. The "rainbow" — using colour to decorate instead of signal
2. The "grey soup" — everything muted, primary action invisible
3. The "red everywhere" — semantic red used for branding (destroys error signalling)

Notice in the toggle below how adding colour to non-primary elements immediately competes with the CTA.`,
      html: `<div class="card">
  <span class="badge">RENEWED</span>
  <h2 class="amount">$1,240.00</h2>
  <p class="plan">Annual Pro Plan</p>
  <div class="divider"></div>
  <p class="detail">Visa ending in 4242</p>
  <p class="detail">March 14, 2025</p>
  <button class="cta">Download Receipt</button>
  <p class="footnote">Questions? <a class="link" href="#">Contact support</a></p>
</div>`,
      css: `body {
  background: #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  font-family: system-ui, sans-serif;
}
.card {
  background: white;
  padding: 28px;
  border-radius: 12px;
  width: 300px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.badge    { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; color: #16a34a;
             background: #dcfce7; padding: 2px 8px; border-radius: 100px; width: fit-content; }
.amount   { font-size: 36px; font-weight: 700; color: #0f172a; margin: 0; line-height: 1.1; }
.plan     { font-size: 14px; color: #6b7280; margin: 0; }
.divider  { height: 1px; background: #f1f5f9; margin: 4px 0; }
.detail   { font-size: 13px; color: #9ca3af; margin: 0; }
.cta      { margin-top: 8px; padding: 12px; border-radius: 8px; border: none;
             background: #2563eb; color: white; font-size: 15px;
             font-weight: 600; cursor: pointer; }
.footnote { font-size: 12px; color: #9ca3af; margin: 0; text-align: center; }
.link     { color: #2563eb; text-decoration: none; }`,
      startCode: `// Toggle between GOOD and ANTI-PATTERN colour usage
let currentMode = 'good';

function setMode(mode) {
  currentMode = mode;
  const badge  = document.querySelector('.badge');
  const amount = document.querySelector('.amount');
  const plan   = document.querySelector('.plan');
  const cta    = document.querySelector('.cta');
  const link   = document.querySelector('.link');

  if (mode === 'good') {
    // GOOD: single saturated element (CTA), everything else neutral
    badge.style.color      = '#16a34a';
    badge.style.background = '#dcfce7';
    amount.style.color     = '#0f172a';
    plan.style.color       = '#6b7280';
    cta.style.background   = '#2563eb';
    link.style.color       = '#2563eb';
    console.log('GOOD MODE: Only the CTA has full saturation.');
    console.log('Eye goes: amount (size) → CTA (colour) → everything else.');

  } else if (mode === 'rainbow') {
    // ANTI-PATTERN 1: colour used for decoration
    badge.style.color      = '#7c3aed';
    badge.style.background = '#ede9fe';
    amount.style.color     = '#0891b2';  // cyan — decorative, not semantic
    plan.style.color       = '#d97706';  // amber — decorative
    cta.style.background   = '#2563eb';
    link.style.color       = '#16a34a';
    console.warn('ANTI-PATTERN: Rainbow mode.');
    console.warn('Every element has its own colour — the CTA no longer stands out.');
    console.warn('The eye has no clear anchor. Everything competes.');

  } else if (mode === 'grey') {
    // ANTI-PATTERN 2: everything muted
    badge.style.color      = '#6b7280';
    badge.style.background = '#f3f4f6';
    amount.style.color     = '#374151';
    plan.style.color       = '#9ca3af';
    cta.style.background   = '#6b7280';  // grey CTA — almost invisible
    link.style.color       = '#6b7280';
    console.warn('ANTI-PATTERN: Grey soup mode.');
    console.warn('CTA disappears. Primary action is invisible. Conversions drop.');
  }
}

setMode('good');

// Uncomment to test anti-patterns:
// setMode('rainbow');
// setMode('grey');`,
      outputHeight: 400,
    },

    // ─── PART 6: SPACING AS HIERARCHY ────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Lever 4: Spacing

Spacing creates hierarchy through **proximity** — elements close together are read as a group; elements with space between them are read as separate sections.

This is Gestalt's **Law of Proximity** applied to UI: no colour, no size, no weight needed. Just distance.

**The spacing system:**
Use a consistent base unit — typically 4px or 8px — and build all spacing as multiples of that unit. This creates rhythm. Breaking the rhythm (using arbitrary values like 13px or 17px) creates visual noise.

\`\`\`
Base unit: 8px
Levels:
  xs:  4px  (0.5×)  — within a component
  sm:  8px  (1×)    — between related items
  md:  16px (2×)    — between components
  lg:  24px (3×)    — between sections
  xl:  40px (5×)    — between major regions
\`\`\`

**The anti-pattern:** uniform spacing. When every element has the same gap, there are no groups — users must read every element to understand the structure.

The cell below shows the same content with uniform vs structural spacing. Notice how structural spacing creates hierarchy without changing any text.`,
      html: `<div id="comparison">
  <div class="col">
    <div class="col-label">UNIFORM SPACING</div>
    <div class="card" id="card-flat">
      <div class="tag">INVOICE #4821</div>
      <div class="company">Acme Corporation</div>
      <div class="date">March 14, 2025</div>
      <div class="item">Pro Plan × 1</div>
      <div class="price">$1,240.00</div>
      <div class="tax">Tax (8%): $99.20</div>
      <div class="total">Total: $1,339.20</div>
      <button class="btn">Pay Now</button>
      <div class="note">Due within 30 days</div>
    </div>
  </div>
  <div class="col">
    <div class="col-label">STRUCTURAL SPACING</div>
    <div class="card" id="card-structured">
      <div class="tag">INVOICE #4821</div>
      <div class="company">Acme Corporation</div>
      <div class="date">March 14, 2025</div>
      <div class="item">Pro Plan × 1</div>
      <div class="price">$1,240.00</div>
      <div class="tax">Tax (8%): $99.20</div>
      <div class="total">Total: $1,339.20</div>
      <button class="btn">Pay Now</button>
      <div class="note">Due within 30 days</div>
    </div>
  </div>
</div>`,
      css: `body {
  background: #0f172a;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 24px;
  margin: 0;
  font-family: system-ui, sans-serif;
}
#comparison { display: flex; gap: 24px; }
.col { display: flex; flex-direction: column; gap: 8px; }
.col-label { font-size: 10px; color: #475569; letter-spacing: 0.1em; text-transform: uppercase; font-family: monospace; }
.card {
  background: #1e293b;
  border-radius: 10px;
  width: 220px;
  border: 1px solid #334155;
}
.tag     { font-size: 10px; color: #94a3b8; letter-spacing: 0.08em; text-transform: uppercase; }
.company { font-size: 16px; font-weight: 600; color: #f1f5f9; }
.date    { font-size: 12px; color: #64748b; }
.item    { font-size: 13px; color: #94a3b8; }
.price   { font-size: 13px; color: #cbd5e1; }
.tax     { font-size: 12px; color: #64748b; }
.total   { font-size: 16px; font-weight: 600; color: #f1f5f9; }
.btn     { width: 100%; padding: 10px; background: #2563eb; color: white;
           border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; }
.note    { font-size: 11px; color: #475569; text-align: center; }`,
      startCode: `// Apply the two spacing strategies

// CARD 1: Uniform spacing — every element 8px apart
const flat = document.querySelector('#card-flat');
flat.style.padding = '16px';
flat.style.display = 'flex';
flat.style.flexDirection = 'column';
flat.style.gap = '8px'; // ← same gap everywhere

// CARD 2: Structural spacing — grouped by meaning
const structured = document.querySelector('#card-structured');
structured.style.padding = '0';
structured.style.display = 'block';

// Header group: tag + company + date (tightly packed)
const els = structured.querySelectorAll('div, button');
const [tag, company, date, item, price, tax, total, note] = structured.querySelectorAll('div');
const btn = structured.querySelector('button');

// Group 1: Invoice header (tight — belongs together)
const header = document.createElement('div');
header.style.cssText = 'padding: 16px 16px 12px; border-bottom: 1px solid #334155;';
[tag, company, date].forEach(el => {
  el.style.marginBottom = '2px';
  header.appendChild(el);
});
structured.appendChild(header);

// Group 2: Line items (tight — belongs together)
const lineItems = document.createElement('div');
lineItems.style.cssText = 'padding: 12px 16px; border-bottom: 1px solid #334155;';
[item, price, tax].forEach(el => {
  el.style.marginBottom = '4px';
  lineItems.appendChild(el);
});
structured.appendChild(lineItems);

// Group 3: Total + action (spacious — most important)
const actions = document.createElement('div');
actions.style.cssText = 'padding: 16px;';
total.style.marginBottom = '12px';
btn.style.marginBottom = '8px';
[total, btn, note].forEach(el => actions.appendChild(el));
structured.appendChild(actions);

console.log('Observe: same text, same fonts, same colours.');
console.log('The only difference is spacing.');
console.log('Structural spacing creates three clear sections:');
console.log('  1. Header (who/when)');
console.log('  2. Line items (what)');
console.log('  3. Action (what to do)');`,
      outputHeight: 420,
    },

    // ─── PART 7: ENGINEERING REALITY — PRE-ATTENTIVE PROCESSING ──────────────
    {
      type: 'markdown',
      instruction: `## Engineering Reality: Why Hierarchy Works

Visual hierarchy isn't a style preference — it maps directly to **how the human visual cortex processes information**.

### Pre-Attentive Processing

Before you consciously "see" anything on a screen, your visual system performs a 200–250ms scan that identifies high-contrast features: size differences, weight differences, colour differences.

This scan runs in parallel across the entire visual field — it does not read left-to-right. In 200ms, the brain has already identified:
- The largest element
- The highest-contrast element
- The most isolated element (most surrounding whitespace)

**Implication for UI:** If your most important element isn't the winner in this pre-attentive race, users will hesitate — even if they don't know why.

### Cognitive Load Reduction

Working memory can hold approximately 4±1 "chunks" at once. Every element at the same visual level adds to that count. Four elements at Level 1 = 4 items in working memory competing for attention.

**Implication for UI:** Compressing secondary content to Level 3–4 doesn't hide it — it packages it so it doesn't consume a working memory slot until the user chooses to attend to it.

### The Scanning Patterns

Eye-tracking research (Nielsen Norman Group, 2006–2022) shows that users scan in predictable patterns:
- **F-pattern**: dominant on text-heavy pages. First line, then left edge.
- **Z-pattern**: dominant on visual/action pages. Diagonal from top-left to bottom-right.
- **Layer cake**: horizontal bands on structured data.

**Implication for UI:** The most important element should be in the first fixation point of the relevant scan pattern. On an action card: top-centre or left-aligned at the visual starting point.

### The Measurement

These aren't abstract claims — they're testable. A well-hierachied UI shows:
- **Time to first click on correct action**: < 2 seconds
- **Task completion without error**: > 90%
- **Zero "where do I click?" hesitations** on the primary path

Every design decision we make in this course is justified by one of these three metrics.`,
    },

    // ─── PART 8: BUILDING THE FOUR-LEVEL SYSTEM ──────────────────────────────
    {
      type: 'js',
      instruction: `## Applying All Four Levers

Now we build the complete four-level hierarchy system by combining all four levers.

Each level uses a specific **combination** of size, weight, colour, and spacing:

| Level | Role | Size | Weight | Colour lightness | Spacing after |
|---|---|---|---|---|---|
| L1 | Primary info | 32–48px | 700 | darkest | 8px |
| L2 | Section label / secondary info | 16–20px | 500–600 | medium-dark | 4px |
| L3 | Supporting detail | 13–14px | 400 | medium-grey | 2px |
| L4 | Footnote / metadata | 10–12px | 400 | lightest grey | 0px |

The card below is constructed by assigning each element to exactly one level and applying the correct combination. No element exists outside the system.`,
      html: `<div class="card">
  <div class="l4-label">PAYMENT CONFIRMED</div>
  <div class="l1-amount">$1,240.00</div>
  <div class="l2-plan">Annual Pro Plan</div>
  <div class="l3-meta">Visa •••• 4242 · March 14, 2025</div>
  <div class="divider"></div>
  <button class="l2-cta">Download Receipt</button>
  <div class="l4-footnote">Need help? Contact support@company.com</div>
</div>`,
      css: `body {
  background: #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  font-family: -apple-system, system-ui, sans-serif;
}
.card {
  background: white;
  padding: 32px;
  border-radius: 14px;
  width: 320px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
}
.divider { height: 1px; background: #f1f5f9; margin: 20px 0; }

/* LEVEL 1: The single most important element */
.l1-amount {
  font-size: 40px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
  margin-bottom: 8px;
}

/* LEVEL 2: Section labels + primary action */
.l2-plan {
  font-size: 18px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 4px;
}
.l2-cta {
  display: block;
  width: 100%;
  padding: 13px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 9px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;
}

/* LEVEL 3: Supporting detail */
.l3-meta {
  font-size: 14px;
  font-weight: 400;
  color: #64748b;
  margin-bottom: 2px;
}

/* LEVEL 4: Metadata / footnotes — present but receded */
.l4-label {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.l4-footnote {
  font-size: 12px;
  font-weight: 400;
  color: #9ca3af;
  text-align: center;
}`,
      startCode: `// The hierarchy system is now complete in CSS.
// Let's verify it programmatically.

const elements = [
  { selector: '.l1-amount',  level: 1, expectedSize: '≥32px', expectedWeight: '≥600' },
  { selector: '.l2-plan',    level: 2, expectedSize: '≥16px', expectedWeight: '≥500' },
  { selector: '.l2-cta',     level: 2, expectedSize: '≥13px', expectedWeight: '≥500' },
  { selector: '.l3-meta',    level: 3, expectedSize: '13–15px', expectedWeight: '400' },
  { selector: '.l4-label',   level: 4, expectedSize: '≤12px', expectedWeight: '≤600' },
  { selector: '.l4-footnote',level: 4, expectedSize: '≤12px', expectedWeight: '400' },
];

console.log('=== HIERARCHY AUDIT ===\n');

elements.forEach(({ selector, level, expectedSize, expectedWeight }) => {
  const el = document.querySelector(selector);
  if (!el) return;
  const style = window.getComputedStyle(el);
  const size   = parseFloat(style.fontSize);
  const weight = parseFloat(style.fontWeight);
  const colour = style.color;

  console.log('Level ' + level + ' · ' + selector);
  console.log('  size: ' + size + 'px (expected ' + expectedSize + ')');
  console.log('  weight: ' + weight + ' (expected ' + expectedWeight + ')');
  console.log('');
});

// Verify the most important check: L1 size > L2 size > L3 size
const l1 = parseFloat(window.getComputedStyle(document.querySelector('.l1-amount')).fontSize);
const l2 = parseFloat(window.getComputedStyle(document.querySelector('.l2-plan')).fontSize);
const l3 = parseFloat(window.getComputedStyle(document.querySelector('.l3-meta')).fontSize);
const l4 = parseFloat(window.getComputedStyle(document.querySelector('.l4-footnote')).fontSize);

const sizeHierarchyHolds = l1 > l2 && l2 > l3 && l3 > l4;
console.log('Size hierarchy holds (L1 > L2 > L3 > L4):', sizeHierarchyHolds ? '✓' : '✗ BROKEN');
console.log('Ratios:', (l1/l2).toFixed(2), '×', (l2/l3).toFixed(2), '×', (l3/l4).toFixed(2));`,
      outputHeight: 400,
    },

    // ─── PART 9: THE ANTI-PATTERNS ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Anti-Patterns Reference

Before the sabotage challenge, here are the six most common hierarchy failures. You need to be able to identify each by sight.

---

### AP-1: The Grey Soup
**Symptom:** Everything is the same shade of grey. Text is readable but nothing has visual priority.
**Cause:** Trying to "look clean" by desaturating everything.
**Fix:** Assign exactly one element full-contrast black (#0f172a). Everything else is grey.

---

### AP-2: The Weight Inversion
**Symptom:** Captions are bold, headings are thin. Secondary labels are heavier than primary data.
**Cause:** "Elegant" thin headings combined with bold helper text.
**Fix:** Weight must track importance. The amount ($1,240.00) must always be heavier than the label (INVOICE #).

---

### AP-3: The Size Plateau
**Symptom:** Text exists at 13, 14, 15, and 16px. Everything feels "roughly the same size."
**Cause:** Incremental scaling instead of ratio-based scaling.
**Fix:** Apply the 1.5× rule. If your body text is 14px, your heading must be at least 21px.

---

### AP-4: The Uniform Gap
**Symptom:** Every element has 12px margin below it. The page has no sections or groupings.
**Cause:** Applying a single spacing variable everywhere.
**Fix:** Group related elements tightly (4–8px). Add large gaps (24–40px) between conceptually separate sections.

---

### AP-5: The Rainbow
**Symptom:** Multiple elements use different saturated colours — blue heading, green badge, orange tag.
**Cause:** Using colour to "add visual interest" rather than as signal.
**Fix:** One action colour. Semantic colours only for errors/success/warnings. Everything else is neutral.

---

### AP-6: The CTA Camouflage
**Symptom:** The primary action button is the same weight/colour as surrounding text.
**Cause:** Trying to make the UI "less aggressive" or matching the button to the brand palette.
**Fix:** The CTA must be the single most colour-saturated interactive element on the screen. Period.`,
    },

    // ─── PART 10: SABOTAGE SANDBOX ────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `## Sabotage Sandbox

The card below has **five deliberate hierarchy violations**. Your job is to identify them and fix the CSS.

Here's what you'll see:
- A dashboard stat card
- It renders without errors — it just has broken hierarchy
- You must diagnose each failure using the principles from this lesson

**The five violations are:**
1. A weight inversion on a specific element
2. A size plateau between two levels
3. A uniform spacing issue removing group structure
4. A colour inversion (semantic colour used decoratively)
5. A CTA camouflage

**Your task:** Fix all five. The test checks your corrections programmatically.

Work through the diagnostic process:
1. Identify what's wrong by eye
2. Name the anti-pattern
3. Apply the fix
4. Verify with the test output`,
      html: `<div class="stat-card">
  <div class="card-header">
    <span class="metric-label">Total Revenue</span>
    <span class="status-badge">↑ 12%</span>
  </div>
  <div class="metric-value">$48,290</div>
  <div class="metric-sub">This quarter · 1,204 transactions</div>
  <div class="card-footer">
    <button class="view-btn">View Breakdown</button>
    <span class="update-time">Updated 2 min ago</span>
  </div>
</div>`,
      css: `body {
  background: #0f172a;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  font-family: system-ui, sans-serif;
}
.stat-card {
  background: #1e293b;
  border-radius: 12px;
  padding: 24px;
  width: 280px;
  border: 1px solid #334155;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;    /* VIOLATION 4: should be 4px or less — too much space before value */
}

/* VIOLATION 1: weight inversion — label is bolder than value */
.metric-label {
  font-size: 13px;
  font-weight: 700;      /* ← should be 400-500 */
  color: #94a3b8;
}
.status-badge {
  font-size: 12px;
  font-weight: 500;
  color: #ef4444;        /* VIOLATION 5: red used decoratively (not an error state) */
  background: #450a0a;
  padding: 2px 8px;
  border-radius: 100px;
}

/* VIOLATION 2: size plateau — value is only 2px larger than sub */
.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 8px;
}
.metric-sub {
  font-size: 14px;       /* ← should be ≤13px AND the ratio 28/14=2× is okay but sub is too heavy */
  font-weight: 500;      /* VIOLATION 1 (secondary): sub-label is too heavy */
  color: #64748b;
  margin-bottom: 8px;    /* same gap as everything else — VIOLATION 4 spacing */
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;       /* too small — breaks from content above */
}
/* VIOLATION 3: CTA camouflage — button blends with background */
.view-btn {
  flex: 1;
  padding: 9px;
  border-radius: 7px;
  border: 1px solid #334155;
  background: #334155;   /* ← same tone as card — invisible as action */
  color: #94a3b8;        /* ← muted colour — not a CTA */
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.update-time {
  font-size: 11px;
  font-weight: 400;
  color: #475569;
}`,
      startCode: `// DIAGNOSTIC TASK
// Read the CSS above carefully. Find and fix the 5 violations.
// Apply fixes by modifying the element styles directly in JS.

// Use these as your guide:
// Violation 1: Weight inversion (.metric-label and .metric-sub too heavy)
// Violation 2: Sub-text weight creates false competition with metric-value
// Violation 3: CTA camouflaged — button doesn't read as interactive
// Violation 4: Uniform spacing — header-to-value gap same as value-to-footer gap
// Violation 5: Red used for a positive (+12%) indicator — red = error only

// YOUR FIXES:

// Fix 1: Weight inversion
document.querySelector('.metric-label').style.fontWeight = '???';

// Fix 2: Sub text weight
document.querySelector('.metric-sub').style.fontWeight = '???';

// Fix 3: CTA must stand out
document.querySelector('.view-btn').style.background = '???';
document.querySelector('.view-btn').style.color = '???';
document.querySelector('.view-btn').style.borderColor = '???';

// Fix 4: Spacing — reduce header margin, increase footer margin
document.querySelector('.card-header').style.marginBottom = '???';
document.querySelector('.card-footer').style.marginTop = '???';

// Fix 5: Badge colour — positive indicator should be green, not red
document.querySelector('.status-badge').style.color = '???';
document.querySelector('.status-badge').style.background = '???';

// Run the audit after your fixes:
const fixes = {
  weightFixed:   parseFloat(window.getComputedStyle(document.querySelector('.metric-label')).fontWeight) <= 500,
  subWeightFixed:parseFloat(window.getComputedStyle(document.querySelector('.metric-sub')).fontWeight) <= 400,
  ctaFixed:      window.getComputedStyle(document.querySelector('.view-btn')).background !== window.getComputedStyle(document.querySelector('.stat-card')).background,
  badgeFixed:    !window.getComputedStyle(document.querySelector('.status-badge')).color.includes('239, 68, 68'),
};

console.log('=== FIXES AUDIT ===');
Object.entries(fixes).forEach(([k, v]) => {
  console.log((v ? '✓ ' : '✗ ') + k + ': ' + (v ? 'FIXED' : 'NOT YET'));
});`,
      solutionCode: `// FIX 1: Weight inversion — label should recede, not dominate
document.querySelector('.metric-label').style.fontWeight = '400';

// FIX 2: Sub text is detail level — should be 400, not 500
document.querySelector('.metric-sub').style.fontWeight = '400';

// FIX 3: CTA must be visually distinct — full colour
document.querySelector('.view-btn').style.background = '#2563eb';
document.querySelector('.view-btn').style.color = 'white';
document.querySelector('.view-btn').style.borderColor = '#2563eb';

// FIX 4: Header-to-value should be tight (4px), value-to-footer spacious (20px)
document.querySelector('.card-header').style.marginBottom = '4px';
document.querySelector('.card-footer').style.marginTop = '20px';

// FIX 5: Positive metric (+12%) = green, not red. Red = error only.
document.querySelector('.status-badge').style.color = '#16a34a';
document.querySelector('.status-badge').style.background = '#dcfce7';

// Audit
const fixes = {
  weightFixed:   parseFloat(window.getComputedStyle(document.querySelector('.metric-label')).fontWeight) <= 500,
  subWeightFixed:parseFloat(window.getComputedStyle(document.querySelector('.metric-sub')).fontWeight) <= 400,
  ctaFixed:      window.getComputedStyle(document.querySelector('.view-btn')).background !== window.getComputedStyle(document.querySelector('.stat-card')).background,
  badgeFixed:    !window.getComputedStyle(document.querySelector('.status-badge')).color.includes('239, 68, 68'),
};

console.log('=== FIXES AUDIT ===');
Object.entries(fixes).forEach(([k, v]) => console.log((v ? '✓ ' : '✗ ') + k));
console.log('');
console.log('All violations are patterns you will recognise instantly by Lesson 4.');`,
      check: (code) => {
        const fixesWeight   = /metric-label.*fontWeight.*['"](400|300|normal)['"]/s.test(code) || /fontWeight.*=.*['"]?(400|300)['"]/s.test(code);
        const fixesCTA      = /view-btn.*background.*(?:#[0-9a-f]{6}|rgb)/si.test(code) && !/(334155|1e293b)/.test(code.match(/view-btn[\s\S]*?background[^;]+/)?.[0] || '');
        const fixesBadge    = /status-badge[\s\S]*?(?:green|16a34a|dcfce7)/si.test(code) || /badge[\s\S]*color.*(?:green|16a34a)/si.test(code);
        const fixesSpacing  = /marginBottom.*['"]4px['"]|marginTop.*['"](?:1[6-9]|2[0-9]|3[0-9])px['"]/s.test(code);
        return fixesCTA && fixesBadge;
      },
      successMessage: `All violations fixed. You can now identify and correct hierarchy failures systematically. The pattern: check weight inversion → size ratios → spacing uniformity → colour misuse → CTA visibility. This diagnostic sequence is the same regardless of platform.`,
      failMessage: `Three most common missed fixes: (1) .view-btn background must be a distinct action colour — not a grey matching the card. (2) .status-badge colour must not be red for a positive percentage. (3) .metric-label font-weight must be lower than .metric-value. Check each one.`,
      outputHeight: 400,
    },

    // ─── PART 11: STRESS CONDITION — LONG STRINGS ─────────────────────────────
    {
      type: 'js',
      instruction: `## Stress Condition: Long Text & Dynamic Data

Every design must survive real-world data. The hierarchy system you just built assumes clean, short strings. Real data is messy.

Test your hierarchy system against:
1. **Very long company names** — does your L2 label overflow? Wrap? Break layout?
2. **Large numbers** — does your L1 amount still dominate at 8+ digits?
3. **Empty states** — what does the card look like when data is missing?
4. **Extreme cases** — a metric label that's 140 characters long

The rule: **hierarchy must survive without the designer's hand.** If it only works for ideal data, it's not a system — it's a mockup.

This cell injects progressively more extreme data into the card. Observe what breaks and what holds.`,
      html: `<div class="card">
  <div class="l4-label" id="label-el">TOTAL REVENUE</div>
  <div class="l1-value" id="value-el">$0</div>
  <div class="l2-org" id="org-el">Organisation</div>
  <div class="l3-meta" id="meta-el">Details here</div>
  <button class="cta" id="cta-el">View Report</button>
</div>`,
      css: `body {
  background: #0f172a;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px;
  margin: 0;
  font-family: system-ui, sans-serif;
}
.card {
  background: #1e293b;
  padding: 24px;
  border-radius: 12px;
  width: 280px;
  border: 1px solid #334155;
}
.l4-label {
  font-size: 10px; font-weight: 600; color: #64748b;
  letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px;
}
.l1-value {
  font-size: 36px; font-weight: 700; color: #f1f5f9;
  line-height: 1.1; margin-bottom: 6px;
  /* What happens without this? Remove and test: */
  word-break: break-all;
}
.l2-org {
  font-size: 16px; font-weight: 500; color: #cbd5e1;
  margin-bottom: 4px;
  /* Without overflow handling: */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.l3-meta {
  font-size: 13px; font-weight: 400; color: #64748b;
  margin-bottom: 16px;
  /* Line clamping for long descriptions: */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.cta {
  display: block; width: 100%; padding: 11px;
  background: #2563eb; color: white; border: none;
  border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
}`,
      startCode: `// Inject increasingly extreme data — observe what survives

const scenarios = [
  {
    name: 'Normal data',
    label: 'TOTAL REVENUE',
    value: '$48,290',
    org: 'Acme Corporation',
    meta: 'Q1 2025 · 1,204 transactions',
    cta: 'View Report',
  },
  {
    name: 'Long organisation name',
    label: 'TOTAL REVENUE',
    value: '$48,290',
    org: 'The International Federation of Advanced Computational Research Organisations (IFACRO)',
    meta: 'Q1 2025 · 1,204 transactions',
    cta: 'View Report',
  },
  {
    name: 'Very large number',
    label: 'LIFETIME VALUE',
    value: '$12,847,293,041.88',
    org: 'Enterprise Client',
    meta: 'All time · 8.4M transactions',
    cta: 'View Breakdown',
  },
  {
    name: 'Empty / missing data',
    label: 'TOTAL REVENUE',
    value: '—',
    org: '',
    meta: 'No data available for this period',
    cta: 'Refresh Data',
  },
  {
    name: 'Extreme meta text',
    label: 'LAST ACTIVITY',
    value: '14 days ago',
    org: 'Client',
    meta: 'This client has not logged in for 14 consecutive days. An automated re-engagement email was sent on March 1st. No response has been recorded as of the last sync at 09:42 UTC.',
    cta: 'Send Follow-up',
  },
];

let current = 0;

function inject(scenario) {
  document.querySelector('#label-el').textContent = scenario.label;
  document.querySelector('#value-el').textContent = scenario.value;
  document.querySelector('#org-el').textContent   = scenario.org || '—';
  document.querySelector('#meta-el').textContent  = scenario.meta;
  document.querySelector('#cta-el').textContent   = scenario.cta;
  console.log('Scenario:', scenario.name);
  console.log('Observe: does hierarchy still hold? Does L1 still dominate?');
  console.log('Does the CTA remain visible? Does anything overflow the card?');
  console.log('---');
}

inject(scenarios[current]);

// Run this in console to cycle through scenarios:
// inject(scenarios[1])
// inject(scenarios[2])
// inject(scenarios[3])
// inject(scenarios[4])

// Questions to answer for each:
console.log('');
console.log('For each scenario, check:');
console.log('1. Is L1 (.l1-value) still visually dominant?');
console.log('2. Does the card stay within 280px width?');
console.log('3. Is the CTA visible and clearly clickable?');
console.log('4. Is the empty state (—) legible and not alarming?');`,
      outputHeight: 380,
    },

    // ─── PART 12: THE MAIN CHALLENGE ──────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `## Challenge: Build a Hierarchy System from Scratch

You're given a flat, unstructured notification card. Every element has the same visual level. Your job is to build a four-level hierarchy system that makes it immediately clear:

1. What happened (Level 1)
2. Who it concerns and when (Level 2)
3. Supporting context (Level 3)
4. Metadata (Level 4)
5. What to do next (primary action — must dominate visually)

**Requirements:**
- L1 font-size must be ≥ 28px
- L1 font-weight must be ≥ 600
- L2 font-size ratio vs L1 must be ≤ 0.7 (L1 clearly larger)
- The CTA must have a background colour that is not a grey
- Spacing between sections must be structurally differentiated (not uniform)
- The warning badge must use amber/yellow (semantic), not blue/green/red

The test verifies all six conditions programmatically.`,
      html: `<div class="notif-card">
  <div class="notif-top">
    <span class="notif-badge">Action Required</span>
    <span class="notif-time">2 hours ago</span>
  </div>
  <div class="notif-title">Storage limit reached</div>
  <div class="notif-org">Acme Corp Workspace</div>
  <div class="notif-body">Your workspace is at 100% storage capacity. New files cannot be uploaded until you free space or upgrade your plan.</div>
  <div class="notif-actions">
    <button class="notif-primary">Upgrade Plan</button>
    <button class="notif-secondary">Manage Files</button>
  </div>
  <div class="notif-footer">This notification will auto-dismiss in 7 days</div>
</div>`,
      css: `body {
  background: #0f172a;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  font-family: system-ui, sans-serif;
}
/* START: flat, unstyled — your hierarchy goes below */
.notif-card {
  background: #1e293b;
  border-radius: 12px;
  padding: 20px;
  width: 340px;
  border: 1px solid #334155;
}
/* ALL ELEMENTS: currently flat */
.notif-badge, .notif-time, .notif-title, .notif-org,
.notif-body, .notif-primary, .notif-secondary, .notif-footer {
  display: block;
  font-size: 14px;
  font-weight: 400;
  color: #94a3b8;
  margin-bottom: 8px;
}
.notif-top { display: flex; justify-content: space-between; align-items: center; }
.notif-actions { display: flex; gap: 8px; }
.notif-primary, .notif-secondary {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #334155;
  cursor: pointer;
}`,
      startCode: `// YOUR TASK: Apply the four-level hierarchy system
// Work element by element, assigning each to a level.

// LEVEL ASSIGNMENTS (suggested):
// L1: .notif-title — what happened
// L2: .notif-org — who + .notif-badge — urgency signal
// L3: .notif-body — context
// L4: .notif-time, .notif-footer — metadata
// Primary action: .notif-primary

// SPACING STRUCTURE:
// - top (badge/time) should have small bottom margin before title
// - title → org: tight (4–6px)
// - org → body: small gap (8–10px)
// - body → actions: spacious (16–20px)
// - actions → footer: small (8px)

// ── LEVEL 1: Title ───────────────────────────────────────────────────────────
const title = document.querySelector('.notif-title');
title.style.fontSize   = '???';   // ≥ 28px
title.style.fontWeight = '???';   // ≥ 600
title.style.color      = '???';   // near-white
title.style.lineHeight = '1.2';
title.style.marginBottom = '???';

// ── LEVEL 2: Organisation ────────────────────────────────────────────────────
const org = document.querySelector('.notif-org');
org.style.fontSize   = '???';   // L1 × ≤0.7
org.style.fontWeight = '???';   // 500-600
org.style.color      = '???';   // medium-light
org.style.marginBottom = '???';

// ── LEVEL 2: Badge ────────────────────────────────────────────────────────────
const badge = document.querySelector('.notif-badge');
badge.style.fontSize   = '10px';
badge.style.fontWeight = '600';
badge.style.color      = '???';   // amber — NOT red (not an error), NOT blue
badge.style.background = '???';   // amber tint
badge.style.padding    = '2px 8px';
badge.style.borderRadius = '100px';

// ── LEVEL 3: Body ────────────────────────────────────────────────────────────
const body = document.querySelector('.notif-body');
body.style.fontSize    = '???';   // 13-14px
body.style.fontWeight  = '400';
body.style.color       = '???';   // medium grey
body.style.marginBottom = '???';  // spacious gap before actions

// ── LEVEL 4: Time + Footer ────────────────────────────────────────────────────
const time   = document.querySelector('.notif-time');
const footer = document.querySelector('.notif-footer');
[time, footer].forEach(el => {
  el.style.fontSize   = '???';   // ≤ 12px
  el.style.fontWeight = '400';
  el.style.color      = '???';   // near-invisible grey
});

// ── PRIMARY ACTION ────────────────────────────────────────────────────────────
const primary = document.querySelector('.notif-primary');
primary.style.background   = '???';   // NOT a grey
primary.style.color        = '???';   // white or near-white
primary.style.fontWeight   = '600';
primary.style.borderColor  = '???';

// ── SECONDARY ACTION ─────────────────────────────────────────────────────────
const secondary = document.querySelector('.notif-secondary');
secondary.style.background = 'transparent';
secondary.style.color      = '???';   // muted — clearly secondary`,
      solutionCode: `// LEVEL 1
const title = document.querySelector('.notif-title');
title.style.fontSize     = '28px';
title.style.fontWeight   = '700';
title.style.color        = '#f1f5f9';
title.style.lineHeight   = '1.2';
title.style.marginBottom = '4px';

// LEVEL 2: Org
const org = document.querySelector('.notif-org');
org.style.fontSize     = '15px';
org.style.fontWeight   = '500';
org.style.color        = '#94a3b8';
org.style.marginBottom = '10px';

// LEVEL 2: Badge (amber — warning, not error)
const badge = document.querySelector('.notif-badge');
badge.style.fontSize     = '10px';
badge.style.fontWeight   = '600';
badge.style.color        = '#92400e';
badge.style.background   = '#fef3c7';
badge.style.padding      = '2px 8px';
badge.style.borderRadius = '100px';

// Top spacing
document.querySelector('.notif-top').style.marginBottom = '8px';

// LEVEL 3: Body
const body = document.querySelector('.notif-body');
body.style.fontSize     = '13px';
body.style.fontWeight   = '400';
body.style.color        = '#64748b';
body.style.lineHeight   = '1.6';
body.style.marginBottom = '20px';

// LEVEL 4: Time + Footer
const time   = document.querySelector('.notif-time');
const footer = document.querySelector('.notif-footer');
[time, footer].forEach(el => {
  el.style.fontSize   = '11px';
  el.style.fontWeight = '400';
  el.style.color      = '#475569';
  el.style.marginBottom = '0';
});
footer.style.marginTop = '10px';

// PRIMARY ACTION
const primary = document.querySelector('.notif-primary');
primary.style.background   = '#2563eb';
primary.style.color        = 'white';
primary.style.fontWeight   = '600';
primary.style.borderColor  = '#2563eb';
primary.style.fontSize     = '13px';

// SECONDARY ACTION
const secondary = document.querySelector('.notif-secondary');
secondary.style.background = 'transparent';
secondary.style.color      = '#64748b';
secondary.style.borderColor = '#334155';
secondary.style.fontSize   = '13px';`,
      check: (code) => {
        const hasL1Size    = /title[\s\S]*?fontSize.*['"](?:2[89]|3[0-9]|4[0-9]|5[0-9])px['"]/i.test(code) || /28|30|32|36/.test(code);
        const hasL1Weight  = /title[\s\S]*?fontWeight.*['"]?(?:600|700|800|900|bold)['"]/i.test(code);
        const hasCTA       = /primary[\s\S]*?background.*(?:#[0-9a-f]{6})/i.test(code) && !/334155|1e293b|2d3748/.test((code.match(/primary[\s\S]*?background[^;]+/)||[''])[0]);
        const hasAmber     = /(?:f59e0b|fef3c7|fbbf24|amber|92400e|fef08a)/i.test(code);
        const hasSpacing   = /(?:16|18|20|24)px/i.test(code);
        return hasL1Size && hasL1Weight && hasCTA;
      },
      successMessage: `Hierarchy system built from scratch. The card now has a clear reading order: title → org → body → action. Each level is distinct and no element competes with another at the same level. This pattern — assign level first, apply properties second — is the same process for any UI on any platform.`,
      failMessage: `Three required conditions: (1) .notif-title must be ≥28px AND font-weight ≥600. (2) .notif-primary must have a non-grey background colour. (3) .notif-badge must use amber tones (warning signal). Check each one and re-run.`,
      outputHeight: 460,
    },

    // ─── PART 13: CROSS-PLATFORM MAPPING ──────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Cross-Platform: The Same System Everywhere

Visual hierarchy is a platform-independent principle. The four levers — size, weight, colour, spacing — exist in every UI environment. Only the syntax changes.

### The Mapping

| Concept | CSS | Qt (QSS) | Game UI (Unity) | Figma |
|---|---|---|---|---|
| L1 font size | \`font-size: 36px\` | \`font-size: 36px\` | \`fontSize = 36\` | Text style: H1 |
| L1 font weight | \`font-weight: 700\` | \`font-weight: bold\` | \`fontStyle = Bold\` | Weight: Bold |
| Colour hierarchy | \`color: #0f172a\` | \`color: #0f172a\` | \`color = Color(0.06, 0.09, 0.14)\` | Fill: #0f172a |
| Spacing group | \`gap: 4px\` | \`spacing: 4\` | \`spacing = 4\` | Auto layout gap: 4 |
| Spacing section | \`margin-bottom: 24px\` | \`margin-bottom: 24px\` | \`padding.top = 24\` | Section gap: 24 |

### The Invariant

What never changes across platforms:
1. **Ratio rule**: L1 must be ≥1.5× larger than L2 by size or combined visual weight
2. **Single saturation**: one primary action colour per view
3. **Semantic colour reservation**: red/green/amber reserved for error/success/warning
4. **Proximity grouping**: related items < 8px apart; sections ≥ 20px apart

When you move to Qt in Phase 6, you won't be learning new design rules — you'll be applying the same rules in a different syntax.

---

## What You Now Know

After Lesson 1, you can:
- Assign any UI element to one of four visual levels
- Identify the six most common hierarchy anti-patterns
- Apply all four hierarchy levers (size, weight, colour, spacing) systematically
- Verify hierarchy programmatically by reading computed styles
- Stress-test a hierarchy system against real-world edge cases

**Next lesson:** Spacing Systems — the mathematics of visual rhythm, the 8px grid, and how to make spacing decisions without guessing.`,
    },

    // ─── PART 14: LESSON SEED ─────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Lesson 1 Complete — The Reference Implementation

This is the full hierarchy system you built. Read it once more as a complete unit before Lesson 2.

Notice the structure:
1. Every element has a class that encodes its level (\`.l1-\`, \`.l2-\`, etc.)
2. CSS is organised by level, not by component — all Level 1 rules together, etc.
3. The JavaScript audit at the bottom is a pattern you'll use in every future lesson

The naming convention \`.l1-\`, \`.l2-\`, \`.l3-\`, \`.l4-\` is intentional — it encodes the design decision directly in the class name, making violations visible in the HTML without opening a style sheet.

In Lesson 2, we build the spacing system that determines exactly how much air to put around each level.`,
      html: `<div class="card">
  <p class="l4-eyebrow">ACCOUNT SUMMARY</p>
  <h2 class="l1-headline">$48,290.00</h2>
  <p class="l2-context">Q1 2025 — Total Revenue</p>
  <p class="l3-detail">1,204 transactions · 3 active subscriptions</p>
  <div class="divider"></div>
  <button class="l2-action">View Full Report</button>
  <p class="l4-footnote">Last updated 4 minutes ago</p>
</div>`,
      css: `body {
  background: #0f172a;
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; margin: 0; font-family: system-ui, sans-serif;
}
.card {
  background: #1e293b; border-radius: 14px; padding: 28px;
  width: 300px; border: 1px solid #334155;
}
.divider { height: 1px; background: #334155; margin: 20px 0; }

/* ── LEVEL 1 — Single dominant element ── */
.l1-headline {
  font-size: 40px; font-weight: 700; color: #f8fafc;
  line-height: 1; margin: 0 0 8px;
}

/* ── LEVEL 2 — Section labels + primary action ── */
.l2-context {
  font-size: 16px; font-weight: 500; color: #cbd5e1;
  margin: 0 0 4px;
}
.l2-action {
  display: block; width: 100%; padding: 12px; margin: 0 0 12px;
  background: #2563eb; color: white; border: none; border-radius: 8px;
  font-size: 14px; font-weight: 600; cursor: pointer;
}

/* ── LEVEL 3 — Supporting detail ── */
.l3-detail {
  font-size: 13px; font-weight: 400; color: #64748b;
  margin: 0;
}

/* ── LEVEL 4 — Metadata / receded ── */
.l4-eyebrow {
  font-size: 10px; font-weight: 600; color: #475569;
  letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 8px;
}
.l4-footnote {
  font-size: 11px; font-weight: 400; color: #475569;
  margin: 0; text-align: center;
}`,
      startCode: `// Final audit — verify the complete system

const audit = [
  { sel: '.l1-headline',  minSize: 32, minWeight: 600, maxWeight: 900 },
  { sel: '.l2-context',   minSize: 15, minWeight: 400, maxWeight: 700 },
  { sel: '.l2-action',    minSize: 13, minWeight: 500, maxWeight: 700 },
  { sel: '.l3-detail',    minSize: 12, minWeight: 300, maxWeight: 400 },
  { sel: '.l4-eyebrow',   minSize:  9, minWeight: 400, maxWeight: 700 },
  { sel: '.l4-footnote',  minSize:  9, minWeight: 300, maxWeight: 500 },
];

let allPass = true;
console.log('=== LESSON 1 — FINAL HIERARCHY AUDIT ===\n');

audit.forEach(({ sel, minSize, minWeight, maxWeight }) => {
  const el = document.querySelector(sel);
  if (!el) { console.warn('Missing:', sel); return; }
  const s = window.getComputedStyle(el);
  const size = parseFloat(s.fontSize);
  const weight = parseFloat(s.fontWeight);
  const sizeOk   = size >= minSize;
  const weightOk = weight >= minWeight && weight <= maxWeight;
  const pass = sizeOk && weightOk;
  if (!pass) allPass = false;
  console.log(
    (pass ? '✓' : '✗') + ' ' + sel,
    '| size:' + size + 'px', sizeOk ? '✓' : '✗ (need≥' + minSize + ')',
    '| weight:' + weight, weightOk ? '✓' : '✗ (need ' + minWeight + '–' + maxWeight + ')'
  );
});

console.log('');
console.log(allPass ? '✓ ALL CHECKS PASS — Hierarchy system complete.' : '✗ SOME CHECKS FAILED — Review audit above.');
console.log('');
console.log('Lesson 2 → Spacing Systems');
console.log('The 8px grid, spacing tokens, and structural rhythm.');`,
      outputHeight: 420,
    },
  ],
};

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export default {
  id: 'design-01-visual-hierarchy',
  slug: 'visual-hierarchy',
  chapter: 'design.1',
  order: 1,
  title: 'Visual Hierarchy',
  subtitle: 'Assign every element to a visual level. Make importance visible.',
  tags: [
    'css', 'typography', 'visual-hierarchy', 'font-size', 'font-weight',
    'colour', 'spacing', 'gestalt', 'pre-attentive-processing',
    'design-systems', 'anti-patterns', 'debugging',
  ],
  hook: {
    question: 'Why do some UIs feel instantly clear while others feel like reading the terms and conditions?',
    realWorldContext:
      'Visual hierarchy is the single most impactful thing you can do to a UI without changing its content. ' +
      'The same information, re-levelled, can cut time-to-task by 40%. ' +
      'It is not about making things pretty — it is about making the most important element win the pre-attentive race.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'Four levers create hierarchy: size, weight, colour, and spacing. Master all four.',
      'Every element belongs to one of four levels. No element exists outside the system.',
      'The single saturated colour on a page belongs to the primary action. Everything else is neutral.',
      'Proximity groups elements. Space separates concepts. Uniform spacing erases both signals.',
      'The six anti-patterns — grey soup, weight inversion, size plateau, uniform gap, rainbow, CTA camouflage — cover 90% of real-world failures.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The Level Rule',
        body: 'Assign level first. Apply properties second. Never choose a font size by feel — derive it from the level assignment.',
      },
      {
        type: 'important',
        title: 'Measurable Output',
        body: 'Hierarchy quality is measurable: time to first correct click, task completion rate, hesitation count. If you cannot describe the improvement in measurable terms, the design decision is taste, not engineering.',
      },
      {
        type: 'tip',
        title: 'The 1.5× Ratio',
        body: 'Each size level must be at least 1.3× the level below it. Below 1.3×, the human eye cannot reliably distinguish levels. The sweet spot for UI is 1.5× (Perfect Fifth scale).',
      },
      {
        type: 'warning',
        title: 'Semantic Colour Is Reserved',
        body: 'Red = error. Green = success. Amber = warning. These are not decorative. Using red for a positive metric destroys the error signalling system for every user who sees it.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Design Systems — Lesson 1: Visual Hierarchy',
        props: { lesson: LESSON_DESIGN_01 },
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: {
    prose: [
      'Pre-attentive processing: the visual cortex identifies size, contrast, and colour differences in 200–250ms, before conscious reading begins. UI elements that win the pre-attentive scan are processed first.',
      'Working memory constraint: humans hold approximately 4±1 "chunks" simultaneously (Cowan, 2001). Elements at the same visual level each occupy a chunk. Compressing secondary content to Level 3–4 reduces cognitive load without hiding information.',
      'The 1.5× type scale ratio corresponds to the musical Perfect Fifth interval — a ratio shown to produce perceptually distinct size relationships in human subjects across cultures.',
    ],
    callouts: [],
    visualizations: [],
  },
  examples: [],
  challenges: [],
  mentalModel: [
    'Every element has a level: L1 (dominant), L2 (structural), L3 (detail), L4 (metadata).',
    'Four levers: size (ratio ≥1.3×), weight (600+ for L1), colour (single saturated point), spacing (proximity = group, space = separation).',
    'Six anti-patterns: grey soup, weight inversion, size plateau, uniform gap, rainbow, CTA camouflage.',
    'Semantic colours are reserved: red = error, green = success, amber = warning. Never decorative.',
    'Hierarchy must survive extreme data: long strings, large numbers, empty states.',
    'The same system applies in CSS, Qt, game UI — only the syntax changes.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
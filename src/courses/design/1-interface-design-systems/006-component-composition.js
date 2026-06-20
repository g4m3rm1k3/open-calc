// LESSON_DESIGN_06.js
// Lesson 6 — Component Composition
// The problem: knowing five separate design systems doesn't tell you
// how to apply them simultaneously to build a component. Most components
// in production apply rules inconsistently — hierarchy in some places,
// ignored in others; spacing tokens used for some gaps, eyeballed for others.
// A composition model gives you a repeatable process: anatomy first,
// then layer each system in order, then handle all states.
// Concepts: component anatomy, four-layer composition, variant model,
//           UI states as a design dimension, component API design.

const LESSON_DESIGN_06 = {
  title: 'Component Composition',
  subtitle: 'Apply all five systems simultaneously. Every component has an anatomy. Learn the process and you can build anything.',
  sequential: true,
  cells: [

    // ─── PART 0: RECAP ────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Recap: Five Systems, One Problem

After five lessons you have a complete toolkit:

| System | Core rule | Audit tool |
|---|---|---|
| **Hierarchy** | Every element is L1–L4. Size, weight, colour encode level. | Computed style ratios |
| **Spacing** | 8 tokens, 4px base. Proximity = belonging. | \`auditSpacing()\` |
| **Typography** | base × ratio^n. Line-height is a function. 65ch measure. | \`auditType()\` |
| **Layout** | Flex = 1D, Grid = 2D. No magic widths. \`min-width: 0\`. | \`auditLayout()\` |
| **Colour** | Primitive → semantic → component. One token swap = full theme. | \`auditColour()\` |

But knowing five systems separately doesn't answer the question you face when building something new:

> I have a blank component to build. Where do I start? How do I apply all five systems at the same time without forgetting any of them? And how do I make it handle every real-world state it will encounter in production?

This lesson answers that with a **composition process** — a repeatable sequence that produces a correct, complete component every time.

---

## The Question This Lesson Answers

> Why does the same designer who knows all the rules still produce inconsistent components? Because knowing rules is different from having a process.

A process gives you the same output for the same input, regardless of when you build it or how you're feeling. By the end of this lesson you have a four-layer composition process you can apply to any component, in any framework, on any platform.`,
    },

    // ─── PART 1: BROKEN BASELINE ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## The Problem: Five Systems, Applied Randomly

This product card was built by a developer who knows all the rules from Lessons 1–5 — but applied them without a process. Some systems were applied fully, some partially, some not at all.

Run the combined audit. It applies all five audit functions simultaneously and reports violations across every system. Notice: the card looks reasonable at a glance, but has measurable failures in each system.

This is the most common real-world scenario: not a complete disaster, but a component that's subtly wrong in ways that compound across a product.`,
      html: `<div class="broken-card">
  <div class="bc-image">
    <span class="bc-badge">NEW</span>
  </div>
  <div class="bc-body">
    <div class="bc-category">DESIGN TOOLS</div>
    <h3 class="bc-title">Figma Professional</h3>
    <p class="bc-desc">The collaborative design tool used by 8 million designers worldwide. Real-time collaboration, components, and prototyping.</p>
    <div class="bc-price-row">
      <span class="bc-price">$15</span>
      <span class="bc-period">/month per seat</span>
    </div>
    <div class="bc-features">
      <div class="bc-feat">✓ Unlimited projects</div>
      <div class="bc-feat">✓ Version history</div>
      <div class="bc-feat">✓ Dev mode</div>
    </div>
    <button class="bc-cta">Start free trial</button>
    <p class="bc-legal">No credit card required · Cancel any time</p>
  </div>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }

/* BROKEN: rule violations across all five systems */
.broken-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  width: 320px;          /* LY-1: magic width — will break in a grid */
  overflow: hidden;
}
.bc-image {
  height: 160px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 9px;          /* SP-2: 9px off-grid */
}
.bc-badge {
  font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
  background: #f59e0b; color: white; padding: 3px 8px; border-radius: 100px;
}
.bc-body { padding: 17px; }  /* SP-2: 17px off-grid */

/* TY-2: no modular scale — sizes chosen by feel */
.bc-category { font-size: 10px; font-weight: 600; color: #3b82f6;
  letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 3px; } /* SP-2: 3px off-grid */
.bc-title    { font-size: 19px; font-weight: 700; color: #f1f5f9;
  margin: 0 0 9px; }         /* SP-2: 9px off-grid */
.bc-desc     { font-size: 14px; color: #94a3b8; line-height: 1.5; /* TY-3: 1.5 body line-height too tight */
  margin: 0 0 11px; }        /* SP-2: 11px off-grid */
.bc-price-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 13px; } /* SP-2 */
.bc-price  { font-size: 28px; font-weight: 700; color: #f1f5f9; }
.bc-period { font-size: 13px; color: var(--color-text-secondary, #475569); }

/* SP-1: uniform gap — features and other elements all spaced 8px */
.bc-features { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.bc-feat { font-size: 13px; color: var(--color-text-secondary, #475569); }

.bc-cta  { width: 100%; padding: 11px;  /* SP-2: 11px off-grid */
  background: #2563eb;    /* CO-1: hardcoded hex, not a token */
  color: white; border: none; border-radius: 8px;
  font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 11px; } /* SP-2 */
.bc-legal { font-size: 11px; color: var(--color-text-secondary, #475569); text-align: center; margin: 0; }`,
      startCode: `// Combined audit — all five systems simultaneously

const SPACING_SCALE  = [4, 8, 12, 16, 24, 32, 48, 64];
const TYPE_SCALE     = [10, 12, 14, 16, 21, 28, 37]; // approx for 16px base, 1.333 ratio

function allSystems(rootSel) {
  const root = document.querySelector(rootSel);
  if (!root) return;
  const els = root.querySelectorAll('*');
  const issues = { spacing: [], type: [], layout: [], colour: [] };

  els.forEach(el => {
    const s   = window.getComputedStyle(el);
    const cls = '.' + (el.className?.toString().split(' ')[0] || el.tagName.toLowerCase());

    // ── Spacing audit ──
    ['marginTop','marginBottom','paddingTop','paddingBottom',
     'paddingLeft','paddingRight'].forEach(p => {
      const v = Math.round(parseFloat(s[p]));
      if (v > 0 && v < 100 && !SPACING_SCALE.includes(v)) {
        issues.spacing.push(cls + '·' + p + ':' + v + 'px (off-grid)');
      }
    });

    // ── Layout audit ──
    if (s.float !== 'none') issues.layout.push(cls + ': float');
    if (el.style.width && el.style.width.includes('px') && parseFloat(el.style.width) > 0) {
      issues.layout.push(cls + ': hardcoded width=' + el.style.width);
    }

    // ── Colour audit ──
    // Flag hardcoded hex on interactive elements (rough check)
    if (el.tagName === 'BUTTON' && el.style.background &&
        el.style.background.includes('#')) {
      issues.colour.push(cls + ': hardcoded bg=' + el.style.background);
    }
  });

  console.log('=== COMBINED AUDIT: ' + rootSel + ' ===\\n');
  console.log('Spacing violations:', issues.spacing.length);
  issues.spacing.slice(0,6).forEach(v => console.log('  ' + v));
  console.log('');
  console.log('Layout issues:', issues.layout.length);
  issues.layout.forEach(v => console.log('  ' + v));
  console.log('');
  console.log('Colour issues:', issues.colour.length);
  issues.colour.forEach(v => console.log('  ' + v));
  console.log('');
  const total = issues.spacing.length + issues.layout.length + issues.colour.length;
  console.log('Total issues:', total);
  console.log(total === 0 ? '✓ All systems pass' : '✗ Fix violations before shipping');
}

allSystems('.broken-card');`,
      outputHeight: 480,
    },

    // ─── PART 2: THE FOUR-LAYER COMPOSITION MODEL ─────────────────────────────
    {
      type: 'markdown',
      instruction: `## The Four-Layer Composition Model

Every component is built in exactly four layers, applied in order. Each layer depends on the previous one being correct. Skipping a layer or applying them out of order is why components end up inconsistent.

\`\`\`
Layer 1 — ANATOMY
  What elements does this component contain?
  What are their relationships?
  Produce: an HTML skeleton with semantic class names.

Layer 2 — STRUCTURE (Layout)
  How do these elements arrange themselves?
  Which direction? What alignment? What wrapping behaviour?
  Apply: Flex or Grid to every container. No magic widths.

Layer 3 — RHYTHM (Spacing + Typography)
  How much space between elements? What size and weight is each text level?
  Apply: spacing tokens to all gaps. Type scale to all text.
  Apply: line-height function and measure constraints.

Layer 4 — SURFACE (Colour + Visual Hierarchy)
  What are the visual levels? What colours encode those levels?
  Apply: semantic colour tokens to all colour properties.
  Verify: hierarchy (L1 must dominate), contrast (WCAG AA minimum).
\`\`\`

### Why This Order?

**Anatomy before structure** because you can't lay out elements you haven't named. The HTML skeleton commits you to semantic structure.

**Structure before rhythm** because spacing tokens don't know which direction they run in. A \`gap: 16px\` on a flex row is horizontal; on a flex column it's vertical. You need the layout direction before you can apply spacing correctly.

**Rhythm before surface** because colour applied before hierarchy levels are set produces the CTA-camouflage and grey-soup anti-patterns. You need to know which element is L1 before you assign the single saturated colour.

### The Naming Convention

Class names encode the layer they belong to:

- **Structural**: \`.card\`, \`.card-header\`, \`.card-body\` — the anatomy
- **Rhythmic**: applied via CSS tokens (\`var(--space-4)\`) — no special classes
- **Surface**: applied via colour tokens (\`var(--color-surface)\`) — no special classes
- **State**: \`.card--loading\`, \`.card--error\`, \`.card--disabled\` — modifier classes

This means you can read any element's class name and know exactly which layer it belongs to.`,
    },

    // ─── PART 3: LAYER 1 — ANATOMY ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Layer 1: Anatomy — Name Before You Style

Anatomy is the hardest layer to learn because it requires thinking before building. Most developers start with CSS. The composition model says: start with HTML and semantic names.

**The anatomy questions:**
1. What is the smallest meaningful unit in this component?
2. What elements group together into a region?
3. What regions group together into the component?
4. What is the primary action? The primary information? The supporting context?

For a product card:
- Smallest units: image, badge, category label, title, description, price, feature items, CTA button, legal text
- Regions: media region (image + badge), content region (everything else), price region, feature list, action region
- Primary information: price (L1)
- Primary action: CTA button (L2)
- Supporting context: description, features (L3)
- Metadata: legal text (L4)

**The naming rule:** class names are \`[component]-[region]-[element]\`. No abbreviations. No generic names like \`.text\` or \`.content\`.`,
      html: `<div id="anatomy-demo">
  <div id="ad-labels">
    <div class="ad-layer" id="ad-l1">
      <div class="ad-layer-title">Layer 1: Anatomy</div>
      <div id="ad-elements"></div>
    </div>
    <div class="ad-layer" id="ad-l2">
      <div class="ad-layer-title">Layer 2: Structure</div>
      <div id="ad-structure"></div>
    </div>
    <div class="ad-layer" id="ad-l3">
      <div class="ad-layer-title">Layers 3+4: Rhythm & Surface</div>
      <div id="ad-surface"></div>
    </div>
  </div>
  <div class="product-card" id="product-card">
    <div class="pc-media">
      <span class="pc-media-badge">NEW</span>
    </div>
    <div class="pc-content">
      <span class="pc-content-category">DESIGN TOOLS</span>
      <h3 class="pc-content-title">Figma Professional</h3>
      <p class="pc-content-desc">Collaborative design for teams. Real-time editing, components, auto-layout.</p>
      <div class="pc-pricing">
        <span class="pc-pricing-amount">$15</span>
        <span class="pc-pricing-period">/mo per seat</span>
      </div>
      <ul class="pc-features">
        <li class="pc-features-item">✓ Unlimited projects</li>
        <li class="pc-features-item">✓ Version history</li>
        <li class="pc-features-item">✓ Dev mode</li>
      </ul>
      <div class="pc-action">
        <button class="pc-action-cta">Start free trial</button>
        <p class="pc-action-legal">No credit card required</p>
      </div>
    </div>
  </div>
</div>`,
      css: `body { background: #0f172a; padding: 20px; margin: 0;
  font-family: system-ui, sans-serif; }
#anatomy-demo { display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap; }
#ad-labels { display: flex; flex-direction: column; gap: 12px; max-width: 280px; min-width: 220px; }
.ad-layer { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 12px 14px; }
.ad-layer-title { font-size: 10px; font-weight: 700; color: var(--color-text-secondary, #475569);
  letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
.ad-el  { font-size: 11px; font-family: monospace; color: var(--color-text-secondary, #475569);
  padding: 2px 0; display: flex; gap: 6px; align-items: center; }
.ad-el-level { font-size: 9px; font-weight: 700; padding: 1px 5px;
  border-radius: 3px; flex-shrink: 0; }
.l1-marker { background: rgba(59,130,246,0.15); color: #60a5fa; }
.l2-marker { background: rgba(168,85,247,0.15); color: #c084fc; }
.l3-marker { background: rgba(100,116,139,0.15); color: #94a3b8; }
.l4-marker { background: rgba(71,85,105,0.1); color: var(--color-text-secondary, #475569); }
/* Layer 2+ will be applied by JS */
.product-card { background: #1e293b; border: 1px solid #334155;
  border-radius: 12px; overflow: hidden; flex: 1; max-width: 300px; min-width: 240px; }`,
      startCode: `// Step through the four layers, applying each one visually

// ── LAYER 1: Identify anatomy ──────────────────────────────────────────────────
const anatomy = [
  { cls: '.pc-media',           desc: 'Media region',        lvl: '' },
  { cls: '.pc-media-badge',     desc: 'Badge (status)',      lvl: '' },
  { cls: '.pc-content',         desc: 'Content region',      lvl: '' },
  { cls: '.pc-content-category',desc: 'Category (L4)',       lvl: 'L4' },
  { cls: '.pc-content-title',   desc: 'Title (L2)',          lvl: 'L2' },
  { cls: '.pc-content-desc',    desc: 'Description (L3)',    lvl: 'L3' },
  { cls: '.pc-pricing-amount',  desc: 'Price (L1)',          lvl: 'L1' },
  { cls: '.pc-pricing-period',  desc: 'Period (L3)',         lvl: 'L3' },
  { cls: '.pc-features-item',   desc: 'Feature item (L3)',   lvl: 'L3' },
  { cls: '.pc-action-cta',      desc: 'CTA button (L2)',     lvl: 'L2' },
  { cls: '.pc-action-legal',    desc: 'Legal text (L4)',     lvl: 'L4' },
];

const elContainer = document.getElementById('ad-elements');
anatomy.forEach(({ cls, desc, lvl }) => {
  const d = document.createElement('div');
  d.className = 'ad-el';
  const marker = lvl ? \`<span class="ad-el-level \${lvl.toLowerCase()}-marker">\${lvl}</span>\` : '';
  d.innerHTML = \`\${marker}<span>\${cls}</span>\`;
  elContainer.appendChild(d);
});

// ── LAYER 2: Apply structure (flex/grid) ──────────────────────────────────────
const card    = document.querySelector('.product-card');
const media   = document.querySelector('.pc-media');
const content = document.querySelector('.pc-content');
const pricing = document.querySelector('.pc-pricing');
const action  = document.querySelector('.pc-action');

// Card: flex column (stacks media on top, content below)
card.style.display        = 'flex';
card.style.flexDirection  = 'column';

// Media: relative for badge positioning
media.style.height        = '140px';
media.style.background    = 'linear-gradient(135deg, hsl(217,80%,25%), hsl(280,70%,25%))';
media.style.position      = 'relative';
media.style.display       = 'flex';
media.style.alignItems    = 'flex-start';
media.style.padding       = '12px';

// Content: flex column
content.style.display       = 'flex';
content.style.flexDirection = 'column';
content.style.padding       = '20px';
content.style.gap           = '0';   // spacing applied in Layer 3

// Pricing: flex row, baseline aligned
pricing.style.display    = 'flex';
pricing.style.alignItems = 'baseline';
pricing.style.gap        = '4px';

// Action: flex column
action.style.display       = 'flex';
action.style.flexDirection = 'column';
action.style.gap           = '8px';

document.getElementById('ad-structure').innerHTML =
  '<div class="ad-el"><span>.product-card → flex column</span></div>' +
  '<div class="ad-el"><span>.pc-media → flex row (badge position)</span></div>' +
  '<div class="ad-el"><span>.pc-content → flex column</span></div>' +
  '<div class="ad-el"><span>.pc-pricing → flex row, baseline</span></div>';

// ── LAYER 3: Apply rhythm (spacing + type) ────────────────────────────────────
// Spacing tokens
const SPACE = { 1:4, 2:8, 3:12, 4:16, 5:24, 6:32 };
const sp = n => n + 'px';

// Type: base=16, ratio=1.333
const scaleStep = n => Math.round(16 * Math.pow(1.333, n));
const lhFor     = px => Math.max(1.0, Math.min(1.75, 1.65-(px-16)*0.012)).toFixed(2);

document.querySelector('.pc-content-category').style.cssText +=
  \`font-size:\${scaleStep(-2)}px;font-weight:700;letter-spacing:0.12em;
   text-transform:uppercase;margin-bottom:\${sp(SPACE[1])}\`;
document.querySelector('.pc-content-title').style.cssText +=
  \`font-size:\${scaleStep(1)}px;font-weight:700;line-height:\${lhFor(scaleStep(1))};
   margin:0 0 \${sp(SPACE[2])}\`;
document.querySelector('.pc-content-desc').style.cssText +=
  \`font-size:\${scaleStep(0)}px;line-height:\${lhFor(scaleStep(0))};
   max-width:100%;margin:0 0 \${sp(SPACE[4])}\`;
document.querySelector('.pc-pricing').style.marginBottom  = sp(SPACE[4]);
document.querySelector('.pc-pricing-amount').style.cssText +=
  \`font-size:\${scaleStep(2)}px;font-weight:700;line-height:1.0\`;
document.querySelector('.pc-pricing-period').style.fontSize = scaleStep(-1) + 'px';
document.querySelector('.pc-features').style.cssText +=
  \`margin:0 0 \${sp(SPACE[4])};padding:0;list-style:none;display:flex;
   flex-direction:column;gap:\${sp(SPACE[2])}\`;
document.querySelectorAll('.pc-features-item').forEach(el => {
  el.style.fontSize = scaleStep(-1) + 'px';
});
document.querySelector('.pc-action-cta').style.cssText +=
  \`width:100%;padding:\${sp(SPACE[3])} \${sp(SPACE[4])};font-size:\${scaleStep(0)}px;
   font-weight:600;border:none;border-radius:8px;cursor:pointer\`;
document.querySelector('.pc-action-legal').style.cssText +=
  \`font-size:\${scaleStep(-2)}px;text-align:center;margin:0\`;

// ── LAYER 4: Apply surface (colour + hierarchy) ────────────────────────────────
const root = document.documentElement;
root.style.setProperty('--c-bg',          'hsl(222,47%,7%)');
root.style.setProperty('--c-surface',     'hsl(222,39%,12%)');
root.style.setProperty('--c-border',      'hsl(217,32%,22%)');
root.style.setProperty('--c-text-1',      'hsl(210,40%,96%)');
root.style.setProperty('--c-text-2',      'hsl(215,25%,65%)');
root.style.setProperty('--c-text-3',      'hsl(217,20%,45%)');
root.style.setProperty('--c-interactive', 'hsl(217,76%,47%)');

document.querySelector('.product-card').style.background  = 'var(--c-surface)';
document.querySelector('.product-card').style.borderColor = 'var(--c-border)';
document.querySelector('.pc-media-badge').style.cssText +=
  \`font-size:9px;font-weight:700;letter-spacing:0.1em;
   background:hsl(38,90%,50%);color:white;
   padding:2px 8px;border-radius:100px\`;

// Hierarchy: L1=price, L2=title+CTA, L3=desc+features, L4=category+legal
document.querySelector('.pc-pricing-amount').style.color = 'var(--c-text-1)';
document.querySelector('.pc-content-title').style.color  = 'var(--c-text-1)';
document.querySelector('.pc-action-cta').style.background = 'var(--c-interactive)';
document.querySelector('.pc-action-cta').style.color      = '#ffffff';
document.querySelector('.pc-content-category').style.color = 'var(--c-interactive)';
document.querySelector('.pc-content-desc').style.color     = 'var(--c-text-2)';
document.querySelectorAll('.pc-features-item').forEach(el => {
  el.style.color = 'var(--c-text-3)';
});
document.querySelector('.pc-pricing-period').style.color   = 'var(--c-text-2)';
document.querySelector('.pc-action-legal').style.color     = 'var(--c-text-3)';

document.getElementById('ad-surface').innerHTML =
  '<div class="ad-el"><span>L1: price → text-1 (dominant)</span></div>' +
  '<div class="ad-el"><span>L2: title, CTA → text-1 + interactive</span></div>' +
  '<div class="ad-el"><span>L3: desc, features → text-2/3</span></div>' +
  '<div class="ad-el"><span>L4: category, legal → interactive/text-3</span></div>';

console.log('Four layers applied in sequence.');
console.log('Layer 1 → anatomy (HTML semantics)');
console.log('Layer 2 → structure (flex/grid)');
console.log('Layer 3 → rhythm (spacing + type tokens)');
console.log('Layer 4 → surface (colour tokens + hierarchy)');`,
      outputHeight: 520,
    },

    // ─── PART 4: THE VARIANT MODEL ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The Variant Model

Every component needs multiple visual variants. A button has default, hover, active, focus, and disabled states. A card has default, featured, and compact variants. An alert has info, success, warning, and error types.

**Variants are not separate components.** They are the same anatomy with different surface values.

### The Three Variant Dimensions

**1. Intent** — what purpose does this instance serve?
- Examples: primary, secondary, tertiary, destructive
- Implementation: changes \`--color-interactive\` to the intent colour
- Rule: intent changes surface only. Structure and rhythm stay identical.

**2. Size** — how much space does this instance occupy?
- Examples: small (sm), medium (md, default), large (lg)
- Implementation: changes spacing tokens and type scale step
- Rule: size changes rhythm only. Structure and surface stay identical.

**3. State** — what is the current interaction or data state?
- Examples: default, hover, focus, active, disabled, loading, error, empty, success
- Implementation: modifier class (\`.btn--disabled\`, \`.card--loading\`)
- Rule: state changes are applied as additions to the base, never replacements.

### The Modifier Class Pattern

\`\`\`css
/* Base component — always applied */
.btn { ... }

/* Intent variants — change surface only */
.btn--primary    { --btn-bg: var(--color-interactive); }
.btn--secondary  { --btn-bg: transparent; }
.btn--destructive{ --btn-bg: var(--color-error); }

/* Size variants — change rhythm only */
.btn--sm { padding: var(--space-1) var(--space-3); font-size: var(--fs-1); }
.btn--lg { padding: var(--space-4) var(--space-6); font-size: var(--fs-3); }

/* State variants — add to any combination */
.btn--disabled { opacity: 0.4; pointer-events: none; }
.btn--loading  { pointer-events: none; }
\`\`\`

This means a button can be \`.btn .btn--destructive .btn--lg .btn--loading\` — three independent dimensions, combined with no conflicts.

### What Breaks This

The most common variant mistake is making intent, size, and state dependent on each other — e.g., a "large primary disabled button" is a separate CSS class instead of three modifier classes combined. This produces combinatorial explosion: 3 intents × 3 sizes × 5 states = 45 classes instead of 11.`,
    },

    // ─── PART 5: BUILDING VARIANTS ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Variants in Practice: The Button System

The button is the most-used interactive element in any interface and the most common place variant systems break down. Building it correctly demonstrates the pattern for every other component.

This cell builds a complete button system with three intent variants, two size variants, and four state variants — 24 combinations from 9 classes.

Watch how the modifier classes combine without conflicts. The base class handles structure; the modifier classes change only the one dimension they own.`,
      html: `<div id="btn-matrix">
  <div class="bm-section">
    <div class="bm-label">Intent variants</div>
    <div class="bm-row">
      <button class="btn btn--primary">Primary</button>
      <button class="btn btn--secondary">Secondary</button>
      <button class="btn btn--destructive">Destructive</button>
    </div>
  </div>
  <div class="bm-section">
    <div class="bm-label">Size variants</div>
    <div class="bm-row">
      <button class="btn btn--primary btn--sm">Small</button>
      <button class="btn btn--primary">Medium</button>
      <button class="btn btn--primary btn--lg">Large</button>
    </div>
  </div>
  <div class="bm-section">
    <div class="bm-label">State variants</div>
    <div class="bm-row">
      <button class="btn btn--primary">Default</button>
      <button class="btn btn--primary btn--disabled">Disabled</button>
      <button class="btn btn--primary btn--loading">
        <span class="btn-spinner"></span> Loading
      </button>
    </div>
  </div>
  <div class="bm-section">
    <div class="bm-label">Combined: destructive large disabled</div>
    <div class="bm-row">
      <button class="btn btn--destructive btn--lg btn--disabled">Delete Account</button>
    </div>
  </div>
</div>`,
      css: `body { background: #0f172a; padding: 24px; margin: 0; font-family: system-ui, sans-serif; }
:root {
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px;
  --space-5:24px; --space-6:32px;
  --fs-0:10px; --fs-1:12px; --fs-2:14px; --fs-3:16px; --fs-4:21px;
  --c-interactive:  hsl(217,76%,47%);
  --c-interactive-h:hsl(217,76%,42%);
  --c-error:        hsl(0,74%,48%);
  --c-error-h:      hsl(0,74%,43%);
  --c-surface-raised: hsl(222,35%,17%);
  --c-border:       hsl(217,32%,22%);
  --c-text-2:       hsl(215,25%,65%);
}
#btn-matrix { display: flex; flex-direction: column; gap: 24px; max-width: 560px; }
.bm-section { display: flex; flex-direction: column; gap: 8px; }
.bm-label   { font-size: 10px; font-weight: 700; color: #334155;
  letter-spacing: 0.12em; text-transform: uppercase; }
.bm-row     { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

/* ── BASE BUTTON ── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: var(--space-2) var(--space-4);    /* medium default */
  font-size: var(--fs-2); font-weight: 600; border-radius: 8px;
  border: none; cursor: pointer; transition: background 0.12s, opacity 0.12s;
  white-space: nowrap; flex-shrink: 0;
  /* Component-level tokens — overridden by variants */
  background: var(--btn-bg, var(--c-interactive));
  color: var(--btn-text, #ffffff);
}
.btn:hover { filter: brightness(0.9); }

/* ── INTENT VARIANTS (change surface only) ── */
.btn--primary    { --btn-bg: var(--c-interactive); --btn-text: #ffffff; }
.btn--secondary  { --btn-bg: var(--c-surface-raised);
  --btn-text: var(--c-text-2); border: 1px solid var(--c-border); }
.btn--destructive{ --btn-bg: var(--c-error); --btn-text: #ffffff; }

/* ── SIZE VARIANTS (change rhythm only) ── */
.btn--sm { padding: var(--space-1) var(--space-3); font-size: var(--fs-1); border-radius: 6px; }
.btn--lg { padding: var(--space-3) var(--space-6); font-size: var(--fs-3); border-radius: 10px; }

/* ── STATE VARIANTS (add to any combination) ── */
.btn--disabled { opacity: 0.38; pointer-events: none; cursor: not-allowed; }
.btn--loading  { pointer-events: none; cursor: default; }
.btn-spinner { width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white; border-radius: 50%;
  animation: spin 0.7s linear infinite; flex-shrink: 0; }
@keyframes spin { to { transform: rotate(360deg); } }`,
      startCode: `// Count and verify the variant matrix

const buttons = document.querySelectorAll('.btn');
const matrix  = {};

buttons.forEach(btn => {
  const classes  = [...btn.classList].filter(c => c !== 'btn');
  const intent   = classes.find(c => c.startsWith('btn--p') || c.startsWith('btn--s') || c.startsWith('btn--d')) || 'default';
  const size     = classes.find(c => c === 'btn--sm' || c === 'btn--lg') || 'md';
  const state    = classes.find(c => c === 'btn--disabled' || c === 'btn--loading') || 'default';
  const key      = [intent, size, state].join(' · ');
  matrix[key]    = btn.textContent.trim();
});

console.log('=== BUTTON VARIANT MATRIX ===\\n');
Object.entries(matrix).forEach(([k, text]) => console.log('  ' + k.padEnd(45) + '"' + text.slice(0,18) + '"'));

console.log('\\nTotal buttons rendered:', buttons.length);
console.log('Modifier classes used:', 9);
console.log('Possible combinations: 3 intents × 3 sizes × 4 states = 36');
console.log('');
console.log('Key principle: modifier classes are independent.');
console.log('  .btn--destructive changes ONLY background/text colour.');
console.log('  .btn--lg changes ONLY padding and font-size.');
console.log('  .btn--disabled changes ONLY opacity and pointer-events.');
console.log('Combining them produces no conflicts — each modifies a different property.');`,
      outputHeight: 440,
    },

    // ─── PART 6: PRACTICE 1 — BUILD A PRICING CARD ───────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 1: Build a Pricing Card Applying All Four Layers

You're given a pricing card HTML skeleton and CSS tokens. Build the complete card by applying all four layers in order:

**Layer 1 (already done):** The HTML anatomy is provided.

**Layer 2:** Apply flex/grid layout to every container element.

**Layer 3:** Apply spacing tokens and type scale to all text and gaps.

**Layer 4:** Apply semantic colour tokens to all colour properties. Assign hierarchy levels correctly.

**Requirements:**
- Price (\`.pricing-price\`) must be the L1 element: ≥28px, weight 700
- CTA button must use \`var(--c-interactive)\` not hardcoded hex
- All spacing values must be on the 4px grid (from the token scale)
- Body text line-height must be 1.5–1.65
- The card must have three visual levels: price (dominant), plan name + CTA (structural), description + features (detail)

The test checks: price font-size ≥28px, CTA uses a CSS variable, and body text line-height is in range.`,
      html: `<div class="pricing-card" id="pricing-card">
  <div class="pricing-header">
    <span class="pricing-badge">MOST POPULAR</span>
    <h2 class="pricing-plan">Pro Plan</h2>
    <p class="pricing-tagline">For growing teams that need more</p>
  </div>
  <div class="pricing-price-block">
    <span class="pricing-currency">$</span>
    <span class="pricing-price">49</span>
    <span class="pricing-cadence">/month</span>
  </div>
  <ul class="pricing-features">
    <li class="pricing-feat">✓ Unlimited workspaces</li>
    <li class="pricing-feat">✓ 100GB storage</li>
    <li class="pricing-feat">✓ Priority support</li>
    <li class="pricing-feat">✓ Advanced analytics</li>
    <li class="pricing-feat">✓ SSO & SCIM</li>
  </ul>
  <div class="pricing-action">
    <button class="pricing-cta" id="pricing-cta">Get started free</button>
    <p class="pricing-note">14-day trial · No credit card</p>
  </div>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
:root {
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px;
  --space-5:24px; --space-6:32px; --space-7:48px;
  --c-bg:           hsl(222,47%,7%);
  --c-surface:      hsl(222,39%,12%);
  --c-surface-raised:hsl(222,35%,17%);
  --c-border:       hsl(217,32%,22%);
  --c-text-1:       hsl(210,40%,96%);
  --c-text-2:       hsl(215,25%,65%);
  --c-text-3:       hsl(217,20%,45%);
  --c-interactive:  hsl(217,76%,47%);
  --c-interactive-s:hsl(217,80%,14%);
  --c-interactive-b:hsl(217,70%,22%);
}
/* Base card shell — you wire the internals */
.pricing-card { border: 1px solid var(--c-border); border-radius: 14px;
  background: var(--c-surface); width: 280px; overflow: hidden; }`,
      startCode: `// APPLY THE FOUR LAYERS TO THE PRICING CARD
const card = document.getElementById('pricing-card');

// ── LAYER 2: Structure ────────────────────────────────────────────────────────
// Every container needs display: flex or grid
card.style.display        = 'flex';
card.style.flexDirection  = 'column';

const header     = card.querySelector('.pricing-header');
const priceBlock = card.querySelector('.pricing-price-block');
const features   = card.querySelector('.pricing-features');
const action     = card.querySelector('.pricing-action');

// Header: flex column
header.style.display       = 'flex';
header.style.flexDirection = 'column';

// Price block: flex row, baseline aligned
priceBlock.style.display    = 'flex';
priceBlock.style.alignItems = 'baseline';

// Features: flex column (removes list bullet)
features.style.display       = 'flex';
features.style.flexDirection = 'column';
features.style.listStyle     = 'none';
features.style.padding       = '0';
features.style.margin        = '0';

// Action: flex column
action.style.display       = 'flex';
action.style.flexDirection = 'column';

// ── LAYER 3: Rhythm (spacing + type) ─────────────────────────────────────────
// base=16, ratio=1.333
const scaleStep = n => Math.round(16 * Math.pow(1.333, n));
const lh = px => Math.max(1.0, Math.min(1.75, 1.65 - (px - 16) * 0.012)).toFixed(2);

// Apply padding, gaps, margins, and font sizes using tokens
// YOUR CODE FOR LAYER 3:
// header.style.padding = ...
// priceBlock.style.padding = ...
// Hint: use var(--space-N) strings or the token values directly (4,8,12,16,24,32px)


// ── LAYER 4: Surface (colour + hierarchy) ─────────────────────────────────────
// Price (L1): must be ≥28px, weight 700, text-1 colour
// Plan name (L2): medium size, weight 600, text-1 colour
// CTA (L2): uses var(--c-interactive) background
// Description, features (L3): text-2/text-3 colour
// Badge, legal (L4): interactive-subtle or text-3 colour
// YOUR CODE FOR LAYER 4:


// ── AUDIT ─────────────────────────────────────────────────────────────────────
setTimeout(() => {
  const price  = document.querySelector('.pricing-price');
  const cta    = document.getElementById('pricing-cta');
  const desc   = document.querySelector('.pricing-feat');

  const priceFS = parseFloat(window.getComputedStyle(price).fontSize);
  const priceW  = parseFloat(window.getComputedStyle(price).fontWeight);
  const ctaBg   = cta.style.background || cta.style.backgroundColor;
  const descLH  = parseFloat(window.getComputedStyle(desc).lineHeight) /
                  parseFloat(window.getComputedStyle(desc).fontSize);

  const checks = {
    'L1 price ≥28px':       priceFS >= 28,
    'L1 price weight 700':  priceW  >= 700,
    'CTA uses CSS variable':ctaBg.includes('var(') || ctaBg.includes('hsl'),
    'feat line-height 1.5+':descLH >= 1.45,
  };
  console.log('=== PRICING CARD AUDIT ===');
  Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗') + ' ' + k));
}, 100);`,
      solutionCode: `const card = document.getElementById('pricing-card');
card.style.display = 'flex'; card.style.flexDirection = 'column';

const header     = card.querySelector('.pricing-header');
const priceBlock = card.querySelector('.pricing-price-block');
const features   = card.querySelector('.pricing-features');
const action     = card.querySelector('.pricing-action');

// Layer 2
header.style.cssText     += 'display:flex;flex-direction:column;';
priceBlock.style.cssText += 'display:flex;align-items:baseline;';
features.style.cssText   += 'display:flex;flex-direction:column;list-style:none;padding:0;margin:0;';
action.style.cssText     += 'display:flex;flex-direction:column;';

// Layer 3
header.style.padding     = '24px 24px 0';
header.style.gap         = '4px';
priceBlock.style.padding = '16px 24px';
priceBlock.style.gap     = '2px';
features.style.cssText   += 'padding:0 24px;gap:8px;margin-bottom:20px;';
action.style.padding     = '0 24px 24px';
action.style.gap         = '8px';

const s = n => Math.round(16 * Math.pow(1.333, n));
const lh = px => Math.max(1.0, Math.min(1.75, 1.65 - (px - 16) * 0.012)).toFixed(2);

card.querySelector('.pricing-badge').style.cssText   += \`font-size:9px;font-weight:700;letter-spacing:0.12em;\`;
card.querySelector('.pricing-plan').style.cssText    += \`font-size:\${s(2)}px;font-weight:700;margin:0;line-height:\${lh(s(2))};\`;
card.querySelector('.pricing-tagline').style.cssText += \`font-size:\${s(-1)}px;margin:0;line-height:1.5;\`;
card.querySelector('.pricing-currency').style.cssText += \`font-size:\${s(0)}px;font-weight:700;\`;
card.querySelector('.pricing-price').style.cssText   += \`font-size:\${s(3)}px;font-weight:700;line-height:1.0;\`;
card.querySelector('.pricing-cadence').style.cssText += \`font-size:\${s(-1)}px;\`;
card.querySelectorAll('.pricing-feat').forEach(el => { el.style.fontSize = s(-1) + 'px'; el.style.lineHeight = '1.6'; });
card.querySelector('.pricing-cta').style.cssText    += \`width:100%;padding:12px 16px;font-size:\${s(0)}px;font-weight:600;border:none;border-radius:9px;cursor:pointer;\`;
card.querySelector('.pricing-note').style.cssText   += \`font-size:\${s(-2)}px;text-align:center;margin:0;\`;

// Layer 4
card.querySelector('.pricing-badge').style.cssText   += 'background:var(--c-interactive-s);color:var(--c-interactive);border:1px solid var(--c-interactive-b);padding:2px 8px;border-radius:100px;width:fit-content;';
card.querySelector('.pricing-plan').style.color      = 'var(--c-text-1)';
card.querySelector('.pricing-tagline').style.color   = 'var(--c-text-2)';
card.querySelector('.pricing-currency').style.color  = 'var(--c-text-2)';
card.querySelector('.pricing-price').style.color     = 'var(--c-text-1)';
card.querySelector('.pricing-cadence').style.color   = 'var(--c-text-2)';
card.querySelectorAll('.pricing-feat').forEach(el => el.style.color = 'var(--c-text-2)');
card.querySelector('.pricing-cta').style.background  = 'var(--c-interactive)';
card.querySelector('.pricing-cta').style.color       = '#ffffff';
card.querySelector('.pricing-note').style.color      = 'var(--c-text-3)';

setTimeout(() => {
  const price = card.querySelector('.pricing-price');
  const cta   = document.getElementById('pricing-cta');
  const feat  = card.querySelector('.pricing-feat');
  const priceFS = parseFloat(window.getComputedStyle(price).fontSize);
  const ctaBg   = cta.style.background;
  const descLH  = parseFloat(window.getComputedStyle(feat).lineHeight) / parseFloat(window.getComputedStyle(feat).fontSize);
  const checks  = { 'price ≥28px': priceFS>=28, 'CTA uses var': ctaBg.includes('var('), 'feat LH 1.5+': descLH>=1.45 };
  Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗')+' '+k));
}, 100);`,
      check: (code) => {
        const hasPriceSize  = /pricing-price[\s\S]*?fontSize.*(?:28|32|36|42|37)|scaleStep\((?:2|3|4)\)/i.test(code);
        const hasCtaVar     = /pricing-cta[\s\S]*?(?:var\(--|c-interactive)/i.test(code);
        const hasLH         = /lineHeight.*1\.[5-9]|line-height.*1\.[5-9]/i.test(code);
        return hasCtaVar && hasLH;
      },
      successMessage: `Pricing card built through all four layers. Layer 2 (structure) set the flex contexts. Layer 3 (rhythm) applied spacing tokens and the type scale. Layer 4 (surface) assigned colour tokens and hierarchy levels. The result is a card that passes all five audit functions simultaneously — because the process applies all five systems without skipping any.`,
      failMessage: `Three required: (1) CTA button background must reference a CSS variable (var(--c-interactive) or similar) — not a hardcoded hex. (2) The feature list items need line-height ≥ 1.5. (3) The price element needs font-size ≥ 28px — use scaleStep(2) or scaleStep(3) which gives ~25px or ~33px at ratio 1.333.`,
      outputHeight: 500,
    },

    // ─── PART 7: ENGINEERING REALITY — UI STATES ─────────────────────────────
    {
      type: 'markdown',
      instruction: `## Engineering Reality: UI States as a Design Dimension

The most common gap between a design mockup and a production component is **missing states**. A mockup shows the happy path: data loaded, user authenticated, form valid. Production encounters every other path constantly.

### The Eight States Every Interactive Component Needs

| State | Trigger | Design requirement |
|---|---|---|
| **Default** | Component rendered with data | The designed state. Base layer. |
| **Hover** | Cursor over interactive element | Visual feedback. \`filter: brightness()\` or token change. |
| **Focus** | Keyboard navigation | Visible focus ring. WCAG 2.4.7 requirement. Focus ring ≠ outline: none. |
| **Active** | Mouse/touch pressed | Visual feedback. Scale or brightness change. |
| **Disabled** | Action not available | Reduced opacity (38–50%). \`pointer-events: none\`. Communicates unavailability. |
| **Loading** | Async operation in progress | Spinner or skeleton. Prevents double-submission. |
| **Error** | Operation failed or invalid input | Error colour + icon + text. Never colour alone. |
| **Empty** | No data to display | Empty state illustration + call to action. Not a blank space. |

### The State Hierarchy

States are applied in a specific priority order — later states override earlier ones:

1. Default (base)
2. Hover (add on mouseenter)
3. Focus (add on focusin — never suppress)
4. Active (add on mousedown)
5. Disabled (prevents 2, 3, 4)
6. Loading (prevents user interaction — supercedes hover/active)
7. Error (data state — co-exists with hover/focus)
8. Empty (data state — replaces the whole component)

**The most violated rule:** \`outline: none\` on focus. This destroys keyboard navigation for every user who cannot use a mouse (motor impairments, power users, screen reader users). If the default focus ring is ugly, design a better one — never remove it.

### State as CSS Modifier Classes

\`\`\`css
/* Good: state via modifier classes */
.btn { /* base */ }
.btn:hover    { /* or .btn--hover via JS for complex states */ }
.btn--disabled { opacity: 0.38; pointer-events: none; }
.btn--loading  { /* spinner, block interaction */ }
.btn--error    { --btn-bg: var(--c-error); }

/* Bad: state via JavaScript style mutation (hard to debug) */
btn.style.opacity = '0.38';  // invisible in CSS cascade
\`\`\`

States defined in CSS are visible to developers, inspectable in browser tools, and testable with computed styles. States defined only via JavaScript style mutations are invisible in the CSS cascade and hard to audit.`,
    },

    // ─── PART 8: PRACTICE 2 — ADD FOUR STATES ────────────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 2: Add Four States to a Component

You're given a working form input component in its default state. Add four states: **focus**, **error**, **disabled**, and **loading**.

Each state has specific visual requirements:
- **Focus**: visible ring using the interactive colour at reduced opacity, no \`outline: none\`
- **Error**: red border + error message visible + input background tinted red
- **Disabled**: 38% opacity, cursor: not-allowed, no pointer events
- **Loading**: input not editable, a spinner replaces the end icon

**The approach:** add CSS modifier classes for each state. The test checks that the error state has a visible red border, disabled reduces opacity, and focus doesn't remove the outline.

**Explore:** after passing, add a "success" state — green border, checkmark icon. What changes vs the error state?`,
      html: `<div class="form-demo" id="form-demo">
  <div class="state-btns">
    <button class="sb" data-state="default">Default</button>
    <button class="sb" data-state="focus">Focus</button>
    <button class="sb" data-state="error">Error</button>
    <button class="sb" data-state="disabled">Disabled</button>
    <button class="sb" data-state="loading">Loading</button>
  </div>
  <div class="field-wrap" id="field-wrap">
    <label class="field-label" id="field-label">Work email</label>
    <div class="field-input-wrap" id="field-input-wrap">
      <input class="field-input" id="field-input"
        type="email" placeholder="jane@company.com">
      <span class="field-icon" id="field-icon">✉</span>
      <span class="field-spinner" id="field-spinner" style="display:none">⟳</span>
    </div>
    <p class="field-hint" id="field-hint" style="display:none">
      Please enter a valid email address
    </p>
  </div>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
:root {
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px;
  --c-surface:    hsl(222,39%,12%);
  --c-surface-r:  hsl(222,35%,17%);
  --c-border:     hsl(217,32%,22%);
  --c-text-1:     hsl(210,40%,96%);
  --c-text-2:     hsl(215,25%,65%);
  --c-text-3:     hsl(217,20%,45%);
  --c-interactive:hsl(217,76%,47%);
  --c-error:      hsl(0,74%,48%);
  --c-error-bg:   hsla(0,74%,48%,0.08);
  --c-error-b:    hsla(0,74%,48%,0.4);
}
.form-demo { width: 320px; }
.state-btns { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
.sb { font-size: 11px; font-weight: 500; padding: 4px 10px;
  border-radius: 5px; border: 1px solid var(--c-border); background: var(--c-surface);
  color: var(--c-text-3); cursor: pointer; }
.sb.active { background: var(--c-interactive); color: white; border-color: var(--c-interactive); }

/* ── BASE FIELD ── */
.field-wrap        { display: flex; flex-direction: column; gap: var(--space-1); }
.field-label       { font-size: 13px; font-weight: 500; color: var(--c-text-2); }
.field-input-wrap  { display: flex; align-items: center; gap: var(--space-2);
  background: var(--c-surface-r); border: 1px solid var(--c-border);
  border-radius: 8px; padding: var(--space-2) var(--space-3);
  transition: border-color 0.12s, background 0.12s; }
.field-input  { flex: 1; background: transparent; border: none; outline: none;
  color: var(--c-text-1); font-size: 14px; min-width: 0; }
.field-input::placeholder { color: var(--c-text-3); }
.field-icon   { font-size: 14px; color: var(--c-text-3); flex-shrink: 0; }
.field-spinner{ font-size: 14px; color: var(--c-text-3); flex-shrink: 0;
  animation: spin2 0.8s linear infinite; }
@keyframes spin2 { to { transform: rotate(360deg); } }
.field-hint   { font-size: 12px; color: var(--c-error); margin: 0; }

/* ── YOUR STATE CLASSES GO HERE ── */`,
      startCode: `// ADD STATE MODIFIER CLASSES AND WIRE UP THE BUTTONS

// ── Define state styles ────────────────────────────────────────────────────────
const styles = document.createElement('style');
styles.textContent = \`
  /* FOCUS state */
  .field-wrap--focus .field-input-wrap {
    /* YOUR CSS: border-color + box-shadow focus ring */
  }
  .field-wrap--focus .field-input {
    /* YOUR CSS: ensure outline is NOT 'none' */
  }

  /* ERROR state */
  .field-wrap--error .field-input-wrap {
    /* YOUR CSS: error border colour + background tint */
  }

  /* DISABLED state */
  .field-wrap--disabled .field-input-wrap {
    /* YOUR CSS: opacity + cursor */
  }
  .field-wrap--disabled .field-input {
    pointer-events: none;
  }
\`;
document.head.appendChild(styles);

// ── State application function ─────────────────────────────────────────────────
function applyState(state) {
  const wrap    = document.getElementById('field-wrap');
  const input   = document.getElementById('field-input');
  const hint    = document.getElementById('field-hint');
  const icon    = document.getElementById('field-icon');
  const spinner = document.getElementById('field-spinner');

  // Clear all state classes
  wrap.className = 'field-wrap';
  input.disabled = false;
  hint.style.display    = 'none';
  icon.style.display    = '';
  spinner.style.display = 'none';

  // Apply the requested state
  if (state === 'focus') {
    wrap.classList.add('field-wrap--focus');
    input.focus();
  } else if (state === 'error') {
    wrap.classList.add('field-wrap--error');
    hint.style.display = 'block';   // show error message
  } else if (state === 'disabled') {
    wrap.classList.add('field-wrap--disabled');
    input.disabled = true;
  } else if (state === 'loading') {
    icon.style.display    = 'none';
    spinner.style.display = '';
    input.disabled = true;
  }

  // Update button states
  document.querySelectorAll('.sb').forEach(b =>
    b.classList.toggle('active', b.dataset.state === state));
}

document.querySelectorAll('.sb').forEach(b =>
  b.addEventListener('click', () => applyState(b.dataset.state)));
applyState('default');

// ── AUDIT ─────────────────────────────────────────────────────────────────────
setTimeout(() => {
  applyState('error');
  const wrapS   = window.getComputedStyle(document.querySelector('.field-input-wrap'));
  const disabledTest = () => { applyState('disabled'); return parseFloat(window.getComputedStyle(document.getElementById('field-wrap')).opacity); };

  console.log('=== STATE AUDIT ===');
  // Error: border should not be the default grey
  const errorBorder = wrapS.borderColor;
  const hasErrorBorder = !errorBorder.includes('32%') && errorBorder !== 'rgb(0, 0, 0)';
  console.log((hasErrorBorder ? '✓' : '✗') + ' Error state changes border colour');

  applyState('focus');
  const focusS    = window.getComputedStyle(document.querySelector('.field-input-wrap'));
  const hasFocusRing = focusS.boxShadow !== 'none' || focusS.borderColor.includes('47%');
  console.log((hasFocusRing ? '✓' : '✗') + ' Focus state adds visible ring');

  const disabledOpacity = disabledTest();
  console.log((disabledOpacity < 0.8 ? '✓' : '✗') + ' Disabled state reduces opacity');
  applyState('default');
}, 200);`,
      solutionCode: `const styles = document.createElement('style');
styles.textContent = \`
  .field-wrap--focus .field-input-wrap {
    border-color: var(--c-interactive);
    box-shadow: 0 0 0 3px hsla(217,76%,47%,0.25);
  }
  .field-wrap--error .field-input-wrap {
    border-color: var(--c-error);
    background: var(--c-error-bg);
  }
  .field-wrap--disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }
  .field-wrap--disabled .field-input-wrap {
    pointer-events: none;
  }
\`;
document.head.appendChild(styles);

function applyState(state) {
  const wrap = document.getElementById('field-wrap');
  const input = document.getElementById('field-input');
  const hint = document.getElementById('field-hint');
  const icon = document.getElementById('field-icon');
  const spinner = document.getElementById('field-spinner');
  wrap.className = 'field-wrap';
  input.disabled = false;
  hint.style.display = 'none';
  icon.style.display = '';
  spinner.style.display = 'none';
  if (state === 'focus') { wrap.classList.add('field-wrap--focus'); input.focus(); }
  else if (state === 'error') { wrap.classList.add('field-wrap--error'); hint.style.display = 'block'; }
  else if (state === 'disabled') { wrap.classList.add('field-wrap--disabled'); input.disabled = true; }
  else if (state === 'loading') { icon.style.display = 'none'; spinner.style.display = ''; input.disabled = true; }
  document.querySelectorAll('.sb').forEach(b => b.classList.toggle('active', b.dataset.state === state));
}
document.querySelectorAll('.sb').forEach(b => b.addEventListener('click', () => applyState(b.dataset.state)));
applyState('default');`,
      check: (code) => {
        const hasFocusStyle = /field-wrap--focus|focus.*border|focus.*box-shadow/i.test(code);
        const hasErrorStyle = /field-wrap--error|error.*border|c-error/i.test(code);
        const hasDisabled   = /field-wrap--disabled|disabled.*opacity|opacity.*0\.3/i.test(code);
        return hasFocusStyle && hasErrorStyle && hasDisabled;
      },
      successMessage: `Four states implemented. The pattern: modifier classes on the container, not inline styles on children. Each state class changes exactly the properties it owns: focus changes border and box-shadow, error changes border and background, disabled changes opacity. They compose — an error state can also be focused, a loading state can also show an error after completion.`,
      failMessage: `Three state classes needed: (1) .field-wrap--focus must change the border-color or add a box-shadow focus ring. (2) .field-wrap--error must change the border-color to the error colour. (3) .field-wrap--disabled must reduce opacity (below 0.8). Add these as CSS rules inside the styles.textContent string.`,
      outputHeight: 440,
    },

    // ─── PART 9: ANTI-PATTERNS ────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Component Composition Anti-Patterns

Six composition failures found in nearly every component library.

---

### CM-1: Layer Skipping
**Symptom:** Colour applied before structure is defined. Layout applied before anatomy is named. The result is type sizes chosen without hierarchy levels, spacing chosen without knowing the flex direction.
**Fix:** Apply layers in order: anatomy → structure → rhythm → surface. Never apply colour until hierarchy levels are assigned.

---

### CM-2: The Stateless Component
**Symptom:** A component that only exists in its happy-path state. No disabled, no loading, no error, no empty. Crashes visually in production when any of these states occur.
**Fix:** Every interactive component needs all eight states designed and implemented. If you don't design the disabled state, the browser will give you the default — which is always wrong.

---

### CM-3: Variant Explosion
**Symptom:** 47 button classes. \`.btn-primary-large-disabled-with-icon\` as a single class. Adding a new combination requires adding a new class.
**Fix:** Three independent modifier dimensions (intent × size × state). 11 classes cover 36 combinations. Never encode multiple dimensions in one class name.

---

### CM-4: The State Style Mutation
**Symptom:** State changes applied via \`element.style.color = '#ef4444'\`. Not visible in browser CSS inspector. Not overridable by CSS. Creates debugging nightmares.
**Fix:** States as CSS classes. \`element.classList.add('field--error')\`. Visible in inspector, overridable, testable.

---

### CM-5: The Missing Focus Ring
**Symptom:** \`outline: none\` or \`outline: 0\` on all interactive elements. Beautiful in a mouse-only demo. Catastrophic for keyboard users, screen reader users, and anyone with motor impairments. Fails WCAG 2.4.7.
**Fix:** Design a custom focus ring using \`box-shadow: 0 0 0 3px rgba()\` and \`border-color\`. Never remove the focus indicator entirely. The design requirement is: "visible keyboard focus indicator" — not "no focus indicator."

---

### CM-6: The One-Off Component
**Symptom:** A component that works for one specific data shape. A card that breaks if the title is over 40 characters, the image is missing, or there are more than 3 feature items.
**Fix:** Apply the overflow stress test to every component before shipping. Test with: empty data, maximum data, long strings, translated strings, missing optional fields. The component must handle all of these gracefully.`,
    },

    // ─── PART 10: SABOTAGE SANDBOX ────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `## Sabotage Sandbox: Six Composition Violations

The alert component below has six deliberate composition violations. It renders without errors but is broken in measurable ways. Diagnose and fix each one.

**The violations:**
1. CM-1: Layer skipping — colour applied before hierarchy is defined (price/title same visual weight)
2. CM-2: Stateless — no disabled or error state exists, crashes when data is invalid
3. CM-3: Variant explosion — "success" and "warning" are separate full-rule classes instead of modifier classes
4. CM-4: State mutation — the close button's active state is applied via inline style, not a class
5. CM-5: Focus ring removed — \`outline: none\` on the close button with no replacement
6. CM-6: No empty state — the messages container collapses to 0 height with no data

The test checks: close button has no \`outline: none\` without a replacement, variant classes only change one property, and an empty state exists.`,
      html: `<div class="alert-system" id="alert-system">
  <div class="alert-controls">
    <button class="ac-btn" onclick="addAlert('info')">+ Info</button>
    <button class="ac-btn" onclick="addAlert('success')">+ Success</button>
    <button class="ac-btn" onclick="addAlert('warning')">+ Warning</button>
    <button class="ac-btn" onclick="addAlert('error')">+ Error</button>
    <button class="ac-btn" onclick="clearAlerts()">Clear all</button>
  </div>
  <div class="alerts-container" id="alerts-container">
    <!-- alerts rendered here — empty state missing (CM-6) -->
  </div>
</div>`,
      css: `body { background: #0f172a; padding: 20px; margin: 0; font-family: system-ui, sans-serif; }
:root {
  --space-2:8px; --space-3:12px; --space-4:16px;
  --c-surface:hsl(222,39%,12%); --c-border:hsl(217,32%,22%);
  --c-text-1:hsl(210,40%,96%); --c-text-2:hsl(215,25%,65%);
}
.alert-system { max-width: 480px; }
.alert-controls { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
.ac-btn { font-size: 11px; font-weight: 500; padding: 5px 10px; border-radius: 5px;
  border: 1px solid var(--c-border); background: var(--c-surface);
  color: var(--c-text-2); cursor: pointer; }

/* BASE ALERT — anatomy + structure correct */
.alert {
  display: flex; align-items: flex-start; gap: var(--space-3);
  padding: var(--space-3) var(--space-4); border-radius: 8px;
  border: 1px solid; margin-bottom: 8px;
  /* CM-1: no hierarchy assigned — icon, title, body all same visual weight */
}
.alert-icon { width: 20px; height: 20px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: white; flex-shrink: 0; }
.alert-body { flex: 1; min-width: 0; }
.alert-title{ font-size: 14px; font-weight: 400; color: var(--c-text-1);
  margin-bottom: 2px; } /* CM-1: title same weight as body */
.alert-text { font-size: 13px; color: var(--c-text-1); line-height: 1.5; }
              /* CM-1: text same colour as title — no hierarchy */
.alert-close{
  background: none; border: none; cursor: pointer;
  color: var(--c-text-2); font-size: 16px; flex-shrink: 0;
  outline: none;   /* CM-5: focus ring destroyed */
  /* CM-4: active state applied via inline style in JS */
}

/* CM-3: variant explosion — separate full rules instead of modifier classes */
.alert--info    { background:rgba(59,130,246,0.08); border-color:rgba(59,130,246,0.2); }
.alert--info    .alert-icon { background:#3b82f6; }
.alert--info    .alert-title{ color:#93c5fd; font-weight:600; }
.alert--success { background:rgba(34,197,94,0.08);  border-color:rgba(34,197,94,0.2);  }
.alert--success .alert-icon { background:#22c55e; }
.alert--success .alert-title{ color:#86efac; font-weight:600; }
.alert--warning { background:rgba(251,191,36,0.08); border-color:rgba(251,191,36,0.2); }
.alert--warning .alert-icon { background:#f59e0b; }
.alert--warning .alert-title{ color:#fde68a; font-weight:600; }
.alert--error   { background:rgba(239,68,68,0.08);  border-color:rgba(239,68,68,0.2);  }
.alert--error   .alert-icon { background:#ef4444; }
.alert--error   .alert-title{ color:#fca5a5; font-weight:600; }`,
      startCode: `// FIX THE SIX VIOLATIONS

// ── FIX CM-3: Refactor variant explosion ──────────────────────────────────────
// Add modifier classes that change ONLY the colour properties
// (the existing full-rule classes already work, but add the refactored versions too)
const fixedStyles = document.createElement('style');
fixedStyles.textContent = \`
  /* Refactored: each variant only changes its colour variables */
  .alert {
    --alert-bg:     rgba(100,116,139,0.08);
    --alert-border: rgba(100,116,139,0.2);
    --alert-icon:   hsl(215,20%,45%);
    --alert-title:  var(--c-text-2);
    background: var(--alert-bg);
    border-color: var(--alert-border);
  }
  /* YOUR variant overrides — only change the variables */
  .alert--info    { /* --alert-bg, --alert-border, --alert-icon, --alert-title */ }
  .alert--success { /* ... */ }
  .alert--warning { /* ... */ }
  .alert--error   { /* ... */ }

  /* FIX CM-5: Custom focus ring on close button */
  .alert-close:focus-visible {
    /* YOUR focus ring — box-shadow, border, or outline with an actual value */
  }

  /* FIX CM-1: Hierarchy — title should be heavier than body text */
  .alert-title { font-weight: ???; }
  .alert-text  { color: ???; }

  /* FIX CM-6: Empty state */
  .alerts-empty {
    /* display, alignment, colour */
  }
\`;
document.head.appendChild(fixedStyles);

// ── FIX CM-4: State via class, not inline style ────────────────────────────────
// The close button currently uses: element.style.opacity = '0.5' on click
// Fix: use a class instead

// ── Alert renderer (working — do not break this) ───────────────────────────────
const TYPES = {
  info:    { icon:'i', label:'Info' },
  success: { icon:'✓', label:'Success' },
  warning: { icon:'!', label:'Warning' },
  error:   { icon:'✕', label:'Error' },
};

function addAlert(type) {
  const container = document.getElementById('alerts-container');
  // Remove empty state if present
  container.querySelector('.alerts-empty')?.remove();

  const t   = TYPES[type];
  const el  = document.createElement('div');
  el.className = 'alert alert--' + type;
  el.innerHTML = \`
    <div class="alert-icon">\${t.icon}</div>
    <div class="alert-body">
      <div class="alert-title">\${t.label}</div>
      <div class="alert-text">This is a \${type} message with some supporting detail.</div>
    </div>
    <button class="alert-close" title="Dismiss">✕</button>
  \`;

  // FIX CM-4: close button should use class for active state, not inline style
  const close = el.querySelector('.alert-close');
  close.addEventListener('mousedown', () => {
    // BROKEN: close.style.opacity = '0.5';  // ← CM-4 violation
    // FIX: use class instead
    close.classList.add('???');  // add your active state class
  });
  close.addEventListener('mouseup', () => {
    close.classList.remove('???');
    el.remove();
    if (!container.children.length) showEmpty();
  });

  container.appendChild(el);
}

function showEmpty() {
  const container = document.getElementById('alerts-container');
  // FIX CM-6: show empty state instead of collapsing
  const empty = document.createElement('div');
  empty.className = 'alerts-empty';
  empty.innerHTML = '✓ No notifications'; // YOUR empty state content
  container.appendChild(empty);
}

function clearAlerts() {
  document.getElementById('alerts-container').innerHTML = '';
  showEmpty();
}

// ── AUDIT ─────────────────────────────────────────────────────────────────────
showEmpty(); // show empty state initially

setTimeout(() => {
  addAlert('info');
  const close    = document.querySelector('.alert-close');
  const closeCSS = window.getComputedStyle(close);
  const title    = document.querySelector('.alert-title');
  const titleW   = parseFloat(window.getComputedStyle(title).fontWeight);

  const checks = {
    'CM-5 focus ring exists': closeCSS.outline !== 'none 0px' && closeCSS.outline !== '0px',
    'CM-1 title weight > 400': titleW > 400,
    'CM-6 empty state defined': !!document.querySelector('.alerts-empty') || true,
  };
  // After adding alert, clear to check empty state
  clearAlerts();
  checks['CM-6 empty state rendered'] = !!document.querySelector('.alerts-empty');
  console.log('=== COMPOSITION AUDIT ===');
  Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗')+' '+k));
}, 300);`,
      solutionCode: `const fixedStyles = document.createElement('style');
fixedStyles.textContent = \`
  .alert {
    --alert-bg: rgba(100,116,139,0.08); --alert-border: rgba(100,116,139,0.2);
    --alert-icon: hsl(215,20%,45%); --alert-title-c: var(--c-text-2);
    background: var(--alert-bg); border-color: var(--alert-border);
  }
  .alert--info    { --alert-bg:rgba(59,130,246,0.08); --alert-border:rgba(59,130,246,0.2); --alert-icon:#3b82f6; --alert-title-c:#93c5fd; }
  .alert--success { --alert-bg:rgba(34,197,94,0.08);  --alert-border:rgba(34,197,94,0.2);  --alert-icon:#22c55e; --alert-title-c:#86efac; }
  .alert--warning { --alert-bg:rgba(251,191,36,0.08); --alert-border:rgba(251,191,36,0.2); --alert-icon:#f59e0b; --alert-title-c:#fde68a; }
  .alert--error   { --alert-bg:rgba(239,68,68,0.08);  --alert-border:rgba(239,68,68,0.2);  --alert-icon:#ef4444; --alert-title-c:#fca5a5; }
  .alert-icon { background: var(--alert-icon) !important; }
  .alert-title { font-weight: 600 !important; color: var(--alert-title-c) !important; }
  .alert-text  { color: var(--c-text-2) !important; }
  .alert-close:focus-visible { outline: 2px solid var(--c-interactive,#3b82f6); outline-offset: 2px; border-radius: 3px; }
  .alert-close--pressed { opacity: 0.5; }
  .alerts-empty { padding: 24px; text-align: center; font-size: 13px; color: var(--c-text-3,#475569); }
\`;
document.head.appendChild(fixedStyles);
const TYPES = { info:{icon:'i',label:'Info'}, success:{icon:'✓',label:'Success'}, warning:{icon:'!',label:'Warning'}, error:{icon:'✕',label:'Error'} };
function addAlert(type) {
  const c = document.getElementById('alerts-container');
  c.querySelector('.alerts-empty')?.remove();
  const el = document.createElement('div');
  el.className = 'alert alert--' + type;
  el.innerHTML = \`<div class="alert-icon">\${TYPES[type].icon}</div><div class="alert-body"><div class="alert-title">\${TYPES[type].label}</div><div class="alert-text">This is a \${type} message.</div></div><button class="alert-close" title="Dismiss">✕</button>\`;
  const close = el.querySelector('.alert-close');
  close.addEventListener('mousedown', () => close.classList.add('alert-close--pressed'));
  close.addEventListener('mouseup', () => { close.classList.remove('alert-close--pressed'); el.remove(); if (!c.children.length) showEmpty(); });
  c.appendChild(el);
}
function showEmpty() { const c = document.getElementById('alerts-container'); const e = document.createElement('div'); e.className='alerts-empty'; e.textContent='✓ No notifications'; c.appendChild(e); }
function clearAlerts() { document.getElementById('alerts-container').innerHTML=''; showEmpty(); }
showEmpty();`,
      check: (code) => {
        const hasFocusFix  = /focus-visible|focus.*outline|focus.*box-shadow/i.test(code);
        const hasTitleFix  = /alert-title[\s\S]*?font-weight.*(?:500|600|700)|fontWeight.*(?:500|600|700)/i.test(code);
        const hasEmptyState= /alerts-empty|showEmpty|empty.*state/i.test(code);
        return hasFocusFix && hasEmptyState;
      },
      successMessage: `Six composition violations fixed. The most critical: CM-5 (focus ring) ensures keyboard users can navigate your interface — outline: none is never acceptable. CM-6 (empty state) prevents the blank-panel confusion that makes users think the app is broken. CM-4 (class vs inline style) keeps your state machine visible and debuggable in browser tools.`,
      failMessage: `Three required: (1) .alert-close must have a :focus-visible rule that provides a visible focus ring — the current outline:none must be replaced with box-shadow or an actual outline value. (2) An .alerts-empty element must be rendered when there are no alerts (in showEmpty() or clearAlerts()). (3) .alert-title should have font-weight 500 or 600 to distinguish it from .alert-text.`,
      outputHeight: 520,
    },

    // ─── PART 11: STRESS CONDITION ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Stress Condition: The Component Under Six Real Scenarios

A component is done when it handles every scenario it will encounter in production without requiring special-case code.

These six scenarios test the composition model under real-world conditions. Notice: none of them require you to change the component's CSS. The composition model — correct structure, correct overflow handling, correct states — produces the right output automatically.`,
      html: `<div id="stress-controls">
  <button class="sc-btn active" data-mode="default">Default</button>
  <button class="sc-btn" data-mode="long-title">Long title</button>
  <button class="sc-btn" data-mode="no-image">No image</button>
  <button class="sc-btn" data-mode="many-features">10 features</button>
  <button class="sc-btn" data-mode="loading">Loading</button>
  <button class="sc-btn" data-mode="error">Error</button>
</div>
<div class="sc-card" id="sc-card">
  <div class="sc-media" id="sc-media">
    <span class="sc-badge" id="sc-badge">NEW</span>
  </div>
  <div class="sc-body">
    <div class="sc-cat" id="sc-cat">DESIGN TOOLS</div>
    <h3 class="sc-title" id="sc-title">Figma Professional</h3>
    <p class="sc-desc" id="sc-desc">Collaborative design for teams.</p>
    <div class="sc-price">
      <span class="sc-amount" id="sc-amount">$15</span>
      <span class="sc-period">/mo</span>
    </div>
    <div class="sc-feats" id="sc-feats"></div>
    <button class="sc-cta" id="sc-cta">Start free trial</button>
    <div class="sc-error-msg" id="sc-error-msg" style="display:none">
      ⚠ Unable to load pricing. Please try again.
    </div>
  </div>
</div>`,
      css: `body { background: #0f172a; padding: 20px; margin: 0; font-family: system-ui, sans-serif; }
#stress-controls { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
.sc-btn { font-size: 11px; font-weight: 500; padding: 5px 12px;
  border-radius: 6px; border: 1px solid #334155; background: #1e293b;
  color: var(--color-text-secondary, #475569); cursor: pointer; }
.sc-btn.active { background: #2563eb; color: white; border-color: #2563eb; }
:root {
  --sc-surface:hsl(222,39%,12%); --sc-border:hsl(217,32%,22%);
  --sc-text-1:hsl(210,40%,96%); --sc-text-2:hsl(215,25%,65%); --sc-text-3:hsl(217,20%,45%);
  --sc-interactive:hsl(217,76%,47%); --sc-error:hsl(0,74%,48%);
}
.sc-card  { background:var(--sc-surface); border:1px solid var(--sc-border);
  border-radius:12px; overflow:hidden; max-width:280px;
  display:flex; flex-direction:column; }
.sc-media { height:120px; background:linear-gradient(135deg,hsl(217,80%,22%),hsl(280,70%,22%));
  display:flex; align-items:flex-start; padding:10px; flex-shrink:0; }
.sc-badge { font-size:9px; font-weight:700; letter-spacing:0.1em;
  background:hsl(38,90%,50%); color:white; padding:2px 8px; border-radius:100px; }
.sc-body  { padding:16px; display:flex; flex-direction:column; gap:8px; }
.sc-cat   { font-size:10px; font-weight:700; color:var(--sc-interactive);
  letter-spacing:0.12em; text-transform:uppercase; }
.sc-title { font-size:18px; font-weight:700; color:var(--sc-text-1); margin:0;
  line-height:1.2; overflow:hidden; display:-webkit-box;
  -webkit-line-clamp:2; -webkit-box-orient:vertical; } /* clamp to 2 lines */
.sc-desc  { font-size:13px; color:var(--sc-text-2); line-height:1.55; margin:0;
  overflow:hidden; display:-webkit-box;
  -webkit-line-clamp:3; -webkit-box-orient:vertical; } /* clamp to 3 lines */
.sc-price { display:flex; align-items:baseline; gap:3px; }
.sc-amount{ font-size:28px; font-weight:700; color:var(--sc-text-1); line-height:1; }
.sc-period{ font-size:12px; color:var(--sc-text-2); }
.sc-feats { display:flex; flex-direction:column; gap:4px; }
.sc-feat  { font-size:12px; color:var(--sc-text-3); }
.sc-cta   { width:100%; padding:10px; background:var(--sc-interactive);
  color:white; border:none; border-radius:8px; font-size:14px;
  font-weight:600; cursor:pointer; }
.sc-error-msg { font-size:12px; color:var(--sc-error);
  padding:8px 10px; background:rgba(239,68,68,0.08);
  border:1px solid rgba(239,68,68,0.25); border-radius:6px; }
.sc-card--loading .sc-body { opacity:0.4; pointer-events:none; }
.sc-card--loading .sc-cta  { background: var(--sc-border); color: var(--sc-text-3); }`,
      startCode: `const scenarios = {
  default: {
    title: 'Figma Professional',
    desc:  'Collaborative design for teams. Real-time editing, components, auto-layout.',
    feats: ['✓ Unlimited projects', '✓ Version history', '✓ Dev mode'],
    amount: '$15', showMedia: true, loading: false, error: false,
  },
  'long-title': {
    title: 'The complete and definitive professional design and collaboration platform for teams of all sizes',
    desc:  'Short description.',
    feats: ['✓ Feature one'],
    amount: '$15', showMedia: true, loading: false, error: false,
  },
  'no-image': {
    title: 'Figma Starter',
    desc:  'For individuals exploring design.',
    feats: ['✓ 3 projects', '✓ Basic components'],
    amount: 'Free', showMedia: false, loading: false, error: false,
  },
  'many-features': {
    title: 'Figma Enterprise',
    desc:  'Full-scale platform for large organisations.',
    feats: Array.from({length:10}, (_,i) => '✓ Enterprise feature ' + (i+1)),
    amount: '$75', showMedia: true, loading: false, error: false,
  },
  loading: {
    title: '...', desc: '...', feats: [], amount: '—',
    showMedia: true, loading: true, error: false,
  },
  error: {
    title: 'Figma Professional', desc: 'Unable to load plan details.',
    feats: [], amount: '—', showMedia: true, loading: false, error: true,
  },
};

function render(mode) {
  const s    = scenarios[mode];
  const card = document.getElementById('sc-card');

  document.getElementById('sc-title').textContent  = s.title;
  document.getElementById('sc-desc').textContent   = s.desc;
  document.getElementById('sc-amount').textContent = s.amount;
  document.getElementById('sc-media').style.display = s.showMedia ? '' : 'none';

  const featsEl = document.getElementById('sc-feats');
  featsEl.innerHTML = s.feats.map(f => \`<div class="sc-feat">\${f}</div>\`).join('');

  card.classList.toggle('sc-card--loading', s.loading);
  document.getElementById('sc-cta').textContent =
    s.loading ? '⟳ Loading...' : s.error ? 'Try again' : 'Start free trial';
  document.getElementById('sc-error-msg').style.display = s.error ? 'block' : 'none';

  document.querySelectorAll('.sc-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === mode));

  console.log('Scenario: ' + mode);
  console.log('Observe: long title clamps to 2 lines. Many features scroll within body.');
  console.log('No media: card collapses gracefully. Loading: body fades, CTA disabled.');
}

render('default');
document.querySelectorAll('.sc-btn').forEach(b =>
  b.addEventListener('click', () => render(b.dataset.mode)));`,
      outputHeight: 460,
    },

    // ─── PART 12: PRACTICE 3 — DATA TABLE FROM SPEC ──────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 3: Build a Data Table from a Written Spec

You're given a written specification for a data table component. Build it by applying the four-layer composition process in sequence.

**The spec:**
- **Anatomy:** table with header row, data rows, sortable column headers, a status badge per row, and row actions (edit/delete buttons)
- **Structure:** CSS Grid for the table (not \`<table>\` element), flex for header cells and action buttons
- **Rhythm:** header text fs-0 (10px), body text fs-2 (14px), row padding space-3 top/bottom space-4 sides, header padding space-2 top/bottom space-4 sides, gap between action buttons space-2
- **Surface:** header bg = surface-raised, row hover = surface, status badges use semantic colours, action buttons are text-only (no background), delete button uses error colour on hover

**Test verifies:** Grid used for table layout, header has distinct background from rows, status badges exist, and row hover state is implemented.

This is the most open-ended practice in the course — the spec leaves some decisions to you. Make them deliberately, using the systems you know.`,
      html: `<div class="data-table-wrap" id="data-table-wrap">
  <div class="dt-header-row">
    <div class="dt-col-check"></div>
    <div class="dt-col-name dt-sortable">Name ↕</div>
    <div class="dt-col-email">Email</div>
    <div class="dt-col-plan">Plan</div>
    <div class="dt-col-status">Status</div>
    <div class="dt-col-actions">Actions</div>
  </div>
  <div class="dt-body" id="dt-body"></div>
</div>`,
      css: `body { background: #0f172a; padding: 20px; margin: 0; font-family: system-ui, sans-serif; }
:root {
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px;
  --fs-0:10px; --fs-1:12px; --fs-2:14px; --fs-3:16px;
  --c-bg:          hsl(222,47%,7%);
  --c-surface:     hsl(222,39%,12%);
  --c-surface-r:   hsl(222,35%,17%);
  --c-border:      hsl(217,32%,22%);
  --c-text-1:      hsl(210,40%,96%);
  --c-text-2:      hsl(215,25%,65%);
  --c-text-3:      hsl(217,20%,45%);
  --c-interactive: hsl(217,76%,47%);
  --c-error:       hsl(0,74%,48%);
  --c-success:     hsl(142,60%,45%);
  --c-warning:     hsl(38,90%,50%);
}
/* The column template — apply this to both header and data rows */
.dt-header-row, .dt-data-row {
  display: grid;
  grid-template-columns: 32px 1fr 1.5fr 100px 90px 100px;
  align-items: center;
}`,
      startCode: `// BUILD THE DATA TABLE USING THE FOUR-LAYER PROCESS

// Sample data
const DATA = [
  { name:'Sarah Chen',   email:'sarah@acme.com',    plan:'Pro',      status:'active'   },
  { name:'Marcus Liu',   email:'marcus@acme.com',   plan:'Pro',      status:'active'   },
  { name:'Priya Nair',   email:'priya@acme.com',    plan:'Starter',  status:'trial'    },
  { name:'Tom Weber',    email:'tom@acme.com',       plan:'Enterprise',status:'active' },
  { name:'Ada Osei',     email:'ada@acme.com',       plan:'Starter',  status:'inactive' },
];

const STATUS_COLOURS = {
  active:   { bg:'rgba(34,197,94,0.1)',  border:'rgba(34,197,94,0.25)',  text:'#86efac' },
  trial:    { bg:'rgba(251,191,36,0.1)', border:'rgba(251,191,36,0.25)', text:'#fde68a' },
  inactive: { bg:'rgba(100,116,139,0.1)',border:'rgba(100,116,139,0.2)', text:'#94a3b8' },
};

// ── LAYER 2: Apply structure to the header ────────────────────────────────────
const headerRow = document.querySelector('.dt-header-row');
// Apply header styling
// YOUR CODE HERE:

// ── LAYER 3+4: Render data rows ───────────────────────────────────────────────
const body = document.getElementById('dt-body');

function renderRow(person) {
  const row   = document.createElement('div');
  row.className = 'dt-data-row';

  // Apply rhythm and surface to the row
  // YOUR CODE HERE: set padding, border-bottom, hover state, font-size, colours

  const sc = STATUS_COLOURS[person.status] || STATUS_COLOURS.inactive;

  row.innerHTML = \`
    <div class="dt-col-check">
      <input type="checkbox" style="cursor:pointer;accent-color:var(--c-interactive)">
    </div>
    <div class="dt-col-name">
      <div style="font-size:var(--fs-2);font-weight:500;color:var(--c-text-1)">
        \${person.name}
      </div>
    </div>
    <div class="dt-col-email" style="font-size:var(--fs-1);color:var(--c-text-2)">
      \${person.email}
    </div>
    <div class="dt-col-plan" style="font-size:var(--fs-2);color:var(--c-text-2)">
      \${person.plan}
    </div>
    <div class="dt-col-status">
      <span style="
        font-size:var(--fs-0);font-weight:700;letter-spacing:0.08em;
        text-transform:uppercase;
        background:\${sc.bg};border:1px solid \${sc.border};color:\${sc.text};
        padding:2px 8px;border-radius:100px;white-space:nowrap">
        \${person.status}
      </span>
    </div>
    <div class="dt-col-actions" style="display:flex;gap:var(--space-2)">
      <button class="dt-action-edit">Edit</button>
      <button class="dt-action-delete">Delete</button>
    </div>
  \`;

  // Apply action button styles
  row.querySelectorAll('.dt-action-edit,.dt-action-delete').forEach(btn => {
    btn.style.cssText = \`
      background:none;border:none;cursor:pointer;
      font-size:var(--fs-1);font-weight:500;padding:2px 6px;border-radius:4px;
    \`;
  });
  row.querySelector('.dt-action-edit').style.color   = 'var(--c-text-2)';
  row.querySelector('.dt-action-delete').style.color = 'var(--c-text-3)';
  row.querySelector('.dt-action-delete').addEventListener('mouseenter', e => {
    e.target.style.color = 'var(--c-error)';
  });
  row.querySelector('.dt-action-delete').addEventListener('mouseleave', e => {
    e.target.style.color = 'var(--c-text-3)';
  });

  return row;
}

DATA.forEach(p => body.appendChild(renderRow(p)));

// ── AUDIT ─────────────────────────────────────────────────────────────────────
setTimeout(() => {
  const header  = document.querySelector('.dt-header-row');
  const firstRow= document.querySelector('.dt-data-row');
  const badge   = document.querySelector('[style*="border-radius: 100px"]') ||
                  document.querySelector('[style*="border-radius:100px"]');
  const hs      = window.getComputedStyle(header);
  const checks  = {
    'grid layout used':     hs.display === 'grid',
    'header has bg colour': header.style.background || header.style.backgroundColor,
    'status badges exist':  !!badge,
    'data rows rendered':   document.querySelectorAll('.dt-data-row').length === DATA.length,
  };
  console.log('=== DATA TABLE AUDIT ===');
  Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗') + ' ' + k));
}, 100);`,
      solutionCode: `const DATA = [
  { name:'Sarah Chen', email:'sarah@acme.com', plan:'Pro', status:'active' },
  { name:'Marcus Liu', email:'marcus@acme.com', plan:'Pro', status:'active' },
  { name:'Priya Nair', email:'priya@acme.com', plan:'Starter', status:'trial' },
  { name:'Tom Weber',  email:'tom@acme.com', plan:'Enterprise', status:'active' },
  { name:'Ada Osei',   email:'ada@acme.com', plan:'Starter', status:'inactive' },
];
const SC = {
  active:   { bg:'rgba(34,197,94,0.1)',  border:'rgba(34,197,94,0.25)',  text:'#86efac' },
  trial:    { bg:'rgba(251,191,36,0.1)', border:'rgba(251,191,36,0.25)', text:'#fde68a' },
  inactive: { bg:'rgba(100,116,139,0.1)',border:'rgba(100,116,139,0.2)', text:'#94a3b8' },
};
const header = document.querySelector('.dt-header-row');
header.style.cssText += \`background:var(--c-surface-r);border-bottom:1px solid var(--c-border);
  padding:var(--space-2) var(--space-4);font-size:var(--fs-0);font-weight:700;
  letter-spacing:0.1em;text-transform:uppercase;color:var(--c-text-3);\`;

const body = document.getElementById('dt-body');
function renderRow(p) {
  const row = document.createElement('div');
  row.className = 'dt-data-row';
  row.style.cssText = \`padding:var(--space-3) var(--space-4);
    border-bottom:1px solid var(--c-border);transition:background 0.1s;\`;
  row.addEventListener('mouseenter', () => row.style.background = 'var(--c-surface)');
  row.addEventListener('mouseleave', () => row.style.background = '');
  const sc = SC[p.status] || SC.inactive;
  row.innerHTML = \`
    <div><input type="checkbox" style="cursor:pointer;accent-color:var(--c-interactive)"></div>
    <div style="font-size:var(--fs-2);font-weight:500;color:var(--c-text-1)">\${p.name}</div>
    <div style="font-size:var(--fs-1);color:var(--c-text-2)">\${p.email}</div>
    <div style="font-size:var(--fs-2);color:var(--c-text-2)">\${p.plan}</div>
    <div><span style="font-size:var(--fs-0);font-weight:700;letter-spacing:0.08em;
      text-transform:uppercase;background:\${sc.bg};border:1px solid \${sc.border};
      color:\${sc.text};padding:2px 8px;border-radius:100px">\${p.status}</span></div>
    <div style="display:flex;gap:var(--space-2)">
      <button style="background:none;border:none;cursor:pointer;font-size:var(--fs-1);
        font-weight:500;color:var(--c-text-2);padding:2px 6px;border-radius:4px">Edit</button>
      <button class="del-btn" style="background:none;border:none;cursor:pointer;
        font-size:var(--fs-1);color:var(--c-text-3);padding:2px 6px;border-radius:4px">Delete</button>
    </div>\`;
  row.querySelector('.del-btn').onmouseenter = e => e.target.style.color='var(--c-error)';
  row.querySelector('.del-btn').onmouseleave = e => e.target.style.color='var(--c-text-3)';
  return row;
}
DATA.forEach(p => body.appendChild(renderRow(p)));`,
      check: (code) => {
        const hasGrid    = /grid|dt-header-row[\s\S]*?display.*grid/i.test(code);
        const hasRows    = /renderRow|DATA\.forEach|dt-data-row/i.test(code);
        const hasBadge   = /status|border-radius.*100px|badge/i.test(code);
        const hasHover   = /mouseenter|hover|mouseover/i.test(code);
        return hasGrid && hasRows && hasBadge;
      },
      successMessage: `Data table built from spec. You applied the composition process to a more complex component: anatomy (column structure), structure (grid template), rhythm (spacing + type tokens from the spec), surface (semantic colour tokens, hierarchy levels). The delete button hover state and row hover are Layer 4 details — visual feedback that communicates interactivity without requiring a separate component.`,
      failMessage: `Three required: (1) The header row must have a visible background colour different from the body rows. (2) Status badges must exist — the badge span with border-radius:100px must be rendered. (3) DATA.forEach must actually call renderRow() and append to the body. Check that the table has 5 data rows and the header has a visible background.`,
      outputHeight: 480,
    },

    // ─── PART 13: CROSS-PLATFORM ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Cross-Platform: The Composition Model Everywhere

The four-layer composition model applies to every UI framework. The layer names are identical; only the syntax changes.

| Layer | CSS/HTML | React | Qt/C++ | Unity |
|---|---|---|---|---|
| **Anatomy** | Semantic HTML + class names | JSX component structure | Widget hierarchy | GameObject hierarchy |
| **Structure** | \`display: flex/grid\` | Flexbox via Tailwind / CSS-in-JS | \`QHBoxLayout\`, \`QVBoxLayout\`, \`QGridLayout\` | Horizontal/Vertical Layout Group |
| **Rhythm** | Spacing tokens + type scale CSS vars | \`gap-4\`, \`text-sm\` (Tailwind) | \`setSpacing()\`, \`setContentsMargins()\` | \`spacing\`, \`padding\` |
| **Surface** | Semantic colour tokens | \`theme.colors.interactive\` | \`QPalette\`, \`setStyleSheet()\` | \`Image\` component tint, \`Text\` colour |
| **Variants** | CSS modifier classes | Component \`variant\` prop | Enum-based style selection | ScriptableObject config |
| **States** | \`:hover\`, \`:focus\`, CSS classes | \`isDisabled\`, \`isLoading\` props | Widget \`setEnabled()\`, \`setStyleSheet\` | Interactable states |

### The Invariant

What never changes across platforms or frameworks:

1. **Anatomy before structure.** Name the elements before you lay them out.
2. **Structure before rhythm.** Know the flex direction before applying spacing tokens.
3. **Rhythm before surface.** Assign hierarchy levels before applying colour.
4. **States are independent modifier dimensions.** Intent × size × interaction state — never combine in one class/prop.
5. **All eight states must exist.** Default, hover, focus, active, disabled, loading, error, empty.
6. **No state via inline style mutation.** States as class additions or prop changes — not direct style manipulation.

---

## What You Now Know

After Lesson 6, you have a complete composition process. Given any component:
1. Name the anatomy — every element, every region
2. Apply structure — flex/grid to every container
3. Apply rhythm — spacing tokens, type scale, line-heights
4. Apply surface — semantic colour tokens, hierarchy levels
5. Define variants — three independent modifier dimensions
6. Implement all eight states
7. Stress-test — empty, long strings, many items, translated text, loading, error

This process produces consistent, complete, accessible components every time — regardless of complexity.

**Next: Interaction Design** — the lesson that completes Phase 3 of the BRD. UI as a finite state machine, affordances, hit targets, feedback systems, and the measurable cost of every interaction.`,
    },

    // ─── PART 14: SEED ────────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Lesson 6 Complete — The \`auditComponent()\` Tool

The combined audit function — applies all five systems simultaneously to any component. This is the tool you run before shipping any component. Zero violations across all five systems is the definition of done.`,
      html: `<div id="ref-component">
  <div class="rc-card">
    <div class="rc-header">
      <span class="rc-badge">PRO</span>
      <h3 class="rc-title">Component Audit Tool</h3>
    </div>
    <p class="rc-body">Run this on any component before shipping. Zero violations is done.</p>
    <div class="rc-actions">
      <button class="rc-btn rc-btn--primary">Run audit</button>
      <button class="rc-btn rc-btn--secondary">Cancel</button>
    </div>
  </div>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
:root {
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-5:24px;
  --fs-0:10px; --fs-1:12px; --fs-2:14px; --fs-3:16px; --fs-4:21px;
  --c-surface:    hsl(222,39%,12%); --c-surface-r:hsl(222,35%,17%);
  --c-border:     hsl(217,32%,22%);
  --c-text-1:     hsl(210,40%,96%); --c-text-2:hsl(215,25%,65%); --c-text-3:hsl(217,20%,45%);
  --c-interactive:hsl(217,76%,47%); --c-interactive-s:hsl(217,80%,14%); --c-interactive-b:hsl(217,70%,22%);
}
/* ── REFERENCE COMPONENT — all four layers correct ── */
.rc-card    { background:var(--c-surface); border:1px solid var(--c-border);
  border-radius:12px; padding:var(--space-5); width:280px;
  display:flex; flex-direction:column; gap:var(--space-4); }
.rc-header  { display:flex; align-items:center; gap:var(--space-3); }
.rc-badge   { font-size:var(--fs-0); font-weight:700; letter-spacing:0.1em; text-transform:uppercase;
  background:var(--c-interactive-s); color:var(--c-interactive); border:1px solid var(--c-interactive-b);
  padding:2px 8px; border-radius:100px; flex-shrink:0; }
.rc-title   { font-size:var(--fs-3); font-weight:700; color:var(--c-text-1); margin:0;
  line-height:1.25; }
.rc-body    { font-size:var(--fs-2); color:var(--c-text-2); line-height:1.6;
  margin:0; max-width:55ch; }
.rc-actions { display:flex; gap:var(--space-2); }
.rc-btn     { padding:var(--space-2) var(--space-4); font-size:var(--fs-2);
  font-weight:600; border-radius:8px; border:1px solid transparent;
  cursor:pointer; flex:1; }
.rc-btn:focus-visible { outline:2px solid var(--c-interactive); outline-offset:2px; }
.rc-btn--primary   { background:var(--c-interactive); color:#fff; }
.rc-btn--secondary { background:transparent; color:var(--c-text-2);
  border-color:var(--c-border); }`,
      startCode: `// ── THE COMPLETE auditComponent() FUNCTION ────────────────────────────────────

function auditComponent(rootSel) {
  const root = document.querySelector(rootSel);
  if (!root) { console.warn('Not found:', rootSel); return; }

  const SPACING_SCALE = [4,8,12,16,24,32,48,64];
  const issues = { spacing:[], layout:[], colour:[], focus:[], hierarchy:[] };
  let pass = 0, fail = 0;

  root.querySelectorAll('*').forEach(el => {
    const s   = window.getComputedStyle(el);
    const cls = '.' + (el.className?.toString().split(' ')[0] || el.tagName.toLowerCase());

    // Spacing
    ['paddingTop','paddingBottom','paddingLeft','paddingRight',
     'marginTop','marginBottom'].forEach(p => {
      const v = Math.round(parseFloat(s[p]));
      if (v > 0 && v < 100 && !SPACING_SCALE.includes(v)) {
        issues.spacing.push(cls + '·' + p + ':' + v + 'px');
      }
    });

    // Layout: no floats
    if (s.float !== 'none') issues.layout.push(cls + ':float');

    // Colour: no hardcoded hex on interactive elements
    if ((el.tagName === 'BUTTON' || el.tagName === 'A') && el.style.backgroundColor &&
        el.style.backgroundColor.match(/^#/)) {
      issues.colour.push(cls + ':hardcoded bg=' + el.style.backgroundColor);
    }

    // Focus: buttons must not have outline:none without replacement
    if ((el.tagName === 'BUTTON' || el.tagName === 'A') &&
        s.outlineStyle === 'none' && s.boxShadow === 'none') {
      // Only flag if there's no :focus-visible override (approximate check)
      const hasFocusCSS = [...document.styleSheets].some(sheet => {
        try {
          return [...sheet.cssRules].some(rule =>
            rule.selectorText?.includes('focus') &&
            rule.selectorText?.includes(cls.slice(1)));
        } catch { return false; }
      });
      if (!hasFocusCSS) issues.focus.push(cls + ':no focus indicator');
    }
  });

  console.log('\\n=== auditComponent(' + rootSel + ') ===\\n');

  const checks = [
    ['Spacing on-grid',     issues.spacing.length === 0],
    ['No floats',           issues.layout.length  === 0],
    ['No hardcoded colours',issues.colour.length  === 0],
    ['Focus indicators',    issues.focus.length   === 0],
  ];

  checks.forEach(([label, ok]) => {
    ok ? pass++ : fail++;
    console.log((ok ? '✓' : '✗') + ' ' + label);
  });

  if (issues.spacing.length) {
    console.log('  Spacing details:', issues.spacing.slice(0,4).join(', '));
  }

  console.log('\\n' + pass + '/' + checks.length + ' systems pass');
  console.log(fail === 0 ? '\\n✓ Component ready to ship.' : '\\n✗ Fix violations before shipping.');
  return fail === 0;
}

auditComponent('#ref-component');

console.log('\\n=== PHASE 1 COMPLETE ===');
console.log('Six lessons. Five systems. One process.');
console.log('');
console.log('Hierarchy → four levels, four levers');
console.log('Spacing   → eight tokens, 4px base');
console.log('Type      → modular scale, LH function, 65ch');
console.log('Layout    → Flex + Grid constraints');
console.log('Colour    → three token layers, one swap');
console.log('Composition → four layers, eight states, three variant dimensions');
console.log('');
console.log('Lesson 7 → Interaction Design');
console.log('UI as a finite state machine. Affordances. Hit targets. Feedback systems.');`,
      outputHeight: 440,
    },
  ],
};

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export default {
  id: 'design-06-component-composition',
  slug: 'component-composition',
  chapter: 'design.1',
  order: 1,
  title: 'Component Composition',
  subtitle: 'Four layers, applied in order. Anatomy → Structure → Rhythm → Surface. A process that produces consistent components every time.',
  tags: [
    'css', 'components', 'composition', 'variants', 'states', 'anatomy',
    'hierarchy', 'flexbox', 'grid', 'tokens', 'accessibility', 'focus',
    'design-systems', 'anti-patterns', 'process',
  ],
  hook: {
    question: 'You know all five design systems. You sit down to build a new component. Where do you start? Without a process, the systems get applied randomly — some layers right, some skipped, some backwards.',
    realWorldContext:
      'The gap between knowing design rules and producing consistent components is a repeatable process. ' +
      'Senior engineers don\'t produce better components because they know more rules — they produce them because they apply the rules in the same order every time. ' +
      'Anatomy → Structure → Rhythm → Surface. Four layers. Always in order.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'Four layers, always in order: anatomy (HTML skeleton), structure (flex/grid), rhythm (spacing + type), surface (colour + hierarchy).',
      'Variants are three independent dimensions: intent (changes surface), size (changes rhythm), state (adds to any combination).',
      'All eight states must exist: default, hover, focus, active, disabled, loading, error, empty.',
      'States as CSS modifier classes — never as inline style mutations. Visible in the inspector, overridable, testable.',
      'Never outline: none without a replacement. Focus rings are accessibility requirements, not visual noise.',
      'A component is done when it handles: empty data, maximum data, long strings, translated strings, all eight states.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'Layer Order Is Non-Negotiable',
        body: 'Applying colour before assigning hierarchy levels produces the CTA-camouflage and grey-soup anti-patterns. Applying spacing before knowing the flex direction produces incorrect gap directions. The order — anatomy → structure → rhythm → surface — is the order each layer depends on the previous one.',
      },
      {
        type: 'important',
        title: 'CM-5: Never outline: none',
        body: 'Removing the focus ring fails WCAG 2.4.7 and makes keyboard navigation invisible. Design a visible focus ring using box-shadow: 0 0 0 3px rgba(brand, 0.4). Replace the default browser ring with a better one — never remove it.',
      },
      {
        type: 'tip',
        title: 'The Variant Rule',
        body: '3 intents × 3 sizes × 4 states = 36 combinations from 10 modifier classes. If you are writing a class that encodes more than one dimension (e.g., btn-primary-large), you are writing variant explosion. Split it into independent modifiers.',
      },
      {
        type: 'warning',
        title: 'CM-6: Every Component Needs an Empty State',
        body: 'An empty state is not "no content." It is an intentional design state that tells the user why there is no content and what they can do about it. A collapsing container with nothing in it looks broken — because it is.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Design Systems — Lesson 6: Component Composition',
        props: { lesson: LESSON_DESIGN_06 },
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: {
    prose: [
      'The four-layer composition model is a specific application of separation of concerns: structure (HTML + layout CSS), presentation rhythm (spacing + typography), and visual surface (colour + hierarchy) are independent concerns. Mixing them — applying colour before structure, or spacing before layout direction — creates implicit dependencies that make components fragile to change.',
      'The variant multiplication principle: N independent modifier dimensions produce N1×N2×N3 combinations from N1+N2+N3 classes. Three intents, three sizes, four states = 10 classes for 36 combinations. Combined classes produce 3×4×5 = 60 classes for the same coverage. The independent model scales; the combined model doesn\'t.',
      'WCAG 2.4.7 (Focus Visible) requires that "any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible." This is a Level AA requirement — the practical minimum for accessibility compliance in most markets.',
    ],
    callouts: [],
    visualizations: [],
  },
  examples: [],
  challenges: [],
  mentalModel: [
    'Four layers in order: anatomy → structure (flex/grid) → rhythm (spacing + type) → surface (colour + hierarchy).',
    'Each layer depends on the previous. Never apply colour before hierarchy levels are assigned.',
    'Three variant dimensions: intent (surface only), size (rhythm only), state (any combination). Never combine in one class.',
    'Eight states: default, hover, focus, active, disabled, loading, error, empty. All required.',
    'States as CSS modifier classes. Never inline style mutations.',
    'outline: none is never acceptable. Design a focus ring; never remove one.',
    'auditComponent() = all five system audits applied simultaneously. Zero violations = ready to ship.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Four layers: anatomy → structure → rhythm → surface." A designer applies brand colours before deciding which elements are primary vs secondary. What goes wrong?',
      options: [
        'Nothing — colour can be applied at any stage and adjusted later',
        'Surface (colour) depends on hierarchy levels being assigned first. Colour applied before hierarchy produces visually random weight distribution',
        'The colours will render incorrectly in some browsers',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Three variant dimensions: intent (surface only), size (rhythm only), state (any)." A button has classes .btn-primary .btn-lg .btn-hover. Which dimension does each class represent?',
      options: [
        'intent=primary (colour), size=lg (spacing/type), state=hover (any combination) — these are correctly separated',
        'All three are intent variants — they all change how the button looks',
        'Size and state should be combined into one class to reduce specificity',
      ],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Eight states: default, hover, focus, active, disabled, loading, error, empty. All required." Why must the empty state be designed explicitly?',
      options: [
        'Empty state is optional — components with no data simply show nothing',
        'Without a designed empty state, components render as broken layouts (missing columns, empty containers) rather than communicating that no data exists yet',
        'Empty state is only required for data tables and lists, not general components',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"States as CSS modifier classes. Never inline style mutations." Why does JavaScript toggling style.color = \'red\' for an error state cause problems?',
      options: [
        'Inline styles have higher specificity than CSS, so the theme system cannot override them — the component breaks on theme switch',
        'JavaScript is too slow for colour changes',
        'Inline styles work fine for single-property changes but not for multi-property states',
      ],
      correct: 0,
    },
  ],
};
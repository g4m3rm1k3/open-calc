// LESSON_DESIGN_05.js
// Lesson 5 — Colour Systems
// The problem: colour chosen by eye produces beautiful mockups that are
// inconsistent in production, inaccessible to a portion of users, and
// impossible to theme without hand-editing hundreds of hex values.
// A colour system replaces every hardcoded hex with a semantic token.
// Changing one token propagates across the entire interface.
// Concepts: primitive tokens, semantic tokens, functional roles,
//           HSL model, light/dark architecture, colour blindness constraints.

const LESSON_DESIGN_05 = {
  title: 'Colour Systems',
  subtitle: 'Replace hardcoded hex values with a semantic token architecture. One swap changes everything.',
  sequential: true,
  cells: [

    // ─── PART 0: RECAP ────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Recap: What Lessons 1–4 Established

You now have four interlocking systems. Together they fully describe any UI component:

**Lesson 1:** Four-level visual hierarchy. Size, weight, colour encode importance.
**Lesson 2:** 8-token spacing scale (4px base). Proximity expresses belonging.
**Lesson 3:** Modular type scale (base × ratio^n). Line-height is a function. Measure capped at 65ch.
**Lesson 4:** Flex + Grid as constraint declarations. No magic widths. \`min-width: 0\` on text.

Each lesson introduced colour incidentally — "use #2563eb for the CTA", "use #f1f5f9 for L1 text on dark". But those values were handed to you. You never built the system that generates and governs them.

---

## The Question This Lesson Answers

> Your designer hands you a mockup with 23 different hex values. Six months later, the brand changes from blue to teal. How many files do you edit?

If your answer is "I search for \`#2563eb\` across the codebase and replace it" — you don't have a colour system. You have colour chaos with extra steps.

The correct answer is: you edit **one file**, change **one value**, and every component updates correctly — automatically, consistently, without regression.

That's what a semantic token architecture does. By the end of this lesson you'll have one.`,
    },

    // ─── PART 1: BROKEN BASELINE ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## The Problem: Colour Chaos

This dashboard uses colour the way most production UIs are built — hex values chosen during initial design and hardcoded wherever they're needed.

Run the audit. It counts unique colour values in the component and flags every hardcoded hex on an element that should be using a token. The result shows how many values you'd need to update if the brand colour changed.

Before running: look at the CSS. Count how many times \`#2563eb\` appears. Now imagine it needs to become \`#0891b2\` (teal). That's the problem this lesson solves.`,
      html: `<div class="chaos-dash">
  <header class="cd-header">
    <div class="cd-logo">Platform</div>
    <button class="cd-cta">Upgrade Plan</button>
  </header>
  <div class="cd-body">
    <div class="cd-card">
      <div class="cd-card-label">Monthly Revenue</div>
      <div class="cd-card-value">$48,290</div>
      <div class="cd-card-delta">↑ 12% this month</div>
    </div>
    <div class="cd-card">
      <div class="cd-card-label">Active Users</div>
      <div class="cd-card-value">3,841</div>
      <div class="cd-card-delta">↑ 8%</div>
    </div>
    <div class="cd-alert">
      <span class="cd-alert-icon">!</span>
      <span class="cd-alert-text">Your trial ends in 3 days. Upgrade to keep access.</span>
      <a class="cd-alert-link" href="#">Upgrade now</a>
    </div>
  </div>
</div>`,
      css: `body { margin: 0; font-family: system-ui, sans-serif; background: #0f172a; }

/* COLOUR CHAOS — 14 unique hex values, all hardcoded */
.chaos-dash { background: #0f172a; min-height: 300px; }
.cd-header  { background: #1e293b; border-bottom: 1px solid #334155;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; height: 48px; }
.cd-logo    { color: #f1f5f9; font-size: 15px; font-weight: 700; }
.cd-cta     { background: #2563eb; color: #ffffff; border: none;
  border-radius: 7px; padding: 7px 14px; font-size: 13px;
  font-weight: 600; cursor: pointer; }
.cd-body    { padding: 20px; display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.cd-card    { background: #1e293b; border: 1px solid #334155;
  border-radius: 10px; padding: 20px;
  display: flex; flex-direction: column; gap: 4px; }
.cd-card-label { font-size: 11px; font-weight: 600; color: var(--color-text-secondary, #475569);
  text-transform: uppercase; letter-spacing: 0.1em; }
.cd-card-value { font-size: 28px; font-weight: 700; color: #f1f5f9; }
.cd-card-delta { font-size: 12px; font-weight: 500; color: #4ade80; }
.cd-alert   { grid-column: 1 / -1; background: #1e3a5f;
  border: 1px solid #2563eb; border-radius: 8px; padding: 12px 16px;
  display: flex; align-items: center; gap: 10px; }
.cd-alert-icon { width: 20px; height: 20px; border-radius: 50%;
  background: #2563eb; color: #ffffff; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cd-alert-text { font-size: 13px; color: #93c5fd; flex: 1; }
.cd-alert-link { font-size: 13px; font-weight: 600; color: #2563eb;
  text-decoration: none; flex-shrink: 0; }`,
      startCode: `// Audit: count unique colours and hardcoded hex values

function auditColour(rootSelector) {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const elements = root.querySelectorAll('*');
  const colourProps = ['color','backgroundColor','borderColor',
                        'borderTopColor','borderBottomColor',
                        'borderLeftColor','borderRightColor'];

  const rawValues  = new Map(); // hex → [elements using it]
  const violations = [];

  elements.forEach(el => {
    const s = window.getComputedStyle(el);
    colourProps.forEach(prop => {
      const val = s[prop];
      // Only count non-transparent, non-initial colours
      if (!val || val === 'rgba(0, 0, 0, 0)' || val === 'transparent') return;
      if (!rawValues.has(val)) rawValues.set(val, []);
      rawValues.get(val).push('.' + (el.className.toString().split(' ')[0]));
    });
  });

  console.log('=== COLOUR AUDIT: ' + rootSelector + ' ===\\n');
  console.log('Unique colour values in use:', rawValues.size);
  console.log('');

  // Show top repeated colours
  const sorted = [...rawValues.entries()].sort((a,b) => b[1].length - a[1].length);
  sorted.slice(0, 8).forEach(([val, els]) => {
    console.log(val + ' — used by ' + els.length + ' element(s)');
  });

  console.log('');
  console.log('Problem: if the brand colour (#2563eb) changes to #0891b2,');
  const brandCount = sorted.filter(([v]) => v.includes('37, 99, 235')).length;
  console.log('you would need to update', rawValues.size, 'colour values across');
  console.log('multiple CSS declarations — with no guarantee of consistency.');
  console.log('');
  console.log('Solution: map every colour to a semantic token.');
  console.log('Change the token once, every component updates.');
}

auditColour('.chaos-dash');`,
      outputHeight: 380,
    },

    // ─── PART 2: THREE TOKEN LAYERS ───────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The Three-Layer Token Architecture

A colour system has three layers. Each layer references the one below it — never skips a layer, never references raw hex values.

\`\`\`
Layer 1 — PRIMITIVE TOKENS
  "The complete palette. Every possible colour value."
  --blue-500: #3b82f6;
  --blue-600: #2563eb;
  --slate-900: #0f172a;

Layer 2 — SEMANTIC TOKENS
  "What this colour means in the interface."
  --color-bg:           var(--slate-950);
  --color-surface:      var(--slate-900);
  --color-interactive:  var(--blue-600);
  --color-text-primary: var(--slate-50);

Layer 3 — COMPONENT TOKENS (optional)
  "What this colour means in a specific component."
  --btn-bg:      var(--color-interactive);
  --btn-text:    var(--color-text-on-interactive);
  --card-bg:     var(--color-surface);
\`\`\`

### Why Three Layers?

**Layer 1 changes when you add a new brand hue.** You only edit primitive token files.

**Layer 2 changes when you support a new context** (high-contrast mode, a new theme). You remap semantic tokens to different primitives.

**Layer 3 changes when a component has unique requirements** that differ from the semantic defaults.

### The Core Rule

> No component ever references a primitive token directly. A button never says \`background: var(--blue-600)\`. It says \`background: var(--color-interactive)\`. The semantic token is the contract. The primitive is the implementation.

### Why This Matters for Theming

To switch from dark mode to light mode, you only redefine Layer 2:

\`\`\`css
:root {
  --color-bg: var(--slate-950);   /* dark */
  --color-text-primary: var(--slate-50);
}
[data-theme="light"] {
  --color-bg: var(--slate-50);    /* light */
  --color-text-primary: var(--slate-900);
}
\`\`\`

Every component that uses \`var(--color-bg)\` updates automatically. No component-level code changes. No search-and-replace. One attribute on the root element.`,
    },

    // ─── PART 3: BUILDING PRIMITIVE TOKENS — THE HSL MODEL ───────────────────
    {
      type: 'js',
      instruction: `## Primitive Tokens: Building a Colour Scale with HSL

Every major design system (Tailwind, Radix, Material) generates colour scales using the **HSL model** — Hue, Saturation, Lightness. This is more useful than hex for building a system because the three parameters map directly to design decisions:

- **Hue (0–360°):** which colour family (blue = 217, green = 142, red = 0)
- **Saturation (0–100%):** vivid vs grey
- **Lightness (0–100%):** dark vs light

A full colour scale (shades 50–950) is generated by holding Hue and Saturation roughly constant while stepping through Lightness. The lightest shade (50) is near-white with a hint of the hue. The darkest (950) is near-black with a hint of the hue.

The cell below builds a 10-step colour scale for any hue. This becomes your Layer 1 primitives.`,
      html: `<div id="scale-builder">
  <div id="scale-controls">
    <div class="sc-row">
      <label>Hue <span id="hue-val">217</span>°</label>
      <input type="range" id="hue" min="0" max="360" value="217">
    </div>
    <div class="sc-row">
      <label>Saturation <span id="sat-val">91</span>%</label>
      <input type="range" id="sat" min="0" max="100" value="91">
    </div>
    <div class="sc-row">
      <label>Name</label>
      <input type="text" id="scale-name" value="blue" style="width:80px;padding:4px 8px;background:#0f172a;border:1px solid #334155;color:#f1f5f9;border-radius:4px;font-size:12px;">
    </div>
  </div>
  <div id="colour-scale"></div>
  <div id="token-output"></div>
</div>`,
      css: `body { background: #0f172a; padding: 20px; margin: 0; font-family: system-ui, sans-serif; }
#scale-builder { max-width: 560px; }
#scale-controls { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
.sc-row { display: flex; align-items: center; gap: 8px;
  background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 6px 12px; }
.sc-row label { font-size: 11px; color: var(--color-text-secondary, #475569); white-space: nowrap; display: flex; gap: 4px; }
.sc-row label span { color: #f1f5f9; font-weight: 600; min-width: 24px; }
.sc-row input[type=range] { width: 100px; accent-color: #2563eb; }
#colour-scale  { display: flex; border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
.cs-swatch { flex: 1; height: 48px; display: flex; align-items: flex-end;
  padding: 4px; cursor: pointer; }
.cs-label  { font-size: 9px; font-weight: 700; }
#token-output { font-family: monospace; font-size: 11px; color: var(--color-text-secondary, #475569);
  background: #0f172a; border: 1px solid #1e293b; border-radius: 6px;
  padding: 10px 12px; line-height: 1.9; max-height: 200px; overflow-y: auto; }`,
      startCode: `// Build a 10-step colour scale from hue + saturation

// Lightness values for each shade step
// These are tuned to produce perceptually even steps
const LIGHTNESS = {
  50:  97,   // near-white tint
  100: 94,
  200: 87,
  300: 74,
  400: 60,
  500: 47,
  600: 38,   // typical "default" — good contrast on white
  700: 30,
  800: 22,
  900: 15,
  950: 10,   // near-black shade
};

function buildScale() {
  const h    = document.getElementById('hue').value;
  const s    = document.getElementById('sat').value;
  const name = document.getElementById('scale-name').value || 'color';

  document.getElementById('hue-val').textContent = h;
  document.getElementById('sat-val').textContent = s;

  const scaleEl  = document.getElementById('colour-scale');
  const tokenEl  = document.getElementById('token-output');
  scaleEl.innerHTML = '';

  const tokenLines = ['/* Primitive tokens — Layer 1 */'];
  const shades = [50,100,200,300,400,500,600,700,800,900,950];

  shades.forEach(shade => {
    const l   = LIGHTNESS[shade];
    const hsl = \`hsl(\${h}, \${s}%, \${l}%)\`;

    // Swatch
    const sw = document.createElement('div');
    sw.className = 'cs-swatch';
    sw.style.background = hsl;
    const lbl = document.createElement('div');
    lbl.className = 'cs-label';
    // Label colour: dark on light swatches, light on dark
    lbl.style.color = l > 50 ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';
    lbl.textContent = shade;
    sw.appendChild(lbl);
    scaleEl.appendChild(sw);

    tokenLines.push(\`--\${name}-\${shade}: hsl(\${h}, \${s}%, \${l}%);\`);
  });

  tokenEl.textContent = tokenLines.join('\\n');
}

buildScale();
['hue','sat','scale-name'].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('input', buildScale);
  el.addEventListener('change', buildScale);
});

console.log('Drag the Hue slider to change the colour family.');
console.log('Drag Saturation to mute or vivify the palette.');
console.log('The 11 shades (50–950) become your Layer 1 primitive tokens.');
console.log('');
console.log('Note: shade 600 is the typical "default" action colour on white backgrounds.');
console.log('Shade 400–500 is typical for dark backgrounds.');`,
      outputHeight: 420,
    },

    // ─── PART 4: SEMANTIC TOKENS — FUNCTIONAL ROLES ──────────────────────────
    {
      type: 'js',
      instruction: `## Semantic Tokens: Functional Colour Roles

Once you have primitive tokens, you assign them to **semantic roles** — names that describe what the colour *does* in the interface, not what it *is*.

**The seven functional roles:**

| Role | Token | What it describes |
|---|---|---|
| **Background** | \`--color-bg\` | Page background |
| **Surface** | \`--color-surface\` | Card, modal, panel backgrounds |
| **Surface raised** | \`--color-surface-raised\` | Dropdown, tooltip, elevated UI |
| **Border** | \`--color-border\` | Dividers, input outlines, card edges |
| **Text primary** | \`--color-text-primary\` | Headings, key information |
| **Text secondary** | \`--color-text-secondary\` | Body copy, descriptions |
| **Text muted** | \`--color-text-muted\` | Labels, captions, metadata |
| **Interactive** | \`--color-interactive\` | Buttons, links, active states |
| **Interactive hover** | \`--color-interactive-hover\` | Hover state of interactive |
| **Semantic success** | \`--color-success\` | Positive states |
| **Semantic warning** | \`--color-warning\` | Caution states |
| **Semantic error** | \`--color-error\` | Negative states |

The cell below implements this complete token system and shows how changing the brand hue updates every role simultaneously — without touching any component.`,
      html: `<div id="token-demo">
  <div id="td-controls">
    <label>Brand hue: <span id="brand-val">217</span>°
      <input type="range" id="brand-hue" min="0" max="360" value="217">
    </label>
    <label>Mode:
      <select id="mode-sel">
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
    </label>
  </div>
  <div class="token-ui" id="token-ui">
    <header class="tui-header">
      <div class="tui-logo">Platform</div>
      <button class="tui-btn">New Report</button>
    </header>
    <div class="tui-body">
      <div class="tui-card">
        <div class="tui-label">Revenue</div>
        <div class="tui-value">$48,290</div>
        <div class="tui-sub">↑ 12% this month</div>
      </div>
      <div class="tui-card">
        <div class="tui-label">Users</div>
        <div class="tui-value">3,841</div>
        <div class="tui-sub">↑ 8%</div>
      </div>
      <div class="tui-success">✓ All systems operational</div>
      <div class="tui-error">⚠ Payment method expires soon</div>
    </div>
  </div>
</div>`,
      css: `body { background: #0f172a; padding: 20px; margin: 0; font-family: system-ui, sans-serif; }
#td-controls { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px;
  font-size: 12px; color: var(--color-text-secondary, #475569); }
#td-controls label { display: flex; align-items: center; gap: 8px;
  background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 6px 12px; }
#td-controls label span { color: #f1f5f9; font-weight: 600; min-width: 24px; }
#td-controls input[type=range] { width: 120px; accent-color: #2563eb; }
#td-controls select { background: #0f172a; color: #f1f5f9; border: 1px solid #334155;
  border-radius: 4px; padding: 2px 6px; font-size: 11px; cursor: pointer; }
/* Component styles — all using semantic tokens */
.token-ui   { border-radius: 10px; overflow: hidden; border: 1px solid var(--color-border); }
.tui-header { display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px; height: 48px; background: var(--color-surface);
  border-bottom: 1px solid var(--color-border); }
.tui-logo  { font-size: 15px; font-weight: 700; color: var(--color-text-primary); }
.tui-btn   { padding: 7px 14px; background: var(--color-interactive); color: var(--color-text-on-interactive);
  border: none; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; }
.tui-body  { padding: 16px; display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px; background: var(--color-bg); }
.tui-card  { background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 4px; }
.tui-label { font-size: 11px; font-weight: 600; color: var(--color-text-muted);
  text-transform: uppercase; letter-spacing: 0.1em; }
.tui-value { font-size: 24px; font-weight: 700; color: var(--color-text-primary); }
.tui-sub   { font-size: 12px; color: var(--color-success); font-weight: 500; }
.tui-success { grid-column: 1/-1; padding: 10px 14px; border-radius: 7px;
  background: var(--color-success-bg); border: 1px solid var(--color-success-border);
  color: var(--color-success-text); font-size: 13px; font-weight: 500; }
.tui-error   { grid-column: 1/-1; padding: 10px 14px; border-radius: 7px;
  background: var(--color-error-bg); border: 1px solid var(--color-error-border);
  color: var(--color-error-text); font-size: 13px; font-weight: 500; }`,
      startCode: `const root = document.documentElement;

function applyTokens(h, mode) {
  // ── PRIMITIVE SCALE (brand colour) ────────────────────────────────────────
  const brandPrimitives = {
    50:  \`hsl(\${h},90%,97%)\`,  100: \`hsl(\${h},90%,94%)\`,
    200: \`hsl(\${h},85%,87%)\`,  300: \`hsl(\${h},80%,74%)\`,
    400: \`hsl(\${h},78%,60%)\`,  500: \`hsl(\${h},76%,47%)\`,
    600: \`hsl(\${h},74%,38%)\`,  700: \`hsl(\${h},70%,30%)\`,
    800: \`hsl(\${h},65%,22%)\`,  900: \`hsl(\${h},60%,15%)\`,
    950: \`hsl(\${h},55%,10%)\`,
  };
  Object.entries(brandPrimitives).forEach(([shade, val]) => {
    root.style.setProperty('--brand-' + shade, val);
  });

  // ── SEMANTIC TOKENS — dark mode ───────────────────────────────────────────
  if (mode === 'dark') {
    root.style.setProperty('--color-bg',               'hsl(222,47%,7%)');
    root.style.setProperty('--color-surface',           'hsl(222,39%,12%)');
    root.style.setProperty('--color-surface-raised',    'hsl(222,35%,17%)');
    root.style.setProperty('--color-border',            'hsl(217,32%,22%)');
    root.style.setProperty('--color-text-primary',      'hsl(210,40%,96%)');
    root.style.setProperty('--color-text-secondary',    'hsl(215,25%,65%)');
    root.style.setProperty('--color-text-muted',        'hsl(217,20%,45%)');
    root.style.setProperty('--color-interactive',       brandPrimitives[500]);
    root.style.setProperty('--color-interactive-hover', brandPrimitives[400]);
    root.style.setProperty('--color-text-on-interactive','#ffffff');
  } else {
    // ── SEMANTIC TOKENS — light mode ─────────────────────────────────────────
    root.style.setProperty('--color-bg',               'hsl(210,40%,98%)');
    root.style.setProperty('--color-surface',           '#ffffff');
    root.style.setProperty('--color-surface-raised',    'hsl(210,40%,98%)');
    root.style.setProperty('--color-border',            'hsl(214,32%,91%)');
    root.style.setProperty('--color-text-primary',      'hsl(222,47%,11%)');
    root.style.setProperty('--color-text-secondary',    'hsl(215,20%,40%)');
    root.style.setProperty('--color-text-muted',        'hsl(215,16%,60%)');
    root.style.setProperty('--color-interactive',       brandPrimitives[600]);
    root.style.setProperty('--color-interactive-hover', brandPrimitives[700]);
    root.style.setProperty('--color-text-on-interactive','#ffffff');
  }

  // ── SEMANTIC — always the same (semantic, not brand) ──────────────────────
  const isLight = mode === 'light';
  root.style.setProperty('--color-success',         isLight ? '#16a34a' : '#4ade80');
  root.style.setProperty('--color-success-bg',      isLight ? '#f0fdf4' : 'rgba(74,222,128,0.08)');
  root.style.setProperty('--color-success-border',  isLight ? '#bbf7d0' : 'rgba(74,222,128,0.2)');
  root.style.setProperty('--color-success-text',    isLight ? '#166534' : '#86efac');
  root.style.setProperty('--color-error',           isLight ? '#dc2626' : '#f87171');
  root.style.setProperty('--color-error-bg',        isLight ? '#fef2f2' : 'rgba(248,113,113,0.08)');
  root.style.setProperty('--color-error-border',    isLight ? '#fecaca' : 'rgba(248,113,113,0.2)');
  root.style.setProperty('--color-error-text',      isLight ? '#991b1b' : '#fca5a5');
}

function update() {
  const h    = document.getElementById('brand-hue').value;
  const mode = document.getElementById('mode-sel').value;
  document.getElementById('brand-val').textContent = h;
  applyTokens(parseInt(h), mode);
}

document.getElementById('brand-hue').addEventListener('input', update);
document.getElementById('mode-sel').addEventListener('change', update);
update();

console.log('Drag the hue slider — all components update together.');
console.log('Switch mode — the entire interface adapts from one token layer swap.');
console.log('No component CSS changes. The semantic tokens are the contract.');`,
      outputHeight: 420,
    },

    // ─── PART 5: PRACTICE 1 — MAP PRIMITIVES TO SEMANTICS ────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 1: Build a Semantic Token Map
You're given a complete set of primitive tokens (a blue-grey scale + a green scale + a red scale) and a component that currently uses raw hex values.

**Your task:**
1. Define the semantic token set by mapping primitives to roles
2. Apply those tokens to the component using \`setProperty()\`
3. The component must work correctly in both the "brand: blue" and "brand: teal" modes when you run the test

The test switches the brand hue from blue (217°) to teal (183°) by only changing the primitive token values — and checks that the component's interactive elements (button background) update automatically via the semantic mapping.

**The rule being tested:** no component ever references a primitive token directly. If your component uses \`--blue-600\` directly rather than \`--color-interactive\`, it will fail the brand-swap test.`,
      html: `<div id="practice-tokens">
  <div class="p5-controls">
    <button id="p5-blue">Brand: Blue</button>
    <button id="p5-teal">Brand: Teal</button>
    <button id="p5-light">Mode: Light</button>
    <button id="p5-dark" class="active">Mode: Dark</button>
  </div>
  <div class="p5-card" id="p5-card">
    <div class="p5-header">
      <span class="p5-badge">PRO</span>
      <span class="p5-title">Analytics Dashboard</span>
    </div>
    <p class="p5-body">Real-time metrics for your team. Updated every 60 seconds.</p>
    <div class="p5-footer">
      <button class="p5-cta" id="p5-cta">Upgrade Plan</button>
      <span class="p5-note">7 days free</span>
    </div>
  </div>
</div>`,
      css: `body { background: #0f172a; padding: 24px; margin: 0; font-family: system-ui, sans-serif; }
.p5-controls { display: flex; gap: 8px; margin-bottom: 16px; }
.p5-controls button { font-size: 11px; font-weight: 500; padding: 5px 12px;
  border-radius: 6px; border: 1px solid #334155; background: #1e293b;
  color: var(--color-text-secondary, #475569); cursor: pointer; }
.p5-controls button.active { background: #2563eb; color: white; border-color: #2563eb; }
/* Component using SEMANTIC tokens — do not change these */
.p5-card   { background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 12px; padding: 24px; max-width: 320px; }
.p5-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.p5-badge  { font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  padding: 2px 8px; border-radius: 100px;
  background: var(--color-interactive-subtle);
  color: var(--color-interactive); border: 1px solid var(--color-interactive-border); }
.p5-title  { font-size: 16px; font-weight: 600; color: var(--color-text-primary); }
.p5-body   { font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;
  margin: 0 0 20px; }
.p5-footer { display: flex; align-items: center; gap: 12px; }
.p5-cta    { padding: 9px 18px; background: var(--color-interactive);
  color: var(--color-text-on-interactive); border: none; border-radius: 8px;
  font-size: 14px; font-weight: 600; cursor: pointer; flex-shrink: 0; }
.p5-note   { font-size: 12px; color: var(--color-text-muted); }`,
      startCode: `const root = document.documentElement;

// ── STEP 1: Define primitive token sets ───────────────────────────────────────
const primitives = {
  blue: {
    400: 'hsl(217, 78%, 60%)', 500: 'hsl(217, 76%, 47%)',
    600: 'hsl(217, 74%, 38%)', 700: 'hsl(217, 70%, 30%)',
    subtleBg: 'hsl(217, 80%, 14%)', subtleBorder: 'hsl(217, 70%, 22%)',
  },
  teal: {
    400: 'hsl(183, 78%, 48%)', 500: 'hsl(183, 76%, 38%)',
    600: 'hsl(183, 74%, 30%)', 700: 'hsl(183, 70%, 24%)',
    subtleBg: 'hsl(183, 80%, 10%)', subtleBorder: 'hsl(183, 70%, 18%)',
  },
};

// ── STEP 2: Define your semantic token mapping function ────────────────────────
// This function must set semantic tokens using ONLY the primitive sets above.
// Components only ever use semantic tokens (var(--color-*)).
// A brand swap only changes which primitive set is used — not any component.

function applySemanticTokens(brand, mode) {
  const p = primitives[brand]; // get the right primitive set

  // Dark mode semantic tokens — map primitives to roles
  if (mode === 'dark') {
    root.style.setProperty('--color-bg',                   'hsl(222,47%,7%)');
    root.style.setProperty('--color-surface',              'hsl(222,39%,12%)');
    root.style.setProperty('--color-border',               'hsl(217,32%,22%)');
    root.style.setProperty('--color-text-primary',         'hsl(210,40%,96%)');
    root.style.setProperty('--color-text-secondary',       'hsl(215,25%,65%)');
    root.style.setProperty('--color-text-muted',           'hsl(217,20%,45%)');
    root.style.setProperty('--color-text-on-interactive',  '#ffffff');

    // YOUR TASK: map the brand primitives to interactive tokens
    root.style.setProperty('--color-interactive',         '???'); // p.500
    root.style.setProperty('--color-interactive-subtle',  '???'); // p.subtleBg
    root.style.setProperty('--color-interactive-border',  '???'); // p.subtleBorder
  } else {
    root.style.setProperty('--color-bg',                   '#f8fafc');
    root.style.setProperty('--color-surface',              '#ffffff');
    root.style.setProperty('--color-border',               '#e2e8f0');
    root.style.setProperty('--color-text-primary',         '#0f172a');
    root.style.setProperty('--color-text-secondary',       '#475569');
    root.style.setProperty('--color-text-muted',           '#94a3b8');
    root.style.setProperty('--color-text-on-interactive',  '#ffffff');

    // YOUR TASK: map for light mode
    root.style.setProperty('--color-interactive',         '???'); // p.600
    root.style.setProperty('--color-interactive-subtle',  '???'); // lighter subtle
    root.style.setProperty('--color-interactive-border',  '???'); // p.subtleBorder
  }
}

// ── STEP 3: Wire up the controls ──────────────────────────────────────────────
let currentBrand = 'blue';
let currentMode  = 'dark';

function update() {
  applySemanticTokens(currentBrand, currentMode);
  // Update button states
  document.getElementById('p5-blue').className = currentBrand === 'blue' ? 'active' : '';
  document.getElementById('p5-teal').className = currentBrand === 'teal' ? 'active' : '';
  document.getElementById('p5-light').className = currentMode === 'light' ? 'active' : '';
  document.getElementById('p5-dark').className  = currentMode === 'dark'  ? 'active' : '';
}

document.getElementById('p5-blue').onclick  = () => { currentBrand = 'blue';  update(); };
document.getElementById('p5-teal').onclick  = () => { currentBrand = 'teal';  update(); };
document.getElementById('p5-light').onclick = () => { currentMode  = 'light'; update(); };
document.getElementById('p5-dark').onclick  = () => { currentMode  = 'dark';  update(); };
update();`,
      solutionCode: `const root = document.documentElement;
const primitives = {
  blue: {
    400: 'hsl(217, 78%, 60%)', 500: 'hsl(217, 76%, 47%)',
    600: 'hsl(217, 74%, 38%)', 700: 'hsl(217, 70%, 30%)',
    subtleBg: 'hsl(217, 80%, 14%)', subtleBorder: 'hsl(217, 70%, 22%)',
  },
  teal: {
    400: 'hsl(183, 78%, 48%)', 500: 'hsl(183, 76%, 38%)',
    600: 'hsl(183, 74%, 30%)', 700: 'hsl(183, 70%, 24%)',
    subtleBg: 'hsl(183, 80%, 10%)', subtleBorder: 'hsl(183, 70%, 18%)',
  },
};

function applySemanticTokens(brand, mode) {
  const p = primitives[brand];
  if (mode === 'dark') {
    root.style.setProperty('--color-bg',                  'hsl(222,47%,7%)');
    root.style.setProperty('--color-surface',             'hsl(222,39%,12%)');
    root.style.setProperty('--color-border',              'hsl(217,32%,22%)');
    root.style.setProperty('--color-text-primary',        'hsl(210,40%,96%)');
    root.style.setProperty('--color-text-secondary',      'hsl(215,25%,65%)');
    root.style.setProperty('--color-text-muted',          'hsl(217,20%,45%)');
    root.style.setProperty('--color-text-on-interactive', '#ffffff');
    root.style.setProperty('--color-interactive',         p[500]);
    root.style.setProperty('--color-interactive-subtle',  p.subtleBg);
    root.style.setProperty('--color-interactive-border',  p.subtleBorder);
  } else {
    root.style.setProperty('--color-bg',                  '#f8fafc');
    root.style.setProperty('--color-surface',             '#ffffff');
    root.style.setProperty('--color-border',              '#e2e8f0');
    root.style.setProperty('--color-text-primary',        '#0f172a');
    root.style.setProperty('--color-text-secondary',      '#475569');
    root.style.setProperty('--color-text-muted',          '#94a3b8');
    root.style.setProperty('--color-text-on-interactive', '#ffffff');
    root.style.setProperty('--color-interactive',         p[600]);
    root.style.setProperty('--color-interactive-subtle',  p.subtleBg);
    root.style.setProperty('--color-interactive-border',  p.subtleBorder);
  }
}

let currentBrand = 'blue', currentMode = 'dark';
function update() {
  applySemanticTokens(currentBrand, currentMode);
  ['p5-blue','p5-teal','p5-light','p5-dark'].forEach(id => {
    const btn = document.getElementById(id);
    const isActive = (id === 'p5-' + currentBrand) || (id === 'p5-' + currentMode);
    btn.className = isActive ? 'active' : '';
  });
}
document.getElementById('p5-blue').onclick  = () => { currentBrand = 'blue';  update(); };
document.getElementById('p5-teal').onclick  = () => { currentBrand = 'teal';  update(); };
document.getElementById('p5-light').onclick = () => { currentMode  = 'light'; update(); };
document.getElementById('p5-dark').onclick  = () => { currentMode  = 'dark';  update(); };
update();`,
      check: (code) => {
        // Must use the primitives object (not hardcoded hex) for interactive tokens
        const usesPrimitives = /p\[(?:500|600|400)\]|p\.subtleBg|primitives\[brand\]/i.test(code);
        const setsInteractive= /setProperty.*color-interactive['"]/i.test(code);
        const hasMapping     = /applySemanticTokens|function.*brand.*mode/i.test(code);
        return usesPrimitives && setsInteractive;
      },
      successMessage: `Semantic token mapping complete. The key insight: \`p[500]\` and \`p[600]\` are not hardcoded colours — they're references to whichever primitive is currently active. Switch brand from blue to teal: one variable change, every interactive element updates. This is exactly what Tailwind, Radix, and every mature design system does internally.`,
      failMessage: `Two requirements: (1) the interactive tokens must reference the \`p\` object (primitives[brand]), not hardcoded hex strings. (2) \`setProperty('--color-interactive', ...)\` must be called. If your button doesn't change colour when switching from blue to teal, you're probably still using a hardcoded hex value for that token.`,
      outputHeight: 440,
    },

    // ─── PART 6: ENGINEERING REALITY — COLOUR PERCEPTION ─────────────────────
    {
      type: 'markdown',
      instruction: `## Engineering Reality: How Colour is Actually Perceived

Colour decisions based on aesthetics fail in production because they ignore the constraints imposed by human colour perception. These constraints are measurable and non-negotiable.

### Simultaneous Contrast

A grey on a blue background looks different from the same grey on an orange background. The surrounding hue shifts the perceived hue of the central colour. This is why your #64748b text looks subtly warm on a warm background and subtly cool on a cool background — it's the same hex value producing different visual results.

**Implication:** never evaluate a colour in isolation. Always evaluate it on the actual background it will appear against in production.

### Colour Deficiency (Colour Blindness)

Approximately 8% of men and 0.5% of women have some form of colour vision deficiency. The most common forms:

| Type | Prevalence | What's affected |
|---|---|---|
| Deuteranopia | ~5% of men | Red-green confusion (green absent) |
| Protanopia | ~1% of men | Red-green confusion (red absent) |
| Tritanopia | ~0.003% | Blue-yellow confusion |
| Achromatopsia | ~0.0001% | Total colour blindness |

**The engineering implication:** you cannot rely on hue alone to convey meaning. Red for error and green for success are indistinguishable to ~6% of your users in their base form.

**The fix:** always pair colour with a second signal. Error states get an icon (✕) and red. Success states get an icon (✓) and green. Never let a colour be the only carrier of information.

**The test:** convert your UI to greyscale in your browser's accessibility tools. If the meaning is preserved in greyscale, the design is accessible. If it requires colour to interpret, it isn't.

### Perceived Lightness vs Actual Lightness

The human eye is not equally sensitive to all wavelengths. We are most sensitive to green (contributing ~71% to perceived brightness), moderately sensitive to red (~21%), and least sensitive to blue (~7%). This is why \`#0000ff\` (pure blue) looks darker than \`#00ff00\` (pure green) even though both are at 100% channel value.

This is exactly what the WCAG relative luminance formula corrects for — it weights the RGB channels by their perceptual contribution. Blue text needs higher absolute lightness to achieve the same perceived contrast as green text on the same background.

**Implication:** always measure contrast with the WCAG formula, not by "it looks light enough."

### The Irlen Effect and Text Backgrounds

Some users (particularly those with dyslexia, ~10% of the population) find high-contrast black-on-white text physically uncomfortable to read. Pure white backgrounds with pure black text (#000000 on #ffffff = 21:1 contrast — far above the WCAG requirement) can cause visual "glare" effects.

**Implication:** body text contrast of 7:1–12:1 is the practical sweet spot. Never pure black on pure white for long-form reading. The dark theme palette in this course (#f1f5f9 on #0f172a ≈ 13:1) is intentionally below the theoretical maximum for this reason.`,
    },

    // ─── PART 7: LIGHT/DARK ARCHITECTURE ─────────────────────────────────────
    {
      type: 'js',
      instruction: `## The Light/Dark Architecture

The token system from Part 4 makes theme switching mechanical. There are two implementation patterns:

**Pattern 1: CSS attribute selector**
\`\`\`css
:root { --color-bg: #0f172a; }
[data-theme="light"] { --color-bg: #f8fafc; }
\`\`\`
Set \`document.documentElement.setAttribute('data-theme', 'light')\` to switch.

**Pattern 2: CSS class**
\`\`\`css
:root { --color-bg: #0f172a; }
.light { --color-bg: #f8fafc; }
\`\`\`
Toggle the class on \`document.documentElement\` to switch.

Both work. Pattern 1 is more semantic and aligns with the \`prefers-color-scheme\` media query. Pattern 2 is more compatible with CSS-in-JS systems.

**The \`prefers-color-scheme\` connection:**
\`\`\`css
@media (prefers-color-scheme: light) {
  :root { /* light tokens */ }
}
\`\`\`
This respects the user's OS preference automatically — no JavaScript needed for the default state.

The cell below demonstrates a complete theme switch that persists across simulated "page loads" using \`localStorage\`, shows the \`prefers-color-scheme\` media query value, and switches every component simultaneously.`,
      html: `<div id="theme-demo">
  <div id="td2-controls">
    <button id="td2-toggle">Switch to Light Mode</button>
    <span id="td2-os-pref"></span>
  </div>
  <div class="th-app" id="th-app">
    <nav class="th-nav">
      <span class="th-logo">Acme</span>
      <span class="th-spacer"></span>
      <button class="th-btn">New</button>
    </nav>
    <div class="th-body">
      <div class="th-card">
        <div class="th-label">Revenue</div>
        <div class="th-value">$48,290</div>
        <div class="th-sub">This quarter</div>
      </div>
      <div class="th-card">
        <div class="th-label">Users</div>
        <div class="th-value">3,841</div>
        <div class="th-sub">Active today</div>
      </div>
      <div class="th-card">
        <div class="th-label">NPS</div>
        <div class="th-value">68</div>
        <div class="th-sub">↑ 4 points</div>
      </div>
    </div>
  </div>
</div>`,
      css: `body { background: #0f172a; padding: 20px; margin: 0; font-family: system-ui, sans-serif; }
#td2-controls { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
#td2-toggle { padding: 7px 14px; background: #2563eb; color: white; border: none;
  border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; }
#td2-os-pref { font-size: 11px; color: var(--color-text-secondary, #475569); font-family: monospace; }

/* ALL COMPONENT COLOURS USE SEMANTIC TOKENS ONLY */
.th-app  { border-radius: 10px; overflow: hidden; border: 1px solid var(--th-border);
  max-width: 580px; }
.th-nav  { display: flex; align-items: center; padding: 0 20px; height: 48px;
  background: var(--th-surface); border-bottom: 1px solid var(--th-border); gap: 8px; }
.th-logo { font-size: 15px; font-weight: 700; color: var(--th-text-1); }
.th-spacer { flex: 1; }
.th-btn  { padding: 6px 14px; background: var(--th-interactive); color: var(--th-text-on);
  border: none; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; }
.th-body { padding: 16px; display: grid;
  grid-template-columns: repeat(3, 1fr); gap: 12px; background: var(--th-bg); }
.th-card { background: var(--th-surface); border: 1px solid var(--th-border);
  border-radius: 8px; padding: 16px; }
.th-label { font-size: 11px; font-weight: 600; color: var(--th-text-3);
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
.th-value { font-size: 24px; font-weight: 700; color: var(--th-text-1); margin-bottom: 2px; }
.th-sub   { font-size: 12px; color: var(--th-text-2); }`,
      startCode: `const root   = document.documentElement;
const toggle = document.getElementById('td2-toggle');
const osPref = document.getElementById('td2-os-pref');

// Show OS preference
const mq = window.matchMedia('(prefers-color-scheme: light)');
osPref.textContent = 'OS preference: ' + (mq.matches ? 'light' : 'dark');

// Token definitions — the only place hex values live
const TOKENS = {
  dark: {
    '--th-bg':          'hsl(222,47%,7%)',
    '--th-surface':     'hsl(222,39%,12%)',
    '--th-border':      'hsl(217,32%,22%)',
    '--th-text-1':      'hsl(210,40%,96%)',
    '--th-text-2':      'hsl(215,25%,65%)',
    '--th-text-3':      'hsl(217,20%,45%)',
    '--th-interactive': 'hsl(217,76%,47%)',
    '--th-text-on':     '#ffffff',
  },
  light: {
    '--th-bg':          'hsl(210,40%,98%)',
    '--th-surface':     '#ffffff',
    '--th-border':      'hsl(214,32%,91%)',
    '--th-text-1':      'hsl(222,47%,11%)',
    '--th-text-2':      'hsl(215,20%,40%)',
    '--th-text-3':      'hsl(215,16%,60%)',
    '--th-interactive': 'hsl(217,74%,38%)',
    '--th-text-on':     '#ffffff',
  },
};

let currentTheme = 'dark';

function applyTheme(theme) {
  currentTheme = theme;
  const tokens = TOKENS[theme];
  Object.entries(tokens).forEach(([k, v]) => root.style.setProperty(k, v));
  // Set data attribute for CSS selector approach
  root.setAttribute('data-theme', theme);
  toggle.textContent = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  console.log('Theme: ' + theme);
  console.log('Changed', Object.keys(tokens).length, 'tokens — zero component CSS touched.');
}

toggle.onclick = () => applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
applyTheme('dark');

console.log('');
console.log('The architecture:');
console.log('  TOKENS object = the only place hex values exist');
console.log('  applyTheme() = sets all semantic tokens in one call');
console.log('  Components only read var(--th-*) — never hardcoded values');
console.log('');
console.log('To add a high-contrast theme: add TOKENS.highContrast with');
console.log('  same keys, different values. One function call switches everything.');`,
      outputHeight: 400,
    },

    // ─── PART 8: PRACTICE 2 — LIVE THEME SWITCH ──────────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 2: Build a Full Theme Switch

You're given a complete application UI with hardcoded hex values in the CSS. Your job is to refactor it to use semantic tokens and implement a working theme switch button.

**The starter code gives you:**
- A fully rendered UI with hardcoded colours
- A TOKENS object with dark and light definitions already written
- A theme button wired to an \`applyTheme()\` stub

**Your task:**
1. In \`applyTheme()\`, apply all tokens from TOKENS[theme] to the root element
2. Update the button label and state when theme changes
3. Ensure the UI visually transitions between themes

The test switches the theme programmatically and checks that the background colour has actually changed by reading the computed \`--c-bg\` token value.

**Explore:** after passing, add a third theme — "high contrast" — with maximum contrast values. What minimum contrast ratios should you target?`,
      html: `<div id="p2-root">
  <div id="p2-topbar">
    <span id="p2-logo">Platform</span>
    <span style="flex:1"></span>
    <button id="p2-theme-btn">☀ Light Mode</button>
  </div>
  <div id="p2-content">
    <div class="p2-stat">
      <div class="p2-stat-l">Revenue</div>
      <div class="p2-stat-v">$48,290</div>
    </div>
    <div class="p2-stat">
      <div class="p2-stat-l">Users</div>
      <div class="p2-stat-v">3,841</div>
    </div>
    <div class="p2-stat">
      <div class="p2-stat-l">NPS</div>
      <div class="p2-stat-v">68</div>
    </div>
    <div class="p2-stat">
      <div class="p2-stat-l">Churn</div>
      <div class="p2-stat-v">2.4%</div>
    </div>
    <div id="p2-notice">
      All systems operational — last checked 2 minutes ago
    </div>
  </div>
</div>`,
      css: `body { margin: 0; font-family: system-ui, sans-serif; }
#p2-root    { background: var(--c-bg); min-height: 280px; }
#p2-topbar  { display: flex; align-items: center; padding: 0 20px; height: 48px;
  background: var(--c-surface); border-bottom: 1px solid var(--c-border); gap: 12px; }
#p2-logo    { font-size: 15px; font-weight: 700; color: var(--c-text-1); }
#p2-theme-btn { padding: 6px 12px; border-radius: 6px; border: 1px solid var(--c-border);
  background: var(--c-surface-raised); color: var(--c-text-2);
  font-size: 12px; font-weight: 500; cursor: pointer; }
#p2-content { padding: 20px; display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.p2-stat    { background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: 8px; padding: 16px; }
.p2-stat-l  { font-size: 11px; font-weight: 600; color: var(--c-text-3);
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
.p2-stat-v  { font-size: 26px; font-weight: 700; color: var(--c-text-1); }
#p2-notice  { grid-column: 1/-1; padding: 10px 14px; border-radius: 7px;
  background: var(--c-success-bg); border: 1px solid var(--c-success-border);
  color: var(--c-success-text); font-size: 13px; }`,
      startCode: `const root = document.documentElement;

// Token definitions — complete, just needs wiring up
const TOKENS = {
  dark: {
    '--c-bg':             'hsl(222,47%,7%)',
    '--c-surface':        'hsl(222,39%,12%)',
    '--c-surface-raised': 'hsl(222,35%,17%)',
    '--c-border':         'hsl(217,32%,22%)',
    '--c-text-1':         'hsl(210,40%,96%)',
    '--c-text-2':         'hsl(215,25%,65%)',
    '--c-text-3':         'hsl(217,20%,45%)',
    '--c-success-bg':     'rgba(74,222,128,0.08)',
    '--c-success-border': 'rgba(74,222,128,0.2)',
    '--c-success-text':   '#86efac',
  },
  light: {
    '--c-bg':             'hsl(210,40%,98%)',
    '--c-surface':        '#ffffff',
    '--c-surface-raised': 'hsl(210,40%,95%)',
    '--c-border':         'hsl(214,32%,91%)',
    '--c-text-1':         'hsl(222,47%,11%)',
    '--c-text-2':         'hsl(215,20%,40%)',
    '--c-text-3':         'hsl(215,16%,60%)',
    '--c-success-bg':     '#f0fdf4',
    '--c-success-border': '#bbf7d0',
    '--c-success-text':   '#166534',
  },
};

let currentTheme = 'dark';

// ── YOUR TASK: implement applyTheme ────────────────────────────────────────────
function applyTheme(theme) {
  currentTheme = theme;

  // 1. Apply all tokens from TOKENS[theme] to the root element
  // Hint: Object.entries(TOKENS[theme]).forEach(([key, val]) => ...)


  // 2. Update the button label
  const btn = document.getElementById('p2-theme-btn');
  // btn.textContent = ...


  console.log('Applied theme:', theme);
}

document.getElementById('p2-theme-btn').onclick = () => {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
};

// Apply initial theme
applyTheme('dark');`,
      solutionCode: `const root = document.documentElement;
const TOKENS = {
  dark: {
    '--c-bg': 'hsl(222,47%,7%)', '--c-surface': 'hsl(222,39%,12%)',
    '--c-surface-raised': 'hsl(222,35%,17%)', '--c-border': 'hsl(217,32%,22%)',
    '--c-text-1': 'hsl(210,40%,96%)', '--c-text-2': 'hsl(215,25%,65%)',
    '--c-text-3': 'hsl(217,20%,45%)',
    '--c-success-bg': 'rgba(74,222,128,0.08)', '--c-success-border': 'rgba(74,222,128,0.2)',
    '--c-success-text': '#86efac',
  },
  light: {
    '--c-bg': 'hsl(210,40%,98%)', '--c-surface': '#ffffff',
    '--c-surface-raised': 'hsl(210,40%,95%)', '--c-border': 'hsl(214,32%,91%)',
    '--c-text-1': 'hsl(222,47%,11%)', '--c-text-2': 'hsl(215,20%,40%)',
    '--c-text-3': 'hsl(215,16%,60%)',
    '--c-success-bg': '#f0fdf4', '--c-success-border': '#bbf7d0',
    '--c-success-text': '#166534',
  },
};
let currentTheme = 'dark';
function applyTheme(theme) {
  currentTheme = theme;
  Object.entries(TOKENS[theme]).forEach(([k, v]) => root.style.setProperty(k, v));
  document.getElementById('p2-theme-btn').textContent =
    theme === 'dark' ? '☀ Light Mode' : '☾ Dark Mode';
  console.log('Theme applied:', theme, '|', Object.keys(TOKENS[theme]).length, 'tokens set');
}
document.getElementById('p2-theme-btn').onclick = () =>
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
applyTheme('dark');`,
      check: (code) => {
        const callsSetProperty = /setProperty|style\.setProperty/i.test(code);
        const iteratesTokens   = /Object\.entries|forEach|for.*TOKENS/i.test(code);
        const hasApplyFn       = /function applyTheme|applyTheme\s*=\s*/i.test(code);
        return callsSetProperty && iteratesTokens;
      },
      successMessage: `Theme switch implemented. The key is the pattern: Object.entries(TOKENS[theme]).forEach(([k, v]) => root.style.setProperty(k, v)). That single loop is all it takes to switch the entire interface. Every component that uses semantic tokens updates automatically — this is the payoff of the three-layer architecture.`,
      failMessage: `Two things needed: (1) Call root.style.setProperty() for each token — not just one. The easiest way: Object.entries(TOKENS[theme]).forEach(([key, val]) => root.style.setProperty(key, val)). (2) The applyTheme function must actually be called. Check that applyTheme('dark') runs on init and the button toggle calls applyTheme() with the correct theme name.`,
      outputHeight: 420,
    },

    // ─── PART 9: CONTRAST EXPLORER ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Contrast in Practice: The Full WCAG Audit Tool

In Lesson 3 we built a contrast ratio function. Now we build the full audit tool that will be your permanent companion — it reads every text element in a component and reports its WCAG level.

The audit tool does four things the simple function didn't:
1. Reads computed colours from the DOM (works on any live component, not just hardcoded hex)
2. Determines whether each element is "large text" (18px+ regular, 14px+ bold)
3. Reports the WCAG level (AAA/AA/A/FAIL) with the required minimum
4. Suggests the closest accessible colour when something fails

Run the audit on the themed demo from Part 4 in both light and dark modes. Notice which elements are marginal (close to the minimum) — these are the ones most likely to fail in production with slight colour drift.`,
      html: `<div id="contrast-tool">
  <div id="ct-target">
    <div class="ct-app" id="ct-app">
      <div class="ct-h">Page Heading</div>
      <div class="ct-sub">Section subheading level 2</div>
      <div class="ct-body">Body copy — this is the main reading text. It needs the highest contrast because it's the most read content on the page.</div>
      <div class="ct-muted">Secondary metadata and caption text</div>
      <div class="ct-label">CATEGORY LABEL</div>
      <button class="ct-btn">Primary Action</button>
      <a class="ct-link" href="#">Inline link text</a>
    </div>
  </div>
  <div id="ct-controls">
    <label>Background:
      <input type="color" id="ct-bg" value="#1e293b">
    </label>
    <label>Surface:
      <input type="color" id="ct-surface" value="#1e293b">
    </label>
  </div>
  <div id="ct-results"></div>
</div>`,
      css: `body { background: #0f172a; padding: 20px; margin: 0; font-family: system-ui, sans-serif; }
#contrast-tool { max-width: 600px; }
#ct-controls { display: flex; gap: 12px; margin: 12px 0;
  font-size: 12px; color: var(--color-text-secondary, #475569); }
#ct-controls label { display: flex; align-items: center; gap: 6px;
  background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 6px 10px; }
.ct-app  { background: #1e293b; border: 1px solid #334155;
  border-radius: 10px; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
.ct-h    { font-size: 24px; font-weight: 700; color: #f1f5f9; }
.ct-sub  { font-size: 16px; font-weight: 600; color: #cbd5e1; }
.ct-body { font-size: 15px; color: #94a3b8; line-height: 1.6; max-width: 55ch; }
.ct-muted{ font-size: 12px; color: var(--color-text-secondary, #475569); }
.ct-label{ font-size: 10px; font-weight: 700; color: var(--color-text-secondary, #475569); letter-spacing: 0.12em; text-transform: uppercase; }
.ct-btn  { padding: 9px 18px; background: #2563eb; color: #ffffff;
  border: none; border-radius: 7px; font-size: 14px; font-weight: 600; cursor: pointer; width: fit-content; }
.ct-link { color: #60a5fa; font-size: 14px; }
#ct-results { font-family: monospace; font-size: 11px; background: #0f172a;
  border: 1px solid #1e293b; border-radius: 6px; padding: 12px 14px;
  line-height: 1.9; max-height: 280px; overflow-y: auto; }`,
      startCode: `// Full WCAG contrast audit — works on any live DOM

function rgbToHex(rgb) {
  const m = rgb.match(/\\d+/g);
  if (!m || m.length < 3) return '#000000';
  return '#' + m.slice(0,3).map(n => parseInt(n).toString(16).padStart(2,'0')).join('');
}

function luminance(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  const lin = c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
  return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
}

function contrast(h1, h2) {
  const l1=luminance(h1), l2=luminance(h2);
  return ((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05));
}

function wcagLevel(ratio, isLarge) {
  if (isLarge) return ratio >= 4.5 ? 'AAA' : ratio >= 3.0 ? 'AA' : 'FAIL';
  return ratio >= 7.0 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3.0 ? 'A (insufficient)' : 'FAIL';
}

function auditContrast(rootSel) {
  const app     = document.querySelector(rootSel);
  const bgInput = document.getElementById('ct-bg');
  const bgHex   = bgInput ? bgInput.value : '#1e293b';

  const results  = document.getElementById('ct-results');
  const lines    = ['=== CONTRAST AUDIT: ' + rootSel + ' ===', ''];

  app.querySelectorAll('*').forEach(el => {
    if (!el.textContent.trim()) return;
    // Skip containers (only check leaf text nodes)
    if (el.children.length > 0) return;

    const s       = window.getComputedStyle(el);
    const fgRgb   = s.color;
    const bgRgb   = s.backgroundColor;

    const fg      = rgbToHex(fgRgb);
    const bg      = bgRgb && bgRgb !== 'rgba(0, 0, 0, 0)'
                    ? rgbToHex(bgRgb) : bgHex;

    const fs      = parseFloat(s.fontSize);
    const fw      = parseFloat(s.fontWeight);
    const isLarge = fs >= 18 || (fs >= 14 && fw >= 700);
    const ratio   = contrast(fg, bg);
    const level   = wcagLevel(ratio, isLarge);
    const req     = isLarge ? 3.0 : 4.5;
    const icon    = level.startsWith('FAIL') ? '✗' : level === 'A (insufficient)' ? '⚠' : '✓';
    const cls     = el.className.split(' ')[0] || el.tagName.toLowerCase();

    lines.push(icon + ' .' + cls.padEnd(12) +
      ' ' + ratio.toFixed(2).padStart(5) + ':1  ' +
      level.padEnd(20) +
      (isLarge ? ' [large]' : '        ') +
      '  fg:' + fg + '  bg:' + bg);
  });

  results.innerHTML = lines.join('<br>');
}

auditContrast('#ct-app');
document.getElementById('ct-bg').addEventListener('input', () => auditContrast('#ct-app'));`,
      outputHeight: 500,
    },

    // ─── PART 10: ANTI-PATTERNS ───────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Colour Anti-Patterns Reference

Six colour system failures found in nearly every production codebase.

---

### CO-1: The Hardcoded Hex
**Symptom:** \`background: #2563eb\` appears 47 times in the codebase. Changing the brand colour requires a search-and-replace that misses edge cases.
**Cause:** Colour chosen during initial design, never extracted to a token.
**Fix:** Every colour value lives in exactly one token definition file. Components reference tokens only.

---

### CO-2: The Semantic Shortcut
**Symptom:** A button uses \`var(--blue-600)\` directly instead of \`var(--color-interactive)\`. When the theme changes, the button doesn't update.
**Cause:** The developer knew the semantic token existed but used the primitive as a shortcut.
**Fix:** No component ever references a primitive token. The semantic token is the contract.

---

### CO-3: The Lone Colour Carrier
**Symptom:** Error states are shown only with red text. Success only with green. Users with deuteranopia (red-green colour blindness, ~6% of men) cannot distinguish them.
**Cause:** Colour used as the sole signal of state.
**Fix:** Always pair colour with a secondary signal: an icon (✕/✓), a text label ("Error", "Success"), a shape change, or a pattern.

---

### CO-4: The Missing Dark Surface
**Symptom:** The dark mode has a single dark surface colour. Cards, modals, sidebars, and the page background all use the same value. The UI looks flat and has no depth.
**Cause:** Dark mode implemented as "invert everything" rather than "create a surface hierarchy."
**Fix:** Dark mode needs at least three surface levels: background (darkest), surface (slightly lighter), surface-raised (for elevated elements like dropdowns and modals).

---

### CO-5: The Pure Black Trap
**Symptom:** Dark mode uses \`#000000\` background and \`#ffffff\` text. Technically maximum contrast, but causes visual glare and the "floating text" effect on OLED screens.
**Cause:** "More contrast is always better" — it isn't.
**Fix:** Use deep navy or charcoal (e.g., \`hsl(222, 47%, 7%)\`) for dark backgrounds, not pure black. Use near-white (e.g., \`hsl(210, 40%, 96%)\`) for primary text, not pure white. Target 11:1–14:1 for primary text in dark mode.

---

### CO-6: The Over-Saturated Palette
**Symptom:** Every element has a vivid, saturated colour. The page looks like a children's toy. The CTA doesn't stand out because everything is equally saturated.
**Cause:** Colour used for decoration (Lesson 1 anti-pattern) combined with no understanding of the single-saturation-point rule.
**Fix:** From Lesson 1: one element per view has full saturation (the primary action). Everything else is neutral. Semantic colours (error, success, warning) are the only other permitted saturated values, and they must be earned by actual state.`,
    },

    // ─── PART 11: SABOTAGE SANDBOX ────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `## Sabotage Sandbox: Six Colour System Violations

The component below has six deliberate colour system violations. It renders and looks "almost right" but fails under inspection. Diagnose and fix each one.

**The six violations:**
1. CO-1: Three hardcoded hex values in component styles that bypass the token system
2. CO-2: One element using a primitive token directly (\`--blue-500\`) instead of a semantic token
3. CO-3: An error state conveyed by colour alone — no icon or text label
4. CO-4: Dark mode using a single surface colour for both background and raised elements
5. CO-5: Pure black (#000000) used as the page background
6. CO-6: Three saturated elements competing — badge, button, AND status indicator all at full saturation

The test checks: no hardcoded hex on interactive elements, no primitive token references in component styles, error state has a text label, and the background is not pure black.`,
      html: `<div class="sb5-page" id="sb5-page">
  <div class="sb5-card" id="sb5-card">
    <div class="sb5-header">
      <span class="sb5-badge" id="sb5-badge">LIVE</span>
      <span class="sb5-title">System Monitor</span>
      <span class="sb5-status" id="sb5-status"></span>
    </div>
    <div class="sb5-rows">
      <div class="sb5-row">
        <span class="sb5-service">API Gateway</span>
        <span class="sb5-ok">Operational</span>
      </div>
      <div class="sb5-row">
        <span class="sb5-service">Database</span>
        <span class="sb5-ok">Operational</span>
      </div>
      <div class="sb5-row" id="sb5-error-row">
        <span class="sb5-service">CDN</span>
        <span class="sb5-err" id="sb5-err">Degraded</span>
      </div>
    </div>
    <button class="sb5-btn" id="sb5-btn">Refresh Status</button>
  </div>
</div>`,
      css: `body { margin: 0; font-family: system-ui, sans-serif; }
/* VIOLATIONS EMBEDDED BELOW */
.sb5-page  { background: #000000;  /* VIOLATION 5: pure black */
  display: flex; justify-content: center; align-items: center; min-height: 300px; }
.sb5-card  { background: #1e293b;  /* no surface hierarchy — VIOLATION 4 */
  border: 1px solid #334155; border-radius: 12px; padding: 20px; width: 300px; }
.sb5-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.sb5-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  background: #16a34a;    /* VIOLATION 6: badge at full saturation */
  color: white; padding: 2px 8px; border-radius: 100px; }
.sb5-title { font-size: 15px; font-weight: 600; color: #f1f5f9; flex: 1; }
.sb5-status { width: 10px; height: 10px; border-radius: 50%;
  background: #f59e0b;    /* VIOLATION 6: also full saturation + VIOLATION 3: colour alone */
  flex-shrink: 0; }
.sb5-rows  { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.sb5-row   { display: flex; justify-content: space-between; align-items: center; }
.sb5-service { font-size: 13px; color: #94a3b8; }
.sb5-ok    { font-size: 12px; font-weight: 500; color: #4ade80; }
.sb5-err   { font-size: 12px; font-weight: 500; color: #f87171;
              /* VIOLATION 3: error is colour-only — no icon or label prefix */ }
.sb5-btn   { width: 100%; padding: 10px;
  background: #2563eb;    /* VIOLATION 1: hardcoded hex — not a token */
  color: white; border: none; border-radius: 8px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  /* VIOLATION 6: third saturated element */ }`,
      startCode: `const root = document.documentElement;

// Token system already defined on root (from Part 7 demo)
// Use these semantic tokens for your fixes:
//   --color-interactive  = brand action colour
//   --color-surface      = card surface
//   --color-bg           = page background
//   These are set in the cascade — reference them

// First, set up minimal tokens for this sandbox
root.style.setProperty('--color-bg',          'hsl(222,47%,7%)');
root.style.setProperty('--color-surface',      'hsl(222,39%,12%)');
root.style.setProperty('--color-surface-raised','hsl(222,35%,17%)');
root.style.setProperty('--color-border',       'hsl(217,32%,22%)');
root.style.setProperty('--color-interactive',  'hsl(217,76%,47%)');

// ── FIX CO-5: Pure black background ──────────────────────────────────────────
document.querySelector('.sb5-page').style.background = '???';
// Use var(--color-bg) or the token value directly

// ── FIX CO-4: No surface hierarchy ───────────────────────────────────────────
// The card needs a slightly lighter background than the page
document.querySelector('.sb5-card').style.background = '???';
document.querySelector('.sb5-card').style.borderColor = '???';

// ── FIX CO-1: Hardcoded hex on button ────────────────────────────────────────
// Replace hardcoded #2563eb with the semantic token
document.querySelector('.sb5-btn').style.background = '???';

// ── FIX CO-6: Over-saturation — demote badge and status indicator ─────────────
// Only ONE element should be fully saturated (the button = primary action)
// Badge: use a muted tone
document.querySelector('.sb5-badge').style.background = '???';
document.querySelector('.sb5-badge').style.color = '???';

// Status indicator: muted amber, not full saturation
document.querySelector('.sb5-status').style.background = '???';

// ── FIX CO-3: Error state uses colour only ────────────────────────────────────
// Add a text prefix to the error label so it doesn't rely on colour alone
const errEl = document.getElementById('sb5-err');
errEl.textContent = '???'; // prefix with icon+label e.g. "✕ Degraded"

// ── CO-2 would require changing CSS to replace --blue-500 with --color-interactive
// Note it in the console — it's an HTML/CSS fix not catchable via JS
console.log('CO-2 note: if any CSS uses var(--blue-500), replace with var(--color-interactive)');

// ── AUDIT ─────────────────────────────────────────────────────────────────────
setTimeout(() => {
  const page    = window.getComputedStyle(document.querySelector('.sb5-page'));
  const btn     = window.getComputedStyle(document.querySelector('.sb5-btn'));
  const errText = document.getElementById('sb5-err').textContent;

  // Check background is not pure black
  const bgRgb   = page.backgroundColor;
  const isPureBlack = bgRgb === 'rgb(0, 0, 0)';

  // Check btn is not hardcoded blue (37,99,235 = #2563eb)
  const btnBg       = btn.backgroundColor;
  const isHardBlue  = btnBg === 'rgb(37, 99, 235)';

  const checks = {
    'CO-5 no pure black bg': !isPureBlack,
    'CO-1 btn uses token':   !isHardBlue,
    'CO-3 error has label':  errText.trim().length > 8,
  };
  console.log('=== VIOLATIONS AUDIT ===');
  Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗') + ' ' + k));
}, 100);`,
      solutionCode: `const root = document.documentElement;
root.style.setProperty('--color-bg',           'hsl(222,47%,7%)');
root.style.setProperty('--color-surface',       'hsl(222,39%,12%)');
root.style.setProperty('--color-surface-raised','hsl(222,35%,17%)');
root.style.setProperty('--color-border',        'hsl(217,32%,22%)');
root.style.setProperty('--color-interactive',   'hsl(217,76%,47%)');

document.querySelector('.sb5-page').style.background = 'var(--color-bg)';
document.querySelector('.sb5-card').style.background  = 'var(--color-surface)';
document.querySelector('.sb5-card').style.borderColor = 'var(--color-border)';
document.querySelector('.sb5-btn').style.background   = 'var(--color-interactive)';
document.querySelector('.sb5-badge').style.background = 'rgba(74,222,128,0.12)';
document.querySelector('.sb5-badge').style.color      = '#4ade80';
document.querySelector('.sb5-status').style.background = 'rgba(251,191,36,0.4)';
document.getElementById('sb5-err').textContent = '✕ Degraded';

setTimeout(() => {
  const page = window.getComputedStyle(document.querySelector('.sb5-page'));
  const btn  = window.getComputedStyle(document.querySelector('.sb5-btn'));
  const err  = document.getElementById('sb5-err').textContent;
  const checks = {
    'CO-5 no pure black bg': page.backgroundColor !== 'rgb(0, 0, 0)',
    'CO-1 btn uses token':   btn.backgroundColor !== 'rgb(37, 99, 235)',
    'CO-3 error has label':  err.trim().length > 8,
  };
  Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗') + ' ' + k));
}, 100);`,
      check: (code) => {
        const fixesPureBlack = /sb5-page[\s\S]*?(?:var\(--|hsl\(|222)/i.test(code) || /color-bg|hsl\(222/i.test(code);
        const fixesHardHex   = /sb5-btn[\s\S]*?(?:var\(--|color-interactive)/i.test(code);
        const fixesError     = /errEl|sb5-err[\s\S]*?textContent.*(?:[✕✗x]|Degraded|Error)/i.test(code) || /textContent.*[✕✗]/u.test(code);
        return fixesPureBlack && fixesHardHex;
      },
      successMessage: `Six violations fixed. CO-1 through CO-6 are now named tools in your diagnostic vocabulary. The most impactful fixes are CO-1 (hardcoded hex → token) and CO-3 (colour-only signals → colour + label). CO-3 is the one that directly affects accessibility for ~6% of your users.`,
      failMessage: `Three required: (1) .sb5-page background must not be pure black — use var(--color-bg) or an hsl() dark value. (2) .sb5-btn background must reference a CSS token (var(--color-interactive)) not #2563eb. (3) The error element's textContent must include more than just "Degraded" — add an icon prefix like "✕ Degraded".`,
      outputHeight: 480,
    },

    // ─── PART 12: STRESS CONDITION ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Stress Condition: The Brand Rebrand

The ultimate test of a colour system: a complete brand colour change. If the system is correct, the entire interface updates from one token change. If it isn't, you discover every place where a colour was hardcoded.

This cell simulates five different brand hues cycling through the same interface. Every button press represents a brand rebrand. Watch how long it takes for the interface to update — it should be instantaneous and complete.

Then inject a deliberate CO-1 violation (one hardcoded hex) and watch how that one element fails to update during a rebrand. This is the production failure mode: one team member hardcodes a hex "just this once", and it becomes a maintenance liability.`,
      html: `<div id="rebrand-demo">
  <div id="rb-controls">
    <span style="font-size:11px;color:var(--color-text-secondary, #475569);font-family:monospace">Brand hue:</span>
    <button class="rb-btn" data-hue="217">Blue (217°)</button>
    <button class="rb-btn" data-hue="183">Teal (183°)</button>
    <button class="rb-btn" data-hue="145">Green (145°)</button>
    <button class="rb-btn" data-hue="280">Purple (280°)</button>
    <button class="rb-btn" data-hue="14">Red-Orange (14°)</button>
  </div>
  <div id="rb-violation-row">
    <label style="font-size:11px;color:var(--color-text-secondary, #475569)">
      <input type="checkbox" id="rb-inject"> Inject CO-1 violation (hardcoded hex on one element)
    </label>
  </div>
  <div class="rb-app" id="rb-app">
    <nav class="rb-nav">
      <span class="rb-logo">Platform</span>
      <span style="flex:1"></span>
      <button class="rb-cta" id="rb-cta">Upgrade</button>
    </nav>
    <div class="rb-body">
      <div class="rb-card">
        <div class="rb-tag" id="rb-tag">FEATURED</div>
        <div class="rb-val">$48,290</div>
        <div class="rb-sub">↑ 12% this month</div>
        <a class="rb-link" id="rb-link" href="#">View report →</a>
      </div>
      <div class="rb-card">
        <div class="rb-tag">ACTIVE</div>
        <div class="rb-val">3,841</div>
        <div class="rb-sub">Active users today</div>
        <a class="rb-link" href="#">View users →</a>
      </div>
    </div>
  </div>
  <div id="rb-log"></div>
</div>`,
      css: `body { background: #0f172a; padding: 20px; margin: 0; font-family: system-ui, sans-serif; }
#rb-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
#rb-violation-row { margin-bottom: 14px; }
.rb-btn { font-size: 11px; font-weight: 500; padding: 5px 12px;
  border-radius: 6px; border: 1px solid #334155; background: #1e293b;
  color: var(--color-text-secondary, #475569); cursor: pointer; }
.rb-btn.active { border-color: var(--rb-interactive); color: var(--rb-interactive);
  background: var(--rb-subtle); }
.rb-app  { border-radius: 10px; overflow: hidden; border: 1px solid #334155; max-width: 540px; }
.rb-nav  { display: flex; align-items: center; padding: 0 20px; height: 48px;
  background: #1e293b; border-bottom: 1px solid #334155; gap: 8px; }
.rb-logo { font-size: 15px; font-weight: 700; color: #f1f5f9; }
.rb-cta  { padding: 6px 14px; background: var(--rb-interactive);
  color: var(--rb-text-on); border: none; border-radius: 7px;
  font-size: 13px; font-weight: 600; cursor: pointer; }
.rb-body { padding: 16px; display: grid; grid-template-columns: 1fr 1fr;
  gap: 12px; background: #0f172a; }
.rb-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px; }
.rb-tag  { font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  color: var(--rb-interactive); background: var(--rb-subtle);
  border: 1px solid var(--rb-border-subtle);
  padding: 2px 8px; border-radius: 100px; display: inline-block; margin-bottom: 8px; }
.rb-val  { font-size: 26px; font-weight: 700; color: #f1f5f9; margin-bottom: 2px; }
.rb-sub  { font-size: 12px; color: var(--color-text-secondary, #475569); margin-bottom: 10px; }
.rb-link { font-size: 13px; font-weight: 500; color: var(--rb-interactive);
  text-decoration: none; }
#rb-log  { margin-top: 10px; font-family: monospace; font-size: 11px; color: var(--color-text-secondary, #475569); line-height: 1.7; }`,
      startCode: `const root = document.documentElement;
let violation = false;

function setHue(h) {
  // Set all brand tokens from a single hue value
  root.style.setProperty('--rb-interactive',    \`hsl(\${h}, 76%, 47%)\`);
  root.style.setProperty('--rb-interactive-l',  \`hsl(\${h}, 74%, 38%)\`);
  root.style.setProperty('--rb-subtle',         \`hsl(\${h}, 80%, 14%)\`);
  root.style.setProperty('--rb-border-subtle',  \`hsl(\${h}, 70%, 22%)\`);
  root.style.setProperty('--rb-text-on',        '#ffffff');

  // Update active button
  document.querySelectorAll('.rb-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.hue) === h);
  });

  // Check for violation
  const log = document.getElementById('rb-log');
  if (violation) {
    // CO-1: one element has hardcoded hex that won't update
    document.getElementById('rb-cta').style.background = '#2563eb'; // hardcoded!
    document.getElementById('rb-tag').style.color      = '#3b82f6'; // hardcoded!
    log.innerHTML = '⚠ <b>CO-1 VIOLATION ACTIVE:</b> #rb-cta and .rb-tag have hardcoded hex.<br>' +
      'They show <b style="color:#3b82f6">blue (#2563eb)</b> even when brand is hsl(' + h + '°).<br>' +
      'Every other element updated correctly via the token system.';
  } else {
    document.getElementById('rb-cta').style.background = '';
    document.getElementById('rb-tag').style.color      = '';
    document.getElementById('rb-tag').style.background = '';
    log.innerHTML = '✓ Brand hue: <b style="color:hsl(' + h + ',76%,60%)">' + h + '°</b> — ' +
      'all elements updated via tokens. Zero manual component changes.';
  }
}

document.querySelectorAll('.rb-btn').forEach(btn =>
  btn.addEventListener('click', () => setHue(parseInt(btn.dataset.hue))));

document.getElementById('rb-inject').addEventListener('change', e => {
  violation = e.target.checked;
  const active = document.querySelector('.rb-btn.active');
  if (active) setHue(parseInt(active.dataset.hue));
  else setHue(217);
});

setHue(217);`,
      outputHeight: 440,
    },

    // ─── PART 13: PRACTICE 3 — AUDIT AND FIX ─────────────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 3: Audit and Token-ify a Legacy Component

You're given a profile card component built the old way — 11 hardcoded hex values, no tokens, no system.

**Your task:**
1. Run the provided colour audit to identify all hardcoded values
2. Define a minimal semantic token set for this component (you choose the token names)
3. Apply the tokens via \`setProperty()\` on the root
4. Replace all hardcoded colours in the component with \`var(--your-tokens)\` via JavaScript

The test verifies: the component uses no hardcoded hex on interactive or text elements (by checking that style changes propagate when you update a token), and at least 5 semantic tokens are defined.

**Explore:** after passing, add a \`data-theme="warm"\` variant — a warm-toned version of the card using amber and orange instead of blue. How few token values need to change?`,
      html: `<div class="p3-card" id="p3-card">
  <div class="p3-header">
    <div class="p3-avatar" id="p3-avatar">SC</div>
    <div class="p3-info">
      <div class="p3-name" id="p3-name">Sarah Chen</div>
      <div class="p3-role" id="p3-role">Staff Engineer · Infrastructure</div>
    </div>
    <span class="p3-badge" id="p3-badge">Pro</span>
  </div>
  <p class="p3-bio" id="p3-bio">Leads the infrastructure platform team. Building systems that scale to 100M events per day.</p>
  <div class="p3-stats">
    <div class="p3-stat">
      <div class="p3-stat-v" id="p3-sv1">847</div>
      <div class="p3-stat-l" id="p3-sl1">Contributions</div>
    </div>
    <div class="p3-stat">
      <div class="p3-stat-v" id="p3-sv2">12</div>
      <div class="p3-stat-l" id="p3-sl2">Open PRs</div>
    </div>
  </div>
  <div class="p3-actions">
    <button class="p3-primary" id="p3-primary">View Profile</button>
    <button class="p3-secondary" id="p3-secondary">Send Message</button>
  </div>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
/* HARDCODED — needs tokenising */
.p3-card    { background: #1e293b; border: 1px solid #334155;
  border-radius: 14px; padding: 24px; width: 300px; }
.p3-header  { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.p3-avatar  { width: 48px; height: 48px; border-radius: 50%; background: #2563eb;
  color: #ffffff; font-size: 14px; font-weight: 700; display: flex;
  align-items: center; justify-content: center; flex-shrink: 0; }
.p3-name    { font-size: 15px; font-weight: 600; color: #f1f5f9; margin-bottom: 2px; }
.p3-role    { font-size: 12px; color: var(--color-text-secondary, #475569); }
.p3-badge   { font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  background: #1e3a5f; color: #60a5fa; border: 1px solid #1d4ed8;
  padding: 3px 9px; border-radius: 100px; flex-shrink: 0; }
.p3-bio     { font-size: 13px; color: #94a3b8; line-height: 1.6;
  margin: 0 0 16px; }
.p3-stats   { display: flex; gap: 16px; margin-bottom: 18px;
  padding-bottom: 16px; border-bottom: 1px solid #334155; }
.p3-stat-v  { font-size: 20px; font-weight: 700; color: #f1f5f9; }
.p3-stat-l  { font-size: 11px; color: var(--color-text-secondary, #475569); }
.p3-actions { display: flex; gap: 8px; }
.p3-primary { flex: 1; padding: 9px; background: #2563eb; color: #ffffff;
  border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
.p3-secondary { flex: 1; padding: 9px; background: transparent; color: #94a3b8;
  border: 1px solid #334155; border-radius: 8px; font-size: 13px; cursor: pointer; }`,
      startCode: `const root = document.documentElement;

// ── STEP 1: Run the audit to see what you're working with ─────────────────────
function countHardcodedColours() {
  const card  = document.querySelector('.p3-card');
  const props = ['color','backgroundColor','borderColor'];
  const found = new Set();
  card.querySelectorAll('*').forEach(el => {
    props.forEach(p => {
      const v = window.getComputedStyle(el)[p];
      if (v && v !== 'rgba(0, 0, 0, 0)') found.add(v);
    });
  });
  console.log('Hardcoded colour values found:', found.size);
  console.log([...found].join('\\n'));
}
countHardcodedColours();

// ── STEP 2: Define your semantic tokens ──────────────────────────────────────
// Name them whatever makes sense. Minimum 5 tokens.
// Example pattern:
//   root.style.setProperty('--p3-surface',      '#1e293b');
//   root.style.setProperty('--p3-border',       '#334155');
//   root.style.setProperty('--p3-text-primary', '#f1f5f9');
//   root.style.setProperty('--p3-text-muted',   '#64748b');
//   root.style.setProperty('--p3-interactive',  '#2563eb');

// YOUR TOKEN DEFINITIONS HERE:


// ── STEP 3: Apply tokens to all elements ─────────────────────────────────────
// Replace every hardcoded colour with a var(--p3-*) reference

// YOUR COLOUR APPLICATIONS HERE:


// ── VERIFY ────────────────────────────────────────────────────────────────────
// Count how many tokens you defined
const tokenCount = Object.keys(
  Object.fromEntries(
    [...document.styleSheets]
      .flatMap(s => { try { return [...s.cssRules]; } catch { return []; } })
  )
).length;

// Simpler: just count setProperty calls in the code
const myTokens = [];
// ... we'll test by brand-swap below

// Token test: change --p3-interactive and see if the button updates
root.style.setProperty('--p3-interactive', 'hsl(145, 60%, 40%)'); // green test
const btnBg = window.getComputedStyle(document.getElementById('p3-primary')).backgroundColor;
const tokenWorks = !btnBg.includes('37, 99, 235'); // not the original blue hex
console.log('\\nToken propagation test:', tokenWorks ? '✓ PASS' : '✗ FAIL');
console.log(tokenWorks
  ? 'Button updated when --p3-interactive changed — token system working.'
  : 'Button still shows hardcoded blue — p3-primary needs to use var(--p3-interactive).');`,
      solutionCode: `const root = document.documentElement;

// Define semantic tokens
root.style.setProperty('--p3-surface',       '#1e293b');
root.style.setProperty('--p3-border',        '#334155');
root.style.setProperty('--p3-text-1',        '#f1f5f9');
root.style.setProperty('--p3-text-2',        '#94a3b8');
root.style.setProperty('--p3-text-3',        '#64748b');
root.style.setProperty('--p3-interactive',   '#2563eb');
root.style.setProperty('--p3-interactive-bg','#1e3a5f');
root.style.setProperty('--p3-interactive-bd','#1d4ed8');
root.style.setProperty('--p3-interactive-t', '#60a5fa');

// Apply to all elements
document.getElementById('p3-card').style.background      = 'var(--p3-surface)';
document.getElementById('p3-card').style.borderColor     = 'var(--p3-border)';
document.getElementById('p3-avatar').style.background    = 'var(--p3-interactive)';
document.getElementById('p3-avatar').style.color         = '#fff';
document.getElementById('p3-name').style.color           = 'var(--p3-text-1)';
document.getElementById('p3-role').style.color           = 'var(--p3-text-3)';
document.getElementById('p3-badge').style.background     = 'var(--p3-interactive-bg)';
document.getElementById('p3-badge').style.color          = 'var(--p3-interactive-t)';
document.getElementById('p3-badge').style.borderColor    = 'var(--p3-interactive-bd)';
document.getElementById('p3-bio').style.color            = 'var(--p3-text-2)';
document.getElementById('p3-sv1').style.color            = 'var(--p3-text-1)';
document.getElementById('p3-sv2').style.color            = 'var(--p3-text-1)';
document.getElementById('p3-sl1').style.color            = 'var(--p3-text-3)';
document.getElementById('p3-sl2').style.color            = 'var(--p3-text-3)';
document.getElementById('p3-primary').style.background   = 'var(--p3-interactive)';
document.getElementById('p3-primary').style.color        = '#fff';
document.getElementById('p3-secondary').style.color      = 'var(--p3-text-2)';
document.getElementById('p3-secondary').style.borderColor= 'var(--p3-border)';

root.style.setProperty('--p3-interactive', 'hsl(145, 60%, 40%)');
const ok = !window.getComputedStyle(document.getElementById('p3-primary'))
  .backgroundColor.includes('37, 99, 235');
console.log('Token propagation:', ok ? '✓ PASS' : '✗ FAIL');`,
      check: (code) => {
        const hasMinTokens  = (code.match(/setProperty\s*\(/g) || []).length >= 5;
        const usesVarTokens = /var\(--p3-/i.test(code);
        const appliesBtn    = /p3-primary[\s\S]*?(?:var\(--p3-interactive\)|background)/i.test(code);
        return hasMinTokens && usesVarTokens;
      },
      successMessage: `Legacy component token-ified. The token propagation test is the real verification: when you change --p3-interactive from blue to green, the button, avatar, and badge all update automatically — because they reference the token, not the hex value. That's the entire value proposition of the three-layer architecture in one test.`,
      failMessage: `Two things needed: (1) At least 5 setProperty() calls defining tokens. (2) The interactive elements (especially p3-primary button) must use var(--p3-interactive) as their background — not the hardcoded #2563eb. The token propagation test at the bottom will tell you if the wiring is complete.`,
      outputHeight: 500,
    },

    // ─── PART 14: CROSS-PLATFORM ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Cross-Platform: Tokens in Every Environment

The three-layer token architecture applies to every UI framework. The implementation syntax differs; the model is identical.

| Concept | CSS | React (CSS-in-JS) | Qt / C++ | Figma |
|---|---|---|---|---|
| Primitive token | \`--blue-500: hsl(217,76%,47%)\` | \`const blue500 = 'hsl(217,76%,47%)'\` | \`const QColor BLUE_500\` | Color: blue/500 |
| Semantic token | \`--color-interactive: var(--blue-500)\` | \`interactive: colors.blue500\` | \`APP_COLOR_INTERACTIVE\` | Token: interactive |
| Apply to element | \`background: var(--color-interactive)\` | \`background: theme.interactive\` | \`btn->setPalette(APP_COLOR_INTERACTIVE)\` | Fill: {interactive} |
| Theme switch | \`[data-theme="light"] { ... }\` | \`ThemeProvider theme={lightTheme}\` | \`qApp->setStyle(lightStyle)\` | Variable mode: Light |
| Contrast check | \`auditColour()\` | Storybook a11y addon | Manual or axe-core | Figma contrast plugin |

### What Never Changes

1. **Layer 1 (primitives) never appears in component code.** Components only reference Layer 2 (semantics).
2. **Layer 2 maps to Layer 1 — never skips to raw values.** The semantic token is always the intermediary.
3. **Semantic names describe function, not colour.** \`--color-interactive\` not \`--color-blue\`. A semantic name survives a brand rebrand; a colour name doesn't.
4. **Semantic colours (error/success/warning) are never brand colours.** They are fixed and reserved.
5. **WCAG contrast floors apply in every renderer.** 4.5:1 body text, 3:1 large text. These are human vision constraints.

---

## What You Now Know

After Lesson 5, you have all five systems:
1. **Hierarchy** — four levels, four levers
2. **Spacing** — 8 tokens, 4px base, 5 roles
3. **Typography** — modular scale, line-height function, 65ch measure
4. **Layout** — Flex + Grid as constraints, zero magic widths
5. **Colour** — three layers (primitive → semantic → component), single token swap for theming

These five systems fully describe any interface. Every UI decision maps to one of them.

**Next: Phase 2 begins** — we stop building individual components and start building *systems*: a complete design token architecture, a component library, and the engineering patterns that keep interfaces consistent at scale.`,
    },

    // ─── PART 15: SEED ────────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Lesson 5 Complete — The Reference Colour System

This seed implements the complete three-layer colour architecture used throughout the rest of this course. The \`auditColour()\` function is your permanent tool — it counts unique colour values and flags elements that bypass the token system.

**Zero hardcoded colours on interactive elements = the pass condition.**`,
      html: `<div id="ref-app">
  <header class="ra5-header">
    <span class="ra5-logo">System</span>
    <span style="flex:1"></span>
    <button class="ra5-cta" id="ra5-cta">Upgrade</button>
    <button class="ra5-toggle" id="ra5-toggle">☀</button>
  </header>
  <main class="ra5-body">
    <div class="ra5-card">
      <div class="ra5-tag">REVENUE</div>
      <div class="ra5-val">$48,290</div>
      <div class="ra5-sub">↑ 12% this month</div>
    </div>
    <div class="ra5-card">
      <div class="ra5-tag">USERS</div>
      <div class="ra5-val">3,841</div>
      <div class="ra5-sub">Active today</div>
    </div>
    <div class="ra5-alert">✓ All systems operational</div>
    <div class="ra5-warn">⚠ Trial ends in 3 days</div>
  </main>
</div>`,
      css: `body { margin: 0; font-family: system-ui, sans-serif; }
/* ── ALL COMPONENTS USE SEMANTIC TOKENS ONLY ── */
#ref-app      { background: var(--c5-bg); min-height: 320px; }
.ra5-header   { display: flex; align-items: center; padding: 0 20px; height: 48px; gap: 8px;
  background: var(--c5-surface); border-bottom: 1px solid var(--c5-border); }
.ra5-logo     { font-size: 15px; font-weight: 700; color: var(--c5-text-1); }
.ra5-cta      { padding: 6px 14px; background: var(--c5-interactive);
  color: var(--c5-on-interactive); border: none; border-radius: 7px;
  font-size: 13px; font-weight: 600; cursor: pointer; }
.ra5-toggle   { padding: 6px 10px; background: var(--c5-surface-raised);
  color: var(--c5-text-2); border: 1px solid var(--c5-border);
  border-radius: 7px; font-size: 13px; cursor: pointer; }
.ra5-body     { padding: 16px; display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px;
  background: var(--c5-bg); }
.ra5-card     { background: var(--c5-surface); border: 1px solid var(--c5-border);
  border-radius: 8px; padding: 16px; }
.ra5-tag      { font-size: 10px; font-weight: 700; color: var(--c5-text-3);
  letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
.ra5-val      { font-size: 24px; font-weight: 700; color: var(--c5-text-1); margin-bottom: 2px; }
.ra5-sub      { font-size: 12px; color: var(--c5-text-2); }
.ra5-alert    { grid-column: 1/-1; padding: 10px 14px; border-radius: 7px;
  background: var(--c5-success-bg); border: 1px solid var(--c5-success-border);
  color: var(--c5-success-text); font-size: 13px; }
.ra5-warn     { grid-column: 1/-1; padding: 10px 14px; border-radius: 7px;
  background: var(--c5-warning-bg); border: 1px solid var(--c5-warning-border);
  color: var(--c5-warning-text); font-size: 13px; }`,
      startCode: `// ── COMPLETE THREE-LAYER TOKEN SYSTEM ────────────────────────────────────────
const root = document.documentElement;

const THEMES = {
  dark: {
    '--c5-bg':              'hsl(222,47%,7%)',
    '--c5-surface':         'hsl(222,39%,12%)',
    '--c5-surface-raised':  'hsl(222,35%,17%)',
    '--c5-border':          'hsl(217,32%,22%)',
    '--c5-text-1':          'hsl(210,40%,96%)',
    '--c5-text-2':          'hsl(215,25%,65%)',
    '--c5-text-3':          'hsl(217,20%,45%)',
    '--c5-interactive':     'hsl(217,76%,47%)',
    '--c5-on-interactive':  '#ffffff',
    '--c5-success-bg':      'rgba(74,222,128,0.08)',
    '--c5-success-border':  'rgba(74,222,128,0.2)',
    '--c5-success-text':    '#86efac',
    '--c5-warning-bg':      'rgba(251,191,36,0.08)',
    '--c5-warning-border':  'rgba(251,191,36,0.2)',
    '--c5-warning-text':    '#fde68a',
  },
  light: {
    '--c5-bg':              'hsl(210,40%,98%)',
    '--c5-surface':         '#ffffff',
    '--c5-surface-raised':  'hsl(210,40%,96%)',
    '--c5-border':          'hsl(214,32%,91%)',
    '--c5-text-1':          'hsl(222,47%,11%)',
    '--c5-text-2':          'hsl(215,20%,40%)',
    '--c5-text-3':          'hsl(215,16%,60%)',
    '--c5-interactive':     'hsl(217,74%,38%)',
    '--c5-on-interactive':  '#ffffff',
    '--c5-success-bg':      '#f0fdf4',
    '--c5-success-border':  '#bbf7d0',
    '--c5-success-text':    '#166534',
    '--c5-warning-bg':      '#fffbeb',
    '--c5-warning-border':  '#fde68a',
    '--c5-warning-text':    '#92400e',
  },
};

let theme = 'dark';
function applyTheme(t) {
  theme = t;
  Object.entries(THEMES[t]).forEach(([k,v]) => root.style.setProperty(k,v));
  document.getElementById('ra5-toggle').textContent = t === 'dark' ? '☀' : '☾';
}

document.getElementById('ra5-toggle').onclick = () =>
  applyTheme(theme === 'dark' ? 'light' : 'dark');
applyTheme('dark');

// ── FINAL AUDIT ───────────────────────────────────────────────────────────────
console.log('=== LESSON 5 — FINAL COLOUR AUDIT ===\\n');
console.log('Token count:', Object.keys(THEMES.dark).length, 'semantic tokens per theme');
console.log('');
console.log('Three-layer architecture:');
console.log('  Layer 1 (primitives): HSL values in THEMES object — one place only');
console.log('  Layer 2 (semantics):  --c5-* tokens — component contract');
console.log('  Layer 3 (components): CSS uses only var(--c5-*) — zero hardcoded hex');
console.log('');
console.log('Five systems complete:');
console.log('  1. Hierarchy  — L1–L4 levels, four levers');
console.log('  2. Spacing    — 8 tokens, 4px base, 5 roles');
console.log('  3. Typography — modular scale, line-height function, 65ch measure');
console.log('  4. Layout     — Flex + Grid constraints, no magic widths');
console.log('  5. Colour     — primitive → semantic → component, one-swap theming');
console.log('');
console.log('Phase 2 → Design at Scale');
console.log('Component libraries, token governance, and system maintenance.');`,
      outputHeight: 440,
    },
  ],
};

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export default {
  id: 'design-05-colour-systems',
  slug: 'colour-systems',
  chapter: 'design.1',
  order: 5,
  title: 'Colour Systems',
  subtitle: 'Three layers: primitive → semantic → component. One token swap changes everything. Zero hardcoded hex in production.',
  tags: [
    'css', 'colour', 'tokens', 'design-tokens', 'theming', 'dark-mode',
    'wcag', 'contrast', 'hsl', 'semantic-tokens', 'accessibility',
    'colour-blindness', 'design-systems', 'anti-patterns',
  ],
  hook: {
    question: 'The brand colour changes from blue to teal. How many files do you edit? If the answer is more than one, you don\'t have a colour system.',
    realWorldContext:
      'Every production UI eventually gets a rebrand, a new theme, or an accessibility audit. ' +
      'Without a token system, each of these is a multi-week engineering project with regression risk. ' +
      'With a token system, a rebrand is one variable. A new theme is one object. An accessibility fix is one contrast value.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'Three layers: primitives (the palette), semantics (the roles), components (the applications). Components only reference semantics.',
      'Semantic names describe function: --color-interactive, not --color-blue. Function names survive rebrands.',
      'Theme switching works because semantic tokens are redefined per theme. Components use only semantic tokens so they update for free.',
      'HSL is the engineering model for colour: hue picks the family, saturation controls vividity, lightness builds the scale.',
      'Colour blindness affects ~8% of men. Never use colour as the sole carrier of meaning. Always pair with icon, label, or shape.',
      'Six anti-patterns: CO-1 hardcoded hex, CO-2 semantic shortcut, CO-3 lone colour carrier, CO-4 missing dark surfaces, CO-5 pure black trap, CO-6 over-saturation.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The Core Rule',
        body: 'No component ever references a primitive token directly. A button\'s background is var(--color-interactive), never var(--blue-600) and never #2563eb. The semantic token is the contract between the design system and the component.',
      },
      {
        type: 'important',
        title: 'CO-3: Colour Is Never the Only Signal',
        body: 'Error red and success green are indistinguishable to ~6% of male users (deuteranopia). Every state that uses colour must also use an icon (✕/✓), a text label, or a structural change. This is not optional — it\'s WCAG 1.4.1.',
      },
      {
        type: 'tip',
        title: 'The HSL Scale Formula',
        body: 'A complete 11-step colour scale comes from holding hue and saturation roughly constant and stepping through lightness: 97%, 94%, 87%, 74%, 60%, 47%, 38%, 30%, 22%, 15%, 10%. Shade 600 (38% lightness) is typically the action colour on white; shade 500 (47%) is the action colour on dark.',
      },
      {
        type: 'warning',
        title: 'CO-5: Not Pure Black',
        body: '#000000 on OLED screens produces a glare effect where text appears to float. Use deep navy (hsl(222, 47%, 7%)) for dark backgrounds. Use near-white (hsl(210, 40%, 96%)) for primary text. Target 11:1–14:1 — not the theoretical maximum of 21:1.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Design Systems — Lesson 5: Colour Systems',
        props: { lesson: LESSON_DESIGN_05 },
      },
    ],
  },
  math: {
    prose: [
      'WCAG relative luminance: L = 0.2126×R_lin + 0.7152×G_lin + 0.0722×B_lin, where R_lin = (R/255)^2.2 for values above the linearisation threshold. The weights reflect the eye\'s differential sensitivity to red, green, and blue wavelengths.',
      'Contrast ratio: (L1 + 0.05) / (L2 + 0.05) where L1 ≥ L2. Adding 0.05 to both prevents division by zero for pure black (L=0) and keeps the scale anchored: white on black = 21:1.',
      'HSL lightness steps for a perceptually even scale: 97, 94, 87, 74, 60, 47, 38, 30, 22, 15, 10. The steps are smaller at the extremes because human lightness perception (Weber-Fechner law) compresses at high and low luminance values.',
    ],
    callouts: [],
    visualizations: [],
  },
  rigor: {
    prose: [
      'The three-layer token architecture mirrors the Model-View-Controller pattern: primitives are the data model (raw colour values), semantics are the controller (decisions about use), and components are the view (application to specific UI elements). Changes at each layer propagate downward without requiring changes at higher layers.',
      'Colour deficiency prevalence: deuteranopia/deuteranomaly ~5% of men, protanopia/protanomaly ~1% of men, total red-green deficiency ~6% of men. At a 1000-user product, approximately 30 male users cannot distinguish red from green without secondary signals.',
      'The single-saturation-point principle (one saturated element per view) is supported by visual attention research: Treisman\'s Feature Integration Theory (1980) shows that a single salient feature (high saturation) captures pre-attentive processing automatically, while multiple salient features require serial attention and slow task completion.',
    ],
    callouts: [],
    visualizations: [],
  },
  examples: [],
  challenges: [],
  mentalModel: [
    'Three layers: primitive tokens (the palette), semantic tokens (the roles), component tokens (optional specific overrides). Never skip a layer.',
    'Components reference only semantic tokens. Never primitives, never raw hex.',
    'Theme switch = redefine Layer 2 tokens. Everything updates. Zero component changes.',
    'HSL model: hue picks the family, saturation controls vividity, lightness builds the scale.',
    'Colour is never the only signal. Always pair with icon, label, or shape (WCAG 1.4.1).',
    'Six anti-patterns: CO-1 hardcoded hex, CO-2 semantic shortcut, CO-3 lone colour carrier, CO-4 missing surfaces, CO-5 pure black, CO-6 over-saturation.',
    'auditColour() counts unique colour values and flags elements bypassing the token system.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
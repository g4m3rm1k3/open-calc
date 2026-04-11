// LESSON_DESIGN_02.js
// Lesson 2 — Spacing Systems
// The problem: designers choose spacing values by feel — "that looks about right".
// This produces layouts that work once, break under real data, and can't be
// reasoned about or debugged. Spacing chosen by intuition cannot be fixed
// by intuition — you need a system.
// Concepts: base unit, spacing scale, the five spacing roles, proximity law,
//           negative space, density tradeoffs, the uniform gap failure.

const LESSON_DESIGN_02 = {
  title: 'Spacing Systems',
  subtitle: 'Replace arbitrary gaps with a mathematical scale that creates visual rhythm and survives real data.',
  sequential: true,
  cells: [

    // ─── PART 0: RECAP + THE QUESTION ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Recap: What Lesson 1 Established

Lesson 1 gave you a four-level hierarchy system. Every element now has an assigned level, and the properties (size, weight, colour) encode that level visually.

But there's a problem. Look at any card you built in Lesson 1 and ask: **how did you decide the spacing between elements?**

If the answer was "8px felt right" or "I tried a few values and picked one" — you don't have a spacing system. You have spacing by coincidence. That works for a mockup. It fails when:
- Content changes length and the layout reflows
- A designer 6 months later needs to add an element
- The same component appears at different content densities
- You need to build the same layout in Qt or a game engine

---

## The Question This Lesson Answers

> Why does some UI feel visually rhythmic — like everything breathes together — while other UI feels cramped, scattered, or randomly assembled?

The answer isn't talent. It's a **spacing system**: a small set of predetermined values, derived from a single base unit, used for every spacing decision across the entire interface.

By the end of this lesson you will have:
- A mathematical spacing scale (4px base, 8 values)
- A vocabulary for the five spacing roles
- Rules for when to use each role
- A programmatic method to audit and enforce spacing
- The ability to diagnose spacing failures by name`,
    },

    // ─── PART 1: THE BROKEN BASELINE ──────────────────────────────────────────
    {
      type: 'js',
      instruction: `## The Problem: Arbitrary Spacing

This form was built the way most forms get built — spacing applied by feel, element by element, until it looked "about right."

Look carefully at the spacing values. Count them. Notice:
- How many distinct gap values are used?
- Do related elements feel grouped?
- Does the form have sections, or just a list of fields?
- Where does your eye go first? Where does it get lost?

Run the cell. The JavaScript reads and reports every computed spacing value. The output will show you how many different values are in use — and why that number should be much smaller.`,
      html: `<div class="form-wrap">
  <form class="form">
    <h2 class="form-title">Create Account</h2>
    <p class="form-sub">Join 40,000 teams using the platform</p>
    <div class="field">
      <label class="label">Full name</label>
      <input class="input" type="text" placeholder="Jane Smith">
    </div>
    <div class="field">
      <label class="label">Work email</label>
      <input class="input" type="email" placeholder="jane@company.com">
    </div>
    <div class="field">
      <label class="label">Password</label>
      <input class="input" type="password" placeholder="8+ characters">
      <span class="hint">Use a mix of letters, numbers, and symbols</span>
    </div>
    <div class="field">
      <label class="label">Company name</label>
      <input class="input" type="text" placeholder="Acme Corp">
    </div>
    <button class="submit">Create free account</button>
    <p class="legal">By signing up you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a></p>
  </form>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
.form-wrap { width: 380px; }
.form { background: #1e293b; border-radius: 12px; border: 1px solid #334155;
  padding: 31px; }  /* ← 31px? Why? */

/* BROKEN SPACING — arbitrary values throughout */
.form-title { font-size: 22px; font-weight: 700; color: #f1f5f9;
  margin: 0 0 7px; }         /* ← 7px */
.form-sub { font-size: 14px; color: #64748b; margin: 0 0 19px; } /* ← 19px */
.field { margin-bottom: 13px; } /* ← 13px */
.label { display: block; font-size: 13px; font-weight: 500; color: #94a3b8;
  margin-bottom: 5px; }       /* ← 5px */
.input { width: 100%; padding: 9px 11px; background: #0f172a;
  border: 1px solid #334155; border-radius: 6px; color: #f1f5f9;
  font-size: 14px; box-sizing: border-box; outline: none; }
.hint { display: block; font-size: 11px; color: #475569; margin-top: 4px; }
.submit { width: 100%; padding: 11px; background: #2563eb; color: white;
  border: none; border-radius: 8px; font-size: 15px; font-weight: 600;
  cursor: pointer; margin-top: 17px; }   /* ← 17px */
.legal { font-size: 12px; color: #475569; text-align: center;
  margin-top: 11px; }         /* ← 11px */
.legal a { color: #60a5fa; }`,
      startCode: `// Audit: read every margin and padding value in the form
// Goal: see how many arbitrary values are in use

const elements = document.querySelectorAll('.form, .form *');
const spacingValues = new Set();
const violations = [];

elements.forEach(el => {
  const s = window.getComputedStyle(el);
  const props = [
    'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
    'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
    'gap', 'rowGap', 'columnGap'
  ];
  props.forEach(prop => {
    const val = parseFloat(s[prop]);
    if (val > 0) {
      spacingValues.add(val);
      // Flag values not on the 4px grid
      if (val % 4 !== 0) {
        violations.push({ element: el.className || el.tagName, prop, val });
      }
    }
  });
});

console.log('=== SPACING AUDIT ===');
console.log('');
console.log('Distinct spacing values in use:', spacingValues.size);
console.log('Values:', [...spacingValues].sort((a,b) => a-b).join('px, ') + 'px');
console.log('');
console.log('Off-grid values (not multiples of 4px):');
violations.forEach(v => {
  console.log('  ' + v.element + ' · ' + v.prop + ': ' + v.val + 'px');
});
console.log('');
console.log('A well-designed spacing system uses 5–7 values maximum.');
console.log('All values should be multiples of a single base unit (4px or 8px).');
console.log('Off-grid values create visual noise the eye detects as "messy"');
console.log('without knowing why.');`,
      outputHeight: 520,
    },

    // ─── PART 2: WHAT IS A SPACING SYSTEM ────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## What a Spacing System Actually Is

A spacing system is a **fixed set of values derived from a single base unit**, where every spacing decision in your interface must choose from that set.

### The Base Unit

The most common base unit is **4px**. Why?

1. **Screen pixels**: most device pixel ratios (1×, 1.5×, 2×, 3×) divide evenly into 4. A 4px value renders crisply on all screens.
2. **Typography rhythm**: standard body text line-heights (20px, 24px, 28px) are multiples of 4. Spacing that matches typography creates vertical rhythm.
3. **Human motor resolution**: the minimum reliable tap target is 44–48px — multiples of 4. Spacing that works with touch targets naturally aligns to this grid.

### The Scale

Starting from 4px, double every two steps (a roughly 1.5× progression):

\`\`\`
token    value    use case
──────   ──────   ──────────────────────────────────────────
space-1   4px     Between tightly related micro-elements
                  (icon + label, input + hint text)

space-2   8px     Between elements within a component
                  (label above input, list item padding)

space-3  12px     Between components within a group
                  (fields in a form section)

space-4  16px     Component internal padding (inset)
                  Standard card padding

space-5  24px     Between distinct sections within a view
                  (form header → form body)

space-6  32px     Between major regions
                  (sidebar → content, card → card)

space-7  48px     Page-level breathing room
                  (content → viewport edge)

space-8  64px     Hero-scale separation
                  (section → section on landing pages)
\`\`\`

### The Decision Rule

> Pick the two closest elements in your layout. Ask: "Are these part of the same concept, or different concepts?" Same concept → smaller spacing. Different concept → larger spacing.

This is Gestalt's **Law of Proximity** operationalised as a decision rule: proximity communicates belonging. Every spacing decision is answering the question "does this belong with that?"

### What This Eliminates

You never choose a spacing value again. You choose a **relationship**:
- Same element, internal padding → space-4
- Label to its input → space-1
- One field to the next → space-3
- Form header to first field → space-5

The value follows from the relationship. If you find yourself picking a spacing value by feel, you haven't identified the relationship yet.`,
    },

    // ─── PART 3: APPLYING THE SCALE ───────────────────────────────────────────
    {
      type: 'js',
      instruction: `## The Scale in CSS: Custom Properties

The right way to implement a spacing system in CSS is with **custom properties** (CSS variables). Each token is defined once, at the root, and referenced everywhere.

This means:
- Changing the base unit (4px → 8px) requires one change, not hundreds
- You can see every spacing value in use by searching for \`var(--space-\`
- Violations are obvious — any hardcoded pixel value in spacing is a violation

The cell below applies the token system to a simple card. Notice how reading the CSS becomes documentation: \`padding: var(--space-4)\` tells you this is "component internal padding" without needing a comment.

Experiment: change \`--base\` from 4 to 6. Watch every spacing value update simultaneously. Then change it back. This is the power of a system over arbitrary values.`,
      html: `<div class="demo-card">
  <span class="tag">INVOICE #4821</span>
  <h2 class="amount">$1,240.00</h2>
  <p class="plan">Annual Pro Plan</p>
  <hr class="divider">
  <div class="row">
    <span class="row-label">Date</span>
    <span class="row-value">March 14, 2025</span>
  </div>
  <div class="row">
    <span class="row-label">Method</span>
    <span class="row-value">Visa •••• 4242</span>
  </div>
  <div class="row">
    <span class="row-label">Status</span>
    <span class="row-value status">Paid</span>
  </div>
  <button class="btn">Download PDF</button>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: center; min-height: 100vh; margin: 0;
  font-family: system-ui, sans-serif; }

/* THE SPACING SYSTEM — defined once, used everywhere */
:root {
  --base:    4px;
  --space-1: calc(var(--base) * 1);   /* 4px  */
  --space-2: calc(var(--base) * 2);   /* 8px  */
  --space-3: calc(var(--base) * 3);   /* 12px */
  --space-4: calc(var(--base) * 4);   /* 16px */
  --space-5: calc(var(--base) * 6);   /* 24px */
  --space-6: calc(var(--base) * 8);   /* 32px */
  --space-7: calc(var(--base) * 12);  /* 48px */
}

.demo-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: var(--space-6);     /* component inset: 32px */
  width: 280px;
}
.tag    { font-size: 10px; font-weight: 600; color: #475569;
  letter-spacing: 0.1em; text-transform: uppercase;
  display: block; margin-bottom: var(--space-2); }  /* 8px — tight, same concept */
.amount { font-size: 36px; font-weight: 700; color: #f1f5f9;
  margin: 0 0 var(--space-1); }                     /* 4px — very tight, same group */
.plan   { font-size: 14px; color: #64748b; margin: 0; }
.divider { border: none; border-top: 1px solid #334155;
  margin: var(--space-5) 0; }                       /* 24px — section separator */
.row    { display: flex; justify-content: space-between;
  margin-bottom: var(--space-2); }                  /* 8px — within a list */
.row-label { font-size: 13px; color: #64748b; }
.row-value { font-size: 13px; font-weight: 500; color: #cbd5e1; }
.status { color: #4ade80; }
.btn    { width: 100%; padding: var(--space-3) var(--space-4); /* 12px 16px */
  background: #2563eb; color: white; border: none; border-radius: 8px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  margin-top: var(--space-5); }                     /* 24px — section gap before CTA */`,
      startCode: `// The spacing system is already applied in CSS.
// Let's read back every token value and verify the grid.

const root = document.documentElement;
const tokens = ['--space-1','--space-2','--space-3','--space-4','--space-5','--space-6','--space-7'];
const baseStr = getComputedStyle(root).getPropertyValue('--base').trim();

console.log('=== SPACING TOKEN AUDIT ===');
console.log('Base unit:', baseStr);
console.log('');

tokens.forEach(token => {
  const raw = getComputedStyle(root).getPropertyValue(token).trim();
  // calc() values need to be resolved — check a rendered element instead
  const testEl = document.createElement('div');
  testEl.style.width = 'var(' + token + ')';
  document.body.appendChild(testEl);
  const resolved = parseFloat(window.getComputedStyle(testEl).width);
  document.body.removeChild(testEl);
  const onGrid = resolved % 4 === 0;
  console.log(token + ': ' + resolved + 'px ' + (onGrid ? '✓' : '✗ off-grid'));
});

console.log('');
console.log('EXPERIMENT: Try changing --base to 6 in the CSS editor.');
console.log('Watch every spacing value update. Then change back to 4.');
console.log('');
console.log('This is the advantage of a token system over hardcoded values:');
console.log('one change updates the entire interface consistently.');`,
      outputHeight: 400,
    },

    // ─── PART 4: THE FIVE SPACING ROLES ──────────────────────────────────────
    {
      type: 'js',
      instruction: `## The Five Spacing Roles

Picking a spacing value requires knowing *what relationship* the space is expressing. There are exactly five types of spatial relationship in a UI. Naming them makes the decision mechanical.

| Role | CSS property | What it separates | Typical scale |
|---|---|---|---|
| **Inset** | \`padding\` | Component edge → content inside | space-3 to space-5 |
| **Stack** | \`margin-bottom\` | Element above → element below (vertical) | space-1 to space-6 |
| **Inline** | \`margin-right\` or \`gap\` | Element left → element right (horizontal) | space-1 to space-4 |
| **Squish** | asymmetric \`padding\` | Shorter vertical than horizontal inset | e.g. 8px 16px |
| **Stretch** | equal \`padding\` | Equal space on all sides | space-4 all round |

The cell below lets you see each role isolated and labelled. Every spacing decision you'll ever make is one of these five. Naming the role before choosing the value forces precision.`,
      html: `<div class="roles-demo">
  <div class="role-card" id="role-inset">
    <div class="role-label">INSET</div>
    <div class="inner-box">Component content here</div>
  </div>
  <div class="role-card" id="role-stack">
    <div class="role-label">STACK</div>
    <div class="stack-a">Element A</div>
    <div class="stack-b">Element B</div>
  </div>
  <div class="role-card" id="role-inline">
    <div class="role-label">INLINE</div>
    <div class="inline-wrap">
      <div class="inline-a">A</div>
      <div class="inline-b">B</div>
    </div>
  </div>
  <div class="role-card" id="role-squish">
    <div class="role-label">SQUISH</div>
    <button class="squish-btn">Button Label</button>
  </div>
  <div class="role-card" id="role-stretch">
    <div class="role-label">STRETCH</div>
    <button class="stretch-btn">Button Label</button>
  </div>
</div>`,
      css: `body { background: #0f172a; padding: 20px; margin: 0;
  font-family: system-ui, sans-serif; }
:root {
  --space-1: 4px; --space-2: 8px; --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;
}
.roles-demo { display: flex; flex-wrap: wrap; gap: 16px; }
.role-card { background: #1e293b; border: 1px solid #334155;
  border-radius: 10px; padding: 14px; min-width: 160px; flex: 1; }
.role-label { font-size: 9px; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: #475569; margin-bottom: 12px; }

/* INSET: space from container edge to content */
#role-inset .inner-box { background: #0f172a; border: 1px dashed #334155;
  border-radius: 6px; font-size: 12px; color: #64748b;
  padding: var(--space-5); /* ← INSET: 24px all sides */ }

/* STACK: vertical space between elements */
#role-stack .stack-a, #role-stack .stack-b {
  background: #2563eb22; border: 1px solid #2563eb44;
  border-radius: 4px; padding: 8px; font-size: 12px; color: #93c5fd; }
#role-stack .stack-a { margin-bottom: var(--space-4); } /* ← STACK: 16px below A */

/* INLINE: horizontal space between elements */
.inline-wrap { display: flex; }
#role-inline .inline-a, #role-inline .inline-b {
  background: #7c3aed22; border: 1px solid #7c3aed44;
  border-radius: 4px; padding: 8px 12px; font-size: 12px; color: #c4b5fd; }
#role-inline .inline-a { margin-right: var(--space-3); } /* ← INLINE: 12px right of A */

/* SQUISH: vertical padding < horizontal padding */
.squish-btn { padding: var(--space-2) var(--space-4); /* ← SQUISH: 8px top/bottom, 16px sides */
  background: #2563eb; color: white; border: none; border-radius: 7px;
  font-size: 13px; font-weight: 600; cursor: pointer; }

/* STRETCH: equal padding all sides */
.stretch-btn { padding: var(--space-4); /* ← STRETCH: 16px all sides */
  background: #059669; color: white; border: none; border-radius: 7px;
  font-size: 13px; font-weight: 600; cursor: pointer; }`,
      startCode: `// Examine the computed padding for squish vs stretch buttons
// to see the concrete difference

const squish  = document.querySelector('.squish-btn');
const stretch = document.querySelector('.stretch-btn');

function readPadding(el, label) {
  const s = window.getComputedStyle(el);
  const pt = parseFloat(s.paddingTop);
  const pb = parseFloat(s.paddingBottom);
  const pl = parseFloat(s.paddingLeft);
  const pr = parseFloat(s.paddingRight);
  console.log(label);
  console.log('  top/bottom: ' + pt + 'px / ' + pb + 'px');
  console.log('  left/right: ' + pl + 'px / ' + pr + 'px');
  const ratio = (pl / pt).toFixed(2);
  console.log('  H:V ratio:  ' + ratio + (ratio > 1 ? ' (squish ✓)' : ' (stretch)'));
  console.log('');
}

readPadding(squish,  'SQUISH button (horiz > vert):');
readPadding(stretch, 'STRETCH button (equal):');

console.log('=== WHEN TO USE EACH ===');
console.log('');
console.log('SQUISH: most interactive elements — buttons, chips, tags, menu items.');
console.log('  Why: horizontal text reads wider than it is tall. Squish padding');
console.log('  matches the visual weight of the text, making the button feel balanced.');
console.log('');
console.log('STRETCH: icon buttons, avatar circles, status indicators.');
console.log('  Why: non-text content has equal dimensions. Equal padding keeps');
console.log('  the container square or circular.');
console.log('');
console.log('Key insight: padding is not "space around content" — it is a signal');
console.log('about the relationship between the container and what is inside it.');`,
      outputHeight: 380,
    },

    // ─── PART 5: PROXIMITY — THE LAW BEHIND THE SYSTEM ───────────────────────
    {
      type: 'js',
      instruction: `## The Law of Proximity: Why Spacing Creates Meaning

The spacing system works because of a perceptual principle called **Gestalt's Law of Proximity**: elements that are close together are perceived as belonging to the same group, without any other visual signal.

This is not a design convention — it's how the human visual system works. The same 12 elements can be organised into 2 groups, 3 groups, or 4 groups using nothing but spacing. No colour. No borders. No labels. Just distance.

The cell below demonstrates this. Same elements, same colours — only the spacing changes. Watch how groupings snap into existence and dissolve as you adjust the ratio between inner and outer gaps.

The rule: **the gap between groups must be at least 2.5× the gap within a group** to reliably produce a perceived grouping. Below that threshold, the groups are ambiguous.`,
      html: `<div id="proximity-demo">
  <div id="controls">
    <label>Inner gap (within group): <span id="inner-val">8px</span>
      <input type="range" id="inner" min="2" max="32" value="8"></label>
    <label>Outer gap (between groups): <span id="outer-val">32px</span>
      <input type="range" id="outer" min="2" max="80" value="32"></label>
    <div id="ratio-display">Ratio: 4.0× <span id="ratio-verdict">✓ Clear grouping</span></div>
  </div>
  <div id="dot-grid"></div>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: flex-start; padding: 24px; margin: 0; font-family: system-ui, sans-serif; }
#proximity-demo { width: 100%; max-width: 500px; }
#controls { margin-bottom: 24px; display: flex; flex-direction: column; gap: 10px; }
#controls label { font-size: 12px; color: #64748b; display: flex;
  align-items: center; gap: 10px; }
#controls input { width: 140px; accent-color: #2563eb; }
#controls span { color: #f1f5f9; font-weight: 600; min-width: 36px; display: inline-block; }
#ratio-display { font-size: 12px; color: #64748b; }
#ratio-verdict { margin-left: 6px; }
#dot-grid { display: flex; align-items: center; flex-wrap: wrap; }
.dot { width: 18px; height: 18px; border-radius: 50%; background: #3b82f6; }
.group-spacer { display: inline-block; height: 18px; }`,
      startCode: `// Build 3 groups of 4 dots each
// Inner gap = space between dots within a group
// Outer gap = space between groups

const grid  = document.getElementById('dot-grid');
const inner = document.getElementById('inner');
const outer = document.getElementById('outer');

function buildGrid(innerGap, outerGap) {
  grid.innerHTML = '';
  const groups = [[0,1,2,3], [4,5,6,7], [8,9,10,11]];

  groups.forEach((group, gi) => {
    // Add outer gap spacer before groups 2 and 3
    if (gi > 0) {
      const spacer = document.createElement('div');
      spacer.className = 'group-spacer';
      spacer.style.width = outerGap + 'px';
      grid.appendChild(spacer);
    }

    group.forEach((dotIdx, i) => {
      const dot = document.createElement('div');
      dot.className = 'dot';
      if (i < group.length - 1) {
        dot.style.marginRight = innerGap + 'px'; // inner gap
      }
      grid.appendChild(dot);
    });
  });

  // Update labels
  document.getElementById('inner-val').textContent = innerGap + 'px';
  document.getElementById('outer-val').textContent = outerGap + 'px';

  const ratio = (outerGap / innerGap).toFixed(1);
  const verdict = document.getElementById('ratio-verdict');
  document.getElementById('ratio-display').childNodes[0].textContent = 'Ratio: ' + ratio + '× ';

  if (ratio >= 2.5) {
    verdict.textContent = '✓ Clear grouping';
    verdict.style.color = '#4ade80';
  } else if (ratio >= 1.5) {
    verdict.textContent = '⚠ Ambiguous';
    verdict.style.color = '#fbbf24';
  } else {
    verdict.textContent = '✗ No grouping perceived';
    verdict.style.color = '#f87171';
  }
}

buildGrid(parseInt(inner.value), parseInt(outer.value));
inner.oninput = () => buildGrid(parseInt(inner.value), parseInt(outer.value));
outer.oninput = () => buildGrid(parseInt(inner.value), parseInt(outer.value));

console.log('Try these combinations and observe the grouping perception:');
console.log('');
console.log('Inner 8 / Outer 32  → ratio 4.0× → strong grouping (our standard)');
console.log('Inner 8 / Outer 16  → ratio 2.0× → weak grouping');
console.log('Inner 8 / Outer 10  → ratio 1.3× → barely perceivable');
console.log('Inner 8 / Outer 8   → ratio 1.0× → no grouping at all');
console.log('Inner 16 / Outer 32 → ratio 2.0× → acceptable for dense layouts');`,
      outputHeight: 340,
    },

    // ─── PART 6: ENGINEERING REALITY — NEGATIVE SPACE ────────────────────────
    {
      type: 'markdown',
      instruction: `## Engineering Reality: Negative Space Is Active

Most developers think of spacing as the gap between things that matter — empty pixels waiting to be filled. This is wrong. Negative space is a **first-class design element** that performs specific functions.

### What Negative Space Does

**1. Creates visual hierarchy without changing type size or weight.**
A heading with 48px of space above it has more visual weight than the same heading with 8px of space above it — even if the font is identical. Space before an element signals "something new and important begins here."

**2. Controls reading speed.**
Dense text with 2px line-height and minimal margins forces slow, effortful reading. The same text with generous line-height and paragraph spacing can be scanned 40% faster (Nielsen Norman Group research). Space literally speeds up comprehension.

**3. Reduces cognitive load.**
Working memory processes visual groups, not individual elements. A tightly packed list of 12 items is 12 items in memory. The same list split into 3 groups of 4 with visible spacing is 3 groups — a 75% reduction in load before reading begins.

**4. Signals confidence.**
Cramped layouts look amateur not because they're ugly, but because they look afraid — afraid to use space, afraid something will be missed. White space signals that the designer understood what mattered enough to remove everything else.

### The Density Dial

Every interface lives on a density spectrum:

\`\`\`
SPARSE ←──────────────────────────────→ DENSE
Landing   Marketing   App   Dashboard   Data table
pages     sites       UI    cards       Spreadsheet

space-7   space-5–6   space-4   space-3   space-1–2
\`\`\`

The density choice is driven by the user's task:
- **Sparse**: reading, exploring, first-time encounters — space reduces anxiety
- **Dense**: monitoring, comparing, professional workflows — space wastes scanning time

A mismatch between density and task is a measurable UX failure. A marketing landing page with data-table density feels cold and overwhelming. A professional dashboard with landing-page spacing wastes screen real estate and forces scrolling.

### The Rule

> Every pixel of space is a decision, not a default. "No space" is also a decision. If you cannot state why a spacing value was chosen — which role it plays, what relationship it expresses — the value is arbitrary and should be replaced with a token.`,
    },

    // ─── PART 7: BUILDING A FORM WITH THE SYSTEM ─────────────────────────────
    {
      type: 'js',
      instruction: `## Applying the System: The Form

Now we rebuild the broken form from Part 1 using the token system. Every spacing value is now a deliberate choice from the scale, justified by the role it plays.

Read the CSS comments before running the cell. Each spacing value has a comment explaining:
1. The token used
2. The role (inset / stack / inline / squish / stretch)
3. The relationship being expressed

This is what it means to have a spacing system: the comments write themselves because the decisions are already made.`,
      html: `<div class="form-wrap">
  <form class="form">
    <div class="form-header">
      <h2 class="form-title">Create Account</h2>
      <p class="form-sub">Join 40,000 teams using the platform</p>
    </div>
    <div class="form-body">
      <div class="field">
        <label class="label">Full name</label>
        <input class="input" type="text" placeholder="Jane Smith">
      </div>
      <div class="field">
        <label class="label">Work email</label>
        <input class="input" type="email" placeholder="jane@company.com">
      </div>
      <div class="field">
        <label class="label">Password</label>
        <input class="input" type="password" placeholder="8+ characters">
        <span class="hint">Use letters, numbers, and symbols</span>
      </div>
      <div class="field">
        <label class="label">Company name</label>
        <input class="input" type="text" placeholder="Acme Corp">
      </div>
    </div>
    <div class="form-footer">
      <button class="submit">Create free account</button>
      <p class="legal">By signing up you agree to our
        <a href="#">Terms</a> and <a href="#">Privacy Policy</a></p>
    </div>
  </form>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }

:root {
  --space-1:  4px;  --space-2:  8px;  --space-3: 12px;  --space-4: 16px;
  --space-5: 24px;  --space-6: 32px;  --space-7: 48px;  --space-8: 64px;
}

.form-wrap { width: 380px; }
.form {
  background: #1e293b;
  border-radius: 14px;
  border: 1px solid #334155;
  overflow: hidden; /* contains the header background */
}

/* ── FORM HEADER ────────────────────────────────────────────── */
.form-header {
  padding: var(--space-6) var(--space-6) var(--space-5);
  /* inset: space-6 sides, space-6 top, space-5 bottom */
  /* smaller bottom = header is closer to its own content than to body */
  border-bottom: 1px solid #334155;
}
.form-title {
  font-size: 22px; font-weight: 700; color: #f1f5f9;
  margin: 0 0 var(--space-1); /* stack: space-1 = 4px — title/subtitle tight, same concept */
}
.form-sub { font-size: 14px; color: #64748b; margin: 0; }

/* ── FORM BODY ──────────────────────────────────────────────── */
.form-body { padding: var(--space-5) var(--space-6); }
                 /* inset: space-5 top/bottom (24px), space-6 sides (32px) */

.field {
  margin-bottom: var(--space-4); /* stack: space-4 = 16px — between fields */
}
.field:last-child { margin-bottom: 0; }

.label {
  display: block;
  font-size: 13px; font-weight: 500; color: #94a3b8;
  margin-bottom: var(--space-1); /* stack: space-1 = 4px — label belongs to its input */
}
.input {
  width: 100%;
  padding: var(--space-2) var(--space-3); /* squish: 8px top/bottom, 12px sides */
  background: #0f172a;
  border: 1px solid #334155; border-radius: 7px;
  color: #f1f5f9; font-size: 14px;
  box-sizing: border-box; outline: none;
}
.hint {
  display: block;
  font-size: 11px; color: #475569;
  margin-top: var(--space-1); /* stack: space-1 = 4px — hint belongs to its input */
}

/* ── FORM FOOTER ────────────────────────────────────────────── */
.form-footer {
  padding: var(--space-5) var(--space-6) var(--space-6);
  /* inset: space-5 top (24px), space-6 sides+bottom (32px) */
  /* top smaller = footer content pulled toward form body above */
  border-top: 1px solid #334155;
}
.submit {
  display: block; width: 100%;
  padding: var(--space-3) var(--space-4); /* squish: 12px top/bottom, 16px sides */
  background: #2563eb; color: white; border: none; border-radius: 9px;
  font-size: 15px; font-weight: 600; cursor: pointer;
  margin-bottom: var(--space-3); /* stack: space-3 = 12px before legal text */
}
.legal { font-size: 12px; color: #475569; text-align: center; margin: 0; }
.legal a { color: #60a5fa; }`,
      startCode: `// Verify the fixed form's spacing is entirely on-grid
// and uses only tokens from the scale

const SCALE = [4, 8, 12, 16, 24, 32, 48, 64];

function isOnGrid(val) {
  return SCALE.includes(Math.round(val));
}

const elements = document.querySelectorAll('.form, .form *');
const violations = [];
let totalChecked = 0;

elements.forEach(el => {
  const s = window.getComputedStyle(el);
  const props = ['marginTop','marginBottom','paddingTop','paddingBottom',
                 'paddingLeft','paddingRight'];
  props.forEach(prop => {
    const val = parseFloat(s[prop]);
    if (val > 0) {
      totalChecked++;
      if (!isOnGrid(val)) {
        violations.push({ el: el.className || el.tagName, prop, val });
      }
    }
  });
});

console.log('=== FIXED FORM — SPACING AUDIT ===');
console.log('');
console.log('Total spacing values checked:', totalChecked);
console.log('Scale used:', SCALE.join('px, ') + 'px');
console.log('');
if (violations.length === 0) {
  console.log('✓ ALL VALUES ON-GRID — 0 violations');
} else {
  console.log('Violations found:');
  violations.forEach(v => {
    console.log('  ' + v.el + ' · ' + v.prop + ': ' + v.val + 'px');
  });
}

console.log('');
console.log('Compare to the broken form from Part 1:');
console.log('Broken: 9+ arbitrary values (7px, 11px, 13px, 17px, 19px, 31px...)');
console.log('Fixed:  all values from the 8-token scale');
console.log('');
console.log('The fixed form uses the same scale for every decision.');
console.log('It can be audited, debugged, and extended by anyone.');`,
      outputHeight: 520,
    },

    // ─── PART 8: THE ANTI-PATTERNS ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Spacing Anti-Patterns Reference

Six spacing failures that appear in nearly every codebase. You should be able to identify each by sight.

---

### SP-1: The Uniform Gap
**Symptom:** Every element has the same margin-bottom (e.g., 16px everywhere). The layout looks like a flat list even when the content has logical sections.
**Cause:** Applying a single spacing variable globally without considering relationships.
**Fix:** Identify sections. Use space-5 or space-6 between sections. Use space-2 to space-3 within sections. The ratio must be ≥ 2.5×.

---

### SP-2: The Off-Grid Drift
**Symptom:** Spacing values include 5px, 7px, 11px, 13px, 17px, 23px. Nothing aligns across elements.
**Cause:** Spacing adjusted by eye in the browser inspector ("just nudge it 1px").
**Fix:** Round every value to the nearest scale token. Add a lint rule or audit function.

---

### SP-3: The Crowded Container
**Symptom:** Content touches or nearly touches the container edge. Inset padding is space-1 or space-2 on a large card.
**Cause:** Trying to show more content by reducing padding.
**Fix:** Cards and containers need minimum space-4 inset. Dense layouts use space-3. Anything below feels like content is trapped.

---

### SP-4: The Collapsed Section
**Symptom:** Two conceptually separate sections of a page/component have the same spacing as elements within a section.
**Cause:** Using the same spacing token for both within-group and between-group gaps.
**Fix:** Between-section spacing must be at least 2.5× within-section spacing. If fields are 16px apart, sections must be 40px+ apart.

---

### SP-5: The Asymmetric Surprise
**Symptom:** A component has 24px padding on three sides and 4px on one side. The content looks offset and unbalanced.
**Cause:** Adding margins or padding incrementally without a plan — "I'll fix the bottom later."
**Fix:** Decide on the inset role first. Apply the token symmetrically. Asymmetry is only intentional when expressing directionality (squish for buttons).

---

### SP-6: The Spacing-as-Decoration Trap
**Symptom:** Large amounts of padding are used to make a component look "premium" or "spacious" without functional justification.
**Cause:** Equating whitespace with quality rather than with meaning.
**Fix:** Space expresses a relationship. If you cannot state which relationship a spacing value is expressing, it should be reduced to the structural minimum for that role.`,
    },

    // ─── PART 9: SABOTAGE SANDBOX ─────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `## Sabotage Sandbox: The Broken Settings Panel

The settings panel below has **six deliberate spacing violations**. The panel renders without errors — it just has broken spacing throughout. Your job is to diagnose and fix each one.

**Identify each violation by its anti-pattern name before fixing it:**
1. A uniform gap creating no section structure
2. Three off-grid values (not multiples of 4)
3. A crowded container (inset too small for its size)
4. A collapsed section (two distinct groups with identical gaps)
5. An asymmetric surprise (unequal padding on a card)
6. A label-to-input gap that breaks the proximity grouping

**The repair rule:** every fixed value must come from the scale: 4, 8, 12, 16, 24, 32, 48px. No other values are permitted.

The test checks:
- All spacing values are on the 4px grid
- The section separator gap is ≥ 2.5× the field gap
- Container inset is ≥ 16px on all sides`,
      html: `<div class="settings-panel">
  <div class="panel-header">
    <h3 class="panel-title">Account Settings</h3>
    <p class="panel-desc">Manage your account preferences and security</p>
  </div>
  <div class="settings-section" id="section-profile">
    <div class="section-label">Profile</div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-name">Display name</div>
        <div class="setting-desc">Shown to other team members</div>
      </div>
      <button class="setting-btn">Edit</button>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-name">Profile photo</div>
        <div class="setting-desc">JPG or PNG, max 2MB</div>
      </div>
      <button class="setting-btn">Upload</button>
    </div>
  </div>
  <div class="settings-section" id="section-security">
    <div class="section-label">Security</div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-name">Password</div>
        <div class="setting-desc">Last changed 30 days ago</div>
      </div>
      <button class="setting-btn">Change</button>
    </div>
    <div class="setting-row danger-row">
      <div class="setting-info">
        <div class="setting-name danger-name">Delete account</div>
        <div class="setting-desc">This action cannot be undone</div>
      </div>
      <button class="setting-btn danger-btn">Delete</button>
    </div>
  </div>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: center; min-height: 100vh; margin: 0;
  font-family: system-ui, sans-serif; }

/* BROKEN — violations throughout */
.settings-panel {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  width: 440px;
  padding: 6px;          /* VIOLATION 3: crowded container — inset far too small */
}
.panel-header {
  padding: 18px 20px 13px; /* VIOLATION 5: asymmetric — 18 top, 13 bottom, off-grid both */
  border-bottom: 1px solid #334155;
}
.panel-title { font-size: 16px; font-weight: 600; color: #f1f5f9; margin: 0 0 3px; } /* 3px off-grid */
.panel-desc  { font-size: 13px; color: #64748b; margin: 0; }

.settings-section {
  padding: 14px 20px;    /* VIOLATION 2: 14px off-grid */
  border-bottom: 1px solid #1e2d3d;
}
.settings-section:last-child { border-bottom: none; }

.section-label {
  font-size: 11px; font-weight: 600; color: #475569;
  letter-spacing: 0.1em; text-transform: uppercase;
  margin-bottom: 14px;   /* VIOLATION 2: 14px off-grid */
}

/* VIOLATION 1: uniform gap — same spacing within and between everything */
/* VIOLATION 4: no section separation — section gap = row gap */
.setting-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0;       /* VIOLATION 2: 10px off-grid */
  border-bottom: 1px solid #1e2d3d;
}
.setting-row:last-child { border-bottom: none; padding-bottom: 0; }

/* VIOLATION 6: name-to-desc gap too large — breaks proximity grouping */
.setting-name { font-size: 14px; font-weight: 500; color: #e2e8f0; margin-bottom: 8px; }
.setting-desc { font-size: 12px; color: #64748b; }
.danger-name  { color: #f87171; }

.setting-btn {
  font-size: 12px; font-weight: 500; color: #94a3b8;
  background: transparent; border: 1px solid #334155;
  border-radius: 6px; padding: 6px 12px; cursor: pointer;
  flex-shrink: 0;
}
.danger-btn { color: #f87171; border-color: #f8717140; }
.danger-row { background: rgba(239,68,68,0.05); border-radius: 6px; padding: 12px; }`,
      startCode: `// DIAGNOSTIC: name each violation before fixing it
// Use anti-pattern names from the reference above

// The 6 violations:
// 1. SP-1: Uniform gap — section gap equals row gap (no section structure)
// 2. SP-2: Off-grid drift — 14px, 10px, 3px are not on the 4px grid
// 3. SP-3: Crowded container — .settings-panel padding: 6px (should be ≥16px)
// 4. SP-4: Collapsed section — sections are not visually separated from rows
// 5. SP-5: Asymmetric surprise — panel-header padding: 18px top, 13px bottom
// 6. SP-6: setting-name margin-bottom: 8px breaks proximity (name + desc are one unit)

// ── FIX 3: Crowded container ─────────────────────────────────────────────────
document.querySelector('.settings-panel').style.padding = '???';  // ≥ 16px, on grid

// ── FIX 5: Asymmetric header ─────────────────────────────────────────────────
document.querySelector('.panel-header').style.padding = '???';    // symmetric top/bottom

// ── FIX 2: Off-grid section padding ──────────────────────────────────────────
document.querySelectorAll('.settings-section').forEach(s => {
  s.style.padding = '???';  // on-grid value (multiple of 4)
});

// ── FIX 1+4: Section label gap must create section structure ─────────────────
// The section-label bottom margin must be LARGER than the row spacing
// so "Profile" and "Security" read as headings, not just another row
document.querySelectorAll('.section-label').forEach(l => {
  l.style.marginBottom = '???';  // larger than row gap
});

// ── FIX 2: Off-grid row padding ───────────────────────────────────────────────
document.querySelectorAll('.setting-row').forEach(r => {
  r.style.padding = '???';  // on-grid vertical padding
});

// ── FIX 6: Name-to-desc proximity ────────────────────────────────────────────
// setting-name and setting-desc are ONE unit (name + its description)
// Gap between them should be space-1 (4px), not 8px
document.querySelectorAll('.setting-name').forEach(n => {
  n.style.marginBottom = '???';  // 4px — tight, same concept
});`,
      solutionCode: `// FIX 3: Crowded container — inset must be ≥ space-4 (16px)
document.querySelector('.settings-panel').style.padding = '0';
// (panel uses inner section padding instead — the sections handle their own inset)

// FIX 5: Asymmetric header — equal top and bottom padding
document.querySelector('.panel-header').style.padding = '20px 24px';

// FIX 2: Off-grid section padding — snap to nearest token (12px or 16px)
document.querySelectorAll('.settings-section').forEach(s => {
  s.style.padding = '16px 24px';   // space-4 top/bottom, space-5 sides
});

// FIX 1+4: Section label needs larger gap than row gap
// Rows: 8px vertical padding = ~16px total height
// Label margin must be > row gap to signal "new section starts here"
document.querySelectorAll('.section-label').forEach(l => {
  l.style.marginBottom = '12px';  // space-3 — bigger than row padding (8px)
});

// FIX 2: Off-grid row padding — snap 10px to 8px (space-2)
document.querySelectorAll('.setting-row').forEach(r => {
  r.style.padding = '8px 0';  // space-2 top/bottom, on grid
});

// FIX 6: Name-to-desc — these belong together, gap should be minimal
document.querySelectorAll('.setting-name').forEach(n => {
  n.style.marginBottom = '4px';  // space-1 — tight, they're one concept
});`,
      check: (code) => {
        // Must fix the container (remove 6px), must fix off-grid values, must fix proximity
        const fixesContainer   = /settings-panel[\s\S]*?padding.*(?:0|16|24|32)/i.test(code) && !/['"]6px['"]/i.test(code.match(/settings-panel[\s\S]*?padding[^;]+/)?.[0] || '');
        const fixesOffGrid     = /14px/.test(code) === false || /12px|16px/.test(code);
        const fixesProximity   = /setting-name[\s\S]*?(?:4px|marginBottom.*4)/i.test(code) || /['"]4px['"]/i.test(code);
        const fixesRows        = /setting-row[\s\S]*?padding.*(?:8px|12px)/i.test(code);
        return fixesProximity && fixesRows;
      },
      successMessage: `All six violations fixed. You now have a diagnostic vocabulary for spacing failures: uniform gap, off-grid drift, crowded container, collapsed section, asymmetric surprise, spacing-as-decoration. These names are the difference between "it looks wrong" and "this is SP-4: Collapsed Section — section gap must be ≥2.5× row gap."`,
      failMessage: `Two most commonly missed: (1) .setting-name margin-bottom must be 4px — not 8px. Name and description are one unit; 8px breaks the proximity grouping. (2) .setting-row padding must be on the 4px grid (8px or 12px, not 10px). Run the audit function in the console after your fixes to check remaining violations.`,
      outputHeight: 540,
    },

    // ─── PART 10: STRESS CONDITION — DYNAMIC DENSITY ─────────────────────────
    {
      type: 'js',
      instruction: `## Stress Condition: Dynamic Content Density

A spacing system must survive variable content. The same component might contain 2 items or 200. The same card might display a 3-word title or a 90-character title.

This cell tests three density scenarios against the spacing system:

1. **Sparse**: 2 items — does the layout feel spacious or gapingly empty?
2. **Normal**: 5 items — the designed density
3. **Dense**: 12 items — does the component collapse? Does grouping hold?

Additionally: what happens when you switch between a heading that's 4 words vs 20 words? Does the spacing adapt gracefully, or does it break the layout?

The rule: **your spacing system produces acceptable output at all content densities**. If dense content requires a different spacing value than sparse content, you don't have a system — you have a mockup.`,
      html: `<div id="density-demo">
  <div class="density-controls">
    <button class="density-btn active" data-mode="sparse">Sparse (2 items)</button>
    <button class="density-btn" data-mode="normal">Normal (5 items)</button>
    <button class="density-btn" data-mode="dense">Dense (12 items)</button>
    <button class="density-btn" data-mode="longtext">Long text</button>
  </div>
  <div class="list-card" id="list-card">
    <div class="list-header">
      <div class="list-title" id="list-title">Recent Activity</div>
      <div class="list-count" id="list-count">5 events</div>
    </div>
    <div class="list-body" id="list-body"></div>
  </div>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: flex-start; padding: 24px; margin: 0;
  font-family: system-ui, sans-serif; }
#density-demo { width: 100%; max-width: 420px; }
.density-controls { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.density-btn { font-size: 11px; font-weight: 500; padding: 6px 12px;
  border-radius: 6px; border: 1px solid #334155; background: #1e293b;
  color: #64748b; cursor: pointer; }
.density-btn.active { background: #2563eb; color: white; border-color: #2563eb; }

:root {
  --space-1: 4px; --space-2: 8px; --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;
}
.list-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px;
  overflow: hidden; }
.list-header { display: flex; justify-content: space-between; align-items: center;
  padding: var(--space-5) var(--space-5) var(--space-4);
  border-bottom: 1px solid #334155; }
.list-title { font-size: 15px; font-weight: 600; color: #f1f5f9; }
.list-count { font-size: 12px; color: #475569; }

/* THE SYSTEM: same row spacing regardless of item count */
.list-item { display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid #1e2d3d; }
.list-item:last-child { border-bottom: none; }
.item-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.item-content { flex: 1; min-width: 0; } /* min-width:0 allows text truncation */
.item-title { font-size: 13px; font-weight: 500; color: #e2e8f0;
  margin-bottom: var(--space-1);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-meta  { font-size: 11px; color: #475569; }
.item-time  { font-size: 11px; color: #334155; flex-shrink: 0; }`,
      startCode: `const datasets = {
  sparse: [
    { title: 'User signed in',          meta: 'jane@company.com',       time: '2m ago',   color: '#22c55e' },
    { title: 'Report exported',         meta: 'Q1 Summary.pdf',         time: '14m ago',  color: '#3b82f6' },
  ],
  normal: [
    { title: 'User signed in',          meta: 'jane@company.com',       time: '2m ago',   color: '#22c55e' },
    { title: 'Report exported',         meta: 'Q1 Summary.pdf',         time: '14m ago',  color: '#3b82f6' },
    { title: 'New comment on Ticket #8',meta: 'assigned to you',        time: '1h ago',   color: '#f59e0b' },
    { title: 'Payment received',        meta: '$1,240 from Acme Corp',  time: '3h ago',   color: '#22c55e' },
    { title: 'API rate limit warning',  meta: '80% of 10,000 req/day',  time: '5h ago',   color: '#ef4444' },
  ],
  dense: Array.from({ length: 12 }, (_, i) => ({
    title: ['Deployment completed','User created','Comment added','File uploaded',
            'Payment processed','Login attempt','Config changed','Alert resolved',
            'Report generated','Sync completed','Error logged','Backup created'][i],
    meta:  'System event · ID #' + (4800 + i),
    time:  (i * 2 + 1) + 'h ago',
    color: ['#22c55e','#3b82f6','#f59e0b','#64748b'][i % 4],
  })),
  longtext: [
    { title: 'Critical security alert: Unusual login detected from unrecognized device in Frankfurt, Germany',
      meta: 'action required · sent to security@company.com and account owner',
      time: '1m ago', color: '#ef4444' },
    { title: 'Automated weekly digest: performance report for the period March 7–14 2025',
      meta: 'includes: uptime, error rates, API usage, billing summary',
      time: '6h ago', color: '#3b82f6' },
  ],
};

function render(mode) {
  const body  = document.getElementById('list-body');
  const title = document.getElementById('list-title');
  const count = document.getElementById('list-count');
  const items = datasets[mode];

  title.textContent = mode === 'longtext' ? 'Critical Events' : 'Recent Activity';
  count.textContent = items.length + ' event' + (items.length !== 1 ? 's' : '');
  body.innerHTML = '';

  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = \`
      <div class="item-dot" style="background:\${item.color}"></div>
      <div class="item-content">
        <div class="item-title">\${item.title}</div>
        <div class="item-meta">\${item.meta}</div>
      </div>
      <div class="item-time">\${item.time}</div>
    \`;
    body.appendChild(row);
  });

  document.querySelectorAll('.density-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === mode));

  console.log('Mode:', mode, '| Items:', items.length);
  console.log('Observe: does the spacing system hold across all four scenarios?');
  console.log('The row padding is identical in all modes — var(--space-3) top/bottom.');
  console.log('The system does not change. The content changes.');
}

render('normal');
document.querySelectorAll('.density-btn').forEach(b =>
  b.addEventListener('click', () => render(b.dataset.mode)));`,
      outputHeight: 460,
    },

    // ─── PART 11: THE MAIN CHALLENGE ──────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `## Challenge: Build a Notification Component from a Spacing Specification

You're given a written spacing spec for a notification toast component. Your job is to implement the spec exactly using tokens from the scale.

**The spec:**
- Container: inset space-4 (16px) all sides
- Icon-to-text inline gap: space-3 (12px)
- Title-to-description stack: space-1 (4px)
- Description-to-action stack: space-4 (16px)
- Action-to-dismiss inline gap: space-3 (12px)
- Between multiple toasts: space-3 (12px)

**The test verifies:**
1. All spacing values are multiples of 4 (on-grid)
2. Container padding ≥ 16px on all sides
3. Title-to-description gap ≤ 6px (proximity — they're the same concept)
4. Description-to-action gap ≥ 12px (clear section separation)
5. The component works for both 1-line and 3-line descriptions`,
      html: `<div id="toast-stack">
  <div class="toast toast-info" id="toast-1">
    <div class="toast-icon">ℹ</div>
    <div class="toast-content">
      <div class="toast-title">Update available</div>
      <div class="toast-desc">Version 3.2.1 is ready to install</div>
      <div class="toast-actions">
        <button class="toast-primary">Install now</button>
        <button class="toast-secondary">Later</button>
      </div>
    </div>
    <button class="toast-dismiss">✕</button>
  </div>
  <div class="toast toast-error" id="toast-2">
    <div class="toast-icon">!</div>
    <div class="toast-content">
      <div class="toast-title">Payment failed</div>
      <div class="toast-desc">Your card was declined. Please check your payment details and ensure your billing address matches what your bank has on file.</div>
      <div class="toast-actions">
        <button class="toast-primary">Update payment</button>
        <button class="toast-secondary">Dismiss</button>
      </div>
    </div>
    <button class="toast-dismiss">✕</button>
  </div>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: flex-start; padding: 32px; margin: 0;
  font-family: system-ui, sans-serif; }

/* SPACING TOKENS */
:root {
  --space-1:  4px;  --space-2:  8px;  --space-3: 12px;
  --space-4: 16px;  --space-5: 24px;  --space-6: 32px;
}

/* BASE STYLES — don't change these */
#toast-stack { display: flex; flex-direction: column; width: 360px; }
.toast { background: #1e293b; border: 1px solid #334155;
  border-radius: 10px; display: flex; align-items: flex-start; }
.toast-info  { border-left: 3px solid #3b82f6; }
.toast-error { border-left: 3px solid #ef4444; }
.toast-icon { width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: white; }
.toast-info  .toast-icon { background: #3b82f6; }
.toast-error .toast-icon { background: #ef4444; }
.toast-content { flex: 1; min-width: 0; }
.toast-title { font-size: 14px; font-weight: 600; color: #f1f5f9; }
.toast-desc  { font-size: 13px; color: #64748b; line-height: 1.5; }
.toast-actions { display: flex; }
.toast-primary   { font-size: 12px; font-weight: 600; color: #60a5fa;
  background: none; border: none; cursor: pointer; padding: 0; }
.toast-secondary { font-size: 12px; color: #475569;
  background: none; border: none; cursor: pointer; padding: 0; }
.toast-dismiss { font-size: 11px; color: #475569; background: none;
  border: none; cursor: pointer; flex-shrink: 0;
  width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; }

/* YOUR SPACING GOES BELOW THIS LINE */
/* Apply spacing tokens according to the spec above */`,
      startCode: `// IMPLEMENT THE SPACING SPEC
// Every value must use a token from the scale: 4, 8, 12, 16, 24, 32px

// From the spec:
// Container: inset space-4 (16px) all sides
// Icon-to-text inline gap: space-3 (12px)
// Title-to-description stack: space-1 (4px)
// Description-to-action stack: space-4 (16px)
// Action-to-dismiss inline gap: space-3 (12px)
// Between toasts: space-3 (12px)

// ── Between toasts ────────────────────────────────────────────────────────────
document.querySelector('#toast-stack').style.gap = '???';          // spec: space-3

// ── Container inset (all toasts) ─────────────────────────────────────────────
document.querySelectorAll('.toast').forEach(t => {
  t.style.padding = '???';                                          // spec: space-4 all sides
});

// ── Icon-to-content gap ───────────────────────────────────────────────────────
document.querySelectorAll('.toast-icon').forEach(i => {
  i.style.marginRight = '???';                                      // spec: space-3
});

// ── Title-to-description gap ──────────────────────────────────────────────────
document.querySelectorAll('.toast-title').forEach(t => {
  t.style.marginBottom = '???';                                     // spec: space-1
});

// ── Description-to-actions gap ───────────────────────────────────────────────
document.querySelectorAll('.toast-desc').forEach(d => {
  d.style.marginBottom = '???';                                     // spec: space-4
});

// ── Action button gap ─────────────────────────────────────────────────────────
document.querySelectorAll('.toast-actions').forEach(a => {
  a.style.gap = '???';                                              // spec: space-3
});

// ── Dismiss button inset from content ────────────────────────────────────────
document.querySelectorAll('.toast-dismiss').forEach(d => {
  d.style.marginLeft = '???';                                       // spec: space-3
});`,
      solutionCode: `// All values from the spacing scale — no arbitrary values

// Between toasts: space-3 (12px)
document.querySelector('#toast-stack').style.gap = '12px';

// Container inset: space-4 (16px) all sides
document.querySelectorAll('.toast').forEach(t => {
  t.style.padding = '16px';
});

// Icon-to-content: space-3 (12px)
document.querySelectorAll('.toast-icon').forEach(i => {
  i.style.marginRight = '12px';
});

// Title-to-description: space-1 (4px) — tight, same concept
document.querySelectorAll('.toast-title').forEach(t => {
  t.style.marginBottom = '4px';
});

// Description-to-actions: space-4 (16px) — section separation
document.querySelectorAll('.toast-desc').forEach(d => {
  d.style.marginBottom = '16px';
});

// Action button gap: space-3 (12px)
document.querySelectorAll('.toast-actions').forEach(a => {
  a.style.gap = '12px';
});

// Dismiss from content: space-3 (12px)
document.querySelectorAll('.toast-dismiss').forEach(d => {
  d.style.marginLeft = '12px';
});`,
      check: (code) => {
        const SCALE = [4, 8, 12, 16, 24, 32, 48, 64];
        // Extract all pixel values from the student's code
        const vals = [...code.matchAll(/['"]?(\d+)px['"]?/g)].map(m => parseInt(m[1]));
        const nonZeroVals = vals.filter(v => v > 0);
        const allOnGrid   = nonZeroVals.every(v => SCALE.includes(v));
        const hasTitle4   = /toast-title[\s\S]*?(?:4px|marginBottom.*4)|['"]4px['"]/i.test(code);
        const hasDesc16   = /toast-desc[\s\S]*?(?:16px|marginBottom.*16)|['"]16px['"]/i.test(code);
        const hasPad16    = /toast[\s\S]*?padding.*(?:16px)/i.test(code);
        return allOnGrid && hasTitle4 && hasDesc16;
      },
      successMessage: `Spacing spec implemented correctly. You've translated a written specification into code — this is the real-world workflow: designer produces a spec, engineer implements it, the audit verifies it. The key insight: title-to-description uses 4px (they're one concept), description-to-action uses 16px (they're different concepts). Proximity communicates relationship.`,
      failMessage: `Two required conditions: (1) toast-title margin-bottom must be 4px (space-1) — tight, because title and description are the same concept. (2) toast-desc margin-bottom must be 16px (space-4) — because the action area is a separate section. Check that all your values are multiples of 4 (4, 8, 12, 16, 24, 32).`,
      outputHeight: 480,
    },

    // ─── PART 12: CROSS-PLATFORM + LESSON SEED ───────────────────────────────
    {
      type: 'markdown',
      instruction: `## Cross-Platform: Spacing in Every Environment

The spacing system is platform-independent. Only the syntax changes.

| Concept | CSS | Qt (QSS/C++) | Unity | Figma |
|---|---|---|---|---|
| Define token | \`--space-4: 16px\` | \`const int SPACE_4 = 16;\` | \`public float space4 = 16;\` | Token: space/4 = 16 |
| Container inset | \`padding: 16px\` | \`setContentsMargins(16,16,16,16)\` | \`padding = new RectOffset(16,16,16,16)\` | Padding: 16 |
| Stack gap | \`margin-bottom: 8px\` | \`layout->setSpacing(8)\` | \`spacing = 8\` | Gap: 8 |
| Inline gap | \`gap: 12px\` | \`hLayout->setSpacing(12)\` | \`spacing = 12\` | Gap: 12 |
| Grid alignment | \`grid: 4px\` | \`QGridLayout::setSpacing(4)\` | Layout group step: 4 | Nudge: 4px |

### The Invariant

Across all platforms, these rules never change:
1. All spacing values are multiples of the base unit (4px)
2. Within-group gap < between-group gap by at least 2.5×
3. Container inset ≥ space-4 (16px) for standard components, space-3 (12px) for dense
4. Label-to-input gap = space-1 (4px) — they belong together
5. Section gaps ≥ space-5 (24px) — conceptually separate

---

## What You Now Know

After Lesson 2, you can:
- Define a spacing scale from a single base unit
- Name the five spacing roles and choose the correct one for any gap
- Apply Gestalt proximity as a decision rule (not just a concept)
- Diagnose six spacing anti-patterns by name
- Audit any component's spacing programmatically
- Implement a written spacing specification exactly
- Explain why negative space is active, not empty

**Next lesson: Typography Systems** — line-height as function, measure (line length), weight as signal, and why the type scale ratio from Lesson 1 produces the exact values every design system uses.`,
    },

    // ─── PART 13: SEED ────────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Lesson 2 Complete — The Reference System

This is the canonical spacing system for the rest of the course. Every component we build from here uses these exact tokens.

Read the token definitions once more. Notice the comment on each: it states the use case, not just the value. The comment is documentation that the system generates automatically.

The audit function at the bottom is a tool you'll use in every future lesson to verify your components are on-grid. Any spacing value not in the scale is a violation. Zero violations is the pass condition.`,
      html: `<div class="ref-card">
  <div class="ref-header">
    <span class="ref-tag">SPACING SYSTEM</span>
    <h3 class="ref-title">8 tokens. All multiples of 4.</h3>
  </div>
  <div class="ref-scale">
    <div class="scale-row" data-token="space-1" data-px="4">
      <div class="scale-bar" style="width:4px"></div>
      <div class="scale-val">4px</div>
      <div class="scale-use">space-1 · micro gaps, label→input</div>
    </div>
    <div class="scale-row" data-token="space-2" data-px="8">
      <div class="scale-bar" style="width:8px"></div>
      <div class="scale-val">8px</div>
      <div class="scale-use">space-2 · within component</div>
    </div>
    <div class="scale-row" data-token="space-3" data-px="12">
      <div class="scale-bar" style="width:12px"></div>
      <div class="scale-val">12px</div>
      <div class="scale-use">space-3 · between components</div>
    </div>
    <div class="scale-row" data-token="space-4" data-px="16">
      <div class="scale-bar" style="width:16px"></div>
      <div class="scale-val">16px</div>
      <div class="scale-use">space-4 · component inset</div>
    </div>
    <div class="scale-row" data-token="space-5" data-px="24">
      <div class="scale-bar" style="width:24px"></div>
      <div class="scale-val">24px</div>
      <div class="scale-use">space-5 · section gaps</div>
    </div>
    <div class="scale-row" data-token="space-6" data-px="32">
      <div class="scale-bar" style="width:32px"></div>
      <div class="scale-val">32px</div>
      <div class="scale-use">space-6 · major regions</div>
    </div>
    <div class="scale-row" data-token="space-7" data-px="48">
      <div class="scale-bar" style="width:48px"></div>
      <div class="scale-val">48px</div>
      <div class="scale-use">space-7 · page breathing room</div>
    </div>
    <div class="scale-row" data-token="space-8" data-px="64">
      <div class="scale-bar" style="width:64px"></div>
      <div class="scale-val">64px</div>
      <div class="scale-use">space-8 · hero-scale separation</div>
    </div>
  </div>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
:root {
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px;
  --space-5:24px; --space-6:32px; --space-7:48px; --space-8:64px;
}
.ref-card { background: #1e293b; border: 1px solid #334155;
  border-radius: 14px; width: 440px; overflow: hidden; }
.ref-header { padding: var(--space-5) var(--space-6); border-bottom: 1px solid #334155; }
.ref-tag   { font-size: 10px; font-weight: 700; color: #475569;
  letter-spacing: 0.12em; text-transform: uppercase; display: block;
  margin-bottom: var(--space-1); }
.ref-title { font-size: 18px; font-weight: 700; color: #f1f5f9; margin: 0; }
.ref-scale { padding: var(--space-5) var(--space-6); display: flex;
  flex-direction: column; gap: var(--space-3); }
.scale-row { display: flex; align-items: center; gap: var(--space-3); }
.scale-bar { height: 8px; background: #2563eb; border-radius: 2px; flex-shrink: 0; }
.scale-val { font-size: 12px; font-weight: 600; color: #60a5fa;
  font-family: monospace; min-width: 32px; }
.scale-use { font-size: 12px; color: #475569; }`,
      startCode: `// Final audit — verify the reference card itself is on-grid
const SCALE = [4, 8, 12, 16, 24, 32, 48, 64];

function auditSpacing(rootSelector) {
  const els = document.querySelectorAll(rootSelector + ', ' + rootSelector + ' *');
  const violations = [];
  let checked = 0;

  els.forEach(el => {
    const s = window.getComputedStyle(el);
    ['paddingTop','paddingBottom','paddingLeft','paddingRight',
     'marginTop','marginBottom','gap'].forEach(prop => {
      const val = parseFloat(s[prop]);
      if (val > 0 && val < 200) {
        checked++;
        if (!SCALE.includes(Math.round(val))) {
          violations.push(el.className + ' · ' + prop + ': ' + val + 'px');
        }
      }
    });
  });

  return { checked, violations };
}

const { checked, violations } = auditSpacing('.ref-card');

console.log('=== LESSON 2 — FINAL SPACING AUDIT ===');
console.log('');
console.log('Values checked:', checked);
console.log('Scale:', SCALE.join('px, ') + 'px');
console.log('');
if (violations.length === 0) {
  console.log('✓ ALL ON-GRID — 0 violations');
  console.log('');
  console.log('This audit function (auditSpacing) is your tool for every');
  console.log('component you build in this course. Zero violations = pass.');
} else {
  console.log('Violations:');
  violations.forEach(v => console.log('  ' + v));
}

console.log('');
console.log('Lesson 3 → Typography Systems');
console.log('Line-height, measure, weight as signal, the full type scale.');`,
      outputHeight: 520,
    },
  ],
};

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export default {
  id: 'design-02-spacing-systems',
  slug: 'spacing-systems',
  chapter: 'design.1',
  order: 2,
  title: 'Spacing Systems',
  subtitle: 'Replace arbitrary gaps with a mathematical scale. Every pixel of space is a decision.',
  tags: [
    'css', 'spacing', 'design-tokens', 'gestalt', 'proximity',
    'negative-space', 'padding', 'margin', 'grid', '8px-grid',
    'design-systems', 'anti-patterns', 'density', 'rhythm',
  ],
  hook: {
    question: 'Why do some layouts feel rhythmic and breathable while others feel randomly assembled — even when the content is identical?',
    realWorldContext:
      'Spacing chosen by feel produces layouts that break under real data, cannot be debugged, and cannot be handed off. ' +
      'A spacing system reduces every gap decision to a single question: what relationship is this space expressing? ' +
      'The answer maps to a token. The token maps to a pixel value. No guessing.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'All spacing comes from one base unit (4px). Eight tokens cover every layout decision.',
      'Five roles cover every gap: inset, stack, inline, squish, stretch. Name the role before choosing the value.',
      'Proximity communicates belonging. The gap between groups must be ≥2.5× the gap within groups.',
      'Negative space is active. Space before an element adds visual weight. Space creates sections without borders.',
      'Six anti-patterns cover 90% of spacing failures: uniform gap, off-grid drift, crowded container, collapsed section, asymmetric surprise, spacing-as-decoration.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The Decision Rule',
        body: 'Name the relationship before choosing the value. "Label above its input" → proximity, tightest gap (space-1). "Field below another field" → stack within section (space-3). "Section below another section" → major stack (space-5). The relationship determines the token. The token determines the value.',
      },
      {
        type: 'important',
        title: 'The 2.5× Rule',
        body: 'The gap between groups must be at least 2.5× the gap within groups for the grouping to be reliably perceived. Below this threshold, the grouping is ambiguous. Above it, sections are clear without borders or colour.',
      },
      {
        type: 'tip',
        title: 'The Audit Function',
        body: 'Every component you build should pass a spacing audit: all values are multiples of 4, all values exist in the scale, zero off-grid drift. Run the auditSpacing() function from Lesson 2 on any component to verify.',
      },
      {
        type: 'warning',
        title: 'Uniform Spacing Is Not a Safe Default',
        body: 'Using the same spacing value everywhere is not neutral — it actively destroys grouping. The uniform gap makes every element equidistant, signalling that nothing belongs together more than anything else. This forces users to read every element to understand the structure.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Design Systems — Lesson 2: Spacing Systems',
        props: { lesson: LESSON_DESIGN_02 },
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: {
    prose: [
      'Gestalt Law of Proximity (Wertheimer, 1923): elements are grouped perceptually by spatial proximity before any other visual attribute. The grouping is pre-attentive — it happens in the first 200ms of visual processing, before reading begins.',
      'The 4px grid aligns with the minimum reliable device pixel on all common screen densities (1×, 1.5×, 2×, 3×). Sub-pixel values produce anti-aliasing artefacts on some hardware.',
      'Working memory chunking (Miller, 1956; Cowan, 2001): clearly spaced groups are processed as single chunks, reducing the effective count of items in working memory. A 12-item list in 3 groups of 4 occupies 3 memory slots, not 12.',
      'Reading speed research (Nielsen Norman Group): adequate line spacing and paragraph breaks increase prose scanning speed by 30–40% compared to compact, uniform layouts. Space is a performance optimisation, not a luxury.',
    ],
    callouts: [],
    visualizations: [],
  },
  examples: [],
  challenges: [],
  mentalModel: [
    'One base unit (4px). Eight tokens (4, 8, 12, 16, 24, 32, 48, 64). No other values.',
    'Five roles: inset (padding), stack (vertical gap), inline (horizontal gap), squish (h>v padding), stretch (equal padding).',
    'Proximity rule: between-group gap ≥ 2.5× within-group gap for clear grouping.',
    'Negative space is not empty — it carries weight, creates sections, controls reading speed.',
    'Six anti-patterns: uniform gap, off-grid drift, crowded container, collapsed section, asymmetric surprise, spacing-as-decoration.',
    'Same system in CSS (custom properties), Qt (setSpacing/setContentsMargins), Unity (RectOffset), everywhere.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
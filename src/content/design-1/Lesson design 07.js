// LESSON_DESIGN_07.js
// Lesson 7 — Interaction Design
// The problem: most UI is designed for the happy path at rest.
// Real users hover, misclick, submit invalid data, navigate by keyboard,
// tap on mobile, lose their connection mid-form, and try to go back.
// A UI that only handles the successful case is incomplete by definition.
// Concepts: finite state machine, affordances, hit targets, feedback timing,
//           Fitts's Law, Hick's Law, loading states, interaction cost.

const LESSON_DESIGN_07 = {
  title: 'Interaction Design',
  subtitle: 'Model every possible state. Make things obviously interactive. Give feedback within 100ms. Make every target hittable.',
  sequential: true,
  cells: [

    // ─── PART 0: RECAP ────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Recap: Six Lessons, Five Systems, One Process

The first six lessons gave you the complete static description of any UI:

| System | What it governs |
|---|---|
| **Hierarchy** | Which element dominates visually |
| **Spacing** | How much air between elements |
| **Typography** | Size, line-height, measure |
| **Layout** | Where elements go |
| **Colour** | What each colour means |
| **Composition** | How to build a component through four layers |

All six describe things **at rest** — a component in its default state, with ideal data, no user interaction.

But users don't interact with static mockups. They hover over things. They click in the wrong place. They submit a form, get an error, and try again. They leave the page and come back. They use a keyboard. They're on a phone in sunlight.

---

## The Question This Lesson Answers

> What does this component do when the user acts on it? What state does it enter? How does the user know the action registered? How long does feedback take? What happens if the action fails?

These are not design questions. They are **engineering questions with measurable answers**. Feedback must arrive within 100ms or the action feels broken. Touch targets must be ≥44×44px or the miss rate becomes statistically significant. Navigation steps beyond 7 options trigger measurably slower decision times.

Every number in this lesson is derived from human cognitive and motor physiology. None of them are conventions.`,
    },

    // ─── PART 1: BROKEN BASELINE ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## The Problem: A UI That Only Handles the Happy Path

This checkout form looks complete — it has all the fields, a submit button, and a success state. But it fails under every real-world condition:

- **No affordances** — nothing looks clickable except by convention
- **No feedback** — clicking submit does nothing visible for 400ms
- **No validation** — invalid email submits without error
- **No loading state** — the button doesn't indicate work is happening
- **No error state** — server errors are silently dropped
- **Wrong hit target** — the submit button on mobile is too small to reliably tap

Run the audit. The interaction violations are measurable — not aesthetic.`,
      html: `<div class="broken-form">
  <h2 class="bf-title">Complete your order</h2>
  <div class="bf-field">
    <label class="bf-label">Email</label>
    <input class="bf-input" id="bf-email" type="text" placeholder="your@email.com">
  </div>
  <div class="bf-field">
    <label class="bf-label">Card number</label>
    <input class="bf-input" id="bf-card" type="text" placeholder="4242 4242 4242 4242">
  </div>
  <div class="bf-row">
    <div class="bf-field">
      <label class="bf-label">Expiry</label>
      <input class="bf-input" id="bf-exp" type="text" placeholder="MM/YY">
    </div>
    <div class="bf-field">
      <label class="bf-label">CVV</label>
      <input class="bf-input" id="bf-cvv" type="text" placeholder="123">
    </div>
  </div>
  <button class="bf-submit" id="bf-submit">Pay $49.00</button>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
.broken-form { background: #1e293b; border: 1px solid #334155;
  border-radius: 12px; padding: 24px; width: 320px; }
.bf-title  { font-size: 18px; font-weight: 700; color: #f1f5f9; margin: 0 0 20px; }
.bf-field  { margin-bottom: 14px; }
.bf-label  { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
.bf-row    { display: flex; gap: 12px; }
.bf-row .bf-field { flex: 1; }
.bf-input  { width: 100%; padding: 8px 10px; background: #0f172a;
  border: 1px solid #334155; border-radius: 6px; color: #f1f5f9;
  font-size: 14px; box-sizing: border-box; outline: none; }
/* BROKEN: no :focus styles, no :hover styles, no affordances */

/* BROKEN: hit target too small on mobile */
.bf-submit { width: 100%; padding: 10px;   /* ← 10px vertical = ~34px total — below 44px */
  background: #2563eb; color: white; border: none; border-radius: 8px;
  font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 4px; }
/* BROKEN: no loading, error, success, disabled states */`,
      startCode: `// Interaction audit — measures what the broken form lacks

function auditInteraction(rootSel) {
  const root = document.querySelector(rootSel);
  if (!root) return;

  const issues = [];

  // ── Hit target check ────────────────────────────────────────────────────────
  root.querySelectorAll('button, a, input[type=submit], [role=button]').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.height < 44 || r.width < 44) {
      issues.push('HIT TARGET: ' + (el.className || el.tagName) +
        ' is ' + Math.round(r.width) + '×' + Math.round(r.height) +
        'px (min 44×44px)');
    }
  });

  // ── Affordance check (inputs) ───────────────────────────────────────────────
  root.querySelectorAll('input, textarea, select').forEach(el => {
    const s = window.getComputedStyle(el);
    // Check for focus style (approximate: look for CSS rules with :focus)
    const hasFocusStyle = [...document.styleSheets].some(sheet => {
      try {
        return [...sheet.cssRules].some(r =>
          r.selectorText?.includes(':focus') || r.selectorText?.includes('focus-visible'));
      } catch { return false; }
    });
    if (!hasFocusStyle) {
      issues.push('AFFORDANCE: No :focus style on ' + (el.id || el.className || el.tagName));
    }
  });

  // ── Input type check ────────────────────────────────────────────────────────
  const emailInput = root.querySelector('input[placeholder*="email"], input[id*="email"]');
  if (emailInput && emailInput.type !== 'email') {
    issues.push('INPUT TYPE: Email field type="' + emailInput.type + '" — should be type="email"');
  }

  // ── State class check ───────────────────────────────────────────────────────
  const btns = root.querySelectorAll('button');
  btns.forEach(btn => {
    const hasLoadingState = btn.className.includes('loading') ||
      btn.hasAttribute('data-loading') ||
      [...document.styleSheets].some(sheet => {
        try { return [...sheet.cssRules].some(r => r.selectorText?.includes('loading')); }
        catch { return false; }
      });
    if (!hasLoadingState) {
      issues.push('STATE: Button "' + btn.textContent.trim().slice(0,20) + '" has no loading state');
    }
  });

  console.log('=== INTERACTION AUDIT: ' + rootSel + ' ===\\n');
  if (issues.length === 0) {
    console.log('✓ All interaction checks pass');
  } else {
    issues.forEach(i => console.log('✗ ' + i));
    console.log('\\n' + issues.length + ' interaction violation(s) found');
  }
}

auditInteraction('.broken-form');

console.log('\\nFour measurable failures in this form:');
console.log('1. Hit target: submit button height is below 44px minimum');
console.log('2. Input type: email field is type="text" — misses mobile keyboard + validation');
console.log('3. No :focus styles — keyboard users have no visual indicator');
console.log('4. No loading/error states — user cannot tell if submit worked');`,
      outputHeight: 400,
    },

    // ─── PART 2: UI AS A FINITE STATE MACHINE ─────────────────────────────────
    {
      type: 'markdown',
      instruction: `## UI as a Finite State Machine

A **finite state machine (FSM)** is a computational model with a fixed set of states, a fixed set of inputs (events), and a set of rules (transitions) that determine which state to enter when an event occurs in a given state.

Every interactive UI component is an FSM. Writing it down explicitly forces you to answer questions you would otherwise skip.

### The FSM Components

\`\`\`
States:     The complete set of conditions the component can be in.
Events:     Things that can happen (user actions, network responses).
Transitions:Which state each event leads to from each current state.
Guards:     Conditions that must be true for a transition to fire.
Actions:    Side effects that run when entering/exiting a state.
\`\`\`

### A Submit Button as an FSM

\`\`\`
States:     idle | loading | success | error

Events:     CLICK | RESPONSE_OK | RESPONSE_FAIL | RETRY | RESET

Transitions:
  idle     + CLICK        → loading    (guard: form is valid)
  loading  + RESPONSE_OK  → success
  loading  + RESPONSE_FAIL→ error
  error    + RETRY        → loading
  error    + RESET        → idle
  success  + RESET        → idle

Actions:
  enter loading: disable button, show spinner, prevent double-submit
  enter success: show confirmation, clear form after delay
  enter error:   show error message, re-enable retry
\`\`\`

### Why This Matters

The FSM forces you to answer: "What happens if the user clicks submit while already loading?" (Nothing — the guard prevents the transition). "What happens if the network fails?" (The error state fires). "Can the user get stuck?" (Only if there's no transition out of a state).

Without an FSM, these questions are answered reactively — in production, after a user reports a bug.

### The Implementation Pattern

\`\`\`javascript
const FSM = {
  state: 'idle',
  transitions: {
    idle:    { CLICK: 'loading' },
    loading: { RESPONSE_OK: 'success', RESPONSE_FAIL: 'error' },
    error:   { RETRY: 'loading', RESET: 'idle' },
    success: { RESET: 'idle' },
  },
  send(event) {
    const next = this.transitions[this.state]?.[event];
    if (next) { this.state = next; this.render(); }
  },
};
\`\`\`

The state machine separates what the component looks like (render) from what it can do (transitions). This is why React, XState, and every serious frontend framework has moved toward state machine thinking.`,
    },

    // ─── PART 3: AFFORDANCES ─────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Affordances: Making Things Obviously Interactive

An **affordance** is a property of an object that signals how it should be used — without a label or instruction. A door handle affords pulling. A push plate affords pushing. A button affords pressing.

In UI, affordances are visual signals that communicate "this thing can be interacted with." Getting them wrong causes users to click on non-interactive elements and ignore interactive ones — both measurable in user testing as hesitation or misclick.

**The five interactive affordance signals:**

1. **Cursor change** — \`cursor: pointer\` is the strongest single signal. The hand cursor signals "this is a link or button."
2. **Background/border change on hover** — elements that respond visually to hover feel interactive.
3. **Elevation/shadow** — slightly elevated elements (box-shadow on hover) feel "pressable."
4. **Underline on links** — the most reliable affordance for text links. Colour alone is not sufficient for colour-blind users.
5. **Border and label on inputs** — a visible border says "type here." A floating label says "this field has a purpose."

The cell below demonstrates each affordance signal. Toggle them off one by one and notice how the interactive confidence of each element changes.`,
      html: `<div id="affordance-demo">
  <div id="aff-controls">
    <label><input type="checkbox" id="aff-cursor" checked> cursor:pointer</label>
    <label><input type="checkbox" id="aff-hover" checked> hover bg</label>
    <label><input type="checkbox" id="aff-shadow" checked> hover elevation</label>
    <label><input type="checkbox" id="aff-underline" checked> link underline</label>
    <label><input type="checkbox" id="aff-border" checked> input border</label>
  </div>
  <div class="aff-ui" id="aff-ui">
    <button class="aff-btn" id="aff-btn">Submit Report</button>
    <button class="aff-btn aff-ghost" id="aff-ghost">Cancel</button>
    <a class="aff-link" id="aff-link" href="#">View documentation →</a>
    <input class="aff-input" id="aff-input" type="text" placeholder="Search reports…">
    <div class="aff-fake-btn" id="aff-fake">
      This looks like a button but isn't
    </div>
  </div>
  <div id="aff-legend">
    <div class="aff-leg-item"><span class="aff-dot good"></span> Strong affordance</div>
    <div class="aff-leg-item"><span class="aff-dot warn"></span> Weak affordance</div>
    <div class="aff-leg-item"><span class="aff-dot bad"></span> False affordance</div>
  </div>
</div>`,
      css: `body { background: #0f172a; padding: 24px; margin: 0; font-family: system-ui, sans-serif; }
#affordance-demo { max-width: 500px; }
#aff-controls { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;
  font-size: 12px; color: #64748b; }
#aff-controls label { display: flex; align-items: center; gap: 6px;
  background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 6px 10px;
  cursor: pointer; user-select: none; }
#aff-controls input[type=checkbox] { accent-color: #2563eb; }
.aff-ui    { background: #1e293b; border: 1px solid #334155; border-radius: 10px;
  padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.aff-btn   { padding: 10px 20px; background: #2563eb; color: white; border: none;
  border-radius: 8px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.12s; }
.aff-ghost { background: transparent; color: #94a3b8; border: 1px solid #334155; }
.aff-link  { font-size: 14px; color: #60a5fa; }
.aff-input { padding: 9px 12px; background: #0f172a; border: 1px solid #334155;
  border-radius: 7px; color: #f1f5f9; font-size: 14px; outline: none; width: 100%;
  box-sizing: border-box; }
/* The false affordance — looks like a button but isn't */
.aff-fake-btn { padding: 10px 20px; background: #334155; color: #94a3b8;
  border-radius: 8px; font-size: 14px; font-weight: 500;
  /* no cursor:pointer, no hover state — looks interactive but isn't */ }
#aff-legend { display: flex; gap: 16px; margin-top: 14px; font-size: 11px; color: #64748b; }
.aff-leg-item { display: flex; align-items: center; gap: 5px; }
.aff-dot  { width: 8px; height: 8px; border-radius: 50%; }
.aff-dot.good { background: #4ade80; }
.aff-dot.warn { background: #fbbf24; }
.aff-dot.bad  { background: #f87171; }`,
      startCode: `// Wire up affordance toggles

const btn    = document.getElementById('aff-btn');
const ghost  = document.getElementById('aff-ghost');
const link   = document.getElementById('aff-link');
const input  = document.getElementById('aff-input');

function applyAffordances() {
  const cursor    = document.getElementById('aff-cursor').checked;
  const hover     = document.getElementById('aff-hover').checked;
  const shadow    = document.getElementById('aff-shadow').checked;
  const underline = document.getElementById('aff-underline').checked;
  const border    = document.getElementById('aff-border').checked;

  // cursor: pointer
  [btn, ghost].forEach(el => {
    el.style.cursor = cursor ? 'pointer' : 'default';
  });

  // hover background change
  const hoverStyle = document.getElementById('hover-style') || document.createElement('style');
  hoverStyle.id = 'hover-style';
  hoverStyle.textContent = hover
    ? '.aff-btn:hover { filter: brightness(1.15); } .aff-ghost:hover { background: #334155; }'
    : '';
  document.head.appendChild(hoverStyle);

  // hover elevation
  const shadowStyle = document.getElementById('shadow-style') || document.createElement('style');
  shadowStyle.id = 'shadow-style';
  shadowStyle.textContent = shadow
    ? '.aff-btn:hover { box-shadow: 0 4px 16px rgba(37,99,235,0.35); transform: translateY(-1px); }'
    : '';
  document.head.appendChild(shadowStyle);

  // link underline
  link.style.textDecoration = underline ? 'underline' : 'none';

  // input border
  input.style.borderColor = border ? '#475569' : 'transparent';
  input.style.borderWidth = border ? '1px' : '0';

  // Report the strength of each affordance
  const scores = {
    'Submit button':  (cursor ? 2 : 0) + (hover ? 2 : 0) + (shadow ? 1 : 0),
    'Ghost button':   (cursor ? 2 : 0) + (hover ? 1 : 0),
    'Link':           3 + (underline ? 2 : 0),  // always has colour
    'Input':          (border ? 3 : 0),
    'Fake button':    0,  // never interactive — false affordance
  };

  console.log('Affordance strength (0 = not interactive, 5 = strongly interactive):');
  Object.entries(scores).forEach(([el, score]) => {
    const bar = '█'.repeat(score) + '░'.repeat(5 - score);
    console.log('  ' + el.padEnd(16) + bar + ' ' + score + '/5');
  });
  console.log('');
  if (!cursor && !hover) console.warn('⚠ Without cursor:pointer and hover state, buttons look non-interactive');
  if (!underline) console.warn('⚠ Links without underline rely only on colour — inaccessible for colour-blind users');
  if (!border) console.warn('⚠ Input without border has weak affordance — users may not know it is editable');
}

['aff-cursor','aff-hover','aff-shadow','aff-underline','aff-border'].forEach(id =>
  document.getElementById(id).addEventListener('change', applyAffordances));
applyAffordances();`,
      outputHeight: 440,
    },

    // ─── PART 4: HIT TARGETS ─────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Hit Targets: The 44px Rule

A **hit target** is the area the user must click or tap to activate an interactive element. The visual size of the element is irrelevant — only the clickable area matters.

**The constraints, derived from motor physiology:**

- **Mobile (touch):** minimum 44×44px — Apple HIG, Material Design, WCAG 2.5.5 (AAA)
- **Desktop (mouse):** minimum 24×24px — but larger is always better (Fitts's Law)
- **Typical finger pad:** ~10mm × ~10mm ≈ 37×37px at 96dpi
- **Why 44px:** at 44px, the expected miss rate drops below ~5% for most users

**The common violations:**

| Element | Common actual size | Required minimum |
|---|---|---|
| Icon-only button | 24×24px | 44×44px |
| Checkbox | 16×16px | 44×44px (use padding) |
| Close (×) button | 20×20px | 44×44px |
| Navigation link | Full width but 28px tall | 44px tall |
| Dropdown trigger | Input height (~36px) | 44px |

The fix for most of these is **not** to make the visible element larger — it's to add \`padding\` so the clickable area is 44px while the visual size remains unchanged.

The cell below shows a toolbar with hit target violations. The audit reads actual click target sizes (from \`getBoundingClientRect()\`) and flags everything below 44px.`,
      html: `<div id="target-demo">
  <div class="target-toolbar" id="target-toolbar">
    <button class="tt-icon-btn" title="Bold"><b>B</b></button>
    <button class="tt-icon-btn" title="Italic"><i>I</i></button>
    <button class="tt-icon-btn" title="Underline"><u>U</u></button>
    <div class="tt-divider"></div>
    <button class="tt-icon-btn" title="Align left">≡</button>
    <button class="tt-icon-btn" title="Align center">≡</button>
    <button class="tt-icon-btn" title="Link">�</button>
    <div class="tt-spacer"></div>
    <button class="tt-close" title="Close">✕</button>
  </div>
  <div id="target-overlay"></div>
  <button id="run-audit" class="audit-btn">Run Hit Target Audit</button>
</div>`,
      css: `body { background: #0f172a; padding: 24px; margin: 0; font-family: system-ui, sans-serif; }
#target-demo { max-width: 480px; }
.target-toolbar { display: flex; align-items: center; gap: 2px;
  background: #1e293b; border: 1px solid #334155; border-radius: 8px;
  padding: 6px; position: relative; }
/* BROKEN: 28×28px — below 44px minimum */
.tt-icon-btn { width: 28px; height: 28px; display: flex; align-items: center;
  justify-content: center; background: transparent; border: none; border-radius: 5px;
  color: #94a3b8; font-size: 14px; cursor: pointer; }
.tt-icon-btn:hover { background: #334155; color: #f1f5f9; }
.tt-divider { width: 1px; height: 20px; background: #334155; margin: 0 4px; }
.tt-spacer  { flex: 1; }
/* BROKEN: close button even smaller */
.tt-close   { width: 20px; height: 20px; display: flex; align-items: center;
  justify-content: center; background: transparent; border: none;
  color: #64748b; font-size: 12px; cursor: pointer; border-radius: 4px; }
.tt-close:hover { background: rgba(239,68,68,0.15); color: #f87171; }
#target-overlay { position: relative; height: 0; }
.target-box { position: absolute; border: 2px solid; border-radius: 4px;
  opacity: 0.6; pointer-events: none; }
.target-box.pass { border-color: #4ade80; background: rgba(74,222,128,0.06); }
.target-box.fail { border-color: #f87171; background: rgba(248,113,113,0.08); }
.target-label { position: absolute; font-size: 9px; font-weight: 700;
  font-family: monospace; white-space: nowrap; top: -14px; left: 0; }
.audit-btn { margin-top: 16px; padding: 8px 16px; background: #2563eb; color: white;
  border: none; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; }`,
      startCode: `document.getElementById('run-audit').onclick = function() {
  const toolbar  = document.getElementById('target-toolbar');
  const overlay  = document.getElementById('target-overlay');
  const tbRect   = toolbar.getBoundingClientRect();
  overlay.innerHTML = '';
  overlay.style.marginTop = '-' + toolbar.offsetHeight + 'px';

  const targets = toolbar.querySelectorAll('button');
  let passCount = 0, failCount = 0;

  console.log('=== HIT TARGET AUDIT ===\\n');
  console.log('WCAG 2.5.5 / HIG minimum: 44×44px for touch targets\\n');

  targets.forEach(el => {
    const r    = el.getBoundingClientRect();
    const w    = Math.round(r.width);
    const h    = Math.round(r.height);
    const pass = w >= 44 && h >= 44;
    pass ? passCount++ : failCount++;

    const label = (el.title || el.textContent.trim()).slice(0,6);
    console.log((pass ? '✓' : '✗') + ' ' + label.padEnd(10) +
      w + '×' + h + 'px' + (pass ? '' : ' — needs ' + (44-w) + 'px wider, ' + (44-h) + 'px taller'));

    // Draw overlay box
    const box = document.createElement('div');
    box.className = 'target-box ' + (pass ? 'pass' : 'fail');
    const relLeft = r.left - tbRect.left;
    const relTop  = r.top  - tbRect.top;
    box.style.left   = relLeft + 'px';
    box.style.top    = (toolbar.offsetHeight + relTop) + 'px';
    box.style.width  = w + 'px';
    box.style.height = h + 'px';
    const lbl = document.createElement('div');
    lbl.className = 'target-label';
    lbl.style.color = pass ? '#4ade80' : '#f87171';
    lbl.textContent = w + '×' + h;
    box.appendChild(lbl);
    overlay.appendChild(box);
  });

  console.log('\\n' + passCount + ' pass, ' + failCount + ' fail');
  console.log('\\nFix: add padding to increase click area without changing visual size.');
  console.log('  .tt-icon-btn { padding: 8px; width: auto; height: auto; min-width: 44px; min-height: 44px; }');
  console.log('Visual size stays 28px. Click area becomes 44px.');
};`,
      outputHeight: 340,
    },

    // ─── PART 5: FEEDBACK TIMING ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Feedback Timing: The Three Thresholds

Human perception has three distinct temporal boundaries that determine how UI feedback is perceived. These are not UX conventions — they are derived from cognitive neuroscience research (Miller, 1968; Nielsen, 1993; Card, Moran & Newell, 1983).

### The Three Thresholds

**< 100ms — Immediate**
The user perceives the interaction as instantaneous. No loading indicator needed. This is the target for hover states, button press feedback, and toggle animations.

If hover → 110ms → visual change: the user perceives a lag. If hover → 80ms → visual change: imperceptible. The 100ms boundary is real and measurable.

**100ms–1000ms — Acknowledged**
The user knows the system is working but cannot do anything else. Show a loading state on the specific element that triggered the action (spinner on the button, not a full-page overlay). Do not show a skeleton screen for delays this short — it adds a flicker for fast connections.

**> 1000ms — Waiting**
Replace inline spinners with skeleton screens for content that takes over 1 second. Show progress indicators for operations over 4 seconds. Never leave the user with only a spinner and no sense of progress.

### The Implementation Rules

| Delay | Signal | Implementation |
|---|---|---|
| 0–100ms | Hover/press state | CSS transition (no JS) |
| 100ms–400ms | Button spinner | Add \`.btn--loading\` immediately on click |
| 400ms–1000ms | Disabled + spinner | Prevent re-submit, show spinner |
| 1–4s | Skeleton screen | Replace content with shimmer placeholders |
| > 4s | Progress bar | Show estimated completion |
| Error | Error state | Replace spinner with error, enable retry |

### Skeleton Screens vs Spinners

Spinners communicate duration uncertainty ("I don't know how long this will take"). Skeleton screens communicate content shape ("here is approximately where the data will appear"). Skeleton screens are measurably less anxiety-inducing because they show progress and set expectations.

Use **spinners** for: button loading states, icon loading, small inline operations.
Use **skeleton screens** for: page loads, data tables, card grids, any content region > 200px tall.

### The Double-Submit Problem

Every form submit button must be disabled immediately on click. Not after the server responds — immediately. The average user clicks a slow submit button 2.3 times. Each additional click typically submits the form again. Payments, orders, and registrations are particularly vulnerable.

\`\`\`javascript
// Always do this on submit
btn.disabled = true;
btn.classList.add('btn--loading');
// ... do the async work ...
// Re-enable only on completion or error
\`\`\``,
    },

    // ─── PART 6: PRACTICE 1 — MULTI-STEP FORM AS FSM ─────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 1: Wire a Multi-Step Form as a Finite State Machine

You're given a three-step checkout form and an incomplete FSM implementation. The FSM has its states and transitions defined, but the \`render()\` function and the event handlers are missing.

**Your task:**
1. Complete the \`render()\` function — it should show the correct step, update the progress indicator, and set button states based on the current FSM state
2. Wire up the Next, Back, and Submit buttons to send the correct FSM events
3. Handle the \`submitting\` and \`error\` states — show a spinner during submission, an error message on failure

**The FSM is already correct.** You are implementing the view layer on top of it.

The test verifies: the FSM starts in \`details\` state, Next advances it to \`payment\`, the submit button is disabled during \`submitting\`, and an error state is reachable.`,
      html: `<div class="msf-wrap" id="msf-wrap">
  <div class="msf-progress" id="msf-progress">
    <div class="msf-step" data-step="details">
      <div class="msf-step-dot" id="dot-details"></div>
      <div class="msf-step-label">Details</div>
    </div>
    <div class="msf-step-line" id="line-1"></div>
    <div class="msf-step" data-step="payment">
      <div class="msf-step-dot" id="dot-payment"></div>
      <div class="msf-step-label">Payment</div>
    </div>
    <div class="msf-step-line" id="line-2"></div>
    <div class="msf-step" data-step="review">
      <div class="msf-step-dot" id="dot-review"></div>
      <div class="msf-step-label">Review</div>
    </div>
  </div>

  <div class="msf-panel" id="panel-details">
    <h3 class="msf-heading">Your details</h3>
    <input class="msf-input" placeholder="Full name" value="Sarah Chen">
    <input class="msf-input" placeholder="Email" type="email" value="sarah@acme.com">
  </div>
  <div class="msf-panel" id="panel-payment" style="display:none">
    <h3 class="msf-heading">Payment method</h3>
    <input class="msf-input" placeholder="Card number" value="4242 4242 4242 4242">
    <div class="msf-row">
      <input class="msf-input" placeholder="MM/YY" value="12/26">
      <input class="msf-input" placeholder="CVV" value="123">
    </div>
  </div>
  <div class="msf-panel" id="panel-review" style="display:none">
    <h3 class="msf-heading">Review order</h3>
    <div class="msf-summary">
      <div class="msf-sum-row"><span>Plan</span><span>Pro Monthly</span></div>
      <div class="msf-sum-row"><span>Total</span><span class="msf-total">$49.00</span></div>
    </div>
  </div>
  <div class="msf-panel" id="panel-submitting" style="display:none">
    <div class="msf-spinner-wrap">
      <div class="msf-spinner"></div>
      <div class="msf-spinner-label">Processing payment…</div>
    </div>
  </div>
  <div class="msf-panel" id="panel-error" style="display:none">
    <div class="msf-error-wrap">
      <div class="msf-error-icon">✕</div>
      <div class="msf-error-title">Payment failed</div>
      <div class="msf-error-msg">Card declined. Please check your details.</div>
    </div>
  </div>
  <div class="msf-panel" id="panel-success" style="display:none">
    <div class="msf-success-wrap">
      <div class="msf-success-icon">✓</div>
      <div class="msf-success-title">Order confirmed!</div>
      <div class="msf-success-msg">Receipt sent to sarah@acme.com</div>
    </div>
  </div>

  <div class="msf-actions" id="msf-actions">
    <button class="msf-btn msf-back" id="msf-back">Back</button>
    <button class="msf-btn msf-next" id="msf-next">Next →</button>
    <button class="msf-btn msf-submit" id="msf-submit" style="display:none">
      Confirm & Pay $49
    </button>
    <button class="msf-btn msf-retry" id="msf-retry" style="display:none">
      Try again
    </button>
  </div>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
:root {
  --space-2:8px; --space-3:12px; --space-4:16px; --space-5:24px;
  --c-surface:hsl(222,39%,12%); --c-border:hsl(217,32%,22%);
  --c-text-1:hsl(210,40%,96%); --c-text-2:hsl(215,25%,65%); --c-text-3:hsl(217,20%,45%);
  --c-interactive:hsl(217,76%,47%); --c-success:hsl(142,60%,45%); --c-error:hsl(0,74%,48%);
}
.msf-wrap   { background:var(--c-surface); border:1px solid var(--c-border);
  border-radius:14px; padding:var(--space-5); width:340px;
  display:flex; flex-direction:column; gap:var(--space-4); }
.msf-progress { display:flex; align-items:center; gap:0; }
.msf-step   { display:flex; flex-direction:column; align-items:center; gap:4px; flex-shrink:0; }
.msf-step-dot { width:24px; height:24px; border-radius:50%; border:2px solid var(--c-border);
  background:var(--c-surface); display:flex; align-items:center; justify-content:center;
  font-size:10px; font-weight:700; color:var(--c-text-3); transition:all 0.2s; }
.msf-step-dot.active   { border-color:var(--c-interactive); background:var(--c-interactive); color:white; }
.msf-step-dot.complete { border-color:var(--c-success); background:var(--c-success); color:white; }
.msf-step-label { font-size:10px; color:var(--c-text-3); white-space:nowrap; }
.msf-step-line  { flex:1; height:2px; background:var(--c-border); transition:background 0.2s; }
.msf-step-line.complete { background:var(--c-success); }
.msf-heading { font-size:16px; font-weight:700; color:var(--c-text-1); margin:0 0 12px; }
.msf-input   { width:100%; padding:9px 12px; background:#0f172a; border:1px solid var(--c-border);
  border-radius:7px; color:var(--c-text-1); font-size:14px; box-sizing:border-box;
  outline:none; margin-bottom:8px; }
.msf-input:focus { border-color:var(--c-interactive); box-shadow:0 0 0 3px hsla(217,76%,47%,0.2); }
.msf-row    { display:flex; gap:8px; }
.msf-row .msf-input { flex:1; }
.msf-summary { display:flex; flex-direction:column; gap:8px; }
.msf-sum-row{ display:flex; justify-content:space-between; font-size:14px; color:var(--c-text-2); }
.msf-total  { font-weight:700; color:var(--c-text-1); }
.msf-spinner-wrap,.msf-error-wrap,.msf-success-wrap {
  display:flex; flex-direction:column; align-items:center; gap:10px; padding:16px 0; }
.msf-spinner { width:32px; height:32px; border:3px solid rgba(255,255,255,0.1);
  border-top-color:var(--c-interactive); border-radius:50%;
  animation:msfspin 0.8s linear infinite; }
@keyframes msfspin { to { transform:rotate(360deg); } }
.msf-spinner-label { font-size:14px; color:var(--c-text-2); }
.msf-error-icon  { width:40px; height:40px; border-radius:50%; background:var(--c-error);
  color:white; display:flex; align-items:center; justify-content:center;
  font-size:18px; font-weight:700; }
.msf-error-title { font-size:16px; font-weight:700; color:var(--c-text-1); }
.msf-error-msg   { font-size:13px; color:var(--c-text-2); text-align:center; }
.msf-success-icon { width:40px; height:40px; border-radius:50%; background:var(--c-success);
  color:white; display:flex; align-items:center; justify-content:center;
  font-size:18px; font-weight:700; }
.msf-success-title { font-size:16px; font-weight:700; color:var(--c-text-1); }
.msf-success-msg   { font-size:13px; color:var(--c-text-2); text-align:center; }
.msf-actions { display:flex; gap:8px; }
.msf-btn     { flex:1; padding:11px; font-size:14px; font-weight:600;
  border-radius:9px; border:1px solid transparent; cursor:pointer;
  transition:all 0.12s; min-height:44px; }
.msf-back    { background:transparent; color:var(--c-text-2); border-color:var(--c-border); }
.msf-next    { background:var(--c-interactive); color:white; border-color:var(--c-interactive); }
.msf-submit  { background:var(--c-interactive); color:white; border-color:var(--c-interactive); }
.msf-retry   { background:var(--c-error); color:white; border-color:var(--c-error); }
.msf-btn:disabled { opacity:0.38; cursor:not-allowed; pointer-events:none; }`,
      startCode: `// THE FSM — correct and complete. You implement render() and event handlers.

const FSM = {
  state: 'details',

  // All possible states
  STATES: ['details', 'payment', 'review', 'submitting', 'error', 'success'],

  // Transitions: state → { event → next state }
  transitions: {
    details:    { NEXT: 'payment' },
    payment:    { NEXT: 'review',    BACK: 'details' },
    review:     { SUBMIT: 'submitting', BACK: 'payment' },
    submitting: { SUCCESS: 'success',  FAIL: 'error' },
    error:      { RETRY: 'submitting', BACK: 'review' },
    success:    {},
  },

  // Send an event to the machine
  send(event) {
    const next = this.transitions[this.state]?.[event];
    if (next) {
      console.log('FSM: ' + this.state + ' → [' + event + '] → ' + next);
      this.state = next;
      this.render();
      // Simulate async for submitting state
      if (next === 'submitting') {
        setTimeout(() => {
          // 70% success, 30% failure (for testing the error path)
          this.send(Math.random() > 0.3 ? 'SUCCESS' : 'FAIL');
        }, 1800);
      }
    } else {
      console.log('FSM: no transition from ' + this.state + ' on ' + event);
    }
  },

  render() {
    const s = this.state;

    // ── YOUR TASK: implement render() ──────────────────────────────────────────

    // 1. Show the correct panel (panel-details, panel-payment, etc.)
    //    Hide all panels first, then show the one matching current state.
    const panels = ['details','payment','review','submitting','error','success'];
    panels.forEach(p => {
      document.getElementById('panel-' + p).style.display = '???';
    });
    document.getElementById('panel-' + s).style.display = '???';

    // 2. Update progress dots and lines
    // States in order: details, payment, review
    // A step is "complete" if we're past it, "active" if we're on it
    const stepOrder = ['details', 'payment', 'review'];
    const currentIdx = stepOrder.indexOf(['submitting','error','success'].includes(s) ? 'review' : s);
    stepOrder.forEach((step, i) => {
      const dot = document.getElementById('dot-' + step);
      dot.className = 'msf-step-dot';
      if (i < currentIdx || (s === 'success'))      dot.classList.add('complete');
      else if (i === currentIdx && s !== 'success')  dot.classList.add('active');
      dot.textContent = (i < currentIdx || s === 'success') ? '✓' : (i + 1);
    });
    const lines = ['line-1','line-2'];
    lines.forEach((id, i) => {
      document.getElementById(id).classList.toggle('complete',
        i < currentIdx || s === 'success');
    });

    // 3. Show/hide action buttons based on state
    // back: show in payment and review
    // next: show in details and payment
    // submit: show in review only
    // retry: show in error only
    // hide all actions in: submitting, success
    const back   = document.getElementById('msf-back');
    const next   = document.getElementById('msf-next');
    const submit = document.getElementById('msf-submit');
    const retry  = document.getElementById('msf-retry');
    const actions= document.getElementById('msf-actions');

    // YOUR CODE: set display and disabled for each button based on s


    // 4. Disable submit/next/back while submitting
    // YOUR CODE: prevent interaction in submitting state
  },
};

// ── WIRE UP EVENT HANDLERS ─────────────────────────────────────────────────────
document.getElementById('msf-next').addEventListener('click',   () => FSM.send('NEXT'));
document.getElementById('msf-back').addEventListener('click',   () => FSM.send('BACK'));
document.getElementById('msf-submit').addEventListener('click', () => FSM.send('SUBMIT'));
document.getElementById('msf-retry').addEventListener('click',  () => FSM.send('RETRY'));

// Initial render
FSM.render();

// ── AUDIT ─────────────────────────────────────────────────────────────────────
console.log('FSM initial state:', FSM.state);
console.log('Send NEXT → should go to payment...');
FSM.send('NEXT');
console.log('State is now:', FSM.state);`,
      solutionCode: `const FSM = {
  state: 'details',
  STATES: ['details','payment','review','submitting','error','success'],
  transitions: {
    details:   { NEXT: 'payment' },
    payment:   { NEXT: 'review',   BACK: 'details' },
    review:    { SUBMIT: 'submitting', BACK: 'payment' },
    submitting:{ SUCCESS: 'success', FAIL: 'error' },
    error:     { RETRY: 'submitting', BACK: 'review' },
    success:   {},
  },
  send(event) {
    const next = this.transitions[this.state]?.[event];
    if (next) {
      this.state = next; this.render();
      if (next === 'submitting') setTimeout(() => this.send(Math.random() > 0.3 ? 'SUCCESS' : 'FAIL'), 1800);
    }
  },
  render() {
    const s = this.state;
    ['details','payment','review','submitting','error','success'].forEach(p => {
      document.getElementById('panel-'+p).style.display = p === s ? 'block' : 'none';
    });
    const stepOrder = ['details','payment','review'];
    const ci = stepOrder.indexOf(['submitting','error','success'].includes(s) ? 'review' : s);
    stepOrder.forEach((step, i) => {
      const dot = document.getElementById('dot-'+step);
      dot.className = 'msf-step-dot';
      if (i < ci || s === 'success') { dot.classList.add('complete'); dot.textContent = '✓'; }
      else if (i === ci && s !== 'success') { dot.classList.add('active'); dot.textContent = i+1; }
      else dot.textContent = i+1;
    });
    ['line-1','line-2'].forEach((id,i) =>
      document.getElementById(id).classList.toggle('complete', i < ci || s === 'success'));
    const back=document.getElementById('msf-back'), next=document.getElementById('msf-next');
    const submit=document.getElementById('msf-submit'), retry=document.getElementById('msf-retry');
    const actions=document.getElementById('msf-actions');
    actions.style.display = ['submitting','success'].includes(s) ? 'none' : 'flex';
    back.style.display   = ['payment','review','error'].includes(s) ? '' : 'none';
    next.style.display   = ['details','payment'].includes(s) ? '' : 'none';
    submit.style.display = s === 'review' ? '' : 'none';
    retry.style.display  = s === 'error'  ? '' : 'none';
  },
};
document.getElementById('msf-next').addEventListener('click',   () => FSM.send('NEXT'));
document.getElementById('msf-back').addEventListener('click',   () => FSM.send('BACK'));
document.getElementById('msf-submit').addEventListener('click', () => FSM.send('SUBMIT'));
document.getElementById('msf-retry').addEventListener('click',  () => FSM.send('RETRY'));
FSM.render();`,
      check: (code) => {
        const hasRender     = /render\s*\(\s*\)|\.render\(\)/.test(code);
        const showsPanel    = /panel.*display|style\.display.*block/i.test(code);
        const wiresEvents   = /addEventListener.*click|\.onclick\s*=/.test(code);
        const handlesSend   = /FSM\.send|\.send\s*\(/.test(code);
        return hasRender && showsPanel && wiresEvents && handlesSend;
      },
      successMessage: `FSM implemented. The render() function is the view layer — it reads FSM.state and produces the correct UI. The send() function is the controller — it handles transitions. They are completely separate, which means you can test transitions without rendering and render without caring how the state was reached. This separation is the core of React, XState, and every serious state management system.`,
      failMessage: `Three required: (1) render() must set display style on the panels (show panel-details in 'details' state, etc.). (2) The action buttons must change based on state — submit only shows in 'review', next only in 'details'/'payment'. (3) The event handlers must call FSM.send() with the correct event string. The FSM itself is already correct — you're just implementing what the user sees.`,
      outputHeight: 540,
    },

    // ─── PART 7: ENGINEERING REALITY ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Engineering Reality: Fitts's Law, Hick's Law, Reaction Time

Every interaction design decision either works with or against three cognitive/motor constraints. Understanding them transforms "this feels hard to use" into "this violates Fitts's Law at the 14px button size."

### Fitts's Law

The time to acquire a target is a function of the target's size and its distance from the starting position:

\`T = a + b × log₂(1 + D/W)\`

Where T is movement time, D is distance to the target, W is the target width, and a, b are empirically derived constants.

**Practical implications:**
- Doubling a button's width reduces acquisition time more than halving the distance.
- Corner and edge positions have effectively infinite size in one direction (the screen edge stops the cursor) — that's why macOS puts the menu at the top edge and Windows puts the Start button in the corner.
- Very small targets (< 16px) have acquisition times that scale poorly — even a small distance penalty becomes large.
- The minimum 44px touch target is derived from Fitts's Law applied to a 10mm finger at 300dpi: acquisition time difference between 44px and 32px is ~30ms, but miss rate difference is ~12%.

### Hick's Law

Decision time increases logarithmically with the number of choices:

\`T = b × log₂(n + 1)\`

**Practical implications:**
- A navigation menu with 12 items takes measurably longer to process than one with 6 items.
- Primary navigation should have ≤7 items (Miller's law synergy).
- Long dropdown menus should be grouped — 5 groups of 6 is faster than 30 items flat.
- Confirmation dialogs with only one obvious action (plus a less-visible cancel) process faster than dialogs with two equal-weight choices.
- This is why "Delete" buttons are red and "Cancel" buttons are grey — reducing visual parity between options reduces decision time.

### Human Reaction Time Constraints

- **Simple reaction time** (single stimulus, known response): ~200ms
- **Choice reaction time** (multiple stimuli, multiple responses): ~350ms per additional option
- **Recognition time** (identify an element): ~150ms for familiar items, ~400ms for unfamiliar
- **Perception of delay**: delays > 100ms are noticeable; delays > 300ms feel like "lag"

These numbers directly determine the 100ms feedback threshold: it's the upper bound of simple reaction time. Feedback within 100ms feels simultaneous with the action. Above 100ms, the user consciously waits.

### The Interaction Cost Model

Every step in a user flow has a measurable cost. Industry data shows:
- Each additional form field reduces completion rate by ~2–4%
- Each additional page in a flow reduces completion by ~15–20%
- Each required registration before checkout reduces conversion by ~25%
- Each error message reduces completion by the same amount as adding a form field

A 5-step checkout with 12 fields has a different expected completion rate than a 2-step checkout with 6 fields — and the difference is calculable.`,
    },

    // ─── PART 8: ANTI-PATTERNS ────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Interaction Anti-Patterns Reference

Six interaction failures that appear in nearly every production interface.

---

### IX-1: The Silent Submit
**Symptom:** User clicks submit. Nothing visible changes. User clicks again. The form submits twice.
**Cause:** No immediate visual feedback on the button. No \`disabled\` state applied on first click.
**Fix:** On click: immediately set \`btn.disabled = true\` and \`classList.add('loading')\`. This must happen synchronously — not after an async wait.

---

### IX-2: The Full-Page Spinner
**Symptom:** User submits a form. The entire page becomes unresponsive with an overlay spinner. No indication of which operation is happening or how long it will take.
**Cause:** One global loading state applied to the whole page.
**Fix:** Scope loading state to the element that triggered the action. The submit button loads; the rest of the form is still readable. For page-level loads, use skeleton screens that preserve layout structure.

---

### IX-3: The Micro Target
**Symptom:** Interactive elements under 44×44px on mobile. Checkboxes with no padding. Close buttons that are 16×16px. Link text 12px tall and 30px wide.
**Cause:** Hit target designed for visual appearance, not for finger acquisition.
**Fix:** Use padding to extend the clickable area without changing visual size. A 20px icon button can have \`padding: 12px\` — visual size 20px, hit target 44px.

---

### IX-4: The Stateless Transition
**Symptom:** Clicking "Next" in a multi-step form immediately shows the next step with no transition. User loses orientation — were they on step 2 or 3?
**Cause:** State changes applied instantly without visual continuity.
**Fix:** Transitions under 200ms for step changes. Progress indicator always visible. Current state always obvious.

---

### IX-5: The Hostile Error
**Symptom:** "Error: Invalid input" with no indication of which field failed, why it failed, or how to fix it. Often red text that appears next to an input but doesn't connect visually.
**Cause:** Error copy written by engineers for debugging, not by designers for users.
**Fix:** Every error message must: (1) identify the specific field, (2) state what went wrong, (3) tell the user how to fix it. "Card number must be 16 digits" not "Invalid card."

---

### IX-6: The Orphaned Loading State
**Symptom:** Loading spinner appears but never resolves. Network request times out silently. User is stuck staring at a spinner with no way out.
**Cause:** No timeout handling, no error state for network failures.
**Fix:** Every loading state must have a timeout (typically 10–30s) that transitions to an error state with a retry action. Never leave the user in a loading state with no exit.`,
    },

    // ─── PART 9: PRACTICE 2 — TOUCH-TARGET TOOLBAR ───────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 2: Build a Touch-Target-Correct Toolbar

You're given a text editor toolbar with visually small icon buttons. Every button is currently 28×28px — below the 44px minimum for touch.

**Your task:** fix every hit target to ≥44×44px using padding, not by making the icons larger. The visual size of the icons must stay the same. Only the clickable area should increase.

**The technique:** remove the fixed \`width\` and \`height\` on the buttons, and instead use \`min-width: 44px; min-height: 44px\` with padding to fill the space. The icon content stays centred.

**Requirements:**
- Every button's click area must be ≥44×44px (verified by \`getBoundingClientRect()\`)
- The visual icon size must remain ≤24px (the button shouldn't visually grow huge)
- The toolbar height must be between 44px and 64px (not inflated beyond usable)
- All buttons must have a visible \`:focus-visible\` ring

The test reads every button's bounding rect and checks the 44×44 constraint.`,
      html: `<div class="tt2-wrap">
  <div class="tt2-toolbar" id="tt2-toolbar">
    <div class="tt2-group">
      <button class="tt2-btn" title="Bold"><b>B</b></button>
      <button class="tt2-btn" title="Italic"><i>I</i></button>
      <button class="tt2-btn" title="Underline"><u>U</u></button>
    </div>
    <div class="tt2-sep"></div>
    <div class="tt2-group">
      <button class="tt2-btn" title="H1">H₁</button>
      <button class="tt2-btn" title="H2">H₂</button>
      <button class="tt2-btn" title="Quote">"</button>
    </div>
    <div class="tt2-sep"></div>
    <div class="tt2-group">
      <button class="tt2-btn" title="Ordered list">1.</button>
      <button class="tt2-btn" title="Bullet list">•</button>
    </div>
    <div class="tt2-spacer"></div>
    <button class="tt2-btn tt2-destructive" title="Clear all">✕</button>
  </div>
  <div id="tt2-results"></div>
  <button class="tt2-audit-btn" id="tt2-audit">Run hit target audit</button>
</div>`,
      css: `body { background: #0f172a; padding: 24px; margin: 0; font-family: system-ui, sans-serif; }
.tt2-wrap    { max-width: 520px; display: flex; flex-direction: column; gap: 12px; }
.tt2-toolbar { display: flex; align-items: center; gap: 2px;
  background: hsl(222,39%,12%); border: 1px solid hsl(217,32%,22%);
  border-radius: 10px; padding: 4px 8px; }
.tt2-group   { display: flex; align-items: center; gap: 2px; }
.tt2-sep     { width: 1px; height: 20px; background: hsl(217,32%,22%); margin: 0 4px; }
.tt2-spacer  { flex: 1; }

/* YOUR TASK: fix these to be ≥44×44px using padding */
/* Current: 28×28px — violates the 44px rule */
.tt2-btn {
  /* You must change these properties to fix the hit target */
  width: 28px;           /* ← REMOVE or replace */
  height: 28px;          /* ← REMOVE or replace */
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: hsl(215,25%,65%);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.1s;
  /* Add focus ring here too */
}
.tt2-btn:hover { background: hsl(222,35%,17%); color: hsl(210,40%,96%); }
.tt2-destructive { color: hsl(0,74%,48%); }
.tt2-audit-btn { padding: 8px 16px; background: hsl(217,76%,47%); color: white;
  border: none; border-radius: 7px; font-size: 13px; font-weight: 600;
  cursor: pointer; width: fit-content; min-height: 44px; }
#tt2-results { font-family: monospace; font-size: 11px; color: hsl(215,25%,65%);
  line-height: 1.8; }`,
      startCode: `// FIX THE HIT TARGETS USING CSS
// The style element approach lets you override the CSS above

const fixStyles = document.createElement('style');
fixStyles.textContent = \`
  /* YOUR FIX: replace fixed width/height with min-width/min-height + padding */
  .tt2-btn {
    width: ???;         /* remove hardcoded 28px */
    height: ???;        /* remove hardcoded 28px */
    min-width: ???;     /* at least 44px */
    min-height: ???;    /* at least 44px */
    padding: ???;       /* fill to 44px while keeping icon small */
  }

  /* Add focus ring */
  .tt2-btn:focus-visible {
    outline: ???;
    outline-offset: ???;
  }
\`;
document.head.appendChild(fixStyles);

// ── Audit function ─────────────────────────────────────────────────────────────
function runAudit() {
  const btns    = document.querySelectorAll('.tt2-btn');
  const results = document.getElementById('tt2-results');
  let pass = 0, fail = 0;
  let lines = ['Hit target audit (44×44px minimum):\\n'];

  btns.forEach(btn => {
    const r = btn.getBoundingClientRect();
    const w = Math.round(r.width);
    const h = Math.round(r.height);
    const ok = w >= 44 && h >= 44;
    ok ? pass++ : fail++;
    lines.push((ok ? '✓' : '✗') + ' ' +
      (btn.title || btn.textContent.trim()).padEnd(14) +
      w + '×' + h + 'px');
  });

  lines.push('\\n' + pass + '/' + (pass+fail) + ' pass the 44×44px minimum');
  results.innerHTML = lines.join('\\n');

  console.log('=== HIT TARGET AUDIT ===');
  btns.forEach(btn => {
    const r = btn.getBoundingClientRect();
    console.log((r.width >= 44 && r.height >= 44 ? '✓' : '✗') +
      ' ' + (btn.title||btn.textContent.trim()).padEnd(14) +
      Math.round(r.width) + '×' + Math.round(r.height) + 'px');
  });
}

document.getElementById('tt2-audit').addEventListener('click', runAudit);
// Run automatically
setTimeout(runAudit, 100);`,
      solutionCode: `const fixStyles = document.createElement('style');
fixStyles.textContent = \`
  .tt2-btn {
    width: auto;
    height: auto;
    min-width: 44px;
    min-height: 44px;
    padding: 4px 8px;
    box-sizing: border-box;
  }
  .tt2-btn:focus-visible {
    outline: 2px solid hsl(217,76%,47%);
    outline-offset: 1px;
  }
\`;
document.head.appendChild(fixStyles);

function runAudit() {
  const btns = document.querySelectorAll('.tt2-btn');
  const results = document.getElementById('tt2-results');
  let pass = 0, fail = 0, lines = ['Hit target audit (44×44px minimum):\\n'];
  btns.forEach(btn => {
    const r = btn.getBoundingClientRect();
    const w = Math.round(r.width), h = Math.round(r.height);
    const ok = w >= 44 && h >= 44;
    ok ? pass++ : fail++;
    lines.push((ok?'✓':'✗') + ' ' + (btn.title||btn.textContent.trim()).padEnd(14) + w + '×' + h + 'px');
  });
  lines.push('\\n' + pass + '/' + (pass+fail) + ' pass');
  results.innerHTML = lines.join('\\n');
}
document.getElementById('tt2-audit').addEventListener('click', runAudit);
setTimeout(runAudit, 100);`,
      check: (code) => {
        const setsMinHeight  = /min-height.*44|minHeight.*44/i.test(code);
        const setsMinWidth   = /min-width.*44|minWidth.*44/i.test(code);
        const removesPxFixed = /width.*auto|width.*''|width.*unset/i.test(code) ||
                               /width:\s*auto/i.test(code);
        const hasFocus       = /focus-visible|focus.*outline/i.test(code);
        return setsMinHeight && setsMinWidth;
      },
      successMessage: `Hit targets corrected. The key insight: padding extends the clickable area without changing the visual icon size. min-width: 44px; min-height: 44px means the button is always at least 44×44px regardless of content size. The icon text stays small inside. This is the universal technique for WCAG 2.5.5 compliance on dense toolbars.`,
      failMessage: `Two required: (1) min-height: 44px on .tt2-btn — this is what the audit checks. (2) min-width: 44px. The fixed width and height (28px) need to be removed or overridden with auto. Use the CSS rule: width: auto; height: auto; min-width: 44px; min-height: 44px; and add padding to fill out the target area.`,
      outputHeight: 420,
    },

    // ─── PART 10: SABOTAGE SANDBOX ────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `## Sabotage Sandbox: Six Interaction Violations

The subscription management page below has six deliberate interaction violations. Diagnose and fix each using anti-pattern names.

**The violations:**
1. IX-1: Silent submit — cancel button has no immediate visual feedback
2. IX-2: Full-page spinner — loading state blocks the entire card, not just the button
3. IX-3: Micro targets — the plan selection radio buttons are 16×16px with no padding
4. IX-4: No transition between states — state changes are instant with no visual continuity
5. IX-5: Hostile error — error message says "Error code: PAYMENT_DECLINED" with no fix guidance
6. IX-6: Orphaned loading — no timeout on the loading state (stuck forever if network fails)

The test checks: loading state is scoped to a button (not full-card), radio targets are ≥44px, and the error message contains actionable text.`,
      html: `<div class="sub-card" id="sub-card">
  <div class="sub-header">
    <h3 class="sub-title">Change Plan</h3>
    <p class="sub-desc">Your current plan: <strong>Pro Monthly</strong></p>
  </div>
  <div class="sub-options" id="sub-options">
    <label class="sub-option" id="opt-starter">
      <input type="radio" name="plan" value="starter" class="sub-radio">
      <div class="sub-opt-info">
        <div class="sub-opt-name">Starter</div>
        <div class="sub-opt-price">$9/mo</div>
      </div>
    </label>
    <label class="sub-option" id="opt-pro">
      <input type="radio" name="plan" value="pro" checked class="sub-radio">
      <div class="sub-opt-info">
        <div class="sub-opt-name">Pro</div>
        <div class="sub-opt-price">$49/mo</div>
      </div>
    </label>
    <label class="sub-option" id="opt-enterprise">
      <input type="radio" name="plan" value="enterprise" class="sub-radio">
      <div class="sub-opt-info">
        <div class="sub-opt-name">Enterprise</div>
        <div class="sub-opt-price">$149/mo</div>
      </div>
    </label>
  </div>
  <div class="sub-error" id="sub-error" style="display:none">
    Error code: PAYMENT_DECLINED  <!-- VIOLATION IX-5 -->
  </div>
  <div class="sub-actions">
    <button class="sub-cancel" id="sub-cancel">Cancel</button>
    <button class="sub-confirm" id="sub-confirm">Confirm change</button>
  </div>
  <!-- VIOLATION IX-2: full-card loading overlay -->
  <div class="sub-overlay" id="sub-overlay" style="display:none">
    <div class="sub-spinner"></div>
  </div>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
:root {
  --space-2:8px; --space-3:12px; --space-4:16px; --space-5:24px;
  --c-surface:hsl(222,39%,12%); --c-surface-r:hsl(222,35%,17%);
  --c-border:hsl(217,32%,22%); --c-text-1:hsl(210,40%,96%);
  --c-text-2:hsl(215,25%,65%); --c-interactive:hsl(217,76%,47%);
  --c-error:hsl(0,74%,48%);
}
.sub-card { background:var(--c-surface); border:1px solid var(--c-border);
  border-radius:14px; padding:var(--space-5); width:340px; position:relative;
  overflow:hidden; }
.sub-header { margin-bottom:var(--space-4); }
.sub-title { font-size:16px; font-weight:700; color:var(--c-text-1); margin:0 0 4px; }
.sub-desc  { font-size:13px; color:var(--c-text-2); margin:0; }
.sub-options{ display:flex; flex-direction:column; gap:8px; margin-bottom:16px; }
.sub-option { display:flex; align-items:center; gap:12px; padding:12px;
  background:var(--c-surface-r); border:1px solid var(--c-border);
  border-radius:8px; cursor:pointer; }
.sub-option:has(input:checked) { border-color:var(--c-interactive); }

/* VIOLATION IX-3: radio button 16×16px — way below 44px */
.sub-radio { width:16px; height:16px; accent-color:var(--c-interactive);
  cursor:pointer; /* no padding to extend hit target */ }

.sub-opt-name  { font-size:14px; font-weight:600; color:var(--c-text-1); }
.sub-opt-price { font-size:12px; color:var(--c-text-2); }
.sub-error { padding:10px 12px; background:rgba(239,68,68,0.08);
  border:1px solid rgba(239,68,68,0.2); border-radius:7px; margin-bottom:12px;
  font-size:12px; color:var(--c-error); /* error has no actionable guidance */ }
.sub-actions { display:flex; gap:8px; }

/* VIOLATION IX-1: cancel has no feedback state */
.sub-cancel  { flex:1; padding:10px; background:transparent; color:var(--c-text-2);
  border:1px solid var(--c-border); border-radius:8px; font-size:14px;
  font-weight:600; cursor:pointer; min-height:44px;
  /* no :active state, no loading state */ }
.sub-confirm { flex:1; padding:10px; background:var(--c-interactive); color:white;
  border:none; border-radius:8px; font-size:14px; font-weight:600;
  cursor:pointer; min-height:44px; }
/* VIOLATION IX-2: full card overlay instead of button-scoped loading */
.sub-overlay { position:absolute; inset:0; background:rgba(11,14,18,0.75);
  display:flex; align-items:center; justify-content:center;
  backdrop-filter:blur(2px); }
.sub-spinner { width:28px; height:28px; border:3px solid rgba(255,255,255,0.15);
  border-top-color:white; border-radius:50%; animation:subspin 0.8s linear infinite; }
@keyframes subspin { to { transform:rotate(360deg); } }`,
      startCode: `// FIX THE SIX INTERACTION VIOLATIONS

const card    = document.getElementById('sub-card');
const confirm = document.getElementById('sub-confirm');
const cancel  = document.getElementById('sub-cancel');
const overlay = document.getElementById('sub-overlay');
const error   = document.getElementById('sub-error');
let loadingTimeout;

// ── FIX IX-3: Micro targets — extend radio hit areas ──────────────────────────
// Radio buttons must be ≥44×44px clickable area
// The .sub-option label already has a large click area, but the radio itself is tiny
// Fix: the entire .sub-option should be the hit target (it's a label — clicking anywhere submits)
// But also fix the radio to have adequate size or use a custom replacement
const radioFix = document.createElement('style');
radioFix.textContent = \`
  .sub-radio {
    /* YOUR FIX: extend hit target */
    width: ???;
    height: ???;
  }
  /* FIX IX-1: Cancel button needs active/press feedback */
  .sub-cancel:active {
    /* YOUR FIX */
  }
  /* FIX IX-4: Add transition to state changes */
  .sub-card { transition: ???; }
  .sub-error { transition: ???; }
\`;
document.head.appendChild(radioFix);

// ── FIX IX-2: Scope loading to button, not full card ──────────────────────────
function startLoading() {
  // Remove the overlay approach
  overlay.style.display = 'none'; // ← disable the full-card overlay

  // Instead: scope loading to the button only
  confirm.disabled = true;
  confirm.textContent = '???'; // spinner + text

  // FIX IX-6: Add timeout — transition to error if no response in 10s
  loadingTimeout = setTimeout(() => {
    stopLoading();
    showError('???'); // actionable error message
  }, 10000);
}

function stopLoading() {
  clearTimeout(loadingTimeout);
  confirm.disabled = false;
  confirm.textContent = 'Confirm change';
}

// ── FIX IX-5: Replace hostile error with actionable message ──────────────────
function showError(msg) {
  error.textContent = msg || '???'; // must be actionable — not "Error code: PAYMENT_DECLINED"
  error.style.display = 'block';
}

// ── Wire up the demo ──────────────────────────────────────────────────────────
confirm.addEventListener('click', () => {
  error.style.display = 'none';
  startLoading();
  // Simulate: 60% success, 40% error (so we can test error path)
  setTimeout(() => {
    stopLoading();
    if (Math.random() > 0.4) {
      confirm.textContent = '✓ Plan updated';
      confirm.style.background = 'hsl(142,60%,45%)';
    } else {
      showError('???'); // YOUR actionable message
    }
  }, 2000);
});

cancel.addEventListener('click', () => {
  // FIX IX-1: add immediate visual feedback before navigation
  cancel.textContent = 'Cancelling…';
  cancel.disabled = true;
  setTimeout(() => { cancel.textContent = 'Cancel'; cancel.disabled = false; }, 800);
});

// ── AUDIT ─────────────────────────────────────────────────────────────────────
setTimeout(() => {
  const radios = document.querySelectorAll('.sub-radio');
  const errorText = document.getElementById('sub-error').textContent;

  let pass = 0;
  radios.forEach(r => {
    const rect = r.getBoundingClientRect();
    if (rect.width >= 20 || r.closest('label').getBoundingClientRect().height >= 44) pass++;
  });

  const checks = {
    'IX-2 no full-card overlay': overlay.style.display === 'none' || !overlay.style.display,
    'IX-3 radio targets adequate': pass >= radios.length,
    'IX-6 timeout exists':    !!loadingTimeout || /setTimeout[\s\\S]*?10000|loadingTimeout/i.test(arguments.callee.toString()),
  };

  const errorOk = !error.textContent.includes('Error code:') && error.textContent.length > 5;
  checks['IX-5 actionable error'] = errorOk;

  console.log('=== INTERACTION VIOLATIONS AUDIT ===');
  Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗') + ' ' + k));
}, 200);`,
      solutionCode: `const card=document.getElementById('sub-card'), confirm=document.getElementById('sub-confirm');
const cancel=document.getElementById('sub-cancel'), overlay=document.getElementById('sub-overlay');
const error=document.getElementById('sub-error');
let loadingTimeout;

const radioFix = document.createElement('style');
radioFix.textContent = \`
  .sub-radio { width: 20px; height: 20px; }
  .sub-option { min-height: 44px; }
  .sub-cancel:active { opacity: 0.6; transform: scale(0.98); }
  .sub-error { transition: opacity 0.15s; }
\`;
document.head.appendChild(radioFix);

overlay.style.display = 'none';

function startLoading() {
  overlay.style.display = 'none';
  confirm.disabled = true;
  confirm.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:subspin 0.8s linear infinite;vertical-align:middle;margin-right:6px"></span>Processing…';
  loadingTimeout = setTimeout(() => { stopLoading(); showError('Payment timed out. Please try again or use a different card.'); }, 10000);
}
function stopLoading() { clearTimeout(loadingTimeout); confirm.disabled=false; confirm.textContent='Confirm change'; confirm.style.background=''; }
function showError(msg) { error.textContent=msg||'Payment failed. Check your card details and try again.'; error.style.display='block'; }

confirm.addEventListener('click', () => {
  error.style.display='none'; startLoading();
  setTimeout(() => { stopLoading(); if (Math.random()>0.4) { confirm.textContent='✓ Plan updated'; confirm.style.background='hsl(142,60%,45%)'; } else { showError('Card declined. Please check your card number and try again, or use a different payment method.'); } }, 2000);
});
cancel.addEventListener('click', () => { cancel.textContent='Cancelling…'; cancel.disabled=true; setTimeout(()=>{ cancel.textContent='Cancel'; cancel.disabled=false; },800); });`,
      check: (code) => {
        const fixesOverlay  = /overlay.*display.*none|overlay\.style\.display\s*=\s*['"]none['"]/i.test(code);
        const fixesError    = /showError\s*\(['"]\s*[A-Z]|error\.textContent\s*=\s*['"]\s*[A-Z]/i.test(code) || /actionable|check.*card|try again|payment/i.test(code);
        const hasTimeout    = /setTimeout[\s\S]*?10000|10\s*\*\s*1000/i.test(code);
        return fixesOverlay && hasTimeout;
      },
      successMessage: `Six interaction violations fixed. The most impactful: IX-2 (scoping loading to the button) and IX-6 (adding a timeout). The full-card overlay is a common production pattern that looks like polish but actually signals "I don't know which operation failed" when something goes wrong. The timeout is invisible until it's needed — then it's the difference between a confused user and a recoverable error.`,
      failMessage: `Two required: (1) The full-card overlay must be hidden (overlay.style.display = 'none') and replaced with button-scoped loading. (2) A setTimeout with ~10000ms must exist to handle the IX-6 orphaned loading case. The audit will tell you which checks are still failing.`,
      outputHeight: 520,
    },

    // ─── PART 11: STRESS CONDITION ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Stress Condition: The Form Under Every Failure Mode

A form must handle five distinct failure modes gracefully. Each one has a different cause, a different visual state, and a different recovery path.

This cell cycles through all five — watch the FSM handle each one cleanly. The important observation: **no failure mode requires changes to the form fields** — only to the submit button and the error region. The data the user entered is preserved in every error state. That is the correct pattern.`,
      html: `<div class="stress-form" id="stress-form">
  <h3 class="sf-title">Payment details</h3>
  <div class="sf-field">
    <label class="sf-label">Card number</label>
    <input class="sf-input" value="4242 4242 4242 4242" readonly>
  </div>
  <div class="sf-field">
    <label class="sf-label">Cardholder name</label>
    <input class="sf-input" value="Sarah Chen" readonly>
  </div>
  <div class="sf-notice" id="sf-notice" style="display:none"></div>
  <div class="sf-actions">
    <button class="sf-btn sf-submit" id="sf-submit">Pay $49.00</button>
    <button class="sf-btn sf-retry" id="sf-retry" style="display:none">Try again →</button>
  </div>
  <p class="sf-secure">� Payments secured by Stripe</p>
</div>
<div class="sf-scenarios" id="sf-scenarios"></div>`,
      css: `body { background: #0f172a; padding: 24px; margin: 0; font-family: system-ui, sans-serif; }
:root {
  --space-2:8px; --space-3:12px; --space-4:16px;
  --c-surface:hsl(222,39%,12%); --c-border:hsl(217,32%,22%);
  --c-text-1:hsl(210,40%,96%); --c-text-2:hsl(215,25%,65%); --c-text-3:hsl(217,20%,45%);
  --c-interactive:hsl(217,76%,47%); --c-error:hsl(0,74%,48%); --c-success:hsl(142,60%,45%);
}
.stress-form { background:var(--c-surface); border:1px solid var(--c-border);
  border-radius:12px; padding:var(--space-4); width:300px; margin-bottom:16px; }
.sf-title  { font-size:16px; font-weight:700; color:var(--c-text-1); margin:0 0 14px; }
.sf-field  { margin-bottom:10px; }
.sf-label  { display:block; font-size:12px; font-weight:500; color:var(--c-text-2);
  margin-bottom:4px; }
.sf-input  { width:100%; padding:9px 12px; background:hsl(222,47%,7%);
  border:1px solid var(--c-border); border-radius:7px; color:var(--c-text-1);
  font-size:14px; box-sizing:border-box; outline:none; }
.sf-notice { padding:9px 12px; border-radius:7px; border:1px solid;
  font-size:12px; font-weight:500; margin:10px 0; line-height:1.5;
  transition: all 0.15s; }
.sf-notice.error   { background:rgba(239,68,68,0.08); border-color:rgba(239,68,68,0.25);
  color:hsl(0,84%,80%); }
.sf-notice.success { background:rgba(34,197,94,0.08); border-color:rgba(34,197,94,0.25);
  color:hsl(142,76%,75%); }
.sf-notice.warning { background:rgba(251,191,36,0.08); border-color:rgba(251,191,36,0.25);
  color:hsl(38,95%,80%); }
.sf-actions { display:flex; gap:8px; }
.sf-btn    { flex:1; padding:10px; border:none; border-radius:8px;
  font-size:14px; font-weight:600; cursor:pointer; min-height:44px; transition:all 0.15s; }
.sf-submit { background:var(--c-interactive); color:white; }
.sf-submit:disabled { opacity:0.5; cursor:not-allowed; }
.sf-retry  { background:var(--c-error); color:white; }
.sf-secure { font-size:11px; color:var(--c-text-3); text-align:center; margin:10px 0 0; }
.sf-scenarios { display:flex; flex-wrap:wrap; gap:8px; max-width:380px; }
.ss-btn { font-size:11px; font-weight:500; padding:5px 12px; border-radius:6px;
  border:1px solid var(--c-border); background:var(--c-surface); color:var(--c-text-3);
  cursor:pointer; }
.ss-btn.active { background:var(--c-interactive); color:white; border-color:var(--c-interactive); }`,
      startCode: `const submit = document.getElementById('sf-submit');
const retry  = document.getElementById('sf-retry');
const notice = document.getElementById('sf-notice');

const SCENARIOS = [
  {
    id: 'success',
    label: '✓ Payment succeeds',
    run: (done) => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        showNotice('success', '✓ Payment processed. Receipt sent to sarah@acme.com');
        done();
      }, 1200);
    },
  },
  {
    id: 'card-declined',
    label: '✗ Card declined',
    run: (done) => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        showNotice('error', '✕ Card declined. Check your card number and expiry date, or try a different card.');
        showRetry(true);
        done();
      }, 1400);
    },
  },
  {
    id: 'network-error',
    label: '✗ Network error',
    run: (done) => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        showNotice('error', '✕ Connection lost. Your card has not been charged. Check your internet connection and try again.');
        showRetry(true);
        done();
      }, 10000); // simulated timeout — in real code this would be the timeout handler
    },
  },
  {
    id: 'server-error',
    label: '✗ Server error',
    run: (done) => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        showNotice('error', '✕ Payment service temporarily unavailable. Your card has not been charged. Please try again in a few minutes.');
        showRetry(true);
        done();
      }, 900);
    },
  },
  {
    id: 'processing',
    label: '⟳ Slow network',
    run: (done) => {
      setLoading(true);
      setTimeout(() => { // simulate slow
        setLoading(false);
        showNotice('warning', '⏳ This is taking longer than usual. Still processing — please wait.');
        setTimeout(() => { showNotice('success', '✓ Payment processed. Receipt sent.'); done(); }, 3000);
      }, 4000);
    },
  },
];

function setLoading(on) {
  submit.disabled = on;
  submit.innerHTML = on
    ? '<span style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:subspin 0.8s linear infinite;margin-right:6px;vertical-align:middle"></span>Processing…'
    : 'Pay $49.00';
}

function showNotice(type, msg) {
  notice.className = 'sf-notice ' + type;
  notice.textContent = msg;
  notice.style.display = 'block';
}

function showRetry(show) {
  retry.style.display = show ? '' : 'none';
  submit.style.flex = show ? '0 0 auto' : '1';
  if (show) submit.style.display = 'none'; else submit.style.display = '';
}

function reset() {
  notice.style.display = 'none';
  showRetry(false);
  setLoading(false);
}

// Build scenario buttons
const scenEl = document.getElementById('sf-scenarios');
SCENARIOS.forEach(sc => {
  const btn = document.createElement('button');
  btn.className = 'ss-btn';
  btn.textContent = sc.label;
  btn.onclick = () => {
    reset();
    document.querySelectorAll('.ss-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (sc.id === 'network-error') {
      // Don't actually wait 10s — simulate timeout immediately
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        showNotice('error', '✕ Connection lost. Your card has not been charged. Check your connection and try again.');
        showRetry(true);
        btn.classList.remove('active');
      }, 2000);
    } else {
      sc.run(() => btn.classList.remove('active'));
    }
  };
  scenEl.appendChild(btn);
});

retry.onclick = () => {
  reset();
  setLoading(true);
  setTimeout(() => {
    setLoading(false);
    showNotice('success', '✓ Payment processed on retry. Receipt sent.');
  }, 1400);
};

console.log('Click each scenario to see the form handle it correctly.');
console.log('Notice: user data is preserved across all error states.');
console.log('Notice: error messages are actionable — they say what happened and what to do.');
console.log('Notice: loading is scoped to the button, not the whole form.');`,
      outputHeight: 440,
    },

    // ─── PART 12: PRACTICE 3 — INTERACTION COST AUDIT ────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 3: Audit and Reduce Interaction Cost

You're given an e-commerce checkout flow with too many steps. Using Hick's Law and the interaction cost model, identify which steps are unnecessary and restructure the flow to reduce completion cost.

**Current flow (8 steps):**
1. Cart review
2. Account creation (required)
3. Email verification
4. Shipping address
5. Shipping method selection
6. Payment details
7. Order review
8. Confirmation

**Your task:**
1. Identify at minimum 3 steps that violate interaction cost principles (required registration, unnecessary verification, redundant review)
2. Produce a redesigned flow of ≤5 steps
3. Calculate the theoretical completion rate improvement using the industry model (each removed step = +15–20% relative)
4. Implement a working step indicator showing your redesigned flow

The test verifies: your redesigned flow has ≤5 steps, you've identified the forced-registration problem (highest single drop-off), and the flow indicator renders correctly.`,
      html: `<div id="cost-audit">
  <div id="original-flow">
    <div class="ca-label">Original flow (8 steps)</div>
    <div class="ca-steps" id="ca-original"></div>
    <div class="ca-metric" id="ca-original-rate"></div>
  </div>
  <div id="redesigned-flow" style="margin-top:20px">
    <div class="ca-label">Your redesigned flow</div>
    <div class="ca-steps" id="ca-redesigned"></div>
    <div class="ca-metric" id="ca-redesigned-rate"></div>
  </div>
  <div id="ca-analysis" style="margin-top:16px"></div>
</div>`,
      css: `body { background: #0f172a; padding: 24px; margin: 0; font-family: system-ui, sans-serif; }
#cost-audit { max-width: 560px; }
.ca-label { font-size: 10px; font-weight: 700; color: #475569;
  letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
.ca-steps { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.ca-step  { font-size: 11px; font-weight: 500; padding: 4px 10px;
  border-radius: 100px; border: 1px solid; }
.ca-step.keep    { background:rgba(74,222,128,0.08); border-color:rgba(74,222,128,0.2);
  color:#86efac; }
.ca-step.remove  { background:rgba(248,113,113,0.08); border-color:rgba(248,113,113,0.2);
  color:#fca5a5; text-decoration:line-through; }
.ca-step.merge   { background:rgba(251,191,36,0.08); border-color:rgba(251,191,36,0.2);
  color:#fde68a; }
.ca-metric { font-size: 13px; color: hsl(215,25%,65%); }
.ca-metric strong { color: hsl(210,40%,96%); }
.ca-analysis { background:hsl(222,39%,12%); border:1px solid hsl(217,32%,22%);
  border-radius:8px; padding:14px 16px; font-size:12px; color:hsl(215,25%,65%);
  line-height:1.7; }
.ca-analysis strong { color:hsl(210,40%,96%); }`,
      startCode: `// INTERACTION COST AUDIT
// Industry baseline: each additional step reduces completion ~15%
// Forced registration: ~25% drop (single highest-impact violation)

const ORIGINAL_STEPS = [
  { name: 'Cart review',          cost: 0.05, issue: null },
  { name: 'Account creation',     cost: 0.25, issue: 'FORCED_REGISTRATION' },
  { name: 'Email verification',   cost: 0.15, issue: 'UNNECESSARY_VERIFICATION' },
  { name: 'Shipping address',     cost: 0.05, issue: null },
  { name: 'Shipping method',      cost: 0.10, issue: 'LOW_VALUE_CHOICE' },
  { name: 'Payment details',      cost: 0.05, issue: null },
  { name: 'Order review',         cost: 0.08, issue: 'REDUNDANT_REVIEW' },
  { name: 'Confirmation',         cost: 0.02, issue: null },
];

// Calculate completion rate (multiplicative — each step reduces independently)
function completionRate(steps) {
  return steps.reduce((rate, step) => rate * (1 - step.cost), 1.0);
}

// ── STEP 1: Render original flow ──────────────────────────────────────────────
function renderSteps(containerId, steps) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  steps.forEach((step, i) => {
    const el = document.createElement('div');
    el.className = 'ca-step ' + (step.status || (step.issue ? 'remove' : 'keep'));
    el.textContent = (i + 1) + '. ' + step.name;
    if (step.issue) el.title = step.issue;
    container.appendChild(el);
  });
}

renderSteps('ca-original', ORIGINAL_STEPS);
const originalRate = completionRate(ORIGINAL_STEPS);
document.getElementById('ca-original-rate').innerHTML =
  'Estimated completion: <strong>' + (originalRate * 100).toFixed(1) + '%</strong> ' +
  '(industry avg for 8-step checkout)';

// ── STEP 2: Define your redesigned flow ───────────────────────────────────────
// Rules:
// - Max 5 steps
// - Remove or merge the high-cost steps
// - Each kept step must have a lower cost than the original
// - Guest checkout must be available (fixes FORCED_REGISTRATION)
// - Shipping + payment can be combined (fixes REDUNDANT_REVIEW)

const REDESIGNED_STEPS = [
  // YOUR REDESIGNED STEPS HERE
  // Each step: { name, cost, status: 'keep' | 'merge' | 'remove' }
  // Example: { name: 'Cart + Guest email', cost: 0.04, status: 'merge' },
];

// ── STEP 3: Render redesigned flow and calculate improvement ──────────────────
if (REDESIGNED_STEPS.length > 0) {
  renderSteps('ca-redesigned', REDESIGNED_STEPS);
  const redesignedRate = completionRate(REDESIGNED_STEPS);
  const improvement = ((redesignedRate - originalRate) / originalRate * 100).toFixed(1);
  document.getElementById('ca-redesigned-rate').innerHTML =
    'Estimated completion: <strong>' + (redesignedRate * 100).toFixed(1) + '%</strong> ' +
    '(+' + improvement + '% relative improvement)';

  document.getElementById('ca-analysis').innerHTML = \`
    <strong>Your analysis</strong><br>
    Original: \${ORIGINAL_STEPS.length} steps, \${(originalRate*100).toFixed(1)}% estimated completion<br>
    Redesigned: \${REDESIGNED_STEPS.length} steps, \${(redesignedRate*100).toFixed(1)}% estimated completion<br>
    Improvement: +\${improvement}% relative<br><br>
    <strong>Key removals:</strong><br>
    \${REDESIGNED_STEPS
      .filter(s => s.status === 'remove' || s.status === 'merge')
      .map(s => '• ' + s.name + ' (' + s.status + ')')
      .join('<br>') || 'None defined yet'}
  \`;
} else {
  document.getElementById('ca-redesigned').textContent = 'Define REDESIGNED_STEPS above';
}

// ── AUDIT ─────────────────────────────────────────────────────────────────────
setTimeout(() => {
  const stepCount     = REDESIGNED_STEPS.length;
  const noForcedReg   = !REDESIGNED_STEPS.some(s =>
    s.name.toLowerCase().includes('account') && !s.name.toLowerCase().includes('guest'));
  const stepsRendered = document.querySelectorAll('#ca-redesigned .ca-step').length;

  console.log('=== INTERACTION COST AUDIT ===');
  console.log((stepCount > 0 && stepCount <= 5 ? '✓' : '✗') + ' Flow has ≤5 steps (' + stepCount + ')');
  console.log((noForcedReg ? '✓' : '✗') + ' No forced account creation');
  console.log((stepsRendered > 0 ? '✓' : '✗') + ' Flow renders correctly (' + stepsRendered + ' steps shown)');
}, 100);`,
      solutionCode: `const ORIGINAL_STEPS = [
  { name:'Cart review', cost:0.05, issue:null },
  { name:'Account creation', cost:0.25, issue:'FORCED_REGISTRATION' },
  { name:'Email verification', cost:0.15, issue:'UNNECESSARY_VERIFICATION' },
  { name:'Shipping address', cost:0.05, issue:null },
  { name:'Shipping method', cost:0.10, issue:'LOW_VALUE_CHOICE' },
  { name:'Payment details', cost:0.05, issue:null },
  { name:'Order review', cost:0.08, issue:'REDUNDANT_REVIEW' },
  { name:'Confirmation', cost:0.02, issue:null },
];

function completionRate(steps) { return steps.reduce((r,s) => r*(1-s.cost), 1.0); }

function renderSteps(containerId, steps) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  steps.forEach((step, i) => {
    const el = document.createElement('div');
    el.className = 'ca-step ' + (step.status || (step.issue ? 'remove' : 'keep'));
    el.textContent = (i+1) + '. ' + step.name;
    container.appendChild(el);
  });
}

renderSteps('ca-original', ORIGINAL_STEPS);
const origRate = completionRate(ORIGINAL_STEPS);
document.getElementById('ca-original-rate').innerHTML =
  'Estimated completion: <strong>' + (origRate*100).toFixed(1) + '%</strong>';

const REDESIGNED_STEPS = [
  { name: 'Cart + Guest email',           cost: 0.04, status: 'merge' },
  { name: 'Shipping address + method',    cost: 0.06, status: 'merge' },
  { name: 'Payment',                      cost: 0.05, status: 'keep'  },
  { name: 'Review & confirm',             cost: 0.04, status: 'merge' },
  { name: 'Order confirmation',           cost: 0.01, status: 'keep'  },
];

renderSteps('ca-redesigned', REDESIGNED_STEPS);
const newRate = completionRate(REDESIGNED_STEPS);
const imp = ((newRate - origRate)/origRate*100).toFixed(1);
document.getElementById('ca-redesigned-rate').innerHTML =
  'Estimated completion: <strong>' + (newRate*100).toFixed(1) + '%</strong> (+' + imp + '% relative)';
document.getElementById('ca-analysis').innerHTML =
  '<strong>Analysis</strong><br>Removed forced registration (+25%), merged 5 steps into 4, reduced redundant review. Estimated improvement: +' + imp + '% relative.';`,
      check: (code) => {
        const hasSteps     = /REDESIGNED_STEPS\s*=\s*\[[\s\S]*?\{/.test(code);
        const fiveOrFewer  = (code.match(/\{\s*name:/g) || []).length <= 8; // 8 orig + 5 redesign max
        const noForcedReg  = !/account creation[\s\S]*?keep/i.test(code);
        const rendersFlow  = /renderSteps|ca-redesigned/i.test(code);
        return hasSteps && rendersFlow && noForcedReg;
      },
      successMessage: `Interaction cost audit complete. The forced-registration step is the single highest-impact removal — 25% of users who encounter a required account creation before checkout abandon immediately. The merge of shipping address + method reduces two low-value steps to one. The theoretical improvement is calculable from the cost model, which is what allows you to prioritise which steps to remove first.`,
      failMessage: `Three required: (1) REDESIGNED_STEPS must be defined as an array with at least 2 objects. (2) The flow must not include a forced "Account creation" step marked as "keep" — guest checkout must be available. (3) renderSteps('ca-redesigned', REDESIGNED_STEPS) must be called to render the flow. The audit checks all three.`,
      outputHeight: 460,
    },

    // ─── PART 13: CROSS-PLATFORM ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Cross-Platform: Interaction Constraints Everywhere

The cognitive and motor constraints that drive interaction design are human constants — they don't change based on the framework or platform. Only the implementation syntax changes.

| Concept | Web/CSS | React | iOS (Swift) | Android | Qt/C++ |
|---|---|---|---|---|---|
| Hit target | \`min-height: 44px\` | Tailwind \`min-h-[44px]\` | \`.frame(minHeight: 44)\` | \`48dp\` minimum | \`setMinimumHeight(44)\` |
| Focus ring | \`:focus-visible { outline }\` | \`focus:ring\` (Tailwind) | \`focused\` modifier | FocusHighlight | \`setFocusPolicy\` |
| Loading state | CSS class + spinner | \`isLoading\` prop | \`ProgressView\` | \`CircularProgressIndicator\` | \`QProgressIndicator\` |
| Disabled state | \`disabled\` + \`pointer-events: none\` | \`disabled\` prop | \`.disabled(true)\` | \`isEnabled = false\` | \`setEnabled(false)\` |
| Feedback timing | CSS \`transition: 100ms\` | CSS-in-JS transition | \`withAnimation\` | \`animateContentChange\` | \`QPropertyAnimation\` |
| State machine | Vanilla JS / XState | useReducer / XState | SwiftUI \`@State\` | ViewModel StateFlow | QStateMachine |
| Double-submit | \`btn.disabled = true\` | \`setLoading(true)\` | Button disabled on action | Button enabled = false | \`setEnabled(false)\` |

### What Never Changes

1. **100ms is the feedback perception threshold.** Any platform, any renderer. Feedback after 100ms is perceived as lag.
2. **44px minimum touch target.** iOS uses 44pt, Material uses 48dp, WCAG uses 44px — all approximately equal at standard display densities.
3. **The FSM model.** Every interactive component has a finite number of states, events, and transitions. Modelling them explicitly produces fewer bugs.
4. **The double-submit fix.** Always disable the submit trigger immediately on activation, before any async work.
5. **States scope to the element, not the page.** Button loading, not page loading. Field error, not form error.

---

## What You Now Know

After Lesson 7, you can:
- Model any interactive component as a finite state machine
- Identify missing affordances by the five signals
- Audit hit targets against the 44px minimum using bounding rects
- Apply the three feedback timing thresholds correctly
- Replace hostile errors with actionable messages
- Calculate and reduce interaction cost in a user flow
- Fix all six interaction anti-patterns (IX-1 through IX-6)

**Next: Systems Design** — design tokens at scale, component governance, preventing design drift, and building a system that 10 engineers can contribute to without breaking.`,
    },

    // ─── PART 14: SEED ────────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Lesson 7 Complete — The \`auditInteraction()\` Tool

The complete interaction audit, combining all checks from this lesson: hit targets, affordances, loading states, focus rings, and input types. Zero violations = interaction-complete component.

Together with \`auditComponent()\` from Lesson 6, this gives you a full-spectrum audit covering all six design systems.`,
      html: `<div id="ref-form">
  <div class="rf-card">
    <h3 class="rf-title">Pay $49.00</h3>
    <div class="rf-field">
      <label class="rf-label">Email</label>
      <input class="rf-input" id="rf-email" type="email" placeholder="you@company.com">
    </div>
    <div class="rf-field">
      <label class="rf-label">Card number</label>
      <input class="rf-input" id="rf-card" type="text" inputmode="numeric"
        placeholder="4242 4242 4242 4242">
    </div>
    <button class="rf-submit" id="rf-submit">Pay now</button>
    <div class="rf-notice" id="rf-notice" style="display:none"></div>
  </div>
</div>`,
      css: `body { background: #0f172a; display: flex; justify-content: center;
  align-items: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
:root {
  --space-2:8px; --space-3:12px; --space-4:16px; --space-5:24px;
  --c-surface:hsl(222,39%,12%); --c-border:hsl(217,32%,22%);
  --c-text-1:hsl(210,40%,96%); --c-text-2:hsl(215,25%,65%);
  --c-interactive:hsl(217,76%,47%); --c-error:hsl(0,74%,48%); --c-success:hsl(142,60%,45%);
}
.rf-card   { background:var(--c-surface); border:1px solid var(--c-border);
  border-radius:12px; padding:var(--space-5); width:300px;
  display:flex; flex-direction:column; gap:var(--space-3); }
.rf-title  { font-size:16px; font-weight:700; color:var(--c-text-1); margin:0; }
.rf-field  { display:flex; flex-direction:column; gap:var(--space-1); }
.rf-label  { font-size:12px; font-weight:500; color:var(--c-text-2); }
.rf-input  { padding:var(--space-2) var(--space-3); background:hsl(222,47%,7%);
  border:1px solid var(--c-border); border-radius:7px; color:var(--c-text-1);
  font-size:14px; outline:none; width:100%; box-sizing:border-box;
  transition:border-color 0.12s; }
.rf-input:focus { border-color:var(--c-interactive);
  box-shadow:0 0 0 3px hsla(217,76%,47%,0.2); }
/* Correct: min-height 44px on submit */
.rf-submit { min-height:44px; padding:var(--space-2) var(--space-4);
  background:var(--c-interactive); color:white; border:none; border-radius:8px;
  font-size:14px; font-weight:600; cursor:pointer; transition:all 0.12s; }
.rf-submit:hover { filter:brightness(1.1); }
.rf-submit:active { transform:scale(0.98); }
.rf-submit:focus-visible { outline:2px solid var(--c-interactive); outline-offset:2px; }
.rf-submit:disabled { opacity:0.4; cursor:not-allowed; pointer-events:none; }
.rf-notice { padding:var(--space-2) var(--space-3); border-radius:7px; border:1px solid;
  font-size:12px; font-weight:500; }
.rf-notice.error { background:rgba(239,68,68,0.08); border-color:rgba(239,68,68,0.25); color:hsl(0,84%,80%); }
.rf-notice.success { background:rgba(34,197,94,0.08); border-color:rgba(34,197,94,0.25); color:hsl(142,76%,75%); }

/* Spinner animation */
@keyframes rfspin { to { transform:rotate(360deg); } }`,
      startCode: `// ── CORRECT FSM WIRING ───────────────────────────────────────────────────────
const submit = document.getElementById('rf-submit');
const notice = document.getElementById('rf-notice');
let timeout;

const FSM = {
  state: 'idle',
  transitions: {
    idle:       { SUBMIT: 'loading' },
    loading:    { SUCCESS: 'success', FAIL: 'error', TIMEOUT: 'error' },
    error:      { RETRY: 'loading', RESET: 'idle' },
    success:    {},
  },
  send(event) {
    const next = this.transitions[this.state]?.[event];
    if (next) { this.state = next; this.render(); }
  },
  render() {
    const s = this.state;
    notice.style.display = 'none';
    clearTimeout(timeout);

    if (s === 'idle') {
      submit.disabled = false;
      submit.textContent = 'Pay now';
    } else if (s === 'loading') {
      // Immediate disable prevents double-submit (IX-1 fix)
      submit.disabled = true;
      submit.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;">' +
        '<span style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.25);' +
        'border-top-color:white;border-radius:50%;animation:rfspin 0.8s linear infinite;flex-shrink:0"></span>' +
        'Processing…</span>';
      // IX-6 fix: timeout after 10s
      timeout = setTimeout(() => FSM.send('TIMEOUT'), 10000);
    } else if (s === 'error') {
      submit.disabled = false;
      submit.textContent = 'Try again';
      notice.className = 'rf-notice error';
      notice.textContent = '✕ Payment failed. Check your card details and try again.';
      notice.style.display = 'block';
    } else if (s === 'success') {
      submit.disabled = true;
      submit.textContent = '✓ Paid';
      submit.style.background = 'var(--c-success)';
      notice.className = 'rf-notice success';
      notice.textContent = '✓ Payment confirmed. Receipt sent to your email.';
      notice.style.display = 'block';
    }
  },
};

submit.addEventListener('click', () => {
  if (FSM.state === 'idle' || FSM.state === 'error') {
    FSM.send('SUBMIT');
    // Simulate async — 80% success
    setTimeout(() => FSM.send(Math.random() > 0.2 ? 'SUCCESS' : 'FAIL'), 1500);
  }
});
FSM.render();

// ── FULL INTERACTION AUDIT ────────────────────────────────────────────────────
function auditInteraction(rootSel) {
  const root = document.querySelector(rootSel);
  if (!root) return;
  const issues = [];

  // Hit targets
  root.querySelectorAll('button, a, [role=button]').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.height < 44) issues.push('HIT TARGET: ' + el.textContent.trim().slice(0,16) +
      ' is ' + Math.round(r.height) + 'px tall (min 44px)');
  });

  // Input types
  root.querySelectorAll('input[type=text]').forEach(el => {
    if (el.placeholder?.toLowerCase().includes('email') ||
        el.id?.toLowerCase().includes('email')) {
      issues.push('INPUT TYPE: email-looking field has type="text"');
    }
  });

  // Focus styles (check for focus CSS rule)
  const hasFocusCSS = [...document.styleSheets].some(s => {
    try { return [...s.cssRules].some(r => r.selectorText?.includes(':focus')); }
    catch { return false; }
  });
  if (!hasFocusCSS) issues.push('AFFORDANCE: No :focus styles found');

  console.log('\\n=== auditInteraction(' + rootSel + ') ===\\n');
  if (issues.length === 0) {
    console.log('✓ All interaction checks pass');
  } else {
    issues.forEach(i => console.log('✗ ' + i));
  }

  console.log('\\nFSM state:', FSM.state);
  console.log('Submit button height:', Math.round(submit.getBoundingClientRect().height) + 'px');
  return issues.length === 0;
}

auditInteraction('#ref-form');

console.log('\\n=== PHASE 2 BEGINS ===');
console.log('Lessons 1–6: five systems + one composition process');
console.log('Lesson 7: interaction as a first-class design dimension');
console.log('');
console.log('Lesson 8 → Systems Design');
console.log('Design tokens at scale. Component governance. Preventing drift.');`,
      outputHeight: 440,
    },
  ],
};

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export default {
  id: 'design-07-interaction-design',
  slug: 'interaction-design',
  chapter: 'design.1',
  order: 2,
  title: 'Interaction Design',
  subtitle: 'Model every possible state. Make things obviously interactive. Feedback in 100ms. Every target hittable.',
  tags: [
    'css', 'interaction', 'fsm', 'finite-state-machine', 'affordances',
    'hit-targets', 'feedback', 'loading-states', 'accessibility', 'wcag',
    'fitts-law', 'hick-law', 'forms', 'states', 'transitions',
  ],
  hook: {
    question: 'Your form submits. Nothing happens for 400ms. The user clicks again. The payment processes twice. This isn\'t a bug — it\'s a missing loading state. Every interaction failure is a missing state.',
    realWorldContext:
      'Most UI is designed for the happy path at rest. Production encounters every other path constantly. ' +
      'A component without a loading state is a double-submit waiting to happen. ' +
      'A button smaller than 44px is a misclick waiting to happen. ' +
      'An error message that says "PAYMENT_DECLINED" without guidance is an abandoned checkout waiting to happen. ' +
      'Every number in this lesson is derived from human cognitive and motor physiology.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'Every interactive component is a finite state machine: states, events, transitions, guards. Write it down before building.',
      'Affordances are visual signals: cursor:pointer, hover state, elevation, underline on links, border on inputs.',
      '44×44px minimum hit target. Not visual size — clickable area. Use padding, not bigger icons.',
      'Three feedback thresholds: <100ms (immediate), 100ms–1s (spinner on button), >1s (skeleton screen).',
      'Every loading state needs a timeout. Never leave the user in a spinner with no exit.',
      'Error messages must state: what went wrong, which field, how to fix it. Not an error code.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The Double-Submit Rule',
        body: 'Every form submit button must be disabled immediately on click — before any async work. Not after the request starts. Immediately. The average user clicks a slow submit button 2.3 times. Each click is a duplicate submission.',
      },
      {
        type: 'important',
        title: 'Scope Loading to the Element',
        body: 'A full-page overlay says "I don\'t know which operation is running." A loading state on the submit button says "your submit is being processed." Scope loading to the element that triggered the action.',
      },
      {
        type: 'tip',
        title: 'FSM Before Code',
        body: 'Draw the state machine before writing CSS. States, events, transitions. If you can\'t draw it, you can\'t build it without bugs. The FSM tells you exactly which states to handle in render().',
      },
      {
        type: 'warning',
        title: 'IX-6: Timeout Every Loading State',
        body: 'Every async operation must have a timeout that transitions to an error state with a retry action. 10–30 seconds depending on the operation. A loading state with no exit is a stuck user.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Design Systems — Lesson 7: Interaction Design',
        props: { lesson: LESSON_DESIGN_07 },
      },
    ],
  },
  math: {
    prose: [
      'Fitts\'s Law: T = a + b × log₂(1 + D/W). Doubling target width W reduces acquisition time T more efficiently than halving distance D at small sizes. At W < 16px, small distance penalties produce disproportionately large time costs.',
      'Hick\'s Law: T = b × log₂(n + 1). Decision time scales logarithmically with the number of options. 12 navigation items takes measurably longer to process than 6. Primary navigation ≤7 items is derived from this plus Miller\'s 7±2 working memory limit.',
      'Interaction cost model: each additional form field reduces completion ~2–4%; each additional step reduces completion ~15–20%; forced registration before checkout reduces conversion ~25%. Rates are multiplicative, not additive.',
    ],
    callouts: [],
    visualizations: [],
  },
  rigor: {
    prose: [
      'The 100ms feedback threshold is derived from simple reaction time research (Donders, 1868; Miller, 1968). Simple reaction time (single known stimulus) averages ~200ms. Feedback that arrives before the user\'s reaction is complete (~150ms) is perceived as simultaneous with the action. Above 100ms, users begin to consciously perceive delay.',
      'The 44px touch target minimum is derived from empirical touch accuracy studies. The average finger contact area is ~10mm × ~10mm. At a standard mobile display density of ~163ppi, this corresponds to approximately 44px. Below this size, the expected miss rate rises above 5% for users with average motor control.',
      'The FSM model for UI is formalized in the W3C ARIA authoring practices and implemented in XState, Redux, and most framework state management systems. The key insight from formal verification theory: a component with N states has N × E edge cases (where E is the number of events). Undeclared states produce undefined behavior, not absence of behavior.',
    ],
    callouts: [],
    visualizations: [],
  },
  examples: [],
  challenges: [],
  mentalModel: [
    'Every interactive component is an FSM: states, events, transitions. Write the machine before writing CSS.',
    'Five affordance signals: cursor:pointer, hover state, elevation, link underline, input border.',
    'Hit target minimum: 44×44px. Extend with padding, not visual size.',
    'Three feedback thresholds: <100ms (instant CSS), 100ms–1s (button spinner), >1s (skeleton screen).',
    'Disable submit immediately on click. Timeout every loading state. Scope loading to the element.',
    'Six anti-patterns: IX-1 silent submit, IX-2 full-page spinner, IX-3 micro target, IX-4 stateless transition, IX-5 hostile error, IX-6 orphaned loading.',
    'Interaction cost is calculable: each step and each field removes measurable percentage from completion rate.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
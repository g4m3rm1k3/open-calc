// LESSON_DESIGN_08.js
// Lesson 8 — Systems Design
// The problem: a component library that one person built is a collection of components.
// A component library that ten people maintain is a design system — or it becomes
// a collection of inconsistencies. Entropy is the default. Without governance,
// token naming conventions, and documentation standards, a "system" drifts into
// incoherence within 6 months of the first external contribution.
// Concepts: token governance, naming conventions, the drift problem,
//           component documentation, composition requirements, Conway's Law.

const LESSON_DESIGN_08 = {
  title: 'Systems Design',
  subtitle: 'Ten engineers, one consistent interface. Token governance, naming conventions, and the practices that prevent drift.',
  sequential: true,
  cells: [

    // ─── PART 0: RECAP ────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Recap: Seven Lessons, Seven Systems

| Lesson | System | Core tool |
|---|---|---|
| 1 | Visual Hierarchy | Four levels, four levers |
| 2 | Spacing | 8 tokens, 4px base, 5 roles |
| 3 | Typography | Modular scale, LH function, 65ch |
| 4 | Layout | Flex + Grid as constraints |
| 5 | Colour | Three token layers, one swap |
| 6 | Composition | Four layers, eight states, three variants |
| 7 | Interaction | FSM, affordances, 44px targets, 100ms feedback |

Each lesson assumed you were building alone, or that everyone building with you already knew the rules.

That assumption doesn't hold at scale.

---

## The Question This Lesson Answers

> You've built a complete design system — 40 components, 120 tokens, 6 months of work. A new engineer joins the team. Three months later, the button has four slightly different styles across the codebase. The blue is three different hex values. A new component was added that bypasses the token system entirely.

> What happened? And how do you prevent it?

What happened is **design drift** — the natural entropy of any system that doesn't have explicit governance. The new engineer wasn't careless. They built what they needed, the way they knew how. The system had no mechanism to prevent the inconsistency, and no documentation to guide the correct approach.

Systems design is the practice of building those mechanisms. By the end of this lesson you have a complete governance model: naming conventions that scale, documentation standards that get used, and audit tools that detect drift before it ships.`,
    },

    // ─── PART 1: THE BROKEN BASELINE ─────────────────────────────────────────
    {
      type: 'js',
      instruction: `## The Problem: Six Months of Drift

This dashboard represents a design system after six months of organic growth. It was coherent at the start. Each new engineer added components that "roughly matched" the existing style.

Run the drift audit. It counts:
- The number of distinct blue values (should be 1 at the semantic level)
- The number of distinct button implementations
- Token names that violate naming conventions
- Components that hardcode values instead of referencing tokens

The output shows not how bad it looks — it looks fine — but how fragile it is. One brand update would require hunting through dozens of files.`,
      html: `<div class="drifted-app" id="drifted-app">
  <nav class="dr-nav">
    <span class="dr-logo">Acme</span>
    <!-- Button style 1: original design system -->
    <button class="dr-btn-v1">New Report</button>
  </nav>
  <div class="dr-body">
    <div class="dr-card">
      <div class="dr-card-h">Revenue</div>
      <div class="dr-card-v">$48,290</div>
      <!-- Button style 2: added by engineer B, slightly different -->
      <button class="dr-btn-v2">View details</button>
    </div>
    <div class="dr-card">
      <div class="dr-card-h">Users</div>
      <div class="dr-card-v">3,841</div>
      <button class="dr-btn-v2">View details</button>
    </div>
    <div class="dr-alert">
      <span class="dr-alert-icon">!</span>
      <!-- Button style 3: added by engineer C, "quick fix" -->
      <span class="dr-alert-text">Trial ends in 3 days.</span>
      <a class="dr-alert-link" href="#">Upgrade now</a>
    </div>
  </div>
  <footer class="dr-footer">
    <!-- Button style 4: the footer engineer used inline styles "just this once" -->
    <button style="padding:8px 14px;background:#2463eb;color:white;border:none;
      border-radius:6px;font-size:13px;cursor:pointer">Export data</button>
    <span class="dr-footer-text">Last updated 4 min ago</span>
  </footer>
</div>`,
      css: `body { margin:0; font-family:system-ui,sans-serif; background:#0f172a; }
/* DRIFTED — four button styles, three blues, no token system */

/* Original system tokens (correct) */
:root {
  --dr-blue:   #2563eb;   /* original */
  --dr-surface:#1e293b;
  --dr-border: #334155;
  --dr-text:   #f1f5f9;
  --dr-muted:  #64748b;
}

.dr-nav  { display:flex; align-items:center; padding:0 24px; height:48px;
  background:var(--dr-surface); border-bottom:1px solid var(--dr-border);
  gap:12px; }
.dr-logo { font-size:15px; font-weight:700; color:var(--dr-text); flex:1; }

/* Style 1: original — uses token */
.dr-btn-v1 { padding:7px 14px; background:var(--dr-blue); color:white; border:none;
  border-radius:7px; font-size:13px; font-weight:600; cursor:pointer; }

.dr-body { display:grid; grid-template-columns:1fr 1fr; gap:16px; padding:20px; }
.dr-card { background:var(--dr-surface); border:1px solid var(--dr-border);
  border-radius:10px; padding:16px; display:flex; flex-direction:column; gap:8px; }
.dr-card-h { font-size:11px; font-weight:600; color:var(--dr-muted);
  text-transform:uppercase; letter-spacing:.1em; }
.dr-card-v { font-size:26px; font-weight:700; color:var(--dr-text); }

/* Style 2: engineer B — slightly different blue, slightly different radius */
.dr-btn-v2 { padding:6px 12px; background:#2563ec; /* DRIFT: one digit off */
  color:white; border:none; border-radius:6px; /* DRIFT: 6 not 7 */
  font-size:12px; font-weight:500; cursor:pointer; }

.dr-alert { grid-column:1/-1; display:flex; align-items:center; gap:10px;
  padding:11px 14px; background:#1e3a5f; border-radius:8px;
  border:1px solid #1d4ed8; /* DRIFT: hardcoded hex, not a token */ }
.dr-alert-icon { width:20px; height:20px; border-radius:50%;
  background:#1d4ed8; /* DRIFT: third blue value */
  color:white; font-size:11px; font-weight:700;
  display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.dr-alert-text { font-size:13px; color:#93c5fd; flex:1; }
.dr-alert-link { font-size:13px; font-weight:600; color:#3b82f6; /* DRIFT: fourth blue */
  text-decoration:none; flex-shrink:0; }

.dr-footer { display:flex; align-items:center; padding:12px 24px; gap:12px;
  border-top:1px solid var(--dr-border); }
/* Inline style on export button — see HTML above */
.dr-footer-text { font-size:12px; color:var(--dr-muted); margin-left:auto; }`,
      startCode: `// Drift audit — detect system violations

function auditDrift(rootSel) {
  const root = document.querySelector(rootSel);
  if (!root) return;

  const blues      = new Set();
  const btnStyles  = new Map();
  const hardcoded  = [];
  const EXPECTED_BLUE = 'rgb(37, 99, 235)'; // --dr-blue: #2563eb resolved

  root.querySelectorAll('*').forEach(el => {
    const s   = window.getComputedStyle(el);
    const cls = el.className?.toString().trim().split(' ')[0] || el.tagName;

    // Track all blue-ish colours
    ['backgroundColor','borderColor','color'].forEach(prop => {
      const v = s[prop];
      if (!v) return;
      const m = v.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
      if (!m) return;
      const [,r,g,b] = m.map(Number);
      // Detect "blue-family" colours (high blue, lower red+green)
      if (b > 150 && b > r * 1.5 && b > g * 1.2) {
        blues.add(v + ' on .' + cls);
      }
    });

    // Track button implementations
    if (el.tagName === 'BUTTON' || (el.tagName === 'A' && s.cursor === 'pointer')) {
      const key = s.backgroundColor + '|' + s.borderRadius + '|' + s.fontSize;
      if (!btnStyles.has(key)) btnStyles.set(key, []);
      btnStyles.get(key).push('.' + cls);
    }

    // Hardcoded colours on interactive elements
    if (el.style.background || el.style.backgroundColor || el.style.color) {
      hardcoded.push(cls + ': ' + (el.style.background || el.style.backgroundColor || el.style.color));
    }
  });

  console.log('=== DRIFT AUDIT: ' + rootSel + ' ===\\n');

  console.log('Blue-family colours (' + blues.size + ' variants — should be 1):');
  [...blues].forEach(b => console.log('  ' + b));

  console.log('\\nButton implementations (' + btnStyles.size + ' variants — should be 1–2):');
  [...btnStyles.entries()].forEach(([style, els]) => {
    const [bg, radius, fs] = style.split('|');
    console.log('  bg=' + bg.slice(0,24) + ' r=' + radius + ' fs=' + fs);
    console.log('  used by: ' + els.join(', '));
  });

  console.log('\\nHardcoded inline styles (' + hardcoded.length + ' — should be 0):');
  hardcoded.forEach(h => console.log('  ' + h));

  const score = blues.size + btnStyles.size + hardcoded.length;
  console.log('\\nDrift score: ' + score + ' (0 = coherent system, >5 = needs refactor)');
  return score;
}

auditDrift('.drifted-app');`,
      outputHeight: 360,
    },

    // ─── PART 2: WHAT CAUSES DRIFT ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The Entropy Problem

Design systems don't drift because engineers are careless. They drift because **the system doesn't make the right thing easy and the wrong thing hard**.

### The Three Causes of Drift

**1. Token naming that doesn't encode intent**

\`--blue-500\` tells you the colour. It doesn't tell you where to use it. An engineer adding a new alert component doesn't know whether to use \`--blue-500\` or \`--blue-600\` for the background — so they pick one. Or they reach for a hardcoded hex because they can't find the right token fast enough.

Compare: \`--color-interactive\` tells you exactly what it's for. An engineer building an interactive element reaches for it immediately.

**2. No canonical source of truth for component structure**

Without documentation that shows the correct structure of a button — its class names, its variants, its tokens — a new engineer builds a new button. They might get close, but the border-radius is 6px not 7px, the padding is 6px not 7px, and the font-weight is 500 not 600. Three small differences that compound across 40 components.

**3. No automated enforcement**

Rules that live only in a style guide document are optional. Engineers under deadline pressure skip documentation. The only rules that are reliably followed are rules that are automatically checked — either at build time (ESLint, Stylelint) or in CI (visual regression tests, token audit scripts).

### The Compounding Effect

Drift compounds because each inconsistency makes the next one more likely. If two button styles exist in the codebase, an engineer building a third button sees two "correct" examples and picks whichever looks closer to what they need. The system now has three styles.

After 12 months of unmanaged drift, a codebase typically has:
- 6–15 distinct button-like interactive styles
- 4–8 shades of each brand colour
- 20–40% of components bypassing the token system
- 3–5 different spacing scales
- Inconsistent focus behaviour across components

None of this was intentional. It's entropy.

### The Governance Solution

Governance turns implicit rules (the style guide) into enforced constraints:

\`\`\`
Implicit: "Use the --color-interactive token for buttons"
Enforced: Stylelint rule that flags hardcoded brand hex values

Implicit: "Buttons should use the .btn class"
Enforced: ESLint rule that flags inline button styles

Implicit: "All spacing should be from the token scale"
Enforced: auditSpacing() in CI that fails on off-grid values
\`\`\`

The goal isn't rigidity — it's reducing the decision surface. A governed system has fewer decisions to make, which means faster development and fewer inconsistencies.`,
    },

    // ─── PART 3: TOKEN NAMING — FOUR PATTERNS ─────────────────────────────────
    {
      type: 'js',
      instruction: `## Token Naming: The Four Patterns and Their Failure Modes

Token naming is the single highest-leverage decision in a design system. The wrong naming pattern makes the system impossible to maintain at scale.

**The four naming patterns, from worst to best:**

**Pattern 1: Value names** — \`--blue-500\`, \`--16px\`, \`--bold\`
Describes what the token IS. Changes meaning when the design changes. Impossible to rename when brand colour changes from blue to teal.

**Pattern 2: Component names** — \`--btn-bg\`, \`--card-border\`, \`--nav-height\`
Couples tokens to specific components. Can't be reused across components. Proliferates tokens (each new component gets its own set).

**Pattern 3: Global semantic names** — \`--color-interactive\`, \`--space-4\`, \`--text-primary\`
Describes what the token DOES. Survives brand changes. Reusable across all components. **This is the correct pattern for Layer 2 (semantic) tokens.**

**Pattern 4: Tier + category + property + modifier** — \`--color-interactive-default\`, \`--color-interactive-hover\`, \`--space-inset-md\`
The full systematic naming pattern used by Salesforce Lightning, Adobe Spectrum, and Atlassian Design System. Adds explicitness at the cost of verbosity. Best for large teams (20+ engineers) where ambiguity is expensive.

The cell below shows all four patterns applied to the same set of values. Notice which ones would survive a rebrand, which would survive a component refactor, and which produce the fewest tokens for the most coverage.`,
      html: `<div id="naming-demo">
  <div class="nd-section" id="nd-section-1">
    <div class="nd-label">Pattern 1: Value names (bad)</div>
    <div class="nd-tokens" id="nd-p1"></div>
    <div class="nd-verdict fail">✗ Brand rebrand breaks everything</div>
  </div>
  <div class="nd-section" id="nd-section-2">
    <div class="nd-label">Pattern 2: Component names (bad)</div>
    <div class="nd-tokens" id="nd-p2"></div>
    <div class="nd-verdict fail">✗ New component needs new token set</div>
  </div>
  <div class="nd-section" id="nd-section-3">
    <div class="nd-label">Pattern 3: Global semantic (correct)</div>
    <div class="nd-tokens" id="nd-p3"></div>
    <div class="nd-verdict pass">✓ Survives rebrand. Reusable across all components</div>
  </div>
  <div class="nd-section" id="nd-section-4">
    <div class="nd-label">Pattern 4: Tier + category + property (enterprise)</div>
    <div class="nd-tokens" id="nd-p4"></div>
    <div class="nd-verdict pass">✓ Maximum explicitness. Best for large teams</div>
  </div>
</div>`,
      css: `body { background:#0f172a; padding:20px; margin:0; font-family:system-ui,sans-serif; }
#naming-demo { max-width:600px; display:flex; flex-direction:column; gap:16px; }
.nd-section { background:#1e293b; border:1px solid #334155; border-radius:8px; padding:14px 16px; }
.nd-label   { font-size:10px; font-weight:700; color:var(--color-text-secondary, #475569);
  letter-spacing:.12em; text-transform:uppercase; margin-bottom:10px; }
.nd-tokens  { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px; }
.nd-token   { font-size:11px; font-family:monospace; padding:3px 8px;
  background:#0f172a; border:1px solid #334155; border-radius:4px; }
.nd-token .val { color:var(--color-text-secondary, #475569); font-weight:400; }
.nd-verdict { font-size:11px; font-weight:500; }
.nd-verdict.pass { color:#4ade80; }
.nd-verdict.fail { color:#f87171; }`,
      startCode: `// Show the four naming patterns for the same set of values

const VALUES = [
  { desc:'Action colour',      value:'hsl(217,76%,47%)' },
  { desc:'Action colour hover',value:'hsl(217,76%,42%)' },
  { desc:'Page background',    value:'hsl(222,47%,7%)'  },
  { desc:'Card surface',       value:'hsl(222,39%,12%)' },
  { desc:'Primary text',       value:'hsl(210,40%,96%)' },
  { desc:'Secondary text',     value:'hsl(215,25%,65%)' },
  { desc:'Component spacing',  value:'16px'             },
  { desc:'Section spacing',    value:'24px'             },
];

const PATTERNS = {
  p1: ['--blue-600','--blue-700','--slate-950','--slate-900',
       '--slate-50','--slate-300','--16px','--24px'],
  p2: ['--btn-background','--btn-background-hover','--page-background','--card-background',
       '--heading-color','--body-color','--card-padding','--section-margin'],
  p3: ['--color-interactive','--color-interactive-hover','--color-bg','--color-surface',
       '--color-text-primary','--color-text-secondary','--space-4','--space-5'],
  p4: ['--color-action-default','--color-action-hover','--color-background-page',
       '--color-background-surface','--color-text-heading','--color-text-body',
       '--space-inset-md','--space-stack-lg'],
};

function renderPattern(containerId, keys) {
  const el = document.getElementById(containerId);
  keys.forEach((key, i) => {
    const t = document.createElement('div');
    t.className = 'nd-token';
    t.innerHTML = key + ' <span class="val">= ' + VALUES[i].value + '</span>';
    el.appendChild(t);
  });
}

renderPattern('nd-p1', PATTERNS.p1);
renderPattern('nd-p2', PATTERNS.p2);
renderPattern('nd-p3', PATTERNS.p3);
renderPattern('nd-p4', PATTERNS.p4);

// Analysis
console.log('=== NAMING PATTERN ANALYSIS ===\\n');

console.log('Pattern 1 (value names): 8 tokens');
console.log('  Rebrand from blue to teal: --blue-600 must become --teal-600 everywhere');
console.log('  Result: breaking change across entire codebase\\n');

console.log('Pattern 2 (component names): 8 tokens');
console.log('  Add a new interactive element (dropdown): need --dropdown-background, etc.');
console.log('  Result: token proliferation — N tokens per component\\n');

console.log('Pattern 3 (global semantic): 8 tokens');
console.log('  Rebrand from blue to teal: change --color-interactive value in one place');
console.log('  New dropdown: uses --color-interactive — already exists');
console.log('  Result: zero breaking changes, zero new tokens\\n');

console.log('Pattern 4 (tier+category+property): 8 tokens');
console.log('  More verbose, but explicit about tier (color), category (action), modifier (default)');
console.log('  Preferred for systems with 200+ tokens where ambiguity is expensive');
console.log('  Example: Adobe Spectrum, Salesforce Lightning Design System');`,
      outputHeight: 480,
    },

    // ─── PART 4: THE TOKEN LIFECYCLE ──────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The Token Lifecycle: Create, Deprecate, Delete

Tokens are not permanent. A design system evolves — spacing scales change, brand colours update, component patterns are replaced. Tokens that were correct at version 1.0 may be wrong at version 2.0. Managing this lifecycle correctly is what separates a maintained system from a legacy system.

### The Three-Phase Lifecycle

**Phase 1: Creation**
A new token is created when:
- A new semantic role appears that no existing token covers
- A component needs a value that's unique to its context (component-level token)
- A primitive value is added to support a new design decision

Rule: never create a token for a value already covered by an existing token. Duplicate tokens with different names are the source of future inconsistency.

**Phase 2: Deprecation**
A token is deprecated (not deleted) when:
- It has been renamed
- Its semantic meaning has changed
- It has been superseded by a more specific or more general token

Deprecated tokens continue to work but emit a console warning in development environments:
\`\`\`javascript
// In your token audit script:
if (DEPRECATED_TOKENS.has(tokenName)) {
  console.warn('[DesignSystem] Token ' + tokenName + ' is deprecated. Use ' +
    DEPRECATED_TOKENS.get(tokenName) + ' instead.');
}
\`\`\`

**Phase 3: Deletion**
A token is deleted only after:
- It has been deprecated for at least one major version
- All usages in the codebase have been migrated
- A codemod has been provided to help external consumers migrate

Deleting a token without deprecation first is a breaking change that damages trust in the system.

### The Versioning Rule

Token changes are categorised the same way as API changes:
- **Patch:** a token's value changes but not its meaning (colour tweak, spacing micro-adjustment)
- **Minor:** a new token is added (no existing code breaks)
- **Major:** a token is renamed or deleted (breaking change, requires consumer migration)

This is why large design systems (Material Design, Tailwind, Radix) version their token sets independently from their component library. A token rename is a major version bump for the token layer.

### The Audit Script Pattern

The most reliable governance tool is a token audit that runs in CI:

\`\`\`javascript
// audit-tokens.js — runs in CI before every merge
const VALID_TOKENS = new Set([...layer1Tokens, ...layer2Tokens]);

css.rules.forEach(rule => {
  rule.declarations?.forEach(decl => {
    if (decl.value.includes('var(--')) {
      const token = decl.value.match(/var\\(([^)]+)\\)/)?.[1];
      if (token && !VALID_TOKENS.has(token)) {
        throw new Error('Unknown token: ' + token + ' in ' + rule.selector);
      }
    }
  });
});
\`\`\`

If it references an unknown token, the build fails. This makes token drift a build error, not a code review comment.`,
    },

    // ─── PART 5: PRACTICE 1 — BUILD A TOKEN NAMING SYSTEM ────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 1: Build a Token Naming System That Survives a Rebrand

You're given a set of raw design values. Your task is to:

1. Create a Layer 1 primitive token set (value names — these CAN be colour-specific)
2. Create a Layer 2 semantic token set (semantic names — these MUST NOT reference colours)
3. Wire Layer 2 to reference Layer 1 via \`var()\`
4. Demonstrate that a rebrand (switching from blue to teal) requires changing only Layer 1

**The test for a correct naming system:**
- Layer 2 token names contain no colour words (no "blue", "red", "green", "slate")
- Layer 1 primitives are the only place raw values appear
- Switching the primitive changes everything downstream
- The naming follows Pattern 3 (global semantic)

The test switches the brand from blue to teal by changing ONE Layer 1 value and verifies that all Layer 2 interactive tokens update automatically.`,
      html: `<div id="p1-demo">
  <div class="p1-section">
    <div class="p1-section-label">TOKEN SYSTEM</div>
    <div id="p1-token-list"></div>
  </div>
  <div class="p1-ui" id="p1-ui">
    <nav class="p1-nav">
      <span class="p1-logo">Brand</span>
      <button class="p1-cta" id="p1-cta">Get started</button>
    </nav>
    <div class="p1-body">
      <div class="p1-card">
        <div class="p1-card-label">Monthly revenue</div>
        <div class="p1-card-value">$48,290</div>
        <div class="p1-badge" id="p1-badge">↑ 12% this month</div>
      </div>
      <div class="p1-card">
        <div class="p1-card-label">Active users</div>
        <div class="p1-card-value">3,841</div>
        <div class="p1-badge">↑ 8%</div>
      </div>
    </div>
  </div>
  <div class="p1-rebrand-test" id="p1-rebrand-test">
    <button id="p1-brand-blue" class="p1-rb-btn active">Brand: Blue</button>
    <button id="p1-brand-teal" class="p1-rb-btn">Brand: Teal</button>
    <button id="p1-brand-purple" class="p1-rb-btn">Brand: Purple</button>
  </div>
</div>`,
      css: `body { background:#0f172a; padding:20px; margin:0; font-family:system-ui,sans-serif; }
#p1-demo { max-width:520px; display:flex; flex-direction:column; gap:14px; }
.p1-section { background:#1e293b; border:1px solid #334155; border-radius:8px;
  padding:12px 14px; }
.p1-section-label { font-size:9px; font-weight:700; color:var(--color-text-secondary, #475569);
  letter-spacing:.14em; text-transform:uppercase; margin-bottom:8px; }
#p1-token-list { font-family:monospace; font-size:11px; color:var(--color-text-secondary, #475569);
  line-height:1.9; }
/* The UI uses ONLY semantic tokens — no hardcoded values */
.p1-nav  { display:flex; align-items:center; padding:0 16px; height:44px;
  background:var(--s-surface); border-bottom:1px solid var(--s-border); gap:8px; }
.p1-logo { font-size:14px; font-weight:700; color:var(--s-text-1); flex:1; }
.p1-cta  { padding:6px 14px; background:var(--s-interactive); color:var(--s-on-interactive);
  border:none; border-radius:7px; font-size:13px; font-weight:600; cursor:pointer; }
.p1-body { display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:12px; }
.p1-card { background:var(--s-surface); border:1px solid var(--s-border);
  border-radius:8px; padding:14px; }
.p1-card-label { font-size:10px; font-weight:600; color:var(--s-text-3);
  text-transform:uppercase; letter-spacing:.1em; margin-bottom:4px; }
.p1-card-value { font-size:24px; font-weight:700; color:var(--s-text-1); margin-bottom:4px; }
.p1-badge { font-size:11px; font-weight:600;
  background:var(--s-interactive-subtle); color:var(--s-interactive);
  border:1px solid var(--s-interactive-border);
  padding:2px 8px; border-radius:100px; display:inline-block; }
.p1-rebrand-test { display:flex; gap:6px; }
.p1-rb-btn { font-size:11px; font-weight:500; padding:5px 12px; border-radius:6px;
  border:1px solid #334155; background:#1e293b; color:var(--color-text-secondary, #475569); cursor:pointer; }
.p1-rb-btn.active { background:var(--s-interactive); color:white;
  border-color:var(--s-interactive); }`,
      startCode: `const root = document.documentElement;

// ── STEP 1: DEFINE LAYER 1 — PRIMITIVE TOKENS ─────────────────────────────────
// Naming: --p-[colour]-[shade] or --p-[neutral]-[shade]
// These CAN reference colour names (they're the only place colour names appear)

const BRANDS = {
  blue:   { hue: 217, sat: 76 },
  teal:   { hue: 183, sat: 70 },
  purple: { hue: 270, sat: 65 },
};

function applyBrand(brandName) {
  const brand = BRANDS[brandName];
  const h = brand.hue, s = brand.sat;

  // Layer 1 primitives — only place raw values live
  // YOUR NAMING: use --p-brand-[shade] pattern
  root.style.setProperty('--p-brand-400', \`hsl(\${h},\${s}%,60%)\`);
  root.style.setProperty('--p-brand-500', \`hsl(\${h},\${s}%,47%)\`);
  root.style.setProperty('--p-brand-600', \`hsl(\${h},\${s}%,38%)\`);
  root.style.setProperty('--p-brand-subtle', \`hsl(\${h},80%,14%)\`);
  root.style.setProperty('--p-brand-border', \`hsl(\${h},70%,22%)\`);

  // Fixed neutral primitives (don't change with brand)
  root.style.setProperty('--p-neutral-950', 'hsl(222,47%,7%)');
  root.style.setProperty('--p-neutral-900', 'hsl(222,39%,12%)');
  root.style.setProperty('--p-neutral-800', 'hsl(222,35%,17%)');
  root.style.setProperty('--p-neutral-700', 'hsl(217,32%,22%)');
  root.style.setProperty('--p-neutral-200', 'hsl(210,40%,96%)');
  root.style.setProperty('--p-neutral-400', 'hsl(215,25%,65%)');
  root.style.setProperty('--p-neutral-500', 'hsl(217,20%,45%)');

  // ── STEP 2: DEFINE LAYER 2 — SEMANTIC TOKENS ────────────────────────────────
  // Naming: --s-[role] (no colour names allowed in the name)
  // These MUST reference Layer 1 via var(--p-*) — never raw values

  // YOUR SEMANTIC TOKEN DEFINITIONS:
  // Interactive tokens — must reference --p-brand-* (not hsl() directly)
  root.style.setProperty('--s-interactive',        'var(--p-brand-???)');  // 500 for dark
  root.style.setProperty('--s-interactive-subtle', 'var(--p-brand-???)');  // subtle
  root.style.setProperty('--s-interactive-border', 'var(--p-brand-???)');  // border
  root.style.setProperty('--s-on-interactive',     '#ffffff');

  // Surface tokens — must reference --p-neutral-*
  root.style.setProperty('--s-bg',      'var(--p-neutral-???)');  // 950 (darkest)
  root.style.setProperty('--s-surface', 'var(--p-neutral-???)');  // 900
  root.style.setProperty('--s-border',  'var(--p-neutral-???)');  // 700

  // Text tokens — must reference --p-neutral-*
  root.style.setProperty('--s-text-1', 'var(--p-neutral-???)');  // 200 (lightest)
  root.style.setProperty('--s-text-2', 'var(--p-neutral-???)');  // 400
  root.style.setProperty('--s-text-3', 'var(--p-neutral-???)');  // 500

  // Update token list display
  const display = document.getElementById('p1-token-list');
  const tokens = [
    ['--p-brand-500  (L1 primitive)', \`hsl(\${h},\${s}%,47%)\`],
    ['--s-interactive (L2 semantic)', 'var(--p-brand-500)'],
    ['--s-surface     (L2 semantic)', 'var(--p-neutral-900)'],
    ['--s-text-1      (L2 semantic)', 'var(--p-neutral-200)'],
  ];
  display.innerHTML = tokens.map(([k,v]) =>
    \`<div>\${k}: <span style="color:#f1f5f9">\${v}</span></div>\`
  ).join('');

  // Update active button
  ['blue','teal','purple'].forEach(b => {
    document.getElementById('p1-brand-' + b).className =
      'p1-rb-btn' + (b === brandName ? ' active' : '');
  });
}

// Wire up buttons
['blue','teal','purple'].forEach(b =>
  document.getElementById('p1-brand-' + b).onclick = () => applyBrand(b));

applyBrand('blue');

// ── AUDIT ─────────────────────────────────────────────────────────────────────
setTimeout(() => {
  applyBrand('blue');
  const blueInteractive = getComputedStyle(document.documentElement)
    .getPropertyValue('--s-interactive').trim();

  applyBrand('teal');
  const tealInteractive = getComputedStyle(document.documentElement)
    .getPropertyValue('--s-interactive').trim();

  const checks = {
    's-interactive references p-brand': blueInteractive.includes('var(--p-brand'),
    'rebrand changes interactive colour': blueInteractive !== tealInteractive,
    'no colour names in semantic tokens': !/--(s-(?:.*blue|.*teal|.*red|.*green))/i.test(
      [...document.styleSheets].map(s => {
        try { return [...s.cssRules].map(r => r.cssText).join(' '); } catch { return ''; }
      }).join(' ')
    ),
  };

  console.log('=== TOKEN NAMING AUDIT ===');
  Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗') + ' ' + k));
  applyBrand('blue');
}, 300);`,
      solutionCode: `const root = document.documentElement;
const BRANDS = {
  blue:   { hue: 217, sat: 76 },
  teal:   { hue: 183, sat: 70 },
  purple: { hue: 270, sat: 65 },
};
function applyBrand(b) {
  const { hue: h, sat: s } = BRANDS[b];
  root.style.setProperty('--p-brand-400',    \`hsl(\${h},\${s}%,60%)\`);
  root.style.setProperty('--p-brand-500',    \`hsl(\${h},\${s}%,47%)\`);
  root.style.setProperty('--p-brand-600',    \`hsl(\${h},\${s}%,38%)\`);
  root.style.setProperty('--p-brand-subtle', \`hsl(\${h},80%,14%)\`);
  root.style.setProperty('--p-brand-border', \`hsl(\${h},70%,22%)\`);
  root.style.setProperty('--p-neutral-950',  'hsl(222,47%,7%)');
  root.style.setProperty('--p-neutral-900',  'hsl(222,39%,12%)');
  root.style.setProperty('--p-neutral-800',  'hsl(222,35%,17%)');
  root.style.setProperty('--p-neutral-700',  'hsl(217,32%,22%)');
  root.style.setProperty('--p-neutral-200',  'hsl(210,40%,96%)');
  root.style.setProperty('--p-neutral-400',  'hsl(215,25%,65%)');
  root.style.setProperty('--p-neutral-500',  'hsl(217,20%,45%)');
  root.style.setProperty('--s-interactive',        'var(--p-brand-500)');
  root.style.setProperty('--s-interactive-subtle', 'var(--p-brand-subtle)');
  root.style.setProperty('--s-interactive-border', 'var(--p-brand-border)');
  root.style.setProperty('--s-on-interactive',     '#ffffff');
  root.style.setProperty('--s-bg',      'var(--p-neutral-950)');
  root.style.setProperty('--s-surface', 'var(--p-neutral-900)');
  root.style.setProperty('--s-border',  'var(--p-neutral-700)');
  root.style.setProperty('--s-text-1',  'var(--p-neutral-200)');
  root.style.setProperty('--s-text-2',  'var(--p-neutral-400)');
  root.style.setProperty('--s-text-3',  'var(--p-neutral-500)');
  const display = document.getElementById('p1-token-list');
  display.innerHTML = [
    ['--p-brand-500  (L1)', \`hsl(\${h},\${s}%,47%)\`],
    ['--s-interactive (L2)', 'var(--p-brand-500)'],
    ['--s-surface     (L2)', 'var(--p-neutral-900)'],
    ['--s-text-1      (L2)', 'var(--p-neutral-200)'],
  ].map(([k,v]) => \`<div>\${k}: <span style="color:#f1f5f9">\${v}</span></div>\`).join('');
  ['blue','teal','purple'].forEach(x => {
    document.getElementById('p1-brand-'+x).className='p1-rb-btn'+(x===b?' active':'');
  });
}
['blue','teal','purple'].forEach(b => document.getElementById('p1-brand-'+b).onclick=()=>applyBrand(b));
applyBrand('blue');`,
      check: (code) => {
        const usesVarP   = /setProperty.*s-interactive[\s\S]*?var\(--p-brand/i.test(code);
        const noColourInSemantic = !/setProperty.*['"]--(s-(?:blue|teal|purple|red|green))/i.test(code);
        const applysBrand= /applyBrand|BRANDS/i.test(code);
        return usesVarP && applysBrand;
      },
      successMessage: `Token naming system built. The rebrand test proves it: switching from blue to teal requires changing only the --p-brand-* primitive values. The semantic tokens (--s-interactive, --s-bg, etc.) reference the primitives via var() — they update automatically without touching any component. This is the entire value of the three-layer architecture expressed in one test.`,
      failMessage: `The critical requirement: --s-interactive must be set to \`var(--p-brand-500)\` (or similar --p-brand-* reference) — NOT to a raw hsl() value. The audit checks that the semantic token references a primitive via var(). If it contains 'var(--p-brand' it passes. If it contains 'hsl(' directly, it fails the rebrand test.`,
      outputHeight: 440,
    },

    // ─── PART 6: COMPONENT DOCUMENTATION ─────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Component Documentation: What Makes a Component Actually Reusable

A component without documentation is a component only the author can use confidently. Documentation is the interface between the component and everyone who will use it — and that includes you in six months.

### What a Component Document Contains

Every component in the system needs documentation across five dimensions:

**1. The API surface**
What props/attributes does it accept? What are the types, defaults, and valid values?
\`\`\`
Button
  variant:   'primary' | 'secondary' | 'destructive'  (default: 'primary')
  size:      'sm' | 'md' | 'lg'                        (default: 'md')
  disabled:  boolean                                    (default: false)
  loading:   boolean                                    (default: false)
  icon:      ReactNode | null                           (default: null)
  children:  ReactNode                                  (required)
  onClick:   () => void                                 (optional)
\`\`\`

**2. The token map**
Which tokens does this component consume? Every colour, spacing, and type value the component reads — stated explicitly.
\`\`\`
Button tokens consumed:
  --color-interactive     → background (primary variant)
  --color-error           → background (destructive variant)
  --space-2, --space-4   → padding (sm, md sizes)
  --fs-1, --fs-2, --fs-3 → font-size (sm, md, lg sizes)
\`\`\`

**3. The state matrix**
What visual state does the component show in every combination of variant × size × state?

**4. The usage constraints**
What should this component never be used for? What alternatives exist for those cases?
\`\`\`
✓ Use for: form submissions, primary navigation actions, destructive operations
✗ Do not use for: inline text links (use <Link>), navigation tabs (use <Tabs>),
  icon-only actions without label (use <IconButton>)
\`\`\`

**5. The accessibility contract**
What ARIA attributes does the component use? What keyboard interactions does it support? What focus behaviour does it produce?

### Why This Matters for Systems Design

Without a documented usage constraint, an engineer builds a button-as-tab. Without a documented token map, an engineer hardcodes a value they couldn't find in the token list. Without a documented state matrix, an engineer ships a loading state that was never designed.

Documentation doesn't prevent drift — but the absence of documentation guarantees it.`,
    },

    // ─── PART 7: THE COMPOSITION REQUIREMENT ─────────────────────────────────
    {
      type: 'js',
      instruction: `## The Composition Requirement

A component that cannot compose with other components is a dead end. Every component in a design system must pass the composition test: it should be possible to use it inside any other appropriate component without special cases.

**What breaks composition:**

1. **Fixed dimensions** — a component with \`width: 320px\` can only live in a context that's at least 320px wide. A component with no intrinsic width constraint can live anywhere.

2. **Assuming its own context** — a card that reads \`body > .card { ... }\` in its CSS breaks when placed inside a modal. Components must be context-agnostic.

3. **Leaking styles** — a component whose styles affect elements outside it breaks everything it's placed near. All component styles must be scoped to the component's root element.

4. **Hard-coded z-index** — \`z-index: 9999\` on a component breaks every other stacking context it's placed in. Z-index must be managed at the system level, not the component level.

The cell below shows the composition test: the same components rendered in three different contexts — a page, a modal, and a sidebar. Components that pass are context-agnostic. Components that fail need to be refactored.`,
      html: `<div id="comp-test">
  <div class="ct-context" id="ctx-page">
    <div class="ctx-label">In page (wide)</div>
    <div class="ct-slot" id="slot-page"></div>
  </div>
  <div class="ct-context" id="ctx-modal">
    <div class="ctx-label">In modal (medium)</div>
    <div class="ct-slot ct-slot--modal" id="slot-modal"></div>
  </div>
  <div class="ct-context" id="ctx-sidebar">
    <div class="ctx-label">In sidebar (narrow)</div>
    <div class="ct-slot ct-slot--sidebar" id="slot-sidebar"></div>
  </div>
</div>`,
      css: `body { background:#0f172a; padding:20px; margin:0; font-family:system-ui,sans-serif; }
#comp-test { display:flex; gap:16px; flex-wrap:wrap; }
.ct-context { display:flex; flex-direction:column; gap:8px; flex:1; min-width:200px; }
.ctx-label  { font-size:10px; font-weight:700; color:var(--color-text-secondary, #475569);
  letter-spacing:.12em; text-transform:uppercase; }
.ct-slot    { background:#1e293b; border:1px solid #334155; border-radius:8px;
  padding:12px; }
.ct-slot--modal   { max-width:260px; }
.ct-slot--sidebar { max-width:180px; }
/* Composable stat card — uses intrinsic sizing */
.stat-card  { background:#111827; border:1px solid #334155; border-radius:8px;
  padding:12px; display:flex; flex-direction:column; gap:4px;
  /* NO fixed width — fills its container */ }
.stat-label { font-size:10px; font-weight:600; color:var(--color-text-secondary, #475569);
  text-transform:uppercase; letter-spacing:.1em; }
.stat-value { font-size:22px; font-weight:700; color:#f1f5f9; }
.stat-delta { font-size:11px; color:#4ade80; font-weight:500; }
/* Non-composable card — breaks in narrow contexts */
.bad-card   { width:280px;  /* ← BREAKS in sidebar/modal */
  background:#111827; border:1px solid #334155; border-radius:8px; padding:12px; }`,
      startCode: `// Test the same component in three different contexts

function makeStatCard(label, value, delta) {
  const card = document.createElement('div');
  card.className = 'stat-card'; // composable — no fixed width
  card.innerHTML = \`
    <div class="stat-label">\${label}</div>
    <div class="stat-value">\${value}</div>
    <div class="stat-delta">\${delta}</div>
  \`;
  return card;
}

function makeBadCard(label, value, delta) {
  const card = document.createElement('div');
  card.className = 'bad-card'; // non-composable — fixed 280px width
  card.innerHTML = \`
    <div class="stat-label">\${label}</div>
    <div class="stat-value" style="font-size:22px;font-weight:700;color:#f1f5f9">\${value}</div>
    <div style="font-size:11px;color:#4ade80">\${delta}</div>
  \`;
  return card;
}

// Place the GOOD card in all three contexts
['slot-page','slot-modal','slot-sidebar'].forEach(id => {
  document.getElementById(id).appendChild(makeStatCard('Revenue', '$48,290', '↑ 12%'));
});

// Add a bad card to show what breaks
const badSlot = document.createElement('div');
badSlot.style.cssText = 'margin-top:8px;overflow:hidden;border:1px dashed #f87171;border-radius:6px;';
badSlot.title = 'Non-composable card overflows its container';
badSlot.appendChild(makeBadCard('Revenue', '$48,290', '↑ 12%'));
document.getElementById('slot-sidebar').appendChild(badSlot);

// Measure the results
setTimeout(() => {
  console.log('=== COMPOSITION TEST ===\\n');
  ['slot-page','slot-modal','slot-sidebar'].forEach(id => {
    const slot = document.getElementById(id);
    const card = slot.querySelector('.stat-card');
    const slotW = slot.getBoundingClientRect().width;
    const cardW = card?.getBoundingClientRect().width;
    const fits  = cardW && cardW <= slotW + 1;
    console.log((fits ? '✓' : '✗') + ' ' + id.replace('slot-','').padEnd(10) +
      'slot: ' + Math.round(slotW) + 'px, card: ' + Math.round(cardW) + 'px ' +
      (fits ? '(fits ✓)' : '(OVERFLOW ✗)'));
  });

  const bad = document.querySelector('.bad-card');
  const badW = bad?.getBoundingClientRect().width;
  const badSlotW = document.getElementById('slot-sidebar').getBoundingClientRect().width;
  console.log('');
  console.log('.bad-card (280px fixed): ' + Math.round(badW) + 'px in a ' +
    Math.round(badSlotW) + 'px slot → ' + (badW > badSlotW + 1 ? 'OVERFLOW ✗' : 'fits'));

  console.log('\\nRule: components must have no fixed width.');
  console.log('They fill their container — the container controls their size.');
  console.log('This is the same constraint as Lesson 4 (LY-1: Magic Width)');
  console.log('applied at the system level: every component, without exception.');
}, 100);`,
      outputHeight: 380,
    },

    // ─── PART 8: ENGINEERING REALITY — CONWAY'S LAW ──────────────────────────
    {
      type: 'markdown',
      instruction: `## Engineering Reality: Conway's Law and Design Systems

Conway's Law (1967): *"Any organisation that designs a system will produce a design whose structure is a copy of the organisation's communication structure."*

This is not a metaphor. It's a measurable empirical observation that has been replicated across software, hardware, and UI systems for 50 years.

### What This Means for Design Systems

If a company has three product teams — each with their own design and engineering resources, each working relatively independently — the "design system" will have three inconsistent implementations of the same patterns, each slightly different.

The team building the checkout flow will have a button that's 7px border-radius. The team building the settings page will have 6px. The team building the onboarding will have 8px. Nobody agreed to this. Nobody intended it. The organisation structure produced it automatically.

### The Inverse Conway Maneuver

The solution — called the **Inverse Conway Maneuver** — is to design the organisation so that it produces the architecture you want, rather than fighting the architecture that the organisation naturally produces.

For design systems, this means:
- A **dedicated platform team** owns the design system and the token layer. They produce stable APIs.
- **Product teams** consume the design system but don't own it. They can request additions but can't modify primitives.
- **Changes to the token layer** require review by the platform team, not just the engineer making the change.

Without this structure, the token layer will drift toward the structure of the team that touches it most. Every engineer who "just needs to tweak this one value" is Conway's Law in action.

### The Practical Implication for Small Teams

Even a team of 3 engineers benefits from Conway-aware governance:

**Without governance:** any engineer can add a token, change a token, or bypass the token system. Three months later, three slightly different blues.

**With governance:** tokens are changed via a PR that requires one approval from the system owner. Hardcoded values fail the CI audit. The system owner reviews token additions for naming consistency.

The governance overhead for a 3-person team is minimal — one extra PR review. The drift prevention is real.

### The Documentation-as-Architecture Principle

A component's documentation is part of its architecture. If you can't document a component — if you can't write down what it accepts, what it produces, and what it should and shouldn't be used for — the component is not designed yet. It's a work in progress.

Every component merged into the system must have documentation. Not "will add docs later" — the PR is incomplete until the docs exist.`,
    },

    // ─── PART 9: ANTI-PATTERNS ────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Systems Anti-Patterns Reference

Six systems design failures that appear in nearly every production design system after 6+ months.

---

### SD-1: The Token Synonym Explosion
**Symptom:** \`--color-blue\`, \`--color-primary\`, \`--color-brand\`, \`--color-action\`, and \`--color-interactive\` all exist and have the same value. Engineers don't know which one to use, so each new component picks whichever they find first.
**Cause:** Tokens added reactively rather than designed upfront. No audit for duplicates.
**Fix:** Single-source-of-truth token audit: map every token to a unique semantic role. Any token that duplicates an existing role is deleted and replaced with an alias.

---

### SD-2: The Undocumented Exception
**Symptom:** A component uses \`z-index: 9999\` because "it was the only way to get it to work." Another uses \`!important\` to override a token. Another has a hardcoded \`margin: 7px\` that "looks right."
**Cause:** Deadline pressure + no enforcement mechanism.
**Fix:** Every deviation from the token system must be a documented exception with a tracked issue. If it can't be documented in 2 sentences, it's not an exception — it's a design system bug.

---

### SD-3: The Living Dead Token
**Symptom:** \`--color-accent-deprecated\` and \`--color-primary-old\` still exist in the token file. They're referenced by 3 components that were never migrated. Nobody knows which components.
**Cause:** Tokens renamed without migration. Deprecated tokens never deleted.
**Fix:** Implement the full token lifecycle: deprecate (with replacement pointer), migrate all references (codemod or grep), delete. Never rename without migrating.

---

### SD-4: The Version Cliff
**Symptom:** Design system version 2.0 renames 40 tokens. Every product team must update their entire codebase simultaneously. Teams on tight deadlines skip the upgrade for months. Two versions run in production simultaneously.
**Cause:** Breaking changes without a migration path or deprecation period.
**Fix:** Semantic versioning + deprecation period (minimum one major version). Provide a codemod. Never break the token API without a migration path.

---

### SD-5: The Component Island
**Symptom:** A component was built by an external consultant and uses its own token namespace (\`--modal-bg\`, \`--modal-border\`) rather than the system's semantic tokens. It looks the same today, but when the design system theme changes, it doesn't update.
**Cause:** No token audit requirement in code review. No documentation of which tokens components must consume.
**Fix:** Every component must consume only system semantic tokens. Token consumption is audited in CI. External contributions must be ported to system tokens before merge.

---

### SD-6: The Copy-Paste Component
**Symptom:** The codebase has 4 variants of a card component: \`Card\`, \`DashboardCard\`, \`AnalyticsCard\`, and \`ReportCard\`. They're 90% identical but maintained separately. When the design changes, all four must be updated.
**Cause:** Engineers build what they need rather than extending the existing component.
**Fix:** Component composition over component duplication. The system has one \`Card\` with variants and a composition API. \`DashboardCard\` is a thin wrapper, not a new component.`,
    },

    // ─── PART 10: PRACTICE 2 — WRITE A COMPONENT API ─────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 2: Document a Component's Full API

You're given a working \`Badge\` component. Your job is to write its complete documentation by introspecting its behaviour and producing:

1. The **variant list** (all valid values for the \`type\` parameter)
2. The **token map** (every CSS custom property the component reads)
3. The **state matrix** (what the badge looks like in each variant)
4. The **usage constraints** (what it should and shouldn't be used for)

The documentation is written as a JavaScript object — not prose — so it can be consumed programmatically (by a documentation site generator, by a Storybook integration, or by a linting tool).

The test verifies: the variant list is complete (≥4 variants), the token map identifies at least 3 tokens, and the usage constraints include both "use for" and "do not use for" entries.`,
      html: `<div id="p2-doc-demo">
  <div class="badge-showcase" id="badge-showcase"></div>
  <div class="doc-output" id="doc-output">
    <div class="doc-label">COMPONENT DOCUMENTATION OUTPUT</div>
    <pre id="doc-pre">{ run the documentation generator }</pre>
  </div>
</div>`,
      css: `body { background:#0f172a; padding:20px; margin:0; font-family:system-ui,sans-serif; }
#p2-doc-demo { max-width:560px; display:flex; flex-direction:column; gap:16px; }
:root {
  --badge-success-bg: rgba(34,197,94,0.1);  --badge-success-border:rgba(34,197,94,0.25);
  --badge-success-text: hsl(142,76%,75%);
  --badge-error-bg:   rgba(239,68,68,0.1);  --badge-error-border:  rgba(239,68,68,0.25);
  --badge-error-text: hsl(0,84%,80%);
  --badge-warning-bg: rgba(251,191,36,0.1); --badge-warning-border:rgba(251,191,36,0.25);
  --badge-warning-text: hsl(38,95%,80%);
  --badge-info-bg:    rgba(59,130,246,0.1); --badge-info-border:   rgba(59,130,246,0.25);
  --badge-info-text:  hsl(217,91%,75%);
  --badge-neutral-bg: rgba(100,116,139,0.1); --badge-neutral-border:rgba(100,116,139,0.25);
  --badge-neutral-text: hsl(215,25%,70%);
}
.badge-showcase { display:flex; gap:8px; flex-wrap:wrap; padding:14px;
  background:#1e293b; border:1px solid #334155; border-radius:8px; }
.badge { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
  padding:3px 10px; border-radius:100px; border:1px solid; display:inline-flex;
  align-items:center; gap:4px; }
.badge--success { background:var(--badge-success-bg); border-color:var(--badge-success-border); color:var(--badge-success-text); }
.badge--error   { background:var(--badge-error-bg);   border-color:var(--badge-error-border);   color:var(--badge-error-text);   }
.badge--warning { background:var(--badge-warning-bg); border-color:var(--badge-warning-border); color:var(--badge-warning-text); }
.badge--info    { background:var(--badge-info-bg);    border-color:var(--badge-info-border);    color:var(--badge-info-text);    }
.badge--neutral { background:var(--badge-neutral-bg); border-color:var(--badge-neutral-border); color:var(--badge-neutral-text); }
.doc-output { background:#111827; border:1px solid #334155; border-radius:8px;
  padding:14px 16px; }
.doc-label  { font-size:9px; font-weight:700; color:var(--color-text-secondary, #475569);
  letter-spacing:.14em; text-transform:uppercase; margin-bottom:8px; }
pre         { font-family:monospace; font-size:11px; color:#94a3b8;
  margin:0; line-height:1.7; white-space:pre-wrap; }`,
      startCode: `// RENDER the badge showcase
const showcase = document.getElementById('badge-showcase');
const BADGE_TYPES = ['success','error','warning','info','neutral'];

BADGE_TYPES.forEach(type => {
  const b = document.createElement('span');
  b.className = 'badge badge--' + type;
  b.innerHTML = type.toUpperCase();
  showcase.appendChild(b);
});

// DOCUMENT the component
// Introspect the component's token consumption from the CSS
function buildDoc() {
  // ── YOUR TASK: complete this documentation object ───────────────────────────

  const BadgeDoc = {
    name: 'Badge',
    description: 'A short status label that communicates categorical state.',

    // 1. VARIANT LIST — what values does the \`type\` prop accept?
    variants: {
      type: [
        // YOUR LIST: all valid badge types (hint: look at BADGE_TYPES above)
      ],
      // No size or state variants for this component
    },

    // 2. TOKEN MAP — what CSS custom properties does this component consume?
    tokens: {
      // YOUR LIST: at least 3 token groups
      // Format: 'variant-name': { background: '--token-name', ... }
      // Look at the CSS above and list every var(--badge-*) used
    },

    // 3. STATE MATRIX — what does each variant look like?
    states: BADGE_TYPES.map(type => {
      const el = showcase.querySelector('.badge--' + type);
      const s  = window.getComputedStyle(el);
      return {
        variant: type,
        // YOUR: read the computed background, borderColor, color from s
      };
    }),

    // 4. USAGE CONSTRAINTS
    usage: {
      useFor: [
        // YOUR LIST: what is this badge for?
        // At least 3 valid use cases
      ],
      doNotUseFor: [
        // YOUR LIST: what should this badge NOT be used for?
        // At least 2 invalid use cases
      ],
    },

    // 5. ACCESSIBILITY
    accessibility: {
      role:    'status',
      ariaLive:'polite',
      note:    'State must be communicated via label text, not colour alone (WCAG 1.4.1)',
    },
  };

  // Display the documentation
  document.getElementById('doc-pre').textContent = JSON.stringify(BadgeDoc, null, 2);
  return BadgeDoc;
}

const doc = buildDoc();

// ── AUDIT ─────────────────────────────────────────────────────────────────────
setTimeout(() => {
  const checks = {
    'has ≥4 variants':      doc.variants?.type?.length >= 4,
    'has ≥3 token entries': Object.keys(doc.tokens || {}).length >= 3,
    'has use cases':        doc.usage?.useFor?.length >= 2,
    'has dont-use cases':   doc.usage?.doNotUseFor?.length >= 1,
    'has accessibility':    !!doc.accessibility,
  };
  console.log('=== COMPONENT DOC AUDIT ===');
  Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗') + ' ' + k));
}, 100);`,
      solutionCode: `const showcase = document.getElementById('badge-showcase');
const BADGE_TYPES = ['success','error','warning','info','neutral'];
BADGE_TYPES.forEach(type => {
  const b = document.createElement('span');
  b.className = 'badge badge--' + type;
  b.innerHTML = type.toUpperCase();
  showcase.appendChild(b);
});

function buildDoc() {
  const BadgeDoc = {
    name: 'Badge', description: 'A short status label for categorical state.',
    variants: {
      type: ['success','error','warning','info','neutral'],
    },
    tokens: {
      success: { bg:'--badge-success-bg', border:'--badge-success-border', text:'--badge-success-text' },
      error:   { bg:'--badge-error-bg',   border:'--badge-error-border',   text:'--badge-error-text'   },
      warning: { bg:'--badge-warning-bg', border:'--badge-warning-border', text:'--badge-warning-text' },
      info:    { bg:'--badge-info-bg',    border:'--badge-info-border',    text:'--badge-info-text'    },
      neutral: { bg:'--badge-neutral-bg', border:'--badge-neutral-border', text:'--badge-neutral-text' },
    },
    states: BADGE_TYPES.map(type => {
      const el = showcase.querySelector('.badge--'+type);
      const s = window.getComputedStyle(el);
      return { variant: type, color: s.color, backgroundColor: s.backgroundColor };
    }),
    usage: {
      useFor: ['Order status (Shipped, Pending, Cancelled)', 'User role (Admin, Member)', 'Feature flag (Beta, New)', 'Alert type (Success, Warning)'],
      doNotUseFor: ['Interactive elements — use Button instead', 'Long text — truncate or use a Tag', 'Numbers/counts — use a Chip or Counter'],
    },
    accessibility: { role:'status', ariaLive:'polite', note:'State via text, not colour alone (WCAG 1.4.1)' },
  };
  document.getElementById('doc-pre').textContent = JSON.stringify(BadgeDoc, null, 2);
  return BadgeDoc;
}
const doc = buildDoc();`,
      check: (code) => {
        const hasVariants = /type:\s*\[[\s\S]*?(?:'success'|"success")/.test(code);
        const hasTokens   = /tokens.*\{[\s\S]*?(?:--badge|bg.*--|border.*--)/.test(code);
        const hasUsage    = /useFor[\s\S]*?doNotUseFor|doNotUseFor[\s\S]*?useFor/i.test(code);
        return hasVariants && hasUsage;
      },
      successMessage: `Component documented. The documentation object is machine-readable — it can feed a Storybook story, a documentation site, a token audit script, or a PR template. The format doesn't matter as much as the habit: every component that enters the system has its API, token map, states, and usage constraints declared explicitly before merge.`,
      failMessage: `Three required sections: (1) variants.type must be an array with ≥4 badge type strings. (2) tokens must have ≥3 entries (one per badge type, with token names). (3) usage must have both useFor and doNotUseFor arrays. The audit function reports which checks fail.`,
      outputHeight: 500,
    },

    // ─── PART 11: SABOTAGE SANDBOX ────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `## Sabotage Sandbox: Six System Violations

The "design system" fragment below has six deliberate violations that would cause drift over time. Diagnose and fix each one. Some are in the token definitions, some in the CSS, some in the JavaScript.

**The six violations:**
1. SD-1: Token synonym — \`--color-brand\` and \`--color-interactive\` both exist with the same value
2. SD-2: Undocumented exception — a component uses \`z-index: 9999\` inline
3. SD-3: Living dead token — \`--color-accent-old\` is defined but has no documented replacement
4. SD-4: Hardcoded value — a component uses \`#2563eb\` directly instead of \`var(--color-interactive)\`
5. SD-5: Component island — the alert component uses its own \`--alert-blue\` token not from the system
6. SD-6: Copy-paste component — \`NavCard\` is identical to \`StatCard\` with only a colour difference

The test checks: no synonym tokens, no hardcoded hex on interactive elements, no component-local token bypassing the system, and the nav card is replaced with a variant.`,
      html: `<div id="ss8-demo">
  <div class="ss8-status" id="ss8-status">Run audit to check violations</div>
  <div class="ss8-ui" id="ss8-ui">
    <div class="stat-card-sys">
      <div class="scs-label">Revenue</div>
      <div class="scs-value">$48,290</div>
    </div>
    <!-- SD-6: NavCard is a copy-paste of StatCard with hardcoded blue -->
    <div class="nav-card-copy">
      <div class="ncc-label">Navigation</div>
      <div class="ncc-value">Dashboard</div>
    </div>
    <!-- SD-5: alert uses its own --alert-blue instead of --color-interactive -->
    <div class="island-alert">
      <span class="ia-icon">i</span>
      <span class="ia-text">Update available</span>
    </div>
    <!-- SD-2: inline z-index exception -->
    <button class="sys-btn" id="ss8-btn"
      style="z-index:9999;position:relative">Settings</button>
  </div>
</div>`,
      css: `body { background:#0f172a; padding:20px; margin:0; font-family:system-ui,sans-serif; }

/* SD-1: TOKEN SYNONYMS — both mean the same thing */
:root {
  --color-brand:       hsl(217,76%,47%);  /* VIOLATION: synonym */
  --color-interactive: hsl(217,76%,47%);  /* correct semantic name */
  --color-surface:     hsl(222,39%,12%);
  --color-border:      hsl(217,32%,22%);
  --color-text-1:      hsl(210,40%,96%);
  --color-text-3:      hsl(217,20%,45%);
  --color-accent-old:  hsl(280,60%,50%);  /* SD-3: living dead — no replacement docs */
}

#ss8-demo { max-width:500px; }
.ss8-status { font-size:12px; color:var(--color-text-secondary, #475569); margin-bottom:12px;
  padding:8px 12px; background:#1e293b; border:1px solid #334155; border-radius:6px; }
.ss8-ui { display:grid; grid-template-columns:1fr 1fr; gap:10px; }

/* Correct system component */
.stat-card-sys { background:var(--color-surface); border:1px solid var(--color-border);
  border-radius:8px; padding:14px; }
.scs-label { font-size:10px; font-weight:600; color:var(--color-text-3);
  text-transform:uppercase; letter-spacing:.1em; margin-bottom:4px; }
.scs-value { font-size:22px; font-weight:700; color:var(--color-text-1); }

/* SD-6: Copy-paste — identical to stat-card-sys except for border colour */
.nav-card-copy { background:var(--color-surface);
  border:1px solid #2563eb;  /* SD-4: hardcoded hex */
  border-radius:8px; padding:14px; }
.ncc-label { font-size:10px; font-weight:600; color:var(--color-text-3);
  text-transform:uppercase; letter-spacing:.1em; margin-bottom:4px; }
.ncc-value { font-size:22px; font-weight:700; color:var(--color-text-1); }

/* SD-5: Component island — own token instead of --color-interactive */
:root { --alert-blue: hsl(217,76%,47%); } /* VIOLATION: duplicates --color-interactive */
.island-alert { grid-column:1/-1; display:flex; align-items:center; gap:8px;
  padding:10px 12px; border-radius:7px;
  background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.2); }
.ia-icon { width:18px; height:18px; border-radius:50%;
  background:var(--alert-blue); /* VIOLATION: should use --color-interactive */
  color:white; font-size:10px; font-weight:700;
  display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ia-text { font-size:13px; color:hsl(217,91%,80%); }
.sys-btn { grid-column:1/-1; padding:10px; background:var(--color-interactive);
  color:white; border:none; border-radius:8px; font-size:14px; font-weight:600;
  cursor:pointer; }`,
      startCode: `// FIX THE SIX SYSTEM VIOLATIONS

const root = document.documentElement;
const status = document.getElementById('ss8-status');

// ── FIX SD-1: Remove the token synonym ────────────────────────────────────────
// --color-brand is a synonym for --color-interactive
// Remove it (or make it an alias that points to --color-interactive)
root.style.removeProperty('--color-brand');
// OR: root.style.setProperty('--color-brand', 'var(--color-interactive)');

// ── FIX SD-3: Document the living dead token ──────────────────────────────────
// --color-accent-old has no replacement pointer
// Add a console warning (simulating what a token audit script would do)
const DEPRECATED = new Map([
  ['--color-accent-old', '--color-interactive'],  // your deprecation entry
]);
DEPRECATED.forEach((replacement, token) => {
  console.warn('[DesignSystem] Token ' + token + ' is deprecated. ' +
    'Use ' + replacement + ' instead. Will be removed in v3.0.');
});

// ── FIX SD-4: Replace hardcoded hex in nav card ───────────────────────────────
// .nav-card-copy has border: 1px solid #2563eb
document.querySelector('.nav-card-copy').style.borderColor = '???';

// ── FIX SD-5: Replace component island token with system token ────────────────
// .ia-icon uses var(--alert-blue) instead of var(--color-interactive)
document.querySelector('.ia-icon').style.background = '???';

// ── FIX SD-6: Collapse nav-card into stat-card variant ────────────────────────
// Instead of a separate component, add a modifier class to stat-card-sys
// Mark the nav-card-copy as the problematic copy
document.querySelector('.nav-card-copy').title =
  'SD-6: This should be .stat-card-sys.stat-card--featured, not a separate component';
document.querySelector('.nav-card-copy').style.outline = '2px dashed #f87171';

// ── FIX SD-2: Remove undocumented z-index exception ───────────────────────────
const btn = document.getElementById('ss8-btn');
btn.style.zIndex   = '';   // remove the 9999
btn.style.position = '';

// ── AUDIT ─────────────────────────────────────────────────────────────────────
setTimeout(() => {
  const brandToken   = root.style.getPropertyValue('--color-brand');
  const btnZIndex    = window.getComputedStyle(btn).zIndex;
  const navBorder    = window.getComputedStyle(document.querySelector('.nav-card-copy')).borderColor;
  const iconBg       = window.getComputedStyle(document.querySelector('.ia-icon')).backgroundColor;

  // Check nav border is not the hardcoded blue
  const blueHex = 'rgb(37, 99, 235)';
  const navFixed = navBorder !== blueHex;

  // Check icon background is --color-interactive (same as nav card border should be)
  const interactiveColor = window.getComputedStyle(document.documentElement)
    .getPropertyValue('--color-interactive');

  const checks = {
    'SD-1 brand synonym removed': !brandToken || brandToken === 'var(--color-interactive)',
    'SD-2 z-index removed':       btnZIndex === 'auto' || btnZIndex === '0',
    'SD-4 hardcoded hex fixed':   navFixed,
    'SD-5 island token replaced': true, // visual check — icon should use system token
  };

  let passCount = 0;
  const lines = ['=== SYSTEM VIOLATIONS AUDIT ===', ''];
  Object.entries(checks).forEach(([k,v]) => {
    if (v) passCount++;
    lines.push((v ? '✓' : '✗') + ' ' + k);
  });
  lines.push('', passCount + '/' + Object.keys(checks).length + ' violations fixed');
  status.innerHTML = lines.join('<br>');
  status.style.color = passCount === Object.keys(checks).length ? '#4ade80' : '#f87171';
  console.log(lines.join('\\n'));
}, 100);`,
      solutionCode: `const root = document.documentElement;
const status = document.getElementById('ss8-status');

root.style.removeProperty('--color-brand');
const DEPRECATED = new Map([['--color-accent-old','--color-interactive']]);
DEPRECATED.forEach((r,t) => console.warn('[DS] ' + t + ' deprecated. Use ' + r));

document.querySelector('.nav-card-copy').style.borderColor = 'var(--color-interactive)';
document.querySelector('.ia-icon').style.background = 'var(--color-interactive)';
document.querySelector('.nav-card-copy').title = 'SD-6: should be .stat-card-sys--featured';
document.querySelector('.nav-card-copy').style.outline = '2px dashed #f87171';

const btn = document.getElementById('ss8-btn');
btn.style.zIndex = ''; btn.style.position = '';

setTimeout(() => {
  const brandToken = root.style.getPropertyValue('--color-brand');
  const btnZIndex  = window.getComputedStyle(btn).zIndex;
  const navBorder  = window.getComputedStyle(document.querySelector('.nav-card-copy')).borderColor;
  const checks = {
    'SD-1 brand synonym removed': !brandToken || brandToken.includes('var'),
    'SD-2 z-index removed': btnZIndex === 'auto' || btnZIndex === '0',
    'SD-4 hardcoded hex fixed': navBorder !== 'rgb(37, 99, 235)',
    'SD-5 island token replaced': true,
  };
  let pass = 0;
  const lines = ['=== AUDIT ===',''];
  Object.entries(checks).forEach(([k,v]) => { if(v) pass++; lines.push((v?'✓':'✗')+' '+k); });
  lines.push('',pass+'/'+Object.keys(checks).length+' fixed');
  status.innerHTML = lines.join('<br>');
  status.style.color = pass === Object.keys(checks).length ? '#4ade80' : '#94a3b8';
}, 100);`,
      check: (code) => {
        const removesBrand  = /removeProperty.*color-brand|color-brand.*var\(--color-interactive\)/i.test(code);
        const fixesHardcoded= /nav-card-copy[\s\S]*?borderColor.*var\(--|borderColor.*hsl/i.test(code);
        const fixesIsland   = /ia-icon[\s\S]*?background.*var\(--|ia-icon[\s\S]*?background.*color-interactive/i.test(code);
        return removesBrand && fixesHardcoded;
      },
      successMessage: `Six system violations diagnosed and fixed. The pattern: SD-1 (synonyms) is caught by token audit scripts that flag duplicate values. SD-4 (hardcoded hex) is caught by Stylelint rules that ban hardcoded brand colours. SD-5 (component islands) is caught by requiring all components to consume only system semantic tokens. Three of the six violations are preventable with automated tooling — the remaining three require documentation and code review discipline.`,
      failMessage: `Two required fixes: (1) --color-brand must be removed (removeProperty) or aliased to var(--color-interactive) — it's a synonym that causes drift. (2) .nav-card-copy borderColor must be changed from the hardcoded #2563eb to var(--color-interactive). The audit output shows which checks are still failing.`,
      outputHeight: 460,
    },

    // ─── PART 12: STRESS CONDITION — BRAND CHANGE ────────────────────────────
    {
      type: 'js',
      instruction: `## Stress Condition: The System Under a Brand Change

The ultimate test of a design system's governance is a full brand colour change. If the token architecture is correct, the change touches exactly one place. If it's wrong, you find all the violations simultaneously.

This cell simulates four brand colour changes on a complete interface. Watch which elements update and which don't — the ones that don't are SD-4 violations (hardcoded values).

The governance-correct UI updates everything simultaneously. The deliberately broken version shows three elements that were hardcoded and don't update. This is exactly what a brand change reveals in production.`,
      html: `<div id="brand-change-demo">
  <div id="bc-controls">
    <span class="bc-label">Brand colour:</span>
    <button class="bc-btn active" data-hue="217">Blue</button>
    <button class="bc-btn" data-hue="183">Teal</button>
    <button class="bc-btn" data-hue="145">Green</button>
    <button class="bc-btn" data-hue="270">Purple</button>
    <button class="bc-btn" data-hue="14">Orange</button>
  </div>
  <div class="bc-row">
    <div class="bc-col">
      <div class="bc-col-label">✓ Governed (uses tokens)</div>
      <div class="bc-governed" id="bc-governed">
        <nav class="bcg-nav">
          <span class="bcg-logo">Acme</span>
          <button class="bcg-cta">Get started</button>
        </nav>
        <div class="bcg-body">
          <div class="bcg-badge">NEW</div>
          <div class="bcg-stat">$48,290</div>
          <a class="bcg-link" href="#">View report →</a>
        </div>
      </div>
    </div>
    <div class="bc-col">
      <div class="bc-col-label">✗ Drifted (hardcoded values)</div>
      <div class="bc-drifted" id="bc-drifted">
        <nav class="bcd-nav">
          <span class="bcd-logo">Acme</span>
          <!-- HARDCODED: won't update on rebrand -->
          <button class="bcd-cta" style="background:#2563eb;color:white;border:none;
            padding:6px 14px;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer">
            Get started
          </button>
        </nav>
        <div class="bcd-body">
          <!-- HARDCODED badge colour -->
          <div class="bcd-badge" style="color:#3b82f6;background:rgba(59,130,246,0.12);
            border:1px solid rgba(59,130,246,0.25)">NEW</div>
          <div class="bcd-stat">$48,290</div>
          <!-- HARDCODED link colour -->
          <a class="bcd-link" href="#" style="color:#2563eb">View report →</a>
        </div>
      </div>
    </div>
  </div>
  <div id="bc-report"></div>
</div>`,
      css: `body { background:#0f172a; padding:20px; margin:0; font-family:system-ui,sans-serif; }
#bc-controls { display:flex; align-items:center; gap:8px; margin-bottom:14px; flex-wrap:wrap; }
.bc-label    { font-size:11px; color:var(--color-text-secondary, #475569); }
.bc-btn      { font-size:11px; font-weight:500; padding:5px 12px; border-radius:6px;
  border:1px solid #334155; background:#1e293b; color:var(--color-text-secondary, #475569); cursor:pointer; }
.bc-btn.active { background:var(--bc-interactive,#2563eb); color:white;
  border-color:var(--bc-interactive,#2563eb); }
.bc-row { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:10px; }
.bc-col { flex:1; min-width:200px; display:flex; flex-direction:column; gap:6px; }
.bc-col-label { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; }
.bc-col:first-child .bc-col-label { color:#4ade80; }
.bc-col:last-child  .bc-col-label { color:#f87171; }
.bc-governed,.bc-drifted { background:#1e293b; border:1px solid #334155;
  border-radius:8px; overflow:hidden; }
.bcg-nav,.bcd-nav { display:flex; align-items:center; padding:0 12px; height:40px;
  border-bottom:1px solid #334155; gap:8px; }
.bcg-logo,.bcd-logo { font-size:13px; font-weight:700; color:#f1f5f9; flex:1; }
/* GOVERNED: uses tokens */
.bcg-cta  { padding:5px 12px; background:var(--bc-interactive); color:white; border:none;
  border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; }
.bcg-body,.bcd-body { padding:12px; display:flex; flex-direction:column; gap:8px; }
.bcg-badge { font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
  color:var(--bc-interactive); background:var(--bc-subtle); border:1px solid var(--bc-border-subtle);
  padding:2px 8px; border-radius:100px; display:inline-block; }
.bcg-stat,.bcd-stat { font-size:22px; font-weight:700; color:#f1f5f9; }
.bcg-link { font-size:13px; color:var(--bc-interactive); font-weight:500; }
/* DRIFTED: inline styles used for brand colours — see HTML */
.bcd-badge { font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
  padding:2px 8px; border-radius:100px; display:inline-block; }
#bc-report { font-family:monospace; font-size:11px; color:var(--color-text-secondary, #475569); line-height:1.7; }`,
      startCode: `const root = document.documentElement;

function setBrand(hue) {
  // Update the token system
  root.style.setProperty('--bc-interactive',    \`hsl(\${hue},76%,47%)\`);
  root.style.setProperty('--bc-interactive-h',  \`hsl(\${hue},76%,42%)\`);
  root.style.setProperty('--bc-subtle',         \`hsl(\${hue},80%,14%)\`);
  root.style.setProperty('--bc-border-subtle',  \`hsl(\${hue},70%,22%)\`);

  // Update active button
  document.querySelectorAll('.bc-btn').forEach(b =>
    b.classList.toggle('active', parseInt(b.dataset.hue) === hue));

  // Measure: which elements updated vs which are stuck?
  setTimeout(() => {
    const governed  = document.querySelectorAll('.bc-governed [style*="background"], .bc-governed [style*="color"]');
    const drifted   = document.querySelectorAll('.bc-drifted [style*="background"], .bc-drifted [style*="color"]');

    const govCtaBg  = window.getComputedStyle(document.querySelector('.bcg-cta')).backgroundColor;
    const driftCtaBg= document.querySelector('.bcd-cta').style.background;

    const govR = parseInt(govCtaBg.split(',')[0].replace('rgb(',''));
    const expectedR = Math.round(parseFloat('hsl(' + hue + ',76%,47%)'.split('%')[0].split('(')[1]) / 360 * 255 + 50);

    const report = [
      'Brand hue: ' + hue + '°',
      '',
      'Governed component:',
      '  .bcg-cta bg = ' + govCtaBg + ' → updates ✓',
      '  .bcg-badge uses var(--bc-interactive) → updates ✓',
      '  .bcg-link uses var(--bc-interactive) → updates ✓',
      '',
      'Drifted component:',
      '  .bcd-cta bg = ' + (driftCtaBg || 'inherited') + ' → STUCK at #2563eb ✗',
      '  .bcd-badge colour = hardcoded rgba(59,130,246,...) → STUCK ✗',
      '  .bcd-link colour = hardcoded #2563eb → STUCK ✗',
      '',
      'Elements that didn\'t update: 3 (SD-4 violations)',
    ];

    document.getElementById('bc-report').innerHTML = report.join('<br>');
    console.log(report.join('\\n'));
  }, 50);
}

document.querySelectorAll('.bc-btn').forEach(b =>
  b.addEventListener('click', () => setBrand(parseInt(b.dataset.hue))));

setBrand(217);`,
      outputHeight: 440,
    },

    // ─── PART 13: PRACTICE 3 — AUDIT A FRAGMENTED CODEBASE ───────────────────
    {
      type: 'challenge',
      instruction: `## Practice 3: Audit and Repair a Fragmented Codebase

You're given a "codebase" represented as a set of CSS objects. Each object represents a component's styles as written by a different engineer. Your job is to:

1. Run the system audit — find all SD-1 through SD-6 violations
2. Calculate the "system health score" (% of properties using tokens vs hardcoded)
3. Produce a repair plan: for each hardcoded value, identify the correct token replacement
4. Apply the repairs by patching each component

The test verifies: health score improves from the baseline, at least 3 components are repaired, and no hardcoded brand hex values remain.`,
      html: `<div id="codebase-audit">
  <div id="ca-controls">
    <button id="ca-run-audit" class="ca-btn">Run System Audit</button>
    <button id="ca-repair" class="ca-btn" style="display:none">Apply Repairs</button>
  </div>
  <div id="ca-output"></div>
  <div id="ca-health"></div>
</div>`,
      css: `body { background:#0f172a; padding:20px; margin:0; font-family:system-ui,sans-serif; }
#codebase-audit { max-width:560px; }
.ca-btn { padding:8px 16px; background:hsl(217,76%,47%); color:white; border:none;
  border-radius:7px; font-size:13px; font-weight:600; cursor:pointer; margin-right:8px;
  margin-bottom:12px; }
#ca-output { font-family:monospace; font-size:11px; color:var(--color-text-secondary, #475569); line-height:1.9;
  background:#111827; border:1px solid #1e293b; border-radius:6px;
  padding:12px 14px; margin-bottom:12px; max-height:280px; overflow-y:auto; }
#ca-health { font-size:13px; color:#94a3b8; }
#ca-health strong { color:#f1f5f9; }`,
      startCode: `// SIMULATED CODEBASE — each entry represents a component's colour/spacing properties
// as written by different engineers over 6 months

const CODEBASE = {
  'Button.css': {
    'background':   '#2563eb',     // SD-4: hardcoded brand blue
    'color':        '#ffffff',
    'padding':      '8px 16px',    // acceptable: on-grid
    'border-radius':'8px',
  },
  'Card.css': {
    'background':   'var(--color-surface)',  // ✓ uses token
    'border':       '1px solid var(--color-border)', // ✓
    'padding':      '20px',         // ✓ on-grid
    'color':        '#f1f5f9',      // SD-4: should be var(--color-text-1)
  },
  'Alert.css': {
    'background':   'rgba(37,99,235,0.08)',  // SD-5: should be var(--color-interactive-subtle)
    'border-color': '#1d4ed8',      // SD-4: hardcoded + slightly off the token value
    'color':        'var(--color-text-1)',   // ✓
    'padding':      '12px',         // ✓ on-grid
  },
  'Badge.css': {
    'background':   'var(--badge-success-bg)',  // SD-5: component-local token
    'border':       '1px solid var(--badge-success-border)', // SD-5
    'color':        'var(--badge-success-text)', // SD-5
    'font-size':    '10px',          // ✓
  },
  'NavLink.css': {
    'color':        '#3b82f6',       // SD-4: hardcoded blue (slightly different shade!)
    'font-weight':  '500',
    'padding':      '6px 10px',      // ✓ on-grid
  },
  'Modal.css': {
    'background':   'var(--color-surface)',   // ✓
    'border':       '1px solid var(--color-border)', // ✓
    'z-index':      '9999',          // SD-2: undocumented exception
    'padding':      '24px',          // ✓
  },
};

// SYSTEM TOKEN MAP — what each hardcoded value SHOULD reference
const TOKEN_MAP = {
  '#2563eb':             'var(--color-interactive)',
  '#1d4ed8':             'var(--color-interactive)',
  '#3b82f6':             'var(--color-interactive)',
  'rgba(37,99,235,0.08)':'var(--color-interactive-subtle)',
  '#f1f5f9':             'var(--color-text-1)',
  '#0f172a':             'var(--color-bg)',
};

const BRAND_HEX = /^#([0-9a-f]{6})$/i;

// ── YOUR TASK: implement the audit and repair ─────────────────────────────────

function countViolations(codebase) {
  let total = 0, violations = 0, repairs = [];
  Object.entries(codebase).forEach(([file, rules]) => {
    Object.entries(rules).forEach(([prop, value]) => {
      total++;
      // Check for hardcoded colour values that should be tokens
      const isHardcoded = value.match(BRAND_HEX) || value.startsWith('rgba(37,') ||
                          (value.startsWith('#') && !value.includes('var('));
      const isLocalToken= value.includes('var(--badge-') || value.includes('var(--alert-');
      if (isHardcoded || isLocalToken) {
        violations++;
        const replacement = TOKEN_MAP[value] || 'NEEDS TOKEN';
        repairs.push({ file, prop, value, replacement });
      }
    });
  });
  return { total, violations, repairs, health: ((total - violations) / total * 100).toFixed(1) };
}

function renderAudit(codebase) {
  const { total, violations, repairs, health } = countViolations(codebase);
  const output = document.getElementById('ca-output');
  const lines  = ['=== CODEBASE AUDIT ===', '', 'File · Property → Issue → Repair', ''];

  repairs.forEach(({ file, prop, value, replacement }) => {
    lines.push('✗ ' + file + ' · ' + prop);
    lines.push('  Value: ' + value);
    lines.push('  Fix:   ' + replacement);
    lines.push('');
  });

  lines.push('Total properties: ' + total);
  lines.push('Violations: ' + violations);
  lines.push('System health: ' + health + '%');

  output.innerHTML = lines.join('<br>');
  document.getElementById('ca-health').innerHTML =
    'System health: <strong>' + health + '%</strong> (' + violations + ' violations in ' + total + ' properties)';

  document.getElementById('ca-repair').style.display = '';
  return { violations, health };
}

function applyRepairs(codebase) {
  // YOUR CODE: iterate repairs and replace hardcoded values with tokens
  const { repairs } = countViolations(codebase);

  const repaired = JSON.parse(JSON.stringify(codebase)); // deep copy

  repairs.forEach(({ file, prop, replacement }) => {
    if (replacement !== 'NEEDS TOKEN') {
      repaired[file][prop] = replacement;
    }
  });

  // Re-run audit on repaired codebase
  const after = countViolations(repaired);
  const output = document.getElementById('ca-output');
  output.innerHTML += '<br><strong style="color:#4ade80">── AFTER REPAIRS ──</strong><br>' +
    'System health: ' + after.health + '% (' + after.violations + ' remaining violations)<br>';

  document.getElementById('ca-health').innerHTML =
    'Before: <strong>' + countViolations(codebase).health + '%</strong> → ' +
    'After: <strong style="color:#4ade80">' + after.health + '%</strong>';

  return { before: countViolations(codebase), after };
}

document.getElementById('ca-run-audit').onclick = () => renderAudit(CODEBASE);
document.getElementById('ca-repair').onclick = () => {
  const { before, after } = applyRepairs(CODEBASE);
  console.log('Health improved from', before.health + '%', 'to', after.health + '%');
  console.log('Repairs applied:', before.violations - after.violations);
};

// ── AUDIT ─────────────────────────────────────────────────────────────────────
setTimeout(() => {
  const result = countViolations(CODEBASE);
  const repairs = result.repairs;

  const checks = {
    'Audit finds violations':  result.violations >= 5,
    'Token map covers repairs':repairs.filter(r => r.replacement !== 'NEEDS TOKEN').length >= 3,
    'Health score calculated': parseFloat(result.health) > 0,
  };
  console.log('=== PRACTICE 3 AUDIT ===');
  Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗') + ' ' + k));
}, 100);`,
      solutionCode: `const CODEBASE = {
  'Button.css':  { 'background':'#2563eb', 'color':'#ffffff', 'padding':'8px 16px', 'border-radius':'8px' },
  'Card.css':    { 'background':'var(--color-surface)', 'border':'1px solid var(--color-border)', 'padding':'20px', 'color':'#f1f5f9' },
  'Alert.css':   { 'background':'rgba(37,99,235,0.08)', 'border-color':'#1d4ed8', 'color':'var(--color-text-1)', 'padding':'12px' },
  'Badge.css':   { 'background':'var(--badge-success-bg)', 'border':'1px solid var(--badge-success-border)', 'color':'var(--badge-success-text)', 'font-size':'10px' },
  'NavLink.css': { 'color':'#3b82f6', 'font-weight':'500', 'padding':'6px 10px' },
  'Modal.css':   { 'background':'var(--color-surface)', 'border':'1px solid var(--color-border)', 'z-index':'9999', 'padding':'24px' },
};
const TOKEN_MAP = { '#2563eb':'var(--color-interactive)', '#1d4ed8':'var(--color-interactive)', '#3b82f6':'var(--color-interactive)', 'rgba(37,99,235,0.08)':'var(--color-interactive-subtle)', '#f1f5f9':'var(--color-text-1)', '#0f172a':'var(--color-bg)' };
const BRAND_HEX = /^#([0-9a-f]{6})$/i;

function countViolations(cb) {
  let total=0, violations=0, repairs=[];
  Object.entries(cb).forEach(([file,rules]) => {
    Object.entries(rules).forEach(([prop,value]) => {
      total++;
      const bad = value.match(BRAND_HEX) || value.startsWith('rgba(37,') || (value.startsWith('#') && !value.includes('var(')) || value.includes('var(--badge-') || value.includes('var(--alert-');
      if (bad) { violations++; repairs.push({ file, prop, value, replacement: TOKEN_MAP[value] || 'NEEDS TOKEN' }); }
    });
  });
  return { total, violations, repairs, health: ((total-violations)/total*100).toFixed(1) };
}

function renderAudit(cb) {
  const { total, violations, repairs, health } = countViolations(cb);
  const lines = ['=== AUDIT ===',''];
  repairs.forEach(({ file, prop, value, replacement }) => { lines.push('✗ '+file+' · '+prop); lines.push('  → '+replacement); lines.push(''); });
  lines.push('Health: '+health+'% ('+violations+'/'+total+' violations)');
  document.getElementById('ca-output').innerHTML = lines.join('<br>');
  document.getElementById('ca-health').innerHTML = 'Health: <strong>'+health+'%</strong>';
  document.getElementById('ca-repair').style.display = '';
}

function applyRepairs(cb) {
  const { repairs } = countViolations(cb);
  const repaired = JSON.parse(JSON.stringify(cb));
  repairs.forEach(({ file, prop, replacement }) => { if (replacement !== 'NEEDS TOKEN') repaired[file][prop] = replacement; });
  const after = countViolations(repaired);
  document.getElementById('ca-output').innerHTML += '<br><strong style="color:#4ade80">After repairs: '+after.health+'%</strong>';
  document.getElementById('ca-health').innerHTML = 'Before: <strong>'+countViolations(cb).health+'%</strong> → After: <strong style="color:#4ade80">'+after.health+'%</strong>';
  return { before: countViolations(cb), after };
}

document.getElementById('ca-run-audit').onclick = () => renderAudit(CODEBASE);
document.getElementById('ca-repair').onclick = () => applyRepairs(CODEBASE);`,
      check: (code) => {
        const hasAudit   = /countViolations|violations|BRAND_HEX/i.test(code);
        const hasRepairs = /applyRepairs|repairs|TOKEN_MAP/i.test(code);
        const hasHealth  = /health|percentage|total.*violations/i.test(code);
        return hasAudit && hasRepairs;
      },
      successMessage: `Codebase audit built. The health score is the key output: a percentage of properties that correctly use tokens. Running this in CI before every merge means the score can only stay the same or improve — regressions fail the build. The repair function shows the token replacement for each violation. In a real codebase, this would be a codemod script, not a manual repair.`,
      failMessage: `Two required: (1) countViolations() must detect violations in CODEBASE — it needs to check each property value for hardcoded hex and return a violations count. (2) applyRepairs() must iterate the repairs array and replace hardcoded values with TOKEN_MAP entries. The test checks that violations are found and that at least 3 have valid token replacements.`,
      outputHeight: 460,
    },

    // ─── PART 14: CROSS-PLATFORM ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Cross-Platform: Governance Everywhere

The governance model is platform-agnostic. Only the tooling changes.

| Concept | Web (CSS) | React + TypeScript | iOS (Swift) | Android | Qt/C++ |
|---|---|---|---|---|---|
| Token definition | CSS custom properties | TypeScript const | Swift enum | Kotlin object | C++ const / QColor |
| Token naming | Pattern 3: --color-interactive | colors.interactive | Color.interactive | Color.interactive | APP_COLOR_INTERACTIVE |
| Hardcoded value detection | Stylelint rule | ESLint rule | SwiftLint rule | Detekt rule | clang-tidy |
| Token audit | auditColour() in CI | Token validator | Token validator | Token validator | build-time check |
| Documentation | Storybook | Storybook / TSDoc | DocC | KDoc | Doxygen |
| Deprecation | CSS comment + console.warn | @deprecated JSDoc | @available(deprecated) | @Deprecated annotation | [[deprecated]] |
| Version control | semver on token file | package.json version | CocoaPods version | Maven version | CMake version |

### The Language-Agnostic Governance Rules

1. **Tokens in one place.** One file defines all primitive tokens. One file defines all semantic tokens. No other file defines colours.
2. **Semantic names only in components.** No component references a primitive token or a raw value.
3. **Automated enforcement.** Rules that live only in a document don't get followed. Rules that break the build do.
4. **Deprecation before deletion.** Any token removal is a major version change with a migration path.
5. **Documentation is part of the definition.** A token without documentation of its purpose is an undocumented exception waiting to happen.

---

## What You Now Know

After Lesson 8, you can:
- Detect design drift using a system audit function
- Apply the correct token naming pattern (global semantic, not value-based or component-based)
- Manage the token lifecycle: creation, deprecation, deletion
- Write a component's complete API documentation
- Identify and fix all six systems anti-patterns (SD-1 through SD-6)
- Calculate system health score and apply repairs
- Understand Conway's Law and design the organisation to produce coherent systems

**Next: Accessibility Systems** — ARIA roles, semantic HTML, focus management, screen reader contracts, and building interfaces that work for everyone.`,
    },

    // ─── PART 15: SEED ────────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Lesson 8 Complete — The \`auditSystem()\` Tool

The complete system governance audit. This is the function that runs in CI — if it returns violations, the build fails. Zero violations means the system is coherent.

Combined with \`auditComponent()\` from Lesson 6 and \`auditInteraction()\` from Lesson 7, you now have a complete automated quality gate for any component in the system.`,
      html: `<div id="ref-system">
  <div class="rs-tokens" id="rs-tokens"></div>
  <div class="rs-ui" id="rs-ui">
    <div class="rs-card">
      <div class="rs-label">System health</div>
      <div class="rs-value" id="rs-health-val">—</div>
      <div class="rs-sub">Token compliance score</div>
    </div>
    <div class="rs-card">
      <div class="rs-label">Violations</div>
      <div class="rs-value" id="rs-violations">—</div>
      <div class="rs-sub">Hardcoded values in components</div>
    </div>
    <button class="rs-btn" id="rs-run">Run system audit</button>
  </div>
</div>`,
      css: `body { background:#0f172a; padding:20px; margin:0; font-family:system-ui,sans-serif; }
:root {
  --sys-bg:hsl(222,47%,7%); --sys-surface:hsl(222,39%,12%); --sys-border:hsl(217,32%,22%);
  --sys-text-1:hsl(210,40%,96%); --sys-text-2:hsl(215,25%,65%); --sys-text-3:hsl(217,20%,45%);
  --sys-interactive:hsl(217,76%,47%);
  --sys-brand-hue: 217;
}
#ref-system { max-width:520px; display:flex; flex-direction:column; gap:12px; }
.rs-tokens  { font-family:monospace; font-size:11px; color:var(--color-text-secondary, #475569); background:#111827;
  border:1px solid #1e293b; border-radius:6px; padding:10px 12px; line-height:1.8; }
.rs-ui { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.rs-card { background:var(--sys-surface); border:1px solid var(--sys-border);
  border-radius:8px; padding:14px; display:flex; flex-direction:column; gap:4px; }
.rs-label { font-size:10px; font-weight:600; color:var(--sys-text-3);
  text-transform:uppercase; letter-spacing:.1em; }
.rs-value { font-size:24px; font-weight:700; color:var(--sys-text-1); }
.rs-sub   { font-size:11px; color:var(--sys-text-3); }
.rs-btn   { grid-column:1/-1; padding:11px; background:var(--sys-interactive); color:white;
  border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer;
  min-height:44px; }`,
      startCode: `// ── SYSTEM TOKEN REGISTRY ─────────────────────────────────────────────────────
const SYSTEM_TOKENS = new Set([
  '--sys-bg','--sys-surface','--sys-border',
  '--sys-text-1','--sys-text-2','--sys-text-3',
  '--sys-interactive',
]);

const BRAND_HEX_RE = /^#[0-9a-f]{6}$/i;
const BRAND_RGB_RE = /^rgb\\(37,\\s*99,\\s*235\\)$/; // #2563eb resolved

// ── auditSystem() — the complete governance check ─────────────────────────────
function auditSystem(rootSel) {
  const root = document.querySelector(rootSel);
  if (!root) return;

  const violations = [];
  const tokenUse   = { correct: 0, hardcoded: 0, unknown: 0 };

  root.querySelectorAll('*').forEach(el => {
    const s    = window.getComputedStyle(el);
    const name = '.' + (el.className?.toString().trim().split(' ')[0] || el.tagName.toLowerCase());

    // Check inline styles for hardcoded brand values
    if (el.style.cssText) {
      const inline = el.style.cssText;
      if (BRAND_HEX_RE.test(el.style.color) || BRAND_HEX_RE.test(el.style.backgroundColor) ||
          BRAND_HEX_RE.test(el.style.borderColor)) {
        tokenUse.hardcoded++;
        violations.push('HARDCODED: ' + name + ' has inline brand hex');
      }
    }

    // Check for unknown token references
    const varRefs = (el.getAttribute('style') || '').match(/var\\(--([^)]+)\\)/g) || [];
    varRefs.forEach(ref => {
      const token = ref.match(/var\\(--([^)]+)\\)/)?.[1];
      if (token && !SYSTEM_TOKENS.has('--' + token)) {
        tokenUse.unknown++;
        violations.push('UNKNOWN TOKEN: ' + name + ' uses --' + token);
      } else if (token) {
        tokenUse.correct++;
      }
    });
  });

  // Calculate health
  const total  = tokenUse.correct + tokenUse.hardcoded + tokenUse.unknown;
  const health = total > 0 ? (tokenUse.correct / total * 100).toFixed(1) : '100.0';

  document.getElementById('rs-health-val').textContent  = health + '%';
  document.getElementById('rs-violations').textContent  = violations.length;

  console.log('\\n=== auditSystem(' + rootSel + ') ===\\n');
  if (violations.length === 0) {
    console.log('✓ System coherent — 0 violations');
  } else {
    violations.forEach(v => console.log('✗ ' + v));
  }
  console.log('\\nToken compliance: ' + health + '%');
  console.log('Correct: ' + tokenUse.correct + ' · Hardcoded: ' + tokenUse.hardcoded + ' · Unknown: ' + tokenUse.unknown);
  return violations.length === 0;
}

// Display token registry
document.getElementById('rs-tokens').textContent =
  'System token registry (' + SYSTEM_TOKENS.size + ' tokens):\\n' +
  [...SYSTEM_TOKENS].map(t => '  ' + t).join('\\n');

document.getElementById('rs-run').onclick = () => auditSystem('#ref-system');

console.log('=== LESSON 8 — SYSTEM GOVERNANCE ===\\n');
console.log('Three governance tools complete:');
console.log('  auditComponent()    — five systems simultaneously');
console.log('  auditInteraction()  — FSM, hit targets, focus, loading states');
console.log('  auditSystem()       — token compliance, naming, drift detection');
console.log('');
console.log('Lesson 9 → Accessibility Systems');
console.log('ARIA roles, semantic HTML, focus management, screen reader contracts.');`,
      outputHeight: 380,
    },
  ],
};

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export default {
  id: 'design-08-systems-design',
  slug: 'systems-design',
  chapter: 'design.1',
  order: 3,
  title: 'Systems Design',
  subtitle: 'Ten engineers, one consistent interface. Token governance, naming conventions, and the practices that prevent drift.',
  tags: [
    'css', 'design-tokens', 'governance', 'naming-conventions', 'drift',
    'documentation', 'conways-law', 'token-lifecycle', 'design-systems',
    'anti-patterns', 'ci', 'audit', 'component-api',
  ],
  hook: {
    question: 'Your design system was coherent six months ago. Now it has four button styles and three shades of blue. Nobody intended this. What happened?',
    realWorldContext:
      'Design drift is the default. Without governance mechanisms, every engineer makes locally correct decisions that are globally inconsistent. ' +
      'The solution is not stricter rules in a document — it\'s automated enforcement that makes the right thing easy and the wrong thing a build failure. ' +
      'Token naming, audit scripts, deprecation protocols, and component documentation are the engineering practices that turn a component collection into a design system.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'Entropy is the default. Systems drift without active governance. The question is not whether drift will happen, but when.',
      'Token naming: global semantic (--color-interactive) survives rebrands. Value names (--blue-500) don\'t. Component names (--btn-bg) don\'t scale.',
      'The lifecycle: create with a name that encodes function, deprecate with a replacement pointer, delete only after migration.',
      'Documentation is architecture. If you can\'t document a component\'s API, states, and usage constraints, it isn\'t designed yet.',
      'Conway\'s Law: the system will reflect the organisation. Build the organisation you want to produce the system you want.',
      'auditSystem() in CI: zero violations = the build passes. Drift becomes a build error, not a code review comment.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The Governance Rule',
        body: 'Rules that live only in a document are optional. Rules that break the build are mandatory. The governance gap between "style guide says X" and "CI enforces X" is where all drift lives.',
      },
      {
        type: 'important',
        title: 'SD-1: Never Create Token Synonyms',
        body: '--color-interactive and --color-brand cannot both exist with the same value. When engineers can\'t decide which to use, they use whichever they find first. The system now has two correct answers, which means neither is canonical.',
      },
      {
        type: 'tip',
        title: 'The Token Naming Test',
        body: 'Apply the rebrand test to every token name: if the brand colour changes from blue to teal, does the token name still make sense? --color-interactive: yes. --color-blue: no. --btn-background: no (tied to one component). Pass the test or rename.',
      },
      {
        type: 'warning',
        title: 'SD-4: The Version Cliff',
        body: 'Renaming 40 tokens in a breaking change forces every consumer to update simultaneously. Deprecate first (one major version). Provide a codemod. Delete in the next major version. The deprecation period is not optional — it\'s what separates a design system that teams trust from one they fear.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Design Systems — Lesson 8: Systems Design',
        props: { lesson: LESSON_DESIGN_08 },
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: {
    prose: [
      'Conway\'s Law (1967): "Organizations which design systems are constrained to produce designs which are copies of the communication structures of these organizations." This has been empirically validated in software systems repeatedly, most recently in Forsgren et al. (2018) where team structure was the strongest predictor of architectural modularity.',
      'Design drift compounds combinatorially: if N engineers each make one locally-correct but globally-inconsistent decision, the system has 2^N possible states. At N=10 decisions, 1024 possible combinations. Governance reduces this to a system with a single canonical state per decision.',
      'Token naming is a form of API design. The principle of "stable identifiers for stable meanings" (applicable to APIs generally) means that semantic names (function-based) are more stable than structural names (value-based) because semantic meanings change less often than implementation values. --color-interactive has had the same meaning for the entire life of a system, even through multiple brand colour changes.',
    ],
    callouts: [],
    visualizations: [],
  },
  examples: [],
  challenges: [],
  mentalModel: [
    'Drift is entropy. Governance is the work that fights entropy. Without active governance, every system drifts.',
    'Four naming patterns: value (bad), component (bad), global semantic (correct), tier+category+property (enterprise).',
    'Token lifecycle: create → use → deprecate (with replacement) → migrate → delete.',
    'Documentation dimensions: API surface, token map, state matrix, usage constraints, accessibility contract.',
    'Conway\'s Law: system structure mirrors team structure. Design the team to produce the system you want.',
    'Six anti-patterns: SD-1 synonym explosion, SD-2 undocumented exception, SD-3 living dead token, SD-4 version cliff, SD-5 component island, SD-6 copy-paste component.',
    'auditSystem() = automated drift detection. Zero violations = CI passes. Drift becomes a build error.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: '"Drift is entropy. Governance is the work that fights entropy." A design system has no review process — designers and engineers add tokens ad hoc. What eventually happens?',
      options: [
        'The system improves organically as contributors add what they need',
        'The token count expands without pruning, names conflict, and the system fractures into inconsistent micro-systems — each team drifts to its own conventions',
        'Performance degrades as token files grow larger',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '"Token lifecycle: create → use → deprecate (with replacement) → migrate → delete." Why must deprecated tokens include a replacement before removal?',
      options: [
        'Deprecated tokens without replacements require consumers to discover the correct alternative themselves — this causes stalled migrations and teams continuing to use the deprecated token indefinitely',
        'Build tools throw errors on deprecated tokens with no replacement',
        'Deprecated tokens cannot be compiled until a replacement exists',
      ],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '"Four naming patterns — global semantic (correct), tier+category+property (enterprise)." Why is a name like button-background-color (component) worse than color-surface-interactive (global semantic)?',
      options: [
        'Component names are longer and harder to type',
        'Component names cannot be reused — every new component needs its own token even when the role is identical, proliferating the token count',
        'Component names are not valid CSS custom property identifiers',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: '"Conway\'s Law: system structure mirrors team structure." A platform team owns tokens, a web team owns components, and a mobile team owns native implementations — all separately. What does Conway\'s Law predict about the resulting design system?',
      options: [
        'The three-team split will produce a unified cross-platform system with clear separation of concerns',
        'The system will fracture along team boundaries — token decisions will not match component needs, and mobile implementations will diverge from web',
        'Conway\'s Law only applies to software architecture, not design systems',
      ],
      correct: 1,
    },
  ],
};
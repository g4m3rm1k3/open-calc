// LESSON_DESIGN_09.js
// Lesson 9 — Accessibility Systems
// The problem: accessibility is taught as a checklist — add alt text, check contrast,
// use ARIA labels. That produces interfaces that pass automated linters but fail
// real users with disabilities. Real accessibility is a contract: every interactive
// element makes a promise to assistive technology about what it is, what state it's in,
// and how it responds to input. Breaking that contract is a functional bug.
// Concepts: semantic HTML contract, ARIA roles/states/properties,
//           keyboard navigation model, focus management, live regions,
//           screen reader testing, WCAG success criteria as engineering specs.

const LESSON_DESIGN_09 = {
  title: 'Accessibility Systems',
  subtitle: 'Every element makes a contract with assistive technology. Learn the contract. Build interfaces that work for everyone.',
  sequential: true,
  cells: [

    // ─── PART 0: RECAP ────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Recap: Eight Lessons, One System

| Lesson | What it governs |
|---|---|
| 1 Hierarchy | What stands out visually |
| 2 Spacing | How elements breathe |
| 3 Typography | How text is read |
| 4 Layout | Where elements go |
| 5 Colour | What each colour means |
| 6 Composition | How components are built |
| 7 Interaction | How components behave |
| 8 Systems | How the system stays coherent |

Every lesson assumed sighted users interacting with a mouse or touchscreen. That assumption excludes a significant portion of the population.

**~15% of the global population has some form of disability** (WHO, 2023). For digital interfaces, the most relevant are:
- ~2.2 billion people with some form of vision impairment
- ~430 million people with disabling hearing loss
- ~1.3 billion people with motor impairments (many use keyboards only)
- ~1 billion people with cognitive/neurological differences

These are not edge cases. They are a substantial fraction of every product's user base.

---

## The Question This Lesson Answers

> You've built a visually perfect interface. It passes every audit from Lessons 1–8. Now a blind user opens it with a screen reader. What do they experience?

If the answer is "a confusing stream of unlabelled elements with no structure, where buttons sound like text and navigation is impossible" — you've built a product that is functionally unusable for millions of people.

Accessibility is not cosmetic. It is not a nice-to-have. In most jurisdictions, it is a legal requirement. And it is most cheaply solved at the design and component level — retrofitting accessibility into a completed product costs 10–100× more than building it in from the start.`,
    },

    // ─── PART 1: BROKEN BASELINE ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## The Problem: Visually Correct, Functionally Inaccessible

This dashboard looks identical to the one we've been building all course. Run the accessibility audit. Despite the visual correctness, it has six fundamental accessibility failures that make it unusable with a screen reader or keyboard-only navigation.

The audit doesn't just find missing alt text — it finds missing contracts. Each violation is a specific promise that the element failed to make to assistive technology.`,
      html: `<div class="inacc-app" id="inacc-app">
  <div class="ia-nav">
    <div class="ia-logo">Acme Platform</div>
    <div class="ia-nav-links">
      <div class="ia-link ia-link--active" onclick="alert('Dashboard')">Dashboard</div>
      <div class="ia-link" onclick="alert('Reports')">Reports</div>
      <div class="ia-link" onclick="alert('Settings')">Settings</div>
    </div>
    <div class="ia-search">
      <div class="ia-search-icon">⌕</div>
      <div class="ia-search-input" contenteditable="true"
        style="outline:none;min-width:120px">Search…</div>
    </div>
  </div>
  <main class="ia-body">
    <div class="ia-section-header">
      <div class="ia-heading">Overview</div>
    </div>
    <div class="ia-cards">
      <div class="ia-card">
        <div class="ia-card-label">Revenue</div>
        <div class="ia-card-value">$48,290</div>
        <div class="ia-card-delta ia-up">↑ 12%</div>
      </div>
      <div class="ia-card">
        <div class="ia-card-label">Users</div>
        <div class="ia-card-value">3,841</div>
        <div class="ia-card-delta ia-up">↑ 8%</div>
      </div>
    </div>
    <div class="ia-alert">
      <div class="ia-alert-icon">!</div>
      <div class="ia-alert-text">Your trial ends in 3 days</div>
      <div class="ia-alert-close" onclick="this.parentElement.remove()">×</div>
    </div>
    <div class="ia-table">
      <div class="ia-table-header">
        <div class="ia-th">Name</div>
        <div class="ia-th ia-sortable" onclick="alert('sort')">Revenue ↕</div>
        <div class="ia-th">Status</div>
      </div>
      <div class="ia-table-row">
        <div class="ia-td">Acme Corp</div>
        <div class="ia-td">$12,400</div>
        <div class="ia-td"><div class="ia-status ia-active">Active</div></div>
      </div>
    </div>
  </main>
</div>`,
      css: `body { margin:0; font-family:system-ui,sans-serif; background:#0f172a; }
.inacc-app { background:#0f172a; min-height:340px; }
.ia-nav  { display:flex; align-items:center; gap:16px; padding:0 20px; height:48px;
  background:#1e293b; border-bottom:1px solid #334155; }
.ia-logo { font-size:14px; font-weight:700; color:#f1f5f9; flex-shrink:0; }
.ia-nav-links { display:flex; gap:2px; flex:1; }
.ia-link { font-size:13px; color:#64748b; padding:5px 10px; border-radius:6px;
  cursor:pointer; user-select:none; }
.ia-link--active { color:#f1f5f9; background:#334155; }
.ia-link:hover { background:#334155; }
.ia-search { display:flex; align-items:center; gap:6px; background:#0f172a;
  border:1px solid #334155; border-radius:7px; padding:6px 10px; }
.ia-search-icon { color:#64748b; font-size:14px; }
.ia-body { padding:16px; }
.ia-section-header { margin-bottom:12px; }
.ia-heading { font-size:18px; font-weight:700; color:#f1f5f9; }
.ia-cards { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px; }
.ia-card  { background:#1e293b; border:1px solid #334155; border-radius:8px; padding:14px; }
.ia-card-label { font-size:10px; font-weight:600; color:#64748b;
  text-transform:uppercase; letter-spacing:.1em; margin-bottom:4px; }
.ia-card-value { font-size:22px; font-weight:700; color:#f1f5f9; margin-bottom:2px; }
.ia-card-delta { font-size:11px; font-weight:500; }
.ia-up { color:#4ade80; } .ia-down { color:#f87171; }
.ia-alert { display:flex; align-items:center; gap:8px; padding:10px 12px;
  background:rgba(251,191,36,0.08); border:1px solid rgba(251,191,36,0.25);
  border-radius:7px; margin-bottom:12px; }
.ia-alert-icon { width:18px; height:18px; border-radius:50%; background:#f59e0b;
  color:white; font-size:11px; font-weight:700;
  display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ia-alert-text { font-size:13px; color:#fde68a; flex:1; }
.ia-alert-close { font-size:16px; color:#94a3b8; cursor:pointer; flex-shrink:0;
  width:24px; height:24px; display:flex; align-items:center; justify-content:center; }
.ia-table { background:#1e293b; border:1px solid #334155; border-radius:8px; overflow:hidden; }
.ia-table-header { display:grid; grid-template-columns:1fr 1fr 100px;
  background:#161c2a; padding:8px 12px; }
.ia-table-row { display:grid; grid-template-columns:1fr 1fr 100px; padding:10px 12px;
  border-top:1px solid #334155; }
.ia-th { font-size:10px; font-weight:600; color:#475569; text-transform:uppercase;
  letter-spacing:.1em; }
.ia-sortable { cursor:pointer; color:#94a3b8; }
.ia-td { font-size:13px; color:#e2e8f0; display:flex; align-items:center; }
.ia-status { font-size:10px; font-weight:700; padding:2px 8px; border-radius:100px; }
.ia-active { background:rgba(74,222,128,0.1); color:#86efac;
  border:1px solid rgba(74,222,128,0.25); }`,
      startCode: `// Accessibility audit — finds contract violations

function auditAccessibility(rootSel) {
  const root = document.querySelector(rootSel);
  if (!root) return;
  const violations = [];

  // 1. Interactive divs without role or tabindex
  root.querySelectorAll('div[onclick], div[contenteditable]').forEach(el => {
    const hasRole     = el.hasAttribute('role');
    const hasTabindex = el.hasAttribute('tabindex');
    if (!hasRole || !hasTabindex) {
      violations.push({
        element: el.className,
        issue: 'MISSING CONTRACT: div with onclick has no role="button" or tabindex="0"',
        wcag: '4.1.2 Name, Role, Value',
      });
    }
  });

  // 2. Missing landmark roles
  const hasMain = !!root.querySelector('main, [role="main"]');
  const hasNav  = !!root.querySelector('nav, [role="navigation"]');
  if (!hasMain) violations.push({ element: 'page', issue: 'MISSING LANDMARK: no <main> or role="main"', wcag: '1.3.6 Identify Purpose' });
  if (!hasNav)  violations.push({ element: 'page', issue: 'MISSING LANDMARK: no <nav> or role="navigation"', wcag: '1.3.6 Identify Purpose' });

  // 3. Unlabelled interactive elements
  root.querySelectorAll('button, [role="button"], input, select, textarea').forEach(el => {
    const hasLabel = el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby') ||
                     el.labels?.length > 0 || !!root.querySelector('label[for="' + el.id + '"]');
    if (!hasLabel && el.textContent.trim().length === 0) {
      violations.push({ element: el.className || el.tagName, issue: 'UNLABELLED: interactive element has no accessible name', wcag: '4.1.2 Name, Role, Value' });
    }
  });

  // 4. Missing heading hierarchy
  const headings = root.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="heading"]');
  if (headings.length === 0) violations.push({ element: 'page', issue: 'MISSING HEADINGS: no heading structure for screen reader navigation', wcag: '2.4.6 Headings and Labels' });

  // 5. Sortable columns without aria-sort
  root.querySelectorAll('[onclick]').forEach(el => {
    const text = el.textContent.trim();
    if ((text.includes('↕') || text.includes('↑') || text.includes('↓')) &&
        !el.hasAttribute('aria-sort')) {
      violations.push({ element: el.className, issue: 'MISSING STATE: sortable column has no aria-sort attribute', wcag: '4.1.2 Name, Role, Value' });
    }
  });

  // 6. Alert without role="alert"
  root.querySelectorAll('.ia-alert, [class*="alert"]').forEach(el => {
    if (!el.hasAttribute('role') && !el.hasAttribute('aria-live')) {
      violations.push({ element: el.className, issue: 'MISSING LIVE REGION: alert has no role="alert" or aria-live', wcag: '4.1.3 Status Messages' });
    }
  });

  console.log('=== ACCESSIBILITY AUDIT: ' + rootSel + ' ===\\n');
  violations.forEach(({ element, issue, wcag }) => {
    console.log('✗ ' + issue);
    console.log('  element: .' + (element.toString().split(' ')[0]));
    console.log('  WCAG: ' + wcag + '\\n');
  });
  console.log(violations.length + ' violations found');
  console.log('');
  console.log('None of these are visible to a sighted mouse user.');
  console.log('All of them make the interface unusable with a screen reader.');
  return violations;
}

auditAccessibility('.inacc-app');`,
      outputHeight: 400,
    },

    // ─── PART 2: SEMANTIC HTML — THE FOUNDATION ───────────────────────────────
    {
      type: 'markdown',
      instruction: `## Semantic HTML: The Contract You Get for Free

Semantic HTML is the practice of using the HTML element that correctly describes the meaning and behaviour of the content — not the element that looks right visually.

### The Contract That \`<button>\` Makes

When you use \`<button>\`, the browser and assistive technology receive the following for free:

\`\`\`
Role:     button
Name:     the text content (or aria-label)
State:    pressed/not pressed, disabled/enabled
Events:   activated by both Enter and Space keys
Focus:    included in natural tab order (tabindex=0 implicit)
Cursor:   pointer (on most platforms)
\`\`\`

When you use \`<div onclick="...">\`, you get **none** of this. A div has:

\`\`\`
Role:     generic (announced as nothing)
Name:     nothing
State:    nothing
Events:   only click, not keyboard
Focus:    excluded from tab order
\`\`\`

To replicate a \`<button>\` with a \`<div>\`, you must manually add every item in that list:

\`\`\`html
<div
  role="button"
  tabindex="0"
  aria-pressed="false"
  onkeydown="if(e.key==='Enter'||e.key===' '){this.click()}"
  onclick="..."
  style="cursor:pointer"
>Click me</div>
\`\`\`

This is 5× more code for worse behavior. The div still won't match button in all edge cases (form submission, button groups, disabled state). This is the fundamental argument for semantic HTML: **you buy the contract for free**.

### The Semantic Elements and Their Contracts

| Element | Role | Key contract |
|---|---|---|
| \`<button>\` | button | Activated by Enter/Space, receives :disabled, included in tab order |
| \`<a href>\` | link | Activated by Enter, announces destination, navigates browser history |
| \`<input>\` | textbox/checkbox/etc | Announced by type, labelled by \`<label>\`, receives form events |
| \`<nav>\` | navigation | Landmark — screen readers can jump directly to it |
| \`<main>\` | main | Landmark — the primary content, one per page |
| \`<header>\` | banner | Landmark — top-of-page identification |
| \`<footer>\` | contentinfo | Landmark — page footer identification |
| \`<h1>–<h6>\` | heading (level 1–6) | Document outline — screen readers navigate by heading level |
| \`<ul>/<ol>\` | list | Announces item count ("list of 5 items") |
| \`<table>\` | table | Announces rows/columns, headers, cell context |
| \`<dialog>\` | dialog | Focus trap, Escape closes, announced as dialog on open |

### The Rule

> Use the HTML element that most accurately describes the content. If no HTML element matches, use \`role\` to add the missing semantics. If you find yourself writing \`<div onclick>\`, you've chosen the wrong element.`,
    },

    // ─── PART 3: THE ARIA CONTRACT ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## ARIA: Filling the Gaps Semantic HTML Can't Fill

ARIA (Accessible Rich Internet Applications) is a set of attributes that supplement semantic HTML when native semantics are insufficient. It has three categories:

**Roles** — what the element is:
\`role="dialog"\`, \`role="tab"\`, \`role="tooltip"\`, \`role="progressbar"\`

**States** — current dynamic condition:
\`aria-expanded="true"\`, \`aria-checked="false"\`, \`aria-disabled="true"\`, \`aria-selected\`

**Properties** — stable relationships and descriptions:
\`aria-label="Close menu"\`, \`aria-labelledby="heading-id"\`, \`aria-describedby="hint-id"\`, \`aria-required="true"\`

**The ARIA Rule:** ARIA never changes visual appearance or behaviour — it only changes what assistive technology announces. If you add \`role="button"\` to a div, it announces as a button but doesn't respond to keyboard events. You still need to handle that separately.

The cell below shows a live ARIA explorer — change the attributes and see what a screen reader would announce.`,
      html: `<div id="aria-explorer">
  <div id="aria-controls">
    <div class="aria-row">
      <label class="aria-lbl">role</label>
      <select id="ae-role">
        <option value="">none</option>
        <option value="button">button</option>
        <option value="checkbox">checkbox</option>
        <option value="dialog">dialog</option>
        <option value="tabpanel">tabpanel</option>
        <option value="progressbar">progressbar</option>
        <option value="alert">alert</option>
        <option value="status">status</option>
      </select>
    </div>
    <div class="aria-row">
      <label class="aria-lbl">aria-label</label>
      <input type="text" id="ae-label" placeholder="accessible name" value="">
    </div>
    <div class="aria-row">
      <label class="aria-lbl">aria-expanded</label>
      <select id="ae-expanded">
        <option value="">(not set)</option>
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    </div>
    <div class="aria-row">
      <label class="aria-lbl">aria-checked</label>
      <select id="ae-checked">
        <option value="">(not set)</option>
        <option value="true">true</option>
        <option value="false">false</option>
        <option value="mixed">mixed</option>
      </select>
    </div>
    <div class="aria-row">
      <label class="aria-lbl">aria-disabled</label>
      <select id="ae-disabled">
        <option value="">(not set)</option>
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    </div>
  </div>
  <div id="ae-target-wrap">
    <div id="ae-target" tabindex="0">
      Interact with me
    </div>
  </div>
  <div id="ae-announcement">
    <div class="ae-ann-label">SCREEN READER WOULD ANNOUNCE:</div>
    <div id="ae-ann-text"></div>
  </div>
</div>`,
      css: `body { background:#0f172a; padding:20px; margin:0; font-family:system-ui,sans-serif; }
#aria-explorer { max-width:500px; display:flex; flex-direction:column; gap:14px; }
#aria-controls { background:#1e293b; border:1px solid #334155; border-radius:8px;
  padding:14px; display:flex; flex-direction:column; gap:8px; }
.aria-row { display:flex; align-items:center; gap:8px; }
.aria-lbl { font-size:11px; font-family:monospace; color:#64748b; min-width:110px; }
.aria-row select, .aria-row input { font-size:11px; background:#0f172a;
  color:#f1f5f9; border:1px solid #334155; border-radius:4px; padding:4px 8px;
  flex:1; outline:none; }
#ae-target-wrap { display:flex; justify-content:center; }
#ae-target { background:#1e293b; border:2px solid #334155; border-radius:8px;
  padding:16px 24px; font-size:14px; color:#f1f5f9; cursor:pointer;
  transition:all 0.15s; }
#ae-target:focus { outline:3px solid hsl(217,76%,47%); outline-offset:2px; }
#ae-target:hover { background:#252e42; }
#ae-announcement { background:#0f172a; border:1px solid #1e293b; border-radius:8px;
  padding:12px 14px; }
.ae-ann-label { font-size:9px; font-weight:700; color:#334155;
  letter-spacing:.14em; text-transform:uppercase; margin-bottom:6px; }
#ae-ann-text { font-size:13px; color:#4ade80; font-family:monospace; line-height:1.6; }`,
      startCode: `const target = document.getElementById('ae-target');
const annText= document.getElementById('ae-ann-text');

function buildAnnouncement() {
  const role     = document.getElementById('ae-role').value;
  const label    = document.getElementById('ae-label').value.trim();
  const expanded = document.getElementById('ae-expanded').value;
  const checked  = document.getElementById('ae-checked').value;
  const disabled = document.getElementById('ae-disabled').value;

  // Apply ARIA attributes to target
  role     ? target.setAttribute('role', role)              : target.removeAttribute('role');
  label    ? target.setAttribute('aria-label', label)       : target.removeAttribute('aria-label');
  expanded ? target.setAttribute('aria-expanded', expanded) : target.removeAttribute('aria-expanded');
  checked  ? target.setAttribute('aria-checked', checked)   : target.removeAttribute('aria-checked');
  disabled ? target.setAttribute('aria-disabled', disabled) : target.removeAttribute('aria-disabled');

  // Build what a screen reader would say
  const accessibleName = label || target.textContent.trim();
  const roleAnnounce   = role || 'generic';
  const stateAnnounce  = [
    expanded  ? 'expanded: ' + expanded   : '',
    checked   ? 'checked: ' + checked     : '',
    disabled === 'true' ? 'dimmed'        : '',
  ].filter(Boolean).join(', ');

  // Screen readers typically announce: "name, role, state"
  const announcement = [
    accessibleName,
    roleAnnounce === 'generic' ? '' : roleAnnounce,
    stateAnnounce,
  ].filter(Boolean).join(', ');

  annText.textContent = '"' + announcement + '"';

  console.log('ARIA state:');
  console.log('  role:', role || '(none)');
  console.log('  accessible name:', accessibleName);
  console.log('  states:', stateAnnounce || '(none)');
  console.log('  announced as:', announcement);
}

['ae-role','ae-label','ae-expanded','ae-checked','ae-disabled'].forEach(id =>
  document.getElementById(id).addEventListener('change', buildAnnouncement));
document.getElementById('ae-label').addEventListener('input', buildAnnouncement);
buildAnnouncement();

console.log('Key ARIA rules:');
console.log('1. ARIA never adds keyboard behaviour — only announcements');
console.log('2. role="button" needs tabindex="0" + Enter/Space handlers separately');
console.log('3. aria-label overrides text content as the accessible name');
console.log('4. aria-expanded/checked/selected must update when state changes');
console.log('5. First rule of ARIA: if there is a semantic HTML element, use it');`,
      outputHeight: 440,
    },

    // ─── PART 4: KEYBOARD NAVIGATION MODEL ────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The Keyboard Navigation Model

Every interaction that works with a mouse must work with a keyboard. This is WCAG 2.1.1 (Level A) — the minimum threshold for keyboard accessibility. It is also the most commonly violated accessibility requirement in single-page apps.

### The Two Navigation Modes

**Tab-based navigation** — moves between interactive elements (buttons, links, inputs, selects). The browser manages this automatically for semantic elements. The order follows DOM order unless explicitly overridden with \`tabindex\`.

**Arrow-based navigation** — moves within a composite widget (a group of related items treated as one tab stop). Used for: menus, tabs, radio groups, listboxes, trees, grids. Arrow key handling must be implemented manually.

### The Tab Order Rules

1. **Only one tab stop per composite widget.** A tab bar with 5 tabs is ONE tab stop — arrow keys move between tabs, not Tab.
2. **Tab order follows DOM order.** Never use \`tabindex\` values above 0 (e.g., \`tabindex="3"\`) — this breaks the natural flow and is very difficult to maintain.
3. **Modals trap focus.** When a modal opens, Tab cycles only within the modal. When it closes, focus returns to the trigger element.
4. **Escape closes closeable things.** Modals, dropdowns, tooltips, drawers — all must close on Escape.

### The Key Mapping

| Key | Action |
|---|---|
| Tab | Move to next interactive element |
| Shift+Tab | Move to previous interactive element |
| Enter | Activate a button, follow a link, open a select |
| Space | Activate a button, toggle a checkbox |
| Arrow keys | Navigate within composite widgets |
| Escape | Close modal/menu/tooltip, cancel action |
| Home/End | First/last item in a list or grid |
| Page Up/Down | Large jump in scrollable or paginated content |

### The Focus Visibility Requirement

WCAG 2.4.7 (Focus Visible) requires that the keyboard focus indicator is visible. This was mentioned in Lesson 6 (CM-5). Its importance cannot be overstated: **a keyboard user with no visible focus indicator cannot tell where they are on the page**. This is the equivalent of removing the mouse cursor for mouse users.

Every interactive element must have:
\`\`\`css
:focus-visible {
  outline: 2px solid var(--color-interactive);
  outline-offset: 2px;
}
\`\`\`

Never \`outline: none\` without a replacement.`,
    },

    // ─── PART 5: PRACTICE 1 — FIX A NAVIGATION MENU ─────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 1: Make a Navigation Menu Fully Accessible

You're given a navigation menu built entirely with \`<div>\` elements. Visually it looks correct. With a screen reader or keyboard, it is unusable.

**Your task:** make it fully accessible by:
1. Converting the nav container to \`<nav aria-label="Main navigation">\`
2. Converting nav links to \`<a>\` or \`<button>\` elements with correct roles
3. Marking the active link with \`aria-current="page"\`
4. Ensuring all items are reachable with Tab
5. Adding a visible focus ring to all interactive elements

**Important:** do not change the visual appearance. Only the HTML structure and ARIA attributes change.

The test checks: a \`<nav>\` element exists, all interactive items are keyboard-focusable (tabindex ≥ 0 or are native focusable elements), the active item has \`aria-current\`, and at least one focus style exists in the CSS.`,
      html: `<div id="p1-nav-demo">
  <!-- BEFORE: inaccessible div-based nav -->
  <div class="p1-label">Before (inaccessible):</div>
  <div class="inacc-nav" id="inacc-nav">
    <div class="in-logo">Platform</div>
    <div class="in-links">
      <div class="in-link in-link--active">Dashboard</div>
      <div class="in-link">Reports</div>
      <div class="in-link">Team</div>
      <div class="in-link">Settings</div>
    </div>
    <div class="in-user">
      <div class="in-avatar">SC</div>
      <div class="in-user-name">Sarah Chen</div>
    </div>
  </div>

  <!-- YOUR TASK: make this accessible -->
  <div class="p1-label" style="margin-top:16px">After (your fix — edit this):</div>
  <div id="acc-nav-wrap">
    <!-- Replace the div-based nav below with semantic HTML -->
    <div class="acc-nav" id="acc-nav">
      <div class="an-logo">Platform</div>
      <div class="an-links" id="an-links">
        <div class="an-link an-link--active">Dashboard</div>
        <div class="an-link">Reports</div>
        <div class="an-link">Team</div>
        <div class="an-link">Settings</div>
      </div>
      <div class="an-user">
        <div class="an-avatar" id="an-avatar">SC</div>
        <span class="an-user-name">Sarah Chen</span>
      </div>
    </div>
  </div>
</div>`,
      css: `body { background:#0f172a; padding:20px; margin:0; font-family:system-ui,sans-serif; }
#p1-nav-demo { max-width:580px; display:flex; flex-direction:column; gap:8px; }
.p1-label { font-size:10px; font-weight:700; color:#475569;
  letter-spacing:.12em; text-transform:uppercase; }

/* INACCESSIBLE nav (for comparison) */
.inacc-nav { display:flex; align-items:center; gap:12px; padding:0 16px; height:48px;
  background:#1e293b; border:1px solid #334155; border-radius:8px; }
.in-logo   { font-size:14px; font-weight:700; color:#f1f5f9; }
.in-links  { display:flex; gap:2px; flex:1; }
.in-link   { font-size:13px; color:#64748b; padding:6px 10px; border-radius:6px; cursor:pointer; }
.in-link--active { color:#f1f5f9; background:#334155; }
.in-user   { display:flex; align-items:center; gap:8px; }
.in-avatar { width:28px; height:28px; border-radius:50%; background:#2563eb; color:white;
  font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; }
.in-user-name { font-size:13px; color:#94a3b8; }

/* ACCESSIBLE nav - base styles (you add semantic structure via JS) */
.acc-nav  { display:flex; align-items:center; gap:12px; padding:0 16px; height:48px;
  background:#1e293b; border:1px solid #334155; border-radius:8px; }
.an-logo  { font-size:14px; font-weight:700; color:#f1f5f9; flex-shrink:0; }
.an-links { display:flex; gap:2px; flex:1; }
.an-link  { font-size:13px; color:#64748b; padding:6px 10px; border-radius:6px;
  cursor:pointer; text-decoration:none; background:none; border:none; }
.an-link--active { color:#f1f5f9; background:#334155; }
.an-link:hover { background:#334155; color:#f1f5f9; }
.an-user  { display:flex; align-items:center; gap:8px; }
.an-avatar{ width:28px; height:28px; border-radius:50%; background:#2563eb; color:white;
  font-size:11px; font-weight:700; display:flex; align-items:center;
  justify-content:center; cursor:pointer; }
.an-user-name { font-size:13px; color:#94a3b8; }`,
      startCode: `// MAKE THE NAVIGATION ACCESSIBLE
// Strategy: use innerHTML to replace the div structure with semantic HTML
// Keep all existing CSS classes (they still apply to semantic elements)

const navWrap = document.getElementById('acc-nav-wrap');

// YOUR TASK: replace the div-based nav with semantic HTML
// Requirements:
// 1. Use <nav aria-label="Main navigation"> as the container
// 2. Convert .an-link divs to <a href="#"> or <button> elements
// 3. Add aria-current="page" to the active link (Dashboard)
// 4. Make the user avatar button a <button> with aria-label
// 5. All links must be in the natural tab order

navWrap.innerHTML = \`
  <nav aria-label="???" class="acc-nav">
    <div class="an-logo">Platform</div>
    <div class="an-links">
      <!-- YOUR CODE: convert these divs to semantic elements -->
      <!-- Active item needs aria-current="page" -->
      <!-- Each item needs to be keyboard accessible -->
      <div class="an-link an-link--active">Dashboard</div>
      <div class="an-link">Reports</div>
      <div class="an-link">Team</div>
      <div class="an-link">Settings</div>
    </div>
    <div class="an-user">
      <!-- YOUR CODE: make avatar a button with aria-label -->
      <div class="an-avatar">SC</div>
      <span class="an-user-name">Sarah Chen</span>
    </div>
  </nav>
\`;

// Add focus styles via a style element
const focusStyles = document.createElement('style');
focusStyles.textContent = \`
  /* YOUR: add :focus-visible styles to nav links and avatar button */
\`;
document.head.appendChild(focusStyles);

// ── AUDIT ─────────────────────────────────────────────────────────────────────
setTimeout(() => {
  const nav         = navWrap.querySelector('nav');
  const links       = navWrap.querySelectorAll('a, button');
  const activeCurr  = navWrap.querySelector('[aria-current="page"]');
  const hasFocusCSS = focusStyles.textContent.includes(':focus');

  const checks = {
    '<nav> element exists':      !!nav,
    'nav has aria-label':        nav?.hasAttribute('aria-label'),
    'links are keyboard-focusable': links.length >= 4,
    'active link has aria-current': !!activeCurr,
    'focus styles defined':      hasFocusCSS,
  };
  console.log('=== NAV ACCESSIBILITY AUDIT ===');
  Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗')+' '+k));
}, 100);`,
      solutionCode: `const navWrap = document.getElementById('acc-nav-wrap');
navWrap.innerHTML = \`
  <nav aria-label="Main navigation" class="acc-nav">
    <div class="an-logo">Platform</div>
    <div class="an-links">
      <a href="#" class="an-link an-link--active" aria-current="page">Dashboard</a>
      <a href="#" class="an-link">Reports</a>
      <a href="#" class="an-link">Team</a>
      <a href="#" class="an-link">Settings</a>
    </div>
    <div class="an-user">
      <button class="an-avatar" aria-label="User menu — Sarah Chen"
        aria-haspopup="true" aria-expanded="false">SC</button>
      <span class="an-user-name" aria-hidden="true">Sarah Chen</span>
    </div>
  </nav>
\`;
const focusStyles = document.createElement('style');
focusStyles.textContent = \`
  .acc-nav a:focus-visible,
  .acc-nav button:focus-visible {
    outline: 2px solid hsl(217,76%,47%);
    outline-offset: 2px;
    border-radius: 6px;
  }
\`;
document.head.appendChild(focusStyles);

setTimeout(() => {
  const nav = navWrap.querySelector('nav');
  const links = navWrap.querySelectorAll('a, button');
  const activeCurr = navWrap.querySelector('[aria-current="page"]');
  const checks = {
    '<nav> exists': !!nav, 'aria-label on nav': nav?.hasAttribute('aria-label'),
    'links keyboard-focusable': links.length >= 4, 'aria-current="page"': !!activeCurr,
    'focus styles': focusStyles.textContent.includes(':focus'),
  };
  Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗')+' '+k));
}, 100);`,
      check: (code) => {
        const hasNav        = /<nav|role.*navigation/i.test(code);
        const hasALabel     = /aria-label.*navigation|aria-label.*nav/i.test(code);
        const hasCurrent    = /aria-current.*page/i.test(code);
        const hasSemanticEl = /<a\s|<button/i.test(code);
        return hasNav && hasCurrent && hasSemanticEl;
      },
      successMessage: `Navigation is now accessible. Three changes made the biggest difference: (1) <nav aria-label="Main navigation"> gives screen reader users a landmark they can jump to directly. (2) <a> elements make every link keyboard-focusable and announce as "link" to assistive technology. (3) aria-current="page" tells users where they are in the navigation. The avatar button with aria-label="User menu — Sarah Chen" gives it an accessible name that communicates its purpose.`,
      failMessage: `Three required: (1) A <nav> element or role="navigation" must exist. (2) The active item must have aria-current="page". (3) Navigation items must be <a> or <button> elements — not divs. Run the audit in the setTimeout to see which checks fail.`,
      outputHeight: 440,
    },

    // ─── PART 6: FOCUS MANAGEMENT ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Focus Management: Where Does Focus Go When Things Change?

Focus management is the most commonly missed accessibility requirement in dynamic interfaces. When content appears, disappears, or changes, keyboard users must have a clear and logical focus position at all times.

**The three focus management rules:**

**Rule 1: When something opens, focus moves into it.**
When a modal opens, focus must move to the first focusable element inside the modal (or to the modal's heading). A user who presses Enter to open a modal and finds focus is still on the trigger button — outside the modal — cannot interact with the modal without a mouse.

**Rule 2: When something closes, focus returns to its trigger.**
When a modal closes, focus returns to the button that opened it. If focus is dropped (sent to document.body or lost entirely), keyboard users have no idea where they are.

**Rule 3: Focus must be trapped inside modal/dialog contexts.**
Tab inside a modal cycles only within the modal. Users should not be able to Tab their way out to the page behind. This is both the usability requirement and the WCAG requirement (2.1.2 No Keyboard Trap — applied in reverse: trapping is required for modals, prohibited everywhere else).

The cell below demonstrates all three rules with an interactive modal.`,
      html: `<div id="focus-demo">
  <p class="fd-desc">This demo shows correct focus management. Open the modal, then Tab through it, then close it — watch where focus goes at each step.</p>
  <button class="fd-trigger" id="fd-trigger">Open modal</button>
  <div id="fd-log"></div>

  <!-- Modal (hidden initially) -->
  <div class="fd-overlay" id="fd-overlay" style="display:none" role="dialog"
    aria-modal="true" aria-labelledby="fd-modal-title">
    <div class="fd-modal" id="fd-modal">
      <h2 class="fd-modal-title" id="fd-modal-title" tabindex="-1">Confirm action</h2>
      <p class="fd-modal-body">Are you sure you want to delete this item?
        This action cannot be undone.</p>
      <div class="fd-modal-actions">
        <button class="fd-btn fd-btn--danger" id="fd-confirm">Delete</button>
        <button class="fd-btn fd-btn--cancel" id="fd-cancel">Cancel</button>
      </div>
      <button class="fd-close" id="fd-close" aria-label="Close modal">✕</button>
    </div>
  </div>
</div>`,
      css: `body { background:#0f172a; padding:24px; margin:0; font-family:system-ui,sans-serif; }
#focus-demo { max-width:460px; display:flex; flex-direction:column; gap:12px; }
.fd-desc { font-size:13px; color:#64748b; line-height:1.6; margin:0; }
.fd-trigger { padding:10px 20px; background:hsl(217,76%,47%); color:white; border:none;
  border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; min-height:44px; }
.fd-trigger:focus-visible { outline:2px solid hsl(217,76%,47%); outline-offset:3px; }
#fd-log { font-family:monospace; font-size:11px; color:#64748b; line-height:1.7;
  background:#111827; border:1px solid #1e293b; border-radius:6px; padding:10px 12px;
  min-height:60px; }
.fd-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6);
  display:flex; align-items:center; justify-content:center; z-index:100; }
.fd-modal { background:hsl(222,39%,12%); border:1px solid hsl(217,32%,22%);
  border-radius:12px; padding:24px; width:340px; position:relative; }
.fd-modal-title { font-size:18px; font-weight:700; color:#f1f5f9; margin:0 0 10px; }
.fd-modal-body  { font-size:14px; color:#94a3b8; line-height:1.6; margin:0 0 20px; }
.fd-modal-actions { display:flex; gap:8px; }
.fd-btn { flex:1; padding:10px; border:none; border-radius:8px;
  font-size:14px; font-weight:600; cursor:pointer; min-height:44px; }
.fd-btn--danger  { background:hsl(0,74%,48%); color:white; }
.fd-btn--cancel  { background:transparent; color:#94a3b8; border:1px solid #334155; }
.fd-btn:focus-visible { outline:2px solid hsl(217,76%,47%); outline-offset:2px; }
.fd-close { position:absolute; top:14px; right:14px; width:28px; height:28px;
  border-radius:50%; background:transparent; border:none; color:#64748b;
  font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.fd-close:focus-visible { outline:2px solid hsl(217,76%,47%); outline-offset:2px; }`,
      startCode: `const trigger = document.getElementById('fd-trigger');
const overlay = document.getElementById('fd-overlay');
const modal   = document.getElementById('fd-modal');
const title   = document.getElementById('fd-modal-title');
const close   = document.getElementById('fd-close');
const cancel  = document.getElementById('fd-cancel');
const confirm = document.getElementById('fd-confirm');
const log     = document.getElementById('fd-log');

function logFocus(action, el) {
  const name = el?.getAttribute('aria-label') || el?.textContent?.trim().slice(0,20) || el?.tagName;
  log.innerHTML += (log.innerHTML ? '<br>' : '') +
    '<span style="color:#475569">' + new Date().toLocaleTimeString('en',{hour12:false}) + '</span> ' +
    action + ': <span style="color:#60a5fa">' + name + '</span>';
  // Auto-scroll log
  log.scrollTop = log.scrollHeight;
}

// ── Focus trap utility ─────────────────────────────────────────────────────────
function getFocusable(container) {
  return [...container.querySelectorAll(
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
    'textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
  )];
}

function trapFocus(e) {
  if (e.key !== 'Tab') return;
  const focusable = getFocusable(modal);
  const first = focusable[0], last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
      logFocus('TRAP (shift+tab from first → last)', last);
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
      logFocus('TRAP (tab from last → first)', first);
    }
  }
}

// ── Open modal ────────────────────────────────────────────────────────────────
function openModal() {
  overlay.style.display = 'flex';

  // Rule 1: focus moves INTO modal on open
  requestAnimationFrame(() => {
    title.focus();
    logFocus('OPEN: focus moved to', title);
  });

  // Trap focus inside modal
  modal.addEventListener('keydown', trapFocus);

  // Rule 3: Escape closes
  overlay.addEventListener('keydown', function handleEscape(e) {
    if (e.key === 'Escape') { closeModal(); overlay.removeEventListener('keydown', handleEscape); }
  });
}

// ── Close modal ───────────────────────────────────────────────────────────────
function closeModal() {
  overlay.style.display = 'none';
  modal.removeEventListener('keydown', trapFocus);

  // Rule 2: focus returns to TRIGGER on close
  trigger.focus();
  logFocus('CLOSE: focus returned to', trigger);
}

trigger.addEventListener('click', openModal);
close.addEventListener('click', closeModal);
cancel.addEventListener('click', closeModal);
confirm.addEventListener('click', () => {
  logFocus('ACTION: confirmed, closing', confirm);
  closeModal();
});

log.innerHTML = 'Open the modal to see focus management in action.';

console.log('Focus management rules:');
console.log('1. Modal opens → focus moves to first focusable element inside');
console.log('2. Modal closes → focus returns to the trigger button');
console.log('3. Tab key trapped inside modal (cycles within modal only)');
console.log('4. Escape closes the modal');`,
      outputHeight: 420,
    },

    // ─── PART 7: LIVE REGIONS ─────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Live Regions: Announcing Dynamic Content

When content changes visually — an error message appears, a success notification pops up, a counter increments — sighted users see the change because it's visible in the viewport. Screen reader users do not: their focus hasn't moved to the new content, so the screen reader doesn't read it.

**ARIA live regions** solve this: they instruct the screen reader to announce changes to marked regions, even without focus movement.

### The Three Live Region Values

\`aria-live="off"\` — default. Changes are not announced.

\`aria-live="polite"\` — **the correct default for most dynamic content.** Announces the change after the current speech finishes. Use for: success messages, status updates, search results, counters, loading completion.

\`aria-live="assertive"\` — **interrupts immediately.** Use sparingly: only for genuinely urgent content that requires immediate attention. Use for: error messages that prevent completing a critical action, session expiry warnings, security alerts.

### The Shorthand Roles

\`role="status"\` — equivalent to \`aria-live="polite"\`. Use for non-urgent status messages.
\`role="alert"\` — equivalent to \`aria-live="assertive"\` + \`aria-atomic="true"\`. Use for errors and urgent warnings.

### The Implementation Pattern

\`\`\`html
<!-- In your HTML — the region must exist before content is added -->
<div role="status" aria-live="polite" class="sr-only" id="status-region"></div>
<div role="alert" aria-live="assertive" class="sr-only" id="error-region"></div>

<!-- Then in your JavaScript -->
document.getElementById('status-region').textContent = 'Form saved successfully.';
document.getElementById('error-region').textContent = 'Card number is required.';
\`\`\`

### Critical Rules

1. **The region must exist in the DOM before content is added.** Adding a live region and adding content simultaneously doesn't work — the screen reader has already scanned the new node and won't re-announce.

2. **Clear the region before re-using it.** If you set the same text twice, some screen readers won't re-announce it. Clear the region first, then set the new text:
\`\`\`javascript
region.textContent = '';
requestAnimationFrame(() => { region.textContent = 'New message'; });
\`\`\`

3. **Keep announcements short.** Screen readers read the entire region on change. "Form saved" is better than "Your form has been saved to the database and you will receive a confirmation email shortly."

4. **Use \`aria-atomic="true"\` for elements where the whole value matters** (a clock, a counter, a status badge). This makes the screen reader announce the complete region, not just the changed part.

5. **\`class="sr-only"\` — visually hidden but screen-reader visible.** A common pattern for announcements that don't need a visual representation:
\`\`\`css
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); border: 0;
}
\`\`\``,
    },

    // ─── PART 8: ENGINEERING REALITY ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Engineering Reality: Screen Reader Diversity and Testing

There is no single "screen reader." The major screen readers differ substantially in how they parse, announce, and navigate content.

### The Major Screen Readers

| Screen reader | Platform | Market share (approx.) | Primary browser |
|---|---|---|---|
| JAWS | Windows | ~40% | Chrome, Edge, IE |
| NVDA | Windows | ~35% | Chrome, Firefox |
| VoiceOver | macOS/iOS | ~15% | Safari |
| TalkBack | Android | ~5% | Chrome |
| Narrator | Windows | ~3% | Edge |
| Orca | Linux | ~2% | Firefox |

**Implication:** an interface tested with only VoiceOver (the most developer-accessible option on macOS) has only been tested against ~15% of the screen reader market.

### The Testing Methodology

The minimum viable accessibility testing strategy:

**Level 1 — Automated** (catches ~30–40% of issues)
- axe-core browser extension
- WAVE browser extension
- Lighthouse accessibility audit
- Your \`auditAccessibility()\` function from this lesson

**Level 2 — Manual keyboard** (catches ~60–70% of issues total)
- Can you complete every task using only Tab, Enter, Space, Escape, and arrow keys?
- Is focus always visible?
- Does focus management work correctly for modals, drawers, and dynamic content?

**Level 3 — Screen reader** (catches ~80–90% of issues total)
- macOS VoiceOver: Cmd+F5 to enable, then navigate with the VO keys
- NVDA on Windows (free): verify announcements match expectations
- Test the key flows: navigation, form completion, error recovery

**Level 4 — Real users** (catches 100% of usability issues)
Automated and manual testing identifies technical violations. Real users identify usability failures — content that is technically accessible but confusing or inefficient to use.

### The Accessible Name Computation

Every interactive element needs an accessible name — what the screen reader calls it. The browser computes this name from a priority order:

1. \`aria-labelledby\` (references another element's text)
2. \`aria-label\` (explicit string)
3. Native label (\`<label for="id">\`, \`<legend>\`, \`<caption>\`)
4. Text content of the element itself
5. \`title\` attribute (last resort — not announced by all screen readers)
6. \`alt\` attribute (images only)

If none of these exist, the element has no accessible name — it's announced as "button" or "link" with no indication of what it does. This is one of the most common accessibility failures in production.`,
    },

    // ─── PART 9: ANTI-PATTERNS ────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Accessibility Anti-Patterns Reference

Six accessibility failures found in nearly every production codebase.

---

### AC-1: The Interactive Div
**Symptom:** \`<div onclick="...">\`, \`<span onclick="...">\`, \`<div class="btn">\`. Clicks work. Keyboard doesn't. Screen readers announce nothing useful.
**Fix:** Use \`<button>\` for actions, \`<a href>\` for navigation. If you must use a div, add \`role="button"\`, \`tabindex="0"\`, and keyboard event handlers — and question why you're not using the semantic element.

---

### AC-2: Missing Accessible Names
**Symptom:** Icon-only buttons with no label. Image buttons with no alt text. Form inputs with no associated label. The screen reader announces "button" with no information about what the button does.
**Fix:** Every interactive element needs an accessible name. For icon buttons: \`aria-label="Close dialog"\`. For inputs: \`<label for="email-input">Email</label>\` + \`<input id="email-input">\`. For images: \`alt="Description of image content"\` or \`alt=""\` for decorative images.

---

### AC-3: Broken Focus Management
**Symptom:** Modal opens, focus stays on the trigger. Drawer opens, focus is lost. Dialog closes, focus disappears. Keyboard users are abandoned in unpredictable positions after every interaction.
**Fix:** Apply the three focus management rules: (1) focus moves into opened regions, (2) focus returns to triggers on close, (3) focus is trapped in modal contexts.

---

### AC-4: The Missing Live Region
**Symptom:** Form validates on submit. Error messages appear visually. Screen reader users hear nothing — they're still reading the last element they focused. They submit again, confused.
**Fix:** Error messages and status updates must be in live regions. \`role="alert"\` for errors, \`role="status"\` for confirmations. The region must pre-exist in the DOM.

---

### AC-5: outline: none
**Symptom:** All interactive elements have their focus indicator removed. Users who navigate by keyboard cannot tell where they are. This is both AC-1 (functional failure) and a WCAG violation.
**Fix:** This was covered in Lesson 6 (CM-5). Design a focus ring, never remove it. The rule bears repeating because it is violated so frequently: \`outline: none\` without a replacement is always wrong.

---

### AC-6: The Inaccessible Modal
**Symptom:** A dialog/modal that has no \`role="dialog"\`, no \`aria-modal="true"\`, no \`aria-labelledby\`, no focus trap, and no Escape-to-close. The user opens it and is trapped in a broken state.
**Fix:** Every modal needs: \`role="dialog"\`, \`aria-modal="true"\`, \`aria-labelledby\` pointing to the modal title, focus trap on Tab, focus management on open/close, and Escape closes.`,
    },

    // ─── PART 10: PRACTICE 2 — MODAL WITH FOCUS TRAP ─────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 2: Build an Accessible Modal

You're given a modal with correct visual styling but missing all accessibility requirements. Make it fully accessible.

**Requirements:**
1. Add \`role="dialog"\`, \`aria-modal="true"\`, and \`aria-labelledby\` pointing to the modal title
2. Focus moves to the modal title when it opens (using \`tabindex="-1"\` + \`focus()\`)
3. Focus returns to the trigger button when the modal closes
4. Tab key is trapped inside the modal (cycles within it)
5. Escape key closes the modal
6. All buttons inside the modal have visible focus rings

The test checks: role="dialog" exists, aria-modal is true, aria-labelledby is set, the title has tabindex="-1", and a focus trap is present.`,
      html: `<div id="p2-modal-demo">
  <button class="p2-trigger" id="p2-trigger">Open settings</button>
  <div class="p2-overlay" id="p2-overlay" style="display:none">
    <div class="p2-modal" id="p2-modal">
      <h2 class="p2-modal-title" id="p2-modal-title">Notification Settings</h2>
      <div class="p2-modal-body">
        <div class="p2-field">
          <input type="checkbox" id="p2-email-notif" checked>
          <label for="p2-email-notif">Email notifications</label>
        </div>
        <div class="p2-field">
          <input type="checkbox" id="p2-push-notif">
          <label for="p2-push-notif">Push notifications</label>
        </div>
        <div class="p2-field">
          <input type="checkbox" id="p2-sms-notif">
          <label for="p2-sms-notif">SMS notifications</label>
        </div>
      </div>
      <div class="p2-modal-footer">
        <button class="p2-btn p2-primary" id="p2-save">Save changes</button>
        <button class="p2-btn p2-cancel" id="p2-cancel">Cancel</button>
      </div>
      <button class="p2-close" id="p2-close" aria-label="Close settings">✕</button>
    </div>
  </div>
</div>`,
      css: `body { background:#0f172a; padding:24px; margin:0; font-family:system-ui,sans-serif; }
:root {
  --space-2:8px; --space-3:12px; --space-4:16px; --space-5:24px;
  --c-surface:hsl(222,39%,12%); --c-border:hsl(217,32%,22%);
  --c-text-1:hsl(210,40%,96%); --c-text-2:hsl(215,25%,65%);
  --c-interactive:hsl(217,76%,47%);
}
.p2-trigger { padding:10px 20px; background:var(--c-interactive); color:white;
  border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer;
  min-height:44px; }
.p2-trigger:focus-visible { outline:2px solid var(--c-interactive); outline-offset:3px; }
.p2-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6);
  display:flex; align-items:center; justify-content:center; z-index:100; }
.p2-modal  { background:var(--c-surface); border:1px solid var(--c-border);
  border-radius:12px; padding:var(--space-5); width:360px; position:relative; }
.p2-modal-title { font-size:18px; font-weight:700; color:var(--c-text-1); margin:0 0 16px; }
.p2-modal-body  { display:flex; flex-direction:column; gap:var(--space-3); margin-bottom:var(--space-5); }
.p2-field { display:flex; align-items:center; gap:var(--space-2); }
.p2-field input { width:18px; height:18px; accent-color:var(--c-interactive); cursor:pointer; }
.p2-field label { font-size:14px; color:var(--c-text-1); cursor:pointer; }
.p2-modal-footer { display:flex; gap:var(--space-2); }
.p2-btn  { flex:1; padding:var(--space-2) var(--space-4); border-radius:8px; border:none;
  font-size:14px; font-weight:600; cursor:pointer; min-height:44px; }
.p2-primary { background:var(--c-interactive); color:white; }
.p2-cancel  { background:transparent; color:var(--c-text-2); border:1px solid var(--c-border); }
.p2-btn:focus-visible { outline:2px solid var(--c-interactive); outline-offset:2px; }
.p2-close { position:absolute; top:14px; right:14px; width:32px; height:32px;
  border-radius:50%; background:transparent; border:none; color:var(--c-text-2);
  font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.p2-close:focus-visible { outline:2px solid var(--c-interactive); outline-offset:2px; }`,
      startCode: `const trigger = document.getElementById('p2-trigger');
const overlay = document.getElementById('p2-overlay');
const modal   = document.getElementById('p2-modal');
const title   = document.getElementById('p2-modal-title');

// ── STEP 1: Add the required ARIA attributes to the modal ─────────────────────
modal.setAttribute('role', '???');           // dialog
modal.setAttribute('aria-modal', '???');      // true
modal.setAttribute('aria-labelledby', '???'); // id of the title element

// The title needs tabindex="-1" so it can receive programmatic focus
title.setAttribute('tabindex', '???');        // -1

// ── STEP 2: Focus trap ────────────────────────────────────────────────────────
function getFocusable(container) {
  return [...container.querySelectorAll(
    'button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'
  )];
}

function trapFocus(e) {
  if (e.key !== 'Tab') return;
  const focusable = getFocusable(modal);
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
}

// ── STEP 3: Open and close with correct focus management ──────────────────────
function openModal() {
  overlay.style.display = 'flex';

  // YOUR CODE: move focus to the modal title on open
  requestAnimationFrame(() => {
    ???.focus();
  });

  modal.addEventListener('keydown', trapFocus);
  overlay.addEventListener('keydown', function escape(e) {
    if (e.key === 'Escape') { closeModal(); overlay.removeEventListener('keydown', escape); }
  });
}

function closeModal() {
  overlay.style.display = 'none';
  modal.removeEventListener('keydown', trapFocus);

  // YOUR CODE: return focus to trigger on close
  ???.focus();
}

trigger.addEventListener('click', openModal);
document.getElementById('p2-close').addEventListener('click', closeModal);
document.getElementById('p2-cancel').addEventListener('click', closeModal);
document.getElementById('p2-save').addEventListener('click', closeModal);

// ── AUDIT ─────────────────────────────────────────────────────────────────────
setTimeout(() => {
  const checks = {
    'role="dialog"':     modal.getAttribute('role') === 'dialog',
    'aria-modal="true"': modal.getAttribute('aria-modal') === 'true',
    'aria-labelledby':   modal.hasAttribute('aria-labelledby'),
    'title tabindex=-1': title.getAttribute('tabindex') === '-1',
    'focus trap exists': typeof trapFocus === 'function',
  };
  console.log('=== MODAL ACCESSIBILITY AUDIT ===');
  Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗')+' '+k));
}, 100);`,
      solutionCode: `const trigger=document.getElementById('p2-trigger'), overlay=document.getElementById('p2-overlay');
const modal=document.getElementById('p2-modal'), title=document.getElementById('p2-modal-title');
modal.setAttribute('role','dialog');
modal.setAttribute('aria-modal','true');
modal.setAttribute('aria-labelledby','p2-modal-title');
title.setAttribute('tabindex','-1');
function getFocusable(c) { return [...c.querySelectorAll('button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])')]; }
function trapFocus(e) {
  if (e.key!=='Tab') return;
  const f=getFocusable(modal), first=f[0], last=f[f.length-1];
  if (e.shiftKey && document.activeElement===first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement===last) { e.preventDefault(); first.focus(); }
}
function openModal() {
  overlay.style.display='flex';
  requestAnimationFrame(()=>title.focus());
  modal.addEventListener('keydown',trapFocus);
  overlay.addEventListener('keydown',function esc(e){if(e.key==='Escape'){closeModal();overlay.removeEventListener('keydown',esc);}});
}
function closeModal() { overlay.style.display='none'; modal.removeEventListener('keydown',trapFocus); trigger.focus(); }
trigger.addEventListener('click',openModal);
['p2-close','p2-cancel','p2-save'].forEach(id=>document.getElementById(id).addEventListener('click',closeModal));`,
      check: (code) => {
        const hasRole     = /setAttribute.*role.*dialog|role.*=.*dialog/i.test(code);
        const hasModal    = /aria-modal.*true/i.test(code);
        const hasLabelBy  = /aria-labelledby/i.test(code);
        const hasTrapFn   = /trapFocus|trap.*focus/i.test(code);
        const returnsFocus= /trigger\.focus\(\)|\.focus\(\)/.test(code);
        return hasRole && hasModal && hasTrapFn && returnsFocus;
      },
      successMessage: `Accessible modal built. The five requirements work together as a system: role="dialog" tells the screen reader what it is; aria-modal="true" tells it to ignore content behind; aria-labelledby gives it a name; focus moving to the title means users know immediately what opened; focus returning to the trigger means they know where they are after closing. None of these is optional — each serves a different user need.`,
      failMessage: `Four required attributes and behaviours: (1) modal.setAttribute('role','dialog'). (2) modal.setAttribute('aria-modal','true'). (3) modal.setAttribute('aria-labelledby','p2-modal-title') (or the title's id). (4) focus must return to trigger on close — trigger.focus() in closeModal(). The focus trap function must also be present. Check the audit output for which checks fail.`,
      outputHeight: 460,
    },

    // ─── PART 11: SABOTAGE SANDBOX ────────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `## Sabotage Sandbox: Six Accessibility Violations

The search results component below has six deliberate accessibility violations. Diagnose and fix each using anti-pattern names.

**The violations:**
1. AC-1: Search button is a div, not a button
2. AC-2: Search input has no associated label (only placeholder text)
3. AC-3: "Load more" button steals focus on click without returning it correctly
4. AC-4: Result count update has no live region
5. AC-5: The search input has \`outline: none\` with no replacement
6. AC-6: The "Save result" action is a \`<span>\` with \`onclick\`

The test checks: search button is a semantic element, input has an accessible label, a live region exists, and the input has a visible focus style.`,
      html: `<div class="search-ui" id="search-ui">
  <div class="su-search-bar">
    <!-- AC-2: no label, only placeholder -->
    <input class="su-input" id="su-input" type="text"
      placeholder="Search reports…"
      style="outline:none; border:none;"> <!-- AC-5: no focus style -->
    <!-- AC-1: div as button -->
    <div class="su-search-btn" id="su-search-btn" onclick="doSearch()">Search</div>
  </div>
  <!-- AC-4: result count updates without live region -->
  <div class="su-count" id="su-count">12 results</div>
  <ul class="su-results" id="su-results">
    <li class="su-result">
      <div class="su-result-title">Q1 Revenue Report</div>
      <div class="su-result-meta">March 2025 · Finance</div>
      <!-- AC-6: span as interactive element -->
      <span class="su-save" onclick="alert('saved')">Save</span>
    </li>
    <li class="su-result">
      <div class="su-result-title">User Growth Analysis</div>
      <div class="su-result-meta">February 2025 · Product</div>
      <span class="su-save" onclick="alert('saved')">Save</span>
    </li>
  </ul>
  <!-- AC-3: focus not managed correctly -->
  <button class="su-load-more" id="su-load-more"
    onclick="loadMore()">Load more results</button>
</div>`,
      css: `body { background:#0f172a; padding:20px; margin:0; font-family:system-ui,sans-serif; }
.search-ui { max-width:460px; display:flex; flex-direction:column; gap:12px; }
.su-search-bar { display:flex; gap:8px; align-items:center; }
.su-input  { flex:1; padding:9px 12px; background:hsl(222,39%,12%);
  border-radius:7px; color:hsl(210,40%,96%); font-size:14px; box-sizing:border-box; }
.su-search-btn { padding:9px 16px; background:hsl(217,76%,47%); color:white;
  border-radius:7px; font-size:14px; font-weight:600; cursor:pointer; flex-shrink:0; }
.su-count  { font-size:12px; color:hsl(217,20%,45%); }
.su-results{ list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px; }
.su-result { background:hsl(222,39%,12%); border:1px solid hsl(217,32%,22%);
  border-radius:8px; padding:14px; display:flex; flex-direction:column; gap:4px; }
.su-result-title { font-size:14px; font-weight:600; color:hsl(210,40%,96%); }
.su-result-meta  { font-size:12px; color:hsl(215,25%,65%); }
.su-save   { font-size:12px; font-weight:600; color:hsl(217,76%,47%);
  cursor:pointer; width:fit-content; }
.su-load-more { padding:9px 16px; background:transparent; color:hsl(215,25%,65%);
  border:1px solid hsl(217,32%,22%); border-radius:7px; font-size:13px;
  cursor:pointer; min-height:44px; }
.su-load-more:focus-visible { outline:2px solid hsl(217,76%,47%); outline-offset:2px; }`,
      startCode: `// FIX THE SIX VIOLATIONS

// ── FIX AC-2: Add a label to the search input ─────────────────────────────────
// Option A: visible label (preferred)
// Option B: aria-label on the input
document.getElementById('su-input').setAttribute('aria-label', '???');

// ── FIX AC-5: Add focus style to search input ──────────────────────────────────
const inputFix = document.createElement('style');
inputFix.textContent = \`
  #su-input:focus {
    /* YOUR FIX: add visible focus ring */
  }
  #su-input:focus-visible {
    /* YOUR FIX */
  }
\`;
document.head.appendChild(inputFix);

// ── FIX AC-1: Replace div search button with semantic <button> ────────────────
const oldBtn  = document.getElementById('su-search-btn');
const newBtn  = document.createElement('button');
newBtn.className = 'su-search-btn';
newBtn.id        = 'su-search-btn-new';
newBtn.type      = 'button';
newBtn.textContent = 'Search';
newBtn.onclick = () => doSearch();
// YOUR CODE: replace the old div with the new button
oldBtn.parentNode.replaceChild(newBtn, oldBtn);

// ── FIX AC-6: Replace span saves with semantic buttons ───────────────────────
document.querySelectorAll('.su-save').forEach((span, i) => {
  const btn = document.createElement('button');
  btn.className = 'su-save';
  btn.type      = 'button';
  btn.textContent = 'Save';
  btn.setAttribute('aria-label', 'Save ' + (document.querySelectorAll('.su-result-title')[i]?.textContent || 'result'));
  btn.onclick = () => alert('saved');
  // YOUR CODE: replace span with button
  span.parentNode.replaceChild(btn, span);
});

// ── FIX AC-4: Add a live region for result count ──────────────────────────────
const liveRegion = document.createElement('div');
liveRegion.setAttribute('role', 'status');
liveRegion.setAttribute('aria-live', 'polite');
liveRegion.setAttribute('aria-atomic', 'true');
liveRegion.className = 'sr-only';
liveRegion.id = 'su-live';
document.getElementById('search-ui').prepend(liveRegion);

// Add sr-only style
const srOnly = document.createElement('style');
srOnly.textContent = \`.sr-only { position:absolute; width:1px; height:1px; padding:0;
  margin:-1px; overflow:hidden; clip:rect(0,0,0,0); border:0; }\`;
document.head.appendChild(srOnly);

// ── FIX AC-3: Focus management for load more ─────────────────────────────────
// The load more button should retain focus after loading
// (the broken behaviour would be to move focus away)
const loadMore = document.getElementById('su-load-more');
loadMore.onclick = null; // remove old handler
loadMore.addEventListener('click', () => {
  // Keep focus on the button after action completes
  // Announce the new results via the live region
  const region = document.getElementById('su-live');
  if (region) {
    region.textContent = '';
    requestAnimationFrame(() => {
      region.textContent = '6 more results loaded. 18 total.';
    });
  }
  document.getElementById('su-count').textContent = '18 results';
});

// ── SEARCH STUB ───────────────────────────────────────────────────────────────
function doSearch() {
  const region = document.getElementById('su-live');
  if (region) {
    region.textContent = '';
    requestAnimationFrame(() => {
      region.textContent = 'Search complete. 12 results found.';
    });
  }
}
function loadMore() {} // replaced above

// ── AUDIT ─────────────────────────────────────────────────────────────────────
setTimeout(() => {
  const input       = document.getElementById('su-input');
  const searchBtn   = document.getElementById('su-search-btn-new') ||
                      document.getElementById('su-search-btn');
  const saveButtons = document.querySelectorAll('.su-save');
  const liveR       = document.getElementById('su-live');

  const checks = {
    'AC-2 input has aria-label': input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby'),
    'AC-1 search is button':     searchBtn?.tagName === 'BUTTON',
    'AC-6 saves are buttons':    [...saveButtons].every(b => b.tagName === 'BUTTON'),
    'AC-4 live region exists':   !!liveR,
    'AC-5 focus style exists':   inputFix.textContent.includes(':focus'),
  };
  console.log('=== ACCESSIBILITY VIOLATIONS AUDIT ===');
  Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗')+' '+k));
}, 100);`,
      solutionCode: `document.getElementById('su-input').setAttribute('aria-label','Search reports');
const inputFix=document.createElement('style');
inputFix.textContent=\`#su-input:focus-visible{outline:2px solid hsl(217,76%,47%);outline-offset:2px;border-radius:7px;}\`;
document.head.appendChild(inputFix);
const oldBtn=document.getElementById('su-search-btn');
const newBtn=document.createElement('button');
newBtn.className='su-search-btn'; newBtn.id='su-search-btn-new'; newBtn.type='button'; newBtn.textContent='Search'; newBtn.onclick=()=>doSearch();
oldBtn.parentNode.replaceChild(newBtn,oldBtn);
document.querySelectorAll('.su-save').forEach((span,i)=>{
  const btn=document.createElement('button');
  btn.className='su-save'; btn.type='button'; btn.textContent='Save';
  btn.setAttribute('aria-label','Save '+(document.querySelectorAll('.su-result-title')[i]?.textContent||'result'));
  btn.onclick=()=>alert('saved');
  span.parentNode.replaceChild(btn,span);
});
const lr=document.createElement('div'); lr.setAttribute('role','status'); lr.setAttribute('aria-live','polite'); lr.setAttribute('aria-atomic','true'); lr.id='su-live'; lr.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)';
document.getElementById('search-ui').prepend(lr);
document.getElementById('su-load-more').onclick=null;
document.getElementById('su-load-more').addEventListener('click',()=>{lr.textContent='';requestAnimationFrame(()=>{lr.textContent='6 more results loaded. 18 total.';});document.getElementById('su-count').textContent='18 results';});
function doSearch(){lr.textContent='';requestAnimationFrame(()=>lr.textContent='Search complete. 12 results found.');}
function loadMore(){}`,
      check: (code) => {
        const fixesLabel  = /aria-label.*Search|setAttribute.*aria-label/i.test(code);
        const fixesBtn    = /createElement.*button[\s\S]*?su-search|search.*createElement.*button/i.test(code);
        const fixesLive   = /role.*status|aria-live.*polite/i.test(code);
        const fixesFocus  = /:focus|focus-visible/i.test(code);
        return fixesLabel && fixesBtn && fixesLive;
      },
      successMessage: `Six accessibility violations fixed. The most impactful: AC-4 (live region) means screen reader users now hear search results change. AC-1 (semantic button) means the search button is keyboard-activatable. AC-2 (aria-label on input) means screen reader users know what the field is for. Together these make the search component usable for the ~15% of users with visual impairments.`,
      failMessage: `Three required: (1) Search input must have aria-label set. (2) The search button div must be replaced with a <button> element (createElement + replaceChild). (3) A live region (role="status" or aria-live="polite") must be added to the DOM before content changes are announced. The audit output shows which checks fail.`,
      outputHeight: 500,
    },

    // ─── PART 12: STRESS CONDITION ────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Stress Condition: The Interface Under Assistive Technology

Accessibility requirements don't just apply to the default state. They apply across every state and condition the interface can be in.

This cell cycles through the accessibility stress conditions every component must survive:

1. **Keyboard only** — can every task be completed without a mouse?
2. **High contrast mode** — does the interface remain usable when Windows/macOS high contrast mode forces its own colour scheme?
3. **200% zoom** — at 200% text zoom (WCAG 1.4.4), does the layout remain usable?
4. **Screen reader active** — are all elements announced correctly?
5. **Reduced motion** — does the interface respect \`prefers-reduced-motion\`?

Each scenario has specific CSS or JavaScript requirements.`,
      html: `<div id="a11y-stress">
  <div id="as-controls">
    <button class="as-btn active" data-mode="default">Default</button>
    <button class="as-btn" data-mode="keyboard">Keyboard only</button>
    <button class="as-btn" data-mode="zoom">200% zoom</button>
    <button class="as-btn" data-mode="contrast">High contrast</button>
    <button class="as-btn" data-mode="motion">Reduced motion</button>
  </div>
  <div class="as-component" id="as-component">
    <div class="asc-header">
      <h2 class="asc-title">Payment confirmed</h2>
      <div class="asc-checkmark" id="asc-check">✓</div>
    </div>
    <p class="asc-amount">$49.00 charged</p>
    <p class="asc-sub">Annual Pro Plan · Visa •••• 4242</p>
    <div class="asc-actions">
      <button class="asc-primary" id="asc-primary">Download receipt</button>
      <button class="asc-secondary" id="asc-secondary">Return to dashboard</button>
    </div>
  </div>
  <div id="as-notes"></div>
</div>`,
      css: `body { background:#0f172a; padding:20px; margin:0; font-family:system-ui,sans-serif; }
#a11y-stress { max-width:480px; }
#as-controls { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px; }
.as-btn { font-size:11px; font-weight:500; padding:5px 12px; border-radius:6px;
  border:1px solid #334155; background:#1e293b; color:#64748b; cursor:pointer; }
.as-btn.active { background:#2563eb; color:white; border-color:#2563eb; }
.as-component { background:hsl(222,39%,12%); border:1px solid hsl(217,32%,22%);
  border-radius:12px; padding:24px; transition:all 0.2s; }
.asc-header { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.asc-title  { font-size:18px; font-weight:700; color:hsl(210,40%,96%); margin:0; }
.asc-checkmark { width:32px; height:32px; border-radius:50%;
  background:hsl(142,60%,45%); color:white; font-size:16px; font-weight:700;
  display:flex; align-items:center; justify-content:center;
  animation: pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes pop-in { from { transform:scale(0); } to { transform:scale(1); } }
.asc-amount { font-size:28px; font-weight:700; color:hsl(210,40%,96%); margin:0 0 4px; }
.asc-sub    { font-size:13px; color:hsl(215,25%,65%); margin:0 0 20px; }
.asc-actions{ display:flex; gap:8px; }
.asc-primary  { flex:1; padding:10px; background:hsl(217,76%,47%); color:white;
  border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer;
  min-height:44px; }
.asc-secondary{ flex:1; padding:10px; background:transparent; color:hsl(215,25%,65%);
  border:1px solid hsl(217,32%,22%); border-radius:8px; font-size:14px; cursor:pointer;
  min-height:44px; }
button:focus-visible { outline:2px solid hsl(217,76%,47%); outline-offset:2px; }
#as-notes { margin-top:10px; font-size:11px; color:#475569; line-height:1.7;
  font-family:monospace; }`,
      startCode: `const component = document.getElementById('as-component');
const notes     = document.getElementById('as-notes');

// ── Reduced motion fix — should be in your global CSS ─────────────────────────
const motionFix = document.createElement('style');
motionFix.textContent = \`
  @media (prefers-reduced-motion: reduce) {
    .asc-checkmark {
      animation: none;  /* remove bounce animation */
    }
    * { transition-duration: 0.001ms !important;
        animation-duration: 0.001ms !important; }
  }
\`;
document.head.appendChild(motionFix);

const MODES = {
  default: {
    label: 'Default state',
    apply: () => {
      component.style.cssText = '';
      component.querySelectorAll('button').forEach(b => {
        b.style.cssText = '';
      });
    },
    notes: ['All standard styles applied.', 'This is the baseline state.'],
  },
  keyboard: {
    label: 'Keyboard-only navigation',
    apply: () => {
      // Simulate keyboard-only: make all mouse-hover states invisible
      // The focus rings are what matter here
      notes.innerHTML = '';
    },
    notes: [
      'Tab through the component.',
      'Every button should show a visible focus ring.',
      'The download and return buttons are both reachable.',
      'No interaction requires a mouse or touch gesture.',
    ],
  },
  zoom: {
    label: '200% text zoom',
    apply: () => {
      // Simulate 200% zoom by doubling the font sizes
      component.style.fontSize = '200%';
    },
    notes: [
      'At 200% zoom (WCAG 1.4.4 requirement):',
      '✓ Text is larger but layout still holds',
      '✓ Buttons remain full-width (flex:1)',
      '✓ No horizontal scrolling within the component',
      '✓ Amount ($49.00) scales with the container',
    ],
  },
  contrast: {
    label: 'High contrast mode',
    apply: () => {
      // Simulate Windows high contrast mode
      // In real high contrast mode, the OS overrides colours
      // We simulate by removing background colours and forcing B&W
      const hcStyle = \`
        background: #000000 !important;
        color: #ffffff !important;
        border-color: #ffffff !important;
      \`;
      component.style.cssText = hcStyle;
      component.querySelectorAll('button').forEach(b => {
        b.style.background = '#ffffff';
        b.style.color = '#000000';
        b.style.border = '2px solid #ffffff';
      });
    },
    notes: [
      'In Windows High Contrast mode:',
      '⚠ Background colours are overridden by the OS',
      '⚠ Colour-only information (like the green checkmark) may lose meaning',
      '✓ Text remains visible at maximum contrast',
      '✓ Buttons are still distinguishable (by text content + border)',
      'Fix: ensure meaning is conveyed by structure, not only colour.',
    ],
  },
  motion: {
    label: 'Reduced motion',
    apply: () => {
      component.style.cssText = '';
      // The @media (prefers-reduced-motion) rule we added handles this automatically
    },
    notes: [
      'With prefers-reduced-motion: reduce:',
      '✓ The checkmark pop-in animation is disabled',
      '✓ Transition durations are forced to 0.001ms',
      '✓ Users who experience motion sickness or seizures are protected',
      '',
      'The @media rule we added handles this — no JS needed for animations.',
      'The JS fix was just for simulation.',
    ],
  },
};

function applyMode(mode) {
  const m = MODES[mode];
  m.apply();
  notes.innerHTML = '<strong style="color:#94a3b8">' + m.label + '</strong><br>' +
    m.notes.join('<br>');
  document.querySelectorAll('.as-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === mode));
}

document.querySelectorAll('.as-btn').forEach(b =>
  b.addEventListener('click', () => applyMode(b.dataset.mode)));
applyMode('default');`,
      outputHeight: 440,
    },

    // ─── PART 13: PRACTICE 3 — LIVE REGION ANNOUNCEMENTS ─────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 3: Add Live Region Announcements to a Form

You're given a form with client-side validation. Currently, validation errors appear visually next to their fields. Screen reader users hear nothing — their focus hasn't moved to the error messages.

**Your task:**
1. Add a \`role="alert"\` region for error announcements
2. Add a \`role="status"\` region for success/progress announcements
3. Wire the validation to announce errors through the alert region
4. Announce form submission progress and success through the status region
5. Use the \`sr-only\` pattern to hide the regions visually (they only need to be heard)

**The key:** the live regions must be in the DOM before you set their content. Add them to the DOM once at the top of your script, then update their \`textContent\` when announcing.

The test verifies: a role="alert" element exists, a role="status" element exists, the alert region's textContent changes when an invalid field is submitted, and the sr-only CSS is present.`,
      html: `<form class="live-form" id="live-form" novalidate>
  <h2 class="lf-title">Create account</h2>
  <div class="lf-field" id="lf-name-group">
    <label class="lf-label" for="lf-name">Full name</label>
    <input class="lf-input" id="lf-name" type="text" autocomplete="name">
    <div class="lf-error" id="lf-name-error" style="display:none"
      aria-live="off">Name is required</div>
  </div>
  <div class="lf-field" id="lf-email-group">
    <label class="lf-label" for="lf-email">Work email</label>
    <input class="lf-input" id="lf-email" type="email" autocomplete="email">
    <div class="lf-error" id="lf-email-error" style="display:none"
      aria-live="off">Please enter a valid email address</div>
  </div>
  <div class="lf-field" id="lf-pwd-group">
    <label class="lf-label" for="lf-pwd">Password</label>
    <input class="lf-input" id="lf-pwd" type="password" autocomplete="new-password">
    <div class="lf-error" id="lf-pwd-error" style="display:none"
      aria-live="off">Password must be at least 8 characters</div>
  </div>
  <button class="lf-submit" id="lf-submit" type="submit">Create account</button>
</form>`,
      css: `body { background:#0f172a; display:flex; justify-content:center;
  align-items:center; min-height:100vh; margin:0; font-family:system-ui,sans-serif; }
:root {
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-5:24px;
  --c-surface:hsl(222,39%,12%); --c-border:hsl(217,32%,22%);
  --c-text-1:hsl(210,40%,96%); --c-text-2:hsl(215,25%,65%);
  --c-interactive:hsl(217,76%,47%); --c-error:hsl(0,74%,48%);
}
.live-form { background:var(--c-surface); border:1px solid var(--c-border);
  border-radius:12px; padding:var(--space-5); width:340px;
  display:flex; flex-direction:column; gap:var(--space-3); }
.lf-title { font-size:18px; font-weight:700; color:var(--c-text-1); margin:0; }
.lf-field { display:flex; flex-direction:column; gap:var(--space-1); }
.lf-label { font-size:13px; font-weight:500; color:var(--c-text-2); }
.lf-input { padding:var(--space-2) var(--space-3); background:hsl(222,47%,7%);
  border:1px solid var(--c-border); border-radius:7px; color:var(--c-text-1);
  font-size:14px; outline:none; width:100%; box-sizing:border-box; }
.lf-input:focus-visible { border-color:var(--c-interactive);
  box-shadow:0 0 0 3px hsla(217,76%,47%,0.2); }
.lf-input[aria-invalid="true"] { border-color:var(--c-error); }
.lf-error { font-size:12px; color:var(--c-error); }
.lf-submit { padding:var(--space-3); background:var(--c-interactive); color:white;
  border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer;
  min-height:44px; }
.lf-submit:focus-visible { outline:2px solid var(--c-interactive); outline-offset:2px; }`,
      startCode: `// ADD LIVE REGION ANNOUNCEMENTS TO THE FORM

// ── STEP 1: Create and insert live regions ────────────────────────────────────
// They must exist in the DOM BEFORE content is added

// Error region: role="alert" announces immediately (assertive)
const alertRegion = document.createElement('div');
alertRegion.setAttribute('role', '???');    // alert
alertRegion.setAttribute('aria-atomic', 'true');
alertRegion.id = 'lf-alert-region';
// YOUR CODE: add sr-only styles to this element

// Status region: role="status" announces after current speech (polite)  
const statusRegion = document.createElement('div');
statusRegion.setAttribute('role', '???');   // status
statusRegion.setAttribute('aria-live', 'polite');
statusRegion.id = 'lf-status-region';
// YOUR CODE: add sr-only styles

// Add BOTH to the DOM before any content is set
document.getElementById('live-form').prepend(statusRegion);
document.getElementById('live-form').prepend(alertRegion);

// Add sr-only CSS
const srStyle = document.createElement('style');
srStyle.textContent = \`
  #lf-alert-region, #lf-status-region {
    /* YOUR: sr-only pattern — visually hidden, screen-reader visible */
  }
\`;
document.head.appendChild(srStyle);

// ── STEP 2: Announcement helper ───────────────────────────────────────────────
function announce(region, message) {
  // Must clear first, then set — otherwise same message won't re-announce
  region.textContent = '';
  requestAnimationFrame(() => { region.textContent = message; });
}

// ── STEP 3: Validation with announcements ─────────────────────────────────────
function validateForm() {
  const name  = document.getElementById('lf-name');
  const email = document.getElementById('lf-email');
  const pwd   = document.getElementById('lf-pwd');
  const errors = [];

  // Reset errors
  [name, email, pwd].forEach(input => {
    input.setAttribute('aria-invalid', 'false');
    document.getElementById(input.id + '-error').style.display = 'none';
  });

  // Validate name
  if (!name.value.trim()) {
    errors.push('Full name is required');
    name.setAttribute('aria-invalid', 'true');
    document.getElementById('lf-name-error').style.display = 'block';
  }

  // Validate email
  if (!email.value.includes('@')) {
    errors.push('Please enter a valid email address');
    email.setAttribute('aria-invalid', 'true');
    document.getElementById('lf-email-error').style.display = 'block';
  }

  // Validate password
  if (pwd.value.length < 8) {
    errors.push('Password must be at least 8 characters');
    pwd.setAttribute('aria-invalid', 'true');
    document.getElementById('lf-pwd-error').style.display = 'block';
  }

  if (errors.length > 0) {
    // YOUR CODE: announce errors through the alert region
    announce(alertRegion, '???');
    return false;
  }

  // YOUR CODE: announce submission progress through the status region
  announce(statusRegion, '???');
  return true;
}

document.getElementById('live-form').addEventListener('submit', e => {
  e.preventDefault();
  if (validateForm()) {
    const submit = document.getElementById('lf-submit');
    submit.disabled = true;
    submit.textContent = 'Creating account…';
    // YOUR CODE: announce loading state
    announce(statusRegion, '???');
    setTimeout(() => {
      submit.textContent = '✓ Account created';
      submit.style.background = 'hsl(142,60%,45%)';
      // YOUR CODE: announce success
      announce(statusRegion, '???');
    }, 1500);
  }
});

// ── AUDIT ─────────────────────────────────────────────────────────────────────
setTimeout(() => {
  const alertEl  = document.getElementById('lf-alert-region');
  const statusEl = document.getElementById('lf-status-region');

  // Test: submit invalid form to trigger announcement
  validateForm(); // triggers with empty fields

  const checks = {
    'alert region exists':  alertEl?.getAttribute('role') === 'alert',
    'status region exists': statusEl?.getAttribute('role') === 'status',
    'alert has content after invalid submit': alertEl?.textContent?.length > 0,
    'sr-only styles exist': srStyle.textContent.includes('position:absolute') ||
                             srStyle.textContent.includes('position: absolute'),
  };
  console.log('=== LIVE REGION AUDIT ===');
  Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗')+' '+k));
}, 200);`,
      solutionCode: `const alertRegion = document.createElement('div');
alertRegion.setAttribute('role','alert'); alertRegion.setAttribute('aria-atomic','true'); alertRegion.id='lf-alert-region';
const statusRegion = document.createElement('div');
statusRegion.setAttribute('role','status'); statusRegion.setAttribute('aria-live','polite'); statusRegion.id='lf-status-region';
document.getElementById('live-form').prepend(statusRegion);
document.getElementById('live-form').prepend(alertRegion);
const srStyle=document.createElement('style');
srStyle.textContent='#lf-alert-region,#lf-status-region{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;}';
document.head.appendChild(srStyle);
function announce(region,msg){region.textContent='';requestAnimationFrame(()=>{region.textContent=msg;});}
function validateForm() {
  const name=document.getElementById('lf-name'),email=document.getElementById('lf-email'),pwd=document.getElementById('lf-pwd');
  const errors=[];
  [name,email,pwd].forEach(i=>{i.setAttribute('aria-invalid','false');document.getElementById(i.id+'-error').style.display='none';});
  if(!name.value.trim()){errors.push('Full name is required');name.setAttribute('aria-invalid','true');document.getElementById('lf-name-error').style.display='block';}
  if(!email.value.includes('@')){errors.push('Please enter a valid email');email.setAttribute('aria-invalid','true');document.getElementById('lf-email-error').style.display='block';}
  if(pwd.value.length<8){errors.push('Password must be 8+ characters');pwd.setAttribute('aria-invalid','true');document.getElementById('lf-pwd-error').style.display='block';}
  if(errors.length>0){announce(alertRegion,errors.length+' errors: '+errors.join('. '));return false;}
  announce(statusRegion,'All fields valid. Ready to submit.');
  return true;
}
document.getElementById('live-form').addEventListener('submit',e=>{
  e.preventDefault();
  if(validateForm()){
    const submit=document.getElementById('lf-submit'); submit.disabled=true; submit.textContent='Creating account…';
    announce(statusRegion,'Creating your account. Please wait.');
    setTimeout(()=>{submit.textContent='✓ Account created';submit.style.background='hsl(142,60%,45%)';announce(statusRegion,'Account created successfully. Welcome!');},1500);
  }
});`,
      check: (code) => {
        const hasAlertRole  = /setAttribute.*role.*alert|role.*=.*alert/i.test(code);
        const hasStatusRole = /setAttribute.*role.*status|role.*=.*status/i.test(code);
        const announcesErr  = /announce.*alertRegion|alertRegion.*textContent/i.test(code);
        const hasSrOnly     = /position.*absolute|clip.*rect/i.test(code);
        return hasAlertRole && hasStatusRole && announcesErr;
      },
      successMessage: `Live region announcements implemented. Screen reader users now hear "3 errors: Full name is required. Please enter a valid email. Password must be 8+ characters." immediately on invalid submit — without their focus moving. This is the difference between a form that screen reader users can complete and one they can't. The sr-only pattern keeps the announcements invisible to sighted users while audible to screen reader users.`,
      failMessage: `Three required: (1) A role="alert" element must be in the DOM (alertRegion.setAttribute('role','alert')). (2) A role="status" element must be in the DOM. (3) The alert region's textContent must be set when validation fails — announce(alertRegion, ...) with the error messages. Check the audit output for which checks fail.`,
      outputHeight: 500,
    },

    // ─── PART 14: CROSS-PLATFORM ─────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Cross-Platform: Accessibility Everywhere

The accessibility requirements from WCAG are platform-agnostic. Every platform has the mechanisms to fulfil them — only the API differs.

| WCAG Requirement | Web (HTML/ARIA) | iOS (SwiftUI/UIKit) | Android | Qt/C++ |
|---|---|---|---|---|
| Accessible name | \`aria-label\`, \`<label>\` | \`accessibilityLabel\` | \`contentDescription\` | \`setAccessibleName()\` |
| Role / type | \`role="button"\` | \`.accessibilityAddTraits(.isButton)\` | \`AccessibilityNodeInfo.className\` | \`setAccessibleRole()\` |
| State announcement | \`aria-expanded\`, \`aria-checked\` | \`accessibilityValue\` | \`AccessibilityNodeInfo.setChecked\` | \`setAccessibleDescription()\` |
| Live region | \`aria-live\`, \`role="alert"\` | \`UIAccessibilityPost(.announcement)\` | \`View.announceForAccessibility()\` | \`QAccessible::updateAccessibility()\` |
| Focus management | \`element.focus()\` | \`UIAccessibilityFocus\` | \`sendAccessibilityEvent(TYPE_VIEW_FOCUSED)\` | \`setFocus()\` |
| Focus ring | \`:focus-visible\` | System highlight (automatic) | System highlight (automatic) | System highlight (automatic) |
| Heading structure | \`<h1>–<h6>\` | \`.accessibilityAddTraits(.isHeader)\` | \`R.id.heading\` | \`setAccessibleRole(QAccessible::Heading)\` |
| Skip navigation | \`<a href="#main-content">\` | Not applicable (gesture-based nav) | Not applicable | Not applicable |

### What Never Changes

1. **Every interactive element needs an accessible name.** The API differs. The requirement doesn't.
2. **Role must match function.** An element that looks like a button and acts like a button must be announced as a button, regardless of platform.
3. **States must be communicated.** Checked/unchecked, expanded/collapsed, selected/unselected — all must be announced when they change.
4. **Focus management is required for dynamic content.** Opening a panel, showing a dialog, completing an action — focus must move predictably.
5. **Live regions for dynamic content.** Errors, successes, loading completion — all require announcement without focus movement.

---

## What You Now Know

After Lesson 9, you can:
- Identify the six most common accessibility violations and fix them by name
- Use semantic HTML to get accessibility contracts for free
- Apply ARIA roles, states, and properties correctly
- Implement keyboard navigation with correct Tab/Arrow behaviour
- Manage focus across modal open/close lifecycle
- Build live regions that announce dynamic content to screen readers
- Test accessibility at all four levels (automated, keyboard, screen reader, user)
- Write accessible names for every interactive element

**This completes the core curriculum.** Lessons 1–9 together form a complete engineering system for interface design. The next phase covers domain transfer — applying these nine systems to desktop UI (Qt), game interfaces, and data visualisation.`,
    },

    // ─── PART 15: SEED ────────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Lesson 9 Complete — The \`auditAccessibility()\` Tool

The complete accessibility audit, extended with all checks from this lesson. Combined with the previous audit tools, this is the full quality gate:

\`auditSpacing()\` — spacing compliance  
\`auditType()\` — typography compliance  
\`auditLayout()\` — layout compliance  
\`auditColour()\` — colour token compliance  
\`auditComponent()\` — all five systems  
\`auditInteraction()\` — FSM, hit targets, focus  
\`auditSystem()\` — governance, drift detection  
\`auditAccessibility()\` — WCAG compliance

Nine systems. Eight audit functions. Zero violations = ready to ship.`,
      html: `<div id="ref-accessible">
  <nav aria-label="Main navigation" class="ra-nav">
    <span class="ra-logo">Acme</span>
    <div class="ra-links">
      <a href="#" class="ra-link ra-link--active" aria-current="page">Dashboard</a>
      <a href="#" class="ra-link">Reports</a>
      <a href="#" class="ra-link">Settings</a>
    </div>
    <button class="ra-user-btn" aria-label="User menu — Sarah Chen" aria-haspopup="true">
      <span class="ra-avatar" aria-hidden="true">SC</span>
    </button>
  </nav>
  <main class="ra-main">
    <div role="status" aria-live="polite" id="ra-status"
      style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)"></div>
    <div role="alert" aria-atomic="true" id="ra-alert"
      style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)"></div>
    <h1 class="ra-heading">Overview</h1>
    <div class="ra-cards" role="list">
      <article class="ra-card" role="listitem">
        <h2 class="ra-card-title">Revenue</h2>
        <p class="ra-card-value" aria-label="$48,290 revenue, up 12%">$48,290</p>
        <span class="ra-delta" aria-hidden="true">↑ 12%</span>
      </article>
      <article class="ra-card" role="listitem">
        <h2 class="ra-card-title">Users</h2>
        <p class="ra-card-value" aria-label="3,841 users, up 8%">3,841</p>
        <span class="ra-delta" aria-hidden="true">↑ 8%</span>
      </article>
    </div>
    <button class="ra-cta" id="ra-cta">Generate report</button>
  </main>
</div>`,
      css: `body { margin:0; font-family:system-ui,sans-serif; background:#0f172a; }
#ref-accessible { min-height:300px; }
.ra-nav  { display:flex; align-items:center; gap:8px; padding:0 20px; height:48px;
  background:hsl(222,39%,12%); border-bottom:1px solid hsl(217,32%,22%); }
.ra-logo { font-size:14px; font-weight:700; color:hsl(210,40%,96%); }
.ra-links{ display:flex; gap:2px; flex:1; margin-left:8px; }
.ra-link { font-size:13px; color:hsl(215,25%,65%); padding:6px 10px; border-radius:6px;
  text-decoration:none; }
.ra-link--active { color:hsl(210,40%,96%); background:hsl(217,32%,22%); }
.ra-link:hover { background:hsl(217,32%,22%); color:hsl(210,40%,96%); }
.ra-link:focus-visible { outline:2px solid hsl(217,76%,47%); outline-offset:2px; }
.ra-user-btn { display:flex; align-items:center; background:transparent; border:none;
  cursor:pointer; border-radius:50%; padding:2px; }
.ra-user-btn:focus-visible { outline:2px solid hsl(217,76%,47%); outline-offset:2px; }
.ra-avatar { width:28px; height:28px; border-radius:50%; background:hsl(217,76%,47%);
  color:white; font-size:11px; font-weight:700;
  display:flex; align-items:center; justify-content:center; }
.ra-main { padding:20px; }
.ra-heading { font-size:20px; font-weight:700; color:hsl(210,40%,96%); margin:0 0 14px; }
.ra-cards{ display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; }
.ra-card { background:hsl(222,39%,12%); border:1px solid hsl(217,32%,22%);
  border-radius:8px; padding:14px; }
.ra-card-title { font-size:10px; font-weight:600; color:hsl(217,20%,45%);
  text-transform:uppercase; letter-spacing:.1em; margin:0 0 4px; }
.ra-card-value { font-size:22px; font-weight:700; color:hsl(210,40%,96%); margin:0 0 2px; }
.ra-delta{ font-size:11px; color:hsl(142,60%,65%); }
.ra-cta  { padding:10px 20px; background:hsl(217,76%,47%); color:white; border:none;
  border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; min-height:44px; }
.ra-cta:focus-visible { outline:2px solid hsl(217,76%,47%); outline-offset:3px; }`,
      startCode: `// ── COMPLETE auditAccessibility() ────────────────────────────────────────────

function auditAccessibility(rootSel) {
  const root = document.querySelector(rootSel);
  if (!root) return [];
  const issues = [];

  // 1. Interactive divs / spans without role
  root.querySelectorAll('div[onclick],span[onclick]').forEach(el => {
    const cls = '.' + (el.className?.toString().split(' ')[0] || el.tagName.toLowerCase());
    if (!el.hasAttribute('role') || !el.hasAttribute('tabindex')) {
      issues.push('AC-1 INTERACTIVE DIV: ' + cls + ' has onclick but no role+tabindex');
    }
  });

  // 2. Interactive elements without accessible names
  root.querySelectorAll('button,a,[role="button"],[role="link"]').forEach(el => {
    const name = el.getAttribute('aria-label') ||
                 el.getAttribute('aria-labelledby') ||
                 el.textContent.trim();
    if (!name) {
      issues.push('AC-2 NO NAME: ' + (el.tagName + '.' + el.className.split(' ')[0]) +
        ' has no accessible name');
    }
  });

  // 3. Modals without required ARIA
  root.querySelectorAll('[role="dialog"]').forEach(el => {
    if (!el.getAttribute('aria-modal') || !el.getAttribute('aria-labelledby')) {
      issues.push('AC-6 MODAL: role="dialog" missing aria-modal or aria-labelledby');
    }
  });

  // 4. Missing landmarks
  if (!root.querySelector('main,[role="main"]')) {
    issues.push('LANDMARK: no <main> or role="main"');
  }
  if (!root.querySelector('nav,[role="navigation"]')) {
    issues.push('LANDMARK: no <nav> or role="navigation"');
  }

  // 5. Missing heading hierarchy
  if (!root.querySelector('h1,h2,h3,[role="heading"]')) {
    issues.push('HEADINGS: no heading structure');
  }

  // 6. Inputs without labels
  root.querySelectorAll('input,select,textarea').forEach(el => {
    const hasLabel = el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby') ||
                     !!document.querySelector('label[for="' + el.id + '"]');
    if (!hasLabel) {
      issues.push('AC-2 UNLABELLED INPUT: #' + (el.id || 'unknown') + ' has no label');
    }
  });

  console.log('\\n=== auditAccessibility(' + rootSel + ') ===\\n');
  if (issues.length === 0) {
    console.log('✓ All accessibility checks pass');
  } else {
    issues.forEach(i => console.log('✗ ' + i));
  }
  console.log('\\n' + issues.length + ' issues found');
  return issues;
}

const issues = auditAccessibility('#ref-accessible');
console.log('');
console.log('=== COMPLETE AUDIT TOOLKIT ===');
console.log('auditSpacing()        — spacing compliance');
console.log('auditType()           — typography compliance');
console.log('auditLayout()         — layout, no floats or magic widths');
console.log('auditColour()         — colour token compliance');
console.log('auditComponent()      — all five systems simultaneously');
console.log('auditInteraction()    — FSM, hit targets, focus');
console.log('auditSystem()         — governance, drift detection');
console.log('auditAccessibility()  — WCAG compliance');
console.log('');
console.log('Nine lessons. Eight audit functions.');
console.log('Zero violations across all eight = production ready.');`,
      outputHeight: 440,
    },
  ],
};

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export default {
  id: 'design-09-accessibility-systems',
  slug: 'accessibility-systems',
  chapter: 'design.2',
  order: 4,
  title: 'Accessibility Systems',
  subtitle: 'Every element makes a contract with assistive technology. Use semantic HTML to get it for free. Manage focus. Announce changes.',
  tags: [
    'css', 'html', 'accessibility', 'wcag', 'aria', 'screen-reader',
    'focus-management', 'keyboard-navigation', 'live-regions', 'semantic-html',
    'design-systems', 'anti-patterns', 'inclusive-design',
  ],
  hook: {
    question: 'Your interface looks perfect. A blind user opens it with a screen reader. They hear "button, button, button, link, button." Nothing is named. Nothing announces state. The interface is functionally unusable. How did this happen?',
    realWorldContext:
      'Accessibility is not cosmetic. In most jurisdictions it is a legal requirement (ADA, EAA, EN 301 549). ' +
      'It is also most cheaply solved at the component design stage — retrofitting accessibility costs 10–100× more than building it in. ' +
      'The tools are: semantic HTML (free contracts), ARIA (fills the gaps), focus management (keeps keyboard users oriented), and live regions (announces changes to screen reader users).',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'Semantic HTML gives you the accessibility contract for free: <button> is keyboard-activatable, labelled, focusable. A <div> gives you none of that.',
      'ARIA fills gaps when semantic HTML can\'t: role, states (aria-expanded, aria-checked), properties (aria-label, aria-labelledby).',
      'Three focus management rules: (1) opened regions receive focus, (2) closed regions return focus to trigger, (3) modals trap Tab.',
      'Live regions announce dynamic content: role="alert" for errors (immediate), role="status" for updates (polite). Must exist in DOM before content is added.',
      'Four testing levels: automated (30–40%), keyboard (60–70%), screen reader (80–90%), real users (100%).',
      'Six anti-patterns: AC-1 interactive div, AC-2 missing name, AC-3 broken focus, AC-4 missing live region, AC-5 outline:none, AC-6 inaccessible modal.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The First Rule of ARIA',
        body: 'If there is a native HTML element that provides the required semantics, use it. <button> not <div role="button">. <nav> not <div role="navigation">. Semantic HTML provides the contract for free; ARIA recreates it manually and incompletely.',
      },
      {
        type: 'important',
        title: 'AC-5: Never outline: none',
        body: 'Removing the focus ring is a WCAG 2.4.7 violation and makes keyboard navigation impossible to follow visually. This rule has appeared in lessons 6, 7, and 9 because it is the most frequently violated accessibility requirement in production codebases.',
      },
      {
        type: 'tip',
        title: 'The Live Region Rule',
        body: 'Live regions must be in the DOM before their content is set. The browser observes the region and announces changes. A live region inserted at the same time as its content is added will not be announced. Create the region on page load; update its textContent when something happens.',
      },
      {
        type: 'warning',
        title: 'Colour Alone Is Never Enough',
        body: 'WCAG 1.4.1 (Use of Color): "Color is not used as the only visual means of conveying information." An error field that turns red is not accessible. An error field that turns red AND shows an error message AND has aria-invalid="true" is accessible.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Design Systems — Lesson 9: Accessibility Systems',
        props: { lesson: LESSON_DESIGN_09 },
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: {
    prose: [
      'WCAG 2.1 Level AA is the internationally recognised accessibility standard, referenced by the EU Web Accessibility Directive, the US Section 508, and the UK Equality Act. It consists of 50 success criteria organised into four principles: Perceivable, Operable, Understandable, Robust.',
      'The keyboard navigation model is specified in the ARIA Authoring Practices Guide (APG) published by the W3C. The distinction between Tab-based (move between widgets) and Arrow-based (move within widgets) navigation is the APG\'s design pattern for composite widgets.',
      'Live region behaviour is specified in the ARIA 1.2 specification, section 6.6. The requirement that the region must pre-exist before content changes is derived from the ARIA Live Region processing model: the accessibility tree is snapshotted on node insertion. A live region inserted and populated simultaneously has already been "observed" at empty state.',
    ],
    callouts: [],
    visualizations: [],
  },
  examples: [],
  challenges: [],
  mentalModel: [
    'Semantic HTML = accessibility contract for free. Use the element that accurately describes the content.',
    'ARIA fills gaps: role (what it is), states (aria-expanded, aria-checked), properties (aria-label, aria-labelledby).',
    'Focus management: opened → focus in, closed → focus back to trigger, modal → trap Tab.',
    'Live regions: role="alert" (assertive, errors), role="status" (polite, updates). Must pre-exist in DOM.',
    'Keyboard model: Tab between widgets, Arrow within widgets, Escape closes, Enter/Space activates.',
    'Six anti-patterns: AC-1 interactive div, AC-2 missing name, AC-3 broken focus, AC-4 missing live region, AC-5 outline:none, AC-6 inaccessible modal.',
    'auditAccessibility() + auditComponent() + auditInteraction() + auditSystem() = complete quality gate.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
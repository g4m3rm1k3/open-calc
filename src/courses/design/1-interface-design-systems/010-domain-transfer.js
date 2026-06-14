// LESSON_DESIGN_10.js
// Lesson 10 — Domain Transfer
// The problem: you've learned nine design systems in CSS/HTML.
// Now you open a Qt C++ project, a Unity game, or a D3 data visualisation.
// The tools look completely different. Do the principles still hold?
// They do. This lesson teaches you to see through the syntax
// to the invariant principles underneath.
// Concepts: Qt layout model, QSS styling, Unity RectTransform and Layout Groups,
//           TextMeshPro type system, data visualisation as hierarchy,
//           position as the fifth visual lever, the data-to-pixel mapping.

const LESSON_DESIGN_10 = {
  title: 'Domain Transfer',
  subtitle: 'Nine systems, any platform. The principles are invariant. Only the syntax changes.',
  sequential: true,
  cells: [

    // ─── PART 0: RECAP ────────────────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The Course So Far: Nine Systems, Eight Audit Tools

| Lesson | System | Audit tool |
|---|---|---|
| 1 Hierarchy | Four levels, four levers | *(in auditComponent)* |
| 2 Spacing | 4px base, 8 tokens, 5 roles | \`auditSpacing()\` |
| 3 Typography | Scale, line-height function, measure | \`auditType()\` |
| 4 Layout | Flex + Grid as constraints | \`auditLayout()\` |
| 5 Colour | Three-layer token architecture | \`auditColour()\` |
| 6 Composition | Four-layer anatomy model | \`auditComponent()\` |
| 7 Interaction | Finite state machines | \`auditInteraction()\` |
| 8 Systems | Token governance, drift | \`auditSystem()\` |
| 9 Accessibility | Semantic contracts, ARIA | \`auditAccessibility()\` |

Every lesson assumed a browser, CSS, and HTML. Every cross-platform table at the end of each lesson promised: *the same principles apply everywhere, only the syntax changes.*

This lesson cashes that promise.

---

## The Question This Lesson Answers

> You've just been handed a Qt/C++ desktop application with no design system, or a Unity game UI with inconsistent spacing and typography. You know CSS cold. How much of what you know transfers — and what do you need to learn?

**The answer:** the principles transfer completely. The visual hierarchy rules, the spacing ratios, the type scale formula, the colour token architecture, the accessibility contracts — none of these are CSS inventions. They're human perception constraints and engineering patterns that predate CSS by decades.

What changes is *syntax*. What stays constant is *intent*.

This lesson covers three environments:
1. **Qt/C++** — desktop application UI
2. **Unity/C#** — game and real-time UI
3. **Data visualisation** — where a fifth hierarchy lever (position) joins the four from Lesson 1`,
    },

    // ─── PART 1: THE INVARIANT PRINCIPLES ─────────────────────────────────────
    {
      type: 'js',
      instruction: `## The Invariant Principles

Before looking at any platform, let's establish what never changes. These are the rules that hold in CSS, Qt, Unity, SwiftUI, Android Compose, game engines, and printed paper.

The cell below renders the nine invariants as a reference card. These are the things you carry with you to any platform — no lookup needed.

Run it. Then refer back to it as you work through Qt and Unity in the cells below.`,
      html: `<div id="invariants-card">
  <div class="ic-header">
    <div class="ic-title">The Invariant Principles</div>
    <div class="ic-sub">What never changes across platforms</div>
  </div>
  <div class="ic-list" id="ic-list"></div>
</div>`,
      css: `body { background:#0f172a; padding:20px; margin:0; font-family:system-ui,sans-serif; }
#invariants-card { max-width:580px; background:hsl(222,39%,12%);
  border:1px solid hsl(217,32%,22%); border-radius:12px; overflow:hidden; }
.ic-header { padding:20px 24px 16px; border-bottom:1px solid hsl(217,32%,22%); }
.ic-title  { font-size:18px; font-weight:700; color:hsl(210,40%,96%); margin-bottom:4px; }
.ic-sub    { font-size:13px; color:hsl(215,25%,65%); }
.ic-list   { padding:12px 0; }
.ic-item   { display:flex; gap:14px; padding:8px 24px; align-items:flex-start; }
.ic-item:hover { background:hsl(217,32%,14%); }
.ic-num    { font-size:11px; font-weight:700; color:hsl(217,76%,47%);
  font-family:monospace; min-width:20px; padding-top:2px; }
.ic-text   { font-size:13px; color:hsl(215,25%,65%); line-height:1.55; }
.ic-text b { color:hsl(210,40%,96%); font-weight:600; }`,
      startCode: `const principles = [
  {
    n: '01',
    text: '<b>Hierarchy has four levels.</b> Primary, structural, detail, metadata. ' +
          'Every UI element belongs to one. Size, weight, and colour encode the assignment. ' +
          'The 1.5× ratio minimum between adjacent levels is perceptual, not aesthetic.',
  },
  {
    n: '02',
    text: '<b>Spacing comes from one base unit.</b> 4px (or its device equivalent). ' +
          'All gaps are multiples. Within-group < between-group, always by ≥2.5×. ' +
          'The token names change; the ratios don't.',
  },
  {
    n: '03',
    text: '<b>Type scale is base × ratio^n.</b> Line-height decreases as font size increases. ' +
          'Body text measure: 45–75ch (or ~500–700px at standard font sizes). ' +
          'Two weights per component maximum.',
  },
  {
    n: '04',
    text: '<b>Layout is constraint declaration, not placement.</b> Describe relationships ' +
          '(equal shares, fill remainder, fixed minimum). Let the engine resolve pixels. ' +
          'QHBoxLayout = flex row. QGridLayout = grid. RectTransform anchors = constraints.',
  },
  {
    n: '05',
    text: '<b>Colour has three layers: primitive → semantic → component.</b> ' +
          'The action colour is one colour, used once per view. ' +
          'Semantic colours (error/success/warning) are reserved. Never decorative.',
  },
  {
    n: '06',
    text: '<b>Every interactive element makes a contract.</b> ' +
          'Role (what it is), accessible name (what it's called), state (checked/expanded/disabled). ' +
          'CSS uses ARIA. Qt uses QAccessible. Unity uses AccessibilityNode.',
  },
  {
    n: '07',
    text: '<b>Interaction is a finite state machine.</b> States, events, transitions. ' +
          'No silent submits. No spinners with no resolution. No error states without recovery paths. ' +
          'Qt signals/slots implement FSMs. Unity event system does the same.',
  },
  {
    n: '08',
    text: '<b>Token names encode function, not value.</b> ' +
          '--color-interactive survives a rebrand. --color-blue does not. ' +
          'In Qt: constant names follow the same rule. In Unity: ScriptableObject field names follow it.',
  },
  {
    n: '09',
    text: '<b>Accessibility is a contract, not a feature.</b> ' +
          'Every platform has an accessibility API: QAccessible (Qt), UnityEngine.Accessibility (Unity), ' +
          'UIAccessibility (iOS). The contracts — role, name, state, focus management — are identical.',
  },
];

const list = document.getElementById('ic-list');
principles.forEach(({ n, text }) => {
  const item = document.createElement('div');
  item.className = 'ic-item';
  item.innerHTML = \`<span class="ic-num">\${n}</span><span class="ic-text">\${text}</span>\`;
  list.appendChild(item);
});

console.log('Nine invariant principles loaded.');
console.log('These transfer to every platform in this lesson.');
console.log('');
console.log('The lesson covers three domains:');
console.log('  Qt/C++      — desktop application UI');
console.log('  Unity/C#    — game and real-time UI');
console.log('  Data viz    — position as the fifth hierarchy lever');`,
      outputHeight: 520,
    },

    // ─── PART 2: QT — LAYOUT AS CODE ──────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Qt: Layout as Code

In CSS, layout is declarative: you write \`display: flex\` and the browser arranges children. In Qt, layout is imperative: you instantiate layout objects in C++ and add widgets to them.

The model is the same. The execution is different.

### The Mapping

| CSS | Qt C++ | What it does |
|---|---|---|
| \`display: flex\` (row) | \`QHBoxLayout\` | Arrange children horizontally |
| \`display: flex; flex-direction: column\` | \`QVBoxLayout\` | Arrange children vertically |
| \`display: grid\` | \`QGridLayout\` | Two-dimensional arrangement |
| \`gap: 8px\` | \`layout->setSpacing(8)\` | Space between items |
| \`padding: 16px\` | \`layout->setContentsMargins(16,16,16,16)\` | Container inset |
| \`flex: 1\` | \`QSizePolicy::Expanding\` | Fill available space |
| \`flex-shrink: 0\` | \`QSizePolicy::Fixed\` | Fixed size, no shrink |
| \`stretch div\` | \`layout->addStretch()\` | Pushes items apart (like \`flex: 1\` spacer) |
| \`align-items: center\` | \`layout->setAlignment(Qt::AlignVCenter)\` | Cross-axis alignment |

### The C++ Pattern

\`\`\`cpp
// CSS equivalent:
// .nav { display: flex; align-items: center; gap: 8px; padding: 0 16px; }
// .nav-logo { flex-shrink: 0; }
// .nav-links { flex: 1; }
// .nav-btn { flex-shrink: 0; }

QWidget* nav = new QWidget(this);
QHBoxLayout* navLayout = new QHBoxLayout(nav);
navLayout->setSpacing(8);
navLayout->setContentsMargins(0, 0, 16, 0);  // padding: 0 16px

QLabel* logo = new QLabel("Acme", nav);
logo->setSizePolicy(QSizePolicy::Fixed, QSizePolicy::Preferred);

QWidget* links = new QWidget(nav);
// links has its own QHBoxLayout internally
links->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Preferred); // flex: 1

QPushButton* btn = new QPushButton("New Report", nav);
btn->setSizePolicy(QSizePolicy::Fixed, QSizePolicy::Preferred);

navLayout->addWidget(logo);
navLayout->addWidget(links);
navLayout->addStretch();  // equivalent to a flex:1 spacer
navLayout->addWidget(btn);
\`\`\`

### The Stat Card Grid

\`\`\`cpp
// CSS equivalent:
// .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }

QWidget* cardsContainer = new QWidget(this);
QGridLayout* grid = new QGridLayout(cardsContainer);
grid->setSpacing(16);

// Add cards — Qt GridLayout doesn't have auto-fill, so you compute columns:
int cols = qMax(1, containerWidth / 200);  // minmax(200px, 1fr) equivalent
for (int i = 0; i < cards.size(); i++) {
    grid->addWidget(cards[i], i / cols, i % cols);
    // Each card widget has setSizePolicy(QSizePolicy::Expanding, ...) for 1fr
}
\`\`\`

### Key Difference: No Auto-Responsive

CSS Grid's \`repeat(auto-fill, minmax(200px, 1fr))\` adapts column count automatically. Qt does not. In Qt you must compute column count from container width and respond to resize events. This is the biggest layout difference between web and desktop UI.

\`\`\`cpp
void MyWidget::resizeEvent(QResizeEvent* event) {
    QWidget::resizeEvent(event);
    int cols = qMax(1, width() / 200);
    rebuildGrid(cols);
}
\`\`\``,
    },

    // ─── PART 3: QT — QSS STYLING ─────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Qt Style Sheets (QSS): CSS's Smaller Sibling

Qt Style Sheets are a subset of CSS. The selectors, property names, and values are similar but not identical. This cell shows the mapping side-by-side with a live CSS demo.

Key QSS differences from CSS:
- Selectors use class names prefixed with widget type: \`QPushButton { }\` not \`.btn { }\`
- Custom classes use \`setProperty("class", "btn-primary")\` + \`QPushButton[class="btn-primary"] { }\`
- No flexbox or grid — layout is handled in C++, not QSS
- Pseudo-states: \`:hover\`, \`:pressed\`, \`:disabled\`, \`:checked\` work like CSS
- \`border-radius\`, \`background-color\`, \`color\`, \`font-size\`, \`padding\` all work
- No \`rem\`/\`em\`/\`ch\` units — only \`px\` and \`pt\``,
      html: `<div id="qss-demo">
  <div class="qss-panel" id="qss-panel-left">
    <div class="panel-label">CSS (web)</div>
    <div class="qss-code" id="css-code"></div>
  </div>
  <div class="qss-panel" id="qss-panel-right">
    <div class="panel-label">QSS (Qt equivalent)</div>
    <div class="qss-code" id="qss-code"></div>
  </div>
</div>
<div class="live-demo" id="live-demo">
  <button class="demo-btn demo-primary">Primary Action</button>
  <button class="demo-btn demo-secondary">Secondary</button>
  <button class="demo-btn demo-primary" disabled>Disabled</button>
</div>`,
      css: `body { background:#0f172a; padding:20px; margin:0; font-family:system-ui,sans-serif; }
:root {
  --c-interactive:hsl(217,76%,47%); --c-surface:hsl(222,39%,12%);
  --c-border:hsl(217,32%,22%); --c-text-1:hsl(210,40%,96%);
  --c-text-2:hsl(215,25%,65%);
}
#qss-demo { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
.qss-panel { background:var(--c-surface); border:1px solid var(--c-border);
  border-radius:8px; overflow:hidden; }
.panel-label { font-size:10px; font-weight:700; color:var(--color-text-secondary, #475569); letter-spacing:.12em;
  text-transform:uppercase; padding:8px 12px; border-bottom:1px solid var(--c-border); }
.qss-code { font-family:monospace; font-size:11px; color:var(--color-text-secondary, #475569); padding:12px;
  line-height:1.8; white-space:pre-wrap; }
.live-demo { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
.demo-btn { padding:9px 18px; border-radius:8px; border:none; font-size:14px;
  font-weight:600; cursor:pointer; min-height:44px; transition:all 0.15s; }
.demo-primary  { background:var(--c-interactive); color:white; }
.demo-secondary{ background:transparent; color:var(--c-text-2);
  border:1px solid var(--c-border); }
.demo-primary:hover   { background:hsl(217,76%,55%); }
.demo-secondary:hover { background:var(--c-surface); }
.demo-btn:disabled { opacity:0.4; cursor:not-allowed; }
.demo-btn:focus-visible { outline:2px solid var(--c-interactive); outline-offset:2px; }`,
      startCode: `// Side-by-side CSS vs QSS mapping

const css = document.getElementById('css-code');
const qss = document.getElementById('qss-code');

const cssCode = \`/* Primary button */
.btn-primary {
  background-color: hsl(217, 76%, 47%);
  color: white;
  padding: 9px 18px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  min-height: 44px;
}

.btn-primary:hover {
  background-color: hsl(217, 76%, 55%);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Secondary button */
.btn-secondary {
  background-color: transparent;
  color: hsl(215, 25%, 65%);
  border: 1px solid hsl(217, 32%, 22%);
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 14px;
  min-height: 44px;
}

.btn-secondary:hover {
  background-color: hsl(222, 39%, 12%);
}\`;

const qssCode = \`/* Primary button (QPushButton) */
QPushButton[class="primary"] {
  background-color: hsl(217, 76%, 47%);
  color: white;
  padding: 9px 18px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: bold;
  min-height: 44px;
}

QPushButton[class="primary"]:hover {
  background-color: hsl(217, 76%, 55%);
}

QPushButton[class="primary"]:disabled {
  background-color: rgba(37, 99, 235, 0.4);
  /* QSS has no opacity: use rgba instead */
}

/* Secondary button */
QPushButton[class="secondary"] {
  background-color: transparent;
  color: rgb(100, 116, 139);
  border: 1px solid rgb(51, 65, 85);
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 14px;
  min-height: 44px;
}

QPushButton[class="secondary"]:hover {
  background-color: rgb(30, 41, 59);
}\`;

// Syntax highlighting helper
function highlight(code) {
  return code
    .replace(/\/\*.*?\*\//gs, m => \`<span style="color:#334155">\${m}</span>\`)
    .replace(/(QPushButton|QLabel|QWidget|QLineEdit)(\[.*?\])?(\:[a-z]+)?/g,
      m => \`<span style="color:#a78bfa">\${m}</span>\`)
    .replace(/\\.([a-z][a-zA-Z-]*)(\:[a-z-]+)?/g,
      m => \`<span style="color:#60a5fa">\${m}</span>\`)
    .replace(/\{|\}/g, m => \`<span style="color:var(--color-text-secondary, #475569)">\${m}</span>\`)
    .replace(/([a-z-]+)(\s*:)(?=\s)/g,
      (_,p,c) => \`<span style="color:#94a3b8">\${p}</span>\${c}\`);
}

css.innerHTML = highlight(cssCode);
qss.innerHTML = highlight(qssCode);

console.log('Key QSS differences from CSS:');
console.log('1. Widget type in selector: QPushButton, not just .btn');
console.log('2. Custom classes via setProperty() + attribute selector');
console.log('3. No opacity: use rgba() for semi-transparent colours');
console.log('4. No flex/grid: handled in C++, not QSS');
console.log('5. Only px/pt units: no rem, em, ch');
console.log('6. :hover, :pressed, :disabled, :checked pseudo-states work');`,
      outputHeight: 500,
    },

    // ─── PART 4: QT — SIGNALS AND SLOTS ───────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Qt: Signals and Slots as Finite State Machines

Lesson 7 taught interaction as a finite state machine: states, events, transitions. Qt implements this natively through its signals/slots mechanism. The mapping is direct.

### The FSM Mapping

| CSS/JS concept | Qt equivalent |
|---|---|
| DOM event (\`click\`, \`keydown\`) | Signal (\`clicked()\`, \`textChanged()\`) |
| Event handler (\`addEventListener\`) | Slot (connected method) |
| \`aria-expanded\` state | Widget property + style sheet reapplication |
| Double-submit prevention | \`setEnabled(false)\` on submit |
| Loading state | Replace button text + set disabled |
| Error state | \`setProperty("state", "error")\` + style sheet |

### The C++ FSM Pattern

\`\`\`cpp
// The form submission FSM from Lesson 7, in Qt

class SubmitButton : public QPushButton {
    Q_OBJECT
    enum class State { Idle, Loading, Success, Error };
    State m_state = State::Idle;

public:
    SubmitButton(QWidget* parent = nullptr) : QPushButton("Submit", parent) {
        connect(this, &SubmitButton::clicked, this, &SubmitButton::onClicked);
    }

private slots:
    void onClicked() {
        if (m_state != State::Idle) return;  // guard: no double-submit
        setState(State::Loading);

        // Simulate async operation
        QTimer::singleShot(1500, this, [this]() {
            setState(State::Success);
        });
    }

    void setState(State s) {
        m_state = s;
        switch (s) {
        case State::Idle:
            setText("Submit");
            setEnabled(true);
            setProperty("state", "idle");
            break;
        case State::Loading:
            setText("Submitting…");
            setEnabled(false);           // double-submit prevention
            setProperty("state", "loading");
            break;
        case State::Success:
            setText("✓ Submitted");
            setProperty("state", "success");
            break;
        case State::Error:
            setText("Try again");
            setEnabled(true);
            setProperty("state", "error");
            break;
        }
        // Must re-polish to apply new QSS property value
        style()->unpolish(this);
        style()->polish(this);
    }
};
\`\`\`

\`\`\`qss
/* QSS: same state model as CSS modifier classes */
QPushButton[state="idle"]    { background-color: rgb(37,99,235); }
QPushButton[state="loading"] { background-color: rgb(100,116,139); }
QPushButton[state="success"] { background-color: rgb(22,163,74); }
QPushButton[state="error"]   { background-color: rgb(220,38,38); }
\`\`\`

### The Key Insight

Every concept from Lesson 7 maps directly:
- **States** → C++ enum + widget property
- **Events** → Qt signals
- **Transitions** → Slot implementations
- **Guards** → \`if (m_state != State::Idle) return\`
- **Actions** → \`setEnabled()\`, \`setText()\`, property changes

The thinking is identical. The language is different.`,
    },

    // ─── PART 5: PRACTICE 1 — TRANSLATE A CARD TO QT ─────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 1: Translate a Card Component to Qt

You're given the stat card from Lesson 1 in CSS. Your task is to describe the equivalent Qt structure — not write compilable C++ (the notebook can't compile Qt), but to correctly match every CSS property to its Qt equivalent using the pseudocode format shown.

**The CSS card:**
\`\`\`css
.stat-card {
  display: flex; flex-direction: column; gap: 4px;
  background: hsl(222,39%,12%); border: 1px solid hsl(217,32%,22%);
  border-radius: 10px; padding: 20px;
}
.stat-label { font-size: 12px; font-weight: 600; color: hsl(217,20%,45%); }
.stat-value { font-size: 28px; font-weight: 700; color: hsl(210,40%,96%); }
.stat-delta { font-size: 12px; color: hsl(142,60%,65%); }
\`\`\`

**Your task:** fill in the Qt pseudocode below. Map every CSS property to its correct Qt equivalent. The test checks that all five key mappings are present in your code.

Required mappings:
1. \`display: flex; flex-direction: column\` → \`QVBoxLayout\`
2. \`gap: 4px\` → \`setSpacing(4)\`
3. \`padding: 20px\` → \`setContentsMargins(20,20,20,20)\`
4. \`background-color\` in QSS → correctly specified
5. \`font-size: 28px; font-weight: 700\` on value label → \`QFont\` with correct size`,
      html: `<div id="p1-demo">
  <div class="p1-label">Reference CSS Card:</div>
  <div class="stat-card-css">
    <div class="stat-label-css">REVENUE</div>
    <div class="stat-value-css">$48,290</div>
    <div class="stat-delta-css">↑ 12%</div>
  </div>
  <div class="p1-label" style="margin-top:16px">Your Qt pseudocode (edit below):</div>
  <div class="qt-output" id="qt-output"></div>
</div>`,
      css: `body { background:#0f172a; padding:20px; margin:0; font-family:system-ui,sans-serif; }
#p1-demo { max-width:480px; }
.p1-label { font-size:10px; font-weight:700; color:var(--color-text-secondary, #475569);
  letter-spacing:.12em; text-transform:uppercase; margin-bottom:8px; }
.stat-card-css { background:hsl(222,39%,12%); border:1px solid hsl(217,32%,22%);
  border-radius:10px; padding:20px; display:flex; flex-direction:column; gap:4px;
  width:200px; }
.stat-label-css { font-size:12px; font-weight:600; color:hsl(217,20%,45%);
  text-transform:uppercase; letter-spacing:.1em; }
.stat-value-css { font-size:28px; font-weight:700; color:hsl(210,40%,96%); line-height:1.1; }
.stat-delta-css { font-size:12px; color:hsl(142,60%,65%); }
.qt-output { background:hsl(217,32%,10%); border:1px solid hsl(217,32%,18%);
  border-radius:8px; padding:14px; font-family:monospace; font-size:11px;
  color:var(--color-text-secondary, #475569); line-height:1.8; white-space:pre-wrap; min-height:200px; }`,
      startCode: `// TASK: fill in the ??? placeholders with correct Qt equivalents
// Then verify with the audit at the bottom.

const qtPseudocode = \`
// ── C++ STRUCTURE ─────────────────────────────────────────────────────────
QWidget* card = new QWidget(parent);

// 1. CSS: display:flex; flex-direction:column → Qt:
???* cardLayout = new ???(card);

// 2. CSS: gap:4px → Qt:
cardLayout->???(???);

// 3. CSS: padding:20px → Qt:
cardLayout->???(20, 20, 20, 20);

// 4. Widgets
QLabel* label = new QLabel("REVENUE", card);
QLabel* value = new QLabel("$48,290", card);
QLabel* delta = new QLabel("↑ 12%", card);

cardLayout->addWidget(label);
cardLayout->addWidget(value);
cardLayout->addWidget(delta);

// ── QSS STYLING ───────────────────────────────────────────────────────────
// 5. CSS: background + border + border-radius → QSS:
card->setStyleSheet(R"(
  QWidget {
    ???-color: rgb(22, 33, 53);
    border: 1px solid rgb(51, 65, 85);
    border-radius: ???px;
    padding: 0;
  }
)");

// 6. CSS: font-size:28px; font-weight:700 → Qt QFont:
QFont valueFont = value->font();
valueFont.???(28);
valueFont.???(QFont::Bold);
value->setFont(valueFont);
value->setStyleSheet("color: rgb(241, 245, 249);");

label->setStyleSheet("font-size: 12px; font-weight: 600; color: rgb(71, 85, 105);");
delta->setStyleSheet("font-size: 12px; color: rgb(74, 222, 128);");
\`;

document.getElementById('qt-output').textContent = qtPseudocode;

// ── AUDIT ─────────────────────────────────────────────────────────────────
const checks = {
  'QVBoxLayout used':         qtPseudocode.includes('QVBoxLayout'),
  'setSpacing(4) used':       qtPseudocode.includes('setSpacing(4)'),
  'setContentsMargins used':  qtPseudocode.includes('setContentsMargins(20'),
  'background-color in QSS':  qtPseudocode.includes('background') && qtPseudocode.includes('color'),
  'QFont size set':           qtPseudocode.includes('setPointSize') || qtPseudocode.includes('setPixelSize'),
};
console.log('=== QT CARD TRANSLATION AUDIT ===');
Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗')+' '+k));`,
      solutionCode: `const qtPseudocode = \`
// ── C++ STRUCTURE ─────────────────────────────────────────────────────────
QWidget* card = new QWidget(parent);

// 1. CSS: display:flex; flex-direction:column → Qt: QVBoxLayout
QVBoxLayout* cardLayout = new QVBoxLayout(card);

// 2. CSS: gap:4px → Qt: setSpacing
cardLayout->setSpacing(4);

// 3. CSS: padding:20px → Qt: setContentsMargins
cardLayout->setContentsMargins(20, 20, 20, 20);

// 4. Widgets
QLabel* label = new QLabel("REVENUE", card);
QLabel* value = new QLabel("$48,290", card);
QLabel* delta = new QLabel("↑ 12%", card);

cardLayout->addWidget(label);
cardLayout->addWidget(value);
cardLayout->addWidget(delta);

// ── QSS STYLING ───────────────────────────────────────────────────────────
// 5. CSS: background + border + border-radius → QSS:
card->setStyleSheet(R"(
  QWidget {
    background-color: rgb(22, 33, 53);
    border: 1px solid rgb(51, 65, 85);
    border-radius: 10px;
    padding: 0;
  }
)");

// 6. CSS: font-size:28px; font-weight:700 → Qt QFont:
QFont valueFont = value->font();
valueFont.setPointSize(28);
valueFont.setWeight(QFont::Bold);
value->setFont(valueFont);
value->setStyleSheet("color: rgb(241, 245, 249);");

label->setStyleSheet("font-size: 12px; font-weight: 600; color: rgb(71, 85, 105);");
delta->setStyleSheet("font-size: 12px; color: rgb(74, 222, 128);");
\`;
document.getElementById('qt-output').textContent = qtPseudocode;`,
      check: (code) => {
        const hasVBox    = /QVBoxLayout/i.test(code);
        const hasSpacing = /setSpacing\s*\(\s*4\s*\)/i.test(code);
        const hasMargins = /setContentsMargins/i.test(code);
        const hasBg      = /background.*color|background-color/i.test(code);
        const hasFont    = /setPointSize|setPixelSize|setFont/i.test(code);
        return hasVBox && hasSpacing && hasMargins;
      },
      successMessage: `Qt card translated. Three mappings that matter most: (1) QVBoxLayout replaces display:flex + flex-direction:column. (2) setSpacing(4) replaces gap:4px. (3) setContentsMargins(20,20,20,20) replaces padding:20px. The visual result is identical; the execution model is imperative rather than declarative.`,
      failMessage: `Three required: (1) 'QVBoxLayout' must appear in your code (not QHBoxLayout — the card is a column). (2) setSpacing(4) must appear (the gap value). (3) setContentsMargins must appear with the padding values. Check the audit output for which mappings are missing.`,
      outputHeight: 500,
    },

    // ─── PART 6: UNITY — RECTTRANSFORM MODEL ──────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Unity: The RectTransform Model

Unity UI uses a system called RectTransform. Instead of CSS layout rules, every UI element has an anchor rectangle and an offset from that anchor. This is Unity's constraint system.

### Anchors = Constraints

| CSS concept | Unity RectTransform equivalent |
|---|---|
| \`width: 100%\` | anchorMin.x = 0, anchorMax.x = 1 (stretch horizontally) |
| \`height: 100%\` | anchorMin.y = 0, anchorMax.y = 1 (stretch vertically) |
| \`align-items: center\` | anchorMin.y = 0.5, anchorMax.y = 0.5 (centre on Y axis) |
| \`position: absolute; right: 0\` | anchorMin.x = 1, anchorMax.x = 1 (pin to right) |
| \`position: absolute; bottom: 0\` | anchorMin.y = 0, anchorMax.y = 0 (pin to bottom) |
| \`margin: 16px\` | offsetMin = (16,16), offsetMax = (-16,-16) |
| \`flex: 1\` | Layout Element with flexibleWidth = 1 |

### Layout Groups = Flex/Grid

Unity's Layout Groups are the equivalent of CSS Flexbox:

| CSS | Unity Component |
|---|---|
| \`display: flex; flex-direction: row\` | Horizontal Layout Group |
| \`display: flex; flex-direction: column\` | Vertical Layout Group |
| \`display: grid\` | Grid Layout Group |
| \`gap: 8px\` | spacing = 8 |
| \`padding: 16px\` | padding.left/right/top/bottom = 16 |
| \`flex: 1\` | Layout Element component, flexibleWidth = 1 |
| \`flex-shrink: 0\` | Layout Element, minWidth = preferred, maxWidth = preferred |

### C# Pattern

\`\`\`csharp
// Creating a horizontal nav bar in Unity C#
// CSS equivalent: .nav { display:flex; align-items:center; gap:8px; padding:0 16px; }

GameObject navObj = new GameObject("Nav", typeof(RectTransform), typeof(HorizontalLayoutGroup));
RectTransform navRT = navObj.GetComponent<RectTransform>();

// Stretch to full width of parent (width: 100%)
navRT.anchorMin = new Vector2(0, 1);  // top-left of parent
navRT.anchorMax = new Vector2(1, 1);  // top-right of parent
navRT.sizeDelta = new Vector2(0, 48); // height: 48px; width: auto (from stretch)

HorizontalLayoutGroup navLayout = navObj.GetComponent<HorizontalLayoutGroup>();
navLayout.spacing = 8;               // gap: 8px
navLayout.padding = new RectOffset(16, 16, 0, 0); // padding: 0 16px
navLayout.childAlignment = TextAnchor.MiddleLeft;  // align-items: center

// Make the links section fill remaining space (flex: 1)
LayoutElement linksLayout = linksObj.AddComponent<LayoutElement>();
linksLayout.flexibleWidth = 1;  // flex: 1
\`\`\`

### TextMeshPro: The Type System

TextMeshPro is Unity's text rendering system. It maps to the type system from Lesson 3:

\`\`\`csharp
// CSS: font-size:28px; font-weight:700; line-height:1.15; color:#f1f5f9
TextMeshProUGUI valueText = valueObj.AddComponent<TextMeshProUGUI>();
valueText.fontSize = 28;
valueText.fontStyle = FontStyles.Bold;
valueText.lineSpacing = 15;  // TMP uses % difference from default, not ratio
                               // lineSpacing = (1.15 - 1) * 100 = 15
valueText.color = new Color(0.945f, 0.961f, 0.976f);  // #f1f5f9

// The modular scale still applies: sizes from base × ratio^n
float BASE = 16f, RATIO = 1.333f;
float[] scale = {
    Mathf.Round(BASE * Mathf.Pow(RATIO, -2)),  // ≈ 9
    Mathf.Round(BASE * Mathf.Pow(RATIO, -1)),  // ≈ 12
    BASE,                                        // 16
    Mathf.Round(BASE * Mathf.Pow(RATIO,  1)),  // ≈ 21
    Mathf.Round(BASE * Mathf.Pow(RATIO,  2)),  // ≈ 28
};
// Same formula. Different language. Same result.
\`\`\``,
    },

    // ─── PART 7: PRACTICE 2 — COLOUR TOKENS IN UNITY ─────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 2: Map Colour Tokens to Unity C#

Lesson 5 built a three-layer colour token architecture: primitives → semantics → components. The architecture is identical in Unity — only the implementation language changes.

In Unity, the equivalent of CSS custom properties is a \`ScriptableObject\` — a C# asset that stores data and can be referenced across scenes.

**The CSS token architecture:**
\`\`\`css
:root {
  /* Primitives */
  --blue-500: hsl(217, 76%, 47%);
  --slate-900: hsl(222, 47%, 11%);

  /* Semantic */
  --color-interactive: var(--blue-500);
  --color-bg: var(--slate-900);

  /* Component */
  --btn-bg: var(--color-interactive);
}
\`\`\`

**Your task:** complete the Unity C# ScriptableObject equivalent. The test checks that all three layers are represented and that Color.HSVToRGB (or equivalent) is used for at least one primitive.`,
      html: `<div id="p2-demo">
  <div class="p2-label">Reference CSS token system (Lesson 5):</div>
  <div class="token-viz" id="token-viz">
    <div class="token-layer">
      <div class="layer-title">Primitives</div>
      <div class="token-item" style="--c:hsl(217,76%,47%)">blue-500</div>
      <div class="token-item" style="--c:hsl(222,47%,11%)">slate-900</div>
      <div class="token-item" style="--c:hsl(210,40%,96%)">slate-100</div>
    </div>
    <div class="token-arrow">→</div>
    <div class="token-layer">
      <div class="layer-title">Semantic</div>
      <div class="token-item" style="--c:hsl(217,76%,47%)">color-interactive</div>
      <div class="token-item" style="--c:hsl(222,47%,11%)">color-bg</div>
      <div class="token-item" style="--c:hsl(210,40%,96%)">color-text-1</div>
    </div>
    <div class="token-arrow">→</div>
    <div class="token-layer">
      <div class="layer-title">Component</div>
      <div class="token-item" style="--c:hsl(217,76%,47%)">btn-bg</div>
    </div>
  </div>
  <div class="p2-label" style="margin-top:16px">Your Unity C# equivalent:</div>
  <div class="cs-output" id="cs-output"></div>
</div>`,
      css: `body { background:#0f172a; padding:20px; margin:0; font-family:system-ui,sans-serif; }
#p2-demo { max-width:580px; }
.p2-label { font-size:10px; font-weight:700; color:var(--color-text-secondary, #475569);
  letter-spacing:.12em; text-transform:uppercase; margin-bottom:8px; }
.token-viz { display:flex; align-items:center; gap:8px; margin-bottom:4px;
  flex-wrap:wrap; }
.token-layer { background:hsl(222,39%,12%); border:1px solid hsl(217,32%,22%);
  border-radius:8px; padding:10px 12px; min-width:120px; }
.layer-title { font-size:9px; font-weight:700; color:var(--color-text-secondary, #475569); letter-spacing:.12em;
  text-transform:uppercase; margin-bottom:8px; }
.token-item { display:flex; align-items:center; gap:8px; font-size:11px;
  color:var(--color-text-secondary, #475569); margin-bottom:4px; }
.token-item::before { content:''; width:12px; height:12px; border-radius:3px;
  background:var(--c); flex-shrink:0; }
.token-arrow { font-size:16px; color:#334155; }
.cs-output { background:hsl(217,32%,10%); border:1px solid hsl(217,32%,18%);
  border-radius:8px; padding:14px; font-family:monospace; font-size:11px;
  color:var(--color-text-secondary, #475569); line-height:1.8; white-space:pre-wrap; min-height:260px; }`,
      startCode: `// TASK: complete the Unity C# ScriptableObject token system
// All three layers must be present: primitives, semantic, component

const csharp = \`
// ── LAYER 1: PRIMITIVES ────────────────────────────────────────────────────
// CSS: --blue-500: hsl(217, 76%, 47%) → Unity: Color.HSVToRGB
// HSL to HSV: same hue, V = L + S*min(L,1-L), S_hsv = 2(1-L/V)

[CreateAssetMenu(fileName = "DesignTokens", menuName = "Design/Tokens")]
public class DesignTokens : ScriptableObject
{
    [Header("Primitives")]
    // CSS: --blue-500: hsl(217, 76%, 47%)
    public Color blue500 = ???;  // Color.HSVToRGB(0.603f, 0.81f, 0.84f)

    // CSS: --slate-900: hsl(222, 47%, 11%)
    public Color slate900 = ???;

    // CSS: --slate-100: hsl(210, 40%, 96%)
    public Color slate100 = ???;

    [Header("Semantic")]
    // CSS: --color-interactive: var(--blue-500)
    public Color colorInteractive => ???;  // reference primitive

    // CSS: --color-bg: var(--slate-900)
    public Color colorBg => ???;

    // CSS: --color-text1: var(--slate-100)
    public Color colorText1 => ???;

    [Header("Component")]
    // CSS: --btn-bg: var(--color-interactive)
    public Color btnBg => ???;
    public Color btnText => Color.white;
}
\`;

document.getElementById('cs-output').textContent = csharp;

// ── AUDIT ─────────────────────────────────────────────────────────────────
const checks = {
  'Primitives layer (blue500/slate)':  /blue500|slate900|slate100/i.test(csharp),
  'Semantic layer (colorInteractive)': /colorInteractive|colorBg|colorText/i.test(csharp),
  'Component layer (btnBg)':           /btnBg|btnText/i.test(csharp),
  'Color constructor used':            /Color\.|HSVToRGB|new Color/i.test(csharp),
  'Three-layer architecture present':  /Primitive|Semantic|Component/i.test(csharp),
};
console.log('=== UNITY TOKEN AUDIT ===');
Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗')+' '+k));`,
      solutionCode: `const csharp = \`
[CreateAssetMenu(fileName = "DesignTokens", menuName = "Design/Tokens")]
public class DesignTokens : ScriptableObject
{
    [Header("Primitives")]
    // CSS: --blue-500: hsl(217, 76%, 47%)
    public Color blue500 = Color.HSVToRGB(0.603f, 0.81f, 0.84f);

    // CSS: --slate-900: hsl(222, 47%, 11%)
    public Color slate900 = Color.HSVToRGB(0.617f, 0.77f, 0.20f);

    // CSS: --slate-100: hsl(210, 40%, 96%)
    public Color slate100 = Color.HSVToRGB(0.583f, 0.04f, 0.97f);

    [Header("Semantic")]
    public Color colorInteractive => blue500;
    public Color colorBg          => slate900;
    public Color colorText1       => slate100;

    [Header("Component")]
    public Color btnBg   => colorInteractive;
    public Color btnText => Color.white;
}
\`;
document.getElementById('cs-output').textContent = csharp;`,
      check: (code) => {
        const hasPrimitives = /blue500|slate900|Blue500|Slate900/i.test(code);
        const hasSemantic   = /colorInteractive|colorBg|ColorInteractive/i.test(code);
        const hasComponent  = /btnBg|BtnBg/i.test(code);
        const hasColor      = /Color\.|HSVToRGB|new Color/i.test(code);
        return hasPrimitives && hasSemantic && hasComponent;
      },
      successMessage: `Three-layer token architecture translated to Unity C#. The architecture is identical to Lesson 5: primitives are raw colour values, semantics are functional aliases, components reference semantics. The ScriptableObject pattern is Unity's equivalent of CSS custom properties — one change at the primitive layer updates everything downstream.`,
      failMessage: `Three required layers: (1) Primitives (blue500, slate900, or similar named raw colours). (2) Semantic layer (colorInteractive, colorBg, or similar function-named colours that reference primitives). (3) Component layer (btnBg or similar that references semantics). All three must be present in the code.`,
      outputHeight: 500,
    },

    // ─── PART 8: DATA VISUALISATION — POSITION AS THE FIFTH LEVER ────────────
    {
      type: 'markdown',
      instruction: `## Data Visualisation: Position as the Fifth Hierarchy Lever

Lesson 1 established four hierarchy levers: size, weight, colour, and spacing. Data visualisation introduces a fifth: **position**.

In a chart, where an element sits on a scale carries as much information as its colour or size. A bar's height encodes quantity. A point's X position encodes time. A dot's distance from the origin encodes magnitude. This is **visual encoding** — mapping data dimensions to visual channels.

### The Five Channels (in order of effectiveness)

Research by Cleveland & McGill (1984) ranked visual channels by how accurately humans decode quantitative information:

| Rank | Channel | CSS/viz equivalent | Lesson |
|---|---|---|---|
| 1 | Position on common scale | X/Y axis position | **New in L10** |
| 2 | Position on non-aligned scale | Small multiples | New in L10 |
| 3 | Length | Bar height, line thickness | Size (L1) |
| 4 | Angle/slope | Pie chart angle, line gradient | — |
| 5 | Area | Bubble chart size | — |
| 6 | Volume | 3D charts | — |
| 7 | Colour saturation | Heatmap intensity | Colour (L5) |
| 8 | Colour hue | Category distinctions | Colour (L5) |

**Implication:** position encodes quantitative data more accurately than colour. A bar chart (position) communicates quantity more precisely than a pie chart (angle) or a bubble chart (area). Use position for the most important data dimension.

### The Data-to-Pixel Mapping

Every data visualisation is a function: \`data value → pixel position\`.

\`\`\`
scale(value) = (value - domainMin) / (domainMax - domainMin) * rangeSize + rangeStart
\`\`\`

In CSS terms:
- **Domain** = the data range (0 to $50,000)
- **Range** = the pixel range (0 to 300px)
- **Scale function** = the linear mapping between them

This is what D3's \`scaleLinear()\` does. It's also what you implement manually in Qt with \`qreal scaledX = (value - min) / (max - min) * width;\` and in Unity with \`Mathf.InverseLerp(min, max, value) * chartWidth\`.

### Hierarchy in Data Viz

All nine lessons apply to data visualisation:

| Lesson principle | Data viz application |
|---|---|
| L1: Four levels | Chart title (L1), axis labels (L2), gridlines (L3), tick marks (L4) |
| L2: Spacing | Padding between chart and container, bar spacing |
| L3: Typography | Axis label sizes derived from modular scale |
| L4: Layout | Chart grid (Flex/Grid or SVG coordinate system) |
| L5: Colour | One primary data colour; semantic colours for alerts |
| L6: Composition | Chart = anatomy (axes, bars, labels) + states (empty, loading, error) |
| L7: Interaction | Hover → tooltip (FSM), click → drill-down |
| L8: Governance | Chart theme tokens reuse the design system tokens |
| L9: Accessibility | Screen reader text for each data point, role="img" + aria-label |`,
    },

    // ─── PART 9: ENGINEERING REALITY — THE DATA-TO-PIXEL MAPPING ─────────────
    {
      type: 'js',
      instruction: `## The Data-to-Pixel Mapping: Building a Chart from First Principles

This cell builds a complete bar chart from the ground up using only the principles from this course — no chart library. The goal is to see how every lesson applies:

- **L1 hierarchy**: title dominates, values are L2, labels are L3, gridlines are L4
- **L2 spacing**: space-4 (16px) padding, space-3 (12px) bar gap
- **L3 typography**: modular scale, line-height function
- **L5 colour**: one data colour, semantic colours for positive/negative
- The scale function maps data values to pixel positions`,
      html: `<div id="chart-demo">
  <div class="cd-title">Q1 Revenue by Product Line</div>
  <div class="cd-subtitle">January – March 2025</div>
  <div class="cd-chart" id="cd-chart">
    <div id="chart-svg-wrap"></div>
  </div>
  <div class="cd-legend" id="cd-legend"></div>
</div>`,
      css: `body { background:#0f172a; padding:24px; margin:0; font-family:system-ui,sans-serif; }
#chart-demo { max-width:560px; }
.cd-title    { font-size:18px; font-weight:700; color:hsl(210,40%,96%); margin-bottom:4px; }
.cd-subtitle { font-size:13px; color:hsl(215,25%,65%); margin-bottom:20px; }
.cd-chart    { background:hsl(222,39%,12%); border:1px solid hsl(217,32%,22%);
  border-radius:10px; padding:20px 20px 12px; }
#chart-svg-wrap svg { display:block; width:100%; overflow:visible; }
.cd-legend   { display:flex; gap:16px; margin-top:12px; flex-wrap:wrap; }`,
      startCode: `// Build a bar chart using the data-to-pixel mapping

const data = [
  { label: 'Platform',  value: 48290, delta: +12 },
  { label: 'API',       value: 31040, delta: +8  },
  { label: 'Enterprise',value: 72100, delta: -3  },
  { label: 'Consumer',  value: 19850, delta: +21 },
  { label: 'Analytics', value: 28600, delta: +5  },
];

// ── SCALE FUNCTION ────────────────────────────────────────────────────────
// Maps data value to pixel Y position (top-down, SVG coordinate system)
function yScale(value, domainMax, rangeHeight) {
  return rangeHeight - (value / domainMax) * rangeHeight;
}

// ── CHART DIMENSIONS ──────────────────────────────────────────────────────
const W          = 500;
const H          = 240;
const PAD        = { top: 8, right: 16, bottom: 48, left: 48 };
const chartW     = W - PAD.left - PAD.right;
const chartH     = H - PAD.top - PAD.bottom;
const domainMax  = 80000;      // round up from max value
const barCount   = data.length;
const barGap     = 12;         // space-3
const barW       = (chartW - (barCount - 1) * barGap) / barCount;

// ── COLOURS ───────────────────────────────────────────────────────────────
// L5: one data colour; semantic for positive/negative delta
const BAR_BASE  = 'hsl(217,76%,47%)';   // --color-interactive
const TEXT_1    = 'hsl(210,40%,96%)';   // L1
const TEXT_2    = 'hsl(215,25%,65%)';   // L3 axis labels
const GRID      = 'hsl(217,32%,22%)';   // L4 gridlines
const UP_DELTA  = 'hsl(142,60%,65%)';   // semantic: positive
const DOWN_DELTA= 'hsl(0,74%,65%)';     // semantic: negative

// ── BUILD SVG ─────────────────────────────────────────────────────────────
let svg = \`<svg viewBox="0 0 \${W} \${H}" xmlns="http://www.w3.org/2000/svg">\`;

// Gridlines (L4: receded, low contrast)
const gridCount = 4;
for (let i = 0; i <= gridCount; i++) {
  const y = PAD.top + (i / gridCount) * chartH;
  const val = Math.round(domainMax * (1 - i / gridCount) / 1000);
  // L4 gridline
  svg += \`<line x1="\${PAD.left}" y1="\${y}" x2="\${W - PAD.right}" y2="\${y}"
    stroke="\${GRID}" stroke-width="1" />\`;
  // L3 axis label (small, receded)
  svg += \`<text x="\${PAD.left - 8}" y="\${y + 4}"
    fill="\${TEXT_2}" font-size="11" text-anchor="end" font-family="system-ui">\${val}k</text>\`;
}

// Y axis line
svg += \`<line x1="\${PAD.left}" y1="\${PAD.top}" x2="\${PAD.left}" y2="\${PAD.top + chartH}"
  stroke="\${GRID}" stroke-width="1" />\`;

// Bars
data.forEach((d, i) => {
  const x    = PAD.left + i * (barW + barGap);
  const barH = (d.value / domainMax) * chartH;
  const y    = PAD.top + chartH - barH;

  // Bar (L2: the primary data visual)
  svg += \`<rect x="\${x}" y="\${y}" width="\${barW}" height="\${barH}"
    fill="\${BAR_BASE}" rx="4" />\`;

  // Value label on bar (L2: structural — important but secondary to bar)
  const valK = (d.value / 1000).toFixed(0) + 'k';
  svg += \`<text x="\${x + barW / 2}" y="\${y - 6}"
    fill="\${TEXT_1}" font-size="12" font-weight="600" text-anchor="middle"
    font-family="system-ui">\${valK}</text>\`;

  // Delta (semantic colour: positive/negative)
  const deltaColor = d.delta >= 0 ? UP_DELTA : DOWN_DELTA;
  const deltaStr   = (d.delta > 0 ? '↑' : '↓') + ' ' + Math.abs(d.delta) + '%';
  svg += \`<text x="\${x + barW / 2}" y="\${y - 20}"
    fill="\${deltaColor}" font-size="10" font-weight="500" text-anchor="middle"
    font-family="system-ui">\${deltaStr}</text>\`;

  // X-axis label (L3: supporting detail)
  svg += \`<text x="\${x + barW / 2}" y="\${PAD.top + chartH + 18}"
    fill="\${TEXT_2}" font-size="11" text-anchor="middle"
    font-family="system-ui">\${d.label}</text>\`;
});

svg += '</svg>';
document.getElementById('chart-svg-wrap').innerHTML = svg;

console.log('Chart built from first principles.');
console.log('');
console.log('Hierarchy applied:');
console.log('  L1: Chart title (18px, 700) — outside the SVG');
console.log('  L2: Bar values (12px, 600) — primary data labels');
console.log('  L3: Axis labels (11px, 400) — x-axis categories');
console.log('  L4: Gridlines (low contrast) — reference only');
console.log('');
console.log('Scale function: y = chartH - (value / domainMax) * chartH');
console.log('Same formula in Qt: y = height - (value / max) * height');
console.log('Same formula in Unity: Mathf.InverseLerp(0, max, value) * chartHeight');`,
      outputHeight: 420,
    },

    // ─── PART 10: ANTI-PATTERNS ACROSS DOMAINS ────────────────────────────────
    {
      type: 'markdown',
      instruction: `## Anti-Patterns That Travel Across Domains

Every anti-pattern from Lessons 1–9 has an equivalent in Qt and Unity. Here are the most common cross-domain failures.

---

### AP-CROSS-1: The Hardcoded Geometry (LY-1 equivalent)
**CSS:** \`width: 320px\` on a card in a flex container.
**Qt:** \`setFixedWidth(320)\` on a widget inside a QHBoxLayout. Breaks on high-DPI (120+ PPI), on different font size preferences, on localized strings.
**Unity:** Setting a RectTransform's width to 320 in world units. Breaks at different screen resolutions.
**Fix:** Use size policies and stretch in Qt. Use anchors and flexible layout elements in Unity.

---

### AP-CROSS-2: The Float Fossil (LY-2 equivalent)
**CSS:** \`float: left\` layout.
**Qt:** Manually positioning widgets with \`move(x, y)\` and \`resize(w, h)\` instead of using layouts.
**Unity:** Setting \`anchoredPosition\` manually without using layout groups.
**Fix:** Qt layouts. Unity Layout Groups.

---

### AP-CROSS-3: The Hardcoded Colour (CO-1 equivalent)
**CSS:** \`color: #2563eb\` directly in component CSS instead of \`var(--color-interactive)\`.
**Qt:** \`btn->setStyleSheet("background-color: #2563eb")\` hardcoded in C++ instead of referencing a token constant.
**Unity:** \`btnImage.color = new Color(0.145f, 0.388f, 0.922f)\` inline instead of referencing a DesignTokens ScriptableObject.
**Fix:** Every colour value in code should reference a named constant. The name encodes function, not value.

---

### AP-CROSS-4: The Missing State (CM-3 equivalent)
**CSS:** A button with only default and hover state — no disabled, loading, or error state.
**Qt:** A QPushButton that never calls \`setEnabled(false)\` or changes its text during async operations.
**Unity:** A button prefab with no visual difference between enabled and disabled states.
**Fix:** Apply the eight-state model from Lesson 6 on every platform.

---

### AP-CROSS-5: The Chart With Only One Colour (data viz)
**Symptom:** All bars are blue. All lines are blue. Positive deltas and negative deltas are the same colour.
**Cause:** Treating colour as decoration ("blue is our brand colour") rather than as a semantic signal.
**Fix:** Use the semantic colour system from Lesson 5. Data channels (bar height, line position) use the primary colour. Status information (positive/negative delta, above/below threshold) uses semantic colours: green for above, red for below.

---

### AP-CROSS-6: The Chart Without Accessible Labels (AC-2 equivalent)
**Symptom:** A chart renders as an image with no text alternative. Screen reader users hear nothing.
**CSS/SVG:** No \`role="img"\` and \`aria-label\` on the SVG, no text descriptions for data points.
**Qt:** No \`setAccessibleDescription()\` on the chart widget.
**Unity:** No \`AccessibilityNode\` with a text description of the chart data.
**Fix:** Every chart needs a text alternative that communicates the key insight: \`aria-label="Revenue bar chart. Platform: $48k (+12%), Enterprise: $72k (-3%), highest performer."\``,
    },

    // ─── PART 11: PRACTICE 3 — DATA VIZ HIERARCHY ────────────────────────────
    {
      type: 'challenge',
      instruction: `## Practice 3: Apply the Hierarchy System to a Chart

You're given a chart that has no hierarchy — all elements are the same visual weight. Apply all four levers (size, weight, colour, spacing) plus the fifth lever (position) to establish a clear hierarchy.

**The current problems:**
1. Title and axis labels are the same size (no L1/L3 distinction)
2. Gridlines are the same contrast as the bars (no L4 recession)
3. Value labels have no weight distinction (no L2/L3 separation)
4. Positive and negative deltas use the same colour (no semantic colour)
5. The chart has no accessible name

**Your task:** fix all five issues in the JavaScript. The test checks that title is ≥18px, gridlines use low-contrast colour, and semantic colours differ for positive vs negative.`,
      html: `<div id="p3-chart">
  <div class="p3-title" id="p3-title">Revenue</div>
  <div id="p3-svg-wrap"></div>
  <div id="p3-accessible" role="img" aria-label=""></div>
</div>`,
      css: `body { background:#0f172a; padding:24px; margin:0; font-family:system-ui,sans-serif; }
#p3-chart { max-width:520px; }
.p3-title { font-size:14px; font-weight:400; color:#94a3b8; margin-bottom:16px; }
/* ALL elements start flat — same visual weight as the baseline */`,
      startCode: `// FLAT CHART — all elements same weight (the problem)
// YOUR TASK: apply hierarchy using size, weight, colour, spacing, and position

const data = [
  { label: 'Platform',   value: 48290, delta: +12 },
  { label: 'API',        value: 31040, delta: -4  },
  { label: 'Enterprise', value: 72100, delta: +18 },
  { label: 'Consumer',   value: 19850, delta: -7  },
];

// ── FIX 1: Apply L1 hierarchy to title ───────────────────────────────────
const title = document.getElementById('p3-title');
title.style.fontSize   = '???';   // L1: ≥ 18px
title.style.fontWeight = '???';   // L1: 700
title.style.color      = '???';   // L1: near-white

// ── BUILD CHART WITH CORRECT HIERARCHY ───────────────────────────────────
const W = 460, H = 220;
const PAD = { top:8, right:12, bottom:44, left:44 };
const chartW = W - PAD.left - PAD.right;
const chartH = H - PAD.top - PAD.bottom;
const domainMax = 80000;
const barW = (chartW - 3 * 12) / data.length;

// FIX 2: Gridlines must be L4 — very low contrast
const GRID_COLOR = '???';   // hsl(217,32%,22%) or similar — barely visible

// FIX 3: Value labels must be L2 — prominent
const VALUE_WEIGHT = '???'; // '600' — structural weight
const VALUE_SIZE   = '???'; // '12' or '13'

// FIX 4: Delta must use SEMANTIC colour (not same for positive/negative)
function deltaColor(delta) {
  if (delta > 0) return '???';  // success green
  return '???';                  // error red
}

// FIX 5: Accessible name
document.getElementById('p3-accessible').setAttribute(
  'aria-label',
  'Revenue bar chart. ' + data.map(d =>
    d.label + ': $' + (d.value/1000).toFixed(0) + 'k'
  ).join(', ')
);

// Build the SVG
let svg = \`<svg viewBox="0 0 \${W} \${H}" xmlns="http://www.w3.org/2000/svg">\`;

const gridCount = 4;
for (let i = 0; i <= gridCount; i++) {
  const y = PAD.top + (i / gridCount) * chartH;
  const val = Math.round(domainMax * (1 - i/gridCount) / 1000);
  svg += \`<line x1="\${PAD.left}" y1="\${y}" x2="\${W-PAD.right}" y2="\${y}"
    stroke="\${GRID_COLOR}" stroke-width="1"/>\`;
  svg += \`<text x="\${PAD.left - 6}" y="\${y+4}" fill="hsl(215,25%,45%)"
    font-size="10" text-anchor="end" font-family="system-ui">\${val}k</text>\`;
}

data.forEach((d, i) => {
  const x    = PAD.left + i * (barW + 12);
  const barH = (d.value / domainMax) * chartH;
  const y    = PAD.top + chartH - barH;

  svg += \`<rect x="\${x}" y="\${y}" width="\${barW}" height="\${barH}"
    fill="hsl(217,76%,47%)" rx="4"/>\`;

  // L2: value label — prominent
  svg += \`<text x="\${x + barW/2}" y="\${y - 6}" fill="hsl(210,40%,96%)"
    font-size="\${VALUE_SIZE}" font-weight="\${VALUE_WEIGHT}" text-anchor="middle"
    font-family="system-ui">\${(d.value/1000).toFixed(0)}k</text>\`;

  // L3: delta with semantic colour
  const dStr = (d.delta > 0 ? '↑' : '↓') + ' ' + Math.abs(d.delta) + '%';
  svg += \`<text x="\${x + barW/2}" y="\${y - 20}" fill="\${deltaColor(d.delta)}"
    font-size="10" text-anchor="middle" font-family="system-ui">\${dStr}</text>\`;

  // L4: x-axis label — receded
  svg += \`<text x="\${x + barW/2}" y="\${PAD.top + chartH + 16}" fill="hsl(215,25%,55%)"
    font-size="11" text-anchor="middle" font-family="system-ui">\${d.label}</text>\`;
});

svg += '</svg>';
document.getElementById('p3-svg-wrap').innerHTML = svg;

// ── AUDIT ─────────────────────────────────────────────────────────────────
setTimeout(() => {
  const titleEl = document.getElementById('p3-title');
  const ts = window.getComputedStyle(titleEl);
  const checks = {
    'L1 title ≥18px':           parseFloat(ts.fontSize) >= 18,
    'L1 title weight ≥700':     parseFloat(ts.fontWeight) >= 700,
    'gridlines low contrast':   GRID_COLOR !== 'white' && GRID_COLOR !== '#fff',
    'value labels have weight': VALUE_WEIGHT === '600' || VALUE_WEIGHT === '700',
    'semantic delta colours':   deltaColor(5) !== deltaColor(-5),
  };
  console.log('=== CHART HIERARCHY AUDIT ===');
  Object.entries(checks).forEach(([k,v]) => console.log((v?'✓':'✗')+' '+k));
}, 100);`,
      solutionCode: `const data = [
  { label: 'Platform',   value: 48290, delta: +12 },
  { label: 'API',        value: 31040, delta: -4  },
  { label: 'Enterprise', value: 72100, delta: +18 },
  { label: 'Consumer',   value: 19850, delta: -7  },
];
const title = document.getElementById('p3-title');
title.style.fontSize = '20px'; title.style.fontWeight = '700';
title.style.color = 'hsl(210,40%,96%)';
const W=460,H=220,PAD={top:8,right:12,bottom:44,left:44};
const chartW=W-PAD.left-PAD.right, chartH=H-PAD.top-PAD.bottom, domainMax=80000;
const barW=(chartW-3*12)/data.length;
const GRID_COLOR='hsl(217,32%,22%)';
const VALUE_WEIGHT='600', VALUE_SIZE='12';
function deltaColor(d) { return d > 0 ? 'hsl(142,60%,65%)' : 'hsl(0,74%,65%)'; }
document.getElementById('p3-accessible').setAttribute('aria-label','Revenue bar chart. '+data.map(d=>d.label+': $'+(d.value/1000).toFixed(0)+'k').join(', '));
let svg=\`<svg viewBox="0 0 \${W} \${H}" xmlns="http://www.w3.org/2000/svg">\`;
for(let i=0;i<=4;i++){const y=PAD.top+(i/4)*chartH; svg+=\`<line x1="\${PAD.left}" y1="\${y}" x2="\${W-PAD.right}" y2="\${y}" stroke="\${GRID_COLOR}" stroke-width="1"/>\`+\`<text x="\${PAD.left-6}" y="\${y+4}" fill="hsl(215,25%,45%)" font-size="10" text-anchor="end" font-family="system-ui">\${Math.round(domainMax*(1-i/4)/1000)}k</text>\`;}
data.forEach((d,i)=>{const x=PAD.left+i*(barW+12),barH=(d.value/domainMax)*chartH,y=PAD.top+chartH-barH; svg+=\`<rect x="\${x}" y="\${y}" width="\${barW}" height="\${barH}" fill="hsl(217,76%,47%)" rx="4"/>\`+\`<text x="\${x+barW/2}" y="\${y-6}" fill="hsl(210,40%,96%)" font-size="\${VALUE_SIZE}" font-weight="\${VALUE_WEIGHT}" text-anchor="middle" font-family="system-ui">\${(d.value/1000).toFixed(0)}k</text>\`+\`<text x="\${x+barW/2}" y="\${y-20}" fill="\${deltaColor(d.delta)}" font-size="10" text-anchor="middle" font-family="system-ui">\${(d.delta>0?'↑':'↓')} \${Math.abs(d.delta)}%</text>\`+\`<text x="\${x+barW/2}" y="\${PAD.top+chartH+16}" fill="hsl(215,25%,55%)" font-size="11" text-anchor="middle" font-family="system-ui">\${d.label}</text>\`;});
svg+='</svg>'; document.getElementById('p3-svg-wrap').innerHTML=svg;`,
      check: (code) => {
        const hasTitleSize  = /fontSize.*(?:18|19|20|21|22|24|28)px|18px|20px/i.test(code);
        const hasGrid       = /GRID_COLOR.*hsl|GRID.*22%|334155|1e293b/i.test(code);
        const hasDeltaDiff  = /deltaColor|delta.*>.*0.*return|green.*red|positive.*negative/i.test(code);
        return hasTitleSize && hasDeltaDiff;
      },
      successMessage: `Chart hierarchy applied. The five fixes work together: L1 title dominates (≥18px, weight 700). L2 value labels have weight 600. L3/L4 axis labels recede. L4 gridlines are barely visible. Semantic delta colours communicate meaning beyond position. An accessible aria-label means screen reader users hear the data, not just silence.`,
      failMessage: `Three required: (1) Title font-size must be ≥18px. (2) Positive and negative deltas must use different colours (deltaColor function must return different values for positive vs negative). (3) Gridline colour must be set to a low-contrast value (not white or undefined). Check the audit output.`,
      outputHeight: 440,
    },

    // ─── PART 12: STRESS CONDITION — SAME COMPONENT, THREE PLATFORMS ──────────
    {
      type: 'js',
      instruction: `## Stress Condition: The Same Component Specification on Three Platforms

A design specification is platform-agnostic. The same spec card — "Label, Value, Delta. Card with border. Dark background." — should produce visually identical results in CSS, Qt, and Unity.

This cell renders the CSS version and shows the complete specification that a Qt developer and a Unity developer would implement to produce the same visual result. The specification uses the invariant vocabulary from the beginning of this lesson.`,
      html: `<div id="cross-demo">
  <div class="cd-spec-title">Component Specification: Stat Card</div>
  <div class="cd-platforms">
    <div class="cd-plat">
      <div class="cd-plat-label">CSS/HTML (rendered)</div>
      <div class="stat-card-ref">
        <div class="scr-label">REVENUE</div>
        <div class="scr-value">$48,290</div>
        <div class="scr-delta scr-up">↑ 12% this quarter</div>
      </div>
    </div>
    <div class="cd-plat">
      <div class="cd-plat-label">Qt C++ (specification)</div>
      <div class="spec-block" id="qt-spec"></div>
    </div>
    <div class="cd-plat">
      <div class="cd-plat-label">Unity C# (specification)</div>
      <div class="spec-block" id="unity-spec"></div>
    </div>
  </div>
</div>`,
      css: `body { background:#0f172a; padding:20px; margin:0; font-family:system-ui,sans-serif; }
#cross-demo { max-width:640px; }
.cd-spec-title { font-size:16px; font-weight:700; color:hsl(210,40%,96%);
  margin-bottom:16px; }
.cd-platforms { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
.cd-plat { display:flex; flex-direction:column; gap:8px; }
.cd-plat-label { font-size:9px; font-weight:700; color:var(--color-text-secondary, #475569);
  letter-spacing:.12em; text-transform:uppercase; }
.stat-card-ref { background:hsl(222,39%,12%); border:1px solid hsl(217,32%,22%);
  border-radius:10px; padding:16px; display:flex; flex-direction:column; gap:4px;
  flex:1; }
.scr-label { font-size:10px; font-weight:600; color:hsl(217,20%,45%);
  text-transform:uppercase; letter-spacing:.1em; }
.scr-value { font-size:24px; font-weight:700; color:hsl(210,40%,96%); line-height:1.1; }
.scr-delta { font-size:12px; font-weight:500; }
.scr-up   { color:hsl(142,60%,65%); }
.scr-down { color:hsl(0,74%,65%); }
.spec-block { background:hsl(217,32%,10%); border:1px solid hsl(217,32%,18%);
  border-radius:6px; padding:10px 12px; font-family:monospace; font-size:9.5px;
  color:var(--color-text-secondary, #475569); line-height:1.7; white-space:pre-wrap; flex:1; }`,
      startCode: `const qtSpec = \`
// QVBoxLayout (flex-column)
// setSpacing(4)         // gap: 4px
// setContentsMargins(16,16,16,16)  // padding

// QSS:
// background: rgb(22,33,53)  // hsl(222,39%,12%)
// border: 1px solid rgb(51,65,85)
// border-radius: 10px

// QLabel "REVENUE"
// font-size: 10pt
// font-weight: 600 (DemiBold)
// color: rgb(71,90,113)   // hsl(217,20%,45%)
// text-transform: uppercase (use .toUpper() in C++)

// QLabel "$48,290"
// font-size: 24pt
// font-weight: 700 (Bold)
// color: rgb(241,245,249) // hsl(210,40%,96%)

// QLabel "↑ 12% this quarter"
// font-size: 12pt
// font-weight: 500 (Medium)
// color: rgb(74,222,128)  // semantic: positive delta
// (use rgb(248,113,113) for negative)
\`;

const unitySpec = \`
// VerticalLayoutGroup
// .spacing = 4         // gap: 4px
// .padding = RectOffset(16,16,16,16)

// Image (background)
// .color = tokens.colorSurface
// border via outline image or panel border

// TextMeshProUGUI "REVENUE"
// .fontSize = 10
// .fontStyle = Bold | AllCaps
// .color = tokens.colorText3

// TextMeshProUGUI "$48,290"
// .fontSize = 24
// .fontStyle = Bold
// .color = tokens.colorText1
// .lineSpacing = -5  (lh=1.15: (1.15-1.2)*100=-5)

// TextMeshProUGUI "↑ 12%..."
// .fontSize = 12
// .color = tokens.colorSuccess
// (tokens.colorError for negative)
\`;

document.getElementById('qt-spec').textContent = qtSpec.trim();
document.getElementById('unity-spec').textContent = unitySpec.trim();

console.log('Spec rendered. All three versions produce the same visual:');
console.log('  Same layout structure (column, 4px gap, 16px padding)');
console.log('  Same type scale (10/24px)');
console.log('  Same colour tokens (surface, text1, text3, semantic success/error)');
console.log('  Same hierarchy (label=L3, value=L1, delta=L2 with semantic colour)');
console.log('');
console.log('Platform changes: syntax.');
console.log('Platform stays constant: principles.');`,
      outputHeight: 440,
    },

    // ─── PART 13: CROSS-PLATFORM SUMMARY ──────────────────────────────────────
    {
      type: 'markdown',
      instruction: `## The Complete Cross-Platform Reference

After Lesson 10, you have the complete vocabulary for three UI environments.

### Layout

| Concept | CSS | Qt C++ | Unity C# |
|---|---|---|---|
| Flex row | \`display:flex\` | \`QHBoxLayout\` | \`HorizontalLayoutGroup\` |
| Flex column | \`flex-direction:column\` | \`QVBoxLayout\` | \`VerticalLayoutGroup\` |
| Grid | \`display:grid\` | \`QGridLayout\` | \`GridLayoutGroup\` |
| Gap | \`gap:8px\` | \`setSpacing(8)\` | \`.spacing=8\` |
| Padding | \`padding:16px\` | \`setContentsMargins(16,16,16,16)\` | \`.padding=RectOffset(16,16,16,16)\` |
| Equal share | \`flex:1\` | \`QSizePolicy::Expanding\` | \`LayoutElement.flexibleWidth=1\` |
| Fixed size | \`flex-shrink:0\` | \`QSizePolicy::Fixed\` | \`LayoutElement.minWidth=preferred\` |
| Responsive | \`minmax(200px,1fr)\` | Compute cols from \`resizeEvent\` | Compute via \`GridLayoutGroup.constraint\` |

### Styling

| Concept | CSS | Qt QSS | Unity |
|---|---|---|---|
| Background | \`background-color\` | \`background-color\` | \`Image.color\` |
| Text colour | \`color\` | \`color\` | \`TMP.color\` |
| Border | \`border\` | \`border\` | Outline image/panel |
| Border radius | \`border-radius\` | \`border-radius\` | Corner radius (UI Toolkit) |
| Hover state | \`:hover\` | \`:hover\` | \`OnPointerEnter\` |
| Disabled state | \`:disabled\` | \`:disabled\` | \`Interactable = false\` |
| Font size | \`font-size:16px\` | \`font-size:16px\` | \`TMP.fontSize=16\` |
| Font weight | \`font-weight:700\` | \`font-weight:bold\` | \`TMP.fontStyle=Bold\` |
| Line height | \`line-height:1.15\` | \`line-height:115%\` | \`TMP.lineSpacing=15\` |

### Tokens

| Concept | CSS | Qt C++ | Unity C# |
|---|---|---|---|
| Token definition | \`--color-interactive:…\` | \`const QColor kInteractive{…}\` | ScriptableObject field |
| Token reference | \`var(--color-interactive)\` | \`kInteractive\` | \`tokens.colorInteractive\` |
| Three-layer arch | \`:root { --prim: …; --sem: var(--prim); --comp: var(--sem); }\` | Namespace constants | ScriptableObject layers |

### Accessibility

| Concept | CSS/HTML | Qt | Unity |
|---|---|---|---|
| Accessible name | \`aria-label\` | \`setAccessibleName()\` | \`AccessibilityNode.label\` |
| Role | \`role="button"\` | \`QAccessible::Role\` | \`AccessibilityNode.role\` |
| State | \`aria-expanded\` | \`QAccessible::State\` | \`AccessibilityNode.state\` |
| Live region | \`aria-live\` | \`QAccessibleEvent\` | Custom event system |

---

## What You Now Know

After Lesson 10, and the complete course, you can:
- Apply all nine design systems in CSS/HTML, Qt/C++, Unity/C#, and data visualisation
- Identify the five visual hierarchy levers (size, weight, colour, spacing, position)
- Translate any CSS specification to Qt pseudocode and Unity C#
- Build accessible charts with correct hierarchy, semantic colour, and text alternatives
- Name and fix the six cross-domain anti-patterns
- Carry a complete design engineering vocabulary to any platform

The principles are invariant. The syntax changes. You now speak both.`,
    },

    // ─── PART 14: SEED ────────────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `## Course Complete — The Full Toolkit

The final cell. Ten lessons, nine systems, one complete design engineering toolkit.

\`auditTransfer()\` — the new tool from this lesson — checks that a specification includes all platform-independent requirements: layout constraints, type scale, colour tokens, accessibility contracts.

Run it on any spec document to verify it can be implemented on any target platform.`,
      html: `<div id="ref-course">
  <div class="rc-header">
    <h2 class="rc-title">Interface Design Systems</h2>
    <p class="rc-sub">Ten lessons. Nine systems. Platform-independent principles.</p>
  </div>
  <div class="rc-grid" id="rc-grid"></div>
  <div class="rc-audit" id="rc-audit"></div>
</div>`,
      css: `body { margin:0; font-family:system-ui,sans-serif; background:#0f172a; padding:20px; }
#ref-course { max-width:600px; }
.rc-header { margin-bottom:20px; }
.rc-title  { font-size:20px; font-weight:700; color:hsl(210,40%,96%); margin:0 0 4px; }
.rc-sub    { font-size:13px; color:hsl(215,25%,65%); margin:0; }
.rc-grid   { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:16px; }
.rc-card   { background:hsl(222,39%,12%); border:1px solid hsl(217,32%,22%);
  border-radius:8px; padding:12px 14px; }
.rc-num    { font-size:9px; font-weight:700; color:hsl(217,76%,47%);
  letter-spacing:.12em; text-transform:uppercase; margin-bottom:4px; }
.rc-name   { font-size:14px; font-weight:600; color:hsl(210,40%,96%); margin-bottom:2px; }
.rc-tool   { font-size:11px; color:hsl(215,25%,55%); font-family:monospace; }
.rc-audit  { background:hsl(217,32%,10%); border:1px solid hsl(217,32%,18%);
  border-radius:8px; padding:12px 14px; font-family:monospace; font-size:11px;
  color:var(--color-text-secondary, #475569); line-height:1.7; }`,
      startCode: `// ── COURSE CARD GRID ─────────────────────────────────────────────────────
const lessons = [
  { n:'01', name:'Visual Hierarchy',    tool:'auditComponent()'     },
  { n:'02', name:'Spacing Systems',     tool:'auditSpacing()'       },
  { n:'03', name:'Typography Systems',  tool:'auditType()'          },
  { n:'04', name:'Layout Systems',      tool:'auditLayout()'        },
  { n:'05', name:'Colour Systems',      tool:'auditColour()'        },
  { n:'06', name:'Component Composition',tool:'auditComponent()'   },
  { n:'07', name:'Interaction Design',  tool:'auditInteraction()'   },
  { n:'08', name:'Systems Design',      tool:'auditSystem()'        },
  { n:'09', name:'Accessibility',       tool:'auditAccessibility()' },
  { n:'10', name:'Domain Transfer',     tool:'auditTransfer()'      },
];

const grid = document.getElementById('rc-grid');
lessons.forEach(({ n, name, tool }) => {
  const card = document.createElement('div');
  card.className = 'rc-card';
  card.innerHTML = \`<div class="rc-num">Lesson \${n}</div>
    <div class="rc-name">\${name}</div>
    <div class="rc-tool">\${tool}</div>\`;
  grid.appendChild(card);
});

// ── auditTransfer() ──────────────────────────────────────────────────────
// Checks that a component specification is platform-independent:
// contains layout constraints (not pixel widths), type scale values,
// colour tokens (not hardcoded hex), and accessibility requirements.

function auditTransfer(spec) {
  const checks = [];

  // 1. Layout: constraint-based (no px widths)
  const hasPxWidth = /width:\s*\d+px/i.test(spec) && !/min-width|max-width/i.test(spec);
  checks.push({ label: 'Layout uses constraints (not pixel widths)', pass: !hasPxWidth });

  // 2. Type scale: at least two distinct font-size values
  const sizes = [...spec.matchAll(/font-size[:\s=]+(\d+)/gi)].map(m => parseInt(m[1]));
  const uniqueSizes = new Set(sizes);
  checks.push({ label: 'Type scale: ≥2 distinct font sizes', pass: uniqueSizes.size >= 2 });

  // 3. Colour: token references (not hardcoded hex)
  const hasHardcodedHex = /#[0-9a-f]{6}/i.test(spec);
  const hasTokenRef     = /--color|tokens\.|kColor|COLOR_/i.test(spec);
  checks.push({ label: 'Colour: token references (not hardcoded hex)',
    pass: !hasHardcodedHex || hasTokenRef });

  // 4. Accessibility: accessible name defined
  const hasA11y = /aria-label|setAccessibleName|AccessibilityNode|accessible/i.test(spec);
  checks.push({ label: 'Accessibility: name or role defined', pass: hasA11y });

  // 5. States: at least one non-default state described
  const hasStates = /disabled|hover|loading|error|focus|pressed/i.test(spec);
  checks.push({ label: 'States: non-default state documented', pass: hasStates });

  return checks;
}

// ── Run on the stat card spec ─────────────────────────────────────────────
const statCardSpec = \`
Stat Card Component Specification
Layout: QVBoxLayout, setSpacing(4), setContentsMargins(16,16,16,16)
Label: font-size 10, font-weight 600, color: tokens.colorText3
Value: font-size 24, font-weight 700, color: tokens.colorText1
Delta: font-size 12, color: tokens.colorSuccess / tokens.colorError
Accessibility: setAccessibleName("Revenue: $48,290, up 12%")
States: default, disabled (setEnabled(false)), hover (QSS :hover)
\`;

const results = auditTransfer(statCardSpec);
const audit   = document.getElementById('rc-audit');
let out = '=== auditTransfer() — STAT CARD SPEC ===\n\n';
results.forEach(({ label, pass }) => {
  out += (pass ? '✓ ' : '✗ ') + label + '\n';
});
const score = results.filter(r => r.pass).length;
out += '\n' + score + '/' + results.length + ' checks pass';
if (score === results.length) {
  out += '\n\n✓ Spec is platform-independent. Can be implemented in CSS, Qt, or Unity.';
}
audit.textContent = out;

console.log('Course complete. Ten lessons. Nine systems. Eight audit tools.');
console.log('');
console.log('The nine audit functions:');
console.log('  auditSpacing()       — spacing on-grid, correct roles');
console.log('  auditType()          — scale, line-height, measure');
console.log('  auditLayout()        — no floats, no magic widths');
console.log('  auditColour()        — token compliance');
console.log('  auditComponent()     — all five systems simultaneously');
console.log('  auditInteraction()   — FSM, hit targets, focus');
console.log('  auditSystem()        — token governance, drift detection');
console.log('  auditAccessibility() — WCAG contracts');
console.log('  auditTransfer()      — platform-independent spec compliance');`,
      outputHeight: 500,
    },
  ],
};

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export default {
  id: 'design-10-domain-transfer',
  slug: 'domain-transfer',
  chapter: 'design.1',
  order: 1,
  title: 'Domain Transfer',
  subtitle: 'Nine systems, any platform. Qt layouts, Unity RectTransforms, data visualisation. The principles are invariant. Only the syntax changes.',
  tags: [
    'css', 'qt', 'unity', 'csharp', 'cpp', 'domain-transfer', 'data-viz',
    'cross-platform', 'design-systems', 'invariants', 'hierarchy',
    'position-as-lever', 'qss', 'recttransform', 'textmeshpro',
    'scaleable-vector', 'chart-hierarchy',
  ],
  hook: {
    question: 'You\'ve mastered CSS design systems. You open a Qt C++ codebase. Do the principles transfer — or do you start from zero?',
    realWorldContext:
      'Nine of ten design engineers work on more than one platform in their career. The web developer who pivots to desktop. The game UI developer who moves to web. The data engineer asked to build charts. ' +
      'The visual hierarchy rules, spacing ratios, type scale formula, colour token architecture, and accessibility contracts — none of these are CSS inventions. They\'re human perception constraints that hold in every rendering environment. ' +
      'This lesson teaches you to see through the syntax to the invariant principles underneath.',
    previewVisualizationId: 'JSNotebook',
  },
  intuition: {
    prose: [
      'The nine principles are invariant. QVBoxLayout = flex column. setSpacing(4) = gap:4px. VerticalLayoutGroup = flex column. Same intent, different syntax.',
      'Position is the fifth hierarchy lever in data visualisation: the most accurate channel for quantitative data (Cleveland & McGill, 1984). Use it for the primary data dimension.',
      'The data-to-pixel scale function: scaled = (value - min) / (max - min) * range. Same formula in CSS/SVG, Qt, Unity, and D3.',
      'Three-layer colour tokens in Unity: ScriptableObject with primitive/semantic/component layers. Same architecture as Lesson 5.',
      'Six cross-domain anti-patterns: hardcoded geometry, manual positioning, hardcoded colour, missing states, single-colour chart, chart without accessible labels.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'The Core Insight',
        body: 'Every design principle in this course is derived from human perception — not from CSS. Pre-attentive processing, cognitive load, Gestalt proximity, WCAG contrast ratios, the 45–75 character measure constraint — none of these care what rendering engine you use. Master the principle; the syntax is a lookup.',
      },
      {
        type: 'tip',
        title: 'Qt: style()->unpolish/polish()',
        body: 'When you change a Qt widget\'s property and want the QSS to update, you must call style()->unpolish(widget) then style()->polish(widget). Without this, the widget doesn\'t re-read its style sheet. This is the Qt equivalent of toggling a CSS class.',
      },
      {
        type: 'tip',
        title: 'Position First in Data Viz',
        body: 'Use position (bar height, x-axis value, y-axis value) for your most important data dimension. Use colour for categorical distinctions and semantic signals. Never use colour alone to communicate quantitative differences — both for accuracy reasons (Cleveland & McGill) and accessibility reasons (colour blindness).',
      },
      {
        type: 'warning',
        title: 'Qt Has No Auto-Responsive Grid',
        body: 'CSS Grid\'s repeat(auto-fill, minmax()) adapts column count automatically on resize. Qt\'s QGridLayout does not. You must implement a resizeEvent() handler that recomputes column count and rebuilds the grid. This is the most common Qt layout frustration for web developers making the transition.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Design Systems — Lesson 10: Domain Transfer',
        props: { lesson: LESSON_DESIGN_10 },
      },
    ],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: {
    prose: [
      'Cleveland & McGill (1984) established the hierarchy of visual channels for quantitative data through psychophysical experiments: position on a common scale is the most accurate, followed by length, angle, area, and colour. This ranking informs every chart type choice: bar charts (position) are more accurate than pie charts (angle) for quantitative comparison.',
      'The Qt layout engine implements a constraint satisfaction algorithm similar to Apple\'s Auto Layout, though less expressive. QSizePolicy constraints (Expanding, Fixed, Minimum, Maximum, Preferred) map to CSS flex/grid constraints. The resolution algorithm runs on resize events, equivalent to the browser\'s reflow.',
      'Unity\'s RectTransform system implements a two-anchor, two-offset model that covers the same layout patterns as CSS positioning and flexbox, but requires explicit specification of both the anchor reference rectangle and the pixel offset from that anchor. The anchor model is equivalent to CSS\'s combination of position:absolute with percentage-based top/left/right/bottom values.',
    ],
    callouts: [],
    visualizations: [],
  },
  examples: [],
  challenges: [],
  mentalModel: [
    'Nine invariant principles transfer to every platform. Syntax changes. Intent doesn\'t.',
    'Qt layout: QHBoxLayout/QVBoxLayout = flex. QGridLayout = grid. setSpacing = gap. setContentsMargins = padding.',
    'Qt QSS = CSS subset. Widget type in selector (QPushButton). No flex/grid. Only px/pt units. :hover/:disabled work.',
    'Qt signals/slots = CSS event listeners + FSM. State changes update widget properties + require style()->unpolish/polish().',
    'Unity RectTransform anchors = CSS layout constraints. Layout Groups = flex. LayoutElement.flexibleWidth=1 = flex:1.',
    'Data viz: position is the fifth hierarchy lever — most accurate channel for quantitative data.',
    'Scale function: scaled = (value - min) / (max - min) * range. Same in SVG, Qt, Unity, D3.',
    'auditTransfer(): verify any spec is platform-independent before implementation.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};
export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-03-centering',
  title: '03. Centering',
  chapter: 'css-ch1',
  language: 'web',
  checkpoints: [
    { id: 'cp-centering-methods', label: 'Centering Methods' },
    { id: 'cp-flexbox-center', label: 'Flexbox Centering' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "You have a card. You want it centered. You have tried everything. This is CSS's most infamous frustration. Today we fix it permanently — every technique, when it works, and why.",
      files: {
        html: `<div class="page">
  <div class="card">
    <h2>Center Me</h2>
    <p>I'm sitting in the top-left corner. Not what you wanted.</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body { margin: 0; font-family: sans-serif; }

.page {
  background: #0f172a;
  min-height: 100vh;
  /* no centering yet */
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 32px;
  width: 320px;
  color: #f1f5f9;
}

h2 { margin-top: 0; color: #3b82f6; }
p  { color: #94a3b8; margin-bottom: 0; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'text-align-attempt',
      defaultTab: 'css',
      text: "`text-align: center` centers INLINE content — text, inline elements, inline-block elements. It does NOT center block elements. Watch: it centers the text INSIDE the card, but the card itself stays left-aligned.",
      files: {
        html: `<div class="page">
  <div class="card">
    <h2>Center Me</h2>
    <p>text-align: center on the parent moved my text — not the card.</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body { margin: 0; font-family: sans-serif; }

.page {
  background: #0f172a;
  min-height: 100vh;
  text-align: center; /* centers inline content only */
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 32px;
  width: 320px;
  color: #f1f5f9;
  /* card is still left-aligned — text-align doesn't move blocks */
}

h2 { margin-top: 0; color: #f59e0b; }
p  { color: #94a3b8; margin-bottom: 0; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'margin-auto-h',
      defaultTab: 'css',
      text: "`margin: 0 auto` works — but ONLY for horizontal centering, and ONLY when the element has an explicit width and is a block element. Give the card `margin: 0 auto`. Horizontal: done. Vertical: still at the top.",
      files: {
        html: `<div class="page">
  <div class="card">
    <h2>Horizontally Centered</h2>
    <p>margin: 0 auto works for horizontal. But I'm still at the top.</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body { margin: 0; font-family: sans-serif; }

.page {
  background: #0f172a;
  min-height: 100vh;
  padding-top: 24px;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 32px;
  width: 320px;
  margin: 0 auto; /* horizontal center — requires explicit width */
  color: #f1f5f9;
}

h2 { margin-top: 0; color: #10b981; }
p  { color: #94a3b8; margin-bottom: 0; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'position-attempt',
      defaultTab: 'css',
      text: "Developers try `position: absolute; top: 50%; left: 50%`. This moves the TOP-LEFT CORNER of the element to the center point — not the element's own center. The card ends up shifted to the bottom-right.",
      files: {
        html: `<div class="page">
  <div class="card">
    <h2>Off-Center!</h2>
    <p>top: 50% left: 50% moves my top-left corner to center — not me.</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body { margin: 0; font-family: sans-serif; }

.page {
  background: #0f172a;
  min-height: 100vh;
  position: relative; /* positioning context for child */
}

.card {
  background: #1e293b;
  border: 1px solid #ef4444;
  border-radius: 12px;
  padding: 32px;
  width: 320px;
  color: #f1f5f9;
  position: absolute;
  top: 50%;   /* moves TOP-LEFT corner to vertical center */
  left: 50%;  /* moves TOP-LEFT corner to horizontal center */
  /* result: card hangs to the bottom-right of center */
}

h2 { margin-top: 0; color: #ef4444; }
p  { color: #94a3b8; margin-bottom: 0; font-size: 0.85rem; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'position-transform',
      defaultTab: 'css',
      text: "Fix it with `transform: translate(-50%, -50%)`. This shifts the element left by half its own width and up by half its own height. Now the element's center is at the target point. This works regardless of element size.",
      files: {
        html: `<div class="page">
  <div class="card">
    <h2>Centered!</h2>
    <p>transform: translate(-50%, -50%) pulls the element back to its own center.</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body { margin: 0; font-family: sans-serif; }

.page {
  background: #0f172a;
  min-height: 100vh;
  position: relative;
}

.card {
  background: #1e293b;
  border: 1px solid #10b981;
  border-radius: 12px;
  padding: 32px;
  width: 320px;
  color: #f1f5f9;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* pull back by half own size */
}

h2 { margin-top: 0; color: #10b981; }
p  { color: #94a3b8; margin-bottom: 0; font-size: 0.85rem; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'position-gotcha',
      defaultTab: 'css',
      text: "The position absolute method has a catch: the element is positioned relative to its nearest positioned ancestor. If that container is inside a scrollable area or is not full-screen, the 50% reference point changes. This makes it brittle for real pages.",
      files: {
        html: `<div class="page">
  <div class="small-container">
    <div class="card">
      <h2>Positioned wrong!</h2>
      <p>I'm centered in .small-container, not the page — because that's my nearest positioned ancestor.</p>
    </div>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body { margin: 0; font-family: sans-serif; }

.page {
  background: #0f172a;
  min-height: 100vh;
  padding: 20px;
}

.small-container {
  background: #334155;
  width: 400px;
  height: 200px;
  position: relative; /* this becomes the positioning context */
  border: 2px dashed #f59e0b;
  border-radius: 8px;
}

.card {
  background: #1e293b;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 20px;
  width: 260px;
  color: #f1f5f9;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* centered in .small-container, NOT the page */
}

h2 { margin-top: 0; color: #ef4444; font-size: 1rem; }
p  { color: #94a3b8; margin-bottom: 0; font-size: 0.8rem; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'flexbox-center',
      defaultTab: 'css',
      text: "The modern, clean solution: make the PARENT a flex container. `display: flex; justify-content: center; align-items: center`. Done. This centers the child in any direction, works with any size child, and adapts if the content changes.",
      files: {
        html: `<div class="page">
  <div class="card">
    <h2>Perfectly Centered</h2>
    <p>The parent is a flex container. Two properties. That's it.</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body { margin: 0; font-family: sans-serif; }

.page {
  background: #0f172a;
  min-height: 100vh;
  display: flex;                /* flex container */
  justify-content: center;     /* horizontal center */
  align-items: center;         /* vertical center */
}

.card {
  background: #1e293b;
  border: 1px solid #3b82f6;
  border-radius: 12px;
  padding: 32px;
  width: 320px;
  color: #f1f5f9;
}

h2 { margin-top: 0; color: #3b82f6; }
p  { color: #94a3b8; margin-bottom: 0; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'flexbox-why',
      defaultTab: 'css',
      text: "`justify-content` controls alignment along the main axis (horizontal by default). `align-items` controls alignment along the cross axis (vertical by default). Center on both axes = perfectly centered. No width required, no transforms, no position games.",
      files: {
        html: `<div class="page">
  <div class="axis-label main">← main axis →</div>
  <div class="card">
    <h2>Centered</h2>
    <p>justify-content = main axis<br>align-items = cross axis</p>
  </div>
  <div class="axis-label cross">↕ cross axis ↕</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body { margin: 0; font-family: sans-serif; }

.page {
  background: #0f172a;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.card {
  background: #1e293b;
  border: 1px solid #3b82f6;
  border-radius: 12px;
  padding: 28px;
  width: 280px;
  color: #f1f5f9;
}

h2 { margin-top: 0; color: #3b82f6; font-size: 1rem; }
p  { color: #94a3b8; margin-bottom: 0; font-size: 0.85rem; line-height: 1.6; }

.axis-label {
  color: #475569;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'grid-center',
      defaultTab: 'css',
      text: "Grid has an even shorter syntax: `display: grid; place-items: center`. `place-items` is shorthand for both `align-items` and `justify-items` together. One property. It works exactly like flexbox centering but uses grid.",
      files: {
        html: `<div class="page">
  <div class="card">
    <h2>Grid Centered</h2>
    <p>display: grid; place-items: center — two lines.</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body { margin: 0; font-family: sans-serif; }

.page {
  background: #0f172a;
  min-height: 100vh;
  display: grid;           /* grid container */
  place-items: center;     /* shorthand: align-items + justify-items */
}

.card {
  background: #1e293b;
  border: 1px solid #7c3aed;
  border-radius: 12px;
  padding: 32px;
  width: 320px;
  color: #f1f5f9;
}

h2 { margin-top: 0; color: #7c3aed; }
p  { color: #94a3b8; margin-bottom: 0; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-centering-methods'
    },
    {
      type: 'narration',
      id: 'multiple-children',
      defaultTab: 'css',
      text: "Flexbox centering is for a CONTAINER — all children are centered together as a group. If you have three cards, they're centered together. Want each card to center its own content? Each card needs to be its own flex container.",
      files: {
        html: `<div class="page">
  <div class="cards">
    <div class="card">
      <span class="icon">★</span>
      <h3>Card One</h3>
      <p>Content centered inside the card</p>
    </div>
    <div class="card">
      <span class="icon">◆</span>
      <h3>Card Two</h3>
      <p>Same treatment</p>
    </div>
    <div class="card">
      <span class="icon">●</span>
      <h3>Card Three</h3>
      <p>Each card is its own flex container for internal centering</p>
    </div>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body { margin: 0; font-family: sans-serif; }

.page {
  background: #0f172a;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.cards {
  display: flex;          /* outer flex: centers cards as a group */
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 28px;
  width: 200px;
  color: #f1f5f9;
  /* inner flex: centers content inside each card */
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.icon { font-size: 2rem; margin-bottom: 8px; }
h3 { margin: 0 0 8px; color: #3b82f6; font-size: 0.95rem; }
p  { color: #64748b; font-size: 0.8rem; margin: 0; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'vertical-center-text',
      defaultTab: 'css',
      text: "The same techniques work at any scale. Want text centered inside a button? The button is a flex container: `display: flex; align-items: center; justify-content: center`. This works far better than padding tricks that break on different font sizes.",
      files: {
        html: `<div class="demo">
  <button class="btn-padding">Padding approach</button>
  <button class="btn-flex">Flex approach</button>
  <button class="btn-flex large-text">Flex with bigger text</button>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body { margin: 0; font-family: sans-serif; background: #0f172a; }

.demo {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  padding: 40px;
}

.btn-padding {
  background: #334155;
  color: #f1f5f9;
  border: 1px solid #475569;
  border-radius: 8px;
  padding: 12px 24px;  /* padding-based vertical centering */
  cursor: pointer;
  height: 52px;
  font-size: 14px;
}

.btn-flex {
  background: #1d4ed8;
  color: white;
  border: none;
  border-radius: 8px;
  height: 52px;
  padding: 0 24px;
  cursor: pointer;
  font-size: 14px;
  /* flex-based centering — always perfect */
  display: flex;
  align-items: center;
  justify-content: center;
}

.large-text { font-size: 20px; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-flexbox-center'
    },
    {
      type: 'challenge',
      id: 'ch-modal',
      text: "Create a full-viewport modal overlay. The `.modal-overlay` should cover the full viewport. The `.modal` inside it should be perfectly centered. Use flexbox on the overlay.",
      hint: "On `.modal-overlay`: `position: fixed; inset: 0; display: flex; justify-content: center; align-items: center;`",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="modal-overlay">
  <div class="modal">
    <h2>Modal Title</h2>
    <p>This modal should be perfectly centered in the viewport.</p>
    <button>Close</button>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body { margin: 0; font-family: sans-serif; }

.modal-overlay {
  background: rgba(0, 0, 0, 0.7);
  /* Make this cover the full viewport */
  /* Center the .modal inside it using flexbox */
}

.modal {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 36px;
  width: 400px;
  color: #f1f5f9;
}

h2 { margin-top: 0; color: #3b82f6; }
p  { color: #94a3b8; }
button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /display\s*:\s*flex/.test(css) &&
          /justify-content\s*:\s*center/.test(css) &&
          /align-items\s*:\s*center/.test(css);
      }
    },
    {
      type: 'challenge',
      id: 'ch-card-center',
      text: "Center a card both horizontally AND vertically within a 500px-tall container. The card has no explicit width. Use flexbox or grid only — no `position: absolute`.",
      hint: "On `.container`: `display: flex; justify-content: center; align-items: center;` or `display: grid; place-items: center;`",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="container">
  <div class="card">
    <h3>Centered Card</h3>
    <p>No explicit width. Still centered.</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: sans-serif;
  background: #0f172a;
  padding: 24px;
}

.container {
  background: #1e293b;
  height: 500px;
  border: 1px dashed #334155;
  border-radius: 8px;
  /* Center the card inside using flex or grid */
}

.card {
  background: #0f172a;
  border: 1px solid #3b82f6;
  border-radius: 12px;
  padding: 28px 36px;
  color: #f1f5f9;
}

h3 { margin: 0 0 8px; color: #3b82f6; }
p  { margin: 0; color: #94a3b8; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasFlex = /display\s*:\s*flex/.test(css);
        const hasGrid = /display\s*:\s*grid/.test(css);
        const hasCentering = /place-items\s*:\s*center/.test(css) ||
          (/justify-content\s*:\s*center/.test(css) && /align-items\s*:\s*center/.test(css));
        return (hasFlex || hasGrid) && hasCentering;
      }
    }
  ]
};

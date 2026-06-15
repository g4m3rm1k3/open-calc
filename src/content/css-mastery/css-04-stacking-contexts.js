export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-04-stacking-contexts',
  title: '04. Stacking Contexts',
  chapter: 'css-ch1',
  language: 'web',
  checkpoints: [
    { id: 'cp-stacking', label: 'Stacking Contexts' },
    { id: 'cp-z-index', label: 'Z-Index Rules' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "You have a tooltip. You give it `z-index: 9999`. It is still appearing BEHIND another element. You've been debugging for an hour. The problem is a stacking context you didn't know existed — and making the z-index bigger will never fix it.",
      files: {
        html: `<div class="page">
  <div class="card-group">
    <div class="card">
      <p>Card content</p>
      <div class="tooltip">I should appear on top! z-index: 9999</div>
    </div>
  </div>
  <div class="other-card">Another card — covering the tooltip</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; }

.card-group {
  opacity: 0.99; /* this one innocent property traps all children */
  position: relative;
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  width: 280px;
  position: relative;
}

.tooltip {
  position: absolute;
  top: -10px;
  left: 40px;
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.8rem;
  z-index: 9999; /* won't help — trapped in a stacking context */
  white-space: nowrap;
}

.other-card {
  background: #334155;
  border: 1px solid #475569;
  border-radius: 8px;
  padding: 20px;
  width: 320px;
  position: relative;
  z-index: 2;
  margin-top: -30px;
  margin-left: 20px;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'z-index-basics',
      defaultTab: 'css',
      text: "`z-index` controls the stacking order of positioned elements. Higher number = closer to the viewer. This works exactly as expected... but only within the same stacking context. When stacking contexts come into play, the rules change completely.",
      files: {
        html: `<div class="page">
  <div class="box a">z-index: 1 (back)</div>
  <div class="box b">z-index: 2 (front)</div>
  <div class="box c">z-index: 3 (frontmost)</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 60px 40px; }

.box {
  position: relative; /* z-index only works on positioned elements */
  padding: 20px 28px;
  border-radius: 8px;
  font-weight: 600;
  width: 260px;
  margin-top: -12px; /* overlap to show z-order */
}

.a { background: #1e3a5f; border: 1px solid #3b82f6; z-index: 1; }
.b { background: #1a1a3e; border: 1px solid #7c3aed; z-index: 2; margin-left: 30px; }
.c { background: #052e16; border: 1px solid #10b981; z-index: 3; margin-left: 60px; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'z-index-fails',
      defaultTab: 'css',
      text: "Watch: the tooltip has `z-index: 1000`. The `.panel` has no z-index. Yet the tooltip is behind the panel. This is not a bug in your CSS. It is a stacking context. You cannot fix this by making the z-index bigger — no matter how large the number.",
      files: {
        html: `<div class="page">
  <div class="trapped-parent">
    <p>Parent has transform — creates stacking context</p>
    <div class="tooltip">z-index: 1000 — still stuck inside parent's context</div>
  </div>
  <div class="panel">I have no z-index. Yet I cover the tooltip.</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; }

.trapped-parent {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  width: 300px;
  position: relative;
  transform: translateX(0); /* creates a new stacking context — traps children */
}

.tooltip {
  position: absolute;
  bottom: -20px;
  right: 20px;
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.8rem;
  z-index: 1000; /* trapped — can never escape parent's stacking context */
  white-space: nowrap;
}

.panel {
  background: #334155;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 20px;
  width: 320px;
  position: relative;
  z-index: 1; /* low z-index, but still covers tooltip because it's outside the stacking context */
  margin-top: -10px;
  margin-left: 30px;
  color: #fca5a5;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'what-is-context',
      defaultTab: 'css',
      text: "A stacking context is an isolated z-index universe. Z-index values inside a context can only be compared to OTHER z-index values inside the SAME context. Several CSS properties automatically create a new stacking context: `opacity` less than 1, `transform`, `filter`, `will-change`, `position: fixed` or `sticky`.",
      files: {
        html: `<div class="page">
  <div class="creates-context opacity">opacity: 0.99<br><small>(creates context)</small></div>
  <div class="creates-context transform">transform: scale(1)<br><small>(creates context)</small></div>
  <div class="creates-context filter">filter: blur(0)<br><small>(creates context)</small></div>
  <div class="creates-context will-change">will-change: transform<br><small>(creates context)</small></div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; }

.page { display: flex; flex-wrap: wrap; gap: 16px; }

.creates-context {
  padding: 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  width: 200px;
  border: 1px solid #475569;
  text-align: center;
  line-height: 1.4;
}

small { color: #ef4444; font-weight: 400; }

.opacity   { background: #1e3a5f; opacity: 0.99; }
.transform { background: #1a1a3e; transform: scale(1); }
.filter    { background: #052e16; filter: blur(0px); }
.will-change { background: #3b1f00; will-change: transform; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'find-the-culprit',
      defaultTab: 'css',
      text: "The card's parent has `opacity: 0.99`. That one value creates a new stacking context. The tooltip's z-index: 1000 is now trapped inside. Relative to the page, the parent is stacked at whatever the parent's z-index is — and the tooltip can never escape.",
      files: {
        html: `<div class="page">
  <div class="panel-wrapper">
    <div class="panel">
      <p>This panel's parent has opacity: 0.99</p>
      <div class="tooltip">I'm z-index: 1000 but I can't escape</div>
    </div>
  </div>
  <div class="sibling">z-index: 2 — beats everything inside the stacking context</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; }

.panel-wrapper {
  opacity: 0.99; /* THE CULPRIT — creates a new stacking context */
  position: relative;
  z-index: 1;
}

.panel {
  background: #1e293b;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 20px;
  width: 280px;
  position: relative;
}

.tooltip {
  position: absolute;
  bottom: -15px;
  right: 16px;
  background: #3b82f6;
  color: white;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  z-index: 1000; /* large but trapped */
  white-space: nowrap;
}

.sibling {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  width: 300px;
  position: relative;
  z-index: 2;
  margin-top: -10px;
  margin-left: 20px;
  color: #94a3b8;
  font-size: 0.9rem;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'fix-options',
      defaultTab: 'css',
      text: "Three options to fix a stacking context problem: 1. Remove the property creating the context (if possible). 2. Move the tooltip to a common ancestor outside the stacking context. 3. Change the stacking order of the PARENT containers, not the children.",
      files: {
        html: `<div class="page">
  <div class="panel-wrapper fixed">
    <div class="panel">
      <p>Fix: opacity removed from parent</p>
      <div class="tooltip">Now z-index works!</div>
    </div>
  </div>
  <div class="sibling">z-index: 2</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; }

.panel-wrapper {
  position: relative;
  z-index: 1;
  /* opacity: 0.99 — removed. No more trapped context. */
}

.panel {
  background: #1e293b;
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 20px;
  width: 280px;
  position: relative;
}

.tooltip {
  position: absolute;
  bottom: -15px;
  right: 16px;
  background: #10b981;
  color: white;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  z-index: 1000; /* now works correctly */
  white-space: nowrap;
}

.sibling {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  width: 300px;
  position: relative;
  z-index: 2;
  margin-top: -10px;
  margin-left: 20px;
  color: #94a3b8;
  font-size: 0.9rem;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'fix-move',
      defaultTab: 'css',
      text: "The cleanest fix: move the tooltip to a common ancestor that is not inside a stacking context. Modern apps do this with 'portals' — React's createPortal renders children outside the component's DOM node, directly into document.body, where z-index always behaves as expected.",
      files: {
        html: `<!-- Tooltip moved OUTSIDE the stacking context parent -->
<div class="page">
  <div class="panel-wrapper">
    <div class="panel">
      <p>The tooltip was moved out of here.</p>
    </div>
  </div>
  <div class="sibling">z-index: 2</div>

  <!-- tooltip is now a sibling at the page level — no context trap -->
  <div class="tooltip-free">Tooltip — now free! z-index: 10 works</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; }

.page { position: relative; }

.panel-wrapper {
  opacity: 0.99; /* still here — but tooltip is now outside it */
  position: relative;
  z-index: 1;
}

.panel {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  width: 280px;
}

.sibling {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  width: 300px;
  position: relative;
  z-index: 2;
  margin-top: -10px;
  margin-left: 20px;
  color: #94a3b8;
  font-size: 0.9rem;
}

.tooltip-free {
  position: absolute;
  top: 50px;
  left: 60px;
  background: #10b981;
  color: white;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  z-index: 10; /* small number — but free from any trapped context */
  white-space: nowrap;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'transform-gotcha',
      defaultTab: 'css',
      text: "A common gotcha: you add `transform: translateY(-5px)` on a card hover animation. Suddenly a tooltip inside that card gets clipped during hover. The transform creates a new stacking context mid-animation. Fix: apply the transform to a wrapper that doesn't contain the tooltip.",
      files: {
        html: `<div class="page">
  <div class="card">
    <p>Hover over me — the tooltip clips!</p>
    <div class="tooltip">I disappear on hover</div>
  </div>
  <div class="below">I'm below the card (z-index: 5)</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 60px 40px; }

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 24px;
  width: 280px;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
}

/* On hover: transform creates a stacking context — tooltip gets trapped */
.card:hover {
  transform: translateY(-5px); /* triggers a new stacking context */
}

.tooltip {
  position: absolute;
  bottom: -14px;
  left: 20px;
  background: #3b82f6;
  color: white;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  z-index: 100;
  white-space: nowrap;
}

.below {
  background: #334155;
  border: 1px solid #475569;
  border-radius: 8px;
  padding: 20px;
  width: 300px;
  position: relative;
  z-index: 5;
  margin-top: 0;
  margin-left: 20px;
  color: #94a3b8;
  font-size: 0.9rem;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'isolate',
      defaultTab: 'css',
      text: "`isolation: isolate` intentionally creates a stacking context without any visual side effect. This is useful when you want to contain z-index values inside a component and prevent them from interfering with the rest of the page — a clean, explicit boundary.",
      files: {
        html: `<div class="page">
  <div class="component">
    <div class="component-inner">Component A — isolation: isolate</div>
    <div class="badge">z-index: 50 — stays inside component</div>
  </div>
  <div class="component b">
    <div class="component-inner">Component B</div>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; }

.page { display: flex; gap: 20px; flex-wrap: wrap; }

.component {
  isolation: isolate; /* creates a stacking context with NO visual change */
  background: #1e293b;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 20px;
  width: 260px;
  position: relative;
}

.component.b {
  border-color: #10b981;
}

.component-inner {
  background: #0f172a;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.badge {
  position: absolute;
  top: -10px;
  right: 12px;
  background: #7c3aed;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  z-index: 50; /* contained inside this isolated context */
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-stacking'
    },
    {
      type: 'narration',
      id: 'position-stacking',
      defaultTab: 'css',
      text: "Z-index only works on POSITIONED elements — `position: relative`, `absolute`, `fixed`, or `sticky`. An element with `position: static` (the default) ignores z-index entirely. This is why `z-index: 999` sometimes appears to have no effect.",
      files: {
        html: `<div class="page">
  <div class="static">position: static + z-index: 999 — ignored!</div>
  <div class="positioned">position: relative + z-index: 1 — works</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; }

.static {
  background: #ef4444;
  color: white;
  padding: 20px;
  border-radius: 8px;
  font-weight: 600;
  /* position: static is the default */
  z-index: 999; /* IGNORED — only works on positioned elements */
  margin-bottom: -20px; /* make the overlap visible */
}

.positioned {
  background: #3b82f6;
  color: white;
  padding: 20px;
  border-radius: 8px;
  font-weight: 600;
  position: relative; /* now z-index takes effect */
  z-index: 1;         /* even z-index: 1 beats the static element's z-index: 999 */
  margin-left: 20px;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'mental-model',
      defaultTab: 'css',
      text: "Think of stacking contexts as Photoshop layer groups. Inside a group, layers are ordered relative to each other. But a layer inside a group can NEVER appear above a layer outside the group, no matter how high its z-index. The group's position in the overall stack is what matters — not the individual layer's z-index.",
      files: {
        html: `<div class="page">
  <div class="group a">
    <div class="layer">Group A — z-index: 1</div>
    <div class="layer high">Inside A — z-index: 999<br><small>(can't escape Group A)</small></div>
  </div>
  <div class="group b">
    <div class="layer">Group B — z-index: 2<br><small>(higher than Group A, so it wins)</small></div>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; }

.group {
  position: relative;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.group.a { background: rgba(59, 130, 246, 0.15); border: 1px dashed #3b82f6; z-index: 1; }
.group.b { background: rgba(16, 185, 129, 0.15); border: 1px dashed #10b981; z-index: 2; margin-top: -30px; margin-left: 40px; }

.layer {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 16px;
  font-size: 0.85rem;
  line-height: 1.5;
  margin-bottom: 8px;
  position: relative;
}

.high {
  z-index: 999; /* trapped inside Group A */
  background: #1e3a5f;
  border-color: #3b82f6;
  color: #93c5fd;
}

small { color: #ef4444; font-size: 0.75rem; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-z-index'
    },
    {
      type: 'challenge',
      id: 'ch-fix-tooltip',
      text: "The `.tooltip` is trapped inside `.card-wrapper` which has `opacity: 0.9`. Fix the stacking problem by adding `isolation: isolate` to `.card-wrapper`, or by giving the tooltip `position: fixed` to escape the context entirely.",
      hint: "Add `isolation: isolate;` to `.card-wrapper`, OR change `.tooltip` to `position: fixed;`.",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="page">
  <div class="card-wrapper">
    <div class="card">
      <p>Hover — tooltip appears behind the panel</p>
      <div class="tooltip">I should be on top!</div>
    </div>
  </div>
  <div class="panel">I cover the tooltip (z-index: 3)</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; }

.card-wrapper {
  opacity: 0.9; /* creates a stacking context — traps .tooltip */
  position: relative;
  z-index: 1;
  /* Fix: add isolation: isolate here, OR change .tooltip to position: fixed */
}

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  width: 280px;
  position: relative;
}

.tooltip {
  position: absolute;
  bottom: -14px;
  left: 20px;
  background: #3b82f6;
  color: white;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  z-index: 9999;
  white-space: nowrap;
}

.panel {
  background: #334155;
  border: 1px solid #475569;
  border-radius: 8px;
  padding: 20px;
  width: 300px;
  position: relative;
  z-index: 3;
  margin-top: -10px;
  margin-left: 20px;
  color: #94a3b8;
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /isolation\s*:\s*isolate/.test(css) || /position\s*:\s*fixed/.test(css);
      }
    },
    {
      type: 'challenge',
      id: 'ch-modal-z',
      text: "Create a modal that sits above all other page content. Use `position: fixed` to escape any stacking contexts and cover the full viewport. Give it a z-index that puts it on top.",
      hint: "Use `position: fixed; inset: 0; z-index: 1000;` on the modal overlay.",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="page-content">
  <h1>Page Content</h1>
  <p>This is the main page. The modal should cover everything.</p>
  <div class="deep-element">
    Deep element with z-index: 500
  </div>
</div>

<div class="modal-overlay">
  <div class="modal">
    <h2>Modal</h2>
    <p>I should appear above everything.</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.page-content {
  padding: 40px;
  transform: scale(1); /* creates a stacking context */
}

.deep-element {
  background: #1e293b;
  border: 1px solid #334155;
  padding: 16px;
  border-radius: 8px;
  position: relative;
  z-index: 500;
  color: #94a3b8;
}

.modal-overlay {
  background: rgba(0, 0, 0, 0.8);
  /* Add position: fixed, inset: 0, z-index, and centering */
}

.modal {
  background: #1e293b;
  border: 1px solid #3b82f6;
  border-radius: 12px;
  padding: 36px;
  width: 400px;
  max-width: 90vw;
}

h2 { margin-top: 0; color: #3b82f6; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /position\s*:\s*fixed/.test(css) && /z-index\s*:\s*([1-9]\d*)/.test(css);
      }
    }
  ]
};

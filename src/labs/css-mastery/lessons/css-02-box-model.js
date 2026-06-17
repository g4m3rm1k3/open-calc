export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-02-box-model',
  title: '02. The Box Model',
  chapter: 'css-ch1',
  language: 'web',
  checkpoints: [
    { id: 'cp-box-model', label: 'Box Model' },
    { id: 'cp-box-sizing', label: 'box-sizing' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "You set an element to `width: 100%`, add `padding: 20px`, and it breaks out of its container causing a horizontal scrollbar. The content is 300px wide. You added padding. Now it is 340px. It overflows by 40px. This is the default box model, and it trips up every developer.",
      files: {
        html: `<div class="container">
  <div class="inner">I am supposed to be 100% wide...</div>
</div>`,
        css: `* { font-family: sans-serif; }

body {
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.container {
  width: 300px;
  background: #1e293b;
  border: 2px dashed #475569;
  /* overflow: visible is default — content spills out */
}

.inner {
  width: 100%;      /* 300px */
  padding: 20px;    /* adds 20px left + 20px right = +40px */
  background: #ef4444;
  color: white;
  font-weight: 600;
  /* total rendered width: 340px — overflows by 40px */
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'why-overflow',
      defaultTab: 'css',
      text: "The browser's default box model treats `width` as the size of the CONTENT box only. When you add `padding: 20px`, that padding is ADDED on top of the content width. 100% width (300px) + 20px left padding + 20px right padding = 340px total. That is why it overflows.",
      files: {
        html: `<div class="container">
  <div class="inner">
    content width: 300px<br>
    + left padding: 20px<br>
    + right padding: 20px<br>
    = total: 340px (overflows!)
  </div>
</div>`,
        css: `* { font-family: sans-serif; }

body {
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.container {
  width: 300px;
  background: #1e293b;
  border: 2px dashed #ef4444;
}

.inner {
  width: 100%;
  padding: 20px;
  background: rgba(239, 68, 68, 0.3);
  border: 2px solid #ef4444;
  color: #fca5a5;
  font-size: 0.85rem;
  line-height: 1.8;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'four-layers',
      defaultTab: 'css',
      text: "Every element is a box with four layers. Content: the actual text and images. Padding: transparent space INSIDE the border (background color shows through). Border: the visible line around the element. Margin: transparent space OUTSIDE the border (background does NOT show through — it reveals the parent).",
      files: {
        html: `<div class="margin-layer">
  margin (outside — shows parent bg)
  <div class="border-layer">
    border (the line)
    <div class="padding-layer">
      padding (inside — shows element bg)
      <div class="content-layer">
        content
      </div>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; font-family: sans-serif; }

body {
  background: #0f172a;
  color: #f1f5f9;
  padding: 40px;
}

.margin-layer {
  background: #1e293b; /* parent background shows in margin area */
  padding: 24px;       /* this is actually the "margin" space */
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.border-layer {
  border: 4px solid #f59e0b;
  padding: 16px;
  font-size: 11px;
  color: #fbbf24;
}

.padding-layer {
  background: #1d4ed8; /* background color fills the padding area */
  padding: 16px;
  font-size: 11px;
  color: #93c5fd;
}

.content-layer {
  background: #3b82f6;
  padding: 12px;
  font-size: 13px;
  font-weight: 700;
  color: white;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'margin-not-inside',
      defaultTab: 'css',
      text: "This is the most common confusion. Margin pushes OTHER elements away — it is space OUTSIDE the box. Padding adds space INSIDE the box — the background color shows through it. Both add space, but in completely different places.",
      files: {
        html: `<div class="demo-wrap">
  <div class="card">
    This card has padding (inside) and margin (outside).
    The blue area is padding — background shows.
    The dark gap around it is margin — parent background shows.
  </div>
  <div class="card second">Second card</div>
</div>`,
        css: `* { box-sizing: border-box; font-family: sans-serif; }

body {
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.demo-wrap {
  background: #334155; /* visible in the margin areas */
  padding: 0;
}

.card {
  background: #1d4ed8;  /* shows through padding */
  color: #dbeafe;
  padding: 24px;        /* space INSIDE — blue bg fills here */
  margin: 24px;         /* space OUTSIDE — dark parent bg shows here */
  border: 2px solid #60a5fa;
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.6;
}

.second {
  background: #065f46;
  color: #d1fae5;
  border-color: #34d399;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'box-sizing-problem',
      defaultTab: 'css',
      text: "With default `box-sizing: content-box`, the actual rendered width is `width + padding-left + padding-right + border-left + border-right`. A 200px box with `padding: 20px` and `border: 1px solid` renders as 242px total. This math almost never matches developer intent.",
      files: {
        html: `<div class="container">
  <div class="box">
    I said width: 200px<br>
    But I render at 242px
  </div>
</div>
<p class="math">200 + 20 + 20 + 1 + 1 = 242px actual width</p>`,
        css: `* { font-family: sans-serif; }

body {
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.container {
  background: #1e293b;
  padding: 8px;
  width: 220px;
  border: 2px dashed #475569;
}

.box {
  /* box-sizing: content-box is the DEFAULT — we don't need to write it */
  width: 200px;        /* content width only */
  padding: 20px;       /* adds 20+20 = 40px */
  border: 1px solid #f59e0b; /* adds 1+1 = 2px */
  background: #b45309;
  color: #fef3c7;
  font-size: 0.85rem;
  line-height: 1.6;
  /* actual render: 200 + 20 + 20 + 1 + 1 = 242px */
}

.math {
  color: #f59e0b;
  font-size: 0.85rem;
  margin-top: 12px;
  font-family: monospace;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'box-sizing-fix',
      defaultTab: 'css',
      text: "`box-sizing: border-box` changes the model: `width` now means the TOTAL size including padding and border. You say 200px, you get 200px — the browser shrinks the content area to fit. This is how every developer wants CSS to work.",
      files: {
        html: `<div class="container">
  <div class="box">
    width: 200px<br>
    padding: 20px<br>
    border: 1px<br>
    Total: exactly 200px ✓
  </div>
</div>`,
        css: `* { font-family: sans-serif; }

body {
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.container {
  background: #1e293b;
  padding: 8px;
  width: 220px;
  border: 2px dashed #475569;
}

.box {
  box-sizing: border-box; /* the fix */
  width: 200px;       /* now means TOTAL width including padding + border */
  padding: 20px;      /* fits INSIDE the 200px */
  border: 1px solid #10b981;
  background: #065f46;
  color: #d1fae5;
  font-size: 0.85rem;
  line-height: 1.6;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'universal-reset',
      defaultTab: 'css',
      text: "Every modern project starts with this reset. The `*` selector applies `box-sizing: border-box` to every single element. Including `*::before` and `*::after` catches pseudo-elements. This one rule makes width and height predictable everywhere — add it to every project.",
      files: {
        html: `<div class="container">
  <div class="inner">Now 100% means 100% — no overflow</div>
</div>`,
        css: `/* THE UNIVERSAL RESET — include in every project */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.container {
  width: 300px;
  background: #1e293b;
  border: 2px dashed #475569;
  padding: 4px;
}

.inner {
  width: 100%;        /* exactly 300px total, always */
  padding: 20px;      /* fits inside — no overflow */
  border: 2px solid #10b981;
  background: #065f46;
  color: #d1fae5;
  font-weight: 600;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'margin-collapse',
      defaultTab: 'css',
      text: "Margin has a strange behavior unique to block elements: adjacent vertical margins collapse. When a 30px bottom-margin and a 20px top-margin meet, they don't add to 50px — the larger one wins and you get 30px. This only happens vertically, never horizontally.",
      files: {
        html: `<div class="box top">margin-bottom: 30px</div>
<div class="box bottom">margin-top: 20px</div>
<p class="note">Gap between them: 30px (not 50px) — the larger wins</p>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.box {
  padding: 16px 24px;
  border-radius: 6px;
  font-weight: 500;
  outline: 1px dashed #475569; /* see the box boundary */
}

.top {
  background: #3b82f6;
  margin-bottom: 30px; /* 30px bottom margin */
}

.bottom {
  background: #10b981;
  margin-top: 20px;    /* 20px top margin — collapses! larger wins */
}

.note {
  color: #f59e0b;
  font-size: 0.85rem;
  margin-top: 16px;
  font-style: italic;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'margin-auto',
      defaultTab: 'css',
      text: "`margin: auto` on the left and right tells the browser to distribute remaining horizontal space equally. This is how `margin: 0 auto` centers a block element. It only works on block elements with an explicit width — there must be leftover space to distribute.",
      files: {
        html: `<div class="container">
  <div class="centered">I am centered horizontally</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.container {
  background: #1e293b;
  padding: 24px;
}

.centered {
  width: 400px;       /* explicit width required */
  margin: 0 auto;     /* auto left + auto right = equal distribution = centered */
  background: #7c3aed;
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-box-model'
    },
    {
      type: 'narration',
      id: 'padding-shorthand',
      defaultTab: 'css',
      text: "CSS shorthand follows the TRBL clock — Top, Right, Bottom, Left. `padding: 10px 20px` means 10px top+bottom, 20px left+right. `padding: 10px 20px 30px` means top, right+left, bottom. `padding: 10px 20px 30px 40px` is the full clock: top, right, bottom, left.",
      files: {
        html: `<div class="one">padding: 20px (all four sides)</div>
<div class="two">padding: 8px 24px (v h)</div>
<div class="three">padding: 4px 16px 12px (top h bottom)</div>
<div class="four">padding: 4px 8px 16px 32px (TRBL clock)</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

div {
  background: #1e3a5f;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  margin-bottom: 12px;
  color: #93c5fd;
  font-size: 0.9rem;
}

.one  { padding: 20px; }
.two  { padding: 8px 24px; }
.three { padding: 4px 16px 12px; }
.four { padding: 4px 8px 16px 32px; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'negative-margin',
      defaultTab: 'css',
      text: "Margin can be negative. This pulls an element INTO the space of adjacent elements. It is a valid, useful technique — often used to overlap cards or pull elements outside their containers. The second card has `margin-top: -20px` and overlaps the first.",
      files: {
        html: `<div class="card first">First card</div>
<div class="card second">Second card — margin-top: -20px</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.card {
  padding: 24px;
  border-radius: 8px;
  font-weight: 600;
  width: 300px;
}

.first {
  background: #1e3a5f;
  border: 1px solid #3b82f6;
}

.second {
  background: #1a1a3e;
  border: 1px solid #7c3aed;
  margin-top: -20px;    /* pulls upward, overlapping the first card */
  margin-left: 24px;    /* offset so you can see both */
  color: #c4b5fd;
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-box-sizing'
    },
    {
      type: 'challenge',
      id: 'ch-fix-overflow',
      text: "The inner box overflows its container because of padding. Fix it by adding `box-sizing: border-box` to `.inner` (or use the universal reset).",
      hint: "Add `box-sizing: border-box;` to the `.inner` rule, or add `*, *::before, *::after { box-sizing: border-box; }` at the top.",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="container">
  <div class="inner">Fix my overflow!</div>
</div>`,
        css: `body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.container {
  width: 300px;
  background: #1e293b;
  border: 2px dashed #ef4444;
  padding: 4px;
}

.inner {
  /* Add box-sizing: border-box here to fix the overflow */
  width: 100%;
  padding: 24px;
  border: 3px solid #3b82f6;
  background: #1e3a5f;
  color: #93c5fd;
  font-weight: 600;
}`,
        js: ''
      },
      validate: (ctx) => /box-sizing\s*:\s*border-box/.test(ctx.files?.css || '')
    },
    {
      type: 'challenge',
      id: 'ch-card',
      text: "Build a centered card. It needs: `padding: 24px`, a 1px border, `border-radius: 8px`, a specific width of your choice, and must be centered horizontally on the page.",
      hint: "Set a `width`, then use `margin: 0 auto` to center it. Add `padding`, `border`, and `border-radius`.",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="card">
  <h2>My Card</h2>
  <p>This card should be centered and nicely padded.</p>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }

body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 40px;
}

.card {
  background: #1e293b;
  color: #f1f5f9;
  /* Add: width, padding: 24px, border, border-radius, margin: 0 auto */
}

h2 { margin-top: 0; color: #3b82f6; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /padding/.test(css) &&
          /border/.test(css) &&
          /border-radius/.test(css) &&
          /margin.*auto|margin-left.*auto/.test(css);
      }
    }
  ]
};

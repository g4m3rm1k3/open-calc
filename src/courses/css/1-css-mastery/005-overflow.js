export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-05-overflow',
  title: '05. Overflow',
  chapter: 'css-ch1',
  language: 'web',
  checkpoints: [
    { id: 'cp-overflow', label: 'Overflow Values' },
    { id: 'cp-defensive', label: 'Defensive Sizing' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "Your card has a fixed height. When users put too much content in it, the text spills outside the card, overlapping other elements. The layout breaks. You need to control what happens when content is bigger than its container.",
      files: {
        html: `<div class="page">
  <div class="card">
    <h3>Short Card</h3>
    <p>Just one line.</p>
  </div>
  <div class="card broken">
    <h3>Overfull Card</h3>
    <p>This card has too much content. The description keeps going and going, with details about features, pricing tiers, support levels, and terms of service. It overflows the fixed height and covers the element below.</p>
  </div>
  <div class="below">I should be below the card — but the overflow covers me.</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.page { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  width: 240px;
  height: 160px; /* fixed height — the problem */
}

h3 { margin: 0 0 8px; color: #3b82f6; font-size: 0.95rem; }
p  { margin: 0; color: #94a3b8; font-size: 0.85rem; line-height: 1.5; }

.below {
  width: 100%;
  background: #334155;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 16px;
  color: #fca5a5;
  font-weight: 600;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'why-overflow',
      defaultTab: 'css',
      text: "When you give an element a fixed height and its content is taller, the browser must decide: should content spill out, or should something else happen? By default it spills — `overflow: visible` is the default. The element keeps its declared height but the content ignores that boundary.",
      files: {
        html: `<div class="demo">
  <div class="box">
    overflow: visible (default)<br>
    Content spills out of the fixed height.
    It doesn't care about the boundary.
    The box height is still 80px.
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 40px; }

.demo {
  background: #334155;
  padding: 16px;
  border-radius: 8px;
  width: 280px;
}

.box {
  background: #1e3a5f;
  border: 2px solid #3b82f6;
  border-radius: 6px;
  padding: 12px;
  height: 80px;    /* fixed — content taller than this */
  overflow: visible; /* default: spills out */
  color: #93c5fd;
  font-size: 0.85rem;
  line-height: 1.5;
  width: 240px;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'overflow-hidden',
      defaultTab: 'css',
      text: "`overflow: hidden` clips content at the element's boundary. Anything outside is simply cut off. The card looks clean. But the extra content is gone — users can't scroll to see it. Good for decorative elements, bad for user-generated content.",
      files: {
        html: `<div class="page">
  <div class="card">
    <h3>overflow: hidden</h3>
    <p>This text is long enough to overflow. But it gets cut off cleanly at the card boundary. The content is gone — not scrollable.</p>
  </div>
  <div class="below">No overflow — the element below is safe.</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  width: 260px;
  height: 130px;
  overflow: hidden; /* clips content — clean but lossy */
}

h3 { margin: 0 0 8px; color: #f59e0b; font-size: 0.95rem; }
p  { margin: 0; color: #94a3b8; font-size: 0.85rem; line-height: 1.5; }

.below {
  margin-top: 12px;
  background: #334155;
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 16px;
  color: #6ee7b7;
  font-weight: 600;
  width: 260px;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'overflow-scroll',
      defaultTab: 'css',
      text: "`overflow: scroll` adds a scrollbar — always, even when the content fits perfectly. You get an empty scrollbar on the left card even though the content is short. Useful when you want consistent spacing in grids. Usually not what you want.",
      files: {
        html: `<div class="page">
  <div class="card short">
    <h3>Short content</h3>
    <p>Fits easily — but scrollbar still appears.</p>
  </div>
  <div class="card long">
    <h3>Long content</h3>
    <p>This text is long enough to actually need scrolling. It keeps going with more details and information that wouldn't fit otherwise.</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.page { display: flex; gap: 20px; flex-wrap: wrap; }

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  width: 220px;
  height: 130px;
  overflow: scroll; /* scrollbar ALWAYS shows, even when content fits */
}

h3 { margin: 0 0 8px; color: #f59e0b; font-size: 0.95rem; }
p  { margin: 0; color: #94a3b8; font-size: 0.85rem; line-height: 1.5; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'overflow-auto',
      defaultTab: 'css',
      text: "`overflow: auto` is the pragmatic choice: a scrollbar appears ONLY when the content actually overflows. No scrollbar when content fits. Scrollbar when it doesn't. This is what you almost always want for dynamic content containers.",
      files: {
        html: `<div class="page">
  <div class="card short">
    <h3>Short content</h3>
    <p>No scrollbar — content fits.</p>
  </div>
  <div class="card long">
    <h3>Long content</h3>
    <p>This text is long enough to overflow. The scrollbar appears automatically because the content doesn't fit in the fixed height. Scroll me to see the rest of the content.</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.page { display: flex; gap: 20px; flex-wrap: wrap; }

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  width: 220px;
  height: 130px;
  overflow: auto; /* scrollbar only when needed — the right choice */
}

h3 { margin: 0 0 8px; color: #10b981; font-size: 0.95rem; }
p  { margin: 0; color: #94a3b8; font-size: 0.85rem; line-height: 1.5; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'axes',
      defaultTab: 'css',
      text: "You can control overflow independently per axis. `overflow-x: hidden` hides horizontal overflow while `overflow-y: auto` allows vertical scrolling. Warning: setting overflow on one axis implicitly sets the other to `auto` if it was `visible` — this is a spec quirk.",
      files: {
        html: `<div class="page">
  <div class="horizontal-scroll">
    <div class="wide-content">This content is intentionally very wide — wider than the container — and it scrolls horizontally while the container doesn't grow tall.</div>
  </div>
  <div class="note">overflow-x: auto; overflow-y: hidden</div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.horizontal-scroll {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 16px;
  width: 300px;
  overflow-x: auto;    /* scroll wide content horizontally */
  overflow-y: hidden;  /* don't allow vertical overflow */
}

.wide-content {
  white-space: nowrap; /* prevent text wrapping so it stays wide */
  color: #93c5fd;
  font-size: 0.85rem;
  width: 600px; /* explicitly wider than container */
}

.note {
  margin-top: 12px;
  color: #475569;
  font-size: 0.8rem;
  font-family: monospace;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'min-height',
      defaultTab: 'css',
      text: "Instead of `height`, use `min-height`. With `height: 200px`, the box is ALWAYS 200px — content either overflows or gets clipped. With `min-height: 200px`, the box is AT LEAST 200px but grows to fit content. This is the defensive approach: it never clips.",
      files: {
        html: `<div class="page">
  <div class="fixed-height">
    <h3>height: 200px</h3>
    <p>Short content — fine. Long content — overflows or clips.</p>
    <p>This paragraph pushes past the boundary.</p>
  </div>

  <div class="min-height">
    <h3>min-height: 200px</h3>
    <p>Short content — fine. Long content — grows to fit.</p>
    <p>This paragraph causes the box to expand naturally.</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.page { display: flex; gap: 20px; flex-wrap: wrap; align-items: flex-start; }

.fixed-height {
  background: #1e293b;
  border: 2px solid #ef4444;
  border-radius: 8px;
  padding: 20px;
  width: 240px;
  height: 200px;     /* fixed — overflows with extra content */
  overflow: hidden;  /* clips instead of overflowing */
}

.min-height {
  background: #1e293b;
  border: 2px solid #10b981;
  border-radius: 8px;
  padding: 20px;
  width: 240px;
  min-height: 200px; /* defensive — grows with content */
}

h3 { margin: 0 0 8px; font-size: 0.9rem; }
.fixed-height h3 { color: #ef4444; }
.min-height h3  { color: #10b981; }
p  { margin: 0 0 8px; color: #94a3b8; font-size: 0.82rem; line-height: 1.5; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'max-width',
      defaultTab: 'css',
      text: "Text wider than about 700px becomes hard to read — the eye has to travel too far. `max-width` caps an element's width while still allowing it to shrink on smaller screens. `max-width: 65ch` uses character units — always the optimal reading width for the current font.",
      files: {
        html: `<div class="page">
  <article class="too-wide">
    <p>No max-width: This paragraph spans the entire available width. On a large monitor, reading this requires the eye to travel across a very long horizontal distance, which causes fatigue. Studies show that optimal line length is 50-75 characters.</p>
  </article>
  <article class="readable">
    <p>max-width: 65ch — This paragraph caps at 65 characters wide. It's comfortable to read because each line is just the right length. The 'ch' unit is based on the width of the '0' character in the current font, so it always scales correctly.</p>
  </article>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.too-wide {
  background: #1e293b;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  /* no max-width — spans full container */
}

.readable {
  background: #1e293b;
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 20px;
  max-width: 65ch; /* optimal reading width in character units */
}

p { margin: 0; color: #94a3b8; line-height: 1.7; font-size: 0.9rem; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'overflow-clip',
      defaultTab: 'css',
      text: "`overflow: clip` is like `overflow: hidden` but does NOT create a block formatting context. This matters when you want to clip content visually but still allow margin collapse and other layout behaviors that `hidden` silently prevents. A subtle but important distinction.",
      files: {
        html: `<div class="page">
  <div class="clip-box">
    <h3>overflow: clip</h3>
    <p>Clips visually like 'hidden' but doesn't create a new formatting context. Margin collapse still works through this element.</p>
    <p>Extra content that overflows is clipped cleanly.</p>
    <p>Even more content beyond the height limit.</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.clip-box {
  background: #1e293b;
  border: 1px solid #7c3aed;
  border-radius: 8px;
  padding: 20px;
  width: 300px;
  height: 140px;
  overflow: clip; /* clips content, unlike hidden doesn't create BFC */
}

h3 { margin: 0 0 8px; color: #7c3aed; font-size: 0.95rem; }
p  { margin: 0 0 8px; color: #94a3b8; font-size: 0.85rem; line-height: 1.5; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-overflow'
    },
    {
      type: 'narration',
      id: 'sticky-and-overflow',
      defaultTab: 'css',
      text: "The most surprising overflow interaction: `position: sticky` stops working when ANY ancestor has `overflow: hidden` or `overflow: auto` — even on a different axis. Sticky needs to scroll within its own container, and overflow cuts that off. If sticky doesn't work, inspect all ancestors for overflow.",
      files: {
        html: `<div class="wrapper">
  <div class="sticky-header">Sticky Header — should stick on scroll</div>
  <div class="content">
    <p>Scroll down inside this wrapper.</p>
    <p>If .wrapper has overflow: auto or hidden, the sticky header won't work.</p>
    <p>More content...</p>
    <p>More content...</p>
    <p>More content...</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.wrapper {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  height: 200px;
  overflow: auto; /* WARNING: this breaks sticky inside */
  width: 300px;
}

.sticky-header {
  background: #ef4444;
  color: white;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  position: sticky; /* broken — parent has overflow: auto */
  top: 0;
}

.content {
  padding: 16px;
}

.content p {
  margin: 0 0 12px;
  color: #94a3b8;
  font-size: 0.85rem;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'scroll-snap',
      defaultTab: 'css',
      text: "`scroll-snap-type` on a container and `scroll-snap-align` on children creates smooth carousel-like scrolling without JavaScript. The browser snaps to each child as you scroll. Modern, accessible, and zero-JS.",
      files: {
        html: `<div class="carousel">
  <div class="slide s1">Slide 1</div>
  <div class="slide s2">Slide 2</div>
  <div class="slide s3">Slide 3</div>
  <div class="slide s4">Slide 4</div>
</div>
<p class="hint">Scroll horizontally →</p>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory; /* snap to children on x axis */
  gap: 16px;
  padding: 8px;
  border-radius: 8px;
  background: #1e293b;
  width: 320px;
  /* hide scrollbar cosmetically */
  scrollbar-width: thin;
  scrollbar-color: #334155 transparent;
}

.slide {
  flex-shrink: 0;        /* don't shrink — each slide is full width */
  width: 100%;
  min-width: 288px;      /* matches .carousel inner width */
  height: 160px;
  border-radius: 8px;
  scroll-snap-align: start; /* snap the start of each slide to the container */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
}

.s1 { background: #1d4ed8; }
.s2 { background: #065f46; }
.s3 { background: #7c2d12; }
.s4 { background: #4c1d95; }

.hint { color: #475569; font-size: 0.8rem; margin-top: 8px; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-defensive'
    },
    {
      type: 'challenge',
      id: 'ch-overflow-card',
      text: "The card below overflows when content is long. Make it scroll vertically when content overflows, but show NO scrollbar when content fits. Use the right overflow value.",
      hint: "Add `overflow-y: auto;` to `.card`. This shows a scrollbar only when the content is actually taller than the card.",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="page">
  <div class="card short-content">
    <h3>Short content</h3>
    <p>Fits easily.</p>
  </div>
  <div class="card long-content">
    <h3>Long content</h3>
    <p>This card has much more content than will fit. It keeps going with details, feature descriptions, pricing information, and terms. The user needs to be able to scroll to read all of it.</p>
    <p>More details here that definitely won't fit in the fixed height.</p>
  </div>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; }

.page { display: flex; gap: 20px; flex-wrap: wrap; }

.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 20px;
  width: 240px;
  height: 150px;
  /* Add overflow-y: auto here */
}

h3 { margin: 0 0 8px; color: #3b82f6; font-size: 0.95rem; }
p  { margin: 0 0 8px; color: #94a3b8; font-size: 0.85rem; line-height: 1.5; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /overflow-y\s*:\s*auto/.test(css) || /overflow\s*:\s*auto/.test(css);
      }
    },
    {
      type: 'challenge',
      id: 'ch-readable',
      text: "Make the article container readable: set a `max-width` of `65ch`, center it horizontally on the page, and add `padding` on both sides so text doesn't touch the edges on narrow screens.",
      hint: "Use `max-width: 65ch; margin: 0 auto; padding: 0 16px;` on `.article`.",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="article">
  <h1>How to Write Readable CSS</h1>
  <p>Long lines of text are hard to read. When a line of text spans the full width of a large monitor, the reader's eye has to travel a very long distance from the end of one line to the start of the next. This causes reading fatigue and makes comprehension harder.</p>
  <p>Setting a max-width and centering the content is one of the most impactful things you can do for readability.</p>
</div>`,
        css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f172a; color: #f1f5f9; }

.article {
  background: #1e293b;
  padding: 40px;
  /* Add: max-width: 65ch, margin: 0 auto, and side padding */
}

h1 { color: #3b82f6; font-size: 1.4rem; margin-top: 0; }
p  { color: #94a3b8; line-height: 1.7; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /max-width/.test(css) && /margin.*auto|margin-left.*auto/.test(css);
      }
    }
  ]
};

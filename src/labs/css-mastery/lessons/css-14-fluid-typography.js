export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-14-fluid-typography',
  title: '14. Fluid Typography',
  chapter: 'css-ch3',
  language: 'web',
  checkpoints: [
    { id: 'cp-clamp', label: 'clamp()' },
    { id: 'cp-fluid', label: 'Fluid Sizing' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "Your heading is 64px on desktop — it looks great. On a 320px phone it's enormous. You add a media query: `font-size: 28px` on mobile. But on a 600px tablet it jumps abruptly between the two sizes. Every device either gets the desktop heading or the mobile heading — nothing in between. You want smooth scaling. That's fluid typography.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <h1 class="desktop-h1">Big Desktop Heading</h1>
  <h1 class="mobile-h1">This Would Be Too Small On Desktop</h1>
  <p>One heading is right for desktop, one for mobile. Neither is right for a tablet. Resize the preview to see the abrupt jump.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.demo {
  max-width: 800px;
  background: #1e293b;
  border-radius: 12px;
  padding: 32px;
}

/* Desktop heading — huge */
.desktop-h1 {
  font-size: 64px;
  line-height: 1.1;
  margin-bottom: 24px;
  color: #f8fafc;
}

/* Mobile heading — abrupt jump with media query */
.mobile-h1 {
  font-size: 28px;
  line-height: 1.3;
  margin-bottom: 24px;
  color: #94a3b8;
}

p {
  font-size: 1rem;
  color: #64748b;
  line-height: 1.6;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'viewport-units-for-type',
      defaultTab: 'css',
      text: "`font-size: 4vw` scales with the viewport. At 1200px wide: 48px. At 400px wide: 16px. No breakpoints. But it's unconstrained: at 1600px wide it becomes 64px (maybe too large), and at 280px it becomes 11px (too small to read). Pure vw is a start but needs limits.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <h1>Pure vw Heading</h1>
  <p>font-size: 4vw — resize the preview. On very wide screens this gets too large. On very narrow screens it gets too small. It scales but has no bounds.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.demo {
  max-width: 900px;
  background: #1e293b;
  border-radius: 12px;
  padding: 40px;
}

h1 {
  font-size: 4vw; /* scales with viewport but has no minimum or maximum */
  line-height: 1.2;
  margin-bottom: 20px;
  color: #f8fafc;
}

p {
  font-size: 1rem;
  color: #94a3b8;
  line-height: 1.6;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'min-max-functions',
      defaultTab: 'css',
      text: "`min(a, b)` returns the smaller value. `max(a, b)` returns the larger. `font-size: max(16px, 4vw)` means 'at least 16px, but scales with viewport.' `font-size: min(64px, 8vw)` means 'at most 64px, but smaller on small screens.' These compose: `min(64px, max(16px, 4vw))` gives you bounded scaling.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <h2 class="uses-max">max(16px, 4vw)</h2>
  <p>Never smaller than 16px. Scales up with viewport. No upper bound.</p>

  <h2 class="uses-min">min(64px, 8vw)</h2>
  <p>Never larger than 64px. Scales down on small screens. No lower bound.</p>

  <h2 class="uses-both">min(64px, max(16px, 4vw))</h2>
  <p>Both bounded — min 16px, max 64px, scales between them.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 32px 24px;
}

.demo {
  max-width: 800px;
  background: #1e293b;
  border-radius: 12px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.uses-max {
  font-size: max(16px, 4vw);
  color: #3b82f6;
  line-height: 1.2;
}

.uses-min {
  font-size: min(64px, 8vw);
  color: #6366f1;
  line-height: 1.2;
}

.uses-both {
  font-size: min(64px, max(16px, 4vw));
  color: #10b981;
  line-height: 1.2;
}

p {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
  margin-top: -16px;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'clamp',
      defaultTab: 'css',
      text: "`clamp(minimum, preferred, maximum)` is `min(max(minimum, preferred), maximum)` — it clamps a value within a range. `font-size: clamp(1.5rem, 5vw, 4rem)` means: never smaller than 1.5rem (24px), never larger than 4rem (64px), and scales smoothly with viewport between those bounds. This single line replaces multiple typography breakpoints.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="hero">
  <h1>Fluid Heading with clamp()</h1>
  <p>font-size: clamp(1.5rem, 5vw, 4rem) — resize the preview. The heading grows and shrinks fluidly but never gets too small or too large.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
}

.hero {
  max-width: 800px;
  text-align: center;
}

h1 {
  /* clamp(minimum, preferred, maximum) */
  font-size: clamp(1.5rem, 5vw, 4rem);
  line-height: 1.15;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

p {
  font-size: clamp(0.9rem, 2vw, 1.2rem);
  color: #94a3b8;
  line-height: 1.7;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'clamp-formula',
      defaultTab: 'css',
      text: "The preferred value should transition between min and max across your expected viewport range. For a heading that should be 24px at 320px viewport and 64px at 1440px: slope = (64 - 24) / (1440 - 320) = 0.0357. In vw that's 3.57vw. Intercept = 24 - (0.0357 × 320) = 12.57px ≈ 0.786rem. Result: `clamp(1.5rem, calc(0.786rem + 3.57vw), 4rem)`. Online tools like utopia.fyi generate these values automatically.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="scale-demo">
  <h1>Precisely Calculated Heading</h1>
  <h2>Secondary Heading</h2>
  <h3>Tertiary Heading</h3>
  <p>Body text with fluid sizing. Each level is calculated to scale proportionally between mobile and desktop viewport widths.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.scale-demo {
  max-width: 700px;
  background: #1e293b;
  border-radius: 12px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Calculated: 40px at 320px viewport → 72px at 1440px */
h1 {
  font-size: clamp(2.5rem, calc(0.786rem + 5.36vw), 4.5rem);
  line-height: 1.1;
  color: #f8fafc;
}

/* Calculated: 28px at 320px viewport → 48px at 1440px */
h2 {
  font-size: clamp(1.75rem, calc(0.5rem + 3.93vw), 3rem);
  line-height: 1.2;
  color: #cbd5e1;
}

/* Calculated: 20px at 320px viewport → 32px at 1440px */
h3 {
  font-size: clamp(1.25rem, calc(0.357rem + 2.68vw), 2rem);
  line-height: 1.3;
  color: #94a3b8;
}

p {
  font-size: clamp(1rem, calc(0.875rem + 0.54vw), 1.25rem);
  line-height: 1.7;
  color: #64748b;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'clamp-spacing',
      defaultTab: 'css',
      text: "Clamp works for any CSS length property — not just font-size. `padding: clamp(1rem, 5%, 3rem)` gives responsive padding without breakpoints. `gap: clamp(16px, 3vw, 32px)` for fluid grid gaps. `margin-bottom: clamp(2rem, 5vw, 5rem)` for section spacing. Everything scales proportionally between mobile and desktop.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="page">
  <section class="section">
    <h2>Section with Fluid Spacing</h2>
    <p>The padding, gap, and heading margin all use clamp(). On narrow screens, the spacing is compact. On wide screens, content has room to breathe. No breakpoints needed.</p>
  </section>
  <section class="section">
    <h2>Another Section</h2>
    <p>Resize the preview to see all the spacing scale smoothly.</p>
  </section>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

.page {
  max-width: 800px;
  margin: 0 auto;
  /* Fluid padding: tight on mobile, generous on desktop */
  padding: clamp(1.5rem, 5vw, 4rem);
  display: flex;
  flex-direction: column;
  /* Fluid gap between sections */
  gap: clamp(2rem, 6vw, 5rem);
}

.section {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  /* Fluid padding inside each section */
  padding: clamp(1.5rem, 4%, 3rem);
}

h2 {
  font-size: clamp(1.3rem, 3vw, 2rem);
  /* Fluid margin below heading */
  margin-bottom: clamp(0.75rem, 2vw, 1.5rem);
  color: #f8fafc;
}

p {
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  color: #94a3b8;
  line-height: 1.7;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'ch-rem-in-clamp',
      defaultTab: 'css',
      text: "`font-size: calc(1rem + 2vw)` combines a fixed base (in rem, respects user preferences) with viewport scaling. At 320px: `calc(16px + 6.4px) = 22.4px`. At 1200px: `calc(16px + 24px) = 40px`. This is fluid AND accessible — users who increase their browser font size see proportionally larger text at every viewport width.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <h1>Accessible Fluid Type</h1>
  <h2>font-size: calc(1rem + 2vw)</h2>
  <p>The <code>rem</code> base means this scales with the user's browser font size preference. The <code>2vw</code> component adds proportional viewport scaling. Both axes of responsiveness in one line.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
:root { font-size: 16px; /* try changing to 20px to simulate user preference */ }

body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.demo {
  max-width: 700px;
  background: #1e293b;
  border-radius: 12px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

h1 {
  /* Scales with viewport AND with user font preferences */
  font-size: calc(1.75rem + 2.5vw);
  line-height: 1.15;
  color: #f8fafc;
}

h2 {
  font-size: calc(1rem + 1vw);
  color: #3b82f6;
  font-family: monospace;
}

p {
  font-size: calc(0.9rem + 0.3vw);
  color: #94a3b8;
  line-height: 1.7;
}

code {
  background: #334155;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'line-height-fluid',
      defaultTab: 'css',
      text: "Line-height should also scale. Large headings need tighter line-height (1.0–1.2) — they already have visual weight. Body text needs more breathing room (1.6–1.7). `line-height: calc(1.1em + 0.5rem)` creates an adaptive value: it scales with the element's own font-size (`em`) while adding a constant min gap (`rem`).",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <h1>A Long Heading That May Wrap onto Multiple Lines</h1>
  <p>Body text needs more generous line-height to be readable as long-form prose. Too tight and the eye struggles to find the next line. Too loose and the text feels scattered.</p>
  <p class="tight-p">This paragraph has the same font-size but line-height: 1.2 — unreadable for body text. You can feel the difference immediately.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.demo {
  max-width: 620px;
  background: #1e293b;
  border-radius: 12px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

h1 {
  font-size: clamp(1.75rem, 4vw, 3rem);
  /* Tight line-height for headings — scales with font size via em */
  line-height: 1.1;
  color: #f8fafc;
}

p {
  font-size: clamp(1rem, 2vw, 1.125rem);
  /* Generous line-height for body — the 0.5rem keeps a min gap at small sizes */
  line-height: calc(1em + 0.5rem);
  color: #94a3b8;
}

.tight-p {
  line-height: 1.2; /* bad for body text — demonstrates the difference */
  background: rgba(239,68,68,0.08);
  border-left: 3px solid #ef4444;
  padding: 12px;
  border-radius: 4px;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'measure',
      defaultTab: 'css',
      text: "The optimal line length for reading is 45–75 characters. The `ch` unit equals the width of the '0' character in the current font — a proxy for average character width. `max-width: 65ch` constrains a paragraph to the ideal reading measure. Crucially, it scales with font size automatically: when the font grows, the max-width grows proportionally.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<article class="article">
  <h1>The Ideal Line Length</h1>
  <p>This paragraph uses max-width: 65ch. No matter how large or small the font is, it constrains the column to approximately 65 characters wide — the sweet spot for reading comfort. The eye can return to the start of the next line without losing its place.</p>
  <p class="too-wide">This paragraph has no max-width. At wide viewports, lines stretch across the entire screen — 120+ characters. The eye must travel far to return to the start of the next line, causing reading fatigue.</p>
</article>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.article {
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  margin-bottom: 32px;
  line-height: 1.2;
}

p {
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.7;
  color: #94a3b8;
  margin-bottom: 24px;
  /* The ch unit scales with font size — 65ch at 16px ≠ 65ch at 20px */
  max-width: 65ch;
}

.too-wide {
  max-width: none; /* no constraint — compare readability */
  background: rgba(239,68,68,0.06);
  border-left: 3px solid #ef4444;
  padding: 16px;
  border-radius: 4px;
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-clamp'
    },
    {
      type: 'narration',
      id: 'fluid-spacing-scale',
      defaultTab: 'css',
      text: "A fluid spacing scale defined with CSS custom properties. Define the scale once at the `:root` and use it everywhere. Every element that uses `--space-sm` or `--space-lg` automatically gets responsive spacing. Change the viewport — everything scales together. This is systematic design.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="card">
  <h2>Card with Fluid Spacing</h2>
  <p>All spacing here — padding, gap, margins — comes from fluid CSS custom properties. One system, everything scales.</p>
  <div class="tags">
    <span class="tag">CSS</span>
    <span class="tag">Design</span>
    <span class="tag">Responsive</span>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  /* Fluid spacing scale */
  --space-xs:  clamp(0.5rem,  1vw,  0.75rem);
  --space-sm:  clamp(0.75rem, 2vw,  1rem);
  --space-md:  clamp(1rem,    3vw,  1.5rem);
  --space-lg:  clamp(1.5rem,  4vw,  2.5rem);
  --space-xl:  clamp(2rem,    6vw,  4rem);
}

body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: var(--space-xl) var(--space-lg);
}

.card {
  max-width: 600px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

h2 {
  font-size: clamp(1.25rem, 3vw, 2rem);
  line-height: 1.2;
}

p {
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  color: #94a3b8;
  line-height: 1.7;
  max-width: 60ch;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.tag {
  background: #334155;
  color: #94a3b8;
  padding: var(--space-xs) var(--space-sm);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'when-not-fluid',
      defaultTab: 'css',
      text: "Fluid typography is not always the answer. A narrow article with `max-width: 680px` changes very little between 320px and 680px — a breakpoint works fine. Complex layouts that fundamentally restructure between mobile and desktop still benefit from explicit `@media` breakpoints. Fluid is best for elements with a wide range of possible widths: headings, hero sections, full-width layouts.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="guide">
  <h2>When to Use Each</h2>
  <div class="item fluid">
    <h3>Fluid Typography</h3>
    <p>Wide-range widths: hero sections, marketing pages, full-width layouts. Continuous scaling between any two sizes.</p>
  </div>
  <div class="item breakpoint">
    <h3>Breakpoints</h3>
    <p>Structural layout changes: single column to three columns, mobile nav to desktop nav, hiding/showing elements.</p>
  </div>
  <div class="item both">
    <h3>Both Together</h3>
    <p>Most real sites use both: @media for layout structure, clamp() for typography and spacing within each layout.</p>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.guide {
  max-width: 700px;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 24px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.item {
  padding: 24px;
  border-radius: 10px;
  margin-bottom: 12px;
  border-left: 4px solid transparent;
}

.fluid {
  background: #1e293b;
  border-color: #3b82f6;
}

.breakpoint {
  background: #1e293b;
  border-color: #6366f1;
}

.both {
  background: #1e293b;
  border-color: #10b981;
}

h3 { font-size: 1.1rem; margin-bottom: 8px; }
p { font-size: 0.9rem; color: #94a3b8; line-height: 1.6; }`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-fluid'
    },
    {
      type: 'challenge',
      id: 'ch-hero-fluid',
      text: "Make the `.hero h1` use `clamp()` so it is at minimum `1.75rem`, at maximum `5rem`, and scales fluidly between them using a viewport-based preferred value like `5vw`.",
      hint: "The syntax is `font-size: clamp(minimum, preferred, maximum)`. Use `clamp(1.75rem, 5vw, 5rem)` or any valid preferred value between the min and max.",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="hero">
  <h1>The Hero Heading</h1>
  <p>Make this heading scale fluidly with the viewport.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 60px 24px;
}

.hero {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  /* Replace this with a clamp() value */
  font-size: 3rem;
  line-height: 1.15;
  margin-bottom: 16px;
  color: #f8fafc;
}

.hero p {
  font-size: 1.1rem;
  color: #94a3b8;
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return /font-size\s*:\s*clamp\s*\(/.test(css);
      }
    },
    {
      type: 'challenge',
      id: 'ch-fluid-system',
      text: "Create three CSS custom properties: `--text-sm`, `--text-base`, and `--text-xl`, each using `clamp()` for fluid scaling. Then apply `--text-xl` to `h1`, `--text-base` to `p`, and `--text-sm` to `small`.",
      hint: "Define the custom properties on `:root { --text-sm: clamp(...); }`. Then use them: `h1 { font-size: var(--text-xl); }`. Pick any valid clamp values — e.g. `clamp(0.75rem, 1.5vw, 0.875rem)` for small.",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="content">
  <h1>Main Heading</h1>
  <p>Body paragraph text that should be comfortably readable.</p>
  <small>A caption or footnote in smaller text.</small>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }

/* Define your fluid type scale here */
:root {
  /* --text-sm: clamp(...)  */
  /* --text-base: clamp(...) */
  /* --text-xl: clamp(...) */
}

body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 40px 24px;
}

.content {
  max-width: 600px;
  background: #1e293b;
  border-radius: 12px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

h1 {
  /* font-size: var(--text-xl); */
  line-height: 1.2;
}

p {
  /* font-size: var(--text-base); */
  color: #94a3b8;
  line-height: 1.7;
}

small {
  /* font-size: var(--text-sm); */
  color: #64748b;
  display: block;
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasCustomProps = /--text-sm/.test(css) && /--text-base/.test(css) && /--text-xl/.test(css);
        const hasClamp = /clamp\s*\(/.test(css);
        return hasCustomProps && hasClamp;
      }
    }
  ]
};

export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-01-normal-flow',
  title: '01. Normal Flow',
  chapter: 'css-ch1',
  language: 'web',
  checkpoints: [
    { id: 'cp-block-inline', label: 'Block vs Inline' },
    { id: 'cp-display', label: 'Display Property' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "You open a blank HTML file. You add two divs. You expect them to sit side by side. They don't. They stack. This is Normal Flow — the browser's default layout system. Understanding it is the foundation of all CSS layout.",
      files: {
        html: `<div class="box a">A</div>
<div class="box b">B</div>`,
        css: `body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.box {
  padding: 20px 32px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 6px;
}

.a { background: #3b82f6; }
.b { background: #10b981; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'block-elements',
      defaultTab: 'css',
      text: "Div elements are 'block-level'. A block element does something ruthless: it claims the entire horizontal line for itself. Even if the content is only 20px wide, the block stretches to fill the full container width. The next element has no choice — it must start on the next line. The dashed outline makes the invisible width visible.",
      files: {
        html: `<div class="box a">A</div>
<div class="box b">B</div>`,
        css: `body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.box {
  display: block; /* explicit, but this is the default */
  padding: 20px 32px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 6px;
  outline: 2px dashed rgba(255,255,255,0.4); /* reveals full width */
  margin-bottom: 8px;
}

.a { background: #3b82f6; }
.b { background: #10b981; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'block-width',
      defaultTab: 'css',
      text: "Notice the dashed outline — both boxes claim the full width of the container. That is why they stack. It is not a bug. It is the design. Block elements are for structural content: paragraphs, headings, sections. The outline helps you see what the browser actually allocates.",
      files: {
        html: `<div class="box a">A — I fill the whole line</div>
<div class="box b">B — I fill the whole line too</div>`,
        css: `body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.box {
  display: block;
  padding: 20px 32px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 6px;
  outline: 2px dashed rgba(255,255,255,0.4);
  margin-bottom: 8px;
}

.a { background: #3b82f6; }
.b { background: #10b981; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'inline-elements',
      defaultTab: 'css',
      text: "Not all elements are block-level. Span, strong, em, a — these are 'inline' elements. They flow like words in a sentence. They only take as much space as their content needs. They sit next to each other. Compare the divs at the top with the spans at the bottom.",
      files: {
        html: `<!-- Block elements: each claims a full row -->
<div class="box a">Block A</div>
<div class="box b">Block B</div>

<hr style="border-color:#334155; margin: 20px 0;">

<!-- Inline elements: flow side by side like words -->
<span class="tag">Tag One</span>
<span class="tag">Tag Two</span>
<span class="tag">Tag Three</span>`,
        css: `body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.box {
  padding: 16px 24px;
  font-weight: bold;
  border-radius: 6px;
  margin-bottom: 8px;
}

.a { background: #3b82f6; }
.b { background: #10b981; }

.tag {
  background: #7c3aed;
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.9rem;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'inline-cant-size',
      defaultTab: 'css',
      text: "Here is the trade-off: inline elements cannot have explicit width or height. Try to give a span `width: 200px` and the browser ignores it completely. Inline elements are sized by their content alone. See the comment — the width rule does nothing.",
      files: {
        html: `<p>Inline span with width attempt:</p>
<span class="attempt">I ignore your width: 200px</span>

<p style="margin-top:16px">Block div with same width:</p>
<div class="block-box">I respect width: 200px</div>`,
        css: `body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.attempt {
  background: #ef4444;
  padding: 8px 16px;
  border-radius: 4px;
  /* This width is completely ignored — spans are inline */
  width: 200px;
  color: white;
}

.block-box {
  background: #10b981;
  padding: 8px 16px;
  border-radius: 4px;
  width: 200px; /* This works — divs are block */
  color: white;
  margin-top: 8px;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'inline-block',
      defaultTab: 'css',
      text: "The best of both worlds: `display: inline-block`. Elements sit next to each other horizontally — like inline. But they accept width and height — like block. Watch: the two boxes now sit side by side.",
      files: {
        html: `<div class="box a">A</div>
<div class="box b">B</div>`,
        css: `body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.box {
  display: inline-block; /* sit side by side AND accept width */
  width: 48%;
  padding: 20px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 6px;
  text-align: center;
  box-sizing: border-box;
}

.a { background: #3b82f6; }
.b { background: #10b981; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'the-gap',
      defaultTab: 'css',
      text: "Notice the mysterious gap between the two inline-block boxes? That gap is not margin. It is literal whitespace — the space character between `</div>` and `<div>` in your HTML gets rendered as a text node. This is one of CSS's most famous gotchas.",
      files: {
        html: `<div class="box a">A</div>
<div class="box b">B</div>
<!-- The newline + spaces between these divs = a rendered space character -->`,
        css: `body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

/* The parent has no special rule yet — the whitespace gap is visible */
.container {
  background: #1e293b;
  padding: 16px;
}

.box {
  display: inline-block;
  width: 48%;
  padding: 20px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 6px;
  text-align: center;
  box-sizing: border-box;
}

.a { background: #3b82f6; }
.b { background: #10b981; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'gap-fix',
      defaultTab: 'css',
      text: "Two clean solutions: 1. Set `font-size: 0` on the parent container, then reset `font-size` on the children. 2. Use flexbox (which gets its own chapter). Setting font-size: 0 on the container makes the whitespace text node literally invisible — it renders at zero width.",
      files: {
        html: `<div class="container">
  <div class="box a">A</div>
  <div class="box b">B</div>
</div>`,
        css: `body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.container {
  background: #1e293b;
  padding: 16px;
  font-size: 0; /* collapses the whitespace text node */
}

.box {
  display: inline-block;
  width: 48%;
  padding: 20px;
  font-size: 16px; /* reset — children must restore their font-size */
  font-weight: bold;
  border-radius: 6px;
  text-align: center;
  box-sizing: border-box;
  margin: 1%;
}

.a { background: #3b82f6; }
.b { background: #10b981; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'inline-block-use',
      defaultTab: 'css',
      text: "Navigation bars used inline-block for years before flexbox existed. These nav links are inline-block elements — each takes its natural width, they sit side by side, and they can have padding and height like block elements.",
      files: {
        html: `<nav>
  <a href="#">Home</a>
  <a href="#">About</a>
  <a href="#">Work</a>
  <a href="#">Blog</a>
  <a href="#">Contact</a>
</nav>`,
        css: `body {
  font-family: sans-serif;
  background: #0f172a;
  margin: 0;
}

nav {
  background: #1e293b;
  padding: 0 24px;
  font-size: 0; /* suppress whitespace gaps */
}

nav a {
  display: inline-block;
  font-size: 15px;      /* restore font-size */
  color: #94a3b8;
  text-decoration: none;
  padding: 16px 20px;   /* height via padding, works because inline-block */
  font-weight: 500;
  transition: color 0.2s;
}

nav a:hover {
  color: #f1f5f9;
  background: #334155;
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-block-inline'
    },
    {
      type: 'narration',
      id: 'display-none',
      defaultTab: 'css',
      text: "`display: none` removes an element completely from layout and the visual page — no space is preserved. Compare this to `visibility: hidden` which hides the element visually but leaves its space in the flow. Both are used in show/hide patterns but behave completely differently.",
      files: {
        html: `<div class="box a">Box A — visible</div>
<div class="box b">Box B — display: none (gone completely)</div>
<div class="box c">Box C — visibility: hidden (invisible but space remains)</div>
<div class="box d">Box D — visible</div>`,
        css: `body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
}

.box {
  padding: 16px 24px;
  border-radius: 6px;
  margin-bottom: 8px;
  font-weight: 500;
}

.a { background: #3b82f6; }

.b {
  background: #ef4444;
  display: none; /* completely removed from layout */
}

.c {
  background: #f59e0b;
  visibility: hidden; /* invisible but the space is still there */
}

.d { background: #10b981; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'display-table',
      defaultTab: 'css',
      text: "There are many display values: `block`, `inline`, `inline-block`, `none`, `flex`, `grid`, `table`, `list-item`. They all change how the box participates in the flow. The most important — flex and grid — each get their own chapters. Every element has a display value; it controls everything about how it takes up space.",
      files: {
        html: `<div class="box a">block</div>
<span class="box b">inline</span>
<span class="box b">inline</span>
<div class="box c">inline-block</div>
<div class="box c">inline-block</div>`,
        css: `body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
  font-size: 14px;
}

/* display: block — comments describe the full list */
/* display: inline */
/* display: inline-block */
/* display: flex — Chapter 2 */
/* display: grid — Chapter 3 */
/* display: none — removes from layout */
/* display: table — legacy, avoid */
/* display: list-item — what li uses */

.box {
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  margin: 4px;
}

.a {
  display: block;
  background: #3b82f6;
}

.b {
  display: inline;
  background: #7c3aed;
  padding: 10px 20px;
}

.c {
  display: inline-block;
  background: #10b981;
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-display'
    },
    {
      type: 'challenge',
      id: 'ch-nav',
      text: "Make the three `.btn` divs sit side by side in a horizontal row using `display: inline-block`. Each button should keep its background color and padding.",
      hint: "Add `display: inline-block;` to the `.btn` rule in the CSS panel.",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="btn">Home</div>
<div class="btn">About</div>
<div class="btn">Work</div>`,
        css: `body {
  font-family: sans-serif;
  background: #0f172a;
  color: white;
  padding: 24px;
}

.btn {
  /* Make these sit side by side — add display: inline-block */
  background: #3b82f6;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin: 4px;
}`,
        js: ''
      },
      validate: (ctx) => /display\s*:\s*inline-block/.test(ctx.files?.css || '') || /display\s*:\s*flex/.test(ctx.files?.css || '')
    },
    {
      type: 'challenge',
      id: 'ch-layout',
      text: "The sidebar and content divs are stacking vertically. Make them sit side by side: `.sidebar` should be 200px wide, `.content` should fill the rest of the space.",
      hint: "Add `display: inline-block` to both `.sidebar` and `.content`. Set `width: 200px` on `.sidebar` and `width: calc(100% - 216px)` on `.content` (accounting for margin). Or use flexbox on `.wrapper`.",
      defaultTab: 'css',
      startFiles: {
        html: `<div class="wrapper">
  <div class="sidebar">Sidebar</div>
  <div class="content">Main Content</div>
</div>`,
        css: `* { box-sizing: border-box; }

body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f1f5f9;
  padding: 24px;
  margin: 0;
}

.wrapper {
  background: #1e293b;
  padding: 8px;
  font-size: 0; /* suppress inline-block gap if you use inline-block */
}

.sidebar {
  /* Make me 200px wide and inline-block */
  background: #334155;
  padding: 20px;
  font-size: 16px;
  font-weight: 600;
  min-height: 200px;
}

.content {
  /* Make me fill the remaining space and inline-block */
  background: #1e3a5f;
  padding: 20px;
  font-size: 16px;
  min-height: 200px;
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        return (/display\s*:\s*inline-block/.test(css) || /display\s*:\s*flex/.test(css));
      }
    }
  ]
};

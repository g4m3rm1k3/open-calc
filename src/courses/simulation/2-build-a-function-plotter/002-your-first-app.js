const sim2_001 = {
  id: 'sim2-001',
  slug: 'your-first-app',
  chapter: 'sim2',
  order: 1,
  title: 'Your First App',
  subtitle: 'Building a styled, theme-aware UI from scratch using HTML, CSS, and JavaScript — the right way from line one.',
  tags: ['html', 'css', 'dom', 'dark mode', 'css variables', 'box model', 'innerHTML'],
  timeToComplete: 25,
  coreConcept: 'Every interactive UI is built from three languages working together: HTML for structure, CSS for appearance, and JavaScript for behavior. The sandbox gives you a single div called `app` — your entire app lives inside it. Using CSS custom properties for colors instead of hardcoded hex values lets your UI adapt to dark and light mode automatically.',

  // ── Hook ──────────────────────────────────────────────────────────────────
  hook: {
    question: 'Every website you have ever used started as a blank div. How does a professional turn that blank div into a polished, dark-mode-ready interface — starting only from JavaScript?',
    realWorldContext: 'When you open GitHub, VS Code, or any modern app, it reads your system\'s dark or light preference and adapts instantly. This is not magic: it is a small set of CSS color variables that get updated when the theme changes. Experienced engineers set this up from the very first line of CSS they write — not as an afterthought six months later when a user complains. In this lesson you will build your first complete UI from scratch inside a sandbox div, and you will do it the right way: theme-aware from cell one.',
  },

  // ── Intuition ─────────────────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Three languages, one function.** Every webpage is built from three technologies that each do one job: HTML describes *structure* (what elements exist and in what order), CSS describes *appearance* (colors, sizes, spacing, layout), and JavaScript describes *behavior* (what happens when things are clicked or typed). In our sandbox, your code is JavaScript — but you can write HTML and CSS inside JavaScript as strings, which gives you all three tools from a single function.',

      '**Your root: the `app` div.** When the sandbox starts, one element already exists: a `<div id="app">` that fills the entire preview window. Your code receives it as the variable `app`. Everything you build — buttons, canvases, text, entire page layouts — goes inside `app`. Think of it as an empty room: you decide what furniture goes in, where it goes, and what color it is.',

      '**Setting `innerHTML`.** The fastest way to fill `app` is `app.innerHTML = "..."`. You assign an HTML string, and the browser immediately parses it and creates all the elements described. You can include a `<style>` tag inside that string to define CSS at the same time. Every time you click Run, `innerHTML` is reassigned from scratch — the old content is thrown out and replaced.',

      '**The box model — how space works in CSS.** Every HTML element is a rectangular box with four layers from outside in: margin (space between this element and its neighbors), border (the visible edge), padding (space between the border and the content inside), and content. When you write `padding: 20px` you push the content 20px away from all four edges.',

      '**Why `box-sizing: border-box` is always the first rule.** By default, CSS adds padding *outside* a box\'s stated width. A div with `width: 200px; padding: 20px` is actually 240px wide. Setting `box-sizing: border-box` on `*` makes width include padding and border — the element is exactly the size you declared. Every professional stylesheet starts with this.',

      '**The problem with hardcoded colors.** If you write `color: #0f172a` and `background: var(--color-background-primary, #ffffff)`, your app looks great in light mode. Toggle dark mode and those values are still `#0f172a` on `#ffffff` — the browser cannot change them. Your text becomes invisible or you get a blinding white card in a dark interface.',

      '**CSS custom properties — the solution.** Declare a named value on `:root`: `--text: #0f172a`. Use it anywhere: `color: var(--text)`. When JavaScript updates `--text` to `#e2e8f0` for dark mode, every rule using `var(--text)` updates simultaneously — no loops, no re-running code. The sandbox defines eight variables: `--bg`, `--surface`, `--surface2`, `--border`, `--text`, `--muted`, `--accent`, and `--accent-bg`. These cover 90% of what any UI needs.',

      '**The sandbox theme system.** The sandbox sets all eight CSS variables to the correct light or dark values *before* your code runs. It also updates them live when you toggle dark mode in the top bar. Your CSS using `var(--surface)` and `var(--text)` is automatically correct — no JavaScript required in your cell code.',
    ],

    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 10 — Build a Function Plotter',
        body: '**Previous:** Chapter 1 — The Sim Loop\n**This lesson:** HTML structure, CSS styling, the box model, and theme-aware design using CSS custom properties.\n**Next:** Lesson 2 — Layouts and Components. You will build reusable card and row patterns and compose them into larger interfaces.',
      },
      {
        type: 'procedure',
        title: 'The HTML Mode Pattern (3 Steps)',
        body: 'Every HTML mode cell follows the same shape:\n\n**Step 1.** Set `app.innerHTML` to an HTML string with markup and a `<style>` tag.\n**Step 2.** Use `app.querySelector(\'#id\')` to get references to elements you created.\n**Step 3.** Attach behavior: `element.addEventListener(\'click\', () => { ... })`.\n\nThe style tag gives you full CSS. querySelector works exactly like document.querySelector but scoped to your app.',
      },
      {
        type: 'definition',
        title: 'The DOM (Document Object Model)',
        body: 'The DOM is the browser\'s live representation of a page as a tree of objects. `<div><p>Hello</p></div>` becomes a div object with a p object as its child. JavaScript can read and modify this tree at any time. `app.innerHTML = "..."` rebuilds a subtree of the DOM from an HTML string. `app.querySelector(\'#id\')` finds a node in that tree by CSS selector.',
      },
      {
        type: 'procedure',
        title: 'Using CSS Variables for Theming',
        body: 'Use `var(--name)` instead of a color literal in your `<style>` tag:\n\n```\nbody    { background: var(--bg) }\n.card   { background: var(--surface); color: var(--text); border: 1px solid var(--border) }\n.hint   { color: var(--muted) }\nbutton  { background: var(--accent); color: white }\n```\n\nToggle dark mode — every rule that uses `var()` adapts with zero extra JavaScript.',
      },
      {
        type: 'warning',
        title: 'Never Hardcode #ffffff or #000000',
        body: '`color: #000000` on a dark background produces near-invisible text. `background: var(--color-background-primary, #ffffff)` in a dark UI produces a blinding white flash. The rule: any color that should change between light and dark must use `var(--something)`. The only safe hardcoded colors are things that never change — brand colors, status indicators (red for error, green for success).',
      },
      {
        type: 'insight',
        title: 'box-sizing: border-box — Why It Is Always First',
        body: 'Default CSS: `width` means content width only, so `width: 200px; padding: 20px` renders as 240px. With `border-box`, `width` includes padding and border — the element is exactly 200px. This matches how humans think about sizing. Put `* { box-sizing: border-box }` as the very first rule in every style block.',
      },
      {
        type: 'insight',
        title: 'innerHTML vs. textContent',
        body: '`element.innerHTML = "<b>Hello</b>"` parses the string as HTML — `<b>` becomes a real bold element.\n`element.textContent = "<b>Hello</b>"` sets the literal characters — angle brackets appear on screen.\n\nUse `innerHTML` when building structure. Use `textContent` when displaying user-supplied values (user input could contain `<script>` tags — never put untrusted text into `innerHTML`).',
      },
      {
        type: 'insight',
        title: 'Why We Write CSS Inside the HTML String',
        body: 'Each sandbox cell is completely independent with no shared file system. Writing `<style>` tags inline is the right approach here. It also teaches how CSS actually works: as text the browser parses. In a real project you would move CSS to a `.css` file, but the rules you write are identical.',
      },
    ],

    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Build: Your First App',
        mathBridge: 'Each cell builds one new concept. Run each cell, then modify values — colors, sizes, text — before moving on. The goal is not to memorize syntax: it is to build the mental model of how HTML, CSS, and JavaScript fit together.',
        caption: 'All four cells use html mode. Toggle dark mode while a cell is running — notice how var(--surface) and var(--text) adapt instantly.',
        initialProps: {
          initialCells: [
            // ── Cell 1 ──────────────────────────────────────────────────────────
            {
              id: 1,
              mode: 'html',
              cellTitle: 'Hello, App — The Container and CSS Variables',
              prose: [
                'When the sandbox loads, one element already exists: a `<div id="app">` that fills the entire preview window. Your function receives it as the variable `app`. From here on, everything you build goes inside that div.',
                '`app.innerHTML = \\`...\\`` replaces all content inside `app` with whatever HTML string you provide. Include a `<style>` tag in that string to write CSS at the same time. Every time you press **Run**, the entire content is rebuilt from scratch.',
                'Look at the CSS: every color uses `var(--something)` instead of a hex code. `var(--surface)` is white in light mode and dark navy in dark mode. `var(--text)` is near-black in light mode and near-white in dark mode. The sandbox sets these before your code runs. **Toggle dark mode now** — watch the card adapt without changing a single line of code.',
              ],
              code:
`// The sandbox gives you one variable: 'app'
// It is a <div> that fills the preview window.
// Set app.innerHTML to build your UI.

app.innerHTML = \`
  <style>
    /* ── Reset: should be first in every stylesheet ──────────────────── */
    * { box-sizing: border-box; margin: 0; padding: 0 }

    /* ── Page background uses the sandbox theme token ─────────────────── */
    body { background: var(--bg) }

    .card {
      margin: 24px;
      padding: 24px;
      background: var(--surface);       /* white in light, slate-800 in dark */
      border: 1px solid var(--border);  /* subtle divider line                */
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    h2 {
      font-size: 20px;
      font-weight: 700;
      color: var(--text);               /* near-black or near-white           */
      margin-bottom: 8px;
    }

    p {
      font-size: 15px;
      line-height: 1.65;
      color: var(--muted);              /* softer than --text, for body copy  */
    }

    .badge {
      display: inline-block;
      margin-top: 14px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      background: var(--accent-bg);
      color: var(--accent);
    }
  </style>

  <div class="card">
    <h2>Hello, App!</h2>
    <p>
      Every color here uses a CSS variable — <code>var(--surface)</code>,
      <code>var(--text)</code>, <code>var(--muted)</code>.
      Toggle dark mode in the top bar to see them update instantly.
    </p>
    <span class="badge">html mode</span>
  </div>
\`

// ── Try these ─────────────────────────────────────────────────────────────────
// 1. Toggle dark mode. Does the card adapt?
// 2. Change the heading text and press Run.
// 3. Change margin: 24px to margin: 4px — what happens?`,
            },

            // ── Cell 2 ──────────────────────────────────────────────────────────
            {
              id: 2,
              mode: 'html',
              cellTitle: 'The Box Model — Padding, Margin, and Border',
              prose: [
                'Every HTML element is a rectangular box with four layers from outside in: **margin** (invisible space between this element and neighbors), **border** (the visible edge), **padding** (space between the border and the content), and **content** itself. You control each layer independently.',
                'The `padding` shorthand has a pattern: `padding: 4px 8px` means 4px top-and-bottom, 8px left-and-right. `padding: 16px` means 16px on all four sides. Values go clockwise from top: `padding: top right bottom left`.',
                'Notice `* { box-sizing: border-box }` is the very first rule. Without it, `width: 200px; padding: 20px` actually renders as 240px wide because padding adds to the content width. `border-box` makes width *include* padding — the element is exactly the size you declared. This is the first rule in every professional stylesheet.',
              ],
              code:
`app.innerHTML = \`
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0 }
    body { background: var(--bg); padding: 20px; font-family: system-ui, sans-serif }

    .label {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: var(--muted); margin-bottom: 8px;
    }

    .box {
      background: var(--surface);
      border: 2px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-size: 14px;
      margin-bottom: 16px;
    }

    /* padding: top-bottom side */
    .tight  { padding: 4px 10px }
    .medium { padding: 16px 20px }
    .roomy  { padding: 32px 40px }

    /* border-radius rounds the corners */
    .row         { display: flex; gap: 12px; margin-bottom: 16px }
    .row .box    { flex: 1; text-align: center; padding: 14px }
    .sharp       { border-radius: 0 }
    .rounded     { border-radius: 12px }
    .pill        { border-radius: 100px }
  </style>

  <p class="label">Padding (inner space)</p>
  <div class="box tight">tight — padding: 4px 10px</div>
  <div class="box medium">medium — padding: 16px 20px</div>
  <div class="box roomy">roomy — padding: 32px 40px</div>

  <p class="label">Border radius</p>
  <div class="row">
    <div class="box sharp">Sharp (0)</div>
    <div class="box rounded">Rounded (12px)</div>
    <div class="box pill">Pill (100px)</div>
  </div>
\`

// ── Try these ─────────────────────────────────────────────────────────────────
// Change 'tight' padding to padding: 24px 32px. What does it do?
// Change one border-radius to 50% — what shape appears?`,
            },

            // ── Cell 3 ──────────────────────────────────────────────────────────
            {
              id: 3,
              mode: 'html',
              cellTitle: 'Typography and Color Hierarchy',
              prose: [
                'Good typography is invisible — readers focus on content, not the text itself. The way to achieve this is a consistent **three-tier hierarchy**: headings are large and highest-contrast (`var(--text)`), body text is medium and softer (`var(--muted)`), and hints or metadata are small and quiet (`var(--muted)` with reduced opacity).',
                '`var(--muted)` is slate-600 in light mode and slate-400 in dark mode — both are carefully chosen to be readable without competing with the heading. When you toggle dark mode the contrast ratios stay appropriate. This is exactly why you use tokens: the same CSS rule produces the right color in both contexts.',
                'The `<code>` element below uses `background: var(--surface2)` — a slightly different surface than the card. This creates a subtle inset that signals "this is literal code." Using `var(--surface2)` instead of a fixed color means it adapts automatically. Try changing `.card` background to `var(--surface2)` and notice how the code badge needs to adjust.',
              ],
              code:
`app.innerHTML = \`
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif }
    body { background: var(--bg); padding: 24px }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 16px;
    }

    /* Level 1 — Heading: largest, boldest, highest contrast */
    h2 { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 6px }

    /* Level 2 — Body: readable, slightly softer than the heading */
    p { font-size: 14px; line-height: 1.65; color: var(--muted); margin-bottom: 10px }
    p:last-child { margin-bottom: 0 }

    /* Level 3 — Hint/meta: quiet, de-emphasized */
    .hint { font-size: 12px; color: var(--muted); opacity: 0.65 }

    /* Accent pill — draws the eye to exactly one thing */
    .tag {
      display: inline-block; padding: 2px 9px; border-radius: 4px;
      font-size: 11px; font-weight: 600;
      background: var(--accent-bg); color: var(--accent);
    }

    /* Inline code — subtle inset on a different surface */
    code {
      font-family: monospace; font-size: 13px;
      background: var(--surface2); padding: 1px 5px;
      border-radius: 3px; color: var(--accent);
    }
  </style>

  <div class="card">
    <span class="tag">CSS Variables</span>
    <h2 style="margin-top: 8px">Three levels of color</h2>
    <p>
      This body text uses <code>var(--muted)</code> — softer than the heading,
      still readable. The heading uses <code>var(--text)</code> for maximum contrast.
    </p>
    <p class="hint">Toggle dark mode — both levels adapt correctly.</p>
  </div>

  <div class="card">
    <h2>What to notice</h2>
    <p>
      Heading and body text look different without any extra effort because they
      use different tokens. <code>var(--text)</code> is near-black in light mode,
      near-white in dark. <code>var(--muted)</code> is always a step softer.
    </p>
    <p class="hint">Updated 2 minutes ago · 3 min read</p>
  </div>
\``,
            },

            // ── Cell 4 ──────────────────────────────────────────────────────────
            {
              id: 4,
              mode: 'html',
              cellTitle: 'Layout with Flexbox',
              prose: [
                'Flexbox is a CSS layout mode that arranges children in a row or column. You activate it on the *parent* container with `display: flex`. The container controls direction, spacing, and alignment. Children control how much space they claim.',
                'Two properties you will use constantly: `align-items: center` aligns children perpendicular to the main axis — for a row, this centers them vertically. `justify-content: space-between` pushes the first child to one end and the last to the other. Together they build any toolbar or header.',
                'Notice `flex: 1` on `.toolbar h3`. Without it, the title takes only as much space as its text, and buttons sit right next to it. With `flex: 1`, the title expands to fill all available space, pushing the buttons to the far right. This single property is the key to building layouts that push items to the edges.',
              ],
              code:
`app.innerHTML = \`
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif }
    body { background: var(--bg); padding: 20px; display: flex; flex-direction: column; gap: 16px }

    /* ── Toolbar: items in a row ────────────────────────────────────────── */
    .toolbar {
      display: flex;           /* activate flexbox — children go left to right */
      align-items: center;     /* vertically center children                   */
      gap: 10px;               /* space between each child                     */
      padding: 12px 16px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
    }

    /* flex: 1 makes the title grow, pushing buttons to the right */
    .toolbar h3 { font-size: 15px; font-weight: 700; color: var(--text); flex: 1 }

    button {
      padding: 6px 14px; border: none; border-radius: 6px;
      font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .btn-primary { background: var(--accent); color: white }
    .btn-ghost   {
      background: var(--surface2); color: var(--text);
      border: 1px solid var(--border);
    }

    /* ── Stat row: three equal columns ──────────────────────────────────── */
    .stats { display: flex; gap: 12px }

    .stat {
      flex: 1;                 /* each stat takes an equal share of the row   */
      padding: 16px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      text-align: center;
    }
    .stat .value { font-size: 28px; font-weight: 800; color: var(--text) }
    .stat .label { font-size: 12px; color: var(--muted); margin-top: 2px }
  </style>

  <div class="toolbar">
    <h3>Dashboard</h3>
    <button class="btn-ghost">Export</button>
    <button class="btn-primary">New</button>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="value">142</div>
      <div class="label">Commits</div>
    </div>
    <div class="stat">
      <div class="value">8</div>
      <div class="label">Open PRs</div>
    </div>
    <div class="stat">
      <div class="value">99%</div>
      <div class="label">Coverage</div>
    </div>
  </div>
\`

// ── Try these ─────────────────────────────────────────────────────────────────
// Remove flex: 1 from .toolbar h3 — where do the buttons go?
// Add a fourth stat div. Does it automatically fit the row?
// Change flex-direction on .stats to column — what layout appears?`,
            },
          ],
        },
      },

      {
        id: 'SimNotebook',
        title: 'Challenges',
        mathBridge: 'These challenges have no single correct answer. Focus on: CSS variables for every color, clear typography hierarchy, and correct behavior in both light and dark mode. If you get stuck, the next lesson opens with working examples.',
        caption: 'Toggle dark mode between attempts. If anything looks harsh or washed out, a hardcoded color is the cause.',
        initialProps: {
          initialCells: [
            {
              id: 5,
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Profile Card',
              difficulty: 'easy',
              prose: [
                'This challenge combines everything from cells 1–4: the container, box model, typography hierarchy, and a simple flex layout. There is no single correct answer — aim for something that looks polished in both modes, where every color uses a CSS variable.',
              ],
              prompt: 'Build a profile card for a fictional developer. Show: a circular avatar with initials (no image — a colored circle with two letters), their name as a heading, their role in muted text, and two stat numbers (e.g. "312 commits" and "14 repos") in a flex row at the bottom. Use only CSS variables for colors.',
              hint: 'Avatar circle: set equal width and height (e.g. 56px), border-radius: 50%, display: flex, align-items: center, justify-content: center. Use var(--accent) for the background and white text. For the stats row: display: flex with gap on the parent, and give each stat flex: 1.',
              code:
`app.innerHTML = \`
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif }
    body { background: var(--bg); padding: 24px }
    /* TODO: style the card, avatar, name, role, and stats */
  </style>

  <div class="card">
    <div class="avatar">JD</div>
    <h2 class="name">Jamie Donovan</h2>
    <p class="role">Frontend Engineer</p>
    <div class="stats">
      <div class="stat">
        <span class="value">312</span>
        <span class="label">commits</span>
      </div>
      <div class="stat">
        <span class="value">14</span>
        <span class="label">repos</span>
      </div>
    </div>
  </div>
\``,
            },

            {
              id: 6,
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'App Header',
              difficulty: 'medium',
              prose: [
                'A header is the first thing a user sees. It establishes the visual identity and navigation structure of the whole interface. The classic three-part pattern — brand left, nav center, action right — works because `justify-content: space-between` on a flex container handles the spacing automatically.',
              ],
              prompt: 'Build a full-width app header with: a logo/brand on the left (emoji + name), centered nav with three text links (Home, Lessons, Labs), and a "Sign In" button on the right. The header sits on `var(--surface)` with a bottom border using `var(--border)`. All text uses CSS variables. It must look polished in both light and dark mode.',
              hint: 'Use display: flex with justify-content: space-between on the header. The nav is another nested flex row. Give links color: var(--muted) normally and color: var(--text) on :hover. The Sign In button uses background: var(--accent) with white text and no border.',
              code:
`app.innerHTML = \`
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif }
    body { background: var(--bg) }
    /* TODO: header layout, brand, nav links, sign-in button */
  </style>

  <header class="header">
    <div class="brand">🧮 UpSkillOS</div>
    <nav class="nav">
      <a href="#">Home</a>
      <a href="#">Lessons</a>
      <a href="#">Labs</a>
    </nav>
    <button class="sign-in">Sign In</button>
  </header>
\``,
            },

            {
              id: 7,
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Feature Grid',
              difficulty: 'hard',
              prose: [
                'CSS Grid is an alternative to flexbox for two-dimensional layouts — rows and columns simultaneously. `grid-template-columns: repeat(3, 1fr)` creates three equal columns and `1fr` means "one fraction of the available space." Each direct child of the grid container fills one cell automatically, with no explicit positioning needed.',
              ],
              prompt: 'Build a three-column feature grid — the kind you see on landing pages. Each card has a large emoji icon, a bold title, and two sentences of description in muted text. Add a page heading and subtitle above the grid. All colors use CSS variables. Bonus: give each card a `border-top: 3px solid var(--accent)` as a visual accent.',
              hint: 'Grid container: `display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px`. Each `.card` gets `border-top: 3px solid var(--accent); padding: 20px`. The emoji "icon" is a large-font div (font-size: 32px) above the title.',
              code:
`app.innerHTML = \`
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif }
    body { background: var(--bg); padding: 32px }
    /* TODO: page heading styles, three-column grid, cards */
  </style>

  <div class="page">
    <h1 class="heading">Everything you need to build</h1>
    <p class="subtitle">Three things that make UpSkillOS different.</p>

    <div class="grid">
      <div class="card">
        <div class="icon">⚡</div>
        <h3>Live Sandboxes</h3>
        <p>Every lesson has runnable code that executes in real time. No setup, no install, no waiting.</p>
      </div>
      <div class="card">
        <div class="icon">🎯</div>
        <h3>Challenge Cells</h3>
        <p>Learn by doing. Each lesson ends with open-ended challenges that have no single right answer.</p>
      </div>
      <div class="card">
        <div class="icon">🌙</div>
        <h3>Dark Mode Ready</h3>
        <p>CSS variables mean your app adapts to any theme automatically — from the very first line of CSS.</p>
      </div>
    </div>
  </div>
\``,
            },
          ],
        },
      },
    ],
  },
}

export default sim2_001

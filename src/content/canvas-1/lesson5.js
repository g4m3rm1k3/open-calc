const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #1a1a2e; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  canvas { display: block; background: #16213e; border: 1px solid #0f3460; border-radius: 4px; }
`;

const LESSON_CANVAS_5 = {
  title: 'Text on Canvas',
  subtitle: 'Font, fillText, measureText, textAlign, textBaseline, and manual word wrapping.',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `## Text in Canvas

Canvas text is simpler than DOM text and more manual than HTML. You control everything explicitly: font, alignment, baseline, and position. For CAD tools you'll use canvas text for dimension labels, rulers, tooltips, and overlays.

### The font property

\`font\` accepts a CSS font shorthand string — the same format as the CSS \`font\` property:

\`\`\`js
ctx.font = '16px Arial';
ctx.font = 'bold 24px Courier New';
ctx.font = 'italic 18px Georgia';
ctx.font = '700 14px "Segoe UI", sans-serif';
\`\`\`

Format: \`[style] [weight] size fontFamily\`

### fillText and strokeText

\`\`\`js
// fillText(text, x, y, maxWidth?)
ctx.fillStyle = '#e2e8f0';
ctx.font = '20px Arial';
ctx.fillText('Hello Canvas', 50, 100);

// strokeText — outline only (use for large display text)
ctx.strokeStyle = '#e94560';
ctx.lineWidth = 1;
ctx.strokeText('OUTLINE', 50, 160);

// Both — stroke first, then fill on top
ctx.strokeStyle = '#000';
ctx.lineWidth = 4;
ctx.lineJoin = 'round';
ctx.strokeText('BOLD', 50, 220);
ctx.fillStyle = '#ffd700';
ctx.fillText('BOLD', 50, 220);
\`\`\`

Canvas has **no automatic text wrapping** — you implement it yourself using \`measureText\`.`,
    },

    {
      type: 'js',
      instruction: `## textAlign and textBaseline — Anchoring Text

These two properties control which point of the text bounding box maps to the \`(x, y)\` you pass to \`fillText\`.

**textAlign** positions text horizontally relative to x:
- \`'left'\` — x is the left edge (default)
- \`'center'\` — x is the horizontal center
- \`'right'\` — x is the right edge

**textBaseline** positions text vertically relative to y:
- \`'alphabetic'\` — default; baseline of normal letters (bottom of most characters)
- \`'top'\` — y is the top of the text box
- \`'middle'\` — y is the vertical center
- \`'bottom'\` — y is the bottom of the descenders

For CAD labels and annotation, \`textAlign='center'\` + \`textBaseline='middle'\` lets you position text by its exact center — the most useful combination.`,
      html: `<canvas id="canvas" width="580" height="320"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Draw a vertical center line
ctx.setLineDash([4, 4]);
ctx.strokeStyle = '#1e3a5f';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(190, 0);
ctx.lineTo(190, 320);
ctx.stroke();
ctx.setLineDash([]);

// textAlign demo — all anchored to the same x=190
ctx.font = 'bold 16px Courier New';
const aligns = ['left', 'center', 'right'];
const colors = ['#e94560', '#ffd700', '#4ade80'];
aligns.forEach((align, i) => {
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = colors[i];
  ctx.fillText(\`textAlign: '\${align}'\`, 190, 50 + i * 40);
  // Dot at the anchor point
  ctx.beginPath();
  ctx.arc(190, 50 + i * 40, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
});

// textBaseline demo — all at the same y
ctx.fillStyle = '#1e3a5f';
ctx.fillRect(0, 195, 580, 1);

ctx.font = 'bold 36px Georgia';
const baselines = ['top', 'middle', 'alphabetic', 'bottom'];
const bColors = ['#00d4ff', '#4ade80', '#ffd700', '#ff69b4'];
let bx = 300;
baselines.forEach((baseline, i) => {
  ctx.textBaseline = baseline;
  ctx.textAlign = 'left';
  ctx.fillStyle = bColors[i];
  ctx.fillText('Ag', bx, 195);
  // Tick mark at the y=195 baseline
  ctx.strokeStyle = bColors[i];
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bx, 188);
  ctx.lineTo(bx, 202);
  ctx.stroke();
  // Label below
  ctx.font = '10px Courier New';
  ctx.textBaseline = 'top';
  ctx.fillText(baseline, bx, 245);
  bx += 70;
  ctx.font = 'bold 36px Georgia';
});`,
      showPreviewByDefault: true,
      outputHeight: 360,
    },

    {
      type: 'js',
      instruction: `## measureText — Sizing Text Before Drawing

\`ctx.measureText(string)\` returns a \`TextMetrics\` object with the pixel width of the text at the current font setting. Use it to:
- Draw a **background box** that fits the text exactly
- **Center text** within a fixed-width region
- Detect if text is **too wide** for a given space
- Implement **word wrapping** (Canvas doesn't do this automatically)

\`\`\`js
ctx.font = '14px Courier New';
const m = ctx.measureText('Hello World');
m.width  // pixel width
m.actualBoundingBoxAscent   // height above baseline
m.actualBoundingBoxDescent  // depth below baseline
\`\`\`

The \`labelWithBox\` pattern below is the foundation of every annotation label, tooltip, and dimension marker in a CAD tool.`,
      html: `<canvas id="canvas" width="580" height="300"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Helper: draw text with a fitted background box
function labelWithBox(text, x, y, { fg = '#fff', bg = 'rgba(0,212,255,0.85)', pad = 6 } = {}) {
  ctx.save();
  ctx.font = '13px Courier New';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const m = ctx.measureText(text);
  const bh = 22;
  // Draw background
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(x - pad, y - bh / 2, m.width + pad * 2, bh, 4);
  ctx.fill();
  // Draw text
  ctx.fillStyle = fg;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Word wrap helper
function wrapText(ctx, text, x, y, maxWidth, lineH) {
  const words = text.split(' ');
  let line = '', cy = y;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, cy);
      line = word + ' ';
      cy += lineH;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, cy);
}

// Annotation labels
labelWithBox('Origin (0, 0)', 20, 40, { bg: 'rgba(233,69,96,0.85)' });
labelWithBox('Node A', 140, 120, { bg: 'rgba(74,222,128,0.85)', fg: '#0f1e3a' });
labelWithBox('Node B', 300, 180, { bg: 'rgba(255,215,0,0.85)', fg: '#0f1e3a' });
labelWithBox('Distance: 187.4 px', 200, 150, { bg: 'rgba(255,255,255,0.9)', fg: '#0f1e3a' });

// Connect the nodes with a line
ctx.strokeStyle = '#334155';
ctx.lineWidth = 1;
ctx.setLineDash([4, 4]);
ctx.beginPath();
ctx.moveTo(155, 120);
ctx.lineTo(315, 180);
ctx.stroke();
ctx.setLineDash([]);

// Word-wrapped text block
ctx.fillStyle = '#334155';
ctx.fillRect(20, 210, 250, 70);
ctx.font = '13px Courier New';
ctx.fillStyle = '#e2e8f0';
ctx.textBaseline = 'top';
ctx.textAlign = 'left';
wrapText(ctx,
  'Canvas has no automatic text wrapping. measureText() lets you implement it manually.',
  28, 218, 234, 20
);

// Gradient text effect
ctx.font = 'bold 52px Impact';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.strokeStyle = '#020617';
ctx.lineWidth = 8;
ctx.lineJoin = 'round';
ctx.strokeText('CAD', 490, 150);
const grad = ctx.createLinearGradient(450, 110, 530, 190);
grad.addColorStop(0, '#00d4ff');
grad.addColorStop(1, '#e94560');
ctx.fillStyle = grad;
ctx.fillText('CAD', 490, 150);`,
      showPreviewByDefault: true,
      outputHeight: 340,
    },

    {
      type: 'js',
      instruction: `## Challenge: Dimension Annotation

Draw a **dimension line** — the annotation style used in engineering drawings to label distances.

Requirements:
- Draw a horizontal line from \`(80, 200)\` to \`(420, 200)\`
- Draw **arrowheads** pointing inward at each end
- Draw short **extension lines** above each endpoint
- Label the center with \`"340 px"\` in a white background box

This pattern — the dimension line — is one of the most fundamental elements in any CAD interface.`,
      html: `<canvas id="canvas" width="540" height="280"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const x1 = 80, x2 = 420, y = 200;
const arrowSize = 10;

// Draw the dimension line and arrowheads
// ...

// Draw extension lines at each end
// ...

// Draw the centered label "340 px"
// Use measureText to size the background box
// ...
`,
      solutionCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const x1 = 80, x2 = 420, y = 200;
const cx = (x1 + x2) / 2;

// Extension lines
ctx.strokeStyle = '#475569';
ctx.lineWidth = 1;
[[x1, 160, y - 10], [x2, 160, y - 10]].forEach(([x, topY, botY]) => {
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(x, botY + y - 160);
  ctx.stroke();
});

// Main dimension line
ctx.strokeStyle = '#00d4ff';
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(x1, y);
ctx.lineTo(x2, y);
ctx.stroke();

// Arrowheads (inward-pointing)
function arrowhead(x, y, dir) { // dir: 1=right, -1=left
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + dir * 14, y - 5);
  ctx.lineTo(x + dir * 14, y + 5);
  ctx.closePath();
  ctx.fillStyle = '#00d4ff';
  ctx.fill();
}
arrowhead(x1, y, 1);  // left end, pointing right
arrowhead(x2, y, -1); // right end, pointing left

// Label with background box
ctx.font = 'bold 13px Courier New';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
const text = '340 px';
const m = ctx.measureText(text);
const pad = 8, bh = 22;
ctx.fillStyle = '#fff';
ctx.beginPath();
ctx.roundRect(cx - m.width / 2 - pad, y - bh / 2, m.width + pad * 2, bh, 4);
ctx.fill();
ctx.fillStyle = '#0f172a';
ctx.fillText(text, cx, y);`,
      showPreviewByDefault: false,
      outputHeight: 320,
      type: 'challenge',
      check: (js) => {
        return js.includes('measureText') &&
          js.includes('fillText') &&
          js.includes('moveTo') &&
          js.includes('lineTo');
      },
    },
  ],
};

export default {
  id: 'canvas-5-text',
  slug: 'canvas-text',
  chapter: 'canvas.1',
  order: 4,
  title: 'Text on Canvas',
  subtitle: 'font, fillText, strokeText, textAlign, textBaseline, measureText, and word wrapping.',
  tags: ['canvas', 'text', 'font', 'fillText', 'measureText', 'textAlign', 'textBaseline', 'labels'],

  hook: {
    question: 'How do CAD tools draw dimension labels that fit exactly around the text, and how does a map renderer draw thousands of place name labels without overlap?',
    realWorldContext:
      'Canvas text is fully manual — you control font, alignment, baseline, and layout. ' +
      '`measureText` is the key that unlocks everything: it tells you the pixel width of any string before you draw it, ' +
      'letting you size background boxes, center labels, detect overflow, and implement word wrapping. ' +
      'The `textAlign=center` + `textBaseline=middle` combination is essential for any label positioned at a point, ' +
      'and the labelWithBox pattern appears in every professional Canvas application.',
    previewVisualizationId: 'JSNotebook',
    previewVisualizationProps: { lesson: LESSON_CANVAS_5 },
  },

  intuition: {
    prose: [
      '**textAlign** controls horizontal anchoring relative to the x coordinate: `left` (default), `center`, `right`. **textBaseline** controls vertical anchoring relative to y: `alphabetic` (default), `top`, `middle`, `bottom`. For centered labels: use both `center` and `middle`.',
      '**measureText(string).width** gives you the pixel width before drawing. Use it to draw a background rectangle that fits the text exactly. This is the `labelWithBox` pattern — the foundation of every tooltip, annotation, and dimension label.',
      '**Canvas has no text wrapping.** Implement it yourself: split text into words, use `measureText` to check if the next word fits on the current line, and increment y by `lineHeight` when it doesn\'t.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'textAlign = "center" + textBaseline = "middle" is the best anchor for point labels',
        body: 'When you place a label at a point (like a node in a graph or a vertex in a CAD drawing), you want the text centered on that point. Setting both properties lets you pass the exact point coordinates to fillText and have the text center itself there automatically.',
      },
      {
        type: 'warning',
        title: 'measureText only returns width by default — height requires bounding box metrics',
        body: '`metrics.width` is reliable. For height, use `metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent`. The older approach of using `fontSize * 1.2` is an approximation that works for uniform fonts but breaks for mixed text.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Canvas Lesson 5 — Text on Canvas',
        props: { lesson: LESSON_CANVAS_5 },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'You want to draw a label centered exactly on a point at (200, 150). Which settings let you pass (200, 150) directly to fillText?',
      options: [
        'textAlign="left" and textBaseline="alphabetic" — the defaults',
        'textAlign="center" and textBaseline="middle"',
        'textAlign="right" and textBaseline="top"',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What does ctx.measureText("Hello").width return?',
      options: [
        'The pixel width the text will occupy at the current font setting',
        'The character count of the string',
        'The width of one average character in the current font',
      ],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'You call strokeText first, then fillText at the same position. What does the result look like?',
      options: [
        'Only the stroke is visible — fillText overwrites it completely',
        'The fill is on top of the stroke — the outline shows outside the filled area',
        'They cancel each other out, producing nothing',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Canvas has no native text wrapping. To implement word wrapping, what is the key method you need?',
      options: [
        'ctx.wordWrap() — it exists but is not widely documented',
        'ctx.measureText() — to check if the next word fits before adding it to the current line',
        'ctx.splitText() — splits a string at word boundaries automatically',
      ],
      correct: 1,
    },
  ],

  mentalModel: [
    'font = CSS font shorthand string: "bold 16px Courier New". Set it before every fillText call.',
    'textAlign (left/center/right) + textBaseline (top/middle/alphabetic/bottom) control the anchor point.',
    'For point labels: textAlign="center" + textBaseline="middle" — the coordinates ARE the center.',
    'measureText(string).width gives pixel width at current font — use it before drawing to size background boxes.',
    'strokeText first, then fillText on top = outlined text. Stroke sets the border; fill sets the interior.',
    'Canvas has no word wrap — implement it with measureText: test each word, break when width > maxWidth.',
  ],

  checkpoints: ['read-intuition'],
};

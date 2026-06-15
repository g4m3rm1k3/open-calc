const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #1a1a2e;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-family: 'Courier New', monospace;
  }
  canvas { display: block; background: #16213e; border: 1px solid #0f3460; border-radius: 4px; }
`;

const LESSON_CANVAS_7 = {
  title: 'Compositing, Clipping, and Shadows',
  subtitle: 'Control how drawing layers combine, restrict draw regions, and add depth with light.',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `## How Drawing Layers Combine: globalCompositeOperation

Every time you draw something on a canvas, you're drawing on top of pixels that already exist. **\`globalCompositeOperation\`** controls exactly what happens when new pixels meet existing ones — by default it's \`source-over\` (paint on top), but there are 26 modes.

### The most important operations

| Operation | Effect |
|---|---|
| \`source-over\` | Default. New drawing appears on top |
| \`destination-over\` | New drawing appears **behind** existing pixels |
| \`source-in\` | Show new drawing only where existing pixels exist |
| \`source-out\` | Show new drawing only where existing pixels are transparent |
| \`destination-out\` | **Erase** existing pixels wherever new drawing is placed |
| \`copy\` | Replace everything with the new drawing |
| \`xor\` | Exclusive-OR of both |

### Photoshop-style blend modes

These work like layer blend modes and can produce stunning visual effects:

\`\`\`javascript
ctx.globalCompositeOperation = 'multiply';    // darken (multiply color values)
ctx.globalCompositeOperation = 'screen';      // lighten (inverse multiply)
ctx.globalCompositeOperation = 'overlay';     // high contrast
ctx.globalCompositeOperation = 'difference';  // inverted difference — great for neon effects
ctx.globalCompositeOperation = 'lighten';     // keep the lighter pixel
ctx.globalCompositeOperation = 'darken';      // keep the darker pixel
\`\`\`

### The eraser pattern: destination-out

\`clearRect\` only clears rectangles. To erase an arbitrary shape — a circle, a star, anything — use \`destination-out\`:

\`\`\`javascript
// 1. Draw something
ctx.fillStyle = '#e94560';
ctx.fillRect(0, 0, 400, 300);

// 2. Punch a circular hole
ctx.globalCompositeOperation = 'destination-out';
ctx.beginPath();
ctx.arc(200, 150, 80, 0, Math.PI * 2);
ctx.fill();

// 3. ALWAYS reset afterward — it affects all future drawing!
ctx.globalCompositeOperation = 'source-over';
\`\`\`

### globalAlpha: universal opacity

\`globalAlpha\` multiplies the opacity of everything drawn while it's active:

\`\`\`javascript
ctx.save();
ctx.globalAlpha = 0.3;
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height); // dim overlay
ctx.restore(); // resets globalAlpha
\`\`\``,
    },

    {
      type: 'js',
      instruction: `## Compositing Operations Live Demo

This demo renders all the key blend modes side by side. Each panel draws an orange rectangle first, then draws a cyan circle on top with a different composite mode — so you can see exactly how each one combines the two layers. Notice how **\`destination-out\`** punches a transparent hole, while **\`multiply\`** and **\`screen\`** act like Photoshop layer modes.`,
      html: `<canvas id="canvas" width="720" height="480"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const modes = [
  'source-over', 'destination-over', 'source-in', 'source-out',
  'destination-in', 'destination-out', 'xor', 'copy',
  'multiply', 'screen', 'overlay', 'difference',
];

const cols = 4, rows = 3;
const pw = canvas.width / cols, ph = canvas.height / rows;

modes.forEach((mode, i) => {
  const col = i % cols, row = Math.floor(i / cols);
  const ox = col * pw, oy = row * ph;

  ctx.save();
  ctx.translate(ox, oy);

  // Background for this cell
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, pw, ph);

  // Clip to cell
  ctx.beginPath();
  ctx.rect(2, 2, pw - 4, ph - 4);
  ctx.clip();

  // Orange rectangle (destination layer)
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#e9813a';
  ctx.fillRect(pw * 0.1, ph * 0.2, pw * 0.5, ph * 0.5);

  // Cyan circle with this mode (source layer)
  ctx.globalCompositeOperation = mode;
  ctx.fillStyle = '#00d4ff';
  ctx.beginPath();
  ctx.arc(pw * 0.5, ph * 0.5, ph * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Reset and draw label
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, ph - 22, pw, 22);
  ctx.fillStyle = '#aaa';
  ctx.font = '11px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(mode, pw / 2, ph - 7);

  ctx.restore();
});

// Grid lines
ctx.strokeStyle = '#0f3460';
ctx.lineWidth = 1;
for (let c = 1; c < cols; c++) {
  ctx.beginPath(); ctx.moveTo(c * pw, 0); ctx.lineTo(c * pw, canvas.height); ctx.stroke();
}
for (let r = 1; r < rows; r++) {
  ctx.beginPath(); ctx.moveTo(0, r * ph); ctx.lineTo(canvas.width, r * ph); ctx.stroke();
}`,
      showPreviewByDefault: true,
      outputHeight: 500,
    },

    {
      type: 'markdown',
      instruction: `## Clipping Regions

**Clipping** restricts all subsequent drawing to a specific region. Anything drawn outside the clip is invisible — it is never rendered, not painted over.

### The basic pattern

\`\`\`javascript
ctx.save();               // save state — this is mandatory
  ctx.beginPath();
  ctx.arc(200, 200, 150, 0, Math.PI * 2);
  ctx.clip();             // all drawing is now clipped to this circle

  ctx.fillStyle = '#e94560';
  ctx.fillRect(0, 0, 400, 400); // only the circular portion is visible
ctx.restore();            // clipping is removed — back to full canvas
\`\`\`

**Critical rule**: You must \`save()\` before clipping and \`restore()\` to remove the clip. There is no \`unclip()\`. The restore call discards the clipping region along with all other saved state.

### Practical: Rounded image corners

The most common real-world use of clipping is drawing images with rounded corners — since \`drawImage\` always draws a rectangle, you clip to a rounded rect path first:

\`\`\`javascript
function drawRoundedImage(ctx, img, x, y, w, h, r) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}
\`\`\`

### Clipping with compositing

These two tools complement each other: clipping restricts **where** you draw; compositing controls **how** pixels combine where you do draw. In complex UIs you often need both.`,
    },

    {
      type: 'js',
      instruction: `## Clipping Demo: Text Inside a Shape

This demo clips text and gradient patterns to various shapes — a circle, a star, and a diamond — showing how any arbitrary path can act as a mask. All three use the \`save() → beginPath → clip() → draw → restore()\` pattern.`,
      html: `<canvas id="canvas" width="700" height="300"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function star(ctx, cx, cy, r, ir, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? r : ir;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function fillWithText(ctx, text, color, bgColor) {
  ctx.fillStyle = bgColor;
  ctx.fillRect(-500, -500, 1000, 1000);
  ctx.fillStyle = color;
  ctx.font = 'bold 14px Courier New';
  ctx.textAlign = 'center';
  for (let row = -10; row < 10; row++) {
    ctx.fillText(text, 0, row * 22);
  }
}

// Panel 1: Circle clip
ctx.save();
ctx.translate(120, 150);
ctx.beginPath();
ctx.arc(0, 0, 100, 0, Math.PI * 2);
ctx.clip();
const g1 = ctx.createLinearGradient(-100, -100, 100, 100);
g1.addColorStop(0, '#e94560');
g1.addColorStop(1, '#9b59b6');
ctx.fillStyle = g1;
ctx.fillRect(-110, -110, 220, 220);
fillWithText(ctx, 'CANVAS', 'rgba(255,255,255,0.15)', 'transparent');
ctx.restore();

// Circle border
ctx.save();
ctx.translate(120, 150);
ctx.beginPath();
ctx.arc(0, 0, 100, 0, Math.PI * 2);
ctx.strokeStyle = '#e94560';
ctx.lineWidth = 3;
ctx.stroke();
ctx.restore();

// Panel 2: Star clip
ctx.save();
ctx.translate(360, 150);
star(ctx, 0, 0, 120, 55, 5);
ctx.clip();
const g2 = ctx.createLinearGradient(-120, -120, 120, 120);
g2.addColorStop(0, '#ffd700');
g2.addColorStop(1, '#e9813a');
ctx.fillStyle = g2;
ctx.fillRect(-130, -130, 260, 260);
fillWithText(ctx, 'CLIP', 'rgba(0,0,0,0.2)', 'transparent');
ctx.restore();

star(ctx, 360, 150, 120, 55, 5);
ctx.strokeStyle = '#ffd700';
ctx.lineWidth = 3;
ctx.stroke();

// Panel 3: Diamond clip
ctx.save();
ctx.translate(590, 150);
ctx.beginPath();
ctx.moveTo(0, -110);
ctx.lineTo(100, 0);
ctx.lineTo(0, 110);
ctx.lineTo(-100, 0);
ctx.closePath();
ctx.clip();
const g3 = ctx.createLinearGradient(-100, -110, 100, 110);
g3.addColorStop(0, '#00d4ff');
g3.addColorStop(1, '#4ade80');
ctx.fillStyle = g3;
ctx.fillRect(-110, -120, 220, 240);
fillWithText(ctx, 'MASK', 'rgba(0,0,0,0.2)', 'transparent');
ctx.restore();

ctx.beginPath();
ctx.moveTo(590, 40);
ctx.lineTo(690, 150);
ctx.lineTo(590, 260);
ctx.lineTo(490, 150);
ctx.closePath();
ctx.strokeStyle = '#00d4ff';
ctx.lineWidth = 3;
ctx.stroke();

// Labels
ctx.fillStyle = '#666';
ctx.font = '12px Courier New';
ctx.textAlign = 'center';
ctx.fillText('arc clip', 120, 280);
ctx.fillText('star clip', 360, 280);
ctx.fillText('polygon clip', 590, 280);`,
      showPreviewByDefault: true,
      outputHeight: 340,
    },

    {
      type: 'markdown',
      instruction: `## Shadows and Glow Effects

Canvas supports CSS-style drop shadows on any drawn content — rectangles, paths, text, images.

### The four shadow properties

\`\`\`javascript
ctx.shadowColor   = 'rgba(0, 0, 0, 0.5)'; // shadow color — must be non-transparent to show
ctx.shadowBlur    = 15;                     // blur radius in pixels
ctx.shadowOffsetX = 5;                      // horizontal offset (positive = right)
ctx.shadowOffsetY = 5;                      // vertical offset (positive = down)
\`\`\`

After drawing with a shadow, clear it or it will affect everything else:

\`\`\`javascript
// After drawing
ctx.shadowColor = 'transparent';  // or
ctx.shadowBlur = 0;
\`\`\`

**Performance note**: Shadows are GPU-intensive. Never leave them active inside a fast animation loop. Apply the shadow, draw, clear it immediately.

### Glow effect (zero-offset shadow)

Setting offset to zero and using a bright color creates a neon glow effect:

\`\`\`javascript
ctx.shadowColor  = '#00d4ff';  // glow color
ctx.shadowBlur   = 30;         // spread
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;

ctx.strokeStyle = '#00d4ff';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(200, 200, 80, 0, Math.PI * 2);
ctx.stroke();  // draws circle with cyan glow

ctx.shadowColor = 'transparent'; // clear
\`\`\`

### imageSmoothingEnabled

Controls how images are scaled:

\`\`\`javascript
ctx.imageSmoothingEnabled = true;   // bilinear filtering (smooth, blurry)
ctx.imageSmoothingEnabled = false;  // nearest-neighbor (pixelated — great for pixel art)
ctx.imageSmoothingQuality = 'high'; // 'low' | 'medium' | 'high'
\`\`\``,
    },

    {
      type: 'js',
      instruction: `## Shadows and Glow Demo

This demo shows drop shadows on text and shapes, glow effects using zero-offset shadows, layered glow for neon intensity, and the \`destination-out\` eraser composited with shadows for a spotlight-style reveal effect.`,
      html: `<canvas id="canvas" width="700" height="420"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#020617';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// --- 1. Drop shadow on text ---
ctx.save();
ctx.shadowColor = 'rgba(0,0,0,0.8)';
ctx.shadowBlur = 12;
ctx.shadowOffsetX = 4;
ctx.shadowOffsetY = 4;
ctx.fillStyle = '#fff';
ctx.font = 'bold 42px Courier New';
ctx.textAlign = 'center';
ctx.fillText('Shadow Text', 175, 80);
ctx.restore();

ctx.fillStyle = '#555';
ctx.font = '12px Courier New';
ctx.textAlign = 'center';
ctx.fillText('shadowOffset + shadowBlur', 175, 105);

// --- 2. Layered neon glow on arc ---
ctx.save();
// Outer glow (wide, faint)
ctx.shadowColor = '#e94560';
ctx.shadowBlur = 40;
ctx.strokeStyle = '#e94560';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(175, 230, 70, 0, Math.PI * 2);
ctx.stroke();
// Inner glow (tight, bright)
ctx.shadowBlur = 10;
ctx.lineWidth = 3;
ctx.beginPath();
ctx.arc(175, 230, 70, 0, Math.PI * 2);
ctx.stroke();
ctx.restore();

ctx.fillStyle = '#555';
ctx.font = '12px Courier New';
ctx.textAlign = 'center';
ctx.fillText('layered glow', 175, 325);

// --- 3. Neon grid lines ---
ctx.save();
ctx.shadowColor = '#00d4ff';
ctx.shadowBlur = 8;
ctx.strokeStyle = '#00d4ff';
ctx.lineWidth = 1;
for (let y = 150; y <= 380; y += 30) {
  ctx.beginPath();
  ctx.moveTo(310, y);
  ctx.lineTo(520, y);
  ctx.stroke();
}
for (let x = 310; x <= 520; x += 30) {
  ctx.beginPath();
  ctx.moveTo(x, 150);
  ctx.lineTo(x, 380);
  ctx.stroke();
}
ctx.restore();

ctx.fillStyle = '#555';
ctx.font = '12px Courier New';
ctx.textAlign = 'center';
ctx.fillText('neon grid (glow on lines)', 415, 405);

// --- 4. Spotlight with destination-out ---
ctx.save();
// Dark overlay
ctx.fillStyle = 'rgba(0,0,0,0.82)';
ctx.fillRect(560, 140, 130, 260);
// Spotlight circle
ctx.globalCompositeOperation = 'destination-out';
const spotlight = ctx.createRadialGradient(625, 270, 0, 625, 270, 80);
spotlight.addColorStop(0, 'rgba(0,0,0,1)');
spotlight.addColorStop(0.5, 'rgba(0,0,0,0.6)');
spotlight.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = spotlight;
ctx.beginPath();
ctx.arc(625, 270, 80, 0, Math.PI * 2);
ctx.fill();
ctx.restore();

// Content behind the spotlight
ctx.save();
ctx.shadowColor = '#ffd700';
ctx.shadowBlur = 20;
ctx.fillStyle = '#ffd700';
ctx.font = 'bold 28px Courier New';
ctx.textAlign = 'center';
ctx.fillText('★', 625, 280);
ctx.restore();

ctx.fillStyle = '#555';
ctx.font = '12px Courier New';
ctx.textAlign = 'center';
ctx.fillText('spotlight (destination-out)', 625, 415);`,
      showPreviewByDefault: true,
      outputHeight: 460,
    },

    {
      type: 'challenge',
      instruction: `## Challenge: Frosted Glass Card

Build a "frosted glass" card effect using what you've learned in this lesson.

**Your card must:**
1. Draw a colorful background (gradients, shapes, anything vivid)
2. Draw a rounded rectangle card region on top
3. Clip all content inside the card to that rounded rect
4. Inside the card: semi-transparent white fill (\`rgba(255,255,255,0.15)\`) for the frost effect
5. Add a glow or shadow border around the card using shadows
6. Display some text inside the card (title + subtitle lines)

**Hint — rounded rect clip:**
\`\`\`javascript
function roundedClip(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
  ctx.clip();
}
\`\`\``,
      html: `<canvas id="canvas" width="600" height="400"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// TODO: Draw a vivid background

// TODO: Draw a frosted glass card with:
//   - rounded clip region
//   - semi-transparent white fill inside
//   - shadow/glow on the card border
//   - text content inside`,
      solutionCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Vivid background
const bg = ctx.createLinearGradient(0, 0, 600, 400);
bg.addColorStop(0, '#e94560');
bg.addColorStop(0.5, '#9b59b6');
bg.addColorStop(1, '#00d4ff');
ctx.fillStyle = bg;
ctx.fillRect(0, 0, 600, 400);

// Some background circles for depth
[{x:80,y:80,r:60},{x:520,y:320,r:90},{x:300,y:380,r:50}].forEach(c => {
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
});

// Card dimensions
const cx = 100, cy = 80, cw = 400, ch = 240, cr = 20;

// Shadow/glow on card
ctx.save();
ctx.shadowColor = 'rgba(0,0,0,0.5)';
ctx.shadowBlur = 40;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 10;

// Draw frosted card with clip
ctx.save();
ctx.beginPath();
ctx.moveTo(cx + cr, cy);
ctx.arcTo(cx + cw, cy,     cx + cw, cy + ch, cr);
ctx.arcTo(cx + cw, cy + ch, cx,     cy + ch, cr);
ctx.arcTo(cx,      cy + ch, cx,     cy,      cr);
ctx.arcTo(cx,      cy,      cx + cw, cy,     cr);
ctx.closePath();
ctx.clip();

// Frost fill
ctx.fillStyle = 'rgba(255,255,255,0.15)';
ctx.fillRect(cx, cy, cw, ch);

// Top bar
ctx.fillStyle = 'rgba(255,255,255,0.1)';
ctx.fillRect(cx, cy, cw, 50);

ctx.restore(); // remove clip
ctx.restore(); // remove shadow

// Card border with glow
ctx.save();
ctx.shadowColor = 'rgba(255,255,255,0.6)';
ctx.shadowBlur = 15;
ctx.beginPath();
ctx.moveTo(cx + cr, cy);
ctx.arcTo(cx + cw, cy,     cx + cw, cy + ch, cr);
ctx.arcTo(cx + cw, cy + ch, cx,     cy + ch, cr);
ctx.arcTo(cx,      cy + ch, cx,     cy,      cr);
ctx.arcTo(cx,      cy,      cx + cw, cy,     cr);
ctx.closePath();
ctx.strokeStyle = 'rgba(255,255,255,0.5)';
ctx.lineWidth = 1.5;
ctx.stroke();
ctx.restore();

// Text content
ctx.fillStyle = '#fff';
ctx.font = 'bold 22px Courier New';
ctx.textAlign = 'left';
ctx.fillText('Frosted Glass Card', cx + 24, cy + 32);

ctx.fillStyle = 'rgba(255,255,255,0.8)';
ctx.font = '14px Courier New';
ctx.fillText('Using clip() + globalAlpha + shadowBlur', cx + 24, cy + 90);
ctx.fillText('Any path can become a clipping mask.', cx + 24, cy + 115);
ctx.fillText('Shadows bake into the composited result.', cx + 24, cy + 140);

ctx.fillStyle = 'rgba(255,255,255,0.4)';
ctx.font = '12px Courier New';
ctx.fillText('destination-out • clip() • globalCompositeOperation', cx + 24, cy + 200);`,
      showPreviewByDefault: true,
      outputHeight: 440,
      check: (js) => {
        return (
          js.includes('clip()') &&
          js.includes('shadow') &&
          (js.includes('globalAlpha') || js.includes('rgba')) &&
          js.includes('fillText')
        );
      },
    },
  ],
};

const lesson7 = {
  id: 'canvas-1-7',
  slug: 'compositing-clipping-shadows',
  chapter: 'canvas.1',
  order: 7,
  title: 'Compositing, Clipping & Shadows',
  subtitle: 'Layer blend modes, clip masks, and glow effects.',
  tags: ['canvas', 'compositing', 'clipping', 'shadows', 'glow'],
  hook: 'How do you punch a hole in a canvas drawing, mask content to a star shape, or make text glow like neon? None of those use paint — they use math on pixel alpha values.',
  intuition: {
    text: 'Compositing controls how new pixels combine with existing ones. Clipping restricts where drawing is allowed. Shadows add light-physics depth. All three let you do things that paint commands alone cannot.',
    visualizations: [
      {
        id: 'JSNotebook',
        props: { lesson: LESSON_CANVAS_7 },
      },
    ],
  },
  quiz: [
    {
      question: 'Which composite operation erases existing pixels wherever new drawing is placed?',
      options: ['source-out', 'destination-out', 'xor', 'destination-in'],
      answer: 1,
    },
    {
      question: 'After setting ctx.clip(), how do you remove the clipping region?',
      options: [
        'Call ctx.unclip()',
        'Call ctx.resetClip()',
        'Call ctx.restore() after previously calling ctx.save()',
        'Set ctx.clip to null',
      ],
      answer: 2,
    },
    {
      question: 'What is the visual result of setting shadowOffsetX and shadowOffsetY both to 0 with a bright shadowColor?',
      options: [
        'No shadow appears',
        'A drop shadow appears below the shape',
        'A glow effect surrounds the shape equally on all sides',
        'The shape is outlined in the shadow color',
      ],
      answer: 2,
    },
    {
      question: 'globalAlpha = 0.5 makes the canvas',
      options: [
        'Half the size',
        'All subsequent drawing 50% transparent',
        'Existing pixels fade to 50%',
        'Switches to grayscale mode',
      ],
      answer: 1,
    },
  ],
  mentalModel: [`Think of the canvas as a stack of acetate sheets on an overhead projector. \`globalCompositeOperation\` is the instruction for what to do where two sheets overlap — copy one, punch through it, multiply the colors. \`clip()\` is a physical mask cut from one sheet — anything outside the cutout is blocked. \`shadowBlur\` is the projector lamp leaking light around the edge of a shape. None of these change pixels directly; they change the rules by which pixels are computed.`],
};

export default lesson7;

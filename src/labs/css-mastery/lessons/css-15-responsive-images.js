export const lesson = {
  series: { id: 'css-mastery', title: 'CSS 0 to Mastery' },
  id: 'css-15-responsive-images',
  title: '15. Responsive Images',
  chapter: 'css-ch3',
  language: 'web',
  checkpoints: [
    { id: 'cp-object-fit', label: 'object-fit' },
    { id: 'cp-responsive-images', label: 'Responsive Images' },
  ],
  segments: [
    {
      type: 'narration',
      id: 'intro',
      defaultTab: 'css',
      text: "You add an image to a card. Without any CSS the image displays at its natural size and overflows the card. You set `width: 100%; height: 200px` — now the image fills the card but squashes or stretches to fit. Images are replaced elements with an intrinsic size — they need special handling to behave like other layout elements.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="cards">
  <div class="card">
    <!-- Simulate a landscape photo with a gradient box -->
    <div class="img-broken">Landscape image here</div>
    <div class="card-body">
      <h3>No sizing rules</h3>
      <p>The image overflows or uses its natural dimensions — no relationship to the card.</p>
    </div>
  </div>
  <div class="card">
    <div class="img-squashed">Squashed portrait</div>
    <div class="card-body">
      <h3>width: 100%; height: 200px</h3>
      <p>Fixed height plus 100% width distorts the image's aspect ratio.</p>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.cards {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.card {
  flex: 1;
  min-width: 240px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  overflow: hidden;
}

/* No sizing rules — uses natural dimensions */
.img-broken {
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
  width: 400px; /* simulates an image wider than the card */
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.7);
}

/* Forced dimensions — distorts aspect ratio */
.img-squashed {
  background: linear-gradient(135deg, #be185d, #7c3aed);
  width: 100%;
  height: 200px;
  /* A portrait image forced to landscape dimensions = distorted */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.7);
}

.card-body { padding: 16px; }
h3 { font-size: 1rem; margin-bottom: 8px; }
p { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'object-fit-cover',
      defaultTab: 'css',
      text: "`object-fit: cover` fills the container while maintaining the image's natural aspect ratio — cropping the image if needed. The image is never distorted. This is the correct rule for almost all card images: you define the container size and the image fills it perfectly, cropping to fit.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="cards">
  <div class="card">
    <div class="img-cover">object-fit: cover</div>
    <div class="card-body">
      <h3>Landscape Image</h3>
      <p>The image fills the container. No distortion. Cropped to fit.</p>
    </div>
  </div>
  <div class="card">
    <div class="img-cover portrait">object-fit: cover (portrait)</div>
    <div class="card-body">
      <h3>Portrait Image</h3>
      <p>Same rule, different source image. Always fills without distortion.</p>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.cards {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.card {
  flex: 1;
  min-width: 240px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  overflow: hidden;
}

.img-cover {
  width: 100%;
  height: 200px;
  object-fit: cover; /* fills container, crops to fit, never distorts */
  background: linear-gradient(135deg, #1d4ed8 0%, #7c3aed 50%, #0891b2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.8);
  font-weight: 600;
}

.img-cover.portrait {
  background: linear-gradient(180deg, #be185d 0%, #7c3aed 100%);
}

.card-body { padding: 16px; }
h3 { font-size: 1rem; margin-bottom: 8px; }
p { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'object-fit-contain',
      defaultTab: 'css',
      text: "`object-fit: contain` makes the entire image visible within the container, maintaining aspect ratio. If the image's aspect ratio doesn't match the container, the container's background shows through on the sides (letterboxing) or top/bottom (pillarboxing). Good for logos, icons, and product images that must not be cropped.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="cards">
  <div class="card">
    <div class="img-contain landscape">contain — landscape</div>
    <div class="card-body"><h3>Logo / Icon</h3><p>Entire image visible. Background fills the sides.</p></div>
  </div>
  <div class="card">
    <div class="img-contain tall">contain — tall</div>
    <div class="card-body"><h3>Product Photo</h3><p>Full product visible. Nothing cropped.</p></div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.cards { display: flex; gap: 16px; flex-wrap: wrap; }

.card {
  flex: 1;
  min-width: 240px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  overflow: hidden;
}

.img-contain {
  width: 100%;
  height: 200px;
  object-fit: contain; /* entire image visible — no cropping */
  background-color: #0f172a; /* the background shows where the image doesn't fill */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.8);
  font-weight: 600;
}

.img-contain.landscape {
  /* Simulates a wide logo in a square container — pilllarboxed on sides */
  background-image: linear-gradient(90deg, transparent 15%, #1d4ed8 15%, #1d4ed8 85%, transparent 85%);
}

.img-contain.tall {
  /* Simulates a tall product image in a wide container — letterboxed top/bottom */
  background-image: linear-gradient(180deg, transparent 10%, #7c3aed 10%, #7c3aed 90%, transparent 90%);
}

.card-body { padding: 16px; }
h3 { font-size: 1rem; margin-bottom: 8px; }
p { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'object-fit-fill',
      defaultTab: 'css',
      text: "`object-fit: fill` is the default behavior: stretch the image to fill the container dimensions completely, ignoring the natural aspect ratio. This causes distortion. `object-fit: none` renders the image at its natural size with no resizing — it may overflow or underflow the container. Neither is usually the right choice.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="compare">
  <div class="item">
    <div class="img fill">fill (default)</div>
    <p>Stretched to fit — aspect ratio ignored. Distorted.</p>
  </div>
  <div class="item">
    <div class="img cover">cover ✓</div>
    <p>Fills container, maintains ratio, crops if needed.</p>
  </div>
  <div class="item">
    <div class="img contain-demo">contain ✓</div>
    <p>Entire image visible, may letterbox.</p>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.compare {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.item {
  flex: 1;
  min-width: 160px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  overflow: hidden;
}

.img {
  width: 100%;
  height: 160px;
  /* gradient simulates a 16:9 landscape image in a square container */
  background: linear-gradient(135deg, #1d4ed8 0%, #0891b2 50%, #10b981 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  color: white;
}

/* object-fit: fill is the default — shown here explicitly */
.fill { object-fit: fill; transform: scaleY(1.5); /* exaggerate the distortion */ }
.cover { object-fit: cover; }
.contain-demo {
  object-fit: contain;
  background-color: #0f172a;
  background-image: linear-gradient(90deg, transparent 10%, #1d4ed8 10%, #10b981 90%, transparent 90%);
}

p { padding: 12px; font-size: 0.8rem; color: #94a3b8; line-height: 1.4; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'object-position',
      defaultTab: 'css',
      text: "`object-position` controls where a `cover` or `contain` image is positioned within its container. The default is `50% 50%` (centered). `object-position: top` anchors the top of the image so faces are never cropped. `object-position: 30% 20%` positions the focal point of the image — useful when you know where the important content lives.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="cards">
  <div class="card">
    <div class="img pos-center">center (default)</div>
    <div class="card-body"><h3>object-position: center</h3></div>
  </div>
  <div class="card">
    <div class="img pos-top">top</div>
    <div class="card-body"><h3>object-position: top</h3></div>
  </div>
  <div class="card">
    <div class="img pos-custom">30% 20%</div>
    <div class="card-body"><h3>object-position: 30% 20%</h3></div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.cards { display: flex; gap: 12px; flex-wrap: wrap; }

.card {
  flex: 1;
  min-width: 180px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  overflow: hidden;
}

.img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  /* Gradient with a clear top/bottom visual difference */
  background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 20%, #1d4ed8 60%, #0f172a 100%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
}

.pos-center { object-position: center; }
.pos-top    { object-position: top; }        /* shows the yellow top portion */
.pos-custom { object-position: 30% 20%; }

.card-body { padding: 12px 16px 16px; }
h3 { font-size: 0.85rem; color: #94a3b8; font-family: monospace; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'aspect-ratio',
      defaultTab: 'css',
      text: "`aspect-ratio: 16 / 9` on a container maintains a 16:9 ratio as the width changes. Set the width (or let it fill its parent) and the height adjusts automatically. This replaces the old `padding-top: 56.25%` hack for maintaining video embed ratios. Works for any ratio: `4/3`, `1/1`, `3/2`.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="examples">
  <div>
    <p class="label">aspect-ratio: 16 / 9</p>
    <div class="box ratio-16-9">
      <div class="img-fill">Video / Wide Photo</div>
    </div>
  </div>
  <div>
    <p class="label">aspect-ratio: 1 / 1</p>
    <div class="box ratio-1-1">
      <div class="img-fill">Square / Avatar</div>
    </div>
  </div>
  <div>
    <p class="label">aspect-ratio: 3 / 2</p>
    <div class="box ratio-3-2">
      <div class="img-fill">Card Image</div>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.examples {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 500px;
}

.label {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 8px;
  font-family: monospace;
}

.box {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #334155;
  background: #1e293b;
}

/* aspect-ratio: the height is calculated automatically from the width */
.ratio-16-9 { aspect-ratio: 16 / 9; }
.ratio-1-1  { aspect-ratio: 1 / 1; }
.ratio-3-2  { aspect-ratio: 3 / 2; }

.img-fill {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: linear-gradient(135deg, #1d4ed8, #7c3aed, #be185d);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  font-size: 0.9rem;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'max-width-img',
      defaultTab: 'css',
      text: "The standard reset every CSS file needs: `img { max-width: 100%; height: auto; }`. An image is never wider than its container (max-width: 100%). And `height: auto` preserves the aspect ratio as the width changes. Without this, a 1200px wide image in a 400px container will overflow 800px to the right.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="demo">
  <h3>Without the reset:</h3>
  <div class="container-narrow broken">
    <!-- Simulates a wide image with no reset — overflows -->
    <div class="wide-img">⟵ 800px wide image in a 300px container — overflow!</div>
  </div>

  <h3>With max-width: 100%; height: auto:</h3>
  <div class="container-narrow">
    <div class="fixed-img">Image constrained to container width. Aspect ratio preserved.</div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
}

h3 { font-size: 0.85rem; color: #94a3b8; }

.container-narrow {
  width: 300px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  overflow: hidden;
}

.broken { overflow: visible; border-color: #ef4444; }

/* No reset — simulates a wide image overflowing its container */
.wide-img {
  width: 800px; /* wider than the container */
  height: 80px;
  background: linear-gradient(90deg, #ef4444, #dc2626);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: white;
  padding: 0 16px;
}

/* The standard reset — max-width: 100% + height: auto */
.fixed-img {
  max-width: 100%; /* never wider than container */
  height: auto;    /* maintain natural aspect ratio */
  /* simulating a 16:9 image */
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: white;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'background-image',
      defaultTab: 'css',
      text: "Background images are handled differently from `<img>` tags. `background-size: cover` fills the container, `background-size: contain` fits entirely. `background-position: center` centers the image. Important: background images have no `alt` attribute — they're invisible to screen readers. Use `<img>` for meaningful images, background images only for decoration.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="cards">
  <div class="card bg-cover">
    <div class="card-content">
      <h3>background-size: cover</h3>
      <p>Fills the container, crops to fit.</p>
    </div>
  </div>
  <div class="card bg-contain">
    <div class="card-content">
      <h3>background-size: contain</h3>
      <p>Entire image visible, may repeat or letterbox.</p>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.cards { display: flex; gap: 16px; flex-wrap: wrap; }

.card {
  flex: 1;
  min-width: 240px;
  min-height: 200px;
  border-radius: 12px;
  border: 1px solid #334155;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  /* Shared background image (simulated with gradient) */
  background-image: linear-gradient(135deg, #1d4ed8 0%, #7c3aed 40%, #be185d 70%, #f59e0b 100%);
  background-color: #0f172a;
}

.bg-cover {
  background-size: cover;       /* fills — crops if needed */
  background-position: center;
}

.bg-contain {
  background-size: 60% auto;    /* contain equivalent — fits entirely, background-color fills rest */
  background-position: center;
  background-repeat: no-repeat;
}

.card-content {
  background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
  padding: 24px 20px 20px;
  width: 100%;
}

h3 { font-size: 1rem; margin-bottom: 4px; font-family: monospace; }
p { font-size: 0.85rem; color: #94a3b8; }`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'picture-element',
      defaultTab: 'css',
      text: "The `<picture>` element lets you provide different image sources for different screen sizes. The browser picks the most appropriate source and loads only that one. This is the only responsive behavior that belongs in HTML rather than CSS — because CSS cannot control which image file is downloaded. Smaller screens get a smaller file; large screens get the full-resolution image.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="article">
  <h2>The picture Element</h2>

  <!-- picture picks the right source based on viewport -->
  <picture>
    <!-- Large screens: use this source -->
    <source media="(min-width: 800px)"
            srcset="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Crect fill='%231d4ed8' width='800' height='400'/%3E%3Ctext x='400' y='200' text-anchor='middle' fill='white' font-size='24' font-family='sans-serif' dominant-baseline='middle'%3EFull Resolution (800px wide)%3C/text%3E%3C/svg%3E">
    <!-- Small screens: use this source (smaller file) -->
    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%237c3aed' width='400' height='300'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='white' font-size='20' font-family='sans-serif' dominant-baseline='middle'%3EMobile Version (400px)%3C/text%3E%3C/svg%3E"
         alt="A responsive image that loads a smaller file on mobile"
         width="800" height="400">
  </picture>

  <p>Resize the preview: below 800px the purple mobile version loads. Above 800px the blue full version loads. Only one file is downloaded.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.article {
  max-width: 900px;
  margin: 0 auto;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

/* The standard responsive image reset */
picture img {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: 10px;
  margin-bottom: 20px;
}

p {
  font-size: 0.95rem;
  color: #94a3b8;
  line-height: 1.6;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 16px;
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-object-fit'
    },
    {
      type: 'narration',
      id: 'lazy-loading',
      defaultTab: 'css',
      text: "`<img loading='lazy'>` defers loading images until they are near the viewport. No JavaScript. No library. One HTML attribute. Images below the fold don't block page load and don't consume bandwidth until the user scrolls near them. Critical images above the fold should use `loading='eager'` (the default) to load immediately.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="page">
  <h2>Image Loading Strategies</h2>

  <!-- Above the fold: load immediately (default behavior) -->
  <figure>
    <div class="placeholder eager">Above the fold — loads immediately (default)</div>
    <figcaption>loading="eager" (or omitted) — downloads with the page</figcaption>
  </figure>

  <div class="spacer">↓ Scroll down to see lazy-loaded images</div>

  <!-- Below the fold: defer until near viewport -->
  <figure>
    <div class="placeholder lazy">Below the fold — loading="lazy"</div>
    <figcaption>loading="lazy" — only downloads when user scrolls near it</figcaption>
  </figure>
  <figure>
    <div class="placeholder lazy">Another lazy image</div>
    <figcaption>loading="lazy" — saves bandwidth on image-heavy pages</figcaption>
  </figure>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.page { max-width: 600px; margin: 0 auto; }
h2 { font-size: 1.5rem; margin-bottom: 24px; }

figure {
  margin-bottom: 24px;
}

.placeholder {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.eager {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.lazy {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

figcaption {
  font-size: 0.8rem;
  color: #64748b;
  font-family: monospace;
}

.spacer {
  text-align: center;
  color: #334155;
  padding: 40px 0;
  font-size: 1.5rem;
  letter-spacing: 0.1em;
}`,
        js: ''
      }
    },
    {
      type: 'narration',
      id: 'intrinsic-sizing',
      defaultTab: 'css',
      text: "Add explicit `width` and `height` attributes to every `<img>` tag — even when CSS overrides them. The browser uses these attributes to reserve space before the image downloads, preventing Cumulative Layout Shift (CLS). CLS is the jarring jump when an image loads and pushes content down. The CSS `height: auto` override still applies — the attributes are only for layout reservation.",
      files: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="article">
  <h2>Preventing Layout Shift</h2>
  <p>The first image has no width/height attributes. The browser doesn't know how tall it is before it loads — content below may shift. The second has correct attributes — space is reserved.</p>

  <!-- No attributes: browser can't reserve space -->
  <img class="demo-img shift"
       src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='300'%3E%3Crect fill='%23ef4444' width='600' height='300'/%3E%3Ctext x='300' y='150' text-anchor='middle' fill='white' font-size='18' font-family='sans-serif' dominant-baseline='middle'%3ENo width/height — causes CLS%3C/text%3E%3C/svg%3E"
       alt="causes layout shift">

  <p>Text after the first image — this jumps when the image above loads without attributes.</p>

  <!-- With attributes: browser reserves the exact space needed -->
  <img class="demo-img"
       src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='300'%3E%3Crect fill='%2310b981' width='600' height='300'/%3E%3Ctext x='300' y='150' text-anchor='middle' fill='white' font-size='18' font-family='sans-serif' dominant-baseline='middle'%3Ewidth/height attrs set — no CLS%3C/text%3E%3C/svg%3E"
       alt="no layout shift"
       width="600"
       height="300">

  <p>Text after the second image — space was reserved, so this text doesn't jump.</p>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.article {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

h2 { font-size: 1.5rem; }

p {
  font-size: 0.95rem;
  color: #94a3b8;
  line-height: 1.6;
  background: #1e293b;
  border-radius: 8px;
  padding: 12px 16px;
}

.demo-img {
  /* CSS still overrides the HTML width/height */
  max-width: 100%;
  height: auto; /* preserves aspect ratio at any width */
  border-radius: 10px;
  display: block;
}`,
        js: ''
      }
    },
    {
      type: 'checkpoint',
      id: 'cp-responsive-images'
    },
    {
      type: 'challenge',
      id: 'ch-card-image',
      text: "The card image distorts when the card resizes because it uses the default `object-fit: fill`. Fix it: add `object-fit: cover` to `.card-img` and give the image container an `aspect-ratio: 3 / 2` so it always maintains the correct proportions.",
      hint: "Add `object-fit: cover` to `.card-img` and `aspect-ratio: 3 / 2` to `.card-img-wrapper` (or directly to `.card-img` if it has fixed dimensions).",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="cards">
  <div class="card">
    <div class="card-img-wrapper">
      <div class="card-img">Photo</div>
    </div>
    <div class="card-body">
      <h3>Card Title</h3>
      <p>The image should maintain a 3:2 ratio and never distort.</p>
    </div>
  </div>
  <div class="card">
    <div class="card-img-wrapper">
      <div class="card-img">Photo</div>
    </div>
    <div class="card-body">
      <h3>Another Card</h3>
      <p>Same rules — consistent across all cards.</p>
    </div>
  </div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 24px;
}

.cards {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.card {
  flex: 1;
  min-width: 200px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  overflow: hidden;
}

.card-img-wrapper {
  /* Add aspect-ratio: 3 / 2 here */
  width: 100%;
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 200px; /* Replace this fixed height with aspect-ratio on the wrapper */
  /* Add object-fit: cover here */
  background: linear-gradient(135deg, #1d4ed8, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
}

.card-body { padding: 16px; }
h3 { font-size: 1rem; margin-bottom: 8px; }
p { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasObjectFit = /object-fit\s*:\s*cover/.test(css);
        const hasAspectRatio = /aspect-ratio\s*:\s*3\s*\/\s*2/.test(css);
        return hasObjectFit && hasAspectRatio;
      }
    },
    {
      type: 'challenge',
      id: 'ch-gallery',
      text: "Create a photo gallery grid where each photo cell is square (1:1 aspect ratio) with `object-fit: cover` so images fill the square without distortion. The gallery should use CSS Grid with `repeat(auto-fill, minmax(150px, 1fr))` to automatically fill available space.",
      hint: "Add `aspect-ratio: 1 / 1` to `.photo` and `object-fit: cover` so images fill the square. The grid auto-fill handles the responsive layout.",
      defaultTab: 'css',
      startFiles: {
        html: `<meta name="viewport" content="width=device-width, initial-scale=1">
<div class="gallery">
  <div class="photo" style="background: linear-gradient(135deg, #1d4ed8, #0891b2)">1</div>
  <div class="photo" style="background: linear-gradient(135deg, #7c3aed, #be185d)">2</div>
  <div class="photo" style="background: linear-gradient(135deg, #059669, #10b981)">3</div>
  <div class="photo" style="background: linear-gradient(135deg, #d97706, #f59e0b)">4</div>
  <div class="photo" style="background: linear-gradient(135deg, #be185d, #ef4444)">5</div>
  <div class="photo" style="background: linear-gradient(135deg, #1d4ed8, #7c3aed)">6</div>
</div>`,
        css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
  padding: 16px;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}

.photo {
  /* Add aspect-ratio: 1 / 1 to make each cell square */
  /* Add object-fit: cover so image fills the square */
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  font-size: 1.5rem;
}`,
        js: ''
      },
      validate: (ctx) => {
        const css = ctx.files?.css || '';
        const hasAspectRatio = /aspect-ratio\s*:\s*1/.test(css);
        const hasObjectFit = /object-fit\s*:\s*cover/.test(css);
        return hasAspectRatio && hasObjectFit;
      }
    }
  ]
};

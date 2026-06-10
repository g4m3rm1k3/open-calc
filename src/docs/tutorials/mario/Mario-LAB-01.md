# Mario Platformer — LAB 01 — Phaser Setup and Your First Scene

**Prerequisites:** Tetris V3 LAB-01 complete. You know how to run
`npm create vite`, install packages, and read TypeScript type annotations.
Node.js 18+ is installed.

**What this lab adds:**
- A Vite + TypeScript + Phaser 3 project that runs in the browser
- A `Phaser.Game` configuration object — the single control point for the engine
- A `BootScene` class — your first Phaser scene with a sky-blue background
- The canvas scales to fill any browser window while keeping its 800×600 shape

**Time:** 45–60 minutes

---

## What You Will Build

```
After LAB-01:

┌─────────────────────────────────────────┐
│                                         │
│        #87CEEB sky blue                 │
│        fills the browser window         │
│        scales when you resize           │
│                                         │
└─────────────────────────────────────────┘
```

The canvas is 800×600 internally — all game coordinates use that space.
The displayed size adjusts to whatever the browser window is, without
distorting the content. Every future lab builds inside this coordinate space.

---

> **Quick Check — try to answer before reading further:**
>
> 1. In Tetris V3 you called `requestAnimationFrame(gameLoop)` manually.
>    What do you predict Phaser does on every frame instead?
> 2. Phaser scenes have three lifecycle methods: `preload`, `create`, `update`.
>    Based on the names alone, what does each one probably do?
> 3. *(Prediction)* If you set the canvas CSS width to 400px but keep the
>    internal `width: 800` in the Phaser config, what happens to drawings?
>
> *(Answers at the end of this lab)*

---

## Concept: npm and node_modules

**What it is:** `npm` (Node Package Manager) is a command-line tool that
downloads and manages JavaScript libraries for your project. Each library is
called a **dependency**. npm stores downloaded dependencies in a folder called
`node_modules/`.

**What it hides:** Without npm, you would manually download library files, put
them in your project folder, and update them by hand. npm automates download,
version tracking, and updates — one command installs everything your project needs.

**The protected invariant:** `package.json` records exactly which libraries and
versions your project needs. Anyone who downloads your project and runs
`npm install` gets the same libraries. `node_modules/` is never committed to
git — `package.json` is the single source of truth.

**Terms used in this lab:**

- **Package** — a library published on npm (Phaser is a package)
- **`package.json`** — the file that lists your project's dependencies
- **`node_modules/`** — where downloaded packages live (never edit these files)
- **`npm install`** — downloads all packages listed in `package.json`
- **`npm run dev`** — runs the `dev` script defined in `package.json` (starts Vite)

**Watch for:** Never edit files inside `node_modules/` — they are overwritten
whenever `npm install` runs. All your code goes in `src/`.

---

## Concept: Vite — The Build Tool

**What it is:** Vite is a development tool that compiles TypeScript to
JavaScript and serves your project to the browser with hot reload (the browser
updates automatically every time you save a file).

**What it hides:** TypeScript cannot run in the browser directly — browsers
only understand JavaScript. Vite compiles `.ts` files to `.js` on save and
serves the result. It also handles `import` statements (browsers cannot read
`node_modules/` paths directly — Vite rewrites them to browser-compatible URLs).

**The protected invariant:** You write TypeScript. The browser runs JavaScript.
Vite is the bridge. You never touch the compiled output — Vite regenerates it
on every save.

**Watch for:** Vite's dev server only works while `npm run dev` is running in
the terminal. If you close the terminal, the browser shows a connection error.
Always keep the dev server running in a terminal while working.

---

## Step 1 — Create the Project

Open a terminal in `cadcam/mario/` and run these three commands **in order**:

```bash
npm create vite@latest mario-game -- --template vanilla-ts
```

When prompted, press Enter to confirm. This creates a `mario-game/` folder
with a Vite + TypeScript project inside it.

```bash
cd mario-game
npm install
```

`npm install` downloads all packages listed in `package.json` into `node_modules/`.
This takes 10–30 seconds on first run.

```bash
npm install phaser
```

This adds Phaser 3 as a dependency and downloads it into `node_modules/phaser/`.

Now start the dev server:

```bash
npm run dev
```

### SAVE AND TRY

Open the URL the terminal printed (usually `http://localhost:5173`).

**You should see:** The Vite + TypeScript welcome page — a Vite logo, a
TypeScript logo, and a "count is 0" button.

**In DevTools Console** (F12 → Console tab):

```js
typeof Phaser
```

**Expected:** `'undefined'` — Phaser is installed in `node_modules/` but not
imported yet. We wire it in Step 3.

**Change something:** Open `src/main.ts` in your editor. Find the line that
sets `counter.innerHTML` with `count` and change `count` to `count * 2`. Save.
The button now shows doubled counts. Change it back — we replace this file
entirely in Step 3 and it does not matter what it contains now.

---

## Step 2 — Clear the Template and Write the HTML Structure

Delete Vite's demo files — we do not need them:

**Windows PowerShell:**
```bash
Remove-Item src/counter.ts
Remove-Item public/vite.svg
```

**Mac/Linux:**
```bash
rm src/counter.ts public/vite.svg
```

Now open `index.html`. Replace everything with:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mario Platformer</title>
  </head>
  <body>
    <!-- Phaser creates and injects a <canvas> element here automatically.
         We do not write a <canvas> tag — Phaser owns that element. -->
    <script type="module" src="/src/main.ts"></script>
    <!-- type="module": tells the browser this is an ES module — it supports
         'import' statements. Vite compiles the TypeScript and serves the result. -->
  </body>
</html>
```

### CSS AND SEE

Save. Look at the browser (Vite hot-reloads on HTML changes).

**You should see:** A white page. The Vite demo is gone. The `<body>` is empty
except for the script tag — Phaser has not started yet so no canvas exists.

---

## Step 3 — Add Page Styling

Open `src/style.css`. Replace everything with:

```css
/* Remove default browser spacing — every browser adds margin/padding by default.
   Without this reset, the canvas would have a gap around it. */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Dark background so the game canvas has a visible surround.
   Phaser injects a <canvas> element into <body> — we center it here. */
body {
  background-color: #000000;
  display: flex;               /* flexbox: activates alignment properties below */
  justify-content: center;     /* horizontal center */
  align-items: center;         /* vertical center */
  width: 100vw;                /* vw = viewport width — fills browser window */
  height: 100vh;               /* vh = viewport height — fills browser window */
  overflow: hidden;            /* prevent scrollbars appearing on resize */
}
```

Make sure `src/main.ts` imports this CSS. Open `src/main.ts` — the top line
should read `import './style.css'`. If it does not, add it:

```ts
import './style.css'   // ← verify this line exists at the top of main.ts
```

### CSS AND SEE

Save. Look at the browser.

**You should see:** A completely black page. The body background is black,
and there is nothing else yet — Phaser has not started.

**Compare:** Before this step: white page. After: black page. The CSS is
working. The canvas will appear inside this black space in Step 4.

**Change something:** Change `background-color: #000000` to
`background-color: #1a1a2e`. Save. The background turns dark navy. Change it
back to `#000000` — black is correct for the game surround.

---

## Math: Phaser's Coordinate System

**What it computes:** Every position in Phaser is expressed as `(x, y)` where
`x` is columns from the left and `y` is rows from the top.

**The real-world analogy:** A printed page, read left-to-right, top-to-bottom.
The top-left corner is the starting point. Moving right increases x. Moving
down increases y. This is the same coordinate system as the browser's CSS and
the canvas API you used in Tetris V3.

**Canonical example:**

```
Canvas: 800 × 600

(0, 0) ─────────────────── (800, 0)
  │                              │
  │         (400, 300)           │  ← center
  │                              │
(0, 600) ──────────────── (800, 600)

object.x = 0    → left edge
object.x = 800  → right edge
object.y = 0    → top edge
object.y = 600  → bottom edge
```

**Why it matters here:** Gravity pulls objects downward — increasing y.
When the player jumps, their y velocity is **negative** (moving toward smaller y
values — upward). When they fall, y velocity is **positive** (moving toward
larger y values — downward). This will be critical in LAB-02 when we configure
gravity.

**Watch for:** Coming from 3D or math contexts where y increases upward, this
is the opposite. In Phaser: up = negative y, down = positive y. Always.

---

## Concept: `Phaser.Game` — The Engine's Control Panel

**What it is:** `new Phaser.Game(config)` starts the Phaser engine. `config`
is a plain TypeScript object that describes how to set up the game — canvas
size, renderer type, scenes, and physics.

**What it hides:** One function call replaces all of this:
- Creating and sizing an HTML `<canvas>` element
- Initializing a WebGL or Canvas 2D rendering context
- Starting the `requestAnimationFrame` loop (the game loop you wrote manually in Tetris V3)
- Creating the scene manager, asset loader, and input manager
- Injecting the canvas into `document.body`

**The protected invariant:** The game will not start rendering until at least
one scene has finished loading. You never manually synchronize asset loading
with the render loop — Phaser guarantees `create()` is called only after all
`preload()` assets are ready.

**The configuration fields used in this lab:**

```ts
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  // Phaser.AUTO: use WebGL if the browser supports it; fall back to Canvas 2D.
  // WebGL = GPU-accelerated (needed for many sprites at 60fps).
  // Canvas 2D = the same ctx.fillRect API from Tetris V3.
  // AUTO picks the best option for the user's hardware automatically.

  width: 800,
  height: 600,
  // Internal resolution: all game coordinates are in this 800×600 space.
  // The displayed canvas size is controlled separately by the 'scale' config.

  backgroundColor: '#87CEEB',
  // Color drawn behind all game objects before each frame renders.
  // '#87CEEB' = sky blue (CSS hex format — Phaser accepts both '#RRGGBB' and 0xRRGGBB).

  scene: [BootScene],
  // Array of Scene classes to register. Phaser starts the FIRST scene automatically.
  // Additional scenes are registered but dormant until explicitly started.
};
```

**Smallest possible example:**

```ts
import Phaser from 'phaser';

new Phaser.Game({
  type: Phaser.AUTO,
  width: 400,
  height: 300,
  backgroundColor: '#ff0000',
  scene: { create() {} },   // inline scene object — the minimum Phaser accepts
});
// Result: a 400×300 red canvas injected into document.body.
```

**Watch for:** `new Phaser.Game(config)` returns a `Phaser.Game` instance.
You do not need to store it — Phaser manages its own lifecycle. Writing
`const game = new Phaser.Game(config)` is fine but `game` is rarely needed.

---

## Step 4 — Write the Minimal Game in `main.ts`

Open `src/main.ts`. Replace everything with the smallest possible working Phaser game:

```ts
// src/main.ts
import './style.css';      // ← import CSS so Vite bundles it (was already here)
import Phaser from 'phaser';
// 'phaser': the package name installed via npm.
// Vite resolves this to node_modules/phaser/dist/phaser.esm.js automatically.
// The default export is the Phaser namespace object — everything lives on it.

new Phaser.Game({          // ← add this block
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',   // sky blue — the game's background color
  scene: {
    create(this: Phaser.Scene) {
      // Inline scene object — the minimum Phaser requires.
      // We replace this with a real BootScene class in Step 6.
      // 'this' is the scene instance — Phaser binds it automatically.
    },
  },
});
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** A sky-blue `#87CEEB` rectangle on the black page. It is
800×600 pixels — Phaser created and injected the `<canvas>` element into
`document.body`.

**In DevTools Console:**

```js
Phaser.VERSION
```

**Expected:** A string like `'3.87.0'` — the Phaser version that was installed.

**Change something:** Change `backgroundColor: '#87CEEB'` to
`backgroundColor: '#FF0000'`. Save. The canvas turns red. This confirms the
Phaser.Game config is working. Change it back to `'#87CEEB'`.

---

## Concept: `Phaser.Scale` — Responsive Canvas Sizing

**What it is:** The `scale` section of the Phaser config controls how the
canvas appears on screen relative to the browser window.

**The problem before (without scale config):**
The canvas is 800×600 pixels and stays that size regardless of the window.
On a small screen it is cropped. On a large screen it floats in the center
with empty space around it. The game is not responsive.

**The solution:**

```ts
scale: {
  mode: Phaser.Scale.FIT,
  // FIT: scale the canvas UP or DOWN to fill the window while
  // preserving the 800:600 aspect ratio exactly.
  // The internal coordinate system stays 800×600 — no game coordinates change.
  // Only the CSS display size changes.

  autoCenter: Phaser.Scale.CENTER_BOTH,
  // CENTER_BOTH: center the canvas horizontally AND vertically in the window.
},
```

**What it hides:** Without `scale`, you would listen to the browser `resize`
event, calculate the new canvas CSS dimensions while preserving aspect ratio,
apply them, and handle the centering yourself. In Tetris V3, you set
`canvas.width` and `canvas.height` directly — that approach does not scale.
`Phaser.Scale` handles the resize math, the CSS updates, and centering in one config block.

**The protected invariant:** Internal game coordinates never change. An enemy
at world position (400, 300) is always at the center — regardless of whether
the canvas CSS size is 400px, 800px, or 1600px on screen. Scaling is purely
a display concern.

**Watch for:** `Phaser.Scale.FIT` may add black bars (letterboxing) if the
window's aspect ratio does not match 800:600. This is correct — it prevents
distortion. `Phaser.Scale.RESIZE` would stretch the canvas to fit exactly,
but that changes the game coordinate space and breaks all position math.

---

## Step 5 — Add the Scale Config

Open `src/main.ts`. Add the `scale` block to the existing config object:

```ts
new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  scale: {                              // ← add this block
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },                                    // ← end of scale block
  scene: {
    create(this: Phaser.Scene) {},
  },
});
```

### SAVE AND TRY

Save. Resize the browser window.

**You should see:** As you resize, the sky-blue canvas scales up or down while
keeping the 800×600 proportions. Black bars appear when the window's shape
does not match — the canvas never stretches or distorts.

**In DevTools Console:**

```js
document.querySelector('canvas').style.width
```

**Expected:** A CSS pixel value (e.g., `'800px'` or `'600px'`) that changes
as you resize the window. This is the displayed size — not the internal resolution.

**Change something:** Change `mode: Phaser.Scale.FIT` to
`mode: Phaser.Scale.NONE`. Save. Resize the window — the canvas no longer
scales. It stays at 800×600 CSS pixels even if the window is smaller. Change
it back to `Phaser.Scale.FIT`.

---

## Concept: `Phaser.Scene` — The Game Loop Unit

**What it is:** A `Phaser.Scene` is a TypeScript class that provides a
self-contained context for one part of your game. It has three lifecycle
methods Phaser calls automatically in a fixed order.

**What it hides:** A Scene hides game object lifecycle management. Without it,
you would need to manually track which objects are active, which are listening
to input, and which need to be destroyed when the current "screen" changes.
The scene manager handles all of this — when a scene stops, every game object,
physics body, event listener, and tween it created is destroyed automatically.

**The protected invariant:** `create()` is NEVER called before `preload()`
finishes. You cannot accidentally draw a sprite before its texture has loaded.
Phaser holds `create()` until the asset loader signals completion.

**The three lifecycle methods — in the order Phaser calls them:**

```ts
class ExampleScene extends Phaser.Scene {
  preload(): void {
    // Called ONCE, first.
    // Purpose: queue asset loads (images, audio, tilemaps).
    // Do NOT create game objects here — textures are not ready yet.
    this.load.image('sky', 'assets/sky.png');
  }

  create(): void {
    // Called ONCE, after preload() finishes.
    // Purpose: create all game objects (sprites, physics bodies, text).
    // Assets are guaranteed to be loaded at this point.
    this.add.image(400, 300, 'sky');
  }

  update(time: number, delta: number): void {
    // Called EVERY FRAME (~60 times per second).
    // Purpose: input handling, movement, collision checks.
    // 'time': total ms since game started.
    // 'delta': ms since the previous frame (use for frame-rate-independent movement).
  }
}
```

**The `extends` keyword:** `class BootScene extends Phaser.Scene` means
BootScene IS a Phaser.Scene — it inherits the full scene API: `this.add`,
`this.load`, `this.cameras`, `this.input`, `this.physics`. All of those are
provided by the parent class; you write only the game-specific logic.

**Watch for:** Do not create game objects in `preload()` — textures are still
loading and drawing would show nothing or crash. Do not load assets in `create()`
— the loader has already closed and callbacks will never fire.

---

## Step 6 — Refactor to a `BootScene` Class

Create a new folder `src/scenes/` and create `src/scenes/BootScene.ts`:

```ts
// src/scenes/BootScene.ts

export class BootScene extends Phaser.Scene {
  // 'extends Phaser.Scene': BootScene inherits the full scene API.
  // 'export': makes BootScene importable in main.ts.

  constructor() {
    super({ key: 'Boot' });
    // super(): calls the Phaser.Scene constructor.
    // { key: 'Boot' }: a unique string identifier for this scene.
    // Used when starting scenes by name: this.scene.start('Boot').
  }

  preload(): void {
    // Nothing to load yet — LAB-02 adds ground tile images here.
  }

  create(): void {
    // setBackgroundColor: sets the color Phaser clears the canvas with each frame.
    // Called here (not in the config) so each scene can set its own background.
    this.cameras.main.setBackgroundColor('#87CEEB');
    // this.cameras.main: the default camera for this scene.
    // '#87CEEB': sky blue.
  }

  update(_time: number, _delta: number): void {
    // Nothing moves in BootScene — the underscore prefix marks unused parameters.
    // TypeScript requires the parameters to be declared (Scene interface contract)
    // even if they are not used.
  }
}
```

Now open `src/main.ts` and replace the inline scene object with the class:

```ts
import './style.css';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';   // ← add this import
// './scenes/BootScene': path relative to this file. Vite resolves the .ts extension.

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene],   // ← was: { create(this: Phaser.Scene) {} }
  // Array of Scene classes. The first in the array starts automatically.
  // Additional scenes (GameScene, UIScene) are added here in later labs.
});
```

### SAVE AND TRY

Save. Look at the browser.

**You should see:** Identical to Step 5 — sky-blue canvas, scaling correctly.
The only change is architectural: the scene is now a typed class with a named
key, instead of an anonymous inline object.

**In DevTools Console:**

```js
typeof BootScene
```

**Expected:** `'function'` — TypeScript classes compile to JavaScript constructor
functions. The class exists at runtime.

**Change something:** In `BootScene.ts`, change `'#87CEEB'` to `'#000080'`
(navy blue). Save. The canvas turns dark blue. This confirms `BootScene.create()`
is running and its background color call takes effect. Change it back to `'#87CEEB'`.

---

## 🎯 Challenge: Toggle Background Color with Space Bar

**You know:** `this.cameras.main.setBackgroundColor(hexString)` sets the
background. Phaser's keyboard API uses `this.input.keyboard!.on('keydown-SPACE', callback)`.

**Task:** In `BootScene.create()`, add a keyboard listener that toggles the
background between sky blue `#87CEEB` and sunset orange `#FF7043` each time
Space is pressed. Track which color is active using a private boolean property
on the BootScene class.

**Starting point:**

```ts
// Add this property to BootScene:
private showingSky: boolean = true;

// In create(), after setBackgroundColor:
this.input.keyboard!.on('keydown-SPACE', () => {
  // your toggle code here
});
```

**Hint:** The `!` after `this.input.keyboard` tells TypeScript the keyboard
manager is not null — Phaser always creates it for an active scene. Without
`!`, TypeScript would warn that it might be null and refuse to compile the `.on()` call.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```ts
export class BootScene extends Phaser.Scene {
  private showingSky: boolean = true;   // ← add property

  constructor() { super({ key: 'Boot' }); }

  preload(): void {}

  create(): void {
    this.cameras.main.setBackgroundColor('#87CEEB');

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.showingSky = !this.showingSky;   // toggle the boolean
      const color = this.showingSky ? '#87CEEB' : '#FF7043';
      this.cameras.main.setBackgroundColor(color);
    });
  }

  update(_time: number, _delta: number): void {}
}
```

**Key insight:** The listener is registered with `this.input.keyboard!.on()`
rather than `window.addEventListener('keydown', ...)`. Phaser's input system
is scene-scoped — when `BootScene` stops (when we transition to `GameScene`
in LAB-02), this listener is automatically removed. `window.addEventListener`
listeners are global and persist across scene changes, which can cause input
events from one scene to fire in another — a common and hard-to-debug bug.

</details>

---

## Final Check

Verify every feature added in this lab before moving to LAB-02:

| Feature | How to verify |
|---------|---------------|
| Vite hot reload works | Edit any file, save — browser updates without manual refresh |
| Phaser installed | DevTools Console: `Phaser.VERSION` returns a version string |
| Sky-blue canvas visible | Browser shows `#87CEEB` canvas on black background |
| Canvas scales with window | Resize browser — canvas proportionally scales, no distortion |
| Black bars when wrong aspect | Make window very wide or very tall — black bars appear (correct) |
| BootScene is a class | DevTools Console: `typeof BootScene` → `'function'` |
| TypeScript errors absent | Editor Problems panel: zero errors |

---

## Quick Check Answers

**1. What does Phaser do on every frame instead of you calling `requestAnimationFrame` manually?**

The same thing — Phaser calls `requestAnimationFrame` at the end of each frame,
which schedules the next call. On each frame: (1) compute delta time (current
timestamp minus previous, capped at ~100ms to prevent spikes when the tab is
hidden), (2) call `update(time, delta)` on every active scene, (3) render all
active scenes to the canvas. Your `update()` is the equivalent of the `update(dt)`
function in Tetris V3 — Phaser calls it; you write what goes inside it.

**2. What do `preload`, `create`, and `update` do?**

`preload()`: runs once before anything else in a scene. Queue asset loads here
(images, tilemaps, audio). Phaser holds `create()` until all queued assets finish
downloading. `create()`: runs once after `preload()` completes — all assets are
guaranteed ready. Create sprites, physics bodies, and text here. `update(time, delta)`:
runs every frame (~60 times per second). Handle input, move objects, check
conditions here. `time` is total ms elapsed since the game started; `delta` is
ms since the last frame (use `delta` for any calculation that must be
frame-rate-independent, like movement speed).

**3. (Prediction) CSS width 400px but internal `width: 800` — what happens to drawings?**

The canvas draws at its internal 800-pixel resolution but is squished into 400
CSS pixels on screen. Every drawing is correct in the 800-pixel space, but the
display shrinks it 50%. On a standard monitor this looks fine but smaller. On
a high-DPI (Retina) display it can look blurry — the 800 internal pixels are
scaled to fewer physical pixels than the display expects. This is why Phaser's
`Scale.FIT` mode is used: it sets the CSS display size based on the window
size while leaving the internal resolution (and all game coordinates) unchanged.

---

*Next: LAB-02 — Ground and Arcade Physics. We create a `GameScene`, add brown
ground platforms as static physics bodies, and see a colored rectangle fall from
the sky and land. We explain gravity as constant acceleration and the difference
between a `collider` (solid) and an `overlap` (passthrough trigger).*

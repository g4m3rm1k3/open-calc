# Mario Platformer — LAB 11 — Scene Management and Level Flow

**Prerequisites:** LAB-10 complete. Death and respawn work. Lives tracked.
Game over restarts the scene. No menu or win screen exists.

**What this lab adds:**
- `MenuScene` — a start screen with title text and "Press Space to Start"
- `WinScene` — a victory screen showing final score
- A goal flag object in Tiled that triggers level completion
- `scene.start(key, data)` — passing score and lives between scenes
- Phaser's scene manager fully understood

**Time:** 60 minutes

---

## What You Will Build

```
Game flow:

  MenuScene → (Space) → GameScene → (reach flag) → WinScene
                                         ↑ (restart from WinScene or GameScene)
```

```
MenuScene:               WinScene:
┌──────────────┐         ┌──────────────┐
│              │         │              │
│  MARIO       │         │  YOU WIN!    │
│  PLATFORMER  │         │  Score: 1400 │
│              │         │              │
│ Press Space  │         │ Press Space  │
│  to Start    │         │ to Restart   │
└──────────────┘         └──────────────┘
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. `scene.start('Game')` and `scene.start('Game', { score: 500 })` — what is
>    different about the second call? How does `GameScene` access the data?
> 2. Can two Phaser scenes run at the same time? When would you want that?
> 3. *(Prediction)* When `MenuScene` calls `scene.start('Game')`, does `MenuScene`
>    keep running or does it stop?
>
> *(Answers at the end of this lab)*

---

## Concept: Phaser Scene Manager — Multi-Scene Architecture

**What it is:** Phaser's scene manager controls which scenes are active, paused,
or stopped, and handles transitions between them via `scene.start()`, `scene.stop()`,
`scene.pause()`, `scene.launch()`, and `scene.resume()`.

**What it hides:** The lifecycle event sequence — stopping one scene, cleaning
up its game objects, initializing the next scene, running its `preload()` and
`create()`. Without the scene manager, you would write a "clear everything and
rebuild" function manually for each transition. The scene manager does this
reliably for any scene pair.

**The protected invariant:** When a scene is stopped (via `scene.start('Other')`),
ALL of its game objects, physics bodies, tweens, timers, and event listeners are
destroyed automatically. You cannot accidentally leave a zombie game loop running
from a stopped scene.

**Key scene methods:**

| Method | What it does |
|--------|-------------|
| `scene.start(key)` | Stop current scene, start the named scene |
| `scene.start(key, data)` | Same, but passes a data object to the next scene's `init()` |
| `scene.launch(key)` | Start a scene WITHOUT stopping the current one (parallel scenes — used for UI in LAB-12) |
| `scene.stop(key)` | Stop a specific scene by key |
| `scene.pause()` | Freeze current scene (stops update, keeps rendering) |

**Data passing — `init(data)`:**

```ts
// Sending data:
this.scene.start('Win', { score: 1400, lives: 2 });

// Receiving data — scenes have an 'init' lifecycle method that runs before preload():
class WinScene extends Phaser.Scene {
  private score: number = 0;

  init(data: { score: number; lives: number }): void {
    this.score = data.score;   // data arrives here before preload() runs
  }

  create(): void {
    this.add.text(400, 300, `Score: ${this.score}`, { ... });
  }
}
```

**Project Application (The "Why" here):**

`MenuScene → GameScene`: no data needed (fresh start). `GameScene → WinScene`:
pass score and lives so the win screen can display them. `WinScene → GameScene`:
pass nothing (fresh game). This is a clean, typed data flow — no global variables.

---

## Step 1 — Create `MenuScene` and Register It

Create `src/scenes/MenuScene.ts`:

```ts
// src/scenes/MenuScene.ts

export class MenuScene extends Phaser.Scene {

  constructor() { super({ key: 'Menu' }); }

  preload(): void {
    // Nothing to load — menu uses text only.
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#1a1a2e');  // dark navy background

    const centerX = this.cameras.main.centerX;  // half of game width (400)
    const centerY = this.cameras.main.centerY;  // half of game height (300)

    // Title text:
    this.add.text(centerX, centerY - 80, 'MARIO PLATFORMER', {
      fontSize: '36px',
      fontFamily: 'monospace',
      color: '#FFD700',      // gold
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);       // setOrigin(0.5) centers text on (centerX, centerY - 80)

    // Subtitle:
    this.add.text(centerX, centerY, 'A Phaser 3 + TypeScript Game', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Prompt — add a blinking tween for visual interest:
    const prompt = this.add.text(centerX, centerY + 80, 'Press SPACE to Start', {
      fontSize: '22px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Blinking tween on the prompt text:
    this.tweens.add({
      targets: prompt,
      alpha: 0,          // fade to invisible
      duration: 500,
      yoyo: true,        // fade back
      repeat: -1,        // loop forever
      ease: 'Linear',
    });

    // Start game on Space:
    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.start('Game');
      // 'once': fires only one time, then auto-removes the listener.
      // Prevents the listener from being called multiple times if Space is held.
    });
  }
}
```

Now open `src/main.ts` and put `MenuScene` first in the scene array so it starts immediately:

```ts
import { MenuScene } from './scenes/MenuScene';   // ← add this import
import { GameScene } from './scenes/GameScene';

// In config:
scene: [MenuScene, GameScene],   // ← was: [GameScene, BootScene] or similar
//       ↑ MenuScene is first — it starts automatically on launch
```

### SAVE AND TRY

Save. Refresh the browser.

**You should see:** A dark navy screen with "MARIO PLATFORMER" in gold, "A Phaser 3 + TypeScript Game" in white, and a blinking "Press SPACE to Start" prompt.

**In DevTools Console:**

No console test needed — the visual is the verification. If you see the old game instead of the menu, `MenuScene` is not first in the `scene` array.

**Change something:** In `MenuScene.create()`, change the title text to `'MY GAME'`.
Save. The menu shows your new title. Change it back.

---

## Concept: `??` — Nullish Coalescing Operator

**What it is:** `a ?? b` returns `a` if `a` is not `null` or `undefined`;
otherwise returns `b`. It is a safe fallback for values that might not exist.

**The problem before:**

```ts
// Without ??: checking explicitly
const score = data.score !== undefined && data.score !== null ? data.score : 0;
```

**The solution:**

```ts
const score = data.score ?? 0;
// Reads: "data.score, or 0 if data.score is null/undefined."
```

**The difference from `||`:** `||` treats any falsy value as "missing" — including
`0` and `''`. `??` only treats `null` and `undefined` as missing. This matters
for scores: `data.score ?? 0` keeps `0` as a valid score; `data.score || 0`
would replace a legitimate score of `0` with the fallback.

**Watch for:** `??` is a TypeScript / modern JavaScript operator. It requires
a TypeScript target of ES2020 or later. Vite's default `tsconfig.json` already
targets a modern version, so `??` works out of the box.

---

## Step 2 — Create `WinScene` and Register It

Create `src/scenes/WinScene.ts`:

```ts
// src/scenes/WinScene.ts

// SceneData: typed shape of the data object passed from GameScene.
// Interface used here because it is a pure data contract with no behavior.
interface SceneData {
  score: number;
  lives: number;
}

export class WinScene extends Phaser.Scene {

  private finalScore: number = 0;

  constructor() { super({ key: 'Win' }); }

  // init: called before preload() with the data object from scene.start(key, data).
  // This is the correct place to read passed-in data — create() runs too late
  // if data is needed for asset loading decisions in preload().
  init(data: SceneData): void {
    this.finalScore = data.score ?? 0;
    // '?? 0': nullish coalescing (defined above) — use 0 if score is null or undefined.
    // (e.g., scene started without data object when testing directly.)
  }

  preload(): void {}

  create(): void {
    this.cameras.main.setBackgroundColor('#0f3460');

    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    this.add.text(cx, cy - 100, 'YOU WIN!', {
      fontSize: '40px',
      fontFamily: 'monospace',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(cx, cy, `Final Score: ${this.finalScore}`, {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(cx, cy + 100, 'Press SPACE to Play Again', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.start('Menu');   // back to menu (or 'Game' for immediate replay)
    });
  }
}
```

Register `WinScene` in `src/main.ts`:

```ts
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { WinScene }  from './scenes/WinScene';    // ← add this import

// In config:
scene: [MenuScene, GameScene, WinScene],
//                             ↑ registered but dormant until GameScene calls scene.start('Win')
```

### SAVE AND TRY

Save. Refresh the browser. The menu still shows (MenuScene is still first).

**Verify WinScene works** by temporarily making it the starting scene. In `main.ts`:

```ts
scene: [WinScene, MenuScene, GameScene],   // ← temporarily put WinScene first
```

Save. You should see the WinScene: dark blue background, "YOU WIN!", "Final Score: 0" (no data was passed — the `?? 0` fallback is active).

```ts
scene: [MenuScene, GameScene, WinScene],   // ← restore the correct order
```

**In DevTools Console:**

```js
// While WinScene is first, check the score fallback:
// The text should show "Final Score: 0" — confirming ?? 0 is working.
```

**Change something:** Temporarily change `data.score ?? 0` to `data.score ?? 999`.
Save. The "Final Score" text shows `999` when WinScene starts without data. Change
it back to `?? 0` and restore the correct scene order.

---

## Step 3 — Add Goal Flag to Tiled and Detect in `GameScene`

In Tiled, create an Object Layer called `Goal`. Place one point object at the
right end of the level (where the flag/door should be).

In `src/scenes/GameScene.ts`, add goal detection:

```ts
// In create(), after coins:

const goalLayer = map.getObjectLayer('Goal');
if (goalLayer && goalLayer.objects.length > 0) {
  const goalObj = goalLayer.objects[0];  // just one goal

  // Create a large invisible trigger zone at the goal position:
  const goal = this.physics.add.image(goalObj.x!, goalObj.y!, undefined as any);
  goal.setVisible(false);
  goal.setImmovable(true);
  (goal.body as Phaser.Physics.Arcade.Body).allowGravity = false;
  // allowGravity = false: goal does not fall (it is a trigger, not a visible object).

  this.physics.add.overlap(this.player, goal, () => {
    this.scene.start('Win', { score: this.score, lives: this.lives });
    // Pass the current score and lives to the WinScene via the data object.
  });
}
```

The scene array from Step 2 already ensures `MenuScene` starts first and
`GameScene` is dormant until Space is pressed — no changes needed.

### SAVE AND TRY

Save. Refresh the browser.

**You should see:**
1. `MenuScene` shows: dark background, "MARIO PLATFORMER" title, blinking prompt
2. Press Space → `GameScene` starts: full platformer
3. Walk all the way right to reach the goal flag position → `WinScene` shows
4. Press Space on WinScene → returns to MenuScene

**In DevTools Console:**

```js
// If the WinScene is not showing, check the goal layer name:
// Ensure Tiled exported an object layer named exactly 'Goal' (case-sensitive).
```

**Change something:** In `WinScene`, change `this.scene.start('Menu')` to
`this.scene.start('Game')`. Save. After winning, the game restarts directly
instead of returning to the menu. Change it back to `'Menu'`.

---

## 🎯 Challenge: Level Select (Two Levels)

**You know:** `scene.start(key, data)` can pass any data object. `init(data)`
receives it.

**Task:** Create a second level (`level2.tmj`) in Tiled. When `GameScene.init()`
receives `data.level === 2`, load `level2.tmj` instead of `level1.tmj`. On the
`WinScene`, show a "Level 2" button that starts `GameScene` with `{ level: 2 }`.

**Hint:** Add an `init(data: { level?: number })` method to `GameScene` that
saves `this.currentLevel = data.level ?? 1`. In `preload()`, use
`` this.load.tilemapTiledJSON('level', `assets/level${this.currentLevel}.tmj`) ``.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// In GameScene:
private currentLevel: number = 1;

init(data: { level?: number; score?: number; lives?: number }): void {
  this.currentLevel = data.level ?? 1;
  this.score = data.score ?? 0;
  this.lives = data.lives ?? 3;
}

preload(): void {
  this.load.tilemapTiledJSON('level', `assets/level${this.currentLevel}.tmj`);
  // Template literal: evaluates to 'assets/level1.tmj' or 'assets/level2.tmj'
  // ...rest of preload unchanged...
}

// In WinScene, add a Level 2 button:
this.input.keyboard!.on('keydown-TWO', () => {
  this.scene.start('Game', { level: 2 });
});
this.add.text(cx, cy + 160, 'Press 2 for Level 2', { ... }).setOrigin(0.5);
```

**Key insight:** Passing level number as scene data is the "pure" approach —
no global variables, no cross-scene state. Each `GameScene` run is completely
self-contained. The level number is injected at start time via `init()`, used
during `preload()` to load the correct tilemap, and forgotten when the scene
stops. The next run gets a fresh `init()` call with whatever data the caller
provides.

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `MenuScene` shows on launch | Refresh browser — see title screen, not game |
| Space starts game | Press Space on MenuScene → GameScene appears |
| Reaching goal triggers win | Walk to goal position → WinScene shows |
| Score passes to WinScene | WinScene shows correct collected-coin score |
| WinScene Space returns to menu | Press Space on WinScene → MenuScene appears |
| All scenes registered | No "Scene not found" errors in console |

---

## Quick Check Answers

**1. What is different about `scene.start('Game', { score: 500 })`?**

The second argument is passed to the receiving scene's `init(data)` method,
which runs before `preload()`. `GameScene.init(data)` reads `data.score` and
stores it as `this.score = data.score ?? 0`. Without `init()`, the data is
discarded silently. `preload()` and `create()` do NOT receive the data object —
only `init()` does. This is why `init()` must exist in the receiving scene if
you plan to use `scene.start(key, data)`.

**2. Can two scenes run simultaneously?**

Yes — `scene.launch(key)` starts a scene without stopping the current one.
Both scenes run their `update()` loops and render on the same canvas (layered
by order). Used in LAB-12 for the UI overlay: `UIScene` runs on top of
`GameScene`, displaying score and lives without being part of the game world.
This is better than adding HUD text directly to `GameScene` because UI objects
in `GameScene` would be affected by camera movement if `setScrollFactor(0)` is
forgotten.

**3. (Prediction) Does `MenuScene` keep running after `scene.start('Game')`?**

No — `scene.start('OtherKey')` stops the current scene completely. `MenuScene`'s
update loop stops, all its game objects are destroyed, and its physics bodies
are removed. If you used `scene.launch('Game')` instead, both would run
simultaneously. For most scene transitions (menu → game, game → win), `start()`
is correct — the old scene has no reason to continue running.

---

*Next: LAB-12 — HUD and Game Feel. We add a `UIScene` that runs in parallel
with `GameScene`, displaying score, lives, and a timer as an overlay. We add
particle effects on coin collection and stomping, plus camera screen shake
on player death — the final polish that makes the game feel complete.*

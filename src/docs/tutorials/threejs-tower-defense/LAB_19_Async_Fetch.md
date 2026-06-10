# Lab 19 — Async / Await and the Fetch API

## Quick Check

Answer these before you start. Check your answers at the bottom of the lab.

1. JavaScript runs on a single thread. If `fetch()` paused that thread until the network responded, what would happen to the rest of the page?
2. What does `Promise<GameData>` mean as a return type?
3. If a function is marked `async`, what type does TypeScript say it returns — even if you write `return 42`?
4. Why can you only use `await` inside an `async` function?
5. `response.json()` returns a `Promise`. Write the one-line `await` call that unwraps it into a variable called `data`.

---

## What You Will Build

Right now `PATH` and `WAVES` are hard-coded arrays sitting inside `main.ts`. This lab moves them into a separate `public/game-data.json` file and loads them with `fetch()` at startup.

New and changed files:

```
public/
└── game-data.json      ← NEW — path waypoints and wave configs

src/
└── main.ts             ← updated — async startup, loading screen, error handling
```

No new gameplay features. When the lab is done the game looks and plays identically — the only difference is that the data travels over the network before the game starts.

---

## Concept: Why Asynchronous Code Exists

JavaScript runs on a single thread. At any moment, it can only do one thing. If `fetch()` blocked that thread while it waited for the network, nothing else could run — the browser would freeze, animations would stall, and the user could not click anything.

The solution: functions that involve waiting hand the JavaScript engine a **Promise** — a placeholder that says "I will have a value for you later" — and immediately return. The engine stays free to handle other work. When the network responds, the engine comes back and continues from where you left off.

```
Thread timeline without async (bad):
[------fetch waits 200ms------][rest of code runs]
   ← browser is frozen here

Thread timeline with async (good):
[fetch starts][other work][other work][← network arrives, continue]
```

---

## Concept: `Promise<T>`

A `Promise<T>` is a container that will eventually hold a `T`. You cannot read the value directly — you must either `.then(callback)` or `await` it.

```typescript
const p: Promise<number> = fetch('/data').then(r => r.json());

// Option A — .then() — runs the callback when the value arrives
p.then(value => {
  console.log(value);  // value is number
});

// Option B — await — pauses this async function until the value arrives
const value = await p;  // value is number
```

`await` is syntactic sugar over `.then()`. It reads like synchronous code but does not block the thread. The tradeoff: `await` can only appear inside a function marked `async`.

---

## Step 1: Create `public/game-data.json`

Vite (and most bundlers) serve everything inside the `public/` folder as static files at the root URL. Create that file now.

**`public/game-data.json`:**

```json
{
  "path": [
    { "row": 1, "col": 0 },
    { "row": 1, "col": 1 },
    { "row": 1, "col": 2 },
    { "row": 2, "col": 2 },
    { "row": 3, "col": 2 },
    { "row": 4, "col": 2 },
    { "row": 4, "col": 3 },
    { "row": 4, "col": 4 },
    { "row": 5, "col": 4 },
    { "row": 6, "col": 4 },
    { "row": 6, "col": 5 },
    { "row": 6, "col": 6 },
    { "row": 6, "col": 7 }
  ],
  "waves": [
    { "enemyCount": 5, "spawnInterval": 2.0, "enemySpeed": 1.5, "enemyType": "basic" },
    { "enemyCount": 6, "spawnInterval": 1.5, "enemySpeed": 2.0, "enemyType": "fast" },
    { "enemyCount": 4, "spawnInterval": 2.5, "enemySpeed": 1.2, "enemyType": "armored" }
  ]
}
```

The `path` array is the same S-curve you have been using. The `waves` array matches what was in `main.ts`.

**SAVE AND TRY**
Start the dev server and open `http://localhost:5173/game-data.json` in a new browser tab. You should see the JSON text. If you see a 404, check that the file is in `public/`, not `src/`.

---

## Step 2: Fetch the File and Log It

Open `src/main.ts`. Add this function near the bottom, just before the `animate()` call at the very end of the file:

```typescript
function loadGameData() {
  fetch('/game-data.json')
    .then(response => response.json())
    .then(data => {
      console.log('loaded:', data);
    });
}

loadGameData();
```

This uses `.then()` chaining, which is the older style. Two things are happening:

`fetch('/game-data.json')` starts the HTTP request and returns a `Promise<Response>`.  
The first `.then(response => response.json())` waits for the response, then calls `.json()` on it — that also returns a Promise, so the chain continues.  
The second `.then(data => ...)` waits for the JSON to be parsed, then runs the callback with the result. Right now the result is just `any` — TypeScript does not know the shape yet.

**SAVE AND TRY**
Open the browser console (F12 → Console). Refresh the page. You should see `loaded:` followed by the object `{ path: [...], waves: [...] }`. If you see a network error, re-check the file is in `public/`.

---

## Concept: `async` and `await`

The `.then()` chain above works, but it gets hard to read once there are more than two steps. The `async`/`await` syntax writes the same logic as if it were sequential:

```typescript
// .then() style
fetch('/data')
  .then(r => r.json())
  .then(data => use(data));

// async/await style — identical behaviour
async function load() {
  const response = await fetch('/data');
  const data = await response.json();
  use(data);
}
```

Rules:
- `await` unwraps a `Promise<T>` into a `T`.
- `await` can only appear directly inside a function marked `async`.
- An `async` function always returns a `Promise`. If you write `return 42`, the caller receives `Promise<number>`, not `number`.

The browser handles the pausing — your code looks sequential but the thread is free while it waits.

---

## Step 3: Rewrite `loadGameData` with `async`/`await`

Replace the function and its call you wrote in Step 2 with this version:

```typescript
interface GameData {
  path: Array<{ row: number; col: number }>;
  waves: WaveConfig[];
}
```

`WaveConfig` is already imported from `./types`, so this compiles immediately. The interface describes what we expect the JSON to contain.

Now rewrite `loadGameData` using `async`/`await`:

```typescript
async function loadGameData(): Promise<GameData> {
  const response = await fetch('/game-data.json');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json() as Promise<GameData>;
}
```

`async function loadGameData(): Promise<GameData>` — the `async` keyword means the return type is automatically a Promise; writing `Promise<GameData>` explicitly is optional but clear.  
`await fetch(...)` — pauses here until the HTTP response headers arrive.  
`response.ok` is `true` for 200–299 status codes. Throwing an error for non-OK responses prevents silently proceeding with broken data.  
`response.json() as Promise<GameData>` — `.json()` returns `Promise<any>`; the cast tells TypeScript the shape we expect.

Remove the old `loadGameData()` call you added in Step 2. Do not add a new call yet.

**SAVE AND TRY**
Run `tsc --noEmit`. Zero errors. Nothing calls `loadGameData` yet, so the game still starts with the old hard-coded data.

---

## Step 4: Change `PATH` and `WAVES` to `let`

Currently near the top of `main.ts` you have something like:

```typescript
const PATH: Array<{ row: number; col: number }> = [
  { row: 1, col: 0 }, ...
];

const WORLD_PATH = PATH.map(...);

const WAVES: WaveConfig[] = [
  { enemyCount: 5, ... },
  ...
];
```

And a block that marks path tiles:

```typescript
for (const { row, col } of PATH) {
  tiles[row][col].walkable = false;
  tiles[row][col].material.color.setHex(COLOR_PATH);
}
```

Make these three changes:

**Change 1** — replace the `PATH` const (and its initializer) with an empty `let`:

```typescript
let PATH: Array<{ row: number; col: number }> = [];
```

**Change 2** — replace `WORLD_PATH` (and its `.map(...)` initializer) with an empty `let`:

```typescript
let WORLD_PATH: THREE.Vector3[] = [];
```

**Change 3** — replace the `WAVES` const (and its initializer) with an empty `let`:

```typescript
let WAVES: WaveConfig[] = [];
```

**Change 4** — delete the tile-marking loop (`for (const { row, col } of PATH) { ... }`). It will move into `applyGameData` in the next step.

**SAVE AND TRY**
Run `tsc --noEmit`. Zero errors. Refresh the browser. The game starts — but the grid is all green: no path tiles are marked because `PATH` is empty. The wave system tries to spawn enemies but there are no waypoints. This is expected and will be fixed in Step 5.

---

## Step 5: Write `applyGameData` and `startGame`

Add these two functions near the bottom of `main.ts`, just before the `animate()` call.

**`applyGameData`** fills in the three `let` variables and marks the path tiles:

```typescript
function applyGameData(data: GameData): void {
  PATH = data.path;
  WORLD_PATH = PATH.map(({ row, col }) =>
    new THREE.Vector3(
      GRID_OFFSET_X + col * TILE_SIZE,
      ENEMY_Y,
      GRID_OFFSET_Z + row * TILE_SIZE
    )
  );
  WAVES = data.waves;

  for (const { row, col } of PATH) {
    const tile = tiles[row][col];
    tile.walkable = false;
    tile.material.color.setHex(COLOR_PATH);
  }
}
```

This is exactly the code that used to run at module level, now bundled into one function that runs after the JSON arrives.

**`startGame`** ties the loading and the game together:

```typescript
async function startGame(): Promise<void> {
  const data = await loadGameData();
  applyGameData(data);
  updateHUD();
  animate();
}
```

`await loadGameData()` pauses here until the JSON is fetched and parsed.  
`applyGameData(data)` fills PATH, WORLD_PATH, and WAVES, and marks the grid.  
`updateHUD()` draws the initial HUD with the correct wave count.  
`animate()` starts the render loop only after everything is ready.

Now replace the bare `animate()` call at the very bottom of `main.ts` with:

```typescript
startGame();
```

**SAVE AND TRY**
Refresh the browser. The path tiles appear with their tan colour. Spacebar starts waves. Enemies follow the path. Ctrl+Z still undoes tower placement. The game is fully working with data loaded from the JSON file.

Open DevTools → Network tab. Reload. You will see `game-data.json` as the first request — proof the data is coming from the file.

---

## Step 6: Add a Loading Screen

The fetch is fast on localhost, but on a real server it would take a visible moment. Show the player something while they wait.

Add this block right after the `overlayDiv` setup (where the existing overlay div is created):

```typescript
const loadingDiv = document.createElement('div');
loadingDiv.style.position = 'absolute';
loadingDiv.style.inset = '0';
loadingDiv.style.display = 'flex';
loadingDiv.style.alignItems = 'center';
loadingDiv.style.justifyContent = 'center';
loadingDiv.style.backgroundColor = '#1a1a2e';
loadingDiv.style.color = '#ffffff';
loadingDiv.style.fontFamily = 'monospace';
loadingDiv.style.fontSize = '20px';
loadingDiv.textContent = 'Loading…';
container.appendChild(loadingDiv);
```

This div sits on top of everything. It is the first thing the player sees.

Now update `startGame` to hide it once the data is ready:

```typescript
async function startGame(): Promise<void> {
  const data = await loadGameData();
  applyGameData(data);
  loadingDiv.style.display = 'none';
  updateHUD();
  animate();
}
```

`loadingDiv.style.display = 'none'` removes it from view the moment the data is applied.

**CSS AND SEE**
Refresh the browser. If your connection is fast, the loading screen flashes for a few milliseconds and then the game appears. To see it more clearly: open DevTools → Network → set throttling to "Slow 3G". Reload. The loading text will stay on screen for a second or two, then the game appears normally.

Set throttling back to "No throttling" when done.

---

## Step 7: Handle Errors with `try`/`catch`

If the JSON file is missing or the server is unreachable, `loadGameData` throws an error. Without a `try`/`catch` that error disappears silently (it becomes an unhandled Promise rejection logged only in the console). The player just stares at the loading screen forever.

Update `startGame` to catch errors and show them:

```typescript
async function startGame(): Promise<void> {
  try {
    const data = await loadGameData();
    applyGameData(data);
    loadingDiv.style.display = 'none';
    updateHUD();
    animate();
  } catch (err) {
    loadingDiv.textContent =
      `Failed to load game data.\n\n${String(err)}\n\nCheck the console.`;
    loadingDiv.style.whiteSpace = 'pre';
    console.error(err);
  }
}
```

`try { ... } catch (err) { ... }` wraps the awaited calls. If any of them throw — either the `!response.ok` throw from `loadGameData`, or a network failure — execution jumps to the `catch` block.  
`String(err)` safely converts any thrown value to a string for display.

**SAVE AND TRY**

1. Temporarily change the URL in `loadGameData` from `'/game-data.json'` to `'/missing.json'`.
2. Refresh the browser.
3. The loading screen should show the error message instead of freezing.
4. Change the URL back to `'/game-data.json'`.
5. Refresh. The game starts normally.

---

## Challenges

**Challenge 1 — Slow network simulation without DevTools**

Add a helper function that introduces an artificial delay, and call it inside `loadGameData` to simulate a slow server:

```typescript
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

Inside `loadGameData`, add `await delay(1500)` before the `fetch` call. The loading screen will stay visible for 1.5 seconds. Remove it after testing.

<details>
<summary>Solution</summary>

```typescript
async function loadGameData(): Promise<GameData> {
  await delay(1500);                        // remove after testing
  const response = await fetch('/game-data.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<GameData>;
}
```

The `delay` function works because `setTimeout` fires its callback after the specified milliseconds. `new Promise(resolve => setTimeout(resolve, ms))` creates a Promise that resolves (with no value) after `ms` milliseconds. Awaiting it just pauses execution for that long.

</details>

---

**Challenge 2 — Animated loading text**

Make the loading text cycle through `Loading.`, `Loading..`, `Loading...` once per second using `setInterval`. Clear the interval when the game starts.

<details>
<summary>Solution</summary>

```typescript
const dots = ['.', '..', '...'];
let dotIndex = 0;
const loadingInterval = setInterval(() => {
  loadingDiv.textContent = `Loading${dots[dotIndex % 3]}`;
  dotIndex++;
}, 500);
```

In `startGame`, after `applyGameData`:

```typescript
clearInterval(loadingInterval);
loadingDiv.style.display = 'none';
```

Also clear it in the `catch` block so the animation stops on error.

</details>

---

**Challenge 3 — Add a `levels` array to the JSON**

Extend `game-data.json` with a `"levels"` key that contains multiple named sets of waves:

```json
"levels": [
  {
    "name": "Easy",
    "waves": [ ... ]
  },
  {
    "name": "Hard",
    "waves": [ ... ]
  }
]
```

Update `GameData` to include `levels`. After loading, pick `levels[0]` as the active wave set. Bonus: display the level name in the HUD.

<details>
<summary>Solution</summary>

In `GameData`:

```typescript
interface LevelConfig {
  name: string;
  waves: WaveConfig[];
}

interface GameData {
  path: Array<{ row: number; col: number }>;
  waves: WaveConfig[];
  levels: LevelConfig[];
}
```

In `applyGameData`, after setting `WAVES = data.waves`, optionally override with a specific level:

```typescript
if (data.levels && data.levels.length > 0) {
  WAVES = data.levels[0].waves;
  // store name somewhere for HUD
}
```

</details>

---

## Quick Check Answers

1. The entire page would freeze — no mouse events, no animations, no scroll — until the fetch completed. On a slow connection this could be seconds.
2. `Promise<GameData>` means the function returns a Promise that will eventually resolve to a `GameData` value. You must `await` it or use `.then()` to get the `GameData` out.
3. TypeScript says it returns `Promise<number>`. Any `async` function's return value is automatically wrapped in a Promise.
4. `await` suspends execution of the current function. The JavaScript engine needs a function boundary to resume from; only `async` functions provide that suspension point.
5. `const data = await response.json();`

---

## Final Check

| Behaviour | Pass? |
|---|---|
| `public/game-data.json` is served correctly (visible in browser at `/game-data.json`) | |
| `loadGameData()` is `async`, returns `Promise<GameData>`, throws on non-OK response | |
| `PATH`, `WORLD_PATH`, and `WAVES` are declared as `let` with empty defaults | |
| `applyGameData` fills PATH, WORLD_PATH, WAVES, and marks path tiles | |
| `startGame()` awaits `loadGameData`, calls `applyGameData`, then `animate()` | |
| Game plays identically to before — path, waves, towers, undo all work | |
| Loading screen is visible before data arrives and hidden afterwards | |
| `try`/`catch` in `startGame` shows an error message instead of freezing | |
| A bad URL shows the error on screen; correcting it restores normal play | |

---

## Complete File Listings

### `public/game-data.json`

```json
{
  "path": [
    { "row": 1, "col": 0 },
    { "row": 1, "col": 1 },
    { "row": 1, "col": 2 },
    { "row": 2, "col": 2 },
    { "row": 3, "col": 2 },
    { "row": 4, "col": 2 },
    { "row": 4, "col": 3 },
    { "row": 4, "col": 4 },
    { "row": 5, "col": 4 },
    { "row": 6, "col": 4 },
    { "row": 6, "col": 5 },
    { "row": 6, "col": 6 },
    { "row": 6, "col": 7 }
  ],
  "waves": [
    { "enemyCount": 5, "spawnInterval": 2.0, "enemySpeed": 1.5, "enemyType": "basic" },
    { "enemyCount": 6, "spawnInterval": 1.5, "enemySpeed": 2.0, "enemyType": "fast" },
    { "enemyCount": 4, "spawnInterval": 2.5, "enemySpeed": 1.2, "enemyType": "armored" }
  ]
}
```

---

### `src/main.ts` (complete)

```typescript
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Tile, TowerType, GameState, WaveConfig } from './types';
import type { EnemyType } from './types';
import { EventEmitter } from './EventEmitter';
import { BasicEnemy, ArmoredEnemy, FastEnemy, type Enemy } from './entities/Enemy';
import { BasicTower, SniperTower, CannonTower, type Tower } from './entities/Tower';
import { Stack } from './utils';

// ---- Constants ---------------------------------------------------------
const GRID_SIZE = 8;
const TILE_SIZE = 1;
const GRID_OFFSET_X = -(GRID_SIZE * TILE_SIZE) / 2 + TILE_SIZE / 2;
const GRID_OFFSET_Z = -(GRID_SIZE * TILE_SIZE) / 2 + TILE_SIZE / 2;
const ENEMY_Y = 0.3;
const COLOR_PATH = 0xc8a46e;
const COLOR_GROUND = 0x3a7d44;
const COLOR_OCCUPIED = 0x555555;
const TOWER_Y = 0.0;

// ---- Loaded data (filled in by applyGameData) --------------------------
let PATH: Array<{ row: number; col: number }> = [];
let WORLD_PATH: THREE.Vector3[] = [];
let WAVES: WaveConfig[] = [];

// ---- Game state --------------------------------------------------------
let gameState: GameState = 'playing';
let score = 0;
let lives = 10;
let currentWaveIndex = -1;
let waveActive = false;
let enemiesSpawnedThisWave = 0;
let spawnTimer = 0;
let selectedTowerType: TowerType = 'basic';

// ---- Undo --------------------------------------------------------------
interface PlacementRecord {
  tile: Tile;
  tower: Tower;
}
const undoStack = new Stack<PlacementRecord>();

// ---- EventEmitter ------------------------------------------------------
const gameEvents = new EventEmitter();

// ---- Scene setup -------------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 10, 8);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const container = document.createElement('div');
container.id = 'game-container';
container.style.position = 'relative';
container.style.width = '100vw';
container.style.height = '100vh';
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(container);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---- Grid --------------------------------------------------------------
const tiles: Tile[][] = [];

for (let row = 0; row < GRID_SIZE; row++) {
  tiles[row] = [];
  for (let col = 0; col < GRID_SIZE; col++) {
    const geometry = new THREE.BoxGeometry(TILE_SIZE, 0.1, TILE_SIZE);
    const material = new THREE.MeshPhongMaterial({ color: COLOR_GROUND });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      GRID_OFFSET_X + col * TILE_SIZE,
      0,
      GRID_OFFSET_Z + row * TILE_SIZE
    );
    mesh.receiveShadow = true;
    scene.add(mesh);
    tiles[row][col] = { mesh, material, walkable: true, occupied: false, row, col };
  }
}

// ---- Arrays ------------------------------------------------------------
const towers: Tower[] = [];
const enemies: Enemy[] = [];

// ---- HUD ---------------------------------------------------------------
const hudDiv = document.createElement('div');
hudDiv.style.position = 'absolute';
hudDiv.style.top = '10px';
hudDiv.style.left = '10px';
hudDiv.style.color = '#ffffff';
hudDiv.style.fontFamily = 'monospace';
hudDiv.style.fontSize = '14px';
hudDiv.style.pointerEvents = 'none';
hudDiv.style.whiteSpace = 'pre';
container.appendChild(hudDiv);

function updateHUD(): void {
  const typeNames: Record<TowerType, string> = {
    basic: 'Basic (1)',
    sniper: 'Sniper (2)',
    cannon: 'Cannon (3)',
  };
  const waveText =
    currentWaveIndex < 0
      ? 'Press SPACE to start'
      : waveActive
      ? `Wave ${currentWaveIndex + 1}/${WAVES.length}  Enemies: ${enemies.length}`
      : currentWaveIndex >= WAVES.length - 1
      ? 'All waves complete!'
      : `Wave ${currentWaveIndex + 1} cleared  |  SPACE for next`;

  const undoHint = undoStack.isEmpty ? '' : `\nCtrl+Z: undo (${undoStack.size})`;

  hudDiv.textContent =
    `Lives: ${lives}  Score: ${score}\n` +
    `Towers: ${towers.length}  Selected: ${typeNames[selectedTowerType]}\n` +
    waveText +
    undoHint;
}

// ---- Overlay -----------------------------------------------------------
const overlayDiv = document.createElement('div');
overlayDiv.style.position = 'absolute';
overlayDiv.style.inset = '0';
overlayDiv.style.display = 'none';
overlayDiv.style.flexDirection = 'column';
overlayDiv.style.alignItems = 'center';
overlayDiv.style.justifyContent = 'center';
overlayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
overlayDiv.style.color = '#ffffff';
overlayDiv.style.fontFamily = 'monospace';
overlayDiv.style.fontSize = '24px';
overlayDiv.style.whiteSpace = 'pre';
overlayDiv.style.textAlign = 'center';
container.appendChild(overlayDiv);

// ---- Loading screen ----------------------------------------------------
const loadingDiv = document.createElement('div');
loadingDiv.style.position = 'absolute';
loadingDiv.style.inset = '0';
loadingDiv.style.display = 'flex';
loadingDiv.style.alignItems = 'center';
loadingDiv.style.justifyContent = 'center';
loadingDiv.style.backgroundColor = '#1a1a2e';
loadingDiv.style.color = '#ffffff';
loadingDiv.style.fontFamily = 'monospace';
loadingDiv.style.fontSize = '20px';
loadingDiv.textContent = 'Loading…';
container.appendChild(loadingDiv);

function showOverlay(title: string, subtitle: string): void {
  overlayDiv.textContent = `${title}\n\n${subtitle}`;
  overlayDiv.style.display = 'flex';
}

// ---- Events ------------------------------------------------------------
gameEvents.on('towerPlaced', (_count) => { updateHUD(); });
gameEvents.on('towerRemoved', (_count) => { updateHUD(); });
gameEvents.on('typeChanged', (_type) => { updateHUD(); });
gameEvents.on('livesChanged', (newLives) => {
  lives = newLives as number;
  updateHUD();
  if (lives <= 0 && gameState === 'playing') {
    gameState = 'gameover';
    gameEvents.emit('gameOver', score);
  }
});
gameEvents.on('gameOver', (finalScore) => {
  showOverlay('GAME OVER', `Score: ${finalScore}\n\nPress R to restart`);
});
gameEvents.on('gameWon', (finalScore) => {
  showOverlay('YOU WIN!', `Score: ${finalScore}\n\nPress R to play again`);
});

// ---- Raycaster ---------------------------------------------------------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const tileMeshes = tiles.flat().map(t => t.mesh);

renderer.domElement.addEventListener('click', (event) => {
  if (gameState !== 'playing') return;
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(tileMeshes);
  if (hits.length === 0) return;
  const hitMesh = hits[0].object as THREE.Mesh;
  const tile = tiles.flat().find(t => t.mesh === hitMesh);
  if (!tile) return;
  if (!tile.walkable || tile.occupied) return;
  placeTower(tile);
});

// ---- Tower placement ---------------------------------------------------
function placeTower(tile: Tile): void {
  const position = new THREE.Vector3(tile.mesh.position.x, TOWER_Y, tile.mesh.position.z);

  let tower: Tower;
  if (selectedTowerType === 'basic') {
    tower = new BasicTower(scene, position);
  } else if (selectedTowerType === 'sniper') {
    tower = new SniperTower(scene, position);
  } else {
    tower = new CannonTower(scene, position);
  }

  tile.occupied = true;
  tile.material.color.setHex(COLOR_OCCUPIED);
  towers.push(tower);
  undoStack.push({ tile, tower });
  gameEvents.emit('towerPlaced', towers.length);
}

function undoLastPlacement(): void {
  if (undoStack.isEmpty) return;
  const record = undoStack.pop()!;
  scene.remove(record.tower.mesh);
  record.tile.occupied = false;
  record.tile.material.color.setHex(
    record.tile.walkable ? COLOR_GROUND : COLOR_PATH
  );
  const idx = towers.indexOf(record.tower);
  if (idx !== -1) towers.splice(idx, 1);
  gameEvents.emit('towerRemoved', towers.length);
}

// ---- Input -------------------------------------------------------------
window.addEventListener('keydown', (event) => {
  if (event.key === '1') {
    selectedTowerType = 'basic';
    gameEvents.emit('typeChanged', selectedTowerType);
  }
  if (event.key === '2') {
    selectedTowerType = 'sniper';
    gameEvents.emit('typeChanged', selectedTowerType);
  }
  if (event.key === '3') {
    selectedTowerType = 'cannon';
    gameEvents.emit('typeChanged', selectedTowerType);
  }
  if (event.key === ' ' && gameState === 'playing') {
    event.preventDefault();
    startNextWave();
  }
  if (event.key === 'r' || event.key === 'R') {
    resetGame();
  }
  if ((event.key === 'z' || event.key === 'Z') && event.ctrlKey) {
    event.preventDefault();
    if (gameState === 'playing') undoLastPlacement();
  }
});

// ---- Spawner -----------------------------------------------------------
function spawnEnemy(speed: number, type: EnemyType): Enemy {
  if (type === 'armored') return new ArmoredEnemy(WORLD_PATH, speed);
  if (type === 'fast') return new FastEnemy(WORLD_PATH, speed);
  return new BasicEnemy(WORLD_PATH, speed);
}

function startNextWave(): void {
  if (waveActive) return;
  if (currentWaveIndex >= WAVES.length - 1) return;
  currentWaveIndex++;
  waveActive = true;
  enemiesSpawnedThisWave = 0;
  spawnTimer = 0;
  updateHUD();
}

function updateWaveSpawner(deltaTime: number): void {
  if (!waveActive) return;
  const wave = WAVES[currentWaveIndex];
  const allSpawned = enemiesSpawnedThisWave >= wave.enemyCount;

  if (!allSpawned) {
    spawnTimer += deltaTime;
    if (spawnTimer >= wave.spawnInterval) {
      spawnTimer -= wave.spawnInterval;
      const enemy = spawnEnemy(wave.enemySpeed, wave.enemyType);
      enemies.push(enemy);
      gameEvents.emit('enemySpawned', enemies.length);
      enemiesSpawnedThisWave++;
    }
  }

  const allCleared = allSpawned && enemies.length === 0;
  if (allCleared) {
    waveActive = false;
    const isLastWave = currentWaveIndex >= WAVES.length - 1;
    if (isLastWave && lives > 0 && gameState === 'playing') {
      gameState = 'won';
      gameEvents.emit('gameWon', score);
    }
    updateHUD();
  }
}

// ---- Reset -------------------------------------------------------------
function resetGame(): void {
  for (let i = towers.length - 1; i >= 0; i--) {
    scene.remove(towers[i].mesh);
  }
  towers.length = 0;

  for (let i = enemies.length - 1; i >= 0; i--) {
    scene.remove(enemies[i].mesh);
  }
  enemies.length = 0;

  for (const row of tiles) {
    for (const tile of row) {
      tile.occupied = false;
      tile.material.color.setHex(tile.walkable ? COLOR_GROUND : COLOR_PATH);
    }
  }

  gameState = 'playing';
  score = 0;
  lives = 10;
  currentWaveIndex = -1;
  waveActive = false;
  enemiesSpawnedThisWave = 0;
  spawnTimer = 0;
  overlayDiv.style.display = 'none';
  undoStack.clear();
  updateHUD();
}

// ---- Game loop ---------------------------------------------------------
let lastTime = 0;

function update(time: number): void {
  const deltaTime = Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;
  controls.update();
  if (gameState !== 'playing') return;

  updateWaveSpawner(deltaTime);

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update(deltaTime);
    if (enemy.done) {
      if (enemy.escaped) {
        lives = Math.max(0, lives - 1);
        gameEvents.emit('livesChanged', lives);
      } else {
        const points = Math.round(enemy.speed * 30 + enemy.maxHealth * 0.5);
        score += points;
      }
      scene.remove(enemy.mesh);
      enemies.splice(i, 1);
      updateHUD();
    }
  }

  for (const tower of towers) {
    tower.update(deltaTime, enemies);
  }
}

function animate(time: number = 0): void {
  requestAnimationFrame(animate);
  update(time);
  renderer.render(scene, camera);
}

// ---- Data loading ------------------------------------------------------
interface GameData {
  path: Array<{ row: number; col: number }>;
  waves: WaveConfig[];
}

async function loadGameData(): Promise<GameData> {
  const response = await fetch('/game-data.json');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json() as Promise<GameData>;
}

function applyGameData(data: GameData): void {
  PATH = data.path;
  WORLD_PATH = PATH.map(({ row, col }) =>
    new THREE.Vector3(
      GRID_OFFSET_X + col * TILE_SIZE,
      ENEMY_Y,
      GRID_OFFSET_Z + row * TILE_SIZE
    )
  );
  WAVES = data.waves;
  for (const { row, col } of PATH) {
    const tile = tiles[row][col];
    tile.walkable = false;
    tile.material.color.setHex(COLOR_PATH);
  }
}

async function startGame(): Promise<void> {
  try {
    const data = await loadGameData();
    applyGameData(data);
    loadingDiv.style.display = 'none';
    updateHUD();
    animate();
  } catch (err) {
    loadingDiv.textContent =
      `Failed to load game data.\n\n${String(err)}\n\nCheck the console.`;
    loadingDiv.style.whiteSpace = 'pre';
    console.error(err);
  }
}

startGame();
```

---

## What Is Next

Lab 20 covers **`localStorage`**. At the end of a game — win or lose — the player's score is written to the browser's persistent storage with `localStorage.setItem`. When the game loads next time, it reads the stored high score and displays it. You will see `JSON.stringify` and `JSON.parse` used for the first time, understand why the browser only stores strings, and learn when localStorage is the right tool versus a server database.

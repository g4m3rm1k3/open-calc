# TypeScript Tower Defense — LAB 10 — The Observer Pattern

**Prerequisites:** Lab 09 complete. You can place BasicTowers and SniperTowers by pressing `1` or `2` then clicking tiles.

**What this lab adds:**
- An `EventEmitter` class — a general-purpose event system
- The `private` keyword — hiding internal implementation details
- The `Map` data structure — a key→value store
- Game events: `'towerPlaced'` and `'towerRemoved'`
- A live HUD overlay on the canvas showing the current tower count
- `document.createElement` — creating HTML elements from JavaScript

**Time:** 60–90 minutes.

---

## What You Will Build

A small HUD (Heads-Up Display) appears in the top-left corner of the game. It shows a live tower count that updates automatically whenever a tower is placed or removed:

```
┌──────────────────────────┐
│  Towers: 3               │  ← HTML div floating over the canvas
│                          │
│                          │
│    [game grid here]      │
└──────────────────────────┘
```

The counter is not wired to the placement code directly. Instead, placement code *announces* that a tower was placed. The HUD *listens* for that announcement and updates itself. The two pieces of code do not know about each other — and that is the point.

---

> **Quick Check — try to answer before reading further:**
>
> 1. In the current code, `placeTower()` creates the tower and adds it to the array. If you wanted to also update a HUD counter, a sound system, and an achievement tracker when a tower is placed — where would that code go with our current design?
> 2. What do you think the word "observer" means in this context? What is being observed, and who is observing it?
> 3. When a radio station broadcasts a signal, it does not know which radios are tuned in. When a radio receives the signal, it does not know what else is receiving it. What is the advantage of that arrangement?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Understand the Observer Pattern Before Touching Code

---

### Concept: The Problem — Tight Coupling

Right now, `placeTower()` does one thing: it builds the tower and adds it to the array. That is clean. But as games grow, placement triggers many side effects: update the UI, play a sound, check achievements, log analytics, update an AI budget system.

**The naive approach** is to put all of that inside `placeTower()`:

```ts
function placeTower(tile: Tile): void {
  const tower = new BasicTower(tile);
  towers.push(tower);
  scene.add(tower.mesh);
  tile.occupied = true;

  // now also...
  updateHUD();        // couples placeTower to the HUD
  playSound();        // couples placeTower to audio
  checkAchievements(); // couples placeTower to achievement system
  logAnalytics();     // couples placeTower to analytics
}
```

This is called **tight coupling**: `placeTower` now depends on all those other systems. If `updateHUD()` is renamed, `placeTower` breaks. If you want to disable analytics, you edit `placeTower`. The function that places a tower now knows far too much about the rest of the game.

---

### Concept: The Observer Pattern — Loose Coupling

The Observer pattern solves this by separating two roles:

- **Publisher (also called Subject or Emitter):** Announces that something happened. It does not know or care who is listening.
- **Subscriber (also called Observer or Listener):** Registers interest in a specific event. When the event fires, the subscriber's callback runs.

```
placeTower() ──── emits 'towerPlaced' ──────►  EventEmitter
                                                     │
                                              for each listener
                                                     │
                                         ┌───────────┴────────────┐
                                         ▼                        ▼
                                    HUD.update()           (future: sound)
```

`placeTower()` only needs to call `gameEvents.emit('towerPlaced', tower)`. It does not know that a HUD exists. The HUD only needs to call `gameEvents.on('towerPlaced', callback)`. It does not know that `placeTower` exists.

**You will see this pattern in:** DOM events (`addEventListener`), Node.js `EventEmitter`, React's `useEffect` with subscriptions, RxJS, Redux, every game engine's event system, and network socket APIs.

---

### Concept: `private` — Hiding Implementation Details

You have seen `readonly`, which prevents reassignment. `private` goes further: it makes a property or method invisible outside the class.

```ts
class EventEmitter {
  private listeners: Map<string, Array<(data: unknown) => void>> = new Map();
  //      ───────── cannot be accessed outside EventEmitter at all

  on(eventName: string, callback: (data: unknown) => void): void {
    // 'this.listeners' is accessible here — inside the class
  }

  emit(eventName: string, data: unknown): void {
    // 'this.listeners' is accessible here too
  }
}

const emitter = new EventEmitter();
emitter.listeners; // ← TypeScript ERROR: Property 'listeners' is private
emitter.on('event', cb); // ← fine — 'on' is public
```

**Why private:** `listeners` is an internal bookkeeping structure. Nothing outside `EventEmitter` needs to read or write it directly. Making it private means: if you ever change how listeners are stored internally (maybe switch from `Map` to an object, or add deduplication), no external code breaks — because no external code was allowed to touch it.

**The rule of thumb:** Start everything `private`. Make it `public` (or `readonly`) only when external code genuinely needs it.

---

### Concept: `Map<K, V>` — A Key-to-Value Store

A `Map` is a data structure that stores pairs: each **key** maps to a **value**. You look up a value by its key, like a dictionary.

```ts
const phoneBook = new Map<string, string>();
phoneBook.set('Alice', '555-1234');
phoneBook.set('Bob',   '555-5678');

phoneBook.get('Alice');        // '555-1234'
phoneBook.get('Nobody');       // undefined
phoneBook.has('Bob');          // true
```

**Compared to an array:**
- Array: values stored at *numeric* positions — `arr[0]`, `arr[1]`
- Map: values stored at *any key* — `map.get('towerPlaced')`, `map.get('towerRemoved')`

**In the EventEmitter:**

```ts
Map<string, Array<(data: unknown) => void>>
//  ──────  ──────────────────────────────
//  key     value
//  event   list of callbacks registered for that event
```

The key is the event name (a string like `'towerPlaced'`). The value is an array of callback functions — all the functions that have subscribed to that event name.

**The three Map operations you will use:**

| Operation | What it does |
|---|---|
| `map.has(key)` | Returns `true` if the key exists |
| `map.get(key)` | Returns the value, or `undefined` if the key is not there |
| `map.set(key, value)` | Stores the value at that key (overwrites if key exists) |

---

### Concept: `unknown` vs `any`

The callbacks in the `EventEmitter` receive `data: unknown`. You have not seen `unknown` before.

**`any`** turns off type-checking entirely. A value of type `any` can be passed to any function, used as any type, and TypeScript will never complain — but you lose all safety.

**`unknown`** is the safe alternative: a value of type `unknown` *could be anything*, but TypeScript will not let you use it until you prove what it is. It is the honest version of `any`.

In the EventEmitter:
```ts
type Callback = (data: unknown) => void;
```

Each event listener receives `data` but the EventEmitter itself does not know what type `data` is for every possible event. Using `unknown` says: "this data could be anything — the individual listener is responsible for knowing what it expects."

For the HUD callback, the data will be a `Tower`, but since we are writing a general-purpose emitter, we accept `unknown` at the emitter level.

---

### Concept: Function Types

You have used functions before, but you are about to store them in a data structure. In TypeScript, functions have types just like numbers and strings do.

```ts
// A function that takes a number and returns void:
type NumberCallback = (value: number) => void;

// A function that takes a string and returns boolean:
type StringPredicate = (s: string) => boolean;

// Our event callback — takes unknown data, returns nothing:
type EventCallback = (data: unknown) => void;
```

When you write `callbacks.push(callback)`, you are storing a function in an array. When you later write `callback(data)`, you are calling it. Functions are values — they can be stored, passed, and called like any other value.

---

### Concept: DOM Manipulation with `document.createElement`

Three.js renders into a `<canvas>` element. HTML elements can be layered on top of a canvas using CSS absolute positioning. The browser draws the canvas first, then draws HTML elements on top.

```ts
const hud = document.createElement('div');
//    ───   ──────────────────────── ─────
//    name  creates a new HTML element   tag name — like writing <div> in HTML

hud.style.position = 'absolute'; // taken out of normal document flow
hud.style.top = '16px';          // 16px from the top of the nearest positioned parent
hud.style.left = '16px';         // 16px from the left
hud.style.color = 'white';       // text color
hud.style.fontSize = '18px';     // text size
hud.style.fontFamily = 'monospace';
hud.style.pointerEvents = 'none'; // clicks pass through to the canvas beneath

hud.textContent = 'Towers: 0';   // the text shown inside the div

document.body.appendChild(hud);  // attach it to the page — now it is visible
```

**`style.position = 'absolute'`:** Removes the element from the normal document flow. Its position is now relative to its nearest ancestor that has `position: relative` or `position: absolute`. We will set the wrapper `<div>` around the canvas to `position: relative`, which makes the canvas and HUD stack together.

**`pointerEvents: 'none'`:** Without this, the HUD div would block mouse clicks from reaching the canvas. Setting this to `'none'` makes the div invisible to the mouse — clicks pass straight through to whatever is underneath.

**`textContent`:** Sets or replaces the text inside an element. Every time the tower count changes, you will do `hud.textContent = 'Towers: ' + count`.

---

## Step 2 — Write the EventEmitter Class

Open `src/main.ts`. You will add the `EventEmitter` class near the top, after the `Tower`-related classes and before the grid setup code.

---

### 2a — Define the callback type alias and the class skeleton

Find this line in your file (it is near the top, after the imports):

```ts
// --- Grid Types ---
```

Add the following **above** that comment:

```ts
// --- Event System ---

type EventCallback = (data: unknown) => void;

class EventEmitter {
  private listeners: Map<string, Array<EventCallback>> = new Map();

  on(eventName: string, callback: EventCallback): void {

  }

  emit(eventName: string, data: unknown): void {

  }
}
```

**Line by line:**

`type EventCallback = (data: unknown) => void;`
A type alias for "a function that takes one argument of type `unknown` and returns nothing." You could write this type inline everywhere it appears, but naming it `EventCallback` makes the intent clear and saves repetition.

`class EventEmitter {`
A standard class declaration. No `abstract`, no `extends` — a plain, concrete, instantiatable class.

`private listeners: Map<string, Array<EventCallback>> = new Map();`
The internal store. It is `private` — nothing outside the class can touch it.
- `Map<string, Array<EventCallback>>`: a Map whose keys are strings (event names) and whose values are arrays of callbacks
- `= new Map()` initializes it to an empty Map immediately — no callbacks registered yet

`on(eventName: string, callback: EventCallback): void {}`
Public method for subscribing. Takes the event name and the function to call when that event fires.

`emit(eventName: string, data: unknown): void {}`
Public method for publishing. Takes the event name and the data to pass to each listener.

> **SAVE AND TRY:** The class compiles with two empty methods. No errors expected yet — save, check the Vite terminal for TypeScript errors, confirm none appear.

---

### 2b — Implement `on()`

Fill in the `on` method:

```ts
on(eventName: string, callback: EventCallback): void {
  if (!this.listeners.has(eventName)) {
    this.listeners.set(eventName, []);
  }
  const callbacks = this.listeners.get(eventName)!;
  callbacks.push(callback);
}
```

**Line by line:**

`if (!this.listeners.has(eventName)) {`
Checks whether this event name already has an entry in the Map. If not, we need to create one before we can push into it.

`this.listeners.set(eventName, []);`
Creates an empty array for this event name. Now `this.listeners.get(eventName)` will return `[]` instead of `undefined`.

`const callbacks = this.listeners.get(eventName)!;`
Retrieves the array. The `!` at the end is the *non-null assertion operator* — it tells TypeScript "I know this cannot be `undefined` here." We just guaranteed it exists in the `if` block above, so this is safe. Without the `!`, TypeScript would complain that `get()` might return `undefined`.

`callbacks.push(callback);`
Adds the new callback to the end of the array. Next time `emit` is called with this event name, this callback will run.

**What this looks like in memory after two subscriptions:**

```
listeners (Map):
  'towerPlaced'  →  [ hudUpdateCallback, soundCallback ]
  'towerRemoved' →  [ hudUpdateCallback ]
```

> **SAVE AND TRY:** Still no visible change in the browser. Save, confirm no TypeScript errors.

---

### 2c — Implement `emit()`

Fill in the `emit` method:

```ts
emit(eventName: string, data: unknown): void {
  if (!this.listeners.has(eventName)) {
    return;
  }
  const callbacks = this.listeners.get(eventName)!;
  callbacks.forEach((callback) => {
    callback(data);
  });
}
```

**Line by line:**

`if (!this.listeners.has(eventName)) { return; }`
If nothing has subscribed to this event, there is nothing to do. Return early.

`const callbacks = this.listeners.get(eventName)!;`
Retrieve the array of callbacks. The `!` is safe again — we checked `has()` in the line above.

`callbacks.forEach((callback) => {`
`Array.forEach` is a method that runs a function once for each element of an array. Here, `callback` is each function stored in the array.

`callback(data);`
Calls the function, passing `data` as its argument. If five callbacks are registered for this event, this line executes five times — once per callback.

**The full flow when `emit('towerPlaced', tower)` is called:**
1. Look up `'towerPlaced'` in the Map
2. Get its array: `[ hudCallback ]`
3. Call `hudCallback(tower)`
4. The HUD updates

> **SAVE AND TRY:** Still no visible change — the emitter exists but nothing uses it yet. No TypeScript errors expected.

---

## Step 3 — Create the Game Event Emitter Instance

After the `EventEmitter` class declaration (still in the `// --- Event System ---` section), add one line:

```ts
const gameEvents = new EventEmitter();
```

This is the single shared event bus for the whole game. Any code that wants to publish or subscribe to game events goes through this one instance.

**Why one instance?** Because all publishers and subscribers need to be connected to the same emitter. If `placeTower` emits to one instance and the HUD listens on a different instance, no messages are delivered.

> **SAVE AND TRY:** `gameEvents` is now available everywhere in the file. No visible change. No errors.

---

## Step 4 — Emit Events from `placeTower` and `removeTower`

Find your `placeTower` function. It currently looks like this:

```ts
function placeTower(tile: Tile): void {
  const tower: Tower = activeTowerType === 'basic'
    ? new BasicTower(tile)
    : new SniperTower(tile);
  towers.push(tower);
  scene.add(tower.mesh);
  tile.occupied = true;
}
```

Add one line at the end:

```ts
function placeTower(tile: Tile): void {
  const tower: Tower = activeTowerType === 'basic'
    ? new BasicTower(tile)
    : new SniperTower(tile);
  towers.push(tower);
  scene.add(tower.mesh);
  tile.occupied = true;
  gameEvents.emit('towerPlaced', tower);  // ← add this
}
```

Find your `removeTower` function. It currently looks like this:

```ts
function removeTower(tile: Tile): void {
  const index = towers.findIndex((t) => t.tile === tile);
  if (index === -1) return;
  const tower = towers[index];
  tower.dispose(scene);
  towers.splice(index, 1);
  tile.occupied = false;
}
```

Add one line at the end:

```ts
function removeTower(tile: Tile): void {
  const index = towers.findIndex((t) => t.tile === tile);
  if (index === -1) return;
  const tower = towers[index];
  tower.dispose(scene);
  towers.splice(index, 1);
  tile.occupied = false;
  gameEvents.emit('towerRemoved', tower);  // ← add this
}
```

**What this does:** `placeTower` and `removeTower` now announce what happened after they do their work. They do not know who is listening. They do not call `updateHUD()` directly. They just broadcast — and walk away.

> **SAVE AND TRY:** Place and remove towers. The browser console should show no errors. The HUD does not exist yet, so nothing visual changes — but the events are being emitted into the void. That is fine.

---

## Step 5 — Build the HUD

Now you will create the subscriber — the HUD that listens for the events and updates the screen.

---

### 5a — Wrap the canvas in a positioned container

The HUD `<div>` needs to float over the canvas. For `position: absolute` to work correctly, the `<div>` must be inside a parent that has `position: relative`. The canvas is currently a direct child of `document.body` with no parent container.

Open `index.html`. It currently looks like this:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Grid Commander</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background: #1a1a2e; overflow: hidden; }
    </style>
  </head>
  <body>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Add a wrapper `<div>` and style it. Replace the `<body>` section:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Grid Commander</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background: #1a1a2e; overflow: hidden; }
      #game-container {
        position: relative;
        display: inline-block;
      }
    </style>
  </head>
  <body>
    <div id="game-container"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

**What changed:**
- Added a `<div id="game-container">` — an empty container element
- `position: relative` makes it the reference point for absolutely-positioned children
- `display: inline-block` makes it shrink to fit the canvas inside it (instead of stretching full-width)

> **CSS AND SEE:** Save `index.html` and check the browser. The game should look identical — the wrapper `<div>` is invisible, but it is now in the DOM as the canvas's parent (you will move the canvas into it in the next step).

---

### 5b — Move the canvas into the container

In `src/main.ts`, find where the renderer is created and appended to the body. It currently looks like this:

```ts
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
```

Change it to append to the container instead:

```ts
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const container = document.getElementById('game-container')!;
container.appendChild(renderer.domElement);
```

**Line by line:**

`document.getElementById('game-container')`
Searches the entire HTML document for the element whose `id` attribute is `'game-container'`. Returns the element, or `null` if nothing was found.

`!`
Non-null assertion. We know the element exists because we just put it in `index.html`. TypeScript's return type for `getElementById` is `HTMLElement | null` — the `!` says "trust me, it is not null."

`container.appendChild(renderer.domElement)`
Appends the canvas inside `#game-container` instead of directly in `<body>`.

> **SAVE AND TRY:** The game should look and behave exactly the same. The canvas is now inside the container. No visual change expected yet.

---

### 5c — Create the HUD element

After the line `container.appendChild(renderer.domElement)`, add:

```ts
const hudEl = document.createElement('div');
hudEl.style.position = 'absolute';
hudEl.style.top = '16px';
hudEl.style.left = '16px';
hudEl.style.color = 'white';
hudEl.style.fontSize = '18px';
hudEl.style.fontFamily = 'monospace';
hudEl.style.pointerEvents = 'none';
hudEl.style.textShadow = '1px 1px 2px black';
hudEl.textContent = 'Towers: 0';
container.appendChild(hudEl);
```

**Line by line:**

`document.createElement('div')`
Creates a new `<div>` element in memory. It is not attached to the page yet — it exists but is invisible.

`hudEl.style.position = 'absolute'`
Positions the element relative to `#game-container` (its nearest ancestor with `position: relative`).

`hudEl.style.top = '16px'` / `hudEl.style.left = '16px'`
Places the top-left corner of the HUD 16 pixels from the top-left corner of the container.

`hudEl.style.pointerEvents = 'none'`
Makes the element transparent to mouse events. Without this, the HUD div would intercept clicks intended for the Three.js canvas beneath it.

`hudEl.style.textShadow = '1px 1px 2px black'`
Adds a subtle dark outline behind the text. Without this, white text on a bright tile might be hard to read.

`hudEl.textContent = 'Towers: 0'`
Sets the initial displayed text.

`container.appendChild(hudEl)`
Attaches the element to the page, inside `#game-container`. Now it is visible.

> **CSS AND SEE:** Save and check the browser. You should see **"Towers: 0"** in white monospace text in the top-left corner of the game, floating over the grid. Place a tower — the counter does not update yet.

---

### 5d — Subscribe to game events

Now wire the HUD to the event system. Add the following after the HUD element setup code:

```ts
gameEvents.on('towerPlaced', () => {
  hudEl.textContent = 'Towers: ' + towers.length;
});

gameEvents.on('towerRemoved', () => {
  hudEl.textContent = 'Towers: ' + towers.length;
});
```

**Line by line:**

`gameEvents.on('towerPlaced', () => {`
Calls the `on` method on the shared emitter. Registers an arrow function as a listener for the `'towerPlaced'` event.

`hudEl.textContent = 'Towers: ' + towers.length;`
`towers` is the array that holds all currently placed towers. `towers.length` is the number of elements in it. After a tower is placed, `towers.length` is already updated (we emit after pushing), so this reads the correct value. The `+` joins the string and number together.

`gameEvents.on('towerRemoved', () => { ... })`
Same thing for removal. After a tower is removed, `towers.length` is already decremented (we emit after splicing).

**Notice the callbacks ignore their `data` parameter.** The HUD does not care about which tower was placed — only how many there are total. So it reads from the `towers` array directly. The `data` argument is available if you need it, but you do not have to use it.

> **SAVE AND TRY:** Save and switch to the browser. Place a tower — the counter should immediately read **"Towers: 1"**. Place more — it increments. Remove one — it decrements. The counter is live.

---

## Step 6 — Verify Everything Together

Take a moment to trace the full path of a single tower placement, from click to counter update:

1. You click a tile
2. `onClick` fires → calls `placeTower(tile)`
3. `placeTower` creates the tower, pushes it to `towers`, adds its mesh to the scene, marks the tile occupied
4. `placeTower` calls `gameEvents.emit('towerPlaced', tower)`
5. `EventEmitter.emit` looks up `'towerPlaced'` in the Map, finds the array with one callback
6. It calls `callback(tower)`
7. The callback reads `towers.length` and writes `'Towers: 3'` to `hudEl.textContent`
8. The browser re-renders the text in the top-left corner

**Five separate concerns, zero of them knowing about each other:**
- `placeTower` does not import or call `updateHUD`
- The HUD callback does not import or call `placeTower`
- `EventEmitter` knows nothing about towers or HUDs
- `Tower` class knows nothing about events or the DOM
- `Tile` knows nothing about any of this

> **SAVE AND TRY:** Play through the full sequence: place both tower types, remove some, confirm the counter is always accurate. Try placing on an occupied tile (nothing should happen). Try orbit-dragging — the counter should not change accidentally.

---

## Step 7 — Add a Tower Type Indicator to the HUD

While you are here, it would be helpful to show the currently selected tower type in the HUD as well. This is a small change that demonstrates how multiple pieces of state can flow through the same event system — or in this case, through a shared update function.

---

### 7a — Create an update function

Replace the two separate `gameEvents.on` subscriptions with a named function and use it in both:

```ts
function updateHUD(): void {
  const typeLabel = activeTowerType === 'basic' ? 'Basic [1]' : 'Sniper [2]';
  hudEl.textContent = 'Towers: ' + towers.length + '  |  ' + typeLabel;
}

gameEvents.on('towerPlaced', () => { updateHUD(); });
gameEvents.on('towerRemoved', () => { updateHUD(); });

updateHUD();
```

**What changed:**

`function updateHUD(): void {`
Extracts the HUD update logic into a named function. Both event listeners now call it. The function itself reads from `activeTowerType` and `towers.length` — it always reflects current state whenever called.

`const typeLabel = activeTowerType === 'basic' ? 'Basic [1]' : 'Sniper [2]';`
A ternary that picks a display string based on which tower type is selected.

`hudEl.textContent = 'Towers: ' + towers.length + '  |  ' + typeLabel;`
The `|` character is used as a separator. The resulting text looks like: `Towers: 2  |  Sniper [2]`

`updateHUD();`
Calls the function once immediately, so the HUD shows the correct initial state when the page loads (before any tower is placed).

> **SAVE AND TRY:** The HUD should now show both the tower count and the selected type. Press `1` — the count does not update (no event is emitted for type changes). You will fix that next.

---

### 7b — Emit a type-change event

The HUD does not update when you switch tower types because nothing emits an event for that. Find the `keydown` event listener:

```ts
window.addEventListener('keydown', (event) => {
  if (event.key === '1') activeTowerType = 'basic';
  if (event.key === '2') activeTowerType = 'sniper';
});
```

Change it to:

```ts
window.addEventListener('keydown', (event) => {
  if (event.key === '1') {
    activeTowerType = 'basic';
    gameEvents.emit('typeChanged', activeTowerType);
  }
  if (event.key === '2') {
    activeTowerType = 'sniper';
    gameEvents.emit('typeChanged', activeTowerType);
  }
});
```

Then add a subscriber for `'typeChanged'` alongside the others:

```ts
gameEvents.on('typeChanged', () => { updateHUD(); });
```

> **SAVE AND TRY:** Press `1` and `2`. The HUD should update immediately to reflect the selected type. Place towers of each type. The count and type label should always be accurate.

---

## Step 8 — Understand What You Built

Here is the final event system architecture in the game:

```
Publishers                    EventEmitter             Subscribers
─────────────────────────────────────────────────────────────────
placeTower()  ──── 'towerPlaced'  ──────────────►  updateHUD()
removeTower() ──── 'towerRemoved' ──────────────►  updateHUD()
keydown       ──── 'typeChanged'  ──────────────►  updateHUD()
```

Three separate locations in the code announce what happened. One function reacts. None of them are coupled together. Adding a second subscriber (like a sound player) requires zero changes to the publishers:

```ts
// This is all it takes to add audio — no changes to placeTower or removeTower:
gameEvents.on('towerPlaced', () => { playSound('place'); });
```

---

## Challenges

---

**Challenge 1 — Tower Type Counter**

Instead of a single total count, show a breakdown: `Basic: 2  |  Sniper: 1`.

Hints:
- You need to count how many towers in the `towers` array are `BasicTower` instances vs `SniperTower` instances
- `instanceof` lets you check the runtime type of an object
- `Array.filter` returns a new array containing only the elements that pass a test

<details>
<summary>Solution</summary>

```ts
function updateHUD(): void {
  const basicCount = towers.filter((t) => t instanceof BasicTower).length;
  const sniperCount = towers.filter((t) => t instanceof SniperTower).length;
  const typeLabel = activeTowerType === 'basic' ? 'Basic [1]' : 'Sniper [2]';
  hudEl.textContent =
    'Basic: ' + basicCount +
    '  Sniper: ' + sniperCount +
    '  |  ' + typeLabel;
}
```

`towers.filter((t) => t instanceof BasicTower)` returns a new array containing only the towers that are `BasicTower` instances. `.length` counts them. No changes needed anywhere else — the HUD function is the only thing that changes.

</details>

---

**Challenge 2 — Event History Log**

Add a second HUD element in the bottom-left corner that shows the last three events as a log, like:

```
+ Basic Tower placed
+ Sniper Tower placed
- Basic Tower removed
```

Hints:
- Create a second `div` element, positioned at `bottom: '16px'` and `left: '16px'`
- Maintain an array of recent log entries (max 3)
- On each event, push a new string, trim the array to the last 3 entries, and set `textContent`
- `Array.join('\n')` joins array elements with newline characters

<details>
<summary>Solution</summary>

```ts
const logEl = document.createElement('div');
logEl.style.position = 'absolute';
logEl.style.bottom = '16px';
logEl.style.left = '16px';
logEl.style.color = '#aabbcc';
logEl.style.fontSize = '14px';
logEl.style.fontFamily = 'monospace';
logEl.style.pointerEvents = 'none';
logEl.style.textShadow = '1px 1px 2px black';
logEl.style.lineHeight = '1.6';
container.appendChild(logEl);

const eventLog: string[] = [];

function addLogEntry(message: string): void {
  eventLog.push(message);
  if (eventLog.length > 3) {
    eventLog.splice(0, 1); // remove the oldest entry
  }
  logEl.textContent = eventLog.join('\n');
}

gameEvents.on('towerPlaced', (data) => {
  const tower = data as Tower;
  const typeName = tower instanceof BasicTower ? 'Basic' : 'Sniper';
  addLogEntry('+ ' + typeName + ' Tower placed');
});

gameEvents.on('towerRemoved', (data) => {
  const tower = data as Tower;
  const typeName = tower instanceof BasicTower ? 'Basic' : 'Sniper';
  addLogEntry('- ' + typeName + ' Tower removed');
});
```

`data as Tower` is a *type assertion* — you tell TypeScript to treat `data` (type `unknown`) as a `Tower`. This is safe here because you are the one who emitted the event and you know what you passed as `data`.

`eventLog.splice(0, 1)` removes 1 element starting at index 0 — the oldest entry.

</details>

---

**Challenge 3 — Extend the EventEmitter with `off()`**

Add an `off(eventName, callback)` method to `EventEmitter` that removes a specific callback from the listeners list.

Hints:
- Use `Array.filter` to create a new array that excludes the target callback
- Store the filtered array back into the Map with `this.listeners.set(eventName, filtered)`
- Comparing functions: two function variables are equal (`===`) only if they reference the exact same function object

<details>
<summary>Solution</summary>

```ts
off(eventName: string, callback: EventCallback): void {
  if (!this.listeners.has(eventName)) {
    return;
  }
  const callbacks = this.listeners.get(eventName)!;
  const filtered = callbacks.filter((cb) => cb !== callback);
  this.listeners.set(eventName, filtered);
}
```

**Usage:**
```ts
const myHandler = () => { updateHUD(); };
gameEvents.on('towerPlaced', myHandler);

// Later, to stop listening:
gameEvents.off('towerPlaced', myHandler);
```

**Important:** The callback must be stored in a variable. An anonymous arrow function `() => {}` creates a new object each time — two arrow functions written identically are not `===` to each other because they are different objects in memory.

</details>

---

## Quick Check Answers

1. **Where would HUD/sound/achievement code go with the current design?** It would all go inside `placeTower()`. The function would grow to include every side effect of placement, making it responsible for things it should not know about (UI, audio, achievements). This is the tight-coupling problem the Observer pattern solves.

2. **What is being observed?** The act of placing or removing a tower. The observers are the HUD callback (and in principle, any other system that subscribes). The emitter plays the role of a message board: it does not pick who reads the messages, it just posts them.

3. **The radio station analogy — what is the advantage?** Neither side needs to know about the other. The radio station keeps broadcasting regardless of how many radios exist or what they do with the signal. A new radio can start listening without the station needing to be updated. You can remove a radio without affecting the station. This is exactly how `gameEvents.on` works — you can add or remove subscribers without touching the publishers.

---

## Final Check

Verify each item before moving on:

| # | Check | Expected result |
|---|---|---|
| 1 | Page loads | HUD shows `Towers: 0  |  Basic [1]` |
| 2 | Press `2` | HUD updates to `Towers: 0  |  Sniper [2]` without placing anything |
| 3 | Click an empty tile | Tower appears, HUD shows `Towers: 1` |
| 4 | Place 3 more towers | HUD shows `Towers: 4` |
| 5 | Click an occupied tile | Tower removed, HUD decrements correctly |
| 6 | Orbit drag the camera | Tower count does not change |
| 7 | Press `1`, place a tower, press `2`, place a tower | Both tower types appear, counts are correct |
| 8 | TypeScript terminal | Zero errors |

---

## How the Observer Pattern Scales

You have now seen the Observer pattern in its simplest form — a hand-written `EventEmitter`. In production code, you will encounter it everywhere:

- **DOM:** `element.addEventListener('click', handler)` is the Observer pattern built into the browser
- **Node.js:** The built-in `EventEmitter` class works exactly like the one you wrote
- **React:** `useEffect` subscribes to state changes; the cleanup function is `off()`
- **Redux:** `store.subscribe(callback)` is the Observer pattern
- **Databases:** Change data capture (CDC) systems emit events when rows change
- **Microservices:** A message queue (Kafka, RabbitMQ) is the Observer pattern at distributed scale

Every time you see "subscribe," "listen," "on," "watch," or "observe" in a library — that is this pattern.

---

## Complete File Listing

Your `src/main.ts` should match this exactly at the end of Lab 10.

```ts
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Event System ---

type EventCallback = (data: unknown) => void;

class EventEmitter {
  private listeners: Map<string, Array<EventCallback>> = new Map();

  on(eventName: string, callback: EventCallback): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    const callbacks = this.listeners.get(eventName)!;
    callbacks.push(callback);
  }

  emit(eventName: string, data: unknown): void {
    if (!this.listeners.has(eventName)) {
      return;
    }
    const callbacks = this.listeners.get(eventName)!;
    callbacks.forEach((callback) => {
      callback(data);
    });
  }
}

const gameEvents = new EventEmitter();

// --- Grid Types ---

interface Tile {
  row: number;
  col: number;
  walkable: boolean;
  occupied: boolean;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
}

// --- Tower Types ---

interface TowerConfig {
  topRadius: number;
  bottomRadius: number;
  height: number;
  color: number;
  range: number;
}

abstract class Tower {
  readonly tile: Tile;
  readonly mesh: THREE.Mesh;
  readonly range: number;

  constructor(tile: Tile, config: TowerConfig) {
    this.tile = tile;
    this.range = config.range;

    const geometry = new THREE.CylinderGeometry(
      config.topRadius,
      config.bottomRadius,
      config.height,
      8
    );
    const material = new THREE.MeshStandardMaterial({ color: config.color });
    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.position.x = tile.mesh.position.x;
    this.mesh.position.y = config.height / 2;
    this.mesh.position.z = tile.mesh.position.z;
  }

  dispose(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}

class BasicTower extends Tower {
  constructor(tile: Tile) {
    super(tile, {
      topRadius: 0.25,
      bottomRadius: 0.35,
      height: 1.2,
      color: 0x3355ff,
      range: 1.5,
    });
  }
}

class SniperTower extends Tower {
  constructor(tile: Tile) {
    super(tile, {
      topRadius: 0.15,
      bottomRadius: 0.20,
      height: 2.2,
      color: 0x778899,
      range: 3.5,
    });
  }
}

type TowerType = 'basic' | 'sniper';

// --- Constants ---

const GRID_ROWS = 8;
const GRID_COLS = 8;
const TILE_SIZE = 1;
const TILE_GAP = 0.05;
const GRID_OFFSET_X = -(GRID_COLS * TILE_SIZE) / 2 + TILE_SIZE / 2;
const GRID_OFFSET_Z = -(GRID_ROWS * TILE_SIZE) / 2 + TILE_SIZE / 2;
const DRAG_THRESHOLD_PX = 5;

const COLOR_TILE_LIGHT = 0x4a7c59;
const COLOR_TILE_DARK = 0x2d5a3d;
const COLOR_SELECTED = 0xffdd44;

// --- Renderer ---

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const container = document.getElementById('game-container')!;
container.appendChild(renderer.domElement);

// --- HUD ---

const hudEl = document.createElement('div');
hudEl.style.position = 'absolute';
hudEl.style.top = '16px';
hudEl.style.left = '16px';
hudEl.style.color = 'white';
hudEl.style.fontSize = '18px';
hudEl.style.fontFamily = 'monospace';
hudEl.style.pointerEvents = 'none';
hudEl.style.textShadow = '1px 1px 2px black';
hudEl.textContent = 'Towers: 0';
container.appendChild(hudEl);

// --- Scene ---

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

// --- Camera ---

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 10, 8);

// --- Lights ---

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// --- Controls ---

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 4;
controls.maxDistance = 20;
controls.maxPolarAngle = Math.PI / 2.2;

// --- Grid ---

const grid: Tile[][] = [];

for (let row = 0; row < GRID_ROWS; row++) {
  grid[row] = [];
  for (let col = 0; col < GRID_COLS; col++) {
    const geometry = new THREE.PlaneGeometry(
      TILE_SIZE - TILE_GAP,
      TILE_SIZE - TILE_GAP
    );
    const material = new THREE.MeshStandardMaterial({
      color: (row + col) % 2 === 0 ? COLOR_TILE_LIGHT : COLOR_TILE_DARK,
    });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.x = GRID_OFFSET_X + col * TILE_SIZE;
    mesh.position.z = GRID_OFFSET_Z + row * TILE_SIZE;

    scene.add(mesh);

    const tile: Tile = {
      row,
      col,
      walkable: true,
      occupied: false,
      mesh,
      material,
    };

    mesh.userData['tile'] = tile;
    grid[row][col] = tile;
  }
}

// --- State ---

const towers: Tower[] = [];
let activeTowerType: TowerType = 'basic';

// --- Tower Logic ---

function placeTower(tile: Tile): void {
  const tower: Tower =
    activeTowerType === 'basic' ? new BasicTower(tile) : new SniperTower(tile);
  towers.push(tower);
  scene.add(tower.mesh);
  tile.occupied = true;
  gameEvents.emit('towerPlaced', tower);
}

function removeTower(tile: Tile): void {
  const index = towers.findIndex((t) => t.tile === tile);
  if (index === -1) return;
  const tower = towers[index];
  tower.dispose(scene);
  towers.splice(index, 1);
  tile.occupied = false;
  gameEvents.emit('towerRemoved', tower);
}

// --- HUD Logic ---

function updateHUD(): void {
  const typeLabel = activeTowerType === 'basic' ? 'Basic [1]' : 'Sniper [2]';
  hudEl.textContent = 'Towers: ' + towers.length + '  |  ' + typeLabel;
}

gameEvents.on('towerPlaced', () => { updateHUD(); });
gameEvents.on('towerRemoved', () => { updateHUD(); });
gameEvents.on('typeChanged', () => { updateHUD(); });

updateHUD();

// --- Raycaster ---

const raycaster = new THREE.Raycaster();

function getTileBaseColor(tile: Tile): number {
  return (tile.row + tile.col) % 2 === 0 ? COLOR_TILE_LIGHT : COLOR_TILE_DARK;
}

// --- Input ---

let mouseDownX = 0;
let mouseDownY = 0;

renderer.domElement.addEventListener('mousedown', (event) => {
  mouseDownX = event.clientX;
  mouseDownY = event.clientY;
});

renderer.domElement.addEventListener('click', (event) => {
  const dx = event.clientX - mouseDownX;
  const dy = event.clientY - mouseDownY;
  if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD_PX) return;

  const ndcX = (event.clientX / window.innerWidth) * 2 - 1;
  const ndcY = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

  const tileMeshes = grid.flat().map((t) => t.mesh);
  const hits = raycaster.intersectObjects(tileMeshes);
  if (hits.length === 0) return;

  const tile = hits[0].object.userData['tile'] as Tile;

  if (tile.occupied) {
    removeTower(tile);
  } else {
    placeTower(tile);
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === '1') {
    activeTowerType = 'basic';
    gameEvents.emit('typeChanged', activeTowerType);
  }
  if (event.key === '2') {
    activeTowerType = 'sniper';
    gameEvents.emit('typeChanged', activeTowerType);
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Game Loop ---

const clock = new THREE.Clock();
const MAX_DELTA = 0.1;

function update(deltaTime: number): void {
  controls.update();
  void deltaTime;
}

function render(): void {
  renderer.render(scene, camera);
}

function animate(): void {
  requestAnimationFrame(animate);
  const rawDelta = clock.getDelta();
  const deltaTime = Math.min(rawDelta, MAX_DELTA);
  update(deltaTime);
  render();
}

animate();
```

---

> **Lab 11 Preview:** The game currently has no enemies — nothing moves. Lab 11 introduces the Enemy entity: a simple sphere that follows a path across the grid from one side to the other. You will define a path as an array of grid coordinates, create an `Enemy` class that moves along it using delta time, and see how the game loop's `update(deltaTime)` function becomes the heartbeat of all moving things in the game.

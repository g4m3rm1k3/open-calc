# Mario Platformer Series — Overview
## TypeScript · Phaser 3 · OOP · 2D Physics · Tilemaps

**Prerequisite series:** Tetris V3 (or equivalent TypeScript + OOP experience).
You know: classes, interfaces, generics, access modifiers, type annotations.
This series does not re-teach TypeScript fundamentals — it teaches what Phaser
adds on top and why.

**After this series:** Metroid clone (same engine, adds room-based world,
ability gating, persistent map state).

---

## What Phaser Adds (That Raw Canvas Cannot Do)

In Tetris V3 you drew everything manually: `ctx.fillRect`, your own game loop,
your own collision math. For a platformer that is impractical — the physics,
tilemap rendering, sprite batching, and input system would each be a multi-lab
series on their own. Phaser 3 provides all of these as a library.

**What Phaser abstracts away:**

| What you would write from scratch | What Phaser gives you |
|---|---|
| requestAnimationFrame loop + delta time | `Phaser.Scene.update(time, delta)` |
| WebGL/Canvas draw calls for every sprite | `Phaser.GameObjects.Sprite` with batched rendering |
| AABB collision detection and response | `Phaser.Physics.Arcade` — gravity, velocity, colliders |
| Spritesheet frame parsing + animation state | `Phaser.Animations.AnimationManager` |
| Tilemap grid → thousands of sprites | `Phaser.Tilemaps.Tilemap` |
| Camera viewport math + world bounds | `Phaser.Cameras.Scene2D.Camera` |
| Asset loading with progress feedback | `Phaser.Loader.LoaderPlugin` |

**What Phaser does NOT do for you:**
Game logic, player state machines, enemy behavior, scoring, level progression,
and UI — all of that is your code. Phaser is the engine; you are the game.

---

## The 12 Labs

| Lab | Title | Phaser concept | OOP concept | Math / Physics |
|-----|-------|----------------|-------------|----------------|
| 01 | Project Setup + First Scene | `Phaser.Game`, `Scene` lifecycle | — | Coordinate system (y-down) |
| 02 | Ground and Arcade Physics | `ArcadePhysics`, `StaticGroup` | — | Gravity as constant acceleration, AABB collision |
| 03 | The Player Class | `Arcade.Sprite`, `add.existing` | `class Player extends Phaser.Physics.Arcade.Sprite` | Velocity impulse vs continuous force |
| 04 | Keyboard Controls + Jumping | `CursorKeys`, `onFloor()` | Player encapsulates its own input handling | Horizontal velocity, jump impulse, air control |
| 05 | Tilemaps — Building the World | `Tilemap`, `TilemapLayer` | — | Tile → pixel coordinate conversion, collision layer |
| 06 | Sprite Animations | `AnimationManager`, `anims.create` | `PlayerAnimState` enum, state machine | — |
| 07 | The Camera | `camera.setBounds`, `startFollow` | — | World space vs screen space, viewport offset |
| 08 | The Enemy Class | `Arcade.Sprite` reuse | `class Enemy extends Phaser.Physics.Arcade.Sprite` | Patrol velocity, stomp detection (relative Y velocity) |
| 09 | Collectibles — Coins | `StaticGroup`, `overlap` | Factory method for coin creation | DSA: StaticGroup O(1) spatial lookup vs manual loop |
| 10 | Death, Lives, and Respawn | `Scene.restart`, checkpoint data | FSM: Playing → Dying → Respawning | Pit detection (world bounds), respawn position |
| 11 | Scene Management — Level Flow | `scene.start`, `scene.get` | `GameScene`, `UIScene`, `MenuScene` classes | — |
| 12 | HUD + Game Feel | Parallel UI Scene, particles | UIScene overlay pattern | Screen shake (camera trauma), particle emission |

---

## What You Will See After Each Lab

```
LAB-01  Sky-blue Phaser canvas filling the browser window
LAB-02  Brown ground platforms, a colored rectangle falls and lands on them
LAB-03  Player sprite (placeholder art) falls, stands on ground, is a typed class
LAB-04  Arrow keys move player left/right; Space bar jumps; can't double-jump
LAB-05  Full Mario-style tilemap level — ground, platforms, pipes, sky tiles
LAB-06  Player animates: idle flips to run cycle, jump pose in the air
LAB-07  Camera follows player smoothly through the wide level
LAB-08  Goomba-style enemy patrols a platform; player stomps it; side touch kills player
LAB-09  Coins appear in the level; collecting them increments score; console shows total
LAB-10  Falling off the bottom = die; walking into enemy = die; respawns at start
LAB-11  Reaching the goal flag plays a win jingle and loads the next level
LAB-12  Coin pickup sparks, death screen shake, score/lives displayed in HUD overlay
```

---

## OOP Architecture

```
Phaser.Scene
  └── GameScene extends Phaser.Scene
        ├── player: Player
        ├── enemies: Phaser.Physics.Arcade.Group
        └── coins: Phaser.Physics.Arcade.StaticGroup

Phaser.Physics.Arcade.Sprite
  ├── Player extends Phaser.Physics.Arcade.Sprite
  │     ├── private cursors: CursorKeys
  │     ├── private animState: PlayerAnimState
  │     └── public update(): void
  └── Enemy extends Phaser.Physics.Arcade.Sprite
        ├── private speed: number
        └── public update(): void

Phaser.Scene
  └── UIScene extends Phaser.Scene  (runs in parallel, overlaid)
        ├── scoreText: Phaser.GameObjects.Text
        └── livesText: Phaser.GameObjects.Text
```

---

## Concept Dependency Chain

```
Phaser.Game config
  → Phaser.Scene (preload / create / update)
    → arcade physics (gravity, velocity)
      → StaticGroup (static colliders)
        → Sprite extending (Player, Enemy classes)
          → CursorKeys (input)
            → Tilemap (world grid)
              → AnimationManager (spritesheet states)
                → Camera (viewport)
                  → Scene transitions (multi-scene architecture)
```

---

## Setup Prerequisites

Node.js 18+ and npm 9+ required (same as Tetris V3 — you already have these).

The game uses the free **Kenney Assets** spritesheets (public domain — no
licensing issues). LAB-05 introduces Tiled Map Editor (free, at mapeditor.org)
for designing levels. Both are installed step by step inside their labs.

**Art assets used:**
- `kenney_platformer-pack` — tiles, player, enemies, coins (all free, public domain)
- Download link and installation walkthrough provided in LAB-05.

---

## Why Mario Before Metroid

Mario teaches the fundamentals in isolation: one scrolling level, simple
enemies, collectibles, a goal. Every system is self-contained.

Metroid adds on top: a connected room graph, ability gates (door only opens
if you have missile expansion), a minimap that reveals as you explore, and
persistent world state (enemies stay dead, blocks stay broken). None of that
makes sense until you can already make a room work as a standalone level.
The Mario series IS the Metroid prerequisite.

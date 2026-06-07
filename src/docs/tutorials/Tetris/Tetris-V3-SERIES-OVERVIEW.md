# Tetris V3 — Series Overview
## TypeScript · Object-Oriented Programming · Linear Algebra · Data Structures

**Prerequisite:** Tetris V2 complete (or equivalent canvas + game loop experience).
This series does not re-explain canvas basics — it explains *why* we are adding
TypeScript, OOP structure, and real math on top of what you already built.

---

## What V3 Adds That V2 Did Not

| Topic | V2 approach | V3 approach | Why the change |
|-------|-------------|-------------|----------------|
| Language | JavaScript (no types) | TypeScript (strict types) | Catch errors at write time, not runtime |
| Rotation | Precomputed list of 4 states | 2×2 rotation **matrix** (linear algebra) | Understand the math, not just the result |
| Piece data | Plain `{}` objects | TypeScript **classes** with methods | Encapsulation — behavior travels with data |
| Board | 2D array of numbers | **Board class** with private state | No outside code can corrupt board state |
| Game states | `if/else` boolean flags | **Finite State Machine** | Formal model that scales, named transitions |
| Randomizer | `Math.random()` inline | **7-bag algorithm** with a **Queue class** | DSA in action — fair randomness, no streaks |
| Scoring rules | Inline `if` chain | **Strategy Pattern** | Swap rules without touching the game loop |
| Reusable structures | One-off arrays | **Generic Queue\<T\>** | Write once, type-safely reuse everywhere |

---

## The 12 Labs

| Lab | Title | OOP Concept | Math / Logic | DSA | TypeScript Feature |
|-----|-------|-------------|--------------|-----|--------------------|
| 01 | Canvas on Screen | Objects preview | Coordinate system, resolution vs CSS size | — | Type annotations, non-null assertion `!` |
| 02 | The Board Matrix | Value objects | **Matrix** as 2D grid, row-major indexing | 2D array, shared-reference trap | `interface`, `type` alias, `readonly` |
| 03 | The Piece Class | **Classes**, constructors, `this` | 2D **vectors** and points | — | `class`, access modifiers (`private`, `public`) |
| 04 | Rotation | Instance methods, pure functions | **2D rotation matrix** (transpose + reverse) | — | Method return types, `readonly` tuple |
| 05 | Collision Detection | Predicate methods | Set membership, boundary conditions | — | `boolean` return types, type guards |
| 06 | Game Loop | **Interfaces** as contracts | **Delta time** (speed × time = distance) | — | `interface`, `implements` |
| 07 | Locking + Spawning | **Encapsulation**, private API | — | Stack (lock sequence) | `private`, class organization |
| 08 | Line Clearing | Functional class methods | Filter as **set comprehension** | `Array.every`, `Array.filter` algorithms | `readonly`, `as const` |
| 09 | Scoring + Levels | **Strategy Pattern**, enums | Tetris scoring formula (geometric scaling) | — | `enum`, `const enum` |
| 10 | Game Over | **State Pattern**, FSM | — | **Finite State Machine** | Discriminated unions |
| 11 | Ghost + 7-Bag | **Queue class**, OOP composition | **Fisher-Yates shuffle** | Queue (FIFO) DSA | Generics intro `<T>` |
| 12 | Generic Queue | Polymorphism via generics | — | Generic data structures | `<T extends ...>`, type constraints |

---

## Concept Dependency Chain

These concepts build on each other. The labs respect this order:

```
type annotations
  → interface
    → class (implements interface)
      → access modifiers (private / public)
        → encapsulation (Board class)

2D array
  → matrix (named concept)
    → rotation matrix (linear algebra)
      → transpose operation
        → 90° clockwise rotation

delta time
  → game loop with time accumulation
    → level speed scaling

boolean conditions
  → predicate methods (isValid)
    → collision detection

Queue (FIFO)
  → 7-bag algorithm (uses Queue)
    → generic Queue<T> (generalize)
      → ghost piece (uses same piece logic)
```

---

## What You Will See After Each Lab

```
LAB-01  Black 300×600 canvas centered on a dark page
LAB-02  Visible 10×20 grid with 1px gaps between cells
LAB-03  T-piece drawn at the top center of the grid
LAB-04  Piece rotates through 4 states on Up-arrow key
LAB-05  Piece blocked by walls and floor — cannot move through them
LAB-06  Piece falls automatically every 800ms, arrow keys move it
LAB-07  Piece locks in place on landing, new random piece spawns
LAB-08  Full rows disappear, rows above shift down, game continues
LAB-09  Score / Level / Lines displayed — score jumps for multi-line clears
LAB-10  Game Over screen on stack-out; any key restarts cleanly
LAB-11  Ghost shows landing spot, next-piece panel, no 3-in-a-row streaks
LAB-12  Same behavior as LAB-11 — refactored with generic Queue<T>
```

---

## Prerequisites and Setup

**Node.js** (version 18 or later) and **npm** must be installed.

Check before starting LAB-01:

```bash
node --version    # must show 18.x or higher
npm --version     # must show 9.x or higher
```

Download Node.js at nodejs.org if needed. LAB-01 walks through the full Vite
project setup step by step — nothing else to do before opening LAB-01.

---

## Why OOP for Tetris?

Tetris has **natural objects**: a Board (knows its own cells), a Piece (knows
its own shape and position), a ScoreTracker (knows the scoring rules). When
those objects manage their own state, no outside code can accidentally corrupt
them. You will feel the difference in LAB-07 when the Board class prevents
bugs that were possible in V2's plain array.

## Why Linear Algebra for Rotation?

V2 precomputed all 4 rotation states for each piece and stored them in a list.
That works — but it hides how rotation actually works. A 90° clockwise rotation
of a grid is equivalent to a **transpose** (flip over the main diagonal) followed
by a **row reversal**. Once you understand that operation, you can rotate *any*
2D grid — not just Tetris pieces. LAB-04 proves this with the math first, then
the code.

## Why TypeScript?

TypeScript catches category errors before you run the code. In V2, nothing stops
you from writing `board[row] = "cleared"` — a string where a number array should
live. TypeScript makes that a compile error. Every lab in V3 shows what TypeScript
catches and why that matters for the specific code you are writing.

# Space Invaders in Rust — LAB 01 — Your First Pixel

**What you will have by the end of this lab:**
A window on your screen with a green rectangle near the bottom. That rectangle
is your ship. Nothing moves yet — but you are looking at the first frame of your game.

**What you need before starting:**
- Rust installed — go to [rustup.rs](https://rustup.rs) and follow the instructions
- A code editor — VS Code works well
- A terminal — PowerShell on Windows, Terminal on Mac

**Time:** 30–40 minutes

---

> **Quick Check — think about these before reading:**
>
> 1. A game like Space Invaders is always moving — aliens march, bullets fly,
>    the ship responds to keys. But your computer runs code one line at a time,
>    from top to bottom. How do you think a game keeps updating constantly?
> 2. The ship starts at position x=300, y=550 on screen. You need to use that
>    position in five different places. If you write `300.0` in all five places
>    and later want to move the ship to x=400, how many places do you have to edit?
> 3. Computers store colors as numbers. What do you think those numbers describe?
>
> *(Think about these now. Answers are at the bottom of this lab.)*

---

## Set Up the Project

Open a terminal. Run these commands one at a time:

```sh
cargo new space-invaders
cd space-invaders
cargo add macroquad
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** You see `Hello, world!` printed in the terminal. The program exits.

> **Term: `cargo`** — Rust's built-in tool for creating, building, and running
> projects. You will use it for everything.

> **Term: crate** — Rust's word for a library (a package of code someone else
> wrote that you can use). `macroquad` is a crate that gives us a window,
> drawing, and keyboard input. `cargo add macroquad` downloaded it and added it
> to your project.

---

## The Problem: We Need a Window

Right now the program prints text and quits. A game can't work that way —
it needs a window that stays open and keeps drawing, frame after frame, until
you close it.

Open `src/main.rs` in your editor. You will see:

```rust
fn main() {
    println!("Hello, world!");
}
```

This is the entire starter program. One function, one line. Let's understand
what we have before changing it.

> **Term: `fn main()`** — every Rust program starts here. `fn` means function.
> `main` is its name. It is the first thing that runs when you type `cargo run`.

> **Term: function** — a named block of code that does a specific job.
> `println!("Hello, world!")` is a call to the `println` function — it does the
> job of printing text to the terminal.

Now replace everything in `src/main.rs` with this:

```rust
use macroquad::prelude::*;

#[macroquad::main("Space Invaders")]
async fn main() {
    loop {
        clear_background(BLACK);
        next_frame().await
    }
}
```

### SAVE AND TRY

```sh
cargo run
```

> **First run takes 30–60 seconds.** Rust is compiling `macroquad` for the
> first time. Every run after this is fast.

**Expected:** A black window titled "Space Invaders" appears and stays open.
Close it with the X button.

**Change something:** Change `BLACK` to `DARKBLUE`. Run again. The window is
now dark blue. Change it back to `BLACK` before continuing.

---

## What Is Actually Happening?

Now that you have seen it work, let's read each line carefully.
Nothing is skipped.

### `use macroquad::prelude::*;`

You downloaded `macroquad`, but your code does not automatically know it exists.
This line says: *"bring all of macroquad's tools into this file."*

> **Analogy:** Imagine a workshop. `macroquad` is a toolbox sitting in the
> corner. `use macroquad::prelude::*` carries everything from that toolbox onto
> your workbench. Now you can reach `clear_background`, `draw_rectangle`,
> and all the other tools without going back to the corner every time.

**Break it on purpose.** Delete line 1 (`use macroquad::prelude::*;`) and run:

```sh
cargo run
```

**Expected error:**
```
error[E0425]: cannot find function `clear_background` in this scope
```

Rust says: *"I don't know what `clear_background` is."* Without the `use` line,
the tools are still in the corner — you haven't carried them over.

**Fix it:** Put the line back. The error disappears.

> **The Rule:** If you want to use a crate's tools, you must `use` them first.

---

### `#[macroquad::main("Space Invaders")]`

> **Term: attribute** — a line starting with `#[...]` that gives the compiler
> extra instructions. You do not need to understand the internals. For every
> macroquad game, this line is required. It opens the window and sets its title.

---

### The Game Loop

```rust
loop {
    clear_background(BLACK);
    next_frame().await
}
```

This is the most important idea in any game ever made.

> **The Story Behind the Game Loop:**
> Imagine you are drawing Space Invaders on a whiteboard. Every sixtieth of a
> second, you erase the whole board and draw everything fresh — the ship in its
> new position, the aliens one step further along, the bullets a bit lower.
> The game "moves" because you are drawing it very fast, over and over, with
> tiny changes each time.
>
> `loop` runs its contents forever. `clear_background(BLACK)` erases the
> whiteboard. `next_frame().await` says: *"I am done drawing this frame —
> show it on screen, then come back so I can draw the next one."*

> **Term: `loop`** — a block of code that repeats forever. It only stops when
> something inside it says `break`. Every game has one game loop.

> **Term: `next_frame().await`** — tells macroquad to display what you have
> drawn and wait for the next frame. This runs roughly 60 times per second.

> **What is `async fn main()` and `.await`?** These words relate to how Rust
> handles things that take time (like waiting for a frame). macroquad requires
> them. You will understand them fully in a later lab — for now, just know:
> write `async fn main()` instead of `fn main()`, and write `.await` after
> `next_frame()`. The game loop will not work without them.

---

## Step 2 — Draw the Ship

A black window is a start, but we need something in it.

Add one line inside the `loop`, between `clear_background` and `next_frame`:

```rust
use macroquad::prelude::*;

#[macroquad::main("Space Invaders")]
async fn main() {
    loop {
        clear_background(BLACK);
        draw_rectangle(300.0, 550.0, 40.0, 20.0, GREEN); // ← new line
        next_frame().await
    }
}
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** A green rectangle appears near the bottom of the window.
That is your ship.

**Change something:** Change `GREEN` to `YELLOW`. Run. Change the first number
(`300.0`) to `100.0` — the ship jumps left. Change both back before continuing.

---

## What Does `draw_rectangle` Do?

`draw_rectangle(x, y, width, height, color)` draws a filled rectangle.
It needs five pieces of information:

| Position | What it means         | Our value |
|----------|-----------------------|-----------|
| 1st      | Distance from left edge | `300.0` |
| 2nd      | Distance from top edge  | `550.0` |
| 3rd      | Width of rectangle      | `40.0`  |
| 4th      | Height of rectangle     | `20.0`  |
| 5th      | Color                   | `GREEN` |

> **Term: argument** — a value you give to a function so it can do its job.
> `draw_rectangle` needs to know *where* to draw and *what* to draw.
> Those five values are its arguments.

> **Why `.0` on the numbers?** `300` and `300.0` mean the same amount, but
> Rust requires you to say whether a number can have a decimal part or not.
> Screen positions can be fractional (halfway between two pixels), so
> `draw_rectangle` expects numbers with a decimal point. The type for these
> is called `f32` — you will learn this in LAB 02.

---

## Step 3 — Give the Position a Name

The ship is at position `300.0, 550.0`. Those numbers are buried in the
`draw_rectangle` call. Later, we will need to check the ship's position,
move it, and reset it. Hunting for `300.0` everywhere causes bugs.

The fix: give the position a name.

```rust
use macroquad::prelude::*;

#[macroquad::main("Space Invaders")]
async fn main() {
    let ship_x = 300.0;
    let ship_y = 550.0;

    loop {
        clear_background(BLACK);
        draw_rectangle(ship_x, ship_y, 40.0, 20.0, GREEN);
        next_frame().await
    }
}
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Identical result — the same green rectangle in the same place.
The behavior did not change. Only the code changed. But now the position has a name.

---

## The Concept: Variables

> **The Story:** You are playing a board game. A piece is on square 5.
> You pick it up and move it to square 8. You just *remember* where it is.
> Code cannot "just remember." You need a named place to store a value.
> That named place is a **variable**.

> **Term: variable** — a named container that holds a value. `let ship_x = 300.0`
> creates a container named `ship_x` and puts `300.0` inside it. Wherever you
> write `ship_x`, Rust substitutes what is stored there.

**The pattern:**
```rust
let name = value;
```

`let` creates the container. The name is what you call it. The value is what
goes inside.

### Break It on Purpose

Remove the word `let` from the first line:

```rust
    ship_x = 300.0;  // ← missing "let"
```

### SAVE AND TRY (expect failure)

```sh
cargo run
```

**Expected error:**
```
error[E0425]: cannot find value `ship_x` in this scope
```

*"I cannot find `ship_x`."* Without `let`, you never created the container.
You tried to use something that does not exist.

**Fix it:** Put `let` back. Run again — it works.

> **The Rule:** Every variable must be created with `let` before you can use it.
> Rust does not create variables automatically.

---

## Step 4 — Name the Size Too

While we are at it, the ship's width and height (`40.0` and `20.0`) are also
raw numbers with no meaning. Let's name them:

```rust
use macroquad::prelude::*;

#[macroquad::main("Space Invaders")]
async fn main() {
    let ship_x      = 300.0;
    let ship_y      = 550.0;
    let ship_width  = 40.0;
    let ship_height = 20.0;

    loop {
        clear_background(BLACK);
        draw_rectangle(ship_x, ship_y, ship_width, ship_height, GREEN);
        next_frame().await
    }
}
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Same green rectangle. The code is now easier to read.
Every number has a name that explains what it represents.

**Change something:** Change `ship_width` to `60.0`. The ship gets wider.
Change `ship_height` to `30.0`. It gets taller. Change both back.

---

## 🎯 Challenge: Center the Ship

**The goal:** Move the ship to the horizontal center of the window.

The window is 800 pixels wide (macroquad's default). The ship is 40 pixels wide.

If the window is 800 wide and the ship is 40 wide, what `ship_x` value puts
the ship exactly in the center? Think: where does the ship's left edge need to
be so the ship spans equally on both sides of the midpoint?

Change `ship_x` to that value. Run the game and verify the ship is centered.

Also try: make the ship 60 pixels wide AND centered at the same time.
Hint: can you calculate `ship_x` *from* `ship_width` instead of using a
hardcoded number?

Try for at least 5 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
use macroquad::prelude::*;

#[macroquad::main("Space Invaders")]
async fn main() {
    let ship_width  = 60.0;
    let ship_height = 20.0;
    let ship_x      = 400.0 - ship_width / 2.0;  // center = midpoint - half width
    let ship_y      = 550.0;

    loop {
        clear_background(BLACK);
        draw_rectangle(ship_x, ship_y, ship_width, ship_height, GREEN);
        next_frame().await
    }
}
```

**The math:** The window center is at x=400. If the ship is 60 wide, its left
edge should be at 400 - 30 = 370. Writing `400.0 - ship_width / 2.0` means:
"always put the left edge half a ship-width to the left of center." Now if you
change `ship_width` to 80, the ship re-centers automatically — you did not
hardcode `370.0`.

**What you just used:** Variables on the right side of another variable.
`ship_x` is calculated *from* `ship_width`. This is the first example of
variables depending on each other. You will use this pattern constantly.

</details>

---

## Final Check

Before moving to LAB 02, confirm all of these:

| Feature | How to verify |
|---------|---------------|
| Window opens with black background | `cargo run` shows a window |
| Green rectangle visible near bottom | Rectangle appears in window |
| Window title reads "Space Invaders" | Check the title bar |
| Changing `ship_x` moves the rectangle | Tested it |
| Removing `use macroquad::prelude::*` causes an error | Tried it and saw the error |
| Removing `let` causes an error | Tried it and saw the error |
| Challenge: ship is centered | Calculated correct `ship_x` value |

---

## Quick Check Answers

**1. How does a game keep updating constantly?**
With a `loop`. The game loop runs the same drawing code over and over — 60 times
per second. Each run clears the screen and redraws everything in its updated
position. The game appears to move because the position changes slightly each
frame. `next_frame().await` paces the loop to the screen's refresh rate.

**2. If `300.0` is written in five places and you need to change it to `400.0`,
how many places do you edit?**
Five — one for each occurrence. This is why named variables exist. With
`let ship_x = 300.0`, you change one line and every place that uses `ship_x`
automatically uses the new value.

**3. What do color numbers describe?**
Red, Green, and Blue intensity — each from 0 to 255. `GREEN` in macroquad is
(0, 255, 0): no red, maximum green, no blue. Your monitor mixes these three
lights to produce every color you see. `WHITE` is (255, 255, 255) — full of all
three. `BLACK` is (0, 0, 0) — none.

---

## What Is Next — LAB 02

Right now the ship sits frozen in one place. In LAB 02 we discover why
we can't just write `ship_x = ship_x + 1.0` to move it — and what Rust
requires you to do instead. You will also group the ship's four variables
into one named thing called a **struct**, because they all belong together.
By the end, pressing the left and right arrow keys moves your ship.

*Continue to Space Invaders in Rust — LAB 02 — The Ship Moves: Mutation and Structs.*

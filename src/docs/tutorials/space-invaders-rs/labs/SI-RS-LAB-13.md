# Space Invaders in Rust — LAB 13 — Traits: Shared Behavior and Polymorphism

**What you will have by the end of this lab:**
A `Drawable` trait that `Ship`, `Alien`, `Shield`, `Bullet`, and `Particle`
all implement. A single `draw_all` function that draws any mix of these types
without knowing their specific types. You understand how Rust enables code to
work with different types through a shared interface — without inheritance.

**Time:** 40–50 minutes

---

> **Quick Check — think about these before reading:**
>
> 1. You have `ship.draw()`, `alien.draw()`, `shield.draw()` — all doing the
>    same conceptual job. Can you write a function that accepts "anything that
>    has a draw method" without specifying the exact type?
> 2. In languages like Java or Python, you might make `Ship` and `Alien` both
>    inherit from a `Drawable` class. Rust does not have class inheritance.
>    What does Rust use instead?
> 3. A `Vec<Box<dyn Drawable>>` can hold `Ship`, `Alien`, and `Shield` all in
>    the same list. What does `Box` mean, and what does `dyn` mean?
>
> *(Answers at the bottom.)*

---

## The Problem: Each Type Draws Itself Differently, But the Concept Is the Same

Every game object has a `draw` method. But right now, to draw the whole scene
you must call each type separately:

```rust
ship.draw();
bullet.draw();
draw_aliens(&aliens);
for shield in &shields { shield.draw(); }
draw_particles(&particles);
```

As you add new object types (power-ups, asteroids, missiles), this list grows.
Worse, you cannot write a function that accepts "any drawable thing" — you must
write one version per type.

The solution: define a shared contract that all drawable types agree to follow.

---

## The Concept: Traits — A Shared Contract

> **The Story:** An electrical outlet in North America has a standard shape.
> A phone charger, a lamp, and a drill all have plugs that fit that shape.
> The outlet does not know or care what is plugged in — it just delivers power
> to anything that fits the standard. The *standard plug shape* is the contract.
>
> In Rust, a **trait** is a contract. It says: "any type that implements this
> trait must provide these methods." Code that needs "anything drawable" accepts
> "anything that implements `Drawable`" — not a specific type.

> **Term: trait** — a named set of method signatures (names, parameter types,
> return types) that a type promises to implement. The trait defines the contract;
> each type's `impl Trait for Type` fulfills it.

**The smallest possible example — before applying to the game:**

```rust
// Define the contract: anything that implements `Speak` must have a `speak` method.
trait Speak {
    fn speak(&self) -> &str;  // returns a string slice, reads self
}

struct Dog;
struct Cat;

// Fulfill the contract for Dog:
impl Speak for Dog {
    fn speak(&self) -> &str { "Woof!" }
}

// Fulfill the contract for Cat:
impl Speak for Cat {
    fn speak(&self) -> &str { "Meow!" }
}

// A function that accepts ANYTHING implementing Speak:
fn make_noise(animal: &dyn Speak) {
    println!("{}", animal.speak());
}

fn main() {
    let dog = Dog;
    let cat = Cat;
    make_noise(&dog); // prints: Woof!
    make_noise(&cat); // prints: Meow!
}
```

> **`&dyn Speak`** — "a reference to something that implements `Speak`."
> `dyn` means *dynamic dispatch* — the exact type is not known at compile time;
> the right `speak` method is chosen at runtime based on the actual type.

> **Trait vs struct inheritance:** Rust has no struct inheritance. Instead of
> `Ship extends Drawable`, you write `impl Drawable for Ship`. The behavior is
> the same (any Ship can be used where Drawable is expected), but without the
> complexity of deep inheritance hierarchies.

---

## Step 1 — Define the `Drawable` Trait

Create `src/drawable.rs` (or add to `src/game.rs`):

```rust
// The Drawable trait: any type that implements this can be drawn to the screen.
// The macroquad drawing functions can be called from within `draw` because
// macroquad is globally available in any file that uses it.
pub trait Drawable {
    fn draw(&self);
}
```

That is the entire trait. One method. One requirement.

> **Why so small?** Traits should be as small as possible — they should represent
> one specific capability. This is the *Interface Segregation Principle* from
> software engineering: prefer many small interfaces over one large one. A type
> that can draw does not need to also move or collide — those are separate traits.

---

## Step 2 — Implement `Drawable` for Each Type

In `src/ship.rs`, add:

```rust
use crate::drawable::Drawable;

impl Drawable for Ship {
    fn draw(&self) {
        draw_rectangle(self.x, self.y, self.width, self.height, GREEN);
    }
}
// Note: the existing `fn draw(&self)` inside `impl Ship` does the same thing.
// You can either keep both (one from the trait, one standalone) or remove the
// standalone `draw` and only keep the trait implementation.
// For clarity, keep the trait implementation and remove the standalone.
```

In `src/bullet.rs`:

```rust
use crate::drawable::Drawable;

impl Drawable for Bullet {
    fn draw(&self) {
        if self.active {
            draw_rectangle(self.x - 2.0, self.y, 4.0, 10.0, WHITE);
        }
    }
}
```

In `src/alien.rs`:

```rust
use crate::drawable::Drawable;

impl Drawable for Alien {
    fn draw(&self) {
        if self.alive {
            let color = match self.row { 0 => PINK, 1 => ORANGE, 99 => MAGENTA, _ => RED };
            let (w, h) = if self.row == 99 { (60.0, 50.0) } else { (30.0, 20.0) };
            draw_rectangle(self.x, self.y, w, h, color);
        }
    }
}
```

In `src/shield.rs`:

```rust
use crate::drawable::Drawable;

impl Drawable for Shield {
    fn draw(&self) {
        // same implementation as before
        for (row, row_data) in self.blocks.iter().enumerate() {
            for (col, &alive) in row_data.iter().enumerate() {
                if alive {
                    draw_rectangle(
                        self.x + col as f32 * BLOCK_SIZE,
                        self.y + row as f32 * BLOCK_SIZE,
                        BLOCK_SIZE - 1.0,
                        BLOCK_SIZE - 1.0,
                        Color::new(0.2, 0.8, 0.2, 1.0),
                    );
                }
            }
        }
    }
}
```

### SAVE AND TRY

```sh
cargo build
```

**Expected:** Compiles. Each type now satisfies the `Drawable` contract.

---

## Step 3 — Write a Function That Accepts Any `Drawable`

Now the payoff. Add to `src/game.rs`:

```rust
use crate::drawable::Drawable;

// Draw a slice of any type that implements Drawable.
// The `T: Drawable` constraint says: "T can be any type, as long as it implements Drawable."
fn draw_list<T: Drawable>(items: &[T]) {
    for item in items {
        item.draw();
    }
}
```

> **`<T: Drawable>`** — a *generic type parameter with a trait bound*.
> `T` is a placeholder for any type. `: Drawable` constrains it: `T` must
> implement `Drawable`. The compiler generates separate code for each concrete
> `T` used — this is called *static dispatch* (the opposite of `dyn Drawable`).

> **Static dispatch vs dynamic dispatch:**
> - `fn draw_list<T: Drawable>(items: &[T])` — static. The compiler knows the
>   exact type at compile time and generates specialized code. Fast.
> - `fn draw_list(items: &[&dyn Drawable])` — dynamic. The type is determined
>   at runtime via a vtable (a lookup table of function pointers). Flexible.
>
> Use static dispatch (generics) when all items in the list are the same type.
> Use dynamic dispatch (`dyn`) when the list can contain mixed types.

Update the drawing section:

```rust
    // Static dispatch: draw all aliens (all the same type).
    draw_list(&data.aliens);

    // Static dispatch: draw all shields.
    draw_list(&data.shields);

    // Individual draws:
    data.ship.draw();
    data.bullet.draw();
    draw_particles(&data.particles);
```

### SAVE AND TRY

```sh
cargo run
```

**Expected:** Identical game behavior. `draw_list` works for both `Vec<Alien>`
and `Vec<Shield>` with the same function, no code duplication.

---

## Step 4 — Mixed-Type Drawing with `dyn`

The static version requires all items in the list to be the same type.
If you want one `Vec` that holds `Ship`, `Alien`, and `Shield` mixed together,
you need dynamic dispatch:

```rust
// Box<dyn Drawable>: an owned, heap-allocated, erased Drawable object.
// The concrete type is hidden — only the Drawable interface is visible.
fn draw_scene(objects: &[Box<dyn Drawable>]) {
    for obj in objects {
        obj.draw(); // calls the right draw() based on the actual type at runtime
    }
}
```

> **`Box<T>`** — allocates `T` on the heap and gives you an owned pointer to it.
> `Box<dyn Drawable>` stores a "type-erased" drawable: the concrete type is
> forgotten at compile time. The vtable (a table of function pointers stored
> with the Box) allows the right method to be called at runtime.

> **Why `Box`?** `dyn Drawable` has no known size at compile time — different
> types (Ship, Alien, Shield) have different sizes. Rust requires all items in
> a `Vec` to be the same size. `Box` provides a fixed size (a pointer) regardless
> of what is inside.

**Demonstration (not replacing existing code — just showing the pattern):**

```rust
    let scene: Vec<Box<dyn Drawable>> = vec![
        Box::new(Ship::new()),
        Box::new(Alien::new(100.0, 100.0, 0)),
        Box::new(Shield::new(200.0, 400.0)),
    ];
    draw_scene(&scene); // draws all three despite being different types
```

You would not restructure the game to use this pattern — it adds heap allocation
overhead. But for extensibility (a plugin system, a level editor, or entities
you do not know about at compile time), `Box<dyn Trait>` is the standard approach.

### SAVE AND TRY

```sh
cargo build
```

**Expected:** Compiles. The demonstration shows the pattern compiles and works.

---

## The Concept: Trait Objects vs Generics — When to Use Each

| | Generics (`<T: Trait>`) | Trait objects (`&dyn Trait`) |
|---|---|---|
| **Type known at** | Compile time | Runtime |
| **Speed** | Faster (no vtable lookup) | Slight overhead |
| **List of mixed types** | Not possible (all same type) | Possible |
| **Use when** | All items are the same type | Items can be different types |
| **Common in** | `draw_list(&aliens)` | Plugin systems, dynamic collections |

> **The Rule of Thumb:** Start with generics. Switch to `dyn` when you genuinely
> need a mixed-type collection or runtime selection.

---

## 🎯 Challenge: Add an `Update` Trait

**The goal:** Define an `Update` trait alongside `Drawable`:

```rust
pub trait Update {
    fn update(&mut self);
}
```

Implement `Update` for `Ship` (calls the existing `update` logic) and for
`Bullet` (moves the bullet upward and deactivates at the top).

Write a function `update_list<T: Update>(items: &mut [T])` that calls `update`
on every item in the list.

Use it to update bullets or aliens.

Try for at least 10 minutes before looking at the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
// src/drawable.rs (or a new traits.rs):
pub trait Update {
    fn update(&mut self);
}

// src/ship.rs:
impl Update for Ship {
    fn update(&mut self) {
        if is_key_down(KeyCode::Right) { self.x += self.speed; }
        if is_key_down(KeyCode::Left)  { self.x -= self.speed; }
        if self.x < 0.0                         { self.x = 0.0; }
        if self.x > screen_width() - self.width { self.x = screen_width() - self.width; }
    }
}

// src/bullet.rs:
impl Update for Bullet {
    fn update(&mut self) {
        if self.active {
            self.y -= 8.0;
            if self.y < 0.0 { self.active = false; }
        }
    }
}

// src/game.rs:
fn update_list<T: Update>(items: &mut [T]) {
    for item in items { item.update(); }
}

// Usage — update all particles (add Update for Particle too):
update_list(&mut data.particles);
// Each particle moves by its velocity and decrements its lifetime.
```

**Key insight:** The same function `update_list` works for bullets, particles, or
any future type that implements `Update` — with zero code changes to the function
itself. Adding a new type to the game only requires implementing the trait; nothing
else changes. This is the *open/closed principle*: open for extension (new types),
closed for modification (the existing function stays the same).

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| `trait Drawable` defined in `drawable.rs` | File exists with trait definition |
| `Ship`, `Alien`, `Bullet`, `Shield` implement `Drawable` | `impl Drawable for ...` in each file |
| `draw_list<T: Drawable>` used for aliens | One function handles both `Vec<Alien>` and `Vec<Shield>` |
| `Box<dyn Drawable>` example compiles | Demo code in `main` or a test |
| Game behavior unchanged | Plays identically to LAB 12 |
| Challenge: `Update` trait implemented | `update_list` works for `Bullet` and `Particle` |

---

## Quick Check Answers

**1. Can you write a function that accepts "anything with a draw method"?**
Yes — with a trait. Define `trait Drawable { fn draw(&self); }`. Implement it for
each type. Then `fn draw_something(item: &dyn Drawable)` accepts any type that
implements `Drawable`. The function does not know or care whether it receives a
`Ship`, `Alien`, or `Shield`.

**2. What does Rust use instead of class inheritance?**
Traits. Instead of `class Ship extends Drawable`, you write `impl Drawable for Ship`.
Multiple traits can be implemented for the same type: `impl Drawable for Ship` AND
`impl Update for Ship`. This is called *composition* — you compose behavior from
traits rather than inheriting it from a parent class. Rust does not support
implementation inheritance at all — you cannot inherit code from another struct.

**3. What do `Box` and `dyn` mean?**
`dyn Drawable` — dynamic dispatch: the concrete type is unknown at compile time;
the right method is found at runtime via a vtable.
`Box<T>` — heap allocation with owned pointer: `T` lives on the heap, and
`Box` gives you a fixed-size pointer to it. `Box<dyn Drawable>` is a fixed-size
(pointer-sized) value that owns some heap-allocated drawable thing, regardless
of the concrete type's actual size.

---

## What Is Next — LAB 14

The game is feature-complete with proper software architecture. LAB 14 is about
timing and feel: adding delta time (making the game speed independent of frame
rate), screen shake on the boss explosion, a scrolling starfield background,
and sound effects using macroquad's audio API. The game goes from functional
to polished.

*Continue to Space Invaders in Rust — LAB 14 — Delta Time, Screen Shake, and Sound.*

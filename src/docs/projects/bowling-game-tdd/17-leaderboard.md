# Lesson 17: The Leaderboard, for Real

*(`Player implements Comparable<Player>`)*

**What you will build**
`Player` gains a real `compareTo`, making it a legitimate type argument
for Lesson 13's `Leaderboard<T extends Comparable<T>>` — ranking real
players by their best game, end to end.

**What you need to know first**
Lesson 13's bounded `Leaderboard<T>` (built and verified against plain
`Integer`s) and Lesson 16's `Player`. This lesson connects the two for
the first time.

---

## Concept Unit: `implements Comparable<Player>`

### The Problem

Lesson 13 proved `Leaderboard<NotComparable>` fails to compile — `Player`,
as built in Lesson 16, is in exactly that same non-`Comparable` state
right now. Making `Leaderboard<Player>` work requires `Player` to define
what "greater than" means for itself.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `Player.java`.
- **Change type:** Add `implements Comparable<Player>` and a `compareTo`
  method.
- **Location:** The class declaration and a new method.
- **Dependencies:** Lesson 13's `Leaderboard<T extends Comparable<T>>`.

### The New Code

```java
class Player implements Comparable<Player> {
    // ... existing fields and methods from Lesson 16, unchanged ...

    @Override
    public int compareTo(Player other) {
        return Integer.compare(this.bestGame(), other.bestGame());
    }

    @Override
    public String toString() {
        return name + ":" + bestGame();
    }
}
```

### The Updated Project

Every field and method from Lesson 16 (`name`, `gameScores`,
`recordGame`, `bestGame`) stays exactly as it was — this adds
`implements Comparable<Player>`, one new method, and a `toString`
override for readable leaderboard output.

### Mechanical walkthrough

1. `class Player implements Comparable<Player>` — (hard concept
   reappearing) `implements` — Lesson 12's exact mechanism, this time
   fulfilling a JDK-provided interface (`Comparable`) instead of a custom
   one (`ScoringStrategy`).
2. `public int compareTo(Player other)` — (first appearance)
   `Comparable`'s one required method. Its contract: return negative if
   `this` is "less than" `other`, zero if equal, positive if greater.
3. `Integer.compare(this.bestGame(), other.bestGame())` — (first
   appearance) a `static` helper on `Integer` doing exactly that
   three-way comparison correctly for two `int`s — safer and clearer than
   hand-writing `a - b` (which can silently overflow for extreme values,
   a real, if rare, bug this method avoids entirely).

### Run it

```java
Player ada = new Player("Ada");
ada.recordGame(150);
ada.recordGame(210);
Player grace = new Player("Grace");
grace.recordGame(300);
Player alan = new Player("Alan");
alan.recordGame(180);

Leaderboard<Player> board = new Leaderboard<>();
board.add(ada);
board.add(grace);
board.add(alan);
System.out.println(board.ranked());
```

Real output — verified this session:

```text
[Grace:300, Ada:210, Alan:180]
```

*What this proves:* `Leaderboard<Player>` — which Lesson 13 proved fails
to even compile for a non-`Comparable` type — now compiles and correctly
ranks three real players by their `bestGame()`, highest first, using the
exact same `Leaderboard` class built and verified against plain
`Integer`s back in Lesson 13, completely unmodified.

### CS Lens

This is the actual payoff of Lesson 13's generic, bounded design:
`Leaderboard<T extends Comparable<T>>` was written once, against an
abstract bound, and now ranks a real domain type it was never specifically
written for — the entire point of generic programming, made concrete.

### SE Lens

Why rank by `bestGame()` specifically, rather than total games bowled or
average score? A real, honest design choice with no universally correct
answer — this is exactly the situation Lesson 14's `Comparator` section
flagged: `Player`'s one `compareTo` bakes in *one* natural ordering
(currently: best single game). If a future feature needs to rank by a
*different* statistic, a `Comparator` (not a second `compareTo` —
`Comparable` only allows one) would be the right tool, without changing
`Player` itself.

### Connection

Lesson 18's Stream API rewrites `BowlingAlley`'s own queries (top scorers,
players above a threshold) using this same `compareTo`/`Comparator`
foundation, more concisely.

---

## Closing

### Connect the pieces

`Player implements Comparable<Player>` (unit 1), using `Integer.compare`
on `bestGame()`, is exactly the missing piece Lesson 13's
`Leaderboard<NotComparable>` failure predicted would be needed. Real
players, real scores, ranked correctly through code written three lessons
ago with no knowledge `Player` would ever exist.

### What breaks without this

Remove `implements Comparable<Player>` (keep `compareTo` as a plain,
non-overriding method) and try `Leaderboard<Player>` again. Real,
observable failure: you already saw this exact category of error in
Lesson 13 — "type argument Player is not within bounds of type-variable
T" — because a `compareTo` method existing isn't enough; the class must
actually declare `implements Comparable<Player>` for the compiler to
recognize the contract is fulfilled.

### Exercises

- Change `compareTo` to rank by total games played instead of best game,
  and confirm the leaderboard's order changes accordingly.
- Write a `Comparator<Player>` ranking by *total* score across all games
  (sum, not best), and use it via `list.sort(...)` directly — without
  touching `Player`'s own `compareTo` at all — connecting back to Lesson
  14's `Comparable` vs. `Comparator` distinction, now with a real second
  ranking rule.

### Definition of done

- [ ] `Leaderboard<Player>` compiles and ranks correctly by best game,
      verified with real output.
- [ ] You can explain, in your own words, why `Integer.compare` is safer
      than hand-writing `a - b`.
- [ ] You wrote a second, `Comparator`-based ranking rule without
      modifying `Player`.
- [ ] Commit: `git commit -m "Make Player Comparable — Lesson 13's generic Leaderboard now ranks real players"`.

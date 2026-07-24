# Lesson 16: From One Game to a Bowling Alley

*(Modeling Players and Their Game History)*

**What you will build**
`Player` — a name plus a growing list of game scores — and `BowlingAlley`,
holding many players and looking one up by name. This is where the kata
(Epic 1) stops being the whole project and becomes one part of a real,
larger application.

**What you need to know first**
Lesson 9's value-type discipline (applied here to an entity with real
identity, not just a value — the distinction matters, explained below).
Lesson 15's `Optional` — used for real here.

---

## Concept Unit: `Player` — An Entity, Not a Value Type

### The Problem

`Roll` (Lesson 9) was a **value type** — two `Roll`s with the same pin
count are interchangeable, and `.equals()` correctly treats them as equal.
`Player` is different: two different players both named `"Ada"` are
*not* the same player, and even the same player's own record changes over
time (more games get added). This distinction matters for whether you'd
even want an `equals()`/`hashCode()` override at all.

### The New Code

```java
import java.util.ArrayList;
import java.util.List;

class Player {
    private final String name;
    private final List<Integer> gameScores = new ArrayList<>();

    Player(String name) {
        this.name = name;
    }

    String getName() {
        return name;
    }

    void recordGame(int score) {
        gameScores.add(score);
    }

    List<Integer> getGameScores() {
        return gameScores;
    }

    int bestGame() {
        int best = 0;
        for (int score : gameScores) {
            if (score > best) best = score;
        }
        return best;
    }
}
```

Run it:

```bash
javac Player.java PlayerDemo.java
java PlayerDemo
```

Real output — verified this session:

```text
Ada's best game: 210
[150, 210, 180]
```

*What this proves:* `Player` correctly tracks a growing history and
computes its own derived fact (`bestGame()`) from it — three recorded
games, correctly identifying `210` as the highest.

### Mechanical walkthrough

1. `private final String name;` / `private final List<Integer>
   gameScores = new ArrayList<>();` — (hard concept reappearing) Lesson
   0's access modifiers and Lesson 2's `List<Integer>`, both reused
   directly — no new syntax here, a deliberate signal that this class
   builds entirely on already-established tools.
2. `int bestGame()` — (hard concept reappearing) the exact same
   "iterate and track the running best" shape as `Game.score()`'s own
   summing loop — a familiar pattern applied to a new field.

### CS Lens

This is the classic **entity vs. value object** distinction from
domain modeling: a value object (`Roll`) is defined entirely by its
data — two with the same data are interchangeable. An entity (`Player`)
has a real identity that persists even as its data changes — Ada's
`Player` object is still "Ada" after a fourth game is recorded, even
though `gameScores` just changed. This is exactly why `Player` doesn't
get a Lesson-9-style `equals()`/`hashCode()` override here — two
different `Player` objects, even with identical names and scores so far,
are not necessarily "the same player" the way two `Roll(7)`s are
interchangeably "the same roll."

### Connection

`bestGame()` is exactly what Lesson 17's leaderboard ranks players by.

---

## Concept Unit: `BowlingAlley` and `Optional`-Based Lookup

### The Problem

A real app needs to hold many `Player`s and find one by name — this is
Lesson 15's `Optional` pattern, applied to a real domain type instead of a
`String`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `BowlingAlley.java`.
- **Change type:** Add.
- **Location:** New class.
- **Dependencies:** `Player`, `java.util.Optional`.

### The New Code

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

class BowlingAlley {
    private final List<Player> players = new ArrayList<>();

    void addPlayer(Player player) {
        players.add(player);
    }

    Optional<Player> findPlayer(String name) {
        for (Player p : players) {
            if (p.getName().equals(name)) return Optional.of(p);
        }
        return Optional.empty();
    }

    List<Player> allPlayers() {
        return players;
    }
}
```

### Run it

```java
BowlingAlley alley = new BowlingAlley();
Player ada = new Player("Ada");
ada.recordGame(210);
alley.addPlayer(ada);

System.out.println(alley.findPlayer("Ada").isPresent());
System.out.println(alley.findPlayer("Alan").isPresent());
System.out.println(alley.findPlayer("Ada").map(Player::bestGame).orElse(-1));
```

Real output — verified this session:

```text
true
false
210
```

### Mechanical walkthrough

1. `findPlayer(String name)` returning `Optional<Player>` — (hard concept
   reappearing) exactly Lesson 15's pattern, now for a real domain type.
2. `alley.findPlayer("Ada").map(Player::bestGame).orElse(-1)` — (first
   appearance) `Player::bestGame` is a **method reference** — shorthand
   for the lambda `p -> p.bestGame()`. `Optional.map` applies that
   function *only if* a value is present, producing a new `Optional`
   (here, `Optional<Integer>`) — if `findPlayer` had returned an empty
   `Optional`, `.map(...)` would skip straight to another empty
   `Optional`, and `.orElse(-1)` supplies the fallback. This chains three
   operations — find, transform, fall back — without a single explicit
   `if` statement or a risk of a `NullPointerException` anywhere in the
   chain.

### CS Lens

`Optional.map` is the same **functor** shape this repo's other courses'
functional-programming content touches on — transforming the value
*inside* a container without needing to first unwrap it and re-wrap it by
hand.

### SE Lens

Why does `BowlingAlley` hold `Player` objects directly, rather than, say,
a `Map<String, Player>` keyed by name (which would make lookup faster)?
Because Lesson 14 already covered when a `Map` is the right tool — the
honest tradeoff here: a `List` plus linear search is simpler and entirely
adequate for a small number of players; a real production version with
many players would likely reach for a `Map<String, Player>` instead, an
extension left for you.

### Connection

Lesson 17's leaderboard ranks `alley.allPlayers()` by `bestGame()` —
everything this lesson built is exactly what it needs.

---

## Closing

### Connect the pieces

`Player` (unit 1) tracks a growing game history and its own derived best
score — an entity, not a value type, a real domain distinction from
`Roll`. `BowlingAlley` (unit 2) holds many players and finds one by name
using `Optional`, chained with `.map` and a method reference to safely
extract a derived value without ever risking a `null`.

### What breaks without this

Change `findPlayer` to return a raw, possibly-`null` `Player` instead of
`Optional<Player>`, then call `.map(Player::bestGame)` on the result
directly. Real, observable failure: `.map` doesn't exist on a plain
`Player` reference — this is a compile error, not a runtime crash,
because `Optional`'s API (specifically `.map`) simply isn't available on
the raw type — a small, concrete illustration of how `Optional`'s API
itself encourages safe chaining that a raw nullable reference doesn't
offer at all.

### Exercises

- Add a `worstGame()` method to `Player`, mirroring `bestGame()`.
- Add a method to `BowlingAlley` returning the player with the single
  highest `bestGame()` across everyone — without using streams yet
  (Lesson 18 revisits this with them).

### Definition of done

- [ ] `Player` correctly tracks multiple games and computes `bestGame()`.
- [ ] `BowlingAlley.findPlayer` correctly returns present/empty
      `Optional`s, verified with real output for both cases.
- [ ] You can explain, in your own words, why `Player` doesn't get a
      Lesson-9-style `equals()` override.
- [ ] Commit: `git commit -m "Add Player and BowlingAlley — the kata becomes one part of a larger app"`.

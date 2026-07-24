# Lesson 18: "Show Me Every Player Who..." in One Line

*(The Stream API)*

**What you will build**
Three real queries over the bowling alley's players — who scored 200+,
the combined total of everyone's best games, the average — each written
as one readable pipeline instead of a hand-rolled loop with a mutable
accumulator.

**What you need to know first**
Lesson 16's `Player`/`BowlingAlley`, Lesson 10's method references
(`Player::getName`, already used once in Lesson 16).

---

## Concept Unit: `stream()`, `filter`, `map`, `collect`

### The Problem

"Every player who bowled a 200+ game" is a question every loop-based
approach answers with the same shape: create an empty list, loop, check a
condition, conditionally add, return the list. That shape is worth
recognizing as a pattern with its own name and its own dedicated API.

### The New Code

```java
import java.util.List;
import java.util.stream.Collectors;

public class StreamDemo {
    public static void main(String[] args) {
        Player ada = new Player("Ada");
        ada.recordGame(150);
        ada.recordGame(210);
        Player grace = new Player("Grace");
        grace.recordGame(300);
        Player alan = new Player("Alan");
        alan.recordGame(180);

        List<Player> players = List.of(ada, grace, alan);

        List<String> highScorers = players.stream()
            .filter(p -> p.bestGame() >= 200)
            .map(Player::getName)
            .collect(Collectors.toList());
        System.out.println(highScorers);

        int totalOfBestGames = players.stream()
            .mapToInt(Player::bestGame)
            .sum();
        System.out.println(totalOfBestGames);

        double average = players.stream()
            .mapToInt(Player::bestGame)
            .average()
            .orElse(0.0);
        System.out.println(average);
    }
}
```

Run it:

```bash
javac PlayerComparable.java StreamDemo.java
java StreamDemo
```

Real output — verified this session:

```text
[Ada, Grace]
690
230.0
```

*What this proves:* `[Ada, Grace]` are correctly the two players whose
`bestGame()` is at least `200` (Ada's `210`, Grace's `300`) — Alan's `180`
correctly excluded, with no explicit `if`/loop/mutable list anywhere in
that pipeline. `690` is `210 + 300 + 180`, computed via `.sum()`. `230.0`
is the average of the same three numbers, and `.average()` itself returns
an `OptionalDouble` — Lesson 15's `Optional` pattern reappearing, because
"the average of zero elements" is genuinely undefined, and `.orElse(0.0)`
supplies a sane fallback for that empty case.

### Mechanical walkthrough

1. `players.stream()` — (first appearance) converts a `List<Player>` into
   a `Stream<Player>` — a sequence of elements meant to be processed
   through a pipeline of operations, not accessed by index the way a
   `List` is.
2. `.filter(p -> p.bestGame() >= 200)` — (first appearance) keeps only
   elements matching a condition, expressed as a lambda — the same lambda
   syntax already used for `ScoringStrategy` implementations and
   `Comparator`.
3. `.map(Player::getName)` — (hard concept reappearing) Lesson 16's
   method-reference syntax, transforming each remaining `Player` into its
   `String` name.
4. `.collect(Collectors.toList())` — (first appearance) a **terminal
   operation** — nothing in the pipeline actually runs until this final
   step is reached; `filter`/`map` alone describe a plan, `collect`
   executes it and produces a real `List<String>`.
5. `.mapToInt(Player::bestGame)` — (first appearance) a specialized `map`
   producing a primitive `int` stream (`IntStream`) instead of a boxed
   `Stream<Integer>` — avoiding Lesson 0's autoboxing overhead for the
   arithmetic that follows.
6. `.sum()` / `.average()` — built-in `IntStream` terminal operations —
   no manual accumulator variable anywhere.

### CS Lens

This is the same **map/filter/reduce** family this repo's own Frontend
Client and React Studio projects use in TypeScript, and Kotlin's own
collection functions (this curriculum's Kotlin course) mirror almost
exactly — a widely-recognized functional-programming pattern for
transforming and querying collections declaratively, describing *what*
result you want rather than *how* to loop to get it.

### SE Lens

Why prefer this over a plain `for` loop, given both produce the same
result? Readability and reduced mistake surface: a hand-written loop needs
a correctly-initialized accumulator, a correct loop condition, and a
correct accumulation step — three separate places to get subtly wrong.
`players.stream().filter(...).map(...).collect(...)` reads, left to
right, as a direct description of the actual question being asked — "of
these players, keep the high scorers, get their names, collect them" —
with no mutable loop state to manage by hand at all.

### Connection

Lesson 20's console menu uses these exact same stream queries to power
real menu options ("show top scorers," "show average score") — this
lesson's pipelines are the app's actual query layer, not a syntax
demonstration.

---

## Closing

### Connect the pieces

`stream()` (unit 1) turns a `List<Player>` into a pipeline;
`filter`/`map`/`collect` answer "who qualifies, and what do I want back"
in one readable chain, verified to correctly identify Ada and Grace as
the 200+ scorers. `mapToInt`/`sum`/`average` answer aggregate questions
the same declarative way, with `average()`'s `OptionalDouble` correctly
handling the "no players at all" edge case via `Optional`'s own pattern.

### What breaks without this

Call `.average()` on an empty `players` list (an empty `List.of()`) and
call `.getAsDouble()` directly instead of `.orElse(0.0)`. Real,
observable failure: a `NoSuchElementException` — the exact same category
of mistake Lesson 15 already demonstrated with a bare `Optional.get()` on
an empty value, now via `OptionalDouble`'s equivalent accessor. Restore
`.orElse(0.0)` and the empty case is handled gracefully.

### Exercises

- Add a fourth player with no recorded games at all (`bestGame()`
  correctly returns `0`) and confirm the high-scorer filter correctly
  excludes them.
- Rewrite one of these three pipelines as a plain `for` loop with a
  manual accumulator, side by side with the stream version — which reads
  more clearly to you, and why?

### Definition of done

- [ ] All three stream queries produce correct, verified output.
- [ ] You triggered the real `NoSuchElementException` from an unguarded
      `OptionalDouble` on an empty stream.
- [ ] You can explain, in your own words, what a "terminal operation" is
      and why `filter`/`map` alone don't do anything until one is reached.
- [ ] Commit: `git commit -m "Add stream-based queries — high scorers, total, and average of best games"`.

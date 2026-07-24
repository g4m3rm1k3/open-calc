# Lesson 20: A Real, Usable Program

*(A Text Console via `Scanner`)*

**What you will build**
A menu-driven console tying together everything built since Lesson 16:
add a player, record a game, show the leaderboard (Lesson 17), show high
scorers (Lesson 18), save and load (Lesson 19) — a genuinely usable
program, not a collection of separately-tested classes.

**What you need to know first**
Every class built in Epic 3 so far — this lesson wires them together, it
doesn't introduce new domain logic.

---

## Concept Unit: `Scanner` and a Menu Loop

### The Problem

Every feature built so far is only reachable by writing a new `main`
method or a new test. A real user needs an actual way to interact with
the program while it's running.

### Introduce the concept in isolation

```java
import java.util.Scanner;

public class ConsoleDemo {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        boolean running = true;
        while (running) {
            System.out.println("1) Say hello  2) Add numbers  3) Quit");
            System.out.print("> ");
            String choice = scanner.nextLine();
            switch (choice) {
                case "1":
                    System.out.println("Hello!");
                    break;
                case "2":
                    System.out.print("First number: ");
                    int a = Integer.parseInt(scanner.nextLine());
                    System.out.print("Second number: ");
                    int b = Integer.parseInt(scanner.nextLine());
                    System.out.println("Sum: " + (a + b));
                    break;
                case "3":
                    running = false;
                    break;
                default:
                    System.out.println("Unknown option");
            }
        }
        System.out.println("Goodbye!");
    }
}
```

Run it, feeding it simulated input instead of typing live (useful for
verifying it actually works, exactly as done here):

```bash
javac ConsoleDemo.java
printf "1\n2\n3\n4\n3\n" | java ConsoleDemo
```

Real output — verified this session:

```text
1) Say hello  2) Add numbers  3) Quit
> Hello!
1) Say hello  2) Add numbers  3) Quit
> First number: Second number: Sum: 7
1) Say hello  2) Add numbers  3) Quit
> Goodbye!
```

*What this proves:* `Scanner(System.in)` reads real lines typed at the
program (or, as verified here, piped in) — option `1` prints a greeting,
option `2` reads two more lines and adds them (`3 + 4 = 7`), option `3`
exits the loop cleanly. The whole thing genuinely responds to real input,
line by line, in order.

### Discard the throwaway example

Deleted. The real console reuses this exact `Scanner`/`while`/`switch`
shape, wired to `BowlingAlley` instead of toy arithmetic.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `AlleyConsole.java`, the program's real
  entry point.
- **Change type:** Add.
- **Location:** New `main` method.
- **Dependencies:** `BowlingAlley`, `Player`, `AlleyPersistence`,
  Lesson 18's stream queries.

### The New Code

```java
import java.nio.file.Path;
import java.util.List;
import java.util.Scanner;
import java.util.stream.Collectors;

public class AlleyConsole {
    private static final Path SAVE_FILE = Path.of("alley.csv");

    public static void main(String[] args) throws Exception {
        BowlingAlley alley = new BowlingAlley();
        for (Player p : AlleyPersistence.load(SAVE_FILE)) {
            alley.addPlayer(p);
        }

        Scanner scanner = new Scanner(System.in);
        boolean running = true;
        while (running) {
            System.out.println("1) Add player  2) Record game  3) Leaderboard  4) High scorers  5) Save & quit");
            System.out.print("> ");
            switch (scanner.nextLine()) {
                case "1":
                    System.out.print("Player name: ");
                    alley.addPlayer(new Player(scanner.nextLine()));
                    break;
                case "2":
                    System.out.print("Player name: ");
                    String name = scanner.nextLine();
                    System.out.print("Game score: ");
                    int score = Integer.parseInt(scanner.nextLine());
                    alley.findPlayer(name).ifPresentOrElse(
                        p -> p.recordGame(score),
                        () -> System.out.println("No such player.")
                    );
                    break;
                case "3":
                    Leaderboard<Player> board = new Leaderboard<>();
                    for (Player p : alley.allPlayers()) board.add(p);
                    System.out.println(board.ranked());
                    break;
                case "4":
                    List<String> highScorers = alley.allPlayers().stream()
                        .filter(p -> p.bestGame() >= 200)
                        .map(Player::getName)
                        .collect(Collectors.toList());
                    System.out.println(highScorers);
                    break;
                case "5":
                    AlleyPersistence.save(SAVE_FILE, alley.allPlayers());
                    running = false;
                    break;
                default:
                    System.out.println("Unknown option.");
            }
        }
        System.out.println("Saved. Goodbye!");
    }
}
```

### Mechanical walkthrough

1. `ifPresentOrElse(p -> p.recordGame(score), () -> System.out.println(...))`
   — (first appearance) `Optional`'s two-branch handler — the first
   lambda runs if a value is present, the second if it's empty — a
   single, direct expression of "do this, or do that instead," replacing
   an explicit `if (optional.isPresent()) { ... } else { ... }`.
2. Every other line reuses a method built in an earlier lesson exactly as
   it already existed — `AlleyPersistence.load`/`save` (Lesson 19),
   `Leaderboard<Player>` (Lessons 13 and 17), the stream query (Lesson
   18) — this lesson's own new code is entirely the menu wiring itself.

### CS Lens

This is a **read-eval-print loop** (REPL) shape — read one line of input,
interpret it, print a result, repeat — the same fundamental interaction
pattern behind every interactive shell, database client, and this
curriculum's own script-based verification sessions throughout this
course.

### SE Lens

Why does `main` load from `SAVE_FILE` at startup and only save on exit,
rather than saving after every single change? A real, honest tradeoff:
saving on every change guarantees no data loss if the program crashes
mid-session, at the cost of a disk write on every single action; saving
only on clean exit is simpler and faster, at the cost of losing
everything since the last save if the program crashes or is killed
first. This app picks the simpler option — a reasonable choice for a
small, low-stakes bowling alley tracker, and a real, nameable tradeoff
worth recognizing rather than an oversight.

### Connection

This is the full, working application — every lesson from 16 through 20
is now one real, runnable program, reachable from a genuine text menu.

---

## Closing

### Connect the pieces

`Scanner`'s read-a-line-at-a-time loop (unit 1), proven with simulated
piped input, becomes the real console's interaction model. The actual
console (unit 2) is almost entirely wiring — every substantive piece
(persistence, leaderboard, stream queries) was already built and verified
in earlier lessons; this lesson's job was connecting them into one program
a real person can actually run and use.

### What breaks without this

Type an unparseable value at the "Game score" prompt (e.g., the letters
`"abc"` instead of a number). Real, observable failure: a
`NumberFormatException` from `Integer.parseInt("abc")`, crashing the
whole program instead of showing a clean error and returning to the menu
— a real, honest gap worth naming: this console doesn't yet validate its
own input the careful way Lesson 11 validated `roll()`'s input. Fixing it
(wrapping the parse in a `try`/`catch` and looping back to the menu on
failure) is a natural, concrete exercise.

### Exercises

- Trigger the real `NumberFormatException` crash yourself, then fix it
  with a `try`/`catch` around the parse, looping back to the menu instead
  of crashing.
- Add a sixth menu option using Lesson 18's average-score query.

### Definition of done

- [ ] The console runs, and every menu option works, verified with
      simulated piped input the same way this lesson's own examples were.
- [ ] Data saved on exit is correctly reloaded the next time the program
      starts.
- [ ] You triggered the real unparseable-input crash and fixed it
      yourself.
- [ ] Commit: `git commit -m "Add a real text console — every feature from Epic 3 is now one runnable program"`.

# Lesson 19: Surviving Closing the Program

*(Persistence via `java.nio.file`)*

**What you will build**
Saving every player's game history to a plain text file, and reloading it
back into real `Player` objects — the bowling alley survives closing and
reopening the program.

**What you need to know first**
Lesson 11's checked-exception distinction — file I/O is where checked
exceptions genuinely earn their keep, verified directly in this lesson.

---

## Concept Unit: `Files.write`/`Files.readAllLines`, and a Real Checked Exception

### The Problem

Everything built so far lives only in memory — closing the program loses
it all. Writing to and reading from a real file is Java's most common
genuinely-checked-exception-worthy operation: a file might not exist,
might be unreadable, might be on a full disk — failures a caller
realistically needs to *decide how to handle*, not just crash on.

### Introduce the concept in isolation

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class PersistenceDemo {
    public static void main(String[] args) throws IOException {
        Path file = Path.of("scores.txt");
        List<String> lines = List.of("Ada,150", "Ada,210", "Grace,300");
        Files.write(file, lines);
        System.out.println("Wrote " + lines.size() + " lines");

        List<String> readBack = Files.readAllLines(file);
        System.out.println(readBack);

        Files.delete(file);
        System.out.println("File exists after delete: " + Files.exists(file));
    }
}
```

Run it:

```bash
javac PersistenceDemo.java
java PersistenceDemo
```

Real output — verified this session:

```text
Wrote 3 lines
[Ada,150, Ada,210, Grace,300]
File exists after delete: false
```

*What this proves:* `Files.write`/`Files.readAllLines` work with plain
`List<String>` — one line per list entry — and `main`'s own `throws
IOException` (Lesson 11's checked-exception mechanism, required here by
the compiler) is what let this compile at all without a `try`/`catch`.

### Seeing the checked exception fire for real

```java
import java.nio.file.Files;
import java.nio.file.Path;

public class MissingFileDemo {
    public static void main(String[] args) throws java.io.IOException {
        Files.readAllLines(Path.of("does-not-exist.txt"));
    }
}
```

Run it:

```bash
javac MissingFileDemo.java
java MissingFileDemo
```

Real output — verified this session:

```text
Exception in thread "main" java.nio.file.NoSuchFileException: does-not-exist.txt
	at java.base/sun.nio.fs.UnixFileSystemProvider.newByteChannel(UnixFileSystemProvider.java:261)
	...
	at MissingFileDemo.main(MissingFileDemo.java:6)
```

*What this proves:* `NoSuchFileException` is a real subclass of the
checked `IOException` — exactly the category Lesson 11 named as the
right fit for checked exceptions: a failure a caller might reasonably
want to catch and recover from (perhaps by creating a fresh, empty file
instead of crashing), not a programmer error like `InvalidRollException`.

### Discard the throwaway examples

Both discarded. Real save/load logic for `Player` data moves into the
project.

---

## Concept Unit: Round-Tripping Real `Player` Objects

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `AlleyPersistence.java`.
- **Change type:** Add.
- **Location:** New class with `save`/`load` static methods.
- **Dependencies:** `Player`, `java.nio.file.*`.

### The New Code

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

class AlleyPersistence {
    static void save(Path file, List<Player> players) throws IOException {
        List<String> lines = new ArrayList<>();
        for (Player p : players) {
            for (int score : p.getGameScores()) {
                lines.add(p.getName() + "," + score);
            }
        }
        Files.write(file, lines);
    }

    static List<Player> load(Path file) throws IOException {
        List<Player> players = new ArrayList<>();
        for (String line : Files.readAllLines(file)) {
            String[] parts = line.split(",");
            String name = parts[0];
            int score = Integer.parseInt(parts[1]);

            Player existing = null;
            for (Player p : players) {
                if (p.getName().equals(name)) existing = p;
            }
            if (existing == null) {
                existing = new Player(name);
                players.add(existing);
            }
            existing.recordGame(score);
        }
        return players;
    }
}
```

### Run it

Real output — verified this session:

```text
Ada: [150, 210] best=210
Grace: [300] best=300
```

*What this proves:* two players, several games between them, saved to one
flat CSV-style file and reloaded — correctly reconstructing the same
`Player` objects with the same game history, including correctly grouping
Ada's two separate lines back into one `Player` with two recorded games.

### Mechanical walkthrough

1. `for (int score : p.getGameScores())` — writes one line per *game*,
   not per player — a player with three games produces three lines,
   sharing the same name.
2. `line.split(",")` — (first appearance) splits a `String` on a
   delimiter into a `String[]` — the inverse of the concatenation used
   when saving.
3. The `existing`/linear-search-by-name pattern in `load` — (hard concept
   reappearing) the exact same "search a list for a matching name" shape
   `BowlingAlley.findPlayer` (Lesson 16) already used, here inlined
   because `load` is reconstructing the player list from scratch, before
   a `BowlingAlley` even exists to search.

### CS Lens

This is **serialization** — converting an in-memory object graph
(`Player` objects and their lists) into a flat, storable text
representation, and **deserialization** — the reverse. A real, if
simplified, instance of the same problem every persistence layer this
repo's other projects handle with SQLite (WPF course) or Room (Kotlin
course) solves — this project's version is deliberately simpler (plain
text, no schema, no query language) because a bowling alley's data is
genuinely simple enough not to need a real database yet.

### SE Lens

Why plain CSV-style text instead of a real database? An honest scope
choice, matching this course's "touch on things" brief — a real
production version would likely reach for SQLite (as this curriculum's
other courses do) once queries got more complex than "load everything, in
memory, every time." Plain text is completely adequate for a small
bowling alley's data and keeps this lesson's focus on `java.nio.file`
itself, not database setup.

### Connection

Lesson 20's console loads this exact file at startup and saves it before
exiting — the last piece connecting everything built since Lesson 16 into
one real, runnable program.

---

## Closing

### Connect the pieces

`Files.write`/`Files.readAllLines` (unit 1) work with plain
`List<String>`, and a genuinely missing file throws a real, checked
`NoSuchFileException` — exactly the category of recoverable failure
Lesson 11 said checked exceptions are for. `AlleyPersistence` (unit 2)
round-trips real `Player` objects through a simple CSV-style format,
verified to correctly reconstruct multiple games per player.

### What breaks without this

Corrupt one line in a saved file by hand (delete the comma, leaving
`Ada210` instead of `Ada,210`) and try to `load` it. Real, observable
failure: `line.split(",")` on `"Ada210"` produces a one-element array
(no comma to split on), and `parts[1]` throws an
`ArrayIndexOutOfBoundsException` — a real, honest gap in this simple
format's error handling, worth naming rather than hiding: production code
reading external data should validate each line's shape before parsing
it, exactly Lesson 11's "trusting input at a boundary" principle, applied
to a file instead of a method argument.

### Exercises

- Trigger the real `ArrayIndexOutOfBoundsException` from a corrupted line
  yourself, then add a defensive check (`parts.length == 2`) that skips
  or reports malformed lines instead of crashing.
- Add a `saveOne`/append mode, so a single new game can be recorded to
  disk without rewriting the entire file.

### Definition of done

- [ ] `save`/`load` correctly round-trip multiple players with multiple
      games each, verified with real output.
- [ ] You triggered the real `NoSuchFileException` and can explain why
      it's checked.
- [ ] You triggered the real corrupted-line crash and added at least a
      basic defensive check for it.
- [ ] Commit: `git commit -m "Add file-based persistence — the bowling alley survives closing the program"`.

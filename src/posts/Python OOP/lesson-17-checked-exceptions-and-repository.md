# Lesson 17: A Failure the Compiler Won't Let You Ignore
### (Project 7 — Inventory Management System, Java)

**What you will build.** A real `ProductRepository`, saving and loading
`Inventory` to and from a file on disk — Project 1, Lesson 2's own
pattern, rebuilt in Java — running directly into Java's **checked
exceptions**: a real, compiler-enforced requirement to acknowledge that
file I/O can fail, with no equivalent anywhere in Python or JavaScript
across sixteen prior lessons. The transferable problem this lesson is
actually about: a language that won't let "this might fail" stay
implicit, and what that costs and buys compared to every prior project's
habit of finding failures by actually triggering them at runtime.

**What you need to know first.** Project 1, Lesson 2 — the Repository
shape itself: a list, a save method, a load method, and the honest
`FileNotFoundError` that lesson deliberately triggered. Lesson 16 —
`Inventory`, `Product.ProductBuilder`.

---

## Concept Unit: Checked Exceptions

### The Problem

Every file operation across Phase 1 and Phase 2 could fail — Project 1,
Lesson 2's `NoteRepository.load()` raised a real `FileNotFoundError` the
first time it was tried against a file that didn't exist yet, and
nothing in Python *forced* that possibility to be acknowledged before
the program ran; it was only discovered by actually triggering it. Java
handles file I/O differently, and this unit exists to hit that
difference directly, in real code, not read about it.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `CheckedExceptionLab.java` (throwaway,
  this unit only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — none beyond the JDK.

### The New Code

```java
import java.io.FileReader;
import java.io.IOException;

public class CheckedExceptionLab {
    public static void main(String[] args) {
        FileReader reader = new FileReader("does-not-exist.txt");
    }
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```
$ javac CheckedExceptionLab.java
CheckedExceptionLab.java:6: error: unreported exception FileNotFoundException; must be caught or declared to be thrown
        FileReader reader = new FileReader("does-not-exist.txt");
                            ^
1 error
```

This program never ran — `javac` refused to compile it at all, not
because of a type mismatch (Lesson 15's territory), but because
`FileReader`'s own constructor is declared as capable of throwing
`FileNotFoundException`, and Java requires every caller of a method
that can throw this specific *category* of exception to explicitly
acknowledge it — either by catching it, or by declaring that the
calling method can throw it too. This category is called a **checked
exception**: checked by the compiler, at compile time, the same
guarantee Lesson 15 proved for types, now applied to "this operation
might fail."

Fix one — catch it directly:

```java
try {
    FileReader reader = new FileReader("does-not-exist.txt");
} catch (IOException e) {
    System.out.println("Caught it: " + e.getMessage());
}
```

Real output:

```
Caught it: does-not-exist.txt (No such file or directory)
```

Fix two — declare that this method can throw it too, pushing the
requirement to whoever calls *this* method instead:

```java
public static void main(String[] args) throws IOException {
    FileReader reader = new FileReader("does-not-exist.txt");
}
```

Real output — this one compiles, runs, and then genuinely crashes,
since nothing ever caught it:

```
Exception in thread "main" java.io.FileNotFoundException: does-not-exist.txt (No such file or directory)
	at java.base/java.io.FileReader.<init>(FileReader.java:60)
	at CheckedExceptionThrows.main(CheckedExceptionThrows.java:6)
```

Both are legal, compilable answers to the same requirement — the
compiler doesn't demand the failure be *handled gracefully*, only that
it be *acknowledged explicitly*, one way or the other, somewhere in the
chain of callers.

### Discard the throwaway example

`CheckedExceptionLab` and its two fixed variants are deleted — they only
existed to prove the compile-time requirement is real, and to show both
legal ways of satisfying it, isolated from `ProductRepository` entirely.

### Mechanical walkthrough

- `new FileReader("does-not-exist.txt")` — **(a) first appearance** of
  `FileReader`: opens a file for reading text — attempting to open a
  file that doesn't exist is precisely the operation Java's compiler
  refuses to let go unacknowledged.
- `try { ... } catch (IOException e) { ... }` — **(a) first
  appearance** of Java's exception-handling syntax: structurally similar
  to Python's `try`/`except` (Project 3, Lesson 8), catching any
  `IOException` — `FileNotFoundException` is a more specific *subtype*
  of `IOException`, which is why catching the broader `IOException`
  here covers it.
- `e.getMessage()` — **(a) first appearance.** Every caught exception
  object carries a human-readable description of what went wrong,
  retrieved with `.getMessage()`.
- `public static void main(String[] args) throws IOException {` — **(a)
  first appearance** of a `throws` clause on a method signature: a
  declaration, not a statement — it doesn't throw anything itself, it
  states "calling this method might result in an `IOException`
  escaping it," shifting the compiler's requirement onto whoever calls
  *this* method.

### CS lens

Checked exceptions are Java's own answer to a real, general software
engineering question: should "this operation can fail" be part of a
function's *interface* — something a caller is forced to see and
acknowledge, the way a return type is — or left implicit, discoverable
only by reading documentation or hitting the failure at runtime? Also
recognized in: Rust's `Result` type (a different mechanism, similar
underlying goal — failure made explicit in a function's own signature),
Go's convention of returning an explicit `error` value from any
fallible call, checked by the caller by hand.

### SE lens

The real tradeoff, worth stating honestly: checked exceptions genuinely
catch a real category of oversight — forgetting that a file operation
can fail — before the program ships, the same way static typing caught
type mismatches in Lesson 15. The real cost, and a famous, ongoing
debate inside the Java community itself: they can turn into pure
ceremony once a method only ever calls another method that only ever
calls another that eventually might throw, forcing `throws IOException`
to be added mechanically at every layer, whether or not that specific
caller has any meaningful way to actually handle the failure. This
project uses them because file persistence is exactly the case they're
genuinely good for — a real operation, with a real, meaningful failure
mode a caller should decide how to handle.

### Commands needed

Same `javac`/`java` pattern as every Java lesson so far.

### Run it

Shown above, all three variants.

### Connecting sentence

File operations in Java come with a real, compiler-enforced
acknowledgment that they can fail — the next unit builds this project's
actual file-backed Repository directly against that requirement.

---

## Concept Unit: Reading and Writing Files

### The Problem

`ProductRepository` needs to actually write `Product`s to a file and
read them back — the same core need Project 1, Lesson 2 solved with
Python's `json` module. Java has no JSON support built into its
standard library at all; something simpler, hand-rolled, is needed
first.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `Product.java`.
- **Change type** — add.
- **Location** — inside `class Product`, two new methods.
- **Dependencies** — none new.

### The New Code

```java
    public String toLine() {
        return name + "|" + price + "|" + sku + "|" + description + "|" + quantity;
    }

    public static Product fromLine(String line) {
        String[] fields = line.split("\\|", -1);
        return new ProductBuilder(fields[0], Double.parseDouble(fields[1]), fields[2])
            .setDescription(fields[3])
            .setQuantity(Integer.parseInt(fields[4]))
            .build();
    }
```

### The Updated Project

```java
    public String summary() {
        return name + " (" + sku + "): $" + price + " x" + quantity;
    }

    public String toLine() {                                             // ← new
        return name + "|" + price + "|" + sku + "|" + description + "|" + quantity;  // ← new
    }

    public static Product fromLine(String line) {                          // ← new
        String[] fields = line.split("\\|", -1);                            // ← new
        return new ProductBuilder(fields[0], Double.parseDouble(fields[1]), fields[2])  // ← new
            .setDescription(fields[3])                                       // ← new
            .setQuantity(Integer.parseInt(fields[4]))                         // ← new
            .build();                                                          // ← new
    }
```

`Product` now has the same object-to-plain-data-and-back capability
`to_dict()`/`from_dict()` gave `Note` in Project 1, Lesson 2 — here,
plain-text lines instead of dicts, since nothing in Java's standard
library provides the dict-like intermediate structure Python and
JavaScript both had for free.

### Introduce the concept in isolation

No separate lab needed — `String` concatenation, `.split()`, and static
factory methods (Lesson 15's `RegularPricing`-style construction, and
Lesson 16's `ProductBuilder` itself) are all already proven; what's
genuinely new is `.split()` itself, explained directly below against
the real code, since a fabricated example would need the identical
explanation.

### Discard the throwaway example

Not applicable.

### Mechanical walkthrough

- `name + "|" + price + "|" + sku + "|" + description + "|" + quantity`
  — **(b) hard concept reappearing**: `+` concatenation, proven safe for
  mixing `String`, `double`, and `int` back in Lesson 15's
  `ConcatCheck` — a `|` character chosen deliberately as a separator
  unlikely to appear inside a product name or description, the same
  practical concern Project 1, Lesson 2 never had to think about, since
  JSON has real, structural escaping built in.
- `line.split("\\|", -1)` — **(a) first appearance** of `.split()`: 
  breaks a `String` into an array of pieces wherever a given pattern
  matches — `"\\|"` because `.split()`'s first argument is itself a
  regular expression (Project 5, Lesson 12's own regex concept,
  reappearing here), and `|` is a special regex character meaning
  "or," so it needs escaping (`\\|`) to be matched literally. The
  second argument, `-1`, tells `.split()` to keep *trailing* empty
  strings — without it, a product with an empty `description` (an
  empty string between two `|` characters at the end) would silently
  produce one fewer field than expected.
- `Double.parseDouble(fields[1])` / `Integer.parseInt(fields[4])` —
  **(a) first appearance**: every field read from a file starts as a
  plain `String` — even the ones that represent numbers — since a text
  file has no concept of Java's own types; these two methods parse a
  `String` back into the actual numeric type `Product`'s fields require,
  the direct counterpart to Python's `int(...)`/`float(...)` conversions,
  needed here specifically because Java's static typing (Lesson 15)
  won't silently treat a `String` as a `double` the way a `+` between
  them was shown to do.

### CS lens

This is manual **serialization**, the same concept Project 1, Lesson 2
named for JSON — converting structured, in-memory data to a flat,
storable text format, and back. Also recognized in: CSV files (a very
close relative of this exact delimiter-separated approach), a database's
own on-disk row format, any custom binary protocol.

### SE lens

The alternative — pulling in a real JSON library from outside Java's
standard library — is what most real Java projects would actually do;
this lesson deliberately doesn't, to keep the project dependency-free,
the same reasoning that kept Phase 1 and Phase 2 on standard-library
tools wherever reasonable. The real cost of the hand-rolled version,
worth naming honestly: it's fragile in a way JSON isn't — a product
description that happened to contain a literal `|` character would
silently corrupt the file's structure, a real bug this lesson's simple
format doesn't protect against and Project 1's JSON-based version never
had to worry about at all.

### Commands needed

None new.

### Run it

Deferred to the next unit, where these methods are actually exercised
against a real file.

### Connecting sentence

`Product` can now become a line of text and back — the next unit wraps
that ability, plus real file I/O, plus this lesson's checked-exception
requirement, into one real `ProductRepository`.

---

## Concept Unit: `ProductRepository`

### The Problem

Everything's in place — `Inventory` to hold products, `toLine`/`fromLine`
to convert them to and from text, and this lesson's own proof that file
I/O forces explicit acknowledgment of failure. What's missing is the one
object that ties all three together, the way `NoteRepository` did back
in Project 1, Lesson 2.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `ProductRepository.java`.
- **Change type** — add.
- **Location** — new file, alongside `Product.java`, `Inventory.java`.
- **Dependencies** — `java.io.BufferedReader`, `BufferedWriter`,
  `FileReader`, `FileWriter`, `IOException` — all standard library.

### The New Code

```java
public class ProductRepository {
    private String path;
    private Inventory inventory = new Inventory();

    public ProductRepository(String path) {
        this.path = path;
    }

    public void add(Product product) {
        inventory.add(product);
    }

    public ArrayList<Product> all() {
        return inventory.all();
    }

    public void save() throws IOException {
        BufferedWriter writer = new BufferedWriter(new FileWriter(path));
        for (Product product : inventory.all()) {
            writer.write(product.toLine());
            writer.newLine();
        }
        writer.close();
    }

    public void load() throws IOException {
        inventory = new Inventory();
        BufferedReader reader = new BufferedReader(new FileReader(path));
        String line;
        while ((line = reader.readLine()) != null) {
            inventory.add(Product.fromLine(line));
        }
        reader.close();
    }
}
```

### The Updated Project

Brand-new file, shown whole above — `ProductRepository` wraps
`Inventory` the same way Project 1's `NoteRepository` wrapped a plain
list: `add`/`all` delegate straight through, and `save`/`load` are the
genuinely new behavior, both declared `throws IOException`, this
lesson's own requirement, satisfied honestly rather than swallowed
silently.

### Mechanical walkthrough

- `private Inventory inventory = new Inventory();` — **(b) hard
  concept reappearing**, field initialization, same as Lesson 16's
  `ProductBuilder` defaults.
- `public void save() throws IOException {` — **(b) hard concept
  reappearing**, this lesson's own `throws` mechanism — `save()` doesn't
  handle the failure itself; it declares that *its own caller* must.
- `BufferedWriter writer = new BufferedWriter(new FileWriter(path));` —
  **(a) first appearance** of wrapping one stream type in another:
  `FileWriter` writes raw characters to a file; `BufferedWriter` wraps
  it to batch writes efficiently rather than touching the disk on every
  single call — a real Adapter-shaped composition (Project 3, Lesson 9),
  though used here for a performance reason rather than an interface
  mismatch.
- `for (Product product : inventory.all()) { writer.write(product.toLine()); writer.newLine(); }`
  — **(b) hard concept reappearing**: the enhanced `for` loop from
  Lesson 16's `Inventory.all()` walkthrough, calling this lesson's
  `toLine()` once per product.
- `writer.close();` — **(a) first appearance**, conceptually: closing a
  file explicitly — unlike Python's `with` statement (Project 1, Lesson
  2) or JavaScript's automatic garbage collection, Java's basic
  `FileWriter`/`BufferedWriter` require an explicit `.close()` call to
  guarantee everything written is actually flushed to disk; forgetting
  it is a real, easy mistake with no compiler warning — worth naming
  honestly as a rough edge this lesson's simple version doesn't fully
  protect against (Java's own `try`-with-resources syntax exists
  specifically to fix this, a natural next step flagged as an exercise).
- `inventory = new Inventory(); ... while ((line = reader.readLine()) != null) { inventory.add(Product.fromLine(line)); }`
  — **(a) first appearance** of this specific loop shape: `readLine()`
  returns `null` once the file's end is reached, and assigning it to
  `line` *inside* the `while` condition itself, then checking that
  assignment against `null` in the same expression, is idiomatic Java
  for "keep reading lines until there are none left" — a real,
  common Java idiom with no direct Python or JavaScript equivalent
  used so far in this curriculum.

### CS lens

`ProductRepository` is the Repository pattern, named already back in
Project 1, Lesson 2 — nothing new to add here beyond the application
itself, plus one detail worth stating precisely: this repository's
`save`/`load` are the *only* two methods in this entire project that
touch a file directly — `Inventory`, `Product`, and every pricing
strategy remain completely unaware that persistence exists at all,
exactly the separation Project 1's own Repository first established.

### SE lens

The `throws IOException` on both `save` and `load` means this
repository *cannot* be used without the caller acknowledging that
persistence might fail — a stronger guarantee than Project 1's own
`NoteRepository`, where nothing forced a caller to even consider that
`load()` might raise `FileNotFoundError` until it actually did, live, in
Lesson 2's own closing section. That's the real, concrete payoff of
checked exceptions this whole lesson has been building toward: the
exact same category of oversight Project 1 discovered by triggering it
is, here, impossible to compile past without addressing.

### Commands needed

`javac Product.java Inventory.java ProductRepository.java
RepositoryDemo.java` (plus `PricingStrategy.java` and its
implementations, since `Product` depends on them) — every dependent
file compiled together, same pattern as Lesson 16.

### Run it

```java
ProductRepository repo = new ProductRepository("products.txt");
repo.add(new Product.ProductBuilder("Widget", 9.99, "W-001").setQuantity(50).build());
repo.add(new Product.ProductBuilder("Gadget", 19.99, "G-002")
    .setDescription("A fancy gadget").setQuantity(10).build());

try {
    repo.save();
    System.out.println("Saved successfully.");
} catch (IOException e) {
    System.out.println("Save failed: " + e.getMessage());
}

ProductRepository reloaded = new ProductRepository("products.txt");
try {
    reloaded.load();
    System.out.println("Reloaded products:");
    for (Product p : reloaded.all()) {
        System.out.println("  " + p.summary());
    }
} catch (IOException e) {
    System.out.println("Load failed: " + e.getMessage());
}

System.out.println("--- trying to load a repository that was never saved ---");
ProductRepository missing = new ProductRepository("nonexistent.txt");
try {
    missing.load();
} catch (IOException e) {
    System.out.println("Load failed as expected: " + e.getMessage());
}
```

Real output:

```
Saved successfully.
Reloaded products:
  Gadget (G-002): $19.99 x10
  Widget (W-001): $9.99 x50
--- trying to load a repository that was never saved ---
Load failed as expected: nonexistent.txt (No such file or directory)
```

And the actual file written to disk:

```
Gadget|19.99|G-002|A fancy gadget|10
Widget|9.99|W-001||50
```

Two real, distinct proofs in one run: a genuine save-then-load round
trip through a *separate* `ProductRepository` instance (the same
cross-instance proof Project 1, Lesson 2 and Project 3, Lesson 8 both
used), and a real, cleanly caught `IOException` from loading a
repository that was never saved — the exact failure Project 1's own
closing section triggered as an uncaught crash, here caught
deliberately, because the compiler never allowed the possibility to be
ignored in the first place.

### Connecting sentence

Every idea in this lesson now lives in one working object: file I/O,
manual serialization, and a checked-exception contract that makes
"persistence can fail" impossible to compile past without a real
decision — save, load, and the honest acknowledgment of failure, all in
one place.

---

## Closing

**Connect the pieces.** One product, through the whole lesson:
`new Product.ProductBuilder("Gadget", 19.99, "G-002").setDescription("A fancy gadget").setQuantity(10).build()`
is added to a `ProductRepository`; `repo.save()` calls `product.toLine()`,
producing `"Gadget|19.99|G-002|A fancy gadget|10"`, written to
`products.txt` via a `BufferedWriter` — all inside a method whose
`throws IOException` forced `RepositoryDemo` to wrap the call in a real
`try`/`catch`. A separate `ProductRepository` instance later calls
`load()`, reading that exact line back with `readLine()`, and
`Product.fromLine(...)` splits it on `|`, parses the numeric fields back
from text, and rebuilds a real `Product` — indistinguishable from the
original, confirmed by the matching `summary()` output.

**What breaks without this.** Already shown directly in this lesson's
own units — the compile error from an unacknowledged `FileNotFoundException`,
and the real, cleanly caught `IOException` from loading a
never-saved repository — deliberately not repeated as separate
manufactured failures here, since both landed inside real, working
project code exactly where they mattered.

**Exercises.**
1. `ProductRepository.save()`'s `writer.close()` never runs if
   `writer.write(...)` throws partway through the loop — look up Java's
   **try-with-resources** syntax (`try (BufferedWriter writer = ...) { ... }`)
   and rewrite `save`/`load` to use it, guaranteeing the file is closed
   even if something fails mid-write.
2. This lesson's `|`-delimited format would break if a product's
   `description` ever contained a literal `|` character. Reproduce that
   corruption for real — add a product with `|` in its description,
   save, reload, and observe the wrong result — then decide (and
   implement) a real fix.
3. Write a small test (following Project 1, Lesson 4's `pytest`
   reasoning, using whichever Java testing approach you set up) proving
   `save()` followed by `load()` on a fresh `ProductRepository` produces
   a product list identical to what was added, field for field.

**Definition of done.**
- [ ] You've triggered the real compile error from an unacknowledged
      checked exception, and fixed it both ways — catching it, and
      declaring `throws` — confirmed with real output for both.
- [ ] `ProductRepository.save()`/`load()` correctly round-trip real
      `Product`s through a real file on disk, confirmed against the
      exact output shown above, including the raw file contents.
- [ ] You've triggered a real `IOException` from loading a
      never-saved repository, caught it cleanly, and can explain why
      Java's compiler made that possibility impossible to silently
      ignore.
- [ ] Commit with a message explaining why — e.g. `"Persist Inventory
      through a Repository backed by manual serialization, with
      save/load declaring IOException so callers can't ignore
      persistence failures"` — not `"add file saving"`.

**Next lesson** stays in Project 7, closing it: `Decorator` and
`Template Method`, once pricing and reporting both need behavior layered
on top of a base case without modifying it directly — and a first look
at why Java's `enum` is a real, compiler-checked type, not just a set of
named constants.

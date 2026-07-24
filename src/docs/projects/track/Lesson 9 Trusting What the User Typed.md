# Lesson 9: Trusting What the User Typed — EditText, Input Types, and Validation

**What you will build:** A real `AddItemActivity` with a form — name,
quantity, and location fields — reachable from a new button on the
inventory list, that checks what the user typed before accepting it.
The transferable problem: every piece of user input arrives as an
untyped, unvalidated `String`, no matter what keyboard Android shows for
it. "The user typed a number" is a suggestion to the keyboard, not a
guarantee to your code — and the moment you call something like
`Integer.parseInt` on text a human actually typed, you are trusting
input from the least reliable source your program has. This lesson is
about the boundary between "what arrived" and "what you're willing to
act on."

**What you need to know first:** Lesson 3 (`ConstraintLayout`, `dp`/`sp`),
Lesson 4 (`Intent`, `startActivity`, wizard-created Activities),
Lesson 7 (`Item`'s constructor and fields).

---

## Concept Unit: `EditText` — a View That Both Displays and Collects Text

### The Problem

Every view so far (`TextView`, `Button`) has been one-directional: your
code sets what it shows, the user only looks or taps. A form needs the
opposite direction too — a view the user *types into*, whose current
content your code can read back out.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `AddItemActivity.java`, new file
  `activity_add_item.xml`, `AndroidManifest.xml` (wizard-managed),
  `activity_inventory.xml`, `InventoryActivity.java`.
- **Change type:** Create, configure, add.
- **Dependencies:** none new.

### The New Code

Create `AddItemActivity` through the same wizard flow as Lesson 4 and
Lesson 8 (right-click package → New → Activity → Empty Views Activity —
**reappearing**, not re-explained). Replace `activity_add_item.xml`:

```xml
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <EditText
        android:id="@+id/nameInput"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_marginTop="48dp"
        android:layout_marginStart="24dp"
        android:layout_marginEnd="24dp"
        android:hint="Item name"
        android:inputType="text"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <EditText
        android:id="@+id/quantityInput"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        android:layout_marginStart="24dp"
        android:layout_marginEnd="24dp"
        android:hint="Quantity"
        android:inputType="number"
        app:layout_constraintTop_toBottomOf="@id/nameInput"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <EditText
        android:id="@+id/locationInput"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        android:layout_marginStart="24dp"
        android:layout_marginEnd="24dp"
        android:hint="Location"
        android:inputType="text"
        app:layout_constraintTop_toBottomOf="@id/quantityInput"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <Button
        android:id="@+id/saveButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="24dp"
        android:text="Save"
        app:layout_constraintTop_toBottomOf="@id/locationInput"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

### The Updated Project

This is a new file replacing the wizard placeholder wholesale — a
`ConstraintLayout` root (reappearing) containing three `EditText`
fields stacked via `toBottomOf` chaining (reappearing pattern from
Lesson 5/8) and a `Save` button anchored below the last one.

### Mechanical Walkthrough

- `android:layout_width="0dp"` — **first appearance of this specific
  value.** Inside a `ConstraintLayout`, `0dp` combined with both `Start`
  and `End` constraints set means "stretch to fill whatever space those
  two constraints leave" — different from `wrap_content` (size to
  content) and `match_parent` (fill the immediate parent regardless of
  siblings), a third sizing behavior specific to constraint-based
  layouts, needed here so each `EditText` spans the screen width minus
  its margins rather than shrinking to fit its (currently empty) text.
- `android:layout_marginStart` / `marginEnd` — reappearing (`margin`,
  Lesson 5), `Start`/`End` variant reappearing from Lesson 3.
- `<EditText ...>` — **first appearance.** A view combining `TextView`'s
  display behavior with an editable, focusable text field the on-screen
  keyboard writes into.
- `android:hint="Item name"` — **first appearance.** Placeholder text
  shown only while the field is empty, automatically disappearing once
  the user types — distinct from `android:text`, which sets *actual*
  content the field would submit if read right now.
- `android:inputType="text"` / `android:inputType="number"` — **first
  appearance.** Tells the on-screen keyboard which layout to show (a
  full keyboard for `text`, a numeric pad for `number`) and gives
  Android's own input filtering a hint about what characters to allow
  at the keyboard level. Worth flagging plainly, since it's the whole
  point of this lesson: **this is a UI hint, not a validation
  guarantee** — a physical keyboard, a paste action, or simply a
  different keyboard app can still put non-numeric characters into a
  `number`-typed field. Nothing here stops that; the next Concept Unit
  is what actually stops it.
- `<Button android:id="@+id/saveButton" ...>` — reappearing (`Button`,
  Lesson 3).

### CS Lens

Separating "what the UI *suggests* is valid" (`inputType`) from "what
your program *enforces* is valid" (checked next unit) is the same shape
as **client-side versus server-side validation** in web development —
the client-side hint (here, the keyboard) is for user convenience and
can always be bypassed; only a check that actually runs in your own
code is a real guarantee. Also recognized in: HTML `<input type="number">`
(purely cosmetic/convenience, easily bypassed), form libraries with
separate "UI mask" and "validation rule" concepts, and API request
schemas that document expected types but still require runtime checks
on the server.

---

## Concept Unit: Reading Back What Was Typed

### The Problem

The three `EditText` fields hold whatever the user types, but nothing
in `AddItemActivity.java` has looked at that content yet.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `AddItemActivity.java`.
- **Change type:** Add.
- **Location:** Inside `onCreate`, wiring `saveButton`'s click.

### The New Code

```java
EditText nameInput = findViewById(R.id.nameInput);
EditText quantityInput = findViewById(R.id.quantityInput);
EditText locationInput = findViewById(R.id.locationInput);
Button saveButton = findViewById(R.id.saveButton);

saveButton.setOnClickListener(v -> {
    String name = nameInput.getText().toString().trim();
    String quantityText = quantityInput.getText().toString().trim();
    String location = locationInput.getText().toString().trim();

    android.util.Log.d("AddItem", "Read: " + name + ", " + quantityText + ", " + location);
});
```

### The Updated Project

```java
public class AddItemActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_item);

        EditText nameInput = findViewById(R.id.nameInput);                          // ← new
        EditText quantityInput = findViewById(R.id.quantityInput);                  // ← new
        EditText locationInput = findViewById(R.id.locationInput);                  // ← new
        Button saveButton = findViewById(R.id.saveButton);                          // ← new

        saveButton.setOnClickListener(v -> {                                        // ← new
            String name = nameInput.getText().toString().trim();                    // ← new
            String quantityText = quantityInput.getText().toString().trim();        // ← new
            String location = locationInput.getText().toString().trim();            // ← new

            android.util.Log.d("AddItem", "Read: " + name + ", " + quantityText + ", " + location); // ← new
        });                                                                          // ← new
    }
}
```

`onCreate` now finds all four form views and, on Save, reads their
current content into local variables — a first, unvalidated pass this
unit stops at deliberately, so the next unit's validation has something
concrete to react to.

### Mechanical Walkthrough

- `findViewById(R.id.nameInput)` (and its three siblings) — reappearing,
  Lesson 4.
- `.getText()` — **first appearance.** Returns an `Editable` — a
  live, mutable text container the `EditText` itself owns, **not** a
  plain `String`. Worth a clause specifically because it's a common
  first mistake: you cannot pass an `Editable` directly wherever a
  `String` is expected.
- `.toString()` — **first appearance in this context**, though the
  method itself is standard on every Java object. Converts the
  `Editable`'s current content into an actual, independent `String`
  snapshot — after this call, later edits to the `EditText` no longer
  affect the variable you stored.
- `.trim()` — **first appearance.** Removes leading and trailing
  whitespace — relevant because a user tapping into a field and tapping
  back out without typing (or typing only spaces) shouldn't count as
  real content, which the next unit's blank check depends on.
- `Log.d(...)` string concatenation — reappearing, Lesson 5/7.

### Run It

Run the app, type into all three fields, tap Save, and check Logcat —
confirm the exact text you typed appears in the `"Read: ..."` line,
proving the read path works before any validation logic complicates it.

---

## Concept Unit: Fail-Fast Validation — Rejecting Bad Input Before It Spreads

### The Problem

Right now, an empty name, a quantity of `"twelve"`, or a quantity of
`"-5"` would all be accepted silently. Left unchecked, bad data doesn't
stay contained — it flows into an `Item`, then into the list, then
(starting Lesson 13) into permanent storage, getting harder to trace
back to its source the further it travels. The fix is to stop it at the
one point where you have the most context to reject it clearly: right
here, at the boundary where user input first enters the program.

### Introduce the Concept in Isolation

Calling `Integer.parseInt` on non-numeric text is a genuinely new kind
of failure you haven't hit yet — it doesn't return a sentinel value
like `-1` or `null`; it throws. See the actual failure first, in
isolation:

```java
public class ParseDemo {
    public static void main(String[] args) {
        System.out.println("Before parse");
        int value = Integer.parseInt("twelve");
        System.out.println("Parsed: " + value);
    }
}
```

```
javac ParseDemo.java
java ParseDemo
```

Output:

```
Before parse
Exception in thread "main" java.lang.NumberFormatException: For input string: "twelve"
	at java.base/java.lang.NumberFormatException.forInputString(NumberFormatException.java:67)
	at java.base/java.lang.Integer.parseInt(Integer.java:668)
	at java.base/java.lang.Integer.parseInt(Integer.java:786)
	at ParseDemo.main(ParseDemo.java:3)
```

This proves the failure mode: `"Parsed: ..."` never printed — execution
stopped dead at the `parseInt` line and unwound out of `main` entirely,
crashing the whole program. Now catch it instead of letting it crash:

```java
public class ParseDemo {
    public static void main(String[] args) {
        String[] inputs = {"12", "twelve", "-3"};
        for (String input : inputs) {
            try {
                int value = Integer.parseInt(input);
                System.out.println(input + " parsed as: " + value);
            } catch (NumberFormatException e) {
                System.out.println(input + " is not a valid number");
            }
        }
    }
}
```

```
javac ParseDemo.java
java ParseDemo
```

Output:

```
12 parsed as: 12
twelve is not a valid number
-3 parsed as: -3
```

This proves the second half: `catch` intercepts the exception exactly
where it's thrown, lets you handle it (here, print a message) and lets
the loop's next iteration continue normally — the program never
crashes, even on genuinely invalid input. Note `"-3"` parses
successfully as a *number* — negative-number rejection is a separate,
deliberate business rule you'll add next, not something `parseInt`
itself objects to.

### One More Thing: This Exception Didn't Ask Your Permission

`NumberFormatException` never required you to write `try`/`catch` at
all — the very first `ParseDemo` above, with no `try` anywhere,
compiled and ran fine (it just crashed when actually executed). Not
every exception in Java behaves this way. See the difference directly:

```java
import java.io.FileReader;

public class CheckedDemo {
    public static void main(String[] args) {
        FileReader reader = new FileReader("missing.txt");
        System.out.println("Opened file");
    }
}
```

Try to compile this — no need to run it:

```
javac CheckedDemo.java
```

Real output — this genuinely fails to *compile*, not just run:

```text
CheckedDemo.java:5: error: unreported exception FileNotFoundException; must be caught or declared to be thrown
        FileReader reader = new FileReader("missing.txt");
                            ^
1 error
```

Now add a `try`/`catch`, the same mechanism you just used above:

```java
import java.io.FileReader;
import java.io.IOException;

public class CheckedDemo {
    public static void main(String[] args) {
        try {
            FileReader reader = new FileReader("missing.txt");
            System.out.println("Opened file");
        } catch (IOException e) {
            System.out.println("Caught checked exception: " + e.getMessage());
        }
    }
}
```

Real output — verified this session:

```text
Caught checked exception: missing.txt (No such file or directory)
```

What this proves: Java has two real categories of exception.
`NumberFormatException` is **unchecked** — the compiler never forces
you to handle it; skipping `try`/`catch` compiles fine and only fails
at *runtime*, exactly what you saw at the top of this unit.
`FileNotFoundException` (a subtype of `IOException`) is **checked** —
the compiler refuses to compile any code that might throw it unless
you either catch it (as here) or explicitly declare `throws IOException`
on the enclosing method, pushing the responsibility to *its* caller
instead. Both categories are still real exceptions, still unwind the
stack the same way if uncaught at runtime — the difference is entirely
about what the compiler is willing to let you get away with *before*
you ever run the program.

### CS Lens

This is a genuine Java-specific design choice, not a universal
language feature — Kotlin and C# (if you've touched either elsewhere in
this curriculum) have no checked/unchecked distinction at all; every
exception behaves the way `NumberFormatException` does here. Java's bet
was that certain failures (I/O, mainly — reading a file, opening a
network connection) are common and consequential enough that the
compiler should force every caller, all the way up the call chain, to
consciously decide how to handle them, rather than trusting each
developer to remember on their own.

### Discard the Throwaway Example

Delete `ParseDemo.java` — the real project validates real form input
next, using this exact `try`/`catch` mechanism for real.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `AddItemActivity.java`.
- **Change type:** Modify (expand the click listener from the previous
  unit).

### The New Code

```java
if (name.isEmpty()) {
    nameInput.setError("Name is required");
    return;
}

int quantity;
try {
    quantity = Integer.parseInt(quantityText);
} catch (NumberFormatException e) {
    quantityInput.setError("Enter a whole number");
    return;
}

if (quantity < 0) {
    quantityInput.setError("Quantity cannot be negative");
    return;
}

if (location.isEmpty()) {
    locationInput.setError("Location is required");
    return;
}

Item newItem = new Item(name, quantity, location);
android.widget.Toast.makeText(this, "Added " + newItem.getName(), android.widget.Toast.LENGTH_SHORT).show();
finish();
```

### The Updated Project

```java
saveButton.setOnClickListener(v -> {
    String name = nameInput.getText().toString().trim();
    String quantityText = quantityInput.getText().toString().trim();
    String location = locationInput.getText().toString().trim();

    if (name.isEmpty()) {                                                          // ← new
        nameInput.setError("Name is required");                                     // ← new
        return;                                                                      // ← new
    }                                                                                // ← new

    int quantity;                                                                    // ← new
    try {                                                                            // ← new
        quantity = Integer.parseInt(quantityText);                                   // ← new
    } catch (NumberFormatException e) {                                              // ← new
        quantityInput.setError("Enter a whole number");                             // ← new
        return;                                                                      // ← new
    }                                                                                // ← new

    if (quantity < 0) {                                                              // ← new
        quantityInput.setError("Quantity cannot be negative");                      // ← new
        return;                                                                      // ← new
    }                                                                                // ← new

    if (location.isEmpty()) {                                                        // ← new
        locationInput.setError("Location is required");                             // ← new
        return;                                                                      // ← new
    }                                                                                // ← new

    Item newItem = new Item(name, quantity, location);                              // ← new
    android.widget.Toast.makeText(this, "Added " + newItem.getName(),               // ← new
            android.widget.Toast.LENGTH_SHORT).show();                              // ← new
    finish();                                                                        // ← new
});
```

The click listener now runs a strict gauntlet before ever constructing
an `Item`: each check either passes silently or stops the whole
operation immediately, so `new Item(...)` at the bottom is only ever
reached with data already confirmed valid.

### Mechanical Walkthrough

- `name.isEmpty()` — **first appearance.** `String.isEmpty()` — checks
  for zero-length content; combined with the earlier `.trim()`, this
  also rejects whitespace-only input.
- `nameInput.setError("Name is required")` — **first appearance.**
  Displays an inline error icon and message directly on the `EditText`
  itself, dismissed automatically once the user edits that field again
  — Android's built-in mechanism for per-field validation feedback,
  requiring no custom UI of your own.
- `return;` used bare, with no value, inside a lambda — **first
  appearance of this specific usage**, though `return` itself isn't
  new. Here it exits the lambda body early — the **fail-fast** pattern
  this unit is named for: stop at the first invalid thing found, rather
  than checking everything and reporting only the last problem, or
  worse, continuing on with bad data.
- `int quantity;` declared with no initializer — **first appearance of
  this specific shape.** Legal in Java as long as every path guarantees
  it's assigned before use — here, the `try` block assigns it on
  success, and the `catch` block's `return` prevents any path that
  reaches later code without it being set.
- `try { ... } catch (NumberFormatException e) { ... }` — **first
  appearance in the real project**, direct reuse of the pattern just
  labbed in `ParseDemo`. `Integer.parseInt(quantityText)` — reappearing
  (from the lab), first real use on user-typed input.
- `quantity < 0` — reappearing (`<` comparison, already basic),
  encoding a business rule `inputType="number"` never could: `parseInt`
  happily accepts `"-3"` as a valid integer, so rejecting negative
  stock has to be a separate, explicit check.
- `new Item(name, quantity, location)` — reappearing (constructor,
  Lesson 7), now only reachable with validated data.
- `android.widget.Toast.makeText(this, ..., Toast.LENGTH_SHORT).show()`
  — **first appearance.** A `Toast` is a small, auto-dismissing
  message overlay — `makeText` builds it (context, message, a duration
  constant), and nothing appears until `.show()` is called separately.
- `finish()` — **first appearance.** Explicitly tells the OS this
  Activity is done and should be destroyed and popped off the back
  stack (Lesson 5's stack, this time popped by your own code instead of
  the user pressing Back) — returning control to whatever Activity
  started this one.

### CS Lens

**This is a hard concept — fail-fast validation via exceptions — and it
recurs constantly:** stopping immediately at the first detected
invalid state rather than propagating bad data further into a system.
Also recognized in: a compiler halting at the first syntax error rather
than guessing and continuing, database `CHECK` constraints rejecting an
`INSERT` outright, HTTP APIs returning `400 Bad Request` before touching
any business logic, and defensive programming's general principle of
validating at every trust boundary — user input being the least
trusted boundary of all, discussed explicitly in the SE Lens below.

### SE Lens

**Why reject step-by-step with early returns instead of collecting
every problem and showing them all at once** (a real, legitimate
alternative many production forms use)? The early-return version is
simpler to write and reason about — each check is independent, and you
just labbed the exact mechanism (`try`/`catch`) that makes the
`quantity` check possible at all. Its real cost: a user with three
mistakes fixes them one at a time, reading a new error only after
re-tapping Save each time, which is worse UX than seeing all three
problems immediately. Production apps often invest in a "collect all
errors" version specifically because that UX cost matters at scale;
this project takes the simpler version deliberately, as the honestly-
correct starting point rather than a placeholder to feel bad about —
the exercises below let you try the alternative yourself.

---

## Concept Unit: Wiring the Add Button Into the List Screen

### The Problem

Nothing yet gets the user *to* `AddItemActivity` from the inventory
list.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `activity_inventory.xml`, `InventoryActivity.java`.
- **Change type:** Add.

### The New Code

Add to `activity_inventory.xml`, and change the `RecyclerView`'s bottom
constraint to make room:

```xml
<Button
    android:id="@+id/addItemButton"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_marginBottom="16dp"
    android:text="+ Add Item"
    app:layout_constraintBottom_toBottomOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintEnd_toEndOf="parent" />
```

### The Updated Project

```xml
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/inventoryRecyclerView"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toTopOf="@id/addItemButton"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <Button
        android:id="@+id/addItemButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginBottom="16dp"
        android:text="+ Add Item"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

The screen now reserves the bottom strip for the button
(`RecyclerView`'s height changed from Lesson 6's `match_parent` to
`0dp` constrained *between* the top of the screen and the button's top
edge — the same stretch-to-fill idea from this lesson's first unit,
now applied to the list instead of a text field) instead of the list
covering the whole screen and hiding a button beneath it.

### Mechanical Walkthrough

- `android:layout_height="0dp"` on the `RecyclerView` — **reappearing**
  (the stretch-to-fill idea from this lesson's `EditText` fields),
  first use on height instead of width.
- `app:layout_constraintBottom_toTopOf="@id/addItemButton"` — **first
  appearance of `toTopOf`** targeting a sibling (you've seen
  `toBottomOf` a sibling before, in Lesson 5/8) — same relative-anchor
  idea, opposite edge pairing.
- `<Button ...>` — reappearing, Lesson 3.

### The New Code — Launching It

```java
Button addButton = findViewById(R.id.addItemButton);
addButton.setOnClickListener(v ->
        startActivity(new Intent(InventoryActivity.this, AddItemActivity.class)));
```

### The Updated Project

```java
RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
recyclerView.setLayoutManager(new LinearLayoutManager(this));
recyclerView.setAdapter(new InventoryAdapter(items, item -> {
    Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
    intent.putExtra("EXTRA_ITEM", item);
    startActivity(intent);
}));

Button addButton = findViewById(R.id.addItemButton);                                // ← new
addButton.setOnClickListener(v ->                                                    // ← new
        startActivity(new Intent(InventoryActivity.this, AddItemActivity.class)));  // ← new
```

### Mechanical Walkthrough

- `findViewById`, `setOnClickListener`, `new Intent(...)`,
  `startActivity(...)` — every piece here is **reappearing**, from
  Lesson 4 and Lesson 8's identical pattern for `ItemDetailActivity` —
  no new concepts, deliberately: this is the same navigation shape
  applied a third time.

### Run It

Run the app. Tap "+ Add Item," fill out the form, tap Save with a
blank name first (see the inline error, nothing crashes), then with
`"abc"` as quantity (see the numeric error), then with valid data —
confirm the Toast appears and the screen closes back to the list. The
new item does **not** yet appear in the list itself — that's
deliberate; Lesson 10 is precisely about getting it there.

---

## Connect the Pieces

Full trace: the user taps "+ Add Item" (reusing Lesson 4/8's Intent
navigation exactly) → `AddItemActivity` shows three `EditText` fields,
each hinting its expected content via `inputType` without enforcing
anything → the user taps Save → three raw `String`s are read via
`.getText().toString().trim()` → each runs through a fail-fast check,
the quantity's `try`/`catch` specifically guarding against non-numeric
text that `inputType="number"` alone never actually prevented → only
once every check passes does `new Item(...)` (Lesson 7) get called at
all → a `Toast` confirms success and `finish()` returns to the list,
Lesson 5's back-stack popping mechanism now triggered by code instead
of a user's Back press.

## What Breaks Without This

Temporarily delete just the `try`/`catch` around `Integer.parseInt`,
leaving the bare call. Type `"abc"` into the quantity field and tap
Save: the app crashes with an unhandled `NumberFormatException`,
visible in Logcat as a real stack trace ending at your `parseInt` line
— the exact crash the `ParseDemo` lab showed you on purpose, now
happening for real because the boundary check was removed. Restore the
`try`/`catch` afterward.

## Exercises

1. Rewrite the validation to collect every problem into a
   `StringBuilder` and show them all in one combined `Toast`, instead
   of stopping at the first failure — the alternative the SE Lens
   named. Compare how it feels to test against the early-return
   version.
2. Add a fourth check: reject a name longer than 40 characters
   (`name.length() > 40`), with its own `setError` message. Confirm it
   fires independently of the other three checks.

## Definition of Done

- [ ] "+ Add Item" navigates to a real form with three fields.
- [ ] Blank name, non-numeric quantity, and negative quantity each
      produce a visible inline error instead of crashing or silently
      succeeding.
- [ ] You ran the `ParseDemo` lab yourself and saw both the uncaught
      crash and the caught, handled version.
- [ ] You ran the `CheckedDemo` lab and saw the checked exception refuse
      to *compile* until handled — a real, different failure mode than
      `NumberFormatException`'s runtime-only crash.
- [ ] Valid input shows a confirmation `Toast` and returns to the list.
- [ ] You broke the `try`/`catch` on purpose, saw the real crash, and
      restored it.
- [ ] Commit: message explaining why (e.g. "Add an Add Item form with
      fail-fast validation, since inputType alone is a keyboard hint,
      not a guarantee, about what a field actually contains").

Lesson 10 is next: the new item vanishes into nothing right now because
`finish()` doesn't hand anything back — the Activity Result API, and
actually getting that new `Item` into the list on screen.
